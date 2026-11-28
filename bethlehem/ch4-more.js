// 「베들레헴의 밤」 4장 v2 (2026-11-28): 새 문제 여섯 — 유형 장부 기준(한 번씩 남은 유형 + 새 유형 하나)
//  밤길: 골목 돌판 길 잇기(→ 별이 머문 집)
//  몇 달 뒤 여관: 손님 셋의 증언 조건표(→ 달라진 곳 찾기)
//  그 집 문: 문 위 기호(낙타 짐 꼬리표로 해독) → 빗장 숫자 세기 → 문 두드리기
//  그 집 안: 마태복음 2장 책 암호(→ 엎드려 경배) · 보배합 뚜껑 무늬 짝(대칭, → 세 예물)
(function (BN) {
  var R = BN.ROOMS, LOCAL = /^(127\.0\.0\.1|localhost)$/.test(location.hostname);
  function rnd(S, n) { var s = (S.created % 9973) + 7 * n + 1; return function () { s = (s * 16807) % 2147483647; return s / 2147483647; }; }
  function mix(r, a) { a = a.slice(); for (var q = a.length - 1; q > 0; q--) { var t = Math.floor(r() * (q + 1)), x = a[q]; a[q] = a[t]; a[t] = x; } return a; }
  function why(t, a, b) { if (BN.WHY) BN.WHY[t] = a; if (BN.THINK) BN.THINK[t] = b; }
  function g4(S) { S.f4x = S.f4x || {}; return S.f4x; }
  function gate(name, key, say) { var o = BN.PZ[name]; BN.PZ[name] = function (Rm, A) { if (!g4(A.S())[key]) return A.talk(say); return o(Rm, A); }; }
  function done(A, key, note, ref, lines) { var S = A.S(); g4(S)[key] = 1; if (note) S.notes.push({ text: note, ref: ref || '' }); A.save(); A.sfx('ok'); A.closeModal(); if (lines) A.talk(lines); }

  // ════ 밤길 · 골목 돌판 길 잇기
  R.nightroad.spots.push({ id: 'alley', x: 40, y: 72, w: 16, h: 12, act: 'puzzle:alley', label: '🪨 골목 돌판', extra: 1 });
  var PW = 5, PH = 4;
  function alleyData(S) {
    var r = rnd(S, 401), ey = Math.floor(r() * PH), xy = Math.floor(r() * PH), cells = null;
    for (var t = 0; t < 400 && !cells; t++) {
      var path = [[0, ey]], seen = {}, ok = true; seen['0,' + ey] = 1;
      while (true) { var c = path[path.length - 1]; if (c[0] === PW - 1 && c[1] === xy) break; var nb = [[1, 0], [0, 1], [0, -1], [-1, 0]].map(function (d) { return [c[0] + d[0], c[1] + d[1]]; }).filter(function (n) { return n[0] >= 0 && n[0] < PW && n[1] >= 0 && n[1] < PH && !seen[n[0] + ',' + n[1]]; }); if (!nb.length || path.length > 15) { ok = false; break; } var rt = nb.filter(function (q) { return q[0] > c[0]; }), n = (rt.length && r() < .5) ? rt[0] : nb[Math.floor(r() * nb.length)]; seen[n[0] + ',' + n[1]] = 1; path.push(n); }
      if (ok && path.length >= 9) cells = path;
    }
    var DIRS = { '1,0': 1, '-1,0': 3, '0,1': 2, '0,-1': 0 }, conn = {};
    cells.forEach(function (c, k) { var s = [k === 0 ? 3 : DIRS[(cells[k - 1][0] - c[0]) + ',' + (cells[k - 1][1] - c[1])], k === cells.length - 1 ? 1 : DIRS[(cells[k + 1][0] - c[0]) + ',' + (cells[k + 1][1] - c[1])]]; conn[c[0] + ',' + c[1]] = s; });
    var tiles = [];
    for (var y = 0; y < PH; y++) for (var x = 0; x < PW; x++) { var s = conn[x + ',' + y], type, rot; if (s) { type = (s[1] - s[0] + 4) % 4 === 2 ? 'I' : 'L'; rot = type === 'I' ? s[0] % 2 : ((s[1] - s[0] + 4) % 4 === 1 ? s[0] : s[1]); } else { type = r() < .5 ? 'I' : 'L'; rot = Math.floor(r() * 4); } tiles.push({ type: type, sol: rot, rot: (rot + 1 + Math.floor(r() * 3)) % 4, on: !!s }); }
    return { ey: ey, xy: xy, tiles: tiles };
  }
  function opens(t) { return (t.type === 'I' ? [0, 2] : [0, 1]).map(function (d) { return (d + t.rot) % 4; }); }
  function flow(D) { var lit = {}, q = [[0, D.ey, 3]]; while (q.length) { var c = q.shift(), x = c[0], y = c[1]; if (x < 0 || x >= PW || y < 0 || y >= PH) continue; var t = D.tiles[y * PW + x], o = opens(t); if (o.indexOf(c[2]) < 0 || lit[x + ',' + y]) continue; lit[x + ',' + y] = 1; o.forEach(function (d) { var n = [[0, -1], [1, 0], [0, 1], [-1, 0]][d]; q.push([x + n[0], y + n[1], (d + 2) % 4]); }); } return { lit: lit, done: !!lit[(PW - 1) + ',' + D.xy] && opens(D.tiles[D.xy * PW + PW - 1]).indexOf(1) >= 0 }; }
  BN.PZ.alley = function (Rm, A) {
    var S = A.S(), F = g4(S); if (F.alley) return A.toast('✔ 골목 돌판은 이미 이었어요');
    var D = alleyData(S), w = A.el('div', 'gen-wrap');
    function seg(o) { var P = { 0: '50,50 50,0', 1: '50,50 100,50', 2: '50,50 50,100', 3: '50,50 0,50' }; return o.map(function (d) { return '<polyline points="' + P[d] + '"/>'; }).join(''); }
    function draw() {
      var f = flow(D);
      w.innerHTML = '<div class="pt-wrap"><span class="pt-in" style="top:' + ((D.ey + .5) / PH * 100) + '%">🐪 ▶</span><div class="pt-grid">' + D.tiles.map(function (t, i) { var x = i % PW, y = Math.floor(i / PW); return '<button class="pt-t' + (f.lit[x + ',' + y] ? ' lit' : '') + '" data-i="' + i + '"><svg viewBox="0 0 100 100">' + seg(opens(t)) + '</svg></button>'; }).join('') + '</div><span class="pt-out" style="top:' + ((D.xy + .5) / PH * 100) + '%">⭐</span></div><p class="gen-help" style="text-align:center">돌판을 누르면 돌아가요. 박사 일행(🐪)이 별이 선 곳(⭐)까지 갈 길을 이어요.</p>';
      w.querySelectorAll('.pt-t').forEach(function (b) { b.onclick = function () { var t = D.tiles[+b.dataset.i]; t.rot = (t.rot + 1) % 4; draw(); if (flow(D).done) done(A, 'alley', '밤길 골목 돌판을 이어 박사 일행이 별 아래까지 갈 길을 냈다.', '', [['narr', null, '돌판 길이 이어지자 낙타 방울 소리가 골목 안쪽으로 따라 들어간다.']]); }; });
      if (LOCAL) BN.__alley = function () { D.tiles.forEach(function (t) { if (t.on) t.rot = t.sol; }); draw(); if (flow(D).done) done(A, 'alley'); };
    }
    draw(); A.modal('골목 돌판', w);
  };
  why('골목 돌판', '베들레헴 골목은 돌판이 어긋나 있어 낙타가 지나갈 수 없다.', '꺾인 돌, 곧은 돌… 별이 선 쪽까지 이어지게 하나씩 돌려 보자.');
  gate('starstop', 'alley', [['gilead', 1, '골목 돌판이 다 어긋나 있어서 낙타가 못 들어가요. 길부터 이어야겠어요.', '(🪨 골목 돌판)']]);

  // ════ 몇 달 뒤 여관 · 손님 셋의 증언 조건표
  // 11/28 블라인드 풀이: 여관 주 문제를 먼저 풀어도 길르앗 수수께끼(두루마리 조각 B)는 계속 열린다 — 안 그러면 그 집 안에서 막힌다
  R.innl.spots.forEach(function (sp) { if (sp.act === 'puzzle:riddle4') sp.extra = 1; });
  R.innl.spots.push({ id: 'guests', x: 30, y: 62, w: 16, h: 14, act: 'puzzle:witness', label: '🗣 손님들의 말', extra: 1 });
  var HOUSES = ['파란 문 집(골목 어귀)', '무화과나무 집(가운데)', '우물 곁 집(골목 끝)'], FAM = ['나사렛에서 온 목수 가족', '대장장이네', '토기장이네'], SOLF = [2, 0, 1];   // 목수 → 우물 곁, 대장장이 → 파란 문, 토기장이 → 무화과
  BN.PZ.witness = function (Rm, A) {
    var S = A.S(), F = g4(S), v = [null, null, null], w = A.el('div', 'gen-wrap');
    if (F.witness) return A.toast('✔ 그 가족이 사는 집을 이미 알아냈어요 — 우물 곁 집');
    function draw() {
      w.innerHTML = '<div class="note wt-say"><b>여관 손님들의 말</b><span>낙타 몰이꾼: 「대장장이네는 목수 가족보다 골목 어귀 쪽에 살아요.」</span><span>물 긷는 여인: 「토기장이네는 골목 첫 집이 아니에요.」</span><span>빵 장수: 「대장장이네랑 토기장이네는 서로 붙어 있어요.」</span></div>' +
        '<div class="wt-grid">' + FAM.map(function (f, i) { return '<div class="wt-row"><b>' + f + '</b><button class="btn ghost" data-i="' + i + '">' + (v[i] === null ? '— 집 고르기 —' : HOUSES[v[i]]) + '</button></div>'; }).join('') + '</div><button class="btn gold block" id="wtOk" style="margin-top:8px">이렇게 정했어요</button>';
      w.querySelectorAll('[data-i]').forEach(function (b) { b.onclick = function () { var i = +b.dataset.i; v[i] = v[i] === null ? 0 : (v[i] + 1) % 3; draw(); }; });
      w.querySelector('#wtOk').onclick = function () {
        if (A.locked('innl')) return;
        if (v.join() !== SOLF.join()) return A.wrong('innl', '말과 어긋나는 데가 있다 — 한 줄씩 다시 맞춰 보자');
        done(A, 'witness', '여관 손님들의 말로 따져 보니: 대장장이네 = 파란 문 집, 토기장이네 = 무화과나무 집, 나사렛 목수 가족 = 우물 곁 집(골목 끝).', '', [['gilead', 2, '골목 끝 우물 곁 집! 그 가족이 이제 거기 산대요.', '(여관이 아니라 집이에요)'], ['asaph', 0, '「집에 들어가」(마 2:11)라 했지. 여관에서 집으로 옮긴 게로구나.']]);
      };
    }
    draw(); A.modal('손님들의 말', w);
  };
  why('손님들의 말', '몇 달 사이 여관 손님들은 그 가족이 골목 어느 집으로 옮겼는지 저마다 한 마디씩 한다.', '집은 셋, 가족도 셋… 한 사람 말씩 대 보면서 안 되는 자리를 지워 가자.');
  gate('diff', 'witness', [['gilead', 1, '여기 사람들이 그 가족 얘기를 하던데… 먼저 손님들 말을 들어 봐요.', '(🗣 손님들의 말)']]);

  // ════ 그 집 문 · 문 위 기호(낙타 짐 꼬리표) → 빗장 숫자 세기 → 두드리기
  var SYM = ['☉', '☾', '✶', '◆', '♁', '☼', '✚', '⌘'], WORD = ['임', '마', '누', '엘'], DEC = ['임', '마', '누', '엘', '왕', '별', '빛', '길'];
  function symMap(S) { var r = rnd(S, 411), s = mix(r, SYM), m = {}; DEC.forEach(function (d, i) { m[d] = s[i]; }); return m; }
  var tagSpot = { id: 'cl_tag', x: 64, y: 48, w: 6, h: 9, act: 'clue:tag', msg: '낙타 짐에 박사들의 꼬리표가 매달려 있다' };
  Object.defineProperty(tagSpot, 'note', { get: function () { var S = BN.ui && BN.ui.S && BN.ui.S(); if (!S) return ''; var m = symMap(S); return '낙타 짐 꼬리표(박사들의 기호) — ' + DEC.map(function (d) { return m[d] + '=' + d; }).join(' · '); }, configurable: true });
  R.nightroad.spots.push(tagSpot);
  R.door.spots.push({ id: 'lintel', x: 33, y: 14, w: 22, h: 8, act: 'puzzle:lintel', label: '✦ 문 위 기호', extra: 1 });
  R.door.spots.push({ id: 'latch', x: 56, y: 56, w: 6, h: 8, act: 'puzzle:latch', label: '🔩 빗장', extra: 1 });
  BN.PZ.lintel = function (Rm, A) {
    var S = A.S(), F = g4(S), m = symMap(S), w = A.el('div', 'gen-wrap');
    if (F.lintel) return A.toast('✔ 문 위 기호는 이미 읽었어요 — 「임마누엘」');
    w.innerHTML = '<div class="gl-door">' + WORD.map(function (d) { return '<span>' + m[d] + '</span>'; }).join('') + '</div>' +
      ((S.clues || {}).tag ? '<div class="note gl-tab"><b>낙타 짐 꼬리표(밤길)</b><div>' + DEC.map(function (d) { return '<i>' + m[d] + ' ' + d + '</i>'; }).join('') + '</div></div>' : '<p class="gen-help" style="text-align:center">박사들의 기호 같다. 읽을 표가 어딘가에…</p>') +
      '<div class="rm-ans"><input id="ltIn" maxlength="6" placeholder="기호가 뜻하는 말" autocomplete="off" spellcheck="false"><button class="btn gold" id="ltOk">말하기</button></div>';
    A.modal('문 위 기호', w);
    w.querySelector('#ltOk').onclick = function () { if (A.locked('door')) return; if ((w.querySelector('#ltIn').value || '').replace(/\s/g, '') !== '임마누엘') return A.wrong('door', '기호와 맞지 않는다'); done(A, 'lintel', '그 집 문 위 기호: 「임마누엘」 — 하나님이 우리와 함께 계시다(마 1:23).', '마태복음 1:23', [['asaph', 0, '임마누엘… 박사들이 이 집에 표를 남겨 두었구나. 빗장을 보자.']]); };
  };
  why('문 위 기호', '문 위 돌에 낯선 기호 넷이 새겨져 있다. 박사들이 남긴 표인 것 같다.', '박사들의 기호라면… 낙타 짐 어딘가에 이 기호를 풀 꼬리표가 있지 않았을까?');
  BN.PZ.latch = function (Rm, A) {
    var S = A.S(), F = g4(S), cv = [0, 0, 0], NM = [['◯', '문틀의 둥근 구멍'], ['🧰', '문 앞 보배합'], ['🏺', '항아리']], w = A.el('div', 'gen-wrap');
    if (F.latch) return A.toast('✔ 빗장은 이미 풀었어요');
    if (!F.lintel) return A.talk([['gilead', 1, '빗장에 숫자 칸이 셋… 그 전에 문 위 기호가 먼저인 것 같아요.', '(✦ 문 위 기호)']]);
    w.innerHTML = '<div class="note cb-lid"><b>빗장에 새긴 글</b><span>「첫째 칸은 문틀의 둥근 구멍, 둘째 칸은 문 앞의 보배합, 셋째 칸은 항아리. 이 집 앞에서 세어 보라.」</span><small class="cb-tip">숫자는 어디에도 적혀 있지 않아요 — 창을 닫고 집 앞 그림을 끌어 보며 직접 세요.</small></div>' +
      '<div class="cb-slots">' + NM.map(function (c, i) { return '<div class="cb-slot"><small>' + ['첫째', '둘째', '셋째'][i] + ' 칸</small><button class="btn ghost cb-up" data-i="' + i + '">▲</button><b id="ltV' + i + '">0</b><button class="btn ghost cb-dn" data-i="' + i + '">▼</button><span>' + c[0] + '<br>' + c[1] + '</span></div>'; }).join('') + '</div><button class="btn gold block" id="ltgo" style="margin-top:10px">빗장 열기</button>';
    A.modal('빗장', w);
    w.querySelectorAll('.cb-up, .cb-dn').forEach(function (b) { b.onclick = function () { var i = +b.dataset.i; cv[i] = (cv[i] + (b.classList.contains('cb-up') ? 1 : 20)) % 21; w.querySelector('#ltV' + i).textContent = cv[i]; }; });
    w.querySelector('#ltgo').onclick = function () { if (A.locked('door')) return; if (cv.join() !== '12,2,3') return A.wrong('door', '빗장이 꿈쩍도 않는다 — 다시 세어 보자'); done(A, 'latch', '그 집 빗장: 문틀의 둥근 구멍 12 · 문 앞 보배합 2 · 항아리 3.', '', [['narr', null, '딸깍, 빗장이 풀렸다. 그래도 함부로 열 수는 없다 — 이 집 사람들과 약속한 가락으로 두드려야 한다.']]); };
  };
  why('빗장', '문에 숫자 칸 셋짜리 빗장이 걸려 있다. 무엇을 세라는 글이 새겨져 있다.', '숫자는 이 집 앞 그림 속에 있겠지. 둥근 구멍은 위쪽 아치에도, 양옆에도 있었던 것 같은데…');
  gate('knock', 'latch', [['gilead', 1, '빗장이 걸려 있어요. 빗장부터 풀어야 두드릴 수 있겠어요.', '(✦ 문 위 기호 → 🔩 빗장)']]);

  // ════ 그 집 안 · 책 암호(마 2장) → 엎드려 경배
  var BK = '2:9-33 · 2:5-22 · 2:1-8 · 2:8-43 · 2:2-34 · 2:6-55 · 2:12-35', BKA = '아기께경배하라';
  R.worship.spots.push({ id: 'tablet4', x: 30, y: 32, w: 10, h: 12, act: 'puzzle:bookc4', label: '📜 숫자 쪽지', extra: 1 });
  BN.PZ.bookc4 = function (Rm, A) {
    var S = A.S(), F = g4(S), w = A.el('div', 'gen-wrap');
    if (F.bookc) return A.toast('✔ 숫자 쪽지는 이미 풀었어요 — 「아기께 경배하라」');
    w.innerHTML = '<div class="note bk-scroll"><b>마태복음</b><span class="bk-code">' + BK.split(' · ').map(function (c) { return '<i>' + c + '</i>'; }).join('') + '</span><small>장:절-몇째 글자 · 띄어쓰기와 문장부호는 세지 않는다 · 개역개정</small></div><div class="rm-ans"><input id="b4In" maxlength="10" placeholder="뽑은 글자를 이어 적기" autocomplete="off" spellcheck="false"><button class="btn gold" id="b4Ok">적기</button></div>';
    A.modal('박사의 숫자 쪽지', w);
    w.querySelector('#b4Ok').onclick = function () { if (A.locked('worship')) return; if ((w.querySelector('#b4In').value || '').replace(/\s/g, '') !== BKA) return A.wrong('worship', '말이 되지 않는다 — 다시 세어 보자'); done(A, 'bookc', '박사의 숫자 쪽지(마태복음 2장에서 글자 뽑기): 「아기께 경배하라」', '마태복음 2:11', [['narr', null, '집에 들어가 아기와 그의 어머니 마리아가 함께 있는 것을 보고 엎드려 아기께 경배하고', '', '마태복음 2:11']]); };
  };
  why('박사의 숫자 쪽지', '선반에 박사가 적어 둔 숫자 쪽지가 있다. 맨 위에 「마태복음」.', '「2:9-33」… 2장 9절의 서른셋째 글자? 띄어쓰기는 세지 말라고 했지.');
  gate('bow', 'bookc', [['gilead', 1, '박사님들이 뭘 하려는 걸까요… 선반 위 숫자 쪽지에 적혀 있을 것 같아요.', '(📜 숫자 쪽지)']]);

  // ════ 그 집 안 · 보배합 뚜껑 무늬 짝(대칭)
  R.worship.spots.push({ id: 'lids', x: 72, y: 87, w: 12, h: 9, act: 'puzzle:lids', label: '🎁 보배합 뚜껑', extra: 1 });
  function lidData(S) {
    var r = rnd(S, 421), L = [];
    for (var k = 0; k < 3; k++) {
      var left = []; for (var y = 0; y < 4; y++) { left.push([r() < .5 ? 1 : 0, r() < .5 ? 1 : 0]); } if (left.every(function (row) { return row[0] === row[1]; })) left[1] = [1, 0];
      var right = left.map(function (row) { return [row[1], row[0]]; }), same = left.map(function (row) { return row.slice(); }), flipV = right.slice().reverse(), oneOff = right.map(function (row) { return row.slice(); }); oneOff[Math.floor(r() * 4)][Math.floor(r() * 2)] ^= 1;
      var opts = mix(r, [right, same, flipV, oneOff].map(function (o, i) { return { g: o, ok: i === 0 }; }));
      if (opts.filter(function (o) { return JSON.stringify(o.g) === JSON.stringify(right); }).length > 1) { opts.forEach(function (o) { if (!o.ok && JSON.stringify(o.g) === JSON.stringify(right)) { o.g = o.g.map(function (row) { return row.map(function (x) { return 1 - x; }); }); } }); }
      L.push({ left: left, opts: opts });
    }
    return L;
  }
  function half(g, cls) { return '<span class="ld-h ' + cls + '">' + g.map(function (row) { return row.map(function (x) { return '<i class="' + (x ? 'on' : '') + '"></i>'; }).join(''); }).join('') + '</span>'; }
  BN.PZ.lids = function (Rm, A) {
    var S = A.S(), F = g4(S), D = lidData(S), pick = [null, null, null], w = A.el('div', 'gen-wrap'), NAME = ['황금', '유향', '몰약'];
    if (F.lids) return A.toast('✔ 보배합 뚜껑은 이미 맞췄어요');
    function draw() {
      w.innerHTML = '<p class="gen-help" style="text-align:center">보배합 뚜껑마다 무늬가 반쪽만 남았다. <b>거울에 비친 듯 좌우가 똑같이 맞는 반쪽</b>을 고르세요.</p>' +
        D.map(function (L, k) { return '<div class="ld-row"><b>' + NAME[k] + '</b><div class="ld-lid">' + half(L.left, 'l') + (pick[k] !== null ? half(L.opts[pick[k]].g, 'r') : '<span class="ld-h r empty"></span>') + '</div><div class="ld-opts">' + L.opts.map(function (o, i) { return '<button class="ld-o' + (pick[k] === i ? ' sel' : '') + '" data-k="' + k + '" data-i="' + i + '">' + half(o.g, 'o') + '</button>'; }).join('') + '</div></div>'; }).join('') +
        '<button class="btn gold block" id="ldOk">보배합 열기</button>';
      w.querySelectorAll('.ld-o').forEach(function (b) { b.onclick = function () { pick[+b.dataset.k] = +b.dataset.i; draw(); }; });
      w.querySelector('#ldOk').onclick = function () { if (A.locked('worship')) return; if (!D.every(function (L, k) { return pick[k] !== null && L.opts[pick[k]].ok; })) return A.wrong('worship', '뚜껑이 맞지 않는다 — 좌우를 견주어 보자'); done(A, 'lids', '보배합 뚜껑 무늬를 좌우 대칭으로 맞춰 열었다 — 황금과 유향과 몰약.', '마태복음 2:11', [['narr', null, '보배합을 열어 황금과 유향과 몰약을 예물로 드리니라', '', '마태복음 2:11']]); };
    }
    draw(); A.modal('보배합 뚜껑', w);
    if (LOCAL) BN.__lids = function () { D.forEach(function (L, k) { pick[k] = L.opts.findIndex(function (o) { return o.ok; }); }); draw(); };
  };
  why('보배합 뚜껑', '박사들의 보배합 셋. 뚜껑 무늬가 반쪽씩 지워져 있고, 곁에 조각 넷씩이 놓여 있다.', '거울에 비친 것처럼 왼쪽과 오른쪽이 똑같아야겠지. 한 칸씩 짝을 맞춰 보자.');
  gate('gifts', 'lids', [['gilead', 1, '보배합 뚜껑이 다 깨져 있어요. 뚜껑부터 맞춰야 열리겠어요.', '(🎁 보배합 뚜껑)']]);

  // ── 힌트
  function prep(k, a, b, c) { var o = BN.HINTS[k] || []; BN.HINTS[k] = [a + ' ' + (o[0] || ''), b + ' ' + (o[1] || ''), function (S) { return c(S) + ' · ' + (typeof o[2] === 'function' ? o[2](S) : (o[2] || '')); }]; }
  prep('nightroad', '🪨 골목 돌판: 낙타(🐪)에서 별(⭐)까지 길 잇기. 낙타 짐 꼬리표는 그 집 문 위 기호를 읽는 표예요.', '꺾인 돌은 두 쪽, 곧은 돌은 마주 보는 두 쪽.', function () { return '돌판: 낙타 → 별까지 끊김 없이'; });
  prep('innl', '🗣 손님들의 말: 집 셋에 가족 셋.', '대장장이 < 목수(어귀 쪽), 토기장이는 첫 집 아님, 대장장이·토기장이는 붙어 있음.', function () { return '증언: 대장장이 = 파란 문, 토기장이 = 무화과, 목수 가족 = 우물 곁'; });
  prep('door', '✦ 문 위 기호는 밤길 낙타 짐 꼬리표로, 🔩 빗장은 집 앞 그림에서 세기.', '둥근 구멍은 아치 위 넷 + 양옆 넷씩, 보배합은 문 앞, 항아리는 지붕 위에도.', function () { return '기호: 「임마누엘」 · 빗장 12 · 2 · 3'; });
  prep('worship', '📜 숫자 쪽지는 마태복음 2장 책 암호, 🎁 보배합 뚜껑은 좌우 대칭 짝.', '「2:9-33」 = 2장 9절의 서른셋째 글자(띄어쓰기 빼고).', function () { return '쪽지: 「아기께경배하라」 · 뚜껑: 거울처럼 좌우가 같은 반쪽'; });
})(window.BN);
