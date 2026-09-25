-- In Odyssey 다시 하기 기록(짧을수록 좋음): 홍해 건너기·문설주 바르기·우박 알리기·짚단 모으기 (2026-09-25 밤)
-- submit_odyssey_score 가 새 종류를 받도록 교체. 재실행 안전.
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
    when 'rp_straw'  then lo := 5; hi := 1800; low_better := true;
    when 'rp_hail'   then lo := 5; hi := 1800; low_better := true;
    when 'rp_marks'  then lo := 5; hi := 1800; low_better := true;
    when 'rp_redsea' then lo := 3; hi := 1800; low_better := true;
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

-- 순위: dark·rp_* 는 짧을수록 위
create or replace function get_odyssey_rankings(p_limit integer default 10)
returns table(kind text, rank integer, nickname text, title text, value integer, extra text, is_mine boolean)
language sql security definer set search_path = public as $$
  with ok as (select can_see_odyssey() as v),
  s as (
    select sc.kind,
           rank() over (partition by sc.kind order by case when sc.kind = 'dark' or sc.kind like 'rp\_%' then sc.best else -sc.best end, sc.updated_at)::int as rank,
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
