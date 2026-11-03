// 5편 「사사들과 함께」 — 사사기 1–21장(삿 19장은 뺌, 2026-10-25 전도사님 결정), 12장. 2026-10-25 1부(1~4장: 여호와를 알지 못하는 세대 · 옷니엘 · 왼손잡이 에훗 · 드보라와 바락, 야엘).
// 대사 원칙: 성경 인물은 개역개정에 있는 자기 말만, 해설은 원문 + (출처). 대사·구절 카드는 E:\temp\claude-work\judges5\gen_dlg.py가 bskorea 개역개정(GAE) 원문 파일에서 그대로 뽑는다.
// 무대: 4편 마을을 사사 시대에 맞게 바꿔 다시 쓴다 — 길갈과 여리고(1·3장: 보김, 무너진 성벽 곁 종려나무 성읍 삿 3:13), 헤브론 산지(2장: 드빌=기럇 세벨 삿 1:11),
//       실로와 세겜(4장: 드보라의 종려나무 삿 4:5 "라마와 벧엘 사이 에브라임 산지"), 새 마을 이스르엘 골짜기(4장: 다볼 산 · 기손 강 · 헤벨의 장막).
// 칼·말뚝 장면(삿 3:21 · 4:21)은 본문을 해설로 읽되 연출·버튼·보상으로 만들지 않는다. 삿 3:22은 읽지 않는다.
// 「사사 열두 명」 조각: 큰 사사는 장을 마치면, 작은 사사(삼갈 등)는 그 절이 있는 자리에서 줍는다(api.addJudge).
// 새 인물(옷니엘·악사·에훗·드보라·바락·야엘)은 GPT 12차 원화 → Meshy 모델이 오기 전까지 이미 있는 모델을 쓴다.
(window.__odyQ = window.__odyQ || []).push(api => {
  const { DLG, ZONES, CONDS, VERSES, THREE, SPEAKERS: { NAR } } = api;
  const ANGEL = { n: '여호와의 사자' }, EHUD = { n: '에훗' }, DEBORAH = { n: '드보라' }, SONG = { n: '드보라와 바락의 노래' };
  const cur = () => api.ST.cur === 'judges' && api.ST.sp.judges ? api.ST.sp.judges : null;
  const at = (ch, a = 0, b = 99) => () => { const p = cur(); return !!p && p.ch === ch && !p.cleared && p.step >= a && p.step <= b; };
  const from = (ch, s = 0) => () => { const p = cur(); return !!p && (p.ch > ch || (p.ch === ch && (p.cleared || p.step >= s))); };

  // ── 자리 ──
  // 길갈과 여리고(4편 마을): 여리고 성터는 서쪽(JC), 열두 돌은 길갈(MEMO), 요단 나루는 동쪽, 에브라임 산지는 북서쪽
  const JC = [-22, 6], JR = 10, MEMO = [14, 4], FORD = [35, -6], HILLS = [-26, -34];
  const ANGEL_G = [20, 12], BOCHIM = [-34, -18], CAMP_G = [8, 10], PALMS = [-22, 22], PALACE = [-22, 6], QUARRY = [12, -4], EHUD_G = [6, 14], SHAMGAR = [33, 8];
  // 헤브론 산지(4편 마을): 드빌(기럇 세벨)은 동쪽, 윗샘은 남동쪽 산기슭, 아랫샘은 골짜기, 남쪽 길 어귀
  const DEBIR = [18, 2], DEBR = 6, UPPER = [16, 24], LOWER = [-10, 0], CUSHAN = [0, 30];
  // 실로와 세겜(4편 마을): 드보라의 종려나무는 서북쪽
  const DEBP = [-22, -26];
  // 이스르엘 골짜기(새 마을): 다볼 산 북동쪽, 기손 강 서쪽, 헤벨의 장막 남서쪽
  const TABOR_FOOT = [16, -18], TABOR_UP = [22, -28], KISHON = [-30, -4], JAEL_T = [-24, 24];

  // 단계 번호(장 index · step index)
  // 0장: 0 길갈의 여호와의 사자 · 1 보김 · 2 다른 세대 · 3 되풀이(순환 고리)
  // 1장: 0 헤브론 산지로 · 1 갈렙과 기럇 세벨 · 2 악사 · 3 윗샘 · 4 아랫샘 · 5 구산 리사다임 · 6 옷니엘
  // 2장: 0 길갈로 · 1 종려나무 성읍 · 2 에훗과 공물 · 3 돌 뜨는 곳 · 4 왕의 다락방 · 5 에브라임 산지 나팔 · 6 요단 나루 · 7 삼갈
  // 3장: 0 실로로 · 1 드보라의 종려나무 · 2 바락 · 3 이스르엘 골짜기로 · 4 다볼 산 · 5 일어나라 · 6 야엘의 장막 · 7 드보라와 바락의 노래
  let kishonShow = false;
  const fled = () => from(3, 6)() || kishonShow;   // 4:15 뒤로 병거가 흩어짐
  Object.assign(CONDS, {
    jgOn: () => !!cur(),
    jgAngel: at(0, 0, 0), jgBochim: at(0, 1, 1), jgCamp: at(0, 2, 3),
    jgCaleb: at(1, 1, 2), jgAchsah: at(1, 1, 4), jgUpper: at(1, 3, 3), jgLower: at(1, 4, 4), jgCushan: at(1, 5, 5), jgOthniel: () => at(1, 1, 6)() && !at(1, 2, 4)() || at(1, 6, 6)(),
    jgPalms: at(2, 1, 1), jgEhud: at(2, 2, 2), jgQuarry: at(2, 3, 3), jgPalace: at(2, 4, 4), jgHorn: at(2, 5, 5), jgFord: at(2, 6, 6), jgShamgar: at(2, 7, 7),
    jgDeborah: at(3, 1, 2), jgBarak: at(3, 1, 2), jgTabor: at(3, 4, 4), jgRise: at(3, 5, 5), jgJael: at(3, 6, 6), jgSong: at(3, 7, 7), jgTaborFolk: from(3, 4),
  });
  const ZG = ZONES.gilgal.points, ZH = ZONES.hebron.points, ZS = ZONES.shiloh.points, ZJ = ZONES.jezreel.points;
  // 1장 — 길갈 · 보김
  ZG.push({ id: 'jg_angel', x: ANGEL_G[0], z: ANGEL_G[1], type: 'lore', title: '길갈 — 여호와의 사자', cond: 'jgAngel', body: '' });
  ZG.push({ id: 'jg_bochim', x: BOCHIM[0], z: BOCHIM[1], type: 'lore', title: '보김 — 백성이 운 곳', cond: 'jgBochim', body: '' });
  ZG.push({ id: 'jg_camp', x: CAMP_G[0], z: CAMP_G[1], type: 'lore', title: '길갈 진영 — 다른 세대', cond: 'jgCamp', body: '' });
  // 2장 — 헤브론 산지(드빌)
  ZH.push({ id: 'jg_caleb', x: DEBIR[0] - 7, z: DEBIR[1] - 3, type: 'villager', title: '갈렙', model: 'w3-caleb', persona: 'rs_static', cond: 'jgCaleb', body: '' });
  ZH.push({ id: 'jg_achsah', x: DEBIR[0] - 8.6, z: DEBIR[1] - 1, type: 'villager', title: '악사', model: 'w3-milcah', persona: 'rs_static', cond: 'jgAchsah', body: '' });
  ZH.push({ id: 'jg_othniel', x: DEBIR[0] - 6.4, z: DEBIR[1] + 1.4, type: 'villager', title: '옷니엘', model: 'j4-spy-1', persona: 'rs_static', cond: 'jgOthniel', body: '' });
  ZH.push({ id: 'jg_upper', x: UPPER[0], z: UPPER[1], type: 'lore', title: '윗샘', cond: 'jgUpper', body: '' });
  ZH.push({ id: 'jg_lower', x: LOWER[0], z: LOWER[1], type: 'lore', title: '아랫샘', cond: 'jgLower', body: '' });
  ZH.push({ id: 'jg_cushan', x: CUSHAN[0], z: CUSHAN[1], type: 'lore', title: '남쪽 길 어귀 — 여덟 해', cond: 'jgCushan', body: '' });
  // 3장 — 길갈 · 여리고 성터(종려나무 성읍)
  ZG.push({ id: 'jg_palms', x: PALMS[0], z: PALMS[1], type: 'lore', title: '종려나무 성읍', cond: 'jgPalms', body: '' });
  ZG.push({ id: 'jg_ehud', x: EHUD_G[0], z: EHUD_G[1], type: 'villager', title: '에훗', model: 'j4-spy-2', persona: 'rs_static', cond: 'jgEhud', body: '' });
  ZG.push({ id: 'jg_quarry', x: QUARRY[0], z: QUARRY[1], type: 'lore', title: '길갈 근처 돌 뜨는 곳', cond: 'jgQuarry', body: '' });
  ZG.push({ id: 'jg_palace', x: PALACE[0] + 5, z: PALACE[1], type: 'lore', title: '왕의 다락방', cond: 'jgPalace', body: '' });
  ZG.push({ id: 'jg_horn', x: HILLS[0], z: HILLS[1], type: 'lore', title: '에브라임 산지 — 나팔', cond: 'jgHorn', body: '' });
  ZG.push({ id: 'jg_ford', x: FORD[0], z: FORD[1], type: 'lore', title: '모압 맞은편 요단 강 나루', cond: 'jgFord', body: '' });
  ZG.push({ id: 'jg_shamgar', x: SHAMGAR[0], z: SHAMGAR[1], type: 'lore', title: '소 모는 막대기', cond: 'jgShamgar', body: '' });
  // 4장 — 실로(드보라의 종려나무) · 이스르엘 골짜기
  ZS.push({ id: 'jg_deborah', x: DEBP[0] + 1.6, z: DEBP[1] + 1.2, type: 'villager', title: '드보라', model: 'he-mother', persona: 'rs_static', cond: 'jgDeborah', body: '' });
  ZS.push({ id: 'jg_barak', x: DEBP[0] + 4.4, z: DEBP[1] + 2.4, type: 'villager', title: '바락', model: 'j4-east-tribes', persona: 'rs_static', cond: 'jgBarak', body: '' });
  ZJ.push({ id: 'jg_tabor', x: TABOR_UP[0], z: TABOR_UP[1], type: 'lore', title: '다볼 산', cond: 'jgTabor', body: '' });
  ZJ.push({ id: 'jg_deborah_t', x: TABOR_FOOT[0], z: TABOR_FOOT[1], type: 'villager', title: '드보라', model: 'he-mother', persona: 'rs_static', cond: 'jgTaborFolk', body: '' });
  ZJ.push({ id: 'jg_barak_t', x: TABOR_FOOT[0] + 2.4, z: TABOR_FOOT[1] + 1, type: 'villager', title: '바락', model: 'j4-east-tribes', persona: 'rs_static', cond: 'jgTaborFolk', body: '' });
  ZJ.push({ id: 'jg_jael', x: JAEL_T[0] + 3, z: JAEL_T[1], type: 'lore', title: '겐 사람 헤벨의 장막', cond: 'jgJael', body: '' });
  ZJ.push({ id: 'jg_song', x: TABOR_FOOT[0] - 3, z: TABOR_FOOT[1] + 3, type: 'lore', title: '다볼 산기슭 — 노래', cond: 'jgSong', body: '' });
