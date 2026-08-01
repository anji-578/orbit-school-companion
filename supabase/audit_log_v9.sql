-- Sprint 2: school-scoped audit trail for sensitive mutations (idempotent).

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_school_created_idx
  on public.audit_log (school_id, created_at desc);

alter table public.audit_log enable row level security;

drop policy if exists audit_log_select_school on public.audit_log;
create policy audit_log_select_school on public.audit_log
  for select to authenticated
  using (
    school_id = public.current_school_id()
    and public.current_profile_role() = 'school'
  );

drop policy if exists audit_log_insert_staff on public.audit_log;
create policy audit_log_insert_staff on public.audit_log
  for insert to authenticated
  with check (
    school_id = public.current_school_id()
    and public.current_profile_role() in ('school', 'teacher', 'parent', 'student')
    and (actor_id is null or actor_id = auth.uid())
  );
