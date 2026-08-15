-- Kathak Journal — saved Riyaaz mixes
-- Paste into the Supabase SQL Editor and Run. Idempotent.
--
-- A named, reusable practice sequence. The item list is stored as JSONB rather
-- than a child table: an item references a recording by id (not its signed URL,
-- which expires) or describes a tala, so the mix is rehydrated against freshly
-- signed URLs each time it's loaded. Backward-compatible: a new table only.

create table if not exists public.riyaz_mixes (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  name text not null,
  default_gap integer not null default 10
    check (default_gap >= 0 and default_gap <= 600),
  loop text not null default 'off'
    check (loop in ('off', 'all', 'one')),
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists riyaz_mixes_user_idx
  on public.riyaz_mixes (user_id, updated_at desc);

alter table public.riyaz_mixes enable row level security;

drop policy if exists "riyaz_mixes: read own" on public.riyaz_mixes;
create policy "riyaz_mixes: read own" on public.riyaz_mixes
  for select using ((auth.jwt() ->> 'sub') = user_id);

drop policy if exists "riyaz_mixes: insert own" on public.riyaz_mixes;
create policy "riyaz_mixes: insert own" on public.riyaz_mixes
  for insert with check ((auth.jwt() ->> 'sub') = user_id);

drop policy if exists "riyaz_mixes: update own" on public.riyaz_mixes;
create policy "riyaz_mixes: update own" on public.riyaz_mixes
  for update using ((auth.jwt() ->> 'sub') = user_id)
  with check ((auth.jwt() ->> 'sub') = user_id);

drop policy if exists "riyaz_mixes: delete own" on public.riyaz_mixes;
create policy "riyaz_mixes: delete own" on public.riyaz_mixes
  for delete using ((auth.jwt() ->> 'sub') = user_id);

drop trigger if exists riyaz_mixes_touch on public.riyaz_mixes;
create trigger riyaz_mixes_touch
  before update on public.riyaz_mixes
  for each row execute function public.touch_updated_at();
