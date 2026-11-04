-- 감사의 광주리를 팀 코드 대신 오이코스별로 나눈다 (2026-11-04 전도사님 결정).
-- * 코드·계정 없이 누구나 쓴다. 오이코스를 고르고 한 줄을 쓰면 끝, 이름은 받지 않는다.
-- * 로그인한 오이코스 멤버는 자기 오이코스로 자동 분류하고, 감사노트에도 저장한다.
-- * 오이코스가 없는 사람은 group_id 없이 담고 「함께하는 분들」로 묶어 보여 준다.
-- * 열매는 쓰자마자 늘어난다. 로그인 없이 쓴 글은 담당자가 숨기면 열매에서도 빠진다.
-- * 팀 코드가 없어졌으므로 가을 원정대 점수에서 뺀다(만점 140 -> 120 복귀).

-- 1. 원정대 점수를 광주리 이전으로 되돌린다.
create or replace function public.picnic_team_parts(p_team integer) returns jsonb
language sql stable
set search_path = public
as $$
  select coalesce((select jsonb_object_agg(kind, jsonb_build_object('pts', pts, 'n', n)) from (
    select kind, sum(best)::int as pts, count(*)::int as n from (
      select kind, q, max(points) as best from public.picnic_subs
      where team_id = p_team and status = 'ok' and kind <> 'hint'
      group by kind, q
    ) s group by kind
  ) k), '{}'::jsonb)
$$;

create or replace function public.picnic_team_score(p_team integer) returns integer
language sql stable
set search_path = public
as $$
  select coalesce((
    select sum(best) from (
      select max(points) as best from public.picnic_subs
      where team_id = p_team and status = 'ok' and kind <> 'hint'
      group by kind, q
    ) s), 0)
  + (select bonus - penalty from public.picnic_teams where id = p_team)
$$;

drop function if exists public.harvest_team_me(text, integer);
drop function if exists public.harvest_team_part(integer);
drop function if exists public.harvest_member_days(integer);
drop function if exists public.harvest_write(text, integer, text, boolean);
drop function if exists public.harvest_share(bigint);
drop table if exists public.harvest_team_links;
alter table public.harvest_config drop column if exists score_until;
alter table public.harvest_config drop column if exists score_days;
alter table public.harvest_config drop column if exists score_max;

-- 2. 글마다 오이코스와 승인 대기 글을 잇는다.
alter table public.harvest_entries alter column member_id drop not null;
alter table public.harvest_entries add column if not exists group_id bigint references public.groups(id) on delete set null;
alter table public.harvest_entries add column if not exists message_id bigint references public.star_messages(id) on delete set null;

-- 3. 전체 수와 오이코스별 수. 숫자와 오이코스 이름만 내보낸다.
create or replace function public.harvest_status() returns jsonb
language sql stable security definer
set search_path = public
as $$
  with c as (select * from public.harvest_config where id = 1),
  items as (
    -- 감사노트: 광주리에서 고른 오이코스가 있으면 그것, 없으면 그 사람이 속한 오이코스
    select coalesce(e.group_id, (
             select min(gm.group_id) from public.group_members gm
             join public.groups g on g.id = gm.group_id and not g.is_hidden
             where gm.user_id = n.user_id)) as gid
    from public.notes n cross join c
    left join public.harvest_entries e on e.note_id = n.id
    where n.type = 'gratitude' and n.created_at >= c.starts_at and n.created_at < c.ends_at
    union all
    -- 로그인 없이 쓴 글: 담당자가 숨기면 빠진다
    select e.group_id
    from public.harvest_entries e cross join c
    left join public.star_messages m on m.id = e.message_id
    where e.note_id is null and e.created_at >= c.starts_at and e.created_at < c.ends_at
      and coalesce(m.status, '') not in ('hidden', 'blocked')
  )
  select jsonb_build_object(
    'count', (select count(*) from items),
    'other', (select count(*) from items where gid is null),
    'groups', coalesce((
      select jsonb_agg(jsonb_build_object('id', g.id, 'name', g.name,
               'n', (select count(*) from items i where i.gid = g.id)) order by g.name)
      from public.groups g where not g.is_hidden), '[]'::jsonb),
    'my_group', (
      select min(gm.group_id) from public.group_members gm
      join public.groups g on g.id = gm.group_id and not g.is_hidden
      where gm.user_id = auth.uid()),
    'starts_at', c.starts_at,
    'ends_at', c.ends_at,
    'open', now() >= c.starts_at and now() < c.ends_at
  )
  from c;
$$;

-- 4. 쓰기. 로그인 여부와 상관없이 이 함수 하나로 담는다. 글은 모두 승인 대기로 간다.
create or replace function public.harvest_write(p_group bigint, p_body text, p_device text) returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  c public.harvest_config;
  v_uid uuid := auth.uid();
  v_body text := btrim(coalesce(p_body, ''));
  v_device text;
  v_group bigint;
  v_group_name text;
  v_note bigint;
  v_msg bigint;
  v_bad text[] := array['시발','씨발','ㅅㅂ','ㅆㅂ','병신','ㅂㅅ','개새','지랄','ㅈㄹ','좆','존나','졸라','닥쳐','꺼져','미친놈','미친년','fuck','shit'];
  w text;
begin
  select * into c from public.harvest_config where id = 1;
  if now() < c.starts_at or now() >= c.ends_at then
    return jsonb_build_object('ok', false, 'error', '지금은 담을 수 있는 기간이 아니에요.');
  end if;
  if char_length(v_body) < 1 or char_length(v_body) > 60 then
    return jsonb_build_object('ok', false, 'error', '감사한 일을 60자 안으로 적어 주세요.');
  end if;
  foreach w in array v_bad loop
    if position(w in lower(v_body)) > 0 then
      return jsonb_build_object('ok', false, 'error', '이 글은 담을 수 없어요. 고쳐서 다시 적어 주세요.');
    end if;
  end loop;
  if v_body ~ '[0-9]{2,4}[- .][0-9]{3,4}[- .][0-9]{4}' or v_body ~ '[0-9]{9,}' then
    return jsonb_build_object('ok', false, 'error', '전화번호처럼 보이는 숫자는 쓸 수 없어요.');
  end if;

  if v_uid is not null then
    v_device := v_uid::text;
    select min(gm.group_id) into v_group from public.group_members gm
      join public.groups g on g.id = gm.group_id and not g.is_hidden
      where gm.user_id = v_uid;
  else
    if char_length(coalesce(p_device, '')) < 8 then
      return jsonb_build_object('ok', false, 'error', '잠시 뒤 다시 눌러 주세요.');
    end if;
    v_device := 'd' || left(p_device, 64);
    -- 짧은 시간에 한꺼번에 밀려드는 글을 막는다.
    if (select count(*) from public.harvest_entries where note_id is null and created_at > now() - interval '1 minute') >= 120 then
      return jsonb_build_object('ok', false, 'error', '잠시 뒤 다시 담아 주세요.');
    end if;
  end if;
  if v_group is null and p_group is not null then
    if not exists (select 1 from public.groups where id = p_group and not is_hidden) then
      return jsonb_build_object('ok', false, 'error', '오이코스를 다시 골라 주세요.');
    end if;
    v_group := p_group;
  end if;
  select name into v_group_name from public.groups where id = v_group;

  if exists (select 1 from public.star_messages where room = 'harvest' and device = v_device and created_at > now() - interval '10 seconds') then
    return jsonb_build_object('ok', false, 'error', '10초 뒤에 다시 담아 주세요.');
  end if;
  if (select count(*) from public.star_messages
      where room = 'harvest' and device = v_device
        and (created_at at time zone 'Asia/Seoul')::date = (now() at time zone 'Asia/Seoul')::date) >= 5 then
    return jsonb_build_object('ok', false, 'error', '오늘은 다섯 개까지 담을 수 있어요. 내일 또 담아 주세요.');
  end if;

  if v_uid is not null then
    insert into public.notes(user_id, type, content, image_urls) values (v_uid, 'gratitude', v_body, '{}') returning id into v_note;
  end if;
  insert into public.star_messages(room, device, name, dept, body, show_name, status, kind)
  values ('harvest', v_device, '한 사람', coalesce(v_group_name, '감사'), v_body, true, 'pending', 'live')
  returning id into v_msg;
  insert into public.harvest_entries(group_id, note_id, message_id, body) values (v_group, v_note, v_msg, v_body);
  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.harvest_write(bigint, text, text) from public;
grant execute on function public.harvest_write(bigint, text, text) to anon, authenticated;
grant execute on function public.harvest_status() to anon, authenticated;
