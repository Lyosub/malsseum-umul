-- 나그네 마을 친구. 코드 배포 뒤 적용한다.
begin;

create table if not exists public.ark_friends (
  sender uuid not null references auth.users(id) on delete cascade,
  recipient uuid not null references auth.users(id) on delete cascade,
  accepted boolean not null default false,
  primary key (sender, recipient),
  check (sender <> recipient)
);
create unique index if not exists ark_friends_pair_idx
  on public.ark_friends ((least(sender, recipient)), (greatest(sender, recipient)));
create index if not exists ark_friends_recipient_idx on public.ark_friends(recipient);

create table if not exists public.ark_friend_blocks (
  owner_id uuid not null references auth.users(id) on delete cascade,
  target_id uuid not null references auth.users(id) on delete cascade,
  primary key (owner_id, target_id),
  check (owner_id <> target_id)
);
create index if not exists ark_friend_blocks_target_idx on public.ark_friend_blocks(target_id);

create table if not exists public.ark_friend_quota (
  user_id uuid primary key references auth.users(id) on delete cascade,
  day date not null,
  sent int not null check (sent between 1 and 8)
);

alter table public.ark_friends enable row level security;
alter table public.ark_friend_blocks enable row level security;
alter table public.ark_friend_quota enable row level security;
-- 테이블은 직접 조회하거나 수정할 수 없다. 아래 함수가 본인 관계만 읽고 쓴다.
revoke all on public.ark_friends, public.ark_friend_blocks, public.ark_friend_quota from public, anon, authenticated;

create or replace function public.get_ark_friends()
returns jsonb language sql stable security definer set search_path = public, pg_temp as $$
  with me as (select auth.uid() as id where auth.uid() is not null and public.can_play_ark()),
  links as (
    select case when f.sender = me.id then f.recipient else f.sender end as id,
      case when f.accepted then 'accepted' when f.sender = me.id then 'outgoing' else 'incoming' end as status
    from me join public.ark_friends f on me.id in (f.sender, f.recipient)
    union all
    select b.target_id, 'blocked' from me join public.ark_friend_blocks b on b.owner_id = me.id
  )
  select jsonb_build_object(
    'rows', coalesce((select jsonb_agg(jsonb_build_object('id', l.id, 'nick', coalesce(nullif(p.nickname,''), '친구'), 'status', l.status)
      order by p.nickname, l.id) from links l left join public.profiles p on p.user_id = l.id), '[]'::jsonb),
    'hidden', coalesce((select jsonb_agg(distinct case when b.owner_id = me.id then b.target_id else b.owner_id end)
      from me join public.ark_friend_blocks b on me.id in (b.owner_id, b.target_id)), '[]'::jsonb)
  ) from me;
$$;

create or replace function public.request_ark_friend(p_nick text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  me uuid := auth.uid();
  other_id uuid;
  matches uuid[];
  today date := (now() at time zone 'Asia/Seoul')::date;
  sent_today integer;
begin
  if me is null or not public.can_play_ark() then return jsonb_build_object('error', 'login'); end if;
  if p_nick is null or char_length(btrim(p_nick)) not between 1 and 60 then
    return jsonb_build_object('error', 'missing');
  end if;
  select array_agg(p.user_id) into matches from (
    select distinct user_id from public.profiles
    where lower(btrim(nickname)) = lower(btrim(p_nick)) limit 2
  ) p;
  if coalesce(cardinality(matches), 0) = 0 then return jsonb_build_object('error', 'missing'); end if;
  if cardinality(matches) > 1 then return jsonb_build_object('error', 'duplicate'); end if;
  other_id := matches[1];
  if me = other_id then return jsonb_build_object('error', 'self'); end if;

  -- 보낸 사람의 일일 한도와 같은 두 사람의 관계 변경을 각각 직렬화한다.
  perform pg_advisory_xact_lock(728601, hashtext(me::text));
  perform pg_advisory_xact_lock(728602, hashtext(least(me, other_id)::text || greatest(me, other_id)::text));
  if exists (select 1 from public.ark_friend_blocks
    where (owner_id = me and target_id = other_id) or (owner_id = other_id and target_id = me)) then
    return jsonb_build_object('error', 'blocked');
  end if;
  if exists (select 1 from public.ark_friends
    where (sender = me and recipient = other_id) or (sender = other_id and recipient = me)) then
    return jsonb_build_object('error', 'existing');
  end if;
  if (select count(*) from public.ark_friends where sender = me and not accepted) >= 5 then
    return jsonb_build_object('error', 'pending');
  end if;
  select q.sent into sent_today from public.ark_friend_quota q where user_id = me and q.day = today;
  if coalesce(sent_today, 0) >= 8 then return jsonb_build_object('error', 'daily'); end if;
  insert into public.ark_friend_quota(user_id, day, sent) values (me, today, coalesce(sent_today, 0) + 1)
    on conflict (user_id) do update set day = excluded.day, sent = excluded.sent;
  insert into public.ark_friends(sender, recipient) values (me, other_id);
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.change_ark_friend(p_user uuid, p_action text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare me uuid := auth.uid();
begin
  if me is null or not public.can_play_ark() then return jsonb_build_object('error', 'login'); end if;
  if p_user is null or p_user = me then return jsonb_build_object('error', 'self'); end if;
  perform pg_advisory_xact_lock(728602, hashtext(least(me, p_user)::text || greatest(me, p_user)::text));
  case p_action
    when 'accept' then
      update public.ark_friends set accepted = true where sender = p_user and recipient = me and not accepted;
    when 'decline' then
      delete from public.ark_friends where sender = p_user and recipient = me and not accepted;
    when 'cancel' then
      delete from public.ark_friends where sender = me and recipient = p_user and not accepted;
    when 'remove' then
      delete from public.ark_friends where accepted and
        ((sender = me and recipient = p_user) or (sender = p_user and recipient = me));
    when 'block' then
      if not exists (select 1 from public.profiles where user_id = p_user) then return jsonb_build_object('error', 'missing'); end if;
      delete from public.ark_friends where (sender = me and recipient = p_user) or (sender = p_user and recipient = me);
      insert into public.ark_friend_blocks(owner_id, target_id) values (me, p_user) on conflict do nothing;
      return jsonb_build_object('ok', true);
    when 'unblock' then
      delete from public.ark_friend_blocks where owner_id = me and target_id = p_user;
    else return jsonb_build_object('error', 'gone');
  end case;
  return case when found then jsonb_build_object('ok', true) else jsonb_build_object('error', 'gone') end;
end $$;

revoke all on function public.get_ark_friends(), public.request_ark_friend(text),
  public.change_ark_friend(uuid, text) from public, anon;
grant execute on function public.get_ark_friends(), public.request_ark_friend(text),
  public.change_ark_friend(uuid, text) to authenticated;

-- 기존 반환 형식은 그대로. 차단 관계를 빼고 공개한 친구 집을 먼저 보여 준다.
create or replace function public.get_ark_showcase()
returns table(plot_idx int, nick text, intro int, mine boolean, updated_at timestamptz)
language sql stable security definer set search_path = public, pg_temp as $$
  select v.plot_idx, p.nickname, v.intro, v.user_id = auth.uid(), v.updated_at
  from public.ark_village_plots v join public.profiles p on p.user_id = v.user_id
  where public.can_play_ark() and (v.show or v.user_id = auth.uid())
    and not exists (select 1 from public.ark_friend_blocks b
      where (b.owner_id = auth.uid() and b.target_id = v.user_id)
         or (b.target_id = auth.uid() and b.owner_id = v.user_id))
  order by exists (
    select 1 from public.ark_friends f where f.accepted
      and ((f.sender = auth.uid() and f.recipient = v.user_id)
        or (f.recipient = auth.uid() and f.sender = v.user_id))
  ) desc, v.updated_at desc limit 64;
$$;
revoke all on function public.get_ark_showcase() from public, anon;
grant execute on function public.get_ark_showcase() to authenticated;

commit;
