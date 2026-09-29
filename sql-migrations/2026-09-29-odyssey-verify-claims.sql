-- In Odyssey 보상 서버 검증(2026-09-29): 진행하지 않은 계정이 보상 함수를 직접 불러 달란트를 받는 것을 막는다.
-- 서버에 저장된 진행 기록(odyssey_save)에 그 장/배지가 실제로 있을 때만 준다. 없으면 -1을 돌려줘 "아직 확인 안 됨"을 알린다(0 = 이미 받음).
-- 전제: 게임 화면이 청구 전에 진행을 먼저 저장한다(2026-09-29 배포). 새 두루마리를 추가하면 아래 v_id 매핑도 함께 늘릴 것.
-- 재실행 안전. points_ledger 의 on conflict 절과 인덱스(points_ledger_auto_uniq, action_type <> 'admin_award')는 그대로다.
create or replace function public.odyssey_saved_story()
returns jsonb language sql stable security definer set search_path to 'public' as $$
  select case when jsonb_typeof(s.data->'keys'->'inodyssey.proto.story') = 'string'
              then (s.data->'keys'->>'inodyssey.proto.story')::jsonb
              else s.data->'keys'->'inodyssey.proto.story' end
    from public.odyssey_save s where s.user_id = auth.uid();
$$;
revoke all on function public.odyssey_saved_story() from public, anon;
grant execute on function public.odyssey_saved_story() to authenticated;

-- 모세 편 1~10장
create or replace function public.claim_odyssey_chapter(p_ch integer)
returns integer language plpgsql security definer set search_path to 'public' as $function$
declare v_n integer; v_st jsonb; v_done integer;
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;
  if p_ch < 1 or p_ch > 10 then raise exception '없는 장이에요.'; end if;
  v_st := public.odyssey_saved_story();
  v_done := coalesce((v_st->>'ch')::int, 0) + case when (v_st->>'cleared') = 'true' then 1 else 0 end;
  if v_st is null or p_ch > v_done then return -1; end if;
  insert into points_ledger (user_id, action_type, points, ref_date, note)
  values (auth.uid(), 'odyssey_chapter', 20, date '2000-01-01' + p_ch, 'In Odyssey ' || p_ch || '장 완료')
  on conflict (user_id, action_type, ref_date) where action_type <> 'admin_award' do nothing;
  get diagnostics v_n = row_count;
  return case when v_n > 0 then 20 else 0 end;
end;
$function$;

-- 두루마리 0(첫머리)·2·3편 장 보상
create or replace function public.claim_odyssey_scroll_chapter(p_scroll integer, p_ch integer)
returns integer language plpgsql security definer set search_path to 'public' as $function$
declare v_n integer; v_st jsonb; v_id text; v_p jsonb; v_done integer;
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;
  if not public.can_see_odyssey() then return 0; end if;
  v_id := case p_scroll when 0 then 'moses0' when 2 then 'sinai2' when 3 then 'wild3' else null end;
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
revoke all on function public.claim_odyssey_scroll_chapter(integer, integer) from public;
grant execute on function public.claim_odyssey_scroll_chapter(integer, integer) to authenticated;

-- 업적(배지 3 · 마을 두루마리 10): 키 목록과 순서(=ref_date)는 2026-09-27-odyssey-wild3-badges.sql 과 같다. 저장된 배지/구절 두루마리에 실제로 있을 때만 준다.
create or replace function public.claim_odyssey_achieve(p_key text)
returns integer language plpgsql security definer set search_path = public as $$
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
                       'badge-looked_up','badge-refuge_run','badge-hear_israel'];
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
end $$;
revoke all on function public.claim_odyssey_achieve(text) from public, anon;
grant execute on function public.claim_odyssey_achieve(text) to authenticated;
