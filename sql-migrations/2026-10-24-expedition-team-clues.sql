-- 가을 원정대 히든 1: 말씀 조각 단서를 팀마다 따로(그 팀 조각 4곳만) — 2026-10-24 전도사님 결정(A)
-- card_clues 항목에 "team": 팀 id 를 넣으면 그 팀에게만 보인다. team 이 없으면 전과 같이 모든 팀에게.
CREATE OR REPLACE FUNCTION public.picnic_state(p_code text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  t public.picnic_teams;
  e public.picnic_events;
  v_open boolean;
begin
  select * into t from public.picnic_teams where code = upper(btrim(coalesce(p_code, '')));
  if not found then
    return jsonb_build_object('ok', false, 'error', '팀 코드를 다시 확인해 주세요.');
  end if;
  select * into e from public.picnic_events where event = t.event;
  v_open := e.hidden_force or now() >= e.hidden_open_at;

  return jsonb_build_object(
    'ok', true,
    'now', now(),
    'team', jsonb_build_object('id', t.id, 'name', t.name, 'emoji', t.emoji),
    'hidden_open', v_open,
    'hidden_open_at', e.hidden_open_at,
    'hint_unlock', now() >= e.hint_unlock_at,
    'hint_unlock_at', e.hint_unlock_at,
    'meet_place', case when v_open then e.meet_place else '' end,
    'clues', case when v_open then coalesce((
               select jsonb_agg(c order by c->>'at') from jsonb_array_elements(e.card_clues) c
               where (c->>'at')::timestamptz <= now()
                 -- 2026-10-24: 팀별 단서(team)는 그 팀에게만, team이 없으면 모든 팀에게
                 and (coalesce(c->>'team', '') = '' or (c->>'team')::int = t.id)), '[]'::jsonb)
             else '[]'::jsonb end,
    'refs', (select jsonb_agg(jsonb_build_object('q', a.q, 'ref', a.ref) order by a.q) from public.picnic_answers a),
    'subs', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', s.id, 'kind', s.kind, 'q', s.q, 'status', s.status, 'points', s.points,
        'text', case when s.kind in ('animal','verse') then s.text_val end,
        'photo', s.photo_url, 'who', m.name, 'at', s.created_at, 'note', s.note) order by s.created_at)
      from public.picnic_subs s left join public.picnic_members m on m.id = s.member_id
      where s.team_id = t.id), '[]'::jsonb),
    'hints', coalesce((
      select jsonb_object_agg(s.q::text, coalesce(e.place_hints->>(s.q::text), '선생님께 여쭤보세요!'))
      from (select distinct q from public.picnic_subs where team_id = t.id and kind = 'hint') s), '{}'::jsonb),
    'board', public.picnic_board(t.event),
    'results_open', e.results_open,
    'close_at', e.close_at, 'closed', now() > e.close_at, 'reel_until', e.reel_until,
    'my_score', case when e.results_open then public.picnic_team_score(t.id) end
  );
end;
$function$;

notify pgrst, 'reload schema';
