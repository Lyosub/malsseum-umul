-- 방주 마을 2단계: 함께 놀기 (2026-11-18)
--  1) 실시간 채널 'ark-world'(비공개): 로그인한 말씀우물 회원만 위치·블록 바꿈을 주고받음
--  2) 함께 쓰는 세계: 내 땅 밖에서 캔 자리·놓은 것(횃불·사닥다리·묘목)을 DB에 남겨 모두에게 같게
--  3) 자유 채팅: 60자, 도배 제한(2초에 1번, 30초에 6번, 같은 말 1분에 2번), 신고 3번이면 자동으로 가림,
--     관리자 삭제·말하기 금지, 지운 글은 따로 보관
-- 다시 실행해도 안전.

-- 0) 누가 놀 수 있나: 로그인 + 말씀우물 회원(profiles)
create or replace function public.can_play_ark()
returns boolean language sql stable security definer set search_path = public as $$
  select auth.uid() is not null and exists (select 1 from profiles p where p.user_id = auth.uid());
$$;
revoke all on function public.can_play_ark() from public, anon;
grant execute on function public.can_play_ark() to authenticated;

create or replace function public.is_ark_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles p where p.user_id = auth.uid() and coalesce(p.is_admin, false));
$$;
revoke all on function public.is_ark_admin() from public, anon;
grant execute on function public.is_ark_admin() to authenticated;

-- 1) 실시간 채널
drop policy if exists ark_rt_read on realtime.messages;
drop policy if exists ark_rt_write on realtime.messages;
create policy ark_rt_read on realtime.messages for select to authenticated
  using (realtime.topic() = 'ark-world' and public.can_play_ark());
create policy ark_rt_write on realtime.messages for insert to authenticated
  with check (realtime.topic() = 'ark-world' and public.can_play_ark());

-- 내 이름표(닉네임)와 관리자 여부
create or replace function public.get_my_ark_name()
returns jsonb language sql stable security definer set search_path = public as $$
  select case when public.can_play_ark() then
    jsonb_build_object('nick', (select nickname from profiles where user_id = auth.uid()), 'admin', public.is_ark_admin()) end;
$$;
revoke all on function public.get_my_ark_name() from public, anon;
grant execute on function public.get_my_ark_name() to authenticated;

-- 2) 함께 쓰는 세계(내 땅 밖)
create table if not exists ark_world_edits (
  x int not null, y int not null, z int not null,
  id smallint not null,
  user_id uuid references auth.users(id) on delete set null,
  at timestamptz not null default now(),
  primary key (x, y, z)
);
alter table ark_world_edits enable row level security;   -- 정책 없음: 아래 함수로만 읽고 씀

create table if not exists ark_edit_budget (
  user_id uuid not null, minute timestamptz not null, n int not null default 0,
  primary key (user_id, minute)
);
alter table ark_edit_budget enable row level security;

-- p_edits: [[x,y,z,id], ...] 한 번에 300개까지, 한 사람 1분에 1500개까지
create or replace function public.put_ark_edits(p_edits jsonb)
returns int language plpgsql security definer set search_path = public as $$
declare n int; m timestamptz := date_trunc('minute', now()); used int;
begin
  if not public.can_play_ark() then return -1; end if;
  if jsonb_typeof(p_edits) <> 'array' then return 0; end if;
  n := jsonb_array_length(p_edits);
  if n = 0 then return 0; end if;
  if n > 300 then return -2; end if;
  insert into ark_edit_budget(user_id, minute, n) values (auth.uid(), m, n)
    on conflict (user_id, minute) do update set n = ark_edit_budget.n + excluded.n
    returning ark_edit_budget.n into used;
  if used > 1500 then return -3; end if;
  delete from ark_edit_budget where minute < now() - interval '10 minutes';
  insert into ark_world_edits(x, y, z, id, user_id, at)
  select (e->>0)::int, (e->>1)::int, (e->>2)::int, (e->>3)::smallint, auth.uid(), now()
  from jsonb_array_elements(p_edits) e
  where jsonb_typeof(e) = 'array' and jsonb_array_length(e) = 4
    and (e->>0)::int between 0 and 2047 and (e->>1)::int between 1 and 79 and (e->>2)::int between 0 and 2047
    and (e->>3)::int between 0 and 255
  on conflict (x, y, z) do update set id = excluded.id, user_id = excluded.user_id, at = excluded.at;
  return n;
end $$;
revoke all on function public.put_ark_edits(jsonb) from public, anon;
grant execute on function public.put_ark_edits(jsonb) to authenticated;

-- 세계 전체 바뀐 자리: "x,y,z,id;x,y,z,id;..." 한 줄로(행 수 제한을 피함)
create or replace function public.get_ark_edits()
returns text language sql stable security definer set search_path = public as $$
  select case when public.can_play_ark() then
    coalesce((select string_agg(x || ',' || y || ',' || z || ',' || id, ';') from ark_world_edits), '') end;
$$;
revoke all on function public.get_ark_edits() from public, anon;
grant execute on function public.get_ark_edits() to authenticated;

-- 3) 채팅
create table if not exists ark_chat (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  nick text not null,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists ark_chat_user_time on ark_chat(user_id, created_at desc);
alter table ark_chat enable row level security;
drop policy if exists ark_chat_read on ark_chat;
create policy ark_chat_read on ark_chat for select to authenticated
  using (public.can_play_ark() and created_at > now() - interval '1 day');

create table if not exists ark_chat_removed (
  id bigint primary key, user_id uuid, nick text, body text, created_at timestamptz,
  removed_at timestamptz not null default now(), removed_by uuid, reason text
);
alter table ark_chat_removed enable row level security;
drop policy if exists ark_chat_removed_admin on ark_chat_removed;
create policy ark_chat_removed_admin on ark_chat_removed for select to authenticated using (public.is_ark_admin());

create table if not exists ark_chat_reports (
  chat_id bigint not null, reporter uuid not null, body text, at timestamptz not null default now(),
  primary key (chat_id, reporter)
);
alter table ark_chat_reports enable row level security;
drop policy if exists ark_chat_reports_admin on ark_chat_reports;
create policy ark_chat_reports_admin on ark_chat_reports for select to authenticated using (public.is_ark_admin());

create table if not exists ark_chat_mutes (
  user_id uuid primary key, until timestamptz not null, by_user uuid
);
alter table ark_chat_mutes enable row level security;

-- 보내기: 성공하면 글 번호, 실패하면 이유 글자(error)를 돌려줌
create or replace function public.send_ark_chat(p_body text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare b text; nk text; mu timestamptz; new_id bigint;
begin
  if not public.can_play_ark() then return jsonb_build_object('error', 'login'); end if;
  b := btrim(regexp_replace(coalesce(p_body, ''), '[[:cntrl:]]', ' ', 'g'));
  b := regexp_replace(b, '\s{2,}', ' ', 'g');
  if b = '' then return jsonb_build_object('error', 'empty'); end if;
  if char_length(b) > 60 then return jsonb_build_object('error', 'long'); end if;
  select until into mu from ark_chat_mutes where user_id = auth.uid();
  if mu is not null and mu > now() then
    return jsonb_build_object('error', 'muted', 'until', mu);
  end if;
  if exists (select 1 from ark_chat where user_id = auth.uid() and created_at > now() - interval '2 seconds') then
    return jsonb_build_object('error', 'slow');
  end if;
  if (select count(*) from ark_chat where user_id = auth.uid() and created_at > now() - interval '30 seconds') >= 6 then
    return jsonb_build_object('error', 'slow');
  end if;
  if (select count(*) from ark_chat where user_id = auth.uid() and body = b and created_at > now() - interval '1 minute') >= 2 then
    return jsonb_build_object('error', 'same');
  end if;
  select nickname into nk from profiles where user_id = auth.uid();
  insert into ark_chat(user_id, nick, body) values (auth.uid(), coalesce(nk, '친구'), b) returning id into new_id;
  delete from ark_chat where created_at < now() - interval '30 days';
  return jsonb_build_object('id', new_id);
end $$;
revoke all on function public.send_ark_chat(text) from public, anon;
grant execute on function public.send_ark_chat(text) to authenticated;

-- 최근 채팅 40개(하루 안). 관리자는 신고 수도 봄
create or replace function public.get_ark_chat_recent()
returns table(id bigint, nick text, body text, created_at timestamptz, mine boolean, reports int)
language sql stable security definer set search_path = public as $$
  select c.id, c.nick, c.body, c.created_at, c.user_id = auth.uid(),
         case when public.is_ark_admin() then (select count(*)::int from ark_chat_reports r where r.chat_id = c.id) else 0 end
  from ark_chat c
  where public.can_play_ark() and c.created_at > now() - interval '1 day'
  order by c.id desc limit 40;
$$;
revoke all on function public.get_ark_chat_recent() from public, anon;
grant execute on function public.get_ark_chat_recent() to authenticated;

-- 글을 가림(지우고 따로 보관)
create or replace function public._ark_chat_remove(p_id bigint, p_by uuid, p_reason text)
returns void language sql security definer set search_path = public as $$
  insert into ark_chat_removed(id, user_id, nick, body, created_at, removed_by, reason)
    select id, user_id, nick, body, created_at, p_by, p_reason from ark_chat where id = p_id
    on conflict (id) do nothing;
  delete from ark_chat where id = p_id;
$$;
revoke all on function public._ark_chat_remove(bigint, uuid, text) from public, anon, authenticated;

-- 신고: 한 사람 한 번, 서로 다른 3명이 신고하면 자동으로 가림
create or replace function public.report_ark_chat(p_id bigint)
returns int language plpgsql security definer set search_path = public as $$
declare cnt int; owner uuid; b text;
begin
  if not public.can_play_ark() then return -1; end if;
  select user_id, body into owner, b from ark_chat where id = p_id;
  if owner is null then return 0; end if;
  if owner = auth.uid() then return -2; end if;
  insert into ark_chat_reports(chat_id, reporter, body) values (p_id, auth.uid(), b) on conflict do nothing;
  select count(*) into cnt from ark_chat_reports where chat_id = p_id;
  if cnt >= 3 then perform public._ark_chat_remove(p_id, null, 'reports'); end if;
  return cnt;
end $$;
revoke all on function public.report_ark_chat(bigint) from public, anon;
grant execute on function public.report_ark_chat(bigint) to authenticated;

-- 관리자: 지우기(+ 말하기 금지 분)
create or replace function public.admin_remove_ark_chat(p_id bigint, p_mute_minutes int default 0)
returns boolean language plpgsql security definer set search_path = public as $$
declare owner uuid;
begin
  if not public.is_ark_admin() then return false; end if;
  select user_id into owner from ark_chat where id = p_id;
  perform public._ark_chat_remove(p_id, auth.uid(), 'admin');
  if owner is not null and coalesce(p_mute_minutes, 0) > 0 then
    insert into ark_chat_mutes(user_id, until, by_user) values (owner, now() + make_interval(mins => least(p_mute_minutes, 10080)), auth.uid())
      on conflict (user_id) do update set until = excluded.until, by_user = excluded.by_user;
  end if;
  return true;
end $$;
revoke all on function public.admin_remove_ark_chat(bigint, int) from public, anon;
grant execute on function public.admin_remove_ark_chat(bigint, int) to authenticated;

-- 새 글·지운 글을 실시간으로 받기
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'ark_chat') then
    alter publication supabase_realtime add table public.ark_chat;
  end if;
end $$;

select 'ok — ark together' as status;
