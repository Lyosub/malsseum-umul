-- 2026-09-06 하루인사/감사노트/기도제목/자유게시판(글·댓글) 이미지 첨부 + 본문 링크
--
-- 이미지는 Storage 버킷 'post-images'(공개)에 올리고, 공개 URL 배열을 image_urls(text[])에 저장.
-- 링크 자동연결은 클라이언트(post-media.js)에서만 처리하므로 이 마이그레이션은 이미지용.
--
-- Supabase 대시보드 → SQL Editor에 붙여넣고 Run. 마지막 status 줄이 뜨면 성공.
-- (Storage 정책 부분이 권한 문제로 실패하면, 대시보드 Storage → post-images → Policies 에서
--  아래와 같은 정책 3개를 클릭으로 만들어도 된다.)

-- 1) 컬럼 추가 -----------------------------------------------------------------
alter table notes           add column if not exists image_urls text[] not null default '{}';
alter table board_posts     add column if not exists image_urls text[] not null default '{}';
alter table board_comments  add column if not exists image_urls text[] not null default '{}';

-- 2) Storage 버킷 + 정책 -----------------------------------------------------
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do update set public = true;

drop policy if exists "post-images 공개 읽기" on storage.objects;
create policy "post-images 공개 읽기" on storage.objects
  for select using (bucket_id = 'post-images');

drop policy if exists "post-images 본인 폴더 업로드" on storage.objects;
create policy "post-images 본인 폴더 업로드" on storage.objects
  for insert with check (
    bucket_id = 'post-images'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "post-images 본인 파일 삭제" on storage.objects;
create policy "post-images 본인 파일 삭제" on storage.objects
  for delete using (
    bucket_id = 'post-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- 3) 이미지 URL을 함께 내려주도록 RPC 재정의 --------------------------------
-- (RETURNS TABLE 시그니처가 바뀌므로 drop 후 재생성)

drop function if exists get_public_notes(integer);
create or replace function get_public_notes(p_limit integer default 60)
returns table(id bigint, type text, content text, image_urls text[], created_at timestamptz, nickname text)
language sql
security definer
set search_path = public
as $$
  select
    n.id, n.type, n.content, n.image_urls, n.created_at,
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

drop function if exists get_all_notes_admin(integer);
create or replace function get_all_notes_admin(p_limit integer default 200)
returns table(id bigint, user_id uuid, nickname text, real_name text, type text, content text, image_urls text[], created_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select n.id, n.user_id,
    case when n.type = 'suggestion' then null else p.nickname end,
    case
      when n.type = 'suggestion' then null
      when exists (select 1 from profiles ap where ap.user_id = auth.uid() and ap.is_admin = true) then p.real_name
      else null
    end,
    n.type, n.content, n.image_urls, n.created_at
  from notes n
  join profiles p on p.user_id = n.user_id
  where exists (
    select 1 from profiles admin_p where admin_p.user_id = auth.uid() and (admin_p.is_admin = true or admin_p.is_department_head = true)
  )
  order by n.created_at desc
  limit p_limit;
$$;

drop function if exists get_member_notes_admin(uuid, integer);
create or replace function get_member_notes_admin(p_user_id uuid, p_limit integer default 200)
returns table(id bigint, type text, content text, image_urls text[], created_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select n.id, n.type, n.content, n.image_urls, n.created_at
  from notes n
  where n.user_id = p_user_id
    and n.type <> 'suggestion'
    and exists (select 1 from profiles ap where ap.user_id = auth.uid() and (ap.is_admin = true or ap.is_department_head = true))
  order by n.created_at desc
  limit p_limit;
$$;

drop function if exists get_board_posts(integer);
create or replace function get_board_posts(p_limit integer default 100)
returns table(id bigint, user_id uuid, nickname text, content text, image_urls text[], created_at timestamptz, comment_count bigint)
language sql
security definer
set search_path = public
as $$
  select bp.id, bp.user_id, p.nickname, bp.content, bp.image_urls, bp.created_at,
    (select count(*) from board_comments bc where bc.post_id = bp.id) as comment_count
  from board_posts bp
  join profiles p on p.user_id = bp.user_id
  where auth.uid() is not null
  order by bp.created_at desc
  limit p_limit;
$$;

drop function if exists get_board_comments(bigint);
create or replace function get_board_comments(p_post_id bigint)
returns table(id bigint, user_id uuid, nickname text, content text, image_urls text[], created_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select bc.id, bc.user_id, p.nickname, bc.content, bc.image_urls, bc.created_at
  from board_comments bc
  join profiles p on p.user_id = bc.user_id
  where auth.uid() is not null and bc.post_id = p_post_id
  order by bc.created_at asc;
$$;

select 'post-images 버킷/정책 + image_urls 컬럼 + RPC 갱신 완료' as status;
