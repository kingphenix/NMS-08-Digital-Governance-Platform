import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getClientIp, rateLimit } from '@/lib/server-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CATEGORIES = new Set(['Platform', 'Governance', 'Welfare', 'Events', 'Other']);
const NO_CACHE = { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' };

function getServiceClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

/** Public suggestion submission; reading the inbox is only available to admins. */
export async function POST(request: Request) {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 12_000) {
    return NextResponse.json({ ok: false, message: 'The submission is too large.' }, { status: 413 });
  }

  const limit = rateLimit(`suggestion:${getClientIp(request)}`, 5, 60 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, message: `Please wait before sending another suggestion.` },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter), ...NO_CACHE } }
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Please submit a valid suggestion.' }, { status: 400 });
  }

  // Quietly accept honeypot submissions without persisting them.
  if (typeof body?.website === 'string' && body.website.trim()) {
    return NextResponse.json({ ok: true }, { status: 201, headers: NO_CACHE });
  }

  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const category = typeof body?.category === 'string' ? body.category : 'Other';
  const message = typeof body?.message === 'string' ? body.message.trim() : '';

  if (name.length > 100 || email.length > 254) {
    return NextResponse.json({ ok: false, message: 'Please check the name and email length.' }, { status: 400 });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, message: 'Please enter a valid email address.' }, { status: 400 });
  }
  if (!CATEGORIES.has(category)) {
    return NextResponse.json({ ok: false, message: 'Please select a valid suggestion category.' }, { status: 400 });
  }
  if (message.length < 10 || message.length > 2000) {
    return NextResponse.json(
      { ok: false, message: 'Suggestions must be between 10 and 2,000 characters.' },
      { status: 400 }
    );
  }

  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, message: 'Suggestions are temporarily unavailable.' }, { status: 503 });
  }

  const { error } = await supabase.from('suggestions').insert({
    name: name || null,
    email: email || null,
    category,
    message,
  });

  if (error) {
    console.warn('Could not save public suggestion:', error.message);
    return NextResponse.json({ ok: false, message: 'Could not send your suggestion. Please try again.' }, { status: 500 });
  }

  return NextResponse.json(
    { ok: true, message: 'Thank you. Your suggestion has been sent to the NMS 08 administrators.' },
    { status: 201, headers: NO_CACHE }
  );
}
