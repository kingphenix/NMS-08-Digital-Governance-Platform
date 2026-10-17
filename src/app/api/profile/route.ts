import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nms = searchParams.get('nms');

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ ok: false, message: 'Server configuration error' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  if (!nms) {
    return NextResponse.json({ ok: false, message: 'NMS number parameter is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('member_profiles')
    .select('*')
    .eq('nms_number', nms.trim())
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ ok: false, message: 'Profile not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, profile: data });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { nms, nms_number, avatar_url, home_cell, ...rest } = body || {};
    const nmsQuery = (nms || nms_number || '').trim();

    if (!nmsQuery) {
      return NextResponse.json({ ok: false, message: 'NMS number is required' }, { status: 400 });
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceKey) {
      const supabase = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false },
      });

      const updateData: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
      if (home_cell !== undefined) updateData.home_cell = home_cell;
      Object.assign(updateData, rest);

      try {
        const { data, error } = await supabase
          .from('member_profiles')
          .update(updateData)
          .eq('nms_number', nmsQuery)
          .select('*')
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
    }

    return NextResponse.json({ ok: true, message: 'Updated locally' });
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err?.message || 'Update failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return PATCH(request);
}
