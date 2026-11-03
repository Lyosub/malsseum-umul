  // 사사 조각을 주는 해설 끝(대사 끝에 붙임)
  DLG.jg_othniel.push({ event: 'jOthniel' });
  DLG.jg_shamgar.push({ event: 'jShamgar' });
  DLG.jg_kishon.unshift({ event: 'kishon' });
  DLG.jg_song.push({ event: 'jDeborah' });

  const { mgOpen, mgCloseAll, completeTask } = api;
  const btnCss = 'padding:8px 6px;border-radius:10px;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.08);color:#f5e9d0;font-size:13px';
  const LIVES = 3, hearts = n => '❤️'.repeat(Math.max(0, n)) + '🤍'.repeat(Math.max(0, LIVES - n));
  const OUT = '❤️을 다 썼어요 — 처음부터 다시';
  const msgBox = m => `<div style="text-align:center;color:#ffd27a;font-weight:800;min-height:34px;padding:6px 10px 0;font-size:12.5px">${m}</div>`;
  // 🏅 5편 배지(SQL claim_odyssey_achieve 키 badge-cycle_remember · badge-kishon)
  Object.assign(api.BADGES, { cycle_remember: { ico: '🔁', name: '돌아온 길을 기억한 사람' }, kishon: { ico: '🌊', name: '기손 강을 건넌 사람' } });
  function giveBadge(k){ const S = api.ST; if (S.badges.includes(k)) return; S.badges.push(k); api.saveST(); setTimeout(() => api.toast(`${api.BADGES[k].ico} 배지 획득: ${api.BADGES[k].name}`, 2600), 900); }

  // 차례 맞추기 공용 틀(4편과 같은 방식): 카드를 본문의 차례대로 누른다. 틀리면 ❤️
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
      if (+b.dataset.od === next){ next++; msg = ''; }
      else if (--life <= 0){ next = 0; life = LIVES; perfect = false; shown.sort(() => Math.random() - 0.5); msg = OUT; }
      else { perfect = false; msg = `${hint} ${hearts(life)}`; }
      draw(); };
    api.mgAct.onclick = () => { if (next < cards.length) return; api.mgArea.onclick = null; mgCloseAll(); if (onDone) onDone(perfect); completeTask(q); };
    api.mg.onClose = () => { api.mgArea.onclick = null; };
  }
  // 🔁 되풀이(삿 2:11-19) — 사사 시대에 거듭된 일을 본문의 차례대로
  function cycleGame(q){
    api.runDialog(DLG.jg_cycle, () => orderPlay(q, '🔁 되풀이된 일', '삿 2:11-19 — 이스라엘에게 어떤 일이 되풀이되었는지 본문에 나온 차례대로 놓아요.', [
      ['🙇 바알들을 섬김', '(2:11)'], ['⚔ 노략하는 자의 손에 넘겨짐', '(2:14)'], ['😢 괴로움이 심함', '(2:15)'], ['🛡 여호와께서 사사들을 세우심', '(2:16)'], ['↩ 사사가 죽은 후 더욱 타락함', '(2:19)'],
    ], '삿 2장을 다시 떠올려 봐요', '✓ 사사 시대의 되풀이를 차례대로 놓았어요', perfect => { if (perfect) giveBadge('cycle_remember'); }), null, 'jg_cycle');
  }
  // 🚫 요단 강 나루 장악(삿 3:28) — 건너려는 나루를 눌러 막는다(칼을 쓰는 조작은 없다). 빈 나루를 누르면 ❤️
  function fordGame(q){
    api.runDialog(DLG.jg_ford, () => {
      const N = 5, NEED = 10, LIMIT = 16000; let got = 0, life = LIVES, msg = '', pos = -1, t0 = 0, timer = null, tick = null, done = false;
      mgOpen('🚫 요단 강 나루', '"모압 맞은편 요단 강 나루를 장악하여 한 사람도 건너지 못하게 하였고" (삿 3:28) — 🏃가 나타난 나루를 눌러 막아요. 16초 안에 열 번!');
      const hop = () => { let n; do { n = Math.floor(Math.random() * N); } while (n === pos); pos = n; };
      const draw = () => { const left = t0 ? Math.max(0, Math.ceil((LIMIT - (performance.now() - t0)) / 1000)) : 16;
        api.mgArea.innerHTML = done ? `<div style="padding:16px;text-align:center;color:#ffd27a;font-weight:800">✓ 한 사람도 건너지 못했어요</div>`
          : `<div style="text-align:center;font-size:13px;padding:4px">🚫 막은 나루 ${got} / ${NEED} · ⏱ ${left}초 · ${hearts(life)}</div><div style="display:grid;grid-template-columns:repeat(${N},1fr);gap:5px;padding:6px 10px">${[...Array(N).keys()].map(i => `<button data-fd="${i}" style="${btnCss};font-size:22px;padding:12px 0;background:${i === pos ? 'rgba(255,210,122,.25)' : 'rgba(79,159,181,.25)'}">${i === pos ? '🏃' : '🌊'}</button>`).join('')}</div>` + msgBox(msg);
        api.mgAct.textContent = done ? '계속' : '열 번 막으면 계속'; api.mgAct.disabled = !done; };
      const reset = m => { got = 0; t0 = 0; clearTimeout(timer); timer = null; life = LIVES; msg = m; hop(); };
      hop(); draw();
      tick = setInterval(() => { if (!done && t0){ hop(); draw(); } }, 1250);
      api.mgArea.onclick = e => { const b = e.target.closest('[data-fd]'); if (!b || done) return;
        if (!t0){ t0 = performance.now(); timer = setTimeout(() => { if (!done){ reset('시간이 지났어요 — 처음부터 다시'); draw(); } }, LIMIT); }
        if (+b.dataset.fd === pos){ got++; msg = ''; hop(); if (got >= NEED){ done = true; clearTimeout(timer); clearInterval(tick); } }
        else if (--life <= 0) reset(OUT); else msg = `건너려는 사람이 없는 나루예요 ${hearts(life)}`;
        draw(); };
      api.mgAct.onclick = () => { if (!done) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; clearTimeout(timer); clearInterval(tick); };
    }, null, 'jg_ford');
  }
  // ⛰ "일어나라"(삿 4:14) — 드보라의 말이 들릴 때 내려가기 시작하고, 기손 강이 불어난 길(5:21)을 피해 마른 길로 내려간다
  function taborGame(q){
    api.runDialog(DLG.jg_rise, () => {
      const ROUNDS = 7; let phase = 'wait', heard = false, r = 0, wet = [], life = LIVES, msg = '', waitT = null, perfect = true;
      mgOpen('⛰ 다볼 산에서 내려가기', '"일어나라 이는 여호와께서 시스라를 네 손에 넘겨 주신 날이라" (삿 4:14) — 드보라의 말이 들리면 내려가기 시작해요. 그 전에 내려가면 ❤️');
      const roll = () => { const w = Math.random() < 0.5 ? 1 : 2; const s = new Set(); while (s.size < w) s.add(Math.floor(Math.random() * 3)); wet = [...s]; };
      const draw = () => {
        if (phase === 'wait') api.mgArea.innerHTML = `<div style="padding:14px;text-align:center;font-size:15px;font-weight:800">${heard ? '🗣 "일어나라!"' : '⛰ 다볼 산 위에서 기다려요…'}</div><div style="padding:0 14px"><button data-tb="go" style="${btnCss};width:100%;font-size:15px">⬇ 내려가기</button></div>` + msgBox(msg || hearts(life));
        else if (phase === 'run') api.mgArea.innerHTML = `<div style="text-align:center;font-size:13px;padding:4px">⛰→🏞 ${r} / ${ROUNDS} · ${hearts(life)}</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:6px 10px">${[0, 1, 2].map(i => `<button data-tb="${i}" style="${btnCss};font-size:13px;padding:12px 0">${wet.includes(i) ? '🌊 물이 넘친 길' : '🟫 마른 길'}</button>`).join('')}</div>` + msgBox(msg || '"기손 강은 그 무리를 표류시켰으니" (삿 5:21) — 마른 길로!');
        else api.mgArea.innerHTML = `<div style="padding:16px;text-align:center;color:#ffd27a;font-weight:800">✓ 만 명이 다볼 산에서 내려갔어요</div>`;
        api.mgAct.textContent = phase === 'done' ? '계속' : '다 내려가면 계속'; api.mgAct.disabled = phase !== 'done'; };
      const listen = () => { heard = false; clearTimeout(waitT); waitT = setTimeout(() => { heard = true; draw(); }, 1500 + Math.random() * 2500); };
      const lose = m => { perfect = false; if (--life <= 0){ phase = 'wait'; r = 0; life = LIVES; msg = OUT; listen(); } else msg = `${m} ${hearts(life)}`; };
      listen(); draw();
      api.mgArea.onclick = e => { const b = e.target.closest('[data-tb]'); if (!b) return; const k = b.dataset.tb;
        if (phase === 'wait' && k === 'go'){ if (heard){ phase = 'run'; msg = ''; roll(); } else { lose('아직이에요 — 드보라의 말을 기다려요'); } }
        else if (phase === 'run'){ if (wet.includes(+k)) lose('물이 넘친 길이에요'); else { r++; msg = ''; if (r >= ROUNDS){ phase = 'done'; } else roll(); } }
        draw(); };
      api.mgAct.onclick = () => { if (phase !== 'done') return; api.mgArea.onclick = null; clearTimeout(waitT); mgCloseAll(); if (perfect) giveBadge('kishon'); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; clearTimeout(waitT); };
    }, null, 'jg_rise');
  }

  // ── 연출 ──
  function flash(col, o = 0.5){ const fl = document.getElementById('flash'); if (!fl) return; fl.style.transition = 'none'; fl.style.background = col; fl.style.opacity = String(o); setTimeout(() => { fl.style.transition = 'opacity 1.2s'; fl.style.opacity = '0'; }, 120); setTimeout(() => { fl.style.background = ''; }, 1500); }
  const refresh = zid => { if (api.Z && api.Z.id === zid) world(zid); };
  function kishon(){ kishonShow = true; flash('#dcecff', 0.45); refresh('jezreel'); try { api.startCine('jgKishon', KISHON[0], api.heightAt(KISHON[0], KISHON[1]) + 3, KISHON[1], { r: 16, h: 7, dur: 4.5, spin: 0.4 }); } catch (e){} }
  const judge = n => () => { if (api.addJudge) api.addJudge(n); };

  // ── 마을에 놓이는 것 ──
  let worldObj = null;
  const propFail = {};
  function needProps(names, zid){
    const need = names.filter(n => !api.propTemplates[n] && !propFail[n]); if (!need.length) return;
    api.loadProps(need).then(() => { need.forEach(n => { if (!api.propTemplates[n]) propFail[n] = true; }); refresh(zid); }).catch(() => { need.forEach(n => propFail[n] = true); });
  }
  function world(zid){
    if (worldObj && worldObj.parent) worldObj.parent.remove(worldObj); worldObj = null;
    const p = cur(); if (!p) return;
    if (api.setRiver) api.setRiver(false);   // 4편의 마른 요단은 지나간 일
    const g = new THREE.Group(), M = c => new THREE.MeshToonMaterial({ color: c, gradientMap: api.toonGradient });
    const put = (geo, mat, x, dy, z, ry = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, api.heightAt(x, z) + dy, z); m.rotation.y = ry; m.castShadow = true; g.add(m); return m; };
    const prop = (n, x, z, ry = 0, dy = 0) => { const T = api.propTemplates[n]; if (!T) return null; const o = T.holder.clone(true); o.position.set(x, api.heightAt(x, z) + dy, z); o.rotation.y = ry; g.add(o); return o; };
    if (zid === 'gilgal'){
      // 여리고 성터: 무너진 성벽 돌무더기(수 6:20) 곁에 모압 왕이 차지한 종려나무 성읍(삿 3:13)
      const rub = M(0x8a7a62), rub2 = M(0x6e604c);
      for (let i = 0; i < 30; i++){ const a = i / 30 * Math.PI * 2, rr = JR + (Math.random() - 0.5) * 1.6; const r = put(new THREE.DodecahedronGeometry(0.5 + Math.random() * 0.7), i % 2 ? rub : rub2, JC[0] + Math.cos(a) * rr, 0.3, JC[1] + Math.sin(a) * rr); r.rotation.set(Math.random(), Math.random(), 0); }
      needProps(['env-date-palm'], 'gilgal');
      [[-4, 4], [3, 6], [-6, -2], [5, -3], [0, 9], [-9, 5]].forEach(([dx, dz], i) => prop('env-date-palm', PALMS[0] + dx, PALMS[1] + dz, i));
      // 에글론의 집과 서늘한 다락방(삿 3:20)
      const wall = M(0xd8c4a0), roof = M(0xb89a70);
      put(new THREE.BoxGeometry(6, 3, 5), wall, PALACE[0], 1.5, PALACE[1]); put(new THREE.BoxGeometry(3.2, 2.2, 3), wall, PALACE[0] - 0.8, 4.1, PALACE[1]); put(new THREE.BoxGeometry(3.6, 0.25, 3.4), roof, PALACE[0] - 0.8, 5.3, PALACE[1]);
      api.obstacles.push({ x: PALACE[0], z: PALACE[1], r: 3.4 });
      // 길갈의 열두 돌은 "오늘까지"(수 4:9) 그 자리에
      const st = M(0xd8cdb6); for (let i = 0; i < 12; i++){ const a = i / 12 * Math.PI * 2; const s = put(new THREE.DodecahedronGeometry(0.42, 0), st, MEMO[0] + Math.cos(a) * 1.6, 0.3, MEMO[1] + Math.sin(a) * 1.6); s.rotation.set(i, i * 2, 0); }
      // 3장 돌 뜨는 곳 · 소 모는 막대기
      if (p.ch === 2){ for (let i = 0; i < 6; i++){ const s = put(new THREE.BoxGeometry(0.9, 0.5, 0.7), M(0xc8b896), QUARRY[0] + (i % 3) * 1.2 - 1.2, 0.25, QUARRY[1] + Math.floor(i / 3) * 1.1); s.rotation.y = i * 0.7; }
        if (p.step >= 7 || p.cleared){ const goad = put(new THREE.CylinderGeometry(0.035, 0.05, 2.4, 6), M(0x7a5a3a), SHAMGAR[0], 0.08, SHAMGAR[1]); goad.rotation.z = Math.PI / 2; } }
    }
    if (zid === 'hebron'){
      // 드빌(기럇 세벨) — 옷니엘이 점령한 성(삿 1:13)
      const stone = M(0xc8ad84);
      for (let i = 0; i < 14; i++){ const a = i / 14 * Math.PI * 2; if (Math.abs(a - Math.PI) < 0.35) continue;   // 서쪽 성문
        const w = put(new THREE.BoxGeometry(2.6, 3, 1.1), stone, DEBIR[0] + Math.cos(a) * DEBR, 1.5, DEBIR[1] + Math.sin(a) * DEBR); w.rotation.y = -a + Math.PI / 2;
        api.obstacles.push({ x: DEBIR[0] + Math.cos(a) * DEBR, z: DEBIR[1] + Math.sin(a) * DEBR, r: 1.3 }); }
      // 윗샘과 아랫샘(삿 1:15) — 찾은 뒤로 물이 고여 있다
      const water = new THREE.MeshToonMaterial({ color: 0x4f9fb5, gradientMap: api.toonGradient, transparent: true, opacity: 0.85 });
      const spring = ([x, z]) => { const w = new THREE.Mesh(new THREE.CircleGeometry(1.6, 20).rotateX(-Math.PI / 2), water); w.position.set(x, api.heightAt(x, z) + 0.06, z); g.add(w);
        for (let i = 0; i < 6; i++){ const a = i / 6 * Math.PI * 2; put(new THREE.DodecahedronGeometry(0.3, 0), M(0x9a8a72), x + Math.cos(a) * 1.8, 0.1, z + Math.sin(a) * 1.8); } };
      if (p.ch > 1 || (p.ch === 1 && (p.cleared || p.step >= 4))) spring(UPPER);
      if (p.ch > 1 || (p.ch === 1 && (p.cleared || p.step >= 5))) spring(LOWER);
    }
    if (zid === 'shiloh'){
      // 드보라의 종려나무(삿 4:5)
      needProps(['env-date-palm'], 'shiloh'); prop('env-date-palm', DEBP[0], DEBP[1], 0.6);
    }
    if (zid === 'jezreel'){
      // 바락의 만 명이 모인 다볼 산기슭(삿 4:10) · 시스라의 철 병거(4:13) — 4:15 뒤로는 강가에 흩어져 기운다
      needProps(['tent-small', 'tent-mid'], 'jezreel');
      [[-6, 4], [-2, 8], [4, 9], [8, 4]].forEach(([dx, dz], i) => prop(i % 2 ? 'tent-small' : 'tent-mid', TABOR_FOOT[0] + dx, TABOR_FOOT[1] + dz, i * 1.3));
      if (p.ch >= 3){
        const iron = M(0x5a5a62), wheel = M(0x3a3a40), out = fled();
        for (let i = 0; i < 7; i++){ const x = KISHON[0] + (i % 4) * 3.2 - 2 + (out ? 4 : 0), z = KISHON[1] - 9 + Math.floor(i / 4) * 7 + i * 0.8;
          const c = new THREE.Group(); const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.7, 1.1), iron); body.position.y = 0.75; c.add(body);
          for (const dz of [-0.62, 0.62]){ const w = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.12, 12), wheel); w.rotation.x = Math.PI / 2; w.position.set(0, 0.5, dz); c.add(w); }
          c.position.set(x, api.heightAt(x, z), z); c.rotation.set(out ? 0.35 : 0, i * 0.4 + (out ? 1.2 : 0), out ? 0.25 : 0); c.traverse(o => { if (o.isMesh) o.castShadow = true; }); g.add(c); }
        if (out){ const flood = new THREE.Mesh(new THREE.PlaneGeometry(12, 70).rotateX(-Math.PI / 2), new THREE.MeshToonMaterial({ color: 0x5aa6bd, gradientMap: api.toonGradient, transparent: true, opacity: 0.7 })); flood.position.set(-37, api.heightAt(-37, 0) + 0.05, 0); g.add(flood); }
      }
      // 겐 사람 헤벨의 장막 · 사아난님 상수리나무 곁(삿 4:11)
      prop('tent-small', JAEL_T[0], JAEL_T[1], 2.4); needProps(['env-acacia'], 'jezreel'); prop('env-acacia', JAEL_T[0] - 3.5, JAEL_T[1] - 2.5, 1.1);
    }
    api.zoneRoot.add(g); worldObj = g;
  }

  const T = n => `📜 사사들과 함께 ${n}장`;
  return {
    id: 'judges',
    chapters: [
      { title: `${T(1)} — 여호와를 알지 못하는 세대`, clearTitle: '🎉 5편 1장 「여호와를 알지 못하는 세대」 완료!', next: '2장: 옷니엘',
        steps: [
          { id: 'g1s1', zone: 'gilgal', obj: '길갈에서 보김으로 올라온 여호와의 사자', where: '길갈 진영 동쪽(빛나는 곳)', point: 'jg_angel', dlg: 'jg_angel' },
          { id: 'g1s2', zone: 'gilgal', obj: '백성이 소리를 높여 운 곳', where: '서쪽 언덕 보김(빛나는 곳)', point: 'jg_bochim', dlg: 'jg_bochim' },
          { id: 'g1s3', zone: 'gilgal', obj: '여호수아 뒤에 일어난 다른 세대', where: '길갈 진영 가운데(빛나는 곳)', point: 'jg_camp', dlg: 'jg_gen' },
          { id: 'g1s4', zone: 'gilgal', obj: '되풀이된 일', where: '길갈 진영 가운데(빛나는 곳)', point: 'jg_camp', game: 'cycle', doneDlg: 'jg_judges', reward: { verse: ['jdg2-10', 'jdg2-16'], clear: true } },
        ] },
      { title: `${T(2)} — 옷니엘`, clearTitle: '🎉 5편 2장 「옷니엘」 완료!', next: '3장: 왼손잡이 에훗',
        steps: [
          { id: 'g2s1', zone: 'gilgal', obj: '남쪽 길로 헤브론 산지에 올라가기', where: '길갈 남쪽 길의 초록 빛기둥', exit: 'to-hebron' },
          { id: 'g2s2', zone: 'hebron', obj: '기럇 세벨을 점령하는 자에게', where: '드빌 성 서쪽 성문 앞의 갈렙', npc: 'jg_caleb', dlg: 'jg_debir' },
          { id: 'g2s3', zone: 'hebron', obj: '"샘물도 내게 주소서"', where: '갈렙 곁의 악사', npc: 'jg_achsah', dlg: 'jg_achsah' },
          { id: 'g2s4', zone: 'hebron', obj: '남방의 윗샘 찾기', where: '남동쪽 산기슭 높은 곳(빛나는 곳)', point: 'jg_upper', dlg: 'jg_upper' },
          { id: 'g2s5', zone: 'hebron', obj: '아랫샘 찾기', where: '서쪽 골짜기 낮은 곳(빛나는 곳)', point: 'jg_lower', dlg: 'jg_lower' },
          { id: 'g2s6', zone: 'hebron', obj: '구산 리사다임을 섬긴 여덟 해', where: '남쪽 길 어귀(빛나는 곳)', point: 'jg_cushan', dlg: 'jg_cushan' },
          { id: 'g2s7', zone: 'hebron', obj: '여호와께 부르짖으매 — 옷니엘', where: '드빌 성 앞의 옷니엘', npc: 'jg_othniel', dlg: 'jg_othniel', reward: { verse: 'jdg3-9', clear: true } },
        ] },
      { title: `${T(3)} — 왼손잡이 에훗`, clearTitle: '🎉 5편 3장 「왼손잡이 에훗」 완료!', next: '4장: 드보라와 바락, 야엘',
        steps: [
          { id: 'g3s1', zone: 'hebron', obj: '북쪽 길로 길갈에 내려가기', where: '헤브론 산지 북쪽 길의 초록 빛기둥', exit: 'to-gilgal5' },
          { id: 'g3s2', zone: 'gilgal', obj: '모압 왕 에글론과 종려나무 성읍', where: '무너진 여리고 성터 남쪽의 종려나무들(빛나는 곳)', point: 'jg_palms', dlg: 'jg_palms' },
          { id: 'g3s3', zone: 'gilgal', obj: '공물을 메고 가는 에훗', where: '길갈 진영의 에훗', npc: 'jg_ehud', dlg: 'jg_ehud' },
          { id: 'g3s4', zone: 'gilgal', obj: '길갈 근처 돌 뜨는 곳', where: '열두 돌 서쪽의 돌 뜨는 곳(빛나는 곳)', point: 'jg_quarry', dlg: 'jg_quarry' },
          { id: 'g3s5', zone: 'gilgal', obj: '서늘한 다락방', where: '여리고 성터의 왕의 집(빛나는 곳)', point: 'jg_palace', dlg: 'jg_palace' },
          { id: 'g3s6', zone: 'gilgal', obj: '에브라임 산지에서 나팔을 불매', where: '북서쪽 에브라임 산지(빛나는 곳)', point: 'jg_horn', dlg: 'jg_horn' },
          { id: 'g3s7', zone: 'gilgal', obj: '요단 강 나루 장악하기', where: '동쪽 요단 강 나루(빛나는 곳)', point: 'jg_ford', game: 'ford', doneDlg: 'jg_ford_done' },
          { id: 'g3s8', zone: 'gilgal', obj: '에훗 후에는 — 삼갈', where: '요단 강가의 소 모는 막대기(빛나는 곳)', point: 'jg_shamgar', dlg: 'jg_shamgar', reward: { verse: 'jdg3-15', clear: true } },
        ] },
      { title: `${T(4)} — 드보라와 바락, 야엘`, clearTitle: '🎉 5편 4장 「드보라와 바락, 야엘」 완료!', next: '5장: 기드온을 부르심 (준비 중)',
        steps: [
          { id: 'g4s1', zone: 'gilgal', obj: '북쪽 길로 실로에 올라가기', where: '길갈 북쪽 길의 초록 빛기둥', exit: 'to-shiloh' },
          { id: 'g4s2', zone: 'shiloh', obj: '드보라의 종려나무 아래', where: '서북쪽 종려나무 아래의 드보라', npc: 'jg_deborah', dlg: 'jg_deborah' },
          { id: 'g4s3', zone: 'shiloh', obj: '"당신이 나와 함께 가면"', where: '종려나무 곁의 바락', npc: 'jg_barak', dlg: 'jg_barak' },
          { id: 'g4s4', zone: 'shiloh', obj: '북쪽 이스르엘 골짜기로', where: '실로 서북쪽 길의 초록 빛기둥', exit: 'to-jezreel' },
          { id: 'g4s5', zone: 'jezreel', obj: '다볼 산에 오른 바락', where: '북동쪽 다볼 산 비탈(빛나는 곳)', point: 'jg_tabor', dlg: 'jg_tabor' },
          { id: 'g4s6', zone: 'jezreel', obj: '"일어나라" — 다볼 산에서 내려가기', where: '다볼 산기슭의 드보라', npc: 'jg_deborah_t', game: 'tabor', doneDlg: 'jg_kishon' },
          { id: 'g4s7', zone: 'jezreel', obj: '겐 사람 헤벨의 장막', where: '남서쪽 상수리나무 곁의 장막(빛나는 곳)', point: 'jg_jael', dlg: 'jg_jael' },
          { id: 'g4s8', zone: 'jezreel', obj: '드보라와 바락의 노래', where: '다볼 산기슭(빛나는 곳)', point: 'jg_song', dlg: 'jg_song', reward: { verse: ['jdg4-14', 'jdg5-31'], clear: true } },
        ] },
    ],
    games: { cycle: cycleGame, ford: fordGame, tabor: taborGame },
    events: { kishon, jOthniel: judge('옷니엘'), jEhud: judge('에훗'), jShamgar: judge('삼갈'), jDeborah: judge('드보라') },
    world: zid => world(zid),
  };
});
