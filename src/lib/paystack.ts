'use client';

// Central place for the NMS 08 payment configuration & Paystack helpers.
// The public key is safe to expose; the secret key lives only on the server
// (see src/app/api/payments/route.ts).

export type PaymentPurpose = 'dues' | 'goodwill';

/** UI-level identifier for the specific payment button that is in flight. */
export type PaymentAction = 'dues-monthly' | 'dues-annual' | 'goodwill';

export const PAYSTACK_SCRIPT_SRC = 'https://js.paystack.co/v2/inline.js';

export const PAYSTACK_PUBLIC_KEY = (process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '').trim();

/** True when a real public key has been supplied via env. */
export function isPaystackConfigured(): boolean {
  return (
    PAYSTACK_PUBLIC_KEY.startsWith('pk_') && !PAYSTACK_PUBLIC_KEY.includes('replace_with')
  );
}

export interface PaystackTransaction {
  reference: string;
  status?: string;
  message?: string;
  [key: string]: unknown;
}

export interface PaystackTransactionOptions {
  key: string;
  email: string;
  amount: number; // in kobo
  currency?: string;
  reference?: string;
  metadata?: Record<string, unknown>;
  channels?: string[];
  onSuccess: (transaction: PaystackTransaction) => void;
  onLoad?: (response: { id?: string; accessCode?: string }) => void;
  onCancel?: () => void;
  onError?: (error: { message?: string }) => void;
}

declare global {
  interface Window {
    // Paystack InlineJS v2 exposes a constructor: `new PaystackPop().newTransaction(...)`
    PaystackPop?: new () => {
      newTransaction: (options: PaystackTransactionOptions) => void;
    };
  }
}

/** Injects the Paystack inline script once and resolves when it is ready. */
export function loadPaystackScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }
    if (window.PaystackPop) {
      resolve(true);
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${PAYSTACK_SCRIPT_SRC}"]`
    );
    if (existing) {
      existing.addEventListener('load', () => resolve(Boolean(window.PaystackPop)));
      existing.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = PAYSTACK_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve(Boolean(window.PaystackPop));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/** Generates a unique, human-readable transaction reference. */
export function buildPaymentReference(purpose: PaymentPurpose): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `NMS08-${purpose === 'dues' ? 'DUES' : 'GIFT'}-${stamp}-${rand}`;
}

export function formatNaira(amount: number): string {
  return `₦${Number(amount || 0).toLocaleString('en-NG')}`;
}
