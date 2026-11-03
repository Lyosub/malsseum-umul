  // ── 우박: 동쪽(애굽 들판)에만. 고센(서쪽, x<8)에는 없음(9:26) ──
  let hailOn = false, locustOn = false, darkOn = false, duskOn = false, nightOn = false, pillarOn = false;
  const HAIL_N = 2200, hailGeo = new THREE.BufferGeometry(); hailGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(HAIL_N * 3), 3));
  const hail = new THREE.Points(hailGeo, new THREE.PointsMaterial({ color: 0xf2f8ff, size: 0.26, map: dotTex, transparent: true, opacity: 0.95, depthWrite: false }));
  hail.frustumCulled = false; hail.visible = false; scene.add(hail);
  const FIRE_N = 60, fireGeo = new THREE.BufferGeometry(); fireGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(FIRE_N * 3), 3));
  const fireP = new THREE.Points(fireGeo, new THREE.PointsMaterial({ color: 0xff8a3a, size: 0.34, map: dotTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  fireP.frustumCulled = false; fireP.visible = false; scene.add(fireP);
  const hailSeed = Array.from({ length: HAIL_N }, () => [Math.random(), Math.random(), Math.random() * 11]);
  const fireSeed = Array.from({ length: FIRE_N }, () => [Math.random(), Math.random(), Math.random() * 18]);
  let flashT = 3;
  function updateHail(dt, now){
    const on = hailOn && Z && Z.id === 'egypt';
    hail.visible = fireP.visible = on; if (!on) return;
    const t = now * 0.001, px = player.position.x, pz = player.position.z;
    const fill = (geo, seed, speed, span) => { const a = geo.attributes.position;
      for (let i = 0; i < seed.length; i++){ const [u, v, off] = seed[i];
        let x = px - span + u * span * 2, z = pz - span + v * span * 2;
        if (x < 8) x = 8 + (8 - x);                        // 고센 쪽으로는 넘어가지 않음
        const y = 11 - ((t * speed + off) % 11);
        a.setXYZ(i, x, heightAt(x, z) + y, z); }
      a.needsUpdate = true; };
    fill(hailGeo, hailSeed, 14, 9); fill(fireGeo, fireSeed, 8, 11);
    flashT -= dt; const fl = document.getElementById('flash');
    if (flashT < 0){ flashT = 2.5 + Math.random() * 4; fl.style.transition = 'none'; fl.style.opacity = px > 6 ? '0.55' : '0.2'; setTimeout(() => { fl.style.transition = 'opacity 0.5s'; fl.style.opacity = '0'; }, 90); }
  }
  // ── 메뚜기: 온 땅(10:14-15) — 화면이 어두워지고 떼가 몸 주위로 ──
  const LOC_N = 600, locGeo = new THREE.BufferGeometry(); locGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(LOC_N * 3), 3));
  const locusts = new THREE.Points(locGeo, new THREE.PointsMaterial({ color: 0x5a5a24, size: 0.2, map: dotTex, transparent: true, opacity: 0.95, depthWrite: false }));
  locusts.frustumCulled = false; locusts.visible = false; scene.add(locusts);
  const locSeed = Array.from({ length: LOC_N }, () => [Math.random() * 6.28, 1 + Math.random() * 14, 0.3 + Math.random() * 5, 0.5 + Math.random() * 2.5]);
  function updateLocusts(dt, now){
    const on = locustOn && Z && Z.id === 'egypt';
    const tintEl = document.getElementById('tint'), storm = hailOn && Z && Z.id === 'egypt' && player.position.x > 6;
    tintEl.style.background = on ? 'rgba(58,48,18,0.55)' : 'rgba(40,46,60,0.5)';   // 메뚜기: 누런 어둠 / 우박: 잿빛 폭풍(고센 쪽은 맑음)
    tintEl.style.opacity = on || storm ? '1' : '0';
    locusts.visible = on; if (!on) return;
    const t = now * 0.001, a = locGeo.attributes.position, px = player.position.x, pz = player.position.z;
    for (let i = 0; i < LOC_N; i++){ const [ph, r, h, sp] = locSeed[i]; const ang = ph + t * sp * 0.4;
      a.setXYZ(i, px + Math.cos(ang) * r + t * 3 % 6 - 3, heightAt(px, pz) + h + Math.sin(t * 4 + i) * 0.3, pz + Math.sin(ang) * r); }
    a.needsUpdate = true;
  }
  // ── 흑암: 애굽 쪽은 캄캄, 이스라엘 자손이 사는 서쪽(고센)은 빛(10:23) ──
  let darkK = 0; const darkTrail = [];
  const beacons = [];
  function updateDark(dt){
    const on = darkOn && Z && Z.id === 'egypt';
    const eve = Z && (Z.id === 'egypt' || Z.id === 'redsea') && !on ? (nightOn ? (Z.id === 'redsea' ? 0.85 : 0.95) : duskOn ? 0.42 : 0) : 0;   // 3장: 해 질 녘·밤(온 마을)
    const target = on ? THREE.MathUtils.clamp((player.position.x - 3) / 7, 0, 1) : eve;
    const tint = on ? _black : nightOn ? _night : _dusk;
    darkK += (target - darkK) * Math.min(1, dt * 2);
    if ((on || eve) && !beacons.length){
      // 고센 집들의 따뜻한 불빛 — 안개에 가리지 않는 표지
      Z.layout.filter(([n]) => n.startsWith('hebrew-house') || n === 'reed-hut').forEach(([, x, z]) => {
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, color: 0xffd98a, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false }));
        sp.scale.set(2.2, 3.4, 1); sp.position.set(x, heightAt(x, z) + 3.2, z); zoneRoot.add(sp); beacons.push(sp);
      });
    }
    if (on && !darkTrail.length && Z && Z.id === 'egypt'){
      // 궁전 정문 앞에서 고센(서쪽)까지 바닥 등불 — 어둠 속에서도 따라갈 수 있게(출 10:23 "이스라엘 자손이 거주하는 곳에는 빛이 있었더라")
      const pts = []; for (let t = 0; t <= 1.0001; t += 1 / 9){ const x = 22 + (2 - 22) * t, z = -9 + (1 - (-9)) * t; pts.push(nearestWalkable(x, z)); }
      pts.forEach(([x, z]) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, color: 0xffd98a, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false }));
        sp.scale.set(0.8, 1.2, 1); sp.position.set(x, heightAt(x, z) + 0.6, z); zoneRoot.add(sp); darkTrail.push(sp); });
      toast('🕯 서쪽 고센의 불빛과 바닥 등불을 따라가요 — 길을 모르겠으면 🙏 기도!', 3200);
    }
    if (!on && darkTrail.length){ darkTrail.forEach(b => zoneRoot.remove(b)); darkTrail.length = 0; }
    if (!on && !eve && beacons.length && darkK < 0.02){ beacons.forEach(b => zoneRoot.remove(b)); beacons.length = 0; }
    beacons.forEach(b => b.material.opacity = 0.35 + 0.65 * darkK);
    if (!Z) return;
    const e = Z.env, k = darkK;
    scene.fog.color.set(e.fog).lerp(tint, k); scene.background.copy(scene.fog.color);
    scene.fog.density = e.fogD + k * (on ? 0.05 : 0.012);   // 흑암은 더듬을 만큼 짙게, 밤은 멀리까지 보이게
    darkLight.intensity = (on ? 2.2 : 1.5) * k; darkLight.color.set(on ? 0xbfc8ff : 0xffc98a); darkLight.position.set(player.position.x, player.position.y + 2.2, player.position.z);   // 밤에는 등잔불처럼 따뜻하게
    hemi.intensity = 0.9 * (1 - 0.85 * k); sun.intensity = 1.6 * (1 - 0.95 * k);
    skyMat.uniforms.top.value.set(e.top).lerp(tint, k); skyMat.uniforms.bottom.value.set(e.bottom).lerp(tint, k);
    skyMat.uniforms.stars.value = Math.max(e.stars, nightOn && !on ? darkK * 1.5 : 0);
    farRing.visible = k < 0.3 && !!farMat.map;
  }
  const _black = new THREE.Color(0x05050a), _night = new THREE.Color(0x0b1233), _dusk = new THREE.Color(0x5a2a2e);
  // 불 기둥(13:21): 동쪽 끝, 백성 앞에 높이 솟은 빛
  let pillarObj = null;
  function spawnPillar(){
    if (pillarObj){ if (pillarObj.parent) pillarObj.parent.remove(pillarObj); pillarObj = null; }
    const show = Z && Z.id === 'egypt' && ST.ch === 2 && (pillarOn || ST.cleared); if (!show) return;
    const x = 49, z = -8, g = new THREE.Group(); g.position.set(x, heightAt(x, z), z);
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.3, 22, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0xff7a1a, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    col.position.y = 11; g.add(col);
    for (let i = 0; i < 18; i++){ const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, color: i % 3 ? 0xffb050 : 0xff7a2a, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false }));
      const sc = 3.4 - i * 0.07; sp.scale.set(sc, sc * 1.5, 1); sp.position.set((Math.random() - 0.5) * 0.7, 1.0 + i * 1.2, (Math.random() - 0.5) * 0.7); sp.userData.ph = Math.random() * 6; g.add(sp); }
    const L = new THREE.PointLight(0xffa040, 3.2, 40, 1.4); L.position.y = 6; g.add(L);
    zoneRoot.add(g); pillarObj = g;
  }
  function updatePillar(now){ if (!pillarObj) return; const t = now * 0.004; pillarObj.children.forEach(o => { if (o.isSprite){ o.material.opacity = 0.75 + 0.25 * Math.sin(t + o.userData.ph); o.position.x = Math.sin(t * 0.7 + o.userData.ph) * 0.35; } }); }
  const darkLight = new THREE.PointLight(0xbfc8ff, 0, 7, 1.5); scene.add(darkLight);   // 흑암 속 발밑만 희미하게(길을 더듬을 정도)
  // ── 우박 경고 알리기(9:19-20): 제한 시간 안에 들판 4곳 ──
  let warnT = 0;
  function spawnWarn(){
    for (let i = markers.length - 1; i >= 0; i--) if (markers[i].isWarn){ zoneRoot.remove(markers[i].mesh); markers.splice(i, 1); }
    const q = curStep(); if (!q || !q.warn || !Z || Z.id !== 'egypt') return;
    ST.warned = 0; warnT = q.time || 0;
    if (q.mark){ spawnMarkTasks(q); renderQuestList(); return; }
    const pts = [[20, 5], [27, -4], [35, 3], [22, 15]].map(([x, z]) => nearestWalkable(x, z));
    const poleM = new THREE.MeshToonMaterial({ color: 0x7a5a3a, gradientMap: toonGradient }), clothM = new THREE.MeshToonMaterial({ color: 0xd24a36, gradientMap: toonGradient, side: THREE.DoubleSide });
    pts.forEach(([x, z], i) => {
      const g = new THREE.Group(); g.position.set(x, heightAt(x, z), z);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 2.6, 6), poleM); pole.position.y = 1.3; g.add(pole);
      const cloth = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.55), clothM); cloth.position.set(0.47, 2.25, 0); g.add(cloth);
      const glint = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, color: 0xffe6a0, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.5 }));
      glint.scale.set(0.9, 1.4, 1); glint.position.y = 0.5; g.add(glint);
      const tag = makeTag('들판의 애굽 사람들'); tag.scale.set(0.16, 0.04, 1); tag.position.y = 3.0; g.add(tag);
      zoneRoot.add(g);
      markers.push({ mesh: g, data: { id: 'warn' + i, type: 'warn', title: '들판의 애굽 사람들', x, z }, isWarn: true, done: false, glint, tag, cloth });
    });
    renderQuestList();
  }
  // 고센 집 문 자리(히브리 집 5채): 문 앞 서는 곳 + 문 위치·방향
  function goshenDoors(){
    return Z.layout.filter(([n, x]) => n.startsWith('hebrew-house') && x < 8).map(([n, x, z, rot, sc]) => {
      const t = propTemplates[n], k = sc || 1, fx = Math.sin(rot), fz = Math.cos(rot), d = (t ? t.halfD : 2) * k * 0.9;
      return { dx: x + fx * (d + 0.05), dz: z + fz * (d + 0.05), rot, sx: x + fx * (d + 1.3), sz: z + fz * (d + 1.3) };
    });
  }
  const bloodMat = new THREE.MeshToonMaterial({ color: 0x8a1712, gradientMap: toonGradient });
  function paintDoor(door){   // 좌우 문설주와 인방(12:7)
    const g = new THREE.Group(); g.position.set(door.dx, heightAt(door.dx, door.dz), door.dz); g.rotation.y = door.rot;
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.16, 0.08), bloodMat); lintel.position.set(0, 2.55, 0.02); g.add(lintel);
    for (const sx of [-0.72, 0.72]){ const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.5, 0.08), bloodMat); post.position.set(sx, 1.25, 0.02); g.add(post); }
    zoneRoot.add(g); return g;
  }
  const markDeco = [];
  function spawnMarkTasks(q){
    goshenDoors().forEach((door, i) => {
      const [x, z] = nearestWalkable(door.sx, door.sz);
      const g = new THREE.Group(); g.position.set(x, heightAt(x, z), z);
      const glint = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, color: 0xffb0a0, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.5 }));
      glint.scale.set(0.9, 1.4, 1); glint.position.y = 0.6; g.add(glint);
      const tag = makeTag('문설주와 인방'); tag.scale.set(0.16, 0.04, 1); tag.position.y = 2.2; g.add(tag);
      zoneRoot.add(g);
      markers.push({ mesh: g, data: { id: 'mark' + i, type: 'warn', title: '문설주와 인방', x, z }, isWarn: true, isMark: true, door, done: false, glint, tag });
    });
  }
  // 3장: 피를 바른 뒤로는(새로고침해도) 고센의 문들이 붉게 표시됨
  function spawnMarksStatic(){
    markDeco.forEach(o => zoneRoot.remove(o)); markDeco.length = 0;
    if (!Z || Z.id !== 'egypt' || ST.ch !== 2 || (!ST.cleared && ST.step <= stepIdx('c3s5'))) return;
    goshenDoors().forEach(d => markDeco.push(paintDoor(d)));
  }
  function doWarn(m){
    const q = curStep(); if (!q || !q.warn || m.done) return;
    if (m.isMark){
      m.done = true; m.glint.visible = false; m.tag.visible = false; markDeco.push(paintDoor(m.door));
      interactBtn.classList.add('hidden'); nearPoint = null;
      playOneShot('Wave', { lockMove: true });
      ST.warned++; renderQuestList();
      toast(`🩸 우슬초로 문설주와 인방에 피를 발랐어요 (${ST.warned}/${q.warn})`, 1600);
      if (ST.warned >= q.warn) setTimeout(() => completeTask(q), 900);
      return;
    }
    m.done = true; m.glint.visible = false; m.tag.visible = false; m.cloth.material = m.cloth.material.clone(); m.cloth.material.color.set(0x6a9a4a);
    interactBtn.classList.add('hidden'); nearPoint = null;
    playOneShot('Wave', { lockMove: true });
    ST.warned++; renderQuestList();
    toast(`📣 "가축과 종들을 집으로 들이세요!" (${ST.warned}/${q.warn})`, 1600);
    if (ST.warned >= q.warn){ warnT = 0; setTimeout(() => completeTask(q), 900); }
  }
  let warnTick = 0;
  function updateWarn(dt){
    const q = curStep(); if (!q || !q.warn || !q.time || !Z || Z.id !== 'egypt' || dlgState || ST.warned >= q.warn) return;
    warnT -= dt; warnTick += dt;
    if (warnTick > 1){ warnTick = 0; renderQuestList(); }
    if (warnT <= 0){ toast('⏱ 시간이 다 됐어요. 다시 한 번 서둘러 알려 봐요!', 2200); spawnWarn(); renderQuestList(); }
  }
  function countLines(){
    const total = ST.herd ? ST.herd.lamb + ST.herd.camel : 7;
    const opts = [...new Set([total, total - 2, total + 1, total - 1, total + 2])].slice(0, 4).sort((a, b) => a - b);
    return DLG.c2_count_intro.concat([{ choice: opts.map(n => n === total
      ? { l: `${n}마리`, quiz: 'c2_count', ok: true, say: [[NAR, '정답이에요! ⭐ 지혜 별을 하나 얻었어요.']] }
      : { l: `${n}마리`, quiz: 'c2_count', ok: false, abort: true, say: [[WORKER, '음… 다시 한번 천천히 세어 보고 와 줄래요? 우리 안의 양과 밖의 낙타를 모두요.']] }) }], DLG.c2_count_end);
  }

  function updateEvents(dt){
    if (bloodT >= 0 && Z && Z._water){ bloodT += dt; const k = Math.min(1, bloodT / 2.5); Z._water.material.color.copy(WATER_BLUE).lerp(WATER_BLOOD, k); if (k >= 1) bloodT = -1; }
  }
  function completeTask(q){
    if (REPLAY && REPLAY.def.step && q.id === REPLAY.def.step){ finishReplay(true); return; }
    if (q.doneDlg) runDialog(DLG[q.doneDlg].concat(quizLines(q.doneDlg)), () => giveReward(q.reward, advance), null, q.doneDlg);
    else giveReward(q.reward, advance);
  }
  // ══ 6~8장: 반석의 물 · 아말렉 전투 · 시내산(산·경계·폭풍) · 손 들기 · 두 돌판 ══
  // ══ 모세 편 보강(2026-09-27): 8장 끝 「언약의 피」(출 24:3-11) · 9장 「반석 틈」(출 33:18-23) ══
  const COV_PEOPLE = { n: '백성' };
  Object.assign(VERSES, {
    'ex24-7': { ref: '출애굽기 24:7', text: '언약서를 가져다가 백성에게 낭독하여 듣게 하니 그들이 이르되 여호와의 모든 말씀을 우리가 준행하리이다' },
    'ex33-22': { ref: '출애굽기 33:22', text: '내 영광이 지나갈 때에 내가 너를 반석 틈에 두고 내가 지나도록 내 손으로 너를 덮었다가' },
  });
  Object.assign(DLG, {
    c8_pillars: [
      [NAR, '모세가 와서 여호와의 모든 말씀과 그의 모든 율례를 백성에게 전하매 그들이 한 소리로 응답하여 이르되 (출 24:3)'],
      [COV_PEOPLE, '여호와께서 말씀하신 모든 것을 우리가 준행하리이다'],
      [NAR, '모세가 여호와의 모든 말씀을 기록하고 이른 아침에 일어나 산 아래에 제단을 쌓고 이스라엘 열두 지파대로 열두 기둥을 세우고 (출 24:4)'],
    ],
    c8_blood: [
      [NAR, '이스라엘 자손의 청년들을 보내어 여호와께 소로 번제와 화목제를 드리게 하고 (출 24:5)'],
      [NAR, '모세가 피를 가지고 반은 여러 양푼에 담고 반은 제단에 뿌리고 (출 24:6)'],
      [NAR, '언약서를 가져다가 백성에게 낭독하여 듣게 하니 그들이 이르되 (출 24:7)'],
      [COV_PEOPLE, '여호와의 모든 말씀을 우리가 준행하리이다'],
      [NAR, '모세가 그 피를 가지고 백성에게 뿌리며 이르되 (출 24:8)'],
      [MOSES, '이는 여호와께서 이 모든 말씀에 대하여 너희와 세우신 언약의 피니라'],
      [NAR, '모세와 아론과 나답과 아비후와 이스라엘 장로 칠십 인이 올라가서 (출 24:9)'],
      [NAR, '이스라엘의 하나님을 보니 그의 발 아래에는 청옥을 편 듯하고 하늘 같이 청명하더라 (출 24:10)'],
      [NAR, '하나님이 이스라엘 자손들의 존귀한 자들에게 손을 대지 아니하셨고 그들은 하나님을 뵙고 먹고 마셨더라 (출 24:11)'],
    ],
    c9_cleft: [
      [MOSES, '원하건대 주의 영광을 내게 보이소서'],
      [NAR, '여호와께서 이르시되 내가 내 모든 선한 것을 네 앞으로 지나가게 하고 여호와의 이름을 네 앞에 선포하리라 나는 은혜 베풀 자에게 은혜를 베풀고 긍휼히 여길 자에게 긍휼을 베푸느니라 (출 33:19)'],
      [NAR, '또 이르시되 네가 내 얼굴을 보지 못하리니 나를 보고 살 자가 없음이니라 (출 33:20)'],
      [NAR, '여호와께서 또 이르시기를 보라 내 곁에 한 장소가 있으니 너는 그 반석 위에 서라 (출 33:21)'],
    ],
    c9_cleft_after: [
      [NAR, '내 영광이 지나갈 때에 내가 너를 반석 틈에 두고 내가 지나도록 내 손으로 너를 덮었다가 (출 33:22)'],
      [NAR, '손을 거두리니 네가 내 등을 볼 것이요 얼굴은 보지 못하리라 (출 33:23)'],
    ],
  });
  const COV_ALTAR = [24, -22], CLEFT = [-4, -24];   // 제단: 산 아래(출 24:4), 성막 뜰 문과 떨어진 곳
  ZONES.sinai.points.push({ id: 'rock_cleft', x: CLEFT[0], z: CLEFT[1], type: 'lore', title: '반석', cond: 'cleftOn', body: '' });
  CONDS.cleftOn = () => ST.ch === 8 && !ST.cleared && ST.step === stepIdx('c9s8b');
  // 열두 기둥 제단(출 24:4): 8장의 이 단계를 지나면 계속 남아 있음
  let covObj = null;
  function buildCovenantAltar(){
    if (covObj){ covObj.parent && covObj.parent.remove(covObj); covObj = null; }
    if (!Z || Z.id !== 'sinai') return;
    if (!(ST.ch > 7 || (ST.ch === 7 && (ST.cleared || ST.step > stepIdx('c8s8'))))) return;
    const [x, z] = COV_ALTAR, y = heightAt(x, z), g = new THREE.Group();
    const stone = new THREE.MeshToonMaterial({ color: 0xb9a888, gradientMap: toonGradient });
    const alt = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 1.4), stone); alt.position.set(x, y + 0.45, z); alt.castShadow = true; g.add(alt);
    for (let i = 0; i < 12; i++){ const a = i / 12 * Math.PI * 2, px = x + Math.cos(a) * 2.6, pz = z + Math.sin(a) * 2.6;
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 1.3, 7), stone); p.position.set(px, heightAt(px, pz) + 0.65, pz); p.castShadow = true; g.add(p); }
    obstacles.push({ x, z, r: 0.9 });
    zoneRoot.add(g); covObj = g;
  }
  // 🏛 열두 지파대로 열두 기둥 세우기
  function pillarsGame(q){
    runDialog(DLG.c8_pillars, () => {
      mgOpen('🏛 열두 기둥', '"이스라엘 열두 지파대로 열두 기둥을 세우고" (출 24:4) — 제단 둘레에 기둥 열둘을 세워요.'); mgArea.style.height = 'auto';   // 기본 높이(120px)에 가려 아래쪽 기둥이 안 보여 못 누르던 문제(10/5 학생 제보)
      const set = new Set();
      const draw = () => {
        const cells = Array.from({ length: 12 }, (_, i) => { const a = i / 12 * Math.PI * 2 - Math.PI / 2, x = 50 + Math.cos(a) * 38, y = 50 + Math.sin(a) * 38;
          return `<button data-pil="${i}" style="position:absolute;left:${x}%;top:${y}%;transform:translate(-50%,-50%);width:30px;height:${set.has(i) ? 40 : 14}px;border-radius:6px;border:1px solid rgba(255,255,255,.4);background:${set.has(i) ? '#cdbb96' : 'rgba(255,255,255,.12)'};transition:height .2s"></button>`; }).join('');
        mgArea.innerHTML = `<div style="position:relative;height:min(190px,38vh);margin:4px auto;max-width:260px"><div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:46px;height:34px;border-radius:6px;background:#9a8a6a"></div>${cells}</div>`
          + `<div style="text-align:center;color:#ffd27a;font-weight:800">${set.size < 12 ? `기둥 ${set.size} / 12` : '✓ 열두 기둥을 모두 세웠어요'}</div>`;
        mgAct.textContent = set.size < 12 ? '열둘을 다 세우면 계속' : '계속'; mgAct.disabled = set.size < 12;
      };
      draw();
      mgArea.onclick = e => { const b = e.target.closest('[data-pil]'); if (!b) return; set.add(+b.dataset.pil); draw(); };
      mgAct.onclick = () => { if (set.size < 12) return; mgArea.onclick = null; mgArea.style.height = ''; mgCloseAll(); completeTask(q); };
      mg.onClose = () => { mgArea.onclick = null; mgArea.style.height = ''; };
    }, null, 'c8_pillars');
  }
  // ⛰ 반석 틈 — 영광이 지나가는 동안 손을 떼지 말고 기다리기(출 33:21-23)
  function cleftGame(q){
    runDialog(DLG.c9_cleft, () => {
      mgOpen('⛰ 반석 틈', '"내 영광이 지나갈 때에 내가 너를 반석 틈에 두고 내가 지나도록 내 손으로 너를 덮었다가" (출 33:22)<br><span style="opacity:.8">버튼을 누른 채로, 영광이 다 지나갈 때까지 기다려요.</span>');
      let hold = false, k = 0, raf = 0, last = 0, done = false;
      mgArea.innerHTML = `<div style="padding:10px 14px"><div style="height:16px;border-radius:8px;background:rgba(255,255,255,.1);overflow:hidden"><div id="cl-bar" style="height:100%;width:0;background:linear-gradient(90deg,#fff6c8,#ffd27a)"></div></div><div id="cl-msg" style="text-align:center;margin-top:8px;color:#ffd27a;font-weight:800">손을 떼면 처음부터예요</div></div>`;
      mgAct.textContent = '🙏 누르고 기다리기'; mgAct.disabled = false;
      const loop = now => { const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
        if (!done){ k = hold ? Math.min(1, k + dt / 6) : 0;
          const bar = mgArea.querySelector('#cl-bar'); if (bar) bar.style.width = (k * 100) + '%';
          if (k >= 1){ done = true; hold = false; const fl = document.getElementById('flash'); fl.style.transition = 'none'; fl.style.background = '#fff8dc'; fl.style.opacity = '0.85';
            setTimeout(() => { fl.style.transition = 'opacity 1.6s'; fl.style.opacity = '0'; setTimeout(() => fl.style.background = '', 1700); }, 250);
            const m = mgArea.querySelector('#cl-msg'); if (m) m.textContent = '✓ 영광이 지나갔어요'; mgAct.textContent = '계속'; } }
        raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
      const down = e => { if (!done){ e.preventDefault(); hold = true; } }, up = () => { if (!done) hold = false; };
      mgAct.addEventListener('pointerdown', down); mgAct.addEventListener('pointerup', up); mgAct.addEventListener('pointerleave', up);
      const cleanup = () => { cancelAnimationFrame(raf); mgAct.removeEventListener('pointerdown', down); mgAct.removeEventListener('pointerup', up); mgAct.removeEventListener('pointerleave', up); };
      mgAct.onclick = () => { if (!done) return; cleanup(); mgCloseAll(); completeTask(q); };
      mg.onClose = cleanup;
      window.__cleftFinish = () => { hold = true; k = 1; };   // 시험용
    }, null, 'c9_cleft');
  }
  // 🍞 만나 — "햇볕이 뜨겁게 쬐면 그것이 스러졌더라"(출 16:21): 이야기 속 만나 줍기에 시간 제한
  let mannaSun = null;
  function startStoryGame(q){
    { const g = (SCROLL_DEFS[ST.cur] || {}).games; if (ST.cur !== 'moses' && g && g[q.game]) return g[q.game](q); }
    if (q.game === 'hands') handsGame(q);
    if (q.game === 'pillars') pillarsGame(q);
    if (q.game === 'cleft') cleftGame(q);
    if (q.game === 'tablets') tabletsGame(q);
    if (q.game === 'hew') hewGame(q);
    if (q.game === 'offering') offeringGame(q);
    if (q.game === 'erect') erectGame(q);
  }
  // ══ 9·10장 연출: 금송아지 · 깨진 돌판 · 회막의 구름 기둥 · 모세 얼굴의 광채 · 언약궤 · 성막(한 단계씩) · 여호와의 영광 ══
  Object.assign(PROP_DEFS, {
    'golden-calf': { h: 1.7, occ: false, shape: 'none', src: 'story3d/golden-calf.glb' },
    'ark': { h: 0.95, occ: false, shape: 'none', src: 'story3d/ark.glb' },
    'stone-tablets': { h: 0.8, occ: false, shape: 'none', src: 'story3d/stone-tablets.glb' },
    // 2·3편 동물·소품(GPT 9·10차 원화 → Meshy, 2026-10-25) — 두루마리 파일이 장면에 놓는다
    'bull': { h: 1.5, occ: false, shape: 'none', src: 'animals3d/bull.glb' },
    'goat-a': { h: 0.95, occ: false, shape: 'none', src: 'animals3d/goat-a.glb' },
    'goat-b': { h: 0.95, occ: false, shape: 'none', src: 'animals3d/goat-b.glb' },
    'donkey': { h: 1.4, occ: false, shape: 'none', src: 'animals3d/donkey.glb' },
    'quail': { h: 0.25, occ: false, shape: 'none', src: 'animals3d/quail.glb' },
    'fiery-serpent': { h: 0.35, occ: false, shape: 'none', src: 'animals3d/fiery-serpent.glb' },
    'censer': { h: 0.28, occ: false, shape: 'none', src: 'story3d/censer.glb' },
    'flour-bowl': { h: 0.3, occ: false, shape: 'none', src: 'story3d/flour-bowl.glb' },
    'unleavened-basket': { h: 0.3, occ: false, shape: 'none', src: 'story3d/unleavened-basket.glb' },
    'fruit-basket': { h: 0.45, occ: false, shape: 'none', src: 'story3d/fruit-basket.glb' },
    'grain-field': { h: 0.7, occ: false, shape: 'none', src: 'story3d/grain-field.glb' },
    'booth': { h: 2.4, occ: false, shape: 'none', src: 'story3d/booth.glb' },
    'silver-trumpets': { h: 0.22, occ: false, shape: 'none', src: 'story3d/silver-trumpets.glb' },
    'grape-pole': { h: 1.3, occ: false, shape: 'none', src: 'story3d/grape-pole.glb' },
    'bronze-serpent': { h: 4.6, occ: false, shape: 'none', src: 'story3d/bronze-serpent.glb' },
    'bronze-serpent-sm': { h: 1.5, occ: false, shape: 'none', src: 'story3d/bronze-serpent.glb' },
    'refuge-gate': { h: 4.5, occ: false, shape: 'none', src: 'story3d/refuge-gate.glb' },
    // 5편 「사사들과 함께」 동물·소품(GPT 12차 원화 → Meshy, 2026-10-25)
    'lion': { h: 1.1, occ: false, shape: 'none', src: 'animals3d/lion.glb' },
    'fleece': { h: 0.35, occ: false, shape: 'none', src: 'story3d/fleece.glb' },
    'jar-torch': { h: 0.7, occ: false, shape: 'none', src: 'story3d/jar-torch.glb' },
    'jar-torch-sm': { h: 0.45, occ: false, shape: 'none', src: 'story3d/jar-torch.glb' },
    'barley-loaf': { h: 0.25, occ: false, shape: 'none', src: 'story3d/barley-loaf.glb' },
    'jawbone': { h: 0.25, occ: false, shape: 'none', src: 'story3d/jawbone.glb' },
    'honeycomb': { h: 0.45, occ: false, shape: 'none', src: 'story3d/honeycomb.glb' },
    'pillar': { h: 4.2, occ: false, shape: 'none', src: 'story3d/pillar.glb' },
    // 6편 「룻과 사무엘」 동물·소품(GPT 13차 원화 → Meshy, 2026-10-25)
    'milk-cow': { h: 1.35, occ: false, shape: 'none', src: 'animals3d/milk-cow.glb' },
    'cart': { h: 1.0, occ: false, shape: 'none', src: 'story3d/cart.glb' },
    'barley-sheaf': { h: 0.9, occ: false, shape: 'none', src: 'story3d/barley-sheaf.glb' },
    'sandal': { h: 0.1, occ: false, shape: 'none', src: 'story3d/sandal.glb' },
    'lamp': { h: 0.4, occ: false, shape: 'none', src: 'story3d/lamp.glb' },
    'ebenezer-stone': { h: 1.8, occ: false, shape: 'none', src: 'story3d/ebenezer-stone.glb' },
    'ebenezer-stone-sm': { h: 0.5, occ: false, shape: 'none', src: 'story3d/ebenezer-stone.glb' },
  });
  const CALF = [-4, -4], ARK_WORK = [11, -7.5], TENT_MEET = [-28, -12];
  const TAB = { x0: -10, x1: 0, z: -15, hw: 2, h: 3.2, court: [-13, 13, -21, -9] };
  let kadeshNoGlory = false;   // 3편 3장: "구름이 장막 위에서 떠나갔고"(민 12:10) — 두루마리 파일이 잠시 끔   // 성막(서→동, 문은 동쪽) · 뜰
  const ch9on = () => ST.ch === 8 && !ST.cleared, ch10on = () => ST.ch === 9 && !ST.cleared;
  const calfOn = () => ch9on() && ST.step >= stepIdx('c9s4') && ST.step < stepIdx('c9s7');
  const cloudTentOn = () => ST.ch === 8 && (ST.cleared || ST.step > stepIdx('c9s8'));
  const tabFull = () => ST.ch > 9 || (ST.ch === 9 && ST.cleared);
  const arkWorkOn = () => ch10on() && ST.step >= stepIdx('c10s5');
  Object.assign(CONDS, {
    mosesHere: () => !(ch9on() && ST.step >= stepIdx('c9s2') && ST.step < stepIdx('c9s5')),
    before9: () => ST.ch < 8,
    ch9people: () => ch9on() && ST.step <= stepIdx('c9s2'),
    ch9gate: () => ch9on() && ST.step >= stepIdx('c9s7'),
    ch9down: () => ch9on() && ST.step >= stepIdx('c9s5'),
    calfSpot: () => calfOn(),
    tentMeet: () => ST.ch >= 8,
    ch10: () => ST.ch >= 9,
  });
  // 마을 사람·장소 더하기(시내산)
  ZONES.sinai.layout.push(['tent-mid', -31, -15, faceTo(-31, -15, -28, -12)]);
  ZONES.sinai.points.push(
    { id: 'gc_1', x: -7, z: 9, type: 'villager', title: '기다리다 지친 사람', model: 'he-grandpa', persona: 'rs_static', cond: 'ch9people', body: '"모세가 아직도 내려오지 않았어…"' },
    { id: 'gc_2', x: 6, z: 9.5, type: 'villager', title: '모여든 사람', model: 'ca-singer-f', persona: 'rs_static', cond: 'ch9people', body: '"아론에게 가 보자."' },
    { id: 'gc_3', x: -10, z: 3, type: 'villager', title: '진영의 젊은이', model: 'he-boy-hb', persona: 'rs_static', cond: 'ch9people', body: '"산 위는 구름뿐이야."' },
    { id: 'calf_spot', x: CALF[0] + 1.6, z: CALF[1] + 1.6, type: 'lore', title: '금송아지', cond: 'calfSpot', body: '' },
    { id: 'joshua9', x: 4.5, z: -20, type: 'npc', title: '여호수아', model: 'joshua', persona: 'rs_static', cond: 'ch9down' },
    { id: 'camp_gate', x: -9.5, z: 18, type: 'lore', title: '진 문', cond: 'ch9gate', body: '' },
    { id: 'tent_meeting', x: TENT_MEET[0], z: TENT_MEET[1], type: 'lore', title: '회막', cond: 'tentMeet', body: "모세가 항상 장막을 취하여 진 밖에 쳐서 진과 멀리 떠나게 하고 회막이라 이름하니 (출 33:7)" },
    { id: 'of_1', x: 8, z: 9, type: 'villager', title: '예물을 가져온 어머니', model: 'he-mother', persona: 'rs_static', cond: 'ch10', body: "곧 마음에 원하는 남녀가 와서 팔찌와 귀고리와 가락지와 목걸이와 여러 가지 금품을 가져다가 사람마다 여호와께 금 예물을 드렸으며 (출 35:22)" },
    { id: 'of_2', x: -8, z: 9.5, type: 'villager', title: '실을 뽑은 할머니', model: 'he-grandma', persona: 'rs_static', cond: 'ch10', body: "마음에 감동을 받아 슬기로운 모든 여인은 염소 털로 실을 뽑았으며 (출 35:26)" },
    { id: 'of_3', x: 4, z: 13, type: 'villager', title: '조각목을 멘 아버지', model: 'he-father', persona: 'rs_static', cond: 'ch10', body: "섬기는 일에 소용되는 조각목이 있는 모든 자는 가져왔으며 (출 35:24)" },
    { id: 'offer_spot', x: 9, z: -4, type: 'lore', title: '예물 두는 곳', cond: 'ch10', body: "있는 재료가 모든 일을 하기에 넉넉하여 남음이 있었더라 (출 36:7)" },
    { id: 'bezalel', x: 12.5, z: -3, type: 'npc', title: '브살렐', model: 'ca-craftsman', persona: 'rs_static', cond: 'ch10', body: "유다 지파 훌의 손자요 우리의 아들인 브살렐을 (출 35:30)" },
    { id: 'oholiab', x: 14.5, z: -5.5, type: 'villager', title: '오홀리압', model: 'ca-tent-builder', persona: 'rs_static', cond: 'ch10', body: "단 지파 아히사막의 아들 오홀리압을 감동시키사 가르치게 하시며 (출 35:34)" },
  );
  { const mp = ZONES.sinai.points.find(p => p.id === 'moses'); if (mp) mp.cond = 'mosesHere'; }
  for (const id of ['sn_line1', 'sn_line2', 'sn_line3']){ const p = ZONES.sinai.points.find(p => p.id === id); if (p) p.cond = 'before9'; }

  let calfObj = null, tabObj = null, tabStage = -1, cloudTentObj = null, shineObj = null, arkObj = null, gloryObj = null, fx910 = [];
  const toonC = c => new THREE.MeshToonMaterial({ color: c, gradientMap: toonGradient });
  const rm = o => { if (o && o.parent) o.parent.remove(o); return null; };
  async function buildCalf(on){
    calfObj = rm(calfObj); if (!on) return;
    await loadProps(['golden-calf']); if (!Z || Z.id !== 'sinai' || calfObj) return;
    const g = new THREE.Group(), [x, z] = CALF;
    const o = propTemplates['golden-calf'].holder.clone(true); g.add(o);
    const stoneM = toonC(0x9a8a72);
    for (let i = 0; i < 5; i++){ const st = new THREE.Mesh(new THREE.DodecahedronGeometry(0.3, 0), stoneM); st.position.set(1.3 + (i % 2) * 0.4, 0.25 + Math.floor(i / 2) * 0.3, -0.5 + (i % 3) * 0.45); g.add(st); }   // 그 앞의 제단(출 32:5)
    g.position.set(x, heightAt(x, z), z); g.rotation.y = faceTo(x, z, 0, 8); zoneRoot.add(g); calfObj = g;
    obstacles.push({ x, z, r: 1.0 });
  }
  function burnCalf(){
    if (!calfObj) return;
    const p = calfObj.position.clone();
    for (let i = 0; i < 14; i++){ const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, color: 0xffa040, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.9 }));
      sp.position.set(p.x + (Math.random() - 0.5) * 1.6, p.y + 0.4 + Math.random() * 1.4, p.z + (Math.random() - 0.5) * 1.6); sp.scale.set(0.9, 1.3, 1); zoneRoot.add(sp); fx910.push({ o: sp, t: 0, life: 2.6, kind: 'fire' }); }
    setTimeout(() => { calfObj = rm(calfObj); }, 1400);
  }
  async function breakTablets(){
    const m = markers.find(x => x.data.id === 'moses' && !x.hidden); if (!m) return;
    await loadProps(['stone-tablets']);
    const p = m.mesh.position, t = propTemplates['stone-tablets'].holder.clone(true);
    t.position.set(p.x + 0.8, p.y + 1.2, p.z + 0.8); zoneRoot.add(t);
    setTimeout(() => {
      const q = t.position.clone(); rm(t);
      const mat = toonC(0x8d8578);
      for (let i = 0; i < 12; i++){ const s = new THREE.Mesh(new THREE.BoxGeometry(0.16 + Math.random() * 0.12, 0.05, 0.12 + Math.random() * 0.1), mat);
        s.position.copy(q); zoneRoot.add(s); fx910.push({ o: s, t: 0, life: 4, kind: 'shard', v: new THREE.Vector3((Math.random() - 0.5) * 3.5, 2 + Math.random() * 2.5, (Math.random() - 0.5) * 3.5), gy: heightAt(q.x, q.z) + 0.03 }); }
      toast('💥 판들이 산 아래에서 깨졌어요', 2000);
    }, 900);
  }
  function buildCloudTent(on){
    cloudTentObj = rm(cloudTentObj); if (!on) return;
    const g = new THREE.Group(), [x, z] = [TENT_MEET[0] - 1.5, TENT_MEET[1] - 1.5];
    for (let i = 0; i < 16; i++){ const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xf4f6fa, transparent: true, opacity: 0.55, depthWrite: false }));
      sp.position.set((Math.random() - 0.5) * 1.2, 1 + i * 0.75, (Math.random() - 0.5) * 1.2); const s = 2.2 + Math.random() * 1.2; sp.scale.set(s, s, 1); sp.userData.ph = Math.random() * 6; g.add(sp); }
    g.position.set(x, heightAt(x, z), z); zoneRoot.add(g); cloudTentObj = g;
  }
  function setShine(on){
    shineObj = rm(shineObj); if (!on) return;
    const m = markers.find(x => x.data.id === 'moses'); if (!m) return;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, color: 0xfff2b0, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.8 }));
    sp.scale.set(1.1, 1.1, 1); sp.position.set(0, 2.35, 0.1); m.mesh.add(sp); shineObj = sp;
  }
  async function buildArkAt(x, z, rot){
    arkObj = rm(arkObj);
    await loadProps(['ark']); if (!Z || Z.id !== 'sinai') return;
    const o = propTemplates['ark'].holder.clone(true); o.position.set(x, heightAt(x, z), z); o.rotation.y = rot || 0; zoneRoot.add(o); arkObj = o;
  }
  // 성막: 단계(0~16)만큼 지어짐 — 출 40:18-33 순서
  function buildTabernacle(stage){
    if (stage === tabStage && tabObj) return;
    tabObj = rm(tabObj); tabStage = stage; if (stage <= 0) return;
    const g = new THREE.Group(), T = TAB, len = T.x1 - T.x0, cx = (T.x0 + T.x1) / 2, y0 = heightAt(cx, T.z);
    const gold = toonC(0xd8b04a), silver = toonC(0xcfd4da), bronze = toonC(0xa8703a), linen = toonC(0xf4efe2);
    const colors = new THREE.MeshToonMaterial({ color: 0x5a3f9a, gradientMap: toonGradient, side: THREE.DoubleSide });
    const add = (geo, mat, x, y, z, ry = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.y = ry; m.castShadow = true; g.add(m); return m; };
    const walls = [];   // [x, z] 외곽 점(북·남·서)
    for (let x = T.x0; x <= T.x1 + 0.01; x += 1){ walls.push([x, T.z - T.hw], [x, T.z + T.hw]); }
    for (let z = T.z - T.hw + 1; z < T.z + T.hw; z += 1) walls.push([T.x0, z]);
    if (stage >= 1) for (const [x, z] of walls) add(new THREE.BoxGeometry(0.5, 0.3, 0.5), silver, x, y0 + 0.15, z);                 // 받침(은)
    if (stage >= 2){ add(new THREE.BoxGeometry(len, T.h, 0.18), gold, cx, y0 + T.h / 2, T.z - T.hw); add(new THREE.BoxGeometry(len, T.h, 0.18), gold, cx, y0 + T.h / 2, T.z + T.hw); add(new THREE.BoxGeometry(0.18, T.h, T.hw * 2), gold, T.x0, y0 + T.h / 2, T.z); }   // 널판
    if (stage >= 3) for (const hy of [0.8, 1.6, 2.4]){ add(new THREE.BoxGeometry(len, 0.08, 0.26), toonC(0xf0c860), cx, y0 + hy, T.z - T.hw - 0.02); add(new THREE.BoxGeometry(len, 0.08, 0.26), toonC(0xf0c860), cx, y0 + hy, T.z + T.hw + 0.02); }   // 띠
    if (stage >= 4) for (let i = 0; i < 5; i++) add(new THREE.CylinderGeometry(0.1, 0.1, T.h, 8), gold, T.x1, y0 + T.h / 2, T.z - T.hw + i * T.hw / 2);   // 기둥(문)
    if (stage >= 5) add(new THREE.BoxGeometry(len + 0.3, 0.06, T.hw * 2 + 0.3), colors, cx, y0 + T.h + 0.03, T.z);                        // 막(청색·자색·홍색)
    if (stage >= 6){ const c = add(new THREE.BoxGeometry(len + 0.8, 0.12, T.hw * 2 + 0.9), toonC(0x6a3a26), cx, y0 + T.h + 0.14, T.z); const s1 = add(new THREE.BoxGeometry(len + 0.8, T.h * 0.55, 0.08), toonC(0x6a3a26), cx, y0 + T.h * 0.72, T.z - T.hw - 0.4); const s2 = s1.clone(); s2.position.z = T.z + T.hw + 0.4; g.add(s2); }   // 덮개
    if (stage >= 9) add(new THREE.PlaneGeometry(T.hw * 2, T.h), colors, T.x0 + 2.6, y0 + T.h / 2, T.z, Math.PI / 2);                     // 가리개 휘장
    if (stage >= 10) add(new THREE.BoxGeometry(0.9, 0.7, 0.5), gold, T.x0 + 5, y0 + 0.35, T.z - 1.2);                                    // 상
    if (stage >= 11){ add(new THREE.CylinderGeometry(0.05, 0.12, 1.2, 8), gold, T.x0 + 5, y0 + 0.6, T.z + 1.2); add(new THREE.SphereGeometry(0.1, 8, 6), toonC(0xffd060), T.x0 + 5, y0 + 1.25, T.z + 1.2); }   // 등잔대
    if (stage >= 12) add(new THREE.BoxGeometry(0.45, 0.8, 0.45), gold, T.x0 + 3.4, y0 + 0.4, T.z);                                      // 금 향단
    if (stage >= 13) add(new THREE.PlaneGeometry(T.hw * 2, T.h), colors, T.x1 + 0.05, y0 + T.h / 2, T.z, Math.PI / 2);                  // 성막 문 휘장
    if (stage >= 14){ add(new THREE.BoxGeometry(1.8, 1.0, 1.8), bronze, T.x1 + 6, y0 + 0.5, T.z); for (const [dx, dz] of [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]]) add(new THREE.ConeGeometry(0.12, 0.3, 6), bronze, T.x1 + 6 + dx, y0 + 1.15, T.z + dz); }   // 번제단(뿔)
    if (stage >= 15) add(new THREE.CylinderGeometry(0.55, 0.4, 0.6, 14), bronze, T.x1 + 3, y0 + 0.3, T.z);                            // 물두멍
    if (stage >= 16){ const [a, b, c, d] = T.court, H = 1.7;
      for (const [x, z, w, dz] of [[(a + b) / 2, c, b - a, 0], [(a + b) / 2, d, b - a, 0]]) add(new THREE.BoxGeometry(w, H, 0.06), linen, x, y0 + H / 2, z);
      add(new THREE.BoxGeometry(0.06, H, d - c), linen, a, y0 + H / 2, (c + d) / 2);
      add(new THREE.BoxGeometry(0.06, H, (d - c) / 2 - 2.5), linen, b, y0 + H / 2, c + ((d - c) / 2 - 2.5) / 2); add(new THREE.BoxGeometry(0.06, H, (d - c) / 2 - 2.5), linen, b, y0 + H / 2, d - ((d - c) / 2 - 2.5) / 2);
      add(new THREE.BoxGeometry(0.06, H, 5), colors, b + 0.4, y0 + H / 2, (c + d) / 2);   // 뜰 문 휘장
      for (let x = a; x <= b + 0.01; x += 2.6){ add(new THREE.CylinderGeometry(0.06, 0.06, H + 0.2, 6), bronze, x, y0 + (H + 0.2) / 2, c); add(new THREE.CylinderGeometry(0.06, 0.06, H + 0.2, 6), bronze, x, y0 + (H + 0.2) / 2, d); } }
    zoneRoot.add(g); tabObj = g;
    if (stage >= 2 && !g.userData.col){ g.userData.col = true; for (const [x, z] of walls) obstacles.push({ x, z, r: 0.55 }); }
    if (stage >= 14) obstacles.push({ x: T.x1 + 6, z: T.z, r: 1.3 });
  }
  function buildGlory(on){
    gloryObj = rm(gloryObj); if (!on) return;
    const g = new THREE.Group(), cx = (TAB.x0 + TAB.x1) / 2;
    for (let i = 0; i < 26; i++){ const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xfdfbf2, transparent: true, opacity: 0.6, depthWrite: false }));
      sp.position.set((Math.random() - 0.5) * 11, TAB.h + 1.2 + Math.random() * 2.2, (Math.random() - 0.5) * 5); const s = 2.4 + Math.random() * 2; sp.scale.set(s, s * 0.7, 1); sp.userData.ph = Math.random() * 6; g.add(sp); }
    const L = new THREE.PointLight(0xfff0c0, 2.2, 16); L.position.set(0, TAB.h + 1, 0); g.add(L);
    g.position.set(cx, heightAt(cx, TAB.z), TAB.z); zoneRoot.add(g); gloryObj = g;
  }
  function buildCh910(){
    fx910.forEach(f => rm(f.o)); fx910 = [];
    buildCalf(calfOn()); buildCloudTent(cloudTentOn()); setShine(ST.ch === 8 && ST.cleared);
    tabStage = -1; buildTabernacle(tabFull() ? 16 : 0); buildGlory(tabFull());
    if (tabFull()) buildArkAt(TAB.x0 + 1.2, TAB.z, Math.PI / 2); else if (arkWorkOn()) buildArkAt(...ARK_WORK, -0.6); else arkObj = rm(arkObj);
  }
  function updateCh910(dt, now){
    if (!Z || Z.id !== 'sinai') return;
    for (let i = fx910.length - 1; i >= 0; i--){ const f = fx910[i]; f.t += dt;
      if (f.kind === 'fire'){ f.o.position.y += dt * 0.8; f.o.material.opacity = Math.max(0, 0.9 * (1 - f.t / f.life)); }
      if (f.kind === 'shard'){ f.v.y -= 9 * dt; f.o.position.addScaledVector(f.v, dt); if (f.o.position.y < f.gy){ f.o.position.y = f.gy; f.v.set(0, 0, 0); } f.o.rotation.x += dt * 4; }
      if (f.t >= f.life){ rm(f.o); fx910.splice(i, 1); } }
    for (const G of [cloudTentObj, gloryObj]) if (G) G.children.forEach(sp => { if (sp.isSprite){ sp.material.opacity = 0.45 + Math.sin(now * 0.001 + sp.userData.ph) * 0.12; } });
    if (shineObj) shineObj.material.opacity = 0.65 + Math.sin(now * 0.004) * 0.2;
  }
