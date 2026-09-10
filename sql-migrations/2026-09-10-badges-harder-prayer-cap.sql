-- 2026-09-10  뱃지 획득 난이도 전체 상향 + "함께 기도했어요" 하루 3회 제한
-- 재실행 안전: create or replace / add column if not exists.

-- ── 1) prayer_reactions 에 created_at (없으면 추가) ───────────────────────────
alter table prayer_reactions add column if not exists created_at timestamptz not null default now();

-- ── 2) toggle_prayer_reaction : 새로 누르는 건 하루 3회까지 ───────────────────
create or replace function toggle_prayer_reaction(p_note_id bigint)
returns table(pray_count integer, i_prayed boolean)
language plpgsql
security definer
set search_path = public
as $func$
declare
  v_exists boolean;
  v_today_count integer;
begin
  if auth.uid() is null then
    raise exception '로그인이 필요합니다.';
  end if;
  if not exists (select 1 from notes where id = p_note_id and type = 'prayer') then
    raise exception '기도제목을 찾을 수 없습니다.';
  end if;

  select exists(select 1 from prayer_reactions where note_id = p_note_id and user_id = auth.uid()) into v_exists;

  if v_exists then
    delete from prayer_reactions where note_id = p_note_id and user_id = auth.uid();
  else
    select count(*) into v_today_count
    from prayer_reactions pr
    where pr.user_id = auth.uid()
      and (pr.created_at at time zone 'Asia/Seoul')::date = (now() at time zone 'Asia/Seoul')::date;
    if v_today_count >= 3 then
      raise exception '오늘은 "함께 기도했어요"를 3번까지 눌렀어요. 내일 다시 눌러주세요.';
    end if;
    insert into prayer_reactions (note_id, user_id) values (p_note_id, auth.uid()) on conflict do nothing;
  end if;

  return query
    select coalesce(count(*), 0)::integer, (not v_exists)
    from prayer_reactions where note_id = p_note_id;
end;
$func$;

-- ── 3) get_my_badges : 7종 전부 기준 상향 ────────────────────────────────────
--   streak  5/10/20/30/40   → 7/14/30/50/70
--   attend  5/15/30/50/80   → 10/25/55/95/150
--   note    10/25/50/90/140 → 15/40/85/150/230
--   quiz    1/3/6/10/15     → 2/5/10/18/30
--   game    3/8/18/30/50    → 5/15/35/70/120
--   pray    5/15/35/60/90   → 10/30/60/100/150  (하루 3회 제한과 함께)
--   invite  1/2/3/4/5       → 1/2/3/5/7
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
      ('streak', '🔥',  '개근왕',      greatest(coalesce(v_cur,0), coalesce(v_longest,0)),  7, 14, 30, 50,  70),
      ('attend', '📅',  '출석지기',    coalesce(v_attend,0),  10, 25, 55, 95, 150),
      ('note',   '✍️',  '기록왕',      coalesce(v_notes,0),   15, 40, 85, 150, 230),
      ('quiz',   '🧠',  '퀴즈왕',      coalesce(v_quiz,0),     2,  5, 10, 18,  30),
      ('game',   '🎮',  '게임왕',      coalesce(v_games,0),    5, 15, 35, 70, 120),
      ('pray',   '🙏',  '기도친구',    coalesce(v_pray,0),    10, 30, 60, 100, 150),
      ('invite', '🎟️', '친초 동역자', coalesce(v_invite,0),   1,  2,  3,  5,   7)
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
