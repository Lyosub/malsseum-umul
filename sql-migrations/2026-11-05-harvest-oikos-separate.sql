-- 원정대 시상과 감사 시상을 분리한다 (2026-11-05 전도사님 결정).
-- * 원정대: 팀별로 움직이고 한 오이코스가 여러 팀으로 나뉠 수 있으므로 팀 순위로 시상한다. 오이코스를 묻지 않는다.
-- * 감사의 광주리: 오이코스별로 따로 시상한다. 점수표는 광주리 관리 화면에서 광주리 관리 코드로 본다.
--   인정: 담당자가 승인한 글, 공백 빼고 5자 이상, 기기(또는 계정)당 하루 한 번, 11/14까지.
-- 2026-11-05-harvest-oikos-score.sql의 합산(원정대 120 + 광주리 60)을 되돌린다.

drop function if exists public.harvest_oikos_scores(text, text);
drop function if exists public.picnic_set_oikos(text, integer, bigint);

create or replace function public.picnic_join(p_code text) returns jsonb
language sql stable security definer
set search_path = public
as $$
  select coalesce((
    select jsonb_build_object('ok', true,
      'team', jsonb_build_object('id', t.id, 'name', t.name, 'emoji', t.emoji, 'event', t.event),
      'members', coalesce((select jsonb_agg(jsonb_build_object('id', m.id, 'name', m.name) order by m.sort, m.name)
                           from public.picnic_members m where m.team_id = t.id), '[]'::jsonb))
    from public.picnic_teams t where t.code = upper(btrim(coalesce(p_code, '')))
  ), jsonb_build_object('ok', false, 'error', '팀 코드를 다시 확인해 주세요.'))
$$;

alter table public.picnic_members drop column if exists oikos_group;
alter table public.picnic_members drop column if exists oikos_set;
alter table public.harvest_config drop column if exists score_days;
alter table public.harvest_config drop column if exists score_max;

create or replace function public.harvest_oikos_scores(p_code text) returns jsonb
language plpgsql stable security definer
set search_path = public
as $$
declare
  c public.harvest_config;
begin
  if not exists (select 1 from public.star_rooms where room = 'harvest' and admin_code = coalesce(p_code, '')) then
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
$$;
revoke all on function public.harvest_oikos_scores(text) from public;
grant execute on function public.harvest_oikos_scores(text) to anon, authenticated;
