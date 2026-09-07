-- 2026-09-07 : 주간 묵상(QT) 체크인
--   교사/관리자가 이번 주 본문 + 묵상 질문을 등록 → 학생이 "오늘 묵상했어요" 체크(하루 1번) → +1 달란트
--   출석 체크인(attendance)과 같은 구조. 연속 일수도 셈.
--
-- 안전성: points_ledger CHECK 는 IN 리스트에 'devotion'만 추가(순수 확장).
--   자동중복방지 인덱스(where action_type <> 'admin_award')는 그대로 → 아래 on conflict predicate와 정확히 일치(42P10 무관).

------------------------------------------------------------
-- (1) 테이블
------------------------------------------------------------
create table if not exists devotions (
  id bigint generated always as identity primary key,
  week_start date not null unique,           -- 해당 주 월요일(KST)
  scripture_ref text not null,
  scripture_text text not null,
  prompts jsonb not null default '[]'::jsonb, -- ["질문1","질문2",...]
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table devotions enable row level security;

drop policy if exists "묵상은 누구나 조회" on devotions;
create policy "묵상은 누구나 조회" on devotions for select using (true);

create table if not exists devotion_checkins (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  created_at timestamptz not null default now(),
  primary key (user_id, date)
);
alter table devotion_checkins enable row level security;

drop policy if exists "본인 묵상체크만 조회" on devotion_checkins;
create policy "본인 묵상체크만 조회" on devotion_checkins for select using (auth.uid() = user_id);

------------------------------------------------------------
-- (2) points_ledger 에 devotion 허용
------------------------------------------------------------
alter table points_ledger drop constraint if exists points_ledger_action_type_check;
alter table points_ledger add constraint points_ledger_action_type_check
  check (action_type in (
    'attendance','streak_bonus','note','quiz',
    'group_attendance_bonus','group_notes_bonus','admin_award','greeting_draw',
    'book_game','book_game_ot','book_game_nt',
    'match_game_books','match_game_figures',
    'oikos_expense','badge_award','devotion'
  ));

------------------------------------------------------------
-- (3) 체크인 시 +1 달란트 (트리거)
------------------------------------------------------------
create or replace function award_devotion_points()
returns trigger
language plpgsql
security definer
set search_path = public
as $func$
begin
  insert into points_ledger (user_id, action_type, points, ref_date)
  values (new.user_id, 'devotion', 1, new.date)
  on conflict (user_id, action_type, ref_date) where action_type <> 'admin_award' do nothing;
  return new;
end;
$func$;

drop trigger if exists trg_devotion_points on devotion_checkins;
create trigger trg_devotion_points
  after insert on devotion_checkins
  for each row execute function award_devotion_points();

------------------------------------------------------------
-- (4) RPC
------------------------------------------------------------
-- 이번 주 묵상 (없으면 빈 행 없음)
create or replace function get_current_devotion()
returns table(week_start date, scripture_ref text, scripture_text text, prompts jsonb)
language sql
security definer
set search_path = public
as $func$
  select d.week_start, d.scripture_ref, d.scripture_text, d.prompts
  from devotions d
  where d.week_start = ((now() at time zone 'Asia/Seoul')::date
                        - (extract(isodow from (now() at time zone 'Asia/Seoul'))::int - 1))
  limit 1;
$func$;
grant execute on function get_current_devotion() to anon, authenticated;

-- 오늘 묵상 체크 (하루 1번). 새로 체크되면 true, 이미 했으면 false.
create or replace function checkin_devotion()
returns boolean
language plpgsql
security definer
set search_path = public
as $func$
declare
  v_today date := (now() at time zone 'Asia/Seoul')::date;
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;
  insert into devotion_checkins (user_id, date) values (auth.uid(), v_today)
  on conflict (user_id, date) do nothing;
  return found;
end;
$func$;
grant execute on function checkin_devotion() to authenticated;

-- 내 묵상 현황: 오늘 했는지 / 연속 일수 / 누적
create or replace function get_my_devotion_status()
returns table(checked_today boolean, streak integer, total integer)
language plpgsql
security definer
set search_path = public
as $func$
declare
  uid uuid := auth.uid();
  v_today date := (now() at time zone 'Asia/Seoul')::date;
  v_cur integer := 0;
  v_prev date;
begin
  if uid is null then raise exception '로그인이 필요합니다.'; end if;

  if exists (select 1 from devotion_checkins where user_id = uid and date = v_today) then
    v_prev := v_today;
  elsif exists (select 1 from devotion_checkins where user_id = uid and date = v_today - 1) then
    v_prev := v_today - 1;
  else
    v_prev := null;
  end if;

  while v_prev is not null and exists (select 1 from devotion_checkins where user_id = uid and date = v_prev) loop
    v_cur := v_cur + 1;
    v_prev := v_prev - 1;
  end loop;

  return query select
    exists (select 1 from devotion_checkins where user_id = uid and date = v_today),
    v_cur,
    (select count(*)::integer from devotion_checkins where user_id = uid);
end;
$func$;
grant execute on function get_my_devotion_status() to authenticated;

-- 관리자: 이번 주 묵상 등록/수정
create or replace function upsert_devotion(p_week_start date, p_ref text, p_text text, p_prompts jsonb)
returns bigint
language plpgsql
security definer
set search_path = public
as $func$
declare
  v_ref text := nullif(trim(p_ref), '');
  v_text text := nullif(trim(p_text), '');
  v_id bigint;
begin
  if not exists (select 1 from profiles p where p.user_id = auth.uid()
                 and (p.is_admin or p.is_teacher or p.is_department_head)) then
    raise exception '권한이 없어요.';
  end if;
  if p_week_start is null then raise exception '주(week_start)를 지정해주세요.'; end if;
  if v_ref is null then raise exception '본문 구절 표기를 입력해주세요.'; end if;
  if v_text is null then raise exception '본문 내용을 입력해주세요.'; end if;

  insert into devotions (week_start, scripture_ref, scripture_text, prompts, created_by)
  values (p_week_start, v_ref, v_text, coalesce(p_prompts, '[]'::jsonb), auth.uid())
  on conflict (week_start) do update
    set scripture_ref = excluded.scripture_ref,
        scripture_text = excluded.scripture_text,
        prompts = excluded.prompts,
        updated_at = now()
  returning id into v_id;
  return v_id;
end;
$func$;
grant execute on function upsert_devotion(date, text, text, jsonb) to authenticated;

-- 관리자: 최근 묵상 목록 + 각 주 체크인 인원
create or replace function get_devotions_admin()
returns table(week_start date, scripture_ref text, checkin_people bigint, updated_at timestamptz)
language plpgsql
security definer
set search_path = public
as $func$
begin
  if not exists (select 1 from profiles p where p.user_id = auth.uid()
                 and (p.is_admin or p.is_teacher or p.is_department_head)) then
    raise exception '권한이 없어요.';
  end if;
  return query
    select d.week_start, d.scripture_ref,
      (select count(distinct c.user_id) from devotion_checkins c
       where c.date >= d.week_start and c.date < d.week_start + 7) as checkin_people,
      d.updated_at
    from devotions d
    order by d.week_start desc
    limit 12;
end;
$func$;
grant execute on function get_devotions_admin() to authenticated;

select 'devotions + devotion_checkins + 트리거 + RPC 5개 + points_ledger CHECK 확장 완료' as status;
