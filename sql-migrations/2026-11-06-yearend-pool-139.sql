-- 호세아 6:3을 빼고 139개로(전도사님 11/6, 6:4 때문에 해석이 갈림). 이미 뽑은 시험 기록 번호도 맞춘다.
create or replace function public.draw_year_verse(p_year integer)
returns jsonb
language plpgsql
volatile
security definer
set search_path to 'public'
as $$
declare
  uid uuid := auth.uid();
  v_n constant integer := 139;  -- YEAREND_VERSES 개수
  v_pick integer;
begin
  if uid is null then
    raise exception 'login required';
  end if;
  if p_year is distinct from 2026 then
    return jsonb_build_object('ok', false, 'reason', 'year');
  end if;
  select pick into v_pick from yearend_draws where user_id = uid and year = p_year;
  if v_pick is not null then
    return jsonb_build_object('ok', true, 'pick', v_pick, 'again', true);
  end if;
  if not yearend_is_open(p_year) then
    return jsonb_build_object('ok', false, 'reason', 'closed');
  end if;
  insert into yearend_draws (user_id, year, pick)
  values (uid, p_year, floor(random() * v_n)::integer)
  on conflict (user_id, year) do nothing;
  select pick into v_pick from yearend_draws where user_id = uid and year = p_year;
  return jsonb_build_object('ok', true, 'pick', v_pick, 'again', false);
end;
$$;

-- 100번(호세아 6:3)을 뽑은 기록은 지우고, 그 뒤 번호는 하나씩 당긴다.
delete from public.yearend_draws where year = 2026 and pick = 100;
update public.yearend_draws set pick = pick - 1 where year = 2026 and pick > 100;
