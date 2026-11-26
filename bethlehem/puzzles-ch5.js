// 「베들레헴의 밤」 5장 퍼즐(2026-11-26). game.js가 넘겨주는 도구(A)로만 움직인다.
(function (BN) {
  BN.PZ = BN.PZ || {};
  function F(A) { var S = A.S(); S.f5 = S.f5 || {}; return S.f5; }
  function flag(R, A, key, need) { var f = F(A); f[key] = 1; A.save(); if (need.every(function (k) { return f[k]; })) { A.closeModal(); A.solve(R); return true; } return false; }
  function shuffle(a, r) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var DREAM_NEED = ['dreams', 'lamp', 'riddle5'];

  // ── 1 요셉의 꿈: 넷을 골라 차례대로(박사들의 꿈 하나가 섞여 있다) ──
  var DREAMS = [
    ['a', '「다윗의 자손 요셉아 네 아내 마리아 데려오기를 무서워하지 말라 그에게 잉태된 자는 성령으로 된 것이라」'],
    ['b', '「헤롯이 아기를 찾아 죽이려 하니 일어나 아기와 그의 어머니를 데리고 애굽으로 피하여 내가 네게 이르기까지 거기 있으라」'],
    ['c', '「일어나 아기와 그의 어머니를 데리고 이스라엘 땅으로 가라 아기의 목숨을 찾던 자들이 죽었느니라」'],
    ['d', '…꿈에 지시하심을 받아 갈릴리 지방으로 떠나가'],
    ['x', '…꿈에 헤롯에게로 돌아가지 말라 지시하심을 받아 다른 길로 고국에 돌아가니라']
  ];
  BN.PZ.dreams = function (R, A) {
    if (F(A).dreams) return A.talk([['asaph', 0, '꿈의 차례는 이미 맞추었다.']]);
    var r = A.seedRnd(51), cards = shuffle(DREAMS, r), slots = [null, null, null, null], w = A.el('div', 'dream-pz');
    function draw() {
      w.innerHTML = '<p class="tiny-note">요셉이 꿈으로 들은 말씀은 넷이다. 다섯 장 가운데 요셉의 꿈만 골라 일어난 차례대로 놓으세요.</p>';
      var sl = A.el('div', 'dr-slots');
      slots.forEach(function (k, i) { var c = k && DREAMS.find(function (d) { return d[0] === k; }); var b = A.el('button', 'dr-slot' + (k ? ' on' : ''), '<b>' + (i + 1) + '</b>' + (c ? c[1] : '')); b.dataset.i = i; b.onclick = function () { slots[i] = null; draw(); }; sl.appendChild(b); });
      w.appendChild(sl);
      var tray = A.el('div', 'dr-tray');
      cards.forEach(function (c) { if (slots.indexOf(c[0]) >= 0) return; var b = A.el('button', 'dr-card', c[1]); b.dataset.k = c[0]; b.onclick = function () { var i = slots.indexOf(null); if (i < 0) return; slots[i] = c[0]; A.tick(); draw(); }; tray.appendChild(b); });
      w.appendChild(tray);
      var go = A.el('button', 'btn gold', '이 차례로'); w.appendChild(go);
      go.onclick = function () {
        if (A.locked('dreams')) return;
        if (slots.indexOf(null) >= 0) return A.toast('네 칸을 다 채워요');
        if (slots.indexOf('x') >= 0) A.wrong('dreams', '그 꿈은 요셉이 아니라 박사들이 꾼 꿈이다');
        else if (slots.join('') === 'abcd') { A.sfx('ok'); if (!flag(R, A, 'dreams', DREAM_NEED)) { A.closeModal(); A.talk([['asaph', 0, '지금은 두 번째 꿈이다. 「일어나… 애굽으로 피하여」. 서둘러야 한다.']]); } }
        else A.wrong('dreams', '차례가 맞지 않는다');
      };
    }
    draw(); A.modal('요셉의 꿈', w);
  };
  // ── 2 숨결로 등잔 끄기: 마이크에 「후」 — 안 되면 5초 누르기(마 2:14 「밤에」) ──
  BN.PZ.lamp = function (R, A) {
    if (F(A).lamp) return A.talk([['narr', 0, '등잔은 꺼져 있다. 방이 어둡다.']]);
    var w = A.el('div', 'lamp-pz'), fl = A.el('div', 'lp-flame'), st = A.el('p', 'bow-st', ''), stream = null, raf = 0, hot = 0, life = 1, okd = 0;
    w.appendChild(A.el('div', 'lp-body')); w.appendChild(fl); w.appendChild(st);
    w.appendChild(A.el('p', 'tiny-note', '불빛이 새어 나가면 안 된다. 마이크에 대고 「후—」 길게 불어 등잔을 끄세요.'));
    function set() { fl.style.transform = 'scale(' + (.25 + life * .75) + ')'; fl.style.opacity = .3 + life * .7; }
    function out() { if (okd) return; okd = 1; stop(); life = 0; set(); fl.classList.add('off'); A.sfx('ok'); st.textContent = '— 꺼졌다'; setTimeout(function () { if (!flag(R, A, 'lamp', DREAM_NEED)) { A.closeModal(); A.talk([['asaph', 0, '어둠 속에서 짐을 챙긴다. 소리 내지 마라.']]); } }, 900); }
    function stop() { cancelAnimationFrame(raf); if (stream) stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
    var mic = A.el('button', 'btn gold', '🎤 마이크로 불기');
    mic.onclick = function () {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return A.toast('이 기기에선 마이크를 쓸 수 없어요 — 아래 버튼을 눌러요');
      navigator.mediaDevices.getUserMedia({ audio: true }).then(function (s) {
        stream = s; var ac = new (window.AudioContext || window.webkitAudioContext)(), an = ac.createAnalyser(); an.fftSize = 512; ac.createMediaStreamSource(s).connect(an); var buf = new Uint8Array(an.fftSize);
        st.textContent = '불어 보세요…';
        (function loop() { an.getByteTimeDomainData(buf); var sum = 0; for (var i = 0; i < buf.length; i++) { var v = (buf[i] - 128) / 128; sum += v * v; } var rms = Math.sqrt(sum / buf.length);
          if (rms > .12) { hot++; life = Math.max(0, life - .02); } else { hot = Math.max(0, hot - 1); life = Math.min(1, life + .006); } set(); if (life <= 0) return out(); raf = requestAnimationFrame(loop); })();
      }).catch(function () { A.toast('마이크를 쓸 수 없어요 — 아래 버튼을 눌러요'); });
    };
    w.appendChild(mic);
    var hold = A.el('button', 'bow-hold', '마이크가 안 되나요? 손으로 가리듯 여기를 5초 누르고 있기'), hv = 0, ht = 0;
    hold.addEventListener('pointerdown', function (e) { e.preventDefault(); ht = performance.now(); hv = setInterval(function () { var s = (performance.now() - ht) / 1000; life = Math.max(0, 1 - s / 5); set(); hold.style.setProperty('--p', Math.min(1, s / 5)); if (s >= 5) { clearInterval(hv); out(); } }, 80); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { hold.addEventListener(ev, function () { clearInterval(hv); if (!okd) { life = 1; set(); hold.style.setProperty('--p', 0); } }); });
    w.appendChild(hold); set();
    A.modal('등잔', w, function () { stop(); clearInterval(hv); });
  };
  BN.PZ.riddle5 = function (R, A) {
    if (F(A).riddle5) return A.talk([['gilead', 2, '쉿… 후다닥은 소리 없이 하는 거예요.', '(발끝으로 걷는 중)']]);
    var w = A.el('div', 'riddle'), inp = A.el('input', 'riddle-in'); inp.placeholder = '답을 적어요'; inp.maxLength = 12;
    w.appendChild(A.el('p', 'riddle-q', '「(속삭임) 세상에서 제일 빠른 닭은 뭐게요?」'));
    w.appendChild(A.el('p', 'tiny-note', '지금 우리가 그렇게 떠나야 해요'));
    w.appendChild(inp); var go = A.el('button', 'btn gold', '속삭이기'); w.appendChild(go);
    go.onclick = function () {
      if (A.locked('riddle5')) return; var v = inp.value.replace(/\s/g, '');
      if (/^후다[닥닭]$/.test(v)) { A.sfx('ok'); if (!flag(R, A, 'riddle5', DREAM_NEED)) { A.closeModal(); A.talk([['gilead', 1, '후다닭! 히히. …그런데 진짜로 후다닥 가야 해요. 소리는 내지 말고요.', '(진지)']]); } }
      else A.wrong('riddle5', '길르앗: 「땡! 엄청 급하게 뛰어가는 소리…」');
    };
    A.modal('길르앗의 수수께끼', w);
  };

  // ── 3 나귀 짐: 안장 주머니(4×4)에 빈틈없이 · 물부대는 맨 아래 줄 · 강보는 맨 위 줄 ──
  var PIECES = [
    ['blanket', '담요', [[0, 0], [1, 0], [0, 1], [1, 1]]], ['water', '물부대', [[0, 0], [1, 0], [2, 0]]], ['bread', '빵 자루', [[0, 0], [0, 1], [1, 1]]],
    ['gift', '보배합', [[0, 0], [1, 0]]], ['barley', '보리 자루', [[0, 0], [1, 0]]], ['cloth', '강보', [[0, 0]]], ['lamp', '등잔', [[0, 0]]]
  ];
  function rot(cells, k) { var c = cells.map(function (p) { return p.slice(); }); for (var i = 0; i < k; i++) c = c.map(function (p) { return [-p[1], p[0]]; }); var mx = Math.min.apply(null, c.map(function (p) { return p[0]; })), my = Math.min.apply(null, c.map(function (p) { return p[1]; })); return c.map(function (p) { return [p[0] - mx, p[1] - my]; }); }
  BN.PIECES5 = PIECES;
  BN.PZ.pack = function (R, A) {
    var grid = [], placed = {}, sel = null, rotk = 0, w = A.el('div', 'pack-pz');
    for (var i = 0; i < 16; i++) grid.push(null);
    function draw() {
      w.innerHTML = '<p class="tiny-note">안장 주머니는 4×4칸. 짐을 빈틈없이 다 넣어야 나귀가 흔들리지 않는다.<br>① 무거운 물부대는 맨 아래 줄 ② 아기의 강보는 맨 위 줄</p>';
      var g = A.el('div', 'pk-grid');
      grid.forEach(function (v, i) {
        var b = A.el('button', 'pk-c' + (v ? ' p-' + v : ''), v ? PIECES.find(function (p) { return p[0] === v; })[1].slice(0, 2) : ''); b.dataset.i = i;
        b.onclick = function () {
          if (v) { grid = grid.map(function (x) { return x === v ? null : x; }); delete placed[v]; return draw(); }
          if (!sel) return A.toast('먼저 아래에서 짐을 고르세요');
          var P = PIECES.find(function (p) { return p[0] === sel; }), cells = rot(P[2], rotk), x0 = i % 4, y0 = Math.floor(i / 4);
          var idx = cells.map(function (c) { var x = x0 + c[0], y = y0 + c[1]; return x < 4 && y < 4 ? y * 4 + x : -1; });
          if (idx.some(function (k) { return k < 0 || grid[k]; })) return A.toast('들어가지 않아요');
          idx.forEach(function (k) { grid[k] = sel; }); placed[sel] = 1; sel = null; rotk = 0; A.tick(); draw();
        };
        g.appendChild(b);
      });
      w.appendChild(g);
      var tray = A.el('div', 'pk-tray');
      PIECES.forEach(function (p) {
        if (placed[p[0]]) return;
        var cells = rot(p[2], sel === p[0] ? rotk : 0), W = 1 + Math.max.apply(null, cells.map(function (c) { return c[0]; })), H = 1 + Math.max.apply(null, cells.map(function (c) { return c[1]; }));
        var mini = '<span class="pk-mini" style="grid-template-columns:repeat(' + W + ',10px);grid-template-rows:repeat(' + H + ',10px)">' + cells.map(function (c) { return '<i style="grid-column:' + (c[0] + 1) + ';grid-row:' + (c[1] + 1) + '"></i>'; }).join('') + '</span>';
        var b = A.el('button', 'pk-p p-' + p[0] + (sel === p[0] ? ' sel' : ''), mini + p[1]); b.dataset.k = p[0];
        b.onclick = function () { if (sel === p[0]) rotk = (rotk + 1) % 4; else { sel = p[0]; rotk = 0; } draw(); };
        tray.appendChild(b);
      });
      w.appendChild(tray);
      w.appendChild(A.el('p', 'tiny-note', '짐을 고른 뒤 다시 누르면 돌아가요. 칸을 누르면 그 칸이 짐의 왼쪽 위가 돼요. 넣은 짐을 누르면 빠져요.'));
      var go = A.el('button', 'btn gold', '나귀에 얹기'); w.appendChild(go);
      go.onclick = function () {
        if (A.locked('pack')) return;
        if (grid.indexOf(null) >= 0) return A.wrong('pack', '빈칸이 있어 짐이 덜컹거린다');
        var waterBottom = grid.every(function (v, i) { return v !== 'water' || i >= 12; }), clothTop = grid.every(function (v, i) { return v !== 'cloth' || i < 4; });
        if (!waterBottom) return A.wrong('pack', '물부대가 위에 있어 나귀가 휘청인다');
        if (!clothTop) return A.wrong('pack', '아기의 강보가 짐 밑에 깔렸다');
        A.closeModal(); A.solve(R);
      };
    }
    draw(); A.modal('나귀 짐', w);
  };

  // ── 4 골목 빠져나가기: 한 걸음 옮길 때마다 순찰꾼이 고개를 돌린다(차례 퍼즐) ──
  var MAP = [
    '#.....#...G',
    '#.###.#.##.',
    '#.#...#..#.',
    '#.#.###.##.',
    '#...#.....#',
    '###.#.###.#',
    '#...#...#.#',
    '#.###.#.#.#',
    'S.....#...#'
  ];
  var GUARDS = [{ r: 2, c: 8, d: [3, 2, 1, 3] }, { r: 4, c: 9, d: [0, 0, 3, 3] }, { r: 6, c: 2, d: [2, 0] }, { r: 2, c: 4, d: [2, 0, 0, 3] }, { r: 8, c: 8, d: [3, 3] }, { r: 6, c: 7, d: [3, 3, 2] }];
  var DV = [[-1, 0], [0, 1], [1, 0], [0, -1]];   // 위·오른·아래·왼
  function seen(t) {
    var s = {};
    GUARDS.forEach(function (g) { s[g.r + ',' + g.c] = 1; var d = DV[g.d[t % g.d.length]], r = g.r, c = g.c; for (var k = 0; k < 3; k++) { r += d[0]; c += d[1]; if (r < 0 || r > 8 || c < 0 || c > 10 || MAP[r][c] === '#') break; s[r + ',' + c] = 1; } });
    return s;
  }
  BN.STEALTH = { MAP: MAP, GUARDS: GUARDS, seen: seen };
  BN.PZ.stealth = function (R, A) {
    var pr = 8, pc = 0, t = 0, w = A.el('div', 'st-pz');
    function draw() {
      var s = seen(t), h = '<div class="st-grid">';
      for (var r = 0; r < 9; r++) for (var c = 0; c < 11; c++) {
        var ch = MAP[r][c], cls = ch === '#' ? 'w' : 'f', g = GUARDS.find(function (q) { return q.r === r && q.c === c; });
        if (cls === 'f' && s[r + ',' + c]) cls += ' lit';
        h += '<i class="' + cls + (ch === 'G' ? ' goal' : '') + '">' + (r === pr && c === pc ? '🫏' : g ? ['⬆', '➡', '⬇', '⬅'][g.d[t % g.d.length]] : ch === 'G' ? '✦' : '') + '</i>';
      }
      w.innerHTML = h + '</div><p class="tiny-note">한 칸 움직일 때마다 순찰꾼들이 고개를 돌린다(돌리는 순서는 늘 같다). 등불 빛(밝은 칸)에 들어가면 처음으로. 가운데 「·」는 제자리에서 한 번 기다리기. ✦까지.</p>';
      var pad = A.el('div', 'st-pad');
      [['↑', -1, 0], ['←', 0, -1], ['·', 0, 0], ['→', 0, 1], ['↓', 1, 0]].forEach(function (k) { var b = A.el('button', 'st-b', k[0]); b.dataset.k = k[0]; b.onclick = function () { move(k[1], k[2]); }; pad.appendChild(b); });
      w.appendChild(pad);
    }
    function move(dr, dc) {
      var nr = pr + dr, nc = pc + dc;
      if (nr < 0 || nr > 8 || nc < 0 || nc > 10 || MAP[nr][nc] === '#') return;
      pr = nr; pc = nc; t++; A.tick();
      if (seen(t)[pr + ',' + pc]) { A.sfx('no'); A.toast('등불에 비쳤다! 처음 자리로'); pr = 8; pc = 0; t = 0; return draw(); }
      if (MAP[pr][pc] === 'G') { draw(); return setTimeout(function () { A.closeModal(); A.solve(R); }, 500); }
      draw();
    }
    w.tabIndex = 0; w.addEventListener('keydown', function (e) { var m = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key]; if (m) { e.preventDefault(); move(m[0], m[1]); } });
    draw(); A.modal('골목 빠져나가기', w);
  };

  // ── 5 남쪽 길 이정표: 가까운 곳부터 + 나귀 방울 흔들기 ──
  var STONES = [['헤브론', '베들레헴에서 남쪽으로 하루 남짓 — 아브람이 장막을 옮긴 곳(창 13:18)'], ['브엘세바', '「단에서부터 브엘세바까지」(삿 20:1) — 그 남쪽 끝'], ['애굽 시내', '가나안 땅 남쪽 경계를 지나는 시내(민 34:5)'], ['애굽', '「애굽으로부터 내 아들을 불렀다」(마 2:15)']];
  BN.PZ.route = function (R, A) {
    var r = A.seedRnd(55), order = [], cards = shuffle(STONES, r), w = A.el('div', 'route-pz'), shook = 0;
    function draw() {
      w.innerHTML = '<p class="tiny-note">베들레헴을 떠나 남쪽으로. 이정표 넷을 가까운 곳부터 차례로 밟으세요.</p>';
      var ol = A.el('div', 'rt-path', '<span>베들레헴</span>' + order.map(function (n) { return '<span>' + n + '</span>'; }).join('')); w.appendChild(ol);
      cards.forEach(function (c) { if (order.indexOf(c[0]) >= 0) return; var b = A.el('button', 'rt-stone', '<b>' + c[0] + '</b><small>' + c[1] + '</small>'); b.dataset.n = c[0]; b.onclick = function () { if (A.locked('route')) return; order.push(c[0]); A.tick(); if (order.length === 4) check(); else draw(); }; w.appendChild(b); });
      if (order.length) { var u = A.el('button', 'btn ghost', '처음부터'); u.onclick = function () { order = []; draw(); }; w.appendChild(u); }
    }
    function check() {
      if (order.join() === STONES.map(function (s) { return s[0]; }).join()) bells();
      else { A.wrong('route', '나귀가 길을 잃었다 — 이정표 차례가 다르다'); order = []; draw(); }
    }
    function bells() {
      w.innerHTML = '<p class="tiny-note">먼 길이다. 지친 나귀가 멈춰 섰다. 방울을 세 번 울려 걸음을 깨우세요 — 폰을 흔들어도 되고, 방울을 눌러도 됩니다.</p>';
      var bell = A.el('button', 'rt-bell', '🔔'), cnt = A.el('p', 'bow-st', '0 / 3'); w.appendChild(bell); w.appendChild(cnt);
      var last = 0;
      function ring() { if (performance.now() - last < 350) return; last = performance.now(); shook++; cnt.textContent = shook + ' / 3'; bell.classList.remove('ring'); void bell.offsetWidth; bell.classList.add('ring'); A.sfx('ok'); if (shook >= 3) { window.removeEventListener('devicemotion', mot); setTimeout(function () { A.closeModal(); A.solve(R); }, 600); } }
      function mot(e) { var a = e.accelerationIncludingGravity || e.acceleration; if (!a) return; var m = Math.sqrt((a.x || 0) * (a.x || 0) + (a.y || 0) * (a.y || 0) + (a.z || 0) * (a.z || 0)); if (m > 22) ring(); }
      bell.onclick = ring;
      var DM = window.DeviceMotionEvent; if (DM && typeof DM.requestPermission === 'function') { var p = A.el('button', 'btn ghost', '흔들기 켜기'); p.onclick = function () { DM.requestPermission().then(function (s) { if (s === 'granted') window.addEventListener('devicemotion', mot); }).catch(function () {}); }; w.appendChild(p); } else window.addEventListener('devicemotion', mot);
    }
    draw(); A.modal('남쪽 길', w);
  };

  // ── 6 우물 문: 다섯 장이 남긴 수 → 도장 「다」 → 열두 도장 문장 ──
  var VALS = ['4', '7', '12', '14', '21', '32', '33', '40', '55', '70'];
  BN.PZ.dial = function (R, A) {
    var f = F(A); if (f.dial) return stamps(R, A);
    var w = A.el('div', 'dial-pz'), cols = A.el('div', 'wl-row'), idx = [0, 0, 0, 0, 0];
    w.innerHTML = '<p class="tiny-note">우물 문의 다섯 원판. 원판마다 그림이 새겨져 있다. 「숫자는 늘 돌아온다.」</p>';
    [['📜', '성문 명부'], ['🚪', '성전 문'], ['🧭', '별 재는 기구'], ['🏠', '몇 달 뒤 여관'], ['💤', '요셉']].forEach(function (lb, i) {
      var col = A.el('div', 'wl-col'), up = A.el('button', 'wl-btn', '▲'), v = A.el('div', 'wl-val'), dn = A.el('button', 'wl-btn', '▼');
      col.appendChild(A.el('div', 'wl-lbl', lb[0] + ' ' + lb[1]));
      function sh() { v.textContent = VALS[idx[i]]; }
      up.onclick = function () { idx[i] = (idx[i] + VALS.length - 1) % VALS.length; sh(); A.tick(); }; dn.onclick = function () { idx[i] = (idx[i] + 1) % VALS.length; sh(); A.tick(); };
      sh(); col.appendChild(up); col.appendChild(v); col.appendChild(dn); cols.appendChild(col);
    });
    w.appendChild(cols);
    var go = A.el('button', 'btn gold wl-go', '원판 돌리기'); w.appendChild(go);
    go.onclick = function () {
      if (A.locked('dial')) return;
      if (idx.map(function (k) { return VALS[k]; }).join() === '14,32,55,7,4') { f.dial = 1; A.save(); A.sfx('stamp'); A.toast('철컥 — 문 가운데에 마지막 그림 도장 ◎이 새겨졌다'); setTimeout(function () { stamps(R, A); }, 900); }
      else A.wrong('dial', '원판이 제자리로 돌아간다');
    };
    A.modal('우물 문 · 다섯 원판', w);
  };
  var SENT = '하나님이우리와함께계시다';
  // 열두 그림 도장을 「성경에 적힌 차례」(책 → 장 → 절)로 놓으면 글자가 드러난다
  function stamps(R, A) {
    var I = BN.STAMP_ICON, keys = Object.keys(I), right = keys.slice().sort(function (a, b) { var x = I[a], y = I[b]; return x[3] - y[3] || x[4] - y[4] || x[5] - y[5]; });
    BN.__stampOrder = right;
    var r = A.seedRnd(57), tiles = shuffle(keys, r), slots = [], w = A.el('div', 'stamp-pz');
    function draw(reveal) {
      w.innerHTML = '<p class="tiny-note">문의 열두 칸 위에 새겨진 글: 「도장은 받은 차례가 아니라, 새겨진 말씀이 성경에 적힌 차례대로 찍어라.」 (창세기에서 요한계시록 쪽으로, 같은 책이면 장·절 차례)</p>';
      var sl = A.el('div', 'sp-slots');
      for (var i = 0; i < 12; i++) (function (i) { var k = slots[i]; var b = A.el('button', 'sp-slot' + (k ? ' on' : ''), k ? (reveal ? '<b class="sp-ch">' + BN.STAMPS[k] + '</b>' : I[k][0] + '<small>' + I[k][2] + '</small>') : ''); b.onclick = function () { if (k && !reveal) { slots.splice(i, 1); draw(); } }; sl.appendChild(b); })(i);
      w.appendChild(sl);
      if (reveal) return;
      var tr = A.el('div', 'sp-tray');
      tiles.forEach(function (k) { if (slots.indexOf(k) >= 0) return; var b = A.el('button', 'sp-tile', I[k][0] + '<small>' + I[k][2] + '</small>'); b.dataset.k = k; b.onclick = function () { if (slots.length < 12) { slots.push(k); A.tick(); draw(); } }; tr.appendChild(b); });
      w.appendChild(tr);
      var go = A.el('button', 'btn gold', '문 열기'); w.appendChild(go);
      go.onclick = function () {
        if (A.locked('stamps')) return;
        if (slots.length < 12) return A.toast('열두 칸을 다 채워요');
        if (slots.join() === right.join()) { A.sfx('stamp'); draw(true); setTimeout(function () { A.closeModal(); A.solve(R); }, 2600); }
        else A.wrong('stamps', '도장이 문에 붙지 않는다 — 차례가 다르다');
      };
    }
    draw(); A.modal('열두 도장', w);
  }
})(window.BN);
