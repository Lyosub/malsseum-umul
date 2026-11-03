    if (zid === 'gibeon'){
      // 기브온 성(10:2 "왕도와 같은 큰 성") — 동쪽 성문
      const st = M(0xcdb48e), dk = M(0xa8916c), N = 18;
      for (let i = 0; i < N; i++){ const a = i / N * Math.PI * 2; if (Math.abs(a) < 0.2 || Math.abs(a - Math.PI * 2) < 0.2) continue;
        const w = put(new THREE.BoxGeometry(3, 4.2, 1.3), i % 2 ? st : dk, GB[0] + Math.cos(a) * GBR, 2.1, GB[1] + Math.sin(a) * GBR); w.rotation.y = -a + Math.PI / 2;
        if (i % 3 === 0){ const t = put(new THREE.BoxGeometry(1.8, 5.4, 1.8), st, GB[0] + Math.cos(a) * GBR, 2.7, GB[1] + Math.sin(a) * GBR); t.rotation.y = -a; } }
      [[-2, -2], [2, 2.4], [-3, 3], [2.6, -3], [-0.4, 0.6]].forEach(([dx, dz], i) => put(new THREE.BoxGeometry(2.2, 1.9 + (i % 2) * 0.6, 2.2), M(i % 2 ? 0xd6c39c : 0xc9b28a), GB[0] + dx, 1, GB[1] + dz));
      if (!api.obstacles.some(o => o.j4gb)){ for (let i = 0; i < 36; i++){ const a = i / 36 * Math.PI * 2; if (Math.abs(a) < 0.2 || Math.abs(a - Math.PI * 2) < 0.2) continue; api.obstacles.push({ x: GB[0] + Math.cos(a) * GBR, z: GB[1] + Math.sin(a) * GBR, r: 1.2, j4gb: true }); } }
      // 9:27 "회중을 위하며 … 나무를 패며 물을 긷는 자들" — 성문 곁의 장작과 물동이
      if (from(8, 5)()){ for (let k = 0; k < 6; k++){ const l = put(new THREE.CylinderGeometry(0.16, 0.16, 1.6, 6), M(0x8a6a44), GBGATE[0] + 2.4, 0.2 + Math.floor(k / 3) * 0.32, GBGATE[1] - 3.2 + (k % 3) * 0.34); l.rotation.x = Math.PI / 2; }
        for (let k = 0; k < 3; k++) put(new THREE.CylinderGeometry(0.28, 0.2, 0.7, 10), M(0xb5764a), GBGATE[0] + 3.4 + k * 0.7, 0.35, GBGATE[1] + 3.6); }
      // 다섯 왕의 진(10:5) — 대진한 때부터 벧호론 비탈의 일(10:10) 전까지
      if (kingsShow || at(9, 1, 4)()) api.loadProps(['tent-mid', 'tent-small']).then(() => { if (!g.parent) return;
        [['tent-mid', -4, -6], ['tent-small', 2, -3], ['tent-mid', -6, 4], ['tent-small', 1, 6], ['tent-mid', -1, 0]].forEach(([n, dx, dz]) => { const T = api.propTemplates[n]; if (!T) return; const o = T.holder.clone(true); const x = KCAMP[0] + dx, z = KCAMP[1] + dz; o.position.set(x, api.heightAt(x, z), z); o.rotation.y = Math.atan2(GB[0] - x, GB[1] - z); g.add(o); }); }).catch(() => {});
      // 큰 우박 덩이(10:11) — 벧호론 비탈에서 아세가 쪽으로
      if (hailShow || at(9, 6, 8)()){ const ice = M(0xe8f2ff); for (let i = 0; i < 40; i++){ const s = put(new THREE.IcosahedronGeometry(0.22 + Math.random() * 0.22, 0), ice, SLOPE[0] - 6 + Math.random() * 16, 0.15, SLOPE[1] - 5 + Math.random() * 12); s.castShadow = false; } }
      // 해와 달(10:12-13) — 기브온 위의 해, 아얄론 골짜기의 달
      if (sunShow || at(9, 6, 8)()){
        const sun = new THREE.Mesh(new THREE.SphereGeometry(3.2, 20, 14), new THREE.MeshBasicMaterial({ color: 0xffe08a })); sun.position.set(GB[0], api.heightAt(GB[0], GB[1]) + 46, GB[1]); g.add(sun);
        const halo = new THREE.Mesh(new THREE.SphereGeometry(5.4, 20, 14), new THREE.MeshBasicMaterial({ color: 0xfff1c0, transparent: true, opacity: 0.25, depthWrite: false })); halo.position.copy(sun.position); g.add(halo);
        const moon = new THREE.Mesh(new THREE.SphereGeometry(1.9, 18, 12), new THREE.MeshBasicMaterial({ color: 0xeef0f6, transparent: true, opacity: 0.8 })); moon.position.set(AIJALON[0], api.heightAt(AIJALON[0], AIJALON[1]) + 30, AIJALON[1]); g.add(moon);
      }
      // 아얄론 골짜기 — 양쪽 비탈
      [[-6, 0], [6, 0]].forEach(([dx]) => { const h = put(new THREE.ConeGeometry(4.2, 4, 7), M(0xb9a882), AIJALON[0] + dx, 1.2, AIJALON[1]); h.castShadow = false; });
      // 막게다의 굴(10:16) — 바위 언덕과 어두운 굴 어귀, 10:18 "굴 어귀에 큰 돌을 굴려 막고"
      const rock = put(new THREE.DodecahedronGeometry(4.6, 0), M(0x9c8c72), CAVE[0], 1.8, CAVE[1]); rock.scale.set(1.3, 0.85, 1); rock.castShadow = false;
      const mouth = put(new THREE.CircleGeometry(1.3, 14), new THREE.MeshBasicMaterial({ color: 0x1a140e }), CAVE[0] - 3.4, 1.2, CAVE[1] - 3.4); mouth.rotation.y = Math.atan2(-1, -1);
      if (caveShow || from(9, 8)()){ const b = put(new THREE.DodecahedronGeometry(1.5, 0), M(0x8a7c66), CAVE[0] - 3.9, 1.1, CAVE[1] - 3.9); b.rotation.set(0.4, 0.7, 0); }
      if (!api.obstacles.some(o => o.j4cave)) api.obstacles.push({ x: CAVE[0], z: CAVE[1], r: 4.6, j4cave: true });
    }
    if (zid === 'hebron'){
      // 헤브론(14:15 "헤브론의 옛 이름은 기럇 아르바라") — 산지 위의 성. 성문은 북쪽(산지 길 쪽)
      const st = M(0xc8b08a), dk = M(0xa58e6a), N = 16, gateA = -Math.PI / 2;
      for (let i = 0; i < N; i++){ const a = i / N * Math.PI * 2 - Math.PI; if (Math.abs(a - gateA) < 0.22) continue;
        const w = put(new THREE.BoxGeometry(3, 4.6, 1.3), i % 2 ? st : dk, HB[0] + Math.cos(a) * HBR, 2.3, HB[1] + Math.sin(a) * HBR); w.rotation.y = -a + Math.PI / 2;
        if (i % 4 === 0){ const t = put(new THREE.BoxGeometry(1.9, 6, 1.9), st, HB[0] + Math.cos(a) * HBR, 3, HB[1] + Math.sin(a) * HBR); t.rotation.y = -a; } }
      [[-2, 1], [2.2, 2.4], [-1, 4], [1.6, -1.4]].forEach(([dx, dz], i) => put(new THREE.BoxGeometry(2.2, 2.1, 2.2), M(i % 2 ? 0xd6c39c : 0xc4ae86), HB[0] + dx, 1.05, HB[1] + dz));
      if (!api.obstacles.some(o => o.j4hb)){ for (let i = 0; i < 32; i++){ const a = i / 32 * Math.PI * 2 - Math.PI; if (Math.abs(a - gateA) < 0.22) continue; api.obstacles.push({ x: HB[0] + Math.cos(a) * HBR, z: HB[1] + Math.sin(a) * HBR, r: 1.2, j4hb: true }); } }
      // 산지로 오르는 길 — 길가의 돌
      for (let i = 0; i < 8; i++){ const z = TRAIL[1] - 16 + i * 2.6; [-1.8, 1.8].forEach(dx => { const s = put(new THREE.DodecahedronGeometry(0.35, 0), M(0x9c8c72), TRAIL[0] + dx + (Math.random() - 0.5) * 0.6, 0.2, z); s.rotation.set(Math.random() * 3, Math.random() * 3, 0); }); }
      // 갈렙이 받은 뒤(14:13-14)로는 성 앞의 장막
      if (from(10, 5)()) api.loadProps(['tent-small']).then(() => { if (!g.parent) return; const T = api.propTemplates['tent-small']; if (!T) return; const o = T.holder.clone(true); o.position.set(HTOP[0] + 4, api.heightAt(HTOP[0] + 4, HTOP[1]), HTOP[1]); o.rotation.y = Math.PI; g.add(o); }).catch(() => {});
    }
    if (zid === 'shiloh'){
      // 땅을 그려 온 일곱 부분(18:9 "책에 그려서")
      if (from(11, 5)()){ put(new THREE.BoxGeometry(2.6, 0.8, 1.4), M(0x8a6a44), MAP_S[0], 0.4, MAP_S[1]);
        for (let k = 0; k < 7; k++){ const s = put(new THREE.CylinderGeometry(0.1, 0.1, 0.7, 8), M(0xead9b0), MAP_S[0] - 1 + (k % 4) * 0.62, 0.9, MAP_S[1] - 0.3 + Math.floor(k / 4) * 0.6); s.rotation.z = Math.PI / 2; } }
      // 요단 언덕 가의 큰 제단(22:10 "보기에 큰 제단") — 22:26 "번제를 위함도 아니요 다른 제사를 위함도 아니라" 불은 없다
      if (edShow || from(12, 2)()){ for (let y = 0; y < 4; y++) for (let i = 0; i < 10 - y * 2; i++){ const a = i / (10 - y * 2) * Math.PI * 2, r = 2.2 - y * 0.5, s = put(new THREE.DodecahedronGeometry(0.62, 0), M(i % 2 ? 0xb3a284 : 0x9c8c72), ED[0] + Math.cos(a) * r, 0.45 + y * 0.9, ED[1] + Math.sin(a) * r); s.rotation.set(Math.random() * 3, Math.random() * 3, 0); }
        if (!api.obstacles.some(o => o.j4ed)) api.obstacles.push({ x: ED[0], z: ED[1], r: 2.6, j4ed: true }); }
      // 동편 지파와 비느하스 일행의 장막(22:13-15) — 13장 제단의 일 동안
      if (at(12, 1, 2)()) api.loadProps(['tent-small']).then(() => { if (!g.parent) return; const T = api.propTemplates['tent-small']; if (!T) return; [[EAST_S[0] + 2, EAST_S[1] + 5], [EAST_S[0] - 4, EAST_S[1] + 6]].forEach(([x, z]) => { const o = T.holder.clone(true); o.position.set(x, api.heightAt(x, z), z); o.rotation.y = Math.atan2(ED[0] - x, ED[1] - z); g.add(o); }); }).catch(() => {});
      // 세겜 — 성소 곁 상수리나무(24:26)
      const trunk = put(new THREE.CylinderGeometry(0.6, 0.9, 5, 9), M(0x6e5034), OAK[0], 2.5, OAK[1]);
      [[0, 6.2, 0, 3.2], [1.8, 5.4, 1, 2.4], [-1.8, 5.6, -0.6, 2.5], [0.4, 5.2, -2, 2.2]].forEach(([dx, y, dz, r]) => put(new THREE.IcosahedronGeometry(r, 1), M(0x5f8a3e), OAK[0] + dx, y, OAK[1] + dz));
      if (!api.obstacles.some(o => o.j4oak)) api.obstacles.push({ x: OAK[0], z: OAK[1], r: 1.2, j4oak: true });
      // 큰 돌(24:26-27 "이 돌이 우리에게 증거가 되리니")
      if (stoneShow || from(12, 6)()){ const s = put(new THREE.BoxGeometry(1.1, 3, 0.7), M(0xa8977c), OAK[0] - 2.6, 1.5, OAK[1] + 1.4); s.rotation.y = 0.3; }
      // 세겜에 모인 이스라엘 모든 지파(24:1) — 13장 세겜의 일 동안
      if (at(12, 4, 6)()) api.loadProps(['tent-mid', 'tent-small', 'tent-cluster']).then(() => { if (!g.parent) return;
        [['tent-cluster', OAK[0] - 10, OAK[1] + 6], ['tent-mid', OAK[0] + 9, OAK[1] + 8], ['tent-small', OAK[0] - 8, OAK[1] - 6], ['tent-mid', OAK[0] + 10, OAK[1] - 4]].forEach(([n, x, z]) => { const T = api.propTemplates[n]; if (!T) return; const o = T.holder.clone(true); o.position.set(x, api.heightAt(x, z), z); o.rotation.y = Math.atan2(OAK[0] - x, OAK[1] - z); g.add(o); }); }).catch(() => {});
      // 야곱이 산 밭(24:32) — 밭 둘레의 낮은 돌
      for (let i = 0; i < 16; i++){ const a = i / 16 * Math.PI * 2, s = put(new THREE.DodecahedronGeometry(0.3, 0), M(0x9c8c72), FIELD[0] + Math.cos(a) * 3.6, 0.15, FIELD[1] + Math.sin(a) * 2.6); s.rotation.set(Math.random() * 3, Math.random() * 3, 0); }
    }
