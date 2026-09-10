-- 2026-09-11  관리자 회원 상세: 그 회원이 어떤 뱃지로 달란트를 받았는지 보이게
--   badge_awards RLS는 "본인만" 이라 관리자가 남의 것을 못 읽는다.
--   관리자·부장 전용 SECURITY DEFINER 함수로 특정 회원의 badge_awards를 조회한다.
-- 재실행 안전.

drop function if exists get_member_badge_awards_admin(uuid);
create or replace function get_member_badge_awards_admin(p_user_id uuid)
returns table(badge_code text, tier integer, points_awarded integer, awarded_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select ba.badge_code, ba.tier, ba.points_awarded, ba.awarded_at
  from badge_awards ba
  where ba.user_id = p_user_id
    and exists (
      select 1 from profiles ap
      where ap.user_id = auth.uid()
        and (ap.is_admin = true or ap.is_department_head = true)
    )
  order by ba.awarded_at desc;
$$;

grant execute on function get_member_badge_awards_admin(uuid) to authenticated;

select 'get_member_badge_awards_admin 생성 완료' as status;
