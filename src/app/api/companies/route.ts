import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { COMPANIES_LIST } from '@/lib/mock-data';

export const dynamic = 'force-dynamic';

function normalizeId(raw?: string | null): string | null {
  if (!raw) return null;
  const c = raw.trim().toLowerCase();
  if (c.includes('alpha') || c === 'al') return 'alpha';
  if (c.includes('bravo') || c === 'br') return 'bravo';
  if (c.includes('charlie') || c === 'ch') return 'charlie';
  if (c.includes('delta') || c === 'de') return 'delta';
  if (c.includes('echo') || c === 'ec') return 'echo';
  if (c.includes('foxtrot') || c === 'fx') return 'foxtrot';
  if (c.includes('golf') || c === 'go') return 'golf';
  return null;
}

export async function GET() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const companyCounts: Record<string, number> = {
    alpha: 0,
    bravo: 0,
    charlie: 0,
    delta: 0,
    echo: 0,
    foxtrot: 0,
    golf: 0,
  };

  const companyPayers: Record<string, Set<string>> = {
    alpha: new Set(),
    bravo: new Set(),
    charlie: new Set(),
    delta: new Set(),
    echo: new Set(),
    foxtrot: new Set(),
    golf: new Set(),
  };

  if (!supabaseUrl || !serviceKey) {
    const companies = COMPANIES_LIST.map((c) => ({
      ...c,
      totalMembers: 0,
      duesComplianceRate: 0,
    }));
    return NextResponse.json({
      ok: true,
      counts: companyCounts,
      totalRegistered: 0,
      companies,
      companyBreakdown: COMPANIES_LIST.map((c) => ({
        company: c.name.replace(/\s*Company\s*/i, ''),
        count: 0,
        compliance: 0,
      })),
    });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    // 1) Read all registered member profiles
    const { data: profiles, error: profilesErr } = await supabase
      .from('member_profiles')
      .select('company, nms_number');

    let totalRegistered = 0;
    if (!profilesErr && Array.isArray(profiles)) {
      totalRegistered = profiles.length;
      for (const p of profiles) {
        const id = normalizeId(p.company);
        if (id && companyCounts[id] !== undefined) {
          companyCounts[id]++;
        }
      }
    }

    // 2) Read dues payments to compute real compliance per company
    const { data: duesRows } = await supabase
      .from('dues_payments')
      .select('company, nms_number');

    if (Array.isArray(duesRows)) {
      for (const d of duesRows) {
        const id = normalizeId(d.company);
        if (id && d.nms_number && companyPayers[id]) {
          companyPayers[id].add(d.nms_number);
        }
      }
    }

    const companies = COMPANIES_LIST.map((c) => {
      const count = companyCounts[c.id] || 0;
      const payers = companyPayers[c.id]?.size || 0;
      const compliance = count > 0 ? Math.min(100, Math.round((payers / count) * 100)) : 0;
      return {
        ...c,
        totalMembers: count,
        duesComplianceRate: compliance,
      };
    });

    const companyBreakdown = companies.map((c) => ({
      company: c.name.replace(/\s*Company\s*/i, ''),
      count: c.totalMembers,
      compliance: c.duesComplianceRate,
    }));

    return NextResponse.json({
      ok: true,
      counts: companyCounts,
      totalRegistered,
      companies,
      companyBreakdown,
    });
  } catch (err: any) {
    console.error('Error fetching company stats from Supabase:', err);
    return NextResponse.json({
      ok: false,
      message: err?.message || 'Failed to fetch company counts',
      counts: companyCounts,
      totalRegistered: 0,
      companies: COMPANIES_LIST.map((c) => ({ ...c, totalMembers: 0, duesComplianceRate: 0 })),
      companyBreakdown: [],
    }, { status: 500 });
  }
}
