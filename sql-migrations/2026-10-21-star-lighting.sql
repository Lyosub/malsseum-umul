-- 별 밝히기 (2026-10-21): 2026 교회학교 성탄발표회 참여 프로그램의 시제품.
-- 성도가 휴대폰(star.html)으로 응원 한 줄을 보내면, 교사가 승인한 것만 본당 화면(star-sky.html)에 별로 켜진다.
-- 관리 화면(star-admin.html)은 방(room)마다 정한 관리 코드로만 쓸 수 있다.
-- * 새 표 2개, 새 함수 3개만 추가한다. 기존 표·함수는 건드리지 않는다. 재실행해도 안전.
-- * 두 표 모두 RLS를 켜고 정책을 두지 않는다 → 익명 사용자는 표를 직접 읽거나 쓸 수 없고, 아래 함수로만 접근한다.
-- * 하늘 화면에는 승인된 메시지와 「표시 이름」만 내려간다(화면 이름 표시를 끈 사람은 「한 성도」).
--   실명·부서는 관리 화면과 추첨 결과에만 나온다(추첨 당첨 시 이름 공개는 기획안 v6대로).
-- * 방 만들기와 관리 코드는 이 파일에 적지 않는다(저장소에 코드가 남지 않게). 예:
--   insert into public.star_rooms(room, admin_code) values ('demo', '<관리 코드>');

create table if not exists public.star_rooms (
  room          text primary key,
  admin_code    text not null,
  state         text not null default 'empty',   -- empty(빈 하늘) | stage(무대) | cheer(응원의 시간) | gather(별이 모이는 시간) | draw(별 추첨)
  stage_label   text not null default '',
  state_seq     int  not null default 0,
  draw_seq      int  not null default 0,
  draw_id       bigint,
  no_dupe_dept  boolean not null default true,     -- 같은 부서 중복 당첨 막기
  test_mode     boolean not null default false,    -- 켜면 새 메시지를 「시험」으로 저장
  open          boolean not null default true,
  updated_at    timestamptz not null default now()
);

create sequence if not exists public.star_approve_seq;

create table if not exists public.star_messages (
  id           bigserial primary key,
  room         text not null references public.star_rooms(room) on delete cascade,
  device       text not null,
  name         text not null,
  dept         text not null,
  body         text not null,
  show_name    boolean not null default true,
  status       text not null default 'pending',  -- pending | approved | hidden | blocked
  kind         text not null default 'live',     -- live | pre(미리 보내기) | test(시험)
  approve_seq  bigint,
  won          boolean not null default false,
  absent       boolean not null default false,   -- 당첨됐지만 자리에 없어 다시 추첨함
  created_at   timestamptz not null default now()
);
create index if not exists star_messages_room_seq on public.star_messages(room, approve_seq);
create index if not exists star_messages_room_device on public.star_messages(room, device, created_at);

alter table public.star_rooms enable row level security;
alter table public.star_messages enable row level security;
revoke all on public.star_rooms from anon, authenticated;
revoke all on public.star_messages from anon, authenticated;

-- 1) 보내기 ------------------------------------------------------------------
create or replace function public.star_send(
  p_room text, p_device text, p_name text, p_dept text, p_body text, p_show_name boolean
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.star_rooms;
  v_name text := btrim(coalesce(p_name, ''));
  v_body text := btrim(coalesce(p_body, ''));
  v_dev  text := left(btrim(coalesce(p_device, '')), 64);
  v_status text := 'pending';
  v_bad text[] := array['시발','씨발','ㅅㅂ','ㅆㅂ','병신','ㅂㅅ','개새','지랄','ㅈㄹ','좆','존나','졸라','닥쳐','꺼져','미친놈','미친년','fuck','shit'];
  w text;
begin
  select * into r from public.star_rooms where room = p_room;
  if not found or not r.open then
    return jsonb_build_object('ok', false, 'error', '지금은 응원을 받지 않는 시간입니다.');
  end if;
  if v_dev = '' then
    return jsonb_build_object('ok', false, 'error', '페이지를 새로고침한 뒤 다시 보내 주세요.');
  end if;
  if char_length(v_name) < 1 or char_length(v_name) > 20 then
    return jsonb_build_object('ok', false, 'error', '이름을 1~20자로 적어 주세요.');
  end if;
  if char_length(v_body) < 1 or char_length(v_body) > 40 then
    return jsonb_build_object('ok', false, 'error', '응원은 1~40자로 적어 주세요.');
  end if;
  if p_dept not in ('영어예배부','영아부','유아부','유치부','유년부','초등부','중등부','고등부') then
    return jsonb_build_object('ok', false, 'error', '내 부서를 골라 주세요.');
  end if;
  if (v_body || ' ' || v_name) ~ '[0-9]{4,}' or (v_body || ' ' || v_name) ~ '[0-9]{2,4}[- .][0-9]{3,4}[- .][0-9]{4}' then
    return jsonb_build_object('ok', false, 'error', '전화번호처럼 보이는 숫자는 보낼 수 없습니다.');
  end if;
  if exists (select 1 from public.star_messages
             where room = p_room and device = v_dev and created_at > now() - interval '10 seconds') then
    return jsonb_build_object('ok', false, 'error', '10초 뒤에 다시 보내 주세요.');
  end if;
  if (select count(*) from public.star_messages where room = p_room and device = v_dev and kind <> 'test') >= 5 then
    return jsonb_build_object('ok', false, 'error', '한 휴대폰에서는 응원을 5개까지 보낼 수 있습니다.');
  end if;
  foreach w in array v_bad loop
    if position(w in lower(v_body || ' ' || v_name)) > 0 then
      v_status := 'blocked';  -- 저장은 하되 화면과 승인 목록에는 올리지 않는다
    end if;
  end loop;

  insert into public.star_messages(room, device, name, dept, body, show_name, status, kind)
  values (p_room, v_dev, v_name, p_dept, v_body, coalesce(p_show_name, true), v_status,
          case when r.test_mode then 'test' else 'live' end);
  return jsonb_build_object('ok', true);
end;
$$;

-- 2) 하늘 화면 ----------------------------------------------------------------
create or replace function public.star_sky(p_room text, p_after bigint default 0)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'state', r.state,
    'stage_label', r.stage_label,
    'state_seq', r.state_seq,
    'draw_seq', r.draw_seq,
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
    'hidden', coalesce((
      select jsonb_agg(m.id) from public.star_messages m
      where m.room = r.room and m.status = 'hidden' and m.approve_seq is not null
    ), '[]'::jsonb)
  )
  from public.star_rooms r
  where r.room = p_room;
$$;

-- 3) 관리 화면 ----------------------------------------------------------------
create or replace function public.star_admin(p_room text, p_code text, p_action text, p_args jsonb default '{}'::jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.star_rooms;
  v_id bigint;
  v_dev text;
  v_state text;
begin
  select * into r from public.star_rooms where room = p_room;
  if not found or r.admin_code is distinct from p_code then
    return jsonb_build_object('ok', false, 'error', '관리 코드가 맞지 않습니다.');
  end if;

  if p_action = 'list' then
    return jsonb_build_object('ok', true,
      'room', jsonb_build_object('state', r.state, 'stage_label', r.stage_label,
                                 'no_dupe_dept', r.no_dupe_dept, 'test_mode', r.test_mode, 'open', r.open),
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
           approve_seq = coalesce(approve_seq, nextval('public.star_approve_seq'))
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
           state_seq = state_seq + 1, updated_at = now() where room = p_room;

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
      return jsonb_build_object('ok', false, 'error', '추첨할 수 있는 응원이 없습니다.');
    end if;
    select id into v_id from public.star_messages m
     where m.room = p_room and m.device = v_dev and m.status = 'approved' and m.kind <> 'test'
       and (not r.no_dupe_dept or m.dept not in (select dept from public.star_messages where room = p_room and won))
     order by random() limit 1;
    update public.star_messages set won = true where id = v_id;
    update public.star_rooms set draw_id = v_id, draw_seq = draw_seq + 1, state = 'draw',
           state_seq = case when state = 'draw' then state_seq else state_seq + 1 end, updated_at = now()
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
           state_seq = state_seq + 1, draw_seq = draw_seq + 1, updated_at = now() where room = p_room;

  else
    return jsonb_build_object('ok', false, 'error', '알 수 없는 동작입니다.');
  end if;

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.star_send(text, text, text, text, text, boolean) from public;
revoke all on function public.star_sky(text, bigint) from public;
revoke all on function public.star_admin(text, text, text, jsonb) from public;
grant execute on function public.star_send(text, text, text, text, text, boolean) to anon, authenticated;
grant execute on function public.star_sky(text, bigint) to anon, authenticated;
grant execute on function public.star_admin(text, text, text, jsonb) to anon, authenticated;
