create extension if not exists pgcrypto;
do $$
declare sid uuid; uid uuid; v_email text; v_pass text := crypt('Pilot100!', gen_salt('bf'));
begin
  select id into sid from public.schools where code = 'PILOT100';
  if sid is null then raise exception 'PILOT100 missing'; end if;
  v_email := 'parent045@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','parent','display_name','Singh Guardian','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','parent','display_name','Singh Guardian','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'parent'::public.orbit_role, 'Singh Guardian', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  v_email := 'parent046@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','parent','display_name','Mukherjee Guardian','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','parent','display_name','Mukherjee Guardian','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'parent'::public.orbit_role, 'Mukherjee Guardian', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  v_email := 'parent047@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','parent','display_name','Pillai Guardian','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','parent','display_name','Pillai Guardian','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'parent'::public.orbit_role, 'Pillai Guardian', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  v_email := 'parent048@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','parent','display_name','Deshmukh Guardian','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','parent','display_name','Deshmukh Guardian','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'parent'::public.orbit_role, 'Deshmukh Guardian', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  v_email := 'parent049@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','parent','display_name','Das Guardian','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','parent','display_name','Das Guardian','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'parent'::public.orbit_role, 'Das Guardian', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  v_email := 'parent050@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','parent','display_name','Joshi Guardian','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','parent','display_name','Joshi Guardian','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'parent'::public.orbit_role, 'Joshi Guardian', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  v_email := 'parent051@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','parent','display_name','Sharma Guardian','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','parent','display_name','Sharma Guardian','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'parent'::public.orbit_role, 'Sharma Guardian', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  v_email := 'parent052@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','parent','display_name','Hegde Guardian','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','parent','display_name','Hegde Guardian','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'parent'::public.orbit_role, 'Hegde Guardian', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  v_email := 'parent053@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','parent','display_name','Agarwal Guardian','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','parent','display_name','Agarwal Guardian','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'parent'::public.orbit_role, 'Agarwal Guardian', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  v_email := 'parent054@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','parent','display_name','Sharma Guardian','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','parent','display_name','Sharma Guardian','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'parent'::public.orbit_role, 'Sharma Guardian', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  v_email := 'parent055@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','parent','display_name','Nair Guardian','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','parent','display_name','Nair Guardian','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'parent'::public.orbit_role, 'Nair Guardian', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  v_email := 'parent056@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','parent','display_name','Singh Guardian','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','parent','display_name','Singh Guardian','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'parent'::public.orbit_role, 'Singh Guardian', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  v_email := 'parent057@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','parent','display_name','Mukherjee Guardian','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','parent','display_name','Mukherjee Guardian','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'parent'::public.orbit_role, 'Mukherjee Guardian', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  v_email := 'parent058@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','parent','display_name','Kapoor Guardian','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','parent','display_name','Kapoor Guardian','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'parent'::public.orbit_role, 'Kapoor Guardian', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  v_email := 'parent059@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','parent','display_name','Pillai Guardian','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','parent','display_name','Pillai Guardian','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'parent'::public.orbit_role, 'Pillai Guardian', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  v_email := 'parent060@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','parent','display_name','Deshmukh Guardian','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','parent','display_name','Deshmukh Guardian','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'parent'::public.orbit_role, 'Deshmukh Guardian', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  v_email := 'parent061@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','parent','display_name','Sen Guardian','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','parent','display_name','Sen Guardian','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'parent'::public.orbit_role, 'Sen Guardian', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  v_email := 'parent062@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','parent','display_name','Patel Guardian','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','parent','display_name','Patel Guardian','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'parent'::public.orbit_role, 'Patel Guardian', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  v_email := 'parent063@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','parent','display_name','Menon Guardian','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','parent','display_name','Menon Guardian','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'parent'::public.orbit_role, 'Menon Guardian', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  v_email := 'parent064@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','parent','display_name','Das Guardian','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','parent','display_name','Das Guardian','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'parent'::public.orbit_role, 'Das Guardian', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  v_email := 'parent065@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','parent','display_name','Joshi Guardian','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','parent','display_name','Joshi Guardian','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'parent'::public.orbit_role, 'Joshi Guardian', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  v_email := 'parent066@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','parent','display_name','రెడ్డి Guardian','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','parent','display_name','రెడ్డి Guardian','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'parent'::public.orbit_role, 'రెడ్డి Guardian', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  v_email := 'parent067@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','parent','display_name','शर्मा Guardian','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','parent','display_name','शर्मा Guardian','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'parent'::public.orbit_role, 'शर्मा Guardian', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  v_email := 'parent068@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','parent','display_name','Agarwal Guardian','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','parent','display_name','Agarwal Guardian','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'parent'::public.orbit_role, 'Agarwal Guardian', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  v_email := 'parent069@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','parent','display_name','Das Guardian','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','parent','display_name','Das Guardian','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'parent'::public.orbit_role, 'Das Guardian', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
end $$;
