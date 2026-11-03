import io
P=r'E:/서브 브레인/Projects/malsseum-umul/odyssey/scrolls/joshua4.js'
raw=open(P,encoding='utf-8',newline='').read()
crlf='\r\n' in raw
s=raw.replace('\r\n','\n')
open(r'E:/temp/claude-work/josh4/joshua4.before3.js','w',encoding='utf-8',newline='').write(raw)
R=lambda f: open(r'E:/temp/claude-work/josh4/'+f,encoding='utf-8').read().replace('\r\n','\n')
def rep(a,b,cnt=1):
    global s
    assert s.count(a)==cnt,(a[:60],s.count(a)); s=s.replace(a,b)
# header
rep("// 같은 날 2부(5~8장: 여호와의 군대 대장 · 여리고 · 아이 성 첫 패배와 아간 · 아이 성 매복).\n",
    "// 같은 날 2부(5~8장: 여호와의 군대 대장 · 여리고 · 아이 성 첫 패배와 아간 · 아이 성 매복).\n// 2026-10-23 3부(9~13장: 기브온의 속임 · 태양아 머무르라 · 갈렙의 산지 · 실로의 회막과 기업 · 나와 내 집은) — 수 9–24장을 골라 엮음.\n")
rep("// 대사 원칙: 성경 인물은 개역개정에 있는 자기 말만, 해설은 원문 + (출처). 2026-10-12 bskorea 개역개정(GAE) 수 1–8장 원문 대조.\n",
    "// 대사 원칙: 성경 인물은 개역개정에 있는 자기 말만, 해설은 원문 + (출처). 2026-10-12 bskorea 개역개정(GAE) 수 1–8장, 10-23 수 9–24장 원문 대조.\n")
rep("// 무대: 1~3장은 모압 평지(수 2:1·3:1 \"싯딤\"), 2장 여리고와 4~6장 길갈은 요단 서쪽 「길갈과 여리고」 마을, 7·8장은 「아이와 에발 산」.\n",
    "// 무대: 1~3장은 모압 평지(수 2:1·3:1 \"싯딤\"), 2장 여리고와 4~6장 길갈은 요단 서쪽 「길갈과 여리고」 마을, 7·8장은 「아이와 에발 산」.\n// 9·10장은 「기브온과 아얄론」, 11장은 「헤브론 산지」, 12·13장은 「실로와 세겜」(세겜의 언약 24:1은 같은 마을 남동쪽).\n")
rep("  const CAPTAIN = { n: '여호와의 군대 대장' }, SCOUTS = { n: '아이를 정탐한 사람들' }, ACHAN = { n: '아간' };\n",
    "  const CAPTAIN = { n: '여호와의 군대 대장' }, SCOUTS = { n: '아이를 정탐한 사람들' }, ACHAN = { n: '아간' };\n"
    "  const GIBEON = { n: '기브온 사람들' }, ISRAEL = { n: '이스라엘 사람들' }, LEADERS = { n: '족장들' }, ADONI = { n: '아도니세덱' }, SOMEONE = { n: '어떤 사람' };\n"
    "  const CALEB = { n: '갈렙' }, DAUGHTERS = { n: '슬로브핫의 딸들' }, ENVOYS = { n: '비느하스와 열 지도자' }, PHINEHAS = { n: '비느하스' }, PEOPLE = { n: '백성' };\n")
rep("  // 7장: 0 다시 아이로 · 1 아이로 올라감 · 2 매복과 신호 · 3 에발 산 제단\n",
    "  // 7장: 0 다시 아이로 · 1 아이로 올라감 · 2 매복과 신호 · 3 에발 산 제단\n  // 8~12장(9~13장)은 아래 「3부 자리」에\n")
rep("\n  // ── 구절 카드(개역개정 원문) ──\n", "\n"+R('p3_top.js')+"\n  // ── 구절 카드(개역개정 원문) ──\n")
rep("    'jos8-35': { ref: '여호수아 8:35', text: '모세가 명령한 것은 여호수아가 이스라엘 온 회중과 여자들과 아이와 그들 중에 동행하는 거류민들 앞에서 낭독하지 아니한 말이 하나도 없었더라' },\n",
    "    'jos8-35': { ref: '여호수아 8:35', text: '모세가 명령한 것은 여호수아가 이스라엘 온 회중과 여자들과 아이와 그들 중에 동행하는 거류민들 앞에서 낭독하지 아니한 말이 하나도 없었더라' },\n"+R('p3_verses.js'))
rep("\n  });\n\n  const { mgOpen, mgCloseAll, completeTask } = api;\n", "\n"+R('p3_dlg.js').rstrip('\n')+"\n  });\n\n  const { mgOpen, mgCloseAll, completeTask } = api;\n")
rep("  const refresh = (zid, wet) =>", R('p3_games.js').rstrip('\n')+"\n\n"+R('p3_events.js')+"  const refresh = (zid, wet) =>")
rep("    if (g.children.length || zid === 'moab' || zid === 'gilgal' || zid === 'ai'){",
    R('p3_world.js')+"    if (g.children.length || ['moab', 'gilgal', 'ai', 'gibeon', 'hebron', 'shiloh'].includes(zid)){")
rep("next: '9장: 기브온의 속임 (준비 중)',", "next: '9장: 기브온의 속임',")
rep("where: '서쪽 길의 초록 빛기둥(여리고 북서쪽)', exit: 'to-ai' }", "where: '서쪽 길의 초록 빛기둥(여리고 남서쪽)', exit: 'to-ai' }", 2)
rep("    ],\n    games: {", R('p3_ch.js')+"    ],\n    games: {")
rep("calendar: calendarGame, holy: holyGame, march: marchGame, lots: lotsGame, tent: tentGame, ambush: ambushGame, altar: altarGame },",
    "calendar: calendarGame, holy: holyGame, march: marchGame, lots: lotsGame, tent: tentGame, ambush: ambushGame, altar: altarGame,\n      evidence: evidenceGame, night: nightGame, sky: skyGame, caleb: calebGame, trail: trailGame, survey: surveyGame, refuge: refugeGame, twoside: twosideGame, covenant: covenantGame },")
rep("events: { redCord, jordanStop, jordanBack, stonesUp, wallsFall, jerichoBurn, achorPile, aiBurn, altarUp },",
    "events: { redCord, jordanStop, jordanBack, stonesUp, wallsFall, jerichoBurn, achorPile, aiBurn, altarUp, kingsCamp, hail, sunStop, caveStone, edAltar, stoneUp, rahabGen },")
if crlf: s=s.replace('\n','\r\n')
open(P,'w',encoding='utf-8',newline='').write(s); print('spliced', crlf)
