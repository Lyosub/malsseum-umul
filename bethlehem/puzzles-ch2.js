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

  // 1 이름: 자음·모음 조각으로 두 글자 만들기(초성+중성)
  var CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ', JUNG = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
  function syl(c, v) { if (!c || !v) return ''; var a = CHO.indexOf(c), b = JUNG.indexOf(v); return a >= 0 && b >= 0 ? String.fromCharCode(0xAC00 + (a * 21 + b) * 28) : ''; }
  // 조각은 나무 막대라 돌아가 있다: 글꼴 모양(g)·처음 각도(r)·각도별로 읽히는 글자(v)
  var PIECE = {
    'ㅇ': { g: 'ㅇ', r: 0, v: ['ㅇ', 'ㅇ', 'ㅇ', 'ㅇ'] }, 'ㅅ': { g: 'ㅅ', r: 2, v: ['ㅅ'] }, 'ㅁ': { g: 'ㅁ', r: 1, v: ['ㅁ', 'ㅁ', 'ㅁ', 'ㅁ'] },
    'ㅣ': { g: 'ㅣ', r: 1, v: ['ㅣ', 'ㅡ', 'ㅣ', 'ㅡ'] }, 'ㄴ': { g: 'ㄴ', r: 1, v: ['ㄴ', '', 'ㄱ'] }, 'ㅔ': { g: 'ㅔ', r: 3, v: ['ㅔ'] },
    'ㅜ': { g: 'ㅏ', r: 2, v: ['ㅏ', 'ㅜ', 'ㅓ', 'ㅗ'] }, 'ㄹ': { g: 'ㄹ', r: 1, v: ['ㄹ', '', 'ㄹ'] }, 'ㅖ': { g: 'ㅖ', r: 1, v: ['ㅖ'] }
  };
  var VOW = 'ㅣㅔㅜㅖ';
  function readP(p) { return p ? (PIECE[p.t].v[p.r] || '') : ''; }
  BN.PZ.name = function (R, A) {
    var S = A.S(), got = S.tiles || [];
    if (got.length < 4) return A.talk([['asaph', 0, '조각이 아직 모자라다. 집 안을 더 살펴보아라.']]);
    var w = A.el('div', 'name-pz'), slots = [null, null, null, null];
    function glyph(t, r) { return '<span class="pc" style="transform:rotate(' + r * 90 + 'deg)">' + PIECE[t].g + '</span>'; }
    function draw() {
      w.innerHTML = '<p class="tiny-note">찾은 조각 ' + got.length + '/9 · 조각은 나무 막대라 돌아가 있어요.<br>조각을 누르면 빈칸에 들어가고, 빈칸을 누르면 90°씩 돌아가요(✕는 빼기).<br>명부는 바르게 세운 글자만 읽어요 — 다 맞춘 뒤에야 적혀요</p>';
      var row = A.el('div', 'name-slots');
      [0, 2].forEach(function (k) {
        var blk = A.el('div', 'name-blk');
        var two = A.el('div', 'name-two');
        [k, k + 1].forEach(function (i) {
          var p = slots[i], b = A.el('button', 'name-slot sm' + (p ? ' on' : ''), p ? glyph(p.t, p.r) : (i % 2 ? '모음' : '자음'));
          if (p) { b.dataset.j = p.t; b.dataset.rot = p.r; }
          b.onclick = function () { if (!p) return; p.r = (p.r + 1) % 4; A.tick(); draw(); };
          if (p) { var x = A.el('span', 'name-x', '✕'); x.onclick = function (e) { e.stopPropagation(); slots[i] = null; draw(); }; b.appendChild(x); }
          two.appendChild(b);
        });
        blk.appendChild(two); row.appendChild(blk);
      });
      w.appendChild(row);
      var tray = A.el('div', 'name-tray');
      got.forEach(function (t) {
        if (slots.some(function (p) { return p && p.t === t; })) return;
        var b = A.el('button', 'name-tile', glyph(t, PIECE[t].r)); b.dataset.j = t;
        b.onclick = function () { var vow = VOW.indexOf(t) >= 0, k = -1; for (var i = 0; i < 4; i++) if (!slots[i] && (i % 2 === 1) === vow) { k = i; break; } if (k < 0) return; slots[k] = { t: t, r: PIECE[t].r }; draw(); };
        tray.appendChild(b);
      });
      w.appendChild(tray);
      var go = A.el('button', 'btn gold', '명부에 적기');
      go.onclick = function () {
        if (A.locked('name')) return;
        var nm = syl(readP(slots[0]), readP(slots[1])) + syl(readP(slots[2]), readP(slots[3]));
        if (nm === '예수') meaning();
        else if (/^(임|마|누|엘|에|미|이)/.test(nm)) A.wrong('name', '마태복음 1장 23절의 이름을 떠올렸나요? 「천사가 일컬은」 이름은 따로 있어요');
        else A.wrong('name', '명부의 칸이 받아들이지 않는다');
      };
      w.appendChild(go);
    }
    // 2단계: 이름 옆 「뜻」 칸 — 개역개정 원문 넷 중 하나
    function meaning() {
      var m = A.el('div', 'name-pz');
      m.innerHTML = '<p class="tiny-note">이름이 들어갔다. 명부의 그 줄에는 칸이 하나 더 있다 — 「이 이름을 주신 까닭」</p>';
      var OPT = [
        ['하나님이 우리와 함께 계시다', 'imm'],
        ['그리스도 주시니라', 'chr'],
        ['자기 백성을 그들의 죄에서 구원할 자', 'ok'],
        ['지극히 높으신 이의 아들이라 일컬어질 것이요', 'son']
      ];
      OPT.forEach(function (o) {
        var b = A.el('button', 'btn ghost offer', '「' + o[0] + '」');
        b.onclick = function () {
          if (A.locked('name')) return;
          if (o[1] === 'ok') { A.closeModal(); A.solve(R); }
          else if (o[1] === 'imm') A.wrong('name', '그 말은 다른 이름 「임마누엘」을 번역한 뜻이에요. 천사가 요셉에게 「예수라 하라」고 할 때 붙인 까닭을 찾아요');
          else if (o[1] === 'chr') A.wrong('name', '그건 목자들에게 전한 소식 — 누구신지를 알린 말이에요. 이름에 붙은 「이는 …이심이라」를 찾아요');
          else A.wrong('name', '그건 마리아가 들은 말 — 이 아기가 어떤 분이 되실지예요. 이름의 까닭은 요셉이 들었어요');
        };
        m.appendChild(b);
      });
      A.modal('명부의 빈칸 · 이름의 까닭', m);
    }
    draw(); A.modal('명부의 빈칸 · 이름', w);
  };
  // 넌센스: 길르앗의 수수께끼 → 마지막 조각 「ㅖ」
  BN.PZ.riddle = function (R, A) {
    var S = A.S();
    if ((S.tiles || []).indexOf('ㅖ') >= 0) return A.talk([['gilead', 1, '조각은 드렸잖아요. 이제 빵 생각만 할래요.', '(이미 함)']]);
    var w = A.el('div', 'riddle'), inp = A.el('input', 'riddle-in'); inp.placeholder = '답을 적어요'; inp.maxLength = 12;
    w.appendChild(A.el('p', 'riddle-q', '「온 세상에서 빵이 가장 많은 동네는 어디게요?<br>힌트: 바로 여기예요!」'));
    w.appendChild(A.el('p', 'tiny-note', '이 동네 이름에 숨은 뜻을 생각해 보세요'));
    w.appendChild(inp); var go = A.el('button', 'btn gold', '말하기'); w.appendChild(go);
    go.onclick = function () {
      if (A.locked('riddle')) return; var v = inp.value.replace(/\s/g, '');
      if (/^(떡집|빵집|베들레헴|떡의집|빵의집)$/.test(v)) {
        S.tiles = S.tiles || []; S.tiles.push('ㅖ'); A.save(); A.closeModal(); A.sfx('ok');
        A.talk([['gilead', 1, v.indexOf('베들레헴') >= 0 ? '맞아요! 베들레헴은 「떡집」이라는 뜻이래요. 그래서 제가 여기만 오면 배가 고픈 거예요.' : '정답! 베들레헴이 바로 「떡집」이라는 뜻이래요.', '(조각 「ㅖ」를 받았다)']]);
      } else A.wrong('riddle', '길르앗: 「땡! 배고파서 힌트 하나 더 — 이 동네 이름의 뜻!」');
    };
    A.modal('길르앗의 수수께끼', w);
  };

  // 2 오르는 길: 기울이기(또는 끌기)로 새장 굴리기 — 비둘기 둘을 모은 뒤 맨 위 문
  BN.PZ.climb = function (R, A) {
    var S0 = A.S();
    if (!S0.psalmOk && BN.PZ.slide) return BN.PZ.slide(R, A);
    if (!S0.psalmOk) {
      var order = BN.ASCENT.map(function (x, i) { return i; }), r = A.seedRnd(31); order.sort(function () { return r() - .5; });
      var step = 0, pw = A.el('div', 'psalm-pz');
      pw.appendChild(A.el('p', 'tiny-note', '계단 돌 다섯. 올라가는 순서대로 밟아요(틀리면 처음부터).'));
      order.forEach(function (k) {
        var b = A.el('button', 'psalm-stone', '「' + BN.ASCENT[k][1] + '」');
        b.onclick = function () {
          if (A.locked('psalm')) return;
          if (k === step) { b.classList.add('on'); b.disabled = true; step++; A.tick(); if (step === BN.ASCENT.length) { S0.psalmOk = 1; A.save(); A.sfx('ok'); A.closeModal(); A.toast('계단 문이 열렸다 — 이제 새장을 옮겨요'); setTimeout(function () { BN.PZ.climb(R, A); }, 600); } }
          else { step = 0; pw.querySelectorAll('.psalm-stone').forEach(function (x) { x.classList.remove('on'); x.disabled = false; }); A.wrong('psalm', '돌이 덜컹 — 처음부터'); }
        };
        pw.appendChild(b);
      });
      return A.modal('성전에 올라가는 노래', pw);
    }
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
      if (n === 32) { A.closeModal(); A.solve(R); }
      else if (n === 40) A.wrong('days', '그건 태어난 날부터 센 날이에요. 문지기는 이름을 받은 날부터 센다던데…');
      else if (n === 8 || n === 7 || n === 33) A.wrong('days', '그건 날수의 한 부분이에요');
      else A.wrong('days', '문이 꿈쩍도 하지 않는다');
    }, '문 두드리기');
    A.modal('이름을 받은 날부터 며칠 뒤?', w);
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
    if (!S.fakeOk) return A.talk([['asaph', 0, '이 장수의 추는 믿을 수 없다. 동전 탁자에서 정직한 추부터 얻어 오너라.']]);
    S.scaleTry = S.scaleTry || 0; var rnd = A.seedRnd(70 + S.scaleTry), target = 5 + Math.floor(rnd() * 36), st = {}, left = 6;
    var WTS = [27, 9, 3, 1];   // st[k]: 0 내림, 1 추 쪽, 2 새장 쪽
    function sum() { return WTS.reduce(function (a, k) { return a + (st[k] === 1 ? k : st[k] === 2 ? -k : 0); }, 0); }
    function draw(tiltDeg, msg) {
      var L = WTS.filter(function (k) { return st[k] === 2; }), Rr = WTS.filter(function (k) { return st[k] === 1; });
      w.innerHTML = '<p class="tiny-note">왼쪽: 비둘기 새장 · 오른쪽: 추. 추를 누르면 「추 쪽 → 새장 쪽 → 내림」. 저울에 올릴 기회 <b>' + left + '</b>번</p>' +
        '<svg viewBox="0 0 300 150" class="scale-svg"><line x1="150" y1="20" x2="150" y2="130" stroke="#c9a15a" stroke-width="5"/><g transform="rotate(' + tiltDeg + ' 150 30)"><line x1="40" y1="30" x2="260" y2="30" stroke="#e8b75a" stroke-width="5"/><line x1="55" y1="30" x2="55" y2="80" stroke="#bda"/><line x1="245" y1="30" x2="245" y2="80" stroke="#bda"/><path d="M25 80 h60 l-10 16 h-40z" fill="#8a6a3a"/><path d="M215 80 h60 l-10 16 h-40z" fill="#8a6a3a"/><text x="55" y="74" font-size="22" text-anchor="middle">🧺</text><text x="55" y="58" font-size="11" fill="#ffe2a0" text-anchor="middle">' + L.join('+') + '</text><text x="245" y="74" font-size="13" fill="#ffe2a0" text-anchor="middle">' + Rr.join('+') + '</text></g><path d="M120 140 h60 l-8-12 h-44z" fill="#6b5233"/></svg>' + (msg ? '<p class="scale-msg">' + msg + '</p>' : '');
      var row = A.el('div', 'wt-row');
      WTS.forEach(function (k) { var b = A.el('button', 'wt' + (st[k] === 1 ? ' on' : st[k] === 2 ? ' left' : ''), k + '<small>' + (st[k] === 1 ? '추 쪽' : st[k] === 2 ? '새장 쪽' : '세겔') + '</small>'); b.onclick = function () { st[k] = ((st[k] || 0) + 1) % 3; draw(0, ''); }; row.appendChild(b); });
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
  // 4-1 가짜 동전: 아홉 닢 중 가벼운 하나를 두 번 달아 찾기
  BN.PZ.fake = function (R, A) {
    var S = A.S();
    if (S.fakeOk) return A.talk([['gilead', 1, '정직한 추는 받았어요. 장수 아저씨 표정이 안 좋네요.', '(뿌듯)']]);
    S.fakeTry = S.fakeTry || 0; var fake = Math.floor(A.seedRnd(90 + S.fakeTry)() * 9), side = {}, left = 2, log = [];
    var w = A.el('div', 'fake-pz');
    function draw(msg) {
      w.innerHTML = '<p class="tiny-note">환전상: 「아홉 닢 중 하나는 가벼운 가짜요. 내 작은 저울을 <b>두 번</b>만 쓰고 가짜를 집으면 정직한 추를 주지.」</p>' + (log.length ? '<p class="scale-msg">' + log.join('<br>') + '</p>' : '') + (msg ? '<p class="scale-msg">' + msg + '</p>' : '');
      var row = A.el('div', 'coin-row');
      for (var i = 0; i < 9; i++) (function (i) { var c = A.el('button', 'coin' + (side[i] === 1 ? ' l' : side[i] === 2 ? ' r' : ''), (i + 1) + '<small>' + (side[i] === 1 ? '왼' : side[i] === 2 ? '오' : '') + '</small>'); c.onclick = function () { side[i] = ((side[i] || 0) + 1) % 3; draw(); }; row.appendChild(c); })(i);
      w.appendChild(row);
      var bw = A.el('button', 'btn ghost', '달아 보기 (' + left + '번 남음)'); bw.disabled = left <= 0; bw.onclick = weigh; w.appendChild(bw);
      var pick = A.el('div', 'coin-pick'); pick.appendChild(A.el('span', '', '가짜는 '));
      for (var k = 0; k < 9; k++) (function (k) { var b = A.el('button', 'coin-p', (k + 1) + '번'); b.onclick = function () { choose(k); }; pick.appendChild(b); })(k);
      w.appendChild(pick);
    }
    function weigh() {
      var L = [], Rr = []; for (var i = 0; i < 9; i++) { if (side[i] === 1) L.push(i); if (side[i] === 2) Rr.push(i); }
      if (!L.length || L.length !== Rr.length) return A.toast('양쪽에 같은 수의 동전을 올려요');
      left--; var lw = L.length - (L.indexOf(fake) >= 0 ? .1 : 0), rw = Rr.length - (Rr.indexOf(fake) >= 0 ? .1 : 0);
      log.push((2 - left) + '번째: [' + L.map(function (x) { return x + 1; }).join(',') + '] ' + (lw === rw ? '=' : lw < rw ? '↑ 가벼움' : '↓ 무거움') + ' [' + Rr.map(function (x) { return x + 1; }).join(',') + ']');
      side = {}; A.tick(); draw();
    }
    function choose(k) {
      if (k === fake && left < 2) { S.fakeOk = 1; if (S.items.indexOf('weights') < 0) S.items.push('weights'); A.save(); A.sfx('ok'); A.closeModal(); A.talk([['gilead', 1, '찾았다! 이 동전, 손에 쥐니까 가볍네요.', '(정직한 세겔 추를 받았다 — 1·3·9·27)']]); }
      else { S.fakeTry++; A.save(); A.closeModal(); A.wrong('fake', k === fake ? '찍어서 맞히면 안 쳐 준대요 — 저울로 확인해야죠' : '환전상: 「틀렸소. 동전을 다시 섞겠소.」'); }
    }
    draw(); A.modal('환전상의 아홉 닢', w);
  };

  // 5 솔로몬 행각: 60초 동안 아무것도 누르지 않기
  BN.PZ.wait = function (R, A) {
    var S0 = A.S(); if (S0.waitOk) return hymn(R, A);
    var w = A.el('div', 'wait-pz'), need = 90000, t0 = Date.now(), alive = true;
    w.innerHTML = '<div class="hg"><div class="hg-top"></div><div class="hg-bot"></div></div><p class="wait-ref">「이스라엘의 위로를 기다리는 자라」<br><small>누가복음 2:25</small></p>';
    function reset(e) { if (!alive) return; if (e && e.target && e.target.closest && e.target.closest('#modalX')) return; t0 = Date.now(); w.classList.remove('flash'); void w.offsetWidth; w.classList.add('flash'); }
    var evs = ['pointerdown', 'keydown', 'wheel'];
    evs.forEach(function (k) { addEventListener(k, reset, true); });
    function cleanup() { alive = false; evs.forEach(function (k) { removeEventListener(k, reset, true); }); }
    (function loop() {
      if (!alive) return; var p = Math.min(1, (Date.now() - t0) / need);
      w.style.setProperty('--p', p.toFixed(3));
      if (p >= 1) { cleanup(); S0.waitOk = 1; A.save(); A.closeModal(); A.sfx('ok'); A.talk([['narr', 0, '(한 노인이 성령의 감동으로 성전에 들어온다. 그의 찬송이 기둥 사이에 흩어져 새겨진다.)']], function () { hymn(R, A); }); return; }
      requestAnimationFrame(loop);
    })();
    A.modal('기다림', w, cleanup);
  };

  function hymn(R, A) {
    var idx = [0, 1, 2, 3], r = A.seedRnd(41); idx.sort(function () { return r() - .5; }); if (idx.join() === '0,1,2,3') idx = [2, 0, 3, 1];
    var step = 0, w = A.el('div', 'psalm-pz'); w.appendChild(A.el('p', 'tiny-note', '기둥에 새겨진 찬송 조각을 부른 순서대로 눌러요.'));
    idx.forEach(function (k) { var b = A.el('button', 'psalm-stone', '「' + BN.SIMEON[k] + '」'); b.onclick = function () {
      if (A.locked('hymn')) return;
      if (k === step) { b.classList.add('on'); b.disabled = true; step++; A.tick(); if (step === 4) { A.closeModal(); A.solve(R); } }
      else { step = 0; w.querySelectorAll('.psalm-stone').forEach(function (x) { x.classList.remove('on'); x.disabled = false; }); A.wrong('hymn', '순서가 아니에요 — 처음부터'); }
    }; w.appendChild(b); });
    A.modal('시므온의 찬송', w);
  }
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
