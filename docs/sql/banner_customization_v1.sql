-- Banner customization schema.
-- Adds banner presets table, profiles columns, RLS policies, and backfill.

-- ---------------------------------------------------------------------------
-- 1. profiles additions
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column if not exists active_banner_slot smallint not null default 1,
  add column if not exists peak_rank_tier text null;

alter table public.profiles
  drop constraint if exists profiles_active_banner_slot_check;
alter table public.profiles
  add constraint profiles_active_banner_slot_check
    check (active_banner_slot between 1 and 3);

-- Backfill peak_rank_tier from current rank_tier for existing users.
update public.profiles
  set peak_rank_tier = rank_tier
  where peak_rank_tier is null
    and rank_tier is not null;

-- ---------------------------------------------------------------------------
-- 2. banner_presets table
-- ---------------------------------------------------------------------------

create table if not exists public.banner_presets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  slot smallint not null,
  name varchar(24) not null,
  background_id text not null,
  border_id text not null,
  title_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint banner_presets_slot_check check (slot between 1 and 3),
  constraint banner_presets_name_length check (char_length(name) between 1 and 24),
  constraint banner_presets_name_charset check (name ~ '^[A-Za-z0-9 _-]+$'),
  constraint banner_presets_user_slot_unique unique (user_id, slot)
);

-- Index for fetching a user's presets.
create index if not exists idx_banner_presets_user_id
  on public.banner_presets (user_id);

-- Auto-update updated_at on row change.
create extension if not exists moddatetime schema extensions;

drop trigger if exists banner_presets_updated_at on public.banner_presets;
create trigger banner_presets_updated_at
  before update on public.banner_presets
  for each row
  execute function extensions.moddatetime(updated_at);

-- ---------------------------------------------------------------------------
-- 3. RLS policies
-- ---------------------------------------------------------------------------

alter table public.banner_presets enable row level security;

-- Owner can read all own presets.
drop policy if exists "Users can view own banner presets" on public.banner_presets;
create policy "Users can view own banner presets"
  on public.banner_presets
  for select
  using ((select auth.uid()) = user_id);

-- Any authenticated user can read another user's active preset.
drop policy if exists "Anyone can view active banner preset" on public.banner_presets;
create policy "Anyone can view active banner preset"
  on public.banner_presets
  for select
  using (
    slot = (
      select active_banner_slot
      from public.profiles
      where id = banner_presets.user_id
    )
  );

-- Owner can insert own presets.
drop policy if exists "Users can insert own banner presets" on public.banner_presets;
create policy "Users can insert own banner presets"
  on public.banner_presets
  for insert
  with check ((select auth.uid()) = user_id);

-- Owner can update own presets.
drop policy if exists "Users can update own banner presets" on public.banner_presets;
create policy "Users can update own banner presets"
  on public.banner_presets
  for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- 4. Update calculate_elo_update RPC: add Tachyon tier + peak_rank_tier tracking
-- ---------------------------------------------------------------------------
-- See migration: update_elo_rpc_peak_rank_and_tachyon
-- Changes:
--   - Added Tachyon tier at Elo >= 2100
--   - Reads and compares peak_rank_tier, updates if new rank is higher
--   - Returns peak_rank_tier in result JSON
