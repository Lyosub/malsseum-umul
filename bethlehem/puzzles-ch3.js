// 「베들레헴의 밤」 3장 퍼즐(2026-11-26). game.js가 넘겨주는 도구(A)로만 움직인다.
(function (BN) {
  BN.PZ = BN.PZ || {};
  function wheels(A, specs, onTry, label, start) {
    var box = A.el('div', 'wl-row'), idx = specs.map(function (sp, i) { return (start && start[i]) || 0; });
    specs.forEach(function (sp, i) {
      var col = A.el('div', 'wl-col'), up = A.el('button', 'wl-btn', '▲'), v = A.el('div', 'wl-val'), dn = A.el('button', 'wl-btn', '▼');
      if (sp.label) col.appendChild(A.el('div', 'wl-lbl', sp.label));
      function show() { v.textContent = sp.vals[idx[i]]; }
      up.onclick = function () { idx[i] = (idx[i] + sp.vals.length - 1) % sp.vals.length; show(); A.tick(); };
      dn.onclick = function () { idx[i] = (idx[i] + 1) % sp.vals.length; show(); A.tick(); };
      show(); col.appendChild(up); col.appendChild(v); col.appendChild(dn); box.appendChild(col);
    });
    var go = A.el('button', 'btn gold wl-go', label || '맞추기');
    go.onclick = function () { onTry(idx.map(function (k, i) { return specs[i].vals[k]; })); };
    var w = A.el('div', 'wl-wrap'); w.appendChild(box); w.appendChild(go); return w;
  }
  // 한 방에 퍼즐이 여럿이면 깃발을 모아 다 모였을 때 방을 푼다
  function flag(R, A, key, need) {
    var S = A.S(); S.f3 = S.f3 || {}; S.f3[key] = 1; A.save();
    if (need.every(function (k) { return S.f3[k]; })) { A.closeModal(); A.solve(R); return true; }
    return false;
  }
  function has(A, k) { return (A.S().f3 || {})[k]; }

  // ── 박사들의 천막 ──
  // 1 별 재는 기구: 일지의 세 밤에서 규칙을 찾아 「열아홉째 밤」의 방향·높이
  var DIRS = ['동', '동남', '남', '남서', '서', '북서', '북', '북동'], ALTS = []; for (var a = 0; a <= 90; a += 5) ALTS.push(a + '');
  BN.PZ.astro = function (R, A) {
    if (has(A, 'astro')) return A.talk([['asaph', 0, '기구는 이미 오늘 밤에 맞춰 두었다.']]);
    var w = A.el('div', 'astro-pz');
    w.appendChild(A.el('p', 'tiny-note', '놋쇠 원판 두 개 — 바깥 고리는 방향, 안쪽 바늘은 높이. 오늘 밤에 맞춰야 한다.'));
    w.appendChild(wheels(A, [{ label: '방향', vals: DIRS }, { label: '높이(도)', vals: ALTS }], function (v) {
      if (A.locked('astro')) return;
      if (v[0] === '남서' && v[1] === '55') { A.sfx('ok'); A.toast('바늘이 별에 딱 걸렸다'); if (!flag(R, A, 'astro', ['astro', 'light'])) { A.closeModal(); A.talk([['asaph', 0, '기구가 맞았다. 이제 등잔 빛을 별 지도에 비추면 되겠구나.']]); } }
      else A.wrong('astro', '바늘 끝에 별이 없다');
    }, '바늘 고정', [0, 2]));
    A.modal('별 재는 기구', w);
  };
  BN.PZ.journal = function (R, A) {
    var S = A.S(); S.f3 = S.f3 || {}; if (!S.f3.journal) { S.f3.journal = 1; S.notes.push({ text: '박사들의 별 일지 — 첫째 밤: 동, 높이 10 / 일곱째 밤: 동남, 높이 25 / 열셋째 밤: 남, 높이 40', ref: '' }); A.save(); }
    var w = A.el('div', 'journal');
    w.innerHTML = '<div class="jr-page"><p><b>첫째 밤</b> — 동 · 높이 10</p><p><b>일곱째 밤</b> — 동남 · 높이 25</p><p><b>열셋째 밤</b> — 남 · 높이 40</p><p class="jr-torn">(그다음 쪽은 비어 있다)</p></div><p class="tiny-note">수첩에 옮겨 적었다.</p>';
    A.modal('가죽 일지', w);
  };
  // 2 낙타 짐: 양쪽 무게 같게 · 같은 예물 두 상자는 한쪽에 두지 않음 · 물주머니는 왼쪽 고리
  var LOAD = [['황금', 9, 'g'], ['황금', 15, 'g'], ['유향', 3, 'f'], ['유향', 5, 'f'], ['몰약', 4, 'm'], ['몰약', 8, 'm'], ['대추야자', 5, 'd']];
  BN.PZ.camel = function (R, A) {
    if (has(A, 'camel')) return A.talk([['asaph', 0, '짐은 이미 꾸렸다. 낙타가 졸고 있구나.']]);
    var side = LOAD.map(function () { return 0; }), w = A.el('div', 'camel-pz');
    function draw() {
      w.innerHTML = '<div class="camel-rule"><b>낙타 짐꾼의 규칙</b> (천막 기둥의 판)<br>① 양쪽 짐 무게가 같아야 낙타가 걷는다<br>② 같은 예물 두 상자는 한쪽에 두지 않는다<br>③ 물주머니(7)는 왼쪽 고리에만 건다</div>';
      var cols = A.el('div', 'camel-cols');
      [['왼쪽', 1], ['바닥', 0], ['오른쪽', 2]].forEach(function (c) {
        var col = A.el('div', 'camel-col'); col.appendChild(A.el('div', 'wl-lbl', c[0]));
        if (c[1] === 1) col.appendChild(A.el('div', 'box fixed', '물주머니<b>7</b>'));
        LOAD.forEach(function (it, i) { if (side[i] !== c[1]) return; var b = A.el('button', 'box b-' + it[2], it[0] + '<b>' + it[1] + '</b>'); b.dataset.i = i; b.onclick = function () { side[i] = (side[i] + 1) % 3; A.tick(); draw(); }; col.appendChild(b); });
        cols.appendChild(col);
      });
      w.appendChild(cols);
      w.appendChild(A.el('p', 'tiny-note', '상자를 누르면 바닥 → 왼쪽 → 오른쪽으로 옮겨져요'));
      var go = A.el('button', 'btn gold', '낙타에 싣기'); w.appendChild(go);
      go.onclick = function () {
        if (A.locked('camel')) return;
        if (side.indexOf(0) >= 0) return A.toast('바닥에 남은 짐이 있어요');
        var L = 7, Rt = 0; LOAD.forEach(function (it, i) { if (side[i] === 1) L += it[1]; else Rt += it[1]; });
        var dup = ['g', 'f', 'm'].some(function (k) { var s = LOAD.map(function (it, i) { return it[2] === k ? side[i] : -1; }).filter(function (x) { return x > 0; }); return s[0] === s[1]; });
        if (L !== Rt) A.wrong('camel', '낙타가 ' + (L > Rt ? '왼쪽' : '오른쪽') + '으로 기우뚱 — 일어나지 않는다');
        else if (dup) A.wrong('camel', '무게는 맞지만, 같은 예물 두 상자가 한쪽에 있다');
        else { A.sfx('ok'); A.toast('낙타가 일어섰다'); if (!flag(R, A, 'camel', ['astro', 'light'])) { A.closeModal(); A.talk([['asaph', 0, '짐은 되었다. 기구도 오늘 밤에 맞춰야지.']]); } }
      };
    }
    draw(); A.modal('낙타 짐', w);
  };

  // ── 서고 ──
  var CONS = 'ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ', CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ', JONG = ' ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ';
  function swap(c) { var i = CONS.indexOf(c); return i < 0 ? c : CONS[13 - i]; }
  function atbash(s) {
    return s.replace(/[가-힣]/g, function (ch) {
      var n = ch.charCodeAt(0) - 0xAC00, cho = Math.floor(n / 588), jung = Math.floor(n % 588 / 28), jong = n % 28;
      var c2 = CHO.indexOf(swap(CHO[cho])), j2 = jong ? JONG.indexOf(swap(JONG[jong])) : 0;
      return String.fromCharCode(0xAC00 + c2 * 588 + jung * 28 + j2);
    });
  }
  BN.CIPHER3 = atbash('위에서 셋 왼편에서 다섯');
  BN.PZ.lectern = function (R, A) {
    var S = A.S(); S.f3 = S.f3 || {}; if (!S.f3.cipher) { S.f3.cipher = 1; S.notes.push({ text: '서고 독서대의 글: 「' + BN.CIPHER3 + '」', ref: '' }); A.save(); }
    var w = A.el('div', 'cipher-txt'); w.innerHTML = '<p class="cp">' + BN.CIPHER3 + '</p><p class="tiny-note">읽을 수 없는 말이다. 수첩에 옮겨 적었다.</p>';
    A.modal('독서대의 두루마리', w);
  };
  // 3 작은 글씨: 수정 조각을 끌어 대면 그 자리만 크게
  BN.PZ.tiny = function (R, A) {
    var S = A.S(), txt = '세삭은 바벨론이라 — 예레미야 25:26과 51:41을 견주어 보라.<br>옛 서기관은 글자의 맨 앞과 맨 뒤를 바꾸어 적었다.<br>이 서고의 원판도 그러하다. 모음은 그대로 두고 자음만 바꾼다.<br>자음 ㄱ의 짝은 ㅎ이다.';
    var w = A.el('div', 'tiny-pz'), base = A.el('div', 'tiny-txt', txt); w.appendChild(base);
    if (S.items.indexOf('lens') < 0) { w.appendChild(A.el('p', 'tiny-note', '글씨가 너무 작다. 맑은 돌 같은 것이 있으면…')); return A.modal('두루마리 꼬리표', w); }
    var lens = A.el('div', 'lens'), inner = A.el('div', 'tiny-txt big', txt); lens.appendChild(inner); w.appendChild(lens);
    w.appendChild(A.el('p', 'tiny-note', '💎 수정 조각을 글씨 위로 끌어 보세요'));
    function move(e) {
      var r = base.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, Z = 3.2;
      lens.style.left = (x - 60 + base.offsetLeft) + 'px'; lens.style.top = (y - 60 + base.offsetTop) + 'px'; lens.style.display = 'block';
      inner.style.width = r.width + 'px'; inner.style.transform = 'translate(' + (60 - x * Z) + 'px,' + (60 - y * Z) + 'px) scale(' + Z + ')';
      if (!S.f3 || !S.f3.tiny) { S.f3 = S.f3 || {}; S.f3.tiny = 1; A.save(); }
    }
    base.addEventListener('pointerdown', function (e) { base.setPointerCapture(e.pointerId); move(e); });
    base.addEventListener('pointermove', function (e) { if (e.buttons || e.pointerType === 'mouse') move(e); });
    A.modal('두루마리 꼬리표', w);
  };
  // 4 자음 원판: 안쪽 고리(거꾸로 새김)를 돌려 짝을 맞춘다 — 읽는 것은 사람 몫
  BN.PZ.disc = function (R, A) {
    var S = A.S(); S.f3 = S.f3 || {}; var off = S.f3.disc || 4, w = A.el('div', 'disc-pz');
    function draw() {
      var N = 14, svg = '<svg viewBox="-110 -110 220 220" class="disc-svg"><circle r="104" class="d-out"/><circle r="70" class="d-in"/>';
      for (var i = 0; i < N; i++) {
        var a = (i / N) * Math.PI * 2 - Math.PI / 2, x1 = Math.cos(a) * 88, y1 = Math.sin(a) * 88, x2 = Math.cos(a) * 54, y2 = Math.sin(a) * 54;
        svg += '<text x="' + x1.toFixed(1) + '" y="' + (y1 + 6).toFixed(1) + '" class="d-t">' + CONS[i] + '</text><text x="' + x2.toFixed(1) + '" y="' + (y2 + 6).toFixed(1) + '" class="d-t in">' + CONS[(off - i + 28) % 14] + '</text>';
      }
      w.innerHTML = svg + '<circle r="6" class="d-pin"/></svg>';
      var row = A.el('div', 'disc-btns'), l = A.el('button', 'btn ghost', '◀ 돌리기'), r = A.el('button', 'btn ghost', '돌리기 ▶');
      l.onclick = function () { off = (off + 13) % 14; S.f3.disc = off; A.tick(); draw(); }; r.onclick = function () { off = (off + 1) % 14; S.f3.disc = off; A.tick(); draw(); };
      row.appendChild(l); row.appendChild(r); w.appendChild(row);
      w.appendChild(A.el('p', 'tiny-note', '바깥 고리와 안쪽 고리가 마주 보는 글자가 서로 짝이다.'));
    }
    draw(); A.modal('자음 원판', w);
  };
  // 5 서가: 위에서 셋째 줄, 왼편에서 다섯째 두루마리 → 미 5:2
  BN.PZ.shelf = function (R, A) {
    var w = A.el('div', 'shelf-pz'), g = A.el('div', 'shelf-grid');
    for (var r = 1; r <= 4; r++) for (var c = 1; c <= 6; c++) (function (r, c) {
      var b = A.el('button', 'scroll-b', '📜'); b.dataset.rc = r + '-' + c;
      b.onclick = function () {
        if (A.locked('shelf')) return;
        if (r === 3 && c === 5) {
          A.sfx('ok'); A.closeModal();
          A.talk([['narr', 0, '두루마리를 펴자 선지자의 글이 나온다.'], ['asaph', 0, '베들레헴 에브라다야 너는 유다 족속 중에 작을지라도 이스라엘을 다스릴 자가 네게서 내게로 나올 것이라 그의 근본은 상고에, 영원에 있느니라', '', '미가 5:2']], function () { A.solve(R); });
        } else A.wrong('shelf', ['족보 두루마리다', '곡식 장부다', '빈 두루마리다', '시편 사본이다'][(r + c) % 4]);
      };
      g.appendChild(b);
    })(r, c);
    w.appendChild(g); w.appendChild(A.el('p', 'tiny-note', '두루마리 스물네 개. 아무거나 꺼내면 서기관이 눈을 흘긴다.'));
    A.modal('서가', w);
  };

  // ── 회의실: 시종 넷, 거짓말은 한 사람 ──
  var DOORS = ['동문', '서문', '남문', '북문'], SERV = ['등잔 든 시종', '문지기 시종', '향 피우는 시종', '물 긷는 시종'];
  BN.PZ.liar = function (R, A) {
    var w = A.el('div', 'liar-pz');
    w.innerHTML = '<p class="tiny-note">왕은 박사들을 「가만히」 부르려 한다(마 2:7). 박사들을 어느 문으로 들일지 시종들에게 물었다. 그런데 넷 중 <b>한 사람만</b> 거짓말을 한다.</p>' +
      '<div class="say"><b>등잔 든 시종</b> 「동문으로는 들이지 않소.」</div>' +
      '<div class="say"><b>문지기 시종</b> 「서문이오.」</div>' +
      '<div class="say"><b>향 피우는 시종</b> 「문지기 시종의 말은 거짓이오.」</div>' +
      '<div class="say"><b>물 긷는 시종</b> 「남문도 북문도 아니오.」</div>';
    w.appendChild(wheels(A, [{ label: '들일 문', vals: DOORS }, { label: '거짓말한 사람', vals: SERV }], function (v) {
      if (A.locked('liar')) return;
      if (v[0] === '서문' && v[1] === '향 피우는 시종') { A.closeModal(); A.solve(R); }
      else A.wrong('liar', '시종들이 서로 얼굴을 본다 — 말이 맞지 않는다');
    }, '정하기'));
    A.modal('회의실 · 시종들의 말', w);
  };

  // ── 접견실 ──
  BN.PZ.note3 = function (R, A) {
    var S = A.S(); S.f3 = S.f3 || {};
    if (!S.f3.note) { S.f3.note = 1; A.save(); A.sfx('ok'); }
    var w = A.el('div', 'mirror-pz'); w.appendChild(A.el('div', 'mir-txt', '진짜 편지는 끈이 두 번 감겼다.<br>가짜 둘은 한 번뿐이다.<br>봉인은 왕의 반지로 다시 찍어라.'));
    w.appendChild(A.el('p', 'tiny-note', '방석 밑에 접힌 쪽지. 글자가 모두 뒤집혀 있다.'));
    A.modal('접힌 쪽지', w);
  };
  BN.PZ.mirror = function (R, A) {
    var S = A.S(); if (!(S.f3 || {}).note) return A.talk([['narr', 0, '청동 거울에 등잔 불빛이 어른거린다.']]);
    S.f3.mirror = 1; A.save();
    var w = A.el('div', 'mirror-pz'); w.appendChild(A.el('div', 'mir-txt flip', '진짜 편지는 끈이 두 번 감겼다.<br>가짜 둘은 한 번뿐이다.<br>봉인은 왕의 반지로 다시 찍어라.'));
    w.appendChild(A.el('p', 'tiny-note', '쪽지를 거울에 비추었다.'));
    A.modal('청동 거울', w);
  };
  // 넌센스 → 밀랍
  BN.PZ.riddle3 = function (R, A) {
    var S = A.S(); if ((S.f3 || {}).wax) return A.talk([['gilead', 1, '밀랍은 드렸잖아요. 촛농 묻은 손은 안 씻을래요.', '(기념)']]);
    var w = A.el('div', 'riddle'), inp = A.el('input', 'riddle-in'); inp.placeholder = '답을 적어요'; inp.maxLength = 12;
    w.appendChild(A.el('p', 'riddle-q', '「왕이 넘어지면 뭐게요?<br>(쉿, 여기서 크게 말하면 큰일 나요)」'));
    w.appendChild(A.el('p', 'tiny-note', '왕을 다른 나라 말로 하면…'));
    w.appendChild(inp); var go = A.el('button', 'btn gold', '속삭이기'); w.appendChild(go);
    go.onclick = function () {
      if (A.locked('riddle3')) return; var v = inp.value.replace(/\s/g, '');
      if (/^킹콩$/.test(v)) { S.f3 = S.f3 || {}; S.f3.wax = 1; if (S.items.indexOf('wax') < 0) S.items.push('wax'); A.save(); A.closeModal(); A.sfx('ok'); A.talk([['gilead', 1, '킹… 콩! 쿵! 히히. 상으로 이거 드릴게요. 촛대에서 긁어 모은 밀랍이에요.', '(「밀랍」을 받았다)']]); }
      else A.wrong('riddle3', '길르앗: 「땡! 왕은 영어로…」');
    };
    A.modal('길르앗의 수수께끼', w);
  };
  // 편지 셋 → 진짜 편지(마 2:8) → 반지 고르기(찍히면 좌우가 뒤집힘) → 함정
  BN.PZ.letters = function (R, A) {
    var S = A.S(); S.f3 = S.f3 || {};
    if (!S.f3.mirror) return A.talk([['narr', 0, '봉인된 편지 세 통. 겉으로는 똑같아 보인다.']]);
    var w = A.el('div', 'letters-pz'), row = A.el('div', 'let-row');
    [1, 2, 1].forEach(function (n, i) {
      var b = A.el('button', 'letter', '<span class="wax"></span>' + '<span class="cord"></span>'.repeat(n)); b.dataset.i = i;
      b.onclick = function () { if (A.locked('letters')) return; if (n === 2) sealStep(); else A.wrong('letters', '열어 보니 빈 종이 — 가짜 편지다'); };
      row.appendChild(b);
    });
    w.appendChild(row); w.appendChild(A.el('p', 'tiny-note', '편지 세 통'));
    A.modal('봉인된 편지', w);
    function sealStep() {
      if (!S.f3.wax) return A.talk([['asaph', 0, '봉인을 떼면 다시 찍을 밀랍이 있어야 한다. 밀랍부터 구해 오너라.']]);
      var m = A.el('div', 'seal-pz');
      m.innerHTML = '<div class="letter-open">「가서 아기에 대하여 자세히 알아보고 찾거든 내게 고하여 나도 가서 그에게 경배하게 하라」<br><small>마태복음 2:8</small></div><p class="tiny-note">떼어 낸 봉인 자국(왼쪽)과 같은 자국이 찍힐 반지를 고르세요.</p>';
      var ref = A.el('div', 'seal-row'); ref.appendChild(A.el('div', 'imp', '<span>ㅋ</span>')); m.appendChild(ref);
      var rings = [['', 0], ['fx', 1], ['r180', 0], ['fy', 0], ['fx t', 0], ['fx g', 0]], rr = A.el('div', 'seal-row');
      rings.forEach(function (o, i) {
        var g = o[0].indexOf('t') >= 0 ? 'ㅌ' : o[0].indexOf('g') >= 0 ? 'ㄱ' : 'ㅋ';
        var b = A.el('button', 'ring-b', '<span class="' + o[0].replace(/ [tg]/, '') + '">' + g + '</span>'); b.dataset.i = i;
        b.onclick = function () {
          if (A.locked('seal')) return;
          if (o[1]) { A.sfx('ok'); trap(); }
          else if (i === 0) A.wrong('seal', '찍어 보니 자국이 좌우로 뒤집혀 나온다');
          else A.wrong('seal', '자국이 다르다');
        };
        rr.appendChild(b);
      });
      m.appendChild(rr); A.modal('다시 봉인하기', m);
    }
    function trap() {
      var t = A.el('div', 'trap-pz');
      t.innerHTML = '<p class="tiny-note">봉인이 감쪽같다. 시종이 문 앞에서 기다린다. 「다 되었으면 왕께 보고하시오.」</p>';
      var big = A.el('button', 'btn gold block trap-big', '👑 왕께 보고하기'), small = A.el('button', 'trap-small', '…다른 길로');
      big.onclick = function () {
        A.sfx('trap'); A.S().hintMin += 3; A.save(); A.closeModal();
        A.talk([['narr', 0, '그들은 꿈에 헤롯에게로 돌아가지 말라 지시하심을 받아 다른 길로 고국에 돌아가니라', '', '마태복음 2:12'], ['asaph', 0, '…아직 늦지 않았다. 함정에 빠졌으니 3분이 더해졌다.']], function () { trap(); });
      };
      small.onclick = function () { A.closeModal(); A.solve(R); };
      t.appendChild(big); t.appendChild(small); A.modal('보고', t);
    }
  };

  // ── 지붕: 박사의 별 지도(동쪽이 위)를 남쪽 하늘(동쪽이 왼쪽)에서 찾아 잇기 ──
  var CHART = [[50, 10], [50, 35], [50, 60], [50, 85], [32, 22], [68, 22], [64, 74]], EDGES = [[0, 1], [1, 2], [2, 3], [0, 4], [0, 5], [2, 6]];
  function toSky(p) { return [p[1], 100 - p[0]]; }   // 지도의 위(동) → 하늘의 왼쪽
  var DECOY = [[14, 18], [30, 8], [78, 12], [88, 30], [22, 88], [40, 92], [80, 86], [92, 62], [66, 22], [8, 80], [93, 34]];
  BN.PZ.chart = function (R, A) {
    var S = A.S(); S.f3 = S.f3 || {}; if (!S.f3.chart) { S.f3.chart = 1; A.save(); }
    A.modal('박사의 별 지도', chartBox(A));
  };
  function chartBox(A) {
    var svg = '<svg viewBox="-8 -14 116 122" class="chart-svg"><text x="50" y="-4" class="c-n">동 ↑</text>';
    EDGES.forEach(function (e) { var a = CHART[e[0]], b = CHART[e[1]]; svg += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '"/>'; });
    CHART.forEach(function (p) { svg += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3"/>'; });
    var w = A.el('div', 'chart-wrap'); w.innerHTML = svg + '</svg><p class="tiny-note">「그의 별」을 찾는 지도 — 박사들은 해 뜨는 쪽(동)을 위로 그렸다.</p>'; return w;
  }
  BN.PZ.stars3 = function (R, A) {
    var S = A.S(), pts = CHART.map(toSky).concat(DECOY), lines = {}, sel = -1, w = A.el('div', 'sky-pz');
    function key(a, b) { return a < b ? a + '-' + b : b + '-' + a; }
    function draw() {
      var svg = '<svg viewBox="0 0 100 100" class="sky-svg"><text x="3" y="97" class="c-n">동 ←</text><text x="97" y="97" class="c-n" text-anchor="end">→ 서</text>';
      Object.keys(lines).forEach(function (k) { var ab = k.split('-'), a = pts[+ab[0]], b = pts[+ab[1]]; svg += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '"/>'; });
      pts.forEach(function (p, i) { svg += '<circle data-i="' + i + '" cx="' + p[0] + '" cy="' + p[1] + '" r="' + (i === sel ? 3.6 : 2.4) + '" class="st' + (i === sel ? ' sel' : '') + '"/>'; });
      w.innerHTML = svg + '</svg>';
      w.querySelectorAll('circle.st').forEach(function (c) { c.onclick = function () { var i = +c.dataset.i; if (sel < 0) sel = i; else if (sel === i) sel = -1; else { var k = key(sel, i); if (lines[k]) delete lines[k]; else lines[k] = 1; sel = -1; } A.tick(); draw(); }; });
      var row = A.el('div', 'disc-btns'), clr = A.el('button', 'btn ghost', '모두 지우기'), go = A.el('button', 'btn gold', '이 별자리로');
      clr.onclick = function () { lines = {}; sel = -1; draw(); };
      go.onclick = function () {
        if (A.locked('stars3')) return;
        var want = EDGES.map(function (e) { return key(e[0], e[1]); }).sort().join(), got = Object.keys(lines).sort().join();
        if (got === want) { A.closeModal(); A.solve(R); } else A.wrong('stars3', '별들이 아무 모양도 이루지 않는다');
      };
      row.appendChild(clr); row.appendChild(go); w.appendChild(row);
      w.appendChild(A.el('p', 'tiny-note', '별 둘을 차례로 누르면 선이 이어져요(다시 누르면 지워져요). 지붕에서는 남쪽 하늘을 본다.'));
      if ((S.f3 || {}).chart) { var cb = A.el('button', 'btn ghost', '베껴 둔 별 지도 보기'); cb.onclick = function () { var bk = A.el('div'); bk.appendChild(chartBox(A)); var back = A.el('button', 'btn gold', '하늘로 돌아가기'); back.onclick = function () { A.modal('지붕 위 하늘', w); }; bk.appendChild(back); A.modal('베껴 둔 별 지도', bk); }; w.appendChild(cb); }
    }
    draw(); A.modal('지붕 위 하늘', w);
  };
})(window.BN);
