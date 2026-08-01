-- Allow school staff to insert roster rows (CSV import). Run after schema.sql.

drop policy if exists students_insert_staff on public.students;
create policy students_insert_staff on public.students
  for insert to authenticated
  with check (
    school_id = public.current_school_id()
    and public.current_profile_role() in ('school', 'teacher')
  );
