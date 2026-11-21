-- 2026-11-21 나그네 마을: 다른 사람이 버린 물건도 5분 뒤 사라짐(15분 → 5분, 캔 것과 같게)

CREATE OR REPLACE FUNCTION public.get_ark_drops(p_x real, p_z real)
 RETURNS TABLE(id bigint, x real, y real, z real, item integer, amount integer, mine boolean, age_s integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  select d.id, d.x, d.y, d.z, d.item, d.amount, d.by_user = auth.uid(), extract(epoch from now() - d.at)::int
  from public.ark_drops d
  where public.can_play_ark() and d.at > now() - interval '5 minutes'
    and abs(d.x - p_x) <= 64 and abs(d.z - p_z) <= 64
  order by d.at desc limit 80;
$function$;

CREATE OR REPLACE FUNCTION public.take_ark_drop(p_id bigint)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare r public.ark_drops%rowtype;
begin
  if auth.uid() is null or not public.can_play_ark() then return jsonb_build_object('error','login'); end if;
  delete from public.ark_drops d where d.id = p_id and d.at > now() - interval '5 minutes' returning * into r;
  if not found then return jsonb_build_object('error','gone'); end if;
  return jsonb_build_object('item', r.item, 'amount', r.amount);
end $function$;

CREATE OR REPLACE FUNCTION public.drop_ark_item(p_x real, p_y real, p_z real, p_item integer, p_amount integer)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare nid bigint;
begin
  if auth.uid() is null or not public.can_play_ark() then return -1; end if;
  if p_x is null or p_y is null or p_z is null or p_x not between 0 and 4096 or p_z not between 0 and 4096 or p_y not between -32 and 80 then return -2; end if;
  if p_item is null or p_item not between 1 and 999 or p_item = 24 or p_amount is null or p_amount not between 1 and 64 then return -2; end if;
  delete from public.ark_drops where at < now() - interval '5 minutes';
  if (select count(*) from public.ark_drops d where d.by_user = auth.uid()) >= 30 then return -3; end if;
  insert into public.ark_drops(by_user, x, y, z, item, amount) values (auth.uid(), p_x, p_y, p_z, p_item, p_amount) returning id into nid;
  return nid;
end $function$;

select 'ok — ark drops 5 minutes' as status;
