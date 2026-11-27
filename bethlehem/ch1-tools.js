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

  // ── 방이 열리는 차례: 성문을 풀면 여관 · 나사렛 길 · 우물이 한꺼번에 열린다(어디부터 갈지는 고르기)
  Object.assign(BN.UNLOCK, { gate: [], road: ['gate'], inn: ['gate'], well: ['gate'], kitchen: [], field: ['road', 'well'], angel: ['field'], stable: ['angel'] });

  // ── 성문: 문지기 셋(한 명만 참말) → 빈 등잔
  R.gate.intro = R.gate.intro.concat([
    ['asaph', 0, '등잔이 있어야 밤에 다닐 텐데. 빈 등잔 하나를 문지기들에게 맡겨 두었더니, 셋이 서로 딴소리를 하는구나.'],
    ['gilead', 1, '셋 중에 참말을 하는 사람은 딱 한 명이래요. 나머지 둘은 저를 놀리는 거래요.', '(늘 당함)']
  ]);
  R.gate.spots.push({ id: 'guards', x: 40, y: 47, w: 18, h: 30, act: 'puzzle:guards' });
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
      '<div class="gd-list">' + [0, 1, 2].map(function (i) { return '<div class="gd-one"><b>' + NM[i] + ' 문지기</b><span>' + say[i] + '</span></div>'; }).join('') + '</div>' +
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

  // ── 마구간: 굴 안에 켜진 등잔을 쓴다
  R.stable.spots.forEach(function (sp) { if (sp.id === 'search') sp.accept = { lamp: { msg: '켜진 등잔을 높이 들었다. 굴 입구가 보인다.' }, lamp_e: { say: [['gilead', 1, '불 없는 등잔으로는 아무것도 안 보여요…']], noUse: true } }; });

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
})(window.BN);
