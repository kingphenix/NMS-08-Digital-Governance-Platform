import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/server-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getServiceClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
}

export type DuesPayer = {
  nms_number: string;
  full_name: string;
  company: string;
  total_paid_ngn: number;
  payment_count: number;
  last_paid_at: string | null;
  payment_years: number[];
};

/**
 * GET /api/admin/dues/payers
 * Returns every distinct member who has at least one entry in dues_payments,
 * with their total amount paid, number of payments, and last payment date.
 * Deduplicates by nms_number, merging multiple payment rows into one summary.
 */
export async function GET(request: Request) {
  if (!requireAdmin(request)) {
    return NextResponse.json(
      { ok: false, message: 'Administrator authentication required.' },
      { status: 401 }
    );
  }

  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ ok: true, payers: [], total: 0 });
  }

  // Fetch all dues_payments rows
  const { data: rows, error } = await supabase
    .from('dues_payments')
    .select('nms_number, full_name, company, amount_ngn, payment_year, paid_at')
    .order('paid_at', { ascending: false });

  if (error) {
    console.error('Error fetching dues payers:', error.message);
    return NextResponse.json({ ok: true, payers: [], total: 0 });
  }

  // Aggregate per member
  const map = new Map<string, DuesPayer>();

  for (const row of (rows || []) as any[]) {
    const nms = (row.nms_number || '').trim().toUpperCase();
    if (!nms) continue;

    if (!map.has(nms)) {
      map.set(nms, {
        nms_number: nms,
        full_name: row.full_name || '',
        company: row.company || '',
        total_paid_ngn: 0,
        payment_count: 0,
        last_paid_at: null,
        payment_years: [],
      });
    }

    const entry = map.get(nms)!;
    entry.total_paid_ngn += Number(row.amount_ngn) || 0;
    entry.payment_count += 1;

    // Keep the most recent paid_at
    if (row.paid_at && (!entry.last_paid_at || row.paid_at > entry.last_paid_at)) {
      entry.last_paid_at = row.paid_at;
    }

    // Track distinct payment years
    if (row.payment_year && !entry.payment_years.includes(Number(row.payment_year))) {
      entry.payment_years.push(Number(row.payment_year));
    }

    // Fill in name/company from later rows if missing on earlier ones
    if (!entry.full_name && row.full_name) entry.full_name = row.full_name;
    if (!entry.company && row.company) entry.company = row.company;
  }

  // If a member's name is still blank, try to look it up from member_profiles
  const blankNames = [...map.values()].filter((p) => !p.full_name).map((p) => p.nms_number);
  if (blankNames.length > 0) {
    const { data: profiles } = await supabase
      .from('member_profiles')
      .select('nms_number, full_name, company')
      .in('nms_number', blankNames);

    for (const prof of (profiles || []) as any[]) {
      const entry = map.get((prof.nms_number || '').trim().toUpperCase());
      if (entry) {
        if (!entry.full_name) entry.full_name = prof.full_name || '';
        if (!entry.company) entry.company = prof.company || '';
      }
    }
  }

  // Sort: alphabetically by full_name
  const payers = [...map.values()].sort((a, b) =>
    (a.full_name || a.nms_number).localeCompare(b.full_name || b.nms_number)
  );

  return NextResponse.json({ ok: true, payers, total: payers.length });
}

