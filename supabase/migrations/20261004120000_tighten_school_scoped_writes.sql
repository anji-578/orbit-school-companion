-- Tighten write policies that previously checked only role (not school_id).
-- Prevents school/teacher principals from mutating another school's rows.

drop policy if exists broadcasts_write_school on public.broadcasts;
create policy broadcasts_write_school on public.broadcasts
  for all to authenticated
  using (
    current_profile_role() = 'school'
    and (school_id = current_school_id() or school_id is null)
  )
  with check (
    current_profile_role() = 'school'
    and (school_id = current_school_id() or school_id is null)
  );

drop policy if exists calendar_write_school on public.calendar_events;
create policy calendar_write_school on public.calendar_events
  for all to authenticated
  using (
    current_profile_role() = 'school'
    and (school_id = current_school_id() or school_id is null)
  )
  with check (
    current_profile_role() = 'school'
    and (school_id = current_school_id() or school_id is null)
  );

drop policy if exists payment_settings_upsert_school on public.school_payment_settings;
create policy payment_settings_upsert_school on public.school_payment_settings
  for all to authenticated
  using (
    current_profile_role() = 'school'
    and school_id = current_school_id()
  )
  with check (
    current_profile_role() = 'school'
    and school_id = current_school_id()
  );

drop policy if exists parent_links_insert_school on public.parent_links;
create policy parent_links_insert_school on public.parent_links
  for insert to authenticated
  with check (
    current_profile_role() = 'school'
    and exists (
      select 1
      from public.students s
      where s.id = student_id
        and s.school_id = current_school_id()
    )
    and exists (
      select 1
      from public.profiles p
      where p.id = parent_profile_id
        and p.school_id = current_school_id()
    )
  );

drop policy if exists leaves_insert_teacher on public.leave_requests;
create policy leaves_insert_teacher on public.leave_requests
  for insert to authenticated
  with check (
    current_profile_role() = any (array['teacher'::public.orbit_role, 'school'::public.orbit_role])
    and (school_id = current_school_id() or school_id is null)
    and (
      current_profile_role() = 'school'
      or teacher_profile_id = auth.uid()
    )
  );

drop policy if exists leaves_update_school on public.leave_requests;
create policy leaves_update_school on public.leave_requests
  for update to authenticated
  using (
    current_profile_role() = any (array['school'::public.orbit_role, 'teacher'::public.orbit_role])
    and (school_id = current_school_id() or school_id is null)
    and (
      current_profile_role() = 'school'
      or teacher_profile_id = auth.uid()
    )
  )
  with check (
    current_profile_role() = any (array['school'::public.orbit_role, 'teacher'::public.orbit_role])
    and (school_id = current_school_id() or school_id is null)
  );
