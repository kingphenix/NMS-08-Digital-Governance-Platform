import crypto from 'crypto';
import type { NextResponse } from 'next/server';

/**
 * Server-only session + guard helpers.
 *
 * Sessions are stateless HMAC-signed tokens stored in an httpOnly cookie so that
 * API routes can authenticate the caller. Nothing here may ever be imported into
 * a client component.
 */

const COOKIE_NAME = 'nms08_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type SessionRole = 'member' | 'admin';

export interface SessionPayload {
  /** Member NMS number, or 'admin' for the admin portal. */
  sub: string;
  role: SessionRole;
  name?: string;
  exp: number;
}

function getSecret(): string {
  return (
    process.env.AUTH_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'nms08-insecure-dev-secret'
  );
}

function sign(data: string): string {
  return crypto.createHmac('sha256', getSecret()).update(data).digest('base64url');
}

export function createSessionToken(
  payload: Omit<SessionPayload, 'exp'>,
  ttlSeconds: number = SESSION_TTL_SECONDS
): string {
  const full: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const body = Buffer.from(JSON.stringify(full), 'utf8').toString('base64url');
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token?: string | null): SessionPayload | null {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const dot = token.lastIndexOf('.');
  const body = token.slice(0, dot);
  const provided = token.slice(dot + 1);
  if (!body || !provided) return null;

  const expected = sign(body);
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SessionPayload;
    if (!payload || typeof payload.exp !== 'number') return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (payload.role !== 'member' && payload.role !== 'admin') return null;
    if (typeof payload.sub !== 'string' || !payload.sub) return null;
    return payload;
  } catch {
    return null;
  }
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get('cookie') || '';
  for (const part of header.split(';')) {
    const trimmed = part.trim();
    if (trimmed.startsWith(`${name}=`)) {
      return decodeURIComponent(trimmed.slice(name.length + 1));
    }
  }
  return null;
}

/** Reads and verifies the session attached to an incoming request. */
export function getSession(request: Request): SessionPayload | null {
  return verifySessionToken(readCookie(request, COOKIE_NAME));
}

/** Returns the session only when the caller is an authenticated member. */
export function requireMember(request: Request): SessionPayload | null {
  const session = getSession(request);
  return session && session.role === 'member' ? session : null;
}

/** Returns the session only when the caller is an authenticated admin. */
export function requireAdmin(request: Request): SessionPayload | null {
  const session = getSession(request);
  return session && session.role === 'admin' ? session : null;
}

/** Attaches a signed session cookie to an outgoing response. */
export function attachSession(
  response: NextResponse,
  payload: Omit<SessionPayload, 'exp'>,
  ttlSeconds: number = SESSION_TTL_SECONDS
): NextResponse {
  response.cookies.set({
    name: COOKIE_NAME,
    value: createSessionToken(payload, ttlSeconds),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ttlSeconds,
  });
  return response;
}

/** Clears the session cookie on an outgoing response. */
export function clearSession(response: NextResponse): NextResponse {
  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  return response;
}

/** Best-effort client IP for rate limiting behind common proxies. */
export function getClientIp(request: Request): string {
  const header = request.headers;
  const forwarded = header.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim() || 'unknown';
  return header.get('x-real-ip') || header.get('cf-connecting-ip') || 'unknown';
}

interface RateBucket {
  count: number;
  resetAt: number;
}

const rateBuckets = new Map<string, RateBucket>();

/**
 * Simple in-memory fixed-window rate limiter. Suitable for a single instance;
 * swap for a shared store (Redis/Supabase) when horizontally scaled.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const bucket = rateBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    if (rateBuckets.size > 5000) {
      for (const [k, v] of rateBuckets) {
        if (v.resetAt <= now) rateBuckets.delete(k);
      }
    }
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }

  bucket.count += 1;
  return { ok: true, retryAfter: 0 };
}
