-- ============================================================================
-- Session Run-Up Calendar — Supabase schema
-- Run this once in your new Supabase project's SQL Editor (Database > SQL
-- Editor > New query) before deploying. One Supabase project per state/
-- client instance (per the "template" replication model — see README.md).
-- ============================================================================

create extension if not exists pgcrypto;

create table if not exists events (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  date         date not null,
  end_date     date,
  category     text not null,
  status       text not null default 'Confirmed',
  description  text,
  source_link  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Keep updated_at current on every edit.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists events_set_updated_at on events;
create trigger events_set_updated_at
before update on events
for each row execute function set_updated_at();

-- ----------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------
-- This app is intentionally open-editing with no login (per the project
-- brief): anyone with the page link can add/edit/delete events using the
-- public "anon" key. That means anyone with the anon key can also write
-- directly to this table via the Supabase API, not just through the app.
-- That's the accepted tradeoff for a no-login shared calendar — just be
-- aware the link itself is effectively the only access control.
alter table events enable row level security;

drop policy if exists "Public can read events" on events;
create policy "Public can read events"
  on events for select
  using (true);

drop policy if exists "Public can insert events" on events;
create policy "Public can insert events"
  on events for insert
  with check (true);

drop policy if exists "Public can update events" on events;
create policy "Public can update events"
  on events for update
  using (true);

drop policy if exists "Public can delete events" on events;
create policy "Public can delete events"
  on events for delete
  using (true);

-- ----------------------------------------------------------------------
-- Realtime (so edits show up live for everyone viewing the page)
-- ----------------------------------------------------------------------
-- If this errors saying the table is already a member, that's fine — it
-- just means it's already enabled. You can also toggle this on from
-- Database > Replication in the Supabase dashboard instead.
alter publication supabase_realtime add table events;
