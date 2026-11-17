/* 방주 마을 (1단계) — 블록 월드, 창세기 6장 크기의 방주 구경, 내 땅에 집 짓기.
   3D는 In Odyssey의 three-bundle(window.THREE). 그림은 말씀우물 고유 색(텍스처 없이 정점 색 + 그늘). */
(function () {
  'use strict';
  var THREE = window.THREE;

  // ───────── 블록 ─────────
  // [이름, 위 색, 옆 색, 아래 색, 투명(0/1), 빛(0/1)]
  var B = [
    null,
    ['풀', 0x7cbf5a, 0x8d7150, 0x7a5f42],
    ['흙', 0x8d7150, 0x8d7150, 0x7a5f42],
    ['돌', 0x9a9a96, 0x8e8e8a, 0x84847f],
    ['모래', 0xe6d29a, 0xdcc78e, 0xd2bd84],
    ['고페르 나무', 0xc89a5e, 0xb98a50, 0xa97c46],
    ['역청 칠한 나무', 0x4a3424, 0x3f2c1e, 0x36261a],
    ['통나무', 0xa07a4a, 0x6e4e2e, 0xa07a4a],
    ['나뭇잎', 0x5e9e48, 0x558f41, 0x4c823a],
    ['유리', 0xcfeaf3, 0xcfeaf3, 0xcfeaf3, 1],
    ['등불', 0xffe08a, 0xffd36a, 0xffd36a, 0, 1],
    ['흰 벽', 0xf1ece0, 0xe7e1d3, 0xdcd5c6],
    ['붉은 벽돌', 0xb5523e, 0xa84a37, 0x9c4433],
    ['기와', 0x6b4a8a, 0x5d407a, 0x52386c],
    ['하늘색 천', 0x7fc6e8, 0x76bbdc, 0x6daecf],
    ['노란 천', 0xf2cf55, 0xe9c54b, 0xdcb942],
    ['분홍 천', 0xf0a3b8, 0xe697ad, 0xd98ba1],
    ['초록 천', 0x69b86c, 0x60ab63, 0x579e5a],
    ['자갈길', 0xbdb39f, 0xb1a793, 0xa59b88],
    ['꽃', 0x7cbf5a, 0x8d7150, 0x7a5f42]
  ];
  var AIR = 0, GRASS = 1, DIRT = 2, STONE = 3, SAND = 4, GOPHER = 5, PITCH = 6, LOG = 7, LEAF = 8, GLASS = 9, LAMP = 10,
      PATH = 18;
  var HOTBAR = [GOPHER, LOG, 11, 12, 13, GLASS, LAMP, 14, 15, 16, 17, STONE, SAND, DIRT, LEAF, PITCH];
  function isTrans(id) { return id === AIR || (B[id] && B[id][4] === 1); }

  // ───────── 월드 ─────────
  var SX = 352, SY = 48, SZ = 184, G = 8;          // G: 땅 위 첫 칸 높이
  var W = new Uint8Array(SX * SY * SZ);
  function idx(x, y, z) { return (y * SZ + z) * SX + x; }
  function get(x, y, z) {
    if (x < 0 || y < 0 || z < 0 || x >= SX || y >= SY || z >= SZ) return y < 0 ? STONE : AIR;
    return W[idx(x, y, z)];
  }
  function setRaw(x, y, z, id) { if (x >= 0 && y >= 0 && z >= 0 && x < SX && y < SY && z < SZ) W[idx(x, y, z)] = id; }
  function fill(x1, y1, z1, x2, y2, z2, id) {
    for (var y = y1; y <= y2; y++) for (var z = z1; z <= z2; z++) for (var x = x1; x <= x2; x++) setRaw(x, y, z, id);
  }

  // 방주: 창 6:15 길이 300 · 너비 50 · 높이 30 (1규빗 = 1블록)
  var AX0 = 26, AZ0 = 20, AL = 300, AW = 50, AH = 30;
  var AX1 = AX0 + AL - 1, AZ1 = AZ0 + AW - 1, AY0 = G, AY1 = G + AH - 1;
  // 마을 땅: 방주 남쪽, 16×16, 4줄 × 16칸 = 64필지
  var PLOT = 16, PGAP = 4, PX0 = 26, PZ0 = 92, PCOLS = 16, PROWS = 4, PH = 24;
  function plotOrigin(i) { return { x: PX0 + (i % PCOLS) * (PLOT + PGAP), z: PZ0 + Math.floor(i / PCOLS) * (PLOT + PGAP) }; }
  function plotAt(x, z) {
    var cx = x - PX0, cz = z - PZ0;
    if (cx < 0 || cz < 0) return -1;
    var c = Math.floor(cx / (PLOT + PGAP)), r = Math.floor(cz / (PLOT + PGAP));
    if (c >= PCOLS || r >= PROWS || cx % (PLOT + PGAP) >= PLOT || cz % (PLOT + PGAP) >= PLOT) return -1;
    return r * PCOLS + c;
  }
  var PY0 = G - 3;                                   // 땅 3칸 아래까지 팔 수 있음
  function inArk(x, y, z) { return x >= AX0 - 1 && x <= AX1 + 1 && z >= AZ0 - 1 && z <= AZ1 + 1 && y >= AY0 - 1 && y <= AY1 + 1; }

  function rnd(s) { s = Math.sin(s * 127.1) * 43758.5453; return s - Math.floor(s); }

  function genWorld() {
    fill(0, 0, 0, SX - 1, G - 5, SZ - 1, STONE);
    fill(0, G - 4, 0, SX - 1, G - 2, SZ - 1, DIRT);
    fill(0, G - 1, 0, SX - 1, G - 1, SZ - 1, GRASS);
    // 길: 방주 문 앞에서 마을로, 마을 안 가로·세로 길
    var xm = AX0 + Math.floor(AL / 2);
    fill(xm - 3, G - 1, AZ1 + 1, xm + 2, G - 1, PZ0 - 1, PATH);
    for (var r = 0; r <= PROWS; r++) { var zz = PZ0 - 3 + r * (PLOT + PGAP); fill(PX0 - 3, G - 1, zz, PX0 + PCOLS * (PLOT + PGAP) - 2, G - 1, zz + 1, PATH); }
    for (var c = 0; c <= PCOLS; c++) { var xx = PX0 - 3 + c * (PLOT + PGAP); fill(xx, G - 1, PZ0 - 3, xx + 1, G - 1, PZ0 + PROWS * (PLOT + PGAP) - 2, PATH); }
    // 방주 둘레 모래빛 마당
    fill(AX0 - 3, G - 1, AZ0 - 3, AX1 + 3, G - 1, AZ0 - 1, SAND);
    fill(AX0 - 3, G - 1, AZ1 + 1, AX1 + 3, G - 1, AZ1 + 3, SAND);
    // 가장자리 나무
    for (var i = 0; i < 90; i++) {
      var tx = Math.floor(rnd(i + 1) * SX), tz = Math.floor(rnd(i + 99) * SZ);
      var nearArk = tx > AX0 - 6 && tx < AX1 + 6 && tz > AZ0 - 6 && tz < AZ1 + 6;
      var nearVil = tx > PX0 - 6 && tx < PX0 + PCOLS * (PLOT + PGAP) + 2 && tz > PZ0 - 6 && tz < PZ0 + PROWS * (PLOT + PGAP) + 2;
      var onPath = Math.abs(tx - xm) < 6 && tz > AZ1 && tz < PZ0;
      if (nearArk || nearVil || onPath) continue;
      var h = 4 + Math.floor(rnd(i + 7) * 3);
      fill(tx, G, tz, tx, G + h - 1, tz, LOG);
      for (var ly = h - 2; ly <= h + 1; ly++) {
        var rr = ly > h ? 1 : 2;
        for (var dz = -rr; dz <= rr; dz++) for (var dx = -rr; dx <= rr; dx++)
          if (Math.abs(dx) + Math.abs(dz) <= rr + 1 && get(tx + dx, G + ly, tz + dz) === AIR) setRaw(tx + dx, G + ly, tz + dz, LEAF);
      }
    }
    buildArk();
  }

  function buildArk() {
    // 바닥·벽·지붕: 역청을 그 안팎에 칠한 듯 어두운 나무(창 6:14)
    fill(AX0, AY0, AZ0, AX1, AY0, AZ1, PITCH);
    fill(AX0, AY0 + 1, AZ0, AX1, AY1, AZ0, PITCH);
    fill(AX0, AY0 + 1, AZ1, AX1, AY1, AZ1, PITCH);
    fill(AX0, AY0 + 1, AZ0, AX0, AY1, AZ1, PITCH);
    fill(AX1, AY0 + 1, AZ0, AX1, AY1, AZ1, PITCH);
    fill(AX0, AY1, AZ0, AX1, AY1, AZ1, PITCH);
    // 상 중 하 삼층(창 6:16): 하층 바닥 AY0, 중층 AY0+10, 상층 AY0+20
    fill(AX0 + 1, AY0 + 10, AZ0 + 1, AX1 - 1, AY0 + 10, AZ1 - 1, GOPHER);
    fill(AX0 + 1, AY0 + 20, AZ0 + 1, AX1 - 1, AY0 + 20, AZ1 - 1, GOPHER);
    // 창: 위에서부터 한 규빗(지붕 바로 아래 한 줄)을 사방으로 트고 5칸마다 기둥
    var yw = AY1 - 1, x, z;
    fill(AX0 + 1, yw, AZ0, AX1 - 1, yw, AZ0, AIR); fill(AX0 + 1, yw, AZ1, AX1 - 1, yw, AZ1, AIR);
    fill(AX0, yw, AZ0 + 1, AX0, yw, AZ1 - 1, AIR); fill(AX1, yw, AZ0 + 1, AX1, yw, AZ1 - 1, AIR);
    for (x = AX0 + 5; x < AX1; x += 5) { setRaw(x, yw, AZ0, LOG); setRaw(x, yw, AZ1, LOG); }
    for (z = AZ0 + 5; z < AZ1; z += 5) { setRaw(AX0, yw, z, LOG); setRaw(AX1, yw, z, LOG); }
    // 문은 옆으로: 남쪽 긴 벽 가운데, 하층 높이
    var xm = AX0 + Math.floor(AL / 2);
    fill(xm - 3, AY0 + 1, AZ1, xm + 2, AY0 + 7, AZ1, AIR);
    // 칸들(창 6:14): 하층·중층에 25칸마다 낮은 칸막이, 가운데 통로는 비움
    [AY0 + 1, AY0 + 11].forEach(function (y) {
      for (x = AX0 + 25; x < AX1; x += 25) {
        fill(x, y, AZ0 + 1, x, y + 1, AZ0 + 17, GOPHER);
        if (Math.abs(x - xm) > 6) fill(x, y, AZ1 - 17, x, y + 1, AZ1 - 1, GOPHER);   // 문에서 통로까지는 막지 않음
      }
    });
    // 층 사이 계단(양 끝), 지나가는 바닥 구멍
    function stairs(x0, yBase, dir) {
      for (var i = 0; i < 9; i++) { var sx = x0 + dir * i; fill(sx, yBase + 1, AZ0 + 22, sx, yBase + 1 + i, AZ0 + 23, GOPHER); }
      var a = x0 + dir * 1, b = x0 + dir * 10;
      fill(Math.min(a, b), yBase + 10, AZ0 + 22, Math.max(a, b), yBase + 10, AZ0 + 23, AIR);
    }
    stairs(AX0 + 12, AY0, 1); stairs(AX1 - 12, AY0, -1);
    stairs(AX0 + 40, AY0 + 10, 1); stairs(AX1 - 40, AY0 + 10, -1);
    // 등불: 층마다 가운데 통로 바닥에 10칸마다
    var zc = AZ0 + Math.floor(AW / 2);
    [AY0, AY0 + 10, AY0 + 20].forEach(function (y) { for (x = AX0 + 5; x < AX1; x += 10) setRaw(x, y, zc, LAMP); });
  }

  // ───────── 그리기(청크 메시) ─────────
  var CS = 16, CX = Math.ceil(SX / CS), CY = Math.ceil(SY / CS), CZ = Math.ceil(SZ / CS);
  var chunks = {}, scene, camera, renderer, opaqueMat, glassMat;
  var FACES = [
    { n: [1, 0, 0], s: 0.80, v: [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]] },
    { n: [-1, 0, 0], s: 0.74, v: [[0, 0, 1], [0, 1, 1], [0, 1, 0], [0, 0, 0]] },
    { n: [0, 1, 0], s: 1.00, v: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]] },
    { n: [0, -1, 0], s: 0.55, v: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]] },
    { n: [0, 0, 1], s: 0.86, v: [[1, 0, 1], [1, 1, 1], [0, 1, 1], [0, 0, 1]] },
    { n: [0, 0, -1], s: 0.68, v: [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]] }
  ];
  var skyTop = new Int16Array(SX * SZ);              // 기둥마다 가장 높은 막힌 칸(그늘 계산)
  function updateSky(x, z) {
    var t = -1;
    for (var y = SY - 1; y >= 0; y--) { var id = W[idx(x, y, z)]; if (id !== AIR && id !== GLASS && id !== LEAF) { t = y; break; } }
    skyTop[z * SX + x] = t;
  }
  function solidAO(x, y, z) { var id = get(x, y, z); return id !== AIR && id !== GLASS ? 1 : 0; }
  var tmpC = new THREE.Color();
  function buildChunk(cx, cy, cz) {
    var key = cx + ',' + cy + ',' + cz, old = chunks[key];
    if (old) { old.forEach(function (m) { scene.remove(m); m.geometry.dispose(); }); }
    var P = [[], []], C = [[], []], I = [[], []];
    var x0 = cx * CS, y0 = cy * CS, z0 = cz * CS;
    for (var y = y0; y < Math.min(y0 + CS, SY); y++)
      for (var z = z0; z < Math.min(z0 + CS, SZ); z++)
        for (var x = x0; x < Math.min(x0 + CS, SX); x++) {
          var id = W[idx(x, y, z)];
          if (id === AIR) continue;
          var def = B[id], tr = def[4] === 1 ? 1 : 0, lit = def[5] === 1;
          var jitter = 0.94 + rnd(x * 7.1 + y * 13.3 + z * 3.7) * 0.10;
          for (var f = 0; f < 6; f++) {
            var F = FACES[f], nx = x + F.n[0], ny = y + F.n[1], nz = z + F.n[2], nb = get(nx, ny, nz);
            if (!(nb === AIR || (isTrans(nb) && nb !== id))) continue;
            var base = f === 2 ? def[1] : (f === 3 ? def[3] : def[2]);
            tmpC.setHex(base);
            var shade = lit ? 1.15 : F.s * jitter;
            if (!lit && ny >= 0 && ny < SY && nx >= 0 && nx < SX && nz >= 0 && nz < SZ && skyTop[nz * SX + nx] > ny) shade *= 0.62;
            var P2 = P[tr], C2 = C[tr], I2 = I[tr], start = P2.length / 3;
            for (var k = 0; k < 4; k++) {
              var v = F.v[k];
              P2.push(x + v[0], y + v[1], z + v[2]);
              // 꼭짓점 AO: 면 바깥쪽 이웃 3칸
              var ao = 1;
              if (!lit && !tr) {
                var ax = F.n[0] !== 0 ? 0 : (v[0] ? 1 : -1), ay = F.n[1] !== 0 ? 0 : (v[1] ? 1 : -1), az = F.n[2] !== 0 ? 0 : (v[2] ? 1 : -1);
                var s1, s2, s3;
                if (F.n[0] !== 0) { s1 = solidAO(nx, y + ay, z); s2 = solidAO(nx, y, z + az); s3 = solidAO(nx, y + ay, z + az); }
                else if (F.n[1] !== 0) { s1 = solidAO(x + ax, ny, z); s2 = solidAO(x, ny, z + az); s3 = solidAO(x + ax, ny, z + az); }
                else { s1 = solidAO(x + ax, y, nz); s2 = solidAO(x, y + ay, nz); s3 = solidAO(x + ax, y + ay, nz); }
                var occ = (s1 && s2) ? 3 : s1 + s2 + s3;
                ao = 1 - occ * 0.16;
              }
              var m = shade * ao;
              C2.push(Math.min(1, tmpC.r * m), Math.min(1, tmpC.g * m), Math.min(1, tmpC.b * m));
            }
            I2.push(start, start + 1, start + 2, start, start + 2, start + 3);
          }
        }
    var meshes = [];
    for (var t = 0; t < 2; t++) {
      if (!I[t].length) continue;
      var g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(P[t], 3));
      g.setAttribute('color', new THREE.Float32BufferAttribute(C[t], 3));
      g.setIndex(I[t]);
      g.computeBoundingSphere();
      var mesh = new THREE.Mesh(g, t ? glassMat : opaqueMat);
      if (t) mesh.renderOrder = 1;
      scene.add(mesh); meshes.push(mesh);
    }
    chunks[key] = meshes;
  }
  function rebuildAround(x, y, z) {
    var done = {};
    [[0, 0, 0], [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].forEach(function (d) {
      var cx = Math.floor((x + d[0]) / CS), cy = Math.floor((y + d[1]) / CS), cz = Math.floor((z + d[2]) / CS);
      if (cx < 0 || cy < 0 || cz < 0 || cx >= CX || cy >= CY || cz >= CZ) return;
      var k = cx + ',' + cy + ',' + cz; if (done[k]) return; done[k] = 1; buildChunk(cx, cy, cz);
    });
  }

  // ───────── 플레이어 ─────────
  var P = { x: AX0 + AL / 2 + 0.5, y: G, z: PZ0 - 10, vx: 0, vy: 0, vz: 0, yaw: Math.PI, pitch: -0.12, ground: false, fly: false, camY: 0 };
  var HW = 0.3, HT = 1.75, EYE = 1.6;
  function solidAt(x, y, z) { var id = get(Math.floor(x), Math.floor(y), Math.floor(z)); return id !== AIR; }
  function collides(px, py, pz) {
    for (var x = Math.floor(px - HW); x <= Math.floor(px + HW); x++)
      for (var y = Math.floor(py); y <= Math.floor(py + HT - 0.01); y++)
        for (var z = Math.floor(pz - HW); z <= Math.floor(pz + HW); z++)
          if (get(x, y, z) !== AIR) return true;
    return false;
  }
  function moveAxis(axis, d) {
    if (!d) return false;
    var steps = Math.ceil(Math.abs(d) / 0.2), s = d / steps;
    for (var i = 0; i < steps; i++) {
      var nx = P.x + (axis === 0 ? s : 0), ny = P.y + (axis === 1 ? s : 0), nz = P.z + (axis === 2 ? s : 0);
      if (collides(nx, ny, nz)) {
        // 한 칸 턱은 자동으로 올라간다(걷는 중, 땅에 있을 때)
        if (axis !== 1 && P.ground && !P.fly && !collides(nx, ny + 1.01, nz) && !collides(P.x, P.y + 1.01, P.z)) {
          P.y += 1.01; P.camY -= 1.01; P.x = nx; P.z = nz; continue;
        }
        return true;
      }
      P.x = nx; P.y = ny; P.z = nz;
    }
    return false;
  }

  // ───────── 입력 ─────────
  var keys = {}, joy = { x: 0, y: 0 }, wantJump = false, flyUp = false, flyDown = false, mode = 'place', sel = 0;
  var lockOn = false;
  function bindInput(canvas) {
    window.addEventListener('keydown', function (e) {
      keys[e.code] = true;
      if (e.code === 'Space') wantJump = true;
      if (e.code === 'KeyF') toggleFly();
      if (/^Digit[1-9]$/.test(e.code)) setSel(+e.code.slice(5) - 1);
      if (e.code === 'KeyQ') setMode(mode === 'place' ? 'break' : 'place');
    });
    window.addEventListener('keyup', function (e) { keys[e.code] = false; });
    canvas.addEventListener('mousedown', function (e) {
      if (isTouch) return;
      if (!lockOn) { canvas.requestPointerLock && canvas.requestPointerLock(); return; }
      if (e.button === 0) act('break'); else if (e.button === 2) act('place');
    });
    canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    $('lockHint').addEventListener('click', function () { canvas.requestPointerLock && canvas.requestPointerLock(); });
    document.addEventListener('pointerlockchange', function () { lockOn = document.pointerLockElement === canvas; $('lockHint').style.display = lockOn || isTouch ? 'none' : 'flex'; });
    document.addEventListener('mousemove', function (e) { if (lockOn) look(e.movementX, e.movementY, 0.0024); });
    window.addEventListener('wheel', function (e) { if (lockOn) setSel((sel + (e.deltaY > 0 ? 1 : -1) + HOTBAR.length) % HOTBAR.length); });

    // 터치: 왼쪽 절반 = 움직이기(누른 자리가 조이스틱 중심), 오른쪽 절반 = 둘러보기, 짧게 누르면 놓기/부수기
    var tMove = null, tLook = null, stick = $('stick'), knob = $('knob');
    canvas.addEventListener('touchstart', function (e) {
      isTouch = true;
      for (var i = 0; i < e.changedTouches.length; i++) {
        var t = e.changedTouches[i];
        if (t.clientX < window.innerWidth * 0.42 && !tMove) {
          tMove = { id: t.identifier, ox: t.clientX, oy: t.clientY };
          stick.style.display = 'block'; stick.style.left = (t.clientX - 60) + 'px'; stick.style.top = (t.clientY - 60) + 'px'; knob.style.transform = 'translate(0,0)';
        } else if (!tLook) {
          tLook = { id: t.identifier, lx: t.clientX, ly: t.clientY, sx: t.clientX, sy: t.clientY, t0: performance.now(), moved: 0, held: false };
          holdTimer = setTimeout(function () { if (tLook && tLook.moved < 10) { tLook.held = true; act(mode === 'place' ? 'break' : 'place'); vibrate(); } }, 450);
        }
      }
      e.preventDefault();
    }, { passive: false });
    canvas.addEventListener('touchmove', function (e) {
      for (var i = 0; i < e.changedTouches.length; i++) {
        var t = e.changedTouches[i];
        if (tMove && t.identifier === tMove.id) {
          var dx = t.clientX - tMove.ox, dy = t.clientY - tMove.oy, L = Math.hypot(dx, dy), max = 52;
          if (L > max) { dx *= max / L; dy *= max / L; }
          joy.x = dx / max; joy.y = dy / max;
          knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
        } else if (tLook && t.identifier === tLook.id) {
          var mx = t.clientX - tLook.lx, my = t.clientY - tLook.ly;
          tLook.moved += Math.abs(mx) + Math.abs(my);
          look(mx, my, 0.0062);
          tLook.lx = t.clientX; tLook.ly = t.clientY;
        }
      }
      e.preventDefault();
    }, { passive: false });
    function end(e) {
      for (var i = 0; i < e.changedTouches.length; i++) {
        var t = e.changedTouches[i];
        if (tMove && t.identifier === tMove.id) { tMove = null; joy.x = joy.y = 0; stick.style.display = 'none'; }
        else if (tLook && t.identifier === tLook.id) {
          clearTimeout(holdTimer);
          if (!tLook.held && tLook.moved < 10 && performance.now() - tLook.t0 < 350) act(mode);
          tLook = null;
        }
      }
    }
    canvas.addEventListener('touchend', end); canvas.addEventListener('touchcancel', end);
  }
  var isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0, holdTimer = null;
  function vibrate() { try { navigator.vibrate && navigator.vibrate(15); } catch (e) {} }
  function look(dx, dy, k) {
    P.yaw -= dx * k; P.pitch -= dy * k;
    P.pitch = Math.max(-1.52, Math.min(1.52, P.pitch));
  }
  function toggleFly() { P.fly = !P.fly; P.vy = 0; $('btnFly').classList.toggle('on', P.fly); $('flyPad').style.display = P.fly ? 'flex' : 'none'; toast(P.fly ? '날기 켬 — 위·아래 버튼으로 오르내려요' : '날기 끔'); }
  function setMode(m) { mode = m; $('btnMode').textContent = m === 'place' ? '놓기' : '부수기'; $('btnMode').classList.toggle('break', m === 'break'); }
  function setSel(i) {
    sel = i; var slots = document.querySelectorAll('.slot');
    for (var k = 0; k < slots.length; k++) slots[k].classList.toggle('on', k === i);
    var s = slots[i]; s && s.scrollIntoView && s.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    $('selName').textContent = B[HOTBAR[i]][0];
  }

  // ───────── 겨누기(블록 찾기) ─────────
  function raycast(maxD) {
    var dir = new THREE.Vector3(); camera.getWorldDirection(dir);
    var ox = camera.position.x, oy = camera.position.y, oz = camera.position.z;
    var x = Math.floor(ox), y = Math.floor(oy), z = Math.floor(oz);
    var sx = dir.x > 0 ? 1 : -1, sy = dir.y > 0 ? 1 : -1, sz = dir.z > 0 ? 1 : -1;
    var tdx = Math.abs(1 / dir.x), tdy = Math.abs(1 / dir.y), tdz = Math.abs(1 / dir.z);
    var tx = (sx > 0 ? x + 1 - ox : ox - x) * tdx, ty = (sy > 0 ? y + 1 - oy : oy - y) * tdy, tz = (sz > 0 ? z + 1 - oz : oz - z) * tdz;
    var px = x, py = y, pz = z, t = 0;
    while (t <= maxD) {
      if (get(x, y, z) !== AIR && y >= 0) return { x: x, y: y, z: z, px: px, py: py, pz: pz };
      px = x; py = y; pz = z;
      if (tx < ty && tx < tz) { x += sx; t = tx; tx += tdx; }
      else if (ty < tz) { y += sy; t = ty; ty += tdy; }
      else { z += sz; t = tz; tz += tdz; }
    }
    return null;
  }

  // ───────── 권한·저장 ─────────
  var client = null, me = null, myPlot = -1, plotOwners = {}, saveTimer = null, dirty = false;
  function canEdit(x, y, z) {
    if (inArk(x, y, z)) return '방주는 3단계에서 다 함께 지어요. 지금은 구경해요!';
    var p = plotAt(x, z);
    if (p < 0) return '내 땅 안에서만 지을 수 있어요';
    if (!me) return '로그인하면 내 땅을 받아 집을 지을 수 있어요';
    if (p !== myPlot) return (p + 1) + '번 땅은 다른 사람의 땅이에요';
    if (y < PY0 || y >= G + PH) return '땅 높이 안에서만 지을 수 있어요(아래 3칸 ~ 위 ' + PH + '칸)';
    return '';
  }
  function act(kind) {
    var h = raycast(7); if (!h) return;
    if (kind === 'break') {
      var why = canEdit(h.x, h.y, h.z); if (why) return toast(why);
      setBlock(h.x, h.y, h.z, AIR);
    } else {
      var why2 = canEdit(h.px, h.py, h.pz); if (why2) return toast(why2);
      // 내 몸이 있는 칸에는 못 놓음
      var bx = h.px, by = h.py, bz = h.pz;
      if (bx + 1 > P.x - HW && bx < P.x + HW && by + 1 > P.y && by < P.y + HT && bz + 1 > P.z - HW && bz < P.z + HW) return;
      setBlock(bx, by, bz, HOTBAR[sel]);
    }
    vibrate();
  }
  function setBlock(x, y, z, id) {
    setRaw(x, y, z, id); updateSky(x, z);
    rebuildAround(x, y, z);
    if (plotAt(x, z) === myPlot) { dirty = true; clearTimeout(saveTimer); saveTimer = setTimeout(savePlot, 1500); setSave('저장 중…'); }
  }
  // 땅 한 필지 = 16×16×(PH+3) 칸 → 바이트 배열 → base64
  function encodePlot(i) {
    var o = plotOrigin(i), n = PLOT * PLOT * (PH + G - PY0), a = new Uint8Array(n), k = 0;
    for (var y = PY0; y < G + PH; y++) for (var z = 0; z < PLOT; z++) for (var x = 0; x < PLOT; x++) a[k++] = get(o.x + x, y, o.z + z);
    var s = ''; for (k = 0; k < a.length; k++) s += String.fromCharCode(a[k]);
    return btoa(s);
  }
  function decodePlot(i, b64) {
    try {
      var s = atob(b64), o = plotOrigin(i), k = 0;
      if (s.length !== PLOT * PLOT * (PH + G - PY0)) return;
      for (var y = PY0; y < G + PH; y++) for (var z = 0; z < PLOT; z++) for (var x = 0; x < PLOT; x++) {
        var id = s.charCodeAt(k++); setRaw(o.x + x, y, o.z + z, id < B.length ? id : AIR);
      }
    } catch (e) {}
  }
  function savePlot() {
    if (!client || !me || myPlot < 0 || !dirty) return;
    dirty = false;
    client.from('ark_village_plots').update({ data: encodePlot(myPlot), updated_at: new Date().toISOString() }).eq('user_id', me.id)
      .then(function (r) { setSave(r.error ? '저장 실패 — 다시 시도해요' : '저장됨'); if (r.error) { dirty = true; saveTimer = setTimeout(savePlot, 4000); } });
  }
  function setSave(t) { var el = $('saveState'); if (el) el.textContent = t; }
  function markPlots() {
    // 땅 모서리 기둥 색: 내 땅 노랑, 주인 있는 땅 흰색, 빈 땅은 표시 없음
    for (var i = 0; i < PCOLS * PROWS; i++) {
      var o = plotOrigin(i), id = i === myPlot ? 15 : (plotOwners[i] ? 11 : 0);
      if (!id) continue;
      [[-1, -1], [PLOT, -1], [-1, PLOT], [PLOT, PLOT]].forEach(function (c) { setRaw(o.x + c[0], G - 1, o.z + c[1], id); });
    }
  }

  // ───────── 화면 ─────────
  function $(id) { return document.getElementById(id); }
  var toastT = null;
  function toast(t) { var el = $('toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(function () { el.classList.remove('show'); }, 2200); }
  function placeName() {
    var x = Math.floor(P.x), y = Math.floor(P.y), z = Math.floor(P.z);
    if (x >= AX0 && x <= AX1 && z >= AZ0 && z <= AZ1 && y >= AY0 && y <= AY1 + 1) {
      if (y > AY1 - 1) return '방주 지붕';
      return y >= AY0 + 21 ? '방주 상층' : (y >= AY0 + 11 ? '방주 중층' : '방주 하층');
    }
    var p = plotAt(x, z);
    if (p >= 0) return p === myPlot ? '내 땅 (' + (p + 1) + '번)' : (p + 1) + '번 땅' + (plotOwners[p] ? '' : ' · 빈 땅');
    if (z < AZ0 + AW + 12 && z > AZ0 - 12) return '방주 앞';
    return '방주 마을';
  }
  function buildHotbar() {
    var bar = $('hotbar');
    HOTBAR.forEach(function (id, i) {
      var d = document.createElement('button'); d.className = 'slot'; d.title = B[id][0];
      var c1 = '#' + ('00000' + B[id][1].toString(16)).slice(-6), c2 = '#' + ('00000' + B[id][2].toString(16)).slice(-6);
      d.innerHTML = '<span style="background:linear-gradient(180deg,' + c1 + ' 0 38%,' + c2 + ' 38% 100%)"></span>';
      d.addEventListener('click', function () { setSel(i); });
      bar.appendChild(d);
    });
    setSel(0);
  }

  // ───────── 시작 ─────────
  function init() {
    var canvas = $('game');
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isTouch ? 1.75 : 2));
    scene = new THREE.Scene();
    var skyCol = new THREE.Color(0xa9d4ef);
    scene.background = skyCol; scene.fog = new THREE.Fog(0xbfe0f2, 70, 190);
    camera = new THREE.PerspectiveCamera(72, 1, 0.08, 260);
    opaqueMat = new THREE.MeshBasicMaterial({ vertexColors: true });
    glassMat = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.38, depthWrite: false });
    // 겨눈 블록 테두리
    var hl = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.004, 1.004, 1.004)), new THREE.LineBasicMaterial({ color: 0x1b2433, transparent: true, opacity: 0.85 }));
    scene.add(hl);
    // 해와 구름 몇 개(멀리 떠 있는 판)
    var sun = new THREE.Mesh(new THREE.CircleGeometry(9, 32), new THREE.MeshBasicMaterial({ color: 0xfff3c4, fog: false }));
    sun.position.set(SX / 2 + 120, 150, -120); sun.lookAt(SX / 2, 0, SZ / 2); scene.add(sun);
    var cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, fog: false });
    for (var c = 0; c < 14; c++) {
      var cl = new THREE.Mesh(new THREE.BoxGeometry(14 + rnd(c) * 20, 2, 8 + rnd(c + 5) * 10), cloudMat);
      cl.position.set(rnd(c + 11) * SX * 1.4 - SX * 0.2, 62 + rnd(c + 3) * 8, rnd(c + 17) * SZ * 1.6 - SZ * 0.3); scene.add(cl);
    }

    genWorld();
    bindInput(canvas); buildHotbar();
    $('btnJump').addEventListener('touchstart', function (e) { wantJump = true; e.preventDefault(); }, { passive: false });
    $('btnJump').addEventListener('click', function () { wantJump = true; });
    $('btnFly').addEventListener('click', toggleFly);
    $('btnMode').addEventListener('click', function () { setMode(mode === 'place' ? 'break' : 'place'); });
    $('btnHome').addEventListener('click', goHome);
    $('btnArk').addEventListener('click', function () { teleport(AX0 + AL / 2 + 0.5, G, AZ1 + 6, 0); toast('방주 문 앞이에요 — 문은 옆으로(창 6:16)'); });
    $('btnVerse').addEventListener('click', function () { $('verseBox').classList.toggle('show'); });
    function hold(btn, on) {
      btn.addEventListener('touchstart', function (e) { on(true); e.preventDefault(); }, { passive: false });
      btn.addEventListener('touchend', function () { on(false); }); btn.addEventListener('mousedown', function () { on(true); });
      btn.addEventListener('mouseup', function () { on(false); }); btn.addEventListener('mouseleave', function () { on(false); });
    }
    hold($('btnUp'), function (v) { flyUp = v; }); hold($('btnDown'), function (v) { flyDown = v; });
    if (isTouch) document.body.classList.add('touch');
    window.addEventListener('resize', resize); resize();

    loadOnline().then(function () {
      for (var z = 0; z < SZ; z++) for (var x = 0; x < SX; x++) updateSky(x, z);
      markPlots();
      for (var cy = 0; cy < CY; cy++) for (var cz = 0; cz < CZ; cz++) for (var cx = 0; cx < CX; cx++) buildChunk(cx, cy, cz);
      $('loading').style.display = 'none';
      if (!isTouch) $('lockHint').style.display = 'flex';
      if (myPlot >= 0) goHome(); else teleport(P.x, G, P.z, 0);
      var last = performance.now();
      (function loop(now) {
        var dt = Math.min(0.05, (now - last) / 1000); last = now;
        step(dt);
        var h = raycast(7); hl.visible = !!h; if (h) hl.position.set(h.x + 0.5, h.y + 0.5, h.z + 0.5);
        renderer.render(scene, camera);
        requestAnimationFrame(loop);
      })(last);
      setInterval(function () { $('place').textContent = placeName(); }, 300);
    });
  }
  function teleport(x, y, z, yaw) {
    P.x = x; P.z = z; P.y = y; P.vy = 0;
    while (collides(P.x, P.y, P.z) && P.y < SY) P.y += 1;
    if (yaw !== undefined) P.yaw = yaw; P.pitch = -0.1; P.camY = 0;
  }
  function goHome() {
    if (myPlot < 0) { toast(me ? '내 땅을 받는 중이에요' : '로그인하면 내 땅을 받을 수 있어요'); return; }
    var o = plotOrigin(myPlot); teleport(o.x + PLOT / 2, G, o.z - 1.5, Math.PI); toast('내 땅(' + (myPlot + 1) + '번)이에요. 마음껏 지어 보세요!');
  }
  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }

  var fwd = new THREE.Vector3();
  function step(dt) {
    var mx = 0, mz = 0;
    if (keys.KeyW || keys.ArrowUp) mz -= 1; if (keys.KeyS || keys.ArrowDown) mz += 1;
    if (keys.KeyA || keys.ArrowLeft) mx -= 1; if (keys.KeyD || keys.ArrowRight) mx += 1;
    mx += joy.x; mz += joy.y;
    var len = Math.hypot(mx, mz); if (len > 1) { mx /= len; mz /= len; }
    var run = keys.ShiftLeft && !P.fly ? 1.5 : 1, sp = (P.fly ? 9 : 4.6) * run;
    var sin = Math.sin(P.yaw), cos = Math.cos(P.yaw);
    var wx = (mx * cos + mz * sin) * sp, wz = (-mx * sin + mz * cos) * sp;
    // 부드럽게 붙는 가속
    var a = P.ground || P.fly ? 14 : 5;
    P.vx += (wx - P.vx) * Math.min(1, a * dt); P.vz += (wz - P.vz) * Math.min(1, a * dt);
    if (P.fly) {
      var vy = ((flyUp || keys.Space) ? 1 : 0) - ((flyDown || keys.ShiftLeft || keys.KeyC) ? 1 : 0);
      P.vy += (vy * 7 - P.vy) * Math.min(1, 10 * dt); wantJump = false;
    } else {
      P.vy -= 26 * dt; if (P.vy < -40) P.vy = -40;
      if (wantJump && P.ground) { P.vy = 8.4; }
      wantJump = false;
    }
    moveAxis(0, P.vx * dt); moveAxis(2, P.vz * dt);
    var hitY = moveAxis(1, P.vy * dt);
    P.ground = false;
    if (hitY) { if (P.vy < 0) P.ground = true; P.vy = 0; }
    else if (!P.fly && collides(P.x, P.y - 0.02, P.z)) P.ground = true;
    if (P.y < -10) teleport(P.x, G, P.z);
    // 턱 올라갈 때 카메라를 부드럽게
    P.camY += (0 - P.camY) * Math.min(1, 12 * dt);
    camera.position.set(P.x, P.y + EYE + P.camY, P.z);
    fwd.set(-Math.sin(P.yaw) * Math.cos(P.pitch), Math.sin(P.pitch), -Math.cos(P.yaw) * Math.cos(P.pitch));
    camera.lookAt(camera.position.x + fwd.x, camera.position.y + fwd.y, camera.position.z + fwd.z);
  }

  function loadOnline() {
    try {
      if (window.supabase && window.SUPABASE_URL) client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
    } catch (e) { client = null; }
    if (!client) return Promise.resolve();
    return client.auth.getSession().then(function (r) {
      me = r && r.data && r.data.session ? r.data.session.user : null;
      $('who').textContent = me ? '' : '구경 중 · 로그인하면 내 땅을 받아요';
      var claim = me ? client.rpc('claim_village_plot').then(function (c) { if (!c.error && c.data !== null) myPlot = c.data; }) : Promise.resolve();
      return claim.then(function () { return client.from('ark_village_plots').select('plot_idx,data,user_id'); });
    }).then(function (res) {
      (res && res.data || []).forEach(function (row) { plotOwners[row.plot_idx] = 1; if (row.data) decodePlot(row.plot_idx, row.data); });
      setSave(myPlot >= 0 ? '내 땅 ' + (myPlot + 1) + '번' : '');
    }).catch(function () { toast('인터넷이 약해서 다른 사람 집을 못 불러왔어요'); });
  }
  window.addEventListener('beforeunload', function () { if (dirty) savePlot(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden && dirty) savePlot(); });

  window.__arkDebug = { P: P, teleport: teleport };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
