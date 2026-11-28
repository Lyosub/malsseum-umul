// 「베들레헴의 밤」 2장 v2 (2026-11-28): 문제 여섯 더하고 넌센스를 님 게임으로 — 1장 견본과 같은 방식
//  여드레째 집: 이름 조각 · 길르앗과 빵 조각 가져가기(님 게임)
//  오르는 길: 해시계(제 구 시) → 위 문 · 문양표 비석 · 새장 굴리기 · 돌판 밀기
//  성전 문: 문 위 그림 문자(문양표) → 놋채 · 날수 계산
//  성전 뜰: 헌금함 마방진 → 은전 → 제물 저울 · 가짜 동전
//  솔로몬 행각: 놋그릇 소리 높낮이(놋채) · 찬송 차례 · 기다리기
//  기도처: 벽 숨은 낱말(남은 글자 = 눅 2:38) · 안나
(function (BN) {
  var R = BN.ROOMS, LOCAL = /^(127\.0\.0\.1|localhost)$/.test(location.hostname);
  function rnd(S, n) { var s = (S.created % 9973) + 7 * n + 1; return function () { s = (s * 16807) % 2147483647; return s / 2147483647; }; }
  function mix(r, a) { a = a.slice(); for (var q = a.length - 1; q > 0; q--) { var t = Math.floor(r() * (q + 1)), x = a[q]; a[q] = a[t]; a[t] = x; } return a; }
  function H(k, list) { BN.HINTS = BN.HINTS || {}; BN.HINTS[k] = list; }
  function why(t, a, b) { if (BN.WHY) BN.WHY[t] = a; if (BN.THINK) BN.THINK[t] = b; }
  function f2(S) { S.f2 = S.f2 || {}; return S.f2; }
  function add(S, k) { if (S.items.indexOf(k) < 0) S.items.push(k); }
  function soundOn() { try { return localStorage.getItem('bethlehem.sound') !== '0'; } catch (e) { return true; } }
  var actx = null;
  function tone(f, len) { if (!soundOn()) return; try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); var t = actx.currentTime; [1, 2, 3].forEach(function (h) { var o = actx.createOscillator(), g = actx.createGain(); o.type = 'sine'; o.frequency.value = f * h; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.16 / h / h, t + .01); g.gain.exponentialRampToValueAtTime(.0005, t + (len || 1.4)); o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + (len || 1.4)); }); } catch (e) {} }
  BN.NEED = BN.NEED || {};

  BN.ITEMS.stick = ['놋채', 'img/items/stick.webp', '끝에 천을 감은 놋 막대. 무언가를 두드려 소리를 낸다.'];
  BN.ITEMS.silver = ['은전 다섯', 'img/items/silver.webp', '헌금함 곁 상자에서 나온 은전. 제물 값을 치를 수 있다.'];

  // ════ 여드레째 집 · 님 게임: 빵 조각 열다섯, 번갈아 1~3개, 마지막 조각을 가져가면 진다
  BN.PZ.riddle = function (Rm, A) {
    var S = A.S();
    if ((S.tiles || []).indexOf('ㅖ') >= 0) return A.talk([['gilead', 1, '조각은 드렸잖아요. 이제 빵 생각만 할래요.', '(이미 함)']]);
    var n = 15, turn = 'me', w = A.el('div', 'gen-wrap');
    function draw(msg) {
      w.innerHTML = '<div class="nim-rule">빵 조각 <b>' + n + '</b>개 · 번갈아 <b>1~3개</b>씩 가져가기 · <b>마지막 조각을 가져가는 사람이 진다</b></div>' +
        '<div class="nim-row">' + Array.from({ length: n }, function () { return '<i>🍞</i>'; }).join('') + '</div>' +
        '<p class="nim-msg">' + (msg || (turn === 'me' ? '내 차례 — 몇 개 가져갈까?' : '길르앗 차례…')) + '</p>' +
        '<div class="nim-btns">' + [1, 2, 3].map(function (k) { return '<button class="btn ' + (turn === 'me' && k <= n ? 'gold' : 'ghost') + '" data-k="' + k + '"' + (turn === 'me' && k <= n ? '' : ' disabled') + '>' + k + '개</button>'; }).join('') + '</div>';
      w.querySelectorAll('[data-k]').forEach(function (b) { b.onclick = function () { take(+b.dataset.k); }; });
    }
    function take(k) {
      if (turn !== 'me' || k > n) return; n -= k;
      if (n === 0) return lose();
      turn = 'gil'; draw('나: ' + k + '개 가져감'); setTimeout(gil, 900);
    }
    function gil() {
      var k = (n - 1) % 4; if (k === 0) k = 1; if (k > n) k = n; n -= k;
      if (n === 0) return win('길르앗이 마지막 조각을 집었다!');
      turn = 'me'; draw('길르앗: ' + k + '개 가져감 — 내 차례');
    }
    function lose() { A.wrong('riddle', '마지막 조각을 내가 집었다…'); A.talk([['gilead', 2, '헤헤, 마지막 조각은 선생님 거예요! 다시 해요?', '(빵을 이미 다 먹음)']]); n = 15; turn = 'me'; setTimeout(function () { if (w.isConnected) draw(); }, 400); }
    function win() {
      S.tiles = S.tiles || []; S.tiles.push('ㅖ'); A.save(); A.sfx('ok'); A.closeModal();
      A.talk([['gilead', 1, '으앗, 마지막 조각을 제가 집어 버렸어요! 졌다… 약속대로 조각 드릴게요.', '(조각 「ㅖ」를 내민다)'], ['asaph', 0, '남기는 수를 셈해 두면 지지 않는 법이지. 빵보다 셈이 먼저다.']]);
    }
    draw(); A.modal('길르앗과 빵 조각', w);
    if (LOCAL) BN.__nimWin = function () { win(); };
  };
  why('길르앗과 빵 조각', '길르앗이 이름 조각 하나를 걸고 빵 조각 내기를 하자고 한다. 마지막 조각을 집는 사람이 지는 내기.', '1~3개씩이면… 내가 가져간 뒤 몇 개가 남아야 길르앗이 어쩔 수 없이 지게 될까? 거꾸로 따져 보자.');

  // ════ 오르는 길 · 해시계(제 구 시) + 문양표 비석
  R.climb.spots.push({ id: 'cl_pray', x: 18, y: 56, w: 6, h: 9, act: 'clue:pray', msg: '길가 돌에 기도 시간이 새겨져 있다', note: '오르는 길 돌 — 「제 구 시 기도 시간에 … 성전에 올라갈새」(행 3:1). 성전 위 문은 기도 시간에 열린다.' });
  R.climb.spots.push({ id: 'cl_glyph', x: 8, y: 74, w: 7, h: 10, act: 'clue:glyph', msg: '돌비석에 문양과 글자의 짝이 새겨져 있다' });
  R.climb.spots.push({ id: 'sundial', x: 82, y: 52, w: 8, h: 12, act: 'puzzle:sundial', label: '☀ 해시계', extra: 1 });
  var GLY = ['🕎', '🐑', '🕊', '🌾', '🔥', '💧', '🍞', '⭐', '📜', '🔔'], SYL = ['정', '결', '예', '식', '법', '모', '세', '날', '차', '매'];
  function glyphMap(S) { var r = rnd(S, 201), g = mix(r, GLY); var m = {}; SYL.forEach(function (s, i) { m[s] = g[i]; }); return m; }
  Object.defineProperty(R.climb.spots[R.climb.spots.length - 2], 'note', { get: function () { var S = BN.ui && BN.ui.S && BN.ui.S(); if (!S) return ''; var m = glyphMap(S); return '문양표 비석 — ' + SYL.map(function (s) { return m[s] + '=' + s; }).join(' · '); }, configurable: true });
  BN.PZ.sundial = function (Rm, A) {
    var S = A.S(), F = f2(S);
    if (F.sun) return A.toast('✔ 위 문은 이미 열렸어요');
    var ang = 200, w = A.el('div', 'gen-wrap'), hold = null, drag = false;
    w.innerHTML = '<svg viewBox="-150 -150 300 270" class="sd-svg" id="sdSvg"></svg><div class="fd-hold" id="sdHold"><i></i><span>그림자가 눈금에 닿았다… 그대로</span></div><p class="gen-help" style="text-align:center;margin:4px 0 0">☀ 해를 끌어 하늘을 가로질러 옮겨요. 그림자는 해의 반대쪽으로 생겨요.</p>';
    A.modal('성전 문 앞 해시계', w);
    var svg = w.querySelector('#sdSvg'), bar = w.querySelector('#sdHold');
    function draw() {
      // 해: 위쪽 반원(오른쪽 = 동, 왼쪽 = 서). 그림자는 아래 판 위에 해의 반대쪽으로. 제 h시 = 해 각도 15h°
      var sa = ang * Math.PI / 180, sx = Math.cos(sa) * 128, sy = -Math.sin(sa) * 128, sh = (ang + 180) * Math.PI / 180;
      svg.innerHTML = '<path d="M-128 0 A128 128 0 0 1 128 0" fill="none" stroke="rgba(255,233,168,.25)" stroke-width="1.5" stroke-dasharray="3 6"/>' +
        '<path d="M-112 0 A112 112 0 0 0 112 0 Z" fill="#d9c08a" stroke="#8a6a3a" stroke-width="3"/>' +
        Array.from({ length: 11 }, function (_, i) { var h = i + 1, a = (180 + h * 15) * Math.PI / 180, c = Math.cos(a), n = -Math.sin(a); return '<line x1="' + (c * 64).toFixed(1) + '" y1="' + (n * 64).toFixed(1) + '" x2="' + (c * 88).toFixed(1) + '" y2="' + (n * 88).toFixed(1) + '" stroke="#5a3a14" stroke-width="' + (h % 3 ? 2 : 3.5) + '"/><text x="' + (c * 100).toFixed(1) + '" y="' + (n * 100 + 4).toFixed(1) + '" text-anchor="middle" font-size="11" font-weight="700" fill="#3a2410">' + h + '</text>'; }).join('') +
        '<line x1="0" y1="0" x2="' + (Math.cos(sh) * 86).toFixed(1) + '" y2="' + (-Math.sin(sh) * 86).toFixed(1) + '" stroke="#1a120a" stroke-width="6" stroke-linecap="round" opacity=".7"/><rect x="-4" y="-16" width="8" height="18" fill="#5a3a14"/>' +
        '<g transform="translate(' + sx.toFixed(1) + ',' + sy.toFixed(1) + ')"><circle r="14" fill="#ffd36a" stroke="#ffb02e" stroke-width="3"/></g>' +
        '<text x="140" y="-4" text-anchor="end" font-size="11" fill="#cfe0ff">동</text><text x="-140" y="-4" font-size="11" fill="#cfe0ff">서</text>';
    }
    function shadowH() { return ang / 15; }   // 제 몇 시
    function check() {
      if (F.sun) return; var near = Math.abs(shadowH() - 9) < .25 && !drag;
      if (!near) { if (hold) { clearTimeout(hold); hold = null; } bar.classList.remove('on'); return; }
      if (hold) return; bar.classList.remove('on'); void bar.offsetWidth; bar.classList.add('on');
      hold = setTimeout(function () { if (Math.abs(shadowH() - 9) >= .25 || drag) { hold = null; return; } F.sun = 1; S.notes.push({ text: '오르는 길 해시계: 그림자를 제 구 시(오후 세 시) 눈금에 — 기도 시간에 위 문이 열렸다(행 3:1).', ref: '사도행전 3:1' }); A.save(); A.sfx('ok'); A.closeModal(); A.talk([['narr', null, '그림자가 제 구 시 눈금에 닿자, 계단 위 문이 삐걱 열린다. 기도하러 올라가는 사람들의 발소리.'], ['asaph', 0, '기도 시간이로구나. 이제 올라가 보자.']]); }, 1500);
    }
    function pos(e) { var b = svg.getBoundingClientRect(); return { x: (e.clientX - b.left) / b.width * 300 - 150, y: (e.clientY - b.top) / b.height * 270 - 150 }; }
    svg.addEventListener('pointerdown', function (e) { drag = true; try { svg.setPointerCapture(e.pointerId); } catch (er) {} });
    svg.addEventListener('pointermove', function (e) { if (!drag) return; var q = pos(e); var a = Math.atan2(-q.y, q.x) * 180 / Math.PI; if (a < 0) a = a < -90 ? 180 : 0; ang = Math.max(0, Math.min(180, a)); draw(); if (hold && Math.abs(shadowH() - 9) >= .25) check(); });
    svg.addEventListener('pointerup', function () { drag = false; check(); });
    ang = 35; draw();
    if (LOCAL) BN.__sun = function (h) { ang = h * 15; draw(); drag = false; check(); };
  };
  why('성전 문 앞 해시계', '오르는 길 끝의 위 문이 닫혀 있다. 곁에 해시계가 있고, 그림자가 정해진 시각에 닿아야 문이 열리는 것 같다.', '기도 시간이 언제라고 했더라… 길가 돌에 적혀 있었지. 그림자는 해 반대쪽으로 생기니까, 해를 어디에 두어야 할까?');
  var climb0 = BN.PZ.climb;
  BN.PZ.climb = function (Rm, A) { var S = A.S(); if (!f2(S).sun) return A.talk([['narr', null, '계단 위 문이 닫혀 있다.'], ['gilead', 1, '문 옆에 해시계가 있어요. 기도 시간이 되어야 열리나 봐요.', '(☀ 해시계를 눌러 보자)']]); return climb0(Rm, A); };

  // ════ 성전 문 · 문 위 그림 문자 → 놋채
  R.tgate.spots.push({ id: 'glyphs', x: 66, y: 14, w: 24, h: 9, act: 'puzzle:glyph', label: '✦ 문 위 문양', extra: 1 });
  BN.PZ.glyph = function (Rm, A) {
    var S = A.S(), F = f2(S), m = glyphMap(S), word = ['정', '결', '예', '식'], w = A.el('div', 'gen-wrap');
    if (F.glyph) return A.toast('✔ 문 위 문양은 이미 풀었어요 — 놋채는 가방에');
    w.innerHTML = '<div class="gl-door">' + word.map(function (s) { return '<span>' + m[s] + '</span>'; }).join('') + '</div>' +
      ((S.clues || {}).glyph ? '<div class="note gl-tab"><b>문양표 비석(오르는 길)</b><div>' + SYL.map(function (s) { return '<i>' + m[s] + ' ' + s + '</i>'; }).join('') + '</div></div>' : '<p class="gen-help" style="text-align:center">이 문양을 읽을 표가 어딘가 있을 텐데…</p>') +
      '<div class="rm-ans"><input id="glIn" maxlength="6" placeholder="문양이 뜻하는 말" autocomplete="off" spellcheck="false"><button class="btn gold" id="glOk">말하기</button></div>';
    A.modal('문 위 문양', w);
    w.querySelector('#glOk').onclick = function () {
      if (A.locked('tgate')) return;
      if ((w.querySelector('#glIn').value || '').replace(/\s/g, '') !== '정결예식') return A.wrong('tgate', '문양과 맞지 않는다');
      F.glyph = 1; add(S, 'stick'); S.notes.push({ text: '성전 문 위 문양: 「정결예식」(눅 2:22) — 문지기 곁 놋채를 얻었다.', ref: '누가복음 2:22' }); A.save(); A.sfx('ok'); A.closeModal();
      A.talk([['narr', null, '「모세의 법대로 정결예식의 날이 차매」', '', '누가복음 2:22'], ['narr', null, '문 곁 받침대에 끝에 천을 감은 놋채가 놓여 있다.'], ['gilead', 2, '이걸로 뭘 두드리는 걸까요? 행각에 놋그릇이 줄지어 있던데…', '(놋채를 가방에 넣었다)']]);
    };
  };
  why('문 위 문양', '성전 문 위 돌에 문양 넷이 새겨져 있다. 그림처럼 보이지만 글자 같다.', '문양마다 글자가 하나씩일까? 짝을 적어 둔 표가 어딘가 있었던 것 같은데…');

  // ════ 성전 뜰 · 헌금함 마방진 → 은전 → 제물 저울
  R.court.spots.push({ id: 'offer', x: 93, y: 80, w: 9, h: 12, act: 'puzzle:magic', label: '💰 헌금함', extra: 1 });
  var LOSHU = [2, 7, 6, 9, 5, 1, 4, 3, 8];
  function loshuVar(S) { var r = rnd(S, 211), g = LOSHU.slice(), k = Math.floor(r() * 8); function rot(a) { return [a[6], a[3], a[0], a[7], a[4], a[1], a[8], a[5], a[2]]; } function flip(a) { return [a[2], a[1], a[0], a[5], a[4], a[3], a[8], a[7], a[6]]; } for (var i = 0; i < k % 4; i++) g = rot(g); if (k >= 4) g = flip(g); return g; }
  BN.PZ.magic = function (Rm, A) {
    var S = A.S(), F = f2(S), sol = loshuVar(S), giv = { 0: 1, 1: 1, 4: 1 }, v = sol.map(function (x, i) { return giv[i] ? x : 0; }), w = A.el('div', 'gen-wrap');
    if (F.magic) return A.toast('✔ 헌금함 상자는 이미 열었어요');
    function draw() {
      w.innerHTML = '<div class="note mg-rule">헌금함 곁 상자 — 「가로, 세로, 대각선 어느 줄을 더해도 <b>열다섯</b>. 1부터 9까지 한 번씩.」</div><div class="ms-grid">' + v.map(function (x, i) { return '<button class="ms-c' + (giv[i] ? ' fix' : '') + '" data-i="' + i + '">' + (x || '') + '</button>'; }).join('') + '</div><button class="btn gold block" id="msOk" style="margin-top:10px">상자 열기</button>';
      w.querySelectorAll('.ms-c:not(.fix)').forEach(function (b) { b.onclick = function () { var i = +b.dataset.i; v[i] = v[i] % 9 + 1; draw(); }; });
      w.querySelector('#msOk').onclick = function () {
        if (A.locked('court')) return;
        if (v.join() !== sol.join()) return A.wrong('court', '상자가 열리지 않는다 — 줄의 합을 다시 보자');
        F.magic = 1; add(S, 'silver'); S.notes.push({ text: '헌금함 곁 상자(줄의 합 열다섯) — 은전 다섯을 얻었다. 제물 값을 치를 수 있다.', ref: '' }); A.save(); A.sfx('ok'); A.closeModal();
        A.talk([['narr', null, '상자 안에 은전 다섯 닢이 들어 있다. 「제물을 살 이를 위하여」라는 작은 글씨.'], ['gilead', 1, '이제 비둘기 장수한테 값을 치를 수 있겠어요!']]);
      };
    }
    draw(); A.modal('헌금함 곁 상자', w);
    if (LOCAL) BN.__magic = sol;
  };
  why('헌금함 곁 상자', '헌금함 곁에 숫자 칸 아홉짜리 상자가 있다. 몇 칸은 이미 채워져 있다.', '어느 줄을 더해도 열다섯… 가운데가 5라면, 마주 보는 칸끼리 더하면 몇이 되지?');
  var scale0 = BN.PZ.scale;
  BN.PZ.scale = function (Rm, A) { var S = A.S(); if (!f2(S).magic) return A.talk([['narr', null, '비둘기 장수가 손바닥을 내민다. 값을 먼저 치르라는 듯.'], ['gilead', 1, '돈이 없어요… 저기 헌금함 곁 상자에 뭐가 있지 않을까요?', '(💰 헌금함)']]); return scale0(Rm, A); };

  // ════ 솔로몬 행각 · 놋그릇 소리 높낮이(놋채로 두드림)
  R.porch.spots.push({ id: 'bowls', x: 13, y: 66, w: 14, h: 10, act: 'puzzle:bowls', label: '🥣 놋그릇 다섯', extra: 1, accept: { stick: { pz: 'bowls' } } });
  var BOWLW = ['주', '의', '구', '원', '을'], BF = [262, 330, 392, 494, 587];
  BN.PZ.bowls = function (Rm, A) {
    var S = A.S(), F = f2(S), w = A.el('div', 'gen-wrap');
    if (F.bowls) return A.toast('✔ 놋그릇은 이미 소리 차례대로 놓았어요 — 「주의 구원을」');
    if (S.items.indexOf('stick') < 0 && !(S.used || {})['bowls:stick']) return A.talk([['gilead', 1, '손으로 두드리니 소리가 둔해요. 두드릴 채가 있으면 좋겠는데…', '(성전 문 위 문양을 풀면?)']]);
    var r = rnd(S, 221), ord = mix(r, [0, 1, 2, 3, 4]); if (ord.join() === '0,1,2,3,4') ord.reverse();
    function draw(sel) {
      w.innerHTML = (soundOn() ? '' : '<p class="gen-help" style="text-align:center">이 문제는 소리를 들어야 해요. <button class="btn gold" id="bwSnd">🔊 소리 켜기</button></p>') +
        '<div class="bw-row">' + ord.map(function (b, i) { return '<button class="bw' + (sel === i ? ' sel' : '') + '" data-i="' + i + '"><span>🥣</span><small>' + (i + 1) + '</small></button>'; }).join('') + '</div>' +
        '<p class="gen-help" style="text-align:center">그릇을 누르면 소리가 나요. 두 그릇을 차례로 누르면 자리가 바뀌어요. <b>낮은 소리 → 높은 소리</b>로 놓으세요.</p><button class="btn gold block" id="bwOk">다 놓았어요</button>';
      var sb = w.querySelector('#bwSnd'); if (sb) sb.onclick = function () { var b = document.getElementById('btnSound'); if (b && !soundOn()) b.click(); draw(); };
      w.querySelectorAll('.bw').forEach(function (b) { b.onclick = function () { var i = +b.dataset.i; tone(BF[ord[i]], 1.3); if (sel === undefined || sel === null) return draw(i); if (sel !== i) { var t = ord[sel]; ord[sel] = ord[i]; ord[i] = t; } draw(null); }; });
      w.querySelector('#bwOk').onclick = function () {
        if (A.locked('porch')) return;
        if (ord.join() !== '0,1,2,3,4') return A.wrong('porch', '소리가 들쭉날쭉하다 — 다시 들어 보자');
        F.bowls = 1; S.notes.push({ text: '행각 놋그릇을 낮은 소리부터 놓으니, 그릇 밑 글자가 「주의 구원을」 — 「내 눈이 주의 구원을 보았사오니」(눅 2:30).', ref: '누가복음 2:30' }); A.save(); A.sfx('ok');
        w.innerHTML = '<div class="bw-row done">' + BOWLW.map(function (s) { return '<span class="bw"><span>🥣</span><b>' + s + '</b></span>'; }).join('') + '</div><p class="gen-help" style="text-align:center">그릇 밑에 글자가 하나씩 — 「주의 구원을」</p>';
        setTimeout(function () { A.closeModal(); A.talk([['narr', null, '내 눈이 주의 구원을 보았사오니', '', '누가복음 2:30'], ['asaph', 0, '저 노인이 기다리던 것이 바로 이것이로구나.']]); }, 1800);
      };
    }
    draw(null); A.modal('행각의 놋그릇', w);
    if (LOCAL) BN.__bowls = function () { ord = [0, 1, 2, 3, 4]; w.querySelector('#bwOk') && draw(null); };
  };
  why('행각의 놋그릇', '행각 기둥 밑에 크기가 다른 놋그릇 다섯이 놓여 있다. 그릇 밑에 무언가 새겨진 것 같다.', '크다고 낮은 소리일까? 눈으로 말고 귀로 들어 봐야겠다.');
  var wait0 = BN.PZ.wait;
  BN.PZ.wait = function (Rm, A) { var S = A.S(); if (!f2(S).bowls) return A.talk([['gilead', 1, '저 노인이 무언가를 기다리는 것 같아요. 그 전에… 기둥 밑 놋그릇이 자꾸 눈에 밟혀요.', '(🥣 놋그릇 다섯)']]); return wait0(Rm, A); };

  // ════ 기도처 · 벽 숨은 낱말(남은 글자 = 눅 2:38)
  var WG = '예주야로엘루살나안렘누아의속선량바셀기도지을바금전성자라는식', WW = { '아셀': [11, 17], '바누엘': [4, 10, 16], '안나': [7, 8], '선지자': [14, 20, 26], '성전': [24, 25], '주야로': [1, 2, 3], '금식': [23, 29], '기도': [18, 19] };
  R.anna.spots.push({ id: 'wall', x: 22, y: 38, w: 22, h: 26, act: 'puzzle:words', label: '🧱 벽에 새긴 글자', extra: 1 });
  BN.PZ.words = function (Rm, A) {
    var S = A.S(), F = f2(S), found = F.found || {}, sel = null, w = A.el('div', 'gen-wrap');
    if (F.words) return A.toast('✔ 벽 글자는 이미 다 읽었어요');
    function draw() {
      var hit = {}; Object.keys(found).forEach(function (k) { WW[k].forEach(function (i) { hit[i] = 1; }); });
      w.innerHTML = '<div class="wd-list">' + Object.keys(WW).map(function (k) { return '<span class="' + (found[k] ? 'on' : '') + '">' + k + '</span>'; }).join('') + '</div>' +
        '<div class="wd-grid">' + WG.split('').map(function (c, i) { return '<button class="wd-c' + (hit[i] ? ' hit' : '') + (sel === i ? ' sel' : '') + '" data-i="' + i + '">' + c + '</button>'; }).join('') + '</div>' +
        '<p class="gen-help" style="text-align:center">낱말의 <b>첫 글자</b>와 <b>끝 글자</b>를 차례로 누르세요(가로·세로, 거꾸로도). 다 지우고 <b>남은 글자</b>를 차례로 읽으면…</p>' +
        '<div class="rm-ans"><input id="wdIn" maxlength="14" placeholder="남은 글자를 이어 적기" autocomplete="off" spellcheck="false"><button class="btn gold" id="wdOk">적기</button></div>';
      w.querySelectorAll('.wd-c').forEach(function (b) { b.onclick = function () { var i = +b.dataset.i; if (sel === null) { sel = i; return draw(); } var a = sel, z = i; sel = null; Object.keys(WW).forEach(function (k) { var c = WW[k]; if ((c[0] === a && c[c.length - 1] === z) || (c[0] === z && c[c.length - 1] === a)) { found[k] = 1; F.found = found; A.save(); A.sfx('ok'); } }); draw(); }; });
      w.querySelector('#wdOk').onclick = function () {
        if (A.locked('anna')) return;
        if ((w.querySelector('#wdIn').value || '').replace(/\s/g, '') !== '예루살렘의속량을바라는') return A.wrong('anna', '말이 되지 않는다 — 낱말을 다 지웠는지 보자');
        F.words = 1; S.notes.push({ text: '기도처 벽: 숨은 낱말 여덟을 지우고 남은 글자 「예루살렘의 속량을 바라는」(눅 2:38).', ref: '누가복음 2:38' }); A.save(); A.sfx('ok'); A.closeModal();
        A.talk([['narr', null, '마침 이 때에 나아와서 하나님께 감사하고 예루살렘의 속량을 바라는 모든 사람에게 그에 대하여 말하니라', '', '누가복음 2:38']]);
      };
    }
    draw(); A.modal('벽에 새긴 글자', w);
  };
  why('벽에 새긴 글자', '기도처 벽 돌에 글자가 빼곡하다. 곁에 「이 낱말들을 지워라」는 목록.', '목록의 낱말을 다 지우고 나면 남는 글자가 있겠지. 그게 이 벽이 하려는 말일까?');
  var anna0 = BN.PZ.anna;
  BN.PZ.anna = function (Rm, A) { var S = A.S(); if (!f2(S).words) return A.talk([['gilead', 1, '등잔 받침에 자물쇠가 있어요. 그 전에 벽 글자가 자꾸 눈에 들어와요.', '(🧱 벽에 새긴 글자)']]); return anna0(Rm, A); };

  // ── 힌트(1 · 2단계 방향, 3단계 그 사람 판의 답)
  function prep(k, a, b, c) { var o = BN.HINTS[k] || []; H(k, [a + ' ' + (o[0] || ''), b + ' ' + (o[1] || ''), function (S) { return c(S) + ' · ' + (typeof o[2] === 'function' ? o[2](S) : (o[2] || '')); }]); }
  prep('house8', '길르앗과 빵 조각 내기: 마지막 조각을 집으면 져요.', '내가 가져간 뒤 남는 수가 1, 5, 9, 13이 되게 하세요.', function () { return '빵: 처음에 2개 → 그다음엔 길르앗이 가져간 수와 합쳐 4가 되게'; });
  prep('climb', '☀ 해시계: 길가 돌의 「제 구 시 기도 시간」(행 3:1). 문양표 비석은 성전 문 위 문양을 읽는 데 써요.', '그림자는 해의 반대쪽 — 그림자를 9 눈금에 두려면 해를 반대편으로.', function () { return '해시계: 그림자를 9에 두고 2초'; });
  prep('tgate', '✦ 문 위 문양은 오르는 길의 문양표 비석으로 읽어요.', '문양 넷 = 글자 넷(눅 2:22).', function () { return '문양: 「정결예식」'; });
  prep('court', '💰 헌금함 곁 상자를 열어야 제물 값을 치를 수 있어요.', '가운데는 5, 마주 보는 칸끼리 더하면 10.', function (S) { var s = loshuVar(S); return '상자: ' + [s.slice(0, 3), s.slice(3, 6), s.slice(6)].map(function (x) { return x.join(' '); }).join(' / '); });
  prep('porch', '🥣 놋그릇은 놋채(성전 문)로 두드려요. 소리를 켜야 해요.', '낮은 소리부터 차례로 — 그릇 크기 말고 소리로.', function () { return '놋그릇: 낮은 소리 → 높은 소리 = 「주의 구원을」'; });
  prep('anna', '🧱 벽 글자: 목록 낱말 여덟을 첫 글자 → 끝 글자로 눌러 지워요.', '눅 2:36-37의 낱말. 남은 글자는 2:38에 있어요.', function () { return '벽: 「예루살렘의속량을바라는」'; });
  if (BN.HOW) {
    BN.HOW.house8 = (BN.HOW.house8 || '') + ' 길르앗을 누르면 빵 조각 내기 — 1~3개씩 번갈아, 마지막 조각을 집으면 져요.';
    BN.HOW.climb = '☀ 해시계를 먼저: 해를 끌어 그림자를 기도 시간 눈금에 두고 2초. 그다음 계단 — ' + (BN.HOW.climb || '');
    BN.HOW.tgate = '✦ 문 위 문양을 문양표 비석(오르는 길)으로 읽어 적어요. ' + (BN.HOW.tgate || '');
    BN.HOW.court = '💰 헌금함 곁 상자: 빈칸을 눌러 1~9를 돌려 넣어요(줄마다 합 15). 은전이 있어야 제물을 살 수 있어요. ' + (BN.HOW.court || '');
    BN.HOW.porch = '🥣 놋그릇: 놋채를 「손에 들기」 → 그릇을 누르면 열려요. 그릇을 눌러 소리를 듣고, 두 그릇을 차례로 누르면 자리가 바뀌어요. ' + (BN.HOW.porch || '');
    BN.HOW.anna = '🧱 벽 글자: 낱말의 첫 글자와 끝 글자를 차례로 눌러 지우고, 남은 글자를 이어 적어요. ' + (BN.HOW.anna || '');
  }
})(window.BN);
