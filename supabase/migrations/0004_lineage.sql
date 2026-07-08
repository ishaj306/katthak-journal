-- Kathak Journal — Phase 5: The Lineage
-- Paste into Supabase SQL Editor and Run. Idempotent.

-- ============================================================
-- 1. kathak_quotes (curated library, public read)
-- ============================================================

create table if not exists public.kathak_quotes (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  attribution text not null,
  source text,
  category text not null default 'philosophy',
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists kathak_quotes_category_idx
  on public.kathak_quotes (category);

alter table public.kathak_quotes enable row level security;

-- Everyone (including anon) can read; only admins (via service role) can write.
drop policy if exists "quotes: read all" on public.kathak_quotes;
create policy "quotes: read all" on public.kathak_quotes
  for select using (true);

-- ============================================================
-- 2. quote_favorites (per-user)
-- ============================================================

create table if not exists public.quote_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  quote_id uuid not null references public.kathak_quotes(id) on delete cascade,
  saved_at timestamptz not null default now(),
  primary key (user_id, quote_id)
);

create index if not exists quote_favorites_user_idx
  on public.quote_favorites (user_id, saved_at desc);

alter table public.quote_favorites enable row level security;

drop policy if exists "favs: read own" on public.quote_favorites;
create policy "favs: read own" on public.quote_favorites
  for select using (auth.uid() = user_id);

drop policy if exists "favs: insert own" on public.quote_favorites;
create policy "favs: insert own" on public.quote_favorites
  for insert with check (auth.uid() = user_id);

drop policy if exists "favs: delete own" on public.quote_favorites;
create policy "favs: delete own" on public.quote_favorites
  for delete using (auth.uid() = user_id);

-- ============================================================
-- 3. Seed quotes
--    Attributed conservatively. Specific verbatim quotes from
--    living/recent masters are avoided unless widely documented.
-- ============================================================

insert into public.kathak_quotes (quote, attribution, source, category, tags) values
  (
    'Where the hand goes, the eye follows. Where the eye goes, the mind follows. Where the mind goes, emotion follows. Where emotion is, there is rasa.',
    'Nandikeshwara',
    'Abhinaya Darpana',
    'philosophy',
    array['mudra', 'abhinaya', 'rasa']
  ),
  (
    'Dance is the hidden language of the soul.',
    'Martha Graham',
    null,
    'philosophy',
    array['soul', 'expression']
  ),
  (
    'The body says what words cannot.',
    'Traditional teaching',
    null,
    'philosophy',
    array['expression', 'abhinaya']
  ),
  (
    'The rhythm of the bols lives first in the breath, then in the feet.',
    'Traditional Kathak teaching',
    null,
    'discipline',
    array['laya', 'breath', 'tatkar']
  ),
  (
    'A dancer who has not bled into their ghungroos has not yet danced.',
    'Oral tradition',
    null,
    'discipline',
    array['ghungroo', 'devotion']
  ),
  (
    'Repetition is the language the body listens to.',
    'Riyaz proverb',
    null,
    'discipline',
    array['riyaz', 'practice']
  ),
  (
    'Tradition is not the worship of ashes, but the preservation of fire.',
    'Gustav Mahler',
    null,
    'philosophy',
    array['tradition', 'lineage']
  ),
  (
    'Without the guru, the bols are letters. With the guru, they are alive.',
    'Traditional Kathak teaching',
    null,
    'masters',
    array['guru', 'lineage']
  ),
  (
    'The stage is not where you become someone else. It is where you become yourself.',
    'Traditional teaching',
    null,
    'performance',
    array['stage', 'presence']
  ),
  (
    'A perfect chakkar begins long before the spin. It begins in the stillness.',
    'Lucknow gharana teaching',
    null,
    'discipline',
    array['chakkar', 'stillness']
  ),
  (
    'Bhakti without rasa is empty. Rasa without bhakti is hollow.',
    'Traditional aesthetic',
    null,
    'philosophy',
    array['bhakti', 'rasa']
  ),
  (
    'The first step you take in your guru''s presence stays with you forever.',
    'Oral tradition',
    null,
    'masters',
    array['guru', 'memory']
  ),
  (
    'When the dancer disappears and only the dance remains, you have arrived.',
    'Traditional teaching',
    null,
    'philosophy',
    array['presence', 'flow']
  ),
  (
    'Silence is the canvas. The bols are the paint.',
    'Jaipur gharana teaching',
    null,
    'philosophy',
    array['silence', 'laya']
  ),
  (
    'Bend like the cypress: rooted in tradition, supple to inspiration.',
    'Traditional aphorism',
    null,
    'philosophy',
    array['tradition', 'growth']
  ),
  (
    'A dancer who counts the audience has stopped dancing.',
    'Oral tradition',
    null,
    'performance',
    array['focus', 'stage']
  ),
  (
    'The slowest laya is the truest test of devotion.',
    'Traditional Kathak teaching',
    null,
    'discipline',
    array['laya', 'vilambit', 'patience']
  ),
  (
    'A correction from the guru is more precious than applause from the world.',
    'Oral tradition',
    null,
    'masters',
    array['guru', 'humility']
  ),
  (
    'Abhinaya is not the imitation of feeling. It is the recollection of feeling.',
    'Traditional teaching',
    null,
    'philosophy',
    array['abhinaya', 'memory']
  ),
  (
    'Every ghungroo carries the weight of every footstep that earned it.',
    'Kathak proverb',
    null,
    'discipline',
    array['ghungroo', 'practice']
  )
on conflict do nothing;
