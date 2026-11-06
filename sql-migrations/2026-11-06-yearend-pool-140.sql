-- 새해 말씀카드 뽑기 말씀을 43개에서 140개로 늘린다(성경 전체에서 새해와 맞는 말씀, 전도사님 11/6). assets/yearend-data.js와 개수를 맞춘다.
create or replace function public.draw_year_verse(p_year integer)
returns jsonb
language plpgsql
volatile
security definer
set search_path to 'public'
as $$
declare
  uid uuid := auth.uid();
  v_n constant integer := 140;  -- YEAREND_VERSES 개수
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
