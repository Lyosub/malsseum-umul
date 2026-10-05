-- In Odyssey 하루 요약 v3 (2026-10-05): chapters를 「편별 몇 장 중 몇 장 클리어」로 읽기 쉽게 바꾼다.
--  chapters = { "1편 모세와 함께 (10장)": {"0장 클리어": n명, "1장 클리어": n명, ...}, "2편 …(10장)": {...}, "3편 …(16장)": {...} }
--  진행 계산: 1편 = story.ch + (cleared ? 1 : 0), 2·3편 = story.sp.<id>.ch + (cleared ? 1 : 0). 2·3편은 펼친 적이 있는 사람만 센다.
-- In Odyssey 하루 요약 v2 (2026-10-05) — 일일 점검 카톡이 숫자를 잘못 읽던 문제를 숫자를 만드는 쪽에서 고친다.
--  * active_24h : 단계를 넘긴 사람만이 아니라, 로그인해 접속한 사람 + 단계 기록 + 진행 저장이 갱신된 사람의 합집합(실제로 들어와 움직인 사람 수)
--  * steps_24h  : 접속 기록(step='v'+YYMMDD)은 제외한 순수 이야기 단계 수
--  * stuck      : 한 명만 오래 머문 것은 막힘이 아니므로 2명 이상일 때만, 접속 기록은 제외
--  * errors_24h : 이미 고쳐서 배포한 오류(odyssey_errors_fixed 표에 등록, 고친 시각 이전에 난 것)는 빼고 센다. 뺀 건수는 errors_fixed_24h로 따로 보인다.
create table if not exists public.odyssey_errors_fixed (
  id bigint generated always as identity primary key,
  message_like text not null,
  stack_like text,
  fixed_at timestamptz not null,
  note text
);
alter table public.odyssey_errors_fixed enable row level security;   -- 정책 없음: 함수(security definer)만 읽는다

insert into public.odyssey_errors_fixed (message_like, stack_like, fixed_at, note)
select '%reading ''x''%', '%updateStorm%', now(), '시내산 폭풍 효과가 다른 마을에서 매 프레임 오류 — 커밋 ad9121c'
where not exists (select 1 from public.odyssey_errors_fixed where stack_like = '%updateStorm%');

create or replace function public.get_odyssey_summary()
 returns json
 language sql
 stable security definer
 set search_path to 'public'
as $function$
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
                      '3편 광야 40년 (16장)',     (select coalesce(json_object_agg(d || '장 클리어', n order by d), '{}'::json) from (select d, count(*) n from (select least(16, coalesce((s->'sp'->'wild3'->>'ch')::int, 0) + (case when s->'sp'->'wild3'->>'cleared' = 'true' then 1 else 0 end)) d from st where s->'sp' ? 'wild3') a group by d) b))),
    'stuck',       (select coalesce(json_agg(s), '[]'::json) from (
                      select ch as chapter, step, count(distinct user_id) as players, (percentile_cont(0.5) within group (order by secs))::int as median_secs
                      from stp where created_at > now() - interval '14 days'
                      group by ch, step having count(distinct user_id) >= 2 and (percentile_cont(0.5) within group (order by secs)) >= 240
                      order by 4 desc limit 3) s),
    'errors_24h',  (select count(*) from errs where not fixed),
    'errors_fixed_24h', (select count(*) from errs where fixed)
  );
$function$;
