-- In Odyssey 히든 퀘스트 (2026-09-26): 8개를 모두 찾으면 배지 「숨은 이야기를 찾은 사람」 — 업적 키 목록 끝에 추가(기존 번호는 그대로)
-- 재실행해도 안전(idempotent).
create or replace function public.claim_odyssey_achieve(p_key text)
returns integer language plpgsql security definer set search_path = public as $$
declare v_idx int; v_pts int; v_n integer;
  keys text[] := array['badge-wise','badge-pray_start','badge-companion','badge-prayer','badge-share','badge-trust',
                       'badge-true_heart','badge-passover_lamb','badge-bold_step','badge-together','badge-timbrel','badge-scroll_all',
                       'scroll-alpha','scroll-midian','scroll-egypt','scroll-redsea','badge-daily_bread',
                       'badge-raised_hands','badge-true_leader','badge-ten_words',
                       'badge-idol_breaker','badge-craftsman',
                       'badge-hidden_all'];
begin
  if auth.uid() is null or not public.can_see_odyssey() then return 0; end if;
  v_idx := array_position(keys, p_key);
  if v_idx is null then return 0; end if;
  v_pts := case when p_key like 'scroll-%' then 10 when p_key = 'badge-hidden_all' then 10 else 3 end;
  insert into points_ledger (user_id, action_type, points, ref_date, note)
  values (auth.uid(), 'odyssey_achieve', v_pts, date '2000-01-01' + v_idx, 'In Odyssey 업적: ' || p_key)
  on conflict (user_id, action_type, ref_date) where action_type <> 'admin_award' do nothing;
  get diagnostics v_n = row_count;
  return case when v_n > 0 then v_pts else 0 end;
end $$;
