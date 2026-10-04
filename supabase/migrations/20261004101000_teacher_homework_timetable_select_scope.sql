-- Companion to teacher_class_authorization: scope teacher SELECT on homework/timetable.

drop policy if exists homework_select_members on public.homework_tasks;
create policy homework_select_members on public.homework_tasks
  for select to authenticated
  using (
    school_id = public.current_school_id()
    and (
      public.current_profile_role() <> 'teacher'
      or public.is_teacher_of_class_label(class_name)
    )
  );

drop policy if exists class_timetable_select on public.class_timetable;
create policy class_timetable_select on public.class_timetable
  for select to authenticated
  using (
    (school_id = public.current_school_id() or school_id is null)
    and (
      public.current_profile_role() <> 'teacher'
      or public.is_teacher_of_class_label(class_name)
    )
  );
