  // ───────── 모험 손맛(2026-11-20): 광석 캐기 반짝임·광맥 알림, 그림자와 싸울 때 체력 막대·피해 숫자·번쩍임·강한 일격·검 휘두르기·공격 신호 ─────────
  var ORE_SET = {}, ORE_COLOR = {};
  [[ORE_COAL, 0x5a5a66], [ORE_CU, 0xff9a52], [ORE_FE, 0xf0c49a], [ORE_AG, 0xeef6ff], [ORE_ONYX, 0xc88cff], [ORE_AU, 0xffd84a], [ORE_SAPH, 0x5a8cff], [ORE_DIA, 0x8ff8ff]].forEach(function (o) {
    ORE_SET[o[0]] = o[0]; ORE_COLOR[o[0]] = o[1]; if (DEEPV[o[0]]) ORE_SET[DEEPV[o[0]]] = o[0];
  });
  for (var gq0 = 0; gq0 < 12; gq0++) if (GEMS[gq0]) { var go0 = gemOre(gq0); if (!ORE_COLOR[go0]) { ORE_SET[go0] = go0; ORE_COLOR[go0] = TILE_AVG[TILE['gem' + gq0]] || 0xffffff; } }
  function oreBase(id) { return ORE_SET[id] || 0; }
  // 반짝이·숫자 같은 잠깐 보이는 것(FX)
  var FX = [], glowTex = null;
  function glowMat(color, through) {
    if (!glowTex) {
      var c = document.createElement('canvas'); c.width = c.height = 32; var g = c.getContext('2d'), gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
      gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.75)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 32, 32); glowTex = new THREE.CanvasTexture(c);
    }
    return new THREE.SpriteMaterial({ map: glowTex, color: color, transparent: true, depthWrite: false, depthTest: !through, blending: THREE.AdditiveBlending, fog: false });
  }
  function sparkle(x, y, z, color, n, o) {
    if (S.lightMode) n = Math.ceil(n / 2);
    if (!scene) return;
    o = o || {};
    for (var i = 0; i < n; i++) {
      var s = new THREE.Sprite(glowMat(color, o.through)), sz = (o.size || 0.32) * (0.6 + Math.random() * 0.8);
      s.scale.set(sz, sz, 1); s.position.set(x + (Math.random() - 0.5) * (o.spread || 0.8), y + (Math.random() - 0.5) * (o.spread || 0.8), z + (Math.random() - 0.5) * (o.spread || 0.8));
      s.renderOrder = o.through ? 19 : 4; scene.add(s);
      FX.push({ m: s, vx: (Math.random() - 0.5) * (o.v || 1.6), vy: (o.up === undefined ? 1.2 : o.up) + Math.random() * (o.v || 1.6), vz: (Math.random() - 0.5) * (o.v || 1.6), g: o.g || 0, life: (o.life || 0.9) * (0.7 + Math.random() * 0.6), t: 0, sz: sz });
    }
  }
  function floatText(x, y, z, t, color, hgt, life) {
    if (!scene) return;
    var s = textSprite(t, 'rgba(0,0,0,0)', color, hgt || 0.6); s.position.set(x, y, z); scene.add(s);
    FX.push({ m: s, vx: (Math.random() - 0.5) * 0.6, vy: 1.6, vz: (Math.random() - 0.5) * 0.6, g: 1.2, life: life || 0.9, t: 0, text: true });
  }
  function stepFx(dt) {
    if (!FX.length) return;
    FX = FX.filter(function (f) {
      f.t += dt; f.vy -= f.g * dt;
      f.m.position.x += f.vx * dt; f.m.position.y += f.vy * dt; f.m.position.z += f.vz * dt;
      var k = f.t / f.life;
      if (k >= 1) { if (f.text) disposeSprite(f.m); else { scene.remove(f.m); f.m.material.dispose(); } return false; }
      f.m.material.opacity = k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3;
      if (!f.text) { var sc = f.sz * (1 - k * 0.5); f.m.scale.set(sc, sc, 1); }
      return true;
    });
  }
  // 광석을 캘 때: 두드릴 때마다 광석 빛 부스러기, 캐면 반짝 + 맑은 소리, 이어진 광석(광맥)이 있으면 잠깐 비춰 주고 알림
  var veinToldAt = 0;
  function oreTap(x, y, z, id) { var b = oreBase(id); if (b) sparkle(x + 0.5, y + 0.5, z + 0.5, ORE_COLOR[b], 2, { size: 0.22, life: 0.45, up: 0.6 }); }
  function oreBroken(x, y, z, id) {
    var b = oreBase(id); if (!b) return;
    sparkle(x + 0.5, y + 0.5, z + 0.5, ORE_COLOR[b], 12, { size: 0.4, life: 1.0, up: 1.4, v: 2.2 });
    var rare = b === ORE_AU || b === ORE_DIA || b === ORE_SAPH || b === ORE_ONYX || b >= GEM_ORE0 && b <= GEM_ORE0 + 10;
    tone('sine', rare ? 1568 : 1175, rare ? 2093 : 1568, 0.22, 0.045);
    if (rare) setTimeout(function () { tone('sine', 2093, 2637, 0.25, 0.035); }, 110);
    // 광맥: 닿아 있는(대각선 포함) 같은 광석을 32개까지 찾는다
    var seen = {}, q = [[x, y, z]], found = [];
    seen[x + ',' + y + ',' + z] = 1;
    while (q.length && found.length < 32) {
      var c = q.shift();
      for (var dy = -1; dy <= 1; dy++) for (var dz = -1; dz <= 1; dz++) for (var dx = -1; dx <= 1; dx++) {
        var nx = c[0] + dx, ny = c[1] + dy, nz = c[2] + dz, k = nx + ',' + ny + ',' + nz;
        if (seen[k]) continue; seen[k] = 1;
        if (oreBase(get(nx, ny, nz)) === b) { found.push([nx, ny, nz]); q.push([nx, ny, nz]); }
      }
    }
    if (found.length) {
      found.forEach(function (p, i) { setTimeout(function () { sparkle(p[0] + 0.5, p[1] + 0.5, p[2] + 0.5, ORE_COLOR[b], 3, { size: 0.5, life: 1.4, up: 0.3, v: 0.4, spread: 0.6, through: true }); }, 120 + i * 60); });
      var now = performance.now();
      questEvent('vein', found.length + 1, 1);
      if (now - veinToldAt > 9000) { veinToldAt = now; toast('⛏ ' + B[b][0] + ' 줄기 — 이어진 광석 ' + found.length + '개가 더 있어요'); }
    }
    questEvent('ore', b, 1);
  }
  // ── 그림자와 싸우기 ──
  var flashMat = null;
  function shadowEyes(s) {
    if (!s.eyes) { s.eyes = []; s.mesh.children.forEach(function (m) { if (!m.isSprite && m.material && m.material !== shadowMat && m.material !== flashMat) s.eyes.push(m); }); }
    return s.eyes;
  }
  function hpBarDraw(s) {
    if (!s.bar) {
      var c = document.createElement('canvas'); c.width = 64; c.height = 10;
      var tex = new THREE.CanvasTexture(c); tex.minFilter = THREE.NearestFilter; tex.magFilter = THREE.NearestFilter;
      var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, fog: false }));
      sp.scale.set(1.3, 0.2, 1); sp.position.y = HT * s.sp.h + 0.2; sp.renderOrder = 21; s.mesh.add(sp);
      s.bar = sp; s.barC = c;
    }
    var g = s.barC.getContext('2d'), f = Math.max(0, s.hp) / s.sp.hp;
    g.clearRect(0, 0, 64, 10); g.fillStyle = 'rgba(0,0,0,0.7)'; g.fillRect(0, 0, 64, 10);
    g.fillStyle = f > 0.5 ? '#ffe27a' : (f > 0.25 ? '#ffae4a' : '#ff6a4a'); g.fillRect(2, 2, Math.round(60 * f), 6);
    s.bar.material.map.needsUpdate = true; s.bar.visible = true; s.barT = 4;
  }
  function combatFx(s, dmg, crit) {
    if (!flashMat) flashMat = new THREE.MeshBasicMaterial({ color: 0x8a7a9a, transparent: true, opacity: 0.85 });   // 11/21 맞을 때 하얗게 번쩍이지 않고 잠깐 밝은 잿빛으로
    s.mesh.children.forEach(function (m) { if (m.material === shadowMat) m.material = flashMat; });
    s.flashT = 0.1;
    hpBarDraw(s);
    var top = s.y + HT * s.sp.h + 1.1, n = Math.round(dmg * 10) / 10;   // 11/21 숫자는 이름표보다 위에, 0.6초
    floatText(s.x, top, s.z, (crit ? '✦ ' : '') + n, crit ? '#ffd23a' : '#ffffff', crit ? 0.8 : 0.6, 0.6);
    sparkle(s.x, s.y + 1.6 * s.sp.h, s.z, crit ? 0xffd23a : 0xfff0c0, crit ? 5 : 2, { size: 0.35, life: 0.5, v: 2.4, up: 0.8 });
    if (crit) { newsMark('crit'); tone('square', 520, 1040, 0.12, 0.04); vibrate('break'); if (s.hp <= 0) questEvent('crit'); }
  }
  function shadowFxStep(s, dt) {
    if (s.flashT > 0) { s.flashT -= dt; if (s.flashT <= 0) s.mesh.children.forEach(function (m) { if (m.material === flashMat) m.material = shadowMat; }); }
    if (s.bar && s.barT > 0) { s.barT -= dt; if (s.barT <= 0 || s.dead) s.bar.visible = false; }
    if (s.kx || s.kz) {   // 밀려나기(땅을 따라 미끄러지듯)
      var nx = s.x + s.kx * dt, nz = s.z + s.kz * dt, ny = groundAt(nx, nz, s.y + 2);
      if (ny !== null && Math.abs(ny - s.y) <= 1.6) { s.x = nx; s.z = nz; s.y = ny; }
      s.kx *= Math.pow(0.02, dt); s.kz *= Math.pow(0.02, dt); if (Math.abs(s.kx) + Math.abs(s.kz) < 0.2) s.kx = s.kz = 0;
    }
    // 공격 신호: 몸을 뒤로 젖히고 눈이 커지며 밝아짐
    var w = s.wind > 0 ? 1 - s.wind / 0.45 : 0;
    s.mesh.rotation.x = s.wind > 0 ? -0.35 * w : (s.lunge > 0 ? 0.3 * s.lunge : 0);
    if (s.lunge > 0) s.lunge = Math.max(0, s.lunge - dt * 4);
    shadowEyes(s).forEach(function (m) { var k = s.wind > 0 ? 1 + w * 0.9 : 1; m.scale.set(k, k, 1); });
  }
  function sweepHit(s0) {   // 성령의 검: 앞쪽 가까이 있는 다른 그림자도 함께(조금 약하게)
    var dir = new THREE.Vector3(); camera.getWorldDirection(dir); dir.y = 0; dir.normalize();
    SHADOWS.forEach(function (o) {
      if (o === s0 || o.dead) return;
      var dx = o.x - P.x, dz = o.z - P.z, d = Math.hypot(dx, dz);
      if (d < 3.4 && Math.abs(o.y - P.y) < 2.5 && (dx * dir.x + dz * dir.z) / (d || 1) > 0.2) hitShadow(o, 2, true);
    });
    sparkleArc();
  }
  function sparkleArc() {   // 휘두른 자리에 빛 줄기
    var dir = new THREE.Vector3(); camera.getWorldDirection(dir); dir.y = 0; dir.normalize();
    for (var i = -3; i <= 3; i++) {
      var a = i * 0.22, cx = dir.x * Math.cos(a) - dir.z * Math.sin(a), cz = dir.x * Math.sin(a) + dir.z * Math.cos(a);
      (function (cx, cz, i) { setTimeout(function () { sparkle(P.x + cx * 2.2, P.y + 1.9 - i * 0.08, P.z + cz * 2.2, 0xfff3c4, 1, { size: 0.45, life: 0.3, up: 0, v: 0.2, spread: 0.1 }); }, (i + 3) * 14); })(cx, cz, i);
    }
  }
  function shadowDeathFx(s) {
    sparkle(s.x, s.y + 1.2 * s.sp.h, s.z, 0xfff3c4, s.kind === 'great' ? 26 : 16, { size: 0.42, life: 1.4, up: 2.2, v: 1.2, spread: 1.2 });
    tone('sine', 880, 1760, 0.35, 0.04); setTimeout(function () { tone('sine', 1320, 2640, 0.4, 0.03); }, 140);
  }
  // ───────── 남쪽 새 지역의 건축물(11/20): 성막(출 25–27장 치수 그대로) · 백향목 망대 · 나그네 장막촌 · 소금 기둥 ─────────
  // 성막 뜰: 길이 100 · 너비 50 · 세마포 휘장 높이 5(출 27:18), 동쪽 문, 번제단 5×5×3(출 27:1), 물두멍, 성막 30×10×10, 지성소 10×10×10
  var TB_TENT = { x0: TBX - 42, x1: TBX - 13, z0: TBZ - 5, z1: TBZ + 4 }, TWY = G + 4, TCY = G + 1;
  var TENTS = [[-10, -9, 0], [7, -10, 1], [-9, 8, 1], [8, 7, 0]];
  var LANDMARKS = [
    { k: 'tabernacle', x0: TBX - 50, z0: TBZ - 25, x1: TBX + 49, z1: TBZ + 24, flat: 0 },
    { k: 'tower', x0: CTX - 6, z0: CTZ - 6, x1: CTX + 6, z1: CTZ + 6, flat: 4 },
    { k: 'tents', x0: TCX - 16, z0: TCZ - 16, x1: TCX + 16, z1: TCZ + 16, flat: 1 },
    { k: 'lot', x0: LOTX - 2, z0: LOTZ - 2, x1: LOTX + 2, z1: LOTZ + 2, flat: 1 }
  ].concat(FAR_CITIES.map(function (c) { return { k: c.k, x0: c.x - c.r - 4, z0: c.z - c.r - 4, x1: c.x + c.r + 4, z1: c.z + c.r + 4, flat: 0, far: 1 }; }),
    [{ k: 'jonah', x0: JONAH_X - 5, z0: JONAH_Z - 5, x1: JONAH_X + 5, z1: JONAH_Z + 5, flat: 0, far: 1 }]);   // 11/24 먼 나라(지켜지는 곳, 짓기는 17-far-lands)
  function landmarkAt(x, z, m) {
    if (!LANDMARKS) return '';
    m = m || 0;
    for (var i = 0; i < LANDMARKS.length; i++) { var L = LANDMARKS[i]; if (x >= L.x0 - m && x <= L.x1 + m && z >= L.z0 - m && z <= L.z1 + m) return L.k; }
    return '';
  }
  function landmarkFlat(x, z) {   // [평평하게 할 높이, 섞는 정도] — 둘레 10칸에 걸쳐 원래 땅과 이어지게
    if (!LANDMARKS) return null;
    for (var i = 0; i < LANDMARKS.length; i++) {
      var L = LANDMARKS[i], dx = Math.max(L.x0 - 3 - x, 0, x - L.x1 - 3), dz = Math.max(L.z0 - 3 - z, 0, z - L.z1 - 3), d = Math.hypot(dx, dz);
      if (d < 12) return [L.flat, 1 - sstep(0, 12, d)];
    }
    return null;
  }
  function inLandmark(x, z) { return landmarkAt(x, z, 1); }
  function cedarTree(x, y, z, h) {   // 레바논 백향목: 곧은 줄기, 넓고 납작한 가지 켜(시 92:12)
    for (var i = 0; i < h; i++) { setRaw(x, y + i, z, CEDAR_LOG); setRaw(x + 1, y + i, z, CEDAR_LOG); setRaw(x, y + i, z + 1, CEDAR_LOG); setRaw(x + 1, y + i, z + 1, CEDAR_LOG); }
    var tiers = 0;
    for (var ly = Math.floor(h * 0.4); ly <= h; ly += 3) {
      var r = Math.max(1.5, (h - ly) / h * 8 + 1.2);
      for (var dz = -Math.ceil(r); dz <= Math.ceil(r) + 1; dz++) for (var dx = -Math.ceil(r); dx <= Math.ceil(r) + 1; dx++) {
        var ddx = dx - 0.5, ddz = dz - 0.5, dd = ddx * ddx + ddz * ddz, rr = r + (hash2(x + dx, z + dz, ly) - 0.5) * 1.2;
        if (dd <= rr * rr && get2(x + dx, y + ly, z + dz) === AIR) setRaw(x + dx, y + ly, z + dz, CEDAR_LEAF);
        if (dd <= (rr - 1.5) * (rr - 1.5) && get2(x + dx, y + ly + 1, z + dz) === AIR) setRaw(x + dx, y + ly + 1, z + dz, CEDAR_LEAF);
      }
      tiers++;
    }
    for (var t = 0; t < 2; t++) for (var dz2 = 0; dz2 <= 1; dz2++) for (var dx2 = 0; dx2 <= 1; dx2++) if (get2(x + dx2, y + h + 1 + t, z + dz2) === AIR) setRaw(x + dx2, y + h + 1 + t, z + dz2, CEDAR_LEAF);
  }
  function acaciaTree(x, y, z, h) {   // 광야의 조각목(출 27:1): 굽은 줄기, 납작한 잎 지붕
    var cx = x, cz = z, dir = hash2(x, z, 27) < 0.5 ? 1 : -1;
    for (var i = 0; i < h; i++) { if (i === Math.floor(h / 2)) cx += dir; setRaw(cx, y + i, cz, LOG); }
    for (var dz = -3; dz <= 3; dz++) for (var dx = -3; dx <= 3; dx++) {
      if (Math.abs(dx) + Math.abs(dz) > 4) continue;
      if (get2(cx + dx, y + h, cz + dz) === AIR) setRaw(cx + dx, y + h, cz + dz, LEAF);
      if (Math.abs(dx) + Math.abs(dz) <= 2 && get2(cx + dx, y + h + 1, cz + dz) === AIR) setRaw(cx + dx, y + h + 1, cz + dz, LEAF);
    }
  }
  function buildLandmarks(x0, z0) {
    LANDMARKS.forEach(function (L) {
      if (L.far) return;
      if (x0 + CS <= L.x0 - 4 || x0 > L.x1 + 4 || z0 + CS <= L.z0 - 4 || z0 > L.z1 + 4) return;
      if (L.k === 'tabernacle') buildTabernacle(); else if (L.k === 'tower') buildCedarTower(); else if (L.k === 'tents') buildTentCamp(); else buildLotPillar();
    });
  }
  function buildTabernacle() {
    var x0 = TBX - 50, x1 = TBX + 49, z0 = TBZ - 25, z1 = TBZ + 24, y = G, x, z;
    fill(x0 - 2, G, z0 - 2, x1 + 2, SY - 1, z1 + 2, AIR);
    fill(x0 - 2, G - 4, z0 - 2, x1 + 2, G - 2, z1 + 2, SAND);
    fill(x0 - 2, G - 1, z0 - 2, x1 + 2, G - 1, z1 + 2, SAND);
    fill(x0 + 1, G - 1, z0 + 1, x1 - 1, G - 1, z1 - 1, 18);
    // 세마포 휘장(높이 5)과 5규빗마다 기둥(놋 받침·은 머리)
    [[x0, z0, x1, z0], [x0, z1, x1, z1], [x0, z0, x0, z1], [x1, z0, x1, z1]].forEach(function (s) { fill(s[0], y, s[1], s[2], y + 4, s[3], WOOL_W); });
    function post(px, pz) { setRaw(px, y, pz, BLK_CU); fill(px, y + 1, pz, px, y + 4, pz, PILLAR); setRaw(px, y + 5, pz, BLK_AG); }
    for (x = x0; x <= x1; x += 5) { post(x, z0); post(x, z1); }
    post(x1, z1);
    for (z = z0; z <= z1; z += 5) { post(x0, z); post(x1, z); }
    // 동쪽 뜰 문 너비 20(출 27:16): 위쪽에 청색·자색·홍색 실로 수놓은 휘장, 아래는 드나드는 곳
    var gz0 = TBZ - 10, gz1 = TBZ + 9, cols = [WOOL_B, WOOL_V, WOOL_R, WOOL_W];
    fill(x1, y, gz0, x1, y + 3, gz1, AIR);
    for (z = gz0; z <= gz1; z++) setRaw(x1, y + 4, z, cols[(z - gz0) % 4]);
    [gz0, gz0 + 6, gz1 - 6, gz1].forEach(function (pz) { post(x1, pz); });
    fill(x1 + 1, G - 1, gz0, x1 + 2, G - 1, gz1, 18);
    // 번제단: 길이·너비 5, 높이 3, 네 모퉁이 뿔(출 27:1-2), 위에 불
    var ax = TBX + 22;
    fill(ax - 2, y, TBZ - 2, ax + 2, y + 2, TBZ + 2, BLK_CU);
    [[-2, -2], [2, -2], [-2, 2], [2, 2]].forEach(function (c) { setRaw(ax + c[0], y + 3, TBZ + c[1], BLK_CU); });
    setRaw(ax, y + 3, TBZ, LAMP);
    // 물두멍(출 30:18): 놋 받침 위 물
    var lx = TBX + 6;
    fill(lx - 1, y, TBZ - 1, lx + 1, y, TBZ + 1, BLK_CU); setRaw(lx, y, TBZ, WATER);
    // 성막: 금으로 싼 널판(출 26:29) 벽, 붉은 물 들인 숫양의 가죽 덮개(출 26:14), 동쪽 입구 기둥 다섯(출 26:37)
    var T2 = TB_TENT;
    fill(T2.x0, y, T2.z0, T2.x1, y + 9, T2.z1, BLK_AU);
    fill(T2.x0 + 1, y, T2.z0 + 1, T2.x1 - 1, y + 9, T2.z1 - 1, AIR);
    fill(T2.x0 + 1, G - 1, T2.z0 + 1, T2.x1 - 1, G - 1, T2.z1 - 1, SAND);
    fill(T2.x0 - 1, y + 10, T2.z0 - 1, T2.x1 + 1, y + 10, T2.z1 + 1, WOOL_R);
    fill(T2.x0 - 1, y + 6, T2.z0 - 1, T2.x1 + 1, y + 9, T2.z0 - 1, WOOL_R); fill(T2.x0 - 1, y + 6, T2.z1 + 1, T2.x1 + 1, y + 9, T2.z1 + 1, WOOL_R);
    fill(T2.x0 - 1, y + 6, T2.z0 - 1, T2.x0 - 1, y + 9, T2.z1 + 1, WOOL_R);
    fill(T2.x1, y, T2.z0 + 1, T2.x1, y + 8, T2.z1 - 1, AIR);
    for (z = T2.z0 + 1; z <= T2.z1 - 1; z++) setRaw(T2.x1, y + 9, z, cols[(z - T2.z0) % 3]);
    [T2.z0 + 1, T2.z0 + 3, TBZ, T2.z1 - 3, T2.z1 - 1].forEach(function (pz) { fill(T2.x1, y, pz, T2.x1, y + 8, pz, BLK_AU); });
    // 휘장(출 26:31-33): 지성소와 성소 사이 — 위로부터 아래까지 찢어져 열린 길(마 27:51, 히 10:20)
    var vx = T2.x0 + 10;
    for (z = T2.z0 + 1; z <= T2.z1 - 1; z++) fill(vx, y, z, vx, y + 9, z, cols[(z - T2.z0) % 3]);
    fill(vx, y, TBZ - 1, vx, y + 9, TBZ, AIR);
    // 지성소: 언약궤 / 성소: 남쪽 등잔대, 북쪽 떡상, 휘장 앞 분향단
    fill(T2.x0 + 4, y, TBZ - 1, T2.x0 + 5, y, TBZ, BLK_AU); setRaw(T2.x0 + 4, y + 1, TBZ - 1, LANTERN); setRaw(T2.x0 + 5, y + 1, TBZ, LANTERN);
    fill(TBX - 26, y, T2.z1 - 2, TBX - 26, y + 1, T2.z1 - 2, BLK_AU); setRaw(TBX - 26, y + 2, T2.z1 - 2, LANTERN);
    fill(TBX - 27, y, T2.z0 + 2, TBX - 25, y, T2.z0 + 2, BLK_AU);
    fill(vx + 2, y, TBZ - 1, vx + 2, y + 1, TBZ - 1, BLK_AU); setRaw(vx + 2, y + 2, TBZ - 1, LANTERN);
    for (x = T2.x0 + 14; x < T2.x1; x += 6) setRaw(x, y + 9, TBZ, LAMP);
  }
  function buildCedarTower() {   // 견고한 망대(잠 18:10): 돌 탑 18칸 + 백향목 기둥 + 넓은 전망대 + 기와 지붕
    var x0 = CTX - 4, x1 = CTX + 4, z0 = CTZ - 4, z1 = CTZ + 4, y = TWY, k;
    fill(x0 - 5, y, z0 - 5, x1 + 5, SY - 1, z1 + 5, AIR);
    fill(x0 - 2, y - 1, z0 - 2, x1 + 2, y - 1, z1 + 2, 18);
    fill(x0, y, z0, x1, y + 17, z1, SBRICK); fill(x0 + 1, y, z0 + 1, x1 - 1, y + 17, z1 - 1, AIR);
    [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].forEach(function (c) { fill(c[0], y, c[1], c[0], y + 17, c[1], CEDAR_LOG); });
    fill(CTX - 1, y, z1, CTX + 1, y + 3, z1, AIR);                       // 남쪽 문
    for (k = 5; k <= 15; k += 5) { fill(CTX, y + k, z0, CTX, y + k + 1, z0, AIR); fill(x0, y + k, CTZ + 1, x0, y + k + 1, CTZ + 1, AIR); fill(x1, y + k, CTZ, x1, y + k + 1, CTZ, AIR); }
    fill(x0 + 1, y + 9, z0 + 1, x1 - 1, y + 9, z1 - 1, GOPHER);          // 가운데 층
    for (k = 0; k <= 18; k++) setRaw(x0 + 1, y + k, CTZ - 1, LADDER + 3);   // 서쪽 벽 사닥다리
    setRaw(x1 - 1, y + 10, z1 - 1, LANTERN); setRaw(x1 - 1, y, z0 + 1, LANTERN);
    // 전망대(13×13): 바닥, 돌 난간, 백향목 기둥, 등불, 기와 지붕, 깃발
    fill(x0 - 2, y + 18, z0 - 2, x1 + 2, y + 18, z1 + 2, GOPHER); setRaw(x0 + 1, y + 18, CTZ - 1, LADDER + 3);
    for (k = x0 - 2; k <= x1 + 2; k++) { setRaw(k, y + 19, z0 - 2, RAIL); setRaw(k, y + 19, z1 + 2, RAIL); }
    for (k = z0 - 2; k <= z1 + 2; k++) { setRaw(x0 - 2, y + 19, k, RAIL); setRaw(x1 + 2, y + 19, k, RAIL); }
    [[x0 - 2, z0 - 2], [x1 + 2, z0 - 2], [x0 - 2, z1 + 2], [x1 + 2, z1 + 2]].forEach(function (c) { fill(c[0], y + 19, c[1], c[0], y + 23, c[1], CEDAR_LOG); });
    [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].forEach(function (c) { setRaw(c[0], y + 19, c[1], LANTERN); });
    for (k = 0; k < 4; k++) fill(x0 - 3 + k, y + 24 + k, z0 - 3 + k, x1 + 3 - k, y + 24 + k, z1 + 3 - k, 13);
    fill(CTX, y + 28, CTZ, CTX, y + 29, CTZ, CEDAR_LOG); setRaw(CTX, y + 30, CTZ, FLAG);
  }
  function buildTentCamp() {   // 나그네 장막촌(히 11:9): 줄무늬 양털 장막 넷, 가운데 모닥불
    var y = TCY;
    fill(TCX - 16, y, TCZ - 16, TCX + 16, SY - 1, TCZ + 16, AIR);
    fill(TCX - 2, y - 1, TCZ - 2, TCX + 2, y - 1, TCZ + 2, 18);
    [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(function (c) { setRaw(TCX + c[0], y, TCZ + c[1], STONE); }); setRaw(TCX, y, TCZ, LAMP);
    TENTS.forEach(function (t, n) {
      var tx = TCX + t[0], tz = TCZ + t[1], a = t[2] ? WOOL_B : WOOL_R;
      for (var k = 0; k <= 4; k++) for (var dz = -4; dz <= 4; dz++) {
        var c = (dz + 4) % 2 ? WOOL_W : a;
        setRaw(tx - 4 + k, y + k, tz + dz, c); setRaw(tx + 4 - k, y + k, tz + dz, c);
      }
      for (var k2 = 0; k2 <= 3; k2++) fill(tx - 3 + k2, y + k2, tz + 4, tx + 3 - k2, y + k2, tz + 4, a);   // 뒤쪽 막음
      fill(tx - 2, y - 1, tz - 3, tx + 2, y - 1, tz + 3, 18);
      fill(tx - 1, y, tz - 3, tx + 1, y, tz + 3, CARPET);
      setRaw(tx - 3, y, tz + 3, JAR); setRaw(tx + 3, y, tz + 3, OIL_JAR); setRaw(tx, y, tz + 3, OIL_LAMP);
    });
  }
  function buildLotPillar() {   // 소금 기둥(창 19:26)
    var y = G + 1;
    fill(LOTX - 1, y, LOTZ - 1, LOTX + 1, y, LOTZ + 1, SALT_ROCK);
    fill(LOTX, y + 1, LOTZ, LOTX, y + 4, LOTZ, SALT_ROCK);
  }
  // ───────── 지역 이름 카드 · 퀘스트(오늘의 부탁 · 모험 · 땅 밟기) (11/20) ─────────
  // 구절은 개역개정 원문 대조(2026-11-20, bskorea)
  var REGION_INFO = {
    town: ['나그네 마을'], west: ['서쪽 산'], east: ['동쪽 숲'], sea: ['북쪽 바다'], desert: ['동쪽 사막'], oasis: ['오아시스'],
    ararat: ['아라랏 산'], lake: ['남쪽 호수'], tar: ['역청 구덩이'], south: ['남쪽 들판'],
    cedar: ['백향목 숲', '의인은 종려나무 같이 번성하며 레바논의 백향목 같이 성장하리로다', '시편 92:12'],
    wild: ['광야', '네 하나님 여호와께서 이 사십 년 동안에 네게 광야 길을 걷게 하신 것을 기억하라 이는 너를 낮추시며 너를 시험하사 네 마음이 어떠한지 그 명령을 지키는지 지키지 않는지 알려 하심이라', '신명기 8:2'],
    salt: ['소금 바다', '너희는 세상의 소금이니 소금이 만일 그 맛을 잃으면 무엇으로 짜게 하리요 후에는 아무 쓸 데 없어 다만 밖에 버려져 사람에게 밟힐 뿐이니라', '마태복음 5:13'],
    tabernacle: ['성막', '내가 그들 중에 거할 성소를 그들이 나를 위하여 짓되', '출애굽기 25:8'],
    tower: ['백향목 망대', '여호와의 이름은 견고한 망대라 의인은 그리로 달려가서 안전함을 얻느니라', '잠언 18:10'],
    tents: ['나그네 장막촌', '믿음으로 그가 이방의 땅에 있는 것 같이 약속의 땅에 거류하여 동일한 약속을 유업으로 함께 받은 이삭 및 야곱과 더불어 장막에 거하였으니', '히브리서 11:9'],
    lot: ['소금 기둥', '롯의 아내는 뒤를 돌아보았으므로 소금 기둥이 되었더라', '창세기 19:26'],
    patmos: ['밧모섬', '나 요한은 너희 형제요 예수의 환난과 나라와 참음에 동참하는 자라 하나님의 말씀과 예수를 증언하였음으로 말미암아 밧모라 하는 섬에 있었더니', '요한계시록 1:9'],
    malta: ['멜리데섬', '비가 오고 날이 차매 원주민들이 우리에게 특별한 동정을 하여 불을 피워 우리를 다 영접하더라', '사도행전 28:2'],
    cyprus: ['구브로섬', '두 사람이 성령의 보내심을 받아 실루기아에 내려가 거기서 배 타고 구브로에 가서', '사도행전 13:4'],
    islet: ['작은 섬'],
    hermon: ['헐몬 산', '헐몬의 이슬이 시온의 산들에 내림 같도다 거기서 여호와께서 복을 명령하셨나니 곧 영생이로다', '시편 133:3'],
    taiga: ['동쪽 큰 숲', '밭과 그 가운데에 있는 모든 것은 즐거워할지로다 그 때 숲의 모든 나무들이 여호와 앞에서 즐거이 노래하리니', '시편 96:12'],
    galilee: ['갈릴리 호수', '갈릴리 해변에 다니시다가 두 형제 곧 베드로라 하는 시몬과 그의 형제 안드레가 바다에 그물 던지는 것을 보시니 그들은 어부라', '마태복음 4:18'],
    jordan: ['요단 강', '이 때에 예수께서 갈릴리로부터 요단 강에 이르러 요한에게 세례를 받으려 하시니', '마태복음 3:13'],
    sinai: ['시내 산', '여호와께서 시내 산 곧 그 산 꼭대기에 강림하시고 모세를 그리로 부르시니 모세가 올라가매', '출애굽기 19:20'],
    meadow: ['푸른 들판', '그가 나를 푸른 풀밭에 누이시며 쉴 만한 물 가로 인도하시는도다', '시편 23:2'],
    southsea: ['남쪽 큰 바다', '배들을 바다에 띄우며 큰 물에서 일을 하는 자는', '시편 107:23'],
    sisle: ['남쪽 바다의 섬'],
    // 11/24 먼 나라·먼 땅(개역개정 원문 대조, bskorea)
    babylon: ['바벨론', '너희는 내가 사로잡혀 가게 한 그 성읍의 평안을 구하고 그를 위하여 여호와께 기도하라 이는 그 성읍이 평안함으로 너희도 평안할 것임이라', '예레미야 29:7'],
    nineveh: ['니느웨', '하물며 이 큰 성읍 니느웨에는 좌우를 분변하지 못하는 자가 십이만여 명이요 가축도 많이 있나니 내가 어찌 아끼지 아니하겠느냐 하시니라', '요나 4:11'],
    egypt: ['애굽 국고성', '쌓아 둔 곡식이 바다 모래 같이 심히 많아 세기를 그쳤으니 그 수가 한이 없음이었더라', '창세기 41:49'],
    jonah: ['요나의 초막', '요나가 성읍에서 나가서 그 성읍 동쪽에 앉아 거기서 자기를 위하여 초막을 짓고 그 성읍에 무슨 일이 일어나는가를 보려고 그 그늘 아래에 앉았더라', '요나 4:5'],
    shinar: ['시날 평지', '이에 그들이 동방으로 옮기다가 시날 평지를 만나 거기 거류하며', '창세기 11:2'],
    egyptland: ['나일 강가', '더 숨길 수 없게 되매 그를 위하여 갈대 상자를 가져다가 역청과 나무 진을 칠하고 아기를 거기 담아 나일 강 가 갈대 사이에 두고', '출애굽기 2:3'],
    swamp: ['갈대 늪', '그것이 연 잎 아래에나 갈대 그늘에서나 늪 속에 엎드리니', '욥기 40:21'],
    snow: ['눈 덮인 산', '눈을 양털 같이 내리시며 서리를 재 같이 흩으시며', '시편 147:16']
  };
  var WALK_KEYS = ['town', 'east', 'west', 'sea', 'desert', 'oasis', 'ararat', 'lake', 'tar', 'south', 'cedar', 'wild', 'salt', 'patmos', 'malta', 'cyprus', 'hermon', 'taiga', 'galilee', 'jordan', 'sinai', 'meadow', 'southsea'];
  var ADV = { day: '', list: [], done: {}, regions: {}, tour: 0, total: 0, bonus: '' };
  try { var advS = JSON.parse(localStorage.getItem('arkVillage.adv') || 'null'); if (advS && typeof advS === 'object') { for (var ak in advS) ADV[ak] = advS[ak]; } } catch (e) {}
  function advSave() { try { localStorage.setItem('arkVillage.adv', JSON.stringify(ADV)); } catch (e) {} if (typeof stateDirty === 'function') stateDirty(); advChip(); }
  function advMerge(d) {   // 다른 기기 기록과 합치기(이룬 것은 잃지 않게)
    if (!d || typeof d !== 'object') return;
    ['done', 'regions'].forEach(function (k) { for (var q in (d[k] || {})) ADV[k][q] = 1; });
    ADV.tour = Math.max(ADV.tour || 0, d.tour || 0); ADV.total = Math.max(ADV.total || 0, d.total || 0);
    if (d.day && d.day >= ADV.day && Array.isArray(d.list)) { if (d.day > ADV.day) { ADV.day = d.day; ADV.list = d.list; } else d.list.forEach(function (e, i) { var m = ADV.list[i]; if (m && e && e.i === m.i) { m.n = Math.max(m.n || 0, e.n || 0); m.claimed = m.claimed || e.claimed; } }); }
    if (d.bonus && d.bonus > (ADV.bonus || '')) ADV.bonus = d.bonus;
    try { localStorage.setItem('arkVillage.adv', JSON.stringify(ADV)); } catch (e) {}
  }
  // 지역 카드: 새 지역에 들어서면 가운데에 이름(과 말씀)
  var regKey = '', regPend = '', regPendN = 0, regCardT = null;
  function regionKeyAt() {
    var x = Math.floor(P.x), z = Math.floor(P.z), lm = inLandmark(x, z);
    if (lm) return lm;
    if (inTown(x, z) || plotAt(x, z) >= 0 || inCommons(x, z) || inArk(x, G + 2, z)) return 'town';
    var r = region(x, z); return REGION_INFO[r] ? r : (z > LZ + 50 ? 'south' : '');
  }
  function showRegionCard(k, first) {
    var info = REGION_INFO[k]; if (!info || $('card').classList.contains('show')) return;
    var el = $('regionCard');
    if (!el) { el = document.createElement('div'); el.id = 'regionCard'; el.style.cssText = 'position:fixed;left:50%;top:21%;transform:translateX(-50%);z-index:30;pointer-events:none;text-align:center;width:min(560px,84vw);transition:opacity .8s;opacity:0;text-shadow:0 2px 0 #000,0 0 12px rgba(0,0,0,.7)'; document.body.appendChild(el); }
    el.innerHTML = '';
    var n = document.createElement('div'); n.textContent = info[0]; n.style.cssText = 'font-size:' + (isTouch ? 26 : 34) + 'px;color:#ffe27a;letter-spacing:3px;font-weight:bold'; el.appendChild(n);
    if (first) { var f = document.createElement('div'); f.textContent = '— 처음 밟은 땅 —'; f.style.cssText = 'font-size:12px;color:#fff;opacity:.85;margin-top:2px'; el.appendChild(f); }
    if (info[1]) { var v = document.createElement('div'); v.textContent = '「' + info[1] + '」 ' + info[2]; v.style.cssText = 'font-size:' + (isTouch ? 12 : 14) + 'px;color:#fff;margin-top:6px;line-height:1.45'; el.appendChild(v); }
    el.style.opacity = '1'; clearTimeout(regCardT); regCardT = setTimeout(function () { el.style.opacity = '0'; }, info[1] ? 6500 : 3200);
  }
  function regionTick() {
    if (!started || ui !== 'play') return;
    advDaily(); advChip();
    if (P.y < 0) newsMark('deep');
    if (/patmos|malta|cyprus|islet/.test(region(Math.floor(P.x), Math.floor(P.z)))) newsMark('isles');
    if (P.x >= 2048 || P.z >= 2048) newsMark('bigworld');
    if (have(TOOL_ONYX) > 0) newsMark('onyx');
    var k = regionKeyAt();
    if (k && k !== regKey) {
      if (k === regPend) regPendN++; else { regPend = k; regPendN = 1; }
      if (regPendN >= 2) {
        var first = !ADV.regions[k] && WALK_KEYS.indexOf(k) >= 0;
        regKey = k; showRegionCard(k, first && k !== 'town');
        if (first) { ADV.regions[k] = 1; advSave(); }
        questEvent('visit', k, 1);
        if (k === 'lot') advDone('lot');
        if (k === 'cedar' || k === 'wild' || k === 'salt' || k === 'tabernacle' || k === 'tower' || k === 'tents') newsMark('south');
      }
    }
    // 모험: 성막 순례 · 망대 꼭대기 · 장막촌의 밤 · 소금 10개
    var x = P.x, z = P.z;
    if (!ADV.done.tabernacle && inLandmark(Math.floor(x), Math.floor(z)) === 'tabernacle') {
      var T2 = TB_TENT, vx = T2.x0 + 10, step = ADV.tour || 0, inTent = x > T2.x0 && x < T2.x1 + 0.5 && z > T2.z0 && z < T2.z1 + 1;
      var ok = [Math.abs(x - (TBX + 49)) < 6 && Math.abs(z - TBZ) < 11, Math.hypot(x - (TBX + 22), z - TBZ) < 5.5, Math.hypot(x - (TBX + 6), z - TBZ) < 3.5, inTent && x > vx + 1, inTent && x < vx][step];
      var names = ['🚪 뜰 문으로 들어왔어요 — 번제단으로 가요', '🔥 번제단(출 27:1) — 이제 물두멍으로', '💧 물두멍(출 30:18) — 이제 성막 안 성소로', '🕯 성소 — 등잔대·떡상·분향단 너머 휘장이 열려 있어요', ''];
      if (ok) { ADV.tour = step + 1; advSave(); if (step < 4) toast(names[step]); else advDone('tabernacle'); }
    }
    if (!ADV.done.tower && Math.abs(x - CTX) < 8 && Math.abs(z - CTZ) < 8 && P.y >= TWY + 18) advDone('tower');
    if (!ADV.done.tents && inLandmark(Math.floor(x), Math.floor(z)) === 'tents' && isNight()) advDone('tents');
    if (!ADV.done.salt10 && have(SALT) >= 10) advDone('salt10');
    if (!ADV.done.walk && WALK_KEYS.every(function (k2) { return ADV.regions[k2]; })) advDone('walk');
    farTick(k);   // 11/24 먼 나라 찾기
  }
  // 모험(한 번만): [키, 이름, 할 일, 보상, 카드(그림·이름·말씀·장절) 또는 null]
  var ADVS = [
    ['tabernacle', '⛺ 성막 순례', '광야 한가운데 성막: 뜰 문 → 번제단 → 물두멍 → 성소 → 지성소 순서로 걸어 봐요', [[GEM_SAPH, 1], [LANTERN, 2]], ['⛺', '열린 휘장', '그 길은 우리를 위하여 휘장 가운데로 열어 놓으신 새로운 살 길이요 휘장은 곧 그의 육체니라', '히브리서 10:20']],
    ['tower', '🗼 백향목 망대 꼭대기', '백향목 숲 가운데 돌 망대의 사닥다리를 타고 꼭대기 전망대까지 올라가요', [[ARROW, 12]], ['🗼', '견고한 망대', REGION_INFO.tower[1], REGION_INFO.tower[2]]],
    ['tents', '⛺ 장막촌의 밤', '소금 바다 서쪽 나그네 장막촌에서 밤을 맞아요', [[BREAD, 4], [WOOL_W, 6]], ['⛺', '장막에 거한 나그네', REGION_INFO.tents[1], REGION_INFO.tents[2]]],
    ['salt10', '🧂 세상의 소금', '소금 바다의 소금 땅·소금 바위를 캐서 소금 10개를 모아요', [[COOKED_FISH, 3]], ['🧂', '세상의 소금', REGION_INFO.salt[1], REGION_INFO.salt[2]]],
    ['lot', '🧂 뒤돌아보지 않기', '소금 바다 남쪽 바닷가의 소금 기둥을 찾아가요', [[SHARD, 2]], null],
    ['vein', '💎 광맥 찾기', '광석을 캐다가 이어진 광석이 5개 넘는 줄기를 찾아요', [[ING_FE, 3]], null],
    ['crit', '✦ 강한 일격', '뛰어올라 떨어지면서 칼로 쳐서 그림자를 물리쳐요', [[SHARD, 3]], null],
    ['walk', '🗺 땅을 두루 밟기', '나그네 땅 13곳을 모두 밟아요(땅 밟기 탭)', [[GEM_DIA, 1], [ING_AU, 2]], ['🗺', '두루 다녀 보라', '너는 일어나 그 땅을 종과 횡으로 두루 다녀 보라 내가 그것을 네게 주리라', '창세기 13:17']]
  ];
  function advDone(k) {
    if (ADV.done[k]) return;
    var a = ADVS.filter(function (q) { return q[0] === k; })[0]; if (!a) return;
    ADV.done[k] = 1; advSave();
    a[3].forEach(function (r) { give(r[0], r[1]); }); bagChanged();
    var gift = a[3].map(function (r) { return B[r[0]][0] + ' ' + r[1]; }).join(', ');
    if ($('regionCard')) $('regionCard').style.opacity = '0';
    if (a[4]) showVerseCard(a[4][0], a[4][1], a[4][2], a[4][3], '모험 「' + a[1].replace(/^\S+ /, '') + '」을(를) 마쳤어요 — ' + gift);
    else toast('🎉 모험 「' + a[1] + '」 완료! ' + gift + ' 받았어요');
    sfx('craft'); vibrate('break');
  }
  // 오늘의 부탁(매일 한국 시간 0시에 셋이 바뀜): [종류, 대상, 목표, 글, 보상]
  var ERRANDS = [
    ['ore', ORE_COAL, 8, '⛏ 석탄 광석 8개 캐기', [[TORCH, 6]]],
    ['ore', ORE_CU, 6, '⛏ 구리 광석 6개 캐기', [[ING_CU, 3]]],
    ['ore', ORE_FE, 5, '⛏ 철 광석 5개 캐기', [[ING_FE, 3]]],
    ['ore', ORE_AG, 3, '⛏ 은 광석 3개 캐기', [[ING_AU, 1]]],
    ['shadow', '', 3, '⚔ 어둠의 그림자 3번 물리치기', [[SHARD, 2], [ARROW, 6]]],
    ['shadow', 'doubt', 2, '🛡 「의심」 그림자 2번 물리치기', [[SHARD, 3]]],
    ['log', '', 12, '🪓 통나무 12개 캐기(백향목도 돼요)', [[BREAD, 3]]],
    ['salt', '', 8, '🧂 소금 바다에서 소금 8개 캐기', [[COOKED_FISH, 2]]],
    ['red', '', 8, '🪨 광야의 붉은 바위 8개 캐기', [[RED_EARTH, 4], [LANTERN, 1]]],
    ['place', '', 40, '🧱 블록 40개 놓아 짓기', [[LANTERN, 2]]],
    ['craft', '', 5, '🔨 무엇이든 5번 만들기', [[ING_CU, 2]]],
    ['visit', 'cedar', 1, '🌲 백향목 숲 다녀오기', [[BREAD, 2]]],
    ['visit', 'wild', 1, '🏜 광야 다녀오기', [[BREAD, 2]]],
    ['visit', 'salt', 1, '🌊 소금 바다 다녀오기', [[BREAD, 2]]],
    ['visit', 'ararat', 1, '⛰ 아라랏 산 다녀오기', [[BREAD, 2]]]
  ];
  function kstDay() { return new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10); }
  function advDaily() {
    var d = kstDay(); if (ADV.day === d && ADV.list.length) return;
    var seed = 0; for (var i = 0; i < d.length; i++) seed = (seed * 31 + d.charCodeAt(i)) | 0;
    var R = mkRand(seed), pick = [], kinds = {};
    while (pick.length < 3) { var j = Math.floor(R() * ERRANDS.length), e = ERRANDS[j], kk = e[0] === 'visit' || e[0] === 'ore' ? e[0] : e[0] + e[1]; if (kinds[kk]) continue; kinds[kk] = 1; pick.push(j); }
    ADV.day = d; ADV.list = pick.map(function (j) { return { i: j, n: 0, base: ERRANDS[j][0] === 'place' ? stats.placed : (ERRANDS[j][0] === 'craft' ? stats.crafted : 0), claimed: false }; });
    advSave();
  }
  function errandProg(e) {
    var E = ERRANDS[e.i]; if (!E) return 0;
    if (E[0] === 'place') return Math.max(0, stats.placed - e.base);
    if (E[0] === 'craft') return Math.max(0, stats.crafted - e.base);
    return e.n || 0;
  }
  var errToldDay = {};
  function questEvent(kind, key, n) {
    if (!started) return;
    if (kind === 'vein') { newsMark('vein'); if (key >= 5) advDone('vein'); return; }
    if (kind === 'crit') { newsMark('crit'); advDone('crit'); return; }
    advDaily();
    var ch = false;
    ADV.list.forEach(function (e) {
      var E = ERRANDS[e.i]; if (!E || e.claimed) return;
      var hit = (E[0] === kind && (E[1] === '' || E[1] === key)) ||
        (E[0] === 'log' && kind === 'break' && (key === LOG || key === CEDAR_LOG || key === LOG_X || key === LOG_Z)) ||
        (E[0] === 'salt' && kind === 'break' && (key === SALT_CRUST || key === SALT_ROCK)) ||
        (E[0] === 'red' && kind === 'break' && (key === RED_ROCK || key === RED_ROCK2));
      if (!hit) return;
      var before = errandProg(e); e.n = (e.n || 0) + n; ch = true;
      if (before < E[2] && errandProg(e) >= E[2]) { toast('📜 부탁 완료: ' + E[3].replace(/^\S+ /, '') + ' — 📜 퀘스트에서 보상을 받아요'); sfx('craft'); }
    });
    if (ch) advSave();
  }
  function claimErrand(idx) {
    var e = ADV.list[idx], E = e && ERRANDS[e.i]; if (!E || e.claimed || errandProg(e) < E[2]) return;
    e.claimed = true; ADV.total = (ADV.total || 0) + 1;
    E[4].forEach(function (r) { give(r[0], r[1]); }); bagChanged(); sfx('craft');
    toast('🎁 ' + E[4].map(function (r) { return B[r[0]][0] + ' ' + r[1]; }).join(', ') + ' 받았어요');
    if (ADV.list.every(function (q) { return q.claimed; }) && ADV.bonus !== ADV.day) {
      ADV.bonus = ADV.day; give(GEM_SAPH, 1); bagChanged();
      setTimeout(function () { showVerseCard('🤝', '오늘의 부탁을 다 들어줬어요', '너희가 짐을 서로 지라 그리하여 그리스도의 법을 성취하라', '갈라디아서 6:2', '덤으로 청옥 1개를 받았어요 — 내일 새 부탁이 와요'); }, 400);
    }
    advSave();
  }
  function advChip() {
    var c = $('advChip'); if (!c) return;
    if (!started) { c.hidden = true; return; }
    var ready = ADV.list.filter(function (e) { var E = ERRANDS[e.i]; return E && !e.claimed && errandProg(e) >= E[2]; }).length;
    var left = ADV.list.filter(function (e) { return !e.claimed; }).length;
    c.hidden = false; c.innerHTML = '<img class="uic" src="assets/ark-ui/quest.png" alt="">' + (ready ? '보상 ' + ready : '부탁 ' + left);
    c.classList.toggle('ready', ready > 0);
  }
  var questTab = 'today';
  function openQuests(tab) {
    if (tab) questTab = tab;
    newsMark('quest');
    advDaily();
    var box = fbBox('📜 퀘스트');
    var tabs = document.createElement('div'); tabs.style.cssText = 'display:flex;gap:6px'; box.appendChild(tabs);
    [['today', '오늘의 부탁'], ['adv', '모험 ' + ADVS.filter(function (a) { return ADV.done[a[0]]; }).length + '/' + ADVS.length], ['walk', '땅 밟기 ' + WALK_KEYS.filter(function (k) { return ADV.regions[k]; }).length + '/' + WALK_KEYS.length], ['fun', '놀이']].forEach(function (t) {
      var b = fbBtn(tabs, t[1], function () { openQuests(t[0]); }); b.style.flex = '1'; b.style.fontSize = '13px'; if (questTab === t[0]) b.style.boxShadow = 'inset 0 0 0 2px #ffe27a';
    });
    var body = document.createElement('div'); body.style.cssText = 'display:flex;flex-direction:column;gap:6px;font-size:13px'; box.appendChild(body);
    function row(title, sub, right) {
      var r = document.createElement('div'); r.style.cssText = 'display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.06);padding:6px 8px';
      var l = document.createElement('div'); l.style.flex = '1';
      var t = document.createElement('div'); t.textContent = title; l.appendChild(t);
      if (sub) { var s = document.createElement('small'); s.textContent = sub; s.style.cssText = 'opacity:.75;display:block;margin-top:2px'; l.appendChild(s); }
      r.appendChild(l); if (right) r.appendChild(right); body.appendChild(r); return r;
    }
    function gifts(list) { return '보상: ' + list.map(function (r) { return B[r[0]][0] + ' ' + r[1]; }).join(', '); }
    if (questTab === 'today') {
      ADV.list.forEach(function (e, i) {
        var E = ERRANDS[e.i]; if (!E) return;
        var p = Math.min(errandProg(e), E[2]), right;
        if (e.claimed) { right = document.createElement('b'); right.textContent = '✔ 받음'; right.style.color = '#8be08b'; }
        else if (p >= E[2]) right = fbBtn(document.createElement('span'), '보상 받기', function () { claimErrand(i); openQuests(); });
        else { right = document.createElement('b'); right.textContent = p + '/' + E[2]; }
        row(E[3], gifts(E[4]), right);
      });
      var note = document.createElement('small'); note.style.opacity = '.75';
      note.textContent = '매일 0시에 새 부탁 셋이 와요. 셋을 다 들어주면 덤으로 청옥을 받아요. 지금까지 들어준 부탁 ' + (ADV.total || 0) + '번'; body.appendChild(note);
    } else if (questTab === 'adv') {
      ADVS.forEach(function (a) {
        var right = document.createElement('b'); right.textContent = ADV.done[a[0]] ? '✔' : (a[0] === 'tabernacle' && ADV.tour ? ADV.tour + '/5' : '');
        right.style.color = '#8be08b'; row(a[1], a[2] + ' · ' + gifts(a[3]), right);
      });
      var go = document.createElement('div'); go.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap'; body.appendChild(go);
      [['🌲 백향목 숲', CTX + 0.5, CTZ + 9.5], ['🏜 광야 성막', TBX + 56.5, TBZ + 0.5], ['🌊 소금 바다', TCX + 0.5, TCZ + 18.5]].forEach(function (g) {
        fbBtn(go, g[0] + ' 길 안내', function () { $('fbBox').remove(); startFrontierGuide([Math.floor(g[1]), Math.floor(g[2])], g[0].replace(/^\S+ /, '')); resume(); }).style.fontSize = '12px';
      });
    } else if (questTab === 'fun') {
      renderFunTab(row, body);
    } else {
      WALK_KEYS.forEach(function (k) { var right = document.createElement('b'); right.textContent = ADV.regions[k] ? '✔' : '?'; right.style.color = ADV.regions[k] ? '#8be08b' : '#999'; row(ADV.regions[k] ? REGION_INFO[k][0] : '아직 밟지 않은 땅', null, right); });
    }
    fbBtn(box, '닫기', function () { box.remove(); });
  }
