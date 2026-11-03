  // 저장(버전 번호 + 새 필드는 기본값 — 데이터 마이그레이션 원칙)
  const STORY_KEY = 'inodyssey.proto.story';
  const ST = { v: 1, ch: 0, step: 0, rumor: [], straw: 0, water: 0, frogs: 0, herd: null, warned: 0, verses: [], badges: [], stars: 0, quiz: {}, keys: [], cleared: false, log: [] };
  try { Object.assign(ST, JSON.parse(localStorage.getItem(STORY_KEY) || '{}')); } catch (e){}
  if (ST.replayBackup){ Object.assign(ST, ST.replayBackup); delete ST.replayBackup; }
  if (ST.replayCur){ ST.cur = ST.replayCur; delete ST.replayCur; }   // 다시 하기 도중에 닫았으면 펼쳐 두었던 두루마리로
  if (!ST.petAffV){   // 2026-10-11 펫 친밀도 기준 변경(Lv 20/50/85 → 40/120/250): 예전 값을 같은 레벨 구간으로 옮김, 한 번만
    const old = ST.petAff || {}, conv = a => a >= 85 ? 250 : a >= 50 ? Math.round(120 + (a - 50) * 130 / 35) : a >= 20 ? Math.round(40 + (a - 20) * 80 / 30) : Math.round(a * 2);
    for (const k of Object.keys(old)) old[k] = Math.min(250, conv(old[k] || 0));
    ST.petAffV = 2;
  }
  (ST.worshipCards || []).forEach(c => { VERSES[c.id] = { ref: c.ref, text: c.text }; });
  if (/[?&]reset(&|$)/.test(location.search)) { Object.assign(ST, { ch: 0, step: 0, rumor: [], straw: 0, water: 0, frogs: 0, verses: [], badges: [], stars: 0, quiz: {}, keys: [], cleared: false, log: [], cur: 'moses', sp: {} }); }
  const saveST = () => { try { localStorage.setItem(STORY_KEY, JSON.stringify({ ...ST, log: ST.log.slice(-80) })); } catch (e){} try { queueProgress(); queueCloud(); } catch (e){} };
  if (ST.ch === 0 && ST.cleared){ ST.ch = 1; ST.step = 0; ST.cleared = false; }   // 예전 저장: 1장을 이미 끝냈으면 2장부터
  let STORY = CHAPTERS[ST.ch].steps;
  if (ST.cleared && ST.step < STORY.length) ST.cleared = false;
  let CHAPTER = CHAPTERS[ST.ch];
  function startChapter(i){
    const P = AP(), C = actChapters(); P.ch = i; P.step = 0; P.cleared = false; P.rumor = []; STORY = C[i].steps; CHAPTER = C[i]; stepT = 0;
    saveST(); renderQuestList(); refreshShow(); if (Z) spawnTasks();
    const q = curStep(); if (q) setTimeout(() => toast(`${CHAPTER.title}\n▶ ${q.obj}`, 2600), 300);
  }
  const stepIdx = id => CHAPTERS[ST.ch].steps.findIndex(q => q.id === id);   // 「모세와 함께」 단계 번호(모세 편 조건에 씀)
  const rumorOk = (q, id) => !!RUMORS[id] && (!q.rumorIds || q.rumorIds.includes(id));
  const rumorCount = q => { const R = AP().rumor || []; return q.rumorIds ? R.filter(x => q.rumorIds.includes(x)).length : R.length; };
  const curStep = () => { const P = AP(); return P.cleared ? null : STORY[P.step]; };
  let stepT = 0;                          // 지금 단계에 머문 시간(헤맴 힌트용)
  let hintLv = 0, hintKey = '', hintOn = false, hintBeam = null, hintMsg = '';   // 💡 막힌 단계 힌트(아래 hintText) — 퀘스트 창에도 써야 해서 여기서 선언

  // 퀘스트 창 접기/펼치기
  const questPanel = document.getElementById('quest-panel');
  let questLastKey = null, questTimer = null;
  function questPeek(){ questPanel.classList.remove('compact'); clearTimeout(questTimer); questTimer = setTimeout(() => { questPanel.classList.add('compact'); renderQuestList(); }, 6000); }
  questPanel.addEventListener('click', () => { if (typeof tut !== 'undefined') tut.questTapped = true; clearTimeout(questTimer); questPanel.classList.toggle('compact'); renderQuestList(); });
  // 다음 두루마리를 아직 안 펼쳤으면 그 안내 문구(퀘스트 목록·지난 이야기에 계속 보임). 해당 없으면 ''
  function nextScrollHint(){
    try {
      const from = Object.keys(NEXT_SCROLL).find(k => NEXT_SCROLL[k].done() && !(ST.sp && ST.sp[NEXT_SCROLL[k].to])); if (!from) return '';
      const nx = SCROLL_LIST.find(s => s.id === NEXT_SCROLL[from].to);
      if (!nx) return '완료! 다음 두루마리는 지금 준비하고 있어요';
      return `완료! 다음: ${nx.no}편 「${nx.title}」 — 🧭 길 떠나기 → 두루마리마을 → 📚 두루마리 문에서 펼치기`;
    } catch (e){ return ''; }
  }
  function renderQuestList(){
    const q = curStep(), panel = document.getElementById('quest-panel');
    panel.querySelector('h4').textContent = CHAPTER.title;
    let obj = q ? q.obj : (nextScrollHint() || `완료! 다음: ${CHAPTER.next}`);
    if (q && q.rumor) obj += ` (${Math.min(rumorCount(q), q.rumor)}/${q.rumor})`;
    if (q && q.manna) obj += ` (${Math.min(ST.mannaGot || 0, q.manna)}/${q.manna})`;
    if (q && q.collect) obj += ` (${Math.min(ST.straw, q.collect)}/${q.collect})`;
    if (q && q.dig) obj += ` (💧 ${Math.min(ST.water, q.dig)}/${q.dig})`;
    if (q && q.frogs) obj += ` (🐸 ${Math.min(ST.frogs, q.frogs)}/${q.frogs})`;
    if (q && q.chase && chase.on) obj += ` (🐎 뒤에서 ${Math.max(0, Math.round(player.position.x - chase.x))}m)`;
    if (q && q.warn) obj += q.mark ? ` (🩸 ${ST.warned}/${q.warn})` : ` (📣 ${ST.warned}/${q.warn} · ⏱ ${Math.max(0, Math.ceil(warnT))}초)`;
    document.getElementById('quest-list').innerHTML = `<li><div class="obj">▶ ${obj}</div></li>${q && q.where ? `<li class="where">💡 ${q.where}</li>` : ''}${q && hintMsg ? `<li class="hintln">🙋 ${hintMsg}</li>` : ''}<li class="prog">${q ? `${AP().step + 1}/${STORY.length}` : '✓ 완료'}${q && q.zone !== (Z && Z.id) ? `<span class="zn"> · ${ZONES[q.zone].name}에서</span>` : ''}<span class="more">${questPanel.classList.contains('compact') ? '▾' : '▴'}</span></li>`;
    { const k = ST.cur + ':' + AP().ch + ':' + AP().step; if (questLastKey !== k){ questLastKey = k; questPeek(); } }
  }
  // 조건부로 보이는 자리·인물: 도전(미니게임)은 그 이야기를 지나간 뒤부터, 지친 사람은 바다를 건너는 동안만
  const passed = (ch, id) => ST.ch > ch || (ST.ch === ch && (ST.cleared || ST.step > stepIdx(id)));
  const CONDS = {
    brick: () => ST.ch >= 1 || ST.cleared,
    frogs: () => passed(1, 'c2s4'),
    hail: () => passed(1, 'c2s17'),
    rhythm: () => passed(3, 'c4s10'),
    tired: d => ST.ch === 3 && !ST.cleared && ST.step === stepIdx('c4s9') && !(ST.helped || []).includes(d.id),
    jethroHere: () => ST.ch === 6 && !ST.cleared,
  };
  function refreshShow(){ markers.forEach(m => { if (m.data.showFrom || m.data.showCh !== undefined || m.data.cond) applyShow(m); }); }
  function applyShow(m){
    const d = m.data, chOk = (d.showCh === undefined || ST.ch >= d.showCh) && (!d.cond || CONDS[d.cond](d));
    const on = chOk && (!d.showFrom || ST.cleared || ST.ch > (d.showCh ?? ST.ch) || ST.step >= stepIdx(d.showFrom));
    m.mesh.visible = on; m.hidden = !on; if (m.col) m.col.r = on ? 0.55 : 0; if (m.light) m.light.visible = on;
  }
  function advance(){
    const q = curStep(); if (!q) return;
    try { logStep(q, stepT); } catch (e){}
    const P = AP(); P.step++; stepT = 0;
    if (P.step >= STORY.length){ P.cleared = true; }
    saveST(); renderQuestList(); refreshShow(); if (Z) spawnTasks();
    const nq = curStep();
    if (nq) setTimeout(() => toast('▶ ' + nq.obj, 2200), 400);
  }
  // ══ B-1. 숨은 두루마리 조각: 마을마다 5개(상자 위 · 건물 뒤 구석) — 다 모으면 보너스 구절 카드 ══
  Object.assign(VERSES, {
    'ps119-105': { ref: '시편 119:105', text: '주의 말씀은 내 발에 등이요 내 길에 빛이니이다' },
    'ps23-1':    { ref: '시편 23:1',    text: '여호와는 나의 목자시니 내게 부족함이 없으리로다' },
    'ps46-1':    { ref: '시편 46:1',    text: '하나님은 우리의 피난처시요 힘이시니 환난 중에 만날 큰 도움이시라' },
    'isa43-2':   { ref: '이사야 43:2',  text: '네가 물 가운데로 지날 때에 내가 너와 함께 할 것이라' },
  });
  const SCROLL_VERSE = { alpha: 'ps119-105', midian: 'ps23-1', egypt: 'ps46-1', redsea: 'isa43-2' };
  const SCROLL_N = 5, scrolls = [];
  Object.assign(BADGES, { scroll_all: { ico: '📜', name: '두루마리를 모은 사람' } });
  const scrollGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.5, 12).rotateZ(Math.PI / 2), capGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.66, 8).rotateZ(Math.PI / 2);
  const scrollMat = new THREE.MeshToonMaterial({ color: 0xf1dfb0, gradientMap: toonGradient, emissive: 0x6a4a10, emissiveIntensity: 0.35 }), capMat = new THREE.MeshToonMaterial({ color: 0x8a5a2a, gradientMap: toonGradient });
  let scrollGlowMat = null;
  function scrollSpots(zid){
    // 마을마다 같은 자리(고정 난수) — 입구에서 걸어서 닿는 곳, 올라서야 닿는 상자 위 2개까지
    let sd = [...zid].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 2147483647, 7919);
    const rr = () => { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; };
    const W = Z.water, far = (x, z) => (!W || x < W.x0 - 4 || x > W.x1 + 4) && markers.every(m => Math.hypot(m.data.x - x, m.data.z - z) > 3) && (!Z.sea || x < Z.sea.x0 - 1.5 || x > Z.sea.x1 + 1.5) && (zid !== 'egypt' || Math.hypot(x - PEN_C[0], z - PEN_C[1]) > PEN_WALL + 1);
    const tops = [], nooks = [];
    for (const b of boxes){
      if (!b.stand || b.top < 0.6 || b.top > 2.6 || !far(b.x, b.z) || Math.hypot(b.x - Z.center[0], b.z - Z.center[1]) > 33) continue;
      const c = Math.cos(b.rot), sn = Math.sin(b.rot);
      const sides = [[b.hx + 0.9, 0], [-b.hx - 0.9, 0], [0, b.hz + 0.9], [0, -b.hz - 0.9]].map(([lx, lz]) => [b.x + lx * c + lz * sn, b.z - lx * sn + lz * c]);
      if (sides.some(([x, z]) => reachable(x, z))) tops.push([b.x, b.top, b.z]);
    }
    for (let j = 1; j < NAV.h - 1; j++) for (let i = 1; i < NAV.w - 1; i++){
      if (!NAV.reach[j * NAV.w + i]) continue;
      const x = NAV.x0 + (i + 0.5) * NAV.cell, z = NAV.z0 + (j + 0.5) * NAV.cell, d = Math.hypot(x - Z.center[0], z - Z.center[1]);
      if (d < 11 || d > 33) continue;
      let blocked = 0; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) if (!NAV.walk[(j + b) * NAV.w + i + a]) blocked++;
      if (blocked >= 3 && far(x, z)) nooks.push([x, heightAt(x, z), z]);
    }
    const out = [], ok = ([x, , z]) => out.every(([ox, , oz]) => Math.hypot(ox - x, oz - z) > 11);
    const take = (arr, max) => { for (let k = 0; k < 400 && arr.length && max > 0 && out.length < SCROLL_N; k++){ const c = arr[(rr() * arr.length) | 0]; if (ok(c)){ out.push(c); max--; } } };
    take(tops, 2); take(nooks, SCROLL_N);
    return out;
  }
  function spawnScrolls(){
    scrolls.forEach(o => zoneRoot.remove(o.g)); scrolls.length = 0;
    if (!Z || !SCROLL_VERSE[Z.id]) return;
    if (!NAV.reach) reachable(0, 0);
    ST.scrolls = ST.scrolls || {}; const got = ST.scrolls[Z.id] || [];
    if (!scrollGlowMat) scrollGlowMat = new THREE.SpriteMaterial({ map: flameTex, color: 0xffe7a0, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.55 });
    scrollSpots(Z.id).forEach(([x, y, z], i) => {
      if (got.includes(i)) return;
      const g = new THREE.Group(); g.add(new THREE.Mesh(scrollGeo, scrollMat), new THREE.Mesh(capGeo, capMat));
      const glow = new THREE.Sprite(scrollGlowMat); glow.scale.set(0.9, 1.1, 1); glow.position.y = 0.1; g.add(glow);
      g.position.set(x, y + 0.45, z); zoneRoot.add(g); scrolls.push({ g, i, x, y, z, ph: i * 1.3 });
    });
  }
  function updateScrolls(dt, now){
    if (!scrolls.length || !Z) return;
    const P = player.position;
    for (let k = scrolls.length - 1; k >= 0; k--){
      const o = scrolls[k];
      o.g.position.y = o.y + 0.45 + Math.sin(now / 1000 * 2 + o.ph) * 0.08; o.g.rotation.y += dt * 1.2;
      if (Math.hypot(P.x - o.x, P.z - o.z) < 0.95 && Math.abs(P.y - o.y) < 1.1){
        zoneRoot.remove(o.g); scrolls.splice(k, 1);
        const got = ST.scrolls[Z.id] = (ST.scrolls[Z.id] || []).concat(o.i); saveST(); dq('scroll'); wq('scroll3');
        if (got.length >= SCROLL_N){
          toast(`📜 ${Z.name}의 두루마리를 다 모았어요! 두루마리를 펴 보니…`, 2600);
          setTimeout(() => giveReward({ verse: SCROLL_VERSE[Z.id] }, () => {
            if (Object.keys(SCROLL_VERSE).every(z => (ST.scrolls[z] || []).length >= SCROLL_N) && !ST.badges.includes('scroll_all')){ ST.badges.push('scroll_all'); saveST(); toast('📜 배지 획득: 두루마리를 모은 사람', 2400); }
          }), 1400);
        } else toast(`📜 숨은 두루마리 조각 ${got.length} / ${SCROLL_N}`, 1800);
      }
    }
  }
  function scrollBookHTML(){
    const S = ST.scrolls || {};
    return `<div style="grid-column:1/-1;margin-top:10px"><h3 style="font-size:15px;margin-bottom:4px">📜 숨은 두루마리 조각</h3><div style="font-size:13px;line-height:1.7">`
      + Object.keys(SCROLL_VERSE).map(z => { const n = (S[z] || []).length; return `<span style="margin-right:12px;opacity:${n ? 1 : 0.55}">${ZONES[z].name} ${'●'.repeat(n)}${'○'.repeat(SCROLL_N - n)}</span>`; }).join('')
      + `<div style="opacity:.75;font-size:12px">상자 위, 건물 뒤 구석에 숨어 있어요. 반짝이는 빛을 찾아보세요 — 낮은 상자는 점프로 올라설 수 있어요.</div></div></div>`;
  }
  // ══ B-2. 인물 도감: 말을 걸어 본 성경 인물과 마을 사람 ══
  const PEOPLE = [
    { n: '모세', f: 'moses', t: '레위 가문에서 태어나 갈대 상자에 담겨 나일 강에 띄워졌다가 바로의 딸에게 건져졌어요(출 2:1-10). 미디안에서 양을 치다가 떨기나무 불꽃 가운데서 하나님의 부르심을 받았어요(출 3장).' },
    { n: '아론', f: 'aaron', t: '모세의 형이에요. 말을 잘하지 못한다는 모세를 대신해 백성에게 말하는 "입"이 되었어요(출 4:14-16).' },
    { n: '미리암', f: null, t: '아론의 누이, 선지자예요. 홍해를 건넌 뒤 손에 소고를 잡고 여인들과 함께 여호와를 찬송했어요(출 15:20-21).' },
    { n: '이드로', f: null, t: '미디안의 제사장이자 모세의 장인이에요. 딸 십보라를 모세에게 아내로 주었고, 모세는 그의 양 떼를 쳤어요(출 2:21, 3:1).' },
    { n: '바로', f: null, t: '애굽의 왕이에요. "여호와가 누구이기에 내가 그의 목소리를 듣고 이스라엘을 보내겠느냐"(출 5:2)며 백성을 보내지 않았어요.' },
    { n: '여호수아', f: null, t: '눈의 아들로 모세를 돕던 사람이에요. 나중에 아말렉과 싸웠고(출 17:9-13), 모세의 뒤를 이어 백성을 가나안 땅으로 이끌었어요(수 1:1-2).' },
  ];
  function meet(m){
    const t = m.data.title; if (!t) return;
    ST.met = ST.met || [];
    if (ST.met.includes(t)) return;
    ST.met.push(t); saveST();
    if (PEOPLE.some(p => p.n === t)) setTimeout(() => toast(`👥 인물 도감에 추가: ${t}`, 2000), 400);
  }
  function peopleBookHTML(){
    const met = ST.met || [], vill = met.filter(t => !PEOPLE.some(p => p.n === t));
    return `<div style="grid-column:1/-1;margin-top:10px"><h3 style="font-size:15px;margin-bottom:6px">👥 인물 도감 · 성경 인물 ${PEOPLE.filter(p => met.includes(p.n)).length} / ${PEOPLE.length}</h3>`
      + PEOPLE.map(p => met.includes(p.n)
          ? `<div class="keyline"><b>${p.n}</b> — ${p.t}</div>`
          : `<div class="keyline" style="opacity:.45"><b>???</b> — 아직 만나지 않았어요</div>`).join('')
      + `<div style="font-size:13px;margin-top:6px">🙋 이야기 나눈 마을 사람 ${vill.length}명${vill.length ? ' — ' + vill.join(', ') : ''}</div></div>`;
  }
  // 기도: 지금 할 일이 있는 곳에 하늘에서 빛기둥(8초) + 발밑부터 빛 방울 길
  let prayFx = null, praiseUntil = 0;
  function prayBeam(){
    const t = targetPos();
    if (prayFx){ prayFx.g.parent && prayFx.g.parent.remove(prayFx.g); prayFx = null; }
    if (!t){ toast('🙏 기도했어요. 지금은 해야 할 일을 다 했어요 — 숨은 두루마리를 찾아볼까요?', 2400); return; }
    const g = new THREE.Group(), y = heightAt(t.x, t.z);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 40, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff2b0, transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    beam.position.set(t.x, y + 20, t.z); g.add(beam);
    const dots = [], P = player.position, d = Math.hypot(t.x - P.x, t.z - P.z), n = Math.min(24, Math.floor(d / 1.6));
    const dm = new THREE.SpriteMaterial({ map: flameTex, color: 0xffe7a0, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 });
    for (let i = 1; i <= n; i++){ const k = i / (n + 1), x = P.x + (t.x - P.x) * k, z = P.z + (t.z - P.z) * k; const sp = new THREE.Sprite(dm); sp.scale.set(0.35, 0.45, 1); sp.position.set(x, heightAt(x, z) + 0.3, z); sp.userData.k = k; g.add(sp); dots.push(sp); }
    zoneRoot.add(g); prayFx = { g, beam, dm, t: 0 };
    toast('🙏 기도했더니 가야 할 곳에 빛이 비춰요', 2200);
  }
  function praiseBoost(){
    praiseUntil = performance.now() + 10000; stamina = 1; exhausted = false;
    toast('🎵 찬양하니 힘이 나요! 10초 동안 더 빨라요', 2000);
    for (let i = 0; i < 8; i++) setTimeout(() => floatNote(), i * 180);
  }
  function floatNote(){
    const el = document.createElement('div'); el.textContent = ['🎵', '🎶', '♪'][(Math.random() * 3) | 0];
    const v = player.position.clone(); v.y += 2.2; v.project(camera);
    Object.assign(el.style, { position: 'fixed', left: ((v.x + 1) / 2 * innerWidth + (Math.random() - 0.5) * 60) + 'px', top: ((1 - v.y) / 2 * innerHeight) + 'px', fontSize: '22px', zIndex: 15, pointerEvents: 'none', transition: 'transform 1.4s ease-out, opacity 1.4s', opacity: '1' });
    document.body.appendChild(el); requestAnimationFrame(() => { el.style.transform = `translate(${(Math.random() - 0.5) * 40}px, -70px)`; el.style.opacity = '0'; });
    setTimeout(() => el.remove(), 1500);
  }
  function updateSkillFx(dt){
    if (prayFx){ const f = prayFx; f.t += dt; const a = f.t < 0.8 ? f.t / 0.8 : f.t > 7 ? Math.max(0, 1 - (f.t - 7)) : 1;
      f.beam.material.opacity = 0.45 * a * (0.85 + 0.15 * Math.sin(f.t * 5)); f.dm.opacity = 0.9 * a;
      f.g.children.forEach(o => { if (o.isSprite) o.position.y += Math.sin(f.t * 3 + o.userData.k * 12) * 0.004; });
      if (f.t > 8){ f.g.parent && f.g.parent.remove(f.g); prayFx = null; } }
    const on = performance.now() < praiseUntil; document.body.classList.toggle('praising', on);
    if (on && Math.random() < dt * 3) floatNote();
  }

  // ══ D-12. 칭호: 마친 장 수에 따라(수집첩에서 고르기) ══
  const TITLES = [
    { need: 0, t: '두루마리마을 새내기' },
    { need: 1, t: '부르심에 응답한 사람' },
    { need: 2, t: '재앙 속에서 믿은 사람' },
    { need: 3, t: '어린양의 피 아래 선 사람' },
    { need: 4, t: '바다를 건넌 믿음의 사람' },
    { need: 5, t: '광야에서 만나를 먹은 사람' },
    { need: 6, t: '손을 들어 이긴 사람' },
    { need: 7, t: '함께 짐을 나눈 사람' },
    { need: 8, t: '시내산 언약의 사람' },
    { need: 9, t: '여호와의 편에 선 사람' },
    { need: 10, t: '자원하여 드린 사람' },
    { need: 'scroll', t: '말씀을 찾는 탐험가' },
  ];
  const chaptersDone = () => ST.ch + (ST.cleared ? 1 : 0);
