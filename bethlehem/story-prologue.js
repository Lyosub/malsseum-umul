// 「베들레헴의 밤」 프롤로그 「우물에 빠진 밤」(2026-11-26 전도사님 결정)
// 왜 갇혔나: 성탄 두루마리가 찢겨 흩어지고, 나는 말씀우물 속으로 빨려 들어갔다.
// 왜 나가야 하나: 두루마리의 마지막 문장(도장 열두 글자)이 다시 이어져야 우물 문이 열린다.
// 우물지기는 길만 안내한다(말씀·은혜를 준다고 쓰지 않는다). 가상 인물의 말이므로 성경 원문 제한은 없다.
(function (BN) {
  BN.CHARS.keeper = { name: '우물지기', face: 'keeper' };

  // 컷 그림이 오기 전에는 있는 그림으로 대신한다(컷_P1·P2가 오면 img/cuts/p1.webp, p2.webp로 바꿈)
  BN.PROLOGUE = [
    ['img/cuts/p1.webp', '12월 24일 밤.<br>잠들기 전, 말씀우물을 열었다.', '', 'center'],
    ['img/cuts/p1.webp', '화면 속 우물에서<br>금빛이 새어 나오기 시작했다.', '', 'center'],
    ['img/cuts/p2.webp', '찢긴 두루마리 조각들이 우물 아래로 빨려 들어간다.<br>— 그리고, 나도.', '', 'center']
  ];
  BN.PROLOGUE_FALLBACK = { 'img/cuts/p1.webp': 'img/maps/mapA.webp', 'img/cuts/p2.webp': 'img/places/well.webp' };

  // 오프닝(베들레헴) 마지막 장면 문구를 프롤로그에 이어지게
  BN.OPENING[3] = ['img/maps/mapA.webp', '눈을 떠 보니 베들레헴 성문 곁.<br>나는 늙은 서기관 아삽의 견습생이 되어 있었다.', '', '60% 85%'];

  BN.ROOMS.wellroom = {
    title: '우물 바닥 · 두루마리 방', focus: 50, bgm: 'bgm05_opening', bg: 'img/places/wellroom.webp', noBack: true, prologue: true,
    intro: [
      ['keeper', 1, '앗, 너도 빨려 들어왔구나! 여기는 말씀우물 맨 아래, 두루마리 방이야.'],
      ['keeper', 0, '성탄 두루마리가 찢어지면서, 이야기 조각들이 2천 년 전 베들레헴으로 흩어져 버렸어.'],
      ['keeper', 0, '저기 둥근 돌문이 우물 밖으로 나가는 문이야. 그런데 두루마리의 마지막 문장이 다시 이어져야만 열려.'],
      ['me', 0, '마지막 문장이 뭔데?'],
      ['keeper', 2, '나도 다 기억이 안 나…. 바닥에 떨어진 두루마리 조각부터 찾아 보자. 세 조각이야.', '(그림 속을 직접 눌러서 찾아요)']
    ],
    spots: [
      { id: 'scrap1', x: 15, y: 92, w: 10, h: 9, act: 'scrap:1', msg: '돌문 왼쪽 바닥에 두루마리 조각이 떨어져 있다.' },
      { id: 'scrap2', x: 25, y: 83, w: 8, h: 7, act: 'scrap:2', msg: '등잔 불빛 아래 바닥에 조각이 하나 더 있다.' },
      { id: 'scrap3', x: 71, y: 90, w: 12, h: 10, act: 'scrap:3', msg: '돌문 오른쪽 바닥에 젖은 조각이 있다.' },
      { id: 'door', x: 50, y: 44, w: 28, h: 62, act: 'puzzle:wellscroll' },
      { id: 'keeper', x: 88, y: 99, fig: 'keeper_front', h: 30, act: 'talk:keeper' }
    ],
    talks: {
      keeper: [['keeper', 0, '조각 세 개를 다 찾으면 돌문 앞에서 맞춰 보자. 끌어서 둘러보면 숨은 곳이 보일 거야.']]
    },
    done: [
      ['keeper', 1, '맞았다! 마태복음 1장 23절…. 마지막 문장은 그 구절 끝의 열두 글자야.'],
      ['keeper', 0, '그 열두 글자가 베들레헴의 밤 곳곳에 도장으로 숨어 있어. 다 모아 오면 이 문이 열려.'],
      ['me', 0, '2천 년 전으로 가라고?'],
      ['keeper', 2, '길은 내가 알려 줄 수 있지만, 문장은 네가 찾아야 해. 자, 저 별빛을 따라가!', '(도장 열두 개 = 탈출 열쇠)']
    ]
  };
  BN.FX = BN.FX || {};
  BN.FX.wellroom = { grade: { vig: .4 }, rays: [[50, -4, 520, 0]], lights: [[21, 56, 110], [80, 56, 110]], stars: false, dust: 30 };
  BN.HINTS = BN.HINTS || {};
  BN.HINTS.wellroom = ['조각은 돌문 앞 바닥에 흩어져 있어요. 화면을 좌우로 끌어 왼쪽 등잔 아래까지 보세요.', '돌문을 눌러 세 조각을 위에서부터 이어지게 바꿔 놓아요(두 조각을 차례로 누르면 자리가 바뀌어요).', '찢긴 선이 이어지는 순서: 「마태복음」 → 「1장」 → 「23절」'];
})(window.BN);
