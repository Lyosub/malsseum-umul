-- 2026-09-09  관리자 오이코스 목록 / 오이코스 달란트 순위에 "공동 곳간(풀)" 수치 추가
--
-- 두 화면 모두 지금까지 "오이코스원 개인 달란트 합계"만 보여줬다(= 활동량).
-- 공동 곳간(oikos_talent_ledger) 모델이 생겼으니 두 숫자를 나란히 보여준다: 곳간 X · 활동 Y.
-- 순위 정렬 기준은 그대로 활동량(total_talents).
-- 또 관리자 "달란트 부여"에 대상 선택(개인들에게 / 공동 곳간에)을 추가한다.
--
-- 재실행 안전: 반환 컬럼/인자가 바뀌어 create or replace 불가 → drop 후 재생성.

-- 1) 관리자 오이코스 목록 : pool 컬럼 추가 -------------------------------------
drop function if exists get_all_groups_admin();
create or replace function get_all_groups_admin()
returns table(
  id bigint, name text, invite_code text,
  created_by_nickname text, created_by_real_name text,
  host_is_teacher boolean, member_count bigint,
  total_talents bigint,   -- 오이코스원 개인 달란트 합계 (활동량)
  pool bigint,            -- 공동 곳간 잔액 (기부 + 챌린지 - 회식비)
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
    g.created_at
  from groups g
  join profiles p on p.user_id = g.created_by
  where exists (
    select 1 from profiles admin_p
    where admin_p.user_id = auth.uid() and (admin_p.is_admin = true or admin_p.is_department_head = true)
  )
  order by g.created_at desc;
$func$;

-- 2) 오이코스 달란트 순위 : pool 컬럼 추가 (정렬은 활동량 유지) ----------------
drop function if exists get_group_talent_rankings();
create or replace function get_group_talent_rankings()
returns table(
  id bigint, name text, host_is_teacher boolean, member_count bigint,
  total_talents bigint,  -- 활동량 (정렬 기준)
  pool bigint            -- 공동 곳간 잔액
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
  where (
    exists (select 1 from group_members me where me.user_id = auth.uid())
    or exists (select 1 from profiles ap where ap.user_id = auth.uid() and (ap.is_admin = true or ap.is_department_head = true))
  )
  order by total_talents desc, g.created_at asc
  limit 15;
$func$;

-- 3) 관리자 달란트 부여 : 대상 선택(개인들 / 공동 곳간) --------------------------
drop function if exists admin_award_group_points(bigint, integer, text);
create or replace function admin_award_group_points(
  p_group_id bigint,
  p_points integer,
  p_note text default null,
  p_to_pool boolean default false
)
returns integer
language plpgsql
security definer
set search_path = public
as $func$
declare
  v_count integer := 0;
begin
  if not exists (select 1 from profiles p where p.user_id = auth.uid() and (p.is_admin = true or p.is_department_head = true)) then
    raise exception '교역자·부장만 달란트를 부여할 수 있습니다.';
  end if;
  if p_points is null or p_points = 0 then
    raise exception '0이 아닌 달란트를 입력해주세요.';
  end if;

  if p_to_pool then
    -- 공동 곳간에 한 번에 부여 (음수면 차감/조정)
    insert into oikos_talent_ledger (group_id, kind, points, note)
    values (p_group_id, 'admin_adjust', p_points, coalesce(nullif(trim(p_note), ''), '관리자 조정'));
    return 1;
  end if;

  -- 개인들에게 각자 p_points 씩
  insert into points_ledger (user_id, action_type, points, ref_date, note, awarded_by)
  select gm.user_id, 'admin_award', p_points, (now() at time zone 'Asia/Seoul')::date, p_note, auth.uid()
  from group_members gm
  where gm.group_id = p_group_id;

  get diagnostics v_count = row_count;
  return v_count;
end;
$func$;
