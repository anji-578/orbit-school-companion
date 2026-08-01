create extension if not exists pgcrypto;
do $$
declare sid uuid; uid uuid; v_email text; v_pass text := crypt('Pilot100!', gen_salt('bf'));
begin
  select id into sid from public.schools where code = 'PILOT100';
  if sid is null then raise exception 'PILOT100 missing'; end if;
  v_email := 'student075@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Om Rao','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Om Rao','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Om Rao', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000075'::uuid and school_id = sid;
  v_email := 'student076@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Priya Hegde','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Priya Hegde','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Priya Hegde', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000076'::uuid and school_id = sid;
  v_email := 'student077@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Meera Agarwal','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Meera Agarwal','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Meera Agarwal', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000077'::uuid and school_id = sid;
  v_email := 'student078@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Nisha Sharma','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Nisha Sharma','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Nisha Sharma', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000078'::uuid and school_id = sid;
  v_email := 'student079@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Kavya Nair','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Kavya Nair','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Kavya Nair', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000079'::uuid and school_id = sid;
  v_email := 'student080@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Tanvi Singh','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Tanvi Singh','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Tanvi Singh', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000080'::uuid and school_id = sid;
  v_email := 'student081@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Lakshmi Mukherjee','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Lakshmi Mukherjee','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Lakshmi Mukherjee', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000081'::uuid and school_id = sid;
  v_email := 'student082@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Gayatri Kapoor','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Gayatri Kapoor','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Gayatri Kapoor', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000082'::uuid and school_id = sid;
  v_email := 'student083@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Radha Pillai','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Radha Pillai','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Radha Pillai', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000083'::uuid and school_id = sid;
  v_email := 'student084@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Tejas Deshmukh','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Tejas Deshmukh','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Tejas Deshmukh', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000084'::uuid and school_id = sid;
  v_email := 'student085@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Manoj Sen','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Manoj Sen','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Manoj Sen', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000085'::uuid and school_id = sid;
  v_email := 'student086@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Aarav Patel','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Aarav Patel','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Aarav Patel', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000086'::uuid and school_id = sid;
  v_email := 'student087@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Aditya Menon','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Aditya Menon','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Aditya Menon', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000087'::uuid and school_id = sid;
  v_email := 'student088@pilot100.orbit.app';
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
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000088'::uuid and school_id = sid;
  v_email := 'student089@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Lakshmi Sen','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Lakshmi Sen','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Lakshmi Sen', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000089'::uuid and school_id = sid;
  v_email := 'student090@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Gayatri Patel','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Gayatri Patel','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Gayatri Patel', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000090'::uuid and school_id = sid;
  v_email := 'student091@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Radha Menon','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Radha Menon','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Radha Menon', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000091'::uuid and school_id = sid;
  v_email := 'student092@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Tejas Das','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Tejas Das','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Tejas Das', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000092'::uuid and school_id = sid;
  v_email := 'student093@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Manoj Joshi','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Manoj Joshi','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Manoj Joshi', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000093'::uuid and school_id = sid;
  v_email := 'student094@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Aarav Rao','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Aarav Rao','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Aarav Rao', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000094'::uuid and school_id = sid;
  v_email := 'student095@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Aditya Hegde','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Aditya Hegde','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Aditya Hegde', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000095'::uuid and school_id = sid;
  v_email := 'student096@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Arjun Agarwal','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Arjun Agarwal','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Arjun Agarwal', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000096'::uuid and school_id = sid;
  v_email := 'student097@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Reyansh Sharma','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Reyansh Sharma','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Reyansh Sharma', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000097'::uuid and school_id = sid;
  v_email := 'student098@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Krishna Nair','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Krishna Nair','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Krishna Nair', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000098'::uuid and school_id = sid;
  v_email := 'student099@pilot100.orbit.app';
  select id into uid from auth.users where lower(email) = v_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role','student','display_name','Ananya Singh','subtitle','PILOT100'), now(), now(), '', '', '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());
  else
    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('role','student','display_name','Ananya Singh','subtitle','PILOT100'), updated_at = now() where id = uid;
  end if;
  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at) values (uid, sid, 'student'::public.orbit_role, 'Ananya Singh', 'PILOT100', v_email, now())
  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();
  update public.students set profile_id = uid where id = 'b1000000-0000-4000-8000-000000000099'::uuid and school_id = sid;
end $$;
