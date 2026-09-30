-- Round 3: XP rules table, learning_events source, award_xp without client points.

create table if not exists public.xp_award_rules (
  event_type text primary key,
  points integer not null check (points >= 0),
  badge_name text,
  description text not null default ''
);

insert into public.xp_award_rules (event_type, points, badge_name, description) values
  ('homework_complete_easy', 15, null, 'Complete easy homework'),
  ('homework_complete_medium', 25, null, 'Complete medium homework'),
  ('homework_complete_hard', 45, null, 'Complete hard homework'),
  ('homework_all_done', 0, 'Task Master', 'All homework complete'),
  ('quiz_perfect', 100, 'Quiz Whiz', 'Perfect quiz score'),
  ('scan_practice_pass', 100, 'Concept Master', 'Paper coach practice passed'),
  ('scan_practice_scholar', 0, 'Rising Scholar', 'Paper coach practice badge'),
  ('gk_pass_easy', 55, 'GK Starter', 'GK easy pass'),
  ('gk_pass_medium', 70, 'GK Explorer', 'GK medium pass'),
  ('gk_pass_hard', 80, 'GK Champion', 'GK hard pass'),
  ('gk_attempt', 15, null, 'GK attempt without pass'),
  ('ask_orbit_helpful', 10, 'Curious Mind', 'Ask Orbit non-refusal answer')
on conflict (event_type) do update set
  points = excluded.points,
  badge_name = excluded.badge_name,
  description = excluded.description;

-- Source events the ledger verifies before awarding
create table if not exists public.learning_events (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  event_type text not null references public.xp_award_rules(event_type),
  ref_id text,
  created_by uuid not null,
  created_at timestamptz not null default now()
);

create index if not exists learning_events_student_idx on public.learning_events (student_id, created_at desc);

alter table public.learning_events enable row level security;
alter table public.xp_award_rules enable row level security;

drop policy if exists learning_events_select_own on public.learning_events;
create policy learning_events_select_own on public.learning_events
  for select using (
    student_id in (select id from public.students where profile_id = auth.uid())
  );

drop policy if exists learning_events_insert_own on public.learning_events;
create policy learning_events_insert_own on public.learning_events
  for insert with check (
    created_by = auth.uid()
    and student_id in (select id from public.students where profile_id = auth.uid())
  );

drop policy if exists xp_award_rules_select_auth on public.xp_award_rules;
create policy xp_award_rules_select_auth on public.xp_award_rules
  for select to authenticated using (true);

-- School demo branding flag (not email-domain heuristics)
alter table public.schools add column if not exists is_demo boolean not null default false;

-- Replace award_xp: no points argument; verifies learning_event ownership + rules
drop function if exists public.award_xp(uuid, text, text, integer, text, text);
drop function if exists public.award_xp(uuid, text, text, integer, text);

create or replace function public.award_xp(
  p_learning_event_id uuid,
  p_idempotency_key text default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  ev public.learning_events%rowtype;
  rule public.xp_award_rules%rowtype;
  idem text;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select * into ev from public.learning_events where id = p_learning_event_id;
  if not found then
    raise exception 'source event not found';
  end if;

  if ev.created_by <> auth.uid() then
    raise exception 'not authorized';
  end if;

  if not exists (
    select 1 from public.students s
    where s.id = ev.student_id and s.profile_id = auth.uid()
  ) then
    raise exception 'not authorized';
  end if;

  select * into rule from public.xp_award_rules where event_type = ev.event_type;
  if not found then
    raise exception 'unknown event type';
  end if;

  idem := coalesce(nullif(trim(p_idempotency_key), ''), p_learning_event_id::text);

  insert into public.xp_events (student_id, event_type, ref_id, points, idempotency_key)
  values (ev.student_id, ev.event_type, ev.ref_id, rule.points, idem)
  on conflict (student_id, idempotency_key) do nothing;

  if rule.badge_name is not null then
    insert into public.student_badges (student_id, badge_name)
    values (ev.student_id, rule.badge_name)
    on conflict (student_id, badge_name) do nothing;
  end if;
end;
$$;

revoke all on function public.award_xp(uuid, text) from public;
revoke all on function public.award_xp(uuid, text) from anon;
grant execute on function public.award_xp(uuid, text) to authenticated;

-- Ledger remains append-only from clients
revoke insert, update, delete on public.xp_events from authenticated, anon, public;
revoke insert, update, delete on public.student_badges from authenticated, anon, public;
revoke insert, update, delete on public.xp_award_rules from authenticated, anon, public;
grant select on public.xp_events to authenticated;
grant select on public.student_badges to authenticated;
grant select on public.student_xp_totals to authenticated;
grant select on public.xp_award_rules to authenticated;
grant select, insert on public.learning_events to authenticated;
