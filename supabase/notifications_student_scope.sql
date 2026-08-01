-- Child-scoped notifications: parents/students only see alerts for their child.
-- Run after alerts.sql + rls_recursion_fix.sql (needs is_my_student_row / is_parent_of_student).

alter table public.app_notifications
  add column if not exists student_id uuid references public.students (id) on delete set null;

create index if not exists app_notifications_student_idx
  on public.app_notifications (student_id, created_at desc);

drop policy if exists app_notifications_select_own on public.app_notifications;
create policy app_notifications_select_own on public.app_notifications
  for select to authenticated
  using (
    user_id = auth.uid()
    or (
      user_id is null
      and (role is null or role = public.current_profile_role())
      and (
        student_id is null
        or public.is_my_student_row(student_id)
        or public.is_parent_of_student(student_id)
        or public.current_profile_role() in ('teacher', 'school')
      )
    )
  );

drop policy if exists app_notifications_update_own on public.app_notifications;
create policy app_notifications_update_own on public.app_notifications
  for update to authenticated
  using (
    user_id = auth.uid()
    or (
      user_id is null
      and (role is null or role = public.current_profile_role())
      and (
        student_id is null
        or public.is_my_student_row(student_id)
        or public.is_parent_of_student(student_id)
        or public.current_profile_role() in ('teacher', 'school')
      )
    )
  )
  with check (true);
