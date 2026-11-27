// 「베들레헴의 밤」 진짜 방탈출로(2026-11-27): 모든 방이 「찾기 → 생각 → 열기」, 난이도 최상
// 단서(clue:키)는 방을 뒤져야 나오고, BN.NEED[문제]의 단서를 다 모아야 그 문제가 열린다(game.js needClues).
// 폰 동작은 장마다 1~2개: 1장 걷기·기름 나르기 / 2장 새장 굴리기·소리 내어 읽기 / 3장 별 겨누기·별자리 선 긋기 / 4장 엎드려 경배 / 5장 등잔 불기·애굽 길 긋기
(function (BN) {
  BN.PZ = BN.PZ || {};
  var LOCAL = /^(127\.0\.0\.1|localhost)$/.test(location.hostname);
  BN.NEED = BN.NEED || {};
  function addClues(room, list) { var R = BN.ROOMS[room]; if (!R) return; list.forEach(function (c) { R.spots.push({ id: 'cl_' + c[0], x: c[1], y: c[2], w: c[3] || 6, h: c[4] || 8, act: 'clue:' + c[0], msg: c[5], note: c[6] || '', need: c[7] || '' }); }); }
  function need(pz, keys, say) { BN.NEED[pz] = { c: keys, say: say }; }
  function setHints(k, h) { BN.HINTS = BN.HINTS || {}; BN.HINTS[k] = h; if (BN.HINTS_CH1 && BN.HINTS_CH1[k]) BN.HINTS_CH1[k] = h; }
  var LOOK = '아직은 풀 수 없다. 이 방을 더 꼼꼼히 살펴보아라.';

  // 순서 맞추기(찾은 조각을 차례로 누르기) — 천군 노래·시므온 찬송·여관 글자에 같이 쓴다
  function order(A, title, intro, parts, key, onDone) {
    var r = A.seedRnd(parts.length * 7 + title.length), sh = parts.map(function (p, i) { return i; }), got = [], w = A.el('div', 'ord-pz');
    for (var i = sh.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = sh[i]; sh[i] = sh[j]; sh[j] = t; }
    function draw() {
      w.innerHTML = '<p class="tiny-note howto">' + intro + '</p><div class="ord-line">' + got.map(function (k) { return '<span>' + parts[k] + '</span>'; }).join(' ') + '<i>▏</i></div>';
      var box = A.el('div', 'ord-btns');
      sh.forEach(function (k) { if (got.indexOf(k) >= 0) return; var b = A.el('button', 'ord-b', parts[k]); b.onclick = function () { got.push(k); A.tick && A.tick(); draw(); check(); }; box.appendChild(b); });
      w.appendChild(box); var rs = A.el('button', 'btn ghost', '↺ 다시'); rs.onclick = function () { got = []; draw(); }; w.appendChild(rs);
    }
    function check() {
      if (got.length < parts.length) return;
      if (got.every(function (k, i) { return k === i; })) { A.sfx('ok'); setTimeout(function () { A.closeModal(); onDone(); }, 500); }
      else { if (A.locked(key)) return; A.wrong(key, '차례가 맞지 않는다'); got = []; draw(); }
    }
    draw(); A.modal(title, w);
    if (LOCAL) BN.__ordWin = function () { got = parts.map(function (p, i) { return i; }); check(); };
  }

  // ════ 1장 ════
  // 나사렛 길: 밤 지도 + 해 무늬를 찾아야 지도 상자(걷기 → 지도 겹치기)
  addClues('road', [['road_map', 79, 57, 6, 8, '등잔 받침 밑에 접힌 지도', '나사렛 길 — 등잔 밑에서 찾은 「밤 지도」. 별 넷이 찍혀 있다. 「낮 지도에 강과 산을 맞춰 겹쳐라.」'], ['road_sun', 93, 25, 5, 10, '기둥에 새긴 나침반 그림', '나사렛 길 — 기둥의 나침반 그림: 「지도의 화살표는 지도 위에서 본 방향이다. 나침반의 붉은 북쪽을 보고 동서남북으로 고쳐 읽어라. 위가 북쪽이라고 믿지 마라.」']]);
  need('walk', ['road_map', 'road_sun'], LOOK);
  // 여관: 손님 쪽지 여섯이 마당 곳곳에
  addClues('inn', [['inn1', 52, 13, 5, 7, '난간에 걸린 쪽지', '손님 쪽지 — 갈릴리 상인: 「누가복음 5장 1~2절의 그 물가에서 그물을 다루다 왔소. 그 물에서 나는 것이 그려진 방!」'], ['inn2', 79, 18, 5, 7, '별 간판 뒤 쪽지', '손님 쪽지 — 로마 세리: 「저 갈릴리 상인과 같은 층으로 주시오.」'], ['inn3', 46, 47, 5, 7, '문틈에 낀 쪽지', '손님 쪽지 — 목수 형제(둘): 「마태복음 20장 1절의 품꾼처럼 일하던 곳이 생각나는 방.」'], ['inn4', 55, 62, 5, 7, '항아리 밑 쪽지', '손님 쪽지 — 나이 든 과부: 「계단은 못 올라가요. 시편 52편 8절처럼 살고 싶은데…」'], ['inn5', 84, 40, 5, 7, '계단 위 쪽지', '손님 쪽지 — 제사장 가족(넷): 「레위기 12장 8절에 나오는 예물이 그려진 방이면 좋겠소. 우리는 넷이오.」'], ['inn6', 24, 38, 5, 7, '처마 등잔 옆 쪽지', '손님 쪽지 — 레위인 노래꾼: 「방이 없으면 제사장님 가족과 같은 방도 괜찮습니다.」']]);
  need('inn', ['inn1', 'inn2', 'inn3', 'inn4', 'inn5', 'inn6'], ['keeper', 0, '손님 쪽지가 바람에 다 날아갔구려…', '(쪽지를 찾아야 방을 정할 수 있다)']);
  // 부엌: 주인의 쪽지 + 등잔으로 비춰야 보이는 그릇 눈금
  addClues('kitchen', [['k_note', 60, 63, 6, 8, '식탁보 밑 쪽지', '여관 주인의 쪽지 — 「기름 여덟 되를 두 손님께 똑같이 나눠 드릴 것.」'], ['k_marks', 68, 50, 7, 9, '등잔을 비추자 그릇 바닥에 눈금이 보인다', '그릇 바닥 눈금 — 큰 단지 8되 · 중간 그릇 5되 · 작은 그릇 3되', 'lamp']]);
  need('oiljugs', ['k_note', 'k_marks'], LOOK);
  BN.PZ.oiljugs = (function (orig) { return function (R, A) { orig(R, A); var n = document.querySelector('.jug-pz .tiny-note'); if (n) { n.classList.add('howto'); } if (n) n.innerHTML = '쪽지대로 나눠야 한다. 그릇을 누르고 다른 그릇을 누르면 붓는다(가득 차거나 빌 때까지).'; var mo = new MutationObserver(function () { var t = document.querySelector('.jug-pz .tiny-note'); if (t && /여관 주인/.test(t.innerHTML)) { t.classList.add('howto'); } if (t && /여관 주인/.test(t.innerHTML)) t.innerHTML = '쪽지대로 나눠야 한다. 그릇을 누르고 다른 그릇을 누르면 붓는다(가득 차거나 빌 때까지).'; }); var w = document.querySelector('.jug-pz'); if (w) mo.observe(w, { childList: true }); }; })(BN.PZ.oiljugs);
  // 천사: 천군 노래 조각 일곱을 들판에서 찾아 눅 2:14 차례로 → 가락 따라 하기
  var PARTS = ['지극히 높은 곳에서는', '하나님께', '영광이요', '땅에서는', '하나님이 기뻐하신', '사람들 중에', '평화로다'];
  addClues('angel', [[10, 58], [22, 50], [34, 76], [52, 86], [68, 84], [90, 62], [80, 50]].map(function (p, i) { return ['an' + (i + 1), p[0], p[1], 5, 7, '빛나는 노래 조각 「' + PARTS[(i * 3) % 7] + '」']; }));
  need('chorus', ['an1', 'an2', 'an3', 'an4', 'an5', 'an6', 'an7'], ['gilead', 2, '노래가… 조각조각 흩어져서 들판에 떨어졌어요!', '(빛나는 것을 찾아요)']);
  var chorus0 = BN.PZ.chorus;
  BN.PZ.chorus = function (R, A) {
    var S = A.S(); S.f1 = S.f1 || {};
    if (S.f1.chord) return chorus0(R, A);
    order(A, '천군의 노래 조각', '들판에서 주운 노래 조각 일곱. 천군이 찬송한 그 말씀의 차례대로 누르세요.', PARTS, 'chorus', function () { S.f1.chord = 1; A.save(); A.toast('조각이 이어지자 가락이 들려온다'); setTimeout(function () { chorus0(R, A); }, 500); });
  };

  // ════ 2장 ════
  addClues('climb', [['cl1', 8, 62, 5, 8, '돌 틈의 돌판 조각'], ['cl2', 74, 44, 5, 8, '등잔 기둥 밑 돌판 조각'], ['cl3', 30, 30, 5, 8, '성벽 틈의 돌판 조각']]);
  need('climb', ['cl1', 'cl2', 'cl3'], ['gilead', 2, '계단 돌판이 군데군데 빠져 있어요. 떨어진 조각이 어디 있을 텐데…']);
  addClues('court', [['w1', 12, 82, 5, 7, '새장 밑 저울추 「1」'], ['w3', 6, 72, 5, 7, '항아리 곁 저울추 「3」'], ['w9', 84, 80, 5, 7, '의자 밑 저울추 「9」'], ['w27', 93, 57, 5, 7, '자루 속 저울추 「27」']]);
  need('scale', ['w1', 'w3', 'w9', 'w27'], ['asaph', 0, '저울추가 하나도 없구나. 장사꾼이 어디 흘려 두었을 게다.']);
  // 행각: 기다리기는 빼고, 기둥마다 숨은 찬송 조각 넷 → 차례 → 소리 내어 읽기
  addClues('porch', [['pr1', 8, 50, 5, 8, '기둥 밑동에 새긴 글'], ['pr2', 35, 40, 5, 8, '기둥 그늘의 글'], ['pr3', 75, 30, 5, 8, '등잔 걸이의 글'], ['pr4', 95, 60, 4, 8, '벽 끝의 글']]);
  need('wait', ['pr1', 'pr2', 'pr3', 'pr4'], ['asaph', 0, '저 노인의 찬송이 행각 기둥 곳곳에 새겨졌다. 하나도 빠짐없이 찾아보아라.']);
  BN.NEED.wait.when = function (S) { return !!S.waitOk; };
  BN.ROOMS.porch.spots.forEach(function (s) { if (/^cl_pr/.test(s.id)) s.when = function (S) { return !!S.waitOk; }; });
  var wait0 = BN.PZ.wait;
  BN.PZ.wait = function (R, A) {
    var S = A.S(), miss = function () { return ['pr1', 'pr2', 'pr3', 'pr4'].some(function (k) { return !(S.clues || {})[k]; }); };
    // 90초를 다 기다리면 찬송이 기둥에 새겨진다 → 조각 넷을 찾아야 찬송 차례로 넘어간다
    var A2 = Object.assign({}, A, { talk: function (lines, done) { A.talk(lines, function () { if (miss()) { if (BN.reRoom) BN.reRoom(); A.talk([['asaph', 0, '보았느냐. 저 노인의 찬송이 기둥 곳곳에 새겨졌다. 하나도 빠짐없이 찾아보아라.']]); } else if (done) done(); }); } });
    wait0(R, A2);
  };
  // 행각은 원래 문제 그대로(90초 기다리기 → 찬송 차례 → 소리 내어 읽기) — 기둥의 찬송 조각 넷을 찾아야 열린다

  // ════ 3장 ════
  addClues('council', [['sv1', 6, 30, 5, 8, '등잔 든 시종이 속삭인다', '회의실 — 등잔 든 시종: 「동문으로는 들이지 않소.」'], ['sv2', 40, 25, 5, 8, '문지기 시종이 속삭인다', '회의실 — 문지기 시종: 「서문이오.」'], ['sv3', 62, 52, 5, 8, '향 피우는 시종이 속삭인다', '회의실 — 향 피우는 시종: 「문지기 시종의 말은 거짓이오.」'], ['sv4', 96, 40, 4, 8, '물 긷는 시종이 속삭인다', '회의실 — 물 긷는 시종: 「남문도 북문도 아니오.」']]);
  need('liar', ['sv1', 'sv2', 'sv3', 'sv4'], ['asaph', 0, '박사들을 어느 문으로 들일지, 시종들에게 하나씩 물어보아라.']);

  // ════ 4장 ════
  // 밤길: 별이 여러 지붕에 쉬어 간다. 「창 셋 · 지붕 항아리 둘」인 집을 단서로 골라야
  addClues('nightroad', [['nr_win', 25, 70, 6, 8, '바위 밑 양피지', '밤길 — 바위 밑 양피지: 「그 집은 창이 셋이다.」'], ['nr_jar', 55, 45, 5, 7, '낙타 짐 꼬리표', '밤길 — 박사들 낙타 짐의 꼬리표: 「별이 선 지붕에는 물항아리가 둘」']]);
  need('starstop', ['nr_win', 'nr_jar'], ['asaph', 0, '별은 여러 지붕에서 쉬어 간다. 어느 집인지는 길에서 단서를 찾아야 알겠다.']);
  var HW = [2, 3, 1, 3, 2, 3, 1], HJ = [2, 1, 0, 2, 2, 0, 1], HFIN = 3, HPATH = [1, 4, 0, 3, 5, 6];
  BN.PZ.starstop = function (R, A) {
    var w = A.el('div', 'ss-pz'), run = 0, X = function (i) { return 8 + i * 14; };
    var svg = '<svg viewBox="0 0 100 64" class="ss-svg"><circle class="ss-star" cx="-10" cy="8" r="2.4"/>';
    for (var i = 0; i < 7; i++) {
      var hh = 18 + (i * 37 % 4) * 2, x0 = X(i) - 6, y0 = 62 - hh;
      svg += '<g class="ss-h" data-i="' + i + '"><rect x="' + x0 + '" y="' + y0 + '" width="12" height="' + hh + '" rx="1"/>';
      for (var k = 0; k < HW[i]; k++) svg += '<rect x="' + (x0 + 1.6 + k * 3.4) + '" y="' + (y0 + 4) + '" width="2.2" height="2.6" fill="#ffd27a" opacity=".9"/>';
      for (var j = 0; j < HJ[i]; j++) svg += '<ellipse cx="' + (x0 + 3 + j * 4.5) + '" cy="' + (y0 - 1.4) + '" rx="1.5" ry="1.6" fill="#a8693a"/>';
      svg += '<rect class="ss-door" x="' + (X(i) - 1.4) + '" y="57" width="2.8" height="5"/></g>';
    }
    w.innerHTML = svg + '</svg><p class="tiny-note howto">별이 지붕들 위를 옮겨 다니며 쉬어 간다. 별이 「머물러 선」 그 집을 누르세요.</p>';
    w.querySelectorAll('.ss-h').forEach(function (g) {
      g.onclick = function () { if (A.locked('starstop')) return; if (+g.dataset.i === HFIN) { run++; A.closeModal(); A.solve(R); } else A.wrong('starstop', '별은 그 지붕에서 잠깐 쉬었을 뿐이다 — 단서와 맞지 않는다'); };
    });
    A.modal('별을 따라', w); BN.__ssFin = HFIN;
    var star = w.querySelector('.ss-star'), x = -10, y = 8, k = 0, my = ++run;
    (function go() {
      if (my !== run || !w.isConnected) return;
      var tx = X(HPATH[k % HPATH.length]), ty = 8 + (k % 2) * 3, t0 = performance.now(), sx = x, sy = y;
      (function step(now) { if (my !== run || !w.isConnected) return; var t = Math.min(1, (now - t0) / 1300), e = t * t * (3 - 2 * t); x = sx + (tx - sx) * e; y = sy + (ty - sy) * e - Math.sin(t * Math.PI) * 5; star.setAttribute('cx', x.toFixed(2)); star.setAttribute('cy', y.toFixed(2)); if (t < 1) requestAnimationFrame(step); else { k++; setTimeout(go, 1500); } })(t0);
    })();
  };
  // 몇 달 뒤 여관: 달라진 곳 일곱에서 글자 하나씩 → 이어 붙이면 그 집으로 가는 말
  var SYL = ['불', '골', '진', '끝', '켜', '집', '목'], PHRASE = ['골', '목', '끝', '불', '켜', '진', '집'];
  var diff0 = BN.PZ.diff;
  BN.PZ.diff = function (R, A) {
    var S = A.S(); S.f4 = S.f4 || {};
    var solve0 = A.solve, A2 = Object.assign({}, A, { solve: function () { A.toast('달라진 곳마다 숨은 글자 하나 — 「' + SYL.join(' ') + '」'); setTimeout(function () { order(A, '흩어진 글자 일곱', '달라진 곳에서 나온 글자들이다. 그 가족이 머무는 곳을 말하는 대로 이어 보세요.', PHRASE, 'diff', function () { solve0(R); }); }, 900); } });
    if ((S.f4.diff || []).length >= 7) return A2.solve(R);
    diff0(R, A2);
    function label() { document.querySelectorAll('.diff-pz .df-mark').forEach(function (m) { if (m.dataset.t) return; var k = (BN.DIFF4 || []).findIndex(function (d) { return m.style.left === d[1] + '%' && m.style.top === d[2] + '%'; }); if (k >= 0) { m.dataset.t = 1; m.textContent = SYL[k]; } }); }
    var box = document.querySelector('.diff-pz .df-new'); if (box) { label(); new MutationObserver(label).observe(box, { childList: true }); }
  };
  // 그 집 문: 두드림 가락이 세 곳에 나뉘어 새겨져 있다 — 예물의 차례(마 2:11)로 이어야
  var KN = { gold: 'LSL', frank: 'SS', myrrh: 'LL' };
  (function () {
    var D = BN.ROOMS.door; if (!D) return;
    D.spots = D.spots.filter(function (s) { return ['window', 'camel', 'chests'].indexOf(s.id) < 0; });
    addClues('door', [['kn_f', 18, 42, 10, 14, '창틀에 새긴 무늬', '그 집 문 — 창틀: 「유향」 • •'], ['kn_g', 84, 72, 16, 18, '낙타 안장에 새긴 무늬', '그 집 문 — 낙타 안장: 「황금」 ━ • ━'], ['kn_m', 63, 84, 14, 10, '상자 뚜껑에 새긴 무늬', '그 집 문 — 상자 뚜껑: 「몰약」 ━ ━']]);
  })();
  need('knock', ['kn_f', 'kn_g', 'kn_m'], ['asaph', 0, '함부로 두드리면 안 된다. 이 집 사람들과 약속한 가락이 어딘가 새겨져 있을 게다.']);
  BN.PZ.knock = function (R, A) {
    var pat = (KN.gold + KN.frank + KN.myrrh).split(''); BN.__knock = pat.join('');
    var w = A.el('div', 'knock-pz'), got = [], t0 = 0;
    w.appendChild(A.el('p', 'tiny-note howto', '수첩에 적은 무늬를 떠올려요. ━ 은 꾹 눌렀다 떼고, • 은 톡.'));
    var dots = A.el('div', 'kn-dots'); w.appendChild(dots);
    var pad = A.el('button', 'kn-door', '🚪<small>누르고 있으면 길게</small>'); w.appendChild(pad);
    var row = A.el('div', 'disc-btns'), clr = A.el('button', 'btn ghost', '처음부터'), go = A.el('button', 'btn gold', '다 두드렸다'); row.appendChild(clr); row.appendChild(go); w.appendChild(row);
    function show() { dots.innerHTML = got.map(function (g) { return '<i class="' + g + '"></i>'; }).join(''); }
    pad.addEventListener('pointerdown', function (e) { e.preventDefault(); t0 = performance.now(); pad.classList.add('dn'); });
    pad.addEventListener('pointerup', function () { if (!t0) return; var d = performance.now() - t0; t0 = 0; pad.classList.remove('dn'); if (got.length < 12) { got.push(d >= 420 ? 'L' : 'S'); A.tick(); show(); } });
    clr.onclick = function () { got = []; show(); };
    go.onclick = function () {
      if (A.locked('knock')) return;
      if (got.join('') === pat.join('')) { A.closeModal(); var S = A.S(); S.f4 = S.f4 || {}; S.f4.pc = S.f4.pc || []; if (S.f4.pc.indexOf('C') < 0) { S.f4.pc.push('C'); A.toast('🧩 문지방 틈에 끼어 있던 양피지 조각 (두루마리 조각 ' + S.f4.pc.length + '/4)'); } A.save(); A.solve(R); }
      else { A.wrong('knock', '안에서 아무 대답이 없다 — 가락이 다르다'); got = []; show(); }
    };
    A.modal('그 집 문', w);
  };

  // ════ 5장 ════
  addClues('pack', [['pk_bread', 8, 45, 5, 8, '항아리 속 빵'], ['pk_water', 92, 33, 5, 8, '벽에 걸린 물부대'], ['pk_blanket', 73, 47, 5, 8, '베틀에 걸친 담요'], ['pk_lamp', 52, 40, 5, 7, '탁자 위 작은 등잔'], ['pk_barley', 12, 80, 5, 8, '바구니 속 보리']]);
  need('pack', ['pk_bread', 'pk_water', 'pk_blanket', 'pk_lamp', 'pk_barley'], ['gilead', 2, '짐을 싸야 하는데 짐이 다 흩어져 있어요! 집 안을 다 뒤져야겠어요.']);
  addClues('escape', [['esc_rule', 8, 30, 6, 9, '골목 벽에 긁힌 순찰 기록', '골목 — 순찰 기록: 「등불 든 자는 나귀 방울이 한 번 울릴 때마다(나귀가 한 걸음 가거나 멈출 때마다) 등불을 오른쪽으로 한 번 돌린다.」']]);
  need('stealth', ['esc_rule'], ['asaph', 0, '순찰꾼들이 등불을 어떻게 돌리는지 모르고 나서면 붙잡힌다. 벽을 살펴보아라.']);

  // ════ 시각·문서 대조(11/27): 같은 일을 서로 다른 시계로 적은 두 기록을 맞대어 진실을 알아낸다 ════
  // 기록을 남긴 사람은 모두 지어낸 인물(궁 문지기 · 망대 파수꾼 · 순찰대 · 성문 파수꾼)
  function xcheck(A, title, recs, qs, key, onDone) {
    var pick = qs.map(function () { return -1; }), w = A.el('div', 'xc-pz');
    function draw() {
      w.innerHTML = '<div class="xc-recs">' + recs.map(function (r) { return '<div class="xc-rec"><b>' + r[0] + '</b>' + r[1].map(function (l) { return '<p><em>' + l[0] + '</em>' + l[1] + '</p>'; }).join('') + '</div>'; }).join('') + '</div>';
      qs.forEach(function (q, i) {
        var row = A.el('div', 'xc-q', '<b>' + q[0] + '</b>'), box = A.el('div', 'xc-opts');
        q[1].forEach(function (o, j) { var b = A.el('button', 'xc-o' + (pick[i] === j ? ' on' : ''), o); b.onclick = function () { pick[i] = j; if (A.tick) A.tick(); draw(); }; box.appendChild(b); });
        row.appendChild(box); w.appendChild(row);
      });
      var go = A.el('button', 'btn gold block', '이대로 정하기'); w.appendChild(go);
      go.onclick = function () {
        if (A.locked(key)) return;
        if (pick.some(function (x) { return x < 0; })) return A.toast('모두 골라야 해요');
        if (pick.every(function (x, i) { return x === qs[i][2]; })) { A.sfx('ok'); A.closeModal(); onDone(); }
        else A.wrong(key, '두 기록이 맞지 않는다 — 같은 일이 어느 시각에 적혔는지 다시 보자');
      };
    }
    draw(); A.modal(title, w);
    if (LOCAL) BN.__xcWin = function () { pick = qs.map(function (q) { return q[2]; }); draw(); w.querySelector('.btn.gold').click(); };
  }
  function recNote(r) { return r[0] + ' — ' + r[1].map(function (l) { return l[0] + ': ' + l[1]; }).join(' · '); }
  // 3장 회의실: 궁 물시계(2시간 느림) ↔ 성 시각 — 대제사장들이 나간 뒤 손님을 「가만히」 들인 때(마 2:7)
  var X3G = ['궁 문지기 일지 · 궁 물시계', [['8시', '동방 손님들의 낙타 방울이 들림'], ['10시', '대제사장과 서기관들이 회의실에서 나감'], ['11시', '쪽문 빗장을 열고 손님들을 들임']]];
  var X3W = ['성 망대 파수꾼 일지 · 성 시각', [['10시', '동방에서 온 낙타 방울, 궁 쪽으로'], ['11시', '망대 등잔을 갈아 끼움']]];
  addClues('council', [['xt_gate', 50, 60, 5, 7, '탁자 밑에 떨어진 궁 문지기 일지', recNote(X3G)]]);
  addClues('archive', [['xt_watch', 66, 52, 5, 8, '항아리 곁에 꽂힌 망대 일지 사본', recNote(X3W)]]);
  (function () { var R = BN.ROOMS.council; if (R) R.spots.push({ id: 'xclock', x: 28, y: 50, w: 10, h: 16, act: 'puzzle:xtime3' }); })();
  need('xtime3', ['xt_gate', 'xt_watch'], ['asaph', 0, '왕이 손님을 언제 들였는지는 기록을 맞춰 봐야 안다. 궁의 일지만으로는 모른다 — 성 망대의 기록도 있어야 해.']);
  BN.PZ.xtime3 = function (R, A) {
    var S = A.S(); S.f3 = S.f3 || {};
    if (S.f3.xt) return A.talk([['asaph', 0, '왕은 성 시각으로 한밤 1시에 손님들을 가만히 들였다. 이제 어느 문인지 알아보자.']]);
    xcheck(A, '두 시계의 기록', [X3G, X3W], [['궁 물시계는 성 시각보다', ['같다', '1시간 느리다', '2시간 느리다', '1시간 빠르다'], 2], ['왕이 손님들을 들인 때(성 시각)', ['10시', '11시', '12시', '1시', '2시'], 3]], 'xtime3', function () {
      S.f3.xt = 1; A.save();
      A.talk([['asaph', 0, '낙타 방울이 궁에서는 8시, 망대에서는 10시. 궁 물시계가 두 시간 늦구나. 그러니 왕은 대제사장들을 다 내보내고, 성 시각으로 한밤 1시에야 손님들을 들였다.'], ['asaph', 0, '이제 어느 문으로 들였는지 시종들의 말을 따져 보자.']]);
    });
  };
  var liar0 = BN.PZ.liar;
  BN.PZ.liar = function (R, A) { if (!(A.S().f3 || {}).xt) return A.talk([['asaph', 0, '어느 문인지 따지기 전에, 왕이 손님을 언제 들였는지부터 알아야 한다. 물시계 곁의 기록을 맞춰 보아라.']]); liar0(R, A); };
  // 5장 골목: 순찰대 물시계(1시간 느림) ↔ 성 시각 — 북쪽 골목이 비고 쪽문이 열리는 때(마 2:14 「밤에」)
  var X5P = ['순찰대 물시계 기록', [['2시', '첫닭이 욺'], ['3시', '북쪽 골목 순찰 교대 — 골목이 잠깐 빔'], ['4시', '남쪽 골목 순찰 교대']]];
  var X5G = ['성문 파수꾼 일지 · 성 시각', [['3시', '첫닭이 욺'], ['4시', '북쪽 쪽문 빗장을 엶(물 긷는 이들)'], ['5시', '쪽문을 닫음']]];
  addClues('escape', [['xt_patrol', 30, 86, 6, 8, '길바닥에 떨어진 순찰대 기록', recNote(X5P)], ['xt_gate5', 90, 14, 6, 8, '성문 탑에 걸린 파수꾼 일지', recNote(X5G)]]);
  (function () { var R = BN.ROOMS.escape; if (R) R.spots.push({ id: 'xclock5', x: 8, y: 72, w: 10, h: 14, act: 'puzzle:xtime5' }); })();
  need('xtime5', ['xt_patrol', 'xt_gate5'], ['asaph', 0, '언제 나설지 정하려면 순찰대와 성문, 두 쪽의 기록이 다 있어야 한다.']);
  BN.PZ.xtime5 = function (R, A) {
    var S = A.S(); S.f5 = S.f5 || {};
    if (S.f5.xt) return A.talk([['asaph', 0, '성 시각으로 4시. 북쪽 골목이 비고 쪽문이 열린다. 지금이다.']]);
    xcheck(A, '떠날 시각', [X5P, X5G], [['순찰대 물시계는 성 시각보다', ['같다', '1시간 느리다', '2시간 느리다', '1시간 빠르다'], 1], ['떠날 때(성 시각)', ['2시', '3시', '4시', '5시'], 2]], 'xtime5', function () {
      S.f5.xt = 1; A.save();
      A.talk([['asaph', 0, '첫닭이 순찰대 기록에는 2시, 성문 일지에는 3시. 순찰대 물시계가 한 시간 늦구나. 북쪽 골목이 비는 순찰 3시는 성 시각 4시 — 마침 쪽문 빗장이 열리는 때다.'], ['gilead', 2, '(속삭임) 그럼 지금 가요. 발소리 죽이고….', '(나귀 고삐를 쥔다)']]);
    });
  };
  var stealth0 = BN.PZ.stealth;
  BN.PZ.stealth = function (R, A) { if (!(A.S().f5 || {}).xt) return A.talk([['asaph', 0, '아무 때나 나서면 붙잡힌다. 언제 떠날지부터 정하자 — 왼쪽 물시계 곁에서.']]); stealth0(R, A); };

  // ════ 힌트(1단계 = 어디를 찾을지 · 2단계 = 어떻게 생각할지 · 3단계 = 답) ════
  setHints('road', ['길 위의 등잔 받침 밑과 오른쪽 나무 기둥을 살펴요. 지도 상자는 두 단서를 다 찾아야 열려요. 상자를 누르면 30걸음 걷기(안 되면 누르기).', '밤 지도를 끌어 강·산이 낮 지도와 겹치게 하면 별 셋이 갈림길에 앉아요(딱 붙지 않으니 눈으로 맞춰요). 출발 → 큰 별 → 중간 별 → 작은 별 → 베들레헴으로, 한 걸음마다 길을 따라 곧게 한 방향. 그 방향을 지도 오른쪽 위 나침반(붉은 글자가 북)으로 읽어요 — 위가 북쪽이 아니에요.', function (S) { return S.roadAns ? '이 지도의 답(출발 → 큰 별 → 중간 별 → 작은 별 → 베들레헴): ' + S.roadAns : '출발에서 별을 따라 베들레헴까지 간 네 걸음의 방향. (지도 상자를 한 번 열면 이 칸에 내 지도의 답이 보여요)'; }]);
  setHints('inn', ['손님 쪽지 여섯이 마당 곳곳에 날아가 있어요: 2층 난간, 별 간판, 문틈, 항아리 밑, 계단 위, 왼쪽 처마 등잔 옆.', '쪽지마다 성경 구절이 있어요 — 레 12:8 비둘기 · 눅 5:1-2 호수(물고기) · 시 52:8 감람나무(올리브) · 마 20:1 포도원. 세리는 상인과 같은 층.', '물고기=상인, 별=세리, 포도=목수 형제, 올리브=과부, 비둘기=제사장 가족+레위인 → 그리고 요셉과 마리아는 「있을 곳이 없다」']);
  setHints('kitchen', ['식탁보 밑, 그리고 탁자 위 그릇들을 등잔으로 비춰 보세요(나사렛 길에서 얻은 등잔).', '8되를 4되씩. 작은 그릇(3되)을 큰 단지로 되붓는 것이 열쇠예요. 일곱 번이면 돼요.', '8→5, 5→3, 3→8, 5→3, 8→5, 5→3, 3→8 (단지 4 · 중간 4)']);
  setHints('angel', ['노래 조각 일곱이 들판에 흩어져 반짝여요 — 바위, 지팡이, 모닥불, 망토 둘, 담, 양 곁.', '누가복음 2장 14절의 차례대로. 그다음 가락은 잘 듣고 같은 건반을 따라 눌러요(한 마디씩 길어져요).', function (S) { return '「지극히 높은 곳에서는 → 하나님께 → 영광이요 → 땅에서는 → 하나님이 기뻐하신 → 사람들 중에 → 평화로다」, 그다음 가락' + (S.chorusSeq ? ' — 건반(왼쪽부터 1~7번): ' + S.chorusSeq : ' 따라 하기(가락을 한 번 들으면 이 칸에 건반 번호가 보여요)'); }]);
  setHints('climb', ['돌판 조각 셋: 왼쪽 돌담 틈, 오른쪽 등잔 기둥 밑, 성벽 위쪽 틈.', '돌판의 구절은 시편 120~134편 「성전에 올라가는 노래」의 첫 절. 성경에서 찾아 편 번호 차례로 밀어 맞춰요. 그다음 폰을 기울여 비둘기 둘을 모아 맨 위 문으로.', '120 · 121 · 122 · 123 · 125 · 126 · 127 · 133편 차례로, 왼쪽 위부터 가로로.']);
  setHints('court', ['저울추 넷(1·3·9·27)이 뜰에 흩어져 있어요: 새장 밑, 왼쪽 항아리 곁, 오른쪽 의자 밑, 맨 오른쪽 자루.', '가짜 동전: 세 닢씩 두 번 달면 찾아요. 저울: 추는 새장 쪽에 올리면 빼는 셈. 제물은 레위기 12장 8절.', '제물: 산비둘기 두 마리. 가짜 동전: 3·3으로 달아 가벼운 쪽(같으면 나머지)에서 1·1. 저울: 27 → 9 → 3 → 1.']);
  setHints('porch', ['시므온의 찬송이 행각 네 곳에 새겨져 있어요: 왼쪽 기둥 밑동, 가운데 기둥 그늘, 등잔 걸이, 오른쪽 벽 끝.', '누가복음 2장 29~32절의 차례대로 잇고, 이어진 찬송을 소리 내어 끝까지 읽어요(마이크가 안 되면 어절을 차례로 누르기).', '「주재여」 → 「내 눈이」 → 「이는 만민 앞에」 → 「이방을 비추는 빛이요」 → 소리 내어 읽기']);
  setHints('council', ['먼저 「언제」: 탁자 밑의 궁 문지기 일지, 그리고 서고(앞 장소) 항아리 곁의 망대 일지 사본. 왼쪽 물시계를 눌러 맞춰요. 그다음 「어느 문」: 시종 넷(왼쪽 위 등잔, 가운데 매달린 등잔 아래, 탁자 끝 등잔 곁, 오른쪽 끝 항아리 곁).', '두 일지에 함께 나오는 일(낙타 방울)이 각각 몇 시에 적혔는지 보면 두 시계의 차이가 나와요. 문은 「한 사람만 거짓말」 — 한 명씩 거짓말쟁이라고 놓고 따져요.', '궁 물시계는 2시간 느리다 → 성 시각 1시 · 서문 · 향 피우는 시종']);
  setHints('nightroad', ['길 왼쪽 바위 밑과 박사들의 낙타 행렬을 살펴요. 오른쪽 큰 바위 곁에는 두루마리 조각도 있어요.', '별은 여러 지붕에서 쉬어 가요. 쉬는 곳마다 다 맞는 게 아니라, 단서 두 개에 다 맞는 집이 「머물러 선」 곳(마 2:9).', '창이 셋, 지붕에 항아리가 둘인 집 — 왼쪽에서 넷째 집']);
  setHints('innl', ['1장 여관 그림과 비교해요. 하늘·2층 난간·창·간판·마당 양쪽. 달라진 곳마다 글자가 하나씩 나와요. 길르앗은 「가장 가난한 왕」을 물어요.', '글자 일곱을 이으면 그 가족이 머무는 곳 — 여관 주인이 손으로 가리킨 곳이에요. 넌센스: 「임금」은 왕이라는 뜻.', '「골목 끝 불 켜진 집」 · 넌센스: 최저임금']);
  setHints('door', ['약속한 가락이 세 곳에 나뉘어 새겨져 있어요: 왼쪽 창틀, 오른쪽 낙타 안장, 문 앞 상자 뚜껑.', '세 무늬에 예물 이름이 붙어 있어요. 박사들이 예물을 드린 차례(마 2:11)대로 이어 두드려요. ━ 은 꾹(0.4초 넘게), • 은 톡.', '황금 ━ • ━ → 유향 • • → 몰약 ━ ━ (모두 일곱 번)']);
  setHints('pack', ['짐 다섯이 집 안에 흩어져 있어요: 왼쪽 큰 항아리, 오른쪽 벽의 그물 바구니, 베틀, 탁자 위, 왼쪽 아래 바구니.', '안장 주머니 4×4 = 16칸, 짐도 16칸어치. 물부대는 맨 아래 줄, 강보는 맨 위 줄.', '맨 위: 담요 담요 빵 강보 / 둘째: 담요 담요 빵 빵 / 셋째: 보배합 보배합 보리 보리 / 맨 아래: 물부대 물부대 물부대 등잔']);
  setHints('escape', ['골목 지도 곳곳을 살펴요 — 왼쪽 위 벽의 순찰 기록, 아래쪽 길바닥의 순찰대 기록, 오른쪽 위 성문 탑의 파수꾼 일지. 왼쪽 물시계를 눌러 떠날 시각부터 정해요.', '두 기록에 함께 나오는 첫닭으로 시계 차이를 구하고, 골목이 비는 때와 쪽문이 열리는 때가 겹치는 성 시각을 골라요. 골목에서는 나귀가 한 칸 가거나 기다릴 때마다 등불이 오른쪽(시계 방향)으로 한 칸 돌아요. 가려는 칸이 다음 차례에 비칠지 미리 세어 보고, 비칠 것 같으면 기다려요.', '순찰대 물시계는 1시간 느리다 → 성 시각 4시 · 골목: 기다림 2 → ▶▶ → ▲ → 기다림 → ▲ → ◀◀ → ▲▲▲ → ▶▶ → ▼ → ▶▶ → ▲ → ▶ → 기다림 → ▶ → ▲▲▲']);

  // ════ 하는 법: 퍼즐 화면에도 보이고, 힌트 창 맨 위에도 무료로 ════
  setHints('porch', ['행각을 둘러보다 기둥 사이를 눌러요.', '「이스라엘의 위로를 기다리는 자」(눅 2:25). 기다림이 열쇠예요. 찬송이 새겨지면 누가복음 2장 29~32절 차례로 잇고, 소리 내어 끝까지 읽어요.', '기다리기 90초(아무것도 누르지 않기) → 기둥 곳곳의 찬송 넷 찾기 → 「주재여」 → 「내 눈이」 → 「이는 만민 앞에」 → 「이방을 비추는 빛이요」 → 소리 내어 읽기']);
  var HOW = {
    wellroom: '두루마리 조각 둘을 차례로 누르면 자리가 바뀌어요.',
    gate: '명부 조각을 눌러 고른 뒤 아래 빈칸을 누르면 놓여요(놓인 조각을 누르면 돌아가요).',
    road: '지도 상자를 누르면 먼저 30걸음 걷기(폰을 들고 걷거나 「한 걸음씩 누르기」). 그다음 밤 지도를 손가락으로 끌어 낮 지도에 겹쳐요(딱 붙지 않아요). 자물쇠 네 칸은 누를 때마다 북→동→남→서로 바뀌어요.',
    well: '우물 안을 손가락으로 문질러 등잔으로 비춰요. 수정 조각(둥근 테)을 손가락으로 끌어 글씨 위에 대고, 「가까이 ↔ 멀리」 막대로 초점을 맞추면 글씨가 또렷해져요(수정 조각은 여관 부엌에서 얻어요). 막대로 줄 길이를 정해 끌어올려요.',
    inn: '손님을 누르고 방을 누르면 들어가요(방을 다시 누르면 빠져요).',
    kitchen: '그릇을 누르고 다른 그릇을 누르면 부어요(가득 차거나 빌 때까지).',
    field: '상자를 누르면 양 몰기 — 손가락을 양 뒤에 대면 양이 피해 달아나요(입구는 우리 아래 가운데). 숫자 자물쇠는 양이 우는 횟수(방에서 양을 눌러 세요), 별 원판은 돌려서 맞춰요.',
    angel: '주운 조각은 차례로 누르고, 가락은 「다시 듣기」로 들은 뒤 같은 건반을 눌러요(소리를 끄면 건반 빛을 보세요).',
    stable: '화면을 문질러 등잔으로 비추고, 찾은 것을 눌러요. 기름이 떨어지면 기름 쟁반을 폰을 기울여(또는 손가락으로 끌어) 등잔까지.',
    house8: '조각을 빈칸에 넣고 눌러 돌려요(ㅏ를 돌리면 ㅜ).',
    climb: '빈 자리 옆 돌판을 누르면 밀려 들어가요. 그다음 폰을 기울여(또는 화면을 끌어) 새장을 굴려요 — 벽에 세게 부딪히면 처음부터.',
    tgate: '문의 숫자를 맞춰 열어요.',
    court: '동전은 저울 양쪽에 올려 달아 봐요. 큰 저울은 추를 누를 때마다 「추 쪽 → 새장 쪽 → 내림」으로 바뀌어요.',
    anna: '등잔 받침의 자물쇠를 맞춰요.',
    magi: '기구: 「기구 들기」 뒤 폰을 세워 들고 몸을 돌려, 아래 방향 띠와 오른쪽 높이 눈금을 맞추면 별이 원 안에 들어와요 — 2초 그대로(안 되면 「바퀴로」: 바깥 고리는 방향, 안쪽 바늘은 높이). 거울: 칸을 누를 때마다 거울 방향이 바뀌어요.',
    archive: '바구니 상자는 누를 때마다 옮겨져요. 원판은 돌려서 바깥·안쪽 고리가 마주 보는 글자를 짝으로 읽어요.',
    council: '물시계: 두 기록을 보고 시계 차이와 시각을 고른 뒤 「이대로 정하기」. 탁자: 바퀴 둘(들일 문 · 거짓말한 사람)을 돌려 정해요.',
    hall: '쪽지는 거울에 비춰 읽고, 편지와 반지는 하나씩 골라요.',
    roof: '별 둘을 차례로 누르면 선이 이어져요(다시 누르면 지워져요).',
    nightroad: '별이 머물러 선 집을 누르면 돼요.',
    innl: '아래 그림에서 달라진 곳을 누르고, 나온 글자를 차례로 눌러 이어요.',
    door: '문을 꾹(0.4초 넘게) 누르면 길게, 톡 누르면 짧게.',
    worship: '카드는 두 장씩 뒤집어 짝을 찾아요. 예물은 예물을 누르고 그림자를 눌러요. 경배는 폰을 화면이 바닥을 향하게 엎어 5초(안 되면 10초 누르기). 직소는 두 조각을 차례로 누르면 바뀌고, 같은 조각을 두 번 누르면 돌아가요.',
    dream: '꿈 카드를 골라 차례로 놓아요. 등잔은 마이크에 「후—」 길게 불어요(안 되면 5초 누르기).',
    pack: '짐을 고른 뒤 칸을 누르면 그 칸이 짐의 왼쪽 위가 돼요. 넣은 짐을 누르면 빠져요.',
    escape: '물시계: 두 기록을 보고 시계 차이와 떠날 시각을 골라요. 골목: ▲▼◀▶로 한 칸씩, ⏸로 기다려요(나귀 옆 칸을 눌러도 돼요). 노란 칸에 들어가면 들켜요.',
    dawn: '베들레헴에서 손가락을 떼지 말고 애굽까지 그어요. 물이 떨어지면 처음부터. 다 그으면 방울을 세 번 — 폰을 흔들거나(아이폰은 「흔들기 켜기」) 방울을 눌러요.',
    wellgate: '원판을 돌려 맞추고, 도장을 차례로 눌러 놓아요.'
  };
  (function () { var F = (BN.HINTS_CH1 && BN.HINTS_CH1.field) || (BN.HINTS && BN.HINTS.field); if (F) setHints('field', [F[0], F[1], function () { return '자물쇠: ' + (BN.fieldCode ? BN.fieldCode() : '') + ' (방울을 저물 때 → 밤중 → 닭 울 때 → 새벽 순서로 놓고 그 양의 울음 횟수) · 그다음 하늘 원판을 돌려 큰 별 넷을 눈금 넷에.'; }]); })();
  BN.HOW = HOW;   // 힌트 창 맨 위에 무료로 보인다(game.js hintOil)

  // ════ 「왜 하는지」는 언제나 화면 맨 위에(하는 법은 힌트로) — 창 이름으로 붙인다 ════
  var WHY = {
    '찢긴 두루마리': '찢긴 두루마리 조각들. 바르게 이어 붙이면 글이 다시 이어진다.',
    '명부 조각 맞추기': '인구조사 명부에서 다윗 집안 칸이 찢겨 있다. 계보가 바르게 이어져야 명부를 받을 수 있다.',
    '명부 조각': '인구조사 명부에서 다윗 집안 칸이 찢겨 있다. 계보가 바르게 이어져야 명부를 받을 수 있다.',
    '나사렛에서 오는 길': '나사렛에서 베들레헴까지는 사흘 길이 넘는다. 요셉과 마리아처럼 걸어서 지도 상자까지 가자.',
    '두 장의 지도': '낮의 길이 그려진 지도와 밤하늘 지도. 출발에서 별을 따라 베들레헴까지 가는 길을 알아내야 상자가 열린다.',
    '우물 안': '다윗이 그토록 마시고 싶어 한 성문 곁 우물(삼하 23:15). 바닥에 무언가 있는데 깜깜하다.',
    '손님 쪽지': '여관 주인이 오늘 밤 손님들 방을 정해 달라고 부탁했다. 손님마다 바라는 것이 다르다.',
    '기름 나누기': '여관 주인의 부탁 — 기름을 두 손님께 똑같이 나눠 드려야 한다. 그런데 눈금 있는 그릇이 하나도 없다.',
    '양 몰기': '목자들의 상자는 들판 건너편에 있다. 흩어진 양들을 저마다 제 우리에 들여야 상자에 갈 수 있다.',
    '목자의 상자': '목자들의 상자가 잠겨 있다. 양들이 무언가 알려 주는 것 같다.',
    '천군의 노래 조각': '천군의 찬송이 조각조각 흩어졌다. 바르게 이어지면 그 노래가 다시 들릴 것이다.',
    '천군의 노래': '천군이 부른 노래의 가락이 들려온다. 함께 따라 부르자.',
    '바위 굴 안': '어두운 바위 굴 마구간. 천사가 말한 「표적」을 찾아야 한다(눅 2:12).',
    '기름 나르기': '등잔 기름이 다 떨어졌다. 기름 쟁반을 한 방울도 흘리지 않고 등잔까지 옮겨야 한다.',
    '성전에 올라가는 노래': '예루살렘으로 오르는 계단의 돌판이 뒤섞여 있다. 순례자들이 올라가며 부르던 노래의 돌판이다.',
    '새장을 흔들지 말고': '제물로 드릴 산비둘기 두 마리를 새장에 모아 성전 문까지 데려가야 한다(레 12:8).',
    '장수의 저울': '비둘기 장수의 큰 저울. 제물의 무게를 맞춰야 값을 치를 수 있다.',
    '별 재는 기구': '박사들이 별을 재던 놋쇠 기구. 오늘 밤 「그의 별」이 떠 있는 자리를 겨누어야 한다.',
    '놋거울과 등잔 빛': '천막 안 등잔 빛을 별 지도까지 보내야 지도에 숨은 것이 드러난다.',
    '자음 원판': '자음이 새겨진 놋쇠 원판 두 겹. 독서대의 알 수 없는 글을 읽는 열쇠 같다.',
    '지붕 위 하늘': '왕궁 지붕에서 남쪽 하늘을 본다. 박사의 별 지도에 그려진 그 별자리는 어디에 있을까?',
    '별을 따라': '박사들이 따라온 별이 베들레헴 지붕들 위를 옮겨 다닌다. 아기가 있는 집은 어디일까?',
    '그 밤과 다른 곳': '위: 그 밤의 여관(1장) · 아래: 몇 달 뒤. 무엇이 달라졌을까?',
    '흩어진 글자 일곱': '달라진 곳에서 나온 글자 일곱. 이으면 그 가족이 있는 곳을 말해 줄 것 같다.',
    '그 집 문': '이 밤에 낯선 이가 두드리면 문을 열지 않는다. 약속된 가락이어야 한다.',
    '예언 카드 뒤집기': '「이는 주께서 선지자로 하신 말씀을 이루려 하심이라」 — 선지자의 말씀은 어디서 이루어졌을까?',
    '세 예물의 그림자': '보배합 곁에 등잔을 놓자 벽에 그림자 넷이 비친다. 그림자 밑에는 구절 번호가 긁혀 있다.',
    '엎드려 경배': '박사들은 아기를 보고 엎드려 경배했다(마 2:11).',
    '요셉의 꿈': '꿈 이야기 다섯 장. 요셉이 꿈으로 들은 말씀은 넷이다.',
    '등잔': '불빛이 새어 나가면 헤롯의 사람들이 알아챈다. 등잔을 꺼야 한다.',
    '나귀 짐': '안장 주머니는 4×4칸. 짐을 빈틈없이 다 넣어야 나귀가 흔들리지 않는다.',
    '골목 빠져나가기': '순찰꾼들이 등불을 들고 골목을 지킨다. 들키지 않고 성문까지 가야 한다.',
    '애굽으로 가는 길': '헤롯의 손을 피해 애굽까지 — 남쪽 광야를 건너는 먼 길이다.',
    '시므온의 찬송': '시므온이 아기를 안고 부른 찬송이 기둥마다 새겨졌다.',
    '두 시계의 기록': '왕은 박사들을 「가만히」 불렀다(마 2:7). 대제사장들이 다 나간 뒤였을까? 궁 안 물시계와 성 망대의 시계는 서로 다르게 간다.',
    '떠날 시각': '「밤에」 떠나야 한다(마 2:14). 순찰이 바뀌어 골목이 비고 성문 쪽문이 열리는 때는 언제일까? 순찰대 물시계와 성 시각은 서로 다르게 간다.'
  };
  // ════ 속마음 한 줄(11/27): 「왜」 아래에 [ … ] — 답은 말하지 않고 생각할 방향만 ════
  var THINK = {
    '찢긴 두루마리': '찢긴 선이 이어지게 놓으면 문장이 될 것 같은데… 어디서 들어 본 말씀 같기도 하고…',
    '명부 조각': '순서가 뒤죽박죽으로 섞여 있고, 명부에 없던 이름도 끼어 있는 것 같은데… 조각의 금빛 줄이 이어지게 놓으면 뭔가 나오지 않을까? 성경 어디에 이 계보가 적혀 있는 것 같기도 하고…',
    '나사렛에서 오는 길': '정말로 걸어 봐야 하나? 폰을 들고 몇 걸음 가 보면 알겠지…',
    '두 장의 지도': '출발 깃발에서 별을 따라가면 베들레헴에 닿을 것 같은데… 별이 점점 작아지네? 아니면 점점 커지는 건가? 밤 지도를 강과 산에 꼭 맞춰야 별이 어느 갈림길에 앉는지 보이겠지. 그런데 이 지도는 위가 북쪽이 아니잖아? 나침반을 봐야겠다.',
    '우물 안': '너무 깜깜해… 등잔으로 비추면 벽에 뭐가 적혀 있을지도. 글씨가 너무 작으면 맑은 돌을 대고 가까이, 멀리 움직여 볼까? 줄은 얼마나 내려야 하지?',
    '손님 쪽지': '손님마다 성경 구절을 하나씩 들먹이네… 그 구절에 나오는 것이 방마다 그려진 그림이랑 이어지는 것 같은데?',
    '기름 나누기': '눈금 없는 그릇 셋으로 똑같이… 이리 붓고 저리 붓다 보면 딱 맞는 양이 남지 않을까?',
    '양 몰기': '양마다 방울 무늬가 다르네… 밤을 넷으로 나눈 말씀이 있었던 것 같은데, 그 시각이 우리에 붙어 있는 건가?',
    '목자의 상자': '자물쇠 칸이 넷… 양들이 우는 횟수랑 상관이 있을 것 같은데. 어떤 차례로 세어야 하지?',
    '천군의 노래 조각': '조각마다 말씀 한 토막씩… 천군이 하나님을 찬송한 그 말의 차례가 있을 텐데…',
    '천군의 노래': '가락을 잘 듣고 그대로 따라 하면 될 것 같은데… 한 마디씩 길어지네?',
    '바위 굴 안': '어두워서 아무것도 안 보여… 천사가 목자들에게 뭐라고 했더라? 표적이 뭐였지?',
    '기름 나르기': '흘리지 않게 조심조심… 폰을 기울이면 쟁반이 움직이나?',
    '명부의 빈칸 · 이름': '천사가 일컬은 그 이름… 조각을 돌려 맞추면 글자가 될 것 같은데.',
    '명부의 빈칸 · 이름의 까닭': '그 이름을 주신 까닭이 천사의 말에 있었는데…',
    '성전에 올라가는 노래': '돌판마다 노래의 첫 줄이 새겨져 있네… 이 노래들, 시편 어딘가에 차례대로 있지 않았나?',
    '새장을 흔들지 말고': '비둘기 두 마리를 모아야 하는데… 폰을 기울이면 새장이 굴러가나?',
    '이름을 받은 날부터 며칠 뒤?': '사내아이를 낳은 여인의 정결 날수… 율법에 적혀 있을 텐데. 그런데 문지기는 어느 날부터 세는 거지?',
    '환전상의 아홉 닢': '아홉 닢 가운데 하나만 가볍다면… 몇 번 달아야 확실히 찾을 수 있을까?',
    '제물 고르기': '그 가족이 율법대로 드린 제물이 뭐였더라? 레위기 어딘가에…',
    '장수의 저울': '추가 1, 3, 9, 27… 이걸로 어떤 무게든 달 수 있을까? 새장 쪽에 추를 올리면 어떻게 되지?',
    '기다림': '「기다리는 사람」이었다던데… 그냥 가만히 있어 보면 어떨까?',
    '시므온의 찬송': '찬송이 조각조각 흩어져 있네… 시므온이 아기를 안고 부른 그 찬송의 차례가 있을 텐데.',
    '기도하는 이의 이름표': '성전을 떠나지 않고 기도한 그 여선지자… 지파와 아버지 이름, 나이가 누가복음에 다 적혀 있었던 것 같은데.',
    '별 재는 기구': '일지에 적힌 밤마다 방향과 높이가 조금씩 달라지네… 오늘 밤은 어디쯤일까?',
    '가죽 일지': '밤마다 적힌 방향과 높이… 무슨 규칙이 있는 것 같은데?',
    '놋거울과 등잔 빛': '빛을 꺾어서 별 눈금을 다 지나가게 하려면 거울을 어디에 놓아야 할까?',
    '박사의 별 지도': '이 지도는 어느 쪽을 위로 그린 거지? 박사들은 해 뜨는 쪽에서 왔다던데…',
    '독서대의 두루마리': '알 수 없는 글자들… 이름을 거꾸로 적은 일이 성경에 있었던 것 같은데?',
    '자음 원판': '두 고리를 돌려 짝을 맞추면 저 이상한 글이 읽힐 것 같은데…',
    '두루마리 꼬리표': '글씨가 너무 작아… 맑은 돌 같은 게 있으면 보일 텐데.',
    '서가': '두루마리가 이렇게 많은데… 아무거나 꺼내면 안 될 것 같아. 어디선가 읽은 자리 안내가 있었는데?',
    '두 시계의 기록': '같은 일이 두 기록에 다른 시각으로 적혀 있네… 시계가 서로 다르게 간다면, 진짜 시각은 언제지?',
    '회의실 · 시종들의 말': '한 사람만 거짓말이라면… 한 명씩 「이 사람이 거짓말쟁이」라고 놓고 따져 보면 어떨까?',
    '접힌 쪽지': '글자가 다 뒤집혀 있어… 무언가에 비춰 보면 읽힐까?',
    '봉인된 편지': '편지가 셋… 끈이 어떻게 묶였는지가 다르네?',
    '다시 봉인하기': '반지로 찍으면 자국은 어떻게 찍히지? 좌우가…?',
    '지붕 위 하늘': '박사의 지도에 그려진 별자리… 지붕에서 남쪽을 보고 서면 지도를 어느 쪽으로 돌려야 할까?',
    '별을 따라': '별이 여러 지붕에서 쉬어 가네… 길에서 찾은 단서랑 맞는 집이 있을 텐데.',
    '그 밤과 다른 곳': '1장에서 본 그 여관이랑 어디가 달라졌지? 하나하나 견주어 보자…',
    '흩어진 글자 일곱': '글자 일곱… 여관 주인이 손으로 가리키던 곳 같은데?',
    '그 집 문': '아무렇게나 두드리면 안 열어 줄 거야… 어딘가 새겨 둔 가락이 있었던 것 같은데. 예물의 차례랑 상관이 있나?',
    '예언 카드 뒤집기': '선지자의 말씀과 그 말씀이 이루어진 자리가 짝일 텐데… 어디 있었는지 기억해 둬야겠다.',
    '세 예물의 그림자': '그림자 밑에 구절 번호… 그 구절에 이 예물이 나오는 건가? 그림자 하나는 예물과 상관없어 보이는데.',
    '엎드려 경배': '박사들이 한 것처럼… 엎드리면 되나?',
    '요셉의 꿈': '꿈 이야기가 다섯… 그중 요셉이 꾼 것만 골라서 일어난 차례대로 놓아야 할 것 같은데.',
    '등잔': '불빛이 새어 나가면 안 돼… 훅 불어 끄면 되나?',
    '나귀 짐': '짐이 모두 몇 칸이지? 빈틈없이 다 들어가야 할 텐데… 무거운 건 아래로.',
    '떠날 시각': '첫닭이 두 기록에 다른 시각으로 적혀 있네… 골목이 비는 때와 문이 열리는 때가 겹치는 순간이 있을까?',
    '골목 빠져나가기': '등불이 한 걸음마다 돌아가네… 순찰 기록대로라면 다음엔 어디를 비추지?',
    '애굽으로 가는 길': '물이 네 걸음치밖에 없어… 우물에서 우물로 이어 가려면 어떻게 돌아가야 할까? 마을을 들르는 차례도 있었지.',
    '우물 문 · 다섯 원판': '숫자 다섯… 다섯 장을 지나며 수첩에 적어 둔 숫자들 같은데?',
    '열두 도장': '받은 차례가 아니라고? 새겨진 구절이 성경에 나오는 차례…'
  };
  BN.THINK = THINK;

  function sen(t) { return String(t).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }).replace(/([.?!…])\s+(?![\]」])/g, '$1\u0000').split('\u0000').map(function (x) { return '<span class="sen">' + x + '</span>'; }).join(' '); }
  BN.sen = sen;
  function put(b, t) {
    if (!b || !t) return;
    if (THINK[t] && !b.querySelector('.think')) { var k = document.createElement('p'); k.className = 'think'; k.innerHTML = sen('[ ' + THINK[t] + ' ]'); b.insertBefore(k, b.firstChild); }
    if (WHY[t] && !b.querySelector('.why')) { var q = document.createElement('p'); q.className = 'why'; q.innerHTML = sen(WHY[t]); b.insertBefore(q, b.firstChild); }
  }
  function addWhy() {
    var m = document.getElementById('modal');
    if (m && !m.hidden) { var t = (document.getElementById('modalTitle') || {}).textContent, b = document.getElementById('modalBody'); put(b, t); }
    document.querySelectorAll('.ov7').forEach(function (o) { put(o.querySelector('.ov7-body'), (o.querySelector('.ov7-head b') || {}).textContent); });
  }
  function startWhy() { new MutationObserver(addWhy).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] }); }
  if (document.body) startWhy(); else addEventListener('DOMContentLoaded', startWhy);

  // 시험용: 모든 단서 한꺼번에
  if (LOCAL) BN.__allClues = function () { var C = {}; Object.keys(BN.NEED).forEach(function (k) { BN.NEED[k].c.forEach(function (c) { C[c] = 1; }); }); return C; };
})(window.BN);
