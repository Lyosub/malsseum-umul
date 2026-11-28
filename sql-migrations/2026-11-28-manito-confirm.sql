-- 비밀 마니또: 클리어는 전도사님만 정한다(2026-11-28 전도사님 요청).
-- 학생 저장(manito_save)은 기록(note)만 바꾸고 클리어(done)는 건드리지 않는다.
-- 전도사님 확인 화면에서 주차 동그라미를 누르면 manito_confirm 으로 클리어를 켜고 끈다.

create or replace function public.manito_save(p_token text, p_week int, p_done boolean, p_note text)
returns void language plpgsql security definer set search_path = public as $$
declare v text := public.manito_who(p_token, false);
begin
  if v is null then raise exception 'bad token'; end if;
  if p_week is null or p_week < 1 or p_week > public.manito_open_week() then raise exception 'not open'; end if;
  insert into public.manito_reports(label, week, done, note, updated_at)
  values (v, p_week, false, left(coalesce(p_note, ''), 500), now())
  on conflict (label, week) do update set note = excluded.note, updated_at = now();
end $$;

create or replace function public.manito_confirm(p_token text, p_label text, p_week int, p_done boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if public.manito_who(p_token, true) is null then raise exception 'bad token'; end if;
  if p_week is null or p_week < 1 or p_week > 5 then raise exception 'bad week'; end if;
  if not exists (select 1 from public.manito_members where label = p_label and not is_admin) then raise exception 'bad label'; end if;
  insert into public.manito_reports(label, week, done, note, updated_at)
  values (p_label, p_week, coalesce(p_done, false), '', now())
  on conflict (label, week) do update set done = coalesce(p_done, false);
end $$;

revoke all on function public.manito_confirm(text, text, int, boolean) from public;
grant execute on function public.manito_confirm(text, text, int, boolean) to anon, authenticated;

-- 매일 하는 미션(「한 주 동안 매일 기도하기」): 그 주 7일 하루씩 기록(11/28 전도사님 요청).
-- 오늘(한국 시간)까지 지난 날만, 열린 주차만 저장된다.
create table if not exists public.manito_daily (
  label text not null references public.manito_members(label) on delete cascade,
  week int not null check (week between 1 and 5),
  day date not null,
  note text not null default '' check (char_length(note) <= 300),
  updated_at timestamptz not null default now(),
  primary key (label, week, day)
);
alter table public.manito_daily enable row level security;
revoke all on public.manito_daily from anon, authenticated;

create or replace function public.manito_day_save(p_token text, p_week int, p_day date, p_note text)
returns void language plpgsql security definer set search_path = public as $$
declare v text := public.manito_who(p_token, false);
begin
  if v is null then raise exception 'bad token'; end if;
  if p_week is null or p_week < 1 or p_week > public.manito_open_week() then raise exception 'not open'; end if;
  if p_day is null or p_day < date '2026-11-29' or p_day > date '2026-12-27' then raise exception 'bad day'; end if;
  if p_day > (now() at time zone 'Asia/Seoul')::date then raise exception 'not yet'; end if;
  insert into public.manito_daily(label, week, day, note, updated_at)
  values (v, p_week, p_day, left(coalesce(p_note, ''), 300), now())
  on conflict (label, week, day) do update set note = excluded.note, updated_at = now();
end $$;

create or replace function public.manito_day_mine(p_token text)
returns table(week int, day date, note text, updated_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
declare v text := public.manito_who(p_token, false);
begin
  if v is null then raise exception 'bad token'; end if;
  return query select x.week, x.day, x.note, x.updated_at from public.manito_daily x where x.label = v order by x.week, x.day;
end $$;

create or replace function public.manito_day_all(p_token text)
returns table(label text, week int, day date, note text, updated_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  if public.manito_who(p_token, true) is null then raise exception 'bad token'; end if;
  return query select x.label, x.week, x.day, x.note, x.updated_at from public.manito_daily x order by x.label, x.week, x.day;
end $$;

revoke all on function public.manito_day_save(text, int, date, text), public.manito_day_mine(text), public.manito_day_all(text) from public;
grant execute on function public.manito_day_save(text, int, date, text), public.manito_day_mine(text), public.manito_day_all(text) to anon, authenticated;
