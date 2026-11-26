// 「베들레헴의 밤」 2장 「여드레째 · 사십일째」(2026-11-26)
// 성경 인물(시므온)의 말은 개역개정 원문 그대로(bskorea 대조: 눅 2:21-38, 레 12:2-8, 마 1:21). 안나·요셉·마리아는 말하지 않는다.
// 아삽 노인·길르앗은 가상 인물(위트 있게, 성경 사건을 바꾸지 않음).
(function (BN) {
  BN.CHARS.simeon = { name: '시므온', face: 'simeon' };
  BN.CHARS.anna = { name: '안나', face: 'anna' };
  BN.CHARS.priest = { name: '성전 문지기', face: 'priest' };
  BN.ITEMS.doves = ['산비둘기 한 쌍', 'img/items/doves.webp', '제물로 드릴 비둘기. 새장을 흔들지 말 것.'];
  BN.ITEMS.weights = ['세겔 추', 'img/items/weights.webp', '1 · 2 · 4 · 8 · 16 세겔'];

  // 장 정보: 지도와 시작 방
  BN.CHAPTERS = BN.CHAPTERS || {};
  BN.CHAPTERS[1] = { title: '그 밤', map: 'A' };
  BN.CHAPTERS[2] = { title: '여드레째 · 사십일째', map: 'B', start: 'house8' };
  BN.MAPS = BN.MAPS || {};
  BN.MAPS.A = { img: 'img/maps/mapA@2x.webp', bgm: 'bgm02_village' };
  BN.MAPS.B = { img: 'img/maps/mapB@2x.webp', bgm: 'bgm12_temple' };
  BN.SPOTS.push(
    { id: 'climb', name: '예루살렘으로 오르는 길', icon: '🕊', x: 49, y: 90, ch: 2 },
    { id: 'tgate', name: '성전 문', icon: '🚪', x: 49, y: 70, ch: 2 },
    { id: 'court', name: '성전 뜰 · 비둘기 장수', icon: '⚖', x: 13, y: 46, ch: 2 },
    { id: 'porch', name: '솔로몬 행각', icon: '⏳', x: 42, y: 33, ch: 2 },
    { id: 'anna', name: '기둥 곁 기도처', icon: '🪔', x: 22, y: 22, ch: 2 }
  );
  Object.assign(BN.UNLOCK, { house8: [], climb: ['house8'], tgate: ['climb'], court: ['tgate'], porch: ['tgate'], anna: ['court', 'porch'] });
  Object.assign(BN.STAMPS, { court: '함', porch: '께' });

  var R = BN.ROOMS;
  // 1 여드레째 집: 흩어진 이름 조각 여섯(예·수 + 임·마·누·엘) — 「천사가 일컬은 이름」은 눅 2:21
  R.house8 = {
    title: '여드레째 · 이름', focus: 45, bgm: 'bgm11_eighth', bg: 'img/places/house8.webp', noBack: true,
    intro: [
      ['asaph', 0, '여드레째 되는 날이다. 율법대로 아기에게 이름을 주는 날이지.'],
      ['gilead', 0, '명부의 그 빈칸이요? 이름이라면 제가 지어 드릴 수도 있는데요. 「빵」 어때요?', '(진지함)'],
      ['asaph', 0, '이름은 이미 정해져 있었다. 사람이 지은 이름이 아니다.'],
      ['gilead', 2, '그런데… 아까 바구니를 엎어서 이름 조각들이 집 안에 흩어졌어요.', '(또)']
    ],
    spots: [
      { id: 'n1', x: 40, y: 17, w: 6, h: 9, act: 'tile:예', msg: '선반 위 항아리 안에 글자 조각이 들어 있다.' },
      { id: 'n2', x: 51, y: 70, w: 7, h: 9, act: 'tile:수', msg: '탁자 밑 자루 옆에 글자 조각이 떨어져 있다.' },
      { id: 'n3', x: 9, y: 80, w: 12, h: 14, act: 'tile:임', msg: '큰 바구니 곡식 속에 글자 조각이 묻혀 있다.' },
      { id: 'n4', x: 20, y: 62, w: 8, h: 10, act: 'tile:마', msg: '의자 위 천 사이에 글자 조각이 끼어 있다.' },
      { id: 'n5', x: 85, y: 30, w: 6, h: 10, act: 'tile:누', msg: '걸어 둔 그물 바구니 안에 글자 조각이 있다.' },
      { id: 'n6', x: 70, y: 50, w: 10, h: 8, act: 'tile:엘', msg: '베틀 실 사이에 글자 조각이 걸려 있다.' },
      { id: 'table', x: 44, y: 52, w: 34, h: 8, act: 'puzzle:name' },
      { id: 'asaph', x: 8, y: 101, fig: 'asaph_front', h: 64, act: 'talk:asaph' },
      { id: 'gilead', x: 90, y: 102, fig: 'gilead_front', h: 52, act: 'talk:gilead' }
    ],
    talks: {
      asaph: [['asaph', 0, '천사가 일컬은 이름이다. 누가복음 2장 21절.']],
      gilead: [['gilead', 1, '임마누엘도 멋진 이름인데요. 그건 어디 나오는 말이었죠?', '(괜히 헷갈리게 함)']]
    },
    done: [
      ['asaph', 0, '아들을 낳으리니 이름을 예수라 하라 이는 그가 자기 백성을 그들의 죄에서 구원할 자이심이라 하니라', '', '마태복음 1:21'],
      ['asaph', 0, '명부의 빈칸에 이름을 적었다. 이제 정결예식의 날이 차면 예루살렘으로 올라가야 한다.'],
      ['gilead', 1, '예루살렘! 성전 앞 빵이 그렇게 맛있대요.', '(배고픔 지수 91%)']
    ],
    note: { text: '여드레째 — 이름 「예수」(눅 2:21). 「자기 백성을 그들의 죄에서 구원할 자」(마 1:21)', ref: '눅 2:21 · 마 1:21' }
  };
  // 2 오르는 길: 폰 기울이기(또는 손가락)로 새장을 흔들지 않고 산비둘기 둘을 데리고 성전 문까지
  R.climb = {
    title: '예루살렘으로 오르는 길', focus: 50, bgm: 'bgm12_temple', bg: 'img/places/climb.webp',
    intro: [
      ['asaph', 0, '정결예식의 날이 차서, 그 가족도 아기를 데리고 예루살렘에 올라간다.'],
      ['gilead', 0, '제물로 드릴 비둘기는 우리가 맡았어요. 그런데 계단이 엄청 많은데요….', '(새장이 벌써 푸드덕)'],
      ['asaph', 0, '새장을 벽에 부딪치지 마라. 놓친 비둘기 둘을 다 찾아 데려가야 한다.']
    ],
    spots: [
      { id: 'stairs', x: 50, y: 72, w: 60, h: 44, act: 'puzzle:climb' },
      { id: 'gilead', x: 86, y: 103, fig: 'gilead_front', h: 50, act: 'talk:gilead' }
    ],
    talks: { gilead: [['gilead', 2, '폰을 살살 기울여 보세요. 아니면 손가락으로 살살….', '(본인은 세 번 넘어짐)']] },
    item: 'doves',
    done: [['gilead', 1, '두 마리 다 무사해요! 저도 무사하고요.', '(다리 후들)']]
  };
  // 3 성전 문: 사내아이를 낳은 여인의 정결 기한 — 레 12:2(이레) + 12:4(삼십삼 일) = 40
  R.tgate = {
    title: '성전 문', focus: 62, bgm: 'bgm12_temple', bg: 'img/places/tgate.webp',
    intro: [
      ['asaph', 0, '성전 문지기는 날수를 묻는다. 정결하게 되는 기한이 찼는지.'],
      ['gilead', 2, '아기가 태어난 지 며칠째죠? 저는 날짜를 빵으로 세는데….'],
      ['asaph', 0, '율법에 적힌 날수를 세어 보아라. 문 옆 돌판에 구절이 있다.']
    ],
    spots: [
      { id: 'doors', x: 66, y: 46, w: 22, h: 52, act: 'puzzle:days' },
      { id: 'tablet', x: 92, y: 58, w: 10, h: 14, act: 'talk:tablet' },
      { id: 'priest', x: 40, y: 98, fig: 'priest_front', h: 58, act: 'talk:priest' }
    ],
    talks: {
      tablet: [['narr', 0, '돌판에 새겨진 글: 「레위기 12장 2절 · 12장 4절」']],
      priest: [['gilead', 0, '(문지기는 아무 말 없이 문의 숫자 자물쇠만 가리킨다)']]
    },
    done: [['asaph', 0, '날수가 찼다. 모세의 법대로 정결예식의 날이다.'], ['gilead', 0, '문이 열렸어요! …그런데 제물은 어디서 사죠?']]
  };
  // 4 성전 뜰: ① 가난한 사람의 제물(레 12:8, 눅 2:24) ② 장수의 저울 — 세겔 추 1·2·4·8·16으로 새장 무게를 다섯 번 안에
  R.court = {
    title: '성전 뜰 · 비둘기 장수', focus: 30, bgm: 'bgm06_inn', bg: 'img/places/court.webp',
    intro: [
      ['gilead', 0, '와, 비둘기 장수다! 우리 비둘기보다 통통해요.'],
      ['asaph', 0, '제물은 율법대로 드린다. 어린 양을 바치기에 힘이 미치지 못하는 사람이 무엇을 드리는지, 레위기 12장 8절에 있다.'],
      ['asaph', 0, '그리고 장수의 저울은 믿지 마라. 새장 무게는 네 손으로 달아 보아라.']
    ],
    spots: [
      { id: 'scale', x: 26, y: 60, w: 16, h: 18, act: 'puzzle:scale' },
      { id: 'coins', x: 80, y: 68, w: 24, h: 12, act: 'talk:coins' },
      { id: 'asaph', x: 58, y: 101, fig: 'asaph_front', h: 60, act: 'talk:asaph' }
    ],
    talks: {
      coins: [['gilead', 2, '동전 탁자예요. 비싼 것부터 싼 것까지 값표가 붙어 있네요.', '(제물 고를 때 헷갈리지 말래요)']],
      asaph: [['asaph', 0, '추는 다섯 개, 저울에 올릴 기회도 다섯 번. 큰 추부터 생각해라.']]
    },
    done: [['asaph', 0, '저울이 맞았다. 이제 그 가족이 율법대로 제사할 수 있겠구나.'], ['gilead', 1, '장수 아저씨가 무게를 두 세겔이나 속였어요!', '(정의감 상승)']]
  };
  // 5 솔로몬 행각: 시므온의 기다림 — 60초 동안 아무것도 누르지 않아야 시므온이 온다(눅 2:25 「기다리는 자」)
  R.porch = {
    title: '솔로몬 행각', focus: 55, bgm: 'bgm13_simeon', bg: 'img/places/porch.webp',
    intro: [
      ['asaph', 0, '여기는 솔로몬 행각. 오래 기다리는 사람들이 오가는 곳이다.'],
      ['gilead', 0, '기다린다고요? 뭘요? 누구를요?'],
      ['asaph', 0, '누가복음 2장 25절. …서두르는 사람은 못 만난다.']
    ],
    spots: [
      { id: 'pillars', x: 56, y: 58, w: 22, h: 26, act: 'puzzle:wait' },
      { id: 'asaph', x: 20, y: 101, fig: 'asaph_front', h: 62, act: 'talk:asaph' },
      { id: 'gilead', x: 86, y: 102, fig: 'gilead_front', h: 50, act: 'talk:gilead' }
    ],
    talks: {
      asaph: [['asaph', 0, '의롭고 경건하여 이스라엘의 위로를 기다리는 자라.', '', '누가복음 2:25']],
      gilead: [['gilead', 2, '기다리는 거 제일 못 하는데….', '(벌써 세 번 두리번)']]
    },
    done: [
      ['simeon', 0, '주재여 이제는 말씀하신 대로 종을 평안히 놓아 주시는도다', '', '누가복음 2:29'],
      ['simeon', 1, '내 눈이 주의 구원을 보았사오니', '', '누가복음 2:30'],
      ['simeon', 1, '이는 만민 앞에 예비하신 것이요', '', '누가복음 2:31'],
      ['simeon', 2, '이방을 비추는 빛이요 주의 백성 이스라엘의 영광이니이다', '', '누가복음 2:32'],
      ['gilead', 0, '…', '(처음으로 조용함)']
    ],
    note: { text: '시므온 — 「내 눈이 주의 구원을 보았사오니」', ref: '눅 2:25-32' }
  };
  // 6 기도처: 안나 — 지파 · 아버지 · 나이(눅 2:36-37). 안나는 말하지 않는다.
  R.anna = {
    title: '기둥 곁 기도처', focus: 30, bgm: 'bgm13_simeon', bg: 'img/places/anna.webp',
    intro: [
      ['asaph', 0, '저 기둥 곁에서 늘 기도하는 이가 있다. 성전을 떠나지 않는다지.'],
      ['gilead', 0, '저분은 누구세요? 어느 집안이에요? 연세는요?', '(질문 폭발)'],
      ['asaph', 0, '물어보지 말고 읽어 보아라. 누가가 다 적어 두었다.']
    ],
    spots: [
      { id: 'lamp', x: 13, y: 60, w: 10, h: 10, act: 'puzzle:anna' },
      { id: 'annaf', x: 33, y: 92, fig: 'anna_front', h: 56, act: 'talk:anna' },
      { id: 'gilead', x: 88, y: 102, fig: 'gilead_front', h: 50, act: 'talk:gilead' }
    ],
    talks: {
      anna: [['narr', 0, '(그는 눈을 감은 채 기도하고 있다. 곁의 등잔이 조용히 타고 있다.)']],
      gilead: [['gilead', 2, '일곱 해…? 아, 그건 결혼하고 함께 산 햇수래요. 나이는 따로요!', '(누가복음 2장 36~37절)']]
    },
    done: [['asaph', 0, '마침 이 때에 나아와서 하나님께 감사하고 예루살렘의 속량을 바라는 모든 사람에게 그에 대하여 말하니라', '', '누가복음 2:38']],
    chapterEnd: 2
  };

  BN.CH_END = BN.CH_END || {};
  BN.CH_END[2] = {
    body: '오래 기다린 사람들이 아기를 알아보았습니다.<br><br><span style="font-family:var(--serif);color:var(--gold)">「보라 이는 이스라엘 중 많은 사람을 패하거나 흥하게 하며 비방을 받는 표적이 되기 위하여 세움을 받았고」</span><br><span style="font-size:12px">누가복음 2:34</span>',
    next: '3장 「동방에서 온 손님」으로 이어집니다'
  };

  BN.FX = BN.FX || {};
  Object.assign(BN.FX, {
    house8: { rays: [[12, 8, 520, -24]], dust: 40, stars: false },
    climb: { stars: false, dust: 16, lights: [[28, 37, 60], [75, 37, 60], [56, 26, 50]] },
    tgate: { stars: false, dust: 18, lights: [[27, 61, 70], [95, 59, 70]] },
    court: { stars: false, dust: 20 },
    porch: { stars: false, dust: 34, lights: [[76, 18, 70], [77, 34, 40]] },
    anna: { stars: false, dust: 36, rays: [[22, 0, 480, -18]], lights: [[15, 59, 80]] }
  });
  Object.assign(BN.HINTS, {
    house8: ['글자 조각은 여섯. 항아리 안, 탁자 밑, 곡식 바구니, 의자 위 천, 걸린 그물 바구니, 베틀을 눌러 보세요.', '누가복음 2장 21절 — 잉태하기 전에 천사가 일컬은 이름. 임마누엘은 마태복음 1장 23절의 다른 말이에요.', '예 → 수'],
    climb: ['폰을 기울이거나(아이폰은 처음 누를 때 허락) 화면을 손가락으로 끌면 새장이 따라와요. 벽에 세게 부딪히면 처음부터예요.', '비둘기 두 마리를 먼저 다 데리고 맨 위 문으로 가야 해요. 천천히 움직이면 부딪혀도 괜찮아요.', '왼쪽 위 비둘기 → 오른쪽 가운데 비둘기 → 맨 위 가운데 문'],
    tgate: ['돌판의 두 구절을 성경에서 찾아 날수를 더해요.', '레 12:2 「이레 동안」 + 레 12:4 「삼십삼 일」', '40'],
    court: ['먼저 레위기 12장 8절의 제물을 고르세요. 그다음 추를 올리고 「저울 놓기」를 눌러 기울기를 봐요.', '큰 추(16)부터: 오른쪽이 내려가면 빼고 다음 추(8), 올라가면 두고 다음 추 — 다섯 번이면 꼭 맞아요.', '제물: 산비둘기 두 마리. 무게는 사람마다 달라요 — 16→8→4→2→1 순서로 하나씩 정하면 됩니다.'],
    porch: ['누가복음 2장 25절: 시므온은 「기다리는 자」였어요.', '기둥 사이를 누른 뒤에는 아무것도 누르지 말고 모래시계가 다 찰 때까지 기다려요(60초).', '아무것도 누르지 않고 60초 기다리기'],
    anna: ['등잔 곁 자물쇠는 지파 · 아버지 · 나이, 세 칸이에요.', '누가복음 2장 36~37절. 「일곱 해」는 결혼 후 함께 산 햇수예요.', '아셀 · 바누엘 · 84']
  });
})(window.BN);
