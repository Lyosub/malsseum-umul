-- In Odyssey 달란트 퀘스트 추가 (2026-09-25 밤)
-- 1) 이번 주 퀘스트 3개 완료 → 주 1회 15달란트 (ref_date = 그 주 월요일, 한국 시간)
-- 2) 업적 보상(계정당 한 번씩): 배지 12종 각 3달란트, 두루마리 마을 완성 4곳 각 10달란트
-- 모두 can_see_odyssey()(관리자·시험 참여자)만. 재실행 안전.

alter table points_ledger drop constraint if exists points_ledger_action_type_check;
alter table points_ledger add constraint points_ledger_action_type_check
  check (action_type = any (array[
    'attendance','streak_bonus','note','quiz','group_attendance_bonus','group_notes_bonus',
    'admin_award','greeting_draw','book_game','book_game_ot','book_game_nt',
    'match_game_books','match_game_figures','oikos_expense','badge_award','devotion',
    'oikos_donation','oikos_distribute',
    'verse_memory','chosung_quiz','qt_reflection','devotion_streak',
    'verse_card_daily','verse_card_weekly','verse_card_monthly',
    'ox_quiz',
    'sermon_line',
    'odyssey_chapter',
    'odyssey_daily',
    'odyssey_weekly',
    'odyssey_achieve'
  ]));

create or replace function public.claim_odyssey_weekly()
returns integer language plpgsql security definer set search_path = public as $$
declare v_n integer; v_mon date;
begin
  if auth.uid() is null or not public.can_see_odyssey() then return 0; end if;
  v_mon := date_trunc('week', (now() at time zone 'Asia/Seoul'))::date;   -- 월요일
  insert into points_ledger (user_id, action_type, points, ref_date, note)
  values (auth.uid(), 'odyssey_weekly', 15, v_mon, 'In Odyssey 이번 주 퀘스트')
  on conflict (user_id, action_type, ref_date) where action_type <> 'admin_award' do nothing;
  get diagnostics v_n = row_count;
  return case when v_n > 0 then 15 else 0 end;
end $$;

-- 업적 키 → 고유 번호(ref_date = 2000-01-01 + 번호)와 달란트
create or replace function public.claim_odyssey_achieve(p_key text)
returns integer language plpgsql security definer set search_path = public as $$
declare v_idx int; v_pts int; v_n integer;
  keys text[] := array['badge-wise','badge-pray_start','badge-companion','badge-prayer','badge-share','badge-trust',
                       'badge-true_heart','badge-passover_lamb','badge-bold_step','badge-together','badge-timbrel','badge-scroll_all',
                       'scroll-alpha','scroll-midian','scroll-egypt','scroll-redsea'];
begin
  if auth.uid() is null or not public.can_see_odyssey() then return 0; end if;
  v_idx := array_position(keys, p_key);
  if v_idx is null then return 0; end if;
  v_pts := case when p_key like 'scroll-%' then 10 else 3 end;
  insert into points_ledger (user_id, action_type, points, ref_date, note)
  values (auth.uid(), 'odyssey_achieve', v_pts, date '2000-01-01' + v_idx, 'In Odyssey 업적: ' || p_key)
  on conflict (user_id, action_type, ref_date) where action_type <> 'admin_award' do nothing;
  get diagnostics v_n = row_count;
  return case when v_n > 0 then v_pts else 0 end;
end $$;

revoke all on function public.claim_odyssey_weekly() from public, anon;
revoke all on function public.claim_odyssey_achieve(text) from public, anon;
grant execute on function public.claim_odyssey_weekly() to authenticated;
grant execute on function public.claim_odyssey_achieve(text) to authenticated;
