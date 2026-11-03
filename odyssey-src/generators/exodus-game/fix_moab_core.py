"""3편 11~16장용 새 마을 「모압 평지」 + 세 번째 받침대(놋뱀 장대) (2026-09-27)."""
p = r'E:\temp\claude-work\exodus-game\prototype.html'
s = open(p, encoding='utf-8').read()

def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:70])
    s = s.replace(a, b)

# 1) 가데스 동쪽 출구 → 모압 평지, 모압 평지 마을
rep("""        { id: 'to-sinai3', x: -39.5, z: 4, type: 'exit', title: "시내 광야로", to: 'sinai', spawn: [35, 6] },
      ],
    },
  };""", """        { id: 'to-sinai3', x: -39.5, z: 4, type: 'exit', title: "시내 광야로", to: 'sinai', spawn: [35, 6] },
        { id: 'to-moab', x: 39.5, z: -4, type: 'exit', title: "모압 평지로", to: 'moab', spawn: [34, 0], cond: 'moabOpen' },
      ],
    },
    // ══ 3편 11~16장 — 모압 평지(민 22:1 "요단 건너편 곧 여리고 맞은편"). 서쪽에 요단 강, 남동쪽에 느보 산 ══
    moab: {
      name: '모압 평지', questTitle: '📜 퀘스트 — 광야 40년',
      env: { top: 0x5b8cc8, bottom: 0xecd9b0, fog: 0xe4d2ac, fogD: 0.011, sun: 0xfff2d4, sunDir: [0.55, 0.42, -0.5], cloud: 0.3, cloudCol: 0xffffff, stars: 0, far: 'far-mountains' },
      center: [0, 0], spawn: [34, 0],
      mountain: { x: 22, z: 44, r: 15, h: 26 },
      water: { x0: -45, x1: -38.5, z0: -48, z1: 48 },
      layout: [
        ['tent-cluster', 18, -2, faceTo(18, -2, 0, -15)], ['tent-large', 8, 12, faceTo(8, 12, 0, -15)], ['tent-mid', 24, 10, faceTo(24, 10, 0, -15)], ['tent-mid', -18, 6, faceTo(-18, 6, 0, -15)],
        ['tent-cluster', -24, -4, faceTo(-24, -4, 0, -15)], ['tent-small', 28, -12, faceTo(28, -12, 0, -15)], ['tent-small', -8, 16, 2.1], ['tent-mid', -26, -26, faceTo(-26, -26, 0, -15)],
        ['camp-firepit', 14, 4, 0], ['tribe-banner', 18, -8, 0.3], ['tribe-banner', -12, 2, 1.1], ['crates-sacks', 22, 2, 0.4], ['jars', -20, 2, 0.3],
        ['env-date-palm', -34, -18, 0.4], ['env-date-palm', -34, 12, 1.6], ['env-date-palm', -33, 30, 2.3], ['palm', -35, -32, 0.8], ['env-acacia', 30, -30, 1.1],
        ['env-rocks-strata', 36, -38, 2.4], ['dry-bush', 32, 20, 0], ['dry-bush', 6, -34, 0],
      ],
      scatter: [['dry-bush', 8, 20, 50], ['rock-group', 10, 22, 50]],
      clear: [[-5, -15, 17], [34, 0, 6], [22, 44, 17], [-28, 30, 6], [0, 4, 8], [-38, 0, 4]],
      fires: [],
      points: [
        { id: 'moses', x: 15, z: -12, type: 'npc', title: "모세", model: 'moses', persona: 'rs_static', cond: 'moabMoses' },
        { id: 'mb_woman', x: -30, z: 2, type: 'villager', title: "요단 강가의 여인", model: 'he-mother', persona: 'rs_static', lazy: true, body: "\\"저 강 건너편이 여리고래요.\\"" },
        { id: 'mb_boy', x: 6, z: 8, type: 'villager', title: "천막의 소년", model: 'he-boy-hb', persona: 'rs_static', lazy: true, body: "\\"광야에서 태어났는데, 이제 강만 건너면 된대요!\\"" },
        { id: 'to-kadesh2', x: 39.5, z: 0, type: 'exit', title: "가데스로", to: 'kadesh', spawn: [34, -4] },
      ],
    },
  };""")
rep("  CONDS.kadeshOpen = () =>",
    "  CONDS.moabOpen = () => { const p = ST.sp && ST.sp.wild3; return !!((p && (p.ch >= 10 || p.cleared && p.ch >= 9)) || DEV_SCROLL); };\n"
    "  CONDS.moabMoses = () => { const p = ST.sp && ST.sp.wild3; return !(p && p.ch >= 15 && p.cleared); };   // 신 34:5 뒤로는 모세가 보이지 않음\n"
    "  CONDS.kadeshOpen = () =>")

# 2) 길 떠나기·미리 받기·배경음·경로
rep("    const need = { alpha: 0, midian: 1, egypt: 2, redsea: 4, wild: 5, rephidim: 6, sinai: 8, kadesh: 99 };\n    for (const z of ['alpha', 'midian', 'egypt', 'redsea', 'wild', 'rephidim', 'sinai', 'kadesh']){",
    "    const need = { alpha: 0, midian: 1, egypt: 2, redsea: 4, wild: 5, rephidim: 6, sinai: 8, kadesh: 99, moab: 99 };\n    for (const z of ['alpha', 'midian', 'egypt', 'redsea', 'wild', 'rephidim', 'sinai', 'kadesh', 'moab']){")
rep("      if (z === 'kadesh' && !story && !CONDS.kadeshOpen()) continue;",
    "      if (z === 'kadesh' && !story && !CONDS.kadeshOpen()) continue;\n      if (z === 'moab' && !story && !CONDS.moabOpen()) continue;")
rep("|| (z === 'kadesh' && CONDS.kadeshOpen());", "|| (z === 'kadesh' && CONDS.kadeshOpen()) || (z === 'moab' && CONDS.moabOpen());")
rep("'sinai', 'kadesh'], si = SEQ.indexOf(Z.id)", "'sinai', 'kadesh', 'moab'], si = SEQ.indexOf(Z.id)")
rep("sinai: 'midian', kadesh: 'midian' };", "sinai: 'midian', kadesh: 'midian', moab: 'midian' };")
rep("  ROUTE.kadesh = {}; Object.keys(ROUTE).forEach(z => { if (z === 'kadesh') return; ROUTE.kadesh[z] = 'to-sinai3'; ROUTE[z].kadesh = z === 'sinai' ? 'to-kadesh' : ROUTE[z].sinai; });",
    "  ROUTE.kadesh = {}; Object.keys(ROUTE).forEach(z => { if (z === 'kadesh') return; ROUTE.kadesh[z] = 'to-sinai3'; ROUTE[z].kadesh = z === 'sinai' ? 'to-kadesh' : ROUTE[z].sinai; });\n"
    "  ROUTE.moab = {}; Object.keys(ROUTE).forEach(z => { if (z === 'moab') return; ROUTE.moab[z] = 'to-kadesh2'; ROUTE[z].moab = z === 'kadesh' ? 'to-moab' : ROUTE[z].kadesh; });")

# 3) 모압 평지에도 완성된 성막
rep("    if (Z.id === 'kadesh'){ tabStage = -1; buildTabernacle(16); buildGlory(!kadeshNoGlory); buildArkAt(TAB.x0 + 1.2, TAB.z, Math.PI / 2); }",
    "    if (Z.id === 'kadesh' || Z.id === 'moab'){ tabStage = -1; buildTabernacle(16); buildGlory(Z.id === 'moab' || !kadeshNoGlory); buildArkAt(TAB.x0 + 1.2, TAB.z, Math.PI / 2); }")
rep("setGlory: on => { kadeshNoGlory = !on; if (Z && Z.id === 'kadesh') buildGlory(on); },",
    "setGlory: on => { kadeshNoGlory = !on; if (Z && Z.id === 'kadesh') buildGlory(on); }, addGeneal2: n => addGeneal(n),")

# 4) 세 번째 받침대: 놋뱀 장대(3편을 모두 마치면)
rep("  const sinai2Done = () => { const p = ST.sp && ST.sp.sinai2; return !!(p && p.cleared && p.ch >= 9); };",
    "  const sinai2Done = () => { const p = ST.sp && ST.sp.sinai2; return !!(p && p.cleared && p.ch >= 9); };\n"
    "  const wild3Done = () => { const p = ST.sp && ST.sp.wild3; return !!(p && p.cleared && p.ch >= 15); };")
rep("""  const sinai2Done = () =>""", """  function exhibitSerpent(){
    if (!wild3Done() || !PEDESTALS[2] || !exhibitObj) return;
    const [x, z] = PEDESTALS[2], y = heightAt(x, z) + 1.06, bronze = new THREE.MeshToonMaterial({ color: 0xb07a3a, gradientMap: toonGradient }), wood = new THREE.MeshToonMaterial({ color: 0x7a5a3a, gradientMap: toonGradient }), g = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.5, 8), wood); pole.position.y = 0.75; g.add(pole);
    const coil = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.035, 8, 20, Math.PI * 3.2), bronze); coil.rotation.x = Math.PI / 2; coil.position.y = 1.25; g.add(coil);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), bronze); head.scale.set(1.4, 0.8, 1); head.position.set(0.12, 1.42, 0); g.add(head);
    g.position.set(x, y, z); exhibitObj.add(g);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, color: 0xffd9a0, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.3 })); glow.scale.set(1.4, 1.4, 1); glow.position.set(x, y + 1.2, z); exhibitObj.add(glow);
  }
  const sinai2Done = () =>""")
rep("""      tg.position.set(x, y, z); tg.rotation.y = faceTo(x, z, 0, 0); exhibitObj.add(tg);""",
    """      tg.position.set(x, y, z); tg.rotation.y = faceTo(x, z, 0, 0); exhibitObj.add(tg);""")
rep("""  const sinai2Done = () => { const p = ST.sp && ST.sp.sinai2; return !!(p && p.cleared && p.ch >= 9); };\n""",
    """  const sinai2Done = () => { const p = ST.sp && ST.sp.sinai2; return !!(p && p.cleared && p.ch >= 9); };\n""")
# 전시관을 세울 때 세 번째 받침대도
rep("""    if (sinai2Done() && PEDESTALS[1]){   // 두 번째 받침대: 은 나팔 둘(민 10:2)""",
    """    exhibitSerpent();   // 세 번째 받침대: 놋뱀 장대(민 21:9)
    if (sinai2Done() && PEDESTALS[1]){   // 두 번째 받침대: 은 나팔 둘(민 10:2)""")
rep("""    el.innerHTML = head + rows + head2 + `<div style="margin-top:8px;font-size:12.5px;opacity:.75">${sinai2Done() ? '세 번째 받침대는 다음 두루마리를 기다리고 있어요.' : '두 번째 받침대는 2편 「시내산의 마지막 한 달」을 모두 마치면 채워져요.'}</div>`;""",
    """    const head3 = wild3Done() ? `<div class="keyline">🐍 <b>세 번째 받침대 — 「광야 40년」의 놋뱀 장대</b><br><span style="opacity:.8">"모세가 놋뱀을 만들어 장대 위에 다니 뱀에게 물린 자가 놋뱀을 쳐다본즉 모두 살더라" (민수기 21:9)</span></div>` : '';
    el.innerHTML = head + rows + head2 + head3 + `<div style="margin-top:8px;font-size:12.5px;opacity:.75">${wild3Done() ? '세 받침대가 모두 채워졌어요. 다음 두루마리의 기념물은 새 받침대에 놓여요.' : sinai2Done() ? '세 번째 받침대는 3편 「광야 40년」을 모두 마치면 채워져요.' : '두 번째 받침대는 2편 「시내산의 마지막 한 달」을 모두 마치면 채워져요.'}</div>`;""")
open(p, 'w', encoding='utf-8').write(s)
print('ok')
