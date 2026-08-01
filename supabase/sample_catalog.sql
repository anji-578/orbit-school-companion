-- Orbit sample catalog — staff directory + richer pilot samples (idempotent).
-- Run after seed.sql. Keeps teammate demos looking full even before real ops data.

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

create index if not exists staff_directory_school_idx on public.staff_directory (school_id);

alter table public.staff_directory enable row level security;

drop policy if exists staff_directory_select on public.staff_directory;
create policy staff_directory_select on public.staff_directory
  for select to authenticated
  using (school_id = public.current_school_id());

drop policy if exists staff_directory_write_school on public.staff_directory;
create policy staff_directory_write_school on public.staff_directory
  for all to authenticated
  using (
    school_id = public.current_school_id()
    and public.current_profile_role() in ('school', 'teacher')
  )
  with check (
    school_id = public.current_school_id()
    and public.current_profile_role() in ('school', 'teacher')
  );

do $$
declare
  sid uuid;
begin
  select id into sid from public.schools where code = 'SUNRISE' limit 1;
  if sid is null then
    raise notice 'SUNRISE missing — skip sample catalog';
    return;
  end if;

  insert into public.staff_directory (id, school_id, display_name, subject_key, qualification, phone, avatar_url)
  values
    ('t_math', sid, 'Mrs. Sarah Davis', 'mathSubject', 'M.Sc. in Mathematics, B.Ed.', '+91 98450 12345',
     'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80'),
    ('t_science', sid, 'Dr. Anil Chawla', 'scienceSubject', 'Ph.D. in Physics, M.Ed.', '+91 98450 67890',
     'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'),
    ('t_chem', sid, 'Prof. Meera Sharma', 'chemLabSubject', 'M.Sc. Chemistry, B.Ed.', '+91 98450 24680',
     'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80'),
    ('t_english', sid, 'Mr. James Hughes', 'englishSubject', 'M.A. English, B.Ed.', '+91 98450 13579',
     'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80')
  on conflict (id) do update set
    display_name = excluded.display_name,
    subject_key = excluded.subject_key,
    qualification = excluded.qualification,
    phone = excluded.phone,
    avatar_url = excluded.avatar_url,
    school_id = excluded.school_id;

  -- Classmate grade samples (teacher marks board looks full)
  insert into public.student_grades (id, school_id, student_id, student_name, math, science, chem, comment)
  values
    ('grade_sarah', sid, 'a1111111-1111-4111-8111-111111111102', 'Sarah Chen', '45/50', '41/50', '40/50', 'Consistent high performer.'),
    ('grade_marcus', sid, 'a1111111-1111-4111-8111-111111111103', 'Marcus Johnson', '33/50', '30/50', '28/50', 'Needs support in algebra foundations.'),
    ('grade_pranitha', sid, 'a1111111-1111-4111-8111-111111111104', 'Pranitha Reddy', '40/50', '44/50', '42/50', 'Strong in science labs.')
  on conflict (id) do update set
    math = excluded.math,
    science = excluded.science,
    chem = excluded.chem,
    comment = excluded.comment,
    student_name = excluded.student_name,
    updated_at = now();

  -- Sample leave / broadcast / calendar so school tabs aren't empty
  if not exists (select 1 from public.leave_requests where school_id = sid limit 1) then
    insert into public.leave_requests (school_id, leave_date, reason, status)
    values
      (sid, to_char(current_date + 3, 'YYYY-MM-DD'), 'Family function — half day', 'Reviewing'),
      (sid, to_char(current_date - 2, 'YYYY-MM-DD'), 'Medical appointment', 'Approved');
  end if;

  if not exists (select 1 from public.broadcasts where school_id = sid limit 1) then
    insert into public.broadcasts (school_id, target, title, content)
    values
      (sid, 'Parents', 'PTA Meet Reminder', 'Saturday 10 AM in the main hall. Please confirm attendance.'),
      (sid, 'All', 'Sports Day Rescheduled', 'Annual sports day moved to next Friday due to weather.');
  end if;

  if not exists (select 1 from public.calendar_events where school_id = sid limit 1) then
    insert into public.calendar_events (school_id, title, category, event_date)
    values
      (sid, 'Unit Test 2 — Math & Science', 'Exams', to_char(current_date + 10, 'YYYY-MM-DD')),
      (sid, 'Independence Day Holiday', 'Holidays', to_char(current_date + 14, 'YYYY-MM-DD')),
      (sid, 'Art Exhibition', 'Extracurricular', to_char(current_date + 21, 'YYYY-MM-DD'));
  end if;
end $$;
