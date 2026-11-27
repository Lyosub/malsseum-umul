// 「베들레헴의 밤」 몸으로·손으로 하는 문제(2026-11-27)
// 실제 방향·기울기(3장) · 걸어 보기(1장) · 기울여 기름 나르기(1장) · 말씀 소리 내어 읽기(2장) · 양 몰기(1장) · 실시간 잠입(5장) · 뒤집기 짝 맞추기(4장)
// 센서·마이크가 안 되는 기기는 언제나 누르기로 대신할 수 있다.
(function (BN) {
  BN.PZ = BN.PZ || {};
  var LOCAL = /^(127\.0\.0\.1|localhost)$/.test(location.hostname);
  function needPerm(Ev, cb) { if (Ev && typeof Ev.requestPermission === 'function') Ev.requestPermission().then(function (s) { cb(s === 'granted'); }).catch(function () { cb(false); }); else cb(!!Ev); }
  function overlay(title) { var o = document.createElement('div'); o.className = 'ov7'; o.innerHTML = '<div class="ov7-box"><div class="ov7-head"><b>' + title + '</b><button class="ov7-x">✕</button></div><div class="ov7-body"></div></div>'; document.body.appendChild(o); o.querySelector('.ov7-x').onclick = function () { o.remove(); }; return o; }

  // ── 3장: 별 재는 기구 — 폰을 들고 실제로 그 방향을 향해, 그 높이만큼 기울여 별을 겨눈다
  BN.PZ.astroWheels = BN.PZ.astro;   // 바퀴로 맞추기(3장 원래 문제) — 망원경 화면은 puzzles-v8.js

  // ── 1장: 나사렛 길 — 지도 상자를 열기 전에 폰을 들고 30걸음(안 되면 30번 누르기)
  BN.PZ.walk = function (R, A) {
    var S = A.S(); if (S.walked) return BN.runPuzzle('roadmap', R);
    var N = 30, n = 0, w = A.el('div', 'walk-pz'), lastPeak = 0, high = false, done = false;
    w.innerHTML = '<p class="tiny-note howto">나사렛에서 베들레헴까지 사흘 길이 넘는다. 요셉과 마리아처럼 걸어 보자 — 폰을 손에 들고 실제로 걸으면 걸음이 세어진다.</p><div class="walk-road"><i></i><span>🚶</span></div><p class="aim-read"><b id="wkN">0</b> / ' + N + ' 걸음</p><button class="btn gold" id="wkGo">걷기 시작(센서 켜기)</button><button class="btn ghost" id="wkTap">걸을 수 없는 곳이면: 한 걸음씩 누르기</button>';
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
    body.innerHTML = '<p class="tiny-note howto">기름 쟁반을 폰을 기울여(또는 손가락으로 끌어) 길을 따라 등잔(🪔)까지 옮기세요. 길 밖으로 나가면 기름이 흘러요. 세 번 흘리면 처음부터.</p><canvas class="carry-cv" width="600" height="840"></canvas><p class="aim-read" id="cyS">흘린 기름 0 / 3</p>';
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

  // ── 4장: 예언 카드 뒤집기 짝 맞추기(엎어 둔 카드 10장)
  var PAIRS = [['사 7:14', '처녀가 잉태하여 … 임마누엘', '마 1:23'], ['미 5:2', '베들레헴 에브라다야 … 다스릴 자', '마 2:6'], ['호 11:1', '내 아들을 애굽에서 불러냈거늘', '마 2:15'], ['렘 31:15', '라마에서 … 라헬이 그 자식 때문에', '마 2:18'], ['사 9:6', '한 아기가 우리에게 났고', '눅 2:11']];
  BN.PZ.cards = function (R, A) {
    var f = (A.S().f4 = A.S().f4 || {}); if (f.cards) return A.talk([['asaph', 0, '예언 카드는 다 짝지었다.']]);
    var r = A.seedRnd(48), deck = [], open = [], matched = {}, lockUI = false, flips = 0, w = A.el('div', 'mem-pz');
    PAIRS.forEach(function (p, i) { deck.push({ id: i, side: 'o', t: '<small>' + p[0] + '</small>「' + p[1] + '」' }); deck.push({ id: i, side: 'n', t: '<b>' + p[2] + '</b><small>이루어진 자리</small>' }); });
    deck.sort(function () { return r() - .5; });
    BN.__memDeck = deck.map(function (d) { return d.id; });
    function draw() {
      w.innerHTML = '<p class="tiny-note howto">「이는 주께서 선지자로 하신 말씀을 이루려 하심이라」 — 엎어 둔 카드 열 장. 두 장씩 뒤집어 선지자의 말씀과 이루어진 자리를 짝지으세요. (뒤집은 횟수 ' + flips + ')</p>';
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
