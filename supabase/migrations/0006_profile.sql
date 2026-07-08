-- Kathak Journal — Phase 6 support: richer profiles + onboarding
-- Paste into Supabase SQL Editor and Run. Idempotent.

alter table public.profiles
  add column if not exists primary_guru text,
  add column if not exists gharana gharana,
  add column if not exists city text,
  add column if not exists country text,
  add column if not exists onboarded boolean not null default false;

-- The auth.users trigger was removed with Clerk, so profiles are created
-- on demand by the app. Nothing else to do here.
