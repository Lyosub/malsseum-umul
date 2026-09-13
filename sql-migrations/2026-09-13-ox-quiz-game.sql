-- 새 게임: 성경 O/X 스피드퀴즈. 하루 1회 +2달란트(초성퀴즈와 동일 패턴).
-- 적용 완료(Supabase Management API로 직접 실행함). 기록용, 재실행 안전은 아래 순서 그대로 따라야 함
-- (action_type CHECK 제약은 drop 후 재생성 방식이라 재실행해도 결과는 같음).

alter table points_ledger drop constraint if exists points_ledger_action_type_check;
alter table points_ledger add constraint points_ledger_action_type_check check (
  action_type = ANY (ARRAY[
    'attendance','streak_bonus','note','quiz','group_attendance_bonus','group_notes_bonus',
    'admin_award','greeting_draw','book_game','book_game_ot','book_game_nt',
    'match_game_books','match_game_figures','oikos_expense','badge_award','devotion',
    'oikos_donation','oikos_distribute','verse_memory','chosung_quiz','qt_reflection',
    'devotion_streak','verse_card_daily','verse_card_weekly','verse_card_monthly',
    'ox_quiz'
  ])
);

CREATE OR REPLACE FUNCTION public.submit_ox_quiz(p_correct integer)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_today date := (now() at time zone 'Asia/Seoul')::date;
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;
  if p_correct is null or p_correct < 0 or p_correct > 50 then
    raise exception '잘못된 점수입니다.';
  end if;
  insert into points_ledger (user_id, action_type, points, ref_date)
  values (auth.uid(), 'ox_quiz', 2, v_today)
  on conflict (user_id, action_type, ref_date) where action_type <> 'admin_award' do nothing;
  return case when found then 2 else 0 end;
end;
$function$;

-- get_daily_game_status에 ox_quiz_done 컬럼 추가(반환 타입 변경이라 drop 후 재생성).
drop function if exists get_daily_game_status();

CREATE OR REPLACE FUNCTION public.get_daily_game_status()
 RETURNS TABLE(verse_memory_done boolean, chosung_done boolean, ox_quiz_done boolean)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select
    exists (select 1 from points_ledger where user_id = auth.uid()
            and action_type = 'verse_memory'
            and ref_date = (now() at time zone 'Asia/Seoul')::date),
    exists (select 1 from points_ledger where user_id = auth.uid()
            and action_type = 'chosung_quiz'
            and ref_date = (now() at time zone 'Asia/Seoul')::date),
    exists (select 1 from points_ledger where user_id = auth.uid()
            and action_type = 'ox_quiz'
            and ref_date = (now() at time zone 'Asia/Seoul')::date);
$function$;
