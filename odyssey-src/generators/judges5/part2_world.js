    if (zid === 'jezreel' && p.ch >= 4){
      // 오브라의 상수리나무 아래(6:11) · 포도주 틀 · 바위(6:20)
      needProps(['env-acacia', 'tent-small', 'tent-mid', 'camel', 'fleece', 'jar-torch'], 'jezreel');
      prop('env-acacia', OAK[0], OAK[1], 0.4);
      if (p.ch === 4){ for (let i = 0; i < 10; i++){ const a = i / 10 * Math.PI * 2; put(new THREE.BoxGeometry(0.5, 0.5, 0.4), M(0xb8a888), PRESS[0] + Math.cos(a) * 1.1, 0.25, PRESS[1] + Math.sin(a) * 1.1, -a); } }
      { const r = put(new THREE.DodecahedronGeometry(1.1, 0), M(0x9a8a72), ROCK[0], 0.6, ROCK[1]); r.scale.set(1.3, 0.7, 1.1); }
      if (offerShow) for (let i = 0; i < 5; i++){ const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: api.flameTex, color: i % 2 ? 0xffd27a : 0xff8a3a, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.9 })); s.position.set(ROCK[0] + (Math.random() - 0.5) * 0.8, api.heightAt(ROCK[0], ROCK[1]) + 1.4 + Math.random() * 0.6, ROCK[1] + (Math.random() - 0.5) * 0.8); s.scale.set(1, 1.6, 1); g.add(s); }
      // 바알의 제단과 아세라(6:25) → 헐린 뒤에는 무너진 돌과 새로 쌓은 제단(6:28)
      const down = baalShow || p.ch > 4 || (p.ch === 4 && p.step >= 4);
      if (!down){ put(new THREE.BoxGeometry(1.8, 1.2, 1.8), M(0x8a7a62), BAAL[0], 0.6, BAAL[1]); put(new THREE.CylinderGeometry(0.12, 0.16, 2.6, 6), M(0x6a5a40), BAAL[0] + 1.6, 1.3, BAAL[1]); }
      else { for (let i = 0; i < 8; i++){ const r = put(new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.2), M(0x8a7a62), BAAL[0] + (Math.random() - 0.5) * 2.4, 0.15, BAAL[1] + (Math.random() - 0.5) * 2.4); r.rotation.set(Math.random(), Math.random(), 0); }
        for (let i = 0; i < 6; i++) put(new THREE.DodecahedronGeometry(0.34, 0), M(0xd0c4a8), BAAL[0] + 3.4 + (i % 3) * 0.5 - 0.5, 0.25 + Math.floor(i / 3) * 0.45, BAAL[1]); }
      // 타작마당과 양털(6:37)
      { const f = new THREE.Mesh(new THREE.CircleGeometry(2.6, 20).rotateX(-Math.PI / 2), M(0xc8b088)); f.position.set(FLOOR[0], api.heightAt(FLOOR[0], FLOOR[1]) + 0.04, FLOOR[1]); g.add(f); }
      if (p.ch === 4 && p.step >= 6) prop('fleece', FLOOR[0], FLOOR[1], 0.3);
      // 하롯 샘(7:1)
      if (p.ch >= 5){ const w = new THREE.Mesh(new THREE.CircleGeometry(2.4, 24).rotateX(-Math.PI / 2), new THREE.MeshToonMaterial({ color: 0x4f9fb5, gradientMap: api.toonGradient, transparent: true, opacity: 0.85 })); w.position.set(HAROD[0], api.heightAt(HAROD[0], HAROD[1]) + 0.06, HAROD[1]); g.add(w); }
      // 미디안 진영 — 모레 산 앞 골짜기(7:1, 7:12 "메뚜기의 많은 수와 같고") → 7:21 뒤로는 비고 쓰러진 장막
      const campOn = (p.ch === 4 && p.step >= 5) || p.ch === 5;
      if (campOn){ const rout = routShow || (p.ch === 5 && (p.cleared || p.step >= 5));
        for (let i = 0; i < 14; i++){ const x = CAMPM[0] + (i % 5) * 4 - 8 + (i % 2) * 1.5, z = CAMPM[1] + Math.floor(i / 5) * 4.5 - 4; const o = prop(i % 3 ? 'tent-small' : 'tent-mid', x, z, i * 0.9); if (o && rout){ o.rotation.z = 0.5 + (i % 3) * 0.2; o.position.y -= 0.4; } }
        if (!rout) [[-6, 6], [4, 7], [9, -2]].forEach(([dx, dz], i) => prop('camel', CAMPM[0] + dx, CAMPM[1] + dz, i * 1.7)); }
      if (p.ch === 5 && p.step === 4) [[-1.4, 0], [0, 0.6], [1.4, 0]].forEach(([dx, dz]) => prop('jar-torch', HAROD[0] + 2.6 + dx, HAROD[1] - 5 + dz, 0));
    }
    if (zid === 'moab' && p.ch >= 6){
      // 길르앗: 미스바의 진(10:17) · 입다의 집(11:34) · 돕 땅의 장막(11:3)
      needProps(['tent-small', 'tent-mid'], 'moab');
      [[-4, 2], [3, 4], [-1, -4], [5, -3]].forEach(([dx, dz], i) => prop(i % 2 ? 'tent-small' : 'tent-mid', MIZ[0] + dx, MIZ[1] + dz, i * 1.4));
      put(new THREE.BoxGeometry(4.2, 2.6, 3.6), M(0xd8c4a0), JHOUSE[0], 1.3, JHOUSE[1]); put(new THREE.BoxGeometry(4.6, 0.25, 4), M(0xb89a70), JHOUSE[0], 2.7, JHOUSE[1]); obst(JHOUSE[0], JHOUSE[1], 2.6);
      [[-3, 2], [3, 1]].forEach(([dx, dz], i) => prop('tent-small', TOB[0] + dx, TOB[1] + dz, i * 2));
    }
