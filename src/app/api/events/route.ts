import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

/** GET /api/events — List all events (ordered by event_date desc) */
export async function GET(request: Request) {
  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const admin = searchParams.get('admin') === 'true';

  if (!supabase) {
    return NextResponse.json({ ok: true, events: [] });
  }

  try {
    let query = supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: false });

    if (!admin) {
      query = query.eq('status', 'published');
    }

    const { data, error } = await query;

    if (error) {
      console.warn('Events query warning (table may be pending migration):', error.message);
      return NextResponse.json({ ok: true, events: [] });
    }

    return NextResponse.json({ ok: true, events: data || [] });
  } catch (err) {
    console.error('Events GET error:', err);
    return NextResponse.json({ ok: true, events: [] });
  }
}

/** POST /api/events — Create or update an event (admin only) */
export async function POST(request: Request) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, message: 'Database service unavailable' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const {
      id,
      title,
      description,
      event_date,
      event_time,
      location,
      category,
      image_url,
      organizer,
      is_featured,
      status,
    } = body;

    if (!title?.trim() || !event_date) {
      return NextResponse.json(
        { ok: false, message: 'Event title and date are required.' },
        { status: 400 }
      );
    }

    const payload: Record<string, any> = {
      title: title.trim(),
      description: description?.trim() || '',
      event_date,
      event_time: event_time?.trim() || '',
      location: location?.trim() || '',
      category: category || 'General',
      image_url: image_url || null,
      organizer: organizer?.trim() || 'NMS 08 Executive Council',
      is_featured: Boolean(is_featured),
      status: status || 'published',
      updated_at: new Date().toISOString(),
    };

    if (id) {
      // Update existing
      const { data, error } = await supabase
        .from('events')
        .update(payload)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) {
        return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
      }

      return NextResponse.json({ ok: true, event: data });
    } else {
      // Create new
      payload.created_at = new Date().toISOString();
      const { data, error } = await supabase
        .from('events')
        .insert(payload)
        .select()
        .maybeSingle();

      if (error) {
        return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
      }

      return NextResponse.json({ ok: true, event: data }, { status: 201 });
    }
  } catch (err: any) {
    console.error('Events POST error:', err);
    return NextResponse.json({ ok: false, message: err?.message || 'Server error' }, { status: 500 });
  }
}

/** DELETE /api/events?id=... — Delete an event (admin only) */
export async function DELETE(request: Request) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, message: 'Database service unavailable' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ ok: false, message: 'Event ID is required.' }, { status: 400 });
  }

  try {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, message: 'Event deleted successfully.' });
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err?.message || 'Server error' }, { status: 500 });
  }
}
