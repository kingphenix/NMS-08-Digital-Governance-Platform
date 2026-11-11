import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Public, minimal birthday feed for the site ticker.
 * Only today's celebrants are returned (name + company) — no PII beyond what the
 * ticker already displays publicly, and no authentication data.
 */

function matchMonthDay(dob?: string | null, month?: string, day?: string): boolean {
  if (!dob || !month || !day) return false;
  const clean = dob.trim();
  if (clean.includes('-')) {
    const parts = clean.split('-');
    if (parts.length === 3) {
      const [, m, d] = parts;
      return m.padStart(2, '0') === month && d.slice(0, 2).padStart(2, '0') === day;
    }
    if (parts.length === 2) {
      const [m, d] = parts;
      return m.padStart(2, '0') === month && d.padStart(2, '0') === day;
    }
  } else if (clean.includes('/')) {
    const parts = clean.split('/');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return parts[1].padStart(2, '0') === month && parts[2].slice(0, 2).padStart(2, '0') === day;
      }
      return parts[1].padStart(2, '0') === month && parts[0].padStart(2, '0') === day;
    }
  }
  return false;
}

export async function GET() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ ok: true, birthdays: [] });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { data, error } = await supabase
      .from('member_profiles')
      .select('full_name, company, dob');

    if (error || !data) {
      return NextResponse.json({ ok: true, birthdays: [] });
    }

    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const birthdays = (data as any[])
      .filter((row) => matchMonthDay(row.dob, month, day))
      .map((row) => ({
        name: row.full_name || row.name || '',
        company: row.company || 'NMS 08 Ex-Boy',
      }))
      .filter((b) => !!b.name);

    return NextResponse.json(
      { ok: true, birthdays },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } }
    );
  } catch {
    return NextResponse.json({ ok: true, birthdays: [] });
  }
}
