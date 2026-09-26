-- In Odyssey 하루 요약(2026-09-26): 일일 자동 점검에 「In Odyssey」 항목을 넣기 위한 공개 집계 함수.
-- 사람 이름·아이디는 돌려주지 않고 숫자만 준다(get_recent_error_count 와 같은 방식). GitHub Actions 가 anon 키로 부른다.
-- 재실행 안전.
create or replace function public.get_odyssey_summary()
returns json language sql security definer set search_path = public as $$
  select json_build_object(
    'testers',     (select count(*) from odyssey_testers),
    'players',     (select count(*) from odyssey_progress),
    'active_24h',  (select count(distinct user_id) from odyssey_steplog where created_at > now() - interval '24 hours'),
    'saved_24h',   (select count(*) from odyssey_save where updated_at > now() - interval '24 hours'),   -- 계정 저장이 갱신된 사람 수(실제로 플레이한 사람)
    'steps_24h',   (select count(*) from odyssey_steplog where created_at > now() - interval '24 hours'),
    'active_7d',   (select count(distinct user_id) from odyssey_steplog where created_at > now() - interval '7 days'),
    'chapters',    (select coalesce(json_object_agg(chapters, n order by chapters), '{}'::json) from (select chapters, count(*) n from odyssey_progress group by chapters) c),
    'stuck',       (select coalesce(json_agg(s), '[]'::json) from (
                      select ch as chapter, step, count(distinct user_id) as players, (percentile_cont(0.5) within group (order by secs))::int as median_secs
                      from odyssey_steplog where created_at > now() - interval '14 days'
                      group by ch, step having (percentile_cont(0.5) within group (order by secs)) >= 240
                      order by 4 desc limit 3) s),
    'errors_24h',  (select count(*) from client_errors where occurred_at > now() - interval '24 hours' and page ilike '%odyssey%')
  );
$$;
revoke all on function public.get_odyssey_summary() from public;
grant execute on function public.get_odyssey_summary() to anon, authenticated;
