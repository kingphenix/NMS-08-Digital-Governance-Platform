import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { hashPassword, needsRehash, verifyPassword } from '@/lib/password';
import { attachSession, getClientIp, rateLimit } from '@/lib/server-auth';

export const runtime = 'nodejs';

const GENERIC_AUTH_ERROR = 'Incorrect NMS number/email or password. Please try again.';

function normalizeNms(input: string): string | null {
  const trimmed = input.trim();
  // Format: NMS/08/6672, NMS 08 6672, nms-08-6672, etc.
  const matchFull = trimmed.match(/^NMS[\s\/\-_.]*(\d{2})[\s\/\-_.]*(\d{1,6})$/i);
  if (matchFull) {
    return `NMS/${matchFull[1]}/${matchFull[2]}`;
  }
  // Format: 08/6672, 08-6672, 08 6672
  const matchYear = trimmed.match(/^(\d{2})[\s\/\-_.]+(\d{1,6})$/);
  if (matchYear) {
    return `NMS/${matchYear[1]}/${matchYear[2]}`;
  }
  // Format: NMS 6672, NMS/6672, nms-6672
  const matchNmsOnly = trimmed.match(/^NMS[\s\/\-_.]*(\d{1,6})$/i);
  if (matchNmsOnly) {
    return `NMS/08/${matchNmsOnly[1]}`;
  }
  // Format: 6672 (just digits)
  const matchDigits = trimmed.match(/^(\d{1,6})$/);
  if (matchDigits) {
    return `NMS/08/${matchDigits[1]}`;
  }
  return null;
}

export async function POST(request: Request) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, message: 'Invalid request. Please try again.' },
        { status: 400 }
      );
    }

    const identifier = typeof body?.identifier === 'string' ? body.identifier.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!identifier || !password) {
      return NextResponse.json(
        { ok: false, message: 'Please provide your NMS Number or Email and Password.' },
        { status: 400 }
      );
    }

    // Throttle brute-force attempts by client IP and by targeted account.
    const ip = getClientIp(request);
    const ipLimit = rateLimit(`login:ip:${ip}`, 20, 15 * 60 * 1000);
    const idLimit = rateLimit(`login:id:${identifier.toLowerCase()}`, 8, 15 * 60 * 1000);
    if (!ipLimit.ok || !idLimit.ok) {
      const retryAfter = Math.max(ipLimit.retryAfter, idLimit.retryAfter);
      return NextResponse.json(
        { ok: false, message: `Too many sign-in attempts. Please try again in ${retryAfter} seconds.` },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { ok: false, message: 'Sign in is temporarily unavailable. Please contact the platform administrator.' },
        { status: 503 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const isEmail = identifier.includes('@');
    const canonical = normalizeNms(identifier);

    let member: any = null;

    if (isEmail) {
      const { data } = await supabase
        .from('member_profiles')
        .select('*')
        .ilike('email', identifier)
        .maybeSingle();
      member = data;
    } else {
      // 1. Try canonical NMS format (e.g. NMS/08/6672)
      if (canonical) {
        const { data } = await supabase
          .from('member_profiles')
          .select('*')
          .eq('nms_number', canonical)
          .maybeSingle();
        member = data;
      }

      // 2. Try direct match on raw input
      if (!member) {
        const { data } = await supabase
          .from('member_profiles')
          .select('*')
          .ilike('nms_number', identifier)
          .maybeSingle();
        member = data;
      }

      // 3. Fallback to email search in case input didn't include '@'
      if (!member) {
        const { data } = await supabase
          .from('member_profiles')
          .select('*')
          .ilike('email', identifier)
          .maybeSingle();
        member = data;
      }
    }

    // Use a single generic message so attackers cannot enumerate valid accounts.
    if (!member || !verifyPassword(password, member.password_hash)) {
      return NextResponse.json({ ok: false, message: GENERIC_AUTH_ERROR }, { status: 401 });
    }

    // Transparently upgrade legacy unsalted hashes to scrypt.
    if (needsRehash(member.password_hash)) {
      try {
        await supabase
          .from('member_profiles')
          .update({ password_hash: hashPassword(password) })
          .eq('id', member.id);
      } catch {
        // Non-fatal: sign-in still succeeds, upgrade retried next time.
      }
    }

    const response = NextResponse.json({
      ok: true,
      message: 'Authentication successful',
      profile: {
        id: member.id,
        name: member.full_name,
        nmsNo: member.nms_number,
        full_name: member.full_name,
        nms_number: member.nms_number,
        company: member.company,
        avatar_url: member.avatar_url || '',
        avatarUrl: member.avatar_url || '',
        home_cell: member.home_cell || '',
        homeCell: member.home_cell || '',
        rank_appointment: member.rank_appointment,
        rankAppointment: member.rank_appointment,
        set_appointment: member.set_appointment,
        setAppointment: member.set_appointment,
        dob: member.dob,
        state_of_origin: member.state_of_origin,
        stateOfOrigin: member.state_of_origin,
        state_of_residence: member.state_of_residence,
        stateOfResidence: member.state_of_residence,
        address: member.address,
        marital_status: member.marital_status,
        maritalStatus: member.marital_status,
        email: member.email,
        phone: member.phone,
        occupation: member.occupation,
        industry: member.industry,
        business: member.business,
        skills: member.skills,
        professional_qualifications: member.professional_qualifications,
        professionalQualifications: member.professional_qualifications,
        blood_group: member.blood_group,
        bloodGroup: member.blood_group,
        genotype: member.genotype,
        next_of_kin: member.next_of_kin,
        nextOfKin: member.next_of_kin,
        relationship: member.relationship,
        next_of_kin_phone: member.next_of_kin_phone,
        nextOfKinPhone: member.next_of_kin_phone,
      },
    });

    return attachSession(response, {
      sub: member.nms_number,
      role: 'member',
      name: member.full_name,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json(
      { ok: false, message: 'We could not complete your sign in right now. Please try again in a moment.' },
      { status: 500 }
    );
  }
}
