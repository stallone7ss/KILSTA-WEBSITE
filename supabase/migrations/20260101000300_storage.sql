-- =============================================================================
-- Migration 0004: Supabase Storage bucket for public website media
--
-- Uploads are performed by the Express API using the server-only secret key.
-- The bucket is public for reads (images embedded on the public website) but no
-- browser role receives INSERT/UPDATE/DELETE policies.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read access for objects in the media bucket.
drop policy if exists "Public media is readable" on storage.objects;
create policy "Public media is readable"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'media');

-- No INSERT/UPDATE/DELETE policies are created for anon/authenticated.
-- Service-role uploads bypass RLS.
