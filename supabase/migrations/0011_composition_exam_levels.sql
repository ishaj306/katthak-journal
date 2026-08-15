-- Kathak Journal — exam-level context for compositions
-- Paste into the Supabase SQL Editor and Run. Idempotent.
--
-- Exam level is not a permanent category: a Paran learned for Level 2 may be
-- revisited and performed again at Level 3. So instead of one column on the
-- composition, each exam relationship is its own row — preserving the dancer's
-- actual learning history rather than flattening it to the latest level.
--
-- Backward-compatible: a new table only. No existing table is touched, so all
-- current compositions stay exactly as they are.

create table if not exists public.composition_exam_levels (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  composition_id uuid not null
    references public.compositions(id) on delete cascade,
  -- Free text so any board's syllabus works: "Level 2", "Visharad", "Alankar".
  level text not null,
  -- How the composition related to that level.
  relation text not null default 'learned_for'
    check (relation in ('learned_for', 'revisited', 'performed_for')),
  noted_on date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists composition_exam_levels_composition_idx
  on public.composition_exam_levels (composition_id, created_at);
create index if not exists composition_exam_levels_user_idx
  on public.composition_exam_levels (user_id);

alter table public.composition_exam_levels enable row level security;

drop policy if exists "exam_levels: read own" on public.composition_exam_levels;
create policy "exam_levels: read own" on public.composition_exam_levels
  for select using ((auth.jwt() ->> 'sub') = user_id);

drop policy if exists "exam_levels: insert own" on public.composition_exam_levels;
create policy "exam_levels: insert own" on public.composition_exam_levels
  for insert with check ((auth.jwt() ->> 'sub') = user_id);

drop policy if exists "exam_levels: update own" on public.composition_exam_levels;
create policy "exam_levels: update own" on public.composition_exam_levels
  for update using ((auth.jwt() ->> 'sub') = user_id)
  with check ((auth.jwt() ->> 'sub') = user_id);

drop policy if exists "exam_levels: delete own" on public.composition_exam_levels;
create policy "exam_levels: delete own" on public.composition_exam_levels
  for delete using ((auth.jwt() ->> 'sub') = user_id);

-- reuse the shared updated_at trigger (defined in 0007/0008/0009)
drop trigger if exists composition_exam_levels_touch
  on public.composition_exam_levels;
create trigger composition_exam_levels_touch
  before update on public.composition_exam_levels
  for each row execute function public.touch_updated_at();
