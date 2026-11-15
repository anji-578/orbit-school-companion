-- One-shot transactional role-matrix run. Seeds, asserts, returns rows, ROLLBACKs.
begin;

create temporary table role_matrix_results (
  test text not null,
  expected text not null,
  actual text not null,
  result text not null
) on commit drop;

-- test_set_auth switches to authenticated/anon; allow those roles to record results.
grant select, insert, update, delete on table role_matrix_results to authenticated, anon, public;

create or replace function public.test_set_auth(uid uuid, role_name text default 'authenticated')
returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', uid::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', uid::text, 'role', role_name)::text, true);
  perform set_config('request.jwt.claim.role', role_name, true);
  execute format('set local role %I', role_name);
end;
$$;

-- seed schools
insert into public.schools (id, name, code) values
  ('aaaaaaaa-0001-4000-8000-0000000000a1', 'Verify School A', 'VERIFY_A'),
  ('aaaaaaaa-0001-4000-8000-0000000000b1', 'Verify School B', 'VERIFY_B');

-- Seed profiles directly. Avoid auth.users inserts — column layouts differ across
-- supabase/postgres image tags (email_confirmed_at etc.) and break CI.
insert into public.profiles (id, school_id, role, display_name) values
  ('bbbbbbbb-0001-4000-8000-0000000000a1', 'aaaaaaaa-0001-4000-8000-0000000000a1', 'student', 'Student A1'),
  ('bbbbbbbb-0001-4000-8000-0000000000a2', 'aaaaaaaa-0001-4000-8000-0000000000a1', 'student', 'Student A2'),
  ('bbbbbbbb-0001-4000-8000-0000000000c1', 'aaaaaaaa-0001-4000-8000-0000000000a1', 'parent', 'Parent P1'),
  ('bbbbbbbb-0001-4000-8000-0000000000d1', 'aaaaaaaa-0001-4000-8000-0000000000a1', 'teacher', 'Teacher T1'),
  ('bbbbbbbb-0001-4000-8000-0000000000e1', 'aaaaaaaa-0001-4000-8000-0000000000a1', 'school', 'Admin S1'),
  ('bbbbbbbb-0001-4000-8000-0000000000b1', 'aaaaaaaa-0001-4000-8000-0000000000b1', 'student', 'Student B1'),
  ('bbbbbbbb-0001-4000-8000-0000000000f1', 'aaaaaaaa-0001-4000-8000-0000000000b1', 'school', 'Admin SB')
on conflict (id) do update set
  school_id = excluded.school_id,
  role = excluded.role,
  display_name = excluded.display_name;

insert into public.students (id, school_id, profile_id, class_name, section, display_name, active) values
  ('cccccccc-0001-4000-8000-0000000000a1', 'aaaaaaaa-0001-4000-8000-0000000000a1', 'bbbbbbbb-0001-4000-8000-0000000000a1', 'Grade 8', 'A', 'Student A1', true),
  ('cccccccc-0001-4000-8000-0000000000a2', 'aaaaaaaa-0001-4000-8000-0000000000a1', 'bbbbbbbb-0001-4000-8000-0000000000a2', 'Grade 8', 'B', 'Student A2', true),
  ('cccccccc-0001-4000-8000-0000000000b1', 'aaaaaaaa-0001-4000-8000-0000000000b1', 'bbbbbbbb-0001-4000-8000-0000000000b1', 'Grade 8', 'A', 'Student B1', true);

insert into public.parent_links (parent_profile_id, student_id, relationship) values
  ('bbbbbbbb-0001-4000-8000-0000000000c1', 'cccccccc-0001-4000-8000-0000000000a1', 'guardian')
on conflict (parent_profile_id, student_id) do nothing;

insert into public.teacher_classes (school_id, teacher_profile_id, class_name, section) values
  ('aaaaaaaa-0001-4000-8000-0000000000a1', 'bbbbbbbb-0001-4000-8000-0000000000d1', 'Grade 8', 'A');

insert into public.hiring_applications (school_id, name, subject, experience, qualification, status)
values ('aaaaaaaa-0001-4000-8000-0000000000a1', 'Candidate X', 'Math', '5y', 'B.Ed', 'Applied');

insert into public.student_grades (id, school_id, student_id, student_name, math, science, chem, comment)
values
  ('dddddddd-0001-4000-8000-0000000000a1', 'aaaaaaaa-0001-4000-8000-0000000000a1', 'cccccccc-0001-4000-8000-0000000000a1', 'Student A1', '90', '', '', ''),
  ('dddddddd-0001-4000-8000-0000000000a2', 'aaaaaaaa-0001-4000-8000-0000000000a1', 'cccccccc-0001-4000-8000-0000000000a2', 'Student A2', '80', '', '', '');

-- helper insert
create or replace function pg_temp.rec(t text, exp text, act text, ok boolean)
returns void language sql as $$
  insert into role_matrix_results(test, expected, actual, result)
  values (t, exp, act, case when ok then 'PASS' else 'FAIL' end);
$$;

-- STUDENT
select public.test_set_auth('bbbbbbbb-0001-4000-8000-0000000000a1');
select pg_temp.rec('student own data allowed', 'count=1', 'count=' || (select count(*) from public.students where id = 'cccccccc-0001-4000-8000-0000000000a1'),
  (select count(*) from public.students where id = 'cccccccc-0001-4000-8000-0000000000a1') = 1);
select pg_temp.rec('student another student denied', 'count=0', 'count=' || (select count(*) from public.students where id = 'cccccccc-0001-4000-8000-0000000000a2'),
  (select count(*) from public.students where id = 'cccccccc-0001-4000-8000-0000000000a2') = 0);
select pg_temp.rec('student another school denied', 'count=0', 'count=' || (select count(*) from public.students where id = 'cccccccc-0001-4000-8000-0000000000b1'),
  (select count(*) from public.students where id = 'cccccccc-0001-4000-8000-0000000000b1') = 0);
select pg_temp.rec('student teacher data denied', 'count=0', 'count=' || (select count(*) from public.profiles where role = 'teacher'),
  (select count(*) from public.profiles where role = 'teacher') = 0);
select pg_temp.rec('student admin data denied', 'count=0', 'count=' || (select count(*) from public.profiles where role = 'school'),
  (select count(*) from public.profiles where role = 'school') = 0);
select pg_temp.rec('student hiring denied', 'count=0', 'count=' || (select count(*) from public.hiring_applications),
  (select count(*) from public.hiring_applications) = 0);

do $$
begin
  begin
    update public.profiles set role = 'school' where id = 'bbbbbbbb-0001-4000-8000-0000000000a1';
  exception when others then null;
  end;
end $$;
select pg_temp.rec(
  'student role escalation denied',
  'role=student',
  'role=' || coalesce((select role::text from public.profiles where id = 'bbbbbbbb-0001-4000-8000-0000000000a1'), 'null'),
  (select role::text from public.profiles where id = 'bbbbbbbb-0001-4000-8000-0000000000a1') = 'student'
);

-- PARENT
select public.test_set_auth('bbbbbbbb-0001-4000-8000-0000000000c1');
select pg_temp.rec('parent linked child allowed', 'count=1', 'count=' || (select count(*) from public.students where id = 'cccccccc-0001-4000-8000-0000000000a1'),
  (select count(*) from public.students where id = 'cccccccc-0001-4000-8000-0000000000a1') = 1);
select pg_temp.rec('parent unlinked child denied', 'count=0', 'count=' || (select count(*) from public.students where id = 'cccccccc-0001-4000-8000-0000000000a2'),
  (select count(*) from public.students where id = 'cccccccc-0001-4000-8000-0000000000a2') = 0);
select pg_temp.rec('parent another school denied', 'count=0', 'count=' || (select count(*) from public.students where id = 'cccccccc-0001-4000-8000-0000000000b1'),
  (select count(*) from public.students where id = 'cccccccc-0001-4000-8000-0000000000b1') = 0);

do $$
begin
  begin
    insert into public.parent_links (parent_profile_id, student_id, relationship)
    values ('bbbbbbbb-0001-4000-8000-0000000000c1', 'cccccccc-0001-4000-8000-0000000000a2', 'guardian');
  exception when others then null;
  end;
end $$;
select pg_temp.rec(
  'parent arbitrary parent_links insert denied',
  'row absent',
  case when exists (
    select 1 from public.parent_links
    where parent_profile_id = 'bbbbbbbb-0001-4000-8000-0000000000c1'
      and student_id = 'cccccccc-0001-4000-8000-0000000000a2'
  ) then 'row present' else 'row absent' end,
  not exists (
    select 1 from public.parent_links
    where parent_profile_id = 'bbbbbbbb-0001-4000-8000-0000000000c1'
      and student_id = 'cccccccc-0001-4000-8000-0000000000a2'
  )
);

-- TEACHER
select public.test_set_auth('bbbbbbbb-0001-4000-8000-0000000000d1');
select pg_temp.rec('teacher assigned class allowed', 'count=1', 'count=' || (select count(*) from public.students where id = 'cccccccc-0001-4000-8000-0000000000a1'),
  (select count(*) from public.students where id = 'cccccccc-0001-4000-8000-0000000000a1') = 1);
select pg_temp.rec('teacher unassigned class denied', 'count=0', 'count=' || (select count(*) from public.students where id = 'cccccccc-0001-4000-8000-0000000000a2'),
  (select count(*) from public.students where id = 'cccccccc-0001-4000-8000-0000000000a2') = 0);
select pg_temp.rec('teacher another school denied', 'count=0', 'count=' || (select count(*) from public.students where id = 'cccccccc-0001-4000-8000-0000000000b1'),
  (select count(*) from public.students where id = 'cccccccc-0001-4000-8000-0000000000b1') = 0);
select pg_temp.rec('teacher hiring/HR denied', 'count=0', 'count=' || (select count(*) from public.hiring_applications),
  (select count(*) from public.hiring_applications) = 0);
select pg_temp.rec('teacher assigned grades allowed', 'count>=1', 'count=' || (select count(*) from public.student_grades where student_id = 'cccccccc-0001-4000-8000-0000000000a1'),
  (select count(*) from public.student_grades where student_id = 'cccccccc-0001-4000-8000-0000000000a1') >= 1);
select pg_temp.rec('teacher unassigned grades denied', 'count=0', 'count=' || (select count(*) from public.student_grades where student_id = 'cccccccc-0001-4000-8000-0000000000a2'),
  (select count(*) from public.student_grades where student_id = 'cccccccc-0001-4000-8000-0000000000a2') = 0);

-- SCHOOL ADMIN
select public.test_set_auth('bbbbbbbb-0001-4000-8000-0000000000e1');
select pg_temp.rec('school admin own school allowed', 'count>=2', 'count=' || (select count(*) from public.students where school_id = 'aaaaaaaa-0001-4000-8000-0000000000a1'),
  (select count(*) from public.students where school_id = 'aaaaaaaa-0001-4000-8000-0000000000a1') >= 2);
select pg_temp.rec('school admin another school denied', 'count=0', 'count=' || (select count(*) from public.students where school_id = 'aaaaaaaa-0001-4000-8000-0000000000b1'),
  (select count(*) from public.students where school_id = 'aaaaaaaa-0001-4000-8000-0000000000b1') = 0);
select pg_temp.rec('school admin hiring allowed', 'count>=1', 'count=' || (select count(*) from public.hiring_applications where school_id = 'aaaaaaaa-0001-4000-8000-0000000000a1'),
  (select count(*) from public.hiring_applications where school_id = 'aaaaaaaa-0001-4000-8000-0000000000a1') >= 1);
select pg_temp.rec('school admin sees only own school', 'count=1', 'count=' || (select count(*) from public.schools),
  (select count(*) from public.schools) = 1);

-- ANON
select public.test_set_auth('00000000-0000-0000-0000-000000000000', 'anon');
select pg_temp.rec('anon students denied', 'count=0', 'count=' || (select count(*) from public.students),
  (select count(*) from public.students) = 0);
select pg_temp.rec('anon profiles denied', 'count=0', 'count=' || (select count(*) from public.profiles),
  (select count(*) from public.profiles) = 0);
select pg_temp.rec('anon schools denied', 'count=0', 'count=' || (select count(*) from public.schools),
  (select count(*) from public.schools) = 0);
select pg_temp.rec('anon hiring denied', 'count=0', 'count=' || (select count(*) from public.hiring_applications),
  (select count(*) from public.hiring_applications) = 0);

-- Return results before rollback (same transaction)
select test, expected, actual, result from role_matrix_results order by ctid;

rollback;
