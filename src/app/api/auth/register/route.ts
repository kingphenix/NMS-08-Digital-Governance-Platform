import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { hashPassword } from '@/lib/password';
import { rateLimit } from '@/lib/server-auth';

export const runtime = 'nodejs';

const FAIL_MESSAGE =
  "We couldn't verify those details. Check your NMS number and full name, or contact the electoral committee.";

const ALREADY_REGISTERED_MESSAGE =
  'This NMS number has already registered. If you believe this is an error, contact the electoral committee.';

const normNms = (s: string): string | null => {
  if (!s || typeof s !== 'string') return null;
  const m = s.trim().match(/^NMS[\s\/\-_.]*(\d{2})[\s\/\-_.]*(\d{1,6})$/i);
  return m ? `NMS/${m[1]}/${m[2]}` : null;
};

const toTokens = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

export async function POST(request: Request) {
  let body: any = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid request. Please try again.' }, { status: 400 });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  const isLikelyJwt = (v?: string) => typeof v === 'string' && v.startsWith('eyJ') && v.length > 40;
  const hasValidAnon = isLikelyJwt(anonKey);
  const hasValidService = isLikelyJwt(serviceKey);
  const effectiveKey = hasValidAnon ? anonKey! : hasValidService ? serviceKey! : null;

  if (!supabaseUrl || !effectiveKey) {
    return NextResponse.json(
      {
        ok: false,
        message:
          'Portal configuration error: the verification service is not configured on this build. Please contact the platform administrator.',
      },
      { status: 503 }
    );
  }

  // 1. First attempt registration via Supabase Edge Function
  const functionUrl = `${supabaseUrl.replace(/\/$/, '')}/functions/v1/register`;
  const forwardedFor =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip');

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      apikey: effectiveKey,
      Authorization: `Bearer ${effectiveKey}`,
    };
    if (forwardedFor) {
      headers['x-forwarded-for'] = forwardedFor;
    }

    const res = await fetch(functionUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body ?? {}),
    });

    const rawText = await res.text();
    let data: any = null;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = null;
    }

    if (res.ok && data?.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    // If the edge function explicitly rejected the attempt, propagate the
    // decision instead of retrying it through the direct-database path (which
    // would otherwise bypass the edge function's rate limiter).
    if (
      res.status === 409 ||
      res.status === 429 ||
      (res.status === 400 && data?.message?.includes("couldn't verify"))
    ) {
      return NextResponse.json(data || { ok: false, message: 'Registration rejected.' }, { status: res.status });
    }
  } catch (err) {
    console.warn('Edge function invoke failed, falling back to direct database registration:', err);
  }

  // 2. Direct database registration fallback (using service role key)
  if (serviceKey) {
    try {
      const supabase = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false },
      });

      const rawNms = body?.nms_number || body?.nmsNo || '';
      const canonicalNms = normNms(rawNms) || rawNms;
      const fullName = (body?.full_name || body?.name || '').trim();

      if (!canonicalNms || !fullName) {
        return NextResponse.json(
          { ok: false, message: 'Please provide both your NMS number and full name.' },
          { status: 400 }
        );
      }

      // This fallback never goes through the Edge Function's limiter, so it needs
      // its own guard.
      const ip = forwardedFor?.split(',')[0]?.trim() || 'unknown';
      const limited = rateLimit(`register:${ip}`, 8, 15 * 60 * 1000);
      if (!limited.ok) {
        return NextResponse.json(
          { ok: false, message: 'Too many attempts. Try again in 15 minutes.' },
          { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } }
        );
      }

      // The roster row is the authority on who may register.
      const { data: rosterRow } = await supabase
        .from('roster')
        .select('id, full_name, name_tokens, registered')
        .ilike('nms_number', canonicalNms)
        .maybeSingle();

      if (!rosterRow) {
        return NextResponse.json({ ok: false, message: FAIL_MESSAGE }, { status: 400 });
      }

      // Verify the claimed name against the roster name tokens, exactly as the
      // Edge Function does. Without this, anyone who knows a member's NMS number
      // could claim that identity and overwrite the account's password.
      const typed = toTokens(fullName);
      const rosterTokens: string[] = rosterRow.name_tokens ?? [];
      if (typed.length < 2 || !typed.every((t) => rosterTokens.includes(t))) {
        return NextResponse.json({ ok: false, message: FAIL_MESSAGE }, { status: 400 });
      }

      if (rosterRow.registered) {
        return NextResponse.json({ ok: false, message: ALREADY_REGISTERED_MESSAGE }, { status: 409 });
      }

      // Claim the roster row atomically so concurrent registrations cannot both
      // succeed and clobber each other's profile.
      const { data: claimed } = await supabase
        .from('roster')
        .update({ registered: true, registered_at: new Date().toISOString() })
        .eq('id', rosterRow.id)
        .eq('registered', false)
        .select('id')
        .maybeSingle();

      if (!claimed) {
        return NextResponse.json({ ok: false, message: ALREADY_REGISTERED_MESSAGE }, { status: 409 });
      }

      // Upsert into member_profiles — only reachable for a freshly claimed roster row.
      const password = body?.password ? body.password.toString().trim() : '';
      const passwordHash = password.length >= 6 ? hashPassword(password) : null;

      const profilePayload: Record<string, any> = {
        roster_id: rosterRow.id,
        nms_number: canonicalNms,
        full_name: fullName,
        company: body?.company || 'Unassigned',
        home_cell: body?.home_cell || body?.homeCell || '',
        state_of_origin: body?.state_of_origin || body?.stateOfOrigin || '',
        state_of_residence: body?.state_of_residence || body?.stateOfResidence || '',
        address: body?.address || '',
        phone: body?.phone || '',
        email: body?.email || '',
        occupation: body?.occupation || '',
        industry: body?.industry || '',
        business: body?.business || '',
        skills: body?.skills || '',
        professional_qualifications: body?.professional_qualifications || body?.professionalQualifications || '',
        blood_group: body?.blood_group || body?.bloodGroup || '',
        genotype: body?.genotype || '',
        next_of_kin: body?.next_of_kin || body?.nextOfKin || '',
        relationship: body?.relationship || '',
        next_of_kin_phone: body?.next_of_kin_phone || body?.nextOfKinPhone || '',
        updated_at: new Date().toISOString(),
      };

      if (passwordHash) {
        profilePayload.password_hash = passwordHash;
      }

      await supabase.from('member_profiles').upsert(profilePayload, {
        onConflict: 'roster_id',
      });

      return NextResponse.json({ ok: true, message: 'Registration successful.' });
    } catch (dbErr: any) {
      console.error('Direct database registration fallback error:', dbErr);
      return NextResponse.json(
        { ok: false, message: dbErr?.message || 'Failed to complete registration.' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    {
      ok: false,
      message: 'Could not reach the verification service. Check your internet connection and try again.',
    },
    { status: 502 }
  );
}
