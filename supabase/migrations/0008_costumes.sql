-- Kathak Journal — Costume & wardrobe log
-- The poshaks, jewellery, and accessories a dancer gathers over a lifetime,
-- and the stages each has seen. Paste into the Supabase SQL Editor and Run.
-- Idempotent.

create table if not exists public.costumes (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  name text not null,
  kind text not null default 'costume',
  color text,
  fabric text,
  occasion text,
  worn_on date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists costumes_user_created_idx
  on public.costumes (user_id, created_at desc);

alter table public.costumes enable row level security;

drop policy if exists "costumes: read own" on public.costumes;
create policy "costumes: read own" on public.costumes
  for select using ((auth.jwt() ->> 'sub') = user_id);

drop policy if exists "costumes: insert own" on public.costumes;
create policy "costumes: insert own" on public.costumes
  for insert with check ((auth.jwt() ->> 'sub') = user_id);

drop policy if exists "costumes: update own" on public.costumes;
create policy "costumes: update own" on public.costumes
  for update using ((auth.jwt() ->> 'sub') = user_id)
  with check ((auth.jwt() ->> 'sub') = user_id);

drop policy if exists "costumes: delete own" on public.costumes;
create policy "costumes: delete own" on public.costumes
  for delete using ((auth.jwt() ->> 'sub') = user_id);

-- reuse the shared updated_at trigger (created in 0007); define if missing
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists costumes_touch on public.costumes;
create trigger costumes_touch
  before update on public.costumes
  for each row execute function public.touch_updated_at();
