import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { attachSession, getClientIp, rateLimit } from '@/lib/server-auth';

export const runtime = 'nodejs';

/** Constant-time comparison to avoid leaking the admin password via timing. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid request.' }, { status: 400 });
  }

  const password = typeof body?.password === 'string' ? body.password : '';
  const configured = (process.env.ADMIN_PASSWORD || '').trim();

  // Never fall back to a hard-coded default — that would be trivially guessable.
  if (!configured) {
    return NextResponse.json(
      {
        ok: false,
        message:
          'Admin access is not configured on this server. Set the ADMIN_PASSWORD environment variable and restart.',
      },
      { status: 503 }
    );
  }

  const ip = getClientIp(request);
  const limit = rateLimit(`admin-login:${ip}`, 8, 15 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, message: `Too many attempts. Please try again in ${limit.retryAfter} seconds.` },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
    );
  }

  if (!password || !safeEqual(password, configured)) {
    return NextResponse.json({ ok: false, message: 'Incorrect admin password. Please try again.' }, { status: 401 });
  }

  return attachSession(
    NextResponse.json({ ok: true, message: 'Admin authenticated.' }),
    { sub: 'admin', role: 'admin', name: 'Administrator' },
    60 * 60 * 8 // 8-hour admin session
  );
}
