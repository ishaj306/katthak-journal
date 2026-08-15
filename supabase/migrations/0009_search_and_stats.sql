-- Kathak Journal — search indexes + aggregate helpers
-- Paste into the Supabase SQL Editor and Run. Idempotent.
--
-- Two goals:
--   1. Make the "Seek" page's ILIKE '%term%' scans use an index instead of
--      reading every row of every table.
--   2. Let the Daily Folio ask Postgres for the practice-day count instead of
--      downloading every riyaz session row and counting them in Node.

-- ============================================================
-- 1. Trigram indexes for substring search
-- ============================================================

create extension if not exists pg_trgm;

create index if not exists compositions_title_trgm
  on public.compositions using gin (title gin_trgm_ops);
create index if not exists compositions_bols_trgm
  on public.compositions using gin (bols gin_trgm_ops);
create index if not exists compositions_meaning_trgm
  on public.compositions using gin (meaning gin_trgm_ops);

create index if not exists performances_event_name_trgm
  on public.performances using gin (event_name gin_trgm_ops);
create index if not exists performances_venue_trgm
  on public.performances using gin (venue gin_trgm_ops);
create index if not exists performances_reflection_learned_trgm
  on public.performances using gin (reflection_learned gin_trgm_ops);

create index if not exists guru_wisdom_quote_trgm
  on public.guru_wisdom using gin (quote gin_trgm_ops);
create index if not exists guru_wisdom_attribution_trgm
  on public.guru_wisdom using gin (attribution gin_trgm_ops);

create index if not exists journal_entries_title_trgm
  on public.journal_entries using gin (title gin_trgm_ops);
create index if not exists journal_entries_body_trgm
  on public.journal_entries using gin (body gin_trgm_ops);

-- ============================================================
-- 2. Practice-day count
-- ============================================================
-- security invoker (the default) means RLS still applies, so the caller only
-- ever counts their own sessions. Dates are bucketed in UTC to match what the
-- app previously computed in Node.

create or replace function public.riyaz_practice_day_count()
returns integer
language sql
stable
security invoker
set search_path = public
as $$
  select coalesce(
    count(distinct (started_at at time zone 'UTC')::date),
    0
  )::integer
  from public.riyaz_sessions;
$$;

-- ============================================================
-- 3. Harden the shared updated_at trigger
-- ============================================================
-- Same body as 0007/0008, but with an explicit search_path so the function
-- can't be hijacked by a mutable one (flagged by Supabase's linter).

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
