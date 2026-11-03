-- 첫 화면 「오늘의 1분」 체크 상태를 한 번에 읽는다. 읽기 전용이고 본인 기록만 돌려준다.
-- 묵상: devotion_checkins, 외우기: points_ledger(verse_memory), 감사: notes(gratitude). 날짜는 한국 시간 기준.
create or replace function public.get_my_today_minute()
returns table(devotion boolean, memorize boolean, gratitude boolean, streak integer)
language plpgsql
stable
security definer
set search_path to 'public'
as $$
declare
  uid uuid := auth.uid();
  v_today date := (now() at time zone 'Asia/Seoul')::date;
  v_cur integer := 0;
  v_prev date;
begin
  if uid is null then
    raise exception 'login required';
  end if;
  if exists (select 1 from devotion_checkins c where c.user_id = uid and c.date = v_today) then
    v_prev := v_today;
  elsif exists (select 1 from devotion_checkins c where c.user_id = uid and c.date = v_today - 1) then
    v_prev := v_today - 1;
  end if;
  while v_prev is not null and exists (select 1 from devotion_checkins c where c.user_id = uid and c.date = v_prev) loop
    v_cur := v_cur + 1;
    v_prev := v_prev - 1;
  end loop;
  return query select
    exists (select 1 from devotion_checkins c where c.user_id = uid and c.date = v_today),
    exists (select 1 from points_ledger l where l.user_id = uid and l.action_type = 'verse_memory' and l.ref_date = v_today),
    exists (select 1 from notes n where n.user_id = uid and n.type = 'gratitude' and (n.created_at at time zone 'Asia/Seoul')::date = v_today),
    v_cur;
end;
$$;
revoke all on function public.get_my_today_minute() from public, anon;
grant execute on function public.get_my_today_minute() to authenticated;
