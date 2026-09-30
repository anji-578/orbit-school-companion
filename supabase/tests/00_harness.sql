-- Minimal schema for SECURITY DEFINER / RLS isolation tests (CI Postgres).
-- Does not require full Supabase Auth; stubs auth.uid() via request.jwt.claim.sub.

create extension if not exists pgcrypto;

create schema if not exists auth;

create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

do $$ begin
  create role authenticated nologin;
exception when duplicate_object then null;
end $$;
do $$ begin
  create role anon nologin;
exception when duplicate_object then null;
end $$;

grant usage on schema public to authenticated, anon;

do $$ begin
  create type public.orbit_role as enum ('student', 'parent', 'teacher', 'school');
exception when duplicate_object then null;
end $$;

create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key,
  school_id uuid references public.schools (id) on delete set null,
  role public.orbit_role not null,
  display_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  profile_id uuid unique references public.profiles (id) on delete set null,
  class_name text not null default 'Grade 8-A',
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.parent_links (
  id uuid primary key default gen_random_uuid(),
  parent_profile_id uuid not null references public.profiles (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  unique (parent_profile_id, student_id)
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  date date not null,
  status text not null check (status in ('Present', 'Absent')),
  unique (student_id, date)
);

create table if not exists public.homework_completions (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  task_ref text not null,
  completed boolean not null default false
);

alter table public.schools enable row level security;
alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.attendance enable row level security;
alter table public.homework_completions enable row level security;

alter table public.students force row level security;
alter table public.attendance force row level security;
alter table public.homework_completions force row level security;

drop policy if exists students_select_own on public.students;
create policy students_select_own on public.students
  for select using (profile_id = auth.uid());

drop policy if exists attendance_select_own on public.attendance;
create policy attendance_select_own on public.attendance
  for select using (
    student_id in (select id from public.students where profile_id = auth.uid())
  );

drop policy if exists homework_completions_select_own on public.homework_completions;
create policy homework_completions_select_own on public.homework_completions
  for select using (
    student_id in (select id from public.students where profile_id = auth.uid())
  );

grant select on public.schools, public.profiles, public.students, public.attendance, public.homework_completions to authenticated;
