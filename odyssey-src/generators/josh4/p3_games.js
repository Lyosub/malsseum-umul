  // ── 3부 미니게임 ──
  // 🏅 3부 배지(SQL claim_odyssey_achieve 키 badge-peacemaker · my_house)
  Object.assign(api.BADGES, { peacemaker: { ico: '🤝', name: '오해를 풀어낸 사람' }, my_house: { ico: '🏠', name: '나와 내 집은' } });
  // 고르기 공용 틀: 라운드마다 하나를 고른다. 틀리면 ❤️
  function pickPlay(q, title, info, rounds, doneMsg, onDone){
    let r = 0, life = LIVES, msg = '', perfect = true, opts = [];
    const shuffle = () => { const R = rounds[r]; opts = R ? [R.ok, ...R.no].sort(() => Math.random() - 0.5) : []; };
    mgOpen(title, info);
    const draw = () => { const R = rounds[r];
      api.mgArea.innerHTML = R ? `<div style="text-align:center;padding:10px 12px 8px;font-size:13.5px;line-height:1.6">${R.say}</div><div style="display:grid;gap:6px;padding:0 14px">${opts.map((o, i) => `<button data-pk="${i}" style="${btnCss};font-size:13.5px">${o}</button>`).join('')}</div>` + msgBox(msg || `${r + 1} / ${rounds.length} · ${hearts(life)}`)
        : `<div style="padding:16px;text-align:center;color:#ffd27a;font-weight:800;line-height:1.6">${doneMsg}</div>`;
      api.mgAct.textContent = R ? '골라야 계속' : '계속'; api.mgAct.disabled = !!R; };
    shuffle(); draw();
    api.mgArea.onclick = e => { const b = e.target.closest('[data-pk]'); const R = rounds[r]; if (!b || !R) return;
      if (opts[+b.dataset.pk] === R.ok){ r++; msg = ''; shuffle(); }
      else if (--life <= 0){ r = 0; life = LIVES; perfect = false; msg = OUT; shuffle(); }
      else { perfect = false; msg = `${R.hint || '본문을 다시 봐요'} ${hearts(life)}`; }
      draw(); };
    api.mgAct.onclick = () => { if (rounds[r]) return; api.mgArea.onclick = null; mgCloseAll(); if (onDone) onDone(perfect); completeTask(q); };
    api.mg.onClose = () => { api.mgArea.onclick = null; };
  }
  // 🍞 겉모습과 말 대조하기(수 9:4-14) — 그들이 보여 준 것과 한 말을 짝짓고, 무리가 하지 아니한 일을 찾는다. 조약을 깨거나 역사를 바꾸는 선택은 없다
  function evidenceGame(q){ api.runDialog(DLG.j9_meet, () => pickPlay(q, '🍞 먼 나라에서 왔다는 증거', '나그네들이 보여 준 것과 한 말(수 9:12-13)을 짝지어 보고, 그 다음 본문(9:14)을 따라가요.', [
    { say: '"우리의 이 떡은 … 떠나던 날에 우리들의 집에서 아직도 뜨거운 것을 양식으로 가지고 왔으나 보소서 이제 말랐고 곰팡이가 났으며" (9:12)', ok: '🍞 마르고 곰팡이가 난 떡', no: ['🍷 찢어져서 기운 가죽 부대', '👟 낡아서 기운 신과 낡은 옷', '🫏 해어진 전대'] },
    { say: '"우리가 포도주를 담은 이 가죽 부대도 새 것이었으나 찢어지게 되었으며" (9:13)', ok: '🍷 찢어져서 기운 가죽 부대', no: ['🍞 마르고 곰팡이가 난 떡', '👟 낡아서 기운 신과 낡은 옷', '🫏 해어진 전대'] },
    { say: '"우리의 이 옷과 신도 여행이 매우 길었으므로 낡아졌나이다" (9:13)', ok: '👟 낡아서 기운 신과 낡은 옷', no: ['🍞 마르고 곰팡이가 난 떡', '🍷 찢어져서 기운 가죽 부대', '🫏 해어진 전대'] },
    { say: '본문(수 9:14-15)에서 이스라엘 무리가 <b>하지 아니한</b> 일은?', ok: '🙏 어떻게 할지를 여호와께 물음', no: ['🍞 그들의 양식을 취함', '📜 그들과 조약을 맺음', '✋ 회중 족장들이 맹세함'], hint: '9:14을 다시 봐요 —' },
  ], '"무리가 그들의 양식을 취하고는 어떻게 할지를 여호와께 묻지 아니하고" (수 9:14)'), null, 'j9_meet'); }

  // 🌙 밤새도록 올라가기(수 10:9) — 어두운 오르막길에서 🪨를 피해 ◀ ▶로 옮기며, 날이 밝기 전에 기브온까지
  function nightGame(q){
    const ROWS = 6, GOAL = 42; let lane = 1, grid = [], t = 0, life = LIVES, msg = '', done = false, tmr = null;
    mgOpen('🌙 밤새도록 올라가기', '"여호수아가 길갈에서 밤새도록 올라가 갑자기 그들에게 이르니" (수 10:9) — 어두운 오르막길이에요. 🪨를 피해 ◀ ▶로 길을 옮겨요.');
    const draw = () => {
      if (done){ api.mgArea.innerHTML = `<div style="padding:16px;text-align:center;color:#ffd27a;font-weight:800">✓ 날이 밝기 전에 기브온에 이르렀어요</div>`; api.mgAct.textContent = '계속'; api.mgAct.disabled = false; return; }
      const rows = []; for (let r = 0; r < ROWS; r++){ const row = grid[r] || [0, 0, 0]; rows.push(`<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px">${[0, 1, 2].map(c => `<div style="height:26px;border-radius:6px;background:rgba(40,50,90,.55);display:flex;align-items:center;justify-content:center;font-size:17px">${r === ROWS - 1 && c === lane ? '🚶' : row[c] ? '🪨' : ''}</div>`).join('')}</div>`); }
      api.mgArea.innerHTML = `<div style="padding:4px 14px 2px;font-size:12px;opacity:.8;text-align:center">🌄 기브온까지 ${Math.min(100, Math.round(t / GOAL * 100))}%</div><div style="display:grid;gap:4px;padding:4px 30px;background:linear-gradient(#0d1430,#1d2a50);border-radius:10px;margin:0 12px">${rows.join('')}</div>`
        + `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 30px"><button data-nl="-1" style="${btnCss};font-size:18px">◀</button><button data-nl="1" style="${btnCss};font-size:18px">▶</button></div>` + msgBox(msg || hearts(life));
      api.mgAct.textContent = '기브온에 이르면 계속'; api.mgAct.disabled = true; };
    const tick = () => {
      grid.unshift(t % 2 === 0 && t < GOAL - 4 ? [0, 1, 2].map(() => Math.random() < 0.34 ? 1 : 0) : [0, 0, 0]);
      if (grid[0].every(v => v)) grid[0][Math.floor(Math.random() * 3)] = 0;   // 언제나 한 길은 열려 있다
      grid = grid.slice(0, ROWS); t++;
      const hit = grid[ROWS - 1] && grid[ROWS - 1][lane];
      if (hit){ grid[ROWS - 1][lane] = 0; if (--life <= 0){ t = 0; grid = []; life = LIVES; msg = OUT; } else msg = `돌에 걸렸어요 ${hearts(life)}`; }
      else if (t % 6 === 0) msg = '';
      if (t >= GOAL){ done = true; clearInterval(tmr); tmr = null; }
      draw(); };
    draw(); tmr = setInterval(tick, 480);
    api.mgArea.onclick = e => { const b = e.target.closest('[data-nl]'); if (!b || done) return; lane = Math.max(0, Math.min(2, lane + +b.dataset.nl)); draw(); };
    api.mgAct.onclick = () => { if (!done) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
    api.mg.onClose = () => { api.mgArea.onclick = null; if (tmr){ clearInterval(tmr); tmr = null; } };
  }

  // ☀ 해와 달(수 10:12-14) — 플레이어가 하늘을 움직이지 않는다. 여호수아가 한 말과 본문이 밝힌 까닭을 본문대로 고른다
  function skyGame(q){ api.runDialog(DLG.j10_sun, () => pickPlay(q, '☀ 태양아 머무르라', '여호수아가 이스라엘의 목전에서 여호와께 아뢴 말(수 10:12)과, 본문이 밝힌 까닭(10:14)을 본문대로 골라요.', [
    { say: '"태양아 너는 ○○ 위에 머무르라" (10:12)', ok: '🏙 기브온', no: ['🌄 아얄론 골짜기', '⛺ 길갈', '🧱 여리고'] },
    { say: '"달아 너도 ○○에서 그리할지어다" (10:12)', ok: '🌄 아얄론 골짜기', no: ['🏙 기브온', '🌊 요단', '⛰ 헤브론'] },
    { say: '"여호와께서 사람의 목소리를 들으신 이같은 날은 전에도 없었고 후에도 없었나니 이는 ○○" (10:14)', ok: '🙌 여호와께서 이스라엘을 위하여 싸우셨음이니라', no: ['⚔ 여호수아가 밤새도록 올라갔음이니라', '🤝 기브온이 이스라엘과 화친하였음이니라'] },
  ], '"이는 여호와께서 이스라엘을 위하여 싸우셨음이니라" (수 10:14)'), null, 'j10_sun'); }

  // ⏳ 갈렙의 마흔다섯 해(수 14:7-12) — 갈렙이 한 말을 그 차례대로
  function calebGame(q){ api.runDialog(DLG.j11_caleb, () => orderPlay(q, '⏳ 그 날부터 오늘까지', '갈렙이 여호수아에게 한 말(수 14:7-12)을 그 차례대로 놓아요.', [
    ['🧭 사십 세에 가데스 바네아에서 정탐', '14:7'], ['📜 성실한 마음으로 보고', '14:7'], ['🙌 내 하나님 여호와께 충성', '14:8'], ['✋ 모세의 맹세 — 네 발로 밟는 땅', '14:9'],
    ['⏳ 광야에서 방황한 사십오 년', '14:10'], ['💪 팔십오 세 — 여전히 강건', '14:10-11'], ['⛰ "이 산지를 지금 내게 주소서"', '14:12'],
  ], '갈렙의 말을 다시 떠올려 봐요', '✓ "그 날에 여호와께서 말씀하신 이 산지를 지금 내게 주소서" (14:12)'), null, 'j11_caleb'); }

  // ⛰ 그 때나 지금이나(수 14:11) — 같은 빠르기로 오르는 산길. 표시가 초록 칸에 왔을 때 한 걸음
  function trailGame(q){ api.runDialog(DLG.j11_trail, () => {
    const STEPS = 8; let step = 0, pos = 0, dir = 1, life = LIVES, msg = '', done = false, tmr = null;
    mgOpen('⛰ 그 때나 지금이나', '"내 힘이 그 때나 지금이나 같아서" (수 14:11) — 표시가 초록 칸에 왔을 때 ⬆를 눌러 한 걸음씩. 빠르기는 끝까지 같아요.');
    const draw = () => {
      if (done){ api.mgArea.innerHTML = `<div style="padding:16px;text-align:center;color:#ffd27a;font-weight:800">✓ 헤브론 산지 위에 올랐어요</div>`; api.mgAct.textContent = '계속'; api.mgAct.disabled = false; return; }
      api.mgArea.innerHTML = `<div style="display:flex;gap:3px;justify-content:center;padding:8px">${[...Array(STEPS).keys()].map(i => `<div style="width:22px;height:${10 + i * 4}px;align-self:flex-end;border-radius:4px;background:${i < step ? '#ffd27a' : 'rgba(255,255,255,.12)'}"></div>`).join('')}</div>`
        + `<div style="position:relative;margin:8px 18px;height:26px;border-radius:8px;background:rgba(255,255,255,.08)"><div style="position:absolute;left:42%;width:16%;top:0;bottom:0;background:rgba(120,200,120,.45);border-radius:6px"></div><div style="position:absolute;left:${pos}%;top:2px;font-size:18px;transform:translateX(-50%)">🔸</div></div>`
        + `<div style="padding:4px 40px"><button data-tr="1" style="${btnCss};width:100%;font-size:18px">⬆ 한 걸음</button></div>` + msgBox(msg || `${step} / ${STEPS} · ${hearts(life)}`);
      api.mgAct.textContent = '꼭대기에 오르면 계속'; api.mgAct.disabled = true; };
    tmr = setInterval(() => { if (done) return; pos += dir * 4; if (pos >= 100){ pos = 100; dir = -1; } if (pos <= 0){ pos = 0; dir = 1; } draw(); }, 50);
    draw();
    api.mgArea.onclick = e => { if (!e.target.closest('[data-tr]') || done) return;
      if (pos >= 40 && pos <= 60){ step++; msg = '✓ 한 걸음'; if (step >= STEPS){ done = true; clearInterval(tmr); tmr = null; } }
      else if (--life <= 0){ step = 0; life = LIVES; msg = OUT; }
      else msg = `발이 미끄러졌어요 ${hearts(life)}`;
      draw(); };
    api.mgAct.onclick = () => { if (!done) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
    api.mg.onClose = () => { api.mgArea.onclick = null; if (tmr){ clearInterval(tmr); tmr = null; } };
  }, null, 'j11_trail'); }

  // 🗺 땅을 그려 제비 뽑기(수 18:3-10) — 여호수아가 말한 차례대로
  function surveyGame(q){ api.runDialog(DLG.j12_shiloh, () => orderPlay(q, '🗺 실로의 여호와 앞에서', '아직 기업을 받지 못한 일곱 지파 — 여호수아가 말한 차례(수 18:4-6)대로 놓아요.', [
    ['👥 각 지파에 세 사람씩 선정', '18:4'], ['🚶 그 땅에 두루 다니며', '18:4'], ['✍ 일곱 부분으로 그려서', '18:6'], ['⛺ 이 곳 내게로 가져오라', '18:6'], ['🎲 여호와 앞에서 제비를 뽑으리라', '18:6'],
  ], '여호수아의 말(18:4-6)을 다시 떠올려 봐요', '✓ "내가 여기 실로의 여호와 앞에서 너희를 위하여 제비를 뽑으리라" (18:8)'), null, 'j12_shiloh'); }

  // 🏃 도피성 여섯(수 20:7-8) — 요단 이쪽 셋, 요단 저쪽 셋. 이름을 다 들은 뒤 고른다
  function refugeGame(q){ api.runDialog(DLG.j12_refuge, () => api.runDialog(DLG.j12_refuge_done, () => {
    const R = [['요단 서쪽(수 20:7)', ['갈릴리 게데스', '세겜', '기럇 아르바 곧 헤브론'], ['여리고', '아이', '기브온']], ['요단 동쪽(수 20:8)', ['베셀', '길르앗 라못', '바산 골란'], ['길갈', '실로', '벧엘']]];
    let r = 0, got = new Set(), life = LIVES, msg = '', opts = [];
    const shuffle = () => { opts = R[r] ? [...R[r][1], ...R[r][2]].sort(() => Math.random() - 0.5) : []; got = new Set(); };
    mgOpen('🏃 도피성 여섯', '"부지중에 실수로 사람을 죽인 자를 그리로 도망하게 하라" (수 20:3) — 구별한 성읍을 요단 서쪽에서 셋, 동쪽에서 셋 골라요.');
    const draw = () => {
      api.mgArea.innerHTML = R[r] ? `<div style="text-align:center;padding:8px;font-size:13.5px;font-weight:800">${R[r][0]} — ${got.size} / 3</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:0 12px">${opts.map((o, i) => `<button data-rf="${i}" style="${btnCss};${got.has(o) ? 'background:#3d6b45;border-color:#8fd19b' : ''}">${got.has(o) ? '✓ ' : '🏙 '}${o}</button>`).join('')}</div>` + msgBox(msg || hearts(life))
        : `<div style="padding:16px;text-align:center;color:#ffd27a;font-weight:800">✓ 도피성 여섯을 모두 찾았어요</div>`;
      api.mgAct.textContent = R[r] ? '여섯을 찾으면 계속' : '계속'; api.mgAct.disabled = !!R[r]; };
    shuffle(); draw();
    api.mgArea.onclick = e => { const b = e.target.closest('[data-rf]'); if (!b || !R[r]) return; const o = opts[+b.dataset.rf]; if (got.has(o)) return;
      if (R[r][1].includes(o)){ got.add(o); msg = ''; if (got.size >= 3){ r++; msg = r < R.length ? '✓ 이제 요단 동쪽' : ''; shuffle(); } }
      else if (--life <= 0){ r = 0; life = LIVES; msg = OUT; shuffle(); }
      else msg = `${o}은 20:7-8에 없어요 ${hearts(life)}`;
      draw(); };
    api.mgAct.onclick = () => { if (R[r]) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
    api.mg.onClose = () => { api.mgArea.onclick = null; };
  }, null, 'j12_refuge_done'), null, 'j12_refuge'); }

  // 👂 양쪽의 말 듣기(수 22:16-29) — 누가 한 말인지 나누고, 동편 지파가 제단을 쌓은 까닭을 그들의 말에서 찾는다
  function twosideGame(q){ api.runDialog(DLG.j13_answer, () => {
    const A = '🧑‍⚖️ 비느하스와 열 지도자', B = '🏕 르우벤·갓·므낫세 반 지파';
    const SAY = [
      ['"너희가 어찌하여 이스라엘 하나님께 범죄하여 … 제단을 쌓아" (22:16)', A], ['"전능하신 자 하나님 여호와 … 께서 아시나니" (22:22)', B],
      ['"브올의 죄악으로 말미암아 여호와의 회중에 재앙이 내렸으나" (22:17)', A], ['"이는 번제를 위함도 아니요 다른 제사를 위함도 아니라" (22:26)', B],
      ['"세라의 아들 아간이 … 범죄하므로 이스라엘 온 회중에 진노가 임하지 아니하였느냐" (22:20)', A], ['"우리 조상이 지은 여호와의 제단 모형을 보라" (22:28)', B],
    ];
    let i = 0, life = LIVES, msg = '', perfect = true, stage = 0, opts = [];
    const REASON = { ok: '🪨 우리와 너희 사이와 우리의 후대 사이에 증거가 되게 할 뿐 (22:27)', no: ['🔥 그 위에 번제를 드리려고', '🚶 여호와를 따르는 데서 돌아서려고'] };
    mgOpen('👂 양쪽의 말 듣기', '요단 언덕 가의 큰 제단 — 먼저 누가 한 말인지 나누고(수 22:16-29), 동편 지파가 말한 까닭을 찾아요.');
    const draw = () => {
      if (stage === 0) api.mgArea.innerHTML = `<div style="text-align:center;padding:10px 12px 8px;font-size:13.5px;line-height:1.6">${SAY[i][0]}</div><div style="display:grid;gap:6px;padding:0 14px"><button data-ts="A" style="${btnCss}">${A}</button><button data-ts="B" style="${btnCss}">${B}</button></div>` + msgBox(msg || `${i + 1} / ${SAY.length} · ${hearts(life)}`);
      else if (stage === 1) api.mgArea.innerHTML = `<div style="text-align:center;padding:10px 12px 8px;font-size:13.5px;line-height:1.6">동편 지파가 제단을 쌓은 까닭은? (22:24-28)</div><div style="display:grid;gap:6px;padding:0 14px">${opts.map((o, k) => `<button data-tr2="${k}" style="${btnCss}">${o}</button>`).join('')}</div>` + msgBox(msg || hearts(life));
      else api.mgArea.innerHTML = `<div style="padding:16px;text-align:center;color:#ffd27a;font-weight:800;line-height:1.6">✓ "우리 사이에 이 제단은 여호와께서 하나님이 되시는 증거라" (22:34)</div>`;
      api.mgAct.textContent = stage < 2 ? '다 들으면 계속' : '계속'; api.mgAct.disabled = stage < 2; };
    const lose = m => { perfect = false; if (--life <= 0){ i = 0; stage = 0; life = LIVES; msg = OUT; } else msg = `${m} ${hearts(life)}`; };
    draw();
    api.mgArea.onclick = e => {
      const a = e.target.closest('[data-ts]'), b = e.target.closest('[data-tr2]');
      if (a && stage === 0){ if ((a.dataset.ts === 'A' ? A : B) === SAY[i][1]){ i++; msg = ''; if (i >= SAY.length){ stage = 1; opts = [REASON.ok, ...REASON.no].sort(() => Math.random() - 0.5); } } else lose('누가 한 말인지 다시 들어 봐요'); }
      if (b && stage === 1){ if (opts[+b.dataset.tr2] === REASON.ok){ stage = 2; msg = ''; } else lose('그들의 말(22:26-28)을 다시 봐요'); }
      draw(); };
    api.mgAct.onclick = () => { if (stage < 2) return; api.mgArea.onclick = null; mgCloseAll(); if (perfect) giveBadge('peacemaker'); completeTask(q); };
    api.mg.onClose = () => { api.mgArea.onclick = null; };
  }, null, 'j13_answer'); }

  // 🏠 세겜의 말과 대답(수 24:14-24) — 여호수아와 백성이 주고받은 말을 그 차례대로. 플레이어의 선택이 역사 속 백성의 말을 바꾸지 않는다
  function covenantGame(q){ api.runDialog(DLG.j13_covenant, () => orderPlay(q, '🏠 오늘 택하라', '세겜에서 여호수아와 백성이 주고받은 말(수 24:14-24)을 그 차례대로 놓아요.', [
    ['여호수아: "여호와만 섬기라"', '24:14'], ['여호수아: "오직 나와 내 집은 여호와를 섬기겠노라"', '24:15'], ['백성: "우리도 여호와를 섬기리니"', '24:18'],
    ['여호수아: "너희가 여호와를 능히 섬기지 못할 것은"', '24:19'], ['백성: "아니니이다 우리가 여호와를 섬기겠나이다"', '24:21'], ['백성: "우리가 증인이 되었나이다"', '24:22'],
    ['여호수아: "이방 신들을 치워 버리고"', '24:23'], ['백성: "그의 목소리를 우리가 청종하리이다"', '24:24'],
  ], '주고받은 말을 다시 떠올려 봐요', '✓ "우리 하나님 여호와를 우리가 섬기고 그의 목소리를 우리가 청종하리이다" (24:24)', perfect => { if (perfect) giveBadge('my_house'); }), null, 'j13_covenant'); }

