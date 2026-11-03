
  // ── 2부 미니게임 ──
  // 🐑 양털 표징 두 번(삿 6:36-40) — 밤마다 기드온이 구한 대로 아침의 이슬 자리를 고르고, 첫 아침엔 양털에서 이슬을 짠다
  function fleeceGame(q){
    api.runDialog(DLG.jg_fleece, () => {
      let night = 1, phase = 'ask', squeeze = 0, life = LIVES, msg = '', perfect = true;
      const ASK = { 1: ['양털에만 이슬, 주변 땅은 마름', '"만일 이슬이 양털에만 있고 주변 땅은 마르면" (6:37)'], 2: ['양털만 마르고 주변 땅에는 이슬', '"원하건대 양털만 마르고 그 주변 땅에는 다 이슬이 있게 하옵소서" (6:39)'] };
      const OPTS = ['양털에만 이슬, 주변 땅은 마름', '양털만 마르고 주변 땅에는 이슬', '양털도 땅도 다 젖음'];
      mgOpen('🐑 양털 한 뭉치', '타작마당에 양털을 두었어요. 기드온이 구한 그대로 — 아침에 이슬이 어디에 있을까요?');
      const draw = () => {
        if (phase === 'ask') api.mgArea.innerHTML = `<div style="text-align:center;padding:8px;font-size:14px;font-weight:800">🌙 ${night === 1 ? '첫째' : '둘째'} 밤이 지나고 아침 — 기드온이 구한 것은?</div><div style="display:grid;gap:6px;padding:4px 12px">${OPTS.map((o, i) => `<button data-fl="${i}" style="${btnCss};font-size:13.5px">${o}</button>`).join('')}</div>` + msgBox(msg || hearts(life));
        else if (phase === 'squeeze') api.mgArea.innerHTML = `<div style="text-align:center;padding:8px;font-size:13px">"기드온이 일찍이 일어나서 양털을 가져다가 그 양털에서 이슬을 짜니 물이 그릇에 가득하더라" (6:38)</div><div style="text-align:center;font-size:26px;padding:4px">🥣 ${'💧'.repeat(squeeze)}${'▫️'.repeat(5 - squeeze)}</div><div style="padding:4px 12px"><button data-fl="sq" style="${btnCss};width:100%;font-size:15px">🐑 양털 짜기</button></div>` + msgBox(msg);
        else api.mgArea.innerHTML = `<div style="padding:16px;text-align:center;color:#ffd27a;font-weight:800">✓ "그 밤에 하나님이 그대로 행하시니" (6:40)</div>`;
        api.mgAct.textContent = phase === 'done' ? '계속' : '두 밤이 지나면 계속'; api.mgAct.disabled = phase !== 'done'; };
      draw();
      api.mgArea.onclick = e => { const b = e.target.closest('[data-fl]'); if (!b) return; const k = b.dataset.fl;
        if (phase === 'ask'){
          if (OPTS[+k] === ASK[night][0]){ msg = ''; if (night === 1){ phase = 'squeeze'; } else phase = 'done'; }
          else { perfect = false; if (--life <= 0){ night = 1; life = LIVES; msg = OUT; } else msg = `${ASK[night][1]} ${hearts(life)}`; }
        } else if (phase === 'squeeze' && k === 'sq'){ squeeze++; if (squeeze >= 5){ phase = 'ask'; night = 2; msg = '그릇에 가득해요. 둘째 밤에는?'; } }
        draw(); };
      api.mgAct.onclick = () => { if (phase !== 'done') return; api.mgArea.onclick = null; mgCloseAll(); if (perfect) giveBadge('fleece_twice'); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; };
    }, null, 'jg_fleece');
  }
  // 💧 물 가에서(삿 7:5-7) — 마시는 모습을 보고 따로 세운다: 핥은 자는 기드온과 함께, 무릎을 꿇고 마신 자는 처소로
  function lapGame(q){
    api.runDialog(DLG.jg_lap, () => {
      const CARDS = [...Array(12).keys()].map(i => i % 4 === 0 ? ['👅 손으로 움켜 입에 대고 핥아요', 'go'] : ['🧎 무릎을 꿇고 물을 마셔요', 'home']).sort(() => Math.random() - 0.5);
      let i = 0, msg = '', life = LIVES;
      mgOpen('💧 물 가에서', '"누구든지 개가 핥는 것 같이 혀로 물을 핥는 자들을 너는 따로 세우고 또 누구든지 무릎을 꿇고 마시는 자들도 그와 같이 하라" (삿 7:5)');
      const draw = () => { const c = CARDS[i];
        api.mgArea.innerHTML = c ? `<div style="text-align:center;padding:12px 8px 8px;font-size:16px;font-weight:800">${c[0]}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:0 12px"><button data-lp="go" style="${btnCss};font-size:13.5px">🛡 기드온과 함께</button><button data-lp="home" style="${btnCss};font-size:13.5px">🏠 자기 처소로</button></div>` + msgBox(msg || `${i + 1} / ${CARDS.length} · ${hearts(life)}`)
          : `<div style="padding:16px;text-align:center;color:#ffd27a;font-weight:800">✓ "물을 핥아 먹은 삼백 명으로 너희를 구원하며" (7:7)</div>`;
        api.mgAct.textContent = c ? '다 세우면 계속' : '계속'; api.mgAct.disabled = !!c; };
      draw();
      api.mgArea.onclick = e => { const b = e.target.closest('[data-lp]'); const c = CARDS[i]; if (!b || !c) return;
        if (b.dataset.lp === c[1]){ i++; msg = ''; } else if (--life <= 0){ i = 0; life = LIVES; CARDS.sort(() => Math.random() - 0.5); msg = OUT; } else msg = `삿 7:6-7을 다시 읽어 봐요 ${hearts(life)}`; draw(); };
      api.mgAct.onclick = () => { if (CARDS[i]) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; };
    }, null, 'jg_lap');
  }
  // 🏺 세 대가(삿 7:20) — 나팔을 불며 → 항아리를 부수고 → 횃불을 들고 → 외치기. 세 대가 차례대로, 칼을 드는 조작은 없다(7:21 "각기 제자리에 서서")
  function torchGame(q){
    api.runDialog(DLG.jg_torch, () => {
      const SEQ = [['🎺', '나팔을 불며'], ['🏺', '항아리를 부수고'], ['🔥', '횃불을 들고'], ['🗣', '"여호와와 기드온의 칼이다"']];
      let band = 0, k = 0, life = LIVES, msg = '', perfect = true, order = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
      mgOpen('🏺 항아리와 횃불', '"세 대가 나팔을 불며 항아리를 부수고 왼손에 횃불을 들고 오른손에 나팔을 들어 불며 외쳐 이르되 여호와와 기드온의 칼이다" (삿 7:20) — 세 대가 차례대로!');
      const draw = () => {
        api.mgArea.innerHTML = band < 3 ? `<div style="text-align:center;font-size:13px;padding:4px">${['첫째', '둘째', '셋째'][band]} 대 · ${SEQ.slice(0, k).map(s => s[0]).join(' ') || '…'} · ${hearts(life)}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:6px 10px">${order.map(i => `<button data-tc="${i}" style="${btnCss};font-size:13px;padding:12px 4px">${SEQ[i][0]} ${SEQ[i][1]}</button>`).join('')}</div>` + msgBox(msg)
          : `<div style="padding:16px;text-align:center;color:#ffd27a;font-weight:800">✓ "각기 제자리에 서서 그 진영을 에워싸매" (7:21)</div>`;
        api.mgAct.textContent = band < 3 ? '세 대가 다 하면 계속' : '계속'; api.mgAct.disabled = band < 3; };
      draw();
      api.mgArea.onclick = e => { const b = e.target.closest('[data-tc]'); if (!b || band >= 3) return;
        if (+b.dataset.tc === k){ k++; msg = ''; if (k >= 4){ k = 0; band++; order = [0, 1, 2, 3].sort(() => Math.random() - 0.5); msg = band < 3 ? '다음 대!' : ''; } }
        else { perfect = false; if (--life <= 0){ band = 0; k = 0; life = LIVES; msg = OUT; } else msg = `7:20의 차례를 다시 봐요 ${hearts(life)}`; }
        draw(); };
      api.mgAct.onclick = () => { if (band < 3) return; api.mgArea.onclick = null; mgCloseAll(); if (perfect) giveBadge('jar_torch'); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; };
    }, null, 'jg_torch');
  }
  // 🗺 입다가 암몬 왕에게 한 말(삿 11:16-22) — 이스라엘이 걸어온 길(3편에서 걸었던 길)을 차례대로
  function routeGame(q){
    api.runDialog(DLG.jg_king, () => orderPlay(q, '🗺 이스라엘이 걸어온 길', '입다의 사자들이 전한 말(삿 11:16-22) — 이스라엘이 애굽에서 올라와 걸어온 길을 차례대로 놓아요.', [
      ['🌊 홍해에 이름', '(11:16)'], ['🏕 가데스에 이름', '(11:16)'], ['✉ 에돔 왕에게 사자를 보냄', '(11:17)'], ['↪ 에돔과 모압 땅을 돌아감', '(11:18)'],
      ['⛺ 아르논 저쪽에 진을 침', '(11:18)'], ['✉ 시혼에게 사자를 보냄', '(11:19)'], ['🏞 아르논에서 얍복까지 점령', '(11:22)'],
    ], '삿 11장을 다시 떠올려 봐요', '✓ 이스라엘이 걸어온 길을 차례대로 놓았어요'), null, 'jg_king');
  }
  Object.assign(api.BADGES, { fleece_twice: { ico: '🐑', name: '이슬을 두 번 본 사람' }, jar_torch: { ico: '🏺', name: '항아리를 깨뜨린 삼백' } });
  function offerFire(){ offerShow = true; flash('#ffd9a0', 0.4); refresh('jezreel'); try { api.startCine('jgOffer', ROCK[0], api.heightAt(ROCK[0], ROCK[1]) + 1, ROCK[1], { r: 7, h: 3, dur: 4, spin: 0.4 }); } catch (e){} setTimeout(() => { offerShow = false; refresh('jezreel'); }, 6000); }
  function baalDown(){ baalShow = true; refresh('jezreel'); }
  function campRout(){ routShow = true; flash('#ffcf8a', 0.4); refresh('jezreel'); try { api.startCine('jgRout', CAMPM[0], api.heightAt(CAMPM[0], CAMPM[1]) + 3, CAMPM[1], { r: 18, h: 8, dur: 4.5, spin: 0.35 }); } catch (e){} }
