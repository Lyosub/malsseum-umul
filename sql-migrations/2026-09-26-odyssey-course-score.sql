-- In Odyssey 광야 조작 코스(2026-09-26): 주마다 바뀌는 코스 A·B·C 완주 시간(초, 짧을수록 좋음)을 랭킹에 올릴 수 있게 종류 추가.
-- 랭킹 순서는 get_odyssey_rankings의 'rp\_%' 규칙(짧을수록 위)을 그대로 따름. 재실행 안전.
create or replace function public.submit_odyssey_score(p_kind text, p_value integer)
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
    when 'rp_course1', 'rp_course2', 'rp_course3' then lo := 5; hi := 300; low_better := true;
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
