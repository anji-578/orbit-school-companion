create extension if not exists pgcrypto;
do $$
declare sid uuid; uid uuid; v_email text; v_pass text := crypt('Pilot100!', gen_salt('bf'));
begin
  select id into sid from public.schools where code = 'PILOT100';
  if sid is null then raise exception 'PILOT100 missing'; end if;
  v_email := 'parent095@pilot100.orbit.app';
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
  v_email := 'parent096@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','parent','display_name','Khan Guardian','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','parent','display_name','Khan Guardian','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'parent'::public.orbit_role, 'Khan Guardian', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  v_email := 'student001@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Aarav D''Souza','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Aarav D''Souza','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Aarav D''Souza', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000001'::uuid and school_id = sid;
  v_email := 'student002@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Mary-Anne Joseph','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Mary-Anne Joseph','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Mary-Anne Joseph', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000002'::uuid and school_id = sid;
  v_email := 'student003@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Muhammad Ibrahim Al-Hassan','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Muhammad Ibrahim Al-Hassan','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Muhammad Ibrahim Al-Hassan', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000003'::uuid and school_id = sid;
  v_email := 'student004@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Chinnu','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Chinnu','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Chinnu', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000004'::uuid and school_id = sid;
  v_email := 'student005@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Spaced Name Test','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Spaced Name Test','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Spaced Name Test', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000005'::uuid and school_id = sid;
  v_email := 'student006@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Ñisha O''Brien','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Ñisha O''Brien','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Ñisha O''Brien', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000006'::uuid and school_id = sid;
  v_email := 'student007@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Saanvi Sen','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Saanvi Sen','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Saanvi Sen', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000007'::uuid and school_id = sid;
  v_email := 'student008@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Anika Patel','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Anika Patel','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Anika Patel', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000008'::uuid and school_id = sid;
  v_email := 'student009@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Navya Menon','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Navya Menon','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Navya Menon', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000009'::uuid and school_id = sid;
  v_email := 'student010@pilot100.orbit.app';
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
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000010'::uuid and school_id = sid;
  v_email := 'student011@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Nikhil Joshi','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Nikhil Joshi','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Nikhil Joshi', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000011'::uuid and school_id = sid;
  v_email := 'student012@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Varun Rao','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Varun Rao','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Varun Rao', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000012'::uuid and school_id = sid;
  v_email := 'student013@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Dev Hegde','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Dev Hegde','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Dev Hegde', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000013'::uuid and school_id = sid;
  v_email := 'student014@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Om Agarwal','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Om Agarwal','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Om Agarwal', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000014'::uuid and school_id = sid;
  v_email := 'student015@pilot100.orbit.app';
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
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000015'::uuid and school_id = sid;
  v_email := 'student016@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Meera Nair','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Meera Nair','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Meera Nair', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000016'::uuid and school_id = sid;
  v_email := 'student017@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Nisha Singh','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Nisha Singh','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Nisha Singh', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000017'::uuid and school_id = sid;
  v_email := 'student018@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Kavya Mukherjee','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Kavya Mukherjee','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Kavya Mukherjee', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000018'::uuid and school_id = sid;
  v_email := 'student019@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Rohan Sen','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Rohan Sen','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Rohan Sen', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000019'::uuid and school_id = sid;
  v_email := 'student020@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Nikhil Patel','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Nikhil Patel','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Nikhil Patel', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000020'::uuid and school_id = sid;
  v_email := 'student021@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Varun Menon','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Varun Menon','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Varun Menon', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000021'::uuid and school_id = sid;
  v_email := 'student022@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Dev Das','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Dev Das','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Dev Das', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000022'::uuid and school_id = sid;
  v_email := 'student023@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Om Joshi','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Om Joshi','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Om Joshi', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000023'::uuid and school_id = sid;
end $$;
