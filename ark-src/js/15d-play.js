  // ───────── 11/21 함께 하는 놀이 여섯(GPT 검토 25·26·28·29·30·31) ─────────
  // 자리는 땅을 만들 때(buildPlaySpots) 들판에 놓고, 놀이 중 바뀌는 것(물길·불·연습 블록 표시)은 내 화면에서만 바꾼다.
  var PLAY = {
    water: { x0: 1194, z0: 1150, x1: 1214, z1: 1160 },    // 수로 시험(개척지 서쪽)
    practice: { x0: 1026, z0: 822, x1: 1037, z1: 832 },   // 함께 짓는 터 남쪽 연습 구획(4×3 벽)
    gallery: { x0: 1008, z0: 822, x1: 1022, z1: 832 },    // 작품 전시 마당
    pen: { x0: 1154, z0: 994, x1: 1171, z1: 1010 },       // 양 우리
    rail: { x0: 1318, z0: 1008, x1: 1356, z1: 1018 }      // 레일 짐 나르기(동쪽 사막)
  };
  function playY(k) { var s = PLAY[k]; if (s.y === undefined) { terrain((s.x0 + s.x1) >> 1, (s.z0 + s.z1) >> 1); s.y = Math.max(G, T.h); } return s.y; }
  function playAt(x, z, m) { for (var k in PLAY) { var s = PLAY[k]; if (x >= s.x0 - m && x <= s.x1 + m && z >= s.z0 - m && z <= s.z1 + m) return k; } return ''; }
  function inPlay(k, x, z) { var s = PLAY[k]; return x >= s.x0 && x <= s.x1 && z >= s.z0 && z <= s.z1; }
  function playNear(x0, z0, k) { var s = PLAY[k]; return s.x1 + 2 >= x0 && s.x0 - 2 < x0 + CS && s.z1 + 2 >= z0 && s.z0 - 2 < z0 + CS; }
  function flatten(k, top) {   // 놀이 자리 바닥을 고르게(위는 비우고 아래는 흙)
    var s = PLAY[k], y = playY(k);
    fill(s.x0, y + 1, s.z0, s.x1, y + 12, s.z1, AIR); fill(s.x0, y - 3, s.z0, s.x1, y - 1, s.z1, DIRT); fill(s.x0, y, s.z0, s.x1, y, s.z1, top || GRASS);
  }
  // 놀이마다 누를 블록 자리
  var WATER_GATE = [1200, 1154], WATER_LEVER = [1208, 1157], WATER_LAMPS = [[1211, 1158], [1212, 1158], [1213, 1158]];
  var PEN_POST = [1162, 1008], GALLERY_POST = [1015, 830], RAIL_A = [1322, 1015], RAIL_B = [1352, 1015];
  var PRACTICE_CELLS = []; (function () { for (var dy = 1; dy <= 3; dy++) for (var x = 1030; x <= 1033; x++) PRACTICE_CELLS.push([x, dy, 826]); })();
  function buildPlaySpots(x0, z0) {
    var y;
    if (playNear(x0, z0, 'water')) {   // 동서로 흐르는 좁은 물길 + 나무 수문 + 물레방아 + 신호 지렛대 + 등 세 개
      flatten('water'); y = playY('water');
      fill(1196, y - 1, 1154, 1213, y, 1154, AIR); fill(1196, y - 2, 1154, 1213, y - 2, 1154, CLAY);
      fill(1196, y - 1, 1154, 1199, y - 1, 1154, WATER); fill(1196, y, 1153, 1213, y, 1153, STONE); fill(1196, y, 1155, 1213, y, 1155, STONE);
      setRaw(WATER_GATE[0], y - 1, WATER_GATE[1], GOPHER); setRaw(WATER_GATE[0], y, WATER_GATE[1], GOPHER);
      setRaw(1205, y, 1156, WATERWHEEL); setRaw(1205, y + 1, 1156, WATERWHEEL);
      setRaw(WATER_LEVER[0], y + 1, WATER_LEVER[1], LOG); setRaw(WATER_LEVER[0], y + 2, WATER_LEVER[1], GOPHER);
      WATER_LAMPS.forEach(function (q) { setRaw(q[0], y + 1, q[1], FENCE); setRaw(q[0], y + 2, q[1], GOPHER); });
      for (var fx = 1203; fx <= 1213; fx++) for (var fz = 1157; fz <= 1159; fz++) if (fz !== 1158 || fx < 1210) setRaw(fx, y, fz, FARM_SOIL);
    }
    if (playNear(x0, z0, 'practice')) {   // 연습 구획: 바닥 석회암 + 네 모서리 울타리
      flatten('practice', PATH); y = playY('practice');
      fill(1029, y, 825, 1034, y, 827, LIME);
      [[1028, 824], [1035, 824], [1028, 828], [1035, 828]].forEach(function (q) { setRaw(q[0], y + 1, q[1], FENCE); setRaw(q[0], y + 2, q[1], LANTERN); });
    }
    if (playNear(x0, z0, 'gallery')) {   // 전시 마당: 받침돌 셋 위에 의자·잔치 상·등잔, 가운데 말뚝(집 구경)
      flatten('gallery', PATH); y = playY('gallery');
      [[1011, CHAIR], [1015, FEAST_TABLE], [1019, OIL_LAMP]].forEach(function (q) { fill(q[0] - 1, y + 1, 825, q[0] + 1, y + 1, 827, LIME); setRaw(q[0], y + 2, 826, q[1]); });
      setRaw(GALLERY_POST[0], y + 1, GALLERY_POST[1], LOG); setRaw(GALLERY_POST[0], y + 2, GALLERY_POST[1], LANTERN);
    }
    if (playNear(x0, z0, 'pen')) {   // 양 우리: 울타리(남쪽 가운데 문 자리 비움) + 목자 말뚝
      flatten('pen'); y = playY('pen');
      for (var px = 1158; px <= 1167; px++) for (var pz = 998; pz <= 1005; pz++) {
        if (px > 1158 && px < 1167 && pz > 998 && pz < 1005) continue;
        if (pz === 1005 && (px === 1162 || px === 1163)) continue;
        setRaw(px, y + 1, pz, FENCE);
      }
      setRaw(PEN_POST[0], y + 1, PEN_POST[1], LOG); setRaw(PEN_POST[0], y + 2, PEN_POST[1], LANTERN);
    }
    if (playNear(x0, z0, 'rail')) {   // 짧은 레일(동서) + 두 정거장 승강장과 짐 상자
      flatten('rail', SAND); y = playY('rail');
      fill(1320, y, 1012, 1354, y, 1012, GOPHER);
      for (var rx = 1320; rx <= 1354; rx++) setRaw(rx, y + 1, 1012, RAIL0 + 1);
      [RAIL_A, RAIL_B].forEach(function (q) { fill(q[0] - 1, y, 1013, q[0] + 2, y, 1016, GOPHER); setRaw(q[0], y + 1, q[1], CHEST); setRaw(q[0] + 2, y + 1, 1016, FENCE); setRaw(q[0] + 2, y + 2, 1016, LANTERN); });
    }
  }
  function playLocal(cells) {   // 내 화면에서만 블록을 바꿈(기록·서버에 안 남음)
    var seen = {};
    cells.forEach(function (c) { setRaw(c[0], c[1], c[2], c[3]); updateSky(c[0], c[2]); var k = (c[0] >> 5) + ',' + (c[1] >> 5) + ',' + (c[2] >> 5); if (!seen[k]) { seen[k] = 1; rebuildAround(c[0], c[1], c[2]); } });
  }
  function mateWith(r) { return nearMates(r).length > 0; }
  function playReward(id, n, what) { if (!isAdm()) { give(id, n); bagChanged(); } toast('🎁 ' + what + ' — ' + nameOf(id) + ' ' + n + '개'); }

  // ① 수로 시험(전 4:9): 수문 열기 + 지렛대 신호를 10초 안에 둘 다 → 밭 끝 등 셋이 차례로 켜짐
  var WATERG = { open: 0, sig: 0, done: 0 };
  function waterReset() {
    var y = playY('water'), c = [[WATER_GATE[0], y - 1, WATER_GATE[1], GOPHER], [WATER_GATE[0], y, WATER_GATE[1], GOPHER]];
    for (var x = 1201; x <= 1213; x++) c.push([x, y - 1, 1154, AIR]);
    WATER_LAMPS.forEach(function (q) { c.push([q[0], y + 2, q[1], GOPHER]); });
    playLocal(c); WATERG = { open: 0, sig: 0, done: 0 };
  }
  function waterTry(which) {
    var now = performance.now(), y = playY('water');
    if (WATERG.done && now < WATERG.done + 60000) { toast('💧 물길이 흐르고 있어요 — 잠시 뒤 다시 할 수 있어요'); return; }
    if (WATERG.done) waterReset();
    if (which === 'gate') {
      WATERG.open = now; var c = [[WATER_GATE[0], y - 1, WATER_GATE[1], AIR], [WATER_GATE[0], y, WATER_GATE[1], AIR]];
      for (var x = WATER_GATE[0]; x <= 1213; x++) c.push([x, y - 1, 1154, WATER]);
      playLocal(c); sfx('place', 'wood'); toast('💧 수문을 열었어요 — 10초 안에 물레방아 옆 지렛대로 신호를 보내요');
      setTimeout(function () { if (!WATERG.done && WATERG.open === now) { waterReset(); toast('💧 신호가 늦었어요 — 수문이 다시 닫혔어요(둘이 나눠 맡으면 쉬워요)'); } }, 10000);
    } else {
      WATERG.sig = now; sfx('click'); toast(WATERG.open ? '📣 신호를 보냈어요' : '📣 신호를 보냈어요 — 10초 안에 수문을 열어요');
      setTimeout(function () { if (!WATERG.done && WATERG.sig === now && !WATERG.open) toast('📣 신호가 사라졌어요 — 다시 해 봐요'); }, 10000);
    }
    if (WATERG.open && WATERG.sig && Math.abs(WATERG.open - WATERG.sig) < 10000) {
      WATERG.done = now;
      WATER_LAMPS.forEach(function (q, i) { setTimeout(function () { playLocal([[q[0], y + 2, q[1], LAMP]]); sparkle(q[0] + 0.5, y + 2.6, q[1] + 0.5, 0xffe27a, 10, { size: 0.35, life: 0.8, up: 1, v: 1.2 }); sfx('pop'); }, 500 + i * 600); });
      var mate = mateWith(12);
      setTimeout(function () {
        showVerseCard('💧', mate ? '함께 물길을 열었어요' : '물길이 흘러요', '두 사람이 한 사람보다 나음은 그들이 수고함으로 좋은 상을 얻을 것임이라', '전도서 4:9', mate ? '친구와 수문·신호를 나눠 맡아 밭에 물을 댔어요' : '혼자서도 해냈어요 — 친구와 나눠 맡으면 더 쉬워요');
        playReward(SEED, mate ? 6 : 3, '수로 시험');
      }, 2300);
      setTimeout(waterReset, 60000);
    }
  }

  // ② 연습 구획(느 2:18): 석회암 바닥 위 4×3 벽 자리(빛나는 칸)를 아무 블록으로 다 채우면 완성 → 블록은 가방으로 돌려줌
  var practiceGhost = null, practiceDone = 0;
  function practiceTick() {   // 1초마다: 가까우면 남은 칸을 보여 줌
    var near = Math.abs(P.x - 1031) < 16 && Math.abs(P.z - 826) < 16, y = playY('practice');
    if (!practiceGhost && near && scene) {
      practiceGhost = new THREE.Group(); var mat = new THREE.MeshBasicMaterial({ color: 0x9be2b3, transparent: true, opacity: 0.28, depthWrite: false });
      PRACTICE_CELLS.forEach(function (c) { var m = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.98, 0.98), mat); m.position.set(c[0] + 0.5, y + c[1] + 0.5, c[2] + 0.5); practiceGhost.add(m); });
      scene.add(practiceGhost);
    }
    if (!practiceGhost) return;
    practiceGhost.visible = near;
    if (!near) return;
    var filled = 0;
    PRACTICE_CELLS.forEach(function (c, i) { var id = get(c[0], y + c[1], c[2]), on = id !== AIR && isSolid(id); practiceGhost.children[i].visible = !on; if (on) filled++; });
    if (filled === PRACTICE_CELLS.length && performance.now() > practiceDone + 5000) {
      practiceDone = performance.now();
      var back = {};
      PRACTICE_CELLS.forEach(function (c) { var id = get(c[0], y + c[1], c[2]); back[id] = (back[id] || 0) + 1; setBlock(c[0], y + c[1], c[2], AIR); });
      if (!isAdm()) { for (var k in back) give(+k, back[k]); bagChanged(); }
      burst(1031, y + 2, 826, LAMP); sfx('craft');
      showVerseCard('🧱', '벽 하나를 세웠어요', '또 그들에게 하나님의 선한 손이 나를 도우신 일과 왕이 내게 이른 말씀을 전하였더니 그들의 말이 일어나 건축하자 하고 모두 힘을 내어 이 선한 일을 하려 하매', '느헤미야 2:18', '연습 끝 — 놓은 블록은 가방으로 돌려받았어요. 이제 북쪽 「함께 짓는 터」에서 함께 지어요');
    } else if (filled && filled < PRACTICE_CELLS.length && !S.practiceTold) { S.practiceTold = 1; saveSettings(); toast('🧱 연습 구획 — 빛나는 칸 12개를 아무 블록으로 채우면 완성(블록은 돌려받아요)'); }
  }

  // ③ 양 몰고 오기(눅 15:6): 목자 말뚝을 누르면 양 두 마리가 우리 밖 멀리 나타남 → 밀이나 지팡이를 들고 우리 안으로 2분 안에
  var PEN = null;
  function penStart() {
    if (PEN && performance.now() < PEN.until) { toast('🐑 양 ' + PEN.sheep.length + '마리를 우리 안으로 데려와요 — 밀이나 지팡이를 들면 따라와요'); return; }
    var y = playY('pen'), list = [];
    [[1150, 1018], [1176, 1020]].forEach(function (q) { var a = makeBeast('sheep', q[0] + Math.random() * 3, q[1] + Math.random() * 3); a.herd = true; animals.push(a); list.push(a); });
    PEN = { sheep: list, until: performance.now() + 120000 };
    toast('🐑 우리 밖 남쪽에 양 두 마리가 있어요 — 밀이나 지팡이를 들고 2분 안에 우리 안으로 데려와요');
  }
  function penTick() {
    if (!PEN) return;
    var inside = PEN.sheep.filter(function (a) { return a.x > 1159 && a.x < 1167 && a.z > 999 && a.z < 1005; }).length;
    if (inside >= PEN.sheep.length) {
      var mate = mateWith(16); PEN = null;
      showVerseCard('🐑', '양을 찾아 데려왔어요', '집에 와서 그 벗과 이웃을 불러 모으고 말하되 나와 함께 즐기자 나의 잃은 양을 찾아내었노라 하리라', '누가복음 15:6', mate ? '친구와 함께 양 두 마리를 우리로 데려왔어요' : '양 두 마리를 우리로 데려왔어요');
      playReward(WOOL, mate ? 4 : 2, '양 몰고 오기');
    } else if (performance.now() > PEN.until) {
      toast('🐑 시간이 지났어요 — 목자 말뚝을 눌러 다시 해 봐요');
      PEN.sheep.forEach(function (a) { a.herd = false; }); PEN = null;
    }
  }

  // ④ 레일 짐 나르기(갈 6:2): 서쪽 정거장 짐 상자에서 짐 3개를 싣고 → 동쪽 정거장 상자에 내려놓기(수레·걸음 모두 됨)
  var CARGO = null;
  function cargoTap(st) {
    var now = performance.now();
    if (st === 'A') {
      if (CARGO) { toast('📦 짐을 이미 실었어요 — 동쪽 정거장 상자로 가져가요'); return; }
      CARGO = { t: now }; toast('📦 짐 3개를 실었어요 — 레일을 따라 동쪽 정거장(30칸) 상자에 내려놓아요' + (have(CART) ? '' : ' (수레가 없으면 걸어가도 돼요)')); sfx('place', 'wood'); return;
    }
    if (!CARGO) { toast('📦 서쪽 정거장 상자에서 짐을 먼저 실어요'); return; }
    var sec = Math.round((now - CARGO.t) / 1000), mate = mateWith(14); CARGO = null;
    sfx('craft');
    showVerseCard('📦', '짐을 날랐어요', '너희가 짐을 서로 지라 그리하여 그리스도의 법을 성취하라', '갈라디아서 6:2', '짐 3개를 ' + sec + '초 만에 날랐어요' + (mate ? ' — 친구와 함께!' : ''));
    playReward(BREAD, mate ? 3 : 2, '레일 짐 나르기');
  }

  // ⑤ 작품 전시 마당: 받침돌 위 가구 + 말뚝을 누르면 「집 구경」(친구들이 지은 집 보기)
  // ⑥ 동굴 길 표식은 모이기 표식(15c)에 「돌아가는 길·물가」 두 가지로 더함(10분)

  function playLabel(h) {
    var x = h.x, z = h.z;
    if (x === WATER_GATE[0] && z === WATER_GATE[1]) return '수문 열기';
    if (x === WATER_LEVER[0] && z === WATER_LEVER[1]) return '신호 보내기';
    if (x === PEN_POST[0] && z === PEN_POST[1]) return '양 몰고 오기';
    if (x === GALLERY_POST[0] && z === GALLERY_POST[1]) return '집 구경 보기';
    if (x === RAIL_A[0] && z === RAIL_A[1] && get(x, h.y, z) === CHEST) return '짐 싣기';
    if (x === RAIL_B[0] && z === RAIL_B[1] && get(x, h.y, z) === CHEST) return '짐 내려놓기';
    return '';
  }
  function tryPlaySpot(h) {
    var l = playLabel(h); if (!l) return false;
    if (l === '수문 열기') waterTry('gate'); else if (l === '신호 보내기') waterTry('sig');
    else if (l === '양 몰고 오기') penStart(); else if (l === '집 구경 보기') openVillageWork('showcase');
    else if (l === '짐 싣기') cargoTap('A'); else if (l === '짐 내려놓기') cargoTap('B');
    return true;
  }
  function playTick() { practiceTick(); penTick(); }
