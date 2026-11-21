  // ───────── 동물·새·물고기 ─────────
  // 네발짐승: 몸통(상자 여러 개) + 다리 4개. 앞쪽은 -z.
  var BEASTS = {
    sheep: { name: '양', n: 26, speed: 1.6, leg: [0.32, 1.0, 0x5a4a3e], lx: 0.45, lz: 0.72, parts: [   // 11/21 GPT 참고: 크림색 털 세 층 + 회갈색 얼굴
      [1.55, 0.5, 2.25, 0xe9dfca, 0, 1.3, 0], [1.75, 0.45, 2.4, 0xf1e9d6, 0, 1.75, 0], [1.45, 0.42, 2.05, 0xf7f1e3, 0, 2.18, 0], [0.6, 0.55, 0.4, 0xf1e9d6, 0, 1.85, 1.25],
      [0.72, 0.72, 0.75, 0x7a6a5c, 0, 1.95, -1.4], [0.46, 0.36, 0.3, 0x9a8a7c, 0, 1.8, -1.85], [0.32, 0.16, 0.22, 0x6a5a4c, -0.48, 2.12, -1.35], [0.32, 0.16, 0.22, 0x6a5a4c, 0.48, 2.12, -1.35],
      [0.82, 0.26, 0.55, 0xf1e9d6, 0, 2.38, -1.3], [0.1, 0.1, 0.05, 0x141210, -0.2, 2.05, -1.78], [0.1, 0.1, 0.05, 0x141210, 0.2, 2.05, -1.78]] },
    goat: { name: '염소', n: 16, speed: 2.2, leg: [0.27, 1.2, 0x5a4430], lx: 0.33, lz: 0.68, parts: [
      [1.0, 1.05, 1.9, 0x8a6a4a, 0, 1.72, 0], [0.62, 0.68, 0.8, 0x7a5c40, 0, 2.35, -1.1], [0.12, 0.5, 0.12, 0x3a3026, -0.2, 2.9, -0.95], [0.12, 0.5, 0.12, 0x3a3026, 0.2, 2.9, -0.95],
      [0.2, 0.4, 0.15, 0xeee6d6, 0, 1.9, -1.45], [0.2, 0.3, 0.35, 0x8a6a4a, 0, 2.2, 1.0]] },
    cow: { name: '소', n: 10, speed: 1.2, leg: [0.42, 1.3, 0xece8df], lx: 0.55, lz: 1.0, parts: [
      [1.6, 1.5, 2.9, 0xf2efe8, 0, 2.05, 0], [1.62, 0.8, 0.9, 0x5a3a26, 0, 2.3, 0.45], [1.62, 0.6, 0.7, 0x5a3a26, 0, 1.85, -0.75],
      [1.0, 1.0, 0.9, 0xf2efe8, 0, 2.55, -1.75], [0.8, 0.4, 0.22, 0xe6a8a0, 0, 2.25, -2.25], [0.15, 0.35, 0.15, 0xddd5c0, -0.42, 3.15, -1.65], [0.15, 0.35, 0.15, 0xddd5c0, 0.42, 3.15, -1.65]] },
    camel: { name: '낙타', n: 6, speed: 1.4, leg: [0.3, 2.2, 0xa07a4a], lx: 0.45, lz: 0.9, parts: [   // 11/21 GPT 참고: 높이 솟은 혹 하나 + 긴 목
      [1.4, 1.2, 2.6, 0xb8935a, 0, 2.8, 0], [1.05, 0.65, 1.15, 0xc9a06a, 0, 3.72, 0.1], [0.62, 0.38, 0.62, 0xd9b27a, 0, 4.22, 0.1], [0.5, 1.45, 0.55, 0xb8935a, 0, 3.55, -1.38],
      [0.6, 0.6, 1.0, 0xc29a62, 0, 4.4, -1.78], [0.46, 0.4, 0.36, 0xa07a4a, 0, 4.25, -2.4], [0.14, 0.2, 0.14, 0x8a6a40, -0.22, 4.78, -1.55], [0.14, 0.2, 0.14, 0x8a6a40, 0.22, 4.78, -1.55],
      [0.08, 0.1, 0.05, 0x141210, -0.31, 4.5, -2.0], [0.08, 0.1, 0.05, 0x141210, 0.31, 4.5, -2.0], [0.15, 0.8, 0.15, 0x8a6a40, 0, 2.6, 1.35]] },
    // 말: 긴 다리·목·갈기(욥 39:19), 나귀: 작은 몸·긴 귀(슥 9:9). seat = 안장 높이, ride = 탈 때 빠르기, jump = 탈 때 뛰는 힘
    horse: { name: '말', n: 8, speed: 2.4, seat: 3.35, ride: 17, jump: 18.5, leg: [0.3, 2.0, 0x4a2e1a], lx: 0.42, lz: 1.0, parts: [
      [1.2, 1.2, 2.8, 0x8a5a34, 0, 2.6, 0], [0.7, 1.4, 0.8, 0x8a5a34, 0, 3.45, -1.35], [0.62, 0.62, 1.3, 0x8a5a34, 0, 4.1, -1.95], [0.5, 0.4, 0.32, 0x3a2414, 0, 3.95, -2.62],
      [0.14, 0.34, 0.14, 0x6a4428, -0.2, 4.55, -1.6], [0.14, 0.34, 0.14, 0x6a4428, 0.2, 4.55, -1.6], [0.2, 1.7, 0.5, 0x24160c, 0, 3.8, -1.1],
      [0.08, 0.12, 0.12, 0x111111, -0.32, 4.2, -2.1], [0.08, 0.12, 0.12, 0x111111, 0.32, 4.2, -2.1], [0.3, 1.3, 0.3, 0x24160c, 0, 2.45, 1.5], [1.22, 0.3, 0.3, 0xf0e8dc, 0, 1.55, -1.0],
      [0.5, 0.26, 0.18, 0x24160c, 0, 4.48, -2.02], [0.24, 0.5, 1.3, 0x24160c, 0, 4.62, -1.55]] },   // 11/21 앞머리·목 위 갈기(욥 39:19)
    donkey: { name: '나귀', n: 8, speed: 1.8, seat: 2.65, ride: 12, jump: 15.5, leg: [0.25, 1.5, 0x6a6662], lx: 0.36, lz: 0.8, parts: [
      [1.0, 1.0, 2.2, 0x8e8a86, 0, 2.0, 0], [0.55, 1.0, 0.65, 0x8e8a86, 0, 2.7, -1.05], [0.56, 0.56, 1.1, 0x8e8a86, 0, 3.15, -1.5], [0.46, 0.42, 0.3, 0xe2ded6, 0, 3.0, -2.06],
      [0.15, 0.75, 0.15, 0x7a7672, -0.18, 3.75, -1.3], [0.15, 0.75, 0.15, 0x7a7672, 0.18, 3.75, -1.3], [0.08, 0.1, 0.1, 0x111111, -0.29, 3.25, -1.7], [0.08, 0.1, 0.1, 0x111111, 0.29, 3.25, -1.7],
      [0.14, 0.9, 0.3, 0x3e3a38, 0, 3.0, -0.95], [0.14, 1.0, 0.14, 0x3e3a38, 0, 1.85, 1.15], [1.02, 0.05, 0.3, 0x3e3a38, 0, 2.51, -0.3], [0.3, 0.05, 2.2, 0x3e3a38, 0, 2.51, 0], [1.0, 0.25, 1.6, 0xd8d2c8, 0, 1.5, 0]] },
    rabbit: { name: '토끼', n: 16, speed: 3.2, hop: true, leg: [0.16, 0.3, 0xa89074], lx: 0.2, lz: 0.3, parts: [
      [0.6, 0.55, 0.9, 0xb8a088, 0, 0.58, 0], [0.5, 0.5, 0.5, 0xb8a088, 0, 0.98, -0.5], [0.12, 0.55, 0.12, 0xb8a088, -0.12, 1.45, -0.45], [0.12, 0.55, 0.12, 0xb8a088, 0.12, 1.45, -0.45], [0.25, 0.25, 0.2, 0xffffff, 0, 0.68, 0.5]] }
  };
  var animals = [], birds = [], fishes = [], aniGeo = {};
  function groundAt(x, z, fromY) {
    var ix = Math.floor(x), iz = Math.floor(z);
    if (ix < 1 || iz < 1 || ix >= SX - 1 || iz >= SZ - 1) return null;
    // 나뭇잎·통나무는 땅으로 치지 않는다(동물이 나무 꼭대기에 서는 문제) — 통나무 자리는 막힌 곳
    for (var y = Math.floor(fromY) + 2; y >= YMIN + 1; y--) {
      var id = get(ix, y, iz); if (id === WATER) return null;
      if (id === LEAF || id === LOG || id === CEDAR_LEAF || id === CEDAR_LOG || id === LIFELEAF) continue;   // 백향목 잎·줄기도 땅이 아님(11/20 말이 숲 꼭대기에 섬)
      if (isSolid(id)) { var up = get(ix, y + 1, iz); return up === LOG || up === CEDAR_LOG ? null : y + 1; }
    }
    return null;
  }
  function makeBeast(kindName, x, z) {
    var sp = BEASTS[kindName];
    if (!aniGeo[kindName]) aniGeo[kindName] = { body: mergedBoxes(sp.parts), leg: boxGeo(sp.leg[0], sp.leg[1], sp.leg[0], sp.leg[2]) };
    var root = new THREE.Group(), body = new THREE.Mesh(aniGeo[kindName].body, avatarMat), legs = [];
    root.add(body);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (s) {
      var p = new THREE.Group(); p.position.set(s[0] * sp.lx, sp.leg[1], s[1] * sp.lz);
      var m = new THREE.Mesh(aniGeo[kindName].leg, avatarMat); m.position.y = -sp.leg[1] / 2; p.add(m); root.add(p); legs.push(p);
    });
    var y = groundAt(x, z, SY - 3) || G;
    root.position.set(x, y, z); scene.add(root);
    return { sp: sp, kind: kindName, mesh: root, body: body, legs: legs, x: x, y: y, ty: y, z: z, h: Math.random() * 6.28, mode: 'idle', t: Math.random() * 3, walk: 0 };
  }
  function stepBeast(a, dt) {
    if (a === riding) return;
    a.t -= dt;
    if (a.saddled && a.mode === 'walk') a.mode = 'idle';
    if (a.t <= 0) {
      if (a.mode === 'walk') { a.mode = 'idle'; a.t = 1.5 + Math.random() * 4; }
      else if (!a.saddled) { a.mode = 'walk'; a.t = 2 + Math.random() * 4; a.h += (Math.random() - 0.5) * 2.6; }
      else a.t = 3;
    }
    var moving = false;
    if (a.mode === 'walk') {
      var s = a.sp.speed * dt, nx = a.x - Math.sin(a.h) * s, nz = a.z - Math.cos(a.h) * s, gy = groundAt(nx, nz, a.y);
      // 11/20 땅 칸: 남의 땅은 못 들어감. 내 땅은 밀·지팡이로 불러 데려올 때만 들어오고, 들어온 동물은 부르지 않으면 내 땅(우리) 밖으로 나가지 않음
      var np = plotAt(nx | 0, nz | 0), cp = plotAt(a.x | 0, a.z | 0), lured = a.luredUntil > Date.now();
      var plotBlock = np >= 0 && (np !== myPlot || myPlot < 0 || (cp !== np && !lured));
      if (myPlot >= 0 && cp === myPlot && np !== myPlot && !lured) plotBlock = true;
      if (gy === null || Math.abs(gy - a.y) > 1.2 || plotBlock || inArk(nx | 0, gy | 0, nz | 0) || Math.hypot(nx - P.x, nz - P.z) < 1.4) {
        a.h += Math.PI * (0.5 + Math.random()); a.mode = 'idle'; a.t = 0.4;
      } else { a.x = nx; a.z = nz; a.ty = gy; a.walk += s * 2.4; moving = true; }
    }
    a.y += (a.ty - a.y) * Math.min(1, 10 * dt);
    var hop = a.sp.hop && moving ? Math.abs(Math.sin(a.walk * 1.2)) * 0.5 : 0;
    a.mesh.position.set(a.x, a.y + hop, a.z);
    var dh = a.h - a.mesh.rotation.y; dh = Math.atan2(Math.sin(dh), Math.cos(dh));
    a.mesh.rotation.y += dh * Math.min(1, 6 * dt);
    var sw = moving && !a.sp.hop ? Math.sin(a.walk * 2) * 0.6 : 0;
    a.legs[0].rotation.x = sw; a.legs[3].rotation.x = sw; a.legs[1].rotation.x = -sw; a.legs[2].rotation.x = -sw;
    // 서 있을 때 가끔 고개 숙여 풀 뜯기
    a.body.rotation.x = a.mode === 'idle' && a.t > 1 && !a.sp.hop ? Math.min(0.12, (a.t - 1) * 0.1) : 0;
  }
  // 새: 비둘기(흰색)·까마귀(검정) — 창 8:7-12
  function spawnBirds() {
    var types = [{ name: '비둘기', col: 0xf4f4f0, n: 12 }, { name: '까마귀', col: 0x26262c, n: 5 }];
    types.forEach(function (t, ti) {
      var bodyG = mergedBoxes([[0.45, 0.4, 0.9, t.col, 0, 0, 0], [0.34, 0.34, 0.34, t.col, 0, 0.15, -0.58], [0.12, 0.1, 0.22, ti ? 0x111111 : 0xd99a5a, 0, 0.1, -0.84], [0.35, 0.08, 0.4, t.col, 0, 0.05, 0.6]]);
      var wingG = boxGeo(0.9, 0.06, 0.5, ti ? 0x1c1c22 : 0xe8e8e2); wingG.translate(0.45, 0, 0);
      for (var i = 0; i < t.n; i++) {
        var root = new THREE.Group(), body = new THREE.Mesh(bodyG, avatarMat), wl = new THREE.Mesh(wingG, avatarMat), wr = new THREE.Mesh(wingG, avatarMat);
        wl.position.x = 0.2; wr.position.x = -0.2; wr.scale.x = -1;
        root.add(body); root.add(wl); root.add(wr); scene.add(root);
        var k = ti * 50 + i;
        birds.push({ kind: ti ? 'raven' : 'dove', mesh: root, wl: wl, wr: wr, cx: 30 + rnd(k * 3.1) * (SX - 60), cz: 30 + rnd(k * 4.7) * (SZ - 60), r: 12 + rnd(k * 5.9) * 30,
          alt: G + 22 + rnd(k * 6.1) * 22, ang: rnd(k) * 6.28, spd: (0.25 + rnd(k * 2.2) * 0.25) * (rnd(k * 8.8) < 0.5 ? -1 : 1), flap: rnd(k * 9.9) * 6 });
      }
    });
  }
  function stepBird(b, dt, t) {
    var cp = camera.position;
    if (Math.abs(b.cx - cp.x) > 220 || Math.abs(b.cz - cp.z) > 220) { b.cx = cp.x + (Math.random() - 0.5) * 300; b.cz = cp.z + (Math.random() - 0.5) * 300; b.alt = Math.max(G + 22, surfaceY(b.cx | 0, b.cz | 0) + 14) + Math.random() * 12; }
    b.ang += b.spd * dt;
    var x = b.cx + Math.cos(b.ang) * b.r, z = b.cz + Math.sin(b.ang) * b.r, y = b.alt + Math.sin(b.ang * 2) * 2;
    var dx = -Math.sin(b.ang) * b.spd, dz = Math.cos(b.ang) * b.spd;
    b.mesh.position.set(x, y, z); b.mesh.rotation.y = Math.atan2(-dx, -dz);
    var f = Math.sin(t * 9 + b.flap) * 0.7; b.wl.rotation.z = f; b.wr.rotation.z = -f;
  }
  function stepFish(f, dt, t) {
    f.t -= dt;
    if (f.t <= 0) { f.h += (Math.random() - 0.5) * 2; f.t = 1 + Math.random() * 3; }
    var nx = f.x - Math.sin(f.h) * f.spd * dt, nz = f.z - Math.cos(f.h) * f.spd * dt;
    if (get(Math.floor(nx), Math.floor(f.y), Math.floor(nz)) === WATER) { f.x = nx; f.z = nz; } else { f.h += Math.PI * (0.6 + Math.random() * 0.8); }
    f.mesh.position.set(f.x, f.y + Math.sin(t * 2 + f.spd * 5) * 0.08, f.z);
    f.mesh.rotation.y = f.h + Math.sin(t * 10 + f.spd * 7) * 0.18;
  }
  function stepCreatures(dt, t) {
    spawnSavedHorses();
    var cx = camera.position.x, cz = camera.position.z, far = 150 * 150;
    for (var i = 0; i < animals.length; i++) {
      var a = animals[i], d2 = (a.x - cx) * (a.x - cx) + (a.z - cz) * (a.z - cz);
      a.mesh.visible = d2 < far; if (a.mesh.visible) stepBeast(a, dt);
    }
    for (i = 0; i < birds.length; i++) stepBird(birds[i], dt, t);
    for (i = 0; i < fishes.length; i++) {
      var f = fishes[i], fd = (f.x - cx) * (f.x - cx) + (f.z - cz) * (f.z - cz);
      f.mesh.visible = fd < 90 * 90; if (f.mesh.visible) stepFish(f, dt, t);
    }
  }

  // ───────── 말씀 카드(동물을 누르면) · 도감 · 처음 안내 ─────────
  // 구절은 개역개정 원문(대한성서공회)으로 확인함(2026-11-18)
  var CREATURE = {
    sheep: { emoji: '🐑', name: '양', ref: '시편 23:1', text: '여호와는 나의 목자시니 내게 부족함이 없으리로다' },
    goat: { emoji: '🐐', name: '염소', ref: '창세기 6:19', text: '혈육 있는 모든 생물을 너는 각기 암수 한 쌍씩 방주로 이끌어들여 너와 함께 생명을 보존하게 하되' },
    cow: { emoji: '🐄', name: '소', ref: '창세기 1:25', text: '하나님이 땅의 짐승을 그 종류대로, 가축을 그 종류대로, 땅에 기는 모든 것을 그 종류대로 만드시니 하나님이 보시기에 좋았더라' },
    camel: { emoji: '🐪', name: '낙타', ref: '마태복음 19:24', text: '다시 너희에게 말하노니 낙타가 바늘귀로 들어가는 것이 부자가 하나님의 나라에 들어가는 것보다 쉬우니라 하시니' },
    rabbit: { emoji: '🐇', name: '토끼', ref: '창세기 6:20', text: '새가 그 종류대로, 가축이 그 종류대로, 땅에 기는 모든 것이 그 종류대로 각기 둘씩 네게로 나아오리니 그 생명을 보존하게 하라' },
    dove: { emoji: '🕊️', name: '비둘기', ref: '창세기 8:11', text: '저녁때에 비둘기가 그에게로 돌아왔는데 그 입에 감람나무 새 잎사귀가 있는지라 이에 노아가 땅에 물이 줄어든 줄을 알았으며' },
    raven: { emoji: '🐦', name: '까마귀', ref: '창세기 8:7', text: '까마귀를 내놓으매 까마귀가 물이 땅에서 마르기까지 날아 왕래하였더라' },
    horse: { emoji: '🐎', name: '말', ref: '욥기 39:19', text: '말의 힘을 네가 주었느냐 그 목에 흩날리는 갈기를 네가 입혔느냐' },
    donkey: { emoji: '🐴', name: '나귀', ref: '스가랴 9:9', text: '시온의 딸아 크게 기뻐할지어다 예루살렘의 딸아 즐거이 부를지어다 보라 네 왕이 네게 임하시나니 그는 공의로우시며 구원을 베푸시며 겸손하여서 나귀를 타시나니 나귀의 작은 것 곧 나귀 새끼니라' },
    fish: { emoji: '🐟', name: '물고기', ref: '창세기 1:21', text: '하나님이 큰 바다 짐승들과 물에서 번성하여 움직이는 모든 생물을 그 종류대로, 날개 있는 모든 새를 그 종류대로 창조하시니 하나님이 보시기에 좋았더라' }
  };
  var CREATURE_KEYS = ['sheep', 'goat', 'cow', 'camel', 'horse', 'donkey', 'rabbit', 'dove', 'raven', 'fish'];
  var REWARD_ANIMALS = ['sheep', 'goat', 'cow', 'camel', 'rabbit', 'dove', 'raven', 'fish'];   // 달란트 기준(서버 claim_ark_dex와 같은 8가지)
  var DEX_MATS = [LOG, LEAF, STONE, LIME, BASALT, SAND, DIRT, CLAY, TAR, REED, FLOWER];
  var DEX = {};
  try { DEX = JSON.parse(localStorage.getItem('arkVillage.dex') || '{}') || {}; } catch (e) { DEX = {}; }
  function dexString() { return Object.keys(DEX).filter(function (k) { return DEX[k] && k !== 'done'; }).join(','); }
  function dexFromString(str) { (str || '').split(',').forEach(function (k) { if (/^(c[a-z]+|[mopgns]\d+)$/.test(k)) DEX[k] = 1; }); }
  function dexCount() { var n = 0; CREATURE_KEYS.forEach(function (k) { if (DEX['c' + k]) n++; }); DEX_MATS.forEach(function (m) { if (DEX['m' + m]) n++; }); return n; }
  // 넓힌 도감(달란트 보상과는 별개): o광석 · g보석 · p식물/열매 · n성경 인물 · s밤하늘
  var STAR_VERSES = [['🌌', '뭇별', '창세기 15:5', '그를 이끌고 밖으로 나가 이르시되 하늘을 우러러 뭇별을 셀 수 있나 보라 또 그에게 이르시되 네 자손이 이와 같으리라'],
    ['✨', '별들의 이름', '시편 147:4', '그가 별들의 수효를 세시고 그것들을 다 이름대로 부르시는도다'],
    ['⭐', '북두성과 삼성과 묘성', '욥기 9:9', '북두성과 삼성과 묘성과 남방의 밀실을 만드셨으며'],
    ['🔭', '만상', '이사야 40:26', '너희는 눈을 높이 들어 누가 이 모든 것을 창조하였나 보라 주께서는 수효대로 만상을 이끌어 내시고 그들의 모든 이름을 부르시나니 그의 권세가 크고 그의 능력이 강하므로 하나도 빠짐이 없느니라']];
  var DEX_PEOPLE = ['노아', '셈', '함', '야벳', '노아의 아내'];
  function dexOres() { return [ORE_COAL, ORE_CU, ORE_FE, ORE_AG, ORE_AU, ORE_ONYX, ORE_SAPH, ORE_DIA]; }
  function dexGems() { var a = []; GEMS.forEach(function (g, i) { if (g) a.push(i); }); return a; }
  function dexPlants() { var a = [LILY, THORN, THISTLE]; Object.keys(FARM_SEEDS).forEach(function (k) { var h = FARM_SEEDS[k].harvest; if (a.indexOf(h) < 0) a.push(h); }); return a; }
  function dexMore(key, label) { if (DEX[key]) return; DEX[key] = 1; saveDex(); toast('📖 도감에 「' + label + '」을(를) 적었어요'); }
  function dexMined(old) {
    var base = old; for (var k in DEEPV) if (DEEPV[k] === old) base = +k;
    if (dexOres().indexOf(base) >= 0) dexMore('o' + base, B[base][0]);
    for (var gi = 0; gi < 12; gi++) if (GEMS[gi] && base === gemOre(gi)) dexMore('g' + gi, GEMS[gi][0]);
    if (old === LILY || old === THORN || old === THISTLE) dexMore('p' + old, B[old][0]);
  }
  function showStarVerse(n) {
    if (FESTIVE && Math.abs(P.x - (NAT_X + 5)) < 60 && Math.abs(P.z - (NAT_Z + 4)) < 60) { showVerseCard('🌟', '베들레헴의 별', '박사들이 왕의 말을 듣고 갈새 동방에서 보던 그 별이 문득 앞서 인도하여 가다가 아기 있는 곳 위에 머물러 서 있는지라', '마태복음 2:9'); return; }
    var i = n % STAR_VERSES.length, v = STAR_VERSES[i], first = !DEX['s' + i];
    showVerseCard(v[0], v[1], v[3], v[2], first ? '📖 도감 「밤하늘」에 새로 적었어요' : '');
    if (first) { DEX['s' + i] = 1; saveDex(); }
  }
  function saveDex() {
    if (dexCount() === CREATURE_KEYS.length + DEX_MATS.length && !DEX.done) { DEX.done = 1; unlock('dex'); toast('📖 도감을 다 채웠어요! 하나님이 지으신 모든 것을 만났어요'); }
    try { localStorage.setItem('arkVillage.dex', JSON.stringify(DEX)); } catch (e) {}
    if (me && myPlot >= 0) markDirty();
    if (ui === 'inv') renderInv();
    tryClaimDex();
  }
  // 도감 달란트: 동물 8가지 다 +3, 재료 11가지 다 +2 (계정마다 한 번, 서버가 내 땅 기록의 도감을 확인하고 줌)
  var dexClaimed = {};
  try { dexClaimed = JSON.parse(localStorage.getItem('arkVillage.dexClaim') || '{}') || {}; } catch (e) { dexClaimed = {}; }
  function partDone(part) { return part === 'animals' ? REWARD_ANIMALS.every(function (k) { return DEX['c' + k]; }) : DEX_MATS.every(function (m) { return DEX['m' + m]; }); }
  function tryClaimDex() {
    ['animals', 'mats'].forEach(function (part) {
      if (!partDone(part) || dexClaimed[part] || dexClaimed['busy_' + part]) return;
      if (!client || !me || myPlot < 0) { if (!dexClaimed['hint_' + part]) { dexClaimed['hint_' + part] = 1; toast('📖 도감 ' + (part === 'animals' ? '동물' : '재료') + '을 다 채웠어요! 로그인하면 달란트를 받아요'); } return; }
      dexClaimed['busy_' + part] = 1;
      savePlotNow().then(function () { return client.rpc('claim_ark_dex', { p_part: part }); }).then(function (r) {
        dexClaimed['busy_' + part] = 0;
        if (!r || r.error) return;
        if (r.data > 0) { toast('💰 도감 ' + (part === 'animals' ? '동물 8가지' : '재료 11가지') + '를 다 채워 ' + r.data + '달란트를 받았어요!'); sfx('craft'); }
        if (r.data >= 0) { dexClaimed[part] = 1; try { localStorage.setItem('arkVillage.dexClaim', JSON.stringify({ animals: dexClaimed.animals, mats: dexClaimed.mats })); } catch (e) {} }
      }).catch(function () { dexClaimed['busy_' + part] = 0; });
    });
  }
  var cardT = null;
  function showCard(kindC) {
    var c = CREATURE[kindC]; if (!c) return;
    $('cardEmoji').textContent = c.emoji; $('cardName').textContent = c.name;
    $('cardText').textContent = c.text; $('cardRef').textContent = c.ref;
    var first = !DEX['c' + kindC];
    $('cardNew').textContent = first ? '📖 도감에 새로 적었어요' : '';
    $('card').classList.add('show'); sfx('pop'); animalCall(kindC);
    clearTimeout(cardT); cardT = setTimeout(function () { $('card').classList.remove('show'); }, 9000);
    if (first) { DEX['c' + kindC] = 1; saveDex(); }
    stats.tapped++; tutorialEvent('animal'); questCheck();
  }
  // 화면의 한 점에서 나가는 광선에 맞는 동물(블록보다 가까울 때만)
  var CR_R = { peer: 1.6, npc: 1.8, shadow: 1.6, sheep: 1.3, goat: 1.2, cow: 1.7, camel: 2.3, rabbit: 0.8, dove: 1.1, raven: 1.1, fish: 0.8, horse: 2.1, donkey: 1.7 };
  function pickCreature(dir, blockT) {
    var o = camera.position, best = null, bt = blockT === undefined ? 1e9 : blockT;
    function test(kindC, cx, cy, cz, maxT, obj) {
      var r = CR_R[kindC], ox = cx - o.x, oy = cy - o.y, oz = cz - o.z, tca = ox * dir.x + oy * dir.y + oz * dir.z;
      if (tca < 0) return;
      var d2 = ox * ox + oy * oy + oz * oz - tca * tca; if (d2 > r * r) return;
      var t = tca - Math.sqrt(r * r - d2);
      if (t < bt && t < maxT && (!best || t < best.t)) best = { kind: kindC, t: t, a: obj };
    }
    var reach = REACH + camDist + 3;
    animals.forEach(function (a) { if (a.mesh.visible && a !== riding) test(a.kind, a.x, a.y + CR_R[a.kind] * 0.9, a.z, reach, a); });
    birds.forEach(function (b) { test(b.kind, b.mesh.position.x, b.mesh.position.y, b.mesh.position.z, 60); });
    fishes.forEach(function (f) { if (f.mesh.visible) test('fish', f.x, f.y, f.z, reach); });
    NPCS.forEach(function (n) { var b0 = best; test('npc', n.x, n.y + 1.7, n.z, reach); if (best !== b0 && best && best.kind === 'npc') best.npc = n; });
    for (var pu in NET.peers) { var pp = NET.peers[pu]; if (!pp || !pp.av) continue; var b2 = best; test('peer', pp.x, pp.y + 1.7, pp.z, reach); if (best !== b2 && best && best.kind === 'peer') best.peer = pp; }
    SHADOWS.forEach(function (s) { if (s.dead) return; var b0 = best; test('shadow', s.x, s.y + 1.7 * s.sp.h, s.z, REACH + camDist + 1); if (best !== b0 && best && best.kind === 'shadow') best.shadow = s; });
    return best;
  }
  function screenDir(sx, sy) {
    camera.updateMatrixWorld();
    if (sx === undefined || S.aim === 'cross') { camera.getWorldDirection(tmpV); return tmpV.clone(); }
    return new THREE.Vector3(sx / window.innerWidth * 2 - 1, -(sy / window.innerHeight) * 2 + 1, 0.5).unproject(camera).sub(camera.position).normalize();
  }
  var slabMode = 0, slabGhost, mobileHudAt = 0;
  var SLAB_NAMES = ['자동', '아래쪽', '위쪽'];
  // 겨눈 칸이 같은 재료 반 블록이고, 누른 면이 그 반 블록의 비어 있는 반쪽 쪽이면 합칠 수 있다
  function slabMergeTarget(id, h) {
    if (!SLAB_TOP[id] || !h) return false;
    var cur = get(h.x, h.y, h.z), side = h.py === h.y, half = h.atY - h.y >= 0.5;
    if (cur === id) return h.py > h.y || (side && half);                 // 아래 반 블록: 윗면이나 옆면 윗반쪽
    if (cur === SLAB_TOP[id]) return h.py < h.y || (side && !half);      // 위 반 블록: 아랫면이나 옆면 아랫반쪽
    return false;
  }
  function slabPlacement(id, h) {
    if (isTouch && slabMode) return slabMode === 2 ? SLAB_TOP[id] : id;
    return h.py < h.y || (h.py === h.y && h.atY - h.py >= 0.5) ? SLAB_TOP[id] : id;
  }
  function blockActionLabel(h, held) {
    var id = get(h.x, h.y, h.z), shape = SHAPE[id];
    var frontierAction=frontierActionLabel(id,h); if(frontierAction) return frontierAction;
    if (shape && (shape.type === 'door' || shape.type === 'gate' || shape.type === 'trapdoor')) return shape.open ? '문 닫기' : '문 열기';
    if (shape && shape.type === 'mrail' && (held === CART || parkedAt(h.x, h.y, h.z))) return '수레 타기';
    if (shape && shape.type === 'frame') return myPlot >= 0 && plotAt(h.x, h.z) === myPlot ? '액자' : '';
    if (id>=FIND_MARK && id<=FIND_SEED) return id===FIND_MARK?'살펴보기':'전시 보기';
    if (id===FERRY_POST) return '나룻배 타기';
    if (id===FEAST_TABLE) return '음식 놓기';
    if (id === WELL) return held === BUCKET || held === WATER_JAR ? '물 긷기' : '우물 쓰기';
    if (id === ALTAR) return '기도하기';
    if (id === WORD_SHELF) return '말씀 읽기';
    if (id === BED) return '눕기';
    if (shape && shape.type === 'chair') return '앉기';
    if (id === CHEST) return '궤 열기';
    if (id === CRAFT || id === FURNACE || id === FURNACE_ON ||
        (STATION_BITS[id] && !FARM_SEEDS[held])) return '만들기';
    if (id === LEVER || id === LEVER + 1 || id === LAMPSTAND || id === LAMPSTAND + 1 ||
        id === SOCKET || id === PEARL) return '사용';
    if (shape && shape.type === 'sign' && myPlot >= 0 && plotAt(h.x, h.z) === myPlot) return '표지판 고치기';
    return '';
  }
  function mobileTarget() {
    var held = HOTBAR[sel], h = pickCenter(), label = '';
    if (held === FISH_ROD || held === FISH_NET) return { label: '낚시' };
    if (have(held)) {
      if (held === WORD_SCROLL) return { label: '말씀 읽기' };
      if (held === HAND_MAP) return { label: '지도 열기' };
      if (held === COMPASS) return { label: '방향 보기' };
      if (held === SHOFAR) return { label: '나팔 불기' };
      if (held === SLING) return { label: '물매 연습' };
      if (isBowId(held)) return { label: '꾹 눌러 활 당기기' };
      if (isSlingId(held)) return { label: '물매 던지기' };
      if (held === BOAT) return { label: '배 띄우기' };
    }
    var c = pickCreature(screenDir(), blockCover(h));
    if (c && !(riding && c.a && c.a.sp.seat)) {
      return { label: c.peer ? '두 번: 친구' : c.npc ? '말 걸기' : (c.shadow ? '막기' : (c.a && c.a.sp.seat ? '타기' : '동물 누르기')) };
    }
    if (h) label = blockActionLabel(h, held);
    if (label) return { label: label };
    if (WEARINFO[held]) return { label: '입기' };
    if (!h || !have(held)) return { label: '' };
    if (FOODS[held]) return { label: '먹기' };
    if (held === WATER_BUCKET || held === FULL_JAR) return { label: '물 붓기' };
    if (held === HOE) return { label: '밭 갈기' };
    if (held === SEED || FARM_SEEDS[held]) return { label: '심기' };
    if (held === STRIKER) return { label: '불붙이기' };
    if (isItem(held)) return { label: '' };
    return { label: '놓기', hit: h };
  }
  function updateMobileBuild(now) {
    var action = $('touchAction'), toggle = $('slabMode');
    if (!isTouch || ui !== 'play' || furnitureRest) {
      if (!action.hidden) action.hidden = true;
      if (!toggle.hidden) toggle.hidden = true;
      slabGhost.visible = false;
      return;
    }
    var held = HOTBAR[sel], slab = SLAB_TOP[held] && have(held);
    if (now < mobileHudAt) return;
    mobileHudAt = now + (slab ? 50 : 100);
    var target = mobileTarget(), h = target.hit;
    action.hidden = !target.label;
    if (action.textContent !== target.label) action.textContent = target.label;
    toggle.hidden = !slab;
    if (!slab || !h) { slabGhost.visible = false; return; }
    var merge = slabMergeTarget(held, h), id = slabPlacement(held, h), valid = merge ? !canPlace(h.x, h.y, h.z, held) : !canPlace(h.px, h.py, h.pz, held);
    if (merge) slabGhost.position.set(h.x + .5, h.y + (get(h.x, h.y, h.z) === held ? .75 : .25), h.z + .5);
    else slabGhost.position.set(h.px + .5, h.py + (id === held ? .25 : .75), h.pz + .5);
    slabGhost.material.color.setHex(valid ? 0x91edb3 : 0xff806d);
    slabGhost.visible = false;   // 11/20 놓일 자리 미리보기 블록은 보이지 않게(전도사님 「없어도 되지 않을까」)
  }
  // 톡/오른쪽 클릭: 동물이 먼저, 아니면 블록 놓기(문이면 열고 닫기)
  // 다른 사람 캐릭터: 한 번 누르면 이름, 두 번 누르면 친구·파티 메뉴
  var peerTap = { u: null, t: 0 }, hintT0 = 0;
  function tapPeer(p) {
    var u = p.u, nm = (NET.names && NET.names[u]) || '나그네', now = performance.now();
    if (peerTap.u === u && now - peerTap.t < 600) { peerTap.u = null; openPeerMenu(u, nm); return; }
    peerTap = { u: u, t: now }; toast('👤 ' + nm + ' — 한 번 더 누르면 친구·파티 메뉴');
  }
  function openPeerMenu(u, nm) {
    var old = $('peerMenu'); if (old) old.remove();
    if (lockOn) { try { document.exitPointerLock(); } catch (e) {} }
    var box = document.createElement('div'); box.id = 'peerMenu';
    box.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:60;background:rgba(16,16,24,.94);border:2px solid #000;box-shadow:inset 0 0 0 2px #5a4a8a;padding:12px 14px;display:flex;flex-direction:column;gap:8px;min-width:210px;color:#fff;font-size:15px;text-align:center';
    var h = document.createElement('b'); h.textContent = '👤 ' + nm; box.appendChild(h);
    function add(label, fn, off) { var b = document.createElement('button'); b.className = 'mc'; b.textContent = label; b.disabled = !!off; b.addEventListener('click', function (e) { e.stopPropagation(); box.remove(); if (fn) fn(); }); box.appendChild(b); }
    var isFriend = !!(FRIENDS.accepted && FRIENDS.accepted.has(u));
    if (!me || !NET.ok) add('로그인하면 친구·파티를 할 수 있어요', null, true);
    else {
      if (isFriend) add('✓ 이미 친구예요', null, true);
      else if (FRIENDS.hidden && FRIENDS.hidden.has(u)) add('친구 신청을 보낼 수 없어요', null, true);
      else add('🤝 친구 신청', function () { friendRequest(nm); });
      if (partyMate(u)) add('✓ 같은 파티예요', null, true);
      else add('🧭 파티 초대', function () { partyCall('party_invite', { p_to: u }, '🤝 초대를 보냈어요 (10분 안에 받아야 해요)'); });
      if (isFriend) add('🎁 선물 보내기', function () { openVillageWork('gifts'); fetchGifts(true); });
      if (!FRIENDS.ready) friendsFetch();
    }
    add('닫기');
    document.body.appendChild(box); sfx('pop');
  }
  var waveUntil = 0;
  function waveHand() { waveUntil = performance.now() + 2000; sfx('pop'); if (S.view === 0) toast('👋 손을 흔들었어요 — 다른 사람에게 보여요'); }
  // ── 마을 사람 할 일(모두 선택): 상인 물물 교환, 농부 씨앗, 어부 낚싯대, 오병이어(요 6장) ──
  var TRADES = [[[LOG, 16], [ING_AG, 1]], [[STONE, 32], [ING_AG, 1]], [[WOOL, 4], [THREAD, 6]], [[ING_AG, 1], [POMEGRANATE, 3]], [[ING_AG, 1], [610, 1]], [[ING_AG, 2], [OLIVE_OIL, 2]]];
  // ── 노아의 부탁(창 6~9장): 다섯 가지를 마치면 창 9:1 복과 함께 남쪽 개척 땅을 맡을 수 있다(서버: 2026-11-19-ark-noah-quest.sql)
  // 노아는 지어낸 말을 하지 않는다 — 부탁은 게임 안내문으로, 말은 성경 구절로만
  var NOAH = { step: 0, rainbow: 0, done: 0 };
  try { var noahLs = JSON.parse(localStorage.getItem('arkVillage.noah') || 'null'); if (noahLs && typeof noahLs.step === 'number') NOAH = noahLs; } catch (e) {}
  function noahSave() { try { localStorage.setItem('arkVillage.noah', JSON.stringify(NOAH)); } catch (e) {} stateDirty(); }
  function noahPairs() { return CREATURE_KEYS.filter(function (k) { return DEX['c' + k]; }).length; }
  var NOAH_STEPS = [
    { e: '🪵', t: '고페르 나무 10개를 가져다 드리기', v: '너는 고페르 나무로 너를 위하여 방주를 만들되 그 안에 칸들을 막고 역청을 그 안팎에 칠하라', r: '창세기 6:14', prog: function () { return Math.min(10, have(GOPHER)) + '/10'; }, ok: function () { return have(GOPHER) >= 10; }, give: function () { take(GOPHER, 10); }, go: ['숲으로', function () { travel('forest'); }] },
    { e: '⚫', t: '역청 3개를 가져다 드리기 — 남쪽 호수 동쪽 역청 구덩이에서 삽으로 캐요', v: '너는 고페르 나무로 너를 위하여 방주를 만들되 그 안에 칸들을 막고 역청을 그 안팎에 칠하라', r: '창세기 6:14', prog: function () { return Math.min(3, have(TAR)) + '/3'; }, ok: function () { return have(TAR) >= 3; }, give: function () { take(TAR, 3); }, go: ['호수로', function () { travel('lake'); }] },
    { e: '🌾', t: '먹을 양식 가져다 드리기 — 밀 5개 또는 빵 2개', v: '너는 먹을 모든 양식을 네게로 가져다가 저축하라 이것이 너와 그들의 먹을 것이 되리라', r: '창세기 6:21', prog: function () { return '밀 ' + Math.min(5, have(WHEAT)) + '/5 · 빵 ' + Math.min(2, have(BREAD)) + '/2'; }, ok: function () { return have(WHEAT) >= 5 || have(BREAD) >= 2; }, give: function () { if (have(WHEAT) >= 5) take(WHEAT, 5); else take(BREAD, 2); } },
    { e: '🐑', t: '여러 동물을 눌러 말씀 카드 보기 — 다섯 종류', v: '혈육 있는 모든 생물을 너는 각기 암수 한 쌍씩 방주로 이끌어들여 너와 함께 생명을 보존하게 하되', r: '창세기 6:19', prog: function () { return Math.min(5, noahPairs()) + '/5'; }, ok: function () { return noahPairs() >= 5; }, give: null },
    { e: '🌈', t: '낮에 비가 그친 뒤 하늘의 무지개 보기 — 곧 비가 와요', v: '내가 내 무지개를 구름 속에 두었나니 이것이 나와 세상 사이의 언약의 증거니라', r: '창세기 9:13', prog: function () { return NOAH.rainbow ? '봤어요' : '아직'; }, ok: function () { return !!NOAH.rainbow; }, give: null }
  ];
  function noahWantsRain() { return started && !NOAH.done && NOAH.step === 4 && !NOAH.rainbow; }
  function noahSawRainbow() { if (noahWantsRain()) { NOAH.rainbow = 1; noahSave(); toast('🌈 무지개를 봤어요 — 방주 앞 노아에게 가요'); } }
  function noahFinish() {
    NOAH.done = 1; noahSave(); unlock('noah');
    if (client && me) client.rpc('finish_ark_noah').then(function () { fetchFrontier(true); }, function () {});
    showVerseCard('🌈', '하나님이 복을 주셨어요', '하나님이 노아와 그 아들들에게 복을 주시며 그들에게 이르시되 생육하고 번성하여 땅에 충만하라', '창세기 9:1', '노아의 부탁을 다 마쳤어요 — 이제 남쪽 개척 땅을 맡을 수 있어요 (메뉴 → 마을 수첩 → 개척 땅)');
  }
  function openNoah() {
    var old = $('noahBox'); if (old) old.remove();
    $('card').classList.remove('show');   // 노아를 누르면 뜨는 구절 카드 대신 부탁 상자(구절이 들어 있음)
    if (lockOn) { try { document.exitPointerLock(); } catch (e) {} }
    var box = document.createElement('div'); box.id = 'noahBox';
    box.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:60;background:rgba(16,16,24,.95);border:2px solid #000;box-shadow:inset 0 0 0 2px #c8a860;padding:12px 14px;color:#fff;font-size:14px;width:min(380px,92vw);max-height:86vh;overflow:auto';
    function add(tag, text, css) { var el = document.createElement(tag); el.textContent = text; el.style.cssText = css || ''; box.appendChild(el); return el; }
    function btn(label, fn, dis) { var b = document.createElement('button'); b.className = 'mc'; b.textContent = label; b.disabled = !!dis; b.style.cssText = 'display:block;width:100%;margin-top:6px;white-space:normal;height:auto;min-height:38px'; b.addEventListener('click', function (e) { e.stopPropagation(); fn(); }); box.appendChild(b); return b; }
    if (NOAH.done) {
      add('b', '🕊 노아의 부탁 — 다 마쳤어요', 'display:block;font-size:16px;color:#ffe27a;margin-bottom:6px');
      add('p', '「하나님이 노아와 그 아들들에게 복을 주시며 그들에게 이르시되 생육하고 번성하여 땅에 충만하라」 (창세기 9:1)', 'margin:0 0 8px;font-size:13px;opacity:.9');
      add('div', '남쪽 개척 땅을 맡아 넓혀 가요. 친구와 함께 짓고 창고도 함께 쓸 수 있어요.', 'font-size:13px');
      btn('🗺 개척 땅 보기(마을 수첩)', function () { box.remove(); openVillageWork('frontier'); });
    } else {
      var s = NOAH_STEPS[NOAH.step], ready = s.ok() || isAdm();
      add('b', '🕊 노아의 부탁 ' + (NOAH.step + 1) + '/5', 'display:block;font-size:16px;color:#ffe27a;margin-bottom:4px');
      add('p', '「' + s.v + '」 (' + s.r + ')', 'margin:0 0 8px;font-size:12px;opacity:.85');
      add('div', s.e + ' ' + s.t, 'font-size:14px;margin-bottom:4px');
      add('div', '지금: ' + s.prog(), 'font-size:13px;color:#bfe0a0');
      if (NOAH.step === 4 && !NOAH.rainbow) rainTimer = Math.min(rainTimer, 20);   // 무지개 부탁을 들으면 곧 비가 온다
      btn(s.give ? '가져다 드리기' : '마쳤어요', function () {
        if (!(s.ok() || isAdm())) return;
        if (s.give && !isAdm()) s.give();
        bagChanged(); sfx('craft');
        NOAH.step++; noahSave(); box.remove();
        if (NOAH.step >= NOAH_STEPS.length) noahFinish();
        else { toast('🕊 다음 부탁: ' + NOAH_STEPS[NOAH.step].t); openNoah(); }
      }, !ready);
      if (s.go) btn('🧭 ' + s.go[0], function () { box.remove(); s.go[1](); });
      add('div', '다 마치면 남쪽 개척 땅을 맡을 수 있어요 (창 9:1)', 'font-size:12px;opacity:.7;margin-top:8px');
    }
    btn('닫기', function () { box.remove(); });
    document.body.appendChild(box); sfx('pop');
  }
  function villageNpcTap(npc) {
    var nm = npc.d.name;
    if (nm === '노아') { openNoah(); return true; }
    if (nm === '상인') { openTrade(); return true; }
    if (nm === '농부') {
      var hasSeed = Object.keys(FARM_SEEDS).some(function (k) { return have(+k) > 0; }) || have(SEED) > 0, dayN = Math.floor(dayT / DAY_LEN);
      if (!hasSeed && villageBook.farmerDay !== dayN) {
        var ks = Object.keys(FARM_SEEDS); for (var i = 0; i < 3; i++) give(+ks[Math.floor(Math.random() * ks.length)], 1);
        villageBook.farmerDay = dayN; saveVillageBook(); bagChanged(); $('cardNew').textContent = '🌱 농부가 씨앗 3개를 나눠 줬어요. 괭이로 간 밭에 심어 보세요';
      }
      return true;
    }
    if (nm === '어부') {
      if (!have(FISH_ROD) && !villageBook.gotRod) { give(FISH_ROD, 1); villageBook.gotRod = 1; saveVillageBook(); bagChanged(); $('cardNew').textContent = '🎣 어부가 낚싯대를 줬어요. 낚싯대를 들고 물을 누르면 낚시해요'; }
      return true;
    }
    if (nm === '한 아이') { loavesQuest(); return true; }
    return false;
  }
  function openTrade() {
    var old = $('tradeBox'); if (old) old.remove();
    if (lockOn) { try { document.exitPointerLock(); } catch (e) {} }
    var box = document.createElement('div'); box.id = 'tradeBox';
    box.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:60;background:rgba(16,16,24,.95);border:2px solid #000;box-shadow:inset 0 0 0 2px #b88a3a;padding:12px 14px;color:#fff;font-size:14px;width:min(340px,92vw);max-height:86vh;overflow:auto';
    var h = document.createElement('b'); h.textContent = '⚖ 상인과 물물 교환'; h.style.cssText = 'display:block;font-size:16px;color:#ffe27a;margin-bottom:4px';
    var v = document.createElement('p'); v.textContent = '「속이는 저울은 여호와께서 미워하시나 공평한 추는 그가 기뻐하시느니라」 (잠 11:1)'; v.style.cssText = 'margin:0 0 8px;font-size:12px;opacity:.85';
    box.appendChild(h); box.appendChild(v);
    TRADES.forEach(function (t) {
      var give0 = t[0], get0 = t[1], ok = isAdm() || have(give0[0]) >= give0[1];
      var b = document.createElement('button'); b.className = 'mc'; b.style.cssText = 'display:block;width:100%;margin:4px 0;text-align:left;white-space:normal;height:auto;min-height:38px;padding:4px 8px';
      b.textContent = nameOf(give0[0]) + ' ' + give0[1] + '개 → ' + nameOf(get0[0]) + ' ' + get0[1] + '개' + (ok ? '' : '  (모자라요: ' + have(give0[0]) + '/' + give0[1] + ')');
      b.disabled = !ok;
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        if (!isAdm() && have(give0[0]) < give0[1]) return;
        if (!isAdm() && room(get0[0]) < get0[1]) { bagFull(); return; }
        take(give0[0], give0[1]); give(get0[0], get0[1]); bagChanged(); sfx('craft');
        toast('⚖ ' + nameOf(give0[0]) + ' ' + give0[1] + '개를 ' + nameOf(get0[0]) + ' ' + get0[1] + '개로 바꿨어요'); box.remove(); openTrade();
      });
      box.appendChild(b);
    });
    var c = document.createElement('button'); c.className = 'mc'; c.textContent = '닫기'; c.style.cssText = 'display:block;width:100%;margin-top:6px';
    c.addEventListener('click', function (e) { e.stopPropagation(); box.remove(); }); box.appendChild(c);
    document.body.appendChild(box); sfx('pop');
  }
  function fishCount() { var n = have(RAW_FISH) + have(COOKED_FISH); for (var k in VILLAGE_FISH) n += have(VILLAGE_FISH[k]); return n; }
  function takeFish(n) {
    [COOKED_FISH, RAW_FISH].concat(Object.keys(VILLAGE_FISH).map(function (k) { return VILLAGE_FISH[k]; })).forEach(function (id) { var t = Math.min(n, have(id)); if (t > 0) { take(id, t); n -= t; } });
  }
  function loavesQuest() {
    var breads = have(BREAD) + have(FLATBREAD);
    if (ACH.loaves && !isAdm()) { $('cardNew').textContent = '🧺 남은 조각이 열두 바구니에 찼어요 (요 6:13)'; return; }
    if (breads < 5 || fishCount() < 2) { $('cardNew').textContent = '빵 다섯 개와 물고기 두 마리를 가져와 함께 나눠 보세요 (지금 빵 ' + breads + '/5 · 물고기 ' + fishCount() + '/2)'; return; }
    var nb = 5; [BREAD, FLATBREAD].forEach(function (id) { var t = Math.min(nb, have(id)); if (t > 0) { take(id, t); nb -= t; } });
    takeFish(2); give(FLATBREAD, 12); bagChanged(); sfx('craft');
    showVerseCard('🧺', '열두 바구니', '이에 거두니 보리떡 다섯 개로 먹고 남은 조각이 열두 바구니에 찼더라', '요한복음 6:13', '예수께서 떡을 가져 축사하신 후에 앉아 있는 자들에게 나눠 주시고 물고기도 그렇게 그들의 원대로 주시니라 (요 6:11) — 빵 12개를 받았어요');
    unlock('loaves');
  }
  // 풀·꽃·갈대 같은 식물은 사람·동물을 가리지 않는다(누르는 광선이 갈대에 먼저 걸려 사람을 못 누르던 것)
  function blockCover(h) { return h && kind(get(h.x, h.y, h.z)) !== 'plant' ? h.t : undefined; }
  function tapAt(sx, sy) {
    if (furnitureRest) return;
    var dir = screenDir(sx, sy), held=HOTBAR[sel];
    // 사람(마을 사람·다른 나그네)을 겨눴으면 손에 든 물건보다 먼저 — 낚싯대를 들고 물가 사람을 눌러도 말을 걸 수 있게
    var hPre = pickDir(dir), cPre = pickCreature(dir, blockCover(hPre));
    var personFirst = cPre && (cPre.npc || cPre.peer);
    if(!personFirst && (held===FISH_ROD||held===FISH_NET)) return useFishing(held,dir);
    if(!personFirst) {
      if(held===WORD_SCROLL && have(held)) return showWordCard(false);
      if(held===HAND_MAP && have(held)) {openPanel('map');drawMap($('bigmapc'),true);return;}
      if(held===COMPASS && have(held)) return toast('지금 보는 방향: '+headingName());
      if(held===SHOFAR && have(held)) return callShofar();
      if(isSlingId(held) && have(held)) { var sh0=pickDir(dir); if(sh0 && get(sh0.x,sh0.y,sh0.z)===SLING_TARGET) return slingPractice(sh0); return slingThrow(dir); }
      if(isBowId(held) && have(held)) return shootArrow(dir);
      if(held===BOAT && (have(held) || isAdm())) return useBoat(dir);
    }
    var h = pickDir(dir), c = pickCreature(dir, blockCover(h));
    if (c && riding && c.a && c.a.sp.seat) c = null;
    if (c && c.shadow) return hitShadow(c.shadow);
    if (c && c.peer) return tapPeer(c.peer);
    if (c && c.npc) {
      var npc=c.npc; showNpc(npc);
      if (villageNpcTap(npc)) return;
      if ((npc.d.name==='목자' || npc.d.name==='빵 굽는 사람') && !held)
        $('cardNew').textContent='마을 수첩 → 마을 사람에서 부탁을 볼 수 있어요';
      if (npc.d.name==='목자' && held===STAFF && have(STAFF)) return shepherdVisit(npc);
      if (npc.d.name==='목자' && have(RAW_LAMB)===0 && room(RAW_LAMB)>0) {
        give(RAW_LAMB,1);bagChanged();toast('목자가 요리할 양고기를 나눠 줬어요');
      }
      return;
    }
    if (c && c.a && held===STAFF && have(STAFF) && c.a===lostSheep && !c.a.found) {
      c.a.found=true; animalCall('sheep'); toast('잃은 양을 찾았어요. 지팡이를 들고 목자에게 함께 가요'); return;
    }
    if (c && c.a && BREEDS[c.a.kind] && HOTBAR[sel] === WHEAT && have(WHEAT) > 0) return feedAnimal(c.a);
    if (c && c.a && harvestAnimal(c.a)) return;
    if (c) return c.a && c.a.sp.seat ? tapRideable(c.a) : showCard(c.kind);
    if (h) act('place', h);
    else if (WEARINFO[HOTBAR[sel]]) wearItem(HOTBAR[sel]);
    else if (FOODS[HOTBAR[sel]]) eatItem(HOTBAR[sel]);
  }
  // 칼을 들고 양을 누르면 양털, 소·염소·낙타를 누르면 가죽(한 마리에 3분에 한 번)
  function harvestAnimal(a) {
    var held = HOTBAR[sel];
    if (!(isTool(held) && have(held) > 0 && TOOL_TYPES[typeOf(held)] === 'knife')) return false;
    var what = a.kind === 'sheep' ? WOOL : (a.kind === 'cow' || a.kind === 'goat' || a.kind === 'camel' ? LEATHER : 0);
    if (!what) return false;
    var now = Date.now();
    if (a.cutAt && now - a.cutAt < 180000) { deny(a.kind === 'sheep' ? '털을 깎은 지 얼마 안 됐어요. 조금 뒤에 다시 와요' : '조금 뒤에 다시 와요'); return true; }
    a.cutAt = now;
    var n = what === WOOL ? 2 : 1;
    dropItem(a.x, a.y + 1.6, a.z, what, n); wearTool(held); bagChanged(); animalCall(a.kind); sfx('dig', 1500); swingT = 0.25;
    toast(what === WOOL ? '양털 ' + n + '개를 깎았어요 — 제작대에서 옷을 지어요' : '가죽을 얻었어요 — 제작대에서 가죽옷을 지어요 (창 3:21)');
    return true;
  }

  // ───────── 말·나귀 타기: 안장을 손에 들고 누르면 얹고, 안장 얹은 것을 누르면 탄다(창 22:3) ─────────
  var riding = null, curHT = HT, saddleGeo = {}, HORSES = [], horseSaveT = 0;
  try { HORSES = (JSON.parse(localStorage.getItem('arkVillage.horses') || '[]') || []).filter(function (o) { return o && BEASTS[o.k]; }).slice(0, 6); } catch (e) { HORSES = []; }
  var pendingHorses = HORSES.slice();
  function readCargo(items) {
    return [0,1].map(function (i) {
      var slot=Array.isArray(items)&&items[i], id=slot&&Number(slot[0]), n=slot&&Math.floor(slot[1]);
      return id&&n>0&&INV.indexOf(id)>=0&&!isTool(id)?[id,Math.min(STACK,n)]:null;
    });
  }
  function horseSaveRow(x) {
    var row={k:x.kind,x:Math.round(x.x*10)/10,z:Math.round(x.z*10)/10,h:Math.round(x.h*100)/100};
    if(x.kind==='donkey')row.cargo=readCargo(x.cargo);
    return row;
  }
  function saveHorses() {
    var a = animals.filter(function (x) { return x.saddled; }).slice(-6).map(horseSaveRow);
    pendingHorses.forEach(function (o) { if (a.length < 6) a.push(o); });
    try { localStorage.setItem('arkVillage.horses', JSON.stringify(a)); } catch (e) {}
  }
  function putSaddle(a) {
    var sp = a.sp, top = sp.seat - 0.1;
    if (!saddleGeo[a.kind]) saddleGeo[a.kind] = mergedBoxes([[1.0, 0.22, 1.05, 0x7a3e1c, 0, top, -0.1], [sp.parts[0][0] + 0.06, 0.95, 0.16, 0x4a2a12, 0, top - 0.5, -0.1],
      [0.5, 0.3, 0.16, 0x7a3e1c, 0, top + 0.2, -0.6], [0.6, 0.22, 0.16, 0x7a3e1c, 0, top + 0.12, 0.42], [0.12, 0.12, 0.3, 0xc8c8c8, -(sp.parts[0][0] / 2 + 0.06), top - 1.0, -0.1], [0.12, 0.12, 0.3, 0xc8c8c8, sp.parts[0][0] / 2 + 0.06, top - 1.0, -0.1]]);
    var m = new THREE.Mesh(saddleGeo[a.kind], avatarMat); a.mesh.add(m); a.saddle = m; a.saddled = true;
  }
  function jo(n, a, b) { var c = n.charCodeAt(n.length - 1) - 0xAC00; return n + (c >= 0 && c % 28 ? a : b); }   // 받침에 맞는 조사
  function tapRideable(a) {
    if (riding) return;
    var nm = a.sp.name;
    if (!a.saddled) {
      if (HOTBAR[sel] === SADDLE && have(SADDLE) > 0) {
        take(SADDLE, 1); putSaddle(a); bagChanged(); saveHorses(); sfx('craft'); animalCall(a.kind);
        if (!DEX['c' + a.kind]) { DEX['c' + a.kind] = 1; saveDex(); }
        toast('안장을 얹었어요! ' + jo(nm, '을', '를') + ' 한 번 더 누르면 타요 (창 22:3)');
        return;
      }
      showCard(a.kind);
      setTimeout(function () { if (!a.saddled && !riding) toast('안장(만들기 ⛏)을 손에 들고 ' + jo(nm, '을', '를') + ' 누르면 탈 수 있어요'); }, 1200);
      return;
    }
    mount(a);
  }
  function mount(a) {
    if (P.fly) toggleFly();
    riding = a; a.mode = 'ride';
    curHT = a.sp.seat + 2.1;
    P.x = a.x; P.z = a.z; P.y = a.y; P.vx = P.vz = P.vy = 0;
    while (collides(P.x, P.y, P.z) && P.y < SY) P.y += 1;
    P.yaw = a.mesh.rotation.y;
    document.body.classList.add('riding'); animalCall(a.kind); stats.tapped++; questCheck(); unlock('ride');
    toast((a.kind === 'horse' ? '🐎 말을' : '🐴 나귀를') + ' 탔어요 — 내릴 때는 「내리기」' + (isTouch ? '' : ' (Shift)'));
  }
  function dismount(quiet) {
    if (!riding) return;
    var a = riding; riding = null; curHT = HT; a.mode = 'idle'; a.t = 2;
    a.x = P.x; a.z = P.z; a.y = a.ty = P.y; a.h = P.yaw;
    document.body.classList.remove('riding');
    // 옆으로 내린다
    var side = [[1.9, 0], [-1.9, 0], [0, 1.9], [0, -1.9]], c = Math.cos(P.yaw), s2 = Math.sin(P.yaw);
    for (var i = 0; i < side.length; i++) {
      var ox = side[i][0] * c + side[i][1] * s2, oz = -side[i][0] * s2 + side[i][1] * c;
      if (!collides(P.x + ox, P.y, P.z + oz)) { P.x += ox; P.z += oz; break; }
    }
    while (collides(P.x, P.y, P.z) && P.y < SY) P.y += 1;
    saveHorses();
    if (!quiet) toast('내렸어요. ' + jo(a.sp.name, '은', '는') + ' 여기서 기다려요');
  }
  // 탄 동안 짐승이 나를 따라 움직임
  function stepRide(dt, moved) {
    var a = riding; if (!a) return;
    if (P.swim) { dismount(true); toast('물에서는 내려서 헤엄쳐요'); return; }
    a.x = P.x; a.z = P.z; a.y = a.ty = P.y; a.h = P.yaw;
    a.mesh.position.set(P.x, P.y, P.z); a.mesh.rotation.y = P.yaw;
    a.walk += moved * 1.1;
    var sw = moved > 0.01 ? Math.sin(a.walk * 2) * 0.75 : 0;
    a.legs[0].rotation.x = sw; a.legs[3].rotation.x = sw; a.legs[1].rotation.x = -sw; a.legs[2].rotation.x = -sw;
    a.body.rotation.x = 0;
    horseSaveT -= dt; if (horseSaveT <= 0) { horseSaveT = 3; saveHorses(); }
  }
  // 저장해 둔 안장 얹은 짐승은 그 자리 땅이 만들어지면 다시 나타남
  function spawnSavedHorses() {
    if (!pendingHorses.length) return;
    pendingHorses = pendingHorses.filter(function (o) {
      if (!colAt(o.x | 0, o.z | 0) || groundAt(o.x, o.z, SY - 3) === null) return true;
      var a = makeBeast(o.k, o.x, o.z); a.h = o.h || 0; a.mesh.rotation.y = a.h; a.cargo=readCargo(o.cargo); putSaddle(a); animals.push(a); return false;
    });
  }

  // 처음 온 사람 안내(한 번 다 하면 다시 안 나옴)
  var stats = { log: 0, crafted: 0, placed: 0, tapped: 0 }, qStep = 0;
  try { var qs = JSON.parse(localStorage.getItem('arkVillage.quest') || 'null'); if (qs) { stats = qs.stats || stats; qStep = qs.step || 0; } } catch (e) {}
  var tutorialStored = false, tutorialStep = qStep >= 4 ? 9 : 0, tutorialWalk = false, tutorialLook = false, tutorialDoor = null;
  var tutorialStartLog = stats.log || 0, tutorialStartCraft = stats.crafted || 0, tutorialOneLogTold = false, tutorialOneCraftTold = false;
  try {
    var tut = localStorage.getItem('arkVillage.tutorial');
    if (tut !== null && /^[0-9]$/.test(tut)) { tutorialStep = +tut; tutorialStored = true; }
  } catch (e) {}
  function tutorialSave() {
    tutorialStored = true;
    try { localStorage.setItem('arkVillage.tutorial', String(tutorialStep)); } catch (e) {}
    stateDirty();
  }
  function finishTutorial(showMessage) {
    tutorialStep = 9;
    // 새 안내가 이전의 처음 네 가지 할 일을 대신한다.
    if (qStep < 4) { qStep = 4; questSave(); }
    if (showMessage) toast('첫 안내를 끝냈어요. 위에 나오는 할 일을 따라 첫 집을 지어 보세요! 활·수레 같은 것은 메뉴 「✨ 새 기능」에서 봐요');
    tutorialSave(); renderQuest();
  }
  function tutorialAdvance() {
    tutorialStep++;
    if (tutorialStep === 1) tutorialStartLog = stats.log || 0;
    if (tutorialStep === 2) tutorialStartCraft = stats.crafted || 0;
    // 로그인 없이 할 수 있는 안내는 끝까지 보여 준다.
    if (tutorialStep === 4 && (!me || myPlot < 0)) tutorialStep = 6;
    if (tutorialStep === 7 && (!me || !NET.ok)) tutorialStep = 8;
    if (tutorialStep === 9) { finishTutorial(true); return; }
    tutorialSave(); renderQuest();
  }
  function tutorialEvent(event) {
    if (!started || tutorialStep >= 9) return;
    if (tutorialStep === 0) {
      if (event === 'walk') tutorialWalk = true;
      if (event === 'look') tutorialLook = true;
      if (tutorialWalk && tutorialLook) tutorialAdvance();
    } else if (['', 'log', 'craft', 'place', 'home', 'door', 'map', 'chat', 'animal'][tutorialStep] === event) {
      tutorialAdvance();
    }
  }
  var practiceStep = 0, practiceUpper = false, practiceHalves = 0;
  function openPractice() {
    practiceStep = practiceHalves = 0;
    practiceUpper = false;
    renderPractice();
    openPanel('practice');
  }
  function finishPractice() {
    S.practiceSeen = true;
    saveSettings();
    resume();
  }
  function renderPractice() {
    $('practiceHint').textContent = ['문을 눌러 열어 봐요.', '열린 문을 지나가 봐요.',
      '아래쪽과 위쪽에 반 블록을 한 번씩 놓아 봐요.', '지도를 열어 내 땅을 찾아봐요.',
      '연습 끝! 마을에서 직접 지어 봐요.'][practiceStep];
    $('practiceDoor').hidden = practiceStep > 1;
    $('practiceDoor').disabled = practiceStep === 1;
    $('practiceDoor').classList.toggle('open', practiceStep === 1);
    $('practiceDoor').textContent = practiceStep === 1 ? '열린 문' : '문 열기';
    $('practiceWalk').hidden = practiceStep !== 1;
    $('practiceHalf').hidden = $('practiceTile').hidden = practiceStep !== 2;
    $('practiceHalf').textContent = practiceUpper ? '위쪽' : '아래쪽';
    $('practiceTile').classList.toggle('upper', practiceUpper);
    $('practiceTile').classList.toggle('placed', !!(practiceHalves & (practiceUpper ? 2 : 1)));
    $('practiceMap').hidden = practiceStep !== 3;
    $('practiceMapView').hidden = $('practiceDone').hidden = practiceStep !== 4;
    $('practiceSkip').hidden = practiceStep === 4;
  }
  function renderTutorial() {
    var text = [
      isTouch ? '방향키로 걷고 화면을 밀어 둘러봐요 (방향키 가운데 톡톡 = 웅크리기)' : 'WASD로 걷고 마우스로 둘러봐요 (Shift = 웅크리기)',
      isTouch ? '통나무 2개를 캐요 — ＋에 맞추고 화면을 꾹 눌러요' : '통나무 2개를 캐요 — ＋를 맞추고 왼쪽 버튼을 꾹 눌러요',
      '가방 → 만들기 → 블록에서 고페르 나무를 두 번 만들어요',
      isTouch ? '단축 칸에서 블록을 고르고 화면을 톡 눌러 놓아요' : '단축 칸에서 블록을 고르고 오른쪽 클릭해 놓아요',
      '내 땅으로 가요',
      '나무 문을 놓고 연 다음 문 안으로 걸어가요',
      isTouch ? '작은 지도를 눌러 큰 지도를 열어요' : 'M 키로 큰 지도를 열어요',
      isTouch ? '채팅 버튼을 눌러 채팅을 열어요' : 'T 키로 채팅을 열어요',
      '동물에 ＋를 맞추고 눌러 말씀 카드를 봐요'
    ];
    var actions = { 1: ['숲으로', function () { travel('forest'); }],
      2: ['만들기', function () { invTab = 'craft'; craftCat = 'block'; openPanel('inv'); }],
      4: ['내 땅으로', goHome],
      5: ['문 만들기', function () { invTab = 'craft'; craftCat = 'shape'; openPanel('inv'); }] };
    var action = actions[tutorialStep], btn = $('qBtn');
    $('qHead').textContent = '처음 안내 ' + (tutorialStep + 1) + '/9';
    $('qText').textContent = text[tutorialStep];
    btn.style.display = action ? '' : 'none';
    btn.textContent = action ? action[0] : '';
    btn.onclick = action ? function (e) { e.stopPropagation(); action[1](); } : null;
  }
  var QUEST = [
    { text: '🌲 동쪽 숲에서 통나무 5개 캐기', prog: function () { return Math.min(5, stats.log) + '/5'; }, done: function () { return stats.log >= 5; }, btn: ['숲으로', function () { travel('forest'); }] },
    { text: '🔨 가방 → 만들기에서 고페르 나무 만들기', done: function () { return stats.crafted > 0; }, btn: ['가방 열기', function () { invTab = 'craft'; openPanel('inv'); }] },
    { text: '🐑 동물을 눌러 말씀 카드 보기', done: function () { return stats.tapped > 0; } },
    { text: '🏠 내 땅에 블록 놓기', done: function () { return stats.placed > 0; }, btn: ['내 땅으로', function () { guideHome(); }], guest: '🏠 로그인하면 내 땅에 집을 지을 수 있어요' },
    // 첫 집 짓기: 무엇을 지을지 한 단계씩
    { text: '🪵 집 지을 고페르 나무 20개 모으기(통나무 1 → 4)', prog: function () { return Math.min(20, have(GOPHER)) + '/20'; }, done: function () { return have(GOPHER) >= 20 || stats.placed >= 30; }, btn: ['만들기', function () { invTab = 'craft'; craftCat = 'block'; openPanel('inv'); }] },
    { text: '🧱 내 땅에 바닥과 벽 블록 30개 놓기', prog: function () { return Math.min(30, stats.placed) + '/30'; }, done: function () { return stats.placed >= 30; }, btn: ['내 땅으로', function () { guideHome(); }], guest: '🏠 로그인하면 내 땅에 집을 지을 수 있어요' },
    { text: '🚪 문을 만들어 집에 달기(고페르 나무 6)', done: function () { return [60, 61, 62, 63, 64, 65, 66, 67].some(plotHas); }, btn: ['만들기', function () { invTab = 'craft'; craftCat = 'shape'; openPanel('inv'); }], guest: '🏠 로그인하면 내 땅에 집을 지을 수 있어요' },
    { text: '🔥 등불이나 횃불로 집 안 밝히기', done: function () { return plotHas(LAMP) || plotHas(TORCH) || [170, 171, 172, 173].some(plotHas); }, btn: ['만들기', function () { invTab = 'craft'; craftCat = 'block'; openPanel('inv'); }], guest: '🏠 로그인하면 내 땅에 집을 지을 수 있어요' },
    { text: '🛏 침대를 놓아 쉴 곳 만들기(양털 3 + 고페르 나무 3)', done: function () { return plotHas(BED); }, btn: ['만들기', function () { invTab = 'craft'; craftCat = 'block'; openPanel('inv'); }], guest: '🏠 로그인하면 내 땅에 집을 지을 수 있어요' },
    { text: '🕊 방주 문 앞 노아의 부탁 다섯 가지 마치기 → 개척 땅', prog: function () { return (NOAH.done ? 5 : NOAH.step) + '/5'; }, done: function () { return !!NOAH.done; }, btn: ['노아에게', function () { travel('ark'); }], guest: '🏠 로그인하면 노아의 부탁을 받고 개척 땅을 맡을 수 있어요' },
    { text: '🐑 울타리로 우리를 짓고 밀을 들고 양을 데려오기', done: function () { return HERD.length > 0; }, btn: ['내 땅으로', function () { guideHome(); }], guest: '🏠 로그인하면 내 땅에 집을 지을 수 있어요' }
  ];
  function questSave() { try { localStorage.setItem('arkVillage.quest', JSON.stringify({ stats: stats, step: qStep })); } catch (e) {} }
  function questCheck() {
    // 문까지 만들려면 고페르 나무 7개(놓기 1 + 문 6)가 필요 → 통나무 2개를 캐면 넘어감
    if (tutorialStep === 1 && stats.log - tutorialStartLog >= 2) tutorialEvent('log');
    else if (tutorialStep === 1 && stats.log - tutorialStartLog === 1 && !tutorialOneLogTold) { tutorialOneLogTold = true; toast('🪵 하나 더! 문까지 만들려면 통나무가 2개 필요해요'); }
    if (tutorialStep === 2 && stats.crafted - tutorialStartCraft >= 2) tutorialEvent('craft');   // 통나무 2개 → 고페르 나무 8개(놓기 1 + 문 6)
    else if (tutorialStep === 2 && stats.crafted - tutorialStartCraft === 1 && !tutorialOneCraftTold) { tutorialOneCraftTold = true; toast('🪵 한 번 더 만들어요 — 문을 만들려면 고페르 나무가 더 필요해요'); }
    var moved = false;
    while (qStep < QUEST.length && QUEST[qStep].done()) { qStep++; moved = true; }
    if (moved) { sfx('craft'); if (qStep >= QUEST.length) toast('🎉 첫 집을 다 지었어요! 이제 함께 짓는 터에서 친구들과 지어 보세요'); else if (qStep === 4) toast('🏠 이제 첫 집을 지어 봐요 — 위의 할 일을 하나씩 따라가요'); }
    questSave(); renderQuest();
  }
  function renderQuest() {
    var el = $('quest'); if (!el) return;
    var tutoring = started && tutorialStep < 9;
    $('qSkip').hidden = !tutoring;
    if (tutoring) { el.style.display = ''; renderTutorial(); return; }
    if (qStep >= QUEST.length) {   // 첫 집을 다 지으면: 「본향을 향하여」 지금 할 일
      if (STORY.ended) { el.style.display = 'none'; return; }
      el.style.display = ''; var b2 = $('qBtn'); b2.style.display = '';
      if (!STORY.started) {
        $('qHead').textContent = '📜 ' + PART_NAMES[0]; $('qText').textContent = '🧭 마을 입구의 「안내하는 나그네」에게 말을 걸어요';
        b2.textContent = '가기'; b2.onclick = function (e) { e.stopPropagation(); guideTo([XM - 6.5, PZ0 - 3], '안내하는 나그네'); };
        return;
      }
      var part = partOf(), txt = '';
      if (part === 1) { var t = TOKENS.filter(function (t2) { return !has(t2[0]); })[0], q = t && tokenTasks(t).filter(function (q2) { return q2[1] < q2[2]; })[0]; txt = t ? t[2] + ' ' + t[1] + ': ' + (q ? q[0] + ' ' + Math.min(q[1], q[2]) + '/' + q[2] : '') : ''; }
      else if (part === 2) txt = '💎 기초석 ' + FS_NAMES.filter(function (n, i) { return have(FSTONE0 + i) > 0 || STORY.sockets[i]; }).length + '/12 — 땅속 깊이 열두 보석을 캐요';
      else if (part === 3) txt = '🕯 골짜기 등잔대 ' + STORY.lamps.filter(Boolean).length + '/7 — 동쪽 사막 땅속 미로';
      else txt = '🚪 기초석 자리 ' + STORY.sockets.filter(Boolean).length + '/12 — 동쪽 끝 거룩한 성';
      $('qHead').textContent = '📜 ' + PART_NAMES[part]; $('qText').textContent = txt;
      b2.textContent = '자세히'; b2.onclick = function (e) { e.stopPropagation(); sfx('click'); openStory(); };
      return;
    }
    var q = QUEST[qStep], guest = q.guest && !me;
    el.style.display = '';
    $('qHead').textContent = '할 일 ' + (qStep + 1) + '/' + QUEST.length;
    $('qText').textContent = (guest ? q.guest : q.text) + (q.prog ? '  ' + q.prog() : '');
    var b = $('qBtn');
    if (q.btn && !guest) { b.style.display = ''; b.textContent = q.btn[0]; b.onclick = function (e) { e.stopPropagation(); sfx('click'); q.btn[1](); }; }
    else b.style.display = 'none';
  }

