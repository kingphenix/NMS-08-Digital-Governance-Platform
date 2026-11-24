import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const EVENTS_BUCKET = 'events';

function detectImageType(buffer: Buffer): { mime: string; ext: string } | null {
  if (buffer.length < 12) return null;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47 &&
    buffer[4] === 0x0d && buffer[5] === 0x0a && buffer[6] === 0x1a && buffer[7] === 0x0a
  ) {
    return { mime: 'image/png', ext: 'png' };
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mime: 'image/jpeg', ext: 'jpg' };
  }

  // GIF: "GIF87a" / "GIF89a"
  if (buffer.slice(0, 6).toString('ascii') === 'GIF87a' || buffer.slice(0, 6).toString('ascii') === 'GIF89a') {
    return { mime: 'image/gif', ext: 'gif' };
  }

  // WEBP: "RIFF" .... "WEBP"
  if (
    buffer.slice(0, 4).toString('ascii') === 'RIFF' &&
    buffer.slice(8, 12).toString('ascii') === 'WEBP'
  ) {
    return { mime: 'image/webp', ext: 'webp' };
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ ok: false, message: 'No file provided for upload.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { ok: false, message: `File size exceeds the 8MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB).` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    const detected = detectImageType(fileBuffer);
    if (!detected) {
      return NextResponse.json(
        { ok: false, message: 'Invalid image format. Please upload a valid JPEG, PNG, WEBP, or GIF.' },
        { status: 400 }
      );
    }

    const fileName = `event_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${detected.ext}`;
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceKey) {
      try {
        const supabase = createClient(supabaseUrl, serviceKey, {
          auth: { persistSession: false },
        });

        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketExists = buckets?.some((b) => b.name === EVENTS_BUCKET);
        if (!bucketExists) {
          await supabase.storage.createBucket(EVENTS_BUCKET, {
            public: true,
            fileSizeLimit: MAX_FILE_SIZE_BYTES,
            allowedMimeTypes: ALLOWED_MIME_TYPES,
          });
        }

        const { error: uploadError } = await supabase.storage
          .from(EVENTS_BUCKET)
          .upload(fileName, fileBuffer, {
            contentType: detected.mime,
            upsert: true,
          });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage.from(EVENTS_BUCKET).getPublicUrl(fileName);
          return NextResponse.json({
            ok: true,
            image_url: publicUrlData.publicUrl,
            message: 'Image uploaded successfully to cloud storage.',
          });
        }
      } catch (cloudErr) {
        console.warn('Storage bucket upload failed, using base64 payload fallback:', cloudErr);
      }
    }

    // Fallback: return base64 data URL
    const base64Data = `data:${detected.mime};base64,${fileBuffer.toString('base64')}`;
    return NextResponse.json({
      ok: true,
      image_url: base64Data,
      message: 'Image processed successfully.',
    });
  } catch (error: any) {
    console.error('Event image upload error:', error);
    return NextResponse.json(
      { ok: false, message: error?.message || 'Server error processing image upload.' },
      { status: 500 }
    );
  }
}
