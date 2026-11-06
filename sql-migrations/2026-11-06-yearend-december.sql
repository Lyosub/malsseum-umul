-- 한 해 마무리 말씀카드 뽑기 기간을 12/1~12/31(한국 시간)로 바꾼다(전도사님 11/6 결정, 처음엔 12/27~1/31).
-- 로그인한 사람에게 '아직 안 뽑았어요' 창을 띄우기 위한 가벼운 확인 함수를 더한다.
create or replace function public.yearend_is_open(p_year integer)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select (now() at time zone 'Asia/Seoul')::date between make_date(p_year, 12, 1) and make_date(p_year, 12, 31)
      or exists (select 1 from profiles where user_id = auth.uid() and (is_admin or is_department_head));
$$;

create or replace function public.get_my_year_pick(p_year integer)
returns jsonb
language sql
stable
security definer
set search_path to 'public'
as $$
  select jsonb_build_object(
    'open', yearend_is_open(p_year),
    'picked', exists (select 1 from yearend_draws where user_id = auth.uid() and year = p_year)
  )
  where auth.uid() is not null;
$$;
revoke all on function public.get_my_year_pick(integer) from public, anon;
grant execute on function public.get_my_year_pick(integer) to authenticated;
