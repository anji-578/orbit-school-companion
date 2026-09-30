-- Isolation + RLS enabled assertion for all public tables

create or replace function public.test_assert(condition boolean, message text)
returns void language plpgsql as $$
begin
  if not condition then
    raise exception 'ASSERT FAILED: %', message;
  end if;
end;
$$;

begin;

insert into public.schools (id, name, code, is_demo) values
  ('11111111-1111-1111-1111-111111111111', 'School A', 'A', false),
  ('22222222-2222-2222-2222-222222222222', 'School B', 'B', false)
on conflict (id) do nothing;

insert into public.profiles (id, school_id, role, display_name) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'student', 'Student A'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'student', 'Student B')
on conflict (id) do nothing;

insert into public.students (id, school_id, profile_id, class_name, display_name) values
  ('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '8-A', 'Student A'),
  ('b2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '8-B', 'Student B')
on conflict (id) do nothing;

insert into public.attendance (school_id, student_id, date, status) values
  ('11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', '2026-09-01', 'Present'),
  ('22222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', '2026-09-01', 'Present');

insert into public.homework_completions (school_id, student_id, task_ref, completed) values
  ('11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'hw-a', true),
  ('22222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'hw-b', true);

-- Seed ledger as definer/owner then force RLS for reads
insert into public.xp_events (student_id, event_type, points, idempotency_key)
values
  ('a1111111-1111-1111-1111-111111111111', 'seed', 3, 'iso-a'),
  ('b2222222-2222-2222-2222-222222222222', 'seed', 7, 'iso-b');

alter table public.xp_events force row level security;
alter table public.student_badges force row level security;
alter table public.learning_events force row level security;

-- Positive: permitted read as A returns own rows
select public.test_set_auth('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
set local role authenticated;

select public.test_assert((select count(*) from public.students) = 1, 'permitted students read');
select public.test_assert((select count(*) from public.attendance) = 1, 'permitted attendance read');
select public.test_assert((select count(*) from public.homework_completions) = 1, 'permitted homework read');
select public.test_assert((select count(*) from public.xp_events) = 1, 'permitted xp_events read');
select public.test_assert((select coalesce(sum(points),0) from public.xp_events) = 3, 'xp points are A only');

-- Negative: cross-school / cross-student already zero via counts above (=1 not 2)

-- Every public base table has RLS enabled (allowlist exceptions with reason)
do $$
declare
  r record;
  allow text[] := array[
    -- spatial_ref_sys is sometimes installed by extensions; not used by Orbit
    'spatial_ref_sys'
  ];
begin
  for r in
    select c.relname as table_name
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'r'
  loop
    if r.table_name = any (allow) then
      continue;
    end if;
    if not exists (
      select 1 from pg_class c2
      join pg_namespace n2 on n2.oid = c2.relnamespace
      where n2.nspname = 'public' and c2.relname = r.table_name and c2.relrowsecurity
    ) then
      raise exception 'ASSERT FAILED: RLS not enabled on public.%', r.table_name;
    end if;
  end loop;
end $$;

rollback;
