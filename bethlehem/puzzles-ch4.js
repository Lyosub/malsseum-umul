// 「베들레헴의 밤」 4장 퍼즐(2026-11-26). game.js가 넘겨주는 도구(A)로만 움직인다.
(function (BN) {
  BN.PZ = BN.PZ || {};
  function F(A) { var S = A.S(); S.f4 = S.f4 || {}; return S.f4; }
  function piece(A, k, msg) { var f = F(A); f.pc = f.pc || []; if (f.pc.indexOf(k) < 0) { f.pc.push(k); A.save(); A.sfx('ok'); A.toast('🧩 ' + msg + ' (두루마리 조각 ' + f.pc.length + '/4)'); } }
  function flag(R, A, key) {
    var f = F(A); f[key] = 1; A.save();
    if (['cards', 'gifts', 'bow', 'jigsaw'].every(function (k) { return f[k]; })) { A.closeModal(); A.solve(R); return true; }
    return false;
  }
  function shuffle(a, r) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  // ── 1 베들레헴 밤길: 별이 「머물러 서는」 집 — 잠깐 쉬는 것과 다르다(마 2:9) ──
  BN.PZ.pieceA = function (R, A) { piece(A, 'A', '길가 돌 틈에 낀 양피지 조각'); A.talk([['asaph', 0, '찢긴 두루마리 조각이로구나. 우물에서 찢겨 흩어진 그 「성탄 두루마리」다. 잘 간직해라.']]); };
  BN.PZ.starstop = function (R, A) {
    var r = A.seedRnd(41), N = 7, fin = Math.floor(r() * N), seq = [], w = A.el('div', 'ss-pz'), run = 0;
    for (var i = 0; i < 4; i++) { var h; do { h = Math.floor(r() * N); } while (h === fin || (seq.length && seq[seq.length - 1] === h)); seq.push(h); }
    var X = function (i) { return 8 + i * 14; };
    function draw() {
      var svg = '<svg viewBox="0 0 100 62" class="ss-svg"><circle class="ss-star" cx="-10" cy="10" r="2.4"/><line class="ss-beam" x1="0" y1="0" x2="0" y2="0"/>';
      for (var i = 0; i < N; i++) { var hh = 14 + (i * 37 % 5) * 2; svg += '<g class="ss-h" data-i="' + i + '"><rect x="' + (X(i) - 5) + '" y="' + (60 - hh) + '" width="10" height="' + hh + '" rx="1"/><rect class="ss-door" x="' + (X(i) - 1.4) + '" y="' + (60 - 5) + '" width="2.8" height="5"/></g>'; }
      w.innerHTML = svg + '</svg>';
      w.querySelectorAll('.ss-h').forEach(function (g) {
        g.onclick = function () {
          if (A.locked('starstop')) return;
          if (w.dataset.stop !== '1') return A.wrong('starstop', '별이 아직 길을 가는 중이다 — 쉬는 것과 머무는 것은 다르다');
          if (+g.dataset.i === fin) { run++; A.closeModal(); A.solve(R); }
          else A.wrong('starstop', '별은 그 지붕에서 잠깐 쉬었을 뿐이다');
        };
      });
      var again = A.el('button', 'btn ghost', '처음부터 다시 보기'); again.onclick = play; w.appendChild(again);
      w.appendChild(A.el('p', 'tiny-note', '별이 머물러 서는 집의 지붕을 누르세요.'));
    }
    function play() {
      var my = ++run, star = w.querySelector('.ss-star'), beam = w.querySelector('.ss-beam'), path = seq.concat([fin]), k = 0, x = -10, y = 10;
      w.dataset.stop = '0'; beam.setAttribute('x1', 0); beam.setAttribute('x2', 0); beam.setAttribute('y1', 0); beam.setAttribute('y2', 0);
      function go() {
        if (my !== run || !w.isConnected) return;
        if (k >= path.length) { w.dataset.stop = '1'; beam.setAttribute('x1', x); beam.setAttribute('y1', y + 2); beam.setAttribute('x2', x); beam.setAttribute('y2', 40); return; }
        var tx = X(path[k]), ty = 12 + (k % 2) * 4, t0 = performance.now(), sx = x, sy = y, dur = 1300;
        (function step(now) {
          if (my !== run || !w.isConnected) return;
          var t = Math.min(1, (now - t0) / dur), e = t * t * (3 - 2 * t); x = sx + (tx - sx) * e; y = sy + (ty - sy) * e - Math.sin(t * Math.PI) * 6;
          star.setAttribute('cx', x.toFixed(2)); star.setAttribute('cy', y.toFixed(2));
          if (t < 1) requestAnimationFrame(step); else { k++; setTimeout(go, k < path.length ? 1400 : 0); }
        })(t0);
      }
      setTimeout(go, 400);
    }
    draw(); A.modal('별을 따라', w); play();
    BN.__ssFin = fin;   // 시험용
  };

  // ── 2 몇 달 뒤 여관: 그 밤과 달라진 곳 일곱 ──
  var DIFF = [['donkey', 17, 60, 20, 28, '나귀들이 떠났다'], ['blanket', 58, 32, 9, 13, '난간의 담요 색'], ['window', 43, 22, 7, 11, '덧문이 닫혔다'], ['sign', 52, 21, 6, 7, '간판 그림'], ['basket', 76, 67, 7, 8, '계단 밑 바구니'], ['jars', 43, 64, 7, 9, '문 곁 항아리'], ['star', 29, 11, 5, 7, '하늘의 별 하나']];
  BN.DIFF4 = DIFF;
  BN.PZ.diff = function (R, A) {
    var f = F(A); f.diff = f.diff || [];
    var w = A.el('div', 'diff-pz');
    w.innerHTML = '<p class="tiny-note howto">위: 그 밤의 여관(1장) · 아래: 몇 달 뒤. 아래 그림에서 달라진 곳을 누르세요. <b class="df-n">' + f.diff.length + '/7</b></p><img class="df-old" src="img/places/inn.webp" alt=""><div class="df-new"><img src="img/places/inn_later.webp" alt=""></div>';
    var box = w.querySelector('.df-new');
    function mark(d) { var m = A.el('span', 'df-mark'); m.style.left = d[1] + '%'; m.style.top = d[2] + '%'; m.style.width = Math.max(6, d[3]) + '%'; m.style.height = Math.max(8, d[4]) + '%'; box.appendChild(m); }
    DIFF.forEach(function (d) { if (f.diff.indexOf(d[0]) >= 0) mark(d); });
    box.addEventListener('click', function (e) {
      if (A.locked('diff')) return;
      var rc = box.getBoundingClientRect(), x = (e.clientX - rc.left) / rc.width * 100, y = (e.clientY - rc.top) / rc.height * 100;
      var hit = DIFF.find(function (d) { return Math.abs(x - d[1]) <= d[3] / 2 + 1.5 && Math.abs(y - d[2]) <= d[4] / 2 + 2; });
      if (!hit) return A.wrong('diff', '그 밤과 똑같다');
      if (f.diff.indexOf(hit[0]) >= 0) return;
      f.diff.push(hit[0]); A.save(); A.sfx('ok'); mark(hit); A.toast('✔ ' + hit[5]); w.querySelector('.df-n').textContent = f.diff.length + '/7';
      if (f.diff.length === 7) setTimeout(function () { A.closeModal(); A.solve(R); }, 700);
    });
    A.modal('그 밤과 다른 곳', w);
  };
  // 넌센스 → 조각 B
  BN.PZ.riddle4 = function (R, A) {
    var f = F(A); if ((f.pc || []).indexOf('B') >= 0) return A.talk([['gilead', 1, '조각은 드렸어요. 이제 저는 최저 임금을 받으며 일하는 중이에요.', '(아삽 노인 밑에서)']]);
    var w = A.el('div', 'riddle'), inp = A.el('input', 'riddle-in'); inp.placeholder = '답을 적어요'; inp.maxLength = 12;
    w.appendChild(A.el('p', 'riddle-q', '「세상에서 가장 가난한 왕은 누구게요?」'));
    w.appendChild(A.el('p', 'tiny-note', '돈을 제일 적게 받는…'));
    w.appendChild(inp); var go = A.el('button', 'btn gold', '말하기'); w.appendChild(go);
    go.onclick = function () {
      if (A.locked('riddle4')) return; var v = inp.value.replace(/\s/g, '');
      if (/^최저임금(왕)?$/.test(v)) { A.closeModal(); piece(A, 'B', '길르앗이 주머니에서 꺼낸 양피지 조각'); A.talk([['gilead', 1, '최저 임금! 히히. …그런데요, 진짜 왕은 구유에 오셨잖아요. 그건 넌센스가 아니라서 더 신기해요.', '(조각을 건넨다)']]); }
      else A.wrong('riddle4', '길르앗: 「땡! 「임금」은 왕이라는 뜻도 있고…」');
    };
    A.modal('길르앗의 수수께끼', w);
  };

  // ── 3 그 집 문: 창 불빛의 길고 짧은 가락대로 두드리기 ──
  BN.PZ.knock = function (R, A) {
    var r = A.seedRnd(43), pat = []; for (var i = 0; i < 7; i++) pat.push(r() < .45 ? 'L' : 'S'); if (pat.indexOf('L') < 0) pat[3] = 'L'; if (pat.indexOf('S') < 0) pat[1] = 'S';
    BN.__knock = pat.join('');
    var w = A.el('div', 'knock-pz'), lamp = A.el('div', 'kn-lamp'), got = [], t0 = 0, busy = 0;
    w.appendChild(lamp); var see = A.el('button', 'btn ghost', '창 불빛 보기'); w.appendChild(see);
    var dots = A.el('div', 'kn-dots'); w.appendChild(dots);
    var pad = A.el('button', 'kn-door', '🚪<small>누르고 있으면 길게</small>'); w.appendChild(pad);
    var row = A.el('div', 'disc-btns'), clr = A.el('button', 'btn ghost', '처음부터'), go = A.el('button', 'btn gold', '다 두드렸다'); row.appendChild(clr); row.appendChild(go); w.appendChild(row);
    w.appendChild(A.el('p', 'tiny-note', '불빛이 길게 켜지면 길게, 짧게 켜지면 짧게.'));
    function show() { dots.innerHTML = got.map(function (g) { return '<i class="' + g + '"></i>'; }).join(''); }
    see.onclick = function () {
      if (busy) return; busy = 1; var k = 0;
      (function nx() { if (!w.isConnected) return; if (k >= pat.length) { busy = 0; return; } lamp.classList.add('on'); setTimeout(function () { lamp.classList.remove('on'); k++; setTimeout(nx, 380); }, pat[k] === 'L' ? 900 : 260); })();
    };
    pad.addEventListener('pointerdown', function (e) { e.preventDefault(); t0 = performance.now(); pad.classList.add('dn'); });
    pad.addEventListener('pointerup', function () { if (!t0) return; var d = performance.now() - t0; t0 = 0; pad.classList.remove('dn'); if (got.length < 12) { got.push(d >= 420 ? 'L' : 'S'); A.tick(); show(); } });
    clr.onclick = function () { got = []; show(); };
    go.onclick = function () {
      if (A.locked('knock')) return;
      if (got.join('') === pat.join('')) { A.closeModal(); piece(A, 'C', '문지방 틈에 끼어 있던 양피지 조각'); A.solve(R); }
      else { A.wrong('knock', '안에서 아무 대답이 없다 — 가락이 다르다'); got = []; show(); }
    };
    A.modal('그 집 문', w);
  };

  // ── 4 그 집 안 ──
  // 예언 카드: 선지자의 글 다섯 ↔ 이루어진 자리(구절 번호만)
  var PROPH = [
    ['사 7:14', '…보라 처녀가 잉태하여 아들을 낳을 것이요 그의 이름을 임마누엘이라 하리라', '마 1:23'],
    ['미 5:2', '베들레헴 에브라다야 너는 유다 족속 중에 작을지라도 이스라엘을 다스릴 자가 네게서 내게로 나올 것이라…', '마 2:6'],
    ['호 11:1', '이스라엘이 어렸을 때에 내가 사랑하여 내 아들을 애굽에서 불러냈거늘', '마 2:15'],
    ['렘 31:15', '…라마에서 슬퍼하며 통곡하는 소리가 들리니 라헬이 그 자식 때문에 애곡하는 것이라…', '마 2:18'],
    ['사 9:6', '이는 한 아기가 우리에게 났고 한 아들을 우리에게 주신 바 되었는데…', '눅 2:11']
  ];
  BN.PZ.cards = function (R, A) {
    if (F(A).cards) return A.talk([['asaph', 0, '예언 카드는 다 짝지었다.']]);
    var r = A.seedRnd(44), right = shuffle(PROPH.map(function (p) { return p[2]; }), r), pair = {}, sel = -1, w = A.el('div', 'cards-pz');
    function draw() {
      w.innerHTML = '<p class="tiny-note">「이는 주께서 선지자로 하신 말씀을 이루려 하심이라」 — 선지자의 글(왼쪽)이 이루어진 자리(오른쪽)를 짝지으세요. 오른쪽은 구절 번호뿐입니다.</p>';
      var g = A.el('div', 'cd-grid'), L = A.el('div', 'cd-col'), Rr = A.el('div', 'cd-col');
      PROPH.forEach(function (p, i) { var b = A.el('button', 'cd-l' + (sel === i ? ' sel' : '') + (pair[i] ? ' on' : ''), '<small>' + p[0] + '</small>「' + p[1] + '」' + (pair[i] ? '<b>→ ' + pair[i] + '</b>' : '')); b.dataset.i = i; b.onclick = function () { sel = sel === i ? -1 : i; draw(); }; L.appendChild(b); });
      right.forEach(function (ref) { var used = Object.keys(pair).some(function (k) { return pair[k] === ref; }); var b = A.el('button', 'cd-r' + (used ? ' used' : ''), ref); b.dataset.ref = ref; b.onclick = function () { if (sel < 0) return; Object.keys(pair).forEach(function (k) { if (pair[k] === ref) delete pair[k]; }); pair[sel] = ref; sel = -1; A.tick(); draw(); }; Rr.appendChild(b); });
      g.appendChild(L); g.appendChild(Rr); w.appendChild(g);
      var go = A.el('button', 'btn gold', '짝 맞추기'); w.appendChild(go);
      go.onclick = function () {
        if (A.locked('cards')) return;
        if (Object.keys(pair).length < 5) return A.toast('다섯 장을 모두 짝지어요');
        if (PROPH.every(function (p, i) { return pair[i] === p[2]; })) { A.sfx('ok'); if (!flag(R, A, 'cards')) { A.closeModal(); A.talk([['asaph', 0, '다섯 말씀이 다 제자리를 찾았다. 그런데 「애굽」과 「라마」는… 아직 오지 않은 일이로구나.']]); } }
        else A.wrong('cards', '카드 몇 장이 제자리가 아니다');
      };
    }
    draw(); A.modal('예언 카드 다섯', w);
  };
  // 세 예물: 성경 다른 곳에 또 나오는 자리
  var GIFTS = [['황금', '시 72:15'], ['유향', '출 30:34'], ['몰약', '요 19:39']];
  BN.PZ.gifts = function (R, A) {
    if (F(A).gifts) return A.talk([['narr', 0, '황금과 유향과 몰약. 보배합은 열려 있다.']]);
    var refs = ['출 30:34', '요 19:39', '시 72:15'], pick = {}, w = A.el('div', 'gifts-pz');
    w.innerHTML = '<p class="tiny-note">보배합 밑에 쪽지: 「이 예물들은 성경 다른 곳에 또 나온다. 제자리를 찾으면 조각을 주리라.」</p>';
    w.appendChild((function () {
      var box = A.el('div', 'wl-row');
      GIFTS.forEach(function (g, i) {
        var col = A.el('div', 'wl-col'), img = A.el('div', 'gf-img', '<img src="img/chars/gift_' + ['gold', 'frank', 'myrrh'][i] + '.webp" alt="">'), v = A.el('button', 'wl-val gf-ref', '?');
        col.appendChild(A.el('div', 'wl-lbl', g[0])); col.appendChild(img); col.appendChild(v);
        var k = -1; v.onclick = function () { k = (k + 1) % refs.length; pick[i] = refs[k]; v.textContent = refs[k]; A.tick(); };
        box.appendChild(col);
      });
      return box;
    })());
    var go = A.el('button', 'btn gold', '보배합 닫기'); w.appendChild(go);
    go.onclick = function () {
      if (A.locked('gifts')) return;
      if (GIFTS.every(function (g, i) { return pick[i] === g[1]; })) { piece(A, 'D', '보배합 바닥의 양피지 조각'); if (!flag(R, A, 'gifts')) { A.closeModal(); A.talk([['asaph', 0, '왕께 드리는 금, 거룩한 향의 유향, 그리고 장사 지낼 때 쓰는 몰약이로구나.']]); } }
      else A.wrong('gifts', '쪽지의 글씨가 흐려진다 — 아직이다');
    };
    A.modal('세 예물', w);
  };
  // 엎드려 경배(마 2:11): 폰을 화면이 바닥을 향하게 엎어 5초 — 안 되면 화면을 10초 누르고 있기
  BN.PZ.bow = function (R, A) {
    if (F(A).bow) return A.talk([['narr', 0, '(조용하다. 등잔 불빛만 흔들린다.)']]);
    var w = A.el('div', 'bow-pz'), st = A.el('p', 'bow-st', '준비'), down = 0, okd = 0;
    w.appendChild(A.el('p', 'bow-q', '「집에 들어가 아기와 그의 어머니 마리아가 함께 있는 것을 보고 엎드려 아기께 경배하고」<br><small>마태복음 2:11</small>'));
    w.appendChild(A.el('p', 'tiny-note howto', '휴대폰을 화면이 바닥을 향하게 엎어 두세요. 5초 동안 그대로 두면 됩니다.'));
    w.appendChild(st);
    function done() { if (okd) return; okd = 1; try { navigator.vibrate && navigator.vibrate([60, 80, 60]); } catch (e) {} window.removeEventListener('deviceorientation', ori); A.sfx('ok'); st.textContent = '✦ 경배했다'; setTimeout(function () { if (!flag(R, A, 'bow')) { A.closeModal(); A.talk([['asaph', 0, '박사들이 엎드렸다. 먼 길을 와서 한 일이 바로 이것이었구나.']]); } }, 900); }
    function ori(e) { var b = e.beta || 0, g = e.gamma || 0, face = Math.abs(b) > 150 || (Math.abs(b) < 30 && Math.abs(g) > 150); if (face) { if (!down) down = performance.now(); else if (performance.now() - down > 5000) done(); } else down = 0; }
    var start = A.el('button', 'btn gold', '엎드리기 시작');
    start.onclick = function () {
      st.textContent = '폰을 엎어 두세요…';
      var DO = window.DeviceOrientationEvent;
      if (DO && typeof DO.requestPermission === 'function') DO.requestPermission().then(function (s) { if (s === 'granted') window.addEventListener('deviceorientation', ori); }).catch(function () {});
      else window.addEventListener('deviceorientation', ori);
    };
    w.appendChild(start);
    var hold = A.el('button', 'bow-hold', '폰을 엎을 수 없나요? 여기를 10초 동안 누르고 있기'), ht = 0, hv = 0;
    hold.addEventListener('pointerdown', function (e) { e.preventDefault(); ht = performance.now(); hold.classList.add('dn'); hv = setInterval(function () { var s = (performance.now() - ht) / 1000; hold.style.setProperty('--p', Math.min(1, s / 10)); if (s >= 10) { clearInterval(hv); done(); } }, 100); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { hold.addEventListener(ev, function () { clearInterval(hv); hold.classList.remove('dn'); if (!okd) hold.style.setProperty('--p', 0); }); });
    w.appendChild(hold);
    A.modal('엎드려 경배', w, function () { window.removeEventListener('deviceorientation', ori); clearInterval(hv); });
  };
  // 찢긴 두루마리 직소: 조각 넷을 바르게(돌리고 바꾸어) — 마 2:13
  var JIG = '그들이 떠난 후에 주의 사자가 요셉에게 현몽하여 이르되 헤롯이 아기를 찾아 죽이려 하니 일어나 아기와 그의 어머니를 데리고 애굽으로 피하여 내가 네게 이르기까지 거기 있으라 하시니';
  function jigImg() {
    var c = document.createElement('canvas'); c.width = 640; c.height = 500; var g = c.getContext('2d');
    var gr = g.createLinearGradient(0, 0, 640, 500); gr.addColorStop(0, '#efe0bd'); gr.addColorStop(1, '#d9c193'); g.fillStyle = gr; g.fillRect(0, 0, 640, 500);
    g.strokeStyle = '#8a5a2a'; g.lineWidth = 4; g.strokeRect(12, 12, 616, 476); g.lineWidth = 1.5; g.strokeRect(22, 22, 596, 456);
    g.fillStyle = '#8a5a2a'; g.font = '28px serif'; g.textBaseline = 'middle'; g.fillText('✦', 28, 34);
    g.fillStyle = '#3a2412'; g.font = '700 36px "Gowun Batang", serif'; g.textBaseline = 'top';
    var words = JIG.split(' '), line = '', y = 44, lines = [];
    words.forEach(function (wd) { var t = line ? line + ' ' + wd : wd; if (g.measureText(t).width > 560) { lines.push(line); line = wd; } else line = t; });
    lines.push(line); lines.forEach(function (l, k) { g.fillText(l, 40, y + k * 56); });
    g.font = '700 24px serif'; g.fillStyle = '#7a5a2a'; g.textAlign = 'right'; g.fillText('— 마태복음 2:13', 600, 448);
    return c.toDataURL('image/jpeg', .86);
  }
  BN.PZ.jigsaw = function (R, A) {
    var f = F(A); if (f.jigsaw) return A.talk([['asaph', 0, '두루마리 한 쪽이 다시 이어졌다.']]);
    var have = (f.pc || []).length; if (have < 4) { var WHERE = { A: '밤길 큰 바위 곁', B: '몇 달 뒤 여관의 길르앗(수수께끼)', C: '그 집 문(약속한 가락)', D: '보배합 바닥(세 예물)' }, miss = ['A', 'B', 'C', 'D'].filter(function (k) { return (f.pc || []).indexOf(k) < 0; }).map(function (k) { return WHERE[k]; }); return A.talk([['asaph', 0, '찢긴 두루마리 조각이 ' + have + '개뿐이다. 넷을 다 모아야 맞출 수 있다.'], ['gilead', 2, '(소곤) 아직 못 받은 데: ' + miss.join(' · ') + '.']]); }   // 11/28 블라인드 풀이: 어디서 빠졌는지 알려 준다
    var r = A.seedRnd(45), cells = shuffle([0, 1, 2, 3], r).map(function (id) { return { id: id, rot: 1 + Math.floor(r() * 3) }; }), sel = -1, src = jigImg(), w = A.el('div', 'jig-pz');
    function draw() {
      w.innerHTML = '';
      var b = A.el('div', 'jig-board');
      cells.forEach(function (c, i) {
        var t = A.el('button', 'jig-t' + (sel === i ? ' sel' : '')); t.dataset.i = i;
        t.innerHTML = '<span style="background-image:url(' + src + ');background-position:' + (c.id % 2 ? '100%' : '0') + ' ' + (c.id > 1 ? '100%' : '0') + ';transform:rotate(' + c.rot * 90 + 'deg)"></span>';
        t.onclick = function () { if (sel < 0) sel = i; else if (sel === i) { c.rot = (c.rot + 1) % 4; sel = -1; } else { var tmp = cells[sel]; cells[sel] = cells[i]; cells[i] = tmp; sel = -1; } A.tick(); draw(); };
        b.appendChild(t);
      });
      w.appendChild(b);
      w.appendChild(A.el('p', 'tiny-note howto', '조각을 누르고 다른 조각을 누르면 자리가 바뀌어요. 같은 조각을 두 번 누르면 돌아가요.'));
      var go = A.el('button', 'btn gold', '이어 붙이기'); w.appendChild(go);
      go.onclick = function () {
        if (A.locked('jigsaw')) return;
        if (cells.every(function (c, i) { return c.id === i && c.rot === 0; })) { A.sfx('ok'); if (!flag(R, A, 'jigsaw')) { A.closeModal(); A.talk([['asaph', 0, '이어 붙인 쪽에 적힌 말씀… 이 가족에게 곧 먼 길이 남았구나.']]); } }
        else A.wrong('jigsaw', '글줄이 이어지지 않는다');
      };
    }
    draw(); A.modal('찢긴 두루마리', w);
  };
})(window.BN);
