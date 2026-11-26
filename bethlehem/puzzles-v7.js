// 「베들레헴의 밤」 몸으로·손으로 하는 문제(2026-11-27)
// 실제 방향·기울기(3장) · 걸어 보기(1장) · 기울여 기름 나르기(1장) · 말씀 소리 내어 읽기(2장) · 양 몰기(1장) · 실시간 잠입(5장) · 뒤집기 짝 맞추기(4장)
// 센서·마이크가 안 되는 기기는 언제나 누르기로 대신할 수 있다.
(function (BN) {
  BN.PZ = BN.PZ || {};
  var LOCAL = /^(127\.0\.0\.1|localhost)$/.test(location.hostname);
  function needPerm(Ev, cb) { if (Ev && typeof Ev.requestPermission === 'function') Ev.requestPermission().then(function (s) { cb(s === 'granted'); }).catch(function () { cb(false); }); else cb(!!Ev); }
  function overlay(title) { var o = document.createElement('div'); o.className = 'ov7'; o.innerHTML = '<div class="ov7-box"><div class="ov7-head"><b>' + title + '</b><button class="ov7-x">✕</button></div><div class="ov7-body"></div></div>'; document.body.appendChild(o); o.querySelector('.ov7-x').onclick = function () { o.remove(); }; return o; }

  // ── 3장: 별 재는 기구 — 폰을 들고 실제로 그 방향을 향해, 그 높이만큼 기울여 별을 겨눈다
  var astroWheels = BN.PZ.astro;
  var DIR8 = ['북', '북동', '동', '동남', '남', '남서', '서', '북서'];
  BN.PZ.astro = function (R, A) {
    var S = A.S(); if ((S.f3 || {}).astro) return A.talk([['asaph', 0, '기구는 이미 오늘 밤에 맞춰 두었다.']]);
    var w = A.el('div', 'aim-pz'), head = null, beta = null, okT = 0, done = false, got = false;
    w.innerHTML = '<p class="tiny-note">놋쇠 기구를 폰처럼 들어 보세요. 폰 윗부분이 별을 가리키게 하고, 일지의 규칙으로 찾은 「오늘 밤」의 <b>방향</b>을 실제로 향해 서서 <b>높이(기울기)</b>만큼 들어 올리면 별이 바늘에 걸립니다. 2초 동안 그대로.</p><div class="aim-dial"><div class="aim-needle"></div><div class="aim-star">✦</div></div><p class="aim-read">센서를 켜 주세요</p><button class="btn gold" id="aimGo">기구 들기(센서 켜기)</button><button class="btn ghost" id="aimWheel">센서가 안 되나요? 바퀴로 맞추기</button>';
    var read = w.querySelector('.aim-read'), needle = w.querySelector('.aim-needle'), star = w.querySelector('.aim-star');
    function dirName(h) { return DIR8[Math.round(h / 45) % 8]; }
    function ori(e) {
      var h = e.webkitCompassHeading != null ? e.webkitCompassHeading : (e.absolute || e.type === 'deviceorientationabsolute') && e.alpha != null ? (360 - e.alpha) % 360 : null;
      if (h != null) head = h; if (e.beta != null) beta = e.beta; got = true;
      if (head == null) { read.textContent = '방향을 알 수 없어요 — 아래 「바퀴로 맞추기」를 써요'; return; }
      read.textContent = '방향 ' + Math.round(head) + '° (' + dirName(head) + ') · 높이 ' + Math.round(beta || 0) + '°';
      needle.style.transform = 'rotate(' + (head - 225) + 'deg)'; star.style.transform = 'translateY(' + ((beta || 0) - 55) * 2 + 'px)';
      var dh = Math.abs(((head - 225) % 360 + 540) % 360 - 180), on = dh <= 15 && Math.abs((beta || 0) - 55) <= 7;
      w.classList.toggle('lock', on);
      if (on) { if (!okT) okT = performance.now(); else if (performance.now() - okT > 2000) finish(); } else okT = 0;
    }
    function finish() { if (done) return; done = true; stop(); A.sfx('ok'); A.toast('바늘이 별에 딱 걸렸다'); S.f3 = S.f3 || {}; S.f3.astro = 1; A.save(); setTimeout(function () { A.closeModal(); if (['astro', 'light'].every(function (k) { return S.f3[k]; })) A.solve(R); else A.talk([['asaph', 0, '기구가 맞았다. 이제 등잔 빛을 별 지도에 비추면 되겠구나.']]); }, 700); }
    function stop() { removeEventListener('deviceorientationabsolute', ori); removeEventListener('deviceorientation', ori); }
    w.querySelector('#aimGo').onclick = function () {
      needPerm(window.DeviceOrientationEvent, function (ok) {
        if (!ok) return (read.textContent = '센서를 쓸 수 없어요 — 「바퀴로 맞추기」를 써요');
        addEventListener('deviceorientationabsolute', ori); addEventListener('deviceorientation', ori); read.textContent = '폰을 들어 천천히 돌아보세요…';
        setTimeout(function () { if (!got) read.textContent = '센서 신호가 없어요 — 「바퀴로 맞추기」를 써요'; }, 2500);
      });
    };
    w.querySelector('#aimWheel').onclick = function () { stop(); astroWheels(R, A); };
    A.modal('별 재는 기구', w, stop);
    if (LOCAL) BN.__aim = function (h, b) { ori({ webkitCompassHeading: h, beta: b }); };
  };

  // ── 1장: 나사렛 길 — 지도 상자를 열기 전에 폰을 들고 30걸음(안 되면 30번 누르기)
  BN.PZ.walk = function (R, A) {
    var S = A.S(); if (S.walked) return BN.runPuzzle('roadmap', R);
    var N = 30, n = 0, w = A.el('div', 'walk-pz'), lastPeak = 0, high = false, done = false;
    w.innerHTML = '<p class="tiny-note">나사렛에서 베들레헴까지 사흘 길이 넘는다. 요셉과 마리아처럼 걸어 보자 — 폰을 손에 들고 실제로 걸으면 걸음이 세어진다.</p><div class="walk-road"><i></i><span>🚶</span></div><p class="aim-read"><b id="wkN">0</b> / ' + N + ' 걸음</p><button class="btn gold" id="wkGo">걷기 시작(센서 켜기)</button><button class="btn ghost" id="wkTap">걸을 수 없는 곳이면: 한 걸음씩 누르기</button>';
    var bar = w.querySelector('.walk-road i'), man = w.querySelector('.walk-road span');
    function step() { if (done) return; n++; w.querySelector('#wkN').textContent = n; bar.style.width = (n / N * 100) + '%'; man.style.left = (n / N * 92) + '%'; A.tick(); if (n >= N) { done = true; removeEventListener('devicemotion', mot); S.walked = 1; A.save(); A.sfx('ok'); setTimeout(function () { A.closeModal(); A.toast('성문이 보인다 — 돌 탁자 위에 지도 두 장이 있다'); setTimeout(function () { BN.runPuzzle('roadmap', R); }, 600); }, 600); } }
    function mot(e) { var a = e.accelerationIncludingGravity; if (!a) return; var m = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z), t = performance.now(); if (!high && m > 11.8 && t - lastPeak > 320) { high = true; lastPeak = t; step(); } else if (high && m < 10.2) high = false; }
    w.querySelector('#wkGo').onclick = function () { needPerm(window.DeviceMotionEvent, function (ok) { if (ok) addEventListener('devicemotion', mot); else A.toast('걸음 센서를 쓸 수 없어요 — 누르기로 해요'); }); };
    w.querySelector('#wkTap').onclick = step;
    A.modal('나사렛에서 오는 길', w, function () { removeEventListener('devicemotion', mot); });
  };

  // ── 1장: 기울여 기름 나르기 — 부엌 기름 단지에서 마구간 등잔까지, 구불구불한 길을 벗어나지 않게
  BN.oilCarry = function (onDone) {
    var o = overlay('기름 나르기'), body = o.querySelector('.ov7-body'), W = 300, H = 420;
    body.innerHTML = '<p class="tiny-note">기름 쟁반을 폰을 기울여(또는 손가락으로 끌어) 길을 따라 등잔(🪔)까지 옮기세요. 길 밖으로 나가면 기름이 흘러요. 세 번 흘리면 처음부터.</p><canvas class="carry-cv" width="600" height="840"></canvas><p class="aim-read" id="cyS">흘린 기름 0 / 3</p>';
    var cv = body.querySelector('canvas'), ctx = cv.getContext('2d'), P = [[40, 390], [40, 300], [150, 300], [150, 210], [260, 210], [260, 120], [120, 120], [120, 40], [250, 40]], RAD = 24;
    var b = { x: 40, y: 390, vx: 0, vy: 0 }, tilt = { x: 0, y: 0 }, drag = null, spills = 0, alive = true, out = false;
    function onT(e) { if (e.gamma == null) return; tilt.x = Math.max(-1, Math.min(1, e.gamma / 25)); tilt.y = Math.max(-1, Math.min(1, (e.beta - 30) / 25)); }
    needPerm(window.DeviceOrientationEvent, function (ok) { if (ok) addEventListener('deviceorientation', onT); });
    function pos(e) { var r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }; }
    cv.addEventListener('pointerdown', function (e) { drag = pos(e); cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', function (e) { if (drag) drag = pos(e); });
    cv.addEventListener('pointerup', function () { drag = null; });
    function dist(px, py) { var best = 1e9; for (var i = 0; i < P.length - 1; i++) { var a = P[i], c = P[i + 1], dx = c[0] - a[0], dy = c[1] - a[1], t = Math.max(0, Math.min(1, ((px - a[0]) * dx + (py - a[1]) * dy) / (dx * dx + dy * dy))); best = Math.min(best, Math.hypot(px - a[0] - t * dx, py - a[1] - t * dy)); } return best; }
    function frame() {
      if (!alive || !o.isConnected) { removeEventListener('deviceorientation', onT); return; }
      var ax = tilt.x * .3, ay = tilt.y * .3; if (drag) { ax = (drag.x - b.x) * .02; ay = (drag.y - b.y) * .02; }
      b.vx = (b.vx + ax) * .92; b.vy = (b.vy + ay) * .92; var sp = Math.hypot(b.vx, b.vy); if (sp > 4) { b.vx *= 4 / sp; b.vy *= 4 / sp; }
      b.x += b.vx; b.y += b.vy;
      var d = dist(b.x, b.y);
      if (d > RAD && !out) { out = true; spills++; body.querySelector('#cyS').textContent = '흘린 기름 ' + spills + ' / 3'; try { navigator.vibrate && navigator.vibrate(80); } catch (e) {} if (spills >= 3) { spills = 0; b.x = 40; b.y = 390; b.vx = b.vy = 0; body.querySelector('#cyS').textContent = '다 쏟았다 — 처음부터'; } }
      if (d <= RAD * .7) out = false;
      ctx.setTransform(2, 0, 0, 2, 0, 0); ctx.clearRect(0, 0, W, H); ctx.fillStyle = '#20160c'; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = '#6a5236'; ctx.lineWidth = RAD * 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); P.forEach(function (p, i) { if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); ctx.stroke();
      ctx.font = '26px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🪔', 250, 40); ctx.fillText('🏺', 40, 400);
      ctx.beginPath(); ctx.arc(b.x, b.y, 11, 0, 7); ctx.fillStyle = out ? '#c0392b' : '#e8c25a'; ctx.fill(); ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 2; ctx.stroke();
      if (Math.hypot(b.x - 250, b.y - 40) < 18) { alive = false; removeEventListener('deviceorientation', onT); setTimeout(function () { o.remove(); onDone(); }, 400); return; }
      requestAnimationFrame(frame);
    }
    frame();
    if (LOCAL) BN.__carryWin = function () { b.x = 250; b.y = 40; };
  };

  // ── 2장: 말씀 소리 내어 읽기 — 마이크로 소리 크기·길이만 잰다(녹음·저장 없음). 안 되면 어절을 차례로 누르기
  BN.PZ.readAloud = function (text, title, onDone, A) {
    var w = A.el('div', 'read-pz'), words = text.split(' '), need = Math.max(5, words.length * .35), voiced = 0, stream = null, raf = 0, done = false;
    w.innerHTML = '<p class="tiny-note">이 찬송을 소리 내어 읽으면 기둥 사이 문이 열린다. 마이크로 목소리의 크기와 길이만 재고, 녹음하거나 저장하지 않는다.</p><div class="read-txt">' + text + '</div><div class="read-bar"><i></i></div><button class="btn gold" id="rdGo">🎤 읽기 시작</button><button class="btn ghost" id="rdTap">소리를 낼 수 없는 곳이면: 어절을 차례로 누르기</button>';
    var bar = w.querySelector('.read-bar i');
    function fin() { if (done) return; done = true; stop(); A.sfx('ok'); bar.style.width = '100%'; setTimeout(function () { A.closeModal(); onDone(); }, 700); }
    function stop() { cancelAnimationFrame(raf); if (stream) stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
    w.querySelector('#rdGo').onclick = function () {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return A.toast('마이크를 쓸 수 없어요 — 어절 누르기로 해요');
      navigator.mediaDevices.getUserMedia({ audio: true }).then(function (s) {
        stream = s; var ac = new (window.AudioContext || window.webkitAudioContext)(), an = ac.createAnalyser(); an.fftSize = 1024; ac.createMediaStreamSource(s).connect(an); var buf = new Uint8Array(an.fftSize), last = performance.now();
        (function loop() { an.getByteTimeDomainData(buf); var sum = 0; for (var i = 0; i < buf.length; i++) { var v = (buf[i] - 128) / 128; sum += v * v; } var rms = Math.sqrt(sum / buf.length), t = performance.now(); if (rms > .04) voiced += (t - last) / 1000; last = t; bar.style.width = Math.min(100, voiced / need * 100) + '%'; if (voiced >= need) return fin(); raf = requestAnimationFrame(loop); })();
      }).catch(function () { A.toast('마이크를 쓸 수 없어요 — 어절 누르기로 해요'); });
    };
    w.querySelector('#rdTap').onclick = function () {
      stop(); var k = 0, box = w.querySelector('.read-txt'); box.innerHTML = '';
      var order = words.map(function (x, i) { return i; }), r = A.seedRnd(77); order.sort(function () { return r() - .5; });
      var line = A.el('p', 'read-line'); w.insertBefore(line, box);
      order.forEach(function (i) { var b = A.el('button', 'read-w', words[i]); b.onclick = function () { if (words[i] !== words[k]) return A.toast('찬송의 다음 어절이 아니에요'); line.textContent += (k ? ' ' : '') + words[k]; k++; b.disabled = true; bar.style.width = (k / words.length * 100) + '%'; if (k === words.length) fin(); }; box.appendChild(b); });
    };
    A.modal(title || '소리 내어 읽기', w, stop);
  };

  // ── 1장: 들판 양 몰기 — 60초 안에 흩어진 양 일곱을 우리로(양은 손가락을 피해 달아난다)
  BN.PZ.herd = function (R, A) {
    var S = A.S(); if (S.herded) return BN.runPuzzle('field', R);
    var W = 300, H = 300, cv = A.el('canvas', 'herd-cv'); cv.width = 600; cv.height = 600;
    var w = A.el('div', 'herd-pz'); w.appendChild(A.el('p', 'tiny-note', '목자들의 상자에 가려면 먼저 흩어진 양 일곱 마리를 오른쪽 위 우리에 몰아넣어야 한다. 양은 손가락을 피해 달아난다. 60초!')); w.appendChild(cv);
    var st = A.el('p', 'aim-read', ''); w.appendChild(st);
    var pen = { x: 210, y: 0, w: 90, h: 90 }, sheep = [], fin = null, t0 = 0, alive = true, ctx = cv.getContext('2d'), r = A.seedRnd(71);
    function reset() { sheep = []; for (var i = 0; i < 7; i++) sheep.push({ x: 30 + r() * 160, y: 130 + r() * 150, vx: 0, vy: 0, inP: false }); t0 = performance.now(); }
    reset();
    function pos(e) { var b = cv.getBoundingClientRect(); return { x: (e.clientX - b.left) / b.width * W, y: (e.clientY - b.top) / b.height * H }; }
    cv.addEventListener('pointerdown', function (e) { fin = pos(e); cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', function (e) { if (fin) fin = pos(e); });
    cv.addEventListener('pointerup', function () { fin = null; });
    function frame() {
      if (!alive || !cv.isConnected) return;
      var left = 60 - (performance.now() - t0) / 1000;
      sheep.forEach(function (s) {
        if (s.inP) { s.vx *= .8; s.vy *= .8; s.x = Math.max(pen.x + 10, Math.min(W - 10, s.x + s.vx)); s.y = Math.max(10, Math.min(pen.h - 10, s.y + s.vy)); return; }
        if (fin) { var dx = s.x - fin.x, dy = s.y - fin.y, d = Math.hypot(dx, dy); if (d < 75) { s.vx += dx / d * 0.9; s.vy += dy / d * 0.9; } }
        s.vx += (r() - .5) * .25; s.vy += (r() - .5) * .25; s.vx *= .9; s.vy *= .9;
        var sp = Math.hypot(s.vx, s.vy); if (sp > 3.2) { s.vx *= 3.2 / sp; s.vy *= 3.2 / sp; }
        s.x += s.vx; s.y += s.vy;
        if (s.x < 10) { s.x = 10; s.vx = -s.vx; } if (s.x > W - 10) { s.x = W - 10; s.vx = -s.vx; } if (s.y < 10) { s.y = 10; s.vy = -s.vy; } if (s.y > H - 10) { s.y = H - 10; s.vy = -s.vy; }
        // 우리 담: 왼쪽 벽(x=210, y<90)과 아래 벽(y=90, x 210~255) — 입구는 아래 오른쪽(x 255~300)
        if (s.x > pen.x - 8 && s.x < pen.x + 8 && s.y < pen.h) { s.x = s.vx > 0 ? pen.x - 8 : pen.x + 8; s.vx = -s.vx; }
        if (s.y > pen.h - 8 && s.y < pen.h + 8 && s.x > pen.x && s.x < 255) { s.y = s.vy > 0 ? pen.h - 8 : pen.h + 8; s.vy = -s.vy; }
        if (s.x > pen.x + 8 && s.y < pen.h - 8) s.inP = true;
      });
      var n = sheep.filter(function (s) { return s.inP; }).length;
      ctx.setTransform(2, 0, 0, 2, 0, 0); ctx.fillStyle = '#3d5a2a'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#6b5a32'; ctx.fillRect(pen.x, 0, pen.w, pen.h);
      ctx.strokeStyle = '#d8b06a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(pen.x, 0); ctx.lineTo(pen.x, pen.h); ctx.lineTo(255, pen.h); ctx.stroke();
      ctx.fillStyle = '#ffe2a0'; ctx.font = '700 13px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('우리', 255, 30); ctx.fillText('↑ 입구', 278, 108);
      ctx.font = '20px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; sheep.forEach(function (s) { ctx.fillText('🐑', s.x, s.y); });
      if (fin) { ctx.beginPath(); ctx.arc(fin.x, fin.y, 75, 0, 7); ctx.strokeStyle = 'rgba(255,240,200,.25)'; ctx.lineWidth = 2; ctx.stroke(); }
      st.textContent = '우리 안 ' + n + ' / 7 · 남은 시간 ' + Math.max(0, Math.ceil(left)) + '초';
      if (n === 7) { alive = false; S.herded = 1; A.save(); A.sfx('ok'); setTimeout(function () { A.closeModal(); A.toast('양들이 다 들어왔다 — 목자의 상자가 보인다'); setTimeout(function () { BN.runPuzzle('field', R); }, 600); }, 500); return; }
      if (left <= 0) { A.toast('시간이 다 됐다 — 양들이 다시 흩어졌다'); reset(); }
      requestAnimationFrame(frame);
    }
    A.modal('양 몰기', w, function () { alive = false; }); frame();
    if (LOCAL) BN.__herdWin = function () { sheep.forEach(function (s) { s.inP = true; s.x = 260; s.y = 40; }); };
  };

  // ── 5장: 골목 실시간 잠입 — 순찰꾼 등불이 실제로 좌우로 돈다. 손가락으로 나귀를 끌어 빛을 피해 ✦까지
  var MAP = ['#.....#...G', '#.###.#.##.', '#.#...#..#.', '#.#.###.##.', '#...#.....#', '###.#.###.#', '#...#...#.#', '#.###.#.#.#', 'S.....#...#'];
  var GU = [{ r: 2, c: 8, a: 180, sw: 70, sp: .9 }, { r: 4, c: 9, a: 180, sw: 80, sp: 1.1 }, { r: 6, c: 2, a: 90, sw: 80, sp: .8 }, { r: 2, c: 4, a: 90, sw: 70, sp: 1 }, { r: 8, c: 8, a: 180, sw: 60, sp: .7 }, { r: 6, c: 7, a: 180, sw: 70, sp: 1.2 }];
  BN.PZ.stealth = function (R, A) {
    var C = 30, W = 11 * C, H = 9 * C, cv = A.el('canvas', 'st-cv'); cv.width = W * 2; cv.height = H * 2;
    var w = A.el('div', 'st-pz'); w.appendChild(A.el('p', 'tiny-note', '나귀를 손가락으로 끌어 골목을 빠져나가세요. 순찰꾼의 등불(노란 부채꼴)이 좌우로 돌아요. 빛에 닿으면 처음 자리로. 벽 뒤에서 기다렸다가 지나가요. ✦까지!')); w.appendChild(cv);
    var me = { x: C / 2, y: 8 * C + C / 2 }, drag = null, t0 = performance.now(), alive = true, ctx = cv.getContext('2d'), caught = 0;
    function wall(x, y) { var c = Math.floor(x / C), r = Math.floor(y / C); return r < 0 || r > 8 || c < 0 || c > 10 || MAP[r][c] === '#'; }
    function pos(e) { var b = cv.getBoundingClientRect(); return { x: (e.clientX - b.left) / b.width * W, y: (e.clientY - b.top) / b.height * H }; }
    cv.addEventListener('pointerdown', function (e) { drag = pos(e); cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', function (e) { if (drag) drag = pos(e); });
    cv.addEventListener('pointerup', function () { drag = null; });
    function ang(g, t) { return g.a + Math.sin(t * g.sp) * g.sw; }
    function seen(px, py, t) {
      return GU.some(function (g) {
        var gx = g.c * C + C / 2, gy = g.r * C + C / 2, dx = px - gx, dy = py - gy, d = Math.hypot(dx, dy);
        if (d < C * .6) return true; if (d > C * 2.6) return false;
        var a = Math.atan2(dy, dx) * 180 / Math.PI, da = Math.abs(((a - ang(g, t)) % 360 + 540) % 360 - 180); if (da > 24) return false;
        for (var k = 1; k < 10; k++) { if (wall(gx + dx * k / 10, gy + dy * k / 10)) return false; } return true;
      });
    }
    function frame() {
      if (!alive || !cv.isConnected) return;
      var t = (performance.now() - t0) / 1000;
      if (drag) { var dx = drag.x - me.x, dy = drag.y - me.y, d = Math.hypot(dx, dy), sp = Math.min(1.6, d * .08); if (d > 1) { var nx = me.x + dx / d * sp, ny = me.y + dy / d * sp, rr = 7; if (!wall(nx - rr, me.y - rr) && !wall(nx + rr, me.y - rr) && !wall(nx - rr, me.y + rr) && !wall(nx + rr, me.y + rr)) me.x = nx; if (!wall(me.x - rr, ny - rr) && !wall(me.x + rr, ny - rr) && !wall(me.x - rr, ny + rr) && !wall(me.x + rr, ny + rr)) me.y = ny; } }
      ctx.setTransform(2, 0, 0, 2, 0, 0);
      for (var r = 0; r < 9; r++) for (var c = 0; c < 11; c++) { ctx.fillStyle = MAP[r][c] === '#' ? '#3a2a18' : '#141a30'; ctx.fillRect(c * C, r * C, C - 1, C - 1); }
      ctx.fillStyle = '#ffd27a'; ctx.font = '18px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('✦', 10 * C + C / 2, C / 2);
      GU.forEach(function (g) {
        var gx = g.c * C + C / 2, gy = g.r * C + C / 2, a0 = ang(g, t) * Math.PI / 180;
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
        ctx.beginPath(); ctx.moveTo(gx, gy); for (var k = -24; k <= 24; k += 4) { var aa = a0 + k * Math.PI / 180, L = C * 2.6; for (var s = 1; s <= 13; s++) { if (wall(gx + Math.cos(aa) * L * s / 13, gy + Math.sin(aa) * L * s / 13)) { L = L * (s - 1) / 13; break; } } ctx.lineTo(gx + Math.cos(aa) * L, gy + Math.sin(aa) * L); }
        ctx.closePath(); ctx.fillStyle = 'rgba(255,210,110,.42)'; ctx.fill(); ctx.restore();
        ctx.fillText('🏮', gx, gy);
      });
      ctx.fillText('🫏', me.x, me.y);
      if (seen(me.x, me.y, t)) { caught++; A.sfx('no'); A.toast('등불에 비쳤다! 처음 자리로'); me.x = C / 2; me.y = 8 * C + C / 2; drag = null; }
      if (Math.floor(me.y / C) === 0 && Math.floor(me.x / C) === 10) { alive = false; A.sfx('ok'); setTimeout(function () { A.closeModal(); A.solve(R); }, 500); return; }
      requestAnimationFrame(frame);
    }
    A.modal('골목 빠져나가기', w, function () { alive = false; }); frame();
    if (LOCAL) BN.__stealthWin = function () { me.x = 10 * C + C / 2; me.y = C / 2; };
  };

  // ── 4장: 예언 카드 뒤집기 짝 맞추기(엎어 둔 카드 10장)
  var PAIRS = [['사 7:14', '처녀가 잉태하여 … 임마누엘', '마 1:23'], ['미 5:2', '베들레헴 에브라다야 … 다스릴 자', '마 2:6'], ['호 11:1', '내 아들을 애굽에서 불러냈거늘', '마 2:15'], ['렘 31:15', '라마에서 … 라헬이 그 자식 때문에', '마 2:18'], ['사 9:6', '한 아기가 우리에게 났고', '눅 2:11']];
  BN.PZ.cards = function (R, A) {
    var f = (A.S().f4 = A.S().f4 || {}); if (f.cards) return A.talk([['asaph', 0, '예언 카드는 다 짝지었다.']]);
    var r = A.seedRnd(48), deck = [], open = [], matched = {}, lockUI = false, flips = 0, w = A.el('div', 'mem-pz');
    PAIRS.forEach(function (p, i) { deck.push({ id: i, side: 'o', t: '<small>' + p[0] + '</small>「' + p[1] + '」' }); deck.push({ id: i, side: 'n', t: '<b>' + p[2] + '</b><small>이루어진 자리</small>' }); });
    deck.sort(function () { return r() - .5; });
    BN.__memDeck = deck.map(function (d) { return d.id; });
    function draw() {
      w.innerHTML = '<p class="tiny-note">「이는 주께서 선지자로 하신 말씀을 이루려 하심이라」 — 엎어 둔 카드 열 장. 두 장씩 뒤집어 선지자의 말씀과 이루어진 자리를 짝지으세요. (뒤집은 횟수 ' + flips + ')</p>';
      var g = A.el('div', 'mem-grid');
      deck.forEach(function (d, i) {
        var up = matched[d.id] || open.indexOf(i) >= 0, b = A.el('button', 'mem-c' + (up ? ' up' : '') + (matched[d.id] ? ' done' : '') + (d.side === 'n' ? ' nt' : ''), up ? d.t : '✦'); b.dataset.i = i;
        b.onclick = function () {
          if (lockUI || up) return; open.push(i); A.tick(); if (open.length < 2) return draw();
          flips++; var a = deck[open[0]], c = deck[open[1]];
          if (a.id === c.id && a.side !== c.side) { matched[a.id] = 1; open = []; A.sfx('ok'); draw(); if (Object.keys(matched).length === 5) { f.cards = 1; A.save(); setTimeout(function () { A.closeModal(); if (['cards', 'gifts', 'bow', 'jigsaw'].every(function (k) { return f[k]; })) A.solve(R); else A.talk([['asaph', 0, '다섯 말씀이 다 제자리를 찾았다. 그런데 「애굽」과 「라마」는… 아직 오지 않은 일이로구나.']]); }, 700); } }
          else { draw(); lockUI = true; setTimeout(function () { open = []; lockUI = false; draw(); }, 1100); }
        };
        g.appendChild(b);
      });
      w.appendChild(g);
    }
    draw(); A.modal('예언 카드 뒤집기', w);
  };
})(window.BN);
