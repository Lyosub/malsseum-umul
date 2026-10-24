-- 가을 원정대: 관리 화면 점수판에 항목별로 얻은 점수 보이기 (2026-10-24)
create or replace function public.picnic_team_parts(p_team int) returns jsonb
language sql stable
set search_path = public
as $$
  select coalesce(jsonb_object_agg(kind, jsonb_build_object('pts', pts, 'n', n)), '{}'::jsonb) from (
    select kind, sum(best)::int as pts, count(*)::int as n from (
      select kind, q, max(points) as best from public.picnic_subs
      where team_id = p_team and status = 'ok' and kind <> 'hint'
      group by kind, q
    ) s group by kind
  ) k
$$;
revoke all on function public.picnic_team_parts(int) from public, anon, authenticated;

-- picnic_admin: 점수판 팀마다 'parts' 추가(나머지는 그대로)
CREATE OR REPLACE FUNCTION public.picnic_admin(p_event text, p_code text, p_action text, p_args jsonb DEFAULT '{}'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  e public.picnic_events;
  s public.picnic_subs;
  v_pts int;
  v_team int;
  v_code text;
  v_name text;
  i int := 0;
begin
  select * into e from public.picnic_events where event = p_event;
  -- 관리 코드가 맞거나, 말씀우물 관리자 계정으로 로그인한 경우(관리자 페이지 「원정대」 탭)
  if not found or (e.admin_code <> coalesce(p_code, '')
      and not exists (select 1 from profiles p where p.user_id = auth.uid() and coalesce(p.is_admin, false))) then
    return jsonb_build_object('ok', false, 'error', '관리 코드가 맞지 않습니다.');
  end if;

  if p_action = 'overview' then
    return jsonb_build_object('ok', true, 'now', now(),
      'event', jsonb_build_object('title', e.title, 'hidden_open_at', e.hidden_open_at, 'hint_unlock_at', e.hint_unlock_at,
        'hidden_force', e.hidden_force, 'results_open', e.results_open, 'card_clues', e.card_clues,
        'place_hints', e.place_hints, 'meet_place', e.meet_place, 'close_at', e.close_at, 'reel_until', e.reel_until),
      'teams', coalesce((select jsonb_agg(jsonb_build_object(
          'id', t.id, 'name', t.name, 'emoji', t.emoji, 'code', t.code, 'penalty', t.penalty, 'bonus', t.bonus,
          'score', public.picnic_team_score(t.id), 'tb', public.picnic_tiebreak(t.id), 'parts', public.picnic_team_parts(t.id),
          'members', coalesce((select jsonb_agg(jsonb_build_object('id', m.id, 'name', m.name,
                       'count', (select count(*) from public.picnic_subs x where x.member_id = m.id and x.status in ('ok','pending') and x.kind <> 'hint'))
                       order by m.sort, m.name) from public.picnic_members m where m.team_id = t.id), '[]'::jsonb)
        ) order by t.sort, t.id) from public.picnic_teams t where t.event = p_event), '[]'::jsonb),
      'pending', coalesce((select jsonb_agg(jsonb_build_object(
          'id', x.id, 'team_id', t.id, 'team', t.name, 'emoji', t.emoji, 'kind', x.kind, 'q', x.q, 'text', x.text_val, 'photo', x.photo_url,
          'who', m.name, 'at', x.created_at,
          'answer', case when x.kind = 'verse' then (select a.verse from public.picnic_answers a where a.q = x.q) end,
          'ref', case when x.kind in ('verse','animal_photo') then (select a.ref from public.picnic_answers a where a.q = x.q) end,
          'animals', case when x.kind = 'animal_photo' then (select to_jsonb(a.animals) from public.picnic_answers a where a.q = x.q) end,
          'hint_used', x.kind = 'place' and exists (select 1 from public.picnic_subs h where h.team_id = x.team_id and h.kind = 'hint' and h.q = x.q)
        ) order by x.created_at) from public.picnic_subs x join public.picnic_teams t on t.id = x.team_id
          left join public.picnic_members m on m.id = x.member_id
          where t.event = p_event and x.status = 'pending'), '[]'::jsonb),
      'photos', coalesce((select jsonb_agg(jsonb_build_object(
          'id', x.id, 'team_id', t.id, 'team', t.name, 'emoji', t.emoji, 'kind', x.kind, 'q', x.q, 'photo', x.photo_url, 'who', m.name, 'points', x.points)
          order by x.created_at desc) from public.picnic_subs x join public.picnic_teams t on t.id = x.team_id
          left join public.picnic_members m on m.id = x.member_id
          where t.event = p_event and x.status = 'ok' and x.photo_url is not null), '[]'::jsonb)
    );

  elsif p_action = 'review' then
    select x.* into s from public.picnic_subs x join public.picnic_teams t on t.id = x.team_id
      where x.id = (p_args->>'id')::bigint and t.event = p_event;
    if not found then return jsonb_build_object('ok', false, 'error', '없는 제출입니다.'); end if;
    if (p_args->>'ok')::boolean then
      v_pts := case s.kind
        when 'animal_photo' then 2
        when 'verse' then 2
        when 'place' then case when exists (select 1 from public.picnic_subs h where h.team_id = s.team_id and h.kind = 'hint' and h.q = s.q) then 3 else 5 end
        when 'hidden1' then 15   -- 2026-10-23 조정: 말씀 조각(가장 어려움) 15점, 단풍잎 5점
        when 'hidden2' then 5
        when 'hidden3' then 10
        else 0 end;
      update public.picnic_subs set status = 'ok', points = v_pts, reviewed_at = now() where id = s.id;
      -- 같은 항목의 다른 대기 제출은 정리
      update public.picnic_subs set status = 'rejected', reviewed_at = now()
        where team_id = s.team_id and kind = s.kind and q = s.q and status = 'pending' and id <> s.id;
    else
      update public.picnic_subs set status = 'rejected', points = 0, reviewed_at = now(),
        note = nullif(left(btrim(coalesce(p_args->>'reason', '')), 100), '') where id = s.id;
    end if;
    return jsonb_build_object('ok', true);

  elsif p_action = 'undo' then  -- 승인한 사진·말씀을 다시 대기로
    update public.picnic_subs x set status = 'pending', points = 0, reviewed_at = null
      from public.picnic_teams t where t.id = x.team_id and t.event = p_event and x.id = (p_args->>'id')::bigint and x.kind <> 'animal';
    return jsonb_build_object('ok', true);

  elsif p_action = 'adjust' then
    update public.picnic_teams set penalty = greatest(0, coalesce((p_args->>'penalty')::int, penalty)),
                                   bonus = greatest(0, coalesce((p_args->>'bonus')::int, bonus))
      where id = (p_args->>'team')::int and event = p_event;
    return jsonb_build_object('ok', true);

  elsif p_action = 'settings' then
    update public.picnic_events set
      hidden_force  = coalesce((p_args->>'hidden_force')::boolean, hidden_force),
      results_open  = coalesce((p_args->>'results_open')::boolean, results_open),
      hidden_open_at = coalesce((p_args->>'hidden_open_at')::timestamptz, hidden_open_at),
      hint_unlock_at = coalesce((p_args->>'hint_unlock_at')::timestamptz, hint_unlock_at),
      close_at       = coalesce((p_args->>'close_at')::timestamptz, close_at),
      reel_until     = coalesce((p_args->>'reel_until')::timestamptz, reel_until),
      card_clues    = coalesce(p_args->'card_clues', card_clues),
      place_hints   = coalesce(p_args->'place_hints', place_hints),
      meet_place    = coalesce(p_args->>'meet_place', meet_place),
      updated_at    = now()
    where event = p_event;
    return jsonb_build_object('ok', true);

  elsif p_action = 'add_team' then
    v_name := btrim(coalesce(p_args->>'name', ''));
    if v_name = '' then return jsonb_build_object('ok', false, 'error', '팀 이름을 적어 주세요.'); end if;
    loop
      v_code := (array['가을','단풍','은행','사자','사슴','독수리','낙타','표범'])[1 + floor(random() * 8)::int]
                || '-' || lpad((floor(random() * 9000) + 1000)::int::text, 4, '0');
      exit when not exists (select 1 from public.picnic_teams where code = v_code);
    end loop;
    insert into public.picnic_teams(event, name, emoji, code, sort)
      values (p_event, v_name, coalesce(nullif(btrim(p_args->>'emoji'), ''), '🍁'), v_code,
              coalesce((select max(sort) + 1 from public.picnic_teams where event = p_event), 1))
      returning id into v_team;
    return jsonb_build_object('ok', true, 'id', v_team, 'code', v_code);

  elsif p_action = 'edit_team' then
    update public.picnic_teams set name = coalesce(nullif(btrim(p_args->>'name'), ''), name),
                                   emoji = coalesce(nullif(btrim(p_args->>'emoji'), ''), emoji)
      where id = (p_args->>'team')::int and event = p_event;
    return jsonb_build_object('ok', true);

  elsif p_action = 'delete_team' then
    delete from public.picnic_teams where id = (p_args->>'team')::int and event = p_event;
    return jsonb_build_object('ok', true);

  elsif p_action = 'add_members' then  -- {"team": 1, "names": ["홍길동", ...]}
    v_team := (p_args->>'team')::int;
    if not exists (select 1 from public.picnic_teams where id = v_team and event = p_event) then
      return jsonb_build_object('ok', false, 'error', '없는 팀입니다.');
    end if;
    for v_name in select btrim(x) from jsonb_array_elements_text(p_args->'names') x loop
      if v_name <> '' and not exists (select 1 from public.picnic_members where team_id = v_team and name = v_name) then
        insert into public.picnic_members(team_id, name, sort) values (v_team, left(v_name, 20), i);
        i := i + 1;
      end if;
    end loop;
    return jsonb_build_object('ok', true, 'added', i);

  elsif p_action = 'delete_member' then
    delete from public.picnic_members m using public.picnic_teams t
      where m.id = (p_args->>'member')::int and t.id = m.team_id and t.event = p_event;
    return jsonb_build_object('ok', true);

  elsif p_action = 'signups' then  -- 온라인 참가 신청 목록
    return jsonb_build_object('ok', true, 'until', e.signup_until,
      'list', coalesce((select jsonb_agg(jsonb_build_object('id', x.id, 'name', x.name, 'grade', x.grade, 'class', x.class_name,
                 'teacher', x.teacher, 'friend', x.new_friend, 'stay', x.stay_after,
                 'going', x.going, 'parent_ok', x.parent_ok, 'paper', x.paper, 'at', x.updated_at) order by x.grade, x.name)
               from public.picnic_signups x where x.event = p_event), '[]'::jsonb));

  elsif p_action = 'signup_paper' then  -- 종이 신청서 냈는지 체크
    update public.picnic_signups set paper = coalesce((p_args->>'paper')::boolean, not paper)
      where id = (p_args->>'id')::bigint and event = p_event;
    return jsonb_build_object('ok', true);

  elsif p_action = 'signup_delete' then
    delete from public.picnic_signups where id = (p_args->>'id')::bigint and event = p_event;
    return jsonb_build_object('ok', true);

  elsif p_action = 'signup_until' then
    update public.picnic_events set signup_until = (p_args->>'until')::timestamptz where event = p_event;
    return jsonb_build_object('ok', true);

  elsif p_action = 'reset_subs' then  -- 시험 기록 지우기 (팀·명단은 남김)
    delete from public.picnic_subs x using public.picnic_teams t where t.id = x.team_id and t.event = p_event;
    update public.picnic_teams set penalty = 0, bonus = 0 where event = p_event;
    update public.picnic_events set hidden_force = false, results_open = false where event = p_event;
    return jsonb_build_object('ok', true);
  end if;

  return jsonb_build_object('ok', false, 'error', '알 수 없는 동작입니다.');
end;
$function$;

notify pgrst, 'reload schema';
