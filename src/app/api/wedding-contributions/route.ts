import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  WEDDING_COMPANIES,
  WEDDING_GOAL_NGN,
  WEDDING_SEED_CONTRIBUTIONS,
  WEDDING_TOTAL_TARGET_NGN,
} from '@/lib/wedding-contributions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_CACHE = { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' };

function buildPayload(amounts: Record<string, number>) {
  const contributions = WEDDING_COMPANIES.map((company) => ({
    ...company,
    amount: amounts[company.id] ?? 0,
  }));
  return {
    ok: true,
    goal: WEDDING_GOAL_NGN,
    totalTarget: WEDDING_TOTAL_TARGET_NGN,
    totalContributed: contributions.reduce((sum, c) => sum + c.amount, 0),
    contributions,
  };
}

/**
 * GET /api/wedding-contributions
 * Public feed of company wedding-fund contributions, consumed by the Companies page.
 */
export async function GET() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(buildPayload(WEDDING_SEED_CONTRIBUTIONS), { headers: NO_CACHE });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { data, error } = await supabase
      .from('wedding_contributions')
      .select('company, amount_ngn');

    if (error || !Array.isArray(data)) {
      return NextResponse.json(buildPayload(WEDDING_SEED_CONTRIBUTIONS), { headers: NO_CACHE });
    }

    // Start from the seed figures so a company missing a row still shows its total.
    const amounts: Record<string, number> = { ...WEDDING_SEED_CONTRIBUTIONS };
    for (const row of data as any[]) {
      const id = String(row.company || '').trim().toLowerCase();
      if (id) amounts[id] = Number(row.amount_ngn) || 0;
    }

    return NextResponse.json(buildPayload(amounts), { headers: NO_CACHE });
  } catch {
    return NextResponse.json(buildPayload(WEDDING_SEED_CONTRIBUTIONS), { headers: NO_CACHE });
  }
}
