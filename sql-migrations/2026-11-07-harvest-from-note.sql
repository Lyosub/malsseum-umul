-- 감사노트를 쓰면서 「감사의 광주리에도 담기」를 고르면 그 글을 광주리에 담는다(전도사님 11/7).
-- 광주리에 바로 쓰는 harvest_write와 같은 기간·금지어·전화번호·10초·하루 5개 검사를 한다. 감사노트는 이미 저장된 것을 쓰므로 새로 만들지 않는다.
-- 60자가 넘으면 앞 59자에 …를 붙여 담는다. 같은 감사노트는 한 번만 담긴다.
create or replace function public.harvest_from_note(p_note_id bigint)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  c public.harvest_config;
  v_uid uuid := auth.uid();
  v_body text;
  v_type text;
  v_owner uuid;
  v_device text;
  v_group bigint;
  v_group_name text;
  v_msg bigint;
  v_bad text[] := array['시발','씨발','ㅅㅂ','ㅆㅂ','병신','ㅂㅅ','개새','지랄','ㅈㄹ','좆','존나','졸라','닥쳐','꺼져','미친놈','미친년','fuck','shit'];
  w text;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', '로그인이 필요해요.');
  end if;
  select user_id, type, btrim(coalesce(content, '')) into v_owner, v_type, v_body from public.notes where id = p_note_id;
  if v_owner is null or v_owner <> v_uid or v_type <> 'gratitude' then
    return jsonb_build_object('ok', false, 'error', '담을 수 없는 글이에요.');
  end if;
  if exists (select 1 from public.harvest_entries where note_id = p_note_id) then
    return jsonb_build_object('ok', true, 'again', true);
  end if;
  select * into c from public.harvest_config where id = 1;
  if now() >= c.ends_at or (now() < c.starts_at and not coalesce(
       (select p.is_admin from public.profiles p where p.user_id = v_uid), false)) then
    return jsonb_build_object('ok', false, 'error', '지금은 광주리에 담을 수 있는 기간이 아니에요.');
  end if;
  if char_length(v_body) < 1 then
    return jsonb_build_object('ok', false, 'error', '글이 없어서 광주리에는 담지 않았어요.');
  end if;
  if char_length(v_body) > 60 then
    v_body := left(v_body, 59) || '…';
  end if;
  foreach w in array v_bad loop
    if position(w in lower(v_body)) > 0 then
      return jsonb_build_object('ok', false, 'error', '이 글은 광주리에 담을 수 없어요.');
    end if;
  end loop;
  if v_body ~ '[0-9]{2,4}[- .][0-9]{3,4}[- .][0-9]{4}' or v_body ~ '[0-9]{9,}' then
    return jsonb_build_object('ok', false, 'error', '전화번호처럼 보이는 숫자가 있어 광주리에는 담지 않았어요.');
  end if;
  v_device := v_uid::text;
  if exists (select 1 from public.star_messages where room = 'harvest' and device = v_device and created_at > now() - interval '10 seconds') then
    return jsonb_build_object('ok', false, 'error', '10초 뒤에 다시 담아 주세요.');
  end if;
  if (select count(*) from public.star_messages
      where room = 'harvest' and device = v_device
        and (created_at at time zone 'Asia/Seoul')::date = (now() at time zone 'Asia/Seoul')::date) >= 5 then
    return jsonb_build_object('ok', false, 'error', '광주리는 오늘 다섯 개까지 담을 수 있어요.');
  end if;
  select min(gm.group_id) into v_group from public.group_members gm
    join public.groups g on g.id = gm.group_id and not g.is_hidden
    where gm.user_id = v_uid;
  select name into v_group_name from public.groups where id = v_group;
  insert into public.star_messages(room, device, name, dept, body, show_name, status, kind)
  values ('harvest', v_device, '한 사람', coalesce(v_group_name, '감사'), v_body, true, 'pending', 'live')
  returning id into v_msg;
  insert into public.harvest_entries(group_id, note_id, message_id, body) values (v_group, p_note_id, v_msg, v_body);
  return jsonb_build_object('ok', true);
end;
$$;
revoke all on function public.harvest_from_note(bigint) from public, anon;
grant execute on function public.harvest_from_note(bigint) to authenticated;
