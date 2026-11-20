-- 2026-11-20 나그네 마을: ① 건의하기(학생 → 관리자) ② 팻말 글 신고(3명이면 가림, 주인이 새로 쓰면 다시 셈)
begin;

-- ① 건의하기: 300자, 1분에 한 번·하루 10번, 관리자만 읽음, 180일 지나면 지움
create table if not exists public.ark_feedback (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  nick text,
  body text not null,
  x int, z int,
  ua text,
  handled boolean not null default false,
  at timestamptz not null default now()
);
create index if not exists ark_feedback_at on public.ark_feedback(at desc);
alter table public.ark_feedback enable row level security;
revoke all on public.ark_feedback from anon, authenticated;

create or replace function public.send_ark_feedback(p_body text, p_x int, p_z int, p_ua text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare b text; nk text;
begin
  if not public.can_play_ark() then return jsonb_build_object('error', 'login'); end if;
  b := btrim(regexp_replace(coalesce(p_body, ''), '[[:cntrl:]]', ' ', 'g'));
  b := regexp_replace(b, '\s{2,}', ' ', 'g');
  if char_length(b) < 2 then return jsonb_build_object('error', 'empty'); end if;
  if char_length(b) > 300 then return jsonb_build_object('error', 'long'); end if;
  if exists (select 1 from ark_feedback where user_id = auth.uid() and at > now() - interval '1 minute') then return jsonb_build_object('error', 'slow'); end if;
  if (select count(*) from ark_feedback where user_id = auth.uid() and at > now() - interval '1 day') >= 10 then return jsonb_build_object('error', 'many'); end if;
  select nickname into nk from profiles where user_id = auth.uid();
  insert into ark_feedback(user_id, nick, body, x, z, ua) values (auth.uid(), nk, b,
    case when p_x between 0 and 2047 then p_x end, case when p_z between 0 and 2047 then p_z end, left(coalesce(p_ua, ''), 200));
  delete from ark_feedback where at < now() - interval '180 days';
  return jsonb_build_object('ok', true);
end;
$$;
revoke all on function public.send_ark_feedback(text, int, int, text) from public, anon;
grant execute on function public.send_ark_feedback(text, int, int, text) to authenticated;

create or replace function public.list_ark_feedback(p_all boolean)
returns table(id bigint, nick text, body text, x int, z int, ua text, handled boolean, at timestamptz)
language sql stable security definer set search_path = public as $$
  select f.id, f.nick, f.body, f.x, f.z, f.ua, f.handled, f.at from ark_feedback f
  where public.is_ark_admin() and (p_all or not f.handled) order by f.at desc limit 100;
$$;
revoke all on function public.list_ark_feedback(boolean) from public, anon;
grant execute on function public.list_ark_feedback(boolean) to authenticated;

create or replace function public.mark_ark_feedback(p_id bigint, p_handled boolean)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not public.is_ark_admin() then return false; end if;
  update ark_feedback set handled = coalesce(p_handled, true) where id = p_id;
  return found;
end;
$$;
revoke all on function public.mark_ark_feedback(bigint, boolean) from public, anon;
grant execute on function public.mark_ark_feedback(bigint, boolean) to authenticated;

-- ② 팻말 글 신고: 서로 다른 3명이 신고하면(그 글을 쓴 뒤로) 가림 → 「이름님의 땅」으로 보임
create table if not exists public.ark_plot_name_reports (
  target uuid not null references auth.users(id) on delete cascade,
  reporter uuid not null references auth.users(id) on delete cascade,
  at timestamptz not null default now(),
  primary key (target, reporter)
);
alter table public.ark_plot_name_reports enable row level security;
revoke all on public.ark_plot_name_reports from anon, authenticated;

create or replace function public.report_ark_plot_name(p_target uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  if not public.can_play_ark() then return jsonb_build_object('error', 'login'); end if;
  if p_target = auth.uid() then return jsonb_build_object('error', 'self'); end if;
  if not exists (select 1 from ark_plot_names where user_id = p_target) then return jsonb_build_object('error', 'none'); end if;
  insert into ark_plot_name_reports(target, reporter, at) values (p_target, auth.uid(), now())
    on conflict (target, reporter) do update set at = now();
  return jsonb_build_object('ok', true);
end;
$$;
revoke all on function public.report_ark_plot_name(uuid) from public, anon;
grant execute on function public.report_ark_plot_name(uuid) to authenticated;

-- 가려진 글은 목록에서 빠짐(관리자는 hidden 표시와 함께 봄)
drop function if exists public.get_ark_plot_names();
create or replace function public.get_ark_plot_names()
returns table(user_id uuid, body text, hidden boolean)
language sql stable security definer set search_path = public as $$
  select n.user_id, n.body, h.c >= 3
  from ark_plot_names n
  cross join lateral (select count(*) c from ark_plot_name_reports r where r.target = n.user_id and r.at > n.updated_at) h
  where public.can_play_ark() and (h.c < 3 or public.is_ark_admin());
$$;
revoke all on function public.get_ark_plot_names() from public, anon;
grant execute on function public.get_ark_plot_names() to authenticated;

commit;
