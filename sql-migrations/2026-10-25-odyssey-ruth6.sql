-- 2026-10-25 In Odyssey 6편 「룻과 사무엘」 서버 쪽
-- ① 장 완료 보상: 두루마리 6 → 'ruth' ② 배지 키 4개(배열 끝에) ③ 친구 목록 「6편 N장」 ④ 하루 요약 6편 ⑤ 관리자 탭 6편 진행
CREATE OR REPLACE FUNCTION public.claim_odyssey_scroll_chapter(p_scroll integer, p_ch integer)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_n integer; v_st jsonb; v_id text; v_p jsonb; v_done integer;
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;
  if not public.can_see_odyssey() then return 0; end if;
  v_id := case p_scroll when 0 then 'moses0' when 2 then 'sinai2' when 3 then 'wild3' when 4 then 'joshua' when 5 then 'judges' when 6 then 'ruth' else null end;
  if v_id is null then raise exception '없는 두루마리예요.'; end if;
  if p_ch is null or p_ch < 1 or p_ch > 20 then raise exception '없는 장이에요.'; end if;
  v_st := public.odyssey_saved_story();
  v_p := v_st->'sp'->v_id;
  v_done := coalesce((v_p->>'ch')::int, 0) + case when (v_p->>'cleared') = 'true' then 1 else 0 end;
  if v_p is null or p_ch > v_done then return -1; end if;
  insert into points_ledger (user_id, action_type, points, ref_date, note)
  values (auth.uid(), 'odyssey_chapter', 10, date '2000-01-01' + 1000 + p_scroll * 50 + p_ch,
          'In Odyssey 두루마리 ' || p_scroll || ' · ' || p_ch || '장 완료')
  on conflict (user_id, action_type, ref_date) where action_type <> 'admin_award' do nothing;
  get diagnostics v_n = row_count;
  return case when v_n > 0 then 10 else 0 end;
end;
$function$;

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
                       'badge-peacemaker','badge-my_house',
                       'badge-cycle_remember','badge-kishon',
                       'badge-fleece_twice','badge-jar_torch',
                       'badge-riddle','badge-last_prayer','badge-twelve_judges',
                       'badge-walk_with','badge-gleaner','badge-speak_lord','badge-ebenezer'];
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

CREATE OR REPLACE FUNCTION public.get_odyssey_people()
 RETURNS TABLE(user_id uuid, nickname text, title text, rel text, likes integer, prog text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select x.user_id, x.nickname, x.title, x.rel, x.likes,
         case when x.rel = 'friend' then (
           select case
             when s.j is null then null
             when s.j->'sp'->'ruth' is not null then
               '6편 ' || case when (s.j->'sp'->'ruth'->>'cleared')::boolean is true and (s.j->'sp'->'ruth'->>'ch')::int >= 8 then '완료'
                              when (s.j->'sp'->'ruth'->>'cleared')::boolean is true then ((s.j->'sp'->'ruth'->>'ch')::int + 1) || '장까지 완료'
                              else ((s.j->'sp'->'ruth'->>'ch')::int + 1) || '장' end
             when s.j->'sp'->'judges' is not null then
               '5편 ' || case when (s.j->'sp'->'judges'->>'cleared')::boolean is true and (s.j->'sp'->'judges'->>'ch')::int >= 11 then '완료'
                              when (s.j->'sp'->'judges'->>'cleared')::boolean is true then ((s.j->'sp'->'judges'->>'ch')::int + 1) || '장까지 완료'
                              else ((s.j->'sp'->'judges'->>'ch')::int + 1) || '장' end
             when s.j->'sp'->'joshua' is not null then
               '4편 ' || case when (s.j->'sp'->'joshua'->>'cleared')::boolean is true and (s.j->'sp'->'joshua'->>'ch')::int >= 12 then '완료'
                              when (s.j->'sp'->'joshua'->>'cleared')::boolean is true then ((s.j->'sp'->'joshua'->>'ch')::int + 1) || '장까지 완료'
                              else ((s.j->'sp'->'joshua'->>'ch')::int + 1) || '장' end
             when s.j->'sp'->'wild3' is not null then
               '3편 ' || case when (s.j->'sp'->'wild3'->>'cleared')::boolean is true and (s.j->'sp'->'wild3'->>'ch')::int >= 15 then '완료' else ((s.j->'sp'->'wild3'->>'ch')::int + 1) || '장' end
             when s.j->'sp'->'sinai2' is not null then
               '2편 ' || case when (s.j->'sp'->'sinai2'->>'cleared')::boolean is true and (s.j->'sp'->'sinai2'->>'ch')::int >= 9 then '완료' else ((s.j->'sp'->'sinai2'->>'ch')::int + 1) || '장' end
             else
               '1편 ' || case when (s.j->>'cleared')::boolean is true and (s.j->>'ch')::int >= 9 then '완료' else ((s.j->>'ch')::int + 1) || '장' end
           end
           from (select case when o.data::jsonb->'keys' ? 'inodyssey.proto.story'
                             then (o.data::jsonb->'keys'->>'inodyssey.proto.story')::jsonb end as j
                 from public.odyssey_save o where o.user_id = x.user_id) s
         ) end as prog
  from (
    select p.user_id, p.nickname, pr.title,
           case when f.status = 'accepted' then 'friend' when f.status = 'pending' and f.requested_by = auth.uid() then 'sent'
                when f.status = 'pending' then 'received' else 'none' end as rel,
           (select count(*)::int from odyssey_home_likes l where l.owner = p.user_id) as likes
    from profiles p
    left join odyssey_progress pr on pr.user_id = p.user_id
    left join odyssey_friends f on f.a = least(auth.uid(), p.user_id) and f.b = greatest(auth.uid(), p.user_id)
    where public.can_see_odyssey() and p.user_id <> auth.uid() and p.user_id in (select public.odyssey_people_ids())
  ) x
  order by (x.rel = 'friend') desc, (x.rel = 'received') desc, x.nickname;
$function$;

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
                      '6편 룻과 사무엘 (9장)', (select coalesce(json_object_agg(d || '장 클리어', n order by d), '{}'::json) from (select d, count(*) n from (select least(9, coalesce((s->'sp'->'ruth'->>'ch')::int, 0) + (case when s->'sp'->'ruth'->>'cleared' = 'true' then 1 else 0 end)) d from st where s->'sp' ? 'ruth') a group by d) b))),
    'stuck',       (select coalesce(json_agg(s), '[]'::json) from (
                      select ch as chapter, step, count(distinct user_id) as players, (percentile_cont(0.5) within group (order by secs))::int as median_secs
                      from stp where created_at > now() - interval '14 days'
                      group by ch, step having count(distinct user_id) >= 2 and (percentile_cont(0.5) within group (order by secs)) >= 240
                      order by 4 desc limit 3) s),
    'errors_24h',  (select count(*) from errs where not fixed),
    'errors_fixed_24h', (select count(*) from errs where fixed)
  );
$function$;

create or replace function public.get_odyssey_admin_overview()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with staff as (
    select p.is_admin from public.profiles p
    where p.user_id = auth.uid() and (p.is_admin or p.is_department_head)
  ),
  st as (
    select s.user_id, s.updated_at,
           case when s.data::jsonb->'keys' ? 'inodyssey.proto.story'
                then (s.data::jsonb->'keys'->>'inodyssey.proto.story')::jsonb end as story
    from public.odyssey_save s
  ),
  earned as (
    select t.user_id,
           jsonb_agg(jsonb_build_object('type', t.action_type, 'n', t.n, 'pts', t.pts) order by t.pts desc) as by_type,
           sum(t.pts)::int as total
    from (
      select user_id, action_type, count(*)::int as n, sum(points)::int as pts
      from public.points_ledger
      where action_type like 'odyssey\_%'
      group by user_id, action_type
    ) t
    group by t.user_id
  ),
  bought as (
    select o.user_id,
           sum(case when o.status in ('pending', 'approved', 'delivered') then o.cost_snapshot else 0 end)::int as spent,
           count(*) filter (where o.status in ('pending', 'approved', 'delivered'))::int as n,
           (select jsonb_agg(jsonb_build_object('name', x.item_name, 'cost', x.cost_snapshot, 'at', x.created_at, 'status', x.status) order by x.created_at desc)
              from (select * from public.shop_orders z where z.user_id = o.user_id and z.item_name like '[게임]%' order by z.created_at desc limit 60) x) as list
    from public.shop_orders o
    where o.item_name like '[게임]%'
    group by o.user_id
  ),
  people as (
    select user_id from st
    union select user_id from earned
    union select user_id from bought
  )
  select case when not exists (select 1 from staff) then '[]'::jsonb else
    coalesce(jsonb_agg(jsonb_build_object(
      'user_id', pe.user_id,
      'nickname', pr.nickname,
      'real_name', case when exists (select 1 from staff where is_admin) then pr.real_name else null end,
      'saved_at', st.updated_at,
      'moses', case when st.story is null then null else jsonb_build_object('ch', st.story->'ch', 'step', st.story->'step', 'cleared', st.story->'cleared') end,
      'sinai2', st.story->'sp'->'sinai2',
      'wild3', st.story->'sp'->'wild3',
      'joshua', st.story->'sp'->'joshua',
      'judges', st.story->'sp'->'judges',
      'judges12', coalesce(st.story->'judges12', '[]'::jsonb),
      'ruth', st.story->'sp'->'ruth',
      'mat', coalesce(st.story->'mat', '{}'::jsonb),
      'badges', coalesce(st.story->'badges', '[]'::jsonb),
      'verses_n', coalesce(jsonb_array_length(case when jsonb_typeof(st.story->'verses') = 'array' then st.story->'verses' end), 0),
      'stars', coalesce(st.story->'stars', '0'::jsonb),
      'pets', coalesce(st.story->'petAff', '{}'::jsonb),
      'pet_v', st.story->'petAffV',
      'title', st.story->>'title',
      'manna', coalesce(st.story->'manna', '0'::jsonb),
      'last_seen', st.story->'lastSeen',
      'worship_n', coalesce(jsonb_array_length(case when jsonb_typeof(st.story->'worshipCards') = 'array' then st.story->'worshipCards' end), 0),
      'earned', coalesce(ea.by_type, '[]'::jsonb),
      'earned_total', coalesce(ea.total, 0),
      'spent_total', coalesce(bo.spent, 0),
      'buy_n', coalesce(bo.n, 0),
      'orders', coalesce(bo.list, '[]'::jsonb)
    ) order by coalesce(st.updated_at, 'epoch'::timestamptz) desc), '[]'::jsonb)
  end
  from people pe
  join public.profiles pr on pr.user_id = pe.user_id
  left join st on st.user_id = pe.user_id
  left join earned ea on ea.user_id = pe.user_id
  left join bought bo on bo.user_id = pe.user_id
  where exists (select 1 from staff);
$$;

notify pgrst, 'reload schema';
