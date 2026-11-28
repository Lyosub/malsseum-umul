// 「베들레헴의 밤」 5장 v2 (2026-11-28): 유형 장부에서 넘치던 둘을 바꾸고 새 문제 넷
//  요셉의 꿈: 꿈 말씀 ↔ 구절 짝 맞추기(차례 맞추기 대신) · 흩어진 자모로 「애굽으로」(넌센스 대신) · 천사가 보여 준 길 기억
//  떠날 채비: 물부대 나누기(10 · 7 · 3 → 5 · 5) → 짐 싸기
//  골목: 벽의 분필 자국 원근 맞추기(쪽문 숫자) → 순찰 피하기
//  광야 길: 꿈에서 본 길 기억 → 이정표
//  우물 문: 마지막 가림판 겹쳐 읽기 → 다섯 장 숫자 원판
(function (BN) {
  var R = BN.ROOMS, LOCAL = /^(127\.0\.0\.1|localhost)$/.test(location.hostname);
  function rnd(S, n) { var s = (S.created % 9973) + 7 * n + 1; return function () { s = (s * 16807) % 2147483647; return s / 2147483647; }; }
  function mix(r, a) { a = a.slice(); for (var q = a.length - 1; q > 0; q--) { var t = Math.floor(r() * (q + 1)), x = a[q]; a[q] = a[t]; a[t] = x; } return a; }
  function why(t, a, b) { if (BN.WHY) BN.WHY[t] = a; if (BN.THINK) BN.THINK[t] = b; }
  function g5(S) { S.f5x = S.f5x || {}; return S.f5x; }
  function f5(S) { S.f5 = S.f5 || {}; return S.f5; }
  function gate(name, key, say) { var o = BN.PZ[name]; BN.PZ[name] = function (Rm, A) { if (!g5(A.S())[key]) return A.talk(say); return o(Rm, A); }; }
  var DREAM_NEED = ['dreams', 'lamp', 'riddle5'];
  function dreamFlag(Rm, A, key, lines) { var S = A.S(), F = f5(S); F[key] = 1; A.save(); A.sfx('ok'); A.closeModal(); if (DREAM_NEED.every(function (k) { return F[k]; })) return A.solve(Rm); if (lines) A.talk(lines); }

  // ════ 꿈: 꿈 말씀 ↔ 구절 짝(짝 맞추기). 박사들의 꿈 하나가 섞여 있다
  var DR = [['「다윗의 자손 요셉아 네 아내 마리아 데려오기를 무서워하지 말라…」', '마 1:20'], ['「…일어나 아기와 그의 어머니를 데리고 애굽으로 피하여…」', '마 2:13'], ['「일어나 아기와 그의 어머니를 데리고 이스라엘 땅으로 가라…」', '마 2:20'], ['…꿈에 지시하심을 받아 갈릴리 지방으로 떠나가', '마 2:22'], ['…꿈에 헤롯에게로 돌아가지 말라 지시하심을 받아…', '마 2:12']];
  var REFS = ['마 1:20', '마 2:12', '마 2:13', '마 2:20', '마 2:22'];
  BN.PZ.dreams = function (Rm, A) {
    var S = A.S(); if (f5(S).dreams) return A.talk([['asaph', 0, '꿈 말씀은 이미 다 맞추었다.']]);
    var r = rnd(S, 501), ord = mix(r, [0, 1, 2, 3, 4]), v = [null, null, null, null, null], w = A.el('div', 'gen-wrap');
    function draw() {
      w.innerHTML = '<p class="gen-help" style="text-align:center">꿈 다섯 — 그 말씀이 성경 어디에 있는지 <b>구절을 하나씩</b> 짝지으세요. 한 꿈은 요셉이 아니라 박사들의 꿈이에요.</p>' +
        ord.map(function (k, i) { return '<div class="dm-row"><span>' + DR[k][0] + '</span><button class="btn ghost" data-i="' + i + '">' + (v[i] === null ? '구절 고르기' : REFS[v[i]]) + '</button></div>'; }).join('') + '<button class="btn gold block" id="dmOk" style="margin-top:8px">다 짝지었어요</button>';
      w.querySelectorAll('[data-i]').forEach(function (b) { b.onclick = function () { var i = +b.dataset.i; v[i] = v[i] === null ? 0 : (v[i] + 1) % REFS.length; draw(); }; });
      w.querySelector('#dmOk').onclick = function () {
        if (A.locked('dreams')) return;
        if (!ord.every(function (k, i) { return v[i] !== null && REFS[v[i]] === DR[k][1]; })) return A.wrong('dreams', '짝이 맞지 않는 꿈이 있다 — 성경을 펴 보자');
        S.notes.push({ text: '요셉의 꿈 넷: 마 1:20 · 2:13 · 2:20 · 2:22(박사들의 꿈은 2:12).', ref: '마태복음 2:13' }); dreamFlag(Rm, A, 'dreams', [['asaph', 0, '지금은 두 번째 꿈이다. 「일어나… 애굽으로 피하여」. 서둘러야 한다.']]);
      };
    }
    draw(); A.modal('요셉의 꿈', w);
    if (LOCAL) BN.__dreams = function () { ord.forEach(function (k, i) { v[i] = REFS.indexOf(DR[k][1]); }); draw(); };
  };
  why('요셉의 꿈', '들보 위에 꿈 이야기 다섯 장이 걸려 있다. 요셉은 꿈으로 몇 번이나 말씀을 들었을까?', '이 말씀들이 성경 어디에 있었지? 박사들이 꾼 꿈도 하나 섞인 것 같은데…');

  // ════ 길르앗: 흩어진 자모로 말 만들기(글자 조립) — 「애굽으로」
  var JAMO = ['ㅇ', 'ㅐ', 'ㄱ', 'ㅜ', 'ㅂ', 'ㅇ', 'ㅡ', 'ㄹ', 'ㅗ'];
  BN.PZ.riddle5 = function (Rm, A) {
    var S = A.S(); if (f5(S).riddle5) return A.talk([['gilead', 2, '쉿… 이제 정말 조용히 가야 해요.', '(발끝으로 걷는 중)']]);
    var r = rnd(S, 511), j = mix(r, JAMO), w = A.el('div', 'gen-wrap');
    w.innerHTML = '<div class="note"><b>길르앗이 바닥에 흩어 놓은 글자 조각</b><div class="an-tiles">' + j.map(function (c) { return '<i>' + c + '</i>'; }).join('') + '</div><small>(속삭임) 「천사님이 어디로 피하라고 하셨더라… 이 조각 아홉 개를 다 써서 네 글자로!」</small></div><div class="rm-ans"><input id="anIn" maxlength="6" placeholder="네 글자" autocomplete="off" spellcheck="false"><button class="btn gold" id="anOk">속삭이기</button></div>';
    A.modal('흩어진 글자 조각', w);
    w.querySelector('#anOk').onclick = function () {
      if (A.locked('riddle5')) return;
      if ((w.querySelector('#anIn').value || '').replace(/\s/g, '') !== '애굽으로') return A.wrong('riddle5', '길르앗: 「(속삭임) 땡… 조각을 다 써야 해요」');
      dreamFlag(Rm, A, 'riddle5', [['gilead', 1, '애굽으로! 맞아요… 그런데 진짜로 후다닥 가야 해요. 소리는 내지 말고요.', '(진지)']]);
    };
  };
  why('흩어진 글자 조각', '길르앗이 바닥에 자음·모음 조각 아홉을 흩어 놓았다. 천사가 말한 곳이라는데…', '조각을 하나도 남기지 말고 써야겠지. 받침이 들어간 글자도 있을까?');

  // ════ 꿈: 천사가 보여 준 길(기억 배치) → 광야 길
  var PLACES = [['🏘', '베들레헴'], ['⛺', '헤브론'], ['🏜', '브엘세바'], ['🌊', '애굽 시내'], ['🏛', '애굽']];
  R.dream.spots.push({ id: 'vision', x: 50, y: 22, w: 18, h: 14, act: 'puzzle:vision', label: '✨ 꿈에 본 길', extra: 1 });
  function visionData(S) { var r = rnd(S, 521); return mix(r, [0, 1, 2, 3, 4, 5, 6, 7, 8]).slice(0, 5); }
  BN.PZ.vision = function (Rm, A) {
    var S = A.S(), F = g5(S), cells = visionData(S), put = {}, pick = null, phase = 'look', w = A.el('div', 'gen-wrap');
    if (F.vision) return A.toast('✔ 꿈에 본 길은 이미 기억해 두었어요');
    function draw() {
      var at = {}; if (phase === 'look') cells.forEach(function (c, i) { at[c] = PLACES[i][0] + '<small>' + PLACES[i][1] + '</small>'; }); else Object.keys(put).forEach(function (c) { at[c] = PLACES[put[c]][0] + '<small>' + PLACES[put[c]][1] + '</small>'; });
      w.innerHTML = '<p class="gen-help" style="text-align:center">' + (phase === 'look' ? '꿈속에서 본 남쪽 길의 땅 다섯 — <b>잘 봐 두세요</b>' : '꿈이 흐려졌다. <b>땅을 고르고, 본 자리를 누르세요</b>') + '</p><div class="mm-grid vs">' + [0, 1, 2, 3, 4, 5, 6, 7, 8].map(function (c) { return '<button class="mm-c" data-c="' + c + '">' + (at[c] || '') + '</button>'; }).join('') + '</div>' +
        (phase === 'put' ? '<div class="mm-pick">' + PLACES.map(function (p, i) { var used = Object.keys(put).some(function (c) { return put[c] === i; }); return '<button class="btn ' + (pick === i ? 'gold' : 'ghost') + '" data-g="' + i + '"' + (used ? ' disabled' : '') + '>' + p[0] + '</button>'; }).join('') + '</div><div class="bag-act"><button class="btn ghost" id="vsClr">다시 놓기</button><button class="btn gold" id="vsOk">이렇게 보았어요</button></div>' : '');
      if (phase !== 'put') return;
      w.querySelectorAll('[data-g]').forEach(function (b) { b.onclick = function () { pick = +b.dataset.g; draw(); }; });
      w.querySelectorAll('.mm-c').forEach(function (b) { b.onclick = function () { var c = +b.dataset.c; if (put[c] !== undefined) { delete put[c]; return draw(); } if (pick === null) return; put[c] = pick; pick = null; draw(); }; });
      w.querySelector('#vsClr').onclick = function () { put = {}; draw(); };
      w.querySelector('#vsOk').onclick = function () {
        if (A.locked('dream')) return;
        if (!cells.every(function (c, i) { return put[c] === i; })) { A.wrong('dream', '꿈이 다시 흐려진다 — 한 번 더 보여 줄게요'); put = {}; phase = 'look'; draw(); return setTimeout(function () { if (w.isConnected) { phase = 'put'; draw(); } }, 4000); }
        F.vision = 1; S.notes.push({ text: '꿈에 본 남쪽 길: 베들레헴 → 헤브론 → 브엘세바 → 애굽 시내 → 애굽.', ref: '마태복음 2:14' }); A.save(); A.sfx('ok'); A.closeModal(); A.toast('꿈에 본 길을 기억했다 — 광야 길에서 쓰일 것 같다');
      };
    }
    draw(); A.modal('꿈에 본 길', w);
    setTimeout(function () { if (w.isConnected) { phase = 'put'; draw(); } }, 4500);
    if (LOCAL) BN.__vision = function () { cells.forEach(function (c, i) { put[c] = i; }); phase = 'put'; draw(); };
  };
  why('꿈에 본 길', '들보 곁 어둠 속에, 꿈에서 본 남쪽 길의 땅들이 잠깐 떠오른다.', '금방 흐려질 것 같다… 어느 땅이 어디쯤 있었는지 칸으로 외워 두자.');
  gate('route', 'vision', [['asaph', 0, '갈림길이 많구나. 꿈에서 본 길을 떠올려야 한다 — 요셉의 집 들보 곁에서 본 그것 말이다.', '(✨ 꿈에 본 길 — 요셉의 꿈 장소)']]);

  // ════ 떠날 채비: 물부대 나누기(10 · 7 · 3 → 5 · 5)
  R.pack.spots.push({ id: 'skins', x: 67, y: 76, w: 9, h: 14, act: 'puzzle:skins', label: '💧 물부대', extra: 1 });   // 11/28: 짐 「벽에 걸린 물부대」 자리와 겹치지 않게 베틀 아래 바구니로(길르앗과도 안 겹치게)
  R.pack.spots.forEach(function (sp) { if (sp.id === 'cl_pk_lamp') { sp.x = 53; sp.y = 48; } });   // 탁자 위 등잔 그림 자리
  BN.PZ.skins = function (Rm, A) {
    var S = A.S(), F = g5(S), cap = [10, 7, 3], v = [10, 0, 0], sel = null, n = 0, w = A.el('div', 'gen-wrap');
    if (F.skins) return A.toast('✔ 물은 이미 둘로 똑같이 나눴어요');
    function draw() {
      w.innerHTML = '<div class="note">마리아와 요셉이 하나씩 질 물. <b>열 되를 다섯 되씩 둘로</b> — 눈금 있는 그릇은 없다.</div><div class="sk-row">' + cap.map(function (c, i) { return '<button class="sk' + (sel === i ? ' sel' : '') + '" data-i="' + i + '"><span class="sk-in" style="height:' + (v[i] / c * 100) + '%"></span><b>' + v[i] + '</b><small>' + c + '되 부대</small></button>'; }).join('') + '</div><p class="gen-help" style="text-align:center">부대를 누르고 다른 부대를 누르면 부어요(가득 차거나 빌 때까지). 부은 횟수 ' + n + '</p><button class="btn ghost block" id="skRe">처음부터</button>';
      w.querySelectorAll('.sk').forEach(function (b) { b.onclick = function () { var i = +b.dataset.i; if (sel === null) { sel = i; return draw(); } if (sel !== i) { var m = Math.min(v[sel], cap[i] - v[i]); v[sel] -= m; v[i] += m; n++; } sel = null; draw(); if (v[0] === 5 && v[1] === 5) { F.skins = 1; S.notes.push({ text: '떠날 채비: 물부대 10 · 7 · 3되로 다섯 되씩 둘로 나눴다(' + n + '번 부음).', ref: '' }); A.save(); A.sfx('ok'); setTimeout(function () { A.closeModal(); A.toast('물을 다섯 되씩 나눴다 — 이제 짐을 쌀 수 있다'); }, 600); } }; });
      w.querySelector('#skRe').onclick = function () { v = [10, 0, 0]; n = 0; sel = null; draw(); };
    }
    draw(); A.modal('물부대', w);
    if (LOCAL) BN.__skins = function () { v = [5, 2, 3]; sel = 2; draw(); w.querySelectorAll('.sk')[1].click(); };
  };
  why('물부대', '광야 길에 가져갈 물이 열 되. 두 사람이 똑같이 나눠 져야 하는데, 그릇은 일곱 되와 세 되짜리뿐이다.', '7되 부대를 채우고, 3되로 덜어서… 부엌에서 기름을 나눌 때처럼 해 볼까?');
  gate('pack', 'skins', [['gilead', 1, '물부대부터 나눠야 짐을 쌀 수 있대요. 한쪽만 무거우면 나귀가 넘어진대요.', '(💧 물부대)']]);

  // ════ 골목: 벽의 분필 자국 원근 맞추기 → 쪽문 숫자
  var SEG = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
  var SP = { a: [[0, 0], [1, 0]], b: [[1, 0], [1, 1]], c: [[1, 1], [1, 2]], d: [[0, 2], [1, 2]], e: [[0, 1], [0, 2]], f: [[0, 0], [0, 1]], g: [[0, 1], [1, 1]] };
  function chalk(S) { var r = rnd(S, 531), code = [1 + Math.floor(r() * 9), Math.floor(r() * 10), Math.floor(r() * 10)], segs = []; code.forEach(function (d, k) { SEG[d].split('').forEach(function (s) { var p = SP[s]; segs.push([[-110 + k * 80 + p[0][0] * 50, -60 + p[0][1] * 60], [-110 + k * 80 + p[1][0] * 50, -60 + p[1][1] * 60]].map(function (q) { return [q[0], q[1], (r() - .5) * 260]; })); }); }); return { code: code.join(''), segs: segs, y0: -(35 + r() * 15), p0: 22 + r() * 10 }; }
  function proj(q, yaw, pit) { var a = yaw * Math.PI / 180, b = pit * Math.PI / 180, x = q[0] * Math.cos(a) + q[2] * Math.sin(a), z = -q[0] * Math.sin(a) + q[2] * Math.cos(a), y = q[1] * Math.cos(b) - z * Math.sin(b); return [x, y]; }
  R.escape.spots.push({ id: 'chalk', x: 14, y: 40, w: 14, h: 16, act: 'puzzle:chalk', label: '✎ 벽의 분필 자국', extra: 1 });
  BN.PZ.chalk = function (Rm, A) {
    var S = A.S(), F = g5(S), D = chalk(S), yaw = D.y0, pit = D.p0, drag = null, w = A.el('div', 'gen-wrap');
    if (F.chalk) return A.toast('✔ 쪽문 숫자는 이미 알아냈어요');
    w.innerHTML = '<div class="ps-box"><svg viewBox="-160 -110 320 220" id="chSvg"></svg><span class="ps-hint">↔ ↕ 끌어서 보는 자리를 옮겨요</span></div><div class="rm-ans"><input id="chIn" inputmode="numeric" maxlength="3" placeholder="성문 쪽문 자물쇠(숫자 셋)"><button class="btn gold" id="chOk">맞추기</button></div>';
    A.modal('벽의 분필 자국', w);
    var svg = w.querySelector('#chSvg');
    function draw() { var near = Math.abs(yaw) < 5 && Math.abs(pit) < 5; svg.innerHTML = '<rect x="-160" y="-110" width="320" height="220" fill="#4a4036"/>' + D.segs.map(function (s) { var a = proj(s[0], yaw, pit), b = proj(s[1], yaw, pit); return '<line x1="' + a[0].toFixed(1) + '" y1="' + a[1].toFixed(1) + '" x2="' + b[0].toFixed(1) + '" y2="' + b[1].toFixed(1) + '" stroke="' + (near ? '#fffbe8' : '#d9d2c2') + '" stroke-width="7" stroke-linecap="round" opacity=".85"/>'; }).join(''); }
    svg.addEventListener('pointerdown', function (e) { drag = { x: e.clientX, y: e.clientY, yaw: yaw, pit: pit }; try { svg.setPointerCapture(e.pointerId); } catch (er) {} });
    svg.addEventListener('pointermove', function (e) { if (!drag) return; yaw = Math.max(-80, Math.min(80, drag.yaw + (e.clientX - drag.x) * .35)); pit = Math.max(-60, Math.min(60, drag.pit + (e.clientY - drag.y) * .35)); draw(); });
    svg.addEventListener('pointerup', function () { drag = null; });
    draw();
    w.querySelector('#chOk').onclick = function () { if (A.locked('escape')) return; if ((w.querySelector('#chIn').value || '').replace(/\D/g, '') !== D.code) return A.wrong('escape', '그 숫자는 아니다'); F.chalk = 1; S.notes.push({ text: '골목 벽 분필 자국을 맞는 자리에서 보니 「' + D.code + '」 — 성문 쪽문 자물쇠 숫자.', ref: '' }); A.save(); A.sfx('ok'); A.closeModal(); A.talk([['asaph', 0, '누군가 쪽문 숫자를 벽에 흩어 적어 두었구나. 이제 순찰꾼들 눈을 피해 쪽문까지 가자.']]); };
    if (LOCAL) BN.__chalk = D.code;
  };
  why('벽의 분필 자국', '골목 벽에 분필 자국이 어지럽게 흩어져 있다. 성문 쪽문 자물쇠에는 숫자 칸이 셋.', '아무렇게나 그은 것 같지 않아… 어느 자리에서 보면 이어지지 않을까?');
  gate('stealth', 'chalk', [['asaph', 0, '쪽문까지 가도 자물쇠 숫자를 모르면 소용없다. 벽을 잘 보아라.', '(✎ 벽의 분필 자국)']]);

  // ════ 우물 문: 마지막 가림판 겹쳐 읽기 → 다섯 장 숫자 원판
  var G2 = ['하', '나', '님', '이', '함', '께'], GP = ['베', '들', '레', '헴', '별', '빛', '예', '수', '구', '유', '강', '보', '목', '자', '천', '사', '박', '경', '배', '애', '굽', '꿈', '길', '밤'];
  function gRot(p, k) { var y = p[0], x = p[1]; for (var i = 0; i < k; i++) { var t = y; y = x; x = 5 - t; } return [y, x]; }
  function g2Data(S) { var r = rnd(S, 541), reps = []; for (var y = 0; y < 3; y++) for (var x = 0; x < 3; x++) reps.push([y, x]); reps = mix(r, reps); var holes = reps.slice(0, 6).map(function (p) { return gRot(p, Math.floor(r() * 4)); }), K = 1 + Math.floor(r() * 3), cells = []; for (var i = 0; i < 36; i++) cells.push(GP[Math.floor(r() * GP.length)]); holes.map(function (h) { return gRot(h, K); }).sort(function (a, b) { return a[0] * 6 + a[1] - (b[0] * 6 + b[1]); }).forEach(function (p, i) { cells[p[0] * 6 + p[1]] = G2[i]; }); return { holes: holes, cells: cells }; }
  R.wellgate.spots.push({ id: 'lastgrille', x: 22, y: 50, w: 14, h: 18, act: 'puzzle:lastg', label: '✦ 마지막 가림판', extra: 1 });
  BN.PZ.lastg = function (Rm, A) {
    var S = A.S(), F = g5(S), D = g2Data(S), cur = 0, w = A.el('div', 'gen-wrap');
    if (F.lastg) return A.toast('✔ 가림판으로 이미 읽었어요 — 「하나님이 함께」');
    function draw() {
      var open = {}; D.holes.forEach(function (h) { var p = gRot(h, cur); open[p[0] * 6 + p[1]] = 1; });
      w.innerHTML = '<div class="gr-wrap"><div class="gr-grid">' + D.cells.map(function (c, i) { return '<span class="' + (open[i] ? 'hole' : 'cover') + '">' + c + '</span>'; }).join('') + '</div><i class="gr-notch" style="transform:rotate(' + (cur * 90) + 'deg)"><b>▲</b></i></div><div class="gr-row"><button class="btn ghost" id="lgRot">⟳ 가림판 돌리기</button></div><div class="rm-ans"><input id="lgIn" maxlength="10" placeholder="구멍으로 읽은 말" autocomplete="off" spellcheck="false"><button class="btn gold" id="lgOk">적기</button></div>';
      w.querySelector('#lgRot').onclick = function () { cur = (cur + 1) % 4; draw(); };
      w.querySelector('#lgOk').onclick = function () { if (A.locked('wellgate')) return; if ((w.querySelector('#lgIn').value || '').replace(/\s/g, '') !== G2.join('')) return A.wrong('wellgate', '그런 말은 읽히지 않는다'); F.lastg = 1; S.notes.push({ text: '우물 문 판에 마지막 가림판을 겹쳐 읽은 말: 「하나님이 함께」 — 임마누엘(마 1:23).', ref: '마태복음 1:23' }); A.save(); A.sfx('ok'); A.closeModal(); A.talk([['keeper', 0, '하나님이 함께… 그게 이 밤 내내 숨어 있던 말이야. 이제 우물 문을 열 수 있어.']]); };
    }
    draw(); A.modal('마지막 가림판', w);
  };
  why('마지막 가림판', '우물 문 곁 판에 글자가 빼곡하다. 1장에서 쓰던 가림판처럼 구멍 뚫린 판이 하나 더 걸려 있다.', '성문 명부 때처럼 돌려 보면 되겠지. 이번에는 무슨 말이 숨어 있을까?');
  gate('dial', 'lastg', [['keeper', 0, '문을 열기 전에, 곁에 걸린 마지막 가림판부터 읽어 봐.', '(✦ 마지막 가림판)']]);

  // ── 힌트
  function prep(k, a, b, c) { var o = BN.HINTS[k] || []; BN.HINTS[k] = [a + ' ' + (o[0] || ''), b + ' ' + (o[1] || ''), function (S) { return c(S) + ' · ' + (typeof o[2] === 'function' ? o[2](S) : (o[2] || '')); }]; }
  prep('dream', '꿈 다섯을 구절과 짝지어요(박사들의 꿈 하나 섞임). 길르앗의 글자 조각은 천사가 말한 피할 곳. ✨ 꿈에 본 길은 광야에서 쓰여요.', '요셉의 꿈은 마 1:20 · 2:13 · 2:20 · 2:22, 박사들의 꿈은 2:12.', function () { return '꿈: 구절대로 · 글자 조각: 「애굽으로」 · 꿈에 본 길: 보여 준 그대로'; });
  prep('pack', '💧 물부대: 10되를 5되씩 — 부엌 기름 나누기처럼.', '10→7, 7→3, 3→10을 되풀이해요.', function () { return '물: 10→7, 7→3, 3→10, 7→3, 3→10, 7→3, 10→7, 7→3, 3→10'; });
  prep('escape', '✎ 벽의 분필 자국: 끌어서 보는 자리를 옮기면 숫자 셋이 돼요.', '정면에서 볼 때 이어져요.', function (S) { return '쪽문 숫자 ' + chalk(S).code; });
  prep('wellgate', '✦ 마지막 가림판: 돌려 가며 구멍 여섯으로 읽어요.', '말이 되는 방향은 하나뿐 — 임마누엘의 뜻.', function () { return '가림판: 「하나님이함께」'; });
})(window.BN);
