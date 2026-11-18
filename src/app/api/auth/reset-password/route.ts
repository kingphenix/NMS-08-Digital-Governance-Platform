import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyPasswordResetToken, invalidatePasswordResetToken } from '@/lib/reset-token';
import { hashPassword } from '@/lib/password';
import { getClientIp, rateLimit } from '@/lib/server-auth';

export const runtime = 'nodejs';

function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
}

/**
 * Validates a reset token without consuming it (used by the reset page on load).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ ok: false, valid: false, error: 'Reset token is required.' }, { status: 400 });
  }

  const result = await verifyPasswordResetToken(token);
  if (!result.valid || !result.member) {
    return NextResponse.json(
      { ok: false, valid: false, error: result.error || 'Invalid or expired token.' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ok: true,
    valid: true,
    name: result.member.full_name,
    nms: result.member.nms_number,
  });
}

/**
 * Resets the password using a valid reset token, and immediately invalidates the token.
 */
export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`reset-pw:ip:${ip}`, 10, 15 * 60 * 1000);
    if (!limit.ok) {
      return NextResponse.json(
        { ok: false, message: 'Too many requests. Please wait a few moments before trying again.' },
        { status: 429 }
      );
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: false, message: 'Invalid request body.' }, { status: 400 });
    }

    const token = typeof body?.token === 'string' ? body.token.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!token) {
      return NextResponse.json({ ok: false, message: 'Password reset token is required.' }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { ok: false, message: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // 1. Verify token authenticity, expiry, and unconsumed state
    const result = await verifyPasswordResetToken(token);
    if (!result.valid || !result.member) {
      return NextResponse.json(
        { ok: false, message: result.error || 'This password reset link is invalid or has expired.' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ ok: false, message: 'Database connection unavailable.' }, { status: 500 });
    }

    // 2. Hash new password with scrypt
    const newPasswordHash = hashPassword(password);

    // 3. Update member's password in database
    const { error: updateErr } = await supabase
      .from('member_profiles')
      .update({
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString(),
      })
      .eq('id', result.member.id);

    if (updateErr) {
      console.error('Password reset DB update error:', updateErr);
      return NextResponse.json(
        { ok: false, message: 'Failed to update password. Please try again.' },
        { status: 500 }
      );
    }

    // 4. Invalidate the token so it can never be used again
    await invalidatePasswordResetToken(result.tokenId, result.tokenHash);

    return NextResponse.json({
      ok: true,
      message: 'Your password has been successfully reset! You can now sign in with your new password.',
    });
  } catch (err: any) {
    console.error('Reset password error:', err);
    return NextResponse.json(
      { ok: false, message: err?.message || 'Failed to complete password reset.' },
      { status: 500 }
    );
  }
}
