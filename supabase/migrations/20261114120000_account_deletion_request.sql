-- Student self-service account deletion request (Play Store / DSAR path).
-- School staff still run anonymize_student for official erasure.

create or replace function public.request_account_deletion(p_request_id uuid default gen_random_uuid())
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_school_id uuid;
  v_student_id uuid;
  v_request_id uuid := coalesce(p_request_id, gen_random_uuid());
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  select p.school_id into v_school_id
  from public.profiles p
  where p.id = v_uid;

  if v_school_id is null then
    raise exception 'school profile required';
  end if;

  select s.id into v_student_id
  from public.students s
  where s.profile_id = v_uid
  limit 1;

  insert into public.audit_log (
    school_id,
    actor_id,
    action,
    entity_type,
    entity_id,
    payload
  ) values (
    v_school_id,
    v_uid,
    'student_account_deletion_request',
    'student',
    coalesce(v_student_id::text, v_request_id::text),
    jsonb_build_object(
      'requestId', v_request_id,
      'studentId', v_student_id,
      'channel', 'rpc',
      'policyVersion', '1.0'
    )
  );

  return v_request_id;
end;
$$;

revoke all on function public.request_account_deletion(uuid) from public;
revoke all on function public.request_account_deletion(uuid) from anon;
grant execute on function public.request_account_deletion(uuid) to authenticated;
