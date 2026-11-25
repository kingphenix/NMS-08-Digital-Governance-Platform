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
const DELETED_EVENTS_FILE = path.join(DATA_DIR, 'deleted_events.json');

const STATIC_SEED_EVENTS = [
  {
    id: 'wed-2026-11-14-oifoh',
    title: 'ASP Oifoh David Okaka weds Blessing Anjolaoluwa Koleoso',
    description: 'Wedding Fatiha & Solemnization of ASP Oifoh David Okaka and Blessing Anjolaoluwa Koleoso.',
    event_date: '2026-11-14',
    event_time: '10:00 AM',
    location: 'Abuja, Nigeria',
    category: 'Wedding',
    image_url: null,
    flyer_static_id: 'wed-2026-11-14-oifoh',
    organizer: 'NMS 08 Brotherhood',
    is_featured: false,
    status: 'published',
  },
  {
    id: 'wed-2026-11-21-queen',
    title: 'Queen Asam weds Hope Douglas',
    description: 'Solemnization of holy matrimony between Queen Asam and Hope Douglas.',
    event_date: '2026-11-21',
    event_time: '10:00 AM',
    location: 'Nigeria',
    category: 'Wedding',
    image_url: null,
    flyer_static_id: 'wed-2026-11-21-queen',
    organizer: 'NMS 08 Brotherhood',
    is_featured: false,
    status: 'published',
  },
  {
    id: 'wed-2026-11-27-rilwan',
    title: 'Rilwan Haliru Tambuwal weds Sadiya Abbakar Zaki Tambuwal',
    description: 'Wedding ceremony for Rilwan Haliru Tambuwal and Sadiya Abbakar Zaki Tambuwal.',
    event_date: '2026-11-27',
    event_time: '10:00 AM',
    location: 'Tambuwal, Sokoto State',
    category: 'Wedding',
    image_url: null,
    flyer_static_id: 'wed-2026-11-27-rilwan',
    organizer: 'NMS 08 Brotherhood',
    is_featured: false,
    status: 'published',
  },
  {
    id: 'wed-2026-12-18-farouq',
    title: 'Farouq Haruna weds Bar. Maryam Sani Ahmad',
    description: 'Wedding Fatiha of Farouq Haruna and Bar. Maryam Sani Ahmad.',
    event_date: '2026-12-18',
    event_time: '10:00 AM',
    location: 'Kano State, Nigeria',
    category: 'Wedding',
    image_url: null,
    flyer_static_id: 'wed-2026-12-18-farouq',
    organizer: 'NMS 08 Brotherhood',
    is_featured: false,
    status: 'published',
  },
  {
    id: 'wed-2026-12-25-imrana',
    title: 'LT. Imrana Aminu Mani weds Khadija Aminu Muhammad',
    description: 'Wedding ceremony of LT. Imrana Aminu Mani and Khadija Aminu Muhammad.',
    event_date: '2026-12-25',
    event_time: '10:00 AM',
    location: 'Katsina State, Nigeria',
    category: 'Wedding',
    image_url: null,
    flyer_static_id: 'wed-2026-12-25-imrana',
    organizer: 'NMS 08 Brotherhood',
    is_featured: false,
    status: 'published',
  },
];

function getDeletedEventIds(): Set<string> {
  try {
    if (!fs.existsSync(DELETED_EVENTS_FILE)) return new Set();
    const content = fs.readFileSync(DELETED_EVENTS_FILE, 'utf8');
    const parsed = JSON.parse(content);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function saveDeletedEventId(id: string): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const set = getDeletedEventIds();
    set.add(id);
    fs.writeFileSync(DELETED_EVENTS_FILE, JSON.stringify(Array.from(set), null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save deleted event ID:', err);
  }
}

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
  const deletedIds = getDeletedEventIds();

  const filterDeleted = (list: any[]) => list.filter((e) => !deletedIds.has(e.id));

  if (!supabase) {
    const local = filterDeleted(getLocalEvents());
    const existingIds = new Set(local.map((e: any) => e.id));
    const merged = [...local];
    for (const seed of STATIC_SEED_EVENTS) {
      if (!deletedIds.has(seed.id) && !existingIds.has(seed.id)) {
        merged.push(seed);
      }
    }
    merged.sort((a, b) => b.event_date.localeCompare(a.event_date));
    return NextResponse.json({ ok: true, events: admin ? merged : merged.filter((e) => e.status !== 'draft') });
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

    let baseList = data && !error ? data : [];
    if (error) {
      console.warn('Events query (using local fallback if table pending migration):', error.message);
      baseList = getLocalEvents();
    }

    const existingIds = new Set(baseList.map((e: any) => e.id));
    const merged = [...baseList];

    // Merge with any local offline events
    const local = getLocalEvents();
    for (const le of local) {
      if (!existingIds.has(le.id) && (admin || le.status !== 'draft')) {
        merged.push(le);
        existingIds.add(le.id);
      }
    }

    // Merge static seed events (weddings, etc.) unless deleted
    for (const seed of STATIC_SEED_EVENTS) {
      if (!deletedIds.has(seed.id) && !existingIds.has(seed.id)) {
        merged.push(seed);
        existingIds.add(seed.id);
      }
    }

    const finalEvents = filterDeleted(merged);
    finalEvents.sort((a, b) => (b.event_date || '').localeCompare(a.event_date || ''));

    return NextResponse.json({ ok: true, events: finalEvents });
  } catch (err) {
    console.error('Events GET error:', err);
    const local = filterDeleted(getLocalEvents());
    return NextResponse.json({ ok: true, events: local });
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

  // Always register as deleted so static events and offline events are removed
  saveDeletedEventId(id);

  // Remove from local fallback if present
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
      console.warn('Database event delete notice:', error.message);
    }
    return NextResponse.json({ ok: true, message: 'Event deleted successfully.' });
  } catch (err: any) {
    console.warn('Events delete error:', err?.message || err);
    return NextResponse.json({ ok: true, message: 'Event deleted successfully.' });
  }
}
