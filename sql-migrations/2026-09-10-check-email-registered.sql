-- 2026-09-10  로그인 실패 시 원인을 구분해서 보여주기 위한 최소 조회 함수.
--   Supabase 는 보안상 "이메일 없음"과 "비밀번호 틀림"을 모두 "Invalid login credentials"로
--   반환한다. 이 앱은 로고스교회 중등부 내부용(회원 ~45명, 전부 아는 학생)이라, 로그인
--   화면에서 "가입 안 된 이메일인지 / 비밀번호가 틀린 건지"를 안내하는 편이 학생·교역자에게
--   훨씬 유용하다. 그래서 이메일 등록 여부(불리언 2개)만 돌려주는 공개 함수를 둔다.
--   개인정보(이름/전화 등)는 절대 반환하지 않는다.
-- 재실행 안전: create or replace.

create or replace function check_email_registered(p_email text)
returns table(registered boolean, confirmed boolean)
language sql
security definer
set search_path = public
as $func$
  select
    exists (select 1 from auth.users u
            where lower(u.email) = lower(trim(p_email)) and u.deleted_at is null) as registered,
    exists (select 1 from auth.users u
            where lower(u.email) = lower(trim(p_email)) and u.deleted_at is null
              and u.email_confirmed_at is not null) as confirmed;
$func$;

grant execute on function check_email_registered(text) to anon, authenticated;
