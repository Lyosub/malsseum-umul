// 8편 「다윗 왕」 — 사무엘하 1–24장 · 역대상 22·28–29장(2026-11-24 전도사님 결정: 13장 4부, 다 만든 뒤 한 번에 배포).
// 대사·구절 카드는 E:\temp\claude-work\david8\gen8.py가 개역개정 원문 파일(2sa.json)에서 그대로 뽑는다(손으로 옮기지 않음).
// 무대: 1장 블레셋 평지 시글락 · 2장 헤브론 산지·기브온 못 · 3장 헤브론 → 예루살렘(새 마을)·르바임 골짜기 · 4장 기브온 마을 기럇여아림(6편 궤를 둔 곳) → 예루살렘
(window.__odyQ = window.__odyQ || []).push(api => {
  const { DLG, ZONES, CONDS, VERSES, THREE, SPEAKERS: { NAR } } = api;
  const DAVID = { n: '다윗' }, YOUTH = { n: '소식을 전한 청년' }, TRIBES = { n: '이스라엘 모든 지파' }, MESSENGER = { n: '어떤 사람' }, MICHAL = { n: '미갈' }, NATHAN = { n: '나단' },
    ZIBA = { n: '시바' }, MEPHIB = { n: '므비보셋' }, ITTAI = { n: '잇대' }, SHIMEI = { n: '시므이' }, ABISHAI = { n: '아비새' }, CUSHITE = { n: '구스 사람' }, BARZILLAI = { n: '바르실래' },
    JOAB = { n: '요압' }, GAD = { n: '갓' }, ARAUNAH = { n: '아라우나' };
/*DLG*/
  const cur = () => api.ST.cur === 'david' && api.ST.sp.david ? api.ST.sp.david : null;
  const at = (ch, a = 0, b = 99) => () => { const p = cur(); return !!p && p.ch === ch && !p.cleared && p.step >= a && p.step <= b; };
  const any = (...fs) => () => fs.some(f => f());
  // 인물 모델 — GPT 15차 원화 → Meshy 3D(11/25). 다윗은 1장 청년(7편 모델) → 2장부터 왕 → 3부(9장)부터 늙은 왕
  const M_ = { davidY: 's7-david-young', david: 'd8-david-king', davidOld: 'd8-david-old', youth: 'he-boy-hb', joab: 'd8-joab', abner: 'd8-abner', abishai: 's7-abishai',
    elders: 'ca-israel-elder', people: 'he-brickmaker', michal: 's7-michal', nathan: 'd8-nathan', gad: 'd8-gad', mephib: 'd8-mephibosheth', ziba: 'd8-ziba', absalom: 'd8-absalom',
    hushai: 'd8-hushai', shimei: 'd8-shimei', barzillai: 'd8-barzillai', ittai: 'd8-ittai', benaiah: 'd8-benaiah', araunah: 'd8-araunah', solomon: 'd8-solomon',
    levite: 'he-levite', messenger: 'ca-horn-blower', cushite: 's7-egyptian-boy', obed: 'he-father' };
  // ── 자리 ──
  const ZIKLAG = [0, -12];                                                       // 블레셋 평지 시글락(7편 15장과 같은 자리)
  const HEB = [-4, 12], HEBGATE = [0, -4];                                       // 헤브론 산지 — 헤브론 성읍
  const POOL = [-18, 22];                                                        // 기브온 마을 — 기브온 못(삼하 2:13)
  const KIRJATH = [26, 24], NACON = [16, 30], OBED = [4, 34];                    // 기브온 마을 — 기럇여아림(6편 궤를 둔 곳) · 나곤의 타작 마당 · 오벧에돔의 집
  const SGATE = [0, 30], PALACE = [-8, 2], TENT = [8, -6], REPHAIM = [-44, -8], MULB = [-48, -8], ROAD = [-12, 36];   // 예루살렘(엔진이 세운 다윗 성)
  // 단계 번호
  // 0장: 0 시글락의 소식 · 1 활 노래
  // 1장: 0 여쭈어 · 1 헤브론의 왕 · 2 기브온 못 · 3 아브넬의 애도
  // 2장: 0 온 지파가 헤브론에 · 1 시온 산성 · 2 르바임 골짜기 · 3 뽕나무 꼭대기의 걸음 소리
  // 3장: 0 새 수레 · 1 나곤의 타작 마당 · 2 오벧에돔의 집 · 3 여섯 걸음
  let arkHome = false, cartAt = '';   // 4장 행렬 뒤 궤가 장막 안에 · 새 수레가 있는 곳
  Object.assign(CONDS, {
    dvOn: () => !!cur(),
    dvZiklag: at(0, 0, 1), dvAsk: at(1, 0, 0), dvHebron: at(1, 1, 1), dvPool: at(1, 2, 2), dvAbner: at(1, 3, 3),
    dvTribes: at(2, 0, 0), dvZion: at(2, 1, 1), dvRephaim: at(2, 2, 3), dvMulb: at(2, 3, 3),
    dvCart: at(3, 0, 0), dvNacon: at(3, 1, 1), dvObed: at(3, 2, 2), dvMarch: at(3, 3, 3),
  });
  Object.assign(CONDS, { dvHebAb: any(CONDS.dvHebron, CONDS.dvAbner), dvMichal: () => arkHome && CONDS.dvMarch() });
  const ZP = ZONES.philistia.points, ZH = ZONES.hebron.points, ZB = ZONES.gibeon.points, ZJ = ZONES.jerusalem.points;
  const V_ = (Z, id, xz, title, model, cond, dx = 0, dz = 0, ex = {}) => Z.push({ id, x: xz[0] + dx, z: xz[1] + dz, type: 'villager', title, model, cond, ...ex });
  const L_ = (Z, id, xz, title, cond, dx = 0, dz = 0) => Z.push({ id, x: xz[0] + dx, z: xz[1] + dz, type: 'lore', title, cond, body: '' });
  // 1장 시글락
  L_(ZP, 'dv_ziklag', ZIKLAG, '시글락 — 다윗이 머문 곳', 'dvZiklag', 0, 3);
  V_(ZP, 'dv_david1', ZIKLAG, '다윗', M_.davidY, 'dvZiklag', -1.6, 4.4);
  V_(ZP, 'dv_youth', ZIKLAG, '사울의 진영에서 온 사람', M_.youth, 'dvZiklag', 1.6, 5.2);
  // 2장 여쭈어 · 헤브론 · 기브온 못
  V_(ZP, 'dv_david_ask', ZIKLAG, '다윗', M_.davidY, 'dvAsk', -1.6, 4.4);
  L_(ZH, 'dv_hebron', HEB, '헤브론 — 유다 족속의 왕', 'dvHebron', 0, -3);
  V_(ZH, 'dv_david_heb', HEB, '유다의 왕 다윗', M_.david, 'dvHebAb', -1.2, -4.6);
  V_(ZH, 'dv_men_heb', HEB, '유다 사람들', M_.people, 'dvHebron', 1.6, -4.2);
  L_(ZB, 'dv_pool', POOL, '기브온 못 가', 'dvPool', 0, 3.4);
  V_(ZB, 'dv_joab_pool', POOL, '요압', M_.joab, 'dvPool', 3.4, 0.6);
  V_(ZB, 'dv_abner_pool', POOL, '아브넬', M_.abner, 'dvPool', -3.4, 0.6);
  V_(ZH, 'dv_joab_heb', HEB, '요압', M_.joab, 'dvAbner', 2.2, -4);
  // 3장 헤브론 → 예루살렘
  V_(ZH, 'dv_tribes', HEB, '이스라엘 모든 지파의 장로들', M_.elders, 'dvTribes', 1.6, -4.2);
  V_(ZH, 'dv_tribes2', HEB, '장로들', M_.elders, 'dvTribes', 3, -3);
  V_(ZH, 'dv_david_tr', HEB, '다윗 왕', M_.david, 'dvTribes', -1.2, -4.6);
  L_(ZJ, 'dv_zion', SGATE, '시온 산성 — 다윗 성', 'dvZion', 0, -4);
  V_(ZJ, 'dv_david_zion', SGATE, '다윗 왕', M_.david, 'dvZion', -2, -6);
  L_(ZJ, 'dv_rephaim', REPHAIM, '르바임 골짜기', 'dvRephaim', 6, 0);
  V_(ZJ, 'dv_david_reph', REPHAIM, '다윗 왕', M_.david, 'dvRephaim', 8, 2);
  L_(ZJ, 'dv_mulb', MULB, '뽕나무 수풀 맞은편', 'dvMulb', 5, 2);
  // 4장 기럇여아림 → 예루살렘
  L_(ZB, 'dv_kirjath', KIRJATH, '기럇여아림 아비나답의 집', 'dvCart', -3, 0);
  V_(ZB, 'dv_david_kir', KIRJATH, '다윗 왕', M_.david, 'dvCart', -3, 2.6);
  L_(ZB, 'dv_nacon', NACON, '나곤의 타작 마당', 'dvNacon', 0, 2.4);
  V_(ZB, 'dv_david_nacon', NACON, '다윗 왕', M_.david, 'dvNacon', -2.6, 2);
  L_(ZB, 'dv_obed', OBED, '가드 사람 오벧에돔의 집', 'dvObed', 0, 3);
  V_(ZB, 'dv_obed_man', OBED, '오벧에돔', M_.obed, 'dvObed', 2.2, 2.2);
  V_(ZB, 'dv_messenger', OBED, '다윗 왕에게 아뢰는 사람', M_.messenger, 'dvObed', -2, 2.6);
  L_(ZJ, 'dv_march', ROAD, '궤를 메고 다윗 성으로', 'dvMarch', 0, 0);
  V_(ZJ, 'dv_michal', PALACE, '사울의 딸 미갈', M_.michal, 'dvMichal', 0, 6.4);
  // 베들레헴에서 예루살렘 가는 길은 엔진이 낸다(8편을 펼친 뒤) · 시글락 → 헤브론은 걸어서 먼 길이라 길 떠나기(🧭)로
  DLG.dv_cart.push({ event: 'cart' });
  DLG.dv_uzzah.splice(3, 0, { event: 'stopCart' });   // 6:6-8 — 원경, 수레가 멈춤
  DLG.dv_march_done.splice(1, 0, { event: 'arkIn' });  // 6:14-17 궤가 장막 안으로

  // ── 놀이 ──
  const { mgOpen, mgCloseAll, completeTask } = api;
  const btnCss = 'padding:8px 6px;border-radius:10px;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.08);color:#f5e9d0;font-size:13px';
  const LIVES = 3, hearts = n => '❤️'.repeat(Math.max(0, n)) + '🤍'.repeat(Math.max(0, LIVES - n));
  const OUT = '❤️을 다 썼어요 — 처음부터 다시';
  const msgBox = m => `<div style="text-align:center;color:#ffd27a;font-weight:800;min-height:34px;padding:6px 10px 0;font-size:12.5px">${m}</div>`;
  Object.assign(api.BADGES, { bow_song: { ico: '🎶', name: '활 노래를 이어 부른 사람' }, mulberry: { ico: '🌳', name: '뽕나무 소리를 기다린 사람' }, six_steps: { ico: '💃', name: '여섯 걸음마다 멈춘 사람' } });
  function giveBadge(k){ const S = api.ST; if (S.badges.includes(k)) return; S.badges.push(k); api.saveST(); setTimeout(() => api.toast(`${api.BADGES[k].ico} 배지 「${api.BADGES[k].name}」`, 2600), 600); }
  function orderPlay(q, title, info, cards, hint, doneMsg, onDone){
    const shown = cards.map((c, i) => i).sort(() => Math.random() - 0.5); let next = 0, life = LIVES, msg = '', perfect = true;
    mgOpen(title, info);
    const draw = () => {
      api.mgArea.innerHTML = `<div style="padding:6px 12px;font-size:12.5px;line-height:1.7;min-height:30px">${cards.slice(0, next).map((c, i) => `${i + 1}. ${c[0]} <span style="opacity:.6">${c[1] || ''}</span>`).join('<br>') || '—'}</div>`
        + (next < cards.length ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:4px 10px">${shown.filter(i => i >= next).map(i => `<button data-od="${i}" style="${btnCss}">${cards[i][0]}</button>`).join('')}</div>` : '')
        + msgBox(msg || (next < cards.length ? `${next + 1}번째는? · ${hearts(life)}` : doneMsg));
      api.mgAct.textContent = next < cards.length ? '차례대로 놓으면 계속' : '계속'; api.mgAct.disabled = next < cards.length; };
    draw();
    api.mgArea.onclick = e => { const b = e.target.closest('[data-od]'); if (!b || next >= cards.length) return;
      if (+b.dataset.od === next){ next++; msg = ''; } else if (--life <= 0){ next = 0; life = LIVES; perfect = false; shown.sort(() => Math.random() - 0.5); msg = OUT; } else { perfect = false; msg = `${hint} ${hearts(life)}`; }
      draw(); };
    api.mgAct.onclick = () => { if (next < cards.length) return; api.mgArea.onclick = null; mgCloseAll(); if (onDone) onDone(perfect); completeTask(q); };
    api.mg.onClose = () => { api.mgArea.onclick = null; };
  }
  // 🎶 활 노래(삼하 1:19-27) — 소절의 첫머리를 차례대로. 「두 용사가 엎드러졌도다」가 처음·가운데·끝에 돌아온다
  function lamentGame(q){
    api.runDialog(DLG.dv_lament, () => orderPlay(q, '🎶 활 노래', '"다윗이 이 슬픈 노래로 사울과 그의 아들 요나단을 조상하고" (삼하 1:17) — 소절의 첫머리를 차례대로 놓아요.',
      LAMENT.map(l => [l[0], l[1]]), '노래의 차례가 아니에요 —', '「오호라 두 용사가 엎드러졌으며 싸우는 무기가 망하였도다」', perfect => { if (perfect) giveBadge('bow_song'); }));
  }
  // 🌳 뽕나무 꼭대기의 걸음 소리(삼하 5:23-24) — 기다렸다가 걸음 소리가 들릴 때만 나아간다
  function waitGame(q){
    const CUES = ['🌬 바람이 지나가요', '🐦 새가 울어요', '🍃 잎사귀가 흔들려요', '🦗 풀벌레 소리', '🌬 바람이 지나가요'];
    let life = LIVES, cue = '', step = false, n = 0, timer = null, msg = '', done = false;
    mgOpen('🌳 뽕나무 꼭대기의 걸음 소리', '"뽕나무 꼭대기에서 걸음 걷는 소리가 들리거든 곧 공격하라 그 때에 여호와가 너보다 앞서 나아가서" (삼하 5:24) — 먼저 나가지 말고 기다려요.');
    const draw = () => { api.mgArea.innerHTML = `<div style="text-align:center;font-size:46px;padding:10px 0 2px">🌳🌳🌳</div><div style="text-align:center;font-size:17px;font-weight:800;min-height:30px;color:${step ? '#ffe28a' : '#f5e9d0'}">${done ? '👣 여호와께서 앞서 나아가셨어요' : cue || '…'}</div>` + msgBox(msg || hearts(life));
      api.mgAct.textContent = done ? '계속' : '👣 나아가기'; };
    const tick = () => { n++; step = n >= 4 && Math.random() < 0.35 || n >= 9; cue = step ? '👣 뽕나무 꼭대기에서 걸음 걷는 소리!' : CUES[Math.floor(Math.random() * CUES.length)]; msg = ''; draw();
      timer = setTimeout(() => { if (done) return; if (step){ step = false; n = 3; } tick(); }, step ? 1500 : 1100 + Math.random() * 700); };
    draw(); timer = setTimeout(tick, 900);
    api.mgAct.onclick = () => {
      if (done){ mgCloseAll(); completeTask(q); return; }
      if (step){ done = true; clearTimeout(timer); if (life === LIVES) giveBadge('mulberry'); draw(); return; }
      if (--life <= 0){ life = LIVES; n = 0; msg = OUT; } else msg = `아직이에요 — 여호와의 걸음 소리를 기다려요 ${hearts(life)}`; draw(); };
    api.mg.onClose = () => clearTimeout(timer);
  }
  // 💃 여섯 걸음(삼하 6:13) — 궤를 멘 사람들이 여섯 걸음을 가면 멈추고 제사, 세 번 하면 성문
  function marchGame(q){
    const ROUNDS = 3; let steps = 0, round = 0, life = LIVES, msg = '', perfect = true;
    const draw = () => { const done = round >= ROUNDS;
      api.mgArea.innerHTML = `<div style="text-align:center;font-size:30px;padding:8px 0">${'👣'.repeat(steps)}${'·'.repeat(Math.max(0, 6 - steps))}</div><div style="text-align:center;font-size:13px">다윗 성까지 ${'🏛'.repeat(round)}${'▫️'.repeat(ROUNDS - round)}</div>`
        + (done ? '' : `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 12px"><button data-m="step" style="${btnCss}">👣 한 걸음</button><button data-m="stop" style="${btnCss}">🔥 멈추고 제사</button></div>`)
        + msgBox(msg || (done ? '"다윗과 온 이스라엘 족속이 즐거이 환호하며 나팔을 불고" (삼하 6:15)' : hearts(life)));
      api.mgAct.textContent = done ? '계속' : '여섯 걸음마다 멈춰요'; api.mgAct.disabled = !done; };
    api.runDialog(DLG.dv_march, () => {
      mgOpen('💃 여섯 걸음', '"여호와의 궤를 멘 사람들이 여섯 걸음을 가매 다윗이 소와 살진 송아지로 제사를 드리고" (삼하 6:13)'); draw();
      api.mgArea.onclick = e => { const b = e.target.closest('[data-m]'); if (!b || round >= ROUNDS) return; msg = '';
        if (b.dataset.m === 'step'){ if (steps < 6) steps++; else { perfect = false; if (--life <= 0){ life = LIVES; steps = 0; round = 0; msg = OUT; } else msg = `여섯 걸음이에요 — 멈추고 제사 ${hearts(life)}`; } }
        else if (steps === 6){ steps = 0; round++; }
        else { perfect = false; if (--life <= 0){ life = LIVES; steps = 0; round = 0; msg = OUT; } else msg = `아직 여섯 걸음이 아니에요 ${hearts(life)}`; }
        draw(); };
      api.mgAct.onclick = () => { if (round < ROUNDS) return; api.mgArea.onclick = null; mgCloseAll(); if (perfect) giveBadge('six_steps'); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; };
    });
  }

  // ── 일어나는 일 ──
  function cartEv(){ cartAt = 'kirjath'; refresh('gibeon'); }
  function stopCart(){ cartAt = 'nacon'; refresh('gibeon'); }
  function arkIn(){ arkHome = true; refresh('jerusalem'); }

  // ── 마을에 놓이는 것 ──
  let worldObj = null;
  const propFail = {};
  const refresh = zid => { if (api.Z && api.Z.id === zid) world(zid); };
  function needProps(names, zid){
    const need = names.filter(n => api.PROP_DEFS[n] && !api.propTemplates[n] && !propFail[n]); if (!need.length) return;
    api.loadProps(need).then(() => { need.forEach(n => { if (!api.propTemplates[n]) propFail[n] = true; }); refresh(zid); }).catch(() => { need.forEach(n => propFail[n] = true); });
  }
  function world(zid){
    if (worldObj && worldObj.parent) worldObj.parent.remove(worldObj); worldObj = null;
    const p = cur(); if (!p) return;
    if (api.setRiver) api.setRiver(false);
    const g = new THREE.Group(), M = c => new THREE.MeshToonMaterial({ color: c, gradientMap: api.toonGradient });
    const put = (geo, mat, x, dy, z, ry = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, api.heightAt(x, z) + dy, z); m.rotation.y = ry; m.castShadow = true; g.add(m); return m; };
    const obst = (x, z, r) => { if (!api.obstacles.some(o => o.x === x && o.z === z)) api.obstacles.push({ x, z, r }); };
    const prop = (n, x, z, ry = 0, dy = 0) => { const T = api.propTemplates[n]; if (!T) return null; const o = T.holder.clone(true); o.position.set(x, api.heightAt(x, z) + dy, z); o.rotation.y = ry; g.add(o); return o; };
    const house = (x, z, w = 4, d = 3.4, col = 0xd8c4a0) => { put(new THREE.BoxGeometry(w, 2.6, d), M(col), x, 1.3, z); put(new THREE.BoxGeometry(w + 0.4, 0.25, d + 0.4), M(0xb89a70), x, 2.7, z); obst(x, z, Math.max(w, d) / 2 + 0.4); };
    if (zid === 'philistia' && p.ch <= 1){   // 시글락 — 불탔던 성읍(삼상 30:3)에 다시 머묾
      [[-5, -3], [0, -6], [5, -3], [-5, 3], [5, 2]].forEach(([dx, dz]) => house(ZIKLAG[0] + dx, ZIKLAG[1] + dz, 3.2, 2.8, 0x8a7a68));
    }
    if (zid === 'hebron' && p.ch >= 1 && p.ch <= 2){   // 헤브론 성읍(2:3 "헤브론 각 성읍에 살게 하니라")
      [[-7, -1], [-3, 3], [3, 2], [7, -2], [-6, 6], [6, 6]].forEach(([dx, dz]) => house(HEB[0] + dx, HEB[1] + dz, 3.6, 3, 0xdcc8a2));
    }
    if (zid === 'gibeon' && p.ch === 1){   // 기브온 못(2:13) — 못 이쪽과 저쪽
      const w = new THREE.Mesh(new THREE.CircleGeometry(3.2, 24).rotateX(-Math.PI / 2), M(0x5f9fc0)); w.position.set(POOL[0], api.heightAt(POOL[0], POOL[1]) + 0.06, POOL[1]); g.add(w); obst(POOL[0], POOL[1], 3);
      for (let i = 0; i < 14; i++){ const a = i / 14 * Math.PI * 2; put(new THREE.BoxGeometry(0.9, 0.4, 0.6), M(0xc8b890), POOL[0] + Math.cos(a) * 3.5, 0.2, POOL[1] + Math.sin(a) * 3.5, -a); }
    }
    if (zid === 'gibeon' && p.ch === 3){   // 기럇여아림 아비나답의 집 · 새 수레 · 나곤의 타작 마당 · 오벧에돔의 집
      needProps(['cart', 'ark', 'bull'], 'gibeon');
      house(KIRJATH[0] + 2, KIRJATH[1] - 2, 4.4, 3.4); house(OBED[0], OBED[1] - 1.6, 4, 3.2, 0xd8c4a0);
      put(new THREE.CylinderGeometry(3, 3.1, 0.2, 24), M(0xd2c29a), NACON[0], 0.1, NACON[1]);
      const at = cartAt === 'nacon' || p.step >= 1 ? NACON : [KIRJATH[0] - 3, KIRJATH[1] + 4];
      if (p.step <= 1){ prop('cart', at[0], at[1], 1.2); prop('ark', at[0], at[1], 1.2, 0.95); prop('bull', at[0] - 1.6, at[1] + 2.2, 1.2); }
      if (p.step >= 2) prop('ark', OBED[0] + 2.6, OBED[1] + 0.6, 0.3);   // 석 달 동안 오벧에돔의 집에(6:11)
    }
    if (zid === 'jerusalem' && p.ch === 3){   // 4장 — 궤를 멘 줄이 성 남쪽 길에서 기다림, 행렬 뒤엔 장막 안에
      needProps(['ark'], 'jerusalem');
      if (!arkHome) prop('ark', ROAD[0] + 1.6, ROAD[1] - 1, 0.4); else prop('ark', TENT[0], TENT[1] - 1.4, 0);
    }
    api.zoneRoot.add(g); worldObj = g;
  }

  const T = n => `📜 다윗 왕 ${n}장`;
  return {
    id: 'david',
    chapters: [
      { title: `${T(1)} — 활 노래`, clearTitle: '🎉 8편 1장 「활 노래」 완료!', next: '2장: 헤브론에서 칠 년 육 개월',
        steps: [
          { id: 'd1s1', zone: 'philistia', obj: '사울의 진영에서 온 사람', where: '블레셋 평지 가운데 시글락(빛나는 곳)', point: 'dv_ziklag', dlg: 'dv_ziklag' },
          { id: 'd1s2', zone: 'philistia', obj: '활 노래', where: '시글락의 다윗', npc: 'dv_david1', game: 'lament', doneDlg: 'dv_lament_done', reward: { verse: '2sa1-23', clear: true } },
        ] },
      { title: `${T(2)} — 헤브론에서 칠 년 육 개월`, clearTitle: '🎉 8편 2장 「헤브론에서 칠 년 육 개월」 완료!', next: '3장: 만군의 하나님 여호와께서 함께 계시니',
        steps: [
          { id: 'd2s1', zone: 'philistia', obj: '"어디로 가리이까"', where: '시글락의 다윗', npc: 'dv_david_ask', dlg: 'dv_ask' },
          { id: 'd2s2', zone: 'hebron', obj: '유다 족속의 왕', where: '헤브론 산지 가운데 헤브론 성읍(빛나는 곳)', point: 'dv_hebron', dlg: 'dv_hebron' },
          { id: 'd2s3', zone: 'gibeon', obj: '기브온 못 가에서', where: '기브온 마을 서쪽 기브온 못(빛나는 곳)', point: 'dv_pool', dlg: 'dv_pool' },
          { id: 'd2s4', zone: 'hebron', obj: '아브넬 앞에서 애도하라', where: '헤브론 성읍의 다윗', npc: 'dv_david_heb', dlg: 'dv_abner', reward: { verse: '2sa2-1', clear: true } },
        ] },
      { title: `${T(3)} — 만군의 하나님 여호와께서 함께 계시니`, clearTitle: '🎉 8편 3장 완료!', next: '4장: 여호와 앞에서 힘을 다하여',
        steps: [
          { id: 'd3s1', zone: 'hebron', obj: '"우리는 왕의 한 골육이니이다"', where: '헤브론 성읍의 장로들', npc: 'dv_tribes', dlg: 'dv_tribes' },
          { id: 'd3s2', zone: 'jerusalem', obj: '시온 산성 곧 다윗 성', where: '예루살렘 남문 안(빛나는 곳)', point: 'dv_zion', dlg: 'dv_zion' },
          { id: 'd3s3', zone: 'jerusalem', obj: '르바임 골짜기에 가득한지라', where: '예루살렘 서쪽 르바임 골짜기(빛나는 곳)', point: 'dv_rephaim', dlg: 'dv_rephaim' },
          { id: 'd3s4', zone: 'jerusalem', obj: '뽕나무 꼭대기의 걸음 소리', where: '골짜기 서쪽 뽕나무 수풀 맞은편(빛나는 곳)', point: 'dv_mulb', game: 'wait', doneDlg: 'dv_wait_done', reward: { verse: '2sa5-10', clear: true } },
        ] },
      { title: `${T(4)} — 여호와 앞에서 힘을 다하여`, clearTitle: '🎉 8편 1부 「왕이 된 다윗」을 마쳤어요!', next: '5장: 네 왕위가 영원히 견고하리라',
        steps: [
          { id: 'd4s1', zone: 'gibeon', obj: '하나님의 궤를 새 수레에 싣고', where: '기브온 마을 북동쪽 기럇여아림(빛나는 곳)', point: 'dv_kirjath', dlg: 'dv_cart' },
          { id: 'd4s2', zone: 'gibeon', obj: '나곤의 타작 마당', where: '기럇여아림 남쪽 타작 마당(빛나는 곳)', point: 'dv_nacon', dlg: 'dv_uzzah' },
          { id: 'd4s3', zone: 'gibeon', obj: '오벧에돔의 집에 석 달', where: '기브온 마을 남쪽 오벧에돔의 집(빛나는 곳)', point: 'dv_obed', dlg: 'dv_obed' },
          { id: 'd4s4', zone: 'jerusalem', obj: '여섯 걸음을 가매', where: '예루살렘 남서쪽 길(빛나는 곳)', point: 'dv_march', game: 'march', doneDlg: 'dv_march_done', reward: { verse: '2sa6-14', clear: true } },
        ] },
    ],
    games: { lament: lamentGame, wait: waitGame, march: marchGame },
    events: { cart: cartEv, stopCart, arkIn },
    world: zid => world(zid),
  };
});
