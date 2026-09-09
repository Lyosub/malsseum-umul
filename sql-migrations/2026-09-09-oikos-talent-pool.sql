-- 2026-09-09  오이코스 달란트를 "개인 달란트 합계"에서 → 별도 공동 곳간(풀)으로 전환
--
-- 결정(전도사님):
--  · 주간 챌린지 보너스(출석 80% / 기록 챌린지)는 앞으로 개인 달란트가 아니라 오이코스 풀로만 들어간다.
--    (5인 오이코스 출석챌린지 = 풀 +5, 기록챌린지 = 풀 +10 = 인원수 × 1/2)
--  · 개인이 자기 달란트를 오이코스 풀에 기부할 수 있다. 되돌리기 불가, 기부자 닉네임 공개, 최소 10.
--  · 회식비는 이제 풀에서만 차감한다(개인 달란트는 안 건드림). 기존 균등분배 루프 제거.
--  · 기존에 개인이 이미 받은 챌린지 보너스(현재까지 11달란트)는 그대로 두고 풀은 0부터 시작.
--
-- 재실행 안전(idempotent): create table if not exists / drop function 후 재생성 / on conflict do nothing.
-- 앞선 2026-09-09-oikos-talent-breakdown.sql 의 from_personal/from_group 반환은 이 파일이 대체한다.

-- 1) points_ledger CHECK 에 oikos_donation 추가 (기존 값 전부 유지) ----------------
alter table points_ledger drop constraint if exists points_ledger_action_type_check;
alter table points_ledger add constraint points_ledger_action_type_check check (
  action_type = any (array[
    'attendance','streak_bonus','note','quiz','group_attendance_bonus','group_notes_bonus',
    'admin_award','greeting_draw','book_game','book_game_ot','book_game_nt',
    'match_game_books','match_game_figures','oikos_expense','badge_award','devotion',
    'oikos_donation'
  ])
);

-- 2) 공동 곳간 원장 -------------------------------------------------------------
create table if not exists oikos_talent_ledger (
  id bigint generated always as identity primary key,
  group_id bigint not null references groups(id) on delete cascade,
  kind text not null check (kind in (
    'donation','challenge_attendance','challenge_notes','expense','expense_refund','admin_adjust'
  )),
  points integer not null,                       -- 부호 있음: +기부/+챌린지/+환급, -회식비
  member_id uuid references auth.users(id) on delete set null,  -- 기부자 (kind='donation' 일 때만)
  note text,
  ref_key text,                                  -- 멱등 키 (챌린지: 'attendance:2026-09-01' 등)
  created_at timestamptz not null default now()
);
create index if not exists oikos_talent_ledger_group_idx on oikos_talent_ledger (group_id, created_at desc);
create unique index if not exists oikos_talent_ledger_refkey_uniq
  on oikos_talent_ledger (group_id, kind, ref_key) where ref_key is not null;

alter table oikos_talent_ledger enable row level security;
drop policy if exists "오이코스 곳간 조회" on oikos_talent_ledger;
create policy "오이코스 곳간 조회" on oikos_talent_ledger for select using (
  exists (select 1 from group_members gm where gm.group_id = oikos_talent_ledger.group_id and gm.user_id = auth.uid())
  or exists (select 1 from profiles p where p.user_id = auth.uid() and (p.is_admin or p.is_department_head))
);
-- 쓰기는 전부 security definer 함수로만. 직접 insert/update/delete 정책 없음.

-- 3) 이전 정산분 마커: 이미 개인에게 지급된 주(week)들은 풀 재정산에서 제외 ----------
--    points = 0 짜리 마커 행을 넣어 ref_key 를 선점 → evaluate_group_weekly_bonus 가
--    과거 주차를 풀에 소급 지급하지 않게 한다.
insert into oikos_talent_ledger (group_id, kind, points, note, ref_key)
select gm.group_id, 'challenge_attendance', 0, '이전 정산분(개인 지급 완료)', 'attendance:' || pl.ref_date::text
from points_ledger pl
join group_members gm on gm.user_id = pl.user_id
where pl.action_type = 'group_attendance_bonus'
group by gm.group_id, pl.ref_date
on conflict (group_id, kind, ref_key) where ref_key is not null do nothing;

insert into oikos_talent_ledger (group_id, kind, points, note, ref_key)
select gm.group_id, 'challenge_notes', 0, '이전 정산분(개인 지급 완료)', 'notes:' || pl.ref_date::text
from points_ledger pl
join group_members gm on gm.user_id = pl.user_id
where pl.action_type = 'group_notes_bonus'
group by gm.group_id, pl.ref_date
on conflict (group_id, kind, ref_key) where ref_key is not null do nothing;

-- 4) 기부: 개인 달란트 → 오이코스 풀 ------------------------------------------
drop function if exists donate_to_oikos(bigint, integer);
create or replace function donate_to_oikos(p_group_id bigint, p_amount integer)
returns bigint
language plpgsql
security definer
set search_path = public
as $func$
declare
  v_avail bigint;
  v_today date := (now() at time zone 'Asia/Seoul')::date;
  v_id bigint;
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;
  if not exists (select 1 from group_members where group_id = p_group_id and user_id = auth.uid()) then
    raise exception '내가 속한 오이코스에만 기부할 수 있어요.';
  end if;
  if p_amount is null or p_amount < 10 then
    raise exception '최소 10달란트부터 기부할 수 있어요.';
  end if;

  select greatest(
    coalesce((select sum(points) from points_ledger where user_id = auth.uid()), 0)
    - coalesce((select sum(cost_snapshot) from shop_orders
                where user_id = auth.uid() and status in ('pending','approved','delivered')), 0)
  , 0) into v_avail;

  if p_amount > v_avail then
    raise exception '내 달란트가 부족해요. (사용 가능 %)', v_avail;
  end if;

  -- 개인 달란트 차감 (같은 날 여러 번 기부하면 한 행에 합산 — 인덱스 predicate 와 정확히 일치)
  insert into points_ledger (user_id, action_type, points, ref_date, note)
  values (auth.uid(), 'oikos_donation', -p_amount, v_today, '오이코스 달란트 기부')
  on conflict (user_id, action_type, ref_date) where action_type <> 'admin_award'
  do update set points = points_ledger.points + excluded.points;

  insert into oikos_talent_ledger (group_id, kind, points, member_id, note)
  values (p_group_id, 'donation', p_amount, auth.uid(), '기부')
  returning id into v_id;

  return v_id;
end;
$func$;

-- 5) 곳간 내역 (기부/챌린지/회식비 로그) ------------------------------------
drop function if exists get_oikos_talent_log(bigint, integer);
create or replace function get_oikos_talent_log(p_group_id bigint, p_limit integer default 20)
returns table(id bigint, kind text, points integer, member_nickname text, note text, created_at timestamptz)
language sql
security definer
set search_path = public
as $func$
  select l.id, l.kind, l.points,
    case when l.kind = 'donation' then coalesce(pr.nickname, '누군가') else null end as member_nickname,
    l.note, l.created_at
  from oikos_talent_ledger l
  left join profiles pr on pr.user_id = l.member_id
  where l.group_id = p_group_id
    and l.points <> 0
    and exists (select 1 from group_members gm where gm.group_id = p_group_id and gm.user_id = auth.uid())
  order by l.created_at desc
  limit p_limit;
$func$;

-- 6) 오이코스 달란트 현황 = 풀 원장 기준 -----------------------------------
drop function if exists get_oikos_talent(bigint);
create or replace function get_oikos_talent(p_group_id bigint)
returns table(
  pool bigint,           -- 오이코스 달란트 잔액 (원장 합계)
  pending bigint,        -- 승인 대기 회식비
  available bigint,      -- pool - pending
  from_donation bigint,  -- 기부로 들어온 누적
  from_challenge bigint, -- 챌린지로 들어온 누적
  earned bigint          -- 하위호환: pool 과 동일값 (기존 호출부가 earned 를 읽던 것 대비)
)
language sql
security definer
set search_path = public
as $func$
  with l as (
    select
      coalesce(sum(points), 0)::bigint as pool,
      coalesce(sum(points) filter (where kind = 'donation'), 0)::bigint as from_donation,
      coalesce(sum(points) filter (where kind in ('challenge_attendance','challenge_notes')), 0)::bigint as from_challenge
    from oikos_talent_ledger where group_id = p_group_id
  ),
  p as (
    select coalesce(sum(amount), 0)::bigint as pending
    from oikos_expense_requests
    where group_id = p_group_id and status = 'pending'
  )
  select l.pool, p.pending, (l.pool - p.pending) as available,
         l.from_donation, l.from_challenge, l.pool as earned
  from l, p;
$func$;

-- 7) 주간 챌린지 보너스 → 개인이 아니라 풀로 -----------------------------
create or replace function evaluate_group_weekly_bonus(p_group_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $func$
declare
  v_week_start date := date_trunc('week', (now() at time zone 'Asia/Seoul')::date)::date - 7;
  v_week_end date := date_trunc('week', (now() at time zone 'Asia/Seoul')::date)::date - 1;
  v_member_count int;
  v_attended_count int;
  v_min_ok_count int;
  v_total_notes int;
  v_host_is_teacher boolean;
begin
  if not exists (select 1 from group_members where group_id = p_group_id and user_id = auth.uid()) then
    return;
  end if;

  select coalesce(p.is_teacher, false) into v_host_is_teacher
  from groups g join profiles p on p.user_id = g.created_by
  where g.id = p_group_id;
  if not v_host_is_teacher then return; end if;

  select count(*) into v_member_count from group_members where group_id = p_group_id;
  if v_member_count = 0 then return; end if;

  select count(distinct gm.user_id) into v_attended_count
  from group_members gm
  where gm.group_id = p_group_id
    and exists (select 1 from attendance a
                where a.user_id = gm.user_id and a.date between v_week_start and v_week_end);

  select count(*) into v_min_ok_count
  from group_members gm
  where gm.group_id = p_group_id
    and exists (select 1 from notes n
                where n.user_id = gm.user_id and n.type in ('gratitude','prayer')
                  and (n.created_at at time zone 'Asia/Seoul')::date between v_week_start and v_week_end);

  select count(*) into v_total_notes
  from notes n
  join group_members gm on gm.user_id = n.user_id
  where gm.group_id = p_group_id
    and n.type in ('gratitude','prayer')
    and (n.created_at at time zone 'Asia/Seoul')::date between v_week_start and v_week_end;

  if v_attended_count::numeric / v_member_count >= 0.8 then
    insert into oikos_talent_ledger (group_id, kind, points, note, ref_key)
    values (p_group_id, 'challenge_attendance', v_member_count * 1,
            '주간 출석 챌린지 (' || v_week_start || ')', 'attendance:' || v_week_start::text)
    on conflict (group_id, kind, ref_key) where ref_key is not null do nothing;
  end if;

  if v_min_ok_count = v_member_count and v_total_notes >= 10 then
    insert into oikos_talent_ledger (group_id, kind, points, note, ref_key)
    values (p_group_id, 'challenge_notes', v_member_count * 2,
            '주간 기록 챌린지 (' || v_week_start || ')', 'notes:' || v_week_start::text)
    on conflict (group_id, kind, ref_key) where ref_key is not null do nothing;
  end if;
end;
$func$;

-- 8) 회식비 승인/거절 → 풀에서 차감/환급 (개인 달란트 분배 루프 제거) ----------
create or replace function decide_oikos_expense(p_id bigint, p_action text, p_note text default null)
returns boolean
language plpgsql
security definer
set search_path = public
as $func$
declare
  v_row oikos_expense_requests;
  v_pool bigint;
begin
  if not exists (select 1 from profiles p where p.user_id = auth.uid() and (p.is_admin or p.is_department_head)) then
    raise exception '권한이 없어요.';
  end if;

  select * into v_row from oikos_expense_requests where id = p_id;
  if v_row.id is null then raise exception '신청을 찾을 수 없어요.'; end if;

  if p_action = 'approve' then
    if v_row.status <> 'pending' then raise exception '이미 처리된 신청이었어요.'; end if;
    select coalesce(sum(points), 0) into v_pool from oikos_talent_ledger where group_id = v_row.group_id;
    if v_pool < v_row.amount then
      raise exception '오이코스 달란트가 부족해요. (잔액 %)', v_pool;
    end if;
    insert into oikos_talent_ledger (group_id, kind, points, note)
    values (v_row.group_id, 'expense', -v_row.amount, '오이코스 회식비: ' || coalesce(v_row.purpose, ''));
    update oikos_expense_requests
      set status = 'approved', admin_note = nullif(trim(p_note), ''), decided_by = auth.uid(), decided_at = now()
      where id = p_id;

  elsif p_action = 'reject' then
    if v_row.status not in ('pending','approved') then raise exception '이미 처리된 신청이었어요.'; end if;
    if v_row.status = 'approved' then
      insert into oikos_talent_ledger (group_id, kind, points, note)
      values (v_row.group_id, 'expense_refund', v_row.amount, '오이코스 회식비 취소 환급');
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
    raise exception '잘못된 동작이었어요.';
  end if;

  return true;
end;
$func$;
