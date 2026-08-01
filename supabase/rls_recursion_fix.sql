-- Break students <-> parent_links RLS recursion (infinite recursion on SELECT).
-- Use security-definer helpers so policies never nest into each other.

create or replace function public.is_my_student_row(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.students
    where id = p_student_id and profile_id = auth.uid()
  );
$$;

create or replace function public.is_parent_of_student(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.parent_links
    where student_id = p_student_id and parent_profile_id = auth.uid()
  );
$$;

revoke all on function public.is_my_student_row(uuid) from public;
revoke all on function public.is_parent_of_student(uuid) from public;
grant execute on function public.is_my_student_row(uuid) to authenticated;
grant execute on function public.is_parent_of_student(uuid) to authenticated;

drop policy if exists students_select_scoped on public.students;
create policy students_select_scoped on public.students
  for select to authenticated
  using (
    school_id = public.current_school_id()
    and (
      public.current_profile_role() in ('teacher', 'school')
      or profile_id = auth.uid()
      or public.is_parent_of_student(id)
    )
  );

drop policy if exists parent_links_select_scoped on public.parent_links;
create policy parent_links_select_scoped on public.parent_links
  for select to authenticated
  using (
    parent_profile_id = auth.uid()
    or public.current_profile_role() in ('teacher', 'school')
    or public.is_my_student_row(student_id)
  );

-- Prefer helpers in homework completions (avoids nested RLS on students / parent_links)
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
      or public.is_my_student_row(homework_completions.student_id)
      or public.is_parent_of_student(homework_completions.student_id)
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
    and public.is_my_student_row(homework_completions.student_id)
  )
  with check (
    exists (
      select 1 from public.homework_tasks ht
      where ht.id = homework_completions.homework_id
        and ht.school_id = public.current_school_id()
    )
    and public.current_profile_role() = 'student'
    and public.is_my_student_row(homework_completions.student_id)
  );

drop policy if exists homework_completions_write_staff on public.homework_completions;
create policy homework_completions_write_staff on public.homework_completions
  for all to authenticated
  using (
    public.current_profile_role() in ('teacher', 'school')
    and exists (
      select 1 from public.homework_tasks ht
      where ht.id = homework_completions.homework_id
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
