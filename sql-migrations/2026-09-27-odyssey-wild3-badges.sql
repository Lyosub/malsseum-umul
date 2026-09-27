-- In Odyssey 2편 새 배지 2개 + 3편 배지 2개(젖과 꿀을 본 사람 · 갈렙과 함께 선 사람, 2026-09-27 추가): 거룩한 백성(밭 모퉁이 남기기를 한 번에) · 나팔 소리를 따르는 사람(은 나팔 신호를 한 번도 안 틀림)
-- 라이브 함수(29개 키)를 그대로 두고 끝에 두 개만 덧붙인다 — 기존 키의 순서(=ref_date)는 바뀌지 않는다. 여러 번 실행해도 같다.
create or replace function public.claim_odyssey_achieve(p_key text)
returns integer language plpgsql security definer set search_path = public as $$
declare v_idx int; v_pts int; v_n integer;
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
                       'badge-grape_carry','badge-with_caleb'];
begin
  if auth.uid() is null or not public.can_see_odyssey() then return 0; end if;
  v_idx := array_position(keys, p_key);
  if v_idx is null then return 0; end if;
  v_pts := case when p_key like 'scroll-%' then 10 when p_key in ('badge-hidden_all', 'badge-side_all') then 10 else 3 end;
  insert into points_ledger (user_id, action_type, points, ref_date, note)
  values (auth.uid(), 'odyssey_achieve', v_pts, date '2000-01-01' + v_idx, 'In Odyssey 업적: ' || p_key)
  on conflict (user_id, action_type, ref_date) where action_type <> 'admin_award' do nothing;
  get diagnostics v_n = row_count;
  return case when v_n > 0 then v_pts else 0 end;
end $$;
revoke all on function public.claim_odyssey_achieve(text) from public, anon;
grant execute on function public.claim_odyssey_achieve(text) to authenticated;
