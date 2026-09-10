-- 2026-09-11  뱃지 보상 달란트가 "어떤 뱃지 어떤 등급"인지 원장(note)에 남긴다.
--   기존엔 badge_awards 테이블을 날짜로 조인해 표시했는데, 소급 회수(clawback)로
--   badge_awards 행이 지워지면 매칭이 깨져 관리자 화면에서 뱃지 이름이 안 떴다.
--   → claim_badge_rewards 가 지급 시점에 note 에 "개근왕 은 · 기록왕 동" 식으로 적어두면
--     회수와 무관하게 영구적으로 표시된다.
-- 재실행 안전.

create or replace function claim_badge_rewards()
returns integer
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  uid uuid := auth.uid();
  v_today date := (now() at time zone 'Asia/Seoul')::date;
  r record;
  v_prev_tier integer;
  t integer;
  v_total integer := 0;
  v_parts text[] := '{}';
  v_label text;
  v_tiernames text[] := array['동','은','금','다이아','십자가'];
begin
  if uid is null then raise exception '로그인이 필요합니다.'; end if;

  for r in select b.code, b.tier from get_my_badges() b loop
    if r.tier < 1 then continue; end if;

    select coalesce(max(ba.tier), 0) into v_prev_tier
    from badge_awards ba where ba.user_id = uid and ba.badge_code = r.code;

    if r.tier <= v_prev_tier then continue; end if;

    v_label := case r.code
      when 'streak' then '개근왕' when 'attend' then '출석지기' when 'note' then '기록왕'
      when 'quiz' then '퀴즈왕' when 'game' then '게임왕' when 'pray' then '기도친구'
      when 'invite' then '친초 동역자' else r.code end;

    for t in (v_prev_tier + 1) .. r.tier loop
      insert into badge_awards (user_id, badge_code, tier, points_awarded)
      values (uid, r.code, t, t * 5)
      on conflict (user_id, badge_code, tier) do nothing;
      if found then
        v_total := v_total + (t * 5);
        v_parts := v_parts || (v_label || ' ' || coalesce(v_tiernames[t], t || '단계'));
      end if;
    end loop;
  end loop;

  if v_total > 0 then
    insert into points_ledger (user_id, action_type, points, ref_date, note)
    values (uid, 'badge_award', v_total, v_today, array_to_string(v_parts, ' · '))
    on conflict (user_id, action_type, ref_date) where action_type <> 'admin_award'
    do update set
      points = points_ledger.points + excluded.points,
      note = case
        when points_ledger.note is null or points_ledger.note in ('', '뱃지 보상') then excluded.note
        else points_ledger.note || ' · ' || excluded.note
      end;
  end if;

  return v_total;
end;
$function$;

-- ── 과거 행 백필: badge_awards 가 아직 남아있는(회수 안 된) 날짜에 한해 note 채움 ──
with bd as (
  select ba.user_id,
         (ba.awarded_at at time zone 'Asia/Seoul')::date as d,
         string_agg(
           (case ba.badge_code
             when 'streak' then '개근왕' when 'attend' then '출석지기' when 'note' then '기록왕'
             when 'quiz' then '퀴즈왕' when 'game' then '게임왕' when 'pray' then '기도친구'
             when 'invite' then '친초 동역자' else ba.badge_code end)
           || ' ' || coalesce((array['동','은','금','다이아','십자가'])[ba.tier], ba.tier || '단계'),
           ' · ' order by ba.badge_code, ba.tier
         ) as parts
  from badge_awards ba
  group by ba.user_id, (ba.awarded_at at time zone 'Asia/Seoul')::date
)
update points_ledger pl
set note = bd.parts
from bd
where pl.user_id = bd.user_id
  and pl.action_type = 'badge_award'
  and pl.ref_date = bd.d
  and pl.points > 0
  and (pl.note is null or pl.note = '뱃지 보상');

select 'claim_badge_rewards note 상세화 + 과거행 백필 완료' as status;
