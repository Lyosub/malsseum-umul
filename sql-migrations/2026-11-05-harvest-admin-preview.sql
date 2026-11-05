-- 감사의 광주리: 시작 전에도 관리자 계정은 써 볼 수 있게 한다(2026-11-05).
-- 다른 사람에게는 시작 전 글을 세지 않고, 시상 집계(harvest_oikos_scores)에도 들어가지 않는다.

create or replace function public.harvest_status()
returns jsonb
language sql
stable security definer
set search_path to 'public'
as $function$
  with c as (select * from public.harvest_config where id = 1),
  me as (select coalesce((select p.is_admin from public.profiles p where p.user_id = auth.uid()), false) as tester),
  items as (
    -- 감사노트: 광주리에서 고른 오이코스가 있으면 그것, 없으면 그 사람이 속한 오이코스
    -- 시작 전 글은 관리자 본인 화면에서 본인이 광주리에 쓴 글만 센다.
    select coalesce(e.group_id, (
             select min(gm.group_id) from public.group_members gm
             join public.groups g on g.id = gm.group_id and not g.is_hidden
             where gm.user_id = n.user_id)) as gid
    from public.notes n cross join c cross join me
    left join public.harvest_entries e on e.note_id = n.id
    where n.type = 'gratitude' and n.created_at < c.ends_at
      and (n.created_at >= c.starts_at
           or (me.tester and n.user_id = auth.uid() and e.note_id is not null))
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
      select jsonb_agg(jsonb_build_object('id', g.id, 'name', g.name, 'grade', hg.grade,
               'n', (select count(*) from items i where i.gid = g.id)) order by coalesce(hg.grade, 9), g.name)
      from public.groups g
      left join public.harvest_groups hg on hg.group_id = g.id
      where not g.is_hidden), '[]'::jsonb),
    'my_group', (
      select min(gm.group_id) from public.group_members gm
      join public.groups g on g.id = gm.group_id and not g.is_hidden
      where gm.user_id = auth.uid()),
    'starts_at', c.starts_at,
    'ends_at', c.ends_at,
    'open', now() >= c.starts_at and now() < c.ends_at,
    'tester', (select tester from me)
  )
  from c;
$function$;

create or replace function public.harvest_write(p_group bigint, p_body text, p_device text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
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
  if now() >= c.ends_at or (now() < c.starts_at and not coalesce(
       (select p.is_admin from public.profiles p where p.user_id = v_uid), false)) then
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
$function$;
