s = open('saul7_src.js', encoding='utf-8', newline='').read().replace('\r\n', '\n')
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:70])
    s = s.replace(a, b)
rep("· 2부 「버림받은 왕」(5~7장, 삼상 13–15장).", "· 2부 「버림받은 왕」(5~7장, 삼상 13–15장) · 3부 「소년 다윗」(8~11장, 삼상 16–20장).")
rep("ARMOR = { n: '무기를 든 소년' };", "ARMOR = { n: '무기를 든 소년' },\n    DAVID = { n: '다윗' }, JESSE = { n: '이새' }, ELIAB = { n: '엘리압' }, GOLIATH = { n: '골리앗' }, SERVANTS = { n: '사울의 신하들' }, YOUTH = { n: '소년 중 한 사람' }, ISRAELITES = { n: '이스라엘 사람들' }, WOMEN = { n: '여인들' }, MICHAL = { n: '미갈' };")
rep("jonathan: 'j4-spy-2', armor: 'he-boy-hb' };", "jonathan: 'j4-spy-2', armor: 'he-boy-hb',\n    david: 'shepherd-boy', jesse: 'he-grandpa', eliab: 'he-father', goliath: 'j5-philistine-lord', shield: 'j5-midianite', michal: 'r6-orpah', women: 'ca-singer-f', arrowBoy: 'ca-water-boy' };")
rep("  // 단계 번호\n", """  const JHOUSE = [6, -16], BGATE8 = [-8, -6], SHEEP = [4, 16];                                               // 3부 베들레헴 — 이새의 집 · 성문 · 남쪽 들(삼상 16:11)
  const ISRAEL = [24, 8], GOL = [-6, 6], BROOK = [6, -2], ELAHV = [14, 6], PHILC = [-26, 6];                  // 3부 블레셋 평지의 엘라 골짜기(17:1-3) — 동쪽 산에 이스라엘, 서쪽 산에 블레셋, 가운데 시내(17:40)
  const JONG = [-12, 4], DHOUSE = [-14, 12], EZEL = [-6, 22];                                                 // 3부 기브아 — 요나단의 자리 · 다윗의 집(19:11) · 에셀 바위(20:19)
  // 단계 번호
""")
rep("  // 6장: 0 아말렉 · 1 후회하노니 · 2 길갈에서 만남 · 3 양의 소리 · 4 순종이 제사보다\n", """  // 6장: 0 아말렉 · 1 후회하노니 · 2 길갈에서 만남 · 3 양의 소리 · 4 순종이 제사보다
  // 7장: 0 라마 · 1 베들레헴 장로들 · 2 지나가는 아들들 · 3 들의 막내 · 4 기름 부음
  // 8장: 0 양 지키기 · 1 사울의 신하들 · 2 수금
  // 9장: 0 엘라 골짜기 · 1 이새 · 2 엘리압 · 3 사울 앞 · 4 갑옷 · 5 돌 다섯 · 6 만군의 여호와의 이름 · 7 물매
  // 10장: 0 요나단 · 1 여인들의 노래 · 2 창 · 3 요나단의 말 · 4 미갈과 창 · 5 들에서 언약 · 6 초하루 식탁 · 7 화살 신호
""")
rep("oilShow = false, dust14 = false;", "oilShow = false, dust14 = false, oil16 = false, harpEased = false, golDown = false;")
rep("slGil15: at(6, 2, 4), slSound: at(6, 3, 3),\n", """slGil15: at(6, 2, 4), slSound: at(6, 3, 3),
    slHorn: at(7, 0, 0), slBElders: at(7, 1, 1), slSamB: at(7, 2, 4), slJesse8: at(7, 2, 3), slDavidF: at(7, 3, 3), slDavidB: at(7, 4, 4), slFlock: at(8, 0, 0), slSaul16: at(8, 1, 2), slHarp: at(8, 2, 2),
    slElahV: at(9, 0, 0), slGol: () => { const p = cur(); return !!p && p.ch === 9 && !p.cleared && p.step <= 7 && !golDown; }, slJesse17: at(9, 1, 1), slCamp17: at(9, 2, 7), slEliab: at(9, 2, 2), slSaul17: at(9, 3, 4), slStones: at(9, 5, 5), slDavidV: at(9, 6, 7),
    slJon18: at(10, 0, 0), slWomen: at(10, 1, 1), slSaul18: at(10, 2, 2), slJon19: at(10, 3, 3), slWindow: at(10, 4, 4), slJon20: at(10, 5, 5), slTable: at(10, 6, 6), slEzel: at(10, 7, 7),
""")
rep("ZL = ZONES.gilgal.points;", "ZL = ZONES.gilgal.points, ZBe = ZONES.bethlehem.points, ZP = ZONES.philistia.points;")
rep("  L_(ZL, 'sl_camp15', CAMP, '진영 — 들려오는 소리', 'slSound');\n", """  L_(ZL, 'sl_camp15', CAMP, '진영 — 들려오는 소리', 'slSound');
  // 8장 라마 → 베들레헴
  L_(ZS, 'sl_horn16', RAMAH, '라마 — 뿔에 기름을 채워', 'slHorn', 3, -2);
  V_(ZS, 'sl_samuel16', RAMAH, '사무엘', M_.samuel, 'slHorn', 4.4, 0.6);
  V_(ZBe, 'sl_elders16', BGATE8, '성읍 장로들', M_.elders, 'slBElders', 0, 6);
  V_(ZBe, 'sl_samuel_b', JHOUSE, '사무엘', M_.samuel, 'slSamB', -2, 2.4);
  V_(ZBe, 'sl_jesse', JHOUSE, '이새', M_.jesse, 'slJesse8', 2, 2.4);
  V_(ZBe, 'sl_david_f', SHEEP, '양을 지키는 막내', M_.david, 'slDavidF', 1.6, 0);
  V_(ZBe, 'sl_david_b', JHOUSE, '다윗', M_.david, 'slDavidB', 0, 4.4);
  // 9장 들 → 기브아 사울의 집
  L_(ZBe, 'sl_flock', SHEEP, '들의 양 떼', 'slFlock', -2, 2);
  V_(ZG, 'sl_saul16', KISH, '사울', M_.saul, 'slSaul16', 4.6, 1, { scale: TALL });
  V_(ZG, 'sl_david_harp', KISH, '수금을 든 다윗', M_.david, 'slHarp', 1.4, 4.6);
  // 10장 엘라 골짜기 · 베들레헴
  L_(ZP, 'sl_elah', ELAHV, '엘라 골짜기 — 양편 산 사이', 'slElahV');
  V_(ZP, 'sl_goliath', GOL, '골리앗', M_.goliath, 'slGol', 0, 0, { scale: 1.75 });
  V_(ZP, 'sl_shield', GOL, '방패 든 자', M_.shield, 'slGol', 3, 1.4);
  V_(ZBe, 'sl_jesse17', JHOUSE, '이새', M_.jesse, 'slJesse17', 2, 2.4);
  V_(ZP, 'sl_eliab', ISRAEL, '큰형 엘리압', M_.eliab, 'slEliab', -5, 1);
  V_(ZP, 'sl_people17', ISRAEL, '이스라엘 사람들', M_.people, 'slCamp17', -6, -2.4);
  V_(ZP, 'sl_saul17', ISRAEL, '왕 사울', M_.saul, 'slSaul17', -1, -3, { scale: TALL });
  L_(ZP, 'sl_brook', BROOK, '시내 — 매끄러운 돌', 'slStones', 1.6, 0);
  V_(ZP, 'sl_david_v', GOL, '다윗', M_.david, 'slDavidV', 7, 0.6);
  // 11장 기브아
  V_(ZG, 'sl_jon18', JONG, '요나단', M_.jonathan, 'slJon18', 0, 0);
  V_(ZG, 'sl_david18', JONG, '다윗', M_.david, 'slJon18', -1.6, 1.4);
  L_(ZG, 'sl_women', SEARCH, '길 — 노래하며 나오는 여인들', 'slWomen');
  V_(ZG, 'sl_women1', SEARCH, '여인들', M_.women, 'slWomen', 2.4, -1.2);
  V_(ZG, 'sl_women2', SEARCH, '여인들', M_.women, 'slWomen', 3.6, 1.2);
  V_(ZG, 'sl_saul18', KISH, '창을 든 사울', M_.saul, 'slSaul18', 4.6, 1, { scale: TALL });
  V_(ZG, 'sl_david18h', KISH, '수금을 타는 다윗', M_.david, 'slSaul18', 1.4, 4.6);
  V_(ZG, 'sl_jon19', JONG, '요나단', M_.jonathan, 'slJon19', 0, 0);
  L_(ZG, 'sl_window', DHOUSE, '다윗의 집 — 창', 'slWindow', 2.8, 2);
  V_(ZG, 'sl_michal', DHOUSE, '미갈', M_.michal, 'slWindow', 0.4, 3);
  V_(ZG, 'sl_jon20', EZEL, '요나단', M_.jonathan, 'slJon20', 1.8, 0.6);
  V_(ZG, 'sl_david20', EZEL, '다윗', M_.david, 'slJon20', -0.8, 2.2);
  L_(ZG, 'sl_table', KISH, '초하루 식탁 — 빈자리', 'slTable', 3, 3.6);
  V_(ZG, 'sl_saul20', KISH, '왕 사울', M_.saul, 'slTable', 5.4, 2, { scale: TALL });
  V_(ZG, 'sl_jon21', KISH, '요나단', M_.jonathan, 'slTable', 0.8, 4.8);
  L_(ZG, 'sl_ezel', EZEL, '에셀 바위 곁 — 숨은 곳', 'slEzel', 0, 2.6);
""")
rep("  DLG.sl_obey_done.splice(afterRef(DLG.sl_obey_done, '15:27'), 0, { event: 'tear' });       // 15:27 겉옷자락이 찢어진지라\n", """  DLG.sl_obey_done.splice(afterRef(DLG.sl_obey_done, '15:27'), 0, { event: 'tear' });       // 15:27 겉옷자락이 찢어진지라
  DLG.sl_anoint16.splice(afterRef(DLG.sl_anoint16, '16:13'), 0, { event: 'anoint16' }, { event: 'gemDavid' });   // 16:13 기름 뿔병 · 족보 조각 다윗(마 1:6)
  DLG.sl_harp_done.push({ event: 'ease' });                                                // 16:23 악령이 떠나더라
  DLG.sl_sling_done.splice(afterRef(DLG.sl_sling_done, '17:49'), 0, { event: 'fall' });    // 17:49 — 쓰러짐은 멀리서
""")
rep("climbed_two: { ico: '🧗', name: '바위를 기어오른 둘' } });", "climbed_two: { ico: '🧗', name: '바위를 기어오른 둘' }, harp_song: { ico: '🎵', name: '수금 소리' }, five_stones: { ico: '🪨', name: '돌 다섯' }, arrow_beyond: { ico: '🏹', name: '화살 너머' } });")
rep("  // ── 연출 ──\n", r"""  // 🧒 지나가는 아들들(삼상 16:6-11) — 무엇을 눌러도 대답은 원문대로. 일곱이 다 지나간 뒤 막내를 묻는다
  function sonsGame(q){
    api.runDialog(DLG.sl_sons, () => {
      const SONS = ['엘리압', '아비나답', '삼마', '이새의 아들', '이새의 아들', '이새의 아들', '이새의 아들']; let i = 0, msg = '';
      const reply = k => k === 0 ? LINE['16:7a'] : k <= 2 ? LINE['16:8a'] : LINE['16:10a'];
      mgOpen('🧒 사무엘 앞을 지나가는 아들들', `"${LINE['16:10a']}" (삼상 16:10)`);
      const draw = () => { const end = i >= SONS.length;
        api.mgArea.innerHTML = (end ? doneBox(`"${LINE['16:10b']}" (삼상 16:10)<br><br>"${LINE['16:11a']}" (삼상 16:11)<br>"${LINE['16:11b']}"`)
          : `<div style="text-align:center;padding:4px"><div style="font-size:${i === 0 ? 46 : 32}px;line-height:1.15">🧑</div><div style="font-weight:800;font-size:15px">${SONS[i]} <span style="opacity:.6;font-size:12px">(${i + 1} / 일곱)</span></div></div>`
            + `<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:4px 12px"><button data-sn="1" style="${btnCss}">🫒 이 사람일까요?</button><button data-sn="0" style="${btnCss}">➡ 지나가게 하기</button></div>` + msgBox(msg));
        api.mgAct.textContent = end ? '계속' : '일곱이 다 지나가면 계속'; api.mgAct.disabled = !end; };
      draw();
      api.mgArea.onclick = e => { const b = e.target.closest('[data-sn]'); if (!b || i >= SONS.length) return; msg = `"${reply(i)}"`; i++; draw(); };
      api.mgAct.onclick = () => { if (i < SONS.length) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; };
    }, null, 'sl_sons');
  }
  // 🐑 양 지키기(삼상 17:34-35) — 사자나 곰이 새끼를 물어가는 곳을 눌러 따라간다. 치는 연출은 없고 "건져내었고"까지
  function flockGame(q){
    api.runDialog(DLG.sl_flock, () => {
      const N = 12, NEED = 5, WIN = 1800, GAP = 700; let got = 0, life = LIVES, cell = -1, who = '', until = 0, nextAt = performance.now() + 900, msg = '', timer = null, finished = false;
      mgOpen('🐑 아버지의 양을 지킬 때', `"${LINE['17:34a']}" (삼상 17:34) — 나타난 곳을 빨리 눌러요.`);
      const draw = () => {
        api.mgArea.innerHTML = finished ? doneBox(`✓ "${LINE['17:35a']}" (삼상 17:35)`)
          : `<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:4px;padding:6px 10px">${[...Array(N)].map((_, i) => `<button data-fk="${i}" style="${btnCss};font-size:19px;padding:6px 0;min-height:38px;${i === cell ? 'background:rgba(224,120,90,.45);border-color:#ffb08a' : ''}">${i === cell ? who : '🐑'}</button>`).join('')}</div>` + msgBox(msg || `건져낸 새끼 ${got} / ${NEED} · ${hearts(life)}`);
        api.mgAct.textContent = finished ? '계속' : `새끼 ${NEED}마리를 건져내면 계속`; api.mgAct.disabled = !finished; };
      const stop = () => { if (timer){ clearInterval(timer); timer = null; } };
      timer = setInterval(() => { if (finished) return; const t = performance.now();
        if (cell >= 0 && t >= until){ cell = -1; nextAt = t + GAP; if (--life <= 0){ life = LIVES; got = 0; msg = OUT; } else msg = `놓쳤어요 ${hearts(life)}`; draw(); }
        else if (cell < 0 && t >= nextAt){ cell = Math.floor(Math.random() * N); who = Math.random() < 0.5 ? '🦁' : '🐻'; until = t + WIN; msg = ''; draw(); } }, 80);
      draw();
      const down = e => { const b = e.target.closest('[data-fk]'); if (!b || finished || +b.dataset.fk !== cell) return; e.preventDefault(); cell = -1; nextAt = performance.now() + GAP; msg = ''; if (++got >= NEED){ finished = true; stop(); } draw(); };
      api.mgArea.addEventListener('pointerdown', down);
      const cleanup = () => { stop(); api.mgArea.removeEventListener('pointerdown', down); };
      api.mgAct.onclick = () => { if (!finished) return; cleanup(); mgCloseAll(); completeTask(q); };
      api.mg.onClose = cleanup;
    }, null, 'sl_flock');
  }
  // 🎵 수금(삼상 16:23) — 음이 왼쪽 선에 닿을 때 그 줄을 누른다. 소리는 배경음악을 켜 둔 때만. 무실수면 배지
  function harpGame(q){
    api.runDialog(DLG.sl_harp, () => {
      const SCORE = [[0, 392], [1, 440], [2, 523], [1, 440], [0, 392], [2, 587], [1, 523], [0, 440], [2, 659], [1, 587], [0, 523], [1, 440], [2, 523], [0, 392], [1, 440], [0, 392]];
      const BEAT = 800, TRAVEL = 2400, WIN = 260, NEED = 12, X0 = 11; let notes = [], hits = 0, miss = 0, t0 = 0, raf = null, finished = false, retry = '';
      let ctx = null; const bgmOn = () => { try { return localStorage.getItem('inodyssey-bgm') !== 'off'; } catch (e){ return true; } };
      const pluck = f => { if (!bgmOn()) return; try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime; o.type = 'triangle'; o.frequency.value = f; g.gain.setValueAtTime(0.16, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.9); o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 0.95); } catch (e){} };
      mgOpen('🎵 다윗의 수금', `"${LINE['16:23a']}" (삼상 16:23)`);
      const setStatus = () => { const b = api.mgArea.querySelector('[data-hbar]'), m = api.mgArea.querySelector('[data-hmsg]'); if (b) b.style.width = `${Math.round((1 - hits / SCORE.length) * 100)}%`; if (m) m.textContent = retry || `맞힌 음 ${hits} / ${SCORE.length} (${NEED}음 이상)`; };
      const build = () => { notes = SCORE.map(([l, f], i) => ({ l, f, t: 0, i, st: 0, el: null }));
        api.mgArea.innerHTML = `<div style="margin:2px 14px 4px;height:9px;border-radius:5px;background:rgba(255,255,255,.12);overflow:hidden"><div data-hbar="1" style="height:100%;width:100%;background:#5a5470"></div></div>`
          + [0, 1, 2].map(l => `<div data-hr="${l}" style="position:relative;height:38px;margin:3px 12px;border-radius:8px;overflow:hidden;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.2);touch-action:none"><div style="position:absolute;left:${X0}%;top:0;bottom:0;width:3px;background:#ffd27a"></div><div style="position:absolute;left:0;right:0;top:50%;height:1px;background:rgba(255,255,255,.35)"></div></div>`).join('')
          + `<div data-hmsg="1" style="text-align:center;color:#ffd27a;font-weight:800;min-height:24px;padding:4px 10px 0;font-size:12.5px"></div>`;
        const rows = [...api.mgArea.querySelectorAll('[data-hr]')]; notes.forEach(n => { const d = document.createElement('div'); d.dataset.hn = n.i; d.style.cssText = 'position:absolute;top:50%;transform:translate(-50%,-50%);font-size:20px;pointer-events:none;will-change:left'; d.textContent = '🎵'; rows[n.l].appendChild(d); n.el = d; }); };
      const start = () => { hits = 0; miss = 0; build(); t0 = performance.now() + TRAVEL; notes.forEach(n => { n.t = t0 + n.i * BEAT; }); setStatus(); api.mgAct.textContent = '수금을 타는 중…'; api.mgAct.disabled = true; raf = requestAnimationFrame(tick); };
      const end = () => { cancelAnimationFrame(raf); raf = null;
        if (hits >= NEED){ finished = true; if (miss === 0) giveBadge('harp_song'); flash('#fff4d0', 0.35); api.mgArea.innerHTML = doneBox(`✓ "${LINE['16:23b']}" (삼상 16:23)`); api.mgAct.textContent = '계속'; api.mgAct.disabled = false; }
        else { retry = `${hits}음 맞혔어요 — ${NEED}음 이상이면 돼요. 다시!`; start(); setTimeout(() => { retry = ''; setStatus(); }, 2200); } };
      const tick = () => { const now = performance.now(); let live = false;
        for (const n of notes){ if (n.st) continue; const dt = n.t - now; if (dt < -WIN){ n.st = 2; miss++; n.el.style.display = 'none'; setStatus(); continue; } live = true; n.el.dataset.dt = Math.round(dt); const x = X0 + dt / TRAVEL * 88; n.el.style.left = `${x}%`; n.el.style.opacity = x > 100 ? 0 : 1; }
        if (!live){ end(); return; } raf = requestAnimationFrame(tick); };
      const down = e => { const r = e.target.closest('[data-hr]'); if (!r || finished) return; e.preventDefault(); const now = performance.now(), l = +r.dataset.hr; const n = notes.find(x => !x.st && x.l === l && Math.abs(x.t - now) <= WIN); if (!n) return; n.st = 1; hits++; n.el.textContent = '✨'; pluck(n.f); setTimeout(() => { if (n.el) n.el.style.display = 'none'; }, 180); setStatus(); };
      api.mgArea.addEventListener('pointerdown', down); start();
      const cleanup = () => { if (raf) cancelAnimationFrame(raf); raf = null; api.mgArea.removeEventListener('pointerdown', down); if (ctx){ try { ctx.close(); } catch (e){} ctx = null; } };
      api.mgAct.onclick = () => { if (!finished) return; cleanup(); mgCloseAll(); completeTask(q); };
      api.mg.onClose = cleanup;
    }, null, 'sl_harp');
  }
  // 🛡 사울의 갑옷(삼상 17:38-39) — 입고 걸어 보면 익숙하지 못하다. 벗어야 나아간다
  function armorGame(q){
    api.runDialog(DLG.sl_armor17, () => {
      const ITEMS = [['🧥', '군복'], ['🪖', '놋 투구'], ['🛡', '갑옷'], ['🗡', '칼']]; let worn = new Set(), walks = 0, stage = 0, off = new Set();   // 0 입기 · 1 걸어 보기 · 2 벗기 · 3 끝
      mgOpen('🛡 사울의 군복과 놋 투구', `"${LINE['17:38a']}" (삼상 17:38)`);
      const draw = () => {
        if (stage === 3){ api.mgArea.innerHTML = doneBox(`✓ "${LINE['17:39a']}" (삼상 17:39)`); api.mgAct.textContent = '계속'; api.mgAct.disabled = false; return; }
        const items = `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;padding:4px 12px">${ITEMS.map((t, i) => { const on = stage === 0 ? !worn.has(i) : stage === 2 && !off.has(i); return `<button ${on ? `data-ar="${i}"` : ''} style="${btnCss};${on ? 'background:rgba(255,210,122,.25);border-color:#ffd27a' : 'opacity:.5'}"><span style="font-size:20px">${t[0]}</span><br>${t[1]}</button>`; }).join('')}</div>`;
        const walk = stage === 1 ? `<div style="margin:6px 14px;height:12px;border-radius:6px;background:rgba(255,255,255,.12);overflow:hidden"><div style="height:100%;width:${walks * 4}%;background:#c0a060"></div></div><div style="padding:2px 14px"><button data-aw="1" style="${btnCss};width:100%;font-size:14px">🚶 ${LINE['17:39b']}</button></div>` : '';
        const tip = stage === 0 ? '하나씩 입어요' : stage === 1 ? (walks ? '너무 무거워요 — 걸음이 나가지 않아요' : '입은 채로 걸어 봐요') : `"${LINE['17:39a']}" — 하나씩 벗어요`;
        api.mgArea.innerHTML = items + walk + msgBox(tip); api.mgAct.textContent = '갑옷을 벗으면 계속'; api.mgAct.disabled = true; };
      draw();
      api.mgArea.onclick = e => { const b = e.target.closest('[data-ar]'), w = e.target.closest('[data-aw]');
        if (b && stage === 0){ worn.add(+b.dataset.ar); if (worn.size >= ITEMS.length) stage = 1; }
        else if (w && stage === 1){ if (++walks >= 3) stage = 2; }
        else if (b && stage === 2){ off.add(+b.dataset.ar); if (off.size >= ITEMS.length) stage = 3; }
        else return; draw(); };
      api.mgAct.onclick = () => { if (stage !== 3) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; };
    }, null, 'sl_armor17');
  }
  // 🪨 매끄러운 돌 다섯(삼상 17:40) — 무실수면 배지
  function stonesGame(q){
    api.runDialog(DLG.sl_stones, () => {
      const N = 15, GOOD = 7, NEED = 5; let cells = [], got = 0, life = LIVES, msg = '', perfect = true;
      const roll = () => { cells = shuffle([...Array(N).keys()].map(i => ({ smooth: i < GOOD, off: false }))); got = 0; };
      const smoothCss = 'display:inline-block;width:27px;height:17px;border-radius:50%;background:linear-gradient(160deg,#ece6d6,#a9a08c);vertical-align:middle';
      mgOpen('🪨 시내의 돌', `"${LINE['17:40a']}" (삼상 17:40) — 둥글고 매끄러운 돌만 눌러요.`);
      const draw = () => {
        api.mgArea.innerHTML = got >= NEED ? doneBox(`✓ "${LINE['17:40a']}" (삼상 17:40)`)
          : `<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:5px;padding:5px 12px;background:rgba(90,150,200,.14);border-radius:10px;margin:2px 8px">${cells.map((c, i) => c.off ? '<div style="min-height:34px"></div>' : `<button data-st="${i}" data-sm="${c.smooth ? 1 : 0}" style="${btnCss};padding:3px 0;min-height:34px;font-size:19px">${c.smooth ? `<span style="${smoothCss}"></span>` : '🪨'}</button>`).join('')}</div>` + msgBox(msg || `주머니에 ${got} / ${NEED} · ${hearts(life)}`);
        api.mgAct.textContent = got >= NEED ? '계속' : '돌 다섯을 고르면 계속'; api.mgAct.disabled = got < NEED; };
      roll(); draw();
      api.mgArea.onclick = e => { const b = e.target.closest('[data-st]'); if (!b || got >= NEED) return; const c = cells[+b.dataset.st];
        if (c.smooth){ c.off = true; got++; msg = ''; } else { perfect = false; if (--life <= 0){ life = LIVES; roll(); msg = OUT; } else msg = `모난 돌이에요 ${hearts(life)}`; }
        draw(); };
      api.mgAct.onclick = () => { if (got < NEED) return; api.mgArea.onclick = null; mgCloseAll(); if (perfect) giveBadge('five_stones'); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; };
    }, null, 'sl_stones');
  }
  // 🎯 물매(삼상 17:49) — 조준점이 표적 안에서 멈출 때 놓는다. 학생은 조준까지만, 쓰러짐은 대사 뒤 멀리서. 놓치는 일 없이 "아직"만 있다(본문에 돌은 한 번)
  function slingGame(q){
    api.runDialog(DLG.sl_sling, () => {
      const CYCLE = 3600, HOLD = 450, ZONE = 0.17; let t0 = performance.now(), raf = null, msg = '', finished = false, dot = null;
      const pos = () => { const k = (performance.now() - t0) % CYCLE, run = (CYCLE - 2 * HOLD) / 4;   // 가운데(0)에서 잠깐 멈췄다가 오른쪽 끝 → 가운데(멈춤) → 왼쪽 끝 → 가운데
        if (k < HOLD) return 0; if (k < HOLD + run) return (k - HOLD) / run; if (k < HOLD + 2 * run) return 1 - (k - HOLD - run) / run;
        if (k < 2 * HOLD + 2 * run) return 0; if (k < 2 * HOLD + 3 * run) return -(k - 2 * HOLD - 2 * run) / run; return -1 + (k - 2 * HOLD - 3 * run) / run; };
      mgOpen('🎯 물매', `"${LINE['17:49a']}" (삼상 17:49)`);
      const draw = () => {
        api.mgArea.innerHTML = finished ? doneBox(`✓ "${LINE['17:47a']}" (삼상 17:47)`)
          : `<div style="position:relative;height:58px;margin:10px 18px 6px;border-radius:10px;background:rgba(255,255,255,.08);overflow:hidden"><div style="position:absolute;left:${50 - ZONE * 50}%;width:${ZONE * 100}%;top:0;bottom:0;background:rgba(255,210,122,.3);border-left:2px dashed #ffd27a;border-right:2px dashed #ffd27a"></div><div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:22px;opacity:.75">🪖</div><div data-sdot="1" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:24px">⊕</div></div>`
            + `<div style="padding:4px 14px"><button data-sl="1" style="${btnCss};width:100%;font-size:17px;padding:12px;touch-action:none">🪨 놓기</button></div>` + msgBox(msg);
        api.mgAct.textContent = finished ? '계속' : '조준점이 표적 안에 오면 놓아요'; api.mgAct.disabled = !finished; dot = api.mgArea.querySelector('[data-sdot]'); };
      const tick = () => { if (finished) return; const p = pos(); if (dot){ dot.style.left = `${50 + p * 46}%`; dot.dataset.p = p.toFixed(3); } raf = requestAnimationFrame(tick); };
      draw(); raf = requestAnimationFrame(tick);
      const down = e => { if (!e.target.closest('[data-sl]') || finished) return; e.preventDefault(); if (Math.abs(pos()) * 46 <= ZONE * 50){ finished = true; cancelAnimationFrame(raf); draw(); } else { msg = '아직이에요 — 표적 안에 올 때까지 돌려요'; const m = api.mgArea.lastElementChild; if (m) m.textContent = msg; } };
      api.mgArea.addEventListener('pointerdown', down);
      const cleanup = () => { cancelAnimationFrame(raf); api.mgArea.removeEventListener('pointerdown', down); };
      api.mgAct.onclick = () => { if (!finished) return; cleanup(); mgCloseAll(); completeTask(q); };
      api.mg.onClose = cleanup;
    }, null, 'sl_sling');
  }
  // 🔱 사울의 창(삼상 18:10-11) — 창이 겨눈 자리에서 비킨다. 두 번 피하면 끝. 맞는 연출 없이 "다시"
  function spearGame(q){
    api.runDialog(DLG.sl_spear, () => {
      const AIM = 1700, REST = 900; let lane = 1, aim = 1, dodged = 0, life = LIVES, msg = '', throwAt = performance.now() + 1400 + AIM, phase = 'aim', stuck = -1, timer = null, finished = false;
      mgOpen('🔱 사울의 손에 창이', `"${LINE['18:11a']}" (삼상 18:11) — 🔱가 겨누는 자리에서 ⬅ ➡로 비켜요.`);
      const draw = () => {
        if (finished){ api.mgArea.innerHTML = doneBox(`✓ "${LINE['18:11a']}" (삼상 18:11)`); api.mgAct.textContent = '계속'; api.mgAct.disabled = false; return; }
        api.mgArea.innerHTML = `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px;padding:6px 14px;text-align:center"><div style="grid-column:1/4;font-size:13px;opacity:.8">사울</div>${[0, 1, 2].map(i => `<div style="font-size:21px;min-height:29px;${phase === 'aim' && i === aim ? 'background:rgba(224,120,90,.35);border-radius:8px' : ''}">${phase === 'aim' && i === aim ? '🔱' : i === stuck ? '<span style="opacity:.55">🔱</span>' : ''}</div>`).join('')}${[0, 1, 2].map(i => `<div style="font-size:25px;min-height:34px;background:rgba(255,255,255,.06);border-radius:8px">${i === lane ? '🧑' : ''}</div>`).join('')}</div>`
          + `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:2px 14px"><button data-sp="-1" style="${btnCss};font-size:20px;padding:7px;touch-action:none;${lane === 0 ? 'opacity:.4' : ''}">⬅</button><button data-sp="1" style="${btnCss};font-size:20px;padding:7px;touch-action:none;${lane === 2 ? 'opacity:.4' : ''}">➡</button></div>` + msgBox(msg || `피한 횟수 ${dodged} / 두 번 · ${hearts(life)}`);
        api.mgAct.textContent = '두 번 피하면 계속'; api.mgAct.disabled = true; };
      const stop = () => { if (timer){ clearInterval(timer); timer = null; } };
      timer = setInterval(() => { if (finished) return; const t = performance.now(); if (t < throwAt) return;
        if (phase === 'aim'){ stuck = aim; if (lane === aim){ if (--life <= 0){ life = LIVES; dodged = 0; msg = OUT; } else msg = `비켜야 해요 ${hearts(life)}`; } else { dodged++; msg = dodged >= 2 ? '' : '창이 벽에 박혔어요'; }
          if (dodged >= 2){ finished = true; stop(); draw(); return; } phase = 'rest'; throwAt = t + REST; draw(); }
        else { phase = 'aim'; aim = lane; stuck = -1; msg = ''; throwAt = t + AIM; draw(); } }, 60);
      draw();
      const down = e => { const b = e.target.closest('[data-sp]'); if (!b || finished) return; e.preventDefault(); lane = Math.max(0, Math.min(2, lane + +b.dataset.sp)); draw(); };
      api.mgArea.addEventListener('pointerdown', down);
      const cleanup = () => { stop(); api.mgArea.removeEventListener('pointerdown', down); };
      api.mgAct.onclick = () => { if (!finished) return; cleanup(); mgCloseAll(); completeTask(q); };
      api.mg.onClose = cleanup;
    }, null, 'sl_spear');
  }
  // 🏹 화살 신호(삼상 20:21-22 · 20:36-41) — 화살이 어디 있는지 보고 신호대로, 아이가 갈 때까지 숨어 있다가 일어난다. 무실수면 배지
  function arrowGame(q){
    api.runDialog(DLG.sl_arrow, () => {
      const HIDE = 5000; let stage = 0, msg = '', perfect = true, hideT = 0, timer = null;   // 0 쏘기 · 1 신호 뜻 · 2 숨어 있기 · 3 끝
      mgOpen('🏹 에셀 바위 곁', `정한 신호 — "${LINE['20:21a']}" (20:21) · "${LINE['20:22a']}" (20:22)`);
      const scene = (a, boy) => `<div style="position:relative;height:44px;margin:6px 14px;border-radius:9px;background:rgba(255,255,255,.07);font-size:22px;line-height:44px"><span style="position:absolute;left:4%">🏹</span><span style="position:absolute;left:${boy}%">👦</span>${a !== null ? `<span style="position:absolute;left:${a}%;top:-7px">➶</span>` : ''}<span style="position:absolute;right:3%">🪨</span></div>`;
      const draw = () => {
        if (stage === 3){ api.mgArea.innerHTML = doneBox(`✓ "${LINE['20:41a']}" (삼상 20:41)`); api.mgAct.textContent = '계속'; api.mgAct.disabled = false; return; }
        if (stage === 0) api.mgArea.innerHTML = scene(null, 26) + `<div style="padding:4px 14px"><button data-aw2="1" style="${btnCss};width:100%;font-size:14px;padding:10px">🏹 요나단이 화살을 쏘아요</button></div>` + msgBox('바위 곁에 숨어서 지켜봐요');
        if (stage === 1) api.mgArea.innerHTML = scene(70, 42) + `<div style="text-align:center;font-size:13px;line-height:1.5;padding:0 12px">"${LINE['20:36a']}" (20:36)<br><b>"${LINE['20:37a']}"</b> (20:37)</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:6px 12px"><button data-ch="0" style="${btnCss}">🏠 돌아온다</button><button data-ch="1" style="${btnCss}">🏃 내 길을 간다</button></div>` + msgBox(msg);
        if (stage === 2){ const k = Math.min(1, (performance.now() - hideT) / HIDE); api.mgArea.innerHTML = scene(null, k < 0.5 ? 70 - k * 100 : 20 - (k - 0.5) * 40) + `<div style="margin:0 14px;height:10px;border-radius:5px;background:rgba(255,255,255,.12);overflow:hidden"><div style="height:100%;width:${Math.round(k * 100)}%;background:#9ab4e0"></div></div><div style="padding:6px 14px"><button data-up="1" style="${btnCss};width:100%;font-size:14px;padding:9px">🧍 바위 남쪽에서 일어나기</button></div>` + msgBox(msg || '아이가 성읍으로 갈 때까지 숨어 있어요'); }
        api.mgAct.textContent = '신호대로 움직이면 계속'; api.mgAct.disabled = true; };
      const stop = () => { if (timer){ clearInterval(timer); timer = null; } };
      draw();
      api.mgArea.onclick = e => {
        if (stage === 0 && e.target.closest('[data-aw2]')){ stage = 1; msg = ''; draw(); return; }
        const c = e.target.closest('[data-ch]');
        if (stage === 1 && c){ if (c.dataset.ch === '1'){ stage = 2; msg = ''; hideT = performance.now(); timer = setInterval(draw, 200); } else { perfect = false; msg = `"${LINE['20:22a']}" (20:22)`; } draw(); return; }
        if (stage === 2 && e.target.closest('[data-up]')){ if (performance.now() - hideT >= HIDE){ stop(); stage = 3; } else { perfect = false; msg = `아직 아이가 있어요 — "${LINE['20:39a']}" (20:39)`; } draw(); } };
      api.mgAct.onclick = () => { if (stage !== 3) return; stop(); api.mgArea.onclick = null; mgCloseAll(); if (perfect) giveBadge('arrow_beyond'); completeTask(q); };
      api.mg.onClose = () => { stop(); api.mgArea.onclick = null; };
    }, null, 'sl_arrow');
  }

  // ── 연출 ──
""")
rep("  function tear(){ flash('#d8c4a0', 0.4); }\n", """  function tear(){ flash('#d8c4a0', 0.4); }
  function anoint16(){ oil16 = true; flash('#ffe9a8', 0.45); refresh('bethlehem'); }
  function gemDavid(){ if (api.addGeneal) api.addGeneal(['다윗']); }
  function ease(){ harpEased = true; flash('#fff4d0', 0.3); refresh('gibeah'); }
  function fall(){ golDown = true;
    try { const m = api.markers.find(x => x.data.id === 'sl_goliath'); if (m){ m.mesh.visible = false; m.hidden = true; if (m.col) m.col.r = 0; } const s = api.markers.find(x => x.data.id === 'sl_shield'); if (s){ s.mesh.visible = false; s.hidden = true; if (s.col) s.col.r = 0; } } catch (e){}
    refresh('philistia');
    try { api.startCine('slFall', GOL[0], api.heightAt(GOL[0], GOL[1]) + 3, GOL[1], { r: 30, h: 14, dur: 3.5, spin: 0.25 }); } catch (e){} }
""")
rep("    if (zid === 'shiloh' && p.ch === 0) house(RAMAH[0], RAMAH[1], 5, 4);", "    if (zid === 'shiloh' && (p.ch === 0 || p.ch === 7)) house(RAMAH[0], RAMAH[1], 5, 4);")
rep("    if (zid === 'gibeon' && p.ch === 1 && p.step >= 9){\n", """    if (zid === 'gibeah' && p.ch === 8 && !harpEased) sprites(KISH[0] + 4.6, KISH[1] + 1, 5, 0x3a3648, 0.4, 1.6, 1.6, 1.4, 2.4);   // 16:14 사울을 번뇌하게 한지라 — 수금 뒤 옅어짐(16:23)
    if (zid === 'gibeah' && p.ch === 10){
      needProps(['rock-large', 'jars'], 'gibeah');
      if (p.step === 6){ put(new THREE.BoxGeometry(4.2, 0.8, 1.8), M(0xa8865c), KISH[0] + 3, 0.4, KISH[1] + 2); obst(KISH[0] + 3, KISH[1] + 2, 1.6); }   // 초하루 식탁(20:24-25)
      put(new THREE.DodecahedronGeometry(1.7), M(0xa89a80), EZEL[0], 1.2, EZEL[1]); obst(EZEL[0], EZEL[1], 1.6);   // 에셀 바위(20:19)
    }
    if (zid === 'bethlehem' && (p.ch === 7 || p.ch === 8 || p.ch === 9)){
      needProps(['lamb', 'env-acacia'], 'bethlehem');
      [[-14, -24], [-6, -30], [4, -30], [10, -22], [-10, -24], [16, -28], [-2, -20]].forEach(([x, z]) => house(x, z, 3.6, 3, 0xdcc8a2));   // 성읍(6편과 같은 자리)
      put(new THREE.BoxGeometry(1.4, 4, 4), M(0xcdb896), BGATE8[0] - 2.6, 2, BGATE8[1]); put(new THREE.BoxGeometry(1.4, 4, 4), M(0xcdb896), BGATE8[0] + 2.6, 2, BGATE8[1]); put(new THREE.BoxGeometry(6.6, 0.8, 4.2), M(0xcdb896), BGATE8[0], 4.2, BGATE8[1]);
      obst(BGATE8[0] - 2.6, BGATE8[1], 1.8); obst(BGATE8[0] + 2.6, BGATE8[1], 1.8);
      prop('env-acacia', BGATE8[0] - 8, BGATE8[1] + 4, 0.4);
      [[-5, -2], [-3, 3], [0, 4], [3, 2.6], [6, -1], [-1, -4], [4, -4.4]].forEach(([dx, dz], i) => prop('lamb', SHEEP[0] + dx, SHEEP[1] + dz, i * 0.9));   // 양을 지키나이다(16:11)
      if (oil16 || (p.ch === 7 && p.step >= 5)) sprites(JHOUSE[0], JHOUSE[1] + 4.4, 3, 0xffe2a0, 0.35, 1.2, 1.2, 2.2, 1);
    }
    if (zid === 'philistia' && p.ch === 9){
      needProps(['tent-small', 'tent-mid', 'env-rock-hill'], 'philistia');
      prop('env-rock-hill', 38, 22, 0.4); prop('env-rock-hill', -36, 22, 1.6); prop('env-rock-hill', -36, -10, 2.4); obst(38, 22, 4); obst(-36, 22, 4); obst(-36, -10, 4);   // 양편 산(17:3)
      [[32, 14], [24, 16], [32, 6], [28, -2]].forEach(([x, z], i) => prop(i % 2 ? 'tent-small' : 'tent-mid', x, z, i * 1.1));   // 이스라엘 진영(17:2)
      [[PHILC[0], PHILC[1]], [PHILC[0] - 4, PHILC[1] + 5], [PHILC[0] + 1, PHILC[1] - 6]].forEach(([x, z], i) => prop(i % 2 ? 'tent-small' : 'tent-mid', x, z, 1 + i));   // 블레셋 진영(17:1)
      { const w = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 44).rotateX(-Math.PI / 2), M(0x6fa8d0)); w.position.set(BROOK[0], api.heightAt(BROOK[0], BROOK[1]) + 0.05, BROOK[1] + 4); g.add(w); }   // 시내(17:40)
      if (golDown) sprites(GOL[0], GOL[1], 7, 0xb8a890, 0.42, 3.4, 2.6, 1.6, 8);   // 17:49 뒤 — 먼지만 멀리
    }
    if (zid === 'gibeon' && p.ch === 1 && p.step >= 9){
""")
rep("clearTitle: '🎉 7편 2부 「버림받은 왕」을 마쳤어요! 3부는 준비하고 있어요', next: '8장: 사람은 외모를 보거니와 (준비 중)',", "clearTitle: '🎉 7편 2부 「버림받은 왕」을 마쳤어요!', next: '8장: 사람은 외모를 보거니와',")
rep("""npc: 'sl_samuel15g', game: 'obey', doneDlg: 'sl_obey_done', reward: { verse: '1sa15-22', clear: true } },
        ] },
""", """npc: 'sl_samuel15g', game: 'obey', doneDlg: 'sl_obey_done', reward: { verse: '1sa15-22', clear: true } },
        ] },
      { title: `${T(8)} — 사람은 외모를 보거니와`, clearTitle: '🎉 7편 8장 「사람은 외모를 보거니와」 완료!', next: '9장: 수금 타는 다윗',
        steps: [
          { id: 's8s1', zone: 'shiloh', obj: '뿔에 기름을 채워 가지고 가라', where: '실로 서쪽 라마의 사무엘의 집(빛나는 곳)', point: 'sl_horn16', dlg: 'sl_horn16' },
          { id: 's8s2', zone: 'bethlehem', obj: '"평강을 위하여 오시나이까"', where: '베들레헴 성문 앞의 장로들', npc: 'sl_elders16', dlg: 'sl_elders16' },
          { id: 's8s3', zone: 'bethlehem', obj: '사무엘 앞을 지나가는 아들들', where: '이새의 집 앞의 이새', npc: 'sl_jesse', game: 'sons', doneDlg: 'sl_sons_done' },
          { id: 's8s4', zone: 'bethlehem', obj: '아직 막내가 남았는데', where: '성읍 남쪽 들의 양을 지키는 막내', npc: 'sl_david_f', dlg: 'sl_bring' },
          { id: 's8s5', zone: 'bethlehem', obj: '이가 그니 일어나 기름을 부으라', where: '이새의 집 앞의 사무엘', npc: 'sl_samuel_b', dlg: 'sl_anoint16', reward: { verse: '1sa16-7', clear: true } },
        ] },
      { title: `${T(9)} — 수금 타는 다윗`, clearTitle: '🎉 7편 9장 「수금 타는 다윗」 완료!', next: '10장: 전쟁은 여호와께 속한 것',
        steps: [
          { id: 's9s1', zone: 'bethlehem', obj: '사자나 곰이 와서', where: '성읍 남쪽 들의 양 떼(빛나는 곳)', point: 'sl_flock', game: 'flock', doneDlg: 'sl_flock_done' },
          { id: 's9s2', zone: 'gibeah', obj: '수금을 잘 타는 사람을 구하게 하소서', where: '기브아 기스의 집 곁의 사울', npc: 'sl_saul16', dlg: 'sl_spirit' },
          { id: 's9s3', zone: 'gibeah', obj: '다윗이 수금을 들고 와서', where: '사울의 집 앞의 다윗', npc: 'sl_david_harp', game: 'harp', doneDlg: 'sl_harp_done', reward: { verse: '1sa16-23', clear: true } },
        ] },
      { title: `${T(10)} — 전쟁은 여호와께 속한 것`, clearTitle: '🎉 7편 10장 「전쟁은 여호와께 속한 것」 완료!', next: '11장: 요나단과의 언약',
        steps: [
          { id: 's10s1', zone: 'philistia', obj: '그 사이에는 골짜기가 있었더라', where: '블레셋 평지 엘라 골짜기(빛나는 곳)', point: 'sl_elah', dlg: 'sl_elah' },
          { id: 's10s2', zone: 'bethlehem', obj: '네 형들의 안부를 살피고', where: '베들레헴 이새의 집 앞의 이새', npc: 'sl_jesse17', dlg: 'sl_jesse17' },
          { id: 's10s3', zone: 'philistia', obj: '"네가 어찌하여 이리로 내려왔느냐"', where: '이스라엘 진영의 큰형 엘리압', npc: 'sl_eliab', dlg: 'sl_eliab' },
          { id: 's10s4', zone: 'philistia', obj: '사자의 발톱과 곰의 발톱에서', where: '이스라엘 진영의 왕 사울', npc: 'sl_saul17', dlg: 'sl_saul17' },
          { id: 's10s5', zone: 'philistia', obj: '익숙하지 못하니', where: '이스라엘 진영의 왕 사울', npc: 'sl_saul17', game: 'armor', doneDlg: 'sl_armor_done' },
          { id: 's10s6', zone: 'philistia', obj: '매끄러운 돌 다섯', where: '골짜기의 시내(빛나는 곳)', point: 'sl_brook', game: 'stones', doneDlg: 'sl_stones_done' },
          { id: 's10s7', zone: 'philistia', obj: '"만군의 여호와의 이름으로"', where: '골짜기의 다윗', npc: 'sl_david_v', dlg: 'sl_name' },
          { id: 's10s8', zone: 'philistia', obj: '물매로 던져', where: '골짜기의 다윗', npc: 'sl_david_v', game: 'sling', doneDlg: 'sl_sling_done', reward: { verse: ['1sa17-45', '1sa17-47'], clear: true } },
        ] },
      { title: `${T(11)} — 요나단과의 언약`, clearTitle: '🎉 7편 3부 「소년 다윗」을 마쳤어요! 4부는 준비하고 있어요', next: '12장: 놉의 떡과 아둘람 굴 (준비 중)',
        steps: [
          { id: 's11s1', zone: 'gibeah', obj: '요나단의 마음이 다윗의 마음과 하나가 되어', where: '기브아 마을의 요나단', npc: 'sl_jon18', dlg: 'sl_jon18' },
          { id: 's11s2', zone: 'gibeah', obj: '사울이 죽인 자는 천천이요', where: '마을 동쪽 길(빛나는 곳)', point: 'sl_women', dlg: 'sl_women' },
          { id: 's11s3', zone: 'gibeah', obj: '다윗이 두 번 피하였더라', where: '기스의 집 곁의 사울', npc: 'sl_saul18', game: 'spear', doneDlg: 'sl_spear_done' },
          { id: 's11s4', zone: 'gibeah', obj: '"왕은 신하 다윗에게 범죄하지 마옵소서"', where: '기브아 마을의 요나단', npc: 'sl_jon19', dlg: 'sl_jon19' },
          { id: 's11s5', zone: 'gibeah', obj: '미갈이 다윗을 창에서 달아 내리매', where: '다윗의 집(빛나는 곳)', point: 'sl_window', dlg: 'sl_window' },
          { id: 's11s6', zone: 'gibeah', obj: '"나와 죽음의 사이는 한 걸음 뿐이니라"', where: '남쪽 들 에셀 바위 곁의 요나단', npc: 'sl_jon20', dlg: 'sl_field20' },
          { id: 's11s7', zone: 'gibeah', obj: '다윗의 자리는 비었더라', where: '사울의 집 초하루 식탁(빛나는 곳)', point: 'sl_table', dlg: 'sl_table' },
          { id: 's11s8', zone: 'gibeah', obj: '화살이 네 앞쪽에 있지 아니하냐', where: '남쪽 들 에셀 바위 곁(빛나는 곳)', point: 'sl_ezel', game: 'arrow', doneDlg: 'sl_arrow_done', reward: { verse: ['1sa18-3', '1sa20-42'], clear: true } },
        ] },
""")
rep("sound: soundGame, obey: obeyGame },", "sound: soundGame, obey: obeyGame, sons: sonsGame, flock: flockGame, harp: harpGame, armor: armorGame, stones: stonesGame, sling: slingGame, spear: spearGame, arrow: arrowGame },")
rep("events: { anoint, dust, thunder, dust14: dustFar, tear },", "events: { anoint, dust, thunder, dust14: dustFar, tear, anoint16, gemDavid, ease, fall },")
open('saul7_src.js', 'w', encoding='utf-8', newline='\n').write(s)
# 엔진: 엘라 골짜기·에셀 바위 자리의 흩뿌린 돌·덤불을 비운다
p = r'E:\서브 브레인\Projects\malsseum-umul\odyssey\index.html'
h = open(p, encoding='utf-8', newline='').read()
a = "[-30, -22, 8], [36, -38, 13], [42, 0, 4]],"
assert h.count(a) == 1
h = h.replace(a, "[-30, -22, 8], [36, -38, 13], [42, 0, 4], [24, 8, 10], [-6, 6, 8], [6, -2, 4], [14, 6, 4], [-26, 6, 8]],")
a = "[14, 16, 3], [-16, 3, 5], [-26, -14, 3]],"
assert h.count(a) == 1
h = h.replace(a, "[14, 16, 3], [-16, 3, 5], [-26, -14, 3], [-6, 22, 6], [-12, 4, 3], [-11, 14, 3]],")
open(p, 'w', encoding='utf-8', newline='').write(h)
print('patched')
