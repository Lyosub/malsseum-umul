-- 비밀 마니또(임원 8명, 2026-11-29 ~ 12-27): 주차별 미션 기록
-- 학생 이름은 DB에 두지 않는다. 참가자는 코드에서 만든 토큰의 해시와 M1~M8 표시로만 구분하고,
-- 이름 대조는 manito.html 안의 암호화된 전도사님 확인용 자료로만 한다.
-- 참가자 행(manito_members)은 해시가 들어 있어 저장소에 올리지 않고 따로 넣는다.

create table if not exists public.manito_members (
  label text primary key,
  token_hash text not null unique,
  is_admin boolean not null default false
);

create table if not exists public.manito_reports (
  label text not null references public.manito_members(label) on delete cascade,
  week int not null check (week between 1 and 5),
  done boolean not null default false,
  note text not null default '' check (char_length(note) <= 500),
  updated_at timestamptz not null default now(),
  primary key (label, week)
);

alter table public.manito_members enable row level security;
alter table public.manito_reports enable row level security;
revoke all on public.manito_members, public.manito_reports from anon, authenticated;

-- 지금 열린 주차(0~5): 11/29, 12/6, 12/13, 12/20 한국 시간 0시(최종 미션은 4주 차와 함께 12/20에 미리 열림)
create or replace function public.manito_open_week() returns int
language sql stable set search_path = public as $$
  select count(*)::int from unnest(array[
    '2026-11-29 00:00+09','2026-12-06 00:00+09','2026-12-13 00:00+09','2026-12-20 00:00+09','2026-12-20 00:00+09'
  ]::timestamptz[]) t where t <= now();
$$;

create or replace function public.manito_who(p_token text, p_admin boolean) returns text
language sql stable security definer set search_path = public as $$
  select label from public.manito_members
   where token_hash = encode(sha256(convert_to(coalesce(p_token, ''), 'UTF8')), 'hex')
     and is_admin = p_admin;
$$;
revoke all on function public.manito_who(text, boolean) from public, anon, authenticated;

create or replace function public.manito_save(p_token text, p_week int, p_done boolean, p_note text)
returns void language plpgsql security definer set search_path = public as $$
declare v text := public.manito_who(p_token, false);
begin
  if v is null then raise exception 'bad token'; end if;
  if p_week is null or p_week < 1 or p_week > public.manito_open_week() then raise exception 'not open'; end if;
  insert into public.manito_reports(label, week, done, note, updated_at)
  values (v, p_week, coalesce(p_done, false), left(coalesce(p_note, ''), 500), now())
  on conflict (label, week) do update set done = excluded.done, note = excluded.note, updated_at = now();
end $$;

create or replace function public.manito_mine(p_token text)
returns table(week int, done boolean, note text, updated_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
declare v text := public.manito_who(p_token, false);
begin
  if v is null then raise exception 'bad token'; end if;
  return query select r.week, r.done, r.note, r.updated_at from public.manito_reports r where r.label = v order by r.week;
end $$;

create or replace function public.manito_all(p_token text)
returns table(label text, week int, done boolean, note text, updated_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  if public.manito_who(p_token, true) is null then raise exception 'bad token'; end if;
  return query select r.label, r.week, r.done, r.note, r.updated_at from public.manito_reports r order by r.label, r.week;
end $$;

grant execute on function public.manito_save(text, int, boolean, text), public.manito_mine(text), public.manito_all(text) to anon, authenticated;
