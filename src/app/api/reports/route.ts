import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

/** GET /api/reports — list all published reports (or all for admin). Returns blank array if none exist */
export async function GET(request: Request) {
  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const admin = searchParams.get('admin') === 'true';
  const id = searchParams.get('id');

  if (!supabase) {
    return NextResponse.json({ ok: true, reports: [] });
  }

  try {
    if (id) {
      // Single report by ID
      const { data, error } = await supabase
        .from('financial_reports')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        return NextResponse.json({ ok: false, message: 'Report not found' }, { status: 404 });
      }
      return NextResponse.json({ ok: true, report: data });
    }

    // List reports
    let query = supabase
      .from('financial_reports')
      .select('*')
      .order('period_start', { ascending: false });

    if (!admin) {
      query = query.eq('status', 'published');
    }

    const { data, error } = await query;

    if (error || !data) {
      return NextResponse.json({ ok: true, reports: [] });
    }

    return NextResponse.json({ ok: true, reports: data });
  } catch (err) {
    console.error('Reports API error:', err);
    return NextResponse.json({ ok: true, reports: [] });
  }
}

/** POST /api/reports — create or update a report (admin only) */
export async function POST(request: Request) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, message: 'Service unavailable' }, { status: 503 });
  }

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

    const payload: Record<string, any> = {
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

    if (id) {
      // Update existing
      const { data, error } = await supabase
        .from('financial_reports')
        .update(payload)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Report update error:', error);
        return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
      }

      return NextResponse.json({ ok: true, report: data });
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('financial_reports')
        .insert(payload)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Report insert error:', error);
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
  if (!supabase) {
    return NextResponse.json({ ok: false, message: 'Service unavailable' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ ok: false, message: 'Report ID required' }, { status: 400 });
  }

  try {
    const { error } = await supabase.from('financial_reports').delete().eq('id', id);
    if (error) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err?.message || 'Server error' }, { status: 500 });
  }
}
