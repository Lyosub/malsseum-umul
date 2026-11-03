  // ── 3부(9~13장) 자리 ──
  // 길갈: 진영 어귀의 기브온 사람들 · 서쪽 길 어귀(밤길) · 갈렙
  const GIBEONITES_G = [24, 4], ROAD10 = [-36, -10], CALEB_G = [24, -1];
  // 기브온과 아얄론: 기브온 성(가운데) · 다섯 왕의 진(서쪽) · 아얄론 골짜기(북서쪽, 달) · 벧호론 비탈(남서쪽) · 막게다의 굴(남쪽) · 남쪽 길
  const GB = [-4, -4], GBR = 8, GBGATE = [6, -4], KCAMP = [-30, 6], AIJALON = [-40, 18], SLOPE = [-18, 20], CAVE = [10, 32], SOUTH10 = [18, 6];
  // 헤브론 산지: 산지 길 어귀 · 언덕 위(갈렙) · 기럇 아르바 성
  const TRAIL = [0, -14], HTOP = [0, -2], HB = [-4, 14], HBR = 8;
  // 실로와 세겜: 회막(엔진, x -10~0 · z -15) · 회막 앞 · 땅 그림 · 슬로브핫의 딸들 · 요단 언덕 가 제단(동쪽) · 세겜 상수리나무 · 요셉의 뼈를 장사한 밭
  const TENT_S = [16, -15], JOSH_S = [17, -10], MAP_S = [18, -4], DAUGHT_S = [-14, 2], ED = [34, -24], EAST_S = [31, -20], OAK = [26, 16], JOSH_SH = [21, 12], FIELD = [20, 30];
  // 단계 번호 — 8장(9장): 0 소문 · 1 진영 어귀의 나그네(증거 대조) · 2 사흘 뒤 · 3 기브온으로 · 4 기브온 성문 · 5 나무 패며 물 긷는 자
  // 9장(10장): 0 다섯 왕의 진 · 1 길갈로 · 2 기브온의 부탁 · 3 밤새도록(밤길) · 4 기브온으로 · 5 벧호론 비탈과 우박 · 6 해와 달 · 7 막게다의 굴 · 8 남쪽 성읍들
  // 10장(11장): 0 길갈로 · 1 북쪽 왕들 · 2 갈렙의 말(차례) · 3 헤브론으로 · 4 산지 길 · 5 헤브론
  // 11장(12장): 0 길갈로 · 1 남은 땅 · 2 실로로 · 3 회막 앞(제비) · 4 슬로브핫의 딸들 · 5 도피성 · 6 선한 말씀
  // 12장(13장): 0 동편 지파를 보냄 · 1 요단 언덕 가 제단 · 2 양쪽의 말 · 3 여호수아의 마지막 권면 · 4 세겜에 모임 · 5 언약 · 6 여호수아의 죽음
  let kingsShow = false, hailShow = false, sunShow = false, caveShow = false, edShow = false, stoneShow = false;
  const joshuaGone = from(12, 6);
  Object.assign(CONDS, {
    j4gilgal: () => from(3)() && !joshuaGone(),
    j9meet: at(8, 1, 1), j9gate: at(8, 4, 4), j9why: at(8, 5, 5),
    j10camp: at(9, 0, 0), j10road: at(9, 3, 3), j10slope: at(9, 5, 5), j10sky: at(9, 6, 6), j10cave: at(9, 7, 7), j10south: at(9, 8, 8),
    j11caleb: at(10, 2, 2), j11trail: at(10, 4, 4), j11calebH: at(10, 4, 5),
    j12tent: () => at(11, 3, 3)() || at(11, 6, 6)(), j12daughters: at(11, 4, 4), j12map: at(11, 5, 5),
    j13joshuaS: () => at(12, 0, 0)() || at(12, 3, 3)(), j13altar: at(12, 1, 1), j13east: at(12, 2, 2), j13oak: at(12, 4, 4), j13joshuaSh: at(12, 5, 5), j13field: at(12, 6, 6),
  });
  ZG.push({ id: 'j9_gibeonites', x: GIBEONITES_G[0], z: GIBEONITES_G[1], type: 'villager', title: '먼 나라에서 왔다는 나그네들', model: 'merchant', persona: 'rs_static', cond: 'j9meet', body: '' });
  ZG.push({ id: 'j10_road', x: ROAD10[0], z: ROAD10[1], type: 'lore', title: '서쪽 길 어귀 — 기브온으로 오르는 밤길', cond: 'j10road', body: '' });
  ZG.push({ id: 'j11_caleb', x: CALEB_G[0], z: CALEB_G[1], type: 'villager', title: '갈렙', model: 'he-father', persona: 'rs_static', cond: 'j11caleb', body: '' });
  const ZB = ZONES.gibeon.points, ZH = ZONES.hebron.points, ZS = ZONES.shiloh.points;
  ZB.push({ id: 'j9_gate', x: GBGATE[0], z: GBGATE[1], type: 'lore', title: '기브온 성문 앞', cond: 'j9gate', body: '' });
  ZB.push({ id: 'j9_gibeonites2', x: GBGATE[0] + 2, z: GBGATE[1] + 3, type: 'villager', title: '기브온 사람들', model: 'merchant', persona: 'rs_static', cond: 'j9why', body: '' });
  ZB.push({ id: 'j9_joshua_b', x: GBGATE[0] + 4, z: GBGATE[1] - 2, type: 'villager', title: '여호수아', model: 'joshua', persona: 'rs_static', cond: 'j9why', body: '' });
  ZB.push({ id: 'j10_camp', x: KCAMP[0] + 8, z: KCAMP[1], type: 'lore', title: '기브온 서쪽 — 다섯 왕의 진', cond: 'j10camp', body: '' });
  ZB.push({ id: 'j10_slope', x: SLOPE[0], z: SLOPE[1], type: 'lore', title: '벧호론에 올라가는 비탈', cond: 'j10slope', body: '' });
  ZB.push({ id: 'j10_sky', x: GBGATE[0] + 1, z: GBGATE[1] + 1, type: 'lore', title: '기브온 성 앞 — 해를 보는 곳', cond: 'j10sky', body: '' });
  ZB.push({ id: 'j10_cave', x: CAVE[0] - 4, z: CAVE[1] - 4, type: 'lore', title: '막게다의 굴 어귀', cond: 'j10cave', body: '' });
  ZB.push({ id: 'j10_south', x: SOUTH10[0], z: SOUTH10[1], type: 'lore', title: '남쪽 성읍들로 가는 길', cond: 'j10south', body: '' });
  ZH.push({ id: 'j11_trail', x: TRAIL[0], z: TRAIL[1], type: 'lore', title: '헤브론 산지로 오르는 길', cond: 'j11trail', body: '' });
  ZH.push({ id: 'j11_caleb_h', x: HTOP[0], z: HTOP[1], type: 'villager', title: '갈렙', model: 'he-father', persona: 'rs_static', cond: 'j11calebH', body: '' });
  ZS.push({ id: 'j12_tent', x: TENT_S[0], z: TENT_S[1], type: 'lore', title: '실로 — 회막 앞', cond: 'j12tent', body: '' });
  ZS.push({ id: 'j12_joshua_s', x: JOSH_S[0], z: JOSH_S[1], type: 'villager', title: '여호수아', model: 'joshua', persona: 'rs_static', cond: 'j12tent', body: '' });
  ZS.push({ id: 'j12_daughters', x: DAUGHT_S[0], z: DAUGHT_S[1], type: 'villager', title: '슬로브핫의 딸들', model: 'he-girl-hb', persona: 'rs_static', cond: 'j12daughters', body: '' });
  ZS.push({ id: 'j12_map', x: MAP_S[0], z: MAP_S[1], type: 'lore', title: '회막 곁 — 그려 온 땅', cond: 'j12map', body: '' });
  ZS.push({ id: 'j13_joshua_s', x: JOSH_S[0], z: JOSH_S[1], type: 'villager', title: '여호수아', model: 'joshua', persona: 'rs_static', cond: 'j13joshuaS', body: '' });
  ZS.push({ id: 'j13_altar', x: ED[0] - 3, z: ED[1] + 1, type: 'lore', title: '요단 언덕 가 — 보기에 큰 제단', cond: 'j13altar', body: '' });
  ZS.push({ id: 'j13_east', x: EAST_S[0], z: EAST_S[1], type: 'villager', title: '르우벤·갓·므낫세 반 지파', model: 'ca-israel-elder', persona: 'rs_static', cond: 'j13east', body: '' });
  ZS.push({ id: 'j13_envoys', x: EAST_S[0] - 3, z: EAST_S[1] - 2, type: 'villager', title: '비느하스와 열 지도자', model: 'he-levite', persona: 'rs_static', cond: 'j13east', body: '' });
  ZS.push({ id: 'j13_oak', x: OAK[0], z: OAK[1] + 3, type: 'lore', title: '세겜 — 성소 곁 상수리나무 아래', cond: 'j13oak', body: '' });
  ZS.push({ id: 'j13_joshua_sh', x: JOSH_SH[0], z: JOSH_SH[1], type: 'villager', title: '여호수아', model: 'joshua', persona: 'rs_static', cond: 'j13joshuaSh', body: '' });
  ZS.push({ id: 'j13_field', x: FIELD[0], z: FIELD[1], type: 'lore', title: '세겜 — 야곱이 산 밭', cond: 'j13field', body: '' });
