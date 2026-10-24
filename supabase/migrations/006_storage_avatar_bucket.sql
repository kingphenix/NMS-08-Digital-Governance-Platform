-- Migration 006: Create Supabase Storage Bucket for Member Avatars
-- Set max file size to 5MB (5242880 bytes) and allow standard image types

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Enable storage policies for public read and authenticated/service uploads
create policy if not exists "Public Access for Member Avatars"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy if not exists "Allow Avatar Uploads"
  on storage.objects for insert
  with check ( bucket_id = 'avatars' );

create policy if not exists "Allow Avatar Updates"
  on storage.objects for update
  using ( bucket_id = 'avatars' );
