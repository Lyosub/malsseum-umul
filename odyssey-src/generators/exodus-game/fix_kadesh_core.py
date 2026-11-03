"""3편 「광야 40년」 1단계: 새 마을 가데스(바란 광야) + 3편 두루마리 등록 (2026-09-27)."""
p = r'E:\temp\claude-work\exodus-game\prototype.html'
s = open(p, encoding='utf-8').read()

def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:70])
    s = s.replace(a, b)

# 1) 시내 산 동쪽 출구 → 가데스(2편을 마치거나 3편을 펼쳤을 때만 보임)
rep("""        { id: 'to-rephidim2', x: -39.5, z: 6, type: 'exit', title: "르비딤으로", to: 'rephidim', spawn: [4, 22] },
      ],
    },
  };""", """        { id: 'to-rephidim2', x: -39.5, z: 6, type: 'exit', title: "르비딤으로", to: 'rephidim', spawn: [4, 22] },
        { id: 'to-kadesh', x: 39.5, z: 6, type: 'exit', title: "바란 광야 가데스로", to: 'kadesh', spawn: [-35, 4], cond: 'kadeshOpen' },
      ],
    },
    // ══ 3편 「광야 40년」의 중심 진영 — 바란 광야 가데스(민 13:26). 성막은 시내 산과 같은 자리(TAB)에 완성된 모습으로 선다 ══
    kadesh: {
      name: '바란 광야 가데스', questTitle: '📜 퀘스트 — 광야 40년',
      env: { top: 0x5a86c0, bottom: 0xf0d4a4, fog: 0xe8cfa8, fogD: 0.012, sun: 0xfff0d0, sunDir: [0.5, 0.45, -0.6], cloud: 0.3, cloudCol: 0xffffff, stars: 0, far: 'far-mountains' },
      center: [0, 0], spawn: [-35, 4],
      // 가데스의 샘(진영 북동쪽)
      pools: [[20, -26, 3.2, 'spring'], [25.5, -22, 1.1, 'spring'], [15, -22.5, 0.9, 'spring']],
      layout: [
        ['env-date-palm', 26, -30, 0.4], ['env-date-palm', 14, -30, 1.6], ['env-date-palm', 28, -19, 2.3], ['palm', 12, -18, 0.8], ['palm', 23, -32, 2.9], ['env-acacia', 31, -26, 1.1],
        ['tent-cluster', 20, 6, faceTo(20, 6, 0, -15)], ['tent-large', 10, 14, faceTo(10, 14, 0, -15)], ['tent-mid', 26, 16, faceTo(26, 16, 0, -15)], ['tent-mid', -16, 10, faceTo(-16, 10, 0, -15)],
        ['tent-cluster', -22, -2, faceTo(-22, -2, 0, -15)], ['tent-small', 30, -6, faceTo(30, -6, 0, -15)], ['tent-small', -6, 18, 2.1], ['tent-mid', -26, -24, faceTo(-26, -24, 0, -15)],
        ['camp-firepit', 16, 0, 0], ['tribe-banner', 20, -4, 0.3], ['tribe-banner', -12, 4, 1.1], ['crates-sacks', 24, 1, 0.4], ['jars', -18, 4, 0.3], ['firewood', 12, 4, 0.9],
        ['env-rock-hill', -32, -34, 0.4], ['env-rock-hill', 34, 34, 2.0], ['env-rocks-strata', -34, 22, 1.2], ['env-rocks-strata', 36, -36, 2.4], ['dry-bush', -30, -12, 0], ['dry-bush', 32, 10, 0],
      ],
      scatter: [['dry-bush', 8, 20, 55], ['rock-group', 10, 22, 55]],
      clear: [[-5, -15, 17], [-35, 4, 6], [20, -25, 8], [33, 26, 6], [0, 4, 8]],
      fires: [],
      points: [
        { id: 'moses', x: 15, z: -12, type: 'npc', title: "모세", model: 'moses', persona: 'rs_static' },
        { id: 'aaron', x: 15, z: -18, type: 'npc', title: "아론", model: 'aaron', persona: 'rs_static' },
        { id: 'kd_well', x: 20, z: -21.5, type: 'villager', title: "샘가의 어머니", model: 'he-mother', persona: 'rs_static', lazy: true, body: "\\"여기 가데스엔 샘이 있어서 다행이에요.\\"" },
        { id: 'kd_boy', x: 8, z: 8, type: 'villager', title: "천막의 소년", model: 'he-boy-hb', persona: 'rs_static', lazy: true, body: "\\"저 멀리 약속의 땅이 있대요!\\"" },
        { id: 'kd_grandpa', x: -14, z: 6, type: 'villager', title: "천막의 할아버지", model: 'he-grandpa', persona: 'rs_static', lazy: true, body: "\\"애굽을 나온 지 벌써 두 해째로구나.\\"" },
        { id: 'to-sinai3', x: -39.5, z: 4, type: 'exit', title: "시내 광야로", to: 'sinai', spawn: [35, 6] },
      ],
    },
  };""")

# 2) 조건: 가데스 출구
rep("  const SCROLL_Q = window.__odyQ = window.__odyQ || [];",
    "  CONDS.kadeshOpen = () => !!((ST.sp && ST.sp.sinai2 && ST.sp.sinai2.cleared) || ST.cur === 'wild3' || DEV_SCROLL);\n  const SCROLL_Q = window.__odyQ = window.__odyQ || [];")

# 3) 3편 두루마리 등록 — 2편을 마쳐야 열림
rep("    { id: 'wild40', no: '3', title: '광야 40년', soon: true },",
    "    { id: 'wild3', no: '3', title: '광야 40년', file: 'scrolls/wild3.js', num: 3, needScroll: 'sinai2' },")
rep("      const pr = scrollProgress(s.id), cur = ST.cur === s.id, lock = s.needMoses && chaptersDone() < CHAPTERS.length && !DEV_SCROLL;",
    "      const pr = scrollProgress(s.id), cur = ST.cur === s.id, lock = ((s.needMoses && chaptersDone() < CHAPTERS.length) || (s.needScroll && !(ST.sp[s.needScroll] && ST.sp[s.needScroll].cleared))) && !DEV_SCROLL;")

# 4) 이동(길 떠나기) · 미리 받기 · 배경음 · 경로
rep("""    const need = { alpha: 0, midian: 1, egypt: 2, redsea: 4, wild: 5, rephidim: 6, sinai: 8 };
    for (const z of ['alpha', 'midian', 'egypt', 'redsea', 'wild', 'rephidim', 'sinai']){
      const story = q && (q.zone === z || exitTo === z);
      const ok = z === 'alpha' || done >= need[z] || story;""", """    const need = { alpha: 0, midian: 1, egypt: 2, redsea: 4, wild: 5, rephidim: 6, sinai: 8, kadesh: 99 };
    for (const z of ['alpha', 'midian', 'egypt', 'redsea', 'wild', 'rephidim', 'sinai', 'kadesh']){
      const story = q && (q.zone === z || exitTo === z);
      if (z === 'kadesh' && !story && !CONDS.kadeshOpen()) continue;   // 3편 마을은 2편을 마친 뒤부터 목록에 보임
      const ok = z === 'alpha' || done >= need[z] || story || (z === 'kadesh' && CONDS.kadeshOpen());""")
rep("    const SEQ = ['alpha', 'midian', 'egypt', 'redsea', 'wild', 'rephidim', 'sinai'], si = SEQ.indexOf(Z.id), cq = curStep();",
    "    const SEQ = ['alpha', 'midian', 'egypt', 'redsea', 'wild', 'rephidim', 'sinai', 'kadesh'], si = SEQ.indexOf(Z.id), cq = curStep();")
rep("const ZONE_BGM = { alpha: 'village', midian: 'midian', egypt: 'egypt', redsea: 'redsea', wild: 'midian', rephidim: 'midian', sinai: 'midian' };",
    "const ZONE_BGM = { alpha: 'village', midian: 'midian', egypt: 'egypt', redsea: 'redsea', wild: 'midian', rephidim: 'midian', sinai: 'midian', kadesh: 'midian' };")
rep("  ['alpha', 'midian', 'egypt'].forEach(z => { ROUTE[z].wild = ROUTE[z].redsea; });",
    """  ['alpha', 'midian', 'egypt'].forEach(z => { ROUTE[z].wild = ROUTE[z].redsea; });
  // 가데스(3편)는 시내 산 동쪽 출구로만 이어진다
  ROUTE.kadesh = {}; Object.keys(ROUTE).forEach(z => { if (z === 'kadesh') return; ROUTE.kadesh[z] = 'to-sinai3'; ROUTE[z].kadesh = z === 'sinai' ? 'to-kadesh' : ROUTE[z].sinai; });""")

# 5) 가데스에도 완성된 성막·영광의 구름·언약궤
rep("    if (Z.id === 'sinai'){ buildStorm(stormOn()); buildCh910(); }",
    "    if (Z.id === 'sinai'){ buildStorm(stormOn()); buildCh910(); }\n    if (Z.id === 'kadesh'){ tabStage = -1; buildTabernacle(16); buildGlory(!kadeshNoGlory); buildArkAt(TAB.x0 + 1.2, TAB.z, Math.PI / 2); }")
rep("  const TAB = { x0: -10, x1: 0, z: -15, hw: 2, h: 3.2, court: [-13, 13, -21, -9] };",
    "  const TAB = { x0: -10, x1: 0, z: -15, hw: 2, h: 3.2, court: [-13, 13, -21, -9] };\n  let kadeshNoGlory = false;   // 3편 3장: \"구름이 장막 위에서 떠나갔고\"(민 12:10) — 두루마리 파일이 잠시 끔")

# 6) 두루마리 파일이 쓸 창구: 영광의 구름 켜고 끄기
rep("    get mg(){ return mg; }, completeTask: q => completeTask(q),",
    "    setGlory: on => { kadeshNoGlory = !on; if (Z && Z.id === 'kadesh') buildGlory(on); }, TAB,\n    get mg(){ return mg; }, completeTask: q => completeTask(q),")
open(p, 'w', encoding='utf-8').write(s)
print('ok')
