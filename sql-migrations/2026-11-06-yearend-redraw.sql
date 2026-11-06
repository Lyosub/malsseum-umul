-- 새해 말씀카드 「다시 뽑기」(전도사님 11/6): 뽑은 뒤에도 기간 안에는 다시 뽑을 수 있다. 지금 말씀과 다른 말씀이 나온다.
create or replace function public.redraw_year_verse(p_year integer)
returns jsonb
language plpgsql
volatile
security definer
set search_path to 'public'
as $$
declare
  uid uuid := auth.uid();
  v_n constant integer := 139;  -- YEAREND_VERSES 개수(draw_year_verse와 같게)
  v_old integer;
  v_new integer;
begin
  if uid is null then
    raise exception 'login required';
  end if;
  if p_year is distinct from 2026 then
    return jsonb_build_object('ok', false, 'reason', 'year');
  end if;
  if not yearend_is_open(p_year) then
    return jsonb_build_object('ok', false, 'reason', 'closed');
  end if;
  select pick into v_old from yearend_draws where user_id = uid and year = p_year;
  v_new := floor(random() * (v_n - 1))::integer;
  if v_old is not null and v_new >= v_old then
    v_new := v_new + 1;  -- 지금 말씀은 건너뛴다
  end if;
  insert into yearend_draws (user_id, year, pick) values (uid, p_year, v_new)
  on conflict (user_id, year) do update set pick = excluded.pick, drawn_at = now();
  return jsonb_build_object('ok', true, 'pick', v_new);
end;
$$;
revoke all on function public.redraw_year_verse(integer) from public, anon;
grant execute on function public.redraw_year_verse(integer) to authenticated;
