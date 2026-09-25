-- 2026-09-25 In Odyssey 3장 「유월절 밤」 공개 준비: 장 완료 달란트를 3장까지 받을 수 있게(계정당 장마다 한 번 20달란트).
-- points_ledger_auto_uniq 인덱스·on conflict 절은 그대로(2026-09-25-odyssey-shop.sql 과 같은 predicate).
create or replace function public.claim_odyssey_chapter(p_ch integer)
 returns integer
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_n integer;
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;
  if p_ch < 1 or p_ch > 3 then raise exception '아직 없는 장이에요.'; end if;   -- 새 장을 열 때 최댓값을 올린다
  insert into points_ledger (user_id, action_type, points, ref_date, note)
  values (auth.uid(), 'odyssey_chapter', 20, date '2000-01-01' + p_ch, 'In Odyssey ' || p_ch || '장 완료')
  on conflict (user_id, action_type, ref_date) where action_type <> 'admin_award' do nothing;
  get diagnostics v_n = row_count;
  return case when v_n > 0 then 20 else 0 end;
end;
$function$;
select 'ok — odyssey ch3' as status;
