-- 2026-09-06 새 게임 "같은 성경 찾기" (카드 뒤집기 짝 맞추기)
--   · books   : 같은 성경책 이름끼리 (창세기 ↔ 창세기)
--   · figures : 인물 ↔ 그 인물의 사건/상징 (모세 ↔ 홍해가 갈라짐)
-- 버전별 16쌍, 버전별 따로 랭킹. book_game 과 동일한 기록/달란트 구조.
--
-- ⚠️ points_ledger CHECK 제약에 match_game_books / match_game_figures 를 미리 넣는다
--    (지난 book_game 때 이게 빠져서 "기록 저장에 실패했어요"가 났던 것과 같은 문제 방지).
--
-- Supabase 대시보드 → SQL Editor에 붙여넣고 Run. 마지막 status 줄이 뜨면 성공.
-- (이 게임의 이전 버전 SQL을 이미 돌렸더라도 이 파일이 mode 값을 books/figures로 바로잡는다.)

create table if not exists match_game_scores (
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null,
  best_time_ms integer not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, mode)
);
alter table match_game_scores enable row level security;

-- mode 허용값을 books/figures로 (이전 버전에서 easy/hard였을 수 있으므로 재설정)
delete from match_game_scores where mode not in ('books', 'figures');
alter table match_game_scores drop constraint if exists match_game_scores_mode_check;
alter table match_game_scores add constraint match_game_scores_mode_check check (mode in ('books', 'figures'));

drop policy if exists "본인 기록만 조회" on match_game_scores;
create policy "본인 기록만 조회" on match_game_scores
  for select using (auth.uid() = user_id);

drop policy if exists "본인 기록만 삽입" on match_game_scores;
create policy "본인 기록만 삽입" on match_game_scores
  for insert with check (auth.uid() = user_id);

drop policy if exists "본인 기록만 수정" on match_game_scores;
create policy "본인 기록만 수정" on match_game_scores
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table points_ledger drop constraint if exists points_ledger_action_type_check;
alter table points_ledger add constraint points_ledger_action_type_check
  check (action_type in (
    'attendance', 'streak_bonus', 'note', 'quiz',
    'group_attendance_bonus', 'group_notes_bonus', 'admin_award', 'greeting_draw',
    'book_game', 'book_game_ot', 'book_game_nt',
    'match_game_books', 'match_game_figures'
  ));

create or replace function submit_match_game_score(p_time_ms integer, p_mode text)
returns table(is_new_best boolean, points_awarded integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing integer;
  v_is_new_best boolean := false;
  v_points integer := 0;
  v_today date := (now() at time zone 'Asia/Seoul')::date;
  v_action text;
  v_already_played_today boolean;
begin
  if auth.uid() is null then
    raise exception '로그인이 필요합니다.';
  end if;
  if p_mode not in ('books', 'figures') then
    raise exception '잘못된 모드입니다.';
  end if;

  select best_time_ms into v_existing from match_game_scores where user_id = auth.uid() and mode = p_mode;

  if v_existing is null or p_time_ms < v_existing then
    insert into match_game_scores (user_id, mode, best_time_ms, updated_at)
    values (auth.uid(), p_mode, p_time_ms, now())
    on conflict (user_id, mode) do update set best_time_ms = excluded.best_time_ms, updated_at = now();
    v_is_new_best := true;
  end if;

  v_action := 'match_game_' || p_mode;

  select exists(
    select 1 from points_ledger
    where user_id = auth.uid() and action_type = v_action and ref_date = v_today
  ) into v_already_played_today;

  if not v_already_played_today then
    insert into points_ledger (user_id, action_type, points, ref_date)
    values (auth.uid(), v_action, 2, v_today);
    v_points := 2;
  end if;

  return query select v_is_new_best, v_points;
end;
$$;

create or replace function get_match_game_leaderboard(p_mode text)
returns table(nickname text, best_time_ms integer)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception '로그인이 필요합니다.';
  end if;
  if p_mode not in ('books', 'figures') then
    raise exception '잘못된 모드입니다.';
  end if;

  return query
    select p.nickname, b.best_time_ms
    from match_game_scores b
    join profiles p on p.user_id = b.user_id
    where b.mode = p_mode
    order by b.best_time_ms asc
    limit 10;
end;
$$;

create or replace function get_my_match_game_score(p_mode text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_time integer;
begin
  if auth.uid() is null then
    raise exception '로그인이 필요합니다.';
  end if;
  if p_mode not in ('books', 'figures') then
    raise exception '잘못된 모드입니다.';
  end if;
  select best_time_ms into v_time from match_game_scores where user_id = auth.uid() and mode = p_mode;
  return v_time;
end;
$$;

select 'match_game_scores(books/figures) + 함수 + points_ledger CHECK 갱신 완료' as status;
