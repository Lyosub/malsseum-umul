// 「베들레헴의 밤」 다시 만든 문제 셋(2026-11-27 전도사님 폰 시험 뒤)
// · 3장 별 겨누기 — 망원경 화면(방향 띠·높이 눈금·별이 원 안에 들어옴), 기구 안에서 일지 다시 보기
// · 1장 양 몰기 — 생각 + 몰기: 양마다 단 방울(저물 때·밤중·닭 울 때·새벽)을 보고 맞는 시각의 우리로(막 13:35)
// · 5장 골목 — 한 걸음씩 수 읽기: 나귀가 한 칸 움직일 때마다 등불이 시계 방향으로 한 칸 돈다(stealth_turn.py로 풀이 확인: 24수)
(function (BN) {
  BN.PZ = BN.PZ || {};
  var LOCAL = /^(127\.0\.0\.1|localhost)$/.test(location.hostname), PTEST = /[?&]phonetest=1/.test(location.search);
  function needPerm(Ev, cb) { if (Ev && typeof Ev.requestPermission === 'function') Ev.requestPermission().then(function (s) { cb(s === 'granted'); }).catch(function () { cb(false); }); else cb(!!Ev); }

  // ── 3장: 별 재는 기구(망원경 화면)
  var DIR8 = ['북', '북동', '동', '동남', '남', '남서', '서', '북서'];
  BN.PZ.astro = function (R, A) {
    var S = A.S(); if ((S.f3 || {}).astro) return A.talk([['asaph', 0, '기구는 이미 오늘 밤에 맞춰 두었다.']]);
    var w = A.el('div', 'scope-pz'), head = null, beta = null, okT = 0, done = false, got = false, on = false;
    var tape = DIR8.concat(DIR8).concat(DIR8).map(function (d, i) { return '<span style="left:' + (i * 60) + 'px">' + d + '</span>'; }).join('');
    w.innerHTML = '<ol class="scope-steps"><li>「기구 들기」를 누르고 폰을 세워 화면을 봐요.</li><li>몸을 돌려 아래 <b>방향 띠</b>의 ▼를 일지로 알아낸 <b>오늘 밤의 방향</b>에.</li><li>폰 윗부분을 들어 오른쪽 <b>높이 눈금</b>을 오늘 밤의 높이에.</li><li>별이 원 안에 들어오면 <b>2초</b> 그대로.</li></ol>' +
      '<div class="scope-row"><div class="scope"><div class="scope-sky"></div><div class="scope-star">✦</div><div class="scope-ring"></div></div>' +
      '<div class="scope-alt"><div class="sa-bar">' + [90, 75, 60, 45, 30, 15, 0].map(function (v) { return '<i style="bottom:' + (v / 90 * 100) + '%">' + v + '°</i>'; }).join('') + '<b class="sa-me"></b></div><small>높이</small></div></div>' +
      '<div class="scope-tape"><div class="st-in">' + tape + '</div><em>▼</em></div><p class="aim-read">센서를 켜 주세요</p>' +
      (PTEST ? '<p class="tiny-note" style="color:#ffd27a">폰 시험용: 오늘 밤은 남서 · 55° (원래는 일지에서 알아내요)</p>' : '') +
      '<div class="scope-btns"><button class="btn gold" id="aimGo">기구 들기(센서 켜기)</button><button class="btn ghost" id="aimLog">📖 일지 다시 보기</button><button class="btn ghost" id="aimWheel">센서가 안 되나요? 바퀴로</button></div><div class="scope-log" hidden></div>';
    var read = w.querySelector('.aim-read'), star = w.querySelector('.scope-star'), tin = w.querySelector('.st-in'), me = w.querySelector('.sa-me'), sky = w.querySelector('.scope-sky');
    function dirName(h) { return DIR8[Math.round(h / 45) % 8]; }
    function view() {
      if (head == null) return;
      tin.style.transform = 'translateX(' + (-(head / 45) * 60 - 8 * 60) + 'px)';
      me.style.bottom = Math.max(0, Math.min(100, (beta || 0) / 90 * 100)) + '%';
      sky.style.backgroundPosition = (-head * 3) + 'px ' + ((beta || 0) * 3) + 'px';
      var dh = ((225 - head) % 360 + 540) % 360 - 180, db = (beta || 0) - 55;
      var vis = Math.abs(dh) <= 20 && Math.abs(db) <= 14;
      star.style.opacity = vis ? 1 : 0; star.style.transform = 'translate(' + (dh * 4.5) + 'px,' + (db * 5) + 'px)';
      read.textContent = '지금 ' + dirName(head) + ' ' + Math.round(head) + '° · 높이 ' + Math.round(beta || 0) + '°';
      on = Math.abs(dh) <= 12 && Math.abs(db) <= 6; w.classList.toggle('lock', on);
      if (on) { if (!okT) okT = performance.now(); else if (performance.now() - okT > 2000) finish(); } else okT = 0;
    }
    function ori(e) {
      var h = e.webkitCompassHeading != null ? e.webkitCompassHeading : (e.absolute || e.type === 'deviceorientationabsolute') && e.alpha != null ? (360 - e.alpha) % 360 : null;
      if (h != null) head = h; if (e.beta != null) beta = e.beta; got = true;
      if (head == null) { read.textContent = '방향을 알 수 없어요 — 「바퀴로」를 써요'; return; }
      view();
    }
    function finish() { if (done) return; done = true; stop(); A.sfx('ok'); A.toast('별이 원 한가운데에 딱 걸렸다'); S.f3 = S.f3 || {}; S.f3.astro = 1; A.save(); setTimeout(function () { A.closeModal(); if (['astro', 'light'].every(function (k) { return S.f3[k]; })) A.solve(R); else A.talk([['asaph', 0, '기구가 맞았다. 이제 등잔 빛을 별 지도에 비추면 되겠구나.']]); }, 700); }
    function stop() { removeEventListener('deviceorientationabsolute', ori); removeEventListener('deviceorientation', ori); }
    w.querySelector('#aimGo').onclick = function () {
      needPerm(window.DeviceOrientationEvent, function (ok) {
        if (!ok) return (read.textContent = '센서를 쓸 수 없어요 — 「바퀴로」를 써요');
        addEventListener('deviceorientationabsolute', ori); addEventListener('deviceorientation', ori); read.textContent = '폰을 세워 들고 천천히 돌아보세요…';
        setTimeout(function () { if (!got) read.textContent = '센서 신호가 없어요 — 「바퀴로」를 써요'; }, 2500);
      });
    };
    w.querySelector('#aimLog').onclick = function () {
      var lg = w.querySelector('.scope-log'), f = (S.f3 || {});
      lg.innerHTML = f.journal ? '<b>박사들의 별 일지</b><br>첫째 밤 — 동, 높이 10<br>일곱째 밤 — 동남, 높이 25<br>열셋째 밤 — 남, 높이 40<br><small>여섯 밤마다 어떻게 바뀌었는지 보세요. 오늘이 몇째 밤인지는 길르앗이 알아요.</small>' : '아직 일지를 읽지 않았어요. 천막 오른쪽의 가죽 책(일지)을 먼저 읽어요.';
      lg.hidden = !lg.hidden;
    };
    w.querySelector('#aimWheel').onclick = function () { stop(); if (BN.PZ.astroWheels) BN.PZ.astroWheels(R, A); };
    A.modal('별 재는 기구', w, stop);
    if (LOCAL) BN.__aim = function (h, b) { ori({ webkitCompassHeading: h, beta: b }); };
  };

  // ── 1장: 양 몰기(생각 + 몰기) — 방울 무늬를 보고 그 시각의 우리로
  var BELL4 = ['🌆', '🌑', '🐓', '🌅'], PENT = ['오후 7시', '밤 10시', '새벽 1시', '새벽 4시'];   // 저물 때 6~9 · 밤중 9~12 · 닭 울 때 12~3 · 새벽 3~6 (막 13:35)
  var PEN_ORDER = [1, 3, 0, 2];   // 왼쪽부터 우리에 붙은 시각(차례를 섞어 둠)
  BN.PZ.herd = function (R, A) {
    var S = A.S(); if (S.herded) return BN.runPuzzle('field', R);
    var W = 300, H = 300, cv = A.el('canvas', 'herd-cv'); cv.width = 600; cv.height = 600;
    var w = A.el('div', 'herd-pz');
    w.appendChild(A.el('p', 'tiny-note', '목자들은 밤을 넷으로 나눠 지켰다. 양마다 단 방울 무늬를 보고, 그 경점에 맞는 시각이 붙은 우리로 몰아넣으세요. 양은 손가락을 피해 달아나고, 틀린 우리에 들어가면 뛰쳐나와요.'));
    w.appendChild(cv); var st = A.el('p', 'aim-read', ''); w.appendChild(st);
    var PW = 66, PH = 78, GATE = 30, pens = PEN_ORDER.map(function (b, i) { return { x: 9 + i * 72, b: b, n: 0, flash: 0 }; });
    var sheep = [], fin = null, alive = true, ctx = cv.getContext('2d'), r = A.seedRnd(73), pops = [];
    for (var i = 0; i < 8; i++) sheep.push({ b: i % 4, x: 30 + r() * 240, y: 150 + r() * 130, vx: 0, vy: 0, pen: -1 });
    function pos(e) { var b = cv.getBoundingClientRect(); return { x: (e.clientX - b.left) / b.width * W, y: (e.clientY - b.top) / b.height * H }; }
    cv.addEventListener('pointerdown', function (e) { fin = pos(e); cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', function (e) { if (fin) fin = pos(e); });
    cv.addEventListener('pointerup', function () { fin = null; });
    function penAt(x, y) { for (var k = 0; k < 4; k++) { var p = pens[k]; if (x > p.x - 4 && x < p.x + PW + 4 && y < PH + 4) return k; } return -1; }
    function inGate(p, x) { var gx = p.x + PW / 2; return Math.abs(x - gx) < GATE / 2 - 3; }
    function slot(p, k) { return { x: p.x + 18 + (k % 2) * 30, y: 26 + Math.floor(k / 2) * 26 }; }
    function frame() {
      if (!alive || !cv.isConnected) return;
      sheep.forEach(function (s) {
        if (s.pen >= 0) { var t = slot(pens[s.pen], s.slot); s.x += (t.x - s.x) * .15; s.y += (t.y - s.y) * .15; return; }
        if (fin) { var dx = s.x - fin.x, dy = s.y - fin.y, d = Math.hypot(dx, dy) || 1; if (d < 70) { s.vx += dx / d * .9; s.vy += dy / d * .9; } }
        s.vx += (r() - .5) * .22; s.vy += (r() - .5) * .22; s.vx *= .9; s.vy *= .9;
        var sp = Math.hypot(s.vx, s.vy); if (sp > 3) { s.vx *= 3 / sp; s.vy *= 3 / sp; }
        var nx = s.x + s.vx, ny = s.y + s.vy, k = penAt(nx, ny);
        if (k >= 0) {
          var p = pens[k];
          if (s.y >= PH - 2 && inGate(p, nx)) {
            if (p.b === s.b) { s.pen = k; s.slot = p.n++; p.flash = 30; pops.push({ x: p.x + PW / 2, y: PH + 8, t: 40, ok: true }); A.sfx('ok'); }
            else { s.vy = 3.2; s.vx = (r() - .5) * 2; ny = PH + 12; nx = s.x; pops.push({ x: p.x + PW / 2, y: PH + 8, t: 40, ok: false }); A.sfx('no'); A.toast(BELL4[s.b] + ' 방울 양은 「' + PENT[p.b] + '」 우리가 아니에요'); }
          } else { if (s.y >= PH - 2) { s.vy = Math.abs(s.vy) + .4; ny = s.y; } else { s.vx = -s.vx; nx = s.x; } }
        }
        s.x = Math.max(10, Math.min(W - 10, nx)); s.y = Math.max(10, Math.min(H - 10, ny));
      });
      draw();
      var n = sheep.filter(function (s) { return s.pen >= 0; }).length;
      st.textContent = '우리 안 ' + n + ' / 8';
      if (n === 8) { alive = false; S.herded = 1; A.save(); setTimeout(function () { A.closeModal(); A.toast('양들이 저마다 제 경점의 우리로 들어갔다 — 목자의 상자가 보인다'); setTimeout(function () { BN.runPuzzle('field', R); }, 600); }, 700); return; }
      requestAnimationFrame(frame);
    }
    function draw() {
      ctx.setTransform(2, 0, 0, 2, 0, 0);
      var g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#203a24'); g.addColorStop(1, '#2f5530'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(160,200,120,.07)'; for (var i = 0; i < 60; i++) { ctx.fillRect((i * 53) % W, 90 + (i * 37) % 210, 2, 5); }
      pens.forEach(function (p) {
        ctx.fillStyle = p.flash > 0 ? 'rgba(255,226,140,' + (p.flash / 60) + ')' : '#4a3a22'; if (p.flash > 0) p.flash--; ctx.fillRect(p.x, 0, PW, PH);
        ctx.fillStyle = '#4a3a22'; if (!p.flash) ctx.fillRect(p.x, 0, PW, PH);
        ctx.strokeStyle = '#d8b06a'; ctx.lineWidth = 3; var gx = p.x + PW / 2;
        ctx.beginPath(); ctx.moveTo(p.x, 0); ctx.lineTo(p.x, PH); ctx.lineTo(gx - GATE / 2, PH); ctx.moveTo(gx + GATE / 2, PH); ctx.lineTo(p.x + PW, PH); ctx.lineTo(p.x + PW, 0); ctx.stroke();
        ctx.fillStyle = '#d8b06a'; [p.x, gx - GATE / 2, gx + GATE / 2, p.x + PW].forEach(function (x) { ctx.fillRect(x - 2, PH - 6, 4, 10); });
        // 시계와 시각
        ctx.save(); ctx.translate(gx, 13); ctx.fillStyle = '#f4e6c4'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, 7); ctx.fill(); ctx.strokeStyle = '#6a4a20'; ctx.lineWidth = 1.2; ctx.stroke();
        var hr = [7, 10, 1, 4][p.b], a = (hr % 12) / 12 * Math.PI * 2 - Math.PI / 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 5, Math.sin(a) * 5); ctx.moveTo(0, 0); ctx.lineTo(0, -6.5); ctx.stroke(); ctx.restore();
        ctx.fillStyle = '#ffe2a0'; ctx.font = '700 11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(PENT[p.b], gx, PH - 12);
      });
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      sheep.forEach(function (s) { ctx.font = '22px serif'; ctx.fillText('🐑', s.x, s.y); ctx.font = '12px serif'; ctx.fillText(BELL4[s.b], s.x, s.y - 14); });
      pops = pops.filter(function (q) { q.t--; ctx.globalAlpha = Math.max(0, q.t / 40); ctx.font = '700 13px sans-serif'; ctx.fillStyle = q.ok ? '#ffe27a' : '#ff9a8a'; ctx.fillText(q.ok ? '매애~ 딸랑' : '음매?!', q.x, q.y - (40 - q.t) * .4); ctx.globalAlpha = 1; return q.t > 0; });
      if (fin) { ctx.beginPath(); ctx.arc(fin.x, fin.y, 70, 0, 7); ctx.strokeStyle = 'rgba(255,240,200,.22)'; ctx.lineWidth = 2; ctx.stroke(); }
    }
    A.modal('양 몰기', w, function () { alive = false; }); frame();
    if (LOCAL) BN.__herdWin = function () { var c = [0, 0, 0, 0]; sheep.forEach(function (s) { var k = pens.findIndex(function (p) { return p.b === s.b; }); s.pen = k; s.slot = c[k]++; pens[k].n = c[k]; }); };
  };

  // ── 5장: 골목 — 한 걸음씩 수 읽기
  var SMAP = ['####..G', '#....#.', '#.##.#.', '...#...', '.#...#.', '.###.#.', '...#...', '##.###.', 'S......'];
  var SG = [{ r: 0, c: 5, p: 'ESWN' }, { r: 8, c: 4, p: 'SWNE' }, { r: 1, c: 4, p: 'WNES' }, { r: 5, c: 6, p: 'NESW' }];
  var SD = { N: [-1, 0], E: [0, 1], S: [1, 0], W: [0, -1] }, SR = 9, SC = 7;
  function slit(t) {
    var L = {};
    SG.forEach(function (g) { L[g.r + ',' + g.c] = 1; var d = SD[g.p[t % 4]]; for (var k = 1; k <= 3; k++) { var rr = g.r + d[0] * k, cc = g.c + d[1] * k; if (rr < 0 || rr >= SR || cc < 0 || cc >= SC || SMAP[rr][cc] === '#') break; L[rr + ',' + cc] = 1; } });
    return L;
  }
  BN.PZ.stealth = function (R, A) {
    var C = 40, W = SC * C, H = SR * C, cv = A.el('canvas', 'st-cv'); cv.width = W * 2; cv.height = H * 2;
    var w = A.el('div', 'st-pz');
    w.appendChild(A.el('p', 'tiny-note', '노란 칸은 지금 등불이 비치는 곳. 움직인 칸이 비치면 들켜요. 순찰꾼이 등불을 어떻게 돌리는지는 순찰 기록(수첩)을 보세요. 몇 수 앞을 내다보고 ✦ 성문까지!'));
    w.appendChild(cv);
    var pad = A.el('div', 'st-pad'); pad.innerHTML = '<button data-d="N">▲</button><div><button data-d="W">◀</button><button data-d="0" class="wait">⏸ 기다리기</button><button data-d="E">▶</button></div><button data-d="S">▼</button>';
    w.appendChild(pad);
    var st = A.el('p', 'aim-read', ''); w.appendChild(st);
    var rs = A.el('button', 'btn ghost', '↺ 처음부터'); w.appendChild(rs);
    var ctx = cv.getContext('2d'), me, t, steps, busy = false, done = false, flash = 0, caught = 0;
    function reset() { me = { r: 8, c: 0 }; t = 0; steps = 0; busy = false; draw(); }
    function isWall(r, c) { return r < 0 || r >= SR || c < 0 || c >= SC || SMAP[r][c] === '#'; }
    function guardAt(r, c) { return SG.some(function (g) { return g.r === r && g.c === c; }); }
    function roof(x, y, seed) {
      var g = ctx.createLinearGradient(x, y, x, y + C); g.addColorStop(0, '#7a4a2c'); g.addColorStop(1, '#4e2e1a'); ctx.fillStyle = g; ctx.fillRect(x + 1, y + 1, C - 2, C - 2);
      ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1; for (var k = 6; k < C; k += 6) { ctx.beginPath(); ctx.moveTo(x + 2, y + k); ctx.lineTo(x + C - 2, y + k); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(255,210,160,.25)'; ctx.beginPath(); ctx.moveTo(x + 3, y + C / 2); ctx.lineTo(x + C - 3, y + C / 2); ctx.stroke();
      if (seed % 5 === 0) { ctx.fillStyle = '#3a2416'; ctx.fillRect(x + C - 13, y + 6, 6, 8); }
    }
    function cobble(x, y, seed) {
      ctx.fillStyle = '#1b2238'; ctx.fillRect(x, y, C, C);
      ctx.fillStyle = '#252e4a'; for (var k = 0; k < 4; k++) { var ox = ((seed * 7 + k * 13) % 3) * 2; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x + 3 + (k % 2) * 18 + ox, y + 3 + Math.floor(k / 2) * 18, 15, 15, 4) : ctx.rect(x + 3 + (k % 2) * 18 + ox, y + 3 + Math.floor(k / 2) * 18, 15, 15); ctx.fill(); }
    }
    function draw() {
      ctx.setTransform(2, 0, 0, 2, 0, 0); ctx.clearRect(0, 0, W, H);
      var now = slit(t), nxt = slit(t + 1);
      for (var r = 0; r < SR; r++) for (var c = 0; c < SC; c++) { var x = c * C, y = r * C, s = r * 7 + c; if (SMAP[r][c] === '#') roof(x, y, s); else cobble(x, y, s); }
      // 성문
      ctx.save(); var gx = 6 * C + C / 2, gy = C / 2, rg = ctx.createRadialGradient(gx, gy, 2, gx, gy, C); rg.addColorStop(0, 'rgba(255,220,140,.9)'); rg.addColorStop(1, 'rgba(255,220,140,0)'); ctx.fillStyle = rg; ctx.fillRect(gx - C, gy - C / 2, C * 1.5, C); ctx.restore();
      ctx.fillStyle = '#ffe2a0'; ctx.font = '700 18px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('✦', gx, gy - 4); ctx.font = '700 9px sans-serif'; ctx.fillText('성문', gx, gy + 11);
      // 지금 비치는 곳 · 다음에 비칠 곳
      Object.keys(now).forEach(function (k) { var a = k.split(',').map(Number); var x = a[1] * C, y = a[0] * C; var rg2 = ctx.createRadialGradient(x + C / 2, y + C / 2, 4, x + C / 2, y + C / 2, C * .75); rg2.addColorStop(0, 'rgba(255,214,120,.62)'); rg2.addColorStop(1, 'rgba(255,190,90,.25)'); ctx.fillStyle = rg2; ctx.fillRect(x + 1, y + 1, C - 2, C - 2); });
      // 순찰꾼
      SG.forEach(function (g) {
        var x = g.c * C + C / 2, y = g.r * C + C / 2, d = SD[g.p[t % 4]];
        ctx.fillStyle = 'rgba(20,14,8,.85)'; ctx.beginPath(); ctx.arc(x, y, 14, 0, 7); ctx.fill(); ctx.strokeStyle = '#ffcf7a'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.font = '16px serif'; ctx.fillText('🏮', x, y + 1);
        ctx.fillStyle = '#ffcf7a'; ctx.beginPath(); var ax = x + d[1] * 17, ay = y + d[0] * 17; ctx.moveTo(ax + d[1] * 6, ay + d[0] * 6); ctx.lineTo(ax - d[0] * 5, ay + d[1] * 5); ctx.lineTo(ax + d[0] * 5, ay - d[1] * 5); ctx.fill();
      });
      // 나귀
      ctx.font = '26px serif'; ctx.fillText('🫏', me.c * C + C / 2, me.r * C + C / 2 + 1);
      if (flash > 0) { ctx.fillStyle = 'rgba(255,80,60,' + flash / 20 + ')'; ctx.fillRect(0, 0, W, H); }
      st.textContent = '걸음 ' + steps + (caught ? ' · 들킨 횟수 ' + caught : '');
    }
    function move(d) {
      if (busy || done) return;
      var dr = d === '0' ? 0 : SD[d][0], dc = d === '0' ? 0 : SD[d][1], nr = me.r + dr, nc = me.c + dc;
      if (d !== '0' && (isWall(nr, nc) || guardAt(nr, nc))) { A.sfx('no'); return; }
      me = { r: nr, c: nc }; t++; steps++; A.tick && A.tick();
      if (SMAP[nr][nc] === 'G') { done = true; draw(); A.sfx('ok'); A.toast('성문을 빠져나왔다!'); setTimeout(function () { A.closeModal(); A.solve(R); }, 700); return; }
      if (slit(t)[nr + ',' + nc]) { caught++; busy = true; A.sfx('no'); A.toast('등불에 비쳤다! 처음 자리로'); flash = 20; (function f() { draw(); if (flash-- > 0) requestAnimationFrame(f); else reset(); })(); return; }
      draw();
    }
    pad.querySelectorAll('button').forEach(function (b) { b.onclick = function () { move(b.dataset.d); }; });
    cv.addEventListener('click', function (e) {
      var b = cv.getBoundingClientRect(), c = Math.floor((e.clientX - b.left) / b.width * SC), r = Math.floor((e.clientY - b.top) / b.height * SR);
      if (r === me.r && c === me.c) return move('0');
      if (Math.abs(r - me.r) + Math.abs(c - me.c) !== 1) return;
      move(r < me.r ? 'N' : r > me.r ? 'S' : c < me.c ? 'W' : 'E');
    });
    function key(e) { var m = { ArrowUp: 'N', ArrowDown: 'S', ArrowLeft: 'W', ArrowRight: 'E', ' ': '0' }[e.key]; if (m && cv.isConnected) { e.preventDefault(); move(m); } }
    addEventListener('keydown', key);
    rs.onclick = reset; reset();
    A.modal('골목 빠져나가기', w, function () { removeEventListener('keydown', key); });
    if (LOCAL) { BN.__stealthWin = function () { me = { r: 0, c: 5 }; t = 0; move('E'); }; BN.__stealthMove = move; }
  };
})(window.BN);
