-- 가을 원정대: 10/24 답사 시험 기록 비우기 (2026-10-24, 전도사님 요청 — 11/1 교사 시연 때 처음부터 올려 보게)
-- 지우기 전 96건을 picnic_subs_backup_20261024 에 옮겨 둠. 시험 팀 3개·코드·시험 설정·단서는 남김(11/7 정리).
create table if not exists public.picnic_subs_backup_20261024 as select * from public.picnic_subs;
alter table public.picnic_subs_backup_20261024 enable row level security;
delete from public.picnic_subs where team_id in (select id from public.picnic_teams);
