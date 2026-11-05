-- 이번 주 아직 참여하지 않은 오이코스 학생 명단. 그 오이코스의 교사와 관리자·부장만 받는다.
-- 참여 기준은 get_group_week_wellfill과 같다(이번 주 월요일부터 출석 또는 인사·감사·기도 기록).
create or replace function public.get_group_week_absent(p_group_id bigint)
returns jsonb
language plpgsql
stable
security definer
set search_path to 'public'
as $function$
declare
  v_me profiles%rowtype;
  v_start date := (date_trunc('week', (now() at time zone 'Asia/Seoul')))::date;
  v_names jsonb;
begin
  select * into v_me from profiles where user_id = auth.uid();
  if v_me.user_id is null then return jsonb_build_object('ok', false); end if;

  if not (coalesce(v_me.is_admin, false) or coalesce(v_me.is_department_head, false)
          or (coalesce(v_me.is_teacher, false)
              and exists (select 1 from group_members gm where gm.group_id = p_group_id and gm.user_id = auth.uid()))) then
    return jsonb_build_object('ok', false);
  end if;

  select coalesce(jsonb_agg(p.nickname order by p.nickname), '[]'::jsonb) into v_names
    from group_members gm
    join profiles p on p.user_id = gm.user_id
   where gm.group_id = p_group_id
     and not coalesce(p.is_teacher, false)
     and not coalesce(p.is_admin, false)
     and not coalesce(p.is_department_head, false)
     and not exists (select 1 from attendance a where a.user_id = gm.user_id and a."date" >= v_start)
     and not exists (select 1 from notes n where n.user_id = gm.user_id
                       and n.type in ('greeting', 'gratitude', 'prayer')
                       and (n.created_at at time zone 'Asia/Seoul')::date >= v_start);

  return jsonb_build_object('ok', true, 'names', v_names);
end;
$function$;

revoke all on function public.get_group_week_absent(bigint) from public, anon;
grant execute on function public.get_group_week_absent(bigint) to authenticated;
