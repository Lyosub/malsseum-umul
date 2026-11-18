-- 2026-11-18 나그네 마을: 파티(최대 4명)와 파티 퀘스트. 다시 실행해도 안전.
create table if not exists ark_parties (
  id bigserial primary key,
  leader uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists ark_party_members (
  user_id uuid primary key references auth.users(id) on delete cascade,   -- 한 사람은 한 파티에만
  party_id bigint not null references ark_parties(id) on delete cascade,
  joined_at timestamptz not null default now()
);
create table if not exists ark_party_invites (
  id bigserial primary key,
  party_id bigint not null references ark_parties(id) on delete cascade,
  from_user uuid not null references auth.users(id) on delete cascade,
  to_user uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (party_id, to_user)
);
create table if not exists ark_party_progress (
  party_id bigint not null references ark_parties(id) on delete cascade,
  qkey text not null,
  n int not null default 0,
  done_at timestamptz,
  primary key (party_id, qkey)
);
alter table ark_parties enable row level security;
alter table ark_party_members enable row level security;
alter table ark_party_invites enable row level security;
alter table ark_party_progress enable row level security;   -- 정책 없음: 아래 함수로만

-- 파티 퀘스트 목표(서버가 상한을 앎)
create or replace function public._ark_pq_target(k text) returns int language sql immutable as $$
  select case k when 'logs' then 300 when 'build' then 400 when 'shadows' then 50 when 'harvest' then 120 when 'iron' then 60 when 'summit' then 1 else 0 end;
$$;

create or replace function public._ark_my_party() returns bigint language sql stable security definer set search_path = public as $$
  select party_id from ark_party_members where user_id = auth.uid();
$$;

-- 초대: 파티가 없으면 내가 이끄는 파티를 만들고 초대(최대 4명, 10분 지나면 초대 사라짐)
create or replace function public.party_invite(p_to uuid) returns text language plpgsql security definer set search_path = public as $$
declare pid bigint; cnt int;
begin
  if not public.can_play_ark() then return 'login'; end if;
  if p_to = auth.uid() then return 'self'; end if;
  if not exists (select 1 from profiles where user_id = p_to) then return 'nouser'; end if;
  if exists (select 1 from ark_party_members where user_id = p_to) then return 'busy'; end if;
  pid := public._ark_my_party();
  if pid is null then
    insert into ark_parties(leader) values (auth.uid()) returning id into pid;
    insert into ark_party_members(user_id, party_id) values (auth.uid(), pid);
  end if;
  select count(*) into cnt from ark_party_members where party_id = pid;
  if cnt >= 4 then return 'full'; end if;
  delete from ark_party_invites where created_at < now() - interval '10 minutes';
  insert into ark_party_invites(party_id, from_user, to_user) values (pid, auth.uid(), p_to)
    on conflict (party_id, to_user) do update set created_at = now(), from_user = excluded.from_user;
  return 'ok';
end $$;

create or replace function public.party_answer(p_invite bigint, p_yes boolean) returns text language plpgsql security definer set search_path = public as $$
declare pid bigint; cnt int;
begin
  if not public.can_play_ark() then return 'login'; end if;
  select party_id into pid from ark_party_invites where id = p_invite and to_user = auth.uid() and created_at > now() - interval '10 minutes';
  delete from ark_party_invites where id = p_invite and to_user = auth.uid();
  if pid is null then return 'gone'; end if;
  if not coalesce(p_yes, false) then return 'no'; end if;
  if exists (select 1 from ark_party_members where user_id = auth.uid()) then return 'busy'; end if;
  select count(*) into cnt from ark_party_members where party_id = pid;
  if cnt >= 4 then return 'full'; end if;
  insert into ark_party_members(user_id, party_id) values (auth.uid(), pid);
  delete from ark_party_invites where to_user = auth.uid();
  return 'ok';
end $$;

-- 나가기: 이끄는 사람이 나가면 다음 사람이 이끌고, 아무도 없으면 파티를 지움
create or replace function public.party_leave() returns text language plpgsql security definer set search_path = public as $$
declare pid bigint; nxt uuid;
begin
  pid := public._ark_my_party(); if pid is null then return 'none'; end if;
  delete from ark_party_members where user_id = auth.uid();
  select user_id into nxt from ark_party_members where party_id = pid order by joined_at limit 1;
  if nxt is null then delete from ark_parties where id = pid;
  else update ark_parties set leader = nxt where id = pid and leader = auth.uid(); end if;
  return 'ok';
end $$;

create or replace function public.party_kick(p_user uuid) returns text language plpgsql security definer set search_path = public as $$
declare pid bigint;
begin
  pid := public._ark_my_party();
  if pid is null or not exists (select 1 from ark_parties where id = pid and leader = auth.uid()) then return 'notleader'; end if;
  if p_user = auth.uid() then return 'self'; end if;
  delete from ark_party_members where user_id = p_user and party_id = pid;
  return 'ok';
end $$;

-- 내 파티: 파티원(닉네임·이끄는 사람), 내게 온 초대, 파티 퀘스트 진행
create or replace function public.get_my_party() returns jsonb language plpgsql stable security definer set search_path = public as $$
declare pid bigint;
begin
  if not public.can_play_ark() then return null; end if;
  pid := public._ark_my_party();
  return jsonb_build_object(
    'party', pid,
    'members', coalesce((select jsonb_agg(jsonb_build_object('id', m.user_id, 'nick', p.nickname, 'leader', m.user_id = pa.leader) order by m.joined_at)
                 from ark_party_members m join profiles p on p.user_id = m.user_id join ark_parties pa on pa.id = m.party_id where m.party_id = pid), '[]'::jsonb),
    'invites', coalesce((select jsonb_agg(jsonb_build_object('id', i.id, 'from', p.nickname)) from ark_party_invites i join profiles p on p.user_id = i.from_user
                 where i.to_user = auth.uid() and i.created_at > now() - interval '10 minutes'), '[]'::jsonb),
    'progress', coalesce((select jsonb_object_agg(qkey, jsonb_build_object('n', n, 'done', done_at is not null)) from ark_party_progress where party_id = pid), '{}'::jsonb)
  );
end $$;

-- 파티 퀘스트에 보태기(한 번에 최대 50, 목표를 넘지 않음)
create or replace function public.party_progress(p_key text, p_n int) returns jsonb language plpgsql security definer set search_path = public as $$
declare pid bigint; t int; cur int;
begin
  pid := public._ark_my_party(); if pid is null then return null; end if;
  t := public._ark_pq_target(p_key); if t <= 0 then return null; end if;
  insert into ark_party_progress(party_id, qkey, n) values (pid, p_key, least(t, greatest(0, least(50, coalesce(p_n, 0)))))
    on conflict (party_id, qkey) do update set n = least(t, ark_party_progress.n + greatest(0, least(50, coalesce(p_n, 0))))
    returning n into cur;
  update ark_party_progress set done_at = now() where party_id = pid and qkey = p_key and n >= t and done_at is null;
  return jsonb_build_object('n', cur, 'target', t);
end $$;

revoke all on function public.party_invite(uuid), public.party_answer(bigint, boolean), public.party_leave(), public.party_kick(uuid), public.get_my_party(), public.party_progress(text, int) from public, anon;
grant execute on function public.party_invite(uuid), public.party_answer(bigint, boolean), public.party_leave(), public.party_kick(uuid), public.get_my_party(), public.party_progress(text, int) to authenticated;
select 'ok — ark party' as status;
