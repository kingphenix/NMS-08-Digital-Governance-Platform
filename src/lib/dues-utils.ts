// Shared dues pricing model. Imported by both client components (member
// dashboard) and server route handlers (/api/payments, /api/admin/members), so
// it must NOT be a 'use client' module.

/** Statutory dues are charged monthly at ₦2,000. */
export const MONTHLY_DUES_NGN = 2000;

/** Twelve instalments = ₦24,000 — the most a member can accrue in one cycle. */
export const ANNUAL_ARREARS_CAP_NGN = 24000;

/** Settling the whole cycle up front earns a discount: ₦20,000 instead of ₦24,000. */
export const ANNUAL_DISCOUNT_NGN = 20000;

/** Instalments in one dues cycle. */
export const CYCLE_MONTHS = 12;

// The platform only went live recently, so the cycle is deemed to open in
// November 2026: members are NOT in arrears for January–October 2026.
export const DUES_CYCLE_START_YEAR = 2026;
export const DUES_CYCLE_START_MONTH = 11; // November

/** Which dues plan a payment belongs to. */
export type DuesScope = 'monthly' | 'annual';

/**
 * Instalments due so far in the running cycle. The opening month counts as 1 and
 * the count rolls over every 12 months. Returns 0 before the cycle has begun.
 */
export function monthsElapsedInCycle(now: Date = new Date()): number {
  const sinceStart =
    (now.getFullYear() - DUES_CYCLE_START_YEAR) * 12 + (now.getMonth() + 1 - DUES_CYCLE_START_MONTH);
  if (sinceStart < 0) return 0;
  return (sinceStart % CYCLE_MONTHS) + 1;
}

/** Arrears accrued so far in the cycle, capped at 12 instalments (₦24,000). */
export function accruedArrearsNgn(now: Date = new Date()): number {
  return Math.min(ANNUAL_ARREARS_CAP_NGN, monthsElapsedInCycle(now) * MONTHLY_DUES_NGN);
}

/**
 * True once a member is square with the set for the cycle: either they are up to
 * date with the instalments accrued so far, or they took the ₦20,000 yearly
 * settlement, which clears the whole cycle.
 */
export function isDuesSettled(duesPaidAmount: number, arrearsDue: number): boolean {
  return duesPaidAmount >= ANNUAL_DISCOUNT_NGN || duesPaidAmount >= arrearsDue;
}
