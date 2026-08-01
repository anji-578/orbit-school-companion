-- Orbit class timetable — run after trust_hardening.sql (idempotent).
-- Shared Grade 8-A week grid for student / teacher / school.

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

create index if not exists class_timetable_school_day_idx
  on public.class_timetable (school_id, class_name, day_code, sort_order);

alter table public.class_timetable enable row level security;

drop policy if exists class_timetable_select on public.class_timetable;
create policy class_timetable_select on public.class_timetable
  for select to authenticated
  using (school_id = public.current_school_id() or school_id is null);

drop policy if exists class_timetable_write_staff on public.class_timetable;
create policy class_timetable_write_staff on public.class_timetable
  for all to authenticated
  using (
    school_id = public.current_school_id()
    and public.current_profile_role() in ('teacher', 'school')
  )
  with check (
    school_id = public.current_school_id()
    and public.current_profile_role() in ('teacher', 'school')
  );

-- Seed Grade 8-A week for SUNRISE (safe to re-run)
do $$
declare
  sid uuid;
begin
  select id into sid from public.schools where code = 'SUNRISE' limit 1;
  if sid is null then
    raise notice 'SUNRISE school missing — skip timetable seed';
    return;
  end if;

  delete from public.class_timetable
  where school_id = sid and class_name = 'Grade 8-A';

  insert into public.class_timetable
    (school_id, class_name, day_code, slot_type, code, name, start_time, end_time, room, teacher_name, sort_order)
  values
    -- MON
    (sid, 'Grade 8-A', 'MON', 'Theory', 'A1', 'Mathematics', '08:00', '08:50', 'Room 204', 'Mrs. Davis', 1),
    (sid, 'Grade 8-A', 'MON', 'Theory', 'F1', 'Science', '08:55', '09:45', 'Room 301', 'Dr. Chawla', 2),
    (sid, 'Grade 8-A', 'MON', 'Theory', 'D1', 'English Grammar', '09:50', '10:40', 'Room 105', 'Mr. Hughes', 3),
    (sid, 'Grade 8-A', 'MON', 'Theory', 'TB1', 'Social Studies', '10:45', '11:35', 'Room 203', 'Dr. Swamy', 4),
    (sid, 'Grade 8-A', 'MON', 'Lab', 'L1', 'Science Lab', '14:00', '14:50', 'Lab 2', 'Prof. Sharma', 5),
    -- TUE
    (sid, 'Grade 8-A', 'TUE', 'Theory', 'A2', 'Mathematics', '08:00', '08:50', 'Room 204', 'Mrs. Davis', 1),
    (sid, 'Grade 8-A', 'TUE', 'Theory', 'C1', 'Chemistry Lab Theory', '08:55', '09:45', 'Room 210', 'Prof. Sharma', 2),
    (sid, 'Grade 8-A', 'TUE', 'Theory', 'E1', 'English Literature', '09:50', '10:40', 'Room 105', 'Mr. Hughes', 3),
    (sid, 'Grade 8-A', 'TUE', 'Theory', 'P1', 'Physical Education', '10:45', '11:35', 'Ground A', 'Coach Vinay', 4),
    (sid, 'Grade 8-A', 'TUE', 'Lab', 'L2', 'Chemistry Lab', '14:00', '14:50', 'Lab 1', 'Prof. Sharma', 5),
    -- WED
    (sid, 'Grade 8-A', 'WED', 'Theory', 'A3', 'Mathematics', '08:00', '08:50', 'Room 204', 'Mrs. Davis', 1),
    (sid, 'Grade 8-A', 'WED', 'Theory', 'F2', 'Science', '08:55', '09:45', 'Room 301', 'Dr. Chawla', 2),
    (sid, 'Grade 8-A', 'WED', 'Theory', 'S1', 'Social Studies', '09:50', '10:40', 'Room 203', 'Dr. Swamy', 3),
    (sid, 'Grade 8-A', 'WED', 'Theory', 'D2', 'English Grammar', '10:45', '11:35', 'Room 105', 'Mr. Hughes', 4),
    (sid, 'Grade 8-A', 'WED', 'Lab', 'L3', 'Computer Lab', '14:00', '14:50', 'Lab 3', 'Ms. Priya', 5),
    -- THU
    (sid, 'Grade 8-A', 'THU', 'Theory', 'A4', 'Mathematics', '08:00', '08:50', 'Room 204', 'Mrs. Davis', 1),
    (sid, 'Grade 8-A', 'THU', 'Theory', 'F3', 'Science', '08:55', '09:45', 'Room 301', 'Dr. Chawla', 2),
    (sid, 'Grade 8-A', 'THU', 'Theory', 'C2', 'Chemistry', '09:50', '10:40', 'Room 210', 'Prof. Sharma', 3),
    (sid, 'Grade 8-A', 'THU', 'Theory', 'AR1', 'Art Period', '10:45', '11:35', 'Art Studio', 'Ms. Aruna', 4),
    (sid, 'Grade 8-A', 'THU', 'Lab', 'L4', 'Science Lab', '14:00', '14:50', 'Lab 2', 'Dr. Chawla', 5),
    -- FRI
    (sid, 'Grade 8-A', 'FRI', 'Theory', 'A5', 'Mathematics Review', '08:00', '08:50', 'Room 204', 'Mrs. Davis', 1),
    (sid, 'Grade 8-A', 'FRI', 'Theory', 'F4', 'Science Review', '08:55', '09:45', 'Room 301', 'Dr. Chawla', 2),
    (sid, 'Grade 8-A', 'FRI', 'Theory', 'D3', 'English Writing', '09:50', '10:40', 'Room 105', 'Mr. Hughes', 3),
    (sid, 'Grade 8-A', 'FRI', 'Theory', 'AS1', 'Assembly / Mentoring', '10:45', '11:35', 'Main Hall', 'Class Teacher', 4),
    (sid, 'Grade 8-A', 'FRI', 'Lab', 'L5', 'Open Lab Practice', '14:00', '14:50', 'Lab 2', 'Prof. Sharma', 5);
end $$;
