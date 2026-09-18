-- 2026-09-18  오늘의 말씀 외우기: 날짜별 랭킹으로 변경 (+ 최근 3일치 보기)
--
-- 배경: 말씀 외우기는 구절이 매일 바뀌므로 날짜가 다르면 난이도도 다르다.
--       전체 기간 통합 순위는 "짧은 구절이 걸린 날 한 사람"이 계속 1등이 되어 불공평하다.
-- 전도사님 결정: **그날 푼 사람들끼리만 순위**를 매기고, **최근 3일치를 각각** 볼 수 있게 한다.
--
-- 기록 기준은 그대로: 걸린 시간 + (힌트 횟수 × 5초). 하루에 여러 번 하면 그날 최고 기록만 남는다.
--
-- 기존 verse_memory_scores(전체 기간 최고 기록)는 지우지 않고 그대로 둔다.
-- 순위 노출에는 안 쓰지만, 나중에 "내 최고 기록" 같은 데 쓸 수 있고 지우는 건 되돌릴 수 없기 때문.
--
-- 재실행 안전: create table if not exists / create or replace.

-- ─────────────────────────────────────────────────────────────
-- 1) 날짜별 기록
-- ─────────────────────────────────────────────────────────────
create table if not exists public.verse_memory_daily (
  user_id      uuid not null references auth.users(id) on delete cascade,
  played_on    date not null,
  adjusted_ms  integer not null,          -- 그날의 최고 기록(페널티 반영)
  raw_ms       integer,
  peeks        integer,
  updated_at   timestamptz not null default now(),
  primary key (user_id, played_on)
);

create index if not exists verse_memory_daily_day_idx
  on public.verse_memory_daily (played_on desc, adjusted_ms asc);

alter table public.verse_memory_daily enable row level security;

drop policy if exists "본인 기록만 조회" on public.verse_memory_daily;
create policy "본인 기록만 조회" on public.verse_memory_daily
  for select using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- 2) 제출 함수: 날짜별 기록도 함께 남긴다
--    시그니처는 그대로 유지한다(이미 배포된 JS가 이 형태로 부르고 있음).
-- ─────────────────────────────────────────────────────────────
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

  if p_time_ms is not null and p_time_ms > 0 and p_time_ms < 7200000 then
    v_adjusted := p_time_ms + v_peeks * 5000;

    -- 그날 기록(순위에 쓰는 값)
    insert into verse_memory_daily (user_id, played_on, adjusted_ms, raw_ms, peeks)
    values (auth.uid(), v_today, v_adjusted, p_time_ms, v_peeks)
    on conflict (user_id, played_on) do update
      set adjusted_ms = least(verse_memory_daily.adjusted_ms, excluded.adjusted_ms),
          raw_ms = case when excluded.adjusted_ms < verse_memory_daily.adjusted_ms
                        then excluded.raw_ms else verse_memory_daily.raw_ms end,
          peeks  = case when excluded.adjusted_ms < verse_memory_daily.adjusted_ms
                        then excluded.peeks else verse_memory_daily.peeks end,
          updated_at = now();

    -- 전체 기간 최고 기록(순위엔 안 쓰지만 계속 유지)
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
-- 3) 말씀 외우기 날짜별 랭킹 (기본 최근 3일)
--    오늘 / 어제 / 그제 순으로, 각 날 안에서만 순위를 매긴다.
--    그날 아무도 안 했으면 그 날짜는 아예 행이 없다(화면에서 "기록 없음"으로 처리).
-- ─────────────────────────────────────────────────────────────
create or replace function public.get_verse_memory_rankings(
  p_days  integer default 3,
  p_limit integer default 10
)
returns table(
  played_on date, day_offset integer, rank integer, nickname text,
  adjusted_ms integer, raw_ms integer, peeks integer, is_mine boolean
)
language sql
security definer
set search_path = public
as $$
  with bounds as (
    select (now() at time zone 'Asia/Seoul')::date as today,
           greatest(coalesce(p_days, 3), 1) as days
  ),
  ranked as (
    select
      d.played_on,
      ((select today from bounds) - d.played_on)::int as day_offset,
      rank() over (partition by d.played_on order by d.adjusted_ms asc)::int as rank,
      p.nickname, d.adjusted_ms, d.raw_ms, d.peeks, d.user_id
    from verse_memory_daily d
    join profiles p on p.user_id = d.user_id
    cross join bounds b
    where d.played_on > b.today - b.days
      and d.played_on <= b.today
  )
  select r.played_on, r.day_offset, r.rank, r.nickname,
         r.adjusted_ms, r.raw_ms, r.peeks,
         (r.user_id = auth.uid()) as is_mine
  from ranked r
  where r.rank <= greatest(coalesce(p_limit, 10), 1)
  order by r.played_on desc, r.rank;
$$;

grant execute on function public.get_verse_memory_rankings(integer, integer) to anon, authenticated;

-- ─────────────────────────────────────────────────────────────
-- 4) 통합 랭킹에서는 말씀 외우기를 빼고, 내 순위는 "오늘 기준"으로 바꾼다
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
  all_rows as (
    select * from book
    union all select * from matched
    union all select * from quizzes
    union all select * from fill
  )
  select a.game, a.rank, a.nickname, a.time_ms, a.correct,
         (a.user_id = (select uid from me)) as is_mine
  from all_rows a
  where a.rank <= greatest(coalesce(p_limit, 10), 1)
  order by a.game, a.rank;
$$;

grant execute on function public.get_playground_rankings(integer) to anon, authenticated;

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
  -- 말씀 외우기는 "오늘 푼 사람들 안에서의 내 순위"
  memory_today as (
    select 'verse_memory' as game,
           rank() over (order by d.adjusted_ms asc)::int as rank,
           count(*) over ()::int as total,
           d.adjusted_ms as time_ms, null::int as correct, d.user_id
    from verse_memory_daily d
    where d.played_on = (now() at time zone 'Asia/Seoul')::date
  ),
  all_rows as (
    select * from book
    union all select * from matched
    union all select * from quizzes
    union all select * from fill
    union all select * from memory_today
  )
  select a.game, a.rank, a.time_ms, a.correct, a.total
  from all_rows a
  where a.user_id = auth.uid()
  order by a.game;
$$;

grant execute on function public.get_my_playground_ranks() to authenticated;

select '말씀 외우기 날짜별 랭킹 마이그레이션 완료' as status;
