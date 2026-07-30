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
  using (id = auth.uid());

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
