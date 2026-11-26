  // ════════ 2026-11-26 땅속 세 곳: 갑바도기아 지하 마을 · 아둘람 굴 · 오바댜가 숨긴 굴 ════════
  // 전도사님: 「지하교회? 지하마을 이런 것도」 → 먼 땅 쪽, 3번(지하 마을) + 1번(오바댜의 굴) + 2번(아둘람 굴).
  // - 갑바도기아 지하 마을: 소아시아(북쪽 먼 땅). 실제 모델은 카파도키아의 지하 도시(데린쿠유) — 부드러운 화산재 바위를 파서
  //   여러 층에 우물·창고·부엌·예배실을 두고 굴리는 돌문으로 막았다. 성경엔 갑바도기아의 「흩어진 나그네」(벧전 1:1)가 나온다.
  //   (로마 카타콤은 원래 무덤이라 「숨어 살던 곳」으로 쓰지 않는다.)
  // - 아둘람 굴(삼상 22:1-2): 유다 산지, 베들레헴 서남쪽. 다윗과 모여든 사백 명.
  // - 오바댜가 숨긴 굴(왕상 18:4): 북이스라엘 산속, 오십 명씩 두 굴. 오바댜에게 떡 열 개와 물 두 동이를 가져다주는 부탁.
  // - 사람들의 말은 성경 구절만(개역개정, bskorea 2026-11-26 대조). 세 곳 모두 지켜지는 곳(LANDMARKS)이라 부서지지 않는다.
  var CAPX = 5591, CAPZ = 750, ADUX = 3897, ADUZ = 6097, OBAX = 4205, OBAZ = 3567;
  var TUFF = LIMESTONE;   // 화산재 바위 대신 밝은 석회암
  function caveNear(x0, z0, cx, cz, r) { return cx + r >= x0 && cx - r < x0 + CS && cz + r >= z0 && cz - r < z0 + CS; }
  function caveTop(x, z) { terrain(x, z); return Math.max(T.h, T.wtop); }
  // 이 기둥 안에서만, 땅 표면 2칸 아래까지 바위로 채운다(굴·광석이 끼어들지 않게)
  function caveShell(x0, z0, ax0, az0, ax1, az1, yb, yt, id) {
    var X0 = Math.max(ax0, x0), X1 = Math.min(ax1, x0 + CS - 1), Z0 = Math.max(az0, z0), Z1 = Math.min(az1, z0 + CS - 1);
    for (var z = Z0; z <= Z1; z++) for (var x = X0; x <= X1; x++) { var t = Math.min(yt, caveTop(x, z) - 2); if (t >= yb) fbox(x, yb, z, x, t, z, id); }
  }
  function room(x0, z0, x1, z1, f, h, floor) { fbox(x0, f, z0, x1, f, z1, floor || TUFF); fbox(x0, f + 1, z0, x1, f + h, z1, AIR); }
  // 계단 굴: (sx,sz)에서 (dx,dz) 방향으로 n칸, 한 칸마다 1칸씩 내려감(1칸 턱은 저절로 오른다). 폭 3, 높이 4
  function ramp(sx, sz, dx, dz, n, fTop) {
    for (var k = 0; k < n; k++) {
      var x = sx + dx * k, z = sz + dz * k, f = fTop - k - 1, px = dz !== 0 ? 1 : 0, pz = dx !== 0 ? 1 : 0;
      fbox(x - px, f, z - pz, x + px, f, z + pz, TUFF); fbox(x - px, f + 1, z - pz, x + px, f + 4, z + pz, AIR);
      if (k % 4 === 2) setRaw(x + px * 2, f + 3, z + pz * 2, LANTERN);
    }
  }
  // 굴리는 돌문(데린쿠유): 통로 옆 벽에 둥근 돌을 비켜 세워 둔 모양
  function rollStone(x, f, z, alongX) {
    [[0, 1], [0, 2], [0, 3], [-1, 2], [1, 2]].forEach(function (q) { setRaw(x + (alongX ? q[0] : 0), f + q[1], z + (alongX ? 0 : q[0]), STONE); });
  }
  // 요정 굴뚝 바위(갑바도기아 들판): 원뿔 기둥 + 검은 머리돌
  function chimney(x, z, h, r, door) {
    var b = caveTop(x, z);
    for (var y = 0; y <= h; y++) {
      var rr = r * Math.pow(1 - y / (h + 1), 0.7);
      for (var dz = -r; dz <= r; dz++) for (var dx = -r; dx <= r; dx++) if (dx * dx + dz * dz <= rr * rr + 0.3) setRaw(x + dx, b + y, z + dz, TUFF);
    }
    fbox(x - 1, b + h + 1, z - 1, x + 1, b + h + 1, z + 1, BASALT); setRaw(x, b + h + 2, z, BASALT);
    var wy = b + Math.round(h * 0.55); setRaw(x + r - 1, wy, z, AIR); setRaw(x + r - 2, wy, z, AIR); setRaw(x, wy, z - r + 1, AIR);   // 파낸 창
    if (door) { fbox(x - 1, b + 1, z - 1, x + 1, b + 3, z + 1, AIR); fbox(x + 1, b + 1, z, x + r + 1, b + 3, z, AIR); }
  }

  // ───────── 갑바도기아 지하 마을 ─────────
  var CAP_S = -1;
  function capS() { if (CAP_S < 0) CAP_S = caveTop(CAPX + 17, CAPZ); return CAP_S; }   // 들어가는 굴뚝 자리 땅 높이
  function capLevels() { var s = capS(); return { s: s, f1: s - 9, f2: s - 17, f3: s - 25 }; }
  var CAP_CHIMNEYS = [[17, 0, 11, 4, 1], [6, -16, 13, 4], [-8, -19, 9, 3], [-20, -6, 12, 4], [-16, 12, 10, 3], [3, 21, 14, 4], [20, 15, 9, 3], [-30, 20, 11, 3], [28, -12, 12, 4]];
  function buildCappadocia(x0, z0) {
    var X = CAPX, Z = CAPZ, L = capLevels(), s = L.s, f1 = L.f1, f2 = L.f2, f3 = L.f3;
    if (!caveNear(x0, z0, X, Z, 52)) return;
    // 땅 위: 요정 굴뚝 바위들(첫째가 들어가는 문)
    CAP_CHIMNEYS.forEach(function (c) { if (caveNear(x0, z0, X + c[0], Z + c[1], c[3] + 3)) chimney(X + c[0], Z + c[1], c[2], c[3], c[4]); });
    // 바위 속을 단단하게
    caveShell(x0, z0, X - 40, Z - 10, X + 24, Z + 32, f3 - 2, s - 3, TUFF);
    // 1층(f1): 큰 방 + 북쪽 마구간 + 남쪽 곡식 창고 + 서쪽 부엌
    room(X - 4, Z - 5, X + 6, Z + 5, f1, 4);
    room(X - 3, Z - 13, X + 5, Z - 7, f1, 3); fbox(X - 1, f1 + 1, Z - 6, X + 1, f1 + 3, Z - 6, AIR);   // 마구간
    fbox(X - 3, f1 + 1, Z - 13, X + 5, f1 + 1, Z - 13, THATCH); setRaw(X + 4, f1 + 1, Z - 11, THATCH); setRaw(X - 2, f1 + 1, Z - 9, LANTERN);
    room(X + 8, Z - 4, X + 14, Z - 2, f1, 3); fbox(X + 7, f1 + 1, Z - 3, X + 7, f1 + 3, Z - 3, AIR);   // 곡식 창고(동북)
    for (var j = 0; j < 6; j++) setRaw(X + 9 + j, f1 + 1, Z - 4, JAR); setRaw(X + 14, f1 + 1, Z - 2, CHEST); setRaw(X + 9, f1 + 1, Z - 2, LANTERN);
    room(X - 13, Z - 4, X - 6, Z + 2, f1, 3); fbox(X - 5, f1 + 1, Z - 2, X - 5, f1 + 3, Z, AIR);   // 부엌
    setRaw(X - 12, f1 + 1, Z - 4, OVEN); setRaw(X - 10, f1 + 1, Z - 4, COOK_POT); setRaw(X - 8, f1 + 1, Z - 4, OIL_PRESS); setRaw(X - 12, f1 + 1, Z + 2, JAR); setRaw(X - 7, f1 + 1, Z + 2, LANTERN);
    [[X - 4, Z - 5], [X + 6, Z - 5], [X - 4, Z + 5], [X + 6, Z + 5]].forEach(function (q) { setRaw(q[0], f1 + 1, q[1], LANTERN); });
    // 들어가는 계단(동쪽 굴뚝 안 → 1층 큰 방 동쪽)
    ramp(X + 16, Z, -1, 0, s - f1, s + 1); fbox(X + 7, f1, Z - 1, X + 7, f1, Z + 1, TUFF); fbox(X + 7, f1 + 1, Z - 1, X + 7, f1 + 4, Z + 1, AIR);
    rollStone(X + 7, f1, Z - 3, true);
    // 2층(f2): 남쪽으로 내려가는 계단 → 가운데 방, 동쪽 집, 서쪽 포도주 틀, 남쪽 우물 방(공기 구멍)
    ramp(X + 1, Z + 6, 0, 1, f1 - f2, f1 + 1);
    rollStone(X - 2, f2, Z + 13, false);
    room(X - 5, Z + 14, X + 5, Z + 24, f2, 4);
    room(X + 8, Z + 15, X + 15, Z + 21, f2, 3); fbox(X + 6, f2 + 1, Z + 17, X + 7, f2 + 3, Z + 18, AIR);   // 집
    setRaw(X + 14, f2 + 1, Z + 16, BED); setRaw(X + 14, f2 + 1, Z + 20, BED); setRaw(X + 10, f2 + 1, Z + 21, CHAIR); setRaw(X + 9, f2 + 1, Z + 15, LANTERN); setRaw(X + 12, f2 + 1, Z + 21, LOOM);
    room(X - 6, Z + 26, X + 4, Z + 30, f2, 3); fbox(X - 1, f2 + 1, Z + 25, X + 1, f2 + 3, Z + 25, AIR);   // 우물 방
    setRaw(X - 1, f2 + 1, Z + 28, WELL); setRaw(X + 3, f2 + 1, Z + 29, JAR); setRaw(X - 5, f2 + 1, Z + 27, LANTERN);
    for (var vy = f2 + 4; vy <= s + 1; vy++) setRaw(X - 1, vy, Z + 28, AIR);   // 공기 구멍(땅 위까지)
    var ty = caveTop(X - 1, Z + 28); fbox(X - 2, ty, Z + 27, X, ty, Z + 29, TUFF); setRaw(X - 1, ty, Z + 28, AIR);
    room(X - 14, Z + 14, X - 8, Z + 18, f2, 3); fbox(X - 7, f2 + 1, Z + 15, X - 6, f2 + 3, Z + 16, AIR);   // 포도주 틀
    setRaw(X - 13, f2 + 1, Z + 14, WINE_PRESS); setRaw(X - 11, f2 + 1, Z + 14, JAR); setRaw(X - 9, f2 + 1, Z + 18, LANTERN);
    [[X - 5, Z + 14], [X + 5, Z + 14], [X - 5, Z + 24], [X + 5, Z + 24]].forEach(function (q) { setRaw(q[0], f2 + 1, q[1], LANTERN); });
    // 3층(f3): 서쪽으로 내려가 예배실(십자 모양), 서쪽 벽에 물고기 표시
    ramp(X - 6, Z + 21, -1, 0, f2 - f3, f2 + 1);
    room(X - 36, Z + 14, X - 14, Z + 24, f3, 6);   // 본당
    room(X - 28, Z + 9, X - 22, Z + 29, f3, 5);    // 날개(십자)
    for (var bx = X - 32; bx <= X - 16; bx += 3) { fbox(bx, f3 + 1, Z + 15, bx, f3 + 1, Z + 18, SLAB_G); fbox(bx, f3 + 1, Z + 20, bx, f3 + 1, Z + 23, SLAB_G); }
    setRaw(X - 35, f3 + 1, Z + 19, LAMPSTAND); fbox(X - 36, f3 + 1, Z + 17, X - 36, f3 + 1, Z + 21, TUFF);
    var FISH = ['...XXX...X', '.XX...X.X.', 'X......X..', '.XX...X.X.', '...XXX...X'];
    FISH.forEach(function (row, r) { for (var c = 0; c < row.length; c++) if (row[c] === 'X') setRaw(X - 37, f3 + 6 - r, Z + 14 + c, BASALT); });
    [[X - 34, Z + 14], [X - 34, Z + 24], [X - 24, Z + 14], [X - 24, Z + 24], [X - 16, Z + 14], [X - 16, Z + 24], [X - 25, Z + 9], [X - 25, Z + 29]].forEach(function (q) { setRaw(q[0], f3 + 4, q[1], LANTERN); });
    // 숨은 방: 예배실 남쪽, 굴리는 돌 뒤
    room(X - 21, Z + 27, X - 16, Z + 31, f3, 3); fbox(X - 19, f3 + 1, Z + 25, X - 18, f3 + 3, Z + 26, AIR); rollStone(X - 20, f3, Z + 25, true);
    setRaw(X - 16, f3 + 1, Z + 31, CHEST); setRaw(X - 21, f3 + 1, Z + 27, OIL_LAMP);
  }

  // ───────── 아둘람 굴 ─────────
  var ADU_S = -1;
  function aduF() { if (ADU_S < 0) ADU_S = caveTop(ADUX, ADUZ); return ADU_S - 8; }
  function caveHall(x0, z0, cx, cz, rx, rz, f, hMax, seed) {   // 둥근 굴 방: 가운데가 높은 둥근 천장
    for (var dz = -rz - 2; dz <= rz + 2; dz++) for (var dx = -rx - 2; dx <= rx + 2; dx++) {
      var x = cx + dx, z = cz + dz; if (x < x0 || x >= x0 + CS || z < z0 || z >= z0 + CS) continue;
      var e = (dx * dx) / (rx * rx) + (dz * dz) / (rz * rz), wob = (hash2(x, z, seed) - 0.5) * 0.25;
      if (e + wob < 1) {
        var h = 3 + Math.round((hMax - 3) * Math.sqrt(Math.max(0, 1 - e)));
        h = Math.min(h, caveTop(x, z) - f - 3); if (h < 3) h = 3;   // 천장이 땅 위로 뚫리지 않게
        setRaw(x, f, z, hash2(x, z, seed + 1) < 0.3 ? DIRT : STONE); fbox(x, f + 1, z, x, f + h, z, AIR);
      }
    }
  }
  function buildAdullam(x0, z0) {
    var X = ADUX, Z = ADUZ;
    if (!caveNear(x0, z0, X, Z, 40)) return;
    var f = aduF(), s = f + 8;
    caveShell(x0, z0, X - 22, Z - 16, X + 30, Z + 16, f - 2, s, STONE);
    caveHall(x0, z0, X, Z, 17, 11, f, 7, 121);
    caveHall(x0, z0, X - 14, Z + 9, 6, 5, f, 4, 122);   // 곁방
    caveHall(x0, z0, X + 4, Z - 12, 6, 4, f, 4, 123);
    // 굴 입구: 동쪽 언덕에서 서쪽으로 내려옴
    var et = caveTop(X + 27, Z), an = Math.max(1, et - f); ramp(X + 27, Z, -1, 0, an, et + 1);
    if (X + 27 - an >= X + 14) { fbox(X + 14, f, Z - 1, X + 27 - an, f, Z + 1, STONE); fbox(X + 14, f + 1, Z - 1, X + 27 - an, f + 4, Z + 1, AIR); }
    fbox(X + 28, et + 1, Z - 2, X + 28, et + 4, Z + 2, AIR);
    setRaw(X + 26, et, Z - 2, STONE); setRaw(X + 26, et + 1, Z - 2, STONE); setRaw(X + 26, et, Z + 2, STONE); setRaw(X + 26, et + 1, Z + 2, STONE);
    [[X - 6, Z - 2], [X + 7, Z + 3], [X - 14, Z + 9]].forEach(function (q) { setRaw(q[0], f + 1, q[1], CAMPFIRE); });
    [[X - 9, Z - 6], [X + 10, Z - 5], [X + 2, Z + 8], [X + 4, Z - 12], [X - 16, Z + 6]].forEach(function (q) { setRaw(q[0], f + 1, q[1], LANTERN); });
    [[X - 3, Z + 6], [X + 12, Z + 4], [X - 12, Z - 3], [X + 6, Z - 14]].forEach(function (q) { setRaw(q[0], f + 1, q[1], JAR); });
    [[X - 4, Z - 4], [X + 2, Z - 5], [X + 9, Z + 1], [X - 10, Z + 2], [X + 5, Z + 6]].forEach(function (q) { fbox(q[0], f + 1, q[1], q[0] + 1, f + 1, q[1], CARPET); });
  }

  // ───────── 오바댜가 숨긴 굴(오십 명씩 두 굴) ─────────
  var OBA_CAVES = [[OBAX - 26, OBAZ, 127], [OBAX + 26, OBAZ + 4, 128]], OBA_F = {};
  function obaF(i) { if (OBA_F[i] === undefined) OBA_F[i] = caveTop(OBA_CAVES[i][0], OBA_CAVES[i][1]) - 7; return OBA_F[i]; }
  function buildObadiah(x0, z0) {
    if (!caveNear(x0, z0, OBAX, OBAZ, 50)) return;
    OBA_CAVES.forEach(function (c, i) {
      var X = c[0], Z = c[1], f = obaF(i), dir = i === 0 ? 1 : -1;   // 입구는 두 굴 사이 쪽
      if (!caveNear(x0, z0, X, Z, 24)) return;
      var ex = X + dir * 18; caveShell(x0, z0, Math.min(X - 14, ex - 4), Z - 11, Math.max(X + 14, ex + 4), Z + 11, f - 2, f + 9, STONE);
      caveHall(x0, z0, X, Z, 11, 8, f, 5, c[2]);
      var et = caveTop(ex, Z), on = Math.max(1, et - f); ramp(ex, Z, -dir, 0, on, et + 1);
      var ce = ex - dir * on, ci = X + dir * 8; fbox(Math.min(ce, ci), f, Z - 1, Math.max(ce, ci), f, Z + 1, STONE); fbox(Math.min(ce, ci), f + 1, Z - 1, Math.max(ce, ci), f + 4, Z + 1, AIR);
      [[X - 6, Z - 4], [X + 6, Z + 4], [X - 5, Z + 5], [X + 5, Z - 5]].forEach(function (q) { setRaw(q[0], f + 1, q[1], OIL_LAMP); });
      [[X - 8, Z], [X + 8, Z - 2], [X, Z + 6]].forEach(function (q) { setRaw(q[0], f + 1, q[1], JAR); });
    });
  }
  FAR_BUILD_EXTRA.push(buildCappadocia, buildAdullam, buildObadiah);

  // ───────── 사람 ─────────
  function caveNpcs() {
    var L = capLevels(), fa = aduF(), o0 = obaF(0), o1 = obaF(1);
    var V = {
      scattered: ['예수 그리스도의 사도 베드로는 본도, 갈라디아, 갑바도기아, 아시아와 비두니아에 흩어진 나그네', '베드로전서 1:1'],
      gather: ['모이기를 폐하는 어떤 사람들의 습관과 같이 하지 말고 오직 권하여 그 날이 가까움을 볼수록 더욱 그리하자', '히브리서 10:25'],
      joy: ['그러므로 너희가 이제 여러 가지 시험으로 말미암아 잠깐 근심하게 되지 않을 수 없으나 오히려 크게 기뻐하는도다', '베드로전서 1:6'],
      well: ['내가 주는 물을 마시는 자는 영원히 목마르지 아니하리니 내가 주는 물은 그 속에서 영생하도록 솟아나는 샘물이 되리라', '요한복음 4:14'],
      press: ['우리가 사방으로 욱여쌈을 당하여도 싸이지 아니하며 답답한 일을 당하여도 낙심하지 아니하며', '고린도후서 4:8'],
      dav: ['하나님이여 내게 은혜를 베푸소서 내게 은혜를 베푸소서 내 영혼이 주께로 피하되 주의 날개 그늘 아래에서 이 재앙들이 지나기까지 피하리이다', '시편 57:1'],
      fam: ['그러므로 다윗이 그 곳을 떠나 아둘람 굴로 도망하매 그의 형제와 아버지의 온 집이 듣고 그리로 내려가서 그에게 이르렀고', '사무엘상 22:1'],
      four: ['환난 당한 모든 자와 빚진 모든 자와 마음이 원통한 자가 다 그에게로 모였고 그는 그들의 우두머리가 되었는데 그와 함께 한 자가 사백 명 가량이었더라', '사무엘상 22:2'],
      refuge: ['하나님은 우리의 피난처시요 힘이시니 환난 중에 만날 큰 도움이시라', '시편 46:1'],
      portion: ['여호와여 내가 주께 부르짖어 말하기를 주는 나의 피난처시요 살아 있는 사람들의 땅에서 나의 분깃이시라 하였나이다', '시편 142:5'],
      oba: ['이세벨이 여호와의 선지자들을 죽일 때에 내가 여호와의 선지자 중에 백 명을 오십 명씩 굴에 숨기고 떡과 물로 먹인 일이 내 주에게 들리지 아니하였나이까', '열왕기상 18:13']
    };
    function n(name, x, z, y, emoji, look, v) { return { name: name, x: x, z: z, y: y, emoji: emoji, look: look, text: V[v][0], ref: V[v][1] }; }
    var cx = CAPX, cz = CAPZ, ax = ADUX, az = ADUZ;
    var plain = function (c1, c2, style, extra) { var o = { robe: c1, robe2: c1, belt: 0x5a3a20, trim: c2, skin: 0xc68a60, hair: 0x2b1d14, sandal: 0x6b4425, style: style || 'short' }; for (var k in extra || {}) o[k] = extra[k]; return o; };
    return [
      n('흩어진 나그네', cx + 1, cz, L.f1 + 1, '🧳', plain(0x7a6a52, 0x4a3a28, 'scarf', { scarf: 0xd8c8a8, fit: { staff: 0x8a6236 } }), 'scattered'),
      n('굴리는 돌을 지키는 사람', cx + 9, cz + 3, L.f1 + 1, '🪨', plain(0x6a6a6a, 0x3a3a3a, 'short', { fit: { beard: 0x2b1d14 } }), 'press'),
      n('우물 긷는 사람', cx + 1, cz + 28, L.f2 + 1, '🪣', plain(0x5a7a90, 0x3a5a70, 'scarf', { scarf: 0xe8e0c8 }), 'well'),
      n('예배하는 성도', cx - 33, cz + 16, L.f3 + 1, '🙏', plain(0xe8e2d2, 0x8a6a3a, 'scarf', { scarf: 0xf2efe4 }), 'gather'),
      n('찬송하는 성도', cx - 20, cz + 12, L.f3 + 1, '🎶', plain(0x8a5a6a, 0x5a3a4a, 'scarf', { scarf: 0xd8c8a8 }), 'joy'),
      n('다윗', ax - 2, az, fa + 1, '🎵', plain(0xb04a3a, 0xe0b040, 'short', { fit: { beard: 0x6a3a1a, sash: 0xe0b040 } }), 'dav'),
      n('다윗의 형제', ax + 5, az - 4, fa + 1, '👥', plain(0x6a5a3a, 0x3a2a1a, 'short', { fit: { beard: 0x2b1d14 } }), 'fam'),
      n('환난 당한 사람', ax - 8, az + 4, fa + 1, '🧎', plain(0x6a6258, 0x4a4238, 'short', { fit: { beard: 0x1e1610 } }), 'four'),
      n('빚진 사람', ax + 9, az + 5, fa + 1, '🪙', plain(0x7a6a5a, 0x4a3a2a, 'short', {}), 'four'),
      n('마음이 원통한 사람', ax - 12, az - 4, fa + 1, '💧', plain(0x5a5a6a, 0x3a3a4a, 'scarf', { scarf: 0xc8c0b0 }), 'portion'),
      n('오바댜', OBAX, OBAZ + 3, undefined, '🍞', plain(0x7a3a8a, 0xe0b040, 'long', { belt: 0xe0b040, fit: { beard: 0x2b1d14, sash: 0xe0b040 } }), 'oba'),
      n('숨은 선지자', OBA_CAVES[0][0] - 3, OBA_CAVES[0][1] + 1, o0 + 1, '📜', plain(0x8a7a5a, 0x5a4a30, 'long', { fit: { beard: 0xd8d0c0 } }), 'refuge'),
      n('숨은 선지자', OBA_CAVES[0][0] + 4, OBA_CAVES[0][1] - 3, o0 + 1, '📜', plain(0x6a6a5a, 0x4a4a3a, 'long', { fit: { beard: 0x2b1d14 } }), 'portion'),
      n('숨은 선지자', OBA_CAVES[1][0] + 3, OBA_CAVES[1][1] - 1, o1 + 1, '📜', plain(0x7a6a52, 0x4a3a28, 'long', { fit: { beard: 0xd8d0c0 } }), 'portion'),
      n('숨은 선지자', OBA_CAVES[1][0] - 4, OBA_CAVES[1][1] + 3, o1 + 1, '📜', plain(0x5a5a4a, 0x3a3a2a, 'long', { fit: { beard: 0x2b1d14 } }), 'refuge')
    ];
  }
  var CAVE_NPCS_DONE = false;
  function addCaveNpcs() { if (CAVE_NPCS_DONE) return; CAVE_NPCS_DONE = true; caveNpcs().forEach(function (d) { NPC_DEFS.push(d); FAR_NPCS.push(d); }); }

  // 오바댜의 부탁: 떡 열 개와 물 두 동이(왕상 18:4)
  function obadiahQuest() {
    if (ADV.done.obadiah_feed && !isAdm()) { $('cardNew').textContent = '🍞 굴에 숨은 선지자들이 떡과 물을 먹었어요 (왕상 18:4)'; return; }
    var breads = have(BREAD) + have(FLATBREAD), water = have(FULL_JAR) + have(WATER_BUCKET);
    if (!isAdm() && (breads < 10 || water < 2)) { $('cardNew').textContent = '굴에 숨은 선지자들에게 떡 열 개와 물 두 동이(물이 든 물동이·양동이)를 가져와 주세요 (지금 떡 ' + breads + '/10 · 물 ' + water + '/2)'; return; }
    if (!isAdm()) {
      var nb = 10; [BREAD, FLATBREAD].forEach(function (id) { var t = Math.min(nb, have(id)); if (t > 0) { take(id, t); nb -= t; } });
      var nw = 2; [FULL_JAR, WATER_BUCKET].forEach(function (id) { var t = Math.min(nw, have(id)); if (t > 0) { take(id, t); give(id === FULL_JAR ? WATER_JAR : BUCKET, t); nw -= t; } });
      bagChanged();
    }
    advDone('obadiah_feed');
  }

  // ───────── 지역 카드·찾기·모험 ─────────
  (function () {
    var cx = CAPX, cz = CAPZ;
    REGION_INFO.capp = ['갑바도기아 지하 마을', '(이런 사람은 세상이 감당하지 못하느니라) 그들이 광야와 산과 동굴과 토굴에 유리하였느니라', '히브리서 11:38'];
    REGION_INFO.adullam = ['아둘람 굴', '그러므로 다윗이 그 곳을 떠나 아둘람 굴로 도망하매 그의 형제와 아버지의 온 집이 듣고 그리로 내려가서 그에게 이르렀고', '사무엘상 22:1'];
    REGION_INFO.obadiah = ['오바댜가 숨긴 굴', '이세벨이 여호와의 선지자들을 멸할 때에 오바댜가 선지자 백 명을 가지고 오십 명씩 굴에 숨기고 떡과 물을 먹였더라', '열왕기상 18:4'];
    LANDMARKS.unshift({ k: 'capp', x0: cx - 42, z0: cz - 26, x1: cx + 34, z1: cz + 36, flat: 0, far: 1 });
    LANDMARKS.unshift({ k: 'adullam', x0: ADUX - 24, z0: ADUZ - 18, x1: ADUX + 31, z1: ADUZ + 18, flat: 0, far: 1 });
    LANDMARKS.unshift({ k: 'obadiah', x0: OBAX - 42, z0: OBAZ - 14, x1: OBAX + 50, z1: OBAZ + 18, flat: 0, far: 1 });
    FAR_INFO.capp = { label: '🕳 갑바도기아 지하 마을', x: cx, z: cz, rumor: '해 뜨는 쪽 큰 숲보다 더 북쪽, 바닷가 언덕에 뾰족한 바위 기둥이 서 있대요. 그 땅속에 여러 층으로 판 마을이 있대요.' };
    FAR_INFO.adullam = { label: '🪨 아둘람 굴', x: ADUX, z: ADUZ, rumor: '베들레헴에서 해 지는 쪽 언덕으로 가면, 다윗이 숨었던 큰 굴이 있대요.' };
    FAR_INFO.obadiah = { label: '🍞 오바댜가 숨긴 굴', x: OBAX, z: OBAZ, rumor: '나사렛과 수가 사이 산속에, 선지자들이 오십 명씩 숨은 굴 두 개가 있대요.' };
    CAVE_KEYS.push('capp', 'adullam', 'obadiah');
    ADVS.push(
      ['far_capp', '🕳 갑바도기아 지하 마을 찾기', '뾰족한 바위 기둥이 선 땅속 마을을 찾아요 — 맨 아래층에 예배실이 있어요', [[ING_AG, 3], [LANTERN, 4]], ['🕳', '흩어진 나그네', '예수 그리스도의 사도 베드로는 본도, 갈라디아, 갑바도기아, 아시아와 비두니아에 흩어진 나그네', '베드로전서 1:1']],
      ['far_adullam', '🪨 아둘람 굴 찾기', '다윗과 사백 명이 모였던 굴을 찾아요', [[ING_AG, 2], [BREAD, 6]], ['🪨', '나의 피난처', '여호와여 내가 주께 부르짖어 말하기를 주는 나의 피난처시요 살아 있는 사람들의 땅에서 나의 분깃이시라 하였나이다', '시편 142:5']],
      ['far_obadiah', '🍞 오바댜가 숨긴 굴 찾기', '선지자들이 오십 명씩 숨은 굴을 찾아요', [[ING_AG, 2], [OIL_LAMP, 2]], null],
      ['obadiah_feed', '🍞 굴 속 선지자 먹이기', '오바댜에게 떡 열 개와 물 두 동이를 가져다줘요(왕상 18:4)', [[GEM_SAPH, 1], [ING_AU, 1]], ['🍞', '여호와를 경외하는 자', '아합이 왕궁 맡은 자 오바댜를 불렀으니 이 오바댜는 여호와를 지극히 경외하는 자라', '열왕기상 18:3']],
      ['far_caves', '🕯 동굴과 토굴', '땅속 세 곳(갑바도기아 지하 마을·아둘람 굴·오바댜가 숨긴 굴)을 모두 찾아요', [[GEM_DIA, 1], [ING_AU, 2]], ['🕯', '동굴과 토굴', '(이런 사람은 세상이 감당하지 못하느니라) 그들이 광야와 산과 동굴과 토굴에 유리하였느니라', '히브리서 11:38']]
    );
    addCaveNpcs();
    farLabels();
  })();
