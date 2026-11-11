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

function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
}

export async function GET(request: Request) {
  const session = getSession(request);
  if (!session) {
    return NextResponse.json({ ok: false, message: 'Authentication required.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  // Members may only ever read their own profile; admins can look up any member.
  const requested = (searchParams.get('nms') || '').trim();
  const nms = session.role === 'admin' ? requested : session.sub;

  if (!nms) {
    return NextResponse.json({ ok: false, message: 'NMS number parameter is required' }, { status: 400 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, message: 'Server configuration error' }, { status: 500 });
  }

  const { data, error } = await supabase
    .from('member_profiles')
    .select(SAFE_PROFILE_COLUMNS)
    .eq('nms_number', nms)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ ok: false, message: 'Profile not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, profile: data });
}

export async function PATCH(request: Request) {
  try {
    const session = getSession(request);
    if (!session) {
      return NextResponse.json({ ok: false, message: 'Authentication required.' }, { status: 401 });
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: false, message: 'Invalid request body.' }, { status: 400 });
    }

    // Members can only update their own record; admins may target any member.
    const requested = (body?.nms || body?.nms_number || '').toString().trim();
    const nmsQuery = session.role === 'admin' ? requested : session.sub;

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
      const { data, error } = await supabase
        .from('member_profiles')
        .update(updateData)
        .eq('nms_number', nmsQuery)
        .select(SAFE_PROFILE_COLUMNS)
        .maybeSingle();

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
