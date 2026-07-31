-- Orbit Storage — syllabus note files
-- Run in Supabase SQL Editor after trust_hardening.sql

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'syllabus-notes',
  'syllabus-notes',
  true,
  2621440,
  array['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'image/gif', 'text/plain']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists syllabus_notes_select on storage.objects;
create policy syllabus_notes_select on storage.objects
  for select to authenticated, anon
  using (bucket_id = 'syllabus-notes');

drop policy if exists syllabus_notes_insert_staff on storage.objects;
create policy syllabus_notes_insert_staff on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'syllabus-notes'
    and public.current_profile_role() in ('teacher', 'school')
  );

drop policy if exists syllabus_notes_update_staff on storage.objects;
create policy syllabus_notes_update_staff on storage.objects
  for update to authenticated
  using (
    bucket_id = 'syllabus-notes'
    and public.current_profile_role() in ('teacher', 'school')
  )
  with check (
    bucket_id = 'syllabus-notes'
    and public.current_profile_role() in ('teacher', 'school')
  );

drop policy if exists syllabus_notes_delete_staff on storage.objects;
create policy syllabus_notes_delete_staff on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'syllabus-notes'
    and public.current_profile_role() in ('teacher', 'school')
  );
