-- 2026-09-09  오이코스 순위: 관리자 페이지에서는 전체 수치를 그대로 보게 한다.
--   get_group_talent_rankings(p_full):
--     p_full = false (기본, 마이페이지) → 곳간/개인 달란트는 "내가 속한 오이코스"만
--     p_full = true 이면서 호출자가 교역자·부장 → 모든 오이코스 수치 노출 (admin.html 전용)
-- 재실행 안전: 인자 시그니처가 바뀌므로 drop 후 재생성.

drop function if exists get_group_talent_rankings();
drop function if exists get_group_talent_rankings(boolean);
create or replace function get_group_talent_rankings(p_full boolean default false)
returns table(
  id bigint, name text, host_is_teacher boolean, member_count bigint,
  total_talents bigint, pool bigint
)
language sql
security definer
set search_path = public
as $func$
  with priv as (
    select p_full and exists (
      select 1 from profiles ap where ap.user_id = auth.uid()
        and (ap.is_admin = true or ap.is_department_head = true)
    ) as show_all
  )
  select
    g.id, g.name, coalesce(p.is_teacher, false),
    (select count(*) from group_members gm where gm.group_id = g.id)::bigint,
    case when (select show_all from priv)
           or exists (select 1 from group_members gm3 where gm3.group_id = g.id and gm3.user_id = auth.uid())
      then (select coalesce(sum(pl.points), 0)
              from group_members gm2
              join points_ledger pl on pl.user_id = gm2.user_id
              where gm2.group_id = g.id)::bigint
      else null end as total_talents,
    case when (select show_all from priv)
           or exists (select 1 from group_members gm4 where gm4.group_id = g.id and gm4.user_id = auth.uid())
      then (select coalesce(sum(otl.points), 0)
              from oikos_talent_ledger otl
              where otl.group_id = g.id)::bigint
      else null end as pool
  from groups g
  join profiles p on p.user_id = g.created_by
  where not coalesce(g.is_hidden, false)
    and (
      exists (select 1 from group_members me where me.user_id = auth.uid())
      or exists (select 1 from profiles ap0 where ap0.user_id = auth.uid() and (ap0.is_admin = true or ap0.is_department_head = true))
    )
  order by (select coalesce(sum(pl.points), 0)
             from group_members gm2
             join points_ledger pl on pl.user_id = gm2.user_id
             where gm2.group_id = g.id) desc,
           g.created_at asc
  limit 15;
$func$;
