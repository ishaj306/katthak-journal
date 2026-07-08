-- Kathak Journal — Phase 1 schema
-- Paste this entire file into Supabase: SQL Editor → New query → Run.
-- It is idempotent; safe to re-run.

-- ============================================================
-- 1. ENUMS
-- ============================================================

do $$ begin
  create type composition_type as enum (
    'vandana', 'amad', 'tukda', 'toda', 'paran',
    'chakradar', 'tihai', 'gat_nikas', 'gat_bhav',
    'kavitt', 'thaat', 'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type gharana as enum (
    'lucknow', 'jaipur', 'banaras', 'raigarh', 'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type media_kind as enum ('audio', 'video', 'image', 'pdf');
exception when duplicate_object then null; end $$;

-- ============================================================
-- 2. updated_at trigger helper
-- ============================================================

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- 3. profiles (1:1 with auth.users)
-- ============================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  dance_start_date date,
  bio text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles: insert own" on public.profiles;
create policy "profiles: insert own" on public.profiles
  for insert with check (auth.uid() = id);

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 4. compositions
-- ============================================================

create table if not exists public.compositions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  type composition_type not null default 'other',
  gharana gharana,
  guru_name text,
  date_learned date,
  difficulty smallint check (difficulty between 1 and 5),
  bols text,
  meaning text,
  instructions text,
  corrections text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists compositions_user_id_idx
  on public.compositions (user_id, created_at desc);
create index if not exists compositions_type_idx
  on public.compositions (user_id, type);

alter table public.compositions enable row level security;

drop policy if exists "compositions: read own" on public.compositions;
create policy "compositions: read own" on public.compositions
  for select using (auth.uid() = user_id);

drop policy if exists "compositions: insert own" on public.compositions;
create policy "compositions: insert own" on public.compositions
  for insert with check (auth.uid() = user_id);

drop policy if exists "compositions: update own" on public.compositions;
create policy "compositions: update own" on public.compositions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "compositions: delete own" on public.compositions;
create policy "compositions: delete own" on public.compositions
  for delete using (auth.uid() = user_id);

drop trigger if exists compositions_updated_at on public.compositions;
create trigger compositions_updated_at
  before update on public.compositions
  for each row execute function public.set_updated_at();

-- ============================================================
-- 5. composition_media
-- ============================================================

create table if not exists public.composition_media (
  id uuid primary key default gen_random_uuid(),
  composition_id uuid not null references public.compositions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind media_kind not null,
  storage_path text not null,
  title text,
  mime_type text,
  file_size bigint,
  duration_sec integer,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists composition_media_composition_idx
  on public.composition_media (composition_id, sort_order);

alter table public.composition_media enable row level security;

drop policy if exists "composition_media: read own" on public.composition_media;
create policy "composition_media: read own" on public.composition_media
  for select using (auth.uid() = user_id);

drop policy if exists "composition_media: insert own" on public.composition_media;
create policy "composition_media: insert own" on public.composition_media
  for insert with check (auth.uid() = user_id);

drop policy if exists "composition_media: update own" on public.composition_media;
create policy "composition_media: update own" on public.composition_media
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "composition_media: delete own" on public.composition_media;
create policy "composition_media: delete own" on public.composition_media
  for delete using (auth.uid() = user_id);

-- ============================================================
-- 6. Storage bucket: composition-media
-- ============================================================

insert into storage.buckets (id, name, public)
values ('composition-media', 'composition-media', false)
on conflict (id) do nothing;

-- Path convention: {user_id}/{composition_id}/{filename}
-- The first folder segment must equal the user's UUID.

drop policy if exists "composition-media: read own" on storage.objects;
create policy "composition-media: read own" on storage.objects
  for select using (
    bucket_id = 'composition-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "composition-media: insert own" on storage.objects;
create policy "composition-media: insert own" on storage.objects
  for insert with check (
    bucket_id = 'composition-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "composition-media: update own" on storage.objects;
create policy "composition-media: update own" on storage.objects
  for update using (
    bucket_id = 'composition-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "composition-media: delete own" on storage.objects;
create policy "composition-media: delete own" on storage.objects
  for delete using (
    bucket_id = 'composition-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
