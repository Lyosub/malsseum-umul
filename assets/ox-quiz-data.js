// 성경 O/X 스피드퀴즈 데이터.
//   statement : O/X로 답할 문장
//   answer    : true(O) / false(X)
//   note      : 정답 공개 후 보여줄 짧은 설명(근거 구절 느낌만, 길게 안 씀)
//
// 게임은 여기서 10문항을 무작위로 고른다. 일부러 헷갈리기 쉬운 X 문장(비슷한 이야기를 다른 인물·장소로
// 바꿔치기)을 섞어서, 그냥 "착한 얘기 같으니까 O"로 찍는 걸 막는다.
var OX_QUIZ = [
  { statement: "다윗은 물맷돌로 골리앗을 쓰러뜨렸다.", answer: true, note: "사무엘상 17장" },
  { statement: "요나는 사흘 동안 큰 물고기 뱃속에 있었다.", answer: true, note: "요나 1~2장" },
  { statement: "홍해를 가른 것은 여호수아다.", answer: false, note: "홍해는 모세(출애굽기 14장) · 여호수아는 요단강을 가름" },
  { statement: "예수님은 가나 혼인잔치에서 물을 포도주로 바꾸셨다.", answer: true, note: "요한복음 2장" },
  { statement: "삼손의 힘의 비밀은 그의 눈에 있었다.", answer: false, note: "삼손의 힘의 비밀은 머리카락(삿 16장)" },
  { statement: "바울의 원래 이름은 사울이었다.", answer: true, note: "사도행전 13:9" },
  { statement: "예수님의 열두 제자 중에는 세리였던 사람이 있었다.", answer: true, note: "마태(레위)" },
  { statement: "요셉은 형들에 의해 애굽에 종으로 팔려갔다.", answer: true, note: "창세기 37장" },
  { statement: "여리고 성은 이스라엘 군대가 나팔을 불며 돌자 무너졌다.", answer: true, note: "여호수아 6장" },
  { statement: "솔로몬은 다윗의 첫째 아들이었다.", answer: false, note: "다윗의 여러 아들 중 하나(밧세바 소생)로, 첫째는 아니었음" },
  { statement: "엘리야는 갈멜산에서 바알 선지자들과 대결했다.", answer: true, note: "열왕기상 18장" },
  { statement: "다니엘은 사자굴에 던져졌지만 상처 하나 입지 않았다.", answer: true, note: "다니엘 6장" },
  { statement: "예수님이 태어나신 곳은 나사렛이다.", answer: false, note: "베들레헴에서 태어나심(눅 2장), 나사렛은 자라신 동네" },
  { statement: "룻기의 룻은 모압 여인이었다.", answer: true, note: "룻기 1장" },
  { statement: "가룟 유다는 예수님을 은 삼십에 팔았다.", answer: true, note: "마태복음 26:15" },
  { statement: "베드로는 예수님을 세 번 부인했다.", answer: true, note: "마태복음 26장" },
  { statement: "노아의 방주에 탄 사람은 노아 부부 단둘뿐이었다.", answer: false, note: "노아 가족 여덟 명이 함께 탐(창 7장)" },
  { statement: "천지창조는 엿새 동안 이루어졌고 일곱째 날에 하나님이 쉬셨다.", answer: true, note: "창세기 1~2장" },
  { statement: "사도 바울은 다메섹으로 가는 길에 예수님을 만나 회심했다.", answer: true, note: "사도행전 9장" },
  { statement: "예수님이 행하신 첫 번째 기적은 오병이어 기적이다.", answer: false, note: "첫 기적은 가나 혼인잔치의 물이 포도주 됨(요 2장)" },
  { statement: "이삭은 아브라함과 사라가 백 세에 낳은 아들이다.", answer: true, note: "창세기 21장" },
  { statement: "요한계시록은 사도 요한이 밧모섬에서 기록했다.", answer: true, note: "요한계시록 1장" },
  { statement: "십계명은 애굽 왕 바로가 모세에게 준 것이다.", answer: false, note: "하나님이 시내산에서 모세에게 주심(출 20장)" },
  { statement: "제자 도마는 부활을 의심했다가 예수님의 상처를 보고 믿었다.", answer: true, note: "요한복음 20장" }
];
