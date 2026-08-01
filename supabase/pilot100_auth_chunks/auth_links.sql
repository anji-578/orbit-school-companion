create extension if not exists pgcrypto;
do $$
declare sid uuid; uid uuid; v_email text; v_pass text := crypt('Pilot100!', gen_salt('bf'));
begin
  select id into sid from public.schools where code = 'PILOT100';
  if sid is null then raise exception 'PILOT100 missing'; end if;
  delete from public.parent_links where student_id in (select id from public.students where school_id = sid);
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000011'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent001@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000012'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent001@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000013'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent001@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000021'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent002@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000022'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent002@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000001'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent003@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000002'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent004@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000003'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent005@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000004'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent006@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000005'::uuid, 'mother' from auth.users u where lower(u.email) = 'parent007@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000006'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent008@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000007'::uuid, 'father' from auth.users u where lower(u.email) = 'parent009@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000008'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent010@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000009'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent011@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000010'::uuid, 'mother' from auth.users u where lower(u.email) = 'parent012@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000014'::uuid, 'father' from auth.users u where lower(u.email) = 'parent013@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000015'::uuid, 'mother' from auth.users u where lower(u.email) = 'parent014@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000016'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent015@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000017'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent016@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000018'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent017@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000019'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent018@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000020'::uuid, 'mother' from auth.users u where lower(u.email) = 'parent019@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000023'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent020@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000024'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent021@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000025'::uuid, 'mother' from auth.users u where lower(u.email) = 'parent022@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000026'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent023@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000027'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent024@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000028'::uuid, 'father' from auth.users u where lower(u.email) = 'parent025@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000029'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent026@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000030'::uuid, 'mother' from auth.users u where lower(u.email) = 'parent027@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000031'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent028@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000032'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent029@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000033'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent030@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000034'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent031@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000035'::uuid, 'father' from auth.users u where lower(u.email) = 'parent032@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000036'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent033@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000037'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent034@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000038'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent035@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000039'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent036@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000040'::uuid, 'mother' from auth.users u where lower(u.email) = 'parent037@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000041'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent038@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000042'::uuid, 'father' from auth.users u where lower(u.email) = 'parent039@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000043'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent040@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000044'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent041@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000045'::uuid, 'mother' from auth.users u where lower(u.email) = 'parent042@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000046'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent043@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000047'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent044@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000048'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent045@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000049'::uuid, 'father' from auth.users u where lower(u.email) = 'parent046@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000051'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent047@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000052'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent048@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000053'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent049@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000054'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent050@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000055'::uuid, 'mother' from auth.users u where lower(u.email) = 'parent051@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000056'::uuid, 'father' from auth.users u where lower(u.email) = 'parent052@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000057'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent053@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000058'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent054@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000059'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent055@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000060'::uuid, 'mother' from auth.users u where lower(u.email) = 'parent056@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000061'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent057@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000062'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent058@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000063'::uuid, 'father' from auth.users u where lower(u.email) = 'parent059@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000064'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent060@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000065'::uuid, 'mother' from auth.users u where lower(u.email) = 'parent061@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000066'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent062@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000067'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent063@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000068'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent064@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000069'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent065@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000070'::uuid, 'father' from auth.users u where lower(u.email) = 'parent066@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000071'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent067@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000072'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent068@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000073'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent069@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000074'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent070@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000075'::uuid, 'mother' from auth.users u where lower(u.email) = 'parent071@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000076'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent072@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000077'::uuid, 'father' from auth.users u where lower(u.email) = 'parent073@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000078'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent074@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000079'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent075@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000080'::uuid, 'mother' from auth.users u where lower(u.email) = 'parent076@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000081'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent077@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000082'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent078@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000083'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent079@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000084'::uuid, 'father' from auth.users u where lower(u.email) = 'parent080@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000085'::uuid, 'mother' from auth.users u where lower(u.email) = 'parent081@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000086'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent082@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000087'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent083@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000088'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent084@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000089'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent085@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000090'::uuid, 'mother' from auth.users u where lower(u.email) = 'parent086@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000091'::uuid, 'father' from auth.users u where lower(u.email) = 'parent087@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000092'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent088@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000093'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent089@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000094'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent090@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000095'::uuid, 'mother' from auth.users u where lower(u.email) = 'parent091@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000096'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent092@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000097'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent093@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000098'::uuid, 'father' from auth.users u where lower(u.email) = 'parent094@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000099'::uuid, 'guardian' from auth.users u where lower(u.email) = 'parent095@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
  insert into public.parent_links (parent_profile_id, student_id, relationship)
  select u.id, 'b1000000-0000-4000-8000-000000000100'::uuid, 'mother' from auth.users u where lower(u.email) = 'parent096@pilot100.orbit.app'
  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;
end $$;
