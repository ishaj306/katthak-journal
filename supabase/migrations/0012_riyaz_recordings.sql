-- Kathak Journal — recordings captured during a Riyaaz session
-- Paste into the Supabase SQL Editor and Run. Idempotent.
--
-- A dancer recording themselves mid-practice may be playing over a tala with no
-- single composition attached, so these live in their own table with an
-- OPTIONAL composition link — practice becomes documentation without forcing a
-- category. Audio bytes reuse the existing composition-media bucket (its policy
-- already scopes objects to the user's own folder), so no new bucket is needed.
--
-- Backward-compatible: a new table only.

create table if not exists public.riyaz_recordings (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  -- Optional: set when a composition was the current item being practised.
  composition_id uuid references public.compositions(id) on delete set null,
  storage_path text not null,
  title text not null,
  mime_type text,
  file_size integer,
  duration_sec integer,
  notes text,
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists riyaz_recordings_user_idx
  on public.riyaz_recordings (user_id, recorded_at desc);
create index if not exists riyaz_recordings_composition_idx
  on public.riyaz_recordings (composition_id);

alter table public.riyaz_recordings enable row level security;

drop policy if exists "riyaz_rec: read own" on public.riyaz_recordings;
create policy "riyaz_rec: read own" on public.riyaz_recordings
  for select using ((auth.jwt() ->> 'sub') = user_id);

drop policy if exists "riyaz_rec: insert own" on public.riyaz_recordings;
create policy "riyaz_rec: insert own" on public.riyaz_recordings
  for insert with check ((auth.jwt() ->> 'sub') = user_id);

drop policy if exists "riyaz_rec: update own" on public.riyaz_recordings;
create policy "riyaz_rec: update own" on public.riyaz_recordings
  for update using ((auth.jwt() ->> 'sub') = user_id)
  with check ((auth.jwt() ->> 'sub') = user_id);

drop policy if exists "riyaz_rec: delete own" on public.riyaz_recordings;
create policy "riyaz_rec: delete own" on public.riyaz_recordings
  for delete using ((auth.jwt() ->> 'sub') = user_id);

drop trigger if exists riyaz_recordings_touch on public.riyaz_recordings;
create trigger riyaz_recordings_touch
  before update on public.riyaz_recordings
  for each row execute function public.touch_updated_at();
