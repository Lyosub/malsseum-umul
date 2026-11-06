-- 새해 말씀카드 뽑기를 11/6부터 모두에게 시험으로 연다(전도사님 11/6). 12/1 0시(한국 시간)에 시험 기간 뽑기 기록을 지워 12/1부터 새로 뽑게 한다.
create or replace function public.yearend_is_open(p_year integer)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select (now() at time zone 'Asia/Seoul')::date between make_date(p_year, 11, 6) and make_date(p_year + 1, 1, 31)
      or exists (select 1 from profiles where user_id = auth.uid() and (is_admin or is_department_head));
$$;

-- 12/1 00:00 KST = 11/30 15:00 UTC. 시험 기록을 지우고 이 예약은 스스로 지운다.
select cron.schedule('yearend-test-reset', '0 15 30 11 *', $job$
  delete from public.yearend_draws where year = 2026 and drawn_at < timestamptz '2026-12-01 00:00:00+09';
  select cron.unschedule('yearend-test-reset');
$job$);
