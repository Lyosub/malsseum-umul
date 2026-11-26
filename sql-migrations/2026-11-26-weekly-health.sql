-- 2026-11-26 주간 사이트 점검용 숫자(이름·내용 없이 숫자만). 볼트 scripts/health/weekly_site_check.py 가 매주 월요일 부른다.
-- DB·저장 공간 크기(무료 한도 대비), 지난 7일 화면 오류 수, 나그네 마을 이번 주·지난주 활동한 사람 수.
create or replace function public.get_weekly_health()
returns json
language sql
stable security definer
set search_path to 'public'
as $function$
  with excluded as (select user_id from profiles where is_admin or nickname ilike 'zzz%')
  select json_build_object(
    'db_mb', round(pg_database_size(current_database()) / 1048576.0, 1),
    'storage_mb', (select round(coalesce(sum((metadata->>'size')::bigint), 0) / 1048576.0, 1) from storage.objects),
    'errors_7d', (select count(*) from client_errors where occurred_at > now() - interval '7 days'),
    'error_kinds_7d', (select count(distinct left(coalesce(message, ''), 80)) from client_errors where occurred_at > now() - interval '7 days'),
    'ark_active_7d', (select count(*) from ark_player_state where updated_at > now() - interval '7 days' and user_id not in (select user_id from excluded)),
    'ark_active_prev_7d', (select count(*) from ark_player_state where updated_at > now() - interval '14 days' and updated_at <= now() - interval '7 days' and user_id not in (select user_id from excluded)),
    'ark_chat_7d', (select count(*) from ark_chat where created_at > now() - interval '7 days')
  );
$function$;

revoke all on function public.get_weekly_health() from public;
grant execute on function public.get_weekly_health() to anon, authenticated;
