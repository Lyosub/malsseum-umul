-- In Odyssey 두루마리별 장 완료 보상(2026-09-27): 모세 편(1편)은 기존 claim_odyssey_chapter(1~10장) 그대로 두고,
-- 첫머리(0번)·2편부터는 이 함수로 20달란트를 준다. 두루마리마다 장마다 한 번만(ref_date 로 구분). 재실행 안전.
--   ref_date = 2000-01-01 + 1000 + 두루마리번호*50 + 장   (모세 편의 1~10 과 겹치지 않음)
create or replace function public.claim_odyssey_scroll_chapter(p_scroll integer, p_ch integer)
returns integer language plpgsql security definer set search_path to 'public' as $function$
declare v_n integer;
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;
  if not public.can_see_odyssey() then return 0; end if;
  if p_scroll is null or p_scroll < 0 or p_scroll > 40 or p_scroll = 1 then raise exception '없는 두루마리예요.'; end if;
  if p_ch is null or p_ch < 1 or p_ch > 20 then raise exception '없는 장이에요.'; end if;
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
