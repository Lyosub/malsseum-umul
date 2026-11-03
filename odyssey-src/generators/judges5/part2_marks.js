
  // ── 2부(5~7장) 자리 ──
  // 이스르엘 골짜기: 오브라의 상수리나무·포도주 틀·바위(서쪽 가운데), 바알의 제단, 타작마당, 하롯 샘(남쪽), 미디안 진영(북서쪽 모레 산 앞 골짜기)
  const OAK = [-8, -8], PRESS = [-5, -6], ROCK = [-11, -11], BAAL = [-17, -15], TOWN = [-13, -3], HORN2 = [0, -4], FLOOR = [-12, 7], HAROD = [6, 22], CAMPM = [-12, -30], DREAM = [-6, -24];
  // 모압 평지 = 요단 동편 길르앗: 미스바의 진·입다의 집, 동쪽 돕 땅, 서쪽 요단 나루턱
  const MINOR1 = [-20, 10], AGAIN = [0, 6], MIZ = [8, 20], TOB = [30, -24], JHOUSE = [16, 28], FORD2 = [-34, -12];
  // 4장: 0 미디안의 일곱 해 · 1 기드온을 부르심 · 2 바위 위의 예물 · 3 바알의 제단 · 4 아침의 성읍 · 5 나팔 · 6 양털
  // 5장: 0 하롯 샘 · 1 물 가 · 2 밤에 내려감 · 3 보리떡 꿈 · 4 항아리와 횃불 · 5 그 뒤
  // 6장: 0 돌라와 야일 · 1 다시 악을 행함 · 2 미스바 · 3 돕 땅의 입다 · 4 암몬 왕에게 · 5 서원 · 6 입다의 집 · 7 요단 나루턱 · 8 입산·엘론·압돈
  let offerShow = false, baalShow = false, routShow = false;
  Object.assign(CONDS, {
    jgMidian: at(4, 0, 0), jgGideon: at(4, 1, 2), jgRock: at(4, 2, 2), jgBaal: at(4, 3, 3), jgTown: at(4, 4, 4), jgHorn2: at(4, 5, 5), jgFloor: at(4, 6, 6),
    jgHarod: at(5, 0, 1), jgGideon5: () => at(5, 0, 1)() || at(5, 4, 5)(), jgNight: at(5, 2, 2), jgDream: at(5, 3, 3), jgPurah: at(5, 2, 3), jgAfter: at(5, 5, 5),
    jgMinor1: at(6, 0, 0), jgAgain: at(6, 1, 1), jgMiz: at(6, 2, 2), jgTob: at(6, 3, 4), jgVow: at(6, 5, 5), jgHouse: at(6, 6, 6), jgFord2: at(6, 7, 7), jgMinor2: at(6, 8, 8),
  });
  const ZM = ZONES.moab.points;
  ZJ.push({ id: 'jg_midian', x: HORN2[0] + 6, z: HORN2[1] + 10, type: 'lore', title: '미디안의 일곱 해', cond: 'jgMidian', body: '' });
  ZJ.push({ id: 'jg_gideon', x: PRESS[0] + 1.2, z: PRESS[1] + 0.6, type: 'villager', title: '기드온', model: 'j5-gideon', persona: 'rs_static', cond: 'jgGideon', body: '' });
  ZJ.push({ id: 'jg_rock', x: ROCK[0] + 1.6, z: ROCK[1] + 1.6, type: 'lore', title: '상수리나무 아래 바위', cond: 'jgRock', body: '' });
  ZJ.push({ id: 'jg_baal', x: BAAL[0] + 2, z: BAAL[1] + 2, type: 'lore', title: '바알의 제단', cond: 'jgBaal', body: '' });
  ZJ.push({ id: 'jg_town', x: TOWN[0], z: TOWN[1], type: 'lore', title: '오브라 성읍 — 아침', cond: 'jgTown', body: '' });
  ZJ.push({ id: 'jg_horn2', x: HORN2[0], z: HORN2[1], type: 'lore', title: '나팔을 불매', cond: 'jgHorn2', body: '' });
  ZJ.push({ id: 'jg_floor', x: FLOOR[0], z: FLOOR[1], type: 'lore', title: '타작마당', cond: 'jgFloor', body: '' });
  ZJ.push({ id: 'jg_harod', x: HAROD[0] - 2.4, z: HAROD[1] - 2.4, type: 'lore', title: '하롯 샘', cond: 'jgHarod', body: '' });
  ZJ.push({ id: 'jg_gideon5', x: HAROD[0] + 2.6, z: HAROD[1] - 3, type: 'villager', title: '기드온', model: 'j5-gideon', persona: 'rs_static', cond: 'jgGideon5', body: '' });
  ZJ.push({ id: 'jg_night', x: CAMPM[0] + 10, z: CAMPM[1] + 8, type: 'lore', title: '미디안 진영 근처 — 밤', cond: 'jgNight', body: '' });
  ZJ.push({ id: 'jg_purah', x: CAMPM[0] + 11.5, z: CAMPM[1] + 9.5, type: 'villager', title: '부라', model: 'j5-purah', persona: 'rs_static', cond: 'jgPurah', body: '' });
  ZJ.push({ id: 'jg_dream', x: DREAM[0], z: DREAM[1], type: 'lore', title: '진영 가장자리의 장막', cond: 'jgDream', body: '' });
  ZJ.push({ id: 'jg_dreamer', x: DREAM[0] - 1.6, z: DREAM[1] - 1.2, type: 'villager', title: '미디안 사람', model: 'j5-midianite', persona: 'rs_static', cond: 'jgDream', body: '' });
  ZJ.push({ id: 'jg_after', x: HAROD[0] - 3, z: HAROD[1] + 3, type: 'lore', title: '그 뒤 — 사십 년', cond: 'jgAfter', body: '' });
  ZM.push({ id: 'jg_minor1', x: MINOR1[0], z: MINOR1[1], type: 'lore', title: '돌라와 야일', cond: 'jgMinor1', body: '' });
  ZM.push({ id: 'jg_again', x: AGAIN[0], z: AGAIN[1], type: 'lore', title: '다시 악을 행하여', cond: 'jgAgain', body: '' });
  ZM.push({ id: 'jg_miz', x: MIZ[0], z: MIZ[1], type: 'lore', title: '미스바의 진', cond: 'jgMiz', body: '' });
  ZM.push({ id: 'jg_jephthah', x: TOB[0], z: TOB[1], type: 'villager', title: '입다', model: 'j5-jephthah', persona: 'rs_static', cond: 'jgTob', body: '' });
  ZM.push({ id: 'jg_vow', x: MIZ[0] + 4, z: MIZ[1] - 3, type: 'lore', title: '길르앗의 미스베', cond: 'jgVow', body: '' });
  ZM.push({ id: 'jg_house', x: JHOUSE[0] - 3, z: JHOUSE[1] - 2, type: 'lore', title: '미스바의 입다의 집', cond: 'jgHouse', body: '' });
  ZM.push({ id: 'jg_ford2', x: FORD2[0], z: FORD2[1], type: 'lore', title: '요단 강 나루턱', cond: 'jgFord2', body: '' });
  ZM.push({ id: 'jg_minor2', x: MIZ[0] - 3, z: MIZ[1] + 3, type: 'lore', title: '입산 · 엘론 · 압돈', cond: 'jgMinor2', body: '' });
