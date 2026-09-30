-- XP ledger (server-authoritative). Apply to local Supabase only.
-- Client must not UPDATE total XP directly; award via award_xp RPC.

create table if not exists public.xp_events (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  event_type text not null,
  ref_id text,
  points integer not null check (points >= 0),
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  unique (student_id, idempotency_key)
);

create table if not exists public.student_badges (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  badge_name text not null,
  awarded_at timestamptz not null default now(),
  unique (student_id, badge_name)
);

create or replace view public.student_xp_totals as
select student_id, coalesce(sum(points), 0)::integer as total_xp
from public.xp_events
group by student_id;

alter table public.xp_events enable row level security;
alter table public.student_badges enable row level security;

-- Students read own rows only (policies assume students.profile_id = auth.uid())
create policy xp_events_select_own on public.xp_events
  for select using (
    student_id in (select id from public.students where profile_id = auth.uid())
  );

create policy student_badges_select_own on public.student_badges
  for select using (
    student_id in (select id from public.students where profile_id = auth.uid())
  );

-- Inserts only via SECURITY DEFINER RPC
create or replace function public.award_xp(
  p_student_id uuid,
  p_event_type text,
  p_ref_id text,
  p_points integer,
  p_idempotency_key text,
  p_badge text default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_points < 0 then
    raise exception 'points must be non-negative';
  end if;
  insert into public.xp_events (student_id, event_type, ref_id, points, idempotency_key)
  values (p_student_id, p_event_type, p_ref_id, p_points, p_idempotency_key)
  on conflict (student_id, idempotency_key) do nothing;
  if p_badge is not null then
    insert into public.student_badges (student_id, badge_name)
    values (p_student_id, p_badge)
    on conflict (student_id, badge_name) do nothing;
  end if;
end;
$$;

revoke all on function public.award_xp from public;
grant execute on function public.award_xp to authenticated;
