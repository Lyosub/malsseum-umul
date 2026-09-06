-- 2026-09-06 교사 오이코스 회식비 지원
-- 교사(is_teacher)가 자기 오이코스의 누적 달란트 한도 안에서 회식비 지원을 신청하면
-- 교역자·부장이 승인/거절/지급완료로 처리한다.
-- "오이코스 달란트" = 그 오이코스 멤버들의 개인 달란트 합계(순위표와 동일 기준).
--   학생 개인 달란트를 실제로 깎지는 않고, 오이코스가 신청할 수 있는 한도로만 쓴다.
--   사용 가능액 = 오이코스 달란트 합계 - (대기/승인/지급된 회식비 신청 합계).
--
-- Supabase 대시보드 → SQL Editor에 붙여넣고 Run. 마지막 status 줄이 뜨면 성공.

create table if not exists oikos_expense_requests (
  id bigint generated always as identity primary key,
  group_id bigint not null references groups(id) on delete cascade,
  requested_by uuid not null references auth.users(id) on delete cascade,
  amount integer not null check (amount > 0),      -- 달란트 단위
  purpose text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'paid')),
  admin_note text,
  decided_by uuid references auth.users(id),
  decided_at timestamptz,
  created_at timestamptz not null default now()
);
alter table oikos_expense_requests enable row level security;

drop policy if exists "오이코스 멤버·관리자 조회" on oikos_expense_requests;
create policy "오이코스 멤버·관리자 조회" on oikos_expense_requests
  for select using (
    exists (select 1 from group_members gm where gm.group_id = oikos_expense_requests.group_id and gm.user_id = auth.uid())
    or exists (select 1 from profiles p where p.user_id = auth.uid() and (p.is_admin or p.is_department_head))
  );
-- insert/update는 아래 함수(SECURITY DEFINER)로만.

-- 오이코스 달란트 현황 (합계 / 사용 / 사용 가능)
create or replace function get_oikos_talent(p_group_id bigint)
returns table(earned bigint, spent bigint, available bigint)
language sql
security definer
set search_path = public
as $$
  with e as (
    select coalesce(sum(pl.points), 0)::bigint as earned
    from points_ledger pl
    where pl.user_id in (select user_id from group_members where group_id = p_group_id)
  ), s as (
    select coalesce(sum(amount), 0)::bigint as spent
    from oikos_expense_requests
    where group_id = p_group_id and status in ('pending', 'approved', 'paid')
  )
  select e.earned, s.spent, (e.earned - s.spent) from e, s;
$$;

-- 신청 (교사 + 해당 오이코스 멤버만)
create or replace function request_oikos_expense(p_group_id bigint, p_amount integer, p_purpose text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
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
  if p_amount is null or p_amount <= 0 then raise exception '달란트를 올바르게 입력해주세요.'; end if;

  select available into v_avail from get_oikos_talent(p_group_id);
  if p_amount > v_avail then
    raise exception '오이코스 달란트가 부족해요. (사용 가능 %)', v_avail;
  end if;

  insert into oikos_expense_requests (group_id, requested_by, amount, purpose)
  values (p_group_id, auth.uid(), p_amount, v_purpose)
  returning id into v_id;
  return v_id;
end;
$$;

-- 우리 오이코스 신청 목록 (멤버 조회)
create or replace function get_oikos_expenses(p_group_id bigint)
returns table(id bigint, requester_nickname text, amount integer, purpose text, status text, admin_note text, created_at timestamptz, decided_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select r.id, pr.nickname, r.amount, r.purpose, r.status, r.admin_note, r.created_at, r.decided_at
  from oikos_expense_requests r
  join profiles pr on pr.user_id = r.requested_by
  where r.group_id = p_group_id
    and exists (select 1 from group_members gm where gm.group_id = p_group_id and gm.user_id = auth.uid())
  order by r.created_at desc;
$$;

-- 관리자·부장: 전체 회식비 신청
create or replace function get_oikos_expenses_admin(p_status text default null)
returns table(id bigint, group_id bigint, group_name text, requester_nickname text, amount integer, purpose text, status text, admin_note text, created_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select r.id, r.group_id, g.name, pr.nickname, r.amount, r.purpose, r.status, r.admin_note, r.created_at
  from oikos_expense_requests r
  join groups g on g.id = r.group_id
  join profiles pr on pr.user_id = r.requested_by
  where exists (select 1 from profiles p where p.user_id = auth.uid() and (p.is_admin or p.is_department_head))
    and (p_status is null or r.status = p_status)
  order by (r.status = 'pending') desc, r.created_at desc
  limit 200;
$$;

-- 관리자·부장: 승인 / 거절 / 지급완료
create or replace function decide_oikos_expense(p_id bigint, p_action text, p_note text default null)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row oikos_expense_requests;
begin
  if not exists (select 1 from profiles p where p.user_id = auth.uid() and (p.is_admin or p.is_department_head)) then
    raise exception '권한이 없어요.';
  end if;
  select * into v_row from oikos_expense_requests where id = p_id;
  if v_row.id is null then raise exception '신청을 찾을 수 없어요.'; end if;

  if p_action = 'approve' then
    if v_row.status <> 'pending' then raise exception '이미 처리된 신청이에요.'; end if;
    update oikos_expense_requests set status = 'approved', admin_note = nullif(trim(p_note), ''), decided_by = auth.uid(), decided_at = now() where id = p_id;
  elsif p_action = 'reject' then
    if v_row.status not in ('pending', 'approved') then raise exception '이미 처리된 신청이에요.'; end if;
    update oikos_expense_requests set status = 'rejected', admin_note = nullif(trim(p_note), ''), decided_by = auth.uid(), decided_at = now() where id = p_id;
  elsif p_action = 'pay' then
    if v_row.status <> 'approved' then raise exception '승인된 신청만 지급완료로 바꿀 수 있어요.'; end if;
    update oikos_expense_requests set status = 'paid', decided_by = auth.uid(), decided_at = now() where id = p_id;
  else
    raise exception '잘못된 동작이에요.';
  end if;
  return true;
end;
$$;

select 'oikos_expense_requests 테이블 + 함수 4개 생성 완료' as status;
