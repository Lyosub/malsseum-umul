// 성경 인물 초성 퀴즈 데이터.
//   name    : 정답
//   chosung : 초성 힌트 (예: 모세 → ㅁㅅ)
//   hint    : 짧은 단서 (정답을 문장으로 풀어주지 않도록 — 시대·역할·특징 한 조각만)
//   era     : 오답 보기를 같은 시대에서 뽑기 위한 묶음
//             early(창세기~광야) / conquest(정복~사사) / kingdom(왕정~선지자~포로귀환) / nt(신약)
//
// 게임은 10명을 무작위로 고르고, 오답 3개는 되도록 같은 era + 비슷한 초성에서 뽑는다.
var CHOSUNG_QUIZ = [
  { name: "아담",     chosung: "ㅇㄷ",   era: "early",     hint: "흙으로 지음받은 첫 사람" },
  { name: "가인",     chosung: "ㄱㅇ",   era: "early",     hint: "형제를 시기한 첫째 아들" },
  { name: "노아",     chosung: "ㄴㅇ",   era: "early",     hint: "큰 배를 지은 의인" },
  { name: "아브라함", chosung: "ㅇㅂㄹㅎ", era: "early",     hint: "믿음의 조상" },
  { name: "이삭",     chosung: "ㅇㅅ",   era: "early",     hint: "약속으로 얻은 아들, 우물을 많이 팠다" },
  { name: "야곱",     chosung: "ㅇㄱ",   era: "early",     hint: "열두 아들의 아버지, 이름이 바뀌었다" },
  { name: "요셉",     chosung: "ㅇㅅ",   era: "early",     hint: "꿈을 꾸고 꿈을 풀었다, 애굽의 이인자" },
  { name: "모세",     chosung: "ㅁㅅ",   era: "early",     hint: "출애굽의 지도자" },
  { name: "아론",     chosung: "ㅇㄹ",   era: "early",     hint: "첫 대제사장" },

  { name: "여호수아", chosung: "ㅇㅎㅅㅇ", era: "conquest",  hint: "가나안 정복을 이끈 지도자" },
  { name: "갈렙",     chosung: "ㄱㄹ",   era: "conquest",  hint: "정탐 후에도 믿음을 지킨 사람" },
  { name: "기드온",   chosung: "ㄱㄷㅇ",  era: "conquest",  hint: "적은 수로 큰 군대를 이긴 사사" },
  { name: "삼손",     chosung: "ㅅㅅ",   era: "conquest",  hint: "힘이 셌던 나실인 사사" },
  { name: "룻",       chosung: "ㄹ",     era: "conquest",  hint: "시어머니를 따라간 이방 여인" },
  { name: "라합",     chosung: "ㄹㅎ",   era: "conquest",  hint: "정탐꾼을 숨겨 준 여리고 여인" },

  { name: "한나",     chosung: "ㅎㄴ",   era: "kingdom",   hint: "아들을 구하며 성전에서 기도한 어머니" },
  { name: "사무엘",   chosung: "ㅅㅁㅇ",  era: "kingdom",   hint: "마지막 사사이자 선지자, 왕에게 기름 부었다" },
  { name: "사울",     chosung: "ㅅㅇ",   era: "kingdom",   hint: "이스라엘의 첫 왕" },
  { name: "다윗",     chosung: "ㄷㅇ",   era: "kingdom",   hint: "목동 출신의 왕, 시편을 많이 썼다" },
  { name: "솔로몬",   chosung: "ㅅㄹㅁ",  era: "kingdom",   hint: "지혜를 구한 왕, 성전을 지었다" },
  { name: "엘리야",   chosung: "ㅇㄹㅇ",  era: "kingdom",   hint: "불을 내려 응답받은 선지자" },
  { name: "엘리사",   chosung: "ㅇㄹㅅ",  era: "kingdom",   hint: "스승의 뒤를 이어 갑절을 구한 선지자" },
  { name: "요나",     chosung: "ㅇㄴ",   era: "kingdom",   hint: "명령을 피해 배를 탔던 선지자" },
  { name: "다니엘",   chosung: "ㄷㄴㅇ",  era: "kingdom",   hint: "포로로 끌려가서도 기도를 멈추지 않았다" },
  { name: "느헤미야", chosung: "ㄴㅎㅁㅇ", era: "kingdom",   hint: "무너진 성벽을 다시 쌓은 사람" },
  { name: "에스더",   chosung: "ㅇㅅㄷ",  era: "kingdom",   hint: "민족을 위해 왕 앞에 나아간 왕비" },

  { name: "세례요한", chosung: "ㅅㄹㅇㅎ", era: "nt",        hint: "광야에서 회개를 외친 사람" },
  { name: "베드로",   chosung: "ㅂㄷㄹ",  era: "nt",        hint: "어부 출신 제자, 나중에 교회를 이끌었다" },
  { name: "요한",     chosung: "ㅇㅎ",   era: "nt",        hint: "예수님이 사랑하신 제자" },
  { name: "마태",     chosung: "ㅁㅌ",   era: "nt",        hint: "세리였다가 부름받은 제자" },
  { name: "도마",     chosung: "ㄷㅁ",   era: "nt",        hint: "직접 보아야 믿겠다던 제자" },
  { name: "바울",     chosung: "ㅂㅇ",   era: "nt",        hint: "교회를 핍박하다 돌이켜 전도자가 되었다" },
  { name: "스데반",   chosung: "ㅅㄷㅂ",  era: "nt",        hint: "돌에 맞아 죽은 첫 순교자" },
  { name: "삭개오",   chosung: "ㅅㄱㅇ",  era: "nt",        hint: "나무에 올라가 예수님을 본 세리장" },
  { name: "니고데모", chosung: "ㄴㄱㄷㅁ", era: "nt",        hint: "밤에 예수님을 찾아온 지도자" },
  { name: "마르다",   chosung: "ㅁㄹㄷ",  era: "nt",        hint: "대접에 분주했던 나사로의 자매" }
];
