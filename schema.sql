-- 말씀우물 Supabase 스키마
-- Supabase 대시보드 > SQL Editor에서 실행

-- 출석 기록
create table if not exists attendance (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

alter table attendance enable row level security;

create policy "본인 출석만 조회" on attendance
  for select using (auth.uid() = user_id);

create policy "본인 출석만 등록" on attendance
  for insert with check (auth.uid() = user_id);

-- 감사노트 / 기도제목 / 하루 인사
create table if not exists notes (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('greeting', 'gratitude', 'prayer')),
  content text not null,
  created_at timestamptz not null default now()
);

alter table notes enable row level security;

create policy "본인 노트만 조회" on notes
  for select using (auth.uid() = user_id);

create policy "본인 노트만 작성" on notes
  for insert with check (auth.uid() = user_id);

create policy "본인 노트만 삭제" on notes
  for delete using (auth.uid() = user_id);

create policy "본인 노트만 수정" on notes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 프로필 (닉네임) — 그룹 리더보드 표시용
create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null unique,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "본인 프로필만 조회" on profiles
  for select using (auth.uid() = user_id);

create policy "본인 프로필만 생성" on profiles
  for insert with check (auth.uid() = user_id);

-- 회원가입 화면에서 로그인 전에도 닉네임 중복 여부를 확인할 수 있도록 하는 함수
-- (profiles의 SELECT 정책이 본인 것만 허용하므로, RLS를 우회해 exists 여부만 알려준다)
create or replace function is_nickname_taken(p_nickname text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists(select 1 from profiles where nickname = p_nickname);
$$;

create policy "본인 프로필만 수정" on profiles
  for update using (auth.uid() = user_id);

-- 그룹 (친구 초대해서 함께 출석)
create table if not exists groups (
  id bigint generated always as identity primary key,
  name text not null,
  invite_code text not null unique,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- 그룹 멤버십 (groups의 RLS 정책이 이 테이블을 참조하므로 groups보다 먼저 만들어야 함)
create table if not exists group_members (
  group_id bigint not null references groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

alter table groups enable row level security;

create policy "멤버만 그룹 조회" on groups
  for select using (
    exists (select 1 from group_members gm where gm.group_id = groups.id and gm.user_id = auth.uid())
  );

create policy "로그인 사용자는 그룹 생성 가능" on groups
  for insert with check (auth.uid() = created_by);

alter table group_members enable row level security;

create policy "본인 멤버십만 조회" on group_members
  for select using (auth.uid() = user_id);

create policy "본인 멤버십만 등록" on group_members
  for insert with check (auth.uid() = user_id);

-- 그룹 생성 (그룹 생성 직후엔 아직 본인이 멤버가 아니라서 groups의 SELECT 정책(멤버만 조회)에
-- 걸려 방금 만든 행을 못 읽어오는 문제가 있었음 — 생성+본인 멤버 등록을 한 트랜잭션으로 묶어서 해결)
create or replace function create_group(p_name text)
returns table(group_id bigint, group_name text, invite_code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
  v_id bigint;
  v_chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_tries int := 0;
begin
  loop
    v_code := '';
    for i in 1..6 loop
      v_code := v_code || substr(v_chars, (floor(random() * length(v_chars)) + 1)::int, 1);
    end loop;
    exit when not exists (select 1 from groups g where g.invite_code = v_code);
    v_tries := v_tries + 1;
    if v_tries > 10 then
      raise exception '초대 코드 생성에 실패했습니다. 다시 시도해주세요.';
    end if;
  end loop;

  insert into groups (name, invite_code, created_by)
  values (p_name, v_code, auth.uid())
  returning id into v_id;

  insert into group_members (group_id, user_id)
  values (v_id, auth.uid());

  return query select v_id, p_name, v_code;
end;
$$;

-- 초대 코드로 그룹 참여 (RLS를 우회해 코드로 그룹을 찾은 뒤 본인을 멤버로 등록)
create or replace function join_group_by_code(p_code text)
returns table(group_id bigint, group_name text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group record;
begin
  select id, name into v_group from groups where invite_code = p_code;
  if v_group is null then
    raise exception '초대 코드를 찾을 수 없습니다.';
  end if;

  -- on conflict의 대상 컬럼 목록은 (표현식 인덱스도 지정할 수 있게) 일반 표현식으로 파싱되는데,
  -- 이 함수의 출력 컬럼 이름이 마찬가지로 group_id라서 "group_id"가 그 출력 변수를 말하는 건지
  -- group_members.group_id를 말하는 건지 모호하다며 항상 에러가 났다(42702, join_group_by_code가
  -- 만들어진 이후 초대코드 참여가 계속 실패하고 있었음). 컬럼명 대신 기본키 제약 이름으로 지정해서 해결.
  insert into group_members (group_id, user_id)
  values (v_group.id, auth.uid())
  on conflict on constraint group_members_pkey do nothing;

  return query select v_group.id, v_group.name;
end;
$$;

-- 그룹 리더보드 (닉네임 + 총 출석일수) — 멤버 본인 확인 후 RLS 우회하여 집계
create or replace function get_group_leaderboard(p_group_id bigint)
returns table(user_id uuid, nickname text, total_days bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from group_members gm
    where gm.group_id = p_group_id and gm.user_id = auth.uid()
  ) then
    raise exception '이 그룹의 멤버만 조회할 수 있습니다.';
  end if;

  return query
    select p.user_id, p.nickname, count(a.id)::bigint as total_days
    from group_members gm
    join profiles p on p.user_id = gm.user_id
    left join attendance a on a.user_id = gm.user_id
    where gm.group_id = p_group_id
    group by p.user_id, p.nickname
    order by total_days desc;
end;
$$;

-- 관리자 표시 (본인이 직접 켤 수 없도록 profiles의 일반 UPDATE 정책과 분리해서 관리)
alter table profiles add column if not exists is_admin boolean not null default false;

-- ⚠️ 최초 관리자 지정은 SQL Editor에서 아래처럼 수동으로 한 번 실행할 것 (가입 후 본인 이메일로):
--   update profiles set is_admin = true where user_id = (select id from auth.users where email = '본인이메일@example.com');

-- 관리자 전용 회원 목록 (닉네임/이메일/가입일/최근 접속) — auth.users는 클라이언트에서 직접 조회할 수 없어
-- SECURITY DEFINER로 우회하되, 호출자가 관리자일 때만 결과를 반환한다
create or replace function get_member_list()
returns table(
  user_id uuid,
  nickname text,
  email text,
  is_admin boolean,
  joined_at timestamptz,
  last_sign_in_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select p.user_id, p.nickname, u.email, p.is_admin, p.created_at, u.last_sign_in_at
  from profiles p
  join auth.users u on u.id = p.user_id
  where exists (
    select 1 from profiles admin_p where admin_p.user_id = auth.uid() and admin_p.is_admin = true
  )
  order by p.created_at desc;
$$;

-- 공지사항 (관리자만 작성/수정/삭제, 누구나 조회 가능)
create table if not exists announcements (
  id bigint generated always as identity primary key,
  title text not null,
  content text not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table announcements enable row level security;

create policy "공지사항은 누구나 조회 가능" on announcements
  for select using (true);

create policy "관리자만 공지사항 작성" on announcements
  for insert with check (
    exists (select 1 from profiles p where p.user_id = auth.uid() and p.is_admin = true)
  );

create policy "관리자만 공지사항 수정" on announcements
  for update using (
    exists (select 1 from profiles p where p.user_id = auth.uid() and p.is_admin = true)
  );

create policy "관리자만 공지사항 삭제" on announcements
  for delete using (
    exists (select 1 from profiles p where p.user_id = auth.uid() and p.is_admin = true)
  );

-- 이달의 일정 (캘린더, 관리자만 작성/수정/삭제, 누구나 조회 가능)
create table if not exists calendar_events (
  id bigint generated always as identity primary key,
  event_date date not null,
  title text not null,
  description text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table calendar_events enable row level security;

create policy "일정은 누구나 조회 가능" on calendar_events
  for select using (true);

create policy "관리자만 일정 작성" on calendar_events
  for insert with check (
    exists (select 1 from profiles p where p.user_id = auth.uid() and p.is_admin = true)
  );

create policy "관리자만 일정 수정" on calendar_events
  for update using (
    exists (select 1 from profiles p where p.user_id = auth.uid() and p.is_admin = true)
  );

create policy "관리자만 일정 삭제" on calendar_events
  for delete using (
    exists (select 1 from profiles p where p.user_id = auth.uid() and p.is_admin = true)
  );

-- ===== 포인트 시스템 =====
-- 출석 +1점 / 7일 연속 출석마다 +1점 보너스 / 감사노트·기도제목 +2점(하루 1건만 인정)
-- 클라이언트가 직접 points_ledger에 쓰지 못하게 하고(RLS는 SELECT만 허용), 트리거로만 적립되게 해서
-- 포인트 조작을 막는다.
create table if not exists points_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  action_type text not null check (action_type in ('attendance', 'streak_bonus', 'note', 'quiz')),
  points integer not null,
  ref_date date not null,
  created_at timestamptz not null default now(),
  unique (user_id, action_type, ref_date)
);

alter table points_ledger enable row level security;

create policy "본인 포인트만 조회" on points_ledger
  for select using (auth.uid() = user_id);

create or replace function award_attendance_points()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_streak integer := 1;
  v_check date := new.date - 1;
begin
  insert into points_ledger (user_id, action_type, points, ref_date)
  values (new.user_id, 'attendance', 1, new.date)
  on conflict (user_id, action_type, ref_date) where action_type <> 'admin_award' do nothing;

  while exists (select 1 from attendance where user_id = new.user_id and date = v_check) loop
    v_streak := v_streak + 1;
    v_check := v_check - 1;
  end loop;

  if v_streak % 7 = 0 then
    insert into points_ledger (user_id, action_type, points, ref_date)
    values (new.user_id, 'streak_bonus', 1, new.date)
    on conflict (user_id, action_type, ref_date) where action_type <> 'admin_award' do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_attendance_points on attendance;
create trigger trg_attendance_points
  after insert on attendance
  for each row execute function award_attendance_points();

create or replace function award_note_points()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.type in ('gratitude', 'prayer') then
    insert into points_ledger (user_id, action_type, points, ref_date)
    values (new.user_id, 'note', 2, (new.created_at at time zone 'Asia/Seoul')::date)
    on conflict (user_id, action_type, ref_date) where action_type <> 'admin_award' do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_notes_points on notes;
create trigger trg_notes_points
  after insert on notes
  for each row execute function award_note_points();

-- 그룹 리더보드를 출석일수 대신 총 포인트 기준으로 (반환 컬럼이 바뀌므로 함수를 다시 정의)
drop function if exists get_group_leaderboard(bigint);

create or replace function get_group_leaderboard(p_group_id bigint)
returns table(user_id uuid, nickname text, total_days bigint, total_points bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from group_members gm
    where gm.group_id = p_group_id and gm.user_id = auth.uid()
  ) then
    raise exception '이 그룹의 멤버만 조회할 수 있습니다.';
  end if;

  return query
    select
      p.user_id,
      p.nickname,
      (select count(*) from attendance a where a.user_id = p.user_id)::bigint as total_days,
      (select coalesce(sum(pl.points), 0) from points_ledger pl where pl.user_id = p.user_id)::bigint as total_points
    from group_members gm
    join profiles p on p.user_id = gm.user_id
    where gm.group_id = p_group_id
    order by total_points desc;
end;
$$;

-- ===== 실시간 감사·기도 나눔 피드 (홈페이지 공개) =====
-- 감사노트는 로그인한 사람에게만 닉네임 노출, 기도제목은 로그인 여부와 상관없이 항상 익명.
-- notes 테이블 자체의 RLS(본인만 조회)는 그대로 두고, 이 함수만 SECURITY DEFINER로 우회해서
-- 정해진 필드(닉네임 마스킹 포함)만 내보낸다 — 원본 테이블 접근 권한은 바뀌지 않는다.
create or replace function get_public_notes(p_limit integer default 60)
returns table(id bigint, type text, content text, created_at timestamptz, nickname text)
language sql
security definer
set search_path = public
as $$
  select
    n.id,
    n.type,
    n.content,
    n.created_at,
    case
      when n.type = 'prayer' then null
      when auth.uid() is not null then p.nickname
      else null
    end as nickname
  from notes n
  join profiles p on p.user_id = n.user_id
  where n.type in ('greeting', 'gratitude', 'prayer')
  order by n.created_at desc
  limit p_limit;
$$;

-- ===== 관리자: 학생 기록 관리 =====
-- 회원 목록에 최근 기록(타입/시각)을 함께 보여주도록 반환 컬럼 추가 (기존 함수를 다시 정의)
drop function if exists get_member_list();

-- 교사 여부 (회원가입 화면에서는 고를 수 없고, 관리자가 회원 관리에서만 지정할 수 있다)
alter table profiles add column if not exists is_teacher boolean not null default false;

-- ⚠️ 보안 수정: "본인 프로필만 수정" 정책(위 71번째 줄 근처)은 본인 행이라는 것만 확인할 뿐
-- is_admin/is_teacher 같은 권한 컬럼까지 마음대로 바꾸는 걸 막지는 못했다. 즉 로그인한 사용자가
-- 브라우저에서 supabase.from('profiles').update({is_admin:true})를 직접 호출하면 그대로 통과되는
-- 취약점이 있었다. 트리거로 "일반 사용자가 직접 하는 update"에서는 이 두 컬럼을 항상 기존 값으로
-- 되돌리고, admin_set_teacher()처럼 신뢰된 함수 안에서만 세션 플래그를 켜서 예외적으로 허용한다.
-- (SQL Editor에서 관리자를 수동으로 지정할 때처럼 auth.uid()가 없는 경우는 그대로 통과시킨다.)
-- real_name도 이 트리거로 함께 보호한다: 회원가입 직후 최초 1회(행이 아직 없어서 insert로 처리됨)는
-- 그대로 저장되지만, 그 이후 본인이 update로 real_name을 바꾸려 하면 이전 값으로 되돌린다.
-- 오직 admin_set_real_name()처럼 신뢰된 함수 안에서 세션 플래그를 켰을 때만 예외적으로 통과된다.
create or replace function protect_privilege_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and coalesce(current_setting('app.allow_privilege_change', true), '') <> 'true' then
    new.is_admin := old.is_admin;
    new.is_teacher := old.is_teacher;
    new.real_name := old.real_name;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_protect_privilege on profiles;
create trigger trg_profiles_protect_privilege
  before update on profiles
  for each row execute function protect_privilege_columns();

-- 관리자 전용: 특정 회원을 교사/학생으로 지정 (본인이 직접 켤 수 없도록 위 트리거로 보호되어 있음)
create or replace function admin_set_teacher(p_user_id uuid, p_is_teacher boolean)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from profiles where user_id = auth.uid() and is_admin = true
  ) then
    raise exception '관리자만 지정할 수 있습니다.';
  end if;

  perform set_config('app.allow_privilege_change', 'true', true);
  update profiles set is_teacher = p_is_teacher where user_id = p_user_id;
  return true;
end;
$$;

create or replace function get_member_list()
returns table(
  user_id uuid,
  nickname text,
  email text,
  is_admin boolean,
  is_teacher boolean,
  joined_at timestamptz,
  last_sign_in_at timestamptz,
  last_note_type text,
  last_note_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    p.user_id, p.nickname, u.email, p.is_admin, p.is_teacher, p.created_at, u.last_sign_in_at,
    (select n.type from notes n where n.user_id = p.user_id order by n.created_at desc limit 1) as last_note_type,
    (select n.created_at from notes n where n.user_id = p.user_id order by n.created_at desc limit 1) as last_note_at
  from profiles p
  join auth.users u on u.id = p.user_id
  where exists (
    select 1 from profiles admin_p where admin_p.user_id = auth.uid() and admin_p.is_admin = true
  )
  order by p.created_at desc;
$$;

-- 관리자 전용: 전체 학생의 감사노트/기도제목/하루인사 전체 목록 (닉네임 포함, 익명 처리 없음 — 관리자만 볼 수 있음)
-- 본명도 함께 내려줘서 화면에 "본명(닉네임)" 형태로 누가 썼는지 바로 알아볼 수 있게 한다.
-- (반환 컬럼 구성이 바뀌므로 create or replace 전에 기존 함수를 먼저 지워야 한다)
drop function if exists get_all_notes_admin(integer);
create or replace function get_all_notes_admin(p_limit integer default 200)
returns table(id bigint, user_id uuid, nickname text, real_name text, type text, content text, created_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select n.id, n.user_id, p.nickname, p.real_name, n.type, n.content, n.created_at
  from notes n
  join profiles p on p.user_id = n.user_id
  where exists (
    select 1 from profiles admin_p where admin_p.user_id = auth.uid() and admin_p.is_admin = true
  )
  order by n.created_at desc
  limit p_limit;
$$;

-- 관리자 전용: 기록 삭제 (부적절한 내용 등을 관리자가 지울 수 있도록)
-- 감사노트/기도제목이 삭제되면(본인이 직접 지우든, 관리자가 성의없다고 지우든) 받았던 포인트도 함께 회수한다.
-- 트리거로 만들어서 "누가 지웠는지"와 상관없이 notes에서 행이 사라지는 모든 경우에 똑같이 적용되게 한다.
-- (그 날 다른 감사노트/기도제목이 남아있으면 이미 그걸로 조건을 채운 것이므로 포인트는 그대로 둔다)
create or replace function revoke_note_points_on_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ref_date date;
  v_remaining_count int;
begin
  if old.type in ('gratitude', 'prayer') then
    v_ref_date := (old.created_at at time zone 'Asia/Seoul')::date;

    select count(*) into v_remaining_count
    from notes
    where user_id = old.user_id
      and type in ('gratitude', 'prayer')
      and (created_at at time zone 'Asia/Seoul')::date = v_ref_date;

    if v_remaining_count = 0 then
      delete from points_ledger
      where user_id = old.user_id and action_type = 'note' and ref_date = v_ref_date;
    end if;
  end if;
  return old;
end;
$$;

drop trigger if exists trg_notes_revoke_points on notes;
create trigger trg_notes_revoke_points
  after delete on notes
  for each row execute function revoke_note_points_on_delete();

-- 관리자 전용: 부적절하거나 성의없는 기록 삭제 (포인트 회수는 위 트리거가 자동으로 처리한다)
create or replace function admin_delete_note(p_note_id bigint)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from profiles where user_id = auth.uid() and is_admin = true
  ) then
    raise exception '관리자만 삭제할 수 있습니다.';
  end if;

  delete from notes where id = p_note_id;
  return true;
end;
$$;

-- ===== 그룹 주간 챌린지 보너스 (개인이 얻는 포인트와는 별개로 그룹 전체에게 추가 지급) =====
-- 1) 그룹원의 80% 이상이 그 주(월~일)에 한 번이라도 출석하면 전원에게 +1점
-- 2) 그룹원 전원이 그 주에 감사노트/기도제목을 최소 1개씩은 쓰고, 그룹 전체 합계가 10개 이상이면 전원에게 +2점
--    (합계만 보면 몇 명이 몰아 써도 조건이 채워지는 문제가 있어서, "전원 참여 + 합계" 두 조건을 같이 본다)
-- 단, 이 보너스는 그룹을 만든 사람(host, groups.created_by)이 교사일 때만 적용된다.
-- 학생끼리만 만든 그룹은 보너스 대상이 아니다 (교사가 지도하는 그룹만 챌린지 인정).
-- 서버에 정해진 시간마다 도는 스케줄러가 없으므로, 그룹원 아무나 마이페이지를 열 때
-- "지난주(가장 최근에 끝난 월~일)" 조건을 확인해서 정산하는 방식으로 동작한다.
-- points_ledger의 unique(user_id, action_type, ref_date) 덕분에 같은 주는 중복 지급되지 않는다.
alter table points_ledger drop constraint if exists points_ledger_action_type_check;
alter table points_ledger add constraint points_ledger_action_type_check
  check (action_type in ('attendance', 'streak_bonus', 'note', 'quiz', 'group_attendance_bonus', 'group_notes_bonus'));

-- 그룹원이면 누구나(교사 여부와 무관하게) 확인용으로 호출할 수 있는 자격 여부 조회 함수
create or replace function get_group_bonus_eligible(p_group_id bigint)
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(p.is_teacher, false)
  from groups g
  join profiles p on p.user_id = g.created_by
  where g.id = p_group_id
    and exists (
      select 1 from group_members gm
      where gm.group_id = p_group_id and gm.user_id = auth.uid()
    );
$$;

create or replace function evaluate_group_weekly_bonus(p_group_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  -- current_date는 DB 세션 시간대(보통 UTC) 기준이라 한국 시간 자정~아침 9시 사이에는 아직
  -- "어제 날짜"로 계산되어 주 경계가 하루 어긋날 수 있었다. 다른 함수들처럼 한국 시간 기준으로 통일한다.
  v_week_start date := date_trunc('week', (now() at time zone 'Asia/Seoul')::date)::date - 7;
  v_week_end date := date_trunc('week', (now() at time zone 'Asia/Seoul')::date)::date - 1;
  v_member_count int;
  v_attended_count int;
  v_min_ok_count int;
  v_total_notes int;
  v_host_is_teacher boolean;
begin
  if not exists (select 1 from group_members where group_id = p_group_id and user_id = auth.uid()) then
    return;
  end if;

  select coalesce(p.is_teacher, false) into v_host_is_teacher
  from groups g
  join profiles p on p.user_id = g.created_by
  where g.id = p_group_id;

  if not v_host_is_teacher then
    return; -- 교사가 만든 그룹이 아니면 챌린지 보너스 대상이 아니다
  end if;

  select count(*) into v_member_count from group_members where group_id = p_group_id;
  if v_member_count = 0 then
    return;
  end if;

  select count(distinct gm.user_id) into v_attended_count
  from group_members gm
  where gm.group_id = p_group_id
    and exists (
      select 1 from attendance a
      where a.user_id = gm.user_id and a.date between v_week_start and v_week_end
    );

  select count(*) into v_min_ok_count
  from group_members gm
  where gm.group_id = p_group_id
    and exists (
      select 1 from notes n
      where n.user_id = gm.user_id
        and n.type in ('gratitude', 'prayer')
        and (n.created_at at time zone 'Asia/Seoul')::date between v_week_start and v_week_end
    );

  select count(*) into v_total_notes
  from notes n
  join group_members gm on gm.user_id = n.user_id
  where gm.group_id = p_group_id
    and n.type in ('gratitude', 'prayer')
    and (n.created_at at time zone 'Asia/Seoul')::date between v_week_start and v_week_end;

  if v_attended_count::numeric / v_member_count >= 0.8 then
    insert into points_ledger (user_id, action_type, points, ref_date)
    select gm.user_id, 'group_attendance_bonus', 1, v_week_start
    from group_members gm where gm.group_id = p_group_id
    on conflict (user_id, action_type, ref_date) where action_type <> 'admin_award' do nothing;
  end if;

  if v_min_ok_count = v_member_count and v_total_notes >= 10 then
    insert into points_ledger (user_id, action_type, points, ref_date)
    select gm.user_id, 'group_notes_bonus', 2, v_week_start
    from group_members gm where gm.group_id = p_group_id
    on conflict (user_id, action_type, ref_date) where action_type <> 'admin_award' do nothing;
  end if;
end;
$$;

-- 그룹원들이 서로 "오늘 출석/하루인사/감사노트/기도제목을 했는지"만 확인할 수 있는 현황판
-- (내용은 절대 보여주지 않고 완료 여부만 boolean으로 반환한다)
create or replace function get_group_today_status(p_group_id bigint)
returns table(
  user_id uuid,
  nickname text,
  attended boolean,
  wrote_greeting boolean,
  wrote_gratitude boolean,
  wrote_prayer boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today date := (now() at time zone 'Asia/Seoul')::date;
begin
  -- 아래 group_members를 gm으로 한정해야 한다 — 이 함수의 RETURNS TABLE에 user_id라는 이름의
  -- 출력 컬럼이 있어서, 한정하지 않으면 get_current_quiz와 같은 이유(42702 ambiguous)로 항상 에러가 났다.
  if not exists (select 1 from group_members gm where gm.group_id = p_group_id and gm.user_id = auth.uid()) then
    raise exception '이 그룹의 멤버만 조회할 수 있습니다.';
  end if;

  return query
    select
      p.user_id,
      p.nickname,
      exists(select 1 from attendance a where a.user_id = p.user_id and a.date = v_today) as attended,
      exists(select 1 from notes n where n.user_id = p.user_id and n.type = 'greeting' and (n.created_at at time zone 'Asia/Seoul')::date = v_today) as wrote_greeting,
      exists(select 1 from notes n where n.user_id = p.user_id and n.type = 'gratitude' and (n.created_at at time zone 'Asia/Seoul')::date = v_today) as wrote_gratitude,
      exists(select 1 from notes n where n.user_id = p.user_id and n.type = 'prayer' and (n.created_at at time zone 'Asia/Seoul')::date = v_today) as wrote_prayer
    from group_members gm
    join profiles p on p.user_id = gm.user_id
    where gm.group_id = p_group_id
    order by p.nickname;
end;
$$;

-- ===== 수요 성경퀴즈 (객관식 4지선다, 정답 시 +1점) =====
-- quiz_questions는 정답(correct_option)이 들어있어서 학생이 직접 테이블을 조회하면 정답이 노출된다.
-- 그래서 RLS로 일반 사용자의 SELECT를 아예 막고, get_current_quiz()/submit_quiz_answer() 두 함수로만
-- 오가게 해서 정답이 클라이언트로 절대 내려가지 않게 한다(제출 결과로만 알려준다).
create table if not exists quiz_questions (
  id bigint generated always as identity primary key,
  week_start date not null,
  question text not null,
  option1 text not null,
  option2 text not null,
  option3 text not null,
  option4 text not null,
  correct_option smallint not null check (correct_option between 1 and 4),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table quiz_questions enable row level security;

create policy "관리자만 퀴즈 조회" on quiz_questions
  for select using (
    exists (select 1 from profiles p where p.user_id = auth.uid() and p.is_admin = true)
  );

create policy "관리자만 퀴즈 작성" on quiz_questions
  for insert with check (
    exists (select 1 from profiles p where p.user_id = auth.uid() and p.is_admin = true)
  );

create policy "관리자만 퀴즈 삭제" on quiz_questions
  for delete using (
    exists (select 1 from profiles p where p.user_id = auth.uid() and p.is_admin = true)
  );

create table if not exists quiz_answers (
  id bigint generated always as identity primary key,
  quiz_id bigint not null references quiz_questions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  selected_option smallint not null,
  is_correct boolean not null,
  created_at timestamptz not null default now(),
  unique (quiz_id, user_id)
);

alter table quiz_answers enable row level security;

create policy "본인 답안만 조회" on quiz_answers
  for select using (auth.uid() = user_id);

-- 학생용: 가장 최근에 등록된 퀴즈를 정답 없이 반환하고, 본인이 이미 풀었는지/맞혔는지도 같이 알려준다
create or replace function get_current_quiz()
returns table(
  id bigint,
  question text,
  option1 text,
  option2 text,
  option3 text,
  option4 text,
  week_start date,
  already_answered boolean,
  my_selected_option smallint,
  my_is_correct boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_quiz record;
begin
  -- week_start는 그 주의 월요일 날짜(관리자가 등록할 때 계산). 미리 등록해둬도 학생에게는
  -- 수요일(week_start + 2일) 00:00(한국시간)이 지나야 보이도록, 그 전까지는 대상에서 제외한다.
  -- (아래 컬럼들을 quiz_questions qq로 명시적으로 한정해야 한다 — 이 함수의 RETURNS TABLE에
  -- week_start라는 이름의 출력 컬럼이 있어서, 한정하지 않으면 plpgsql이 "그 출력 컬럼을 말하는
  -- 건지 테이블 컬럼을 말하는 건지 모호하다(42702)"며 항상 에러를 냈었다 — 학생 화면에는
  -- "아직 등록된 퀴즈가 없어요"로만 보여서 여태 못 알아챈 버그)
  select qq.* into v_quiz
  from quiz_questions qq
  where (qq.week_start + 2) <= (now() at time zone 'Asia/Seoul')::date
  order by qq.week_start desc, qq.created_at desc
  limit 1;
  if v_quiz.id is null then
    return;
  end if;

  return query
    select
      v_quiz.id, v_quiz.question, v_quiz.option1, v_quiz.option2, v_quiz.option3, v_quiz.option4, v_quiz.week_start,
      exists(select 1 from quiz_answers qa where qa.quiz_id = v_quiz.id and qa.user_id = auth.uid()) as already_answered,
      (select qa.selected_option from quiz_answers qa where qa.quiz_id = v_quiz.id and qa.user_id = auth.uid()) as my_selected_option,
      (select qa.is_correct from quiz_answers qa where qa.quiz_id = v_quiz.id and qa.user_id = auth.uid()) as my_is_correct;
end;
$$;

-- 학생용: 답 제출 (정답 여부는 서버에서만 계산해서 클라이언트로 정답을 절대 미리 보내지 않는다)
create or replace function submit_quiz_answer(p_quiz_id bigint, p_selected_option smallint)
returns table(correct boolean, correct_option smallint)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_correct_option smallint;
  v_week_start date;
  v_is_correct boolean;
begin
  if auth.uid() is null then
    raise exception '로그인이 필요합니다.';
  end if;

  if exists (select 1 from quiz_answers where quiz_id = p_quiz_id and user_id = auth.uid()) then
    raise exception '이미 참여한 퀴즈예요.';
  end if;

  select qq.correct_option, qq.week_start into v_correct_option, v_week_start
  from quiz_questions qq
  where qq.id = p_quiz_id
    and (qq.week_start + 2) <= (now() at time zone 'Asia/Seoul')::date;

  if v_correct_option is null then
    raise exception '아직 공개되지 않은 퀴즈예요.';
  end if;

  v_is_correct := (p_selected_option = v_correct_option);

  insert into quiz_answers (quiz_id, user_id, selected_option, is_correct)
  values (p_quiz_id, auth.uid(), p_selected_option, v_is_correct);

  if v_is_correct then
    insert into points_ledger (user_id, action_type, points, ref_date)
    values (auth.uid(), 'quiz', 1, v_week_start)
    on conflict (user_id, action_type, ref_date) where action_type <> 'admin_award' do nothing;
  end if;

  return query select v_is_correct, v_correct_option;
end;
$$;

-- ===== 출석 날짜 위조 방지 =====
-- 기존 "본인 출석만 등록" 정책은 auth.uid() = user_id만 확인할 뿐 날짜는 아무 제한이 없어서,
-- 로그인한 사용자가 브라우저에서 직접 임의의 과거 날짜로 attendance를 여러 번 insert하면
-- 연속 출석 보너스나 그룹 챌린지를 손쉽게 위조할 수 있는 허점이 있었다.
-- 클라이언트가 직접 insert하는 길을 막고, "오늘(한국 시간) 날짜로만" 체크인하는 함수로 바꾼다.
drop policy if exists "본인 출석만 등록" on attendance;

create or replace function check_in_today()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today date := (now() at time zone 'Asia/Seoul')::date;
begin
  if auth.uid() is null then
    raise exception '로그인이 필요합니다.';
  end if;

  insert into attendance (user_id, date)
  values (auth.uid(), v_today)
  on conflict (user_id, date) do nothing;

  return found;
end;
$$;

-- ===== 오이코스 해체 + 교역자(is_admin) 전체 오이코스 관리 =====
-- 오이코스를 만든 사람 본인이거나, 교역자(is_admin=true)면 어떤 오이코스든 해체할 수 있다.
-- groups가 삭제되면 group_members는 on delete cascade로 같이 지워진다.
-- (지난주에 이미 지급된 챌린지 포인트는 points_ledger에 user_id로 남아있어 해체해도 회수되지 않는다 — 이미 번 점수이므로)
create or replace function delete_group(p_group_id bigint)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from groups g
    where g.id = p_group_id
      and (
        g.created_by = auth.uid()
        or exists (select 1 from profiles p where p.user_id = auth.uid() and p.is_admin = true)
      )
  ) then
    raise exception '이 오이코스를 해체할 권한이 없습니다.';
  end if;

  delete from groups where id = p_group_id;
  return true;
end;
$$;

-- 교역자 전용: 학생들이 만든 것까지 포함한 전체 오이코스 목록(인원수, 만든 사람, 교사 오이코스 여부 포함)
create or replace function get_all_groups_admin()
returns table(
  id bigint,
  name text,
  invite_code text,
  created_by_nickname text,
  host_is_teacher boolean,
  member_count bigint,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    g.id, g.name, g.invite_code, p.nickname,
    coalesce(p.is_teacher, false),
    (select count(*) from group_members gm where gm.group_id = g.id),
    g.created_at
  from groups g
  join profiles p on p.user_id = g.created_by
  where exists (
    select 1 from profiles admin_p where admin_p.user_id = auth.uid() and admin_p.is_admin = true
  )
  order by g.created_at desc;
$$;

-- 홈페이지 상단 이벤트 배너: 관리자(교역자)가 등록하면 홈 상단에 보이고, 삭제하면 바로 사라진다.
-- (여러 개를 등록하면 최신 것부터 위에 쌓여서 보인다 — 특별한 기간 설정 없이 등록/삭제로만 노출을 제어)
create table if not exists home_banner (
  id bigint generated always as identity primary key,
  title text not null,
  description text,
  link_url text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table home_banner enable row level security;

create policy "이벤트 배너는 누구나 조회 가능" on home_banner
  for select using (true);

create policy "관리자만 이벤트 배너 작성" on home_banner
  for insert with check (
    exists (select 1 from profiles p where p.user_id = auth.uid() and p.is_admin = true)
  );

create policy "관리자만 이벤트 배너 삭제" on home_banner
  for delete using (
    exists (select 1 from profiles p where p.user_id = auth.uid() and p.is_admin = true)
  );

-- ===== 교역자 수동 점수 부여 =====
-- 개인 또는 오이코스 전체에게 교역자가 직접 점수를 얹어줄 수 있는 기능. 금액에 한도를 두지 않는다(양수/음수 모두 허용,
-- 잘못 줬을 때 음수로 보정 가능). action_type을 'admin_award'로 남겨서 다른 자동 적립과 구분하고,
-- 자동 적립(출석/노트/퀴즈/그룹챌린지)에만 걸려 있던 "하루 1건" unique 제약에서는 제외해 같은 사람에게
-- 하루에 여러 번 줘도 막히지 않게 한다.
alter table points_ledger drop constraint if exists points_ledger_action_type_check;
alter table points_ledger add constraint points_ledger_action_type_check
  check (action_type in ('attendance', 'streak_bonus', 'note', 'quiz', 'group_attendance_bonus', 'group_notes_bonus', 'admin_award'));

alter table points_ledger add column if not exists note text;
alter table points_ledger add column if not exists awarded_by uuid references auth.users(id);

alter table points_ledger drop constraint if exists points_ledger_user_id_action_type_ref_date_key;
create unique index if not exists points_ledger_auto_uniq
  on points_ledger (user_id, action_type, ref_date)
  where action_type <> 'admin_award';

-- 교역자 전용: 개인에게 점수 수동 부여
create or replace function admin_award_points(p_user_id uuid, p_points integer, p_note text default null)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from profiles p where p.user_id = auth.uid() and p.is_admin = true) then
    raise exception '교역자만 달란트를 부여할 수 있습니다.';
  end if;
  if p_points is null or p_points = 0 then
    raise exception '0이 아닌 달란트를 입력해주세요.';
  end if;

  insert into points_ledger (user_id, action_type, points, ref_date, note, awarded_by)
  values (p_user_id, 'admin_award', p_points, (now() at time zone 'Asia/Seoul')::date, p_note, auth.uid());

  return true;
end;
$$;

-- 교역자 전용: 오이코스(그룹) 전체 멤버에게 동일한 점수를 일괄 부여
create or replace function admin_award_group_points(p_group_id bigint, p_points integer, p_note text default null)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer := 0;
begin
  if not exists (select 1 from profiles p where p.user_id = auth.uid() and p.is_admin = true) then
    raise exception '교역자만 달란트를 부여할 수 있습니다.';
  end if;
  if p_points is null or p_points = 0 then
    raise exception '0이 아닌 달란트를 입력해주세요.';
  end if;

  insert into points_ledger (user_id, action_type, points, ref_date, note, awarded_by)
  select gm.user_id, 'admin_award', p_points, (now() at time zone 'Asia/Seoul')::date, p_note, auth.uid()
  from group_members gm
  where gm.group_id = p_group_id;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- get_member_list에 현재 총 포인트를 추가해서 관리자가 누구에게 얼마나 더 줄지 참고할 수 있게 한다.
-- (반환 컬럼 구성이 바뀌므로 create or replace 전에 기존 함수를 먼저 지워야 한다)
drop function if exists get_member_list();
create or replace function get_member_list()
returns table(
  user_id uuid,
  nickname text,
  email text,
  is_admin boolean,
  is_teacher boolean,
  joined_at timestamptz,
  last_sign_in_at timestamptz,
  last_note_type text,
  last_note_at timestamptz,
  total_points bigint
)
language sql
security definer
set search_path = public
as $$
  select
    p.user_id, p.nickname, u.email, p.is_admin, p.is_teacher, p.created_at, u.last_sign_in_at,
    (select n.type from notes n where n.user_id = p.user_id order by n.created_at desc limit 1) as last_note_type,
    (select n.created_at from notes n where n.user_id = p.user_id order by n.created_at desc limit 1) as last_note_at,
    (select coalesce(sum(pl.points), 0) from points_ledger pl where pl.user_id = p.user_id)::bigint as total_points
  from profiles p
  join auth.users u on u.id = p.user_id
  where exists (
    select 1 from profiles admin_p where admin_p.user_id = auth.uid() and admin_p.is_admin = true
  )
  order by p.created_at desc;
$$;

-- points_ledger.awarded_by는 단순 기록용 메타데이터라서, 나중에 그 교역자 계정이 탈퇴되더라도
-- 과거에 부여했던 점수 내역까지 함께 막히거나 사라지지 않도록 SET NULL로 바꿔둔다.
alter table points_ledger drop constraint if exists points_ledger_awarded_by_fkey;
alter table points_ledger add constraint points_ledger_awarded_by_fkey
  foreign key (awarded_by) references auth.users(id) on delete set null;

-- 교역자 전용: 회원 탈퇴(계정 완전 삭제).
-- profiles/attendance/notes/points_ledger/group_members는 모두 auth.users를 on delete cascade로 참조하고 있어서
-- auth.users에서 지우면 그 사람의 모든 기록이 함께 정리된다.
-- 주의: 이 사람이 만든 오이코스(groups.created_by)가 있다면 그 오이코스 자체도 cascade로 함께 삭제된다
-- (관리자 화면에서 탈퇴 버튼을 누르기 전에 이 점을 안내한다).
-- 본인 계정과 다른 교역자 계정은 실수 방지를 위해 이 함수로 탈퇴시킬 수 없게 막아둔다.
create or replace function admin_delete_user(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from profiles p where p.user_id = auth.uid() and p.is_admin = true) then
    raise exception '교역자만 회원을 탈퇴시킬 수 있습니다.';
  end if;
  if p_user_id = auth.uid() then
    raise exception '본인 계정은 여기서 탈퇴시킬 수 없습니다.';
  end if;
  if exists (select 1 from profiles p where p.user_id = p_user_id and p.is_admin = true) then
    raise exception '다른 교역자 계정은 탈퇴시킬 수 없습니다.';
  end if;

  delete from auth.users where id = p_user_id;
  return true;
end;
$$;

-- 회원가입 시 본명도 함께 받아서 저장한다. 사이트 안에서는 항상 닉네임으로만 활동/노출되고(공개 API/화면 어디에도
-- real_name을 내보내지 않음), 교역자가 관리자 페이지에서 실제로 누구인지 확인할 때만 쓴다.
alter table profiles add column if not exists real_name text;

-- 오이코스 멤버 목록 (닉네임 + 참여일) — "누가 들어왔는지" 바로 확인용. 기록 내용이나 점수는 없이
-- 순수 멤버 명단만 보여준다. 그 오이코스 멤버 본인이거나 교역자만 조회 가능
-- (교역자는 관리자 페이지 오이코스 관리에서 자신이 속하지 않은 오이코스도 봐야 하므로 별도 허용).
create or replace function get_group_members(p_group_id bigint)
returns table(user_id uuid, nickname text, joined_at timestamptz, is_host boolean)
language sql
security definer
set search_path = public
as $$
  select p.user_id, p.nickname, gm.joined_at, (g.created_by = p.user_id) as is_host
  from group_members gm
  join profiles p on p.user_id = gm.user_id
  join groups g on g.id = gm.group_id
  where gm.group_id = p_group_id
    and (
      exists (select 1 from group_members me where me.group_id = p_group_id and me.user_id = auth.uid())
      or exists (select 1 from profiles ap where ap.user_id = auth.uid() and ap.is_admin = true)
    )
  order by gm.joined_at asc;
$$;

-- 오이코스별 총 달란트 순위 — 홈페이지에는 공개하지 않고, 오이코스에 속한 멤버 본인이거나
-- 교역자일 때만 조회 가능(관리자 페이지 / 마이페이지의 "우리 오이코스" 카드에서만 사용).
-- 오이코스 이름/인원수/총 달란트만 보여주고 개별 멤버의 닉네임이나 기록 내용은 노출하지 않는다.
create or replace function get_group_talent_rankings()
returns table(
  id bigint,
  name text,
  host_is_teacher boolean,
  member_count bigint,
  total_talents bigint
)
language sql
security definer
set search_path = public
as $$
  select
    g.id, g.name, coalesce(p.is_teacher, false),
    (select count(*) from group_members gm where gm.group_id = g.id)::bigint,
    (select coalesce(sum(pl.points), 0)
       from group_members gm2
       join points_ledger pl on pl.user_id = gm2.user_id
       where gm2.group_id = g.id)::bigint as total_talents
  from groups g
  join profiles p on p.user_id = g.created_by
  where (
    exists (select 1 from group_members me where me.user_id = auth.uid())
    or exists (select 1 from profiles ap where ap.user_id = auth.uid() and ap.is_admin = true)
  )
  order by total_talents desc, g.created_at asc
  limit 15;
$$;

-- 관리자 오이코스 관리 화면에서는 닉네임 대신 본명으로 "누가 만들었는지"를 바로 알아볼 수 있어야 하므로
-- created_by_real_name을 추가하고(닉네임도 함께 유지), 오이코스별 총 달란트도 같이 보여준다.
-- (반환 컬럼 구성이 바뀌므로 create or replace 전에 기존 함수를 먼저 지워야 한다)
drop function if exists get_all_groups_admin();
create or replace function get_all_groups_admin()
returns table(
  id bigint,
  name text,
  invite_code text,
  created_by_nickname text,
  created_by_real_name text,
  host_is_teacher boolean,
  member_count bigint,
  total_talents bigint,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    g.id, g.name, g.invite_code, p.nickname, p.real_name,
    coalesce(p.is_teacher, false),
    (select count(*) from group_members gm where gm.group_id = g.id),
    (select coalesce(sum(pl.points), 0)
       from group_members gm2
       join points_ledger pl on pl.user_id = gm2.user_id
       where gm2.group_id = g.id)::bigint,
    g.created_at
  from groups g
  join profiles p on p.user_id = g.created_by
  where exists (
    select 1 from profiles admin_p where admin_p.user_id = auth.uid() and admin_p.is_admin = true
  )
  order by g.created_at desc;
$$;

-- 오이코스 멤버 명단에도 관리자에게만 본명을 함께 보여준다(일반 멤버가 호출하면 real_name은 항상 null —
-- "이름은 공개되지 않는다"는 약속을 지키기 위해, 관리자 여부를 서버에서 직접 확인해서 결정한다).
-- (반환 컬럼 구성이 바뀌므로 create or replace 전에 기존 함수를 먼저 지워야 한다)
drop function if exists get_group_members(bigint);
create or replace function get_group_members(p_group_id bigint)
returns table(user_id uuid, nickname text, real_name text, joined_at timestamptz, is_host boolean)
language sql
security definer
set search_path = public
as $$
  select
    p.user_id, p.nickname,
    case
      when exists (select 1 from profiles ap where ap.user_id = auth.uid() and ap.is_admin = true)
      then p.real_name
      else null
    end as real_name,
    gm.joined_at, (g.created_by = p.user_id) as is_host
  from group_members gm
  join profiles p on p.user_id = gm.user_id
  join groups g on g.id = gm.group_id
  where gm.group_id = p_group_id
    and (
      exists (select 1 from group_members me where me.group_id = p_group_id and me.user_id = auth.uid())
      or exists (select 1 from profiles ap where ap.user_id = auth.uid() and ap.is_admin = true)
    )
  order by gm.joined_at asc;
$$;

-- ===== 오이코스 초대(교사가 학생을 직접 검색해서 추가) =====
-- 오이코스를 만든 사람이 교사(또는 교역자)면, 초대 코드를 공유하는 대신 닉네임이나 본명으로
-- 학생을 검색해서 바로 추가할 수 있다(학생의 별도 수락 절차 없이 즉시 멤버로 등록됨).
-- 검색 결과에는 본명도 함께 내려준다 — 교사가 자기 반 학생을 정확히 찾아 초대할 수 있어야 한다는
-- 요청에 따른 예외적 노출이며, 그 외 화면(오이코스 멤버 목록 등)에서는 여전히 교역자만 본명을 본다.
create or replace function search_users_for_invite(p_query text, p_group_id bigint)
returns table(user_id uuid, nickname text, real_name text)
language sql
security definer
set search_path = public
as $$
  select p.user_id, p.nickname, p.real_name
  from profiles p
  where (
    exists (
      select 1 from groups g
      where g.id = p_group_id
        and g.created_by = auth.uid()
        and exists (
          select 1 from profiles tp
          where tp.user_id = auth.uid() and (tp.is_teacher = true or tp.is_admin = true)
        )
    )
    or exists (select 1 from profiles ap where ap.user_id = auth.uid() and ap.is_admin = true)
  )
  and p.user_id <> auth.uid()
  and not exists (select 1 from group_members gm where gm.group_id = p_group_id and gm.user_id = p.user_id)
  and (p.nickname ilike '%' || p_query || '%' or p.real_name ilike '%' || p_query || '%')
  order by p.nickname
  limit 10;
$$;

-- 검색으로 찾은 학생을 오이코스에 바로 추가한다. 권한 조건은 search_users_for_invite와 동일
-- (그 오이코스를 만든 교사 본인이거나, 교역자면 어떤 오이코스에든 추가할 수 있음).
create or replace function invite_user_to_group(p_group_id bigint, p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from groups g
    where g.id = p_group_id
      and (
        (
          g.created_by = auth.uid()
          and exists (
            select 1 from profiles tp
            where tp.user_id = auth.uid() and (tp.is_teacher = true or tp.is_admin = true)
          )
        )
        or exists (select 1 from profiles ap where ap.user_id = auth.uid() and ap.is_admin = true)
      )
  ) then
    raise exception '이 오이코스에 초대할 권한이 없습니다.';
  end if;

  insert into group_members (group_id, user_id)
  values (p_group_id, p_user_id)
  on conflict on constraint group_members_pkey do nothing;

  return true;
end;
$$;

-- get_member_list에 본명을 추가해서 교역자가 회원 관리 화면에서 확인할 수 있게 한다.
-- (반환 컬럼 구성이 바뀌므로 create or replace 전에 기존 함수를 먼저 지워야 한다)
drop function if exists get_member_list();
create or replace function get_member_list()
returns table(
  user_id uuid,
  nickname text,
  real_name text,
  email text,
  is_admin boolean,
  is_teacher boolean,
  joined_at timestamptz,
  last_sign_in_at timestamptz,
  last_note_type text,
  last_note_at timestamptz,
  total_points bigint
)
language sql
security definer
set search_path = public
as $$
  select
    p.user_id, p.nickname, p.real_name, u.email, p.is_admin, p.is_teacher, p.created_at, u.last_sign_in_at,
    (select n.type from notes n where n.user_id = p.user_id order by n.created_at desc limit 1) as last_note_type,
    (select n.created_at from notes n where n.user_id = p.user_id order by n.created_at desc limit 1) as last_note_at,
    (select coalesce(sum(pl.points), 0) from points_ledger pl where pl.user_id = p.user_id)::bigint as total_points
  from profiles p
  join auth.users u on u.id = p.user_id
  where exists (
    select 1 from profiles admin_p where admin_p.user_id = auth.uid() and admin_p.is_admin = true
  )
  order by p.created_at desc;
$$;

-- 교역자 전용: 회원 본명을 수정한다. 이제 본인은 마이페이지에서 본명을 직접 바꿀 수 없고
-- (위 protect_privilege_columns 트리거가 막음), 교역자만 회원 관리 화면에서 고칠 수 있다.
create or replace function admin_set_real_name(p_user_id uuid, p_real_name text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from profiles where user_id = auth.uid() and is_admin = true
  ) then
    raise exception '교역자만 이름을 수정할 수 있습니다.';
  end if;

  perform set_config('app.allow_privilege_change', 'true', true);
  update profiles set real_name = p_real_name where user_id = p_user_id;
  return true;
end;
$$;

-- ===== 교역자 전용: 회원 상세보기 (닉네임/본명 클릭 시 그 사람의 전체 기록을 세세하게 확인) =====
-- 기본 정보(가입일/최근 접속/총 달란트 등)는 이미 get_member_list에 있으니, 여기서는
-- 그 외에 필요한 세 가지(작성한 기록 전체, 출석 날짜 전체, 달란트 적립/부여 내역 전체)만 따로 내려준다.

create or replace function get_member_notes_admin(p_user_id uuid, p_limit integer default 200)
returns table(id bigint, type text, content text, created_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select n.id, n.type, n.content, n.created_at
  from notes n
  where n.user_id = p_user_id
    and exists (select 1 from profiles ap where ap.user_id = auth.uid() and ap.is_admin = true)
  order by n.created_at desc
  limit p_limit;
$$;

create or replace function get_member_attendance_admin(p_user_id uuid)
returns table(attend_date date)
language sql
security definer
set search_path = public
as $$
  select a.date
  from attendance a
  where a.user_id = p_user_id
    and exists (select 1 from profiles ap where ap.user_id = auth.uid() and ap.is_admin = true)
  order by a.date desc;
$$;

create or replace function get_member_points_admin(p_user_id uuid)
returns table(id bigint, action_type text, points integer, note text, ref_date date, created_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select pl.id, pl.action_type, pl.points, pl.note, pl.ref_date, pl.created_at
  from points_ledger pl
  where pl.user_id = p_user_id
    and exists (select 1 from profiles ap where ap.user_id = auth.uid() and ap.is_admin = true)
  order by pl.created_at desc;
$$;

-- ===== 부장 역할 신설 =====
-- 교역자(is_admin)보다 낮은 단계로, 관리자 페이지에 들어올 수는 있지만 민감한 기능
-- (회원 탈퇴, 본명 조회/수정, 교사 지정, 오이코스 해체)은 할 수 없다.
-- 허용: 공지사항/이달의 일정/성경퀴즈/이벤트 배너 등록·수정·삭제, 학생 기록(감사노트/기도제목/
-- 하루인사) 조회·삭제, 회원·오이코스 목록 조회, 개인/오이코스 달란트 부여.
alter table profiles add column if not exists is_department_head boolean not null default false;

-- 본인이 직접 켤 수 없도록 다른 권한 컬럼들과 함께 보호한다.
create or replace function protect_privilege_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and coalesce(current_setting('app.allow_privilege_change', true), '') <> 'true' then
    new.is_admin := old.is_admin;
    new.is_teacher := old.is_teacher;
    new.real_name := old.real_name;
    new.is_department_head := old.is_department_head;
  end if;
  return new;
end;
$$;

-- 교역자 전용: 부장 지정/해제
create or replace function admin_set_department_head(p_user_id uuid, p_is_department_head boolean)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from profiles where user_id = auth.uid() and is_admin = true) then
    raise exception '교역자만 지정할 수 있습니다.';
  end if;

  perform set_config('app.allow_privilege_change', 'true', true);
  update profiles set is_department_head = p_is_department_head where user_id = p_user_id;
  return true;
end;
$$;

-- 공지사항: 부장도 작성/수정/삭제 가능
drop policy if exists "관리자만 공지사항 작성" on announcements;
create policy "관리자·부장 공지사항 작성" on announcements
  for insert with check (
    exists (select 1 from profiles p where p.user_id = auth.uid() and (p.is_admin = true or p.is_department_head = true))
  );
drop policy if exists "관리자만 공지사항 수정" on announcements;
create policy "관리자·부장 공지사항 수정" on announcements
  for update using (
    exists (select 1 from profiles p where p.user_id = auth.uid() and (p.is_admin = true or p.is_department_head = true))
  );
drop policy if exists "관리자만 공지사항 삭제" on announcements;
create policy "관리자·부장 공지사항 삭제" on announcements
  for delete using (
    exists (select 1 from profiles p where p.user_id = auth.uid() and (p.is_admin = true or p.is_department_head = true))
  );

-- 이달의 일정: 부장도 작성/수정/삭제 가능
drop policy if exists "관리자만 일정 작성" on calendar_events;
create policy "관리자·부장 일정 작성" on calendar_events
  for insert with check (
    exists (select 1 from profiles p where p.user_id = auth.uid() and (p.is_admin = true or p.is_department_head = true))
  );
drop policy if exists "관리자만 일정 수정" on calendar_events;
create policy "관리자·부장 일정 수정" on calendar_events
  for update using (
    exists (select 1 from profiles p where p.user_id = auth.uid() and (p.is_admin = true or p.is_department_head = true))
  );
drop policy if exists "관리자만 일정 삭제" on calendar_events;
create policy "관리자·부장 일정 삭제" on calendar_events
  for delete using (
    exists (select 1 from profiles p where p.user_id = auth.uid() and (p.is_admin = true or p.is_department_head = true))
  );

-- 성경퀴즈: 부장도 조회/작성/삭제 가능 (정답은 어차피 get_current_quiz가 노출하지 않으므로 안전)
drop policy if exists "관리자만 퀴즈 조회" on quiz_questions;
create policy "관리자·부장 퀴즈 조회" on quiz_questions
  for select using (
    exists (select 1 from profiles p where p.user_id = auth.uid() and (p.is_admin = true or p.is_department_head = true))
  );
drop policy if exists "관리자만 퀴즈 작성" on quiz_questions;
create policy "관리자·부장 퀴즈 작성" on quiz_questions
  for insert with check (
    exists (select 1 from profiles p where p.user_id = auth.uid() and (p.is_admin = true or p.is_department_head = true))
  );
drop policy if exists "관리자만 퀴즈 삭제" on quiz_questions;
create policy "관리자·부장 퀴즈 삭제" on quiz_questions
  for delete using (
    exists (select 1 from profiles p where p.user_id = auth.uid() and (p.is_admin = true or p.is_department_head = true))
  );

-- 이벤트 배너: 부장도 작성/삭제 가능
drop policy if exists "관리자만 이벤트 배너 작성" on home_banner;
create policy "관리자·부장 이벤트 배너 작성" on home_banner
  for insert with check (
    exists (select 1 from profiles p where p.user_id = auth.uid() and (p.is_admin = true or p.is_department_head = true))
  );
drop policy if exists "관리자만 이벤트 배너 삭제" on home_banner;
create policy "관리자·부장 이벤트 배너 삭제" on home_banner
  for delete using (
    exists (select 1 from profiles p where p.user_id = auth.uid() and (p.is_admin = true or p.is_department_head = true))
  );

-- 학생 기록(감사노트/기도제목/하루인사) 조회·삭제: 부장도 가능
create or replace function get_all_notes_admin(p_limit integer default 200)
returns table(id bigint, user_id uuid, nickname text, real_name text, type text, content text, created_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select n.id, n.user_id, p.nickname,
    case when exists (select 1 from profiles ap where ap.user_id = auth.uid() and ap.is_admin = true) then p.real_name else null end,
    n.type, n.content, n.created_at
  from notes n
  join profiles p on p.user_id = n.user_id
  where exists (
    select 1 from profiles admin_p where admin_p.user_id = auth.uid() and (admin_p.is_admin = true or admin_p.is_department_head = true)
  )
  order by n.created_at desc
  limit p_limit;
$$;

create or replace function admin_delete_note(p_note_id bigint)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from profiles where user_id = auth.uid() and (is_admin = true or is_department_head = true)
  ) then
    raise exception '교역자·부장만 삭제할 수 있습니다.';
  end if;

  delete from notes where id = p_note_id;
  return true;
end;
$$;

-- 달란트 부여: 부장도 가능
create or replace function admin_award_points(p_user_id uuid, p_points integer, p_note text default null)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from profiles p where p.user_id = auth.uid() and (p.is_admin = true or p.is_department_head = true)) then
    raise exception '교역자·부장만 달란트를 부여할 수 있습니다.';
  end if;
  if p_points is null or p_points = 0 then
    raise exception '0이 아닌 달란트를 입력해주세요.';
  end if;

  insert into points_ledger (user_id, action_type, points, ref_date, note, awarded_by)
  values (p_user_id, 'admin_award', p_points, (now() at time zone 'Asia/Seoul')::date, p_note, auth.uid());

  return true;
end;
$$;

create or replace function admin_award_group_points(p_group_id bigint, p_points integer, p_note text default null)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer := 0;
begin
  if not exists (select 1 from profiles p where p.user_id = auth.uid() and (p.is_admin = true or p.is_department_head = true)) then
    raise exception '교역자·부장만 달란트를 부여할 수 있습니다.';
  end if;
  if p_points is null or p_points = 0 then
    raise exception '0이 아닌 달란트를 입력해주세요.';
  end if;

  insert into points_ledger (user_id, action_type, points, ref_date, note, awarded_by)
  select gm.user_id, 'admin_award', p_points, (now() at time zone 'Asia/Seoul')::date, p_note, auth.uid()
  from group_members gm
  where gm.group_id = p_group_id;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- 회원 목록: 부장도 조회 가능하지만, 본명은 교역자에게만 보여준다
-- (반환 컬럼 구성은 그대로라 create or replace만 하면 되지만, 이미 여러 번 재정의된 함수라
-- 안전하게 drop 후 다시 만든다)
drop function if exists get_member_list();
create or replace function get_member_list()
returns table(
  user_id uuid,
  nickname text,
  real_name text,
  email text,
  is_admin boolean,
  is_teacher boolean,
  is_department_head boolean,
  joined_at timestamptz,
  last_sign_in_at timestamptz,
  last_note_type text,
  last_note_at timestamptz,
  total_points bigint
)
language sql
security definer
set search_path = public
as $$
  select
    p.user_id, p.nickname,
    case when exists (select 1 from profiles ap where ap.user_id = auth.uid() and ap.is_admin = true) then p.real_name else null end,
    u.email, p.is_admin, p.is_teacher, p.is_department_head, p.created_at, u.last_sign_in_at,
    (select n.type from notes n where n.user_id = p.user_id order by n.created_at desc limit 1) as last_note_type,
    (select n.created_at from notes n where n.user_id = p.user_id order by n.created_at desc limit 1) as last_note_at,
    (select coalesce(sum(pl.points), 0) from points_ledger pl where pl.user_id = p.user_id)::bigint as total_points
  from profiles p
  join auth.users u on u.id = p.user_id
  where exists (
    select 1 from profiles admin_p where admin_p.user_id = auth.uid() and (admin_p.is_admin = true or admin_p.is_department_head = true)
  )
  order by p.created_at desc;
$$;

-- 오이코스 목록: 부장도 조회 가능하지만, 만든 사람 본명은 교역자에게만 보여준다
drop function if exists get_all_groups_admin();
create or replace function get_all_groups_admin()
returns table(
  id bigint,
  name text,
  invite_code text,
  created_by_nickname text,
  created_by_real_name text,
  host_is_teacher boolean,
  member_count bigint,
  total_talents bigint,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    g.id, g.name, g.invite_code, p.nickname,
    case when exists (select 1 from profiles ap where ap.user_id = auth.uid() and ap.is_admin = true) then p.real_name else null end,
    coalesce(p.is_teacher, false),
    (select count(*) from group_members gm where gm.group_id = g.id),
    (select coalesce(sum(pl.points), 0)
       from group_members gm2
       join points_ledger pl on pl.user_id = gm2.user_id
       where gm2.group_id = g.id)::bigint,
    g.created_at
  from groups g
  join profiles p on p.user_id = g.created_by
  where exists (
    select 1 from profiles admin_p where admin_p.user_id = auth.uid() and (admin_p.is_admin = true or admin_p.is_department_head = true)
  )
  order by g.created_at desc;
$$;

-- 오이코스 멤버 명단: 부장도 (자기 소속이 아닌 오이코스까지) 조회 가능하지만, 본명은 여전히 교역자만
drop function if exists get_group_members(bigint);
create or replace function get_group_members(p_group_id bigint)
returns table(user_id uuid, nickname text, real_name text, joined_at timestamptz, is_host boolean)
language sql
security definer
set search_path = public
as $$
  select
    p.user_id, p.nickname,
    case
      when exists (select 1 from profiles ap where ap.user_id = auth.uid() and ap.is_admin = true)
      then p.real_name
      else null
    end as real_name,
    gm.joined_at, (g.created_by = p.user_id) as is_host
  from group_members gm
  join profiles p on p.user_id = gm.user_id
  join groups g on g.id = gm.group_id
  where gm.group_id = p_group_id
    and (
      exists (select 1 from group_members me where me.group_id = p_group_id and me.user_id = auth.uid())
      or exists (select 1 from profiles ap where ap.user_id = auth.uid() and (ap.is_admin = true or ap.is_department_head = true))
    )
  order by gm.joined_at asc;
$$;

-- 오이코스 달란트 순위: 부장도 조회 가능
create or replace function get_group_talent_rankings()
returns table(
  id bigint,
  name text,
  host_is_teacher boolean,
  member_count bigint,
  total_talents bigint
)
language sql
security definer
set search_path = public
as $$
  select
    g.id, g.name, coalesce(p.is_teacher, false),
    (select count(*) from group_members gm where gm.group_id = g.id)::bigint,
    (select coalesce(sum(pl.points), 0)
       from group_members gm2
       join points_ledger pl on pl.user_id = gm2.user_id
       where gm2.group_id = g.id)::bigint as total_talents
  from groups g
  join profiles p on p.user_id = g.created_by
  where (
    exists (select 1 from group_members me where me.user_id = auth.uid())
    or exists (select 1 from profiles ap where ap.user_id = auth.uid() and (ap.is_admin = true or ap.is_department_head = true))
  )
  order by total_talents desc, g.created_at asc
  limit 15;
$$;

-- 회원 상세보기(출석/기록/달란트 내역): 부장도 조회 가능 (본명은 노출되지 않는 데이터라 그대로 허용)
create or replace function get_member_notes_admin(p_user_id uuid, p_limit integer default 200)
returns table(id bigint, type text, content text, created_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select n.id, n.type, n.content, n.created_at
  from notes n
  where n.user_id = p_user_id
    and exists (select 1 from profiles ap where ap.user_id = auth.uid() and (ap.is_admin = true or ap.is_department_head = true))
  order by n.created_at desc
  limit p_limit;
$$;

create or replace function get_member_attendance_admin(p_user_id uuid)
returns table(attend_date date)
language sql
security definer
set search_path = public
as $$
  select a.date
  from attendance a
  where a.user_id = p_user_id
    and exists (select 1 from profiles ap where ap.user_id = auth.uid() and (ap.is_admin = true or ap.is_department_head = true))
  order by a.date desc;
$$;

create or replace function get_member_points_admin(p_user_id uuid)
returns table(id bigint, action_type text, points integer, note text, ref_date date, created_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select pl.id, pl.action_type, pl.points, pl.note, pl.ref_date, pl.created_at
  from points_ledger pl
  where pl.user_id = p_user_id
    and exists (select 1 from profiles ap where ap.user_id = auth.uid() and (ap.is_admin = true or ap.is_department_head = true))
  order by pl.created_at desc;
$$;
