-- 2026-09-09  개근왕·기록왕·기도친구 뱃지 획득 난이도 상향
--   개근왕(streak):  3/7/14/21/30   → 5/10/20/30/40   (연속 출석일)
--   기록왕(note):    5/15/35/60/100 → 10/25/50/90/140 (글 개수)
--   기도친구(pray):  3/10/25/45/70  → 5/15/35/60/90   (함께 기도 누른 횟수)
--   나머지(출석지기·퀴즈왕·게임왕·친초 동역자)는 그대로.
--
-- 이미 지급된 뱃지 보상(badge_awards)은 회수되지 않는다. 다만 기준이 올라가 일부 학생은
-- 표시 등급이 잠시 내려갈 수 있고, 새 기준을 채우면 다시 올라간다(중복 지급 없음).
-- 재실행 안전: create or replace.

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
  select count(*)::integer into v_invite from friend_invites
         where inviter_user_id = uid and event_key = '2026-0913' and came;

  return query
  with defs(code, emoji, label, val, t1, t2, t3, t4, t5) as (
    values
      ('streak', '🔥',  '개근왕',      greatest(coalesce(v_cur,0), coalesce(v_longest,0)),  5, 10, 20, 30,  40),
      ('attend', '📅',  '출석지기',    coalesce(v_attend,0),   5, 15, 30, 50,  80),
      ('note',   '✍️',  '기록왕',      coalesce(v_notes,0),   10, 25, 50, 90, 140),
      ('quiz',   '🧠',  '퀴즈왕',      coalesce(v_quiz,0),     1,  3,  6, 10,  15),
      ('game',   '🎮',  '게임왕',      coalesce(v_games,0),    3,  8, 18, 30,  50),
      ('pray',   '🙏',  '기도친구',    coalesce(v_pray,0),     5, 15, 35, 60,  90),
      ('invite', '🎟️', '친초 동역자', coalesce(v_invite,0),   1,  2,  3,  4,   5)
  )
  select
    d.code, d.emoji, d.label,
    (case when d.val >= d.t5 then 5 when d.val >= d.t4 then 4 when d.val >= d.t3 then 3
          when d.val >= d.t2 then 2 when d.val >= d.t1 then 1 else 0 end),
    (case when d.val >= d.t5 then '십자가' when d.val >= d.t4 then '다이아' when d.val >= d.t3 then '금'
          when d.val >= d.t2 then '은' when d.val >= d.t1 then '동' else '' end),
    d.val,
    (case when d.val >= d.t5 then d.t5
          when d.val >= d.t4 then d.t5
          when d.val >= d.t3 then d.t4
          when d.val >= d.t2 then d.t3
          when d.val >= d.t1 then d.t2
          else d.t1 end)
  from defs d;
end;
$func$;
