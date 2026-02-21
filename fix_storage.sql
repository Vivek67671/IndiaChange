-- IndiaChange complete Supabase schema + RLS + storage + counters

create extension if not exists "pgcrypto";

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  city text,
  occupation text,
  role text not null default 'user' check (role in ('user', 'moderator', 'admin')),
  status text not null default 'active' check (status in ('active', 'banned')),
  points int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Reports
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text not null,
  description text not null,
  state text not null,
  city text not null,
  location text not null,
  event_date date null,
  event_time time null,
  image_url text null,
  video_url text null,
  video_link text null,
  author_name text not null default 'Anonymous',
  author_id uuid null references public.profiles(id) on delete set null,
  status text not null default 'Open',
  upvotes int not null default 0,
  vouch_count int not null default 0,
  flags int not null default 0,
  trust_score text not null default 'Low',
  timeline jsonb not null default '[]'::jsonb,
  resolved_at timestamptz null,
  resolved_by uuid null references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.report_votes (
  report_id uuid not null references public.reports(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (report_id, user_id)
);

create table if not exists public.report_vouches (
  report_id uuid not null references public.reports(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (report_id, user_id)
);

create table if not exists public.report_flags (
  report_id uuid not null references public.reports(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reason text,
  created_at timestamptz not null default now(),
  primary key (report_id, user_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  author_name text not null,
  parent_id uuid null references public.comments(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null
);

create table if not exists public.chapters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  city text not null,
  state text,
  verified boolean not null default false,
  score int not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.chapter_members (
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (chapter_id, user_id)
);

create table if not exists public.alert_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  city text not null,
  categories text[] not null default '{all}',
  channels text[] not null default '{in_app,email}',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, city)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null,
  payload jsonb not null default '{}'::jsonb,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_type text,
  target_id text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.system_settings (
  id int primary key,
  maintenance_mode boolean not null default false,
  allow_signups boolean not null default true,
  global_announcement text not null default '',
  auto_moderation boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into public.system_settings (id)
values (1)
on conflict (id) do nothing;

create table if not exists public.resource_links (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  url text not null,
  created_at timestamptz not null default now()
);

insert into public.resource_links (title, description, url)
values
('Cyber Crime Portal', 'File official cyber fraud complaints', 'https://cybercrime.gov.in'),
('RTI Online', 'File a Right to Information request', 'https://rtionline.gov.in'),
('Swachh Bharat App', 'Official government cleaning app', 'https://play.google.com/store/apps/details?id=com.ichangemycity.swachhbharat')
on conflict do nothing;

-- Trigger helpers
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.refresh_report_counters()
returns trigger
language plpgsql
security definer
as $$
declare
  target_report uuid;
begin
  target_report := coalesce(new.report_id, old.report_id);

  update public.reports r
  set
    upvotes = (select count(*) from public.report_votes v where v.report_id = target_report),
    vouch_count = (select count(*) from public.report_vouches vv where vv.report_id = target_report),
    flags = (select count(*) from public.report_flags f where f.report_id = target_report),
    trust_score = case
      when (select count(*) from public.report_vouches vv where vv.report_id = target_report) > 20 then 'High'
      when (select count(*) from public.report_vouches vv where vv.report_id = target_report) > 5 then 'Med'
      else 'Low'
    end,
    updated_at = now()
  where r.id = target_report;

  return null;
end;
$$;

drop trigger if exists reports_set_updated_at on public.reports;
create trigger reports_set_updated_at
before update on public.reports
for each row execute function public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists comments_set_updated_at on public.comments;
create trigger comments_set_updated_at
before update on public.comments
for each row execute function public.set_updated_at();

drop trigger if exists report_votes_refresh_counter on public.report_votes;
create trigger report_votes_refresh_counter
after insert or delete on public.report_votes
for each row execute function public.refresh_report_counters();

drop trigger if exists report_vouches_refresh_counter on public.report_vouches;
create trigger report_vouches_refresh_counter
after insert or delete on public.report_vouches
for each row execute function public.refresh_report_counters();

drop trigger if exists report_flags_refresh_counter on public.report_flags;
create trigger report_flags_refresh_counter
after insert or delete on public.report_flags
for each row execute function public.refresh_report_counters();

-- RLS
alter table public.profiles enable row level security;
alter table public.reports enable row level security;
alter table public.report_votes enable row level security;
alter table public.report_vouches enable row level security;
alter table public.report_flags enable row level security;
alter table public.comments enable row level security;
alter table public.chapters enable row level security;
alter table public.chapter_members enable row level security;
alter table public.alert_subscriptions enable row level security;
alter table public.notifications enable row level security;
alter table public.admin_audit_logs enable row level security;
alter table public.system_settings enable row level security;
alter table public.resource_links enable row level security;

-- Profiles policies
drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin" on public.profiles
for select using (
  auth.uid() = id or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  )
);

drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_update_self_or_admin" on public.profiles
for update using (
  auth.uid() = id or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  )
)
with check (
  auth.uid() = id or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  )
);

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles
for insert with check (auth.uid() = id);

-- Reports policies
drop policy if exists "reports_select_all" on public.reports;
create policy "reports_select_all" on public.reports for select using (true);

drop policy if exists "reports_insert_auth" on public.reports;
create policy "reports_insert_auth" on public.reports
for insert with check (auth.uid() is not null and (author_id is null or author_id = auth.uid()));

drop policy if exists "reports_update_owner_or_admin" on public.reports;
create policy "reports_update_owner_or_admin" on public.reports
for update using (
  author_id = auth.uid() or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'moderator')
  )
)
with check (
  author_id = auth.uid() or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'moderator')
  )
);

-- Engagement policies
drop policy if exists "votes_rw_owner" on public.report_votes;
create policy "votes_rw_owner" on public.report_votes
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "vouches_rw_owner" on public.report_vouches;
create policy "vouches_rw_owner" on public.report_vouches
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "flags_rw_owner" on public.report_flags;
create policy "flags_rw_owner" on public.report_flags
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Comments policies
drop policy if exists "comments_select_all" on public.comments;
create policy "comments_select_all" on public.comments for select using (true);

drop policy if exists "comments_insert_auth" on public.comments;
create policy "comments_insert_auth" on public.comments
for insert with check (auth.uid() = author_id);

drop policy if exists "comments_update_owner_or_admin" on public.comments;
create policy "comments_update_owner_or_admin" on public.comments
for update using (
  auth.uid() = author_id or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'moderator')
  )
)
with check (
  auth.uid() = author_id or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'moderator')
  )
);

-- Chapters
drop policy if exists "chapters_select_all" on public.chapters;
create policy "chapters_select_all" on public.chapters for select using (true);

drop policy if exists "chapters_insert_auth" on public.chapters;
create policy "chapters_insert_auth" on public.chapters
for insert with check (auth.uid() = created_by);

drop policy if exists "chapter_members_rw_owner" on public.chapter_members;
create policy "chapter_members_rw_owner" on public.chapter_members
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Alerts + notifications
drop policy if exists "subs_rw_owner" on public.alert_subscriptions;
create policy "subs_rw_owner" on public.alert_subscriptions
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "notifications_rw_owner" on public.notifications;
create policy "notifications_rw_owner" on public.notifications
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Admin-only tables
drop policy if exists "audit_admin_only" on public.admin_audit_logs;
create policy "audit_admin_only" on public.admin_audit_logs
for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
)
with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "settings_admin_only" on public.system_settings;
create policy "settings_admin_only" on public.system_settings
for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
)
with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Public resources readable, admin write
drop policy if exists "resources_read_all" on public.resource_links;
create policy "resources_read_all" on public.resource_links for select using (true);

drop policy if exists "resources_admin_write" on public.resource_links;
create policy "resources_admin_write" on public.resource_links
for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
)
with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Storage bucket for evidence
insert into storage.buckets (id, name, public)
values ('report-evidence', 'report-evidence', true)
on conflict (id) do nothing;

drop policy if exists "evidence_public_read" on storage.objects;
create policy "evidence_public_read"
on storage.objects for select
using (bucket_id = 'report-evidence');

drop policy if exists "evidence_auth_upload" on storage.objects;
create policy "evidence_auth_upload"
on storage.objects for insert
with check (bucket_id = 'report-evidence' and auth.uid() is not null);
