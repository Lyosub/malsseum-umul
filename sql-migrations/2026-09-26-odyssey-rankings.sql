-- In Odyssey 기록 랭킹 · 오이코스 함께 모으기 (2026-09-26)
-- 게임 안(☰ 메뉴 → 🏆)에서만 보임. 시험 참여 학생·관리자(can_see_odyssey)만 올리고 볼 수 있다.
-- 다시 실행해도 안전(if not exists / create or replace).

-- 1) 도전 기록: 사람마다 종류별 최고 기록 하나
create table if not exists odyssey_scores (
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  best integer not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, kind)
);
alter table odyssey_scores enable row level security;   -- 직접 읽기·쓰기 없음(함수로만)

-- 2) 진행 요약: 마친 장 · 구절 카드 · 두루마리 조각 · 칭호
create table if not exists odyssey_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  chapters integer not null default 0,
  verses integer not null default 0,
  scrolls integer not null default 0,
  title text,
  updated_at timestamptz not null default now()
);
alter table odyssey_progress enable row level security;

-- 기록 올리기: 종류별로 높을수록(또는 dark는 짧을수록) 좋은 기록만 남김. 말이 안 되는 값은 거절
create or replace function submit_odyssey_score(p_kind text, p_value integer)
returns integer language plpgsql security definer set search_path = public as $$
declare lo int; hi int; low_better boolean := false; cur int;
begin
  if auth.uid() is null or not can_see_odyssey() then return null; end if;
  case p_kind
    when 'brick'  then lo := 0; hi := 60;
    when 'frogs'  then lo := 0; hi := 24;
    when 'hail'   then lo := 0; hi := 40;
    when 'rhythm' then lo := 0; hi := 100;
    when 'dark'   then lo := 3; hi := 900; low_better := true;
    else return null;
  end case;
  if p_value is null or p_value < lo or p_value > hi then return null; end if;
  insert into odyssey_scores (user_id, kind, best) values (auth.uid(), p_kind, p_value)
  on conflict (user_id, kind) do update
    set best = case when low_better then least(odyssey_scores.best, excluded.best) else greatest(odyssey_scores.best, excluded.best) end,
        updated_at = case when (low_better and excluded.best < odyssey_scores.best) or (not low_better and excluded.best > odyssey_scores.best) then now() else odyssey_scores.updated_at end
  returning best into cur;
  return cur;
end $$;

create or replace function submit_odyssey_progress(p_chapters integer, p_verses integer, p_scrolls integer, p_title text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or not can_see_odyssey() then return; end if;
  insert into odyssey_progress (user_id, chapters, verses, scrolls, title)
  values (auth.uid(), greatest(0, least(coalesce(p_chapters, 0), 4)), greatest(0, least(coalesce(p_verses, 0), 200)),
          greatest(0, least(coalesce(p_scrolls, 0), 20)), left(p_title, 30))
  on conflict (user_id) do update
    set chapters = greatest(odyssey_progress.chapters, excluded.chapters),
        verses = greatest(odyssey_progress.verses, excluded.verses),
        scrolls = greatest(odyssey_progress.scrolls, excluded.scrolls),
        title = coalesce(excluded.title, odyssey_progress.title), updated_at = now();
end $$;

-- 랭킹: 종류별 상위 p_limit + 진행 순위(마친 장 → 구절 → 두루마리). 닉네임·칭호만 돌려줌
create or replace function get_odyssey_rankings(p_limit integer default 10)
returns table(kind text, rank integer, nickname text, title text, value integer, extra text, is_mine boolean)
language sql security definer set search_path = public as $$
  with ok as (select can_see_odyssey() as v),
  s as (
    select sc.kind,
           rank() over (partition by sc.kind order by case when sc.kind = 'dark' then sc.best else -sc.best end, sc.updated_at)::int as rank,
           p.nickname, pr.title, sc.best as value, null::text as extra, sc.user_id
    from odyssey_scores sc join profiles p on p.user_id = sc.user_id left join odyssey_progress pr on pr.user_id = sc.user_id
  ),
  g as (
    select 'progress'::text as kind,
           rank() over (order by pr.chapters desc, pr.verses desc, pr.scrolls desc, pr.updated_at)::int as rank,
           p.nickname, pr.title, pr.chapters as value, pr.verses || '/' || pr.scrolls as extra, pr.user_id
    from odyssey_progress pr join profiles p on p.user_id = pr.user_id
  )
  select a.kind, a.rank, a.nickname, a.title, a.value, a.extra, a.user_id = auth.uid()
  from (select * from s union all select * from g) a, ok
  where ok.v and (a.rank <= greatest(coalesce(p_limit, 10), 1) or a.user_id = auth.uid())
  order by a.kind, a.rank;
$$;

-- 오이코스 함께 모으기: 내가 속한 오이코스(숨김 아님)마다 구성원의 구절 카드 수
create or replace function get_odyssey_oikos()
returns table(group_name text, nickname text, verses integer, chapters integer, is_mine boolean)
language sql security definer set search_path = public as $$
  select g.name, p.nickname, coalesce(pr.verses, 0), coalesce(pr.chapters, 0), gm.user_id = auth.uid()
  from groups g
  join group_members gm on gm.group_id = g.id
  join profiles p on p.user_id = gm.user_id
  left join odyssey_progress pr on pr.user_id = gm.user_id
  where can_see_odyssey() and not coalesce(g.is_hidden, false)
    and g.id in (select group_id from group_members where user_id = auth.uid())
  order by g.name, coalesce(pr.verses, 0) desc, p.nickname;
$$;

revoke all on function submit_odyssey_score(text, integer) from public, anon;
revoke all on function submit_odyssey_progress(integer, integer, integer, text) from public, anon;
revoke all on function get_odyssey_rankings(integer) from public, anon;
revoke all on function get_odyssey_oikos() from public, anon;
grant execute on function submit_odyssey_score(text, integer) to authenticated;
grant execute on function submit_odyssey_progress(integer, integer, integer, text) to authenticated;
grant execute on function get_odyssey_rankings(integer) to authenticated;
grant execute on function get_odyssey_oikos() to authenticated;
