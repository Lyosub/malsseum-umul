-- 생일(월·일만, 선택)과 새 가입자 첫 안내.
alter table public.profiles add column if not exists birth_month smallint check (birth_month between 1 and 12);
alter table public.profiles add column if not exists birth_day smallint check (birth_day between 1 and 31);

-- 이번 주(월~일, 한국 시간) 생일인 오이코스 사람. 같은 오이코스 사람과 관리자·부장만 받는다.
-- 교사와 관리자·부장에게는 실명, 학생에게는 닉네임으로 보낸다. 2월 29일생은 평년엔 2월 28일로 친다.
create or replace function public.get_group_week_birthdays(p_group_id bigint)
returns jsonb
language plpgsql
stable
security definer
set search_path to 'public'
as $function$
declare
  v_me profiles%rowtype;
  v_today date := (now() at time zone 'Asia/Seoul')::date;
  v_start date := (date_trunc('week', (now() at time zone 'Asia/Seoul')))::date;
  v_staff boolean;
  v_rows jsonb;
begin
  select * into v_me from profiles where user_id = auth.uid();
  if v_me.user_id is null then return jsonb_build_object('ok', false); end if;
  v_staff := coalesce(v_me.is_admin, false) or coalesce(v_me.is_department_head, false) or coalesce(v_me.is_teacher, false);
  if not (coalesce(v_me.is_admin, false) or coalesce(v_me.is_department_head, false)
          or exists (select 1 from group_members gm where gm.group_id = p_group_id and gm.user_id = auth.uid())) then
    return jsonb_build_object('ok', false);
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
           'name', case when v_staff then coalesce(nullif(trim(p.real_name), ''), p.nickname) else p.nickname end,
           'm', extract(month from d.day)::int,
           'd', extract(day from d.day)::int,
           'today', d.day = v_today) order by d.day), '[]'::jsonb)
    into v_rows
    from group_members gm
    join profiles p on p.user_id = gm.user_id
    join (select v_start + i as day from generate_series(0, 6) i) d
      on (p.birth_month = extract(month from d.day) and p.birth_day = extract(day from d.day))
      or (p.birth_month = 2 and p.birth_day = 29
          and extract(month from d.day) = 2 and extract(day from d.day) = 28
          and extract(day from make_date(extract(year from d.day)::int, 3, 1) - 1) = 28)
   where gm.group_id = p_group_id;

  return jsonb_build_object('ok', true, 'people', v_rows);
end;
$function$;

revoke all on function public.get_group_week_birthdays(bigint) from public, anon;
grant execute on function public.get_group_week_birthdays(bigint) to authenticated;

-- 가입 14일 안의 계정에 보여 줄 첫 안내 진행 상태.
create or replace function public.get_my_welcome()
returns jsonb
language plpgsql
stable
security definer
set search_path to 'public'
as $function$
declare
  v_uid uuid := auth.uid();
  v_created timestamptz;
begin
  select u.created_at into v_created from auth.users u where u.id = v_uid;
  if v_created is null or v_created < now() - interval '14 days' then
    return jsonb_build_object('show', false);
  end if;
  return jsonb_build_object(
    'show', true,
    'group', exists (select 1 from group_members gm where gm.user_id = v_uid),
    'color', exists (select 1 from keeper_profiles k where k.user_id = v_uid and k.color_chosen),
    'checked', exists (select 1 from attendance a where a.user_id = v_uid)
            or exists (select 1 from devotion_checkins c where c.user_id = v_uid));
end;
$function$;

revoke all on function public.get_my_welcome() from public, anon;
grant execute on function public.get_my_welcome() to authenticated;
