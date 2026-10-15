import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid request. Please try again.' }, { status: 400 });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      {
        ok: false,
        message:
          'Portal configuration error: the verification service is not configured on this build. Please contact the platform administrator.',
      },
      { status: 503 }
    );
  }

  const functionUrl = `${supabaseUrl.replace(/\/$/, '')}/functions/v1/register`;
  const effectiveKey = anonKey && anonKey.startsWith('eyJ') ? anonKey : serviceKey;

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
      data = { ok: false, message: rawText || 'Registration failed. Please try again.' };
    }

    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: 'Could not reach the verification service. Check your internet connection and try again.',
      },
      { status: 502 }
    );
  }
}

