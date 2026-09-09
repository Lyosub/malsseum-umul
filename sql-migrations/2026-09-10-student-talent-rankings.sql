-- 2026-09-10  관리자 페이지: 학생 개인 달란트 순위
--   교역자·부장만 조회. 스태프(is_admin/is_department_head/is_teacher) 제외한 학생만.
--   잔액 = points_ledger 합계 - 상점 교환분(pending/approved/delivered), 0 미만은 0.
--   real_name 은 get_all_groups_admin 과 동일하게 is_admin 에게만 노출.
-- 재실행 안전: create or replace.

create or replace function get_student_talent_rankings(p_limit integer default 40)
returns table(user_id uuid, nickname text, real_name text, balance bigint, rank integer)
language sql
security definer
set search_path = public
as $func$
  with priv as (
    select
      exists (select 1 from profiles p where p.user_id = auth.uid()
              and (p.is_admin = true or p.is_department_head = true)) as is_staff,
      exists (select 1 from profiles p where p.user_id = auth.uid() and p.is_admin = true) as is_admin
  ),
  bal as (
    select
      pr.user_id,
      pr.nickname,
      case when (select is_admin from priv) then pr.real_name else null end as real_name,
      greatest(
        coalesce((select sum(pl.points) from points_ledger pl where pl.user_id = pr.user_id), 0)
        - coalesce((select sum(so.cost_snapshot) from shop_orders so
                    where so.user_id = pr.user_id and so.status in ('pending','approved','delivered')), 0)
      , 0)::bigint as balance
    from profiles pr
    where (select is_staff from priv)
      and not coalesce(pr.is_admin, false)
      and not coalesce(pr.is_department_head, false)
      and not coalesce(pr.is_teacher, false)
  )
  select
    user_id, nickname, real_name, balance,
    (row_number() over (order by balance desc, nickname asc))::integer as rank
  from bal
  order by balance desc, nickname asc
  limit p_limit;
$func$;
