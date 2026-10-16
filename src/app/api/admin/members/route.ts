import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({
      ok: true,
      members: [],
      stats: {
        totalRegistered: 0,
        totalRoster: 485,
      },
      metrics: {
        totalDuesCollected: 0,
        complianceRate: 0,
        targetDues: 0,
        welfareFundBalance: 0,
        activeClaimsUnderReview: 0,
        totalVotesCast: 0,
        totalEligibleVoters: 0,
        monthlyDuesTrend: [],
        companyBreakdown: [],
      },
    });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    // 1) Real member profiles from Supabase (read-only)
    const { data: profiles, error: profilesError } = await supabase
      .from('member_profiles')
      .select(`
        *,
        roster:roster_id (
          registered,
          registered_at
        )
      `)
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Error reading member_profiles from Supabase:', profilesError);
    }

    const memberList = (!profilesError && Array.isArray(profiles)) ? profiles : [];

    // 2) Real roster counts from Supabase
    const { count: totalRegistered } = await supabase
      .from('roster')
      .select('id', { count: 'exact', head: true })
      .eq('registered', true);

    const { count: totalRoster } = await supabase
      .from('roster')
      .select('id', { count: 'exact', head: true });

    // 3) Real dues revenue from Supabase
    const { data: duesRows, error: duesError } = await supabase
      .from('dues_payments')
      .select('amount_ngn, company, payment_year, payment_month, paid_at, nms_number');

    let totalDuesCollected = 0;
    const monthlyTrendMap = new Map<string, number>(); // key: "YYYY-MM" -> amount (NGN)
    const companyComplianceMap = new Map<string, { total: number; payers: Set<string> }>();

    if (!duesError && duesRows) {
      for (const row of duesRows as any[]) {
        const amount = Number(row.amount_ngn) || 0;
        totalDuesCollected += amount;

        // Group by paid_at month
        if (row.paid_at) {
          const d = new Date(row.paid_at);
          const y = d.getUTCFullYear();
          const m = d.getUTCMonth() + 1;
          const key = `${y}-${String(m).padStart(2, '0')}`;
          monthlyTrendMap.set(key, (monthlyTrendMap.get(key) || 0) + amount);
        } else if (row.payment_year && row.payment_month) {
          const key = `${row.payment_year}-${String(row.payment_month).padStart(2, '0')}`;
          monthlyTrendMap.set(key, (monthlyTrendMap.get(key) || 0) + amount);
        }

        // Company compliance aggregation
        const company = (row.company || 'Unassigned').toString();
        if (!companyComplianceMap.has(company)) {
          companyComplianceMap.set(company, { total: 0, payers: new Set() });
        }
        const entry = companyComplianceMap.get(company)!;
        entry.total += amount;
        if (row.nms_number) entry.payers.add(row.nms_number);
      }
    }

    // Convert monthly trend into the chart shape (most recent 9 months)
    const monthlyDuesTrend: Array<{ month: string; amount: number }> = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const sortedKeys = Array.from(monthlyTrendMap.keys()).sort();
    const recentKeys = sortedKeys.slice(-9);
    for (const key of recentKeys) {
      const [y, m] = key.split('-').map(Number);
      monthlyDuesTrend.push({
        month: `${monthNames[m - 1]} ${String(y).slice(-2)}`,
        amount: Number(((monthlyTrendMap.get(key) || 0) / 1_000_000).toFixed(2)),
      });
    }

    // Company compliance aggregation
    const companyBreakdown: Array<{ company: string; count: number; compliance: number }> = [];
    const payerCounts = Array.from(companyComplianceMap.entries()).map(([company, v]) => ({
      company,
      count: v.payers.size,
    }));
    const maxPayers = payerCounts.reduce((m, x) => (x.count > m ? x.count : m), 0);
    for (const { company, count } of payerCounts) {
      companyBreakdown.push({
        company,
        count,
        compliance: maxPayers > 0 ? Math.round((count / maxPayers) * 100) : 0,
      });
    }
    companyBreakdown.sort((a, b) => b.compliance - a.compliance);

    // 4) Real welfare fund ledger from Supabase
    const { data: ledgerRows, error: ledgerError } = await supabase
      .from('welfare_fund_ledger')
      .select('entry_type, amount_ngn');

    let welfareFundBalance = 0;
    if (!ledgerError && ledgerRows) {
      for (const row of ledgerRows as any[]) {
        const amount = Number(row.amount_ngn) || 0;
        if (row.entry_type === 'contribution') {
          welfareFundBalance += amount;
        } else if (row.entry_type === 'claim_payout') {
          welfareFundBalance -= amount;
        } else if (row.entry_type === 'adjustment') {
          welfareFundBalance += amount;
        }
      }
    }

    // Active welfare claims under review
    const { count: activeClaimsUnderReview } = await supabase
      .from('welfare_claims')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'Under Review');

    // 5) Real elections from Supabase
    const { data: activeElection } = await supabase
      .from('elections')
      .select('*')
      .eq('status', 'Active')
      .order('election_year', { ascending: false })
      .limit(1)
      .maybeSingle();

    let electionRow = activeElection;
    if (!electionRow) {
      const { data: latestElection } = await supabase
        .from('elections')
        .select('*')
        .order('election_year', { ascending: false })
        .limit(1)
        .maybeSingle();
      electionRow = latestElection || null;
    }

    let totalVotesCast = 0;
    let totalEligibleVoters = 0;
    if (electionRow) {
      totalEligibleVoters = Number(electionRow.eligible_voters) || 0;
      const { data: candRows } = await supabase
        .from('election_candidates')
        .select('votes_count')
        .eq('election_id', electionRow.id);
      if (candRows) {
        totalVotesCast = candRows.reduce(
          (sum: number, c: any) => sum + (Number(c.votes_count) || 0),
          0
        );
      } else {
        totalVotesCast = Number(electionRow.votes_cast) || 0;
      }
    }

    // 6) Real compliance rate
    const uniquePayerSet = new Set<string>();
    if (duesRows) {
      for (const row of duesRows as any[]) {
        if (row.nms_number) uniquePayerSet.add(row.nms_number);
      }
    }
    const finalTotalRoster = totalRoster || 485;
    const complianceRate =
      finalTotalRoster > 0
        ? Math.min(100, Number(((uniquePayerSet.size / finalTotalRoster) * 100).toFixed(1)))
        : 0;

    return NextResponse.json({
      ok: true,
      members: memberList,
      stats: {
        totalRegistered: totalRegistered ?? memberList.length,
        totalRoster: finalTotalRoster,
      },
      metrics: {
        totalDuesCollected,
        complianceRate,
        targetDues: totalDuesCollected > 0 ? Math.round(totalDuesCollected / (complianceRate / 100 || 1)) : 0,
        welfareFundBalance,
        activeClaimsUnderReview: activeClaimsUnderReview || 0,
        totalVotesCast,
        totalEligibleVoters,
        monthlyDuesTrend,
        companyBreakdown,
      },
    });
  } catch (err) {
    console.error('Supabase members fetch error:', err);
    return NextResponse.json({
      ok: true,
      members: [],
      stats: { totalRegistered: 0, totalRoster: 485 },
      metrics: {
        totalDuesCollected: 0,
        complianceRate: 0,
        targetDues: 0,
        welfareFundBalance: 0,
        activeClaimsUnderReview: 0,
        totalVotesCast: 0,
        totalEligibleVoters: 0,
        monthlyDuesTrend: [],
        companyBreakdown: [],
      },
    });
  }
}
