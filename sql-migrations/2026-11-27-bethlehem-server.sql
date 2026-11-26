-- 성탄 방탈출 「베들레헴의 밤」 서버(2026-11-27)
-- 진행 저장 · 이어하기 코드 · 닉네임 중복 막기 · 순위(하나) · 첫 통과 알림 · 방마다 지금 몇 명 · 응원(🙏✨)
-- 실명은 브라우저에서 전도사님 공개키(RSA-OAEP)로 잠근 글자(real_enc)만 저장한다. 푸는 열쇠는 전도사님 컴퓨터에만 있다.
-- 표는 모두 잠그고(anon 직접 접근 없음) 아래 함수로만 쓴다.

create table if not exists public.bn_players (
  id uuid primary key default gen_random_uuid(),
  nick text not null check (char_length(nick) between 1 and 10),
  nick_key text not null unique,
  code_hash text not null unique,
  real_enc text not null default '' check (char_length(real_enc) <= 1000),
  state jsonb not null default '{}'::jsonb,
  ch int not null default 1,
  stamps int not null default 0,
  stars int not null default 0,
  ms bigint not null default 0,
  hint_min int not null default 0,
  cur_room text not null default '',
  finished_score int,
  finished_at timestamptz,
  last_seen timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create table if not exists public.bn_events (
  id bigserial primary key,
  kind text not null,
  room text not null default '',
  nick text not null,
  at timestamptz not null default now()
);
create unique index if not exists bn_events_first on public.bn_events (room) where kind = 'first';
create table if not exists public.bn_cheers (
  id bigserial primary key,
  player uuid not null references public.bn_players(id) on delete cascade,
  room text not null default '',
  emoji text not null check (emoji in ('🙏', '✨')),
  at timestamptz not null default now()
);
create index if not exists bn_cheers_at on public.bn_cheers (at);

alter table public.bn_players enable row level security;
alter table public.bn_events enable row level security;
alter table public.bn_cheers enable row level security;
revoke all on public.bn_players, public.bn_events, public.bn_cheers from anon, authenticated;

-- 닉네임 비교 키: 앞뒤 공백·대소문자·가운데 공백 무시
create or replace function public.bn_nick_key(p text) returns text
language sql immutable as $func$ select lower(regexp_replace(coalesce(p, ''), '\s+', '', 'g')) $func$;

create or replace function public.bn_hash(p text) returns text
language sql immutable as $func$ select encode(sha256(convert_to(upper(regexp_replace(coalesce(p, ''), '\s+', '', 'g')), 'UTF8')), 'hex') $func$;

-- 닉네임 쓸 수 있나
create or replace function public.bn_nick_free(p_nick text) returns boolean
language sql stable security definer set search_path = public as $func$
  select char_length(trim(coalesce(p_nick, ''))) between 1 and 10
     and not exists (select 1 from public.bn_players where nick_key = public.bn_nick_key(p_nick));
$func$;

-- 등록: 이어하기 코드(예: 별빛-구유-3742)를 만들어 돌려준다. 코드는 해시로만 저장.
create or replace function public.bn_register(p_nick text, p_real_enc text) returns json
language plpgsql security definer set search_path = public as $func$
declare
  w1 text[] := array['별빛','구유','목자','천사','등잔','우물','두루마리','낙타','유향','몰약','황금','성문','들판','새벽','은혜','평강'];
  w2 text[] := array['노래','기쁨','소망','빛','길','이름','편지','방울','언덕','바람','열쇠','지도','양','비둘기','종','별'];
  v_nick text := trim(coalesce(p_nick, ''));
  v_code text; v_try int := 0;
begin
  if char_length(v_nick) < 1 or char_length(v_nick) > 10 then raise exception '닉네임은 1~10자로 적어 주세요'; end if;
  if v_nick ~ '[<>]' then raise exception '닉네임에 < > 는 쓸 수 없어요'; end if;
  if exists (select 1 from public.bn_players where nick_key = public.bn_nick_key(v_nick)) then raise exception '이미 쓰는 닉네임이에요'; end if;
  loop
    v_code := w1[1 + floor(random() * 16)::int] || '-' || w2[1 + floor(random() * 16)::int] || '-' || lpad((floor(random() * 10000))::int::text, 4, '0');
    exit when not exists (select 1 from public.bn_players where code_hash = public.bn_hash(v_code));
    v_try := v_try + 1; if v_try > 20 then raise exception '잠시 뒤 다시 해 주세요'; end if;
  end loop;
  insert into public.bn_players (nick, nick_key, code_hash, real_enc) values (v_nick, public.bn_nick_key(v_nick), public.bn_hash(v_code), left(coalesce(p_real_enc, ''), 1000));
  return json_build_object('code', v_code, 'nick', v_nick);
exception when unique_violation then raise exception '이미 쓰는 닉네임이에요';
end $func$;

-- 저장: 진행 상태 통째로(20KB 이하). 다 깼으면 처음 한 번만 점수를 남긴다.
-- 점수(초) = 걸린 시간 + 힌트 분×60 − 숨은 별×60
create or replace function public.bn_save(p_code text, p_state jsonb, p_room text) returns json
language plpgsql security definer set search_path = public as $func$
declare v public.bn_players; v_stamps int; v_ms bigint; v_hint int; v_stars int; v_fin boolean;
begin
  select * into v from public.bn_players where code_hash = public.bn_hash(p_code);
  if not found then raise exception '이어하기 코드를 찾을 수 없어요'; end if;
  if octet_length(p_state::text) > 20000 then raise exception '저장 내용이 너무 커요'; end if;
  v_stamps := (select count(*) from jsonb_each(coalesce(p_state->'rooms', '{}'::jsonb)) e where coalesce(e.value->>'stamp', '') <> '');
  v_ms := greatest(0, coalesce((p_state->>'ms')::bigint, 0));
  v_hint := greatest(0, coalesce((p_state->>'hintMin')::int, 0));
  v_stars := least(7, greatest(0, coalesce(jsonb_array_length(p_state->'stars'), 0)));
  v_fin := coalesce((p_state->>'finished') is not null, false) and v_stamps >= 12;
  update public.bn_players set
    state = p_state, ch = coalesce((p_state->>'ch')::int, ch), stamps = v_stamps, stars = v_stars,
    ms = v_ms, hint_min = v_hint, cur_room = left(coalesce(p_room, ''), 20), last_seen = now(),
    finished_score = case when finished_score is null and v_fin then (v_ms / 1000)::int + v_hint * 60 - v_stars * 60 else finished_score end,
    finished_at = case when finished_at is null and v_fin then now() else finished_at end
  where id = v.id;
  return json_build_object('ok', true);
end $func$;

-- 다른 기기에서 이어 하기
create or replace function public.bn_load(p_code text) returns json
language sql stable security definer set search_path = public as $func$
  select json_build_object('nick', nick, 'state', state) from public.bn_players where code_hash = public.bn_hash(p_code);
$func$;

-- 방을 풀었을 때: 그 방을 가장 먼저 푼 사람이면 true
create or replace function public.bn_solved(p_code text, p_room text) returns boolean
language plpgsql security definer set search_path = public as $func$
declare v_nick text;
begin
  select nick into v_nick from public.bn_players where code_hash = public.bn_hash(p_code);
  if v_nick is null then return false; end if;
  insert into public.bn_events (kind, room, nick) values ('first', left(coalesce(p_room, ''), 20), v_nick) on conflict do nothing;
  return found;
end $func$;

-- 응원(🙏✨) — 한 사람당 3초에 한 번
create or replace function public.bn_cheer(p_code text, p_room text, p_emoji text) returns boolean
language plpgsql security definer set search_path = public as $func$
declare v_id uuid;
begin
  select id into v_id from public.bn_players where code_hash = public.bn_hash(p_code);
  if v_id is null or p_emoji not in ('🙏', '✨') then return false; end if;
  if exists (select 1 from public.bn_cheers where player = v_id and at > now() - interval '3 seconds') then return false; end if;
  insert into public.bn_cheers (player, room, emoji) values (v_id, left(coalesce(p_room, ''), 20), p_emoji);
  delete from public.bn_cheers where at < now() - interval '1 day';
  return true;
end $func$;

-- 지금 상황(30초마다): 방마다 지금 몇 명 · 최근 첫 통과 · 최근 응원 · 순위 20
create or replace function public.bn_live(p_since timestamptz default now() - interval '1 minute') returns json
language sql stable security definer set search_path = public as $func$
  select json_build_object(
    'now', now(),
    'rooms', coalesce((select json_object_agg(cur_room, n) from (select cur_room, count(*) n from public.bn_players where last_seen > now() - interval '2 minutes' and cur_room <> '' group by cur_room) r), '{}'::json),
    'online', (select count(*) from public.bn_players where last_seen > now() - interval '2 minutes'),
    'players', (select count(*) from public.bn_players),
    'firsts', coalesce((select json_agg(json_build_object('room', room, 'nick', nick, 'at', at) order by at) from public.bn_events where kind = 'first' and at > greatest(p_since, now() - interval '10 minutes')), '[]'::json),
    'cheers', coalesce((select json_object_agg(emoji, n) from (select emoji, count(*) n from public.bn_cheers where at > greatest(p_since, now() - interval '1 minute') group by emoji) c), '{}'::json),
    'rank', coalesce((select json_agg(json_build_object('nick', nick, 'score', finished_score, 'stars', stars, 'at', finished_at) order by finished_score, finished_at) from (select * from public.bn_players where finished_score is not null order by finished_score, finished_at limit 20) t), '[]'::json),
    'going', coalesce((select json_agg(json_build_object('nick', nick, 'stamps', stamps, 'ch', ch) order by stamps desc, ms) from (select * from public.bn_players where finished_score is null order by stamps desc, ms limit 10) g), '[]'::json)
  );
$func$;

-- 시상용: 완주자 + 잠긴 실명(전도사님 컴퓨터의 열쇠로만 풀림)
create or replace function public.bn_award_list() returns json
language sql stable security definer set search_path = public as $func$
  select coalesce(json_agg(json_build_object('nick', nick, 'score', finished_score, 'at', finished_at, 'real_enc', real_enc) order by finished_score, finished_at), '[]'::json)
  from public.bn_players where finished_score is not null;
$func$;

revoke all on function public.bn_nick_free(text), public.bn_register(text, text), public.bn_save(text, jsonb, text), public.bn_load(text), public.bn_solved(text, text), public.bn_cheer(text, text, text), public.bn_live(timestamptz), public.bn_award_list() from public;
grant execute on function public.bn_nick_free(text), public.bn_register(text, text), public.bn_save(text, jsonb, text), public.bn_load(text), public.bn_solved(text, text), public.bn_cheer(text, text, text), public.bn_live(timestamptz), public.bn_award_list() to anon, authenticated;
