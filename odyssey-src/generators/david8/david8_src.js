// 8편 「다윗 왕」 — 사무엘하 1–24장 · 역대상 22·28–29장(2026-11-24 전도사님 결정: 13장 4부, 다 만든 뒤 한 번에 배포).
// 대사·구절 카드는 E:\temp\claude-work\david8\gen8.py가 개역개정 원문 파일(2sa.json)에서 그대로 뽑는다(손으로 옮기지 않음).
// 무대: 1장 블레셋 평지 시글락 · 2장 헤브론 산지·기브온 못 · 3장 헤브론 → 예루살렘(새 마을)·르바임 골짜기 · 4장 기브온 마을 기럇여아림(6편 궤를 둔 곳) → 예루살렘
(window.__odyQ = window.__odyQ || []).push(api => {
  const { DLG, ZONES, CONDS, VERSES, THREE, SPEAKERS: { NAR } } = api;
  const DAVID = { n: '다윗' }, YOUTH = { n: '소식을 전한 청년' }, TRIBES = { n: '이스라엘 모든 지파' }, MESSENGER = { n: '어떤 사람' }, MICHAL = { n: '미갈' }, NATHAN = { n: '나단' },
    ZIBA = { n: '시바' }, MEPHIB = { n: '므비보셋' }, ITTAI = { n: '잇대' }, SHIMEI = { n: '시므이' }, ABISHAI = { n: '아비새' }, CUSHITE = { n: '구스 사람' }, BARZILLAI = { n: '바르실래' },
    JOAB = { n: '요압' }, GAD = { n: '갓' }, ARAUNAH = { n: '아라우나' };
/*DLG*/
  const cur = () => api.ST.cur === 'david' && api.ST.sp.david ? api.ST.sp.david : null;
  const at = (ch, a = 0, b = 99) => () => { const p = cur(); return !!p && p.ch === ch && !p.cleared && p.step >= a && p.step <= b; };
  const any = (...fs) => () => fs.some(f => f());
  // 인물 모델 — GPT 15차 원화 → Meshy 3D(11/25). 다윗은 1장 청년(7편 모델) → 2장부터 왕 → 3부(9장)부터 늙은 왕
  const M_ = { davidY: 's7-david-young', david: 'd8-david-king', davidOld: 'd8-david-old', youth: 'he-boy-hb', joab: 'd8-joab', abner: 'd8-abner', abishai: 's7-abishai',
    elders: 'ca-israel-elder', people: 'he-brickmaker', michal: 's7-michal', nathan: 'd8-nathan', gad: 'd8-gad', mephib: 'd8-mephibosheth', ziba: 'd8-ziba', absalom: 'd8-absalom',
    hushai: 'd8-hushai', shimei: 'd8-shimei', barzillai: 'd8-barzillai', ittai: 'd8-ittai', benaiah: 'd8-benaiah', araunah: 'd8-araunah', solomon: 'd8-solomon',
    levite: 'he-levite', messenger: 'ca-horn-blower', cushite: 's7-egyptian-boy', obed: 'he-father' };
  // ── 자리 ──
  const ZIKLAG = [0, -12];                                                       // 블레셋 평지 시글락(7편 15장과 같은 자리)
  const HEB = [-4, 12], HEBGATE = [0, -4];                                       // 헤브론 산지 — 헤브론 성읍
  const POOL = [-18, 22];                                                        // 기브온 마을 — 기브온 못(삼하 2:13)
  const KIRJATH = [26, 24], NACON = [16, 30], OBED = [4, 34];                    // 기브온 마을 — 기럇여아림(6편 궤를 둔 곳) · 나곤의 타작 마당 · 오벧에돔의 집
  const SGATE = [0, 30], PALACE = [-8, 2], TENT = [8, -6], REPHAIM = [-44, -8], MULB = [-48, -8], ROAD = [-12, 36];   // 예루살렘(엔진이 세운 다윗 성)
  const EGATE = [24, 5], OLIVES = [34, 6], BAHURIM = [40, -6], LAMBH = [11, 12], NGATE = [0, -18], MORIAH = [0, -40], STORE = [-4, 16];   // 동문·감람 산·바후림 · 가난한 사람의 집 · 북문 · 모리아 · 성 안 창고 자리
  const LODEBAR = [8, 22], MAHANAIM = [-8, -12], FOREST = [16, -26];          // 모압 평지(요단 동편) — 로드발·마하나임·에브라임 수풀
  const FORD = [30, 8];                                                          // 길갈 — 요단 나루(19:15)
  const ADULLAM = [-22, -12];                                                    // 유다 광야 — 아둘람 굴(7편과 같은 자리)
  const BGATE = [-8, -6], BWELL = [-12, -1], PHILT = [6, 2];                      // 베들레헴 — 성문 곁 우물 · 블레셋 사람의 요새(23:14)
  // 단계 번호
  // 0장: 0 시글락의 소식 · 1 활 노래
  // 1장: 0 여쭈어 · 1 헤브론의 왕 · 2 기브온 못 · 3 아브넬의 애도
  // 2장: 0 온 지파가 헤브론에 · 1 시온 산성 · 2 르바임 골짜기 · 3 뽕나무 꼭대기의 걸음 소리
  // 3장: 0 새 수레 · 1 나곤의 타작 마당 · 2 오벧에돔의 집 · 3 여섯 걸음
  // 4장: 0 백향목 궁 · 1 나단이 전한 말씀 · 2 다윗의 기도
  // 5장: 0 사울의 집에 남은 사람 · 1 로드발 · 2 므비보셋 · 3 왕의 상
  // 6장: 0 그 일 · 1 나단의 비유 · 2 가난한 사람의 암양 새끼 · 3 당신이 그 사람이라 · 4 시편 51편
  // 7장: 0 마음을 훔치니 · 1 잇대 · 2 궤를 도로 · 3 감람 산 길 · 4 시므이 · 5 돌을 피해 · 6 마하나임 · 7 에브라임 수풀
  // 8장: 0 요단 나루 · 1 시므이 · 2 므비보셋 · 3 바르실래
  // 9장: 0 노래의 날 · 1 낱말 모으기
  // 10장: 0 아둘람 굴 · 1 베들레헴 우물 · 2 부어 드림 · 3 용사들
  // 11장: 0 인구 조사 · 1 천사 · 2 아라우나 · 3 은 오십 세겔
  // 12장: 0 성전 준비 · 1 재료 모으기 · 2 설계도 · 3 자원하는 예물 · 4 감사 기도
  let arkHome = false, cartAt = '';   // 4장 행렬 뒤 궤가 장막 안에 · 새 수레가 있는 곳
  Object.assign(CONDS, {
    dvOn: () => !!cur(),
    dvZiklag: at(0, 0, 1), dvAsk: at(1, 0, 0), dvHebron: at(1, 1, 1), dvPool: at(1, 2, 2), dvAbner: at(1, 3, 3),
    dvTribes: at(2, 0, 0), dvZion: at(2, 1, 1), dvRephaim: at(2, 2, 3), dvMulb: at(2, 3, 3),
    dvCart: at(3, 0, 0), dvNacon: at(3, 1, 1), dvObed: at(3, 2, 2), dvMarch: at(3, 3, 3),
  });
  Object.assign(CONDS, {
    dvCedar: at(4, 0, 1), dvNathan5: at(4, 1, 1), dvPray: at(4, 2, 2),
    dvKind: at(5, 0, 0), dvLode: at(5, 1, 1), dvMeph: at(5, 2, 2), dvKTable: at(5, 3, 3),
    dvRoof: at(6, 0, 0), dvNathan7: at(6, 1, 1), dvLamb: at(6, 2, 2), dvJudge: at(6, 3, 3), dvPsalm: at(6, 4, 4),
    dvHeart: at(7, 0, 0), dvIttai: at(7, 1, 1), dvArkBack: at(7, 2, 2), dvOlives: at(7, 3, 3), dvShimei: at(7, 4, 5), dvMahan: at(7, 6, 6), dvForest: at(7, 7, 7),
    dvFord: at(8, 0, 3), dvShimei2: at(8, 1, 1), dvMeph2: at(8, 2, 2), dvBarz: at(8, 3, 3),
    dvRock: at(9, 0, 1),
    dvAdullam: any(at(10, 0, 0), at(10, 2, 3)), dvBWell: at(10, 1, 1), dvHeroes: at(10, 3, 3),
    dvCensus: at(11, 0, 0), dvAngel: at(11, 1, 1), dvAraunah: at(11, 2, 3),
    dvPrep: at(12, 0, 0), dvStore: at(12, 1, 1), dvPlan: at(12, 2, 2), dvOffer: at(12, 3, 4),
  });
  Object.assign(CONDS, { dvHebAb: any(CONDS.dvHebron, CONDS.dvAbner), dvMichal: () => arkHome && CONDS.dvMarch() });
  const ZP = ZONES.philistia.points, ZH = ZONES.hebron.points, ZB = ZONES.gibeon.points, ZJ = ZONES.jerusalem.points, ZM = ZONES.moab.points, ZL = ZONES.gilgal.points, ZU = ZONES.judah.points, ZBe = ZONES.bethlehem.points;
  const V_ = (Z, id, xz, title, model, cond, dx = 0, dz = 0, ex = {}) => Z.push({ id, x: xz[0] + dx, z: xz[1] + dz, type: 'villager', title, model, cond, ...ex });
  const L_ = (Z, id, xz, title, cond, dx = 0, dz = 0) => Z.push({ id, x: xz[0] + dx, z: xz[1] + dz, type: 'lore', title, cond, body: '' });
  // 1장 시글락
  L_(ZP, 'dv_ziklag', ZIKLAG, '시글락 — 다윗이 머문 곳', 'dvZiklag', 0, 3);
  V_(ZP, 'dv_david1', ZIKLAG, '다윗', M_.davidY, 'dvZiklag', -1.6, 4.4);
  V_(ZP, 'dv_youth', ZIKLAG, '사울의 진영에서 온 사람', M_.youth, 'dvZiklag', 1.6, 5.2);
  // 2장 여쭈어 · 헤브론 · 기브온 못
  V_(ZP, 'dv_david_ask', ZIKLAG, '다윗', M_.davidY, 'dvAsk', -1.6, 4.4);
  L_(ZH, 'dv_hebron', HEB, '헤브론 — 유다 족속의 왕', 'dvHebron', 0, -3);
  V_(ZH, 'dv_david_heb', HEB, '유다의 왕 다윗', M_.david, 'dvHebAb', -1.2, -4.6);
  V_(ZH, 'dv_men_heb', HEB, '유다 사람들', M_.people, 'dvHebron', 1.6, -4.2);
  L_(ZB, 'dv_pool', POOL, '기브온 못 가', 'dvPool', 0, 3.4);
  V_(ZB, 'dv_joab_pool', POOL, '요압', M_.joab, 'dvPool', 3.4, 0.6);
  V_(ZB, 'dv_abner_pool', POOL, '아브넬', M_.abner, 'dvPool', -3.4, 0.6);
  V_(ZH, 'dv_joab_heb', HEB, '요압', M_.joab, 'dvAbner', 2.2, -4);
  // 3장 헤브론 → 예루살렘
  V_(ZH, 'dv_tribes', HEB, '이스라엘 모든 지파의 장로들', M_.elders, 'dvTribes', 1.6, -4.2);
  V_(ZH, 'dv_tribes2', HEB, '장로들', M_.elders, 'dvTribes', 3, -3);
  V_(ZH, 'dv_david_tr', HEB, '다윗 왕', M_.david, 'dvTribes', -1.2, -4.6);
  L_(ZJ, 'dv_zion', SGATE, '시온 산성 — 다윗 성', 'dvZion', 0, -4);
  V_(ZJ, 'dv_david_zion', SGATE, '다윗 왕', M_.david, 'dvZion', -2, -6);
  L_(ZJ, 'dv_rephaim', REPHAIM, '르바임 골짜기', 'dvRephaim', 6, 0);
  V_(ZJ, 'dv_david_reph', REPHAIM, '다윗 왕', M_.david, 'dvRephaim', 8, 2);
  L_(ZJ, 'dv_mulb', MULB, '뽕나무 수풀 맞은편', 'dvMulb', 5, 2);
  // 4장 기럇여아림 → 예루살렘
  L_(ZB, 'dv_kirjath', KIRJATH, '기럇여아림 아비나답의 집', 'dvCart', -3, 0);
  V_(ZB, 'dv_david_kir', KIRJATH, '다윗 왕', M_.david, 'dvCart', -3, 2.6);
  L_(ZB, 'dv_nacon', NACON, '나곤의 타작 마당', 'dvNacon', 0, 2.4);
  V_(ZB, 'dv_david_nacon', NACON, '다윗 왕', M_.david, 'dvNacon', -2.6, 2);
  L_(ZB, 'dv_obed', OBED, '가드 사람 오벧에돔의 집', 'dvObed', 0, 3);
  V_(ZB, 'dv_obed_man', OBED, '오벧에돔', M_.obed, 'dvObed', 2.2, 2.2);
  V_(ZB, 'dv_messenger', OBED, '다윗 왕에게 아뢰는 사람', M_.messenger, 'dvObed', -2, 2.6);
  L_(ZJ, 'dv_march', ROAD, '궤를 메고 다윗 성으로', 'dvMarch', 0, 0);
  V_(ZJ, 'dv_michal', PALACE, '사울의 딸 미갈', M_.michal, 'dvMichal', 0, 6.4);
  // ══ 2부 ══ 5장 백향목 궁
  V_(ZJ, 'dv_david5', PALACE, '다윗 왕', M_.david, 'dvCedar', -1.4, 0.6);
  V_(ZJ, 'dv_nathan5', PALACE, '선지자 나단', M_.nathan, 'dvCedar', 1.8, 0.8);
  L_(ZJ, 'dv_pray', TENT, '여호와 앞에 들어가 앉아서(7:18)', 'dvPray', 0, 5.4);
  // 6장 므비보셋
  V_(ZJ, 'dv_david6', PALACE, '다윗 왕', M_.david, 'dvKind', -1.4, 0.6);
  V_(ZJ, 'dv_ziba', PALACE, '사울의 집의 종 시바', M_.ziba, 'dvKind', 1.8, 1);
  L_(ZM, 'dv_lodebar', LODEBAR, '로드발 암미엘의 아들 마길의 집', 'dvLode', 0, 3);
  V_(ZM, 'dv_meph_lode', LODEBAR, '므비보셋', M_.mephib, 'dvLode', 1.8, 2, { staff: true });
  V_(ZJ, 'dv_meph', PALACE, '요나단의 아들 므비보셋', M_.mephib, 'dvMeph', 1.6, 1.4, { staff: true });
  V_(ZJ, 'dv_david6b', PALACE, '다윗 왕', M_.david, 'dvMeph', -1.4, 0.6);
  L_(ZJ, 'dv_ktable', PALACE, '왕의 상', 'dvKTable', 4.4, 3.4);
  // ══ 3부 ══ 7장 나단
  L_(ZJ, 'dv_roof', PALACE, '왕궁 — 저녁 때에(11:2)', 'dvRoof', 0, 1.2);
  V_(ZJ, 'dv_nathan7', PALACE, '선지자 나단', M_.nathan, 'dvNathanJ', 2, 1);
  V_(ZJ, 'dv_david7', PALACE, '다윗 왕', M_.david, 'dvNathanJ', -1.4, 0.6);
  L_(ZJ, 'dv_lamb', LAMBH, '가난한 사람의 집 — 작은 암양 새끼', 'dvLamb', 0, 2.6);
  L_(ZJ, 'dv_psalm', TENT, '여호와의 전(12:20)', 'dvPsalm', 0, 5.4);
  // 8장 압살롬
  V_(ZJ, 'dv_msg8', PALACE, '다윗에게 온 전령', M_.messenger, 'dvHeart', 1.8, 1);
  V_(ZJ, 'dv_david8', PALACE, '다윗 왕', M_.david, 'dvHeart', -1.4, 0.6);
  V_(ZJ, 'dv_ittai', EGATE, '가드 사람 잇대', M_.ittai, 'dvIttai', 1.6, 1.6);
  V_(ZJ, 'dv_david8b', EGATE, '다윗 왕', M_.david, 'dvIttArk', -1.2, 1.8);
  V_(ZJ, 'dv_zadok', EGATE, '하나님의 언약궤를 멘 레위 사람', M_.levite, 'dvArkBack', 2.8, -1.6);
  L_(ZJ, 'dv_olives', OLIVES, '감람 산 길', 'dvOlives', 0, 0);
  L_(ZJ, 'dv_bahurim', BAHURIM, '바후림 — 산비탈', 'dvShimei', -2.4, 1);
  V_(ZJ, 'dv_shimei', BAHURIM, '게라의 아들 시므이', M_.shimei, 'dvShimei', 3.4, -2.4);
  V_(ZJ, 'dv_abishai8', BAHURIM, '스루야의 아들 아비새', M_.abishai, 'dvShimei', -3.6, 1.8);
  L_(ZM, 'dv_mahanaim', MAHANAIM, '마하나임', 'dvMahan', 0, 3);
  V_(ZM, 'dv_barz_mah', MAHANAIM, '길르앗 사람 바르실래', M_.barzillai, 'dvMahan', 2.4, 1.6);
  V_(ZM, 'dv_david8m', MAHANAIM, '다윗 왕', M_.david, 'dvMahan', -2, 1.4);
  L_(ZM, 'dv_forest', FOREST, '에브라임 수풀 — 멀리서', 'dvForest', -6, 6);
  V_(ZM, 'dv_cushite', FOREST, '구스 사람', M_.cushite, 'dvForest', -8, 7.6);
  // 9장 요단 나루
  L_(ZL, 'dv_ford', FORD, '요단 나루', 'dvFord', -2, 0);
  V_(ZL, 'dv_david9', FORD, '다윗 왕', M_.davidOld, 'dvFord', -3.4, 2);
  V_(ZL, 'dv_shimei9', FORD, '시므이', M_.shimei, 'dvShimei2', -1, 4.4);
  V_(ZL, 'dv_abishai9', FORD, '아비새', M_.abishai, 'dvShimei2', -5.6, 3.6);
  V_(ZL, 'dv_meph9', FORD, '므비보셋', M_.mephib, 'dvMeph2', -0.6, 4.6, { staff: true });
  V_(ZL, 'dv_barz9', FORD, '바르실래', M_.barzillai, 'dvBarz', -0.6, 4.6);
  // ══ 4부 ══ 10장 감사의 노래
  L_(ZJ, 'dv_rock', NGATE, '성벽 위 망대 — 다윗의 노래', 'dvRock', 0, 2);
  V_(ZJ, 'dv_david10', NGATE, '다윗 왕', M_.davidOld, 'dvRock', -2, 3);
  // 11장 용사들
  L_(ZU, 'dv_adullam', ADULLAM, '아둘람 굴', 'dvAdullam', 2.4, 1.6);
  V_(ZU, 'dv_david11', ADULLAM, '다윗', M_.davidOld, 'dvAdullam', -1.6, 2);
  V_(ZU, 'dv_benaiah', ADULLAM, '여호야다의 아들 브나야', M_.benaiah, 'dvHeroes', 3.6, 3);
  V_(ZU, 'dv_hero2', ADULLAM, '다윗의 용사', M_.joab, 'dvAdullam', 4.4, 0.4);
  L_(ZBe, 'dv_bwell', BWELL, '베들레헴 성문 곁 우물', 'dvBWell', 0, 1.8);
  // 12장 아라우나
  V_(ZJ, 'dv_joab12', PALACE, '군사령관 요압', M_.joab, 'dvCensus', 1.8, 1);
  V_(ZJ, 'dv_gad', PALACE, '다윗의 선견자 갓', M_.gad, 'dvCensus', 3.4, -0.4);
  V_(ZJ, 'dv_david12', PALACE, '다윗 왕', M_.davidOld, 'dvCensus', -1.4, 0.6);
  L_(ZJ, 'dv_angel', NGATE, '북문 밖 — 모리아로 가는 길', 'dvAngel', 0, -4);
  V_(ZJ, 'dv_araunah', MORIAH, '여부스 사람 아라우나', M_.araunah, 'dvAraunah', 2.4, 0);
  V_(ZJ, 'dv_david12m', MORIAH, '다윗 왕', M_.davidOld, 'dvAraunah', -2.4, 2.6);
  L_(ZJ, 'dv_floor', MORIAH, '아라우나의 타작 마당', 'dvAraunah', 0, -0.5);
  // 13장 성전 준비
  V_(ZJ, 'dv_david13', PALACE, '늙은 다윗 왕', M_.davidOld, 'dvPrep', -1.4, 0.6);
  L_(ZJ, 'dv_store', STORE, '성전 재료를 모으는 곳', 'dvStore', 0, 0);
  V_(ZJ, 'dv_solomon', MORIAH, '다윗의 아들 솔로몬', M_.solomon, 'dvSolo', 2.6, 1.6);
  V_(ZJ, 'dv_david13m', MORIAH, '다윗 왕', M_.davidOld, 'dvSolo', -2.4, 2.4);
  L_(ZJ, 'dv_thanks', MORIAH, '온 회중 앞에서(대상 29:10)', 'dvOffer', 0, 4.4);
  Object.assign(CONDS, { dvNathanJ: any(CONDS.dvNathan7, CONDS.dvJudge), dvIttArk: any(CONDS.dvIttai, CONDS.dvArkBack), dvSolo: any(CONDS.dvPlan, CONDS.dvOffer) });
  // 베들레헴에서 예루살렘 가는 길은 엔진이 낸다(8편을 펼친 뒤) · 시글락 → 헤브론은 걸어서 먼 길이라 길 떠나기(🧭)로
  DLG.dv_cart.push({ event: 'cart' });
  DLG.dv_uzzah.splice(3, 0, { event: 'stopCart' });   // 6:6-8 — 원경, 수레가 멈춤
  DLG.dv_march_done.splice(1, 0, { event: 'arkIn' });  // 6:14-17 궤가 장막 안으로
  const afterRef = (d, ref) => { const i = d.findIndex(l => Array.isArray(l) && l[1].endsWith(`(${ref})`)); if (i < 0) throw new Error(ref); return i + 1; };
  DLG.dv_child.splice(afterRef(DLG.dv_child, '삼하 12:24'), 0, { event: 'gemSolomon' });   // 12:24 솔로몬 — 족보 조각(마 1:6)
  DLG.dv_forest.splice(afterRef(DLG.dv_forest, '삼하 18:6'), 0, { event: 'dustForest' }); // 18:6-8 싸움은 먼지만 멀리
  DLG.dv_plague.splice(afterRef(DLG.dv_plague, '삼하 24:16'), 0, { event: 'angelStop' });  // 24:16 "족하다 이제는 네 손을 거두라"
  DLG.dv_thanks.push({ event: 'harpDone' });

  // ── 놀이 ──
  const { mgOpen, mgCloseAll, completeTask } = api;
  const btnCss = 'padding:8px 6px;border-radius:10px;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.08);color:#f5e9d0;font-size:13px';
  const LIVES = 3, hearts = n => '❤️'.repeat(Math.max(0, n)) + '🤍'.repeat(Math.max(0, LIVES - n));
  const OUT = '❤️을 다 썼어요 — 처음부터 다시';
  const msgBox = m => `<div style="text-align:center;color:#ffd27a;font-weight:800;min-height:34px;padding:6px 10px 0;font-size:12.5px">${m}</div>`;
  Object.assign(api.BADGES, { covenant_prayer: { ico: '🙏', name: '나는 누구이오며' }, kings_table: { ico: '🍞', name: '왕의 상에 자리를 마련한 사람' }, let_him_curse: { ico: '🪨', name: '맞서지 않고 지나간 사람' },
    rock_song: { ico: '🪨', name: '반석과 요새' }, fifty_shekels: { ico: '⚖', name: '은 오십 세겔' }, thanks: { ico: '🎵', name: '주의 손에서 받은 것으로' } });
  Object.assign(api.BADGES, { bow_song: { ico: '🎶', name: '활 노래를 이어 부른 사람' }, mulberry: { ico: '🌳', name: '뽕나무 소리를 기다린 사람' }, six_steps: { ico: '💃', name: '여섯 걸음마다 멈춘 사람' } });
  function giveBadge(k){ const S = api.ST; if (S.badges.includes(k)) return; S.badges.push(k); api.saveST(); setTimeout(() => api.toast(`${api.BADGES[k].ico} 배지 「${api.BADGES[k].name}」`, 2600), 600); }
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
  // 🎶 활 노래(삼하 1:19-27) — 소절의 첫머리를 차례대로. 「두 용사가 엎드러졌도다」가 처음·가운데·끝에 돌아온다
  function lamentGame(q){
    api.runDialog(DLG.dv_lament, () => orderPlay(q, '🎶 활 노래', '"다윗이 이 슬픈 노래로 사울과 그의 아들 요나단을 조상하고" (삼하 1:17) — 소절의 첫머리를 차례대로 놓아요.',
      LAMENT.map(l => [l[0], l[1]]), '노래의 차례가 아니에요 —', '「오호라 두 용사가 엎드러졌으며 싸우는 무기가 망하였도다」', perfect => { if (perfect) giveBadge('bow_song'); }));
  }
  // 🌳 뽕나무 꼭대기의 걸음 소리(삼하 5:23-24) — 기다렸다가 걸음 소리가 들릴 때만 나아간다
  function waitGame(q){
    const CUES = ['🌬 바람이 지나가요', '🐦 새가 울어요', '🍃 잎사귀가 흔들려요', '🦗 풀벌레 소리', '🌬 바람이 지나가요'];
    let life = LIVES, cue = '', step = false, n = 0, timer = null, msg = '', done = false;
    mgOpen('🌳 뽕나무 꼭대기의 걸음 소리', '"뽕나무 꼭대기에서 걸음 걷는 소리가 들리거든 곧 공격하라 그 때에 여호와가 너보다 앞서 나아가서" (삼하 5:24) — 먼저 나가지 말고 기다려요.');
    const draw = () => { api.mgArea.innerHTML = `<div style="text-align:center;font-size:46px;padding:10px 0 2px">🌳🌳🌳</div><div style="text-align:center;font-size:17px;font-weight:800;min-height:30px;color:${step ? '#ffe28a' : '#f5e9d0'}">${done ? '👣 여호와께서 앞서 나아가셨어요' : cue || '…'}</div>` + msgBox(msg || hearts(life));
      api.mgAct.textContent = done ? '계속' : '👣 나아가기'; };
    const tick = () => { n++; step = n >= 4 && Math.random() < 0.35 || n >= 9; cue = step ? '👣 뽕나무 꼭대기에서 걸음 걷는 소리!' : CUES[Math.floor(Math.random() * CUES.length)]; msg = ''; draw();
      timer = setTimeout(() => { if (done) return; if (step){ step = false; n = 3; } tick(); }, step ? 1500 : 1100 + Math.random() * 700); };
    draw(); timer = setTimeout(tick, 900);
    api.mgAct.onclick = () => {
      if (done){ mgCloseAll(); completeTask(q); return; }
      if (step){ done = true; clearTimeout(timer); if (life === LIVES) giveBadge('mulberry'); draw(); return; }
      if (--life <= 0){ life = LIVES; n = 0; msg = OUT; } else msg = `아직이에요 — 여호와의 걸음 소리를 기다려요 ${hearts(life)}`; draw(); };
    api.mg.onClose = () => clearTimeout(timer);
  }
  // 💃 여섯 걸음(삼하 6:13) — 궤를 멘 사람들이 여섯 걸음을 가면 멈추고 제사, 세 번 하면 성문
  function marchGame(q){
    const ROUNDS = 3; let steps = 0, round = 0, life = LIVES, msg = '', perfect = true;
    const draw = () => { const done = round >= ROUNDS;
      api.mgArea.innerHTML = `<div style="text-align:center;font-size:30px;padding:8px 0">${'👣'.repeat(steps)}${'·'.repeat(Math.max(0, 6 - steps))}</div><div style="text-align:center;font-size:13px">다윗 성까지 ${'🏛'.repeat(round)}${'▫️'.repeat(ROUNDS - round)}</div>`
        + (done ? '' : `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 12px"><button data-m="step" style="${btnCss}">👣 한 걸음</button><button data-m="stop" style="${btnCss}">🔥 멈추고 제사</button></div>`)
        + msgBox(msg || (done ? '"다윗과 온 이스라엘 족속이 즐거이 환호하며 나팔을 불고" (삼하 6:15)' : hearts(life)));
      api.mgAct.textContent = done ? '계속' : '여섯 걸음마다 멈춰요'; api.mgAct.disabled = !done; };
    api.runDialog(DLG.dv_march, () => {
      mgOpen('💃 여섯 걸음', '"여호와의 궤를 멘 사람들이 여섯 걸음을 가매 다윗이 소와 살진 송아지로 제사를 드리고" (삼하 6:13)'); draw();
      api.mgArea.onclick = e => { const b = e.target.closest('[data-m]'); if (!b || round >= ROUNDS) return; msg = '';
        if (b.dataset.m === 'step'){ if (steps < 6) steps++; else { perfect = false; if (--life <= 0){ life = LIVES; steps = 0; round = 0; msg = OUT; } else msg = `여섯 걸음이에요 — 멈추고 제사 ${hearts(life)}`; } }
        else if (steps === 6){ steps = 0; round++; }
        else { perfect = false; if (--life <= 0){ life = LIVES; steps = 0; round = 0; msg = OUT; } else msg = `아직 여섯 걸음이 아니에요 ${hearts(life)}`; }
        draw(); };
      api.mgAct.onclick = () => { if (round < ROUNDS) return; api.mgArea.onclick = null; mgCloseAll(); if (perfect) giveBadge('six_steps'); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; };
    });
  }

  // 🙏 누른 채 기도(손을 떼면 처음부터) — 5장 다윗의 기도 · 7장 시편 51편 · 13장 감사 기도
  function holdPray(q, title, info, secs, pre, badge){
    const run = () => {
      mgOpen(title, info); let t0 = 0, raf = 0, done = false;
      const draw = k => { api.mgArea.innerHTML = `<div style="text-align:center;padding:14px 0 6px"><button data-pr style="${btnCss};font-size:18px;padding:16px 26px;touch-action:none">${done ? '🙏 아멘' : '🙏 누른 채 기도해요'}</button></div><div style="margin:4px 20px;height:10px;border-radius:6px;background:rgba(255,255,255,.12)"><div style="height:100%;width:${Math.round(k * 100)}%;border-radius:6px;background:#ffd27a"></div></div>` + msgBox(done ? '"여호와께서 그 땅을 위한 기도를 들으시매"처럼 — 기도를 마쳤어요' : `${secs}초 동안 손을 떼지 말아요`);
        api.mgAct.textContent = done ? '계속' : '누른 채 기다려요'; api.mgAct.disabled = !done; };
      const loop = () => { const k = Math.min(1, (performance.now() - t0) / (secs * 1000)); draw(k); if (k >= 1){ done = true; draw(1); if (badge) giveBadge(badge); return; } raf = requestAnimationFrame(loop); };
      draw(0);
      const down = e => { if (done || !e.target.closest('[data-pr]')) return; e.preventDefault(); t0 = performance.now(); loop(); };
      const up = () => { if (done) return; cancelAnimationFrame(raf); draw(0); };
      api.mgArea.addEventListener('pointerdown', down); window.addEventListener('pointerup', up);
      api.mgAct.onclick = () => { if (!done) return; window.removeEventListener('pointerup', up); mgCloseAll(); completeTask(q); };
      api.mg.onClose = () => { cancelAnimationFrame(raf); window.removeEventListener('pointerup', up); };
    };
    pre ? api.runDialog(pre, run) : run();
  }
  function prayGame(q){ holdPray(q, '🙏 다윗의 기도', '"다윗 왕이 여호와 앞에 들어가 앉아서" (삼하 7:18)', 4, DLG.dv_pray, 'covenant_prayer'); }
  function psalmGame(q){ holdPray(q, '🙏 시편 51편', VERSES['psa51-10'].text + ' (시편 51:10)', 4, null, null); }
  function thanksGame(q){ holdPray(q, '🙏 다윗의 감사 기도', '"모든 것이 주께로 말미암았사오니 우리가 주의 손에서 받은 것으로 주께 드렸을 뿐이니이다" (대상 29:14)', 4, null, 'thanks'); }
  // 🍞 왕의 상(삼하 9:11 "므비보셋은 왕자 중 하나처럼 왕의 상에서 먹으니라") — 자리 고르기
  function tableGame(q){
    const SEATS = [['문 옆 끝자리', 0], ['종들이 서는 자리', 0], ['왕자들 사이의 자리', 1], ['상 밖 바닥', 0]]; let life = LIVES, msg = '', ok = false;
    const draw = () => { api.mgArea.innerHTML = `<div style="text-align:center;font-size:34px;padding:6px 0">🍞🍇🫓🍞</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:4px 10px">${SEATS.map((s, i) => `<button data-st="${i}" style="${btnCss}">${s[0]}</button>`).join('')}</div>` + msgBox(ok ? '"므비보셋은 왕자 중 하나처럼 왕의 상에서 먹으니라" (삼하 9:11)' : msg || hearts(life));
      api.mgAct.textContent = ok ? '계속' : '자리를 골라요'; api.mgAct.disabled = !ok; };
    mgOpen('🍞 왕의 상', '"너는 항상 내 상에서 떡을 먹을지니라" (삼하 9:7) — 므비보셋의 자리를 마련해요.'); draw();
    api.mgArea.onclick = e => { const b = e.target.closest('[data-st]'); if (!b || ok) return; if (SEATS[+b.dataset.st][1]){ ok = true; giveBadge('kings_table'); } else if (--life <= 0){ life = LIVES; msg = OUT; } else msg = `왕이 어떻게 대하라고 했는지 떠올려요(9:11) ${hearts(life)}`; draw(); };
    api.mgAct.onclick = () => { if (!ok) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
    api.mg.onClose = () => { api.mgArea.onclick = null; };
  }
  // 🐑 가난한 사람의 암양 새끼(12:3) — 품에 안긴 양을 보고 오기(실패 없음)
  function lambGame(q){ api.runDialog(DLG.dv_lamb, () => completeTask(q)); }
  // ⛰ 감람 산 길(15:30) — 머리를 가리고 맨발로 울며 천천히: 눌러서 한 걸음씩, 달리면(빨리 연타) 멈춤
  function climbGame(q){
    let n = 0, last = 0, msg = ''; const N = 10;
    const draw = () => { api.mgArea.innerHTML = `<div style="text-align:center;font-size:26px;padding:8px 0">${'🚶'.repeat(Math.min(n, N))}${'·'.repeat(Math.max(0, N - n))}⛰</div><div style="text-align:center;padding:4px"><button data-cl style="${btnCss};font-size:16px;padding:12px 22px">${n >= N ? '마루턱에 이르렀어요' : '👣 한 걸음'}</button></div>` + msgBox(n >= N ? '"다윗이 하나님을 경배하는 마루턱에 이를 때에" (삼하 15:32)' : msg || '백성과 함께 천천히 — 서두르지 않아요');
      api.mgAct.textContent = n >= N ? '계속' : '천천히 올라가요'; api.mgAct.disabled = n < N; };
    mgOpen('⛰ 감람 산 길', '"다윗이 감람 산 길로 올라갈 때에 그의 머리를 그가 가리고 맨발로 울며 가고" (삼하 15:30)'); draw();
    api.mgArea.onclick = e => { if (!e.target.closest('[data-cl]') || n >= N) return; const now = performance.now();
      if (now - last < 450){ msg = '너무 빨라요 — 울며 가는 백성과 함께 천천히'; } else { n++; msg = ''; } last = now; draw(); };
    api.mgAct.onclick = () => { if (n < N) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
    api.mg.onClose = () => { api.mgArea.onclick = null; };
  }
  // 🪨 시므이의 돌(16:6-13) — 맞서지 않고 지나가기. "그가 저주하게 버려두라"
  function stonesGame(q){
    let left = 4, life = LIVES, msg = '';
    const draw = () => { api.mgArea.innerHTML = `<div style="text-align:center;font-size:28px;padding:6px 0">${left > 0 ? '🪨 💨' : '🌄'}</div>`
      + (left > 0 ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:6px 12px"><button data-sn="pass" style="${btnCss}">🚶 피하며 지나가기</button><button data-sn="fight" style="${btnCss}">⚔ 건너가서 맞서기</button></div>` : '')
      + msgBox(left > 0 ? (msg || `돌이 날아와요 · 남은 비탈 ${left} · ${hearts(life)}`) : '"다윗과 그의 추종자들이 길을 갈 때에" (삼하 16:13)');
      api.mgAct.textContent = left > 0 ? '지나가요' : '계속'; api.mgAct.disabled = left > 0; };
    mgOpen('🪨 바후림의 비탈', '"그가 저주하게 버려두라 … 여호와께서 선으로 내게 갚아 주시리라" (삼하 16:11-12)'); draw();
    api.mgArea.onclick = e => { const b = e.target.closest('[data-sn]'); if (!b || left <= 0) return;
      if (b.dataset.sn === 'pass'){ left--; msg = ''; } else if (--life <= 0){ life = LIVES; left = 4; msg = OUT; } else msg = `다윗은 맞서지 않았어요 — "그가 저주하게 버려두라"(16:11) ${hearts(life)}`;
      draw(); };
    api.mgAct.onclick = () => { if (left > 0) return; api.mgArea.onclick = null; mgCloseAll(); if (life === LIVES) giveBadge('let_him_curse'); completeTask(q); };
    api.mg.onClose = () => { api.mgArea.onclick = null; };
  }
  // 🪨 여호와는 나의 반석이시요(22:2-3) — 노래의 낱말만 모으기
  function wordsGame(q){
    const W = [['반석', 1], ['요새', 1], ['건지시는 자', 1], ['방패', 1], ['구원의 뿔', 1], ['높은 망대', 1], ['피난처', 1], ['구원자', 1], ['칼', 0], ['병거', 0], ['금 왕관', 0], ['큰 성벽', 0]];
    const got = new Set(); let life = LIVES, msg = ''; const order = W.map((w, i) => i).sort(() => Math.random() - 0.5);
    const need = W.filter(w => w[1]).length;
    const draw = () => { const ok = got.size >= need;
      api.mgArea.innerHTML = `<div style="padding:6px 12px;font-size:13px;min-height:26px">${[...got].map(i => W[i][0]).join(' · ') || '—'}</div><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;padding:4px 10px">${order.filter(i => !got.has(i)).map(i => `<button data-wd="${i}" style="${btnCss}">${W[i][0]}</button>`).join('')}</div>` + msgBox(ok ? '"여호와는 나의 반석이시요 나의 요새시요 나를 위하여 나를 건지시는 자시요" (삼하 22:2)' : msg || `${got.size} / ${need} · ${hearts(life)}`);
      api.mgAct.textContent = ok ? '계속' : '노래의 낱말을 모아요'; api.mgAct.disabled = !ok; };
    api.runDialog(DLG.dv_rock, () => { mgOpen('🪨 다윗의 노래', '"여호와께서 다윗을 모든 원수의 손과 사울의 손에서 구원하신 그 날에" (삼하 22:1) — 노래에 나오는 낱말만 모아요.'); draw();
      api.mgArea.onclick = e => { const b = e.target.closest('[data-wd]'); if (!b) return; const i = +b.dataset.wd;
        if (W[i][1]){ got.add(i); msg = ''; } else if (--life <= 0){ life = LIVES; got.clear(); msg = OUT; } else msg = `노래(22:2-3)에 없는 낱말이에요 ${hearts(life)}`; draw(); };
      api.mgAct.onclick = () => { if (got.size < need) return; api.mgArea.onclick = null; mgCloseAll(); if (life === LIVES) giveBadge('rock_song'); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; }; });
  }
  // 💧 베들레헴 우물물(23:15-16) — 블레셋 파수꾼이 돌아볼 때는 멈추고, 등을 돌릴 때만 나아가기(사람 해치기 없음)
  function sneakGame(q){
    let pos = 0, look = false, life = LIVES, msg = '', timer = null, water = false; const N = 6;
    const draw = () => { api.mgArea.innerHTML = `<div style="text-align:center;font-size:24px;padding:6px 0">${look ? '👀' : '🙈'} 파수꾼</div><div style="text-align:center;font-size:22px">${water ? '🏺💧' : '🏺'} ${'▫️'.repeat(pos)}🚶${'▫️'.repeat(Math.max(0, N - pos))}⛲</div><div style="text-align:center;padding:6px"><button data-sk style="${btnCss};font-size:15px;padding:10px 20px">${pos >= N ? (water ? '길었어요' : '💧 물 긷기') : '👣 나아가기'}</button></div>` + msgBox(msg || (look ? '파수꾼이 이쪽을 봐요 — 멈춰요' : `지금이에요 · ${hearts(life)}`));
      api.mgAct.textContent = water ? '계속' : '우물까지 가서 물을 길어요'; api.mgAct.disabled = !water; };
    const flip = () => { look = !look; draw(); timer = setTimeout(flip, look ? 900 + Math.random() * 700 : 1200 + Math.random() * 900); };
    mgOpen('💧 베들레헴 성문 곁 우물', '"세 용사가 블레셋 사람의 진영을 돌파하고 지나가서 베들레헴 성문 곁 우물 물을 길어 가지고" (삼하 23:16)'); draw(); timer = setTimeout(flip, 1000);
    api.mgArea.onclick = e => { if (!e.target.closest('[data-sk]') || water) return;
      if (pos >= N){ water = true; clearTimeout(timer); msg = '물을 길었어요 — 아둘람 굴로 돌아가요'; draw(); return; }
      if (look){ if (--life <= 0){ life = LIVES; pos = 0; msg = OUT; } else { pos = Math.max(0, pos - 2); msg = `들킬 뻔했어요 — 뒤로 물러나요 ${hearts(life)}`; } } else { pos++; msg = ''; } draw(); };
    api.mgAct.onclick = () => { if (!water) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
    api.mg.onClose = () => { clearTimeout(timer); api.mgArea.onclick = null; };
  }
  // ⚖ 은 오십 세겔(24:24) — 거저 받지 않고 값을 세어 치르기
  function silverGame(q){
    let sum = 0, msg = '', paid = false;
    const draw = () => { api.mgArea.innerHTML = `<div style="text-align:center;font-size:20px;padding:6px 0">⚖ ${sum} 세겔</div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:4px 10px">${[10, 5, 1].map(v => `<button data-sv="${v}" style="${btnCss}">+${v}</button>`).join('')}<button data-sv="0" style="${btnCss}">↺</button></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:6px 10px"><button data-sv="free" style="${btnCss}">🤲 거저 받기</button><button data-sv="pay" style="${btnCss}">💰 값을 치르기</button></div>` + msgBox(paid ? '"내가 값을 주고 네게서 사리라" (삼하 24:24)' : msg || '은 오십 세겔을 세어요');
      api.mgAct.textContent = paid ? '계속' : '값을 치러요'; api.mgAct.disabled = !paid; };
    mgOpen('⚖ 은 오십 세겔', '"다윗이 은 오십 세겔로 타작 마당과 소를 사고" (삼하 24:24)'); draw();
    api.mgArea.onclick = e => { const b = e.target.closest('[data-sv]'); if (!b || paid) return; const v = b.dataset.sv;
      if (v === 'free') msg = '"값 없이는 내 하나님 여호와께 번제를 드리지 아니하리라"(24:24)';
      else if (v === 'pay'){ if (sum === 50){ paid = true; giveBadge('fifty_shekels'); } else msg = sum < 50 ? `아직 ${50 - sum} 세겔이 모자라요` : `${sum - 50} 세겔이 넘쳐요 — 다시 세요`; }
      else if (v === '0'){ sum = 0; msg = ''; } else { sum += +v; msg = ''; } draw(); };
    api.mgAct.onclick = () => { if (!paid) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
    api.mg.onClose = () => { api.mgArea.onclick = null; };
  }
  // 🏗 성전 재료(대상 22:2-4, 14) — 여섯 가지를 모아 모리아 터에
  function gatherGame(q){
    const MAT = ['🪨 다듬은 돌', '🌲 백향목', '🟡 금', '⚪ 은', '🟤 놋', '⚫ 철']; const got = new Set();
    const draw = () => { const ok = got.size >= MAT.length;
      api.mgArea.innerHTML = `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;padding:8px 10px">${MAT.map((m, i) => `<button data-mt="${i}" style="${btnCss};${got.has(i) ? 'opacity:.35' : ''}">${m}${got.has(i) ? ' ✓' : ''}</button>`).join('')}</div>` + msgBox(ok ? '"금과 은과 놋과 철이 무수하니 너는 일어나 일하라" (대상 22:16)' : `${got.size} / ${MAT.length} — 모아서 모리아 터로`);
      api.mgAct.textContent = ok ? '계속' : '재료를 모아요'; api.mgAct.disabled = !ok; };
    mgOpen('🏗 성전 재료', '"내가 환난 중에 여호와의 성전을 위하여 … 또 재목과 돌을 준비하였으나 너는 더할 것이며" (대상 22:14)'); draw();
    api.mgArea.onclick = e => { const b = e.target.closest('[data-mt]'); if (!b) return; got.add(+b.dataset.mt); draw(); };
    api.mgAct.onclick = () => { if (got.size < MAT.length) return; api.mgArea.onclick = null; mgCloseAll(); materials = true; refresh('jerusalem'); completeTask(q); };
    api.mg.onClose = () => { api.mgArea.onclick = null; };
  }

  // ── 일어나는 일 ──
  function cartEv(){ cartAt = 'kirjath'; refresh('gibeon'); }
  function stopCart(){ cartAt = 'nacon'; refresh('gibeon'); }
  function arkIn(){ arkHome = true; refresh('jerusalem'); }
  function gemSolomon(){ if (api.addGeneal) api.addGeneal(['솔로몬']); }
  let dustF = false, materials = false;
  function dustForest(){ dustF = true; refresh('moab'); }
  function angelStop(){ flash('#fff6dc', 0.5); }
  function harpDone(){ try { api.toast('🎵 여덟 번째 받침대에 다윗의 수금이 놓여요', 3200); } catch (e){} }
  function flash(col, o = 0.5){ const fl = document.getElementById('flash'); if (!fl) return; fl.style.transition = 'none'; fl.style.background = col; fl.style.opacity = String(o); setTimeout(() => { fl.style.transition = 'opacity 1.2s'; fl.style.opacity = '0'; }, 120); }

  // ── 마을에 놓이는 것 ──
  let worldObj = null, softT = null;
  const softTex = () => { if (softT) return softT; const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 2, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); softT = new THREE.CanvasTexture(c); return softT; };
  const propFail = {};
  const refresh = zid => { if (api.Z && api.Z.id === zid) world(zid); };
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
    const sprites = (cx, cz, n, col, op, sx, sy, y0, spread) => { for (let i = 0; i < n; i++){ const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex(), color: col, depthWrite: false, transparent: true, opacity: op })); s.position.set(cx + (Math.random() - 0.5) * spread, api.heightAt(cx, cz) + y0 + Math.random() * 2, cz + (Math.random() - 0.5) * spread); s.scale.set(sx, sy, 1); g.add(s); } };
    if (zid === 'philistia' && p.ch <= 1){   // 시글락 — 불탔던 성읍(삼상 30:3)에 다시 머묾
      [[-5, -3], [0, -6], [5, -3], [-5, 3], [5, 2]].forEach(([dx, dz]) => house(ZIKLAG[0] + dx, ZIKLAG[1] + dz, 3.2, 2.8, 0x8a7a68));
    }
    if (zid === 'hebron' && p.ch >= 1 && p.ch <= 2){   // 헤브론 성읍(2:3 "헤브론 각 성읍에 살게 하니라")
      [[-7, -1], [-3, 3], [3, 2], [7, -2], [-6, 6], [6, 6]].forEach(([dx, dz]) => house(HEB[0] + dx, HEB[1] + dz, 3.6, 3, 0xdcc8a2));
    }
    if (zid === 'gibeon' && p.ch === 1){   // 기브온 못(2:13) — 못 이쪽과 저쪽
      const w = new THREE.Mesh(new THREE.CircleGeometry(3.2, 24).rotateX(-Math.PI / 2), M(0x5f9fc0)); w.position.set(POOL[0], api.heightAt(POOL[0], POOL[1]) + 0.06, POOL[1]); g.add(w); obst(POOL[0], POOL[1], 3);
      for (let i = 0; i < 14; i++){ const a = i / 14 * Math.PI * 2; put(new THREE.BoxGeometry(0.9, 0.4, 0.6), M(0xc8b890), POOL[0] + Math.cos(a) * 3.5, 0.2, POOL[1] + Math.sin(a) * 3.5, -a); }
    }
    if (zid === 'gibeon' && p.ch === 3){   // 기럇여아림 아비나답의 집 · 새 수레 · 나곤의 타작 마당 · 오벧에돔의 집
      needProps(['cart', 'ark', 'bull'], 'gibeon');
      house(KIRJATH[0] + 2, KIRJATH[1] - 2, 4.4, 3.4); house(OBED[0], OBED[1] - 1.6, 4, 3.2, 0xd8c4a0);
      put(new THREE.CylinderGeometry(3, 3.1, 0.2, 24), M(0xd2c29a), NACON[0], 0.1, NACON[1]);
      const at = cartAt === 'nacon' || p.step >= 1 ? NACON : [KIRJATH[0] - 3, KIRJATH[1] + 4];
      if (p.step <= 1){ prop('cart', at[0], at[1], 1.2); prop('ark', at[0], at[1], 1.2, 0.95); prop('bull', at[0] - 1.6, at[1] + 2.2, 1.2); }
      if (p.step >= 2) prop('ark', OBED[0] + 2.6, OBED[1] + 0.6, 0.3);   // 석 달 동안 오벧에돔의 집에(6:11)
    }
    if (zid === 'jerusalem' && p.ch === 3){   // 4장 — 궤를 멘 줄이 성 남쪽 길에서 기다림, 행렬 뒤엔 장막 안에
      needProps(['ark'], 'jerusalem');
      if (!arkHome) prop('ark', ROAD[0] + 1.6, ROAD[1] - 1, 0.4); else prop('ark', TENT[0], TENT[1] - 1.4, 0);
    }
    if (zid === 'jerusalem' && p.ch >= 4){   // 5장부터 궤는 장막 안에
      needProps(['ark', 'lamb', 'king-table', 'cut-stones', 'cedar-beams', 'gold-silver-chest', 'temple-plan', 'silver-pouch', 'threshing-sledge', 'bull'], 'jerusalem');
      prop('ark', TENT[0], TENT[1] - 1.4, 0);
      if (p.ch === 5 && p.step >= 3){ put(new THREE.BoxGeometry(4.6, 0.7, 1.6), M(0x8a5a34), PALACE[0] + 4.4, 0.35, PALACE[1] + 5); obst(PALACE[0] + 4.4, PALACE[1] + 5, 1.6);   // 왕의 상(직접 만든 긴 식탁)
        for (let i = 0; i < 4; i++) put(new THREE.SphereGeometry(0.22, 8, 6), M(0xd8b070), PALACE[0] + 2.8 + i, 0.8, PALACE[1] + 5); }
      if (p.ch === 6){ put(new THREE.BoxGeometry(3, 0.8, 0.12), M(0x9a7a50), LAMBH[0], 0.4, LAMBH[1] + 1.8); prop('lamb', LAMBH[0] + 0.6, LAMBH[1] + 0.8, 0.6); }   // 가난한 사람의 작은 암양 새끼(12:3)
      if (p.ch === 11){ prop('threshing-sledge', MORIAH[0] - 3, MORIAH[1] + 2, 0.6, 0.4); prop('bull', MORIAH[0] + 4, MORIAH[1] + 3.4, 2.2, 0.4); if (p.step >= 3) prop('silver-pouch', MORIAH[0] - 1, MORIAH[1] + 3.6, 0.3, 0.4); }
      if (p.ch === 12){ prop('temple-plan', MORIAH[0] - 1.6, MORIAH[1] + 1.6, 0.2, 0.4);
        if (materials || p.step >= 2){ prop('cut-stones', MORIAH[0] - 6, MORIAH[1] - 4, 0, 0.4); prop('cedar-beams', MORIAH[0] + 6, MORIAH[1] - 4, 1.2, 0.4); prop('gold-silver-chest', MORIAH[0] + 6.4, MORIAH[1] + 3, 2.6, 0.4); }
        else { prop('cut-stones', STORE[0] - 3, STORE[1], 0); prop('cedar-beams', STORE[0] + 3, STORE[1], 1.2); prop('gold-silver-chest', STORE[0], STORE[1] - 3, 0.4); } }
    }
    if (zid === 'moab' && p.ch >= 5 && p.ch <= 7){   // 로드발 마길의 집 · 마하나임 · 에브라임 수풀(상수리나무)
      needProps(['oak-tree', 'mule', 'tent-small', 'tent-mid'], 'moab');
      house(LODEBAR[0], LODEBAR[1] - 1.6, 4, 3.2);
      if (p.ch === 7){ [[-4, -2], [4, -3], [-3, 4]].forEach(([dx, dz], i) => prop(i % 2 ? 'tent-small' : 'tent-mid', MAHANAIM[0] + dx, MAHANAIM[1] + dz, i)); house(MAHANAIM[0] + 6, MAHANAIM[1] - 4, 4.4, 3.4);
        [[0, 0, 0.3], [6, -3, 1.4], [-5, 2, 2.2], [3, 6, 0.9]].forEach(([dx, dz, r]) => prop('oak-tree', FOREST[0] + dx, FOREST[1] + dz, r)); prop('mule', FOREST[0] + 2.4, FOREST[1] + 2.4, 1.1);
        if (dustF) sprites(FOREST[0], FOREST[1], 8, 0xb8a890, 0.42, 4, 3, 2, 10); }
    }
    if (zid === 'gilgal' && p.ch === 8){   // 요단 나루의 나룻배(19:18)
      put(new THREE.BoxGeometry(2, 0.5, 5), M(0x7a5a38), FORD[0] + 7, 0.25, FORD[1]); put(new THREE.BoxGeometry(2.4, 0.2, 5.4), M(0x5a4028), FORD[0] + 7, 0.05, FORD[1]);
    }
    if (zid === 'bethlehem' && p.ch === 10){   // 블레셋 사람의 요새(23:14) · 성문 곁 우물
      needProps(['tent-small', 'tent-mid', 'well'], 'bethlehem');
      prop('well', BWELL[0], BWELL[1], 0); [[0, 0], [4, 3], [-3, 4]].forEach(([dx, dz], i) => prop(i % 2 ? 'tent-small' : 'tent-mid', PHILT[0] + dx, PHILT[1] + dz, i * 1.3));
    }
    api.zoneRoot.add(g); worldObj = g;
  }

  const T = n => `📜 다윗 왕 ${n}장`;
  return {
    id: 'david',
    chapters: [
      { title: `${T(1)} — 활 노래`, clearTitle: '🎉 8편 1장 「활 노래」 완료!', next: '2장: 헤브론에서 칠 년 육 개월',
        steps: [
          { id: 'd1s1', zone: 'philistia', obj: '사울의 진영에서 온 사람', where: '블레셋 평지 가운데 시글락(빛나는 곳)', point: 'dv_ziklag', dlg: 'dv_ziklag' },
          { id: 'd1s2', zone: 'philistia', obj: '활 노래', where: '시글락의 다윗', npc: 'dv_david1', game: 'lament', doneDlg: 'dv_lament_done', reward: { verse: '2sa1-23', clear: true } },
        ] },
      { title: `${T(2)} — 헤브론에서 칠 년 육 개월`, clearTitle: '🎉 8편 2장 「헤브론에서 칠 년 육 개월」 완료!', next: '3장: 만군의 하나님 여호와께서 함께 계시니',
        steps: [
          { id: 'd2s1', zone: 'philistia', obj: '"어디로 가리이까"', where: '시글락의 다윗', npc: 'dv_david_ask', dlg: 'dv_ask' },
          { id: 'd2s2', zone: 'hebron', obj: '유다 족속의 왕', where: '헤브론 산지 가운데 헤브론 성읍(빛나는 곳)', point: 'dv_hebron', dlg: 'dv_hebron' },
          { id: 'd2s3', zone: 'gibeon', obj: '기브온 못 가에서', where: '기브온 마을 서쪽 기브온 못(빛나는 곳)', point: 'dv_pool', dlg: 'dv_pool' },
          { id: 'd2s4', zone: 'hebron', obj: '아브넬 앞에서 애도하라', where: '헤브론 성읍의 다윗', npc: 'dv_david_heb', dlg: 'dv_abner', reward: { verse: '2sa2-1', clear: true } },
        ] },
      { title: `${T(3)} — 만군의 하나님 여호와께서 함께 계시니`, clearTitle: '🎉 8편 3장 완료!', next: '4장: 여호와 앞에서 힘을 다하여',
        steps: [
          { id: 'd3s1', zone: 'hebron', obj: '"우리는 왕의 한 골육이니이다"', where: '헤브론 성읍의 장로들', npc: 'dv_tribes', dlg: 'dv_tribes' },
          { id: 'd3s2', zone: 'jerusalem', obj: '시온 산성 곧 다윗 성', where: '예루살렘 남문 안(빛나는 곳)', point: 'dv_zion', dlg: 'dv_zion' },
          { id: 'd3s3', zone: 'jerusalem', obj: '르바임 골짜기에 가득한지라', where: '예루살렘 서쪽 르바임 골짜기(빛나는 곳)', point: 'dv_rephaim', dlg: 'dv_rephaim' },
          { id: 'd3s4', zone: 'jerusalem', obj: '뽕나무 꼭대기의 걸음 소리', where: '골짜기 서쪽 뽕나무 수풀 맞은편(빛나는 곳)', point: 'dv_mulb', game: 'wait', doneDlg: 'dv_wait_done', reward: { verse: '2sa5-10', clear: true } },
        ] },
      { title: `${T(4)} — 여호와 앞에서 힘을 다하여`, clearTitle: '🎉 8편 1부 「왕이 된 다윗」을 마쳤어요!', next: '5장: 네 왕위가 영원히 견고하리라',
        steps: [
          { id: 'd4s1', zone: 'gibeon', obj: '하나님의 궤를 새 수레에 싣고', where: '기브온 마을 북동쪽 기럇여아림(빛나는 곳)', point: 'dv_kirjath', dlg: 'dv_cart' },
          { id: 'd4s2', zone: 'gibeon', obj: '나곤의 타작 마당', where: '기럇여아림 남쪽 타작 마당(빛나는 곳)', point: 'dv_nacon', dlg: 'dv_uzzah' },
          { id: 'd4s3', zone: 'gibeon', obj: '오벧에돔의 집에 석 달', where: '기브온 마을 남쪽 오벧에돔의 집(빛나는 곳)', point: 'dv_obed', dlg: 'dv_obed' },
          { id: 'd4s4', zone: 'jerusalem', obj: '여섯 걸음을 가매', where: '예루살렘 남서쪽 길(빛나는 곳)', point: 'dv_march', game: 'march', doneDlg: 'dv_march_done', reward: { verse: '2sa6-14', clear: true } },
        ] },
      { title: `${T(5)} — 네 왕위가 영원히 견고하리라`, clearTitle: '🎉 8편 5장 완료!', next: '6장: 항상 내 상에서 떡을 먹을지니라',
        steps: [
          { id: 'd5s1', zone: 'jerusalem', obj: '"나는 백향목 궁에 살거늘"', where: '예루살렘 백향목 궁 앞의 다윗', npc: 'dv_david5', dlg: 'dv_cedar' },
          { id: 'd5s2', zone: 'jerusalem', obj: '여호와의 말씀이 나단에게', where: '백향목 궁 앞의 나단', npc: 'dv_nathan5', dlg: 'dv_covenant' },
          { id: 'd5s3', zone: 'jerusalem', obj: '"나는 누구이오며"', where: '궤를 둔 장막 앞(빛나는 곳)', point: 'dv_pray', game: 'pray', doneDlg: 'dv_pray_done', reward: { verse: '2sa7-16', clear: true } },
        ] },
      { title: `${T(6)} — 항상 내 상에서 떡을 먹을지니라`, clearTitle: '🎉 8편 2부 「영원한 언약과 은총」을 마쳤어요!', next: '7장: 당신이 그 사람이라',
        steps: [
          { id: 'd6s1', zone: 'jerusalem', obj: '사울의 집에 아직도 남은 사람이 있느냐', where: '백향목 궁 앞의 다윗', npc: 'dv_david6', dlg: 'dv_kindness' },
          { id: 'd6s2', zone: 'moab', obj: '로드발 마길의 집', where: '요단 동편 모압 평지 로드발(빛나는 곳)', point: 'dv_lodebar', dlg: 'dv_lodebar' },
          { id: 'd6s3', zone: 'jerusalem', obj: '"무서워하지 말라"', where: '백향목 궁 앞의 므비보셋', npc: 'dv_meph', dlg: 'dv_table' },
          { id: 'd6s4', zone: 'jerusalem', obj: '왕자 중 하나처럼', where: '왕의 상(빛나는 곳)', point: 'dv_ktable', game: 'table', doneDlg: 'dv_table_done', reward: { verse: '2sa9-7', clear: true } },
        ] },
      { title: `${T(7)} — 당신이 그 사람이라`, clearTitle: '🎉 8편 7장 「당신이 그 사람이라」 완료!', next: '8장: 내 아들 압살롬아',
        steps: [
          { id: 'd7s1', zone: 'jerusalem', obj: '다윗이 행한 그 일', where: '백향목 궁(빛나는 곳)', point: 'dv_roof', dlg: 'dv_sin' },
          { id: 'd7s2', zone: 'jerusalem', obj: '"한 성읍에 두 사람이 있는데"', where: '백향목 궁 앞의 나단', npc: 'dv_nathan7', dlg: 'dv_parable' },
          { id: 'd7s3', zone: 'jerusalem', obj: '작은 암양 새끼 한 마리뿐이라', where: '성 안 동쪽 가난한 사람의 집(빛나는 곳)', point: 'dv_lamb', game: 'lamb' },
          { id: 'd7s4', zone: 'jerusalem', obj: '"당신이 그 사람이라"', where: '백향목 궁 앞의 나단', npc: 'dv_nathan7', dlg: 'dv_judge' },
          { id: 'd7s5', zone: 'jerusalem', obj: '정한 마음을 창조하시고', where: '궤를 둔 장막 앞(빛나는 곳)', point: 'dv_psalm', game: 'psalm', doneDlg: 'dv_child', reward: { verse: ['2sa12-13', 'psa51-10'], clear: true } },
        ] },
      { title: `${T(8)} — 내 아들 압살롬아`, clearTitle: '🎉 8편 8장 「내 아들 압살롬아」 완료!', next: '9장: 요단을 건너 돌아오는 왕',
        steps: [
          { id: 'd8s1', zone: 'jerusalem', obj: '이스라엘의 인심이 다 압살롬에게로', where: '백향목 궁 앞의 전령', npc: 'dv_msg8', dlg: 'dv_heart' },
          { id: 'd8s2', zone: 'jerusalem', obj: '"사나 죽으나 종도 그 곳에"', where: '동문 밖의 잇대', npc: 'dv_ittai', dlg: 'dv_ittai' },
          { id: 'd8s3', zone: 'jerusalem', obj: '하나님의 궤를 성읍으로 도로', where: '동문 밖 궤를 멘 레위 사람', npc: 'dv_zadok', dlg: 'dv_ark_back' },
          { id: 'd8s4', zone: 'jerusalem', obj: '감람 산 길로 올라갈 때에', where: '동쪽 감람 산 길(빛나는 곳)', point: 'dv_olives', game: 'climb', doneDlg: 'dv_olives_done' },
          { id: 'd8s5', zone: 'jerusalem', obj: '바후림의 시므이', where: '감람 산 너머 바후림(빛나는 곳)', point: 'dv_bahurim', dlg: 'dv_shimei' },
          { id: 'd8s6', zone: 'jerusalem', obj: '"그가 저주하게 버려두라"', where: '바후림의 산비탈(빛나는 곳)', point: 'dv_bahurim', game: 'stones', doneDlg: 'dv_shimei_done' },
          { id: 'd8s7', zone: 'moab', obj: '다윗이 마하나임에 이르렀을 때에', where: '요단 동편 모압 평지 마하나임(빛나는 곳)', point: 'dv_mahanaim', dlg: 'dv_mahanaim' },
          { id: 'd8s8', zone: 'moab', obj: '"내 아들 압살롬아"', where: '남쪽 에브라임 수풀 — 멀리서(빛나는 곳)', point: 'dv_forest', dlg: 'dv_forest', reward: { verse: '2sa15-25', clear: true } },
        ] },
      { title: `${T(9)} — 요단을 건너 돌아오는 왕`, clearTitle: '🎉 8편 3부 「죄와 회개, 그리고 눈물」을 마쳤어요!', next: '10장: 여호와는 나의 반석이시요',
        steps: [
          { id: 'd9s1', zone: 'gilgal', obj: '왕이 돌아와 요단에 이르매', where: '길갈 동쪽 요단 나루(빛나는 곳)', point: 'dv_ford', dlg: 'dv_jordan' },
          { id: 'd9s2', zone: 'gilgal', obj: '"내게 죄를 돌리지 마옵소서"', where: '나루의 시므이', npc: 'dv_shimei9', dlg: 'dv_shimei2' },
          { id: 'd9s3', zone: 'gilgal', obj: '"평안히 왕궁에 돌아오시게 되었으니"', where: '나루의 므비보셋', npc: 'dv_meph9', dlg: 'dv_mephib2' },
          { id: 'd9s4', zone: 'gilgal', obj: '바르실래는 매우 늙어', where: '나루의 바르실래', npc: 'dv_barz9', dlg: 'dv_barzillai', reward: { verse: '2sa19-23', clear: true } },
        ] },
      { title: `${T(10)} — 여호와는 나의 반석이시요`, clearTitle: '🎉 8편 10장 완료!', next: '11장: 목숨을 걸고 갔던 사람들',
        steps: [
          { id: 'd10s1', zone: 'jerusalem', obj: '다윗의 노래', where: '예루살렘 북문의 망대(빛나는 곳)', point: 'dv_rock', game: 'words', doneDlg: 'dv_rock_done', reward: { verse: '2sa22-2', clear: true } },
        ] },
      { title: `${T(11)} — 목숨을 걸고 갔던 사람들`, clearTitle: '🎉 8편 11장 완료!', next: '12장: 값 없이는 드리지 아니하리라',
        steps: [
          { id: 'd11s1', zone: 'judah', obj: '"누가 내게 마시게 할까"', where: '유다 광야 서쪽 아둘람 굴(빛나는 곳)', point: 'dv_adullam', dlg: 'dv_last' },
          { id: 'd11s2', zone: 'bethlehem', obj: '베들레헴 성문 곁 우물', where: '베들레헴 성문 곁 우물(빛나는 곳)', point: 'dv_bwell', game: 'sneak', doneDlg: 'dv_well' },
          { id: 'd11s3', zone: 'judah', obj: '그 물을 여호와께 부어 드리며', where: '아둘람 굴(빛나는 곳)', point: 'dv_adullam', dlg: 'dv_well_done' },
          { id: 'd11s4', zone: 'judah', obj: '다윗의 용사들', where: '아둘람 굴의 브나야', npc: 'dv_benaiah', dlg: 'dv_heroes', reward: { verse: '2sa23-17', clear: true } },
        ] },
      { title: `${T(12)} — 값 없이는 드리지 아니하리라`, clearTitle: '🎉 8편 12장 완료!', next: '13장: 모든 것이 주께로 말미암았사오니',
        steps: [
          { id: 'd12s1', zone: 'jerusalem', obj: '"내가 고통 중에 있도다"', where: '백향목 궁 앞의 다윗', npc: 'dv_david12', dlg: 'dv_census' },
          { id: 'd12s2', zone: 'jerusalem', obj: '"족하다 이제는 네 손을 거두라"', where: '북문 밖 모리아로 가는 길(빛나는 곳)', point: 'dv_angel', dlg: 'dv_plague' },
          { id: 'd12s3', zone: 'jerusalem', obj: '"어찌하여 내 주 왕께서 종에게 임하시나이까"', where: '모리아의 아라우나', npc: 'dv_araunah', dlg: 'dv_araunah' },
          { id: 'd12s4', zone: 'jerusalem', obj: '은 오십 세겔', where: '아라우나의 타작 마당(빛나는 곳)', point: 'dv_floor', game: 'silver', doneDlg: 'dv_price_done', reward: { verse: '2sa24-24', clear: true } },
        ] },
      { title: `${T(13)} — 모든 것이 주께로 말미암았사오니`, clearTitle: '🎉 8편 「다윗 왕」을 모두 마쳤어요! 여덟 번째 받침대에 다윗의 수금이 놓여요', next: '두루마리마을 기념 전시관에서 여덟 번째 받침대를 보아요',
        steps: [
          { id: 'd13s1', zone: 'jerusalem', obj: '"내가 이제 그것을 위하여 준비하리라"', where: '백향목 궁 앞의 늙은 다윗', npc: 'dv_david13', dlg: 'dv_prepare' },
          { id: 'd13s2', zone: 'jerusalem', obj: '성전 재료', where: '성 안 큰길 곁 재료 더미(빛나는 곳)', point: 'dv_store', game: 'gather', doneDlg: 'dv_prepare_done' },
          { id: 'd13s3', zone: 'jerusalem', obj: '설계도를 솔로몬에게', where: '모리아의 솔로몬', npc: 'dv_solomon', dlg: 'dv_plan' },
          { id: 'd13s4', zone: 'jerusalem', obj: '"누가 즐거이 손에 채워 여호와께 드리겠느냐"', where: '모리아의 다윗', npc: 'dv_david13m', dlg: 'dv_offering' },
          { id: 'd13s5', zone: 'jerusalem', obj: '다윗의 감사 기도', where: '모리아 온 회중 앞(빛나는 곳)', point: 'dv_thanks', game: 'thanks', doneDlg: 'dv_thanks', reward: { verse: ['1ch29-14', '2sa22-2'], clear: true } },
        ] },
    ],
    games: { lament: lamentGame, wait: waitGame, march: marchGame, pray: prayGame, table: tableGame, lamb: lambGame, psalm: psalmGame, climb: climbGame, stones: stonesGame, words: wordsGame, sneak: sneakGame, silver: silverGame, gather: gatherGame, thanks: thanksGame },
    events: { cart: cartEv, stopCart, arkIn, gemSolomon, dustForest, angelStop, harpDone },
    world: zid => world(zid),
  };
});
