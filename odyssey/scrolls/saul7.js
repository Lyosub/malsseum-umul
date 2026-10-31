// 7편 「사울과 다윗」 — 사무엘상 8–31장(2026-10-30 전도사님 결정: 삼상 8–31 전체를 한 편, 16장, 부별 배포). 이 파일은 1부 「사울 왕」(1~4장, 삼상 8–12장).
// 대사·구절 카드는 E:\temp\claude-work\saul7\gen7.py가 bskorea 개역개정 원문 파일에서 그대로 뽑는다(손으로 옮기지 않음).
// 무대: 1장 실로와 세겜의 라마(6편과 같은 자리, 삼상 7:17) · 2장 새 마을 기브아와 믹마스(기스의 집·숩 땅의 성읍·하나님의 산) → 기브온 마을(미스바, 6편과 같은 자리)
//       3장 모압 평지(요단 동편 길르앗 야베스) · 기브아 · 길갈 · 4장 길갈. 11:7(겨릿소)은 해설로 읽기만, 11:11 싸움은 먼지만 멀리.
// 새 인물 원화는 GPT 14차(2026-10-30 도착) → 11/24 Meshy 충전 뒤 3D. 그 전에는 기존 모델로 대신한다(M_ 한 곳만 바꾸면 됨).
(window.__odyQ = window.__odyQ || []).push(api => {
  const { DLG, ZONES, CONDS, VERSES, THREE, SPEAKERS: { NAR } } = api;
  const SAUL = { n: '사울' }, SAMUEL = { n: '사무엘' }, ELDERS = { n: '장로들' }, SERVANT = { n: '사환' }, GIRLS = { n: '소녀들' }, PEOPLE = { n: '백성' };
  const cur = () => api.ST.cur === 'saul' && api.ST.sp.saul ? api.ST.sp.saul : null;
  const at = (ch, a = 0, b = 99) => () => { const p = cur(); return !!p && p.ch === ch && !p.cleared && p.step >= a && p.step <= b; };
  const any = (...fs) => () => fs.some(f => f());
  // 새 인물 3D(GPT 14차 → Meshy)가 오기 전 임시 모델 — 사무엘은 6편 9장과 같은 모델
  const M_ = { samuel: 'j5-levite-youth', saul: 'j4-spy-1', servant: 'ca-water-boy', kish: 'he-father', uncle: 'he-grandpa', girls: 'he-girl-hb', elders: 'ca-israel-elder',
    prophets: 'he-levite', people: 'he-brickmaker', nahash: 'j5-midianite', messenger: 'ca-horn-blower' };
  const TALL = 1.12;   // "키는 모든 백성보다 어깨 위만큼 더 컸더라"(삼상 9:2, 10:23)

  // ── 자리 ──
  const RAMAH = [-30, 22];                                                                                   // 실로와 세겜: 라마(6편과 같은 자리)
  const KISH = [-22, 4], SEARCH = [0, 12], WELL = [14, 4], ZGATE = [20, -8], HIGH = [32, -26], EDGE = [10, -16], GODHILL = [-10, -26], FIELD = [-30, 30];   // 기브아와 믹마스
  const RACHEL = [4, 28], TABOR = [-10, 36];
  const MIZ7 = [10, 20], BAGS = [4, 26];                                                                     // 기브온 마을(미스바)
  const JABESH = [-16, 34], AMMON = [0, 40];                                                                 // 모압 평지(요단 동편) — 가운데 성막 뜰을 피해 북쪽
  const GIL7 = [12, 2], WHEAT = [-20, 10];                                                                   // 길갈
  // 단계 번호
  // 0장: 0 라마 · 1 장로들 · 2 여호와의 대답 · 3 왕의 제도
  // 1장: 0 기스의 집 · 1 암나귀 찾기 · 2 소녀들 · 3 선견자 · 4 산당 · 5 기름 부음 · 6 세 징조 · 7 선지자의 무리 · 8 숙부 · 9 미스바 · 10 짐보따리
  // 2장: 0 야베스 · 1 밭에서 온 사울 · 2 새벽 세 대 · 3 길갈
  // 3장: 0 증언 · 1 기억의 길 · 2 우레와 비 · 3 기도하기를 쉬는 죄
  let dustShow = false, rainShow = false, oilShow = false;
  Object.assign(CONDS, {
    slOn: () => !!cur(),
    slRamah: at(0, 0, 3),
    slKish: at(1, 0, 0), slSaulHome: at(1, 0, 1), slGirls: at(1, 2, 2), slSaulZuph: at(1, 2, 3), slSamZuph: at(1, 3, 3), slFeast: at(1, 4, 4), slEdge: at(1, 5, 6),
    slProphets: at(1, 7, 7), slUncle: at(1, 8, 8), slMizpah: at(1, 9, 10),
    slJabesh: at(2, 0, 0), slAmmon: at(2, 0, 2), slField: at(2, 1, 1), slDawn: at(2, 2, 2), slGilgal: any(at(2, 3, 3), at(3, 0, 3)), slSam12: at(3, 0, 3),
  });
  const ZS = ZONES.shiloh.points, ZG = ZONES.gibeah.points, ZB = ZONES.gibeon.points, ZM = ZONES.moab.points, ZL = ZONES.gilgal.points;
  const V_ = (Z, id, xz, title, model, cond, dx = 0, dz = 0, ex = {}) => Z.push({ id, x: xz[0] + dx, z: xz[1] + dz, type: 'villager', title, model, persona: 'rs_static', cond, body: '', ...ex });
  const L_ = (Z, id, xz, title, cond, dx = 0, dz = 0) => Z.push({ id, x: xz[0] + dx, z: xz[1] + dz, type: 'lore', title, cond, body: '' });
  // 1장 라마
  L_(ZS, 'sl_ramah', RAMAH, '라마 — 사무엘의 집', 'slRamah', 3, -2);
  V_(ZS, 'sl_samuel8', RAMAH, '사무엘', M_.samuel, 'slRamah', 4.4, 0.6);
  V_(ZS, 'sl_elders', RAMAH, '이스라엘 장로들', M_.elders, 'slRamah', 1.2, 4);
  V_(ZS, 'sl_elders2', RAMAH, '장로들', M_.elders, 'slRamah', -1.4, 4.6);
  // 2장 기브아와 믹마스
  L_(ZG, 'sl_kish', KISH, '베냐민 사람 기스의 집', 'slKish', 3, 3);
  V_(ZG, 'sl_kishman', KISH, '기스', M_.kish, 'slKish', 4.6, 1);
  V_(ZG, 'sl_saul_home', KISH, '사울', M_.saul, 'slSaulHome', 1.4, 4.6, { scale: TALL });
  V_(ZG, 'sl_servant_home', KISH, '사환', M_.servant, 'slSaulHome', -0.4, 5.4);
  L_(ZG, 'sl_search', SEARCH, '암나귀를 찾아 — 동쪽 길', 'slSaulHome');
  V_(ZG, 'sl_girls', WELL, '물 길으러 나오는 소녀들', M_.girls, 'slGirls', 1.6, 0);
  V_(ZG, 'sl_saul_zuph', WELL, '사울', M_.saul, 'slSaulZuph', -1.6, 1.8, { scale: TALL });
  V_(ZG, 'sl_servant_zuph', WELL, '사환', M_.servant, 'slSaulZuph', -2.8, 0.4);
  V_(ZG, 'sl_samuel_zuph', ZGATE, '사무엘', M_.samuel, 'slSamZuph', 0, 2.4);
  L_(ZG, 'sl_feast', HIGH, '산당 — 객실', 'slFeast', 0, 3);
  V_(ZG, 'sl_samuel_feast', HIGH, '사무엘', M_.samuel, 'slFeast', 2, 1);
  V_(ZG, 'sl_saul_feast', HIGH, '사울', M_.saul, 'slFeast', -2, 1, { scale: TALL });
  L_(ZG, 'sl_edge', EDGE, '성읍 끝', 'slEdge', 0, 2.6);
  V_(ZG, 'sl_samuel_edge', EDGE, '사무엘', M_.samuel, 'slEdge', 1.6, 0);
  V_(ZG, 'sl_saul_edge', EDGE, '사울', M_.saul, 'slEdge', -1.6, 0, { scale: TALL });
  L_(ZG, 'sl_godhill', GODHILL, '하나님의 산 — 선지자의 무리', 'slProphets', 0, 3);
  V_(ZG, 'sl_prophet1', GODHILL, '선지자의 무리', M_.prophets, 'slProphets', 2, 0);
  V_(ZG, 'sl_prophet2', GODHILL, '선지자의 무리', M_.prophets, 'slProphets', 3.4, -1.6);
  V_(ZG, 'sl_saul_god', GODHILL, '사울', M_.saul, 'slProphets', -1.8, 0.8, { scale: TALL });
  V_(ZG, 'sl_uncle', KISH, '사울의 숙부', M_.uncle, 'slUncle', 4.6, 1);
  V_(ZG, 'sl_saul_uncle', KISH, '사울', M_.saul, 'slUncle', 1.4, 4.6, { scale: TALL });
  // 2장 끝 미스바(기브온 마을)
  V_(ZB, 'sl_samuel_miz', MIZ7, '사무엘', M_.samuel, 'slMizpah', 2, 0);
  V_(ZB, 'sl_people_miz', MIZ7, '이스라엘 자손', M_.people, 'slMizpah', -2.4, 2.6);
  L_(ZB, 'sl_bags', BAGS, '짐보따리들 사이', 'slMizpah');
  // 3장 야베스 · 기브아의 밭 · 길갈
  L_(ZM, 'sl_jabesh', JABESH, '길르앗 야베스', 'slJabesh', 3, 3);
  V_(ZM, 'sl_jelders', JABESH, '야베스 장로들', M_.elders, 'slJabesh', 1, 5);
  V_(ZM, 'sl_nahash', AMMON, '암몬 사람 나하스', M_.nahash, 'slAmmon', 0, 3);
  L_(ZM, 'sl_dawn', JABESH, '야베스 — 새벽 전', 'slDawn', 6, 6);
  V_(ZM, 'sl_saul_dawn', JABESH, '사울', M_.saul, 'slDawn', 8, 4, { scale: TALL });
  V_(ZG, 'sl_saul_field', FIELD, '밭에서 소를 몰고 오는 사울', M_.saul, 'slField', 0, -3, { scale: TALL });
  V_(ZG, 'sl_messenger', FIELD, '야베스에서 온 전령', M_.messenger, 'slField', 3, -6);
  L_(ZL, 'sl_renew', GIL7, '길갈 — 여호와 앞에서', 'slGilgal', 0, 3);
  V_(ZL, 'sl_samuel12', GIL7, '사무엘', M_.samuel, 'slSam12', 2, -1);
  V_(ZL, 'sl_saul12', GIL7, '왕 사울', M_.saul, 'slGilgal', -2.4, -1.6, { scale: TALL });
  V_(ZL, 'sl_people12', GIL7, '온 이스라엘', M_.people, 'slSam12', 0, 5);
  L_(ZL, 'sl_wheat', WHEAT, '밀 베는 밭', 'slSam12', 0, 0);
  // 기브온 마을에서 기브아로 가는 길은 엔진(index.html)이 낸다 · 모압 평지에서 요단을 건너 길갈로(6편과 같은 길)
  ZM.push({ id: 'to-gilgal', x: -36.5, z: 9, type: 'exit', title: '요단을 건너 길갈로', to: 'gilgal', spawn: [34, 2], cond: 'slOn' });

  // ── 구절 카드(개역개정 원문, gen7.py가 원문 파일에서 뽑음) ──
  Object.assign(VERSES, {
    '1sa8-7': { ref: '사무엘상 8:7', text: "여호와께서 사무엘에게 이르시되 백성이 네게 한 말을 다 들으라 이는 그들이 너를 버림이 아니요 나를 버려 자기들의 왕이 되지 못하게 함이니라" },
    '1sa9-16': { ref: '사무엘상 9:16', text: "내일 이맘 때에 내가 베냐민 땅에서 한 사람을 네게로 보내리니 너는 그에게 기름을 부어 내 백성 이스라엘의 지도자로 삼으라 그가 내 백성을 블레셋 사람들의 손에서 구원하리라 내 백성의 부르짖음이 내게 상달되었으므로 내가 그들을 돌보았노라 하셨더니" },
    '1sa10-24': { ref: '사무엘상 10:24', text: "사무엘이 모든 백성에게 이르되 너희는 여호와께서 택하신 자를 보느냐 모든 백성 중에 짝할 이가 없느니라 하니 모든 백성이 왕의 만세를 외쳐 부르니라" },
    '1sa11-13': { ref: '사무엘상 11:13', text: "사울이 이르되 이 날에는 사람을 죽이지 못하리니 여호와께서 오늘 이스라엘 중에 구원을 베푸셨음이니라" },
    '1sa12-23': { ref: '사무엘상 12:23', text: "나는 너희를 위하여 기도하기를 쉬는 죄를 여호와 앞에 결단코 범하지 아니하고 선하고 의로운 길을 너희에게 가르칠 것인즉" },
    '1sa12-24': { ref: '사무엘상 12:24', text: "너희는 여호와께서 너희를 위하여 행하신 그 큰 일을 생각하여 오직 그를 경외하며 너희의 마음을 다하여 진실히 섬기라" },
  });
  // ── 대사(개역개정 원문, gen7.py가 뽑음 — 손으로 고치지 말고 생성기를 고친다) ──
  Object.assign(DLG, {
    sl_ramah: [
      [NAR, "사무엘이 늙으매 그의 아들들을 이스라엘 사사로 삼으니 (삼상 8:1)"],
      [NAR, "장자의 이름은 요엘이요 차자의 이름은 아비야라 그들이 브엘세바에서 사사가 되니라 (삼상 8:2)"],
      [NAR, "그의 아들들이 자기 아버지의 행위를 따르지 아니하고 이익을 따라 뇌물을 받고 판결을 굽게 하니라 (삼상 8:3)"],
      [NAR, "이스라엘 모든 장로가 모여 라마에 있는 사무엘에게 나아가서 (삼상 8:4)"],
      [NAR, "▶ 사무엘에게 나아온 장로들에게 가요."],
    ],
    sl_elders: [
      [NAR, "그에게 이르되 (삼상 8:5)"],
      [ELDERS, "보소서 당신은 늙고 당신의 아들들은 당신의 행위를 따르지 아니하니 모든 나라와 같이 우리에게 왕을 세워 우리를 다스리게 하소서"],
      [NAR, "우리에게 왕을 주어 우리를 다스리게 하라 했을 때에 사무엘이 그것을 기뻐하지 아니하여 여호와께 기도하매 (삼상 8:6)"],
      [NAR, "▶ 기도하는 사무엘에게 가요."],
    ],
    sl_answer: [
      [NAR, "여호와께서 사무엘에게 이르시되 백성이 네게 한 말을 다 들으라 이는 그들이 너를 버림이 아니요 나를 버려 자기들의 왕이 되지 못하게 함이니라 (삼상 8:7)"],
      [NAR, "내가 그들을 애굽에서 인도하여 낸 날부터 오늘까지 그들이 모든 행사로 나를 버리고 다른 신들을 섬김 같이 네게도 그리하는도다 (삼상 8:8)"],
      [NAR, "그러므로 그들의 말을 듣되 너는 그들에게 엄히 경고하고 그들을 다스릴 왕의 제도를 가르치라 (삼상 8:9)"],
      [NAR, "사무엘이 왕을 요구하는 백성에게 여호와의 모든 말씀을 말하여 (삼상 8:10)"],
      [NAR, "이르되 (삼상 8:11)"],
      [SAMUEL, "너희를 다스릴 왕의 제도는 이러하니라"],
    ],
    sl_ways: [
      [NAR, "▶ \"그가 너희 … 데려다가\", \"가져다가\" — 사무엘이 말한 왕의 제도(삼상 8:11-17)에 나오는 것만 모아요."],
    ],
    sl_ways_done: [
      [SAMUEL, "너희가 그의 종이 될 것이라"],
      [SAMUEL, "그 날에 너희는 너희가 택한 왕으로 말미암아 부르짖되 그 날에 여호와께서 너희에게 응답하지 아니하시리라"],
      [NAR, "백성이 사무엘의 말 듣기를 거절하여 이르되 (삼상 8:19)"],
      [PEOPLE, "아니로소이다 우리도 우리 왕이 있어야 하리니"],
      [PEOPLE, "우리도 다른 나라들 같이 되어 우리의 왕이 우리를 다스리며 우리 앞에 나가서 우리의 싸움을 싸워야 할 것이니이다"],
      [NAR, "사무엘이 백성의 말을 다 듣고 여호와께 아뢰매 (삼상 8:21)"],
      [NAR, "여호와께서 사무엘에게 이르시되 그들의 말을 들어 왕을 세우라 하시니 사무엘이 이스라엘 사람들에게 이르되 너희는 각기 성읍으로 돌아가라 하니라 (삼상 8:22)"],
    ],
    sl_kish: [
      [NAR, "베냐민 지파에 기스라 이름하는 유력한 사람이 있으니 그는 아비엘의 아들이요 스롤의 손자요 베고랏의 증손이요 아비아의 현손이며 베냐민 사람이더라 (삼상 9:1)"],
      [NAR, "기스에게 아들이 있으니 그의 이름은 사울이요 준수한 소년이라 이스라엘 자손 중에 그보다 더 준수한 자가 없고 키는 모든 백성보다 어깨 위만큼 더 컸더라 (삼상 9:2)"],
      [NAR, "사울의 아버지 기스가 암나귀들을 잃고 그의 아들 사울에게 이르되 너는 일어나 한 사환을 데리고 가서 암나귀들을 찾으라 하매 (삼상 9:3)"],
      [NAR, "▶ 사환과 함께 암나귀들을 찾으러 가요 — 마을 동쪽 길."],
    ],
    sl_search: [
      [NAR, "▶ \"그가 에브라임 산지와 살리사 땅으로 두루 다녀 보았으나\" (삼상 9:4) — 땅마다 발자국을 따라 찾아봐요."],
    ],
    sl_search_done: [
      [NAR, "그가 에브라임 산지와 살리사 땅으로 두루 다녀 보았으나 찾지 못하고 사알림 땅으로 두루 다녀 보았으나 그 곳에는 없었고 베냐민 사람의 땅으로 두루 다녀 보았으나 찾지 못하니라 (삼상 9:4)"],
      [NAR, "그들이 숩 땅에 이른 때에 사울이 함께 가던 사환에게 이르되 (삼상 9:5)"],
      [SAUL, "돌아가자 내 아버지께서 암나귀 생각은 고사하고 우리를 위하여 걱정하실까 두려워하노라"],
      [NAR, "그가 대답하되 (삼상 9:6)"],
      [SERVANT, "보소서 이 성읍에 하나님의 사람이 있는데 존경을 받는 사람이라 그가 말한 것은 반드시 다 응하나니 그리로 가사이다 그가 혹 우리가 갈 길을 가르쳐 줄까 하나이다"],
      [NAR, "사울이 그의 사환에게 이르되 (삼상 9:7)"],
      [SAUL, "우리가 가면 그 사람에게 무엇을 드리겠느냐 우리 주머니에 먹을 것이 다하였으니 하나님의 사람에게 드릴 예물이 없도다 무엇이 있느냐"],
      [NAR, "사환이 사울에게 다시 대답하여 이르되 (삼상 9:8)"],
      [SERVANT, "보소서 내 손에 은 한 세겔의 사분의 일이 있으니 하나님의 사람에게 드려 우리 길을 가르쳐 달라 하겠나이다"],
      [NAR, "(옛적 이스라엘에 사람이 하나님께 가서 물으려 하면 말하기를 선견자에게로 가자 하였으니 지금 선지자라 하는 자를 옛적에는 선견자라 일컬었더라) (삼상 9:9)"],
      [NAR, "사울이 그의 사환에게 이르되 네 말이 옳다 가자 하고 그들이 하나님의 사람이 있는 성읍으로 가니라 (삼상 9:10)"],
      [NAR, "▶ 성읍으로 올라가는 비탈길 — 물 길으러 나오는 소녀들에게 가요."],
    ],
    sl_girls: [
      [NAR, "그들이 성읍을 향한 비탈길로 올라가다가 물 길으러 나오는 소녀들을 만나 그들에게 묻되 선견자가 여기 있느냐 하니 (삼상 9:11)"],
      [NAR, "그들이 대답하여 이르되 (삼상 9:12)"],
      [GIRLS, "있나이다 보소서 그가 당신보다 앞서 갔으니 빨리 가소서 백성이 오늘 산당에서 제사를 드리므로 그가 오늘 성읍에 들어오셨나이다"],
      [GIRLS, "당신들이 성읍으로 들어가면 그가 먹으러 산당에 올라가기 전에 곧 만나리이다 그가 오기 전에는 백성이 먹지 아니하나니 이는 그가 제물을 축사한 후에야 청함을 받은 자가 먹음이니이다 그러므로 지금 올라가소서 곧 그를 만나리이다"],
      [NAR, "▶ 성문으로 가요."],
    ],
    sl_seer: [
      [NAR, "그들이 성읍으로 올라가서 그리로 들어갈 때에 사무엘이 마침 산당으로 올라가려고 마주 나오더라 (삼상 9:14)"],
      [NAR, "사울이 오기 전날에 여호와께서 사무엘에게 알게 하여 이르시되 (삼상 9:15)"],
      [NAR, "내일 이맘 때에 내가 베냐민 땅에서 한 사람을 네게로 보내리니 너는 그에게 기름을 부어 내 백성 이스라엘의 지도자로 삼으라 그가 내 백성을 블레셋 사람들의 손에서 구원하리라 내 백성의 부르짖음이 내게 상달되었으므로 내가 그들을 돌보았노라 하셨더니 (삼상 9:16)"],
      [NAR, "사무엘이 사울을 볼 때에 여호와께서 그에게 이르시되 보라 이는 내가 네게 말한 사람이니 이가 내 백성을 다스리리라 하시니라 (삼상 9:17)"],
      [NAR, "사울이 성문 안 사무엘에게 나아가 이르되 (삼상 9:18)"],
      [SAUL, "선견자의 집이 어디인지 청하건대 내게 가르치소서"],
      [NAR, "사무엘이 사울에게 대답하여 이르되 (삼상 9:19)"],
      [SAMUEL, "내가 선견자이니라 너는 내 앞서 산당으로 올라가라 너희가 오늘 나와 함께 먹을 것이요 아침에는 내가 너를 보내되 네 마음에 있는 것을 다 네게 말하리라"],
      [SAMUEL, "사흘 전에 잃은 네 암나귀들을 염려하지 말라 찾았느니라 온 이스라엘이 사모하는 자가 누구냐 너와 네 아버지의 온 집이 아니냐"],
      [NAR, "사울이 대답하여 이르되 (삼상 9:21)"],
      [SAUL, "나는 이스라엘 지파의 가장 작은 지파 베냐민 사람이 아니니이까 또 나의 가족은 베냐민 지파 모든 가족 중에 가장 미약하지 아니하니이까 당신이 어찌하여 내게 이같이 말씀하시나이까"],
      [NAR, "▶ 산당으로 올라가요."],
    ],
    sl_feast: [
      [NAR, "사무엘이 사울과 그의 사환을 인도하여 객실로 들어가서 청한 자 중 상석에 앉게 하였는데 객은 삼십 명 가량이었더라 (삼상 9:22)"],
      [NAR, "사무엘이 요리인에게 이르되 (삼상 9:23)"],
      [SAMUEL, "내가 네게 주며 네게 두라고 말한 그 부분을 가져오라"],
      [NAR, "요리인이 넓적다리와 그것에 붙은 것을 가져다가 사울 앞에 놓는지라 사무엘이 이르되 보라 이는 두었던 것이니 네 앞에 놓고 먹으라 내가 백성을 청할 때부터 너를 위하여 이것을 두고 이 때를 기다리게 하였느니라 그 날에 사울이 사무엘과 함께 먹으니라 (삼상 9:24)"],
      [NAR, "▶ 성읍으로 내려가 성읍 끝으로 가요."],
    ],
    sl_anoint: [
      [NAR, "그들이 산당에서 내려 성읍에 들어가서는 사무엘이 사울과 함께 지붕에서 담화하고 (삼상 9:25)"],
      [NAR, "그들이 일찍이 일어날새 동틀 때쯤이라 사무엘이 지붕에서 사울을 불러 이르되 일어나라 내가 너를 보내리라 하매 사울이 일어나고 그 두 사람 사울과 사무엘이 함께 밖으로 나가서 (삼상 9:26)"],
      [NAR, "성읍 끝에 이르매 사무엘이 사울에게 이르되 사환에게 우리를 앞서게 하라 하니라 사환이 앞서가므로 또 이르되 너는 이제 잠깐 서 있으라 내가 하나님의 말씀을 네게 들려 주리라 하더라 (삼상 9:27)"],
      [NAR, "이에 사무엘이 기름병을 가져다가 사울의 머리에 붓고 입맞추며 이르되 (삼상 10:1)"],
      [SAMUEL, "여호와께서 네게 기름을 부으사 그의 기업의 지도자로 삼지 아니하셨느냐"],
      [SAMUEL, "네가 오늘 나를 떠나가다가 베냐민 경계 셀사에 있는 라헬의 묘실 곁에서 두 사람을 만나리니 그들이 네게 이르기를 네가 찾으러 갔던 암나귀들을 찾은지라 네 아버지가 암나귀들의 염려는 놓았으나 너희로 말미암아 걱정하여 이르되 내 아들을 위하여 어찌하리요 하더라 할 것이요"],
      [SAMUEL, "네가 거기서 더 나아가서 다볼 상수리나무에 이르면 거기서 하나님을 뵈오려고 벧엘로 올라가는 세 사람을 만나리니 한 사람은 염소 새끼 셋을 이끌었고 한 사람은 떡 세 덩이를 가졌고 한 사람은 포도주 한 가죽부대를 가진 자라"],
      [SAMUEL, "그들이 네게 문안하고 떡 두 덩이를 주겠고 너는 그의 손에서 받으리라"],
      [SAMUEL, "그 후에 네가 하나님의 산에 이르리니 그 곳에는 블레셋 사람들의 영문이 있느니라 네가 그리로 가서 그 성읍으로 들어갈 때에 선지자의 무리가 산당에서부터 비파와 소고와 저와 수금을 앞세우고 예언하며 내려오는 것을 만날 것이요"],
      [SAMUEL, "네게는 여호와의 영이 크게 임하리니 너도 그들과 함께 예언을 하고 변하여 새 사람이 되리라"],
      [SAMUEL, "이 징조가 네게 임하거든 너는 기회를 따라 행하라 하나님이 너와 함께 하시느니라"],
      [SAMUEL, "너는 나보다 앞서 길갈로 내려가라 내가 네게로 내려가서 번제와 화목제를 드리리니 내가 네게 가서 네가 행할 것을 가르칠 때까지 칠 일 동안 기다리라"],
    ],
    sl_signs: [
      [NAR, "▶ 사무엘이 말한 징조를 차례대로 놓아요 (삼상 10:2-5)."],
    ],
    sl_signs_done: [
      [NAR, "그가 사무엘에게서 떠나려고 몸을 돌이킬 때에 하나님이 새 마음을 주셨고 그 날 그 징조도 다 응하니라 (삼상 10:9)"],
      [NAR, "▶ 하나님의 산으로 가요 — 선지자의 무리가 내려와요."],
    ],
    sl_prophets: [
      [NAR, "그들이 산에 이를 때에 선지자의 무리가 그를 영접하고 하나님의 영이 사울에게 크게 임하므로 그가 그들 중에서 예언을 하니 (삼상 10:10)"],
      [NAR, "전에 사울을 알던 모든 사람들이 사울이 선지자들과 함께 예언함을 보고 서로 이르되 기스의 아들에게 무슨 일이 일어났느냐 사울도 선지자들 중에 있느냐 하고 (삼상 10:11)"],
      [NAR, "그 곳의 어떤 사람은 말하여 이르되 그들의 아버지가 누구냐 한지라 그러므로 속담이 되어 이르되 사울도 선지자들 중에 있느냐 하더라 (삼상 10:12)"],
      [NAR, "사울이 예언하기를 마치고 산당으로 가니라 (삼상 10:13)"],
      [NAR, "▶ 기스의 집 — 사울의 숙부에게 가요."],
    ],
    sl_uncle: [
      [NAR, "사울의 숙부가 사울과 그의 사환에게 이르되 너희가 어디로 갔더냐 사울이 이르되 암나귀들을 찾다가 찾지 못하므로 사무엘에게 갔었나이다 하니 (삼상 10:14)"],
      [NAR, "사울의 숙부가 이르되 청하노니 사무엘이 너희에게 이른 말을 내게 말하라 하니라 (삼상 10:15)"],
      [NAR, "사울이 그의 숙부에게 말하되 그가 암나귀들을 찾았다고 우리에게 분명히 말하더이다 하고 사무엘이 말하던 나라의 일은 말하지 아니하니라 (삼상 10:16)"],
      [NAR, "▶ 미스바로 가요 — 기브아 서쪽 길로 기브온 마을."],
    ],
    sl_mizpah: [
      [NAR, "사무엘이 백성을 미스바로 불러 여호와 앞에 모으고 (삼상 10:17)"],
      [NAR, "이스라엘 자손에게 이르되 이스라엘 하나님 여호와께서 이같이 말씀하시기를 내가 이스라엘을 애굽에서 인도하여 내고 너희를 애굽인의 손과 너희를 압제하는 모든 나라의 손에서 건져내었느니라 하셨거늘 (삼상 10:18)"],
      [NAR, "너희는 너희를 모든 재난과 고통 중에서 친히 구원하여 내신 너희의 하나님을 오늘 버리고 이르기를 우리 위에 왕을 세우라 하는도다 그런즉 이제 너희의 지파대로 천 명씩 여호와 앞에 나아오라 하고 (삼상 10:19)"],
      [NAR, "사무엘이 이에 이스라엘 모든 지파를 가까이 오게 하였더니 베냐민 지파가 뽑혔고 (삼상 10:20)"],
      [NAR, "베냐민 지파를 그들의 가족별로 가까이 오게 하였더니 마드리의 가족이 뽑혔고 그 중에서 기스의 아들 사울이 뽑혔으나 그를 찾아도 찾지 못한지라 (삼상 10:21)"],
      [NAR, "그러므로 그들이 또 여호와께 묻되 그 사람이 여기 왔나이까 여호와께서 대답하시되 그가 짐보따리들 사이에 숨었느니라 하셨더라 (삼상 10:22)"],
    ],
    sl_bags: [
      [NAR, "▶ \"그가 짐보따리들 사이에 숨었느니라\" (삼상 10:22) — 짐보따리 사이에서 사울을 찾아요."],
    ],
    sl_bags_done: [
      [NAR, "그들이 달려 가서 거기서 그를 데려오매 그가 백성 중에 서니 다른 사람보다 어깨 위만큼 컸더라 (삼상 10:23)"],
      [NAR, "사무엘이 모든 백성에게 이르되 너희는 여호와께서 택하신 자를 보느냐 모든 백성 중에 짝할 이가 없느니라 하니 모든 백성이 왕의 만세를 외쳐 부르니라 (삼상 10:24)"],
      [NAR, "사무엘이 나라의 제도를 백성에게 말하고 책에 기록하여 여호와 앞에 두고 모든 백성을 각기 집으로 보내매 (삼상 10:25)"],
      [NAR, "사울도 기브아 자기 집으로 갈 때에 마음이 하나님께 감동된 유력한 자들과 함께 갔느니라 (삼상 10:26)"],
      [NAR, "어떤 불량배는 이르되 이 사람이 어떻게 우리를 구원하겠느냐 하고 멸시하며 예물을 바치지 아니하였으나 그는 잠잠하였더라 (삼상 10:27)"],
    ],
    sl_jabesh: [
      [NAR, "암몬 사람 나하스가 올라와서 길르앗 야베스에 맞서 진 치매 야베스 모든 사람들이 나하스에게 이르되 우리와 언약하자 그리하면 우리가 너를 섬기리라 하니 (삼상 11:1)"],
      [NAR, "암몬 사람 나하스가 그들에게 이르되 내가 너희 오른 눈을 다 빼야 너희와 언약하리라 내가 온 이스라엘을 이같이 모욕하리라 (삼상 11:2)"],
      [NAR, "야베스 장로들이 그에게 이르되 우리에게 이레 동안 말미를 주어 우리가 이스라엘 온 지역에 전령들을 보내게 하라 만일 우리를 구원할 자가 없으면 네게 나아가리라 하니라 (삼상 11:3)"],
      [NAR, "▶ 전령들이 간 곳 — 사울이 사는 기브아로 가요."],
    ],
    sl_field: [
      [NAR, "이에 전령들이 사울이 사는 기브아에 이르러 이 말을 백성에게 전하매 모든 백성이 소리를 높여 울더니 (삼상 11:4)"],
      [NAR, "마침 사울이 밭에서 소를 몰고 오다가 이르되 백성이 무슨 일로 우느냐 하니 그들이 야베스 사람의 말을 전하니라 (삼상 11:5)"],
      [NAR, "사울이 이 말을 들을 때에 하나님의 영에게 크게 감동되매 그의 노가 크게 일어나 (삼상 11:6)"],
      [NAR, "한 겨리의 소를 잡아 각을 뜨고 전령들의 손으로 그것을 이스라엘 모든 지역에 두루 보내어 이르되 누구든지 나와서 사울과 사무엘을 따르지 아니하면 그의 소들도 이와 같이 하리라 하였더니 여호와의 두려움이 백성에게 임하매 그들이 한 사람 같이 나온지라 (삼상 11:7)"],
      [NAR, "사울이 베섹에서 그들의 수를 세어 보니 이스라엘 자손이 삼십만 명이요 유다 사람이 삼만 명이더라 (삼상 11:8)"],
      [NAR, "무리가 와 있는 전령들에게 이르되 너희는 길르앗 야베스 사람에게 이같이 이르기를 내일 해가 더울 때에 너희가 구원을 받으리라 하라 전령들이 돌아가서 야베스 사람들에게 전하매 그들이 기뻐하니라 (삼상 11:9)"],
      [NAR, "야베스 사람들이 이에 이르되 우리가 내일 너희에게 나아가리니 너희 생각에 좋을 대로 우리에게 다 행하라 하니라 (삼상 11:10)"],
      [NAR, "▶ 요단을 건너 야베스로 가요."],
    ],
    sl_dawn: [
      [NAR, "▶ \"이튿날 사울이 백성을 삼 대로 나누고 새벽에\" (삼상 11:11) — 세 무리를 자리에 두고, 해가 뜨기 전 새벽에 출발해요."],
    ],
    sl_dawn_done: [
      [NAR, "이튿날 사울이 백성을 삼 대로 나누고 새벽에 적진 한가운데로 들어가서 날이 더울 때까지 암몬 사람들을 치매 남은 자가 다 흩어져서 둘도 함께 한 자가 없었더라 (삼상 11:11)"],
      [NAR, "백성이 사무엘에게 이르되 사울이 어찌 우리를 다스리겠느냐 한 자가 누구니이까 그들을 끌어내소서 우리가 죽이겠나이다 (삼상 11:12)"],
      [NAR, "사울이 이르되 (삼상 11:13)"],
      [SAUL, "이 날에는 사람을 죽이지 못하리니 여호와께서 오늘 이스라엘 중에 구원을 베푸셨음이니라"],
      [NAR, "사무엘이 백성에게 이르되 (삼상 11:14)"],
      [SAMUEL, "오라 우리가 길갈로 가서 나라를 새롭게 하자"],
      [NAR, "▶ 길갈로 가요."],
    ],
    sl_renew: [
      [NAR, "모든 백성이 길갈로 가서 거기서 여호와 앞에서 사울을 왕으로 삼고 길갈에서 여호와 앞에 화목제를 드리고 사울과 이스라엘 모든 사람이 거기서 크게 기뻐하니라 (삼상 11:15)"],
    ],
    sl_witness: [
      [NAR, "사무엘이 온 이스라엘에게 이르되 (삼상 12:1)"],
      [SAMUEL, "보라 너희가 내게 한 말을 내가 다 듣고 너희 위에 왕을 세웠더니"],
      [SAMUEL, "이제 왕이 너희 앞에 출입하느니라 보라 나는 늙어 머리가 희어졌고 내 아들들도 너희와 함께 있느니라 내가 어려서부터 오늘까지 너희 앞에 출입하였거니와"],
      [SAMUEL, "내가 여기 있나니 여호와 앞과 그의 기름 부음을 받은 자 앞에서 내게 대하여 증언하라 내가 누구의 소를 빼앗았느냐 누구의 나귀를 빼앗았느냐 누구를 속였느냐 누구를 압제하였느냐 내 눈을 흐리게 하는 뇌물을 누구의 손에서 받았느냐 그리하였으면 내가 그것을 너희에게 갚으리라"],
      [NAR, "그들이 이르되 (삼상 12:4)"],
      [PEOPLE, "당신이 우리를 속이지 아니하였고 압제하지 아니하였고 누구의 손에서든지 아무것도 빼앗은 것이 없나이다"],
      [NAR, "사무엘이 백성에게 이르되 (삼상 12:5)"],
      [SAMUEL, "너희가 내 손에서 아무것도 찾아낸 것이 없음을 여호와께서 너희에게 대하여 증언하시며 그의 기름 부음을 받은 자도 오늘 증언하느니라"],
      [PEOPLE, "그가 증언하시나이다"],
    ],
    sl_remember: [
      [NAR, "사무엘이 백성에게 이르되 (삼상 12:6)"],
      [SAMUEL, "모세와 아론을 세우시며 너희 조상들을 애굽 땅에서 인도하여 내신 이는 여호와이시니"],
      [SAMUEL, "그런즉 가만히 서 있으라 여호와께서 너희와 너희 조상들에게 행하신 모든 공의로운 일에 대하여 내가 여호와 앞에서 너희와 담론하리라"],
      [NAR, "▶ 사무엘이 되짚은 일을 차례대로 놓아요 (삼상 12:8-11) — 1편부터 6편까지 지나온 이야기예요."],
    ],
    sl_remember_done: [
      [SAMUEL, "야곱이 애굽에 들어간 후 너희 조상들이 여호와께 부르짖으매 여호와께서 모세와 아론을 보내사 그 두 사람으로 너희 조상들을 애굽에서 인도해 내어 이 곳에 살게 하셨으나"],
      [SAMUEL, "그들이 그들의 하나님 여호와를 잊은지라 여호와께서 그들을 하솔 군사령관 시스라의 손과 블레셋 사람들의 손과 모압 왕의 손에 넘기셨더니 그들이 저희를 치매"],
      [SAMUEL, "백성이 여호와께 부르짖어 이르되 우리가 여호와를 버리고 바알들과 아스다롯을 섬김으로 범죄하였나이다 그러하오나 이제 우리를 원수들의 손에서 건져내소서 그리하시면 우리가 주를 섬기겠나이다 하매"],
      [SAMUEL, "여호와께서 여룹바알과 베단과 입다와 나 사무엘을 보내사 너희를 너희 사방 원수의 손에서 건져내사 너희에게 안전하게 살게 하셨거늘"],
      [SAMUEL, "너희가 암몬 자손의 왕 나하스가 너희를 치러 옴을 보고 너희의 하나님 여호와께서는 너희의 왕이 되심에도 불구하고 너희가 내게 이르기를 아니라 우리를 다스릴 왕이 있어야 하겠다 하였도다"],
      [SAMUEL, "이제 너희가 구한 왕, 너희가 택한 왕을 보라 여호와께서 너희 위에 왕을 세우셨느니라"],
      [SAMUEL, "너희가 만일 여호와를 경외하여 그를 섬기며 그의 목소리를 듣고 여호와의 명령을 거역하지 아니하며 또 너희와 너희를 다스리는 왕이 너희의 하나님 여호와를 따르면 좋겠지마는"],
      [SAMUEL, "너희가 만일 여호와의 목소리를 듣지 아니하고 여호와의 명령을 거역하면 여호와의 손이 너희의 조상들을 치신 것 같이 너희를 치실 것이라"],
    ],
    sl_thunder: [
      [SAMUEL, "너희는 이제 가만히 서서 여호와께서 너희 목전에서 행하시는 이 큰 일을 보라"],
      [SAMUEL, "오늘은 밀 베는 때가 아니냐 내가 여호와께 아뢰리니 여호와께서 우레와 비를 보내사 너희가 왕을 구한 일 곧 여호와의 목전에서 범한 죄악이 큼을 너희에게 밝히 알게 하시리라"],
      [NAR, "▶ 🙏 \"사무엘이 여호와께 아뢰매\" (삼상 12:18) — 누른 채 기다려요. 맑은 밀 베는 때예요."],
    ],
    sl_thunder_done: [
      [NAR, "이에 사무엘이 여호와께 아뢰매 여호와께서 그 날에 우레와 비를 보내시니 모든 백성이 여호와와 사무엘을 크게 두려워하니라 (삼상 12:18)"],
      [NAR, "모든 백성이 사무엘에게 이르되 (삼상 12:19)"],
      [PEOPLE, "당신의 종들을 위하여 당신의 하나님 여호와께 기도하여 우리가 죽지 않게 하소서 우리가 우리의 모든 죄에 왕을 구하는 악을 더하였나이다"],
    ],
    sl_pray: [
      [NAR, "사무엘이 백성에게 이르되 (삼상 12:20)"],
      [SAMUEL, "두려워하지 말라 너희가 과연 이 모든 악을 행하였으나 여호와를 따르는 데에서 돌아서지 말고 오직 너희의 마음을 다하여 여호와를 섬기라"],
      [SAMUEL, "돌아서서 유익하게도 못하며 구원하지도 못하는 헛된 것을 따르지 말라 그들은 헛되니라"],
      [SAMUEL, "여호와께서는 너희를 자기 백성으로 삼으신 것을 기뻐하셨으므로 여호와께서는 그의 크신 이름을 위해서라도 자기 백성을 버리지 아니하실 것이요"],
      [SAMUEL, "나는 너희를 위하여 기도하기를 쉬는 죄를 여호와 앞에 결단코 범하지 아니하고 선하고 의로운 길을 너희에게 가르칠 것인즉"],
      [SAMUEL, "너희는 여호와께서 너희를 위하여 행하신 그 큰 일을 생각하여 오직 그를 경외하며 너희의 마음을 다하여 진실히 섬기라"],
      [SAMUEL, "만일 너희가 여전히 악을 행하면 너희와 너희 왕이 다 멸망하리라"],
    ],
  });
  const LINE = {"9:4": "그가 에브라임 산지와 살리사 땅으로 두루 다녀 보았으나 찾지 못하고 사알림 땅으로 두루 다녀 보았으나 그 곳에는 없었고 베냐민 사람의 땅으로 두루 다녀 보았으나 찾지 못하니라", "10:2": "네가 오늘 나를 떠나가다가 베냐민 경계 셀사에 있는 라헬의 묘실 곁에서 두 사람을 만나리니 그들이 네게 이르기를 네가 찾으러 갔던 암나귀들을 찾은지라 네 아버지가 암나귀들의 염려는 놓았으나 너희로 말미암아 걱정하여 이르되 내 아들을 위하여 어찌하리요 하더라 할 것이요", "10:3": "네가 거기서 더 나아가서 다볼 상수리나무에 이르면 거기서 하나님을 뵈오려고 벧엘로 올라가는 세 사람을 만나리니 한 사람은 염소 새끼 셋을 이끌었고 한 사람은 떡 세 덩이를 가졌고 한 사람은 포도주 한 가죽부대를 가진 자라", "10:5": "그 후에 네가 하나님의 산에 이르리니 그 곳에는 블레셋 사람들의 영문이 있느니라 네가 그리로 가서 그 성읍으로 들어갈 때에 선지자의 무리가 산당에서부터 비파와 소고와 저와 수금을 앞세우고 예언하며 내려오는 것을 만날 것이요", "10:23": "그들이 달려 가서 거기서 그를 데려오매 그가 백성 중에 서니 다른 사람보다 어깨 위만큼 컸더라", "11:11": "이튿날 사울이 백성을 삼 대로 나누고 새벽에 적진 한가운데로 들어가서 날이 더울 때까지 암몬 사람들을 치매 남은 자가 다 흩어져서 둘도 함께 한 자가 없었더라", "12:18": "이에 사무엘이 여호와께 아뢰매 여호와께서 그 날에 우레와 비를 보내시니 모든 백성이 여호와와 사무엘을 크게 두려워하니라"};   // 게임 안에서 보여 주는 원문(삼상)

  DLG.sl_anoint.splice(4, 0, { event: 'anoint' });   // 10:1 기름병을 머리에 붓고
  DLG.sl_dawn_done.splice(1, 0, { event: 'dust' });  // 11:11 — 먼지만 멀리
  DLG.sl_thunder_done.splice(1, 0, { event: 'thunder' });   // 12:18 우레와 비

  const { mgOpen, mgCloseAll, completeTask } = api;
  const btnCss = 'padding:8px 6px;border-radius:10px;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.08);color:#f5e9d0;font-size:13px';
  const LIVES = 3, hearts = n => '❤️'.repeat(Math.max(0, n)) + '🤍'.repeat(Math.max(0, LIVES - n));
  const OUT = '❤️을 다 썼어요 — 처음부터 다시';
  const msgBox = m => `<div style="text-align:center;color:#ffd27a;font-weight:800;min-height:34px;padding:6px 10px 0;font-size:12.5px">${m}</div>`;
  const doneBox = m => `<div style="padding:16px;text-align:center;color:#ffd27a;font-weight:800;line-height:1.6">${m}</div>`;
  Object.assign(api.BADGES, { lost_donkey: { ico: '🫏', name: '암나귀를 찾아 두루 다닌 사람' }, baggage: { ico: '🧳', name: '짐보따리 사이를 본 사람' } });
  function giveBadge(k){ const S = api.ST; if (S.badges.includes(k)) return; S.badges.push(k); api.saveST(); setTimeout(() => api.toast(`${api.BADGES[k].ico} 배지 획득: ${api.BADGES[k].name}`, 2600), 900); }
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
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
      if (+b.dataset.od === next){ next++; msg = ''; } else if (--life <= 0){ next = 0; life = LIVES; perfect = false; shown.sort(() => Math.random() - 0.5); msg = OUT; } else { perfect = false; msg = `${hint} ${hearts(life)}`; }
      draw(); };
    api.mgAct.onclick = () => { if (next < cards.length) return; api.mgArea.onclick = null; mgCloseAll(); if (onDone) onDone(perfect); completeTask(q); };
    api.mg.onClose = () => { api.mgArea.onclick = null; };
  }
  // 👑 왕의 제도(삼상 8:11-17) — 사무엘이 말한 "데려다가·가져다가"만 모으기. 왕 편·백성 편을 고르는 판결은 없다
  function waysGame(q){
    api.runDialog(DLG.sl_ways, () => {
      const T = [['🐎 아들들 — 병거와 말을 어거', '8:11'], ['🛡 아들들 — 천부장·오십부장, 밭 갈기, 무기 만들기', '8:12'], ['🍞 딸들 — 향료·요리·떡 굽는 자', '8:13'],
        ['🍇 밭과 포도원과 감람원의 제일 좋은 것', '8:14'], ['🌾 곡식과 포도원 소산의 십일조', '8:15'], ['🫏 노비와 소년과 나귀들', '8:16'], ['🐑 양 떼의 십분의 일', '8:17']];
      const X = ['🪨 맷돌', '🛏 침상', '🧥 겉옷'];
      const tiles = shuffle([...T.map((t, i) => ({ t: t[0], ref: t[1], ok: true, i })), ...X.map(t => ({ t, ok: false }))]);
      const got = new Set(); let life = LIVES, msg = '';
      mgOpen('👑 왕의 제도', '"너희를 다스릴 왕의 제도는 이러하니라" (삼상 8:11) — 사무엘이 말한 것만 눌러 모아요. 일곱 가지!');
      const done = () => got.size >= T.length;
      const draw = () => {
        api.mgArea.innerHTML = done() ? doneBox('✓ "너희가 그의 종이 될 것이라" (삼상 8:17)')
          : `<div style="padding:4px 12px;font-size:12px;line-height:1.6;opacity:.9;min-height:24px">${[...got].sort().map(i => `${T[i][0]} <span style="opacity:.6">(${T[i][1]})</span>`).join('<br>') || '—'}</div>`
            + `<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:4px 10px">${tiles.map((x, k) => x.ok && got.has(x.i) ? '' : `<button data-wy="${k}" style="${btnCss};font-size:12.5px">${x.t}</button>`).join('')}</div>` + msgBox(msg || `${got.size} / ${T.length} · ${hearts(life)}`);
        api.mgAct.textContent = done() ? '계속' : '일곱 가지를 모으면 계속'; api.mgAct.disabled = !done(); };
      draw();
      api.mgArea.onclick = e => { const b = e.target.closest('[data-wy]'); if (!b || done()) return; const x = tiles[+b.dataset.wy];
        if (x.ok){ got.add(x.i); msg = ''; } else if (--life <= 0){ got.clear(); life = LIVES; msg = OUT; } else msg = `사무엘은 이것을 말하지 않았어요 (삼상 8:11-17) ${hearts(life)}`;
        draw(); };
      api.mgAct.onclick = () => { if (!done()) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; };
    }, null, 'sl_ways');
  }
  // 🫏 암나귀를 찾다가(삼상 9:4) — 땅마다 두루 다녀 보지만 나귀는 끝내 없다. 찾는 게임이 아니라 찾다가 부르심을 받는 이야기
  function searchGame(q){
    api.runDialog(DLG.sl_search, () => {
      const LANDS = [['⛰ 에브라임 산지와 살리사 땅', '두루 다녀 보았으나 찾지 못하고'], ['🏜 사알림 땅', '두루 다녀 보았으나 그 곳에는 없었고'], ['🌳 베냐민 사람의 땅', '두루 다녀 보았으나 찾지 못하니라']];
      const NEED = 5; let land = 0, cells = [], seen = 0, finished = false;
      const roll = () => { cells = [...Array(9)].map(() => ({ o: false, f: Math.random() < 0.35 })); seen = 0; };
      mgOpen('🫏 잃은 암나귀들', '"너는 일어나 한 사환을 데리고 가서 암나귀들을 찾으라" (삼상 9:3) — 🌿를 눌러 두루 찾아봐요.');
      const draw = () => {
        if (finished){ api.mgArea.innerHTML = doneBox(`${LANDS.map(l => `${l[0]} — ${l[1]}`).join('<br>')}<br><br>"그들이 숩 땅에 이른 때에" (삼상 9:5)`); api.mgAct.textContent = '계속'; api.mgAct.disabled = false; return; }
        const L = LANDS[land], over = seen >= NEED;
        api.mgArea.innerHTML = `<div style="text-align:center;font-size:14px;font-weight:800;padding:6px">${L[0]} <span style="opacity:.6;font-size:12px">(${land + 1} / ${LANDS.length})</span></div>`
          + `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:4px 14px">${cells.map((c, i) => `<button data-sr="${i}" style="${btnCss};font-size:22px;padding:10px 0">${!c.o ? '🌿' : c.f ? '👣' : '·'}</button>`).join('')}</div>`
          + (over ? `<div style="padding:6px 14px"><button data-sr="next" style="${btnCss};width:100%;font-size:14px">${land + 1 < LANDS.length ? '➡ 다음 땅으로' : '➡ 숩 땅으로'}</button></div>` : '')
          + msgBox(over ? `"${L[1]}" (삼상 9:4)` : `찾아본 곳 ${seen} / ${NEED}`);
        api.mgAct.textContent = '숩 땅에 이르면 계속'; api.mgAct.disabled = true; };
      roll(); draw();
      api.mgArea.onclick = e => { const b = e.target.closest('[data-sr]'); if (!b || finished) return;
        if (b.dataset.sr === 'next'){ if (seen < NEED) return; if (++land >= LANDS.length) finished = true; else roll(); draw(); return; }
        const c = cells[+b.dataset.sr]; if (c.o) return; c.o = true; seen++;
        if (c.f && seen < NEED) api.toast('👣 발자국 — 그러나 여기도 암나귀는 없어요', 1400); draw(); };
      api.mgAct.onclick = () => { if (!finished) return; api.mgArea.onclick = null; mgCloseAll(); giveBadge('lost_donkey'); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; };
    }, null, 'sl_search');
  }
  // 🫓 세 가지 징조(삼상 10:2-6) — 사무엘이 말한 차례대로
  function signsGame(q){ api.runDialog(DLG.sl_signs, () => orderPlay(q, '🫓 사무엘이 말한 징조', '"이 징조가 네게 임하거든 너는 기회를 따라 행하라" (삼상 10:7) — 사무엘이 말한 차례대로 놓아요.', [
    ['🪦 라헬의 묘실 곁 — 두 사람', '(10:2)'], ['🌳 다볼 상수리나무 — 벧엘로 올라가는 세 사람', '(10:3)'], ['🍞 그들이 주는 떡 두 덩이를 받음', '(10:4)'],
    ['⛰ 하나님의 산 — 예언하며 내려오는 선지자의 무리', '(10:5)'], ['🔥 여호와의 영이 크게 임하리니', '(10:6)'],
  ], '삼상 10:2-6을 다시 읽어 봐요', '✓ "그 날 그 징조도 다 응하니라" (10:9)'), null, 'sl_signs'); }
  // 🧳 짐보따리들 사이(삼상 10:22-23) — "다른 사람보다 어깨 위만큼 컸더라"
  function bagsGame(q){
    api.runDialog(DLG.sl_bags, () => {
      const N = 16, TOPS = ['', '', '', '🧺', '🏺', '🧣', '🪵', '']; let hide = 0, life = LIVES, msg = '', found = false, opened = new Set(), perfect = true, tops = [];
      const roll = () => { hide = Math.floor(Math.random() * N); opened.clear(); tops = [...Array(N)].map(() => TOPS[Math.floor(Math.random() * TOPS.length)]); };
      mgOpen('🧳 짐보따리들 사이', '"그가 백성 중에 서니 다른 사람보다 어깨 위만큼 컸더라" (삼상 10:23) — 짐보따리 위로 머리가 살짝 보이는 곳을 찾아요.');
      const draw = () => {
        api.mgArea.innerHTML = found ? doneBox(`✓ "${LINE['10:23']}" (삼상 10:23)`)
          : `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;padding:6px 10px">${[...Array(N)].map((_, i) => `<button data-bg="${i}" style="${btnCss};padding:4px 0;line-height:1.05"><div style="font-size:${i === hide ? 15 : 12}px;min-height:17px">${opened.has(i) ? '' : i === hide ? '🧑' : tops[i]}</div><div style="font-size:22px">${opened.has(i) ? '·' : '🧳'}</div></button>`).join('')}</div>` + msgBox(msg || hearts(life));
        api.mgAct.textContent = found ? '계속' : '사울을 찾으면 계속'; api.mgAct.disabled = !found; };
      roll(); draw();
      api.mgArea.onclick = e => { const b = e.target.closest('[data-bg]'); if (!b || found) return; const i = +b.dataset.bg;
        if (i === hide){ found = true; } else if (!opened.has(i)){ opened.add(i); perfect = false; if (--life <= 0){ life = LIVES; roll(); msg = OUT; } else msg = `짐보따리뿐이에요 ${hearts(life)}`; }
        draw(); };
      api.mgAct.onclick = () => { if (!found) return; api.mgArea.onclick = null; mgCloseAll(); if (perfect) giveBadge('baggage'); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; };
    }, null, 'sl_bags');
  }
  // 🌅 새벽 세 대(삼상 11:11) — 세 무리를 나누어 새벽에. 학생은 치지 않고, 세 무리를 내보내기만 한다
  function dawnGame(q){
    api.runDialog(DLG.sl_dawn, () => {
      const DAY = 16000, D0 = 0.45, D1 = 0.8; let t0 = performance.now(), sent = [false, false, false], life = LIVES, msg = '', timer = null, finished = false;
      mgOpen('🌅 새벽 세 대', '"사울이 백성을 삼 대로 나누고 새벽에" (삼상 11:11) — 하늘이 🌅 새벽빛일 때 세 무리를 모두 내보내요. 밤에는 아직, 해가 뜨면 늦어요.');
      const k = () => Math.min(1, (performance.now() - t0) / DAY);
      const sky = x => x < D0 ? ['🌙 아직 밤', '#1c2440'] : x < D1 ? ['🌅 새벽', '#c07a50'] : ['☀ 해가 떴어요', '#e6c27a'];
      const draw = () => { const x = k(), [lb, col] = sky(x);
        api.mgArea.innerHTML = finished ? doneBox('✓ "새벽에 적진 한가운데로 들어가서" (삼상 11:11)')
          : `<div style="margin:10px 14px 4px;height:30px;border-radius:8px;background:${col};position:relative;overflow:hidden"><div style="position:absolute;left:${D0 * 100}%;width:${(D1 - D0) * 100}%;top:0;bottom:0;border:2px dashed rgba(255,255,255,.5);border-radius:6px"></div><div style="position:absolute;left:${x * 100}%;top:3px;font-size:18px;transform:translateX(-50%)">${x < D0 ? '🌙' : '☀'}</div></div>`
            + `<div style="text-align:center;font-size:13px;font-weight:800">${lb}</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:8px 12px">${sent.map((s, i) => `<button data-dw="${i}" style="${btnCss};font-size:14px;${s ? 'opacity:.4' : ''}">${s ? '✓' : '⚔'} ${i + 1}대</button>`).join('')}</div>` + msgBox(msg || hearts(life));
        api.mgAct.textContent = finished ? '계속' : '세 무리를 내보내면 계속'; api.mgAct.disabled = !finished; };
      const lose = m => { if (--life <= 0){ life = LIVES; msg = OUT; } else msg = `${m} ${hearts(life)}`; sent = [false, false, false]; t0 = performance.now(); };
      timer = setInterval(() => { if (finished) return; if (k() >= 1) lose('해가 높이 떴어요 — 다시 밤부터'); draw(); }, 120);
      draw();
      api.mgArea.onclick = e => { const b = e.target.closest('[data-dw]'); if (!b || finished) return; const i = +b.dataset.dw, x = k();
        if (sent[i]) return;
        if (x < D0){ msg = '아직 밤이에요 — 새벽까지 기다려요'; }
        else if (x >= D1){ lose('해가 떴어요 — 다시 밤부터'); }
        else { sent[i] = true; msg = ''; if (sent.every(Boolean)){ finished = true; clearInterval(timer); timer = null; } }
        draw(); };
      api.mgAct.onclick = () => { if (!finished) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; if (timer){ clearInterval(timer); timer = null; } };
    }, null, 'sl_dawn');
  }
  // 📜 기억의 길(삼상 12:8-11) — 사무엘이 되짚은 차례. 1~6편에서 지나온 이야기
  function rememberGame(q){ api.runDialog(DLG.sl_remember, () => orderPlay(q, '📜 여호와께서 행하신 일', '"여호와께서 너희와 너희 조상들에게 행하신 모든 공의로운 일" (삼상 12:7) — 사무엘이 말한 차례대로 놓아요.', [
    ['🐪 야곱이 애굽에 들어감', '(12:8)'], ['🔥 모세와 아론을 보내심', '(12:8 · 1–3편)'], ['🏹 하솔 군사령관 시스라', '(12:9 · 5편)'], ['🏛 블레셋 사람들', '(12:9)'], ['👑 모압 왕', '(12:9 · 5편)'],
    ['🏺 여룹바알', '(12:11 · 5편)'], ['🗡 베단', '(12:11)'], ['🛡 입다', '(12:11 · 5편)'], ['🪨 나 사무엘', '(12:11 · 6편)'],
  ], '삼상 12:8-11을 다시 떠올려 봐요', '✓ "너희에게 안전하게 살게 하셨거늘" (12:11)'), null, 'sl_remember'); }
  // ⛈ 우레와 비(삼상 12:17-18) — 맑은 밀 베는 때, 누른 채 기다리기(손을 떼면 처음부터)
  function thunderGame(q){
    api.runDialog(DLG.sl_thunder, () => {
      const NEED = 4500; let t0 = 0, raf = null, done = false, msg = '';
      mgOpen('⛈ 밀 베는 때', '"오늘은 밀 베는 때가 아니냐 내가 여호와께 아뢰리니" (삼상 12:17) — 🙏를 누른 채 기다려요.');
      const draw = () => { const x = t0 ? Math.min(1, (performance.now() - t0) / NEED) : 0;
        api.mgArea.innerHTML = done ? doneBox('✓ "여호와께서 그 날에 우레와 비를 보내시니" (삼상 12:18)')
          : `<div style="text-align:center;font-size:26px;padding:6px">${x < 0.35 ? '☀️🌾' : x < 0.75 ? '🌥🌾' : '🌩🌾'}</div><div style="margin:6px 14px;height:14px;border-radius:7px;background:rgba(255,255,255,.12);overflow:hidden"><div style="height:100%;width:${Math.round(x * 100)}%;background:#9ab4e0"></div></div><div style="padding:0 14px"><button data-th="1" style="${btnCss};width:100%;font-size:22px;padding:14px;touch-action:none">🙏</button></div>` + msgBox(msg);
        api.mgAct.textContent = done ? '계속' : '기다리면 계속'; api.mgAct.disabled = !done; };
      const tick = () => { if (!t0 || done) return; if (performance.now() - t0 >= NEED){ done = true; t0 = 0; flash('#eef4ff', 0.5); draw(); return; } draw(); raf = requestAnimationFrame(tick); };
      const down = e => { if (!e.target.closest('[data-th]') || done) return; e.preventDefault(); t0 = performance.now(); msg = ''; tick(); };
      const up = () => { if (!t0 || done) return; t0 = 0; cancelAnimationFrame(raf); msg = '손을 떼었어요 — 처음부터 다시'; draw(); };
      draw(); api.mgArea.addEventListener('pointerdown', down); window.addEventListener('pointerup', up);
      const cleanup = () => { api.mgArea.removeEventListener('pointerdown', down); window.removeEventListener('pointerup', up); cancelAnimationFrame(raf); };
      api.mgAct.onclick = () => { if (!done) return; cleanup(); mgCloseAll(); completeTask(q); };
      api.mg.onClose = cleanup;
    }, null, 'sl_thunder');
  }

  // ── 연출 ──
  function flash(col, o = 0.5){ const fl = document.getElementById('flash'); if (!fl) return; fl.style.transition = 'none'; fl.style.background = col; fl.style.opacity = String(o); setTimeout(() => { fl.style.transition = 'opacity 1.2s'; fl.style.opacity = '0'; }, 120); setTimeout(() => { fl.style.background = ''; }, 1500); }
  const refresh = zid => { if (api.Z && api.Z.id === zid) world(zid); };
  function anoint(){ oilShow = true; flash('#ffe9a8', 0.45); refresh('gibeah'); }
  function dust(){ dustShow = true; refresh('moab'); }
  function thunder(){ rainShow = true; flash('#eef4ff', 0.6); setTimeout(() => flash('#eef4ff', 0.5), 700); refresh('gilgal');
    try { api.startCine('slThunder', WHEAT[0], api.heightAt(WHEAT[0], WHEAT[1]) + 5, WHEAT[1], { r: 18, h: 8, dur: 4, spin: 0.3 }); } catch (e){} }

  // ── 마을에 놓이는 것 ──
  let worldObj = null;
  const propFail = {};
  function needProps(names, zid){
    const need = names.filter(n => api.PROP_DEFS[n] && !api.propTemplates[n] && !propFail[n]); if (!need.length) return;
    api.loadProps(need).then(() => { need.forEach(n => { if (!api.propTemplates[n]) propFail[n] = true; }); refresh(zid); }).catch(() => { need.forEach(n => propFail[n] = true); });
  }
  function world(zid){
    if (worldObj && worldObj.parent) worldObj.parent.remove(worldObj); worldObj = null;
    const p = cur(); if (!p) return;
    if (api.setRiver) api.setRiver(false);
    const g = new THREE.Group(), M = c => new THREE.MeshToonMaterial({ color: c, gradientMap: api.toonGradient });
    const put = (geo, mat, x, dy, z, ry = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, api.heightAt(x, z) + dy, z); m.rotation.y = ry; m.castShadow = true; g.add(m); return m; };
    const obst = (x, z, r) => { if (!api.obstacles.some(o => o.x === x && o.z === z)) api.obstacles.push({ x, z, r }); };
    const prop = (n, x, z, ry = 0, dy = 0) => { const T = api.propTemplates[n]; if (!T) return null; const o = T.holder.clone(true); o.position.set(x, api.heightAt(x, z) + dy, z); o.rotation.y = ry; g.add(o); return o; };
    const house = (x, z, w = 4, d = 3.4, col = 0xd8c4a0) => { put(new THREE.BoxGeometry(w, 2.6, d), M(col), x, 1.3, z); put(new THREE.BoxGeometry(w + 0.4, 0.25, d + 0.4), M(0xb89a70), x, 2.7, z); obst(x, z, Math.max(w, d) / 2 + 0.4); };
    const sprites = (cx, cz, n, col, op, sx, sy, y0, spread) => { for (let i = 0; i < n; i++){ const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: api.flameTex, color: col, depthWrite: false, transparent: true, opacity: op })); s.position.set(cx + (Math.random() - 0.5) * spread, api.heightAt(cx, cz) + y0 + Math.random() * 3, cz + (Math.random() - 0.5) * spread); s.scale.set(sx, sy, 1); g.add(s); } };
    if (zid === 'shiloh' && p.ch === 0) house(RAMAH[0], RAMAH[1], 5, 4);   // 라마의 사무엘의 집(7:17)
    if (zid === 'gibeah'){
      needProps(['well', 'bull', 'tent-small', 'env-acacia', 'pillar'], 'gibeah');
      // 기브아: 서쪽 마을 — 기스의 집(9:1), 10:26 "사울도 기브아 자기 집으로"
      [[-28, -4], [-18, -8], [-30, 8], [-14, 12], [-24, 14]].forEach(([x, z]) => house(x, z, 3.6, 3, 0xdcc8a2));
      house(KISH[0], KISH[1] - 3, 4.6, 3.6, 0xd6c098);
      // 숩 땅의 성읍: 동쪽 비탈 위 — 우물(9:11), 성문(9:18), 산당(9:12, 9:25 지붕)
      [[24, -14], [30, -10], [18, -20], [28, -18], [36, -16]].forEach(([x, z]) => house(x, z, 3.4, 3, 0xd8c6a4));
      prop('well', WELL[0], WELL[1], 0.4);
      put(new THREE.BoxGeometry(1.2, 3.6, 3.4), M(0xcdb896), ZGATE[0] - 2.4, 1.8, ZGATE[1]); put(new THREE.BoxGeometry(1.2, 3.6, 3.4), M(0xcdb896), ZGATE[0] + 2.4, 1.8, ZGATE[1]); put(new THREE.BoxGeometry(6, 0.7, 3.6), M(0xcdb896), ZGATE[0], 3.9, ZGATE[1]);
      obst(ZGATE[0] - 2.4, ZGATE[1], 1.6); obst(ZGATE[0] + 2.4, ZGATE[1], 1.6);
      put(new THREE.BoxGeometry(8, 0.5, 6), M(0xc8b28c), HIGH[0], 0.25, HIGH[1]); put(new THREE.BoxGeometry(1.4, 1, 1.4), M(0xb8a888), HIGH[0], 1, HIGH[1] - 1.6);   // 산당 단과 제단
      house(HIGH[0] - 5, HIGH[1] + 2, 3.6, 3, 0xd8c6a4);   // 객실(9:22)
      // 라헬의 묘실(10:2) · 다볼 상수리나무(10:3) · 하나님의 산과 블레셋 사람들의 영문(10:5)
      { const r = put(new THREE.CylinderGeometry(0.6, 0.8, 2.2, 8), M(0xb8a888), RACHEL[0], 1.1, RACHEL[1]); obst(RACHEL[0], RACHEL[1], 1); }
      prop('env-acacia', TABOR[0], TABOR[1], 0.6);
      prop('tent-small', GODHILL[0] + 8, GODHILL[1] - 10, 1.2); prop('tent-small', GODHILL[0] + 12, GODHILL[1] - 8, 2.4);
      // 3장: 밭에서 소를 몰고 오는 사울(11:5)
      if (p.ch === 2){ prop('bull', FIELD[0] + 1.6, FIELD[1] - 1, 0.3); prop('bull', FIELD[0] - 1.4, FIELD[1] - 0.6, 0.3); }
      for (let i = 0; i < 4; i++) put(new THREE.BoxGeometry(3, 0.12, 2.4), M(0x9a8058), FIELD[0] - 5 + i * 3.4, 0.06, FIELD[1] + 3);   // 갈아 놓은 밭
      if (oilShow || (p.ch === 1 && p.step >= 6)) sprites(EDGE[0] - 1.6, EDGE[1], 3, 0xffe2a0, 0.35, 1.2, 1.2, 2.4, 1);
    }
    if (zid === 'gibeon' && p.ch === 1 && p.step >= 9){
      needProps(['tent-small', 'tent-mid', 'crates-sacks', 'pilgrim-bundle'], 'gibeon');
      [[-4, 2], [3, 4], [-1, -4], [6, -2]].forEach(([dx, dz], i) => prop(i % 2 ? 'tent-small' : 'tent-mid', MIZ7[0] + dx, MIZ7[1] + dz, i * 1.3));   // 미스바에 모임(10:17)
      [[0, 0], [1.6, 0.8], [-1.4, 1], [0.6, -1.4], [-0.8, -1.2], [2.2, -0.8]].forEach(([dx, dz], i) => prop(i % 2 ? 'pilgrim-bundle' : 'crates-sacks', BAGS[0] + dx, BAGS[1] + dz, i * 1.1));   // 짐보따리들(10:22)
    }
    if (zid === 'moab' && p.ch === 2){
      needProps(['tent-cluster', 'tent-mid'], 'moab');
      // 길르앗 야베스 성벽(11:1) — 성읍만 낮은 담으로
      for (let i = 0; i < 10; i++){ const a = i / 10 * Math.PI * 2; if (i === 2) continue; put(new THREE.BoxGeometry(3.4, 2.2, 0.8), M(0xcdb896), JABESH[0] + Math.cos(a) * 6, 1.1, JABESH[1] + Math.sin(a) * 6, -a + Math.PI / 2); }
      house(JABESH[0] - 1.6, JABESH[1] - 1.4, 3.4, 3, 0xdcc8a2); house(JABESH[0] + 2, JABESH[1] + 0.6, 3, 2.6, 0xd8c4a0);
      if (p.step <= 2 && !dustShow){ prop('tent-cluster', AMMON[0] + 4, AMMON[1] - 4, 0.8); prop('tent-mid', AMMON[0] - 3, AMMON[1] - 6, 2); }   // 암몬 사람의 진
      if (dustShow) sprites(AMMON[0], AMMON[1] - 6, 9, 0xb8a890, 0.45, 4, 3, 2, 12);   // 11:11 — 싸움은 먼지만 멀리
    }
    if (zid === 'gilgal' && (p.ch === 3 || (p.ch === 2 && p.step >= 3))){
      needProps(['grain-field', 'tent-small'], 'gilgal');
      put(new THREE.BoxGeometry(1.8, 1.1, 1.8), M(0xb8a888), GIL7[0], 0.55, GIL7[1] - 3); obst(GIL7[0], GIL7[1] - 3, 1.3);   // 화목제(11:15)
      for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) prop('grain-field', WHEAT[0] - 4 + i * 4, WHEAT[1] - 2 + j * 3.4, 0);   // 밀 베는 때(12:17)
      if (rainShow || (p.ch === 3 && p.step >= 3)){ sprites(WHEAT[0], WHEAT[1], 7, 0x7a8090, 0.5, 7, 4, 9, 14); sprites(GIL7[0], GIL7[1], 5, 0x8a90a0, 0.45, 7, 4, 9, 12); }
    }
    api.zoneRoot.add(g); worldObj = g;
  }

  const T = n => `📜 사울과 다윗 ${n}장`;
  return {
    id: 'saul',
    chapters: [
      { title: `${T(1)} — 우리에게 왕을 주어`, clearTitle: '🎉 7편 1장 「우리에게 왕을 주어」 완료!', next: '2장: 암나귀를 찾다가',
        steps: [
          { id: 's1s1', zone: 'shiloh', obj: '사무엘이 늙으매', where: '실로 서쪽 라마의 사무엘의 집(빛나는 곳)', point: 'sl_ramah', dlg: 'sl_ramah' },
          { id: 's1s2', zone: 'shiloh', obj: '"모든 나라와 같이 우리에게 왕을 세워"', where: '라마의 장로들', npc: 'sl_elders', dlg: 'sl_elders' },
          { id: 's1s3', zone: 'shiloh', obj: '여호와께서 사무엘에게 이르시되', where: '라마의 사무엘', npc: 'sl_samuel8', dlg: 'sl_answer' },
          { id: 's1s4', zone: 'shiloh', obj: '왕의 제도', where: '라마의 사무엘', npc: 'sl_samuel8', game: 'ways', doneDlg: 'sl_ways_done', reward: { verse: '1sa8-7', clear: true } },
        ] },
      { title: `${T(2)} — 암나귀를 찾다가`, clearTitle: '🎉 7편 2장 「암나귀를 찾다가」 완료!', next: '3장: 야베스 길르앗을 구함',
        steps: [
          { id: 's2s1', zone: 'gibeah', obj: '기스가 암나귀들을 잃고', where: '기브아 서쪽 기스의 집(빛나는 곳)', point: 'sl_kish', dlg: 'sl_kish' },
          { id: 's2s2', zone: 'gibeah', obj: '암나귀를 찾아 두루 다니기', where: '마을 동쪽 길(빛나는 곳)', point: 'sl_search', game: 'search', doneDlg: 'sl_search_done' },
          { id: 's2s3', zone: 'gibeah', obj: '"선견자가 여기 있느냐"', where: '비탈길 우물가의 소녀들', npc: 'sl_girls', dlg: 'sl_girls' },
          { id: 's2s4', zone: 'gibeah', obj: '"내가 선견자이니라"', where: '숩 땅의 성읍 성문 안의 사무엘', npc: 'sl_samuel_zuph', dlg: 'sl_seer' },
          { id: 's2s5', zone: 'gibeah', obj: '산당의 객실', where: '성읍 위 산당(빛나는 곳)', point: 'sl_feast', dlg: 'sl_feast' },
          { id: 's2s6', zone: 'gibeah', obj: '기름병을 가져다가', where: '성읍 끝(빛나는 곳)', point: 'sl_edge', dlg: 'sl_anoint' },
          { id: 's2s7', zone: 'gibeah', obj: '사무엘이 말한 징조', where: '성읍 끝(빛나는 곳)', point: 'sl_edge', game: 'signs', doneDlg: 'sl_signs_done' },
          { id: 's2s8', zone: 'gibeah', obj: '사울도 선지자들 중에 있느냐', where: '북쪽 하나님의 산(빛나는 곳)', point: 'sl_godhill', dlg: 'sl_prophets' },
          { id: 's2s9', zone: 'gibeah', obj: '"너희가 어디로 갔더냐"', where: '기스의 집의 사울의 숙부', npc: 'sl_uncle', dlg: 'sl_uncle' },
          { id: 's2s10', zone: 'gibeon', obj: '미스바에 모인 백성', where: '기브온 마을 미스바의 사무엘', npc: 'sl_samuel_miz', dlg: 'sl_mizpah' },
          { id: 's2s11', zone: 'gibeon', obj: '짐보따리들 사이에', where: '미스바의 짐보따리 더미(빛나는 곳)', point: 'sl_bags', game: 'bags', doneDlg: 'sl_bags_done', reward: { verse: ['1sa9-16', '1sa10-24'], clear: true } },
        ] },
      { title: `${T(3)} — 야베스 길르앗을 구함`, clearTitle: '🎉 7편 3장 「야베스 길르앗을 구함」 완료!', next: '4장: 기도하기를 쉬는 죄',
        steps: [
          { id: 's3s1', zone: 'moab', obj: '암몬 사람 나하스가 올라와서', where: '요단 동편 길르앗 야베스(빛나는 곳)', point: 'sl_jabesh', dlg: 'sl_jabesh' },
          { id: 's3s2', zone: 'gibeah', obj: '밭에서 소를 몰고 오다가', where: '기브아 남서쪽 밭의 사울', npc: 'sl_saul_field', dlg: 'sl_field' },
          { id: 's3s3', zone: 'moab', obj: '삼 대로 나누고 새벽에', where: '야베스 앞(빛나는 곳)', point: 'sl_dawn', game: 'dawn', doneDlg: 'sl_dawn_done' },
          { id: 's3s4', zone: 'gilgal', obj: '길갈에서 나라를 새롭게', where: '길갈 — 여호와 앞(빛나는 곳)', point: 'sl_renew', dlg: 'sl_renew', reward: { verse: '1sa11-13', clear: true } },
        ] },
      { title: `${T(4)} — 기도하기를 쉬는 죄`, clearTitle: '🎉 7편 1부 「사울 왕」을 마쳤어요! 2부는 준비하고 있어요', next: '5장: 이레를 기다렸으나 (준비 중)',
        steps: [
          { id: 's4s1', zone: 'gilgal', obj: '"내가 누구의 소를 빼앗았느냐"', where: '길갈의 사무엘', npc: 'sl_samuel12', dlg: 'sl_witness' },
          { id: 's4s2', zone: 'gilgal', obj: '여호와께서 행하신 공의로운 일', where: '길갈의 사무엘', npc: 'sl_samuel12', game: 'remember', doneDlg: 'sl_remember_done' },
          { id: 's4s3', zone: 'gilgal', obj: '밀 베는 때의 우레와 비', where: '서쪽 밀밭(빛나는 곳)', point: 'sl_wheat', game: 'thunder', doneDlg: 'sl_thunder_done' },
          { id: 's4s4', zone: 'gilgal', obj: '기도하기를 쉬는 죄', where: '길갈의 사무엘', npc: 'sl_samuel12', dlg: 'sl_pray', reward: { verse: ['1sa12-23', '1sa12-24'], clear: true } },
        ] },
    ],
    games: { ways: waysGame, search: searchGame, signs: signsGame, bags: bagsGame, dawn: dawnGame, remember: rememberGame, thunder: thunderGame },
    events: { anoint, dust, thunder },
    world: zid => world(zid),
  };
});
