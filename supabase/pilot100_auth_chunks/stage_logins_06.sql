insert into public.pilot100_login_staging (email, role, display_name, student_id) values
('student100@pilot100.orbit.app', 'student', 'Zara Khan', 'b1000000-0000-4000-8000-000000000100'::uuid)
on conflict (email) do update set role = excluded.role, display_name = excluded.display_name, student_id = excluded.student_id;
