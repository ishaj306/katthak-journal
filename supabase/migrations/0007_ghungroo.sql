-- Kathak Journal — Ghungroo Diary
-- The dancer's relationship with their bells over the years: acquiring them,
-- restringing, adding weight as they advance, the first time they were worn.
-- Paste into the Supabase SQL Editor and Run. Idempotent.

create table if not exists public.ghungroo_entries (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  entry_date date not null default current_date,
  kind text not null default 'note',
  title text,
  bell_count integer check (bell_count is null or bell_count >= 0),
  string_material text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ghungroo_entries_user_date_idx
  on public.ghungroo_entries (user_id, entry_date desc);

alter table public.ghungroo_entries enable row level security;

drop policy if exists "ghungroo: read own" on public.ghungroo_entries;
create policy "ghungroo: read own" on public.ghungroo_entries
  for select using ((auth.jwt() ->> 'sub') = user_id);

drop policy if exists "ghungroo: insert own" on public.ghungroo_entries;
create policy "ghungroo: insert own" on public.ghungroo_entries
  for insert with check ((auth.jwt() ->> 'sub') = user_id);

drop policy if exists "ghungroo: update own" on public.ghungroo_entries;
create policy "ghungroo: update own" on public.ghungroo_entries
  for update using ((auth.jwt() ->> 'sub') = user_id)
  with check ((auth.jwt() ->> 'sub') = user_id);

drop policy if exists "ghungroo: delete own" on public.ghungroo_entries;
create policy "ghungroo: delete own" on public.ghungroo_entries
  for delete using ((auth.jwt() ->> 'sub') = user_id);

-- keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists ghungroo_entries_touch on public.ghungroo_entries;
create trigger ghungroo_entries_touch
  before update on public.ghungroo_entries
  for each row execute function public.touch_updated_at();
