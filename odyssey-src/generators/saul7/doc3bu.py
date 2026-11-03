import sys, json
sys.stdout.reconfigure(encoding='utf-8')
# ① SQL: 배지 키 3개 — 배열 끝에 붙여 기존 번호 유지
R = r'E:\서브 브레인\Projects\malsseum-umul\sql-migrations'
s = open(R + r'\2026-11-02-odyssey-saul7-part2.sql', encoding='utf-8').read().replace('\r\n', '\n')
i = s.index('CREATE OR REPLACE FUNCTION public.claim_odyssey_achieve')
f = s[i:]
a = "'badge-seven_days','badge-climbed_two'];"
assert f.count(a) == 1
f = f.replace(a, "'badge-seven_days','badge-climbed_two',\n                       'badge-harp_song','badge-five_stones','badge-arrow_beyond'];")
open(R + r'\2026-11-03-odyssey-saul7-part3.sql', 'w', encoding='utf-8', newline='\n').write("-- 2026-11-03 In Odyssey 7편 3부(8~11장) 서버 쪽: 배지 업적 키 추가(배열 끝에 붙여 기존 번호 유지) — badge-harp_song, badge-five_stones, badge-arrow_beyond\n" + f)
src = open(r"C:\Users\User\AppData\Local\Temp\claude\E---------NEW-BRAIN\295f8854-a21b-46a2-9a5d-1b1fe1dce44e\scratchpad\su.py", encoding="utf-8").read().split("print(q(sys.argv[1]))")[0]
exec(src)
q(f)
d = json.loads(q("select pg_get_functiondef('public.claim_odyssey_achieve(text)'::regprocedure) d"))[0]['d']
print('SQL 적용', all(k in d for k in ['badge-baggage', 'badge-climbed_two', 'badge-harp_song', 'badge-five_stones', 'badge-arrow_beyond']))
# ② 문서
p = r'E:\서브 브레인\NEW BRAIN\50. Projects\50_0. Active\In Odyssey 7편 사울과 다윗 — 상세 기획 (초안).md'
t = open(p, encoding='utf-8').read()
a = "1부(1~4장) 10/31 배포 — SQL 적용·대사 검수 대기, 2부 제작 전, 3D는 11/24 Meshy 충전 뒤"
assert t.count(a) == 1
t = t.replace(a, "1부 10/31·2부 11/2·3부(8~11장) 11/3 배포 — SQL 적용, 대사 검수 대기, 4부 제작 전, 3D는 11/24 Meshy 충전 뒤")
t = t[:t.index('## 15. 7편')] + open('review15.md', encoding='utf-8').read()
open(p, 'w', encoding='utf-8').write(t)
j = r'E:\서브 브레인\NEW BRAIN\50. Projects\50_0. Active\In Odyssey 개발 기록.md'
c = open(j, encoding='utf-8').read().rstrip('\n')
c += '''

- **2026-11-03 7편 「사울과 다윗」 3부(8~11장, 삼상 16–20장) 배포**: `odyssey/scrolls/saul7.js`에 4장 추가, 대사 생성 `E:/temp/claude-work/saul7/gen7_3bu.py`(gen7.py가 읽음), 패치 `patch3bu.py`, 대조 `dump7.mjs` — 전체 해설 341줄·인물 말 160줄·카드 15장·안내 인용 19개 원문 차이 0 → 기획 문서 15절. 8장 라마 → 베들레헴, 🧒 지나가는 아들들(어느 버튼이든 대답은 16:7·8·10 원문, 넷째~일곱째는 이름이 본문에 없어 「이새의 아들」), 족보 조각 다윗. 9장 🐑 양 지키기(사자·곰 칸 누르기, 치는 연출 없음, 17:35 「건져내었고」까지) · 🎵 수금(3줄 16음, 12음 이상 통과, 무실수 배지 harp_song, 배경음악을 켠 때만 소리). 10장 엘라 골짜기(블레셋 평지 재사용) · 🛡 갑옷 입고 걷기→벗기 · 🪨 돌 다섯(무실수 배지 five_stones) · 🎯 물매(놓치는 일 없이 표적 안에서만 놓임, 골리앗은 그 뒤 사라지고 먼지만 멀리, 17:50–58 해설). 11장 🔱 창 두 번 피하기 · 🏹 화살 신호(무실수 배지 arrow_beyond). 18:25–27 건너뜀(18:27 끝 「미갈을 아내로」만 읽음). 라마 나욧(19:18–24)은 이동 없이 다윗의 집 단계에서 해설로 읽음. 임시 모델: 다윗 shepherd-boy, 이새 he-grandpa, 엘리압 he-father, 골리앗 j5-philistine-lord ×1.75, 미갈 r6-orpah(11/24 Meshy 뒤 GPT 14차로 교체). SQL `2026-11-03-odyssey-saul7-part3.sql`(배지 키 3개) 적용·확인. 시험 `E:/temp/claude-work/tools/saul3-test.mjs`(2부 끝낸 저장본에서 시작) 오류 0, `saul2-test.mjs` 회귀 오류 0. 남은 일: 대사 검수, 폰에서 한 번 해 보기, 4부(12~16장).
'''
open(j, 'w', encoding='utf-8').write(c)
h = r'E:\서브 브레인\NEW BRAIN\05. 운영 관리\현재 진행 상황.md'
b = open(h, 'rb').read()
a = '**2부(5~7장) 11/2 배포**. 남은 일: 1·2부 대사 검수(기획 문서 15절), 폰으로 한 번 해 보기, 3부(8~11장) 제작, 11/24 Meshy 충전 뒤 GPT 14차 3D 교체.'.encode('utf-8')
assert b.count(a) == 1
b = b.replace(a, '**2부(5~7장) 11/2·3부(8~11장) 11/3 배포**. 남은 일: 1~3부 대사 검수(기획 문서 15절), 폰으로 한 번 해 보기, 4부(12~16장) 제작, 11/24 Meshy 충전 뒤 GPT 14차 3D 교체.'.encode('utf-8'))
open(h, 'wb').write(b)
w = r'E:\서브 브레인\NEW BRAIN\05. 운영 관리\주간 기록\2026-11-08 주일 주간.md'
c = open(w, encoding='utf-8').read().rstrip('\n')
c += '\n- **In Odyssey 7편 3부(8~11장) 배포**(11/3): 지나가는 아들들·양 지키기·수금·갑옷·돌 다섯·물매·창 피하기·화살 신호, 족보 조각 다윗, 배지 3개 SQL 적용, 자동 플레이 오류 0, 2부 회귀 오류 0. 대사 원문 차이 0. 전도사님 검수·폰 시험 대기.\n'
open(w, 'w', encoding='utf-8').write(c)
print('docs ok')
