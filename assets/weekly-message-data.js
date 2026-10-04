// 이번 주 말씀 — 날짜가 되면 자동으로 바뀐다.
//
// 예전에는 매주 사람이 직접 이 파일을 갈아끼웠다. 그러다 보니
// "설교를 전한 뒤에 바꾼다"는 규칙을 지키려고 주일마다 손을 대야 했고,
// 실제로 갱신이 며칠씩 밀리는 일이 있었다.
//
// 그래서 여러 주차를 미리 써두고, activeFrom(KST)이 지난 것 중
// 가장 최근 것을 화면에 보여주도록 바꿨다. 설교 원고가 나오면
// 그 주차를 미리 추가해두기만 하면 주일에 아무도 손대지 않아도 알아서 바뀐다.
//
// 새 주차를 추가할 때
//   1) 배열 **맨 앞**에 추가한다 (최신이 위)
//   2) activeFrom 은 그 주일 **예배가 끝난 뒤 시각**으로 둔다. 보통 "<날짜> 12:00".
//      예배가 오전 9시 30분이므로 12시면 안전하다. 설교 전에 바뀌면 안 된다.
//   3) 배경 이미지는 assets/weekly-backgrounds/<weekLabel>.png 를 자동으로 찾는다.
//      없으면 기본 배경으로 조용히 넘어가므로 없어도 깨지지 않는다.
//
// weekly-card.js 는 예전처럼 WEEKLY_MESSAGE 하나만 보면 되도록 그대로 두었다.

var WEEKLY_MESSAGES = [
  {
    activeFrom: "2026-10-04 12:00",
    weekLabel: "2026.10.04",
    title: "견디어 낸 자",
    verseRef: "야고보서 1:12",
    verseText: "시험을 참는 자는 복이 있나니 이는 시련을 견디어 낸 자가 주께서 자기를 사랑하는 자들에게 약속하신 생명의 면류관을 얻을 것이기 때문이라",
    verseRefEn: "James 1:12",
    verseTextEn: "Blessed is the man that endureth temptation: for when he is tried, he shall receive the crown of life, which the Lord hath promised to them that love him.",
    summary: "야고보는 시련을 \"온전히 기쁘게 여기라\"고 말합니다. 시련이 기뻐서가 아니라, 그 불을 통과한 끝에 진짜가 된 믿음과 하나님이 약속하신 면류관이 있기 때문입니다. 첫째, 시련은 가마 속의 불처럼 우리 믿음을 진짜로 만들고, 그 과정에서 자리를 지키는 인내가 생겨 우리를 다 자란 사람으로 자라게 합니다. \"시련\"은 헬라어로 \"도키미온\", 금이나 은을 불에 넣어 진짜인지 가려내는 말이고, 12절의 \"견디어 낸 자\"는 \"도키모스\", 그 불을 통과해 진짜로 인정받은 상태입니다. 둘째, 견디는 것은 혼자 이를 악무는 것이 아니라 꾸짖지 아니하시는 하나님께 지혜를 구하는 것입니다. 셋째, 견디어 낸 자에게 하나님은 자기를 사랑하는 자들에게 약속하신 생명의 면류관을 주십니다.",
    application: "이번 주, 지금 가장 무거운 \"가마\" 하나를 떠올려 봅시다. 그 앞에서 도망가는 대신 딱 한 가지만 해 봅시다. 그 문제를 하나님께 그대로 말씀드리는 것입니다. \"하나님, 저 이거 너무 힘들어요. 지혜를 주세요.\" 꾸짖지 않으시는 하나님께서 들으실 것입니다."
  },
  {
    activeFrom: "2026-09-27 12:00",
    weekLabel: "2026.09.27",
    title: "당연한 건 없다",
    verseRef: "누가복음 17:15-16",
    verseText: "그 중의 한 사람이 자기가 나은 것을 보고 큰 소리로 하나님께 영광을 돌리며 돌아와 예수의 발 아래에 엎드리어 감사하니 그는 사마리아 사람이라",
    verseRefEn: "Luke 17:15-16",
    verseTextEn: "And one of them, when he saw that he was healed, turned back, and with a loud voice glorified God, and fell down on his face at his feet, giving him thanks: and he was a Samaritan.",
    summary: "나병환자 열 명은 마을 밖에서 \"부정하다\"고 외치며 살아야 했고, 유대인과 사마리아 사람이 한데 섞일 만큼 같은 처지였습니다. 예수님은 그 열 명을 가리지 않고, 아직 아무 변화도 없을 때 말씀 하나 믿고 발을 뗀 그들 모두를 깨끗하게 하셨습니다. 그런데 돌아와 감사한 사람은 가장 자격 없어 보이던 사마리아 사람 한 명뿐이었습니다. 아홉은 나빠서가 아니라 바빠서 돌아오지 않았습니다. \"감사하니\"는 헬라어로 \"유카리스테오\"이고, 성찬이라는 말이 여기서 나왔습니다. 열 명 모두 \"카싸리조\", 몸이 나았지만, 돌아온 한 사람만 \"소조\", 온전해졌다는 말씀을 들었습니다. 감사할 때 우리는 은혜를 주신 분이 누구인지 알게 됩니다.",
    application: "이번 주, 딱 한 사람에게 입으로 \"고마워\"라고 말해 봅시다. 부모님이어도 좋고 친구여도 좋습니다. 명절에 무사히 다녀온 길, 따뜻한 밥, 오늘 이 자리까지 온 것 — 이 중에 당연한 건 하나도 없습니다. 그 한마디가 우리를 아홉 명이 아니라 돌아온 한 사람 쪽에 세워 줍니다."
  },
  {
    activeFrom: "2026-09-20 12:00",
    weekLabel: "2026.09.20",
    title: "뜻을 먼저 정하면",
    verseRef: "다니엘 1:8",
    verseText: "다니엘은 뜻을 정하여 왕의 음식과 그가 마시는 포도주로 자기를 더럽히지 아니하리라 하고 자기를 더럽히지 아니하도록 환관장에게 구하니",
    verseRefEn: "Daniel 1:8",
    verseTextEn: "But Daniel purposed in his heart that he would not defile himself with the portion of the king's meat, nor with the wine which he drank: therefore he requested of the prince of the eunuchs that he might not defile himself.",
    summary: "다니엘은 전쟁에 져서 바벨론으로 끌려간 십 대였습니다. 이름도 먹는 것도 다 바뀐 자리에서 그가 제일 먼저 정한 것은 성적이나 자리가 아니라 \"나를 더럽히지 않겠다\"는 태도였습니다. \"뜻을 정하여\"는 히브리어로 \"숨 알-레브\", 마음 한가운데에 딱 올려놓는다는 뜻입니다. 그리고 그는 정한 그날 바로 환관장에게 가서 대안을 제안하며 행동으로 옮겼습니다. 다니엘이 뜻을 정하자 하나님이 학문과 지혜를 주셨는데, 이는 그가 아무것도 안 하고 기도만 했기 때문이 아니라 할 수 있는 노력을 다하면서 그 뜻의 방향을 하나님께 두었기 때문입니다. 좋은 결과는 다니엘의 목표가 아니라 열매였습니다.",
    application: "이번 시험기간, 공부 계획을 세우기 전에 \"뜻 하나\"부터 마음 위에 올려놓읍시다. 점수는 내가 정한다고 나오지 않지만, 태도는 정하면 지킬 수 있습니다. 12시에 자기, 짜증 안 내기, 끝까지 내 힘으로 풀기 — 거창한 것 말고 지킬 수 있는 것 하나면 됩니다. 그리고 책을 펴기 전 30초 기도로 시작해봅시다."
  },
  {
    activeFrom: "2026-09-13 12:00",
    weekLabel: "2026.09.13",
    title: "오늘 채워졌습니다",
    verseRef: "요한복음 4:14",
    verseText: "내가 주는 물을 마시는 자는 영원히 목마르지 아니하리니 내가 주는 물은 그 속에서 영생하도록 솟아나는 샘물이 되리라",
    verseRefEn: "John 4:14",
    verseTextEn: "But whosoever drinketh of the water that I shall give him shall never thirst; but the water that I shall give him shall be in him a well of water springing up into everlasting life.",
    summary: "사마리아 여인은 사람들을 피해 한낮에 혼자 물을 길으러 나왔지만, 예수님은 유대인과 상종하지 않는 그 자리에 먼저 찾아가 정죄 없이 말을 거십니다. 교회는 완벽하고 자격을 갖춘 사람들의 모임이 아니라, 예수님이 먼저 찾아와주신 사람들의 모임입니다. 우리는 게임·인정·성적·좋아요로 마음을 채우려 하지만 금세 다시 목마릅니다. 예수님은 한 번 받으면 다시 목마르지 않는 사랑과 영원한 생명을, 우리가 잘해서가 아니라 사랑하셔서 거저 주십니다. 이 사랑을 만난 여인이 물동이를 버려두고 동네로 달려가 전한 것처럼, 받은 사랑은 흘려보내는 사람을 만듭니다.",
    application: "지난주 비워둔 자리가 오늘 친구들로 채워졌습니다. 오늘 처음 온 친구는 '친구가 데려와서'가 아니라 이제 자기 자신이 직접 이 사랑을 만나보세요. 궁금한 건 옆 사람에게 편하게 물어봐도 좋습니다. 그리고 오늘 초청은 끝이 아니라 시작이니, '다음 주에도 같이 오자'고 말해주는 것까지가 초청입니다."
  }
];

// activeFrom("YYYY-MM-DD HH:MM", KST)을 실제 시각으로 바꾼다.
// 보는 사람의 기기가 어느 시간대에 있든 같은 결과가 나오도록 UTC 기준으로 계산한다.
function parseKstTime(s) {
  var m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/.exec(String(s || ""));
  if (!m) return 0;
  return Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4] - 9, +m[5]);
}

// 예전 코드(weekly-card.js)가 그대로 쓸 수 있도록 WEEKLY_MESSAGE 를 그대로 유지한다.
var WEEKLY_MESSAGE = (function () {
  var now = Date.now();
  for (var i = 0; i < WEEKLY_MESSAGES.length; i++) {
    if (parseKstTime(WEEKLY_MESSAGES[i].activeFrom) <= now) return WEEKLY_MESSAGES[i];
  }
  // 아직 아무 주차도 시작하지 않았다면 가장 오래된 것을 보여준다(빈 화면 방지)
  return WEEKLY_MESSAGES[WEEKLY_MESSAGES.length - 1];
})();
