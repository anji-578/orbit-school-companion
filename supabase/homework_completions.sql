-- Orbit homework per-student completions — run after trust_hardening.sql (idempotent).
-- Class-wide assignments live in homework_tasks; each student marks their own row here.

create table if not exists public.homework_completions (
  homework_id bigint not null references public.homework_tasks (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (homework_id, student_id)
);

create index if not exists homework_completions_student_idx
  on public.homework_completions (student_id);

alter table public.homework_completions enable row level security;

drop policy if exists homework_completions_select on public.homework_completions;
create policy homework_completions_select on public.homework_completions
  for select to authenticated
  using (
    exists (
      select 1 from public.homework_tasks ht
      where ht.id = homework_completions.homework_id
        and ht.school_id = public.current_school_id()
    )
    and (
      public.current_profile_role() in ('teacher', 'school')
      or exists (
        select 1 from public.students s
        where s.id = homework_completions.student_id and s.profile_id = auth.uid()
      )
      or exists (
        select 1 from public.parent_links pl
        where pl.student_id = homework_completions.student_id
          and pl.parent_profile_id = auth.uid()
      )
    )
  );

drop policy if exists homework_completions_write_student on public.homework_completions;
create policy homework_completions_write_student on public.homework_completions
  for all to authenticated
  using (
    exists (
      select 1 from public.homework_tasks ht
      where ht.id = homework_completions.homework_id
        and ht.school_id = public.current_school_id()
    )
    and public.current_profile_role() = 'student'
    and exists (
      select 1 from public.students s
      where s.id = homework_completions.student_id and s.profile_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.homework_tasks ht
      where ht.id = homework_completions.homework_id
        and ht.school_id = public.current_school_id()
    )
    and public.current_profile_role() = 'student'
    and exists (
      select 1 from public.students s
      where s.id = homework_completions.student_id and s.profile_id = auth.uid()
    )
  );

-- Staff may seed or reset completions for support
drop policy if exists homework_completions_write_staff on public.homework_completions;
create policy homework_completions_write_staff on public.homework_completions
  for all to authenticated
  using (
    public.current_profile_role() in ('teacher', 'school')
    and exists (
      select 1 from public.homework_tasks ht
      join public.students st on st.school_id = ht.school_id
      where ht.id = homework_completions.homework_id
        and st.id = homework_completions.student_id
        and ht.school_id = public.current_school_id()
    )
  )
  with check (
    public.current_profile_role() in ('teacher', 'school')
    and exists (
      select 1 from public.homework_tasks ht
      where ht.id = homework_completions.homework_id
        and ht.school_id = public.current_school_id()
    )
  );

-- Students/parents need to read class assignments (not just school staff)
drop policy if exists homework_select_school on public.homework_tasks;
create policy homework_select_members on public.homework_tasks
  for select to authenticated
  using (
    school_id = public.current_school_id()
    or school_id is null
  );
