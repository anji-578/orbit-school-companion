-- Demo auth helpers: claim teacher class link + notes for documented personas.
-- Apply after production_hardening_v9.sql (or re-run claim_demo_links definition).

create or replace function public.claim_demo_links()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  uemail text;
  sid uuid;
  ananya uuid := 'a1111111-1111-4111-8111-111111111101';
  sarah uuid := 'a1111111-1111-4111-8111-111111111102';
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'error', 'Not signed in');
  end if;

  select lower(email) into uemail from auth.users where id = uid;
  if uemail is null or uemail not like '%@orbit.app' or uemail like '%@pilot100.orbit.app' then
    return jsonb_build_object('ok', false, 'error', 'Not a demo account');
  end if;

  select id into sid from public.schools where code = 'SUNRISE' limit 1;
  if sid is null then
    return jsonb_build_object('ok', false, 'error', 'Demo school missing');
  end if;

  update public.profiles
  set school_id = coalesce(school_id, sid), updated_at = now()
  where id = uid;

  if uemail = 'student@orbit.app' then
    update public.students
    set profile_id = uid
    where id = ananya
      and (profile_id is null or profile_id = uid);
  elsif uemail = 'parent@orbit.app' then
    insert into public.parent_links (parent_profile_id, student_id, relationship)
    values
      (uid, ananya, 'guardian'),
      (uid, sarah, 'guardian')
    on conflict (parent_profile_id, student_id) do nothing;
  elsif uemail = 'teacher@orbit.app' then
    insert into public.teacher_classes (school_id, teacher_profile_id, class_name, section)
    values (sid, uid, 'Grade 8', 'A')
    on conflict (teacher_profile_id, class_name, section) do nothing;
  end if;

  return jsonb_build_object('ok', true, 'school_id', sid);
end;
$$;

revoke all on function public.claim_demo_links() from public;
grant execute on function public.claim_demo_links() to authenticated;
