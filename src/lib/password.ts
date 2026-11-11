import crypto from 'crypto';

/**
 * Server-only password hashing helpers.
 *
 * New hashes use scrypt with a random per-user salt. Legacy unsalted SHA-256
 * hashes (created by earlier releases) are still accepted so existing accounts
 * keep working, and are transparently upgraded on the next successful sign-in.
 */

const SCRYPT_KEYLEN = 64;
const SALT_BYTES = 16;
const PREFIX = 'scrypt';

// Hashes created by the Supabase `register` Edge Function (Deno/WebCrypto).
const PBKDF2_PREFIX = 'pbkdf2';
const PBKDF2_KEYLEN = 32;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_BYTES);
  const derived = crypto.scryptSync(password, salt, SCRYPT_KEYLEN);
  return `${PREFIX}$${salt.toString('hex')}$${derived.toString('hex')}`;
}

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function verifyPassword(password: string, stored?: string | null): boolean {
  if (!stored || typeof stored !== 'string') return false;

  if (stored.startsWith(`${PREFIX}$`)) {
    const [, saltHex, hashHex] = stored.split('$');
    if (!saltHex || !hashHex) return false;
    try {
      const derived = crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), SCRYPT_KEYLEN);
      return timingSafeEqual(derived.toString('hex'), hashHex);
    } catch {
      return false;
    }
  }

  if (stored.startsWith(`${PBKDF2_PREFIX}$`)) {
    const [, iterationsRaw, saltHex, hashHex] = stored.split('$');
    const iterations = Number(iterationsRaw);
    if (!saltHex || !hashHex || !Number.isInteger(iterations) || iterations < 1000) return false;
    try {
      const derived = crypto.pbkdf2Sync(
        password,
        Buffer.from(saltHex, 'hex'),
        iterations,
        PBKDF2_KEYLEN,
        'sha256'
      );
      return timingSafeEqual(derived.toString('hex'), hashHex);
    } catch {
      return false;
    }
  }

  // Legacy unsalted SHA-256 (hex). Kept only for backwards compatibility.
  const legacy = crypto.createHash('sha256').update(password.trim()).digest('hex');
  return timingSafeEqual(legacy, stored);
}

/** True when a stored hash should be regenerated with the current algorithm. */
export function needsRehash(stored?: string | null): boolean {
  return !stored || !stored.startsWith(`${PREFIX}$`);
}
