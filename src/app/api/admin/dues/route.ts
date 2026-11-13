import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/server-auth';
import { ANNUAL_DISCOUNT_NGN, MONTHLY_DUES_NGN } from '@/lib/dues-utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** Manual entries are tagged so the member-facing dues engine counts them as real dues. */
const ADMIN_METHOD = 'Admin Verification';
const SELECT_COLS =
  'id, nms_number, full_name, company, amount_ngn, payment_year, payment_month, paid_at, notes, reference';

function getServiceClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
}

/**
 * GET /api/admin/dues
 * Lists dues payments that an administrator verified manually so they can be revoked.
 */
export async function GET(request: Request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ ok: false, message: 'Administrator authentication required.' }, { status: 401 });
  }

  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ ok: true, verifications: [] });
  }

  const { data, error } = await supabase
    .from('dues_payments')
    .select(SELECT_COLS)
    .eq('payment_method', ADMIN_METHOD)
    .order('paid_at', { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ ok: true, verifications: [] });
  }

  return NextResponse.json({ ok: true, verifications: data || [] });
}

/**
 * POST /api/admin/dues
 * Body: { nms_number: string, scope: 'monthly' | 'annual' }
 * Records that an administrator has verified a member's dues payment. The row is
 * written to `dues_payments` with dues-tagged notes, so the member dashboard's
 * existing dues engine picks it up automatically.
 */
export async function POST(request: Request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ ok: false, message: 'Administrator authentication required.' }, { status: 401 });
  }

  let body: any = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid request body.' }, { status: 400 });
  }

  const nms = String(body?.nms_number || body?.nms || '').trim();
  const scope: 'monthly' | 'annual' = body?.scope === 'annual' ? 'annual' : 'monthly';

  if (!nms) {
    return NextResponse.json({ ok: false, message: 'An NMS number is required.' }, { status: 400 });
  }

  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, message: 'Server configuration error.' }, { status: 500 });
  }

  // Resolve the member's name/company from the authoritative profile record.
  let fullName = '';
  let company = '';
  const { data: profile } = await supabase
    .from('member_profiles')
    .select('full_name, company')
    .eq('nms_number', nms)
    .maybeSingle();
  if (profile) {
    fullName = profile.full_name || '';
    company = profile.company || '';
  }

  const now = new Date();
  const notes =
    scope === 'annual'
      ? `Annual Dues ${now.getFullYear()} (Discounted Yearly)`
      : `Monthly Dues ${now.getFullYear()} - ${MONTH_LABELS[now.getMonth()]}`;
  const amount = scope === 'annual' ? ANNUAL_DISCOUNT_NGN : MONTHLY_DUES_NGN;

  // Guard against double-logging the same instalment for the same member.
  const { data: existing } = await supabase
    .from('dues_payments')
    .select('id')
    .eq('nms_number', nms)
    .eq('payment_method', ADMIN_METHOD)
    .eq('notes', notes)
    .maybeSingle();

  if (existing?.id) {
    return NextResponse.json({
      ok: true,
      duplicate: true,
      message: `Dues for ${notes} were already verified for this Ex-Boy.`,
    });
  }

  const reference = `NMS08-ADMIN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  const { error: insertError } = await supabase.from('dues_payments').insert({
    nms_number: nms,
    full_name: fullName || null,
    company: company || null,
    amount_ngn: amount,
    payment_year: now.getFullYear(),
    payment_month: now.getMonth() + 1,
    paid_at: now.toISOString(),
    payment_method: ADMIN_METHOD,
    reference,
    notes,
  });

  if (insertError) {
    console.warn('Failed to record admin dues verification:', insertError.message);
    return NextResponse.json({ ok: false, message: 'Could not record the verification.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, amount, notes, reference });
}

/**
 * DELETE /api/admin/dues?id=<uuid>
 * Revokes a manual verification (e.g. logged in error). Paystack-verified rows
 * cannot be removed here.
 */
export async function DELETE(request: Request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ ok: false, message: 'Administrator authentication required.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = (searchParams.get('id') || '').trim();
  if (!id) {
    return NextResponse.json({ ok: false, message: 'Verification ID is required.' }, { status: 400 });
  }

  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, message: 'Server configuration error.' }, { status: 500 });
  }

  const { error } = await supabase
    .from('dues_payments')
    .delete()
    .eq('id', id)
    .eq('payment_method', ADMIN_METHOD);

  if (error) {
    return NextResponse.json({ ok: false, message: 'Could not revoke the verification.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
