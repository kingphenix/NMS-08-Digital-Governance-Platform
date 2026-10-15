import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

function sha256(str: string): string {
  return crypto.createHash('sha256').update(str.trim()).digest('hex');
}

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

    const identifier = typeof body?.identifier === 'string' ? body.identifier : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!identifier.trim() || !password) {
      return NextResponse.json(
        { ok: false, message: 'Please provide your NMS Number or Email and Password.' },
        { status: 400 }
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

    const id = identifier.trim();
    const isEmail = id.includes('@');
    const inputHash = sha256(password);
    const canonical = normalizeNms(id);

    let member: any = null;

    if (isEmail) {
      const { data } = await supabase
        .from('member_profiles')
        .select('*')
        .ilike('email', id)
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
          .ilike('nms_number', id)
          .maybeSingle();
        member = data;
      }

      // 3. Fallback to email search in case input didn't include '@'
      if (!member) {
        const { data } = await supabase
          .from('member_profiles')
          .select('*')
          .ilike('email', id)
          .maybeSingle();
        member = data;
      }
    }

    if (!member) {
      return NextResponse.json(
        { ok: false, message: 'No registered Ex-Boy profile found with this NMS number or email.' },
        { status: 401 }
      );
    }

    // Verify password hash
    if (!member.password_hash || member.password_hash !== inputHash) {
      return NextResponse.json(
        { ok: false, message: 'Incorrect password. Please verify your password and try again.' },
        { status: 401 }
      );
    }

    // Return authenticated profile
    return NextResponse.json({
      ok: true,
      message: 'Authentication successful',
      profile: {
        id: member.id,
        name: member.full_name,
        nmsNo: member.nms_number,
        full_name: member.full_name,
        nms_number: member.nms_number,
        company: member.company,
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
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json(
      { ok: false, message: 'We could not complete your sign in right now. Please try again in a moment.' },
      { status: 500 }
    );
  }
}
