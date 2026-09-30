-- SECURITY DEFINER award_xp / export / anonymize tests

begin;

-- Seed two schools, two students
insert into public.schools (id, name, code) values
  ('11111111-1111-1111-1111-111111111111', 'School A', 'A'),
  ('22222222-2222-2222-2222-222222222222', 'School B', 'B');

insert into public.profiles (id, school_id, role, display_name) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'student', 'Student A'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'student', 'Student B'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'school', 'Admin A');

insert into public.students (id, school_id, profile_id, class_name, display_name) values
  ('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '8-A', 'Student A'),
  ('b2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '8-B', 'Student B');

-- As student A: can award own XP
select set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true);
select public.award_xp(
  'a1111111-1111-1111-1111-111111111111',
  'homework',
  't1',
  10,
  'idem-1',
  null
);
select public.test_assert(
  (select total_xp from public.student_xp_totals where student_id = 'a1111111-1111-1111-1111-111111111111') = 10,
  'award_xp should add 10'
);

-- Idempotency: same key must not double-count
select public.award_xp(
  'a1111111-1111-1111-1111-111111111111',
  'homework',
  't1',
  10,
  'idem-1',
  null
);
select public.test_assert(
  (select total_xp from public.student_xp_totals where student_id = 'a1111111-1111-1111-1111-111111111111') = 10,
  'award_xp idempotency'
);

-- Student A cannot award Student B
do $$
begin
  begin
    perform public.award_xp(
      'b2222222-2222-2222-2222-222222222222',
      'homework', 'x', 5, 'idem-cross', null
    );
    raise exception 'expected not authorized';
  exception
    when others then
      if SQLERRM not like '%not authorized%' then
        raise;
      end if;
  end;
end $$;

-- Unauthenticated award fails
select set_config('request.jwt.claim.sub', '', true);
do $$
begin
  begin
    perform public.award_xp(
      'a1111111-1111-1111-1111-111111111111',
      'homework', 'x', 5, 'idem-anon', null
    );
    raise exception 'expected not authenticated';
  exception
    when others then
      if SQLERRM not like '%not authenticated%' and SQLERRM not like '%not authorized%' then
        raise;
      end if;
  end;
end $$;

-- Export ownership
select set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true);
select public.test_assert(
  (public.export_student_data('a1111111-1111-1111-1111-111111111111') -> 'student') is not null,
  'export own student'
);

do $$
begin
  begin
    perform public.export_student_data('b2222222-2222-2222-2222-222222222222');
    raise exception 'expected not authorized on export';
  exception
    when others then
      if SQLERRM not like '%not authorized%' then
        raise;
      end if;
  end;
end $$;

-- Anonymize: school A can anonymize A, not B
select set_config('request.jwt.claim.sub', 'cccccccc-cccc-cccc-cccc-cccccccccccc', true);
select public.anonymize_student('a1111111-1111-1111-1111-111111111111');
select public.test_assert(
  (select display_name from public.students where id = 'a1111111-1111-1111-1111-111111111111') = 'Anonymized Student',
  'anonymize school A'
);

do $$
begin
  begin
    perform public.anonymize_student('b2222222-2222-2222-2222-222222222222');
    raise exception 'expected not authorized anonymize cross-school';
  exception
    when others then
      if SQLERRM not like '%not authorized%' then
        raise;
      end if;
  end;
end $$;

rollback;
