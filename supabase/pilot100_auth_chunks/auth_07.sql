create extension if not exists pgcrypto;
do $$
declare sid uuid; uid uuid; v_email text; v_pass text := crypt('Pilot100!', gen_salt('bf'));
begin
  select id into sid from public.schools where code = 'PILOT100';
  if sid is null then raise exception 'PILOT100 missing'; end if;
  v_email := 'student049@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Saanvi Mukherjee','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Saanvi Mukherjee','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Saanvi Mukherjee', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000049'::uuid and school_id = sid;
  v_email := 'student050@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Anika Kapoor','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Anika Kapoor','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Anika Kapoor', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000050'::uuid and school_id = sid;
  v_email := 'student051@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Navya Pillai','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Navya Pillai','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Navya Pillai', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000051'::uuid and school_id = sid;
  v_email := 'student052@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Rohan Deshmukh','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Rohan Deshmukh','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Rohan Deshmukh', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000052'::uuid and school_id = sid;
  v_email := 'student053@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Arjun Das','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Arjun Das','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Arjun Das', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000053'::uuid and school_id = sid;
  v_email := 'student054@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Reyansh Joshi','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Reyansh Joshi','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Reyansh Joshi', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000054'::uuid and school_id = sid;
  v_email := 'student055@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Priya Sharma','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Priya Sharma','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Priya Sharma', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000055'::uuid and school_id = sid;
  v_email := 'student056@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Ananya Hegde','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Ananya Hegde','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Ananya Hegde', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000056'::uuid and school_id = sid;
  v_email := 'student057@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Diya Agarwal','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Diya Agarwal','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Diya Agarwal', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000057'::uuid and school_id = sid;
  v_email := 'student058@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Saanvi Sharma','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Saanvi Sharma','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Saanvi Sharma', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000058'::uuid and school_id = sid;
  v_email := 'student059@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Anika Nair','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Anika Nair','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Anika Nair', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000059'::uuid and school_id = sid;
  v_email := 'student061@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Rohan Mukherjee','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Rohan Mukherjee','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Rohan Mukherjee', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000061'::uuid and school_id = sid;
  v_email := 'student062@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Nikhil Kapoor','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Nikhil Kapoor','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Nikhil Kapoor', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000062'::uuid and school_id = sid;
  v_email := 'student063@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Varun Pillai','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Varun Pillai','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Varun Pillai', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000063'::uuid and school_id = sid;
  v_email := 'student064@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Dev Deshmukh','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Dev Deshmukh','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Dev Deshmukh', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000064'::uuid and school_id = sid;
  v_email := 'student065@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Om Sen','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Om Sen','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Om Sen', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000065'::uuid and school_id = sid;
  v_email := 'student066@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Priya Patel','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Priya Patel','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Priya Patel', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000066'::uuid and school_id = sid;
  v_email := 'student067@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Meera Menon','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Meera Menon','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Meera Menon', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000067'::uuid and school_id = sid;
  v_email := 'student068@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Nisha Das','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Nisha Das','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Nisha Das', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000068'::uuid and school_id = sid;
  v_email := 'student069@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Kavya Joshi','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Kavya Joshi','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Kavya Joshi', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000069'::uuid and school_id = sid;
  v_email := 'student070@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','కృష్ణ రెడ్డి','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','కృష్ణ రెడ్డి','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'కృష్ణ రెడ్డి', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000070'::uuid and school_id = sid;
  v_email := 'student071@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','अनिका शर्मा','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','अनिका शर्मा','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'अनिका शर्मा', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000071'::uuid and school_id = sid;
  v_email := 'student072@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Gayatri Agarwal','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Gayatri Agarwal','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Gayatri Agarwal', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000072'::uuid and school_id = sid;
  v_email := 'student073@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Varun Das','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Varun Das','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Varun Das', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000073'::uuid and school_id = sid;
  v_email := 'student074@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Dev Joshi','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Dev Joshi','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Dev Joshi', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000074'::uuid and school_id = sid;
end $$;
