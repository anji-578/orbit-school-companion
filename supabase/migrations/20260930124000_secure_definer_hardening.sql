-- Harden SECURITY DEFINER RPCs: ownership checks, revoke anon, idempotent award_xp.

create or replace function public.award_xp(
  p_student_id uuid,
  p_event_type text,
  p_ref_id text,
  p_points integer,
  p_idempotency_key text,
  p_badge text default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  if p_points < 0 then
    raise exception 'points must be non-negative';
  end if;
  if p_idempotency_key is null or length(trim(p_idempotency_key)) = 0 then
    raise exception 'idempotency_key required';
  end if;
  -- Caller may only award for a student linked to their profile (or school role).
  if not exists (
    select 1
    from public.students s
    where s.id = p_student_id
      and (
        s.profile_id = auth.uid()
        or exists (
          select 1 from public.profiles p
          where p.id = auth.uid() and p.role = 'school' and p.school_id = s.school_id
        )
      )
  ) then
    raise exception 'not authorized';
  end if;

  insert into public.xp_events (student_id, event_type, ref_id, points, idempotency_key)
  values (p_student_id, p_event_type, p_ref_id, p_points, p_idempotency_key)
  on conflict (student_id, idempotency_key) do nothing;

  if p_badge is not null then
    insert into public.student_badges (student_id, badge_name)
    values (p_student_id, p_badge)
    on conflict (student_id, badge_name) do nothing;
  end if;
end;
$$;

revoke all on function public.award_xp(uuid, text, text, integer, text, text) from public;
revoke all on function public.award_xp(uuid, text, text, integer, text, text) from anon;
grant execute on function public.award_xp(uuid, text, text, integer, text, text) to authenticated;

create or replace function public.export_student_data(p_student_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  if not exists (
    select 1 from public.students s
    where s.id = p_student_id
      and (
        s.profile_id = auth.uid()
        or exists (
          select 1 from public.parent_links pl
          where pl.student_id = s.id and pl.parent_profile_id = auth.uid()
        )
        or exists (
          select 1 from public.profiles p
          where p.id = auth.uid() and p.role = 'school' and p.school_id = s.school_id
        )
      )
  ) then
    raise exception 'not authorized';
  end if;

  select jsonb_build_object(
    'student', (select to_jsonb(s) from public.students s where s.id = p_student_id),
    'consents', coalesce((select jsonb_agg(to_jsonb(c)) from public.consents c where c.subject_student_id = p_student_id), '[]'::jsonb),
    'xp_events', coalesce((select jsonb_agg(to_jsonb(x)) from public.xp_events x where x.student_id = p_student_id), '[]'::jsonb),
    'attempts', coalesce((select jsonb_agg(to_jsonb(a)) from public.attempts a where a.student_id = p_student_id), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.export_student_data(uuid) from public;
revoke all on function public.export_student_data(uuid) from anon;
grant execute on function public.export_student_data(uuid) to authenticated;

create or replace function public.anonymize_student(p_student_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  if not exists (
    select 1 from public.profiles p
    join public.students s on s.school_id = p.school_id
    where p.id = auth.uid() and p.role = 'school' and s.id = p_student_id
  ) then
    raise exception 'not authorized';
  end if;
  update public.students
    set display_name = 'Anonymized Student',
        profile_id = null
  where id = p_student_id;
  delete from public.consents where subject_student_id = p_student_id;
end;
$$;

revoke all on function public.anonymize_student(uuid) from public;
revoke all on function public.anonymize_student(uuid) from anon;
grant execute on function public.anonymize_student(uuid) to authenticated;

-- Deny direct client writes to XP ledger
revoke insert, update, delete on public.xp_events from authenticated, anon, public;
revoke insert, update, delete on public.student_badges from authenticated, anon, public;
grant select on public.xp_events to authenticated;
grant select on public.student_badges to authenticated;
grant select on public.student_xp_totals to authenticated;
