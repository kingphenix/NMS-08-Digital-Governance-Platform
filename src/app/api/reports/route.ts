import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const runtime = 'nodejs';

const isUuid = (val?: string) =>
  typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

const DATA_DIR = path.join(process.cwd(), '.data');
const REPORTS_FILE = path.join(DATA_DIR, 'reports.json');

export const AUTHENTIC_REPORT = {
  id: '08080808-0000-4000-8000-000000002026',
  report_month: 'November 2026',
  period_start: '2026-11-01',
  period_end: '2026-11-30',
  status: 'published',
  prepared_by: 'Exboy Isaac Danmusa',
  reviewed_by: 'Exboy Ikenna Ukonna',
  approved_by: 'Exboy Filani Victor Oluwasegun',
  opening_balance: 0,
  total_income: 24000,
  total_expenditure: 0,
  closing_balance: 24000,
  income_items: [
    { source: 'Monthly Membership Dues', amount: 24000 },
    { source: 'Donations and Voluntary Contributions', amount: 0 },
    { source: 'Wedding Contributions', amount: 0 },
    { source: 'Special Levies', amount: 0 },
    { source: 'Sponsorships and Grants', amount: 0 },
    { source: 'Other Income', amount: 0 },
  ],
  expenditure_items: [
    { category: 'Welfare Support', amount: 0 },
    { category: 'Wedding Support', amount: 0 },
    { category: 'Bereavement Support', amount: 0 },
    { category: 'Administrative Expenses', amount: 0 },
    { category: 'Digital Platform / Technology', amount: 0 },
    { category: 'Events and Social Activities', amount: 0 },
    { category: 'Other Approved Expenses', amount: 0 },
  ],
  fund_positions: [
    { fund: 'National dues', balance: 120000, name: 'National dues', amount: 120000 },
    { fund: 'Wedding contribution', balance: 560000, name: 'Wedding contribution', amount: 560000 },
    { fund: 'Digital Platform', balance: 100000, name: 'Digital Platform', amount: 100000 },
  ],
  obligation_items: [
    { name: 'National dues', amount: 120000 },
    { name: 'Wedding contribution', amount: 560000 },
    { name: 'Digital Platform', amount: 100000 },
  ],
  outstanding_obligations: 780000,
  unpaid_commitments: 0,
  loans_to_members: 0,
  loan_repayments: 0,
  number_of_loans: 0,
  company_scorecard: [
    { company: 'Alpha', expected: 0, received: 0, outstanding: 0 },
    { company: 'Bravo', expected: 0, received: 2000, outstanding: 0 },
    { company: 'Charlie', expected: 0, received: 22000, outstanding: 0 },
    { company: 'Delta', expected: 0, received: 0, outstanding: 0 },
    { company: 'Echo', expected: 0, received: 0, outstanding: 0 },
    { company: 'Foxtrot', expected: 0, received: 0, outstanding: 0 },
    { company: 'Golf', expected: 0, received: 0, outstanding: 0 },
  ],
  highlights_text: 'Inaugural financial transparency statement recording live collections since digital portal launch.',
  key_activities: [
    'Official launch of the NMS 08 Digital Governance Platform and automated Paystack dues gateway.',
    'Accreditation and profile verification for 168 Ex-Boys across all 7 military companies.',
    'First live member dues received and verified for November 2026.',
  ],
  welfare_interventions: 30000,
  projects_funded: 0,
  closing_balance_records: 24000,
  closing_bank_balance: 24000,
  closing_other_accounts: 0,
  unreconciled_difference: 0,
  reconciliation_status: 'Reconciled',
  reconciliation_explanation: 'All collections verified against automated Paystack gateway settlements.',
  management_notes: 'This monthly report reflects live verified transactions on the platform for November 2026. All categories currently reading ₦0.00 indicate items awaiting manual reconciliation or subsequent disbursement by the Executive Council.',
  published_at: '2026-11-20T12:00:00.000Z',
  created_at: '2026-11-20T12:00:00.000Z',
};

export function normalizeReport(r: any) {
  if (!r) return r;
  let parsedHighlights = r.highlights_text || '';
  let loans_to_members = r.loans_to_members || 0;
  let loan_repayments = r.loan_repayments || 0;
  let number_of_loans = r.number_of_loans || 0;

  if (typeof r.highlights_text === 'string' && r.highlights_text.startsWith('{')) {
    try {
      const obj = JSON.parse(r.highlights_text);
      parsedHighlights = obj.text ?? r.highlights_text;
      loans_to_members = obj.loans_to_members ?? loans_to_members;
      loan_repayments = obj.loan_repayments ?? loan_repayments;
      number_of_loans = obj.number_of_loans ?? number_of_loans;
    } catch {}
  }

  const isLegacyFund = (name: string) =>
    ['general fund', 'welfare fund', 'special project funds', 'restricted / earmarked funds'].includes(
      (name || '').toLowerCase().trim()
    );

  const rawObligations = r.obligation_items || r.fund_positions || [];
  const filteredObligations = Array.isArray(rawObligations)
    ? rawObligations
        .filter((o: any) => !isLegacyFund(o.name || o.fund || ''))
        .map((o: any) => ({
          name: o.name || o.fund || 'Obligation',
          amount: Number(o.amount ?? o.balance) || 0,
        }))
    : [];

  const obligation_items = filteredObligations.length > 0
    ? filteredObligations
    : [
        { name: 'National dues', amount: 120000 },
        { name: 'Wedding contribution', amount: 560000 },
        { name: 'Digital Platform', amount: 100000 },
      ];

  const totalObligations = obligation_items.reduce((s: number, o: any) => s + (o.amount || 0), 0);

  const opening = Number(r.opening_balance) || 0;
  const incomeTotal = (r.income_items || []).reduce((s: number, i: any) => s + (Number(i.amount) || 0), 0);
  const expenseTotal = (r.expenditure_items || []).reduce((s: number, i: any) => s + (Number(i.amount) || 0), 0);
  const autoClosing = opening + incomeTotal - expenseTotal;

  return {
    ...r,
    highlights_text: parsedHighlights,
    loans_to_members: Number(loans_to_members) || 0,
    loan_repayments: Number(loan_repayments) || 0,
    number_of_loans: Number(number_of_loans) || 0,
    welfare_interventions: Number(r.welfare_interventions) || 0,
    obligation_items,
    fund_positions: obligation_items.map((o: any) => ({
      fund: o.name,
      balance: o.amount,
      name: o.name,
      amount: o.amount,
    })),
    outstanding_obligations: r.outstanding_obligations || totalObligations,
    closing_balance: r.closing_balance ?? autoClosing,
    closing_balance_records: autoClosing,
  };
}

function getLocalReports(): any[] {
  try {
    if (!fs.existsSync(REPORTS_FILE)) return [AUTHENTIC_REPORT];
    const content = fs.readFileSync(REPORTS_FILE, 'utf8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [AUTHENTIC_REPORT];
  } catch {
    return [AUTHENTIC_REPORT];
  }
}

function saveLocalReports(reports: any[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save local reports fallback:', err);
  }
}

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

/** GET /api/reports — list all published reports (or all for admin) */
export async function GET(request: Request) {
  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const admin = searchParams.get('admin') === 'true';
  const id = searchParams.get('id');

  if (!supabase) {
    const local = getLocalReports().map(normalizeReport);
    if (id) {
      const found = local.find((r) => r.id === id);
      return found ? NextResponse.json({ ok: true, report: found }) : NextResponse.json({ ok: false, message: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, reports: admin ? local : local.filter((r) => r.status === 'published') });
  }

  try {
    if (id) {
      const { data, error } = await supabase
        .from('financial_reports')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        const local = getLocalReports().map(normalizeReport);
        const found = local.find((r) => r.id === id) || (id === AUTHENTIC_REPORT.id ? normalizeReport(AUTHENTIC_REPORT) : null);
        return found ? NextResponse.json({ ok: true, report: found }) : NextResponse.json({ ok: false, message: 'Report not found' }, { status: 404 });
      }
      return NextResponse.json({ ok: true, report: normalizeReport(data) });
    }

    let query = supabase
      .from('financial_reports')
      .select('*')
      .order('period_start', { ascending: false });

    if (!admin) {
      query = query.eq('status', 'published');
    }

    const { data, error } = await query;

    if (error) {
      const local = getLocalReports().map(normalizeReport);
      return NextResponse.json({ ok: true, reports: admin ? local : local.filter((r) => r.status === 'published') });
    }

    // Merge with any local reports
    const local = getLocalReports();
    const existingIds = new Set((data || []).map((r: any) => r.id));
    const merged = [...(data || [])];
    for (const lr of local) {
      if (!existingIds.has(lr.id) && (admin || lr.status === 'published')) {
        merged.push(lr);
      }
    }
    merged.sort((a, b) => (b.period_start || '').localeCompare(a.period_start || ''));
    if (merged.length === 0) {
      merged.push(AUTHENTIC_REPORT);
    }

    const normalized = merged.map(normalizeReport);
    return NextResponse.json({ ok: true, reports: normalized });
  } catch (err) {
    console.error('Reports API error:', err);
    return NextResponse.json({ ok: true, reports: getLocalReports().map(normalizeReport) });
  }
}

/** POST /api/reports — create or update a report (admin only) */
export async function POST(request: Request) {
  const supabase = getSupabase();

  try {
    const body = await request.json();
    const {
      id,
      report_month,
      period_start,
      period_end,
      status,
      prepared_by,
      reviewed_by,
      approved_by,
      opening_balance,
      total_income,
      total_expenditure,
      closing_balance,
      income_items,
      expenditure_items,
      fund_positions,
      outstanding_obligations,
      unpaid_commitments,
      company_scorecard,
      highlights_text,
      key_activities,
      welfare_interventions,
      projects_funded,
      closing_balance_records,
      closing_bank_balance,
      closing_other_accounts,
      unreconciled_difference,
      reconciliation_status,
      reconciliation_explanation,
      management_notes,
    } = body;

    if (!report_month || !period_start || !period_end) {
      return NextResponse.json(
        { ok: false, message: 'Report month, start and end dates are required.' },
        { status: 400 }
      );
    }

    const reportId = isUuid(id) ? id : crypto.randomUUID();

    const openingBal = parseFloat(opening_balance) || 0;
    const totalInc = parseFloat(total_income) || 0;
    const totalExp = parseFloat(total_expenditure) || 0;
    const autoClosing = openingBal + totalInc - totalExp;

    const rawObligations = body.obligation_items || fund_positions || [];
    const normalizedObligations = Array.isArray(rawObligations)
      ? rawObligations.map((o: any) => ({
          name: o.name || o.fund || 'Obligation',
          amount: parseFloat(o.amount ?? o.balance) || 0,
          fund: o.name || o.fund || 'Obligation',
          balance: parseFloat(o.amount ?? o.balance) || 0,
        }))
      : [];
    const totalObligations = normalizedObligations.reduce((s: number, o: any) => s + (o.amount || 0), 0);

    const bankBal = parseFloat(closing_bank_balance) || 0;
    const otherBal = parseFloat(closing_other_accounts) || 0;
    const autoUnreconciled = bankBal + otherBal - autoClosing;

    const highlightsPayload = JSON.stringify({
      text: typeof highlights_text === 'string' && !highlights_text.startsWith('{') ? highlights_text : (highlights_text?.text || ''),
      loans_to_members: parseFloat(body.loans_to_members) || 0,
      loan_repayments: parseFloat(body.loan_repayments) || 0,
      number_of_loans: parseInt(body.number_of_loans) || 0,
    });

    const payload: Record<string, any> = {
      id: reportId,
      report_month,
      period_start,
      period_end,
      status: status || 'draft',
      prepared_by: prepared_by || null,
      reviewed_by: reviewed_by || null,
      approved_by: approved_by || null,
      opening_balance: openingBal,
      total_income: totalInc,
      total_expenditure: totalExp,
      closing_balance: autoClosing,
      income_items: income_items || [],
      expenditure_items: expenditure_items || [],
      fund_positions: normalizedObligations,
      outstanding_obligations: totalObligations || parseFloat(outstanding_obligations) || 0,
      unpaid_commitments: parseFloat(unpaid_commitments) || 0,
      company_scorecard: company_scorecard || [],
      highlights_text: highlightsPayload,
      key_activities: key_activities || [],
      welfare_interventions: parseFloat(welfare_interventions) || 0,
      projects_funded: parseInt(projects_funded) || 0,
      closing_balance_records: autoClosing,
      closing_bank_balance: bankBal,
      closing_other_accounts: otherBal,
      unreconciled_difference: autoUnreconciled,
      reconciliation_status: autoUnreconciled === 0 ? 'Reconciled' : (reconciliation_status || 'Pending'),
      reconciliation_explanation: reconciliation_explanation || null,
      management_notes: management_notes || null,
      updated_at: new Date().toISOString(),
    };

    if (status === 'published') {
      payload.published_at = new Date().toISOString();
    }

    if (!supabase) {
      const local = getLocalReports();
      const existingIdx = local.findIndex((r) => r.id === payload.id);
      if (existingIdx >= 0) {
        local[existingIdx] = { ...local[existingIdx], ...payload };
      } else {
        payload.created_at = new Date().toISOString();
        local.unshift(payload);
      }
      saveLocalReports(local);
      return NextResponse.json({ ok: true, report: normalizeReport(payload) });
    }

    if (id) {
      // Update existing
      const { data, error } = await supabase
        .from('financial_reports')
        .update(payload)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) {
        if (error.message.includes('schema cache') || error.code === 'PGRST204') {
          const local = getLocalReports();
          const existingIdx = local.findIndex((r) => r.id === payload.id);
          if (existingIdx >= 0) {
            local[existingIdx] = { ...local[existingIdx], ...payload };
          } else {
            local.unshift(payload);
          }
          saveLocalReports(local);
          return NextResponse.json({ ok: true, report: normalizeReport(payload) });
        }
        return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
      }

      return NextResponse.json({ ok: true, report: normalizeReport(data || payload) });
    } else {
      // Insert new
      payload.created_at = new Date().toISOString();
      const { data, error } = await supabase
        .from('financial_reports')
        .insert(payload)
        .select()
        .maybeSingle();

      if (error) {
        if (error.message.includes('schema cache') || error.code === 'PGRST204') {
          const local = getLocalReports();
          local.unshift(payload);
          saveLocalReports(local);
          return NextResponse.json({ ok: true, report: normalizeReport(payload) }, { status: 201 });
        }
        return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
      }

      return NextResponse.json({ ok: true, report: normalizeReport(data || payload) }, { status: 201 });
    }
  } catch (err: any) {
    console.error('Reports POST error:', err);
    return NextResponse.json({ ok: false, message: err?.message || 'Server error' }, { status: 500 });
  }
}

/** DELETE /api/reports?id=... — delete a report (admin only) */
export async function DELETE(request: Request) {
  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ ok: false, message: 'Report ID required' }, { status: 400 });
  }

  const local = getLocalReports();
  const filtered = local.filter((r) => r.id !== id);
  if (filtered.length !== local.length) {
    saveLocalReports(filtered);
  }

  if (!supabase) {
    return NextResponse.json({ ok: true });
  }

  try {
    const { error } = await supabase.from('financial_reports').delete().eq('id', id);
    if (error && !error.message.includes('schema cache')) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err?.message || 'Server error' }, { status: 500 });
  }
}
