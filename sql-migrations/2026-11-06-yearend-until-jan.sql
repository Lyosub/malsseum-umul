-- 새해 말씀카드 뽑기 기간을 12/1~다음 해 1/31(한국 시간)로 늘린다(전도사님 11/6). 기간이 끝나도 이미 뽑은 말씀은 get_my_year_review의 pick으로 계속 볼 수 있다.
create or replace function public.yearend_is_open(p_year integer)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select (now() at time zone 'Asia/Seoul')::date between make_date(p_year, 12, 1) and make_date(p_year + 1, 1, 31)
      or exists (select 1 from profiles where user_id = auth.uid() and (is_admin or is_department_head));
$$;
