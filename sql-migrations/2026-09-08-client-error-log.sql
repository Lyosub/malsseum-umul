-- 2026-09-08 : 클라이언트 오류 로그
--   학생 브라우저에서 JS 오류가 나면 즉시 client_errors 에 기록된다. (auth.js의 error 핸들러 → log_client_error RPC)
--   교역자/부장은 get_client_errors_admin 으로 조회. 예약 헬스체크·세션 시작 점검이 이 테이블을 읽는다.

create table if not exists client_errors (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  page text,
  message text,
  stack text,
  user_agent text,
  user_id uuid references auth.users(id) on delete set null
);
alter table client_errors enable row level security;

-- 조회는 교역자/부장만. (insert는 RPC(SECURITY DEFINER)로만 하므로 별도 insert 정책 불필요)
drop policy if exists "관리자만 오류 조회" on client_errors;
create policy "관리자만 오류 조회" on client_errors
  for select using (
    exists (select 1 from profiles p where p.user_id = auth.uid() and (p.is_admin or p.is_department_head))
  );

-- 오류 1건 기록. 비로그인 포함 누구나 호출 가능. 서버측 중복 억제: 같은 (page,message)가
-- 최근 5분 내 이미 있으면 새로 안 넣는다 (깨진 페이지가 수천 건 쏟아내는 것 방지).
create or replace function log_client_error(p_page text, p_message text, p_stack text, p_ua text)
returns void
language plpgsql
security definer
set search_path = public
as $func$
declare
  v_page text := left(coalesce(p_page,''), 300);
  v_msg  text := left(coalesce(p_message,''), 1000);
begin
  if v_msg = '' then return; end if;
  if exists (
    select 1 from client_errors
    where page = v_page and message = v_msg and occurred_at > now() - interval '5 minutes'
  ) then
    return;
  end if;
  insert into client_errors (page, message, stack, user_agent, user_id)
  values (v_page, v_msg, left(coalesce(p_stack,''), 4000), left(coalesce(p_ua,''), 400), auth.uid());
end;
$func$;
grant execute on function log_client_error(text, text, text, text) to anon, authenticated;

-- 교역자/부장: 최근 오류 조회 (기본 7일)
create or replace function get_client_errors_admin(p_since_hours integer default 168)
returns table(occurred_at timestamptz, page text, message text, stack text, user_agent text, user_id uuid, hits bigint)
language plpgsql
security definer
set search_path = public
as $func$
begin
  if not exists (select 1 from profiles p where p.user_id = auth.uid() and (p.is_admin or p.is_department_head)) then
    raise exception '권한이 없어요.';
  end if;
  return query
    select
      max(ce.occurred_at) as occurred_at,
      ce.page, ce.message,
      (array_agg(ce.stack order by ce.occurred_at desc))[1] as stack,
      (array_agg(ce.user_agent order by ce.occurred_at desc))[1] as user_agent,
      (array_agg(ce.user_id order by ce.occurred_at desc))[1] as user_id,
      count(*) as hits
    from client_errors ce
    where ce.occurred_at > now() - make_interval(hours => greatest(p_since_hours, 1))
    group by ce.page, ce.message
    order by max(ce.occurred_at) desc
    limit 200;
end;
$func$;
grant execute on function get_client_errors_admin(integer) to authenticated;

select 'client_errors 테이블 + log_client_error + get_client_errors_admin 완료' as status;
