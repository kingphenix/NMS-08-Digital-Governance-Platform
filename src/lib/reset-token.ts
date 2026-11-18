import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 60 minutes

function getSecret(): string {
  return (
    process.env.AUTH_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'nms08-insecure-dev-secret'
  );
}

function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
}

interface TokenPayload {
  id: string;
  nms: string;
  exp: number;
  hash: string;
}

// In-memory invalidated token cache as instant fallback/redundancy
const invalidatedTokens = new Set<string>();

function computeTokenSignature(payloadStr: string, memberPasswordHash: string): string {
  const compositeKey = crypto
    .createHmac('sha256', getSecret())
    .update(memberPasswordHash || 'unseeded')
    .digest('hex');
  return crypto.createHmac('sha256', compositeKey).update(payloadStr).digest('base64url');
}

/**
 * Creates a cryptographically unique, time-limited reset token for a member.
 */
export async function createPasswordResetToken(member: {
  nms_number: string;
  email: string;
  password_hash?: string | null;
}): Promise<string> {
  const tokenId = crypto.randomUUID();
  const rawSecret = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawSecret).digest('hex');
  const exp = Date.now() + RESET_TOKEN_TTL_MS;

  const payload: TokenPayload = {
    id: tokenId,
    nms: member.nms_number,
    exp,
    hash: tokenHash,
  };

  const payloadStr = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = computeTokenSignature(payloadStr, member.password_hash || '');
  const finalToken = `${payloadStr}.${signature}`;

  // Attempt to persist token in Supabase password_reset_tokens table
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('password_reset_tokens').insert({
        id: tokenId,
        nms_number: member.nms_number,
        email: member.email || '',
        token_hash: tokenHash,
        expires_at: new Date(exp).toISOString(),
        used: false,
      });
    } catch (dbErr) {
      console.warn('[PasswordReset] Notice: Table insert skipped, relying on cryptographic signature:', dbErr);
    }
  }

  return finalToken;
}

export interface VerifyTokenResult {
  valid: boolean;
  error?: string;
  member?: {
    id: string;
    nms_number: string;
    full_name: string;
    email: string;
    password_hash: string;
  };
  tokenId?: string;
  tokenHash?: string;
}

/**
 * Verifies that a reset token is authentic, non-expired, and not yet consumed.
 */
export async function verifyPasswordResetToken(token?: string | null): Promise<VerifyTokenResult> {
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return { valid: false, error: 'Invalid or malformed reset token.' };
  }

  const dot = token.lastIndexOf('.');
  const payloadStr = token.slice(0, dot);
  const providedSignature = token.slice(dot + 1);

  if (!payloadStr || !providedSignature) {
    return { valid: false, error: 'Invalid reset token format.' };
  }

  let payload: TokenPayload;
  try {
    payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf8')) as TokenPayload;
  } catch {
    return { valid: false, error: 'Could not parse reset token.' };
  }

  // 1. Time expiration check
  if (!payload.exp || typeof payload.exp !== 'number' || payload.exp < Date.now()) {
    return { valid: false, error: 'This password reset link has expired. Please request a new one.' };
  }

  // 2. In-memory invalidation check
  if (invalidatedTokens.has(payload.id) || invalidatedTokens.has(payload.hash)) {
    return { valid: false, error: 'This password reset link has already been used.' };
  }

  // 3. Database lookup for member
  const supabase = getSupabase();
  if (!supabase) {
    return { valid: false, error: 'Database service is currently unavailable.' };
  }

  const { data: member, error: memberErr } = await supabase
    .from('member_profiles')
    .select('id, nms_number, full_name, email, password_hash')
    .ilike('nms_number', payload.nms)
    .maybeSingle();

  if (memberErr || !member) {
    return { valid: false, error: 'Account associated with this token was not found.' };
  }

  // 4. Verify cryptographic signature bound to the member's current password_hash.
  // If the user already reset their password, member.password_hash changed, and signature fails.
  const expectedSignature = computeTokenSignature(payloadStr, member.password_hash || '');
  const bufA = Buffer.from(providedSignature);
  const bufB = Buffer.from(expectedSignature);
  if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) {
    return {
      valid: false,
      error: 'This password reset link is invalid or has already been used.',
    };
  }

  // 5. Database check in password_reset_tokens table (if table exists)
  try {
    const { data: dbToken } = await supabase
      .from('password_reset_tokens')
      .select('id, used, expires_at')
      .eq('token_hash', payload.hash)
      .maybeSingle();

    if (dbToken && dbToken.used) {
      return { valid: false, error: 'This password reset link has already been used.' };
    }
    if (dbToken && new Date(dbToken.expires_at).getTime() < Date.now()) {
      return { valid: false, error: 'This password reset link has expired. Please request a new one.' };
    }
  } catch {
    // Non-fatal if table not created; HMAC signature guarantees invalidation
  }

  return {
    valid: true,
    member,
    tokenId: payload.id,
    tokenHash: payload.hash,
  };
}

/**
 * Invalidates a reset token in both the database and the cache.
 */
export async function invalidatePasswordResetToken(tokenId?: string, tokenHash?: string): Promise<void> {
  if (tokenId) invalidatedTokens.add(tokenId);
  if (tokenHash) invalidatedTokens.add(tokenHash);

  const supabase = getSupabase();
  if (supabase && (tokenId || tokenHash)) {
    try {
      const query = supabase
        .from('password_reset_tokens')
        .update({
          used: true,
          used_at: new Date().toISOString(),
        });

      if (tokenHash) {
        await query.eq('token_hash', tokenHash);
      } else if (tokenId) {
        await query.eq('id', tokenId);
      }
    } catch (err) {
      console.warn('[PasswordReset] Failed to update token as used in DB:', err);
    }
  }
}
