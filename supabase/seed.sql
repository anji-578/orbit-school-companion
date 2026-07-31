-- Orbit seed — Sunrise Public School pilot data
-- Run AFTER schema.sql AND trust_hardening.sql.
-- Idempotent: safe to re-run.
-- IDs match src/lib/attendanceApi.ts DEMO_STUDENT_IDS.

insert into public.schools (id, name, code)
values (
  'c0a1c0a1-1111-4111-8111-111111111001',
  'Sunrise Public School',
  'SUNRISE'
)
on conflict (id) do update set name = excluded.name, code = excluded.code;

insert into public.students (id, school_id, class_name, section, roll_no, display_name)
values
  ('a1111111-1111-4111-8111-111111111101', 'c0a1c0a1-1111-4111-8111-111111111001', 'Grade 8', 'A', '01', 'Ananya Rao'),
  ('a1111111-1111-4111-8111-111111111102', 'c0a1c0a1-1111-4111-8111-111111111001', 'Grade 8', 'A', '02', 'Sarah Chen'),
  ('a1111111-1111-4111-8111-111111111103', 'c0a1c0a1-1111-4111-8111-111111111001', 'Grade 8', 'A', '03', 'Marcus Johnson'),
  ('a1111111-1111-4111-8111-111111111104', 'c0a1c0a1-1111-4111-8111-111111111001', 'Grade 8', 'A', '04', 'Pranitha Reddy')
on conflict (id) do update set
  display_name = excluded.display_name,
  class_name = excluded.class_name,
  section = excluded.section,
  roll_no = excluded.roll_no,
  school_id = excluded.school_id;

insert into public.school_payment_settings (school_id, upi_id, account_name, bank_name, ifsc, instructions)
values (
  'c0a1c0a1-1111-4111-8111-111111111001',
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

delete from public.fee_items where student_id = 'a1111111-1111-4111-8111-111111111101';
insert into public.fee_items (school_id, student_id, name, amount_paise, status, category, due_date)
values
  ('c0a1c0a1-1111-4111-8111-111111111001', 'a1111111-1111-4111-8111-111111111101', 'Tuition — Term 2', 1850000, 'Unpaid', 'Tuition', current_date + 14),
  ('c0a1c0a1-1111-4111-8111-111111111001', 'a1111111-1111-4111-8111-111111111101', 'Lab & Activity', 450000, 'Unpaid', 'Lab', current_date + 21),
  ('c0a1c0a1-1111-4111-8111-111111111001', 'a1111111-1111-4111-8111-111111111101', 'Transport — Quarterly', 600000, 'Paid', 'Transport', current_date - 30);

insert into public.student_grades (id, school_id, student_id, student_name, math, science, chem, comment)
values (
  'grade_ananya',
  'c0a1c0a1-1111-4111-8111-111111111001',
  'a1111111-1111-4111-8111-111111111101',
  'Ananya Rao',
  '42/50',
  '38/50',
  '35/50',
  'Strong effort in algebra; revisit photosynthesis gas exchange.'
)
on conflict (id) do update set
  math = excluded.math,
  science = excluded.science,
  chem = excluded.chem,
  comment = excluded.comment,
  updated_at = now();

insert into public.class_invites (code, school_id, role, student_id, class_name, max_uses, active)
values
  ('SUNRISE-STU-8A', 'c0a1c0a1-1111-4111-8111-111111111001', 'student', 'a1111111-1111-4111-8111-111111111101', 'Grade 8-A', 20, true),
  ('SUNRISE-PAR-8A', 'c0a1c0a1-1111-4111-8111-111111111001', 'parent', 'a1111111-1111-4111-8111-111111111101', 'Grade 8-A', 20, true),
  ('SUNRISE-TCH-8A', 'c0a1c0a1-1111-4111-8111-111111111001', 'teacher', null, 'Grade 8-A', 10, true),
  ('SUNRISE-ADM', 'c0a1c0a1-1111-4111-8111-111111111001', 'school', null, null, 5, true)
on conflict (code) do update set
  active = excluded.active,
  max_uses = excluded.max_uses,
  student_id = excluded.student_id,
  school_id = excluded.school_id,
  role = excluded.role,
  class_name = excluded.class_name;

insert into public.syllabus_state (school_id, class_name, curriculum)
values ('c0a1c0a1-1111-4111-8111-111111111001', 'Grade 8-A', '[]'::jsonb)
on conflict (school_id, class_name) do nothing;
