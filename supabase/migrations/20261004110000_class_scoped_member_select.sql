-- Scope student/parent homework + timetable SELECT to linked class labels.
-- School keeps school-wide; teachers keep teacher_classes scope.

create or replace function public.linked_class_label_matches(p_class_label text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.students s
    where (
        s.profile_id = auth.uid()
        or public.is_parent_of_student(s.id)
      )
      and (
        p_class_label is null
        or p_class_label = s.class_name
        or p_class_label = concat(s.class_name, '-', coalesce(s.section, ''))
        or p_class_label = concat(s.class_name, coalesce(s.section, ''))
      )
  );
$$;

revoke all on function public.linked_class_label_matches(text) from public, anon;
grant execute on function public.linked_class_label_matches(text) to authenticated;

drop policy if exists homework_select_members on public.homework_tasks;
create policy homework_select_members on public.homework_tasks
  for select to authenticated
  using (
    school_id = public.current_school_id()
    and (
      public.current_profile_role() = 'school'
      or public.is_teacher_of_class_label(class_name)
      or (
        public.current_profile_role() in ('student', 'parent')
        and public.linked_class_label_matches(class_name)
      )
    )
  );

drop policy if exists homework_update_student on public.homework_tasks;
create policy homework_update_student on public.homework_tasks
  for update to authenticated
  using (
    school_id = public.current_school_id()
    and public.current_profile_role() in ('student', 'parent')
    and public.linked_class_label_matches(class_name)
  )
  with check (
    school_id = public.current_school_id()
    and public.current_profile_role() in ('student', 'parent')
    and public.linked_class_label_matches(class_name)
  );

drop policy if exists class_timetable_select on public.class_timetable;
create policy class_timetable_select on public.class_timetable
  for select to authenticated
  using (
    (school_id = public.current_school_id() or school_id is null)
    and (
      public.current_profile_role() = 'school'
      or public.is_teacher_of_class_label(class_name)
      or (
        public.current_profile_role() in ('student', 'parent')
        and public.linked_class_label_matches(class_name)
      )
    )
  );
