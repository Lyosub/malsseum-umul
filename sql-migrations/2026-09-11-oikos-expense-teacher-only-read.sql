-- 2026-09-11  회식비 신청 내역 조회(get_oikos_expenses)를 교사 전용으로 좁힘
-- 화면(oikosExpenseSection)은 이미 is_teacher 학생에겐 display:none 이지만,
-- 함수 자체는 "그룹 멤버인지"만 확인해서 학생이 콘솔로 직접 호출하면
-- 자기 오이코스의 신청 금액·목적·상태·교역자 메모를 볼 수 있는 구멍이 있었음.
-- request_oikos_expense(신청 자체)는 이미 is_teacher 체크가 있어 문제없었고, 조회만 새는 구조였음.
-- 재실행 안전: create or replace function.

create or replace function get_oikos_expenses(p_group_id bigint)
returns table(id bigint, requester_nickname text, amount integer, purpose text, status text, admin_note text, created_at timestamptz, decided_at timestamptz)
language sql
security definer
set search_path = public
as $func$
  select r.id, pr.nickname, r.amount, r.purpose, r.status, r.admin_note, r.created_at, r.decided_at
  from oikos_expense_requests r
  join profiles pr on pr.user_id = r.requested_by
  where r.group_id = p_group_id
    and exists (
      select 1 from group_members gm
      join profiles p on p.user_id = gm.user_id
      where gm.group_id = p_group_id and gm.user_id = auth.uid() and coalesce(p.is_teacher, false)
    )
  order by r.created_at desc;
$func$;

select 'get_oikos_expenses: 그룹 멤버 전체 → 교사 전용으로 좁힘 완료' as status;
