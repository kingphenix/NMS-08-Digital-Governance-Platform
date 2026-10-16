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
