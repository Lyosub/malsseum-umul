// 4편 「여호수아와 함께」 — 여호수아 1–24장, 13장. 2026-10-12 1부(1~4장: 강하고 담대하라 · 라합과 붉은 줄 · 요단이 멈춤 · 기념 돌 열둘) 먼저.
// 대사 원칙: 성경 인물은 개역개정에 있는 자기 말만, 해설은 원문 + (출처). 2026-10-12 bskorea 개역개정(GAE) 수 1–4장 원문 대조.
// 무대: 1~3장은 모압 평지(수 2:1·3:1 "싯딤"), 2장 여리고와 4장 길갈은 요단 서쪽 「길갈과 여리고」 마을.
// 새 인물(라합·두 정탐꾼·동편 지파 대표)은 GPT/Meshy 모델이 오기 전까지 이미 있는 모델을 쓴다.
(window.__odyQ = window.__odyQ || []).push(api => {
  const { DLG, ZONES, CONDS, VERSES, THREE, SPEAKERS: { NAR } } = api;
  const JOSHUA = { n: '여호수아' }, EAST = { n: '르우벤·갓·므낫세 반 지파' }, SPIES = { n: '두 정탐꾼' }, RAHAB = { n: '라합' }, OFFICERS = { n: '관리들' };
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

  // 단계 번호(장 index · step index)
  // 0장: 0 여호수아 · 1 관리들 · 2 동편 지파
  // 1장: 0 정탐꾼을 보냄 · 1 요단을 건너 여리고로 · 2 삼대에 숨기기 · 3 라합의 고백 · 4 줄로 달아 내리기 · 5 산에서 사흘 · 6 요단을 건너 돌아가기 · 7 여호수아에게 보고
  // 2장: 0 싯딤에서 떠남 · 1 강가에서 말씀 · 2 이천 규빗 · 3 물이 멈춤 · 4 요단 가운데 마른 땅
  // 3장: 0 마른 땅으로 건너기 · 1 열두 사람 · 2 돌 열둘 · 3 백성이 다 건넘 · 4 제사장들이 올라옴 · 5 길갈의 열두 돌
  let stopped = false;   // 3:16 물이 그친 순간(대사 도중)부터 마른 땅
  const dryMoab = () => { const p = cur(); return !!p && ((p.ch === 2 && (p.cleared || p.step >= 4 || (stopped && p.step === 3))) || (p.ch === 3 && p.step === 0 && !p.cleared)); };
  const dryGilgal = () => { const p = cur(); return !!p && p.ch === 3 && !p.cleared && p.step <= 4; };
  const cordTied = from(1, 5);
  Object.assign(CONDS, {
    j4On: () => !!cur(),
    j4moab: () => { const p = cur(); return !!p && p.ch <= 2; },
    j4c0: at(0), j4c1: at(1), j4east: () => { const p = cur(); return !!p && p.ch === 0; },
    j4bank: () => !!cur() && !dryMoab(),   // 강가 나루(요단이 마른 동안에는 강 가운데 길로)
    j4back: () => { const p = cur(); return !!p && p.ch === 1 && p.step >= 5; },
    j4spiesHouse: at(1, 2, 4), j4spiesHills: at(1, 5, 5), j4rahab: from(1, 2), j4hills: at(1, 5, 5), j4house: at(1, 2, 4),
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

  // ── 구절 카드(개역개정 원문) ──
  Object.assign(VERSES, {
    'jos1-9': { ref: '여호수아 1:9', text: '내가 네게 명령한 것이 아니냐 강하고 담대하라 두려워하지 말며 놀라지 말라 네가 어디로 가든지 네 하나님 여호와가 너와 함께 하느니라 하시니라' },
    'jos2-11': { ref: '여호수아 2:11', text: '우리가 듣자 곧 마음이 녹았고 너희로 말미암아 사람이 정신을 잃었나니 너희의 하나님 여호와는 위로는 하늘에서도 아래로는 땅에서도 하나님이시니라' },
    'jos3-17': { ref: '여호수아 3:17', text: '여호와의 언약궤를 멘 제사장들은 요단 가운데 마른 땅에 굳게 섰고 그 모든 백성이 요단을 건너기를 마칠 때까지 모든 이스라엘은 그 마른 땅으로 건너갔더라' },
    'jos4-24': { ref: '여호수아 4:24', text: '이는 땅의 모든 백성에게 여호와의 손이 강하신 것을 알게 하며 너희가 너희의 하나님 여호와를 항상 경외하게 하려 하심이라 하라' },
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
  });

  const { mgOpen, mgCloseAll, completeTask } = api;
  const btnCss = 'padding:8px 6px;border-radius:10px;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.08);color:#f5e9d0;font-size:13px';
  const LIVES = 3, hearts = n => '❤️'.repeat(Math.max(0, n)) + '🤍'.repeat(Math.max(0, LIVES - n));
  const OUT = '❤️을 다 썼어요 — 처음부터 다시';
  // 🏅 4편 배지(SQL claim_odyssey_achieve 키 badge-red_cord · twelve_stones)
  Object.assign(api.BADGES, { red_cord: { ico: '🧵', name: '붉은 줄을 지킨 사람' }, twelve_stones: { ico: '🪨', name: '열두 돌을 세운 사람' } });
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
  const refresh = (zid, wet) => { if (api.Z && api.Z.id === zid) world(zid, wet); };

  // 마을에 놓이는 것: 여리고 성벽과 라합의 집(붉은 줄) · 요단 가운데 언약궤 · 길갈의 장막과 열두 돌
  let worldObj = null;
  function world(zid, forceWet){
    if (worldObj && worldObj.parent) worldObj.parent.remove(worldObj); worldObj = null;
    const p = cur(); if (!p) return;
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
      const stone = M(0xcdb48e), dark = M(0xa8916c), N = 22;
      for (let i = 0; i < N; i++){ const a = i / N * Math.PI * 2; if (Math.abs(a - Math.PI * 0.02) < 0.12) continue;   // 동쪽 성문 자리
        const x = JC[0] + Math.cos(a) * JR, z = JC[1] + Math.sin(a) * JR, w = put(new THREE.BoxGeometry(3.1, 5, 1.4), i % 2 ? stone : dark, x, 2.5, z); w.rotation.y = -a + Math.PI / 2;
        if (i % 4 === 0){ const t = put(new THREE.BoxGeometry(2, 6.4, 2), stone, x, 3.2, z); t.rotation.y = -a; } }
      { const x = JC[0] + JR, z = JC[1]; const d = put(new THREE.BoxGeometry(0.4, 4, 3.2), M(0x7a5a3a), x + 0.2, 2, z); }   // 닫힌 성문(2:7)
      if (!api.obstacles.some(o => o.j4)){ for (let i = 0; i < 40; i++){ const a = i / 40 * Math.PI * 2; api.obstacles.push({ x: JC[0] + Math.cos(a) * JR, z: JC[1] + Math.sin(a) * JR, r: 1.3, j4: true }); } }
      // 라합의 집: 성벽 위, 창문(줄은 2:21 뒤부터 붉게)
      const hx = JC[0] + Math.cos(HOUSE_A) * JR, hz = JC[1] + Math.sin(HOUSE_A) * JR;
      const hs = put(new THREE.BoxGeometry(3.2, 2.4, 2.6), M(0xd9c29a), hx, 6.2, hz); hs.rotation.y = -HOUSE_A + Math.PI / 2;
      for (let k = 0; k < 6; k++){ const f = put(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 4), M(0xc9b46a), hx + (Math.random() - 0.5) * 2, 7.5, hz + (Math.random() - 0.5) * 1.6); f.rotation.z = Math.PI / 2; f.rotation.y = Math.random() * 3; }   // 지붕의 삼대(2:6)
      const wx = JC[0] + Math.cos(HOUSE_A) * (JR + 1.35), wz = JC[1] + Math.sin(HOUSE_A) * (JR + 1.35);
      const win = put(new THREE.BoxGeometry(0.9, 0.8, 0.12), M(0x3a2a1a), wx, 6.3, wz); win.rotation.y = -HOUSE_A + Math.PI / 2;
      if (cordShow || cordTied()){ const c = put(new THREE.CylinderGeometry(0.06, 0.06, 5.6, 6), M(0xc0201a), wx + Math.cos(HOUSE_A) * 0.1, 3.3, wz + Math.sin(HOUSE_A) * 0.1); }
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
    if (g.children.length || zid === 'moab' || zid === 'gilgal'){ api.zoneRoot.add(g); worldObj = g; }
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
      { title: `${T(4)} — 기념 돌 열둘`, clearTitle: '🎉 4편 4장 「기념 돌 열둘」 완료!', next: '5장: 여호와의 군대 대장 (준비 중)',
        steps: [
          { id: 'j4s1', zone: 'moab', obj: '마른 땅으로 요단을 건너기', where: '요단 강 한가운데 서쪽의 초록 빛기둥', exit: 'to-gilgal2' },
          { id: 'j4s2', zone: 'gilgal', obj: '여호수아에게 — 열두 사람', where: '요단 서쪽 강가의 여호수아', npc: 'j4_joshua_g', dlg: 'j4_twelve' },
          { id: 'j4s3', zone: 'gilgal', obj: '요단 가운데에서 돌 열둘', where: '동쪽 요단 가운데, 제사장들의 발이 선 곳(빛나는 곳)', point: 'j4_gbed', game: 'stones', doneDlg: 'j4_carry' },
          { id: 'j4s4', zone: 'gilgal', obj: '모든 백성이 건너기를 마치기까지', where: '요단 가운데(빛나는 곳)', point: 'j4_gbed', dlg: 'j4_crossed' },
          { id: 'j4s5', zone: 'gilgal', obj: '"요단에서 올라오라"', where: '요단 서쪽 강가의 여호수아', npc: 'j4_joshua_g', dlg: 'j4_up' },
          { id: 'j4s6', zone: 'gilgal', obj: '길갈에 세운 열두 돌', where: '길갈 진영 가운데(빛나는 곳)', point: 'j4_memo', dlg: 'j4_gilgal', reward: { verse: 'jos4-24', clear: true } },
        ] },
    ],
    games: { stay: stayGame, hide: hideGame, cord: cordGame, hills: hillsGame, follow: followGame, stones: stonesGame },
    events: { redCord, jordanStop, jordanBack, stonesUp },
    world: zid => world(zid),
  };
});
