-- Orbit Storage — student confidential documents (private vault)
-- Owner-only access via auth.uid() path prefix + RLS

create table if not exists public.student_confidential_docs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text not null default 'Other',
  file_name text not null,
  mime_type text not null default 'application/octet-stream',
  size_bytes bigint not null default 0,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create index if not exists student_confidential_docs_owner_idx
  on public.student_confidential_docs (owner_id, created_at desc);

alter table public.student_confidential_docs enable row level security;

drop policy if exists student_confidential_docs_select on public.student_confidential_docs;
create policy student_confidential_docs_select on public.student_confidential_docs
  for select to authenticated
  using (owner_id = auth.uid());

drop policy if exists student_confidential_docs_insert on public.student_confidential_docs;
create policy student_confidential_docs_insert on public.student_confidential_docs
  for insert to authenticated
  with check (owner_id = auth.uid());

drop policy if exists student_confidential_docs_update on public.student_confidential_docs;
create policy student_confidential_docs_update on public.student_confidential_docs
  for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists student_confidential_docs_delete on public.student_confidential_docs;
create policy student_confidential_docs_delete on public.student_confidential_docs
  for delete to authenticated
  using (owner_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'student-confidential',
  'student-confidential',
  false,
  5242880,
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists student_confidential_select on storage.objects;
create policy student_confidential_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'student-confidential'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists student_confidential_insert on storage.objects;
create policy student_confidential_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'student-confidential'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists student_confidential_update on storage.objects;
create policy student_confidential_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'student-confidential'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'student-confidential'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists student_confidential_delete on storage.objects;
create policy student_confidential_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'student-confidential'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
