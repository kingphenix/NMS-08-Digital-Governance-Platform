import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/server-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_CACHE = { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' };
const STATUSES = new Set(['new', 'reviewed', 'resolved']);

function getServiceClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET(request: Request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ ok: false, message: 'Administrator authentication required.' }, { status: 401 });
  }

  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, message: 'Suggestions are temporarily unavailable.' }, { status: 503 });
  }

  const { data, error } = await supabase
    .from('suggestions')
    .select('id, name, email, category, message, status, created_at, reviewed_at')
    .order('created_at', { ascending: false })
    .limit(250);

  if (error) {
    console.warn('Could not load admin suggestions:', error.message);
    return NextResponse.json({ ok: false, message: 'Could not load suggestions.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, suggestions: data || [] }, { headers: NO_CACHE });
}

export async function PATCH(request: Request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ ok: false, message: 'Administrator authentication required.' }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid request body.' }, { status: 400 });
  }

  const id = typeof body?.id === 'string' ? body.id.trim() : '';
  const status = typeof body?.status === 'string' ? body.status : '';
  if (!/^[0-9a-f-]{36}$/i.test(id) || !STATUSES.has(status)) {
    return NextResponse.json({ ok: false, message: 'Choose a valid suggestion and status.' }, { status: 400 });
  }

  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, message: 'Suggestions are temporarily unavailable.' }, { status: 503 });
  }

  const { error } = await supabase
    .from('suggestions')
    .update({
      status,
      reviewed_at: status === 'new' ? null : new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.warn('Could not update suggestion status:', error.message);
    return NextResponse.json({ ok: false, message: 'Could not update this suggestion.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { headers: NO_CACHE });
}
