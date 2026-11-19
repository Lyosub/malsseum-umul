-- 2026-11-19 나그네 마을 「노아의 부탁」: 다섯 가지를 마치면(창 6~9장) 남쪽 개척 땅을 맡을 수 있다
-- 마친 기록은 ark_noah_done에 남고, change_ark_frontier의 'claim'은 이 기록이 있어야(관리자는 예외) 받아 준다.
-- 자유 개척지는 지금처럼 누구나. 이미 맡은 땅은 그대로. 다시 실행해도 안전.

create table if not exists public.ark_noah_done (
  user_id uuid primary key references auth.users(id) on delete cascade,
  at timestamptz not null default now()
);
alter table public.ark_noah_done enable row level security;   -- 정책 없음: 아래 함수로만

create or replace function public.finish_ark_noah()
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or not public.can_play_ark() then return false; end if;
  insert into ark_noah_done(user_id) values (auth.uid()) on conflict do nothing;
  return true;
end $$;
revoke all on function public.finish_ark_noah() from public, anon;
grant execute on function public.finish_ark_noah() to authenticated;

create or replace function public.get_ark_noah_done()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from ark_noah_done where user_id = auth.uid());
$$;
revoke all on function public.get_ark_noah_done() from public, anon;
grant execute on function public.get_ark_noah_done() to authenticated;

CREATE OR REPLACE FUNCTION public.change_ark_frontier(p_slot integer, p_action text, p_friend uuid, p_role text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare actor uuid:=auth.uid();
begin
  if actor is null or not public.can_play_ark() or p_slot not between 0 and 8 then return false; end if;
  perform pg_advisory_xact_lock(1924,20);
  if p_action='claim' then
    -- 노아의 부탁을 마친 사람만(관리자는 그대로) — 2026-11-19
    if not public.is_ark_admin() and not exists(select 1 from public.ark_noah_done n where n.user_id=actor) then return false; end if;
    insert into public.ark_frontier_plots(slot,owner_id) values(p_slot,actor) on conflict do nothing;
    return found;
  end if;
  if not exists(select 1 from public.ark_frontier_plots p where p.slot=p_slot and p.owner_id=actor) then return false; end if;
  if p_action='revoke' then
    delete from public.ark_frontier_grants g where g.slot=p_slot and g.friend_id=p_friend;
    return true;
  end if;
  if p_action='grant' and p_role in ('build','stock') and exists(
    select 1 from public.ark_friends f where f.accepted and
      ((f.sender=actor and f.recipient=p_friend) or (f.recipient=actor and f.sender=p_friend))
  ) then
    insert into public.ark_frontier_grants(slot,friend_id,role) values(p_slot,p_friend,p_role)
      on conflict(slot,friend_id) do update set role=excluded.role;
    return true;
  end if;
  return false;
end $function$;

notify pgrst, 'reload schema';
select 'ok — ark noah quest' as status;
