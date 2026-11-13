// Wedding contribution tracker — shared by the public Companies page, the admin
// dashboard editor, and the API routes, so it must NOT be a 'use client' module.

/** Every company is asked to raise ₦80,000 towards the set wedding fund. */
export const WEDDING_GOAL_NGN = 80000;

export interface WeddingCompany {
  id: string;
  name: string;
}

export const WEDDING_COMPANIES: WeddingCompany[] = [
  { id: 'alpha', name: 'Alpha Company' },
  { id: 'bravo', name: 'Bravo Company' },
  { id: 'charlie', name: 'Charlie Company' },
  { id: 'delta', name: 'Delta Company' },
  { id: 'echo', name: 'Echo Company' },
  { id: 'foxtrot', name: 'Foxtrot Company' },
  { id: 'golf', name: 'Golf Company' },
];

/** Living figures recorded so far — used as the fallback when Supabase is unreachable. */
export const WEDDING_SEED_CONTRIBUTIONS: Record<string, number> = {
  alpha: 46000,
  bravo: 10000,
  charlie: 34500,
  delta: 11500,
  echo: 14000,
  foxtrot: 11500,
  golf: 11500,
};

/** Combined target across all 7 companies. */
export const WEDDING_TOTAL_TARGET_NGN = WEDDING_GOAL_NGN * WEDDING_COMPANIES.length;

export function isWeddingCompany(id: string): boolean {
  return WEDDING_COMPANIES.some((c) => c.id === id);
}
