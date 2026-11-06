-- 2026 한 해를 마무리하며 말씀카드 뽑기(yearend.html).
-- 한 사람이 한 해에 한 장만 뽑는다. 뽑는 번호는 서버가 정하고 저장해, 다시 열어도 같은 말씀이 나온다.
-- 말씀 목록은 assets/yearend-data.js(YEAREND_VERSES, 43개). 순서를 바꾸면 이미 뽑은 사람의 말씀이 바뀌므로 뒤에만 덧붙인다.
-- 열리는 기간: 그해 12/27(한국 시간)부터 다음 해 1/31까지. 관리자·부장은 미리 시험할 수 있다.
create table if not exists public.yearend_draws (
  user_id uuid not null references auth.users(id) on delete cascade,
  year integer not null,
  pick integer not null,
  drawn_at timestamptz not null default now(),
  primary key (user_id, year)
);
alter table public.yearend_draws enable row level security;
-- 정책 없음: 아래 함수로만 읽고 쓴다.

create or replace function public.yearend_is_open(p_year integer)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select (now() at time zone 'Asia/Seoul')::date between make_date(p_year, 12, 27) and make_date(p_year + 1, 1, 31)
      or exists (select 1 from profiles where user_id = auth.uid() and (is_admin or is_department_head));
$$;
revoke all on function public.yearend_is_open(integer) from public, anon;
grant execute on function public.yearend_is_open(integer) to authenticated;

-- 나의 한 해 돌아보기. 본인 값만 돌려준다.
create or replace function public.get_my_year_review(p_year integer)
returns jsonb
language plpgsql
stable
security definer
set search_path to 'public'
as $$
declare
  uid uuid := auth.uid();
  d0 date := make_date(p_year, 1, 1);
  d1 date := make_date(p_year, 12, 31);
  r jsonb;
begin
  if uid is null then
    raise exception 'login required';
  end if;
  select jsonb_build_object(
    'ok', true,
    'open', yearend_is_open(p_year),
    'nickname', (select nickname from profiles where user_id = uid),
    'joined', (select (created_at at time zone 'Asia/Seoul')::date from profiles where user_id = uid),
    'attend', (select count(distinct date) from attendance where user_id = uid and date between d0 and d1),
    'best_streak', (select coalesce(max(n), 0) from (
        select count(*) n from (
          select date, date - (row_number() over (order by date))::integer g
          from (select distinct date from attendance where user_id = uid and date between d0 and d1) a
        ) s group by g) t),
    'devotion', (select count(distinct date) from devotion_checkins where user_id = uid and date between d0 and d1),
    'gratitude', (select count(*) from notes where user_id = uid and type = 'gratitude' and (created_at at time zone 'Asia/Seoul')::date between d0 and d1),
    'prayer', (select count(*) from notes where user_id = uid and type = 'prayer' and (created_at at time zone 'Asia/Seoul')::date between d0 and d1),
    'memorize', (select count(distinct played_on) from verse_memory_daily where user_id = uid and played_on between d0 and d1),
    'lines', (select count(*) from sermon_lines where user_id = uid and service_date between d0 and d1),
    'odyssey', (select coalesce(max(chapters), 0) from odyssey_progress where user_id = uid),
    'level', keeper_level_of(keeper_xp_of(uid)),
    'pick', (select pick from yearend_draws where user_id = uid and year = p_year)
  ) into r;
  return r;
end;
$$;
revoke all on function public.get_my_year_review(integer) from public, anon;
grant execute on function public.get_my_year_review(integer) to authenticated;

-- 카드 한 장 뽑기. 이미 뽑았으면 그 번호를 그대로 돌려준다.
create or replace function public.draw_year_verse(p_year integer)
returns jsonb
language plpgsql
volatile
security definer
set search_path to 'public'
as $$
declare
  uid uuid := auth.uid();
  v_n constant integer := 43;  -- YEAREND_VERSES 개수
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
revoke all on function public.draw_year_verse(integer) from public, anon;
grant execute on function public.draw_year_verse(integer) to authenticated;

-- 관리자 시험용: 내 뽑기 기록 지우기(다시 뽑아 보기). 관리자·부장만.
create or replace function public.reset_my_year_draw(p_year integer)
returns jsonb
language plpgsql
volatile
security definer
set search_path to 'public'
as $$
begin
  if not exists (select 1 from profiles where user_id = auth.uid() and (is_admin or is_department_head)) then
    return jsonb_build_object('ok', false);
  end if;
  delete from yearend_draws where user_id = auth.uid() and year = p_year;
  return jsonb_build_object('ok', true);
end;
$$;
revoke all on function public.reset_my_year_draw(integer) from public, anon;
grant execute on function public.reset_my_year_draw(integer) to authenticated;
