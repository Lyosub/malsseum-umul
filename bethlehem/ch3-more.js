// 「베들레헴의 밤」 3장 v2 (2026-11-28): 새 유형 넷 — 1장 견본과 같은 방식(먼저 풀어야 할 것으로 잇기)
//  천막: 예물 상자 자리 기억(기억 배치) → 별 재는 기구
//  서고: 칙령 글자판(숨은 낱말, 남은 글자 = 마 2:7) → 서가
//  회의실: 바닥 무늬 돌 돌리기(무늬 회전) → 반지 함 열쇠
//  접견실: 밀랍 색 섞기(길르앗의 밀랍) · 반지 함 열쇠 → 편지
(function (BN) {
  var R = BN.ROOMS, LOCAL = /^(127\.0\.0\.1|localhost)$/.test(location.hostname);
  function rnd(S, n) { var s = (S.created % 9973) + 7 * n + 1; return function () { s = (s * 16807) % 2147483647; return s / 2147483647; }; }
  function mix(r, a) { a = a.slice(); for (var q = a.length - 1; q > 0; q--) { var t = Math.floor(r() * (q + 1)), x = a[q]; a[q] = a[t]; a[t] = x; } return a; }
  function why(t, a, b) { if (BN.WHY) BN.WHY[t] = a; if (BN.THINK) BN.THINK[t] = b; }
  function g3(S) { S.f3x = S.f3x || {}; return S.f3x; }
  function gate(name, key, say) { var o = BN.PZ[name]; BN.PZ[name] = function (Rm, A) { if (!g3(A.S())[key]) return A.talk(say); return o(Rm, A); }; }

  // ════ 천막 · 예물 상자 자리 기억
  var GIFT = ['🪙', '🏺', '🌿', '📦', '🔔'];
  R.magi.spots.push({ id: 'gifts3', x: 43, y: 46, w: 22, h: 12, act: 'puzzle:memory', label: '🎁 예물 상자', extra: 1 });
  BN.PZ.memory = function (Rm, A) {
    var S = A.S(), F = g3(S), r = rnd(S, 301), cells = mix(r, [0, 1, 2, 3, 4, 5, 6, 7, 8]).slice(0, 5), put = {}, pick = null, phase = 'look', w = A.el('div', 'gen-wrap');
    if (F.memory) return A.toast('✔ 예물은 이미 제자리에 놓았어요');
    function draw() {
      var at = {}; if (phase === 'look') cells.forEach(function (c, i) { at[c] = GIFT[i]; }); else Object.keys(put).forEach(function (c) { at[c] = GIFT[put[c]]; });
      w.innerHTML = '<p class="gen-help" style="text-align:center">' + (phase === 'look' ? '박사들이 예물을 놓아 둔 자리 — <b>잘 봐 두세요</b>' : '시종이 예물을 흐트러뜨렸다. <b>아래 예물을 고르고, 있던 칸을 누르세요</b>') + '</p>' +
        '<div class="mm-grid">' + [0, 1, 2, 3, 4, 5, 6, 7, 8].map(function (c) { return '<button class="mm-c" data-c="' + c + '">' + (at[c] || '') + '</button>'; }).join('') + '</div>' +
        (phase === 'put' ? '<div class="mm-pick">' + GIFT.map(function (g, i) { var used = Object.keys(put).some(function (c) { return put[c] === i; }); return '<button class="btn ' + (pick === i ? 'gold' : 'ghost') + '" data-g="' + i + '"' + (used ? ' disabled' : '') + '>' + g + '</button>'; }).join('') + '</div><div class="bag-act"><button class="btn ghost" id="mmClr">다시 놓기</button><button class="btn gold" id="mmOk">이렇게 놓았어요</button></div>' : '');
      if (phase !== 'put') return;
      w.querySelectorAll('[data-g]').forEach(function (b) { b.onclick = function () { pick = +b.dataset.g; draw(); }; });
      w.querySelectorAll('.mm-c').forEach(function (b) { b.onclick = function () { var c = +b.dataset.c; if (put[c] !== undefined) { delete put[c]; return draw(); } if (pick === null) return; put[c] = pick; pick = null; draw(); }; });
      w.querySelector('#mmClr').onclick = function () { put = {}; pick = null; draw(); };
      w.querySelector('#mmOk').onclick = function () {
        if (A.locked('magi')) return;
        var ok = cells.every(function (c, i) { return put[c] === i; });
        if (!ok) { A.wrong('magi', '박사가 고개를 젓는다 — 다시 보여 줄게요'); put = {}; phase = 'look'; draw(); return setTimeout(function () { if (w.isConnected) { phase = 'put'; draw(); } }, 3500); }
        F.memory = 1; S.notes.push({ text: '천막: 흐트러진 예물 다섯을 본래 자리에 다시 놓았다.', ref: '' }); A.save(); A.sfx('ok'); A.closeModal();
        A.talk([['gilead', 2, '다 맞았어요! 박사님이 별 재는 기구를 내어 주시는 것 같아요.', '(기구 덮개가 벗겨졌다)']]);
      };
    }
    draw(); A.modal('흐트러진 예물', w);
    setTimeout(function () { if (w.isConnected) { phase = 'put'; draw(); } }, 4000);
    if (LOCAL) BN.__memory = function () { cells.forEach(function (c, i) { put[c] = i; }); phase = 'put'; draw(); };
  };
  why('흐트러진 예물', '박사들의 예물 상자 다섯이 천 위에 놓여 있다. 시종이 정리한다며 곧 흐트러뜨릴 기세다.', '어디에 뭐가 있었는지 잘 봐 둬야겠다. 줄과 칸으로 외우면 쉬울까?');
  gate('astro', 'memory', [['gilead', 1, '별 재는 기구에 덮개가 씌워져 있어요. 박사님이 예물부터 정리해 달라는 눈치예요.', '(🎁 예물 상자)']]);

  // ════ 서고 · 칙령 글자판(남은 글자 = 마 2:7 「가만히 불러」)
  var EG = '렘가헴레들베살그리스도만루사대유방동예박경관기서히불배헤롯러', EW = { '헤롯': [27, 28], '박사': [13, 19], '동방': [16, 17], '예루살렘': [0, 6, 12, 18], '경배': [20, 26], '서기관': [21, 22, 23], '베들레헴': [2, 3, 4, 5], '유대': [14, 15], '그리스도': [7, 8, 9, 10] };
  R.archive.spots.push({ id: 'edict', x: 26, y: 40, w: 14, h: 18, act: 'puzzle:edict', label: '📜 칙령 초안', extra: 1 });
  BN.PZ.edict = function (Rm, A) {
    var S = A.S(), F = g3(S), found = F.efound || {}, sel = null, w = A.el('div', 'gen-wrap');
    if (F.edict) return A.toast('✔ 칙령 초안은 이미 읽었어요');
    function draw() {
      var hit = {}; Object.keys(found).forEach(function (k) { EW[k].forEach(function (i) { hit[i] = 1; }); });
      w.innerHTML = '<div class="wd-list">' + Object.keys(EW).map(function (k) { return '<span class="' + (found[k] ? 'on' : '') + '">' + k + '</span>'; }).join('') + '</div>' +
        '<div class="wd-grid">' + EG.split('').map(function (c, i) { return '<button class="wd-c' + (hit[i] ? ' hit' : '') + (sel === i ? ' sel' : '') + '" data-i="' + i + '">' + c + '</button>'; }).join('') + '</div>' +
        '<p class="gen-help" style="text-align:center">목록 낱말의 <b>첫 글자</b>와 <b>끝 글자</b>를 차례로 눌러 지워요(가로·세로, 거꾸로도). 남은 글자가 헤롯이 숨긴 말.</p>' +
        '<div class="rm-ans"><input id="edIn" maxlength="10" placeholder="남은 글자를 이어 적기" autocomplete="off" spellcheck="false"><button class="btn gold" id="edOk">적기</button></div>';
      w.querySelectorAll('.wd-c').forEach(function (b) { b.onclick = function () { var i = +b.dataset.i; if (sel === null) { sel = i; return draw(); } var a = sel, z = i; sel = null; Object.keys(EW).forEach(function (k) { var c = EW[k]; if ((c[0] === a && c[c.length - 1] === z) || (c[0] === z && c[c.length - 1] === a)) { found[k] = 1; F.efound = found; A.save(); A.sfx('ok'); } }); draw(); }; });
      w.querySelector('#edOk').onclick = function () {
        if (A.locked('archive')) return;
        if ((w.querySelector('#edIn').value || '').replace(/\s/g, '') !== '가만히불러') return A.wrong('archive', '말이 되지 않는다 — 낱말을 다 지웠는지 보자');
        F.edict = 1; S.notes.push({ text: '서고 칙령 초안: 낱말을 지우고 남은 글자 「가만히 불러」 — 「이에 헤롯이 가만히 박사들을 불러」(마 2:7).', ref: '마태복음 2:7' }); A.save(); A.sfx('ok'); A.closeModal();
        A.talk([['narr', null, '이에 헤롯이 가만히 박사들을 불러 별이 나타난 때를 자세히 묻고', '', '마태복음 2:7'], ['asaph', 0, '「가만히」라… 왕이 무언가 숨기고 있구나. 서가를 마저 살펴보자.']]);
      };
    }
    draw(); A.modal('칙령 초안', w);
  };
  why('칙령 초안', '서기관 책상 위에 헤롯의 칙령 초안이 놓여 있다. 낱말 사이에 다른 말이 숨어 있다.', '목록 낱말을 다 지우면 남는 글자가 있겠지. 헤롯이 숨기려던 게 그거 아닐까?');
  gate('shelf', 'edict', [['gilead', 1, '서가가 높아서… 그 전에 책상 위 칙령 초안이 자꾸 눈에 걸려요.', '(📜 칙령 초안)']]);
  // 11/28 블라인드 풀이: 꼬리표 작은 글씨(읽는 법)를 안 읽어도 서가가 풀려 문제 하나가 그냥 지나갔다 → 서가 전에 꼭 읽게
  (function () { var o = BN.PZ.shelf; BN.PZ.shelf = function (Rm, A) { var S = A.S(); if (!(S.f3 && S.f3.tiny)) return A.talk([['asaph', 0, '어느 두루마리를 꺼내야 하는지는 독서대의 이상한 글에 있을 게다. 그 글을 읽는 법부터 찾아라.'], ['gilead', 2, '(소곤) 왼쪽 아래 바구니 두루마리에 꼬리표가 달려 있었어요. 글씨가 엄청 작던데…', '(💎 수정 조각)']]); return o(Rm, A); }; })();

  // ════ 회의실 · 바닥 무늬 돌 돌리기 → 반지 함 열쇠
  R.council.spots.forEach(function (sp) { if (sp.id === 'mosaic') { sp.act = 'puzzle:mosaic'; sp.label = '◈ 바닥 무늬'; sp.extra = 1; } });
  // 3×3 돌, 돌마다 선 조각(4변 중 열린 곳). 다 맞으면 가운데에서 여덟 갈래 별이 이어진다
  var MT = [[1, 2], [3, 1, 2], [3, 2], [0, 1, 2], [0, 1, 2, 3], [0, 3, 2], [0, 1], [0, 3, 1], [0, 3]];   // 정답 방향(0위 1오른 2아래 3왼)
  BN.PZ.mosaic = function (Rm, A) {
    var S = A.S(), F = g3(S), r = rnd(S, 311), rot = MT.map(function (_, i) { return i === 4 ? 0 : 1 + Math.floor(r() * 3); }), w = A.el('div', 'gen-wrap');
    if (F.mosaic) return A.toast('✔ 바닥 무늬는 이미 맞췄어요 — 반지 함 열쇠는 가방에');
    function opens(i) { return MT[i].map(function (d) { return (d + rot[i]) % 4; }); }
    function draw() {
      var P = { 0: '50,50 50,0', 1: '50,50 100,50', 2: '50,50 50,100', 3: '50,50 0,50' };
      w.innerHTML = '<div class="pt-grid ms3">' + MT.map(function (_, i) { return '<button class="pt-t' + (rot.every(function (x) { return x === 0; }) ? ' lit' : '') + '" data-i="' + i + '"><svg viewBox="0 0 100 100">' + opens(i).map(function (d) { return '<polyline points="' + P[d] + '"/>'; }).join('') + '</svg></button>'; }).join('') + '</div><p class="gen-help" style="text-align:center">돌을 누르면 오른쪽으로 돌아요. <b>모든 홈이 끊김 없이 이어지게</b> — 바깥으로 새는 홈이 없어야 해요.</p>';
      w.querySelectorAll('.pt-t').forEach(function (b) { b.onclick = function () { var i = +b.dataset.i; if (i === 4) return; rot[i] = (rot[i] + 1) % 4; draw(); if (rot.every(function (x) { return x === 0; })) { F.mosaic = 1; S.items.indexOf('ringkey') < 0 && S.items.push('ringkey'); S.notes.push({ text: '회의실 바닥 무늬를 맞추자 가운데 돌이 들리고 작은 열쇠가 나왔다(왕의 반지 함 열쇠).', ref: '' }); A.save(); A.sfx('ok'); setTimeout(function () { A.closeModal(); A.talk([['narr', null, '홈이 모두 이어지는 순간, 가운데 돌이 살짝 들린다. 그 밑에 작은 열쇠 하나.'], ['gilead', 2, '반지 함 열쇠 같아요! 접견실에 반지 함이 있었죠?']]); }, 700); } }; });
    }
    draw(); A.modal('바닥 무늬', w);
    if (LOCAL) BN.__mosaic = function () { rot = rot.map(function () { return 0; }); rot[0] = 3; draw(); w.querySelectorAll('.pt-t')[0].click(); };
  };
  // 정답 판정: 모든 돌의 rot가 0일 때만 홈이 다 이어지게(무늬가 대칭이 아니라 다른 답이 없도록 위 MT를 골랐다)
  why('바닥 무늬', '회의실 바닥 가운데 돌 아홉에 홈이 파여 있다. 몇 개가 어긋나 있다.', '홈이 다 이어지면 무슨 모양이 될까? 가장자리 돌은 바깥으로 홈이 나가면 안 되겠지.');
  BN.ITEMS.ringkey = ['반지 함 열쇠', 'img/items/keys.webp', '회의실 바닥 돌 밑에서 나온 작은 열쇠. 왕의 반지 함에 맞을 것 같다.'];

  // ════ 접견실 · 밀랍 색 섞기 → 편지
  R.hall.spots.push({ id: 'waxpot', x: 52, y: 70, w: 10, h: 10, act: 'puzzle:waxmix', label: '🕯 밀랍 그릇', extra: 1, accept: { wax: { pz: 'waxmix' } } });
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }
  function norm(c) { var g = c.reduce(function (x, y) { return gcd(x, y); }, 0) || 1; return c.map(function (x) { return x / g; }); }
  function waxTgt(S) { var r = rnd(S, 321); return norm([1 + Math.floor(r() * 3), Math.floor(r() * 3), 1 + Math.floor(r() * 3)]); }
  BN.PZ.waxmix = function (Rm, A) {
    var S = A.S(), F = g3(S), tgt = waxTgt(S), v = [0, 0, 0], w = A.el('div', 'gen-wrap');
    if (F.waxmix) return A.toast('✔ 밀랍 색은 이미 맞췄어요');
    if (S.items.indexOf('wax') < 0) return A.talk([['gilead', 1, '봉인을 다시 찍으려면 밀랍이 있어야 해요. 아까 제가 촛대에서 긁어 모은 게 있었는데… 수수께끼 맞히면 드릴게요!', '(길르앗의 수수께끼)']]);
    var COL = [[200, 40, 40], [240, 200, 60], [50, 80, 190]], NM = ['붉은 물감', '노란 물감', '푸른 물감'];
    function rgb(c) { var t = c[0] + c[1] + c[2]; if (!t) return 'rgb(225,210,170)'; var m = [0, 1, 2].map(function (k) { return Math.round((COL[0][k] * c[0] + COL[1][k] * c[1] + COL[2][k] * c[2]) / t); }); return 'rgb(' + m.join(',') + ')'; }
    function draw() {
      w.innerHTML = '<div class="wx-row"><div><span class="wx-dot" style="background:' + rgb(tgt) + '"></span><small>왕의 봉인 색(편지 귀퉁이)</small></div><div><span class="wx-dot" style="background:' + rgb(v) + '"></span><small>내 밀랍</small></div></div>' +
        '<div class="wx-btns">' + NM.map(function (n, i) { return '<button class="btn ghost" data-k="' + i + '"><i style="background:rgb(' + COL[i].join(',') + ')"></i>' + n + ' 한 방울 <b>' + v[i] + '</b></button>'; }).join('') + '</div>' +
        '<div class="bag-act"><button class="btn ghost" id="wxClr">밀랍 다시 녹이기</button><button class="btn gold" id="wxOk">이 색으로</button></div><p class="gen-help" style="text-align:center">방울 수의 <b>비율</b>로 색이 정해져요(1:1과 2:2는 같은 색).</p>';
      w.querySelectorAll('[data-k]').forEach(function (b) { b.onclick = function () { var k = +b.dataset.k; if (v[k] < 6) v[k]++; draw(); }; });
      w.querySelector('#wxClr').onclick = function () { v = [0, 0, 0]; draw(); };
      w.querySelector('#wxOk').onclick = function () {
        if (A.locked('hall')) return;
        if (!(v[0] + v[1] + v[2]) || norm(v).join() !== tgt.join()) return A.wrong('hall', '봉인 색과 다르다 — 가짜 편지로 들통난다');
        F.waxmix = 1; S.notes.push({ text: '접견실: 밀랍에 물감을 붉은 ' + tgt[0] + ' · 노란 ' + tgt[1] + ' · 푸른 ' + tgt[2] + ' 방울 섞어 왕의 봉인 색을 맞췄다.', ref: '' }); A.save(); A.sfx('ok'); A.closeModal(); A.toast('봉인 색이 맞았다 — 이제 편지를 다시 봉할 수 있다');
      };
    }
    draw(); A.modal('밀랍 그릇', w);
    if (LOCAL) BN.__wax = tgt;
  };
  why('밀랍 그릇', '편지를 다시 봉하려면 왕의 봉인과 똑같은 색의 밀랍이 필요하다. 물감 세 병이 곁에 있다.', '붉은색에 푸른색을 섞으면 자줏빛이 되겠지… 방울 수를 하나씩 바꿔 가며 견주어 보자.');
  gate('letters', 'waxmix', [['gilead', 1, '편지를 다시 봉하려면 봉인 색부터 맞춰야 할 것 같아요.', '(🕯 밀랍 그릇)']]);
  var letters1 = BN.PZ.letters;
  BN.PZ.letters = function (Rm, A) { var S = A.S(); if (!g3(S).mosaic) return A.talk([['narr', null, '반지 함이 잠겨 있다. 작은 열쇠 구멍이 하나.'], ['gilead', 1, '회의실 바닥 무늬 밑에 뭐가 있었던 것 같은데…', '(◈ 바닥 무늬)']]); return letters1(Rm, A); };

  // ── 힌트
  function prep(k, a, b, c) { var o = BN.HINTS[k] || []; BN.HINTS[k] = [a + ' ' + (o[0] || ''), b + ' ' + (o[1] || ''), function (S) { return c(S) + ' · ' + (typeof o[2] === 'function' ? o[2](S) : (o[2] || '')); }]; }
  prep('magi', '🎁 예물 상자: 4초 동안 자리를 보여 줘요 — 줄·칸으로 외워요.', '틀리면 다시 보여 줘요.', function () { return '예물: 보여 준 그대로'; });
  prep('archive', '📜 칙령 초안: 목록 낱말을 다 지우고 남은 글자.', '마 2:7을 읽어 보세요.', function () { return '칙령: 「가만히불러」'; });
  prep('council', '◈ 바닥 무늬: 홈이 끊김 없이 이어지게 — 가운데 돌은 고정.', '가장자리 돌은 바깥으로 홈이 나가면 안 돼요.', function () { return '무늬: 여덟 갈래 별이 되게'; });
  prep('hall', '🕯 밀랍 그릇: 길르앗의 수수께끼로 얻은 밀랍이 있어야 해요. 반지 함은 회의실 바닥 무늬 밑 열쇠로.', '색은 방울 수의 비율 — 붉은+푸른 = 자줏빛.', function (S) { var t = waxTgt(S); return '밀랍: 붉은 ' + t[0] + ' · 노란 ' + t[1] + ' · 푸른 ' + t[2] + '(같은 비율이면 됨)'; });
})(window.BN);
