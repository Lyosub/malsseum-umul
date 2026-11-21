  // ───────── 설정·가방(이 기기에 저장, 로그인하면 내 땅 기록에도 저장) ─────────
  var S = { sens: 1, aim: 'cross', sound: true, view: 0, lightMode: false };
  try { var saved = JSON.parse(localStorage.getItem('arkVillage.settings') || 'null'); if (saved) for (var sk in saved) S[sk] = saved[sk]; } catch (e) {}
  // 2026-11-18: 휴대폰도 기본은 화면 가운데 십자(+)로 겨누기(손가락 자리는 메뉴에서 고를 수 있음) — 한 번 바꿔 줌
  if (!S.aim2) { S.aim = 'cross'; S.aim2 = 1; }
  // 단축 칸은 처음엔 비어 있고(0 = 빈 칸), 플레이어가 직접 채운다
  HOTBAR = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  try { var hb = JSON.parse(localStorage.getItem('arkVillage.hotbar4') || 'null'); if (hb && hb.length === 9) HOTBAR = hb.map(function (v) { return INV.indexOf(v) >= 0 ? v : 0; }); } catch (e) {}
  // 가방 칸: 가진 것을 플레이어가 정한 자리에(이 기기에 저장)
  var BAGSLOT = [];
  try { BAGSLOT = (JSON.parse(localStorage.getItem('arkVillage.bagslots') || '[]') || []).map(function (v) { return INV.indexOf(v) >= 0 ? v : 0; }); } catch (e) { BAGSLOT = []; }
  function nameOf(id) { return id && B[id] ? B[id][0] : '빈 칸'; }
  var BAG = {};
  try { var bg = JSON.parse(localStorage.getItem('arkVillage.bag') || 'null'); if (bg) for (var bk in bg) if (INV.indexOf(+bk) >= 0) BAG[+bk] = Math.max(0, Math.min(9999, bg[bk] | 0)); } catch (e) {}
  function saveSettings() { try { localStorage.setItem('arkVillage.settings', JSON.stringify(S)); localStorage.setItem('arkVillage.hotbar4', JSON.stringify(HOTBAR)); localStorage.setItem('arkVillage.bagslots', JSON.stringify(BAGSLOT)); } catch (e) {} }
  // 가방: 36칸, 한 칸에 한 묶음(77개, 도구·옷·안장은 1개). 관리자는 끝없음(∞)
  var STACK = 77, BAG_SLOTS = 36;
  function stackOf(id) { return isTool(id) || WEARINFO[id] || id === SADDLE || id === SWORD || isArmSword(id) || isBowId(id) || isSlingId(id) || id === CART || id === BOAT ? 1 : STACK; }
  function slotsFor(id, n) { return n > 0 ? Math.ceil(n / stackOf(id)) : 0; }
  function usedSlots() { var s = 0; for (var k in BAG) if (BAG[k] > 0) s += slotsFor(+k, BAG[k]); return s; }
  // 이 물건을 몇 개 더 담을 수 있나(채우다 만 묶음 + 빈 칸)
  function room(id) {
    if (isAdm()) return 1e9;
    var st = stackOf(id), cur = BAG[id] || 0, part = cur % st ? st - cur % st : 0;
    return Math.min(9999 - cur, part + Math.max(0, BAG_SLOTS - usedSlots()) * st);
  }
  function fmtN(n) { return isAdm() ? '∞' : String(n); }
  // 단축 칸에는 한 묶음만(최대 77, 도구·옷은 1) — 다 쓰면 가방의 다음 묶음이 채워짐
  function hotCount(id) { return Math.min(have(id), stackOf(id)); }
  var fullT = 0;
  function bagFull() { var now = performance.now(); if (now - fullT > 4000) { fullT = now; toast('🎒 가방이 가득 찼어요 — 안 쓰는 것을 궤에 넣거나 가방에서 버려요'); } }
  // 가방 칸 정리: 물건마다 필요한 묶음 수만큼 칸을 두고(넘치면 빼고, 모자라면 빈 칸에), 최소 4줄 × 9칸
  function syncBagSlots() {
    var i, need = {}, cnt = {};
    if (isAdm()) INV.forEach(function (id) { need[id] = 1; });
    else for (var k in BAG) if (BAG[k] > 0) need[+k] = slotsFor(+k, BAG[k]);
    for (i = 0; i < BAGSLOT.length; i++) { var v = BAGSLOT[i]; if (!v) continue; cnt[v] = (cnt[v] || 0) + 1; if (cnt[v] > (need[v] || 0)) { BAGSLOT[i] = 0; cnt[v]--; } }
    INV.forEach(function (id) { while ((cnt[id] || 0) < (need[id] || 0)) { var e = BAGSLOT.indexOf(0); if (e < 0) { e = BAGSLOT.length; BAGSLOT.push(0); } BAGSLOT[e] = id; cnt[id] = (cnt[id] || 0) + 1; } });
    while (BAGSLOT.length < BAG_SLOTS) BAGSLOT.push(0);
    while (BAGSLOT.length > BAG_SLOTS && BAGSLOT.length % 9 === 0 && BAGSLOT.slice(-9).every(function (v) { return !v; })) BAGSLOT.length -= 9;
    while (BAGSLOT.length % 9) BAGSLOT.push(0);
  }
  // 칸마다 보여 줄 개수: 같은 물건은 앞 칸부터 77개씩 채우고 마지막 칸이 나머지
  function slotCounts() {
    var left = {}, out = [];
    BAGSLOT.forEach(function (id) { if (!id) { out.push(0); return; } if (left[id] === undefined) left[id] = have(id); var st = isAdm() ? left[id] : Math.min(stackOf(id), left[id]); out.push(st); left[id] -= st; });
    return out;
  }
  var WEAR = {};
  try { var wr = JSON.parse(localStorage.getItem('arkVillage.wear') || 'null'); if (wr) for (var wk in wr) if (isTool(+wk)) WEAR[+wk] = Math.max(1, Math.min(toolMax(+wk), wr[wk] | 0)); } catch (e) {}
  // 관리자 계정: 모든 자원 무한, 모든 제작법 열림, 날기 가능(서버 get_my_ark_name의 admin)
  function isAdm() { return typeof NET !== 'undefined' && !!NET.admin; }
  function have(id) { return isAdm() && INV.indexOf(id) >= 0 ? 9999 : (BAG[id] || 0); }
  function wearLeft(id) { return WEAR[id] !== undefined ? WEAR[id] : toolMax(id); }
  // 한 번 캘 때마다 1씩 닳고, 0이 되면 그 도구 하나가 부서진다(같은 도구가 더 있으면 새것으로)
  function wearTool(tid) {
    if (!tid || have(tid) < 1 || isAdm()) return;
    var left = wearLeft(tid) - 1;
    if (left > 0) { WEAR[tid] = left; if (left === 10) toast(toolName(tid) + '이(가) 곧 부서지려 해요'); return; }
    take(tid, 1); delete WEAR[tid];
    toast(toolName(tid) + '이(가) 다 닳아 부서졌어요' + (have(tid) > 0 ? ' · 남은 것 ' + have(tid) + '개' : ' · 만들기에서 새로 만들어요'));
    sfx('break');
  }
  function bagChanged() {
    for (var wk2 in WEAR) if (have(+wk2) < 1) delete WEAR[wk2];
    // 다 쓴 것은 단축 칸에서 빠진다
    var hc = false; for (var hi = 0; hi < 9; hi++) if (HOTBAR[hi] && have(HOTBAR[hi]) < 1) { HOTBAR[hi] = 0; hc = true; }
    syncBagSlots(); if (hc) saveSettings();
    if (started && qStep < QUEST.length) questCheck();
    try { localStorage.setItem('arkVillage.bag', JSON.stringify(BAG)); localStorage.setItem('arkVillage.wear', JSON.stringify(WEAR)); localStorage.setItem('arkVillage.heat', String(HEAT)); } catch (e) {}
    renderHotbar(); setSel(sel, true);
    if (ui === 'inv') renderInv();
    if (ui === 'chest') renderChest();
    if (me && myPlot >= 0) markDirty();
  }
  // 담은 개수를 돌려준다(가방이 차면 담을 수 있는 만큼만)
  function give(id, n) {
    if (INV.indexOf(id) < 0) return 0;
    if (isAdm()) return n;
    if (n > 0) n = Math.min(n, room(id));
    if (!n) return 0;
    BAG[id] = Math.max(0, Math.min(9999, have(id) + n));
    if (n > 0) {
      markSeen(id);
      var ak = id === LOG ? 'log' : id === CRAFT ? 'table' : isTool(id) ? 'tool' : id === STONE ? 'stone' : id === ING_FE ? 'iron' : id === GEM_DIA ? 'diamond' : '';
      if (ak && started) unlock(ak);
      // 새로 얻은 것은 단축 칸 빈자리에 저절로(이미 있으면 그대로)
      if (HOTBAR.indexOf(id) < 0) { var e = HOTBAR.indexOf(0); if (e >= 0) { HOTBAR[e] = id; saveSettings(); } }
    }
    return n;
  }
  // ───────── 제작법은 단계별로 열린다: 재료를 한 번이라도 얻으면 그 재료로 만드는 법이 열림 ─────────
  var SEEN = {}, seenQuiet = true, newRecs = [], newRecT = null;
  try { (localStorage.getItem('arkVillage.seen') || '').split(',').forEach(function (k) { if (+k) SEEN[+k] = 1; }); } catch (e) {}
  for (var bk3 in BAG) if (BAG[bk3] > 0) SEEN[+bk3] = 1;
  function saveSeen() { try { localStorage.setItem('arkVillage.seen', Object.keys(SEEN).join(',')); } catch (e) {} }
  function seenString() { return Object.keys(SEEN).join('.'); }
  // 열리는 조건: 재료 + 녹이기는 용광로, 옷은 제작대를 한 번 가져 봐야
  function recIds(rc) { var a = rc.need.map(function (n) { return n[0]; }); if (rc.furnace) a.push(FURNACE); if (rc.table) a.push(CRAFT); return a; }
  function recOpen(rc) { return isAdm() || recIds(rc).every(function (id) { return SEEN[id]; }); }
  function markSeen(id) {
    if (SEEN[id]) return;
    SEEN[id] = 1; saveSeen();
    if (seenQuiet) return;
    RECIPES.forEach(function (rc) {
      if (!recOpen(rc) || recIds(rc).indexOf(id) < 0) return;
      var nm = B[rc.out[0]][0]; if (newRecs.indexOf(nm) < 0) newRecs.push(nm);
    });
    if (!newRecs.length) return;
    clearTimeout(newRecT);
    newRecT = setTimeout(function () {
      var st = curStage();
      toast('📜 새 제작법이 열렸어요: ' + newRecs.slice(0, 4).join(', ') + (newRecs.length > 4 ? ' 외 ' + (newRecs.length - 4) + '가지' : '') + ' — 🎒 → 🔨 만들기' + (st.up ? ' · ' + st.n + '단계 「' + st.name + '」' : ''));
      newRecs = []; lastStage = st.n;
    }, 300);
  }
  // 단계: 1 나무·흙 → 2 돌 → 3 구리 → 4 철·은 → 5 금·보석
  var STAGE_NAME = ['', '나무·흙', '돌', '구리', '철·은', '금·보석'];
  var STAGE_NEXT = ['', '돌을 캐면(곡괭이) 2단계', '구리 광석을 캐서 용광로에 녹이면 3단계', '철 광석을 캐서 녹이면 4단계', '금 광석이나 보석을 얻으면 5단계', ''];
  var MAT_STAGE = {};
  [[2, [STONE, LIME, BASALT, DEEP, COAL, CHAR, ORE_COAL, BLK_COAL, FURNACE, BRICK]], [3, [ORE_CU, ING_CU, BLK_CU]],
   [4, [ORE_FE, ING_FE, BLK_FE, ORE_AG, ING_AG, BLK_AG, GEM_ONYX, BLK_ONYX, ORE_ONYX]], [5, [ORE_AU, ING_AU, BLK_AU, ORE_SAPH, GEM_SAPH, BLK_SAPH, ORE_DIA, GEM_DIA, BLK_DIA]]
  ].forEach(function (s) { s[1].forEach(function (id) { MAT_STAGE[id] = s[0]; }); });
  [MARBLE, ALABASTER, PILLAR, ARCH, RAIL, FLINT].forEach(function (id) { MAT_STAGE[id] = 2; });
  MAT_STAGE[STRIKER] = 4;
  for (var dv2 in DEEPV) MAT_STAGE[DEEPV[dv2]] = MAT_STAGE[dv2] || 1;
  function recStage(rc) { var s = 1; recIds(rc).forEach(function (id) { s = Math.max(s, MAT_STAGE[id] || 1); }); return s; }
  var lastStage = 0;
  function curStage() { var s = 1; for (var k in SEEN) s = Math.max(s, MAT_STAGE[k] || 1); var up = lastStage && s > lastStage; return { n: s, name: STAGE_NAME[s], up: up }; }
  // 재료를 어디서 얻는지
  function howGet(id) {
    var H = {};
    H[LOG] = '동쪽 숲에서 나무를 꾹 눌러 캐요(도끼가 빨라요)'; H[LEAF] = '나뭇잎을 캐요(칼이 빨라요)';
    H[STONE] = '서쪽 산 바위나 땅속 돌을 곡괭이로 캐요'; H[LIME] = '서쪽 산 위쪽 바위에서 캐요'; H[BASALT] = '서쪽 산의 검은 바위에서 캐요';
    H[SAND] = '북쪽 바닷가나 동쪽 사막에서 삽으로 캐요'; H[DIRT] = '풀밭이나 흙을 삽으로 캐요'; H[CLAY] = '남쪽 호숫가 물가에서 캐요'; H[REED] = '남쪽 호숫가의 갈대를 캐요';
    H[TAR] = '남쪽 호수 동쪽의 역청 구덩이에서 캐요(창 14:10)'; H[FLOWER] = '들판에 핀 들꽃을 캐요'; H[SNOW] = '아라랏 산 꼭대기의 눈을 캐요';
    H[COAL] = '석탄 광석을 곡괭이로 캐면 나와요 — 산 속과 땅속에 흔해요'; H[CHAR] = '용광로에서 통나무를 녹이면 숯이 돼요(요 21:9)';
    H[WOOL] = '작은 칼을 들고 양을 누르면 깎고, 양을 잡아도 나와요'; H[LEATHER] = '작은 칼을 들고 소·염소·낙타를 누르거나, 짐승을 잡으면 나와요';
    H[RAW_BEEF] = '소를 잡으면 나와요 — 모닥불에서 구워요'; H[RAW_GOAT] = '염소를 잡으면 나와요 — 모닥불에서 구워요';
    H[COOKED_BEEF] = '소고기를 모닥불·화덕 가까이에서 구워요'; H[COOKED_GOAT] = '염소고기를 모닥불·화덕 가까이에서 구워요';
    H[GEM_ONYX] = '깊은 땅속 호마노 광석을 철 곡괭이 이상으로 캐요 — 호마노로 호마노 곡괭이를 만들어요'; H[GEM_SAPH] = '아주 깊은 곳 청옥 광석을 호마노 곡괭이로 캐요'; H[GEM_DIA] = '맨 아래 가까이 금강석 광석을 호마노 곡괭이로 캐요';
    [[ING_CU, ORE_CU], [ING_FE, ORE_FE], [ING_AG, ORE_AG], [ING_AU, ORE_AU]].forEach(function (q) { H[q[0]] = B[q[1]][0] + '을 캐서 용광로에서 녹여요(욥 28:2)'; });
    [[ORE_CU, '돌 아래 땅속'], [ORE_FE, '땅속 깊이(돌 곡괭이 이상)'], [ORE_AG, '더 깊은 땅속(구리 곡괭이 이상)'], [ORE_AU, '아주 깊은 땅속(철 곡괭이)']].forEach(function (q) { H[q[0]] = q[1] + '에서 캐요'; });
    H[HONEY] = '숲의 꽃을 살펴보세요. 꽃을 캐면 가끔 꿀이 나와요';
    H[RAW_FISH] = '물에 낚싯대나 그물을 써요';
    H[RAW_LAMB] = '양을 잡거나, 양고기가 없을 때 목자에게 말을 걸어요';
    if (FARM_SEEDS[id]) return '풀이나 잎을 캐면 가끔 나와요. 괭이로 갈아 놓은 밭에 심어요';
    H[SALT] = '북쪽 바닷가의 마른 모래를 캐면 가끔 나와요 (마태복음 5장 13절)';
    H[FLINT] = '자연 상태의 돌을 캐면 가끔 나와요';
    H[MARBLE] = '서쪽 산의 높은 곳에서 돌을 캐면 가끔 나와요';
    H[ALABASTER] = '자연 상태의 석회암을 캐면 가끔 나와요';
    H[RED_EARTH] = '남쪽 호수나 강의 진흙을 캐면 가끔 나와요';
    H[SEA_PEARL] = '북쪽 바닷속 바닥의 모래나 진흙을 캐면 드물게 나와요';
    H[CORAL] = '북쪽 바닷속 바닥의 모래나 진흙을 캐면 가끔 나와요';
    if (H[id]) return H[id];
    var rc = RECIPES.filter(function (r) { return r.out[0] === id; })[0];
    if (rc) return '만들기에서 만들어요: ' + rc.need.map(function (n) { return B[n[0]][0] + ' ' + n[1]; }).join(' + ');
    return '캐서 모아요';
  }
  function take(id, n) { if (isAdm()) return; BAG[id] = Math.max(0, have(id) - n); }
  // 내 모습(기본 6가지 중 하나)과 입은 옷 — 이 기기와 내 땅 기록(|w:)에 저장, 친구들에게도 보임
  var LOOK = 0, WORN = { head: 0, body: 0, belt: 0, feet: 0, shield: 0 };
  function wornFromString(s) {
    var a = String(s || '').split('.').map(function (v) { return v | 0; });
    if (a[0] >= 0 && a[0] < LOOKS.length) LOOK = a[0];
    SLOTS.forEach(function (slot, i) { var id = a[i + 1]; WORN[slot] = id && WEARINFO[id] && WEARINFO[id].slot === slot ? id : 0; });
  }
  function wornString() { return [LOOK].concat(SLOTS.map(function (s) { return WORN[s] || 0; })).join('.'); }
  try { var ws0 = localStorage.getItem('arkVillage.worn'); if (ws0) wornFromString(ws0); } catch (e) {}
  function saveWorn() {
    try { localStorage.setItem('arkVillage.worn', wornString()); } catch (e) {}
    if (me && myPlot >= 0) markDirty();
    refreshMyAvatar();
    if (NET.ch) trackMe();
  }
  function refreshMyAvatar() {
    if (!scene) return;
    var vis = avatar ? avatar.visible : false;
    if (avatar) scene.remove(avatar);
    avatar = makeAvatar(LOOKS[LOOK]); dressAvatar(avatar, WORN); avatar.visible = vis; scene.add(avatar);
    if (heldMesh) handItem(avatar, heldWeapon());
  }
  function wearItem(id) {
    var wi = WEARINFO[id]; if (!wi) return;
    if (have(id) < 1) return deny(B[id][0] + '이(가) 없어요. 제작대에서 만들어요');
    take(id, 1);
    var old = WORN[wi.slot]; if (old) give(old, 1);
    WORN[wi.slot] = id; sfx('craft'); bagChanged(); saveWorn(); unlock('wear');
    toast(jo(B[id][0], '을', '를') + ' 입었어요' + (wi.ref ? ' (' + wi.ref + ')' : '') + (isTouch ? '' : ' — 👁(V)로 3인칭에서 볼 수 있어요'));
    armorCheck();
    if ($('looks').classList.contains('show')) renderLooks();
  }
  function unwear(slot) {
    var id = WORN[slot]; if (!id) return;
    if (room(id) < 1) { bagFull(); return; }
    WORN[slot] = 0; give(id, 1); sfx('click'); bagChanged(); saveWorn();
    if ($('looks').classList.contains('show')) renderLooks();
  }
  // 「내 모습」 화면: 작은 그림은 따로 그리는 작은 화면 하나로 만든다
  var lookR = null, lookScene = null, lookCam = null, lookThumbs = null;
  function lookShot(look, worn) {
    try {
      if (!lookR) {
        lookR = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
        lookR.setPixelRatio(1); lookR.setSize(150, 200, false);
        lookScene = new THREE.Scene(); lookCam = new THREE.PerspectiveCamera(26, 150 / 200, 0.1, 60);
        lookCam.position.set(-3.2, HT * 0.62, -9.6); lookCam.lookAt(0, HT * 0.5, 0);
      }
      var av = makeAvatar(LOOKS[look]); if (worn) dressAvatar(av, worn);
      av.rotation.y = -0.25; lookScene.add(av);
      var keep = avatarMat.color.clone(); avatarMat.color.setScalar(1);
      lookR.render(lookScene, lookCam);
      avatarMat.color.copy(keep);
      var url = lookR.domElement.toDataURL('image/png');
      lookScene.remove(av); av.traverse(function (o) { if (o.geometry) o.geometry.dispose(); });
      return url;
    } catch (e) { return ''; }
  }
  function openLooks() { openPanel('looks'); renderLooks(); sfx('click'); }
  function renderLooks() {
    if (!lookThumbs) lookThumbs = LOOKS.map(function (l, i) { return lookShot(i, null); });
    var g = $('lookGrid'); g.innerHTML = '';
    LOOKS.forEach(function (l, i) {
      var b = document.createElement('button'); b.className = 'lcard' + (i === LOOK ? ' on' : ''); b.title = l.name; b.setAttribute('aria-label', l.name);
      if (lookThumbs[i]) { var im = document.createElement('img'); im.src = lookThumbs[i]; im.alt = ''; b.appendChild(im); } else b.textContent = (i + 1) + '';
      b.addEventListener('click', function () { LOOK = i; saveWorn(); renderLooks(); sfx('click'); $('lookName').textContent = '모습: ' + l.name; });
      g.appendChild(b);
    });
    var wr = $('wornRow'); wr.innerHTML = '';
    SLOTS.forEach(function (slot) {
      var id = WORN[slot], b = document.createElement('button'); b.className = 'wslot';
      b.innerHTML = (id ? '<img src="' + ICON[id] + '" alt="">' : '<span style="display:block;height:34px;line-height:34px;font-size:18px;opacity:.5">·</span>') + '<small>' + SLOT_NAME[slot] + '</small>';
      b.title = id ? B[id][0] + ' (누르면 벗어요)' : SLOT_NAME[slot] + ' — 비었어요';
      b.addEventListener('click', function () { if (id) { unwear(slot); $('lookName').textContent = B[id][0] + '을(를) 벗어서 가방에 넣었어요'; } else $('lookName').textContent = SLOT_NAME[slot] + '에 입을 옷이 없어요'; });
      wr.appendChild(b);
    });
    var cg = $('clothGrid'); cg.innerHTML = '';
    var mine2 = WEARS.filter(function (w) { return have(w[0]) > 0; });
    if (!mine2.length) { var em = document.createElement('div'); em.className = 'empty'; em.textContent = '아직 옷이 없어요. 고페르 나무 4개로 제작대를 만들고, 가죽·양털·덩이로 옷을 지어요.'; cg.appendChild(em); }
    mine2.forEach(function (w) {
      var d = document.createElement('button'); d.className = 'islot'; d.innerHTML = slotHTML(w[0], have(w[0])); d.title = w[1];
      d.addEventListener('click', function () { wearItem(w[0]); $('lookName').textContent = w[1] + (w[5] ? ' (' + w[5] + ')' : '') + '을(를) 입었어요'; });
      cg.appendChild(d);
    });
    var me2 = lookShot(LOOK, WORN); if (me2) $('lookMe').src = me2;
  }
  // 하나님의 전신 갑주를 다 입으면 말씀 카드(엡 6:11)
  function armorCheck() {
    if (!(WORN.head === 144 && WORN.body === 150 && WORN.belt === 152 && WORN.feet === 155 && WORN.shield === 158)) return;
    unlock('armor');
    $('cardEmoji').textContent = '🛡'; $('cardName').textContent = '하나님의 전신 갑주';
    $('cardText').textContent = '마귀의 간계를 능히 대적하기 위하여 하나님의 전신 갑주를 입으라'; $('cardRef').textContent = '에베소서 6:11';
    $('cardNew').textContent = '구원의 투구 · 의의 호심경 · 진리의 허리 띠 · 평안의 복음의 신 · 믿음의 방패 (엡 6:14-17)';
    $('card').classList.add('show'); sfx('pop');
    clearTimeout(cardT); cardT = setTimeout(function () { $('card').classList.remove('show'); }, 12000);
  }
  function bagString() { var a = []; for (var k in BAG) if (BAG[k] > 0) a.push(k + '.' + BAG[k] + (WEAR[k] !== undefined ? '.' + WEAR[k] : '')); if (HEAT > 0) a.push('h.' + Math.round(HEAT * 2)); return a.join(','); }
  function bagFromString(s) {
    var o = {}; WEAR = {}; HEAT = 0;
    (s || '').split(',').forEach(function (p) {
      var q = p.split('.'); var id = +q[0], n = +q[1];
      if (q[0] === 'h') { HEAT = Math.max(0, Math.min(200, (n | 0) / 2)); return; }
      if (INV.indexOf(id) >= 0 && n > 0) { o[id] = Math.min(9999, n | 0); if (isTool(id) && +q[2] > 0) WEAR[id] = Math.min(toolMax(id), q[2] | 0); }
    }); return o;
  }

  // ───────── 소리(코드로 만든 짧은 소리) ─────────
  var AC = null;
  function audioOn() {
    try { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); } catch (e) { AC = null; }
  }
  var DIG_F = { pick: 2200, axe: 700, shovel: 420, knife: 1600 };
  // 캐고·부수고·놓는 소리를 재료마다 다르게(11/20, 마인크래프트처럼): 돌 딱 · 나무 통 · 흙 사각 · 모래·눈 스슥 · 풀잎 바스락 · 유리 쨍 · 쇠 깡 · 양털 폭
  function matSound(id) {
    if (!id || !B[id]) return 'stone';
    var m = SHAPE[id] && SHAPE[id].mat ? SHAPE[id].mat : id;
    if (SLAB_MATERIAL[m]) m = SLAB_MATERIAL[m];
    if (m === GLASS || id === PANE) return 'glass';
    if ((m >= BLK_CU && m <= BLK_AU) || m === LANTERN) return 'metal';
    if ((m >= WOOL_W && m <= WOOL_R) || m === WOOL || (SHAPE[id] && SHAPE[id].type === 'carpet') || B[m][1] === 'wool') return 'wool';
    if (m === LEAF || kind(m) === 'plant' || m === REED) return 'plant';
    var k = stepKind(m);
    return k === 'soft' ? 'sand' : k === 'grass' ? 'dirt' : k === 'water' ? 'dirt' : k;   // wood · stone
  }
  function nz(dur, type, freq, gain, pw, grain, q, at) {   // 잡음 한 토막: grain>0이면 사각사각 끊김
    var len = Math.max(1, Math.floor(AC.sampleRate * dur)), buf = AC.createBuffer(1, len, AC.sampleRate), d = buf.getChannelData(0), gate = 1;
    for (var i = 0; i < len; i++) { if (grain && i % Math.floor(AC.sampleRate * grain) === 0) gate = Math.random() < 0.55 ? 1 : 0.25; d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, pw) * gate; }
    var src = AC.createBufferSource(); src.buffer = buf; src.playbackRate.value = 0.9 + Math.random() * 0.2;
    var f = AC.createBiquadFilter(); f.type = type; f.frequency.value = freq; if (q) f.Q.value = q;
    var g = AC.createGain(); g.gain.value = gain;
    src.connect(f); f.connect(g); g.connect(AC.destination); src.start(AC.currentTime + (at || 0));
  }
  function matSfx(act, m) {
    var big = act === 'break', dig = act === 'dig', v = 0.9 + Math.random() * 0.2;
    if (m === 'stone') { nz(dig ? 0.045 : big ? 0.16 : 0.07, 'highpass', 1700, dig ? 0.22 : 0.4, 4.5); nz(big ? 0.12 : 0.05, 'bandpass', 700 * v, dig ? 0.12 : 0.25, 3, 0, 1.5); }
    else if (m === 'wood') { nz(dig ? 0.05 : big ? 0.14 : 0.07, 'bandpass', 520 * v, dig ? 0.3 : 0.45, 3, 0, 2); tone('sine', 230 * v, 150 * v, dig ? 0.06 : 0.1, dig ? 0.07 : 0.12); if (big) tone('sine', 160 * v, 95 * v, 0.14, 0.1); }
    else if (m === 'dirt') { nz(dig ? 0.08 : big ? 0.2 : 0.1, 'lowpass', 900 * v, dig ? 0.3 : 0.45, 1.6, 0.006); }
    else if (m === 'sand') { nz(dig ? 0.1 : big ? 0.24 : 0.12, 'highpass', 2300 * v, dig ? 0.12 : 0.2, 1.3, 0.004); }
    else if (m === 'plant') { nz(dig ? 0.07 : big ? 0.16 : 0.08, 'bandpass', 2600 * v, dig ? 0.18 : 0.3, 1.8, 0.005, 0.8); }
    else if (m === 'wool') { nz(dig ? 0.06 : 0.11, 'lowpass', 420 * v, dig ? 0.25 : 0.4, 2); }
    else if (m === 'glass') {
      if (big) { nz(0.25, 'highpass', 3000, 0.35, 2.2, 0.003); for (var i = 0; i < 6; i++) (function (k) { setTimeout(function () { tone('sine', 2400 + Math.random() * 3200, 2200 + Math.random() * 2600, 0.08 + Math.random() * 0.1, 0.05); }, k * 28 + Math.random() * 20); })(i); }
      else { nz(0.04, 'highpass', 2600, dig ? 0.15 : 0.25, 4); tone('sine', 2900 * v, 2900 * v, dig ? 0.06 : 0.14, dig ? 0.03 : 0.06); }
    }
    else if (m === 'metal') { nz(0.04, 'highpass', 2200, dig ? 0.18 : 0.3, 4); tone('triangle', 880 * v, 860 * v, dig ? 0.12 : big ? 0.45 : 0.3, dig ? 0.05 : 0.09); tone('sine', 1330 * v, 1300 * v, dig ? 0.1 : 0.35, dig ? 0.03 : 0.05); }
    else return false;
    return true;
  }
  // 발소리: 밟은 것마다 다르게(모래·눈은 사각, 풀·흙은 부드럽게, 나무는 통통, 돌은 딱딱, 물은 첨벙) + 걸음마다 조금씩 다른 높이
  var STEP_CFG = { soft: [0.11, 'bandpass', 1100, 0.085, 1.2], grass: [0.07, 'lowpass', 650, 0.09, 2.2], wood: [0.05, 'bandpass', 420, 0.15, 4], stone: [0.045, 'highpass', 1300, 0.06, 4.5], water: [0.16, 'bandpass', 620, 0.1, 1] };
  function stepKind(id) {
    if (id === WATER) return 'water';
    if (id === SAND || id === SNOW || id === PATH) return 'soft';
    if (id === GRASS || id === DIRT || id === CLAY || id === LEAF || kind(id) === 'plant') return 'grass';
    if (TCLASS[id] === 'axe' || (SHAPE[id] && TCLASS[SHAPE[id].mat] === 'axe')) return 'wood';
    return 'stone';
  }
  function stepSound(id) {
    if (!AC || !S.sound) return;
    try {
      var k = stepKind(id), c = STEP_CFG[k], v = 0.85 + Math.random() * 0.3;
      var len = Math.floor(AC.sampleRate * c[0]), buf = AC.createBuffer(1, len, AC.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, c[4]);
      var src = AC.createBufferSource(); src.buffer = buf; src.playbackRate.value = v;
      var f = AC.createBiquadFilter(); f.type = c[1]; f.frequency.value = c[2] * v;
      var g = AC.createGain(); g.gain.value = c[3];
      src.connect(f); f.connect(g); g.connect(AC.destination); src.start();
      if (k === 'wood') tone('sine', 190 * v, 140 * v, 0.07, 0.05);   // 나무 바닥은 통통
    } catch (e) {}
  }
  function sfx(kindS, freq) {
    if (!AC || !S.sound) return;
    try {
      if (typeof freq === 'string' && (kindS === 'break' || kindS === 'dig' || kindS === 'place') && matSfx(kindS, freq)) return;   // 재료 소리
      if (typeof freq === 'string') freq = 0;
      var dur = { 'break': 0.18, step: 0.06, click: 0.03, dig: 0.05, pop: 0.05, craft: 0.12, door: 0.14, place: 0.07 }[kindS] || 0.09;
      var len = Math.floor(AC.sampleRate * dur), buf = AC.createBuffer(1, len, AC.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, kindS === 'break' ? 1.6 : 3);
      var src = AC.createBufferSource(); src.buffer = buf;
      var f = AC.createBiquadFilter(); f.type = kindS === 'pop' || kindS === 'craft' ? 'bandpass' : 'lowpass';
      f.frequency.value = freq || { 'break': 1500, step: 520, click: 2600, dig: 800, pop: 1800, craft: 1200 }[kindS] || 950;
      var g = AC.createGain(); g.gain.value = { step: 0.1, click: 0.18, dig: 0.16, pop: 0.5, craft: 0.5 }[kindS] || 0.42;
      src.connect(f); f.connect(g); g.connect(AC.destination); src.start();
    } catch (e) {}
  }

