import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getClientIp, rateLimit } from '@/lib/server-auth';
import { createPasswordResetToken } from '@/lib/reset-token';
import { sendPasswordResetEmail } from '@/lib/email';

export const runtime = 'nodejs';

function normalizeNms(input: string): string | null {
  const trimmed = input.trim();
  const matchFull = trimmed.match(/^NMS[\s\/\-_.]*(\d{2})[\s\/\-_.]*(\d{1,6})$/i);
  if (matchFull) return `NMS/${matchFull[1]}/${matchFull[2]}`;
  const matchYear = trimmed.match(/^(\d{2})[\s\/\-_.]+(\d{1,6})$/);
  if (matchYear) return `NMS/${matchYear[1]}/${matchYear[2]}`;
  const matchNmsOnly = trimmed.match(/^NMS[\s\/\-_.]*(\d{1,6})$/i);
  if (matchNmsOnly) return `NMS/08/${matchNmsOnly[1]}`;
  const matchDigits = trimmed.match(/^(\d{1,6})$/);
  if (matchDigits) return `NMS/08/${matchDigits[1]}`;
  return null;
}

function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return 'your registered email';
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }
  return `${local.slice(0, 2)}***${local.slice(-1)}@${domain}`;
}

export async function POST(request: Request) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, message: 'Invalid request body.' },
        { status: 400 }
      );
    }

    const identifier = typeof body?.identifier === 'string' ? body.identifier.trim() : '';
    if (!identifier) {
      return NextResponse.json(
        { ok: false, message: 'Please provide your NMS Number or registered Email address.' },
        { status: 400 }
      );
    }

    // Rate limit: max 5 attempts per 15 minutes per IP
    const ip = getClientIp(request);
    const ipLimit = rateLimit(`forgot-pw:ip:${ip}`, 5, 15 * 60 * 1000);
    const idLimit = rateLimit(`forgot-pw:id:${identifier.toLowerCase()}`, 5, 15 * 60 * 1000);
    if (!ipLimit.ok || !idLimit.ok) {
      const retryAfter = Math.max(ipLimit.retryAfter, idLimit.retryAfter);
      return NextResponse.json(
        { ok: false, message: `Too many password reset requests. Please wait ${retryAfter} seconds before trying again.` },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { ok: false, message: 'Password reset is temporarily unavailable. Please contact the platform administrator.' },
        { status: 503 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const isEmail = identifier.includes('@');
    const canonicalNms = normalizeNms(identifier);

    let member: any = null;

    if (isEmail) {
      const { data } = await supabase
        .from('member_profiles')
        .select('id, nms_number, full_name, email, password_hash')
        .ilike('email', identifier)
        .maybeSingle();
      member = data;
    } else {
      // 1. Try canonical NMS format (NMS/08/XXXX)
      if (canonicalNms) {
        const { data } = await supabase
          .from('member_profiles')
          .select('id, nms_number, full_name, email, password_hash')
          .ilike('nms_number', canonicalNms)
          .maybeSingle();
        member = data;
      }
      // 2. Direct match
      if (!member) {
        const { data } = await supabase
          .from('member_profiles')
          .select('id, nms_number, full_name, email, password_hash')
          .ilike('nms_number', identifier)
          .maybeSingle();
        member = data;
      }
    }

    // Always return a positive message even if account not found, to prevent account enumeration
    if (!member || !member.email) {
      return NextResponse.json({
        ok: true,
        message: 'If an account exists with those details, a password reset link has been sent to the registered email address.',
      });
    }

    // Generate unique time-limited reset token
    const token = await createPasswordResetToken(member);

    // Determine base URL
    const host = request.headers.get('host') || 'localhost:3000';
    const proto = request.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const resetUrl = `${proto}://${host}/reset-password?token=${encodeURIComponent(token)}`;

    // Dispatch email
    const emailResult = await sendPasswordResetEmail({
      to: member.email,
      fullName: member.full_name || 'Ex-Boy Member',
      nmsNumber: member.nms_number,
      resetUrl,
    });

    return NextResponse.json({
      ok: true,
      message: `Password reset link sent to ${maskEmail(member.email)}. The link will expire in 60 minutes.`,
      maskedEmail: maskEmail(member.email),
      devUrl: emailResult.devUrl,
    });
  } catch (err: any) {
    console.error('Forgot password error:', err);
    return NextResponse.json(
      { ok: false, message: 'We could not process your request right now. Please try again shortly.' },
      { status: 500 }
    );
  }
}
