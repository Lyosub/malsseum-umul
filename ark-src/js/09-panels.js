  // ───────── 화면 글·패널 ─────────
  var toastT = null;
  // 알림은 차례로 보여 준다(빨리 덮이지 않게): 같은 말은 한 번, 기다리는 것은 3개까지
  var toastQ = [], toastCur = '';
  function toast(t) {
    if (!t || t === toastCur || toastQ.indexOf(t) >= 0) return;
    if (toastCur) { toastQ.push(t); if (toastQ.length > 3) toastQ.shift(); return; }
    toastShow(t);
  }
  function toastShow(t) {
    var el = $('toast'); toastCur = t; el.textContent = t; el.classList.add('show'); clearTimeout(toastT);
    toastT = setTimeout(function () {
      el.classList.remove('show'); toastCur = '';
      if (toastQ.length) setTimeout(function () { if (!toastCur && toastQ.length) toastShow(toastQ.shift()); }, 250);
    }, toastQ.length ? 2000 : 2600);
  }
  // 게임 오류는 말씀우물 오류 기록(client_errors)에 남긴다 — 한 번 들어올 때 6건까지, 같은 말은 한 번(auth.js와 같은 규칙)
  (function () {
    var sent = 0, seen = {}, pend = [];
    function send(msg, stack) {
      msg = String(msg || 'script error'); if (sent >= 6 || seen[msg]) return; seen[msg] = 1; sent++;
      var go = function () { try { client.rpc('log_client_error', { p_page: location.pathname + location.search, p_message: msg.slice(0, 1000), p_stack: String(stack || '').slice(0, 4000), p_ua: navigator.userAgent }).then(function () {}, function () {}); } catch (e) {} };
      if (typeof client !== 'undefined' && client && client.rpc) go(); else pend.push(go);
    }
    setInterval(function () { if (pend.length && client && client.rpc) { var q = pend; pend = []; q.forEach(function (f) { f(); }); } }, 5000);
    window.addEventListener('error', function (e) { send(e.message, (e.error && e.error.stack) || ((e.filename || '') + ':' + (e.lineno || '') + ':' + (e.colno || ''))); });
    window.addEventListener('unhandledrejection', function (e) { var r = e.reason; send('unhandledrejection: ' + (r && r.message ? r.message : String(r)), (r && r.stack) || ''); });
  })();
  placeName = function () {
    var x = Math.floor(P.x), y = Math.floor(P.y), z = Math.floor(P.z);
    if (x >= AX0 && x <= AX1 && z >= AZ0 && z <= AZ1 && y >= AY0 && y <= AY1 + 1) {
      if (y > AY1 - 1) return '방주 지붕';
      return y >= AY0 + 21 ? '방주 상층' : (y >= AY0 + 11 ? '방주 중층' : '방주 하층');
    }
    var p = plotAt(x, z);
    if (p >= 0) return p === myPlot ? '내 땅 (' + (p + 1) + '번)' + (homeSafe ? ' · 🏠 안전한 집' : '') : (p + 1) + '번 땅' + (plotOwners[p] ? '' : ' · 빈 땅');
    var reg = region(x, z), lmk = inLandmark(x, z);
    if (lmk) return REGION_INFO[lmk][0];
    if (REGION_INFO[reg] && /patmos|malta|cyprus|islet/.test(reg)) return REGION_INFO[reg][0];
    if (reg === 'cedar') return '백향목 숲';
    if (reg === 'wild') return '광야';
    if (reg === 'salt') return P.swim ? '소금 바다 (헤엄치는 중)' : '소금 바닷가';
    if (reg === 'tar') return '역청 구덩이 (창 14:10)';
    if (reg === 'lake') return P.swim ? '호수 (헤엄치는 중)' : '남쪽 호숫가';
    if (inCommons(x, z)) return '🏗 함께 짓는 터';
    if (inTown(x, z)) return z < AZ1 + 16 && z > AZ0 - 16 ? '방주 앞' : '나그네 마을';
    if (reg === 'west') return '서쪽 산';
    if (reg === 'east') return '동쪽 숲';
    if (reg === 'sea' || z < SEA_Z + 40) return P.swim ? '북쪽 바다 (헤엄치는 중)' : '북쪽 바닷가';
    if (reg === 'desert') return '동쪽 사막';
    if (reg === 'oasis') return '오아시스';
    if (reg === 'ararat') return '아라랏 산 (창 8:4)';
    if (reg === 'south') return '남쪽 들판';
    return '들판';
  };
  function slotHTML(id, count) {
    var bar = '';
    if (count > 0 && isTool(id) && WEAR[id] !== undefined) {
      var f = WEAR[id] / toolMax(id);
      bar = '<b class="dur"><s style="width:' + Math.max(4, Math.round(f * 100)) + '%;background:' + (f > 0.5 ? '#4fd14f' : f > 0.2 ? '#e8c53a' : '#e0473a') + '"></s></b>';
    }
    return '<img alt="" src="' + ICON[id] + '"' + (count === 0 ? ' class="none"' : '') + '>' + bar + (isAdm() ? '<i class="inf">∞</i>' : (count > 1 || (count === 1 && stackOf(id) > 1) ? '<i>' + count + '</i>' : ''));
  }
  // 마인크래프트 휴대폰판처럼 단축 칸을 길게 누르면 버리기 — 0.5초에 1개, 그대로 1.5초까지 누르면 한 묶음
  var hotHold = { t1: 0, t2: 0, quiet: 0 };
  function hotHoldStop() { clearTimeout(hotHold.t1); clearTimeout(hotHold.t2); hotHold.t1 = hotHold.t2 = 0; }
  window.addEventListener('pointerup', hotHoldStop); window.addEventListener('pointercancel', hotHoldStop);
  function renderHotbar() {
    var bar = $('hotbar'); bar.innerHTML = '';
    HOTBAR.forEach(function (id, i) {
      var d = document.createElement('button'); d.className = 'slot' + (i === sel ? ' on' : ''); d.title = nameOf(id) + ' (' + (i + 1) + ')'; d.innerHTML = (id ? slotHTML(id, hotCount(id)) : '') + '<u class="num">' + (i + 1) + '</u>';
      d.addEventListener('click', function () { if (performance.now() < hotHold.quiet) return; setSel(i); sfx('click'); });
      d.addEventListener('contextmenu', function (e) { e.preventDefault(); });
      d.addEventListener('pointerdown', function (e) {
        if (e.pointerType !== 'touch' || !id || ui !== 'play' || have(id) < 1) return;
        hotHoldStop();
        hotHold.t1 = setTimeout(function () {
          hotHold.quiet = performance.now() + 2500; setSel(i, true); throwItem(id, 1); vibrate('drop'); newsMark('drop');
          hotHold.t2 = setTimeout(function () { hotHold.t2 = 0; var n = Math.min(hotCount(id), 64); if (n > 0) { throwItem(id, n); vibrate('break'); } }, 1000);
        }, 500);
      });
      d.addEventListener('pointerleave', function () { if (hotHold.t1 && !hotHold.quiet) hotHoldStop(); });
      bar.appendChild(d);
    });
    var more = document.createElement('button'); more.className = 'slot more'; more.innerHTML = '🎒<small>가방</small>'; more.title = '가방·만들기 (E)';
    more.addEventListener('click', function () { openPanel('inv'); sfx('click'); });
    bar.appendChild(more);
  }
  var invTab = 'bag', craftCat = 'block', bagPick = null, craftQuery = '';
  var BAG_CATS = [['all', '전체'], ['block', '🧱 블록'], ['tool', '⛏ 도구·옷'], ['food', '🍞 먹을 것'], ['item', '💎 재료'], ['deco', '🪑 꾸미기']];
  function bagCat(id) {
    var k = B[id] && B[id][6];
    if (k === 'tool' || isWeapon(id) || WEARINFO[id] || id === SADDLE || id === BOW || id === ARROW || id === CART || id === FISH_ROD || id === FISH_NET || id === HOE || id === STAFF || id === SLING || id === COMPASS || id === HAND_MAP || id === SHOFAR) return 'tool';
    if (FOODS[id] !== undefined) return 'food';
    if (k === 'item') return 'item';
    if (SHAPE[id] || LIGHTS[id] || k === 'plant') return 'deco';
    return 'block';
  }
  // ── 가방·만들기 한 화면(11/20): 왼쪽 세로 그림 탭 · 가운데 칸 · 오른쪽 자세히 · 아래 단축 칸 ──
  var invSel = null, lastBC = 'bag', dropAmt = { id: 0, n: 1 };
  var CRAFT_TABS = [['all', '🔍', '모두'], ['recent', '🕘', '최근'], ['block', '🧱', '블록'], ['shape', '🚪', '모양'], ['tool', '⛏', '도구'], ['smelt', '🔥', '녹이기'], ['wear', '👕', '옷']];
  var REP_MAT_T = function (tid) { return [GOPHER, STONE, ING_CU, ING_FE, GEM_ONYX, GEM_DIA][tierOf(tid)]; };
  // 최근 만든 것: [제작법 번호, 나오는 물건] 12개까지, 새로 만든 것이 앞
  function recentRank(rc) { var a = S.recentCraft || [], i = RECIPES.indexOf(rc); for (var k = 0; k < a.length; k++) if (a[k][0] === i && a[k][1] === rc.out[0]) return k; return -1; }
  function noteRecent(rc) { var i = RECIPES.indexOf(rc); if (i < 0) return; var a = (S.recentCraft || []).filter(function (p) { return p[0] !== i && RECIPES[p[0]] && RECIPES[p[0]].out[0] === p[1]; }); a.unshift([i, rc.out[0]]); S.recentCraft = a.slice(0, 12); saveSettings(); }
  function craftTimes(rc) { if (isAdm()) return 99; var t = 999; rc.need.forEach(function (n) { t = Math.min(t, Math.floor(have(n[0]) / n[1])); }); return t; }
  function invInfo(id) { return B[id][0] + ' ' + fmtN(have(id)) + '개' + (isTool(id) && !isAdm() ? ' · 남은 힘 ' + wearLeft(id) + '/' + toolMax(id) : ''); }
  function renderInv() {
    var inBC = invTab === 'bag' || invTab === 'craft';
    if (inBC) lastBC = invTab;
    $('tabBag').classList.toggle('on', inBC); $('tabDex').classList.toggle('on', invTab === 'dex'); $('tabAch').classList.toggle('on', invTab === 'ach');
    $('bagView').style.display = invTab === 'bag' ? '' : 'none'; $('craftView').style.display = invTab === 'craft' ? '' : 'none';
    $('dexView').style.display = invTab === 'dex' ? '' : 'none'; $('achView').style.display = invTab === 'ach' ? '' : 'none';
    $('invSide').style.display = inBC ? '' : 'none'; $('invDetail').style.display = inBC ? '' : 'none'; $('invHot').style.display = inBC ? '' : 'none';
    $('invBody').classList.toggle('solo', !inBC);
    if (invTab === 'ach') renderAch();
    renderDex();
    // 왼쪽 세로 탭: 만들기 분류 여섯 + 가방(맨 아래)
    var side = $('invSide'); side.innerHTML = '';
    function sideBtn(on, icon, label, fn) {
      var b = document.createElement('button'); b.className = 'vtab' + (on ? ' on' : ''); b.innerHTML = '<span>' + icon + '</span><small>' + label + '</small>'; b.title = label;
      b.addEventListener('click', function (e) { e.stopPropagation(); sfx('click'); fn(); }); side.appendChild(b);
    }
    sideBtn(invTab === 'bag', '🎒', '가방', function () { invTab = 'bag'; invSel = null; renderInv(); });
    var sp = document.createElement('i'); sp.className = 'vsep'; side.appendChild(sp);
    CRAFT_TABS.forEach(function (c) { sideBtn(invTab === 'craft' && craftCat === c[0], c[1], c[2], function () { invTab = 'craft'; craftCat = c[0]; invSel = null; bagPick = null; renderInv(); }); });
    syncBagSlots();
    var SC = slotCounts();
    // 가방
    var grid = $('invGrid'); grid.innerHTML = '';
    if (invTab === 'bag') {
      $('bagUse').textContent = isAdm() ? '관리자 · 모두 ∞' : usedSlots() + ' / ' + BAG_SLOTS + '칸';
      var cats = $('bagCats'); cats.innerHTML = '';
      BAG_CATS.forEach(function (c) {
        var n = c[0] === 'all' ? 0 : BAGSLOT.filter(function (id) { return id && bagCat(id) === c[0]; }).length;
        var b = document.createElement('button'); b.className = 'mc' + ((S.bagCat || 'all') === c[0] ? ' on' : ''); b.textContent = c[1] + (n ? ' ' + n : '');
        b.addEventListener('click', function (e) { e.stopPropagation(); S.bagCat = c[0]; saveSettings(); sfx('click'); bagPick = null; renderInv(); });
        cats.appendChild(b);
      });
      var showCat = S.bagCat || 'all', shown = 0;
      BAGSLOT.forEach(function (id, i) {
        if (showCat !== 'all' && (!id || bagCat(id) !== showCat)) return;
        shown++;
        var d = document.createElement('button'), on = bagPick && bagPick.from === 'bag' && bagPick.i === i;
        d.className = 'islot' + (on ? ' pick' : '') + (id ? '' : ' empty'); d.innerHTML = id ? slotHTML(id, SC[i]) : ''; d.title = id ? B[id][0] + (isAdm() ? '' : ' ' + SC[i] + '개') : '빈 칸';
        d.addEventListener('click', function () {
          sfx('click');
          if (bagPick && bagPick.from === 'bag') {
            if (bagPick.i !== i) { var t = BAGSLOT[i]; BAGSLOT[i] = BAGSLOT[bagPick.i]; BAGSLOT[bagPick.i] = t; saveSettings(); $('invName').textContent = '자리를 옮겼어요'; }
            else $('invName').textContent = '내려놓았어요';
            bagPick = null; renderInv(); return;
          }
          if (bagPick && bagPick.from === 'hot') {   // 단축 칸에서 집은 것을 가방에 놓으면 단축 칸이 빈다
            var hid = HOTBAR[bagPick.i]; HOTBAR[bagPick.i] = 0; saveSettings(); renderHotbar(); setSel(sel, true);
            $('invName').textContent = (bagPick.i + 1) + '번 단축 칸을 비웠어요' + (hid ? ' (' + jo(B[hid][0], '은', '는') + ' 가방에 그대로 있어요)' : '');
            bagPick = null; renderInv(); return;
          }
          if (!id) { $('invName').textContent = '빈 칸이에요'; return; }
          bagPick = { from: 'bag', i: i, id: id, n: SC[i] }; renderInv();
          $('invName').textContent = B[id][0] + ' — 아래 단축 칸을 누르면 손에 들고, 다른 가방 칸을 누르면 자리를 바꿔요';
        });
        grid.appendChild(d);
      });
      if (showCat !== 'all' && !shown) { var e0 = document.createElement('div'); e0.className = 'bagEmpty'; e0.textContent = '이 분류에 든 것이 없어요'; grid.appendChild(e0); }
    }
    // 아래 단축 칸(가방·만들기 모두)
    var row = $('invHot'); row.innerHTML = '';
    HOTBAR.forEach(function (id, i) {
      var on = bagPick && bagPick.from === 'hot' && bagPick.i === i;
      var d = document.createElement('button'); d.className = 'islot' + (i === sel ? ' on' : '') + (on ? ' pick' : '') + (id ? '' : ' empty'); d.innerHTML = (id ? slotHTML(id, hotCount(id)) : '') + '<u class="num">' + (i + 1) + '</u>'; d.title = (i + 1) + '번 칸: ' + nameOf(id);
      d.addEventListener('click', function () {
        sfx('click');
        if (bagPick && bagPick.from === 'bag') {   // 가방에서 집은 것을 이 단축 칸에
          var pid = bagPick.id, j = HOTBAR.indexOf(pid);
          if (j >= 0 && j !== i) HOTBAR[j] = HOTBAR[i];   // 같은 것이 다른 칸에 있으면 서로 바꿈
          HOTBAR[i] = pid; saveSettings(); bagPick = null; setSel(i, true); renderHotbar(); renderInv();
          $('invName').textContent = B[pid][0] + ' → ' + (i + 1) + '번 단축 칸'; return;
        }
        if (bagPick && bagPick.from === 'hot') {   // 단축 칸끼리 자리 바꾸기
          if (bagPick.i !== i) { var t2 = HOTBAR[i]; HOTBAR[i] = HOTBAR[bagPick.i]; HOTBAR[bagPick.i] = t2; saveSettings(); $('invName').textContent = '단축 칸 자리를 바꿨어요'; }
          bagPick = null; setSel(i, true); renderHotbar(); renderInv(); return;
        }
        setSel(i, true); renderHotbar();
        if (id) { bagPick = { from: 'hot', i: i, id: id }; if (invTab !== 'bag') invTab = 'bag'; $('invName').textContent = (i + 1) + '번 칸 — 다른 단축 칸을 누르면 자리 바꾸기, 가방 칸을 누르면 이 칸 비우기'; }
        else $('invName').textContent = (i + 1) + '번 칸은 비어 있어요. 가방 칸을 먼저 누르고 여기를 눌러요';
        renderInv();
      });
      row.appendChild(d);
    });
    if (invTab === 'craft') renderCraftGrid();
    renderInvDetail();
    if (!$('invName').textContent && !S.invHint) { $('invName').textContent = '가방 칸을 누르고 → 아래 단축 칸을 누르면 손에 들어요'; S.invHint = 1; saveSettings(); }
  }
  // 제작법 그림 칸: 만들 수 있으면 회색(몇 개 만들 수 있는지 숫자), 재료가 모자라면 빨강, 아직 모르면 어둡게
  function renderCraftGrid() {
    var list = $('craftList'); list.innerHTML = '';
    var q = $('craftQ'); if (q && document.activeElement !== q) q.value = craftQuery;
    var st = curStage(), allN = RECIPES.length, openN = RECIPES.filter(recOpen).length, sb = $('craftStage');
    sb.innerHTML = '📜 제작법 <b>' + openN + '/' + allN + '</b> · <b>' + st.n + '단계</b> 「' + st.name + '」';
    sb.title = STAGE_NEXT[st.n] ? '다음: ' + STAGE_NEXT[st.n] : '마지막 단계예요';
    var items = [];
    RECIPES.forEach(function (rc) {
      if (craftQuery) { if (!recOpen(rc) || B[rc.out[0]][0].indexOf(craftQuery) < 0) return; }   // 찾는 중엔 잠긴 제작법 이름을 드러내지 않음
      else if (craftCat === 'recent') { if (recentRank(rc) < 0 || !recOpen(rc)) return; }
      else if (craftCat !== 'all' && rc.cat !== craftCat) return;
      if (!recOpen(rc)) { if (craftCat !== 'all') items.push({ k: 'lock', rc: rc, o: 3 + recStage(rc) / 100 }); return; }   // 「모두」에는 아는 제작법만
      var ok = canCraft(rc); items.push({ k: 'rec', rc: rc, ok: ok, o: craftCat === 'recent' && !craftQuery ? recentRank(rc) : (ok ? 0 : 2) });
    });
    if (craftCat === 'tool' && !craftQuery) Object.keys(WEAR).forEach(function (k) {
      var tid = +k; if (have(tid) < 1) return;
      items.push({ k: 'rep', id: tid, ok: have(REP_MAT_T(tid)) >= 1, o: have(REP_MAT_T(tid)) >= 1 ? 1 : 2.5 });
    });
    items.forEach(function (it, i) { it.i = i; });
    items.sort(function (a, b) { return a.o - b.o || a.i - b.i; });
    function same(a, b) { return a && b && a.k === b.k && (a.k === 'rep' ? a.id === b.id : a.rc === b.rc); }
    if (!items.some(function (it) { return same(it, invSel); })) invSel = items[0] || null;
    items.forEach(function (it) {
      var d = document.createElement('button'), out = it.k === 'rep' ? it.id : it.rc.out[0];
      d.className = 'rtile' + (it.k === 'lock' ? ' lockd' : (it.ok ? '' : ' no')) + (it.k === 'rep' ? ' rep' : '') + (same(it, invSel) ? ' pick' : '');
      var h = '<img src="' + ICON[out] + '" alt="">';
      if (it.k === 'rec' && it.ok && !isAdm()) { var n = craftTimes(it.rc) * it.rc.out[1]; if (n > 0) h += '<i>' + (n > 99 ? '99+' : n) + '</i>'; }
      if (it.k === 'rep') h += '<em>🔧</em>'; if (it.k === 'lock') h += '<em>🔒</em>';
      d.innerHTML = h; d.title = it.k === 'lock' ? '아직 모르는 제작법' : (it.k === 'rep' ? toolName(it.id) + ' 고치기' : B[out][0]);
      d.addEventListener('click', function (e) { e.stopPropagation(); sfx('click'); invSel = it; renderInv(); });
      list.appendChild(d);
    });
    if (!items.length) { var e = document.createElement('div'); e.className = 'bagEmpty'; e.textContent = craftQuery ? '찾는 제작법이 없어요' : (craftCat === 'recent' ? '아직 만든 것이 없어요 — 만들면 여기에 모여요' : '아직 이 분류의 제작법이 없어요'); list.appendChild(e); }
  }
  // 오른쪽 자세히: 가방에서 고른 것 / 고른 제작법
  function renderInvDetail() {
    var det = $('invDetail'); det.innerHTML = '';
    function add(tag, cls, html) { var el = document.createElement(tag); if (cls) el.className = cls; if (html !== undefined) el.innerHTML = html; det.appendChild(el); return el; }
    function btn(label, fn, parent) { var b = document.createElement('button'); b.className = 'mc'; b.textContent = label; b.addEventListener('click', function (e) { e.stopPropagation(); fn(e); }); (parent || det).appendChild(b); return b; }
    function top(id, name, sub) { add('div', 'dtop', '<span class="big"><img src="' + ICON[id] + '" alt=""></span><span><b>' + name + '</b><small>' + (sub || '') + '</small></span>'); }
    function fuelLine() { var fl = Math.floor(fuelLeft() * 2) / 2; add('div', 'dhint', '🔥 땔감: 석탄·숯 1개 = 8번 · 통나무 1개 = 1.5번 · 석탄 블록 = 72번<br><b>지금 ' + fl + '번 녹일 수 있어요</b>' + (HEAT > 0 ? ' (남은 불 ' + HEAT + ')' : '')); }
    if (invTab === 'bag') {
      var p = bagPick;
      if (!p || !p.id || !B[p.id]) {
        add('div', 'dempty', '🎒 가방 칸을 누르면 여기에 자세히 나와요.<br><br>누른 다음 <b>아래 단축 칸</b>을 누르면 손에 들 수 있어요.');
        btn('↕ 가방 정리', function () { $('bagSort').click(); });
        return;
      }
      var id = p.id, kind = { block: '블록', tool: '도구·옷', food: '먹을 것', item: '재료', deco: '꾸미기' }[bagCat(id)];
      top(id, B[id][0], kind + ' · ' + fmtN(have(id)) + '개');
      if (isTool(id) && WEAR[id] !== undefined && !isAdm()) { var f = WEAR[id] / toolMax(id); add('div', 'ddur', '<s style="width:' + Math.max(4, Math.round(f * 100)) + '%;background:' + (f > 0.5 ? '#4fd14f' : f > 0.2 ? '#e8c53a' : '#e0473a') + '"></s>'); add('div', 'dhint', '남은 힘 ' + wearLeft(id) + ' / ' + toolMax(id) + ' — 만들기 → ⛏ 도구에서 고쳐요'); }
      if (FOODS[id] !== undefined && vitalsOn()) btn('🍞 먹기 (기운 +' + FOODS[id] + ')', function () { eatItem(id); bagPick = null; renderInv(); });
      if (p.from === 'bag') {
        add('div', 'dhint', '⬇ 아래 단축 칸을 누르면 손에 들어요');
        if (!isAdm()) {
          var maxN = Math.max(1, Math.min(have(id), 64));
          if (dropAmt.id !== id) dropAmt = { id: id, n: 1 };
          dropAmt.n = Math.max(1, Math.min(maxN, dropAmt.n));
          if (maxN > 1) {   // 몇 개 버릴지: − 숫자 + · 반 · 최대
            var r = add('div', 'drow damt');
            btn('−', function () { dropAmt.n = Math.max(1, dropAmt.n - 1); renderInvDetail(); }, r);
            var lab = document.createElement('b'); lab.textContent = dropAmt.n + '개'; r.appendChild(lab);
            btn('+', function () { dropAmt.n = Math.min(maxN, dropAmt.n + 1); renderInvDetail(); }, r);
            btn('반', function () { dropAmt.n = Math.max(1, Math.floor(maxN / 2)); renderInvDetail(); }, r);
            btn('최대', function () { dropAmt.n = maxN; renderInvDetail(); }, r);
          }
          btn('🫳 ' + dropAmt.n + '개 버리기', function () { var n = dropAmt.n; bagPick = null; dropAmt = { id: 0, n: 1 }; throwItem(id, n); $('invName').textContent = B[id][0] + ' ' + n + '개를 앞에 버렸어요 — 다시 가까이 가면 주워요'; renderInv(); }).classList.add('ddrop');
        }
      } else {
        add('div', 'dhint', '다른 단축 칸을 누르면 자리를 바꿔요');
        btn('단축 칸 비우기', function () { HOTBAR[p.i] = 0; bagPick = null; saveSettings(); renderHotbar(); setSel(sel, true); $('invName').textContent = '단축 칸을 비웠어요'; renderInv(); });
      }
      add('div', 'dhint', '📍 ' + howGet(id));
      return;
    }
    var it = invSel;
    if (!it) { add('div', 'dempty', '왼쪽 제작법 그림을 누르면 재료가 여기에 나와요'); if (craftCat === 'smelt') fuelLine(); return; }
    if (it.k === 'rep') {
      var tid = it.id, mat = REP_MAT_T(tid), mx = toolMax(tid), w = WEAR[tid], nw = Math.min(mx, w + Math.ceil(mx / 4)), okR = have(mat) >= 1;
      top(tid, toolName(tid) + ' 고치기', '힘 ' + w + ' → ' + nw + ' / ' + mx);
      add('div', 'dneed' + (okR ? '' : ' lack'), '<img src="' + ICON[mat] + '" alt=""><span>' + B[mat][0] + '</span><em>' + fmtN(have(mat)) + ' / 1</em>');
      btn('🔧 고치기', function () {
        if (have(mat) < 1) { $('invName').textContent = jo(B[mat][0], '이', '가') + ' 1개 있어야 고칠 수 있어요'; sfx('click'); return; }
        take(mat, 1); if (nw >= mx) delete WEAR[tid]; else WEAR[tid] = nw;
        sfx('craft'); $('invName').textContent = toolName(tid) + '을(를) 고쳤어요 (힘 ' + nw + '/' + mx + ')'; bagChanged();
      });
      return;
    }
    var rc = it.rc;
    if (it.k === 'lock') {
      var miss = recIds(rc).filter(function (id) { return !SEEN[id]; });
      add('div', 'dtop', '<span class="big lockd"><img src="' + ICON[rc.out[0]] + '" alt=""></span><span><b>🔒 아직 몰라요</b><small>' + recStage(rc) + '단계 제작법</small></span>');
      add('div', 'dhint', '이 재료를 처음 얻으면 열려요:');
      miss.forEach(function (id) { add('div', 'dneed lack', '<img src="' + ICON[id] + '" alt=""><span>' + B[id][0] + '<br><small>' + howGet(id) + '</small></span>'); });
      addRecipePin(det, rc);
      return;
    }
    top(rc.out[0], B[rc.out[0]][0] + (rc.out[1] > 1 ? ' ×' + rc.out[1] : ''), rc.ref || '');
    rc.need.forEach(function (n) {
      var r = add('div', 'dneed' + (have(n[0]) >= n[1] ? '' : ' lack'), '<img src="' + ICON[n[0]] + '" alt=""><span>' + B[n[0]][0] + '</span><em>' + fmtN(have(n[0])) + ' / ' + n[1] + '</em>');
      r.title = '누르면 얻는 곳';
      r.addEventListener('click', function () { $('invName').textContent = '「' + B[n[0]][0] + '」 ' + howGet(n[0]) + ' (지금 ' + fmtN(have(n[0])) + '개)'; sfx('click'); });
    });
    var req = '';
    if (rc.furnace) req += '<span class="dreq' + (furnaceOK() ? '' : ' lack') + '">🔥 용광로</span>';
    if (rc.fuel) req += '<span class="dreq' + (fuelLeft(rc) >= 1 ? '' : ' lack') + '">🪵 땔감</span>';
    if (rc.table) req += '<span class="dreq' + (tableOK() ? '' : ' lack') + '">🪚 제작대</span>';
    if (rc.station) req += '<span class="dreq">' + B[rc.station][0] + ' 가까이</span>';
    if (req) add('div', '', req);
    function craftN(times) {
      if (!canCraft(rc)) {
        sfx('click');
        if (rc.furnace && !furnaceOK()) $('invName').textContent = '녹이려면 용광로가 있어야 해요. 돌 8개로 만들어 가방에 넣거나 내 땅에 놓아요';
        else if (rc.fuel && fuelLeft(rc) < 1) $('invName').textContent = '땔감이 없어요. 석탄·숯·통나무를 모아요';
        else if (rc.station) $('invName').textContent = B[rc.station][0] + ' 가까이에서 만들어요';
        else if (rc.table && !tableOK()) $('invName').textContent = '이 물건은 제작대가 있어야 만들어요. 고페르 나무 4개로 제작대를 만들어 가방에 넣거나 내 땅에 놓아요';
        else $('invName').textContent = '재료가 모자라요 — 빨간 재료를 누르면 얻는 곳을 알려 줘요';
        return;
      }
      var made = 0;
      if (!rc.fuel && room(rc.out[0]) < rc.out[1]) { sfx('click'); $('invName').textContent = '🎒 가방이 가득 차서 만들 수 없어요. 안 쓰는 것을 버리거나 궤에 넣어요'; return; }
      while (made < times && canCraft(rc) && (rc.fuel || room(rc.out[0]) >= rc.out[1])) {
        if (rc.fuel && !burnOne(rc)) break;
        rc.need.forEach(function (n) { take(n[0], n[1]); });
        if (rc.fuel) queueSmelt(rc.out[0], rc.out[1]); else give(rc.out[0], rc.out[1]);
        made++;
        if (rc.out[0] === GOPHER) { stats.crafted++; questCheck(); }
        if (rc.out[0] === PITCH && STORY.started) { STORY.s.pitch += rc.out[1]; saveStory(); }
      }
      if (made) noteRecent(rc);
      sfx('craft'); $('invName').textContent = rc.fuel ? '용광로에 넣었어요 — ' + B[rc.out[0]][0] + ' ' + (rc.out[1] * made) + '개가 하나에 ' + SMELT_SEC + '초씩 녹아요' : B[rc.out[0]][0] + ' ' + (rc.out[1] * made) + '개를 만들었어요';
      bagChanged();
    }
    var ok = canCraft(rc), times = craftTimes(rc);
    var mk = btn(rc.fuel ? '🔥 녹이기' : '🔨 만들기', function () { craftN(1); }); mk.classList.add('dmake'); if (!ok) mk.classList.add('off');
    if (rc.fuel) btn('×8 한꺼번에', function () { craftN(8); });
    else if (ok && times >= 2 && !isAdm()) btn('모두 만들기 (×' + Math.min(times, 64) + ')', function () { craftN(Math.min(times, 64)); });
    if (rc.fuel) fuelLine();
    if (rc.cat === 'wear') add('div', 'dhint', '가죽은 소·염소·낙타를, 양털은 양을 칼을 들고 누르면 얻어요. 만든 옷은 「👤 내 모습」에서 입어요.');
    addRecipePin(det, rc);
  }
  function addRecipePin(row,recipe) {
    villageButton(row,'재료 표시',function(e){
      e.stopPropagation();
      var index=RECIPES.indexOf(recipe);
      if(index<0)return;
      villageBook.recipe={id:recipe.out[0],index:index};saveVillageBook();renderMaterialGuide();
      toast('마을 수첩에 '+nameOf(recipe.out[0])+' 재료를 표시했어요');
    });
  }
  function plotHas(id) { var a = myPlot >= 0 && plotData[myPlot]; return !!a && a.indexOf(id) >= 0; }
  function furnaceOK() { return have(FURNACE) > 0 || plotHas(FURNACE) || plotHas(FURNACE_ON); }
  function tableOK() { return have(CRAFT) > 0 || plotHas(CRAFT); }
  // 녹이는 중이면 내 땅의 용광로에 불이 켜진다
  function syncFurnaces() {
    var a = myPlot >= 0 && plotData[myPlot]; if (!a) return;
    var from = JOBS.length ? FURNACE : FURNACE_ON, to = JOBS.length ? FURNACE_ON : FURNACE;
    if (a.indexOf(from) < 0) return;
    var o = plotOrigin(myPlot), A = PLOT * PLOT;
    for (var k = 0; k < a.length; k++) if (a[k] === from) {
      var y = PY0 + Math.floor(k / A), z = o.z + Math.floor(k / PLOT) % PLOT, x = o.x + k % PLOT;
      if (colAt(x, z)) setBlock(x, y, z, to);
    }
  }
  // 궤: 내 땅 안 자리마다 안에 든 것 { "x,y,z(땅 안 좌표)": {번호: 개수} }
  var CHESTS = {}, curChest = null, chestAmt = 0;   // 옮기는 양: 0 모두 · 1 반 · 2 한 개
  var AMT_NAME = ['모두', '반', '1개'];
  function amtOf(total, half) { var m = half ? 1 : chestAmt; return m === 0 ? total : m === 1 ? Math.max(1, Math.ceil(total / 2)) : 1; }
  // 칸을 길게 누르거나(휴대폰) 오른쪽 클릭하면(컴퓨터) 반만
  var holdQuiet = 0;   // 길게 누른 뒤 칸이 다시 그려지면 손을 뗄 때 새 칸이 눌린 것으로 잡히므로 잠깐 무시
  function holdable(d, tap, hold) {
    var t = null, fired = false;
    function H() { fired = true; holdQuiet = performance.now() + 600; hold(); }
    d.addEventListener('pointerdown', function () { fired = false; clearTimeout(t); t = setTimeout(H, 450); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { d.addEventListener(ev, function () { clearTimeout(t); }); });
    d.addEventListener('contextmenu', function (e) { e.preventDefault(); clearTimeout(t); if (!fired && performance.now() > holdQuiet) H(); });
    d.addEventListener('click', function () { if (fired || performance.now() < holdQuiet) { fired = false; return; } tap(); });
  }
  function chestKey(x, y, z) { var o = plotOrigin(myPlot); return (x - o.x) + ',' + (y - PY0) + ',' + (z - o.z); }
  function chestString() {
    var a = []; for (var k in CHESTS) { var c = CHESTS[k], it = []; for (var id in c) if (c[id] > 0) it.push(id + ':' + c[id]); if (it.length) a.push(k.replace(/,/g, '.') + '=' + it.join(';')); }
    return a.join('/');
  }
  function chestFromString(str) {
    CHESTS = {};
    (str || '').split('/').forEach(function (e) {
      var q = e.split('='); if (q.length !== 2) return; var key = q[0].replace(/\./g, ','), c = {};
      q[1].split(';').forEach(function (p) { var r = p.split(':'), id = +r[0], n = +r[1]; if (INV.indexOf(id) >= 0 && n > 0) c[id] = Math.min(9999, n | 0); });
      CHESTS[key] = c;
    });
  }
  function openChest(x, y, z) {
    if (myPlot < 0 || plotAt(x, z) !== myPlot) return deny('다른 사람의 궤예요');
    curChest = chestKey(x, y, z); if (!CHESTS[curChest]) CHESTS[curChest] = {};
    openPanel('chest'); renderChest(); sfx('door');
  }
  function spillChest(x, y, z) {
    if (myPlot < 0 || plotAt(x, z) !== myPlot) return;
    var key = chestKey(x, y, z), c = CHESTS[key]; if (!c) return;
    for (var id in c) dropItem(x + 0.5, y + 0.6, z + 0.5, +id, c[id]);
    delete CHESTS[key]; markDirty();
  }
  function chestItemKeys(c) {
    var keys = Object.keys(c);
    if (S.chestSorted) keys.sort(function (a,b) { return nameOf(+a).localeCompare(nameOf(+b),'ko'); });
    return keys;
  }
  function withdrawChest() {
    var c = CHESTS[curChest], moved = 0;
    if (!c || isAdm()) return;
    chestItemKeys(c).forEach(function (id) {
      var n = give(+id, c[id]);
      c[id] -= n; moved += n;
      if (c[id] <= 0) delete c[id];
    });
    $('chestName').textContent = moved ? moved + '개를 가방으로 옮겼어요' : '가방에 빈 자리가 없거나 궤가 비어 있어요';
    if (moved) { bagChanged(); markDirty(); renderChest(); }
  }
  function renderChest() {
    var c = CHESTS[curChest] || {}, g1 = $('chestGrid'), g2 = $('chestBag'); g1.innerHTML = ''; g2.innerHTML = '';
    $('chestOne').textContent = '옮기는 양: ' + AMT_NAME[chestAmt];
    if (!$('chestName').textContent) $('chestName').textContent = '칸을 길게 누르면 반만 옮겨요';
    chestItemKeys(c).forEach(function (k) {
      var id = +k; if (!(c[id] > 0)) return;
      var d = document.createElement('button'); d.className = 'islot'; d.innerHTML = slotHTML(id, c[id]); d.title = B[id][0];
      function out(half) { var n = give(id, amtOf(c[id], half)); if (!n) { $('chestName').textContent = '🎒 가방이 가득 찼어요'; sfx('click'); return; } c[id] -= n; if (c[id] <= 0) delete c[id]; $('chestName').textContent = B[id][0] + ' ' + n + '개를 가방으로'; sfx('click'); markDirty(); bagChanged(); renderChest(); }
      holdable(d, function () { out(false); }, function () { out(true); });
      g1.appendChild(d);
    });
    if (!g1.children.length) g1.innerHTML = '<span class="empty">비어 있어요 — 아래 가방에서 눌러 넣어요</span>';
    function put(id, half) {
      if (have(id) < 1) return;
      if (isTool(id)) { $('chestName').textContent = '도구는 가방에 넣고 다녀요'; sfx('click'); return; }
      if (!c[id] && Object.keys(c).length >= 27) { $('chestName').textContent = '궤가 가득 찼어요(27가지)'; return; }
      var n = amtOf(have(id), half); take(id, n); c[id] = (c[id] || 0) + n; CHESTS[curChest] = c;
      $('chestName').textContent = B[id][0] + ' ' + n + '개를 궤에'; sfx('click'); markDirty(); bagChanged(); renderChest();
    }
    INV.forEach(function (id) {
      if (have(id) < 1) return;
      var d = document.createElement('button'); d.className = 'islot'; d.innerHTML = slotHTML(id, have(id)); d.title = B[id][0];
      holdable(d, function () { put(id); }, function () { put(id, true); });
      g2.appendChild(d);
    });
    if (!g2.children.length) g2.innerHTML = '<span class="empty">가방이 비어 있어요</span>';
    var g3 = $('chestHot'); if (g3) { g3.innerHTML = '';
      HOTBAR.forEach(function (id, i) {
        var d = document.createElement('button'); d.className = 'islot' + (i === sel ? ' on' : '') + (id ? '' : ' empty'); d.innerHTML = (id ? slotHTML(id, hotCount(id)) : '') + '<u class="num">' + (i + 1) + '</u>'; d.title = (i + 1) + '번 칸: ' + nameOf(id);
        holdable(d, function () { if (id) put(id); else sfx('click'); }, function () { if (id) put(id, true); });
        g3.appendChild(d);
      });
    }
  }
  function smeltState() {
    var now = Date.now(), j = JOBS[0]; if (!j) return null;
    var el = Math.max(0, now - j.s), per = SMELT_SEC * 1000, done = Math.min(j.n, Math.floor(el / per));
    var left = 0; JOBS.forEach(function (q) { left += q.n - q.g; });
    return { j: j, done: done, frac: now < j.s ? 0 : Math.min(1, (el % per) / per), left: left };
  }
  function updateSmeltUI() {
    var st = smeltState(), sj = $('smeltJobs'), hud = $('smeltHud');
    if (!hud) { hud = document.createElement('div'); hud.id = 'smeltHud'; document.body.appendChild(hud); }
    if (!st) { if (sj) sj.innerHTML = ''; hud.style.display = 'none'; return; }
    var name = B[st.j.o][0], pct = Math.round(st.frac * 100);
    if (sj) sj.innerHTML = '<div class="smrow"><img src="' + ICON[st.j.o] + '" alt=""> 녹이는 중: ' + name + ' ' + st.done + ' / ' + st.j.n + (JOBS.length > 1 ? ' · 뒤에 ' + (JOBS.length - 1) + '가지 더' : '') + '<span class="smbar"><s style="width:' + pct + '%"></s></span></div>';
    hud.innerHTML = '🔥 ' + name + ' <span class="smbar"><s style="width:' + pct + '%"></s></span> ' + st.done + '/' + st.j.n;
    hud.style.display = ui === 'play' ? 'flex' : 'none';
  }
  function smeltTick() {
    var now = Date.now(), changed = false;
    JOBS.forEach(function (j) {
      var done = Math.min(j.n, Math.max(0, Math.floor((now - j.s) / (SMELT_SEC * 1000))));
      if (done > j.g) {
        var got2 = give(j.o, done - j.g);   // 가방이 차면 용광로에 남겨 두었다가 자리가 나면 꺼냄
        for (var k = 0; k < got2 && ui === 'play'; k++) pickup(j.o);
        j.g += got2; if (got2) changed = true; if (j.o === ING_FE) partyAdd('iron', got2); if (got2 < done - (j.g - got2)) bagFull();
      }
    });
    var fin = JOBS.filter(function (j) { return j.g >= j.n; });
    if (fin.length) { JOBS = JOBS.filter(function (j) { return j.g < j.n; }); fin.forEach(function (j) { toast('🔥 ' + B[j.o][0] + ' ' + j.n + '개가 다 녹았어요'); }); sfx('craft'); }
    if (changed) { saveJobs(); bagChanged(); }
    updateSmeltUI(); syncFurnaces();
  }
  setInterval(smeltTick, 250);
  function renderDex() {
    var g = $('dexGrid'); if (!g) return; g.innerHTML = '';
    $('dexCount').textContent = '도감 ' + dexCount() + ' / ' + (CREATURE_KEYS.length + DEX_MATS.length) + (DEX.done ? ' — 다 채웠어요!' : '') + '  ·  동물 다 만나면 +3, 재료 다 모으면 +2 달란트';
    CREATURE_KEYS.forEach(function (k) {
      var c = CREATURE[k], got = DEX['c' + k], d = document.createElement('button');
      d.className = 'dslot' + (got ? '' : ' unk'); d.innerHTML = got ? '<span class="em">' + c.emoji + '</span><small>' + c.name + '</small>' : '<span class="em">?</span><small>동물</small>';
      d.addEventListener('click', function () { if (got) { closePanel(); showCard(k); } else $('invName').textContent = '동물을 눌러 말씀 카드를 보면 도감에 적혀요'; });
      g.appendChild(d);
    });
    DEX_MATS.forEach(function (m) {
      var got = DEX['m' + m], d = document.createElement('button');
      d.className = 'dslot' + (got ? '' : ' unk'); d.innerHTML = got ? '<img src="' + ICON[m] + '" alt=""><small>' + B[m][0] + '</small>' : '<span class="em">?</span><small>재료</small>';
      d.addEventListener('click', function () { $('invName').textContent = got ? B[m][0] + ' — 캐서 모았어요' : '숲·산·호수에서 캐 보면 도감에 적혀요'; });
      g.appendChild(d);
    });
    // 넓힌 도감: 광석 · 보석 · 식물과 열매 · 성경 인물 · 밤하늘
    var more = 0, moreAll = 0;
    function slot(key, gotHtml, unkLabel, hint, onGot) {
      var got = !!DEX[key], d = document.createElement('button'); moreAll++; if (got) more++;
      d.className = 'dslot' + (got ? '' : ' unk'); d.innerHTML = got ? gotHtml : '<span class="em">?</span><small>' + unkLabel + '</small>';
      d.addEventListener('click', function () { if (got && onGot) { closePanel(); onGot(); } else $('invName').textContent = hint; });
      g.appendChild(d);
    }
    function head(t) { var h = document.createElement('div'); h.className = 'dhead'; h.textContent = t; h.style.cssText = 'grid-column:1/-1;flex-basis:100%;width:100%;margin:8px 0 2px;font-size:12px;opacity:.8'; g.appendChild(h); }
    head('⛏ 광석');
    dexOres().forEach(function (o) { slot('o' + o, '<img src="' + ICON[o] + '" alt=""><small>' + B[o][0] + '</small>', '광석', '땅속 깊이 곡괭이로 캐 보면 적혀요'); });
    head('💎 열두 보석(계 21:19-20)');
    dexGems().forEach(function (i) { var it = gemItem(i); slot('g' + i, '<img src="' + (ICON[it] || ICON[gemOre(i)]) + '" alt=""><small>' + GEMS[i][0] + '</small>', '보석', '지역마다 다른 깊이에 아주 드물게 있어요'); });
    head('🌿 식물과 열매');
    dexPlants().forEach(function (pId) { slot('p' + pId, '<img src="' + ICON[pId] + '" alt=""><small>' + B[pId][0] + '</small>', '식물', '들에서 캐거나 밭에서 거두면 적혀요'); });
    head('👤 방주의 사람들');
    DEX_PEOPLE.forEach(function (nm, i) {
      slot('n' + i, '<span class="em">👤</span><small>' + nm + '</small>', '사람', '방주 둘레와 방주 안에서 말을 걸어 보세요', function () { var n = NPCS.filter(function (x) { return x.d.name === nm; })[0]; if (n) showNpc(n); });
    });
    head('🌌 밤하늘');
    STAR_VERSES.forEach(function (v, i) { slot('s' + i, '<span class="em">' + v[0] + '</span><small>' + v[1] + '</small>', '별', '밤에 하늘을 한참 올려다보면 적혀요', function () { showVerseCard(v[0], v[1], v[3], v[2]); }); });
    $('dexCount').textContent += '  ·  넓힌 도감 ' + more + ' / ' + moreAll;
  }
  // 버튼 크기(11/20): 작게·보통·크게 — 오른쪽 버튼·단축 칸은 zoom(화면 모서리에서 떨어진 거리도 같이 커져 겹치지 않음), 방향키는 왼쪽 아래 기준 확대
  var BTN_SIZES = [['작게', 0.84], ['보통', 1], ['크게', 1.2]];
  function applyBtnSize() {
    var k = (BTN_SIZES[S.btnSize === undefined ? 1 : S.btnSize] || BTN_SIZES[1])[1];
    ['btnJump', 'btnDown', 'btnRide', 'btnFly', 'btnRun', 'btnSneak', 'touchAction', 'slabMode', 'hotbar'].forEach(function (id) { var el = $(id); if (el) el.style.zoom = k === 1 ? '' : String(k); });
    var dp = $('dpad'); if (dp) { dp.style.transformOrigin = 'left bottom'; dp.style.transform = k === 1 ? '' : 'scale(' + k + ')'; }
    fitBottomBar(k);
  }
  // 단축 칸·체력 줄이 방향키와 오른쪽 버튼 사이에 들어가게(작은 휴대폰 가로)
  function fitBottomBar(k) {
    var hb = $('hotbar'), vt = $('vitals'), dp = $('dpad'); if (!hb || !dp) return;
    k = k || +(hb.style.zoom || 1);
    if (!isTouch || innerWidth < innerHeight) { hb.style.maxWidth = ''; if (vt) vt.style.maxWidth = ''; return; }
    var r = dp.getBoundingClientRect(), avail = innerWidth - 2 * (r.right + 8);
    hb.style.maxWidth = Math.max(220, avail) / k + 'px'; if (vt) vt.style.maxWidth = Math.max(220, avail) + 'px';
  }
  window.addEventListener('resize', function () { setTimeout(function () { fitBottomBar(); }, 120); });
  // ── 건의하기(11/20): 불편한 점·바라는 점을 관리자에게(300자, 1분에 한 번·하루 10번) ──
  function fbBox(title) {
    var old = $('fbBox'); if (old) old.remove();
    if (lockOn) { try { document.exitPointerLock(); } catch (e) {} }
    var box = document.createElement('div'); box.id = 'fbBox';
    box.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:70;background:rgba(16,16,24,.96);border:2px solid #000;box-shadow:inset 0 0 0 2px #5a4a8a;padding:12px 14px;display:flex;flex-direction:column;gap:8px;width:min(520px,92vw);max-height:86vh;overflow:auto;color:#fff';
    var h = document.createElement('b'); h.textContent = title; h.style.cssText = 'font-size:16px;color:#ffe27a'; box.appendChild(h);
    document.body.appendChild(box); return box;
  }
  function fbBtn(parent, label, fn) { var b = document.createElement('button'); b.className = 'mc'; b.textContent = label; b.addEventListener('click', function (e) { e.stopPropagation(); fn(); }); parent.appendChild(b); return b; }
  function openFeedback() {
    var box = fbBox('📮 건의하기');
    var p = document.createElement('div'); p.textContent = '불편한 점, 고장 난 곳, 있었으면 하는 것을 적어 주세요. 전도사님께 바로 전해져요.'; p.style.fontSize = '13px'; box.appendChild(p);
    var ta = document.createElement('textarea'); ta.maxLength = 300; ta.rows = 4; ta.placeholder = '예: 수레가 비탈에서 멈춰요 / 낚시를 더 하고 싶어요'; ta.setAttribute('aria-label', '건의할 내용'); ta.style.cssText = 'font:inherit;font-size:14px;padding:6px;resize:vertical;width:100%;box-sizing:border-box'; box.appendChild(ta);
    var cnt = document.createElement('small'); cnt.textContent = '0 / 300'; box.appendChild(cnt);
    ta.addEventListener('input', function () { cnt.textContent = ta.value.length + ' / 300'; });
    var row = document.createElement('div'); row.style.cssText = 'display:flex;gap:8px;justify-content:flex-end'; box.appendChild(row);
    fbBtn(row, '닫기', function () { box.remove(); });
    fbBtn(row, '보내기', function () {
      if (!client || !me || me.id === 'test') { toast('로그인하면 건의를 보낼 수 있어요'); return; }
      client.rpc('send_ark_feedback', { p_body: ta.value, p_x: Math.floor(P.x), p_z: Math.floor(P.z), p_ua: navigator.userAgent }).then(function (r) {
        var d = r && r.data || {}, why = { empty: '두 글자 이상 적어 주세요', long: '300자까지 쓸 수 있어요', slow: '1분 뒤에 다시 보내 주세요', many: '오늘은 10번까지 보낼 수 있어요', login: '로그인하면 보낼 수 있어요' }[d.error];
        if (why) return toast('📮 ' + why);
        box.remove(); toast('📮 고마워요! 건의를 보냈어요');
      }, function () { toast('📮 보내지 못했어요. 조금 뒤에 다시 해 주세요'); });
    });
    setTimeout(function () { ta.focus(); }, 50);
  }
  function openFeedbackAdmin(all) {
    if (!NET.admin || !client) return;
    var box = fbBox('📮 건의함' + (all ? ' (모두)' : ' (아직 안 본 것)'));
    var top = document.createElement('div'); top.style.cssText = 'display:flex;gap:8px'; box.appendChild(top);
    fbBtn(top, all ? '안 본 것만' : '모두 보기', function () { openFeedbackAdmin(!all); });
    fbBtn(top, '닫기', function () { box.remove(); });
    var list = document.createElement('div'); list.textContent = '불러오는 중…'; box.appendChild(list);
    client.rpc('list_ark_feedback', { p_all: !!all }).then(function (r) {
      list.textContent = ''; var rows = r && r.data || [];
      if (!rows.length) { list.textContent = '건의가 없어요'; return; }
      rows.forEach(function (f) {
        var it = document.createElement('div'); it.style.cssText = 'border-top:1px solid #444;padding:6px 0;font-size:13px' + (f.handled ? ';opacity:.5' : '');
        var head = document.createElement('div'); head.style.color = '#9fd0ff'; head.textContent = (f.nick || '?') + ' · ' + new Date(f.at).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) + (f.x !== null ? ' · 자리 ' + f.x + ',' + f.z : '');
        var txt = document.createElement('div'); txt.textContent = f.body; txt.style.whiteSpace = 'pre-wrap';
        it.append(head, txt);
        if (!f.handled) fbBtn(it, '본 것으로', function () { client.rpc('mark_ark_feedback', { p_id: f.id, p_handled: true }).then(function () { it.style.opacity = '.5'; }); });
        list.appendChild(it);
      });
    }, function () { list.textContent = '불러오지 못했어요'; });
  }
  function updateMenuLabels() {
    if ($('mNews') && NEWS) { var nl = newsLeft(); $('mNews').textContent = '✨ 새 기능' + (S.newsSeen !== NEWS_VER ? ' (새로 ' + NEWS.length + ')' : (nl ? ' · ' + (NEWS.length - nl) + '/' + NEWS.length : ' ✅')); }
    if ($('mBtnSize')) $('mBtnSize').textContent = '버튼 크기: ' + (BTN_SIZES[S.btnSize === undefined ? 1 : S.btnSize] || BTN_SIZES[1])[0];
    $('mLight').textContent = '가벼운 화면: ' + (S.lightMode ? '켬' : '끔');
    $('mLight').setAttribute('aria-pressed', String(!!S.lightMode));
    $('mMapVisible').textContent = '지도에 내 위치: ' + (S.mapVisible === false ? '숨김' : '표시');
    $('mView').textContent = '시점: ' + VIEW_NAMES[S.view];
    $('mSound').textContent = '소리: ' + (S.sound ? '켬' : '끔');
    $('mMusic').textContent = '음악: ' + (S.music === false ? '끔' : '켬');
    $('mShadow').textContent = '어둠의 그림자: ' + (S.shadows === false ? '안 나옴' : '나옴');
    $('mAutoJump').textContent = '자동 점프: ' + (S.autoJump === false ? '끔' : '켬');
    $('mAim').textContent = '겨누기: ' + (S.aim === 'cross' ? '가운데 십자선' : '손가락 자리');
    $('mSensLabel').textContent = '둘러보기 속도: ' + Math.round(S.sens * 100) + '%';
    $('mSens').value = Math.round(S.sens * 100);
    document.body.classList.toggle('aimcross', S.aim === 'cross');
  }
  function bindUI() {
    function on(id, fn) { $(id).addEventListener('click', function (e) { e.stopPropagation(); fn(); }); }
    on('tStart', startGame);
    on('tBook', function () { openPanel('book'); sfx('click'); });
    on('tHelp', function () { openPanel('help'); sfx('click'); });
    on('btnPause', function () { openPanel('pause'); renderGoal(); fetchGoal(true); sfx('click'); });
    on('btnView', cycleView);
    // 접고 펴기: 위쪽 버튼 줄 · 처음 안내 · 작은 지도(이 기기에 기억)
    function applyFold() {
      var f = S.fold || {};
      $('topRight').classList.toggle('fold', !!f.top); document.body.classList.toggle('topfold', !!f.top);
      $('btnFold').querySelector('span').textContent = f.top ? '◀' : '▶'; $('btnFold').querySelector('small').textContent = f.top ? '펴기' : '접기';
      document.body.classList.toggle('qfold', !!f.q);   // 안내를 접으면 상자는 숨기고 위쪽 줄의 📜 버튼만
      document.body.classList.toggle('mapfold', !!f.map);
      mapCapLabel = f.map ? '🗺 지도 펴기' : '지도<b class="k">M</b>'; renderMapCap(true);
    }
    function toggleFold(k) { S.fold = S.fold || {}; S.fold[k] = !S.fold[k]; saveSettings(); applyFold(); sfx('click'); }
    on('btnFold', function () { toggleFold('top'); });
    on('qFold', function () { toggleFold('q'); });
    on('qMini', function () { toggleFold('q'); });
    on('bagSort', function () {   // 블록 → 모양 → 재료 → 도구 순, 같은 종류는 번호 순
      var ids = BAGSLOT.filter(function (v) { return v; }), rank = function (id) { return isTool(id) ? 3 : (isItem(id) ? 2 : (isShape(id) ? 1 : 0)); };
      ids.sort(function (a, b) { return rank(a) - rank(b) || a - b; });
      for (var i = 0; i < BAGSLOT.length; i++) BAGSLOT[i] = ids[i] || 0;
      saveSettings(); bagPick = null; renderInv(); sfx('click'); $('invName').textContent = '가방을 정리했어요';
    });
    on('mTour', function () { startTour(); });
    on('chatWave', function () { closePanel(); waveHand(); });
    if (FESTIVE) { var adv = document.createElement('button'); adv.id = 'mAdvent'; adv.className = 'mc'; adv.textContent = '🕯 대림절 말씀 달력'; var grid0 = document.querySelector('#pause .grid3'), last = grid0 && grid0.querySelector('a'); if (grid0) grid0.insertBefore(adv, last); on('mAdvent', function () { window.open('advent.html', '_blank'); }); }
    // 게임 메뉴: 버튼을 묶음 탭(게임·이동·함께·설정)으로 — 돌아가기·나가기는 늘 보임
    (function () {
      var grid = document.querySelector('#pause .grid3'); if (!grid) return;
      var G = { game: ['mNews', 'mQuest', 'mFeedback', 'mBook', 'mStory', 'mVillageWork', 'mPhoto', 'mLook', 'mMap', 'mTour', 'mTutorial', 'mPractice', 'mHelp'], go: ['mArk', 'mHome', 'mForest', 'mHill', 'mLake'],
        together: ['goalCard', 'mParty', 'mFriends', 'mVisit', 'mRevert', 'mWatch', 'mFeedbackAdmin'], settings: ['mLight', 'mBtnSize', 'mView', 'mSound', 'mMusic', 'mShadow', 'mAutoJump', 'mMapVisible', 'mAim'] };
      var NAMES = { game: '🎮 게임', go: '🧭 이동', together: '🤝 함께', settings: '⚙ 설정' };
      Object.keys(G).forEach(function (g) { G[g].forEach(function (id) { var el = $(id); if (el) el.setAttribute('data-g', g); }); });
      var sl = grid.querySelector('.slider'); if (sl) sl.setAttribute('data-g', 'settings');
      Array.prototype.forEach.call(grid.children, function (el) { if (!el.hasAttribute('data-g') && el.id !== 'mResume' && el.tagName !== 'A') el.setAttribute('data-g', 'game'); });
      var tabs = document.createElement('div'); tabs.id = 'pauseTabs';
      function pick(g) {
        S.pauseTab = g; Array.prototype.forEach.call(grid.children, function (el) { el.classList.toggle('gon', el.getAttribute('data-g') === g); });
        Array.prototype.forEach.call(tabs.children, function (b) { b.classList.toggle('on', b.getAttribute('data-g') === g); });
      }
      Object.keys(NAMES).forEach(function (g) {
        var b = document.createElement('button'); b.className = 'tab'; b.setAttribute('data-g', g); b.textContent = NAMES[g];
        b.addEventListener('click', function (e) { e.stopPropagation(); pick(g); saveSettings(); sfx('click'); }); tabs.appendChild(b);
      });
      grid.parentNode.insertBefore(tabs, grid); pick(G[S.pauseTab] ? S.pauseTab : 'game');
    })();
    on('mapCap', function () { toggleFold('map'); });
    on('btnRotate', rotateScreen);
    applyFold();
    on('restUp', function () { if (cartRide) leaveCart(); else standFromFurniture(); });
    on('forestCancel', cancelForestRoute);
    on('go_frontier', function(){ startFrontierGuide(FRONTIER_ENTRY,'자유 개척지'); });
    on('go_cave', function(){ startFrontierGuide(FRONTIER_CAVE[0],'바위굴 입구'); });
    on('buildRotate', rotateBuild);
    on('buildUndo', undoBuild);
    on('frontierDeposit',function(){changeFrontierStock(true);});
    on('frontierTake',function(){changeFrontierStock(false);});
    on('frontierChestDone',closePanel);
    on('btnBag', function () { openPanel('inv'); sfx('click'); });
    on('btnChat', openChat);
    on('chatSend', sendChat);
    on('chatDone', function () { $('chatInput').blur(); closePanel(); });
    $('chatInput').addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); sendChat(); } });
    on('mResume', resume);
    on('mBook', function () { openPanel('book'); sfx('click'); });
    on('mHelp', function () { openPanel('help'); sfx('click'); });
    on('mArk', function () { travel('ark'); });
    on('mFriends', openFriends);
    on('friendsDone', closePanel);
    on('friendsSend', function () { friendRequest($('friendsNick').value); });
    $('friendsNick').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); friendRequest(this.value); }
    });
    on('qSkip', function () { if (tutorialStep < 9) finishTutorial(false); });
    on('mTutorial', function () {
      tutorialStep = 0; tutorialWalk = tutorialLook = false; tutorialDoor = null;
      tutorialSave(); resume();
    });
    on('mPractice', openPractice);
    on('mVillageWork', function () { openVillageWork('build'); });
    on('villageDone', function () { closePanel(); });
    on('mapPinNow', function () {
      var field=$('mapPinLabel'), name=field.value.trim();
      if(addVillagePin(name||placeName(),P.x,P.z)) {field.value='';drawMap($('bigmapc'),true);}
    });
    on('mapPinRemove', function () {
      if (!villageBook.target) return;
      villageBook.pins = villageBook.pins.filter(function (pin) { return pin.id !== villageBook.target; });
      villageBook.target = ''; saveVillageBook(); renderPins();
    });
    $('mapPins').addEventListener('change', function () { villageBook.target = this.value; saveVillageBook(); renderPins(); });
    on('chestSort', function () {
      var items = BAGSLOT.filter(Boolean);
      items.sort(function (a,b) { return nameOf(a).localeCompare(nameOf(b),'ko'); });
      BAGSLOT = items; S.chestSorted = true; saveSettings(); renderChest();
    });
    on('chestTakeAll', function () { withdrawChest(); });
    on('practiceDoor', function () { practiceStep = 1; renderPractice(); });
    on('practiceWalk', function () { practiceStep = 2; renderPractice(); });
    on('practiceHalf', function () { practiceUpper = !practiceUpper; renderPractice(); });
    on('practiceTile', function () { practiceHalves |= practiceUpper ? 2 : 1; if (practiceHalves === 3) practiceStep = 3; renderPractice(); });
    on('practiceMap', function () { practiceStep = 4; renderPractice(); });
    on('practiceSkip', finishPractice);
    on('practiceDone', finishPractice);
    on('mLight', function () { S.lightMode = !S.lightMode; if (!S.lightMode && S.autoLit) S.autoLight = false; S.autoLit = false; applyLightMode(); saveSettings(); updateMenuLabels(); });   // 자동으로 켠 것을 사람이 끄면 다시 자동으로 켜지 않음
    on('mBtnSize', function () { S.btnSize = ((S.btnSize === undefined ? 1 : S.btnSize) + 1) % 3; applyBtnSize(); saveSettings(); updateMenuLabels(); sfx('click'); newsMark('btn'); });
    on('mNews', function () { openVillageWork('news'); });
    on('mFeedback', function () { openFeedback(); });
    on('mQuest', function () { openQuests(); });
    on('advChip', function () { openQuests('today'); });
    on('mFeedbackAdmin', function () { openFeedbackAdmin(); });
    applyBtnSize();
    on('touchAction', function () { if (isTouch && ui === 'play' && !isBowId(HOTBAR[sel])) { tapAt(); mobileHudAt = 0; } });
    (function () { var ta = $('touchAction'); if (!ta) return;
      ta.addEventListener('pointerdown', function () { if (ui === 'play' && isBowId(HOTBAR[sel])) bowStart(); });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) { ta.addEventListener(ev, function (e) { if (bowDraw) { if (e.type === 'pointerup') bowRelease(screenDir()); else bowCancel(); } }); }); })();
    on('slabMode', function () {
      slabMode = (slabMode + 1) % SLAB_NAMES.length;
      $('slabMode').textContent = '반 블록: ' + SLAB_NAMES[slabMode];
      mobileHudAt = 0;
    });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', fitMobileKeyboard);
    }
    on('mHome', guideHome);
    on('mForest', function () { travel('forest'); });
    on('mHill', function () { travel('hill'); });
    on('mLake', function () { travel('lake'); });
    on('mView', function () { S.view = (S.view + 1) % 3; saveSettings(); updateMenuLabels(); sfx('click'); });
    on('mPhoto', function () { savePhoto(); });
    on('mSound', function () { S.sound = !S.sound; saveSettings(); updateMenuLabels(); sfx('click'); });
    on('mAim', function () { S.aim = S.aim === 'cross' ? 'finger' : 'cross'; saveSettings(); updateMenuLabels(); sfx('click'); });
    $('mSens').addEventListener('input', function () { S.sens = +this.value / 100; saveSettings(); updateMenuLabels(); });
    on('bookDone', function () { closePanel(); });
    on('helpDone', function () { closePanel(); });
    on('invDone', function () { closePanel(); });
    on('chestDone', function () { closePanel(); });
    on('chestOne', function () { chestAmt = (chestAmt + 1) % 3; renderChest(); sfx('click'); });
    on('tabBag', function () { invTab = lastBC; renderInv(); sfx('click'); });
    on('tabDex', function () { invTab = 'dex'; renderInv(); sfx('click'); });
    $('craftQ').addEventListener('input', function () { craftQuery = this.value.trim(); invSel = null; renderInv(); });
    $('craftStage').addEventListener('click', function () { $('invName').textContent = this.title + ' · 재료를 처음 얻으면 그 재료로 만드는 법이 열려요'; sfx('click'); });
    on('tLook', function () { openLooks(); });
    on('btnLook', function () { openLooks(); });
    on('mLook', function () { openLooks(); });
    on('mRotate', function () { rotateScreen(); });
    on('mQBox', function () { closePanel(); toggleFold('q'); });
    on('tipsDone', function () { try { localStorage.setItem('arkVillage.tips', '1'); } catch (e) {} resume(); });
    var br = $('btnRun');
    br.addEventListener('touchstart', function (e) { setRun(!runLock, 'btn'); e.preventDefault(); }, { passive: false });
    br.addEventListener('click', function () { setRun(!runLock, 'btn'); });
    on('mLook', function () { openLooks(); });
    on('looksDone', function () { closePanel(); });
    on('cardClose', function () { $('card').classList.remove('show'); });
    on('mapc', function () { openPanel('map'); drawMap($('bigmapc'), true); sfx('click'); });
    on('mapDone', function () { closePanel(); });
    on('mapX', function () { closePanel(); });
    on('mMapVisible', function () { S.mapVisible = S.mapVisible === false; NET.sentKey = ''; saveSettings(); updateMenuLabels(); });
    $('bigmapc').addEventListener('click', selectMapPerson);
    on('mapFriend', function () {
      var nick = NET.names[selectedMapPeer]; if (nick && canRequestMapFriend(selectedMapPeer)) friendRequest(nick);
    });
    on('mMap', function () { openPanel('map'); drawMap($('bigmapc'), true); sfx('click'); });
    ['ark', 'forest', 'hill', 'lake'].forEach(function (w) { on('go_' + w, function () { travel(w); }); });
    on('go_home', guideHome);
    ['sea', 'desert', 'ararat', 'commons', 'patmos', 'malta', 'cyprus'].forEach(function (w) { var b = $('go_' + w); if (b) on('go_' + w, function () { travel(w); }); });
    on('mMusic', function () { S.music = S.music === false; saveSettings(); updateMenuLabels(); sfx('click'); });
    on('mRevert', adminRevertCommons);
    on('mWatch', openAdminWatch);
    on('mStory', openStory); on('mParty', openParty); on('partyDone', function () { closePanel(); }); on('storyDone', function () { closePanel(); }); on('storyStart', function () { closePanel(); startStory(); });
    on('endingDone', function () { closePanel(); toast('🏙 본향에 이르렀어요 — 성 안을 거닐어 보세요'); });
    on('mAutoJump', function () { S.autoJump = S.autoJump === false; saveSettings(); updateMenuLabels(); sfx('click'); });
    on('go_visit', openVisit); on('mVisit', openVisit);
    on('visitDone', function () { closePanel(); });
    $('visitShow').addEventListener('change', saveShowcase); $('visitIntro').addEventListener('change', saveShowcase);
    on('mShadow', function () { S.shadows = S.shadows === false; saveSettings(); updateMenuLabels(); sfx('click'); });
    on('tabAch', function () { invTab = 'ach'; renderInv(); sfx('click'); });
    var bs = $('btnSneak');
    bs.addEventListener('touchstart', function (e) { sneakLock = !sneakLock; e.preventDefault(); }, { passive: false });
    bs.addEventListener('click', function () { sneakLock = !sneakLock; });
    var bj = $('btnJump'), bd = $('btnDown');
    bj.addEventListener('touchstart', function (e) { jumpPress(); e.preventDefault(); }, { passive: false });
    bj.addEventListener('touchend', function (e) { jumpHeld = false; e.preventDefault(); });
    bj.addEventListener('touchcancel', function () { jumpHeld = false; });
    bd.addEventListener('touchstart', function (e) { flyDown = true; e.preventDefault(); }, { passive: false });
    bd.addEventListener('touchend', function (e) { flyDown = false; e.preventDefault(); });
    bd.addEventListener('touchcancel', function () { flyDown = false; });
    $('btnFly').addEventListener('touchstart', function (e) { toggleFly(); e.preventDefault(); }, { passive: false });
    $('btnFly').addEventListener('click', toggleFly);
    $('btnRide').addEventListener('touchstart', function (e) { dismount(); e.preventDefault(); }, { passive: false });
    $('btnRide').addEventListener('click', function () { dismount(); });
    updateMenuLabels();
  }

