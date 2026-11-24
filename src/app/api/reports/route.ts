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

function getLocalReports(): any[] {
  try {
    if (!fs.existsSync(REPORTS_FILE)) return [];
    const content = fs.readFileSync(REPORTS_FILE, 'utf8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
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
    const local = getLocalReports();
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

      if (error) {
        const local = getLocalReports();
        const found = local.find((r) => r.id === id);
        return found ? NextResponse.json({ ok: true, report: found }) : NextResponse.json({ ok: false, message: 'Report not found' }, { status: 404 });
      }
      return NextResponse.json({ ok: true, report: data });
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
      const local = getLocalReports();
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

    return NextResponse.json({ ok: true, reports: merged });
  } catch (err) {
    console.error('Reports API error:', err);
    return NextResponse.json({ ok: true, reports: getLocalReports() });
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

    const payload: Record<string, any> = {
      id: reportId,
      report_month,
      period_start,
      period_end,
      status: status || 'draft',
      prepared_by: prepared_by || null,
      reviewed_by: reviewed_by || null,
      approved_by: approved_by || null,
      opening_balance: parseFloat(opening_balance) || 0,
      total_income: parseFloat(total_income) || 0,
      total_expenditure: parseFloat(total_expenditure) || 0,
      closing_balance: parseFloat(closing_balance) || 0,
      income_items: income_items || [],
      expenditure_items: expenditure_items || [],
      fund_positions: fund_positions || [],
      outstanding_obligations: parseFloat(outstanding_obligations) || 0,
      unpaid_commitments: parseFloat(unpaid_commitments) || 0,
      company_scorecard: company_scorecard || [],
      highlights_text: highlights_text || null,
      key_activities: key_activities || [],
      welfare_interventions: parseInt(welfare_interventions) || 0,
      projects_funded: parseInt(projects_funded) || 0,
      closing_balance_records: parseFloat(closing_balance_records) || 0,
      closing_bank_balance: parseFloat(closing_bank_balance) || 0,
      closing_other_accounts: parseFloat(closing_other_accounts) || 0,
      unreconciled_difference: parseFloat(unreconciled_difference) || 0,
      reconciliation_status: reconciliation_status || 'Pending',
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
      return NextResponse.json({ ok: true, report: payload });
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
          return NextResponse.json({ ok: true, report: payload });
        }
        return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
      }

      return NextResponse.json({ ok: true, report: data });
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
          return NextResponse.json({ ok: true, report: payload }, { status: 201 });
        }
        return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
      }

      return NextResponse.json({ ok: true, report: data }, { status: 201 });
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
