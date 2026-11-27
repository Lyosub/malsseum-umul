// 「베들레헴의 밤」 1장 견본 v2 (2026-11-27): 도구를 찾고 · 합치고 · 직접 쓰는 방탈출
//  성문(문지기 셋 — 한 명만 참말) → 빈 등잔
//  나사렛 길(지도 상자) → 부싯돌
//  여관: 나귀 짐 밧줄 · 방 배정 → 열쇠 → 부엌 문에 직접 쓰기
//  부엌: 기름 단지 → [빈 등잔 + 기름 + 부싯돌 = 켜진 등잔] → 장부 판 읽기 → 기름 나누기 → 수정 조각
//  우물: 끊어진 두레박 + 밧줄 = 줄 맨 두레박 → 우물에 등잔 · 두레박을 직접 쓰기 → 수정으로 벽 글씨
//  마구간: 굴 안에 등잔을 직접 쓰기
(function (BN) {
  var R = BN.ROOMS;

  // ── 새 물건
  BN.ITEMS.lamp_e = ['빈 등잔', 'img/items/lamp.webp', '기름도 불도 없는 질그릇 등잔. 이대로는 비출 수 없다.'];
  BN.ITEMS.lamp = ['켜진 등잔', 'img/items/lamp.webp', '기름을 붓고 부싯돌로 불을 붙인 등잔. 어두운 곳에 쓴다.'];
  BN.ITEMS.flint = ['부싯돌', 'img/items/flint.svg', '두 돌을 부딪치면 불티가 튄다.'];
  BN.ITEMS.bucket_b = ['끊어진 두레박', 'img/items/bucket_b.svg', '줄이 짧게 끊어진 두레박. 이대로는 물까지 닿지 않는다.'];
  BN.ITEMS.bucket = ['줄 맨 두레박', 'img/items/bucket.svg', '튼튼한 밧줄을 맨 두레박. 우물에 내릴 수 있다.'];
  BN.ITEMS.rope = ['튼튼한 밧줄', 'img/items/rope.webp', '나귀 짐에서 빌린 긴 밧줄.'];

  // ── 합치기(고른 물건이 꼭 이것들일 때만, 차례는 상관없음). keep: 합친 뒤에도 남는 것
  BN.COMBINE = [
    { of: ['lamp_e', 'oil', 'flint'], make: 'lamp', keep: ['oil'], msg: '빈 등잔에 기름을 붓고 부싯돌을 부딪쳤다 — 탁! 불이 붙었다. 「켜진 등잔」' },
    { of: ['bucket_b', 'rope'], make: 'bucket', msg: '끊어진 두레박에 튼튼한 밧줄을 단단히 맸다. 「줄 맨 두레박」' }
  ];
  BN.COMBINE_HINT = {   // 둘만 맞고 하나가 빠졌을 때 한마디
    'lamp_e+oil': '기름은 부었는데… 불을 붙일 게 없다.',
    'lamp_e+flint': '불티는 튀는데 등잔이 텅 비어 있다.',
    'flint+oil': '기름에 불을 붙일 수는 있겠지만 담을 그릇이 없다.'
  };

  // ── 퀘스트 저널의 「다음 장소」 차례: 우물은 등잔(부엌)이 있어야 하므로 여관 · 부엌 뒤
  BN.QORDER = { 1: ['gate', 'road', 'inn', 'kitchen', 'well', 'field', 'angel', 'stable'] };

  // ── 방이 열리는 차례: 성문을 풀면 여관 · 나사렛 길 · 우물이 한꺼번에 열린다(어디부터 갈지는 고르기)
  Object.assign(BN.UNLOCK, { gate: [], road: ['gate'], inn: ['gate'], well: ['gate'], kitchen: [], field: ['road', 'well'], angel: ['field'], stable: ['angel'] });

  // ── 성문: 문지기 셋(한 명만 참말) → 빈 등잔
  R.gate.intro = R.gate.intro.concat([
    ['asaph', 0, '등잔이 있어야 밤에 다닐 텐데. 빈 등잔 하나를 문지기들에게 맡겨 두었더니, 셋이 서로 딴소리를 하는구나.'],
    ['gilead', 1, '성문 아래 문지기 아저씨 셋이요? 셋 중에 참말을 하는 사람은 딱 한 명이래요. 나머지 둘은 저를 놀리는 거래요.', '(늘 당함)']
  ]);
  // 문지기 셋: 성문 아치 앞에 나란히(왼쪽부터 첫째 · 둘째 · 셋째). 다른 인물·탁자보다 뒤에 서도록 맨 앞에 넣는다
  R.gate.spots.unshift(
    { id: 'guard1', x: 27, y: 90, fig: 'guard1_front', h: 40, act: 'puzzle:guards', gname: '첫째' },
    { id: 'guard2', x: 35.5, y: 90, fig: 'guard2_front', h: 37, act: 'puzzle:guards', gname: '둘째' },
    { id: 'guard3', x: 44, y: 90, fig: 'guard3_front', h: 38, act: 'puzzle:guards', gname: '셋째' });
  BN.PZ.guards = function (Rm, A) {
    var S = A.S(); S.f1 = S.f1 || {};
    if (S.f1.guards) return A.toast('✔ 빈 등잔은 이미 찾았어요 — 가방에 있어요');
    var r = A.seedRnd(91), seats = [0, 1, 2];
    for (var q = 2; q > 0; q--) { var t = Math.floor(r() * (q + 1)), x = seats[q]; seats[q] = seats[t]; seats[t] = x; }
    var X = seats[0], Y = seats[1], Z = seats[2], NM = ['첫째', '둘째', '셋째'], say = [];
    say[X] = '「등잔은 내 자리 밑에 없소.」';
    say[Y] = '「등잔은 ' + NM[X] + ' 문지기 자리 밑에 있지.」';
    say[Z] = '「등잔은 내 자리 밑에 없다니까.」';
    var w = A.el('div', 'gen-wrap');
    w.innerHTML = '<div class="gd-rule">셋 가운데 <b>참말을 하는 문지기는 한 명뿐</b>이다.</div>' +
      '<div class="gd-list">' + [0, 1, 2].map(function (i) { return '<div class="gd-one"><img class="gd-face" src="img/chars/guard' + (i + 1) + '_front.webp" alt=""><div><b>' + NM[i] + ' 문지기</b><span>' + say[i] + '</span></div></div>'; }).join('') + '</div>' +
      '<p class="gen-help" style="text-align:center;margin:10px 0 6px">빈 등잔은 누구 자리 밑에 있을까?</p>' +
      '<div class="gd-seats">' + [0, 1, 2].map(function (i) { return '<button class="btn ghost" data-s="' + i + '">' + NM[i] + ' 자리 밑</button>'; }).join('') + '</div>';
    A.modal('성문 문지기 셋', w);
    w.querySelectorAll('[data-s]').forEach(function (b) {
      b.onclick = function () {
        if (A.locked('gate')) return;
        if (+b.dataset.s !== Z) return A.wrong('gate', NM[+b.dataset.s] + ' 문지기 자리 밑엔 아무것도 없다');
        S.f1.guards = 1; if (S.items.indexOf('lamp_e') < 0) S.items.push('lamp_e'); A.save(); A.sfx('ok'); A.closeModal();
        A.talk([['narr', null, NM[Z] + ' 문지기 자리 밑에서 빈 등잔이 나왔다. 기름도 불도 없다.'], ['gilead', 2, '등잔 찾았다! …그런데 기름이 한 방울도 없어요.', '(빈 등잔을 가방에 넣었다)'], ['asaph', 0, '기름은 부엌에 있겠지. 불은… 돌 두 개면 된다.']]);
      };
    });
    if (/^(127\.0\.0\.1|localhost)$/.test(location.hostname)) BN.__guards = Z;
  };
  BN.guardsAns = function (S) { var r = (function (n) { var s = (S.created % 9973) + 7 * n + 1; return function () { s = (s * 16807) % 2147483647; return s / 2147483647; }; })(91), seats = [0, 1, 2]; for (var q = 2; q > 0; q--) { var t = Math.floor(r() * (q + 1)), x = seats[q]; seats[q] = seats[t]; seats[t] = x; } return ['첫째', '둘째', '셋째'][seats[2]]; };

  // ── 나사렛 길: 상자에서 등잔 대신 부싯돌
  R.road.item = 'flint';
  R.road.done[0] = ['narr', null, '자물쇠가 풀리자 상자에서 부싯돌 두 개가 나온다.'];
  R.road.done[1] = ['gilead', 1, '돌멩이요? 빵이었으면 좋았을 텐데.'];
  R.road.done[2] = ['asaph', 0, '불을 붙이는 돌이다. 빈 등잔에 기름만 있으면 되겠구나.'];
  R.road.note = { text: '낮 지도와 밤 지도를 강·산에 맞춰 겹치자 별이 갈림길에 앉았다. 출발에서 별을 따라 베들레헴까지, 나침반으로 방향을 읽어 상자를 열고 부싯돌을 얻었다.', ref: '누가복음 2:4-5' };

  // ── 여관: 부엌 문은 잠겨 있다(방 배정을 풀고 받은 열쇠를 직접 쓴다)
  R.inn.spots.forEach(function (sp) {
    if (sp.id === 'kitchen') { sp.lock = 'keys'; sp.accept = { keys: { msg: '열쇠 꾸러미 가운데 하나가 맞았다 — 찰칵, 부엌 문이 열렸다.', go: 'kitchen' } }; sp.lockSay = [['narr', null, '부엌 문에 자물쇠가 걸려 있다.'], ['gilead', 1, '빵 냄새는 나는데 문이 잠겼어요… 열쇠가 있어야겠어요.', '(코만 문에 붙임)']]; }
    if (sp.id === 'donkey') sp.msg = '나귀 짐 사이에 쓰지 않는 긴 밧줄이 감겨 있다. 빌려 가자.';
  });
  R.inn.stay = true;
  R.inn.done = R.inn.done.concat([['narr', null, '여관 주인이 열쇠 꾸러미를 건넨다. 그리고 부엌 문을 턱으로 가리킨다.']]);

  // ── 부엌: 들어오면 기름 단지부터. 장부 판 글씨는 등잔으로 비춰야 보인다(이미 그렇게 되어 있음)
  R.kitchen.intro = R.kitchen.intro.slice(0, 3).concat([
    ['asaph', 0, '여기 어두운 구석의 글씨는 불빛 없이는 못 읽겠구나. 빈 등잔에 기름을 채우고 불을 붙여 보아라.'],
    ['gilead', 2, '…이 빵 하나만 먹어도 되겠죠?', '(이미 입에 넣음)']
  ]);

  // ── 우물: 끊어진 두레박을 줍고, 등잔과 줄 맨 두레박을 우물에 직접 쓴다
  R.well.spots.forEach(function (sp) {
    if (sp.id === 'bucket') { sp.act = 'pick:bucket_b'; sp.msg = '우물가에 줄이 짧게 끊어진 두레박이 있다. 챙겨 두자.'; }
    if (sp.id === 'wellin') sp.accept = {
      lamp: { msg: '켜진 등잔을 줄에 달아 우물 안으로 천천히 내렸다 — 벽이 희미하게 보인다.' },
      bucket: { msg: '줄 맨 두레박을 우물 도르래에 걸었다.' },
      lamp_e: { say: [['gilead', 1, '불이 없는 등잔은 내려 봤자 깜깜해요…']], noUse: true },
      bucket_b: { say: [['gilead', 1, '줄이 이렇게 짧아서는 물까지 안 닿아요.']], noUse: true }
    };
  });
  R.well.talks.gilead = [['gilead', 2, '저 아래 뭐가 반짝인 것 같아요. 동전이면 좋겠다.'], ['gilead', 1, '그런데 너무 깊고 깜깜해요. 비출 것도, 내릴 줄도 있어야겠어요.']];

  // ── 들판: 목자의 상자(지팡이 밑)를 눌러야 한다는 것이 보이게
  R.field.spots.forEach(function (sp) { if (sp.id === 'staffbox') sp.label = '📦 목자의 상자'; });
  R.field.intro = R.field.intro.map(function (l) { return /상자는 왼쪽 바위 옆 지팡이 밑에/.test(l[2]) ? ['gilead', 2, '양들이 들판에 다 흩어졌어요! 목자 아저씨들 상자는 왼쪽 바위에 기댄 지팡이 밑에 있어요. 상자부터 눌러 볼까요?'] : l; });

  // ── 마구간: 굴 안에 켜진 등잔을 쓴다
  R.stable.spots.forEach(function (sp) { if (sp.id === 'search') sp.accept = { lamp: { msg: '켜진 등잔을 높이 들었다. 굴 입구가 보인다.' }, lamp_e: { say: [['gilead', 1, '불 없는 등잔으로는 아무것도 안 보여요…']], noUse: true } }; });

  // ── 11/27 되돌리기: 1장 시험 판에서 새로 고침 때 지워졌던 물건(주운 기름·밧줄·두레박, 문지기의 빈 등잔)을 돌려놓는다
  BN.repairItems = function (S) {
    var has = function (x) { return S.items.indexOf(x) >= 0; }, add = function (x) { if (!has(x)) { S.items.push(x); fixed = 1; } }, used = function (a, b) { return !!(S.used || {})[a + ':' + b]; };
    var taken = S.taken || [], fixed = 0, f1 = S.f1 || {};
    if (taken.indexOf('oil') >= 0) add('oil');
    if (taken.indexOf('donkey') >= 0 && !has('bucket') && !used('wellin', 'bucket')) add('rope');
    if (taken.indexOf('bucket') >= 0 && !has('bucket') && !used('wellin', 'bucket')) add('bucket_b');
    if (f1.guards && !has('lamp')) add('lamp_e');
    if (S.rooms && S.rooms.road && !has('lamp')) add('flint');
    return fixed;
  };

  // ── 어두워서 못 보는 단서를 누르면: 지금 가진 물건에 맞춰 길르앗이 할 일을 말한다
  BN.darkSay = function (S, need) {
    var has = function (x) { return S.items.indexOf(x) >= 0; }, L = [['narr', null, '너무 어두워 잘 보이지 않는다.']];
    if (need !== 'lamp') return L;
    if (has('lamp_e') && has('oil') && has('flint')) L.push(['gilead', 2, '빈 등잔, 기름, 부싯돌… 다 있잖아요! 가방에서 셋을 같이 골라 「합치기」 해 봐요.']);
    else if (!has('lamp_e')) L.push(['gilead', 1, '불빛이 있어야겠어요. 성문 문지기들이 빈 등잔을 맡아 뒀다던데…']);
    else if (!has('oil')) L.push(['gilead', 1, '등잔은 있는데 기름이 없어요. 여기 부엌 어딘가 큰 기름 항아리가 있을 거예요.']);
    else if (!has('flint')) L.push(['gilead', 1, '기름은 부었는데 불을 붙일 게 없어요. 나사렛 길의 그 상자에 뭐가 있었더라?']);
    return L;
  };

  // ── 힌트(1 · 2단계는 방향, 3단계는 정답)
  function H(k, list) { BN.HINTS = BN.HINTS || {}; BN.HINTS[k] = list; if (BN.HINTS_CH1) BN.HINTS_CH1[k] = list; }
  var g0 = (BN.HINTS_CH1 && BN.HINTS_CH1.gate) || BN.HINTS.gate || [];
  H('gate', [
    '성문 가운데 문지기 셋을 눌러 보세요. 한 사람씩 「이 사람만 참말이라면?」 하고 나머지 둘의 말과 맞춰 봐요. 명부 조각은 바구니·항아리·의자 근처에도 있어요.',
    '두 사람이 「내 자리 밑엔 없다」고 하고, 한 사람이 남을 가리켜요. 가리킨 말이 참이면 참말이 둘이 돼요. ' + (g0[1] || ''),
    function (S) { return '빈 등잔: ' + BN.guardsAns(S) + ' 문지기 자리 밑 · ' + (g0[2] || ''); }
  ]);
  var w0 = BN.HINTS.well || [];
  H('well', [
    '우물에 필요한 것 셋 — 비출 것(켜진 등잔), 내릴 것(줄 맨 두레박), 작은 글씨를 볼 것(수정 조각). 우물가의 끊어진 두레박을 챙기세요.',
    '가방에서 두 개 이상 고르면 「합치기」가 돼요: 끊어진 두레박 + 밧줄(여관 나귀 짐). 다 되면 가방에서 「손에 들기」 → 우물 안을 누르기(등잔도 같은 방법). 벽 글씨: 「줄은 열넷의 반 규빗」.',
    w0[2] || '줄 길이 7 규빗'
  ]);
  var k0 = BN.HINTS.kitchen || [];
  H('kitchen', [
    '부엌 문은 여관 방 배정을 풀고 받은 열쇠로 열어요(가방 → 열쇠 「손에 들기」 → 부엌 문). 부엌의 기름 단지를 챙기고, 빈 등잔 + 기름 + 부싯돌(나사렛 길)을 「합치기」 하면 켜진 등잔. 그 불빛으로 식탁보 밑과 탁자 위를 비춰요.',
    k0[1] || '', k0[2] || ''
  ]);
  var s0 = BN.HINTS.stable || [];
  H('stable', ['굴 안은 켜진 등잔이 있어야 해요(가방 → 등잔 「손에 들기」 → 굴). ' + (s0[0] || ''), s0[1] || '', s0[2] || '']);

  if (BN.HOW) {
    BN.HOW.gate = '문지기 셋을 누르면 셋의 말이 보여요. 「한 명만 참말」을 따져 등잔 자리를 고르세요. 명부 조각은 눌러 고른 뒤 빈칸을 누르면 놓여요.';
    BN.HOW.well = '가방에서 물건을 골라 「손에 들기」 → 우물 안을 누르면 써요(켜진 등잔 · 줄 맨 두레박). 그다음 우물 안을 손가락으로 문질러 비추고, 수정 조각을 끌어 글씨에 대고 「가까이 ↔ 멀리」로 초점, 막대로 줄 길이를 정해 끌어올려요.';
  }
  if (BN.WHY) BN.WHY['성문 문지기 셋'] = '빈 등잔을 맡은 문지기 셋이 저마다 다른 말을 한다. 아삽 노인 말로는 셋 가운데 참말을 하는 이는 하나뿐이다.';
  if (BN.THINK) BN.THINK['성문 문지기 셋'] = '한 명만 참말이라면… 한 사람씩 「이 사람 말이 참이면 나머지는?」 하고 따져 볼까?';

  // ══ 11/27 어려운 문제 셋: 겹쳐 읽기(성문) → 자모 바꿔 읽기(우물) · 조건표 추리(들판) ══

  // ── 가림판: 나사렛 길 상자에서 부싯돌과 함께 나온다
  BN.ITEMS.grille = ['구멍 뚫린 가림판', 'img/items/grille.svg', '네모난 가죽에 구멍 여섯이 뚫려 있다. 무언가에 겹쳐 대는 것 같다.'];
  R.road.item2 = 'grille';
  R.road.done[0] = ['narr', null, '자물쇠가 풀리자 상자에서 부싯돌 두 개와, 구멍이 숭숭 뚫린 네모난 가죽 조각이 나온다.'];
  R.road.done[2] = ['asaph', 0, '부싯돌은 불을 붙이는 돌이다. 그 가죽은… 글자 위에 겹쳐 대는 가림판 같구나. 명부 크기와 비슷하다.'];

  // ── 성문 명부 + 가림판(겹쳐 읽기): 돌려 가며 구멍 여섯으로 읽히는 말을 찾는다 → 「두칸씩앞으로」
  R.gate.spots.forEach(function (sp) { if (sp.id === 'table') sp.accept = Object.assign(sp.accept || {}, { grille: { pz: 'grille' } }); });
  var G_TARGET = ['두', '칸', '씩', '앞', '으', '로'];
  var G_POOL = ['베', '레', '스', '헤', '론', '람', '암', '미', '나', '답', '손', '살', '몬', '보', '오', '벳', '이', '새', '다', '윗', '엘', '리', '멜', '렉', '말', '기', '룐', '유', '지', '파', '족', '속', '호', '적', '명', '부', '성', '문', '집', '길'];
  function gRot(p, k) { var y = p[0], x = p[1]; for (var i = 0; i < k; i++) { var t = y; y = x; x = 5 - t; } return [y, x]; }   // 6×6을 시계 방향으로 90°씩
  function grilleData(S) {
    var r = (function (n) { var s = (S.created % 9973) + 7 * n + 1; return function () { s = (s * 16807) % 2147483647; return s / 2147483647; }; })(93);
    var reps = []; for (var y = 0; y < 3; y++) for (var x = 0; x < 3; x++) reps.push([y, x]);
    for (var q = reps.length - 1; q > 0; q--) { var t = Math.floor(r() * (q + 1)), z = reps[q]; reps[q] = reps[t]; reps[t] = z; }
    var holes = reps.slice(0, 6).map(function (p) { return gRot(p, Math.floor(r() * 4)); }), K = 1 + Math.floor(r() * 3);   // 처음 놓인 방향(0)으로는 읽히지 않게
    var cells = []; for (var i = 0; i < 36; i++) cells.push(G_POOL[Math.floor(r() * G_POOL.length)]);
    holes.map(function (h) { return gRot(h, K); }).sort(function (a, b) { return a[0] * 6 + a[1] - (b[0] * 6 + b[1]); }).forEach(function (p, i) { cells[p[0] * 6 + p[1]] = G_TARGET[i]; });
    return { holes: holes, K: K, cells: cells };
  }
  BN.PZ.grille = function (Rm, A) {
    var S = A.S(), D = grilleData(S), cur = 0, w = A.el('div', 'gen-wrap');
    function draw() {
      var open = {}; D.holes.forEach(function (h) { var p = gRot(h, cur); open[p[0] * 6 + p[1]] = 1; });
      w.innerHTML = '<div class="gr-wrap"><div class="gr-grid">' + D.cells.map(function (c, i) { return '<span class="' + (open[i] ? 'hole' : 'cover') + '">' + c + '</span>'; }).join('') + '</div><i class="gr-notch" style="transform:rotate(' + (cur * 90) + 'deg)"><b>▲</b></i></div>' +
        '<div class="gr-row"><button class="btn ghost" id="grRot">⟳ 가림판 돌리기</button><span class="gr-turn">' + ['처음', '오른쪽으로 한 번', '두 번', '세 번'][cur] + '</span></div>' +
        '<div class="rm-ans"><input id="grIn" maxlength="10" placeholder="구멍으로 읽은 말" autocomplete="off" spellcheck="false"><button class="btn gold" id="grOk">적기</button></div>' +
        (S.f1 && S.f1.grille ? '<p class="gen-help" style="text-align:center">✔ 이미 읽어 수첩에 적었어요</p>' : '');
      w.querySelector('#grRot').onclick = function () { cur = (cur + 1) % 4; draw(); };
      w.querySelector('#grOk').onclick = function () {
        if (A.locked('gate')) return;
        var v = (w.querySelector('#grIn').value || '').replace(/\s/g, '');
        if (v === G_TARGET.join('')) { S.f1 = S.f1 || {}; if (!S.f1.grille) { S.f1.grille = 1; S.notes.push({ text: '성문 명부에 가림판을 겹쳐 돌려 읽은 말: 「두 칸씩 앞으로」.', ref: '' }); } A.save(); A.sfx('ok'); A.closeModal(); A.talk([['asaph', 0, '「두 칸씩 앞으로」라… 무엇을 앞으로 옮기라는 말이냐. 어디선가 뒤틀린 글자를 만나면 떠올려라.']]); }
        else if (v) A.wrong('gate', '그런 말은 읽히지 않는다');
      };
    }
    draw(); A.modal('명부와 가림판', w);
    if (/^(127\.0\.0\.1|localhost)$/.test(location.hostname)) BN.__grille = { K: D.K, word: G_TARGET.join('') };
  };
  if (BN.WHY) BN.WHY['명부와 가림판'] = '나사렛 길 상자에서 나온 가림판을 성문 명부 위에 겹쳤다. 구멍 여섯 사이로 명부 글자가 보인다.';
  if (BN.THINK) BN.THINK['명부와 가림판'] = '어느 쪽으로 돌려야 말이 되지? 구멍으로 보이는 글자를 왼쪽 위부터 차례로 읽어 볼까?';

  // ── 우물 벽 글씨는 자모 암호(수정으로 보이는 것은 뒤틀린 글자) + 우물 돌 테두리의 자모 차례
  BN.WELL_TXT = '큽찰 챱둥 디얒';
  R.well.spots.push({ id: 'cl_w_order', x: 70, y: 56, w: 7, h: 9, act: 'clue:w_order', msg: '우물 돌 테두리에 글자 차례가 빙 둘러 새겨져 있다', note: '우물 돌 테두리 — 자음 「ㄱ ㄴ ㄷ ㄹ ㅁ ㅂ ㅅ ㅇ ㅈ ㅊ ㅋ ㅌ ㅍ ㅎ」 · 모음 「ㅏ ㅑ ㅓ ㅕ ㅗ ㅛ ㅜ ㅠ ㅡ ㅣ」 — 끝에서 다시 처음으로 빙 이어진다.' });
  R.well.note = { text: '우물 벽 글씨는 뒤틀린 글자였다(수정으로 읽음): 「큽찰 챱둥 디얒」 → 성문 가림판의 「두 칸씩 앞으로」와 우물 테두리의 자모 차례로 되돌리면 「줄은 일곱 규빗」 → 7. 두레박에서 찢긴 양피지 조각 ①(「여드…」)을 얻었다.', ref: '사무엘하 23:15' };

  // ── 들판: 방울 대신 색 끈. 바위의 「목자의 당번 기록」으로 어느 끈이 어느 경점인지 추리
  BN.fieldLog = function () {
    if (!BN.ribOfWatch) return [];
    var c = function (w) { return BN.ribOfWatch(w)[0]; };
    return ['밤은 저물 때 → 밤중 → 닭 울 때 → 새벽 차례로 지킨다.',
      '「' + c(3) + ' 끈 양은 저물 때 양도, 밤중 양도 아니다.」',
      '「' + c(1) + ' 끈 양은 ' + c(2) + ' 끈 양보다 먼저 지킨 경점의 양이다.」',
      '「' + c(0) + ' 끈 양 바로 다음 경점이 ' + c(1) + ' 끈 양이다.」',
      '「' + c(2) + ' 끈 양은 새벽 양이 아니다.」'];
  };
  var logSpot = { id: 'cl_f_log', x: 26, y: 60, w: 7, h: 9, act: 'clue:f_log', msg: '바위에 목자들의 당번 기록이 긁혀 있다 — 수첩에 적었다' };
  Object.defineProperty(logSpot, 'note', { get: function () { return '목자의 당번 기록 — ' + BN.fieldLog().join(' '); } });
  R.field.spots.push(logSpot);
  BN.NEED = BN.NEED || {};
  BN.NEED.herd = { c: ['f_log'], say: ['asaph', 0, '양을 몰기 전에, 목자들이 어느 끈 양을 어느 때 맡았는지부터 알아야 한다. 바위를 살펴보아라.'] };
  R.field.intro = R.field.intro.map(function (l) { return /무늬 방울을 달았구나/.test(l[2]) ? ['asaph', 0, '양마다 목에 색 끈을 매어 두었구나. 목자는 밤을 넷으로 나누어 지킨다고 들었다.'] : l; });
  R.field.note = { text: '바위의 당번 기록으로 끈 색마다 경점을 따져, 저물 때 → 밤중 → 닭 울 때 → 새벽 차례로 그 양의 울음 횟수를 넣어 상자를 열었다. 하늘 원판의 네 별을 지팡이 눈금에 세웠다.', ref: '누가복음 2:8 · 마가복음 13:35' };
  if (BN.THINK) {
    BN.THINK['양 몰기'] = '양마다 끈 색이 다르네… 바위의 당번 기록을 따지면 어느 끈이 어느 때 양인지 알 수 있겠지?';
    BN.THINK['목자의 상자'] = '자물쇠 칸이 넷… 밤을 넷으로 나눈 차례대로, 그 경점 끈을 맨 양이 몇 번 울었는지 넣으면 될까?';
  }

  // ── 힌트
  var gH = BN.HINTS.gate || [];
  H('gate', [gH[0] + ' 나사렛 길 상자에서 가림판을 얻으면, 손에 들고 명부 탁자에 대 보세요.',
    gH[1] + ' 가림판은 ⟳로 돌려 가며, 구멍 여섯으로 보이는 글자를 왼쪽 위부터 차례로 읽어요 — 말이 되는 방향은 하나뿐.',
    function (S) { return (typeof gH[2] === 'function' ? gH[2](S) : gH[2]) + ' · 가림판: 「두칸씩앞으로」'; }]);
  H('well', [
    '우물에 필요한 것 — 켜진 등잔, 줄 맨 두레박, 수정 조각. 수정으로 본 벽 글씨는 뒤틀린 암호예요. 우물 돌 테두리(오른쪽)의 자모 차례와, 성문 명부에 가림판을 대어 읽은 말이 열쇠.',
    '「두 칸씩 앞으로」: 자음은 ㄱ ㄴ ㄷ … ㅎ, 모음은 ㅏ ㅑ ㅓ … ㅣ 차례에서 글자마다 두 칸씩 앞으로(받침도). 예: 큽 = ㅋ ㅡ ㅂ → ㅈ ㅜ ㄹ = 줄. 끝에서는 뒤로 빙 돌아요(ㅏ의 두 칸 앞 = ㅡ).',
    '「큽찰 챱둥 디얒」 → 「줄은 일곱 규빗」 → 줄 길이 7'
  ]);
  H('field', [
    '바위(모닥불 왼쪽)에 「목자의 당번 기록」이 있어요. 그걸 찾아야 상자가 열려요. 양을 하나씩 눌러 끈 색과 울음 횟수를 세어 두세요.',
    '당번 기록 다섯 줄을 차례로 따져요: 새벽이 될 수 있는 끈부터 정하면 나머지가 하나씩 풀려요. 우리 시각은 저물 때 = 오후 7시 · 밤중 = 밤 10시 · 닭 울 때 = 새벽 1시 · 새벽 = 새벽 4시.',
    function () { var c = function (w) { return BN.ribOfWatch ? BN.ribOfWatch(w)[0] : ''; }; return '저물 때 ' + c(0) + ' · 밤중 ' + c(1) + ' · 닭 울 때 ' + c(2) + ' · 새벽 ' + c(3) + ' → 자물쇠 ' + (BN.fieldCode ? BN.fieldCode() : '') + ' · 그다음 원판을 돌려 큰 별 넷을 눈금에 맞추고 2초.'; }
  ]);
  var rH = BN.HINTS.road || [];
  H('road', [rH[0] || '', rH[1] || '', function (S) { return (typeof rH[2] === 'function' ? rH[2](S) : rH[2]) + ' · 상자 안: 부싯돌과 가림판'; }]);
  if (BN.HOW) {
    BN.HOW.well = '가방에서 물건을 골라 「손에 들기」 → 우물 안을 누르면 써요(켜진 등잔 · 줄 맨 두레박). 우물 안을 문질러 비추고, 수정 조각을 끌어 글씨에 대고 「가까이 ↔ 멀리」로 초점. 보이는 글씨는 뒤틀린 암호 — 되돌려 읽은 길이만큼 줄을 내려 끌어올려요.';
    BN.HOW.field = '바위의 당번 기록을 찾은 뒤 상자를 누르면 양 몰기 — 끈 색으로 경점을 따져 그 시각 우리로. 숫자 자물쇠는 경점 차례대로 그 끈 양의 울음 횟수(방에서 양을 눌러 세요), 별 원판은 돌려 맞추고 2초.';
    BN.HOW.gate = BN.HOW.gate + ' 가림판(나사렛 길)은 손에 들고 명부 탁자에 대면 겹쳐져요 — ⟳로 돌려 구멍으로 읽어요.';
  }
})(window.BN);
