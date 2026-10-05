-- In Odyssey 하루 요약에 「접속한 사람 수」 추가(2026-10-05).
-- 게임이 로그인한 사람의 접속을 하루 한 번 odyssey_steplog에 step='v'||YYMMDD(KST), ch=0으로 남긴다(logVisit).
-- visitors_24h: 최근 24시간에 들어온 사람 수, new_24h: 그 가운데 처음으로 접속 기록이 생긴 사람 수(2026-10-05 이전 사용자는 첫 기록이 오늘이라 한 번은 "새 사람"으로 잡힘).
create or replace function public.get_odyssey_summary()
 returns json
 language sql
 stable security definer
 set search_path to 'public'
as $function$
  select json_build_object(
    'testers',     (select count(*) from odyssey_testers),
    'players',     (select count(*) from odyssey_progress),
    'active_24h',  (select count(distinct user_id) from odyssey_steplog where created_at > now() - interval '24 hours'),
    'saved_24h',   (select count(*) from odyssey_save where updated_at > now() - interval '24 hours'),
    'visitors_24h',(select count(distinct user_id) from odyssey_steplog where ch = 0 and step ~ '^v[0-9]{6}$' and created_at > now() - interval '24 hours'),
    'new_24h',     (select count(*) from (select user_id, min(created_at) f from odyssey_steplog where ch = 0 and step ~ '^v[0-9]{6}$' group by user_id) x where f > now() - interval '24 hours'),
    'steps_24h',   (select count(*) from odyssey_steplog where created_at > now() - interval '24 hours'),
    'active_7d',   (select count(distinct user_id) from odyssey_steplog where created_at > now() - interval '7 days'),
    'chapters',    (select coalesce(json_object_agg(chapters, n order by chapters), '{}'::json) from (select chapters, count(*) n from odyssey_progress group by chapters) c),
    'stuck',       (select coalesce(json_agg(s), '[]'::json) from (
                      select ch as chapter, step, count(distinct user_id) as players, (percentile_cont(0.5) within group (order by secs))::int as median_secs
                      from odyssey_steplog where created_at > now() - interval '14 days' and not (ch = 0 and step ~ '^v[0-9]{6}$')
                      group by ch, step having (percentile_cont(0.5) within group (order by secs)) >= 240
                      order by 4 desc limit 3) s),
    'errors_24h',  (select count(*) from client_errors where occurred_at > now() - interval '24 hours' and page ilike '%odyssey%')
  );
$function$;
