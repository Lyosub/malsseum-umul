-- 감사의 광주리: 예배 화면 나눔 체크를 없앤다 (2026-11-04, 전도사님 요청).
-- 광주리 화면에서 쓴 글은 모두 이름 없이 승인 대기로 간다. 화면에 뜨는 것은 담당자가 승인한 글뿐이다.
-- 「하루 한 번」 제한을 없애고, 승인 대기도 쓰기와 같이 하루 다섯 개까지로 둔다.

create or replace function public.harvest_share(p_note_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.harvest_config;
  v_uid uuid := auth.uid();
  v_body text;
  v_status text := 'pending';
  v_bad text[] := array['시발','씨발','ㅅㅂ','ㅆㅂ','병신','ㅂㅅ','개새','지랄','ㅈㄹ','좆','존나','졸라','닥쳐','꺼져','미친놈','미친년','fuck','shit'];
  w text;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', '로그인한 뒤 보낼 수 있어요.');
  end if;
  select * into c from public.harvest_config where id = 1;
  if now() < c.starts_at or now() >= c.ends_at then
    return jsonb_build_object('ok', false, 'error', '지금은 보낼 수 있는 기간이 아니에요.');
  end if;
  select btrim(n.content) into v_body from public.notes n
   where n.id = p_note_id and n.user_id = v_uid and n.type = 'gratitude'
     and n.created_at >= c.starts_at and n.created_at < c.ends_at;
  if v_body is null then
    return jsonb_build_object('ok', false, 'error', '보낼 감사 글을 찾지 못했어요.');
  end if;
  if char_length(v_body) < 1 or char_length(v_body) > 60 then
    return jsonb_build_object('ok', false, 'error', '화면에는 60자까지 나눌 수 있어요.');
  end if;
  if (select count(*) from public.star_messages m
      where m.room = 'harvest' and m.device = v_uid::text
        and (m.created_at at time zone 'Asia/Seoul')::date = (now() at time zone 'Asia/Seoul')::date) >= 5 then
    return jsonb_build_object('ok', false, 'error', '오늘은 다섯 개까지 담을 수 있어요. 내일 또 담아 주세요.');
  end if;
  foreach w in array v_bad loop
    if position(w in lower(v_body)) > 0 then
      v_status := 'blocked';
    end if;
  end loop;
  if v_body ~ '[0-9]{2,4}[- .][0-9]{3,4}[- .][0-9]{4}' or v_body ~ '[0-9]{9,}' then
    v_status := 'blocked';
  end if;
  insert into public.star_messages(room, device, name, dept, body, show_name, status, kind)
  values ('harvest', v_uid::text, '한 사람', '감사', v_body, true, v_status, 'live');
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.harvest_write(p_code text, p_member int, p_body text, p_share boolean default true)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.harvest_config;
  v_uid uuid := auth.uid();
  v_body text := btrim(coalesce(p_body, ''));
  v_note bigint;
  v_bad text[] := array['시발','씨발','ㅅㅂ','ㅆㅂ','병신','ㅂㅅ','개새','지랄','ㅈㄹ','좆','존나','졸라','닥쳐','꺼져','미친놈','미친년','fuck','shit'];
  w text;
begin
  select * into c from public.harvest_config where id = 1;
  if now() < c.starts_at or now() >= c.ends_at then
    return jsonb_build_object('ok', false, 'error', '지금은 담을 수 있는 기간이 아니에요.');
  end if;
  if not exists (select 1 from public.picnic_members m join public.picnic_teams t on t.id = m.team_id
                 where m.id = p_member and t.code = upper(btrim(coalesce(p_code, '')))) then
    return jsonb_build_object('ok', false, 'error', '팀 코드와 이름을 다시 확인해 주세요.');
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
  if exists (select 1 from public.harvest_entries where member_id = p_member and created_at > now() - interval '10 seconds') then
    return jsonb_build_object('ok', false, 'error', '10초 뒤에 다시 담아 주세요.');
  end if;
  if (select count(*) from public.harvest_entries
      where member_id = p_member
        and (created_at at time zone 'Asia/Seoul')::date = (now() at time zone 'Asia/Seoul')::date) >= 5 then
    return jsonb_build_object('ok', false, 'error', '오늘은 다섯 개까지 담을 수 있어요. 내일 또 담아 주세요.');
  end if;
  if v_uid is not null then
    insert into public.notes(user_id, type, content, image_urls) values (v_uid, 'gratitude', v_body, '{}') returning id into v_note;
  end if;
  insert into public.harvest_entries(member_id, note_id, body) values (p_member, v_note, v_body);
  insert into public.star_messages(room, device, name, dept, body, show_name, status, kind)
  values ('harvest', 'm' || p_member, '한 사람', '감사', v_body, true, 'pending', 'live');
  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.harvest_share(bigint) from public, anon;
grant execute on function public.harvest_share(bigint) to authenticated;
revoke all on function public.harvest_write(text, int, text, boolean) from public;
grant execute on function public.harvest_write(text, int, text, boolean) to anon, authenticated;
