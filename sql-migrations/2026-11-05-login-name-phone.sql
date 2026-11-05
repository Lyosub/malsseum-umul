-- 로그인 방법 추가 (2026-11-05 전도사님 결정)
-- 1. 이메일 + 비번  2. 이름 + 비번 + 전화번호(항상 묻는다)  3. 전화번호 + 비번
-- * 비번이 맞을 때만 이메일을 돌려주고, 화면은 그 이메일로 평소대로 로그인한다. 남의 이메일이 드러나지 않는다.
-- * 어느 칸이 틀렸는지 구분하지 않는다. 없는 이름·번호도 같은 시간, 같은 답, 같은 횟수 제한을 받는다.
-- * 실패 제한: 계정+기기 5번(10분), 계정 전체 20번(1시간 안, 15분), 접속 주소 50번(10분 안, 10분).
-- * 전화번호는 숫자만 비교해 중복을 막는다.

create unique index if not exists profiles_phone_digits_uq
  on public.profiles (regexp_replace(phone_number, '\D', '', 'g'))
  where coalesce(phone_number, '') <> '';

create table if not exists public.login_attempts (
  key text primary key,
  fails int not null default 0,
  window_start timestamptz not null default now(),
  locked_until timestamptz
);
alter table public.login_attempts enable row level security;
revoke all on public.login_attempts from public, anon, authenticated;

create or replace function public.login_client_ip() returns text
language sql stable
as $$
  select coalesce(
    nullif(current_setting('request.headers', true), '')::json->>'cf-connecting-ip',
    btrim(split_part(nullif(current_setting('request.headers', true), '')::json->>'x-forwarded-for', ',', 1)),
    'unknown')
$$;
revoke all on function public.login_client_ip() from public, anon, authenticated;

create or replace function public.login_is_locked(p_key text) returns boolean
language sql stable
set search_path = public
as $$
  select exists (select 1 from public.login_attempts where key = md5(p_key) and locked_until > now())
$$;
revoke all on function public.login_is_locked(text) from public, anon, authenticated;

create or replace function public.login_fail(p_key text, p_max int, p_window interval, p_lock interval) returns void
language plpgsql
set search_path = public
as $$
begin
  insert into public.login_attempts as a (key, fails, window_start)
  values (md5(p_key), 1, now())
  on conflict (key) do update set
    fails = case when a.window_start < now() - p_window then 1 else a.fails + 1 end,
    window_start = case when a.window_start < now() - p_window then now() else a.window_start end;
  update public.login_attempts set locked_until = now() + p_lock, fails = 0, window_start = now()
    where key = md5(p_key) and fails >= p_max;
end;
$$;
revoke all on function public.login_fail(text, int, interval, interval) from public, anon, authenticated;

create or replace function public.login_resolve(p_id text, p_password text, p_phone text default null, p_device text default null) returns jsonb
language plpgsql security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_id text := btrim(coalesce(p_id, ''));
  v_compact text := regexp_replace(v_id, '[\s-]', '', 'g');
  v_phone text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  v_dev text := left(coalesce(nullif(btrim(p_device), ''), 'none'), 64);
  v_ip text := public.login_client_ip();
  v_uid uuid;
  v_email text;
  v_hash text;
  v_who text;
  -- 없는 계정도 같은 시간이 걸리도록 비교만 하는 값
  v_dummy constant text := '$2a$10$abcdefghijklmnopqrstuuS0m9vGk9yq7Yw0sVJ1vQmZ8iXo6u3mK';
begin
  delete from public.login_attempts where window_start < now() - interval '1 day' and coalesce(locked_until, now() - interval '1 second') < now();

  if v_id = '' or coalesce(p_password, '') = '' then
    return jsonb_build_object('ok', false, 'error', 'check');
  end if;

  if position('@' in v_id) > 0 then
    select u.id, u.email, u.encrypted_password into v_uid, v_email, v_hash
      from auth.users u where lower(u.email) = lower(v_id) limit 1;
  elsif v_compact ~ '^[0-9]{9,}$' then
    select u.id, u.email, u.encrypted_password into v_uid, v_email, v_hash
      from public.profiles p join auth.users u on u.id = p.user_id
      where coalesce(p.phone_number, '') <> '' and regexp_replace(p.phone_number, '\D', '', 'g') = v_compact limit 1;
  elsif length(v_phone) >= 9 then
    select u.id, u.email, u.encrypted_password into v_uid, v_email, v_hash
      from public.profiles p join auth.users u on u.id = p.user_id
      where coalesce(p.phone_number, '') <> '' and regexp_replace(p.phone_number, '\D', '', 'g') = v_phone
        and regexp_replace(coalesce(p.real_name, ''), '\s', '', 'g') = regexp_replace(v_id, '\s', '', 'g')
      limit 1;
  end if;

  v_who := coalesce(v_uid::text, 'id:' || lower(v_compact));

  if public.login_is_locked('ip:' || v_ip) or public.login_is_locked('acct:' || v_who)
     or public.login_is_locked('dev:' || v_who || ':' || v_dev) then
    return jsonb_build_object('ok', false, 'error', 'locked');
  end if;

  if crypt(p_password, coalesce(v_hash, v_dummy)) = coalesce(v_hash, v_dummy) and v_hash is not null then
    delete from public.login_attempts where key in (md5('acct:' || v_who), md5('dev:' || v_who || ':' || v_dev));
    return jsonb_build_object('ok', true, 'email', v_email);
  end if;

  perform public.login_fail('dev:' || v_who || ':' || v_dev, 5, interval '1 hour', interval '10 minutes');
  perform public.login_fail('acct:' || v_who, 20, interval '1 hour', interval '15 minutes');
  perform public.login_fail('ip:' || v_ip, 50, interval '10 minutes', interval '10 minutes');
  return jsonb_build_object('ok', false, 'error', 'check');
end;
$$;
revoke all on function public.login_resolve(text, text, text, text) from public;
grant execute on function public.login_resolve(text, text, text, text) to anon, authenticated;

-- 가입할 때 이미 쓰는 번호인지 확인한다. 접속 주소당 10분에 30번까지만 답한다.
create or replace function public.is_phone_taken(p_phone text) returns boolean
language plpgsql security definer
set search_path = public, pg_temp
as $$
declare
  v_key text := 'phone:' || public.login_client_ip();
  v_digits text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
begin
  if public.login_is_locked(v_key) then return false; end if;
  perform public.login_fail(v_key, 30, interval '10 minutes', interval '10 minutes');
  return exists (select 1 from public.profiles
                 where coalesce(phone_number, '') <> '' and regexp_replace(phone_number, '\D', '', 'g') = v_digits);
end;
$$;
revoke all on function public.is_phone_taken(text) from public;
grant execute on function public.is_phone_taken(text) to anon, authenticated;

-- 로그인 화면이 어느 칸이 틀렸는지 더는 구분하지 않으므로 이메일 가입 여부를 알려 주던 함수를 지운다.
drop function if exists public.check_email_registered(text);
