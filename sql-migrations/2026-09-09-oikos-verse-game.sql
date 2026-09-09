-- 2026-09-09  오이코스 곳간 게임: "말씀 빈칸 채우기"
--   하루 1판, 5문제 4지선다. 맞은 개수 × 2달란트가 내 오이코스 곳간으로 직행(개인 달란트 X).
-- 재실행 안전: create table if not exists / CHECK 갈아끼우기 / create or replace.

-- oikos_talent_ledger.kind 에 'game' 추가
alter table oikos_talent_ledger drop constraint if exists oikos_talent_ledger_kind_check;
alter table oikos_talent_ledger add constraint oikos_talent_ledger_kind_check check (
  kind in ('donation','challenge_attendance','challenge_notes','expense','expense_refund','admin_adjust','distribute','game')
);

create table if not exists oikos_verse_game (
  id bigint generated always as identity primary key,
  group_id bigint not null references groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  played_on date not null,
  correct_count integer not null check (correct_count between 0 and 5),
  points_awarded integer not null,
  created_at timestamptz not null default now()
);
-- 한 사람이 하루 한 판만
create unique index if not exists oikos_verse_game_user_day on oikos_verse_game (user_id, played_on);

alter table oikos_verse_game enable row level security;
drop policy if exists "오이코스 게임 조회" on oikos_verse_game;
create policy "오이코스 게임 조회" on oikos_verse_game for select using (
  user_id = auth.uid()
  or exists (select 1 from group_members gm where gm.group_id = oikos_verse_game.group_id and gm.user_id = auth.uid())
  or exists (select 1 from profiles p where p.user_id = auth.uid() and (p.is_admin or p.is_department_head))
);
-- 쓰기는 아래 security definer 함수로만.

-- 오늘 상태 (게임 페이지에서 "오늘 이미 했는지 / 이번 주 우리 오이코스가 이 게임으로 얼마 모았는지")
drop function if exists get_oikos_verse_game_status();
create or replace function get_oikos_verse_game_status()
returns table(in_oikos boolean, group_name text, played_today boolean, today_points integer, week_points integer)
language sql
security definer
set search_path = public
as $func$
  with me as (
    select gm.group_id from group_members gm where gm.user_id = auth.uid() limit 1
  )
  select
    (select group_id from me) is not null as in_oikos,
    (select g.name from groups g where g.id = (select group_id from me)) as group_name,
    exists (
      select 1 from oikos_verse_game v
      where v.user_id = auth.uid()
        and v.played_on = (now() at time zone 'Asia/Seoul')::date
    ) as played_today,
    coalesce((
      select v.points_awarded from oikos_verse_game v
      where v.user_id = auth.uid()
        and v.played_on = (now() at time zone 'Asia/Seoul')::date
    ), 0) as today_points,
    coalesce((
      select sum(v.points_awarded) from oikos_verse_game v
      where v.group_id = (select group_id from me)
        and v.played_on >= (date_trunc('week', (now() at time zone 'Asia/Seoul')::date))::date
    ), 0)::integer as week_points;
$func$;

-- 판 결과 제출 → 내 오이코스 곳간에 적립
drop function if exists submit_oikos_verse_game(integer);
create or replace function submit_oikos_verse_game(p_correct integer)
returns integer
language plpgsql
security definer
set search_path = public
as $func$
declare
  v_gid bigint;
  v_today date := (now() at time zone 'Asia/Seoul')::date;
  v_points integer;
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;
  if p_correct is null or p_correct < 0 or p_correct > 5 then
    raise exception '점수가 올바르지 않아요.';
  end if;

  select gm.group_id into v_gid from group_members gm where gm.user_id = auth.uid() limit 1;
  if v_gid is null then
    raise exception '오이코스에 들어가야 참여할 수 있어요.';
  end if;

  if exists (select 1 from oikos_verse_game v where v.user_id = auth.uid() and v.played_on = v_today) then
    raise exception '오늘은 이미 참여했어요. 내일 다시 도전해요!';
  end if;

  v_points := p_correct * 2;

  insert into oikos_verse_game (group_id, user_id, played_on, correct_count, points_awarded)
  values (v_gid, auth.uid(), v_today, p_correct, v_points);

  if v_points > 0 then
    insert into oikos_talent_ledger (group_id, kind, points, member_id, note)
    values (v_gid, 'game', v_points, auth.uid(), '말씀 빈칸 채우기');
  end if;

  return v_points;
end;
$func$;
