  // ════════ 2026-11-24 먼 나라·먼 땅·장사하는 사람 ════════
  // 전도사님: 「사막, 늪, 설산, 아라랏 산, 다른 민족(바벨론, 앗수르 등), 주민 등등도… 주민들이 물건도 팔고」
  //           「다른 도시들은 나그네 마을과 멀리 떨어져 있게 해 발견하게 쉽지 않게」
  // - 다른 민족의 성은 적이 아니라 장사하고 구경하는 곳(렘 29:7, 욘 4:11). 싸움은 지금처럼 「어둠의 그림자」만.
  // - 자리·땅 모양은 03-world-gen(FAR_CITIES·늪·눈 덮인 산·유브라데·나일), 지역 카드는 15b REGION_INFO.
  // - 지도 이름과 길 안내는 없다. 처음 밟으면 큰 지도에 이름이 생기고 모험 보상을 받는다. 마을 상인이 은 1에 소문을 판다.
  // - 사람들의 말은 성경 구절만(개역개정 원문 대조, bskorea 2026-11-24). 값은 은 덩이로 매긴다.
  function fbox(x0, y0, z0, x1, y1, z1, id) { fill(Math.min(x0, x1), Math.min(y0, y1), Math.min(z0, z1), Math.max(x0, x1), Math.max(y0, y1), Math.max(z0, z1), id); }
  // 버드나무(시 137:2): 짧은 줄기 + 둥근 잎 + 늘어진 가지
  function willowTree(x, y, z, h) {
    for (var i = 0; i < h; i++) setRaw(x, y + i, z, LOG);
    var ty = y + h;
    for (var dz = -3; dz <= 3; dz++) for (var dx = -3; dx <= 3; dx++) {
      var d = Math.abs(dx) + Math.abs(dz); if (d > 4) continue;
      if (get2(x + dx, ty, z + dz) === AIR) setRaw(x + dx, ty, z + dz, LEAF);
      if (d <= 2 && get2(x + dx, ty + 1, z + dz) === AIR) setRaw(x + dx, ty + 1, z + dz, LEAF);
      if (d >= 3 && hash2(x + dx, z + dz, 77) < 0.55) { var L = 1 + Math.floor(hash2(x - dx, z - dz, 78) * 3); for (var k = 1; k <= L; k++) if (get2(x + dx, ty - k, z + dz) === AIR) setRaw(x + dx, ty - k, z + dz, LEAF); }
    }
  }

  // ───────── 성 짓기 공통 ─────────
  var FB = G;   // 성 바닥(사람이 서는 높이). 예루살렘처럼 높은 터는 짓는 동안 바꾼다
  var PLASTER = 11, ROOF_TILE = 13, MUDBRICK = 20, LIMESTONE = 21, THATCH = 22, CLOTH_B = 14, CLOTH_Y = 15, CLOTH_G = 17;
  function farGround(c, pave) {   // 성터 비우기 + 바닥
    var m = c.r + 7;
    fbox(c.x - m, G, c.z - m, c.x + m, SY - 1, c.z + m, AIR);
    fbox(c.x - m, G - 6, c.z - m, c.x + m, G - 2, c.z + m, DIRT);
    fbox(c.x - m, G - 1, c.z - m, c.x + m, G - 1, c.z + m, pave);
  }
  function farMoat(c, gate, bridge) {   // 성벽 밖 해자(폭 3)와 네 문 앞 다리
    var R = c.r + 3;
    fbox(c.x - R, G - 4, c.z - R, c.x + R, G - 4, c.z + R, CLAY); fbox(c.x - R, G - 3, c.z - R, c.x + R, G - 1, c.z + R, WATER);
    fbox(c.x - c.r, G - 4, c.z - c.r, c.x + c.r, G - 2, c.z + c.r, DIRT);
    var g = (gate >> 1) + 1;
    fbox(c.x - g, G - 1, c.z - R, c.x + g, G - 1, c.z - c.r, bridge); fbox(c.x - g, G - 1, c.z + c.r, c.x + g, G - 1, c.z + R, bridge);
    fbox(c.x - R, G - 1, c.z - g, c.x - c.r, G - 1, c.z + g, bridge); fbox(c.x + c.r, G - 1, c.z - g, c.x + R, G - 1, c.z + g, bridge);
  }
  function farWalls(c, wall, H, gate, gateH, towerEvery) {
    var x0 = c.x - c.r, x1 = c.x + c.r, z0 = c.z - c.r, z1 = c.z + (c.zs || c.r), k;
    fbox(x0, FB - 1, z0, x1, FB + H, z0 + 2, wall); fbox(x0, FB - 1, z1 - 2, x1, FB + H, z1, wall);
    fbox(x0, FB - 1, z0, x0 + 2, FB + H, z1, wall); fbox(x1 - 2, FB - 1, z0, x1, FB + H, z1, wall);
    for (k = x0; k <= x1; k += 2) { setRaw(k, FB + H + 1, z0, wall); setRaw(k, FB + H + 1, z1, wall); }
    for (k = z0; k <= z1; k += 2) { setRaw(x0, FB + H + 1, k, wall); setRaw(x1, FB + H + 1, k, wall); }
    function tower(tx, tz, s) { fbox(tx - s, FB - 1, tz - s, tx + s, FB + H + 3, tz + s, wall); for (var q = -s; q <= s; q += 2) { setRaw(tx + q, FB + H + 4, tz - s, wall); setRaw(tx + q, FB + H + 4, tz + s, wall); setRaw(tx - s, FB + H + 4, tz + q, wall); setRaw(tx + s, FB + H + 4, tz + q, wall); } }
    [[x0 + 1, z0 + 1], [x1 - 1, z0 + 1], [x0 + 1, z1 - 1], [x1 - 1, z1 - 1]].forEach(function (q) { tower(q[0], q[1], 3); });
    if (towerEvery) for (k = -c.r + towerEvery; k <= c.r - towerEvery; k += towerEvery) {
      if (Math.abs(k) <= gate + 2) continue;
      tower(c.x + k, z0 + 1, 2); tower(c.x + k, z1 - 1, 2); tower(x0 + 1, c.z + k, 2); tower(x1 - 1, c.z + k, 2);
    }
    if (towerEvery && c.zs) for (k = c.r; k <= c.zs - towerEvery; k += towerEvery) { tower(x0 + 1, c.z + k, 2); tower(x1 - 1, c.z + k, 2); }
    var g = gate >> 1;
    fbox(c.x - g, FB, z0, c.x + g, FB + gateH - 1, z0 + 2, AIR); fbox(c.x - g, FB, z1 - 2, c.x + g, FB + gateH - 1, z1, AIR);
    fbox(x0, FB, c.z - g, x0 + 2, FB + gateH - 1, c.z + g, AIR); fbox(x1 - 2, FB, c.z - g, x1, FB + gateH - 1, c.z + g, AIR);
    // 성벽 위로 오르는 돌계단(문 안쪽 오른편) — 높은 곳에서 성을 내려다보게
    for (k = 0; k <= H; k++) fbox(c.x + g + 3 + k, FB, z1 - 3, c.x + g + 3 + k, FB + k, z1 - 3, wall);
  }
  // 집: 바닥 G-1, 벽 h칸, 평평한 지붕. door: 'n'|'s'|'e'|'w'
  function farHouse(x0, z0, w, d, h, wall, roof, door, seed) {
    var x1 = x0 + w - 1, z1 = z0 + d - 1, top = FB + h - 1;
    fbox(x0, FB - 1, z0, x1, FB - 1, z1, PATH);
    fbox(x0, FB, z0, x1, top, z1, wall); fbox(x0 + 1, FB, z0 + 1, x1 - 1, top - 1, z1 - 1, AIR); fbox(x0, top, z0, x1, top, z1, roof);
    var mx = (x0 + x1) >> 1, mz = (z0 + z1) >> 1;
    if (door === 'n') fbox(mx, FB, z0, mx + 1, FB + 3, z0, AIR); else if (door === 's') fbox(mx, FB, z1, mx + 1, FB + 3, z1, AIR);
    else if (door === 'w') fbox(x0, FB, mz, x0, FB + 3, mz + 1, AIR); else fbox(x1, FB, mz, x1, FB + 3, mz + 1, AIR);
    if (door !== 'e' && door !== 'w') { setRaw(x0, FB + 2, mz, AIR); setRaw(x1, FB + 2, mz, AIR); } else { setRaw(mx, FB + 2, z0, AIR); setRaw(mx, FB + 2, z1, AIR); }   // 작은 창
    setRaw(x0 + 1, FB, z0 + 1, LAMP); setRaw(x1 - 1, FB, z0 + 1, JAR);
    if (hash2(seed, 3, 81) < 0.5) setRaw(x1 - 1, FB, z1 - 1, BED); else setRaw(x1 - 1, FB, z1 - 1, CHAIR);
    if (w > 6 && d > 6) fbox(mx - 1, FB, mz - 1, mx, FB, mz, CARPET);
  }
  function farStall(x, z, cloth) {   // 장터 가판: 기둥 넷 + 천 지붕 + 뒤쪽 항아리
    [[-2, -2], [2, -2], [-2, 2], [2, 2]].forEach(function (q) { fbox(x + q[0], FB, z + q[1], x + q[0], FB + 3, z + q[1], FENCE); });
    fbox(x - 2, FB + 4, z - 2, x + 2, FB + 4, z + 2, cloth);
    setRaw(x - 1, FB, z - 2, JAR); setRaw(x + 1, FB, z - 2, OIL_JAR);
  }
  // 집 줄: 한 칸 13칸, 집 10칸 — 피할 곳(skip)을 빼고 채운다
  function farHouseGrid(c, wallFn, roof, skip) {
    var lots = [-56, -43, -30, -17, 7, 20, 33, 46];
    lots.forEach(function (lx) { lots.forEach(function (lz) {
      if (skip(lx, lz)) return;
      var x0 = c.x + lx, z0 = c.z + lz, sd = x0 * 7 + z0 * 13, h = hash2(sd, 1, 82) < 0.3 ? 8 : 6;
      var door = Math.abs(lz + 5) >= Math.abs(lx + 5) ? (lz < 0 ? 's' : 'n') : (lx < 0 ? 'e' : 'w');
      farHouse(x0, z0, 10, 10, h, wallFn(sd), roof, door, sd);
    }); });
  }
  function overlap(lx, lz, ax, az, bx, bz) { return lx <= bx && lx + 9 >= ax && lz <= bz && lz + 9 >= az; }

  // ───────── 바벨론(창 11:3 벽돌과 역청, 시 137:1 강변, 단 6:10 다니엘의 윗방) ─────────
  function buildBabylon(c) {
    var X = c.x, Z = c.z, r = c.r, k, t;
    farGround(c, SAND); farMoat(c, 5, PATH);
    fbox(X - r, G - 1, Z - r, X + r, G - 1, Z + r, SAND);
    fbox(X - 3, G - 1, Z - r, X + 3, G - 1, Z + r, PATH); fbox(X - r, G - 1, Z - 2, X + r, G - 1, Z + 2, PATH);
    farWalls(c, BRICK, 13, 5, 8, 16);
    // 북쪽 큰 문: 푸른 유약 벽돌(청옥 블록)과 금 띠
    var z0 = Z - r;
    fbox(X - 7, G - 1, z0 - 2, X + 7, G + 17, z0 + 3, BLK_SAPH);
    fbox(X - 2, G, z0 - 2, X + 2, G + 9, z0 + 3, AIR);
    for (k = -7; k <= 7; k++) { setRaw(X + k, G + 12, z0 - 2, BLK_AU); if (!(k & 1)) setRaw(X + k, G + 18, z0 - 2, BLK_SAPH); }
    for (k = -6; k <= 6; k += 3) if (Math.abs(k) > 2) { setRaw(X + k, G + 3, z0 - 2, BLK_AU); setRaw(X + k, G + 7, z0 - 2, BLK_AU); }
    // 행렬 길 등불
    for (k = Z - r + 6; k < Z - 32; k += 8) { setRaw(X - 4, G, k, LANTERN); setRaw(X + 4, G, k, LANTERN); }
    // 가운데: 짓다 그친 높은 탑의 터(창 11:8-9) — 세 켜 + 무너진 꼭대기, 켜마다 남쪽 계단, 켜 밑단은 역청
    for (t = 0; t < 3; t++) {
      var hf = 18 - 6 * t, y0 = G + 5 * t;
      fbox(X - hf, y0, Z - hf, X + hf, y0 + 4, Z + hf, BRICK);
      fbox(X - hf, y0, Z - hf, X + hf, y0, Z - hf, TAR); fbox(X - hf, y0, Z + hf, X + hf, y0, Z + hf, TAR);
      fbox(X - hf, y0, Z - hf, X - hf, y0, Z + hf, TAR); fbox(X + hf, y0, Z - hf, X + hf, y0, Z + hf, TAR);
      for (k = 0; k <= 4; k++) fbox(X - 1, y0, Z + hf + 5 - k, X + 1, y0 + k, Z + hf + 5 - k, BRICK);
    }
    fbox(X - 3, G + 15, Z - 3, X + 3, G + 19, Z + 3, BRICK);
    for (var yy = G + 12; yy <= G + 19; yy++) for (var dz = -6; dz <= 6; dz++) for (var dx = -6; dx <= 6; dx++)
      if ((Math.abs(dx) >= 5 || Math.abs(dz) >= 5 || yy >= G + 16) && hash2(X + dx * 3 + yy, Z + dz * 5 - yy, 83) < (yy - G - 11) * 0.09) setRaw(X + dx, yy, Z + dz, AIR);
    // 장터 가판
    farStall(X - 22, Z - 25, CLOTH_B); farStall(X + 22, Z - 25, CLOTH_Y);
    // 집들(흙벽돌·흰 벽·붉은 벽돌)
    farHouseGrid(c, function (sd) { var q = hash2(sd, 2, 84); return q < 0.45 ? MUDBRICK : q < 0.8 ? PLASTER : BRICK; }, PLASTER, function (lx, lz) {
      return overlap(lx, lz, -27, -31, 27, 31) || (lx === -56 && lz === 46);
    });
    // 다니엘의 집: 윗방, 예루살렘 쪽(서쪽)으로 연 창(단 6:10)
    var hx = X - 56, hz = Z + 45;
    fbox(hx, G - 1, hz, hx + 11, G - 1, hz + 11, PATH);
    fbox(hx, G, hz, hx + 11, G + 11, hz + 11, PLASTER); fbox(hx + 1, G, hz + 1, hx + 10, G + 10, hz + 10, AIR);
    fbox(hx + 1, G + 5, hz + 1, hx + 10, G + 5, hz + 10, GOPHER);
    fbox(hx, G + 11, hz, hx + 11, G + 11, hz + 11, PLASTER);
    fbox(hx + 5, G, hz, hx + 6, G + 3, hz, AIR);                                   // 북쪽 문
    for (k = 0; k <= 5; k++) fbox(hx + 3 + k, G, hz + 9, hx + 3 + k, G + k, hz + 10, BRICK);   // 윗방 계단
    fbox(hx + 2, G + 5, hz + 9, hx + 8, G + 5, hz + 10, AIR); setRaw(hx + 8, G + 5, hz + 9, BRICK); setRaw(hx + 8, G + 5, hz + 10, BRICK);
    fbox(hx, G + 7, hz + 4, hx, G + 8, hz + 6, AIR);                               // 서쪽 창
    fbox(hx + 2, G + 6, hz + 4, hx + 3, G + 6, hz + 6, CARPET); setRaw(hx + 9, G + 6, hz + 2, LAMP); setRaw(hx + 2, G, hz + 2, LAMP);
    setRaw(hx + 9, G + 6, hz + 6, CHAIR); setRaw(hx + 9, G, hz + 2, JAR);
  }
  // ───────── 니느웨(욘 3:3 큰 성읍, 3:6 왕의 보좌, 4:5 요나의 초막) ─────────
  function buildNineveh(c) {
    var X = c.x, Z = c.z, r = c.r, k;
    farGround(c, GRASS); farMoat(c, 5, SBRICK);
    fbox(X - r, G - 1, Z - r, X + r, G - 1, Z + r, GRASS);
    fbox(X - 3, G - 1, Z - r, X + 3, G - 1, Z + r, PATH); fbox(X - r, G - 1, Z - 2, X + r, G - 1, Z + 2, PATH);
    farWalls(c, SBRICK, 12, 5, 8, 14);
    // 가운데 장터: 우물과 가판 둘
    fbox(X - 14, G - 1, Z - 14, X + 14, G - 1, Z + 14, PATH);
    fbox(X - 2, G - 1, Z - 2, X + 2, G - 1, Z + 2, SBRICK); setRaw(X, G, Z, WELL);
    farStall(X - 9, Z - 9, CLOTH_G); farStall(X + 9, Z - 9, WOOL_R);
    [[-13, -13], [13, -13], [-13, 13], [13, 13]].forEach(function (q) { setRaw(X + q[0], G, Z + q[1], LANTERN); });
    // 왕궁(북서쪽): 석회암 벽, 앞 기둥 줄, 금 띠, 보좌
    var px0 = X - 60, px1 = X - 28, pz0 = Z - 60, pz1 = Z - 38;
    fbox(px0 - 1, G - 1, pz0 - 1, px1 + 1, G - 1, pz1 + 4, LIMESTONE);
    fbox(px0, G, pz0, px1, G + 9, pz1, LIMESTONE); fbox(px0 + 1, G, pz0 + 1, px1 - 1, G + 8, pz1 - 1, AIR);
    fbox(px0, G + 9, pz0, px1, G + 9, pz1, LIMESTONE); fbox(px0, G + 7, pz1, px1, G + 7, pz1, BLK_AU);
    fbox(X - 46, G, pz1, X - 42, G + 5, pz1, AIR);
    for (k = px0; k <= px1; k += 3) fbox(k, G, pz1 + 3, k, G + 8, pz1 + 3, PILLAR);
    fbox(px0, G + 9, pz1 + 1, px1, G + 9, pz1 + 3, LIMESTONE);
    fbox(X - 47, G, pz0 + 2, X - 41, G, pz0 + 4, BLK_AU); setRaw(X - 44, G + 1, pz0 + 3, CHAIR);
    fbox(X - 45, G, pz0 + 6, X - 43, G, pz1 - 1, CARPET);
    setRaw(px0 + 2, G, pz0 + 2, LANTERN); setRaw(px1 - 2, G, pz0 + 2, LANTERN); setRaw(px0 + 2, G, pz1 - 2, LANTERN); setRaw(px1 - 2, G, pz1 - 2, LANTERN);
    farHouseGrid(c, function (sd) { var q = hash2(sd, 2, 85); return q < 0.5 ? LIMESTONE : q < 0.8 ? MUDBRICK : PLASTER; }, PLASTER, function (lx, lz) {
      return overlap(lx, lz, -62, -62, -26, -34) || overlap(lx, lz, -16, -16, 16, 16);
    });
  }
  function buildJonahBooth() {   // 성읍 동쪽 초막(욘 4:5)과 그늘을 만든 박넝쿨(욘 4:6)
    terrain(JONAH_X, JONAH_Z); var y = T.h + 1, x = JONAH_X, z = JONAH_Z;
    fbox(x - 3, y - 1, z - 3, x + 3, y - 1, z + 3, GRASS); fbox(x - 3, y, z - 3, x + 3, y + 5, z + 3, AIR);
    [[-2, -2], [2, -2], [-2, 2], [2, 2]].forEach(function (q) { fbox(x + q[0], y, z + q[1], x + q[0], y + 3, z + q[1], LOG); });
    fbox(x - 2, y + 4, z - 2, x + 2, y + 4, z + 2, LEAF);   // 지붕도 잎(마을 사람이 지붕 위에 서지 않게)
    for (var dz = -3; dz <= 3; dz++) for (var dx = -3; dx <= 3; dx++) if (hash2(x + dx, z + dz, 86) < 0.55) setRaw(x + dx, y + 5, z + dz, LEAF);
    setRaw(x - 3, y, z - 1, LEAF); setRaw(x - 3, y + 1, z - 1, LEAF); setRaw(x + 1, y, z + 2, JAR);
  }
  // ───────── 애굽(출 1:11 국고성, 창 41:49 곡식 창고, 창 41:42 세마포) ─────────
  function buildEgypt(c) {
    var X = c.x, Z = c.z, r = c.r, k;
    farGround(c, SAND); farMoat(c, 5, LIMESTONE);
    fbox(X - r, G - 1, Z - r, X + r, G - 1, Z + r, SAND);
    fbox(X - 3, G - 1, Z - r, X + 3, G - 1, Z + r, PATH); fbox(X - r, G - 1, Z - 2, X + r, G - 1, Z + 2, PATH);
    farWalls(c, MUDBRICK, 8, 5, 6, 0);
    // 총리의 집(북쪽): 석회암, 앞 기둥, 금
    var px0 = X - 16, px1 = X + 16, pz0 = Z - 52, pz1 = Z - 32;
    fbox(px0, G, pz0, px1, G + 8, pz1, LIMESTONE); fbox(px0 + 1, G, pz0 + 1, px1 - 1, G + 7, pz1 - 1, AIR);
    fbox(X - 2, G, pz1, X + 2, G + 4, pz1, AIR);
    for (k = px0; k <= px1; k += 4) fbox(k, G, pz1 + 3, k, G + 7, pz1 + 3, PILLAR);
    fbox(px0, G + 8, pz1 + 1, px1, G + 8, pz1 + 3, LIMESTONE); fbox(px0, G + 6, pz1, px1, G + 6, pz1, BLK_AU);
    fbox(X - 1, G, pz0 + 6, X + 1, G, pz1 - 1, CARPET); fbox(X - 3, G, pz0 + 2, X + 3, G, pz0 + 3, BLK_AU);
    setRaw(px0 + 2, G, pz0 + 2, LANTERN); setRaw(px1 - 2, G, pz0 + 2, LANTERN); setRaw(px0 + 2, G, pz1 - 2, LANTERN); setRaw(px1 - 2, G, pz1 - 2, LANTERN);
    [X - 9, X + 8].forEach(function (ox) { fbox(ox, G, Z - 26, ox + 1, G + 13, Z - 25, LIMESTONE); setRaw(ox, G + 14, Z - 26, BLK_AU); setRaw(ox + 1, G + 14, Z - 25, BLK_AU); });
    // 곡식 창고 여덟(창 41:49): 둥근 흙벽돌 곳간, 둥근 지붕, 남쪽 문, 안에 짚단
    for (var row = 0; row < 2; row++) for (var col = 0; col < 4; col++) {
      var sx = X - 45 + col * 11, sz = Z + 22 + row * 14;
      for (var dz = -3; dz <= 3; dz++) for (var dx = -3; dx <= 3; dx++) {
        var dd = dx * dx + dz * dz; if (dd > 10) continue;
        fbox(sx + dx, G - 1, sz + dz, sx + dx, G - 1, sz + dz, PATH);
        if (dd >= 5) fbox(sx + dx, G, sz + dz, sx + dx, G + 7, sz + dz, MUDBRICK);
        if (dd <= 5) setRaw(sx + dx, G + 8, sz + dz, MUDBRICK);
        if (dd <= 1) setRaw(sx + dx, G + 9, sz + dz, MUDBRICK);
        if (dd < 5 && dd > 0 && hash2(sx + dx, sz + dz, 87) < 0.6) fbox(sx + dx, G, sz + dz, sx + dx, G + Math.floor(hash2(sx, sz + dz, 88) * 3), sz + dz, THATCH);
      }
      fbox(sx, G, sz + 3, sx, G + 3, sz + 3, AIR);
    }
    // 벽돌 마당(출 1:14): 진흙 웅덩이, 흙벽돌 더미, 짚
    fbox(X + 22, G - 1, Z - 14, X + 46, G - 1, Z - 6, CLAY);
    for (k = 0; k < 5; k++) fbox(X + 24 + k * 5, G, Z + 8, X + 25 + k * 5, G + 1 + (k % 3), Z + 9, MUDBRICK);
    fbox(X + 40, G, Z + 14, X + 43, G + 1, Z + 16, THATCH);
    farStall(X - 20, Z - 12, CLOTH_Y); farStall(X + 18, Z + 26, CLOTH_B);
    farHouseGrid(c, function (sd) { return hash2(sd, 2, 89) < 0.75 ? MUDBRICK : PLASTER; }, MUDBRICK, function (lx, lz) {
      return overlap(lx, lz, -19, -55, 19, -22) || overlap(lx, lz, -50, 17, -6, 52) || overlap(lx, lz, 19, -17, 48, 19) || overlap(lx, lz, -24, -16, -15, -7) || overlap(lx, lz, 14, 22, 22, 31);
    });
  }
  var FAR_BUILD = {};   // 18-israel이 채움
  function buildFarLands(x0, z0) {
    FAR_CITIES.forEach(function (c) {
      var m = c.mb || c.r + 8;
      if (x0 + CS <= c.x - m || x0 > c.x + m || z0 + CS <= c.z - m || z0 > c.z + m) return;
      FB = G;
      if (c.k === 'babylon') buildBabylon(c); else if (c.k === 'nineveh') buildNineveh(c); else if (c.k === 'egypt') buildEgypt(c); else if (FAR_BUILD[c.k]) FAR_BUILD[c.k](c, x0, z0);
      FB = G;
    });
    if (x0 + CS > JONAH_X - 5 && x0 <= JONAH_X + 5 && z0 + CS > JONAH_Z - 5 && z0 <= JONAH_Z + 5) buildJonahBooth();
  }

  // ───────── 마을 장터(방주 남쪽 마당): 가판 넷 ─────────
  var MARKET = [[XM - 30, AZ1 + 8, CLOTH_G], [XM - 42, AZ1 + 8, WOOL_V], [XM + 56, AZ1 + 8, CLOTH_Y], [XM + 68, AZ1 + 8, CLOTH_B]];
  function buildMarketStalls() { MARKET.forEach(function (m) { farStall(m[0], m[1], m[2]); }); }

  // ───────── 장사하는 사람(누르면 가게) — [내는 것, 받는 것] ─────────
  var AG = ING_AG;
  var SHOPS = {
    smith: { title: '🔨 대장장이의 가게', list: [[[AG, 2], [ING_FE, 1]], [[AG, 1], [ING_CU, 2]], [[AG, 1], [COAL, 8]], [[AG, 1], [TORCH, 8]], [[ING_FE, 1], [AG, 1]], [[ING_CU, 3], [AG, 1]]] },
    potter: { title: '🏺 토기장이의 가게', list: [[[AG, 1], [JAR, 2]], [[AG, 1], [OIL_LAMP, 2]], [[AG, 1], [BRICK, 16]], [[CLAY, 16], [AG, 1]], [[SAND, 32], [AG, 1]]] },
    lydia: { title: '🟣 자색 옷감 가게', list: [[[AG, 3], [WOOL_V, 4]], [[AG, 1], [RED_DYE, 2]], [[AG, 1], [BLUE_DYE, 2]], [[AG, 2], [LINEN, 2]], [[WOOL, 8], [AG, 1]], [[THREAD, 12], [AG, 1]]] },
    spice: { title: '🫙 향품 가게', list: [[[AG, 1], [OLIVE_OIL, 1]], [[AG, 2], [HONEY, 2]], [[AG, 4], [ALABASTER_JAR, 1]], [[FIG, 6], [AG, 1]], [[POMEGRANATE, 6], [AG, 1]]] },
    brick: { title: '🧱 바벨론 벽돌 가게', list: [[[AG, 1], [BRICK, 24]], [[AG, 1], [TAR, 4]], [[AG, 1], [MUDBRICK, 24]], [[CLAY, 12], [AG, 1]], [[LOG, 12], [AG, 1]]] },
    sapphire: { title: '💠 청옥 깎는 사람의 가게', list: [[[AG, 8], [BLK_SAPH, 1]], [[AG, 3], [GEM_SAPH, 1]], [[GEM_SAPH, 1], [AG, 2]], [[ING_AU, 1], [AG, 3]], [[AG, 1], [GLASS, 6]]] },
    wool: { title: '🐑 니느웨 양털 가게', list: [[[AG, 1], [WOOL, 8]], [[AG, 2], [WOOL_CLOTH, 2]], [[AG, 1], [THREAD, 10]], [[LEATHER, 3], [AG, 1]], [[AG, 2], [WOOL_R, 4]]] },
    fish: { title: '🐟 니느웨 물고기 가게', list: [[[AG, 1], [COOKED_FISH, 4]], [[AG, 2], [FISH_NET, 1]], [[RAW_FISH, 6], [AG, 1]], [[AG, 1], [SALT, 4]]] },
    grain: { title: '🌾 애굽 곡식 창고', list: [[[AG, 1], [WHEAT, 10]], [[AG, 1], [FLOUR, 6]], [[AG, 1], [BREAD, 4]], [[AG, 1], [SEED, 6]], [[WHEAT, 16], [AG, 1]]] },
    linen: { title: '🤍 애굽 세마포 가게', list: [[[AG, 2], [LINEN, 3]], [[AG, 1], [GOLD_DYE, 2]], [[AG, 2], [LIMESTONE, 24]], [[THREAD, 16], [AG, 1]], [[ING_AU, 1], [AG, 3]]] },
    reed: { title: '🌿 나일 갈대 가게', list: [[[AG, 1], [REED, 16]], [[AG, 1], [REED_MAT, 4]], [[AG, 1], [THATCH, 16]], [[REED, 24], [AG, 1]]] }
  };
  function shopLook(robe, trim, scarf, skin, beard) { return { robe: robe, robe2: robe, belt: 0x5a3a20, trim: trim, skin: skin || 0xc68a60, hair: 0x2b1d14, sandal: 0x6b4425, style: scarf ? 'scarf' : 'short', scarf: scarf, fit: beard ? { beard: 0x2b1d14, bag: 0x8a5a32 } : { bag: 0x8a5a32 } }; }
  var FAR_NPCS = [
    // 마을 장터
    { name: '대장장이', x: MARKET[0][0], z: MARKET[0][1], y: G, shop: 'smith', emoji: '🔨', look: shopLook(0x6a5a4a, 0x3a2a1c, 0, 0xb27a52, 1), text: '보라 숯불을 불어서 자기가 쓸 만한 연장을 제조하는 장인도 내가 창조하였고 파괴하며 진멸하는 자도 내가 창조하였은즉', ref: '이사야 54:16' },
    { name: '루디아', x: MARKET[1][0], z: MARKET[1][1], y: G, shop: 'lydia', emoji: '🟣', look: { robe: 0x7a3a8a, robe2: 0x6a2a7a, belt: 0xd8b060, trim: 0xd8b060, skin: 0xd9a67a, hair: 0x3a2618, sandal: 0x6b4425, style: 'scarf', scarf: 0xb890c8 }, text: '두아디라 시에 있는 자색 옷감 장사로서 하나님을 섬기는 루디아라 하는 한 여자가 말을 듣고 있을 때 주께서 그 마음을 열어 바울의 말을 따르게 하신지라', ref: '사도행전 16:14' },
    { name: '토기장이', x: MARKET[2][0], z: MARKET[2][1], y: G, shop: 'potter', emoji: '🏺', look: shopLook(0xa8764a, 0x7a5228, 0, 0xc68a60, 1), text: '진흙으로 만든 그릇이 토기장이의 손에서 터지매 그가 그것으로 자기 의견에 좋은 대로 다른 그릇을 만들더라', ref: '예레미야 18:4' },
    { name: '향품 장수', x: MARKET[3][0], z: MARKET[3][1], y: G, shop: 'spice', emoji: '🫙', look: shopLook(0x3a6a5a, 0xd8b060, 0xe8d8a8), text: '기름과 향이 사람의 마음을 즐겁게 하나니 친구의 충성된 권고가 이와 같이 아름다우니라', ref: '잠언 27:9' },
    // 바벨론
    { name: '벽돌 굽는 사람', x: 3760 - 22, z: 2350 - 25, y: G, shop: 'brick', emoji: '🧱', look: shopLook(0xb08050, 0x6a4020, 0xe0c890, 0xb27a52, 1), text: '서로 말하되 자, 벽돌을 만들어 견고히 굽자 하고 이에 벽돌로 돌을 대신하며 역청으로 진흙을 대신하고', ref: '창세기 11:3' },
    { name: '청옥 깎는 사람', x: 3760 + 22, z: 2350 - 25, y: G, shop: 'sapphire', emoji: '💠', look: shopLook(0x2a4a8a, 0xe0b040, 0x7fa0d0, 0xc68a60, 1), text: '이스라엘의 하나님을 보니 그의 발 아래에는 청옥을 편 듯하고 하늘 같이 청명하더라', ref: '출애굽기 24:10' },
    { name: '다니엘', x: 3760 - 56 + 3, z: 2350 + 45 + 5, y: G + 6, emoji: '🙏', look: { robe: 0x5a3a7a, robe2: 0x4a2e6a, belt: 0xe0b040, trim: 0xe0b040, skin: 0xd2a07a, hair: 0x2a1e14, sandal: 0x6b4425, style: 'long', fit: { beard: 0x2a1e14 } }, text: '다니엘이 이 조서에 왕의 도장이 찍힌 것을 알고도 자기 집에 돌아가서는 윗방에 올라가 예루살렘으로 향한 창문을 열고 전에 하던 대로 하루 세 번씩 무릎을 꿇고 기도하며 그의 하나님께 감사하였더라', ref: '다니엘 6:10' },
    // 니느웨
    { name: '양털 장수', x: 3812 - 9, z: 1650 - 9, y: G, shop: 'wool', emoji: '🐑', look: shopLook(0x8a7a5a, 0x5a4a30, 0xf0e8d8), text: '그는 양털과 삼을 구하여 부지런히 손으로 일하며', ref: '잠언 31:13' },
    { name: '물고기 장수', x: 3812 + 9, z: 1650 - 9, y: G, shop: 'fish', emoji: '🐟', look: shopLook(0x4a6a80, 0x2a4a60, 0, 0xb27a52, 1), text: '여호와께서 이미 큰 물고기를 예비하사 요나를 삼키게 하셨으므로 요나가 밤낮 삼 일을 물고기 뱃속에 있으니라', ref: '요나 1:17' },
    { name: '니느웨 사람', x: 3812 + 4, z: 1650 + 20, y: G, emoji: '🧎', look: { robe: 0x6a6258, robe2: 0x5a5248, belt: 0x3a3028, trim: 0x4a4238, skin: 0xc68a60, hair: 0x1e1610, sandal: 0x6b4425, style: 'short', fit: { beard: 0x1e1610 } }, text: '니느웨 사람들이 하나님을 믿고 금식을 선포하고 높고 낮은 자를 막론하고 굵은 베 옷을 입은지라', ref: '요나 3:5' },
    { name: '니느웨 왕', x: 3812 - 44, z: 1650 - 60 + 8, y: G, emoji: '👑', look: { robe: 0x6a6258, robe2: 0x5a5248, belt: 0xe0b040, trim: 0x4a4238, skin: 0xc68a60, hair: 0x1e1610, sandal: 0x6b4425, style: 'long', fit: { beard: 0x1e1610 } }, text: '그 일이 니느웨 왕에게 들리매 왕이 보좌에서 일어나 왕복을 벗고 굵은 베 옷을 입고 재 위에 앉으니라', ref: '요나 3:6' },
    { name: '요나', x: JONAH_X, z: JONAH_Z, emoji: '🌿', look: { robe: 0x8a9a7a, robe2: 0x7a8a6a, belt: 0x5a3a20, trim: 0x5a6a4a, skin: 0xc98f62, hair: 0x2b1d14, sandal: 0x6b4425, style: 'scarf', scarf: 0xe8e0c8, fit: { beard: 0x2b1d14 } }, text: '나는 감사하는 목소리로 주께 제사를 드리며 나의 서원을 주께 갚겠나이다 구원은 여호와께 속하였나이다 하니라', ref: '요나 2:9' },
    // 애굽
    { name: '총리 요셉', x: 470, z: 2650 - 44, y: G, shop: 'grain', emoji: '🌾', look: { robe: 0xf2efe4, robe2: 0xe8e4d8, belt: 0xe0b040, trim: 0xe0b040, skin: 0xc68a60, hair: 0x2b1d14, sandal: 0xd8b060, style: 'short', fit: { sash: 0xe0b040 } }, text: '때에 요셉이 나라의 총리로서 그 땅 모든 백성에게 곡식을 팔더니 요셉의 형들이 와서 그 앞에서 땅에 엎드려 절하매', ref: '창세기 42:6' },
    { name: '세마포 장수', x: 470 - 20, z: 2650 - 12, y: G, shop: 'linen', emoji: '🤍', look: shopLook(0xe8e2d2, 0xa08040, 0, 0xa87048), text: '자기의 인장 반지를 빼어 요셉의 손에 끼우고 그에게 세마포 옷을 입히고 금 사슬을 목에 걸고', ref: '창세기 41:42' },
    { name: '갈대 장수', x: 470 + 18, z: 2650 + 26, y: G, shop: 'reed', emoji: '🌿', look: shopLook(0xc8b880, 0x6a7a3a, 0xe8e0b0, 0xa87048), text: '더 숨길 수 없게 되매 그를 위하여 갈대 상자를 가져다가 역청과 나무 진을 칠하고 아기를 거기 담아 나일 강 가 갈대 사이에 두고', ref: '출애굽기 2:3' }
  ];
  FAR_NPCS.forEach(function (d) { NPC_DEFS.push(d); });
  function openShop(d) {
    var sh = SHOPS[d.shop]; if (!sh) return;
    var old = $('tradeBox'); if (old) old.remove();
    if (lockOn) { try { document.exitPointerLock(); } catch (e) {} }
    var box = document.createElement('div'); box.id = 'tradeBox';
    box.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:60;background:rgba(16,16,24,.95);border:2px solid #000;box-shadow:inset 0 0 0 2px #b88a3a;padding:12px 14px;color:#fff;font-size:14px;width:min(360px,92vw);max-height:86vh;overflow:auto';
    function add(tag, txt, css) { var e = document.createElement(tag); e.textContent = txt; e.style.cssText = css; box.appendChild(e); return e; }
    add('b', sh.title, 'display:block;font-size:16px;color:#ffe27a;margin-bottom:4px');
    add('p', '「' + d.text + '」 (' + d.ref + ')', 'margin:0 0 6px;font-size:12px;opacity:.85;line-height:1.4');
    add('div', '내 은 덩이: ' + (isAdm() ? '∞' : have(AG)) + '개 — 은은 광석을 녹이거나 물건을 팔아 모아요', 'font-size:12px;color:#d8e8ff;margin-bottom:4px');
    sh.list.forEach(function (t) {
      var g0 = t[0], g1 = t[1], ok = isAdm() || have(g0[0]) >= g0[1];
      var b = document.createElement('button'); b.className = 'mc'; b.style.cssText = 'display:block;width:100%;margin:4px 0;text-align:left;white-space:normal;height:auto;min-height:38px;padding:4px 8px';
      b.textContent = (g1[0] === AG ? '팔기 · ' : '사기 · ') + nameOf(g0[0]) + ' ' + g0[1] + '개 → ' + nameOf(g1[0]) + ' ' + g1[1] + '개' + (ok ? '' : '  (모자라요: ' + have(g0[0]) + '/' + g0[1] + ')');
      b.disabled = !ok;
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        if (!isAdm() && have(g0[0]) < g0[1]) return;
        if (!isAdm() && room(g1[0]) < g1[1]) { bagFull(); return; }
        take(g0[0], g0[1]); give(g1[0], g1[1]); bagChanged(); sfx('craft');
        toast('⚖ ' + nameOf(g0[0]) + ' ' + g0[1] + '개를 ' + nameOf(g1[0]) + ' ' + g1[1] + '개로 바꿨어요'); openShop(d);
      });
      box.appendChild(b);
    });
    var c = document.createElement('button'); c.className = 'mc'; c.textContent = '닫기'; c.style.cssText = 'display:block;width:100%;margin-top:6px';
    c.addEventListener('click', function (e) { e.stopPropagation(); box.remove(); }); box.appendChild(c);
    document.body.appendChild(box); sfx('pop');
  }

  // ───────── 찾기: 처음 밟으면 지도 이름 + 모험 보상, 마을 상인의 소문 ─────────
  var FAR_INFO = {
    babylon: { label: '🏛 바벨론', x: 3760, z: 2350, rumor: '해 뜨는 쪽 끝까지 가면 큰 강이 있고, 그 강가 평지에 벽돌로 쌓은 성이 있대요. 푸른 문이 북쪽을 바라본대요.' },
    nineveh: { label: '🏯 니느웨', x: 3812, z: 1650, rumor: '해 뜨는 쪽 끝의 큰 강을 따라 북쪽으로 올라가면, 사흘 동안 걸을 만큼 큰 성읍이 있대요.' },
    egypt: { label: '🌾 애굽', x: 470, z: 2650, rumor: '시내 산보다 해 지는 쪽으로 더 가면, 강가에 곡식 창고가 가득한 나라가 있대요.' },
    swamp: { label: '🐸 갈대 늪', x: SWX, z: SWZ, rumor: '요단 강에서 해 지는 쪽으로 한참 가면, 갈대가 우거지고 개구리가 우는 늪이 있대요.' },
    snow: { label: '❄ 눈 덮인 산', x: SNX, z: SNZ, rumor: '동쪽 큰 숲의 해 지는 쪽 끝에, 늘 눈이 덮인 산이 있대요.' }
  };
  var FAR_KEYS = ['babylon', 'nineveh', 'egypt', 'swamp', 'snow'], ISR_KEYS = [], SPOT_CITY = {};   // ISR_KEYS·SPOT_CITY는 18-israel이 채움
  function farAll() { return FAR_KEYS.concat(ISR_KEYS); }
  ADVS.push(
    ['far_babylon', '🏛 바벨론 찾기', '아주 먼 큰 강가의 벽돌 성을 찾아요 — 마을 상인에게 소문을 들을 수 있어요', [[GEM_SAPH, 2], [ING_AG, 3]], ['🏛', '바벨론', REGION_INFO.babylon[1], REGION_INFO.babylon[2]]],
    ['far_nineveh', '🏯 니느웨 찾기', '사흘 동안 걸을 만큼 큰 성읍을 찾아요', [[ING_AG, 3], [COOKED_FISH, 4]], ['🏯', '니느웨', REGION_INFO.nineveh[1], REGION_INFO.nineveh[2]]],
    ['far_egypt', '🌾 애굽 찾기', '곡식 창고가 가득한 나라를 찾아요', [[ING_AG, 3], [BREAD, 6]], ['🌾', '애굽', REGION_INFO.egypt[1], REGION_INFO.egypt[2]]],
    ['far_swamp', '🐸 갈대 늪 찾기', '개구리가 우는 갈대 늪을 찾아요', [[ING_AG, 1], [REED_MAT, 4]], null],
    ['far_snow', '❄ 눈 덮인 산 찾기', '늘 눈이 덮인 산을 찾아요', [[ING_AG, 1], [WOOL, 8]], null],
    ['far_all', '🧭 땅 끝까지', '먼 땅 다섯 곳(바벨론·니느웨·애굽·갈대 늪·눈 덮인 산)을 모두 찾아요', [[GEM_DIA, 1], [ING_AU, 3]], ['🧭', '땅 끝까지', '오직 성령이 너희에게 임하시면 너희가 권능을 받고 예루살렘과 온 유대와 사마리아와 땅 끝까지 이르러 내 증인이 되리라 하시니라', '사도행전 1:8']]
  );
  function farKey(k) { return k === 'jonah' ? 'nineveh' : (SPOT_CITY[k] || k); }
  function farLabels() {
    farAll().forEach(function (k) {
      if (!ADV.regions['far_' + k]) return;
      var f = FAR_INFO[k]; if (MAP_LABELS.some(function (l) { return l[0] === f.label; })) return;
      MAP_LABELS.push([f.label, f.x, f.z]);
    });
  }
  function farTick(k) {
    farLabels();
    k = farKey(k || '');
    if (farAll().indexOf(k) < 0 || ADV.regions['far_' + k]) return;
    ADV.regions['far_' + k] = 1; advSave(); farLabels(); newsMark('far1');
    toast('🗺 먼 땅 「' + FAR_INFO[k].label.replace(/^\S+ /, '') + '」을(를) 찾았어요 — 큰 지도에 이름이 생겼어요');
    setTimeout(function () {
      advDone('far_' + k);
      if (FAR_KEYS.every(function (q) { return ADV.regions['far_' + q]; })) setTimeout(function () { advDone('far_all'); }, 7000);
      if (ISR_KEYS.length && ISR_KEYS.every(function (q) { return ADV.regions['far_' + q]; })) setTimeout(function () { advDone('far_israel'); }, 7000);
    }, 6800);
  }
  function farRumors(box) {
    var left = farAll().filter(function (k) { return !ADV.regions['far_' + k]; });
    if (!left.length) return;
    var h = document.createElement('b'); h.textContent = '📜 먼 땅 소문 (은 덩이 1)'; h.style.cssText = 'display:block;font-size:14px;color:#ffe27a;margin:10px 0 2px'; box.appendChild(h);
    left.forEach(function (k) {
      var heard = ADV.regions['rumor_' + k], b = document.createElement('button'); b.className = 'mc';
      b.style.cssText = 'display:block;width:100%;margin:4px 0;text-align:left;white-space:normal;height:auto;min-height:38px;padding:4px 8px';
      b.textContent = heard ? '👂 ' + FAR_INFO[k].rumor : '❓ 아직 모르는 먼 땅 이야기 듣기';
      b.disabled = !heard && !(isAdm() || have(AG) >= 1);
      b.addEventListener('click', function (e) {
        e.stopPropagation(); if (heard) return;
        if (!isAdm()) { if (have(AG) < 1) return; take(AG, 1); bagChanged(); }
        ADV.regions['rumor_' + k] = 1; advSave(); sfx('pop'); box.remove(); openTrade();
      });
      box.appendChild(b);
    });
  }
  farLabels();
