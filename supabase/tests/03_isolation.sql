-- Two-student / two-school isolation for tables the student app reads.

begin;

insert into public.schools (id, name, code) values
  ('11111111-1111-1111-1111-111111111111', 'School A', 'A'),
  ('22222222-2222-2222-2222-222222222222', 'School B', 'B')
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

-- Ensure xp/consents/attempts tables exist from migrations before this file runs.
insert into public.xp_events (student_id, event_type, points, idempotency_key)
values
  ('a1111111-1111-1111-1111-111111111111', 'seed', 3, 'iso-a'),
  ('b2222222-2222-2222-2222-222222222222', 'seed', 7, 'iso-b');

-- Force RLS for this session
set local role authenticated;
select set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true);

select public.test_assert(
  (select count(*) from public.students) = 1,
  'students isolation'
);
select public.test_assert(
  (select count(*) from public.attendance) = 1,
  'attendance isolation'
);
select public.test_assert(
  (select count(*) from public.homework_completions) = 1,
  'homework_completions isolation'
);
select public.test_assert(
  (select count(*) from public.xp_events) = 1,
  'xp_events isolation'
);
select public.test_assert(
  (select coalesce(sum(points),0) from public.xp_events) = 3,
  'xp_events points belong to A only'
);

rollback;
