-- 2026-09-06 교사 오이코스 회식비 지원 (모델 A: 개인 달란트 실제 차감)
-- 교사(is_teacher)가 자기 오이코스로 회식비 지원을 신청 → 교역자·부장이 승인.
-- 승인하는 순간 신청 달란트를 오이코스원들에게 나눠서(균등 분배 + 0 밑으로는 안 내려감,
-- 남는 몫은 잔액 많은 사람부터) 각자 개인 달란트에서 실제로 차감한다.
-- 거절(승인 취소 포함) 시 차감했던 만큼 각자에게 그대로 환급한다.
--
-- Supabase 대시보드 → SQL Editor에 붙여넣고 Run. 마지막 status 줄이 뜨면 성공.
-- (이 게임/기능의 이전 버전 SQL을 이미 돌렸어도 이 파일이 덮어써서 바로잡는다.)

-- 1) points_ledger: oikos_expense 허용 (인덱스는 건드리지 않는다 — 기존 on conflict 절과
--    predicate가 안 맞으면 출석/퀴즈/기록 포인트 적립이 전부 터진다. 같은 날 여러 번의
--    oikos_expense 차감/환급은 아래 decide_oikos_expense가 on conflict do update로 한 줄에 합산한다.)
alter table points_ledger drop constraint if exists points_ledger_action_type_check;
alter table points_ledger add constraint points_ledger_action_type_check
  check (action_type in (
    'attendance', 'streak_bonus', 'note', 'quiz',
    'group_attendance_bonus', 'group_notes_bonus', 'admin_award', 'greeting_draw',
    'book_game', 'book_game_ot', 'book_game_nt',
    'match_game_books', 'match_game_figures',
    'oikos_expense'
  ));

-- 혹시 잘못 바뀐 인덱스를 원상복구
drop index if exists points_ledger_auto_uniq;
create unique index points_ledger_auto_uniq
  on points_ledger (user_id, action_type, ref_date)
  where action_type <> 'admin_award';

-- 2) 테이블 -------------------------------------------------------------------
create table if not exists oikos_expense_requests (
  id bigint generated always as identity primary key,
  group_id bigint not null references groups(id) on delete cascade,
  requested_by uuid not null references auth.users(id) on delete cascade,
  amount integer not null check (amount > 0),
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

-- 승인 시 누구에게 얼마를 뺐는지 기록(환급을 정확히 하기 위해)
create table if not exists oikos_expense_deductions (
  id bigint generated always as identity primary key,
  expense_id bigint not null references oikos_expense_requests(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null,
  created_at timestamptz not null default now()
);
alter table oikos_expense_deductions enable row level security;
drop policy if exists "본인·관리자 차감내역 조회" on oikos_expense_deductions;
create policy "본인·관리자 차감내역 조회" on oikos_expense_deductions
  for select using (
    auth.uid() = user_id
    or exists (select 1 from profiles p where p.user_id = auth.uid() and (p.is_admin or p.is_department_head))
  );

-- 3) 오이코스 달란트 현황 -----------------------------------------------------
-- earned  = 오이코스원들의 현재 개인 달란트 합계(승인된 회식비 차감은 여기 이미 반영됨)
-- pending = 아직 승인 안 된(대기 중) 신청 합계
-- available = earned - pending
create or replace function get_oikos_talent(p_group_id bigint)
returns table(earned bigint, pending bigint, available bigint)
language sql
security definer
set search_path = public
as $func$
  with mem as (select user_id from group_members where group_id = p_group_id),
  e as (
    select coalesce(sum(x.bal), 0)::bigint as earned from (
      select greatest(
        coalesce((select sum(pl.points) from points_ledger pl where pl.user_id = m.user_id), 0)
        - coalesce((select sum(so.cost_snapshot) from shop_orders so
                    where so.user_id = m.user_id and so.status in ('pending','approved','delivered')), 0)
      , 0) as bal
      from mem m
    ) x
  ),
  p as (
    select coalesce(sum(amount), 0)::bigint as pending
    from oikos_expense_requests
    where group_id = p_group_id and status = 'pending'
  )
  select e.earned, p.pending, (e.earned - p.pending) from e, p;
$func$;

-- 4) 신청 (교사 + 해당 오이코스 멤버만) ------------------------------------
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
  if p_amount is null or p_amount <= 0 then raise exception '달란트를 올바르게 입력해주세요.'; end if;
  if p_amount < 500 then raise exception '회식비는 최소 500달란트부터 신청할 수 있어요.'; end if;

  select available into v_avail from get_oikos_talent(p_group_id);
  if p_amount > v_avail then
    raise exception '오이코스 달란트가 부족해요. (사용 가능 %)', v_avail;
  end if;

  insert into oikos_expense_requests (group_id, requested_by, amount, purpose)
  values (p_group_id, auth.uid(), p_amount, v_purpose)
  returning id into v_id;
  return v_id;
end;
$func$;

-- 5) 우리 오이코스 신청 목록 (멤버 조회) --------------------------------------
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
    and exists (select 1 from group_members gm where gm.group_id = p_group_id and gm.user_id = auth.uid())
  order by r.created_at desc;
$func$;

-- 6) 관리자·부장: 전체 신청 ------------------------------------------------
create or replace function get_oikos_expenses_admin(p_status text default null)
returns table(id bigint, group_id bigint, group_name text, requester_nickname text, amount integer, purpose text, status text, admin_note text, created_at timestamptz)
language sql
security definer
set search_path = public
as $func$
  select r.id, r.group_id, g.name, pr.nickname, r.amount, r.purpose, r.status, r.admin_note, r.created_at
  from oikos_expense_requests r
  join groups g on g.id = r.group_id
  join profiles pr on pr.user_id = r.requested_by
  where exists (select 1 from profiles p where p.user_id = auth.uid() and (p.is_admin or p.is_department_head))
    and (p_status is null or r.status = p_status)
  order by (r.status = 'pending') desc, r.created_at desc
  limit 200;
$func$;

-- 7) 관리자·부장: 승인(=실제 차감) / 거절(=환급) / 지급완료 ------------------
create or replace function decide_oikos_expense(p_id bigint, p_action text, p_note text default null)
returns boolean
language plpgsql
security definer
set search_path = public
as $func$
declare
  v_row oikos_expense_requests;
  v_members uuid[];
  v_bal bigint[];
  v_ded bigint[];
  v_n int;
  v_i int;
  v_total bigint;
  v_remaining bigint;
  v_headcount int;
  v_share bigint;
  v_take bigint;
  v_progress boolean;
  v_today date := (now() at time zone 'Asia/Seoul')::date;
  rec record;
begin
  if not exists (select 1 from profiles p where p.user_id = auth.uid() and (p.is_admin or p.is_department_head)) then
    raise exception '권한이 없어요.';
  end if;
  select * into v_row from oikos_expense_requests where id = p_id;
  if v_row.id is null then raise exception '신청을 찾을 수 없어요.'; end if;

  if p_action = 'approve' then
    if v_row.status <> 'pending' then raise exception '이미 처리된 신청이에요.'; end if;

    select array_agg(t.user_id order by t.bal desc), array_agg(t.bal order by t.bal desc)
    into v_members, v_bal
    from (
      select gm.user_id,
        greatest(
          coalesce((select sum(pl.points) from points_ledger pl where pl.user_id = gm.user_id), 0)
          - coalesce((select sum(so.cost_snapshot) from shop_orders so
                      where so.user_id = gm.user_id and so.status in ('pending','approved','delivered')), 0)
        , 0)::bigint as bal
      from group_members gm where gm.group_id = v_row.group_id
    ) t;

    v_n := coalesce(array_length(v_members, 1), 0);
    if v_n = 0 then raise exception '오이코스에 멤버가 없어요.'; end if;
    select coalesce(sum(x), 0) into v_total from unnest(v_bal) x;
    if v_total < v_row.amount then
      raise exception '지금 오이코스원들의 달란트 합계가 부족해요. (합계 %)', v_total;
    end if;

    v_ded := array_fill(0::bigint, array[v_n]);
    v_remaining := v_row.amount;
    loop
      exit when v_remaining <= 0;
      v_headcount := 0;
      for v_i in 1..v_n loop
        if v_bal[v_i] - v_ded[v_i] > 0 then v_headcount := v_headcount + 1; end if;
      end loop;
      exit when v_headcount = 0;
      v_share := greatest(1, v_remaining / v_headcount);
      v_progress := false;
      for v_i in 1..v_n loop
        exit when v_remaining <= 0;
        if v_bal[v_i] - v_ded[v_i] > 0 then
          v_take := least(v_share, v_bal[v_i] - v_ded[v_i], v_remaining);
          if v_take > 0 then
            v_ded[v_i] := v_ded[v_i] + v_take;
            v_remaining := v_remaining - v_take;
            v_progress := true;
          end if;
        end if;
      end loop;
      exit when not v_progress;
    end loop;

    for v_i in 1..v_n loop
      if v_ded[v_i] > 0 then
        insert into points_ledger (user_id, action_type, points, ref_date, note, awarded_by)
        values (v_members[v_i], 'oikos_expense', -v_ded[v_i], v_today,
                '오이코스 회식비', auth.uid())
        on conflict (user_id, action_type, ref_date) where action_type <> 'admin_award'
        do update set points = points_ledger.points + excluded.points;
        insert into oikos_expense_deductions (expense_id, user_id, amount)
        values (p_id, v_members[v_i], v_ded[v_i]);
      end if;
    end loop;

    update oikos_expense_requests
      set status = 'approved', admin_note = nullif(trim(p_note), ''), decided_by = auth.uid(), decided_at = now()
    where id = p_id;

  elsif p_action = 'reject' then
    if v_row.status not in ('pending', 'approved') then raise exception '이미 처리된 신청이에요.'; end if;
    if v_row.status = 'approved' then
      for rec in select user_id, amount from oikos_expense_deductions where expense_id = p_id loop
        insert into points_ledger (user_id, action_type, points, ref_date, note, awarded_by)
        values (rec.user_id, 'oikos_expense', rec.amount, v_today, '오이코스 회식비 취소 환급', auth.uid())
        on conflict (user_id, action_type, ref_date) where action_type <> 'admin_award'
        do update set points = points_ledger.points + excluded.points;
      end loop;
      delete from oikos_expense_deductions where expense_id = p_id;
    end if;
    update oikos_expense_requests
      set status = 'rejected', admin_note = nullif(trim(p_note), ''), decided_by = auth.uid(), decided_at = now()
    where id = p_id;

  elsif p_action = 'pay' then
    if v_row.status <> 'approved' then raise exception '승인된 신청만 지급완료로 바꿀 수 있어요.'; end if;
    update oikos_expense_requests
      set status = 'paid', decided_by = auth.uid(), decided_at = now()
    where id = p_id;

  else
    raise exception '잘못된 동작이에요.';
  end if;
  return true;
end;
$func$;

select 'oikos_expense (모델 A: 개인 달란트 실제 차감) 생성 완료' as status;
