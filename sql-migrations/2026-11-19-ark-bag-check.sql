-- 2026-11-19 나그네 마을: 가방 숫자 서버 확인
-- 가방(i:)과 상자(c:)는 내 땅 기록 ark_village_plots.data에 함께 저장된다.
-- 휴대폰이 보낸 숫자를 그대로 믿지 않고, 한 번 저장할 때 물건이 갑자기 너무 많이 늘었으면
--   1) 아주 심한 경우(한 가지가 2000개 넘게, 또는 모두 합쳐 5000개 넘게 늘어남)는 가방·상자만 직전 값으로 되돌리고(블록은 그대로 저장)
--   2) 조금 의심스러운 경우는 되돌리지 않고 기록만 남긴다(공동 궤에서 꺼내기·선물처럼 정상인 경우가 있어 학생 물건을 잃게 하지 않음)
-- 선생님(관리자)과 서버 함수(관리자 편집 등)가 바꾸는 것은 검사하지 않는다. 다시 실행해도 안전.

alter table public.ark_village_plots add column if not exists bag_note text;

create table if not exists public.ark_bag_flags (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  gain int not null,          -- 이번 저장에서 늘어난 물건 수(모두 합)
  top_item int,               -- 가장 많이 늘어난 물건 번호
  top_gain int,
  allow int not null,         -- 시간으로 계산한 허용치
  reverted boolean not null default false,
  at timestamptz not null default now()
);
alter table public.ark_bag_flags enable row level security;
drop policy if exists ark_bag_flags_admin_read on public.ark_bag_flags;
create policy ark_bag_flags_admin_read on public.ark_bag_flags for select to authenticated
  using (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.is_admin));

-- 기록 문자열에서 물건 수 뽑기: 가방 「번호.개수[.닳음]」를 쉼표로, 상자 「자리=번호:개수;…」를 /로
create or replace function public._ark_items(p_data text)
returns table(id int, n bigint) language sql immutable as $$
  with seg as (
    select substring(coalesce(p_data, '') from '\|i:([^|]*)') bag, substring(coalesce(p_data, '') from '\|c:([^|]*)') chest
  ), parts as (
    select split_part(x, '.', 1) a, split_part(x, '.', 2) b from seg, regexp_split_to_table(coalesce(seg.bag, ''), ',') x
    union all
    select split_part(y, ':', 1), split_part(y, ':', 2)
      from seg, regexp_split_to_table(coalesce(seg.chest, ''), '/') c, regexp_split_to_table(split_part(c, '=', 2), ';') y
  )
  select a::int, sum(least(b::bigint, 9999)) from parts
  where a ~ '^[0-9]{1,5}$' and b ~ '^[0-9]{1,6}$' group by a::int;
$$;

-- 새 기록의 가방·상자 부분만 옛 기록 것으로 바꾸기
create or replace function public._ark_keep_bag(p_new text, p_old text)
returns text language plpgsql immutable as $$
declare r text := p_new; ob text := substring(coalesce(p_old, '') from '\|i:([^|]*)'); oc text := substring(coalesce(p_old, '') from '\|c:([^|]*)');
begin
  r := regexp_replace(r, '\|i:[^|]*', '|i:' || replace(coalesce(ob, ''), '\', '\\'));
  r := regexp_replace(r, '\|c:[^|]*', '');
  if oc is not null and oc <> '' then r := regexp_replace(r, '(\|i:[^|]*)', '\1|c:' || replace(oc, '\', '\\')); end if;
  return r;
end $$;

create or replace function public._ark_bag_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare total bigint; ti int; tg bigint; secs numeric; allow bigint; bad boolean;
begin
  new.bag_note := null;
  if auth.uid() is null or new.user_id is distinct from auth.uid() then return new; end if;   -- 서버·관리자 함수
  if exists (select 1 from profiles where user_id = auth.uid() and is_admin) then return new; end if;
  if tg_op = 'UPDATE' and new.data is not distinct from old.data then return new; end if;
  with o as (select * from public._ark_items(case when tg_op = 'UPDATE' then old.data end)),
       nw as (select * from public._ark_items(new.data)),
       d as (select nw.id, greatest(0, nw.n - coalesce(o.n, 0)) g from nw left join o on o.id = nw.id)
  select coalesce(sum(g), 0), (array_agg(id order by g desc))[1], coalesce(max(g), 0) into total, ti, tg from d;
  secs := case when tg_op = 'UPDATE' then greatest(0, extract(epoch from (now() - old.updated_at))) else 0 end;
  allow := 400 + least(secs, 900) * 8;
  bad := tg > 2000 or total > 5000;
  if bad or total > allow then
    insert into ark_bag_flags(user_id, gain, top_item, top_gain, allow, reverted) values (new.user_id, least(total, 2000000000), ti, least(tg, 2000000000), allow, bad);
    delete from ark_bag_flags where at < now() - interval '60 days';
  end if;
  if bad then
    new.data := public._ark_keep_bag(new.data, case when tg_op = 'UPDATE' then old.data end);
    new.bag_note := 'reverted';
  end if;
  return new;
end $$;

drop trigger if exists ark_bag_guard on public.ark_village_plots;
create trigger ark_bag_guard before insert or update of data on public.ark_village_plots
  for each row execute function public._ark_bag_guard();

-- 선생님용: 최근 의심 기록(닉네임과 함께)
create or replace function public.get_ark_bag_flags()
returns table(nick text, gain int, top_item int, top_gain int, allow int, reverted boolean, at timestamptz)
language sql stable security definer set search_path = public as $$
  select p.nickname, f.gain, f.top_item, f.top_gain, f.allow, f.reverted, f.at
  from ark_bag_flags f left join profiles p on p.user_id = f.user_id
  where exists (select 1 from profiles a where a.user_id = auth.uid() and a.is_admin)
  order by f.at desc limit 100;
$$;
revoke all on function public.get_ark_bag_flags() from public, anon;
grant execute on function public.get_ark_bag_flags() to authenticated;

select 'ok — ark bag check' as status;
