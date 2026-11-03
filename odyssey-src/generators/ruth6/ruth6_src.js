// 6편 「룻과 사무엘」 — 룻기 1–4장 + 사무엘상 1–7장, 9장. 2026-10-25 전도사님 결정: 9장 그대로 · 룻 3장 타작마당은 해설만(밤 장면은 배경만) ·
// 삼상 4장(엘리 집안의 죽음·이가봇)과 6:19(벧세메스)는 해설로 읽고 멀리서만 · 다곤은 얼굴·모양 없는 돌덩이 · 새 마을은 베들레헴 하나(다른 곳은 4·5편 마을을 사무엘 시대에 맞게).
// 대사·구절 카드는 E:\temp\claude-work\ruth6\gen6.py가 bskorea 개역개정 원문 파일에서 그대로 뽑는다(손으로 옮기지 않음).
// 무대: 1장 모압 평지(모압 지방) → 베들레헴(새 마을, 헤브론 산지 서쪽 길) · 5~7장 실로(여호와의 전·라마의 집) · 8장 블레셋 평지(아스돗·벧세메스 길) · 9장 기브온 마을(기럇여아림·미스바).
// 족보 조각 오벳(룻)·이새(룻 4:21-22, 마 1:5-6). 새 인물·암소·소품은 GPT 13차 원화 → Meshy 모델(npc3d/r6-*, 못 받으면 도형 FB).
(window.__odyQ = window.__odyQ || []).push(api => {
  const { DLG, ZONES, CONDS, VERSES, THREE, SPEAKERS: { NAR } } = api;
  const RUTH = { n: '룻' }, BOAZ = { n: '보아스' }, HANNAH = { n: '한나' }, SAMUEL = { n: '사무엘' };
  const cur = () => api.ST.cur === 'ruth' && api.ST.sp.ruth ? api.ST.sp.ruth : null;
  const at = (ch, a = 0, b = 99) => () => { const p = cur(); return !!p && p.ch === ch && !p.cleared && p.step >= a && p.step <= b; };
  const from = (ch, s = 0) => () => { const p = cur(); return !!p && (p.ch > ch || (p.ch === ch && (p.cleared || p.step >= s))); };
  const M_ = { naomi: 'r6-naomi', ruth: 'r6-ruth', orpah: 'r6-orpah', boaz: 'r6-boaz', elkanah: 'r6-elkanah', hannah: 'r6-hannah', eli: 'r6-eli', samuel: 'r6-samuel-boy' };   // GPT 13차 → Meshy(2026-10-25)

  // ── 자리 ──
  const NHOUSE = [16, 26], MOABP = [12, 21];                                   // 모압 평지: 나오미의 집
  const BGATE = [-8, -6], BBOAZ = [10, -22], BNAOMI = [-10, -24], BFIELD = [4, 16], BMEAL = [14, 8], BFLOOR = [26, 2], BREAP = [0, 12];   // 베들레헴
  const RAMAH = [-30, 22], ELI_SEAT = [15.5, -12], SAMBED = [6, -15], EBEN_VIEW = [30, -30], ROADSEAT = [20, -8], ICHA = [22, 2];       // 실로
  const ASHDOD = [-28, -20], GATH = [-8, -32], LORDS6 = [2, -8], CART0 = [10, 0], BSHEMESH = [36, 6];                                  // 블레셋 평지
  const KIRJATH = [26, 24], MIZ7 = [10, 20], STONE7 = [-4, 10], THUNDER = [-30, 6];                                                 // 기브온 마을
  // 단계 번호
  // 0장: 0 모압 지방 · 1 나오미 · 2 룻 · 3 함께 걷기 · 4 베들레헴 성읍
  // 1장: 0 룻의 말 · 1 보아스와 베는 자들 · 2 보아스와 룻 · 3 식사 때 · 4 이삭 줍기
  // 2장: 0 나오미의 말 · 1 타작마당 · 2 나오미에게
  // 3장: 0 성문 · 1 신을 벗어 · 2 오벳 · 3 족보
  // 4장: 0 라마 · 1 서원 · 2 라마로 · 3 엘리에게 · 4 한나의 노래
  // 5장: 0 엘리의 아들들 · 1 아이 사무엘 · 2 밤의 부름 · 3 자라매
  // 6장: 0 싸움 · 1 궤를 빼앗김 · 2 엘리 · 3 이가봇
  // 7장: 0 아스돗 · 1 가드와 에그론 · 2 방백들 · 3 수레 · 4 벧세메스
  // 8장: 0 기럇여아림 · 1 미스바 · 2 큰 우레 · 3 에벤에셀
  let dagonShow = 0, thunderShow = false, arkAway = false;
  Object.assign(CONDS, {
    rtOn: () => !!cur(),
    rtMoab: at(0, 0, 0), rtNaomi: at(0, 0, 3), rtRuth1: at(0, 1, 3), rtArrive: at(0, 4, 4),
    rtRuth2: at(1, 0, 4), rtBoaz: at(1, 1, 2), rtMeal: at(1, 3, 3), rtField: at(1, 4, 4),
    rtNaomi3: () => at(2, 0, 0)() || at(2, 2, 2)(), rtFloor: at(2, 1, 1),
    rtGate: at(3, 0, 1), rtGateFolk: at(3, 0, 1), rtObed: at(3, 2, 3),
    smRamah: () => at(4, 0, 0)() || at(4, 2, 2)(), smVow: at(4, 1, 1), smEli: () => at(4, 1, 3)() || at(5, 2, 2)(), smHannah: at(4, 0, 4),
    smSons: at(5, 0, 0), smBoy: at(5, 1, 3), smNight: at(5, 2, 2), smGrow: at(5, 3, 3),
    smBattle: at(6, 0, 1), smEli4: at(6, 2, 2), smIcha: at(6, 3, 3),
    smAshdod: at(7, 0, 0), smCities: at(7, 1, 1), smLords: at(7, 2, 3), smCart: at(7, 3, 3), smShemesh: at(7, 4, 4),
    smKirjath: at(8, 0, 0), smSamuel7: at(8, 1, 3), smThunder: at(8, 2, 2), smStone: at(8, 3, 3),
  });
  const ZM = ZONES.moab.points, ZBe = ZONES.bethlehem.points, ZS = ZONES.shiloh.points, ZP = ZONES.philistia.points, ZB = ZONES.gibeon.points;
  const V_ = (Z, id, xz, title, model, cond, dx = 0, dz = 0) => Z.push({ id, x: xz[0] + dx, z: xz[1] + dz, type: 'villager', title, model, persona: 'rs_static', cond, body: '' });
  const L_ = (Z, id, xz, title, cond, dx = 0, dz = 0) => Z.push({ id, x: xz[0] + dx, z: xz[1] + dz, type: 'lore', title, cond, body: '' });
  L_(ZM, 'rt_moab', MOABP, '모압 지방 — 엘리멜렉의 집', 'rtMoab');
  V_(ZM, 'rt_naomi', NHOUSE, '나오미', M_.naomi, 'rtNaomi', -3, -2);
  V_(ZM, 'rt_ruth', NHOUSE, '룻', M_.ruth, 'rtRuth1', -1.4, -3.4);
  V_(ZM, 'rt_orpah', NHOUSE, '오르바', M_.orpah, 'rtRuth1', -4.6, -3.6);
  L_(ZBe, 'rt_arrive', BGATE, '베들레헴 성읍', 'rtArrive', 3, 3);
  V_(ZBe, 'rt_ruth2', BNAOMI, '룻', M_.ruth, 'rtRuth2', 3, 3);
  V_(ZBe, 'rt_boaz', BFIELD, '보아스', M_.boaz, 'rtBoaz', 6, -6);
  V_(ZBe, 'rt_reaper', BREAP, '베는 자들', 'ca-tent-builder', 'rtRuth2', 3, 0);
  L_(ZBe, 'rt_meal', BMEAL, '식사할 때에', 'rtMeal');
  L_(ZBe, 'rt_field', BFIELD, '보아스의 밭', 'rtField');
  V_(ZBe, 'rt_naomi3', BNAOMI, '나오미', M_.naomi, 'rtNaomi3', 3, 0);
  L_(ZBe, 'rt_floor', BFLOOR, '타작마당', 'rtFloor');
  L_(ZBe, 'rt_gate', BGATE, '성문 — 장로 열 명 앞에서', 'rtGate');
  V_(ZBe, 'rt_boaz4', BGATE, '보아스', M_.boaz, 'rtGateFolk', 2.4, 1.6);
  V_(ZBe, 'rt_kin', BGATE, '아무개(기업 무를 자)', 'he-father', 'rtGateFolk', -2.4, 1.6);
  V_(ZBe, 'rt_elders', BGATE, '장로들', 'ca-israel-elder', 'rtGateFolk', 0, 3.4);
  L_(ZBe, 'rt_obed', BBOAZ, '보아스의 집', 'rtObed', -3, 3);
  V_(ZBe, 'rt_naomi4', BBOAZ, '나오미', M_.naomi, 'rtObed', -5, 4.4);
  L_(ZS, 'sm_ramah', RAMAH, '라마의 엘가나의 집', 'smRamah', 3, -2);
  V_(ZS, 'sm_elkanah', RAMAH, '엘가나', M_.elkanah, 'smHannah', 4.4, 0.6);
  V_(ZS, 'sm_hannah', RAMAH, '한나', M_.hannah, 'smHannah', 5.6, -1.2);
  V_(ZS, 'sm_peninnah', RAMAH, '브닌나', 'he-mother', 'smRamah', 2.4, 2.4);
  L_(ZS, 'sm_vow', ELI_SEAT, '여호와의 전 문설주 곁', 'smVow', 1.6, -2.2);
  V_(ZS, 'sm_eli', ELI_SEAT, '엘리', M_.eli, 'smEli');
  L_(ZS, 'sm_sons', ELI_SEAT, '엘리의 아들들 — 제물', 'smSons', 4, 4);
  V_(ZS, 'sm_hophni', ELI_SEAT, '홉니', 'pr-nadab', 'smSons', 5.4, 5);
  V_(ZS, 'sm_phinehas', ELI_SEAT, '비느하스', 'pr-abihu', 'smSons', 6.6, 3.6);
  V_(ZS, 'sm_boy', SAMBED, '아이 사무엘', M_.samuel, 'smBoy', 2, 2);
  L_(ZS, 'sm_night', SAMBED, '하나님의 궤 있는 여호와의 전 — 밤', 'smNight');
  L_(ZS, 'sm_grow', SAMBED, '사무엘이 자라매', 'smGrow', 4, 4);
  L_(ZS, 'sm_battle', EBEN_VIEW, '실로 동쪽 언덕 — 에벤에셀과 아벡을 멀리', 'smBattle');
  V_(ZS, 'sm_eli4', ROADSEAT, '엘리', M_.eli, 'smEli4');
  L_(ZS, 'sm_ichabod', ICHA, '비느하스의 집', 'smIcha');
  L_(ZP, 'sm_ashdod', ASHDOD, '아스돗 다곤의 신당', 'smAshdod', 6, 2);
  L_(ZP, 'sm_cities', GATH, '가드와 에그론', 'smCities');
  V_(ZP, 'sm_lords', LORDS6, '블레셋 방백들과 제사장들', 'j5-philistine-lord', 'smLords');
  L_(ZP, 'sm_cart', CART0, '새 수레 — 벧세메스 길', 'smCart', -2, 2);
  L_(ZP, 'sm_shemesh', BSHEMESH, '벧세메스 사람 여호수아의 밭', 'smShemesh', -3, -2);
  L_(ZB, 'sm_kirjath', KIRJATH, '기럇여아림 — 아비나답의 집', 'smKirjath');
  V_(ZB, 'sm_samuel7', MIZ7, '사무엘', 'j5-levite-youth', 'smSamuel7', 2, 0);
  L_(ZB, 'sm_thunder', MIZ7, '미스바 — 블레셋 사람이 올라올 때', 'smThunder', -6, -3);
  L_(ZB, 'sm_stone', STONE7, '미스바와 센 사이', 'smStone');
  // 모압 평지에서 요단을 건너 길갈로(5편과 같은 길 — 4편 것은 4편에서만 보임)
  ZM.push({ id: 'to-gilgal', x: -36.5, z: 9, type: 'exit', title: '요단을 건너 길갈로', to: 'gilgal', spawn: [34, 2], cond: 'rtOn' });

/*DLG*/
  DLG.rt_gen.push({ event: 'genealogy' });
  DLG.sm_ark_taken.push({ event: 'arkTaken' });
  DLG.sm_ashdod.splice(3, 0, { event: 'dagon1' }); DLG.sm_ashdod.splice(5, 0, { event: 'dagon2' });   // 5:3 엎드러짐 · 5:4 다시 엎드러짐
  DLG.sm_thunder.splice(4, 0, { event: 'thunder' });   // 7:10 큰 우레

  const { mgOpen, mgCloseAll, completeTask } = api;
  const btnCss = 'padding:8px 6px;border-radius:10px;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.08);color:#f5e9d0;font-size:13px';
  const LIVES = 3, hearts = n => '❤️'.repeat(Math.max(0, n)) + '🤍'.repeat(Math.max(0, LIVES - n));
  const OUT = '❤️을 다 썼어요 — 처음부터 다시';
  const msgBox = m => `<div style="text-align:center;color:#ffd27a;font-weight:800;min-height:34px;padding:6px 10px 0;font-size:12.5px">${m}</div>`;
  Object.assign(api.BADGES, { walk_with: { ico: '🚶', name: '어머니를 따라간 사람' }, gleaner: { ico: '🌾', name: '이삭을 주운 사람' }, speak_lord: { ico: '👂', name: '"말씀하옵소서" 한 사람' }, ebenezer: { ico: '🪨', name: '"여기까지" 돌을 세운 사람' } });
  function giveBadge(k){ const S = api.ST; if (S.badges.includes(k)) return; S.badges.push(k); api.saveST(); setTimeout(() => api.toast(`${api.BADGES[k].ico} 배지 획득: ${api.BADGES[k].name}`, 2600), 900); }
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
  // 따라가기 공용 틀: 앞서 가는 것과 사이를 [lo, hi] 칸 안에 두고 끝까지(🚶를 눌러 따라간다)
  function followPlay(q, title, info, lo, hi, farMsg, nearMsg, doneMsg, onDone){
    let lead = 24, me = 10, life = LIVES, msg = '', timer = null, done = false, speed = 0.55, perfect = true;
    mgOpen(title, info);
    const gap = () => lead - me;
    const draw = () => { const g = gap(), ok = g >= lo && g <= hi;
      api.mgArea.innerHTML = done ? `<div style="padding:16px;text-align:center;color:#ffd27a;font-weight:800">${doneMsg}</div>`
        : `<div style="position:relative;margin:16px 14px 6px;height:34px;border-radius:8px;background:rgba(255,255,255,.08)"><div style="position:absolute;right:0;top:0;bottom:0;width:6%;background:rgba(255,210,122,.4);border-radius:0 8px 8px 0"></div><div style="position:absolute;left:${Math.min(94, lead)}%;top:4px;font-size:20px">${title.split(' ')[0]}</div><div style="position:absolute;left:${Math.max(0, me)}%;top:4px;font-size:20px">🧍</div></div><div style="text-align:center;font-size:12.5px">${ok ? '🟢 알맞아요' : g > hi ? '🔴 너무 멀어요' : '🟠 너무 가까워요'} · ${hearts(life)}</div><div style="padding:6px 14px"><button data-fw="1" style="${btnCss};width:100%;font-size:15px">🚶 따라가기</button></div>` + msgBox(msg);
      api.mgAct.textContent = done ? '계속' : '끝까지 가면 계속'; api.mgAct.disabled = !done; };
    const lose = m => { perfect = false; if (--life <= 0){ lead = 24; me = 10; life = LIVES; msg = OUT; } else { me = lead - (lo + hi) / 2; msg = `${m} ${hearts(life)}`; } };
    draw();
    timer = setInterval(() => { if (done) return; speed = Math.max(0.35, Math.min(0.85, speed + (Math.random() - 0.5) * 0.12)); lead += speed * 0.45;
      if (lead >= 94){ lead = 94; done = true; clearInterval(timer); timer = null; } else if (gap() > hi) lose(farMsg); draw(); }, 140);
    api.mgArea.onclick = e => { if (!e.target.closest('[data-fw]') || done) return; me += 1.4; if (gap() < lo) lose(nearMsg); else msg = ''; draw(); };
    api.mgAct.onclick = () => { if (!done) return; api.mgArea.onclick = null; mgCloseAll(); if (onDone) onDone(perfect); completeTask(q); };
    api.mg.onClose = () => { api.mgArea.onclick = null; if (timer){ clearInterval(timer); timer = null; } };
  }
  // 🚶 함께 걷기(룻 1:16)
  function walkGame(q){ api.runDialog(DLG.rt_walk, () => followPlay(q, '👵 나오미와 함께', '"어머니께서 가시는 곳에 나도 가고" (룻 1:16) — 🚶를 눌러 나오미 곁을 떠나지 말고 걸어요.', 2, 14,
    '"내게 어머니를 떠나며 … 돌아가라 강권하지 마옵소서" — 가까이 붙어요', '나오미 바로 뒤에 바짝 붙었어요 — 조금 천천히', '✓ "이에 그 두 사람이 베들레헴까지 갔더라" (룻 1:19)', perfect => { if (perfect) giveBadge('walk_with'); }), null, 'rt_walk'); }
  // 🌾 이삭 줍기(룻 2:3, 7, 15-17) — 떨어진 이삭만. 아직 베지 않은 곡식을 누르면 ❤️
  function gleanGame(q){
    api.runDialog(DLG.rt_glean, () => {
      const N = 12, NEED = 15, LIMIT = 24000; let got = 0, life = LIVES, msg = '', cells = [], t0 = 0, timer = null, tick = null, done = false, perfect = true;
      mgOpen('🌾 보아스의 밭', '"베는 자를 따라 단 사이에서 이삭을 줍게 하소서" (룻 2:7) — 떨어진 이삭 🌾만 주워요. 서 있는 곡식 🟨은 베는 자의 몫이에요. 24초 안에 열다섯!');
      const roll = () => { cells = [...Array(N)].map(() => Math.random() < 0.3 ? 'g' : 's'); if (!cells.includes('g')) cells[Math.floor(Math.random() * N)] = 'g'; };
      const draw = () => { const left = t0 ? Math.max(0, Math.ceil((LIMIT - (performance.now() - t0)) / 1000)) : 24;
        api.mgArea.innerHTML = done ? `<div style="padding:16px;text-align:center;color:#ffd27a;font-weight:800">✓ "보리가 한 에바쯤 되는지라" (룻 2:17)</div>`
          : `<div style="text-align:center;font-size:13px;padding:4px">🧺 ${got} / ${NEED} · ⏱ ${left}초 · ${hearts(life)}</div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;padding:6px 10px">${cells.map((c, i) => `<button data-gl="${i}" style="${btnCss};font-size:22px;padding:8px 0">${c === 'g' ? '🌾' : c === 'x' ? '▫️' : '🟨'}</button>`).join('')}</div>` + msgBox(msg);
        api.mgAct.textContent = done ? '계속' : '열다섯 줍으면 계속'; api.mgAct.disabled = !done; };
      const reset = m => { got = 0; t0 = 0; clearTimeout(timer); timer = null; life = LIVES; msg = m; perfect = false; roll(); };
      roll(); draw();
      tick = setInterval(() => { if (!done && t0){ roll(); draw(); } }, 1600);
      api.mgArea.onclick = e => { const b = e.target.closest('[data-gl]'); if (!b || done) return; const i = +b.dataset.gl;
        if (!t0){ t0 = performance.now(); timer = setTimeout(() => { if (!done){ reset('해가 졌어요 — 처음부터 다시'); draw(); } }, LIMIT); }
        if (cells[i] === 'g'){ cells[i] = 'x'; got++; msg = ''; if (got >= NEED){ done = true; clearTimeout(timer); clearInterval(tick); } }
        else if (cells[i] === 's'){ if (--life <= 0) reset(OUT); else { perfect = false; msg = `아직 베지 않은 곡식이에요 ${hearts(life)}`; } }
        draw(); };
      api.mgAct.onclick = () => { if (!done) return; api.mgArea.onclick = null; mgCloseAll(); if (perfect) giveBadge('gleaner'); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; clearTimeout(timer); clearInterval(tick); };
    }, null, 'rt_glean');
  }
  // 🌙 나오미의 말(룻 3:3-4) — 일러 준 차례대로(밤 장면은 배경만)
  function floorGame(q){ api.runDialog(DLG.rt_floor, () => orderPlay(q, '🌙 나오미가 일러 준 말', '룻 3:3-4 — 나오미가 룻에게 일러 준 말을 차례대로 놓아요.', [
    ['🛁 목욕하고 기름을 바르고 의복을 입고', '(3:3)'], ['⬇ 타작 마당에 내려가서', '(3:3)'], ['🤫 먹고 마시기를 다 하기까지 보이지 말고', '(3:3)'], ['👀 그가 눕는 곳을 알았다가', '(3:4)'], ['👂 그가 네 할 일을 네게 알게 하리라', '(3:4)'],
  ], '룻 3:3-4를 다시 읽어 봐요', '✓ "어머니의 말씀대로 내가 다 행하리이다" (3:5)'), null, 'rt_floor'); }
  // 👡 신을 벗어(룻 4:7-8) — 옛적 이스라엘의 전례를 본문대로 고르기
  function sandalGame(q){
    api.runDialog(DLG.rt_sandal, () => {
      const R = [['무르거나 교환하는 일을 확정할 때 사람이 한 일은?', ['👡 자기 신을 벗어 이웃에게 주었어요', '💍 반지를 건넸어요', '🤝 손을 맞잡았어요'], 0, '"사람이 그의 신을 벗어 그의 이웃에게 주더니" (4:7)'],
        ['누가 신을 벗었나요?', ['아무개(기업 무를 자)', '보아스', '장로들'], 0, '"그 기업 무를 자가 보아스에게 이르되 네가 너를 위하여 사라 하고 그의 신을 벗는지라" (4:8)']];
      let r = 0, life = LIVES, msg = '';
      mgOpen('👡 신을 벗어', '"이것이 이스라엘 중에 증명하는 전례가 된지라" (룻 4:7)');
      const draw = () => { const c = R[r];
        api.mgArea.innerHTML = c ? `<div style="text-align:center;padding:10px;font-size:14.5px;font-weight:800">${c[0]}</div><div style="display:grid;gap:6px;padding:0 12px">${c[1].map((o, i) => `<button data-sd="${i}" style="${btnCss};font-size:13.5px">${o}</button>`).join('')}</div>` + msgBox(msg || hearts(life))
          : `<div style="padding:16px;text-align:center;color:#ffd27a;font-weight:800">✓ ${R[1][3]}</div>`;
        api.mgAct.textContent = c ? '다 고르면 계속' : '계속'; api.mgAct.disabled = !!c; };
      draw();
      api.mgArea.onclick = e => { const b = e.target.closest('[data-sd]'); const c = R[r]; if (!b || !c) return;
        if (+b.dataset.sd === c[2]){ r++; msg = ''; } else if (--life <= 0){ r = 0; life = LIVES; msg = OUT; } else msg = `${c[3]} ${hearts(life)}`; draw(); };
      api.mgAct.onclick = () => { if (R[r]) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; };
    }, null, 'rt_sandal');
  }
  // 🙏 여호와 앞에 오래 기도하는 동안(삼상 1:12) — 누른 채 기다리기(손을 떼면 처음부터)
  function vowGame(q){
    api.runDialog(DLG.sm_vow, () => {
      const NEED = 4000; let t0 = 0, raf = null, done = false, msg = '';
      mgOpen('🙏 한나의 기도', '"한나가 속으로 말하매 입술만 움직이고 음성은 들리지 아니하므로" (삼상 1:13) — 🙏를 누른 채 오래 기도해요.');
      const draw = () => { const k = t0 ? Math.min(1, (performance.now() - t0) / NEED) : 0;
        api.mgArea.innerHTML = done ? `<div style="padding:16px;text-align:center;color:#ffd27a;font-weight:800">✓ "여호와 앞에 오래 기도하는 동안에" (1:12)</div>`
          : `<div style="margin:14px;height:14px;border-radius:7px;background:rgba(255,255,255,.12);overflow:hidden"><div style="height:100%;width:${Math.round(k * 100)}%;background:#ffd27a"></div></div><div style="padding:0 14px"><button data-pr="1" style="${btnCss};width:100%;font-size:22px;padding:14px;touch-action:none">🙏</button></div>` + msgBox(msg);
        api.mgAct.textContent = done ? '계속' : '기도를 마치면 계속'; api.mgAct.disabled = !done; };
      const tick = () => { if (!t0 || done) return; if (performance.now() - t0 >= NEED){ done = true; t0 = 0; draw(); return; } draw(); raf = requestAnimationFrame(tick); };
      const down = e => { if (!e.target.closest('[data-pr]') || done) return; e.preventDefault(); t0 = performance.now(); msg = ''; tick(); };
      const up = () => { if (!t0 || done) return; t0 = 0; cancelAnimationFrame(raf); msg = '손을 떼었어요 — 처음부터 다시'; draw(); };
      draw(); api.mgArea.addEventListener('pointerdown', down); window.addEventListener('pointerup', up);
      const cleanup = () => { api.mgArea.removeEventListener('pointerdown', down); window.removeEventListener('pointerup', up); cancelAnimationFrame(raf); };
      api.mgAct.onclick = () => { if (!done) return; cleanup(); mgCloseAll(); completeTask(q); };
      api.mg.onClose = cleanup;
    }, null, 'sm_vow');
  }
  // 👂 밤에 부르는 소리(삼상 3:4-10) — 세 번은 엘리에게 달려가고, 엘리의 말(3:9)을 들은 뒤 네 번째에 "말씀하옵소서"
  function callsGame(q){
    api.runDialog(DLG.sm_night, () => {
      let n = 0, calling = false, phase = 'run', life = LIVES, msg = '', waitT = null, perfect = true;
      mgOpen('👂 밤에 부르는 소리', '"사무엘은 하나님의 궤 있는 여호와의 전 안에 누웠더니" (삼상 3:3) — 부르는 소리가 들리면 움직여요.');
      const draw = () => {
        if (phase === 'done'){ api.mgArea.innerHTML = `<div style="padding:16px;text-align:center;color:#ffd27a;font-weight:800">✓ ${CALL['10']}</div>`; }
        else if (phase === 'answer') api.mgArea.innerHTML = `<div style="padding:8px 12px;font-size:12.5px;opacity:.85">${CALL['9']}</div><div style="text-align:center;padding:6px;font-size:16px;font-weight:800">${calling ? '🗣 "사무엘아 사무엘아"' : '🌙 …'}</div><div style="display:grid;gap:6px;padding:0 12px">${['🏃 엘리에게 달려가요', '🙇 "말씀하옵소서 주의 종이 듣겠나이다"', '😴 그냥 자요'].map((o, i) => `<button data-cl="${i}" style="${btnCss};font-size:13px">${o}</button>`).join('')}</div>` + msgBox(msg || hearts(life));
        else api.mgArea.innerHTML = `<div style="text-align:center;padding:10px;font-size:16px;font-weight:800">${calling ? '🗣 "사무엘아"' : '🌙 등불이 아직 꺼지지 아니하였어요 …'}</div><div style="padding:0 14px"><button data-cl="run" style="${btnCss};width:100%;font-size:15px">🏃 "내가 여기 있나이다" — 엘리에게</button></div>` + msgBox(msg || `부른 횟수 ${n} · ${hearts(life)}`);
        api.mgAct.textContent = phase === 'done' ? '계속' : '대답하면 계속'; api.mgAct.disabled = phase !== 'done'; };
      const listen = () => { calling = false; clearTimeout(waitT); waitT = setTimeout(() => { calling = true; draw(); }, 1400 + Math.random() * 2200); };
      const lose = m => { perfect = false; if (--life <= 0){ n = 0; phase = 'run'; life = LIVES; msg = OUT; } else msg = `${m} ${hearts(life)}`; };
      listen(); draw();
      api.mgArea.onclick = e => { const b = e.target.closest('[data-cl]'); if (!b || phase === 'done') return; const k = b.dataset.cl;
        if (phase === 'run'){ if (!calling){ lose('아직 아무도 부르지 않았어요'); } else { n++; msg = n === 1 ? CALL['5'] : n === 2 ? CALL['6'] : CALL['8']; if (n >= 3){ phase = 'answer'; } listen(); } }
        else if (phase === 'answer'){ if (!calling){ lose('아직이에요 — 다시 부르실 때까지'); } else if (k === '1'){ phase = 'done'; clearTimeout(waitT); } else lose('엘리의 말(3:9)을 다시 읽어 봐요'); }
        draw(); };
      api.mgAct.onclick = () => { if (phase !== 'done') return; api.mgArea.onclick = null; clearTimeout(waitT); mgCloseAll(); if (perfect) giveBadge('speak_lord'); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; clearTimeout(waitT); };
    }, null, 'sm_night');
  }
  // 🐄 수레를 따라 벧세메스 경계까지(삼상 6:12) — 너무 가까이 가지도(6:19), 처지지도 말고
  function cartGame(q){ api.runDialog(DLG.sm_cart, () => followPlay(q, '🐄 새 수레', '"블레셋 방백들은 벧세메스 경계까지 따라가니라" (삼상 6:12) — 🚶를 눌러 따라가요. 초록 칸 안에서!', 8, 20,
    '수레가 멀어졌어요', '"여호와의 궤를 들여다 본 까닭에" (6:19) — 너무 가까이 가지 않아요', '✓ "암소가 벧세메스 길로 바로 행하여 … 좌우로 치우치지 아니하였고" (6:12)'), null, 'sm_cart'); }
  // 🪨 에벤에셀(삼상 7:12) — 사무엘의 말을 차례대로
  function stoneGame(q){ api.runDialog(DLG.sm_stone, () => orderPlay(q, '🪨 에벤에셀', '"사무엘이 돌을 취하여 미스바와 센 사이에 세워 이르되" (삼상 7:12)', [
    ['여호와께서', ''], ['여기까지', ''], ['우리를', ''], ['도우셨다', ''],
  ], '삼상 7:12을 다시 떠올려 봐요', '✓ "그 이름을 에벤에셀이라 하니라"', perfect => { if (perfect) giveBadge('ebenezer'); }), null, 'sm_stone'); }

  // ── 연출 ──
  function flash(col, o = 0.5){ const fl = document.getElementById('flash'); if (!fl) return; fl.style.transition = 'none'; fl.style.background = col; fl.style.opacity = String(o); setTimeout(() => { fl.style.transition = 'opacity 1.2s'; fl.style.opacity = '0'; }, 120); setTimeout(() => { fl.style.background = ''; }, 1500); }
  const refresh = zid => { if (api.Z && api.Z.id === zid) world(zid); };
  function genealogy(){ if (api.addGeneal) api.addGeneal(['오벳', '이새']); }
  function arkTaken(){ arkAway = true; flash('#d8d0c4', 0.35); }
  function dagon1(){ dagonShow = 1; refresh('philistia'); }
  function dagon2(){ dagonShow = 2; refresh('philistia'); }
  function thunder(){ thunderShow = true; flash('#eef4ff', 0.6); setTimeout(() => flash('#eef4ff', 0.5), 700); try { api.startCine('smThunder', THUNDER[0], api.heightAt(THUNDER[0], THUNDER[1]) + 5, THUNDER[1], { r: 18, h: 8, dur: 4, spin: 0.3 }); } catch (e){} }

  // ── 마을에 놓이는 것 ──
  let worldObj = null;
  const propFail = {};
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
    // 원화(GPT 13차)가 오기 전에는 도형으로 대신한다
    const FB = {
      'barley-sheaf': (x, z) => { put(new THREE.CylinderGeometry(0.18, 0.12, 0.9, 7), M(0xd9b44a), x, 0.45, z); },
      'sandal': (x, z) => { put(new THREE.BoxGeometry(0.28, 0.06, 0.12), M(0x8a6a48), x, 0.05, z); },
      'lamp': (x, z) => { put(new THREE.CylinderGeometry(0.12, 0.16, 0.12, 10), M(0xa8784a), x, 0.7, z); put(new THREE.CylinderGeometry(0.05, 0.05, 0.64, 6), M(0x7a5a3a), x, 0.32, z);
        const f = new THREE.Sprite(new THREE.SpriteMaterial({ map: api.flameTex, color: 0xffd27a, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.9 })); f.position.set(x, api.heightAt(x, z) + 0.92, z); f.scale.set(0.3, 0.45, 1); g.add(f); },
      'ebenezer-stone': (x, z) => { const r = put(new THREE.DodecahedronGeometry(0.8, 0), M(0xb8a888), x, 1.0, z); r.scale.set(0.8, 1.5, 0.7); },
      'cart': (x, z, ry) => { const c = put(new THREE.BoxGeometry(1.6, 0.25, 2.2), M(0x9a7048), x, 0.75, z, ry); for (const dz of [-0.8, 0.8]){ const w = put(new THREE.CylinderGeometry(0.42, 0.42, 0.1, 12), M(0x6a4a2a), x + Math.sin(ry) * 0, 0.42, z + dz, ry); w.rotation.z = Math.PI / 2; } },
      'milk-cow': (x, z, ry) => prop('bull', x, z, ry),
    };
    const propOr = (n, x, z, ry = 0, dy = 0) => prop(n, x, z, ry, dy) || (FB[n] ? FB[n](x, z, ry) : null);
    const house = (x, z, w = 4, d = 3.4, col = 0xd8c4a0) => { put(new THREE.BoxGeometry(w, 2.6, d), M(col), x, 1.3, z); put(new THREE.BoxGeometry(w + 0.4, 0.25, d + 0.4), M(0xb89a70), x, 2.7, z); obst(x, z, Math.max(w, d) / 2 + 0.4); };
    if (zid === 'moab' && p.ch === 0) house(NHOUSE[0], NHOUSE[1]);
    if (zid === 'bethlehem'){
      needProps(['grain-field', 'barley-sheaf', 'sandal', 'tent-small', 'env-acacia'], 'bethlehem');
      // 성읍: 북쪽 언덕 위 집들, 서쪽 성문
      [[-14, -24], [-6, -30], [4, -30], [10, -22], [-10, -24], [16, -28], [-2, -20]].forEach(([x, z]) => house(x, z, 3.6, 3, 0xdcc8a2));
      put(new THREE.BoxGeometry(1.4, 4, 4), M(0xcdb896), BGATE[0] - 2.6, 2, BGATE[1]); put(new THREE.BoxGeometry(1.4, 4, 4), M(0xcdb896), BGATE[0] + 2.6, 2, BGATE[1]); put(new THREE.BoxGeometry(6.6, 0.8, 4.2), M(0xcdb896), BGATE[0], 4.4, BGATE[1]);
      obst(BGATE[0] - 2.6, BGATE[1], 1.8); obst(BGATE[0] + 2.6, BGATE[1], 1.8);
      // 보리밭(룻 1:22 보리 추수 시작할 때) — 2장에서는 베는 자들이 지나간 자리에 단
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) prop('grain-field', BFIELD[0] - 5 + i * 5, BFIELD[1] - 3 + j * 3.4, 0);
      if (p.ch >= 1) [[-4, -6], [-1, -6.4], [2, -5.6]].forEach(([dx, dz], i) => propOr('barley-sheaf', BFIELD[0] + dx, BFIELD[1] + dz, i));
      prop('tent-small', BMEAL[0] + 2, BMEAL[1] - 1, 1.2);   // 식사할 때 그늘(2:14)
      // 타작마당(3:2) — 밤 장면은 배경만
      { const f = new THREE.Mesh(new THREE.CircleGeometry(3, 22).rotateX(-Math.PI / 2), M(0xc8b088)); f.position.set(BFLOOR[0], api.heightAt(BFLOOR[0], BFLOOR[1]) + 0.04, BFLOOR[1]); g.add(f); }
      if (p.ch === 2) [[1.6, 0], [-1.2, 1.4], [0, -1.8]].forEach(([dx, dz], i) => propOr('barley-sheaf', BFLOOR[0] + dx, BFLOOR[1] + dz, i * 2));
      if (p.ch === 3 && p.step >= 1) propOr('sandal', BGATE[0], BGATE[1] + 2.2, 0.6);
      prop('env-acacia', BGATE[0] - 8, BGATE[1] + 4, 0.4);
    }
    if (zid === 'shiloh' && p.ch >= 4){
      needProps(['lamp'], 'shiloh');
      house(RAMAH[0], RAMAH[1], 5, 4);   // 라마의 엘가나의 집(1:19)
      put(new THREE.BoxGeometry(0.9, 0.5, 0.7), M(0x8a6a48), ELI_SEAT[0] + 0.6, 0.25, ELI_SEAT[1] - 0.6);   // 문설주 곁 의자(1:9)
      if (p.ch === 5 && p.step <= 2) propOr('lamp', SAMBED[0] - 1, SAMBED[1] - 1, 0);   // 하나님의 등불이 아직 꺼지지 아니하였으며(3:3)
      if (p.ch === 6) put(new THREE.BoxGeometry(0.9, 0.5, 0.7), M(0x8a6a48), ROADSEAT[0] + 0.6, 0.25, ROADSEAT[1] - 0.6);   // 길 옆 의자(4:13)
      if (p.ch === 6) house(ICHA[0] + 3, ICHA[1] + 2);
      if (p.ch === 6 && p.step <= 1) for (let i = 0; i < 8; i++){ const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: api.flameTex, color: 0xb8a890, depthWrite: false, transparent: true, opacity: 0.45 })); s.position.set(EBEN_VIEW[0] + 10 + (Math.random() - 0.5) * 10, api.heightAt(EBEN_VIEW[0], EBEN_VIEW[1]) + 2 + Math.random() * 3, EBEN_VIEW[1] - 8 + (Math.random() - 0.5) * 6); s.scale.set(4, 3, 1); g.add(s); }   // 싸움은 먼지만 멀리
    }
    if (zid === 'philistia' && p.ch === 7){
      needProps(['ark', 'cart', 'milk-cow', 'pillar', 'bull'], 'philistia');
      // 아스돗 다곤의 신당(5:2) — 다곤은 얼굴·모양 없는 돌덩이로, 엎드러진 모습만
      const stone = M(0xcdb896);
      put(new THREE.BoxGeometry(9, 0.6, 7), stone, ASHDOD[0], 4.4, ASHDOD[1]); put(new THREE.BoxGeometry(9, 4.2, 0.6), stone, ASHDOD[0], 2.1, ASHDOD[1] - 3.2); prop('pillar', ASHDOD[0] - 3.6, ASHDOD[1] + 2.8, 0); prop('pillar', ASHDOD[0] + 3.6, ASHDOD[1] + 2.8, 0); obst(ASHDOD[0], ASHDOD[1] - 3.2, 3.2);
      const stand = p.step === 0 && dagonShow === 0, fallen = !stand;
      const d = put(new THREE.BoxGeometry(1.2, 2.6, 0.9), M(0x9a9080), ASHDOD[0] + 1.6, fallen ? 0.5 : 1.3, ASHDOD[1] - 1); if (fallen){ d.rotation.x = Math.PI / 2; d.position.z += 1.2; }
      if (dagonShow >= 2 || p.step >= 1){ put(new THREE.BoxGeometry(0.5, 0.4, 0.4), M(0x9a9080), ASHDOD[0] + 3.6, 0.3, ASHDOD[1] + 2); put(new THREE.BoxGeometry(0.4, 0.3, 0.6), M(0x9a9080), ASHDOD[0] + 4.2, 0.2, ASHDOD[1] + 1.4); }   // 5:4 문지방에 끊어진 조각
      if (p.step <= 2) prop('ark', ASHDOD[0] - 1.2, ASHDOD[1] - 1, Math.PI / 2, 0.05);
      // 새 수레와 두 암소(6:7) — 수레 위에 궤
      if (p.step >= 3){ propOr('cart', CART0[0], CART0[1], Math.PI / 2); prop('ark', CART0[0], CART0[1], Math.PI / 2, 0.75); propOr('milk-cow', CART0[0] + 2.6, CART0[1] - 0.7, Math.PI / 2); propOr('milk-cow', CART0[0] + 2.6, CART0[1] + 0.7, Math.PI / 2); }
      // 벧세메스 밀밭과 큰 돌(6:13-14)
      for (let i = 0; i < 3; i++) put(new THREE.BoxGeometry(2.6, 0.7, 2.2), M(0xd9b44a), BSHEMESH[0] - 4 + i * 2.8, 0.35, BSHEMESH[1] + 4);
      { const r = put(new THREE.DodecahedronGeometry(1.2, 0), M(0x9a8a72), BSHEMESH[0] - 3, 0.6, BSHEMESH[1] - 2); r.scale.set(1.3, 0.8, 1); }
    }
    if (zid === 'gibeon' && p.ch === 8){
      needProps(['ebenezer-stone', 'tent-small', 'tent-mid'], 'gibeon');
      house(KIRJATH[0] + 3, KIRJATH[1] + 2, 4.4, 3.6);   // 아비나답의 집(7:1)
      [[-4, 2], [3, 4], [-1, -4], [6, -2]].forEach(([dx, dz], i) => prop(i % 2 ? 'tent-small' : 'tent-mid', MIZ7[0] + dx, MIZ7[1] + dz, i * 1.3));   // 미스바에 모임(7:5)
      if (thunderShow || p.step >= 3) for (let i = 0; i < 6; i++){ const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: api.flameTex, color: 0x9aa0b0, depthWrite: false, transparent: true, opacity: 0.4 })); s.position.set(THUNDER[0] + (Math.random() - 0.5) * 8, api.heightAt(THUNDER[0], THUNDER[1]) + 6 + Math.random() * 4, THUNDER[1] + (Math.random() - 0.5) * 8); s.scale.set(6, 4, 1); g.add(s); }
      if (p.cleared) propOr('ebenezer-stone', STONE7[0], STONE7[1], 0.3);   // 7:12 미스바와 센 사이에 세운 돌
    }
    api.zoneRoot.add(g); worldObj = g;
  }

  const T = n => `📜 룻과 사무엘 ${n}장`;
  return {
    id: 'ruth',
    chapters: [
      { title: `${T(1)} — 어머니의 하나님이 나의 하나님`, clearTitle: '🎉 6편 1장 「어머니의 하나님이 나의 하나님」 완료!', next: '2장: 보아스의 밭에서 이삭 줍기',
        steps: [
          { id: 'r1s1', zone: 'moab', obj: '사사들이 치리하던 때에 — 모압 지방', where: '모압 평지 남쪽 엘리멜렉의 집(빛나는 곳)', point: 'rt_moab', dlg: 'rt_moab' },
          { id: 'r1s2', zone: 'moab', obj: '"너희는 각기 너희 어머니의 집으로 돌아가라"', where: '집 앞의 나오미', npc: 'rt_naomi', dlg: 'rt_naomi' },
          { id: 'r1s3', zone: 'moab', obj: '룻은 그를 붙좇았더라', where: '나오미 곁의 룻', npc: 'rt_ruth', dlg: 'rt_ruth' },
          { id: 'r1s4', zone: 'moab', obj: '나오미와 함께 걷기', where: '집 앞의 나오미', npc: 'rt_naomi', game: 'walk', doneDlg: 'rt_walk_done' },
          { id: 'r1s5', zone: 'bethlehem', obj: '베들레헴에 이르니라', where: '베들레헴 성문 안(빛나는 곳)', point: 'rt_arrive', dlg: 'rt_arrive', reward: { verse: 'rut1-16', clear: true } },
        ] },
      { title: `${T(2)} — 보아스의 밭에서 이삭 줍기`, clearTitle: '🎉 6편 2장 「보아스의 밭에서 이삭 줍기」 완료!', next: '3장: 타작마당',
        steps: [
          { id: 'r2s1', zone: 'bethlehem', obj: '"내가 밭으로 가서 … 이삭을 줍겠나이다"', where: '성읍 안의 룻', npc: 'rt_ruth2', dlg: 'rt_glean_ask' },
          { id: 'r2s2', zone: 'bethlehem', obj: '"여호와께서 너희와 함께 하시기를"', where: '보리밭의 보아스', npc: 'rt_boaz', dlg: 'rt_boaz' },
          { id: 'r2s3', zone: 'bethlehem', obj: '보아스가 룻에게', where: '보리밭의 보아스', npc: 'rt_boaz', dlg: 'rt_boaz2' },
          { id: 'r2s4', zone: 'bethlehem', obj: '식사할 때에', where: '밭 가의 그늘(빛나는 곳)', point: 'rt_meal', dlg: 'rt_meal' },
          { id: 'r2s5', zone: 'bethlehem', obj: '베는 자를 따라 이삭 줍기', where: '보리밭(빛나는 곳)', point: 'rt_field', game: 'glean', doneDlg: 'rt_glean_done', reward: { verse: 'rut2-12', clear: true } },
        ] },
      { title: `${T(3)} — 타작마당`, clearTitle: '🎉 6편 3장 「타작마당」 완료!', next: '4장: 기업 무를 자',
        steps: [
          { id: 'r3s1', zone: 'bethlehem', obj: '"내 딸아 내가 너를 위하여 안식할 곳을 구하여"', where: '성읍 안의 나오미', npc: 'rt_naomi3', dlg: 'rt_naomi3' },
          { id: 'r3s2', zone: 'bethlehem', obj: '나오미가 일러 준 말', where: '동쪽 타작마당(빛나는 곳)', point: 'rt_floor', game: 'floor', doneDlg: 'rt_floor_done' },
          { id: 'r3s3', zone: 'bethlehem', obj: '"내 딸아 앉아 있으라"', where: '성읍 안의 나오미', npc: 'rt_naomi3', dlg: 'rt_naomi3b', reward: { verse: 'rut3-11', clear: true } },
        ] },
      { title: `${T(4)} — 기업 무를 자`, clearTitle: '🎉 6편 4장 「기업 무를 자」 완료!', next: '5장: 한나의 기도',
        steps: [
          { id: 'r4s1', zone: 'bethlehem', obj: '성문에 올라가 앉은 보아스', where: '서쪽 성문(빛나는 곳)', point: 'rt_gate', dlg: 'rt_gate' },
          { id: 'r4s2', zone: 'bethlehem', obj: '신을 벗어 이웃에게', where: '성문(빛나는 곳)', point: 'rt_gate', game: 'sandal', doneDlg: 'rt_sandal_done' },
          { id: 'r4s3', zone: 'bethlehem', obj: '나오미에게 아들이 태어났다', where: '보아스의 집(빛나는 곳)', point: 'rt_obed', dlg: 'rt_obed' },
          { id: 'r4s4', zone: 'bethlehem', obj: '베레스의 계보', where: '보아스의 집(빛나는 곳)', point: 'rt_obed', dlg: 'rt_gen', reward: { verse: 'rut4-14', clear: true } },
        ] },
      { title: `${T(5)} — 한나의 기도`, clearTitle: '🎉 6편 5장 「한나의 기도」 완료!', next: '6장: 말씀하옵소서 주의 종이 듣겠나이다',
        steps: [
          { id: 'r5s1', zone: 'shiloh', obj: '해마다 실로에 올라가는 엘가나의 집', where: '실로 서쪽 라마의 집(빛나는 곳)', point: 'sm_ramah', dlg: 'sm_ramah' },
          { id: 'r5s2', zone: 'shiloh', obj: '한나의 서원과 기도', where: '여호와의 전 문설주 곁(빛나는 곳)', point: 'sm_vow', game: 'vow', doneDlg: 'sm_vow_done' },
          { id: 'r5s3', zone: 'shiloh', obj: '라마로 돌아가 — 사무엘', where: '라마의 집(빛나는 곳)', point: 'sm_ramah', dlg: 'sm_born' },
          { id: 'r5s4', zone: 'shiloh', obj: '"이 아이를 위하여 내가 기도하였더니"', where: '여호와의 전 문 곁의 엘리', npc: 'sm_eli', dlg: 'sm_lent' },
          { id: 'r5s5', zone: 'shiloh', obj: '한나의 노래', where: '라마의 집 곁의 한나', npc: 'sm_hannah', dlg: 'sm_song', reward: { verse: ['1sa1-27', '1sa2-2'], clear: true } },
        ] },
      { title: `${T(6)} — 말씀하옵소서 주의 종이 듣겠나이다`, clearTitle: '🎉 6편 6장 「말씀하옵소서」 완료!', next: '7장: 언약궤를 빼앗김',
        steps: [
          { id: 'r6s1', zone: 'shiloh', obj: '엘리의 아들들', where: '여호와의 전 문 앞(빛나는 곳)', point: 'sm_sons', dlg: 'sm_sons' },
          { id: 'r6s2', zone: 'shiloh', obj: '세마포 에봇을 입은 아이 사무엘', where: '여호와의 전 안의 사무엘', npc: 'sm_boy', dlg: 'sm_boy' },
          { id: 'r6s3', zone: 'shiloh', obj: '밤에 부르는 소리', where: '하나님의 궤 있는 곳(빛나는 곳)', point: 'sm_night', game: 'calls', doneDlg: 'sm_night_done' },
          { id: 'r6s4', zone: 'shiloh', obj: '사무엘이 자라매', where: '여호와의 전 안(빛나는 곳)', point: 'sm_grow', dlg: 'sm_grow', reward: { verse: ['1sa3-10', '1sa3-19'], clear: true } },
        ] },
      { title: `${T(7)} — 언약궤를 빼앗김`, clearTitle: '🎉 6편 7장 「언약궤를 빼앗김」 완료!', next: '8장: 다곤이 엎드러짐, 궤가 돌아옴',
        steps: [
          { id: 'r7s1', zone: 'shiloh', obj: '에벤에셀과 아벡 — 멀리서', where: '실로 동쪽 언덕(빛나는 곳)', point: 'sm_battle', dlg: 'sm_battle' },
          { id: 'r7s2', zone: 'shiloh', obj: '하나님의 궤가 빼앗겼고', where: '실로 동쪽 언덕(빛나는 곳)', point: 'sm_battle', dlg: 'sm_ark_taken' },
          { id: 'r7s3', zone: 'shiloh', obj: '길 옆 의자의 엘리', where: '길 옆의 엘리', npc: 'sm_eli4', dlg: 'sm_eli4' },
          { id: 'r7s4', zone: 'shiloh', obj: '"영광이 이스라엘에서 떠났다"', where: '비느하스의 집(빛나는 곳)', point: 'sm_ichabod', dlg: 'sm_ichabod', reward: { verse: '1sa4-21', clear: true } },
        ] },
      { title: `${T(8)} — 다곤이 엎드러짐, 궤가 돌아옴`, clearTitle: '🎉 6편 8장 「다곤이 엎드러짐, 궤가 돌아옴」 완료!', next: '9장: 에벤에셀',
        steps: [
          { id: 'r8s1', zone: 'philistia', obj: '아스돗 다곤의 신당', where: '블레셋 평지 서쪽 아스돗(빛나는 곳)', point: 'sm_ashdod', dlg: 'sm_ashdod' },
          { id: 'r8s2', zone: 'philistia', obj: '가드와 에그론으로', where: '북쪽 가드(빛나는 곳)', point: 'sm_cities', dlg: 'sm_cities' },
          { id: 'r8s3', zone: 'philistia', obj: '블레셋 사람들이 제사장들을 불러', where: '가운데의 블레셋 방백들', npc: 'sm_lords', dlg: 'sm_lords' },
          { id: 'r8s4', zone: 'philistia', obj: '벧세메스 경계까지 따라가기', where: '새 수레(빛나는 곳)', point: 'sm_cart', game: 'cart', doneDlg: 'sm_cart_done' },
          { id: 'r8s5', zone: 'philistia', obj: '벧세메스 사람들', where: '동쪽 벧세메스의 밭(빛나는 곳)', point: 'sm_shemesh', dlg: 'sm_bethshemesh', reward: { verse: '1sa6-12', clear: true } },
        ] },
      { title: `${T(9)} — 에벤에셀`, clearTitle: '🎉 6편 「룻과 사무엘」을 모두 마쳤어요! 여섯 번째 받침대에 에벤에셀 돌이 놓여요', next: '두루마리마을 기념 전시관에서 여섯 번째 받침대를 보세요',
        steps: [
          { id: 'r9s1', zone: 'gibeon', obj: '기럇여아림 아비나답의 집 — 이십 년', where: '기브온 마을 남동쪽 기럇여아림(빛나는 곳)', point: 'sm_kirjath', dlg: 'sm_kirjath' },
          { id: 'r9s2', zone: 'gibeon', obj: '"전심으로 여호와께 돌아오려거든"', where: '미스바의 사무엘', npc: 'sm_samuel7', dlg: 'sm_turn' },
          { id: 'r9s3', zone: 'gibeon', obj: '큰 우레', where: '미스바(빛나는 곳)', point: 'sm_thunder', dlg: 'sm_thunder' },
          { id: 'r9s4', zone: 'gibeon', obj: '여호와께서 여기까지', where: '미스바와 센 사이(빛나는 곳)', point: 'sm_stone', game: 'stone', doneDlg: 'sm_stone_done', reward: { verse: '1sa7-12', clear: true } },
        ] },
    ],
    games: { walk: walkGame, glean: gleanGame, floor: floorGame, sandal: sandalGame, vow: vowGame, calls: callsGame, cart: cartGame, stone: stoneGame },
    events: { genealogy, arkTaken, dagon1, dagon2, thunder },
    world: zid => world(zid),
  };
});
