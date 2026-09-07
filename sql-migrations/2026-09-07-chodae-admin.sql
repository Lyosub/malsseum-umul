-- 2026-09-07 : 관리자 페이지에서 친구초청잔치 초청 명단(누가 누굴 적었는지) 보기 + 잔치날 "왔어요" 체크
--
-- get_friend_invites_admin : 교역자/부장/교사만. 초청자 닉네임·본명 + 친구 이름 + came + 등록시각.
-- set_friend_invite_came   : 교역자/부장/교사만. 잔치날 실제로 온 친구를 came=true로.
--
-- 되돌리기 어려운 동작 없음(함수 2개 create or replace).

create or replace function get_friend_invites_admin()
returns table(
  id bigint,
  inviter_nickname text,
  inviter_real_name text,
  friend_name text,
  came boolean,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $func$
begin
  if not exists (
    select 1 from profiles p
    where p.user_id = auth.uid()
      and (p.is_admin or p.is_department_head or p.is_teacher)
  ) then
    raise exception '권한이 없어요.';
  end if;

  return query
    select
      fi.id,
      pr.nickname,
      pr.real_name,
      fi.friend_name,
      fi.came,
      fi.created_at
    from friend_invites fi
    left join profiles pr on pr.user_id = fi.inviter_user_id
    where fi.event_key = '2026-0913'
    order by pr.nickname nulls last, fi.created_at, fi.id;
end;
$func$;

create or replace function set_friend_invite_came(p_id bigint, p_came boolean)
returns boolean
language plpgsql
security definer
set search_path = public
as $func$
begin
  if not exists (
    select 1 from profiles p
    where p.user_id = auth.uid()
      and (p.is_admin or p.is_department_head or p.is_teacher)
  ) then
    raise exception '권한이 없어요.';
  end if;

  update friend_invites set came = coalesce(p_came, false) where id = p_id;
  return found;
end;
$func$;

grant execute on function get_friend_invites_admin() to authenticated;
grant execute on function set_friend_invite_came(bigint, boolean) to authenticated;

select 'get_friend_invites_admin + set_friend_invite_came 완료' as status;
