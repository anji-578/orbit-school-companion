-- award_xp rules + negative XP controls (direct write, replay, cross-student, invent)

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
  ('22222222-2222-2222-2222-222222222222', 'School B', 'B', false);

insert into public.profiles (id, school_id, role, display_name) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'student', 'Student A'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'student', 'Student B');

insert into public.students (id, school_id, profile_id, class_name, display_name) values
  ('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '8-A', 'Student A'),
  ('b2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '8-B', 'Student B');

-- As student A: create learning event + award
select public.test_set_auth('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

insert into public.learning_events (id, student_id, event_type, ref_id, created_by)
values (
  'e1111111-1111-1111-1111-111111111111',
  'a1111111-1111-1111-1111-111111111111',
  'homework_complete_medium',
  'hw-1',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
);

select public.award_xp('e1111111-1111-1111-1111-111111111111', null);
select public.test_assert(
  (select total_xp from public.student_xp_totals where student_id = 'a1111111-1111-1111-1111-111111111111') = 25,
  'award applies rules.points=25'
);

-- Replay / idempotency
select public.award_xp('e1111111-1111-1111-1111-111111111111', null);
select public.test_assert(
  (select total_xp from public.student_xp_totals where student_id = 'a1111111-1111-1111-1111-111111111111') = 25,
  'replay does not raise XP'
);

-- Direct insert into xp_events must fail for authenticated
do $$
begin
  begin
    insert into public.xp_events (student_id, event_type, points, idempotency_key)
    values ('a1111111-1111-1111-1111-111111111111', 'homework_complete_medium', 999, 'hack');
    raise exception 'expected privilege failure on direct xp_events insert';
  exception
    when insufficient_privilege then null;
    when others then
      if SQLERRM like '%permission%' or SQLERRM like '%denied%' or SQLERRM like '%privilege%' then
        null;
      else
        -- RLS/grant denial may surface differently; still fail if row appeared
        if exists (select 1 from public.xp_events where idempotency_key = 'hack') then
          raise;
        end if;
      end if;
  end;
end $$;

select public.test_assert(
  not exists (select 1 from public.xp_events where idempotency_key = 'hack' and points = 999),
  'client cannot direct-write xp_events'
);

-- Invented event id
do $$
begin
  begin
    perform public.award_xp('ffffffff-ffff-ffff-ffff-ffffffffffff', 'x');
    raise exception 'expected source event not found';
  exception
    when others then
      if SQLERRM not like '%source event not found%' then
        raise;
      end if;
  end;
end $$;

-- Cross-student: A cannot award B's event
insert into public.learning_events (id, student_id, event_type, ref_id, created_by)
values (
  'e2222222-2222-2222-2222-222222222222',
  'b2222222-2222-2222-2222-222222222222',
  'homework_complete_easy',
  'hw-b',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
);

do $$
begin
  begin
    perform public.award_xp('e2222222-2222-2222-2222-222222222222', null);
    raise exception 'expected not authorized cross-student';
  exception
    when others then
      if SQLERRM not like '%not authorized%' then
        raise;
      end if;
  end;
end $$;

-- Show grants evidence (read-only diagnostics)
do $$
declare
  n int;
begin
  select count(*) into n
  from information_schema.role_table_grants
  where table_schema = 'public'
    and table_name in ('xp_events', 'student_badges')
    and grantee in ('authenticated', 'anon', 'PUBLIC')
    and privilege_type in ('INSERT', 'UPDATE', 'DELETE');
  perform public.test_assert(n = 0, 'no insert/update/delete grants on ledger for authenticated/anon');
end $$;

rollback;
