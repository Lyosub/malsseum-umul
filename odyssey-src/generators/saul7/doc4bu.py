import sys, json
sys.stdout.reconfigure(encoding='utf-8')
# ① SQL: 배지 키 3개 — 배열 끝에 붙여 기존 번호 유지
R = r'E:\서브 브레인\Projects\malsseum-umul\sql-migrations'
s = open(R + r'\2026-11-03-odyssey-saul7-part3.sql', encoding='utf-8').read().replace('\r\n', '\n')
i = s.index('CREATE OR REPLACE FUNCTION public.claim_odyssey_achieve')
f = s[i:]
a = "'badge-harp_song','badge-five_stones','badge-arrow_beyond'];"
assert f.count(a) == 1
f = f.replace(a, "'badge-harp_song','badge-five_stones','badge-arrow_beyond',\n                       'badge-spear_jug','badge-bread_200','badge-share_alike'];")
open(R + r'\2026-11-03-odyssey-saul7-part4.sql', 'w', encoding='utf-8', newline='\n').write("-- 2026-11-03 In Odyssey 7편 4부(12~16장) 서버 쪽: 배지 업적 키 추가(배열 끝에 붙여 기존 번호 유지) — badge-spear_jug, badge-bread_200, badge-share_alike\n" + f)
src = open(r"C:\Users\User\AppData\Local\Temp\claude\E---------NEW-BRAIN\295f8854-a21b-46a2-9a5d-1b1fe1dce44e\scratchpad\su.py", encoding="utf-8").read().split("print(q(sys.argv[1]))")[0]
exec(src)
q(f)
d = json.loads(q("select pg_get_functiondef('public.claim_odyssey_achieve(text)'::regprocedure) d"))[0]['d']
print('SQL 적용', all(k in d for k in ['badge-baggage', 'badge-arrow_beyond', 'badge-spear_jug', 'badge-bread_200', 'badge-share_alike']))
# ② 문서
p = r'E:\서브 브레인\NEW BRAIN\50. Projects\50_0. Active\In Odyssey 7편 사울과 다윗 — 상세 기획 (초안).md'
t = open(p, encoding='utf-8').read()
a = "1부 10/31·2부 11/2·3부(8~11장) 11/3 배포 — SQL 적용, 대사 검수 대기, 4부 제작 전, 3D는 11/24 Meshy 충전 뒤"
assert t.count(a) == 1
t = t.replace(a, "1부 10/31·2부 11/2·3부·4부(12~16장) 11/3 배포, 7편 16장 전부 완성 — SQL 적용, 대사 검수 대기, 3D는 11/24 Meshy 충전 뒤")
t = t[:t.index('## 15. 7편')] + open('review15.md', encoding='utf-8').read()
open(p, 'w', encoding='utf-8').write(t)
j = r'E:\서브 브레인\NEW BRAIN\50. Projects\50_0. Active\In Odyssey 개발 기록.md'
c = open(j, encoding='utf-8').read().rstrip('\n')
c += '''

- **2026-11-03 7편 「사울과 다윗」 4부(12~16장, 삼상 21–31장·대상 10:13–14) 배포, 7편 완성**: 새 마을 유다 광야(`judah`, 헤브론 산지 동쪽 길로 연결, 7편 12장부터 열림), 일곱 번째 받침대(물매와 돌 다섯, 도형). 대사 생성 `E:/temp/claude-work/saul7/gen7_4bu.py`, 패치 `patch4bu.py`, 전체 해설 569줄·인물 말 245줄·카드 25장·안내 인용 27개 원문 차이 0 → 기획 문서 15절. 12장 놉 · 🧭 굴로 길 안내 · 헤렛(22:6–23 본문 보기) · 그일라 · 십 수풀 · ⛰ 마온 산 돌기. 13장 ✂ 겉옷 자락 · 굴 밖 · 하길라 · 🤫 잠든 진영(깨우는 일 없음 26:12, 치는 버튼 없음, 사람을 건드리지 않으면 배지 spear_jug) · 건너편 산. 14장 🍞 예물 수 맞추기(무실수 배지 bread_200) · 호젓한 곳 · 나발의 집. 15장 가드·아벡 본문 보기 · 불탄 시글락 · 애굽 사람 먹이기 · 발자국 · 🤝 사람마다의 분깃 나누기(30:24, 무리 전체 반반이 아님, 첫 시도 배지 share_alike). 16장 28:3–25 본문 보기 · 31:1–6 해설과 원경 · 📜 사울의 길 카드 + 맞은편 다윗 카드 · 🌙 밤길 · 31:13. 기획과 다른 점: 해 지는 빛 연출은 산이 불타는 것처럼 보여 뺐다, 신약 연결 짝(21:6↔마 12:3–4 등)은 4~6편처럼 넣지 않음(LINKS는 번호로 저장돼 links_all 배지와 얽힘). 임시 모델: 아히멜렉·아비아달 he-levite, 아비새 he-boy-hb, 아브넬 j5-midianite, 나발 he-father, 아비가일 r6-hannah, 애굽 소년 ca-water-boy(11/24 Meshy 뒤 교체). SQL `2026-11-03-odyssey-saul7-part4.sql` 적용·확인. 시험 `E:/temp/claude-work/tools/saul4-test.mjs` 오류 0, `saul3-test.mjs` 회귀 오류 0. 남은 일: 대사 검수, 폰에서 한 번 해 보기.
'''
open(j, 'w', encoding='utf-8').write(c)
h = r'E:\서브 브레인\NEW BRAIN\05. 운영 관리\현재 진행 상황.md'
b = open(h, 'rb').read()
a = '**2부(5~7장) 11/2·3부(8~11장) 11/3 배포**. 남은 일: 1~3부 대사 검수(기획 문서 15절), 폰으로 한 번 해 보기, 4부(12~16장) 제작, 11/24 Meshy 충전 뒤 GPT 14차 3D 교체.'.encode('utf-8')
assert b.count(a) == 1
b = b.replace(a, '**2부(5~7장) 11/2·3부(8~11장)·4부(12~16장) 11/3 배포, 7편 16장 완성**. 남은 일: 전체 대사 검수(기획 문서 15절), 폰으로 한 번 해 보기, 11/24 Meshy 충전 뒤 GPT 14차 3D 교체.'.encode('utf-8'))
open(h, 'wb').write(b)
w = r'E:\서브 브레인\NEW BRAIN\05. 운영 관리\주간 기록\2026-11-08 주일 주간.md'
c = open(w, encoding='utf-8').read().rstrip('\n')
c += '\n- **In Odyssey 7편 4부(12~16장) 배포, 7편 16장 완성**(11/3): 새 마을 유다 광야, 일곱 번째 받침대(물매와 돌 다섯), 게임 9개, 배지 3개 SQL 적용, 자동 플레이 오류 0, 3부 회귀 오류 0. 대사 원문 차이 0. 전도사님 검수·폰 시험 대기.\n'
open(w, 'w', encoding='utf-8').write(c)
print('docs ok')
