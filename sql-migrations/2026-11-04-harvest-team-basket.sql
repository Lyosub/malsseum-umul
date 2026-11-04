-- 감사의 광주리: 쓰기 화면에 「우리 팀 광주리」를 보여 준다 (2026-11-04, 전도사님 결정).
-- 자기 팀의 인정 횟수와 전체 칸 수(팀원 수 × 6일)만 내려준다. 다른 팀 수와 원정대 점수는 내려가지 않는다.
create or replace function public.harvest_team_me(p_code text, p_member int) returns jsonb
language sql stable
security definer
set search_path = public
as $$
  select coalesce((
    select jsonb_build_object('ok', true, 'team', t.name, 'emoji', t.emoji, 'name', m.name,
      'days', public.harvest_member_days(m.id), 'score_days', c.score_days,
      'team_n', (p.part->>'n')::int,
      'team_total', (p.part->>'members')::int * (p.part->>'days')::int)
    from public.picnic_teams t
    join public.picnic_members m on m.team_id = t.id
    cross join public.harvest_config c
    cross join lateral (select public.harvest_team_part(t.id) as part) p
    where t.code = upper(btrim(coalesce(p_code, ''))) and m.id = p_member
  ), jsonb_build_object('ok', false))
$$;
revoke all on function public.harvest_team_me(text, int) from public;
grant execute on function public.harvest_team_me(text, int) to anon, authenticated;
