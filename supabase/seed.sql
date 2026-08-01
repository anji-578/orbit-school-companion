-- Orbit seed — Sunrise Public School pilot data
-- Run AFTER schema.sql AND trust_hardening.sql.
-- Idempotent: safe to re-run even if SUNRISE already exists with another UUID.
-- Student IDs match src/lib/attendanceApi.ts DEMO_STUDENT_IDS.

-- Prefer creating with a stable id; if code SUNRISE already exists, keep that row.
insert into public.schools (id, name, code)
values (
  'c0a1c0a1-1111-4111-8111-111111111001',
  'Sunrise Public School',
  'SUNRISE'
)
on conflict (code) do update set name = excluded.name;

-- Resolve the live school id (existing or just-inserted)
do $$
declare
  sid uuid;
begin
  select id into sid from public.schools where code = 'SUNRISE' limit 1;
  if sid is null then
    raise exception 'SUNRISE school missing after upsert';
  end if;

  insert into public.students (id, school_id, class_name, section, roll_no, display_name)
  values
    ('a1111111-1111-4111-8111-111111111101', sid, 'Grade 8', 'A', '01', 'Ananya Rao'),
    ('a1111111-1111-4111-8111-111111111102', sid, 'Grade 8', 'A', '02', 'Sarah Chen'),
    ('a1111111-1111-4111-8111-111111111103', sid, 'Grade 8', 'A', '03', 'Marcus Johnson'),
    ('a1111111-1111-4111-8111-111111111104', sid, 'Grade 8', 'A', '04', 'Pranitha Reddy')
  on conflict (id) do update set
    display_name = excluded.display_name,
    class_name = excluded.class_name,
    section = excluded.section,
    roll_no = excluded.roll_no,
    school_id = excluded.school_id;

  insert into public.school_payment_settings (school_id, upi_id, account_name, bank_name, ifsc, instructions)
  values (
    sid,
    'sunrise.school@oksbi',
    'Sunrise Public School',
    'State Bank of India',
    'SBIN0001234',
    'Pay the exact outstanding amount via UPI, then submit the UTR in Orbit. ₹0 gateway fee.'
  )
  on conflict (school_id) do update set
    upi_id = excluded.upi_id,
    account_name = excluded.account_name,
    bank_name = excluded.bank_name,
    ifsc = excluded.ifsc,
    instructions = excluded.instructions,
    updated_at = now();

  delete from public.fee_items
  where student_id in (
    'a1111111-1111-4111-8111-111111111101',
    'a1111111-1111-4111-8111-111111111102',
    'a1111111-1111-4111-8111-111111111103',
    'a1111111-1111-4111-8111-111111111104'
  );
  insert into public.fee_items (school_id, student_id, name, amount_paise, status, category, due_date)
  values
    -- Ananya Rao
    (sid, 'a1111111-1111-4111-8111-111111111101', 'Tuition — Term 2', 1850000, 'Unpaid', 'Tuition', current_date + 14),
    (sid, 'a1111111-1111-4111-8111-111111111101', 'Lab & Activity', 450000, 'Unpaid', 'Lab', current_date + 21),
    (sid, 'a1111111-1111-4111-8111-111111111101', 'Transport — Quarterly', 600000, 'Paid', 'Transport', current_date - 30),
    -- Sarah Chen
    (sid, 'a1111111-1111-4111-8111-111111111102', 'Tuition — Term 2', 1850000, 'Pending', 'Tuition', current_date + 14),
    (sid, 'a1111111-1111-4111-8111-111111111102', 'Lab & Activity', 450000, 'Paid', 'Lab', current_date - 10),
    -- Marcus Johnson
    (sid, 'a1111111-1111-4111-8111-111111111103', 'Tuition — Term 2', 1850000, 'Overdue', 'Tuition', current_date - 7),
    (sid, 'a1111111-1111-4111-8111-111111111103', 'Transport — Quarterly', 600000, 'Unpaid', 'Transport', current_date + 5),
    -- Pranitha Reddy
    (sid, 'a1111111-1111-4111-8111-111111111104', 'Tuition — Term 2', 1850000, 'Paid', 'Tuition', current_date - 20),
    (sid, 'a1111111-1111-4111-8111-111111111104', 'Lab & Activity', 450000, 'Paid', 'Lab', current_date - 20);

  insert into public.student_grades (id, school_id, student_id, student_name, math, science, chem, comment)
  values (
    'grade_ananya',
    sid,
    'a1111111-1111-4111-8111-111111111101',
    'Ananya Rao',
    '42/50',
    '38/50',
    '35/50',
    'Strong effort in algebra; revisit photosynthesis gas exchange.'
  )
  on conflict (id) do update set
    school_id = excluded.school_id,
    math = excluded.math,
    science = excluded.science,
    chem = excluded.chem,
    comment = excluded.comment,
    updated_at = now();

  insert into public.class_invites (code, school_id, role, student_id, class_name, max_uses, active)
  values
    ('SUNRISE-STU-8A', sid, 'student', 'a1111111-1111-4111-8111-111111111101', 'Grade 8-A', 20, true),
    ('SUNRISE-PAR-8A', sid, 'parent', 'a1111111-1111-4111-8111-111111111101', 'Grade 8-A', 20, true),
    ('SUNRISE-TCH-8A', sid, 'teacher', null, 'Grade 8-A', 10, true),
    ('SUNRISE-ADM', sid, 'school', null, null, 5, true)
  on conflict (code) do update set
    active = excluded.active,
    max_uses = excluded.max_uses,
    student_id = excluded.student_id,
    school_id = excluded.school_id,
    role = excluded.role,
    class_name = excluded.class_name;

  insert into public.syllabus_state (school_id, class_name, curriculum)
  values (sid, 'Grade 8-A', '[]'::jsonb)
  on conflict (school_id, class_name) do nothing;

  -- Class homework (completion is per-student via homework_completions.sql)
  insert into public.homework_tasks (school_id, subject, task, due_label, xp, difficulty, completed)
  select sid, v.subject, v.task, v.due_label, v.xp, v.difficulty, false
  from (values
    ('Mathematics', 'Complete exercise 4.2 — linear equations Q1–Q8', 'Friday', 50, 'Medium'),
    ('Science', 'Draw and label the photosynthesis diagram', 'Tomorrow', 40, 'Easy'),
    ('Chemistry Lab', 'Revise stoichiometry worksheet (Unit 3)', 'Monday', 60, 'Hard')
  ) as v(subject, task, due_label, xp, difficulty)
  where not exists (
    select 1 from public.homework_tasks ht
    where ht.school_id = sid and ht.task = v.task
  );

  -- Sample completion: Ananya finished the first Math homework if present
  insert into public.homework_completions (homework_id, student_id, completed, updated_at)
  select ht.id, 'a1111111-1111-4111-8111-111111111101', true, now()
  from public.homework_tasks ht
  where ht.school_id = sid
    and ht.task = 'Complete exercise 4.2 — linear equations Q1–Q8'
  on conflict (homework_id, student_id) do update set
    completed = excluded.completed,
    updated_at = now();
end $$;
