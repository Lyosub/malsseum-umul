-- 관리자 페이지 「광주리」 탭: 관리자 계정이면 관리 코드 없이 연다(2026-11-05).

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
$function$;

CREATE OR REPLACE FUNCTION public.harvest_oikos_scores(p_code text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  c public.harvest_config;
begin
  if not exists (select 1 from public.star_rooms where room = 'harvest' and admin_code = coalesce(p_code, '')) and not coalesce((select pf.is_admin from public.profiles pf where pf.user_id = auth.uid()), false) then
    return jsonb_build_object('ok', false, 'error', '관리 코드가 맞지 않습니다.');
  end if;
  select * into c from public.harvest_config where id = 1;
  return jsonb_build_object('ok', true, 'rows', coalesce((
    select jsonb_agg(row_to_json(x)::jsonb order by x.grade, x.name)
    from (
      select g.id, g.name, hg.grade, hg.roster, hv.n
      from public.groups g
      join public.harvest_groups hg on hg.group_id = g.id
      cross join lateral (
        select count(*)::int as n from (
          select distinct m.device, (m.created_at at time zone 'Asia/Seoul')::date
          from public.harvest_entries he join public.star_messages m on m.id = he.message_id
          where he.group_id = g.id and m.status = 'approved'
            and he.created_at >= c.starts_at and he.created_at < c.score_until
            and char_length(regexp_replace(he.body, '\s', '', 'g')) >= 5
        ) d
      ) hv
      where not g.is_hidden
    ) x
  ), '[]'::jsonb));
end;
$function$;
