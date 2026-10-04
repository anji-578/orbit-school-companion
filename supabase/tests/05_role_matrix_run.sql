-- One-shot transactional role-matrix run. Seeds, asserts, returns rows, ROLLBACKs.
begin;

create temporary table role_matrix_results (
  test text not null,
  expected text not null,
  actual text not null,
  result text not null
) on commit drop;

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

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', 'bbbbbbbb-0001-4000-8000-0000000000a1', 'authenticated', 'authenticated',
   'a1@verify.test', crypt('verify', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"role":"student","display_name":"Student A1"}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'bbbbbbbb-0001-4000-8000-0000000000a2', 'authenticated', 'authenticated',
   'a2@verify.test', crypt('verify', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"role":"student","display_name":"Student A2"}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'bbbbbbbb-0001-4000-8000-0000000000c1', 'authenticated', 'authenticated',
   'p1@verify.test', crypt('verify', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"role":"parent","display_name":"Parent P1"}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'bbbbbbbb-0001-4000-8000-0000000000d1', 'authenticated', 'authenticated',
   't1@verify.test', crypt('verify', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"role":"student","display_name":"Teacher T1"}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'bbbbbbbb-0001-4000-8000-0000000000e1', 'authenticated', 'authenticated',
   's1@verify.test', crypt('verify', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"role":"student","display_name":"Admin S1"}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'bbbbbbbb-0001-4000-8000-0000000000b1', 'authenticated', 'authenticated',
   'b1@verify.test', crypt('verify', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"role":"student","display_name":"Student B1"}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'bbbbbbbb-0001-4000-8000-0000000000f1', 'authenticated', 'authenticated',
   'sb@verify.test', crypt('verify', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"role":"student","display_name":"Admin SB"}'::jsonb, now(), now());

update public.profiles set
  school_id = case id
    when 'bbbbbbbb-0001-4000-8000-0000000000a1' then 'aaaaaaaa-0001-4000-8000-0000000000a1'::uuid
    when 'bbbbbbbb-0001-4000-8000-0000000000a2' then 'aaaaaaaa-0001-4000-8000-0000000000a1'::uuid
    when 'bbbbbbbb-0001-4000-8000-0000000000c1' then 'aaaaaaaa-0001-4000-8000-0000000000a1'::uuid
    when 'bbbbbbbb-0001-4000-8000-0000000000d1' then 'aaaaaaaa-0001-4000-8000-0000000000a1'::uuid
    when 'bbbbbbbb-0001-4000-8000-0000000000e1' then 'aaaaaaaa-0001-4000-8000-0000000000a1'::uuid
    when 'bbbbbbbb-0001-4000-8000-0000000000b1' then 'aaaaaaaa-0001-4000-8000-0000000000b1'::uuid
    when 'bbbbbbbb-0001-4000-8000-0000000000f1' then 'aaaaaaaa-0001-4000-8000-0000000000b1'::uuid
  end,
  role = case id
    when 'bbbbbbbb-0001-4000-8000-0000000000a1' then 'student'::public.orbit_role
    when 'bbbbbbbb-0001-4000-8000-0000000000a2' then 'student'::public.orbit_role
    when 'bbbbbbbb-0001-4000-8000-0000000000c1' then 'parent'::public.orbit_role
    when 'bbbbbbbb-0001-4000-8000-0000000000d1' then 'teacher'::public.orbit_role
    when 'bbbbbbbb-0001-4000-8000-0000000000e1' then 'school'::public.orbit_role
    when 'bbbbbbbb-0001-4000-8000-0000000000b1' then 'student'::public.orbit_role
    when 'bbbbbbbb-0001-4000-8000-0000000000f1' then 'school'::public.orbit_role
  end
where id in (
  'bbbbbbbb-0001-4000-8000-0000000000a1','bbbbbbbb-0001-4000-8000-0000000000a2',
  'bbbbbbbb-0001-4000-8000-0000000000c1','bbbbbbbb-0001-4000-8000-0000000000d1',
  'bbbbbbbb-0001-4000-8000-0000000000e1','bbbbbbbb-0001-4000-8000-0000000000b1',
  'bbbbbbbb-0001-4000-8000-0000000000f1'
);

insert into public.students (id, school_id, profile_id, class_name, section, display_name, active) values
  ('cccccccc-0001-4000-8000-0000000000a1', 'aaaaaaaa-0001-4000-8000-0000000000a1', 'bbbbbbbb-0001-4000-8000-0000000000a1', 'Grade 8', 'A', 'Student A1', true),
  ('cccccccc-0001-4000-8000-0000000000a2', 'aaaaaaaa-0001-4000-8000-0000000000a1', 'bbbbbbbb-0001-4000-8000-0000000000a2', 'Grade 8', 'B', 'Student A2', true),
  ('cccccccc-0001-4000-8000-0000000000b1', 'aaaaaaaa-0001-4000-8000-0000000000b1', 'bbbbbbbb-0001-4000-8000-0000000000b1', 'Grade 8', 'A', 'Student B1', true);

insert into public.parent_links (parent_profile_id, student_id, relationship) values
  ('bbbbbbbb-0001-4000-8000-0000000000c1', 'cccccccc-0001-4000-8000-0000000000a1', 'guardian');

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
