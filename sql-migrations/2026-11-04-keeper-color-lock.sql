-- 우물지기 색 고정: 처음 한 번 고르면 바꿀 수 없다. 관리자만 예외다.
-- 이전에 고른 색은 인정하지 않고 모두 새로 고른다(color_chosen 기본값 false). 경험치와 레벨은 그대로다.
alter table public.keeper_profiles add column if not exists color_chosen boolean not null default false;

drop function if exists public.get_my_keeper();
create function public.get_my_keeper()
returns table(xp integer, level integer, stage integer, level_xp integer, next_xp integer, char_type text, color text, color_chosen boolean, can_change boolean)
language plpgsql
stable
security definer
set search_path to 'public'
as $$
declare
  uid uuid := auth.uid();
  v_xp integer;
  v_lv integer;
  v_admin boolean;
begin
  if uid is null then
    raise exception 'login required';
  end if;
  v_xp := keeper_xp_of(uid);
  v_lv := keeper_level_of(v_xp);
  select coalesce(p.is_admin, false) into v_admin from profiles p where p.user_id = uid;
  return query select
    v_xp,
    v_lv,
    case when v_lv < 5 then 0 when v_lv < 15 then 1 when v_lv < 30 then 2 when v_lv < 50 then 3 when v_lv < 75 then 4 else 5 end,
    ceil(38.5 * power(v_lv, 1.5))::integer,
    ceil(38.5 * power(v_lv + 1, 1.5))::integer,
    coalesce((select k.char_type from keeper_profiles k where k.user_id = uid), 'well'),
    coalesce((select k.color from keeper_profiles k where k.user_id = uid), 'blue'),
    coalesce((select k.color_chosen from keeper_profiles k where k.user_id = uid), false),
    coalesce(v_admin, false);
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
  v_chosen boolean;
  v_admin boolean;
begin
  if uid is null then
    raise exception 'login required';
  end if;
  if p_color not in ('blue', 'green', 'purple', 'pink', 'teal', 'yellow') then
    raise exception 'unknown color';
  end if;
  select k.color_chosen into v_chosen from keeper_profiles k where k.user_id = uid;
  select coalesce(p.is_admin, false) into v_admin from profiles p where p.user_id = uid;
  if coalesce(v_chosen, false) and not coalesce(v_admin, false) then
    raise exception 'color locked';
  end if;
  insert into keeper_profiles (user_id, color, color_chosen) values (uid, p_color, true)
  on conflict (user_id) do update set color = excluded.color, color_chosen = true, updated_at = now();
  return p_color;
end;
$$;
revoke all on function public.set_my_keeper_color(text) from public, anon;
grant execute on function public.set_my_keeper_color(text) to authenticated;
