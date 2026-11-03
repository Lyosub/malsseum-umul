# 7편 1부를 엔진(odyssey/index.html)에 잇는다: 두루마리 목록 · 새 마을 기브아와 믹마스 · 기브온에서 가는 길 · 옮겨 가기 · 6편 뒤 7편 권유 · NPC 키(scale)
import sys, hashlib
p, scroll = sys.argv[1], sys.argv[2]; s = open(p, encoding='utf-8').read()
def rep(a, b, n=1):
    global s; c = s.count(a); assert c == n, (c, a[:90]); s = s.replace(a, b)
rep("    { id: 'saul', no: '7', title: '사울과 함께', soon: true },",
    "    { id: 'saul', no: '7', title: '사울과 다윗', file: 'scrolls/saul7.js', num: 7, needScroll: 'ruth' },")
rep("""        { id: 'to-philistia', x: -42, z: -6, type: 'exit', title: "서쪽 길로 블레셋 평지에 내려가기", to: 'philistia', spawn: [36, 0], cond: 'philistiaOpen' },""",
    """        { id: 'to-philistia', x: -42, z: -6, type: 'exit', title: "서쪽 길로 블레셋 평지에 내려가기", to: 'philistia', spawn: [36, 0], cond: 'philistiaOpen' },
        { id: 'to-gibeah', x: 40, z: -24, type: 'exit', title: "동북쪽 길로 기브아에 올라가기", to: 'gibeah', spawn: [-36, 20], cond: 'gibeahOpen' },""")
rep("""        { id: 'to-hebron-b', x: 0, z: 42, type: 'exit', title: "남쪽 길로 헤브론 산지에 가기", to: 'hebron', spawn: [-36, -16] },
      ],
    },
  };""", """        { id: 'to-hebron-b', x: 0, z: 42, type: 'exit', title: "남쪽 길로 헤브론 산지에 가기", to: 'hebron', spawn: [-36, -16] },
      ],
    },
    // ══ 7편 「사울과 다윗」 — 기브아와 믹마스(삼상 10:26 사울의 집 기브아 · 9:5 숩 땅의 성읍과 산당 · 10:5 하나님의 산과 블레셋 사람들의 영문 · 13:2 믹마스 · 14:4 두 바위).
    //    서쪽 마을이 기브아, 동쪽 비탈 위가 숩 땅의 성읍, 북쪽이 하나님의 산. 집·성문·산당·우물은 두루마리(scrolls/saul7.js)가 세운다 ══
    gibeah: {
      name: '기브아와 믹마스', questTitle: '📜 퀘스트 — 사울과 다윗',
      env: { ground: 0xe2d6a4, top: 0x5a8fcc, bottom: 0xdcd6ae, fog: 0xd6d0aa, fogD: 0.011, sun: 0xfff3d6, sunDir: [0.5, 0.45, -0.55], cloud: 0.3, cloudCol: 0xffffff, stars: 0, far: 'far-mountains' },
      center: [0, 0], spawn: [-36, 20],
      mountain: { x: -12, z: -46, r: 14, h: 16 },
      layout: [
        ['env-acacia', 30, 26, 0.4], ['env-acacia', -38, -16, 1.6], ['env-rock-hill', 40, -40, 0.4], ['env-rocks-strata', 40, 32, 1.2], ['dry-bush', 10, 36, 0], ['dry-bush', -2, -6, 0],
      ],
      scatter: [['dry-bush', 6, 20, 50], ['rock-group', 8, 22, 50]],
      clear: [[-36, 20, 6], [-22, 4, 13], [0, 12, 6], [14, 4, 5], [26, -14, 13], [32, -26, 8], [10, -16, 5], [-10, -26, 8], [-30, 30, 8], [4, 28, 4], [-10, 36, 4], [-12, -46, 15], [0, -36, 6], [-42, 20, 4]],
      fires: [],
      points: [
        { id: 'to-gibeon-g', x: -42, z: 20, type: 'exit', title: "서쪽 길로 기브온 마을에 내려가기", to: 'gibeon', spawn: [34, -22] },
      ],
    },
  };""")
rep("  CONDS.bethlehemOpen = () => !!((ST.sp && ST.sp.ruth) || DEV_SCROLL);   // 6편을 펼친 뒤부터",
    "  CONDS.bethlehemOpen = () => !!((ST.sp && ST.sp.ruth) || DEV_SCROLL);   // 6편을 펼친 뒤부터\n"
    "  CONDS.gibeahOpen = () => !!((ST.sp && ST.sp.saul) || DEV_SCROLL);   // 7편을 펼친 뒤부터")
rep("""  ROUTE.bethlehem = {}; Object.keys(ROUTE).forEach(z => { if (z === 'bethlehem') return; ROUTE.bethlehem[z] = 'to-hebron-b'; ROUTE[z].bethlehem = z === 'hebron' ? 'to-bethlehem' : ROUTE[z].hebron; });""",
    """  ROUTE.bethlehem = {}; Object.keys(ROUTE).forEach(z => { if (z === 'bethlehem') return; ROUTE.bethlehem[z] = 'to-hebron-b'; ROUTE[z].bethlehem = z === 'hebron' ? 'to-bethlehem' : ROUTE[z].hebron; });
  // 7편: 기브아와 믹마스는 기브온 마을에서 동북쪽 길로만 이어진다
  ROUTE.gibeah = {}; Object.keys(ROUTE).forEach(z => { if (z === 'gibeah') return; ROUTE.gibeah[z] = 'to-gibeon-g'; ROUTE[z].gibeah = z === 'gibeon' ? 'to-gibeah' : ROUTE[z].gibeon; });""")
rep("philistia: 99, bethlehem: 99 };", "philistia: 99, bethlehem: 99, gibeah: 99 };")
rep("'philistia', 'bethlehem']){", "'philistia', 'bethlehem', 'gibeah']){")
rep("      if (z === 'bethlehem' && !story && !CONDS.bethlehemOpen()) continue;   // 베들레헴은 6편부터",
    "      if (z === 'bethlehem' && !story && !CONDS.bethlehemOpen()) continue;   // 베들레헴은 6편부터\n      if (z === 'gibeah' && !story && !CONDS.gibeahOpen()) continue;   // 기브아와 믹마스는 7편부터")
rep("(z === 'bethlehem' && CONDS.bethlehemOpen()) ||", "(z === 'bethlehem' && CONDS.bethlehemOpen()) || (z === 'gibeah' && CONDS.gibeahOpen()) ||")
rep("philistia: 'midian', bethlehem: 'midian' };", "philistia: 'midian', bethlehem: 'midian', gibeah: 'midian' };")
rep("    ruth: { to: null, done: () => ruthDone(), ped: 5, what: '에벤에셀 돌' },   // 7편은 준비 중 — 받침대만 보여 준다",
    "    ruth: { to: 'saul', done: () => ruthDone(), ped: 5, what: '에벤에셀 돌' },")
rep("${ruthDone() ? '여섯 받침대가 채워졌어요. 다음 두루마리는 준비하고 있어요.' :",
    "${ruthDone() ? '여섯 받침대가 채워졌어요. 일곱 번째 받침대는 7편 「사울과 다윗」을 모두 마치면 채워져요.' :")
# 사울처럼 "어깨 위만큼 더 큰" 인물: 지점에 scale을 주면 그 비율로(없으면 1)
rep("      model.scale.setScalar(WPM);           // 리깅 때 실제 키(미터)를 넣었으므로 학생과 같은 비율",
    "      model.scale.setScalar(WPM * (m.data.scale || 1));   // 리깅 때 실제 키(미터)를 넣었으므로 학생과 같은 비율(사울처럼 큰 인물은 지점의 scale)")
h = hashlib.md5(open(scroll, 'rb').read()).hexdigest()[:8]
import re
m = re.search(r'window\.__SCROLL_V=(\{[^}]*\})', s); assert m
v = m.group(1); v2 = re.sub(r', "saul": "[0-9a-f]+"', '', v)[:-1] + f', "saul": "{h}"}}'
s = s.replace(v, v2, 1)
open(p, 'w', encoding='utf-8', newline='').write(s); print('wired', h)
