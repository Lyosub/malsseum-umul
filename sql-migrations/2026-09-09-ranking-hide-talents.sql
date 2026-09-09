-- 2026-09-09  오이코스 순위: 남의 오이코스 달란트 수치는 숨기고 순위·이름·인원만 노출
--   내 오이코스와 교역자·부장에게는 곳간/개인 달란트를 그대로 보여준다.
-- 재실행 안전: create or replace (반환 시그니처 동일).

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
    case when (
           exists (select 1 from group_members gm3 where gm3.group_id = g.id and gm3.user_id = auth.uid())
        or exists (select 1 from profiles ap where ap.user_id = auth.uid() and (ap.is_admin = true or ap.is_department_head = true))
      ) then (select coalesce(sum(pl.points), 0)
                from group_members gm2
                join points_ledger pl on pl.user_id = gm2.user_id
                where gm2.group_id = g.id)::bigint
      else null end as total_talents,
    case when (
           exists (select 1 from group_members gm4 where gm4.group_id = g.id and gm4.user_id = auth.uid())
        or exists (select 1 from profiles ap2 where ap2.user_id = auth.uid() and (ap2.is_admin = true or ap2.is_department_head = true))
      ) then (select coalesce(sum(otl.points), 0)
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
