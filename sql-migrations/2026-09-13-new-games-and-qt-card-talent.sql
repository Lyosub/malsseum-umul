-- 2026-09-13  새 게임 2종 + 오늘의 QT 확장 + 말씀 카드 달란트
--
-- 규칙(전도사님 확정):
--  · 오늘의 말씀 외우기 게임: 하루 첫 완주 +2 (verse_memory)
--  · 성경 인물 초성 퀴즈: 하루 첫 완료 +2 (chosung_quiz)
--  · 오늘의 QT "오늘의 실천" 한 줄 기록: 성의 있게 쓰면 하루 +1 (qt_reflection), 계정(DB) 저장
--  · 묵상(devotion) 7일 연속마다 +1 보너스 (devotion_streak) — 출석 streak_bonus 와 동일 방식
--  · 말씀 카드: 하루/주간/월간 카드를 각 기간에 처음 뽑으면 +1 (verse_card_daily/weekly/monthly)
--    (다운로드에는 달란트 없음)
--
-- 적립은 기존 패턴 그대로: points_ledger 에 insert ... on conflict
--   (user_id, action_type, ref_date) where action_type <> 'admin_award' do nothing.
--   이 predicate 는 부분 유니크 인덱스 points_ledger_auto_uniq 와 정확히 일치해야 한다.
-- 재실행 안전: create table if not exists / create or replace.

-- ─────────────────────────────────────────────────────────────
-- 0) points_ledger.action_type CHECK 화이트리스트에 새 유형 추가
--    (verse_memory, chosung_quiz, qt_reflection, devotion_streak,
--     verse_card_daily/weekly/monthly)
-- ─────────────────────────────────────────────────────────────
alter table public.points_ledger drop constraint if exists points_ledger_action_type_check;
alter table public.points_ledger add constraint points_ledger_action_type_check
  check (action_type = any (array[
    'attendance','streak_bonus','note','quiz','group_attendance_bonus','group_notes_bonus',
    'admin_award','greeting_draw','book_game','book_game_ot','book_game_nt',
    'match_game_books','match_game_figures','oikos_expense','badge_award','devotion',
    'oikos_donation','oikos_distribute',
    'verse_memory','chosung_quiz','qt_reflection','devotion_streak',
    'verse_card_daily','verse_card_weekly','verse_card_monthly'
  ]));

-- ─────────────────────────────────────────────────────────────
-- 1) 오늘의 QT "오늘의 실천" 기록 테이블 (1인 1일 1행)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.qt_reflections (
  user_id    uuid not null references auth.users(id) on delete cascade,
  ref_date   date not null,
  body       text not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, ref_date)
);

alter table public.qt_reflections enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='qt_reflections' and policyname='qt_reflections_select_own') then
    create policy qt_reflections_select_own on public.qt_reflections
      for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='qt_reflections' and policyname='qt_reflections_write_own') then
    create policy qt_reflections_write_own on public.qt_reflections
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

-- ─────────────────────────────────────────────────────────────
-- 2) 묵상 7일 연속 보너스 — 트리거 함수 교체 (출석 보너스와 동일 로직)
-- ─────────────────────────────────────────────────────────────
create or replace function public.award_devotion_points()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_streak integer := 1;
  v_check  date := new.date - 1;
begin
  insert into points_ledger (user_id, action_type, points, ref_date)
  values (new.user_id, 'devotion', 1, new.date)
  on conflict (user_id, action_type, ref_date) where action_type <> 'admin_award' do nothing;

  while exists (select 1 from devotion_checkins where user_id = new.user_id and date = v_check) loop
    v_streak := v_streak + 1;
    v_check := v_check - 1;
  end loop;

  if v_streak % 7 = 0 then
    insert into points_ledger (user_id, action_type, points, ref_date)
    values (new.user_id, 'devotion_streak', 1, new.date)
    on conflict (user_id, action_type, ref_date) where action_type <> 'admin_award' do nothing;
  end if;

  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- 3) 오늘의 말씀 외우기 게임 — 하루 첫 완주 +2
-- ─────────────────────────────────────────────────────────────
create or replace function public.submit_verse_memory_game()
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_today date := (now() at time zone 'Asia/Seoul')::date;
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;
  insert into points_ledger (user_id, action_type, points, ref_date)
  values (auth.uid(), 'verse_memory', 2, v_today)
  on conflict (user_id, action_type, ref_date) where action_type <> 'admin_award' do nothing;
  return case when found then 2 else 0 end;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- 4) 성경 인물 초성 퀴즈 — 하루 첫 완료 +2 (맞은 개수는 참고용)
-- ─────────────────────────────────────────────────────────────
create or replace function public.submit_chosung_quiz(p_correct integer)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_today date := (now() at time zone 'Asia/Seoul')::date;
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;
  if p_correct is null or p_correct < 0 or p_correct > 50 then
    raise exception '잘못된 점수입니다.';
  end if;
  insert into points_ledger (user_id, action_type, points, ref_date)
  values (auth.uid(), 'chosung_quiz', 2, v_today)
  on conflict (user_id, action_type, ref_date) where action_type <> 'admin_award' do nothing;
  return case when found then 2 else 0 end;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- 5) 오늘의 QT "오늘의 실천" 저장 — 성의 있게 쓰면 하루 +1
-- ─────────────────────────────────────────────────────────────
create or replace function public.save_qt_reflection(p_text text)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_today date := (now() at time zone 'Asia/Seoul')::date;
  v_body  text := btrim(coalesce(p_text, ''));
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;
  if char_length(v_body) < 4 then
    raise exception '실천할 내용을 한 줄이라도 적어주세요.';
  end if;

  insert into qt_reflections (user_id, ref_date, body, updated_at)
  values (auth.uid(), v_today, left(v_body, 500), now())
  on conflict (user_id, ref_date) do update
    set body = excluded.body, updated_at = now();

  insert into points_ledger (user_id, action_type, points, ref_date)
  values (auth.uid(), 'qt_reflection', 1, v_today)
  on conflict (user_id, action_type, ref_date) where action_type <> 'admin_award' do nothing;

  return case when found then 1 else 0 end;
end;
$$;

create or replace function public.get_qt_reflection()
returns text
language sql
security definer
set search_path to 'public'
as $$
  select body from qt_reflections
  where user_id = auth.uid()
    and ref_date = (now() at time zone 'Asia/Seoul')::date;
$$;

-- ─────────────────────────────────────────────────────────────
-- 6) 말씀 카드 뽑기 달란트 — 각 기간 첫 뽑기 +1
--    ref_date 를 기간의 시작일로 넣어 자연 상한: 하루=오늘, 주간=그 주 월요일, 월간=그 달 1일
-- ─────────────────────────────────────────────────────────────
create or replace function public.claim_verse_card(p_kind text)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_today date := (now() at time zone 'Asia/Seoul')::date;
  v_ref   date;
  v_act   text;
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;
  if p_kind not in ('daily', 'weekly', 'monthly') then
    raise exception '잘못된 카드 종류입니다.';
  end if;

  v_ref := case p_kind
    when 'daily'   then v_today
    when 'weekly'  then (date_trunc('week',  v_today))::date
    when 'monthly' then (date_trunc('month', v_today))::date
  end;
  v_act := 'verse_card_' || p_kind;

  insert into points_ledger (user_id, action_type, points, ref_date)
  values (auth.uid(), v_act, 1, v_ref)
  on conflict (user_id, action_type, ref_date) where action_type <> 'admin_award' do nothing;

  return case when found then 1 else 0 end;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- 7) 놀이터 "나의 도전 기록"용 오늘 상태
-- ─────────────────────────────────────────────────────────────
create or replace function public.get_daily_game_status()
returns table (verse_memory_done boolean, chosung_done boolean)
language sql
security definer
set search_path to 'public'
as $$
  select
    exists (select 1 from points_ledger where user_id = auth.uid()
            and action_type = 'verse_memory'
            and ref_date = (now() at time zone 'Asia/Seoul')::date),
    exists (select 1 from points_ledger where user_id = auth.uid()
            and action_type = 'chosung_quiz'
            and ref_date = (now() at time zone 'Asia/Seoul')::date);
$$;

grant execute on function public.submit_verse_memory_game()      to authenticated;
grant execute on function public.submit_chosung_quiz(integer)    to authenticated;
grant execute on function public.save_qt_reflection(text)        to authenticated;
grant execute on function public.get_qt_reflection()             to authenticated;
grant execute on function public.claim_verse_card(text)          to authenticated;
grant execute on function public.get_daily_game_status()         to authenticated;
