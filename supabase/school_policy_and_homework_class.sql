-- School policy (active class) + homework class scoping.
-- Run after schema.sql / seed.sql.

create table if not exists public.school_policy (
  school_id uuid primary key references public.schools (id) on delete cascade,
  active_class_label text not null default 'Grade 8-A',
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

alter table public.school_policy enable row level security;

drop policy if exists school_policy_select_members on public.school_policy;
create policy school_policy_select_members on public.school_policy
  for select to authenticated
  using (school_id = public.current_school_id());

drop policy if exists school_policy_write_school on public.school_policy;
create policy school_policy_write_school on public.school_policy
  for all to authenticated
  using (
    school_id = public.current_school_id()
    and public.current_profile_role() in ('school', 'teacher')
  )
  with check (
    school_id = public.current_school_id()
    and public.current_profile_role() in ('school', 'teacher')
  );

alter table public.homework_tasks
  add column if not exists class_name text;

create index if not exists homework_tasks_class_idx
  on public.homework_tasks (school_id, class_name, created_at desc);

-- Seed policy + backfill homework for SUNRISE demo class
do $$
declare
  sid uuid;
begin
  select id into sid from public.schools where code = 'SUNRISE' limit 1;
  if sid is null then
    raise notice 'SUNRISE missing — skip school_policy seed';
    return;
  end if;

  insert into public.school_policy (school_id, active_class_label)
  values (sid, 'Grade 8-A')
  on conflict (school_id) do nothing;

  update public.homework_tasks
  set class_name = 'Grade 8-A'
  where school_id = sid
    and (class_name is null or btrim(class_name) = '');
end $$;
