
  // ── 3부(8~10장 삼손) 자리 — 새 마을 블레셋 평지: 동쪽 언덕 소라, 가운데 딤나와 포도원, 남동쪽 에담 바위·레히, 서쪽 바닷가 가사와 다곤의 집 ──
  const ZORAH = [28, -22], MWIFE = [24, -18], MFIELD = [20, -26], ALTAR13 = [32, -28], MAHANEH = [30, -8];
  const TIMNAH = [0, -12], VINE = [10, -2], FEAST = [-4, -16], FIELDS_P = [-8, 16], ETAM = [26, 26], LEHI = [18, 18], SPRING = [14, 30];
  const GAZA = [-28, 2], SOREK = [8, 14], MILL = [-30, 10], TEMPLE = [-30, -22];
  // 4부(11~12장) — 실로(에브라임 산지)의 미가의 집, 기브온 마을(베냐민 땅 — 미스바·벧엘·기브아)
  const MICAH_H = [-14, 30], DANROAD = [-30, 14], MIZ20 = [10, 20], BETHEL_G = [-18, -24], GIBEAH = [-30, 6], RIMMON = [20, -30], ENDP = [0, 0];
  // 7장: 0 소라 · 1 마노아의 아내 · 2 마노아 · 3 나실인 · 4 바위 위의 제단 · 5 마하네단
  // 8장: 0 삼손 · 1 딤나의 포도원 · 2 꿀 · 3 잔치와 수수께끼 · 4 곡식 밭 · 5 에담 바위 · 6 레히 · 7 엔학고레
  // 9장: 0 가사 · 1 소렉 골짜기 · 2 세 번의 거짓말 · 3 맷돌 · 4 다곤의 집 · 5 마지막 기도
  // 10장: 0 미가 · 1 레위 청년 · 2 단 지파 다섯 사람 · 3 육백 명 · 4 뒤쫓아 온 미가
  // 11장: 0 미스바 · 1 벧엘 · 2 연기 기둥 · 3 울며 · 4 사사 열두 명
  let flameShow = false, gateGone = false, templeDown = false, smokeShow = false;
  Object.assign(CONDS, {
    jgZorah: at(7, 0, 0), jgMwife: at(7, 1, 1), jgManoah: at(7, 1, 5), jgAltar13: at(7, 4, 4), jgMahaneh: at(7, 5, 5),
    jgSamsonHome: at(8, 0, 0), jgVine: at(8, 1, 1), jgHoney: at(8, 2, 2), jgFeast: at(8, 3, 3), jgFields: at(8, 4, 4), jgEtam: at(8, 5, 5), jgLehi: at(8, 6, 6), jgSpring: at(8, 7, 7),
    jgGaza: at(9, 0, 0), jgLords: at(9, 1, 1), jgDelilah: at(9, 1, 2), jgMill: at(9, 3, 3), jgTemple: at(9, 4, 5),
    jgMicahH: at(10, 0, 4), jgLevite: at(10, 1, 3), jgDanspy: at(10, 2, 3), jgDoor: at(10, 3, 3), jgMicah2: at(10, 4, 4),
    jgMiz20: at(11, 0, 0), jgBethel: at(11, 1, 1), jgSmoke: at(11, 2, 2), jgWeep: at(11, 3, 3), jgEnd: at(11, 4, 4),
  });
  const ZP = ZONES.philistia.points, ZB = ZONES.gibeon.points;
  ZP.push({ id: 'jg_zorah', x: ZORAH[0], z: ZORAH[1], type: 'lore', title: '소라 땅', cond: 'jgZorah', body: '' });
  ZP.push({ id: 'jg_mwife', x: MWIFE[0], z: MWIFE[1], type: 'villager', title: '마노아의 아내', model: 'j5-manoah-wife', persona: 'rs_static', cond: 'jgManoah', body: '' });
  ZP.push({ id: 'jg_manoah', x: MFIELD[0], z: MFIELD[1], type: 'villager', title: '마노아', model: 'j5-manoah', persona: 'rs_static', cond: 'jgManoah', body: '' });
  ZP.push({ id: 'jg_altar13', x: ALTAR13[0] - 2, z: ALTAR13[1] + 2, type: 'lore', title: '바위 위의 제단', cond: 'jgAltar13', body: '' });
  ZP.push({ id: 'jg_mahaneh', x: MAHANEH[0], z: MAHANEH[1], type: 'lore', title: '소라와 에스다올 사이 마하네단', cond: 'jgMahaneh', body: '' });
  ZP.push({ id: 'jg_samson', x: ZORAH[0] - 3, z: ZORAH[1] + 2, type: 'villager', title: '삼손', model: 'j5-samson', persona: 'rs_static', cond: 'jgSamsonHome', body: '' });
  ZP.push({ id: 'jg_vineyard', x: VINE[0], z: VINE[1], type: 'lore', title: '딤나의 포도원', cond: 'jgVine', body: '' });
  ZP.push({ id: 'jg_honey', x: VINE[0] + 2, z: VINE[1] + 2, type: 'lore', title: '사자의 주검 — 벌 떼와 꿀', cond: 'jgHoney', body: '' });
  ZP.push({ id: 'jg_feast', x: FEAST[0], z: FEAST[1], type: 'lore', title: '딤나의 잔칫집', cond: 'jgFeast', body: '' });
  ZP.push({ id: 'jg_fields', x: FIELDS_P[0], z: FIELDS_P[1], type: 'lore', title: '블레셋 사람들의 곡식 밭', cond: 'jgFields', body: '' });
  ZP.push({ id: 'jg_etam', x: ETAM[0] - 3, z: ETAM[1] - 3, type: 'lore', title: '에담 바위 틈', cond: 'jgEtam', body: '' });
  ZP.push({ id: 'jg_lehi', x: LEHI[0], z: LEHI[1], type: 'lore', title: '레히', cond: 'jgLehi', body: '' });
  ZP.push({ id: 'jg_spring', x: SPRING[0], z: SPRING[1], type: 'lore', title: '레히의 우묵한 곳', cond: 'jgSpring', body: '' });
  ZP.push({ id: 'jg_gaza', x: GAZA[0] + 5, z: GAZA[1], type: 'lore', title: '가사 성문', cond: 'jgGaza', body: '' });
  ZP.push({ id: 'jg_lords', x: SOREK[0] + 2.6, z: SOREK[1] + 1, type: 'villager', title: '블레셋 방백', model: 'j5-philistine-lord', persona: 'rs_static', cond: 'jgLords', body: '' });
  ZP.push({ id: 'jg_delilah', x: SOREK[0], z: SOREK[1], type: 'villager', title: '들릴라', model: 'j5-delilah', persona: 'rs_static', cond: 'jgDelilah', body: '' });
  ZP.push({ id: 'jg_mill', x: MILL[0] + 3, z: MILL[1], type: 'lore', title: '가사의 옥 — 맷돌', cond: 'jgMill', body: '' });
  ZP.push({ id: 'jg_temple', x: TEMPLE[0] + 6, z: TEMPLE[1] + 2, type: 'lore', title: '다곤의 집 — 두 기둥 사이', cond: 'jgTemple', body: '' });
  ZS.push({ id: 'jg_micah', x: MICAH_H[0] + 4, z: MICAH_H[1] - 1, type: 'villager', title: '미가', model: 'j5-micah', persona: 'rs_static', cond: 'jgMicahH', body: '' });
  ZS.push({ id: 'jg_levite', x: MICAH_H[0] + 3, z: MICAH_H[1] + 2.6, type: 'villager', title: '레위 청년', model: 'j5-levite-youth', persona: 'rs_static', cond: 'jgLevite', body: '' });
  ZS.push({ id: 'jg_danspy', x: DANROAD[0] + 3, z: DANROAD[1], type: 'villager', title: '단 지파 다섯 사람', model: 'j5-dan-spy', persona: 'rs_static', cond: 'jgDanspy', body: '' });
  ZS.push({ id: 'jg_door', x: MICAH_H[0] + 4.6, z: MICAH_H[1] + 1, type: 'lore', title: '미가의 집 문 입구', cond: 'jgDoor', body: '' });
  ZB.push({ id: 'jg_mizpah20', x: MIZ20[0], z: MIZ20[1], type: 'lore', title: '미스바 — 하나님 백성의 총회', cond: 'jgMiz20', body: '' });
  ZB.push({ id: 'jg_bethel', x: BETHEL_G[0], z: BETHEL_G[1], type: 'lore', title: '벧엘 — 여호와 앞에서', cond: 'jgBethel', body: '' });
  ZB.push({ id: 'jg_smoke', x: GIBEAH[0] + 12, z: GIBEAH[1], type: 'lore', title: '기브아를 멀리 바라보는 곳', cond: 'jgSmoke', body: '' });
  ZB.push({ id: 'jg_weep', x: BETHEL_G[0] + 3, z: BETHEL_G[1] + 3, type: 'lore', title: '벧엘 — 저녁까지 울며', cond: 'jgWeep', body: '' });
  ZB.push({ id: 'jg_end', x: ENDP[0], z: ENDP[1], type: 'lore', title: '그 때에 이스라엘에 왕이 없으므로', cond: 'jgEnd', body: '' });
  // 모압 평지(길르앗)에서 요단을 건너 길갈로 — 4편의 같은 이름 길은 4편에서만 보이므로 5편에서도 보이게(길 찾기 ROUTE가 'to-gilgal'을 씀)
  ZM.push({ id: 'to-gilgal', x: -36.5, z: 9, type: 'exit', title: '요단을 건너 길갈로', to: 'gilgal', spawn: [34, 2], cond: 'jgOn' });
