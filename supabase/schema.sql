-- Orbit Phase 0 — Postgres schema (Supabase)
-- Run in Supabase SQL Editor after you create the project.
-- App stays on local-demo auth until VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set.

create extension if not exists "pgcrypto";

create type public.orbit_role as enum ('student', 'parent', 'teacher', 'school');

create table public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique,
  created_at timestamptz not null default now()
);

-- 1:1 with auth.users; role claim drives UI persona
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  school_id uuid references public.schools (id) on delete set null,
  role public.orbit_role not null,
  display_name text not null,
  subtitle text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  profile_id uuid unique references public.profiles (id) on delete set null,
  class_name text not null,
  section text,
  roll_no text,
  created_at timestamptz not null default now()
);

create table public.parent_links (
  id uuid primary key default gen_random_uuid(),
  parent_profile_id uuid not null references public.profiles (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  relationship text default 'guardian',
  unique (parent_profile_id, student_id)
);

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  date date not null,
  status text not null check (status in ('Present', 'Absent')),
  reason text,
  marked_by uuid references public.profiles (id),
  unique (student_id, date)
);

create table public.fee_items (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  name text not null,
  amount_paise integer not null check (amount_paise >= 0),
  status text not null check (status in ('Unpaid', 'Pending', 'Overdue', 'Paid')),
  category text,
  due_date date,
  created_at timestamptz not null default now()
);

create index profiles_school_role_idx on public.profiles (school_id, role);
create index students_school_idx on public.students (school_id);
create index attendance_student_date_idx on public.attendance (student_id, date desc);
create index fee_items_student_idx on public.fee_items (student_id, status);

alter table public.schools enable row level security;
alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.parent_links enable row level security;
alter table public.attendance enable row level security;
alter table public.fee_items enable row level security;

-- Helpers
create or replace function public.current_profile_role()
returns public.orbit_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.current_school_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select school_id from public.profiles where id = auth.uid();
$$;

-- Profiles: users read/update self; school admins read same school
create policy profiles_select_self_or_school
  on public.profiles for select
  using (
    id = auth.uid()
    or (
      public.current_profile_role() = 'school'
      and school_id = public.current_school_id()
    )
  );

create policy profiles_update_self
  on public.profiles for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select p.role from public.profiles p where p.id = auth.uid())
    and school_id is not distinct from (select p.school_id from public.profiles p where p.id = auth.uid())
  );

create policy profiles_insert_self
  on public.profiles for insert
  with check (id = auth.uid());

create policy schools_select_member
  on public.schools for select
  using (id = public.current_school_id());

create policy students_select_scoped
  on public.students for select
  using (
    school_id = public.current_school_id()
    and (
      public.current_profile_role() in ('teacher', 'school')
      or profile_id = auth.uid()
      or exists (
        select 1 from public.parent_links pl
        where pl.student_id = students.id
          and pl.parent_profile_id = auth.uid()
      )
    )
  );

create policy attendance_select_scoped
  on public.attendance for select
  using (school_id = public.current_school_id());

create policy attendance_write_staff
  on public.attendance for all
  using (
    school_id = public.current_school_id()
    and public.current_profile_role() in ('teacher', 'school')
  )
  with check (
    school_id = public.current_school_id()
    and public.current_profile_role() in ('teacher', 'school')
  );

create policy fee_items_select_scoped
  on public.fee_items for select
  using (
    school_id = public.current_school_id()
    and (
      public.current_profile_role() in ('teacher', 'school')
      or exists (
        select 1 from public.students s
        where s.id = fee_items.student_id and s.profile_id = auth.uid()
      )
      or exists (
        select 1 from public.parent_links pl
        where pl.student_id = fee_items.student_id
          and pl.parent_profile_id = auth.uid()
      )
    )
  );

-- Auto-create profile row after signup (role from raw_user_meta_data.role)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, display_name, email, subtitle)
  values (
    new.id,
    coalesce((new.raw_user_meta_data ->> 'role')::public.orbit_role, 'student'),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data ->> 'subtitle'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Phase 0b — UPI + UTR payments (₹0 gateway path)
create table if not exists public.school_payment_settings (
  school_id uuid primary key references public.schools (id) on delete cascade,
  upi_id text not null,
  account_name text not null,
  bank_name text,
  ifsc text,
  instructions text,
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_submissions (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  submitted_by uuid references public.profiles (id) on delete set null,
  payer_name text,
  amount_paise integer not null check (amount_paise > 0),
  utr text not null,
  paid_on date,
  note text,
  status text not null default 'Pending' check (status in ('Pending', 'Verified', 'Rejected')),
  reviewed_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.school_payment_settings enable row level security;
alter table public.payment_submissions enable row level security;

drop policy if exists payment_settings_select_authenticated on public.school_payment_settings;
create policy payment_settings_select_authenticated on public.school_payment_settings
  for select to authenticated using (true);

drop policy if exists payment_settings_upsert_school on public.school_payment_settings;
create policy payment_settings_upsert_school on public.school_payment_settings
  for all to authenticated
  using (public.current_profile_role() = 'school')
  with check (public.current_profile_role() = 'school');

drop policy if exists payment_submissions_insert on public.payment_submissions;
create policy payment_submissions_insert on public.payment_submissions
  for insert to authenticated
  with check (
    public.current_profile_role() in ('parent', 'student', 'school')
    and (submitted_by is null or submitted_by = auth.uid())
  );

drop policy if exists payment_submissions_select on public.payment_submissions;
create policy payment_submissions_select on public.payment_submissions
  for select to authenticated
  using (
    public.current_profile_role() = 'school'
    or submitted_by = auth.uid()
    or public.current_profile_role() = 'parent'
  );

drop policy if exists payment_submissions_update_school on public.payment_submissions;
create policy payment_submissions_update_school on public.payment_submissions
  for update to authenticated
  using (public.current_profile_role() = 'school')
  with check (public.current_profile_role() = 'school');

-- Phase 0c — school ops sync (homework, leave, broadcasts, calendar)
create table if not exists public.homework_tasks (
  id bigserial primary key,
  school_id uuid references public.schools (id) on delete cascade,
  subject text not null,
  task text not null,
  due_label text,
  xp integer not null default 40,
  difficulty text not null default 'Medium',
  completed boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leave_requests (
  id bigserial primary key,
  school_id uuid references public.schools (id) on delete cascade,
  teacher_profile_id uuid references public.profiles (id) on delete set null,
  leave_date text not null,
  reason text not null,
  status text not null default 'Reviewing' check (status in ('Reviewing', 'Approved', 'Declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.broadcasts (
  id bigserial primary key,
  school_id uuid references public.schools (id) on delete cascade,
  target text not null,
  title text not null,
  content text not null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.calendar_events (
  id bigserial primary key,
  school_id uuid references public.schools (id) on delete cascade,
  title text not null,
  category text not null,
  event_date text not null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.homework_tasks enable row level security;
alter table public.leave_requests enable row level security;
alter table public.broadcasts enable row level security;
alter table public.calendar_events enable row level security;

drop policy if exists "homework_select_auth" on public.homework_tasks;
create policy "homework_select_auth" on public.homework_tasks for select to authenticated using (true);
drop policy if exists "homework_write_staff" on public.homework_tasks;
create policy "homework_write_staff" on public.homework_tasks for all
  using (public.current_profile_role() in ('teacher', 'school'))
  with check (public.current_profile_role() in ('teacher', 'school'));
drop policy if exists "homework_update_student" on public.homework_tasks;
create policy "homework_update_student" on public.homework_tasks for update
  using (public.current_profile_role() in ('student', 'parent', 'teacher', 'school'));

drop policy if exists "leaves_select_auth" on public.leave_requests;
create policy "leaves_select_auth" on public.leave_requests for select to authenticated using (true);
drop policy if exists "leaves_insert_teacher" on public.leave_requests;
create policy "leaves_insert_teacher" on public.leave_requests for insert
  with check (public.current_profile_role() in ('teacher', 'school'));
drop policy if exists "leaves_update_school" on public.leave_requests;
create policy "leaves_update_school" on public.leave_requests for update
  using (public.current_profile_role() in ('school', 'teacher'));

drop policy if exists "broadcasts_select_auth" on public.broadcasts;
create policy "broadcasts_select_auth" on public.broadcasts for select to authenticated using (true);
drop policy if exists "broadcasts_write_school" on public.broadcasts;
create policy "broadcasts_write_school" on public.broadcasts for all
  using (public.current_profile_role() = 'school')
  with check (public.current_profile_role() = 'school');

drop policy if exists "calendar_select_auth" on public.calendar_events;
create policy "calendar_select_auth" on public.calendar_events for select to authenticated using (true);
drop policy if exists "calendar_write_school" on public.calendar_events;
create policy "calendar_write_school" on public.calendar_events for all
  using (public.current_profile_role() = 'school')
  with check (public.current_profile_role() = 'school');

-- Phase 1 — attendance roster names, grades, fee writes, demo identity seed
alter table public.students add column if not exists display_name text;

create table if not exists public.student_grades (
  id text primary key,
  school_id uuid not null references public.schools (id) on delete cascade,
  student_id uuid references public.students (id) on delete set null,
  student_name text not null,
  math text not null default '',
  science text not null default '',
  chem text not null default '',
  comment text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.student_grades enable row level security;

drop policy if exists grades_select_scoped on public.student_grades;
create policy grades_select_scoped on public.student_grades for select
  using (school_id = public.current_school_id());

drop policy if exists grades_write_staff on public.student_grades;
create policy grades_write_staff on public.student_grades for all
  using (
    school_id = public.current_school_id()
    and public.current_profile_role() in ('teacher', 'school')
  )
  with check (
    school_id = public.current_school_id()
    and public.current_profile_role() in ('teacher', 'school')
  );

drop policy if exists fee_items_write_school on public.fee_items;
create policy fee_items_write_school on public.fee_items for all
  using (
    school_id = public.current_school_id()
    and public.current_profile_role() in ('school', 'teacher', 'parent')
  )
  with check (
    school_id = public.current_school_id()
    and public.current_profile_role() in ('school', 'teacher', 'parent')
  );

drop policy if exists students_update_staff_or_claim on public.students;
create policy students_update_staff_or_claim on public.students for update
  using (
    school_id = public.current_school_id()
    and (
      public.current_profile_role() in ('teacher', 'school')
      or (
        public.current_profile_role() = 'student'
        and id = 'a1111111-1111-4111-8111-111111111101'
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
        and id = 'a1111111-1111-4111-8111-111111111101'
        and profile_id = auth.uid()
      )
    )
  );

drop policy if exists parent_links_select_scoped on public.parent_links;
create policy parent_links_select_scoped on public.parent_links for select
  using (
    parent_profile_id = auth.uid()
    or public.current_profile_role() in ('teacher', 'school')
    or exists (
      select 1 from public.students s
      where s.id = parent_links.student_id and s.profile_id = auth.uid()
    )
  );

-- See also:
--   supabase/trust_hardening.sql  — invites, syllabus_state, RLS tighten, redeem_class_invite
--   supabase/seed.sql             — Sunrise pilot rows + invite codes
--   supabase/alerts.sql           — push / SMS / preferences

