-- 2026-09-06 달란트 상점 "상품 추천함"
-- 학생이 "이런 상품 있으면 좋겠어요"를 적어서 보내면 교역자·부장이 상점 관리에서 확인,
-- 상태(검토 중 / 추가함 / 반려)를 바꿔주면 학생 화면에도 그 상태가 보인다.
--
-- Supabase 대시보드 → SQL Editor에 붙여넣고 Run. 마지막 status 줄이 뜨면 성공.

create table if not exists shop_suggestions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  status text not null default 'open' check (status in ('open', 'reviewing', 'added', 'declined')),
  admin_note text,
  created_at timestamptz not null default now()
);
alter table shop_suggestions enable row level security;

drop policy if exists "본인·관리자 추천 조회" on shop_suggestions;
create policy "본인·관리자 추천 조회" on shop_suggestions
  for select using (
    auth.uid() = user_id
    or exists (select 1 from profiles p where p.user_id = auth.uid() and (p.is_admin or p.is_department_head))
  );

drop policy if exists "본인 추천 작성" on shop_suggestions;
create policy "본인 추천 작성" on shop_suggestions
  for insert with check (auth.uid() = user_id);

drop policy if exists "본인 추천 삭제" on shop_suggestions;
create policy "본인 추천 삭제" on shop_suggestions
  for delete using (auth.uid() = user_id);

-- 학생: 추천 보내기 (한 사람 하루 5건까지)
create or replace function submit_shop_suggestion(p_content text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_text text := nullif(trim(p_content), '');
  v_today_count integer;
  v_id bigint;
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;
  if v_text is null then raise exception '내용을 입력해주세요.'; end if;
  if length(v_text) > 500 then raise exception '너무 길어요. 500자 이내로 적어주세요.'; end if;

  select count(*) into v_today_count
  from shop_suggestions
  where user_id = auth.uid()
    and created_at >= (now() at time zone 'Asia/Seoul')::date;
  if v_today_count >= 5 then raise exception '오늘은 이미 여러 번 보냈어요. 내일 다시 보내주세요.'; end if;

  insert into shop_suggestions (user_id, content) values (auth.uid(), v_text) returning id into v_id;
  return v_id;
end;
$$;

-- 학생: 내가 보낸 추천
create or replace function get_my_shop_suggestions()
returns table(id bigint, content text, status text, admin_note text, created_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select s.id, s.content, s.status, s.admin_note, s.created_at
  from shop_suggestions s
  where s.user_id = auth.uid()
  order by s.created_at desc;
$$;

-- 관리자·부장: 전체 추천 목록 (미처리 먼저)
create or replace function get_shop_suggestions_admin(p_status text default null)
returns table(id bigint, user_id uuid, nickname text, content text, status text, admin_note text, created_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select s.id, s.user_id, pr.nickname, s.content, s.status, s.admin_note, s.created_at
  from shop_suggestions s
  join profiles pr on pr.user_id = s.user_id
  where exists (select 1 from profiles p where p.user_id = auth.uid() and (p.is_admin or p.is_department_head))
    and (p_status is null or s.status = p_status)
  order by (s.status = 'open') desc, s.created_at desc
  limit 200;
$$;

-- 관리자·부장: 추천 상태 변경
create or replace function update_shop_suggestion(p_id bigint, p_status text, p_note text default null)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from profiles p where p.user_id = auth.uid() and (p.is_admin or p.is_department_head)) then
    raise exception '권한이 없어요.';
  end if;
  if p_status not in ('open', 'reviewing', 'added', 'declined') then
    raise exception '잘못된 상태예요.';
  end if;
  update shop_suggestions
    set status = p_status, admin_note = nullif(trim(p_note), '')
  where id = p_id;
  return true;
end;
$$;

select 'shop_suggestions 테이블 + 함수 4개 생성 완료' as status;
