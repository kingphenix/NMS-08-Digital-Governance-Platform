import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendBirthdayEmail } from '@/lib/email';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DATA_DIR = path.join(process.cwd(), '.data');
const LOGS_FILE = path.join(DATA_DIR, 'birthday_dispatch_logs.json');

interface DispatchLog {
  date: string;
  nms_number: string;
  email: string;
  full_name: string;
  sent_at: string;
  status: 'sent' | 'failed';
  error?: string;
}

function getLocalLogs(): DispatchLog[] {
  try {
    if (!fs.existsSync(LOGS_FILE)) return [];
    return JSON.parse(fs.readFileSync(LOGS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveLocalLogs(logs: DispatchLog[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2), 'utf8');
  } catch {
    // best-effort — do not crash the route
  }
}

function matchMonthDay(dob?: string | null, month?: string, day?: string): boolean {
  if (!dob || !month || !day) return false;
  const clean = dob.trim();
  if (clean.includes('-')) {
    const parts = clean.split('-');
    if (parts.length === 3) {
      // YYYY-MM-DD  or  DD-MM-YYYY
      const [a, b, c] = parts;
      if (a.length === 4) {
        // YYYY-MM-DD
        return b.padStart(2, '0') === month && c.slice(0, 2).padStart(2, '0') === day;
      }
      // DD-MM-YYYY
      return b.padStart(2, '0') === month && a.padStart(2, '0') === day;
    }
    if (parts.length === 2) {
      // MM-DD
      const [m, d] = parts;
      return m.padStart(2, '0') === month && d.padStart(2, '0') === day;
    }
  } else if (clean.includes('/')) {
    const parts = clean.split('/');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY/MM/DD
        return parts[1].padStart(2, '0') === month && parts[2].slice(0, 2).padStart(2, '0') === day;
      }
      // DD/MM/YYYY
      return parts[1].padStart(2, '0') === month && parts[0].padStart(2, '0') === day;
    }
  }
  return false;
}

async function handleBirthdayDispatch(req: Request) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const { searchParams } = new URL(req.url);
  const secretQuery = searchParams.get('secret') || searchParams.get('key');
  const isForce = searchParams.get('force') === 'true';

  // Allow: valid bearer token, matching query secret, or admin=true flag
  const isAuthorized =
    !cronSecret ||
    authHeader === `Bearer ${cronSecret}` ||
    secretQuery === cronSecret ||
    searchParams.get('admin') === 'true';

  if (!isAuthorized) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ ok: false, message: 'DB not configured' }, { status: 500 });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabase
      .from('member_profiles')
      .select('id, nms_number, full_name, company, email, dob');

    if (error || !data) {
      return NextResponse.json(
        { ok: false, message: error?.message || 'DB error' },
        { status: 500 }
      );
    }

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const celebrants = (data as Array<{
      id: string;
      nms_number: string;
      full_name: string;
      company: string;
      email: string;
      dob: string;
    }>).filter(
      (m) => m.dob && matchMonthDay(m.dob, month, day) && m.email?.includes('@')
    );

    const logs = getLocalLogs();
    const results: Array<{
      member: string;
      email: string;
      status: string;
      reason?: string;
      error?: string;
    }> = [];

    for (const member of celebrants) {
      const alreadySent =
        !isForce &&
        logs.some(
          (l) =>
            l.date === todayStr &&
            (l.nms_number === member.nms_number || l.email === member.email) &&
            l.status === 'sent'
        );

      if (alreadySent) {
        results.push({
          member: member.full_name,
          email: member.email,
          status: 'skipped',
          reason: 'Already sent today',
        });
        continue;
      }

      const emailRes = await sendBirthdayEmail({
        to: member.email,
        fullName: member.full_name || 'Brethren',
        nmsNumber: member.nms_number,
        company: member.company,
      });

      logs.push({
        date: todayStr,
        nms_number: member.nms_number || '',
        email: member.email,
        full_name: member.full_name,
        sent_at: new Date().toISOString(),
        status: emailRes.success ? 'sent' : 'failed',
        error: emailRes.error,
      });

      results.push({
        member: member.full_name,
        email: member.email,
        status: emailRes.success ? 'sent' : 'failed',
        error: emailRes.error,
      });
    }

    saveLocalLogs(logs);

    return NextResponse.json({
      ok: true,
      date: todayStr,
      celebrantsCount: celebrants.length,
      dispatchedCount: results.filter((r) => r.status === 'sent').length,
      results,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return handleBirthdayDispatch(req);
}

export async function POST(req: Request) {
  return handleBirthdayDispatch(req);
}

