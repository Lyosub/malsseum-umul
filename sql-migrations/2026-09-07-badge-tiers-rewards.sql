-- 2026-09-07 : 뱃지 5단계(동/은/금/다이아/십자가) + 등급 달성 시 달란트 보상
--   보상: 동 +5 / 은 +10 / 금 +15 / 다이아 +20 / 십자가 +25 (등급당 1회, 누적)
--   한 뱃지를 십자가까지 = 75달란트.
--
-- 안전성:
--  · points_ledger CHECK 는 IN 리스트에 'badge_award' 만 추가(순수 확장). 인덱스 predicate는 건드리지 않음.
--  · points_ledger_auto_uniq (where action_type <> 'admin_award') 는 그대로 → badge_award 도 이 인덱스에 포함되므로
--    아래 upsert의 on conflict predicate가 인덱스와 정확히 일치(42P10 재발 없음).
--  · 어떤 (뱃지,등급) 보상을 이미 줬는지는 새 테이블 badge_awards 로 멱등 보장.

------------------------------------------------------------
-- (1) points_ledger 에 badge_award 허용
------------------------------------------------------------
alter table points_ledger drop constraint if exists points_ledger_action_type_check;
alter table points_ledger add constraint points_ledger_action_type_check
  check (action_type in (
    'attendance','streak_bonus','note','quiz',
    'group_attendance_bonus','group_notes_bonus','admin_award','greeting_draw',
    'book_game','book_game_ot','book_game_nt',
    'match_game_books','match_game_figures',
    'oikos_expense','badge_award'
  ));

------------------------------------------------------------
-- (2) 지급 이력 테이블 (멱등성)
------------------------------------------------------------
create table if not exists badge_awards (
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_code text not null,
  tier integer not null,
  points_awarded integer not null,
  awarded_at timestamptz not null default now(),
  primary key (user_id, badge_code, tier)
);
alter table badge_awards enable row level security;

drop policy if exists "본인 뱃지보상 조회" on badge_awards;
create policy "본인 뱃지보상 조회" on badge_awards
  for select using (auth.uid() = user_id);

------------------------------------------------------------
-- (3) get_my_badges : 3단계 → 5단계 + 기준 재조정, 친초는 "실제 온 친구(came)" 기준
------------------------------------------------------------
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
      ('streak', '🔥',  '개근왕',      greatest(coalesce(v_cur,0), coalesce(v_longest,0)),  3,  7, 14, 21,  30),
      ('attend', '📅',  '출석지기',    coalesce(v_attend,0),   5, 15, 30, 50,  80),
      ('note',   '✍️',  '기록왕',      coalesce(v_notes,0),    5, 15, 35, 60, 100),
      ('quiz',   '🧠',  '퀴즈왕',      coalesce(v_quiz,0),     1,  3,  6, 10,  15),
      ('game',   '🎮',  '게임왕',      coalesce(v_games,0),    3,  8, 18, 30,  50),
      ('pray',   '🙏',  '기도친구',    coalesce(v_pray,0),     3, 10, 25, 45,  70),
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

------------------------------------------------------------
-- (4) claim_badge_rewards : 새로 넘긴 등급마다 달란트 지급(멱등). 이번에 지급한 총합을 리턴.
------------------------------------------------------------
create or replace function claim_badge_rewards()
returns integer
language plpgsql
security definer
set search_path = public
as $func$
declare
  uid uuid := auth.uid();
  v_today date := (now() at time zone 'Asia/Seoul')::date;
  r record;
  v_prev_tier integer;
  t integer;
  v_total integer := 0;
begin
  if uid is null then raise exception '로그인이 필요합니다.'; end if;

  for r in select b.code, b.tier from get_my_badges() b loop
    if r.tier < 1 then continue; end if;

    select coalesce(max(ba.tier), 0) into v_prev_tier
    from badge_awards ba where ba.user_id = uid and ba.badge_code = r.code;

    if r.tier <= v_prev_tier then continue; end if;

    for t in (v_prev_tier + 1) .. r.tier loop
      insert into badge_awards (user_id, badge_code, tier, points_awarded)
      values (uid, r.code, t, t * 5)
      on conflict (user_id, badge_code, tier) do nothing;
      if found then
        v_total := v_total + (t * 5);
      end if;
    end loop;
  end loop;

  if v_total > 0 then
    insert into points_ledger (user_id, action_type, points, ref_date, note)
    values (uid, 'badge_award', v_total, v_today, '뱃지 보상')
    on conflict (user_id, action_type, ref_date) where action_type <> 'admin_award'
    do update set points = points_ledger.points + excluded.points;
  end if;

  return v_total;
end;
$func$;

grant execute on function get_my_badges() to authenticated;
grant execute on function claim_badge_rewards() to authenticated;

select 'badge 5단계 + claim_badge_rewards + badge_awards 테이블 + points_ledger CHECK 확장 완료' as status;
