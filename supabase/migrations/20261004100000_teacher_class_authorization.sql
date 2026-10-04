-- Teacher authorization: academic access only via teacher_classes.
-- Teachers must not read hiring/HR or whole-school student/grade rows.

create or replace function public.is_teacher_of_student(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.students s
    join public.teacher_classes tc
      on tc.school_id = s.school_id
     and tc.class_name = s.class_name
     and coalesce(tc.section, '') = coalesce(s.section, '')
    where s.id = p_student_id
      and tc.teacher_profile_id = auth.uid()
  );
$$;

-- Match homework/timetable class labels like "Grade 8-A" or "Grade 8".
create or replace function public.is_teacher_of_class_label(p_class_label text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.teacher_classes tc
    where tc.teacher_profile_id = auth.uid()
      and tc.school_id = public.current_school_id()
      and (
        p_class_label = tc.class_name
        or p_class_label = concat(tc.class_name, '-', coalesce(tc.section, ''))
        or p_class_label = concat(tc.class_name, coalesce(tc.section, ''))
      )
  );
$$;

revoke all on function public.is_teacher_of_student(uuid) from public, anon;
revoke all on function public.is_teacher_of_class_label(text) from public, anon;
grant execute on function public.is_teacher_of_student(uuid) to authenticated;
grant execute on function public.is_teacher_of_class_label(text) to authenticated;

-- Hiring / HR: school admin only
drop policy if exists hiring_select_school on public.hiring_applications;
create policy hiring_select_school on public.hiring_applications
  for select to authenticated
  using (
    school_id = public.current_school_id()
    and public.current_profile_role() = 'school'
  );

-- Staff directory writes: school admin only (teachers keep SELECT for contact cards)
drop policy if exists staff_directory_write_school on public.staff_directory;
create policy staff_directory_write_school on public.staff_directory
  for all to authenticated
  using (
    school_id = public.current_school_id()
    and public.current_profile_role() = 'school'
  )
  with check (
    school_id = public.current_school_id()
    and public.current_profile_role() = 'school'
  );

-- Bus writes: school admin only
drop policy if exists bus_routes_write_school on public.bus_routes;
create policy bus_routes_write_school on public.bus_routes
  for all to authenticated
  using (
    school_id = public.current_school_id()
    and public.current_profile_role() = 'school'
  )
  with check (
    school_id = public.current_school_id()
    and public.current_profile_role() = 'school'
  );

-- Profiles: teachers see self + linked student profiles in assigned classes only
drop policy if exists profiles_select_self_or_staff on public.profiles;
create policy profiles_select_self_or_staff on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or (
      school_id = public.current_school_id()
      and public.current_profile_role() = 'school'
    )
    or (
      public.current_profile_role() = 'teacher'
      and exists (
        select 1
        from public.students s
        where s.profile_id = profiles.id
          and public.is_teacher_of_student(s.id)
      )
    )
  );

-- Students update: teachers only assigned students; insert school-only
drop policy if exists students_insert_staff on public.students;
create policy students_insert_staff on public.students
  for insert to authenticated
  with check (
    school_id = public.current_school_id()
    and public.current_profile_role() = 'school'
  );

drop policy if exists students_update_staff_or_claim on public.students;
create policy students_update_staff_or_claim on public.students
  for update to authenticated
  using (
    school_id = public.current_school_id()
    and (
      public.current_profile_role() = 'school'
      or public.is_teacher_of_student(id)
      or (
        public.current_profile_role() = 'student'
        and (profile_id is null or profile_id = auth.uid())
      )
    )
  )
  with check (school_id = public.current_school_id());

-- Grades: teacher only assigned students
drop policy if exists grades_select_scoped on public.student_grades;
create policy grades_select_scoped on public.student_grades
  for select to authenticated
  using (
    school_id = public.current_school_id()
    and (
      public.current_profile_role() = 'school'
      or public.is_teacher_of_student(student_id)
      or public.is_my_student_row(student_id)
      or public.is_parent_of_student(student_id)
    )
  );

drop policy if exists grades_write_staff on public.student_grades;
create policy grades_write_staff on public.student_grades
  for all to authenticated
  using (
    school_id = public.current_school_id()
    and (
      public.current_profile_role() = 'school'
      or public.is_teacher_of_student(student_id)
    )
  )
  with check (
    school_id = public.current_school_id()
    and (
      public.current_profile_role() = 'school'
      or public.is_teacher_of_student(student_id)
    )
  );

-- Homework completions write: staff scoped to assigned students / school
drop policy if exists homework_completions_write_staff on public.homework_completions;
create policy homework_completions_write_staff on public.homework_completions
  for all to authenticated
  using (
    public.current_profile_role() = 'school'
    or public.is_teacher_of_student(student_id)
  )
  with check (
    public.current_profile_role() = 'school'
    or public.is_teacher_of_student(student_id)
  );

-- Homework tasks: teachers write only for assigned class labels
drop policy if exists homework_write_staff on public.homework_tasks;
create policy homework_write_staff on public.homework_tasks
  for all to authenticated
  using (
    school_id = public.current_school_id()
    and (
      public.current_profile_role() = 'school'
      or public.is_teacher_of_class_label(class_name)
    )
  )
  with check (
    school_id = public.current_school_id()
    and (
      public.current_profile_role() = 'school'
      or public.is_teacher_of_class_label(class_name)
    )
  );

-- Timetable writes: school or assigned class only
drop policy if exists class_timetable_write_staff on public.class_timetable;
create policy class_timetable_write_staff on public.class_timetable
  for all to authenticated
  using (
    school_id = public.current_school_id()
    and (
      public.current_profile_role() = 'school'
      or public.is_teacher_of_class_label(class_name)
    )
  )
  with check (
    school_id = public.current_school_id()
    and (
      public.current_profile_role() = 'school'
      or public.is_teacher_of_class_label(class_name)
    )
  );
