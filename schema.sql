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

  insert into group_members (group_id, user_id)
  values (v_group.id, auth.uid())
  on conflict (group_id, user_id) do nothing;

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
  on conflict (user_id, action_type, ref_date) do nothing;

  while exists (select 1 from attendance where user_id = new.user_id and date = v_check) loop
    v_streak := v_streak + 1;
    v_check := v_check - 1;
  end loop;

  if v_streak % 7 = 0 then
    insert into points_ledger (user_id, action_type, points, ref_date)
    values (new.user_id, 'streak_bonus', 1, new.date)
    on conflict (user_id, action_type, ref_date) do nothing;
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
    on conflict (user_id, action_type, ref_date) do nothing;
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

create or replace function get_member_list()
returns table(
  user_id uuid,
  nickname text,
  email text,
  is_admin boolean,
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
    p.user_id, p.nickname, u.email, p.is_admin, p.created_at, u.last_sign_in_at,
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
create or replace function get_all_notes_admin(p_limit integer default 200)
returns table(id bigint, user_id uuid, nickname text, type text, content text, created_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select n.id, n.user_id, p.nickname, n.type, n.content, n.created_at
  from notes n
  join profiles p on p.user_id = n.user_id
  where exists (
    select 1 from profiles admin_p where admin_p.user_id = auth.uid() and admin_p.is_admin = true
  )
  order by n.created_at desc
  limit p_limit;
$$;

-- 관리자 전용: 기록 삭제 (부적절한 내용 등을 관리자가 지울 수 있도록)
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
-- 2) 그룹원 전원이 그 주에 감사노트+기도제목을 합쳐 3개 이상 썼으면 전원에게 +2점
-- 서버에 정해진 시간마다 도는 스케줄러가 없으므로, 그룹원 아무나 마이페이지를 열 때
-- "지난주(가장 최근에 끝난 월~일)" 조건을 확인해서 정산하는 방식으로 동작한다.
-- points_ledger의 unique(user_id, action_type, ref_date) 덕분에 같은 주는 중복 지급되지 않는다.
alter table points_ledger drop constraint if exists points_ledger_action_type_check;
alter table points_ledger add constraint points_ledger_action_type_check
  check (action_type in ('attendance', 'streak_bonus', 'note', 'quiz', 'group_attendance_bonus', 'group_notes_bonus'));

create or replace function evaluate_group_weekly_bonus(p_group_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_week_start date := date_trunc('week', current_date)::date - 7;
  v_week_end date := date_trunc('week', current_date)::date - 1;
  v_member_count int;
  v_attended_count int;
  v_notes_ok_count int;
begin
  if not exists (select 1 from group_members where group_id = p_group_id and user_id = auth.uid()) then
    return;
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

  select count(*) into v_notes_ok_count
  from group_members gm
  where gm.group_id = p_group_id
    and (
      select count(*) from notes n
      where n.user_id = gm.user_id
        and n.type in ('gratitude', 'prayer')
        and (n.created_at at time zone 'Asia/Seoul')::date between v_week_start and v_week_end
    ) >= 3;

  if v_attended_count::numeric / v_member_count >= 0.8 then
    insert into points_ledger (user_id, action_type, points, ref_date)
    select gm.user_id, 'group_attendance_bonus', 1, v_week_start
    from group_members gm where gm.group_id = p_group_id
    on conflict (user_id, action_type, ref_date) do nothing;
  end if;

  if v_notes_ok_count = v_member_count then
    insert into points_ledger (user_id, action_type, points, ref_date)
    select gm.user_id, 'group_notes_bonus', 2, v_week_start
    from group_members gm where gm.group_id = p_group_id
    on conflict (user_id, action_type, ref_date) do nothing;
  end if;
end;
$$;
