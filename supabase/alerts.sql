-- Orbit alerts: in-app + Web Push + SMS log
-- Run in Supabase SQL Editor (after base schema).

create table if not exists public.app_notifications (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete cascade,
  school_id uuid references public.schools (id) on delete set null,
  role public.orbit_role,
  event_type text not null,
  title text not null,
  body text not null,
  data jsonb default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, endpoint)
);

create table if not exists public.alert_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  push_enabled boolean not null default true,
  sms_enabled boolean not null default false,
  phone_e164 text,
  notify_absent boolean not null default true,
  notify_fees boolean not null default true,
  notify_leave boolean not null default true,
  notify_syllabus boolean not null default true,
  quiet_start time,
  quiet_end time,
  updated_at timestamptz not null default now()
);

create table if not exists public.sms_log (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete set null,
  school_id uuid references public.schools (id) on delete set null,
  to_e164 text not null,
  template_id text,
  event_type text not null,
  body text not null,
  status text not null check (status in ('queued', 'sent', 'failed', 'skipped')),
  provider text default 'msg91',
  provider_id text,
  error text,
  cost_paise integer default 0,
  created_at timestamptz not null default now()
);

create index if not exists app_notifications_user_idx on public.app_notifications (user_id, created_at desc);
create index if not exists push_subscriptions_user_idx on public.push_subscriptions (user_id);
create index if not exists sms_log_created_idx on public.sms_log (created_at desc);

alter table public.app_notifications enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.alert_preferences enable row level security;
alter table public.sms_log enable row level security;

-- Users manage their own rows
drop policy if exists app_notifications_select_own on public.app_notifications;
create policy app_notifications_select_own on public.app_notifications
  for select to authenticated using (user_id = auth.uid() or user_id is null);

drop policy if exists push_subscriptions_own on public.push_subscriptions;
create policy push_subscriptions_own on public.push_subscriptions
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists alert_preferences_own on public.alert_preferences;
create policy alert_preferences_own on public.alert_preferences
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- SMS log readable by school admins of same school + own user
drop policy if exists sms_log_select on public.sms_log;
create policy sms_log_select on public.sms_log
  for select to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'school'
        and (sms_log.school_id is null or p.school_id = sms_log.school_id)
    )
  );
