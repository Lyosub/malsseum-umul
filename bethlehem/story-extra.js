// 「베들레헴의 밤」 재미 요소(2026-11-27): 그림 도장 · 길르앗의 빵 12개 · 업적 배지 · 숨은 별 히든 엔딩
// 그림 도장: 방마다 그림과 구절이 새겨진 도장을 받는다. 글자는 마지막 우물 문에서 「성경에 적힌 차례」로 놓아야 드러난다.
// 글자 짝(성경 차례로 정렬): 레 12:8 하 · 룻 4:22 나 · 삼하 23:15 님 · 마 1:23 이 · 마 2:9 우 · 마 2:11 리 · 눅 2:4 와 · 눅 2:7 함 · 눅 2:8 께 · 눅 2:12 계 · 눅 2:14 시 · 눅 2:29 다
(function (BN) {
  BN.STAMP_ICON = {
    court: ['🕊', '산비둘기', '레 12:8', 3, 12, 8],
    gate: ['📜', '계보 두루마리', '룻 4:22', 8, 4, 22],
    well: ['🪣', '성문 곁 우물', '삼하 23:15', 10, 23, 15],
    wellgate: ['◎', '우물 문', '마 1:23', 40, 1, 23],
    roof: ['⭐', '그 별', '마 2:9', 40, 2, 9],
    worship: ['🎁', '보배합', '마 2:11', 40, 2, 11],
    road: ['🧭', '나사렛 길', '눅 2:4', 42, 2, 4],
    inn: ['🏠', '여관', '눅 2:7', 42, 2, 7],
    field: ['🐑', '양 떼', '눅 2:8', 42, 2, 8],
    stable: ['🌾', '구유', '눅 2:12', 42, 2, 12],
    angel: ['✨', '천군', '눅 2:14', 42, 2, 14],
    porch: ['⏳', '기다림', '눅 2:29', 42, 2, 29]
  };
  BN.STAMPS = { court: '하', gate: '나', well: '님', wellgate: '이', roof: '우', worship: '리', road: '와', inn: '함', field: '께', stable: '계', angel: '시', porch: '다' };

  // 프롤로그: 구절 번호를 미리 알려 주지 않는다(두루마리 첫 줄은 사 9:2)
  var W = BN.ROOMS.wellroom;
  if (W) {
    var fix = function (arr) { (arr || []).forEach(function (L, i) {
      if (typeof L[2] === 'string' && L[2].indexOf('마태복음 1장 23절') >= 0) arr[i] = ['keeper', 1, '맞았다! 찢긴 성탄 두루마리의 첫 줄이야. 「흑암에 행하던 백성이 큰 빛을 보고」.'];
      if (typeof L[2] === 'string' && L[2].indexOf('그 열두 글자가') >= 0) arr[i] = ['keeper', 0, '두루마리의 마지막 문장은 열두 글자인데, 무슨 말인지는 나도 몰라. 그 글자들이 베들레헴의 밤 곳곳에 그림 도장으로 숨어 있어. 다 모아 오면 이 문이 열려.'];
    }); };
    fix(W.done); fix(W.intro);
  }
  BN.SCROLL_PARTS = ['흑암에 행하던 백성이', '큰 빛을', '보고'];

  // 길르앗의 빵 부스러기 12개(방마다 하나, 작게 숨어 있음)
  var BREAD = { gate: [48, 92], road: [64, 92], inn: [48, 92], field: [40, 88], house8: [60, 90], court: [8, 88], porch: [96, 38], archive: [48, 92], hall: [28, 90], innl: [66, 92], dream: [55, 92], dawn: [88, 92] };
  Object.keys(BREAD).forEach(function (k, i) { var R = BN.ROOMS[k]; if (R) R.spots.push({ id: 'bread_' + k, x: BREAD[k][0], y: BREAD[k][1], w: 5, h: 7, act: 'bread:' + (i + 1) }); });
  var K = BN.ROOMS.kitchen;
  if (K && K.done) K.done.push(['gilead', 2, '아, 그리고요… 제가 돌아다니면서 빵 부스러기를 열두 군데 흘렸어요. 혹시 보이면 주워 주세요. 다 모으면 좋은 일이 생길지도요?', '(수상함)']);

  BN.COOKIE = [
    ['gilead', 1, '잠깐만요! 제가 흘린 빵 부스러기 열두 개를 다 찾으셨다고요?', '(감동)'],
    ['gilead', 2, '사실 그거 다 모으면 빵 한 덩이가 돼요. 베들레헴이 「떡집」이잖아요. 마지막 선물로 드릴게요.'],
    ['asaph', 0, '…길르앗, 그건 원래 여관 빵이다.'],
    ['gilead', 0, '(못 들은 척) 그런데 할아버지, 진짜 떡은 따로 있다고 하셨잖아요.'],
    ['asaph', 0, '예수께서 이르시되 나는 생명의 떡이니 내게 오는 자는 결코 주리지 아니할 터이요 나를 믿는 자는 영원히 목마르지 아니하리라', '', '요한복음 6:35'],
    ['gilead', 1, '…그 떡이라면 저도 배불러질 것 같아요. 메리 크리스마스!', '(빵 들고 손 흔듦)']
  ];
  BN.HIDDEN_ENDING = [
    ['img/places/dawn.webp', '숨은 별 일곱을 모두 찾았다.<br>일곱 별이 한 줄로 이어지며 새벽하늘을 가리켰다.', '', 'center'],
    ['img/places/dawn.webp', '…나는 다윗의 뿌리요 자손이니 곧 광명한 새벽 별이라', '요한계시록 22:16', 'center']
  ];

  // 업적 배지
  BN.BADGES = [
    ['✦', '별 일곱', '숨은 별 7개를 모두 찾음', function (S) { return S.stars.length >= 7; }],
    ['🌙', '밤의 별', '저녁에만 보이는 별을 찾음', function (S) { return S.stars.indexOf('star:6') >= 0; }],
    ['🍞', '빵 지기', '길르앗의 빵 부스러기 12개', function (S) { return (S.bread || []).length >= 12; }],
    ['🛤', '다른 길로', '「왕께 보고하기」를 한 번도 누르지 않음', function (S) { return !(S.f3 || {}).king; }],
    ['📖', '힌트 없이 한 장', '힌트 없이 끝낸 장이 있음', function (S) { var H = S.hints || {}; return [1, 2, 3, 4, 5].some(function (c) { return BN.SPOTS.filter(function (s) { return (s.ch || 1) === c; }).every(function (s) { return !H[s.id]; }); }); }],
    ['🕯', '기름 아낌', '힌트를 세 번 이하로 봄', function (S) { var H = S.hints || {}, n = 0; Object.keys(H).forEach(function (k) { n += H[k]; }); return n <= 3; }],
    ['🎯', '흔들림 없이', '틀린 답이 열 번 이하', function (S) { return (S.wrongs || 0) <= 10; }],
    ['😄', '넌센스 박사', '길르앗 넌센스를 한 번에 다 맞힘', function (S) { var b = S.wrongBy || {}; return !b.riddle && !b.riddle3 && !b.riddle4 && !b.riddle5; }],
    ['⏳', '한나절', '5시간 안에 완주', function (S) { return Math.floor(S.ms / 60000) + S.hintMin <= 300; }],
    ['🏅', '첫 발자국', '어느 장소를 모두 가운데 가장 먼저 통과', function (S) { return (S.firsts || 0) > 0; }]
  ];
})(window.BN);
