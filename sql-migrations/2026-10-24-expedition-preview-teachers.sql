-- 가을 원정대 카드를 10/25 10:30 전에도 미리 보이게 할 계정(답사 동행 교사, 2026-10-24)
-- 관리자 권한은 주지 않는다 — 놀이터의 「🍁 가을 원정대」 카드만 미리 보인다
create table if not exists public.picnic_preview_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  note text,
  added_at timestamptz not null default now()
);
alter table public.picnic_preview_users enable row level security;

insert into public.picnic_preview_users (user_id, note) values
  ('6c07081f-26a6-4de6-ada5-85386fdd9b7e', '심보근 교사(계정 1)'),
  ('9322b749-34cb-40b7-9576-010554110675', '심보근 교사(계정 2)'),
  ('e2e50d54-19d2-4700-bd95-cbfb5da0f968', '안민서 교사'),
  ('2e19f9c9-97a4-4e66-becb-18a48696af2e', '김연우 교사')
on conflict (user_id) do nothing;

create or replace function public.can_see_expedition() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles p where p.user_id = auth.uid() and coalesce(p.is_admin, false))
      or exists (select 1 from picnic_preview_users u where u.user_id = auth.uid());
$$;
grant execute on function public.can_see_expedition() to anon, authenticated;

notify pgrst, 'reload schema';
