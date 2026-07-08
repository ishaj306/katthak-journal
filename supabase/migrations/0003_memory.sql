-- Kathak Journal — Phase 4: The Memory
-- Paste into Supabase SQL Editor and Run. Idempotent.

-- ============================================================
-- 1. ENUMS
-- ============================================================

do $$ begin
  create type performance_type as enum (
    'solo', 'group', 'festival', 'recital', 'competition', 'classroom', 'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type wisdom_category as enum (
    'correction', 'advice', 'philosophy', 'classroom', 'lesson', 'other'
  );
exception when duplicate_object then null; end $$;

-- ============================================================
-- 2. performances
-- ============================================================

create table if not exists public.performances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_name text not null,
  venue text,
  performed_on date,
  type performance_type not null default 'solo',
  costume_notes text,
  makeup_notes text,
  reflection_well text,
  reflection_mistakes text,
  reflection_learned text,
  reflection_improve text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists performances_user_date_idx
  on public.performances (user_id, performed_on desc);

alter table public.performances enable row level security;

drop policy if exists "performances: read own" on public.performances;
create policy "performances: read own" on public.performances
  for select using (auth.uid() = user_id);

drop policy if exists "performances: insert own" on public.performances;
create policy "performances: insert own" on public.performances
  for insert with check (auth.uid() = user_id);

drop policy if exists "performances: update own" on public.performances;
create policy "performances: update own" on public.performances
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "performances: delete own" on public.performances;
create policy "performances: delete own" on public.performances
  for delete using (auth.uid() = user_id);

drop trigger if exists performances_updated_at on public.performances;
create trigger performances_updated_at
  before update on public.performances
  for each row execute function public.set_updated_at();

-- ============================================================
-- 3. performance_media
-- ============================================================

create table if not exists public.performance_media (
  id uuid primary key default gen_random_uuid(),
  performance_id uuid not null references public.performances(id) on delete cascade,
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

create index if not exists performance_media_performance_idx
  on public.performance_media (performance_id, sort_order);

alter table public.performance_media enable row level security;

drop policy if exists "perf_media: read own" on public.performance_media;
create policy "perf_media: read own" on public.performance_media
  for select using (auth.uid() = user_id);

drop policy if exists "perf_media: insert own" on public.performance_media;
create policy "perf_media: insert own" on public.performance_media
  for insert with check (auth.uid() = user_id);

drop policy if exists "perf_media: update own" on public.performance_media;
create policy "perf_media: update own" on public.performance_media
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "perf_media: delete own" on public.performance_media;
create policy "perf_media: delete own" on public.performance_media
  for delete using (auth.uid() = user_id);

-- ============================================================
-- 4. guru_wisdom
-- ============================================================

create table if not exists public.guru_wisdom (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quote text not null,
  attribution text,
  category wisdom_category not null default 'advice',
  tags text[] not null default '{}',
  captured_at date,
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists guru_wisdom_user_pinned_idx
  on public.guru_wisdom (user_id, pinned desc, created_at desc);
create index if not exists guru_wisdom_user_category_idx
  on public.guru_wisdom (user_id, category);

alter table public.guru_wisdom enable row level security;

drop policy if exists "wisdom: read own" on public.guru_wisdom;
create policy "wisdom: read own" on public.guru_wisdom
  for select using (auth.uid() = user_id);

drop policy if exists "wisdom: insert own" on public.guru_wisdom;
create policy "wisdom: insert own" on public.guru_wisdom
  for insert with check (auth.uid() = user_id);

drop policy if exists "wisdom: update own" on public.guru_wisdom;
create policy "wisdom: update own" on public.guru_wisdom
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "wisdom: delete own" on public.guru_wisdom;
create policy "wisdom: delete own" on public.guru_wisdom
  for delete using (auth.uid() = user_id);

drop trigger if exists guru_wisdom_updated_at on public.guru_wisdom;
create trigger guru_wisdom_updated_at
  before update on public.guru_wisdom
  for each row execute function public.set_updated_at();

-- ============================================================
-- 5. journal_entries
-- ============================================================

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null default current_date,
  title text,
  body text,
  is_private boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists journal_entries_user_date_idx
  on public.journal_entries (user_id, entry_date desc, created_at desc);

alter table public.journal_entries enable row level security;

drop policy if exists "journal: read own" on public.journal_entries;
create policy "journal: read own" on public.journal_entries
  for select using (auth.uid() = user_id);

drop policy if exists "journal: insert own" on public.journal_entries;
create policy "journal: insert own" on public.journal_entries
  for insert with check (auth.uid() = user_id);

drop policy if exists "journal: update own" on public.journal_entries;
create policy "journal: update own" on public.journal_entries
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "journal: delete own" on public.journal_entries;
create policy "journal: delete own" on public.journal_entries
  for delete using (auth.uid() = user_id);

drop trigger if exists journal_entries_updated_at on public.journal_entries;
create trigger journal_entries_updated_at
  before update on public.journal_entries
  for each row execute function public.set_updated_at();

-- ============================================================
-- 6. Storage bucket: performance-media
-- ============================================================

insert into storage.buckets (id, name, public)
values ('performance-media', 'performance-media', false)
on conflict (id) do nothing;

drop policy if exists "performance-media: read own" on storage.objects;
create policy "performance-media: read own" on storage.objects
  for select using (
    bucket_id = 'performance-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "performance-media: insert own" on storage.objects;
create policy "performance-media: insert own" on storage.objects
  for insert with check (
    bucket_id = 'performance-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "performance-media: update own" on storage.objects;
create policy "performance-media: update own" on storage.objects
  for update using (
    bucket_id = 'performance-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "performance-media: delete own" on storage.objects;
create policy "performance-media: delete own" on storage.objects
  for delete using (
    bucket_id = 'performance-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
