-- 2026-09-11  회식비 지원을 자유 금액(최소 300)에서 3단계 고정 지원금으로 변경
-- 전도사님 결정: 400 / 800 / 1200 달란트 3단계만 신청 가능 (달란트÷100 = 만원 환산: 4만/8만/12만원)
-- 학기에 1~2회 정도 오이코스 곳간을 모아 회식하는 빈도를 전제로, 실제 곳간 적립 속도(초기 데이터 기준
-- 가장 활발한 반도 이틀에 36달란트) 대비 1200은 "제일 열심히 한 반이 한 학기 걸려 닿는" 최상위 목표로 설계.
-- 재실행 안전: create or replace function.

create or replace function request_oikos_expense(p_group_id bigint, p_amount integer, p_purpose text)
returns bigint
language plpgsql
security definer
set search_path = public
as $func$
declare
  v_purpose text := nullif(trim(p_purpose), '');
  v_avail bigint;
  v_is_teacher boolean;
  v_id bigint;
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;
  select coalesce(is_teacher, false) into v_is_teacher from profiles where user_id = auth.uid();
  if not coalesce(v_is_teacher, false) then raise exception '교사만 신청할 수 있어요.'; end if;
  if not exists (select 1 from group_members where group_id = p_group_id and user_id = auth.uid()) then
    raise exception '내가 속한 오이코스만 신청할 수 있어요.';
  end if;
  if v_purpose is null then raise exception '사용 목적을 적어주세요.'; end if;
  if p_amount is null then raise exception '지원 금액을 선택해주세요.'; end if;
  if p_amount not in (400, 800, 1200) then
    raise exception '회식비는 400 / 800 / 1200달란트 중에서만 신청할 수 있어요.';
  end if;
  select available into v_avail from get_oikos_talent(p_group_id);
  if p_amount > v_avail then raise exception '곳간 달란트가 부족해요. (사용 가능 %)', v_avail; end if;
  insert into oikos_expense_requests (group_id, requested_by, amount, purpose)
  values (p_group_id, auth.uid(), p_amount, v_purpose) returning id into v_id;
  return v_id;
end;
$func$;

select 'request_oikos_expense: 300 이상 자유입력 → 400/800/1200 3단계 고정으로 변경 완료' as status;
