-- 2026-11-25 나그네 마을 세상을 다시 두 배로(4096 → 8192): x·z 한도만 넓힘
-- 한도가 들어 있는 함수는 넷(park_ark_cart, drop_ark_item, send_ark_feedback, put_ark_edits) — 지금 정의를 읽어 숫자만 바꿔 다시 만든다.
do $$
declare r record; d text;
begin
  for r in select p.oid, p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and p.proname in ('park_ark_cart', 'drop_ark_item', 'send_ark_feedback', 'put_ark_edits')
  loop
    d := pg_get_functiondef(r.oid);
    d := replace(replace(d, 'between 0 and 4095', 'between 0 and 8191'), 'between 0 and 4096', 'between 0 and 8192');
    execute d;
  end loop;
end $$;
