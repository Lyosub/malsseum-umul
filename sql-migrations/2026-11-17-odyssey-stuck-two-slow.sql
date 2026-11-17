-- 2026-11-17 In Odyssey 하루 요약의 「막힘」 기준 보완(전도사님 허락)
-- 7편 14장 s14s1이 막힘으로 떴는데 실제로는 2명 중 1명 882초(중간에 쉼), 1명 39초였다.
-- 두 명뿐이면 중앙값이 평균이 되어 한 사람의 쉼만으로 경고가 났다 → 4분 넘게 걸린 사람이 둘 이상일 때만 막힘.
CREATE OR REPLACE FUNCTION public.get_odyssey_summary()
 RETURNS json
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  with
  st as (select user_id, (data::jsonb->'keys'->>'inodyssey.proto.story')::jsonb s from odyssey_save where data::jsonb->'keys' ? 'inodyssey.proto.story'),
  vis as (select user_id, created_at from odyssey_steplog where ch = 0 and step ~ '^v[0-9]{6}$'),
  stp as (select * from odyssey_steplog where not (ch = 0 and step ~ '^v[0-9]{6}$')),
  errs as (
    select e.*, exists (select 1 from odyssey_errors_fixed f
                        where e.message like f.message_like and (f.stack_like is null or coalesce(e.stack, '') like f.stack_like)
                          and e.occurred_at < f.fixed_at) as fixed
    from client_errors e where e.occurred_at > now() - interval '24 hours' and e.page ilike '%odyssey%')
  select json_build_object(
    'testers',     (select count(*) from odyssey_testers),
    'players',     (select count(*) from odyssey_progress),
    'active_24h',  (select count(*) from (
                      select user_id from odyssey_steplog where created_at > now() - interval '24 hours'
                      union select user_id from odyssey_save where updated_at > now() - interval '24 hours') u),
    'saved_24h',   (select count(*) from odyssey_save where updated_at > now() - interval '24 hours'),
    'visitors_24h',(select count(distinct user_id) from vis where created_at > now() - interval '24 hours'),
    'new_24h',     (select count(*) from (select user_id, min(created_at) f from vis group by user_id) x where f > now() - interval '24 hours'),
    'steps_24h',   (select count(*) from stp where created_at > now() - interval '24 hours'),
    'active_7d',   (select count(*) from (
                      select user_id from odyssey_steplog where created_at > now() - interval '7 days'
                      union select user_id from odyssey_save where updated_at > now() - interval '7 days') u),
    'chapters',    (select json_build_object(
                      '1편 모세와 함께 (10장)',   (select coalesce(json_object_agg(d || '장 클리어', n order by d), '{}'::json) from (select d, count(*) n from (select least(10, coalesce((s->>'ch')::int, 0) + (case when s->>'cleared' = 'true' then 1 else 0 end)) d from st) a group by d) b),
                      '2편 시내산의 마지막 한 달 (10장)', (select coalesce(json_object_agg(d || '장 클리어', n order by d), '{}'::json) from (select d, count(*) n from (select least(10, coalesce((s->'sp'->'sinai2'->>'ch')::int, 0) + (case when s->'sp'->'sinai2'->>'cleared' = 'true' then 1 else 0 end)) d from st where s->'sp' ? 'sinai2') a group by d) b),
                      '3편 광야 40년 (16장)',     (select coalesce(json_object_agg(d || '장 클리어', n order by d), '{}'::json) from (select d, count(*) n from (select least(16, coalesce((s->'sp'->'wild3'->>'ch')::int, 0) + (case when s->'sp'->'wild3'->>'cleared' = 'true' then 1 else 0 end)) d from st where s->'sp' ? 'wild3') a group by d) b),
                      '4편 여호수아와 함께 (13장)', (select coalesce(json_object_agg(d || '장 클리어', n order by d), '{}'::json) from (select d, count(*) n from (select least(13, coalesce((s->'sp'->'joshua'->>'ch')::int, 0) + (case when s->'sp'->'joshua'->>'cleared' = 'true' then 1 else 0 end)) d from st where s->'sp' ? 'joshua') a group by d) b),
                      '5편 사사들과 함께 (12장)', (select coalesce(json_object_agg(d || '장 클리어', n order by d), '{}'::json) from (select d, count(*) n from (select least(12, coalesce((s->'sp'->'judges'->>'ch')::int, 0) + (case when s->'sp'->'judges'->>'cleared' = 'true' then 1 else 0 end)) d from st where s->'sp' ? 'judges') a group by d) b),
                      '6편 룻과 사무엘 (9장)', (select coalesce(json_object_agg(d || '장 클리어', n order by d), '{}'::json) from (select d, count(*) n from (select least(9, coalesce((s->'sp'->'ruth'->>'ch')::int, 0) + (case when s->'sp'->'ruth'->>'cleared' = 'true' then 1 else 0 end)) d from st where s->'sp' ? 'ruth') a group by d) b),
                      '7편 사울과 다윗 (16장)', (select coalesce(json_object_agg(d || '장 클리어', n order by d), '{}'::json) from (select d, count(*) n from (select least(16, coalesce((s->'sp'->'saul'->>'ch')::int, 0) + (case when s->'sp'->'saul'->>'cleared' = 'true' then 1 else 0 end)) d from st where s->'sp' ? 'saul') a group by d) b))),
    'stuck',       (select coalesce(json_agg(s), '[]'::json) from (
                      select ch as chapter, step, count(distinct user_id) as players, (percentile_cont(0.5) within group (order by secs))::int as median_secs
                      from stp where created_at > now() - interval '14 days'
                      group by ch, step having count(distinct user_id) >= 2 and (percentile_cont(0.5) within group (order by secs)) >= 240
                        and count(distinct user_id) filter (where secs >= 240) >= 2   -- 2026-11-17: 한 사람이 오래 쉰 것만으로 막힘이라 하지 않게
                      order by 4 desc limit 3) s),
    'errors_24h',  (select count(*) from errs where not fixed),
    'errors_fixed_24h', (select count(*) from errs where fixed)
  );
$function$
;
