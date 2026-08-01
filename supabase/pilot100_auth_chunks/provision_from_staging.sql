-- Provision auth users from staging tables
create extension if not exists pgcrypto;
do $$
declare
  sid uuid;
  r record;
  uid uuid;
  v_pass text := crypt('Pilot100!', gen_salt('bf'));
begin
  select id into sid from public.schools where code = 'PILOT100';
  if sid is null then raise exception 'PILOT100 missing'; end if;

  for r in select * from public.pilot100_login_staging loop
    select id into uid from auth.users where lower(email) = lower(r.email);
    if uid is null then
      uid := gen_random_uuid();
      insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token
      ) values (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', lower(r.email), v_pass, now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('role', r.role, 'display_name', r.display_name, 'subtitle', 'PILOT100'),
        now(), now(), '', '', '', '', '', ''
      );
      insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
      values (
        gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', lower(r.email), 'email_verified', true, 'phone_verified', false),
        'email', uid::text, now(), now(), now()
      );
    else
      update auth.users
        set encrypted_password = v_pass,
            email_confirmed_at = coalesce(email_confirmed_at, now()),
            raw_user_meta_data = jsonb_build_object('role', r.role, 'display_name', r.display_name, 'subtitle', 'PILOT100'),
            updated_at = now()
      where id = uid;
    end if;

    insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at)
    values (uid, sid, r.role::public.orbit_role, r.display_name, 'PILOT100', lower(r.email), now())
    on conflict (id) do update set
      school_id = excluded.school_id,
      role = excluded.role,
      display_name = excluded.display_name,
      subtitle = excluded.subtitle,
      email = excluded.email,
      updated_at = now();

    if r.role = 'student' and r.student_id is not null then
      update public.students set profile_id = uid where id = r.student_id and school_id = sid;
    end if;
  end loop;

  delete from public.parent_links
  where student_id in (select id from public.students where school_id = sid);

  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, l.student_id, l.relationship
  from public.pilot100_link_staging l
  join auth.users u on lower(u.email) = lower(l.parent_email)
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
end $$;
