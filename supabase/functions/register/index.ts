import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });

const FAIL = {
  ok: false,
  message: "We couldn't verify those details. Check your NMS number and full name, or contact the electoral committee.",
};

const toTokens = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z\s]/g, ' ')
    .split(/\s+/).filter(Boolean);

// Canonical form: NMS/08/6672. Returns null if the input cannot be read as an NMS number.
// Keep this function IDENTICAL in scripts/import-roster.mjs and the Edge Function.
const normNms = (s: string): string | null => {
  const m = s.trim().match(/^NMS[\s\/\-_.]*(\d{2})[\s\/\-_.]*(\d{1,6})$/i);
  return m ? `NMS/${m[1]}/${m[2]}` : null;
};

function makeCode(len = 6) {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
}

async function sha256(text: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const {
      nms_number,
      full_name,
      company,
      rank_appointment,
      set_appointment,
      dob,
      state_of_origin,
      state_of_residence,
      address,
      marital_status,
      email,
      phone,
      occupation,
      industry,
      business,
      skills,
      professional_qualifications,
      blood_group,
      genotype,
      next_of_kin,
      relationship,
      next_of_kin_phone,
      password,
    } = body;

    const ip =
      req.headers.get('cf-connecting-ip') ??
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      'unknown';

    // Rate limit: count rows in registration_attempts for this IP in the last 15 minutes.
    const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('registration_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('ip', ip)
      .gte('created_at', since);

    if ((count ?? 0) >= 8) {
      return json({ ok: false, message: 'Too many attempts. Try again in 15 minutes.' }, 429);
    }

    const log = async (success: boolean, nmsLogged?: string | null) => {
      try {
        await supabase.from('registration_attempts').insert({
          ip,
          nms_number: nmsLogged !== undefined ? nmsLogged : (typeof nms_number === 'string' ? nms_number.slice(0, 50) : null),
          success,
        });
      } catch {
        // Non-blocking
      }
    };

    if (!nms_number || !full_name || typeof nms_number !== 'string' || typeof full_name !== 'string') {
      await log(false);
      return json(FAIL, 400);
    }

    const nms = normNms(nms_number);
    if (!nms) {
      await log(false, nms_number.slice(0, 50));
      return json(FAIL, 400);
    }

    const { data: row } = await supabase
      .from('roster')
      .select('id, full_name, name_tokens, registered')
      .eq('nms_number', nms)
      .maybeSingle();

    const typed = toTokens(full_name);
    const rosterTokens: string[] = row?.name_tokens ?? [];
    const nameOk = typed.length >= 2 && typed.every((t) => rosterTokens.includes(t));

    if (!row || !nameOk) {
      await log(false, nms);
      return json(FAIL, 400);
    }

    const { data: claimed } = await supabase
      .from('roster')
      .update({ registered: true, registered_at: new Date().toISOString() })
      .eq('id', row.id)
      .eq('registered', false)
      .select('id')
      .maybeSingle();

    if (!claimed) {
      await log(false, nms);
      return json({
        ok: false,
        message: 'This NMS number has already registered. If you lost your code, contact the electoral committee.',
      }, 409);
    }

    // Upsert full member profile
    try {
      const passwordHash =
        typeof password === 'string' && password.trim().length >= 6
          ? await sha256(password.trim())
          : null;

      const profilePayload: Record<string, unknown> = {
        roster_id: row.id,
        nms_number: nms,
        full_name: typeof full_name === 'string' ? full_name.trim() : row.full_name,
        company: typeof company === 'string' ? company.trim() : null,
        rank_appointment: typeof rank_appointment === 'string' ? rank_appointment.trim() : null,
        set_appointment: typeof set_appointment === 'string' ? set_appointment.trim() : null,
        dob: typeof dob === 'string' ? dob.trim() : null,
        state_of_origin: typeof state_of_origin === 'string' ? state_of_origin.trim() : null,
        state_of_residence: typeof state_of_residence === 'string' ? state_of_residence.trim() : null,
        address: typeof address === 'string' ? address.trim() : null,
        marital_status: typeof marital_status === 'string' ? marital_status.trim() : null,
        email: typeof email === 'string' ? email.trim() : null,
        phone: typeof phone === 'string' ? phone.trim() : null,
        occupation: typeof occupation === 'string' ? occupation.trim() : null,
        industry: typeof industry === 'string' ? industry.trim() : null,
        business: typeof business === 'string' ? business.trim() : null,
        skills: typeof skills === 'string' ? skills.trim() : null,
        professional_qualifications: typeof professional_qualifications === 'string' ? professional_qualifications.trim() : null,
        blood_group: typeof blood_group === 'string' ? blood_group.trim() : null,
        genotype: typeof genotype === 'string' ? genotype.trim() : null,
        next_of_kin: typeof next_of_kin === 'string' ? next_of_kin.trim() : null,
        relationship: typeof relationship === 'string' ? relationship.trim() : null,
        next_of_kin_phone: typeof next_of_kin_phone === 'string' ? next_of_kin_phone.trim() : null,
        updated_at: new Date().toISOString(),
      };

      if (passwordHash) {
        profilePayload.password_hash = passwordHash;
      }

      await supabase.from('member_profiles').upsert(profilePayload, { onConflict: 'roster_id' });
    } catch (upsertErr) {
      console.error('Member profile upsert error:', upsertErr);
    }

    const code = makeCode();
    const { error } = await supabase
      .from('voters')
      .insert({ roster_id: row.id, code_hash: await sha256(code) });

    if (error) {
      await supabase.from('roster').update({ registered: false, registered_at: null }).eq('id', row.id);
      try {
        await supabase.from('member_profiles').delete().eq('roster_id', row.id);
      } catch {
        // Non-blocking
      }
      await log(false, nms);
      return json({ ok: false, message: 'Something went wrong. Please try again.' }, 500);
    }

    await log(true, nms);
    return json({ ok: true, code });
  } catch (err) {
    console.error('Unhandled register error:', err);
    return json({ ok: false, message: 'Something went wrong. Please try again.' }, 500);
  }
});
