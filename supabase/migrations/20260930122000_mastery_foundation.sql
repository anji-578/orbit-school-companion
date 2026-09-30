-- Intelligence foundations: questions, attempts, mastery, review schedule

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  prompt text not null,
  subject text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.question_skills (
  question_id uuid not null references public.questions(id) on delete cascade,
  skill_code text not null,
  primary key (question_id, skill_code)
);

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  question_id uuid references public.questions(id) on delete set null,
  response text,
  correct boolean,
  time_ms integer,
  attempt_no integer not null default 1,
  source text not null check (source in ('homework', 'quiz', 'scan')),
  created_at timestamptz not null default now()
);

create table if not exists public.mastery_state (
  student_id uuid not null references public.students(id) on delete cascade,
  skill_code text not null,
  estimate double precision not null default 0.5,
  uncertainty double precision not null default 0.25,
  updated_at timestamptz not null default now(),
  primary key (student_id, skill_code)
);

create table if not exists public.review_schedule (
  student_id uuid not null references public.students(id) on delete cascade,
  skill_code text not null,
  due_at timestamptz not null,
  interval_days integer not null default 1,
  primary key (student_id, skill_code)
);

alter table public.attempts enable row level security;
alter table public.mastery_state enable row level security;
alter table public.review_schedule enable row level security;

create policy attempts_own on public.attempts
  for all using (student_id in (select id from public.students where profile_id = auth.uid()))
  with check (student_id in (select id from public.students where profile_id = auth.uid()));

create policy mastery_own on public.mastery_state
  for select using (student_id in (select id from public.students where profile_id = auth.uid()));

create policy review_own on public.review_schedule
  for select using (student_id in (select id from public.students where profile_id = auth.uid()));
