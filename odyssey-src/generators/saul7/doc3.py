p=r'E:\서브 브레인\NEW BRAIN\50. Projects\50_0. Active\In Odyssey 7편 사울과 다윗 — 상세 기획 (초안).md'
t=open(p,encoding='utf-8').read()
i=t.index('## 15. 7편')
r=open('review15.md',encoding='utf-8').read()
t=t[:i]+r
open(p,'w',encoding='utf-8').write(t)
j=r'E:\서브 브레인\NEW BRAIN\50. Projects\50_0. Active\In Odyssey 개발 기록.md'
s=open(j,encoding='utf-8').read().rstrip('\n')
s+='''

- **2026-11-02 7편 「사울과 다윗」 2부(5~7장, 삼상 13–15장) 배포**: `odyssey/scrolls/saul7.js`에 3장 추가, 대사 생성 `E:\temp\claude-work\saul7\gen7.py`(조립 `build7.py`, 2부 패치 `patch2bu.py`, 대조 `dump7.mjs`) — 2부 포함 전체 해설 183줄·인물 말 89줄·카드 9장 원문 차이 0 → 기획 문서 15절. 5장 ⏳ 이레(15초×7, 백성 약 3,000 → 600, 번제 버튼을 언제 누르든 본문 13:9–14로 이어짐, 끝까지 지켜보면 배지 seven_days) · 철공 없음(13:19–22 해설). 6장 믹마스 어귀 두 바위(env-rock-hill 2개)·🧗 오르기(요나단→소년 번갈아, 무실수 배지 climbed_two)·14:15–16 먼지만 멀리·수풀의 꿀(honeycomb)·제비(14:36–45). 7장 15:3·15:33 해설로 읽기만·🔊 양과 소의 소리(칸을 누르면 🔊 개수로 가까움, 실제 소리는 없음)·15:22 말 차례·겉옷자락 찢어짐은 화면 깜빡임만. 임시 모델: 요나단 j4-spy-2, 무기 든 소년 he-boy-hb(11/24 Meshy 뒤 GPT 14차로 교체). 받은 원문 13:15의 문단 경계 띄어쓰기가 빠져 있어(「올라가니라사울이」) 생성기와 대조에서 한 칸을 넣음. SQL `2026-11-02-odyssey-saul7-part2.sql`(배지 키 2개) 적용·확인. 시험 `E:\temp\claude-work\tools\saul2-test.mjs`(1부 끝낸 저장본에서 시작, 끝까지 기다림/번제 누름 두 경로)·`saul-test.mjs`(1부 회귀) 오류 0. 남은 일: 대사 검수, 폰에서 한 번 해 보기, 3부(8~11장).
'''
open(j,'w',encoding='utf-8').write(s)
h=r'E:\서브 브레인\NEW BRAIN\05. 운영 관리\현재 진행 상황.md'
c=open(h,'rb').read()
a='남은 일: 대사 검수(기획 문서 15절), 2부(5~7장) 제작, 11/24 Meshy 충전 뒤 GPT 14차 3D 교체.'.encode('utf-8')
assert c.count(a)==1
c=c.replace(a,'**2부(5~7장) 11/2 배포**. 남은 일: 1·2부 대사 검수(기획 문서 15절), 폰으로 한 번 해 보기, 3부(8~11장) 제작, 11/24 Meshy 충전 뒤 GPT 14차 3D 교체.'.encode('utf-8'))
open(h,'wb').write(c)
w=r'E:\서브 브레인\NEW BRAIN\05. 운영 관리\주간 기록\2026-11-08 주일 주간.md'
s=open(w,encoding='utf-8').read().rstrip('\n')
s+='\n- **In Odyssey 7편 2부(5~7장) 배포**(11/2): 이레 기다리기·두 바위 오르기·양과 소의 소리·15:22 말 차례, 배지 2개 SQL 적용, 자동 플레이 오류 0, 1부 회귀 오류 0. 대사 원문 차이 0. 전도사님 검수·폰 시험 대기.\n'
open(w,'w',encoding='utf-8').write(s)
print('docs ok')
