-- Orbit notifications RLS tighten + client write/read-mark
-- Safe to re-run after alerts.sql

drop policy if exists app_notifications_select_own on public.app_notifications;
create policy app_notifications_select_own on public.app_notifications
  for select to authenticated
  using (
    user_id = auth.uid()
    or (
      user_id is null
      and (
        role is null
        or role = public.current_profile_role()
      )
    )
  );

drop policy if exists app_notifications_insert_auth on public.app_notifications;
create policy app_notifications_insert_auth on public.app_notifications
  for insert to authenticated
  with check (
    user_id is null
    or user_id = auth.uid()
  );

drop policy if exists app_notifications_update_own on public.app_notifications;
create policy app_notifications_update_own on public.app_notifications
  for update to authenticated
  using (
    user_id = auth.uid()
    or (
      user_id is null
      and (role is null or role = public.current_profile_role())
    )
  )
  with check (true);
