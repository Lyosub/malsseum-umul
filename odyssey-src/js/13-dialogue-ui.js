  // ── 대화창: [말하는 이, 대사, 표정] / {choice:[…]} / {label} ──
  const dlgEl = document.getElementById('dlg'), dlgFace = document.getElementById('dlg-face');
  let dlgState = null;
  const NOTYPE = /[?&]notype(&|$)/.test(location.search);   // 자동 테스트용: 타자 효과 끔
  const TYPE_MS = 28, READ_WAIT = 600;                       // 글자 간격, 다 나온 뒤 넘길 수 있기까지
  let typeTimer = null;
  function runDialog(lines, onEnd, npcMarker, key){
    dlgState = { lines, i: 0, onEnd, npc: npcMarker, stack: [], key, typing: false, readyAt: 0 };
    if (npcMarker){ meet(npcMarker); dqTalk(npcMarker); }
    talking = !!npcMarker; talkingWith = npcMarker || null;
    dlgEl.classList.remove('hidden'); document.getElementById('hint').classList.add('fade'); showLine();
  }
  function showLine(){
    const st = dlgState; if (!st) return;
    const L = st.lines[st.i];
    const choicesEl = document.getElementById('dlg-choices'), nextBtn = document.getElementById('dlg-next');
    if (!L){ endDialog(); return; }
    if (L.label){ st.i++; showLine(); return; }
    if (L.event){ runEvent(L.event); st.i++; showLine(); return; }
    if (L.choice){
      choicesEl.innerHTML = ''; nextBtn.style.display = 'none';
      L.choice.forEach(c => { const b = document.createElement('button'); b.textContent = c.l; b.onclick = () => pick(c); choicesEl.appendChild(b); });
      return;
    }
    choicesEl.innerHTML = ''; nextBtn.style.display = 'block';
    const [who, text, mood] = L;
    const K = st.key && KEYS[st.key], isKey = !!(K && text.includes(K.t.replace(/^"|"$/g, '')));
    document.getElementById('dlg-name').textContent = (isKey ? '🔑 ' : '') + (who.n || '');
    const tEl = document.getElementById('dlg-text'); tEl.classList.toggle('key', isKey);
    if (isKey && !ST.keys.some(k => k.scene === K.scene)){ ST.keys.push({ scene: K.scene, t: text }); }
    clearInterval(typeTimer);
    const full = text, chars = [...full];
    if (NOTYPE){ tEl.textContent = full; st.typing = false; st.readyAt = 0; }
    else {
      let n = 0; st.typing = true; tEl.textContent = ''; nextBtn.classList.add('wait');
      typeTimer = setInterval(() => {
        n += 1; tEl.textContent = chars.slice(0, n).join('');
        if (n >= chars.length){ clearInterval(typeTimer); st.typing = false; st.readyAt = performance.now() + READ_WAIT; setTimeout(() => nextBtn.classList.remove('wait'), READ_WAIT); }
      }, TYPE_MS);
      st.finish = () => { clearInterval(typeTimer); tEl.textContent = full; st.typing = false; st.readyAt = performance.now() + READ_WAIT; setTimeout(() => nextBtn.classList.remove('wait'), READ_WAIT); };
    }
    if (who.f){ dlgFace.src = A(`ui/game/${who.f}-face-${mood || 'happy'}.jpg`); dlgFace.style.display = 'block'; } else dlgFace.style.display = 'none';
    ST.log.push({ n: who.n || '', t: text });
  }
  function pick(c){
    const st = dlgState;
    ST.log.push({ n: '나의 선택', t: c.l });
    if (c.abort) st.aborted = true;
    if (c.quiz && !ST.quiz[c.quiz]){
      ST.quiz[c.quiz] = c.ok ? 'ok' : 'miss';
      if (c.ok){ ST.stars++; toast('⭐ 지혜 별 +1', 1400); }
      if (Object.keys(QUIZ).every(k => ST.quiz[k] === 'ok') && !ST.badges.includes('wise')){ ST.badges.push('wise'); setTimeout(() => toast('⭐ 배지 획득: 말씀을 새긴 마음', 2400), 1500); }
      saveST();
    }
    if (c.reward){
      const r = c.reward;
      if (r.verse && !ST.verses.includes(r.verse)){ ST.verses.push(r.verse); toast(`📖 새 구절 카드: ${VERSES[r.verse].ref}`, 2200); }
      if (r.badge && !ST.badges.includes(r.badge)){ ST.badges.push(r.badge); toast(`${BADGES[r.badge].ico} 배지 획득: ${BADGES[r.badge].name}`, 2200); }
      saveST();
    }
    if (c.say){ st.stack.push({ lines: st.lines, i: c.back ? st.i : st.i + 1 }); st.lines = c.say; st.i = 0; showLine(); return; }
    const k = st.lines.findIndex(x => x.label === c.go); st.i = k >= 0 ? k : st.i + 1; showLine();
  }
  document.getElementById('dlg-next').onclick = () => {
    const st = dlgState; if (!st) return;
    if (st.typing){ st.finish(); return; }                 // 첫 번째 누름: 문장을 끝까지 보여 줌
    if (performance.now() < st.readyAt) return;             // 다 나온 직후 잠깐은 넘어가지 않음(연타 방지)
    st.i++;
    if (st.i >= st.lines.length && st.aborted){ endDialog(); return; }   // 다시 해 오라는 선택: 안내 대사가 끝나면 대화를 닫음
    if (st.i >= st.lines.length && st.stack.length){ const b = st.stack.pop(); st.lines = b.lines; st.i = b.i; }
    showLine();
  };
  function endDialog(){
    clearInterval(typeTimer);
    const st = dlgState; dlgState = null;
    if (st && st.aborted){ dlgEl.classList.add('hidden'); talking = false; talkingWith = null; saveST(); return; }
    dlgEl.classList.add('hidden'); talking = false; talkingWith = null; saveST();
    st && st.onEnd && st.onEnd();
  }
  function quizLines(key){
    const Q = QUIZ[key]; if (!Q || ST.quiz[key]) return [];
    const K = KEYS[key];
    const opts = [{ l: Q.a, ok: true }, ...Q.w.map(w => ({ l: w }))].sort(() => Math.random() - 0.5);
    return [
      [NAR, '🧩 확인 문제!\n' + Q.q],
      { choice: opts.map(o => ({ l: o.l, quiz: key, ok: !!o.ok, say: o.ok
          ? [[NAR, '정답이에요! ⭐ 지혜 별을 하나 얻었어요.']]
          : [[NAR, '아쉬워요! 🔑 이 말을 다시 볼까요?'], [NAR, K ? K.t.replace(/^"|"$/g, '') : Q.a], [NAR, `정답은 「${Q.a}」예요.`]] })) },
    ];
  }
  function simple(title, body, npc){ runDialog([[{ n: title }, body]], null, npc); }

  // 이 대상과 이야기할 때 이야기 단계가 걸려 있으면 그 단계를 진행
  function storyInteract(m){
    const q = curStep(), d = m.data;
    if (!q || q.zone !== Z.id) return false;
    if (q.count && q.npc === d.id){ runDialog(countLines(), () => giveReward(q.reward, advance), m, 'c2_count'); return true; }
    if (q.game && ((q.npc && q.npc === d.id) || (q.point && q.point === d.id))){ startStoryGame(q); return true; }
    if ((q.npc && q.npc === d.id) || (q.point && q.point === d.id)){
      runDialog(DLG[q.dlg].concat(quizLines(q.dlg)), () => giveReward(q.reward, advance), m.data.model ? m : null, q.dlg);
      return true;
    }
    if (q.rumor && rumorOk(q, d.id)){
      { const P = AP(); P.rumor = P.rumor || []; if (!P.rumor.includes(d.id)) P.rumor.push(d.id); }
      runDialog(RUMORS[d.id].map(t => [{ n: d.title }, t]), () => { renderQuestList(); if (rumorCount(q) >= q.rumor) advance(); }, m);
      return true;
    }
    return false;
  }

  // 짚단(출 5:12): 애굽에서 짚 모으기 단계일 때만 나타나고, 가까이 가면 줍는다
  const straws = [];
  function spawnTasks(){ spawnManna(); applyPlace(); applyWorld(); spawnStraw(); spawnDig(); spawnFrogs(); spawnHerd(); spawnWarn(); spawnMarksStatic(); spawnPillar(); spawnArmy(); spawnCloud(); }
  // 이 단계까지 지정된 자리(place)를 모두 합쳐서 인물을 세움
  function applyPlace(){
    if (!Z) return;
    const pos = {};
    STORY.slice(0, AP().step + 1).forEach(q => { if (q.place && q.zone === Z.id) Object.assign(pos, q.place); });
    for (const [id, xz] of Object.entries(pos)){
      const m = markers.find(x => x.data.id === id); if (!m) continue;
      const [x, z] = typeof nearestWalkable === 'function' && NAV.walk ? nearestWalkable(xz[0], xz[1]) : xz;
      m.mesh.position.set(x, heightAt(x, z), z); if (m.col){ m.col.x = x; m.col.z = z; }
      if (m.ai){ m.ai.persona = { home: [x, z], range: 0, social: 0, like: {} }; m.ai.state = 'idle'; m.ai.path = []; m.ai.t = 1; releasePOI(m); }
    }
  }
  // 강물 색: 2장에서 나일 강을 친 뒤부터 핏빛
  const WATER_BLUE = new THREE.Color(0x4f9fb5), WATER_BLOOD = new THREE.Color(0x7c1a17);
  let bloodT = -1;
  function applyWorld(){
    if (!Z) return;
    if (Z.id === 'rephidim'){
      buildRockWater(rockWaterOn());
      buildBattle(ST.ch === 5 && !ST.cleared && ST.step >= stepIdx('c6s6') && ST.step <= stepIdx('c6s9'));
      if (ST.ch === 5 && !ST.cleared && ST.step >= stepIdx('c6s9')) armyPush = 1;
      buildAltar(ST.ch > 5 || (ST.ch === 5 && (ST.cleared || ST.step >= stepIdx('c6s10'))));
    }
    if (Z.id === 'sinai'){ buildStorm(stormOn()); buildCh910(); }
    if (Z.id === 'kadesh' || Z.id === 'moab' || Z.id === 'shiloh'){ tabStage = -1; buildTabernacle(16); buildGlory(Z.id !== 'kadesh' || !kadeshNoGlory); buildArkAt(TAB.x0 + 1.2, TAB.z, Math.PI / 2); }   // 수 18:1 실로에 회막
    buildCovenantAltar();
    if (Z.id === 'wild') spawnQuail(ST.ch === 4 && !ST.cleared && ST.step >= stepIdx('c5s10') && ST.step <= stepIdx('c5s11'));
    if (Z._water){
      const red = ST.ch === 1 && ST.step >= stepIdx('c2s3') && ST.step < stepIdx('c2s4');   // 이레 뒤(개구리부터)는 원래 물빛
      Z._water.material.color.copy(red ? WATER_BLOOD : WATER_BLUE);
    }
    // 새로고침해도 진행 중인 재앙 효과가 이어지게
    hailOn = ST.ch === 1 && ST.step === stepIdx('c2s18');
    locustOn = ST.ch === 1 && ST.step === stepIdx('c2s20');
    darkOn = ST.ch === 1 && ST.step === stepIdx('c2s22');
    duskOn = ST.ch === 2 && (ST.cleared || ST.step >= stepIdx('c3s6'));
    nightOn = (ST.ch === 2 && (ST.cleared || ST.step >= stepIdx('c3s8'))) || (ST.ch === 3 && !ST.cleared && ST.step >= stepIdx('c4s7') && ST.step <= stepIdx('c4s9'));
    armyOn = ST.ch === 3 && !ST.cleared && ST.step >= stepIdx('c4s4') && ST.step <= stepIdx('c4s9');
    cloudOn = ST.ch === 3 && !ST.cleared && ST.step >= stepIdx('c4s7') && ST.step <= stepIdx('c4s9');
    sea.target = ST.ch === 3 && !ST.cleared && ST.step === stepIdx('c4s9') ? 1 : 0; sea.k = sea.target; applySeaShape();
    { const sd = SCROLL_DEFS[ST.cur]; if (ST.cur !== 'moses' && sd && sd.world) try { sd.world(Z.id); } catch (e){ console.error(e); } }
    reskinNPCs();
  }
  let fliesOn = false;
  function runEvent(name){
    { const sd = SCROLL_DEFS[ST.cur]; if (ST.cur !== 'moses' && sd && sd.events && sd.events[name]){ try { sd.events[name](); } catch (e){ console.error(e); } return; } }
    if (name === 'blood' && Z && Z._water){ bloodT = 0; toast('🩸 나일 강이 피로 변했어요', 2200); }
    if (name === 'dust'){ dustBurst(); toast('🦟 땅의 티끌이 이가 되었어요!', 2000); }
    if (name === 'flies'){ fliesOn = true; toast('🪰 파리 떼가 애굽 온 땅에 이르렀어요', 2200); }
    if (name === 'fliesGone'){ fliesOn = false; fliesGoneSeen = true; }
    if (name === 'ash'){ dustBurst(0x8a8580); toast('🌫 재가 애굽 온 땅의 티끌이 되었어요', 2000); }
    if (name === 'hail'){ hailOn = true; toast('🧊 우박과 불덩이가 내려요 — 고센 땅에는 우박이 없어요', 2600); }
    if (name === 'hailStop'){ hailOn = false; }
    if (name === 'locust'){ locustOn = true; toast('🦗 메뚜기가 온 땅을 덮었어요', 2200); }
    if (name === 'locustGone'){ locustOn = false; toast('🌬 서풍이 메뚜기를 홍해에 몰아넣었어요', 2200); }
    if (name === 'dark'){ darkOn = true; }
    if (name === 'darkEnd'){ darkOn = false; }
    if (name === 'dusk'){ duskOn = true; }
    if (name === 'night'){ nightOn = true; toast('🌙 밤중이 되었어요', 1800); }
    if (name === 'army'){ armyOn = true; spawnArmy(); toast('🐎 서쪽에서 애굽 군대가 다가와요', 2200); }
    if (name === 'cloud'){ cloudOn = true; nightOn = true; spawnCloud(); if (cloudObj) startCine('cloud', cloudObj.position.x, cloudObj.position.y, cloudObj.position.z, { r: 18, h: 7, dur: 5 }); toast('☁️ 구름 기둥이 백성 뒤로 옮겨 갔어요', 2400); }
    if (name === 'part'){ startCine('part', 33, 0, 0, { r: 24, h: 13, dur: 6.5, spin: 0.7 }); sea.target = 1; toast('🌬 큰 동풍이 불어 바닷물이 물러가요', 2400); }
    if (name === 'dawn'){ nightOn = false; }
    if (name === 'close'){ sea.target = 0; armyOn = false; spawnArmy(); cloudOn = false; spawnCloud(); }
    if (name === 'dance'){ startDance(); }
    if (name === 'mosesUp'){ if (Z && Z.mountain) startCine('mosesUp', Z.mountain.x, heightAt(Z.mountain.x, Z.mountain.z) + 14, Z.mountain.z, { r: 42, h: 12, dur: 5, spin: 0.3 }); toast('⛰ 모세가 구름 속으로 들어가 산 위에 올랐어요', 2400); }
    if (name === 'calf'){ buildCalf(true).then(() => { if (calfObj) startCine('calf', calfObj.position.x, calfObj.position.y + 1, calfObj.position.z, { r: 6, h: 2.5, dur: 4.5, spin: 0.8 }); }); }
    if (name === 'breakTablets') breakTablets();
    if (name === 'burnCalf'){ burnCalf(); toast('🔥 모세가 송아지를 불살랐어요', 2000); }
    if (name === 'cloudTent'){ buildCloudTent(true); if (cloudTentObj) startCine('cloudTent', cloudTentObj.position.x, cloudTentObj.position.y + 5, cloudTentObj.position.z, { r: 14, h: 5, dur: 4.5, spin: 0.5 }); }
    if (name === 'shine'){ setShine(true); }
    if (name === 'ark'){ buildArkAt(...ARK_WORK, -0.6).then(() => { if (arkObj) startCine('ark', arkObj.position.x, arkObj.position.y + 0.6, arkObj.position.z, { r: 4.5, h: 1.8, dur: 4, spin: 0.9 }); }); toast('📦 브살렐이 조각목으로 궤를 만들었어요', 2200); }
    if (name === 'glory'){ buildTabernacle(16); buildGlory(true); const cx = (TAB.x0 + TAB.x1) / 2; startCine('glory', cx, heightAt(cx, TAB.z) + 3, TAB.z, { r: 22, h: 9, dur: 6, spin: 0.5 }); toast('☁️ 구름이 회막에 덮였어요', 2400); }
    if (name === 'rockwater'){ buildRockWater(true); toast('💧 반석에서 물이 솟아나요!', 2200); }
    if (name === 'amalek'){ armyPush = 0.5; buildBattle(true); toast('⚔️ 아말렉이 쳐들어왔어요', 2200); }
    if (name === 'storm'){ buildStorm(true); if (Z.mountain) startCine('storm', Z.mountain.x, heightAt(Z.mountain.x, Z.mountain.z) + 12, Z.mountain.z, { r: 40, h: 14, dur: 6, spin: 0.4 }); toast('⚡ 우레와 번개, 나팔 소리!', 2200); }
    if (name === 'sweet'){ toast('💧 쓴 물이 단 물이 되었어요!', 2200); }
    if (name === 'quail'){ spawnQuail(true); toast('🐦 메추라기가 날아와 진영을 덮어요', 2200); }
    if (name === 'manna'){ setTimeout(spawnManna, 50); }
    if (name === 'rhythm' && dlgState && !NOTYPE){ dlgEl.classList.add('hidden'); rhythmGame('', () => { dlgEl.classList.remove('hidden'); }); document.getElementById('mg-close').textContent = '계속하기'; mg.onClose = () => { dlgEl.classList.remove('hidden'); document.getElementById('mg-close').textContent = '나가기'; }; }
    if (name === 'pillar'){ pillarOn = true; spawnPillar(); if (pillarObj) startCine('pillar', pillarObj.position.x, pillarObj.position.y, pillarObj.position.z, { r: 16, h: 5, dur: 5 }); toast('🔥 불 기둥이 백성 앞에 나타났어요', 2400); }
  }
  // 파리 떼는 c2s8~c2s10 동안 애굽 쪽(동쪽)에만 — 고센(서쪽 집들)에는 없음(출 8:22)
  const fliesActive = () => fliesOn || (ST.ch === 1 && ST.step >= stepIdx('c2s8') && ST.step <= stepIdx('c2s10') && !fliesGoneSeen);
  let fliesGoneSeen = false;
  const FLY_N = 260;
  const flyGeo = new THREE.BufferGeometry(); flyGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(FLY_N * 3), 3));
  const dotTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d'); const g = x.createRadialGradient(16, 16, 0, 16, 16, 15); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.6, 'rgba(255,255,255,0.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.beginPath(); x.arc(16, 16, 15, 0, 6.29); x.fill(); return new THREE.CanvasTexture(c); })();
  const flies = new THREE.Points(flyGeo, new THREE.PointsMaterial({ color: 0x1b1712, size: 0.11, map: dotTex, transparent: true, opacity: 0, depthWrite: false }));
  flies.frustumCulled = false; scene.add(flies);
  const flySeed = Array.from({ length: FLY_N }, () => [Math.random() * 6.28, 0.6 + Math.random() * 2.2, 0.3 + Math.random() * 2.2, 2 + Math.random() * 5, Math.random()]);
  const FLY_SPOTS = [[28, -16], [24, -24], [35, -12], [22, 6], [30, 4], [20, -8]];
  let flyAmt = 0;
  function updateFlies(dt, now){
    const t = now * 0.001, egyptSide = Z && Z.id === 'egypt' && fliesActive();
    const px = player.position.x, k = egyptSide ? THREE.MathUtils.clamp((px - 8) / 6, 0, 1) : 0;   // x 8 이하(고센)에서는 없음
    flyAmt += (k - flyAmt) * Math.min(1, dt * 3);
    flies.material.opacity = flyAmt * 0.85; flies.visible = flyAmt > 0.01;
    if (!flies.visible) return;
    const a = flyGeo.attributes.position;
    for (let i = 0; i < FLY_N; i++){
      const [ph, r, h, sp, pick] = flySeed[i];
      let cx, cz;
      if (pick < 0.55){ cx = px; cz = player.position.z; } else { const s2 = FLY_SPOTS[(pick * 97 | 0) % FLY_SPOTS.length]; cx = s2[0]; cz = s2[1]; }
      const ang = ph + t * sp * (i % 2 ? 1 : -1);
      a.setXYZ(i, cx + Math.cos(ang) * r + Math.sin(t * 7 + i) * 0.15, heightAt(cx, cz) + h + Math.sin(t * 5 + i * 1.7) * 0.25, cz + Math.sin(ang) * r);
    }
    a.needsUpdate = true;
  }
  // 티끌 → 이 (출 8:17): 땅에서 흙먼지가 피어오름
  const DUST_N = 180, dustGeo = new THREE.BufferGeometry(); dustGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(DUST_N * 3), 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xb08a5a, size: 0.16, map: dotTex, transparent: true, opacity: 0, depthWrite: false }));
  dust.frustumCulled = false; scene.add(dust);
  let dustT = -1; const dustSeed = Array.from({ length: DUST_N }, () => [Math.random() * 6.28, Math.random() * 6, 0.8 + Math.random() * 2]);
  function dustBurst(color){ dustT = 0; dust.material.color.set(color || 0xb08a5a); }
  function updateDust(dt){
    if (dustT < 0) return; dustT += dt; const k = dustT / 3;
    const a = dustGeo.attributes.position;
    for (let i = 0; i < DUST_N; i++){ const [ph, r, sp] = dustSeed[i]; a.setXYZ(i, player.position.x + Math.cos(ph) * r * (0.3 + k), heightAt(player.position.x, player.position.z) + dustT * sp * 0.7, player.position.z + Math.sin(ph) * r * (0.3 + k)); }
    a.needsUpdate = true; dust.material.opacity = Math.max(0, 0.8 * (1 - k)); if (k >= 1){ dustT = -1; dust.material.opacity = 0; }
  }
  // 도착하기(reach) 과제
  let reachDone = null;
  function updateReach(){
    const q = curStep(); if (!q || !q.reach || !Z || q.zone !== Z.id || dlgState || reachDone === q.id) return;
    const r = q.reach, x = player.position.x;
    if ((r.minX !== undefined && x >= r.minX) || (r.maxX !== undefined && x <= r.maxX) || (r.near && Math.hypot(x - r.near[0], player.position.z - r.near[1]) < r.r)){
      reachDone = q.id;
      if (q.id === 'c2s8') toast('🪰 윙윙… 애굽 쪽은 파리 떼로 가득해요!', 2200);
      if (q.id === 'c2s22'){ const sec = Math.round(stepT); recordBest('dark', sec); setTimeout(() => toast(`🕯 흑암 속에서 ${sec}초 만에 빛을 찾았어요`, 2400), 300); }
      completeTask(q);
    }
  }
  // 고센의 가축(출 9:4-7): 양 우리 안의 양과 밖의 낙타가 천천히 돌아다님. 숫자는 저장마다 정해짐
  const herd = [];
  const PEN_C = [-12, 19];
  // legFrac: 몸 높이 중 다리 부분 비율. 모델 안쪽 좌표(머리 쪽 = +z 또는 -z 상관없이 앞뒤로 흔들림)
  function addGait(obj, legFrac){
    const gait = { ph: { value: 0 }, amp: { value: 0 } };
    obj.traverse(m => {
      if (!m.isMesh) return;
      m.geometry.computeBoundingBox(); const b = m.geometry.boundingBox, H = b.max.y - b.min.y;
      const u = { uMinY: { value: b.min.y }, uLegTop: { value: b.min.y + H * legFrac }, uCx: { value: (b.min.x + b.max.x) / 2 }, uCz: { value: (b.min.z + b.max.z) / 2 }, uLen: { value: H * legFrac } };
      m.material = m.material.clone();
      m.material.onBeforeCompile = sh => {
        Object.assign(sh.uniforms, u, { uGaitPh: gait.ph, uGaitAmp: gait.amp });
        sh.vertexShader = 'uniform float uMinY, uLegTop, uCx, uCz, uLen, uGaitPh, uGaitAmp;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
          if (transformed.y < uLegTop){
            float f = clamp((uLegTop - transformed.y) / max(uLen, 1e-4), 0.0, 1.0);
            float pair = (transformed.x > uCx) == (transformed.z > uCz) ? 0.0 : 3.14159;
            float s = sin(uGaitPh + pair);
            transformed.z += s * uGaitAmp * uLen * 0.42 * f;
            transformed.y += max(0.0, cos(uGaitPh + pair)) * uGaitAmp * uLen * 0.12 * f;
          }`);
      };
      m.material.customProgramCacheKey = () => 'gait';
    });
    return gait;
  }
  const PEN_WALL = 3.6;   // 양 우리 돌담 반지름(대략) — 양은 안쪽, 낙타는 바깥쪽에서만 움직임
  function spawnHerd(){
    herd.forEach(a => zoneRoot.remove(a.o)); herd.length = 0;
    if (!Z || Z.id !== 'egypt' || !propTemplates.lamb || !propTemplates.camel) return;
    if (!ST.herd){ ST.herd = { lamb: 4 + ((Math.random() * 3) | 0), camel: 2 + ((Math.random() * 2) | 0) }; saveST(); }
    const add = (name, n, rMin, rMax) => { for (let i = 0; i < n; i++){
      const a = (i / n) * 6.28 + Math.random() * 0.6, r = rMin + Math.random() * (rMax - rMin);
      const x = PEN_C[0] + Math.cos(a) * r, z = PEN_C[1] + Math.sin(a) * r;
      const o = propTemplates[name].holder.clone(true); o.position.set(x, heightAt(x, z), z); o.rotation.y = Math.random() * 6.28; zoneRoot.add(o);
      const gait = addGait(o, name === 'camel' ? 0.46 : 0.36);
      herd.push({ o, name, rMin, rMax, ang: a, r, ta: a, tr: r, wait: Math.random() * 3, t: Math.random() * 5, gait });
    } };
    add('lamb', ST.herd.lamb, 0.4, PEN_WALL - 1.5);      // 우리 안
    add('camel', ST.herd.camel, PEN_WALL + 2.4, 8.5);    // 우리 밖 둘레
  }
  function updateHerd(dt){
    for (const a of herd){
      a.t += dt; const p = a.o.position;
      // 목표까지: 각도·반지름을 따로 좁혀 감 → 둘레를 따라 호로 걸음(담을 가로지르지 않음)
      let dA = a.ta - a.ang; while (dA > Math.PI) dA -= 6.28; while (dA < -Math.PI) dA += 6.28;
      const dR = a.tr - a.r, arc = Math.abs(dA) * Math.max(a.r, 0.5), dist = Math.hypot(arc, dR);
      const moving = dist > 0.08;
      if (!moving){
        a.wait -= dt; a.gait.amp.value += (0 - a.gait.amp.value) * Math.min(1, dt * 6);
        if (a.wait <= 0){ a.ta = a.ang + (Math.random() - 0.5) * (a.name === 'camel' ? 2.2 : 3.5); a.tr = a.rMin + Math.random() * (a.rMax - a.rMin); a.wait = 2 + Math.random() * 4; }
        p.y = heightAt(p.x, p.z); continue;
      }
      const sp = a.name === 'camel' ? 0.55 : 0.45, st = Math.min(dist, sp * dt), k = st / dist;
      a.ang += dA * k; a.r += dR * k;
      const nx = PEN_C[0] + Math.cos(a.ang) * a.r, nz = PEN_C[1] + Math.sin(a.ang) * a.r, mx = nx - p.x, mz = nz - p.z;
      p.x = nx; p.z = nz; p.y = heightAt(p.x, p.z);
      a.gait.ph.value += dt * (a.name === 'camel' ? 5.5 : 8.5); a.gait.amp.value += (1 - a.gait.amp.value) * Math.min(1, dt * 6);
      if (Math.hypot(mx, mz) > 1e-5){ let want = Math.atan2(mx, mz), df = want - a.o.rotation.y; while (df > Math.PI) df -= 6.28; while (df < -Math.PI) df += 6.28; a.o.rotation.y += df * Math.min(1, dt * 4); }
    }
  }
