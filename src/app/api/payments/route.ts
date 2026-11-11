import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSession } from '@/lib/server-auth';
import {
  ANNUAL_ARREARS_CAP_NGN,
  ANNUAL_DISCOUNT_NGN,
  MONTHLY_DUES_NGN,
  accruedArrearsNgn,
  isDuesSettled,
  monthsElapsedInCycle,
} from '@/lib/dues-utils';
import type { DuesScope } from '@/lib/dues-utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function getServiceClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
}

/**
 * GET /api/payments?nms=NMS/08/123
 * Returns the member's live dues / goodwill payment status recorded in Supabase.
 */
export async function GET(request: Request) {
  // Payment history is private to the member it belongs to.
  const session = getSession(request);
  if (!session) {
    return NextResponse.json({ ok: false, message: 'Authentication required.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const nms = session.role === 'admin' ? (searchParams.get('nms') || '').trim() : session.sub;

  if (!nms) {
    return NextResponse.json({ ok: false, message: 'NMS number is required' }, { status: 400 });
  }

  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, message: 'Server configuration error' }, { status: 500 });
  }

  const { data, error } = await supabase
    .from('dues_payments')
    .select('amount_ngn, notes, reference, paid_at, payment_method, payment_year')
    .eq('nms_number', nms);

  if (error) {
    console.warn('Payment status query warning:', error.message);
    return NextResponse.json({ ok: true, duesPaid: false, duesAmount: 0, goodwillTotal: 0, payments: [] });
  }

  const rows = (data || []) as Array<{
    amount_ngn: number | string;
    notes: string | null;
  }>;
  const isDues = (notes?: string | null) => {
    if (!notes) return false;
    const normalised = notes.trim().toLowerCase();
    return normalised.startsWith('monthly dues') || normalised.startsWith('annual dues');
  };

  let duesPaidAmount = 0;
  let goodwillTotal = 0;
  for (const row of rows) {
    const amount = Number(row.amount_ngn) || 0;
    if (isDues(row.notes)) duesPaidAmount += amount;
    else goodwillTotal += amount;
  }

  // The cycle opens in November 2026, so nothing is owed for Jan–Oct 2026.
  const monthsElapsed = monthsElapsedInCycle();
  const arrearsDue = accruedArrearsNgn();
  const duesPaid = isDuesSettled(duesPaidAmount, arrearsDue);

  return NextResponse.json({
    ok: true,
    duesPaid,
    duesPaidAmount,
    monthlyDues: MONTHLY_DUES_NGN,
    annualDues: ANNUAL_ARREARS_CAP_NGN,
    annualDiscount: ANNUAL_DISCOUNT_NGN,
    arrearsDue,
    monthsElapsed,
    duesOutstanding: duesPaid ? 0 : Math.max(0, arrearsDue - duesPaidAmount),
    goodwillTotal,
    payments: rows,
  });
}

/**
 * POST /api/payments
 * Verifies a Paystack transaction server-side, then records it in dues_payments.
 * Body: { reference, nms_number, full_name?, company?, purpose: 'dues' | 'goodwill' }
 */
export async function POST(request: Request) {
  // A payment may only be recorded against the caller's own account.
  const session = getSession(request);
  if (!session) {
    return NextResponse.json({ ok: false, message: 'Authentication required.' }, { status: 401 });
  }

  let body: any = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid request body' }, { status: 400 });
  }

  const reference = (body?.reference || '').toString().trim();
  const nms = session.role === 'admin'
    ? (body?.nms_number || body?.nms || '').toString().trim()
    : session.sub;
  const fullName = (body?.full_name || body?.name || '').toString().trim();
  const company = (body?.company || '').toString().trim();
  const purpose: 'dues' | 'goodwill' = body?.purpose === 'goodwill' ? 'goodwill' : 'dues';
  // Dues are either the ₦2,000 monthly instalment or the ₦20,000 discounted
  // yearly settlement; anything that is not explicitly "annual" is monthly.
  const scope: DuesScope = body?.scope === 'annual' ? 'annual' : 'monthly';

  if (!reference) {
    return NextResponse.json({ ok: false, message: 'Payment reference is required' }, { status: 400 });
  }
  if (!nms) {
    return NextResponse.json({ ok: false, message: 'NMS number is required' }, { status: 400 });
  }

  const secretKey = (process.env.PAYSTACK_SECRET_KEY || '').trim();
  if (!secretKey || secretKey.includes('replace_with')) {
    return NextResponse.json(
      {
        ok: false,
        code: 'NOT_CONFIGURED',
        message:
          'Payment gateway is not configured yet. Please add your Paystack keys to the environment and restart the server.',
      },
      { status: 503 }
    );
  }

  // Test-mode keys (`sk_test_`) produce synthetic transactions. Never record
  // them as real payments unless a developer explicitly opts in, so local
  // gateway testing can't pollute live dues data.
  if (secretKey.startsWith('sk_test_') && process.env.ALLOW_TEST_PAYMENTS !== 'true') {
    return NextResponse.json(
      {
        ok: false,
        code: 'TEST_MODE',
        message:
          'The payment gateway is running with a Paystack test key, so this payment was not recorded. Use live keys to accept real dues.',
      },
      { status: 503 }
    );
  }

  // 1) Verify the transaction directly with Paystack.
  let verification: any = null;
  try {
    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/json' },
        cache: 'no-store',
      }
    );
    verification = await res.json();
    if (!res.ok || !verification?.status) {
      return NextResponse.json(
        { ok: false, message: verification?.message || 'Unable to verify payment with Paystack.' },
        { status: 502 }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err?.message || 'Could not reach Paystack to verify the payment.' },
      { status: 502 }
    );
  }

  const txn = verification?.data;
  if (txn?.status !== 'success') {
    return NextResponse.json(
      { ok: false, message: `Payment was not successful (status: ${txn?.status || 'unknown'}).` },
      { status: 400 }
    );
  }

  const amountNgn = Number(txn.amount || 0) / 100; // Paystack amounts are in kobo
  const referenceFromGateway: string = txn.reference || reference;
  const now = new Date();

  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, message: 'Server configuration error' }, { status: 500 });
  }

  // 2) Idempotency — never record the same reference twice.
  const { data: existing } = await supabase
    .from('dues_payments')
    .select('id')
    .eq('reference', referenceFromGateway)
    .maybeSingle();

  if (existing?.id) {
    return NextResponse.json({ ok: true, duplicate: true, amount_ngn: amountNgn, reference: referenceFromGateway, purpose, scope });
  }

  // 3) Record the payment.
  const notes =
    purpose === 'goodwill'
      ? 'Goodwill Donation'
      : scope === 'annual'
        ? `Annual Dues ${now.getFullYear()} (Discounted Yearly)`
        : `Monthly Dues ${now.getFullYear()} - ${MONTH_LABELS[now.getMonth()]}`;
  const insertPayload = {
    nms_number: nms,
    full_name: fullName || null,
    company: company || null,
    amount_ngn: amountNgn,
    payment_year: now.getFullYear(),
    payment_month: now.getMonth() + 1,
    paid_at: now.toISOString(),
    payment_method: 'Paystack',
    reference: referenceFromGateway,
    notes,
  };

  const { error: insertError } = await supabase.from('dues_payments').insert(insertPayload);

  if (insertError) {
    console.warn('Failed to record payment:', insertError.message);
    return NextResponse.json(
      { ok: false, message: 'Payment verified but could not be saved. Please contact the secretariat with your reference: ' + referenceFromGateway },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    amount_ngn: amountNgn,
    reference: referenceFromGateway,
    purpose,
    scope,
    notes,
  });
}
