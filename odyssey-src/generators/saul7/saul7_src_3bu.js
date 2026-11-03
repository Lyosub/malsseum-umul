// 7편 「사울과 다윗」 — 사무엘상 8–31장(2026-10-30 전도사님 결정: 삼상 8–31 전체를 한 편, 16장, 부별 배포). 이 파일은 1부 「사울 왕」(1~4장, 삼상 8–12장) · 2부 「버림받은 왕」(5~7장, 삼상 13–15장) · 3부 「소년 다윗」(8~11장, 삼상 16–20장).
// 대사·구절 카드는 E:\temp\claude-work\saul7\gen7.py가 bskorea 개역개정 원문 파일에서 그대로 뽑는다(손으로 옮기지 않음).
// 무대: 1장 실로와 세겜의 라마(6편과 같은 자리, 삼상 7:17) · 2장 새 마을 기브아와 믹마스(기스의 집·숩 땅의 성읍·하나님의 산) → 기브온 마을(미스바, 6편과 같은 자리)
//       3장 모압 평지(요단 동편 길르앗 야베스) · 기브아 · 길갈 · 4장 길갈. 11:7(겨릿소)은 해설로 읽기만, 11:11 싸움은 먼지만 멀리.
// 새 인물 원화는 GPT 14차(2026-10-30 도착) → 11/24 Meshy 충전 뒤 3D. 그 전에는 기존 모델로 대신한다(M_ 한 곳만 바꾸면 됨).
(window.__odyQ = window.__odyQ || []).push(api => {
  const { DLG, ZONES, CONDS, VERSES, THREE, SPEAKERS: { NAR } } = api;
  const SAUL = { n: '사울' }, SAMUEL = { n: '사무엘' }, ELDERS = { n: '장로들' }, SERVANT = { n: '사환' }, GIRLS = { n: '소녀들' }, PEOPLE = { n: '백성' }, JONATHAN = { n: '요나단' }, ARMOR = { n: '무기를 든 소년' },
    DAVID = { n: '다윗' }, JESSE = { n: '이새' }, ELIAB = { n: '엘리압' }, GOLIATH = { n: '골리앗' }, SERVANTS = { n: '사울의 신하들' }, YOUTH = { n: '소년 중 한 사람' }, ISRAELITES = { n: '이스라엘 사람들' }, WOMEN = { n: '여인들' }, MICHAL = { n: '미갈' };
  const cur = () => api.ST.cur === 'saul' && api.ST.sp.saul ? api.ST.sp.saul : null;
  const at = (ch, a = 0, b = 99) => () => { const p = cur(); return !!p && p.ch === ch && !p.cleared && p.step >= a && p.step <= b; };
  const any = (...fs) => () => fs.some(f => f());
  // 새 인물 3D(GPT 14차 → Meshy)가 오기 전 임시 모델 — 사무엘은 6편 9장과 같은 모델
  const M_ = { samuel: 'j5-levite-youth', saul: 'j4-spy-1', servant: 'ca-water-boy', kish: 'he-father', uncle: 'he-grandpa', girls: 'he-girl-hb', elders: 'ca-israel-elder',
    prophets: 'he-levite', people: 'he-brickmaker', nahash: 'j5-midianite', messenger: 'ca-horn-blower', jonathan: 'j4-spy-2', armor: 'he-boy-hb',
    david: 'shepherd-boy', jesse: 'he-grandpa', eliab: 'he-father', goliath: 'j5-philistine-lord', shield: 'j5-midianite', michal: 'r6-orpah', women: 'ca-singer-f', arrowBoy: 'ca-water-boy' };
  const TALL = 1.12;   // "키는 모든 백성보다 어깨 위만큼 더 컸더라"(삼상 9:2, 10:23)

  // ── 자리 ──
  const RAMAH = [-30, 22];                                                                                   // 실로와 세겜: 라마(6편과 같은 자리)
  const KISH = [-22, 4], SEARCH = [0, 12], WELL = [14, 4], ZGATE = [20, -8], HIGH = [32, -26], EDGE = [10, -16], GODHILL = [-10, -26], FIELD = [-30, 30];   // 기브아와 믹마스
  const RACHEL = [4, 28], TABOR = [-10, 36];
  const MIZ7 = [10, 20], BAGS = [4, 26];                                                                     // 기브온 마을(미스바)
  const JABESH = [-16, 34], AMMON = [0, 40];                                                                 // 모압 평지(요단 동편) — 가운데 성막 뜰을 피해 북쪽
  const GIL7 = [12, 2], WHEAT = [-20, 10];                                                                   // 길갈
  const PASS = [28, 18], BOSES = [24, 24], SENEH = [33, 13], PHIL = [40, 26], MIGRON = [8, 18], HONEY = [10, 33], SMITH = [14, 16], SAM15 = [-16, 3], NIGHT = [-26, -14];   // 2부 기브아와 믹마스 — 믹마스 어귀의 두 바위(14:4)·블레셋 부대·석류나무(14:2)·수풀(14:25)·기브아(15:34)
  const ALT13 = [12, -1], CAMP = [2, 8], GIL15 = [-6, -4];                                                   // 2부 길갈
  const JHOUSE = [6, -16], BGATE8 = [-8, -6], SHEEP = [4, 16];                                               // 3부 베들레헴 — 이새의 집 · 성문 · 남쪽 들(삼상 16:11)
  const ISRAEL = [24, 8], GOL = [-6, 6], BROOK = [6, -2], ELAHV = [14, 6], PHILC = [-26, 6];                  // 3부 블레셋 평지의 엘라 골짜기(17:1-3) — 동쪽 산에 이스라엘, 서쪽 산에 블레셋, 가운데 시내(17:40)
  const JONG = [-12, 4], DHOUSE = [-14, 12], EZEL = [-6, 22];                                                 // 3부 기브아 — 요나단의 자리 · 다윗의 집(19:11) · 에셀 바위(20:19)
  // 단계 번호
  // 0장: 0 라마 · 1 장로들 · 2 여호와의 대답 · 3 왕의 제도
  // 1장: 0 기스의 집 · 1 암나귀 찾기 · 2 소녀들 · 3 선견자 · 4 산당 · 5 기름 부음 · 6 세 징조 · 7 선지자의 무리 · 8 숙부 · 9 미스바 · 10 짐보따리
  // 2장: 0 야베스 · 1 밭에서 온 사울 · 2 새벽 세 대 · 3 길갈
  // 3장: 0 증언 · 1 기억의 길 · 2 우레와 비 · 3 기도하기를 쉬는 죄
  // 4장: 0 믹마스 소식 · 1 이레 · 2 철공이 없음
  // 5장: 0 두 바위 · 1 요나단과 소년 · 2 기어 오름 · 3 사울 · 4 수풀의 꿀 · 5 제비
  // 6장: 0 아말렉 · 1 후회하노니 · 2 길갈에서 만남 · 3 양의 소리 · 4 순종이 제사보다
  // 7장: 0 라마 · 1 베들레헴 장로들 · 2 지나가는 아들들 · 3 들의 막내 · 4 기름 부음
  // 8장: 0 양 지키기 · 1 사울의 신하들 · 2 수금
  // 9장: 0 엘라 골짜기 · 1 이새 · 2 엘리압 · 3 사울 앞 · 4 갑옷 · 5 돌 다섯 · 6 만군의 여호와의 이름 · 7 물매
  // 10장: 0 요나단 · 1 여인들의 노래 · 2 창 · 3 요나단의 말 · 4 미갈과 창 · 5 들에서 언약 · 6 초하루 식탁 · 7 화살 신호
  let dustShow = false, rainShow = false, oilShow = false, dust14 = false, oil16 = false, harpEased = false, golDown = false;
  Object.assign(CONDS, {
    slOn: () => !!cur(),
    slRamah: at(0, 0, 3),
    slKish: at(1, 0, 0), slSaulHome: at(1, 0, 1), slGirls: at(1, 2, 2), slSaulZuph: at(1, 2, 3), slSamZuph: at(1, 3, 3), slFeast: at(1, 4, 4), slEdge: at(1, 5, 6),
    slProphets: at(1, 7, 7), slUncle: at(1, 8, 8), slMizpah: at(1, 9, 10),
    slJabesh: at(2, 0, 0), slAmmon: at(2, 0, 2), slField: at(2, 1, 1), slDawn: at(2, 2, 2), slGilgal: any(at(2, 3, 3), at(3, 0, 3)), slSam12: at(3, 0, 3),
    slCamp13: at(4, 0, 1), slSmith: at(4, 2, 2), slPass: at(5, 0, 2), slJon: at(5, 1, 2), slMigron: at(5, 3, 5), slHoney: at(5, 4, 4),
    slSam15: at(6, 0, 0), slNight: at(6, 1, 1), slGil15: at(6, 2, 4), slSound: at(6, 3, 3),
    slHorn: at(7, 0, 0), slBElders: at(7, 1, 1), slSamB: at(7, 2, 4), slJesse8: at(7, 2, 3), slDavidF: at(7, 3, 3), slDavidB: at(7, 4, 4), slFlock: at(8, 0, 0), slSaul16: at(8, 1, 2), slHarp: at(8, 2, 2),
    slElahV: at(9, 0, 0), slGol: () => { const p = cur(); return !!p && p.ch === 9 && !p.cleared && p.step <= 7 && !golDown; }, slJesse17: at(9, 1, 1), slCamp17: at(9, 2, 7), slEliab: at(9, 2, 2), slSaul17: at(9, 3, 4), slStones: at(9, 5, 5), slDavidV: at(9, 6, 7),
    slJon18: at(10, 0, 0), slWomen: at(10, 1, 1), slSaul18: at(10, 2, 2), slJon19: at(10, 3, 3), slWindow: at(10, 4, 4), slJon20: at(10, 5, 5), slTable: at(10, 6, 6), slEzel: at(10, 7, 7),
  });
  const ZS = ZONES.shiloh.points, ZG = ZONES.gibeah.points, ZB = ZONES.gibeon.points, ZM = ZONES.moab.points, ZL = ZONES.gilgal.points, ZBe = ZONES.bethlehem.points, ZP = ZONES.philistia.points;
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
  // 5장 길갈 · 기브아
  L_(ZL, 'sl_mich', GIL7, '길갈 — 사울을 따라 모인 백성', 'slCamp13', -4, 5);
  L_(ZL, 'sl_altar13', ALT13, '번제단', 'slCamp13', 0, 2.6);
  V_(ZL, 'sl_saul13', ALT13, '왕 사울', M_.saul, 'slCamp13', -3, 1, { scale: TALL });
  V_(ZL, 'sl_people13', ALT13, '떠는 백성', M_.people, 'slCamp13', 3, 3);
  L_(ZG, 'sl_smith', SMITH, '베냐민 기브아 — 철공이 없는 땅', 'slSmith');
  // 6장 믹마스 어귀
  L_(ZG, 'sl_pass', PASS, '믹마스 어귀 — 두 바위', 'slPass', -3, 3);
  V_(ZG, 'sl_jonathan', PASS, '요나단', M_.jonathan, 'slJon', -1.6, 0.4);
  V_(ZG, 'sl_armor', PASS, '무기를 든 소년', M_.armor, 'slJon', -3.2, 1.6);
  V_(ZG, 'sl_saul14', MIGRON, '석류나무 아래의 사울', M_.saul, 'slMigron', 0, 2.2, { scale: TALL });
  L_(ZG, 'sl_honey', HONEY, '수풀 — 땅에 꿀이 있더라', 'slHoney');
  // 7장 기브아 → 길갈
  V_(ZG, 'sl_samuel15', SAM15, '사무엘', M_.samuel, 'slSam15', 1.6, 0);
  V_(ZG, 'sl_saul15', SAM15, '왕 사울', M_.saul, 'slSam15', -1.6, 0.6, { scale: TALL });
  L_(ZG, 'sl_night', NIGHT, '온 밤을 여호와께 부르짖으니라', 'slNight');
  V_(ZL, 'sl_samuel15g', GIL15, '사무엘', M_.samuel, 'slGil15', 1.6, 0);
  V_(ZL, 'sl_saul15g', GIL15, '왕 사울', M_.saul, 'slGil15', -1.6, 0.6, { scale: TALL });
  L_(ZL, 'sl_camp15', CAMP, '진영 — 들려오는 소리', 'slSound');
  // 8장 라마 → 베들레헴
  L_(ZS, 'sl_horn16', RAMAH, '라마 — 뿔에 기름을 채워', 'slHorn', 3, -2);
  V_(ZS, 'sl_samuel16', RAMAH, '사무엘', M_.samuel, 'slHorn', 4.4, 0.6);
  V_(ZBe, 'sl_elders16', BGATE8, '성읍 장로들', M_.elders, 'slBElders', 0, 6);
  V_(ZBe, 'sl_samuel_b', JHOUSE, '사무엘', M_.samuel, 'slSamB', -2, 2.4);
  V_(ZBe, 'sl_jesse', JHOUSE, '이새', M_.jesse, 'slJesse8', 2, 2.4);
  V_(ZBe, 'sl_david_f', SHEEP, '양을 지키는 막내', M_.david, 'slDavidF', 1.6, 0);
  V_(ZBe, 'sl_david_b', JHOUSE, '다윗', M_.david, 'slDavidB', 0, 4.4);
  // 9장 들 → 기브아 사울의 집
  L_(ZBe, 'sl_flock', SHEEP, '들의 양 떼', 'slFlock', -2, 2);
  V_(ZG, 'sl_saul16', KISH, '사울', M_.saul, 'slSaul16', 4.6, 1, { scale: TALL });
  V_(ZG, 'sl_david_harp', KISH, '수금을 든 다윗', M_.david, 'slHarp', 1.4, 4.6);
  // 10장 엘라 골짜기 · 베들레헴
  L_(ZP, 'sl_elah', ELAHV, '엘라 골짜기 — 양편 산 사이', 'slElahV');
  V_(ZP, 'sl_goliath', GOL, '골리앗', M_.goliath, 'slGol', 0, 0, { scale: 1.75 });
  V_(ZP, 'sl_shield', GOL, '방패 든 자', M_.shield, 'slGol', 3, 1.4);
  V_(ZBe, 'sl_jesse17', JHOUSE, '이새', M_.jesse, 'slJesse17', 2, 2.4);
  V_(ZP, 'sl_eliab', ISRAEL, '큰형 엘리압', M_.eliab, 'slEliab', -5, 1);
  V_(ZP, 'sl_people17', ISRAEL, '이스라엘 사람들', M_.people, 'slCamp17', -6, -2.4);
  V_(ZP, 'sl_saul17', ISRAEL, '왕 사울', M_.saul, 'slSaul17', -1, -3, { scale: TALL });
  L_(ZP, 'sl_brook', BROOK, '시내 — 매끄러운 돌', 'slStones', 1.6, 0);
  V_(ZP, 'sl_david_v', GOL, '다윗', M_.david, 'slDavidV', 7, 0.6);
  // 11장 기브아
  V_(ZG, 'sl_jon18', JONG, '요나단', M_.jonathan, 'slJon18', 0, 0);
  V_(ZG, 'sl_david18', JONG, '다윗', M_.david, 'slJon18', -1.6, 1.4);
  L_(ZG, 'sl_women', SEARCH, '길 — 노래하며 나오는 여인들', 'slWomen');
  V_(ZG, 'sl_women1', SEARCH, '여인들', M_.women, 'slWomen', 2.4, -1.2);
  V_(ZG, 'sl_women2', SEARCH, '여인들', M_.women, 'slWomen', 3.6, 1.2);
  V_(ZG, 'sl_saul18', KISH, '창을 든 사울', M_.saul, 'slSaul18', 4.6, 1, { scale: TALL });
  V_(ZG, 'sl_david18h', KISH, '수금을 타는 다윗', M_.david, 'slSaul18', 1.4, 4.6);
  V_(ZG, 'sl_jon19', JONG, '요나단', M_.jonathan, 'slJon19', 0, 0);
  L_(ZG, 'sl_window', DHOUSE, '다윗의 집 — 창', 'slWindow', 2.8, 2);
  V_(ZG, 'sl_michal', DHOUSE, '미갈', M_.michal, 'slWindow', 0.4, 3);
  V_(ZG, 'sl_jon20', EZEL, '요나단', M_.jonathan, 'slJon20', 1.8, 0.6);
  V_(ZG, 'sl_david20', EZEL, '다윗', M_.david, 'slJon20', -0.8, 2.2);
  L_(ZG, 'sl_table', KISH, '초하루 식탁 — 빈자리', 'slTable', 3, 3.6);
  V_(ZG, 'sl_saul20', KISH, '왕 사울', M_.saul, 'slTable', 5.4, 2, { scale: TALL });
  V_(ZG, 'sl_jon21', KISH, '요나단', M_.jonathan, 'slTable', 0.8, 4.8);
  L_(ZG, 'sl_ezel', EZEL, '에셀 바위 곁 — 숨은 곳', 'slEzel', 0, 2.6);

/*DLG*/
  DLG.sl_anoint.splice(4, 0, { event: 'anoint' });   // 10:1 기름병을 머리에 붓고
  DLG.sl_dawn_done.splice(1, 0, { event: 'dust' });  // 11:11 — 먼지만 멀리
  DLG.sl_thunder_done.splice(1, 0, { event: 'thunder' });   // 12:18 우레와 비
  const afterRef = (d, ref) => { const i = d.findIndex(l => Array.isArray(l) && l[1].endsWith(`(삼상 ${ref})`)); if (i < 0) throw new Error(ref); return i + 1; };
  DLG.sl_climb_done.splice(afterRef(DLG.sl_climb_done, '14:15'), 0, { event: 'dust14' });   // 14:15-16 — 싸움은 먼지만 멀리
  DLG.sl_obey_done.splice(afterRef(DLG.sl_obey_done, '15:27'), 0, { event: 'tear' });       // 15:27 겉옷자락이 찢어진지라
  DLG.sl_anoint16.splice(afterRef(DLG.sl_anoint16, '16:13'), 0, { event: 'anoint16' }, { event: 'gemDavid' });   // 16:13 기름 뿔병 · 족보 조각 다윗(마 1:6)
  DLG.sl_harp_done.push({ event: 'ease' });                                                // 16:23 악령이 떠나더라
  DLG.sl_sling_done.splice(afterRef(DLG.sl_sling_done, '17:49'), 0, { event: 'fall' });    // 17:49 — 쓰러짐은 멀리서

  const { mgOpen, mgCloseAll, completeTask } = api;
  const btnCss = 'padding:8px 6px;border-radius:10px;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.08);color:#f5e9d0;font-size:13px';
  const LIVES = 3, hearts = n => '❤️'.repeat(Math.max(0, n)) + '🤍'.repeat(Math.max(0, LIVES - n));
  const OUT = '❤️을 다 썼어요 — 처음부터 다시';
  const msgBox = m => `<div style="text-align:center;color:#ffd27a;font-weight:800;min-height:34px;padding:6px 10px 0;font-size:12.5px">${m}</div>`;
  const doneBox = m => `<div style="padding:16px;text-align:center;color:#ffd27a;font-weight:800;line-height:1.6">${m}</div>`;
  Object.assign(api.BADGES, { lost_donkey: { ico: '🫏', name: '암나귀를 찾아 두루 다닌 사람' }, baggage: { ico: '🧳', name: '짐보따리 사이를 본 사람' }, seven_days: { ico: '⏳', name: '이레를 지켜본 사람' }, climbed_two: { ico: '🧗', name: '바위를 기어오른 둘' }, harp_song: { ico: '🎵', name: '수금 소리' }, five_stones: { ico: '🪨', name: '돌 다섯' }, arrow_beyond: { ico: '🏹', name: '화살 너머' } });
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

  // ⏳ 이레(삼상 13:8-9) — 날이 갈수록 백성이 흩어진다. 번제 버튼은 언제든 누를 수 있고, 어느 쪽이든 본문은 13:9대로 이어진다(실패 처리 없음)
  function waitGame(q){
    api.runDialog(DLG.sl_wait, () => {
      const DAY = 15000, DAYS = 7, FROM = 3000, TO = 600; let t0 = performance.now(), timer = null, end = '';   // 3000(13:2) → 육백 명 가량(13:15)
      mgOpen('⏳ 길갈에서 이레', '"사울은 사무엘이 정한 기한대로 이레 동안을 기다렸으나" (삼상 13:8)');
      const k = () => Math.min(1, (performance.now() - t0) / (DAY * DAYS));
      const draw = () => { const x = k(), day = Math.min(DAYS, Math.floor(x * DAYS) + 1), n = Math.round((FROM - (FROM - TO) * x) / 10) * 10;
        api.mgArea.innerHTML = end ? doneBox(end)
          : `<div style="text-align:center;font-size:15px;font-weight:800;padding:6px">${day}일째 / 이레</div><div style="margin:4px 14px;height:14px;border-radius:7px;background:rgba(255,255,255,.12);overflow:hidden"><div style="height:100%;width:${Math.round(x * 100)}%;background:#d9b36a"></div></div>`
            + `<div style="text-align:center;font-size:13px;padding:6px">사울과 함께 있는 백성 — 약 ${n.toLocaleString()}명</div><div style="text-align:center;font-size:18px;letter-spacing:1px;min-height:28px">${'🧍'.repeat(Math.max(1, Math.round(10 * n / FROM)))}</div>`
            + `<div style="padding:8px 14px"><button data-wt="1" style="${btnCss};width:100%;font-size:14px">🔥 "번제와 화목제물을 이리로 가져오라" (13:9)</button></div>`;
        api.mgAct.textContent = end ? '계속' : '이레를 지켜보는 중…'; api.mgAct.disabled = !end; };
      const stop = () => { if (timer){ clearInterval(timer); timer = null; } };
      timer = setInterval(() => { if (end) return; if (k() >= 1){ stop(); giveBadge('seven_days'); end = '✓ 이레를 다 지켜보았어요<br>이제 본문을 읽어요 (삼상 13:8-14)'; } draw(); }, 400);
      draw();
      api.mgArea.onclick = e => { if (end || !e.target.closest('[data-wt]')) return; stop(); end = `"${LINE['13:9']}" (삼상 13:9)`; draw(); };
      api.mgAct.onclick = () => { if (!end) return; stop(); api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
      api.mg.onClose = () => { stop(); api.mgArea.onclick = null; };
    }, null, 'sl_wait');
  }
  // 🧗 손 발로 기어 올라갔고(삼상 14:13) — 요나단이 바위를 오르면 소년이 따라와야 다음 바위가 열린다. 치는 장면은 게임에 없다
  function climbGame(q){
    api.runDialog(DLG.sl_climb, () => {
      const H = 6, COLS = 3; let holds = [], jon = 0, boy = 0, life = LIVES, msg = '', perfect = true;
      const roll = () => { holds = [...Array(H)].map(() => Math.floor(Math.random() * COLS)); jon = 0; boy = 0; };
      const done = () => jon >= H && boy >= H;
      mgOpen('🧗 믹마스 어귀의 바위', '"요나단이 손 발로 기어 올라갔고 그 무기를 든 자도 따랐더라" (삼상 14:13) — ✨ 바위를 누르고, 👦 소년이 따라오게 해요.');
      const draw = () => {
        if (done()){ api.mgArea.innerHTML = doneBox('✓ "요나단이 손 발로 기어 올라갔고 그 무기를 든 자도 따랐더라" (삼상 14:13)'); api.mgAct.textContent = '계속'; api.mgAct.disabled = false; return; }
        const rows = []; for (let r = H - 1; r >= 0; r--){ rows.push(`<div style="display:grid;grid-template-columns:repeat(${COLS},1fr);gap:3px">${[...Array(COLS)].map((_, c) => { const isHold = holds[r] === c, next = isHold && r === jon && boy === jon;
          const who = (isHold && jon === r + 1 ? '🧗' : '') + (isHold && boy === r + 1 ? '👦' : '');
          return `<button ${next ? `data-cb="${r}"` : 'data-cx="1"'} style="${btnCss};padding:1px 0;font-size:13px;min-height:23px;line-height:1.1;${next ? 'background:rgba(255,210,122,.35);border-color:#ffd27a' : isHold ? '' : 'opacity:.25'}">${who || (next ? '✨' : isHold ? '🪨' : '')}</button>`; }).join('')}</div>`); }
        api.mgArea.innerHTML = `<div style="display:grid;gap:3px;padding:2px 14px">${rows.join('')}</div><div style="padding:4px 14px"><button data-cf="1" style="${btnCss};width:100%;font-size:13px;padding:5px 6px;${boy < jon ? 'background:rgba(154,180,224,.3);border-color:#9ab4e0' : 'opacity:.5'}">👦 소년이 따라오기</button></div>` + msgBox(msg || `${jon} / ${H} · ${hearts(life)}`);
        api.mgAct.textContent = '둘 다 오르면 계속'; api.mgAct.disabled = true; };
      roll(); draw();
      const miss = m => { perfect = false; if (--life <= 0){ life = LIVES; roll(); msg = OUT; } else msg = `${m} ${hearts(life)}`; };
      api.mgArea.onclick = e => { if (done()) return;
        if (e.target.closest('[data-cf]')){ if (boy < jon){ boy++; msg = ''; } else miss('먼저 요나단이 바위를 올라요'); draw(); return; }
        if (e.target.closest('[data-cb]')){ jon++; msg = ''; draw(); return; }
        if (e.target.closest('[data-cx]') && boy < jon){ miss('"그 무기를 든 자도 따랐더라" — 소년이 아직 아래에 있어요'); draw(); } };
      api.mgAct.onclick = () => { if (!done()) return; api.mgArea.onclick = null; mgCloseAll(); if (perfect) giveBadge('climbed_two'); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; };
    }, null, 'sl_climb');
  }
  // 🔊 양의 소리와 소의 소리(삼상 15:14) — 칸을 누르면 소리가 얼마나 가까운지 보여 준다. 두 곳을 모두 찾으면 계속
  function soundGame(q){
    api.runDialog(DLG.sl_sound, () => {
      const R = 4, C = 4, N = R * C; const pos = shuffle([...Array(N).keys()]).slice(0, 2), names = ['🐑', '🐂']; const opened = new Map(), got = new Set(); let msg = '';
      const dist = (a, b) => Math.abs((a % C) - (b % C)) + Math.abs(Math.floor(a / C) - Math.floor(b / C));
      const near = i => Math.min(...pos.filter((p, k) => !got.has(k)).map(p => dist(i, p)));
      const bar = d => d <= 1 ? '🔊🔊🔊' : d === 2 ? '🔊🔊' : '🔉';
      const done = () => got.size >= 2;
      mgOpen('🔊 내 귀에 들려오는 소리', '"이 양의 소리와 내게 들리는 소의 소리는 어찌 됨이니이까" (삼상 15:14) — 진영을 눌러 🔊가 많은 쪽으로 찾아가요.');
      const draw = () => {
        api.mgArea.innerHTML = done() ? doneBox(`✓ "${LINE['15:14']}" (삼상 15:14)`)
          : `<div style="display:grid;grid-template-columns:repeat(${C},1fr);gap:5px;padding:6px 12px">${[...Array(N).keys()].map(i => { const k = pos.indexOf(i); const v = k >= 0 && got.has(k) ? names[k] : opened.has(i) ? opened.get(i) : '⛺'; return `<button data-sd="${i}" style="${btnCss};font-size:${opened.has(i) ? 12 : 18}px;min-height:38px;padding:4px 0">${v}</button>`; }).join('')}</div>` + msgBox(msg || `찾은 소리 ${got.size} / 2`);
        api.mgAct.textContent = done() ? '계속' : '두 소리를 찾으면 계속'; api.mgAct.disabled = !done(); };
      draw();
      api.mgArea.onclick = e => { const b = e.target.closest('[data-sd]'); if (!b || done()) return; const i = +b.dataset.sd, k = pos.indexOf(i);
        if (k >= 0 && !got.has(k)){ got.add(k); opened.delete(i); msg = k === 0 ? '🐑 양의 소리예요!' : '🐂 소의 소리예요!'; if (!done()) opened.forEach((_, j) => opened.set(j, bar(near(j)))); }
        else if (k < 0){ opened.set(i, bar(near(i))); msg = ''; }
        draw(); };
      api.mgAct.onclick = () => { if (!done()) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; };
    }, null, 'sl_sound');
  }
  // 📖 삼상 15:22 — 사무엘의 대답을 차례대로
  function obeyGame(q){ api.runDialog(DLG.sl_obey, () => orderPlay(q, '📖 사무엘의 대답', '"사무엘이 이르되" (삼상 15:22) — 차례대로 놓아요.', OBEY.map(t => [t, '']), '삼상 15:22를 다시 떠올려 봐요', '✓ 삼상 15:22'), null, 'sl_obey'); }

  // 🧒 지나가는 아들들(삼상 16:6-11) — 무엇을 눌러도 대답은 원문대로. 일곱이 다 지나간 뒤 막내를 묻는다
  function sonsGame(q){
    api.runDialog(DLG.sl_sons, () => {
      const SONS = ['엘리압', '아비나답', '삼마', '이새의 아들', '이새의 아들', '이새의 아들', '이새의 아들']; let i = 0, msg = '';
      const reply = k => k === 0 ? LINE['16:7a'] : k <= 2 ? LINE['16:8a'] : LINE['16:10a'];
      mgOpen('🧒 사무엘 앞을 지나가는 아들들', `"${LINE['16:10a']}" (삼상 16:10)`);
      const draw = () => { const end = i >= SONS.length;
        api.mgArea.innerHTML = (end ? doneBox(`"${LINE['16:10b']}" (삼상 16:10)<br><br>"${LINE['16:11a']}" (삼상 16:11)<br>"${LINE['16:11b']}"`)
          : `<div style="text-align:center;padding:4px"><div style="font-size:${i === 0 ? 46 : 32}px;line-height:1.15">🧑</div><div style="font-weight:800;font-size:15px">${SONS[i]} <span style="opacity:.6;font-size:12px">(${i + 1} / 일곱)</span></div></div>`
            + `<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:4px 12px"><button data-sn="1" style="${btnCss}">🫒 이 사람일까요?</button><button data-sn="0" style="${btnCss}">➡ 지나가게 하기</button></div>` + msgBox(msg));
        api.mgAct.textContent = end ? '계속' : '일곱이 다 지나가면 계속'; api.mgAct.disabled = !end; };
      draw();
      api.mgArea.onclick = e => { const b = e.target.closest('[data-sn]'); if (!b || i >= SONS.length) return; msg = `"${reply(i)}"`; i++; draw(); };
      api.mgAct.onclick = () => { if (i < SONS.length) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; };
    }, null, 'sl_sons');
  }
  // 🐑 양 지키기(삼상 17:34-35) — 사자나 곰이 새끼를 물어가는 곳을 눌러 따라간다. 치는 연출은 없고 "건져내었고"까지
  function flockGame(q){
    api.runDialog(DLG.sl_flock, () => {
      const N = 12, NEED = 5, WIN = 1800, GAP = 700; let got = 0, life = LIVES, cell = -1, who = '', until = 0, nextAt = performance.now() + 900, msg = '', timer = null, finished = false;
      mgOpen('🐑 아버지의 양을 지킬 때', `"${LINE['17:34a']}" (삼상 17:34) — 나타난 곳을 빨리 눌러요.`);
      const draw = () => {
        api.mgArea.innerHTML = finished ? doneBox(`✓ "${LINE['17:35a']}" (삼상 17:35)`)
          : `<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:4px;padding:6px 10px">${[...Array(N)].map((_, i) => `<button data-fk="${i}" style="${btnCss};font-size:19px;padding:6px 0;min-height:38px;${i === cell ? 'background:rgba(224,120,90,.45);border-color:#ffb08a' : ''}">${i === cell ? who : '🐑'}</button>`).join('')}</div>` + msgBox(msg || `건져낸 새끼 ${got} / ${NEED} · ${hearts(life)}`);
        api.mgAct.textContent = finished ? '계속' : `새끼 ${NEED}마리를 건져내면 계속`; api.mgAct.disabled = !finished; };
      const stop = () => { if (timer){ clearInterval(timer); timer = null; } };
      timer = setInterval(() => { if (finished) return; const t = performance.now();
        if (cell >= 0 && t >= until){ cell = -1; nextAt = t + GAP; if (--life <= 0){ life = LIVES; got = 0; msg = OUT; } else msg = `놓쳤어요 ${hearts(life)}`; draw(); }
        else if (cell < 0 && t >= nextAt){ cell = Math.floor(Math.random() * N); who = Math.random() < 0.5 ? '🦁' : '🐻'; until = t + WIN; msg = ''; draw(); } }, 80);
      draw();
      const down = e => { const b = e.target.closest('[data-fk]'); if (!b || finished || +b.dataset.fk !== cell) return; e.preventDefault(); cell = -1; nextAt = performance.now() + GAP; msg = ''; if (++got >= NEED){ finished = true; stop(); } draw(); };
      api.mgArea.addEventListener('pointerdown', down);
      const cleanup = () => { stop(); api.mgArea.removeEventListener('pointerdown', down); };
      api.mgAct.onclick = () => { if (!finished) return; cleanup(); mgCloseAll(); completeTask(q); };
      api.mg.onClose = cleanup;
    }, null, 'sl_flock');
  }
  // 🎵 수금(삼상 16:23) — 음이 왼쪽 선에 닿을 때 그 줄을 누른다. 소리는 배경음악을 켜 둔 때만. 무실수면 배지
  function harpGame(q){
    api.runDialog(DLG.sl_harp, () => {
      const SCORE = [[0, 392], [1, 440], [2, 523], [1, 440], [0, 392], [2, 587], [1, 523], [0, 440], [2, 659], [1, 587], [0, 523], [1, 440], [2, 523], [0, 392], [1, 440], [0, 392]];
      const BEAT = 800, TRAVEL = 2400, WIN = 260, NEED = 12, X0 = 11; let notes = [], hits = 0, miss = 0, t0 = 0, raf = null, finished = false, retry = '';
      let ctx = null; const bgmOn = () => { try { return localStorage.getItem('inodyssey-bgm') !== 'off'; } catch (e){ return true; } };
      const pluck = f => { if (!bgmOn()) return; try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime; o.type = 'triangle'; o.frequency.value = f; g.gain.setValueAtTime(0.16, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.9); o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 0.95); } catch (e){} };
      mgOpen('🎵 다윗의 수금', `"${LINE['16:23a']}" (삼상 16:23)`);
      const setStatus = () => { const b = api.mgArea.querySelector('[data-hbar]'), m = api.mgArea.querySelector('[data-hmsg]'); if (b) b.style.width = `${Math.round((1 - hits / SCORE.length) * 100)}%`; if (m) m.textContent = retry || `맞힌 음 ${hits} / ${SCORE.length} (${NEED}음 이상)`; };
      const build = () => { notes = SCORE.map(([l, f], i) => ({ l, f, t: 0, i, st: 0, el: null }));
        api.mgArea.innerHTML = `<div style="margin:2px 14px 4px;height:9px;border-radius:5px;background:rgba(255,255,255,.12);overflow:hidden"><div data-hbar="1" style="height:100%;width:100%;background:#5a5470"></div></div>`
          + [0, 1, 2].map(l => `<div data-hr="${l}" style="position:relative;height:38px;margin:3px 12px;border-radius:8px;overflow:hidden;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.2);touch-action:none"><div style="position:absolute;left:${X0}%;top:0;bottom:0;width:3px;background:#ffd27a"></div><div style="position:absolute;left:0;right:0;top:50%;height:1px;background:rgba(255,255,255,.35)"></div></div>`).join('')
          + `<div data-hmsg="1" style="text-align:center;color:#ffd27a;font-weight:800;min-height:24px;padding:4px 10px 0;font-size:12.5px"></div>`;
        const rows = [...api.mgArea.querySelectorAll('[data-hr]')]; notes.forEach(n => { const d = document.createElement('div'); d.dataset.hn = n.i; d.style.cssText = 'position:absolute;top:50%;transform:translate(-50%,-50%);font-size:20px;pointer-events:none;will-change:left'; d.textContent = '🎵'; rows[n.l].appendChild(d); n.el = d; }); };
      const start = () => { hits = 0; miss = 0; build(); t0 = performance.now() + TRAVEL; notes.forEach(n => { n.t = t0 + n.i * BEAT; }); setStatus(); api.mgAct.textContent = '수금을 타는 중…'; api.mgAct.disabled = true; raf = requestAnimationFrame(tick); };
      const end = () => { cancelAnimationFrame(raf); raf = null;
        if (hits >= NEED){ finished = true; if (miss === 0) giveBadge('harp_song'); flash('#fff4d0', 0.35); api.mgArea.innerHTML = doneBox(`✓ "${LINE['16:23b']}" (삼상 16:23)`); api.mgAct.textContent = '계속'; api.mgAct.disabled = false; }
        else { retry = `${hits}음 맞혔어요 — ${NEED}음 이상이면 돼요. 다시!`; start(); setTimeout(() => { retry = ''; setStatus(); }, 2200); } };
      const tick = () => { const now = performance.now(); let live = false;
        for (const n of notes){ if (n.st) continue; const dt = n.t - now; if (dt < -WIN){ n.st = 2; miss++; n.el.style.display = 'none'; setStatus(); continue; } live = true; n.el.dataset.dt = Math.round(dt); const x = X0 + dt / TRAVEL * 88; n.el.style.left = `${x}%`; n.el.style.opacity = x > 100 ? 0 : 1; }
        if (!live){ end(); return; } raf = requestAnimationFrame(tick); };
      const down = e => { const r = e.target.closest('[data-hr]'); if (!r || finished) return; e.preventDefault(); const now = performance.now(), l = +r.dataset.hr; const n = notes.find(x => !x.st && x.l === l && Math.abs(x.t - now) <= WIN); if (!n) return; n.st = 1; hits++; n.el.textContent = '✨'; pluck(n.f); setTimeout(() => { if (n.el) n.el.style.display = 'none'; }, 180); setStatus(); };
      api.mgArea.addEventListener('pointerdown', down); start();
      const cleanup = () => { if (raf) cancelAnimationFrame(raf); raf = null; api.mgArea.removeEventListener('pointerdown', down); if (ctx){ try { ctx.close(); } catch (e){} ctx = null; } };
      api.mgAct.onclick = () => { if (!finished) return; cleanup(); mgCloseAll(); completeTask(q); };
      api.mg.onClose = cleanup;
    }, null, 'sl_harp');
  }
  // 🛡 사울의 갑옷(삼상 17:38-39) — 입고 걸어 보면 익숙하지 못하다. 벗어야 나아간다
  function armorGame(q){
    api.runDialog(DLG.sl_armor17, () => {
      const ITEMS = [['🧥', '군복'], ['🪖', '놋 투구'], ['🛡', '갑옷'], ['🗡', '칼']]; let worn = new Set(), walks = 0, stage = 0, off = new Set();   // 0 입기 · 1 걸어 보기 · 2 벗기 · 3 끝
      mgOpen('🛡 사울의 군복과 놋 투구', `"${LINE['17:38a']}" (삼상 17:38)`);
      const draw = () => {
        if (stage === 3){ api.mgArea.innerHTML = doneBox(`✓ "${LINE['17:39a']}" (삼상 17:39)`); api.mgAct.textContent = '계속'; api.mgAct.disabled = false; return; }
        const items = `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;padding:4px 12px">${ITEMS.map((t, i) => { const on = stage === 0 ? !worn.has(i) : stage === 2 && !off.has(i); return `<button ${on ? `data-ar="${i}"` : ''} style="${btnCss};${on ? 'background:rgba(255,210,122,.25);border-color:#ffd27a' : 'opacity:.5'}"><span style="font-size:20px">${t[0]}</span><br>${t[1]}</button>`; }).join('')}</div>`;
        const walk = stage === 1 ? `<div style="margin:6px 14px;height:12px;border-radius:6px;background:rgba(255,255,255,.12);overflow:hidden"><div style="height:100%;width:${walks * 4}%;background:#c0a060"></div></div><div style="padding:2px 14px"><button data-aw="1" style="${btnCss};width:100%;font-size:14px">🚶 ${LINE['17:39b']}</button></div>` : '';
        const tip = stage === 0 ? '하나씩 입어요' : stage === 1 ? (walks ? '너무 무거워요 — 걸음이 나가지 않아요' : '입은 채로 걸어 봐요') : `"${LINE['17:39a']}" — 하나씩 벗어요`;
        api.mgArea.innerHTML = items + walk + msgBox(tip); api.mgAct.textContent = '갑옷을 벗으면 계속'; api.mgAct.disabled = true; };
      draw();
      api.mgArea.onclick = e => { const b = e.target.closest('[data-ar]'), w = e.target.closest('[data-aw]');
        if (b && stage === 0){ worn.add(+b.dataset.ar); if (worn.size >= ITEMS.length) stage = 1; }
        else if (w && stage === 1){ if (++walks >= 3) stage = 2; }
        else if (b && stage === 2){ off.add(+b.dataset.ar); if (off.size >= ITEMS.length) stage = 3; }
        else return; draw(); };
      api.mgAct.onclick = () => { if (stage !== 3) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; };
    }, null, 'sl_armor17');
  }
  // 🪨 매끄러운 돌 다섯(삼상 17:40) — 무실수면 배지
  function stonesGame(q){
    api.runDialog(DLG.sl_stones, () => {
      const N = 15, GOOD = 7, NEED = 5; let cells = [], got = 0, life = LIVES, msg = '', perfect = true;
      const roll = () => { cells = shuffle([...Array(N).keys()].map(i => ({ smooth: i < GOOD, off: false }))); got = 0; };
      const smoothCss = 'display:inline-block;width:27px;height:17px;border-radius:50%;background:linear-gradient(160deg,#ece6d6,#a9a08c);vertical-align:middle';
      mgOpen('🪨 시내의 돌', `"${LINE['17:40a']}" (삼상 17:40) — 둥글고 매끄러운 돌만 눌러요.`);
      const draw = () => {
        api.mgArea.innerHTML = got >= NEED ? doneBox(`✓ "${LINE['17:40a']}" (삼상 17:40)`)
          : `<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:5px;padding:5px 12px;background:rgba(90,150,200,.14);border-radius:10px;margin:2px 8px">${cells.map((c, i) => c.off ? '<div style="min-height:34px"></div>' : `<button data-st="${i}" data-sm="${c.smooth ? 1 : 0}" style="${btnCss};padding:3px 0;min-height:34px;font-size:19px">${c.smooth ? `<span style="${smoothCss}"></span>` : '🪨'}</button>`).join('')}</div>` + msgBox(msg || `주머니에 ${got} / ${NEED} · ${hearts(life)}`);
        api.mgAct.textContent = got >= NEED ? '계속' : '돌 다섯을 고르면 계속'; api.mgAct.disabled = got < NEED; };
      roll(); draw();
      api.mgArea.onclick = e => { const b = e.target.closest('[data-st]'); if (!b || got >= NEED) return; const c = cells[+b.dataset.st];
        if (c.smooth){ c.off = true; got++; msg = ''; } else { perfect = false; if (--life <= 0){ life = LIVES; roll(); msg = OUT; } else msg = `모난 돌이에요 ${hearts(life)}`; }
        draw(); };
      api.mgAct.onclick = () => { if (got < NEED) return; api.mgArea.onclick = null; mgCloseAll(); if (perfect) giveBadge('five_stones'); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; };
    }, null, 'sl_stones');
  }
  // 🎯 물매(삼상 17:49) — 조준점이 표적 안에서 멈출 때 놓는다. 학생은 조준까지만, 쓰러짐은 대사 뒤 멀리서. 놓치는 일 없이 "아직"만 있다(본문에 돌은 한 번)
  function slingGame(q){
    api.runDialog(DLG.sl_sling, () => {
      const CYCLE = 3600, HOLD = 450, ZONE = 0.17; let t0 = performance.now(), raf = null, msg = '', finished = false, dot = null;
      const pos = () => { const k = (performance.now() - t0) % CYCLE, run = (CYCLE - 2 * HOLD) / 4;   // 가운데(0)에서 잠깐 멈췄다가 오른쪽 끝 → 가운데(멈춤) → 왼쪽 끝 → 가운데
        if (k < HOLD) return 0; if (k < HOLD + run) return (k - HOLD) / run; if (k < HOLD + 2 * run) return 1 - (k - HOLD - run) / run;
        if (k < 2 * HOLD + 2 * run) return 0; if (k < 2 * HOLD + 3 * run) return -(k - 2 * HOLD - 2 * run) / run; return -1 + (k - 2 * HOLD - 3 * run) / run; };
      mgOpen('🎯 물매', `"${LINE['17:49a']}" (삼상 17:49)`);
      const draw = () => {
        api.mgArea.innerHTML = finished ? doneBox(`✓ "${LINE['17:47a']}" (삼상 17:47)`)
          : `<div style="position:relative;height:58px;margin:10px 18px 6px;border-radius:10px;background:rgba(255,255,255,.08);overflow:hidden"><div style="position:absolute;left:${50 - ZONE * 50}%;width:${ZONE * 100}%;top:0;bottom:0;background:rgba(255,210,122,.3);border-left:2px dashed #ffd27a;border-right:2px dashed #ffd27a"></div><div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:22px;opacity:.75">🪖</div><div data-sdot="1" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:24px">⊕</div></div>`
            + `<div style="padding:4px 14px"><button data-sl="1" style="${btnCss};width:100%;font-size:17px;padding:12px;touch-action:none">🪨 놓기</button></div>` + msgBox(msg);
        api.mgAct.textContent = finished ? '계속' : '조준점이 표적 안에 오면 놓아요'; api.mgAct.disabled = !finished; dot = api.mgArea.querySelector('[data-sdot]'); };
      const tick = () => { if (finished) return; const p = pos(); if (dot){ dot.style.left = `${50 + p * 46}%`; dot.dataset.p = p.toFixed(3); } raf = requestAnimationFrame(tick); };
      draw(); raf = requestAnimationFrame(tick);
      const down = e => { if (!e.target.closest('[data-sl]') || finished) return; e.preventDefault(); if (Math.abs(pos()) * 46 <= ZONE * 50){ finished = true; cancelAnimationFrame(raf); draw(); } else { msg = '아직이에요 — 표적 안에 올 때까지 돌려요'; const m = api.mgArea.lastElementChild; if (m) m.textContent = msg; } };
      api.mgArea.addEventListener('pointerdown', down);
      const cleanup = () => { cancelAnimationFrame(raf); api.mgArea.removeEventListener('pointerdown', down); };
      api.mgAct.onclick = () => { if (!finished) return; cleanup(); mgCloseAll(); completeTask(q); };
      api.mg.onClose = cleanup;
    }, null, 'sl_sling');
  }
  // 🔱 사울의 창(삼상 18:10-11) — 창이 겨눈 자리에서 비킨다. 두 번 피하면 끝. 맞는 연출 없이 "다시"
  function spearGame(q){
    api.runDialog(DLG.sl_spear, () => {
      const AIM = 1700, REST = 900; let lane = 1, aim = 1, dodged = 0, life = LIVES, msg = '', throwAt = performance.now() + 1400 + AIM, phase = 'aim', stuck = -1, timer = null, finished = false;
      mgOpen('🔱 사울의 손에 창이', `"${LINE['18:11a']}" (삼상 18:11) — 🔱가 겨누는 자리에서 ⬅ ➡로 비켜요.`);
      const draw = () => {
        if (finished){ api.mgArea.innerHTML = doneBox(`✓ "${LINE['18:11a']}" (삼상 18:11)`); api.mgAct.textContent = '계속'; api.mgAct.disabled = false; return; }
        api.mgArea.innerHTML = `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px;padding:6px 14px;text-align:center"><div style="grid-column:1/4;font-size:13px;opacity:.8">사울</div>${[0, 1, 2].map(i => `<div style="font-size:21px;min-height:29px;${phase === 'aim' && i === aim ? 'background:rgba(224,120,90,.35);border-radius:8px' : ''}">${phase === 'aim' && i === aim ? '🔱' : i === stuck ? '<span style="opacity:.55">🔱</span>' : ''}</div>`).join('')}${[0, 1, 2].map(i => `<div style="font-size:25px;min-height:34px;background:rgba(255,255,255,.06);border-radius:8px">${i === lane ? '🧑' : ''}</div>`).join('')}</div>`
          + `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:2px 14px"><button data-sp="-1" style="${btnCss};font-size:20px;padding:7px;touch-action:none;${lane === 0 ? 'opacity:.4' : ''}">⬅</button><button data-sp="1" style="${btnCss};font-size:20px;padding:7px;touch-action:none;${lane === 2 ? 'opacity:.4' : ''}">➡</button></div>` + msgBox(msg || `피한 횟수 ${dodged} / 두 번 · ${hearts(life)}`);
        api.mgAct.textContent = '두 번 피하면 계속'; api.mgAct.disabled = true; };
      const stop = () => { if (timer){ clearInterval(timer); timer = null; } };
      timer = setInterval(() => { if (finished) return; const t = performance.now(); if (t < throwAt) return;
        if (phase === 'aim'){ stuck = aim; if (lane === aim){ if (--life <= 0){ life = LIVES; dodged = 0; msg = OUT; } else msg = `비켜야 해요 ${hearts(life)}`; } else { dodged++; msg = dodged >= 2 ? '' : '창이 벽에 박혔어요'; }
          if (dodged >= 2){ finished = true; stop(); draw(); return; } phase = 'rest'; throwAt = t + REST; draw(); }
        else { phase = 'aim'; aim = lane; stuck = -1; msg = ''; throwAt = t + AIM; draw(); } }, 60);
      draw();
      const down = e => { const b = e.target.closest('[data-sp]'); if (!b || finished) return; e.preventDefault(); lane = Math.max(0, Math.min(2, lane + +b.dataset.sp)); draw(); };
      api.mgArea.addEventListener('pointerdown', down);
      const cleanup = () => { stop(); api.mgArea.removeEventListener('pointerdown', down); };
      api.mgAct.onclick = () => { if (!finished) return; cleanup(); mgCloseAll(); completeTask(q); };
      api.mg.onClose = cleanup;
    }, null, 'sl_spear');
  }
  // 🏹 화살 신호(삼상 20:21-22 · 20:36-41) — 화살이 어디 있는지 보고 신호대로, 아이가 갈 때까지 숨어 있다가 일어난다. 무실수면 배지
  function arrowGame(q){
    api.runDialog(DLG.sl_arrow, () => {
      const HIDE = 5000; let stage = 0, msg = '', perfect = true, hideT = 0, timer = null;   // 0 쏘기 · 1 신호 뜻 · 2 숨어 있기 · 3 끝
      mgOpen('🏹 에셀 바위 곁', `정한 신호 — "${LINE['20:21a']}" (20:21) · "${LINE['20:22a']}" (20:22)`);
      const scene = (a, boy) => `<div style="position:relative;height:44px;margin:6px 14px;border-radius:9px;background:rgba(255,255,255,.07);font-size:22px;line-height:44px"><span style="position:absolute;left:4%">🏹</span><span style="position:absolute;left:${boy}%">👦</span>${a !== null ? `<span style="position:absolute;left:${a}%;top:-7px">➶</span>` : ''}<span style="position:absolute;right:3%">🪨</span></div>`;
      const draw = () => {
        if (stage === 3){ api.mgArea.innerHTML = doneBox(`✓ "${LINE['20:41a']}" (삼상 20:41)`); api.mgAct.textContent = '계속'; api.mgAct.disabled = false; return; }
        if (stage === 0) api.mgArea.innerHTML = scene(null, 26) + `<div style="padding:4px 14px"><button data-aw2="1" style="${btnCss};width:100%;font-size:14px;padding:10px">🏹 요나단이 화살을 쏘아요</button></div>` + msgBox('바위 곁에 숨어서 지켜봐요');
        if (stage === 1) api.mgArea.innerHTML = scene(70, 42) + `<div style="text-align:center;font-size:13px;line-height:1.5;padding:0 12px">"${LINE['20:36a']}" (20:36)<br><b>"${LINE['20:37a']}"</b> (20:37)</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:6px 12px"><button data-ch="0" style="${btnCss}">🏠 돌아온다</button><button data-ch="1" style="${btnCss}">🏃 내 길을 간다</button></div>` + msgBox(msg);
        if (stage === 2){ const k = Math.min(1, (performance.now() - hideT) / HIDE); api.mgArea.innerHTML = scene(null, k < 0.5 ? 70 - k * 100 : 20 - (k - 0.5) * 40) + `<div style="margin:0 14px;height:10px;border-radius:5px;background:rgba(255,255,255,.12);overflow:hidden"><div style="height:100%;width:${Math.round(k * 100)}%;background:#9ab4e0"></div></div><div style="padding:6px 14px"><button data-up="1" style="${btnCss};width:100%;font-size:14px;padding:9px">🧍 바위 남쪽에서 일어나기</button></div>` + msgBox(msg || '아이가 성읍으로 갈 때까지 숨어 있어요'); }
        api.mgAct.textContent = '신호대로 움직이면 계속'; api.mgAct.disabled = true; };
      const stop = () => { if (timer){ clearInterval(timer); timer = null; } };
      draw();
      api.mgArea.onclick = e => {
        if (stage === 0 && e.target.closest('[data-aw2]')){ stage = 1; msg = ''; draw(); return; }
        const c = e.target.closest('[data-ch]');
        if (stage === 1 && c){ if (c.dataset.ch === '1'){ stage = 2; msg = ''; hideT = performance.now(); timer = setInterval(draw, 200); } else { perfect = false; msg = `"${LINE['20:22a']}" (20:22)`; } draw(); return; }
        if (stage === 2 && e.target.closest('[data-up]')){ if (performance.now() - hideT >= HIDE){ stop(); stage = 3; } else { perfect = false; msg = `아직 아이가 있어요 — "${LINE['20:39a']}" (20:39)`; } draw(); } };
      api.mgAct.onclick = () => { if (stage !== 3) return; stop(); api.mgArea.onclick = null; mgCloseAll(); if (perfect) giveBadge('arrow_beyond'); completeTask(q); };
      api.mg.onClose = () => { stop(); api.mgArea.onclick = null; };
    }, null, 'sl_arrow');
  }

  // ── 연출 ──
  function flash(col, o = 0.5){ const fl = document.getElementById('flash'); if (!fl) return; fl.style.transition = 'none'; fl.style.background = col; fl.style.opacity = String(o); setTimeout(() => { fl.style.transition = 'opacity 1.2s'; fl.style.opacity = '0'; }, 120); setTimeout(() => { fl.style.background = ''; }, 1500); }
  const refresh = zid => { if (api.Z && api.Z.id === zid) world(zid); };
  function anoint(){ oilShow = true; flash('#ffe9a8', 0.45); refresh('gibeah'); }
  function dust(){ dustShow = true; refresh('moab'); }
  function dustFar(){ dust14 = true; refresh('gibeah'); }
  function tear(){ flash('#d8c4a0', 0.4); }
  function anoint16(){ oil16 = true; flash('#ffe9a8', 0.45); refresh('bethlehem'); }
  function gemDavid(){ if (api.addGeneal) api.addGeneal(['다윗']); }
  function ease(){ harpEased = true; flash('#fff4d0', 0.3); refresh('gibeah'); }
  function fall(){ golDown = true;
    try { const m = api.markers.find(x => x.data.id === 'sl_goliath'); if (m){ m.mesh.visible = false; m.hidden = true; if (m.col) m.col.r = 0; } const s = api.markers.find(x => x.data.id === 'sl_shield'); if (s){ s.mesh.visible = false; s.hidden = true; if (s.col) s.col.r = 0; } } catch (e){}
    refresh('philistia');
    try { api.startCine('slFall', GOL[0], api.heightAt(GOL[0], GOL[1]) + 3, GOL[1], { r: 30, h: 14, dur: 3.5, spin: 0.25 }); } catch (e){} }
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
    if (zid === 'shiloh' && (p.ch === 0 || p.ch === 7)) house(RAMAH[0], RAMAH[1], 5, 4);   // 라마의 사무엘의 집(7:17)
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
      if (p.ch === 5){
        needProps(['env-rock-hill', 'env-acacia', 'tent-small', 'honeycomb'], 'gibeah');
        prop('env-rock-hill', BOSES[0], BOSES[1], 0.4); prop('env-rock-hill', SENEH[0], SENEH[1], 2.1); obst(BOSES[0], BOSES[1], 3); obst(SENEH[0], SENEH[1], 3);   // 보세스와 세네(14:4)
        if (!dust14 && p.step <= 2){ prop('tent-small', PHIL[0], PHIL[1], 1); prop('tent-small', PHIL[0] - 4, PHIL[1] + 3, 2.2); }   // 블레셋 사람들의 부대(14:1)
        if (dust14 || p.step >= 3) sprites(PHIL[0], PHIL[1], 8, 0xb8a890, 0.42, 4, 3, 2, 10);   // 14:15-16 — 먼지만 멀리
        prop('env-acacia', MIGRON[0] - 2.4, MIGRON[1] - 1.6, 0.8);   // 미그론의 석류나무(14:2)
        if (p.step === 4){ if (api.propTemplates.honeycomb) prop('honeycomb', HONEY[0], HONEY[1], 0.5); else put(new THREE.BoxGeometry(0.7, 0.3, 0.5), M(0xe0a93a), HONEY[0], 0.15, HONEY[1]); }   // 땅에 꿀이 있더라(14:25)
      }
    }
    if (zid === 'gibeah' && p.ch === 8 && !harpEased) sprites(KISH[0] + 4.6, KISH[1] + 1, 5, 0x3a3648, 0.4, 1.6, 1.6, 1.4, 2.4);   // 16:14 사울을 번뇌하게 한지라 — 수금 뒤 옅어짐(16:23)
    if (zid === 'gibeah' && p.ch === 10){
      if (p.step === 6){ put(new THREE.BoxGeometry(4.2, 0.8, 1.8), M(0xa8865c), KISH[0] + 3, 0.4, KISH[1] + 2); obst(KISH[0] + 3, KISH[1] + 2, 1.6); }   // 초하루 식탁(20:24-25)
      put(new THREE.DodecahedronGeometry(1.7), M(0xa89a80), EZEL[0], 1.2, EZEL[1]); obst(EZEL[0], EZEL[1], 1.6);   // 에셀 바위(20:19)
    }
    if (zid === 'bethlehem' && (p.ch === 7 || p.ch === 8 || p.ch === 9)){
      needProps(['lamb', 'env-acacia'], 'bethlehem');
      [[-14, -24], [-6, -30], [4, -30], [10, -22], [-10, -24], [16, -28], [-2, -20]].forEach(([x, z]) => house(x, z, 3.6, 3, 0xdcc8a2));   // 성읍(6편과 같은 자리)
      put(new THREE.BoxGeometry(1.4, 4, 4), M(0xcdb896), BGATE8[0] - 2.6, 2, BGATE8[1]); put(new THREE.BoxGeometry(1.4, 4, 4), M(0xcdb896), BGATE8[0] + 2.6, 2, BGATE8[1]); put(new THREE.BoxGeometry(6.6, 0.8, 4.2), M(0xcdb896), BGATE8[0], 4.2, BGATE8[1]);
      obst(BGATE8[0] - 2.6, BGATE8[1], 1.8); obst(BGATE8[0] + 2.6, BGATE8[1], 1.8);
      prop('env-acacia', BGATE8[0] - 8, BGATE8[1] + 4, 0.4);
      [[-5, -2], [-3, 3], [0, 4], [3, 2.6], [6, -1], [-1, -4], [4, -4.4]].forEach(([dx, dz], i) => prop('lamb', SHEEP[0] + dx, SHEEP[1] + dz, i * 0.9));   // 양을 지키나이다(16:11)
      if (oil16 || (p.ch === 7 && p.step >= 5)) sprites(JHOUSE[0], JHOUSE[1] + 4.4, 3, 0xffe2a0, 0.35, 1.2, 1.2, 2.2, 1);
    }
    if (zid === 'philistia' && p.ch === 9){
      needProps(['tent-small', 'tent-mid', 'env-rock-hill'], 'philistia');
      prop('env-rock-hill', 38, 22, 0.4); prop('env-rock-hill', -36, 22, 1.6); prop('env-rock-hill', -36, -10, 2.4); obst(38, 22, 4); obst(-36, 22, 4); obst(-36, -10, 4);   // 양편 산(17:3)
      [[32, 14], [24, 16], [32, 6], [28, -2]].forEach(([x, z], i) => prop(i % 2 ? 'tent-small' : 'tent-mid', x, z, i * 1.1));   // 이스라엘 진영(17:2)
      [[PHILC[0], PHILC[1]], [PHILC[0] - 4, PHILC[1] + 5], [PHILC[0] + 1, PHILC[1] - 6]].forEach(([x, z], i) => prop(i % 2 ? 'tent-small' : 'tent-mid', x, z, 1 + i));   // 블레셋 진영(17:1)
      { const w = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 44).rotateX(-Math.PI / 2), M(0x6fa8d0)); w.position.set(BROOK[0], api.heightAt(BROOK[0], BROOK[1]) + 0.05, BROOK[1] + 4); g.add(w); }   // 시내(17:40)
      if (golDown) sprites(GOL[0], GOL[1], 7, 0xb8a890, 0.42, 3.4, 2.6, 1.6, 8);   // 17:49 뒤 — 먼지만 멀리
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
    if (zid === 'gilgal' && (p.ch === 4 || p.ch === 6)){
      needProps(['tent-small', 'tent-mid', 'lamb', 'bull'], 'gilgal');
      [[-6, 10], [6, 12], [-14, 2], [18, 10]].forEach(([x, z], i) => prop(i % 2 ? 'tent-small' : 'tent-mid', x, z, i * 1.2));   // 길갈로 모인 백성(13:4)
      put(new THREE.BoxGeometry(1.8, 1.1, 1.8), M(0xb8a888), ALT13[0], 0.55, ALT13[1]); obst(ALT13[0], ALT13[1], 1.3);   // 번제단(13:9)
      if (p.ch === 6){ prop('lamb', CAMP[0] - 2, CAMP[1] + 1, 0.4); prop('lamb', CAMP[0] - 3, CAMP[1] - 1, 1.6); prop('bull', CAMP[0] + 2.4, CAMP[1], 0.8); }   // 끌어 온 양과 소(15:15)
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
      { title: `${T(4)} — 기도하기를 쉬는 죄`, clearTitle: '🎉 7편 1부 「사울 왕」을 마쳤어요!', next: '5장: 이레를 기다렸으나',
        steps: [
          { id: 's4s1', zone: 'gilgal', obj: '"내가 누구의 소를 빼앗았느냐"', where: '길갈의 사무엘', npc: 'sl_samuel12', dlg: 'sl_witness' },
          { id: 's4s2', zone: 'gilgal', obj: '여호와께서 행하신 공의로운 일', where: '길갈의 사무엘', npc: 'sl_samuel12', game: 'remember', doneDlg: 'sl_remember_done' },
          { id: 's4s3', zone: 'gilgal', obj: '밀 베는 때의 우레와 비', where: '서쪽 밀밭(빛나는 곳)', point: 'sl_wheat', game: 'thunder', doneDlg: 'sl_thunder_done' },
          { id: 's4s4', zone: 'gilgal', obj: '기도하기를 쉬는 죄', where: '길갈의 사무엘', npc: 'sl_samuel12', dlg: 'sl_pray', reward: { verse: ['1sa12-23', '1sa12-24'], clear: true } },
        ] },
      { title: `${T(5)} — 이레를 기다렸으나`, clearTitle: '🎉 7편 5장 「이레를 기다렸으나」 완료!', next: '6장: 요나단과 무기 든 소년',
        steps: [
          { id: 's5s1', zone: 'gilgal', obj: '믹마스에 모인 블레셋 사람들', where: '길갈 진영(빛나는 곳)', point: 'sl_mich', dlg: 'sl_mich' },
          { id: 's5s2', zone: 'gilgal', obj: '이레 동안을 기다렸으나', where: '길갈의 번제단(빛나는 곳)', point: 'sl_altar13', game: 'wait', doneDlg: 'sl_wait_done' },
          { id: 's5s3', zone: 'gibeah', obj: '이스라엘 온 땅에 철공이 없었으니', where: '기브아 동쪽 길(빛나는 곳)', point: 'sl_smith', dlg: 'sl_smith', reward: { verse: '1sa13-14', clear: true } },
        ] },
      { title: `${T(6)} — 요나단과 무기 든 소년`, clearTitle: '🎉 7편 6장 「요나단과 무기 든 소년」 완료!', next: '7장: 순종이 제사보다 낫고',
        steps: [
          { id: 's6s1', zone: 'gibeah', obj: '보세스와 세네', where: '동남쪽 믹마스 어귀(빛나는 곳)', point: 'sl_pass', dlg: 'sl_pass' },
          { id: 's6s2', zone: 'gibeah', obj: '"사람이 많고 적음에 달리지 아니하였느니라"', where: '두 바위 곁의 요나단', npc: 'sl_jonathan', dlg: 'sl_jon' },
          { id: 's6s3', zone: 'gibeah', obj: '손 발로 기어 올라갔고', where: '두 바위 곁의 요나단', npc: 'sl_jonathan', game: 'climb', doneDlg: 'sl_climb_done' },
          { id: 's6s4', zone: 'gibeah', obj: '누가 나갔는지 점호하여 보라', where: '석류나무 아래의 사울', npc: 'sl_saul14', dlg: 'sl_saul14' },
          { id: 's6s5', zone: 'gibeah', obj: '땅에 꿀이 있더라', where: '남쪽 수풀(빛나는 곳)', point: 'sl_honey', dlg: 'sl_honey' },
          { id: 's6s6', zone: 'gibeah', obj: '백성이 요나단을 구원하여', where: '석류나무 아래의 사울', npc: 'sl_saul14', dlg: 'sl_lots', reward: { verse: '1sa14-6', clear: true } },
        ] },
      { title: `${T(7)} — 순종이 제사보다 낫고`, clearTitle: '🎉 7편 2부 「버림받은 왕」을 마쳤어요!', next: '8장: 사람은 외모를 보거니와',
        steps: [
          { id: 's7s1', zone: 'gibeah', obj: '"이제 왕은 여호와의 말씀을 들으소서"', where: '기브아 기스의 집 곁의 사무엘', npc: 'sl_samuel15', dlg: 'sl_amalek' },
          { id: 's7s2', zone: 'gibeah', obj: '내가 사울을 왕으로 세운 것을 후회하노니', where: '기브아 북쪽(빛나는 곳)', point: 'sl_night', dlg: 'sl_regret' },
          { id: 's7s3', zone: 'gilgal', obj: '"내가 여호와의 명령을 행하였나이다"', where: '길갈의 사울', npc: 'sl_saul15g', dlg: 'sl_meet' },
          { id: 's7s4', zone: 'gilgal', obj: '이 양의 소리와 소의 소리', where: '길갈 진영(빛나는 곳)', point: 'sl_camp15', game: 'sound', doneDlg: 'sl_sound_done' },
          { id: 's7s5', zone: 'gilgal', obj: '순종이 제사보다 낫고', where: '길갈의 사무엘', npc: 'sl_samuel15g', game: 'obey', doneDlg: 'sl_obey_done', reward: { verse: '1sa15-22', clear: true } },
        ] },
      { title: `${T(8)} — 사람은 외모를 보거니와`, clearTitle: '🎉 7편 8장 「사람은 외모를 보거니와」 완료!', next: '9장: 수금 타는 다윗',
        steps: [
          { id: 's8s1', zone: 'shiloh', obj: '뿔에 기름을 채워 가지고 가라', where: '실로 서쪽 라마의 사무엘의 집(빛나는 곳)', point: 'sl_horn16', dlg: 'sl_horn16' },
          { id: 's8s2', zone: 'bethlehem', obj: '"평강을 위하여 오시나이까"', where: '베들레헴 성문 앞의 장로들', npc: 'sl_elders16', dlg: 'sl_elders16' },
          { id: 's8s3', zone: 'bethlehem', obj: '사무엘 앞을 지나가는 아들들', where: '이새의 집 앞의 이새', npc: 'sl_jesse', game: 'sons', doneDlg: 'sl_sons_done' },
          { id: 's8s4', zone: 'bethlehem', obj: '아직 막내가 남았는데', where: '성읍 남쪽 들의 양을 지키는 막내', npc: 'sl_david_f', dlg: 'sl_bring' },
          { id: 's8s5', zone: 'bethlehem', obj: '이가 그니 일어나 기름을 부으라', where: '이새의 집 앞의 사무엘', npc: 'sl_samuel_b', dlg: 'sl_anoint16', reward: { verse: '1sa16-7', clear: true } },
        ] },
      { title: `${T(9)} — 수금 타는 다윗`, clearTitle: '🎉 7편 9장 「수금 타는 다윗」 완료!', next: '10장: 전쟁은 여호와께 속한 것',
        steps: [
          { id: 's9s1', zone: 'bethlehem', obj: '사자나 곰이 와서', where: '성읍 남쪽 들의 양 떼(빛나는 곳)', point: 'sl_flock', game: 'flock', doneDlg: 'sl_flock_done' },
          { id: 's9s2', zone: 'gibeah', obj: '수금을 잘 타는 사람을 구하게 하소서', where: '기브아 기스의 집 곁의 사울', npc: 'sl_saul16', dlg: 'sl_spirit' },
          { id: 's9s3', zone: 'gibeah', obj: '다윗이 수금을 들고 와서', where: '사울의 집 앞의 다윗', npc: 'sl_david_harp', game: 'harp', doneDlg: 'sl_harp_done', reward: { verse: '1sa16-23', clear: true } },
        ] },
      { title: `${T(10)} — 전쟁은 여호와께 속한 것`, clearTitle: '🎉 7편 10장 「전쟁은 여호와께 속한 것」 완료!', next: '11장: 요나단과의 언약',
        steps: [
          { id: 's10s1', zone: 'philistia', obj: '그 사이에는 골짜기가 있었더라', where: '블레셋 평지 엘라 골짜기(빛나는 곳)', point: 'sl_elah', dlg: 'sl_elah' },
          { id: 's10s2', zone: 'bethlehem', obj: '네 형들의 안부를 살피고', where: '베들레헴 이새의 집 앞의 이새', npc: 'sl_jesse17', dlg: 'sl_jesse17' },
          { id: 's10s3', zone: 'philistia', obj: '"네가 어찌하여 이리로 내려왔느냐"', where: '이스라엘 진영의 큰형 엘리압', npc: 'sl_eliab', dlg: 'sl_eliab' },
          { id: 's10s4', zone: 'philistia', obj: '사자의 발톱과 곰의 발톱에서', where: '이스라엘 진영의 왕 사울', npc: 'sl_saul17', dlg: 'sl_saul17' },
          { id: 's10s5', zone: 'philistia', obj: '익숙하지 못하니', where: '이스라엘 진영의 왕 사울', npc: 'sl_saul17', game: 'armor', doneDlg: 'sl_armor_done' },
          { id: 's10s6', zone: 'philistia', obj: '매끄러운 돌 다섯', where: '골짜기의 시내(빛나는 곳)', point: 'sl_brook', game: 'stones', doneDlg: 'sl_stones_done' },
          { id: 's10s7', zone: 'philistia', obj: '"만군의 여호와의 이름으로"', where: '골짜기의 다윗', npc: 'sl_david_v', dlg: 'sl_name' },
          { id: 's10s8', zone: 'philistia', obj: '물매로 던져', where: '골짜기의 다윗', npc: 'sl_david_v', game: 'sling', doneDlg: 'sl_sling_done', reward: { verse: ['1sa17-45', '1sa17-47'], clear: true } },
        ] },
      { title: `${T(11)} — 요나단과의 언약`, clearTitle: '🎉 7편 3부 「소년 다윗」을 마쳤어요! 4부는 준비하고 있어요', next: '12장: 놉의 떡과 아둘람 굴 (준비 중)',
        steps: [
          { id: 's11s1', zone: 'gibeah', obj: '요나단의 마음이 다윗의 마음과 하나가 되어', where: '기브아 마을의 요나단', npc: 'sl_jon18', dlg: 'sl_jon18' },
          { id: 's11s2', zone: 'gibeah', obj: '사울이 죽인 자는 천천이요', where: '마을 동쪽 길(빛나는 곳)', point: 'sl_women', dlg: 'sl_women' },
          { id: 's11s3', zone: 'gibeah', obj: '다윗이 두 번 피하였더라', where: '기스의 집 곁의 사울', npc: 'sl_saul18', game: 'spear', doneDlg: 'sl_spear_done' },
          { id: 's11s4', zone: 'gibeah', obj: '"왕은 신하 다윗에게 범죄하지 마옵소서"', where: '기브아 마을의 요나단', npc: 'sl_jon19', dlg: 'sl_jon19' },
          { id: 's11s5', zone: 'gibeah', obj: '미갈이 다윗을 창에서 달아 내리매', where: '다윗의 집(빛나는 곳)', point: 'sl_window', dlg: 'sl_window' },
          { id: 's11s6', zone: 'gibeah', obj: '"나와 죽음의 사이는 한 걸음 뿐이니라"', where: '남쪽 들 에셀 바위 곁의 요나단', npc: 'sl_jon20', dlg: 'sl_field20' },
          { id: 's11s7', zone: 'gibeah', obj: '다윗의 자리는 비었더라', where: '사울의 집 초하루 식탁(빛나는 곳)', point: 'sl_table', dlg: 'sl_table' },
          { id: 's11s8', zone: 'gibeah', obj: '화살이 네 앞쪽에 있지 아니하냐', where: '남쪽 들 에셀 바위 곁(빛나는 곳)', point: 'sl_ezel', game: 'arrow', doneDlg: 'sl_arrow_done', reward: { verse: ['1sa18-3', '1sa20-42'], clear: true } },
        ] },
    ],
    games: { ways: waysGame, search: searchGame, signs: signsGame, bags: bagsGame, dawn: dawnGame, remember: rememberGame, thunder: thunderGame, wait: waitGame, climb: climbGame, sound: soundGame, obey: obeyGame, sons: sonsGame, flock: flockGame, harp: harpGame, armor: armorGame, stones: stonesGame, sling: slingGame, spear: spearGame, arrow: arrowGame },
    events: { anoint, dust, thunder, dust14: dustFar, tear, anoint16, gemDavid, ease, fall },
    world: zid => world(zid),
  };
});
