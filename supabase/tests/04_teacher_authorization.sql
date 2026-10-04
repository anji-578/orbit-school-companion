-- Teacher authorization probes (run against a DB with teacher_classes seed).
-- Expected identities (PILOT100-style):
--   teacher 959c4a40-57a9-4d4a-8257-5d7212f02810 → Grade 8-A
-- Override via env-specific seed when needed.

create or replace function public.test_assert(condition boolean, message text)
returns void language plpgsql as $$
begin
  if not condition then
    raise exception 'ASSERT FAILED: %', message;
  end if;
end;
$$;

do $$
declare
  teacher_id uuid := '959c4a40-57a9-4d4a-8257-5d7212f02810';
  student_8a uuid := 'b1000000-0000-4000-8000-000000000011';
  student_8b uuid := 'b1000000-0000-4000-8000-000000000073';
  student_g6 uuid := 'b1000000-0000-4000-8000-000000000001';
  other_school_student uuid := 'a1111111-1111-4111-8111-111111111102';
  student_user uuid := 'e3b2c7e8-e836-42f3-8d22-5f61960811ee';
begin
  if not exists (select 1 from public.profiles where id = teacher_id and role = 'teacher') then
    raise notice 'SKIP teacher authorization tests — seed teacher missing';
    return;
  end if;

  perform set_config('request.jwt.claim.sub', teacher_id::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', teacher_id::text, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';

  perform public.test_assert(
    (select count(*) from public.students where id = student_8a) = 1,
    'teacher Grade 8-A can read assigned student'
  );
  perform public.test_assert(
    (select count(*) from public.students where id = student_8b) = 0,
    'teacher Grade 8-A cannot read Grade 8-B student'
  );
  perform public.test_assert(
    (select count(*) from public.students where id = student_g6) = 0,
    'teacher Grade 8-A cannot read Grade 6 student'
  );
  perform public.test_assert(
    (select count(*) from public.students where id = other_school_student) = 0,
    'teacher cannot read other-school student'
  );
  perform public.test_assert(
    (select count(*) from public.hiring_applications) = 0,
    'teacher cannot read hiring_applications'
  );
  perform public.test_assert(
    (select count(*) from public.student_grades sg
      join public.students s on s.id = sg.student_id
     where s.class_name = 'Grade 8' and s.section = 'B') = 0,
    'teacher cannot read Grade 8-B grades'
  );

  perform set_config('request.jwt.claim.sub', student_user::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', student_user::text, 'role', 'authenticated')::text, true);

  perform public.test_assert(
    (select count(*) from public.hiring_applications) = 0,
    'student cannot read hiring_applications'
  );
  perform public.test_assert(
    (select count(*) from public.profiles where role in ('teacher', 'school') and id <> auth.uid()) = 0,
    'student cannot read teacher/admin profiles'
  );
  perform public.test_assert(
    (select count(*) from public.teacher_classes) = 0,
    'student cannot read teacher_classes'
  );
end $$;
