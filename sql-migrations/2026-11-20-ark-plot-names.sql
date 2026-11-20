-- 2026-11-20 나그네 마을: 땅 팻말 글(주인이 직접 씀) — 16자, 채팅과 같은 금칙어 검사(_ark_bad_text)·말하기 금지면 못 씀, 관리자가 지울 수 있음
begin;

create table if not exists public.ark_plot_names (
  user_id uuid primary key references auth.users(id) on delete cascade,
  body text not null,
  updated_at timestamptz not null default now()
);
alter table public.ark_plot_names enable row level security;
revoke all on public.ark_plot_names from anon, authenticated;

create or replace function public.set_ark_plot_name(p_body text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare b text; mu timestamptz;
begin
  if not public.can_play_ark() then return jsonb_build_object('error', 'login'); end if;
  b := btrim(regexp_replace(coalesce(p_body, ''), '[[:cntrl:]]', ' ', 'g'));
  b := regexp_replace(b, '\s{2,}', ' ', 'g');
  if b = '' then delete from ark_plot_names where user_id = auth.uid(); return jsonb_build_object('ok', true, 'cleared', true); end if;
  if char_length(b) > 16 then return jsonb_build_object('error', 'long'); end if;
  select until into mu from ark_chat_mutes where user_id = auth.uid();
  if mu is not null and mu > now() then return jsonb_build_object('error', 'muted', 'until', mu); end if;
  if exists (select 1 from ark_plot_names where user_id = auth.uid() and updated_at > now() - interval '10 seconds') then
    return jsonb_build_object('error', 'slow');
  end if;
  if public._ark_bad_text(b) then
    insert into ark_chat_blocked(user_id, body) values (auth.uid(), '[팻말] ' || b);
    return jsonb_build_object('error', 'bad');
  end if;
  insert into ark_plot_names(user_id, body, updated_at) values (auth.uid(), b, now())
    on conflict (user_id) do update set body = excluded.body, updated_at = now();
  return jsonb_build_object('ok', true);
end;
$$;
revoke all on function public.set_ark_plot_name(text) from public, anon;
grant execute on function public.set_ark_plot_name(text) to authenticated;

create or replace function public.get_ark_plot_names()
returns table(user_id uuid, body text)
language sql stable security definer set search_path = public as $$
  select n.user_id, n.body from ark_plot_names n where public.can_play_ark();
$$;
revoke all on function public.get_ark_plot_names() from public, anon;
grant execute on function public.get_ark_plot_names() to authenticated;

create or replace function public.admin_clear_ark_plot_name(p_user uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not public.is_ark_admin() then return false; end if;
  delete from ark_plot_names where user_id = p_user;
  return true;
end;
$$;
revoke all on function public.admin_clear_ark_plot_name(uuid) from public, anon;
grant execute on function public.admin_clear_ark_plot_name(uuid) to authenticated;

commit;
