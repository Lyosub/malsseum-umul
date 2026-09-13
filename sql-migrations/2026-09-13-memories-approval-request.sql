-- 추억모음집: "우물지기에게 승인 요청하기" 버튼 지원.
-- 적용 완료(Supabase Management API로 직접 실행함). 기록용, 재실행 안전.

alter table profiles add column if not exists photos_approval_requested_at timestamptz;

drop function if exists get_member_list();

CREATE OR REPLACE FUNCTION public.get_member_list()
 RETURNS TABLE(user_id uuid, nickname text, real_name text, phone_number text, email text, is_admin boolean, is_teacher boolean, is_department_head boolean, photos_approved boolean, photos_approval_requested_at timestamp with time zone, joined_at timestamp with time zone, last_sign_in_at timestamp with time zone, last_note_type text, last_note_at timestamp with time zone, total_points bigint)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select
    p.user_id, p.nickname,
    case when exists (select 1 from profiles ap where ap.user_id = auth.uid() and ap.is_admin = true) then p.real_name else null end,
    case when exists (select 1 from profiles ap where ap.user_id = auth.uid() and ap.is_admin = true) then p.phone_number else null end,
    u.email, p.is_admin, p.is_teacher, p.is_department_head, p.photos_approved, p.photos_approval_requested_at, p.created_at, u.last_sign_in_at,
    (select n.type from notes n where n.user_id = p.user_id order by n.created_at desc limit 1) as last_note_type,
    (select n.created_at from notes n where n.user_id = p.user_id order by n.created_at desc limit 1) as last_note_at,
    (select coalesce(sum(pl.points), 0) from points_ledger pl where pl.user_id = p.user_id)::bigint as total_points
  from profiles p
  join auth.users u on u.id = p.user_id
  where exists (
    select 1 from profiles admin_p where admin_p.user_id = auth.uid() and (admin_p.is_admin = true or admin_p.is_department_head = true)
  )
  order by p.created_at desc;
$function$;

-- 승인할 때 요청 표시를 같이 지움(해제할 때는 남겨둠 — 재요청 없이도 우물지기가 다시 알아볼 수 있게).
CREATE OR REPLACE FUNCTION public.admin_set_photos_approved(p_user_id uuid, p_approved boolean)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not exists (
    select 1 from profiles where user_id = auth.uid() and is_admin = true
  ) then
    raise exception '관리자만 지정할 수 있습니다.';
  end if;

  perform set_config('app.allow_privilege_change', 'true', true);
  update profiles set photos_approved = p_approved, photos_approval_requested_at = case when p_approved then null else photos_approval_requested_at end where user_id = p_user_id;
  return true;
end;
$function$;
