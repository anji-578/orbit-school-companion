-- Harness for supabase/postgres image (real auth schema + roles).
-- Does NOT stub auth.uid() when already provided by the image.

create extension if not exists pgcrypto;

-- Ensure JWT claim helper works like PostgREST (supabase images include auth.uid)
create or replace function public.test_set_auth(uid uuid, role_name text default 'authenticated')
returns void
language plpgsql
as $$
begin
  perform set_config('request.jwt.claim.sub', uid::text, true);
  perform set_config('request.jwt.claim.role', role_name, true);
  perform set_config('role', role_name, true);
end;
$$;

do $$ begin
  create type public.orbit_role as enum ('student', 'parent', 'teacher', 'school');
exception when duplicate_object then null;
end $$;

create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique,
  is_demo boolean not null default false,
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

grant usage on schema public to authenticated, anon;
grant select on public.schools, public.profiles, public.students, public.attendance, public.homework_completions to authenticated;

-- ── CI substrate: objects that live outside supabase/migrations/ in prod dumps ──
-- Later migrations (pilot isolation, teacher auth, DSAR) assume these exist.

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists subtitle text;
alter table public.students add column if not exists section text;
alter table public.students add column if not exists active boolean not null default true;

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

revoke all on function public.current_profile_role() from public, anon;
revoke all on function public.current_school_id() from public, anon;
grant execute on function public.current_profile_role() to authenticated;
grant execute on function public.current_school_id() to authenticated;

create table if not exists public.teacher_classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  teacher_profile_id uuid not null references public.profiles (id) on delete cascade,
  class_name text not null,
  section text,
  created_at timestamptz not null default now(),
  unique (teacher_profile_id, class_name, section)
);

create table if not exists public.hiring_applications (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  name text not null,
  subject text not null,
  experience text,
  qualification text,
  status text not null default 'Applied'
    check (status in ('Applied', 'Interview Scheduled', 'Hired', 'Declined')),
  applied_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create table if not exists public.homework_tasks (
  id bigserial primary key,
  school_id uuid references public.schools (id) on delete cascade,
  subject text not null,
  task text not null,
  due_label text,
  xp integer not null default 40,
  difficulty text not null default 'Medium',
  completed boolean not null default false,
  class_name text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.class_timetable (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  class_name text not null default 'Grade 8-A',
  day_code text not null check (day_code in ('MON', 'TUE', 'WED', 'THU', 'FRI')),
  slot_type text not null check (slot_type in ('Theory', 'Lab')),
  code text not null,
  name text not null,
  start_time text not null,
  end_time text not null,
  room text,
  teacher_name text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
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

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.fee_items (
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

create table if not exists public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  created_by uuid not null references public.profiles (id) on delete cascade,
  student_id uuid references public.students (id) on delete set null,
  fee_item_ids uuid[] not null default '{}',
  amount_paise integer not null check (amount_paise > 0),
  razorpay_order_id text not null unique,
  status text not null default 'created'
    check (status = any (array['created'::text, 'paid'::text, 'failed'::text])),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table if not exists public.school_payment_settings (
  school_id uuid primary key references public.schools (id) on delete cascade,
  upi_id text not null,
  account_name text not null,
  bank_name text,
  ifsc text,
  instructions text,
  updated_at timestamptz not null default now()
);

create table if not exists public.bus_routes (
  id text primary key,
  school_id uuid not null references public.schools (id) on delete cascade,
  name text not null,
  route_label text,
  driver_name text,
  driver_phone text,
  capacity text,
  status text not null default 'idle'
    check (status in ('en_route', 'at_school', 'idle', 'cancelled')),
  eta_text text,
  last_updated_at timestamptz not null default now()
);

create table if not exists public.staff_directory (
  id text primary key,
  school_id uuid not null references public.schools (id) on delete cascade,
  display_name text not null,
  subject_key text not null default 'mathSubject',
  qualification text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.teacher_classes enable row level security;
alter table public.hiring_applications enable row level security;
alter table public.student_grades enable row level security;
alter table public.homework_tasks enable row level security;
alter table public.class_timetable enable row level security;
alter table public.leave_requests enable row level security;
alter table public.broadcasts enable row level security;
alter table public.calendar_events enable row level security;
alter table public.audit_log enable row level security;
alter table public.fee_items enable row level security;
alter table public.payment_orders enable row level security;
alter table public.school_payment_settings enable row level security;
alter table public.bus_routes enable row level security;
alter table public.staff_directory enable row level security;

grant select on public.teacher_classes, public.hiring_applications, public.student_grades,
  public.homework_tasks, public.class_timetable, public.leave_requests, public.broadcasts,
  public.calendar_events, public.audit_log, public.fee_items, public.payment_orders,
  public.school_payment_settings, public.bus_routes, public.staff_directory to authenticated;
