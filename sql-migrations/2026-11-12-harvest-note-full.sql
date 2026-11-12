-- 감사노트에서 담긴 글은 광주리에 60자로 잘려 들어간다(예배 화면용). 승인 화면에서는 감사노트 원문 전체를 보이게 한다(2026-11-12 전도사님).
-- 관리 코드(또는 관리자 계정)가 맞을 때만, 잘린 글의 message_id와 원문만 돌려준다(쓴 사람 정보는 돌려주지 않는다).
create or replace function public.harvest_note_full(p_code text)
returns jsonb
language plpgsql
stable security definer
set search_path to 'public'
as $$
begin
  if not exists (select 1 from public.star_rooms where room = 'harvest' and admin_code = coalesce(p_code, ''))
     and not coalesce((select pf.is_admin from public.profiles pf where pf.user_id = auth.uid()), false) then
    return jsonb_build_object('ok', false, 'error', '관리 코드가 맞지 않습니다.');
  end if;
  return jsonb_build_object('ok', true, 'rows', coalesce((
    select jsonb_agg(jsonb_build_object('message_id', e.message_id, 'full', btrim(n.content)))
    from public.harvest_entries e join public.notes n on n.id = e.note_id
    where e.message_id is not null and btrim(n.content) <> e.body
  ), '[]'::jsonb));
end;
$$;
revoke all on function public.harvest_note_full(text) from public;
grant execute on function public.harvest_note_full(text) to anon, authenticated;
