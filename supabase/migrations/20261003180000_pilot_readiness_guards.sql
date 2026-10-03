-- Pilot readiness: clamp self-signup roles, XP daily cap, hiring already staff-only (reassert).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested text;
  assigned public.orbit_role;
begin
  requested := lower(coalesce(new.raw_user_meta_data ->> 'role', 'student'));
  if requested in ('student', 'parent') then
    assigned := requested::public.orbit_role;
  else
    assigned := 'student';
  end if;

  insert into public.profiles (id, role, display_name, email, subtitle)
  values (
    new.id,
    assigned,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(coalesce(new.email, 'user'), '@', 1)),
    new.email,
    new.raw_user_meta_data ->> 'subtitle'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self
  on public.profiles for insert
  with check (
    id = auth.uid()
    and role in ('student', 'parent')
  );

-- Students can still insert learning_events; award_xp refuses after 40 ledger rows / UTC day.
create or replace function public.award_xp(
  p_learning_event_id uuid,
  p_idempotency_key text default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  ev public.learning_events%rowtype;
  rule public.xp_award_rules%rowtype;
  idem text;
  awarded_today integer;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select * into ev from public.learning_events where id = p_learning_event_id;
  if not found then
    raise exception 'source event not found';
  end if;

  if ev.created_by <> auth.uid() then
    raise exception 'not authorized';
  end if;

  if not exists (
    select 1 from public.students s
    where s.id = ev.student_id and s.profile_id = auth.uid()
  ) then
    raise exception 'not authorized';
  end if;

  select * into rule from public.xp_award_rules where event_type = ev.event_type;
  if not found then
    raise exception 'unknown event type';
  end if;

  select count(*)::integer into awarded_today
  from public.xp_events
  where student_id = ev.student_id
    and created_at >= (timezone('utc', now()))::date;

  if awarded_today >= 40 then
    raise exception 'daily xp cap reached';
  end if;

  idem := coalesce(nullif(trim(p_idempotency_key), ''), p_learning_event_id::text);

  insert into public.xp_events (student_id, event_type, ref_id, points, idempotency_key)
  values (ev.student_id, ev.event_type, ev.ref_id, rule.points, idem)
  on conflict (student_id, idempotency_key) do nothing;

  if rule.badge_name is not null then
    insert into public.student_badges (student_id, badge_name)
    values (ev.student_id, rule.badge_name)
    on conflict (student_id, badge_name) do nothing;
  end if;
end;
$$;

revoke all on function public.award_xp(uuid, text) from public;
revoke all on function public.award_xp(uuid, text) from anon;
grant execute on function public.award_xp(uuid, text) to authenticated;
