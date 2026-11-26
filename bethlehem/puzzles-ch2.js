// 「베들레헴의 밤」 2장 퍼즐(2026-11-26). game.js가 넘겨주는 도구(A)로만 움직인다.
(function (BN) {
  BN.PZ = BN.PZ || {};
  // 돌리는 칸(값 목록을 ▲▼로 돌림) — 여러 칸을 한 줄로
  function wheels(A, specs, onTry, label) {
    var box = A.el('div', 'wl-row'), idx = specs.map(function () { return 0; });
    specs.forEach(function (sp, i) {
      var col = A.el('div', 'wl-col'), up = A.el('button', 'wl-btn', '▲'), v = A.el('div', 'wl-val'), dn = A.el('button', 'wl-btn', '▼');
      if (sp.label) col.appendChild(A.el('div', 'wl-lbl', sp.label));
      function show() { v.textContent = sp.vals[idx[i]]; }
      up.onclick = function () { idx[i] = (idx[i] + sp.vals.length - 1) % sp.vals.length; show(); A.tick(); };
      dn.onclick = function () { idx[i] = (idx[i] + 1) % sp.vals.length; show(); A.tick(); };
      show(); col.appendChild(up); col.appendChild(v); col.appendChild(dn); box.appendChild(col);
    });
    var go = A.el('button', 'btn gold wl-go', label || '열기');
    go.onclick = function () { onTry(idx.map(function (k, i) { return specs[i].vals[k]; })); };
    var w = A.el('div', 'wl-wrap'); w.appendChild(box); w.appendChild(go); return w;
  }

  // 1 이름: 찾은 글자 조각을 빈칸 둘에 차례로 놓기
  BN.PZ.name = function (R, A) {
    var S = A.S(), got = S.tiles || [];
    if (got.length < 2) return A.talk([['asaph', 0, '이름 조각이 아직 모자라다. 집 안을 더 살펴보아라.']]);
    var w = A.el('div', 'name-pz'), slots = [null, null];
    function draw() {
      w.innerHTML = '<p class="tiny-note">찾은 조각 ' + got.length + '/6 · 조각을 누르면 빈칸에 들어가요(빈칸을 누르면 빠져요)</p>';
      var row = A.el('div', 'name-slots');
      slots.forEach(function (t, i) { var b = A.el('button', 'name-slot' + (t ? ' on' : ''), t || ''); b.onclick = function () { slots[i] = null; draw(); }; row.appendChild(b); });
      w.appendChild(row);
      var tray = A.el('div', 'name-tray');
      got.forEach(function (t) { if (slots.indexOf(t) >= 0) return; var b = A.el('button', 'name-tile', t); b.onclick = function () { var k = slots.indexOf(null); if (k < 0) return; slots[k] = t; draw(); }; tray.appendChild(b); });
      w.appendChild(tray);
      var go = A.el('button', 'btn gold', '명부에 적기');
      go.onclick = function () {
        if (A.locked('name')) return;
        if (slots.join('') === '예수') { A.closeModal(); A.solve(R); }
        else if (slots.join('') === '임마' || slots.join('') === '누엘') A.wrong('name', '그 이름은 마태복음 1장 23절의 말이에요. 「천사가 일컬은」 이름은?');
        else A.wrong('name', '명부의 칸이 받아들이지 않는다');
      };
      w.appendChild(go);
    }
    draw(); A.modal('명부의 빈칸 · 이름', w);
  };

  // 2 오르는 길: 기울이기(또는 끌기)로 새장 굴리기 — 비둘기 둘을 모은 뒤 맨 위 문
  BN.PZ.climb = function (R, A) {
    var W = 300, H = 420, cv = A.el('canvas', 'climb-cv'); cv.width = W * 2; cv.height = H * 2;
    var w = A.el('div', 'climb-wrap'); w.appendChild(A.el('p', 'tiny-note', '폰을 기울이거나 화면을 끌어 새장을 옮겨요. 벽에 세게 부딪히면 비둘기가 놀라 처음부터!'));
    w.appendChild(cv); var st = A.el('p', 'tiny-note climb-st', ''); w.appendChild(st);
    // 계단 미로(가로선 벽, 틈이 엇갈림)
    var walls = [[0, 350, 190, 362], [240, 350, 300, 362], [0, 270, 60, 282], [110, 270, 300, 282], [0, 190, 200, 202], [250, 190, 300, 202], [0, 110, 40, 122], [95, 110, 300, 122], [140, 282, 152, 312], [200, 122, 212, 152]];   // 짧은 기둥 두 개는 아래로 돌아가야 함
    var birds = [{ x: 40, y: 150, got: false }, { x: 270, y: 236, got: false }], gate = { x: 150, y: 40 };
    var b = { x: 150, y: 395, vx: 0, vy: 0 }, ctx = cv.getContext('2d'), alive = true, drag = null, tilt = { x: 0, y: 0 };
    function onT(e) { if (e.gamma == null) return; tilt.x = Math.max(-1, Math.min(1, e.gamma / 20)); tilt.y = Math.max(-1, Math.min(1, (e.beta - 35) / 20)); }
    addEventListener('deviceorientation', onT);
    function pos(e) { var r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }; }
    cv.addEventListener('pointerdown', function (e) { drag = pos(e); cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', function (e) { if (drag) drag = pos(e); });
    cv.addEventListener('pointerup', function () { drag = null; });
    function reset(msg) { b.x = 150; b.y = 395; b.vx = b.vy = 0; birds.forEach(function (d) { d.got = false; }); if (msg) A.toast(msg); }
    function hit(x, y) { var r = 11; for (var i = 0; i < walls.length; i++) { var q = walls[i]; if (x + r > q[0] && x - r < q[2] && y + r > q[1] && y - r < q[3]) return true; } return x < r || x > W - r || y < r || y > H - r; }
    function step() {
      if (!alive) return;
      var ax = tilt.x * .35, ay = tilt.y * .35;
      if (drag) { ax = (drag.x - b.x) * .02; ay = (drag.y - b.y) * .02; }
      b.vx = (b.vx + ax) * .93; b.vy = (b.vy + ay) * .93;
      var cap = drag ? 5 : 6, sp = Math.hypot(b.vx, b.vy); if (sp > cap) { b.vx *= cap / sp; b.vy *= cap / sp; }
      var nx = b.x + b.vx, ny = b.y + b.vy;
      if (hit(nx, b.y)) { if (Math.abs(b.vx) > 4.2) return bump(); b.vx = -b.vx * .2; nx = b.x; }
      if (hit(nx, ny)) { if (Math.abs(b.vy) > 4.2) return bump(); b.vy = -b.vy * .2; ny = b.y; }
      b.x = nx; b.y = ny;
      birds.forEach(function (d) { if (!d.got && Math.hypot(d.x - b.x, d.y - b.y) < 22) { d.got = true; A.sfx('ok'); } });
      var n = birds.filter(function (d) { return d.got; }).length; st.textContent = '산비둘기 ' + n + '/2';
      if (Math.hypot(gate.x - b.x, gate.y - b.y) < 24) { if (n === 2) { alive = false; done(); return; } }
      draw(); requestAnimationFrame(step);
    }
    function bump() { A.sfx('no'); reset('쾅! 비둘기가 놀라 날아갔다 — 처음부터'); draw(); requestAnimationFrame(step); }
    function draw() {
      ctx.setTransform(2, 0, 0, 2, 0, 0); var g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#3a2c1c'); g.addColorStop(1, '#6b5233'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(255,230,180,.06)'; for (var y = 0; y < H; y += 20) ctx.fillRect(0, y, W, 2);
      ctx.fillStyle = '#d9c8a6'; walls.forEach(function (q) { ctx.fillRect(q[0], q[1], q[2] - q[0], q[3] - q[1]); });
      ctx.fillStyle = '#e8b75a'; ctx.beginPath(); ctx.arc(gate.x, gate.y, 18, Math.PI, 0); ctx.lineTo(gate.x + 18, gate.y + 14); ctx.lineTo(gate.x - 18, gate.y + 14); ctx.fill();
      ctx.font = '20px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      birds.forEach(function (d) { if (!d.got) ctx.fillText('🕊', d.x, d.y); });
      ctx.fillText('🧺', b.x, b.y);
    }
    w.cleanup = function () { alive = false; removeEventListener('deviceorientation', onT); };
    function done() { w.cleanup(); A.closeModal(); A.solve(R); }
    A.modal('새장을 흔들지 말고', w, function () { w.cleanup(); });
    draw(); requestAnimationFrame(step);
  };

  // 3 성전 문: 날수 두 자리
  BN.PZ.days = function (R, A) {
    var D = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    var w = wheels(A, [{ vals: D, label: '십' }, { vals: D, label: '일' }], function (v) {
      if (A.locked('days')) return; var n = +(v[0] + v[1]);
      if (n === 40) { A.closeModal(); A.solve(R); }
      else if (n === 8 || n === 7 || n === 33) A.wrong('days', '그건 날수의 한 부분이에요');
      else A.wrong('days', '문이 꿈쩍도 하지 않는다');
    }, '문 두드리기');
    A.modal('정결예식의 날 · 며칠째?', w);
  };

  // 4 성전 뜰: 제물 고르기 → 저울(다섯 번)
  BN.PZ.scale = function (R, A) {
    var S = A.S(), w = A.el('div', 'scale-pz');
    if (!S.offerOk) {
      w.innerHTML = '<p class="tiny-note">값표에 적힌 제물 가운데, 그 가족이 율법대로 드린 것은?</p>';
      [['일 년 된 어린 양', 0], ['산비둘기 두 마리', 1], ['송아지 한 마리', 0], ['은 다섯 세겔', 0]].forEach(function (o) {
        var b = A.el('button', 'btn ghost offer', o[0]); b.onclick = function () {
          if (A.locked('offer')) return;
          if (o[1]) { S.offerOk = 1; A.save(); A.sfx('ok'); A.closeModal(); BN.PZ.scale(R, A); }
          else A.wrong('offer', o[0] === '일 년 된 어린 양' ? '레위기 12장 8절 — 「어린 양을 바치기에 힘이 미치지 못하면」' : '그건 이 제사의 제물이 아니에요');
        }; w.appendChild(b);
      });
      return A.modal('제물 고르기', w);
    }
    S.scaleTry = S.scaleTry || 0; var rnd = A.seedRnd(70 + S.scaleTry), target = 11 + Math.floor(rnd() * 19), on = {}, left = 5;
    var WTS = [16, 8, 4, 2, 1];
    function sum() { return WTS.reduce(function (a, k) { return a + (on[k] ? k : 0); }, 0); }
    function draw(tiltDeg, msg) {
      w.innerHTML = '<p class="tiny-note">왼쪽: 비둘기 새장 · 오른쪽: 세겔 추. 저울에 올릴 기회 <b>' + left + '</b>번</p>' +
        '<svg viewBox="0 0 300 150" class="scale-svg"><line x1="150" y1="20" x2="150" y2="130" stroke="#c9a15a" stroke-width="5"/><g transform="rotate(' + tiltDeg + ' 150 30)"><line x1="40" y1="30" x2="260" y2="30" stroke="#e8b75a" stroke-width="5"/><line x1="55" y1="30" x2="55" y2="80" stroke="#bda"/><line x1="245" y1="30" x2="245" y2="80" stroke="#bda"/><path d="M25 80 h60 l-10 16 h-40z" fill="#8a6a3a"/><path d="M215 80 h60 l-10 16 h-40z" fill="#8a6a3a"/><text x="55" y="74" font-size="26" text-anchor="middle">🧺</text><text x="245" y="74" font-size="15" fill="#ffe2a0" text-anchor="middle">' + (sum() || '') + '</text></g><path d="M120 140 h60 l-8-12 h-44z" fill="#6b5233"/></svg>' + (msg ? '<p class="scale-msg">' + msg + '</p>' : '');
      var row = A.el('div', 'wt-row');
      WTS.forEach(function (k) { var b = A.el('button', 'wt' + (on[k] ? ' on' : ''), k + '<small>세겔</small>'); b.onclick = function () { on[k] = !on[k]; draw(0, ''); }; row.appendChild(b); });
      w.appendChild(row);
      var go = A.el('button', 'btn gold', '저울 놓기'); go.onclick = weigh; w.appendChild(go);
    }
    function weigh() {
      var s = sum(); left--;
      if (s === target) { A.sfx('ok'); draw(0, '저울이 꼭 맞았다! 새장 무게 ' + target + '세겔'); setTimeout(function () { A.closeModal(); A.solve(R); }, 1200); return; }
      if (left <= 0) { S.scaleTry++; A.save(); A.sfx('no'); A.toast('장수가 새장을 바꿔 버렸다 — 무게가 달라졌어요'); A.closeModal(); return; }
      draw(s > target ? 14 : -14, s > target ? '추 쪽이 내려갔다(추가 더 무겁다)' : '새장 쪽이 내려갔다(새장이 더 무겁다)');
    }
    draw(-14, ''); A.modal('장수의 저울', w);
  };

  // 5 솔로몬 행각: 60초 동안 아무것도 누르지 않기
  BN.PZ.wait = function (R, A) {
    var w = A.el('div', 'wait-pz'), need = 60000, t0 = Date.now(), alive = true;
    w.innerHTML = '<div class="hg"><div class="hg-top"></div><div class="hg-bot"></div></div><p class="wait-ref">「이스라엘의 위로를 기다리는 자라」<br><small>누가복음 2:25</small></p>';
    function reset(e) { if (!alive) return; if (e && e.target && e.target.closest && e.target.closest('#modalX')) return; t0 = Date.now(); w.classList.remove('flash'); void w.offsetWidth; w.classList.add('flash'); }
    var evs = ['pointerdown', 'keydown', 'wheel'];
    evs.forEach(function (k) { addEventListener(k, reset, true); });
    function cleanup() { alive = false; evs.forEach(function (k) { removeEventListener(k, reset, true); }); }
    (function loop() {
      if (!alive) return; var p = Math.min(1, (Date.now() - t0) / need);
      w.style.setProperty('--p', p.toFixed(3));
      if (p >= 1) { cleanup(); A.closeModal(); A.sfx('ok'); A.solve(R); return; }
      requestAnimationFrame(loop);
    })();
    A.modal('기다림', w, cleanup);
  };

  // 6 안나: 지파 · 아버지 · 나이
  BN.PZ.anna = function (R, A) {
    var TR = ['르우벤', '시므온', '레위', '유다', '단', '납달리', '갓', '아셀', '잇사갈', '스불론', '요셉', '베냐민'];
    var FA = ['바나바', '브누엘', '바르실래', '바누엘', '보아스', '바룩'];
    var D = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    var w = wheels(A, [{ vals: TR, label: '지파' }, { vals: FA, label: '아버지' }, { vals: D, label: '나이' }, { vals: D, label: '' }], function (v) {
      if (A.locked('anna')) return;
      var ok = v[0] === '아셀' && v[1] === '바누엘' && v[2] + v[3] === '84';
      if (ok) { A.closeModal(); A.solve(R); } else A.wrong('anna', '등잔 불꽃이 흔들릴 뿐이다');
    }, '등잔 곁 자물쇠 열기');
    A.modal('기도하는 이의 이름표', w);
  };
})(window.BN);
