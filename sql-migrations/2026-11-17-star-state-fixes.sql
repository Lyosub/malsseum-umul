-- 별 밝히기 상태 정리 (2026-11-17)
-- * 감사 문구: 서버 오류 문구의 「응원」을 「감사」로.
-- * 방에 open_from(이 시각부터 받기)·live_from(이 시각 전 글은 「미리 보냄」 pre) 추가.
--   → 「시연 처음부터」(pre만 남김)가 미리 받은 감사를 지우지 않는다. 5개 제한은 pre·live 따로.
-- * 다시 승인하면 새 순번을 줘서 켜져 있는 하늘 화면에도 다시 뜬다.
-- * reset_seq(처음부터 횟수)·state_at(화면 상태가 바뀐 시각)을 하늘 화면에 내려
--   하늘 화면이 새로고침돼도 지금 상태를 따라가고, 처음부터를 확실히 알아챈다.
-- * star_send: 숫자 막기를 7자리부터로(「2026년」 허용), 결과에 kind를 돌려준다.
-- * star_sky에 racers(추첨 레이스에 나올 부서 목록) 추가.
-- * 광주리(harvest 방)도 같은 함수를 쓴다. 광주리의 동작은 바뀌지 않는다.
-- 상태 이름: empty 빈 하늘 · stage 무대 · cheer 감사의 시간 · gather 별이 모이는 시간 · draw 별 추첨
alter table public.star_rooms add column if not exists open_from timestamptz;
alter table public.star_rooms add column if not exists live_from timestamptz;
alter table public.star_rooms add column if not exists reset_seq int not null default 0;
alter table public.star_rooms add column if not exists state_at timestamptz not null default now();

CREATE OR REPLACE FUNCTION public.star_send(p_room text, p_device text, p_name text, p_dept text, p_body text, p_show_name boolean)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  r public.star_rooms;
  v_name text := btrim(coalesce(p_name, ''));
  v_body text := btrim(coalesce(p_body, ''));
  v_dev  text := left(btrim(coalesce(p_device, '')), 64);
  v_status text := 'pending';
  v_kind text;
  v_bad text[] := array['시발','씨발','ㅅㅂ','ㅆㅂ','병신','ㅂㅅ','개새','지랄','ㅈㄹ','좆','존나','졸라','닥쳐','꺼져','미친놈','미친년','fuck','shit'];
  w text;
begin
  select * into r from public.star_rooms where room = p_room;
  if not found or not r.open then
    return jsonb_build_object('ok', false, 'error', '지금은 감사를 받지 않는 시간입니다.');
  end if;
  if r.open_from is not null and now() < r.open_from then
    return jsonb_build_object('ok', false, 'error',
      to_char(r.open_from at time zone 'Asia/Seoul', 'FMMM"월" FMDD"일"') || '부터 감사를 받습니다.');
  end if;
  -- 시험 모드면 test, 행사 날(live_from) 전에 보낸 글은 pre(미리 보냄), 그 뒤는 live
  v_kind := case when r.test_mode then 'test'
                 when r.live_from is not null and now() < r.live_from then 'pre'
                 else 'live' end;
  if v_dev = '' then
    return jsonb_build_object('ok', false, 'error', '페이지를 새로고침한 뒤 다시 보내 주세요.');
  end if;
  if char_length(v_name) < 1 or char_length(v_name) > 20 then
    return jsonb_build_object('ok', false, 'error', '이름을 1~20자로 적어 주세요.');
  end if;
  if char_length(v_body) < 1 or char_length(v_body) > 40 then
    return jsonb_build_object('ok', false, 'error', '감사는 1~40자로 적어 주세요.');
  end if;
  if p_dept not in ('영어예배부','영아부','유아부','유치부','유년부','초등부','중등부','고등부') then
    return jsonb_build_object('ok', false, 'error', '성탄 선물을 보낼 부서를 골라 주세요.');
  end if;
  -- 숫자 4자리(「2026년」 등)는 감사에 흔히 들어가므로 7자리부터 막는다
  if (v_body || ' ' || v_name) ~ '[0-9]{7,}' or (v_body || ' ' || v_name) ~ '[0-9]{2,4}[- .][0-9]{3,4}[- .][0-9]{4}' then
    return jsonb_build_object('ok', false, 'error', '전화번호처럼 보이는 숫자는 보낼 수 없습니다.');
  end if;
  if exists (select 1 from public.star_messages
             where room = p_room and device = v_dev and created_at > now() - interval '10 seconds') then
    return jsonb_build_object('ok', false, 'error', '10초 뒤에 다시 보내 주세요.');
  end if;
  -- 5개 제한은 미리 보내기(pre)와 행사 날(live)을 따로 센다
  if v_kind <> 'test' and (select count(*) from public.star_messages
                            where room = p_room and device = v_dev and kind = v_kind) >= 5 then
    return jsonb_build_object('ok', false, 'error',
      case when v_kind = 'pre' then '미리 보내기는 한 휴대폰에서 감사 5개까지입니다.'
           else '한 휴대폰에서는 감사를 5개까지 보낼 수 있습니다.' end);
  end if;
  foreach w in array v_bad loop
    if position(w in lower(v_body || ' ' || v_name)) > 0 then
      v_status := 'blocked';  -- 저장은 하되 화면과 승인 목록에는 올리지 않는다
    end if;
  end loop;

  insert into public.star_messages(room, device, name, dept, body, show_name, status, kind)
  values (p_room, v_dev, v_name, p_dept, v_body, coalesce(p_show_name, true), v_status,
          v_kind);
  return jsonb_build_object('ok', true, 'kind', v_kind);   -- 보내기 화면이 「미리 보냄」 안내를 따로 보여 준다
end;
$function$;

CREATE OR REPLACE FUNCTION public.star_sky(p_room text, p_after bigint DEFAULT 0)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select jsonb_build_object(
    'state', r.state,
    'stage_label', r.stage_label,
    'state_seq', r.state_seq,
    'draw_seq', r.draw_seq,
    'epoch', r.reset_seq,
    'state_age', extract(epoch from now() - r.state_at),
    'total', (select count(*) from public.star_messages m where m.room = r.room and m.status = 'approved'),
    'draw', (select jsonb_build_object('id', m.id, 'body', m.body, 'name', m.name, 'dept', m.dept)
             from public.star_messages m where m.id = r.draw_id),
    'messages', coalesce((
      select jsonb_agg(jsonb_build_object(
               'id', m.id, 'seq', m.approve_seq, 'body', m.body,
               'who', case when m.show_name then m.name else '한 성도' end) order by m.approve_seq)
      from public.star_messages m
      where m.room = r.room and m.status = 'approved' and m.approve_seq > coalesce(p_after, 0)
    ), '[]'::jsonb),
    -- 추첨 레이스에 나오는 부서: 아직 추첨 대상이 남은 부서 + 이번 당첨 부서(이름은 내려가지 않는다)
    'racers', coalesce((
      select jsonb_agg(distinct m.dept) from public.star_messages m
      where m.room = r.room and m.status = 'approved' and m.kind <> 'test'
        and (m.id = r.draw_id or (
          not exists (select 1 from public.star_messages x
                      where x.room = r.room and x.device = m.device and (x.won or x.absent))
          and (not r.no_dupe_dept or m.dept not in (select w.dept from public.star_messages w
                                                    where w.room = r.room and w.won and w.id is distinct from r.draw_id))))
    ), '[]'::jsonb),
    'hidden', coalesce((
      select jsonb_agg(m.id) from public.star_messages m
      where m.room = r.room and m.status = 'hidden' and m.approve_seq is not null
    ), '[]'::jsonb)
  )
  from public.star_rooms r
  where r.room = p_room;
$function$;

CREATE OR REPLACE FUNCTION public.star_admin(p_room text, p_code text, p_action text, p_args jsonb DEFAULT '{}'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  r public.star_rooms;
  v_id bigint;
  v_dev text;
  v_state text;
begin
  select * into r from public.star_rooms where room = p_room;
  -- 2026-11-05: 광주리는 말씀우물 관리자 계정이면 코드 없이 열린다(관리자 페이지 탭). 다른 방은 코드만.
  if not found or (r.admin_code is distinct from p_code and not (p_room = 'harvest' and coalesce((select pf.is_admin from public.profiles pf where pf.user_id = auth.uid()), false))) then
    return jsonb_build_object('ok', false, 'error', '관리 코드가 맞지 않습니다.');
  end if;

  if p_action = 'list' then
    return jsonb_build_object('ok', true,
      'room', jsonb_build_object('state', r.state, 'stage_label', r.stage_label,
                                 'no_dupe_dept', r.no_dupe_dept, 'test_mode', r.test_mode, 'open', r.open,
                                 'open_from', r.open_from, 'live_from', r.live_from),
      'counts', (select jsonb_object_agg(status, c) from
                  (select status, count(*) c from public.star_messages where room = p_room group by status) t),
      'draw', (select jsonb_build_object('id', m.id, 'body', m.body, 'name', m.name, 'dept', m.dept)
               from public.star_messages m where m.id = r.draw_id),
      'winners', coalesce((select jsonb_agg(jsonb_build_object('name', name, 'dept', dept, 'body', body) order by id)
                           from public.star_messages where room = p_room and won), '[]'::jsonb),
      'messages', coalesce((select jsonb_agg(jsonb_build_object(
                    'id', id, 'name', name, 'dept', dept, 'body', body, 'show_name', show_name,
                    'status', status, 'kind', kind, 'won', won, 'at', created_at) order by id desc)
                  from (select * from public.star_messages where room = p_room order by id desc limit 300) t), '[]'::jsonb));

  elsif p_action = 'approve' then
    update public.star_messages set status = 'approved',
           approve_seq = nextval('public.star_approve_seq')  -- 다시 승인해도 새 순번을 줘야 켜져 있는 하늘 화면이 받는다
     where room = p_room and id = (p_args->>'id')::bigint and status in ('pending', 'hidden', 'blocked');

  elsif p_action = 'approve_all' then
    update public.star_messages m set status = 'approved', approve_seq = nextval('public.star_approve_seq')
      from (select id from public.star_messages where room = p_room and status = 'pending' order by id) s
     where m.id = s.id;

  elsif p_action = 'hide' then
    update public.star_messages set status = 'hidden', won = false
     where room = p_room and id = (p_args->>'id')::bigint;

  elsif p_action = 'state' then
    v_state := p_args->>'state';
    if v_state not in ('empty', 'stage', 'cheer', 'gather', 'draw') then
      return jsonb_build_object('ok', false, 'error', '알 수 없는 화면 상태입니다.');
    end if;
    update public.star_rooms set state = v_state, stage_label = coalesce(p_args->>'label', stage_label),
           state_seq = state_seq + 1, state_at = now(), updated_at = now() where room = p_room;

  elsif p_action in ('draw', 'redraw') then
    if p_action = 'redraw' and r.draw_id is not null then
      update public.star_messages set won = false, absent = true where id = r.draw_id;
    end if;
    -- 한 휴대폰은 추첨 대상 1개: 먼저 휴대폰을 무작위로 고르고, 그 휴대폰의 승인된 메시지 중 하나를 고른다
    select device into v_dev from (
      select distinct m.device from public.star_messages m
       where m.room = p_room and m.status = 'approved' and m.kind <> 'test'
         and not exists (select 1 from public.star_messages x
                          where x.room = p_room and x.device = m.device and (x.won or x.absent))
         and (not r.no_dupe_dept or m.dept not in (select dept from public.star_messages
                                                   where room = p_room and won))
    ) d order by random() limit 1;
    if v_dev is null then
      update public.star_rooms set draw_id = null, draw_seq = draw_seq + 1, updated_at = now() where room = p_room;
      return jsonb_build_object('ok', false, 'error', '추첨할 수 있는 감사가 없습니다.');
    end if;
    select id into v_id from public.star_messages m
     where m.room = p_room and m.device = v_dev and m.status = 'approved' and m.kind <> 'test'
       and (not r.no_dupe_dept or m.dept not in (select dept from public.star_messages where room = p_room and won))
     order by random() limit 1;
    update public.star_messages set won = true where id = v_id;
    update public.star_rooms set draw_id = v_id, draw_seq = draw_seq + 1, state = 'draw',
           state_seq = case when state = 'draw' then state_seq else state_seq + 1 end,
           state_at = case when state = 'draw' then state_at else now() end, updated_at = now()
     where room = p_room;

  elsif p_action = 'set' then
    update public.star_rooms set
      no_dupe_dept = coalesce((p_args->>'no_dupe_dept')::boolean, no_dupe_dept),
      test_mode    = coalesce((p_args->>'test_mode')::boolean, test_mode),
      open         = coalesce((p_args->>'open')::boolean, open),
      updated_at = now()
     where room = p_room;

  elsif p_action = 'clear_test' then
    delete from public.star_messages where room = p_room and kind = 'test';

  elsif p_action = 'reset' then
    -- 시연 다시 하기: 미리 받은 메시지(pre)만 남기고 지운 뒤 처음 상태로
    delete from public.star_messages where room = p_room and kind <> 'pre';
    update public.star_messages set won = false, absent = false where room = p_room;
    update public.star_rooms set state = 'empty', stage_label = '', draw_id = null,
           state_seq = state_seq + 1, draw_seq = draw_seq + 1, reset_seq = reset_seq + 1, state_at = now(),
           updated_at = now() where room = p_room;

  else
    return jsonb_build_object('ok', false, 'error', '알 수 없는 동작입니다.');
  end if;

  return jsonb_build_object('ok', true);
end;
$function$;
