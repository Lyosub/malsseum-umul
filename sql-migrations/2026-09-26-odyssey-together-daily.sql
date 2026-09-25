-- In Odyssey: 같은 마을 친구 보기(실시간) · 오늘의 퀘스트 달란트 (2026-09-26)
-- 다시 실행해도 안전.

-- 1) 실시간 채널 'odyssey-world'(비공개 채널): 관리자·시험 참여자만 듣고 보낼 수 있음
drop policy if exists odyssey_rt_read on realtime.messages;
drop policy if exists odyssey_rt_write on realtime.messages;
create policy odyssey_rt_read on realtime.messages for select to authenticated
  using (realtime.topic() = 'odyssey-world' and public.can_see_odyssey());
create policy odyssey_rt_write on realtime.messages for insert to authenticated
  with check (realtime.topic() = 'odyssey-world' and public.can_see_odyssey());

-- 게임에서 내 이름표에 쓸 닉네임
create or replace function public.get_my_odyssey_name()
returns text language sql stable security definer set search_path = public as $$
  select case when public.can_see_odyssey() then (select nickname from profiles where user_id = auth.uid()) end;
$$;
revoke all on function public.get_my_odyssey_name() from public, anon;
grant execute on function public.get_my_odyssey_name() to authenticated;

-- 2) 오늘의 퀘스트 3개를 다 하면 하루 한 번 5달란트(한국 시간 날짜 기준)
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
    'odyssey_daily'
  ]));

create or replace function public.claim_odyssey_daily()
returns integer language plpgsql security definer set search_path = public as $$
declare v_n integer;
begin
  if auth.uid() is null or not public.can_see_odyssey() then return 0; end if;
  insert into points_ledger (user_id, action_type, points, ref_date, note)
  values (auth.uid(), 'odyssey_daily', 5, (now() at time zone 'Asia/Seoul')::date, 'In Odyssey 오늘의 퀘스트')
  on conflict (user_id, action_type, ref_date) where action_type <> 'admin_award' do nothing;
  get diagnostics v_n = row_count;
  return case when v_n > 0 then 5 else 0 end;
end $$;
revoke all on function public.claim_odyssey_daily() from public, anon;
grant execute on function public.claim_odyssey_daily() to authenticated;
