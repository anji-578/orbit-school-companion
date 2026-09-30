-- Consent + purpose registry (engineering foundation; legal review separate)

create table if not exists public.data_processing_purposes (
  code text primary key,
  description text not null,
  created_at timestamptz not null default now()
);

insert into public.data_processing_purposes (code, description) values
  ('learning_support', 'Homework help, Ask Orbit, scan coaching'),
  ('safety', 'Safeguarding and abuse prevention'),
  ('product_quality', 'Reliability and defect diagnosis'),
  ('operations', 'School operations and roster sync')
on conflict (code) do nothing;

create table if not exists public.consents (
  id uuid primary key default gen_random_uuid(),
  subject_student_id uuid not null references public.students(id) on delete cascade,
  guardian_profile_id uuid references public.profiles(id),
  purpose_code text not null references public.data_processing_purposes(code),
  policy_version text not null,
  granted_at timestamptz not null default now(),
  withdrawn_at timestamptz,
  evidence text,
  unique (subject_student_id, purpose_code, policy_version)
);

alter table public.consents enable row level security;

create policy consents_select_own on public.consents
  for select using (
    subject_student_id in (select id from public.students where profile_id = auth.uid())
    or guardian_profile_id = auth.uid()
  );
