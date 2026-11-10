-- 감사의 광주리 시상 집계: 「휴대폰 한 대당 하루 한 번」을 없애고 승인된 글을 모두 센다(2026-11-10 전도사님 결정).
-- 쓰기 자체는 harvest_write·harvest_from_note가 기기(또는 계정)당 하루 5개로 막고 있으므로, 하루 최대 5개까지 인정된다.
-- 나머지 조건(승인, 공백 빼고 5자 이상, 시작일~score_until)은 그대로.

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
        select count(distinct m.id)::int as n
        from public.harvest_entries he join public.star_messages m on m.id = he.message_id
        where he.group_id = g.id and m.status = 'approved'
          and he.created_at >= c.starts_at and he.created_at < c.score_until
          and char_length(regexp_replace(he.body, '\s', '', 'g')) >= 5
      ) hv
      where not g.is_hidden
    ) x
  ), '[]'::jsonb));
end;
$function$;

revoke all on function public.harvest_oikos_scores(text) from public;
grant execute on function public.harvest_oikos_scores(text) to anon, authenticated;
