import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

// Max file size: 5MB
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const AVATAR_BUCKET = 'avatars';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const nmsNumber = (formData.get('nms') || formData.get('nms_number') || '') as string;

    const cleanNms = nmsNumber.trim();
    if (!cleanNms) {
      return NextResponse.json({ ok: false, message: 'NMS number is required.' }, { status: 400 });
    }

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

    // Validate mime type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { ok: false, message: 'Invalid file format. Please upload JPEG, PNG, WEBP, or GIF.' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Sanitize file extension
    const ext = file.name?.split('.').pop()?.toLowerCase() || 'jpg';
    const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg';
    const sanitizedNms = cleanNms.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filePath = `members/${sanitizedNms}_${Date.now()}.${safeExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

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
          contentType: file.type || 'image/jpeg',
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

      // Update the member's profile record with the new Supabase storage avatar_url
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
    const base64Data = `data:${file.type};base64,${fileBuffer.toString('base64')}`;
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
