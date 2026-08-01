-- Orbit class fee ledger — run after schema.sql (idempotent).
-- Links UTR submissions to a student so school verify clears the right child only.

alter table public.payment_submissions
  add column if not exists student_id uuid references public.students (id) on delete set null;

create index if not exists payment_submissions_student_idx
  on public.payment_submissions (student_id);
