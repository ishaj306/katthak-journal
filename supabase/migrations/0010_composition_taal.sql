-- Kathak Journal — taal context for compositions
-- Paste into the Supabase SQL Editor and Run. Idempotent.
--
-- A composition belongs to a taal: a Paran is *in* Teentaal, and the dancer
-- thinks of their repertoire that way — "my Teentaal todas" — rather than as a
-- flat list. These columns let the archive be organised the way it is learned.
--
-- Backward-compatible: every column is nullable and added only if missing, so
-- existing compositions stay valid and simply show no taal until one is set.

alter table public.compositions
  add column if not exists tala_id text;

alter table public.compositions
  add column if not exists tala_name text;

alter table public.compositions
  add column if not exists matras integer
    check (matras is null or (matras > 0 and matras <= 128));

alter table public.compositions
  add column if not exists lay text
    check (lay is null or lay in ('vilambit', 'madhya', 'drut'));

comment on column public.compositions.tala_id is
  'Id of a built-in taal from lib/talas.ts (e.g. teentaal). Null when the taal is custom or unset.';
comment on column public.compositions.tala_name is
  'Free-text taal name for taals outside the built-in list (e.g. Pancham Sawari).';
comment on column public.compositions.matras is
  'Matra count. Defaults from the chosen taal but can be overridden.';

-- Grouping the archive by taal is the primary read pattern for /compositions.
create index if not exists compositions_user_tala_idx
  on public.compositions (user_id, tala_id);
