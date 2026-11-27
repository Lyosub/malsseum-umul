// 「베들레헴의 밤」 4장 「별이 머문 집」(2026-11-26)
// 성경 인물의 말·본문은 개역개정 원문 그대로(bible.py 대조: 마 1:23, 2:6-18, 사 7:14, 9:6, 미 5:2, 호 11:1, 렘 31:15, 눅 2:11, 시 72:15, 출 30:34, 요 19:39).
// 요셉·마리아는 말하지 않는다. 아삽 노인·길르앗·여관 주인의 말은 가상(성경 사건을 바꾸지 않음).
(function (BN) {
  BN.CHAPTERS[4] = { title: '별이 머문 집', map: 'A4', start: 'nightroad' };
  BN.MAPS.A4 = { img: 'img/maps/mapA@2x.webp', bgm: 'bgm18_worship' };
  BN.SPOTS.push(
    { id: 'innl', name: '몇 달 뒤의 여관', icon: '🏠', x: 50, y: 46, ch: 4 },
    { id: 'door', name: '그 집 문 앞', icon: '🚪', x: 66, y: 54, ch: 4 },
    { id: 'worship', name: '그 집 안', icon: '✦', x: 61, y: 64, ch: 4 },
    { id: 'nightroad', name: '베들레헴 밤길', icon: '⭐', x: 10, y: 38, ch: 4 }
  );
  Object.assign(BN.UNLOCK, { nightroad: [], innl: ['nightroad'], door: ['innl'], worship: ['door'] });
  Object.assign(BN.STAMPS, { worship: '시' });

  var R = BN.ROOMS;
  // 1 베들레헴 밤길: 별이 머물러 서는 집(마 2:9) + 두루마리 조각 A
  R.nightroad = {
    title: '베들레헴 밤길', focus: 60, bgm: 'bgm16_star', bg: 'img/places/nightroad.webp', noBack: true,
    intro: [
      ['asaph', 0, '박사들은 왕의 말을 듣고 예루살렘을 떠났다. 베들레헴으로 가는 밤길이다.'],
      ['gilead', 0, '별이 또 움직여요! 저 별은 길을 아나 봐요.', '(감탄)'],
      ['asaph', 0, '잘 보아라. 별은 지붕마다 잠깐 쉬어 가지만, 머물러 서는 곳은 한 곳뿐이다.']
    ],
    spots: [
      { id: 'star_night', x: 88, y: 15, w: 4, h: 7, act: 'star:6', night: true },
      { id: 'sky', x: 62, y: 16, w: 60, h: 26, act: 'puzzle:starstop' },
      { id: 'rock', x: 86, y: 72, w: 16, h: 16, act: 'puzzle:pieceA' },
      { id: 'camels', x: 63, y: 42, w: 10, h: 8, act: 'talk:camels' },
      { id: 'gilead', x: 10, y: 103, fig: 'gilead_front', h: 44, act: 'talk:gilead' }
    ],
    talks: {
      camels: [['narr', 0, '앞서 가는 낙타 세 마리. 박사들이다.']],
      gilead: [['gilead', 2, '별이 멈춘 줄 알고 뛰어갔다가 세 번 헛걸음했어요.', '(숨 참)']]
    },
    done: [['asaph', 0, '저 지붕이다. 가는 길에 그 밤의 여관을 지나가자 — 그 가족이 어디로 옮겼는지 들어 두자.']]
  };
  // 2 몇 달 뒤 여관: 달라진 곳 일곱 + 길르앗 넌센스(조각 B)
  R.innl = {
    title: '몇 달 뒤의 여관', focus: 50, bgm: 'bgm06_inn', bg: 'img/places/inn_later.webp',
    intro: [
      ['asaph', 0, '몇 달 뒤의 여관이다. 그 밤엔 방이 없던 곳.'],
      ['gilead', 0, '배고파서 들르자고 한 건 아니에요. 진짜예요.', '(배 꼬르륵)'],
      ['asaph', 0, '그 밤의 여관과 무엇이 달라졌는지 일곱 군데를 짚어 보아라. 주인이 우리를 알아보겠지.']
    ],
    spots: [
      { id: 'yard', x: 48, y: 58, w: 44, h: 30, act: 'puzzle:diff' },
      { id: 'keeper', x: 88, y: 100, fig: 'innkeeper_front', h: 56, act: 'talk:keeper' },
      { id: 'gilead', x: 9, y: 103, fig: 'gilead_front', h: 44, act: 'puzzle:riddle4' }
    ],
    talks: { keeper: [['narr', null, '여관 주인이 우리를 알아보고 반갑게 고개를 끄덕인다. 그러고는 일손이 바쁜지, 마당을 가리키며 잠깐 기다리라는 손짓을 한다.']] },
    done: [['narr', null, '일을 마친 여관 주인이 다가와, 마을 안쪽 골목 끝 불 켜진 집을 손으로 가리킨다.'], ['asaph', 0, '가자. 별이 선 그 집으로.']]
  };
  // 3 그 집 문: 창 불빛의 가락대로 조용히 두드리기(조각 C)
  R.door = {
    title: '그 집 문 앞', focus: 50, bgm: 'bgm17_magi', bg: 'img/places/house.webp',
    intro: [
      ['asaph', 0, '별이 이 지붕 위에 머물렀다. 그래도 밤늦게 남의 집 문을 함부로 두드릴 수는 없지.'],
      ['gilead', 0, '창문 불빛이 깜빡거려요. 길게, 짧게….'],
      ['asaph', 0, '바람에 흔들리는 저 가락대로 조용히 두드리자. 아기가 깨지 않게.']
    ],
    spots: [
      { id: 'door', x: 49, y: 56, w: 20, h: 52, act: 'puzzle:knock' },
      { id: 'window', x: 18, y: 42, w: 10, h: 14, act: 'talk:window' },
      { id: 'camel', x: 84, y: 72, w: 22, h: 22, act: 'talk:camel' },
      { id: 'chests', x: 63, y: 84, w: 16, h: 10, act: 'talk:chests' }
    ],
    talks: {
      window: [['narr', 0, '등잔 불빛이 덧문 틈으로 새어 나온다. 길게, 짧게 흔들린다.']],
      camel: [['gilead', 1, '박사님들 낙타예요! 이번엔 침 안 뱉네요. 여기가 좋은가 봐요.', '(감동)']],
      chests: [['narr', 0, '문 앞에 내려놓은 보배합들.']]
    },
    done: [['asaph', 0, '문이 조용히 열렸다.']]
  };
  // 4 그 집 안: 예언 카드 · 세 예물(조각 D) · 엎드려 경배 · 찢긴 두루마리 직소 → 도장 「시」
  R.worship = {
    title: '그 집 안', focus: 42, bgm: 'bgm18_worship', bg: 'img/places/worship.webp',
    intro: [
      ['asaph', 0, '집에 들어가 아기와 그의 어머니 마리아가 함께 있는 것을 보고 엎드려 아기께 경배하고 보배합을 열어 황금과 유향과 몰약을 예물로 드리니라', '', '마태복음 2:11'],
      ['asaph', 0, '우리는 문 곁에 조용히 섰다. 찢긴 두루마리의 마지막 조각들도 이 방에서 맞춰야 한다.']
    ],
    spots: [
      { id: 'shelf', x: 37, y: 24, w: 22, h: 26, act: 'puzzle:cards' },
      { id: 'gifts', x: 48, y: 78, w: 30, h: 18, act: 'puzzle:gifts' },
      { id: 'rug', x: 50, y: 94, w: 40, h: 8, act: 'puzzle:bow' },
      { id: 'window', x: 12, y: 15, w: 10, h: 16, act: 'puzzle:jigsaw' }
    ],
    done: [
      ['asaph', 0, '그들은 꿈에 헤롯에게로 돌아가지 말라 지시하심을 받아 다른 길로 고국에 돌아가니라', '', '마태복음 2:12'],
      ['asaph', 0, '이어 붙인 두루마리에 적힌 말씀대로라면… 오늘 밤, 이 가족도 길을 떠나야 한다.']
    ],
    note: { text: '그 집 — 예언 다섯이 제자리를 찾았다. 이어 붙인 두루마리: 「일어나 아기와 그의 어머니를 데리고 애굽으로 피하여」', ref: '마 2:11-13' },
    chapterEnd: 4
  };

  BN.CH_END[4] = {
    body: '먼 데서 온 손님들이 아기께 엎드렸습니다.<br><br><span style="font-family:var(--serif);color:var(--gold)">「이는 한 아기가 우리에게 났고 한 아들을 우리에게 주신 바 되었는데 그의 어깨에는 정사를 메었고 그의 이름은 기묘자라, 모사라, 전능하신 하나님이라, 영존하시는 아버지라, 평강의 왕이라 할 것임이라」</span><br><span style="font-size:12px">이사야 9:6</span>',
    next: '5장 「애굽으로 가는 밤길」로 이어집니다'
  };

  Object.assign(BN.FX, {
    nightroad: { stars: true, dust: 10, lights: [[73, 17, 80]] },
    innl: { stars: true, dust: 14, lights: [[14, 42, 60], [38, 42, 50], [54, 42, 50], [72, 42, 50], [88, 69, 70]] },
    door: { stars: true, dust: 16, lights: [[19, 42, 70], [50, 6, 90]] },
    worship: { stars: false, dust: 30, lights: [[52, 87, 80]] }
  });
  Object.assign(BN.HINTS, {
    nightroad: ['별은 여러 지붕에서 잠깐 쉬어 가요. 잠깐 쉬는 것과 「머물러 서 있는」 것은 달라요(마 2:9). 길가 큰 바위 곁도 살펴요.', '별이 마지막에 멈추면 아래로 빛줄기가 내려와요. 빛줄기가 내려온 뒤에 그 집을 눌러요.', '「처음부터 다시 보기」 → 빛줄기가 내려온 지붕. 바위 곁에서 두루마리 조각.'],
    innl: ['1장 여관 그림과 비교해요. 하늘·2층 난간·창·간판·마당 양쪽을 살펴요. 길르앗은 「가장 가난한 왕」을 물어요.', '나귀 · 담요 · 덧문 · 간판 · 바구니 · 항아리 · 별. 넌센스: 「임금」은 왕이라는 뜻.', '왼쪽 마구간 나귀들 / 2층 난간 담요 / 2층 왼쪽 창 덧문 / 2층 간판 그림 / 오른쪽 계단 밑 바구니 / 가운데 문 곁 항아리 / 왼쪽 위 하늘의 별 · 넌센스: 최저임금'],
    door: ['문을 눌러 「창 불빛 보기」로 가락을 봐요.', '길게 켜지면 꾹 눌렀다 떼고(0.4초 넘게), 짧게 켜지면 톡. 모두 일곱 번이에요.', '불빛 가락 그대로 — 사람마다 가락이 달라요. 틀리면 「처음부터」 누르고 다시.'],
    worship: ['선반(예언 카드), 바닥의 보배합(세 예물), 앞쪽 깔개(엎드려 경배), 창가(찢긴 두루마리 — 조각 넷)를 살펴요.', '예언 카드는 엎어 둔 열 장을 두 장씩 뒤집어 짝을 찾아요(이루어진 자리는 구절 번호뿐 — 마태복음 1~2장과 누가복음 2장을 펴 봐요). 예물은 그림자 밑 구절에 무엇이 나오는지 찾아요(그림자 하나는 함정). 경배는 폰을 엎어 5초(안 되면 10초 누르기).', '사 7:14→마 1:23 · 미 5:2→마 2:6 · 호 11:1→마 2:15 · 렘 31:15→마 2:18 · 사 9:6→눅 2:11 / 황금→왕관 그림자(시 72:15) · 유향→향로(출 30:34) · 몰약→둥근 돌(요 19:39) · 항아리(요 2:6)는 함정 / 직소: 글줄이 이어지게, 같은 조각 두 번 누르면 회전']
  });
})(window.BN);
