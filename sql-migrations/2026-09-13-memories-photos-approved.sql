-- 추억모음집(memories.html) 접근 제한: 로그인 + 관리자가 개별 승인한 사람만 볼 수 있게.
-- 학생·교인 얼굴이 찍힌 사진이라 아무나(비로그인 포함) 못 보게 해달라는 요청(2026-09-13).
-- 적용 완료(Supabase Management API로 직접 실행함). 기록용으로 남겨둠 — 재실행해도 안전(idempotent).

alter table profiles add column if not exists photos_approved boolean not null default false;

-- is_admin/is_teacher/is_department_head/real_name과 같은 방식으로 photos_approved도
-- 일반 update로는 못 바꾸게 보호(관리자 RPC를 통해서만 변경 가능).
CREATE OR REPLACE FUNCTION public.protect_privilege_columns()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if auth.uid() is not null and coalesce(current_setting('app.allow_privilege_change', true), '') <> 'true' then
    new.is_admin := old.is_admin;
    new.is_teacher := old.is_teacher;
    new.real_name := old.real_name;
    new.is_department_head := old.is_department_head;
    new.photos_approved := old.photos_approved;
  end if;
  return new;
end;
$function$;

-- admin_set_teacher와 동일한 패턴: 교역자(is_admin)만 승인/해제 가능.
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
  update profiles set photos_approved = p_approved where user_id = p_user_id;
  return true;
end;
$function$;

-- get_member_list에 photos_approved 컬럼 추가(반환 타입이 바뀌므로 drop 후 재생성 필요).
drop function if exists get_member_list();

CREATE OR REPLACE FUNCTION public.get_member_list()
 RETURNS TABLE(user_id uuid, nickname text, real_name text, phone_number text, email text, is_admin boolean, is_teacher boolean, is_department_head boolean, photos_approved boolean, joined_at timestamp with time zone, last_sign_in_at timestamp with time zone, last_note_type text, last_note_at timestamp with time zone, total_points bigint)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select
    p.user_id, p.nickname,
    case when exists (select 1 from profiles ap where ap.user_id = auth.uid() and ap.is_admin = true) then p.real_name else null end,
    case when exists (select 1 from profiles ap where ap.user_id = auth.uid() and ap.is_admin = true) then p.phone_number else null end,
    u.email, p.is_admin, p.is_teacher, p.is_department_head, p.photos_approved, p.created_at, u.last_sign_in_at,
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
