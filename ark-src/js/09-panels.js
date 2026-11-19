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
    if (p >= 0) return p === myPlot ? '내 땅 (' + (p + 1) + '번)' : (p + 1) + '번 땅' + (plotOwners[p] ? '' : ' · 빈 땅');
    var reg = region(x, z);
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
  function renderHotbar() {
    var bar = $('hotbar'); bar.innerHTML = '';
    HOTBAR.forEach(function (id, i) {
      var d = document.createElement('button'); d.className = 'slot' + (i === sel ? ' on' : ''); d.title = nameOf(id) + ' (' + (i + 1) + ')'; d.innerHTML = (id ? slotHTML(id, hotCount(id)) : '') + '<u class="num">' + (i + 1) + '</u>';
      d.addEventListener('click', function () { setSel(i); sfx('click'); });
      bar.appendChild(d);
    });
    var more = document.createElement('button'); more.className = 'slot more'; more.innerHTML = '🎒<small>가방</small>'; more.title = '가방·만들기 (E)';
    more.addEventListener('click', function () { openPanel('inv'); sfx('click'); });
    bar.appendChild(more);
  }
  var invTab = 'bag', craftCat = 'block', bagPick = null, craftQuery = '';
  function renderInv() {
    var dr = $('dropRow'); if (dr) dr.hidden = !(bagPick && bagPick.id && INV.indexOf(bagPick.id) >= 0);
    $('tabBag').classList.toggle('on', invTab === 'bag'); $('tabCraft').classList.toggle('on', invTab === 'craft'); $('tabDex').classList.toggle('on', invTab === 'dex');
    $('bagView').style.display = invTab === 'bag' ? '' : 'none'; $('craftView').style.display = invTab === 'craft' ? '' : 'none'; $('dexView').style.display = invTab === 'dex' ? '' : 'none';
    $('achView').style.display = invTab === 'ach' ? '' : 'none'; $('tabAch').classList.toggle('on', invTab === 'ach'); if (invTab === 'ach') renderAch();
    $('hotClear').style.display = bagPick && bagPick.from === 'hot' ? '' : 'none';
    renderDex();
    var grid = $('invGrid'), row = $('invHot'), list = $('craftList'); grid.innerHTML = ''; row.innerHTML = ''; list.innerHTML = '';
    // 가방: 가진 것만 칸에. 눌러서 집고 → 다른 가방 칸(자리 바꾸기)이나 아래 단축 칸(넣기)을 누른다
    syncBagSlots();
    function info(id) { return B[id][0] + ' ' + fmtN(have(id)) + '개' + (isTool(id) && !isAdm() ? ' · 남은 힘 ' + wearLeft(id) + '/' + toolMax(id) : ''); }
    var SC = slotCounts();
    $('bagUse').textContent = isAdm() ? '관리자 · 모두 ∞' : usedSlots() + ' / ' + BAG_SLOTS + '칸 · 한 칸에 ' + STACK + '개까지';
    $('bagDrop').style.display = bagPick && bagPick.from === 'bag' && !isAdm() ? '' : 'none';
    BAGSLOT.forEach(function (id, i) {
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
        $('invName').textContent = info(id) + ' — 집었어요 → 아래 단축 칸을 누르면 넣고, 다른 가방 칸을 누르면 자리를 바꿔요';
      });
      grid.appendChild(d);
    });
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
        if (id) { bagPick = { from: 'hot', i: i, id: id }; $('invName').textContent = (i + 1) + '번 칸 ' + info(id) + ' — 집었어요 → 다른 단축 칸을 누르면 자리 바꾸기, 가방 칸을 누르면 이 칸 비우기'; }
        else $('invName').textContent = (i + 1) + '번 칸은 비어 있어요. 가방에서 넣을 것을 먼저 눌러요';
        renderInv();
      });
      row.appendChild(d);
    });
    ['block', 'shape', 'tool', 'smelt', 'wear'].forEach(function (c) { var b = $('cc_' + c); if (b) b.classList.toggle('on', craftCat === c); });
    if (craftCat === 'wear') {
      var wi = document.createElement('div'); wi.className = 'fuelinfo';
      wi.innerHTML = '🪚 옷은 <b>제작대</b>가 가방에 있거나 내 땅에 놓여 있어야 만들어요' + (tableOK() ? ' — <b>지금 만들 수 있어요</b>' : '') + '. 가죽은 소·염소·낙타를, 양털은 양을 칼을 들고 누르면 얻어요. 만든 옷은 손에 들고 누르거나 「👤 내 모습」에서 입어요.';
      list.appendChild(wi);
    }
    if (craftCat === 'smelt') {
      var fi = document.createElement('div'); fi.className = 'fuelinfo';
      var fl = Math.floor(fuelLeft() * 2) / 2;
      fi.innerHTML = '🔥 땔감: 석탄·숯 1개 = 8번 · 통나무 1개 = 1.5번 · 석탄 블록 = 72번 — <b>지금 ' + fl + '번 녹일 수 있어요</b>' + (HEAT > 0 ? ' (용광로에 남은 불 ' + HEAT + ')' : '');
      list.appendChild(fi);
      var sj = document.createElement('div'); sj.id = 'smeltJobs'; list.appendChild(sj); updateSmeltUI();
    }
    if (craftCat === 'tool') {
      var REP_MAT = [GOPHER, STONE, ING_CU, ING_FE, GEM_DIA];
      Object.keys(WEAR).forEach(function (k) {
        var tid = +k; if (have(tid) < 1) return;
        var mat = REP_MAT[tierOf(tid)], mx = toolMax(tid), w = WEAR[tid], nw = Math.min(mx, w + Math.ceil(mx / 4)), okR = have(mat) >= 1;
        var r = document.createElement('div'); r.className = 'rec rep' + (okR ? '' : ' no');
        r.innerHTML = '<span class="ins"><span class="ri"><img src="' + ICON[tid] + '" alt=""></span><b>+</b><span class="ri' + (okR ? '' : ' lack') + '"><img src="' + ICON[mat] + '" alt=""><i>1</i></span></span><b class="arr">→</b><span class="ri"><img src="' + ICON[tid] + '" alt=""></span>'
          + '<span class="rname">' + toolName(tid) + ' 고치기 <small>힘 ' + w + ' → ' + nw + ' / ' + mx + '</small></span>';
        var bt = document.createElement('button'); bt.className = 'mc mk'; bt.textContent = '고치기';
        bt.addEventListener('click', function () {
          if (have(mat) < 1) { $('invName').textContent = B[mat][0] + '이(가) 1개 있어야 고칠 수 있어요'; sfx('click'); return; }
          take(mat, 1); if (nw >= mx) delete WEAR[tid]; else WEAR[tid] = nw;
          sfx('craft'); $('invName').textContent = toolName(tid) + '을(를) 고쳤어요 (힘 ' + nw + '/' + mx + ')'; bagChanged();
        });
        r.appendChild(bt); list.appendChild(r);
      });
    }
    // 단계·열린 제작법 수
    var st = curStage(), allN = RECIPES.length, openN = RECIPES.filter(recOpen).length;
    var sb = document.createElement('div'); sb.className = 'stagebar';
    sb.innerHTML = '📜 제작법 <b>' + openN + '/' + allN + '</b> 열림 · 지금 <b>' + st.n + '단계 「' + st.name + '」</b>' + (STAGE_NEXT[st.n] ? ' — 다음: ' + STAGE_NEXT[st.n] : ' — 마지막 단계예요') + '<br><small>재료를 처음 얻으면 그 재료로 만드는 법이 열려요. 재료 그림을 누르면 어디서 얻는지 알려 줘요.</small>';
    list.appendChild(sb);
    var qBox = document.createElement('input'); qBox.id = 'craftQ'; qBox.placeholder = '🔍 이름으로 찾기'; qBox.value = craftQuery; qBox.setAttribute('aria-label', '만들 것 이름으로 찾기');
    qBox.addEventListener('input', function () { craftQuery = qBox.value.trim(); renderInv(); var q2 = $('craftQ'); if (q2) { q2.focus(); q2.setSelectionRange(q2.value.length, q2.value.length); } });
    list.insertBefore(qBox, list.firstChild);
    var locked = [];
    RECIPES.forEach(function (rc) {
      if (craftQuery && B[rc.out[0]][0].indexOf(craftQuery) < 0) return;
      if (rc.cat !== craftCat && !craftQuery) return;
      if (!recOpen(rc)) { if (!craftQuery) locked.push(rc); return; }   // 찾는 중엔 잠긴 제작법 이름을 드러내지 않음
      var ok = canCraft(rc);
      var r = document.createElement('div'); r.className = 'rec' + (ok ? '' : ' no');
      r.addEventListener('click', function (e) { var t = e.target.closest && e.target.closest('.ri[data-id]'); if (t) { var gid = +t.getAttribute('data-id'); $('invName').textContent = '「' + B[gid][0] + '」 ' + howGet(gid) + ' (지금 ' + fmtN(have(gid)) + '개)'; sfx('click'); } });
      var h = '<span class="ins">';
      rc.need.forEach(function (n, k) { h += (k ? '<b>+</b>' : '') + '<span class="ri' + (have(n[0]) >= n[1] ? '' : ' lack') + '" data-id="' + n[0] + '" title="' + B[n[0]][0] + ' — 누르면 얻는 곳"><img src="' + ICON[n[0]] + '" alt=""><i>' + n[1] + '</i></span>'; });
      h += '</span><b class="arr">→</b><span class="ri"><img src="' + ICON[rc.out[0]] + '" alt=""><i>' + rc.out[1] + '</i></span>';
      h += '<span class="rname">' + B[rc.out[0]][0] + (rc.ref ? ' <small>' + rc.ref + '</small>' : '') + (rc.furnace ? ' <small class="fz' + (furnaceOK() ? '' : ' lack') + '">🔥용광로</small>' : '') + (rc.fuel ? ' <small class="fz' + (fuelLeft(rc) >= 1 ? '' : ' lack') + '">땔감</small>' : '') + (rc.station ? ' <small>' + B[rc.station][0] + '</small>' : '') + (rc.table ? ' <small class="fz' + (tableOK() ? '' : ' lack') + '">🪚제작대</small>' : '') + '</span>';
      r.innerHTML = h;
      var btn = document.createElement('button'); btn.className = 'mc mk'; btn.textContent = '만들기';
      function craftN(times) {
        if (!canCraft(rc)) {
          sfx('click');
          if (rc.furnace && !furnaceOK()) $('invName').textContent = '녹이려면 용광로가 있어야 해요. 돌 8개로 만들어 가방에 넣거나 내 땅에 놓아요';
          else if (rc.fuel && fuelLeft(rc) < 1) $('invName').textContent = '땔감이 없어요. 석탄·숯·통나무를 모아요';
          else if (rc.station) $('invName').textContent = B[rc.station][0]+' 가까이에서 만들어요';
          else if (rc.table && !tableOK()) $('invName').textContent = '이 물건은 제작대가 있어야 만들어요. 고페르 나무 4개로 제작대를 만들어 가방에 넣거나 내 땅에 놓아요';
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
        sfx('craft'); $('invName').textContent = rc.fuel ? '용광로에 넣었어요 — ' + B[rc.out[0]][0] + ' ' + (rc.out[1] * made) + '개가 하나에 ' + SMELT_SEC + '초씩 녹아요' : B[rc.out[0]][0] + ' ' + (rc.out[1] * made) + '개를 만들었어요';
        bagChanged();
      }
      btn.addEventListener('click', function () { craftN(1); });
      r.appendChild(btn);
      addRecipePin(r,rc);
      if (rc.fuel) { var b8 = document.createElement('button'); b8.className = 'mc mk mk8'; b8.textContent = '×8'; b8.title = '8번 한꺼번에'; b8.addEventListener('click', function () { craftN(8); }); r.appendChild(b8); }
      list.appendChild(r);
    });
    // 아직 잠긴 제작법: 단계 순서로, 무엇을 얻으면 열리는지
    locked.sort(function (a, b) { return recStage(a) - recStage(b); }).forEach(function (rc) {
      var miss = recIds(rc).filter(function (id) { return !SEEN[id]; });
      var r = document.createElement('div'); r.className = 'rec lockd';
      r.innerHTML = '<span class="ri"><img src="' + ICON[rc.out[0]] + '" alt=""></span><span class="rname">🔒 <b class="stg">' + recStage(rc) + '단계</b> ??? <small>— ' + miss.map(function (id) { return '「' + B[id][0] + '」'; }).join(', ') + '을(를) 얻으면 열려요</small></span>';
      r.addEventListener('click', function () { $('invName').textContent = miss.map(function (id) { return '「' + B[id][0] + '」 ' + howGet(id); }).join(' / '); sfx('click'); });
      addRecipePin(r,rc);
      list.appendChild(r);
    });
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
  var CHESTS = {}, curChest = null, chestOne = false;
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
    $('chestOne').textContent = '한 개씩: ' + (chestOne ? '켬' : '끔');
    chestItemKeys(c).forEach(function (k) {
      var id = +k; if (!(c[id] > 0)) return;
      var d = document.createElement('button'); d.className = 'islot'; d.innerHTML = slotHTML(id, c[id]); d.title = B[id][0];
      d.addEventListener('click', function () { var n = give(id, chestOne ? 1 : c[id]); if (!n) { $('chestName').textContent = '🎒 가방이 가득 찼어요'; sfx('click'); return; } c[id] -= n; if (c[id] <= 0) delete c[id]; $('chestName').textContent = B[id][0] + ' ' + n + '개를 가방으로'; sfx('click'); markDirty(); bagChanged(); renderChest(); });
      g1.appendChild(d);
    });
    if (!g1.children.length) g1.innerHTML = '<span class="empty">비어 있어요 — 아래 가방에서 눌러 넣어요</span>';
    INV.forEach(function (id) {
      if (have(id) < 1) return;
      var d = document.createElement('button'); d.className = 'islot'; d.innerHTML = slotHTML(id, have(id)); d.title = B[id][0];
      d.addEventListener('click', function () {
        if (isTool(id)) { $('chestName').textContent = '도구는 가방에 넣고 다녀요'; sfx('click'); return; }
        if (!c[id] && Object.keys(c).length >= 27) { $('chestName').textContent = '궤가 가득 찼어요(27가지)'; return; }
        var n = chestOne ? 1 : have(id); take(id, n); c[id] = (c[id] || 0) + n; CHESTS[curChest] = c;
        $('chestName').textContent = B[id][0] + ' ' + n + '개를 궤에'; sfx('click'); markDirty(); bagChanged(); renderChest();
      });
      g2.appendChild(d);
    });
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
  function updateMenuLabels() {
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
    on('btnPause', function () { openPanel('pause'); sfx('click'); });
    on('btnView', cycleView);
    // 접고 펴기: 위쪽 버튼 줄 · 처음 안내 · 작은 지도(이 기기에 기억)
    function applyFold() {
      var f = S.fold || {};
      $('topRight').classList.toggle('fold', !!f.top); document.body.classList.toggle('topfold', !!f.top);
      $('btnFold').querySelector('span').textContent = f.top ? '◀' : '▶'; $('btnFold').querySelector('small').textContent = f.top ? '펴기' : '접기';
      document.body.classList.toggle('qfold', !!f.q);   // 안내를 접으면 상자는 숨기고 위쪽 줄의 📜 버튼만
      document.body.classList.toggle('mapfold', !!f.map);
      $('mapCap').innerHTML = f.map ? '🗺 지도 펴기' : '지도<b class="k">M</b>';
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
      var G = { game: ['mBook', 'mStory', 'mVillageWork', 'mLook', 'mMap', 'mTour', 'mTutorial', 'mPractice', 'mHelp'], go: ['mArk', 'mHome', 'mForest', 'mHill', 'mLake'],
        together: ['mParty', 'mFriends', 'mVisit', 'mRevert'], settings: ['mLight', 'mView', 'mSound', 'mMusic', 'mShadow', 'mAutoJump', 'mMapVisible', 'mAim'] };
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
    on('drop1', function () { var id = bagPick && bagPick.id; bagPick = null; closePanel(); throwItem(id, 1); });
    on('dropAll', function () { var id = bagPick && bagPick.id; bagPick = null; closePanel(); throwItem(id, Math.min(64, have(id))); });
    on('mapCap', function () { toggleFold('map'); });
    on('btnRotate', rotateScreen);
    applyFold();
    on('restUp', standFromFurniture);
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
    on('mLight', function () { S.lightMode = !S.lightMode; applyLightMode(); saveSettings(); updateMenuLabels(); });
    on('touchAction', function () { if (isTouch && ui === 'play') { tapAt(); mobileHudAt = 0; } });
    on('slabMode', function () {
      slabMode = (slabMode + 1) % SLAB_NAMES.length;
      $('slabMode').textContent = '반 블록: ' + SLAB_NAMES[slabMode];
      mobileHudAt = 0;
    });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', fitMobileKeyboard);
    }
    on('mHome', function () { resume(); goHome(); });
    on('mForest', function () { travel('forest'); });
    on('mHill', function () { travel('hill'); });
    on('mLake', function () { travel('lake'); });
    on('mView', function () { S.view = (S.view + 1) % 3; saveSettings(); updateMenuLabels(); sfx('click'); });
    on('mSound', function () { S.sound = !S.sound; saveSettings(); updateMenuLabels(); sfx('click'); });
    on('mAim', function () { S.aim = S.aim === 'cross' ? 'finger' : 'cross'; saveSettings(); updateMenuLabels(); sfx('click'); });
    $('mSens').addEventListener('input', function () { S.sens = +this.value / 100; saveSettings(); updateMenuLabels(); });
    on('bookDone', function () { closePanel(); });
    on('helpDone', function () { closePanel(); });
    on('invDone', function () { closePanel(); });
    on('chestDone', function () { closePanel(); });
    on('chestOne', function () { chestOne = !chestOne; renderChest(); sfx('click'); });
    on('tabBag', function () { invTab = 'bag'; renderInv(); sfx('click'); });
    on('tabCraft', function () { invTab = 'craft'; renderInv(); sfx('click'); });
    on('tabDex', function () { invTab = 'dex'; renderInv(); sfx('click'); });
    ['block', 'shape', 'tool', 'smelt', 'wear'].forEach(function (c) { on('cc_' + c, function () { craftCat = c; renderInv(); sfx('click'); }); });
    on('tLook', function () { openLooks(); });
    on('btnLook', function () { openLooks(); });
    // 집은 묶음 버리기: 앞쪽 땅에 떨어뜨림(5초 동안은 다시 안 끌려옴, 5분 지나면 사라짐)
    on('bagDrop', function () {
      if (!bagPick || bagPick.from !== 'bag' || isAdm()) return;
      var id = bagPick.id, n = Math.min(bagPick.n || 0, have(id)); if (n < 1) return;
      take(id, n);
      var fx = -Math.sin(P.yaw), fz = -Math.cos(P.yaw);
      dropItem(P.x + fx * 2.2, P.y + 2, P.z + fz * 2.2, id, n);
      var o = DROPS[DROPS.length - 1]; if (o && o.id === id) o.full = 2;
      bagPick = null; sfx('pop'); bagChanged();
      $('invName').textContent = B[id][0] + ' ' + n + '개를 앞에 버렸어요 (다시 주우려면 5초 뒤 가까이 가요)';
    });
    on('tipsDone', function () { try { localStorage.setItem('arkVillage.tips', '1'); } catch (e) {} resume(); });
    var br = $('btnRun');
    br.addEventListener('touchstart', function (e) { setRun(!runLock, 'btn'); e.preventDefault(); }, { passive: false });
    br.addEventListener('click', function () { setRun(!runLock, 'btn'); });
    on('mLook', function () { openLooks(); });
    on('looksDone', function () { closePanel(); });
    on('cardClose', function () { $('card').classList.remove('show'); });
    on('mapc', function () { openPanel('map'); drawMap($('bigmapc'), true); sfx('click'); });
    on('mapDone', function () { closePanel(); });
    on('mMapVisible', function () { S.mapVisible = S.mapVisible === false; NET.sentKey = ''; saveSettings(); updateMenuLabels(); });
    $('bigmapc').addEventListener('click', selectMapPerson);
    on('mapFriend', function () {
      var nick = NET.names[selectedMapPeer]; if (nick && canRequestMapFriend(selectedMapPeer)) friendRequest(nick);
    });
    on('mMap', function () { openPanel('map'); drawMap($('bigmapc'), true); sfx('click'); });
    ['ark', 'forest', 'hill', 'lake'].forEach(function (w) { on('go_' + w, function () { travel(w); }); });
    on('go_home', function () { resume(); goHome(); });
    ['sea', 'desert', 'ararat', 'commons'].forEach(function (w) { var b = $('go_' + w); if (b) on('go_' + w, function () { travel(w); }); });
    on('mMusic', function () { S.music = S.music === false; saveSettings(); updateMenuLabels(); sfx('click'); });
    on('mRevert', adminRevertCommons);
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
    on('hotClear', function () { if (bagPick && bagPick.from === 'hot') { HOTBAR[bagPick.i] = 0; bagPick = null; saveSettings(); renderHotbar(); setSel(sel, true); renderInv(); $('invName').textContent = '단축 칸을 비웠어요'; } });
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

