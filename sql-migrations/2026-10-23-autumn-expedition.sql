-- 가을 원정대 (2026-10-23): 11/8 중등부 가을 야유회(서울대공원) 미션 페이지.
-- 팀마다 코드 하나를 받고, 팀원 모두가 자기 휴대폰으로 들어와(코드 → 명단에서 내 이름) 함께 미션을 한다.
--   ② 성경 동물 도감 10문제: 동물 맞히기(자동 채점 1점) · 그 동물 앞 단체 사진(교사 승인 2점) · 말씀 쓰기(개역개정과 같으면 자동 2점, 다르면 검토)
--   ③ 사진 보물찾기 8곳: 「똑같이 찍기」 사진(승인 5점, 13:30 이후 힌트를 받은 장소는 3점)
--   ① 히든 미션 2개: 11:40에 자동으로 열림. 말씀 조각 단체 사진 · 다섯 빛깔 단풍잎 사진(승인 각 10점)
-- 모든 팀의 진행 개수는 서로 보이고, 점수와 순위는 관리 화면에서 「결과 공개」를 누를 때만 보인다.
-- 관리 화면(expedition-admin.html)은 행사마다 정한 관리 코드로만 쓸 수 있다.
--
-- * 새 표 5개, 새 함수 5개, 저장소 버킷 1개만 추가한다. 기존 표·함수는 건드리지 않는다. 재실행해도 안전.
-- * 모든 표는 RLS를 켜고 정책을 두지 않는다 → 익명 사용자는 표를 직접 읽거나 쓸 수 없고, 아래 함수로만 접근한다.
-- * 정답(동물·구절)은 picnic_answers에만 있고 학생 화면으로 내려가지 않는다.
-- * 행사 만들기와 관리 코드는 이 파일에 적지 않는다(저장소에 코드가 남지 않게). 예:
--   insert into public.picnic_events(event, admin_code) values ('autumn2026', '<관리 코드>');
-- * 사진은 버킷 picnic-photos(공개 읽기, 목록 조회 불가, 경로는 추측 불가능한 무작위 이름)에 올린다.
--   행사 뒤에는 남길 사진만 내려받고 버킷을 비운다.

create table if not exists public.picnic_events (
  event            text primary key,
  admin_code       text not null,
  title            text not null default '가을 원정대',
  hidden_open_at   timestamptz not null default '2026-11-08 11:40:00+09',
  hint_unlock_at   timestamptz not null default '2026-11-08 13:30:00+09',
  hidden_force     boolean not null default false,       -- 관리 화면 「지금 열기」
  results_open     boolean not null default false,       -- 관리 화면 「결과 공개」
  card_clues       jsonb not null default '[]'::jsonb,   -- [{"at":"2026-11-08T12:00:00+09:00","text":"..."}]
  place_hints      jsonb not null default '{}'::jsonb,   -- {"1":"힌트", ...}
  meet_place       text not null default '',             -- 말씀 조각 단체 사진 지정 장소
  updated_at       timestamptz not null default now()
);

create table if not exists public.picnic_teams (
  id        serial primary key,
  event     text not null references public.picnic_events(event) on delete cascade,
  name      text not null,
  emoji     text not null default '🍁',
  code      text not null unique,
  penalty   int  not null default 0,
  bonus     int  not null default 0,
  sort      int  not null default 0
);

create table if not exists public.picnic_members (
  id        serial primary key,
  team_id   int not null references public.picnic_teams(id) on delete cascade,
  name      text not null,
  sort      int not null default 0
);

create table if not exists public.picnic_answers (
  q        int primary key,
  ref      text not null,
  animals  text[] not null,
  verse    text not null
);

create table if not exists public.picnic_subs (
  id          bigserial primary key,
  team_id     int not null references public.picnic_teams(id) on delete cascade,
  member_id   int references public.picnic_members(id) on delete set null,
  kind        text not null,             -- animal | animal_photo | verse | place | hint | hidden1 | hidden2 | hidden3(팀 릴스 영상)
  q           int  not null default 0,
  text_val    text,
  photo_url   text,
  status      text not null,             -- ok | wrong | pending | rejected
  points      int  not null default 0,
  created_at  timestamptz not null default now(),
  reviewed_at timestamptz
);
-- 돌려보낸 이유(2026-10-23 추가)
alter table public.picnic_subs add column if not exists note text;
create index if not exists picnic_subs_team on public.picnic_subs(team_id, kind, q);
create index if not exists picnic_subs_status on public.picnic_subs(status, created_at);

alter table public.picnic_events  enable row level security;
alter table public.picnic_teams   enable row level security;
alter table public.picnic_members enable row level security;
alter table public.picnic_answers enable row level security;
alter table public.picnic_subs    enable row level security;
revoke all on public.picnic_events, public.picnic_teams, public.picnic_members, public.picnic_answers, public.picnic_subs from anon, authenticated;

-- 정답 (개역개정, bskorea 대조 2026-10-23) --------------------------------------
insert into public.picnic_answers(q, ref, animals, verse) values
 (1,  '잠언 28:1',      array['사자'], '악인은 쫓아오는 자가 없어도 도망하나 의인은 사자 같이 담대하니라'),
 (2,  '사무엘상 17:34', array['곰','사자'], '다윗이 사울에게 말하되 주의 종이 아버지의 양을 지킬 때에 사자나 곰이 와서 양 떼에서 새끼를 물어가면'),
 (3,  '예레미야 13:23', array['표범'], '구스인이 그의 피부를, 표범이 그의 반점을 변하게 할 수 있느냐 할 수 있을진대 악에 익숙한 너희도 선을 행할 수 있으리라'),
 (4,  '이사야 11:6',    array['이리','늑대','양','어린양','염소','어린염소','송아지','표범','사자'], '그 때에 이리가 어린 양과 함께 살며 표범이 어린 염소와 함께 누우며 송아지와 어린 사자와 살진 짐승이 함께 있어 어린 아이에게 끌리며'),
 (5,  '이사야 40:31',   array['독수리'], '오직 여호와를 앙망하는 자는 새 힘을 얻으리니 독수리가 날개치며 올라감 같을 것이요 달음박질하여도 곤비하지 아니하겠고 걸어가도 피곤하지 아니하리로다'),
 (6,  '하박국 3:19',    array['사슴'], '주 여호와는 나의 힘이시라 나의 발을 사슴과 같게 하사 나를 나의 높은 곳으로 다니게 하시리로다 이 노래는 지휘하는 사람을 위하여 내 수금에 맞춘 것이니라'),
 (7,  '마태복음 19:24', array['낙타'], '다시 너희에게 말하노니 낙타가 바늘귀로 들어가는 것이 부자가 하나님의 나라에 들어가는 것보다 쉬우니라 하시니'),
 (8,  '욥기 39:19',     array['말','얼룩말'], '말의 힘을 네가 주었느냐 그 목에 흩날리는 갈기를 네가 입혔느냐'),
 (9,  '열왕기상 10:22', array['원숭이','공작','공작새'], '왕이 바다에 다시스 배들을 두어 히람의 배와 함께 있게 하고 그 다시스 배로 삼 년에 한 번씩 금과 은과 상아와 원숭이와 공작을 실어 왔음이더라'),
 (10, '예레미야 8:7',   array['학','두루미','산비둘기','비둘기','제비'], '공중의 학은 그 정한 시기를 알고 산비둘기와 제비와 두루미는 그들이 올 때를 지키거늘 내 백성은 여호와의 규례를 알지 못하도다')
on conflict (q) do update set ref = excluded.ref, animals = excluded.animals, verse = excluded.verse;

-- 공용: 글자만 남기기(띄어쓰기·문장부호 무시) --------------------------------------
create or replace function public.picnic_norm(t text) returns text
language sql immutable
set search_path = public
as $$ select regexp_replace(coalesce(t, ''), '[^가-힣0-9A-Za-z]', '', 'g') $$;

-- 공용: 팀 점수 (같은 항목은 가장 높은 점수 하나만) --------------------------------
create or replace function public.picnic_team_score(p_team int) returns int
language sql stable
set search_path = public
as $$
  select coalesce((
    select sum(best) from (
      select max(points) as best from public.picnic_subs
      where team_id = p_team and status = 'ok' and kind <> 'hint'
      group by kind, q
    ) s), 0)
  + (select bonus - penalty from public.picnic_teams where id = p_team)
$$;

-- 공용: 모든 팀 진행판 ------------------------------------------------------------
create or replace function public.picnic_board(p_event text) returns jsonb
language sql stable
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', t.id, 'name', t.name, 'emoji', t.emoji,
    'dogam', (select count(distinct (s.kind, s.q)) from public.picnic_subs s
              where s.team_id = t.id and s.kind in ('animal','animal_photo','verse') and s.status in ('ok','pending')),
    'place', (select count(distinct s.q) from public.picnic_subs s
              where s.team_id = t.id and s.kind = 'place' and s.status in ('ok','pending')),
    'hidden', (select count(distinct s.kind) from public.picnic_subs s
               where s.team_id = t.id and s.kind in ('hidden1','hidden2','hidden3') and s.status in ('ok','pending')),
    'score', case when e.results_open then public.picnic_team_score(t.id) end
  ) order by t.sort, t.id), '[]'::jsonb)
  from public.picnic_teams t join public.picnic_events e on e.event = t.event
  where t.event = p_event
$$;

-- 1) 입장: 코드 → 팀과 명단 --------------------------------------------------------
create or replace function public.picnic_join(p_code text) returns jsonb
language sql stable
security definer
set search_path = public
as $$
  select coalesce((
    select jsonb_build_object('ok', true,
      'team', jsonb_build_object('id', t.id, 'name', t.name, 'emoji', t.emoji, 'event', t.event),
      'members', coalesce((select jsonb_agg(jsonb_build_object('id', m.id, 'name', m.name) order by m.sort, m.name)
                           from public.picnic_members m where m.team_id = t.id), '[]'::jsonb))
    from public.picnic_teams t where t.code = upper(btrim(coalesce(p_code, '')))
  ), jsonb_build_object('ok', false, 'error', '팀 코드를 다시 확인해 주세요.'))
$$;

-- 2) 우리 팀 화면 --------------------------------------------------------------------
create or replace function public.picnic_state(p_code text) returns jsonb
language plpgsql stable
security definer
set search_path = public
as $$
declare
  t public.picnic_teams;
  e public.picnic_events;
  v_open boolean;
begin
  select * into t from public.picnic_teams where code = upper(btrim(coalesce(p_code, '')));
  if not found then
    return jsonb_build_object('ok', false, 'error', '팀 코드를 다시 확인해 주세요.');
  end if;
  select * into e from public.picnic_events where event = t.event;
  v_open := e.hidden_force or now() >= e.hidden_open_at;

  return jsonb_build_object(
    'ok', true,
    'now', now(),
    'team', jsonb_build_object('id', t.id, 'name', t.name, 'emoji', t.emoji),
    'hidden_open', v_open,
    'hidden_open_at', e.hidden_open_at,
    'hint_unlock', now() >= e.hint_unlock_at,
    'hint_unlock_at', e.hint_unlock_at,
    'meet_place', case when v_open then e.meet_place else '' end,
    'clues', case when v_open then coalesce((
               select jsonb_agg(c order by c->>'at') from jsonb_array_elements(e.card_clues) c
               where (c->>'at')::timestamptz <= now()), '[]'::jsonb)
             else '[]'::jsonb end,
    'refs', (select jsonb_agg(jsonb_build_object('q', a.q, 'ref', a.ref) order by a.q) from public.picnic_answers a),
    'subs', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', s.id, 'kind', s.kind, 'q', s.q, 'status', s.status, 'points', s.points,
        'text', case when s.kind in ('animal','verse') then s.text_val end,
        'photo', s.photo_url, 'who', m.name, 'at', s.created_at, 'note', s.note) order by s.created_at)
      from public.picnic_subs s left join public.picnic_members m on m.id = s.member_id
      where s.team_id = t.id), '[]'::jsonb),
    'hints', coalesce((
      select jsonb_object_agg(s.q::text, coalesce(e.place_hints->>(s.q::text), '선생님께 여쭤보세요!'))
      from (select distinct q from public.picnic_subs where team_id = t.id and kind = 'hint') s), '{}'::jsonb),
    'board', public.picnic_board(t.event),
    'results_open', e.results_open,
    'my_score', case when e.results_open then public.picnic_team_score(t.id) end
  );
end;
$$;

-- 3) 제출 --------------------------------------------------------------------------
-- 두 글자열이 몇 글자 다른지(편집 거리). 말씀은 길어야 100자 안팎이라 가볍다.
create or replace function public.picnic_editdist(x text, y text) returns int
language plpgsql immutable
set search_path = public
as $$
declare
  n int := char_length(x); m int := char_length(y);
  prev int[]; cur int[]; i int; j int; c int;
begin
  if n = 0 then return m; end if;
  if m = 0 then return n; end if;
  prev := array(select generate_series(0, m));
  for i in 1..n loop
    cur := array[i];
    for j in 1..m loop
      c := case when substr(x, i, 1) = substr(y, j, 1) then 0 else 1 end;
      cur := cur || least(prev[j + 1] + 1, cur[j] + 1, prev[j] + c);
    end loop;
    prev := cur;
  end loop;
  return prev[m + 1];
end;
$$;

create or replace function public.picnic_submit(p_code text, p_member int, p_kind text, p_q int, p_text text, p_photo text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  t public.picnic_teams;
  e public.picnic_events;
  a public.picnic_answers;
  v_in text;
  v_ok boolean := false;
  w text;
  v_status text;
  v_points int := 0;
  v_diff int;
  v_prefix text := 'https://qaxwxbaqduxqzjqoahcb.supabase.co/storage/v1/object/public/picnic-photos/';
begin
  select * into t from public.picnic_teams where code = upper(btrim(coalesce(p_code, '')));
  if not found then return jsonb_build_object('ok', false, 'error', '팀 코드를 다시 확인해 주세요.'); end if;
  if not exists (select 1 from public.picnic_members where id = p_member and team_id = t.id) then
    return jsonb_build_object('ok', false, 'error', '내 이름을 다시 골라 주세요.');
  end if;
  select * into e from public.picnic_events where event = t.event;
  if e.results_open then return jsonb_build_object('ok', false, 'error', '미션이 끝났어요. 결과를 확인해 보세요!'); end if;
  if exists (select 1 from public.picnic_subs where team_id = t.id and member_id = p_member and created_at > now() - interval '3 seconds') then
    return jsonb_build_object('ok', false, 'error', '잠깐만요! 3초 뒤에 다시 눌러 주세요.');
  end if;

  if p_kind in ('animal', 'verse', 'animal_photo') then
    select * into a from public.picnic_answers where q = p_q;
    if not found then return jsonb_build_object('ok', false, 'error', '없는 문제예요.'); end if;
  elsif p_kind = 'place' then
    if p_q < 1 or p_q > 8 then return jsonb_build_object('ok', false, 'error', '없는 장소예요.'); end if;
  elsif p_kind in ('hidden1', 'hidden2', 'hidden3') then
    if not (e.hidden_force or now() >= e.hidden_open_at) then
      return jsonb_build_object('ok', false, 'error', '히든 미션은 아직 열리지 않았어요.');
    end if;
    p_q := 0;
  else
    return jsonb_build_object('ok', false, 'error', '알 수 없는 미션이에요.');
  end if;

  -- 이미 통과한 항목은 다시 받지 않는다
  if exists (select 1 from public.picnic_subs where team_id = t.id and kind = p_kind and q = p_q and status = 'ok') then
    return jsonb_build_object('ok', false, 'error', '이미 통과한 미션이에요!');
  end if;

  if p_kind = 'animal' then
    v_in := public.picnic_norm(p_text);
    if char_length(v_in) < 1 or char_length(v_in) > 20 then
      return jsonb_build_object('ok', false, 'error', '동물 이름을 적어 주세요.');
    end if;
    if (select count(*) from public.picnic_subs where team_id = t.id and kind = 'animal' and q = p_q and created_at > now() - interval '1 minute') >= 5 then
      return jsonb_build_object('ok', false, 'error', '1분에 5번까지만 도전할 수 있어요. 구절을 다시 읽어 보세요!');
    end if;
    foreach w in array a.animals loop
      if v_in = w or (position(w in v_in) > 0 and char_length(v_in) <= char_length(w) + 2) then v_ok := true; end if;
    end loop;
    v_status := case when v_ok then 'ok' else 'wrong' end;
    v_points := case when v_ok then 1 else 0 end;
    insert into public.picnic_subs(team_id, member_id, kind, q, text_val, status, points)
    values (t.id, p_member, 'animal', p_q, left(btrim(p_text), 20), v_status, v_points);
    return jsonb_build_object('ok', true, 'correct', v_ok);

  elsif p_kind = 'verse' then
    v_in := public.picnic_norm(p_text);
    if char_length(v_in) < 5 or char_length(p_text) > 300 then
      return jsonb_build_object('ok', false, 'error', '말씀을 끝까지 적어 주세요.');
    end if;
    v_ok := v_in = public.picnic_norm(a.verse);
    -- 2026-10-23 변경: 다르면 선생님 대기로 보내지 않고 「다른 글자 N개」만 알려 준다(어느 글자인지는 알려 주지 않음).
    -- 학생이 「선생님께 확인 요청」을 누를 때만 대기로 간다(picnic_verse_ask).
    if v_ok then
      update public.picnic_subs set status = 'rejected', reviewed_at = now()
      where team_id = t.id and kind = 'verse' and q = p_q and status = 'pending';
      insert into public.picnic_subs(team_id, member_id, kind, q, text_val, status, points)
      values (t.id, p_member, 'verse', p_q, btrim(p_text), 'ok', 2);
      return jsonb_build_object('ok', true, 'correct', true);
    end if;
    v_diff := public.picnic_editdist(v_in, public.picnic_norm(a.verse));
    insert into public.picnic_subs(team_id, member_id, kind, q, text_val, status, points, note)
    values (t.id, p_member, 'verse', p_q, btrim(p_text), 'wrong', 0, v_diff::text);
    return jsonb_build_object('ok', true, 'correct', false, 'diff', v_diff);

  elsif p_kind = 'hidden3' then
    -- 릴스 영상은 앱에 올리지 않고 전도사님께 카톡으로 보낸다(2026-10-23). 앱에는 「보냈어요」만 남긴다.
    if exists (select 1 from public.picnic_subs where team_id = t.id and kind = 'hidden3' and status = 'pending') then
      return jsonb_build_object('ok', false, 'error', '전도사님이 확인하고 있어요. 조금만 기다려 주세요!');
    end if;
    insert into public.picnic_subs(team_id, member_id, kind, q, text_val, status, points)
    values (t.id, p_member, 'hidden3', 0, '전도사님께 카톡으로 보냄', 'pending', 0);
    return jsonb_build_object('ok', true);

  else
    if p_photo is null or left(p_photo, char_length(v_prefix)) <> v_prefix or p_photo ~ '\.\.' or char_length(p_photo) > 300 then
      return jsonb_build_object('ok', false, 'error', '사진을 다시 올려 주세요.');
    end if;
    if (select count(*) from public.picnic_subs where team_id = t.id and kind = p_kind and q = p_q and status = 'pending') >= 3 then
      return jsonb_build_object('ok', false, 'error', '선생님이 사진을 확인하고 있어요. 조금만 기다려 주세요!');
    end if;
    insert into public.picnic_subs(team_id, member_id, kind, q, photo_url, status, points)
    values (t.id, p_member, p_kind, p_q, p_photo, 'pending', 0);
    return jsonb_build_object('ok', true);
  end if;
end;
$$;

-- 4) 사진 보물찾기 힌트 (13:30 이후, 받으면 그 장소는 3점) ----------------------------------
create or replace function public.picnic_hint(p_code text, p_member int, p_place int) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  t public.picnic_teams;
  e public.picnic_events;
begin
  select * into t from public.picnic_teams where code = upper(btrim(coalesce(p_code, '')));
  if not found then return jsonb_build_object('ok', false, 'error', '팀 코드를 다시 확인해 주세요.'); end if;
  if not exists (select 1 from public.picnic_members where id = p_member and team_id = t.id) then
    return jsonb_build_object('ok', false, 'error', '내 이름을 다시 골라 주세요.');
  end if;
  select * into e from public.picnic_events where event = t.event;
  if now() < e.hint_unlock_at then return jsonb_build_object('ok', false, 'error', '힌트는 1시 30분부터 받을 수 있어요.'); end if;
  if p_place < 1 or p_place > 8 then return jsonb_build_object('ok', false, 'error', '없는 장소예요.'); end if;
  if not exists (select 1 from public.picnic_subs where team_id = t.id and kind = 'hint' and q = p_place) then
    insert into public.picnic_subs(team_id, member_id, kind, q, status, points) values (t.id, p_member, 'hint', p_place, 'ok', 0);
  end if;
  return jsonb_build_object('ok', true, 'hint', coalesce(e.place_hints->>(p_place::text), '선생님께 여쭤보세요!'));
end;
$$;

-- 5) 관리 화면 ------------------------------------------------------------------------
create or replace function public.picnic_admin(p_event text, p_code text, p_action text, p_args jsonb default '{}'::jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  e public.picnic_events;
  s public.picnic_subs;
  v_pts int;
  v_team int;
  v_code text;
  v_name text;
  i int := 0;
begin
  select * into e from public.picnic_events where event = p_event;
  -- 관리 코드가 맞거나, 말씀우물 관리자 계정으로 로그인한 경우(관리자 페이지 「원정대」 탭)
  if not found or (e.admin_code <> coalesce(p_code, '')
      and not exists (select 1 from profiles p where p.user_id = auth.uid() and coalesce(p.is_admin, false))) then
    return jsonb_build_object('ok', false, 'error', '관리 코드가 맞지 않습니다.');
  end if;

  if p_action = 'overview' then
    return jsonb_build_object('ok', true, 'now', now(),
      'event', jsonb_build_object('title', e.title, 'hidden_open_at', e.hidden_open_at, 'hint_unlock_at', e.hint_unlock_at,
        'hidden_force', e.hidden_force, 'results_open', e.results_open, 'card_clues', e.card_clues,
        'place_hints', e.place_hints, 'meet_place', e.meet_place),
      'teams', coalesce((select jsonb_agg(jsonb_build_object(
          'id', t.id, 'name', t.name, 'emoji', t.emoji, 'code', t.code, 'penalty', t.penalty, 'bonus', t.bonus,
          'score', public.picnic_team_score(t.id),
          'members', coalesce((select jsonb_agg(jsonb_build_object('id', m.id, 'name', m.name,
                       'count', (select count(*) from public.picnic_subs x where x.member_id = m.id and x.status in ('ok','pending') and x.kind <> 'hint'))
                       order by m.sort, m.name) from public.picnic_members m where m.team_id = t.id), '[]'::jsonb)
        ) order by t.sort, t.id) from public.picnic_teams t where t.event = p_event), '[]'::jsonb),
      'pending', coalesce((select jsonb_agg(jsonb_build_object(
          'id', x.id, 'team_id', t.id, 'team', t.name, 'emoji', t.emoji, 'kind', x.kind, 'q', x.q, 'text', x.text_val, 'photo', x.photo_url,
          'who', m.name, 'at', x.created_at,
          'answer', case when x.kind = 'verse' then (select a.verse from public.picnic_answers a where a.q = x.q) end,
          'ref', case when x.kind in ('verse','animal_photo') then (select a.ref from public.picnic_answers a where a.q = x.q) end,
          'animals', case when x.kind = 'animal_photo' then (select to_jsonb(a.animals) from public.picnic_answers a where a.q = x.q) end,
          'hint_used', x.kind = 'place' and exists (select 1 from public.picnic_subs h where h.team_id = x.team_id and h.kind = 'hint' and h.q = x.q)
        ) order by x.created_at) from public.picnic_subs x join public.picnic_teams t on t.id = x.team_id
          left join public.picnic_members m on m.id = x.member_id
          where t.event = p_event and x.status = 'pending'), '[]'::jsonb),
      'photos', coalesce((select jsonb_agg(jsonb_build_object(
          'id', x.id, 'team_id', t.id, 'team', t.name, 'emoji', t.emoji, 'kind', x.kind, 'q', x.q, 'photo', x.photo_url, 'who', m.name, 'points', x.points)
          order by x.created_at desc) from public.picnic_subs x join public.picnic_teams t on t.id = x.team_id
          left join public.picnic_members m on m.id = x.member_id
          where t.event = p_event and x.status = 'ok' and x.photo_url is not null), '[]'::jsonb)
    );

  elsif p_action = 'review' then
    select x.* into s from public.picnic_subs x join public.picnic_teams t on t.id = x.team_id
      where x.id = (p_args->>'id')::bigint and t.event = p_event;
    if not found then return jsonb_build_object('ok', false, 'error', '없는 제출입니다.'); end if;
    if (p_args->>'ok')::boolean then
      v_pts := case s.kind
        when 'animal_photo' then 2
        when 'verse' then 2
        when 'place' then case when exists (select 1 from public.picnic_subs h where h.team_id = s.team_id and h.kind = 'hint' and h.q = s.q) then 3 else 5 end
        when 'hidden1' then 10
        when 'hidden2' then 10
        when 'hidden3' then 10
        else 0 end;
      update public.picnic_subs set status = 'ok', points = v_pts, reviewed_at = now() where id = s.id;
      -- 같은 항목의 다른 대기 제출은 정리
      update public.picnic_subs set status = 'rejected', reviewed_at = now()
        where team_id = s.team_id and kind = s.kind and q = s.q and status = 'pending' and id <> s.id;
    else
      update public.picnic_subs set status = 'rejected', points = 0, reviewed_at = now(),
        note = nullif(left(btrim(coalesce(p_args->>'reason', '')), 100), '') where id = s.id;
    end if;
    return jsonb_build_object('ok', true);

  elsif p_action = 'undo' then  -- 승인한 사진·말씀을 다시 대기로
    update public.picnic_subs x set status = 'pending', points = 0, reviewed_at = null
      from public.picnic_teams t where t.id = x.team_id and t.event = p_event and x.id = (p_args->>'id')::bigint and x.kind <> 'animal';
    return jsonb_build_object('ok', true);

  elsif p_action = 'adjust' then
    update public.picnic_teams set penalty = greatest(0, coalesce((p_args->>'penalty')::int, penalty)),
                                   bonus = greatest(0, coalesce((p_args->>'bonus')::int, bonus))
      where id = (p_args->>'team')::int and event = p_event;
    return jsonb_build_object('ok', true);

  elsif p_action = 'settings' then
    update public.picnic_events set
      hidden_force  = coalesce((p_args->>'hidden_force')::boolean, hidden_force),
      results_open  = coalesce((p_args->>'results_open')::boolean, results_open),
      hidden_open_at = coalesce((p_args->>'hidden_open_at')::timestamptz, hidden_open_at),
      hint_unlock_at = coalesce((p_args->>'hint_unlock_at')::timestamptz, hint_unlock_at),
      card_clues    = coalesce(p_args->'card_clues', card_clues),
      place_hints   = coalesce(p_args->'place_hints', place_hints),
      meet_place    = coalesce(p_args->>'meet_place', meet_place),
      updated_at    = now()
    where event = p_event;
    return jsonb_build_object('ok', true);

  elsif p_action = 'add_team' then
    v_name := btrim(coalesce(p_args->>'name', ''));
    if v_name = '' then return jsonb_build_object('ok', false, 'error', '팀 이름을 적어 주세요.'); end if;
    loop
      v_code := (array['가을','단풍','은행','사자','사슴','독수리','낙타','표범'])[1 + floor(random() * 8)::int]
                || '-' || lpad((floor(random() * 9000) + 1000)::int::text, 4, '0');
      exit when not exists (select 1 from public.picnic_teams where code = v_code);
    end loop;
    insert into public.picnic_teams(event, name, emoji, code, sort)
      values (p_event, v_name, coalesce(nullif(btrim(p_args->>'emoji'), ''), '🍁'), v_code,
              coalesce((select max(sort) + 1 from public.picnic_teams where event = p_event), 1))
      returning id into v_team;
    return jsonb_build_object('ok', true, 'id', v_team, 'code', v_code);

  elsif p_action = 'edit_team' then
    update public.picnic_teams set name = coalesce(nullif(btrim(p_args->>'name'), ''), name),
                                   emoji = coalesce(nullif(btrim(p_args->>'emoji'), ''), emoji)
      where id = (p_args->>'team')::int and event = p_event;
    return jsonb_build_object('ok', true);

  elsif p_action = 'delete_team' then
    delete from public.picnic_teams where id = (p_args->>'team')::int and event = p_event;
    return jsonb_build_object('ok', true);

  elsif p_action = 'add_members' then  -- {"team": 1, "names": ["홍길동", ...]}
    v_team := (p_args->>'team')::int;
    if not exists (select 1 from public.picnic_teams where id = v_team and event = p_event) then
      return jsonb_build_object('ok', false, 'error', '없는 팀입니다.');
    end if;
    for v_name in select btrim(x) from jsonb_array_elements_text(p_args->'names') x loop
      if v_name <> '' and not exists (select 1 from public.picnic_members where team_id = v_team and name = v_name) then
        insert into public.picnic_members(team_id, name, sort) values (v_team, left(v_name, 20), i);
        i := i + 1;
      end if;
    end loop;
    return jsonb_build_object('ok', true, 'added', i);

  elsif p_action = 'delete_member' then
    delete from public.picnic_members m using public.picnic_teams t
      where m.id = (p_args->>'member')::int and t.id = m.team_id and t.event = p_event;
    return jsonb_build_object('ok', true);

  elsif p_action = 'signups' then  -- 온라인 참가 신청 목록
    return jsonb_build_object('ok', true, 'until', e.signup_until,
      'list', coalesce((select jsonb_agg(jsonb_build_object('id', x.id, 'name', x.name, 'grade', x.grade, 'class', x.class_name,
                 'teacher', x.teacher, 'friend', x.new_friend, 'stay', x.stay_after,
                 'going', x.going, 'parent_ok', x.parent_ok, 'paper', x.paper, 'at', x.updated_at) order by x.grade, x.name)
               from public.picnic_signups x where x.event = p_event), '[]'::jsonb));

  elsif p_action = 'signup_paper' then  -- 종이 신청서 냈는지 체크
    update public.picnic_signups set paper = coalesce((p_args->>'paper')::boolean, not paper)
      where id = (p_args->>'id')::bigint and event = p_event;
    return jsonb_build_object('ok', true);

  elsif p_action = 'signup_delete' then
    delete from public.picnic_signups where id = (p_args->>'id')::bigint and event = p_event;
    return jsonb_build_object('ok', true);

  elsif p_action = 'signup_until' then
    update public.picnic_events set signup_until = (p_args->>'until')::timestamptz where event = p_event;
    return jsonb_build_object('ok', true);

  elsif p_action = 'reset_subs' then  -- 시험 기록 지우기 (팀·명단은 남김)
    delete from public.picnic_subs x using public.picnic_teams t where t.id = x.team_id and t.event = p_event;
    update public.picnic_teams set penalty = 0, bonus = 0 where event = p_event;
    update public.picnic_events set hidden_force = false, results_open = false where event = p_event;
    return jsonb_build_object('ok', true);
  end if;

  return jsonb_build_object('ok', false, 'error', '알 수 없는 동작입니다.');
end;
$$;

revoke all on function public.picnic_norm(text), public.picnic_team_score(int), public.picnic_board(text) from public, anon, authenticated;
grant execute on function public.picnic_join(text) to anon, authenticated;
grant execute on function public.picnic_state(text) to anon, authenticated;
grant execute on function public.picnic_submit(text, int, text, int, text, text) to anon, authenticated;
grant execute on function public.picnic_hint(text, int, int) to anon, authenticated;
grant execute on function public.picnic_admin(text, text, text, jsonb) to anon, authenticated;

-- 6) 사진 저장소 -------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('picnic-photos', 'picnic-photos', true, 3145728, array['image/jpeg'])
on conflict (id) do update set public = true, file_size_limit = 3145728, allowed_mime_types = array['image/jpeg'];

drop policy if exists "picnic photos upload" on storage.objects;
create policy "picnic photos upload" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'picnic-photos' and name ~ '^autumn2026/[0-9a-f-]{36}\.jpg$');
create or replace function public.can_see_expedition() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles p where p.user_id = auth.uid() and coalesce(p.is_admin, false));
$$;
grant execute on function public.can_see_expedition() to anon, authenticated;

-- 학생이 실명을 직접 적어 들어온다(2026-10-23). 같은 팀에 같은 이름이 있으면 그 사람으로 이어진다.
create or replace function public.picnic_register(p_code text, p_name text) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  t public.picnic_teams;
  v_name text := regexp_replace(btrim(coalesce(p_name, '')), '\s+', ' ', 'g');
  v_id int;
  v_old text;
begin
  select * into t from public.picnic_teams where code = upper(btrim(coalesce(p_code, '')));
  if not found then return jsonb_build_object('ok', false, 'error', '팀 코드를 다시 확인해 주세요.'); end if;
  if char_length(v_name) < 2 or char_length(v_name) > 10 or v_name !~ '^[가-힣A-Za-z ]+$' then
    return jsonb_build_object('ok', false, 'error', '이름을 2~10글자 한글(또는 영문)로 적어 주세요.');
  end if;
  select id, name into v_id, v_old from public.picnic_members where team_id = t.id and replace(name, ' ', '') = replace(v_name, ' ', '') limit 1;
  if v_id is not null then v_name := v_old; end if;
  if v_id is null then
    if (select count(*) from public.picnic_members where team_id = t.id) >= 30 then
      return jsonb_build_object('ok', false, 'error', '이 팀 인원이 너무 많아요. 선생님께 말씀드려 주세요.');
    end if;
    insert into public.picnic_members(team_id, name, sort)
      values (t.id, v_name, coalesce((select max(sort) + 1 from public.picnic_members where team_id = t.id), 0))
      returning id into v_id;
  end if;
  return jsonb_build_object('ok', true, 'member', jsonb_build_object('id', v_id, 'name', v_name));
end;
$$;
grant execute on function public.picnic_register(text, text) to anon, authenticated;

-- 학생이 「선생님께 확인 요청」을 누르면 그 문제의 가장 최근 틀린 말씀을 선생님 대기로 보낸다(2026-10-23).
create or replace function public.picnic_verse_ask(p_code text, p_member int, p_q int) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  t public.picnic_teams;
  v_id bigint;
begin
  select * into t from public.picnic_teams where code = upper(btrim(coalesce(p_code, '')));
  if not found then return jsonb_build_object('ok', false, 'error', '팀 코드를 다시 확인해 주세요.'); end if;
  if not exists (select 1 from public.picnic_members where id = p_member and team_id = t.id) then
    return jsonb_build_object('ok', false, 'error', '내 이름을 다시 적어 주세요.');
  end if;
  if (select results_open from public.picnic_events where event = t.event) then
    return jsonb_build_object('ok', false, 'error', '미션이 끝났어요. 결과를 확인해 보세요!');
  end if;
  if exists (select 1 from public.picnic_subs where team_id = t.id and kind = 'verse' and q = p_q and status in ('ok', 'pending')) then
    return jsonb_build_object('ok', false, 'error', '이미 통과했거나 선생님이 확인하고 있어요.');
  end if;
  select id into v_id from public.picnic_subs where team_id = t.id and kind = 'verse' and q = p_q and status = 'wrong'
    order by created_at desc limit 1;
  if v_id is null then return jsonb_build_object('ok', false, 'error', '먼저 말씀을 적어 내 주세요.'); end if;
  update public.picnic_subs set status = 'pending', note = null where id = v_id;
  return jsonb_build_object('ok', true);
end;
$$;
grant execute on function public.picnic_verse_ask(text, int, int) to anon, authenticated;

-- 야유회 참가 신청(온라인, 2026-10-23). 보호자 서명은 종이 신청서로 따로 받는다.
alter table public.picnic_events add column if not exists signup_until timestamptz not null default '2026-10-25 21:00+09';
create table if not exists public.picnic_signups (
  id         bigserial primary key,
  event      text not null references public.picnic_events(event) on delete cascade,
  name       text not null,
  grade      int  not null check (grade between 1 and 3),
  class_name text,
  going      boolean not null,
  parent_ok  boolean not null default false,
  paper      boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists picnic_signups_uniq on public.picnic_signups(event, grade, (replace(name, ' ', '')));
alter table public.picnic_signups enable row level security;
revoke all on public.picnic_signups from anon, authenticated;

create or replace function public.picnic_signup(p_event text, p_name text, p_grade int, p_class text, p_going boolean, p_parent_ok boolean)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  e public.picnic_events;
  v_name text := regexp_replace(btrim(coalesce(p_name, '')), '\s+', ' ', 'g');
  v_class text := nullif(left(btrim(coalesce(p_class, '')), 12), '');
begin
  select * into e from public.picnic_events where event = p_event;
  if not found then return jsonb_build_object('ok', false, 'error', '없는 행사예요.'); end if;
  if now() > e.signup_until then return jsonb_build_object('ok', false, 'error', '온라인 신청이 마감됐어요. 전도사님께 직접 말씀드려 주세요.'); end if;
  if char_length(v_name) < 2 or char_length(v_name) > 10 or v_name !~ '^[가-힣A-Za-z ]+$' then
    return jsonb_build_object('ok', false, 'error', '이름을 2~10글자 한글(또는 영문)로 적어 주세요.');
  end if;
  if p_grade is null or p_grade not between 1 and 3 then return jsonb_build_object('ok', false, 'error', '학년을 골라 주세요.'); end if;
  if p_going is null then return jsonb_build_object('ok', false, 'error', '갈 수 있는지 골라 주세요.'); end if;
  if (select count(*) from public.picnic_signups where event = p_event and created_at > now() - interval '1 minute') > 40 then
    return jsonb_build_object('ok', false, 'error', '잠깐만요! 조금 뒤에 다시 눌러 주세요.');
  end if;
  insert into public.picnic_signups(event, name, grade, class_name, going, parent_ok)
  values (p_event, v_name, p_grade, v_class, p_going, coalesce(p_parent_ok, false))
  on conflict (event, grade, (replace(name, ' ', ''))) do update
    set class_name = excluded.class_name, going = excluded.going, parent_ok = excluded.parent_ok, updated_at = now();
  return jsonb_build_object('ok', true, 'until', e.signup_until);
end;
$$;
grant execute on function public.picnic_signup(text, text, int, text, boolean, boolean) to anon, authenticated;

-- 신청 마감 시각만 공개로 알려 준다
create or replace function public.picnic_signup_info(p_event text) returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce((select jsonb_build_object('ok', true, 'until', signup_until, 'open', now() <= signup_until) from public.picnic_events where event = p_event),
                  jsonb_build_object('ok', false));
$$;
grant execute on function public.picnic_signup_info(text) to anon, authenticated;

-- 신청 칸 바꿈(2026-10-23): 반 / 담임 선생님 / 함께 오는 새친구, 마감 10/25 밤 10시
alter table public.picnic_signups add column if not exists teacher text;
alter table public.picnic_signups add column if not exists new_friend text;
update public.picnic_events set signup_until = '2026-10-25 22:00+09' where event = 'autumn2026';
alter table public.picnic_events alter column signup_until set default '2026-10-25 22:00+09';

create or replace function public.picnic_signup(p_event text, p_name text, p_grade int, p_class text, p_teacher text, p_friend text, p_going boolean, p_parent_ok boolean)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  e public.picnic_events;
  v_name text := regexp_replace(btrim(coalesce(p_name, '')), '\s+', ' ', 'g');
begin
  select * into e from public.picnic_events where event = p_event;
  if not found then return jsonb_build_object('ok', false, 'error', '없는 행사예요.'); end if;
  if now() > e.signup_until then return jsonb_build_object('ok', false, 'error', '온라인 신청이 마감됐어요. 전도사님께 직접 말씀드려 주세요.'); end if;
  if char_length(v_name) < 2 or char_length(v_name) > 10 or v_name !~ '^[가-힣A-Za-z ]+$' then
    return jsonb_build_object('ok', false, 'error', '이름을 2~10글자 한글(또는 영문)로 적어 주세요.');
  end if;
  if p_grade is null or p_grade not between 1 and 3 then return jsonb_build_object('ok', false, 'error', '학년을 골라 주세요.'); end if;
  if p_going is null then return jsonb_build_object('ok', false, 'error', '갈 수 있는지 골라 주세요.'); end if;
  if (select count(*) from public.picnic_signups where event = p_event and created_at > now() - interval '1 minute') > 40 then
    return jsonb_build_object('ok', false, 'error', '잠깐만요! 조금 뒤에 다시 눌러 주세요.');
  end if;
  insert into public.picnic_signups(event, name, grade, class_name, teacher, new_friend, going, parent_ok)
  values (p_event, v_name, p_grade, nullif(left(btrim(coalesce(p_class, '')), 12), ''), nullif(left(btrim(coalesce(p_teacher, '')), 12), ''),
          nullif(left(btrim(coalesce(p_friend, '')), 40), ''), p_going, coalesce(p_parent_ok, false))
  on conflict (event, grade, (replace(name, ' ', ''))) do update
    set class_name = excluded.class_name, teacher = excluded.teacher, new_friend = excluded.new_friend,
        going = excluded.going, parent_ok = excluded.parent_ok, updated_at = now();
  return jsonb_build_object('ok', true, 'until', e.signup_until);
end;
$$;
grant execute on function public.picnic_signup(text, text, int, text, text, text, boolean, boolean) to anon, authenticated;

-- 14시 이후 더 남아서 구경(부모님 허락하에) 표시 (2026-10-23)
alter table public.picnic_signups add column if not exists stay_after boolean not null default false;

create or replace function public.picnic_signup(p_event text, p_name text, p_grade int, p_class text, p_teacher text, p_friend text, p_going boolean, p_parent_ok boolean, p_stay boolean)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  e public.picnic_events;
  v_name text := regexp_replace(btrim(coalesce(p_name, '')), '\s+', ' ', 'g');
begin
  select * into e from public.picnic_events where event = p_event;
  if not found then return jsonb_build_object('ok', false, 'error', '없는 행사예요.'); end if;
  if now() > e.signup_until then return jsonb_build_object('ok', false, 'error', '온라인 신청이 마감됐어요. 전도사님께 직접 말씀드려 주세요.'); end if;
  if char_length(v_name) < 2 or char_length(v_name) > 10 or v_name !~ '^[가-힣A-Za-z ]+$' then
    return jsonb_build_object('ok', false, 'error', '이름을 2~10글자 한글(또는 영문)로 적어 주세요.');
  end if;
  if p_grade is null or p_grade not between 1 and 3 then return jsonb_build_object('ok', false, 'error', '학년을 골라 주세요.'); end if;
  if p_going is null then return jsonb_build_object('ok', false, 'error', '갈 수 있는지 골라 주세요.'); end if;
  if (select count(*) from public.picnic_signups where event = p_event and created_at > now() - interval '1 minute') > 40 then
    return jsonb_build_object('ok', false, 'error', '잠깐만요! 조금 뒤에 다시 눌러 주세요.');
  end if;
  insert into public.picnic_signups(event, name, grade, class_name, teacher, new_friend, going, parent_ok, stay_after)
  values (p_event, v_name, p_grade, nullif(left(btrim(coalesce(p_class, '')), 12), ''), nullif(left(btrim(coalesce(p_teacher, '')), 12), ''),
          nullif(left(btrim(coalesce(p_friend, '')), 40), ''), p_going, coalesce(p_parent_ok, false), coalesce(p_stay, false) and p_going)
  on conflict (event, grade, (replace(name, ' ', ''))) do update
    set class_name = excluded.class_name, teacher = excluded.teacher, new_friend = excluded.new_friend,
        going = excluded.going, parent_ok = excluded.parent_ok, stay_after = excluded.stay_after, updated_at = now();
  return jsonb_build_object('ok', true, 'until', e.signup_until);
end;
$$;
grant execute on function public.picnic_signup(text, text, int, text, text, text, boolean, boolean, boolean) to anon, authenticated;

-- 히든 미션 3 · 팀 릴스(영상) 추가 (2026-10-23): 저장소가 영상도 받게, 파일 한 개 50MB까지
update storage.buckets set file_size_limit = 52428800, allowed_mime_types = array['image/jpeg','video/mp4','video/quicktime','video/webm'] where id = 'picnic-photos';
drop policy if exists "picnic photos upload" on storage.objects;
create policy "picnic photos upload" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'picnic-photos' and name ~ '^autumn2026/[0-9a-f-]{36}\.(jpg|mp4|mov|webm)$');

-- 릴스를 카톡으로 받기로 바꿔서 저장소는 다시 사진(jpg, 3MB)만 받는다 (2026-10-23)
update storage.buckets set file_size_limit = 3145728, allowed_mime_types = array['image/jpeg'] where id = 'picnic-photos';
drop policy if exists "picnic photos upload" on storage.objects;
create policy "picnic photos upload" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'picnic-photos' and name ~ '^autumn2026/[0-9a-f-]{36}\.jpg$');
