  // ── 만들 수 있는 것 ─────────────────────────────────────────
  const CRAFT = [
    { k: 'craft-staff-acacia',  slot: 'staff', ico: '🦯', n: '조각목 지팡이',   mats: { wood: 4 }, cost: 10, note: '"그들은 조각목으로 궤를 짜되" (출 25:10)' },
    { k: 'craft-staff-bronze',  slot: 'staff', ico: '🦯', n: '놋 장식 지팡이',  mats: { wood: 3, bronze: 3 }, cost: 20, note: '"금과 은과 놋으로 만들게 하며" (출 31:4)' },
    { k: 'craft-staff-silver',  slot: 'staff', ico: '🦯', n: '은 손잡이 지팡이', mats: { wood: 3, silver: 2 }, cost: 30, note: '손잡이를 은으로 싼 지팡이' },
    { k: 'craft-staff-onyx',    slot: 'staff', ico: '💎', n: '호마노 지팡이',   mats: { wood: 3, gold: 1, onyx: 1 }, cost: 40, note: '"호마노 두 개를 가져다가 그 위에 이스라엘 아들들의 이름을 새기되" (출 28:9)', hidden: true },
    { k: 'craft-sash-linen',    slot: 'robe',  ico: '🎗', n: '가는 베 띠',      mats: { flax: 3 }, cost: 10, note: '"가는 베 실을 가져왔으며" (출 35:25)' },
    { k: 'craft-sash-blue',     slot: 'robe',  ico: '🎗', n: '청색 술 띠',      mats: { flax: 2, blue: 2 }, cost: 20, note: '"옷단 귀에 술을 만들고 청색 끈을 그 귀의 술에 더하라" (민 15:38)' },
    { k: 'craft-robe-wool',     slot: 'robe',  ico: '🧥', n: '양털 겉옷',       mats: { wool: 4, goat: 1 }, cost: 25, note: '광야의 밤을 지켜 주는 따뜻한 겉옷' },
    { k: 'craft-cloak-purple',  slot: 'robe',  ico: '🧥', n: '자색 망토',       mats: { wool: 3, purple: 2, gold: 1 }, cost: 40, note: '금 고리로 여미는 자색 망토' },
    { k: 'craft-shoes-papyrus', slot: 'shoes', ico: '👡', n: '파피루스 신',     mats: { papyrus: 3 }, cost: 10, note: '나일 강가의 파피루스로 엮은 가벼운 신' },
    { k: 'craft-shoes-travel',  slot: 'shoes', ico: '👢', n: '광야 여행자 신',  mats: { papyrus: 2, goat: 2, bronze: 1 }, cost: 25, note: '"너희 발의 신이 해어지지 아니하였으며" (신 29:5)' },
    { k: 'craft-head-linen',    slot: 'head',  ico: '🧣', n: '베 두건',         mats: { flax: 3 }, cost: 10, note: '햇볕을 가려 주는 흰 베 두건' },
    { k: 'craft-head-goat',     slot: 'head',  ico: '🧣', n: '염소털 머리띠',   mats: { goat: 3, scarlet: 1 }, cost: 15, note: '"염소 털로 실을 뽑았으며" (출 35:26)' },
    { k: 'craft-head-gold',     slot: 'head',  ico: '👑', n: '금 머리띠',       mats: { gold: 2, flax: 1 }, cost: 35, note: '금실을 감은 머리띠' },
  ];
  const craftDef = k => CRAFT.find(c => c.k === k);
  const GEAR_SLOTS = ['robe', 'shoes', 'head'];

  // ── 지팡이(공방 것)는 코드로 모양을 만듦: 상점 지팡이와 같은 손에 쥠 ──
  const toonMat = c => new THREE.MeshToonMaterial({ color: c, gradientMap: toonGradient });
  function makeStaff(kind){
    const g = new THREE.Group(), L = 1.5;
    const woodC = { acacia: 0x9a6a3a, bronze: 0x7a5230, silver: 0x6e4a2c, onyx: 0x5a3a24 }[kind];
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.034, L, 8), toonMat(woodC)); shaft.position.y = L / 2; g.add(shaft);
    if (kind === 'acacia'){ const k = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), toonMat(0x7d5430)); k.position.y = L; g.add(k);
      for (const y of [0.45, 0.9]){ const n = new THREE.Mesh(new THREE.SphereGeometry(0.036, 6, 4), toonMat(0x7d5430)); n.position.set(0.02, y, 0); g.add(n); } }
    if (kind === 'bronze'){ for (const y of [0.35, 0.8, 1.25]){ const r = new THREE.Mesh(new THREE.TorusGeometry(0.036, 0.012, 6, 14), toonMat(0xc4803a)); r.rotation.x = Math.PI / 2; r.position.y = y; g.add(r); }
      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 8), toonMat(0xc4803a)); cap.position.y = L + 0.05; g.add(cap); }
    if (kind === 'silver'){ const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.3, 10), toonMat(0xdfe4ea)); grip.position.y = L - 0.25; g.add(grip);
      const top = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), toonMat(0xeef2f6)); top.position.y = L; g.add(top); }
    if (kind === 'onyx'){ const hook = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.028, 8, 16, Math.PI * 1.2), toonMat(woodC)); hook.position.set(0.12, L, 0); hook.rotation.z = -0.2; g.add(hook);
      const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.06, 0), new THREE.MeshToonMaterial({ color: 0x2b2b3a, gradientMap: toonGradient, emissive: 0x3a3a6a, emissiveIntensity: 0.6 })); gem.position.y = L - 0.02; g.add(gem);
      for (const y of [0.5, 1.0]){ const r = new THREE.Mesh(new THREE.TorusGeometry(0.036, 0.011, 6, 14), toonMat(0xe8c060)); r.rotation.x = Math.PI / 2; r.position.y = y; g.add(r); } }
    return g;
  }
  for (const c of CRAFT) if (c.slot === 'staff') SHOP[c.k] = { cat: 'staff', name: c.n, h: 1.5, craft: true, proc: () => makeStaff(c.k.split('-')[2]) };

  // ── 몸에 두르는 것(겉옷·띠 · 신발 · 머리장식): 뼈 위치를 매 프레임 따라감(몸은 학생 앞쪽을 향함) ──
  function gearParts(k){   // [{ bone, off:[옆, 위, 앞], obj }] — 단위: 캐릭터 키(2.2) 기준 월드 단위
    const out = [], P = (bone, off, obj) => out.push({ bone, off, obj });
    const band = (r, h, c, open) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.04, h, 20, 1, true), toonMat(c)); m.material.side = THREE.DoubleSide; return m; };
    const ring = (r, t, c) => { const m = new THREE.Mesh(new THREE.TorusGeometry(r, t, 8, 24), toonMat(c)); m.rotation.x = Math.PI / 2; return m; };
    if (k === 'craft-head-linen' || k === 'craft-head-goat' || k === 'craft-head-gold'){
      const g = new THREE.Group();
      if (k === 'craft-head-linen'){ g.add(band(0.19, 0.09, 0xf3ecd8)); const t1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.24, 0.02), toonMat(0xf3ecd8)); t1.position.set(0.04, -0.12, -0.19); t1.rotation.z = 0.15; const t2 = t1.clone(); t2.position.x = -0.04; t2.rotation.z = -0.15; g.add(t1, t2); }
      if (k === 'craft-head-goat'){ g.add(ring(0.188, 0.03, 0x4a3424)); const r2 = ring(0.195, 0.013, 0xc8342c); r2.position.y = 0.012; g.add(r2); }
      if (k === 'craft-head-gold'){ g.add(ring(0.183, 0.016, 0xe8c060)); const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.03, 0), toonMat(0xd04040)); gem.position.set(0, 0.01, 0.19); g.add(gem); }
      P('Head', [0, 0.2, -0.01], g);
    }
    if (k === 'craft-sash-linen' || k === 'craft-sash-blue'){
      const g = new THREE.Group(), col = k === 'craft-sash-blue' ? 0x2f5fb0 : 0xf1e9d2;
      g.add(band(0.235, 0.075, col));
      const tail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.26, 0.015), toonMat(col)); tail.position.set(0.12, -0.14, 0.2); tail.rotation.z = 0.1; g.add(tail);
      if (k === 'craft-sash-blue'){ for (const [x, z] of [[0.17, 0.16], [-0.17, 0.16], [0.17, -0.16], [-0.17, -0.16]]){ const t = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.02, 0.16, 6), toonMat(0x1e3f8a)); t.position.set(x, -0.1, z); g.add(t); } }
      P('Hips', [0, 0.1, 0], g);
    }
    if (k === 'craft-robe-wool' || k === 'craft-cloak-purple'){
      const g = new THREE.Group(), col = k === 'craft-cloak-purple' ? 0x6b2d86 : 0xe9e1cf;
      const cape = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.34, 0.98, 18, 1, true, Math.PI * 0.6, Math.PI * 0.8), toonMat(col)); cape.material.side = THREE.DoubleSide; cape.position.y = -0.5; g.add(cape);
      const collar = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.035, 8, 20), toonMat(k === 'craft-cloak-purple' ? 0x562070 : 0xf6f1e4)); collar.rotation.x = Math.PI / 2; g.add(collar);
      if (k === 'craft-cloak-purple'){ const clasp = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.01, 6, 12), toonMat(0xe8c060)); clasp.position.set(0, -0.02, 0.17); g.add(clasp); }
      P('neck', [0, -0.04, -0.03], g);
    }
    if (k === 'craft-shoes-papyrus' || k === 'craft-shoes-travel'){
      for (const [side, toe] of [['LeftFoot', 'LeftToeBase'], ['RightFoot', 'RightToeBase']]){
        const g = new THREE.Group(), travel = k === 'craft-shoes-travel', col = travel ? 0x6a4428 : 0xd2b27a, dark = travel ? 0x4a2e1a : 0xa8864a;
        const shell = new THREE.Mesh(new THREE.CapsuleGeometry(0.105, 0.25, 4, 12).rotateX(Math.PI / 2), toonMat(col)); shell.scale.set(0.9, 0.82, 1.02); shell.position.set(0, 0.11, 0.03); g.add(shell);
        const sole = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.035, 0.45), toonMat(dark)); sole.position.set(0, 0.03, 0.02); g.add(sole);
        for (const z of travel ? [-0.06, 0.05, 0.15] : [-0.09, -0.01, 0.07, 0.15]){ const st = new THREE.Mesh(new THREE.TorusGeometry(0.1, travel ? 0.014 : 0.009, 6, 16), toonMat(dark)); st.scale.set(0.92, 0.84, 1); st.position.set(0, 0.11, z); g.add(st); }
        if (travel){ const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.105, 0.2, 12), toonMat(col)); cuff.position.set(0, 0.25, -0.11); g.add(cuff);
          const lace = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.013, 6, 16), toonMat(dark)); lace.rotation.x = Math.PI / 2; lace.position.set(0, 0.32, -0.11); g.add(lace); }
        out.push({ bone: side, toe, off: [0, 0, 0], obj: g });
      }
    }
    return out;
  }
  let SHOE_DY = 0.07;   // 발끝 뼈에서 신 바닥까지
  const gearOn = {};   // slot → { key, parts }
  let gearModel = null;
  const _gv = new THREE.Vector3(), _gf = new THREE.Vector3();
  function playerModel(){ return player.children.find(o => o.getObjectByName && o.getObjectByName('Head')) || null; }
  function applyGear(){
    gearModel = playerModel(); if (!gearModel) return;
    for (const s of GEAR_SLOTS){
      const want = equip[s] && owned.has(equip[s]) ? equip[s] : null, cur = gearOn[s];
      if (cur && cur.key === want) continue;
      if (cur){ cur.parts.forEach(p => player.remove(p.obj)); delete gearOn[s]; }
      if (!want) continue;
      const parts = gearParts(want).map(p => ({ ...p, b: gearModel.getObjectByName(p.bone), t: p.toe ? gearModel.getObjectByName(p.toe) : null })).filter(p => p.b);
      parts.forEach(p => { p.obj.traverse(o => { if (o.isMesh) o.castShadow = true; }); player.add(p.obj); });
      gearOn[s] = { key: want, parts };
    }
  }
  function updateGear(){
    if (!gearModel) return;
    const hf = gearModel.getObjectByName('headfront'), hd = gearModel.getObjectByName('Head');
    let yaw = 0;
    if (hf && hd){ hf.getWorldPosition(_gf); hd.getWorldPosition(_gv); player.worldToLocal(_gf); player.worldToLocal(_gv); yaw = Math.atan2(_gf.x - _gv.x, _gf.z - _gv.z); }
    const s = Math.sin(yaw), c = Math.cos(yaw);
    for (const slot in gearOn) for (const p of gearOn[slot].parts){
      p.b.getWorldPosition(_gv); player.worldToLocal(_gv);
      if (p.t){ p.t.getWorldPosition(_gf); player.worldToLocal(_gf); p.obj.position.set(_gv.x + (_gf.x - _gv.x) * 0.6, _gf.y - SHOE_DY, _gv.z + (_gf.z - _gv.z) * 0.6); p.obj.rotation.y = Math.atan2(_gf.x - _gv.x, _gf.z - _gv.z); continue; }
      const [ox, oy, oz] = p.off;
      p.obj.position.set(_gv.x + ox * c + oz * s, _gv.y + oy, _gv.z - ox * s + oz * c);
      p.obj.rotation.y = yaw;
    }
  }

  // ── 재료 모으는 곳(마을에 놓이는 반짝이): 종류마다 하루 3번 ──
  const GATHER = {
    wood:    { t: '🪓 조각목 베기', game: 'timing', hits: 3, give: () => ({ wood: 2 }), verse: '"조각목이 있는 모든 자는 가져왔으며" (출애굽기 35:24)', how: '도끼를 휘둘러요 — 바늘이 <b>초록 칸</b>에 올 때 3번 누르기' },
    ore:     { t: '⛏ 구리 광석 캐기', game: 'timing', hits: 4, give: () => ({ bronze: 1 + (Math.random() < 0.4 ? 1 : 0) }), verse: '"금과 은과 놋으로 만들게 하며" (출애굽기 31:4)', how: '곡괭이로 바위를 쳐요 — 바늘이 <b>초록 칸</b>에 올 때 4번 누르기' },
    flax:    { t: '🌿 삼 거두기', game: 'mash', give: () => ({ flax: 2 }), verse: '"삼은 꽃이 피었으므로" (출애굽기 9:31) — 삼(아마)에서 가는 베 실을 뽑았어요', how: '<b>빠르게 여러 번</b> 눌러 삼 줄기를 뽑아요(6초)' },
    papyrus: { t: '🌾 파피루스 베기', game: 'mash', give: () => ({ papyrus: 2 }), verse: '"갈대 상자를 가져다가 역청과 나무 진을 칠하고" (출애굽기 2:3)', how: '<b>빠르게 여러 번</b> 눌러 줄기를 베어요(6초)' },
    shear:   { t: '✂️ 양털 깎기', game: 'timing', hits: 3, give: () => ({ wool: 2, goat: 1 }), verse: '"염소 털로 실을 뽑았으며" (출애굽기 35:26)', how: '가위질 — 바늘이 <b>초록 칸</b>에 올 때 3번 누르기' },
  };
  const GATHER_MAX = 3;
  function gatherLeft(kind){ const d = kstDate(); if (!ST.gather || ST.gather.d !== d) ST.gather = { d, n: {} }; return GATHER_MAX - (ST.gather.n[kind] || 0); }
  const aft3 = () => chaptersDone() >= 3, aft5 = () => chaptersDone() >= 5;
  Object.assign(CONDS, { aft3, aft5, craftOpen: () => true });
  const GPTS = {
    midian:   [{ id: 'act_signs', x: -31.5, z: -33.2, challenge: 'signs', cond: 'aft1', title: '🐍 두 가지 표징' }, { id: 'g_md_wood', x: -9, z: 6, gather: 'wood' }, { id: 'g_md_shear', x: 14.5, z: 7, gather: 'shear' }],
    egypt:    [{ id: 'g_eg_flax', x: 20, z: 13, gather: 'flax', cond: 'aft3' }, { id: 'g_eg_papyrus', x: -25, z: -9, gather: 'papyrus', cond: 'aft3' },
               { id: 'act_idol', x: 15, z: -4, challenge: 'idol', cond: 'aft3', title: '🔨 돌 우상 부수기' },
               { id: 'act_herd', x: -12, z: 11.5, challenge: 'herdSheep', cond: 'aft3', title: '🐑 흩어진 양 몰기' },
               { id: 'act_guard', x: -5.5, z: 19, challenge: 'guard', cond: 'aft3', title: '🐺 양 지키기' },
               { id: 'act_pick', x: -18.5, z: 19, challenge: 'pick', cond: 'aft3', title: '🐑 흠 없는 어린 양 고르기' }],
    wild:     [{ id: 'g_wd_wood', x: -12, z: 8, gather: 'wood' }, { id: 'act_quail', x: 12, z: -8, challenge: 'quail', cond: 'aft5', title: '🐦 메추라기 잡기' }],
    rephidim: [{ id: 'g_rp_wood', x: 10, z: 12, gather: 'wood' }, { id: 'g_rp_ore', x: -14, z: -12, gather: 'ore' }],
    sinai:    [{ id: 'g_sn_ore', x: 14, z: -22, gather: 'ore' }],
  };
  for (const [z, arr] of Object.entries(GPTS)) if (ZONES[z]) for (const p of arr) ZONES[z].points.push({ type: 'lore', body: '', title: p.title || GATHER[p.gather].t, ...p });
  ZONES.alpha.points.push({ id: 'a_bezalel', x: -5, z: -9.5, type: 'villager', title: '브살렐 (공방)', model: 'ca-craftsman',
    body: "유다 지파 훌의 손자요 우리의 아들인 브살렐 (출 31:2) — 재료를 모아 오면 공방에서 지팡이·옷·신·머리띠를 만들 수 있어요." });

  function gatherGame(kind, marker){
    const G = GATHER[kind], left = gatherLeft(kind);
    if (left <= 0){ toast(`${G.t}: 오늘은 여기까지! 내일 다시 오세요 (하루 ${GATHER_MAX}번)`, 2400); return; }
    mgOpen(G.t, `${G.how} · 오늘 ${left}번 더 할 수 있어요<br><span style="opacity:.75">${G.verse}</span>`);
    const done = () => {
      ST.gather.n[kind] = (ST.gather.n[kind] || 0) + 1; ST.gatherZone = ST.gatherZone || {}; ST.gatherZone[Z.id] = (ST.gatherZone[Z.id] || 0) + 1;
      const got = addMat(G.give(), G.t); dq('gather', got);
      mgAct.textContent = gatherLeft(kind) > 0 ? '한 번 더!' : '오늘은 끝'; mgAct.disabled = gatherLeft(kind) <= 0;
    };
    if (G.game === 'mash') return mashGame(done);
    return timingGame(G.hits, done);
  }
  function timingGame(need, onWin){
    mgArea.innerHTML = `<div class="mg-bar"><div class="mg-zone"></div><div class="mg-needle"></div></div><div class="mg-brick" style="font-size:26px"></div>`;
    const zone = mgArea.querySelector('.mg-zone'), needle = mgArea.querySelector('.mg-needle'), cnt = mgArea.querySelector('.mg-brick');
    let pos = 0, dir = 1, speed = 0.95, zc = 0.5, zw = 0.24, hits = 0, playing = false, last = 0, t0 = 0;
    const newZone = () => { zw = Math.max(0.12, 0.24 - hits * 0.03); zc = zw / 2 + Math.random() * (1 - zw); zone.style.left = ((zc - zw / 2) * 100) + '%'; zone.style.width = (zw * 100) + '%'; };
    const draw = () => { cnt.textContent = '✔'.repeat(hits) + '·'.repeat(Math.max(0, need - hits)); };
    newZone(); draw();
    const loop = now => { const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
      pos += dir * speed * dt; if (pos > 1){ pos = 1; dir = -1; } if (pos < 0){ pos = 0; dir = 1; } needle.style.left = (pos * 100) + '%';
      if (playing){ const l = Math.max(0, 15 - (now - t0) / 1000); mgStat.textContent = `⏱ ${l.toFixed(1)}초`; if (l <= 0){ playing = false; mgAct.textContent = '다시 하기'; mgStat.textContent = '시간이 다 됐어요 — 다시 해 볼까요?'; } }
      mg.raf = requestAnimationFrame(loop); };
    mg.raf = requestAnimationFrame(loop);
    mgAct.onclick = () => {
      if (!playing){ if (mgAct.disabled) return; playing = true; hits = 0; speed = 0.95; t0 = performance.now(); mgAct.textContent = '누르기!'; newZone(); draw(); return; }
      if (window.__mgCheat || Math.abs(pos - zc) <= zw / 2){ hits++; speed = Math.min(1.8, speed + 0.15); newZone(); draw();
        if (hits >= need){ playing = false; mgStat.textContent = '🎉 성공!'; onWin(); } }
      else { mgArea.style.background = 'rgba(210,60,40,0.35)'; setTimeout(() => mgArea.style.background = '', 150); }
    };
  }
  function mashGame(onWin){
    mgArea.innerHTML = `<div class="mg-bar"><div class="mg-fill" style="position:absolute;left:0;top:0;bottom:0;width:0;background:#9be58a;border-radius:8px"></div></div>`;
    const fill = mgArea.querySelector('.mg-fill');
    let v = 0, playing = false, last = 0, t0 = 0;
    const loop = now => { const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
      if (playing){ v = Math.max(0, v - dt * 0.14); const l = Math.max(0, 6 - (now - t0) / 1000); mgStat.textContent = `⏱ ${l.toFixed(1)}초`;
        if (v >= 1){ playing = false; mgStat.textContent = '🎉 성공!'; onWin(); } else if (l <= 0){ playing = false; mgAct.textContent = '다시 하기'; mgStat.textContent = '조금 모자랐어요 — 다시 해 볼까요?'; } }
      fill.style.width = (Math.min(1, v) * 100) + '%'; mg.raf = requestAnimationFrame(loop); };
    mg.raf = requestAnimationFrame(loop);
    mgAct.onclick = () => {
      if (!playing){ if (mgAct.disabled) return; playing = true; v = 0; t0 = performance.now(); mgAct.textContent = '누르기! 누르기!'; return; }
      v += 0.075;
    };
  }

  // ── 활동 퀘스트: 하루 한 번 보상(다시 해도 재미로는 가능) ──
  const ACT = {
    herdSheep: { n: '🐑 흩어진 양 몰기', give: { scarlet: 2 } },
    guard:     { n: '🐺 양 지키기', give: { blue: 2 } },
    pick:      { n: '🐑 흠 없는 어린 양 고르기', give: { purple: 1, silver: 1 } },
    quail:     { n: '🐦 메추라기 잡기', give: { scarlet: 2 } },
    idol:      { n: '🔨 돌 우상 부수기', give: null },
  };
  function actWin(kind){
    const d = kstDate(); if (!ST.act || ST.act.d !== d) ST.act = { d, done: [] };
    wq('act3');
    if (ST.act.done.includes(kind)){ toast(`${ACT[kind].n} 성공! (오늘 재료 보상은 이미 받았어요 — 내일 또 와요)`, 2600); return; }
    ST.act.done.push(kind); saveST(); dq('act');
    if (ACT[kind].give) addMat(ACT[kind].give, `${ACT[kind].n} 성공`);
  }
  const actDone = kind => ST.act && ST.act.d === kstDate() && ST.act.done.includes(kind);

  // 🔨 돌 우상 부수기(출 12:12, 34:13): 우상에서 은·금은 챙기지 않음(신 7:25)
  let idolObjs = [];
  function buildIdols(){
    idolObjs.forEach(o => o.parent && o.parent.remove(o)); idolObjs = [];
    if (!Z || Z.id !== 'egypt' || !aft3()) return;
    const stone = toonMat(0x9c8f7a), dark = toonMat(0x6d6252);
    [[13.2, -5.5], [16.8, -5.2], [15, -2.2]].forEach(([x, z], i) => {
      const g = new THREE.Group(); g.position.set(x, heightAt(x, z), z);
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.3, 0.7), dark); base.position.y = 0.15; g.add(base);
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.1, 0.35), stone); body.position.y = 0.85; g.add(body);
      const head = new THREE.Mesh(i === 1 ? new THREE.ConeGeometry(0.28, 0.5, 4) : new THREE.BoxGeometry(0.4, 0.42, 0.4), stone); head.position.y = 1.62; g.add(head);
      if (i !== 1){ const e1 = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.28, 4), stone); e1.position.set(0.14, 1.95, 0); const e2 = e1.clone(); e2.position.x = -0.14; g.add(e1, e2); }
      g.rotation.y = faceTo(x, z, 15, 2); zoneRoot.add(g); idolObjs.push(g);
      obstacles.push({ x, z, r: 0.45 });
    });
  }
  function idolGame(){
    mgOpen('🔨 돌 우상 부수기', `애굽 사람들이 섬기던 돌 우상이에요. <b>빠르게 여러 번</b> 눌러 우상을 깨뜨리세요(6초).<br><span style="opacity:.75">"애굽의 모든 신을 내가 심판하리라" (출애굽기 12:12) · "그들의 주상을 깨뜨리고" (출애굽기 34:13)</span>`);
    mashGame(() => {
      idolObjs.forEach((g, i) => setTimeout(() => { g.children.forEach((m, j) => { m.position.x += (Math.random() - 0.5) * 0.6; m.position.y = Math.max(0.1, m.position.y * 0.25); m.rotation.set(Math.random(), Math.random(), Math.random()); }); }, i * 180));
      document.getElementById('mg-info').innerHTML = `우상을 모두 깨뜨렸어요! 🔨<br><span style="opacity:.8">우상에 입힌 은이나 금은 챙기지 않아요 — "그것에 입힌 은이나 금을 탐내지 말며 취하지 말라" (신명기 7:25)</span>`;
      if (!ST.badges.includes('idol_breaker')){ ST.badges.push('idol_breaker'); saveST(); setTimeout(() => toast('🔨 배지 획득: 우상을 깨뜨린 손', 2400), 600); }
      actWin('idol');
    });
  }
  Object.assign(BADGES, { idol_breaker: { ico: '🔨', name: '우상을 깨뜨린 손' }, craftsman: { ico: '🛠', name: '지혜로운 손' } });

  // 🐑 흠 없는 어린 양 고르기(출 12:5, 레 22:19-20): 여섯 마리 중 흠 없는 한 마리, 5판
  function lambSVG(flaw){
    const spot = flaw === 'spot' ? '<circle cx="46" cy="40" r="7" fill="#6b4a2a"/>' : '';
    const ear = flaw === 'ear' ? '' : '<ellipse cx="20" cy="22" rx="7" ry="4" fill="#e8dcc6" transform="rotate(-25 20 22)"/>';
    const legB = flaw === 'leg' ? 58 : 66, scar = flaw === 'scar' ? '<path d="M30 34 L42 46 M34 32 L44 44" stroke="#b33" stroke-width="2.5"/>' : '';
    const eye = flaw === 'eye' ? '<path d="M14 26 l5 5 M19 26 l-5 5" stroke="#333" stroke-width="2"/>' : '<circle cx="16" cy="28" r="2.2" fill="#222"/>';
    return `<svg viewBox="0 0 80 72" width="100%"><rect x="24" y="50" width="5" height="16" rx="2" fill="#d9ccb4"/><rect x="34" y="50" width="5" height="16" rx="2" fill="#d9ccb4"/><rect x="50" y="50" width="5" height="16" rx="2" fill="#d9ccb4"/><rect x="60" y="50" width="5" height="${legB - 50}" rx="2" fill="#d9ccb4"/>
      <ellipse cx="46" cy="40" rx="26" ry="16" fill="#fbf6ea" stroke="#d8ccb4"/><circle cx="34" cy="30" r="9" fill="#fbf6ea"/><circle cx="54" cy="29" r="9" fill="#fbf6ea"/>${spot}${scar}
      <ellipse cx="18" cy="30" rx="11" ry="9" fill="#efe4cf"/>${ear}${eye}</svg>`;
  }
  function pickGame(){
    mgOpen('🐑 흠 없는 어린 양 고르기', `유월절 어린 양은 흠이 없어야 했어요. 여섯 마리 중 <b>흠 없는 한 마리</b>를 찾아 누르세요! (한 판에 8초, 5판)<br><span style="opacity:.75">"너희 어린 양은 흠 없고 일 년 된 수컷으로 하되" (출애굽기 12:5)</span>`);
    let round = 0, score = 0, t0 = 0, playing = false, good = -1, last = 0;
    const FLAWS = ['spot', 'ear', 'leg', 'scar', 'eye'];
    const deal = () => { good = (Math.random() * 6) | 0; const fl = [...FLAWS].sort(() => Math.random() - 0.5);
      mgArea.innerHTML = `<div class="pick-grid">${[0, 1, 2, 3, 4, 5].map(i => `<button data-lamb="${i}" style="background:rgba(255,255,255,0.08);border:2px solid rgba(255,210,122,0.35);border-radius:10px;padding:2px">${lambSVG(i === good ? null : fl[(i + round) % 5])}</button>`).join('')}</div>`;
      t0 = performance.now(); };
    const next = ok => { if (ok) score++; round++; if (round >= 5){ playing = false; mgAct.textContent = '다시 하기'; mgAct.disabled = false;
        document.getElementById('mg-info').innerHTML = `${score} / 5 마리를 바르게 골랐어요! ${score >= 4 ? '🎉 흠 없는 양을 잘 알아봤어요' : '다시 해 볼까요? (4마리 이상이면 성공)'}<br><span style="opacity:.75">"흠 있는 것은 무엇이나 너희가 드리지 말 것은 그것이 기쁘게 받으심이 되지 못할 것임이니라" (레위기 22:20)</span>`;
        mgArea.innerHTML = ''; if (score >= 4) actWin('pick'); return; }
      deal(); };
    mgArea.onclick = e => { const b = e.target.closest('[data-lamb]'); if (!b || !playing) return; const ok = +b.dataset.lamb === good;
      b.style.borderColor = ok ? '#9be58a' : '#e86060'; if (!ok) mgArea.querySelector(`[data-lamb="${good}"]`).style.borderColor = '#9be58a'; playing = false; setTimeout(() => { playing = true; next(ok); }, ok ? 350 : 900); };
    const loop = now => { if (playing && round < 5){ const l = Math.max(0, 8 - (now - t0) / 1000); mgStat.textContent = `${round + 1}번째 · ⏱ ${l.toFixed(1)}초 · 맞힘 ${score}`; if (l <= 0){ playing = false; mgArea.querySelector(`[data-lamb="${good}"]`).style.borderColor = '#9be58a'; setTimeout(() => { playing = true; next(false); }, 900); } }
      mg.raf = requestAnimationFrame(loop); };
    mg.raf = requestAnimationFrame(loop);
    mgAct.onclick = () => { if (playing) return; round = 0; score = 0; playing = true; mgAct.disabled = true; mgAct.textContent = '고르는 중…'; deal(); };
    mg.onClose = () => { mgArea.onclick = null; };
  }

  // 🐑 흩어진 양 몰기 · 🐺 양 지키기 · 🐦 메추라기 잡기: 3D로 직접 뛰어다니는 활동(live)
  const jackalGeo = new THREE.BoxGeometry(0.34, 0.3, 0.8), jackalHead = new THREE.ConeGeometry(0.16, 0.36, 4).rotateX(Math.PI / 2), jackalMat = toonMat(0x8a6a44);
  const quailGeoB = new THREE.SphereGeometry(0.2, 8, 6), quailGeoH = new THREE.SphereGeometry(0.11, 8, 6), quailMat = toonMat(0x9b7a52), quailMatH = toonMat(0x5a4632);
  function liveStart(kind, t, extra){ mgCloseAll(); liveEnd(); Object.assign(live, { kind, t, n: 0, hearts: 3, spawn: 0 }, extra || {}); hudCh.classList.remove('hidden'); }
  function herdGame(){
    mgOpen('🐑 흩어진 양 몰기', `양 다섯 마리가 우리 밖으로 흩어졌어요! 양 <b>뒤쪽</b>으로 다가가면 양이 반대쪽으로 걸어가요. <b>60초</b> 안에 모두 우리(돌담 안)로 몰아넣어 보세요.<br><span style="opacity:.75">"모세가 그의 장인 미디안 제사장 이드로의 양 떼를 치더니" (출애굽기 3:1)</span>`);
    mgAct.onclick = () => { if (!propTemplates.lamb){ toast('양을 불러오는 중이에요. 잠시 뒤 다시 해 주세요', 2000); return; }
      liveStart('herdSheep', 60);
      for (let k = 0, tries = 0; k < 5 && tries < 400; tries++){ const a = Math.random() * 6.28, r = 8 + Math.random() * 5, x = PEN_C[0] + Math.cos(a) * r, z = PEN_C[1] + Math.sin(a) * r;
        if (!reachable(x, z)) continue; const o = propTemplates.lamb.holder.clone(true); o.position.set(x, heightAt(x, z), z); zoneRoot.add(o); o.userData = { gait: addGait(o, 0.36), in: false }; live.objs.push(o); k++; } };
  }
  function guardGame(){
    mgOpen('🐺 양 지키기', `저녁이 되자 들짐승이 양 우리 쪽으로 다가와요! 가까이 달려가면 놀라서 도망가요. <b>45초</b> 동안 양을 지켜 주세요(우리에 세 번 닿으면 실패).<br><span style="opacity:.75">목자는 양 떼를 지키는 사람이에요 — 다윗도 "사자나 곰이 와서 양 떼에서 새끼를 물어가면" 따라가 건져 냈어요 (사무엘상 17:34-35)</span>`);
    mgAct.onclick = () => liveStart('guard', 45);
  }
  function quailGame(){
    mgOpen('🐦 메추라기 잡기', `저녁에 메추라기가 진을 덮었어요! 메추라기에게 다가가면 잡혀요. <b>40초</b> 동안 <b>10마리</b> 이상 잡아 보세요.<br><span style="opacity:.75">"저녁에는 메추라기가 와서 진에 덮이고" (출애굽기 16:13)</span>`);
    mgAct.onclick = () => { liveStart('quail', 40);
      for (let k = 0, tries = 0; k < 16 && tries < 600; tries++){ const x = player.position.x + (Math.random() - 0.5) * 30, z = player.position.z + (Math.random() - 0.5) * 30;
        if (!reachable(x, z) || Math.hypot(x - player.position.x, z - player.position.z) < 4) continue;
        const g = new THREE.Group(), b = new THREE.Mesh(quailGeoB, quailMat), h = new THREE.Mesh(quailGeoH, quailMatH); b.scale.set(1, 0.8, 1.3); b.position.y = 0.2; h.position.set(0, 0.36, 0.2); g.add(b, h);
        g.position.set(x, heightAt(x, z), z); g.userData = { x, z, t: Math.random() * 4, dir: Math.random() * 6.28 }; zoneRoot.add(g); live.objs.push(g); k++; } };
  }
  function updateCraftLive(dt){
    if (!live.kind || !['herdSheep', 'guard', 'quail'].includes(live.kind)) return false;
    const need = live.kind === 'quail' ? 'wild' : 'egypt';
    if (!Z || Z.id !== need){ liveEnd(); return true; }
    if (dlgState) return true;
    live.t -= dt; const P = player.position;
    if (live.kind === 'herdSheep'){
      let inN = 0;
      for (const o of live.objs){ const u = o.userData, p = o.position, dx = p.x - P.x, dz = p.z - P.z, d = Math.hypot(dx, dz);
        const dc = Math.hypot(p.x - PEN_C[0], p.z - PEN_C[1]);
        if (!u.in && dc < PEN_WALL - 0.6){ u.in = true; toast('🐑 한 마리 우리에 들어왔어요!', 900); }
        if (u.in){ inN++; u.gait.amp.value *= 0.9; continue; }
        if (d < 3.4){ const sp = 2.6 * dt, nx = p.x + dx / d * sp, nz = p.z + dz / d * sp; p.x = nx; p.z = nz; p.y = heightAt(nx, nz); o.rotation.y = Math.atan2(dx, dz); u.gait.ph.value += dt * 9; u.gait.amp.value = 1; }
        else u.gait.amp.value *= 0.9; }
      live.n = inN; hudCh.textContent = `🐑 우리 안 ${inN} / 5 · ⏱ ${Math.ceil(live.t)}초`;
      if (inN >= 5){ liveEnd('🎉 양 다섯 마리를 모두 우리에 몰아넣었어요!'); actWin('herdSheep'); return true; }
      if (live.t <= 0) liveEnd(`⏱ 시간 끝 — ${inN}마리를 몰아넣었어요. 다시 해 볼까요?`);
      return true;
    }
    if (live.kind === 'guard'){
      live.spawn -= dt;
      if (live.spawn <= 0){ live.spawn = Math.max(1.3, 3.2 - (45 - live.t) * 0.045);
        const a = Math.random() * 6.28, r = 17, x = PEN_C[0] + Math.cos(a) * r, z = PEN_C[1] + Math.sin(a) * r;
        const g = new THREE.Group(), b = new THREE.Mesh(jackalGeo, jackalMat), h = new THREE.Mesh(jackalHead, jackalMat); b.position.y = 0.42; h.position.set(0, 0.55, 0.52); g.add(b, h);
        g.position.set(x, heightAt(x, z), z); g.userData = { flee: 0, sp: 1.5 + Math.random() * 0.8 }; zoneRoot.add(g); live.objs.push(g); }
      for (let i = live.objs.length - 1; i >= 0; i--){ const g = live.objs[i], u = g.userData, p = g.position;
        if (u.flee > 0){ u.flee -= dt; const dx = p.x - PEN_C[0], dz = p.z - PEN_C[1], d = Math.hypot(dx, dz) || 1; p.x += dx / d * 7 * dt; p.z += dz / d * 7 * dt; g.rotation.y = Math.atan2(dx, dz); if (u.flee <= 0){ zoneRoot.remove(g); live.objs.splice(i, 1); } continue; }
        const dx = PEN_C[0] - p.x, dz = PEN_C[1] - p.z, d = Math.hypot(dx, dz);
        p.x += dx / d * u.sp * dt; p.z += dz / d * u.sp * dt; p.y = heightAt(p.x, p.z) + Math.abs(Math.sin(performance.now() * 0.012 + i)) * 0.08; g.rotation.y = Math.atan2(dx, dz);
        if (Math.hypot(p.x - P.x, p.z - P.z) < 1.6){ u.flee = 1.6; live.n++; }
        else if (d < PEN_WALL + 0.6){ live.hearts--; zoneRoot.remove(g); live.objs.splice(i, 1); toast(`🐺 들짐승이 우리에 닿았어요! (남은 기회 ${Math.max(0, live.hearts)})`, 1200); }
      }
      hudCh.textContent = `🐺 쫓아낸 들짐승 ${live.n} · ${'❤️'.repeat(Math.max(0, live.hearts))} · ⏱ ${Math.ceil(live.t)}초`;
      if (live.hearts <= 0){ liveEnd('양 우리가 위험했어요… 다시 지켜 볼까요?'); return true; }
      if (live.t <= 0){ liveEnd(`🎉 양 떼를 끝까지 지켰어요! 들짐승 ${live.n}마리를 쫓아냈어요`); actWin('guard'); }
      return true;
    }
    if (live.kind === 'quail'){
      for (let i = live.objs.length - 1; i >= 0; i--){ const g = live.objs[i], u = g.userData; u.t += dt;
        const dx = g.position.x - P.x, dz = g.position.z - P.z, d = Math.hypot(dx, dz);
        if (d < 1.3){ zoneRoot.remove(g); live.objs.splice(i, 1); live.n++; continue; }
        if (d < 4){ u.dir = Math.atan2(dx, dz) + (Math.random() - 0.5) * 0.8; }
        else if (u.t > 1.5){ u.t = 0; u.dir += (Math.random() - 0.5) * 2; }
        const sp = (d < 4 ? 3.2 : 0.8) * dt, nx = g.position.x + Math.sin(u.dir) * sp, nz = g.position.z + Math.cos(u.dir) * sp;
        if (reachable(nx, nz)){ g.position.x = nx; g.position.z = nz; } else u.dir += Math.PI * 0.7;
        g.position.y = heightAt(g.position.x, g.position.z) + Math.abs(Math.sin(u.t * 8)) * 0.12; g.rotation.y = u.dir; }
      hudCh.textContent = `🐦 메추라기 ${live.n}마리 · ⏱ ${Math.ceil(live.t)}초`;
      if (live.t <= 0 || !live.objs.length){ const n = live.n; liveEnd(n >= 10 ? `🎉 메추라기 ${n}마리! 온 진이 저녁을 먹었어요` : `메추라기 ${n}마리 — 10마리 이상이면 성공이에요`); if (n >= 10) actWin('quail'); }
      return true;
    }
    return false;
  }

  // ── 공방 창 ─────────────────────────────────────────────
  let craftCat = 'staff', crafting = false;
  const matLine = mats => Object.entries(mats).map(([k, n]) => `<span class="${matN(k) >= n ? 'ok' : 'no'}">${MATS[k].ico}${n}</span>`).join(' ');
  function renderCraft(msg){
    const loggedIn = SHOP_MOCK || (MSU.client && MSU.session);
    document.getElementById('craft-bal').innerHTML = loggedIn ? `내 달란트 <b>${MSU.balance ?? '…'}</b> · 재료 + 만드는 값(달란트)으로 만들어요${SHOP_MOCK ? ' (연습 모드)' : ''}`
      : MSU.client ? `말씀우물에 로그인하면 만들 수 있어요 — <a href="${MSU_BASE}login.html?next=/odyssey/">로그인하기</a>` : '말씀우물 사이트에서 게임을 열면 만들 수 있어요. (지금은 미리보기)';
    document.getElementById('craft-mats').innerHTML = Object.entries(MATS).map(([k, m]) => `<span class="cm${matN(k) ? '' : ' zero'}" title="${m.n}">${m.ico}<b>${matN(k)}</b></span>`).join('');
    document.querySelectorAll('#craft-tabs button').forEach(b => b.classList.toggle('on', b.dataset.c === craftCat));
    const grid = document.getElementById('craft-grid');
    if (craftCat === 'where'){
      grid.innerHTML = `<div class="craft-where">${Object.entries(MATS).map(([k, m]) => `<div><b>${m.ico} ${m.n}</b> — ${MAT_WHERE[k]}</div>`).join('')}<div style="opacity:.75;margin-top:6px">모으는 곳은 마을마다 반짝이는 표시예요. 종류마다 하루 ${GATHER_MAX}번, 활동 퀘스트 재료는 하루 한 번 받아요.</div></div>`;
    } else grid.innerHTML = CRAFT.filter(c => c.slot === craftCat).map(c => {
      const have = owned.has(c.k), on = equip[c.slot] === c.k, can = Object.entries(c.mats).every(([k, n]) => matN(k) >= n);
      const btn = !have ? `<button data-make="${c.k}" ${loggedIn && can ? '' : 'disabled'}>${c.hidden && !matN('onyx') ? '❔ 히든 재료 필요' : '만들기'}</button>`
        : on ? `<button class="off" data-coff="${c.slot}">빼기</button>` : `<button class="eq" data-ceq="${c.k}">장착하기</button>`;
      return `<div class="shop-card craft-card"><div class="ci">${c.ico}</div><div class="nm">${c.n}</div><div class="cn">${c.note}</div>
        <div class="mt">${have ? (on ? '✓ 장착 중' : '가지고 있음') : matLine(c.mats) + ` · 💰${c.cost}`}</div>${btn}</div>`;
    }).join('');
    document.getElementById('craft-msg').textContent = msg || '';
  }
  async function openCraft(){
    matBonus(); craftCat = craftCat === 'where' ? 'staff' : craftCat; renderCraft('불러오는 중…'); openModal('craft-modal');
    try { await shopRefresh(); renderCraft(); } catch (e){ renderCraft(); }
  }
  document.getElementById('craft-tabs').onclick = e => { const b = e.target.closest('button'); if (b){ craftCat = b.dataset.c; renderCraft(); } };
  document.getElementById('craft-grid').onclick = async e => {
    const b = e.target.closest('button'); if (!b || crafting) return;
    if (b.dataset.ceq){ const c = craftDef(b.dataset.ceq); equip[c.slot] = c.k; saveLocal(); applyEquip(); renderCraft(`${eul(c.n)} 장착했어요!`); return; }
    if (b.dataset.coff){ equip[b.dataset.coff] = null; saveLocal(); applyEquip(); renderCraft(); return; }
    const c = craftDef(b.dataset.make); if (!c) return;
    const lack = Object.entries(c.mats).filter(([k, n]) => matN(k) < n);
    if (lack.length){ renderCraft('재료가 모자라요: ' + lack.map(([k, n]) => `${MATS[k].ico}${MATS[k].n} ${n - matN(k)}개`).join(', ')); return; }
    const cost = (MSU.items && (MSU.items.find(r => r.game_key === c.k) || {}).cost) || c.cost;
    if (MSU.balance != null && MSU.balance < cost){ renderCraft(`달란트가 ${cost - MSU.balance} 모자라요.`); return; }
    if (!confirm(`${eul(c.n)} 만들까요?\n재료 ${Object.entries(c.mats).map(([k, n]) => MATS[k].n + ' ' + n).join(', ')} + ${cost}달란트`)) return;
    crafting = true; renderCraft('브살렐이 만드는 중… 🔨');
    try {
      if (SHOP_MOCK){ MSU.balance -= cost; try { localStorage.setItem('inodyssey-mockbal', MSU.balance); } catch (e){} }
      else { const { data, error } = await MSU.client.rpc('buy_odyssey_item', { p_key: c.k }); if (error) throw error; MSU.balance = data; }
      for (const [k, n] of Object.entries(c.mats)) ST.mat[k] = matN(k) - n; saveST();
      owned.add(c.k); equip[c.slot] = c.k; saveLocal(); applyEquip(); wq('craft1');
      if (!ST.badges.includes('craftsman')){ ST.badges.push('craftsman'); saveST(); setTimeout(() => toast('🛠 배지 획득: 지혜로운 손', 2400), 900); }
      renderCraft(`🎉 ${c.n} 완성! 바로 장착했어요.`);
    } catch (err){ renderCraft('만들지 못했어요: ' + ((err && err.message) || '다시 시도해 주세요')); }
    crafting = false;
  };

  DQ_POOL.push({ k: 'gather', t: '🪵 재료 5개 모으기', n: 5, ok: () => ST.ch >= 1 || ST.cleared },
               { k: 'act', t: '🐑 활동 퀘스트 1번 성공하기', n: 1, ok: aft3 });
  WQ_POOL.push({ k: 'craft1', t: '🔨 공방에서 물건 1개 만들기', n: 1, ok: () => (ST.ch >= 1 || ST.cleared) && typeof msuOn === 'function' && msuOn() },
               { k: 'act3', t: '🐑 활동 퀘스트 3번 성공하기', n: 3, ok: aft3 });
  const CRAFT_CH = { idol: idolGame, herdSheep: herdGame, guard: guardGame, pick: pickGame, quail: quailGame };
  // ══ 📜 족보 조각(마태복음 1장): 두루마리를 마칠 때마다 이름이 하나씩 밝혀져요 — 모두 모이면 예수 그리스도까지 이어짐 ══
  const GENEALOGY = [
    ['아브라함'], ['이삭'], ['야곱'], ['유다'], ['베레스', '다말'], ['헤스론'], ['람'], ['아미나답'], ['나손'], ['살몬'], ['보아스', '라합'], ['오벳', '룻'], ['이새'],
    ['다윗'], ['솔로몬', '우리야의 아내'], ['르호보암'], ['아비야'], ['아사'], ['여호사밧'], ['요람'], ['웃시야'], ['요담'], ['아하스'], ['히스기야'], ['므낫세'], ['아몬'], ['요시야'],
    ['여고냐'], ['스알디엘'], ['스룹바벨'], ['아비훗'], ['엘리아김'], ['아소르'], ['사독'], ['아킴'], ['엘리웃'], ['엘르아살'], ['맛단'], ['야곱2'], ['요셉'], ['예수', '마리아'],
  ];
  ST.geneal = ST.geneal || [];
  function addGeneal(names){
    const got = [].concat(names).filter(n => GENEALOGY.some(g => g[0] === n) && !ST.geneal.includes(n));
    if (!got.length) return;
    ST.geneal.push(...got); saveST();
    setTimeout(() => toast(`📜 족보 조각을 얻었어요 — 「${got.join('」「')}」 (마태복음 1장)`, 3000), 900);
  }
  // ══ 🧩 5편 「사사 열두 명」 조각(2026-10-25 전도사님 결정 — 족보 조각 대신): 큰 사사는 장을 마치면, 작은 사사는 그 절이 있는 자리에서 ══
  const JUDGES12 = ['옷니엘', '에훗', '삼갈', '드보라', '기드온', '돌라', '야일', '입다', '입산', '엘론', '압돈', '삼손'];
  ST.judges12 = ST.judges12 || [];
  function addJudge(name){
    if (!JUDGES12.includes(name) || ST.judges12.includes(name)) return;
    ST.judges12.push(name); saveST();
    setTimeout(() => toast(`🧩 사사 조각 「${name}」 — ${ST.judges12.length} / 12`, 2800), 900);
  }
  function judgesBookHTML(){
    if (!ST.judges12.length && !(ST.sp && ST.sp.judges)) return '';
    const cells = JUDGES12.map(n => { const on = ST.judges12.includes(n);
      return `<span style="display:inline-block;margin:2px;padding:4px 7px;border-radius:8px;font-size:12px;font-weight:700;${on ? 'background:#ffd27a;color:#2a1d10' : 'background:rgba(255,255,255,.08);color:rgba(255,255,255,.35)'}">${on ? n : '?'}</span>`; }).join('');
    return `<div style="grid-column:1/-1;margin-top:10px"><h3 style="font-size:15px;margin-bottom:4px">🧩 사사 열두 명 · ${ST.judges12.length} / 12</h3>`
      + `<div style="font-size:12px;opacity:.8;margin-bottom:4px">"여호와께서 사사들을 세우사 노략자의 손에서 그들을 구원하게 하셨으나" (사사기 2:16) — 5편을 따라가며 사사를 한 사람씩 만나요.</div>`
      + `<div style="line-height:1.9">${cells}</div></div>`;
  }
  function genealBookHTML(){
    const n = GENEALOGY.filter(g => ST.geneal.includes(g[0])).length;
    const cells = GENEALOGY.map((g, i) => { const on = ST.geneal.includes(g[0]);   // 같은 이름(야곱)은 뒤의 것을 '야곱2'로 구분
      return `<span style="display:inline-block;margin:2px;padding:4px 7px;border-radius:8px;font-size:12px;font-weight:700;${on ? 'background:#ffd27a;color:#2a1d10' : 'background:rgba(255,255,255,.08);color:rgba(255,255,255,.35)'}">${on ? g[0].replace(/\d$/, '') + (g[1] ? `<small style="font-weight:400">(${g[1]})</small>` : '') : '？'}</span>${i < GENEALOGY.length - 1 ? '<span style="opacity:.35;font-size:10px">›</span>' : ''}`; }).join('');
    return `<div style="grid-column:1/-1;margin-top:10px"><h3 style="font-size:15px;margin-bottom:4px">📜 족보 조각 · ${n} / ${GENEALOGY.length}</h3>`
      + `<div style="font-size:12px;opacity:.8;margin-bottom:4px">"아브라함과 다윗의 자손 예수 그리스도의 계보라" (마태복음 1:1) — 두루마리를 마칠 때마다 이름이 하나씩 밝혀져요.</div>`
      + `<div style="line-height:1.9">${cells}</div></div>`;
  }
  // ══ 🐍 표징 두 가지(출 4:2-7): 1장을 마치면 떨기나무 곁에서 다시 해 볼 수 있어요 ══
  CONDS.aft1 = () => chaptersDone() >= 1;
  function signsGame(){
    const V = {
      2: '여호와께서 그에게 이르시되 네 손에 있는 것이 무엇이냐 그가 이르되 지팡이니이다 (출 4:2)',
      3: '여호와께서 이르시되 그것을 땅에 던지라 하시매 곧 땅에 던지니 그것이 뱀이 된지라 모세가 뱀 앞에서 피하매 (출 4:3)',
      4: '여호와께서 모세에게 이르시되 네 손을 내밀어 그 꼬리를 잡으라 그가 손을 내밀어 그것을 잡으니 그의 손에서 지팡이가 된지라 (출 4:4)',
      6: '여호와께서 또 그에게 이르시되 네 손을 품에 넣으라 하시매 그가 손을 품에 넣었다가 내어보니 그의 손에 나병이 생겨 눈 같이 된지라 (출 4:6)',
      7: '이르시되 네 손을 다시 품에 넣으라 하시매 그가 다시 손을 품에 넣었다가 내어보니 그의 손이 본래의 살로 되돌아왔더라 (출 4:7)',
    };
    mgOpen('🐍 두 가지 표징', '떨기나무 곁에서 모세에게 주신 표징을 차례로 따라가 보세요. <span style="opacity:.75">(출애굽기 4:2-7)</span>');
    let phase = 0, raf = 0, sx = 0.5, sv = 0.55, tries = 0;
    const box = (html, btn) => { mgArea.innerHTML = `<div style="padding:10px 12px;font-size:13.5px;line-height:1.55">${html}</div>`; mgAct.textContent = btn; mgAct.disabled = false; };
    const snakeLoop = last => now => {
      const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
      sx += sv * dt; if (sx > 0.8 || sx < 0.2){ sv = -sv; sx = Math.max(0.2, Math.min(0.8, sx)); }
      const el = mgArea.querySelector('#sg-snake'); if (el) el.style.left = (sx * 100) + '%';
      raf = requestAnimationFrame(snakeLoop(last));
    };
    const step = () => {
      cancelAnimationFrame(raf);
      if (phase === 0) box(`<b>${V[2]}</b>`, '🦯 땅에 던지기');
      if (phase === 1){
        mgArea.innerHTML = `<div style="padding:8px 12px 0;font-size:13px;line-height:1.5">${V[3]}</div><div style="padding:0 12px;font-size:13px;line-height:1.5"><b>${V[4]}</b></div>`
          + `<div style="position:relative;height:90px;margin:8px 12px;border-radius:12px;background:rgba(255,255,255,.07);overflow:hidden"><div id="sg-snake" style="position:absolute;top:28px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:0"><span style="font-size:34px">🐍</span><button id="sg-tail" style="width:46px;height:18px;border-radius:9px;border:2px dashed #ffd27a;background:rgba(122,168,90,.8);margin-left:-4px"></button></div></div>`
          + `<div id="sg-msg" style="text-align:center;color:#ffd27a;font-weight:800;min-height:18px">뱀의 꼬리(점선)를 눌러 잡으세요</div>`;
        mgAct.textContent = '꼬리를 잡으면 계속'; mgAct.disabled = true; sx = 0.5; sv = 0.55 + Math.random() * 0.3; raf = requestAnimationFrame(snakeLoop(0));
      }
      if (phase === 2) box(`🦯 지팡이가 되었어요!<br><br><b>${V[6]}</b>`, '✋ 손을 품에 넣기');
      if (phase === 3) box(`<span style="font-size:30px">🤚🏻❄️</span><br><b>${V[7]}</b>`, '✋ 다시 품에 넣기');
      if (phase === 4){ box(`<span style="font-size:30px">✋</span><br>손이 본래의 살로 되돌아왔어요.<br><br>"이는 그들에게 그들의 조상의 하나님 곧 아브라함의 하나님, 이삭의 하나님, 야곱의 하나님 여호와가 네게 나타난 줄을 믿게 하려 함이라" (출 4:5)`, '마치기');
        if (!ST.signsDone){ ST.signsDone = 1; saveST(); addMat({ blue: 1 }, '🐍 두 가지 표징'); } }
    };
    mgArea.onclick = e => { if (phase === 1 && e.target.closest('#sg-tail')){ tries++; phase = 2; step(); } };
    mgAct.onclick = () => { if (phase === 1) return; if (phase >= 4){ cancelAnimationFrame(raf); mgArea.onclick = null; mgCloseAll(); return; } phase++; step(); };
    mg.onClose = () => { cancelAnimationFrame(raf); mgArea.onclick = null; };
    step();
  }
  CRAFT_CH.signs = signsGame;
  // ══ ❔ 히든 퀘스트: 마을 사람 8명에게 조건이 걸려 있음 — 조건을 채우면 이름표에 ❔ ══
  // 대사 원칙(2026-09-26 전수 검수와 같음): 성경 내용은 개역개정 원문 + 출처만, 마을 사람은 짧은 반응만.
  const kstHour = () => new Date(Date.now() + 9 * 3600e3).getUTCHours();
  const HQ = [
    { id: 'lost_lamb', zone: 'midian', npc: 'shepherd', name: '잃은 양', hint: '미디안의 목동 소년이 무언가를 잃어버렸대요. 동물 친구와 친해진 사람(펫 친밀도 Lv.2)이라면…',
      ok: () => Object.keys(SHOP).some(k => SHOP[k].cat === 'pet' && petLv(k) >= 2), two: true, give: { wool: 3, goat: 2 } },
    { id: 'night_brick', zone: 'egypt', npc: 'hb_brickmaker', name: '밤의 벽돌 가마', hint: '애굽의 벽돌공은 해가 진 뒤에도 일한대요(한국 시간 밤 8시~새벽 5시).',
      ok: () => { const h = kstHour(); return (h >= 20 || h < 5) && (ST.ch >= 1 || ST.cleared); }, two: true, give: { silver: 2 } },
    { id: 'manna_week', zone: 'wild', npc: 'wd_hungry2', name: '한 주의 만나', hint: '신 광야의 아이는 한 주 내내(안식일 빼고 6일 연속) 만나를 거둔 사람을 기다린대요.',
      ok: () => (ST.mannaStreak || 0) >= 6, give: { onyx: 1 } },
    { id: 'rephidim_work', zone: 'rephidim', npc: 'rp_angry2', name: '르비딤의 일손', hint: '르비딤에서 재료를 10번 모은 부지런한 사람에게…',
      ok: () => ((ST.gatherZone || {}).rephidim || 0) >= 10, give: { blue: 3, purple: 1 } },
    { id: 'grandma_quiz', zone: 'sinai', npc: 'sn_family2', name: '할머니의 물음', hint: '시내산 천막의 할머니는 십계명을 한 번도 틀리지 않고 외운 사람을 찾는대요.',
      ok: () => ST.badges.includes('ten_words'), give: { gold: 2 } },
    { id: 'scroll_sage', zone: 'alpha', npc: 'a_gardener', name: '숨은 두루마리', hint: '숨은 두루마리 조각을 모두 모으면 두루마리마을 정원사 할머니가…',
      ok: () => ST.badges.includes('scroll_all'), give: { onyx: 1, gold: 1 } },
    { id: 'two_friends', zone: 'alpha', npc: 'a_kid1', name: '두 사람', hint: '다른 친구와 함께 두루마리마을에 있을 때만 마을 아이가 말을 걸어요.',
      ok: () => !!(Z && Z.id === 'alpha' && typeof FR !== 'undefined' && FR.list.size > 0), give: { gold: 1 } },
    { id: 'lords_day', zone: 'alpha', npc: 'a_cart', name: '주일의 지도', hint: '주일(일요일)에만 지도 그리는 사람이 무언가를 보여 준대요.',
      ok: () => kstDow() === 0, give: { gold: 1, scarlet: 2 } },
  ];
  const hqState = id => (ST.hq || {})[id];
  const hqAvail = h => hqState(h.id) !== 'done' && (hqState(h.id) || h.ok());
  function hqSet(id, v){ ST.hq = ST.hq || {}; ST.hq[id] = v; saveST(); }
  const SAY = t => [{ n: t }];
  const HQ_DLG = {
    lost_lamb_start: t => [[SAY(t)[0], '우리 양 한 마리가 없어졌어요… 동물이랑 잘 지내는 형(누나)이라면 찾을 수 있을 것 같아요!', 'worried'],
      [NAR, "너희 중에 어떤 사람이 양 백 마리가 있는데 그 중의 하나를 잃으면 아흔아홉 마리를 들에 두고 그 잃은 것을 찾아내기까지 찾아다니지 아니하겠느냐 (눅 15:4)"],
      [NAR, '▶ 마을 밖 어딘가에 길 잃은 어린 양이 있어요. 찾아서 가까이 가 보세요.']],
    lost_lamb_wait: t => [[SAY(t)[0], '아직 못 찾았어요… 마을 밖을 둘러봐 주세요.', 'worried']],
    lost_lamb_end: t => [[SAY(t)[0], '찾았어요?! 고마워요!', 'happy'], [NAR, "나와 함께 즐기자 나의 잃은 양을 찾아내었노라 (눅 15:6)"]],
    night_brick_start: t => [[SAY(t)[0], '밤이 됐는데도 오늘 벽돌 수를 못 채웠어…', 'worried'],
      [NAR, "또 그들이 전에 만든 벽돌 수효대로 그들에게 만들게 하고 감하지 말라 (출 5:8)"],
      [NAR, '▶ 벽돌 굽기 도전에서 8장 이상 만들어 도와주세요. (궁전 동쪽 벽돌 작업장의 🎮)']],
    night_brick_wait: t => [[SAY(t)[0], '벽돌 굽기 도전에서 8장만 만들어 주면 돼!']],
    night_brick_end: t => [[SAY(t)[0], '덕분에 오늘 수를 채웠어! 고마워.', 'happy'], [NAR, "내가 애굽에 있는 내 백성의 고통을 분명히 보고 그들이 그들의 감독자로 말미암아 부르짖음을 듣고 그 근심을 알고 (출 3:7)"]],
    manna_week_end: t => [[SAY(t)[0], '한 주 내내 만나를 거뒀다고요? 저도요!', 'happy'], [NAR, "오멜로 되어 본즉 많이 거둔 자도 남음이 없고 적게 거둔 자도 부족함이 없이 각 사람은 먹을 만큼만 거두었더라 (출 16:18)"], [NAR, "사람이 사는 땅에 이르기까지 이스라엘 자손이 사십 년 동안 만나를 먹었으니 (출 16:35)"]],
    rephidim_work_end: t => [[SAY(t)[0], '재료를 그렇게 많이 모았구나! 부지런하네. 우리가 뽑은 실을 좀 줄게.', 'happy'], [NAR, "마음이 슬기로운 모든 여인은 손수 실을 빼고 그 뺀 청색 자색 홍색 실과 가는 베 실을 가져왔으며 (출 35:25)"]],
    grandma_quiz_q: t => [[SAY(t)[0], '십계명을 다 외웠다고? 이 할미가 하나만 물어보마.'], [SAY(t)[0], '"안식일을 기억하여 …" 그다음이 뭐더라?'],
      { choice: [
        { l: '거룩하게 지키라', say: [[SAY(t)[0], '옳지!', 'happy'], [NAR, "안식일을 기억하여 거룩하게 지키라 (출 20:8)"]] },
        { l: '편히 쉬라', abort: true, say: [[SAY(t)[0], '음… 다시 한번 외워 보고 오렴.']] },
        { l: '잔치를 열라', abort: true, say: [[SAY(t)[0], '음… 다시 한번 외워 보고 오렴.']] } ] }],
    scroll_sage_end: t => [[SAY(t)[0], '두루마리 조각을 다 모았구나. 숨은 것을 끝까지 찾아냈네.', 'happy'], [NAR, "일을 숨기는 것은 하나님의 영화요 일을 살피는 것은 왕의 영화니라 (잠 25:2)"]],
    two_friends_end: t => [[SAY(t)[0], '둘이 함께 왔구나!', 'happy'], [NAR, "두 사람이 한 사람보다 나음은 그들이 수고함으로 좋은 상을 얻을 것임이라 (전 4:9)"]],
    lords_day_end: t => [[SAY(t)[0], '오늘은 주일이구나. 지도에 오늘 한 줄을 더 그려 넣을게.', 'happy'], [NAR, "안식일을 기억하여 거룩하게 지키라 (출 20:8)"]],
  };
  function hqReward(h){
    hqSet(h.id, 'done'); addMat(h.give, `❔ 히든 퀘스트 「${h.name}」 완료`);
    if (HQ.every(x => hqState(x.id) === 'done') && !ST.badges.includes('hidden_all')){ ST.badges.push('hidden_all'); saveST(); setTimeout(() => toast('❔ 배지 획득: 숨은 이야기를 찾은 사람', 2600), 3000); }
    hqRefresh(true);
  }
  function hqTalk(m){
    const h = HQ.find(x => x.zone === (Z && Z.id) && x.npc === m.data.id); if (!h || hqState(h.id) === 'done') return false;
    const st = hqState(h.id), t = m.data.title;
    if (h.two){
      if (!st){ if (!h.ok()) return false; runDialog(HQ_DLG[h.id + '_start'](t), () => { hqSet(h.id, 'active'); if (h.id === 'lost_lamb') spawnLostLamb(); hqRefresh(true); }, m); return true; }
      if (st === 'active'){ runDialog(HQ_DLG[h.id + '_wait'](t), null, m); return true; }
      if (st === 'ready'){ runDialog(HQ_DLG[h.id + '_end'](t), () => hqReward(h), m); return true; }
      return false;
    }
    if (!h.ok()) return false;
    const lines = h.id === 'grandma_quiz' ? HQ_DLG.grandma_quiz_q(t) : HQ_DLG[h.id + '_end'](t);
    runDialog(lines, () => hqReward(h), m); return true;
  }
  function hqEvent(kind){
    if (kind === 'brick8' && hqState('night_brick') === 'active'){ hqSet('night_brick', 'ready'); setTimeout(() => toast('❔ 벽돌 8장! 벽돌공에게 돌아가 알려 주세요', 2600), 1200); hqRefresh(true); }
  }
  // 잃은 양: 미디안 마을 밖(걸어서 닿는 먼 곳)에 어린 양 한 마리
  let lostLamb = null;
  const LAMB_SPOTS = [[-38, 22], [36, -26], [-32, -34], [38, 20], [-44, -8], [30, 30]];
  async function spawnLostLamb(){
    if (lostLamb){ lostLamb.parent && lostLamb.parent.remove(lostLamb); lostLamb = null; }
    if (!Z || Z.id !== 'midian' || hqState('lost_lamb') !== 'active') return;
    const spot = LAMB_SPOTS.find(([x, z]) => reachable(x, z)) || LAMB_SPOTS[0];
    try {
      const g = await loadGLB('animals3d/lamb.glb'); const root = g.scene; toToon(root); root.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(root), sc = 0.95 * WPM / (box.max.y - box.min.y), c = box.getCenter(new THREE.Vector3());
      root.scale.multiplyScalar(sc); root.position.set(-c.x * sc, -box.min.y * sc, -c.z * sc);
      const holder = new THREE.Group(); holder.add(root); holder.position.set(spot[0], heightAt(spot[0], spot[1]), spot[1]); holder.userData = { x: spot[0], z: spot[1] };
      if (!Z || Z.id !== 'midian') return;
      zoneRoot.add(holder); lostLamb = holder;
    } catch (e){ console.warn('잃은 양 불러오기 실패', e); }
  }
  function updateHidden(){
    if (!lostLamb || !Z || Z.id !== 'midian') return;
    const P = player.position, u = lostLamb.userData;
    lostLamb.rotation.y += 0.01;
    if (Math.hypot(P.x - u.x, P.z - u.z) < 2.2){ zoneRoot.remove(lostLamb); lostLamb = null; hqSet('lost_lamb', 'ready'); toast('🐑 잃은 양을 찾았어요! 목동 소년에게 알려 주세요', 2800); hqRefresh(true); }
  }
  // 이름표 ❔ 표시(2초마다 조건 확인)
  let hqT = 0;
  function hqRefresh(force){
    const now = performance.now(); if (!force && now - hqT < 2000) return; hqT = now;
    if (!Z) return;
    for (const h of HQ){
      if (h.zone !== Z.id) continue;
      const m = markers.find(x => x.data.id === h.npc); if (!m || !m.tag) continue;
      const base = m.data.title, want = hqAvail(h) ? '❔ ' + base : base;
      if (m.tag.userData.text !== want){ m.tag.userData.text = want; m.tag.userData.mode = null; m.tag.userData.el.textContent = want; }
    }
    document.getElementById('btn-menu').classList.toggle('dot-hq', HQ.some(h => hqAvail(h)));
  }
  function mannaStreakTick(){
    const d = kstDate(); if (ST.mannaDayLast === d) return;
    const t = Date.parse(d + 'T00:00:00Z'); let y = new Date(t - 864e5); if (y.getUTCDay() === 6) y = new Date(t - 2 * 864e5);   // 안식일(토)은 만나가 없으니 건너뜀
    ST.mannaStreak = ST.mannaDayLast === y.toISOString().slice(0, 10) ? (ST.mannaStreak || 0) + 1 : 1;
    ST.mannaDayLast = d; saveST();
    if (ST.mannaStreak >= 6 && hqState('manna_week') !== 'done') setTimeout(() => toast('❔ 한 주 내내 만나를 거뒀어요! 신 광야에 누군가 기다리는 것 같아요', 2800), 2000);
  }
  function renderHQ(){
    const el = document.getElementById('hq-list');
    el.innerHTML = HQ.map(h => {
      const st = hqState(h.id), zn = ZONES[h.zone].name, who = (ZONES[h.zone].points.find(p => p.id === h.npc) || {}).title || '';
      if (st === 'done') return `<div class="dq done"><span class="ck">✅</span><span class="tx"><b>${h.name}</b> — 완료</span></div>`;
      if (hqAvail(h)) return `<div class="dq"><span class="ck">❔</span><span class="tx"><b>${h.name}</b> — ${zn}의 「${who}」에게 가 보세요!${st === 'active' ? ' (진행 중)' : st === 'ready' ? ' (다 했어요! 알려 주세요)' : ''}</span></div>`;
      return `<div class="dq" style="opacity:.75"><span class="ck">🔒</span><span class="tx"><b>???</b> — ${h.hint}${hqHintOpen(h.id) ? `<br><span style="color:#ffd27a">⭐ ${HQ_DETAIL[h.id]}</span>` : ""}</span>${hqHintOpen(h.id) ? "" : `<button data-hqhint="${h.id}" style="padding:5px 7px;border-radius:8px;border:none;background:#ffd27a;color:#2a1d10;font-weight:800;font-size:11.5px">⭐1 자세히</button>`}</div>`;
    }).join('') + `<div style="font-size:12px;opacity:.75;margin-top:8px">보상은 공방 재료예요. 호마노(💎)는 히든 퀘스트에서만 얻어요. 8개를 다 찾으면 배지 ❔!</div>`;
  }
  document.getElementById('btn-hq').onclick = () => { renderHQ(); openModal('hq-modal'); };
  Object.assign(BADGES, { hidden_all: { ico: '❔', name: '숨은 이야기를 찾은 사람' } });
  // ══ 📜 곁 이야기(1~7장 추가 퀘스트, 기획 문서 「In Odyssey 1~6장 추가 퀘스트 기획」) ══
  // 본 이야기 단계 번호를 바꾸지 않도록 따로 둔다(기존 저장과 겹치지 않음). 해당 장면을 지나면 열리고, 이름표에 📜.
  // 대사 원칙: 성경 내용은 개역개정 원문 + 출처만. 게임 사례·게임 행동은 ▶ 안내로 구분.
  const sideState = id => (ST.side || {})[id];
  function sideSet(id, v){ ST.side = ST.side || {}; ST.side[id] = v; saveST(); }
  const SIDE = [
    { id: 'aaron_words', ch: 1, zone: 'midian', npc: 'aaron', name: '아론에게 전할 말씀', ok: () => passed(0, 's7'), give: { blue: 1 } },
    { id: 'pharaoh_board', ch: 2, zone: 'egypt', npc: 'pharaoh_board', name: '바로의 약속 기록판', ok: () => chaptersDone() >= 2, give: { silver: 1 } },
    { id: 'neighbor', ch: 3, zone: 'egypt', npc: 'hb_grandma', name: '이웃의 출발 돕기', ok: () => chaptersDone() >= 3, give: { scarlet: 1 } },
    { id: 'cloud_place', ch: 4, zone: 'redsea', npc: 'lookout', name: '구름기둥이 선 자리', ok: () => chaptersDone() >= 4, give: { blue: 1 } },
    { id: 'manna_share', ch: 5, zone: 'wild', npc: 'wd_greedy', name: '장막마다 만나 나누기', ok: () => chaptersDone() >= 5, give: { purple: 1 } },
    { id: 'water_give', ch: 6, zone: 'rephidim', npc: 'rp_elder', name: '목마른 이웃에게 물', ok: () => chaptersDone() >= 6, give: { blue: 1, wool: 1 } },
    { id: 'judges', ch: 7, zone: 'sinai', npc: 'captain10', name: '십부장의 재판', ok: () => chaptersDone() >= 7, give: { gold: 1 } },
  ];
  ZONES.egypt.points.push({ id: 'pharaoh_board', x: 21.5, z: -8.5, type: 'lore', title: '바로의 약속 기록판', body: '' });
  ZONES.sinai.points.push({ id: 'captain10', x: -9, z: -5, type: 'villager', title: '십부장', model: 'he-grandpa', persona: 'rs_static', body: "그들이 때를 따라 백성을 재판하되 어려운 일은 모세에게 가져오고 모든 작은 일은 스스로 재판하더라 (출 18:26)" });
  const NB_ITEMS = [{ id: 'nb_bowl', x: -6.5, z: -1, t: '반죽 그릇' }, { id: 'nb_shoes', x: -16.5, z: 8.5, t: '신' }, { id: 'nb_staff', x: 1, z: 7.5, t: '지팡이' }];
  for (const it of NB_ITEMS) ZONES.egypt.points.push({ id: it.id, x: it.x, z: it.z, type: 'lore', title: '📦 ' + it.t, cond: 'nbItem', body: '' });
  Object.assign(CONDS, { nbItem: d => sideState('neighbor') === 'active' && !((ST.sideItems || []).includes(d.id)) });
  const SAYS = t => ({ n: t });
  function sideDone(s){ sideSet(s.id, 'done'); addMat(s.give, `📜 곁 이야기 「${s.name}」 완료`);
    if (SIDE.every(x => sideState(x.id) === 'done') && !ST.badges.includes('side_all')){ ST.badges.push('side_all'); saveST(); setTimeout(() => toast('📜 배지 획득: 곁을 살핀 사람', 2600), 3000); }
    sideRefresh(true); }
