import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireMember } from '@/lib/server-auth';

export const runtime = 'nodejs';

// Max file size: 5MB
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const AVATAR_BUCKET = 'avatars';

/**
 * Detect the real image type from its magic bytes. Client-supplied MIME types
 * and file extensions cannot be trusted.
 */
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
    // Only a signed-in member may upload, and only to their own profile.
    const session = requireMember(request);
    if (!session) {
      return NextResponse.json({ ok: false, message: 'Authentication required.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ ok: false, message: 'No file provided for upload.' }, { status: 400 });
    }

    // Validate size (max 5MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { ok: false, message: `File size exceeds the 5MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB).` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Validate by content, not by the client-declared MIME type.
    const detected = detectImageType(fileBuffer);
    if (!detected) {
      return NextResponse.json(
        { ok: false, message: 'Invalid image file. Please upload a valid JPEG, PNG, WEBP, or GIF.' },
        { status: 400 }
      );
    }

    // The avatar always belongs to the authenticated member.
    const cleanNms = session.sub;
    const sanitizedNms = cleanNms.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filePath = `members/${sanitizedNms}_${Date.now()}.${detected.ext}`;

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // If Supabase credentials are available, upload to Supabase Storage
    if (supabaseUrl && serviceKey) {
      const supabase = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false },
      });

      // Ensure bucket exists (or create if missing)
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some((b) => b.name === AVATAR_BUCKET);
      if (!bucketExists) {
        await supabase.storage.createBucket(AVATAR_BUCKET, {
          public: true,
          fileSizeLimit: MAX_FILE_SIZE_BYTES,
          allowedMimeTypes: ALLOWED_MIME_TYPES,
        });
      }

      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(filePath, fileBuffer, {
          contentType: detected.mime,
          upsert: true,
        });

      if (uploadError) {
        console.error('Supabase storage upload error:', uploadError);
        return NextResponse.json(
          { ok: false, message: `Supabase Storage upload error: ${uploadError.message}` },
          { status: 500 }
        );
      }

      const { data: publicUrlData } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);
      const publicUrl = publicUrlData.publicUrl;

      // Update the member's own profile record with the new avatar_url
      await supabase
        .from('member_profiles')
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('nms_number', cleanNms);

      return NextResponse.json({
        ok: true,
        avatar_url: publicUrl,
        message: 'Avatar uploaded successfully to Supabase Storage.',
      });
    }

    // Fallback if Supabase credentials are missing (local development / offline demo mode)
    const base64Data = `data:${detected.mime};base64,${fileBuffer.toString('base64')}`;
    return NextResponse.json({
      ok: true,
      avatar_url: base64Data,
      notice: 'Supabase storage credentials not configured. Handled via local payload.',
    });
  } catch (error: any) {
    console.error('Avatar upload endpoint error:', error);
    return NextResponse.json(
      { ok: false, message: error?.message || 'Internal server error processing avatar upload.' },
      { status: 500 }
    );
  }
}
