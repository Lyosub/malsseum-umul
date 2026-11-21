  // ───────── 11/21 놀이 셋: 낚시 타이밍 · 이번 주 보물찾기 · 달리기 경주 ─────────
  // 셋 다 내 화면과 내 기록(villageBook)만 쓴다. 서버 함수·새 물건 번호 없음.

  // ① 낚시: 찌가 쑥 들어가면 막대가 나오고, 움직이는 표시가 초록 칸에 왔을 때 누르면 낚는다.
  //    물고기 종류·크기를 적어 두고(퀘스트 → 놀이), 비늘 없는 메기는 놓아 준다(레 11:9-10).
  var FISH_KINDS = {
    '호수': [['틸라피아', 15, 42, 5, 0], ['정어리', 8, 16, 5, 0], ['잉어', 28, 62, 2, 1], ['메기', 30, 80, 1.4, 1, 'noscale'], ['큰 틸라피아', 43, 58, 0.5, 2]],
    '강': [['잉어', 25, 60, 4, 0], ['틸라피아', 14, 36, 4, 0], ['메기', 30, 90, 1.6, 1, 'noscale'], ['큰 잉어', 61, 85, 0.5, 2]],
    '바다': [['정어리', 9, 20, 5, 0], ['숭어', 25, 55, 4, 0], ['도미', 22, 48, 2, 1], ['큰 숭어', 56, 78, 0.5, 2]],
    '': [['작은 물고기', 6, 14, 1, 0]]
  };
  var fishFun = null, fishBarEl = null, FISH_ZONE = [0.34, 0.26, 0.17];
  function fishBook() { return villageBook.fishBook || (villageBook.fishBook = {}); }
  function fishTotal() { var b = fishBook(), n = 0; for (var k in b) n += b[k].n; return n; }
  function fishBar() {
    if (fishBarEl) return fishBarEl;
    var d = document.createElement('div'); d.id = 'fishBar';
    d.style.cssText = 'position:fixed;left:50%;top:38%;transform:translateX(-50%);width:min(280px,72vw);height:22px;background:rgba(0,0,0,.6);border:2px solid #fff;border-radius:12px;z-index:30;display:none;overflow:hidden;pointer-events:none';
    d.innerHTML = '<i style="position:absolute;top:0;bottom:0;background:#49c16b"></i><i style="position:absolute;top:0;bottom:0;background:#ffe27a;opacity:.9"></i><b style="position:absolute;top:-2px;bottom:-2px;width:6px;margin-left:-3px;background:#fff;border-radius:3px;box-shadow:0 0 4px #000"></b>';
    document.body.appendChild(d); fishBarEl = d; return d;
  }
  function fishEnd(msg) {
    var f = fishFun; fishFun = null; if (!f) return;
    if (f.bob) { scene.remove(f.bob); f.bob.geometry.dispose(); f.bob.material.dispose(); }
    if (fishBarEl) fishBarEl.style.display = 'none';
    if (msg) toast(msg);
  }
  function fishPick(region) {
    var list = FISH_KINDS[region || ''] || FISH_KINDS[''], sum = 0, i;
    for (i = 0; i < list.length; i++) sum += list[i][3];
    var r = Math.random() * sum;
    for (i = 0; i < list.length; i++) { r -= list[i][3]; if (r <= 0) return list[i]; }
    return list[0];
  }
  function fishLoop() {
    var f = fishFun; if (!f) return;
    var now = performance.now();
    if (ui !== 'play' || HOTBAR[sel] !== f.item || Math.hypot(P.x - f.x, P.z - f.z) > 5) return fishEnd('낚싯줄을 거뒀어요');
    if (f.phase === 'wait') {
      f.bob.position.y = f.wy + 0.06 + Math.sin(now / 420) * 0.03;
      if (now >= f.tBite) {
        f.phase = 'reel'; f.t0 = now; f.kind = fishPick(f.region);
        var w = FISH_ZONE[f.kind[4]] * (f.item === FISH_NET ? 1.3 : 1);
        f.zw = w; f.zc = 0.2 + Math.random() * 0.6; f.speed = 3.2 + f.kind[4] * 1.1 + Math.random() * 0.8;
        var bar = fishBar(), k = bar.children;
        k[0].style.left = (Math.max(0, f.zc - w / 2) * 100) + '%'; k[0].style.width = (Math.min(1, f.zc + w / 2) - Math.max(0, f.zc - w / 2)) * 100 + '%';
        k[1].style.left = ((f.zc - w * 0.12) * 100) + '%'; k[1].style.width = (w * 0.24 * 100) + '%';
        bar.style.display = 'block'; sfx('pop'); vibrate('break'); toast('❗ 물었어요! 표시가 초록 칸에 올 때 눌러요');
      }
    } else {
      var t = (now - f.t0) / 1000;
      f.pos = 0.5 - 0.5 * Math.cos(t * f.speed);
      fishBarEl.children[2].style.left = (f.pos * 100) + '%';
      f.bob.position.y = f.wy - 0.1 + Math.sin(now / 60) * 0.03;
      if (t > 4.2) return fishEnd('물고기가 달아났어요. 다시 던져 봐요');
    }
    requestAnimationFrame(fishLoop);
  }
  function fishCatch(f) {
    var k = f.kind, off = Math.abs(f.pos - f.zc), perfect = off <= f.zw * 0.12;
    if (off > f.zw / 2) return fishEnd('아깝다, 놓쳤어요! 초록 칸에서 눌러요');
    var lo = k[1], hi = k[2], size = Math.round(perfect ? lo + (hi - lo) * (0.7 + Math.random() * 0.3) : lo + (hi - lo) * Math.random() * 0.8);
    var book = fishBook(), rec = book[k[0]] || (book[k[0]] = { n: 0, max: 0 }), best = size > rec.max, first = rec.n === 0, before = fishTotal();
    rec.n++; if (best) rec.max = size;
    var region = f.region, item = f.item; fishEnd();
    if (k[5] === 'noscale') { saveVillageBook(); sfx('dig'); return toast('🐟 ' + k[0] + ' ' + size + 'cm! 비늘이 없는 물고기라 놓아 줬어요 (레 11:9-10)'); }
    var caught = VILLAGE_FISH[region] || RAW_FISH, count = (item === FISH_NET ? 2 : 1) + (perfect ? 1 : 0);
    count = Math.min(count, room(caught)); if (count <= 0) { saveVillageBook(); return bagFull(); }
    give(caught, count); recordVillageFish(region, count); saveVillageBook(); bagChanged(); sfx('craft');
    var msg = '🐟 ' + k[0] + ' ' + size + 'cm' + (perfect ? ' — 딱 맞았어요! 한 마리 더' : '') + (first ? ' · 처음 낚은 물고기' : (best ? ' · 새 기록!' : ''));
    if (region === '호수' && Math.random() < 0.02 && !isAdm() && give(ING_AG, 1)) { bagChanged(); msg = '🪙 ' + k[0] + ' 입에서 은이 나왔어요! (마 17:27)'; }
    if (before < 153 && fishTotal() >= 153) msg = '🎣 지금까지 백쉰세 마리를 낚았어요! (요 21:11)';
    toast(msg);
  }
  function fishTap(item, dir) {
    if (!have(item)) return;
    var f = fishFun;
    if (f && f.item === item) {
      if (f.phase === 'wait') return deny('찌가 쑥 들어갈 때까지 기다려요');
      return fishCatch(f);
    }
    if (f) fishEnd();
    var origin = camera.position, hit = null;
    for (var t = .25; t <= REACH + camDist + .5; t += .25) {
      var x = origin.x + dir.x * t, y = origin.y + dir.y * t, z = origin.z + dir.z * t, id = get(Math.floor(x), Math.floor(y), Math.floor(z));
      if (id === WATER && t < 1.5) continue;   // 발밑 물은 지나쳐 조금 앞에 찌를 띄움
      if (id === WATER && Math.hypot(x - P.x, y - (P.y + EYE), z - P.z) <= REACH + .5) { hit = [x, Math.floor(y) + 0.9, z]; break; }
      if (isSolid(id)) break;
    }
    if (!hit) return deny('가까운 물을 겨누고 눌러요');
    var bob = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), new THREE.MeshBasicMaterial({ color: 0xe8483a }));
    bob.position.set(hit[0], hit[1], hit[2]); scene.add(bob);
    fishFun = { item: item, x: P.x, z: P.z, wy: hit[1], region: villageWaterRegion(hit[0], hit[2]), phase: 'wait', tBite: performance.now() + 1600 + Math.random() * 3600, bob: bob };
    toast(item === FISH_NET ? '그물을 던졌어요. 찌를 잘 봐요' : '낚싯줄을 던졌어요. 찌를 잘 봐요'); sfx('dig');
    requestAnimationFrame(fishLoop);
  }

  // ② 이번 주 보물찾기(마 13:44): 월요일(한국 시간)마다 자리가 바뀐다. 실마리는 두 곳에서 잰 거리.
  //    가까이 가면 알려 주고, 선물 상자에 닿으면 받는다. 한 주에 한 번.
  var TRE = null, treSprite = null, treTold = 0;
  var TRE_GIFTS = [[[ING_AU, 2], [LANTERN, 2]], [[GEM_ONYX, 2], [ARROW, 16]], [[ING_FE, 5], [BREAD, 4]], [[GEM_SAPH, 1], [ING_AG, 3]], [[ING_AU, 1], [ING_CU, 6], [SHARD, 2]]];
  function kstWeek() { return Math.floor((Date.now() + 9 * 3600e3 - 4 * 86400e3) / (7 * 86400e3)); }   // 1970-01-05(월) 기준 주 번호
  function funAt(x, z, m) { return (Math.abs(x - RACE_PTS[0][0]) <= m && Math.abs(z - RACE_PTS[0][1]) <= m) || (x >= LAMP_X - 1 - m && x <= LAMP_X + 5 + m && z >= LAMP_Z - 1 - m && z <= LAMP_Z + 5 + m); }
  function treasureSpot() {
    var w = kstWeek(); if (TRE && TRE.w === w) return TRE;
    var R = mkRand(w * 7919 + 13), cx = XM, cz = PZ0 + 110, spot = null;
    for (var i = 0; i < 400 && !spot; i++) {
      var a = R() * Math.PI * 2, d = 150 + R() * 300, x = Math.floor(cx + Math.cos(a) * d), z = Math.floor(cz + Math.sin(a) * d);
      if (z < SEA_Z + 30 || inTown(x, z) || plotAt(x, z) >= 0 || inCommons(x, z) || landmarkAt(x, z, 8) || playAt(x, z, 10) || funAt(x, z, 60) || cityInside(x, z)) continue;
      if (villageWaterRegion(x, z) || lakeE(x, z) < 1.6) continue;
      terrain(x, z); if (T.wtop >= 0 || T.h < G || T.h > G + 26 || T.reg === 'frontier') continue;
      spot = { w: w, x: x, z: z, y: T.h };
    }
    if (!spot) spot = { w: w, x: XM + 180, z: PZ0 + 60, y: G };
    spot.gift = TRE_GIFTS[w % TRE_GIFTS.length];
    spot.dA = Math.round(Math.hypot(spot.x - XM, spot.z - (AZ0 + 25))); spot.dL = Math.round(Math.hypot(spot.x - LX, spot.z - LZ));
    spot.side = spot.x >= XM ? '동쪽' : '서쪽';
    return (TRE = spot);
  }
  function treasureFound() { return villageBook.treasureWeek === kstWeek(); }
  function treasureClue() {
    var s = treasureSpot();
    return '방주 한가운데(X ' + XM + ' · Z ' + (AZ0 + 25) + ')에서 ' + s.dA + '칸, 남쪽 호수 한가운데(X ' + LX + ' · Z ' + LZ + ')에서 ' + s.dL + '칸 떨어진 곳이에요. 방주보다 ' + s.side + '에 있어요.';
  }
  function treasureTick() {
    if (treasureFound()) { if (treSprite) { disposeSprite(treSprite); treSprite = null; } return; }
    var s = treasureSpot(), d = Math.hypot(P.x - s.x - 0.5, P.z - s.z - 0.5);
    if (d < 34 && !treSprite) { treSprite = textSprite('🎁', 'rgba(0,0,0,0)', '#fff', 1.1); treSprite.position.set(s.x + 0.5, s.y + 2.1, s.z + 0.5); scene.add(treSprite); }
    if (d >= 46 && treSprite) { disposeSprite(treSprite); treSprite = null; }
    if (treSprite) treSprite.position.y = s.y + 2.1 + Math.sin(performance.now() / 500) * 0.15;
    var stage = d < 10 ? 2 : (d < 40 ? 1 : 0);
    if (stage > treTold) toast(stage === 2 ? '🗺 보물이 바로 근처예요! 둘레를 살펴봐요' : '🗺 이번 주 보물이 가까워요(40칸 안)');
    treTold = stage;
    if (d < 2.4 && Math.abs(P.y - s.y) < 6) {
      villageBook.treasureWeek = s.w; villageBook.treasureCount = (villageBook.treasureCount || 0) + 1; saveVillageBook();
      if (!isAdm()) { s.gift.forEach(function (r) { give(r[0], r[1]); }); bagChanged(); }
      var gift = s.gift.map(function (r) { return B[r[0]][0] + ' ' + r[1]; }).join(', ');
      disposeSprite(treSprite); treSprite = null; sfx('craft'); vibrate('break');
      showVerseCard('🎁', '밭에 감추인 보화', '천국은 마치 밭에 감추인 보화와 같으니 사람이 이를 발견한 후 숨겨 두고 기뻐하며 돌아가서 자기의 소유를 다 팔아 그 밭을 사느니라', '마태복음 13:44', '이번 주 보물을 찾았어요 — ' + gift + ' · 다음 보물은 월요일에 새로 숨겨져요');
    }
  }

  // ③ 달리기 경주(고전 9:24): 동쪽 들판 출발 기둥을 누르면 시작. 깃발 여섯을 차례로 지나 돌아오면 끝.
  var RACE_PTS = [[1180, 1040], [1228, 1048], [1256, 1082], [1238, 1118], [1192, 1126], [1160, 1090]];
  var RACE = null, raceHud = null, raceFlag = null;
  function raceLen() { var n = 0; for (var i = 0; i < RACE_PTS.length; i++) { var a = RACE_PTS[i], b = RACE_PTS[(i + 1) % RACE_PTS.length]; n += Math.hypot(a[0] - b[0], a[1] - b[1]); } return n; }
  function racePar() { return raceLen() / 9.75; }   // 쉬지 않고 뛰었을 때 걸리는 시간(초)
  function raceMedal(t) { var p = racePar(); return t <= p * 1.3 ? '🥇' : (t <= p * 1.7 ? '🥈' : '🥉'); }
  function raceY(i) { var p = RACE_PTS[i]; terrain(p[0], p[1]); return Math.max(G, T.h); }
  function buildFunSpots(x0, z0) {   // 출발 기둥(울타리 + 등) + 등불 잡기 돌기둥
    buildLampPad(x0, z0);
    var p = RACE_PTS[0]; if (p[0] < x0 || p[0] >= x0 + CS || p[1] < z0 || p[1] >= z0 + CS) return;
    var y = raceY(0); setRaw(p[0], y + 1, p[1], FENCE); setRaw(p[0], y + 2, p[1], LANTERN);
  }
  function raceTime(t) { return Math.floor(t / 60) + ':' + ('0' + (t % 60).toFixed(1)).slice(-4); }
  function raceShow(txt) {
    if (!raceHud) { raceHud = document.createElement('div'); raceHud.style.cssText = 'position:fixed;left:50%;top:34%;transform:translateX(-50%);background:rgba(0,0,0,.6);color:#fff;font-weight:700;padding:5px 14px;border-radius:14px;z-index:30;font-size:15px;pointer-events:none;white-space:nowrap'; document.body.appendChild(raceHud); }
    raceHud.style.display = txt ? 'block' : 'none'; raceHud.textContent = txt || '';
  }
  function raceNext() {
    var i = RACE.i % RACE_PTS.length, p = RACE_PTS[i], y = raceY(i);
    if (raceFlag) disposeSprite(raceFlag);
    raceFlag = textSprite(RACE.i === RACE_PTS.length ? '🏁 도착' : '🚩 ' + RACE.i, 'rgba(0,0,0,.45)', '#ffe27a', 1.3); raceFlag.position.set(p[0] + 0.5, y + 4.2, p[1] + 0.5); raceFlag.renderOrder = 19; raceFlag.material.depthTest = false; scene.add(raceFlag);
    forestRoute = [[p[0] + 0.5, p[1] + 0.5]]; forestDestination = forestRoute[0]; forestName = RACE.i === RACE_PTS.length ? '도착' : '깃발 ' + RACE.i; renderForestRoute();
  }
  function raceStop(msg) {
    RACE = null; raceShow(''); if (raceFlag) { disposeSprite(raceFlag); raceFlag = null; }
    if (forestRoute) cancelForestRoute(); if (msg) toast(msg);
  }
  function raceStart() {
    if (riding || cartRide || boatRide) return deny('달리기는 두 발로 해요. 내려서 다시 눌러요');
    if (P.fly) return deny('날지 않고 달려야 해요');
    if (RACE) return raceStop('경주를 그만뒀어요');
    RACE = { i: 1, t0: performance.now() }; raceNext(); sfx('pop'); vibrate('break');
    toast('🏃 출발! 깃발 다섯을 차례로 지나 돌아와요. 달리기 단추를 써요');
    requestAnimationFrame(raceLoop);
  }
  function raceLoop() {
    if (!RACE) return;
    var t = (performance.now() - RACE.t0) / 1000;
    if (ui === 'play') {
      if (riding || cartRide || boatRide || P.fly) return raceStop('타거나 날면 경주가 끝나요');
      if (t > 420) return raceStop('시간이 너무 지나 경주를 끝냈어요');
      var p = RACE_PTS[RACE.i % RACE_PTS.length];
      raceShow('🏃 ' + raceTime(t) + ' · ' + (RACE.i === RACE_PTS.length ? '도착 지점으로' : '깃발 ' + RACE.i + '/' + (RACE_PTS.length - 1)));
      if (Math.hypot(P.x - p[0] - 0.5, P.z - p[1] - 0.5) < 6.5) {
        if (RACE.i === RACE_PTS.length) return raceFinish(t);
        RACE.i++; sfx('pop'); raceNext();
      }
    }
    requestAnimationFrame(raceLoop);
  }
  function raceFinish(t) {
    var r = villageBook.race || (villageBook.race = { best: 0, runs: 0, day: '' }), best = !r.best || t < r.best, day = kstDay(), firstToday = r.day !== day;
    r.runs++; if (best) r.best = Math.round(t * 10) / 10; r.day = day; saveVillageBook();
    raceStop(); sfx('craft'); vibrate('break');
    var medal = raceMedal(t), note = medal + ' ' + raceTime(t) + (best ? ' · 내 최고 기록!' : ' · 내 최고 ' + raceTime(r.best));
    if (firstToday && !isAdm()) { give(BREAD, 2); bagChanged(); note += ' · 오늘 첫 완주 빵 2개'; }
    if (r.runs === 1) showVerseCard('🏃', '상을 받도록 달음질하라', '운동장에서 달음질하는 자들이 다 달릴지라도 오직 상을 받는 사람은 한 사람인 줄을 너희가 알지 못하느냐 너희도 상을 받도록 이와 같이 달음질하라', '고린도전서 9:24', '달리기 경주 완주 — ' + note);
    else toast('🏁 완주! ' + note);
  }
  function funLabel(h) { var p = RACE_PTS[0]; if (lampCell(h.x, h.z) >= 0 && h.y > lampY()) return '등불 잡기'; return h.x === p[0] && h.z === p[1] && (get(h.x, h.y, h.z) === FENCE || get(h.x, h.y, h.z) === LANTERN) ? (RACE ? '경주 그만두기' : '달리기 경주') : ''; }
  function tryFunSpot(h) { var l = funLabel(h); if (!l) return false; if (l === '등불 잡기') lampTap(lampCell(h.x, h.z)); else raceStart(); return true; }
  function funTick() { treasureTick(); }
  // 퀘스트 창 「놀이」 탭
  function renderFunTab(row, body) {
    var s = treasureSpot(), right = document.createElement('b'); right.style.color = '#8be08b'; right.textContent = treasureFound() ? '✔ 찾음' : '';
    row('🗺 이번 주 보물찾기', treasureFound() ? '이번 주 보물을 찾았어요. 월요일에 새 보물이 숨겨져요. 지금까지 ' + (villageBook.treasureCount || 0) + '번 찾음' : treasureClue() + ' 40칸 안에 들어가면 알려 줘요.', right);
    var r = villageBook.race || {}, rr = document.createElement('span');
    fbBtn(rr, '길 안내', function () { $('fbBox').remove(); guideTo([RACE_PTS[0][0] + 0.5, RACE_PTS[0][1] + 0.5], '달리기 출발 기둥'); });
    row('🏃 달리기 경주', '동쪽 들판 출발 기둥(등 달린 울타리)을 누르면 시작해요. ' + (r.best ? '내 최고 ' + raceTime(r.best) + ' ' + raceMedal(r.best) + ' · ' + r.runs + '번 완주' : '아직 기록이 없어요') + ' · 금 ' + raceTime(Math.floor(racePar() * 1.3)) + ' 안, 은 ' + raceTime(Math.floor(racePar() * 1.7)) + ' 안', rr);
    var b = fishBook(), names = Object.keys(b), total = fishTotal();
    renderFunTab2(row);
    row('🎣 낚시 기록 — 모두 ' + total + '마리', names.length ? names.map(function (k) { return k + ' ' + b[k].n + '마리(가장 큰 것 ' + b[k].max + 'cm)'; }).join(' · ') : '낚싯대를 들고 물을 눌러요. 찌가 들어가면 초록 칸에서 한 번 더! 호수·강·바다마다 물고기가 달라요', null);
  }

  // ───────── 11/21 놀이 넷 더: 폭죽 · 등불 잡기 · 숨바꼭질 · 성탄 절기 선물 ─────────
  // ④ 폭죽(갈대 1 + 숯 1 → 3개): 들고 누르면 앞쪽 하늘에서 터진다. 함께 있는 사람 화면에도 보인다.
  var FW_COLORS = [0xff5a5a, 0xffd84a, 0x6ad1ff, 0x9dff7a, 0xff8ad8, 0xffffff];
  function funCast(m) { if (NET.ch && me && NET.ok) { m.u = me.id; try { NET.ch.send({ type: 'broadcast', event: 'fun', payload: m }); } catch (e) {} } }
  function fireworkShow(x, y, z, ci) {
    if (!scene) return;
    var c = FW_COLORS[ci % FW_COLORS.length], c2 = FW_COLORS[(ci + 2) % FW_COLORS.length];
    sparkle(x, y - 9, z, 0xfff0c0, 6, { spread: 0.3, v: 0.6, up: 9, g: 2, life: 0.6, size: 0.3, through: true });
    setTimeout(function () {
      sparkle(x, y, z, c, 46, { spread: 0.8, v: 11, up: -4, g: 5, life: 1.7, size: 0.6, through: true });
      sparkle(x, y, z, c2, 24, { spread: 0.5, v: 6, up: -2, g: 4, life: 1.3, size: 0.45, through: true });
      sfx('pop'); vibrate('break');
    }, 550);
  }
  function fireworkUse() {
    var now = performance.now(); if (fireworkUse.t && now - fireworkUse.t < 900) return; fireworkUse.t = now;
    if (!isAdm()) { take(FIREWORK, 1); bagChanged(); }
    var x = P.x - Math.sin(P.yaw) * 7, z = P.z - Math.cos(P.yaw) * 7, y = P.y + 17, ci = Math.floor(Math.random() * FW_COLORS.length);
    fireworkShow(x, y, z, ci); funCast({ k: 'fw', x: +x.toFixed(1), y: +y.toFixed(1), z: +z.toFixed(1), c: ci });
    newsMark('fun4');
  }

  // ⑤ 등불 잡기: 달리기 출발 기둥 옆 돌기둥 아홉. 누르면 30초 동안 켜지는 등불을 따라 누른다.
  var LAMP_X = 1170, LAMP_Z = 1044, LAMPG = null, lampT = null;
  function lampY() { terrain(LAMP_X + 2, LAMP_Z + 2); return Math.max(G, T.h); }
  function lampCell(x, z) { var i = (x - LAMP_X) / 2, j = (z - LAMP_Z) / 2; return i >= 0 && i <= 2 && j >= 0 && j <= 2 && i === Math.floor(i) && j === Math.floor(j) ? j * 3 + i : -1; }
  function lampPos(c) { return [LAMP_X + (c % 3) * 2, LAMP_Z + Math.floor(c / 3) * 2]; }
  function funProtect(x, z) { return (x >= LAMP_X - 1 && x <= LAMP_X + 5 && z >= LAMP_Z - 1 && z <= LAMP_Z + 5) || (x === RACE_PTS[0][0] && z === RACE_PTS[0][1]); }
  function buildLampPad(x0, z0) {
    if (LAMP_X + 5 < x0 || LAMP_X - 1 >= x0 + CS || LAMP_Z + 5 < z0 || LAMP_Z - 1 >= z0 + CS) return;
    var y = lampY();
    fill(LAMP_X - 1, y + 1, LAMP_Z - 1, LAMP_X + 5, y + 8, LAMP_Z + 5, AIR); fill(LAMP_X - 1, y - 3, LAMP_Z - 1, LAMP_X + 5, y - 1, LAMP_Z + 5, DIRT); fill(LAMP_X - 1, y, LAMP_Z - 1, LAMP_X + 5, y, LAMP_Z + 5, STONE);
    for (var c = 0; c < 9; c++) { var p = lampPos(c); if (p[0] >= x0 && p[0] < x0 + CS && p[1] >= z0 && p[1] < z0 + CS) setRaw(p[0], y + 1, p[1], STONE); }
  }
  function lampLight(c) {
    var y = lampY(), cells = [];
    if (LAMPG.lit >= 0) { var o = lampPos(LAMPG.lit); cells.push([o[0], y + 2, o[1], AIR]); }
    if (c >= 0) { var p = lampPos(c); cells.push([p[0], y + 2, p[1], LANTERN]); }
    LAMPG.lit = c; if (cells.length) playLocal(cells);
  }
  function lampNext() { var c; do { c = Math.floor(Math.random() * 9); } while (c === LAMPG.lit); lampLight(c); }
  function lampEnd() {
    clearInterval(lampT); var g = LAMPG; if (!g) return; lampLight(-1); LAMPG = null; raceShow('');
    var r = villageBook.lamp || (villageBook.lamp = { best: 0, day: '' }), best = g.n > r.best, day = kstDay(), note = '';
    if (best) r.best = g.n;
    if (g.n >= 8 && r.day !== day && !isAdm()) { r.day = day; give(FIREWORK, 2); bagChanged(); note = ' · 오늘 첫 8개 넘기 폭죽 2개'; }
    saveVillageBook(); sfx('craft');
    toast('🏮 등불 ' + g.n + '개!' + (best ? ' 내 최고 기록' : ' (내 최고 ' + r.best + '개)') + note);
  }
  function lampTap(c) {
    if (!LAMPG) {
      LAMPG = { n: 0, lit: -1, end: performance.now() + 30000 }; lampNext(); sfx('pop'); toast('🏮 30초! 켜지는 등불을 따라 눌러요');
      clearInterval(lampT); lampT = setInterval(function () {
        if (!LAMPG) return clearInterval(lampT);
        var left = LAMPG.end - performance.now();
        if (left <= 0 || Math.hypot(P.x - LAMP_X - 2, P.z - LAMP_Z - 2) > 14) return lampEnd();
        raceShow('🏮 ' + LAMPG.n + '개 · ' + Math.ceil(left / 1000) + '초');
      }, 200);
      return;
    }
    if (c === LAMPG.lit) { LAMPG.n++; sfx('pop'); vibrate('break'); lampNext(); }
  }

  // ⑥ 숨바꼭질: 「놀이」 탭에서 시작한 사람이 술래. 60칸 안에 함께 있는 사람이 숨는다(30초), 술래는 2분 30초 동안 찾는다.
  //    술래 화면에서는 이름표와 지도 점이 가려진다. 가까이(7칸) 가서 사람을 누르면 「찾았다」.
  var HS = null, hsT = null, hsShade = null, HS_HIDE = 30000, HS_SEEK = 150000;
  function hsBlind() { return !!HS && HS.role === 'seek'; }
  function hsName(u) { return (NET.names && NET.names[u]) || '나그네'; }
  function hsShadeShow(txt) {
    if (!hsShade) { hsShade = document.createElement('div'); hsShade.style.cssText = 'position:fixed;inset:0;background:#0b0f1e;color:#fff;z-index:29;display:none;align-items:center;justify-content:center;font-size:26px;font-weight:800;text-align:center;pointer-events:none'; document.body.appendChild(hsShade); }
    hsShade.style.display = txt ? 'flex' : 'none'; hsShade.textContent = txt || '';
  }
  function hsTags() { var blind = hsBlind(); for (var u in NET.peers) { var p = NET.peers[u]; if (p && p.tag) p.tag.visible = !blind; } }
  function hsStop(msg) { clearInterval(hsT); HS = null; hsShadeShow(''); raceShow(''); hsTags(); if (msg) toast(msg); }
  function hsStart() {
    if (HS) return toast('숨바꼭질을 이미 하고 있어요');
    if (!NET.ch || !me || !NET.ok) return toast('숨바꼭질은 로그인하고 함께 놀 때 할 수 있어요');
    var near = 0; for (var u in NET.peers) { var p = NET.peers[u]; if (p && Math.hypot(p.x - P.x, p.z - P.z) < 60) near++; }
    if (!near) return toast('60칸 안에 함께 있는 사람이 없어요. 먼저 한곳에 모여요');
    HS = { role: 'seek', by: me.id, x: P.x, z: P.z, t0: performance.now(), players: {}, found: {} };
    funCast({ k: 'hs', a: 'start', x: +P.x.toFixed(1), z: +P.z.toFixed(1) }); hsLoop(); newsMark('fun4');
  }
  function hsLoop() {
    clearInterval(hsT); hsT = setInterval(function () {
      if (!HS) return clearInterval(hsT);
      var t = performance.now() - HS.t0, hiding = t < HS_HIDE, left = Math.ceil((hiding ? HS_HIDE - t : HS_HIDE + HS_SEEK - t) / 1000);
      hsTags();
      if (HS.role === 'seek') {
        var total = Object.keys(HS.players).length, got = Object.keys(HS.found).length;
        hsShadeShow(hiding ? '🙈 눈을 감고 기다려요 ' + left + '\n숨는 사람 ' + total + '명' : '');
        if (!hiding) raceShow('🔎 찾은 사람 ' + got + '/' + total + ' · ' + Math.floor(left / 60) + ':' + ('0' + left % 60).slice(-2));
        if (!hiding && (left <= 0 || (total && got >= total) || (!total && t > HS_HIDE + 3000))) hsFinish();
      } else {
        raceShow(HS.role === 'out' ? '🙋 찾혔어요 · 끝날 때까지 구경해요' : (hiding ? '🙈 숨어요! ' + left + '초' : '🤫 술래가 찾는 중 · ' + Math.floor(left / 60) + ':' + ('0' + left % 60).slice(-2)));
        if (HS.role === 'hide' && Math.hypot(P.x - HS.x, P.z - HS.z) > 75 && !HS.warn) { HS.warn = 1; toast('너무 멀리 왔어요. 시작한 곳에서 70칸 안에 숨어요'); }
        if (t > HS_HIDE + HS_SEEK + 12000) hsStop('숨바꼭질이 끝났어요');
      }
    }, 250);
  }
  function hsFinish() {
    var total = Object.keys(HS.players).length, found = Object.keys(HS.found), left = Object.keys(HS.players).filter(function (u) { return !HS.found[u]; });
    funCast({ k: 'hs', a: 'end', f: found, n: total });
    hsStop(total ? (left.length ? '⏰ 끝! 끝까지 숨은 사람: ' + left.map(hsName).join(', ') : '🎉 모두 찾았어요! 술래 승') : '함께 숨은 사람이 없어 끝냈어요');
  }
  function hsTapPeer(p) {
    if (!HS || HS.role !== 'seek') return false;
    if (performance.now() - HS.t0 < HS_HIDE) return true;
    if (!HS.players[p.u]) { toast('이 사람은 숨바꼭질을 하고 있지 않아요'); return true; }
    if (HS.found[p.u]) return true;
    if (Math.hypot(p.x - P.x, p.z - P.z) > 7) { toast('조금 더 가까이 가서 눌러요'); return true; }
    HS.found[p.u] = 1; funCast({ k: 'hs', a: 'found', v: p.u }); sfx('craft'); vibrate('break'); toast('🔎 ' + hsName(p.u) + ' 찾았다!');
    return true;
  }
  function onFun(m) {
    if (!m || !me || m.u === me.id) return;
    if (m.k === 'fw') { if (Number.isFinite(m.x) && Number.isFinite(m.y) && Number.isFinite(m.z) && Math.hypot(m.x - P.x, m.z - P.z) < 160) fireworkShow(m.x, m.y, m.z, m.c | 0); return; }
    if (m.k !== 'hs') return;
    if (m.a === 'start') {
      if (HS || !Number.isFinite(m.x) || !Number.isFinite(m.z) || Math.hypot(m.x - P.x, m.z - P.z) > 60) return;
      HS = { role: 'hide', by: m.u, x: m.x, z: m.z, t0: performance.now() }; funCast({ k: 'hs', a: 'in', by: m.u });
      sfx('pop'); vibrate('break'); toast('🙈 숨바꼭질! 술래는 ' + hsName(m.u) + ' — 30초 안에 숨어요'); hsLoop();
    } else if (m.a === 'in') { if (HS && HS.role === 'seek' && m.by === me.id) HS.players[m.u] = 1; }
    else if (m.a === 'found') { if (HS && m.u === HS.by && m.v === me.id && HS.role === 'hide') { HS.role = 'out'; sfx('craft'); vibrate('break'); toast('🙋 찾혔어요!'); } }
    else if (m.a === 'end') {
      if (!HS || m.u !== HS.by) return;
      var mine = HS.role === 'hide';
      hsStop(mine ? '🎉 끝까지 숨었어요!' : '숨바꼭질 끝! 찾힌 사람 ' + ((m.f && m.f.length) | 0) + '/' + (m.n | 0));
    }
  }

  // ⑦ 성탄 절기 선물: 대림절 첫 주일~주현절에 마구간 구유를 누르면 하루 한 번(폭죽 3 + 떡 2)
  function xmasGift() {
    if (!FESTIVE || isAdm()) return;
    var day = kstDay(); if (villageBook.xmasDay === day) return;
    villageBook.xmasDay = day; saveVillageBook(); give(FIREWORK, 3); give(BREAD, 2); bagChanged(); sfx('craft');
    toast('🎁 오늘의 성탄 선물 — 폭죽 3개, 떡 2개. 내일 또 와요');
  }
  // 놀이 탭 아래쪽: 놀이 마당 안내
  function renderFunTab2(row) {
    function go(label, pos, name) { var s = document.createElement('span'); fbBtn(s, label, function () { $('fbBox').remove(); guideTo(pos, name); }); return s; }
    var lamp = villageBook.lamp || {};
    row('🏮 등불 잡기', '달리기 출발 기둥 옆 돌기둥 아홉. 하나를 누르면 30초 동안 켜지는 등불을 따라 눌러요. ' + (lamp.best ? '내 최고 ' + lamp.best + '개' : '아직 기록이 없어요'), go('길 안내', [LAMP_X + 2.5, LAMP_Z - 2.5], '등불 잡기'));
    var hs = document.createElement('span'); fbBtn(hs, HS ? '하는 중' : '내가 술래', function () { $('fbBox').remove(); resume(); hsStart(); });
    row('🙈 숨바꼭질', '함께 있는 사람들과 한곳(60칸 안)에 모여 「내가 술래」를 눌러요. 30초 동안 숨고, 술래는 2분 30초 동안 가까이 가서 눌러 찾아요.', hs);
    row('🎆 폭죽', '갈대 1개와 숯 1개로 3개를 만들어요(가방 → 만들기). 들고 누르면 하늘에서 터지고 함께 있는 사람에게도 보여요.' + (FESTIVE ? ' 성탄 절기에는 마구간 구유를 누르면 하루 한 번 선물로 받아요.' : ''), null);
    row('🐑 양 몰이', '양 우리 말뚝을 누르면 시작해요.', go('길 안내', [PEN_POST[0] + 0.5, PEN_POST[1] + 2.5], '양 우리'));
    row('💧 수로 시험', '수문과 신호 지렛대를 10초 안에 둘 다 — 둘이 하면 쉬워요.', go('길 안내', [WATER_GATE[0] + 0.5, WATER_GATE[1] + 3.5], '수로 시험'));
    row('🛤 레일 짐 나르기', '동쪽 사막의 궤에서 궤로 수레에 짐을 실어 날라요.', go('길 안내', [RAIL_A[0] + 0.5, RAIL_A[1] + 2.5], '레일 짐 나르기'));
  }
