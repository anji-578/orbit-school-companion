-- Bus route status, hiring applicants, extracurricular requests + Razorpay payment columns.
-- Honest product surfaces (no fake GPS hardware).

-- ── Bus routes (manual status + last_updated — not live GPS) ───────────────
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

create index if not exists bus_routes_school_idx on public.bus_routes (school_id);

alter table public.bus_routes enable row level security;

drop policy if exists bus_routes_select_members on public.bus_routes;
create policy bus_routes_select_members on public.bus_routes
  for select to authenticated
  using (school_id = public.current_school_id());

drop policy if exists bus_routes_write_school on public.bus_routes;
create policy bus_routes_write_school on public.bus_routes
  for all to authenticated
  using (
    school_id = public.current_school_id()
    and public.current_profile_role() in ('school', 'teacher')
  )
  with check (
    school_id = public.current_school_id()
    and public.current_profile_role() in ('school', 'teacher')
  );

-- ── Hiring applications ───────────────────────────────────────────────────
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

create index if not exists hiring_applications_school_idx
  on public.hiring_applications (school_id, applied_at desc);

alter table public.hiring_applications enable row level security;

drop policy if exists hiring_select_school on public.hiring_applications;
create policy hiring_select_school on public.hiring_applications
  for select to authenticated
  using (
    school_id = public.current_school_id()
    and public.current_profile_role() in ('school', 'teacher')
  );

drop policy if exists hiring_write_school on public.hiring_applications;
create policy hiring_write_school on public.hiring_applications
  for all to authenticated
  using (
    school_id = public.current_school_id()
    and public.current_profile_role() = 'school'
  )
  with check (
    school_id = public.current_school_id()
    and public.current_profile_role() = 'school'
  );

-- ── Extracurricular programs + join requests ──────────────────────────────
create table if not exists public.extracurricular_programs (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  category text not null,
  title text not null,
  coach text,
  location text,
  cost_label text,
  phone text,
  active boolean not null default true
);

create table if not exists public.extracurricular_requests (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  program_id uuid not null references public.extracurricular_programs (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  status text not null default 'requested'
    check (status in ('requested', 'joined', 'waitlisted', 'declined')),
  created_at timestamptz not null default now(),
  unique (program_id, student_id)
);

alter table public.extracurricular_programs enable row level security;
alter table public.extracurricular_requests enable row level security;

drop policy if exists extra_programs_select on public.extracurricular_programs;
create policy extra_programs_select on public.extracurricular_programs
  for select to authenticated
  using (school_id = public.current_school_id() or school_id is null);

drop policy if exists extra_programs_write on public.extracurricular_programs;
create policy extra_programs_write on public.extracurricular_programs
  for all to authenticated
  using (
    school_id = public.current_school_id()
    and public.current_profile_role() in ('school', 'teacher')
  )
  with check (
    school_id = public.current_school_id()
    and public.current_profile_role() in ('school', 'teacher')
  );

drop policy if exists extra_requests_select on public.extracurricular_requests;
create policy extra_requests_select on public.extracurricular_requests
  for select to authenticated
  using (
    school_id = public.current_school_id()
    and (
      public.current_profile_role() in ('school', 'teacher')
      or public.is_my_student_row(student_id)
      or public.is_parent_of_student(student_id)
    )
  );

drop policy if exists extra_requests_insert on public.extracurricular_requests;
create policy extra_requests_insert on public.extracurricular_requests
  for insert to authenticated
  with check (
    school_id = public.current_school_id()
    and (
      public.is_my_student_row(student_id)
      or public.is_parent_of_student(student_id)
      or public.current_profile_role() in ('school', 'teacher')
    )
  );

-- ── Razorpay columns on payment_submissions ───────────────────────────────
alter table public.payment_submissions
  add column if not exists provider text default 'upi_utr';

alter table public.payment_submissions
  add column if not exists razorpay_order_id text;

alter table public.payment_submissions
  add column if not exists razorpay_payment_id text;

alter table public.payment_submissions
  alter column utr drop not null;

-- ── Seed SUNRISE demo surfaces + second parent link (Sarah) ───────────────
do $$
declare
  sid uuid;
begin
  select id into sid from public.schools where code = 'SUNRISE' limit 1;
  if sid is null then
    raise notice 'SUNRISE missing — skip ops_surfaces seed';
    return;
  end if;

  insert into public.bus_routes (id, school_id, name, route_label, driver_name, driver_phone, capacity, status, eta_text, last_updated_at)
  values
    ('bus_14', sid, 'Bus 14', 'Sector 12 → Sunrise', 'Ramesh Kumar', '+91 98XXXX1200', '32/40', 'en_route', '~12 min', now() - interval '4 minutes'),
    ('bus_07', sid, 'Bus 07', 'Lakeview → Sunrise', 'Suresh Patel', '+91 98XXXX0700', '28/40', 'idle', null, now() - interval '1 hour')
  on conflict (id) do update set
    status = excluded.status,
    eta_text = excluded.eta_text,
    last_updated_at = excluded.last_updated_at;

  if not exists (select 1 from public.hiring_applications where school_id = sid limit 1) then
    insert into public.hiring_applications (school_id, name, subject, experience, qualification, status)
    values
      (sid, 'Vamsi Krishna', 'Mathematics', '6 years', 'M.Sc. Mathematics', 'Applied'),
      (sid, 'Priya Nair', 'Science', '4 years', 'B.Ed + M.Sc.', 'Interview Scheduled');
  end if;

  if not exists (select 1 from public.extracurricular_programs where school_id = sid limit 1) then
    insert into public.extracurricular_programs (school_id, category, title, coach, location, cost_label, phone)
    values
      (sid, 'sports', 'Football Academy', 'Coach Arjun', 'School ground', '₹1,200 / mo', '+91 98XXXX1111'),
      (sid, 'drawing', 'Watercolour Club', 'Ms. Meera', 'Art room B2', '₹800 / mo', '+91 98XXXX2222'),
      (sid, 'singing', 'Choir Practice', 'Mr. Kabir', 'Music hall', '₹600 / mo', '+91 98XXXX3333'),
      (sid, 'dancing', 'Classical Dance', 'Guru Sita', 'Auditorium', '₹1,000 / mo', '+91 98XXXX4444');
  end if;
end $$;
