// 「베들레헴의 밤」 1장 견본 v3 (2026-11-27): 어려운 문제 여덟 더하기
//  성문 원근 맞추기 → 청동 거울 / 나사렛 길 이정표 수열 → 상자 겉 자물쇠 / 여관 돈궤(세어서 숫자) → 열쇠
//  부엌 깜박임 부호 → 수정 상자 / 우물 거울 글씨 / 들판 정보 나눠 갖기(당번 기록 반쪽씩)
//  하늘 책 암호(누가복음 2장) / 마구간 굴 바닥 길 잇기
(function (BN) {
  var R = BN.ROOMS, LOCAL = /^(127\.0\.0\.1|localhost)$/.test(location.hostname);
  function rnd(S, n) { var s = (S.created % 9973) + 7 * n + 1; return function () { s = (s * 16807) % 2147483647; return s / 2147483647; }; }
  function H(k, list) { BN.HINTS = BN.HINTS || {}; BN.HINTS[k] = list; if (BN.HINTS_CH1) BN.HINTS_CH1[k] = list; }
  function why(t, a, b) { if (BN.WHY) BN.WHY[t] = a; if (BN.THINK) BN.THINK[t] = b; }
  function add(S, k) { if (S.items.indexOf(k) < 0) S.items.push(k); }
  BN.NEED = BN.NEED || {};

  // 새 물건
  BN.ITEMS.mirror = ['청동 거울', 'img/items/mirror.webp', '닦아 놓은 둥근 청동 거울. 뒤집힌 글씨를 바로 비춰 본다.'];
  BN.ITEMS.lensbox = ['잠긴 작은 상자', 'img/items/lensbox.svg', '여관 주인이 건넨 나무 상자. 숫자 자물쇠가 셋. 주인은 등잔을 가리키며 눈을 깜박였다.'];

  // ════ 1. 성문 · 원근 맞추기: 아치 돌에 흩어진 금빛 자국을 맞는 자리에서 보면 숫자 셋 → 궤짝 → 청동 거울
  R.gate.spots.push({ id: 'marks', x: 40, y: 16, w: 22, h: 18, act: 'puzzle:persp', extra: 1 });
  var SEG = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
  var SP = { a: [[0, 0], [1, 0]], b: [[1, 0], [1, 1]], c: [[1, 1], [1, 2]], d: [[0, 2], [1, 2]], e: [[0, 1], [0, 2]], f: [[0, 0], [0, 1]], g: [[0, 1], [1, 1]] };
  function perspData(S) {
    var r = rnd(S, 101), code = [2 + Math.floor(r() * 8), Math.floor(r() * 10), 1 + Math.floor(r() * 9)], segs = [];
    code.forEach(function (d, k) { SEG[d].split('').forEach(function (s) { var p = SP[s]; segs.push([[-110 + k * 80 + p[0][0] * 50, -60 + p[0][1] * 60], [-110 + k * 80 + p[1][0] * 50, -60 + p[1][1] * 60]].map(function (q) { return [q[0], q[1], (r() - .5) * 260]; })); }); });
    return { code: code.join(''), segs: segs, y0: (r() < .5 ? -1 : 1) * (32 + r() * 18), p0: (r() < .5 ? -1 : 1) * (18 + r() * 12) };
  }
  function proj(q, yaw, pit) { var a = yaw * Math.PI / 180, b = pit * Math.PI / 180, x = q[0] * Math.cos(a) + q[2] * Math.sin(a), z = -q[0] * Math.sin(a) + q[2] * Math.cos(a), y = q[1] * Math.cos(b) - z * Math.sin(b); return [x, y]; }
  BN.PZ.persp = function (Rm, A) {
    var S = A.S(); S.f1 = S.f1 || {};
    var D = perspData(S), yaw = D.y0, pit = D.p0, w = A.el('div', 'gen-wrap'), drag = null;
    w.innerHTML = '<div class="ps-box"><svg viewBox="-160 -110 320 220" id="psSvg"></svg><span class="ps-hint">↔ ↕ 끌어서 보는 자리를 옮겨요</span></div>' +
      (S.f1.mirror ? '<p class="gen-help" style="text-align:center">✔ 궤짝은 이미 열었어요 — 청동 거울은 가방에</p>' :
        '<div class="rm-ans"><input id="psIn" inputmode="numeric" maxlength="3" placeholder="궤짝 자물쇠 (숫자 셋)"><button class="btn gold" id="psOk">열기</button></div>');
    A.modal('아치의 금빛 자국', w);
    var svg = w.querySelector('#psSvg');
    function draw() {
      var near = Math.abs(yaw) < 5 && Math.abs(pit) < 5;
      svg.innerHTML = '<rect x="-160" y="-110" width="320" height="220" fill="#3b2a1a"/>' + Array.from({ length: 14 }, function (_, i) { return '<path d="M' + (-160 + i * 25) + ' -110 l12 220" stroke="rgba(0,0,0,.18)" stroke-width="1"/>'; }).join('') +
        D.segs.map(function (s) { var a = proj(s[0], yaw, pit), b = proj(s[1], yaw, pit); return '<line x1="' + a[0].toFixed(1) + '" y1="' + a[1].toFixed(1) + '" x2="' + b[0].toFixed(1) + '" y2="' + b[1].toFixed(1) + '" stroke="' + (near ? '#ffe27a' : '#d9a443') + '" stroke-width="' + (near ? 9 : 7) + '" stroke-linecap="round" opacity="' + (near ? 1 : .85) + '"/>'; }).join('');
      if (LOCAL) BN.__persp = { yaw: yaw, pit: pit, code: D.code };
    }
    function pt(e) { return { x: e.clientX, y: e.clientY }; }
    svg.addEventListener('pointerdown', function (e) { drag = { p: pt(e), yaw: yaw, pit: pit }; try { svg.setPointerCapture(e.pointerId); } catch (er) {} });
    svg.addEventListener('pointermove', function (e) { if (!drag) return; var q = pt(e); yaw = Math.max(-80, Math.min(80, drag.yaw + (q.x - drag.p.x) * .35)); pit = Math.max(-60, Math.min(60, drag.pit + (q.y - drag.p.y) * .35)); draw(); });
    svg.addEventListener('pointerup', function () { drag = null; });
    draw();
    var ok = w.querySelector('#psOk');
    if (ok) ok.onclick = function () {
      if (A.locked('gate')) return;
      var v = (w.querySelector('#psIn').value || '').replace(/\D/g, '');
      if (v !== D.code) return A.wrong('gate', '궤짝이 꿈쩍도 하지 않는다');
      S.f1.mirror = 1; add(S, 'mirror'); S.notes.push({ text: '성문 아치의 금빛 자국을 맞는 자리에서 보니 숫자 「' + D.code + '」 — 곁의 궤짝에서 청동 거울을 얻었다.', ref: '' }); A.save(); A.sfx('ok'); A.closeModal();
      A.talk([['narr', null, '숫자 자물쇠가 풀리자, 궤짝 안에서 닦아 놓은 둥근 청동 거울이 나온다.'], ['gilead', 2, '거울이요? 제 얼굴은 안 봐도 되는데…', '(그래도 봄)'], ['asaph', 0, '거울은 뒤집힌 것을 바로 보여 준다. 챙겨 두어라.']]);
    };
    if (LOCAL) BN.__perspSet = function (y, p) { yaw = y; pit = p; draw(); };
  };
  why('아치의 금빛 자국', '성문 아치 돌마다 금빛 자국이 흩어져 있다. 곁에는 숫자 자물쇠 셋이 달린 작은 궤짝.', '이 자국들… 어느 자리에서 보면 하나로 이어지지 않을까? 보는 자리를 옮겨 보자.');

  // ════ 2. 나사렛 길 · 이정표 수열: 돌 셋에 흩어진 수의 규칙을 찾아 상자 겉 자물쇠
  [['m1', 9, 80, '길가 이정표 돌', '이정표 돌 하나 — 「1 · 2 · 4」'], ['m2', 34, 60, '쓰러진 이정표 돌', '이정표 돌 둘 — 「7 · 11 · □」'], ['m3', 63, 50, '먼 이정표 돌', '이정표 돌 셋 — 「22 · 29」']].forEach(function (c) { R.road.spots.push({ id: 'cl_' + c[0], x: c[1], y: c[2], w: 6, h: 9, act: 'clue:' + c[0], msg: c[3], note: c[4] }); });
  BN.NEED.walk = { c: ['road_map', 'road_sun', 'm1', 'm2', 'm3'], say: ['asaph', 0, '상자 겉에 숫자 자물쇠가 하나 더 달렸구나. 길가의 이정표 돌들을 먼저 읽어 보아라.'] };
  var walk0 = BN.PZ.walk;
  BN.PZ.walk = function (Rm, A) {
    var S = A.S(); S.f1 = S.f1 || {};
    if (S.f1.roadPad) return walk0(Rm, A);
    var w = A.el('div', 'gen-wrap');
    w.innerHTML = '<div class="note seq-row"><span>1</span><span>2</span><span>4</span><span>7</span><span>11</span><b>□</b><span>22</span><span>29</span></div><div class="rm-ans"><input id="sqIn" inputmode="numeric" maxlength="2" placeholder="□에 들어갈 수"><button class="btn gold" id="sqOk">자물쇠 맞추기</button></div>';
    A.modal('상자 겉 자물쇠', w);
    w.querySelector('#sqOk').onclick = function () {
      if (A.locked('road')) return;
      if ((w.querySelector('#sqIn').value || '').replace(/\D/g, '') !== '16') return A.wrong('road', '찰칵… 겉 자물쇠가 안 열린다');
      S.f1.roadPad = 1; S.notes.push({ text: '이정표의 수 1 · 2 · 4 · 7 · 11 · 16 · 22 · 29 — 늘어나는 수가 하나씩 커진다. 상자 겉 자물쇠가 열렸다.', ref: '' }); A.save(); A.sfx('ok'); A.closeModal(); A.toast('겉 자물쇠가 풀렸다 — 이제 상자를 들고 걸어 보자'); setTimeout(function () { walk0(Rm, A); }, 700);
    };
  };
  why('상자 겉 자물쇠', '지도 상자 겉에 숫자 자물쇠가 하나 더 걸려 있다. 길가 이정표 돌 셋에 적힌 수를 이어 놓으면 빈칸이 하나 보인다.', '1, 2, 4, 7, 11… 수가 늘어나는 폭이 어떻게 바뀌지?');

  // ════ 3. 여관 · 세어서 숫자 만들기: 계산대 돈궤 → 부엌 열쇠
  R.inn.item = null;
  R.inn.spots.push({ id: 'cashbox', x: 90, y: 63, w: 8, h: 9, act: 'puzzle:cashbox', label: '💰 돈궤', extra: 1 });
  R.inn.done = R.inn.done.filter(function (l) { return !/열쇠 꾸러미를 건넨다/.test(l[2]); }).concat([['narr', null, '여관 주인이 계산대 위 돈궤를 툭 치고, 마당을 한 바퀴 손으로 가리킨다.']]);
  BN.PZ.cashbox = function (Rm, A) {
    var S = A.S(); S.f1 = S.f1 || {};
    if (S.f1.cash) return A.toast('✔ 돈궤는 이미 열었어요 — 열쇠는 가방에');
    var w = A.el('div', 'gen-wrap');
    var CB = [['🚪', '손님방 문'], ['🪟', '여관 벽의 창'], ['🫏', '짐을 진 짐승']], cv = [0, 0, 0];
    w.innerHTML = '<div class="note cb-lid"><b>돈궤 뚜껑에 새긴 글</b><span>「첫째 칸은 손님방 문, 둘째 칸은 여관 벽의 창, 셋째 칸은 짐을 진 짐승. 마당에서 세어 보라.」</span><small class="cb-tip">숫자는 어디에도 적혀 있지 않아요 — 창을 닫고 여관 마당 그림을 끌어 보며 직접 세요.</small></div>' +
      '<div class="cb-slots">' + CB.map(function (c, i) { return '<div class="cb-slot"><small>' + ['첫째', '둘째', '셋째'][i] + ' 칸</small><button class="btn ghost cb-up" data-i="' + i + '">▲</button><b id="cbV' + i + '">0</b><button class="btn ghost cb-dn" data-i="' + i + '">▼</button><span>' + c[0] + '<br>' + c[1] + '</span></div>'; }).join('') + '</div>' +
      '<button class="btn gold block" id="cbOk" style="margin-top:10px">돈궤 열기</button>';
    A.modal('계산대 돈궤', w);
    w.querySelectorAll('.cb-up, .cb-dn').forEach(function (b) { b.onclick = function () { var i = +b.dataset.i; cv[i] = (cv[i] + (b.classList.contains('cb-up') ? 1 : 9)) % 10; w.querySelector('#cbV' + i).textContent = cv[i]; }; });
    w.querySelector('#cbOk').onclick = function () {
      if (A.locked('inn')) return;
      if (cv.join('') !== '552') return A.wrong('inn', '돈궤가 열리지 않는다 — 다시 세어 보자');
      S.f1.cash = 1; add(S, 'keys'); S.notes.push({ text: '여관 돈궤: 손님방 문 5 · 여관 벽의 창 5 · 짐을 진 나귀 2 → 552. 안에 열쇠 꾸러미.', ref: '' }); A.save(); A.sfx('ok'); A.closeModal();
      A.talk([['narr', null, '딸깍. 돈궤 안에 동전 몇 닢과 열쇠 꾸러미가 들어 있다.'], ['gilead', 2, '열쇠다! 이걸로 부엌 문도 열리지 않을까요?', '(빵 냄새 쪽을 봄)']]);
    };
  };
  why('계산대 돈궤', '계산대 위의 돈궤에 숫자 자물쇠 셋. 뚜껑에 무엇을 세라는 글이 새겨져 있다. 답은 이 여관 마당 그림 속에 있다.', '숫자가 적힌 데는 없네… 마당에 있는 문이랑 창, 짐 실은 짐승을 내가 직접 세어야겠다. 2층도 있고, 뒤 언덕 마을 창은 여관 것이 아니지.');

  // ════ 4. 부엌 · 깜박임 부호: 매달린 등잔의 길고 짧은 깜박임 + 등잔지기의 표 → 수정 상자
  R.kitchen.item = 'lensbox';
  R.kitchen.done = R.kitchen.done.map(function (l) { return /맑은 돌 하나를 꺼내 건넨다/.test(l[2]) ? ['narr', null, '여관 주인이 장부 판 뒤에서 작은 나무 상자를 꺼내 건넨다. 숫자 자물쇠가 셋. 주인은 천장의 등잔을 가리키며 눈을 깜박여 보인다.'] : /수정이로구나/.test(l[2]) ? ['asaph', 2, '등잔을 보라는 게냐? 저 불빛이 길게, 짧게 떨리는구나.'] : l; });
  R.kitchen.spots.push({ id: 'cl_k_morse', x: 30, y: 40, w: 6, h: 9, act: 'clue:k_morse', msg: '선반 기둥에 등잔지기의 표가 새겨져 있다', note: '등잔지기의 표 — 짧게(·) 길게(−): 1 ·−−−− 2 ··−−− 3 ···−− 4 ····− 5 ····· 6 −···· 7 −−··· 8 −−−·· 9 −−−−· 0 −−−−−' });
  R.kitchen.spots.push({ id: 'hanglamp', x: 19, y: 20, w: 8, h: 14, act: 'puzzle:flicker', extra: 1 });
  BN.NEED.flicker = { c: ['k_morse'], when: function (S) { return S.items.indexOf('lensbox') >= 0; }, say: ['asaph', 0, '불빛이 길게, 짧게 떨린다… 그걸 숫자로 읽는 표가 어딘가 있을 게다.'] };
  function flickData(S) { var r = rnd(S, 111); return [1 + Math.floor(r() * 9), Math.floor(r() * 10), 1 + Math.floor(r() * 9)]; }
  var MORSE = { 1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.', 0: '-----' };
  BN.PZ.flicker = function (Rm, A) {
    var S = A.S(), code = flickData(S), w = A.el('div', 'gen-wrap'), alive = true;
    if (S.items.indexOf('lensbox') < 0) return A.talk([['gilead', 1, '천장 등잔이 가끔 떨려요. 바람 때문인가?']]);
    w.innerHTML = '<div class="fl-box"><div class="fl-lamp" id="flL"></div><p class="fl-cap" id="flC">불빛을 지켜보세요</p></div>' +
      ((S.clues || {}).k_morse ? '<div class="note fl-tab"><b>등잔지기의 표</b><small>● 짧게 · ▬ 길게</small><div class="fl-grid">' + [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(function (d) { return '<span><em>' + d + '</em>' + MORSE[d].split('').map(function (m) { return m === '.' ? '<i class="d"></i>' : '<i class="l"></i>'; }).join('') + '</span>'; }).join('') + '</div></div>' : '') +
      '<div class="rm-ans"><input id="flIn" inputmode="numeric" maxlength="3" placeholder="작은 상자 자물쇠 (숫자 셋)"><button class="btn gold" id="flOk">열기</button></div>';
    A.modal('떨리는 등잔', w, function () { alive = false; });
    var L = w.querySelector('#flL'), C = w.querySelector('#flC'), seq = [];
    code.forEach(function (d, k) { MORSE[d].split('').forEach(function (m) { seq.push([m === '.' ? 280 : 850, 1]); seq.push([280, 0]); }); seq.push([k < 2 ? 1100 : 2600, 0]); });
    var i = 0; (function step() { if (!alive || !L.isConnected) return; var s = seq[i % seq.length]; L.classList.toggle('on', !!s[1]); if (i % seq.length === 0) C.textContent = '— 처음부터 —'; else if (s[1]) C.textContent = ''; i++; setTimeout(step, s[0]); })();
    w.querySelector('#flOk').onclick = function () {
      if (A.locked('kitchen')) return;
      if ((w.querySelector('#flIn').value || '').replace(/\D/g, '') !== code.join('')) return A.wrong('kitchen', '상자가 열리지 않는다');
      S.items = S.items.filter(function (x) { return x !== 'lensbox'; }); add(S, 'lens'); S.notes.push({ text: '떨리는 등잔 불빛을 등잔지기의 표로 읽으니 「' + code.join('') + '」 — 작은 상자 안에 수정 조각.', ref: '' }); A.save(); A.sfx('ok'); A.closeModal();
      A.talk([['narr', null, '상자 안에 맑은 돌 하나가 들어 있다. 작은 글씨를 볼 때 쓰라는 듯.'], ['asaph', 2, '수정이로구나. 내 눈이 침침할 때 쓰는 것과 같은 돌이다.']]);
    };
    if (LOCAL) BN.__flicker = code.join('');
  };
  why('떨리는 등잔', '천장에 매달린 등잔 불빛이 길게, 짧게 떨린다. 여관 주인이 건넨 작은 상자에는 숫자 자물쇠가 셋.', '길게, 짧게… 이게 숫자일까? 끊기는 곳에서 한 숫자가 끝나는 것 같은데.');

  // ════ 5. 우물 · 거울 글씨: 벽 글씨가 물에 비쳐 뒤집혀 보인다(청동 거울을 우물에 쓰면 바로)
  BN.WELL_MIRROR = true;
  R.well.spots.forEach(function (sp) { if (sp.id === 'wellin') sp.accept.mirror = { msg: '청동 거울을 물 위로 비스듬히 대자, 뒤집혀 비치던 글씨가 바로 보인다.' }; });
  if (BN.THINK) BN.THINK['우물 안'] = '깜깜해… 등잔으로 비추면 벽 글씨가 물에 비쳐 보일지도. 그런데 물에 비친 글씨는 뒤집혀 있잖아? 글씨가 작으면 맑은 돌, 뒤틀린 글자면… 성문에서 읽은 말이 있었지.';

  // ════ 6. 들판 · 정보 나눠 갖기: 당번 기록이 반으로 찢겨 바위에 반, 길르앗에게 반
  BN.fieldLogParts = function (S) {
    var all = BN.fieldLog ? BN.fieldLog() : [], C = S.clues || {}, out = [];
    if (C.f_log) out = out.concat(all.slice(0, 3));
    if (C.f_log2) out = out.concat(all.slice(3));
    return out;
  };
  R.field.spots.forEach(function (sp) { if (sp.id === 'cl_f_log') { sp.msg = '바위 밑에 찢긴 당번 기록 반쪽이 끼어 있다 — 수첩에 적었다'; Object.defineProperty(sp, 'note', { get: function () { return '목자의 당번 기록(바위의 반쪽) — ' + (BN.fieldLog ? BN.fieldLog().slice(0, 3).join(' ') : ''); }, configurable: true }); } });
  R.field.spots.push({ id: 'gilead', x: 50, y: 104, fig: 'gilead_side', h: 46, act: 'puzzle:halflog', extra: 1 });
  BN.PZ.halflog = function (Rm, A) {
    var S = A.S(); S.clues = S.clues || {};
    if (S.clues.f_log2) return A.talk([['gilead', 0, '반쪽은 아까 드렸잖아요. 빵 부스러기는 제가 묻힌 거 아니에요.']]);
    if (!S.clues.f_log) return A.talk([['gilead', 1, '아까 바람에 날아온 종이 반쪽을 주웠는데요… 나머지 반쪽이 어디 있는지 알면 드릴게요.', '(바위 쪽을 힐끔)']]);
    S.clues.f_log2 = 1; S.notes.push({ text: '목자의 당번 기록(길르앗이 주운 반쪽) — ' + (BN.fieldLog ? BN.fieldLog().slice(3).join(' ') : ''), ref: '' }); A.save(); A.sfx('ok');
    A.talk([['gilead', 2, '아, 그 반쪽이랑 이어지는 거였구나! 여기요, 제가 주운 나머지 반쪽.', '(빵 부스러기가 묻어 있다)'], ['asaph', 0, '둘을 맞추어 보아라. 반쪽만으로는 어느 끈이 어느 때인지 정해지지 않는다.']]);
  };
  BN.NEED.herd = { c: ['f_log', 'f_log2'], say: ['asaph', 0, '어느 끈 양을 어느 때 맡았는지 기록이 다 있어야 한다. 바위를 살피고, 길르앗에게도 물어보아라.'] };

  // ════ 7. 하늘 · 책 암호: 천군이 떠난 뒤 떨어진 숫자 양피지(누가복음 2장 · 띄어쓰기 빼고 몇째 글자)
  var BOOKC = '2:5-7 · 2:8-15 · 2:11-11 · 2:10-14 · 2:7-31 · 2:9-5 · 2:15-15', BOOKA = '아기를보러가자';
  BN.afterChorus = function (Rm, A) {
    var S = A.S(); S.f1 = S.f1 || {}; S.f1.chorusDone = 1; A.save(); A.closeModal();
    A.talk([['narr', null, '노래가 그치자 하늘이 고요해진다. 천군이 떠난 자리에서 숫자가 빼곡한 양피지 한 장이 팔랑 내려온다.'], ['gilead', 1, '숫자 쪽지요? 「누가복음」이라고 맨 위에 적혀 있어요.']], function () { BN.PZ.bookc(Rm, A); });
  };
  var chorusX = BN.PZ.chorus;
  BN.PZ.chorus = function (Rm, A) { var S = A.S(); if (S.f1 && S.f1.chorusDone) return BN.PZ.bookc(Rm, A); return chorusX(Rm, A); };
  BN.PZ.bookc = function (Rm, A) {
    var S = A.S(), w = A.el('div', 'gen-wrap');
    w.innerHTML = '<div class="note bk-scroll"><b>누가복음</b><span class="bk-code">' + BOOKC.split(' · ').map(function (c) { return '<i>' + c + '</i>'; }).join('') + '</span><small>장:절-몇째 글자 · 띄어쓰기와 문장부호는 세지 않는다 · 개역개정</small></div>' +
      '<div class="rm-ans"><input id="bkIn" maxlength="10" placeholder="뽑은 글자를 이어 적기" autocomplete="off" spellcheck="false"><button class="btn gold" id="bkOk">적기</button></div>';
    A.modal('숫자 양피지', w);
    w.querySelector('#bkOk').onclick = function () {
      if (A.locked('angel')) return;
      var v = (w.querySelector('#bkIn').value || '').replace(/\s/g, '');
      if (v !== BOOKA) return A.wrong('angel', '말이 되지 않는다 — 다시 세어 보자');
      S.notes.push({ text: '숫자 양피지(누가복음 2장에서 글자 뽑기): 「아기를 보러 가자」', ref: '누가복음 2:15' }); A.save(); A.sfx('ok'); A.closeModal(); A.solve(Rm);
    };
  };
  why('숫자 양피지', '천군이 떠난 자리에 떨어진 양피지. 맨 위에 「누가복음」, 그 아래 숫자 묶음이 일곱.', '「2:5-7」… 2장 5절의 일곱째 글자? 띄어쓰기는 세지 말라고 했지. 성경을 펴 봐야겠다.');

  // ════ 8. 마구간 · 굴 바닥 길 잇기: 돌판을 돌려 입구에서 구유까지
  var PW = 5, PHh = 4;
  function pathData(S) {
    var r = rnd(S, 121), ey = Math.floor(r() * PHh), xy = Math.floor(r() * PHh), cells = null;
    for (var t = 0; t < 300 && !cells; t++) {   // 입구(왼쪽 ey) → 구유(오른쪽 xy)까지 겹치지 않는 길
      var path = [[0, ey]], seen = { '0,ey': 1 }, ok = true; seen = {}; seen['0,' + ey] = 1;
      while (true) { var c = path[path.length - 1]; if (c[0] === PW - 1 && c[1] === xy) break; var nb = [[1, 0], [0, 1], [0, -1], [-1, 0]].map(function (d) { return [c[0] + d[0], c[1] + d[1]]; }).filter(function (n) { return n[0] >= 0 && n[0] < PW && n[1] >= 0 && n[1] < PHh && !seen[n[0] + ',' + n[1]]; }); if (!nb.length || path.length > 14) { ok = false; break; } var rt = nb.filter(function (q) { return q[0] > c[0]; }), n = (rt.length && r() < .55) ? rt[0] : nb[Math.floor(r() * nb.length)]; seen[n[0] + ',' + n[1]] = 1; path.push(n); }
      if (ok && path.length >= 8) cells = path;
    }
    var DIRS = { '1,0': 1, '-1,0': 3, '0,1': 2, '0,-1': 0 }, conn = {};   // 0위 1오른 2아래 3왼
    cells.forEach(function (c, k) { var s = []; if (k === 0) s.push(3); else s.push(DIRS[(cells[k - 1][0] - c[0]) + ',' + (cells[k - 1][1] - c[1])]); if (k === cells.length - 1) s.push(1); else s.push(DIRS[(cells[k + 1][0] - c[0]) + ',' + (cells[k + 1][1] - c[1])]); conn[c[0] + ',' + c[1]] = s; });
    var tiles = [];
    for (var y = 0; y < PHh; y++) for (var x = 0; x < PW; x++) {
      var s = conn[x + ',' + y], type, rot;
      if (s) { var d = (s[1] - s[0] + 4) % 4; type = d === 2 ? 'I' : 'L'; rot = type === 'I' ? s[0] % 2 : ((s[1] - s[0] + 4) % 4 === 1 ? s[0] : s[1]); }
      else { type = r() < .5 ? 'I' : 'L'; rot = Math.floor(r() * 4); }
      tiles.push({ type: type, sol: rot, rot: (rot + 1 + Math.floor(r() * 3)) % 4, on: !!s });
    }
    return { ey: ey, xy: xy, tiles: tiles };
  }
  function opens(t) { var base = t.type === 'I' ? [0, 2] : [0, 1]; return base.map(function (d) { return (d + t.rot) % 4; }); }
  function flowFrom(D) {
    var lit = {}, q = [[0, D.ey, 3]];
    while (q.length) { var c = q.shift(), x = c[0], y = c[1]; if (x < 0 || x >= PW || y < 0 || y >= PHh) continue; var t = D.tiles[y * PW + x], o = opens(t); if (o.indexOf(c[2]) < 0 || lit[x + ',' + y]) continue; lit[x + ',' + y] = 1; o.forEach(function (d) { var n = [[0, -1], [1, 0], [0, 1], [-1, 0]][d]; q.push([x + n[0], y + n[1], (d + 2) % 4]); }); }
    var last = D.tiles[D.xy * PW + PW - 1];
    return { lit: lit, done: !!lit[(PW - 1) + ',' + D.xy] && opens(last).indexOf(1) >= 0 };
  }
  BN.cavePath = function (Rm, A, next) {
    var S = A.S(), D = pathData(S), w = A.el('div', 'gen-wrap');
    if (S.f1.pathRot) S.f1.pathRot.forEach(function (v, i) { if (D.tiles[i]) D.tiles[i].rot = v; });
    function seg(o) { var P = { 0: '50,50 50,0', 1: '50,50 100,50', 2: '50,50 50,100', 3: '50,50 0,50' }; return o.map(function (d) { return '<polyline points="' + P[d] + '"/>'; }).join(''); }
    function draw() {
      var f = flowFrom(D);
      w.innerHTML = '<div class="pt-wrap"><span class="pt-in" style="top:' + ((D.ey + .5) / PHh * 100) + '%">입구 ▶</span><div class="pt-grid">' + D.tiles.map(function (t, i) { var x = i % PW, y = Math.floor(i / PW); return '<button class="pt-t' + (f.lit[x + ',' + y] ? ' lit' : '') + '" data-i="' + i + '"><svg viewBox="0 0 100 100">' + seg(opens(t)) + '</svg></button>'; }).join('') + '</div><span class="pt-out" style="top:' + ((D.xy + .5) / PHh * 100) + '%">🌾</span></div>' +
        '<p class="gen-help" style="text-align:center">돌판을 누르면 오른쪽으로 돌아가요. 입구의 등잔 빛이 구유(🌾)까지 이어지게.</p>';
      w.querySelectorAll('.pt-t').forEach(function (b) { b.onclick = function () { var t = D.tiles[+b.dataset.i]; t.rot = (t.rot + 1) % 4; S.f1.pathRot = D.tiles.map(function (q) { return q.rot; }); A.save(); draw(); if (flowFrom(D).done) { S.f1.path = 1; A.save(); A.sfx('ok'); setTimeout(function () { A.closeModal(); A.toast('빛이 바닥 돌을 따라 구유 쪽 깊은 곳까지 이어졌다'); setTimeout(next, 700); }, 600); } }; });
      if (LOCAL) BN.__path = { solve: function () { D.tiles.forEach(function (t) { if (t.on) t.rot = t.sol; }); draw(); if (flowFrom(D).done) { S.f1.path = 1; A.save(); A.closeModal(); setTimeout(next, 300); } } };
    }
    draw(); A.modal('굴 바닥 돌판', w);
  };
  why('굴 바닥 돌판', '돌문 안쪽, 굴 바닥에 홈이 파인 돌판이 깔려 있다. 홈이 이어지면 등잔 빛이 안쪽까지 비칠 것 같다.', '홈이 곧은 돌, 꺾인 돌… 입구부터 하나씩 돌려서 이어 보자. 구유는 오른쪽 깊은 곳.');

  // ── 힌트(새 문제들 반영)
  var g = BN.HINTS.gate || [];
  H('gate', [g[0] + ' 아치 돌의 금빛 자국은 화면을 끌어 보는 자리를 옮기면 이어져요.', g[1] + ' 금빛 자국이 숫자 셋으로 또렷해지는 자리를 찾으면 궤짝이 열려요(청동 거울).', function (S) { return (typeof g[2] === 'function' ? g[2](S) : g[2]) + ' · 궤짝 ' + perspData(S).code; }]);
  var rd = BN.HINTS.road || [];
  H('road', ['이정표 돌 셋(왼쪽 아래 · 가운데 · 먼 곳)을 찾아 수를 이어요. ' + (rd[0] || ''), '1, 2, 4, 7, 11 — 늘어나는 폭이 1, 2, 3, 4… ' + (rd[1] || ''), function (S) { return '겉 자물쇠 16 · ' + (typeof rd[2] === 'function' ? rd[2](S) : rd[2]); }]);
  var inh = BN.HINTS.inn || [];
  H('inn', [inh[0] + ' 계산대의 💰 돈궤는 마당에서 세는 문제 — 화면을 끝까지 끌어 보세요.', inh[1] + ' 돈궤: 손님방 문은 2층에도 있고, 창은 여관 건물 벽의 것만, 짐을 진 짐승은 나귀.', function (S) { return (typeof inh[2] === 'function' ? inh[2](S) : inh[2]) + ' · 돈궤 552(문 5 · 창 5 · 나귀 2)'; }]);
  var kh = BN.HINTS.kitchen || [];
  H('kitchen', [kh[0], (kh[1] || '') + ' 그다음 받은 작은 상자: 선반 기둥의 「등잔지기의 표」를 찾고 천장 등잔을 누르면 불빛이 길게·짧게 떨려요.', function (S) { return (typeof kh[2] === 'function' ? kh[2](S) : kh[2]) + ' · 작은 상자 ' + flickData(S).join(''); }]);
  var wh = BN.HINTS.well || [];
  H('well', [wh[0] + ' 물에 비친 글씨는 좌우가 뒤집혀 있어요 — 성문 궤짝의 청동 거울을 우물에 쓰면 바로 보여요.', wh[1], wh[2]]);
  var fh = BN.HINTS.field || [];
  H('field', ['당번 기록은 반으로 찢겨 있어요 — 바위 밑에 반쪽, 나머지 반쪽은 길르앗에게(바위 쪽을 먼저 찾은 뒤 말을 거세요). ' + (fh[0] || ''), fh[1], fh[2]]);
  var ah = BN.HINTS.angel || [];
  H('angel', [ah[0], (ah[1] || '') + ' 노래가 끝나면 숫자 양피지: 「2:5-7」은 누가복음 2장 5절의 일곱째 글자(띄어쓰기 빼고).', function (S) { return (typeof ah[2] === 'function' ? ah[2](S) : ah[2]) + ' · 양피지: 「아기를보러가자」'; }]);
  var sh = BN.HINTS.stable || [];
  H('stable', [sh[0] + ' 돌문 다음은 굴 바닥 돌판 — 눌러 돌려 입구에서 구유까지 홈을 이어요.', sh[1], sh[2]]);

  // ══ 11/27 1장 16문제 안팎으로 줄이기: 30걸음 걷기 · 양 몰기 · 하늘 원판 · 노래 조각 순서를 뺀다 ══
  // 나사렛 길: 겉 자물쇠 뒤 곧바로 두 장의 지도
  BN.PZ.walk = function (Rm, A) {
    var S = A.S(); S.f1 = S.f1 || {};
    if (S.f1.roadPad) { S.walked = 1; return BN.runPuzzle('roadmap', Rm); }
    var w = A.el('div', 'gen-wrap');
    w.innerHTML = '<div class="note seq-row"><span>1</span><span>2</span><span>4</span><span>7</span><span>11</span><b>□</b><span>22</span><span>29</span></div><div class="rm-ans"><input id="sqIn" inputmode="numeric" maxlength="2" placeholder="□에 들어갈 수"><button class="btn gold" id="sqOk">자물쇠 맞추기</button></div>';
    A.modal('상자 겉 자물쇠', w);
    w.querySelector('#sqOk').onclick = function () {
      if (A.locked('road')) return;
      if ((w.querySelector('#sqIn').value || '').replace(/\D/g, '') !== '16') return A.wrong('road', '찰칵… 겉 자물쇠가 안 열린다');
      S.f1.roadPad = 1; S.walked = 1; S.notes.push({ text: '이정표의 수 1 · 2 · 4 · 7 · 11 · 16 · 22 · 29 — 늘어나는 폭이 하나씩 커진다. 상자 겉 자물쇠가 열렸다.', ref: '' }); A.save(); A.sfx('ok'); A.closeModal(); A.toast('겉 자물쇠가 풀렸다 — 안에 지도 두 장'); setTimeout(function () { BN.runPuzzle('roadmap', Rm); }, 700);
    };
  };
  // 들판: 당번 기록으로 곧바로 상자 자물쇠(양 몰기 · 하늘 원판 없음)
  BN.noDial = true;
  BN.PZ.herd = function (Rm, A) { BN.runPuzzle('field', Rm); };
  R.field.intro = R.field.intro.map(function (l) { return /흩어진 양부터/.test(l[2]) ? ['asaph', 0, '양을 하나씩 눌러 몇 번 우는지 들어 두어라. 그리고 목자들이 어느 끈 양을 어느 때 맡았는지 적어 둔 것이 있을 게다. 상자가 그것을 물을 게다.'] : l; });
  R.field.done = R.field.done.map(function (l) { return /네 별이 지팡이 눈금/.test(l[2]) ? ['narr', null, '딸깍, 목자의 상자가 열리는 순간 들판의 바람이 멎는다.'] : l; });
  R.field.note = { text: '찢긴 당번 기록 두 반쪽(바위 · 길르앗)을 맞춰 끈 색마다 경점을 따지고, 저물 때 → 밤중 → 닭 울 때 → 새벽 차례로 그 끈 양의 울음 횟수를 넣어 목자의 상자를 열었다.', ref: '누가복음 2:8 · 마가복음 13:35' };
  BN.NEED.herd = { c: ['f_log', 'f_log2'], say: ['asaph', 0, '어느 끈 양을 어느 때 맡았는지 기록이 다 있어야 상자를 열 수 있다. 바위를 살피고, 길르앗에게도 물어보아라.'] };
  // 하늘: 노래 조각을 줍고 차례로 놓던 것을 빼고 곧바로 가락(말씀은 가락을 칠 때 이어서 보임)
  R.angel.spots = R.angel.spots.filter(function (sp) { return !/^clue:an\d$/.test(sp.act); });
  delete BN.NEED.chorus;
  var chorusY = BN.PZ.chorus;
  BN.PZ.chorus = function (Rm, A) { var S = A.S(); S.f1 = S.f1 || {}; S.f1.chord = 1; return chorusY(Rm, A); };

  if (BN.HOW) {
    BN.HOW.road = '길가 이정표 돌 셋의 수로 상자 겉 자물쇠를 열어요. 그다음 밤 지도를 손가락으로 끌어 낮 지도에 겹치고(딱 붙지 않아요), 출발 → 별을 따라 베들레헴까지 네 걸음을 나침반으로 읽어, 뚜껑 글자판의 ★에서 그 방향대로 한 칸씩 가며 밟은 글자를 모아요.';
    BN.HOW.field = '바위 밑 당번 기록 반쪽과, 길르앗이 주운 반쪽을 모아요. 양을 눌러 끈 색과 울음 횟수를 세고, 기록으로 끈마다 경점을 따져 저물 때 → 밤중 → 닭 울 때 → 새벽 차례로 상자 자물쇠에 넣어요.';
    BN.HOW.angel = '가락은 두 소절로 한 번씩 소리로만 들려요. 건반을 눌러 소리를 찾아보고(채점 안 함) 「이제 치기」 뒤 들은 차례대로. 노래가 끝나면 숫자 양피지 — 누가복음 2장에서 글자를 뽑아요.';
  }
  var rd2 = BN.HINTS.road || [];
  H('road', ['이정표 돌 셋(왼쪽 아래 · 가운데 · 먼 곳)과 등잔 받침 밑 지도, 기둥의 나침반 그림을 찾아요. 1, 2, 4, 7, 11 — 늘어나는 폭이 1, 2, 3, 4…', rd2[1] || '', rd2[2] || '']);
  H('field', ['당번 기록은 반으로 찢겨 있어요 — 바위 밑에 반쪽, 나머지 반쪽은 길르앗에게(바위 쪽을 먼저 찾은 뒤 말을 거세요). 양을 하나씩 눌러 끈 색과 울음 횟수를 세어 두세요.',
    '기록 다섯 줄을 차례로 따져요: 새벽이 될 수 있는 끈부터 정하면 나머지가 하나씩 풀려요. 자물쇠는 저물 때 → 밤중 → 닭 울 때 → 새벽 차례.',
    function () { var c = function (w) { return BN.ribOfWatch ? BN.ribOfWatch(w)[0] : ''; }; return '저물 때 ' + c(0) + ' · 밤중 ' + c(1) + ' · 닭 울 때 ' + c(2) + ' · 새벽 ' + c(3) + ' → 자물쇠 ' + (BN.fieldCode ? BN.fieldCode() : ''); }]);
  var ah2 = BN.HINTS.angel || [];
  H('angel', ['가락은 소리를 켜야 들려요. 한 소절씩 듣고, 건반을 눌러 같은 소리를 찾아요. 노래가 끝나면 숫자 양피지가 내려와요.',
    '「2:5-7」은 누가복음 2장 5절의 일곱째 글자(띄어쓰기·문장부호 빼고, 개역개정). 일곱 글자를 이으면 말이 돼요.',
    function (S) { return '가락 건반(왼쪽부터 1~7번): ' + (S.chorusSeq || '가락을 한 번 들으면 보여요') + ' · 양피지: 「아기를보러가자」'; }]);

  // ══ 11/27 여관: 방 배정은 여관 주인에게(계산대 돈궤와 겹치지 않게), 어디서 푸는지 표지 ══
  R.inn.spots = R.inn.spots.filter(function (sp) { return sp.id !== 'desk'; });
  R.inn.spots.forEach(function (sp) { if (sp.id === 'keeper') { sp.act = 'puzzle:inn'; sp.gname = '📋 방 정하기'; } if (sp.id === 'cashbox') { sp.x = 88; sp.y = 66; sp.w = 10; sp.h = 10; } });
  if (BN.NEED.inn) BN.NEED.inn.say = ['gilead', 1, '여관 주인 아저씨가 손님 쪽지를 내미는데… 바람에 다 날아갔대요! 마당 여기저기 흩어졌어요.', '(쪽지 여섯을 찾아야 방을 정할 수 있다)'];
  BN.QSTEP = Object.assign(BN.QSTEP || {}, { inn: '쪽지를 다 모았어요 — 여관 주인(📋 방 정하기)을 눌러 손님 방을 정하세요. 계산대의 💰 돈궤도 잊지 마세요.' });
  var ih = BN.HINTS.inn || [];
  H('inn', ['손님 쪽지 여섯이 마당 곳곳에 있어요: 2층 난간, 별 간판, 문틈, 항아리 밑, 계단 위, 왼쪽 처마 등잔 옆. 다 찾으면 여관 주인(📋 방 정하기)을 눌러요. 계산대의 💰 돈궤는 따로 — 마당에서 세는 문제.', ih[1], ih[2]]);
  if (BN.HOW) BN.HOW.inn = '여관 주인(📋 방 정하기)을 누르면 손님 방 정하기 — 손님을 누르고 방을 누르면 들어가요(방을 다시 누르면 빠져요). 💰 돈궤는 마당에서 센 수 셋.';

  // ══ 11/27 부엌: 천장 등잔 자리를 실제 매달린 등잔(가운데 위)으로, 작은 상자를 받으면 표지 ══
  R.kitchen.spots.forEach(function (sp) {
    if (sp.id === 'hanglamp') { sp.x = 48; sp.y = 18; sp.w = 8; sp.h = 18; Object.defineProperty(sp, 'label', { get: function () { var S = BN.ui && BN.ui.S && BN.ui.S(); return S && S.items.indexOf('lensbox') >= 0 ? '🪔 떨리는 등잔' : ''; }, configurable: true }); }
    if (sp.id === 'cl_k_morse') { sp.x = 34.5; sp.y = 36; sp.msg = '선반 나무 기둥에 등잔지기의 표가 새겨져 있다'; }
  });
  var kh2 = BN.HINTS.kitchen || [];
  H('kitchen', [kh2[0], '그다음 받은 작은 상자: 선반 나무 기둥(가운데 왼쪽)의 「등잔지기의 표」를 찾고, 천장 가운데 매달린 「🪔 떨리는 등잔」을 누르면 불빛이 길게·짧게 떨려요. ' + ((kh2[1] || '').split(' 그다음 받은 작은 상자')[0]), kh2[2]]);

  // 우물 길르앗: 할 일 귀띔은 「아 맞다」 줄이 맡으므로 고정 대사는 한 줄만
  R.well.talks.gilead = [['gilead', 2, '저 아래 뭐가 반짝인 것 같아요. 동전이면 좋겠다.']];
})(window.BN);
