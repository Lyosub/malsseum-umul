    if (zid === 'philistia'){
      needProps(['env-date-palm', 'env-acacia', 'tent-small', 'lion', 'honeycomb', 'jawbone', 'pillar'], 'philistia');
      const wall = M(0xd8c4a0), roofM = M(0xb89a70), stone = M(0xcdb896);
      // 소라: 마노아의 집과 밭, 바위 위의 제단(13:19)
      put(new THREE.BoxGeometry(4, 2.6, 3.4), wall, ZORAH[0] + 3, 1.3, ZORAH[1] - 4); put(new THREE.BoxGeometry(4.4, 0.25, 3.8), roofM, ZORAH[0] + 3, 2.7, ZORAH[1] - 4); obst(ZORAH[0] + 3, ZORAH[1] - 4, 2.4);
      { const r = put(new THREE.DodecahedronGeometry(1, 0), M(0x9a8a72), ALTAR13[0], 0.55, ALTAR13[1]); r.scale.set(1.2, 0.7, 1.1); }
      if (flameShow) for (let i = 0; i < 6; i++){ const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: api.flameTex, color: i % 2 ? 0xffd27a : 0xff8a3a, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.9 })); s.position.set(ALTAR13[0] + (Math.random() - 0.5) * 0.6, api.heightAt(ALTAR13[0], ALTAR13[1]) + 1.4 + i * 0.7, ALTAR13[1]); s.scale.set(1.1, 1.8, 1); g.add(s); }
      // 딤나: 성읍 집들과 포도원(14:5)
      [[-4, -4], [3, -6], [-2, 4]].forEach(([dx, dz]) => { put(new THREE.BoxGeometry(3.4, 2.4, 3), wall, TIMNAH[0] + dx, 1.2, TIMNAH[1] + dz); obst(TIMNAH[0] + dx, TIMNAH[1] + dz, 2); });
      for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++){ const x = VINE[0] + 2 + i * 1.6, z = VINE[1] - 3 + j * 1.8; put(new THREE.CylinderGeometry(0.05, 0.06, 1.1, 5), M(0x7a5a3a), x, 0.55, z); put(new THREE.SphereGeometry(0.42, 7, 5), M(0x5f8a3a), x, 1.05, z); }
      if (p.ch === 8 && p.step === 1) prop('lion', VINE[0] - 3, VINE[1] + 2, 1.9);   // 젊은 사자가 소리 지르는 장면은 길가에 선 모습만
      if (p.ch === 8 && p.step === 2) prop('honeycomb', VINE[0] + 2, VINE[1] + 2, 0.4);
      // 블레셋 사람들의 곡식 밭(15:5) — 불탄 뒤로는 검게
      { const burnt = p.ch > 8 || (p.ch === 8 && p.step >= 5); for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++){ const x = FIELDS_P[0] - 4 + i * 2.6, z = FIELDS_P[1] - 2 + j * 2.4; put(new THREE.BoxGeometry(2.2, burnt ? 0.08 : 0.7, 2), M(burnt ? 0x3a3028 : 0xd9b44a), x, burnt ? 0.04 : 0.35, z); } }
      // 에담 바위 · 레히 · 엔학고레(15:8, 19)
      { const r = put(new THREE.DodecahedronGeometry(3.2, 0), M(0x9a8672), ETAM[0], 1.6, ETAM[1]); r.scale.set(1.3, 0.9, 1); obst(ETAM[0], ETAM[1], 3.4); }
      if (p.ch === 8 && p.step >= 6) prop('jawbone', LEHI[0] + 1, LEHI[1] + 1, 0.8);
      if (p.ch > 8 || (p.ch === 8 && (p.cleared || p.step >= 8))){ const w = new THREE.Mesh(new THREE.CircleGeometry(1.8, 20).rotateX(-Math.PI / 2), new THREE.MeshToonMaterial({ color: 0x4f9fb5, gradientMap: api.toonGradient, transparent: true, opacity: 0.85 })); w.position.set(SPRING[0], api.heightAt(SPRING[0], SPRING[1]) + 0.06, SPRING[1]); g.add(w); }
      // 가사: 성벽과 성문(16:3 — 문짝과 문설주를 빼어 간 뒤로는 빈 문)
      put(new THREE.BoxGeometry(1.4, 5, 10), stone, GAZA[0], 2.5, GAZA[1] - 7.2); put(new THREE.BoxGeometry(1.4, 5, 10), stone, GAZA[0], 2.5, GAZA[1] + 7.2); obst(GAZA[0], GAZA[1] - 7.2, 2.4); obst(GAZA[0], GAZA[1] + 7.2, 2.4);
      if (!(gateGone || p.ch > 9 || (p.ch === 9 && p.step >= 1))){ put(new THREE.BoxGeometry(0.4, 4, 4.2), M(0x7a5a3a), GAZA[0], 2, GAZA[1]); put(new THREE.BoxGeometry(1.4, 0.6, 4.6), stone, GAZA[0], 4.4, GAZA[1]); }
      // 소렉 골짜기 들릴라의 집 · 가사의 옥과 맷돌(16:21)
      put(new THREE.BoxGeometry(3.6, 2.4, 3.2), wall, SOREK[0] - 3.4, 1.2, SOREK[1] - 1); obst(SOREK[0] - 3.4, SOREK[1] - 1, 2.2);
      put(new THREE.CylinderGeometry(1, 1, 0.5, 14), M(0x8a8478), MILL[0], 0.25, MILL[1]);
      // 다곤의 집: 집을 버틴 두 기둥(16:29) — 무너진 뒤로는 돌무더기
      if (!(templeDown || p.ch > 9)){ prop('pillar', TEMPLE[0] - 1.6, TEMPLE[1], 0); prop('pillar', TEMPLE[0] + 1.6, TEMPLE[1], 0); put(new THREE.BoxGeometry(9, 0.6, 6), stone, TEMPLE[0], 4.5, TEMPLE[1]); put(new THREE.BoxGeometry(9, 4.2, 0.6), stone, TEMPLE[0], 2.1, TEMPLE[1] - 3); obst(TEMPLE[0], TEMPLE[1] - 3, 3); }
      else for (let i = 0; i < 16; i++){ const r = put(new THREE.DodecahedronGeometry(0.5 + Math.random() * 0.6), stone, TEMPLE[0] + (Math.random() - 0.5) * 9, 0.3, TEMPLE[1] + (Math.random() - 0.5) * 6); r.rotation.set(Math.random(), Math.random(), 0); }
      [[-14, -30], [-20, 30], [34, 10], [-36, -8]].forEach(([x, z], i) => prop('env-date-palm', x, z, i));
    }
    if (zid === 'shiloh' && p.ch >= 10){
      // 에브라임 산지 미가의 집과 신당(17:5) — 신상은 만들지 않고 집만
      put(new THREE.BoxGeometry(5, 2.8, 4), M(0xd8c4a0), MICAH_H[0], 1.4, MICAH_H[1]); put(new THREE.BoxGeometry(5.4, 0.25, 4.4), M(0xb89a70), MICAH_H[0], 2.9, MICAH_H[1]);
      put(new THREE.BoxGeometry(2.4, 2, 2.4), M(0xc8b088), MICAH_H[0] - 4, 1, MICAH_H[1] - 1); obst(MICAH_H[0], MICAH_H[1], 3); obst(MICAH_H[0] - 4, MICAH_H[1] - 1, 1.6);
      if (p.step >= 3 || p.cleared){ needProps(['tent-small'], 'shiloh'); [[-2, -3], [2, -4], [0, 3]].forEach(([dx, dz], i) => prop('tent-small', DANROAD[0] + dx, DANROAD[1] + dz, i)); }
    }
    if (zid === 'gibeon' && p.ch >= 11){
      // 미스바의 총회(20:1) · 벧엘(20:18, 21:2) · 기브아(20:40 "연기 구름이 기둥 같이") — 싸움은 연기만 멀리
      needProps(['tent-small', 'tent-mid', 'ark'], 'gibeon');
      [[-4, 2], [3, 4], [-1, -4], [6, -2], [-6, -3]].forEach(([dx, dz], i) => prop(i % 2 ? 'tent-small' : 'tent-mid', MIZ20[0] + dx, MIZ20[1] + dz, i * 1.3));
      { const al = []; for (let i = 0; i < 6; i++) put(new THREE.DodecahedronGeometry(0.34, 0), M(0xd0c4a8), BETHEL_G[0] - 2 + (i % 3) * 0.5, 0.25 + Math.floor(i / 3) * 0.45, BETHEL_G[1] - 2); }
      prop('ark', BETHEL_G[0] + 2, BETHEL_G[1] - 2, Math.PI / 2, 0.05);   // 20:27 "그 때에는 하나님의 언약궤가 거기 있고"
      [[-3, -3], [3, -2], [0, 3]].forEach(([dx, dz]) => { put(new THREE.BoxGeometry(3, 2.2, 2.6), M(0xcdb48e), GIBEAH[0] + dx, 1.1, GIBEAH[1] + dz); });
      if (smokeShow || (p.step >= 3 || p.cleared)) for (let i = 0; i < 9; i++){ const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: api.flameTex, color: 0x6a6460, depthWrite: false, transparent: true, opacity: 0.55 })); s.position.set(GIBEAH[0] + (Math.random() - 0.5) * 3, api.heightAt(GIBEAH[0], GIBEAH[1]) + 2 + i * 1.6, GIBEAH[1] + (Math.random() - 0.5) * 3); s.scale.set(3 + i * 0.5, 3 + i * 0.5, 1); g.add(s); }
    }
