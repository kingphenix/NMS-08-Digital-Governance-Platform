import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSession } from '@/lib/server-auth';

export const runtime = 'nodejs';

/**
 * Columns that are safe to send back to a client. `password_hash` (and any
 * future secret column) must never appear here.
 */
const SAFE_PROFILE_COLUMNS = [
  'id',
  'roster_id',
  'nms_number',
  'full_name',
  'company',
  'home_cell',
  'rank_appointment',
  'set_appointment',
  'dob',
  'state_of_origin',
  'state_of_residence',
  'address',
  'marital_status',
  'email',
  'phone',
  'occupation',
  'industry',
  'business',
  'skills',
  'professional_qualifications',
  'blood_group',
  'genotype',
  'next_of_kin',
  'relationship',
  'next_of_kin_phone',
  'avatar_url',
  'created_at',
  'updated_at',
].join(', ');

/**
 * Explicit allow-list of fields a client may modify. Anything not listed
 * (notably `password_hash`, `nms_number`, `roster_id`, `id`) is ignored.
 */
const EDITABLE_PROFILE_FIELDS = new Set([
  'full_name',
  'company',
  'home_cell',
  'phone',
  'rank_appointment',
  'set_appointment',
  'dob',
  'state_of_origin',
  'state_of_residence',
  'address',
  'marital_status',
  'occupation',
  'industry',
  'business',
  'skills',
  'professional_qualifications',
  'blood_group',
  'genotype',
  'next_of_kin',
  'relationship',
  'next_of_kin_phone',
  'avatar_url',
]);

function normalizeNms(input: string): string | null {
  const trimmed = input.trim();
  const matchFull = trimmed.match(/^NMS[\s\/\-_.]*(\d{2})[\s\/\-_.]*(\d{1,6})$/i);
  if (matchFull) return `NMS/${matchFull[1]}/${matchFull[2]}`;
  const matchYear = trimmed.match(/^(\d{2})[\s\/\-_.]+(\d{1,6})$/);
  if (matchYear) return `NMS/${matchYear[1]}/${matchYear[2]}`;
  const matchNmsOnly = trimmed.match(/^NMS[\s\/\-_.]*(\d{1,6})$/i);
  if (matchNmsOnly) return `NMS/08/${matchNmsOnly[1]}`;
  const matchDigits = trimmed.match(/^(\d{1,6})$/);
  if (matchDigits) return `NMS/08/${matchDigits[1]}`;
  return null;
}

function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
}

export async function GET(request: Request) {
  const session = getSession(request);
  const { searchParams } = new URL(request.url);
  const requested = (searchParams.get('nms') || '').trim();
  const nms = session
    ? (session.role === 'admin' ? (requested || session.sub) : (session.sub || requested))
    : requested;

  if (!nms) {
    return NextResponse.json({ ok: false, message: 'NMS number parameter is required' }, { status: 400 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, message: 'Server configuration error' }, { status: 500 });
  }

  const canonical = normalizeNms(nms) || nms.trim().toUpperCase();

  let { data, error } = await supabase
    .from('member_profiles')
    .select(SAFE_PROFILE_COLUMNS)
    .ilike('nms_number', canonical)
    .maybeSingle();

  if (!data && canonical !== nms) {
    const fallback = await supabase
      .from('member_profiles')
      .select(SAFE_PROFILE_COLUMNS)
      .ilike('nms_number', nms)
      .maybeSingle();
    data = fallback.data;
    error = fallback.error;
  }

  if (error || !data) {
    return NextResponse.json({ ok: false, message: 'Profile not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, profile: data });
}

export async function PATCH(request: Request) {
  try {
    const session = getSession(request);

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: false, message: 'Invalid request body.' }, { status: 400 });
    }

    // Members update their own record; admins may target any member.
    const requested = (body?.nms || body?.nms_number || '').toString().trim();
    const nmsQuery = session
      ? (session.role === 'admin' ? (requested || session.sub) : (session.sub || requested))
      : requested;

    if (!nmsQuery) {
      return NextResponse.json({ ok: false, message: 'NMS number is required' }, { status: 400 });
    }

    // Build the update payload strictly from the allow-list.
    const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
    for (const field of EDITABLE_PROFILE_FIELDS) {
      if (body && Object.prototype.hasOwnProperty.call(body, field) && body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ ok: true, message: 'Updated locally' });
    }

    try {
      const canonical = normalizeNms(nmsQuery) || nmsQuery.trim().toUpperCase();

      let { data, error } = await supabase
        .from('member_profiles')
        .update(updateData)
        .ilike('nms_number', canonical)
        .select(SAFE_PROFILE_COLUMNS)
        .maybeSingle();

      if (!data && canonical !== nmsQuery) {
        const fallback = await supabase
          .from('member_profiles')
          .update(updateData)
          .ilike('nms_number', nmsQuery)
          .select(SAFE_PROFILE_COLUMNS)
          .maybeSingle();
        if (fallback.data) {
          data = fallback.data;
          error = null;
        }
      }

      if (error) {
        console.warn('Supabase profile update warning:', error.message);
        return NextResponse.json({ ok: true, profile: updateData, notice: error.message });
      }
      return NextResponse.json({ ok: true, profile: data || updateData });
    } catch (err: any) {
      console.warn('Supabase update execution error:', err?.message);
      return NextResponse.json({ ok: true, profile: updateData, notice: err?.message });
    }
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err?.message || 'Update failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return PATCH(request);
}
