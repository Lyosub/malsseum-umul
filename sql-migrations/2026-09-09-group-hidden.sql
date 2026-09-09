-- 2026-09-09  오이코스에 "숨김" 플래그 — 테스트/내부용 오이코스를 순위에서 빼고
--   일반 사용자에게 노출하지 않는다. 교역자·부장은 관리 화면에서 그대로 본다.
-- 재실행 안전: add column if not exists / drop function 후 재생성.

alter table groups add column if not exists is_hidden boolean not null default false;

-- 순위: 숨김 오이코스 제외 (본인이 그 오이코스 멤버여도 순위엔 안 뜸)
drop function if exists get_group_talent_rankings();
create or replace function get_group_talent_rankings()
returns table(
  id bigint, name text, host_is_teacher boolean, member_count bigint,
  total_talents bigint, pool bigint
)
language sql
security definer
set search_path = public
as $func$
  select
    g.id, g.name, coalesce(p.is_teacher, false),
    (select count(*) from group_members gm where gm.group_id = g.id)::bigint,
    (select coalesce(sum(pl.points), 0)
       from group_members gm2
       join points_ledger pl on pl.user_id = gm2.user_id
       where gm2.group_id = g.id)::bigint as total_talents,
    (select coalesce(sum(otl.points), 0)
       from oikos_talent_ledger otl
       where otl.group_id = g.id)::bigint as pool
  from groups g
  join profiles p on p.user_id = g.created_by
  where not coalesce(g.is_hidden, false)
    and (
      exists (select 1 from group_members me where me.user_id = auth.uid())
      or exists (select 1 from profiles ap where ap.user_id = auth.uid() and (ap.is_admin = true or ap.is_department_head = true))
    )
  order by total_talents desc, g.created_at asc
  limit 15;
$func$;

-- 관리자 오이코스 목록: 숨김 여부도 함께 내려서 "· 숨김" 표시
drop function if exists get_all_groups_admin();
create or replace function get_all_groups_admin()
returns table(
  id bigint, name text, invite_code text,
  created_by_nickname text, created_by_real_name text,
  host_is_teacher boolean, member_count bigint,
  total_talents bigint, pool bigint, is_hidden boolean,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $func$
  select
    g.id, g.name, g.invite_code, p.nickname,
    case when exists (select 1 from profiles ap where ap.user_id = auth.uid() and ap.is_admin = true) then p.real_name else null end,
    coalesce(p.is_teacher, false),
    (select count(*) from group_members gm where gm.group_id = g.id),
    (select coalesce(sum(pl.points), 0)
       from group_members gm2
       join points_ledger pl on pl.user_id = gm2.user_id
       where gm2.group_id = g.id)::bigint,
    (select coalesce(sum(otl.points), 0)
       from oikos_talent_ledger otl
       where otl.group_id = g.id)::bigint,
    coalesce(g.is_hidden, false),
    g.created_at
  from groups g
  join profiles p on p.user_id = g.created_by
  where exists (
    select 1 from profiles admin_p
    where admin_p.user_id = auth.uid() and (admin_p.is_admin = true or admin_p.is_department_head = true)
  )
  order by g.created_at desc;
$func$;

-- 이번 테스트 오이코스 숨김 처리
update groups set is_hidden = true where name = '🧪 테스트 오이코스';
