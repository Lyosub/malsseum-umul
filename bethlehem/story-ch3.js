// 「베들레헴의 밤」 3장 「동방에서 온 손님」(2026-11-26)
// 성경 인물의 말은 개역개정 원문 그대로(bible.py 대조: 마 2:2-12, 미 5:2, 사 60:3). 박사·헤롯·서기관은 본문에 있는 말만 한다.
// 아삽 노인·길르앗·궁의 시종들은 가상 인물(성경 사건을 바꾸지 않음).
(function (BN) {
  BN.CHARS.magi = { name: '동방 박사들', face: 'magiA' };
  BN.CHARS.herod = { name: '헤롯 왕', face: 'herod' };
  BN.CHARS.scribes = { name: '대제사장과 서기관들', face: 'priest' };
  BN.ITEMS.wax = ['밀랍', 'img/items/seal.webp', '길르앗이 촛대에서 긁어 모은 밀랍. 봉인을 다시 찍을 때.'];

  BN.CHAPTERS[3] = { title: '동방에서 온 손님', map: 'B3', start: 'magi' };
  BN.MAPS.B3 = { img: 'img/maps/mapB@2x.webp', bgm: 'bgm17_magi' };
  BN.SPOTS.push(
    { id: 'archive', name: '서기관의 서고', icon: '📜', x: 73, y: 70, ch: 3 },
    { id: 'council', name: '헤롯 궁 · 회의실', icon: '🏛', x: 72, y: 24, ch: 3 },
    { id: 'hall', name: '헤롯 궁 · 접견실', icon: '🕯', x: 88, y: 36, ch: 3 },
    { id: 'roof', name: '왕궁 지붕', icon: '⭐', x: 92, y: 10, ch: 3 },
    { id: 'magi', name: '박사들의 천막', icon: '⛺', x: 10, y: 86, ch: 3 }
  );
  Object.assign(BN.UNLOCK, { magi: [], archive: ['magi'], council: ['archive'], hall: ['council'], roof: ['hall'] });
  Object.assign(BN.STAMPS, { roof: '계' });

  var R = BN.ROOMS;
  // 1 박사들의 천막: 별 재는 기구(일지의 규칙) + 낙타 짐
  R.magi = {
    title: '성 밖 · 박사들의 천막', focus: 55, bgm: 'bgm17_magi', bg: 'img/places/magi.webp', noBack: true,
    intro: [
      ['asaph', 0, '얼마 뒤. 예루살렘 성 밖에 낯선 천막이 섰다. 먼 동쪽에서 온 손님들이다.'],
      ['magi', 0, '유대인의 왕으로 나신 이가 어디 계시냐 우리가 동방에서 그의 별을 보고 그에게 경배하러 왔노라', '', '마태복음 2:2'],
      ['gilead', 0, '저 낙타 좀 보세요! 저렇게 큰 짐승은 처음 봐요.', '(입 벌어짐)'],
      ['asaph', 0, '손님들이 떠날 채비를 돕자. 별 재는 기구는 오늘 밤에 맞추고, 등잔 빛을 놋거울로 꺾어 별 지도의 눈금에 비춰야 한다.']
    ],
    spots: [
      { id: 'astro', x: 59, y: 63, w: 15, h: 22, act: 'puzzle:astro' },
      { id: 'journal', x: 78, y: 66, w: 16, h: 18, act: 'puzzle:journal' },
      { id: 'chart', x: 30, y: 68, w: 30, h: 22, act: 'puzzle:chart' },
      { id: 'camel', x: 75, y: 38, w: 18, h: 18, act: 'talk:camel' },
      { id: 'lamp', x: 14, y: 20, w: 10, h: 16, act: 'puzzle:light' },
      { id: 'chests', x: 30, y: 38, w: 26, h: 16, act: 'talk:chests' },
      { id: 'gilead', x: 93, y: 103, fig: 'gilead_front', h: 44, act: 'talk:gilead' }
    ],
    talks: {
      chests: [['narr', 0, '황금과 유향과 몰약. 보배합들이 탁자 곁에 쌓여 있다.']],
      camel: [['gilead', 1, '낙타가 저를 보고 또 침을 뱉으려고 해요. 짐은 이미 다 실었대요.', '(피함)']],
      gilead: [['gilead', 2, '제가 저 낙타 밥을 준 게 오늘로 열아홉 번째 밤이에요. 그런데 아직도 저만 보면 침을 뱉어요.', '(서운함)']]
    },
    done: [['asaph', 0, '채비가 끝났다. 박사들은 왕궁으로 가서 물을 것이다. 왕은 서기관들을 부르겠지 — 우리는 서고로 가자.']]
  };
  // 2 서고: 작은 글씨(수정 조각) → 자음 원판(아트바쉬) → 서가에서 미 5:2
  R.archive = {
    title: '서기관의 서고', focus: 45, bgm: 'bgm14_archive', bg: 'img/places/archive.webp',
    intro: [
      ['asaph', 0, '헤롯 왕과 온 예루살렘이 듣고 소동한지라', '', '마태복음 2:3'],
      ['asaph', 0, '왕이 대제사장과 서기관들을 모은다. 선지자의 글에서 그리스도가 날 곳을 찾아 올려야 한다.'],
      ['gilead', 2, '두루마리가 천 개는 되겠는데요…. 저는 빵 장부만 읽을 줄 알아요.', '(현실 도피)']
    ],
    spots: [
      { id: 'lectern', x: 43, y: 47, w: 24, h: 22, act: 'puzzle:lectern' },
      { id: 'basket', x: 14, y: 72, w: 10, h: 16, act: 'puzzle:tiny' },
      { id: 'table', x: 64, y: 74, w: 30, h: 18, act: 'puzzle:disc' },
      { id: 'shelf', x: 84, y: 34, w: 26, h: 40, act: 'puzzle:shelf' },
      { id: 'gilead', x: 30, y: 103, fig: 'gilead_front', h: 42, act: 'talk:gilead' }
    ],
    talks: { gilead: [['gilead', 1, '서기관 아저씨들은 중요한 자리를 꼭 이상한 말로 적어 둔대요. 도둑이 못 읽게요.', '(들은 이야기)']] },
    done: [['asaph', 0, '찾았다. 이 두루마리를 회의실로 올려 보내자.']],
    note: { text: '서고 — 거꾸로 적은 자리(「위에서 셋 왼편에서 다섯」)에서 미가 5:2를 찾았다', ref: '미가 5:2' }
  };
  // 3 회의실: 헤롯의 물음(마 2:4) · 시종 넷 중 거짓말쟁이 하나
  R.council = {
    title: '헤롯 궁 · 회의실', focus: 50, bgm: 'bgm15_herod', bg: 'img/places/council.webp',
    intro: [
      ['herod', 0, '그리스도가 어디서 나겠느냐', '', '마태복음 2:4'],
      ['asaph', 0, '서기관들이 두루마리를 편다. 그런데 왕은 박사들을 남몰래 부르려 하는구나.'],
      ['asaph', 0, '어느 문으로 들일지 시종들이 서로 다른 말을 한다. 한 사람은 거짓말을 하고 있다.']
    ],
    spots: [
      { id: 'table', x: 53, y: 80, w: 30, h: 16, act: 'puzzle:liar' },
      { id: 'herod', x: 85, y: 100, fig: 'herod_front', h: 62, act: 'talk:herod' },
      { id: 'scribe', x: 15, y: 100, fig: 'priest_front', h: 56, act: 'talk:scribe' },
      { id: 'mosaic', x: 80, y: 33, w: 22, h: 28, act: 'talk:mosaic' }
    ],
    talks: {
      herod: [['herod', 1, '그리스도가 어디서 나겠느냐', '', '마태복음 2:4']],
      scribe: [['narr', 0, '(서기관들은 두루마리를 펴 놓고 왕의 눈치를 살핀다)']],
      mosaic: [['narr', 0, '벽의 모자이크. 마름모가 겹겹이 — 문 넷을 그린 궁의 평면도 같다.']]
    },
    done: [
      ['scribes', 0, '유대 베들레헴이오니 이는 선지자로 이렇게 기록된 바', '', '마태복음 2:5'],
      ['scribes', 0, '또 유대 땅 베들레헴아 너는 유대 고을 중에서 가장 작지 아니하도다 네게서 한 다스리는 자가 나와서 내 백성 이스라엘의 목자가 되리라 하였음이니이다', '', '마태복음 2:6'],
      ['asaph', 0, '박사들은 서문으로 가만히 들어온다. 접견실로 가자.']
    ]
  };
  // 4 접견실: 뒤집힌 쪽지 + 청동 거울 → 진짜 편지(마 2:8) → 반지 봉인 → 「왕께 보고하기」 함정
  R.hall = {
    title: '헤롯 궁 · 접견실', focus: 62, bgm: 'bgm15_herod', bg: 'img/places/hall.webp',
    intro: [
      ['asaph', 0, '이에 헤롯이 가만히 박사들을 불러 별이 나타난 때를 자세히 묻고', '', '마태복음 2:7'],
      ['asaph', 0, '왕이 박사들에게 편지를 들려 보낸다는구나. 그런데 탁자의 편지는 셋이다.'],
      ['gilead', 2, '(속삭임) 여기 너무 조용해서 배에서 소리 나면 큰일 나요.', '(꾸르륵)']
    ],
    spots: [
      { id: 'cushion', x: 38, y: 55, w: 12, h: 8, act: 'puzzle:note3' },
      { id: 'mirror', x: 89, y: 30, w: 14, h: 34, act: 'puzzle:mirror' },
      { id: 'letters', x: 66, y: 80, w: 26, h: 16, act: 'puzzle:letters' },
      { id: 'ringbox', x: 90, y: 75, w: 10, h: 14, act: 'talk:ringbox' },
      { id: 'gilead', x: 12, y: 103, fig: 'gilead_front', h: 44, act: 'puzzle:riddle3' }
    ],
    talks: { ringbox: [['narr', 0, '붉은 반지 상자. 반지가 여러 개 들어 있다. 봉인을 찍을 때 쓰는 것 같다.']] },
    done: [['asaph', 0, '잘했다. 왕의 귀에 들어갈 말은 없다. 이제 지붕으로 — 별을 보자.']]
  };
  // 5 왕궁 지붕: 박사의 별 지도(동쪽이 위) → 남쪽 하늘에서 같은 별자리 잇기
  R.roof = {
    title: '왕궁 지붕 · 남쪽 하늘', focus: 50, bgm: 'bgm16_star', bg: 'img/places/roof.webp',
    intro: [
      ['asaph', 0, '왕궁 지붕이다. 남쪽으로 베들레헴 가는 길이 보인다.'],
      ['gilead', 0, '박사님들 지도를 보고 오셨죠? 저는 별을 보면 다 빵 부스러기 같아요.', '(배고픔 계속)'],
      ['asaph', 0, '지도는 해 뜨는 쪽을 위로 그렸다. 그런데 우리는 지금 남쪽을 보고 서 있지.']
    ],
    spots: [
      { id: 'star_roof', x: 10, y: 15, w: 4, h: 7, act: 'star:5' },
      { id: 'sky', x: 55, y: 22, w: 70, h: 34, act: 'puzzle:stars3' },
      { id: 'astro', x: 34, y: 62, w: 10, h: 10, act: 'talk:astro' },
      { id: 'gilead', x: 88, y: 103, fig: 'gilead_front', h: 44, act: 'talk:gilead' }
    ],
    talks: {
      astro: [['narr', 0, '박사들이 두고 간 기구. 바늘은 여전히 남서쪽 하늘을 가리킨다.']],
      gilead: [['gilead', 2, '해 뜨는 쪽이 위면… 남쪽을 보고 서면 해 뜨는 쪽은 어느 손이죠? 왼손? 오른손?', '(양손 번갈아 듦)']]
    },
    done: [
      ['asaph', 0, '박사들이 왕의 말을 듣고 갈새 동방에서 보던 그 별이 문득 앞서 인도하여 가다가 아기 있는 곳 위에 머물러 서 있는지라', '', '마태복음 2:9'],
      ['asaph', 0, '그들이 별을 보고 매우 크게 기뻐하고 기뻐하더라', '', '마태복음 2:10']
    ],
    note: { text: '왕궁 지붕 — 박사의 별 지도를 남쪽 하늘에 맞추었다. 별이 베들레헴으로 앞서 갔다.', ref: '마 2:9-10' },
    chapterEnd: 3
  };

  BN.CH_END[3] = {
    body: '먼 데서 온 손님들이 별을 따라 다시 길을 떠났습니다.<br><br><span style="font-family:var(--serif);color:var(--gold)">「나라들은 네 빛으로, 왕들은 비치는 네 광명으로 나아오리라」</span><br><span style="font-size:12px">이사야 60:3</span>',
    next: '4장 「별이 머문 집」으로 이어집니다'
  };

  Object.assign(BN.FX, {
    magi: { stars: true, dust: 26, lights: [[14, 22, 70]] },
    archive: { stars: false, dust: 40, rays: [[31, 8, 520, -26]], lights: [[18, 20, 60], [89, 62, 70]] },
    council: { stars: false, dust: 18, lights: [[15, 20, 50], [39, 25, 50], [60, 30, 40], [65, 36, 40], [67, 61, 40]] },
    hall: { stars: false, dust: 22, lights: [[10, 15, 50], [73, 25, 50], [22, 50, 50], [51, 50, 50]] },
    roof: { stars: true, dust: 14, lights: [[13, 44, 70], [57, 16, 90]] }
  });
  Object.assign(BN.HINTS, {
    magi: ['일지(오른쪽 가죽 책)에 세 밤의 기록이 있어요. 오늘이 몇째 밤인지는 길르앗이 알아요. 왼쪽 위 걸린 등잔을 누르면 놋거울 퍼즐이에요.', '여섯 밤마다 방향은 한 칸(45°)씩 시계 방향, 높이는 15도씩 올라가요. 오늘은 열아홉째 밤. 거울: 빛은 오른쪽으로 나가요 — 위쪽 별 눈금 위에서 아래로 꺾어요.', '기구: 남서 · 55 — 폰을 실제로 남서쪽으로 향하고 윗부분을 55° 들어 2초(센서가 안 되면 「바퀴로 맞추기」). 거울 — 2줄 4칸 ＼, 4줄 4칸 ／, 4줄 2칸 ／, 6줄 2칸 ＼ (줄·칸은 위·왼쪽부터)'],
    archive: ['독서대의 글은 암호예요. 바구니의 꼬리표에 읽는 법이 아주 작게 적혀 있어요(1장 여관에서 받은 수정 조각). 탁자의 원판으로 짝을 맞춰요.', '예레미야 25:26의 「세삭」은 바벨론을 거꾸로 적은 이름이에요(51:41). 원판을 돌려 ㄱ과 ㅎ이 마주 보게 한 뒤, 자음만 짝 글자로 바꿔 읽어요. 받침도 바꿔요.', '「쉬세어 엥 쇺녚세어 타엉」 → 「위에서 셋 왼편에서 다섯」. 서가의 위에서 셋째 줄, 왼쪽에서 다섯째 두루마리.'],
    council: ['한 사람만 거짓말을 해요. 한 명씩 「이 사람이 거짓말쟁이라면?」 하고 따져 보세요.', '향 피우는 시종이 문지기 말이 거짓이라 했어요. 둘 중 하나는 반드시 거짓말쟁이예요. 문지기가 거짓이라면 동·서가 빠지고(등잔·문지기), 남·북도 빠져요(물 긷는 시종) — 남는 문이 없어요.', '서문 · 향 피우는 시종'],
    hall: ['왕좌 앞 방석 밑을 살펴요. 뒤집힌 글은 벽의 청동 거울에 비춰 보고, 밀랍은 길르앗의 수수께끼(왕 = 영어로?)를 풀면 받아요.', '진짜 편지는 끈이 두 번 감긴 것. 반지는 찍히면 좌우가 뒤집혀요 — 자국과 똑같은 반지가 아니라 거울처럼 뒤집힌 반지를 골라요. 마지막엔 마태복음 2:12를 기억해요.', '킹콩 → 밀랍 · 가운데 편지 · 좌우가 뒤집힌 ㅋ 반지 · 「…다른 길로」'],
    roof: ['천막 탁자 위 두루마리 지도(박사의 별 지도)를 먼저 보고 와요. 지도는 동쪽이 위예요.', '남쪽 하늘을 보고 서면 동쪽은 왼쪽이에요. 지도를 왼쪽으로 한 번(90°) 돌린 모양을 하늘에서 찾아요 — 별 일곱, 선 여섯.', '가로로 놓인 별 넷을 잇고, 왼쪽 끝 별에서 오른쪽 위·오른쪽 아래 별로 한 줄씩, 왼쪽에서 셋째 별에서 오른쪽 위 별로 한 줄.']
  });
})(window.BN);
