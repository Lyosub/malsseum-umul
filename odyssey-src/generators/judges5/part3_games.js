
  // ── 3·4부 미니게임 ──
  // 🍇 나실인(삿 13:4-5, 14) — 여호와의 사자가 "삼가라" 한 것은 본문에 있는 것만. 본문에 없는 규칙을 만들지 않는다
  function naziriteGame(q){
    api.runDialog(DLG.jg_nazirite, () => {
      const CARDS = [['🍷 포도주와 독주를 마시지 말라', 'yes'], ['🚫 어떤 부정한 것도 먹지 말라', 'yes'], ['✂ 머리 위에 삭도를 대지 말라', 'yes'], ['🍇 포도나무의 소산을 먹지 말라', 'yes'],
        ['🍞 떡을 먹지 말라', 'no'], ['🌙 밤에는 밖에 나가지 말라', 'no'], ['💧 물을 마시지 말라', 'no']].sort(() => Math.random() - 0.5);
      let i = 0, msg = '', life = LIVES;
      mgOpen('🍇 나실인', '"그의 머리 위에 삭도를 대지 말라 이 아이는 태에서 나옴으로부터 하나님께 바쳐진 나실인이 됨이라" (삿 13:5) — 여호와의 사자의 말에 있는 것일까요?');
      const draw = () => { const c = CARDS[i];
        api.mgArea.innerHTML = c ? `<div style="text-align:center;padding:12px 8px 8px;font-size:16px;font-weight:800">${c[0]}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:0 12px"><button data-nz="yes" style="${btnCss};font-size:13.5px">📜 본문에 있어요</button><button data-nz="no" style="${btnCss};font-size:13.5px">✖ 본문에 없어요</button></div>` + msgBox(msg || `${i + 1} / ${CARDS.length} · ${hearts(life)}`)
          : `<div style="padding:16px;text-align:center;color:#ffd27a;font-weight:800">✓ "내가 그에게 명령한 것은 다 지킬 것이니라" (13:14)</div>`;
        api.mgAct.textContent = c ? '다 가르면 계속' : '계속'; api.mgAct.disabled = !!c; };
      draw();
      api.mgArea.onclick = e => { const b = e.target.closest('[data-nz]'); const c = CARDS[i]; if (!b || !c) return;
        if (b.dataset.nz === c[1]){ i++; msg = ''; } else if (--life <= 0){ i = 0; life = LIVES; CARDS.sort(() => Math.random() - 0.5); msg = OUT; } else msg = `삿 13:4-5, 14를 다시 읽어 봐요 ${hearts(life)}`; draw(); };
      api.mgAct.onclick = () => { if (CARDS[i]) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; };
    }, null, 'jg_nazirite');
  }
  // 🍯 수수께끼(삿 14:14) — "먹는 자 · 먹는 것 · 강한 자 · 단 것"이 무엇인지, 포도원 길에서 본 것으로 짝짓기
  function riddleGame(q){
    api.runDialog(DLG.jg_feast, () => {
      const KEYS = [['먹는 자', '🦁'], ['먹는 것', '🍯'], ['강한 자', '🦁'], ['단 것', '🍯']], OPTS = [['🦁', '사자'], ['🍯', '꿀'], ['🐝', '벌 떼'], ['🍇', '포도'], ['🐐', '염소 새끼']];
      let k = 0, life = LIVES, msg = '', perfect = true;
      mgOpen('🍯 수수께끼', '"먹는 자에게서 먹는 것이 나오고 강한 자에게서 단 것이 나왔느니라" (삿 14:14) — 딤나의 포도원 길에서 본 것을 떠올려요.');
      const draw = () => {
        api.mgArea.innerHTML = k < KEYS.length ? `<div style="text-align:center;padding:10px;font-size:15px;font-weight:800">「${KEYS[k][0]}」는?</div><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:5px;padding:0 10px">${OPTS.map(o => `<button data-rd="${o[0]}" style="${btnCss};font-size:12px;padding:10px 2px">${o[0]}<br>${o[1]}</button>`).join('')}</div>` + msgBox(msg || hearts(life))
          : `<div style="padding:16px;text-align:center;color:#ffd27a;font-weight:800">✓ "무엇이 꿀보다 달겠으며 무엇이 사자보다 강하겠느냐" (14:18)</div>`;
        api.mgAct.textContent = k < KEYS.length ? '다 풀면 계속' : '계속'; api.mgAct.disabled = k < KEYS.length; };
      draw();
      api.mgArea.onclick = e => { const b = e.target.closest('[data-rd]'); if (!b || k >= KEYS.length) return;
        if (b.dataset.rd === KEYS[k][1]){ k++; msg = ''; } else { perfect = false; if (--life <= 0){ k = 0; life = LIVES; msg = OUT; } else msg = `삿 14:5-9를 떠올려 봐요 ${hearts(life)}`; }
        draw(); };
      api.mgAct.onclick = () => { if (k < KEYS.length) return; api.mgArea.onclick = null; mgCloseAll(); if (perfect) giveBadge('riddle'); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; };
    }, null, 'jg_feast');
  }
  // 🧵 세 번(삿 16:7, 11, 13) — 삼손이 들릴라에게 한 말을 차례대로 기억
  function liesGame(q){
    api.runDialog(DLG.jg_lies, () => orderPlay(q, '🧵 세 번의 말', '"당신이 이로써 세 번이나 나를 희롱하고" (삿 16:15) — 삼손이 들릴라에게 한 말을 차례대로 놓아요.', [
      ['🏹 마르지 아니한 새 활줄 일곱', '(16:7)'], ['🪢 쓰지 아니한 새 밧줄들', '(16:11)'], ['🧶 머리털 일곱 가닥을 베틀의 날실에', '(16:13)'],
    ], '삿 16장을 다시 떠올려 봐요', '✓ 세 번 모두 차례대로 기억했어요'), null, 'jg_lies');
  }
  // 🙏 마지막 기도(삿 16:28) — 기도 버튼을 누른 채 기다린다(손을 떼면 처음부터)
  function prayGame(q){
    api.runDialog(DLG.jg_pray, () => {
      const NEED = 3500; let t0 = 0, timer = null, done = false, msg = '';
      mgOpen('🙏 이번만', '"주 여호와여 구하옵나니 나를 생각하옵소서" (삿 16:28) — 🙏를 누른 채로 기도해요. 중간에 손을 떼면 처음부터.');
      const draw = () => { const k = t0 ? Math.min(1, (performance.now() - t0) / NEED) : 0;
        api.mgArea.innerHTML = done ? `<div style="padding:16px;text-align:center;color:#ffd27a;font-weight:800">✓ "하나님이여 구하옵나니 이번만 나를 강하게 하사"</div>`
          : `<div style="margin:14px;height:14px;border-radius:7px;background:rgba(255,255,255,.12);overflow:hidden"><div style="height:100%;width:${Math.round(k * 100)}%;background:#ffd27a"></div></div><div style="padding:0 14px"><button data-pr="1" style="${btnCss};width:100%;font-size:22px;padding:14px;touch-action:none">🙏</button></div>` + msgBox(msg);
        api.mgAct.textContent = done ? '계속' : '기도를 마치면 계속'; api.mgAct.disabled = !done; };
      const tick = () => { if (!t0 || done) return; if (performance.now() - t0 >= NEED){ done = true; t0 = 0; draw(); return; } draw(); timer = requestAnimationFrame(tick); };
      const down = e => { if (!e.target.closest('[data-pr]') || done) return; e.preventDefault(); t0 = performance.now(); msg = ''; tick(); };
      const up = () => { if (!t0 || done) return; t0 = 0; cancelAnimationFrame(timer); msg = '손을 떼었어요 — 처음부터 다시'; draw(); };
      draw();
      api.mgArea.addEventListener('pointerdown', down); window.addEventListener('pointerup', up);
      const cleanup = () => { api.mgArea.removeEventListener('pointerdown', down); window.removeEventListener('pointerup', up); cancelAnimationFrame(timer); };
      api.mgAct.onclick = () => { if (!done) return; cleanup(); mgCloseAll(); giveBadge('last_prayer'); completeTask(q); };
      api.mg.onClose = cleanup;
    }, null, 'jg_pray');
  }
  // 🏘 미가의 은에서 단 성읍까지(삿 17–18장) — 일어난 차례대로
  function danGame(q){
    api.runDialog(DLG.jg_micah2, () => orderPlay(q, '🏘 미가의 집에서 단까지', '"그 때에는 이스라엘에 왕이 없었으므로 사람마다 자기 소견에 옳은 대로 행하였더라" (삿 17:6) — 일어난 차례대로 놓아요.', [
      ['💰 은 천백을 어머니에게 도로 줌', '(17:3)'], ['🏠 미가의 집에 신당을 둠', '(17:5)'], ['👦 레위 청년이 미가의 제사장이 됨', '(17:12)'], ['🔭 단 지파 다섯 사람이 땅을 정탐함', '(18:2)'],
      ['👥 육백 명이 미가의 집에 이름', '(18:13)'], ['🚶 제사장이 그들과 함께 감', '(18:20)'], ['🏙 성읍 이름을 단이라 함', '(18:29)'],
    ], '삿 17–18장을 다시 떠올려 봐요', '✓ 차례대로 놓았어요'), null, 'jg_micah2');
  }
  // 🧩 사사 열두 명(5편 마무리) — 사사기에 나온 차례대로. 다 놓아도 "왕이 없으므로"(21:25)로 끝난다
  function judgesGame(q){
    api.runDialog(DLG.jg_end, () => orderPlay(q, '🧩 사사 열두 명', '"여호와께서 사사들을 세우사 노략자의 손에서 그들을 구원하게 하셨으나" (삿 2:16) — 5편에서 만난 사사들을 나온 차례대로 놓아요.', [
      ['옷니엘', '(3:9)'], ['에훗', '(3:15)'], ['삼갈', '(3:31)'], ['드보라', '(4:4)'], ['기드온', '(6:11)'], ['돌라', '(10:1)'], ['야일', '(10:3)'], ['입다', '(11:1)'], ['입산', '(12:8)'], ['엘론', '(12:11)'], ['압돈', '(12:13)'], ['삼손', '(13:24)'],
    ], '사사기의 차례를 다시 떠올려 봐요', '✓ 열두 사사를 차례대로 놓았어요', perfect => { if (perfect) giveBadge('twelve_judges'); }), null, 'jg_end');
  }
  Object.assign(api.BADGES, { riddle: { ico: '🍯', name: '수수께끼를 푼 사람' }, last_prayer: { ico: '🙏', name: '"이번만" 기도한 사람' }, twelve_judges: { ico: '🧩', name: '열두 사사를 기억한 사람' } });
  function flameUp(){ flameShow = true; flash('#ffd9a0', 0.4); refresh('philistia'); try { api.startCine('jgFlame', ALTAR13[0], api.heightAt(ALTAR13[0], ALTAR13[1]) + 2, ALTAR13[1], { r: 7, h: 4, dur: 4, spin: 0.4 }); } catch (e){} setTimeout(() => { flameShow = false; refresh('philistia'); }, 6000); }
  function gateCarry(){ gateGone = true; refresh('philistia'); }
  function templeFall(){ templeDown = true; flash('#e8dcc4', 0.55); refresh('philistia'); try { api.startCine('jgTemple', TEMPLE[0], api.heightAt(TEMPLE[0], TEMPLE[1]) + 3, TEMPLE[1], { r: 14, h: 6, dur: 4.5, spin: 0.3 }); } catch (e){} }
  function smokeUp(){ smokeShow = true; refresh('gibeon'); try { api.startCine('jgSmoke', GIBEAH[0], api.heightAt(GIBEAH[0], GIBEAH[1]) + 6, GIBEAH[1], { r: 22, h: 9, dur: 4.5, spin: 0.25 }); } catch (e){} }
