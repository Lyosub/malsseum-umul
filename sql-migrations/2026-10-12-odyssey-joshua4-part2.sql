-- 2026-10-12 In Odyssey 4편 2부(5~8장): 배지 업적 키 badge-seventh_day 추가(배열 끝에 붙여 기존 번호 유지)
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
                       'badge-seventh_day'];
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
