-- 2026-10-12 In Odyssey 4편 「여호수아와 함께」 1부(1~4장) 서버 쪽
-- ① 장 완료 보상: 두루마리 4 → 진행 키 'joshua'
-- ② 배지 업적 키 추가(배열 끝에 붙여 기존 번호 유지): badge-red_cord, badge-twelve_stones
-- ③ 친구 목록 진행 표시에 4편
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
  v_id := case p_scroll when 0 then 'moses0' when 2 then 'sinai2' when 3 then 'wild3' when 4 then 'joshua' else null end;
  if v_id is null then raise exception '없는 두루마리예요.'; end if;
  if p_ch is null or p_ch < 1 or p_ch > 20 then raise exception '없는 장이에요.'; end if;
  v_st := public.odyssey_saved_story();
  v_p := v_st->'sp'->v_id;
  v_done := coalesce((v_p->>'ch')::int, 0) + case when (v_p->>'cleared') = 'true' then 1 else 0 end;
  if v_p is null or p_ch > v_done then return -1; end if;
  insert into points_ledger (user_id, action_type, points, ref_date, note)
  values (auth.uid(), 'odyssey_chapter', 20, date '2000-01-01' + 1000 + p_scroll * 50 + p_ch,
          'In Odyssey 두루마리 ' || p_scroll || ' · ' || p_ch || '장 완료')
  on conflict (user_id, action_type, ref_date) where action_type <> 'admin_award' do nothing;
  get diagnostics v_n = row_count;
  return case when v_n > 0 then 20 else 0 end;
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
                       'badge-red_cord','badge-twelve_stones'];
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
