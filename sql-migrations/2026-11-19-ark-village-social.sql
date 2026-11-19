-- 나그네 마을: 마을 소식 · 선물 · 건축 사진 · 설계도 나누기 + 악기 블록(540~543) 허용. 코드 배포 뒤 적용한다.
-- 자유 글은 받지 않는다(소식은 종류+숫자, 사진 제목은 고르기). 모든 표는 직접 접근을 막고 함수로만 쓴다.
begin;

-- ── 허용 블록(누적): 개척지 목록 + 악기 4종 ──
create or replace function public._ark_block_ok(p_id int)
returns boolean language sql immutable as $$
  select p_id = any (array[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,124,125,126,127,128,130,133,134,135,136,137,138,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,196,197,198,199,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255,400,401,402,403,404,405,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,460,461,462,463,464,465,466,467,468,469,470,480,481,482,501,502,503,504,505,506,507,508,510,511,512,513,520,521,522,523,524,525,526,527,528,529,530,531,532,533,534,535,536,540,541,542,543]);
$$;

-- 차단 관계(서로 숨김)·친구 확인
create or replace function public._ark_hidden_pair(a uuid, b uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.ark_friend_blocks k where (k.owner_id = a and k.target_id = b) or (k.owner_id = b and k.target_id = a));
$$;
revoke all on function public._ark_hidden_pair(uuid, uuid) from public, anon, authenticated;

create or replace function public._ark_are_friends(a uuid, b uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.ark_friends f where f.accepted and ((f.sender = a and f.recipient = b) or (f.sender = b and f.recipient = a)));
$$;
revoke all on function public._ark_are_friends(uuid, uuid) from public, anon, authenticated;

-- ── 1. 마을 소식(종류+숫자만, 같은 소식은 10분에 한 번, 7일 보관) ──
create table if not exists public.ark_feed (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('ach','build','photo','plan','gift')),
  n int not null default 0 check (n between 0 and 10000),
  at timestamptz not null default now()
);
create index if not exists ark_feed_at_idx on public.ark_feed(at desc);
alter table public.ark_feed enable row level security;
revoke all on public.ark_feed from public, anon, authenticated;

create or replace function public.post_ark_feed(p_kind text, p_n int)
returns boolean language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if auth.uid() is null or not public.can_play_ark() then return false; end if;
  if p_kind not in ('ach','build','photo','plan','gift') or p_n is null or p_n not between 0 and 10000 then return false; end if;
  if exists (select 1 from public.ark_feed f where f.user_id = auth.uid() and f.kind = p_kind and f.n = p_n and f.at > now() - interval '10 minutes') then return false; end if;
  insert into public.ark_feed(user_id, kind, n) values (auth.uid(), p_kind, p_n);
  delete from public.ark_feed where at < now() - interval '7 days';
  return true;
end $$;
revoke all on function public.post_ark_feed(text, int) from public, anon;
grant execute on function public.post_ark_feed(text, int) to authenticated;

create or replace function public.get_ark_feed()
returns table(id bigint, nick text, kind text, n int, at timestamptz, mine boolean)
language sql stable security definer set search_path = public, pg_temp as $$
  select f.id, coalesce(nullif(p.nickname, ''), '나그네'), f.kind, f.n, f.at, f.user_id = auth.uid()
  from public.ark_feed f left join public.profiles p on p.user_id = f.user_id
  where public.can_play_ark() and f.at > now() - interval '3 days' and not public._ark_hidden_pair(auth.uid(), f.user_id)
  order by f.at desc limit 40;
$$;
revoke all on function public.get_ark_feed() from public, anon;
grant execute on function public.get_ark_feed() to authenticated;

-- ── 2. 선물(친구끼리, 하루 10번, 1~16개, 받을 사람 대기 30개까지) ──
create table if not exists public.ark_gifts (
  id bigserial primary key,
  sender uuid not null references auth.users(id) on delete cascade,
  recipient uuid not null references auth.users(id) on delete cascade,
  item int not null check (item between 1 and 999 and item <> 24),
  amount int not null check (amount between 1 and 16),
  at timestamptz not null default now(),
  claimed boolean not null default false,
  check (sender <> recipient)
);
create index if not exists ark_gifts_recipient_idx on public.ark_gifts(recipient) where not claimed;
alter table public.ark_gifts enable row level security;
revoke all on public.ark_gifts from public, anon, authenticated;

create or replace function public.send_ark_gift(p_to uuid, p_item int, p_amount int)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare me uuid := auth.uid();
begin
  if me is null or not public.can_play_ark() then return jsonb_build_object('error','login'); end if;
  if p_to is null or p_to = me or not public._ark_are_friends(me, p_to) or public._ark_hidden_pair(me, p_to) then return jsonb_build_object('error','friend'); end if;
  if p_item is null or p_item not between 1 and 999 or p_item = 24 or p_amount is null or p_amount not between 1 and 16 then return jsonb_build_object('error','item'); end if;
  perform pg_advisory_xact_lock(1924, 21);
  if (select count(*) from public.ark_gifts g where g.sender = me and g.at > now() - interval '1 day') >= 10 then return jsonb_build_object('error','daily'); end if;
  if (select count(*) from public.ark_gifts g where g.recipient = p_to and not g.claimed) >= 30 then return jsonb_build_object('error','full'); end if;
  insert into public.ark_gifts(sender, recipient, item, amount) values (me, p_to, p_item, p_amount);
  delete from public.ark_gifts where at < now() - interval '30 days';
  return jsonb_build_object('ok', true);
end $$;
revoke all on function public.send_ark_gift(uuid, int, int) from public, anon;
grant execute on function public.send_ark_gift(uuid, int, int) to authenticated;

create or replace function public.get_ark_gifts()
returns table(id bigint, nick text, item int, amount int, at timestamptz)
language sql stable security definer set search_path = public, pg_temp as $$
  select g.id, coalesce(nullif(p.nickname, ''), '나그네'), g.item, g.amount, g.at
  from public.ark_gifts g left join public.profiles p on p.user_id = g.sender
  where public.can_play_ark() and g.recipient = auth.uid() and not g.claimed
  order by g.at limit 30;
$$;
revoke all on function public.get_ark_gifts() from public, anon;
grant execute on function public.get_ark_gifts() to authenticated;

create or replace function public.claim_ark_gift(p_id bigint)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare r public.ark_gifts%rowtype;
begin
  if auth.uid() is null or not public.can_play_ark() then return jsonb_build_object('error','login'); end if;
  update public.ark_gifts g set claimed = true where g.id = p_id and g.recipient = auth.uid() and not g.claimed returning * into r;
  if not found then return jsonb_build_object('error','gone'); end if;
  return jsonb_build_object('item', r.item, 'amount', r.amount);
end $$;
revoke all on function public.claim_ark_gift(bigint) from public, anon;
grant execute on function public.claim_ark_gift(bigint) to authenticated;

-- ── 3. 건축 사진(게임 화면만, 한 사람 3장, 제목은 고르기, 30일) ──
create table if not exists public.ark_photos (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  img text not null check (char_length(img) <= 120000 and img like 'data:image/jpeg;base64,%'),
  caption smallint not null default 0 check (caption between 0 and 9),
  at timestamptz not null default now()
);
create index if not exists ark_photos_at_idx on public.ark_photos(at desc);
create table if not exists public.ark_photo_likes (
  photo_id bigint not null references public.ark_photos(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (photo_id, user_id)
);
alter table public.ark_photos enable row level security;
alter table public.ark_photo_likes enable row level security;
revoke all on public.ark_photos, public.ark_photo_likes from public, anon, authenticated;

create or replace function public.post_ark_photo(p_img text, p_caption int)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare me uuid := auth.uid(); nid bigint;
begin
  if me is null or not public.can_play_ark() then return jsonb_build_object('error','login'); end if;
  if p_img is null or char_length(p_img) > 120000 or p_img !~ '^data:image/jpeg;base64,[A-Za-z0-9+/=]+$' then return jsonb_build_object('error','image'); end if;
  if p_caption is null or p_caption not between 0 and 9 then return jsonb_build_object('error','caption'); end if;
  if exists (select 1 from public.ark_photos f where f.user_id = me and f.at > now() - interval '2 minutes') then return jsonb_build_object('error','wait'); end if;
  insert into public.ark_photos(user_id, img, caption) values (me, p_img, p_caption) returning id into nid;
  delete from public.ark_photos where user_id = me and id not in (select x.id from public.ark_photos x where x.user_id = me order by x.at desc limit 3);
  delete from public.ark_photos where at < now() - interval '30 days';
  return jsonb_build_object('ok', true, 'id', nid);
end $$;
revoke all on function public.post_ark_photo(text, int) from public, anon;
grant execute on function public.post_ark_photo(text, int) to authenticated;

create or replace function public.get_ark_photos()
returns table(id bigint, nick text, caption int, at timestamptz, likes int, liked boolean, mine boolean)
language sql stable security definer set search_path = public, pg_temp as $$
  select f.id, coalesce(nullif(p.nickname, ''), '나그네'), f.caption::int, f.at,
    (select count(*)::int from public.ark_photo_likes l where l.photo_id = f.id),
    exists (select 1 from public.ark_photo_likes l where l.photo_id = f.id and l.user_id = auth.uid()),
    f.user_id = auth.uid()
  from public.ark_photos f left join public.profiles p on p.user_id = f.user_id
  where public.can_play_ark() and f.at > now() - interval '30 days' and not public._ark_hidden_pair(auth.uid(), f.user_id)
  order by f.at desc limit 30;
$$;
revoke all on function public.get_ark_photos() from public, anon;
grant execute on function public.get_ark_photos() to authenticated;

create or replace function public.get_ark_photo_img(p_id bigint)
returns text language sql stable security definer set search_path = public, pg_temp as $$
  select f.img from public.ark_photos f where f.id = p_id and public.can_play_ark() and not public._ark_hidden_pair(auth.uid(), f.user_id);
$$;
revoke all on function public.get_ark_photo_img(bigint) from public, anon;
grant execute on function public.get_ark_photo_img(bigint) to authenticated;

create or replace function public.like_ark_photo(p_id bigint)
returns boolean language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if auth.uid() is null or not public.can_play_ark() then return null; end if;
  if not exists (select 1 from public.ark_photos f where f.id = p_id and not public._ark_hidden_pair(auth.uid(), f.user_id)) then return null; end if;
  if exists (select 1 from public.ark_photo_likes l where l.photo_id = p_id and l.user_id = auth.uid()) then
    delete from public.ark_photo_likes l where l.photo_id = p_id and l.user_id = auth.uid(); return false;
  end if;
  insert into public.ark_photo_likes(photo_id, user_id) values (p_id, auth.uid()); return true;
end $$;
revoke all on function public.like_ark_photo(bigint) from public, anon;
grant execute on function public.like_ark_photo(bigint) to authenticated;

create or replace function public.remove_ark_photo(p_id bigint)
returns boolean language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if auth.uid() is null then return false; end if;
  delete from public.ark_photos f where f.id = p_id and (f.user_id = auth.uid() or public.is_ark_admin());
  return found;
end $$;
revoke all on function public.remove_ark_photo(bigint) from public, anon;
grant execute on function public.remove_ark_photo(bigint) to authenticated;

-- ── 4. 설계도 나누기(한 사람 하나, 나와 친구만 볼 수 있음) ──
create table if not exists public.ark_plans (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name smallint not null default 0 check (name between 0 and 9),
  cells text not null check (char_length(cells) <= 40000 and cells ~ '^[0-9.;]*$'),
  w smallint not null check (w between 1 and 26), l smallint not null check (l between 1 and 26), h smallint not null check (h between 1 and 40),
  updated_at timestamptz not null default now()
);
alter table public.ark_plans enable row level security;
revoke all on public.ark_plans from public, anon, authenticated;

create or replace function public.save_ark_plan(p_name int, p_cells text, p_w int, p_l int, p_h int)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if auth.uid() is null or not public.can_play_ark() then return jsonb_build_object('error','login'); end if;
  if p_name is null or p_name not between 0 and 9 or p_cells is null or char_length(p_cells) > 40000 or p_cells !~ '^[0-9.;]*$'
     or p_w is null or p_w not between 1 and 26 or p_l is null or p_l not between 1 and 26 or p_h is null or p_h not between 1 and 40 then
    return jsonb_build_object('error','plan');
  end if;
  insert into public.ark_plans(user_id, name, cells, w, l, h) values (auth.uid(), p_name, p_cells, p_w, p_l, p_h)
    on conflict (user_id) do update set name = excluded.name, cells = excluded.cells, w = excluded.w, l = excluded.l, h = excluded.h, updated_at = now();
  return jsonb_build_object('ok', true);
end $$;
revoke all on function public.save_ark_plan(int, text, int, int, int) from public, anon;
grant execute on function public.save_ark_plan(int, text, int, int, int) to authenticated;

create or replace function public.get_ark_plans()
returns table(owner uuid, nick text, name int, w int, l int, h int, updated_at timestamptz, mine boolean)
language sql stable security definer set search_path = public, pg_temp as $$
  select a.user_id, coalesce(nullif(p.nickname, ''), '나그네'), a.name::int, a.w::int, a.l::int, a.h::int, a.updated_at, a.user_id = auth.uid()
  from public.ark_plans a left join public.profiles p on p.user_id = a.user_id
  where public.can_play_ark() and (a.user_id = auth.uid() or (public._ark_are_friends(auth.uid(), a.user_id) and not public._ark_hidden_pair(auth.uid(), a.user_id)))
  order by a.user_id = auth.uid() desc, a.updated_at desc limit 40;
$$;
revoke all on function public.get_ark_plans() from public, anon;
grant execute on function public.get_ark_plans() to authenticated;

create or replace function public.get_ark_plan(p_owner uuid)
returns text language sql stable security definer set search_path = public, pg_temp as $$
  select a.cells from public.ark_plans a
  where a.user_id = p_owner and public.can_play_ark()
    and (a.user_id = auth.uid() or (public._ark_are_friends(auth.uid(), a.user_id) and not public._ark_hidden_pair(auth.uid(), a.user_id)));
$$;
revoke all on function public.get_ark_plan(uuid) from public, anon;
grant execute on function public.get_ark_plan(uuid) to authenticated;

commit;
