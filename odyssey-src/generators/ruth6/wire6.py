# 6편을 엔진(odyssey/index.html)에 잇는다: 두루마리 목록 · 베들레헴 마을 · 길 · 옮겨 가기 · 여섯째 받침대
import sys
p = sys.argv[1]; s = open(p, encoding='utf-8').read()
def rep(a, b, n=1):
    global s; c = s.count(a); assert c == n, (c, a[:90]); s = s.replace(a, b)
rep("    { id: 'ruth', no: '6', title: '룻과 사무엘', soon: true },",
    "    { id: 'ruth', no: '6', title: '룻과 사무엘', file: 'scrolls/ruth6.js', num: 6, needScroll: 'judges' },\n    { id: 'saul', no: '7', title: '사울과 함께', soon: true },")
rep("""        { id: 'to-gilgal5', x: 0, z: -42, type: 'exit', title: "북쪽 길로 길갈에 내려가기", to: 'gilgal', spawn: [-14, 38] },""",
    """        { id: 'to-gilgal5', x: 0, z: -42, type: 'exit', title: "북쪽 길로 길갈에 내려가기", to: 'gilgal', spawn: [-14, 38] },
        { id: 'to-bethlehem', x: -42, z: -16, type: 'exit', title: "서북쪽 길로 베들레헴에 가기", to: 'bethlehem', spawn: [0, 36], cond: 'bethlehemOpen' },""")
rep("""        { id: 'to-gibeon-p', x: 42, z: 0, type: 'exit', title: "동쪽 길로 기브온에 올라가기", to: 'gibeon', spawn: [-36, -6] },
      ],
    },
  };""", """        { id: 'to-gibeon-p', x: 42, z: 0, type: 'exit', title: "동쪽 길로 기브온에 올라가기", to: 'gibeon', spawn: [-36, -6] },
      ],
    },
    // ══ 6편 「룻과 사무엘」 — 베들레헴(룻 1:19 · 2:3 보아스의 밭 · 3:2 타작마당 · 4:1 성문). 북쪽 언덕에 성읍, 서쪽 성문, 남쪽 보리밭, 동쪽 타작마당.
    //    집·성문·밭·타작마당은 두루마리(scrolls/ruth6.js)가 세운다 — 다윗의 고향이라 뒤의 두루마리에서도 다시 쓴다 ══
    bethlehem: {
      name: '베들레헴', questTitle: '📜 퀘스트 — 룻과 사무엘',
      env: { ground: 0xe6dca0, top: 0x5a8fcc, bottom: 0xe2d8ae, fog: 0xdcd4ac, fogD: 0.010, sun: 0xfff3d6, sunDir: [0.5, 0.45, -0.55], cloud: 0.3, cloudCol: 0xffffff, stars: 0, far: 'far-mountains' },
      center: [0, 0], spawn: [0, 36],
      mountain: { x: 0, z: -48, r: 16, h: 12 },
      layout: [
        ['env-acacia', 30, 26, 0.4], ['env-acacia', -28, 20, 1.6], ['env-date-palm', 22, -14, 2.3], ['env-rock-hill', -40, -30, 0.4], ['env-rock-hill', 40, -34, 2.0],
        ['env-rocks-strata', -38, 36, 1.2], ['dry-bush', -20, 4, 0], ['dry-bush', 32, 14, 0],
      ],
      scatter: [['dry-bush', 6, 20, 50], ['rock-group', 8, 22, 50]],
      clear: [[0, 36, 6], [-8, -6, 7], [0, -25, 14], [4, 16, 11], [14, 8, 5], [26, 2, 5], [0, -48, 17], [0, 42, 4]],
      fires: [],
      points: [
        { id: 'to-hebron-b', x: 0, z: 42, type: 'exit', title: "남쪽 길로 헤브론 산지에 가기", to: 'hebron', spawn: [-36, -16] },
      ],
    },
  };""")
rep("  CONDS.philistiaOpen = () => { const p = ST.sp && ST.sp.judges; return !!((p && p.ch >= 7) || DEV_SCROLL); };   // 5편 8장(삿 13:2 소라)부터",
    "  CONDS.philistiaOpen = () => { const p = ST.sp && ST.sp.judges; return !!((p && p.ch >= 7) || (ST.sp && ST.sp.ruth) || DEV_SCROLL); };   // 5편 8장(삿 13:2 소라)부터, 6편에서도\n"
    "  CONDS.bethlehemOpen = () => !!((ST.sp && ST.sp.ruth) || DEV_SCROLL);   // 6편을 펼친 뒤부터")
rep("""  ROUTE.philistia = {}; Object.keys(ROUTE).forEach(z => { if (z === 'philistia') return; ROUTE.philistia[z] = 'to-gibeon-p'; ROUTE[z].philistia = z === 'gibeon' ? 'to-philistia' : ROUTE[z].gibeon; });""",
    """  ROUTE.philistia = {}; Object.keys(ROUTE).forEach(z => { if (z === 'philistia') return; ROUTE.philistia[z] = 'to-gibeon-p'; ROUTE[z].philistia = z === 'gibeon' ? 'to-philistia' : ROUTE[z].gibeon; });
  // 6편: 베들레헴은 헤브론 산지에서 서북쪽 길로만 이어진다
  ROUTE.bethlehem = {}; Object.keys(ROUTE).forEach(z => { if (z === 'bethlehem') return; ROUTE.bethlehem[z] = 'to-hebron-b'; ROUTE[z].bethlehem = z === 'hebron' ? 'to-bethlehem' : ROUTE[z].hebron; });""")
rep("jezreel: 99, philistia: 99 };", "jezreel: 99, philistia: 99, bethlehem: 99 };")
rep("'jezreel', 'philistia']){", "'jezreel', 'philistia', 'bethlehem']){")
rep("      if (z === 'philistia' && !story && !CONDS.philistiaOpen()) continue;   // 블레셋 평지는 5편 8장부터",
    "      if (z === 'philistia' && !story && !CONDS.philistiaOpen()) continue;   // 블레셋 평지는 5편 8장부터\n      if (z === 'bethlehem' && !story && !CONDS.bethlehemOpen()) continue;   // 베들레헴은 6편부터")
rep("(z === 'philistia' && CONDS.philistiaOpen()) ||", "(z === 'philistia' && CONDS.philistiaOpen()) || (z === 'bethlehem' && CONDS.bethlehemOpen()) ||")
rep("jezreel: 'midian', philistia: 'midian' };", "jezreel: 'midian', philistia: 'midian', bethlehem: 'midian' };")
rep("    judges: { to: null, done: () => judgesDone(), ped: 4, what: '기드온의 항아리와 횃불' },   // 6편은 준비 중 — 받침대만 보여 준다",
    "    judges: { to: 'ruth', done: () => judgesDone(), ped: 4, what: '기드온의 항아리와 횃불' },\n    ruth: { to: null, done: () => ruthDone(), ped: 5, what: '에벤에셀 돌' },   // 7편은 준비 중 — 받침대만 보여 준다")
rep("  const PEDESTALS = [[7.2, -8.8], [8.4, -6.6], [9.9, -4.7], [11.6, -3.0], [13.4, -1.6]];", "  const PEDESTALS = [[7.2, -8.8], [8.4, -6.6], [9.9, -4.7], [11.6, -3.0], [13.4, -1.6], [15.3, -0.4]];")
rep("  const judgesDone = () => { const p = ST.sp && ST.sp.judges; return !!(p && p.cleared && p.ch >= 11); };",
    "  const judgesDone = () => { const p = ST.sp && ST.sp.judges; return !!(p && p.cleared && p.ch >= 11); };\n  const ruthDone = () => { const p = ST.sp && ST.sp.ruth; return !!(p && p.cleared && p.ch >= 8); };")
rep("judgesDone() && 'jar-torch-sm'].filter(Boolean);", "judgesDone() && 'jar-torch-sm', ruthDone() && PROP_DEFS['ebenezer-stone-sm'] && 'ebenezer-stone-sm'].filter(Boolean);")
rep("    if (judgesDone() && PEDESTALS[4] && propTemplates['jar-torch-sm']){",
    """    if (ruthDone() && PEDESTALS[5]){   // 여섯 번째 받침대: 에벤에셀 돌(삼상 7:12) — 모델이 없으면 다듬지 않은 돌 도형
      const [x, z] = PEDESTALS[5], y = heightAt(x, z) + 1.06;
      if (propTemplates['ebenezer-stone-sm']){ const o = propTemplates['ebenezer-stone-sm'].holder.clone(true); o.position.set(x, y, z); exhibitObj.add(o); }
      else { const st = new THREE.Mesh(new THREE.DodecahedronGeometry(0.28, 0), new THREE.MeshToonMaterial({ color: 0xb8a888, gradientMap: toonGradient })); st.scale.set(0.8, 1.4, 0.7); st.position.set(x, y + 0.36, z); exhibitObj.add(st); }
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, color: 0xfff0d0, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.3 })); glow.scale.set(1.2, 1.2, 1); glow.position.set(x, y + 0.5, z); exhibitObj.add(glow);
    }
    if (judgesDone() && PEDESTALS[4] && propTemplates['jar-torch-sm']){""")
a = """    el.innerHTML = head + rows + head2 + head3 + head4 + head5 + `<div style="margin-top:8px;font-size:12.5px;opacity:.75">${judgesDone() ? '다섯 받침대가 채워졌어요. 다음 두루마리는 준비하고 있어요.' : joshuaDone()"""
rep(a, """    const head6 = ruthDone() ? `<div class="keyline">🪨 <b>여섯 번째 받침대 — 「룻과 사무엘」의 에벤에셀 돌</b><br><span style="opacity:.8">"사무엘이 돌을 취하여 미스바와 센 사이에 세워 이르되 여호와께서 여기까지 우리를 도우셨다" (사무엘상 7:12)</span></div>` : '';
    el.innerHTML = head + rows + head2 + head3 + head4 + head5 + head6 + `<div style="margin-top:8px;font-size:12.5px;opacity:.75">${ruthDone() ? '여섯 받침대가 채워졌어요. 다음 두루마리는 준비하고 있어요.' : judgesDone() ? '여섯 번째 받침대는 6편 「룻과 사무엘」을 모두 마치면 채워져요.' : joshuaDone()""")
open(p, 'w', encoding='utf-8', newline='').write(s); print('wired')
