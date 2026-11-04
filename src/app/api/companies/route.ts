import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { COMPANIES_LIST } from '@/lib/mock-data';
import { normalizeCompanyId } from '@/lib/company-utils';
import { normalizeChapterId } from '@/lib/chapters';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const noCacheHeaders = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    Pragma: 'no-cache',
  };

  const companyCounts: Record<string, number> = {
    alpha: 0,
    bravo: 0,
    charlie: 0,
    delta: 0,
    echo: 0,
    foxtrot: 0,
    golf: 0,
  };

  const chapterCounts: Record<string, number> = {
    abuja: 0,
    lagos: 0,
    rivers: 0,
    kaduna: 0,
    plateau: 0,
    enugu: 0,
    ibadan: 0,
    kano: 0,
    diaspora: 0,
    national: 0,
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
      chapterCounts,
      totalRegistered: 0,
      companies,
      members: [],
      companyBreakdown: COMPANIES_LIST.map((c) => ({
        company: c.name.replace(/\s*Company\s*/i, ''),
        count: 0,
        compliance: 0,
      })),
    }, { headers: noCacheHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const countedNms = new Set<string>();
    const registeredMembers: Array<{ nms_number: string; company: string }> = [];

    // 1) Read all registered member profiles
    let profiles: any[] = [];
    try {
      const { data, error } = await supabase
        .from('member_profiles')
        .select('company, nms_number, state_of_residence, address');
      if (!error && data) {
        profiles = data;
      } else if (error) {
        console.warn('[CompaniesAPI] member_profiles query error:', error);
      }
    } catch (e) {
      console.warn('Profiles query failed:', e);
    }

    if (Array.isArray(profiles)) {
      for (const p of profiles) {
        try {
          const nms = (p.nms_number || '').trim().toUpperCase();
          if (nms) countedNms.add(nms);

          const id = normalizeCompanyId(p.company);
          if (id && companyCounts[id] !== undefined) {
            companyCounts[id]++;
          }
          const cid = normalizeChapterId(null, p.state_of_residence, p.address);
          if (cid && chapterCounts[cid] !== undefined) {
            chapterCounts[cid]++;
          }
          registeredMembers.push({
            nms_number: nms,
            company: p.company || '',
          });
        } catch (e) {
          console.warn('[CompaniesAPI] Error processing profile:', p, e);
        }
      }
    }

    // 2) Also read roster entries marked registered: true (for total count only — roster has no company column)
    let rosterRows: any[] = [];
    try {
      const { data, error } = await supabase
        .from('roster')
        .select('nms_number')
        .eq('registered', true);
      if (!error && data) rosterRows = data;
      else if (error) console.warn('[CompaniesAPI] roster query error:', error);
    } catch (e) {
      console.warn('Roster query failed:', e);
    }

    if (Array.isArray(rosterRows)) {
      for (const r of rosterRows) {
        const nms = (r.nms_number || '').trim().toUpperCase();
        if (nms && !countedNms.has(nms)) {
          countedNms.add(nms);
          // No company info on roster — count only for totalRegistered
        }
      }
    }

    const totalRegistered = countedNms.size;

    // 3) Read dues payments to compute real compliance per company
    let duesRows: any[] = [];
    try {
      const { data, error } = await supabase
        .from('dues_payments')
        .select('company, nms_number');
      if (!error && data) duesRows = data;
      else if (error) console.warn('[CompaniesAPI] dues query error:', error);
    } catch (e) {
      console.warn('Dues query failed:', e);
    }

    if (Array.isArray(duesRows)) {
      for (const d of duesRows) {
        const id = normalizeCompanyId(d.company);
        if (id && d.nms_number && companyPayers[id]) {
          companyPayers[id].add(d.nms_number.trim().toUpperCase());
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
      chapterCounts,
      totalRegistered,
      companies,
      members: registeredMembers,
      companyBreakdown,
    }, { headers: noCacheHeaders });
  } catch (err: any) {
    console.error('Error fetching company stats from Supabase:', err);
    console.error('Error stack:', err?.stack);
    console.error('Error details:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
    return NextResponse.json({
      ok: true,
      counts: companyCounts,
      chapterCounts,
      totalRegistered: 0,
      companies: COMPANIES_LIST.map((c) => ({ ...c, totalMembers: 0, duesComplianceRate: 0 })),
      members: [],
      companyBreakdown: [],
    }, { status: 200, headers: noCacheHeaders }); // Return 200 with fallback data instead of 500
  }
}
