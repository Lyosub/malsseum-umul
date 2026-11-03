-- 우물지기 키우기: 경험치는 활동 기록(points_ledger)에서 그때그때 계산한다. 달란트와 별개이며 줄어들지 않는다.
-- 출석 10, 묵상 20, 외우기 15, 기록(인사·감사·기도·실천) 하루 합쳐 15, 말씀 게임 하나 5(하루 합계 10), In Odyssey 편 완료 20.
-- 관리자 지급, 뱃지 보상은 넣지 않는다. 레벨 순위표를 만들지 않으므로 본인 값만 돌려준다.
create table if not exists public.keeper_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  char_type text not null default 'well',
  color text not null default 'blue' check (color in ('blue', 'green', 'purple', 'pink', 'teal', 'yellow')),
  updated_at timestamptz not null default now()
);
alter table public.keeper_profiles enable row level security;
drop policy if exists keeper_profiles_read_own on public.keeper_profiles;
create policy keeper_profiles_read_own on public.keeper_profiles for select using (auth.uid() = user_id);

create or replace function public.keeper_xp_of(p_user uuid)
returns integer
language sql
stable
security definer
set search_path to 'public'
as $$
  with days as (
    select ref_date,
      count(*) filter (where action_type = 'attendance') as attend,
      count(*) filter (where action_type = 'devotion') as devotion,
      count(*) filter (where action_type = 'verse_memory') as memorize,
      count(*) filter (where action_type in ('note', 'qt_reflection')) as records,
      count(*) filter (where action_type in ('quiz', 'book_game', 'book_game_ot', 'book_game_nt', 'match_game_books', 'match_game_figures', 'chosung_quiz', 'ox_quiz')) as games,
      count(*) filter (where action_type = 'odyssey_chapter') as chapters
    from points_ledger
    where user_id = p_user and points > 0
    group by ref_date
  )
  select coalesce(sum(
    least(attend, 1) * 10 + least(devotion, 1) * 20 + least(memorize, 1) * 15 +
    least(records, 1) * 15 + least(games * 5, 10) + chapters * 20
  ), 0)::integer
  from days;
$$;
revoke all on function public.keeper_xp_of(uuid) from public, anon, authenticated;

-- 레벨 곡선: 누적 경험치 = 38.5 x 레벨^1.5. 매일 꾸준히(하루 약 70) 약 1년에 레벨 75.
create or replace function public.keeper_level_of(p_xp integer)
returns integer language sql immutable as $$
  select floor(power(greatest(p_xp, 0) / 38.5, 2.0 / 3.0) + 1e-9)::integer;
$$;

create or replace function public.get_my_keeper()
returns table(xp integer, level integer, stage integer, level_xp integer, next_xp integer, char_type text, color text)
language plpgsql
stable
security definer
set search_path to 'public'
as $$
declare
  uid uuid := auth.uid();
  v_xp integer;
  v_lv integer;
begin
  if uid is null then
    raise exception 'login required';
  end if;
  v_xp := keeper_xp_of(uid);
  v_lv := keeper_level_of(v_xp);
  return query select
    v_xp,
    v_lv,
    case when v_lv < 5 then 0 when v_lv < 15 then 1 when v_lv < 30 then 2 when v_lv < 50 then 3 when v_lv < 75 then 4 else 5 end,
    ceil(38.5 * power(v_lv, 1.5))::integer,
    ceil(38.5 * power(v_lv + 1, 1.5))::integer,
    coalesce((select k.char_type from keeper_profiles k where k.user_id = uid), 'well'),
    coalesce((select k.color from keeper_profiles k where k.user_id = uid), 'blue');
end;
$$;
revoke all on function public.get_my_keeper() from public, anon;
grant execute on function public.get_my_keeper() to authenticated;

create or replace function public.set_my_keeper_color(p_color text)
returns text
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'login required';
  end if;
  if p_color not in ('blue', 'green', 'purple', 'pink', 'teal', 'yellow') then
    raise exception 'unknown color';
  end if;
  insert into keeper_profiles (user_id, color) values (uid, p_color)
  on conflict (user_id) do update set color = excluded.color, updated_at = now();
  return p_color;
end;
$$;
revoke all on function public.set_my_keeper_color(text) from public, anon;
grant execute on function public.set_my_keeper_color(text) to authenticated;
