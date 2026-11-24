  // ════════ 2026-11-24 이스라엘: 예루살렘·베들레헴·나사렛·가버나움 (11/25 고증 보강: 수가·베다니·옛길 더함) ════════
  // 전도사님: 「이스라엘도 만드는거지 · 당시를 최대한 복원해서 디테일하게」 → 시대 「둘 다(구역을 나눠서)」, 찾기 「숨겨서」, 마을 베들레헴·나사렛·가버나움
  //   11/25 「다 확인해서 고치고 골고다 길, 베들레헴 가는길, 사마리아 여인을 만났던 곳, 등등 … 다 고증과 최대한 맞춰」 → WBC·옥스포드 주석서 쪽수로 확인해 고침
  // 성경에 치수가 있는 것은 1규빗 = 1칸 그대로: 성전 60×20×30·주랑 20×10(왕상 6:2-3), 내소 20×20×20(6:20), 곁방 세 층(6:5-10),
  //   안뜰 돌 세 켜 + 백향목 한 켜(6:36), 놋기둥 18 + 머리 5(7:15-16), 놋바다 지름 10·높이 5·소 열둘(7:23-25), 물두멍 받침 4×4×3 열(7:27, 7:39),
  //   놋 제단 20×20×10(대하 4:1), 기둥 주랑 50×30(왕상 7:6), 레바논 나무 궁 100×50×30·백향목 기둥 네 줄(7:2), 보좌는 재판하는 주랑에(7:7), 여섯 층계와 사자 열넷(10:18-20)
  // 다윗 시대(다윗의 집·밀로·물 긷는 데), 솔로몬 시대(성전·궁), 예수님 시대(헤롯 궁 관정·가바다·골고다 길·베데스다·실로암·다락방·골고다·빈 무덤·겟세마네·베다니)를
  //   지역 카드에 적어 구분한다. 예수님 시대 성전은 헤롯 성전이므로 시므온·안나는 솔로몬 성전에 세우지 않는다.
  // 예수님은 사람(마을 사람)으로 만들지 않는다. 사람들의 말과 카드는 성경 구절만(개역개정 원문 대조, bskorea 2026-11-24·25).
  var JC = FAR_CITIES.filter(function (c) { return c.k === 'jerusalem'; })[0];
  var JY = JC.y + 1, JT = JY + 5, TZC = JZ - 45;   // 예루살렘 바닥 · 성전 산 위 · 성전 가운데 줄
  var HX0 = JX - 8, HX1 = JX + 51, HZ0 = TZC - 10, HZ1 = TZC + 9;   // 성전 안(서쪽 20칸 지성소, 동쪽 40칸 성소)
  var BC = FAR_CITIES.filter(function (c) { return c.k === 'bethlehem'; })[0], NC0 = FAR_CITIES.filter(function (c) { return c.k === 'nazareth'; })[0], CC = FAR_CITIES.filter(function (c) { return c.k === 'capernaum'; })[0];
  function topAt(x, z) { terrain(x, z); return Math.max(T.h, T.wtop); }
  function ring(x0, z0, x1, z1, y0, y1, id) { fbox(x0, y0, z0, x1, y1, z0, id); fbox(x0, y0, z1, x1, y1, z1, id); fbox(x0, y0, z0, x0, y1, z1, id); fbox(x1, y0, z0, x1, y1, z1, id); }
  function oliveTree(x, y, z) {   // 감람나무: 굵고 낮은 줄기, 둥글고 넓은 잎
    fbox(x, y, z, x, y + 2, z, LOG); setRaw(x + (hash2(x, z, 91) < 0.5 ? 1 : -1), y + 2, z, LOG);
    for (var dy = 3; dy <= 5; dy++) for (var dz = -3; dz <= 3; dz++) for (var dx = -3; dx <= 3; dx++) {
      var rr = dy === 4 ? 3 : 2; if (dx * dx + dz * dz > rr * rr + 1) continue;
      if (get2(x + dx, y + dy, z + dz) === AIR && hash2(x + dx * 3, z + dz * 5 + dy, 92) < 0.92) setRaw(x + dx, y + dy, z + dz, LEAF);
    }
  }
  function cityGround(c, top) {   // 높은 터: 석회암 바위 위 흙 (예루살렘은 남쪽이 더 길다: zs)
    var m = c.r + 7, ms = (c.zs || c.r) + 7;
    fbox(c.x - m, FB, c.z - m, c.x + m, SY - 1, c.z + ms, AIR);
    fbox(c.x - m, G - 6, c.z - m, c.x + m, FB - 2, c.z + ms, LIMESTONE);
    fbox(c.x - m, FB - 1, c.z - m, c.x + m, FB - 1, c.z + ms, top);
  }
  // 지붕 난간(신 22:8)과 바깥 계단이 있는 집
  function roofHouse(x0, z0, w, d, h, wall, seed) {
    var door = hash2(seed, 5, 93) < 0.5 ? 'n' : 's';
    farHouse(x0, z0, w, d, h, wall, wall, door, seed);
    var top = FB + h;
    ring(x0, z0, x0 + w - 1, z0 + d - 1, top, top, wall);
    if (hash2(seed, 6, 94) < 0.6) {   // 동쪽 벽을 따라 지붕으로 오르는 돌계단
      for (var k = 0; k < h; k++) fbox(x0 + w, FB, z0 + 1 + k, x0 + w, FB + k, z0 + 1 + k, wall);
      setRaw(x0 + w - 1, top, z0 + h, AIR); setRaw(x0 + w - 1, top, z0 + h - 1, AIR);
    }
  }
  function lotGrid(xs, zs, skip, fn) { xs.forEach(function (lx) { zs.forEach(function (lz) { if (!skip(lx, lz)) fn(lx, lz); }); }); }

  // ───────── 예루살렘 ─────────
  function buildTemple() {
    var X = JX, k, i;
    // 성전 산(모리아, 대하 3:1): 돌 축대와 남쪽·서쪽 계단
    var tx0 = X - 20, tx1 = X + 97, tz0 = JZ - 82, tz1 = JZ - 8;
    fbox(tx0, JY - 1, tz0, tx1, JT - 1, tz1, LIMESTONE);
    for (k = 1; k <= 4; k++) { fbox(X + 28, JY, tz1 + k, X + 42, JT - 1 - k, tz1 + k, LIMESTONE); fbox(tx0 - k, JY, JZ - 50, tx0 - k, JT - 1 - k, JZ - 46, LIMESTONE); }
    // 안뜰: 다듬은 돌 세 켜 + 백향목 한 켜(왕상 6:36), 동쪽·남쪽 문
    var ix0 = X - 16, ix1 = X + 95, iz0 = JZ - 79, iz1 = JZ - 11;
    ring(ix0, iz0, ix1, iz1, JT, JT + 2, LIMESTONE); ring(ix0, iz0, ix1, iz1, JT + 3, JT + 3, CEDAR_LOG);
    fbox(ix1, JT, TZC - 3, ix1, JT + 3, TZC + 3, AIR); fbox(X + 33, JT, iz1, X + 37, JT + 3, iz1, AIR);
    // 곁방 세 층(6:5-10): 북·남·서, 층마다 다섯 규빗, 남쪽 가운데 문(6:8)
    function side(x0, z0, x1, z1) {
      fbox(x0, JT, z0, x1, JT + 17, z1, LIMESTONE);
      [JT, JT + 6, JT + 12].forEach(function (y) { fbox(x0 + 1, y, z0 + 1, x1 - 1, y + 4, z1 - 1, AIR); });
      for (var px = x0 + 7; px < x1; px += 7) fbox(px, JT, z0 + 1, px, JT + 16, z1 - 1, LIMESTONE);
    }
    side(HX0 - 2, HZ0 - 9, HX1 + 2, HZ0 - 3); side(HX0 - 2, HZ1 + 3, HX1 + 2, HZ1 + 9); side(HX0 - 9, HZ0 - 9, HX0 - 3, HZ1 + 9);
    fbox(X + 20, JT, HZ1 + 9, X + 21, JT + 3, HZ1 + 9, AIR); setRaw(X + 19, JT + 1, HZ1 + 4, LAMP);
    // 성전 집: 다듬은 돌 벽(6:7) 두께 2, 안 길이 60·너비 20·높이 30(6:2)
    fbox(HX0 - 2, JT - 1, HZ0 - 2, HX1 + 2, JT + 31, HZ1 + 2, LIMESTONE);
    fbox(HX0, JT, HZ0, HX1, JT + 29, HZ1, AIR);
    fbox(HX0, JT - 1, HZ0, HX1, JT - 1, HZ1, BLK_AU);                         // 마루도 금으로(6:30)
    fbox(HX0, JT + 30, HZ0, HX1, JT + 30, HZ1, CEDAR_LOG);                    // 천장까지 백향목(6:15)
    // 성소 벽: 백향목 판자 + 금 띠, 지성소: 정금(6:20)
    fbox(HX0 + 20, JT, HZ0 - 1, HX1, JT + 29, HZ0 - 1, CEDAR_LOG); fbox(HX0 + 20, JT, HZ1 + 1, HX1, JT + 29, HZ1 + 1, CEDAR_LOG);
    [4, 12, 20, 28].forEach(function (dy) { fbox(HX0 + 20, JT + dy, HZ0 - 1, HX1, JT + dy, HZ0 - 1, BLK_AU); fbox(HX0 + 20, JT + dy, HZ1 + 1, HX1, JT + dy, HZ1 + 1, BLK_AU); });
    fbox(HX0 - 1, JT, HZ0 - 1, HX0 + 19, JT + 19, HZ0 - 1, BLK_AU); fbox(HX0 - 1, JT, HZ1 + 1, HX0 + 19, JT + 19, HZ1 + 1, BLK_AU); fbox(HX0 - 1, JT, HZ0, HX0 - 1, JT + 19, HZ1, BLK_AU);
    fbox(HX0, JT + 20, HZ0, HX0 + 19, JT + 20, HZ1, BLK_AU);                  // 내소 높이 20
    [[HX0, HZ0], [HX0 + 19, HZ0], [HX0, HZ1], [HX0 + 19, HZ1]].forEach(function (q) { setRaw(q[0], JT + 19, q[1], LANTERN); });
    // 높은 곳의 닫힌 창(6:4)
    for (k = HX0 + 4; k < HX1; k += 8) { fbox(k, JT + 22, HZ0 - 2, k, JT + 23, HZ0 - 1, AIR); fbox(k, JT + 22, HZ1 + 1, k, JT + 23, HZ1 + 2, AIR); }
    // 지성소와 성소 사이: 금 벽 + 청색·자색·홍색 휘장(대하 3:14) — 가운데가 열려 있다(히 10:20)
    var vx = HX0 + 20, cols = [WOOL_B, WOOL_V, WOOL_R, WOOL_W];
    fbox(vx, JT, HZ0, vx + 1, JT + 29, HZ1, BLK_AU);
    fbox(vx, JT, TZC - 3, vx, JT + 9, TZC + 2, AIR);
    for (var vz = TZC - 3; vz <= TZC + 2; vz++) fbox(vx + 1, JT, vz, vx + 1, JT + 9, vz, cols[(vz - TZC + 3) % 4]);
    fbox(vx + 1, JT, TZC - 1, vx + 1, JT + 4, TZC, AIR);
    // 언약궤와 두 그룹(6:23-27): 키 10, 날개가 이 벽에서 저 벽까지
    fbox(X, JT, TZC - 1, X + 2, JT + 1, TZC, BLK_AU);
    [TZC - 7, TZC + 5].forEach(function (cz) { fbox(X + 1, JT, cz, X + 2, JT + 6, cz + 1, BLK_AU); fbox(X + 1, JT + 8, cz, X + 2, JT + 9, cz + 1, BLK_AU); });
    fbox(X + 1, JT + 7, HZ0, X + 2, JT + 7, HZ1, BLK_AU);
    // 성소: 금 등잔대 열(왕상 7:49)과 상 열(대하 4:8), 휘장 앞 금 단(왕상 7:48)
    for (i = 0; i < 5; i++) { var lx = HX0 + 24 + i * 6; setRaw(lx, JT, HZ0 + 1, LAMPSTAND + 1); setRaw(lx, JT, HZ1 - 1, LAMPSTAND + 1); fbox(lx + 3, JT, HZ0 + 2, lx + 4, JT, HZ0 + 2, BLK_AU); fbox(lx + 3, JT, HZ1 - 2, lx + 4, JT, HZ1 - 2, BLK_AU); }
    fbox(HX0 + 25, JT, TZC + 2, HX0 + 25, JT + 1, TZC + 2, BLK_AU);
    // 성소 문(동쪽 벽)과 주랑(6:3): 너비 20·깊이 10, 앞이 트임
    fbox(HX1 + 1, JT, TZC - 3, HX1 + 2, JT + 11, TZC + 2, AIR);
    fbox(HX1 + 3, JT - 1, HZ0 - 2, HX1 + 12, JT + 31, HZ1 + 2, LIMESTONE);
    fbox(HX1 + 3, JT, HZ0, HX1 + 12, JT + 29, HZ1, AIR); fbox(HX1 + 12, JT, HZ0, HX1 + 12, JT + 29, HZ1, AIR);
    fbox(HX1 + 3, JT + 28, HZ0 - 2, HX1 + 12, JT + 28, HZ0 - 2, BLK_AU); fbox(HX1 + 3, JT + 28, HZ1 + 2, HX1 + 12, JT + 28, HZ1 + 2, BLK_AU);
    setRaw(HX1 + 4, JT, HZ0, LANTERN); setRaw(HX1 + 4, JT, HZ1, LANTERN);
    // 놋기둥 야긴(오른쪽=남쪽)·보아스(왼쪽=북쪽): 높이 18, 둘레 12, 머리 5, 석류와 백합화(7:15-22)
    function pillar(px, pz) {
      for (var a = 0; a < 4; a++) for (var b = 0; b < 4; b++) if (!((a === 0 || a === 3) && (b === 0 || b === 3))) fbox(px + a, JT, pz + b, px + a, JT + 17, pz + b, BLK_CU);
      for (a = -1; a < 5; a++) for (b = -1; b < 5; b++) {
        if ((a === -1 || a === 4) && (b === -1 || b === 4)) continue;
        fbox(px + a, JT + 18, pz + b, px + a, JT + 22, pz + b, BLK_CU);
        if (a === -1 || a === 4 || b === -1 || b === 4) { if ((a + b) & 1) { setRaw(px + a, JT + 19, pz + b, WOOL_R); setRaw(px + a, JT + 21, pz + b, WOOL_R); } }
      }
      fbox(px + 1, JT + 23, pz + 1, px + 2, JT + 23, pz + 2, WOOL_W);
    }
    pillar(X + 65, TZC - 8); pillar(X + 65, TZC + 4);
    // 놋 제단 20×20×10(대하 4:1), 네 뿔, 남쪽 비탈길(계단 없이, 출 20:26)
    fbox(X + 72, JT, TZC - 10, X + 91, JT + 9, TZC + 9, BLK_CU);
    [[X + 72, TZC - 10], [X + 91, TZC - 10], [X + 72, TZC + 9], [X + 91, TZC + 9]].forEach(function (q) { setRaw(q[0], JT + 10, q[1], BLK_CU); });
    setRaw(X + 81, JT + 10, TZC, CAMPFIRE); setRaw(X + 82, JT + 10, TZC - 1, LAMP);
    for (k = 0; k <= 9; k++) fbox(X + 79, JT, TZC + 19 - k, X + 84, JT + k, TZC + 19 - k, LIMESTONE);
    // 놋바다: 지름 10, 높이 5, 소 열둘 위(7:23-25) — 성전 오른쪽 동남쪽(7:39)
    var sx = X + 60, sz = TZC + 25;
    for (i = 0; i < 12; i++) { var an = i * Math.PI / 6, bx = sx + Math.round(Math.cos(an) * 3.6), bz = sz + Math.round(Math.sin(an) * 3.6); fbox(bx, JT, bz, bx, JT + 2, bz, BLK_CU); setRaw(sx + Math.round(Math.cos(an) * 5), JT + 2, sz + Math.round(Math.sin(an) * 5), BLK_CU); }
    for (var dz = -5; dz <= 5; dz++) for (var dx = -5; dx <= 5; dx++) {
      var dd = dx * dx + dz * dz; if (dd > 27) continue;
      setRaw(sx + dx, JT + 3, sz + dz, BLK_CU);
      fbox(sx + dx, JT + 4, sz + dz, sx + dx, JT + 7, sz + dz, dd >= 18 ? BLK_CU : WATER);
    }
    // 물두멍과 받침 열: 성전 오른쪽 다섯, 왼쪽 다섯(7:27, 7:38-39)
    [X - 6, X + 6, X + 18, X + 30, X + 42].forEach(function (lx) {
      [TZC - 26, TZC + 20].forEach(function (lz) {
        fbox(lx, JT, lz, lx + 3, JT + 2, lz + 3, BLK_CU); fbox(lx + 1, JT, lz, lx + 2, JT + 1, lz, AIR); fbox(lx + 1, JT, lz + 3, lx + 2, JT + 1, lz + 3, AIR);
        ring(lx, lz, lx + 3, lz + 3, JT + 3, JT + 3, BLK_CU); fbox(lx + 1, JT + 3, lz + 1, lx + 2, JT + 3, lz + 2, WATER);
      });
    });
    for (k = ix0 + 6; k < ix1; k += 12) { setRaw(k, JT, iz0 + 1, LANTERN); setRaw(k, JT, iz1 - 1, LANTERN); }
  }
  // 솔로몬 왕궁 단지(왕상 7:1-12) — 성전 남쪽. 큰 뜰 안에 보좌의 주랑·왕궁·바로의 딸의 집·기둥 주랑·레바논 나무 궁
  //   (옥스포드 열왕기상 593쪽: 7:6 기둥 주랑 50×30 · WBC 열왕기상 281쪽: 7:7-8 보좌의 주랑, 왕궁은 그 뒤 다른 뜰, 바로의 딸의 집도 같은 양식)
  function palHall(x0, z0, x1, z1) {   // 같은 양식의 집(7:8): 다듬은 돌 벽 + 안쪽 백향목, 백향목 지붕, 남쪽 문
    fbox(x0, JY, z0, x1, JY + 11, z1, LIMESTONE); fbox(x0 + 1, JY, z0 + 1, x1 - 1, JY + 10, z1 - 1, CEDAR_LOG); fbox(x0 + 2, JY, z0 + 2, x1 - 2, JY + 9, z1 - 2, AIR);
    fbox(x0, JY + 11, z0, x1, JY + 11, z1, CEDAR_LOG);
    var cx = (x0 + x1) >> 1; fbox(cx - 1, JY, z1 - 1, cx + 1, JY + 4, z1, AIR);
    for (var wx = x0 + 3; wx < x1 - 2; wx += 5) { fbox(wx, JY + 6, z0, wx, JY + 7, z0 + 1, AIR); fbox(wx, JY + 6, z1 - 1, wx, JY + 7, z1, AIR); }
    fbox(cx - 1, JY - 1, z0 + 2, cx + 1, JY - 1, z1 - 2, WOOL_R);
    setRaw(x0 + 2, JY, z0 + 2, LANTERN); setRaw(x1 - 2, JY, z0 + 2, LANTERN); setRaw(x0 + 3, JY, z0 + 3, CHEST); setRaw(x1 - 3, JY, z0 + 3, FEAST_TABLE); setRaw(x1 - 4, JY, z0 + 3, FEAST_TABLE);
  }
  function buildPalace() {
    var X = JX, Z = JZ, k, s, i;
    // 큰 뜰: 다듬은 돌 세 켜 + 백향목 한 켜(7:12), 돌 바닥, 북·서·남 문
    fbox(X - 13, JY - 1, Z + 5, X + 95, JY - 1, Z + 117, LIMESTONE);
    ring(X - 14, Z + 4, X + 96, Z + 118, JY, JY + 2, LIMESTONE); ring(X - 14, Z + 4, X + 96, Z + 118, JY + 3, JY + 3, CEDAR_LOG);
    fbox(X + 38, JY, Z + 4, X + 42, JY + 3, Z + 4, AIR); fbox(X - 14, JY, Z + 64, X - 14, JY + 3, Z + 66, AIR); fbox(X - 6, JY, Z + 118, X - 2, JY + 3, Z + 118, AIR);
    // 보좌의 주랑 곧 재판하는 주랑(7:7): 안쪽 벽과 바닥까지 백향목, 남쪽 문(기둥 주랑에서 들어감)
    var bx0 = X - 6, bx1 = X + 21, bz0 = Z + 8, bz1 = Z + 27;
    fbox(bx0, JY, bz0, bx1, JY + 14, bz1, LIMESTONE); fbox(bx0 + 1, JY, bz0 + 1, bx1 - 1, JY + 13, bz1 - 1, CEDAR_LOG); fbox(bx0 + 2, JY, bz0 + 2, bx1 - 2, JY + 12, bz1 - 2, AIR);
    fbox(bx0 + 2, JY - 1, bz0 + 2, bx1 - 2, JY - 1, bz1 - 2, CEDAR_LOG);
    fbox(X + 5, JY, bz1 - 1, X + 9, JY + 6, bz1, AIR);
    for (k = bx0 + 4; k < bx1 - 2; k += 5) { fbox(k, JY + 9, bz0, k + 1, JY + 10, bz0 + 1, AIR); fbox(k, JY + 9, bz1 - 1, k + 1, JY + 10, bz1, AIR); }
    [[bx0 + 2, bz0 + 2], [bx1 - 2, bz0 + 2], [bx0 + 2, bz1 - 2], [bx1 - 2, bz1 - 2]].forEach(function (q) { setRaw(q[0], JY, q[1], LANTERN); });
    // 상아 보좌를 정금으로 입힘(10:18): 여섯 층계, 층계 좌우 사자 열둘, 둥근 머리, 팔걸이 곁 사자 둘(10:19-20) — 남쪽(문)을 바라봄
    var tx = X + 7, tz = Z + 20;
    for (s = 0; s < 6; s++) {
      fbox(tx - 2, JY, tz - s, tx + 2, JY + s, tz - s, s % 2 ? LIMESTONE : WOOL_W);
      fbox(tx - 3, JY, tz - s, tx - 3, JY + s, tz - s, LIMESTONE); setRaw(tx - 3, JY + s + 1, tz - s, BLK_AU);
      fbox(tx + 3, JY, tz - s, tx + 3, JY + s, tz - s, LIMESTONE); setRaw(tx + 3, JY + s + 1, tz - s, BLK_AU);
    }
    fbox(tx - 2, JY, tz - 8, tx + 2, JY + 5, tz - 6, BLK_AU); setRaw(tx, JY + 6, tz - 7, CHAIR);
    fbox(tx - 2, JY + 6, tz - 8, tx + 2, JY + 9, tz - 8, BLK_AU); fbox(tx - 1, JY + 10, tz - 8, tx + 1, JY + 10, tz - 8, BLK_AU);
    fbox(tx - 2, JY + 6, tz - 7, tx - 2, JY + 7, tz - 6, BLK_AU); fbox(tx + 2, JY + 6, tz - 7, tx + 2, JY + 7, tz - 6, BLK_AU);
    fbox(tx - 3, JY, tz - 7, tx - 3, JY + 6, tz - 7, LIMESTONE); setRaw(tx - 3, JY + 7, tz - 7, BLK_AU);
    fbox(tx + 3, JY, tz - 7, tx + 3, JY + 6, tz - 7, LIMESTONE); setRaw(tx + 3, JY + 7, tz - 7, BLK_AU);
    // 솔로몬이 거처할 왕궁: 그 주랑 뒤 다른 뜰(7:8) · 바로의 딸의 집: 이 주랑과 같더라(7:8)
    ring(X + 28, Z + 7, X + 63, Z + 31, JY, JY + 2, LIMESTONE); ring(X + 28, Z + 7, X + 63, Z + 31, JY + 3, JY + 3, CEDAR_LOG); fbox(X + 44, JY, Z + 31, X + 47, JY + 3, Z + 31, AIR);
    palHall(X + 32, Z + 9, X + 59, Z + 22);
    palHall(X + 68, Z + 8, X + 93, Z + 26);
    // 기둥 주랑(7:6): 길이 50·너비 30, 기둥 앞에 한 주랑, 그 앞에 기둥과 섬돌
    var px0 = X - 6, px1 = X + 43, pz0 = Z + 34, pz1 = Z + 63;
    fbox(px0, JY, Z + 30, px1, JY, pz1, LIMESTONE);
    fbox(X + 2, JY, Z + 29, X + 35, JY, Z + 29, SLAB_S);
    [pz0, pz0 + 10, pz0 + 19, pz1].forEach(function (pz) { for (i = 0; i <= 10; i++) fbox(px0 + Math.round(i * 4.9), JY + 1, pz, px0 + Math.round(i * 4.9), JY + 11, pz, CEDAR_LOG); });
    fbox(px0, JY + 12, pz0, px1, JY + 12, pz1, CEDAR_LOG);
    for (k = X + 2; k <= X + 35; k += 5) fbox(k, JY + 1, Z + 30, k, JY + 8, Z + 30, CEDAR_LOG);
    fbox(X + 1, JY + 9, Z + 30, X + 36, JY + 9, Z + 33, CEDAR_LOG);
    for (k = px0 + 3; k < px1; k += 10) setRaw(k, JY + 1, pz0 + 5, LANTERN);
    // 기둥 주랑 동쪽 뜰: 감람나무와 물
    [[X + 54, Z + 40], [X + 68, Z + 40], [X + 82, Z + 40], [X + 54, Z + 57], [X + 82, Z + 57]].forEach(function (q) { setRaw(q[0], JY - 1, q[1], GRASS); oliveTree(q[0], JY, q[1]); });
    fbox(X + 64, JY - 1, Z + 52, X + 72, JY - 1, Z + 60, LIMESTONE); fbox(X + 65, JY - 1, Z + 53, X + 71, JY - 1, Z + 59, WATER);
    // 레바논 나무 궁(7:2-5): 100×50×30, 백향목 기둥 네 줄, 창 세 줄 — 금 방패를 여기 두었더라(10:17)
    var x0 = X - 10, x1 = X + 89, z0 = Z + 67, z1 = Z + 116;
    fbox(x0, JY - 1, z0, x1, JY + 29, z1, LIMESTONE); fbox(x0 + 1, JY, z0 + 1, x1 - 1, JY + 27, z1 - 1, AIR);   // 바닥까지 귀한 돌(7:9)
    fbox(x0 + 1, JY + 28, z0 + 1, x1 - 1, JY + 28, z1 - 1, CEDAR_LOG);
    [z0 + 10, z0 + 20, z0 + 29, z0 + 39].forEach(function (pz) {
      for (var q = 0; q < 15; q++) { var px = X - 4 + q * 6; fbox(px, JY, pz, px, JY + 27, pz, CEDAR_LOG); setRaw(px, JY + 6, pz, BLK_AU); }
      fbox(x0 + 1, JY + 27, pz, x1 - 1, JY + 27, pz, CEDAR_LOG);
    });
    [JY + 8, JY + 16, JY + 24].forEach(function (wy) { for (var wx = x0 + 4; wx < x1; wx += 6) { fbox(wx, wy, z0, wx, wy + 1, z0, AIR); fbox(wx, wy, z1, wx, wy + 1, z1, AIR); } });
    fbox(X + 38, JY, z0, X + 42, JY + 7, z0, AIR); fbox(x0, JY, z0 + 23, x0, JY + 6, z0 + 26, AIR);
    fbox(X + 39, JY - 1, z0 + 1, X + 41, JY - 1, z1 - 1, WOOL_R);
    for (k = x0 + 6; k < x1 - 4; k += 12) { setRaw(k, JY, z0 + 2, LANTERN); setRaw(k, JY, z1 - 2, LANTERN); }
  }
  // 안토니아 요새(행 21:34 영내, 21:35 층대): 성전 산 북쪽, 성전 뜰과 같은 높이의 돌 터, 네 귀퉁이 망대, 동쪽 바깥 층대
  function buildAntonia() {
    var X = JX, Z = JZ, ax0 = X + 5, ax1 = X + 32, az0 = Z - 97, az1 = Z - 84, k;
    fbox(ax0, JY - 1, az0, ax1, JT - 1, az1, LIMESTONE);
    fbox(ax0 + 12, JT - 1, az1 + 1, ax0 + 15, JT - 1, Z - 82, LIMESTONE);
    ring(ax0, az0, ax1, az1, JT, JT + 11, LIMESTONE);
    for (k = ax0; k <= ax1; k += 2) { setRaw(k, JT + 12, az0, LIMESTONE); setRaw(k, JT + 12, az1, LIMESTONE); }
    [[ax0, az0], [ax1 - 4, az0], [ax0, az1 - 4], [ax1 - 4, az1 - 4]].forEach(function (q, i) { fbox(q[0], JT, q[1], q[0] + 4, JT + (i === 3 ? 22 : 17), q[1] + 4, LIMESTONE); });
    fbox(ax0 + 12, JT, az1, ax0 + 15, JT + 4, az1, AIR);
    fbox(ax1, JT, Z - 92, ax1, JT + 3, Z - 89, AIR);
    for (k = 0; k < 5; k++) fbox(ax1 + 5 - k, JY, Z - 92, ax1 + 5 - k, JY + k, Z - 89, LIMESTONE);
    fbox(ax0 + 6, JT, az0 + 1, ax1 - 6, JT + 5, az0 + 5, LIMESTONE); fbox(ax0 + 7, JT, az0 + 1, ax1 - 7, JT + 4, az0 + 4, AIR); fbox(X + 17, JT, az0 + 5, X + 19, JT + 3, az0 + 5, AIR);
    setRaw(ax0 + 6, JT, az1 - 2, LANTERN); setRaw(ax1 - 6, JT, az1 - 2, LANTERN); setRaw(ax0 + 8, JT, az0 + 2, CHEST);
  }
  function buildBethesda() {   // 양문 곁 베데스다 못, 행각 다섯(요 5:2)
    var X = JX, x0 = X + 40, x1 = X + 68, z0 = JZ - 97, z1 = JZ - 85, k;
    fbox(x0, JY - 1, z0, x1, JY - 1, z1, LIMESTONE);
    [[X + 42, X + 53], [X + 56, X + 66]].forEach(function (p) {
      fbox(p[0], JY - 5, z0 + 2, p[1], JY - 5, z1 - 2, LIMESTONE); fbox(p[0], JY - 4, z0 + 2, p[1], JY - 1, z1 - 2, WATER);
      for (var s = 1; s <= 3; s++) fbox(p[0], JY - 1 - s, z1 - 2 - s + 1, p[1], JY - 1 - s, z1 - 2 - s + 1, LIMESTONE);   // 남쪽 내려가는 돌계단
    });
    function cols(ax, az, bx, bz) { for (var px = ax; px <= bx; px += 2) for (var pz = az; pz <= bz; pz += 2) fbox(px, JY, pz, px, JY + 4, pz, PILLAR); }
    cols(x0, z0, x1, z0); cols(x0, z1, x1, z1); cols(x0, z0, x0, z1); cols(x1, z0, x1, z1); cols(X + 54, z0, X + 54, z1);
    fbox(x0, JY + 5, z0, x1, JY + 5, z0 + 1, LIMESTONE); fbox(x0, JY + 5, z1 - 1, x1, JY + 5, z1, LIMESTONE);
    fbox(x0, JY + 5, z0, x0 + 1, JY + 5, z1, LIMESTONE); fbox(x1 - 1, JY + 5, z0, x1, JY + 5, z1, LIMESTONE); fbox(X + 54, JY + 5, z0, X + 55, JY + 5, z1, LIMESTONE);
    for (k = x0 + 3; k < x1; k += 8) setRaw(k, JY, z1 + 1, LANTERN);
  }
  function buildDavidCity() {   // 다윗 성(삼하 5:7) — 성의 남동쪽 끝. 다윗의 집(5:11)·밀로(5:9)·물 긷는 데(5:8)·실로암 못(요 9:7)·히스기야 수로(대하 32:30)
    var X = JX, Z = JZ, t, k;
    lotGrid([22, 35, 48, 72, 85], [120, 133, 146], function (lx, lz) { return (lx + 9 >= 53 && lx <= 70 && lz + 9 >= 138) || (lz === 120 && (lx <= 48 || lx === 85)); }, function (lx, lz) {
      var sd = (X + lx) * 7 + (Z + lz) * 13; roofHouse(X + lx, Z + lz, 10, 10, hash2(sd, 1, 95) < 0.4 ? 8 : 6, hash2(sd, 2, 96) < 0.7 ? LIMESTONE : MUDBRICK, sd);
    });
    // 다윗의 집: 두로 왕 히람이 보낸 백향목과 목수와 석수로 지음(5:11) — 큰 돌 축대 위
    fbox(X + 22, JY, Z + 119, X + 60, JY + 2, Z + 131, LIMESTONE);
    for (k = 0; k < 3; k++) fbox(X + 39, JY + k, Z + 134 - k, X + 43, JY + k, Z + 134 - k, LIMESTONE);
    fbox(X + 25, JY + 3, Z + 120, X + 57, JY + 12, Z + 130, LIMESTONE); fbox(X + 26, JY + 3, Z + 121, X + 56, JY + 11, Z + 129, CEDAR_LOG); fbox(X + 27, JY + 3, Z + 122, X + 55, JY + 10, Z + 128, AIR);
    fbox(X + 25, JY + 12, Z + 120, X + 57, JY + 12, Z + 130, CEDAR_LOG); ring(X + 25, Z + 120, X + 57, Z + 130, JY + 13, JY + 13, LIMESTONE);
    fbox(X + 40, JY + 3, Z + 129, X + 42, JY + 7, Z + 130, AIR);
    for (k = X + 29; k <= X + 53; k += 6) fbox(k, JY + 3, Z + 125, k, JY + 10, Z + 125, CEDAR_LOG);
    for (k = X + 28; k < X + 56; k += 5) { fbox(k, JY + 7, Z + 120, k, JY + 8, Z + 121, AIR); fbox(k, JY + 7, Z + 129, k, JY + 8, Z + 130, AIR); }
    setRaw(X + 27, JY + 3, Z + 122, LANTERN); setRaw(X + 55, JY + 3, Z + 122, LANTERN); setRaw(X + 41, JY + 3, Z + 122, HARP);
    // 밀로: 비탈을 채워 떠받친 계단식 돌 축대(WBC 사무엘하 174쪽)
    for (k = 0; k < 3; k++) fbox(X + 61 + k * 3, JY, Z + 119, X + 63 + k * 3, JY + 2 - k, Z + 131, k % 2 ? STONE : SBRICK);
    // 물 긷는 데(5:8): 성 안에서 기혼 샘 물길로 내려가는 돌 굴(WBC 사무엘하 173쪽 · 옥스포드 사무엘하 357쪽, 1867년 워렌이 찾은 굴)
    var ty = JY - 6;
    for (k = 0; k <= 6; k++) { var wz = Z + 120 + k, wy = JY - 1 - k; fbox(X + 92, wy, wz, X + 93, wy, wz, LIMESTONE); fbox(X + 92, wy + 1, wz, X + 93, wy + 4, wz, AIR); }
    [[X + 91, Z + 119], [X + 94, Z + 119]].forEach(function (q) { fbox(q[0], JY, q[1], q[0], JY + 3, q[1], LIMESTONE); }); fbox(X + 91, JY + 4, Z + 119, X + 94, JY + 4, Z + 119, LIMESTONE); setRaw(X + 91, JY + 5, Z + 119, LANTERN);
    // 실로암: 세 켜 돌계단으로 내려가는 못
    fbox(X + 53, JY - 1, Z + 138, X + 70, JY - 1, Z + 154, LIMESTONE);
    for (t = 0; t < 3; t++) fbox(X + 55 + t, JY - 1 - t, Z + 140 + t, X + 68 - t, JY - 1, Z + 152 - t, AIR);
    fbox(X + 57, JY - 4, Z + 142, X + 66, JY - 4, Z + 150, LIMESTONE); fbox(X + 57, JY - 3, Z + 142, X + 66, JY - 3, Z + 150, WATER);
    [[X + 53, Z + 138], [X + 70, Z + 138], [X + 53, Z + 154], [X + 70, Z + 154]].forEach(function (q) { setRaw(q[0], JY, q[1], LANTERN); });
    // 히스기야 수로: 못 동쪽 → 동쪽 → 북쪽 → 동쪽 성 밖 기혼 샘(높이 4, 한쪽은 물길, 천장 등불)
    fbox(X + 67, ty, Z + 145, X + 70, JY - 3, Z + 147, AIR);
    fbox(X + 69, ty, Z + 145, X + 69, ty, Z + 147, LIMESTONE); fbox(X + 68, ty, Z + 145, X + 68, ty + 1, Z + 147, LIMESTONE); fbox(X + 67, ty, Z + 145, X + 67, ty + 2, Z + 147, LIMESTONE);
    [[X + 70, Z + 145, X + 91, Z + 146, 'x'], [X + 89, Z + 125, X + 90, Z + 146, 'z'], [X + 89, Z + 125, X + 118, Z + 126, 'x']].forEach(function (s) {
      fbox(s[0], ty - 1, s[1], s[2], ty - 1, s[3], LIMESTONE); fbox(s[0], ty, s[1], s[2], ty + 3, s[3], AIR);
      if (s[4] === 'x') { fbox(s[0], ty - 1, s[3], s[2], ty - 1, s[3], WATER); for (var q = s[0] + 4; q < s[2]; q += 8) setRaw(q, ty + 4, s[1], LAMP); }
      else { fbox(s[0], ty - 1, s[1], s[0], ty - 1, s[3], WATER); for (var q2 = s[1] + 4; q2 < s[3]; q2 += 8) setRaw(s[2], ty + 4, q2, LAMP); }
    });
    // 기혼 샘: 수로 끝 샘물 + 땅 위로 오르는 계단(성 밖 기드론 골짜기 비탈)
    setRaw(X + 117, ty - 1, Z + 126, WATER); setRaw(X + 117, ty - 1, Z + 125, WATER);
    var top = topAt(X + 128, Z + 126), d = Math.max(0, top + 1 - ty);
    for (k = 1; k <= d + 1; k++) { var sx = X + 118 + k; fbox(sx, ty - 1, Z + 125, sx, ty - 1, Z + 126, LIMESTONE); if (k >= 2) fbox(sx, ty, Z + 125, sx, ty + k - 2, Z + 126, LIMESTONE); fbox(sx, ty + k - 1, Z + 125, sx, ty + k + 4, Z + 126, AIR); }
    var gx = X + 119 + d + 1; ring(gx - 2, Z + 123, gx + 2, Z + 128, top + 1, top + 1, LIMESTONE); setRaw(gx + 2, top + 2, Z + 123, LANTERN); setRaw(gx + 2, top + 2, Z + 128, LANTERN);
  }
  // 헤롯 궁 = 빌라도의 관정(막 15:16 브라이도리온) · 서쪽 성벽 곁 윗도시
  //   WBC 마가복음(하) 750쪽: 관저 후보는 안토니아·헤롯의 윗궁(욥바 문 근처)·두로포이온 서쪽 비탈 — 학자들은 안토니아설을 버렸다. (옥스포드 마가 519쪽·요한 492쪽은 안토니아로 봄)
  function buildHerod() {
    var X = JX, Z = JZ, k, q;
    var hx0 = X - 97, hx1 = X - 58, hz0 = Z - 45, hz1 = Z - 9;
    fbox(hx0, JY - 1, hz0, hx1, JY - 1, hz1, LIMESTONE);
    ring(hx0, hz0, hx1, hz1, JY, JY + 9, LIMESTONE);
    for (k = hx0; k <= hx1; k += 2) { setRaw(k, JY + 10, hz0, LIMESTONE); setRaw(k, JY + 10, hz1, LIMESTONE); }
    for (k = hz0; k <= hz1; k += 2) { setRaw(hx0, JY + 10, k, LIMESTONE); setRaw(hx1, JY + 10, k, LIMESTONE); }
    [X - 94, X - 86, X - 66].forEach(function (tx) { fbox(tx - 2, JY, hz0 - 2, tx + 2, JY + 19, hz0 + 2, LIMESTONE); for (q = -2; q <= 2; q += 2) { setRaw(tx + q, JY + 20, hz0 - 2, LIMESTONE); setRaw(tx + q, JY + 20, hz0 + 2, LIMESTONE); } });   // 북쪽 큰 망대 셋
    // 서쪽 방들 · 남쪽 날개 · 둘레 기둥 회랑
    fbox(hx0 + 1, JY, hz0 + 3, hx0 + 7, JY + 7, hz1 - 1, LIMESTONE); fbox(hx0 + 2, JY, hz0 + 4, hx0 + 6, JY + 6, hz1 - 2, AIR); fbox(hx0 + 7, JY, Z - 28, hx0 + 7, JY + 3, Z - 26, AIR);
    fbox(hx0 + 8, JY, hz1 - 7, hx1 - 1, JY + 7, hz1 - 1, LIMESTONE); fbox(hx0 + 9, JY, hz1 - 6, hx1 - 2, JY + 6, hz1 - 2, AIR); fbox(X - 78, JY, hz1 - 7, X - 76, JY + 3, hz1 - 7, AIR);
    for (k = hx0 + 10; k <= hx1 - 3; k += 4) { if (k >= X - 80 && k <= X - 77) continue; fbox(k, JY, hz0 + 4, k, JY + 5, hz0 + 4, PILLAR); fbox(k, JY, hz1 - 10, k, JY + 5, hz1 - 10, PILLAR); }
    fbox(hx0 + 8, JY + 6, hz0 + 1, hx1 - 1, JY + 6, hz0 + 4, LIMESTONE); fbox(hx0 + 8, JY + 6, hz1 - 10, hx1 - 1, JY + 6, hz1 - 8, LIMESTONE);
    fbox(X - 80, JY + 6, hz0 + 1, X - 77, JY + 6, hz0 + 4, AIR);
    // 브라이도리온 뜰: 풀밭과 물(군인들이 온 군대를 모은 곳, 막 15:16)
    fbox(hx0 + 8, JY - 1, hz0 + 5, hx1 - 2, JY - 1, hz1 - 11, GRASS);
    fbox(X - 81, JY - 1, Z - 31, X - 73, JY - 1, Z - 25, LIMESTONE); fbox(X - 80, JY - 1, Z - 30, X - 74, JY - 1, Z - 26, WATER);
    fbox(X - 80, JY - 1, hz0 + 1, X - 77, JY - 1, hz0 + 5, LIMESTONE); fbox(X - 66, JY - 1, Z - 29, hx1 - 1, JY - 1, Z - 25, LIMESTONE);
    [[X - 86, Z - 36], [X - 66, Z - 36], [X - 86, Z - 22]].forEach(function (p) { oliveTree(p[0], JY, p[1]); });
    for (k = hx0 + 10; k < hx1; k += 9) { setRaw(k, JY, hz0 + 3, LANTERN); setRaw(k, JY, hz1 - 9, LANTERN); }
    fbox(X - 80, JY, hz0, X - 77, JY + 5, hz0, AIR); fbox(hx1, JY, Z - 29, hx1, JY + 5, Z - 25, AIR);   // 북문(골고다 길) · 동문(가바다)
    // 돌을 깐 뜰(히브리 말로 가바다)과 재판석(요 19:13) — 옥스포드 요한복음 491쪽: 넓고 얇게 뜬 돌을 깐 뜰
    for (var gx = X - 57; gx <= X - 45; gx++) for (var gz = Z - 33; gz <= Z - 15; gz++) setRaw(gx, JY - 1, gz, ((gx >> 1) + (gz >> 1)) & 1 ? LIMESTONE : SBRICK);
    fbox(X - 51, JY, Z - 26, X - 49, JY + 1, Z - 24, LIMESTONE); setRaw(X - 50, JY + 2, Z - 25, CHAIR); setRaw(X - 52, JY, Z - 27, LANTERN); setRaw(X - 48, JY, Z - 23, LANTERN);
    // 골고다 길(요 19:17): 관정 북문 → 북쪽 → 서쪽 성문 → 성 밖 골고다
    fbox(X - 80, JY - 1, Z - 61, X - 77, JY - 1, hz0 - 1, LIMESTONE); fbox(X - 100, JY - 1, Z - 61, X - 77, JY - 1, Z - 58, LIMESTONE);
    for (k = Z - 56; k < hz0 - 2; k += 6) setRaw(X - 81, JY, k, LANTERN);
    for (k = X - 96; k < X - 80; k += 6) setRaw(k, JY, Z - 62, LANTERN);
  }
  function buildUpperCity() {   // 윗도시 집들(지붕 난간), 장터, 큰 다락방(막 14:15), 헤롯 궁
    var X = JX, Z = JZ, k;
    var up = [X - 70, Z + 30];
    lotGrid([-95, -82, -69, -56, -43], [-95, -82, -69, -56, -43, -30, -17, 9, 22, 35, 48, 61, 74, 87, 100, 113, 126, 139], function (lx, lz) {
      if (lx <= -59 && lx + 9 >= -72 && lz <= 41 && lz + 9 >= 28) return true;           // 큰 다락방
      if (lx <= -56 && lz >= -43 && lz <= -17) return true;                              // 헤롯 궁 · 가바다
      if (lz === -56 && lx <= -69) return true;                                          // 망대 · 골고다 길
      if (lz === -69 && lx <= -82) return true;
      return false;
    }, function (lx, lz) { var sd = (X + lx) * 7 + (Z + lz) * 13; roofHouse(X + lx, Z + lz, 10, 10, hash2(sd, 1, 97) < 0.35 ? 8 : 6, hash2(sd, 2, 98) < 0.75 ? LIMESTONE : PLASTER, sd); });
    buildHerod();
    // 큰 다락방: 아래층 + 윗방(자리를 펴고 준비한 큰 다락방), 남쪽 바깥 계단
    var hx = up[0], hz = up[1];
    fbox(hx, JY - 1, hz, hx + 11, JY - 1, hz + 11, LIMESTONE);
    fbox(hx, JY, hz, hx + 11, JY + 11, hz + 11, PLASTER); fbox(hx + 1, JY, hz + 1, hx + 10, JY + 10, hz + 10, AIR);
    fbox(hx + 1, JY + 5, hz + 1, hx + 10, JY + 5, hz + 10, GOPHER); fbox(hx, JY + 11, hz, hx + 11, JY + 11, hz + 11, LIMESTONE); ring(hx, hz, hx + 11, hz + 11, JY + 12, JY + 12, LIMESTONE);
    fbox(hx + 5, JY, hz, hx + 6, JY + 3, hz, AIR);
    for (k = 0; k <= 5; k++) fbox(hx + 2 + k, JY, hz + 12, hx + 2 + k, JY + k, hz + 13, LIMESTONE);
    fbox(hx + 7, JY + 6, hz + 11, hx + 8, JY + 9, hz + 11, AIR);
    fbox(hx + 2, JY + 6, hz + 2, hx + 9, JY + 6, hz + 9, CARPET);
    for (k = hx + 3; k <= hx + 8; k++) setRaw(k, JY + 6, hz + 5, FEAST_TABLE);
    setRaw(hx + 1, JY + 6, hz + 1, LAMP); setRaw(hx + 10, JY + 6, hz + 1, LAMP); setRaw(hx + 1, JY, hz + 1, LAMP);
    fbox(hx + 3, JY + 8, hz, hx + 3, JY + 8, hz, AIR); fbox(hx + 8, JY + 8, hz, hx + 8, JY + 8, hz, AIR);
    // 장터
    farStall(X - 80, Z - 5, CLOTH_Y); farStall(X - 64, Z - 5, CLOTH_G); farStall(X - 48, Z - 5, WOOL_R);
    for (k = X - 92; k < X + 95; k += 12) { if (k > X - 30 && k < X - 18) continue; setRaw(k, JY, Z - 3, LANTERN); setRaw(k, JY, Z + 3, LANTERN); }
  }
  function buildJerusalemOutside(x0, z0) {   // 성 밖: 골고다(요 19:17) · 빈 무덤(마 28:6) · 겟세마네(마 26:36) · 감람산
    var X = JX, Z = JZ, gx, gz, h, k;
    function near(cx, cz, r) { return cx + r >= x0 && cx - r < x0 + CS && cz + r >= z0 && cz - r < z0 + CS; }
    gx = X - 124; gz = Z - 62;
    if (near(gx, gz, 14)) {
      for (var dz = -10; dz <= 10; dz++) for (var dx = -10; dx <= 10; dx++) if (dx * dx + dz * dz <= 100) { var th = topAt(gx + dx, gz + dz); fbox(gx + dx, th + 1, gz + dz, gx + dx, th + 6, gz + dz, AIR); setRaw(gx + dx, th, gz + dz, hash2(gx + dx, gz + dz, 99) < 0.6 ? STONE : LIMESTONE); }
      [[-4, 6], [0, 7], [4, 6]].forEach(function (q) { var cx = gx + q[0], cy = topAt(cx, gz) + 1; fbox(cx, cy, gz, cx, cy + q[1], gz, LOG); fbox(cx - 1, cy + q[1] - 2, gz, cx + 1, cy + q[1] - 2, gz, LOG_X); });
    }
    gx = X - 122; gz = Z - 30;
    if (near(gx, gz, 14)) {
      h = topAt(gx, gz) + 1;
      fbox(gx - 6, h - 1, gz - 6, gx + 5, h + 7, gz + 6, STONE); fbox(gx - 4, h, gz - 3, gx + 1, h + 4, gz + 3, AIR);
      fbox(gx + 2, h, gz - 1, gx + 5, h + 3, gz + 1, AIR);
      for (var a = -2; a <= 2; a++) for (var b = -2; b <= 2; b++) if (a * a + b * b <= 5) setRaw(gx + 6, h + 2 + b, gz + 3 + a, BASALT);   // 굴려 놓은 돌(막 16:4)
      fbox(gx - 4, h, gz - 3, gx - 3, h, gz + 3, LIMESTONE); setRaw(gx - 4, h + 1, gz - 2, WOOL_W); setRaw(gx - 3, h + 1, gz + 2, WOOL_W);   // 따로 개어 놓인 수건(요 20:7)
      setRaw(gx + 1, h, gz + 3, LAMP);
      [[10, -8], [12, 6], [-10, 10], [8, 12]].forEach(function (q) { var ox = gx + q[0], oz = gz + q[1]; oliveTree(ox, topAt(ox, oz) + 1, oz); });
      for (k = 0; k < 14; k++) { var fx = gx + 7 + Math.floor(hash2(k, 1, 100) * 8), fz = gz - 8 + Math.floor(hash2(k, 2, 100) * 18), ft = topAt(fx, fz); if (get2(fx, ft + 1, fz) === AIR) setRaw(fx, ft + 1, fz, hash2(k, 3, 100) < 0.5 ? LILY : FLOWER); }
    }
    gx = X + 124; gz = Z - 34;
    if (near(gx, gz, 16)) {
      for (var ox2 = -9; ox2 <= 9; ox2 += 6) for (var oz2 = -9; oz2 <= 9; oz2 += 6) { var tx = gx + ox2 + (hash2(ox2, oz2, 101) < 0.5 ? 1 : 0), tz = gz + oz2; oliveTree(tx, topAt(tx, tz) + 1, tz); }
      setRaw(gx - 12, topAt(gx - 12, gz) + 1, gz, OIL_PRESS);
      for (k = -13; k <= 13; k++) { if (Math.abs(k) < 2) continue; setRaw(gx + k, topAt(gx + k, gz - 13) + 1, gz - 13, LIMESTONE); setRaw(gx + k, topAt(gx + k, gz + 13) + 1, gz + 13, LIMESTONE); setRaw(gx - 13, topAt(gx - 13, gz + k) + 1, gz + k, LIMESTONE); setRaw(gx + 13, topAt(gx + 13, gz + k) + 1, gz + k, LIMESTONE); }
    }
    // 감람산 비탈의 감람나무
    for (var hz2 = Z - 56; hz2 <= Z + 36; hz2 += 8) for (var hx2 = X + 108; hx2 <= X + 196; hx2 += 8) {
      var ox3 = hx2 + Math.floor(hash2(hx2, hz2, 102) * 5), oz3 = hz2 + Math.floor(hash2(hz2, hx2, 103) * 5);
      if (Math.hypot(ox3 - (X + 152), oz3 - (Z - 10)) > 44 || hash2(ox3, oz3, 104) > 0.45 || Math.abs(ox3 - (X + 124)) < 17 && Math.abs(oz3 - (Z - 34)) < 17) continue;
      if (!near(ox3, oz3, 4)) continue;
      var ot = topAt(ox3, oz3); if (T.wtop >= 0) continue; oliveTree(ox3, ot + 1, oz3);
    }
    // 골고다 길(성 밖): 서쪽 성문에서 골고다 언덕까지
    for (k = X - 112; k <= X - 101; k++) for (var vz = Z - 61; vz <= Z - 58; vz++) { if (k < x0 || k >= x0 + CS || vz < z0 || vz >= z0 + CS) continue; setRaw(k, topAt(k, vz), vz, PATH); }
    // 베다니(요 11:18 예루살렘에서 오 리쯤, 눅 19:29 감람원 산쪽): 감람산 남동쪽 너머 작은 마을 · 마르다의 집(눅 10:38) · 나사로의 무덤 굴(요 11:38)
    var bx = X + 176, bz = Z + 62;
    if (near(bx, bz, 20)) {
      var BF = topAt(bx, bz) + 1, fbOld = FB; FB = BF;
      fbox(bx - 16, BF, bz - 14, bx + 16, BF + 14, bz + 14, AIR); fbox(bx - 16, BF - 8, bz - 14, bx + 16, BF - 2, bz + 14, DIRT); fbox(bx - 16, BF - 1, bz - 14, bx + 16, BF - 1, bz + 14, GRASS);
      fbox(bx - 16, BF - 1, bz - 10, bx + 16, BF - 1, bz - 8, PATH);
      roofHouse(bx - 15, bz - 7, 9, 9, 5, LIMESTONE, 301);
      roofHouse(bx - 3, bz - 7, 9, 9, 5, MUDBRICK, 302);    // 마르다의 집
      roofHouse(bx - 15, bz + 4, 9, 9, 5, MUDBRICK, 303);
      setRaw(bx + 1, BF, bz - 3, JAR); setRaw(bx - 1, BF, bz - 5, LAMP);
      fbox(bx + 7, BF, bz - 1, bx + 15, BF + 6, bz + 11, STONE); fbox(bx + 9, BF, bz + 2, bx + 13, BF + 3, bz + 8, AIR);   // 바위 무덤
      fbox(bx + 7, BF, bz + 4, bx + 8, BF + 2, bz + 5, AIR);
      for (var a2 = -1; a2 <= 1; a2++) for (var b2 = -1; b2 <= 1; b2++) if (a2 * a2 + b2 * b2 <= 1) setRaw(bx + 6, BF + 1 + b2, bz + 1 + a2, BASALT);   // 옮겨 놓은 돌(요 11:41)
      setRaw(bx + 12, BF, bz + 5, WOOL_W); setRaw(bx + 10, BF, bz + 3, LAMP);
      oliveTree(bx + 2, BF, bz + 8); oliveTree(bx - 4, BF, bz + 10);
      FB = fbOld;
    }
    // 라헬의 묘비(창 35:20): 예루살렘 북쪽 베냐민 땅 길가 — WBC 창세기(하) 576-578쪽: 무덤은 예루살렘 북쪽 라마 부근(삼상 10:2, 렘 31:15), 지금 베들레헴 곁 무덤은 뒤의 전승
    var rx = X + 13, rz = Z - 165;
    if (near(rx, rz, 4)) { var rh = topAt(rx, rz); fbox(rx - 2, rh + 1, rz - 2, rx + 2, rh + 1, rz + 2, STONE); fbox(rx - 1, rh + 2, rz - 1, rx + 1, rh + 2, rz + 1, STONE); fbox(rx, rh + 3, rz, rx, rh + 6, rz, LIMESTONE); }
  }
  FAR_BUILD.jerusalem = function (c, x0, z0) {
    FB = JY;
    var X = JX, Z = JZ, r = c.r, m = r + 7, zs = c.zs;
    if (x0 + CS > X - m && x0 <= X + m && z0 + CS > Z - m && z0 <= Z + zs + 7) {
      cityGround(c, GRASS);
      farWalls(c, LIMESTONE, 12, 5, 8, 20);
      fbox(X - r, JY, Z - 61, X - r + 2, JY + 6, Z - 58, AIR);   // 골고다로 나가는 서쪽 문
      fbox(X - r, JY - 1, Z - 2, X + r, JY - 1, Z + 2, LIMESTONE); fbox(X - 26, JY - 1, Z - r, X - 23, JY - 1, Z + zs, LIMESTONE);
      fbox(X - 26, JY - 1, Z - 90, X + 2, JY - 1, Z - 86, LIMESTONE); fbox(X - 2, JY - 1, Z - r, X + 2, JY - 1, Z - 86, LIMESTONE);
      fbox(X - 26, JY - 1, Z + zs - 10, X + 2, JY - 1, Z + zs - 6, LIMESTONE); fbox(X - 2, JY - 1, Z + zs - 10, X + 2, JY - 1, Z + zs, LIMESTONE);
      buildTemple(); buildAntonia(); buildPalace(); buildBethesda(); buildUpperCity();
    }
    buildDavidCity();   // 수로는 성 밖 기혼 샘까지
    buildJerusalemOutside(x0, z0);
  };

  // ───────── 베들레헴: 성문 곁 우물(삼하 23:15) · 구유(눅 2:7) · 목자들의 들(눅 2:8) · 보아스의 밭(룻 2:4) ─────────
  FAR_BUILD.bethlehem = function (c, x0, z0) {
    var X = c.x, Z = c.z, r = c.r, m = r + 7, k;
    FB = c.y + 1;
    if (x0 + CS > X - m && x0 <= X + m && z0 + CS > Z - m && z0 <= Z + m) {
      cityGround(c, GRASS);
      farWalls(c, LIMESTONE, 6, 5, 5, 0);
      fbox(X - 2, FB - 1, Z - r - 6, X + 2, FB - 1, Z + r, LIMESTONE); fbox(X - r, FB - 1, Z - 2, X + r, FB - 1, Z + 2, LIMESTONE);
      fbox(X + 4, FB - 1, Z - r - 6, X + 8, FB - 1, Z - r - 3, LIMESTONE); setRaw(X + 6, FB, Z - r - 5, WELL); setRaw(X + 4, FB, Z - r - 6, JAR);
      lotGrid([-32, -19, 6, 19], [-32, -19, 6, 19], function (lx, lz) { return lx >= 0 && lz >= 0; }, function (lx, lz) { var sd = (X + lx) * 7 + (Z + lz) * 13; roofHouse(X + lx, Z + lz, 10, 10, 6, hash2(sd, 2, 105) < 0.6 ? LIMESTONE : MUDBRICK, sd); });
      // 구유가 있는 집(눅 2:7): 팔레스타인 농가는 한 칸 집 — 한 단 높은 사람 사는 곳과 낮은 짐승 칸, 그 사이 돌 구유
      //   (WBC 누가복음(상) 261쪽: 한 지붕 밑 방 한 칸짜리 본채와 마구간 · 옥스포드 누가복음 184쪽: 돋우어진 부분과 낮은 부분, 낮은 곳에 돌 여물통)
      //   바위 굴 마구간은 2세기 뒤에 생긴 전승이라 따르지 않음. 지붕 위 손님방(카탈뤼마)은 이미 찼다.
      roofHouse(X + 4, Z + 6, 10, 10, 6, LIMESTONE, 77);
      var hx0 = X + 18, hz0 = Z + 8, hx1 = X + 31, hz1 = Z + 19;
      fbox(hx0, FB - 1, hz0, hx1, FB - 1, hz1, LIMESTONE);
      fbox(hx0, FB, hz0, hx1, FB + 6, hz1, LIMESTONE); fbox(hx0 + 1, FB, hz0 + 1, hx1 - 1, FB + 5, hz1 - 1, AIR); fbox(hx0, FB + 6, hz0, hx1, FB + 6, hz1, LIMESTONE);
      ring(hx0, hz0, hx1, hz1, FB + 7, FB + 7, LIMESTONE);
      fbox(hx0 + 1, FB, hz0 + 1, hx0 + 8, FB, hz1 - 1, SBRICK);                         // 사람 사는 곳(한 단 높음)
      fbox(hx0 + 10, FB - 1, hz0 + 1, hx1 - 1, FB - 1, hz1 - 1, THATCH);                // 짐승 칸 바닥 짚
      setRaw(hx0 + 9, FB, hz0 + 6, MANGER); setRaw(hx0 + 9, FB, hz0 + 3, LIMESTONE); setRaw(hx0 + 9, FB, hz0 + 9, LIMESTONE);
      fbox(hx0 + 11, FB, hz1, hx0 + 12, FB + 3, hz1, AIR);                              // 문은 짐승 칸 쪽(남쪽)
      setRaw(hx0 + 2, FB + 1, hz0 + 2, LAMP); setRaw(hx0 + 2, FB + 1, hz1 - 2, JAR); setRaw(hx0 + 5, FB + 1, hz0 + 2, REED_MAT); setRaw(hx0 + 6, FB + 1, hz0 + 2, REED_MAT); setRaw(hx1 - 2, FB, hz0 + 2, THATCH); setRaw(hx1 - 2, FB, hz0 + 3, THATCH);
      // 지붕 위 손님방(카탈뤼마): 북쪽 바깥 계단으로 오름, 안은 이미 손님 자리로 가득
      fbox(hx0 + 1, FB + 7, hz0 + 1, hx0 + 8, FB + 11, hz0 + 7, LIMESTONE); fbox(hx0 + 2, FB + 7, hz0 + 2, hx0 + 7, FB + 10, hz0 + 6, AIR); fbox(hx0 + 4, FB + 7, hz0 + 7, hx0 + 5, FB + 9, hz0 + 7, AIR);
      fbox(hx0 + 2, FB + 7, hz0 + 2, hx0 + 7, FB + 7, hz0 + 3, REED_MAT); setRaw(hx0 + 2, FB + 7, hz0 + 6, JAR); setRaw(hx0 + 7, FB + 7, hz0 + 6, CHEST); setRaw(hx0 + 2, FB + 8, hz0 + 4, LAMP);
      for (k = 0; k < 7; k++) fbox(hx0 + 3 + k, FB, hz0 - 1, hx0 + 3 + k, FB + k, hz0 - 1, LIMESTONE);
      fbox(hx0 + 9, FB + 7, hz0, hx0 + 10, FB + 7, hz0, AIR);
    }
    // 목자들의 들(동쪽): 돌로 두른 양 우리와 모닥불
    var sx = X + 70, sz = Z + 4;
    if (sx + 14 >= x0 && sx - 14 < x0 + CS && sz + 14 >= z0 && sz - 14 < z0 + CS) {
      for (var a = 0; a < 40; a++) { if (a >= 18 && a <= 21) continue; var an = a / 40 * Math.PI * 2, px = sx + Math.round(Math.cos(an) * 6), pz = sz + Math.round(Math.sin(an) * 6), pt = topAt(px, pz); fbox(px, pt + 1, pz, px, pt + 2, pz, LIMESTONE); }
      setRaw(sx - 10, topAt(sx - 10, sz) + 1, sz, CAMPFIRE);
    }
    // 보아스의 밭(서쪽): 익은 곡식과 단
    var bx = X - 76, bz = Z - 2;
    if (bx + 14 >= x0 && bx - 14 < x0 + CS && bz + 10 >= z0 && bz - 10 < z0 + CS) {
      for (var fz = bz - 6; fz <= bz + 6; fz++) for (var fx = bx - 10; fx <= bx + 10; fx++) { var ft = topAt(fx, fz); if (T.wtop >= 0) continue; fbox(fx, ft + 1, fz, fx, ft + 4, fz, AIR); setRaw(fx, ft, fz, FARM_SOIL); setRaw(fx, ft + 1, fz, hash2(fx, fz, 106) < 0.08 ? THATCH : CROP0 + 3); }
    }
  };
  // ───────── 나사렛: 회당(눅 4:16) · 목수의 집(마 13:55) · 마을 우물 ─────────
  FAR_BUILD.nazareth = function (c, x0, z0) {
    var X = c.x, Z = c.z, r = c.r, k;
    FB = c.y + 1;
    cityGround(c, GRASS);
    fbox(X - r, FB - 1, Z - 2, X + r, FB - 1, Z + 2, 18); fbox(X - 2, FB - 1, Z - r, X + 2, FB - 1, Z + r, 18);
    fbox(X - 4, FB - 1, Z - 4, X + 4, FB - 1, Z + 4, LIMESTONE); setRaw(X + 3, FB, Z + 3, WELL); setRaw(X + 2, FB, Z + 3, JAR);
    // 회당: 돌 벽, 둘레 돌 의자, 두 줄 기둥, 북쪽 말씀 서가
    var sx0 = X - 9, sx1 = X + 9, sz0 = Z - 33, sz1 = Z - 20;
    fbox(sx0, FB - 1, sz0, sx1, FB - 1, sz1, LIMESTONE); fbox(sx0, FB, sz0, sx1, FB + 8, sz1, LIMESTONE); fbox(sx0 + 1, FB, sz0 + 1, sx1 - 1, FB + 7, sz1 - 1, AIR);
    ring(sx0 + 1, sz0 + 1, sx1 - 1, sz1 - 1, FB, FB, SLAB_S); fbox(X - 1, FB, sz1, X + 1, FB + 3, sz1, AIR); fbox(X - 1, FB, sz1 - 1, X + 1, FB, sz1 - 1, AIR);
    for (k = sx0 + 4; k <= sx1 - 4; k += 4) { fbox(k, FB, sz0 + 4, k, FB + 7, sz0 + 4, PILLAR); fbox(k, FB, sz1 - 4, k, FB + 7, sz1 - 4, PILLAR); }
    setRaw(X, FB, sz0 + 1, WORD_SHELF); setRaw(sx0 + 1, FB + 1, sz0 + 1, LAMP); setRaw(sx1 - 1, FB + 1, sz0 + 1, LAMP);
    // 목수의 집과 일터(기둥 + 갈대 지붕, 제작대·통나무·널판)
    farHouse(X + 10, Z + 8, 10, 10, 6, MUDBRICK, LIMESTONE, 'w', 55);
    [[X + 21, Z + 8], [X + 27, Z + 8], [X + 21, Z + 16], [X + 27, Z + 16]].forEach(function (q) { fbox(q[0], FB, q[1], q[0], FB + 3, q[1], LOG); });
    fbox(X + 21, FB + 4, Z + 8, X + 27, FB + 4, Z + 16, THATCH);
    setRaw(X + 23, FB, Z + 10, CRAFT); fbox(X + 25, FB, Z + 14, X + 26, FB, Z + 15, LOG_X); setRaw(X + 25, FB + 1, Z + 14, LOG_X); fbox(X + 22, FB, Z + 15, X + 22, FB + 1, Z + 15, GOPHER); setRaw(X + 26, FB, Z + 10, CHEST);
    lotGrid([-34, -21, 6, 21], [-14, 6, 21], function (lx, lz) { return lx >= 6 && lz >= 6 && lz <= 16 || lx >= 6 && lz === 6; }, function (lx, lz) { var sd = (X + lx) * 7 + (Z + lz) * 13; roofHouse(X + lx, Z + lz, 10, 10, 6, hash2(sd, 2, 107) < 0.6 ? MUDBRICK : LIMESTONE, sd); });
    for (k = 0; k < 6; k++) { var ox = X - 30 + Math.floor(hash2(k, 1, 108) * 60), oz = Z + 34 + Math.floor(hash2(k, 2, 108) * 5); if (Math.abs(ox - X) > 4) oliveTree(ox, FB, oz); }
  };
  // ───────── 가버나움: 갈릴리 바닷가 검은 돌(현무암) 마을 · 현무암 회당(막 1:21) · 시몬과 안드레의 집(막 1:29) · 지붕을 뜯은 집(막 2:4) · 세관(마 9:9) ─────────
  FAR_BUILD.capernaum = function (c, x0, z0) {
    var X = c.x, Z = c.z, r = c.r, m = r + 7, k;
    FB = G;
    if (x0 + CS > X - m && x0 <= X + m && z0 + CS > Z - m && z0 <= Z + m) {
      fbox(X - m, G, Z - m, X + m, SY - 1, Z + m, AIR); fbox(X - m, G - 5, Z - m, X + m, G - 2, Z + m, DIRT); fbox(X - m, G - 1, Z - m, X + m, G - 1, Z + m, GRASS);
      fbox(X - r, G - 1, Z - 2, X + r, G - 1, Z + 2, BASALT); fbox(X - 2, G - 1, Z - r, X + 2, G - 1, Z + m, BASALT);
      // 회당: 1세기 회당은 지금 남은 흰 석회암 회당(4~5세기) 아래의 검은 현무암 기초 — 그래서 현무암으로(주석서엔 없음, 발굴 보고 기준). 기둥 두 줄, 둘레 돌 의자, 남쪽(바다 쪽) 문 셋
      var sx0 = X - 10, sx1 = X + 10, sz0 = Z - 32, sz1 = Z - 19;
      fbox(sx0, G - 1, sz0, sx1, G - 1, sz1, BASALT); fbox(sx0, G, sz0, sx1, G + 9, sz1, BASALT); fbox(sx0 + 1, G, sz0 + 1, sx1 - 1, G + 8, sz1 - 1, AIR);
      ring(sx0 + 1, sz0 + 1, sx1 - 1, sz1 - 1, G, G, SLAB_S);
      for (k = sx0 + 3; k <= sx1 - 3; k += 3) { fbox(k, G, sz0 + 4, k, G + 8, sz0 + 4, BASALT); fbox(k, G, sz1 - 4, k, G + 8, sz1 - 4, BASALT); }
      [X - 6, X, X + 6].forEach(function (dx) { fbox(dx - 1, G, sz1, dx + 1, G + 4, sz1, AIR); fbox(dx - 1, G, sz1 - 1, dx + 1, G, sz1 - 1, AIR); });
      setRaw(X, G, sz0 + 1, WORD_SHELF); setRaw(sx0 + 1, G + 1, sz0 + 1, LAMP); setRaw(sx1 - 1, G + 1, sz0 + 1, LAMP);
      // 시몬과 안드레의 집: 현무암 담 안 마당, 방들, 화덕
      var px0 = X + 8, px1 = X + 25, pz0 = Z + 6, pz1 = Z + 20;
      ring(px0, pz0, px1, pz1, G, G + 3, BASALT); fbox(px0 + 1, G - 1, pz0 + 1, px1 - 1, G - 1, pz1 - 1, BASALT);
      fbox(px0, G, pz0 + 6, px0, G + 3, pz0 + 7, AIR);
      fbox(px0 + 1, G, pz0 + 1, px1 - 1, G + 4, pz0 + 5, BASALT); fbox(px0 + 2, G, pz0 + 2, px1 - 2, G + 3, pz0 + 4, AIR); fbox(px0 + 1, G + 4, pz0 + 1, px1 - 1, G + 4, pz0 + 5, THATCH);
      for (k = px0 + 6; k < px1 - 1; k += 6) { fbox(k, G, pz0 + 2, k, G + 3, pz0 + 4, BASALT); fbox(k - 2, G, pz0 + 5, k - 1, G + 2, pz0 + 5, AIR); }
      setRaw(px0 + 12, G, pz1 - 3, OVEN); setRaw(px0 + 4, G, pz1 - 2, JAR); setRaw(px0 + 3, G + 1, pz0 + 2, LAMP); setRaw(px1 - 3, G, pz1 - 3, FEAST_TABLE);
      // 지붕을 뜯은 집(막 2:4): 갈대 지붕 가운데 구멍, 그 아래 상
      var rx = X - 22, rz = Z - 2;
      fbox(rx, G - 1, rz, rx + 9, G - 1, rz + 9, BASALT); fbox(rx, G, rz, rx + 9, G + 4, rz + 9, BASALT); fbox(rx + 1, G, rz + 1, rx + 8, G + 3, rz + 8, AIR);
      fbox(rx, G + 4, rz, rx + 9, G + 4, rz + 9, THATCH); fbox(rx + 4, G + 4, rz + 4, rx + 5, G + 4, rz + 5, AIR); fbox(rx + 4, G, rz + 4, rx + 5, G, rz + 5, REED_MAT);
      fbox(rx + 9, G, rz + 4, rx + 9, G + 2, rz + 5, AIR); for (k = 0; k < 4; k++) fbox(rx + 10, G, rz + 6 + k, rx + 10, G + k, rz + 6 + k, BASALT);
      lotGrid([-32, -19, 18], [-15, 6, 21], function (lx, lz) { return (lx === -19 && lz === 6) || (lx === 18 && lz >= 6) || (lx === -32 && lz === 21); }, function (lx, lz) { var sd = (X + lx) * 7 + (Z + lz) * 13; farHouse(X + lx, Z + lz, 10, 10, 5, BASALT, THATCH, lz < 0 ? 's' : 'n', sd); });
      // 세관(서쪽 길가)
      farStall(X - 30, Z + 26, CLOTH_B);
      farStall(X + 12, Z + 28, CLOTH_G);
    }
    // 물가: 현무암 부두, 배 두 척(돛대와 돛)
    if (x0 + CS > X - 20 && x0 <= X + 20 && z0 + CS > Z + 20 && z0 <= Z + 72) {
      for (var z = Z + 30; z <= Z + 66; z++) { fbox(X - 2, G - 1, z, X + 2, G - 1, z, BASALT); if (z % 6 === 0) { setRaw(X - 3, G - 1, z, BASALT); setRaw(X - 3, G, z, FENCE); setRaw(X + 3, G - 1, z, BASALT); setRaw(X + 3, G, z, FENCE); } }
      setRaw(X - 2, G, Z + 66, LANTERN); setRaw(X + 2, G, Z + 66, LANTERN);
      [X - 9, X + 7].forEach(function (bx) {
        var bz0 = Z + 56;
        for (var i = 0; i < 11; i++) { var w = i < 2 || i > 8 ? 0 : 1; fbox(bx - w, G - 2, bz0 + i, bx + w, G - 2, bz0 + i, PITCH); setRaw(bx - w - 1, G - 1, bz0 + i, PITCH); setRaw(bx + w + 1, G - 1, bz0 + i, PITCH); fbox(bx - w, G - 1, bz0 + i, bx + w, G - 1, bz0 + i, AIR); }
        fbox(bx, G - 1, bz0 + 5, bx, G + 5, bz0 + 5, LOG); fbox(bx, G + 2, bz0 + 4, bx, G + 5, bz0 + 4, WOOL_W);
      });
    }
  };

  // ───────── 사마리아 수가(요 4:5) · 야곱의 우물(요 4:6) · 그리심 산(요 4:20) · 에발 산(신 11:29) · 요셉의 무덤(수 24:32) ─────────
  //   WBC 요한복음 206쪽: 수가 = 아스카르, 야곱의 우물에서 1마일쯤 · 옥스포드 요한복음 301쪽: 세겜보다 아스카르가 더 가능성 높음,
  //   옥스포드 요한복음 328쪽: 그리심 산 사마리아 성전은 B.C. 129년에 헐림 → 예수님 때는 무너진 터
  FAR_BUILD.sychar = function (c, x0, z0) {
    var X = c.x, Z = c.z, r = c.r, m = r + 7, k;
    FB = c.y + 1;
    function near(cx, cz, rr) { return cx + rr >= x0 && cx - rr < x0 + CS && cz + rr >= z0 && cz - rr < z0 + CS; }
    if (near(X, Z, m)) {
      cityGround(c, GRASS);
      fbox(X - 2, FB - 1, Z - m, X + 2, FB - 1, Z + m, PATH);
      lotGrid([-26, -13, 6, 17], [-26, -13, 6, 17], function () { return false; }, function (lx, lz) { var sd = (X + lx) * 7 + (Z + lz) * 13; roofHouse(X + lx, Z + lz, 9, 9, 5, hash2(sd, 2, 111) < 0.6 ? MUDBRICK : LIMESTONE, sd); });
      fbox(X - 6, FB - 1, Z - 4, X + 6, FB - 1, Z + 4, LIMESTONE); setRaw(X + 4, FB, Z - 3, JAR); setRaw(X - 4, FB, Z + 3, LANTERN);
    }
    // 야곱의 우물: 마을 남서쪽, 큰길 가
    var wx = X - 30, wz = Z + 52;
    if (near(wx, wz, 6)) {
      var wh = topAt(wx, wz);
      fbox(wx - 3, wh, wz - 3, wx + 3, wh, wz + 3, LIMESTONE); fbox(wx - 3, wh + 1, wz - 3, wx + 3, wh + 6, wz + 3, AIR);
      ring(wx - 1, wz - 1, wx + 1, wz + 1, wh + 1, wh + 1, LIMESTONE); setRaw(wx, wh + 1, wz, WELL); setRaw(wx + 2, wh + 1, wz + 2, JAR);
    }
    // 요셉의 무덤(수 24:32): 우물 곁 밭 가운데 작은 돌무덤
    var jx = wx + 14, jz = wz + 6;
    if (near(jx, jz, 4)) { var jh = topAt(jx, jz); fbox(jx - 2, jh + 1, jz - 1, jx + 2, jh + 2, jz + 1, LIMESTONE); fbox(jx - 1, jh + 3, jz, jx + 1, jh + 3, jz, LIMESTONE); }
    // 그리심 산 꼭대기: 무너진 사마리아 성전 터(B.C. 129년에 헐림)
    if (near(GERX, GERZ, 12)) {
      for (var dz = -9; dz <= 9; dz++) for (var dx = -9; dx <= 9; dx++) {
        var edge = Math.abs(dx) === 9 || Math.abs(dz) === 9, inner = Math.abs(dx) === 4 && Math.abs(dz) <= 4 || Math.abs(dz) === 4 && Math.abs(dx) <= 4;
        if (!edge && !inner) continue;
        var tt = topAt(GERX + dx, GERZ + dz), hh = Math.floor(hash2(GERX + dx, GERZ + dz, 112) * 4);
        if (hh > 0) fbox(GERX + dx, tt + 1, GERZ + dz, GERX + dx, tt + hh, GERZ + dz, LIMESTONE);
      }
      for (k = 0; k < 8; k++) { var rx2 = GERX - 7 + Math.floor(hash2(k, 3, 113) * 14), rz2 = GERZ - 7 + Math.floor(hash2(k, 4, 113) * 14); setRaw(rx2, topAt(rx2, rz2) + 1, rz2, LIMESTONE); }
    }
  };

  // ───────── 사람·가게 ─────────
  SHOPS.olive = { title: '🫒 감람유 가게', list: [[[AG, 1], [OLIVE_OIL, 2]], [[AG, 1], [OIL_LAMP, 2]], [[AG, 2], [OIL_JAR, 1]], [[OLIVE_OIL, 3], [AG, 1]]] };
  SHOPS.cedar = { title: '🌲 목재 상인', list: [[[AG, 1], [GOPHER, 16]], [[AG, 1], [LOG, 12]], [[AG, 2], [CHEST, 1]], [[CEDAR_LOG, 8], [AG, 1]]] };
  SHOPS.carpenter = { title: '🪚 나사렛 목수의 일터', list: [[[AG, 1], [GOPHER, 24]], [[AG, 1], [STICK, 16]], [[AG, 2], [CHAIR, 2]], [[AG, 2], [CHEST, 1]], [[LOG, 10], [AG, 1]]] };
  SHOPS.galfish = { title: '🐟 갈릴리 어부', list: [[[AG, 1], [COOKED_FISH, 5]], [[AG, 2], [FISH_NET, 1]], [[AG, 3], [BOAT, 1]], [[RAW_FISH, 8], [AG, 1]]] };
  SHOPS.boaz = { title: '🌾 보아스의 곳간', list: [[[AG, 1], [WHEAT, 12]], [[AG, 1], [SEED, 8]], [[AG, 1], [BREAD, 4]], [[WHEAT, 16], [AG, 1]]] };
  function robe(c1, c2, style, extra) { var o = { robe: c1, robe2: c1, belt: 0x5a3a20, trim: c2, skin: 0xc68a60, hair: 0x2b1d14, sandal: 0x6b4425, style: style || 'short' }; for (var k in extra || {}) o[k] = extra[k]; return o; }
  var ISR_NPCS = [
    { name: '솔로몬', x: JX + 68, z: TZC + 14, y: JT, emoji: '👑', look: robe(0x7a3a8a, 0xe0b040, 'long', { belt: 0xe0b040, fit: { beard: 0x2b1d14, sash: 0xe0b040 } }), text: '하나님이 참으로 땅에 거하시리이까 하늘과 하늘들의 하늘이라도 주를 용납하지 못하겠거든 하물며 내가 건축한 이 성전이오리이까', ref: '열왕기상 8:27' },
    { name: '레위 사람 찬양대', x: JX + 66, z: TZC - 15, y: JT, emoji: '🎺', look: robe(0xf2efe4, 0x5b7fb8, 'scarf', { scarf: 0xf2efe4, fit: { beard: 0x2b1d14 } }), text: '나팔 부는 자와 노래하는 자들이 일제히 소리를 내어 여호와를 찬송하며 감사하는데 나팔 불고 제금 치고 모든 악기를 울리며 소리를 높여 여호와를 찬송하여 이르되 선하시도다 그의 자비하심이 영원히 있도다 하매 그 때에 여호와의 전에 구름이 가득한지라', ref: '역대하 5:13' },
    { name: '솔로몬 왕', x: JX + 7, z: JZ + 23, y: JY, emoji: '⚖', look: robe(0x7a3a8a, 0xe0b040, 'long', { belt: 0xe0b040, fit: { beard: 0x2b1d14, sash: 0xe0b040 } }), text: '누가 주의 이 많은 백성을 재판할 수 있사오리이까 듣는 마음을 종에게 주사 주의 백성을 재판하여 선악을 분별하게 하옵소서', ref: '열왕기상 3:9' },
    { name: '감람유 장수', x: JX - 64, z: JZ - 5, y: JY, shop: 'olive', emoji: '🫒', look: shopLook(0x6a7a3a, 0x4a5a2a, 0xe8e0c0), text: '너는 또 이스라엘 자손에게 명령하여 감람으로 짠 순수한 기름을 등불을 위하여 네게로 가져오게 하고 끊이지 않게 등불을 켜되', ref: '출애굽기 27:20' },
    { name: '목재 상인', x: JX - 48, z: JZ - 5, y: JY, shop: 'cedar', emoji: '🌲', look: shopLook(0x7a5a3a, 0x4a3a20, 0, 0xb27a52, 1), text: '솔로몬의 모든 원대로 백향목 재목과 잣나무 재목을 주매', ref: '열왕기상 5:10' },
    { name: '목자', x: BC.x + 61, z: BC.z + 10, emoji: '🐑', look: robe(0xddd0b0, 0x7a5a3a, 'scarf', { scarf: 0xeee8d8, fit: { stripes: 0x7a5a3a, staff: 0x8a6236 } }), text: '천사들이 떠나 하늘로 올라가니 목자가 서로 말하되 이제 베들레헴으로 가서 주께서 우리에게 알리신 바 이 이루어진 일을 보자 하고', ref: '누가복음 2:15' },
    { name: '보아스', x: BC.x - 64, z: BC.z - 2, shop: 'boaz', emoji: '🌾', look: robe(0x8a6a48, 0x5a4028, 'short', { fit: { beard: 0x2b1d14 } }), text: '마침 보아스가 베들레헴에서부터 와서 베는 자들에게 이르되 여호와께서 너희와 함께 하시기를 원하노라 하니 그들이 대답하되 여호와께서 당신에게 복 주시기를 원하나이다 하니라', ref: '룻기 2:4' },
    { name: '나사렛 목수', x: NC0.x + 24, z: NC0.z + 12, y: NC0.y + 1, shop: 'carpenter', emoji: '🪚', look: robe(0x8a6a48, 0x5a4028, 'short', { fit: { beard: 0x2b1d14 } }), text: '이는 그 목수의 아들이 아니냐 그 어머니는 마리아, 그 형제들은 야고보, 요셉, 시몬, 유다라 하지 않느냐', ref: '마태복음 13:55' },
    { name: '시몬 베드로', x: CC.x, z: CC.z + 46, emoji: '🎣', look: robe(0x6a8aa0, 0x4a6a80, 'short', { fit: { beard: 0x2b1d14 } }), text: '시몬이 대답하여 이르되 선생님 우리들이 밤이 새도록 수고하였으되 잡은 것이 없지마는 말씀에 의지하여 내가 그물을 내리리이다 하고', ref: '누가복음 5:5' },
    { name: '갈릴리 어부', x: CC.x + 12, z: CC.z + 28, y: G, shop: 'galfish', emoji: '🐟', look: shopLook(0x5a7a90, 0x3a5a70, 0, 0xb27a52, 1), text: '말씀하시되 나를 따라오라 내가 너희를 사람을 낚는 어부가 되게 하리라 하시니', ref: '마태복음 4:19' },
    { name: '세리 마태', x: CC.x - 30, z: CC.z + 26, y: G, emoji: '🪙', look: robe(0x5a5a7a, 0xd8b060, 'short', {}), text: '예수께서 그 곳을 떠나 지나가시다가 마태라 하는 사람이 세관에 앉아 있는 것을 보시고 이르시되 나를 따르라 하시니 일어나 따르니라', ref: '마태복음 9:9' }
  ];
  var SYC = FAR_CITIES.filter(function (c) { return c.k === 'sychar'; })[0];
  ISR_NPCS.push({ name: '사마리아 여인', x: SYC.x + 3, z: SYC.z + 2, y: SYC.y + 1, emoji: '🏺', look: robe(0x8a5a6a, 0x5a3a4a, 'scarf', { scarf: 0xd8c8a8 }), text: '내가 행한 모든 일을 내게 말한 사람을 와서 보라 이는 그리스도가 아니냐 하니', ref: '요한복음 4:29' });
  ISR_NPCS.forEach(function (d) { NPC_DEFS.push(d); FAR_NPCS.push(d); });

  // ───────── 지역 카드·지켜지는 곳·찾기 ─────────
  function rc(k, x0, z0, x1, z1, name, text, ref, city) { REGION_INFO[k] = [name, text, ref]; LANDMARKS.unshift({ k: k, x0: x0, z0: z0, x1: x1, z1: z1, flat: 0, far: 1 }); SPOT_CITY[k] = city; }
  REGION_INFO.jerusalem = ['예루살렘', '예루살렘아 우리 발이 네 성문 안에 섰도다', '시편 122:2'];
  REGION_INFO.bethlehem = ['베들레헴', '베들레헴 에브라다야 너는 유다 족속 중에 작을지라도 이스라엘을 다스릴 자가 네게서 내게로 나올 것이라 그의 근본은 상고에, 영원에 있느니라', '미가 5:2'];
  REGION_INFO.nazareth = ['나사렛', '예수는 지혜와 키가 자라가며 하나님과 사람에게 더욱 사랑스러워 가시더라', '누가복음 2:52'];
  REGION_INFO.capernaum = ['가버나움', '나사렛을 떠나 스불론과 납달리 지경 해변에 있는 가버나움에 가서 사시니', '마태복음 4:13'];
  // 큰 곳을 먼저 넣고 작은 곳을 나중에 넣는다(unshift라 나중 것이 먼저 걸림)
  rc('jtemple', JX - 24, JZ - 82, JX + 97, JZ - 3, '솔로몬 성전 · 솔로몬 시대', '솔로몬이 예루살렘 모리아 산에 여호와의 전 건축하기를 시작하니 그 곳은 전에 여호와께서 그의 아버지 다윗에게 나타나신 곳이요 여부스 사람 오르난의 타작 마당에 다윗이 정한 곳이라', '역대하 3:1', 'jerusalem');
  rc('jholy', HX0, HZ0, HX0 + 21, HZ1, '지성소', '그 길은 우리를 위하여 휘장 가운데로 열어 놓으신 새로운 살 길이요 휘장은 곧 그의 육체니라', '히브리서 10:20', 'jerusalem');
  rc('jpillars', JX + 63, TZC - 10, JX + 70, TZC + 9, '야긴과 보아스', '이 두 기둥을 성전의 주랑 앞에 세우되 오른쪽 기둥을 세우고 그 이름을 야긴이라 하고 왼쪽의 기둥을 세우고 그 이름을 보아스라 하였으며', '열왕기상 7:21', 'jerusalem');
  rc('jaltar', JX + 72, TZC - 10, JX + 91, TZC + 19, '놋 제단', '솔로몬이 또 놋으로 제단을 만들었으니 길이가 이십 규빗이요 너비가 이십 규빗이요 높이가 십 규빗이며', '역대하 4:1', 'jerusalem');
  rc('jsea', JX + 54, TZC + 19, JX + 66, TZC + 31, '놋 바다', '또 바다를 부어 만들었으니 그 직경이 십 규빗이요 그 모양이 둥글며 그 높이는 다섯 규빗이요 주위는 삼십 규빗 줄을 두를 만하며', '열왕기상 7:23', 'jerusalem');
  rc('jcourt', JX - 14, JZ + 4, JX + 96, JZ + 118, '왕궁 큰 뜰 · 솔로몬 시대', '또 큰 뜰 주위에는 다듬은 돌 세 켜와 백향목 두꺼운 판자 한 켜를 놓았으니 마치 여호와의 성전 안뜰과 주랑에 놓은 것 같더라', '열왕기상 7:12', 'jerusalem');
  rc('jpalace', JX - 10, JZ + 67, JX + 89, JZ + 116, '레바논 나무 궁 · 솔로몬 시대', '그가 레바논 나무로 왕궁을 지었으니 길이가 백 규빗이요 너비가 오십 규빗이요 높이가 삼십 규빗이라 백향목 기둥이 네 줄이요 기둥 위에 백향목 들보가 있으며', '열왕기상 7:2', 'jerusalem');
  rc('jpillared', JX - 6, JZ + 29, JX + 43, JZ + 63, '기둥 주랑 · 솔로몬 시대', '또 기둥을 세워 주랑을 지었으니 길이가 오십 규빗이요 너비가 삼십 규빗이며 또 기둥 앞에 한 주랑이 있고 또 그 앞에 기둥과 섬돌이 있으며', '열왕기상 7:6', 'jerusalem');
  rc('jroyal', JX + 28, JZ + 7, JX + 93, JZ + 31, '왕궁과 바로의 딸의 집 · 솔로몬 시대', '솔로몬이 거처할 왕궁은 그 주랑 뒤 다른 뜰에 있으니 그 양식이 동일하며 솔로몬이 또 그가 장가 든 바로의 딸을 위하여 집을 지었는데 이 주랑과 같더라', '열왕기상 7:8', 'jerusalem');
  rc('jjudge', JX - 6, JZ + 8, JX + 21, JZ + 27, '재판하는 주랑 · 솔로몬 시대', '또 심판하기 위하여 보좌의 주랑 곧 재판하는 주랑을 짓고 온 마루를 백향목으로 덮었고', '열왕기상 7:7', 'jerusalem');
  rc('jthrone', JX + 3, JZ + 11, JX + 11, JZ + 21, '솔로몬의 보좌', '그 보좌에는 여섯 층계가 있고 보좌 뒤에 둥근 머리가 있고 앉는 자리 양쪽에는 팔걸이가 있고 팔걸이 곁에는 사자가 하나씩 서 있으며', '열왕기상 10:19', 'jerusalem');
  rc('jdavid', JX + 20, JZ + 119, JX + 97, JZ + 157, '다윗 성 · 다윗 시대', '다윗이 시온 산성을 빼앗았으니 이는 다윗 성이더라', '사무엘하 5:7', 'jerusalem');
  rc('jdhouse', JX + 22, JZ + 119, JX + 60, JZ + 134, '다윗의 집 · 다윗 시대', '두로 왕 히람이 다윗에게 사절들과 백향목과 목수와 석수를 보내매 그들이 다윗을 위하여 집을 지으니', '사무엘하 5:11', 'jerusalem');
  rc('jmillo', JX + 61, JZ + 119, JX + 71, JZ + 131, '밀로 · 다윗 시대', '다윗이 그 산성에 살면서 다윗 성이라 이름하고 다윗이 밀로에서부터 안으로 성을 둘러 쌓으니라', '사무엘하 5:9', 'jerusalem');
  rc('jwater', JX + 90, JZ + 118, JX + 95, JZ + 127, '물 긷는 데 · 다윗 시대', '그 날에 다윗이 이르기를 누구든지 여부스 사람을 치거든 물 긷는 데로 올라가서 다윗의 마음에 미워하는 다리 저는 사람과 맹인을 치라 하였으므로 속담이 되어 이르기를 맹인과 다리 저는 사람은 집에 들어오지 못하리라 하더라', '사무엘하 5:8', 'jerusalem');
  rc('jantonia', JX + 5, JZ - 97, JX + 37, JZ - 83, '안토니아 요새 · 사도 시대', '무리 가운데서 어떤 이는 이런 말로, 어떤 이는 저런 말로 소리 치거늘 천부장이 소동으로 말미암아 진상을 알 수 없어 그를 영내로 데려가라 명하니라', '사도행전 21:34', 'jerusalem');
  rc('jpraet', JX - 97, JZ - 45, JX - 58, JZ - 9, '헤롯 궁 · 빌라도의 관정 · 예수님 시대', '군인들이 예수를 끌고 브라이도리온이라는 뜰 안으로 들어가서 온 군대를 모으고', '마가복음 15:16', 'jerusalem');
  rc('jgabbatha', JX - 57, JZ - 33, JX - 45, JZ - 15, '가바다 · 예수님 시대', '빌라도가 이 말을 듣고 예수를 끌고 나가서 돌을 깐 뜰(히브리 말로 가바다)에 있는 재판석에 앉아 있더라', '요한복음 19:13', 'jerusalem');
  rc('jsimon', JX - 81, JZ - 60, JX - 76, JZ - 46, '골고다 길 · 구레네 사람 시몬', '마침 알렉산더와 루포의 아버지인 구레네 사람 시몬이 시골로부터 와서 지나가는데 그들이 그를 억지로 같이 가게 하여 예수의 십자가를 지우고', '마가복음 15:21', 'jerusalem');
  rc('jdaughters', JX - 112, JZ - 62, JX - 82, JZ - 57, '골고다 길 · 우는 여자들', '예수께서 돌이켜 그들을 향하여 이르시되 예루살렘의 딸들아 나를 위하여 울지 말고 너희와 너희 자녀를 위하여 울라', '누가복음 23:28', 'jerusalem');
  rc('jbethany', JX + 160, JZ + 48, JX + 192, JZ + 76, '베다니 · 예수님 시대', '베다니는 예루살렘에서 가깝기가 한 오 리쯤 되매', '요한복음 11:18', 'jerusalem');
  rc('jmartha', JX + 173, JZ + 55, JX + 181, JZ + 63, '마르다의 집', '그들이 길 갈 때에 예수께서 한 마을에 들어가시매 마르다라 이름하는 한 여자가 자기 집으로 영접하더라', '누가복음 10:38', 'jerusalem');
  rc('jlazarus', JX + 182, JZ + 61, JX + 191, JZ + 73, '나사로의 무덤', '이에 예수께서 다시 속으로 비통히 여기시며 무덤에 가시니 무덤이 굴이라 돌로 막았거늘', '요한복음 11:38', 'jerusalem');
  rc('jrachel', JX + 9, JZ - 169, JX + 17, JZ - 161, '라헬의 묘비', '야곱이 라헬의 묘에 비를 세웠더니 지금까지 라헬의 묘비라 일컫더라', '창세기 35:20', 'jerusalem');
  rc('jsiloam', JX + 53, JZ + 138, JX + 70, JZ + 154, '실로암 못 · 예수님 시대', '이르시되 실로암 못에 가서 씻으라 하시니 (실로암은 번역하면 보냄을 받았다는 뜻이라) 이에 가서 씻고 밝은 눈으로 왔더라', '요한복음 9:7', 'jerusalem');
  rc('jbethesda', JX + 40, JZ - 97, JX + 68, JZ - 85, '베데스다 못 · 예수님 시대', '예루살렘에 있는 양문 곁에 히브리 말로 베데스다라 하는 못이 있는데 거기 행각 다섯이 있고', '요한복음 5:2', 'jerusalem');
  rc('jupper', JX - 71, JZ + 29, JX - 58, JZ + 44, '큰 다락방 · 예수님 시대', '그리하면 자리를 펴고 준비한 큰 다락방을 보이리니 거기서 우리를 위하여 준비하라 하시니', '마가복음 14:15', 'jerusalem');
  rc('jgihon', JX + 112, JZ + 120, JX + 134, JZ + 132, '기혼 샘과 히스기야 수로', '이 히스기야가 또 기혼의 윗샘물을 막아 그 아래로부터 다윗 성 서쪽으로 곧게 끌어들였으니 히스기야가 그의 모든 일에 형통하였더라', '역대하 32:30', 'jerusalem');
  rc('jgolgotha', JX - 135, JZ - 73, JX - 113, JZ - 51, '골고다 · 예수님 시대', '그들이 예수를 맡으매 예수께서 자기의 십자가를 지시고 해골(히브리 말로 골고다)이라 하는 곳에 나가시니', '요한복음 19:17', 'jerusalem');
  rc('jtomb', JX - 134, JZ - 42, JX - 108, JZ - 16, '빈 무덤 · 예수님 시대', '그가 여기 계시지 않고 그가 말씀 하시던 대로 살아나셨느니라 와서 그가 누우셨던 곳을 보라', '마태복음 28:6', 'jerusalem');
  rc('jgeth', JX + 110, JZ - 48, JX + 138, JZ - 20, '겟세마네 · 감람산', '이에 예수께서 제자들과 함께 겟세마네라 하는 곳에 이르러 제자들에게 이르시되 내가 저기 가서 기도할 동안에 너희는 여기 앉아 있으라 하시고', '마태복음 26:36', 'jerusalem');
  rc('bwell', BC.x + 1, BC.z - BC.r - 8, BC.x + 10, BC.z - BC.r - 1, '성문 곁 우물', '다윗이 소원하여 이르되 베들레헴 성문 곁 우물 물을 누가 내게 마시게 할까 하매', '사무엘하 23:15', 'bethlehem');
  rc('bstable', BC.x + 17, BC.z + 7, BC.x + 31, BC.z + 20, '구유가 있는 집', '첫아들을 낳아 강보로 싸서 구유에 뉘었으니 이는 여관에 있을 곳이 없음이러라', '누가복음 2:7', 'bethlehem');
  rc('bfield', BC.x + 56, BC.z - 10, BC.x + 82, BC.z + 16, '목자들의 들', '그 지역에 목자들이 밤에 밖에서 자기 양 떼를 지키더니', '누가복음 2:8', 'bethlehem');
  rc('bboaz', BC.x - 87, BC.z - 9, BC.x - 65, BC.z + 5, '보아스의 밭', '마침 보아스가 베들레헴에서부터 와서 베는 자들에게 이르되 여호와께서 너희와 함께 하시기를 원하노라 하니 그들이 대답하되 여호와께서 당신에게 복 주시기를 원하나이다 하니라', '룻기 2:4', 'bethlehem');
  rc('nsyn', NC0.x - 9, NC0.z - 33, NC0.x + 9, NC0.z - 19, '나사렛 회당', '예수께서 그 자라나신 곳 나사렛에 이르사 안식일에 늘 하시던 대로 회당에 들어가사 성경을 읽으려고 서시매', '누가복음 4:16', 'nazareth');
  rc('ncarp', NC0.x + 10, NC0.z + 7, NC0.x + 28, NC0.z + 18, '목수의 집', '이는 그 목수의 아들이 아니냐 그 어머니는 마리아, 그 형제들은 야고보, 요셉, 시몬, 유다라 하지 않느냐', '마태복음 13:55', 'nazareth');
  rc('csyn', CC.x - 10, CC.z - 32, CC.x + 10, CC.z - 18, '가버나움 회당', '그들이 가버나움에 들어가니라 예수께서 곧 안식일에 회당에 들어가 가르치시매', '마가복음 1:21', 'capernaum');
  rc('cpeter', CC.x + 8, CC.z + 6, CC.x + 25, CC.z + 20, '시몬과 안드레의 집', '회당에서 나와 곧 야고보와 요한과 함께 시몬과 안드레의 집에 들어가시니', '마가복음 1:29', 'capernaum');
  rc('croof', CC.x - 22, CC.z - 2, CC.x - 11, CC.z + 10, '지붕을 뜯은 집', '무리들 때문에 예수께 데려갈 수 없으므로 그 계신 곳의 지붕을 뜯어 구멍을 내고 중풍병자가 누운 상을 달아 내리니', '마가복음 2:4', 'capernaum');
  REGION_INFO.sychar = ['수가 · 사마리아', '사마리아에 있는 수가라 하는 동네에 이르시니 야곱이 그 아들 요셉에게 준 땅이 가깝고', '요한복음 4:5'];
  rc('sjacob', SYC.x - 34, SYC.z + 48, SYC.x - 26, SYC.z + 56, '야곱의 우물', '거기 또 야곱의 우물이 있더라 예수께서 길 가시다가 피곤하여 우물 곁에 그대로 앉으시니 때가 여섯 시쯤 되었더라', '요한복음 4:6', 'sychar');
  rc('sjoseph', SYC.x - 19, SYC.z + 55, SYC.x - 13, SYC.z + 61, '요셉의 무덤', '또 이스라엘 자손이 애굽에서 가져 온 요셉의 뼈를 세겜에 장사하였으니 이곳은 야곱이 백 크시타를 주고 세겜의 아버지 하몰의 자손들에게서 산 밭이라 그것이 요셉 자손의 기업이 되었더라', '여호수아 24:32', 'sychar');
  rc('sgerizim', GERX - 16, GERZ - 16, GERX + 16, GERZ + 16, '그리심 산', '우리 조상들은 이 산에서 예배하였는데 당신들의 말은 예배할 곳이 예루살렘에 있다 하더이다', '요한복음 4:20', 'sychar');
  rc('sebal', EBX - 14, EBZ - 14, EBX + 14, EBZ + 14, '에발 산', '네 하나님 여호와께서 네가 가서 차지할 땅으로 너를 인도하여 들이실 때에 너는 그리심 산에서 축복을 선포하고 에발 산에서 저주를 선포하라', '신명기 11:29', 'sychar');
  ISR_KEYS.push('jerusalem', 'bethlehem', 'nazareth', 'capernaum', 'sychar');
  FAR_INFO.sychar = { label: '💧 수가', x: SYC.x, z: SYC.z, rumor: '예루살렘 북문에서 큰길을 따라 북쪽으로 한참 가면, 두 산 사이 마을 곁에 야곱이 판 오래된 우물이 있대요.' };
  FAR_INFO.jerusalem = { label: '🏛 예루살렘', x: JX, z: JZ, rumor: '요단 강을 따라 남쪽으로 한참 내려가다 해 지는 쪽 산 위를 보면, 성전이 선 성이 있대요.' };
  FAR_INFO.bethlehem = { label: '⭐ 베들레헴', x: BC.x, z: BC.z, rumor: '산 위의 큰 성에서 남쪽으로 조금만 가면 작은 마을이 있고, 그 들에서 목자들이 양을 지킨대요.' };
  FAR_INFO.nazareth = { label: '🪚 나사렛', x: NC0.x, z: NC0.z, rumor: '갈릴리 호수에서 해 지는 쪽 언덕 위에, 목수가 사는 작은 마을이 있대요.' };
  FAR_INFO.capernaum = { label: '⛵ 가버나움', x: CC.x, z: CC.z, rumor: '갈릴리 호수 북쪽 물가에, 검은 돌로 지은 고기잡이 마을이 있대요.' };
  ADVS.push(
    ['far_jerusalem', '🏛 예루살렘 찾기', '성전이 선 산 위의 성을 찾아요', [[GEM_SAPH, 2], [ING_AU, 2]], ['🏛', '예루살렘', REGION_INFO.jerusalem[1], REGION_INFO.jerusalem[2]]],
    ['far_bethlehem', '⭐ 베들레헴 찾기', '목자들이 양을 지키는 작은 마을을 찾아요', [[BREAD, 6], [WOOL, 6]], ['⭐', '베들레헴', REGION_INFO.bethlehem[1], REGION_INFO.bethlehem[2]]],
    ['far_nazareth', '🪚 나사렛 찾기', '목수가 사는 언덕 위 마을을 찾아요', [[GOPHER, 24], [ING_AG, 2]], ['🪚', '나사렛', REGION_INFO.nazareth[1], REGION_INFO.nazareth[2]]],
    ['far_capernaum', '⛵ 가버나움 찾기', '호숫가 고기잡이 마을을 찾아요', [[COOKED_FISH, 6], [ING_AG, 2]], ['⛵', '가버나움', REGION_INFO.capernaum[1], REGION_INFO.capernaum[2]]],
    ['far_sychar', '💧 수가 찾기', '두 산 사이 우물 마을을 찾아요', [[ING_AG, 2], [BREAD, 4]], ['💧', '수가', REGION_INFO.sychar[1], REGION_INFO.sychar[2]]],
    ['far_israel', '🌿 아름다운 땅', '예루살렘·베들레헴·나사렛·가버나움·수가를 모두 찾아요', [[GEM_DIA, 1], [ING_AU, 3]], ['🌿', '아름다운 땅', '네 하나님 여호와께서 너를 아름다운 땅에 이르게 하시나니 그 곳은 골짜기든지 산지든지 시내와 분천과 샘이 흐르고', '신명기 8:7']]
  );
  farLabels();
