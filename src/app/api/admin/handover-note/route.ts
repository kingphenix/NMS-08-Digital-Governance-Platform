/**
 * /api/admin/handover-note
 *
 * GET  — returns { ok, exists, url, filename, uploadedAt }
 * POST — multipart/form-data with field "file" (PDF) -> uploads to Supabase Storage or local fallback,
 *        saves metadata to .data/handover-config.json, returns { ok, url }
 * DELETE — removes from Supabase Storage + removes local public fallback + sets removed flag in metadata
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DATA_DIR = path.join(process.cwd(), '.data');
const CONFIG_FILE = path.join(DATA_DIR, 'handover-config.json');
const PUBLIC_PDF = path.join(process.cwd(), 'public', 'handover-note.pdf');
const STORAGE_BUCKET = 'documents';
const STORAGE_PATH = 'handover-note/handover-note.pdf';

interface HandoverConfig {
  exists: boolean;
  url: string;
  filename: string;
  uploadedAt: string;
}

function readConfig(): HandoverConfig | null {
  try {
    if (!fs.existsSync(CONFIG_FILE)) return null;
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  } catch {
    return null;
  }
}

function writeConfig(config: HandoverConfig) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
}

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function isAdminRequest(req: Request): boolean {
  const header = req.headers.get('x-admin-auth');
  if (header === 'nms08-admin') return true;
  const { searchParams } = new URL(req.url);
  if (searchParams.get('admin') === 'true') return true;
  return false;
}

// ─── GET ─────────────────────────────────────────────────────────────────────
export async function GET() {
  const cfg = readConfig();
  if (cfg !== null) {
    return NextResponse.json({ ok: true, ...cfg });
  }

  // If no config exists yet, check if the initial public static file exists
  if (fs.existsSync(PUBLIC_PDF)) {
    const initialConfig: HandoverConfig = {
      exists: true,
      url: '/handover-note.pdf',
      filename: 'handover note.pdf',
      uploadedAt: new Date().toISOString(),
    };
    writeConfig(initialConfig);
    return NextResponse.json({ ok: true, ...initialConfig });
  }

  return NextResponse.json({ ok: true, exists: false, url: '', filename: '', uploadedAt: '' });
}

// ─── POST (upload) ────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ ok: false, message: 'No file provided' }, { status: 400 });
  }
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    return NextResponse.json({ ok: false, message: 'Only PDF files are accepted' }, { status: 400 });
  }
  if (file.size > 20 * 1024 * 1024) {
    return NextResponse.json({ ok: false, message: 'File too large (max 20 MB)' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let finalUrl = '';
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(STORAGE_PATH, buffer, {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(STORAGE_PATH);
        if (urlData?.publicUrl) {
          finalUrl = urlData.publicUrl;
        }
      }
    } catch {
      // Continue to local fallback
    }
  }

  // Local/public fallback save if storage was unavailable or failed
  if (!finalUrl) {
    try {
      const publicDir = path.join(process.cwd(), 'public');
      if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
      fs.writeFileSync(PUBLIC_PDF, buffer);
      finalUrl = `/handover-note.pdf?v=${Date.now()}`;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save failed';
      return NextResponse.json({ ok: false, message: `Upload failed: ${msg}` }, { status: 500 });
    }
  }

  const config: HandoverConfig = {
    exists: true,
    url: finalUrl,
    filename: file.name,
    uploadedAt: new Date().toISOString(),
  };
  writeConfig(config);

  return NextResponse.json({ ok: true, url: finalUrl, filename: file.name });
}

// ─── DELETE ───────────────────────────────────────────────────────────────────
export async function DELETE(req: Request) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.storage.from(STORAGE_BUCKET).remove([STORAGE_PATH]);
    } catch {
      // Ignore
    }
  }

  // Also remove local file if present
  try {
    if (fs.existsSync(PUBLIC_PDF)) {
      fs.unlinkSync(PUBLIC_PDF);
    }
  } catch {
    // Ignore
  }

  // Explicitly write exists: false so About page knows it was deleted
  writeConfig({
    exists: false,
    url: '',
    filename: '',
    uploadedAt: '',
  });

  return NextResponse.json({ ok: true, message: 'Handover note removed successfully.' });
}
