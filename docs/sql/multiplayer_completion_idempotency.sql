-- Multiplayer completion idempotency guard
--
-- Apply this in Supabase before relying on /api/multiplayer/complete idempotency.
-- It adds:
-- 1) public.multiplayer_match_completions table
-- 2) acquire_multiplayer_completion RPC (single-writer lock with stale takeover)
-- 3) complete_multiplayer_completion RPC (marks completion as finalized)

create table if not exists public.multiplayer_match_completions (
  match_id uuid not null references public.matches(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  xp_awarded integer not null default 0 check (xp_awarded >= 0),
  primary key (match_id, user_id)
);

create index if not exists idx_multiplayer_match_completions_user_id
on public.multiplayer_match_completions (user_id);

alter table public.multiplayer_match_completions enable row level security;

drop policy if exists "Players can view their completion rows"
on public.multiplayer_match_completions;
create policy "Players can view their completion rows"
on public.multiplayer_match_completions
for select
using ((select auth.uid()) = user_id);

drop policy if exists "Players can insert their completion rows"
on public.multiplayer_match_completions;
create policy "Players can insert their completion rows"
on public.multiplayer_match_completions
for insert
with check ((select auth.uid()) = user_id);

drop policy if exists "Players can update their completion rows"
on public.multiplayer_match_completions;
create policy "Players can update their completion rows"
on public.multiplayer_match_completions
for update
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create or replace function public.acquire_multiplayer_completion(
  p_match_id uuid,
  p_user_id uuid,
  p_stale_after_seconds integer default 120
)
returns table (
  acquired boolean,
  status text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  insert into public.multiplayer_match_completions (match_id, user_id, status, started_at)
  values (p_match_id, p_user_id, 'pending', now())
  on conflict (match_id, user_id) do nothing;

  if found then
    return query select true, 'pending'::text;
    return;
  end if;

  select c.status
  into v_status
  from public.multiplayer_match_completions c
  where c.match_id = p_match_id and c.user_id = p_user_id;

  if v_status = 'completed' then
    return query select false, 'completed'::text;
    return;
  end if;

  update public.multiplayer_match_completions c
  set started_at = now()
  where c.match_id = p_match_id
    and c.user_id = p_user_id
    and c.status = 'pending'
    and c.started_at < now() - make_interval(secs => greatest(1, p_stale_after_seconds));

  if found then
    return query select true, 'pending'::text;
  else
    return query select false, coalesce(v_status, 'pending');
  end if;
end;
$$;

revoke all on function public.acquire_multiplayer_completion(uuid, uuid, integer) from public;
grant execute on function public.acquire_multiplayer_completion(uuid, uuid, integer) to authenticated;

create or replace function public.complete_multiplayer_completion(
  p_match_id uuid,
  p_user_id uuid,
  p_xp_awarded integer default 0
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  update public.multiplayer_match_completions
  set status = 'completed',
      completed_at = now(),
      xp_awarded = greatest(0, p_xp_awarded)
  where match_id = p_match_id
    and user_id = p_user_id;
end;
$$;

revoke all on function public.complete_multiplayer_completion(uuid, uuid, integer) from public;
grant execute on function public.complete_multiplayer_completion(uuid, uuid, integer) to authenticated;
