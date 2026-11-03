  // ── 9·10장 미니게임 ──
  function hewGame(q){
    mgOpen('🪨 돌판 둘 다듬기', `바늘이 <b>초록 칸</b>에 올 때 눌러 돌판을 다듬어요(4번).<br><span style="opacity:.75">"${HEW_TEXT}" (출애굽기 34:1)</span>`);
    timingGame(4, () => setTimeout(() => { mgCloseAll(); completeTask(q); }, 700));
  }
  function offeringGame(q){
    mgOpen('🎁 자원하는 예물', `공방 재료 가운데 <b>마음에 원하는 만큼</b> 예물로 드려요. 드리지 않아도 이야기는 이어져요.<br><span style="opacity:.75">"${OFFER_TEXT[0]}" (출애굽기 35:5)</span>`);
    const given = {}; let total = 0;
    const draw = () => {
      const have = Object.entries(MATS).filter(([k]) => matN(k) > 0);
      mgArea.innerHTML = have.length ? `<div style="display:flex;flex-wrap:wrap;gap:6px;padding:8px">${have.map(([k, m]) => `<button data-offer="${k}" style="padding:7px 10px;border-radius:10px;border:1px solid rgba(255,210,122,.45);background:rgba(255,255,255,.08);color:#f5e9d0;font-size:13px">${m.ico} ${m.n} <b>${matN(k)}</b>${given[k] ? ` · 드림 ${given[k]}` : ''}</button>`).join('')}</div>`
        : `<div style="padding:14px;font-size:13px;opacity:.85">지금은 가진 재료가 없어요. 괜찮아요 — 이야기는 그대로 이어져요.</div>`;
      mgStat.textContent = total ? `드린 예물 ${total}개` : '';
    };
    draw(); mgAct.textContent = '예물 드리기 마치기'; mgAct.disabled = false;
    mgArea.onclick = e => { const b = e.target.closest('[data-offer]'); if (!b) return; const k = b.dataset.offer; if (matN(k) <= 0) return; ST.mat[k]--; given[k] = (given[k] || 0) + 1; total++; saveST(); draw(); };
    mgAct.onclick = () => { mgArea.onclick = null; mgCloseAll();
      if (total > 0){ toast(`🎁 예물 ${total}개를 드렸어요`, 2000); if (!ST.badges.includes('willing')){ ST.badges.push('willing'); saveST(); setTimeout(() => toast('🎁 배지 획득: 자원하는 마음', 2400), 900); } }
      completeTask(q); };
    mg.onClose = () => { mgArea.onclick = null; };
  }
  function erectGame(q){
    mgOpen('⛺ 성막 세우기', `여호와께서 모세에게 명령하신 대로, <b>차례대로</b> 눌러 성막을 세워요.<br><span style="opacity:.75">"둘째 해 첫째 달 곧 그 달 초하루에 성막을 세우니라" (출애굽기 40:17)</span>`);
    mgArea.style.height = 'auto';
    const order = ERECT.map((t, i) => i).sort(() => Math.random() - 0.5);
    let next = 0, miss = 0;
    const draw = msg => {
      mgArea.innerHTML = `<div style="text-align:center;font-weight:800;color:#ffd27a;font-size:13px;min-height:18px;padding:6px">${msg || (next < ERECT.length ? `${next + 1} / ${ERECT.length} — 무엇을 할 차례일까요?` : '')}</div>`
        + `<div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;padding:4px 8px 10px;max-height:44vh;overflow:auto">${order.filter(i => i >= next).map(i => `<button data-er="${i}" style="padding:7px 6px;border-radius:9px;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.08);color:#f5e9d0;font-size:12px;text-align:left">${ERECT[i]}</button>`).join('')}</div>`;
    };
    draw(); mgAct.textContent = '다 세우면 계속'; mgAct.disabled = true;
    mgArea.onclick = e => {
      const b = e.target.closest('[data-er]'); if (!b) return;
      const i = +b.dataset.er;
      if (i === next){ next++; buildTabernacle(next);
        if (next === 8) buildArkAt(TAB.x0 + 1.2, TAB.z, Math.PI / 2);
        draw(next < ERECT.length ? `✓ ${ERECT[i]}` : '🎉 모세가 이같이 역사를 마치니 (출애굽기 40:33)');
        if (next >= ERECT.length){ mgAct.disabled = false; if (miss <= 1 && !ST.badges.includes('as_commanded')){ ST.badges.push('as_commanded'); saveST(); setTimeout(() => toast('⛺ 배지 획득: 명령하신 대로', 2400), 600); } } }
      else { miss++; b.style.background = 'rgba(224,115,90,.5)'; setTimeout(() => draw(`다시 생각해 봐요 — ${next + 1}번째는?`), 350); }
    };
    mgAct.onclick = () => { if (next < ERECT.length) return; mgArea.onclick = null; mgArea.style.height = ''; mgCloseAll(); completeTask(q); };
    mg.onClose = () => { mgArea.onclick = null; mgArea.style.height = ''; };
  }
  // 손 들기(출 17:11-12): 누르고 있으면 이스라엘이 이기고 팔이 피곤해짐 → 한 번 지치면 돌 놓기 · 아론과 훌이 손 붙들기
  function handsGame(q){
    mgOpen('🙌 손 들기', '「손 들기」를 <b>누르고 있으면</b> 이스라엘이 이기고, 손을 내리면 아말렉이 이겨요. 팔이 피곤해지면 어떻게 될까요?<br><span style="opacity:.75">"모세가 손을 들면 이스라엘이 이기고 손을 내리면 아말렉이 이기더니" (출 17:11)</span>');
    mgArea.style.height = '150px';
    mgArea.innerHTML = `<div style="padding:8px 12px;font-size:12.5px">⚔️ 싸움 <b id="hg-b">50</b>%<div class="oik-bar" style="height:16px"><i id="hg-bar" style="width:50%;background:linear-gradient(90deg,#6fcf6a,#ffd27a)"></i></div>
      💪 팔의 피곤함<div class="oik-bar"><i id="hg-f" style="width:0%;background:linear-gradient(90deg,#ffd27a,#e0735a)"></i></div><div id="hg-msg" style="font-weight:800;color:#ffd27a;min-height:20px"></div>
      <div style="display:flex;gap:6px"><button id="hg-stone" class="hidden" style="flex:1;padding:8px;border-radius:10px;border:none;background:#8fe0ff;font-weight:800">🪨 돌 놓기</button><button id="hg-help" class="hidden" style="flex:1;padding:8px;border-radius:10px;border:none;background:#8fe0ff;font-weight:800">🤝 아론과 훌이 손 붙들기</button></div></div>`;
    mgAct.textContent = '🙌 손 들기(누르고 있기)';
    let battle = 50, fat = 0, holding = false, forced = 0, tired = false, stone = false, help = false, done = false, last = 0;
    const el = id => document.getElementById(id);
    const down = e => { e.preventDefault(); holding = true; }, up = () => { holding = false; };
    mgAct.onpointerdown = down; mgAct.onpointerup = up; mgAct.onpointerleave = up; mgAct.onclick = null;
    const key = e => { if (e.key === ' '){ e.preventDefault(); e.stopPropagation(); holding = e.type === 'keydown'; } };
    window.addEventListener('keydown', key, true); window.addEventListener('keyup', key, true);
    el('hg-stone').onclick = () => { stone = true; el('hg-stone').classList.add('hidden'); el('hg-help').classList.remove('hidden'); el('hg-msg').textContent = '🪨 돌을 가져다 놓아 모세가 그 위에 앉았어요'; };
    el('hg-help').onclick = () => { help = true; fat = 0; el('hg-help').classList.add('hidden'); el('hg-msg').textContent = '🤝 아론과 훌이 이쪽저쪽에서 손을 붙들어 올렸어요 — 해가 지도록!'; };
    const loop = now => {
      const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
      if (!done){
        const up_ = help || (holding && forced <= 0);
        if (forced > 0) forced -= dt;
        battle += (up_ ? (help ? 14 : 9) : -7) * dt; battle = Math.max(8, Math.min(100, battle));
        if (!help){ fat += (holding && forced <= 0 ? 22 : -18) * dt; fat = Math.max(0, Math.min(100, fat)); }
        if (fat >= 100 && forced <= 0){ forced = 2.2; tired = true; fat = 70; el('hg-msg').textContent = '😮‍💨 모세의 팔이 피곤해 손이 내려갔어요… 아말렉이 밀고 와요!'; if (!stone) el('hg-stone').classList.remove('hidden'); }
        el('hg-b').textContent = Math.round(battle); el('hg-bar').style.width = battle + '%'; el('hg-f').style.width = fat + '%';
        armyPush = battle / 100;
        if (battle >= 100){ done = true; el('hg-msg').textContent = '🎉 해가 지도록 손이 내려오지 않았어요 — 여호수아가 아말렉을 무찔렀어요!'; mgAct.textContent = '계속하기'; mgAct.onpointerdown = null; mgAct.onclick = finish; }
      }
      mg.raf = requestAnimationFrame(loop);
    };
    const finish = () => { window.removeEventListener('keydown', key, true); window.removeEventListener('keyup', key, true); mgArea.style.height = ''; mgAct.onpointerdown = mgAct.onpointerup = mgAct.onpointerleave = null; mgCloseAll(); completeTask(q); };
    mg.onClose = () => { window.removeEventListener('keydown', key, true); window.removeEventListener('keyup', key, true); mgArea.style.height = ''; mgAct.onpointerdown = mgAct.onpointerup = mgAct.onpointerleave = null; };
    cancelAnimationFrame(mg.raf); mg.raf = requestAnimationFrame(loop);
  }
  // 십계명(출 20:3-17): 차례대로 눌러 기억하기. 돌판은 나중에 하나님이 친히 쓰셔서 주심(출 31:18) — 넷·여섯 같은 나눔은 넣지 않음
  const TEN = ['너는 나 외에는 다른 신들을 네게 두지 말라', '너를 위하여 새긴 우상을 만들지 말고', '너는 네 하나님 여호와의 이름을 망령되게 부르지 말라', '안식일을 기억하여 거룩하게 지키라', '네 부모를 공경하라', '살인하지 말라', '간음하지 말라', '도둑질하지 말라', '네 이웃에 대하여 거짓 증거하지 말라', '네 이웃의 집을 탐내지 말라'];
  function tabletsGame(q){
    mgOpen('🪨 십계명', '하나님이 이 모든 말씀으로 말씀하신 것을 <b>첫째부터 열째까지 차례대로</b> 눌러 기억해 보세요.<br><span style="opacity:.75">"나는 너를 애굽 땅, 종 되었던 집에서 인도하여 낸 네 하나님 여호와니라" (출 20:2)</span>');
    mgArea.style.height = 'auto';
    const order = TEN.map((t, i) => i).sort(() => Math.random() - 0.5);
    let next = 0, miss = 0;
    const draw = msg => {
      const list = `<div style="background:#b9ab93;border-radius:12px;padding:8px 10px;color:#2a1d10;font-size:11px;line-height:1.35;columns:2;column-gap:12px">${TEN.map((t, i) => `<div style="opacity:${i < next ? 1 : .25}">${i + 1}. ${i < next ? t : '　'}</div>`).join('')}</div>`;
      mgArea.innerHTML = `<div style="padding:8px">${list}</div><div style="text-align:center;font-weight:800;color:#ffd27a;font-size:13px;min-height:18px">${msg || (next < 10 ? `${next + 1}번째 말씀은?` : '')}</div>`
        + `<div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;padding:6px 8px 10px">${order.filter(i => i >= next).map(i => `<button data-ten="${i}" style="padding:7px 6px;border-radius:9px;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.08);color:#f5e9d0;font-size:12px;text-align:left">${TEN[i]}</button>`).join('')}</div>`;
    };
    draw(); mgAct.textContent = '다 기억하면 계속'; mgAct.disabled = true;
    mgArea.onclick = e => {
      const b = e.target.closest('[data-ten]'); if (!b) return;
      const i = +b.dataset.ten;
      if (i === next){ next++; draw(next < 10 ? '✓ 맞아요!' : (miss <= 1 ? '🎉 열 가지를 모두 차례대로 기억했어요! (거의 틀리지 않았어요)' : '🎉 열 가지를 모두 차례대로 기억했어요!')); if (next >= 10){ mgAct.disabled = false; if (miss <= 1 && !ST.badges.includes('ten_words')){ ST.badges.push('ten_words'); saveST(); setTimeout(() => toast('🪨 배지 획득: 십계명', 2400), 600); } } }
      else { miss++; b.style.background = 'rgba(224,115,90,.5)'; setTimeout(() => draw(`다시 생각해 봐요 — ${next + 1}번째 말씀은?`), 350); }
    };
    mgAct.onclick = () => { if (next < 10) return; mgArea.onclick = null; mgArea.style.height = ''; mgCloseAll(); completeTask(q); };
    mg.onClose = () => { mgArea.onclick = null; mgArea.style.height = ''; };
  }
  // 반석의 물(출 17:6): 호렙 반석에서 쏟아지는 물줄기 + 흐르는 시내
  let rockWater = null, battleObj = null, armyPush = 0.5, stormObj = null, mountainObj = null, altarObj = null;
  const rockWaterOn = () => Z && Z.id === 'rephidim' && (ST.ch > 5 || (ST.ch === 5 && (ST.cleared || ST.step > stepIdx('c6s5'))));
  function buildRockWater(on){
    if (rockWater){ rockWater.parent && rockWater.parent.remove(rockWater); rockWater = null; }
    if (!on) return;
    const g = new THREE.Group(), x = -15.5, z = -11.5, y = heightAt(x, z);
    const m = new THREE.MeshToonMaterial({ color: 0x5fb4dc, gradientMap: toonGradient, transparent: true, opacity: 0.85 });
    const fall = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.6, 3.2, 10, 1, true), m); fall.position.set(x, y + 1.6, z); g.add(fall);
    const pts = []; for (let t = 0; t <= 1.0001; t += 0.1){ const px = x + (0 - x) * t * 0.8, pz = z + (2 - z) * t * 0.8; pts.push(new THREE.Vector3(px, heightAt(px, pz) + 0.07, pz)); }
    const stream = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.55, 6, false), m); stream.scale.y = 0.2; stream.position.y = pts[0].y * 0.8; g.add(stream);
    const pool = new THREE.Mesh(new THREE.CircleGeometry(2.2, 20).rotateX(-Math.PI / 2), m); pool.position.set(x + 1.5, y + 0.06, z + 1.5); g.add(pool);
    g.userData.fall = fall; zoneRoot.add(g); rockWater = g;
  }
  // 아말렉과의 싸움(출 17:8-13): 두 무리가 armyPush(0~1)에 따라 밀고 밀림
  function buildBattle(on){
    if (battleObj){ battleObj.parent && battleObj.parent.remove(battleObj); battleObj = null; }
    if (!on) return;
    const g = new THREE.Group(), isr = new THREE.MeshToonMaterial({ color: 0xd9c9a0, gradientMap: toonGradient }), ama = new THREE.MeshToonMaterial({ color: 0x7a3a2a, gradientMap: toonGradient });
    const body = new THREE.CapsuleGeometry(0.28, 0.9, 3, 6), head = new THREE.SphereGeometry(0.22, 6, 5);
    const mk = (mat, side) => { const f = new THREE.Group(); const b = new THREE.Mesh(body, mat); b.position.y = 0.75; const h = new THREE.Mesh(head, mat); h.position.y = 1.5; f.add(b, h); f.userData.side = side; f.userData.ph = Math.random() * 6; return f; };
    for (let i = 0; i < 18; i++){ const f = mk(isr, -1); f.userData.lz = -4 + (i % 6) * 1.6; f.userData.lx = -1 - Math.floor(i / 6) * 1.2; g.add(f); }
    for (let i = 0; i < 18; i++){ const f = mk(ama, 1); f.userData.lz = -4 + (i % 6) * 1.6; f.userData.lx = 1 + Math.floor(i / 6) * 1.2; g.add(f); }
    g.position.set(30, 0, 6); zoneRoot.add(g); battleObj = g;
  }
  function updateBattle(now){
    if (!battleObj) return; const front = (0.5 - armyPush) * 8, t = now / 1000;
    battleObj.children.forEach(f => { const u = f.userData, x = battleObj.position.x + front + u.lx + Math.sin(t * 5 + u.ph) * 0.15, z = battleObj.position.z + u.lz;
      f.position.set(x - battleObj.position.x, heightAt(x, z) + Math.abs(Math.sin(t * 6 + u.ph)) * 0.12, u.lz); f.rotation.y = u.side < 0 ? Math.PI / 2 : -Math.PI / 2; });
  }
  function buildAltar(on){
    if (altarObj){ altarObj.parent && altarObj.parent.remove(altarObj); altarObj = null; }
    if (!on) return;
    const g = new THREE.Group(), x = 18, z = -8, y = heightAt(x, z), stoneM = new THREE.MeshToonMaterial({ color: 0x9a8a72, gradientMap: toonGradient });
    for (let i = 0; i < 9; i++){ const st = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45 + Math.random() * 0.15, 0), stoneM); st.position.set((i % 3 - 1) * 0.7, 0.35 + Math.floor(i / 3) * 0.5, ((i * 7) % 3 - 1) * 0.5); g.add(st); }
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 3.2, 6), new THREE.MeshToonMaterial({ color: 0x6a4a2a, gradientMap: toonGradient })); pole.position.set(1.6, 1.6, 0); g.add(pole);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.9), new THREE.MeshToonMaterial({ color: 0xc03a2a, gradientMap: toonGradient, side: THREE.DoubleSide })); flag.position.set(2.3, 2.7, 0); g.add(flag);
    g.position.set(x, y, z); zoneRoot.add(g); altarObj = g;
  }
  // 시내 산: 코드로 만든 큰 산 + 산 둘레 경계(출 19:12)
  function buildMountain(){
    const M = Z.mountain, mat = new THREE.MeshToonMaterial({ color: 0x9a6a4c, gradientMap: toonGradient, flatShading: true });
    // 봉우리 셋(가운데가 가장 높음) — 매끈한 원뿔이 천막처럼 보이지 않게 울퉁불퉁한 바위산으로
    const peak = (r, h, ox, oz, seed) => {
      const geo = new THREE.ConeGeometry(r, h, 48, 16, true), pa = geo.attributes.position;
      for (let i = 0; i < pa.count; i++){
        const x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i), t = y / h + 0.5;   // 0=바닥 1=꼭대기
        const n = Math.sin(x * 0.9 + seed) * 1.0 + Math.sin(z * 1.3 - y * 0.4 + seed * 2) * 0.8 + Math.cos(x * 0.45 + y * 0.7) * 1.2 + Math.sin(Math.atan2(z, x) * 7 + seed) * 1.4;
        const k = 1 + n * 0.1 * (1 - t * 0.5); pa.setX(i, x * k); pa.setZ(i, z * k); pa.setY(i, y + (t > 0.05 && t < 0.97 ? n * 0.6 : 0));
      }
      geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, mat); m.position.set(M.x + ox, heightAt(M.x + ox, M.z + oz) + h / 2 - 2, M.z + oz); m.receiveShadow = true; zoneRoot.add(m);
      obstacles.push({ x: M.x + ox, z: M.z + oz, r: r * 0.9 });
      return m;
    };
    mountainObj = peak(M.r, M.h, 0, 0, 1.3);
    peak(M.r * 0.72, M.h * 0.62, -M.r * 0.85, 4, 4.1);
    peak(M.r * 0.66, M.h * 0.55, M.r * 0.9, 5, 7.7);
    // 둘째 산(4편 아이와 에발 산의 그리심 산)
    if (Z.mountain2){ const M2 = Z.mountain2; peak(M2.r, M2.h, M2.x - M.x, M2.z - M.z, 2.2); peak(M2.r * 0.7, M2.h * 0.6, M2.x - M.x - M2.r * 0.8, M2.z - M.z + 4, 5.3); }
    // 경계: 산기슭 둘레 말뚝과 줄(시내 산만 — 출 19:12)
    if (Z.id !== 'sinai') return;
    const R = M.r + 4, postM = new THREE.MeshToonMaterial({ color: 0x6a4a2a, gradientMap: toonGradient }), pts = [];
    for (let a = -Math.PI * 0.95; a <= -Math.PI * 0.05 + 1e-6; a += Math.PI / 18){ const x = M.x + Math.cos(a) * R * 1.35, z = M.z - Math.sin(a) * R; const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 1.1, 6), postM); post.position.set(x, heightAt(x, z) + 0.55, z); zoneRoot.add(post); pts.push(new THREE.Vector3(x, heightAt(x, z) + 0.95, z)); }
    zoneRoot.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xd8c49a })));
  }
  // 셋째 날 아침(출 19:16-19): 산 위 빽빽한 구름·번개·불·연기·나팔 소리·진동
  const stormOn = () => Z && Z.id === 'sinai' && ST.ch === 7 && !ST.cleared && ST.step >= stepIdx('c8s5');
  let stormFlashT = 0, stormTrumpT = 0, stormShakeK = 0;
  function buildStorm(on){
    if (stormObj){ stormObj.parent && stormObj.parent.remove(stormObj); stormObj = null; }
    if (!on || !Z.mountain) return;
    const M = Z.mountain, g = new THREE.Group(), top = heightAt(M.x, M.z) + M.h - 2;
    const cm = new THREE.SpriteMaterial({ map: flameTex, color: 0x2a2a34, transparent: true, opacity: 0.85, depthWrite: false });
    for (let i = 0; i < 26; i++){ const sp = new THREE.Sprite(cm); const a = Math.random() * 6.28, r = Math.random() * 9; sp.position.set(M.x + Math.cos(a) * r, top + 2 + Math.random() * 6, M.z + Math.sin(a) * r); sp.scale.set(12, 7, 1); g.add(sp); }
    const smoke = new THREE.SpriteMaterial({ map: flameTex, color: 0x6a6660, transparent: true, opacity: 0.6, depthWrite: false });
    for (let i = 0; i < 14; i++){ const sp = new THREE.Sprite(smoke); sp.position.set(M.x + (Math.random() - 0.5) * 4, top + i * 2.2, M.z + (Math.random() - 0.5) * 4); sp.scale.set(5 + i * 0.6, 5 + i * 0.6, 1); sp.userData.smoke = i; g.add(sp); }
    const fire = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, color: 0xff9a3a, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false })); fire.scale.set(9, 12, 1); fire.position.set(M.x, top + 3, M.z); g.add(fire); g.userData.fire = fire;
    const light = new THREE.PointLight(0xbfd4ff, 0, 140); light.position.set(M.x, top + 8, M.z); g.add(light); g.userData.light = light;
    zoneRoot.add(g); stormObj = g; stormFlashT = 1; stormTrumpT = 0.5;
  }
  function trumpet(){
    try { const c = BGM.ctx || (BGM.ctx = new (window.AudioContext || window.webkitAudioContext)()); const o = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain(), t = c.currentTime;
      o.type = 'sawtooth'; o2.type = 'square'; o.frequency.setValueAtTime(233, t); o.frequency.linearRampToValueAtTime(311, t + 0.4); o2.frequency.setValueAtTime(116, t);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.12, t + 0.3); g.gain.linearRampToValueAtTime(0.1, t + 2.2); g.gain.linearRampToValueAtTime(0, t + 2.8);
      o.connect(g); o2.connect(g); g.connect(c.destination); o.start(t); o2.start(t); o.stop(t + 3); o2.stop(t + 3); } catch (e){}
  }
  function updateStorm(dt, now){
    if (rockWater){ rockWater.userData.fall.material.opacity = 0.7 + Math.sin(now * 0.01) * 0.12; }
    if (!stormObj) return;
    if (!Z || Z.id !== 'sinai' || !Z.mountain || !stormObj.parent){ stormObj = null; return; }   // 시내산을 떠난 뒤에도 남은 번개·연기가 매 프레임 오류를 내던 문제(10/5 학생 오류 2건)
    const g = stormObj, L = g.userData.light;
    stormFlashT -= dt; if (stormFlashT <= 0){ stormFlashT = 2 + Math.random() * 3; L.intensity = 9; stormShakeK = 0.5; const fl = document.getElementById('flash'); if (fl){ fl.style.transition = 'none'; fl.style.opacity = '0.35'; setTimeout(() => { fl.style.transition = 'opacity 0.5s'; fl.style.opacity = '0'; }, 70); } }
    L.intensity *= Math.pow(0.02, dt);
    stormTrumpT -= dt; if (stormTrumpT <= 0){ stormTrumpT = 9; trumpet(); }
    g.userData.fire.material.opacity = 0.75 + Math.sin(now * 0.02) * 0.2;
    g.children.forEach(o => { if (o.userData.smoke !== undefined) o.position.y += dt * 0.8, o.position.y > (heightAt(Z.mountain.x, Z.mountain.z) + Z.mountain.h + 30) && (o.position.y -= 30); });
    if (stormShakeK > 0){ stormShakeK = Math.max(0, stormShakeK - dt); camera.position.x += (Math.random() - 0.5) * stormShakeK * 0.6; camera.position.y += (Math.random() - 0.5) * stormShakeK * 0.4; }
  }

  // ══ 5장: 물웅덩이 · 메추라기 · 만나 ══════════════════════════════
  const MARA_BITTER = new THREE.Color(0x7d7a4a), MARA_SWEET = new THREE.Color(0x4fa0c8);
  let pools = [];
  function buildPools(){
    pools = [];
    Z.pools.forEach(([x, z, r, kind]) => {
      const y = heightAt(x, z);
      const disc = new THREE.Mesh(new THREE.CircleGeometry(r, 28).rotateX(-Math.PI / 2), new THREE.MeshToonMaterial({ color: kind === 'mara' ? MARA_BITTER : MARA_SWEET, gradientMap: toonGradient, transparent: true, opacity: 0.92 }));
      disc.position.set(x, y + 0.08, z); zoneRoot.add(disc);
      const rim = new THREE.Mesh(new THREE.RingGeometry(r, r + 0.35, 28).rotateX(-Math.PI / 2), new THREE.MeshToonMaterial({ color: 0xb89a6a, gradientMap: toonGradient }));
      rim.position.set(x, y + 0.06, z); zoneRoot.add(rim);
      obstacles.push({ x, z, r: r * 0.85 });
      pools.push({ kind, disc });
    });
  }
  const maraSweet = () => ST.ch > 4 || (ST.ch === 4 && (ST.cleared || ST.step > stepIdx('c5s5')));
  let sweetK = 0, quailObj = null, mannaFlakes = [];
  function updatePools(dt){
    if (!pools.length) return;
    const want = maraSweet() ? 1 : 0; sweetK += (want - sweetK) * Math.min(1, dt * 1.2);
    pools.forEach(p => { if (p.kind === 'mara') p.disc.material.color.copy(MARA_BITTER).lerp(MARA_SWEET, sweetK); });
  }
  // 메추라기: 저녁에 진영 둘레로 내려앉음(출 16:13)
  function spawnQuail(on){
    if (quailObj){ quailObj.parent && quailObj.parent.remove(quailObj); quailObj = null; }
    if (!on || !Z || Z.id !== 'wild') return;
    const g = new THREE.Group(), body = new THREE.MeshToonMaterial({ color: 0x8a6a44, gradientMap: toonGradient }), head = new THREE.MeshToonMaterial({ color: 0x5a4430, gradientMap: toonGradient });
    const bg = new THREE.SphereGeometry(0.22, 8, 6), hg = new THREE.SphereGeometry(0.12, 8, 6);
    for (let i = 0; i < 40; i++){
      const a = Math.random() * Math.PI * 2, r = 6 + Math.random() * 12, x = 22 + Math.cos(a) * r, z = 1 + Math.sin(a) * r;
      const q = new THREE.Group(); const b = new THREE.Mesh(bg, body); b.scale.set(1, 0.8, 1.3); const h = new THREE.Mesh(hg, head); h.position.set(0, 0.16, 0.22); q.add(b, h);
      q.position.set(x, heightAt(x, z) + 8 + Math.random() * 6, z); q.rotation.y = Math.random() * 6.28; q.userData = { gy: heightAt(x, z) + 0.18, v: 2 + Math.random() * 2 };
      g.add(q);
    }
    zoneRoot.add(g); quailObj = g;
  }
  function updateQuail(dt){ if (!quailObj) return; quailObj.children.forEach(q => { const u = q.userData; if (q.position.y > u.gy) q.position.y = Math.max(u.gy, q.position.y - u.v * dt); }); }
  // 만나: 이야기(한 오멜 = 5, 여섯째 날 = 10) + 5장을 마친 뒤 매일 아침(한국 시간) — 금요일 갑절, 토요일 없음
  const mannaGeo = new THREE.SphereGeometry(0.09, 6, 4), mannaMat = new THREE.MeshToonMaterial({ color: 0xfbf8ee, gradientMap: toonGradient, emissive: 0x555040 });
  function kstDow(){ return new Date(Date.now() + 9 * 3600e3).getUTCDay(); }   // 0=일 … 5=금 6=토
  function mannaFieldToday(){
    const d = kstDate(); ST.mannaField = ST.mannaField && ST.mannaField.d === d ? ST.mannaField : { d, got: 0 };
    const dow = kstDow(); return dow === 6 ? 0 : dow === 5 ? 10 : 5;
  }
  function spawnManna(){
    mannaFlakes.forEach(f => f.parent && f.parent.remove(f)); mannaFlakes = [];
    if (mannaSun && !live.kind) hudCh.classList.add('hidden'); mannaSun = null;
    if (!Z || Z.id !== 'wild') return;
    const q = curStep(); let n = 0, story = false;
    if (q && q.manna && q.zone === 'wild'){ n = q.manna - (ST.mannaGot || 0); story = true; }
    else if (chaptersDone() >= 5){ n = mannaFieldToday() - ST.mannaField.got; }
    if (n <= 0) return;
    if (!NAV.reach) reachable(0, 0);
    let seed = [...kstDate()].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) % 2147483647;
    const rr = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    for (let k = 0, tries = 0; k < n && tries < 600; tries++){
      const a = rr() * Math.PI * 2, r = 8 + rr() * 12, x = 22 + Math.cos(a) * r, z = 1 + Math.sin(a) * r;
      if (!reachable(x, z) || mannaFlakes.some(f => Math.hypot(f.userData.x - x, f.userData.z - z) < 3)) continue;
      const g = new THREE.Group(); for (let i = 0; i < 9; i++){ const m = new THREE.Mesh(mannaGeo, mannaMat); m.position.set((rr() - 0.5) * 0.8, 0.05, (rr() - 0.5) * 0.8); g.add(m); }
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, color: 0xffffff, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.35 })); glow.scale.set(1.2, 0.8, 1); glow.position.y = 0.3; g.add(glow);
      g.position.set(x, heightAt(x, z), z); g.userData = { x, z, story }; zoneRoot.add(g); mannaFlakes.push(g); k++;
    }
    if (story && mannaFlakes.length) mannaSun = { t0: performance.now(), dur: (q.manna >= 10 ? 110 : 75) * 1000 };
  }
  function updateManna(){
    if (!mannaFlakes.length) return;
    if (mannaSun){   // 출 16:21 — 해가 뜨거워지면 들판의 만나가 스러짐(모은 만큼은 그대로, 이튿날 아침 다시 내림)
      const k = (performance.now() - mannaSun.t0) / mannaSun.dur;
      if (!live.kind){ hudCh.classList.remove('hidden'); hudCh.textContent = `☀️ 햇볕이 뜨거워지기 전에 · ${Math.max(0, Math.ceil((1 - k) * mannaSun.dur / 1000))}초`; }
      mannaFlakes.forEach(f => { if (f.userData.story) f.scale.setScalar(Math.max(0.35, 1 - 0.65 * Math.min(1, k))); });
      if (k >= 1){
        mannaSun = null; if (!live.kind) hudCh.classList.add('hidden');
        for (let i = mannaFlakes.length - 1; i >= 0; i--) if (mannaFlakes[i].userData.story){ zoneRoot.remove(mannaFlakes[i]); mannaFlakes.splice(i, 1); }
        toast('☀️ "무리가 아침마다 각 사람은 먹을 만큼만 거두었고 햇볕이 뜨겁게 쬐면 그것이 스러졌더라" (출 16:21)', 3600);
        setTimeout(() => { const q = curStep(); if (Z && Z.id === 'wild' && q && q.manna){ toast('🌅 이튿날 아침 — 들판에 다시 만나가 내렸어요', 2400); spawnManna(); } }, 4500);
        return;
      }
    }
    const P = player.position;
    for (let i = mannaFlakes.length - 1; i >= 0; i--){
      const f = mannaFlakes[i]; if (Math.hypot(P.x - f.userData.x, P.z - f.userData.z) > 1.1) continue;
      zoneRoot.remove(f); mannaFlakes.splice(i, 1);
      if (f.userData.story){
        const q = curStep(); if (!q || !q.manna) continue;
        ST.mannaGot = (ST.mannaGot || 0) + 1; saveST(); renderQuestList();
        toast(`🍞 만나 ${Math.min(ST.mannaGot, q.manna)} / ${q.manna}`, 900);
        if (ST.mannaGot >= q.manna){ ST.mannaGot = 0; completeTask(q); }
      } else {
        ST.mannaField.got++; addManna(1); mannaStreakTick();
        const left = mannaFieldToday() - ST.mannaField.got;
        toast(left > 0 ? `🍞 오늘의 만나 +1 (남은 ${left}) — 🐾 펫에게 먹일 수 있어요` : '🍞 오늘 거둘 만나를 다 거뒀어요! 내일 아침 또 내려요', 1800);
      }
    }
  }
  // 만나는 그날 쓰는 양식: 다음 날이 되면 벌레가 생겨 사라짐(출 16:20) — 금요일에 거둔 것은 토요일까지(출 16:24)
  function addManna(n){ mannaSpoil(); ST.manna = (ST.manna || 0) + n; ST.mannaDay = kstDate(); saveST(); }
  function mannaSpoil(){
    const today = kstDate(); if (!ST.manna || !ST.mannaDay || ST.mannaDay === today) return;
    const y = new Date(Date.now() + 9 * 3600e3 - 86400e3).toISOString().slice(0, 10);
    if (ST.mannaDay === y && kstDow() === 6 && new Date(Date.parse(y + 'T00:00:00Z')).getUTCDay() === 5) return;   // 금요일 것은 안식일까지 그대로
    const lost = ST.manna; ST.manna = 0; ST.mannaDay = today; saveST();
    setTimeout(() => toast(`🐛 어제 남긴 만나 ${lost}개에 벌레가 생겼어요 (출 16:20) — 만나는 그날 먹여요!`, 3200), 5000);
  }
  function mannaHello(){
    if (!Z || Z.id !== 'wild' || chaptersDone() < 5) return;
    const n = mannaFieldToday();
    setTimeout(() => toast(n === 0 ? '😌 오늘은 안식일이라 들에 만나가 없어요 (출 16:26)' : n === 10 ? '🍞 여섯째 날! 오늘은 만나를 갑절(10개) 거둘 수 있어요' : '🍞 아침 이슬이 마른 뒤, 들판에 만나가 내렸어요 (오늘 5개)', 3000), 1800);
  }

  // 강가 파기(출 7:24): 젖은 흙 자리 중 몇 곳에서만 물이 나온다
  const moundGeo = new THREE.SphereGeometry(0.55, 10, 6), moundMat = new THREE.MeshToonMaterial({ color: 0x6b4a2e, gradientMap: toonGradient });
  const dugMat = new THREE.MeshToonMaterial({ color: 0x3e2a18, gradientMap: toonGradient }), wetMat = new THREE.MeshToonMaterial({ color: 0x3b6f86, gradientMap: toonGradient });
  function spawnDig(){
    for (let i = markers.length - 1; i >= 0; i--) if (markers[i].isDig){ zoneRoot.remove(markers[i].mesh); markers.splice(i, 1); }
    const q = curStep(); if (!q || !q.dig || !Z || Z.id !== 'egypt' || !Z.water) return;
    const need = q.dig - ST.water, spots = [];
    for (let z = -26, k = 0; z <= 26 && spots.length < need * 2 + 1; z += 6.5, k++){
      const [x, zz] = nearestWalkable(Z.water.x1 + 1.3 + (k % 2) * 0.8, z);
      if (Math.abs(zz - z) < 3) spots.push([x, zz]);
    }
    const wetIdx = new Set(); while (wetIdx.size < Math.min(need, spots.length)) wetIdx.add((Math.random() * spots.length) | 0);
    spots.forEach(([x, z], i) => {
      const g = new THREE.Group(); g.position.set(x, heightAt(x, z), z);
      const mound = new THREE.Mesh(moundGeo, moundMat); mound.scale.set(1, 0.28, 1); mound.receiveShadow = true; g.add(mound);
      const glint = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, color: 0xbfe6ff, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.5 }));
      glint.scale.set(0.6, 1.0, 1); glint.position.y = 0.55; g.add(glint);
      const tag = makeTag('젖은 흙'); tag.scale.set(0.16, 0.04, 1); tag.position.y = 1.2; g.add(tag);
      zoneRoot.add(g);
      markers.push({ mesh: g, data: { id: 'dig' + i, type: 'dig', title: '젖은 흙', x, z }, isDig: true, wet: wetIdx.has(i), done: false, mound, glint, tag });
    });
  }
  function doDig(m){
    const q = curStep(); if (!q || !q.dig || m.done || gestureLock) return;
    m.done = true; interactBtn.classList.add('hidden'); nearPoint = null;
    heading = Math.atan2(m.mesh.position.x - player.position.x, -(m.mesh.position.z - player.position.z));
    // Dig 동작(7.2초) 중 몸을 숙였다 일어나는 0.6~2.7초만 쓴다
    playOneShot('Dig', { lockMove: true, startAt: 0.6 });
    setTimeout(() => { if (oneShot && oneShot.name === 'Dig') endOneShot(actions.Dig); }, 2100);
    setTimeout(() => {
      m.glint.visible = false; m.tag.visible = false;
      if (m.wet){
        m.mound.material = wetMat; ST.water++; saveST(); renderQuestList();
        toast(`💧 물이 나왔어요! (${Math.min(ST.water, q.dig)}/${q.dig})`, 1600);
        if (ST.water >= q.dig) setTimeout(() => completeTask(q), 900);
      } else { m.mound.material = dugMat; toast('여기는 마른 흙뿐이에요. 다른 곳을 파 보자', 1600); }
    }, 1000);
  }
  // 개구리(출 8:3-6): 다가가면 강 쪽으로 폴짝폴짝 도망간다
  const frogs = [];
  const frogGeo = new THREE.SphereGeometry(0.2, 8, 6), eyeGeo = new THREE.SphereGeometry(0.06, 6, 4);
  const frogMat = new THREE.MeshToonMaterial({ color: 0x5f9a3a, gradientMap: toonGradient }), pupilMat = new THREE.MeshBasicMaterial({ color: 0x1a1a10 });
  function spawnFrogs(){
    frogs.forEach(f => zoneRoot.remove(f.g)); frogs.length = 0;
    const q = curStep(); if (!q || !q.frogs || !Z || Z.id !== 'egypt') return;
    const houses = Z.layout.filter(([n]) => n.startsWith('hebrew-house') || n === 'reed-hut' || n === 'market-stall');
    const need = q.frogs - ST.frogs;
    for (let k = 0, tries = 0; k < need && tries < 600; tries++){
      const [, hx, hz] = houses[(Math.random() * houses.length) | 0], a = Math.random() * Math.PI * 2, r = 3 + Math.random() * 3;
      const x = hx + Math.cos(a) * r, z = hz + Math.sin(a) * r;
      if (!reachable(x, z) || frogs.some(f => Math.hypot(f.x - x, f.z - z) < 2.5) || Math.hypot(x - player.position.x, z - player.position.z) < 4) continue;
      const g = new THREE.Group();
      const b = new THREE.Mesh(frogGeo, frogMat); b.scale.set(1, 0.72, 1.25); b.position.y = 0.15; b.castShadow = true; g.add(b);
      for (const sx of [-0.09, 0.09]){ const e = new THREE.Mesh(eyeGeo, frogMat); e.position.set(sx, 0.3, 0.15); g.add(e); const pu = new THREE.Mesh(eyeGeo, pupilMat); pu.scale.setScalar(0.45); pu.position.set(sx, 0.32, 0.2); g.add(pu); }
      g.scale.setScalar(2.4); g.position.set(x, heightAt(x, z), z); g.rotation.y = Math.random() * 6.28;
      zoneRoot.add(g); frogs.push({ g, x, z, t: Math.random() * 3, flee: -1, vx: 0, vz: 0 }); k++;
    }
  }
  function updateFrogs(dt){
    const q = curStep(); if (!q || !q.frogs || !frogs.length) return;
    for (let i = frogs.length - 1; i >= 0; i--){
      const f = frogs[i]; f.t += dt;
      const dx = f.x - player.position.x, dz = f.z - player.position.z, d = Math.hypot(dx, dz);
      if (f.flee < 0 && d < 2.2){
        f.flee = 0; const toRiver = Z.water ? -1 : 0;
        const vx = dx / d + toRiver * 0.8, vz = dz / d, l = Math.hypot(vx, vz) || 1;
        f.vx = vx / l * 3.2; f.vz = vz / l * 3.2; f.g.rotation.y = Math.atan2(f.vx, f.vz);
      }
      if (f.flee >= 0){
        f.flee += dt; f.x += f.vx * dt; f.z += f.vz * dt;
        f.g.position.set(f.x, heightAt(f.x, f.z) + Math.abs(Math.sin(f.flee * 9)) * 0.45, f.z);
        if (f.flee > 1.1){ zoneRoot.remove(f.g); frogs.splice(i, 1); ST.frogs++; saveST(); renderQuestList();
          toast(`🐸 개구리를 몰아냈어요 (${Math.min(ST.frogs, q.frogs)}/${q.frogs})`, 900);
          if (ST.frogs >= q.frogs){ ST.frogs = q.frogs; saveST(); setTimeout(() => completeTask(q), 700); } }
      } else {
        const hop = (f.t % 2.4) < 0.35 ? Math.sin((f.t % 2.4) / 0.35 * Math.PI) * 0.25 : 0;   // 가끔 제자리에서 폴짝
        f.g.position.y = heightAt(f.x, f.z) + hop;
      }
    }
  }
  function spawnStraw(){
    straws.forEach(o => zoneRoot.remove(o.obj)); straws.length = 0;
    const q = curStep(); if (!q || !q.collect || Z.id !== 'egypt') return;
    const need = q.collect - ST.straw;
    const mat = new THREE.MeshToonMaterial({ color: 0xd9b45a, gradientMap: toonGradient }), band = new THREE.MeshToonMaterial({ color: 0x8a6a3a, gradientMap: toonGradient });
    for (let k = 0, tries = 0; k < need && tries < 400; tries++){
      const a = rand() * Math.PI * 2, r = 9 + rand() * 15, x = Z.center[0] + Math.cos(a) * r, z = Z.center[1] + Math.sin(a) * r;
      if (!reachable(x, z) || Math.hypot(x - PEN_C[0], z - PEN_C[1]) < PEN_WALL + 1.2 || straws.some(o => Math.hypot(o.x - x, o.z - z) < 6)) continue;
      const g = new THREE.Group();
      for (let i = 0; i < 7; i++){ const c = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.1, 5), mat); c.rotation.z = Math.PI / 2 + (Math.random() - 0.5) * 0.3; c.rotation.y = (Math.random() - 0.5) * 0.4; c.position.set(0, 0.18 + (i % 3) * 0.1, (i - 3) * 0.07); c.castShadow = true; g.add(c); }
      const b = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.04, 5, 10), band); b.rotation.y = Math.PI / 2; b.position.y = 0.28; g.add(b);
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, color: 0xfff2b0, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.55 }));
      glow.scale.set(0.9, 1.6, 1); glow.position.y = 0.9; g.add(glow);
      g.position.set(x, heightAt(x, z), z); zoneRoot.add(g); straws.push({ obj: g, x, z, glow }); k++;
    }
  }
  function updateStraw(now){
    const q = curStep(); if (!q || !q.collect || !straws.length) return;
    for (let i = straws.length - 1; i >= 0; i--){
      const o = straws[i]; o.glow.material.opacity = 0.35 + 0.25 * Math.sin(now * 0.005 + i);
      if (Math.hypot(player.position.x - o.x, player.position.z - o.z) < 1.4){
        zoneRoot.remove(o.obj); straws.splice(i, 1); ST.straw++; saveST(); renderQuestList();
        toast(`🌾 짚단 ${Math.min(ST.straw, q.collect)}/${q.collect}`, 1000);
        if (ST.straw >= q.collect) completeTask(q);
      }
    }
  }

  // 방향 힌트: 한 단계에 오래 머물면(40초~) 목표 쪽 화살표가 서서히 나타남
  const mmEl = document.getElementById('minimap'), compassEl = document.getElementById('compass'), compassArrow = document.getElementById('compass-arrow');
  const ROUTE = { alpha: { midian: 'to-midian', egypt: 'to-midian', redsea: 'to-midian' }, midian: { alpha: 'to-alpha', egypt: 'to-egypt', redsea: 'to-egypt' }, egypt: { midian: 'to-midian2', alpha: 'to-midian2', redsea: 'to-redsea' }, redsea: { egypt: 'to-egypt3', midian: 'to-egypt3', alpha: 'to-alpha3', wild: 'to-wild' }, wild: { redsea: 'to-redsea2', egypt: 'to-redsea2', midian: 'to-redsea2', alpha: 'to-redsea2', rephidim: 'to-rephidim', sinai: 'to-rephidim' },
    rephidim: { wild: 'to-wild2', redsea: 'to-wild2', egypt: 'to-wild2', midian: 'to-wild2', alpha: 'to-wild2', sinai: 'to-sinai' },
    sinai: { rephidim: 'to-rephidim2', wild: 'to-rephidim2', redsea: 'to-rephidim2', egypt: 'to-rephidim2', midian: 'to-rephidim2', alpha: 'to-rephidim2' } };
  ['alpha', 'midian', 'egypt', 'redsea'].forEach(z => { ROUTE[z].rephidim = ROUTE[z].wild; ROUTE[z].sinai = ROUTE[z].wild; });
  ['alpha', 'midian', 'egypt'].forEach(z => { ROUTE[z].wild = ROUTE[z].redsea; });
  // 가데스(3편)는 시내 산 동쪽 출구로만 이어진다
  ROUTE.kadesh = {}; Object.keys(ROUTE).forEach(z => { if (z === 'kadesh') return; ROUTE.kadesh[z] = 'to-sinai3'; ROUTE[z].kadesh = z === 'sinai' ? 'to-kadesh' : ROUTE[z].sinai; });
  ROUTE.moab = {}; Object.keys(ROUTE).forEach(z => { if (z === 'moab') return; ROUTE.moab[z] = 'to-kadesh2'; ROUTE[z].moab = z === 'kadesh' ? 'to-moab' : ROUTE[z].kadesh; });
  // 길갈과 여리고(4편)는 모압 평지에서 요단을 건너야 이어진다
  ROUTE.gilgal = {}; Object.keys(ROUTE).forEach(z => { if (z === 'gilgal') return; ROUTE.gilgal[z] = 'to-moab4'; ROUTE[z].gilgal = z === 'moab' ? 'to-gilgal' : ROUTE[z].moab; });
  // 아이와 에발 산(4편 7·8장)은 길갈 서쪽 길로만 이어진다
  ROUTE.ai = {}; Object.keys(ROUTE).forEach(z => { if (z === 'ai') return; ROUTE.ai[z] = 'to-gilgal3'; ROUTE[z].ai = z === 'gilgal' ? 'to-ai' : ROUTE[z].gilgal; });
  // 4편 3부: 기브온(서쪽 길) · 헤브론 산지(남쪽 길) · 실로와 세겜(북쪽 길) — 모두 길갈에서만 이어진다
  [['gibeon', 'to-gilgal4', 'to-gibeon'], ['hebron', 'to-gilgal5', 'to-hebron'], ['shiloh', 'to-gilgal6', 'to-shiloh']].forEach(([nz, back, go]) => {
    ROUTE[nz] = {}; Object.keys(ROUTE).forEach(z => { if (z === nz) return; ROUTE[nz][z] = back; ROUTE[z][nz] = z === 'gilgal' ? go : ROUTE[z].gilgal; }); });
  // 5편: 이스르엘 골짜기는 실로에서 북쪽 길로만 이어진다
  ROUTE.jezreel = {}; Object.keys(ROUTE).forEach(z => { if (z === 'jezreel') return; ROUTE.jezreel[z] = 'to-shiloh-j'; ROUTE[z].jezreel = z === 'shiloh' ? 'to-jezreel' : ROUTE[z].shiloh; });
  // 5편 8~10장: 블레셋 평지는 기브온에서 서쪽 길로만 이어진다
  ROUTE.philistia = {}; Object.keys(ROUTE).forEach(z => { if (z === 'philistia') return; ROUTE.philistia[z] = 'to-gibeon-p'; ROUTE[z].philistia = z === 'gibeon' ? 'to-philistia' : ROUTE[z].gibeon; });
  // 6편: 베들레헴은 헤브론 산지에서 서북쪽 길로만 이어진다
  ROUTE.bethlehem = {}; Object.keys(ROUTE).forEach(z => { if (z === 'bethlehem') return; ROUTE.bethlehem[z] = 'to-hebron-b'; ROUTE[z].bethlehem = z === 'hebron' ? 'to-bethlehem' : ROUTE[z].hebron; });
  // 7편: 기브아와 믹마스는 기브온 마을에서 동북쪽 길로만 이어진다
  ROUTE.gibeah = {}; Object.keys(ROUTE).forEach(z => { if (z === 'gibeah') return; ROUTE.gibeah[z] = 'to-gibeon-g'; ROUTE[z].gibeah = z === 'gibeon' ? 'to-gibeah' : ROUTE[z].gibeon; });
  // 7편 12장: 유다 광야는 헤브론 산지에서 동쪽 길로만 이어진다
  ROUTE.judah = {}; Object.keys(ROUTE).forEach(z => { if (z === 'judah') return; ROUTE.judah[z] = 'to-hebron-w'; ROUTE[z].judah = z === 'hebron' ? 'to-judah' : ROUTE[z].hebron; });
  ROUTE.redsea.rephidim = 'to-wild'; ROUTE.redsea.sinai = 'to-wild';
  let doorTarget = null;
  function targetPos(){
    doorTarget = null;
    const q = curStep(); if (!q || !Z) return null;
    const find = id => markers.find(m => m.data.id === id && !m.hidden);
    if (q.zone !== Z.id){ const ex = find(ROUTE[Z.id][q.zone]); return ex && ex.mesh.position; }
    if (q.npc || q.point || q.exit || q.skillAt){
      const m = find(q.npc || q.point || q.exit || q.skillAt); if (!m) return null;
      if (Z.room && inRoom(m.mesh.position.x, m.mesh.position.z) !== inRoom(player.position.x, player.position.z)){
        const door = find(inRoom(player.position.x, player.position.z) ? 'palace-out' : 'palace-in'); doorTarget = door && door.data.id; return door && door.mesh.position;
      }
      return m.mesh.position;
    }
    if (q.rumor){ const m = markers.filter(m => rumorOk(q, m.data.id) && !ST.rumor.includes(m.data.id)).sort((a, b) => a.mesh.position.distanceTo(player.position) - b.mesh.position.distanceTo(player.position))[0]; return m && m.mesh.position; }
    if (q.warn){ const m = markers.filter(x => x.isWarn && !x.done).sort((a, b) => a.mesh.position.distanceTo(player.position) - b.mesh.position.distanceTo(player.position))[0]; return m && m.mesh.position; }
    if (q.reach && q.reach.near){ return new THREE.Vector3(q.reach.near[0], 0, q.reach.near[1]); }
    if (q.reach){ return q.reach.minX !== undefined ? (Z.id === 'redsea' ? new THREE.Vector3(56, 0, 0) : new THREE.Vector3(24, 0, -12)) : new THREE.Vector3(-4, 0, 0); }
    if (q.dig){ const m = markers.filter(x => x.isDig && !x.done).sort((a, b) => a.mesh.position.distanceTo(player.position) - b.mesh.position.distanceTo(player.position))[0]; return m && m.mesh.position; }
    if (q.frogs && frogs.length){ return frogs.map(f => new THREE.Vector3(f.x, 0, f.z)).sort((a, b) => a.distanceTo(player.position) - b.distanceTo(player.position))[0]; }
    if (q.manna && mannaFlakes.length){ return mannaFlakes.map(o => new THREE.Vector3(o.userData.x, 0, o.userData.z)).sort((a, b) => a.distanceTo(player.position) - b.distanceTo(player.position))[0]; }
    if (q.collect && straws.length){ return straws.map(o => new THREE.Vector3(o.x, 0, o.z)).sort((a, b) => a.distanceTo(player.position) - b.distanceTo(player.position))[0]; }
    return null;
  }
  // 💡 막힌 단계 선택적 힌트(2026-10-26 전도사님 요청): 한 단계에 HINT_WAIT초 넘게 머물면 버튼이 나타나고, 누를 때만 돕는다.
  //  1번째: 누구·어디로 가야 하는지 글로 + 나침반 바로 켜기 → 2번째: 목표 자리에 빛기둥 / 다른 마을이면 그 마을로 바로 이동
  const HINT_WAIT = 45, hintBtn = document.getElementById('hint-btn');
  function hintText(q){
    const find = id => markers.find(m => m.data.id === id && !m.hidden), nm = m => m && (m.data.title || m.data.name);
    if (Z && q.zone !== Z.id) return `이 단계는 「${ZONES[q.zone].name}」에서 해요. 위쪽 🧭 화살표를 따라 마을 출구로 가요.`;
    const m = find(q.npc || q.point || q.exit || q.skillAt);
    let t = q.skillAt && m ? `「${nm(m)}」 가까이에서 반짝이는 스킬 버튼을 눌러요.`
      : q.npc && m ? `「${nm(m)}」에게 다가가서 「대화하기」를 눌러요.`
      : q.point && m ? `「${nm(m)}」(으)로 가까이 가서 버튼을 눌러요.`
      : q.exit && m ? `「${nm(m)}」(으)로 걸어가요.`
      : q.rumor ? '아직 이야기하지 않은 마을 사람들에게 다가가 말을 걸어요.'
      : `할 일: ${q.obj}`;
    if (q.where && !t.includes(q.where)) t += `\n💡 ${q.where}`;
    return t + '\n🧭 위쪽 화살표가 가는 쪽을 가리켜요.';
  }
  function showHintBeam(p){
    if (hintBeam){ zoneRoot.remove(hintBeam); hintBeam = null; }
    if (!p) return;
    const mat = new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 40, 18, 1, true), mat);
    b.position.set(p.x, heightAt(p.x, p.z) + 20, p.z); zoneRoot.add(b); hintBeam = b;
    const t0 = performance.now(), key = hintKey;
    const tick = () => { if (hintBeam !== b) return; const e = (performance.now() - t0) / 1000;
      if (e > 14 || hintKey !== key || !b.parent){ zoneRoot.remove(b); b.geometry.dispose(); mat.dispose(); if (hintBeam === b) hintBeam = null; return; }
      mat.opacity = 0.28 + Math.sin(e * 4) * 0.14; requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }
  hintBtn.addEventListener('click', e => {
    e.stopPropagation(); const q = curStep(); if (!q || !Z) return;
    if (hintLv === 0){ hintLv = 1; hintMsg = hintText(q).split('\n')[0]; toast(hintText(q), 6000); renderQuestList(); questPeek(); return; }
    if (q.zone !== Z.id){   // 다른 마을: 이야기가 있는 마을로 바로(바로 이어진 출구면 그 출구로 — 출구를 지나는 단계도 함께 끝남)
      const ex = markers.find(m => m.data.id === ROUTE[Z.id][q.zone] && !m.hidden);
      hintLv = 2; hintBtn.classList.remove('show'); hintOn = false;
      travelTo(ex && ex.data.to === q.zone ? ex.data : { id: 'hint', to: q.zone, spawn: ZONES[q.zone].spawn }).then(() => {
        const q2 = curStep(); hintLv = 1; hintMsg = q2 ? hintText(q2).split('\n')[0] : ''; renderQuestList(); });
      return;
    }
    hintLv = 2; const p = targetPos();
    if (p){ showHintBeam(p); toast('✨ 빛기둥이 솟은 곳으로 가 보세요!', 3000); } else toast(hintText(q), 6000);
  });
  function updateCompass(dt){
    stepT += dt;
    const t = targetPos();
    const far = t && Math.hypot(t.x - player.position.x, t.z - player.position.z) > 10;
    const q = curStep(), wait = q && q.id === 'c2s22' ? 3 : q && (q.manna || q.npc || q.point || q.rumor || q.exit || q.dig || q.reach || q.warn || q.skillAt) ? 10 : 40;
    document.querySelectorAll('.skill-btn').forEach(b => b.classList.toggle('tut-glow', !!(q && q.skillAt) && (b.classList.contains('skill-toggle') ? !skillOpen : true)));
    const show = t && far && (stepT > wait || hintLv > 0);
    { const k = q ? ST.cur + ':' + AP().ch + ':' + AP().step : '';   // 단계가 바뀌면 힌트 단계 처음으로
      if (k !== hintKey){ hintKey = k; if (hintLv){ hintLv = 0; hintMsg = ''; renderQuestList(); } }
      const on = !!q && !REPLAY && stepT > HINT_WAIT, lab = !on ? '' : hintLv === 0 ? '💡 막혔나요? 힌트' : (Z && q.zone !== Z.id) ? '🚀 그곳으로 데려다줘요' : '💡 더 큰 힌트';
      if (on !== hintOn){ hintOn = on; hintBtn.classList.toggle('show', on); }
      if (on && lab !== hintBtn.textContent) hintBtn.textContent = lab; }
    compassEl.style.opacity = show ? String(Math.min(0.9, (stepT - wait) / 6)) : '0';
    if (show){
      const dx = t.x - player.position.x, dz = t.z - player.position.z;
      const fx = -Math.sin(camYaw), fz = -Math.cos(camYaw);            // 카메라가 보는 방향
      const ang = Math.atan2(fx * dz - fz * dx, fx * dx + fz * dz);      // 화면 기준 각도(위=앞)
      compassArrow.setAttribute('transform', `rotate(${(-ang * 180 / Math.PI).toFixed(1)} 23 23)`);
    }
  }

