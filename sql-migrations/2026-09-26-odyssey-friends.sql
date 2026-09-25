-- In Odyssey 친구 추가 · 친구 장막 놀러 가기 · ❤️ (2026-09-26)
-- 모두 can_see_odyssey()(관리자·시험 참여자)끼리만. 닉네임·칭호만 주고받음. 재실행 안전.

create table if not exists odyssey_friends (
  a uuid not null references auth.users(id) on delete cascade,
  b uuid not null references auth.users(id) on delete cascade,
  requested_by uuid not null,
  status text not null check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  primary key (a, b),
  check (a < b)
);
alter table odyssey_friends enable row level security;

create table if not exists odyssey_home_likes (
  owner uuid not null references auth.users(id) on delete cascade,
  liker uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (owner, liker)
);
alter table odyssey_home_likes enable row level security;

-- 게임에 들어올 수 있는 사람(시험 참여자 + 관리자)
create or replace function public.odyssey_people_ids()
returns setof uuid language sql stable security definer set search_path = public as $$
  select user_id from odyssey_testers union select user_id from profiles where coalesce(is_admin, false);
$$;
revoke all on function public.odyssey_people_ids() from public, anon, authenticated;

create or replace function public.odyssey_is_friend(p_other uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from odyssey_friends where a = least(auth.uid(), p_other) and b = greatest(auth.uid(), p_other) and status = 'accepted');
$$;
revoke all on function public.odyssey_is_friend(uuid) from public, anon;
grant execute on function public.odyssey_is_friend(uuid) to authenticated;

-- 사람 목록: 나를 뺀 게임 참여자 + 나와의 관계(friend/sent/received/none) + 장막 ❤️ 수
create or replace function public.get_odyssey_people()
returns table(user_id uuid, nickname text, title text, rel text, likes integer)
language sql stable security definer set search_path = public as $$
  select * from (
    select p.user_id, p.nickname, pr.title,
           case when f.status = 'accepted' then 'friend' when f.status = 'pending' and f.requested_by = auth.uid() then 'sent'
                when f.status = 'pending' then 'received' else 'none' end as rel,
           (select count(*)::int from odyssey_home_likes l where l.owner = p.user_id) as likes
    from profiles p
    left join odyssey_progress pr on pr.user_id = p.user_id
    left join odyssey_friends f on f.a = least(auth.uid(), p.user_id) and f.b = greatest(auth.uid(), p.user_id)
    where public.can_see_odyssey() and p.user_id <> auth.uid() and p.user_id in (select public.odyssey_people_ids())
  ) x
  order by (x.rel = 'friend') desc, (x.rel = 'received') desc, x.nickname;
$$;

-- 친구 요청(상대가 먼저 요청했으면 바로 친구가 됨)
create or replace function public.request_odyssey_friend(p_to uuid)
returns text language plpgsql security definer set search_path = public as $$
declare r odyssey_friends;
begin
  if auth.uid() is null or not public.can_see_odyssey() or p_to = auth.uid() or p_to not in (select public.odyssey_people_ids()) then return 'no'; end if;
  select * into r from odyssey_friends where a = least(auth.uid(), p_to) and b = greatest(auth.uid(), p_to);
  if r.a is null then
    insert into odyssey_friends (a, b, requested_by, status) values (least(auth.uid(), p_to), greatest(auth.uid(), p_to), auth.uid(), 'pending');
    return 'sent';
  elsif r.status = 'pending' and r.requested_by <> auth.uid() then
    update odyssey_friends set status = 'accepted' where a = r.a and b = r.b; return 'friend';
  end if;
  return r.status;
end $$;

create or replace function public.respond_odyssey_friend(p_other uuid, p_accept boolean)
returns text language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or not public.can_see_odyssey() then return 'no'; end if;
  if p_accept then
    update odyssey_friends set status = 'accepted'
    where a = least(auth.uid(), p_other) and b = greatest(auth.uid(), p_other) and status = 'pending' and requested_by = p_other;
    return case when found then 'friend' else 'no' end;
  end if;
  delete from odyssey_friends where a = least(auth.uid(), p_other) and b = greatest(auth.uid(), p_other);   -- 거절·요청 취소·친구 끊기
  return 'none';
end $$;

-- 장막 읽기: 내 것, 또는 친구 것만
create or replace function public.get_odyssey_home(p_user uuid default null)
returns jsonb language sql stable security definer set search_path = public as $$
  select case when public.can_see_odyssey() and (p_user is null or p_user = auth.uid() or public.odyssey_is_friend(p_user)) then
    (select layout from odyssey_home where user_id = coalesce(p_user, auth.uid())) end;
$$;

-- 장막 정보(놀러 갔을 때): 물건·❤️ 수·내가 눌렀는지·닉네임
create or replace function public.get_odyssey_home_info(p_user uuid default null)
returns jsonb language sql stable security definer set search_path = public as $$
  select case when public.can_see_odyssey() and (p_user is null or p_user = auth.uid() or public.odyssey_is_friend(p_user)) then
    jsonb_build_object(
      'layout', coalesce((select layout from odyssey_home where user_id = coalesce(p_user, auth.uid())), '[]'::jsonb),
      'likes', (select count(*) from odyssey_home_likes where owner = coalesce(p_user, auth.uid())),
      'liked', exists (select 1 from odyssey_home_likes where owner = coalesce(p_user, auth.uid()) and liker = auth.uid()),
      'nickname', (select nickname from profiles where user_id = coalesce(p_user, auth.uid()))) end;
$$;

-- ❤️ 누르기/취소(친구 장막만, 내 장막은 안 됨)
create or replace function public.like_odyssey_home(p_owner uuid)
returns integer language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or not public.can_see_odyssey() or p_owner = auth.uid() or not public.odyssey_is_friend(p_owner) then return null; end if;
  if exists (select 1 from odyssey_home_likes where owner = p_owner and liker = auth.uid()) then
    delete from odyssey_home_likes where owner = p_owner and liker = auth.uid();
  else
    insert into odyssey_home_likes (owner, liker) values (p_owner, auth.uid());
  end if;
  return (select count(*) from odyssey_home_likes where owner = p_owner);
end $$;

revoke all on function public.get_odyssey_people() from public, anon;
revoke all on function public.request_odyssey_friend(uuid) from public, anon;
revoke all on function public.respond_odyssey_friend(uuid, boolean) from public, anon;
revoke all on function public.get_odyssey_home_info(uuid) from public, anon;
revoke all on function public.like_odyssey_home(uuid) from public, anon;
grant execute on function public.get_odyssey_people() to authenticated;
grant execute on function public.request_odyssey_friend(uuid) to authenticated;
grant execute on function public.respond_odyssey_friend(uuid, boolean) to authenticated;
grant execute on function public.get_odyssey_home_info(uuid) to authenticated;
grant execute on function public.like_odyssey_home(uuid) to authenticated;
