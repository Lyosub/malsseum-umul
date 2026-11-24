  // ───────── 월드(가까운 곳만 그때그때 만든다) ─────────
  // 1블록 = 1규빗(약 45cm), 사람 키 약 3.4칸. 세계는 4096×4096칸(11/20 두 배로 — 예전 땅 0~2047은 그대로), 높이 80칸.
  // 32×32칸 기둥을 내 둘레만 만들어 보여 주고, 멀어지면 지운다. 땅·산·강·숲은 공식으로 만들어서 같은 자리는 언제 가도 똑같다.
  var WS = 8192, SY = 80, G = 16, CS = 32, NC = WS / CS, CY = Math.ceil(SY / CS);
  // 11/20 땅속을 깊게: 바닥이 y 0 → YMIN(-32). 지상 좌표·저장된 자리는 그대로, 기둥 배열만 아래로 늘림(배열 칸 = 좌표 칸 + YOFF)
  var YMIN = -32, SYT = SY - YMIN, YOFF = -YMIN * CS * CS, CYMIN = Math.floor(YMIN / CS);
  var SX = WS, SZ = WS;
  var COLS = new Array(NC * NC);   // 기둥: { d: 블록, sky: 하늘 그늘, lamps: 등불, mod: 고친 적 있음 }
  function colAt(x, z) { if (x < 0 || z < 0 || x >= WS || z >= WS) return null; return COLS[(z >> 5) * NC + (x >> 5)]; }
  function get(x,y,z) {
    var id=readBlock(x,y,z);
    return id===AIR && frontierWater.size && frontierWater.has(frontierCell(x,y,z)) ? WATER : id;
  }
  function readBlock(x, y, z) {
    if (y < YMIN) return BASALT;
    if (y >= SY) return AIR;
    var c = colAt(x, z); if (!c) return AIR;
    return c.d[(y * CS + (z & 31)) * CS + (x & 31) + YOFF];
  }
  var genCol = null, genCX = 0, genCZ = 0;   // 지금 만드는 기둥(그 밖은 쓰지 않음)
  function setRaw(x, y, z, id) {
    if (y < YMIN || y >= SY || x < 0 || z < 0 || x >= WS || z >= WS) return;
    var c;
    if (genCol) { if ((x >> 5) !== genCX || (z >> 5) !== genCZ) return; c = genCol; }
    else { c = colAt(x, z); if (!c) return; }
    c.d[(y * CS + (z & 31)) * CS + (x & 31) + YOFF] = id;
    if (y < 0 && c.deepAir === false && (id === AIR || !isSolid(id) || isTrans(id))) c.deepAir = true;
  }
  function fill(x1, y1, z1, x2, y2, z2, id) {
    if (genCol) {   // 만드는 기둥 안쪽만
      x1 = Math.max(x1, genCX * CS); x2 = Math.min(x2, genCX * CS + CS - 1);
      z1 = Math.max(z1, genCZ * CS); z2 = Math.min(z2, genCZ * CS + CS - 1);
    }
    y1 = Math.max(YMIN, y1); y2 = Math.min(SY - 1, y2);
    for (var y = y1; y <= y2; y++) for (var z = z1; z <= z2; z++) for (var x = x1; x <= x2; x++) setRaw(x, y, z, id);
  }

  // 방주: 창 6:15 길이 300 · 너비 50 · 높이 30 — 세계 한가운데
  var AL = 300, AW = 50, AH = 30, XM = 1024, AX0 = XM - 150, AZ0 = 846;
  var AX1 = AX0 + AL - 1, AZ1 = AZ0 + AW - 1, AY0 = G, AY1 = G + AH - 1;
  // 마을 땅: 방주 남쪽, 24×24칸, 8줄 × 8칸 = 64필지
  var OLD_PLOT = 24, WIDE_PLOT = 26, PLOT = OLD_PLOT, PGAP = 4, PCOLS = 8, PROWS = 8, PH = 32, PSTEP = 28;
  var PX0 = XM - Math.floor((PCOLS * PSTEP - 4) / 2), PZ0 = AZ1 + 17;
  var VX1 = PX0 + PCOLS * PSTEP - 1, VZ1 = PZ0 + PROWS * PSTEP - 1;
  // 남쪽 호수, 그 동쪽 역청 구덩이(창 14:10)
  var LX = XM, LZ = AZ0 + 328, LRX = 78, LRZ = 20;
  var TARR = [LX + LRX + 8, LZ - 18, LX + LRX + 46, LZ + 22];
  // 먼 곳: 북쪽 바다, 동쪽 사막(오아시스), 서쪽 끝 아라랏 산(창 8:4)
  var SEA_Z = AZ0 - 150, DES_X = VX1 + 170, ARX = XM - 600, ARZ = AZ0 + 60, OASX = VX1 + 430, OASZ = PZ0 + 70;
  // 남쪽 새 지역(11/20): 서남쪽 백향목 숲(시 92:12), 가운데 광야와 성막(출 25:8, 27:18), 동남쪽 소금 바다(마 5:13)와 나그네 장막촌(히 11:9)
  var CEX = 640, CEZ = 1640, CER = 210, WIX = 1030, WIZ = 1700, WIR = 190, SAX = 1440, SAZ = 1690, SARX = 140, SARZ = 85, SAR = 205;
  var TBX = 1030, TBZ = 1700, CTX = 640, CTZ = 1640, TCX = 1262, TCZ = 1690, LOTX = 1440, LOTZ = 1784;
  // 11/20 북쪽 바다의 섬: [이름, x, z, 반지름, 언덕 높이] — 밧모(계 1:9) · 멜리데(행 28:1) · 구브로(행 13:4) + 작은 섬
  var ISLES = [['patmos', 560, 330, 58, 16], ['malta', 1500, 380, 78, 9], ['cyprus', 1040, 200, 135, 26], ['islet', 250, 540, 24, 5], ['islet', 820, 530, 18, 4],
    ['islet', 1250, 560, 22, 6], ['islet', 1830, 520, 28, 7], ['islet', 1780, 180, 34, 9], ['islet', 330, 140, 30, 8], ['islet', 1960, 330, 20, 5]];
  function isleAt(x, z) {   // [섬 번호, 가운데로 갈수록 1]
    if (z > SEA_Z - 40) return null;
    for (var i = 0; i < ISLES.length; i++) { var I = ISLES[i], dx = x - I[1], dz = z - I[2]; if (Math.abs(dx) > I[3] * 1.4 || Math.abs(dz) > I[3] * 1.4) continue;
      var d = Math.hypot(dx, dz) + (vnoise(x, z, 22, 80 + (i % 9)) - 0.5) * I[3] * 0.55; if (d < I[3]) return [i, 1 - d / I[3]]; }
    return null;
  }
  // ───────── 11/20 세계 두 배: 예전 땅(0~2047)은 그대로, 동쪽·남쪽으로 새 땅 ─────────
  var NW0 = 2048, HERX = 3350, HERZ = 1060, HERR = 330, GALX = 2780, GALZ = 1720, GALRX = 230, GALRZ = 140;
  var JOR = [[2790, 1860], [2740, 2120], [2820, 2420], [2730, 2760], [2660, 3080], [2610, 3420]];
  var JOR_LEN = JOR.slice(1).map(function (b, s) { return Math.hypot(b[0] - JOR[s][0], b[1] - JOR[s][1]); });
  var SINX = 1050, SINZ = 3050, SINR = 430, SSEA_Z = 3580;
  var S_ISLES = [[1200, 3820, 62, 9], [2100, 3900, 46, 6], [2950, 3770, 72, 11], [3650, 3860, 42, 6], [560, 3880, 52, 8], [1680, 3720, 30, 5], [3350, 3680, 36, 6]];
  function jordanDist(x, z) {
    var best = 99;
    for (var s = 0; s + 1 < JOR.length; s++) {
      var a = JOR[s], b = JOR[s + 1], vx = b[0] - a[0], vz = b[1] - a[1], len = JOR_LEN[s];
      var u = clamp01(((x - a[0]) * vx + (z - a[1]) * vz) / (len * len)) * len;
      var px = a[0] + vx * u / len + Math.sin(u * 0.05 + s * 2) * 9, pz = a[1] + vz * u / len;
      var d = Math.hypot(x - px, z - pz); if (d < best) best = d;
    }
    return best;
  }
  function sIsleAt(x, z) {
    for (var i = 0; i < S_ISLES.length; i++) { var I = S_ISLES[i], dx = x - I[0], dz = z - I[1]; if (Math.abs(dx) > I[2] * 1.4 || Math.abs(dz) > I[2] * 1.4) continue;
      var d = Math.hypot(dx, dz) + (vnoise(x, z, 22, 70 + i) - 0.5) * I[2] * 0.55; if (d < I[2]) return [i, 1 - d / I[2]]; }
    return null;
  }
  // ───────── 11/24 먼 땅(전도사님: 「다른 도시들은 나그네 마을과 멀리 떨어져 있게 해 발견하게 쉽지 않게」) ─────────
  // 마을(약 1024, 1100)에서 1600~2900칸. 지도 이름·길 안내에 없고, 처음 밟아야 큰 지도에 이름이 생긴다.
  // 동쪽 끝 유브라데 강가: 시날 평지의 바벨론(창 11:2, 시 137:1)과 북쪽 큰 성읍 니느웨(욘 3:3)
  // 서남쪽 끝 나일 강가: 애굽 국고성과 곡식 창고(출 1:11, 창 41:49) · 요단 강 서쪽 갈대 늪(욥 40:21) · 동쪽 큰 숲 서쪽 눈 덮인 산(시 147:16)
  // 11/25 세계 두 배(4096 → 8192, 전도사님 「더 멀었으면 · 마을끼리도 더 멀게 · 거리 최대한」): 바깥 땅의 설계 좌표(아래 상수들)는 그대로 두고,
  //   마을(NOX, NOZ)보다 동쪽·남쪽은 NK배로 펼쳐 세계에 놓는다. 땅 모양은 세계 좌표 → 설계 좌표(UX·UZ)로 되돌려 계산하고, 강 폭·성·건물은 세계 칸 그대로.
  var NK = 2.2, NOX = 1024, NOZ = 950;
  function WX(u) { return u <= NOX ? u : Math.round(NOX + (u - NOX) * NK); }
  function WZ(v) { return v <= NOZ ? v : Math.round(NOZ + (v - NOZ) * NK); }
  function UX(x) { return x <= NOX ? x : NOX + (x - NOX) / NK; }
  function UZ(z) { return z <= NOZ ? z : NOZ + (z - NOZ) / NK; }
  var FAR_CITIES = [
    { k: 'babylon', x: WX(3760), z: WZ(2350), r: 64 },
    { k: 'nineveh', x: WX(3812), z: WZ(1650), r: 70 },
    { k: 'egypt', x: WX(470), z: WZ(2650), r: 58 },
    // 11/24 이스라엘(전도사님: 「당시를 최대한 복원해서 디테일하게」 · 숨겨서 찾게 · 두 시대를 구역으로 나눠서). y = 땅 맨 위 블록 높이, mb = 짓는 범위
    // 11/25 고증 보강: 솔로몬 궁 단지(왕상 7:1-12)를 본문대로 넣으려고 예루살렘을 남쪽으로 늘림(zs = 남쪽 벽까지), 베들레헴은 그만큼 남쪽으로
    { k: 'jerusalem', x: WX(2440), z: WZ(3000), r: 100, zs: 160, y: G + 6, mb: 240 },
    { k: 'bethlehem', x: WX(2460), z: WZ(3290), r: 36, y: G + 3, mb: 90 },
    // 11/25 사마리아 수가(요 4:5) = 오늘의 아스카르, 야곱의 우물에서 1마일쯤(WBC 요한복음 206쪽 · 옥스포드 요한복음 301쪽). 남서쪽 그리심 산, 북쪽 에발 산(신 11:29)
    { k: 'sychar', x: WX(2600), z: WZ(2420), r: 30, y: G + 4, mb: 150 },
    { k: 'nazareth', x: WX(2440), z: WZ(1800), r: 38, y: G + 5, mb: 50 },
    { k: 'capernaum', x: WX(2620), z: WZ(1566) + 80, r: 34, y: G - 1, mb: 84 }
  ];
  function farC(k) { for (var i = 0; i < FAR_CITIES.length; i++) if (FAR_CITIES[i].k === k) return FAR_CITIES[i]; }
  var JX = farC('jerusalem').x, JZ = farC('jerusalem').z;   // 예루살렘 가운데(성 밖 골고다·빈 무덤·겟세마네·감람산·기혼 샘은 이 둘레)
  var JONAH_X = farC('nineveh').x + 110, JONAH_Z = farC('nineveh').z;   // 요나의 초막: 니느웨 동쪽(욘 4:5)
  var SWX = 2330, SWZ = 2480, SWR = 175, SNX = 2560, SNZ = 980, SNR = 240, SHX = 3740, SHZ = 2350, SHR = 330, EGX = 430, EGZ = 2650, EGR = 330;
  var EUPH = [[3690, 1250], [3700, 1560], [3672, 1900], [3628, 2250], [3612, 2600], [3660, 3000], [3630, 3600]];
  var NILE = [[340, 2160], [352, 2500], [326, 2800], [346, 3150], [332, 3600]];
  function lineDist(L, x, z, wig) {
    var best = 99;
    for (var s = 0; s + 1 < L.length; s++) {
      var a = L[s], b = L[s + 1], vx = b[0] - a[0], vz = b[1] - a[1], len = Math.hypot(vx, vz);
      var u = clamp01(((x - a[0]) * vx + (z - a[1]) * vz) / (len * len)) * len;
      var px = a[0] + vx * u / len + Math.sin(u * 0.04 + s * 3) * wig, pz = a[1] + vz * u / len;
      var d = Math.hypot(x - px, z - pz); if (d < best) best = d;
    }
    return best;
  }
  function farRiverDist(x, z) {   // 유브라데·나일(요단 강처럼 넓게 판다)
    var d = 99;
    if (x > 3540 && z > 1180) d = lineDist(EUPH, x, z, 7);
    if (x < 470 && z > 2100) d = Math.min(d, lineDist(NILE, x, z, 6));
    return d;
  }
  function farCityAt(x, z, m) {
    for (var i = 0; i < FAR_CITIES.length; i++) { var c = FAR_CITIES[i]; if (Math.abs(x - c.x) <= c.r + m && z - c.z <= (c.zs || c.r) + m && c.z - z <= c.r + m) return c; }
    return null;
  }
  var FFT = G - 1;   // farFlatK가 고른 성터 높이
  function farFlatK(x, z) {   // 성 둘레는 평평하게(성벽 밖 해자까지 + 18칸에 걸쳐 원래 땅과 이음)
    for (var i = 0; i < FAR_CITIES.length; i++) {
      var c = FAR_CITIES[i], dx = Math.max(Math.abs(x - c.x) - c.r - 7, 0), dz = Math.max(z - c.z - (c.zs || c.r) - 7, c.z - z - c.r - 7, 0);
      if (dx < 18 && dz < 18) { var d = Math.hypot(dx, dz); if (d < 18) { FFT = c.y !== undefined ? c.y : G - 1; return 1 - sstep(0, 18, d); } }
    }
    return 0;
  }
  var SYC0 = farC('sychar'), GERX = SYC0.x - 80, GERZ = SYC0.z + 110, EBX = SYC0.x - 40, EBZ = SYC0.z - 130;   // 그리심 산·에발 산(신 11:29), 수가 둘레
  function israelBump(x, z) {   // 감람산(행 1:12)·골고다 언덕(요 19:17)·빈 무덤 바위 언덕 · 그리심 산·에발 산
    if (Math.abs(x - SYC0.x + 60) < 120 && z > SYC0.z - 220 && z < SYC0.z + 200) {
      var dg = Math.hypot(x - GERX, z - GERZ), de = Math.hypot(x - EBX, z - EBZ), sb = 0;
      if (dg < 62) sb += 24 * (1 - dg * dg / (62 * 62));
      if (de < 56) sb += 27 * (1 - de * de / (56 * 56));
      return sb;
    }
    if (Math.abs(x - JX) > 220 || Math.abs(z - JZ) > 160) return 0;
    var d1 = Math.hypot(x - (JX + 152), z - (JZ - 10)), d2 = Math.hypot(x - (JX - 124), z - (JZ - 62)), b = 0;
    if (d1 < 48) b += 17 * (1 - d1 * d1 / (48 * 48));
    if (d2 < 11) b += 5 * (1 - d2 * d2 / 121);
    return b;
  }
  // 11/25 이스라엘 옛길: 예루살렘 남문 → 베들레헴(눅 2:4), 예루살렘 북문 → 라헬의 묘 → 야곱의 우물 → 수가 → 나사렛(요 4:4), 동문 → 감람산 너머 베다니(눅 19:29)
  var ISR_ROADS = (function () {
    var J = farC('jerusalem'), Bt = farC('bethlehem'), N = farC('nazareth'), S = farC('sychar');
    function D(u, v) { return [WX(u), WZ(v)]; }
    return [
      [[J.x, J.z + 163], [J.x + 8, J.z + 230], D(2452, 3215), [Bt.x - 8, Bt.z - 110], [Bt.x - 2, Bt.z - 38]],
      [[J.x, J.z - 103], [J.x + 6, J.z - 164], D(2492, 2700), [S.x - 34, S.z + 74], [S.x, S.z + 32]],
      [[S.x, S.z - 32], D(2624, 2200), D(2522, 2000), [N.x, N.z + 40]],
      [[J.x + 103, J.z], [J.x + 140, J.z - 4], [J.x + 160, J.z + 30], [J.x + 172, J.z + 54]]
    ];
  })();
  var ISR_RB = ISR_ROADS.map(function (L) { var a = [1e9, 1e9, -1e9, -1e9]; L.forEach(function (p) { a[0] = Math.min(a[0], p[0] - 6); a[1] = Math.min(a[1], p[1] - 6); a[2] = Math.max(a[2], p[0] + 6); a[3] = Math.max(a[3], p[1] + 6); }); return a; });
  var ISR_BB = ISR_RB.reduce(function (a, b) { return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])]; }, [1e9, 1e9, -1e9, -1e9]);
  function isrRoad(x, z) {
    if (x < ISR_BB[0] || x > ISR_BB[2] || z < ISR_BB[1] || z > ISR_BB[3]) return false;
    for (var i = 0; i < ISR_ROADS.length; i++) { var b = ISR_RB[i]; if (x < b[0] || x > b[2] || z < b[1] || z > b[3]) continue; if (lineDist(ISR_ROADS[i], x, z, 2) < 1.8) return !farCityAt(x, z, 1); }
    return false;
  }
  function newWorldW(x, z) { return Math.max(sstep(NW0 + 10, NW0 + 170, x), sstep(NW0 + 10, NW0 + 170, z)); }
  function galE(x, z) { var dx = (x - GALX) / GALRX, dz = (z - GALZ) / GALRZ; return dx * dx + dz * dz; }
  function T_newTop(nt, h) { return nt.top !== GRASS || h >= G; }
  function newRegion(wx, wz) {
    if (wx < NW0 + 70 && wz < NW0 + 70) return '';
    var x = UX(wx), z = UZ(wz), n = (vnoise(wx, wz, 60, 91) - 0.5) * 60;
    if (z > SSEA_Z + n) { var si = sIsleAt(x, z); return si && si[1] > 0.06 ? 'sisle' : 'southsea'; }
    var fc = farCityAt(wx, wz, 8); if (fc) return fc.k;   // 11/24 먼 땅(세계 좌표)
    if (Math.hypot(x - SWX, z - SWZ) + n < SWR) return 'swamp';
    if (Math.hypot(x - SNX, z - SNZ) + n < SNR) return 'snow';
    if (Math.hypot(x - SHX, z - SHZ) + n < SHR) return 'shinar';
    if (Math.hypot(x - EGX, z - EGZ) + n < EGR) return 'egyptland';
    if (galE(x, z) < 1.7) return 'galilee';
    if (Math.hypot(x - HERX, z - HERZ) + n < HERR) return 'hermon';
    if (Math.hypot(x - SINX, z - SINZ) + n < SINR) return 'sinai';
    if (z > GALZ + 100 && jordanDist(x, z) * NK < 24) return 'jordan';
    if (x > 2240 && z > 760 + n && z < 1420 + n) return 'taiga';
    return 'meadow';
  }
  var NT = { h: 0, top: 0, sub: 0, reg: '', jd: 99 };
  function newTerrain(wx, wz, ridge) {
    var x = UX(wx), z = UZ(wz);
    var base = G - 1, roll = vnoise(wx, wz, 90, 92), roll2 = vnoise(wx, wz, 28, 93), n = (vnoise(wx, wz, 60, 91) - 0.5) * 60;
    var h = base + 2 + roll * 11 + roll2 * 4, top = GRASS, sub = DIRT;
    // 큰 숲: 오르내리는 언덕
    var tw = Math.min(sstep(2200, 2320, x), sstep(740, 840, z + n), sstep(1440, 1340, z + n));
    h += tw * (5 + 12 * ridge * roll);
    // 헐몬 산(시 133:3): 눈 덮인 높은 산줄기
    var hd = Math.hypot(x - HERX, z - HERZ), hm = Math.exp(-hd * hd / (2 * 175 * 175)), hm2 = Math.exp(-Math.pow(Math.hypot(x - HERX - 240, z - HERZ + 120), 2) / (2 * 110 * 110));
    h += 40 * hm * (0.7 + 0.45 * ridge) + 26 * hm2 * (0.7 + 0.45 * ridge) + 12 * (hm + hm2) * Math.abs(vnoise(x, z, 18, 95) - 0.5) * 2;   // 봉우리가 높이 한도(76)에 덜 닿게, 날카로운 능선
    // 시내 산(출 19:20): 광야 모래 + 가운데 붉은 바위산
    var sd = Math.hypot(x - SINX, z - SINZ), dw = sstep(SINR + 70, SINR - 70, sd + n), sm = Math.exp(-sd * sd / (2 * 105 * 105));
    var dune = 2 + 5 * Math.abs(Math.sin(x * 0.045 + vnoise(x, z, 40, 5) * 4)) * vnoise(x, z, 30, 6);
    h = h * (1 - dw) + (base + dune) * dw + 50 * sm * (0.8 + 0.3 * ridge);
    // 갈릴리 호수(마 4:18)
    var ge = galE(x, z);
    if (ge < 1.6) { var lakeH = base - 1 - Math.floor(9 * Math.max(0, 1 - ge)); h = ge < 1 ? lakeH : h * sstep(1, 1.6, ge) + (base + 1) * (1 - sstep(1, 1.6, ge)); }
    // 11/24 눈 덮인 산(시 147:16): 둥근 봉우리 여럿
    var snd = Math.hypot(x - SNX, z - SNZ), snw = sstep(SNR + 60, SNR - 40, snd + n);
    if (snw > 0) h += snw * (8 + 30 * ridge * vnoise(x, z, 55, 96) + 6 * roll2);
    // 갈대 늪(욥 40:21): 낮고 평평한 땅에 얕은 웅덩이
    var swd = Math.hypot(x - SWX, z - SWZ), sww = sstep(SWR + 40, SWR - 30, swd + n), pool = false;
    if (sww > 0) { pool = vnoise(x, z, 14, 97) > 0.56 || vnoise(x, z, 6, 98) > 0.8; h = h * (1 - sww) + (pool ? base - 1 : base + (roll2 > 0.62 ? 1 : 0)) * sww; }
    // 시날 평지(창 11:2)·애굽 땅: 낮고 평평하게
    var shw = sstep(SHR + 40, SHR - 60, Math.hypot(x - SHX, z - SHZ) + n), egw = sstep(EGR + 40, EGR - 60, Math.hypot(x - EGX, z - EGZ) + n), flw = Math.max(shw, egw);
    if (flw > 0) h = h * (1 - flw) + (base + 1 + roll2 * 2.5) * flw;
    // 요단 강(마 3:13): 갈릴리에서 남쪽으로
    var jd = z > GALZ + 100 ? jordanDist(x, z) * NK : 99, frd = farRiverDist(x, z) * NK; if (frd < jd) jd = frd;
    if (jd < 16) { var vf = clamp01((jd - 4) / 12); vf = vf * vf; h = base + (h - base) * vf; if (jd <= 2.6) h = base - 2; }
    // 남쪽 큰 바다(시 107:23)와 섬
    var ssd = z - (SSEA_Z + n);
    if (ssd > -40) { var sk = sstep(-40, 8, ssd); h = h * (1 - sk) + (base - 1 - Math.min(10, Math.max(0, ssd) * 0.22)) * sk; }
    var si = ssd > -40 ? sIsleAt(x, z) : null, sik = 0;
    if (si) { sik = si[1]; var IH = S_ISLES[si[0]][3]; var ih = base - 3 + sstep(0, 0.28, sik) * 4.5 + Math.pow(Math.max(0, sik - 0.2) / 0.8, 1.4) * IH * (0.55 + 0.7 * roll); if (ih > h) h = ih; }
    h = Math.round(h);
    // 겉흙
    if (dw > 0.5 && sm < 0.25) { top = SAND; sub = SAND; }
    else if (sm > 0.22 && h > base + 10) { top = (x + z) % 3 ? RED_ROCK : RED_ROCK2; sub = RED_ROCK; }
    if (h > base + 44 + roll2 * 4) { top = SNOW; sub = STONE; }
    else if ((hm > 0.3 || hm2 > 0.3) && h > base + 24 + roll2 * 6) { top = STONE; sub = STONE; }
    if (h <= base + 1 && (ge < 1.35 || jd < 4.5 || ssd > -14)) { top = SAND; sub = SAND; }
    if (sik > 0 && h >= base) { if (h <= base + 1 || sik < 0.22) { top = SAND; sub = SAND; } else { top = GRASS; sub = DIRT; } }
    if (snw > 0.5 && h >= base && top !== STONE) { top = SNOW; sub = DIRT; }
    if (sww > 0.5 && h >= base) { top = hash2(x, z, 5) < 0.22 ? CLAY : GRASS; sub = CLAY; }
    if (egw > 0.5 && h >= base) { top = jd < 13 ? GRASS : SAND; sub = SAND; }
    else if (shw > 0.5 && h >= base && top === GRASS && vnoise(x, z, 24, 99) > 0.62) { top = SAND; sub = SAND; }
    NT.h = h; NT.top = top; NT.sub = sub; NT.reg = newRegion(wx, wz) || 'meadow'; NT.jd = jd;
    return NT;
  }
  function southReg(x, z) {
    if (z < 1380) return '';
    var n = (vnoise(x, z, 50, 71) - 0.5) * 60;
    if (Math.hypot(x - SAX, (z - SAZ) * 1.3) + n < SAR) return 'salt';
    if (Math.hypot(x - WIX, z - WIZ) + n < WIR) return 'wild';
    if (Math.hypot(x - CEX, z - CEZ) + n < CER) return 'cedar';
    return '';
  }
  function saltE(x, z) { var dx = (x - SAX) / SARX, dz = (z - SAZ) / SARZ; return dx * dx + dz * dz; }
  function plotOrigin(i) { return { x: PX0 + (i % PCOLS) * PSTEP, z: PZ0 + Math.floor(i / PCOLS) * PSTEP }; }
  function plotAt(x, z) {
    var cx = x - PX0, cz = z - PZ0;
    if (cx < 0 || cz < 0) return -1;
    var c = Math.floor(cx / PSTEP), r = Math.floor(cz / PSTEP);
    if (c >= PCOLS || r >= PROWS || cx % PSTEP >= PLOT || cz % PSTEP >= PLOT) return -1;
    return r * PCOLS + c;
  }
  var PY0 = G - 3;
  var PSIZE = PLOT * PLOT * (G + PH - PY0);
  function enableWidePlots() {
    PLOT = WIDE_PLOT;
    PGAP = PSTEP - PLOT;
    PSIZE = PLOT * PLOT * (G + PH - PY0);
  }
  function inArk(x, y, z) { return x >= AX0 - 1 && x <= AX1 + 1 && z >= AZ0 - 1 && z <= AZ1 + 1 && y >= AY0 - 1 && y <= AY1 + 1; }
  // 마을·방주 마당(길과 마당은 캐지 않음)
  var TOWN = [[AX0 - 8, AZ0 - 8, AX1 + 8, AZ1 + 8], [PX0 - 8, AZ1, VX1 + 8, VZ1 + 6]];
  function inTown(x, z) { for (var i = 0; i < TOWN.length; i++) { var r = TOWN[i]; if (x >= r[0] && x <= r[2] && z >= r[1] && z <= r[3]) return true; } return false; }
  function rnd(s) { s = Math.sin(s * 127.1) * 43758.5453; return s - Math.floor(s); }
  function hash2(x, z, seed) { return rnd(x * 0.12989 + z * 0.78233 + seed * 3.7719); }
  // 노이즈 격자점 값은 같은 점을 수없이 다시 계산하므로 기억해 둔다(값은 rnd 그대로라 땅 모양은 한 비트도 바뀌지 않음)
  var VN_N = 1 << 14, vnK = new Int32Array(VN_N).fill(-1), vnV = new Float64Array(VN_N);
  function vlat(ix, iz, seed) {
    if ((ix | iz) >>> 10 || seed > 63) return rnd(ix * 57.31 + iz * 131.73 + seed * 17.13);   // 범위 밖은 그냥 계산
    var key = (ix << 16) | (iz << 6) | seed, h = (Math.imul(ix, 73856093) ^ Math.imul(iz, 19349663) ^ Math.imul(seed, 83492791)) & (VN_N - 1);
    if (vnK[h] === key) return vnV[h];
    var v = rnd(ix * 57.31 + iz * 131.73 + seed * 17.13); vnK[h] = key; vnV[h] = v; return v;
  }
  function vnoise(x, z, s, seed) {
    var gx = x / s, gz = z / s, ix = Math.floor(gx), iz = Math.floor(gz), fx = gx - ix, fz = gz - iz;
    fx = fx * fx * (3 - 2 * fx); fz = fz * fz * (3 - 2 * fz);
    var a = vlat(ix, iz, seed), b = vlat(ix + 1, iz, seed);
    var c = vlat(ix, iz + 1, seed), d = vlat(ix + 1, iz + 1, seed);
    return a + (b - a) * fx + (c - a) * fz + (a - b - c + d) * fx * fz;
  }
  function sstep(a, b, v) { var t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); }
  function lakeE(x, z) { var dx = (x - LX) / LRX, dz = (z - LZ) / LRZ; return dx * dx + dz * dz; }
  // 강: 서쪽 산 골짜기 → 남쪽 호수(마을은 비켜 감)
  var RIV = [[XM - 180, AZ0 + 60], [XM - 164, AZ0 + 136], [XM - 150, AZ0 + 216], [XM - 136, AZ0 + 286], [XM - 110, AZ0 + 320], [LX - LRX + 6, LZ]];
  var RIV_LEN = RIV.slice(1).map(function (b, s) { return Math.hypot(b[0] - RIV[s][0], b[1] - RIV[s][1]); });   // 구간 길이는 한 번만
  function riverDist(x, z) {
    var best = 99;
    for (var s = 0; s + 1 < RIV.length; s++) {
      var a = RIV[s], b = RIV[s + 1], vx = b[0] - a[0], vz = b[1] - a[1], len = RIV_LEN[s];
      var u = clamp01(((x - a[0]) * vx + (z - a[1]) * vz) / (len * len)) * len;
      var px = a[0] + vx * u / len + Math.sin(u * 0.08 + s) * 4, pz = a[1] + vz * u / len;
      var d = Math.hypot(x - px, z - pz); if (d < best) best = d;
    }
    return best;
  }
  var DO_RECTS = null;   // 마을·역청 구덩이 둘레(상수라 한 번만 만든다)
  function distOut(x, z) {
    var best = 1e9, rects = DO_RECTS || (DO_RECTS = TOWN.concat([[TARR[0] - 4, TARR[1] - 4, TARR[2] + 4, TARR[3] + 4]]));
    for (var i = 0; i < rects.length; i++) {
      var r = rects[i], dx = Math.max(r[0] - x, 0, x - r[2]), dz = Math.max(r[1] - z, 0, z - r[3]);
      best = Math.min(best, Math.hypot(dx, dz));
    }
    var le = lakeE(x, z);
    if (le < 1.7) best = 0; else best = Math.min(best, (Math.sqrt(le) - Math.sqrt(1.7)) * 40);
    var od = Math.hypot(x - OASX, z - OASZ); if (od < 30) best = Math.min(best, Math.max(0, od - 18));
    return best;
  }
  function region(x, z) {
    if (x >= TARR[0] - 4 && x <= TARR[2] + 4 && z >= TARR[1] - 4 && z <= TARR[3] + 4) return 'tar';
    if (lakeE(x, z) < 1.7) return 'lake';
    if (Math.hypot(x - OASX, z - OASZ) < 34) return 'oasis';
    if (z < SEA_Z - 40) { var il0 = isleAt(x, z); if (il0 && il0[1] > 0.06) return ISLES[il0[0]][0]; }
    if (z < SEA_Z + 10 + (vnoise(x, z, 60, 9) - 0.5) * 40) return 'sea';
    var nreg0 = newRegion(x, z); if (nreg0) return nreg0;
    if (Math.hypot(x - ARX, z - ARZ) < 230) return 'ararat';
    var sr = southReg(x, z); if (sr) return sr;
    var southF = z + (vnoise(x, z, 70, 12) - 0.5) * 60;
    if (x < PX0 - 8 && southF < LZ + 120) return 'west';
    if (x > DES_X + (vnoise(x, z, 80, 8) - 0.5) * 60 && southF < LZ + 120) return 'desert';
    if (x > VX1 + 8 || (x > AX1 + 8 && z < AZ1 + 20)) return 'east';
    if (z > LZ + 50) return 'south';
    return 'other';
  }
  function placeName(x, z) { return null; }

  // 한 자리(기둥)의 땅 모양: T.h(맨 위 블록 y), T.top/T.sub(겉흙·속흙), T.wtop(물 높이, 없으면 -1), T.reg
  var T = { h: 0, top: 0, sub: 0, wtop: -1, reg: '', rd: 99 };
  function terrain(x, z) {
    var reg = region(x, z), d = distOut(x, z), bl = sstep(3, 29, d);
    var n1 = vnoise(x, z, 26, 1), n2 = vnoise(x, z, 7, 2);
    // 서쪽은 높은 산, 동쪽은 낮은 언덕, 그 밖은 들판
    var southK = 1 - sstep(LZ + 60, LZ + 180, z + (vnoise(x, z, 70, 12) - 0.5) * 60);   // 남쪽은 들판
    var westW = clamp01((PX0 - 8 - x) / 30) * southK, ampW = 8 + 36 * clamp01((PX0 - 8 - x) / 60 + 0.15);
    var ridge = 1 - Math.abs(vnoise(x, z, 34, 4) * 2 - 1);
    var amp = 3 + westW * (ampW - 3) + (reg === 'east' ? 3 : 0);
    var hf = bl * amp * (0.2 + 0.5 * n1 + 0.4 * (westW > 0 ? ridge : 0.5)) + bl * 2.5 * n2;
    // 아라랏 산: 서쪽 끝에 우뚝(창 8:4)
    var ad = Math.hypot(x - ARX, z - ARZ), ar = Math.exp(-ad * ad / (2 * 95 * 95));
    hf += bl * 54 * ar * (0.85 + 0.15 * n2);
    // 동쪽 사막: 모래 언덕
    var desW = sstep(DES_X - 40, DES_X + 30, x + (vnoise(x, z, 80, 8) - 0.5) * 60) * southK;
    var dune = 2 + 5 * Math.abs(Math.sin(x * 0.045 + vnoise(x, z, 40, 5) * 4)) * vnoise(x, z, 30, 6);
    hf = hf * (1 - desW) + bl * dune * desW;
    var wildW = 0, mesaTop = false;
    if (z > 1340) {   // 남쪽 새 지역 땅 모양
      var snz = (vnoise(x, z, 50, 71) - 0.5) * 60;
      var cw = sstep(0, 50, CER - (Math.hypot(x - CEX, z - CEZ) + snz));
      wildW = sstep(0, 50, WIR - (Math.hypot(x - WIX, z - WIZ) + snz));
      var sw = sstep(0, 40, SAR - (Math.hypot(x - SAX, (z - SAZ) * 1.3) + snz));
      if (cw > 0) hf = hf * (1 - cw) + cw * bl * (4 + 12 * n1 + 10 * ridge * n1);
      if (wildW > 0) { var mesa = vnoise(x, z, 38, 72), mh = mesa > 0.64 ? Math.min(14, 5 + Math.round((mesa - 0.64) * 70)) : 0; mesaTop = mh > 0 && wildW > 0.6; hf = hf * (1 - wildW) + wildW * bl * (1.2 + 2 * n2 + mh); }
      if (sw > 0) hf = hf * (1 - sw) + sw * bl * (0.8 + n2);
      // 건축물 자리는 평평하게
      var fk = landmarkFlat(x, z); if (fk) { hf = hf * (1 - fk[1]) + fk[0] * fk[1]; if (fk[1] > 0.5) mesaTop = false; }
    }
    var h = G - 1 + Math.round(hf);
    // 북쪽 바다: 바닷가에서 점점 깊게
    var seaD = (SEA_Z + (vnoise(x, z, 60, 9) - 0.5) * 40) - z;
    if (seaD > -12) h = Math.min(h, G - 1 - Math.round(clamp01((seaD + 12) / 40) * 11 + n2 * 2) + (seaD < 0 ? 1 : 0));
    // 강 골짜기
    var rd = riverDist(x, z);
    if (rd < 15) { var vf = clamp01((rd - 4) / 11); vf = vf * vf; h = Math.round(G - 1 + (h - (G - 1)) * vf); }
    var nwW = newWorldW(x, z), nT = null;
    if (nwW > 0 && seaD < -12) { nT = newTerrain(x, z, ridge); h = Math.round(h * (1 - nwW) + nT.h * nwW); if (nT.jd < 99 && nwW > 0.5) rd = Math.min(rd, nT.jd); }
    var ffk = nwW > 0 ? farFlatK(x, z) : 0; if (ffk > 0) h = Math.round(h * (1 - ffk) + FFT * ffk);   // 11/24 먼 나라 성터
    if (nwW > 0) { var ibp = israelBump(x, z); if (ibp > 0) h = Math.round(h + ibp); }
    var isleK = 0, isleI = -1;
    if (z < SEA_Z - 40) { var il = isleAt(x, z); if (il) { isleK = il[1]; isleI = il[0]; var IH = ISLES[isleI][4];
      var ih = G - 4 + Math.round(sstep(0, 0.28, isleK) * 4.5 + Math.pow(Math.max(0, isleK - 0.2) / 0.8, 1.4) * IH * (0.55 + 0.7 * n1)); if (ih > h) h = ih; } }
    if (h > SY - 4) h = SY - 4;
    var top = GRASS, sub = DIRT, wtop = -1;
    var le = lakeE(x, z), od = Math.hypot(x - OASX, z - OASZ), se = z > 1500 ? saltE(x, z) : 9;
    if (le < 1) { h = G - 2 - Math.floor(5 * (1 - le)); wtop = G - 1; top = hash2(x, z, 1) < 0.5 ? CLAY : SAND; sub = CLAY; }
    else if (od < 11) { h = G - 2 - Math.floor(4 * (1 - od / 11)); wtop = G - 1; top = SAND; sub = CLAY; }
    else if (se < 1) { h = G - 2 - Math.floor(6 * (1 - se)); wtop = G - 1; top = hash2(x, z, 4) < 0.3 ? SALT_CRUST : SAND; sub = SAND; }
    else if (rd <= 2.2) { wtop = h; h = h - 2; top = hash2(x, z, 2) < 0.5 ? CLAY : SAND; sub = SAND; }
    else if (h < G - 1) { wtop = G - 1; top = n2 < 0.3 ? 18 : SAND; sub = SAND; }
    else if (le < 1.3 || od < 16 || rd <= 3.2) { top = le < 1.3 && hash2(x, z, 3) < 0.3 ? CLAY : SAND; sub = SAND; }
    else if (desW > 0.5) { top = SAND; sub = SAND; }
    else if (se < 1.5) { top = SALT_CRUST; sub = SAND; }
    else if (wildW > 0.5) { top = mesaTop ? RED_ROCK : (n2 > 0.62 ? 18 : (n1 > 0.6 ? RED_ROCK : SAND)); sub = RED_ROCK; }
    else if (seaD > -16) { top = SAND; sub = SAND; }
    else if (h > G + 46 + n2 * 4) { top = SNOW; sub = STONE; }
    else if ((westW > 0 || ar > 0.25) && h > G + 15 + vnoise(x, z, 9, 3) * 9) { top = STONE; sub = STONE; }
    if (nT && nwW > 0.5 && h >= G - 1 && T_newTop(nT, h)) { top = nT.top; sub = nT.sub; }
    if (nT && nwW > 0.5 && wtop >= 0 && nT.reg === 'swamp') { top = CLAY; sub = CLAY; }   // 늪 웅덩이 바닥은 진흙
    if (nwW > 0.5 && wtop < 0 && h >= G - 1 && isrRoad(x, z)) { top = PATH; sub = DIRT; }   // 11/25 이스라엘 옛길
    if (isleK > 0 && h >= G - 1) { var IHt = ISLES[isleI][4]; wtop = -1; if (h <= G || isleK < 0.22) { top = SAND; sub = SAND; } else if (h > G + IHt * 0.75 + n2 * 3 && IHt > 12) { top = STONE; sub = STONE; } else { top = GRASS; sub = DIRT; } }
    T.h = h; T.top = top; T.sub = sub; T.wtop = wtop; T.reg = reg; T.rd = rd; T.isle = isleK;
    return T;
  }
  function surfaceY(x, z) { terrain(x, z); return Math.max(T.h, T.wtop) + 1; }

  // 역청 구덩이 자리(고정)
  var TARPITS = [];
  for (var tp0 = 0; tp0 < 9; tp0++) TARPITS.push([TARR[0] + 2 + Math.floor(rnd(tp0 * 7.7 + 3) * (TARR[2] - TARR[0] - 6)), TARR[1] + 2 + Math.floor(rnd(tp0 * 9.1 + 4) * (TARR[3] - TARR[1] - 6)), 3 + Math.floor(rnd(tp0 * 2.2) * 3)]);

  // ── 3부: 사망의 음침한 골짜기(시 23:4) — 동쪽 사막 땅속 14×14칸 미로, 깨지지 않는 깊은 돌, 일곱 등잔대 ──
  var DUN = { x0: DES_X + 60, z0: PZ0 + 100, n: 14, cs: 6, yf: 3, yc: 10 };
  var DUN_LAMPS = [[13, 0], [0, 0], [13, 13], [7, 7], [3, 10], [10, 3], [6, 12]];
  function inDungeon(x, y, z) { return x >= DUN.x0 && x < DUN.x0 + DUN.n * DUN.cs && z >= DUN.z0 && z < DUN.z0 + DUN.n * DUN.cs && y <= DUN.yc + 1; }
  function dunOpen(i, j, dir) {   // 칸 (i,j)에서 동쪽(1)·북쪽(0)으로 길이 열렸나(정해진 무늬 + 가끔 고리)
    var n = DUN.n;
    if (dir === 1 && i >= n - 1) return false; if (dir === 0 && j <= 0) return false;
    var pick = (i >= n - 1) ? 0 : (j <= 0 ? 1 : (hash2(i * 31 + 7, j * 17 + 3, 61) < 0.5 ? 0 : 1));
    return pick === dir || hash2(i * 13 + dir * 101, j * 29 + 5, 62) < 0.12;
  }
  function buildDungeon() {
    var D = DUN, cs = D.cs, X1 = D.x0 + D.n * cs - 1, Z1 = D.z0 + D.n * cs - 1;
    fill(D.x0, 1, D.z0, X1, D.yc, Z1, DEEP);
    for (var j = 0; j < D.n; j++) for (var i = 0; i < D.n; i++) {
      var cx0 = D.x0 + i * cs, cz0 = D.z0 + j * cs;
      fill(cx0 + 1, D.yf + 1, cz0 + 1, cx0 + 4, D.yf + 5, cz0 + 4, AIR);
      if (dunOpen(i, j, 1)) fill(cx0 + 5, D.yf + 1, cz0 + 1, cx0 + 6, D.yf + 5, cz0 + 4, AIR);
      if (dunOpen(i, j, 0)) fill(cx0 + 1, D.yf + 1, cz0 - 1, cx0 + 4, D.yf + 5, cz0, AIR);
    }
    DUN_LAMPS.forEach(function (c, k) { var lx = D.x0 + c[0] * cs + 2, lz = D.z0 + c[1] * cs + 2; fill(lx, D.yf + 1, lz, lx, D.yf + 1, lz, STORY.lamps[k] ? LAMPSTAND + 1 : LAMPSTAND); });
    // 들어가는 곳: 남서쪽 칸(0, n-1)에서 땅 위까지 세로 굴과 사닥다리, 돌 벽돌 입구
    var ex = D.x0 + 2, ez = D.z0 + (D.n - 1) * cs + 2; terrain(ex, ez); var top = T.h;
    fill(ex, D.yf + 1, ez, ex + 1, top + 4, ez + 1, AIR);
    for (var y = D.yf + 1; y <= top + 1; y++) fill(ex, y, ez, ex, y, ez, LADDER + 3);
    fill(ex - 1, D.yf + 1, ez - 1, ex - 1, top + 3, ez + 2, SBRICK); fill(ex + 2, top - 1, ez - 1, ex + 2, top + 3, ez + 2, SBRICK);
    fill(ex - 1, top + 4, ez - 1, ex + 2, top + 4, ez + 2, SBRICK); fill(ex, top + 4, ez, ex + 1, top + 4, ez + 1, AIR);
    fill(ex - 1, top + 3, ez - 1, ex - 1, top + 3, ez - 1, LAMP); fill(ex + 2, top + 3, ez + 2, ex + 2, top + 3, ez + 2, LAMP);
  }
  // ── 4부: 거룩한 성(계 21) — 동쪽 끝, 벽옥 성곽, 열두 진주 문, 서쪽 성벽 밑 기초석 자리 열둘, 정금 길, 생명수 강과 생명나무 ──
  var CITY = { x0: 1888, z0: 946, x1: 1998, z1: 1056 };
  function inCity(x, z) { return x >= CITY.x0 - 3 && x <= CITY.x1 + 3 && z >= CITY.z0 - 3 && z <= CITY.z1 + 3; }
  function cityInside(x, z) { return x > CITY.x0 + 1 && x < CITY.x1 - 1 && z > CITY.z0 + 1 && z < CITY.z1 - 1; }
  function cityGates() {   // 열두 문: 각 변에 셋(가운데 x/z 위치, 변)
    var g = [], C = CITY, w = C.x1 - C.x0;
    [0.25, 0.5, 0.75].forEach(function (f) { var m = Math.round(C.x0 + w * f); g.push(['n', m]); g.push(['s', m]); var mz = Math.round(C.z0 + (C.z1 - C.z0) * f); g.push(['w', mz]); g.push(['e', mz]); });
    return g;
  }
  function socketPos(i) { var C = CITY, zc = Math.round((C.z0 + C.z1) / 2); return [C.x0 - 3, G, zc - 11 + i * 2]; }
  function buildCity() {
    var C = CITY, xm = Math.round((C.x0 + C.x1) / 2), zm = Math.round((C.z0 + C.z1) / 2);
    fill(C.x0 - 4, G, C.z0 - 4, C.x1 + 4, SY - 1, C.z1 + 4, AIR);
    fill(C.x0 - 4, G - 14, C.z0 - 4, C.x1 + 4, G - 2, C.z1 + 4, STONE);
    fill(C.x0 - 4, G - 1, C.z0 - 4, C.x1 + 4, G - 1, C.z1 + 4, 18);
    fill(C.x0 + 2, G - 1, C.z0 + 2, C.x1 - 2, G - 1, C.z1 - 2, GOLDST);
    // 성곽(두께 2, 높이 20)과 성가퀴
    fill(C.x0, G - 1, C.z0, C.x1, G + 19, C.z0 + 1, CITYWALL); fill(C.x0, G - 1, C.z1 - 1, C.x1, G + 19, C.z1, CITYWALL);
    fill(C.x0, G - 1, C.z0, C.x0 + 1, G + 19, C.z1, CITYWALL); fill(C.x1 - 1, G - 1, C.z0, C.x1, G + 19, C.z1, CITYWALL);
    for (var k = C.x0; k <= C.x1; k += 2) { fill(k, G + 20, C.z0, k, G + 20, C.z0, CITYWALL); fill(k, G + 20, C.z1, k, G + 20, C.z1, CITYWALL); }
    for (k = C.z0; k <= C.z1; k += 2) { fill(C.x0, G + 20, k, C.x0, G + 20, k, CITYWALL); fill(C.x1, G + 20, k, C.x1, G + 20, k, CITYWALL); }
    // 열두 진주 문(이야기를 다 마치면 열림)
    var open = STORY.done;
    cityGates().forEach(function (g) {
      var id = open ? AIR : PEARL, m = g[1];
      if (g[0] === 'n') fill(m - 2, G, C.z0, m + 2, G + 6, C.z0 + 1, id);
      if (g[0] === 's') fill(m - 2, G, C.z1 - 1, m + 2, G + 6, C.z1, id);
      if (g[0] === 'w') fill(C.x0, G, m - 2, C.x0 + 1, G + 6, m + 2, id);
      if (g[0] === 'e') fill(C.x1 - 1, G, m - 2, C.x1, G + 6, m + 2, id);
    });
    // 기초석 자리 열둘(서쪽 성벽 밖)
    for (var i = 0; i < 12; i++) { var s = socketPos(i); fill(s[0], s[1], s[2], s[0], s[1], s[2], STORY.sockets[i] ? FSTONE0 + i : SOCKET); }
    // 생명수 강(가운데 남북으로)과 강 좌우 생명나무, 가운데 다리
    fill(xm - 1, G - 4, C.z0 + 2, xm + 1, G - 4, C.z1 - 2, GOLDST); fill(xm - 1, G - 3, C.z0 + 2, xm + 1, G - 1, C.z1 - 2, WATER);
    fill(xm - 1, G - 1, zm - 1, xm + 1, G - 1, zm + 1, GOLDST);
    for (var tz = C.z0 + 6; tz <= C.z1 - 6; tz += 8) [xm - 4, xm + 4].forEach(function (tx) {
      fill(tx, G, tz, tx, G + 5, tz, LOG);
      for (var ly = G + 4; ly <= G + 7; ly++) { var r = ly >= G + 7 ? 1 : 2; for (var dz = -r; dz <= r; dz++) for (var dx = -r; dx <= r; dx++) { if (r === 2 && Math.abs(dx) === 2 && Math.abs(dz) === 2) continue; if (dx === 0 && dz === 0 && ly <= G + 5) continue; fill(tx + dx, ly, tz + dz, tx + dx, ly, tz + dz, LIFELEAF); } }
    });
  }
  // 광석 난수는 2칸·3칸 덩이마다 같은 값이라 덩이마다 한 번만 계산해 둔다(값은 hash2 그대로 — 세상 모양은 한 칸도 안 바뀜)
  var OC = new Float64Array(16 * 16 * SYT), CLC = new Float64Array(16 * 16 * (SYT >> 1) + 256), CCC = new Float64Array(12 * 12 * 40), FY3MIN = Math.floor(YMIN / 3);
  function genColumn(cx, cz) {
    OC.fill(NaN); CLC.fill(NaN); CCC.fill(NaN);
    var col = { d: new Uint16Array(CS * SYT * CS), sky: new Int16Array(CS * CS), lamps: [], mod: false };
    genCol = col; genCX = cx; genCZ = cz;
    var x0 = cx * CS, z0 = cz * CS, lx, lz, x, z, y;
    var tops = new Int16Array(CS * CS), topIds = new Uint8Array(CS * CS), wtops = new Int16Array(CS * CS);
    for (lz = 0; lz < CS; lz++) for (lx = 0; lx < CS; lx++) {
      x = x0 + lx; z = z0 + lz;
      terrain(x, z);
      var h = T.h, d = col.d;
      d[(YMIN * CS + lz) * CS + lx + YOFF] = BASALT;
      // 칸마다 한 번만: 깊은 돌 높이, 이 지역 보석이 나올 수 있는 높이 범위(그 밖은 보석 계산을 건너뛴다 — 결과는 같음)
      var deepY = YMIN + 10 + Math.floor(hash2(x >> 2, z >> 2, 17) * 3), gemLo = 99, gemHi = -99;   // 깊은 돌: 바닥에서 10~12칸
      for (var gq = 0; gq < 12; gq++) { var gr = GEMS[gq]; if (gr && gr[3] === T.reg) { if (gr[4] < gemLo) gemLo = gr[4]; if (gr[5] > gemHi) gemHi = gr[5]; } }
      for (y = YMIN + 1; y <= h; y++) {
        var id = y === h ? T.top : (y > h - 4 ? T.sub : STONE);
        if (T.reg === 'wild' && id === STONE && y >= G - 3) id = y % 3 === 0 ? RED_ROCK2 : RED_ROCK;   // 광야: 붉은 바위 켜
        if (id === STONE && y < h - 2) {
          // 돌 속 석회암·검은 돌(2칸씩 뭉쳐서)
          var pk = ((lz >> 1) * 16 + (lx >> 1)), oi = pk * SYT + (y - YMIN), o = OC[oi];
          if (o !== o) o = OC[oi] = hash2((x >> 1) * 3 + y, (z >> 1) * 5 - (y >> 1), 7);
          var ci = pk * (SYT >> 1) + ((y - YMIN) >> 1), cl = CLC[ci];
          if (cl !== cl) cl = CLC[ci] = hash2((x >> 1) * 7 + (y >> 1) * 131, (z >> 1) * 11 - (y >> 1) * 17, 13);
          if (o < 0.035) id = y < YMIN + 10 || o < 0.008 ? BASALT : LIME;
          else if (cl < 0.0695 && hash2(x * 3 + y * 7, z * 5 - y, 14) < 0.35) {   // 11/19 광석 절반으로(전도사님 「광물이 너무 잘 나와」)   // cl이 크면 광석이 될 수 없으니 이 난수는 건너뜀
            // 11/20 더 깊게(땅 표면 y 15, 바닥 y -32): 구리 ≤64 · 철 ≤30 · 은 ≤2 · 호마노 ≤-4 · 금 ≤-8 · 청옥 ≤-16 · 금강석 ≤-22
            if (cl < 0.006 && y <= -8) id = ORE_AU;
            else if (cl >= 0.006 && cl < 0.014 && y <= 2) id = ORE_AG;
            else if (cl >= 0.014 && cl < 0.034 && y <= 30) id = ORE_FE;
            else if (cl >= 0.034 && cl < 0.06 && y <= 64) id = ORE_CU;
            else if (cl >= 0.06 && cl < 0.064 && y <= -4) id = ORE_ONYX;
            else if (cl >= 0.064 && cl < 0.067 && y <= -16) id = ORE_SAPH;
            else if (cl >= 0.067 && cl < 0.0695 && y <= -22) id = ORE_DIA;
          }
          // 석탄: 큰 덩이(3칸씩)로 흔하게, 산 속 높은 곳까지
          if (id === STONE && y <= 72) { var fx3 = Math.floor(x / 3), fz3 = Math.floor(z / 3), fy3 = Math.floor(y / 3), cci = ((fz3 - Math.floor(z0 / 3)) * 12 + (fx3 - Math.floor(x0 / 3))) * 40 + (fy3 - FY3MIN), cc = CCC[cci]; if (cc !== cc) cc = CCC[cci] = hash2(fx3 * 13 + fy3 * 71, fz3 * 17 - fy3 * 5, 15); if (cc < 0.05 && hash2(x * 5 + y, z * 3 - y * 2, 16) < 0.375) id = ORE_COAL; }
          // 열두 보석 광석: 곳마다·깊이마다 다르고 아주 드묾(계 21:19-20)
          if (id === STONE && y >= gemLo && y <= gemHi && cl > 0.95) {   // 덩이 값으로 먼저 거르고(20분의 1) 확률은 20배 — 나오는 양은 같음
            var gv = hash2(x * 7 + y * 131, z * 11 - y * 17, 41), gb = 0.3;
            if (gv < 0.78) for (var gi = 0; gi < 12; gi++) { var gg = GEMS[gi]; if (gg && gg[3] === T.reg && y >= gg[4] && y <= gg[5] && gv >= gb && gv < gb + gg[6] * 20) { id = gemOre(gi); break; } gb += 0.04; }
          }
          // 맨 아래 몇 칸은 깊은 돌(더 단단함)
          if (y <= deepY) { if (id === STONE) id = DEEP; else if (DEEPV[id]) id = DEEPV[id]; }
        }
        d[(y * CS + lz) * CS + lx + YOFF] = id;
      }
      for (y = h + 1; y <= T.wtop; y++) d[(y * CS + lz) * CS + lx + YOFF] = WATER;
      tops[lz * CS + lx] = h; topIds[lz * CS + lx] = T.top; wtops[lz * CS + lx] = T.wtop;
      // 물가 갈대, 들꽃
      if (T.wtop < 0) {
        var le = lakeE(x, z), od = Math.hypot(x - OASX, z - OASZ), hh = hash2(x, z, 11);
        if (T.reg === 'salt' && T.top === SALT_CRUST && hh < 0.005 && h + 6 < SY && !landmarkAt(x, z, 4)) { var sk = 2 + Math.floor(hash2(x, z, 12) * 5); for (var sy = 1; sy <= sk; sy++) d[((h + sy) * CS + lz) * CS + lx + YOFF] = SALT_ROCK; }
        else if ((((le >= 1 && le < 1.22) || (od >= 11 && od < 13.5) || (T.rd > 2.2 && T.rd < 3.6)) && hh < 0.45 || (T.reg === 'swamp' && hh < 0.3)) && h + 1 < SY && !landmarkAt(x, z, 2)) d[((h + 1) * CS + lz) * CS + lx + YOFF] = REED;
        else if (T.top===GRASS && hh>.92 && hh<=.955 && !inTown(x,z) && !inCommons(x,z) && h+1<SY)
          d[((h+1)*CS+lz)*CS+lx+YOFF]=le<2.1 || T.rd<12?LILY:(z>1210||x>VX1+70?THORN:THISTLE);
        else if (T.top === GRASS && hh > 0.955 && plotAt(x, z) < 0 && !(z > AZ0 - 5 && z < AZ1 + 5 && x > AX0 - 5 && x < AX1 + 5)) d[((h + 1) * CS + lz) * CS + lx + YOFF] = FLOWER;
      }
    }
    carveCaves(col, cx, cz, tops, wtops);
    buildFrontierCave(x0,z0,tops);
    if (z0 < SEA_Z) buildIsleMarks(x0, z0);
    buildPlaySpots(x0, z0);   // 11/21 함께 하는 놀이 자리
    buildFunSpots(x0, z0);    // 11/21 달리기 출발 기둥
    // 나무: 7칸 격자마다 한 그루 후보(옆 기둥 나무도 걸치게)
    for (var gz = Math.floor((z0 - 6) / 7); gz <= Math.floor((z0 + CS + 6) / 7); gz++) for (var gx = Math.floor((x0 - 6) / 7); gx <= Math.floor((x0 + CS + 6) / 7); gx++) {
      var tx = gx * 7 + Math.floor(hash2(gx, gz, 21) * 6), tz = gz * 7 + Math.floor(hash2(gx, gz, 22) * 6);
      if (landmarkAt(tx, tz, 13)) continue;
      if (playAt(tx, tz, 5) || funAt(tx, tz, 4)) continue;   // 11/21 놀이 자리엔 나무 없이
      if (inTown(tx, tz) || distOut(tx, tz) < 6 || plotAt(tx, tz) >= 0 || (tx >= COMMONS[0] - 4 && tx <= COMMONS[2] + 4 && tz >= COMMONS[1] - 4 && tz <= COMMONS[3] + 4)) continue;
      terrain(tx, tz);
      if (T.wtop >= 0) continue;
      var reg = T.reg, grove = vnoise(tx, tz, 40, 94) > 0.68, p = reg === 'taiga' ? 0.62 : reg === 'hermon' ? (T.h < G + 26 ? 0.3 : 0) : reg === 'meadow' ? (grove ? 0.4 : 0.02) : reg === 'galilee' ? 0.1 : reg === 'jordan' ? 0.25 : reg === 'sinai' ? 0 : reg === 'sisle' ? 0.25 : reg === 'cyprus' ? 0.4 : reg === 'malta' ? 0.16 : reg === 'patmos' ? 0.06 : reg === 'islet' ? 0.22 : reg === 'cedar' ? 0.62 : reg === 'wild' ? 0.035 : reg === 'salt' ? 0 : reg === 'east' ? 0.6 : (reg === 'south' ? 0.16 : (reg === 'west' || reg === 'ararat' ? 0.14 : (reg === 'other' ? 0.1 : 0)));
      if (reg === 'snow') p = 0.3; else if (reg === 'swamp') p = 0.16; else if (reg === 'shinar') p = T.rd < 16 ? 0.6 : 0.01; else if (reg === 'egyptland') p = 0.004;   // 11/24 먼 땅
      var palm = (reg === 'egyptland' && T.top === SAND && T.rd < 26) || reg === 'oasis' || (reg === 'desert' && hash2(gx, gz, 24) < 0.015) || ((reg === 'malta' || reg === 'islet' || reg === 'cyprus' || reg === 'sisle' || reg === 'jordan' || reg === 'sinai') && T.top === SAND);
      if (palm) p = reg === 'egyptland' ? 0.4 : reg === 'oasis' ? 0.7 : (reg === 'desert' ? 1 : (reg === 'sinai' ? 0.006 : (reg === 'jordan' ? 0.15 : (reg === 'cyprus' ? 0.25 : 0.4))));
      if (hash2(gx, gz, 23) > p) continue;
      if (palm) { if (T.top === SAND) palmTree(tx, T.h + 1, tz, 8 + Math.floor(hash2(gx, gz, 25) * 4)); continue; }
      if (T.top !== GRASS && !(reg === 'wild' && T.top === SAND) && !(reg === 'snow' && T.top === SNOW)) continue;
      var t2 = T.h; terrain(tx + 1, tz + 1); if (T.h !== t2) continue;
      if (reg === 'swamp' || (reg === 'shinar' && T.rd < 16)) willowTree(tx, t2 + 1, tz, 6 + Math.floor(hash2(gx, gz, 26) * 3));   // 버드나무(시 137:2)
      else if (reg === 'cedar' || reg === 'taiga' || reg === 'hermon' || reg === 'snow' || (reg === 'cyprus' && hash2(gx, gz, 27) < 0.35) || (reg === 'meadow' && hash2(gx, gz, 27) < 0.3)) cedarTree(tx, t2 + 1, tz, (reg === 'cedar' ? 14 : 9) + Math.floor(hash2(gx, gz, 26) * (reg === 'taiga' ? 9 : 7)));
      else if (reg === 'wild') acaciaTree(tx, t2 + 1, tz, 5 + Math.floor(hash2(gx, gz, 26) * 3));
      else tree(tx, t2 + 1, tz, 7 + Math.floor(hash2(gx, gz, 26) * 5));
    }
    // 함께 짓는 터: 평평한 풀밭 + 자갈 테두리 + 네 귀퉁이 등불
    if (x0 + CS > COMMONS[0] - 1 && x0 < COMMONS[2] + 2 && z0 + CS > COMMONS[1] - 1 && z0 < COMMONS[3] + 2) {
      fill(COMMONS[0] - 1, G, COMMONS[1] - 1, COMMONS[2] + 1, SY - 1, COMMONS[3] + 1, AIR);
      fill(COMMONS[0] - 1, G - 12, COMMONS[1] - 1, COMMONS[2] + 1, G - 2, COMMONS[3] + 1, DIRT);
      fill(COMMONS[0], G - 1, COMMONS[1], COMMONS[2], G - 1, COMMONS[3], GRASS);
      fill(COMMONS[0] - 1, G - 1, COMMONS[1] - 1, COMMONS[2] + 1, G - 1, COMMONS[1] - 1, 18); fill(COMMONS[0] - 1, G - 1, COMMONS[3] + 1, COMMONS[2] + 1, G - 1, COMMONS[3] + 1, 18);
      fill(COMMONS[0] - 1, G - 1, COMMONS[1] - 1, COMMONS[0] - 1, G - 1, COMMONS[3] + 1, 18); fill(COMMONS[2] + 1, G - 1, COMMONS[1] - 1, COMMONS[2] + 1, G - 1, COMMONS[3] + 1, 18);
      [[COMMONS[0] - 1, COMMONS[1] - 1], [COMMONS[2] + 1, COMMONS[1] - 1], [COMMONS[0] - 1, COMMONS[3] + 1], [COMMONS[2] + 1, COMMONS[3] + 1]].forEach(function (c) { fill(c[0], G, c[1], c[0], G, c[1], LAMP); });
    }
    // 이야기 3부·4부: 사막 땅속 「사망의 음침한 골짜기」 미로, 동쪽 끝 「거룩한 성」
    if (x0 + CS > DUN.x0 && x0 < DUN.x0 + DUN.n * DUN.cs && z0 + CS > DUN.z0 && z0 < DUN.z0 + DUN.n * DUN.cs) buildDungeon();
    if (x0 + CS > CITY.x0 - 4 && x0 < CITY.x1 + 4 && z0 + CS > CITY.z0 - 4 && z0 < CITY.z1 + 4) buildCity();
    // 마을·방주(그 기둥에 걸친 부분만)
    // 동쪽 끝은 마을 땅과 방주 중 더 먼 쪽까지(마을 땅만 보면 방주 동쪽 끝 기둥이 빠져 뚫렸었다)
    if (x0 + CS > Math.min(TOWN[0][0], TOWN[1][0]) - 6 && x0 < Math.max(TOWN[0][2], TOWN[1][2]) + 6 && z0 + CS > TOWN[0][1] - 6 && z0 < LZ - LRZ) buildTown();
    if (x0 + CS > TARR[0] && x0 < TARR[2] + 6 && z0 + CS > TARR[1] && z0 < TARR[3] + 6)
      TARPITS.forEach(function (t) { fill(t[0], G - 1, t[1], t[0] + t[2] - 1, G - 1, t[1] + t[2] - 1, AIR); fill(t[0], G - 3, t[1], t[0] + t[2] - 1, G - 2, t[1] + t[2] - 1, TAR); });
    buildExcursions(x0,z0);
    if(villageProjectsEnabled)buildBridgeGround(x0,z0);
    // 학생 집
    for (var i = 0; i < PCOLS * PROWS; i++) {
      var po = plotOrigin(i);
      if (po.x + PLOT <= x0 || po.x >= x0 + CS || po.z + PLOT <= z0 || po.z >= z0 + CS) continue;
      if (plotData[i]) { var a = plotData[i], k = 0; for (y = PY0; y < G + PH; y++) for (z = 0; z < PLOT; z++) for (x = 0; x < PLOT; x++) setRaw(po.x + x, y, po.z + z, a[k++]); }
    }
    buildLandmarks(x0, z0);
    buildFarLands(x0, z0);   // 11/24 먼 나라
    if (HOREB_X >= x0 - 2 && HOREB_X < x0 + CS + 2 && HOREB_Z >= z0 - 2 && HOREB_Z < z0 + CS + 2) buildHoreb();
    markPlots();
    var ed = EDITS[cz * NC + cx]; if (ed) for (var li in ed) { var lj = +li + YOFF; if (lj >= 0 && lj < col.d.length) col.d[lj] = ed[li]; }
    col.machines=new Set();
    genCol = null;
    // 하늘 그늘, 등불
    for (lz = 0; lz < CS; lz++) for (lx = 0; lx < CS; lx++) skyScan(col, lx, lz);
    for (var q = 0; q < col.d.length; q++) {
      var bid=col.d[q];
      if(isFrontierMachine(bid))col.machines.add(q);
      if (LIGHTS[bid]) {
        var qx=q%CS,r0=(q-qx)/CS,qz=r0%CS,qy=(r0-qz)/CS+YMIN;   // 11/22 +YMIN: 땅속을 넓힌 뒤(11/20) 등불 높이가 32칸 위로 적혀, 땅을 다시 불러오면 횃불·등불 빛이 꺼졌음
        col.lamps.push([x0+qx,qy,z0+qz]);
      }
    }
    COLS[cz * NC + cx] = col;
    return col;
  }
  // 땅속 굴: 둘레 기둥에서 시작한 굴(벌레가 지나간 길처럼 구불구불)이 이 기둥을 지나면 판다. 가끔 땅 위로 입구가 열린다.
  function carveCaves(col, cx, cz, tops, wtops) {
    var x0 = cx * CS, z0 = cz * CS, d = col.d;
    for (var oz = cz - 3; oz <= cz + 3; oz++) for (var ox = cx - 3; ox <= cx + 3; ox++) {
      if (hash2(ox, oz, 31) > 0.62) continue;
      var sx = ox * CS + hash2(ox, oz, 32) * CS, sz = oz * CS + hash2(ox, oz, 35) * CS;
      if (sx < 12 || sz < 12 || sx > WS - 12 || sz > WS - 12) continue;
      terrain(sx | 0, sz | 0);
      var ent = hash2(ox, oz, 33) < 0.3 && T.wtop < 0 && T.h >= G && !inTown(sx | 0, sz | 0) && plotAt(sx | 0, sz | 0) < 0 && distOut(sx | 0, sz | 0) > 8;
      var deepC = !ent && hash2(ox, oz, 44) < 0.05, pyMin = deepC ? YMIN + 4 : 3;   // 깊은 굴은 가끔만(땅속이 꽉 차 있으면 그리지 않아 가벼움)
      var py = ent ? T.h + 1 : (deepC ? YMIN + 4 + hash2(ox, oz, 36) * 22 : 3 + hash2(ox, oz, 36) * Math.max(3, T.h - 9));
      var L = 50 + hash2(ox, oz, 37) * 70 | 0, yaw = hash2(ox, oz, 38) * Math.PI * 2, pitch = ent ? -0.6 : (hash2(ox, oz, 39) - 0.5) * 0.4;
      var px = sx, pz = sz, big = hash2(ox, oz, 40) < 0.2 ? (L * 0.6 | 0) : -99;   // 가끔 넓은 방
      for (var i = 0; i < L; i++) {
        yaw += (hash2(ox * 7 + i, oz * 13 - i, 41) - 0.5) * 0.45;
        pitch = ent && i < 14 ? -0.6 : pitch * 0.85 + (hash2(ox * 3 - i, oz * 5 + i, 42) - 0.5) * 0.18;
        var cpi = Math.cos(pitch);
        px += Math.cos(yaw) * cpi; pz += Math.sin(yaw) * cpi; py += Math.sin(pitch);
        if (py < pyMin) { py = pyMin; pitch = Math.abs(pitch); }
        var r = 1.4 + Math.sin(i / L * Math.PI) * 1.1 + (Math.abs(i - big) < 4 ? 2.4 : 0), ry = r * 0.75;
        if (px + r < x0 || px - r >= x0 + CS || pz + r < z0 || pz - r >= z0 + CS) continue;
        var xa = Math.max(x0, Math.floor(px - r)), xb = Math.min(x0 + CS - 1, Math.floor(px + r));
        var za = Math.max(z0, Math.floor(pz - r)), zb = Math.min(z0 + CS - 1, Math.floor(pz + r));
        var ya = Math.max(YMIN + 1, Math.floor(py - ry)), yb = Math.min(SY - 2, Math.floor(py + ry));
        for (var z = za; z <= zb; z++) for (var x = xa; x <= xb; x++) {
          var li = (z - z0) * CS + (x - x0), top = tops[li];
          var lim = ent && i < 16 && wtops[li] < 0 ? top : top - 3;   // 입구 굴의 처음 부분만 땅 위로 뚫린다
          for (var y = ya; y <= Math.min(yb, lim); y++) {
            var ddx = (x + 0.5 - px) / r, ddy = (y + 0.5 - py) / ry, ddz = (z + 0.5 - pz) / r;
            if (ddx * ddx + ddy * ddy + ddz * ddz > 1) continue;
            var k = (y * CS + (z - z0)) * CS + (x - x0) + YOFF;
            if (d[k] === WATER) continue;
            d[k] = AIR;
            if (y === top && y + 1 < SY && kind(d[k + CS * CS]) === 'plant') d[k + CS * CS] = AIR;
          }
        }
      }
    }
  }
  // 섬의 볼거리: 밧모섬 바위굴(계 1:9) · 멜리데 바닷가 모닥불과 부서진 배(행 27:41, 28:2) · 구브로 나무 부두(행 13:4)
  function isleTop(x, z) { terrain(x, z); return T.h; }
  function buildIsleMarks(x0, z0) {
    var P0 = ISLES[0], M0 = ISLES[1], C0 = ISLES[2];
    function near(cx, cz, r) { return cx + r >= x0 && cx - r < x0 + CS && cz + r >= z0 && cz - r < z0 + CS; }
    // 밧모: 섬 가운데 언덕에 동쪽으로 열린 바위굴, 안에 등잔과 두루마리 서가
    if (near(P0[1], P0[2], 12)) {
      var px = P0[1], pz = P0[2], ph = isleTop(px, pz);
      fill(px - 6, ph - 5, pz - 5, px + 6, ph + 4, pz + 5, STONE);
      fill(px - 4, ph - 3, pz - 3, px + 4, ph + 1, pz + 3, AIR);
      fill(px + 5, ph - 3, pz - 1, px + 7, ph, pz + 1, AIR);
      fill(px - 4, ph - 4, pz - 3, px + 4, ph - 4, pz + 3, STONE);
      setRaw(px - 3, ph - 3, pz, LAMP); setRaw(px - 4, ph - 3, pz + 2, WORD_SHELF); setRaw(px, ph - 3, pz - 2, LAMP);
    }
    // 멜리데: 남쪽 바닷가 모닥불(행 28:2)과 물가에 걸린 부서진 배(행 27:41)
    if (near(M0[1], M0[2] + 70, 16)) {
      var mx = M0[1] - 10, mz = M0[2] + 62, mh = isleTop(mx, mz);
      setRaw(mx, mh + 1, mz, CAMPFIRE);
      [[-2, 0], [2, 0], [0, -2], [0, 2]].forEach(function (q) { setRaw(mx + q[0], mh + 1, mz + q[1], LOG); });
      var sx = M0[1] + 14, sz = M0[2] + 80, sh = G - 2;
      for (var i = 0; i < 16; i++) { var w = i < 3 ? 1 : (i > 12 ? 1 : 2); for (var dz = -w; dz <= w; dz++) { setRaw(sx + i, sh, sz + dz, PITCH); if (Math.abs(dz) === w && (i % 4) !== 1) setRaw(sx + i, sh + 1, sz + dz, PITCH); } }
      for (var j = 0; j < 4; j++) setRaw(sx + 7, sh + 1 + j, sz, LOG);
      setRaw(sx + 7, sh + 5, sz + 1, WOOL_W); setRaw(sx + 7, sh + 4, sz + 1, WOOL_W);
    }
    // 11/21 배 대는 부두(GPT 검토 27): 밧모·멜리데 남쪽 물가에도 — 배를 타고 가서 내릴 곳이 멀리서 보이게(나무 데크 + 등불 + 청색 깃 기둥)
    [[P0[1], P0[2], P0[3]], [M0[1] - 30, M0[2], M0[3]]].forEach(function (q) {
      if (!near(q[0], q[1] + q[2], q[2] + 20)) return;
      var dx0 = q[0], zs = null;
      for (var z = q[1]; z < q[1] + q[2] * 2; z++) { terrain(dx0, z); if (T.h < G) { zs = z; break; } }
      if (zs === null || !near(dx0, zs + 4, 10)) return;
      for (var k = -2; k < 9; k++) {
        var zz = zs + k; for (var ddx = -1; ddx <= 1; ddx++) setRaw(dx0 + ddx, G, zz, GOPHER);
        if (k % 4 === 0 || k === 8) { setRaw(dx0 - 2, G, zz, LOG); setRaw(dx0 - 2, G + 1, zz, FENCE); setRaw(dx0 - 2, G + 2, zz, LAMP); setRaw(dx0 + 2, G, zz, LOG); for (var yy = G - 4; yy < G; yy++) { setRaw(dx0 - 1, yy, zz, LOG); setRaw(dx0 + 1, yy, zz, LOG); } }
      }
      for (var yb = 1; yb <= 3; yb++) setRaw(dx0 + 2, G + yb, zs + 8, yb === 3 ? WOOL_B : FENCE);
    });
    // 구브로: 남쪽 물가로 나온 나무 부두와 등불
    if (near(C0[1], C0[2] + 150, 24)) {
      var cx2 = C0[1], cz2 = C0[2] + 128;
      for (var k = 0; k < 26; k++) { var zz = cz2 + k; terrain(cx2, zz); if (T.h >= G) continue; for (var dx = -1; dx <= 1; dx++) setRaw(cx2 + dx, G, zz, GOPHER); if (k % 6 === 0) { setRaw(cx2 - 2, G, zz, LOG); setRaw(cx2 - 2, G + 1, zz, FENCE); setRaw(cx2 - 2, G + 2, zz, LAMP); for (var yy = G - 4; yy < G; yy++) { setRaw(cx2 - 1, yy, zz, LOG); setRaw(cx2 + 1, yy, zz, LOG); } } }
    }
  }
  function skyScan(col, lx, lz) {
    var t = YMIN - 1;
    for (var y = SY - 1; y >= YMIN; y--) { var id = col.d[(y * CS + lz) * CS + lx + YOFF]; if (isSolid(id) && id !== GLASS && id !== LEAF) { t = y; break; } }
    col.sky[lz * CS + lx] = t;
  }
  function updateSky(x, z) { var c = colAt(x, z); if (c) skyScan(c, x & 31, z & 31); }
  function skyAt(x, z) { var c = colAt(x, z); return c ? c.sky[(z & 31) * CS + (x & 31)] : YMIN - 1; }
  function tree(x, y, z, h) {
    fill(x, y, z, x + 1, y + h - 1, z + 1, LOG);
    for (var ly = h - 3; ly <= h + 2; ly++) {
      var rr = ly > h ? 2 : 4;
      for (var dz = -rr; dz <= rr + 1; dz++) for (var dx = -rr; dx <= rr + 1; dx++) {
        var ddx = dx - 0.5, ddz = dz - 0.5;
        if (ddx * ddx + ddz * ddz <= (rr + 0.6) * (rr + 0.6) && get2(x + dx, y + ly, z + dz) === AIR) setRaw(x + dx, y + ly, z + dz, LEAF);
      }
    }
  }
  function palmTree(x, y, z, h) {
    for (var i = 0; i < h; i++) setRaw(x + (i > h * 0.6 ? 1 : 0), y + i, z, LOG);
    var tx = x + 1, ty = y + h;
    setRaw(tx, ty, z, LEAF);
    [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]].forEach(function (d) {
      for (var k = 1; k <= 4; k++) setRaw(tx + d[0] * k, ty - (k > 2 ? 1 : 0), z + d[1] * k, LEAF);
    });
  }
  // 만드는 중에는 그 기둥 안을 읽는다
  function get2(x, y, z) {
    if (genCol && (x >> 5) === genCX && (z >> 5) === genCZ) { if (y < YMIN || y >= SY) return AIR; return genCol.d[(y * CS + (z & 31)) * CS + (x & 31) + YOFF]; }
    return get(x, y, z);
  }
  // ── 절기: 대림절 첫 주일 ~ 주현절(1/6)은 성탄 장식, 12~2월은 눈(사막 빼고). 주소에 ?season=christmas 를 붙이면 미리 보기 ──
  function adventStart(y) { var c = new Date(y, 11, 25), back = (c.getDay() || 7) + 21; return new Date(y, 11, 25 - back); }
  function festiveOn() {
    if (/season=christmas/.test(location.search)) return true;
    var d = new Date(), y = d.getFullYear(), t = new Date(y, d.getMonth(), d.getDate());
    return t >= adventStart(y) || t <= new Date(y, 0, 6);
  }
  function winterOn() { var m = new Date().getMonth() + 1; return /season=(christmas|winter)/.test(location.search) || m === 12 || m <= 2; }
  var FESTIVE = festiveOn(), WINTER = winterOn();
  var NAT_X = XM - 68, NAT_Z = AZ1 + 3;   // 베들레헴 마구간(마을 남쪽 광장 서쪽, 마을 구역이라 캘 수 없음)
  function buildNativity() {
    if (!FESTIVE) return;
    var x0 = NAT_X, z0 = NAT_Z, x1 = x0 + 10, z1 = z0 + 8, y = G;
    fill(x0, G - 1, z0, x1, G - 1, z1, 22);                                   // 짚 바닥
    [[x0, z0], [x1, z0], [x0, z1], [x1, z1], [x0, z0 + 4], [x1, z0 + 4]].forEach(function (c) { fill(c[0], y, c[1], c[0], y + 3, c[1], LOG); });
    fill(x0, y, z0 + 1, x0, y + 2, z1 - 1, GOPHER);                           // 뒷벽(서쪽)
    fill(x0 + 1, y, z0, x1 - 1, y + 1, z0, GOPHER); fill(x0 + 1, y, z1, x1 - 1, y + 1, z1, GOPHER);   // 옆 낮은 벽
    fill(x0 - 1, y + 4, z0 - 1, x1 + 1, y + 4, z1 + 1, 22);                   // 짚 지붕
    setRaw(x0 + 4, y, z0 + 4, MANGER);                                        // 구유(눅 2:7)
    setRaw(x0 + 1, y, z0 + 1, 22); setRaw(x0 + 1, y + 1, z0 + 1, 22); setRaw(x0 + 1, y, z1 - 1, 22); setRaw(x0 + 2, y, z1 - 1, 22);
    setRaw(x0 + 2, y, z0 + 2, OIL_LAMP); setRaw(x0 + 2, y, z1 - 2, OIL_LAMP);
    for (var z = AZ1 + 2; z < PZ0 - 1; z += 4) { setRaw(XM - 5, y, z, LANTERN); setRaw(XM + 4, y, z, LANTERN); }   // 마을 길 등불
  }
  // ── 11/24 성탄 트리(전도사님 「교회 로비 트리처럼 곳곳에」): 대림절 첫 주일 ~ 주현절에만, 방주 앞 광장 여러 곳 ──
  //   빨간 장식 공(붉은 양털) · 금 장식 · 작은 등 · 꼭대기 금별, 흰 깔개(흰 양털) 위에 선물 상자 · 그루터기 · 꽃. 눈 덮인 트리도 하나씩.
  //   [가운데 x, z, 트리들 [dx, dz, 높이, 눈 덮임], 선물·소품 [dx, dz, 블록, 높이]]
  var XMAS_SPOTS = [
    [XM - 17, AZ1 + 7, [[0, 0, 12, 0]], [[-3, 4, WOOL_R, 1], [-2, 4, WOOL_R, 1], [2, 4, CLOTH_Y, 1], [3, 4, BLK_AU, 1], [4, 2, WOOL_W, 1], [-4, 2, LOG, 1], [-5, 3, FLOWER, 1], [5, 4, FLOWER, 1], [0, 5, BLK_AU, 1], [1, 5, WOOL_R, 2]]],
    [XM + 16, AZ1 + 7, [[0, 0, 12, 0]], [[-3, 4, BLK_AU, 1], [-2, 4, BLK_AU, 1], [2, 4, WOOL_R, 1], [3, 4, WOOL_R, 2], [-4, 2, WOOL_B, 1], [4, 2, LOG, 1], [5, 3, FLOWER, 1], [-5, 4, FLOWER, 1], [0, 5, WOOL_W, 1], [-1, 5, CLOTH_G, 1]]],
    [XM - 54, AZ1 + 6, [[0, 0, 8, 1]], [[-2, 3, WOOL_R, 1], [2, 3, BLK_AU, 1], [3, 2, FLOWER, 1], [-3, 2, LOG, 1]]],
    [XM + 87, AZ1 + 6, [[-6, 0, 9, 1], [0, -1, 10, 0], [6, 0, 12, 0]], [[-3, 3, WOOL_R, 1], [-2, 4, LOG, 1], [1, 4, CLOTH_Y, 1], [2, 4, CLOTH_Y, 2], [4, 4, WOOL_R, 1], [8, 4, CLOTH_G, 1], [9, 4, CLOTH_G, 2], [10, 3, WOOL_R, 1], [-9, 3, FLOWER, 1], [3, 5, FLOWER, 1], [7, 5, LOG, 1]]],
    [XM - 92, AZ1 + 6, [[-3, 0, 8, 1], [3, 0, 10, 0]], [[0, 3, WOOL_R, 1], [1, 4, BLK_AU, 1], [-1, 4, LOG, 1], [5, 3, WOOL_W, 1], [-5, 3, FLOWER, 1], [6, 2, FLOWER, 1]]]
  ];
  var XMAS_BOX = XMAS_SPOTS.map(function (q) { return [q[0] - 14, q[1] - 6, q[0] + 14, q[1] + 6]; });
  function xmasProtect(x, z) { if (!FESTIVE) return false; for (var i = 0; i < XMAS_BOX.length; i++) { var b = XMAS_BOX[i]; if (x >= b[0] && x <= b[2] && z >= b[1] && z <= b[3]) return true; } return false; }
  function xmasTree(cx, cz, h, snowy) {
    var y = G, R = Math.max(2, Math.round(h * 0.34)), k, dx, dz;
    for (dz = -R; dz <= R; dz++) for (dx = -R; dx <= R; dx++) if (dx * dx + dz * dz <= R * R - 1) setRaw(cx + dx, y - 1, cz + dz, WOOL_W);   // 흰 트리 깔개
    fill(cx, y, cz, cx, y + h - 3, cz, CEDAR_LOG);
    for (k = 1; k <= h - 2; k++) {
      var t = (k - 1) / (h - 2), r = R * (1 - t) + 0.35 - (k % 3 === 0 && k > 1 ? 0.7 : 0);   // 세 켜마다 조금 들어가 층층이
      if (r < 0.7) { setRaw(cx, y + k, cz, CEDAR_LEAF); continue; }
      var ri = Math.ceil(r);
      for (dz = -ri; dz <= ri; dz++) for (dx = -ri; dx <= ri; dx++) {
        var d2 = dx * dx + dz * dz; if (d2 > r * r + 0.5) continue;
        if (!dx && !dz && k <= h - 3) continue;
        var id = CEDAR_LEAF;
        if (d2 > (r - 1) * (r - 1) + 0.2) {   // 겉면에만 장식
          var hv = hash2(cx * 7 + dx * 13 + k * 101, cz * 5 + dz * 17 - k * 29, 431);
          if (hv < 0.12) id = WOOL_R; else if (hv < 0.16) id = BLK_AU; else if (hv < 0.2) id = LANTERN; else if (snowy && hv > 0.52) id = SNOW;
        }
        setRaw(cx + dx, y + k, cz + dz, id);
      }
    }
    var ty = y + h - 1;   // 꼭대기 별(마 2:9)
    setRaw(cx, ty, cz, GOLDST); setRaw(cx, ty + 1, cz, GOLDST); setRaw(cx, ty + 2, cz, GOLDST);
    setRaw(cx - 1, ty + 1, cz, GOLDST); setRaw(cx + 1, ty + 1, cz, GOLDST); setRaw(cx, ty + 1, cz - 1, GOLDST); setRaw(cx, ty + 1, cz + 1, GOLDST);
  }
  function buildXmasTrees() {
    if (!FESTIVE) return;
    XMAS_SPOTS.forEach(function (q) {
      q[2].forEach(function (t) { xmasTree(q[0] + t[0], q[1] + t[1], t[2], t[3]); });
      q[3].forEach(function (g) { var x = q[0] + g[0], z = q[1] + g[1]; if (g[2] === FLOWER) { setRaw(x, G - 1, z, GRASS); setRaw(x, G, z, FLOWER); } else fill(x, G, z, x, G + g[3] - 1, z, g[2]); });
    });
  }
  // ── 광야(출 13·16·17장): 호렙의 반석 · 구름 기둥과 불 기둥 · 아침 만나 ──
  var HOREB_X = DES_X + 120, HOREB_Z = OASZ - 40, HOREB_Y = -1;
  function horebY() { if (HOREB_Y < 0) { terrain(HOREB_X, HOREB_Z); HOREB_Y = T.h + 1; } return HOREB_Y; }
  function buildHoreb() {
    var y = horebY();
    fill(HOREB_X - 1, y, HOREB_Z - 1, HOREB_X + 1, y + 2, HOREB_Z + 1, BASALT);
    setRaw(HOREB_X, y + 3, HOREB_Z, BASALT);
  }
  function inHoreb(x, y, z) { var hy = horebY(); return Math.abs(x - HOREB_X) <= 1 && Math.abs(z - HOREB_Z) <= 1 && y >= hy && y <= hy + 3; }
  function strikeRock() {
    if (HOTBAR[sel] === STAFF && have(STAFF)) {
      var y = horebY(), sx = HOREB_X + 2, sz = HOREB_Z;
      if (get(sx, y, sz) === AIR) setBlock(sx, y, sz, WATER);
      if (get(sx + 1, y, sz) === AIR) setBlock(sx + 1, y, sz, WATER);
      swingT = 0.25; sfx('break', 1); unlock('rock');
      showVerseCard('💧', '호렙의 반석', '내가 호렙 산에 있는 그 반석 위 거기서 네 앞에 서리니 너는 그 반석을 치라 그것에서 물이 나오리니 백성이 마시리라 모세가 이스라엘 장로들의 목전에서 그대로 행하니라', '출애굽기 17:6', '반석에서 물이 솟았어요');
    } else showVerseCard('🪨', '호렙의 반석', '내가 호렙 산에 있는 그 반석 위 거기서 네 앞에 서리니 너는 그 반석을 치라 그것에서 물이 나오리니 백성이 마시리라 모세가 이스라엘 장로들의 목전에서 그대로 행하니라', '출애굽기 17:6', '지팡이를 들고 반석을 쳐 보세요');
  }
  function buildTown() {
    fill(AX0 - 4, G - 1, AZ0 - 4, AX1 + 4, G - 1, AZ1 + 4, SAND);
    fill(XM - 3, G - 1, AZ1 + 1, XM + 2, G - 1, PZ0 - 1, PATH);
    for (var r = 0; r <= PROWS; r++) { var zz = PZ0 - PGAP + r * PSTEP; fill(PX0 - PGAP, G - 1, zz, VX1, G - 1, zz + PGAP - 1, PATH); }
    for (var c = 0; c <= PCOLS; c++) { var xx = PX0 - PGAP + c * PSTEP; fill(xx, G - 1, PZ0 - PGAP, xx + PGAP - 1, G - 1, VZ1, PATH); }
    fill(XM - 2, G - 1, VZ1 + 1, XM + 1, G - 1, LZ - LRZ - 2, PATH);
    // 마을 땅 위 꽃·풀은 치운다
    fill(PX0 - PGAP, G, PZ0 - PGAP, VX1, G, VZ1, AIR);
    buildArk();
    buildNativity();
    buildXmasTrees();   // 11/24 성탄 트리
    buildMarketStalls();   // 11/24 마을 장터
  }

  function buildArk() {
    // 바닥·벽·지붕: 역청을 그 안팎에 칠한 나무(창 6:14)
    fill(AX0, AY0, AZ0, AX1, AY0, AZ1, PITCH);
    fill(AX0, AY0 + 1, AZ0, AX1, AY1, AZ0, PITCH);
    fill(AX0, AY0 + 1, AZ1, AX1, AY1, AZ1, PITCH);
    fill(AX0, AY0 + 1, AZ0, AX0, AY1, AZ1, PITCH);
    fill(AX1, AY0 + 1, AZ0, AX1, AY1, AZ1, PITCH);
    fill(AX0, AY1, AZ0, AX1, AY1, AZ1, PITCH);
    fill(AX0 + 1, AY0 + 1, AZ0 + 1, AX1 - 1, AY1 - 1, AZ1 - 1, AIR);
    // 상 중 하 삼층(창 6:16)
    fill(AX0 + 1, AY0 + 10, AZ0 + 1, AX1 - 1, AY0 + 10, AZ1 - 1, GOPHER);
    fill(AX0 + 1, AY0 + 20, AZ0 + 1, AX1 - 1, AY0 + 20, AZ1 - 1, GOPHER);
    // 창: 위에서부터 한 규빗(지붕 바로 아래 한 줄)을 사방으로 트고 5칸마다 기둥
    var yw = AY1 - 1, x, z;
    fill(AX0 + 1, yw, AZ0, AX1 - 1, yw, AZ0, AIR); fill(AX0 + 1, yw, AZ1, AX1 - 1, yw, AZ1, AIR);
    fill(AX0, yw, AZ0 + 1, AX0, yw, AZ1 - 1, AIR); fill(AX1, yw, AZ0 + 1, AX1, yw, AZ1 - 1, AIR);
    for (x = AX0 + 5; x < AX1; x += 5) { setRaw(x, yw, AZ0, LOG); setRaw(x, yw, AZ1, LOG); }
    for (z = AZ0 + 5; z < AZ1; z += 5) { setRaw(AX0, yw, z, LOG); setRaw(AX1, yw, z, LOG); }
    // 문은 옆으로: 남쪽 긴 벽 가운데, 하층
    fill(XM - 3, AY0 + 1, AZ1, XM + 2, AY0 + 8, AZ1, AIR);
    // 칸들(창 6:14)
    [AY0 + 1, AY0 + 11].forEach(function (y) {
      for (x = AX0 + 25; x < AX1; x += 25) {
        fill(x, y, AZ0 + 1, x, y + 1, AZ0 + 17, GOPHER);
        if (Math.abs(x - XM) > 6) fill(x, y, AZ1 - 17, x, y + 1, AZ1 - 1, GOPHER);
      }
    });
    // 층 사이 계단(10단)과 계단 구멍
    function stairs(x0, yBase, dir) {
      for (var i = 0; i < 10; i++) { var sx = x0 + dir * i; fill(sx, yBase + 1, AZ0 + 21, sx, yBase + 1 + i, AZ0 + 23, GOPHER); }
      var a = x0 - dir, b = x0 + dir * 8;
      fill(Math.min(a, b), yBase + 10, AZ0 + 21, Math.max(a, b), yBase + 10, AZ0 + 23, AIR);
    }
    stairs(AX0 + 12, AY0, 1); stairs(AX1 - 12, AY0, -1);
    stairs(AX0 + 40, AY0 + 10, 1); stairs(AX1 - 40, AY0 + 10, -1);
    var zc = AZ0 + Math.floor(AW / 2);
    [AY0, AY0 + 10, AY0 + 20].forEach(function (y) { for (x = AX0 + 5; x < AX1; x += 10) setRaw(x, y, zc, LAMP); });
    // ── 완성된 방주 안(창 6:14·19·21, 7:13) ──
    var LOW = AY0 + 1, MID = AY0 + 11, TOP = AY0 + 21;
    // 아래·가운데 층 칸: 앞은 울타리(가운데 세 칸은 드나드는 곳), 안쪽 벽에 짚더미와 물 항아리
    [LOW, MID].forEach(function (y) {
      for (var x0 = AX0 + 1; x0 < AX1; x0 += 25) {
        var x1 = Math.min(x0 + 23, AX1 - 1), mid = (x0 + x1) >> 1;
        [[AZ0 + 18, AZ0 + 1, 1], [AZ1 - 18, AZ1 - 1, -1]].forEach(function (s) {
          if (s[2] < 0 && y === LOW && x1 >= XM - 8 && x0 <= XM + 8) return;   // 문 앞 넓은 마당은 비워 둔다
          for (var fx = x0; fx <= x1; fx++) if (Math.abs(fx - mid) > 1) setRaw(fx, y, s[0], FENCE);
          setRaw(x0 + 1, y, s[1], 22); setRaw(x0 + 2, y, s[1], 22); setRaw(x0 + 1, y + 1, s[1], 22);   // 짚더미
          setRaw(x1 - 1, y, s[1], JAR);   // 물 항아리
        });
      }
    });
    // 위층 서쪽: 노아와 아들 셋 부부의 방 넷(창 7:13)
    for (var r = 0; r < 4; r++) {
      var rx = AX0 + 3 + r * 11, rz0 = AZ0 + 1, rz1 = AZ0 + 11;
      fill(rx, TOP, rz0, rx, TOP + 2, rz1, GOPHER);
      fill(rx + 10, TOP, rz0, rx + 10, TOP + 2, rz1, GOPHER);
      fill(rx, TOP, rz1, rx + 10, TOP + 2, rz1, GOPHER);
      fill(rx + 4, TOP, rz1, rx + 6, TOP + 1, rz1, AIR);   // 방 문
      setRaw(rx + 2, TOP, rz0 + 1, BED); setRaw(rx + 8, TOP, rz0 + 1, BED);
      fill(rx + 3, TOP, rz0 + 4, rx + 7, TOP, rz0 + 7, CARPET);
      setRaw(rx + 5, TOP, rz0 + 1, OIL_LAMP);
      setRaw(rx + 2, TOP, rz0 + 8, CHAIR); setRaw(rx + 8, TOP, rz0 + 8, CHAIR);
    }
    // 위층 동쪽: 먹을 모든 양식을 저축한 곳간(창 6:21)
    var sx0 = AX1 - 42;
    fill(sx0, TOP, AZ0 + 1, sx0, TOP + 2, AZ0 + 16, GOPHER);
    fill(sx0, TOP, AZ0 + 16, AX1 - 1, TOP + 2, AZ0 + 16, GOPHER);
    fill(sx0 + 18, TOP, AZ0 + 16, sx0 + 21, TOP + 1, AZ0 + 16, AIR);   // 곳간 문
    for (x = sx0 + 2; x < AX1 - 2; x += 3) {
      setRaw(x, TOP, AZ0 + 2, JAR); setRaw(x, TOP, AZ0 + 4, (x & 1) ? OIL_JAR : JAR);
      setRaw(x + 1, TOP, AZ0 + 8, 22); setRaw(x + 1, TOP + 1, AZ0 + 8, 22);
      setRaw(x, TOP, AZ0 + 12, LOG_X);
    }
    fill(AX1 - 1, TOP, AZ0 + 1, AX1 - 1, TOP + 2, AZ0 + 15, SHELF);
  }
  // 방주 안 동물: 혈육 있는 생물을 암수 한 쌍씩(창 6:19). 가까이 오면 불러오고, 멀어지면 다른 동물처럼 정리된다
  var ARK_PAIRS = [['camel', XM - 13, 0, 0], ['cow', XM + 12, 0, 0], ['horse', XM - 38, 1, 0], ['donkey', XM + 37, 1, 0],
    ['sheep', XM - 13, 0, 1], ['goat', XM + 12, 0, 1], ['rabbit', XM - 38, 1, 1]];
  function arkBeasts(px, pz) {
    if (px < AX0 - 60 || px > AX1 + 60 || pz < AZ0 - 60 || pz > AZ1 + 60) return;
    if (animals.some(function (a) { return a.arkPet; })) return;
    ARK_PAIRS.forEach(function (p) {
      var z = (p[2] ? AZ1 - 9 : AZ0 + 9) + 0.5, y = p[3] ? AY0 + 11 : AY0 + 1;
      [-2, 2].forEach(function (dx) {
        var x = p[1] + dx + 0.5;
        if (!colAt(x | 0, z | 0) || !isSolid(get(x | 0, y - 1, z | 0))) return;
        var a = makeBeast(p[0], x, z);
        a.arkPet = true; a.y = a.ty = y; a.mesh.position.y = y; a.h = p[2] ? 0 : Math.PI;
        animals.push(a);
      });
    });
  }

  var plotData = {};   // 필지 번호 → 그 땅 블록(Uint16Array)
  // 내 땅 밖에서 캔 자리·놓은 것: 기둥별로 기억해 두었다가 그 기둥을 다시 만들 때 덮어씀(이 기기에 저장)
  var EDITS = {}, editTimer = null;
  try { EDITS = JSON.parse(localStorage.getItem('arkVillage.edits') || '{}') || {}; } catch (e) { EDITS = {}; }
  (function () {   // 11/20 세계를 넓히며 기둥 번호가 (z*64+x) → (z*128+x)로 바뀜: 이 기기에 남은 예전 기록을 한 번 옮김
    var v = 0; try { v = +localStorage.getItem('arkVillage.editsNC') || 0; } catch (e) {}
    if (v === NC) return;
    var ON = v || 64, o = {}; for (var k in EDITS) { var kk = +k, ox = kk % ON, oz = Math.floor(kk / ON); o[oz * NC + ox] = EDITS[k]; } EDITS = o;   // 11/25 128 → 256도 같은 방법
    try { localStorage.setItem('arkVillage.edits', JSON.stringify(EDITS)); localStorage.setItem('arkVillage.editsNC', String(NC)); } catch (e) {}
  })();
  function recordEdit(x, y, z, id) {
    if (x < 0 || z < 0 || x >= WS || z >= WS || y < YMIN || y >= SY) return;
    var k = (z >> 5) * NC + (x >> 5), li = (y * CS + (z & 31)) * CS + (x & 31);
    (EDITS[k] || (EDITS[k] = {}))[li] = id;
    clearTimeout(editTimer); editTimer = setTimeout(saveEdits, 1500);
  }
  function saveEdits() { try { localStorage.setItem('arkVillage.edits', JSON.stringify(EDITS)); } catch (e) {} }
  window.addEventListener('pagehide', saveEdits);

