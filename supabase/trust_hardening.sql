-- Orbit trust hardening — run after schema.sql (idempotent).
-- Adds invites + syllabus sync, tightens RLS, redeem RPC.

-- Allow reading school directory (needed before profile.school_id is set)
drop policy if exists schools_select_member on public.schools;
drop policy if exists schools_select_authenticated on public.schools;
create policy schools_select_authenticated on public.schools
  for select to authenticated using (true);

-- Invites
create table if not exists public.class_invites (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  school_id uuid not null references public.schools (id) on delete cascade,
  role public.orbit_role not null,
  student_id uuid references public.students (id) on delete set null,
  class_name text,
  max_uses integer not null default 50,
  use_count integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.class_invites enable row level security;

drop policy if exists class_invites_select_school on public.class_invites;
create policy class_invites_select_school on public.class_invites
  for select to authenticated
  using (public.current_profile_role() = 'school' and school_id = public.current_school_id());

drop policy if exists class_invites_write_school on public.class_invites;
create policy class_invites_write_school on public.class_invites
  for all to authenticated
  using (public.current_profile_role() = 'school' and school_id = public.current_school_id())
  with check (public.current_profile_role() = 'school' and school_id = public.current_school_id());

-- Syllabus shared state (progress + note metadata; large note blobs stay client-side)
create table if not exists public.syllabus_state (
  school_id uuid not null references public.schools (id) on delete cascade,
  class_name text not null default 'Grade 8-A',
  curriculum jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null,
  primary key (school_id, class_name)
);

alter table public.syllabus_state enable row level security;

drop policy if exists syllabus_select_school on public.syllabus_state;
create policy syllabus_select_school on public.syllabus_state
  for select to authenticated
  using (school_id = public.current_school_id());

drop policy if exists syllabus_write_staff on public.syllabus_state;
create policy syllabus_write_staff on public.syllabus_state
  for all to authenticated
  using (
    school_id = public.current_school_id()
    and public.current_profile_role() in ('teacher', 'school')
  )
  with check (
    school_id = public.current_school_id()
    and public.current_profile_role() in ('teacher', 'school')
  );

-- Redeem invite (security definer — works before school_id is set)
create or replace function public.redeem_class_invite(invite_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  inv public.class_invites%rowtype;
  my_role public.orbit_role;
  uid uuid := auth.uid();
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'error', 'Not signed in');
  end if;

  select * into inv
  from public.class_invites
  where upper(code) = upper(trim(invite_code))
    and active = true
  limit 1;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Invalid or inactive invite code');
  end if;

  if inv.use_count >= inv.max_uses then
    return jsonb_build_object('ok', false, 'error', 'Invite code has reached its use limit');
  end if;

  select role into my_role from public.profiles where id = uid;
  if my_role is null then
    return jsonb_build_object('ok', false, 'error', 'Profile missing');
  end if;

  if my_role <> inv.role then
    return jsonb_build_object(
      'ok', false,
      'error', format('This code is for %s accounts (you signed in as %s)', inv.role, my_role)
    );
  end if;

  update public.profiles
  set school_id = inv.school_id, updated_at = now()
  where id = uid;

  if my_role = 'student' and inv.student_id is not null then
    update public.students
    set profile_id = uid
    where id = inv.student_id
      and (profile_id is null or profile_id = uid);
  elsif my_role = 'parent' and inv.student_id is not null then
    insert into public.parent_links (parent_profile_id, student_id, relationship)
    values (uid, inv.student_id, 'guardian')
    on conflict (parent_profile_id, student_id) do nothing;
  end if;

  update public.class_invites
  set use_count = use_count + 1
  where id = inv.id;

  return jsonb_build_object(
    'ok', true,
    'school_id', inv.school_id,
    'class_name', inv.class_name,
    'role', inv.role
  );
end;
$$;

revoke all on function public.redeem_class_invite(text) from public;
grant execute on function public.redeem_class_invite(text) to authenticated;

-- ---- RLS tighten ----

-- Payment settings: school members only
drop policy if exists payment_settings_select_authenticated on public.school_payment_settings;
create policy payment_settings_select_school_members on public.school_payment_settings
  for select to authenticated
  using (school_id = public.current_school_id());

-- Parents only see own UTR submissions (not all parents)
drop policy if exists payment_submissions_select on public.payment_submissions;
create policy payment_submissions_select on public.payment_submissions
  for select to authenticated
  using (
    school_id = public.current_school_id()
    and (
      public.current_profile_role() = 'school'
      or submitted_by = auth.uid()
    )
  );

-- Fee writes: school only (not parents self-clearing)
drop policy if exists fee_items_write_school on public.fee_items;
create policy fee_items_write_school on public.fee_items
  for all to authenticated
  using (
    school_id = public.current_school_id()
    and public.current_profile_role() = 'school'
  )
  with check (
    school_id = public.current_school_id()
    and public.current_profile_role() = 'school'
  );

-- Teachers may mark Pending after UTR submit via school role path;
-- parent submit only creates payment_submissions; school verifies → mark paid.

-- Ops tables: school-scoped
drop policy if exists "homework_select_auth" on public.homework_tasks;
create policy homework_select_school on public.homework_tasks
  for select to authenticated
  using (school_id = public.current_school_id() or school_id is null);

drop policy if exists "leaves_select_auth" on public.leave_requests;
create policy leaves_select_school on public.leave_requests
  for select to authenticated
  using (
    school_id = public.current_school_id()
    or teacher_profile_id = auth.uid()
    or school_id is null
  );

drop policy if exists "broadcasts_select_auth" on public.broadcasts;
create policy broadcasts_select_school on public.broadcasts
  for select to authenticated
  using (school_id = public.current_school_id() or school_id is null);

drop policy if exists "calendar_select_auth" on public.calendar_events;
create policy calendar_select_school on public.calendar_events
  for select to authenticated
  using (school_id = public.current_school_id() or school_id is null);

-- Grades: staff all; student/parent only linked child
drop policy if exists grades_select_scoped on public.student_grades;
create policy grades_select_scoped on public.student_grades
  for select to authenticated
  using (
    school_id = public.current_school_id()
    and (
      public.current_profile_role() in ('teacher', 'school')
      or exists (
        select 1 from public.students s
        where s.id = student_grades.student_id and s.profile_id = auth.uid()
      )
      or exists (
        select 1 from public.parent_links pl
        where pl.student_id = student_grades.student_id
          and pl.parent_profile_id = auth.uid()
      )
    )
  );

-- Attendance: staff all; student/parent own
drop policy if exists attendance_select_scoped on public.attendance;
create policy attendance_select_scoped on public.attendance
  for select to authenticated
  using (
    school_id = public.current_school_id()
    and (
      public.current_profile_role() in ('teacher', 'school')
      or exists (
        select 1 from public.students s
        where s.id = attendance.student_id and s.profile_id = auth.uid()
      )
      or exists (
        select 1 from public.parent_links pl
        where pl.student_id = attendance.student_id
          and pl.parent_profile_id = auth.uid()
      )
    )
  );

-- Parent links insert: school staff OR self via redeem only (redeem is definer)
drop policy if exists parent_links_insert_self on public.parent_links;
create policy parent_links_insert_school on public.parent_links
  for insert to authenticated
  with check (public.current_profile_role() = 'school');

-- Student claim: staff can assign; student can claim own row if profile_id null/self (any seeded id)
drop policy if exists students_update_staff_or_claim on public.students;
create policy students_update_staff_or_claim on public.students
  for update to authenticated
  using (
    school_id = public.current_school_id()
    and (
      public.current_profile_role() in ('teacher', 'school')
      or (
        public.current_profile_role() = 'student'
        and (profile_id is null or profile_id = auth.uid())
      )
    )
  )
  with check (
    school_id = public.current_school_id()
    and (
      public.current_profile_role() in ('teacher', 'school')
      or (
        public.current_profile_role() = 'student'
        and profile_id = auth.uid()
      )
    )
  );
