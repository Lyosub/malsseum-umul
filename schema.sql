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
