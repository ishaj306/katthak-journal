-- Kathak Journal — Phase Clerk
-- Switches auth from Supabase Auth to Clerk via Third-Party Auth.
-- After running this, configure Clerk in Supabase: Dashboard → Authentication
-- → Third-Party Auth → Add provider → Clerk → paste your Clerk domain.
--
-- Idempotent. Safe to re-run after partial failure. Paste into the SQL
-- Editor and Run.
--
-- NOTE ON ORDER: Postgres refuses to alter a column type while any RLS
-- policy references that column. So we must:
--   1. Drop trigger + function
--   2. Drop ALL existing RLS policies
--   3. Drop FK constraints to auth.users
--   4. Alter the columns to text
--   5. Recreate RLS policies against the new (auth.jwt() ->> 'sub')

-- ============================================================
-- 1. Drop the trigger that mirrored auth.users into profiles.
--    With Clerk we create profiles on demand from the app.
-- ============================================================

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- ============================================================
-- 2. Drop ALL existing RLS policies that reference id / user_id
--    (both old Supabase-Auth versions and any partial Clerk-era rewrites)
-- ============================================================

-- profiles
drop policy if exists "profiles: read own"   on public.profiles;
drop policy if exists "profiles: update own" on public.profiles;
drop policy if exists "profiles: insert own" on public.profiles;

-- compositions
drop policy if exists "compositions: read own"   on public.compositions;
drop policy if exists "compositions: insert own" on public.compositions;
drop policy if exists "compositions: update own" on public.compositions;
drop policy if exists "compositions: delete own" on public.compositions;

-- composition_media
drop policy if exists "composition_media: read own"   on public.composition_media;
drop policy if exists "composition_media: insert own" on public.composition_media;
drop policy if exists "composition_media: update own" on public.composition_media;
drop policy if exists "composition_media: delete own" on public.composition_media;

-- riyaz_sessions
drop policy if exists "riyaz: read own"   on public.riyaz_sessions;
drop policy if exists "riyaz: insert own" on public.riyaz_sessions;
drop policy if exists "riyaz: update own" on public.riyaz_sessions;
drop policy if exists "riyaz: delete own" on public.riyaz_sessions;

-- performances
drop policy if exists "performances: read own"   on public.performances;
drop policy if exists "performances: insert own" on public.performances;
drop policy if exists "performances: update own" on public.performances;
drop policy if exists "performances: delete own" on public.performances;

-- performance_media
drop policy if exists "perf_media: read own"   on public.performance_media;
drop policy if exists "perf_media: insert own" on public.performance_media;
drop policy if exists "perf_media: update own" on public.performance_media;
drop policy if exists "perf_media: delete own" on public.performance_media;

-- guru_wisdom
drop policy if exists "wisdom: read own"   on public.guru_wisdom;
drop policy if exists "wisdom: insert own" on public.guru_wisdom;
drop policy if exists "wisdom: update own" on public.guru_wisdom;
drop policy if exists "wisdom: delete own" on public.guru_wisdom;

-- journal_entries
drop policy if exists "journal: read own"   on public.journal_entries;
drop policy if exists "journal: insert own" on public.journal_entries;
drop policy if exists "journal: update own" on public.journal_entries;
drop policy if exists "journal: delete own" on public.journal_entries;

-- quote_favorites
drop policy if exists "favs: read own"   on public.quote_favorites;
drop policy if exists "favs: insert own" on public.quote_favorites;
drop policy if exists "favs: delete own" on public.quote_favorites;

-- storage.objects (composition-media)
drop policy if exists "composition-media: read own"   on storage.objects;
drop policy if exists "composition-media: insert own" on storage.objects;
drop policy if exists "composition-media: update own" on storage.objects;
drop policy if exists "composition-media: delete own" on storage.objects;

-- storage.objects (performance-media)
drop policy if exists "performance-media: read own"   on storage.objects;
drop policy if exists "performance-media: insert own" on storage.objects;
drop policy if exists "performance-media: update own" on storage.objects;
drop policy if exists "performance-media: delete own" on storage.objects;

-- ============================================================
-- 3. Drop FK constraints to auth.users so user_id can become text
-- ============================================================

alter table public.profiles           drop constraint if exists profiles_id_fkey;
alter table public.compositions       drop constraint if exists compositions_user_id_fkey;
alter table public.composition_media  drop constraint if exists composition_media_user_id_fkey;
alter table public.riyaz_sessions     drop constraint if exists riyaz_sessions_user_id_fkey;
alter table public.performances       drop constraint if exists performances_user_id_fkey;
alter table public.performance_media  drop constraint if exists performance_media_user_id_fkey;
alter table public.guru_wisdom        drop constraint if exists guru_wisdom_user_id_fkey;
alter table public.journal_entries    drop constraint if exists journal_entries_user_id_fkey;
alter table public.quote_favorites    drop constraint if exists quote_favorites_user_id_fkey;

-- ============================================================
-- 4. Change user identifier columns from uuid to text
--    (Clerk user ids look like "user_2abcDEF…", not UUIDs)
-- ============================================================

alter table public.profiles           alter column id      type text using id::text;
alter table public.compositions       alter column user_id type text using user_id::text;
alter table public.composition_media  alter column user_id type text using user_id::text;
alter table public.riyaz_sessions     alter column user_id type text using user_id::text;
alter table public.performances       alter column user_id type text using user_id::text;
alter table public.performance_media  alter column user_id type text using user_id::text;
alter table public.guru_wisdom        alter column user_id type text using user_id::text;
alter table public.journal_entries    alter column user_id type text using user_id::text;
alter table public.quote_favorites    alter column user_id type text using user_id::text;

-- ============================================================
-- 5. Recreate RLS policies against the Clerk JWT subject claim.
--    auth.jwt() returns the incoming JWT's payload as JSON.
--    Clerk puts the user id in the 'sub' claim.
-- ============================================================

-- profiles
create policy "profiles: read own" on public.profiles
  for select using ((auth.jwt() ->> 'sub') = id);
create policy "profiles: update own" on public.profiles
  for update using ((auth.jwt() ->> 'sub') = id)
  with check ((auth.jwt() ->> 'sub') = id);
create policy "profiles: insert own" on public.profiles
  for insert with check ((auth.jwt() ->> 'sub') = id);

-- compositions
create policy "compositions: read own" on public.compositions
  for select using ((auth.jwt() ->> 'sub') = user_id);
create policy "compositions: insert own" on public.compositions
  for insert with check ((auth.jwt() ->> 'sub') = user_id);
create policy "compositions: update own" on public.compositions
  for update using ((auth.jwt() ->> 'sub') = user_id)
  with check ((auth.jwt() ->> 'sub') = user_id);
create policy "compositions: delete own" on public.compositions
  for delete using ((auth.jwt() ->> 'sub') = user_id);

-- composition_media
create policy "composition_media: read own" on public.composition_media
  for select using ((auth.jwt() ->> 'sub') = user_id);
create policy "composition_media: insert own" on public.composition_media
  for insert with check ((auth.jwt() ->> 'sub') = user_id);
create policy "composition_media: update own" on public.composition_media
  for update using ((auth.jwt() ->> 'sub') = user_id)
  with check ((auth.jwt() ->> 'sub') = user_id);
create policy "composition_media: delete own" on public.composition_media
  for delete using ((auth.jwt() ->> 'sub') = user_id);

-- riyaz_sessions
create policy "riyaz: read own" on public.riyaz_sessions
  for select using ((auth.jwt() ->> 'sub') = user_id);
create policy "riyaz: insert own" on public.riyaz_sessions
  for insert with check ((auth.jwt() ->> 'sub') = user_id);
create policy "riyaz: update own" on public.riyaz_sessions
  for update using ((auth.jwt() ->> 'sub') = user_id)
  with check ((auth.jwt() ->> 'sub') = user_id);
create policy "riyaz: delete own" on public.riyaz_sessions
  for delete using ((auth.jwt() ->> 'sub') = user_id);

-- performances
create policy "performances: read own" on public.performances
  for select using ((auth.jwt() ->> 'sub') = user_id);
create policy "performances: insert own" on public.performances
  for insert with check ((auth.jwt() ->> 'sub') = user_id);
create policy "performances: update own" on public.performances
  for update using ((auth.jwt() ->> 'sub') = user_id)
  with check ((auth.jwt() ->> 'sub') = user_id);
create policy "performances: delete own" on public.performances
  for delete using ((auth.jwt() ->> 'sub') = user_id);

-- performance_media
create policy "perf_media: read own" on public.performance_media
  for select using ((auth.jwt() ->> 'sub') = user_id);
create policy "perf_media: insert own" on public.performance_media
  for insert with check ((auth.jwt() ->> 'sub') = user_id);
create policy "perf_media: update own" on public.performance_media
  for update using ((auth.jwt() ->> 'sub') = user_id)
  with check ((auth.jwt() ->> 'sub') = user_id);
create policy "perf_media: delete own" on public.performance_media
  for delete using ((auth.jwt() ->> 'sub') = user_id);

-- guru_wisdom
create policy "wisdom: read own" on public.guru_wisdom
  for select using ((auth.jwt() ->> 'sub') = user_id);
create policy "wisdom: insert own" on public.guru_wisdom
  for insert with check ((auth.jwt() ->> 'sub') = user_id);
create policy "wisdom: update own" on public.guru_wisdom
  for update using ((auth.jwt() ->> 'sub') = user_id)
  with check ((auth.jwt() ->> 'sub') = user_id);
create policy "wisdom: delete own" on public.guru_wisdom
  for delete using ((auth.jwt() ->> 'sub') = user_id);

-- journal_entries
create policy "journal: read own" on public.journal_entries
  for select using ((auth.jwt() ->> 'sub') = user_id);
create policy "journal: insert own" on public.journal_entries
  for insert with check ((auth.jwt() ->> 'sub') = user_id);
create policy "journal: update own" on public.journal_entries
  for update using ((auth.jwt() ->> 'sub') = user_id)
  with check ((auth.jwt() ->> 'sub') = user_id);
create policy "journal: delete own" on public.journal_entries
  for delete using ((auth.jwt() ->> 'sub') = user_id);

-- quote_favorites
create policy "favs: read own" on public.quote_favorites
  for select using ((auth.jwt() ->> 'sub') = user_id);
create policy "favs: insert own" on public.quote_favorites
  for insert with check ((auth.jwt() ->> 'sub') = user_id);
create policy "favs: delete own" on public.quote_favorites
  for delete using ((auth.jwt() ->> 'sub') = user_id);

-- ============================================================
-- 6. Storage policies — same shape for both media buckets
-- ============================================================

-- composition-media
create policy "composition-media: read own" on storage.objects
  for select using (
    bucket_id = 'composition-media'
    and (auth.jwt() ->> 'sub') = (storage.foldername(name))[1]
  );
create policy "composition-media: insert own" on storage.objects
  for insert with check (
    bucket_id = 'composition-media'
    and (auth.jwt() ->> 'sub') = (storage.foldername(name))[1]
  );
create policy "composition-media: update own" on storage.objects
  for update using (
    bucket_id = 'composition-media'
    and (auth.jwt() ->> 'sub') = (storage.foldername(name))[1]
  );
create policy "composition-media: delete own" on storage.objects
  for delete using (
    bucket_id = 'composition-media'
    and (auth.jwt() ->> 'sub') = (storage.foldername(name))[1]
  );

-- performance-media
create policy "performance-media: read own" on storage.objects
  for select using (
    bucket_id = 'performance-media'
    and (auth.jwt() ->> 'sub') = (storage.foldername(name))[1]
  );
create policy "performance-media: insert own" on storage.objects
  for insert with check (
    bucket_id = 'performance-media'
    and (auth.jwt() ->> 'sub') = (storage.foldername(name))[1]
  );
create policy "performance-media: update own" on storage.objects
  for update using (
    bucket_id = 'performance-media'
    and (auth.jwt() ->> 'sub') = (storage.foldername(name))[1]
  );
create policy "performance-media: delete own" on storage.objects
  for delete using (
    bucket_id = 'performance-media'
    and (auth.jwt() ->> 'sub') = (storage.foldername(name))[1]
  );
