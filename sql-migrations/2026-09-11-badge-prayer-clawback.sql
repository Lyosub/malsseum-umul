-- 2026-09-11  기준 상향(2026-09-10) 이후 소급 정리
--   ① "함께 기도했어요"를 하루 3회 초과로 누른 것 회수(오래된 것 3개만 남기고 삭제)
--   ② 새 뱃지 기준으로 현재 등급을 다시 계산해, 이미 지급했지만 지금은 미달인 등급의 달란트를 회수
--
-- badge_awards 에서 초과 등급 행을 지우면, 나중에 학생이 그 등급을 다시 채웠을 때
-- claim_badge_rewards 가 다시 지급한다(정상). 회수분은 points_ledger 에 badge_award 음수로 기록.
--
-- 실행: 미리보기 함수로 영향 확인 → apply 함수로 실제 반영. 둘 다 재실행 안전.
--
-- ── 실제 실행 결과 (2026-09-10 KST 적용 완료) ────────────────────────────────
--   ① prayer_reactions: 하루 3개 초과분 약 355행 삭제(8명, 유저·일자별 오래된 3개만 유지).
--      적용 후: 총 40행 / 8명 / 하루 최대 3개, 초과일 0.
--   ② badge_awards: 초과 등급 행 삭제 + points_ledger 에 badge_award 음수 기록.
--      총 회수 590달란트 / 19명. 적용 후 badge_awards 합계 225 == badge_award 원장 합계 225 (정합).
--      상위: 이지수 -105, 정지우 -95, 임다빈 -95, 김다희 -75 (대부분 기도친구 뱃지 회수분).
--      나머지 15명은 개근왕·기록왕·출석지기·퀴즈왕·게임왕 등급 하향으로 -5 ~ -30.
--   ※ report_badge_clawback() 은 미청구 등급까지 포함해 과다 계산되므로, 실제 회수액은
--      points_ledger 의 action_type='badge_award' AND points<0 합계(-590)가 정확한 값이다.

------------------------------------------------------------
-- 새 기준 (2026-09-10-badges-harder-prayer-cap.sql 와 동일해야 함)
--   streak 7/14/30/50/70 · attend 10/25/55/95/150 · note 15/40/85/150/230
--   quiz 2/5/10/18/30 · game 5/15/35/70/120 · pray 10/30/60/100/150 · invite 1/2/3/5/7
------------------------------------------------------------

create or replace function _badge_tier_now(p_val integer, p_code text)
returns integer language sql immutable as $$
  select case p_code
    when 'streak' then (case when p_val>=70 then 5 when p_val>=50 then 4 when p_val>=30 then 3 when p_val>=14 then 2 when p_val>=7 then 1 else 0 end)
    when 'attend' then (case when p_val>=150 then 5 when p_val>=95 then 4 when p_val>=55 then 3 when p_val>=25 then 2 when p_val>=10 then 1 else 0 end)
    when 'note'   then (case when p_val>=230 then 5 when p_val>=150 then 4 when p_val>=85 then 3 when p_val>=40 then 2 when p_val>=15 then 1 else 0 end)
    when 'quiz'   then (case when p_val>=30 then 5 when p_val>=18 then 4 when p_val>=10 then 3 when p_val>=5 then 2 when p_val>=2 then 1 else 0 end)
    when 'game'   then (case when p_val>=120 then 5 when p_val>=70 then 4 when p_val>=35 then 3 when p_val>=15 then 2 when p_val>=5 then 1 else 0 end)
    when 'pray'   then (case when p_val>=150 then 5 when p_val>=100 then 4 when p_val>=60 then 3 when p_val>=30 then 2 when p_val>=10 then 1 else 0 end)
    when 'invite' then (case when p_val>=7 then 5 when p_val>=5 then 4 when p_val>=3 then 3 when p_val>=2 then 2 when p_val>=1 then 1 else 0 end)
    else 0 end;
$$;

-- 유저별 현재 값 (pray 는 "하루 3회" 적용 후 값)
-- get_my_badges 는 streak 을 greatest(current, longest) 로 쓰는데, longest 계산에 현재 연속도
-- 포함되므로 항상 longest >= current → 여기서는 longest 만 쓰면 동일하다.
create or replace function _badge_values_all()
returns table(user_id uuid, streak_v int, attend_v int, note_v int, quiz_v int, game_v int, pray_v int, invite_v int)
language sql stable as $$
  with u as (select id as user_id from auth.users where deleted_at is null),
  streaks as (
    select user_id, max(run_len)::int as longest
    from (
      select user_id, count(*) as run_len
      from (
        select user_id, date,
               date - (row_number() over (partition by user_id order by date))::int as grp
        from attendance
      ) g
      group by user_id, grp
    ) r
    group by user_id
  ),
  pr3 as (
    select user_id, count(*)::int as cnt
    from (
      select pr.user_id,
             row_number() over (partition by pr.user_id, (pr.created_at at time zone 'Asia/Seoul')::date
                                order by pr.created_at asc) as rn
      from prayer_reactions pr
    ) t
    where rn <= 3
    group by user_id
  )
  select
    u.user_id,
    coalesce((select longest from streaks s where s.user_id = u.user_id), 0) as streak_v,
    coalesce((select count(*)::int from attendance a where a.user_id = u.user_id), 0) as attend_v,
    coalesce((select count(*)::int from notes n where n.user_id = u.user_id and n.type in ('greeting','gratitude','prayer')), 0) as note_v,
    coalesce((select count(*)::int from quiz_answers q where q.user_id = u.user_id and q.is_correct), 0) as quiz_v,
    coalesce((select count(*)::int from points_ledger pl where pl.user_id = u.user_id and pl.action_type in ('book_game_ot','book_game_nt','match_game_books','match_game_figures')), 0) as game_v,
    coalesce((select cnt from pr3 where pr3.user_id = u.user_id), 0) as pray_v,
    coalesce((select count(*)::int from friend_invites fi where fi.inviter_user_id = u.user_id and fi.event_key = '2026-0913' and fi.came), 0) as invite_v
  from u;
$$;

-- 미리보기: 회수 대상
create or replace function preview_badge_clawback()
returns table(user_id uuid, nickname text, badge_code text, over_tier int, new_tier int, points integer)
language sql stable as $$
  with vals as (select * from _badge_values_all()),
  cur as (
    select v.user_id, x.code, x.val,
      _badge_tier_now(x.val, x.code) as new_tier
    from vals v,
    lateral (values
      ('streak', v.streak_v),('attend', v.attend_v),('note', v.note_v),
      ('quiz', v.quiz_v),('game', v.game_v),('pray', v.pray_v),('invite', v.invite_v)
    ) x(code, val)
  )
  select ba.user_id, pr.nickname, ba.badge_code, ba.tier as over_tier, c.new_tier, ba.points_awarded
  from badge_awards ba
  join cur c on c.user_id = ba.user_id and c.code = ba.badge_code
  left join profiles pr on pr.user_id = ba.user_id
  where ba.tier > c.new_tier
  order by pr.nickname, ba.badge_code, ba.tier;
$$;

------------------------------------------------------------
-- (실행 후) 사후 리포트: 누가 얼마 있었는데 얼마 깎였고 왜.
--   deducted = 삭제된 badge_awards 등급들의 보상 합.
--   삭제된 등급 = new_tier < tier <= "역대 최저 기준으로 계산한 등급"(= 지급됐던 최고 등급).
--   original(역대 최저) 기준: streak 3/7/14/21/30, attend 5/15/30/50/80, note 5/15/35/60/100,
--                            quiz 1/3/6/10/15, game 3/8/18/30/50, pray 3/10/25/45/70, invite 1/2/3/4/5
--   ※ pray 는 "하루 3회" 정리로 값 자체가 줄어, 여기 pray 수치는 정리 후 값 기준(실제 회수는 이보다 큼).
------------------------------------------------------------
create or replace function _badge_tier_orig(p_val integer, p_code text)
returns integer language sql immutable as $$
  select case p_code
    when 'streak' then (case when p_val>=30 then 5 when p_val>=21 then 4 when p_val>=14 then 3 when p_val>=7 then 2 when p_val>=3 then 1 else 0 end)
    when 'attend' then (case when p_val>=80 then 5 when p_val>=50 then 4 when p_val>=30 then 3 when p_val>=15 then 2 when p_val>=5 then 1 else 0 end)
    when 'note'   then (case when p_val>=100 then 5 when p_val>=60 then 4 when p_val>=35 then 3 when p_val>=15 then 2 when p_val>=5 then 1 else 0 end)
    when 'quiz'   then (case when p_val>=15 then 5 when p_val>=10 then 4 when p_val>=6 then 3 when p_val>=3 then 2 when p_val>=1 then 1 else 0 end)
    when 'game'   then (case when p_val>=50 then 5 when p_val>=30 then 4 when p_val>=18 then 3 when p_val>=8 then 2 when p_val>=3 then 1 else 0 end)
    when 'pray'   then (case when p_val>=70 then 5 when p_val>=45 then 4 when p_val>=25 then 3 when p_val>=10 then 2 when p_val>=3 then 1 else 0 end)
    when 'invite' then (case when p_val>=5 then 5 when p_val>=4 then 4 when p_val>=3 then 3 when p_val>=2 then 2 when p_val>=1 then 1 else 0 end)
    else 0 end;
$$;

create or replace function report_badge_clawback()
returns table(nickname text, badge_code text, badge_label text, was_tier int, now_tier int, revoked_talents int)
language sql stable as $$
  with vals as (select * from _badge_values_all()),
  flat as (
    select v.user_id, x.code, x.val,
      _badge_tier_orig(x.val, x.code) as was_tier,
      _badge_tier_now(x.val, x.code)  as now_tier
    from vals v,
    lateral (values ('streak',v.streak_v),('attend',v.attend_v),('note',v.note_v),
                    ('quiz',v.quiz_v),('game',v.game_v),('pray',v.pray_v),('invite',v.invite_v)) x(code,val)
  )
  select pr.nickname, f.code,
    (case f.code when 'streak' then '개근왕' when 'attend' then '출석지기' when 'note' then '기록왕'
                 when 'quiz' then '퀴즈왕' when 'game' then '게임왕' when 'pray' then '기도친구'
                 when 'invite' then '친초 동역자' else f.code end),
    f.was_tier, f.now_tier,
    ( (f.was_tier*(f.was_tier+1) - f.now_tier*(f.now_tier+1)) / 2 * 5 )::int  -- sum(t*5) for t in now+1..was
  from flat f
  left join profiles pr on pr.user_id = f.user_id
  where f.was_tier > f.now_tier
  order by pr.nickname, f.code;
$$;
