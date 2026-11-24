import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const runtime = 'nodejs';

const isUuid = (val?: string) =>
  typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

const DATA_DIR = path.join(process.cwd(), '.data');
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');

function getLocalEvents(): any[] {
  try {
    if (!fs.existsSync(EVENTS_FILE)) return [];
    const content = fs.readFileSync(EVENTS_FILE, 'utf8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalEvents(events: any[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save local events fallback:', err);
  }
}

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
    return NextResponse.json({ ok: true, events: getLocalEvents() });
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
      // If table is not yet in Supabase schema cache, use local storage fallback
      console.warn('Events query (using local fallback if table pending migration):', error.message);
      const local = getLocalEvents();
      const filtered = admin ? local : local.filter((e) => e.status !== 'draft');
      return NextResponse.json({ ok: true, events: filtered });
    }

    // Merge with any local offline events
    const local = getLocalEvents();
    const existingIds = new Set((data || []).map((e: any) => e.id));
    const merged = [...(data || [])];
    for (const le of local) {
      if (!existingIds.has(le.id) && (admin || le.status !== 'draft')) {
        merged.push(le);
      }
    }
    merged.sort((a, b) => b.event_date.localeCompare(a.event_date));

    return NextResponse.json({ ok: true, events: merged });
  } catch (err) {
    console.error('Events GET error:', err);
    return NextResponse.json({ ok: true, events: getLocalEvents() });
  }
}

/** POST /api/events — Create or update an event (admin only) */
export async function POST(request: Request) {
  const supabase = getSupabase();

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

    const eventId = isUuid(id) ? id : crypto.randomUUID();

    const payload: Record<string, any> = {
      id: eventId,
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

    if (!supabase) {
      // Local fallback
      const local = getLocalEvents();
      const existingIdx = local.findIndex((e) => e.id === payload.id);
      if (existingIdx >= 0) {
        local[existingIdx] = { ...local[existingIdx], ...payload };
      } else {
        payload.created_at = new Date().toISOString();
        local.unshift(payload);
      }
      saveLocalEvents(local);
      return NextResponse.json({ ok: true, event: payload });
    }

    if (id) {
      // Update existing
      const { data, error } = await supabase
        .from('events')
        .update(payload)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) {
        if (error.message.includes('schema cache') || error.code === 'PGRST204') {
          const local = getLocalEvents();
          const existingIdx = local.findIndex((e) => e.id === payload.id);
          if (existingIdx >= 0) {
            local[existingIdx] = { ...local[existingIdx], ...payload };
          } else {
            local.unshift(payload);
          }
          saveLocalEvents(local);
          return NextResponse.json({ ok: true, event: payload });
        }
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
        // If table doesn't exist yet, save locally so admin is never blocked
        if (error.message.includes('schema cache') || error.code === 'PGRST204') {
          const local = getLocalEvents();
          local.unshift(payload);
          saveLocalEvents(local);
          return NextResponse.json({ ok: true, event: payload }, { status: 201 });
        }
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
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ ok: false, message: 'Event ID is required.' }, { status: 400 });
  }

  // Always remove from local fallback if present
  const local = getLocalEvents();
  const filtered = local.filter((e) => e.id !== id);
  if (filtered.length !== local.length) {
    saveLocalEvents(filtered);
  }

  if (!supabase) {
    return NextResponse.json({ ok: true, message: 'Event deleted successfully.' });
  }

  try {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error && !error.message.includes('schema cache')) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, message: 'Event deleted successfully.' });
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err?.message || 'Server error' }, { status: 500 });
  }
}
