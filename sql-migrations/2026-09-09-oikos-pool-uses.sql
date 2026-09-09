-- 2026-09-09  오이코스 곳간 달란트 활용 수단 3가지
--   1) 곳간 → 개인 나눠주기 (교사 재량 분배)
--   2) 오이코스 공동 상품 교환 (곳간 전용 상점 — 회식비 신청 인프라 재사용)
--   3) 회식비 최소 신청액 500 → 300
--
-- 재실행 안전: add column if not exists / drop function 후 재생성 / CHECK 갈아끼우기.

-- ============ 공통: CHECK 확장 ============
alter table points_ledger drop constraint if exists points_ledger_action_type_check;
alter table points_ledger add constraint points_ledger_action_type_check check (
  action_type = any (array[
    'attendance','streak_bonus','note','quiz','group_attendance_bonus','group_notes_bonus',
    'admin_award','greeting_draw','book_game','book_game_ot','book_game_nt',
    'match_game_books','match_game_figures','oikos_expense','badge_award','devotion',
    'oikos_donation','oikos_distribute'
  ])
);

alter table oikos_talent_ledger drop constraint if exists oikos_talent_ledger_kind_check;
alter table oikos_talent_ledger add constraint oikos_talent_ledger_kind_check check (
  kind in ('donation','challenge_attendance','challenge_notes','expense','expense_refund','admin_adjust','distribute')
);

-- ============ 1) 곳간 → 개인 나눠주기 ============
-- 교사가 자기 오이코스 곳간에서 달란트를 꺼내 오이코스원 개인 달란트로 지급한다.
-- p_user_id 지정 시 그 한 명에게, 없으면 전원에게 p_amount 씩.
drop function if exists distribute_oikos_pool(bigint, integer, uuid, text);
create or replace function distribute_oikos_pool(
  p_group_id bigint,
  p_amount integer,
  p_user_id uuid default null,
  p_note text default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $func$
declare
  v_is_teacher boolean;
  v_pool bigint;
  v_recipients uuid[];
  v_total bigint;
  v_today date := (now() at time zone 'Asia/Seoul')::date;
  v_note text := coalesce(nullif(trim(p_note), ''), '오이코스 곳간에서 나눔');
  r uuid;
  v_count integer := 0;
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;
  select coalesce(is_teacher, false) into v_is_teacher from profiles where user_id = auth.uid();
  if not v_is_teacher then raise exception '교사만 나눠줄 수 있어요.'; end if;
  if not exists (select 1 from group_members where group_id = p_group_id and user_id = auth.uid()) then
    raise exception '내가 속한 오이코스만 가능해요.';
  end if;
  if p_amount is null or p_amount <= 0 then raise exception '0보다 큰 달란트를 입력해주세요.'; end if;

  if p_user_id is not null then
    if not exists (select 1 from group_members where group_id = p_group_id and user_id = p_user_id) then
      raise exception '그 학생은 이 오이코스 멤버가 아니에요.';
    end if;
    v_recipients := array[p_user_id];
  else
    select array_agg(user_id) into v_recipients from group_members where group_id = p_group_id;
  end if;

  v_total := p_amount::bigint * coalesce(array_length(v_recipients, 1), 0);
  if v_total = 0 then raise exception '받을 사람이 없어요.'; end if;

  select coalesce(sum(points), 0) into v_pool from oikos_talent_ledger where group_id = p_group_id;
  if v_pool < v_total then
    raise exception '곳간 달란트가 부족해요. (곳간 % / 필요 %)', v_pool, v_total;
  end if;

  insert into oikos_talent_ledger (group_id, kind, points, note)
  values (p_group_id, 'distribute', -v_total, v_note);

  foreach r in array v_recipients loop
    insert into points_ledger (user_id, action_type, points, ref_date, note, awarded_by)
    values (r, 'oikos_distribute', p_amount, v_today, v_note, auth.uid())
    on conflict (user_id, action_type, ref_date) where action_type <> 'admin_award'
    do update set points = points_ledger.points + excluded.points;
    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$func$;

-- ============ 2) 오이코스 공동 상점 ============
alter table shop_items add column if not exists is_oikos boolean not null default false;
alter table oikos_expense_requests add column if not exists item_id bigint references shop_items(id) on delete set null;

-- 개인 달란트 상점에서는 오이코스 전용 상품을 숨긴다. 관리자(p_all)는 전부 본다.
-- 반환에 is_oikos 추가.
drop function if exists get_shop_items(boolean);
create or replace function get_shop_items(p_all boolean default false)
returns table(id bigint, name text, description text, cost integer, stock integer, is_active boolean, sort_order integer, is_oikos boolean)
language sql
security definer
set search_path = public
as $func$
  select i.id, i.name, i.description, i.cost, i.stock, i.is_active, i.sort_order, coalesce(i.is_oikos, false)
  from shop_items i
  where auth.uid() is not null
    and (
      (not p_all and i.is_active and not coalesce(i.is_oikos, false))
      or (p_all and exists (select 1 from profiles p where p.user_id = auth.uid() and (p.is_admin or p.is_department_head)))
    )
  order by i.sort_order, i.id;
$func$;

-- 오이코스 상점: 로그인한 사람은 목록 조회 가능(교사만 신청)
drop function if exists get_oikos_shop_items();
create or replace function get_oikos_shop_items()
returns table(id bigint, name text, description text, cost integer, sort_order integer)
language sql
security definer
set search_path = public
as $func$
  select i.id, i.name, i.description, i.cost, i.sort_order
  from shop_items i
  where auth.uid() is not null and i.is_active and coalesce(i.is_oikos, false)
  order by i.sort_order, i.id;
$func$;

-- 오이코스 상품 신청 = 회식비 신청과 같은 흐름(oikos_expense_requests). 금액은 상품가로 고정,
-- 목적은 "[상품] 이름", item_id 기록. 승인/거절/지급은 기존 decide_oikos_expense 가 그대로 처리.
drop function if exists request_oikos_shop_order(bigint, bigint);
create or replace function request_oikos_shop_order(p_group_id bigint, p_item_id bigint)
returns bigint
language plpgsql
security definer
set search_path = public
as $func$
declare
  v_is_teacher boolean;
  v_item shop_items;
  v_avail bigint;
  v_id bigint;
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;
  select coalesce(is_teacher, false) into v_is_teacher from profiles where user_id = auth.uid();
  if not v_is_teacher then raise exception '교사만 신청할 수 있어요.'; end if;
  if not exists (select 1 from group_members where group_id = p_group_id and user_id = auth.uid()) then
    raise exception '내가 속한 오이코스만 신청할 수 있어요.';
  end if;

  select * into v_item from shop_items where id = p_item_id;
  if v_item.id is null or not v_item.is_active or not coalesce(v_item.is_oikos, false) then
    raise exception '신청할 수 없는 상품이에요.';
  end if;

  select available into v_avail from get_oikos_talent(p_group_id);
  if v_item.cost > v_avail then
    raise exception '곳간 달란트가 부족해요. (사용 가능 %)', v_avail;
  end if;

  insert into oikos_expense_requests (group_id, requested_by, amount, purpose, item_id)
  values (p_group_id, auth.uid(), v_item.cost, '[상품] ' || v_item.name, p_item_id)
  returning id into v_id;
  return v_id;
end;
$func$;

-- ============ 3) 회식비 최소 500 → 300 ============
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
  if p_amount is null or p_amount <= 0 then raise exception '달란트를 바르게 입력해주세요.'; end if;
  if p_amount < 300 then raise exception '회식비는 최소 300달란트부터 신청할 수 있어요.'; end if;
  select available into v_avail from get_oikos_talent(p_group_id);
  if p_amount > v_avail then raise exception '곳간 달란트가 부족해요. (사용 가능 %)', v_avail; end if;
  insert into oikos_expense_requests (group_id, requested_by, amount, purpose)
  values (p_group_id, auth.uid(), p_amount, v_purpose) returning id into v_id;
  return v_id;
end;
$func$;
