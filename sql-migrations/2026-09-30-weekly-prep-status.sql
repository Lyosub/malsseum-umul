-- 주간 산출물 점검용(2026-09-30): 그 주일의 예배 암호·수요 성경퀴즈가 DB에 등록돼 있는지 "있다/없다"만 알려 준다.
-- 정답·문제·구절 등 내용은 돌려주지 않는다(공개 저장소·익명 호출이므로). 볼트의 문서 최신화 점검이 매일 13:00에 부른다.
-- 퀴즈는 설교한 주일 다음 날(월요일)이 week_start 다: 10/4 설교 → week_start 2026-10-05.
create or replace function public.get_weekly_prep_status(p_service_date date)
returns jsonb language sql stable security definer set search_path to 'public' as $$
  select jsonb_build_object(
    'worship_registered', exists (select 1 from public.odyssey_worship w where w.service_date = p_service_date),
    'quiz_registered',    exists (select 1 from public.quiz_questions q where q.week_start = p_service_date + 1));
$$;
revoke all on function public.get_weekly_prep_status(date) from public;
grant execute on function public.get_weekly_prep_status(date) to anon, authenticated;
