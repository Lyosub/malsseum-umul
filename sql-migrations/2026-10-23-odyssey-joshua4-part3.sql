-- 2026-10-23 In Odyssey 4편 3부(9~13장): 배지 업적 키 badge-peacemaker · badge-my_house 추가(배열 끝에 붙여 기존 번호 유지)
CREATE OR REPLACE FUNCTION public.claim_odyssey_achieve(p_key text)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_idx int; v_pts int; v_n integer; v_st jsonb; v_ok boolean;
  keys text[] := array['badge-wise','badge-pray_start','badge-companion','badge-prayer','badge-share','badge-trust',
                       'badge-true_heart','badge-passover_lamb','badge-bold_step','badge-together','badge-timbrel','badge-scroll_all',
                       'scroll-alpha','scroll-midian','scroll-egypt','scroll-redsea','badge-daily_bread',
                       'badge-raised_hands','badge-true_leader','badge-ten_words',
                       'badge-idol_breaker','badge-craftsman',
                       'badge-hidden_all',
                       'badge-lords_side','badge-willing','badge-as_commanded',
                       'badge-side_all',
                       'badge-links_all','badge-wild_runner',
                       'badge-holy_people','badge-trumpet_follow',
                       'badge-grape_carry','badge-with_caleb',
                       'badge-looked_up','badge-refuge_run','badge-hear_israel',
                       'badge-red_cord','badge-twelve_stones',
                       'badge-seventh_day',
                       'badge-peacemaker','badge-my_house'];
begin
  if auth.uid() is null or not public.can_see_odyssey() then return 0; end if;
  v_idx := array_position(keys, p_key);
  if v_idx is null then return 0; end if;
  v_st := public.odyssey_saved_story();
  if v_st is null then return -1; end if;
  if p_key like 'badge-%' then
    v_ok := coalesce(v_st->'badges', '[]'::jsonb) ? substr(p_key, 7);
  else
    v_ok := jsonb_array_length(coalesce(v_st->'scrolls'->substr(p_key, 8), '[]'::jsonb)) >= 5;
  end if;
  if not v_ok then return -1; end if;
  v_pts := case when p_key like 'scroll-%' then 10 when p_key in ('badge-hidden_all', 'badge-side_all') then 10 else 3 end;
  insert into points_ledger (user_id, action_type, points, ref_date, note)
  values (auth.uid(), 'odyssey_achieve', v_pts, date '2000-01-01' + v_idx, 'In Odyssey 업적: ' || p_key)
  on conflict (user_id, action_type, ref_date) where action_type <> 'admin_award' do nothing;
  get diagnostics v_n = row_count;
  return case when v_n > 0 then v_pts else 0 end;
end $function$;

-- 하루 요약에 4편(여호수아와 함께, 13장) 진행 분포 추가 — 숫자만
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
                      '4편 여호수아와 함께 (13장)', (select coalesce(json_object_agg(d || '장 클리어', n order by d), '{}'::json) from (select d, count(*) n from (select least(13, coalesce((s->'sp'->'joshua'->>'ch')::int, 0) + (case when s->'sp'->'joshua'->>'cleared' = 'true' then 1 else 0 end)) d from st where s->'sp' ? 'joshua') a group by d) b))),
    'stuck',       (select coalesce(json_agg(s), '[]'::json) from (
                      select ch as chapter, step, count(distinct user_id) as players, (percentile_cont(0.5) within group (order by secs))::int as median_secs
                      from stp where created_at > now() - interval '14 days'
                      group by ch, step having count(distinct user_id) >= 2 and (percentile_cont(0.5) within group (order by secs)) >= 240
                      order by 4 desc limit 3) s),
    'errors_24h',  (select count(*) from errs where not fixed),
    'errors_fixed_24h', (select count(*) from errs where fixed)
  );
$function$;

notify pgrst, 'reload schema';
