-- Kathak Journal — performance preparation + costume context
-- Paste into the Supabase SQL Editor and Run. Idempotent.
--
-- Two lightweight expansions of existing entities (no new pages):
--   1. A performance begins before the night: preparation notes, rehearsal
--      notes, the compositions being performed, and which costume is planned.
--   2. A costume belongs to a context of dance life (daily class, riyaz,
--      rehearsal, exam, performance), not only formal shows.
--
-- All additive: new nullable columns / new tables, existing rows untouched.
-- performance_media.stage defaults to 'performance', so every current recording
-- is treated as a performance-night recording exactly as before.

-- ---- 1. Costume context ------------------------------------------------
alter table public.costumes
  add column if not exists context text
    check (
      context is null
      or context in (
        'daily_class', 'riyaz', 'rehearsal', 'exam', 'performance', 'other'
      )
    );

comment on column public.costumes.context is
  'Where in dance life this outfit is worn — daily_class | riyaz | rehearsal | exam | performance | other.';

-- ---- 2. Performance preparation ----------------------------------------
alter table public.performances
  add column if not exists prep_notes text;
alter table public.performances
  add column if not exists rehearsal_notes text;
alter table public.performances
  add column if not exists costume_id uuid
    references public.costumes(id) on delete set null;

-- Which stage of the journey a recording belongs to.
alter table public.performance_media
  add column if not exists stage text not null default 'performance'
    check (stage in ('preparation', 'rehearsal', 'performance'));

-- The compositions being performed — reusing the composition records rather
-- than retyping their names.
create table if not exists public.performance_compositions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  performance_id uuid not null
    references public.performances(id) on delete cascade,
  composition_id uuid not null
    references public.compositions(id) on delete cascade,
  position integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  unique (performance_id, composition_id)
);

create index if not exists performance_compositions_perf_idx
  on public.performance_compositions (performance_id, position);
create index if not exists performance_compositions_user_idx
  on public.performance_compositions (user_id);

alter table public.performance_compositions enable row level security;

drop policy if exists "perf_comp: read own" on public.performance_compositions;
create policy "perf_comp: read own" on public.performance_compositions
  for select using ((auth.jwt() ->> 'sub') = user_id);

drop policy if exists "perf_comp: insert own" on public.performance_compositions;
create policy "perf_comp: insert own" on public.performance_compositions
  for insert with check ((auth.jwt() ->> 'sub') = user_id);

drop policy if exists "perf_comp: update own" on public.performance_compositions;
create policy "perf_comp: update own" on public.performance_compositions
  for update using ((auth.jwt() ->> 'sub') = user_id)
  with check ((auth.jwt() ->> 'sub') = user_id);

drop policy if exists "perf_comp: delete own" on public.performance_compositions;
create policy "perf_comp: delete own" on public.performance_compositions
  for delete using ((auth.jwt() ->> 'sub') = user_id);
