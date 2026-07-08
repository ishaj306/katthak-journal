-- Kathak Journal — Phase 3: Riyaz tracker
-- Paste into Supabase SQL Editor and Run. Idempotent.

-- ============================================================
-- riyaz_sessions
-- ============================================================

create table if not exists public.riyaz_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds integer
    check (duration_seconds is null or duration_seconds >= 0),
  notes text,
  mood text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists riyaz_sessions_user_started_idx
  on public.riyaz_sessions (user_id, started_at desc);

-- Partial unique: at most one open session per user
create unique index if not exists riyaz_sessions_open_unique
  on public.riyaz_sessions (user_id)
  where ended_at is null;

alter table public.riyaz_sessions enable row level security;

drop policy if exists "riyaz: read own" on public.riyaz_sessions;
create policy "riyaz: read own" on public.riyaz_sessions
  for select using (auth.uid() = user_id);

drop policy if exists "riyaz: insert own" on public.riyaz_sessions;
create policy "riyaz: insert own" on public.riyaz_sessions
  for insert with check (auth.uid() = user_id);

drop policy if exists "riyaz: update own" on public.riyaz_sessions;
create policy "riyaz: update own" on public.riyaz_sessions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "riyaz: delete own" on public.riyaz_sessions;
create policy "riyaz: delete own" on public.riyaz_sessions
  for delete using (auth.uid() = user_id);

-- Auto-fill duration when ended_at is set or changed
create or replace function public.set_riyaz_duration()
returns trigger as $$
begin
  if new.ended_at is not null and new.started_at is not null then
    new.duration_seconds := greatest(
      0,
      extract(epoch from (new.ended_at - new.started_at))::integer
    );
  end if;
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists riyaz_sessions_fill_duration on public.riyaz_sessions;
create trigger riyaz_sessions_fill_duration
  before insert or update on public.riyaz_sessions
  for each row execute function public.set_riyaz_duration();
