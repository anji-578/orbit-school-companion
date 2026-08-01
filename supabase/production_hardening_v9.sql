-- Production hardening toward Orbit 8–9 score (idempotent).
-- Apply on live: profiles lock, teacher_classes, students.active, payment_orders, demo RPC.

-- 1) Profiles: cannot self-escalate role or school_id
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self
  on public.profiles for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select p.role from public.profiles p where p.id = auth.uid())
    and school_id is not distinct from (select p.school_id from public.profiles p where p.id = auth.uid())
  );

-- Insert: only own row (role chosen at signup once)
drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self
  on public.profiles for insert
  with check (id = auth.uid());

-- 2) Soft-deactivate students
alter table public.students
  add column if not exists active boolean not null default true;

create index if not exists students_school_active_idx
  on public.students (school_id, active)
  where active = true;

-- 3) Teacher ↔ class assignments
create table if not exists public.teacher_classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  teacher_profile_id uuid not null references public.profiles (id) on delete cascade,
  class_name text not null,
  section text,
  created_at timestamptz not null default now(),
  unique (teacher_profile_id, class_name, section)
);

alter table public.teacher_classes enable row level security;

drop policy if exists teacher_classes_select on public.teacher_classes;
create policy teacher_classes_select on public.teacher_classes
  for select to authenticated
  using (
    school_id = public.current_school_id()
    and (
      public.current_profile_role() = 'school'
      or teacher_profile_id = auth.uid()
    )
  );

drop policy if exists teacher_classes_write_school on public.teacher_classes;
create policy teacher_classes_write_school on public.teacher_classes
  for all to authenticated
  using (
    school_id = public.current_school_id()
    and public.current_profile_role() = 'school'
  )
  with check (
    school_id = public.current_school_id()
    and public.current_profile_role() = 'school'
  );

-- Seed PILOT100 teachers onto Grade 8-A when present
insert into public.teacher_classes (school_id, teacher_profile_id, class_name, section)
select p.school_id, p.id, 'Grade 8', 'A'
from public.profiles p
join public.schools s on s.id = p.school_id
where s.code = 'PILOT100'
  and p.role = 'teacher'
  and p.email like 'teacher%@pilot100.orbit.app'
on conflict (teacher_profile_id, class_name, section) do nothing;

-- 4) Server-bound Razorpay orders
create table if not exists public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  created_by uuid not null references public.profiles (id) on delete cascade,
  student_id uuid references public.students (id) on delete set null,
  fee_item_ids uuid[] not null default '{}',
  amount_paise integer not null check (amount_paise > 0),
  razorpay_order_id text not null unique,
  status text not null default 'created'
    check (status = any (array['created'::text, 'paid'::text, 'failed'::text])),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

alter table public.payment_orders enable row level security;

drop policy if exists payment_orders_select on public.payment_orders;
create policy payment_orders_select on public.payment_orders
  for select to authenticated
  using (
    school_id = public.current_school_id()
    and (
      public.current_profile_role() = 'school'
      or created_by = auth.uid()
    )
  );

-- Writes only via service role (API) — no client insert policy

-- 5) Demo link RPC (security definer) — only @orbit.app demo emails
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
  end if;

  return jsonb_build_object('ok', true, 'school_id', sid);
end;
$$;

revoke all on function public.claim_demo_links() from public;
grant execute on function public.claim_demo_links() to authenticated;

-- 6) Notifications: authenticated insert must be own user or school staff broadcasting
drop policy if exists app_notifications_insert_auth on public.app_notifications;
create policy app_notifications_insert_staff_or_self on public.app_notifications
  for insert to authenticated
  with check (
    user_id = auth.uid()
    or public.current_profile_role() in ('teacher', 'school')
  );
