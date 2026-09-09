-- 2026-09-09  오이코스 달란트를 "개인 활동 몫 / 오이코스 챌린지로 함께 받은 몫"으로 분해 표시
--
-- 총액(earned)·신청대기(pending)·사용가능(available)은 그대로 두고, 표시용 컬럼 2개만 추가한다.
--   from_group    = 오이코스원들이 오이코스 주간 챌린지 보너스로 받은 달란트 합
--                   (action_type in group_attendance_bonus / group_notes_bonus).
--                   달란트 상점에서 이미 쓴 사람은 실제 잔액을 넘지 않게 각자 캡(least).
--   from_personal = earned - from_group   (그 외 개인 활동으로 모은 몫)
-- 항상 from_personal + from_group = earned 을 만족한다.
--
-- 회식비 차감 로직(모델 A: 개인 달란트 실제 차감)은 전혀 바꾸지 않는다 — 순수 표시용 분해.
--
-- 재실행 안전: 반환 컬럼이 늘어 create or replace 불가하므로 drop 후 재생성.
-- 기존 호출부: mypage.js(get_oikos_talent) 는 이름으로 읽어 컬럼 추가에 영향 없음,
--             request_oikos_expense 는 available 만 select 하므로 영향 없음.

drop function if exists get_oikos_talent(bigint);
create or replace function get_oikos_talent(p_group_id bigint)
returns table(
  earned bigint,
  pending bigint,
  available bigint,
  from_personal bigint,
  from_group bigint
)
language sql
security definer
set search_path = public
as $func$
  with mem as (
    select user_id from group_members where group_id = p_group_id
  ),
  per_member as (
    select
      greatest(
        coalesce((select sum(pl.points) from points_ledger pl where pl.user_id = m.user_id), 0)
        - coalesce((select sum(so.cost_snapshot) from shop_orders so
                    where so.user_id = m.user_id and so.status in ('pending','approved','delivered')), 0)
      , 0) as bal,
      coalesce((select sum(pl.points) from points_ledger pl
                where pl.user_id = m.user_id
                  and pl.action_type in ('group_attendance_bonus','group_notes_bonus')), 0) as grp_raw
    from mem m
  ),
  agg as (
    select
      coalesce(sum(bal), 0)::bigint                     as earned,
      coalesce(sum(least(bal, grp_raw)), 0)::bigint     as from_group
    from per_member
  ),
  p as (
    select coalesce(sum(amount), 0)::bigint as pending
    from oikos_expense_requests
    where group_id = p_group_id and status = 'pending'
  )
  select
    agg.earned,
    p.pending,
    (agg.earned - p.pending)          as available,
    (agg.earned - agg.from_group)     as from_personal,
    agg.from_group
  from agg, p;
$func$;
