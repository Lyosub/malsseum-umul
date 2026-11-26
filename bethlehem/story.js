// 「베들레헴의 밤」 이야기 데이터 — 인물·컷신·지도 장소·방·대사·퍼즐.
// 성경 인물의 말·구절은 개역개정 원문(bskorea 2026-11-26 대조). 아삽 노인·길르앗·「나」는 가상 인물(엔딩 크레딧에 밝힘).
var BN = window.BN = {};

BN.CHARS = {
  asaph: { name: '아삽 노인', face: 'asaph' },
  gilead: { name: '길르앗', face: 'gilead' },
  me: { name: '나', face: 'me' },
  narr: { name: '', face: null },
  joseph: { name: '요셉', face: 'joseph' },
  mary: { name: '마리아', face: 'mary' },
  innkeeper: { name: '여관 주인', face: 'innkeeper' }
};

// 오프닝 컷신: [그림, 글, 출처]
BN.OPENING = [
  ['img/maps/mapA.webp', '그 때에 가이사 아구스도가 영을 내려 천하로 다 호적하라 하였으니', '누가복음 2:1', 'center 30%'],
  ['img/maps/mapA.webp', '모든 사람이 호적하러 각각 고향으로 돌아가매', '누가복음 2:3', '20% 20%'],
  ['img/maps/mapA.webp', '유대 산지의 작은 마을 베들레헴.<br>오늘 밤, 성문은 닫힐 줄을 모른다.', '', '50% 75%'],
  ['img/maps/mapA.webp', '나는 늙은 서기관 아삽의 견습생.<br>오늘 내 일은 하나 — 명부를 틀림없이 적는 것.', '', '60% 85%']
];

// 지도 장소: id, 이름, 아이콘, 위치(지도 1920×1080 기준 %), 장
BN.SPOTS = [
  { id: 'gate', name: '성문 · 인구조사 명부', icon: '📜', x: 56, y: 80, ch: 1 },
  { id: 'road', name: '나사렛에서 오는 길', icon: '🧭', x: 15, y: 18, ch: 1 },
  { id: 'well', name: '성문 곁 우물', icon: '🪣', x: 25, y: 67, ch: 1 },
  { id: 'inn', name: '여관', icon: '🏠', x: 50, y: 46, ch: 1 },
  { id: 'field', name: '동쪽 들판', icon: '🐑', x: 87, y: 72, ch: 1 },
  { id: 'angel', name: '들판 위 하늘', icon: '✦', x: 84, y: 40, ch: 1 },
  { id: 'stable', name: '바위 굴 마구간', icon: '🕯', x: 70, y: 30, ch: 1 }
];
// 어떤 방을 끝내야 열리는지
BN.UNLOCK = { gate: [], road: ['gate'], well: ['gate'], inn: ['road'], field: ['inn', 'well'], angel: ['field'], stable: ['angel'] };

// 방 도장 글자(12개 → 「하나님이 우리와 함께 계시다」)
BN.STAMPS = { gate: '하', road: '나', inn: '님', well: '이', field: '우', angel: '리', stable: '와' };

// 방
BN.ROOMS = {
  gate: {
    title: '성문 · 인구조사 명부', focus: 42, bgm: 'bgm09_asaph', bg: 'img/places/gate.webp',
    intro: [
      ['asaph', 0, '늦었구나. 오늘 성문으로 들어온 사람만 이백이 넘는다.'],
      ['gilead', 0, '선생님… 저 아직 저녁도 못 먹었는데요.', '(배고픔 지수 87%)'],
      ['asaph', 0, '명부가 먼저다. 빵은 도망가지 않는다.'],
      ['gilead', 1, '…빵은 안 도망가도 제 기운은 도망가요.'],
      ['asaph', 0, '다윗 집 사람들의 명부 조각이 뒤섞였다. 다윗의 동네에 왔으면 다윗의 계보는 알아야지. 순서대로 다시 놓아라.']
    ],
    spots: [
      { id: 'table', name: '명부 책상', x: 47, y: 66, act: 'puzzle:genealogy' },
      { id: 'asaph', name: '아삽 노인', x: 16, y: 100, fig: 'asaph_front', h: 66, act: 'talk:asaphHint' },
      { id: 'gilead', name: '길르앗', x: 86, y: 102, fig: 'gilead_front', h: 52, act: 'talk:gileadJoke' },
      { id: 'star_gate', name: '', x: 19, y: 3, act: 'star:1', hidden: true }
    ],
    talks: {
      asaphHint: [['asaph', 0, '룻기 끝을 펴 보아라. 베레스에서 시작해 다윗에서 끝나는 줄이 있다.']],
      gileadJoke: [['gilead', 2, '보아스는 알아요! 룻 이야기의 그 부자 아저씨. 밭에 보리가 엄청 많았다던데…', '(다시 배고파짐)']]
    },
    done: [
      ['asaph', 0, '열넷이라. 마태도 대를 열넷씩 세었지. 이 숫자, 기억해 두어라. 숫자는 늘 돌아온다.'],
      ['gilead', 1, '저는 빵 개수만 기억하는데요.'],
      ['narr', null, '명부를 다시 넘기던 아삽 노인의 손이 한 줄에서 멈춘다.'],
      ['narr', null, '요셉도 다윗의 집 족속이므로 갈릴리 나사렛 동네에서 유대를 향하여 베들레헴이라 하는 다윗의 동네로', '', '누가복음 2:4'],
      ['asaph', 0, '나사렛에서 여기까지 꼬박 며칠 길이다. 그런데 이 줄 끝에 칸이 하나 더 비어 있구나… 길을 따라가 보아라.']
    ],
    note: { text: '다윗의 계보(룻 4:18-22)를 바로 놓자 명부 조각의 선이 이어져 숫자 14가 나타났다. 「열네 대」(마 1:17). 아삽 노인: 「숫자는 늘 돌아온다.」', ref: '룻기 4:18-22 · 마태복음 1:17' },
    item: 'census'
  }
};

BN.ITEMS = {
  census: ['인구조사 명부', 'img/items/census.webp', '요셉의 이름 줄 끝에 빈칸이 하나 있다.'],
  lamp: ['기름 등잔', 'img/items/lamp.webp', '어두운 곳을 비춘다.'],
  rope: ['두레박 줄', 'img/items/rope.webp', ''],
  lens: ['수정 조각', 'img/items/lens.webp', '작은 글씨를 키워 본다.'],
  mirror: ['청동 거울', 'img/items/mirror.webp', '뒤집힌 글씨를 바로 본다.'],
  ring: ['인장 반지', 'img/items/ring.webp', ''],
  weights: ['세겔 추', 'img/items/weights.webp', '']
};

// 계보 퍼즐: 룻 4:18-22 (개역개정 표기)
BN.GENEALOGY = ['베레스', '헤스론', '람', '암미나답', '나손', '살몬', '보아스', '오벳', '이새', '다윗'];
