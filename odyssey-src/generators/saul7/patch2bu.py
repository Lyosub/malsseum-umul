s = open('saul7_src.js', encoding='utf-8', newline='').read().replace('\r\n', '\n')
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:70])
    s = s.replace(a, b)
rep("이 파일은 1부 「사울 왕」(1~4장, 삼상 8–12장).", "이 파일은 1부 「사울 왕」(1~4장, 삼상 8–12장) · 2부 「버림받은 왕」(5~7장, 삼상 13–15장).")
rep("GIRLS = { n: '소녀들' }, PEOPLE = { n: '백성' };", "GIRLS = { n: '소녀들' }, PEOPLE = { n: '백성' }, JONATHAN = { n: '요나단' }, ARMOR = { n: '무기를 든 소년' };")
rep("nahash: 'j5-midianite', messenger: 'ca-horn-blower' };", "nahash: 'j5-midianite', messenger: 'ca-horn-blower', jonathan: 'j4-spy-2', armor: 'he-boy-hb' };")
rep("  // 단계 번호\n", """  const PASS = [28, 18], BOSES = [24, 24], SENEH = [33, 13], PHIL = [40, 26], MIGRON = [8, 18], HONEY = [10, 33], SMITH = [14, 16], SAM15 = [-16, 3], NIGHT = [-26, -14];   // 2부 기브아와 믹마스 — 믹마스 어귀의 두 바위(14:4)·블레셋 부대·석류나무(14:2)·수풀(14:25)·기브아(15:34)
  const ALT13 = [12, -1], CAMP = [2, 8], GIL15 = [-6, -4];                                                   // 2부 길갈
  // 단계 번호
""")
rep("  // 3장: 0 증언 · 1 기억의 길 · 2 우레와 비 · 3 기도하기를 쉬는 죄\n", """  // 3장: 0 증언 · 1 기억의 길 · 2 우레와 비 · 3 기도하기를 쉬는 죄
  // 4장: 0 믹마스 소식 · 1 이레 · 2 철공이 없음
  // 5장: 0 두 바위 · 1 요나단과 소년 · 2 기어 오름 · 3 사울 · 4 수풀의 꿀 · 5 제비
  // 6장: 0 아말렉 · 1 후회하노니 · 2 길갈에서 만남 · 3 양의 소리 · 4 순종이 제사보다
""")
rep("let dustShow = false, rainShow = false, oilShow = false;", "let dustShow = false, rainShow = false, oilShow = false, dust14 = false;")
rep("slSam12: at(3, 0, 3),\n", """slSam12: at(3, 0, 3),
    slCamp13: at(4, 0, 1), slSmith: at(4, 2, 2), slPass: at(5, 0, 2), slJon: at(5, 1, 2), slMigron: at(5, 3, 5), slHoney: at(5, 4, 4),
    slSam15: at(6, 0, 0), slNight: at(6, 1, 1), slGil15: at(6, 2, 4), slSound: at(6, 3, 3),
""")
rep("  ZM.push({ id: 'to-gilgal', x: -36.5, z: 9, type: 'exit', title: '요단을 건너 길갈로', to: 'gilgal', spawn: [34, 2], cond: 'slOn' });\n", """  ZM.push({ id: 'to-gilgal', x: -36.5, z: 9, type: 'exit', title: '요단을 건너 길갈로', to: 'gilgal', spawn: [34, 2], cond: 'slOn' });
  // 5장 길갈 · 기브아
  L_(ZL, 'sl_mich', GIL7, '길갈 — 사울을 따라 모인 백성', 'slCamp13', -4, 5);
  L_(ZL, 'sl_altar13', ALT13, '번제단', 'slCamp13', 0, 2.6);
  V_(ZL, 'sl_saul13', ALT13, '왕 사울', M_.saul, 'slCamp13', -3, 1, { scale: TALL });
  V_(ZL, 'sl_people13', ALT13, '떠는 백성', M_.people, 'slCamp13', 3, 3);
  L_(ZG, 'sl_smith', SMITH, '베냐민 기브아 — 철공이 없는 땅', 'slSmith');
  // 6장 믹마스 어귀
  L_(ZG, 'sl_pass', PASS, '믹마스 어귀 — 두 바위', 'slPass', -3, 3);
  V_(ZG, 'sl_jonathan', PASS, '요나단', M_.jonathan, 'slJon', -1.6, 0.4);
  V_(ZG, 'sl_armor', PASS, '무기를 든 소년', M_.armor, 'slJon', -3.2, 1.6);
  V_(ZG, 'sl_saul14', MIGRON, '석류나무 아래의 사울', M_.saul, 'slMigron', 0, 2.2, { scale: TALL });
  L_(ZG, 'sl_honey', HONEY, '수풀 — 땅에 꿀이 있더라', 'slHoney');
  // 7장 기브아 → 길갈
  V_(ZG, 'sl_samuel15', SAM15, '사무엘', M_.samuel, 'slSam15', 1.6, 0);
  V_(ZG, 'sl_saul15', SAM15, '왕 사울', M_.saul, 'slSam15', -1.6, 0.6, { scale: TALL });
  L_(ZG, 'sl_night', NIGHT, '온 밤을 여호와께 부르짖으니라', 'slNight');
  V_(ZL, 'sl_samuel15g', GIL15, '사무엘', M_.samuel, 'slGil15', 1.6, 0);
  V_(ZL, 'sl_saul15g', GIL15, '왕 사울', M_.saul, 'slGil15', -1.6, 0.6, { scale: TALL });
  L_(ZL, 'sl_camp15', CAMP, '진영 — 들려오는 소리', 'slSound');
""")
rep("  DLG.sl_thunder_done.splice(1, 0, { event: 'thunder' });   // 12:18 우레와 비\n", """  DLG.sl_thunder_done.splice(1, 0, { event: 'thunder' });   // 12:18 우레와 비
  const afterRef = (d, ref) => { const i = d.findIndex(l => Array.isArray(l) && l[1].endsWith(`(삼상 ${ref})`)); if (i < 0) throw new Error(ref); return i + 1; };
  DLG.sl_climb_done.splice(afterRef(DLG.sl_climb_done, '14:15'), 0, { event: 'dust14' });   // 14:15-16 — 싸움은 먼지만 멀리
  DLG.sl_obey_done.splice(afterRef(DLG.sl_obey_done, '15:27'), 0, { event: 'tear' });       // 15:27 겉옷자락이 찢어진지라
""")
rep("baggage: { ico: '🧳', name: '짐보따리 사이를 본 사람' } });", "baggage: { ico: '🧳', name: '짐보따리 사이를 본 사람' }, seven_days: { ico: '⏳', name: '이레를 지켜본 사람' }, climbed_two: { ico: '🧗', name: '바위를 기어오른 둘' } });")
rep("  // ── 연출 ──\n", r"""  // ⏳ 이레(삼상 13:8-9) — 날이 갈수록 백성이 흩어진다. 번제 버튼은 언제든 누를 수 있고, 어느 쪽이든 본문은 13:9대로 이어진다(실패 처리 없음)
  function waitGame(q){
    api.runDialog(DLG.sl_wait, () => {
      const DAY = 15000, DAYS = 7, FROM = 3000, TO = 600; let t0 = performance.now(), timer = null, end = '';   // 3000(13:2) → 육백 명 가량(13:15)
      mgOpen('⏳ 길갈에서 이레', '"사울은 사무엘이 정한 기한대로 이레 동안을 기다렸으나" (삼상 13:8)');
      const k = () => Math.min(1, (performance.now() - t0) / (DAY * DAYS));
      const draw = () => { const x = k(), day = Math.min(DAYS, Math.floor(x * DAYS) + 1), n = Math.round((FROM - (FROM - TO) * x) / 10) * 10;
        api.mgArea.innerHTML = end ? doneBox(end)
          : `<div style="text-align:center;font-size:15px;font-weight:800;padding:6px">${day}일째 / 이레</div><div style="margin:4px 14px;height:14px;border-radius:7px;background:rgba(255,255,255,.12);overflow:hidden"><div style="height:100%;width:${Math.round(x * 100)}%;background:#d9b36a"></div></div>`
            + `<div style="text-align:center;font-size:13px;padding:6px">사울과 함께 있는 백성 — 약 ${n.toLocaleString()}명</div><div style="text-align:center;font-size:18px;letter-spacing:1px;min-height:28px">${'🧍'.repeat(Math.max(1, Math.round(10 * n / FROM)))}</div>`
            + `<div style="padding:8px 14px"><button data-wt="1" style="${btnCss};width:100%;font-size:14px">🔥 "번제와 화목제물을 이리로 가져오라" (13:9)</button></div>`;
        api.mgAct.textContent = end ? '계속' : '이레를 지켜보는 중…'; api.mgAct.disabled = !end; };
      const stop = () => { if (timer){ clearInterval(timer); timer = null; } };
      timer = setInterval(() => { if (end) return; if (k() >= 1){ stop(); giveBadge('seven_days'); end = '✓ 이레를 다 지켜보았어요<br>이제 본문을 읽어요 (삼상 13:8-14)'; } draw(); }, 400);
      draw();
      api.mgArea.onclick = e => { if (end || !e.target.closest('[data-wt]')) return; stop(); end = `"${LINE['13:9']}" (삼상 13:9)`; draw(); };
      api.mgAct.onclick = () => { if (!end) return; stop(); api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
      api.mg.onClose = () => { stop(); api.mgArea.onclick = null; };
    }, null, 'sl_wait');
  }
  // 🧗 손 발로 기어 올라갔고(삼상 14:13) — 요나단이 바위를 오르면 소년이 따라와야 다음 바위가 열린다. 치는 장면은 게임에 없다
  function climbGame(q){
    api.runDialog(DLG.sl_climb, () => {
      const H = 6, COLS = 3; let holds = [], jon = 0, boy = 0, life = LIVES, msg = '', perfect = true;
      const roll = () => { holds = [...Array(H)].map(() => Math.floor(Math.random() * COLS)); jon = 0; boy = 0; };
      const done = () => jon >= H && boy >= H;
      mgOpen('🧗 믹마스 어귀의 바위', '"요나단이 손 발로 기어 올라갔고 그 무기를 든 자도 따랐더라" (삼상 14:13) — ✨ 바위를 누르고, 👦 소년이 따라오게 해요.');
      const draw = () => {
        if (done()){ api.mgArea.innerHTML = doneBox('✓ "요나단이 손 발로 기어 올라갔고 그 무기를 든 자도 따랐더라" (삼상 14:13)'); api.mgAct.textContent = '계속'; api.mgAct.disabled = false; return; }
        const rows = []; for (let r = H - 1; r >= 0; r--){ rows.push(`<div style="display:grid;grid-template-columns:repeat(${COLS},1fr);gap:4px">${[...Array(COLS)].map((_, c) => { const isHold = holds[r] === c, next = isHold && r === jon && boy === jon;
          const who = (isHold && jon === r + 1 ? '🧗' : '') + (isHold && boy === r + 1 ? '👦' : '');
          return `<button ${next ? `data-cb="${r}"` : 'data-cx="1"'} style="${btnCss};padding:3px 0;font-size:15px;min-height:30px;${next ? 'background:rgba(255,210,122,.35);border-color:#ffd27a' : isHold ? '' : 'opacity:.25'}">${who || (next ? '✨' : isHold ? '🪨' : '')}</button>`; }).join('')}</div>`); }
        api.mgArea.innerHTML = `<div style="display:grid;gap:4px;padding:4px 14px">${rows.join('')}</div><div style="padding:6px 14px"><button data-cf="1" style="${btnCss};width:100%;font-size:14px;${boy < jon ? 'background:rgba(154,180,224,.3);border-color:#9ab4e0' : 'opacity:.5'}">👦 소년이 따라오기</button></div>` + msgBox(msg || `${jon} / ${H} · ${hearts(life)}`);
        api.mgAct.textContent = '둘 다 오르면 계속'; api.mgAct.disabled = true; };
      roll(); draw();
      const miss = m => { perfect = false; if (--life <= 0){ life = LIVES; roll(); msg = OUT; } else msg = `${m} ${hearts(life)}`; };
      api.mgArea.onclick = e => { if (done()) return;
        if (e.target.closest('[data-cf]')){ if (boy < jon){ boy++; msg = ''; } else miss('먼저 요나단이 바위를 올라요'); draw(); return; }
        if (e.target.closest('[data-cb]')){ jon++; msg = ''; draw(); return; }
        if (e.target.closest('[data-cx]') && boy < jon){ miss('"그 무기를 든 자도 따랐더라" — 소년이 아직 아래에 있어요'); draw(); } };
      api.mgAct.onclick = () => { if (!done()) return; api.mgArea.onclick = null; mgCloseAll(); if (perfect) giveBadge('climbed_two'); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; };
    }, null, 'sl_climb');
  }
  // 🔊 양의 소리와 소의 소리(삼상 15:14) — 칸을 누르면 소리가 얼마나 가까운지 보여 준다. 두 곳을 모두 찾으면 계속
  function soundGame(q){
    api.runDialog(DLG.sl_sound, () => {
      const R = 4, C = 4, N = R * C; const pos = shuffle([...Array(N).keys()]).slice(0, 2), names = ['🐑', '🐂']; const opened = new Map(), got = new Set(); let msg = '';
      const dist = (a, b) => Math.abs((a % C) - (b % C)) + Math.abs(Math.floor(a / C) - Math.floor(b / C));
      const near = i => Math.min(...pos.filter((p, k) => !got.has(k)).map(p => dist(i, p)));
      const bar = d => d <= 1 ? '🔊🔊🔊' : d === 2 ? '🔊🔊' : '🔉';
      const done = () => got.size >= 2;
      mgOpen('🔊 내 귀에 들려오는 소리', '"이 양의 소리와 내게 들리는 소의 소리는 어찌 됨이니이까" (삼상 15:14) — 진영을 눌러 🔊가 많은 쪽으로 찾아가요.');
      const draw = () => {
        api.mgArea.innerHTML = done() ? doneBox(`✓ "${LINE['15:14']}" (삼상 15:14)`)
          : `<div style="display:grid;grid-template-columns:repeat(${C},1fr);gap:5px;padding:6px 12px">${[...Array(N).keys()].map(i => { const k = pos.indexOf(i); const v = k >= 0 && got.has(k) ? names[k] : opened.has(i) ? opened.get(i) : '⛺'; return `<button data-sd="${i}" style="${btnCss};font-size:${opened.has(i) ? 12 : 18}px;min-height:38px;padding:4px 0">${v}</button>`; }).join('')}</div>` + msgBox(msg || `찾은 소리 ${got.size} / 2`);
        api.mgAct.textContent = done() ? '계속' : '두 소리를 찾으면 계속'; api.mgAct.disabled = !done(); };
      draw();
      api.mgArea.onclick = e => { const b = e.target.closest('[data-sd]'); if (!b || done()) return; const i = +b.dataset.sd, k = pos.indexOf(i);
        if (k >= 0 && !got.has(k)){ got.add(k); opened.delete(i); msg = k === 0 ? '🐑 양의 소리예요!' : '🐂 소의 소리예요!'; if (!done()) opened.forEach((_, j) => opened.set(j, bar(near(j)))); }
        else if (k < 0){ opened.set(i, bar(near(i))); msg = ''; }
        draw(); };
      api.mgAct.onclick = () => { if (!done()) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; };
    }, null, 'sl_sound');
  }
  // 📖 삼상 15:22 — 사무엘의 대답을 차례대로
  function obeyGame(q){ api.runDialog(DLG.sl_obey, () => orderPlay(q, '📖 사무엘의 대답', '"사무엘이 이르되" (삼상 15:22) — 차례대로 놓아요.', OBEY.map(t => [t, '']), '삼상 15:22를 다시 떠올려 봐요', '✓ 삼상 15:22'), null, 'sl_obey'); }

  // ── 연출 ──
""")
rep("  function thunder(){", "  function dustFar(){ dust14 = true; refresh('gibeah'); }\n  function tear(){ flash('#d8c4a0', 0.4); }\n  function thunder(){")
rep("      if (oilShow || (p.ch === 1 && p.step >= 6)) sprites(EDGE[0] - 1.6, EDGE[1], 3, 0xffe2a0, 0.35, 1.2, 1.2, 2.4, 1);\n", """      if (oilShow || (p.ch === 1 && p.step >= 6)) sprites(EDGE[0] - 1.6, EDGE[1], 3, 0xffe2a0, 0.35, 1.2, 1.2, 2.4, 1);
      if (p.ch === 5){
        needProps(['env-rock-hill', 'env-acacia', 'tent-small', 'honeycomb'], 'gibeah');
        prop('env-rock-hill', BOSES[0], BOSES[1], 0.4); prop('env-rock-hill', SENEH[0], SENEH[1], 2.1); obst(BOSES[0], BOSES[1], 3); obst(SENEH[0], SENEH[1], 3);   // 보세스와 세네(14:4)
        if (!dust14 && p.step <= 2){ prop('tent-small', PHIL[0], PHIL[1], 1); prop('tent-small', PHIL[0] - 4, PHIL[1] + 3, 2.2); }   // 블레셋 사람들의 부대(14:1)
        if (dust14 || p.step >= 3) sprites(PHIL[0], PHIL[1], 8, 0xb8a890, 0.42, 4, 3, 2, 10);   // 14:15-16 — 먼지만 멀리
        prop('env-acacia', MIGRON[0] - 2.4, MIGRON[1] - 1.6, 0.8);   // 미그론의 석류나무(14:2)
        if (p.step === 4){ if (api.propTemplates.honeycomb) prop('honeycomb', HONEY[0], HONEY[1], 0.5); else put(new THREE.BoxGeometry(0.7, 0.3, 0.5), M(0xe0a93a), HONEY[0], 0.15, HONEY[1]); }   // 땅에 꿀이 있더라(14:25)
      }
""")
rep("    api.zoneRoot.add(g); worldObj = g;\n", """    if (zid === 'gilgal' && (p.ch === 4 || p.ch === 6)){
      needProps(['tent-small', 'tent-mid', 'lamb', 'bull'], 'gilgal');
      [[-6, 10], [6, 12], [-14, 2], [18, 10]].forEach(([x, z], i) => prop(i % 2 ? 'tent-small' : 'tent-mid', x, z, i * 1.2));   // 길갈로 모인 백성(13:4)
      put(new THREE.BoxGeometry(1.8, 1.1, 1.8), M(0xb8a888), ALT13[0], 0.55, ALT13[1]); obst(ALT13[0], ALT13[1], 1.3);   // 번제단(13:9)
      if (p.ch === 6){ prop('lamb', CAMP[0] - 2, CAMP[1] + 1, 0.4); prop('lamb', CAMP[0] - 3, CAMP[1] - 1, 1.6); prop('bull', CAMP[0] + 2.4, CAMP[1], 0.8); }   // 끌어 온 양과 소(15:15)
    }
    api.zoneRoot.add(g); worldObj = g;
""")
rep("clearTitle: '🎉 7편 1부 「사울 왕」을 마쳤어요! 2부는 준비하고 있어요', next: '5장: 이레를 기다렸으나 (준비 중)',", "clearTitle: '🎉 7편 1부 「사울 왕」을 마쳤어요!', next: '5장: 이레를 기다렸으나',")
rep("reward: { verse: ['1sa12-23', '1sa12-24'], clear: true } },\n        ] },\n", """reward: { verse: ['1sa12-23', '1sa12-24'], clear: true } },
        ] },
      { title: `${T(5)} — 이레를 기다렸으나`, clearTitle: '🎉 7편 5장 「이레를 기다렸으나」 완료!', next: '6장: 요나단과 무기 든 소년',
        steps: [
          { id: 's5s1', zone: 'gilgal', obj: '믹마스에 모인 블레셋 사람들', where: '길갈 진영(빛나는 곳)', point: 'sl_mich', dlg: 'sl_mich' },
          { id: 's5s2', zone: 'gilgal', obj: '이레 동안을 기다렸으나', where: '길갈의 번제단(빛나는 곳)', point: 'sl_altar13', game: 'wait', doneDlg: 'sl_wait_done' },
          { id: 's5s3', zone: 'gibeah', obj: '이스라엘 온 땅에 철공이 없었으니', where: '기브아 동쪽 길(빛나는 곳)', point: 'sl_smith', dlg: 'sl_smith', reward: { verse: '1sa13-14', clear: true } },
        ] },
      { title: `${T(6)} — 요나단과 무기 든 소년`, clearTitle: '🎉 7편 6장 「요나단과 무기 든 소년」 완료!', next: '7장: 순종이 제사보다 낫고',
        steps: [
          { id: 's6s1', zone: 'gibeah', obj: '보세스와 세네', where: '동남쪽 믹마스 어귀(빛나는 곳)', point: 'sl_pass', dlg: 'sl_pass' },
          { id: 's6s2', zone: 'gibeah', obj: '"사람이 많고 적음에 달리지 아니하였느니라"', where: '두 바위 곁의 요나단', npc: 'sl_jonathan', dlg: 'sl_jon' },
          { id: 's6s3', zone: 'gibeah', obj: '손 발로 기어 올라갔고', where: '두 바위 곁의 요나단', npc: 'sl_jonathan', game: 'climb', doneDlg: 'sl_climb_done' },
          { id: 's6s4', zone: 'gibeah', obj: '누가 나갔는지 점호하여 보라', where: '석류나무 아래의 사울', npc: 'sl_saul14', dlg: 'sl_saul14' },
          { id: 's6s5', zone: 'gibeah', obj: '땅에 꿀이 있더라', where: '남쪽 수풀(빛나는 곳)', point: 'sl_honey', dlg: 'sl_honey' },
          { id: 's6s6', zone: 'gibeah', obj: '백성이 요나단을 구원하여', where: '석류나무 아래의 사울', npc: 'sl_saul14', dlg: 'sl_lots', reward: { verse: '1sa14-6', clear: true } },
        ] },
      { title: `${T(7)} — 순종이 제사보다 낫고`, clearTitle: '🎉 7편 2부 「버림받은 왕」을 마쳤어요! 3부는 준비하고 있어요', next: '8장: 사람은 외모를 보거니와 (준비 중)',
        steps: [
          { id: 's7s1', zone: 'gibeah', obj: '"이제 왕은 여호와의 말씀을 들으소서"', where: '기브아 기스의 집 곁의 사무엘', npc: 'sl_samuel15', dlg: 'sl_amalek' },
          { id: 's7s2', zone: 'gibeah', obj: '내가 사울을 왕으로 세운 것을 후회하노니', where: '기브아 북쪽(빛나는 곳)', point: 'sl_night', dlg: 'sl_regret' },
          { id: 's7s3', zone: 'gilgal', obj: '"내가 여호와의 명령을 행하였나이다"', where: '길갈의 사울', npc: 'sl_saul15g', dlg: 'sl_meet' },
          { id: 's7s4', zone: 'gilgal', obj: '이 양의 소리와 소의 소리', where: '길갈 진영(빛나는 곳)', point: 'sl_camp15', game: 'sound', doneDlg: 'sl_sound_done' },
          { id: 's7s5', zone: 'gilgal', obj: '순종이 제사보다 낫고', where: '길갈의 사무엘', npc: 'sl_samuel15g', game: 'obey', doneDlg: 'sl_obey_done', reward: { verse: '1sa15-22', clear: true } },
        ] },
""")
rep("remember: rememberGame, thunder: thunderGame },", "remember: rememberGame, thunder: thunderGame, wait: waitGame, climb: climbGame, sound: soundGame, obey: obeyGame },")
rep("events: { anoint, dust, thunder },", "events: { anoint, dust, thunder, dust14: dustFar, tear },")
open('saul7_src.js', 'w', encoding='utf-8', newline='\n').write(s)
d = open('dump7.mjs', encoding='utf-8').read()
a = "for (let c = 8; c <= 12; c++)"
assert d.count(a) == 1
d = d.replace(a, "for (let c = 8; c <= 15; c++)")
open('dump7.mjs', 'w', encoding='utf-8').write(d)
print('patched')
