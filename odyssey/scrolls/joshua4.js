// 4편 「여호수아와 함께」 — 여호수아 1–24장, 13장. 2026-10-12 1부(1~4장: 강하고 담대하라 · 라합과 붉은 줄 · 요단이 멈춤 · 기념 돌 열둘),
// 같은 날 2부(5~8장: 여호와의 군대 대장 · 여리고 · 아이 성 첫 패배와 아간 · 아이 성 매복).
// 대사 원칙: 성경 인물은 개역개정에 있는 자기 말만, 해설은 원문 + (출처). 2026-10-12 bskorea 개역개정(GAE) 수 1–8장 원문 대조.
// 무대: 1~3장은 모압 평지(수 2:1·3:1 "싯딤"), 2장 여리고와 4~6장 길갈은 요단 서쪽 「길갈과 여리고」 마을, 7·8장은 「아이와 에발 산」.
// 심판 장면(수 6:21 · 7:24-26 · 8:22-29)은 본문을 지우지 않고 해설로 읽되, 버튼·보상으로 만들지 않고 사건 뒤의 원경(돌무더기)만 보인다.
// 새 인물(라합·두 정탐꾼·동편 지파 대표)은 GPT/Meshy 모델이 오기 전까지 이미 있는 모델을 쓴다.
(window.__odyQ = window.__odyQ || []).push(api => {
  const { DLG, ZONES, CONDS, VERSES, THREE, SPEAKERS: { NAR } } = api;
  const JOSHUA = { n: '여호수아' }, EAST = { n: '르우벤·갓·므낫세 반 지파' }, SPIES = { n: '두 정탐꾼' }, RAHAB = { n: '라합' }, OFFICERS = { n: '관리들' };
  const CAPTAIN = { n: '여호와의 군대 대장' }, SCOUTS = { n: '아이를 정탐한 사람들' }, ACHAN = { n: '아간' };
  const cur = () => api.ST.cur === 'joshua' && api.ST.sp.joshua ? api.ST.sp.joshua : null;
  const at = (ch, a = 0, b = 99) => () => { const p = cur(); return !!p && p.ch === ch && !p.cleared && p.step >= a && p.step <= b; };
  const from = (ch, s = 0) => () => { const p = cur(); return !!p && (p.ch > ch || (p.ch === ch && (p.cleared || p.step >= s))); };
  const before = (ch, s = 0) => () => { const p = cur(); return !!p && (p.ch < ch || (p.ch === ch && !p.cleared && p.step < s)); };

  // ── 자리 ──
  // 모압 평지: 요단은 서쪽(x -45 ~ -38.5)
  const MJOSH = [18.5, -10], MEAST = [6, -4], MBANK = [-35, 2], MBED = [-41.7, 2];
  // 길갈과 여리고: 요단은 동쪽(x 38.5 ~ 45), 여리고 성은 서쪽, 산지는 북서쪽
  const JC = [-22, 6], JR = 10, HOUSE_A = 0.45, GBED = [41.7, 0], GBANK = [35, 0], GJOSH = [28, -6], MEMO = [14, 4], HILLS = [-26, -34];
  const HOUSE = [JC[0] + Math.cos(HOUSE_A) * (JR + 1.6), JC[1] + Math.sin(HOUSE_A) * (JR + 1.6)];   // 성벽 바깥, 라합의 창문 아래
  // 2부 길갈: 할례 산 · 진영 가운데 · 여리고 가까이(칼을 든 사람) · 성문 앞 · 진영 밖(라합) · 궤 · 아간의 장막 · 아골 골짜기(남쪽 원경)
  const HILL5 = [22, -31], CAMP5 = [8, 10], MAN = [-4, -4], GATE6 = [-7, 7], RAHAB_OUT = [-8, -20], ARK_G = [18, -8], ACHAN_T = [4, -9.6], ACHOR = [12, 40];
  // 아이와 에발 산: 아이 성(가운데 서쪽) · 벧엘(더 서쪽) · 북쪽 진 · 북쪽 두 산 사이의 궤 · 에발 산 제단
  const AI = [-8, 6], AIR = 6, AIGATE = [2, 6], BETHEL = [-38, 6], AMBUSH = [-24, 6], CAMP8 = [-8, -12], ARK_E = [0, -33], ALTAR = [12, -30];

  // 단계 번호(장 index · step index)
  // 0장: 0 여호수아 · 1 관리들 · 2 동편 지파
  // 1장: 0 정탐꾼을 보냄 · 1 요단을 건너 여리고로 · 2 삼대에 숨기기 · 3 라합의 고백 · 4 줄로 달아 내리기 · 5 산에서 사흘 · 6 요단을 건너 돌아가기 · 7 여호수아에게 보고
  // 2장: 0 싯딤에서 떠남 · 1 강가에서 말씀 · 2 이천 규빗 · 3 물이 멈춤 · 4 요단 가운데 마른 땅
  // 3장: 0 마른 땅으로 건너기 · 1 열두 사람 · 2 돌 열둘 · 3 백성이 다 건넘 · 4 제사장들이 올라옴 · 5 길갈의 열두 돌
  // 4장: 0 부싯돌 칼 · 1 할례 산 · 2 길갈의 날들(순서) · 3 칼을 든 사람
  // 5장: 0 성을 돌라 · 1 엿새와 일곱째 날 · 2 정탐한 두 사람에게 · 3 라합의 집 · 4 진영 밖의 라합
  // 6장: 0 아이로 보냄 · 1 아이로 올라감 · 2 성문 앞의 패배 · 3 길갈로 내려옴 · 4 궤 앞의 기도 · 5 지파대로 · 6 아간의 장막 · 7 아골 골짜기
  // 7장: 0 다시 아이로 · 1 아이로 올라감 · 2 매복과 신호 · 3 에발 산 제단
  let stopped = false;
  // doneDlg는 completeTask(단계 넘어감) 뒤에 읽히므로, 대사의 그 절에 이르기 전까지 장면을 붙잡아 둔다
  const hold = { walls: false, ai: false, altar: false };
  let achorShow = false;
  const wallsDown = () => from(5, 2)() && !hold.walls;
  const jerichoBurnt = () => from(5, 5)() || burnShow;
  let burnShow = false;   // 3:16 물이 그친 순간(대사 도중)부터 마른 땅
  const dryMoab = () => { const p = cur(); return !!p && ((p.ch === 2 && (p.cleared || p.step >= 4 || (stopped && p.step === 3))) || (p.ch === 3 && p.step === 0 && !p.cleared)); };
  const dryGilgal = () => { const p = cur(); return !!p && p.ch === 3 && !p.cleared && p.step <= 4; };
  const cordTied = from(1, 5);
  Object.assign(CONDS, {
    j4On: () => !!cur(),
    j4moab: () => { const p = cur(); return !!p && p.ch <= 2; },
    j4c0: at(0), j4c1: at(1), j4east: () => { const p = cur(); return !!p && p.ch === 0; },
    j4bank: () => !!cur() && !dryMoab(),   // 강가 나루(요단이 마른 동안에는 강 가운데 길로)
    j4back: () => { const p = cur(); return !!p && p.ch === 1 && p.step >= 5; },
    j4spiesHouse: at(1, 2, 4), j4spiesHills: at(1, 5, 5), j4hills: at(1, 5, 5),
    j4rahab: () => from(1, 2)() && before(5, 4)(), j4house: () => at(1, 2, 4)() || at(5, 3, 3)(),
    j5hill: at(4, 1, 1), j5camp: at(4, 2, 2), j5man: at(4, 3, 3), j6gate: at(5, 1, 1), j6rahabOut: from(5, 4),
    j7gate: at(6, 2, 2), j7ark: at(6, 4, 5), j7tent: at(6, 6, 6), j8camp: at(7, 2, 2), j8altar: at(7, 3, 3),
    j4c2: at(2), j4dryM: dryMoab, j4bed: () => { const p = cur(); return !!p && p.ch === 2 && !p.cleared && p.step >= 4; },
    j4cross: () => { const p = cur(); return !!p && ((p.ch === 2 && p.cleared) || (p.ch === 3 && p.step === 0)); },
    j4gilgal: from(3), j4dryG: dryGilgal, j4gbed: at(3, 2, 4), j4memo: from(3, 5),
  });
  const ZM = ZONES.moab.points, ZG = ZONES.gilgal.points;
  ZM.push({ id: 'j4_joshua', x: MJOSH[0], z: MJOSH[1], type: 'villager', title: '여호수아', model: 'joshua', persona: 'rs_static', cond: 'j4moab', body: '' });
  ZM.push({ id: 'j4_east', x: MEAST[0], z: MEAST[1], type: 'villager', title: '르우벤·갓·므낫세 반 지파', model: 'ca-israel-elder', persona: 'rs_static', cond: 'j4east', body: '' });
  ZM.push({ id: 'j4_bank', x: MBANK[0], z: MBANK[1], type: 'lore', title: '요단 강가', cond: 'j4c2', body: '' });
  ZM.push({ id: 'j4_mbed', x: MBED[0], z: MBED[1], type: 'lore', title: '요단 가운데 마른 땅', cond: 'j4bed', body: '' });
  ZM.push({ id: 'j4_priests', x: MBED[0], z: MBED[1] + 3.5, type: 'villager', title: '언약궤를 멘 제사장들', model: 'he-levite', persona: 'rs_static', cond: 'j4dryM', body: '' });
  ZM.push({ id: 'to-gilgal', x: -36.5, z: 9, type: 'exit', title: '요단을 건너 여리고로', to: 'gilgal', spawn: [34, 2], cond: 'j4bank' });
  ZM.push({ id: 'to-gilgal2', x: -43.6, z: -2, type: 'exit', title: '마른 땅으로 요단 건너편 길갈로', to: 'gilgal', spawn: [34, 0], cond: 'j4cross' });
  ZG.push({ id: 'j4_house', x: HOUSE[0], z: HOUSE[1], type: 'lore', title: '성벽 위 라합의 집', cond: 'j4house', body: '' });
  ZG.push({ id: 'j4_rahab', x: HOUSE[0] + 1.6, z: HOUSE[1] + 1.4, type: 'villager', title: '라합', model: 'he-mother', persona: 'rs_static', cond: 'j4rahab', body: '' });
  ZG.push({ id: 'j4_spies', x: HOUSE[0] + 2.2, z: HOUSE[1] - 1.2, type: 'villager', title: '두 정탐꾼', model: 'ca-tent-builder', persona: 'rs_static', cond: 'j4spiesHouse', body: '' });
  ZG.push({ id: 'j4_spies2', x: HILLS[0] + 2, z: HILLS[1] + 1, type: 'villager', title: '두 정탐꾼', model: 'ca-tent-builder', persona: 'rs_static', cond: 'j4spiesHills', body: '' });
  ZG.push({ id: 'j4_hills', x: HILLS[0], z: HILLS[1], type: 'lore', title: '산', cond: 'j4hills', body: '' });
  ZG.push({ id: 'j4_joshua_g', x: GJOSH[0], z: GJOSH[1], type: 'villager', title: '여호수아', model: 'joshua', persona: 'rs_static', cond: 'j4gilgal', body: '' });
  ZG.push({ id: 'j4_gbed', x: GBED[0], z: GBED[1] + 2.5, type: 'lore', title: '요단 가운데 — 제사장들의 발이 선 곳', cond: 'j4gbed', body: '' });
  ZG.push({ id: 'j4_gpriests', x: GBED[0], z: GBED[1] - 2.5, type: 'villager', title: '언약궤를 멘 제사장들', model: 'he-levite', persona: 'rs_static', cond: 'j4dryG', body: '' });
  ZG.push({ id: 'j4_memo', x: MEMO[0], z: MEMO[1], type: 'lore', title: '길갈 — 오늘밤 유숙할 곳', cond: 'j4memo', body: '' });
  // 2부
  ZG.push({ id: 'j5_hill', x: HILL5[0], z: HILL5[1], type: 'lore', title: '할례 산', cond: 'j5hill', body: '' });
  ZG.push({ id: 'j5_camp', x: CAMP5[0], z: CAMP5[1], type: 'lore', title: '길갈 진영 — 여리고 평지', cond: 'j5camp', body: '' });
  ZG.push({ id: 'j5_man', x: MAN[0], z: MAN[1], type: 'lore', title: '칼을 빼어 손에 든 한 사람', cond: 'j5man', body: '' });   // 수 5:13 — 얼굴·모습은 만들지 않고 빛으로만
  ZG.push({ id: 'j6_gate', x: GATE6[0], z: GATE6[1], type: 'lore', title: '굳게 닫힌 여리고 성문 앞', cond: 'j6gate', body: '' });
  ZG.push({ id: 'j6_rahab_out', x: RAHAB_OUT[0], z: RAHAB_OUT[1], type: 'villager', title: '진영 밖의 라합과 가족', model: 'he-mother', persona: 'rs_static', cond: 'j6rahabOut', body: '' });
  ZG.push({ id: 'j7_ark', x: ARK_G[0], z: ARK_G[1] + 2.6, type: 'lore', title: '여호와의 궤 앞', cond: 'j7ark', body: '' });
  ZG.push({ id: 'j7_tent', x: ACHAN_T[0], z: ACHAN_T[1], type: 'lore', title: '아간의 장막', cond: 'j7tent', body: '' });
  const ZA = ZONES.ai.points;
  ZA.push({ id: 'j7_aigate', x: AIGATE[0], z: AIGATE[1], type: 'lore', title: '아이 성문 앞', cond: 'j7gate', body: '' });
  ZA.push({ id: 'j8_camp', x: CAMP8[0], z: CAMP8[1], type: 'lore', title: '아이 북쪽 — 골짜기 건너편 진', cond: 'j8camp', body: '' });
  ZA.push({ id: 'j8_altar', x: ALTAR[0], z: ALTAR[1], type: 'lore', title: '에발 산 — 제단 쌓을 곳', cond: 'j8altar', body: '' });

  // ── 구절 카드(개역개정 원문) ──
  Object.assign(VERSES, {
    'jos1-9': { ref: '여호수아 1:9', text: '내가 네게 명령한 것이 아니냐 강하고 담대하라 두려워하지 말며 놀라지 말라 네가 어디로 가든지 네 하나님 여호와가 너와 함께 하느니라 하시니라' },
    'jos2-11': { ref: '여호수아 2:11', text: '우리가 듣자 곧 마음이 녹았고 너희로 말미암아 사람이 정신을 잃었나니 너희의 하나님 여호와는 위로는 하늘에서도 아래로는 땅에서도 하나님이시니라' },
    'jos3-17': { ref: '여호수아 3:17', text: '여호와의 언약궤를 멘 제사장들은 요단 가운데 마른 땅에 굳게 섰고 그 모든 백성이 요단을 건너기를 마칠 때까지 모든 이스라엘은 그 마른 땅으로 건너갔더라' },
    'jos4-24': { ref: '여호수아 4:24', text: '이는 땅의 모든 백성에게 여호와의 손이 강하신 것을 알게 하며 너희가 너희의 하나님 여호와를 항상 경외하게 하려 하심이라 하라' },
    'jos5-15': { ref: '여호수아 5:15', text: '여호와의 군대 대장이 여호수아에게 이르되 네 발에서 신을 벗으라 네가 선 곳은 거룩하니라 하니 여호수아가 그대로 행하니라' },
    'jos6-20': { ref: '여호수아 6:20', text: '이에 백성은 외치고 제사장들은 나팔을 불매 백성이 나팔 소리를 들을 때에 크게 소리 질러 외치니 성벽이 무너져 내린지라 백성이 각기 앞으로 나아가 그 성에 들어가서 그 성을 점령하고' },
    'jos7-20': { ref: '여호수아 7:20', text: '아간이 여호수아에게 대답하여 이르되 참으로 나는 이스라엘의 하나님 여호와께 범죄하여 이러이러하게 행하였나이다' },
    'jos8-35': { ref: '여호수아 8:35', text: '모세가 명령한 것은 여호수아가 이스라엘 온 회중과 여자들과 아이와 그들 중에 동행하는 거류민들 앞에서 낭독하지 아니한 말이 하나도 없었더라' },
  });

  // ── 대사(개역개정 원문) ──
  Object.assign(DLG, {
    // 1장 「강하고 담대하라」 — 수 1장
    j4_call: [
      [NAR, '여호와의 종 모세가 죽은 후에 여호와께서 모세의 수종자 눈의 아들 여호수아에게 말씀하여 이르시되 (수 1:1)'],
      [NAR, '내 종 모세가 죽었으니 이제 너는 이 모든 백성과 더불어 일어나 이 요단을 건너 내가 그들 곧 이스라엘 자손에게 주는 그 땅으로 가라 (수 1:2)'],
      [NAR, '내가 모세에게 말한 바와 같이 너희 발바닥으로 밟는 곳은 모두 내가 너희에게 주었노니 (수 1:3)'],
      [NAR, '네 평생에 너를 능히 대적할 자가 없으리니 내가 모세와 함께 있었던 것 같이 너와 함께 있을 것임이니라 내가 너를 떠나지 아니하며 버리지 아니하리니 (수 1:5)'],
      [NAR, '강하고 담대하라 너는 내가 그들의 조상에게 맹세하여 그들에게 주리라 한 땅을 이 백성에게 차지하게 하리라 (수 1:6)'],
      [NAR, '오직 강하고 극히 담대하여 나의 종 모세가 네게 명령한 그 율법을 다 지켜 행하고 우로나 좌로나 치우치지 말라 그리하면 어디로 가든지 형통하리니 (수 1:7)'],
      [NAR, '이 율법책을 네 입에서 떠나지 말게 하며 주야로 그것을 묵상하여 그 안에 기록된 대로 다 지켜 행하라 그리하면 네 길이 평탄하게 될 것이며 네가 형통하리라 (수 1:8)'],
      [NAR, '내가 네게 명령한 것이 아니냐 강하고 담대하라 두려워하지 말며 놀라지 말라 네가 어디로 가든지 네 하나님 여호와가 너와 함께 하느니라 하시니라 (수 1:9)'],
    ],
    j4_officers: [
      [NAR, '이에 여호수아가 그 백성의 관리들에게 명령하여 이르되 (수 1:10)'],
      [JOSHUA, '진중에 두루 다니며 그 백성에게 명령하여 이르기를 양식을 준비하라 사흘 안에 너희가 이 요단을 건너 너희의 하나님 여호와께서 너희에게 주사 차지하게 하시는 땅을 차지하기 위하여 들어갈 것임이니라 하라'],
      [NAR, '▶ 진영 가운데 서 있는 르우벤·갓·므낫세 반 지파에게 가요.'],
    ],
    j4_east: [
      [NAR, '여호수아가 또 르우벤 지파와 갓 지파와 므낫세 반 지파에게 말하여 이르되 (수 1:12)'],
      [JOSHUA, '여호와의 종 모세가 너희에게 명령하여 이르기를 너희의 하나님 여호와께서 너희에게 안식을 주시며 이 땅을 너희에게 주시리라 하였나니 너희는 그 말을 기억하라'],
      [JOSHUA, '너희의 처자와 가축은 모세가 너희에게 준 요단 이쪽 땅에 머무르려니와 너희 모든 용사들은 무장하고 너희의 형제보다 앞서 건너가서 그들을 돕되'],
      [JOSHUA, '여호와께서 너희를 안식하게 하신 것 같이 너희의 형제도 안식하며 그들도 너희의 하나님 여호와께서 주시는 그 땅을 차지하기까지 하라 그리고 너희는 너희 소유지 곧 여호와의 종 모세가 너희에게 준 요단 이쪽 해 돋는 곳으로 돌아와서 그것을 차지할지니라'],
    ],
    j4_answer: [
      [NAR, '그들이 여호수아에게 대답하여 이르되 (수 1:16)'],
      [EAST, '당신이 우리에게 명령하신 것은 우리가 다 행할 것이요 당신이 우리를 보내시는 곳에는 우리가 가리이다'],
      [EAST, '우리는 범사에 모세에게 순종한 것 같이 당신에게 순종하려니와 오직 당신의 하나님 여호와께서 모세와 함께 계시던 것 같이 당신과 함께 계시기를 원하나이다'],
      [EAST, '누구든지 당신의 명령을 거역하며 당신의 말씀을 순종하지 아니하는 자는 죽임을 당하리니 오직 강하고 담대하소서'],
    ],
    // 2장 「라합과 붉은 줄」 — 수 2장
    j4_send: [
      [NAR, '눈의 아들 여호수아가 싯딤에서 두 사람을 정탐꾼으로 보내며 이르되 (수 2:1)'],
      [JOSHUA, '가서 그 땅과 여리고를 엿보라'],
      [NAR, '▶ 요단 강가의 빛나는 길로 가서 강 건너 여리고로 가요.'],
    ],
    j4_jericho: [
      [NAR, '하매 그들이 가서 라합이라 하는 기생의 집에 들어가 거기서 유숙하더니 (수 2:1)'],
      [NAR, '▶ 정탐꾼들을 지붕으로 — 지붕에 벌여 놓은 삼대 아래에 숨겨요.'],
    ],
    j4_king: [
      [NAR, '어떤 사람이 여리고 왕에게 말하여 이르되 보소서 이 밤에 이스라엘 자손 중의 몇 사람이 이 땅을 정탐하러 이리로 들어왔나이다 (수 2:2)'],
      [NAR, '여리고 왕이 라합에게 사람을 보내어 이르되 네게로 와서 네 집에 들어간 그 사람들을 끌어내라 그들은 이 온 땅을 정탐하러 왔느니라 (수 2:3)'],
      [NAR, '그 여인이 그 두 사람을 이미 숨긴지라 이르되 과연 그 사람들이 내게 왔었으나 그들이 어디에서 왔는지 나는 알지 못하였고 (수 2:4)'],
      [NAR, '그 사람들이 어두워 성문을 닫을 때쯤 되어 나갔으니 어디로 갔는지 내가 알지 못하나 급히 따라가라 그리하면 그들을 따라잡으리라 하였으나 (수 2:5)'],
      [NAR, '그가 이미 그들을 이끌고 지붕에 올라가서 그 지붕에 벌여 놓은 삼대에 숨겼더라 (수 2:6)'],
      [NAR, '그 사람들은 요단 나루터까지 그들을 쫓아갔고 그들을 뒤쫓는 자들이 나가자 곧 성문을 닫았더라 (수 2:7)'],
    ],
    j4_roof: [
      [NAR, '또 그들이 눕기 전에 라합이 지붕에 올라가서 그들에게 이르러 (수 2:8)'],
      [NAR, '말하되 (수 2:9)'],
      [RAHAB, '여호와께서 이 땅을 너희에게 주신 줄을 내가 아노라 우리가 너희를 심히 두려워하고 이 땅 주민들이 다 너희 앞에서 간담이 녹나니'],
      [RAHAB, '이는 너희가 애굽에서 나올 때에 여호와께서 너희 앞에서 홍해 물을 마르게 하신 일과 너희가 요단 저쪽에 있는 아모리 사람의 두 왕 시혼과 옥에게 행한 일 곧 그들을 전멸시킨 일을 우리가 들었음이니라'],
      [RAHAB, '우리가 듣자 곧 마음이 녹았고 너희로 말미암아 사람이 정신을 잃었나니 너희의 하나님 여호와는 위로는 하늘에서도 아래로는 땅에서도 하나님이시니라'],
      [RAHAB, '그러므로 이제 청하노니 내가 너희를 선대하였은즉 너희도 내 아버지의 집을 선대하도록 여호와로 내게 맹세하고 내게 증표를 내라'],
      [RAHAB, '그리고 나의 부모와 나의 남녀 형제와 그들에게 속한 모든 사람을 살려 주어 우리 목숨을 죽음에서 건져내라'],
      [NAR, '그 사람들이 그에게 이르되 (수 2:14)'],
      [SPIES, '네가 우리의 이 일을 누설하지 아니하면 우리의 목숨으로 너희를 대신할 것이요 여호와께서 우리에게 이 땅을 주실 때에는 인자하고 진실하게 너를 대우하리라'],
    ],
    j4_window: [
      [NAR, '라합이 그들을 창문에서 줄로 달아 내리니 그의 집이 성벽 위에 있으므로 그가 성벽 위에 거주하였음이라 (수 2:15)'],
    ],
    j4_cord: [
      [NAR, '라합이 그들에게 이르되 (수 2:16)'],
      [RAHAB, '두렵건대 뒤쫓는 사람들이 너희와 마주칠까 하노니 너희는 산으로 가서 거기서 사흘 동안 숨어 있다가 뒤쫓는 자들이 돌아간 후에 너희의 길을 갈지니라'],
      [NAR, '그 사람들이 그에게 이르되 (수 2:17)'],
      [SPIES, '네가 우리에게 서약하게 한 이 맹세에 대하여 우리가 허물이 없게 하리니'],
      [SPIES, '우리가 이 땅에 들어올 때에 우리를 달아 내린 창문에 이 붉은 줄을 매고 네 부모와 형제와 네 아버지의 가족을 다 네 집에 모으라'],
      [SPIES, '누구든지 네 집 문을 나가서 거리로 가면 그의 피가 그의 머리로 돌아갈 것이요 우리는 허물이 없으리라 그러나 누구든지 너와 함께 집에 있는 자에게 손을 대면 그의 피는 우리의 머리로 돌아오려니와'],
      [SPIES, '네가 우리의 이 일을 누설하면 네가 우리에게 서약하게 한 맹세에 대하여 우리에게 허물이 없으리라'],
      [NAR, '라합이 이르되 (수 2:21)'],
      [RAHAB, '너희의 말대로 할 것이라'],
      [NAR, '하고 그들을 보내어 가게 하고 붉은 줄을 창문에 매니라 (수 2:21)'],
      { event: 'redCord' },
      [NAR, '▶ 북서쪽 산으로 가요.'],
    ],
    j4_hills_done: [
      [NAR, '그들이 가서 산에 이르러 뒤쫓는 자들이 돌아가기까지 사흘을 거기 머물매 뒤쫓는 자들이 그들을 길에서 두루 찾다가 찾지 못하니라 (수 2:22)'],
      [NAR, '▶ 강을 건너 여호수아에게 돌아가요.'],
    ],
    j4_report: [
      [NAR, '그 두 사람이 돌이켜 산에서 내려와 강을 건너 눈의 아들 여호수아에게 나아가서 그들이 겪은 모든 일을 고하고 (수 2:23)'],
      [NAR, '또 여호수아에게 이르되 (수 2:24)'],
      [SPIES, '진실로 여호와께서 그 온 땅을 우리 손에 주셨으므로 그 땅의 모든 주민이 우리 앞에서 간담이 녹더이다'],
    ],
    // 3장 「요단이 멈춤」 — 수 3장
    j4_early: [
      [NAR, '또 여호수아가 아침에 일찍이 일어나서 그와 모든 이스라엘 자손들과 더불어 싯딤에서 떠나 요단에 이르러 건너가기 전에 거기서 유숙하니라 (수 3:1)'],
      [NAR, '사흘 후에 관리들이 진중으로 두루 다니며 (수 3:2)'],
      [NAR, '백성에게 명령하여 이르되 (수 3:3)'],
      [OFFICERS, '너희는 레위 사람 제사장들이 너희 하나님 여호와의 언약궤 메는 것을 보거든 너희가 있는 곳을 떠나 그 뒤를 따르라'],
      [OFFICERS, '그러나 너희와 그 사이 거리가 이천 규빗쯤 되게 하고 그것에 가까이 하지는 말라 그리하면 너희가 행할 길을 알리니 너희가 이전에 이 길을 지나보지 못하였음이니라'],
      [NAR, '여호수아가 또 백성에게 이르되 (수 3:5)'],
      [JOSHUA, '너희는 자신을 성결하게 하라 여호와께서 내일 너희 가운데에 기이한 일들을 행하시리라'],
      [NAR, '여호수아가 또 제사장들에게 말하여 이르되 (수 3:6)'],
      [JOSHUA, '언약궤를 메고 백성에 앞서 건너라'],
      [NAR, '하매 곧 언약궤를 메고 백성에 앞서 나아가니라 (수 3:6)'],
      [NAR, '▶ 서쪽 요단 강가로 가요.'],
    ],
    j4_word: [
      [NAR, '여호와께서 여호수아에게 이르시되 내가 오늘부터 시작하여 너를 온 이스라엘의 목전에서 크게 하여 내가 모세와 함께 있었던 것 같이 너와 함께 있는 것을 그들이 알게 하리라 (수 3:7)'],
      [NAR, '너는 언약궤를 멘 제사장들에게 명령하여 이르기를 너희가 요단 물 가에 이르거든 요단에 들어서라 하라 (수 3:8)'],
      [NAR, '여호수아가 이스라엘 자손에게 이르되 (수 3:9)'],
      [JOSHUA, '이리 와서 너희의 하나님 여호와의 말씀을 들으라'],
      [NAR, '또 말하되 (수 3:10)'],
      [JOSHUA, '살아 계신 하나님이 너희 가운데에 계시사 가나안 족속과 헷 족속과 히위 족속과 브리스 족속과 기르가스 족속과 아모리 족속과 여부스 족속을 너희 앞에서 반드시 쫓아내실 줄을 이것으로서 너희가 알리라'],
      [JOSHUA, '보라 온 땅의 주의 언약궤가 너희 앞에서 요단을 건너가나니'],
      [JOSHUA, '이제 이스라엘 지파 중에서 각 지파에 한 사람씩 열두 명을 택하라'],
      [JOSHUA, '온 땅의 주 여호와의 궤를 멘 제사장들의 발바닥이 요단 물을 밟고 멈추면 요단 물 곧 위에서부터 흘러내리던 물이 끊어지고 한 곳에 쌓여 서리라'],
    ],
    j4_follow_intro: [
      [NAR, '백성이 요단을 건너려고 자기들의 장막을 떠날 때에 제사장들은 언약궤를 메고 백성 앞에서 나아가니라 (수 3:14)'],
    ],
    j4_stop: [
      [NAR, '요단이 곡식 거두는 시기에는 항상 언덕에 넘치더라 궤를 멘 자들이 요단에 이르며 궤를 멘 제사장들의 발이 물 가에 잠기자 (수 3:15)'],
      [NAR, '곧 위에서부터 흘러내리던 물이 그쳐서 사르단에 가까운 매우 멀리 있는 아담 성읍 변두리에 일어나 한 곳에 쌓이고 아라바의 바다 염해로 향하여 흘러가는 물은 온전히 끊어지매 백성이 여리고 앞으로 바로 건널새 (수 3:16)'],
      { event: 'jordanStop' },
      [NAR, '▶ 요단 가운데 마른 땅으로 들어가요.'],
    ],
    j4_dry: [
      [NAR, '여호와의 언약궤를 멘 제사장들은 요단 가운데 마른 땅에 굳게 섰고 그 모든 백성이 요단을 건너기를 마칠 때까지 모든 이스라엘은 그 마른 땅으로 건너갔더라 (수 3:17)'],
    ],
    // 4장 「기념 돌 열둘」 — 수 4장
    j4_twelve: [
      [NAR, '그 모든 백성이 요단을 건너가기를 마치매 여호와께서 여호수아에게 말씀하여 이르시되 (수 4:1)'],
      [NAR, '백성의 각 지파에 한 사람씩 열두 사람을 택하고 (수 4:2)'],
      [NAR, '그들에게 명령하여 이르기를 요단 가운데 제사장들의 발이 굳게 선 그 곳에서 돌 열둘을 택하여 그것을 가져다가 오늘밤 너희가 유숙할 그 곳에 두게 하라 하시니라 (수 4:3)'],
      [NAR, '여호수아가 이스라엘 자손 중에서 각 지파에 한 사람씩 준비한 그 열두 사람을 불러 (수 4:4)'],
      [NAR, '그들에게 이르되 (수 4:5)'],
      [JOSHUA, '요단 가운데로 들어가 너희 하나님 여호와의 궤 앞으로 가서 이스라엘 자손들의 지파 수대로 각기 돌 한 개씩 가져다가 어깨에 메라'],
      [JOSHUA, '이것이 너희 중에 표징이 되리라 후일에 너희의 자손들이 물어 이르되 이 돌들은 무슨 뜻이냐 하거든'],
      [JOSHUA, '그들에게 이르기를 요단 물이 여호와의 언약궤 앞에서 끊어졌나니 곧 언약궤가 요단을 건널 때에 요단 물이 끊어졌으므로 이 돌들이 이스라엘 자손에게 영원히 기념이 되리라 하라'],
      [NAR, '▶ 동쪽 요단 가운데, 제사장들의 발이 선 곳으로 가요.'],
    ],
    j4_carry: [
      [NAR, '이스라엘 자손들이 여호수아가 명령한 대로 행하되 여호와께서 여호수아에게 이르신 대로 이스라엘 자손들의 지파의 수를 따라 요단 가운데에서 돌 열둘을 택하여 자기들이 유숙할 곳으로 가져다가 거기에 두었더라 (수 4:8)'],
      [NAR, '여호수아가 또 요단 가운데 곧 언약궤를 멘 제사장들의 발이 선 곳에 돌 열둘을 세웠더니 오늘까지 거기에 있더라 (수 4:9)'],
    ],
    j4_crossed: [
      [NAR, '또 여호와께서 여호수아에게 명령하사 백성에게 말하게 하신 일 곧 모세가 여호수아에게 명령한 일이 다 마치기까지 궤를 멘 제사장들이 요단 가운데에 서 있고 백성은 속히 건넜으며 (수 4:10)'],
      [NAR, '모든 백성이 건너기를 마친 후에 여호와의 궤와 제사장들이 백성의 목전에서 건넜으며 (수 4:11)'],
      [NAR, '르우벤 자손과 갓 자손과 므낫세 반 지파는 모세가 그들에게 이른 것 같이 무장하고 이스라엘 자손들보다 앞서 건너갔으니 (수 4:12)'],
      [NAR, '무장한 사만 명 가량이 여호와 앞에서 건너가 싸우려고 여리고 평지에 이르니라 (수 4:13)'],
      [NAR, '그 날에 여호와께서 모든 이스라엘의 목전에서 여호수아를 크게 하시매 그가 생존한 날 동안에 백성이 그를 두려워하기를 모세를 두려워하던 것 같이 하였더라 (수 4:14)'],
    ],
    j4_up: [
      [NAR, '여호와께서 여호수아에게 말씀하여 이르시되 (수 4:15)'],
      [NAR, '증거궤를 멘 제사장들에게 명령하여 요단에서 올라오게 하라 하신지라 (수 4:16)'],
      [NAR, '여호수아가 제사장들에게 명령하여 이르기를 (수 4:17)'],
      [JOSHUA, '요단에서 올라오라'],
      [NAR, '여호와의 언약궤를 멘 제사장들이 요단 가운데에서 나오며 그 발바닥으로 육지를 밟는 동시에 요단 물이 본 곳으로 도로 흘러서 전과 같이 언덕에 넘쳤더라 (수 4:18)'],
      { event: 'jordanBack' },
      [NAR, '▶ 길갈, 오늘밤 유숙할 곳으로 가요.'],
    ],
    j4_gilgal: [
      [NAR, '첫째 달 십일에 백성이 요단에서 올라와 여리고 동쪽 경계 길갈에 진 치매 (수 4:19)'],
      [NAR, '여호수아가 요단에서 가져온 그 열두 돌을 길갈에 세우고 (수 4:20)'],
      { event: 'stonesUp' },
      [NAR, '이스라엘 자손들에게 말하여 이르되 (수 4:21)'],
      [JOSHUA, '후일에 너희의 자손들이 그들의 아버지에게 묻기를 이 돌들은 무슨 뜻이니이까 하거든'],
      [JOSHUA, '너희는 너희의 자손들에게 알게 하여 이르기를 이스라엘이 마른 땅을 밟고 이 요단을 건넜음이라'],
      [JOSHUA, '너희의 하나님 여호와께서 요단 물을 너희 앞에서 마르게 하사 너희를 건너게 하신 것이 너희의 하나님 여호와께서 우리 앞에 홍해를 말리시고 우리를 건너게 하심과 같았나니'],
      [JOSHUA, '이는 땅의 모든 백성에게 여호와의 손이 강하신 것을 알게 하며 너희가 너희의 하나님 여호와를 항상 경외하게 하려 하심이라 하라'],
    ],
    // 5장 「여호와의 군대 대장」 — 수 5장
    j5_flint: [
      [NAR, '요단 서쪽의 아모리 사람의 모든 왕들과 해변의 가나안 사람의 모든 왕들이 여호와께서 요단 물을 이스라엘 자손들 앞에서 말리시고 우리를 건너게 하셨음을 듣고 마음이 녹았고 이스라엘 자손들 때문에 정신을 잃었더라 (수 5:1)'],
      [NAR, '그 때에 여호와께서 여호수아에게 이르시되 너는 부싯돌로 칼을 만들어 이스라엘 자손들에게 다시 할례를 행하라 하시매 (수 5:2)'],
      [NAR, '여호수아가 부싯돌로 칼을 만들어 할례 산에서 이스라엘 자손들에게 할례를 행하니라 (수 5:3)'],
      [NAR, '▶ 진영 북쪽의 할례 산으로 가요.'],
    ],
    j5_why: [
      [NAR, '여호수아가 할례를 시행한 까닭은 이것이니 애굽에서 나온 모든 백성 중 남자 곧 모든 군사는 애굽에서 나온 후 광야 길에서 죽었는데 (수 5:4)'],
      [NAR, '그 나온 백성은 다 할례를 받았으나 다만 애굽에서 나온 후 광야 길에서 난 자는 할례를 받지 못하였음이라 (수 5:5)'],
      [NAR, '이스라엘 자손들이 여호와의 음성을 청종하지 아니하므로 여호와께서 그들에게 대하여 맹세하사 그들의 조상들에게 맹세하여 우리에게 주리라고 하신 땅 곧 젖과 꿀이 흐르는 땅을 그들이 보지 못하게 하리라 하시매 애굽에서 나온 족속 곧 군사들이 다 멸절하기까지 사십 년 동안을 광야에서 헤매었더니 (수 5:6)'],
      [NAR, '그들의 대를 잇게 하신 이 자손에게 여호수아가 할례를 행하였으니 길에서는 그들에게 할례를 행하지 못하였으므로 할례 없는 자가 되었음이었더라 (수 5:7)'],
      [NAR, '또 그 모든 백성에게 할례 행하기를 마치매 백성이 진중 각 처소에 머물며 낫기를 기다릴 때에 (수 5:8)'],
      [NAR, '여호와께서 여호수아에게 이르시되 내가 오늘 애굽의 수치를 너희에게서 떠나가게 하였다 하셨으므로 그 곳 이름을 오늘까지 길갈이라 하느니라 (수 5:9)'],
      [NAR, '▶ 길갈 진영 가운데로 가요.'],
    ],
    j5_manna: [
      [NAR, '또 이스라엘 자손들이 길갈에 진 쳤고 그 달 십사일 저녁에는 여리고 평지에서 유월절을 지켰으며 (수 5:10)'],
      [NAR, '유월절 이튿날에 그 땅의 소산물을 먹되 그 날에 무교병과 볶은 곡식을 먹었더라 (수 5:11)'],
      [NAR, '또 그 땅의 소산물을 먹은 다음 날에 만나가 그쳤으니 이스라엘 사람들이 다시는 만나를 얻지 못하였고 그 해에 가나안 땅의 소출을 먹었더라 (수 5:12)'],
      [NAR, '▶ 서쪽, 여리고 가까이로 가요.'],
    ],
    j5_man: [
      [NAR, '여호수아가 여리고에 가까이 이르렀을 때에 눈을 들어 본즉 한 사람이 칼을 빼어 손에 들고 마주 서 있는지라 여호수아가 나아가서 그에게 묻되 (수 5:13)'],
      [JOSHUA, '너는 우리를 위하느냐 우리의 적들을 위하느냐'],
    ],
    j5_holy: [
      [NAR, '그가 이르되 (수 5:14)'],
      [CAPTAIN, '아니라 나는 여호와의 군대 대장으로 지금 왔느니라'],
      [NAR, '하는지라 여호수아가 얼굴을 땅에 대고 엎드려 절하고 그에게 이르되 (수 5:14)'],
      [JOSHUA, '내 주여 종에게 무슨 말씀을 하려 하시나이까'],
      [NAR, '여호와의 군대 대장이 여호수아에게 이르되 (수 5:15)'],
      [CAPTAIN, '네 발에서 신을 벗으라 네가 선 곳은 거룩하니라'],
      [NAR, '하니 여호수아가 그대로 행하니라 (수 5:15)'],
    ],
    // 6장 「여리고」 — 수 6장
    j6_word: [
      [NAR, '이스라엘 자손들로 말미암아 여리고는 굳게 닫혔고 출입하는 자가 없더라 (수 6:1)'],
      [NAR, '여호와께서 여호수아에게 이르시되 보라 내가 여리고와 그 왕과 용사들을 네 손에 넘겨 주었으니 (수 6:2)'],
      [NAR, '너희 모든 군사는 그 성을 둘러 성 주위를 매일 한 번씩 돌되 엿새 동안을 그리하라 (수 6:3)'],
      [NAR, '제사장 일곱은 일곱 양각 나팔을 잡고 언약궤 앞에서 나아갈 것이요 일곱째 날에는 그 성을 일곱 번 돌며 그 제사장들은 나팔을 불 것이며 (수 6:4)'],
      [NAR, '제사장들이 양각 나팔을 길게 불어 그 나팔 소리가 너희에게 들릴 때에는 백성은 다 큰 소리로 외쳐 부를 것이라 그리하면 그 성벽이 무너져 내리리니 백성은 각기 앞으로 올라갈지니라 하시매 (수 6:5)'],
      [NAR, '눈의 아들 여호수아가 제사장들을 불러 그들에게 이르되 (수 6:6)'],
      [JOSHUA, '너희는 언약궤를 메고 제사장 일곱은 양각 나팔 일곱을 잡고 여호와의 궤 앞에서 나아가라'],
      [NAR, '또 백성에게 이르되 (수 6:7)'],
      [JOSHUA, '나아가서 그 성을 돌되 무장한 자들이 여호와의 궤 앞에서 나아갈지니라'],
      [NAR, '▶ 굳게 닫힌 여리고 성문 앞으로 가요.'],
    ],
    j6_march: [
      [NAR, '여호수아가 백성에게 이르기를 마치매 제사장 일곱은 양각 나팔 일곱을 잡고 여호와 앞에서 나아가며 나팔을 불고 여호와의 언약궤는 그 뒤를 따르며 (수 6:8)'],
      [NAR, '그 무장한 자들은 나팔 부는 제사장들 앞에서 행진하며 후군은 궤 뒤를 따르고 제사장들은 나팔을 불며 행진하더라 (수 6:9)'],
      [NAR, '여호수아가 백성에게 명령하여 이르되 (수 6:10)'],
      [JOSHUA, '너희는 외치지 말며 너희 음성을 들리게 하지 말며 너희 입에서 아무 말도 내지 말라 그리하다가 내가 너희에게 명령하여 외치라 하는 날에 외칠지니라'],
      [NAR, '여호와의 궤가 그 성을 한 번 돌게 하고 그들이 진영으로 들어와서 진영에서 자니라 (수 6:11)'],
      [NAR, '또 여호수아가 아침에 일찍이 일어나니 제사장들이 여호와의 궤를 메고 (수 6:12)'],
      [NAR, '제사장 일곱은 양각 나팔 일곱을 잡고 여호와의 궤 앞에서 계속 행진하며 나팔을 불고 무장한 자들은 그 앞에 행진하며 후군은 여호와의 궤 뒤를 따르고 제사장들은 나팔을 불며 행진하니라 (수 6:13)'],
      [NAR, '그 둘째 날에도 그 성을 한 번 돌고 진영으로 돌아오니라 엿새 동안을 이같이 행하니라 (수 6:14)'],
    ],
    j6_fall: [
      [NAR, '일곱째 날 새벽에 그들이 일찍이 일어나서 전과 같은 방식으로 그 성을 일곱 번 도니 그 성을 일곱 번 돌기는 그 날뿐이었더라 (수 6:15)'],
      [NAR, '일곱 번째에 제사장들이 나팔을 불 때에 여호수아가 백성에게 이르되 (수 6:16)'],
      [JOSHUA, '외치라 여호와께서 너희에게 이 성을 주셨느니라'],
      [JOSHUA, '이 성과 그 가운데에 있는 모든 것은 여호와께 온전히 바치되 기생 라합과 그 집에 동거하는 자는 모두 살려 주라 이는 우리가 보낸 사자들을 그가 숨겨 주었음이니라'],
      [JOSHUA, '너희는 온전히 바치고 그 바친 것 중에서 어떤 것이든지 취하여 너희가 이스라엘 진영으로 바치는 것이 되게 하여 고통을 당하게 되지 아니하도록 오직 너희는 그 바친 물건에 손대지 말라'],
      [JOSHUA, '은금과 동철 기구들은 다 여호와께 구별될 것이니 그것을 여호와의 곳간에 들일지니라'],
      [NAR, '이에 백성은 외치고 제사장들은 나팔을 불매 백성이 나팔 소리를 들을 때에 크게 소리 질러 외치니 성벽이 무너져 내린지라 백성이 각기 앞으로 나아가 그 성에 들어가서 그 성을 점령하고 (수 6:20)'],
      { event: 'wallsFall' },
      [NAR, '그 성 안에 있는 모든 것을 온전히 바치되 남녀 노소와 소와 양과 나귀를 칼날로 멸하니라 (수 6:21)'],
      [NAR, '▶ 진영의 여호수아에게 가요.'],
    ],
    j6_spies: [
      [NAR, '여호수아가 그 땅을 정탐한 두 사람에게 이르되 (수 6:22)'],
      [JOSHUA, '그 기생의 집에 들어가서 너희가 그 여인에게 맹세한 대로 그와 그에게 속한 모든 것을 이끌어 내라'],
      [NAR, '▶ 창문에 붉은 줄이 매인 라합의 집으로 가요.'],
    ],
    j6_rescue: [
      [NAR, '정탐한 젊은이들이 들어가서 라합과 그의 부모와 그의 형제와 그에게 속한 모든 것을 이끌어 내고 또 그의 친족도 다 이끌어 내어 그들을 이스라엘의 진영 밖에 두고 (수 6:23)'],
      [NAR, '▶ 진영 밖의 라합에게 가요.'],
    ],
    j6_end: [
      [NAR, '무리가 그 성과 그 가운데에 있는 모든 것을 불로 사르고 은금과 동철 기구는 여호와의 집 곳간에 두었더라 (수 6:24)'],
      { event: 'jerichoBurn' },
      [NAR, '여호수아가 기생 라합과 그의 아버지의 가족과 그에게 속한 모든 것을 살렸으므로 그가 오늘까지 이스라엘 중에 거주하였으니 이는 여호수아가 여리고를 정탐하려고 보낸 사자들을 숨겼음이었더라 (수 6:25)'],
      [NAR, '여호수아가 그 때에 맹세하게 하여 이르되 (수 6:26)'],
      [JOSHUA, '누구든지 일어나서 이 여리고 성을 건축하는 자는 여호와 앞에서 저주를 받을 것이라 그 기초를 쌓을 때에 그의 맏아들을 잃을 것이요 그 문을 세울 때에 그의 막내아들을 잃으리라'],
      [NAR, '여호와께서 여호수아와 함께 하시니 여호수아의 소문이 그 온 땅에 퍼지니라 (수 6:27)'],
    ],
    // 7장 「아이 성 첫 패배와 아간」 — 수 7장
    j7_send: [
      [NAR, '이스라엘 자손들이 온전히 바친 물건으로 말미암아 범죄하였으니 이는 유다 지파 세라의 증손 삽디의 손자 갈미의 아들 아간이 온전히 바친 물건을 가졌음이라 여호와께서 이스라엘 자손들에게 진노하시니라 (수 7:1)'],
      [NAR, '여호수아가 여리고에서 사람을 벧엘 동쪽 벧아웬 곁에 있는 아이로 보내며 그들에게 말하여 이르되 (수 7:2)'],
      [JOSHUA, '올라가서 그 땅을 정탐하라'],
      [NAR, '하매 그 사람들이 올라가서 아이를 정탐하고 (수 7:2)'],
      [NAR, '여호수아에게로 돌아와 그에게 이르되 (수 7:3)'],
      [SCOUTS, '백성을 다 올라가게 하지 말고 이삼천 명만 올라가서 아이를 치게 하소서 그들은 소수이니 모든 백성을 그리로 보내어 수고롭게 하지 마소서'],
      [NAR, '▶ 서쪽 길로 아이에 올라가요.'],
    ],
    j7_defeat: [
      [NAR, '백성 중 삼천 명쯤 그리로 올라갔다가 아이 사람 앞에서 도망하니 (수 7:4)'],
      [NAR, '아이 사람이 그들을 삼십육 명쯤 쳐죽이고 성문 앞에서부터 스바림까지 쫓아가 내려가는 비탈에서 쳤으므로 백성의 마음이 녹아 물 같이 된지라 (수 7:5)'],
      [NAR, '▶ 동쪽 길로 길갈에 내려가요.'],
    ],
    j7_pray: [
      [NAR, '여호수아가 옷을 찢고 이스라엘 장로들과 함께 여호와의 궤 앞에서 땅에 엎드려 머리에 티끌을 뒤집어쓰고 저물도록 있다가 (수 7:6)'],
      [NAR, '이르되 (수 7:7)'],
      [JOSHUA, '슬프도소이다 주 여호와여 어찌하여 이 백성을 인도하여 요단을 건너게 하시고 우리를 아모리 사람의 손에 넘겨 멸망시키려 하셨나이까 우리가 요단 저쪽을 만족하게 여겨 거주하였더면 좋을 뻔하였나이다'],
      [JOSHUA, '주여 이스라엘이 그의 원수들 앞에서 돌아섰으니 내가 무슨 말을 하오리이까'],
      [JOSHUA, '가나안 사람과 이 땅의 모든 사람들이 듣고 우리를 둘러싸고 우리 이름을 세상에서 끊으리니 주의 크신 이름을 위하여 어떻게 하시려 하나이까'],
      [NAR, '여호와께서 여호수아에게 이르시되 일어나라 어찌하여 이렇게 엎드렸느냐 (수 7:10)'],
      [NAR, '이스라엘이 범죄하여 내가 그들에게 명령한 나의 언약을 어겼으며 또한 그들이 온전히 바친 물건을 가져가고 도둑질하며 속이고 그것을 그들의 물건들 가운데에 두었느니라 (수 7:11)'],
      [NAR, '그러므로 이스라엘 자손들이 그들의 원수 앞에 능히 맞서지 못하고 그 앞에서 돌아섰나니 이는 그들도 온전히 바친 것이 됨이라 그 온전히 바친 물건을 너희 중에서 멸하지 아니하면 내가 다시는 너희와 함께 있지 아니하리라 (수 7:12)'],
      [NAR, '너는 일어나서 백성을 거룩하게 하여 이르기를 너희는 내일을 위하여 스스로 거룩하게 하라 이스라엘의 하나님 여호와의 말씀에 이스라엘아 너희 가운데에 온전히 바친 물건이 있나니 너희가 그 온전히 바친 물건을 너희 가운데에서 제하기까지는 네 원수들 앞에 능히 맞서지 못하리라 (수 7:13)'],
      [NAR, '너희는 아침에 너희의 지파대로 가까이 나아오라 여호와께 뽑히는 그 지파는 그 족속대로 가까이 나아올 것이요 여호와께 뽑히는 족속은 그 가족대로 가까이 나아올 것이요 여호와께 뽑히는 그 가족은 그 남자들이 가까이 나아올 것이며 (수 7:14)'],
      [NAR, '온전히 바친 물건을 가진 자로 뽑힌 자를 불사르되 그와 그의 모든 소유를 그리하라 이는 여호와의 언약을 어기고 이스라엘 가운데에서 망령된 일을 행하였음이라 하셨다 하라 (수 7:15)'],
    ],
    j7_confess: [
      [NAR, '이에 여호수아가 아침 일찍이 일어나서 이스라엘을 그의 지파대로 가까이 나아오게 하였더니 유다 지파가 뽑혔고 (수 7:16)'],
      [NAR, '유다 족속을 가까이 나아오게 하였더니 세라 족속이 뽑혔고 세라 족속의 각 남자를 가까이 나아오게 하였더니 삽디가 뽑혔고 (수 7:17)'],
      [NAR, '삽디의 가족 각 남자를 가까이 나아오게 하였더니 유다 지파 세라의 증손이요 삽디의 손자요 갈미의 아들인 아간이 뽑혔더라 (수 7:18)'],
      [NAR, '그러므로 여호수아가 아간에게 이르되 (수 7:19)'],
      [JOSHUA, '내 아들아 청하노니 이스라엘의 하나님 여호와께 영광을 돌려 그 앞에 자복하고 네가 행한 일을 내게 알게 하라 그 일을 내게 숨기지 말라'],
      [NAR, '아간이 여호수아에게 대답하여 이르되 (수 7:20)'],
      [ACHAN, '참으로 나는 이스라엘의 하나님 여호와께 범죄하여 이러이러하게 행하였나이다'],
      [ACHAN, '내가 노략한 물건 중에 시날 산의 아름다운 외투 한 벌과 은 이백 세겔과 그 무게가 오십 세겔 되는 금덩이 하나를 보고 탐내어 가졌나이다 보소서 이제 그 물건들을 내 장막 가운데 땅 속에 감추었는데 은은 그 밑에 있나이다'],
      [NAR, '▶ 진영 안의 아간의 장막으로 가요.'],
    ],
    j7_found: [
      [NAR, '이에 여호수아가 사자들을 보내매 그의 장막에 달려가 본즉 물건이 그의 장막 안에 감추어져 있는데 은은 그 밑에 있는지라 (수 7:22)'],
      [NAR, '그들이 그것을 장막 가운데서 취하여 여호수아와 이스라엘 모든 자손에게 가지고 오매 그들이 그것을 여호와 앞에 쏟아 놓으니라 (수 7:23)'],
      [NAR, '▶ 여호수아에게 가요.'],
    ],
    j7_achor: [
      [NAR, '여호수아가 이스라엘 모든 사람과 더불어 세라의 아들 아간을 잡고 그 은과 그 외투와 그 금덩이와 그의 아들들과 그의 딸들과 그의 소들과 그의 나귀들과 그의 양들과 그의 장막과 그에게 속한 모든 것을 이끌고 아골 골짜기로 가서 (수 7:24)'],
      [NAR, '여호수아가 이르되 (수 7:25)'],
      [JOSHUA, '네가 어찌하여 우리를 괴롭게 하였느냐 여호와께서 오늘 너를 괴롭게 하시리라'],
      [NAR, '하니 온 이스라엘이 그를 돌로 치고 물건들도 돌로 치고 불사르고 (수 7:25)'],
      { event: 'achorPile' },
      [NAR, '그 위에 돌 무더기를 크게 쌓았더니 오늘까지 있더라 여호와께서 그의 맹렬한 진노를 그치시니 그러므로 그 곳 이름을 오늘까지 아골 골짜기라 부르더라 (수 7:26)'],
    ],
    // 8장 「아이 성 매복」 — 수 8장
    j8_word: [
      [NAR, '여호와께서 여호수아에게 이르시되 두려워하지 말라 놀라지 말라 군사를 다 거느리고 일어나 아이로 올라가라 보라 내가 아이 왕과 그의 백성과 그의 성읍과 그의 땅을 다 네 손에 넘겨 주었으니 (수 8:1)'],
      [NAR, '너는 여리고와 그 왕에게 행한 것 같이 아이와 그 왕에게 행하되 오직 거기서 탈취할 물건과 가축은 스스로 가지라 너는 아이 성 뒤에 복병을 둘지니라 하시니 (수 8:2)'],
      [NAR, '이에 여호수아가 일어나서 군사와 함께 아이로 올라가려 하여 용사 삼만 명을 뽑아 밤에 보내며 (수 8:3)'],
      [NAR, '그들에게 명령하여 이르되 (수 8:4)'],
      [JOSHUA, '너희는 성읍 뒤로 가서 성읍을 향하여 매복하되 그 성읍에서 너무 멀리 하지 말고 다 스스로 준비하라'],
      [JOSHUA, '나와 나를 따르는 모든 백성은 다 성읍으로 가까이 가리니 그들이 처음과 같이 우리에게로 쳐 올라올 것이라 그리 할 때에 우리가 그들 앞에서 도망하면'],
      [JOSHUA, '그들이 나와서 우리를 추격하며 이르기를 그들이 처음과 같이 우리 앞에서 도망한다 하고 우리의 유인을 받아 그 성읍에서 멀리 떠날 것이라 우리가 그들 앞에서 도망하거든'],
      [JOSHUA, '너희는 매복한 곳에서 일어나 그 성읍을 점령하라 너희 하나님 여호와께서 그 성읍을 너희 손에 주시리라'],
      [JOSHUA, '너희가 그 성읍을 취하거든 그것을 불살라 여호와의 말씀대로 행하라 보라 내가 너희에게 명령하였느니라'],
      [NAR, '▶ 서쪽 길로 아이에 올라가요.'],
    ],
    j8_night: [
      [NAR, '그들을 보내매 그들이 매복할 곳으로 가서 아이 서쪽 벧엘과 아이 사이에 매복하였고 여호수아는 그 밤에 백성 가운데에서 잤더라 (수 8:9)'],
      [NAR, '여호수아가 아침에 일찍이 일어나 백성을 점호하고 이스라엘 장로들과 더불어 백성에 앞서 아이로 올라가매 (수 8:10)'],
      [NAR, '그와 함께 한 군사가 다 올라가서 그 성읍 앞에 가까이 이르러 아이 북쪽에 진 치니 그와 아이 사이에는 한 골짜기가 있더라 (수 8:11)'],
    ],
    j8_fall: [
      [NAR, '그가 약 오천 명을 택하여 성읍 서쪽 벧엘과 아이 사이에 매복시키니 (수 8:12)'],
      [NAR, '이와 같이 성읍 북쪽에는 온 군대가 있고 성읍 서쪽에는 복병이 있었더라 여호수아가 그 밤에 골짜기 가운데로 들어가니 (수 8:13)'],
      [NAR, '아이 왕이 이를 보고 그 성읍 백성과 함께 일찍이 일어나 급히 나가 아라바 앞에 이르러 정한 때에 이스라엘과 싸우려 하나 성읍 뒤에 복병이 있는 줄은 알지 못하였더라 (수 8:14)'],
      [NAR, '여호수아와 온 이스라엘이 그들 앞에서 거짓으로 패한 척하여 광야 길로 도망하매 (수 8:15)'],
      [NAR, '그 성읍에 있는 모든 백성이 그들을 추격하려고 모여 여호수아를 추격하며 유인함을 받아 아이 성읍을 멀리 떠나니 (수 8:16)'],
      [NAR, '아이와 벧엘에 이스라엘을 따라가지 아니한 자가 하나도 없으며 성문을 열어 놓고 이스라엘을 추격하였더라 (수 8:17)'],
      [NAR, '여호와께서 여호수아에게 이르시되 네 손에 잡은 단창을 들어 아이를 가리키라 내가 이 성읍을 네 손에 넘겨 주리라 여호수아가 그의 손에 잡은 단창을 들어 그 성읍을 가리키니 (수 8:18)'],
      [NAR, '그의 손을 드는 순간에 복병이 그들의 자리에서 급히 일어나 성읍으로 달려 들어가서 점령하고 곧 성읍에 불을 놓았더라 (수 8:19)'],
      { event: 'aiBurn' },
      [NAR, '아이 사람이 뒤를 돌아본즉 그 성읍에 연기가 하늘에 닿은 것이 보이니 이 길로도 저 길로도 도망할 수 없이 되었고 광야로 도망하던 이스라엘 백성은 그 추격하던 자에게로 돌아섰더라 (수 8:20)'],
      [NAR, '여호수아와 온 이스라엘이 그 복병이 성읍을 점령함과 성읍에 연기가 오름을 보고 다시 돌이켜 아이 사람들을 쳐죽이고 (수 8:21)'],
      [NAR, '복병도 성읍에서 나와 그들을 치매 그들이 이스라엘 중간에 든지라 어떤 사람들은 이쪽에서 어떤 사람들은 저쪽에서 쳐죽여서 한 사람도 남거나 도망하지 못하게 하였고 (수 8:22)'],
      [NAR, '아이 왕을 사로잡아 여호수아 앞으로 끌어 왔더라 (수 8:23)'],
      [NAR, '이스라엘이 자기들을 광야로 추격하던 모든 아이 주민을 들에서 죽이되 그들을 다 칼날에 엎드러지게 하여 진멸하기를 마치고 온 이스라엘이 아이로 돌아와서 칼날로 죽이매 (수 8:24)'],
      [NAR, '그 날에 엎드러진 아이 사람들은 남녀가 모두 만 이천 명이라 (수 8:25)'],
      [NAR, '아이 주민들을 진멸하여 바치기까지 여호수아가 단창을 잡아 든 손을 거두지 아니하였고 (수 8:26)'],
      [NAR, '오직 그 성읍의 가축과 노략한 것은 여호와께서 여호수아에게 명령하신 대로 이스라엘이 탈취하였더라 (수 8:27)'],
      [NAR, '이에 여호수아가 아이를 불살라 그것으로 영원한 무더기를 만들었더니 오늘까지 황폐하였으며 (수 8:28)'],
      [NAR, '그가 또 아이 왕을 저녁 때까지 나무에 달았다가 해 질 때에 명령하여 그의 시체를 나무에서 내려 그 성문 어귀에 던지고 그 위에 돌로 큰 무더기를 쌓았더니 그것이 오늘까지 있더라 (수 8:29)'],
      [NAR, '▶ 북쪽 에발 산으로 가요.'],
    ],
    j8_altar: [
      [NAR, '그 때에 여호수아가 이스라엘의 하나님 여호와를 위하여 에발 산에 한 제단을 쌓았으니 (수 8:30)'],
      [NAR, '이는 여호와의 종 모세가 이스라엘 자손에게 명령한 것과 모세의 율법책에 기록된 대로 쇠 연장으로 다듬지 아니한 새 돌로 만든 제단이라 무리가 여호와께 번제물과 화목제물을 그 위에 드렸으며 (수 8:31)'],
    ],
    j8_ebal: [
      { event: 'altarUp' },
      [NAR, '여호수아가 거기서 모세가 기록한 율법을 이스라엘 자손의 목전에서 그 돌에 기록하매 (수 8:32)'],
      [NAR, '온 이스라엘과 그 장로들과 관리들과 재판장들과 본토인뿐 아니라 이방인까지 여호와의 언약궤를 멘 레위 사람 제사장들 앞에서 궤의 좌우에 서되 절반은 그리심 산 앞에, 절반은 에발 산 앞에 섰으니 이는 전에 여호와의 종 모세가 이스라엘 백성에게 축복하라고 명령한 대로 함이라 (수 8:33)'],
      [NAR, '그 후에 여호수아가 율법책에 기록된 모든 것 대로 축복과 저주하는 율법의 모든 말씀을 낭독하였으니 (수 8:34)'],
      [NAR, '모세가 명령한 것은 여호수아가 이스라엘 온 회중과 여자들과 아이와 그들 중에 동행하는 거류민들 앞에서 낭독하지 아니한 말이 하나도 없었더라 (수 8:35)'],
    ],
  });

  const { mgOpen, mgCloseAll, completeTask } = api;
  const btnCss = 'padding:8px 6px;border-radius:10px;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.08);color:#f5e9d0;font-size:13px';
  const LIVES = 3, hearts = n => '❤️'.repeat(Math.max(0, n)) + '🤍'.repeat(Math.max(0, LIVES - n));
  const OUT = '❤️을 다 썼어요 — 처음부터 다시';
  // 🏅 4편 배지(SQL claim_odyssey_achieve 키 badge-red_cord · twelve_stones)
  Object.assign(api.BADGES, { red_cord: { ico: '🧵', name: '붉은 줄을 지킨 사람' }, twelve_stones: { ico: '🪨', name: '열두 돌을 세운 사람' }, seventh_day: { ico: '📯', name: '일곱째 날까지 걸은 사람' } });
  function giveBadge(k){ const S = api.ST; if (S.badges.includes(k)) return; S.badges.push(k); api.saveST(); setTimeout(() => api.toast(`${api.BADGES[k].ico} 배지 획득: ${api.BADGES[k].name}`, 2600), 900); }
  const msgBox = m => `<div style="text-align:center;color:#ffd27a;font-weight:800;min-height:34px;padding:6px 10px 0;font-size:12.5px">${m}</div>`;

  // ⚔ 요단 이쪽에 머물 사람, 앞서 건널 사람(수 1:14)
  function stayGame(q){ api.runDialog(DLG.j4_east, () => stayPlay(q), null, 'j4_east'); }
  function stayPlay(q){
    const CARDS = [['👶 르우벤 지파의 아이들', 'stay'], ['🐑 갓 지파의 양 떼', 'stay'], ['👩 므낫세 반 지파의 아내들', 'stay'], ['🐄 르우벤 지파의 소 떼', 'stay'],
      ['🛡 르우벤 지파의 용사들', 'go'], ['🛡 갓 지파의 용사들', 'go'], ['🛡 므낫세 반 지파의 용사들', 'go'], ['👧 갓 지파의 딸들', 'stay']].sort(() => Math.random() - 0.5);
    let i = 0, msg = '', life = LIVES;
    mgOpen('⚔ 머물 사람, 앞서 건널 사람', '"너희의 처자와 가축은 … 요단 이쪽 땅에 머무르려니와 너희 모든 용사들은 무장하고 너희의 형제보다 앞서 건너가서" (수 1:14)');
    const draw = () => { const c = CARDS[i];
      api.mgArea.innerHTML = c ? `<div style="text-align:center;padding:12px 8px 8px;font-size:17px;font-weight:800">${c[0]}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:0 12px"><button data-st="stay" style="${btnCss};font-size:14px">🏕 요단 이쪽에 머물러요</button><button data-st="go" style="${btnCss};font-size:14px">⚔ 앞서 건너가요</button></div>${msgBox(msg || `${i + 1} / ${CARDS.length} · ${hearts(life)}`)}`
        : `<div style="padding:16px;text-align:center;color:#ffd27a;font-weight:800">✓ 말씀대로 나누었어요</div>`;
      api.mgAct.textContent = c ? '다 나누면 계속' : '계속'; api.mgAct.disabled = !!c; };
    draw();
    api.mgArea.onclick = e => { const b = e.target.closest('[data-st]'); const c = CARDS[i]; if (!b || !c) return;
      if (b.dataset.st === c[1]){ i++; msg = ''; } else if (--life <= 0){ i = 0; life = LIVES; CARDS.sort(() => Math.random() - 0.5); msg = OUT; } else msg = `수 1:14을 다시 읽어 봐요 ${hearts(life)}`; draw(); };
    api.mgAct.onclick = () => { if (CARDS[i]) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
    api.mg.onClose = () => { api.mgArea.onclick = null; };
  }
  // 🌾 지붕의 삼대 아래에 숨기기(수 2:6) — 나타나는 삼대 묶음을 재빨리 모아 두 사람을 덮는다. 빈 지붕을 누르면 ❤️
  function hideGame(q){ api.runDialog(DLG.j4_jericho, () => hidePlay(q), null, 'j4_jericho'); }
  function hidePlay(q){
    const NEED = 8, LIMIT = 14000; let got = 0, life = LIVES, msg = '', pos = -1, t0 = 0, timer = null, tick = null, done = false, perfect = true;
    mgOpen('🌾 지붕의 삼대', '"그가 이미 그들을 이끌고 지붕에 올라가서 그 지붕에 벌여 놓은 삼대에 숨겼더라" (수 2:6) — 지붕 여기저기 놓인 삼대 묶음을 눌러 모아 두 사람을 덮어요. 14초 안에!');
    const hop = () => { let n; do { n = Math.floor(Math.random() * 12); } while (n === pos); pos = n; };
    const draw = () => { const left = t0 ? Math.max(0, Math.ceil((LIMIT - (performance.now() - t0)) / 1000)) : 14;
      api.mgArea.innerHTML = done ? `<div style="padding:16px;text-align:center;color:#ffd27a;font-weight:800">✓ 두 사람이 삼대 아래에 숨었어요</div>`
        : `<div style="text-align:center;font-size:13px;padding:4px">🧍🧍 덮은 삼대 ${'🌾'.repeat(got)}${'▫️'.repeat(NEED - got)} · ⏱ ${left}초 · ${hearts(life)}</div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;padding:6px 10px">${[...Array(12).keys()].map(i => `<button data-hd="${i}" style="${btnCss};font-size:22px;height:44px">${i === pos ? '🌾' : '　'}</button>`).join('')}</div>${msgBox(msg)}`;
      api.mgAct.textContent = done ? '계속' : '다 덮으면 계속'; api.mgAct.disabled = !done; };
    const reset = m => { got = 0; t0 = 0; clearTimeout(timer); timer = null; life = LIVES; perfect = false; msg = m; hop(); };
    hop(); draw();
    tick = setInterval(() => { if (!done && t0){ hop(); draw(); } }, 1100);
    api.mgArea.onclick = e => { const b = e.target.closest('[data-hd]'); if (!b || done) return;
      if (!t0){ t0 = performance.now(); timer = setTimeout(() => { if (!done){ reset('발소리가 가까워요! 처음부터 다시 덮어요'); draw(); } }, LIMIT); }
      if (+b.dataset.hd === pos){ got++; msg = ''; hop(); if (got >= NEED){ done = true; clearTimeout(timer); clearInterval(tick); } }
      else if (--life <= 0) reset(OUT); else { perfect = false; msg = `빈 자리예요 ${hearts(life)}`; }
      draw(); };
    api.mgAct.onclick = () => { if (!done) return; api.mgArea.onclick = null; mgCloseAll(); if (perfect) giveBadge('red_cord'); completeTask(q); };
    api.mg.onClose = () => { api.mgArea.onclick = null; clearTimeout(timer); clearInterval(tick); };
  }
  // 🪢 창문에서 줄로 달아 내리기(수 2:15) — 줄이 흔들리지 않게 ◀ ▶로 잡고, 멈춰 있을 때 ⬇로 내린다
  function cordGame(q){
    api.runDialog(DLG.j4_window, () => {
      let sway = 0, drift = 0, prog = 0, timer = null, life = LIVES, msg = '';
      mgOpen('🪢 줄로 달아 내리기', '"라합이 그들을 창문에서 줄로 달아 내리니" (수 2:15) — ◀ ▶로 줄을 잡고, 흔들림이 작을 때 ⬇로 내려요. 크게 흔들릴 때 내리면 ❤️');
      const draw = () => { const ok = Math.abs(sway) < 0.35, h = Math.round(prog);
        api.mgArea.innerHTML = prog >= 100 ? `<div style="padding:16px;text-align:center;color:#ffd27a;font-weight:800">✓ 두 사람이 성벽 아래 땅에 닿았어요</div>`
          : `<div style="display:flex;justify-content:center;gap:14px;align-items:flex-start;padding:6px"><div style="width:16px;height:110px;border-radius:4px;background:#c8ad84;position:relative"><div style="position:absolute;left:3px;right:3px;top:${h}px;height:${Math.max(4, 110 - h)}px"></div></div><div style="width:120px;height:110px;position:relative"><div style="position:absolute;left:${54 + sway * 40}px;top:0;width:2px;height:${8 + h * 0.9}px;background:#b8322a;transform-origin:top"></div><div style="position:absolute;left:${44 + sway * 40}px;top:${6 + h * 0.9}px;font-size:20px">🧍</div></div></div><div style="display:grid;grid-template-columns:1fr 1.3fr 1fr;gap:6px;padding:0 14px"><button data-cd="-1" style="${btnCss};font-size:20px">◀</button><button data-cd="down" style="${btnCss};font-size:18px;background:${ok ? 'rgba(154,210,122,.25)' : 'rgba(224,80,60,.25)'}">⬇ 내리기</button><button data-cd="1" style="${btnCss};font-size:20px">▶</button></div>${msgBox(msg || `${h} / 100 · ${hearts(life)}`)}`;
        api.mgAct.textContent = prog >= 100 ? '계속' : '땅에 닿으면 계속'; api.mgAct.disabled = prog < 100; };
      draw();
      timer = setInterval(() => { if (prog >= 100) return; drift += (Math.random() - 0.5) * 0.12; drift = Math.max(-0.08, Math.min(0.08, drift)); sway = Math.max(-1, Math.min(1, sway + drift)); draw(); }, 120);
      api.mgArea.onclick = e => { const b = e.target.closest('[data-cd]'); if (!b || prog >= 100) return;
        if (b.dataset.cd === 'down'){
          if (Math.abs(sway) < 0.35){ prog = Math.min(100, prog + 6); msg = ''; if (prog >= 100){ clearInterval(timer); timer = null; } }
          else if (--life <= 0){ prog = 0; life = LIVES; sway = 0; drift = 0; msg = OUT; } else msg = `줄이 크게 흔들려요 — 먼저 잡아요 ${hearts(life)}`;
        } else { sway -= +b.dataset.cd * 0.25; drift *= 0.3; }
        draw(); };
      api.mgAct.onclick = () => { if (prog < 100) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; if (timer){ clearInterval(timer); timer = null; } };
    }, null, 'j4_window');
  }
  // ⛰ 산에서 사흘 숨어 있기(수 2:16, 22) — 👣 뒤쫓는 자들이 지나갈 때만 엎드린다. 아무도 없을 때 엎드리거나 늦으면 ❤️
  function hillsGame(q){
    const DAYS = 3, PASS = 3; let day = 0, n = 0, life = LIVES, msg = '', near = false, timer = null, waitT = null, done = false;
    mgOpen('⛰ 산에서 사흘', '"너희는 산으로 가서 거기서 사흘 동안 숨어 있다가 뒤쫓는 자들이 돌아간 후에 너희의 길을 갈지니라" (수 2:16) — 👣가 보이면 곧바로 엎드려요.');
    const draw = () => {
      api.mgArea.innerHTML = done ? `<div style="padding:16px;text-align:center;color:#ffd27a;font-weight:800">✓ 사흘이 지나고 뒤쫓는 자들이 돌아갔어요</div>`
        : `<div style="display:flex;gap:4px;justify-content:center;padding:8px">${[...Array(DAYS).keys()].map(i => `<div style="width:40px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;${i < day ? 'background:#ffd27a;color:#2a1d10' : 'background:rgba(255,255,255,.08)'}">${i + 1}일</div>`).join('')}</div><div style="text-align:center;font-size:40px;height:52px">${near ? '👣' : '⛰'}</div><div style="text-align:center;padding:2px 0 4px;font-size:13px">${day + 1}째 날 · 지나간 무리 ${n} / ${PASS} · ${hearts(life)}</div><div style="text-align:center"><button data-hl style="${btnCss};font-size:17px;padding:12px 28px">🤫 엎드리기</button></div>${msgBox(msg)}`;
      api.mgAct.textContent = done ? '계속' : '사흘이 지나면 계속'; api.mgAct.disabled = !done; };
    const lose = m => { if (--life <= 0){ day = 0; n = 0; life = LIVES; msg = OUT; } else msg = `${m} ${hearts(life)}`; };
    const next = () => { clearTimeout(waitT); near = false; draw(); waitT = setTimeout(() => { near = true; draw(); timer = setTimeout(() => { if (near){ near = false; lose('들킬 뻔했어요 — 더 빨리 엎드려요'); draw(); next(); } }, 1300); }, 1200 + Math.random() * 2600); };
    draw(); next();
    api.mgArea.onclick = e => { if (!e.target.closest('[data-hl]') || done) return;
      if (near){ clearTimeout(timer); near = false; msg = '✓ 지나갔어요'; n++; if (n >= PASS){ n = 0; day++; msg = `🌙 ${day}째 날이 지났어요`; if (day >= DAYS){ done = true; clearTimeout(waitT); draw(); return; } } next(); }
      else { lose('아무도 없어요 — 👣가 보일 때만'); draw(); } };
    api.mgAct.onclick = () => { if (!done) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
    api.mg.onClose = () => { api.mgArea.onclick = null; clearTimeout(timer); clearTimeout(waitT); };
  }
  // 📏 언약궤와 이천 규빗쯤(수 3:3-4) — 궤가 앞서 가요. 가까이 가지도, 너무 처지지도 않게 따라가기
  function followGame(q){
    api.runDialog(DLG.j4_follow_intro, () => {
      let ark = 30, me = 10, life = LIVES, msg = '', timer = null, done = false, speed = 0.55;
      mgOpen('📏 이천 규빗쯤', '"너희와 그 사이 거리가 이천 규빗쯤 되게 하고 그것에 가까이 하지는 말라" (수 3:4) — 🚶를 눌러 따라가요. 초록 칸 안에서 요단 물가까지!');
      const gap = () => Math.round((ark - me) * 100);   // 화면 칸 1 = 100규빗
      const draw = () => { const g = gap(), ok = g >= 1500 && g <= 2600;
        api.mgArea.innerHTML = done ? `<div style="padding:16px;text-align:center;color:#ffd27a;font-weight:800">✓ 언약궤를 따라 요단 물가에 이르렀어요</div>`
          : `<div style="position:relative;margin:16px 14px 6px;height:34px;border-radius:8px;background:rgba(255,255,255,.08)"><div style="position:absolute;right:0;top:0;bottom:0;width:6%;background:#4f9fb5;border-radius:0 8px 8px 0"></div><div style="position:absolute;left:${Math.min(94, ark)}%;top:4px;font-size:20px;transform:translateX(-50%)">📦</div><div style="position:absolute;left:${Math.max(0, ark - 26)}%;width:${11}%;top:28px;height:4px;background:#9ad27a"></div><div style="position:absolute;left:${Math.max(0, me)}%;top:4px;font-size:20px;transform:translateX(-50%)">🚶</div></div><div style="text-align:center;font-size:13px;padding:2px">궤와의 거리 약 ${g.toLocaleString()} 규빗 ${ok ? '✓' : g < 1500 ? '— 너무 가까워요' : '— 너무 멀어요'} · ${hearts(life)}</div><div style="text-align:center;padding:4px"><button data-fw style="${btnCss};font-size:18px;padding:12px 30px">🚶 따라가기</button></div>${msgBox(msg)}`;
        api.mgAct.textContent = done ? '계속' : '물가에 이르면 계속'; api.mgAct.disabled = !done; };
      const lose = m => { if (--life <= 0){ ark = 30; me = 10; life = LIVES; msg = OUT; } else { me = ark - 20; msg = `${m} ${hearts(life)}`; } };
      draw();
      timer = setInterval(() => { if (done) return; speed = Math.max(0.35, Math.min(0.85, speed + (Math.random() - 0.5) * 0.12)); ark += speed * 0.45;
        if (ark >= 94){ ark = 94; done = true; clearInterval(timer); timer = null; }
        else if (gap() > 2600){ lose('언약궤가 멀어졌어요 — "그리하면 너희가 행할 길을 알리니"'); }
        draw(); }, 140);
      api.mgArea.onclick = e => { if (!e.target.closest('[data-fw]') || done) return; me += 1.4; if (gap() < 1500) lose('"그것에 가까이 하지는 말라" (수 3:4)'); else msg = ''; draw(); };
      api.mgAct.onclick = () => { if (!done) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; if (timer){ clearInterval(timer); timer = null; } };
    }, null, 'j4_follow_intro');
  }
  // 🪨 기념 돌 열둘(수 4:5-7) — 돌마다 새긴 말을 4:7의 차례대로 놓는다
  function stonesGame(q){
    const ORDER = ['요단 물이', '여호와의', '언약궤', '앞에서', '끊어졌나니', '곧', '언약궤가', '요단을', '건널', '때에', '요단 물이', '끊어졌으므로'];
    const shown = ORDER.map((w, i) => i).sort(() => Math.random() - 0.5), used = new Set(); let next = 0, life = LIVES, msg = '', perfect = true;
    mgOpen('🪨 기념 돌 열둘', '"이 돌들은 무슨 뜻이냐 하거든" (수 4:6) — 열두 사람이 메고 온 돌에 그 대답이 새겨져 있어요. 4:7의 차례대로 길갈에 놓아요.');
    const draw = () => { const placed = ORDER.slice(0, next);
      api.mgArea.innerHTML = `<div style="padding:6px 12px;font-size:13px;line-height:1.6;min-height:44px">${placed.length ? '📜 ' + placed.join(' ') : '—'}</div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;padding:0 10px">${shown.filter(i => !used.has(i)).map(i => `<button data-sn="${i}" style="${btnCss};font-size:12.5px">🪨<br>${ORDER[i]}</button>`).join('')}</div>${msgBox(msg || (next < 12 ? `${next + 1}번째 돌 · ${hearts(life)}` : '✓ 열두 돌을 모두 놓았어요'))}`;
      api.mgAct.textContent = next < 12 ? '다 놓으면 계속' : '계속'; api.mgAct.disabled = next < 12; };
    draw();
    api.mgArea.onclick = e => { const b = e.target.closest('[data-sn]'); if (!b || next >= 12) return; const i = +b.dataset.sn;
      if (ORDER[i] === ORDER[next]){ used.add(i); next++; msg = ''; }
      else if (--life <= 0){ next = 0; life = LIVES; used.clear(); shown.sort(() => Math.random() - 0.5); perfect = false; msg = OUT; }
      else { perfect = false; msg = `4:7을 다시 떠올려 봐요 ${hearts(life)}`; }
      draw(); };
    api.mgAct.onclick = () => { if (next < 12) return; api.mgArea.onclick = null; mgCloseAll(); if (perfect) giveBadge('twelve_stones'); completeTask(q); };
    api.mg.onClose = () => { api.mgArea.onclick = null; };
  }

  // ── 2부 미니게임 ──
  // 차례 맞추기 공용 틀: 카드를 본문의 차례대로 누른다. 틀리면 ❤️
  function orderPlay(q, title, info, cards, hint, doneMsg, onDone){
    const shown = cards.map((c, i) => i).sort(() => Math.random() - 0.5); let next = 0, life = LIVES, msg = '', perfect = true;
    mgOpen(title, info);
    const draw = () => {
      api.mgArea.innerHTML = `<div style="padding:6px 12px;font-size:12.5px;line-height:1.7;min-height:30px">${cards.slice(0, next).map((c, i) => `${i + 1}. ${c[0]} <span style="opacity:.6">${c[1] || ''}</span>`).join('<br>') || '—'}</div>`
        + (next < cards.length ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:4px 10px">${shown.filter(i => i >= next).map(i => `<button data-od="${i}" style="${btnCss}">${cards[i][0]}</button>`).join('')}</div>` : '')
        + msgBox(msg || (next < cards.length ? `${next + 1}번째는? · ${hearts(life)}` : doneMsg));
      api.mgAct.textContent = next < cards.length ? '차례대로 놓으면 계속' : '계속'; api.mgAct.disabled = next < cards.length; };
    draw();
    api.mgArea.onclick = e => { const b = e.target.closest('[data-od]'); if (!b || next >= cards.length) return;
      if (+b.dataset.od === next){ next++; msg = ''; }
      else if (--life <= 0){ next = 0; life = LIVES; perfect = false; shown.sort(() => Math.random() - 0.5); msg = OUT; }
      else { perfect = false; msg = `${hint} ${hearts(life)}`; }
      draw(); };
    api.mgAct.onclick = () => { if (next < cards.length) return; api.mgArea.onclick = null; mgCloseAll(); if (onDone) onDone(perfect); completeTask(q); };
    api.mg.onClose = () => { api.mgArea.onclick = null; };
  }
  // 📅 길갈의 날들(수 5:3-12) — 할례에서 만나가 그칠 때까지, 본문에 나온 차례대로
  function calendarGame(q){
    orderPlay(q, '📅 길갈의 날들', '할례 산에서 만나가 그친 날까지 — 수 5:3-12에 나온 차례대로 놓아요.', [
      ['🔪 부싯돌 칼로 할례를 행함', '(5:3)'], ['⛺ 각 처소에 머물며 낫기를 기다림', '(5:8)'], ['📛 그 곳 이름을 길갈이라 함', '(5:9)'],
      ['🐑 십사일 저녁에 유월절을 지킴', '(5:10)'], ['🌾 이튿날 무교병과 볶은 곡식을 먹음', '(5:11)'], ['🍞 다음 날 만나가 그침', '(5:12)'],
    ], '수 5장을 다시 떠올려 봐요', '✓ 길갈에서 지낸 날들을 차례대로 놓았어요');
  }
  // 👣 "네 발에서 신을 벗으라"(수 5:13-15) — 칼을 든 사람 앞에서 여호수아가 한 일을 본문대로 고른다(싸우지 않는다)
  function holyGame(q){ api.runDialog(DLG.j5_man, () => holyPlay(q), null, 'j5_man'); }
  function holyPlay(q){
    const ROUNDS = [
      { say: '"아니라 나는 여호와의 군대 대장으로 지금 왔느니라" (5:14)', ok: '🙇 얼굴을 땅에 대고 엎드려 절한다', no: ['⚔ 칼을 빼어 든다', '⛺ 진영으로 돌아간다'] },
      { say: '"네 발에서 신을 벗으라 네가 선 곳은 거룩하니라" (5:15)', ok: '👣 발에서 신을 벗는다', no: ['🧍 신을 신은 채 서 있는다', '🚶 성 쪽으로 걸어간다'] },
    ];
    let r = 0, life = LIVES, msg = '', opts = [];
    const shuffle = () => { const R = ROUNDS[r]; opts = R ? [R.ok, ...R.no].sort(() => Math.random() - 0.5) : []; };
    mgOpen('👣 거룩한 곳', '여호수아가 들은 말 앞에서 여호수아가 한 일을 본문(수 5:14-15)대로 골라요. 이 사람과 싸우지 않아요.');
    const draw = () => { const R = ROUNDS[r];
      api.mgArea.innerHTML = R ? `<div style="text-align:center;padding:10px 10px 6px;font-size:28px">✨</div><div style="text-align:center;padding:0 12px 8px;font-size:13.5px;line-height:1.6">${R.say}</div><div style="display:grid;gap:6px;padding:0 14px">${opts.map((o, i) => `<button data-hy="${i}" style="${btnCss};font-size:14px">${o}</button>`).join('')}</div>${msgBox(msg || hearts(life))}`
        : `<div style="padding:16px;text-align:center;color:#ffd27a;font-weight:800">✓ 여호수아가 그대로 행하였어요 (5:15)</div>`;
      api.mgAct.textContent = R ? '골라야 계속' : '계속'; api.mgAct.disabled = !!R; };
    shuffle(); draw();
    api.mgArea.onclick = e => { const b = e.target.closest('[data-hy]'); const R = ROUNDS[r]; if (!b || !R) return;
      if (opts[+b.dataset.hy] === R.ok){ r++; msg = ''; shuffle(); }
      else if (--life <= 0){ r = 0; life = LIVES; msg = OUT; shuffle(); }
      else msg = `본문을 다시 봐요 ${hearts(life)}`;
      draw(); };
    api.mgAct.onclick = () => { if (ROUNDS[r]) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
    api.mg.onClose = () => { api.mgArea.onclick = null; };
  }
  // 📯 여리고를 도는 이레(수 6:3-16) — ① 행렬 차례(6:9) ② 엿새는 매일 한 번, 일곱째 날은 일곱 번 ③ 나팔 뒤에만 외친다(6:10, 16)
  function marchGame(q){ api.runDialog(DLG.j6_march, () => marchPlay(q), null, 'j6_march'); }
  function marchPlay(q){
    const ROW = [['🛡 무장한 자들', '맨 앞'], ['📯 나팔 부는 제사장 일곱', ''], ['📦 여호와의 언약궤', ''], ['🚶 후군', '맨 뒤']];
    const shown = ROW.map((c, i) => i).sort(() => Math.random() - 0.5);
    let set = 0, day = 1, laps = 0, blown = false, life = LIVES, msg = '', perfect = true, done = false, tmr = null;
    mgOpen('📯 여리고를 도는 이레', '"너희 모든 군사는 그 성을 둘러 성 주위를 매일 한 번씩 돌되 엿새 동안을 그리하라 … 일곱째 날에는 그 성을 일곱 번 돌며" (수 6:3-4) — 먼저 행렬을 세우고(6:9), 날마다 말씀대로 돌아요.');
    const lose = m => { perfect = false; if (--life <= 0){ day = 1; laps = 0; blown = false; life = LIVES; msg = OUT; } else msg = `${m} ${hearts(life)}`; };
    const draw = () => {
      if (done){ api.mgArea.innerHTML = `<div style="padding:16px;text-align:center;color:#ffd27a;font-weight:800">✓ 백성이 크게 소리 질러 외쳤어요</div>`; api.mgAct.textContent = '계속'; api.mgAct.disabled = false; return; }
      if (set < ROW.length){
        api.mgArea.innerHTML = `<div style="padding:6px 12px;font-size:13px;line-height:1.7">행렬(앞 → 뒤): ${ROW.slice(0, set).map(c => c[0]).join(' → ') || '—'}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:4px 10px">${shown.filter(i => i >= set).map(i => `<button data-mr="${i}" style="${btnCss}">${ROW[i][0]}</button>`).join('')}</div>${msgBox(msg || `${set === 0 ? '맨 앞에' : '다음에'} 설 무리는? (6:9) · ${hearts(life)}`)}`;
      } else {
        const need = day < 7 ? 1 : 7;
        api.mgArea.innerHTML = `<div style="display:flex;gap:3px;justify-content:center;padding:8px 4px">${[1, 2, 3, 4, 5, 6, 7].map(d => `<div style="width:34px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;${d < day ? 'background:#ffd27a;color:#2a1d10' : d === day ? 'border:2px solid #ffd27a' : 'background:rgba(255,255,255,.08)'}">${d}일</div>`).join('')}</div>`
          + `<div style="text-align:center;font-size:13px;padding:2px">${day === 7 ? '☀ 일곱째 날 새벽' : `☀ ${day}째 날`} · 돈 바퀴 ${'🔄'.repeat(laps)}${'▫️'.repeat(Math.max(0, need - laps))} · ${hearts(life)}</div>`
          + `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;padding:8px 10px 0"><button data-mv="lap" style="${btnCss};font-size:13.5px">🔄 성을 한 바퀴</button><button data-mv="camp" style="${btnCss};font-size:13.5px">⛺ 진영으로</button><button data-mv="shout" style="${btnCss};font-size:13.5px">📣 외치기</button></div>${msgBox(msg)}`;
      }
      api.mgAct.textContent = '외치면 계속'; api.mgAct.disabled = true; };
    draw();
    api.mgArea.onclick = e => {
      if (done) return;
      const o = e.target.closest('[data-mr]');
      if (o){ if (+o.dataset.mr === set){ set++; msg = set === ROW.length ? '✓ 행렬이 섰어요 — 이제 성을 돌아요' : ''; } else { perfect = false; if (--life <= 0){ set = 0; life = LIVES; msg = OUT; } else msg = `수 6:9을 다시 봐요 ${hearts(life)}`; } draw(); return; }
      const b = e.target.closest('[data-mv]'); if (!b) return; const mv = b.dataset.mv, need = day < 7 ? 1 : 7;
      if (mv === 'lap'){
        if (laps >= need) lose(day < 7 ? '"매일 한 번씩" (6:3)' : '"일곱 번" (6:4)');
        else { laps++; msg = '📯 나팔 소리 … 백성은 아무 말도 내지 않아요'; if (day === 7 && laps === 7){ msg = '…'; clearTimeout(tmr); tmr = setTimeout(() => { blown = true; horn(); msg = '📯 일곱 번째에 제사장들이 나팔을 불어요 — "외치라" (6:16)'; draw(); }, 700); } }
      } else if (mv === 'camp'){
        if (day === 7) lose('일곱째 날에는 일곱 번 돌아요 (6:15)');
        else if (laps < need) lose('아직 성을 돌지 않았어요');
        else { day++; laps = 0; msg = day === 7 ? '🌅 일곱째 날 새벽 — 오늘은 일곱 번 (6:15)' : `🌙 진영에서 자고 ${day}째 날 아침이에요`; }
      } else if (mv === 'shout'){
        if (day === 7 && blown){ done = true; clearTimeout(tmr); }
        else lose('"너희는 외치지 말며 … 외치라 하는 날에 외칠지니라" (6:10)');
      }
      draw(); };
    api.mgAct.onclick = () => { if (!done) return; api.mgArea.onclick = null; mgCloseAll(); if (perfect) giveBadge('seventh_day'); hold.walls = true; completeTask(q); };
    api.mg.onClose = () => { api.mgArea.onclick = null; clearTimeout(tmr); };
  }
  // 🎲 지파대로 가까이 나아오라(수 7:14) — 누구인지 짐작해 찍지 않고, 말씀이 정한 차례대로 불러낸다
  function lotsGame(q){
    const LV = [['🏳 지파대로 나아오게', '→ 유다 지파가 뽑혔고 (7:16)'], ['👪 족속대로 나아오게', '→ 세라 족속이 뽑혔고 (7:17)'], ['🏠 가족대로 나아오게', '→ 삽디가 뽑혔고 (7:17)'], ['🧍 그 남자들이 나아오게', '→ 갈미의 아들 아간이 뽑혔더라 (7:18)']];
    orderPlay(q, '🎲 지파대로 가까이', '"너희는 아침에 너희의 지파대로 가까이 나아오라 여호와께 뽑히는 그 지파는 그 족속대로 … 족속은 그 가족대로 … 가족은 그 남자들이 가까이 나아올 것이며" (수 7:14) — 누구인지 짐작하지 말고, 말씀이 정한 차례대로 불러요.',
      LV.map(([a, b]) => [a, b]), '수 7:14의 차례를 다시 봐요', '✓ 여호와께서 가려내셨어요');
  }
  // ⛏ 장막 가운데 땅 속(수 7:21-22) — 아간이 말한 자리를 판다. 외투와 금덩이, 그리고 "은은 그 밑에"
  function tentGame(q){
    let depth = 0, life = LIVES, msg = '';
    const FOUND1 = 3, FOUND2 = 5;   // 세 번 파면 외투와 금덩이, 두 번 더 파면 그 밑의 은
    mgOpen('⛏ 아간의 장막', '"보소서 이제 그 물건들을 내 장막 가운데 땅 속에 감추었는데 은은 그 밑에 있나이다" (수 7:21) — 사자들처럼 아간이 말한 자리를 파요.');
    const draw = () => { const ok = depth >= FOUND2;
      api.mgArea.innerHTML = `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px;padding:8px 22px">${[...Array(9).keys()].map(i => `<button data-tn="${i}" style="${btnCss};height:46px;font-size:${i === 4 && depth ? 13 : 20}px">${i === 4 && depth ? (depth >= FOUND2 ? '🧥🟨🪙' : depth >= FOUND1 ? '🧥🟨' : '🕳'.repeat(Math.min(depth, 2))) : '🟫'}</button>`).join('')}</div>`
        + msgBox(msg || (ok ? '✓ 외투 · 금덩이 · 그 밑의 은 이백 세겔' : depth >= FOUND1 ? '🧥 외투와 🟨 금덩이 — 은은 어디에? · ' + hearts(life) : `장막 바닥 · ${hearts(life)}`));
      api.mgAct.textContent = ok ? '계속' : '다 찾으면 계속'; api.mgAct.disabled = !ok; };
    draw();
    api.mgArea.onclick = e => { const b = e.target.closest('[data-tn]'); if (!b || depth >= FOUND2) return;
      if (+b.dataset.tn === 4){ depth++; msg = depth === FOUND1 ? '🧥 시날 산의 아름다운 외투와 🟨 금덩이가 나왔어요 — "은은 그 밑에"' : depth === FOUND2 ? '🪙 은은 그 밑에 있었어요 (7:22)' : ''; }
      else if (--life <= 0){ depth = 0; life = LIVES; msg = OUT; }
      else msg = `여기는 아니에요 — "내 장막 가운데" (7:21) ${hearts(life)}`;
      draw(); };
    api.mgAct.onclick = () => { if (depth < FOUND2) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
    api.mg.onClose = () => { api.mgArea.onclick = null; };
  }
  // 🗺 아이 성 매복(수 8:4-19) — ① 복병과 온 군대의 자리 ② 거짓으로 도망해 성 사람들을 멀리 끌어내기 ③ 여호와의 말씀이 있을 때 단창을 든다
  function ambushGame(q){ api.runDialog(DLG.j8_night, () => ambushPlay(q), null, 'j8_night'); }
  function ambushPlay(q){
    const ASK = [
      { t: '복병 오천 명은 어디에? (8:12)', ok: '⬅ 성읍 서쪽 — 벧엘과 아이 사이', no: ['➡ 성읍 동쪽 — 광야 길', '⬆ 성읍 북쪽 — 골짜기 건너편'] },
      { t: '여호수아와 온 군대는 어디에? (8:11, 13)', ok: '⬆ 성읍 북쪽 — 골짜기 건너편', no: ['⬅ 성읍 서쪽 — 벧엘과 아이 사이', '⬇ 성읍 남쪽 — 먼 들'] },
    ];
    let a = 0, opts = [], inCity = 10, life = LIVES, msg = '', last = 0, tick = null, word = false, done = false;
    const shuffle = () => { const A = ASK[a]; opts = A ? [A.ok, ...A.no].sort(() => Math.random() - 0.5) : []; };
    mgOpen('🗺 아이 성 매복', '"너희는 성읍 뒤로 가서 성읍을 향하여 매복하되 그 성읍에서 너무 멀리 하지 말고" (수 8:4) — 자리를 정하고, 거짓으로 도망해 성 사람들을 끌어낸 뒤, 여호와의 말씀이 있을 때 단창을 들어요.');
    const lose = m => { if (--life <= 0){ inCity = 10; word = false; life = LIVES; msg = OUT; } else msg = `${m} ${hearts(life)}`; };
    const draw = () => {
      if (done){ api.mgArea.innerHTML = `<div style="padding:16px;text-align:center;color:#ffd27a;font-weight:800">🔥 복병이 급히 일어나 성읍에 불을 놓았어요 (8:19)</div>`; api.mgAct.textContent = '계속'; api.mgAct.disabled = false; return; }
      const A = ASK[a];
      if (A){ api.mgArea.innerHTML = `<div style="text-align:center;padding:10px 8px 6px;font-size:14px;font-weight:800">${A.t}</div><div style="display:grid;gap:6px;padding:0 14px">${opts.map((o, i) => `<button data-am="${i}" style="${btnCss};font-size:13.5px">${o}</button>`).join('')}</div>${msgBox(msg || hearts(life))}`; }
      else {
        api.mgArea.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px 4px;font-size:13px"><span>🏯 아이 성 안 ${'🧍'.repeat(inCity)}${inCity ? '' : ' (텅 빔 · 성문이 열렸어요)'}</span></div>`
          + `<div style="text-align:center;font-size:12.5px;padding:2px 10px;min-height:36px;color:${word ? '#ffd27a' : 'inherit'}">${word ? '"네 손에 잡은 단창을 들어 아이를 가리키라 내가 이 성읍을 네 손에 넘겨 주리라" (8:18)' : '복병은 성읍 서쪽에 숨어 있어요 — 성 사람들이 다 따라 나올 때까지'}</div>`
          + `<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:6px 12px 0"><button data-am="flee" style="${btnCss};font-size:14px">🏃 광야 길로 도망하는 척</button><button data-am="spear" style="${btnCss};font-size:14px">🔱 단창을 들기</button></div>${msgBox(msg || hearts(life))}`;
      }
      api.mgAct.textContent = '성읍을 점령하면 계속'; api.mgAct.disabled = true; };
    shuffle(); draw();
    tick = setInterval(() => { if (done || ASK[a] || word) return; if (performance.now() - last > 1400 && inCity < 10){ inCity++; msg = '성 사람들이 성으로 돌아가요 — 계속 도망하는 척!'; draw(); } }, 800);
    api.mgArea.onclick = e => { const b = e.target.closest('[data-am]'); if (!b || done) return; const v = b.dataset.am;
      if (ASK[a]){ if (opts[+v] === ASK[a].ok){ a++; msg = a === ASK.length ? '✓ 자리를 잡았어요 — 이제 아이 왕이 나와요 (8:14)' : ''; shuffle(); } else { if (--life <= 0){ a = 0; life = LIVES; msg = OUT; shuffle(); } else msg = `본문을 다시 봐요 ${hearts(life)}`; } draw(); return; }
      if (v === 'flee'){ last = performance.now(); if (!word){ inCity = Math.max(0, inCity - 1); msg = inCity ? '아이 사람들이 쫓아 나와요 (8:16)' : '"아이와 벧엘에 이스라엘을 따라가지 아니한 자가 하나도 없으며" (8:17)'; if (!inCity) word = true; } }
      else if (v === 'spear'){ if (word) done = true; else lose('아직이에요 — 여호와께서 말씀하실 때 (8:18)'); }
      draw(); };
    api.mgAct.onclick = () => { if (!done) return; api.mgArea.onclick = null; clearInterval(tick); mgCloseAll(); hold.ai = true; completeTask(q); };
    api.mg.onClose = () => { api.mgArea.onclick = null; clearInterval(tick); };
  }
  // 🪨 쇠 연장으로 다듬지 아니한 새 돌(수 8:30-35) — 제단 돌을 고르고, 낭독을 들을 온 회중을 궤 앞에 모은다
  function altarGame(q){ api.runDialog(DLG.j8_altar, () => altarPlay(q), null, 'j8_altar'); }
  function altarPlay(q){
    const STONES = [...Array(10).keys()].map(i => i < 6).sort(() => Math.random() - 0.5);   // true = 다듬지 않은 새 돌
    const PEOPLE = ['장로들', '관리들', '재판장들', '본토인', '이방인', '여자들', '아이', '거류민'];
    const took = new Set(), came = new Set(); let life = LIVES, msg = '';
    mgOpen('🪨 에발 산 제단', '"쇠 연장으로 다듬지 아니한 새 돌로 만든 제단이라" (수 8:31) — 다듬지 않은 돌 여섯을 골라 제단을 쌓고, 율법 낭독을 들을 사람들을 궤 앞으로 모아요.');
    const built = () => took.size >= 6, all = () => came.size >= PEOPLE.length;
    const draw = () => {
      api.mgArea.innerHTML = !built()
        ? `<div style="text-align:center;font-size:13px;padding:6px">제단 ${'🪨'.repeat(took.size)}${'▫️'.repeat(6 - took.size)} · ${hearts(life)}</div><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:5px;padding:4px 10px">${STONES.map((raw, i) => took.has(i) ? `<div></div>` : `<button data-al="${i}" style="${btnCss};font-size:12px;height:48px">${raw ? '🪨<br>거친 돌' : '🔨<br>다듬은 돌'}</button>`).join('')}</div>${msgBox(msg)}`
        : `<div style="text-align:center;font-size:13px;padding:6px">🔥 제단이 섰어요 · 궤 앞에 모인 사람 ${came.size} / ${PEOPLE.length}</div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;padding:4px 10px">${PEOPLE.map((p, i) => `<button data-pp="${i}" style="${btnCss};font-size:12.5px;${came.has(i) ? 'background:rgba(255,210,122,.35)' : ''}">${came.has(i) ? '✓ ' : ''}${p}</button>`).join('')}</div>${msgBox(all() ? '✓ 낭독하지 아니한 말이 하나도 없었어요 (8:35)' : '"본토인뿐 아니라 이방인까지" (8:33) — 한 사람도 빠지지 않게')}`;
      api.mgAct.textContent = built() && all() ? '계속' : '다 모이면 계속'; api.mgAct.disabled = !(built() && all()); };
    draw();
    api.mgArea.onclick = e => {
      const s = e.target.closest('[data-al]');
      if (s && !built()){ const i = +s.dataset.al; if (STONES[i]){ took.add(i); msg = ''; } else if (--life <= 0){ took.clear(); life = LIVES; msg = OUT; } else msg = `"쇠 연장으로 다듬지 아니한" (8:31) ${hearts(life)}`; draw(); return; }
      const p = e.target.closest('[data-pp]'); if (p && built()){ came.add(+p.dataset.pp); draw(); } };
    api.mgAct.onclick = () => { if (!(built() && all())) return; api.mgArea.onclick = null; mgCloseAll(); hold.altar = true; completeTask(q); };
    api.mg.onClose = () => { api.mgArea.onclick = null; };
  }

  // ── 연출 ──
  let actx = null;
  function horn(){ try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); const t0 = actx.currentTime, o = actx.createOscillator(), g = actx.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(311, t0); o.frequency.linearRampToValueAtTime(349, t0 + 0.4);
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.08, t0 + 0.08); g.gain.setValueAtTime(0.08, t0 + 1.3); g.gain.linearRampToValueAtTime(0, t0 + 1.6); o.connect(g); g.connect(actx.destination); o.start(t0); o.stop(t0 + 1.7); } catch (e){} }
  function flash(col, o = 0.5){ const fl = document.getElementById('flash'); if (!fl) return; fl.style.transition = 'none'; fl.style.background = col; fl.style.opacity = String(o); setTimeout(() => { fl.style.transition = 'opacity 1.4s'; fl.style.opacity = '0'; }, 150); setTimeout(() => { fl.style.background = ''; }, 1700); }
  function redCord(){ cordShow = true; refresh('gilgal'); try { api.startCine('j4Cord', HOUSE[0], api.heightAt(HOUSE[0], HOUSE[1]) + 5, HOUSE[1], { r: 9, h: 3, dur: 4, spin: 0.4 }); } catch (e){} }
  let cordShow = false;
  function jordanStop(){ stopped = true; horn(); flash('#e8f4ff', 0.45); refresh('moab'); try { api.startCine('j4Stop', MBED[0], api.heightAt(MBED[0], MBED[1]) + 1, MBED[1], { r: 14, h: 6, dur: 5, spin: 0.5 }); } catch (e){} api.toast('🌊 위에서 흘러내리던 물이 그쳤어요 — 요단 가운데 마른 땅', 2800); }
  function jordanBack(){ horn(); refresh('gilgal', true); try { api.startCine('j4Back', GBED[0], api.heightAt(GBED[0], GBED[1]) + 1, GBED[1], { r: 14, h: 6, dur: 4.5, spin: 0.4 }); } catch (e){} api.toast('🌊 요단 물이 본 곳으로 도로 흘렀어요', 2400); }
  function stonesUp(){ stonesShow = true; refresh('gilgal'); try { api.startCine('j4Stones', MEMO[0], api.heightAt(MEMO[0], MEMO[1]) + 1.5, MEMO[1], { r: 8, h: 3, dur: 4.5, spin: 0.6 }); } catch (e){} }
  let stonesShow = false;
  // 2부 연출
  function wallsFall(){ hold.walls = false; horn(); flash('#f3e2bc', 0.5); refresh('gilgal'); try { api.startCine('j6Fall', JC[0], api.heightAt(JC[0], JC[1]) + 3, JC[1], { r: 24, h: 9, dur: 5.5, spin: 0.35 }); } catch (e){} api.toast('🧱 성벽이 무너져 내렸어요', 2600); }
  function jerichoBurn(){ burnShow = true; flash('#ffb36a', 0.35); refresh('gilgal'); try { api.startCine('j6Burn', JC[0], api.heightAt(JC[0], JC[1]) + 3, JC[1], { r: 26, h: 10, dur: 4.5, spin: 0.3 }); } catch (e){} }
  function achorPile(){ achorShow = true; refresh('gilgal'); try { api.startCine('j7Achor', ACHOR[0], api.heightAt(ACHOR[0], ACHOR[1]) + 1.5, ACHOR[1], { r: 22, h: 9, dur: 5, spin: 0.15 }); } catch (e){} }
  function aiBurn(){ hold.ai = false; flash('#ffb36a', 0.4); refresh('ai'); try { api.startCine('j8Burn', AI[0], api.heightAt(AI[0], AI[1]) + 3, AI[1], { r: 22, h: 9, dur: 5, spin: 0.3 }); } catch (e){} api.toast('🔥 성읍에 연기가 하늘에 닿았어요', 2400); }
  function altarUp(){ hold.altar = false; refresh('ai'); try { api.startCine('j8Altar', ALTAR[0], api.heightAt(ALTAR[0], ALTAR[1]) + 1.5, ALTAR[1], { r: 12, h: 5, dur: 4.5, spin: 0.4 }); } catch (e){} }
  const refresh = (zid, wet) => { if (api.Z && api.Z.id === zid) world(zid, wet); };

  // 마을에 놓이는 것: 여리고 성벽과 라합의 집(붉은 줄) · 요단 가운데 언약궤 · 길갈의 장막과 열두 돌
  let worldObj = null;
  function world(zid, forceWet){
    if (worldObj && worldObj.parent) worldObj.parent.remove(worldObj); worldObj = null;
    const p = cur(); if (!p) return;
    if (p.ch !== 5) hold.walls = false;
    if (p.ch !== 7){ hold.ai = false; hold.altar = false; }
    const g = new THREE.Group(), M = c => new THREE.MeshToonMaterial({ color: c, gradientMap: api.toonGradient });
    const put = (geo, mat, x, dy, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, api.heightAt(x, z) + dy, z); m.castShadow = true; g.add(m); return m; };
    const arkAt = (x, z) => api.loadProps(['ark']).then(() => { const T = api.propTemplates.ark; if (!T || !g.parent) return; const o = T.holder.clone(true); o.position.set(x, api.heightAt(x, z) + 0.05, z); o.rotation.y = Math.PI / 2; g.add(o); }).catch(() => {});
    if (zid === 'moab'){
      const dry = dryMoab(); if (api.setRiver) api.setRiver(dry);
      if (dry){ arkAt(MBED[0], MBED[1]); for (let i = 0; i < 7; i++) put(new THREE.DodecahedronGeometry(0.25 + Math.random() * 0.3), M(0x9a8a72), MBED[0] + (Math.random() - 0.5) * 4, 0.1, MBED[1] + (Math.random() - 0.5) * 18); }
    }
    if (zid === 'gilgal'){
      const dry = !forceWet && dryGilgal(); if (api.setRiver) api.setRiver(dry);
      if (dry) arkAt(GBED[0], GBED[1]);
      // 여리고 성벽(수 2:15 "그의 집이 성벽 위에 있으므로")
      // 수 6:20 뒤로는 무너진 돌더미(6:24 불탄 뒤엔 검게). 라합의 집이 선 성벽 한 칸은 라합을 이끌어 낼 때까지 남는다(6:22-23)
      const down = wallsDown(), burnt = jerichoBurnt();
      const stone = M(burnt ? 0x6a5a48 : 0xcdb48e), dark = M(burnt ? 0x4a3e32 : 0xa8916c), N = 22;
      const houseSeg = i => Math.abs(i / N * Math.PI * 2 - HOUSE_A) < 0.2;
      for (let i = 0; i < N; i++){ const a = i / N * Math.PI * 2; if (Math.abs(a - Math.PI * 0.02) < 0.12) continue;   // 동쪽 성문 자리
        const x = JC[0] + Math.cos(a) * JR, z = JC[1] + Math.sin(a) * JR;
        if (!down || (houseSeg(i) && !burnt)){ const w = put(new THREE.BoxGeometry(3.1, 5, 1.4), i % 2 ? stone : dark, x, 2.5, z); w.rotation.y = -a + Math.PI / 2;
          if (i % 4 === 0 && !down){ const t = put(new THREE.BoxGeometry(2, 6.4, 2), stone, x, 3.2, z); t.rotation.y = -a; } }
        else for (let k = 0; k < 4; k++){ const r = put(new THREE.DodecahedronGeometry(0.5 + Math.random() * 0.5, 0), i % 2 ? stone : dark, x + (Math.random() - 0.5) * 3, 0.3, z + (Math.random() - 0.5) * 2.4); r.rotation.set(Math.random() * 3, Math.random() * 3, 0); } }
      if (!down){ const x = JC[0] + JR, z = JC[1]; put(new THREE.BoxGeometry(0.4, 4, 3.2), M(0x7a5a3a), x + 0.2, 2, z); }   // 닫힌 성문(2:7 · 6:1)
      if (!api.obstacles.some(o => o.j4)){ for (let i = 0; i < 40; i++){ const a = i / 40 * Math.PI * 2; api.obstacles.push({ x: JC[0] + Math.cos(a) * JR, z: JC[1] + Math.sin(a) * JR, r: 1.3, j4: true }); } }
      // 라합의 집: 성벽 위, 창문(줄은 2:21 뒤부터 붉게) — 6:24 성을 불사른 뒤로는 없다
      const hx = JC[0] + Math.cos(HOUSE_A) * JR, hz = JC[1] + Math.sin(HOUSE_A) * JR;
      if (!burnt){
        const hs = put(new THREE.BoxGeometry(3.2, 2.4, 2.6), M(0xd9c29a), hx, 6.2, hz); hs.rotation.y = -HOUSE_A + Math.PI / 2;
        for (let k = 0; k < 6; k++){ const f = put(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 4), M(0xc9b46a), hx + (Math.random() - 0.5) * 2, 7.5, hz + (Math.random() - 0.5) * 1.6); f.rotation.z = Math.PI / 2; f.rotation.y = Math.random() * 3; }   // 지붕의 삼대(2:6)
        const wx = JC[0] + Math.cos(HOUSE_A) * (JR + 1.35), wz = JC[1] + Math.sin(HOUSE_A) * (JR + 1.35);
        const win = put(new THREE.BoxGeometry(0.9, 0.8, 0.12), M(0x3a2a1a), wx, 6.3, wz); win.rotation.y = -HOUSE_A + Math.PI / 2;
        if (cordShow || cordTied()){ const c = put(new THREE.CylinderGeometry(0.06, 0.06, 5.6, 6), M(0xc0201a), wx + Math.cos(HOUSE_A) * 0.1, 3.3, wz + Math.sin(HOUSE_A) * 0.1); }
      }
      // 5장부터 진영의 언약궤(7:6 "여호와의 궤 앞에서")
      if (p.ch >= 4) arkAt(ARK_G[0], ARK_G[1]);
      // 아골 골짜기의 큰 돌 무더기(7:26) — 남쪽 원경
      if (achorShow || from(6, 8)()){ for (let i = 0; i < 26; i++){ const a = Math.random() * Math.PI * 2, r = Math.random() * 2.6, s = put(new THREE.DodecahedronGeometry(0.45 + Math.random() * 0.35, 0), M(i % 3 ? 0x8f8270 : 0x7a6e5e), ACHOR[0] + Math.cos(a) * r, 0.3 + (2.6 - r) * 0.7, ACHOR[1] + Math.sin(a) * r); s.rotation.set(Math.random() * 3, Math.random() * 3, 0); } }
      // 길갈: 장막과 열두 돌(4장부터)
      if (p.ch >= 3){
        api.loadProps(['tent-mid', 'tent-small', 'tent-cluster']).then(() => { if (!g.parent) return;
          [['tent-cluster', 22, 12], ['tent-mid', 8, 16], ['tent-mid', 24, -16], ['tent-small', 4, -12], ['tent-mid', -2, 20], ['tent-small', 18, 22], ['tent-cluster', 6, -22]].forEach(([n, x, z]) => {
            const T = api.propTemplates[n]; if (!T) return; const o = T.holder.clone(true); o.position.set(x, api.heightAt(x, z), z); o.rotation.y = Math.atan2(MEMO[0] - x, MEMO[1] - z); g.add(o); }); }).catch(() => {});
        if (stonesShow || p.ch > 3 || (p.ch === 3 && (p.cleared || p.step >= 5))){
          for (let i = 0; i < 12; i++){ const a = i / 12 * Math.PI * 2, s = put(new THREE.DodecahedronGeometry(0.55, 0), M(i % 2 ? 0xb8a88e : 0xa8977c), MEMO[0] + Math.cos(a) * 2.6, 0.45, MEMO[1] + Math.sin(a) * 2.6); s.scale.set(1, 1.3, 1); s.rotation.y = a; }
        }
      }
    }
    if (zid === 'ai'){
      // 벧엘(서쪽) 집들
      [[0, 0], [3.4, 2], [-2.6, 3], [2, -3.2], [-3, -2.4]].forEach(([dx, dz], i) => { const h = put(new THREE.BoxGeometry(2.6, 2.2, 2.4), M(i % 2 ? 0xd2bf98 : 0xc4ae86), BETHEL[0] + dx, 1.1, BETHEL[1] + dz); h.rotation.y = i * 0.5; });
      // 아이 성: 8:19 불을 놓기 전까지는 작은 성벽과 집들, 그 뒤로는 "영원한 무더기"(8:28)와 성문 어귀의 돌 무더기(8:29)
      const burnt = from(7, 3)() && !hold.ai;
      if (!burnt){
        const st = M(0xc8b08a), dk = M(0xa58e6a), N = 14;
        for (let i = 0; i < N; i++){ const a = i / N * Math.PI * 2; if (Math.abs(a) < 0.25 || Math.abs(a - Math.PI * 2) < 0.25) continue;   // 동쪽 성문
          const w = put(new THREE.BoxGeometry(2.8, 3.4, 1.2), i % 2 ? st : dk, AI[0] + Math.cos(a) * AIR, 1.7, AI[1] + Math.sin(a) * AIR); w.rotation.y = -a + Math.PI / 2; }
        [[-1.5, -1], [1.6, 1.4], [-1.2, 2.2]].forEach(([dx, dz]) => put(new THREE.BoxGeometry(2, 1.8, 2), M(0xd6c39c), AI[0] + dx, 0.9, AI[1] + dz));
        // 8장 성문이 열려 있음(8:17) — 7장에는 닫힌 문
        if (p.ch < 7 || (p.ch === 7 && p.step < 2)) put(new THREE.BoxGeometry(0.4, 3, 2.6), M(0x7a5a3a), AI[0] + AIR + 0.2, 1.5, AI[1]);
      } else {
        const heap = put(new THREE.ConeGeometry(AIR + 1, 4.2, 9), M(0x5e5246), AI[0], 1.6, AI[1]); heap.castShadow = false;
        for (let i = 0; i < 14; i++){ const a = Math.random() * Math.PI * 2, s = put(new THREE.DodecahedronGeometry(0.4 + Math.random() * 0.3, 0), M(0x7a6e5e), AI[0] + AIR + 1.6 + Math.cos(a) * Math.random() * 1.3, 0.35, AI[1] + Math.sin(a) * Math.random() * 1.3); s.rotation.set(Math.random() * 3, Math.random() * 3, 0); }
        if (p.ch === 7 && !p.cleared && p.step === 3){ const sm = new THREE.MeshBasicMaterial({ color: 0x55504a, transparent: true, opacity: 0.35, depthWrite: false });   // 연기(8:20)
          for (let i = 0; i < 6; i++){ const s = new THREE.Mesh(new THREE.SphereGeometry(1.6 + i * 0.5, 10, 8), sm); s.position.set(AI[0] + (Math.random() - 0.5) * 3, api.heightAt(AI[0], AI[1]) + 4 + i * 2.6, AI[1] + (Math.random() - 0.5) * 3); g.add(s); } }
      }
      if (!api.obstacles.some(o => o.j4ai)){ for (let i = 0; i < 22; i++){ const a = i / 22 * Math.PI * 2; if (Math.abs(a) < 0.25 || Math.abs(a - Math.PI * 2) < 0.25) continue; api.obstacles.push({ x: AI[0] + Math.cos(a) * AIR, z: AI[1] + Math.sin(a) * AIR, r: 1.2, j4ai: true }); } }
      // 8장: 북쪽 진(8:11)
      if (p.ch === 7) api.loadProps(['tent-mid', 'tent-small']).then(() => { if (!g.parent) return;
        [['tent-mid', CAMP8[0] - 5, CAMP8[1] - 4], ['tent-small', CAMP8[0] + 4, CAMP8[1] - 5], ['tent-mid', CAMP8[0] + 9, CAMP8[1] - 2]].forEach(([n, x, z]) => { const T = api.propTemplates[n]; if (!T) return; const o = T.holder.clone(true); o.position.set(x, api.heightAt(x, z), z); o.rotation.y = Math.atan2(AI[0] - x, AI[1] - z); g.add(o); }); }).catch(() => {});
      // 에발 산과 그리심 산 사이의 궤(8:33), 쇠 연장으로 다듬지 않은 돌 제단(8:31)
      if (from(7, 3)()) arkAt(ARK_E[0], ARK_E[1]);
      if (from(7, 4)() && !hold.altar){
        for (let y = 0; y < 3; y++) for (let i = 0; i < 7 - y * 2; i++){ const a = i / (7 - y * 2) * Math.PI * 2, r = 1.4 - y * 0.45, s = put(new THREE.DodecahedronGeometry(0.5, 0), M(i % 2 ? 0xb3a284 : 0x9c8c72), ALTAR[0] + Math.cos(a) * r, 0.4 + y * 0.75, ALTAR[1] + Math.sin(a) * r); s.rotation.set(Math.random() * 3, Math.random() * 3, 0); }
        const fire = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.3, 8), new THREE.MeshBasicMaterial({ color: 0xff9a3a, transparent: true, opacity: 0.85 })); fire.position.set(ALTAR[0], api.heightAt(ALTAR[0], ALTAR[1]) + 2.6, ALTAR[1]); g.add(fire);
      }
    }
    if (g.children.length || zid === 'moab' || zid === 'gilgal' || zid === 'ai'){ api.zoneRoot.add(g); worldObj = g; }
  }

  const T = n => `📜 여호수아와 함께 ${n}장`;
  return {
    id: 'joshua',
    chapters: [
      { title: `${T(1)} — 강하고 담대하라`, clearTitle: '🎉 4편 1장 「강하고 담대하라」 완료!', next: '2장: 라합과 붉은 줄',
        steps: [
          { id: 'j1s1', zone: 'moab', obj: '여호수아에게 — 모세가 죽은 후에', where: '모압 평지 회막 앞의 여호수아', npc: 'j4_joshua', dlg: 'j4_call' },
          { id: 'j1s2', zone: 'moab', obj: '관리들에게 — 양식을 준비하라', where: '회막 앞의 여호수아', npc: 'j4_joshua', dlg: 'j4_officers' },
          { id: 'j1s3', zone: 'moab', obj: '머물 사람, 앞서 건널 사람', where: '진영 가운데의 르우벤·갓·므낫세 반 지파', npc: 'j4_east', game: 'stay', doneDlg: 'j4_answer', reward: { verse: 'jos1-9', clear: true } },
        ] },
      { title: `${T(2)} — 라합과 붉은 줄`, clearTitle: '🎉 4편 2장 「라합과 붉은 줄」 완료!', next: '3장: 요단이 멈춤',
        steps: [
          { id: 'j2s1', zone: 'moab', obj: '두 사람을 정탐꾼으로 보내는 여호수아', where: '회막 앞의 여호수아', npc: 'j4_joshua', dlg: 'j4_send' },
          { id: 'j2s2', zone: 'moab', obj: '요단을 건너 여리고로', where: '서쪽 요단 강가의 초록 빛기둥', exit: 'to-gilgal' },
          { id: 'j2s3', zone: 'gilgal', obj: '라합의 집 — 지붕의 삼대 아래에 숨기기', where: '여리고 성벽 동북쪽, 성벽 위의 집(빛나는 곳)', point: 'j4_house', game: 'hide', doneDlg: 'j4_king' },
          { id: 'j2s4', zone: 'gilgal', obj: '지붕에 올라온 라합의 말', where: '라합의 집 아래의 라합', npc: 'j4_rahab', dlg: 'j4_roof' },
          { id: 'j2s5', zone: 'gilgal', obj: '창문에서 줄로 달아 내리기', where: '성벽 위 라합의 집(빛나는 곳)', point: 'j4_house', game: 'cord', doneDlg: 'j4_cord' },
          { id: 'j2s6', zone: 'gilgal', obj: '산에서 사흘 숨어 있기', where: '북서쪽 산(빛나는 곳)', point: 'j4_hills', game: 'hills', doneDlg: 'j4_hills_done' },
          { id: 'j2s7', zone: 'gilgal', obj: '강을 건너 돌아가기', where: '동쪽 요단 강가의 초록 빛기둥', exit: 'to-moab4' },
          { id: 'j2s8', zone: 'moab', obj: '여호수아에게 — 겪은 모든 일', where: '회막 앞의 여호수아', npc: 'j4_joshua', dlg: 'j4_report', reward: { verse: 'jos2-11', clear: true } },
        ] },
      { title: `${T(3)} — 요단이 멈춤`, clearTitle: '🎉 4편 3장 「요단이 멈춤」 완료!', next: '4장: 기념 돌 열둘',
        steps: [
          { id: 'j3s1', zone: 'moab', obj: '싯딤에서 떠나 요단에 이르러', where: '회막 앞의 여호수아', npc: 'j4_joshua', dlg: 'j4_early' },
          { id: 'j3s2', zone: 'moab', obj: '"이리 와서 … 말씀을 들으라"', where: '서쪽 요단 강가(빛나는 곳)', point: 'j4_bank', dlg: 'j4_word' },
          { id: 'j3s3', zone: 'moab', obj: '언약궤와 이천 규빗쯤', where: '서쪽 요단 강가(빛나는 곳)', point: 'j4_bank', game: 'follow' },
          { id: 'j3s4', zone: 'moab', obj: '제사장들의 발이 물 가에 잠기자', where: '서쪽 요단 강가(빛나는 곳)', point: 'j4_bank', dlg: 'j4_stop' },
          { id: 'j3s5', zone: 'moab', obj: '요단 가운데 마른 땅', where: '요단 강 한가운데(빛나는 곳)', point: 'j4_mbed', dlg: 'j4_dry', reward: { verse: 'jos3-17', clear: true } },
        ] },
      { title: `${T(4)} — 기념 돌 열둘`, clearTitle: '🎉 4편 4장 「기념 돌 열둘」 완료!', next: '5장: 여호와의 군대 대장',
        steps: [
          { id: 'j4s1', zone: 'moab', obj: '마른 땅으로 요단을 건너기', where: '요단 강 한가운데 서쪽의 초록 빛기둥', exit: 'to-gilgal2' },
          { id: 'j4s2', zone: 'gilgal', obj: '여호수아에게 — 열두 사람', where: '요단 서쪽 강가의 여호수아', npc: 'j4_joshua_g', dlg: 'j4_twelve' },
          { id: 'j4s3', zone: 'gilgal', obj: '요단 가운데에서 돌 열둘', where: '동쪽 요단 가운데, 제사장들의 발이 선 곳(빛나는 곳)', point: 'j4_gbed', game: 'stones', doneDlg: 'j4_carry' },
          { id: 'j4s4', zone: 'gilgal', obj: '모든 백성이 건너기를 마치기까지', where: '요단 가운데(빛나는 곳)', point: 'j4_gbed', dlg: 'j4_crossed' },
          { id: 'j4s5', zone: 'gilgal', obj: '"요단에서 올라오라"', where: '요단 서쪽 강가의 여호수아', npc: 'j4_joshua_g', dlg: 'j4_up' },
          { id: 'j4s6', zone: 'gilgal', obj: '길갈에 세운 열두 돌', where: '길갈 진영 가운데(빛나는 곳)', point: 'j4_memo', dlg: 'j4_gilgal', reward: { verse: 'jos4-24', clear: true } },
        ] },
      { title: `${T(5)} — 여호와의 군대 대장`, clearTitle: '🎉 4편 5장 「여호와의 군대 대장」 완료!', next: '6장: 여리고',
        steps: [
          { id: 'j5s1', zone: 'gilgal', obj: '여호수아에게 — 부싯돌로 칼을 만들어', where: '길갈 진영 동쪽의 여호수아', npc: 'j4_joshua_g', dlg: 'j5_flint' },
          { id: 'j5s2', zone: 'gilgal', obj: '할례 산 — 할례를 시행한 까닭', where: '진영 북쪽의 할례 산(빛나는 곳)', point: 'j5_hill', dlg: 'j5_why' },
          { id: 'j5s3', zone: 'gilgal', obj: '길갈의 날들 — 유월절과 만나', where: '길갈 진영 가운데(빛나는 곳)', point: 'j5_camp', game: 'calendar', doneDlg: 'j5_manna' },
          { id: 'j5s4', zone: 'gilgal', obj: '여리고 가까이 — 칼을 빼어 든 한 사람', where: '여리고 성 동쪽 들(빛나는 곳)', point: 'j5_man', game: 'holy', doneDlg: 'j5_holy', reward: { verse: 'jos5-15', clear: true } },
        ] },
      { title: `${T(6)} — 여리고`, clearTitle: '🎉 4편 6장 「여리고」 완료!', next: '7장: 아이 성 첫 패배와 아간',
        steps: [
          { id: 'j6s1', zone: 'gilgal', obj: '여호수아에게 — 성을 돌라', where: '길갈 진영 동쪽의 여호수아', npc: 'j4_joshua_g', dlg: 'j6_word' },
          { id: 'j6s2', zone: 'gilgal', obj: '엿새 동안, 그리고 일곱째 날', where: '굳게 닫힌 여리고 성문 앞(빛나는 곳)', point: 'j6_gate', game: 'march', doneDlg: 'j6_fall' },
          { id: 'j6s3', zone: 'gilgal', obj: '여호수아에게 — 맹세한 대로', where: '길갈 진영 동쪽의 여호수아', npc: 'j4_joshua_g', dlg: 'j6_spies' },
          { id: 'j6s4', zone: 'gilgal', obj: '붉은 줄이 매인 라합의 집', where: '무너진 성벽 동북쪽, 라합의 집(빛나는 곳)', point: 'j4_house', dlg: 'j6_rescue' },
          { id: 'j6s5', zone: 'gilgal', obj: '진영 밖의 라합', where: '진영 북서쪽 밖의 라합', npc: 'j6_rahab_out', dlg: 'j6_end', reward: { verse: 'jos6-20', clear: true } },
        ] },
      { title: `${T(7)} — 아이 성 첫 패배와 아간`, clearTitle: '🎉 4편 7장 「아이 성 첫 패배와 아간」 완료!', next: '8장: 아이 성 매복',
        steps: [
          { id: 'j7s1', zone: 'gilgal', obj: '여호수아에게 — 아이를 정탐하라', where: '길갈 진영 동쪽의 여호수아', npc: 'j4_joshua_g', dlg: 'j7_send' },
          { id: 'j7s2', zone: 'gilgal', obj: '아이로 올라가기', where: '서쪽 길의 초록 빛기둥(여리고 북서쪽)', exit: 'to-ai' },
          { id: 'j7s3', zone: 'ai', obj: '아이 성문 앞 — 삼천 명쯤', where: '아이 성 동쪽 성문 앞(빛나는 곳)', point: 'j7_aigate', dlg: 'j7_defeat' },
          { id: 'j7s4', zone: 'ai', obj: '길갈로 내려가기', where: '동쪽 길의 초록 빛기둥', exit: 'to-gilgal3' },
          { id: 'j7s5', zone: 'gilgal', obj: '여호와의 궤 앞 — 여호수아의 기도', where: '진영의 여호와의 궤 앞(빛나는 곳)', point: 'j7_ark', dlg: 'j7_pray' },
          { id: 'j7s6', zone: 'gilgal', obj: '아침에 지파대로 가까이', where: '진영의 여호와의 궤 앞(빛나는 곳)', point: 'j7_ark', game: 'lots', doneDlg: 'j7_confess' },
          { id: 'j7s7', zone: 'gilgal', obj: '아간의 장막 — 장막 가운데 땅 속', where: '진영 안 아간의 장막(빛나는 곳)', point: 'j7_tent', game: 'tent', doneDlg: 'j7_found' },
          { id: 'j7s8', zone: 'gilgal', obj: '아골 골짜기', where: '길갈 진영 동쪽의 여호수아', npc: 'j4_joshua_g', dlg: 'j7_achor', reward: { verse: 'jos7-20', clear: true } },
        ] },
      { title: `${T(8)} — 아이 성 매복`, clearTitle: '🎉 4편 8장 「아이 성 매복」 완료!', next: '9장: 기브온의 속임 (준비 중)',
        steps: [
          { id: 'j8s1', zone: 'gilgal', obj: '여호수아에게 — 두려워하지 말라', where: '길갈 진영 동쪽의 여호수아', npc: 'j4_joshua_g', dlg: 'j8_word' },
          { id: 'j8s2', zone: 'gilgal', obj: '다시 아이로 올라가기', where: '서쪽 길의 초록 빛기둥(여리고 북서쪽)', exit: 'to-ai' },
          { id: 'j8s3', zone: 'ai', obj: '매복과 단창', where: '아이 북쪽, 골짜기 건너편 진(빛나는 곳)', point: 'j8_camp', game: 'ambush', doneDlg: 'j8_fall' },
          { id: 'j8s4', zone: 'ai', obj: '에발 산 제단과 율법 낭독', where: '북쪽 두 산 사이, 오른쪽 에발 산 아래(빛나는 곳)', point: 'j8_altar', game: 'altar', doneDlg: 'j8_ebal', reward: { verse: 'jos8-35', clear: true } },
        ] },
    ],
    games: { stay: stayGame, hide: hideGame, cord: cordGame, hills: hillsGame, follow: followGame, stones: stonesGame,
      calendar: calendarGame, holy: holyGame, march: marchGame, lots: lotsGame, tent: tentGame, ambush: ambushGame, altar: altarGame },
    events: { redCord, jordanStop, jordanBack, stonesUp, wallsFall, jerichoBurn, achorPile, aiBurn, altarUp },
    world: zid => world(zid),
  };
});
