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
