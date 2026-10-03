-- Authoritative live isolation for the 1,000-student pilot.
-- Replaces overlapping dashboard policies; does not assume earlier SQL still wins.

-- ---------- identity helpers ----------
create or replace function public.is_my_student_row(p_student_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.students where id = p_student_id and profile_id = auth.uid());
$$;

create or replace function public.is_parent_of_student(p_student_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.parent_links
    where student_id = p_student_id and parent_profile_id = auth.uid()
  );
$$;

create or replace function public.is_teacher_of_student(p_student_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.students s
    join public.teacher_classes tc
      on tc.school_id = s.school_id
     and tc.class_name = s.class_name
     and coalesce(tc.section, '') = coalesce(s.section, '')
    where s.id = p_student_id
      and tc.teacher_profile_id = auth.uid()
  );
$$;

revoke all on function public.is_my_student_row(uuid) from public, anon;
revoke all on function public.is_parent_of_student(uuid) from public, anon;
revoke all on function public.is_teacher_of_student(uuid) from public, anon;
grant execute on function public.is_my_student_row(uuid) to authenticated;
grant execute on function public.is_parent_of_student(uuid) to authenticated;
grant execute on function public.is_teacher_of_student(uuid) to authenticated;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
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

-- ---------- XP / learning (idempotent if already present) ----------
create table if not exists public.xp_events (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  event_type text not null,
  ref_id text,
  points integer not null check (points >= 0),
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  unique (student_id, idempotency_key)
);
create table if not exists public.student_badges (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  badge_name text not null,
  awarded_at timestamptz not null default now(),
  unique (student_id, badge_name)
);
create or replace view public.student_xp_totals as
select student_id, coalesce(sum(points), 0)::integer as total_xp
from public.xp_events group by student_id;

create table if not exists public.xp_award_rules (
  event_type text primary key,
  points integer not null check (points >= 0),
  badge_name text,
  description text not null default ''
);
insert into public.xp_award_rules (event_type, points, badge_name, description) values
  ('homework_complete_easy', 15, null, 'Complete easy homework'),
  ('homework_complete_medium', 25, null, 'Complete medium homework'),
  ('homework_complete_hard', 45, null, 'Complete hard homework'),
  ('homework_all_done', 0, 'Task Master', 'All homework complete'),
  ('quiz_perfect', 100, 'Quiz Whiz', 'Perfect quiz score'),
  ('scan_practice_pass', 100, 'Concept Master', 'Paper coach practice passed'),
  ('scan_practice_scholar', 0, 'Rising Scholar', 'Paper coach practice badge'),
  ('gk_pass_easy', 55, 'GK Starter', 'GK easy pass'),
  ('gk_pass_medium', 70, 'GK Explorer', 'GK medium pass'),
  ('gk_pass_hard', 80, 'GK Champion', 'GK hard pass'),
  ('gk_attempt', 15, null, 'GK attempt without pass'),
  ('ask_orbit_helpful', 10, 'Curious Mind', 'Ask Orbit non-refusal answer')
on conflict (event_type) do update set
  points = excluded.points, badge_name = excluded.badge_name, description = excluded.description;

create table if not exists public.learning_events (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  event_type text not null references public.xp_award_rules(event_type),
  ref_id text,
  created_by uuid not null,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  school_id uuid,
  feature text not null,
  model text,
  request_id text not null,
  input_tokens integer,
  output_tokens integer,
  estimated_cost numeric(12, 6),
  created_at timestamptz not null default now(),
  unique (user_id, request_id)
);
create index if not exists ai_usage_user_created_idx on public.ai_usage (user_id, created_at desc);
create index if not exists ai_usage_school_created_idx on public.ai_usage (school_id, created_at desc);

alter table public.xp_events enable row level security;
alter table public.student_badges enable row level security;
alter table public.learning_events enable row level security;
alter table public.xp_award_rules enable row level security;
alter table public.ai_usage enable row level security;
alter table public.xp_events force row level security;
alter table public.student_badges force row level security;
alter table public.learning_events force row level security;
alter table public.ai_usage force row level security;

drop policy if exists xp_events_select_own on public.xp_events;
create policy xp_events_select_own on public.xp_events for select to authenticated
  using (public.is_my_student_row(student_id) or public.is_parent_of_student(student_id));
drop policy if exists student_badges_select_own on public.student_badges;
create policy student_badges_select_own on public.student_badges for select to authenticated
  using (public.is_my_student_row(student_id) or public.is_parent_of_student(student_id));
drop policy if exists learning_events_select_own on public.learning_events;
create policy learning_events_select_own on public.learning_events for select to authenticated
  using (public.is_my_student_row(student_id));
drop policy if exists learning_events_insert_own on public.learning_events;
create policy learning_events_insert_own on public.learning_events for insert to authenticated
  with check (created_by = auth.uid() and public.is_my_student_row(student_id));
drop policy if exists xp_award_rules_select_auth on public.xp_award_rules;
create policy xp_award_rules_select_auth on public.xp_award_rules for select to authenticated using (true);
drop policy if exists ai_usage_select_own on public.ai_usage;
create policy ai_usage_select_own on public.ai_usage for select to authenticated
  using (user_id = auth.uid() or (school_id = public.current_school_id() and public.current_profile_role() = 'school'));

revoke insert, update, delete on public.xp_events from authenticated, anon, public;
revoke insert, update, delete on public.student_badges from authenticated, anon, public;
revoke insert, update, delete on public.ai_usage from authenticated, anon, public;
grant select on public.xp_events, public.student_badges, public.student_xp_totals, public.xp_award_rules, public.ai_usage to authenticated;
grant select, insert on public.learning_events to authenticated;

create or replace function public.award_xp(p_learning_event_id uuid, p_idempotency_key text default null)
returns void language plpgsql security definer set search_path = public as $$
declare
  ev public.learning_events%rowtype;
  rule public.xp_award_rules%rowtype;
  idem text;
  awarded_today integer;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select * into ev from public.learning_events where id = p_learning_event_id;
  if not found then raise exception 'source event not found'; end if;
  if ev.created_by <> auth.uid() then raise exception 'not authorized'; end if;
  if not public.is_my_student_row(ev.student_id) then raise exception 'not authorized'; end if;
  select * into rule from public.xp_award_rules where event_type = ev.event_type;
  if not found then raise exception 'unknown event type'; end if;
  select count(*)::integer into awarded_today
  from public.xp_events
  where student_id = ev.student_id and created_at >= (timezone('utc', now()))::date;
  if awarded_today >= 40 then raise exception 'daily xp cap reached'; end if;
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
revoke all on function public.award_xp(uuid, text) from public, anon;
grant execute on function public.award_xp(uuid, text) to authenticated;

-- ---------- drop overlapping live policies ----------
drop policy if exists "Users access own profile" on public.profiles;
drop policy if exists profiles_select_self_or_staff on public.profiles;
drop policy if exists profiles_insert_self on public.profiles;
drop policy if exists profiles_update_self on public.profiles;
drop policy if exists profiles_select_self_or_school on public.profiles;
drop policy if exists "Users access own student record" on public.students;
drop policy if exists students_select_scoped on public.students;
drop policy if exists students_update_staff_or_claim on public.students;
drop policy if exists students_insert_staff on public.students;
drop policy if exists "Parents access own links" on public.parent_links;
drop policy if exists parent_links_select_scoped on public.parent_links;
drop policy if exists parent_links_insert_school on public.parent_links;
drop policy if exists parent_links_insert_self on public.parent_links;
drop policy if exists "Users access linked attendance" on public.attendance;
drop policy if exists attendance_select_scoped on public.attendance;
drop policy if exists attendance_write_staff on public.attendance;
drop policy if exists attendance_update_staff on public.attendance;
drop policy if exists "Users access linked fees" on public.fee_items;
drop policy if exists fee_items_select_scoped on public.fee_items;
drop policy if exists fee_items_write_school on public.fee_items;
drop policy if exists "Users access own homework completions" on public.homework_completions;
drop policy if exists homework_completions_select on public.homework_completions;
drop policy if exists homework_completions_write_student on public.homework_completions;
drop policy if exists homework_completions_write_staff on public.homework_completions;
drop policy if exists schools_select_authenticated on public.schools;
drop policy if exists schools_select_own on public.schools;
drop policy if exists schools_select_member on public.schools;
drop policy if exists "Users access own payment orders" on public.payment_orders;
drop policy if exists payment_orders_select on public.payment_orders;
drop policy if exists homework_update_student on public.homework_tasks;
drop policy if exists homework_select_members on public.homework_tasks;
drop policy if exists homework_select_school on public.homework_tasks;
drop policy if exists homework_write_staff on public.homework_tasks;

create policy profiles_select_self_or_staff on public.profiles for select to authenticated
  using (
    id = auth.uid()
    or (school_id = public.current_school_id() and public.current_profile_role() in ('teacher', 'school'))
  );
create policy profiles_insert_self on public.profiles for insert to authenticated
  with check (id = auth.uid() and role in ('student', 'parent'));
create policy profiles_update_self on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select p.role from public.profiles p where p.id = auth.uid())
    and school_id is not distinct from (select p.school_id from public.profiles p where p.id = auth.uid())
  );

create policy schools_select_own on public.schools for select to authenticated
  using (id = public.current_school_id());

create policy students_select_scoped on public.students for select to authenticated
  using (
    school_id = public.current_school_id()
    and (
      public.current_profile_role() = 'school'
      or profile_id = auth.uid()
      or public.is_parent_of_student(id)
      or public.is_teacher_of_student(id)
    )
  );
create policy students_insert_staff on public.students for insert to authenticated
  with check (school_id = public.current_school_id() and public.current_profile_role() in ('teacher', 'school'));
create policy students_update_staff_or_claim on public.students for update to authenticated
  using (
    school_id = public.current_school_id()
    and (
      public.current_profile_role() in ('teacher', 'school')
      or (public.current_profile_role() = 'student' and (profile_id is null or profile_id = auth.uid()))
    )
  )
  with check (school_id = public.current_school_id());

create policy parent_links_select_scoped on public.parent_links for select to authenticated
  using (
    parent_profile_id = auth.uid()
    or public.is_my_student_row(student_id)
    or public.current_profile_role() in ('teacher', 'school')
  );
create policy parent_links_insert_school on public.parent_links for insert to authenticated
  with check (public.current_profile_role() = 'school');

create policy attendance_select_scoped on public.attendance for select to authenticated
  using (
    school_id = public.current_school_id()
    and (
      public.current_profile_role() = 'school'
      or public.is_teacher_of_student(student_id)
      or public.is_my_student_row(student_id)
      or public.is_parent_of_student(student_id)
    )
  );
create policy attendance_write_staff on public.attendance for insert to authenticated
  with check (
    school_id = public.current_school_id()
    and (public.current_profile_role() = 'school' or public.is_teacher_of_student(student_id))
  );
create policy attendance_update_staff on public.attendance for update to authenticated
  using (
    school_id = public.current_school_id()
    and (public.current_profile_role() = 'school' or public.is_teacher_of_student(student_id))
  );

create policy fee_items_select_scoped on public.fee_items for select to authenticated
  using (
    school_id = public.current_school_id()
    and (
      public.current_profile_role() = 'school'
      or public.is_my_student_row(student_id)
      or public.is_parent_of_student(student_id)
    )
  );
create policy fee_items_write_school on public.fee_items for all to authenticated
  using (school_id = public.current_school_id() and public.current_profile_role() = 'school')
  with check (school_id = public.current_school_id() and public.current_profile_role() = 'school');

create policy homework_select_members on public.homework_tasks for select to authenticated
  using (school_id = public.current_school_id());
create policy homework_write_staff on public.homework_tasks for all to authenticated
  using (school_id = public.current_school_id() and public.current_profile_role() in ('teacher', 'school'))
  with check (school_id = public.current_school_id() and public.current_profile_role() in ('teacher', 'school'));
create policy homework_update_student on public.homework_tasks for update to authenticated
  using (school_id = public.current_school_id() and public.current_profile_role() in ('student', 'parent'))
  with check (school_id = public.current_school_id());

create policy homework_completions_select on public.homework_completions for select to authenticated
  using (
    public.is_my_student_row(student_id)
    or public.is_parent_of_student(student_id)
    or public.is_teacher_of_student(student_id)
    or public.current_profile_role() = 'school'
  );
create policy homework_completions_write_student on public.homework_completions for all to authenticated
  using (public.current_profile_role() = 'student' and public.is_my_student_row(student_id))
  with check (public.current_profile_role() = 'student' and public.is_my_student_row(student_id));
create policy homework_completions_write_staff on public.homework_completions for all to authenticated
  using (public.current_profile_role() in ('teacher', 'school'))
  with check (public.current_profile_role() in ('teacher', 'school'));

create policy payment_orders_select on public.payment_orders for select to authenticated
  using (
    school_id = public.current_school_id()
    and (public.current_profile_role() = 'school' or created_by = auth.uid())
  );

-- ---------- storage: private syllabus notes, school folder ----------
update storage.buckets set public = false where id = 'syllabus-notes';
drop policy if exists syllabus_notes_select on storage.objects;
create policy syllabus_notes_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'syllabus-notes'
    and public.current_school_id() is not null
    and (storage.foldername(name))[1] = public.current_school_id()::text
  );
drop policy if exists syllabus_notes_insert_staff on storage.objects;
create policy syllabus_notes_insert_staff on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'syllabus-notes'
    and public.current_profile_role() in ('teacher', 'school')
    and (storage.foldername(name))[1] = public.current_school_id()::text
  );
drop policy if exists syllabus_notes_update_staff on storage.objects;
create policy syllabus_notes_update_staff on storage.objects
  for update to authenticated
  using (
    bucket_id = 'syllabus-notes'
    and public.current_profile_role() in ('teacher', 'school')
    and (storage.foldername(name))[1] = public.current_school_id()::text
  )
  with check (
    bucket_id = 'syllabus-notes'
    and public.current_profile_role() in ('teacher', 'school')
    and (storage.foldername(name))[1] = public.current_school_id()::text
  );
