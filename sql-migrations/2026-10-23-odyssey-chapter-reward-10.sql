-- In Odyssey 장 보상 20 → 10달란트, 지금까지 받은 것도 10으로 (2026-10-23 전도사님)
create table if not exists public.points_ledger_backup_odyssey_20261023 as
  select * from public.points_ledger where action_type = 'odyssey_chapter';
revoke all on public.points_ledger_backup_odyssey_20261023 from anon, authenticated;
update public.points_ledger set points = 10 where action_type = 'odyssey_chapter' and points = 20;
CREATE OR REPLACE FUNCTION public.claim_odyssey_chapter(p_ch integer)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_n integer; v_st jsonb; v_done integer;
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;
  if p_ch < 1 or p_ch > 10 then raise exception '없는 장이에요.'; end if;
  v_st := public.odyssey_saved_story();
  v_done := coalesce((v_st->>'ch')::int, 0) + case when (v_st->>'cleared') = 'true' then 1 else 0 end;
  if v_st is null or p_ch > v_done then return -1; end if;
  insert into points_ledger (user_id, action_type, points, ref_date, note)
  values (auth.uid(), 'odyssey_chapter', 10, date '2000-01-01' + p_ch, 'In Odyssey ' || p_ch || '장 완료')
  on conflict (user_id, action_type, ref_date) where action_type <> 'admin_award' do nothing;
  get diagnostics v_n = row_count;
  return case when v_n > 0 then 10 else 0 end;
end;
$function$
;
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
  values (auth.uid(), 'odyssey_chapter', 10, date '2000-01-01' + 1000 + p_scroll * 50 + p_ch,
          'In Odyssey 두루마리 ' || p_scroll || ' · ' || p_ch || '장 완료')
  on conflict (user_id, action_type, ref_date) where action_type <> 'admin_award' do nothing;
  get diagnostics v_n = row_count;
  return case when v_n > 0 then 10 else 0 end;
end;
$function$
;
