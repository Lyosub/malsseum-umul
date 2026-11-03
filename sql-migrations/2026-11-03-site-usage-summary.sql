-- 말씀우물 이용 현황 공개 집계(숫자만, 이름·아이디·내용 없음). 일일 자동 점검이 health 브랜치의 site-usage.json으로 읽는다.
-- 관리자와 시험 계정(zzz로 시작하는 닉네임)은 뺀다. 날짜는 한국 시간 기준.
create or replace function public.get_site_usage_summary()
returns json
language sql
stable security definer
set search_path to 'public'
as $function$
  with
  today as (select (now() at time zone 'Asia/Seoul')::date d),
  excluded as (select user_id from profiles where is_admin or nickname ilike 'zzz%'),
  raw as (
    select 'attendance' k, user_id, date d from attendance
    union all select 'devotion', user_id, date from devotion_checkins
    union all select 'note_' || type, user_id, (created_at at time zone 'Asia/Seoul')::date from notes
    union all select 'verse_draw', user_id, (created_at at time zone 'Asia/Seoul')::date from verse_draws
    union all select 'quiz', user_id, (created_at at time zone 'Asia/Seoul')::date from quiz_answers
    union all select 'board', user_id, (created_at at time zone 'Asia/Seoul')::date from board_posts
    union all select 'prayer_reaction', user_id, (created_at at time zone 'Asia/Seoul')::date from prayer_reactions
    union all select 'memorize', user_id, played_on from verse_memory_daily
    union all select 'reading', user_id, (updated_at at time zone 'Asia/Seoul')::date from reading_progress
    union all select 'qt_reflection', user_id, (updated_at at time zone 'Asia/Seoul')::date from qt_reflections
    union all select 'odyssey', user_id, (created_at at time zone 'Asia/Seoul')::date from odyssey_steplog
  ),
  act as (
    select r.k, r.user_id, r.d from raw r, today t
    where r.user_id is not null and r.d >= t.d - 90 and r.d <= t.d
      and r.user_id not in (select user_id from excluded)
  ),
  a7 as (select distinct user_id from act, today t where act.d > t.d - 7),
  p7 as (select distinct user_id from act, today t where act.d > t.d - 14 and act.d <= t.d - 7),
  first_seen as (
    select user_id, min(d) f from (
      select user_id, date d from attendance
      union all select user_id, (created_at at time zone 'Asia/Seoul')::date from notes
      union all select user_id, (created_at at time zone 'Asia/Seoul')::date from odyssey_steplog
    ) x group by user_id
  )
  select json_build_object(
    'members', (select count(*) from profiles where user_id not in (select user_id from excluded)),
    'new_members_7d', (select count(*) from profiles, today t where (created_at at time zone 'Asia/Seoul')::date > t.d - 7 and user_id not in (select user_id from excluded)),
    'active_today', (select count(distinct user_id) from act, today t where act.d = t.d),
    'active_7d', (select count(*) from a7),
    'active_prev_7d', (select count(*) from p7),
    'returned_7d', (select count(*) from p7 where user_id in (select user_id from a7)),
    'lapsed_7d', (select count(*) from p7 where user_id not in (select user_id from a7)),
    'first_time_7d', (select count(*) from a7 join first_seen f using (user_id), today t where f.f > t.d - 7),
    'active_30d', (select count(distinct user_id) from act, today t where act.d > t.d - 30),
    'push_subscribers', (select count(distinct user_id) from push_subscriptions where user_id not in (select user_id from excluded)),
    'features_7d', (select coalesce(json_object_agg(k, json_build_object('users', u, 'count', c)), '{}'::json) from (
      select k, count(distinct user_id) u, count(*) c from act, today t where act.d > t.d - 7 group by k) s),
    'weekly', (select coalesce(json_agg(w order by w.week_start), '[]'::json) from (
      select to_char(date_trunc('week', act.d)::date, 'YYYY-MM-DD') week_start,
             count(distinct user_id) active,
             count(distinct user_id) filter (where k = 'attendance') attendance_users,
             count(*) filter (where k = 'attendance') attendance_count
      from act, today t where act.d >= date_trunc('week', t.d)::date - 77
      group by 1) w)
  );
$function$;

revoke all on function public.get_site_usage_summary() from public;
grant execute on function public.get_site_usage_summary() to anon, authenticated;
