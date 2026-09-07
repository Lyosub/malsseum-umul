-- 2026-09-07 : (1) 친구초청잔치(9/13) 지원  +  (4) 연속 출석 + 뱃지
--
-- Part A. friend_invites : 학생이 "내가 초청한 친구"를 기록하고, 중등부 전체 진행률을 본다.
-- Part B. get_my_streak / get_my_badges : 이미 쌓여있는 데이터(attendance/notes/quiz/게임/기도)로
--         연속 출석과 뱃지를 계산해서 돌려준다. (쓰기 없음 — 순수 집계, 배포 위험 낮음)
--
-- 실행: Management API 또는 SQL Editor. 되돌리기 어려운 동작(drop/delete) 없음.

------------------------------------------------------------
-- Part A. 친구초청잔치 초청 명단
------------------------------------------------------------

create table if not exists friend_invites (
  id bigint generated always as identity primary key,
  inviter_user_id uuid not null references auth.users(id) on delete cascade,
  friend_name text not null,
  came boolean not null default false,
  event_key text not null default '2026-0913',
  created_at timestamptz not null default now()
);

alter table friend_invites enable row level security;

drop policy if exists "본인 초청명단 조회" on friend_invites;
create policy "본인 초청명단 조회" on friend_invites
  for select using (auth.uid() = inviter_user_id);

drop policy if exists "본인 초청명단 추가" on friend_invites;
create policy "본인 초청명단 추가" on friend_invites
  for insert with check (auth.uid() = inviter_user_id);

drop policy if exists "본인 초청명단 수정" on friend_invites;
create policy "본인 초청명단 수정" on friend_invites
  for update using (auth.uid() = inviter_user_id) with check (auth.uid() = inviter_user_id);

drop policy if exists "본인 초청명단 삭제" on friend_invites;
create policy "본인 초청명단 삭제" on friend_invites
  for delete using (auth.uid() = inviter_user_id);

drop policy if exists "교사는 전체 초청명단 조회" on friend_invites;
create policy "교사는 전체 초청명단 조회" on friend_invites
  for select using (
    exists (select 1 from profiles p
            where p.user_id = auth.uid()
              and (p.is_teacher or p.is_admin or p.is_department_head))
  );

drop policy if exists "교사는 전체 초청명단 수정" on friend_invites;
create policy "교사는 전체 초청명단 수정" on friend_invites
  for update using (
    exists (select 1 from profiles p
            where p.user_id = auth.uid()
              and (p.is_teacher or p.is_admin or p.is_department_head))
  );

-- 친구 한 명 등록
create or replace function add_friend_invite(p_name text)
returns bigint
language plpgsql
security definer
set search_path = public
as $func$
declare
  v_name text := nullif(trim(p_name), '');
  v_count integer;
  v_id bigint;
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;
  if v_name is null then raise exception '친구 이름을 적어주세요.'; end if;
  if char_length(v_name) > 20 then raise exception '이름은 20자까지 적을 수 있어요.'; end if;

  select count(*) into v_count
  from friend_invites
  where inviter_user_id = auth.uid() and event_key = '2026-0913';
  if v_count >= 20 then raise exception '친구는 한 번에 20명까지 등록할 수 있어요.'; end if;

  insert into friend_invites (inviter_user_id, friend_name)
  values (auth.uid(), v_name)
  returning id into v_id;
  return v_id;
end;
$func$;

-- 내가 등록한 친구 삭제(본인 것만)
create or replace function delete_friend_invite(p_id bigint)
returns boolean
language plpgsql
security definer
set search_path = public
as $func$
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;
  delete from friend_invites where id = p_id and inviter_user_id = auth.uid();
  return found;
end;
$func$;

-- 내가 등록한 친구 목록
create or replace function get_my_friend_invites()
returns table(id bigint, friend_name text, came boolean, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $func$
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;
  return query
    select fi.id, fi.friend_name, fi.came, fi.created_at
    from friend_invites fi
    where fi.inviter_user_id = auth.uid() and fi.event_key = '2026-0913'
    order by fi.created_at;
end;
$func$;

-- 중등부 전체 진행률(이름은 안 나감 — 숫자만)
create or replace function get_invite_progress()
returns table(pledged_total bigint, came_total bigint, inviter_count bigint, goal integer)
language sql
security definer
set search_path = public
as $func$
  select
    count(*)::bigint,
    count(*) filter (where came)::bigint,
    count(distinct inviter_user_id)::bigint,
    40
  from friend_invites
  where event_key = '2026-0913';
$func$;

grant execute on function get_invite_progress() to anon, authenticated;
grant execute on function add_friend_invite(text) to authenticated;
grant execute on function delete_friend_invite(bigint) to authenticated;
grant execute on function get_my_friend_invites() to authenticated;

------------------------------------------------------------
-- Part B. 연속 출석 + 뱃지 (모두 읽기 전용 집계)
------------------------------------------------------------

-- 현재 연속 출석 / 최장 연속 출석 / 누적 출석일 / 오늘 출석 여부
create or replace function get_my_streak()
returns table(current_streak integer, longest_streak integer, total_days integer, checked_today boolean)
language plpgsql
security definer
set search_path = public
as $func$
declare
  uid uuid := auth.uid();
  v_today date := (now() at time zone 'Asia/Seoul')::date;
  v_cur integer := 0;
  v_longest integer := 0;
  v_run integer := 0;
  v_prev date := null;
  r record;
begin
  if uid is null then raise exception '로그인이 필요합니다.'; end if;

  -- 최장 연속: 모든 출석일을 오름차순으로 훑으며 연속 구간 길이의 최댓값
  for r in select a.date from attendance a where a.user_id = uid order by a.date loop
    if v_prev is not null and r.date = v_prev + 1 then
      v_run := v_run + 1;
    else
      v_run := 1;
    end if;
    if v_run > v_longest then v_longest := v_run; end if;
    v_prev := r.date;
  end loop;

  -- 현재 연속: 오늘(또는 어제)부터 하루씩 거슬러 올라가며 카운트
  if exists (select 1 from attendance where user_id = uid and date = v_today) then
    v_prev := v_today;
  elsif exists (select 1 from attendance where user_id = uid and date = v_today - 1) then
    v_prev := v_today - 1;
  else
    v_prev := null;
  end if;

  while v_prev is not null and exists (select 1 from attendance where user_id = uid and date = v_prev) loop
    v_cur := v_cur + 1;
    v_prev := v_prev - 1;
  end loop;

  return query
    select
      v_cur,
      v_longest,
      (select count(*)::integer from attendance where user_id = uid),
      exists (select 1 from attendance where user_id = uid and date = v_today);
end;
$func$;

-- 뱃지 7종. 각 뱃지는 동(t1)/은(t2)/금(t3) 3단계. tier 0 = 아직 미획득.
create or replace function get_my_badges()
returns table(
  code text, emoji text, label text,
  tier integer, tier_label text,
  current_value integer, next_target integer
)
language plpgsql
security definer
set search_path = public
as $func$
declare
  uid uuid := auth.uid();
  v_cur integer; v_longest integer;
  v_attend integer; v_notes integer; v_quiz integer; v_games integer; v_pray integer; v_invite integer;
begin
  if uid is null then raise exception '로그인이 필요합니다.'; end if;

  select s.current_streak, s.longest_streak into v_cur, v_longest from get_my_streak() s;
  select count(*)::integer into v_attend from attendance where user_id = uid;
  select count(*)::integer into v_notes  from notes where user_id = uid and type in ('greeting','gratitude','prayer');
  select count(*)::integer into v_quiz   from quiz_answers where user_id = uid and is_correct;
  select count(*)::integer into v_games  from points_ledger
         where user_id = uid and action_type in ('book_game_ot','book_game_nt','match_game_books','match_game_figures');
  select count(*)::integer into v_pray   from prayer_reactions where user_id = uid;
  select count(*)::integer into v_invite from friend_invites where inviter_user_id = uid and event_key = '2026-0913';

  return query
  with defs(code, emoji, label, val, t1, t2, t3) as (
    values
      ('streak', '🔥',  '개근왕',      greatest(coalesce(v_cur,0), coalesce(v_longest,0)), 7, 14, 30),
      ('attend', '📅',  '출석지기',    coalesce(v_attend,0), 10, 30, 60),
      ('note',   '✍️',  '기록왕',      coalesce(v_notes,0),  10, 30, 60),
      ('quiz',   '🧠',  '퀴즈왕',      coalesce(v_quiz,0),    3,  8, 15),
      ('game',   '🎮',  '게임왕',      coalesce(v_games,0),   5, 15, 30),
      ('pray',   '🙏',  '기도친구',    coalesce(v_pray,0),    5, 20, 50),
      ('invite', '🎟️', '친초 동역자', coalesce(v_invite,0),  1,  3,  5)
  )
  select
    d.code, d.emoji, d.label,
    (case when d.val >= d.t3 then 3 when d.val >= d.t2 then 2 when d.val >= d.t1 then 1 else 0 end),
    (case when d.val >= d.t3 then '금' when d.val >= d.t2 then '은' when d.val >= d.t1 then '동' else '' end),
    d.val,
    (case when d.val >= d.t3 then d.t3
          when d.val >= d.t2 then d.t3
          when d.val >= d.t1 then d.t2
          else d.t1 end)
  from defs d;
end;
$func$;

grant execute on function get_my_streak() to authenticated;
grant execute on function get_my_badges() to authenticated;

select 'friend_invites + add/delete/get_my/get_invite_progress + get_my_streak + get_my_badges 완료' as status;
