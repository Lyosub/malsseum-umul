-- 2026-09-18  말씀놀이터 전체 랭킹 (최고 기록 기준)
--
-- 전도사님 결정: "최고 기록만" — 누적 참여 횟수가 아니라 잘한 기록순으로 줄세운다.
--
-- 현재 상태 진단
--  · 성경책 순서 맞추기 / 같은 성경 찾기 → best_time_ms 저장됨, 게임 안에 순위 이미 있음
--  · 말씀 빈칸 채우기 → oikos_verse_game 에 하루별 correct_count 남아있음(순위 함수는 없었음)
--  · 성경 O/X / 초성 퀴즈 → p_correct 를 받아놓고 **버리고 있었다.** 점수 저장을 새로 만든다.
--    (그래서 이 두 게임만 오늘부터 0에서 시작한다. 과거 점수는 복구 불가)
--  · 오늘의 말씀 외우기 → 점수 개념이 없던 게임인데, 전도사님 결정으로 **완성 시간**을 기준으로 삼고
--    **힌트(엿보기) 1회당 +5초 페널티**를 붙여 순위를 매긴다. 이것도 오늘부터 0에서 시작한다.
--
-- ⚠ 하위 호환: submit_ox_quiz / submit_chosung_quiz 는 이미 라이브 JS가 호출 중이다.
--   서비스워커에 옛 JS가 캐시된 기기가 있으므로 **인자 1개짜리 호출이 계속 동작해야 한다.**
--   그래서 인자를 추가하되 기본값(default null)을 주고, 기존 1-인자 함수는 drop 한다.
--   (create or replace 로는 인자 목록을 못 바꾸고, 그냥 오버로드하면 "function is not unique" 오류가 난다)
--   → 옛 JS: submit_ox_quiz(p_correct:=n)      → p_time_ms 는 null 로 들어감, 적립 정상
--   → 새 JS: submit_ox_quiz(p_correct, p_time_ms) → 동점자 가르기용 시간까지 저장
--
-- 재실행 안전: create table if not exists / drop function if exists / create or replace.

-- ─────────────────────────────────────────────────────────────
-- 1) 맞은 개수형 퀴즈 게임 점수 (O/X, 초성) — 둘 다 10문제 구조라 한 테이블로 묶는다
-- ─────────────────────────────────────────────────────────────
create table if not exists public.quiz_game_scores (
  user_id      uuid not null references auth.users(id) on delete cascade,
  game         text not null,
  best_correct integer not null,
  best_time_ms integer,                       -- 동점자 가르기용. 옛 JS 호출 시엔 null
  updated_at   timestamptz not null default now(),
  primary key (user_id, game)
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'quiz_game_scores_game_chk') then
    alter table public.quiz_game_scores add constraint quiz_game_scores_game_chk
      check (game in ('ox','chosung'));
  end if;
end $$;

alter table public.quiz_game_scores enable row level security;

drop policy if exists "본인 기록만 조회" on public.quiz_game_scores;
create policy "본인 기록만 조회" on public.quiz_game_scores
  for select using (auth.uid() = user_id);

-- 쓰기는 아래 SECURITY DEFINER 함수로만 한다(직접 insert/update 정책을 두지 않음).

-- ─────────────────────────────────────────────────────────────
-- 2) 최고 기록 갱신 헬퍼 — 더 잘했을 때만 갈아끼운다
--    비교 순서: 맞은 개수 많은 쪽 > (동점이면) 시간 빠른 쪽
--    옛 JS 호출(time 이 null)은 시간 비교에서 지지 않도록, 기존 기록에 시간이 있으면 유지한다.
-- ─────────────────────────────────────────────────────────────
create or replace function public.upsert_quiz_game_score(
  p_game text, p_correct integer, p_time_ms integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into quiz_game_scores (user_id, game, best_correct, best_time_ms)
  values (auth.uid(), p_game, p_correct, p_time_ms)
  on conflict (user_id, game) do update
    set best_correct = greatest(quiz_game_scores.best_correct, excluded.best_correct),
        best_time_ms = case
          -- 더 많이 맞혔으면 그때의 시간으로 교체
          when excluded.best_correct > quiz_game_scores.best_correct then excluded.best_time_ms
          -- 동점이면 더 빠른 시간만 반영(둘 중 하나가 null 이면 있는 쪽을 남긴다)
          when excluded.best_correct = quiz_game_scores.best_correct then
            least(coalesce(quiz_game_scores.best_time_ms, excluded.best_time_ms),
                  coalesce(excluded.best_time_ms, quiz_game_scores.best_time_ms))
          else quiz_game_scores.best_time_ms
        end,
        updated_at = now();
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- 3) 기존 제출 함수에 점수 저장을 얹는다 (하위 호환 유지)
-- ─────────────────────────────────────────────────────────────
drop function if exists public.submit_ox_quiz(integer);

create or replace function public.submit_ox_quiz(
  p_correct integer,
  p_time_ms integer default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today date := (now() at time zone 'Asia/Seoul')::date;
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;
  if p_correct is null or p_correct < 0 or p_correct > 50 then
    raise exception '잘못된 점수입니다.';
  end if;

  perform upsert_quiz_game_score('ox', p_correct, p_time_ms);

  insert into points_ledger (user_id, action_type, points, ref_date)
  values (auth.uid(), 'ox_quiz', 2, v_today)
  on conflict (user_id, action_type, ref_date) where action_type <> 'admin_award' do nothing;
  return case when found then 2 else 0 end;
end;
$$;

grant execute on function public.submit_ox_quiz(integer, integer) to authenticated;

drop function if exists public.submit_chosung_quiz(integer);

create or replace function public.submit_chosung_quiz(
  p_correct integer,
  p_time_ms integer default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today date := (now() at time zone 'Asia/Seoul')::date;
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;
  if p_correct is null or p_correct < 0 or p_correct > 50 then
    raise exception '잘못된 점수입니다.';
  end if;

  perform upsert_quiz_game_score('chosung', p_correct, p_time_ms);

  insert into points_ledger (user_id, action_type, points, ref_date)
  values (auth.uid(), 'chosung_quiz', 2, v_today)
  on conflict (user_id, action_type, ref_date) where action_type <> 'admin_award' do nothing;
  return case when found then 2 else 0 end;
end;
$$;

grant execute on function public.submit_chosung_quiz(integer, integer) to authenticated;

-- ─────────────────────────────────────────────────────────────
-- 3-b) 오늘의 말씀 외우기 — 완성 시간 기준, 힌트(엿보기) 1회당 +5초 페널티
--      전도사님 결정: "시간으로 하고, 힌트를 볼 때마다 +5초"
--      기록값 = 실제 걸린 시간 + (엿보기 횟수 × 5000ms) → adjusted_ms 가 작을수록 상위.
--      참고: 구절이 매일 바뀌므로 날짜가 다르면 난이도도 다르다. 완전히 공평한 비교는 아니다.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.verse_memory_scores (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  best_adjusted_ms integer not null,          -- 페널티까지 반영한 기록(순위 기준)
  best_raw_ms      integer,                   -- 그때 실제로 걸린 시간
  best_peeks       integer,                   -- 그때 엿본 횟수
  updated_at       timestamptz not null default now()
);

alter table public.verse_memory_scores enable row level security;

drop policy if exists "본인 기록만 조회" on public.verse_memory_scores;
create policy "본인 기록만 조회" on public.verse_memory_scores
  for select using (auth.uid() = user_id);

drop function if exists public.submit_verse_memory_game();

create or replace function public.submit_verse_memory_game(
  p_time_ms integer default null,
  p_peeks   integer default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today    date := (now() at time zone 'Asia/Seoul')::date;
  v_peeks    integer := greatest(coalesce(p_peeks, 0), 0);
  v_adjusted integer;
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;

  -- 시간을 보내온 경우에만 기록을 남긴다(옛 JS는 인자 없이 부르므로 적립만 하고 지나간다).
  -- 말도 안 되는 값(음수, 2시간 초과)은 기록하지 않는다.
  if p_time_ms is not null and p_time_ms > 0 and p_time_ms < 7200000 then
    v_adjusted := p_time_ms + v_peeks * 5000;
    insert into verse_memory_scores (user_id, best_adjusted_ms, best_raw_ms, best_peeks)
    values (auth.uid(), v_adjusted, p_time_ms, v_peeks)
    on conflict (user_id) do update
      set best_adjusted_ms = least(verse_memory_scores.best_adjusted_ms, excluded.best_adjusted_ms),
          best_raw_ms = case when excluded.best_adjusted_ms < verse_memory_scores.best_adjusted_ms
                             then excluded.best_raw_ms else verse_memory_scores.best_raw_ms end,
          best_peeks  = case when excluded.best_adjusted_ms < verse_memory_scores.best_adjusted_ms
                             then excluded.best_peeks else verse_memory_scores.best_peeks end,
          updated_at = now();
  end if;

  insert into points_ledger (user_id, action_type, points, ref_date)
  values (auth.uid(), 'verse_memory', 2, v_today)
  on conflict (user_id, action_type, ref_date) where action_type <> 'admin_award' do nothing;
  return case when found then 2 else 0 end;
end;
$$;

grant execute on function public.submit_verse_memory_game(integer, integer) to authenticated;

-- ─────────────────────────────────────────────────────────────
-- 4) 놀이터 전체 랭킹 한 번에 조회
--    game 값: book_<mode>, match_<mode>, ox, chosung, verse_fill
--    mode 값을 코드에 박지 않고 테이블에 있는 값을 그대로 쓴다(구약/신약 등 표기 변경에 안전).
--    time_ms 는 시간형 게임, correct 는 개수형 게임에서만 채워진다.
-- ─────────────────────────────────────────────────────────────
create or replace function public.get_playground_rankings(p_limit integer default 10)
returns table(
  game text, rank integer, nickname text,
  time_ms integer, correct integer, is_mine boolean
)
language sql
security definer
set search_path = public
as $$
  with me as (select auth.uid() as uid),
  book as (
    select 'book_' || b.mode as game,
           rank() over (partition by b.mode order by b.best_time_ms asc)::int as rank,
           p.nickname, b.best_time_ms as time_ms, null::int as correct, b.user_id
    from book_game_scores b join profiles p on p.user_id = b.user_id
  ),
  matched as (
    select 'match_' || m.mode as game,
           rank() over (partition by m.mode order by m.best_time_ms asc)::int as rank,
           p.nickname, m.best_time_ms as time_ms, null::int as correct, m.user_id
    from match_game_scores m join profiles p on p.user_id = m.user_id
  ),
  quizzes as (
    select q.game,
           rank() over (
             partition by q.game
             order by q.best_correct desc, coalesce(q.best_time_ms, 2147483647) asc
           )::int as rank,
           p.nickname, q.best_time_ms as time_ms, q.best_correct as correct, q.user_id
    from quiz_game_scores q join profiles p on p.user_id = q.user_id
  ),
  fill as (
    select 'verse_fill' as game,
           rank() over (order by v.best_correct desc, v.first_on asc)::int as rank,
           p.nickname, null::int as time_ms, v.best_correct as correct, v.user_id
    from (
      select user_id,
             max(correct_count) as best_correct,
             min(played_on) filter (
               where correct_count = (
                 select max(c2.correct_count) from oikos_verse_game c2 where c2.user_id = g.user_id
               )
             ) as first_on
      from oikos_verse_game g
      group by user_id
    ) v
    join profiles p on p.user_id = v.user_id
  ),
  memory as (
    select 'verse_memory' as game,
           rank() over (order by v.best_adjusted_ms asc)::int as rank,
           p.nickname, v.best_adjusted_ms as time_ms, null::int as correct, v.user_id
    from verse_memory_scores v join profiles p on p.user_id = v.user_id
  ),
  all_rows as (
    select * from book
    union all select * from matched
    union all select * from quizzes
    union all select * from fill
    union all select * from memory
  )
  select a.game, a.rank, a.nickname, a.time_ms, a.correct,
         (a.user_id = (select uid from me)) as is_mine
  from all_rows a
  where a.rank <= greatest(coalesce(p_limit, 10), 1)
  order by a.game, a.rank;
$$;

grant execute on function public.get_playground_rankings(integer) to anon, authenticated;

-- ─────────────────────────────────────────────────────────────
-- 5) 내 순위만 따로 (top N 밖이어도 자기 자리는 보이게)
-- ─────────────────────────────────────────────────────────────
create or replace function public.get_my_playground_ranks()
returns table(game text, rank integer, time_ms integer, correct integer, total integer)
language sql
security definer
set search_path = public
as $$
  with book as (
    select 'book_' || b.mode as game,
           rank() over (partition by b.mode order by b.best_time_ms asc)::int as rank,
           count(*) over (partition by b.mode)::int as total,
           b.best_time_ms as time_ms, null::int as correct, b.user_id
    from book_game_scores b
  ),
  matched as (
    select 'match_' || m.mode as game,
           rank() over (partition by m.mode order by m.best_time_ms asc)::int as rank,
           count(*) over (partition by m.mode)::int as total,
           m.best_time_ms as time_ms, null::int as correct, m.user_id
    from match_game_scores m
  ),
  quizzes as (
    select q.game,
           rank() over (partition by q.game
                        order by q.best_correct desc, coalesce(q.best_time_ms, 2147483647) asc)::int as rank,
           count(*) over (partition by q.game)::int as total,
           q.best_time_ms as time_ms, q.best_correct as correct, q.user_id
    from quiz_game_scores q
  ),
  fill as (
    select 'verse_fill' as game,
           rank() over (order by v.best_correct desc)::int as rank,
           count(*) over ()::int as total,
           null::int as time_ms, v.best_correct as correct, v.user_id
    from (select user_id, max(correct_count) as best_correct from oikos_verse_game group by user_id) v
  ),
  memory as (
    select 'verse_memory' as game,
           rank() over (order by v.best_adjusted_ms asc)::int as rank,
           count(*) over ()::int as total,
           v.best_adjusted_ms as time_ms, null::int as correct, v.user_id
    from verse_memory_scores v
  ),
  all_rows as (
    select * from book
    union all select * from matched
    union all select * from quizzes
    union all select * from fill
    union all select * from memory
  )
  select a.game, a.rank, a.time_ms, a.correct, a.total
  from all_rows a
  where a.user_id = auth.uid()
  order by a.game;
$$;

grant execute on function public.get_my_playground_ranks() to authenticated;

select '말씀놀이터 전체 랭킹 마이그레이션 완료' as status;
