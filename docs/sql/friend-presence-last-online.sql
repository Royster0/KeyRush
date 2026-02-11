-- Last Online feature schema for friends page.
-- Stores per-user heartbeat timestamps and restricts visibility to mutual friends.

create table if not exists public.friend_presence (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  last_active_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.friend_presence enable row level security;

drop policy if exists "Users can view their own presence" on public.friend_presence;
create policy "Users can view their own presence"
  on public.friend_presence
  for select
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can view mutual friends presence" on public.friend_presence;
create policy "Users can view mutual friends presence"
  on public.friend_presence
  for select
  using (
    (select auth.uid()) is not null
    and exists (
      select 1
      from public.friendships f1
      where f1.user_id = (select auth.uid())
        and f1.friend_id = friend_presence.user_id
    )
    and exists (
      select 1
      from public.friendships f2
      where f2.user_id = friend_presence.user_id
        and f2.friend_id = (select auth.uid())
    )
  );

drop policy if exists "Users can insert their own presence" on public.friend_presence;
create policy "Users can insert their own presence"
  on public.friend_presence
  for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own presence" on public.friend_presence;
create policy "Users can update their own presence"
  on public.friend_presence
  for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Backfill existing users so offline values are available immediately.
insert into public.friend_presence (user_id, last_active_at, created_at, updated_at)
select p.id, coalesce(p.updated_at, p.created_at, now()), now(), now()
from public.profiles p
on conflict (user_id) do nothing;
