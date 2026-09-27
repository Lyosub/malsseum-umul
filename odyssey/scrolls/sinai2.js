// 2편 「시내산의 마지막 한 달」 — 레위기 + 민수기 1–10장. 지금은 1~4장(레 1–9장)까지.
// 대사 원칙: 성경 인물은 개역개정에 있는 자기 말만, 해설은 원문 + (출처). 2026-09-27 bskorea 원문 대조.
// 새 인물 이미지(제사장 넷·대제사장 아론·수소·염소)는 GPT 9차 요청 중 — 오기 전까지 이미 있는 모델을 씀.
(window.__odyQ = window.__odyQ || []).push(api => {
  const { DLG, ZONES, CONDS, VERSES, THREE, SPEAKERS: { NAR, MOSES } } = api;
  const PEOPLE = { n: '백성' };
  const cur = () => api.ST.cur === 'sinai2' && api.ST.sp.sinai2 ? api.ST.sp.sinai2 : null;
  const DOOR = [13.4, -15], ALTAR = [8.2, -15], BRONZE = [6, -15];   // 뜰 문(동쪽) · 번제단 앞자리 · 번제단(성막 T.x1+6)
  CONDS.lvPriests = () => { const p = cur(); return !!p && p.ch >= 2; };   // 3장(위임식)부터 — "아론과 그의 아들들과 함께"(레 8:2)
  CONDS.lvOn = () => !!cur();
  ZONES.sinai.points.push({ id: 'lv_door', x: DOOR[0], z: DOOR[1], type: 'lore', title: '회막 문', cond: 'lvOn', body: '' });
  ZONES.sinai.points.push({ id: 'lv_altar', x: ALTAR[0], z: ALTAR[1], type: 'lore', title: '번제단', cond: 'lvOn', body: '' });
  // 아론의 아들들(레 8:13) — 새 모델이 오기 전까지 레위인 모델
  ZONES.sinai.points.push({ id: 'lv_nadab', x: 15.8, z: -11.6, type: 'villager', title: '나답', model: 'he-levite', persona: 'rs_static', cond: 'lvPriests', body: '' });
  ZONES.sinai.points.push({ id: 'lv_abihu', x: 16.6, z: -13, type: 'villager', title: '아비후', model: 'he-levite', persona: 'rs_static', cond: 'lvPriests', body: '' });
  ZONES.sinai.points.push({ id: 'lv_eleazar', x: 16.6, z: -17, type: 'villager', title: '엘르아살', model: 'he-levite', persona: 'rs_static', cond: 'lvPriests', body: '' });
  ZONES.sinai.points.push({ id: 'lv_ithamar', x: 15.8, z: -18.4, type: 'villager', title: '이다말', model: 'he-levite', persona: 'rs_static', cond: 'lvPriests', body: '' });

  Object.assign(VERSES, {
    'lv1-4': { ref: '레위기 1:4', text: '그는 번제물의 머리에 안수할지니 그를 위하여 기쁘게 받으심이 되어 그를 위하여 속죄가 될 것이라' },
    'lv7-37': { ref: '레위기 7:37', text: '이는 번제와 소제와 속죄제와 속건제와 위임식과 화목제의 규례라' },
    'lv8-36': { ref: '레위기 8:36', text: '아론과 그의 아들들이 여호와께서 모세를 통하여 명령하신 모든 일을 준행하니라' },
    'lv9-24': { ref: '레위기 9:24', text: '불이 여호와 앞에서 나와 제단 위의 번제물과 기름을 사른지라 온 백성이 이를 보고 소리 지르며 엎드렸더라' },
  });
  Object.assign(DLG, {
    // 1장
    lv_call: [
      [NAR, '여호와께서 회막에서 모세를 부르시고 그에게 말씀하여 이르시되 (레 1:1)'],
      [NAR, '이스라엘 자손에게 말하여 이르라 너희 중에 누구든지 여호와께 예물을 드리려거든 가축 중에서 소나 양으로 예물을 드릴지니라 (레 1:2)'],
      [NAR, '만일 그 예물이 가축 떼의 양이나 염소의 번제이면 흠 없는 수컷으로 드릴지니 (레 1:10)'],
      [NAR, '▶ 가축 떼 가운데에서 흠 없는 수컷을 골라요.'],
    ],
    lv_door: [
      [NAR, '그 예물이 소의 번제이면 흠 없는 수컷으로 회막 문에서 여호와 앞에 기쁘게 받으시도록 드릴지니라 (레 1:3)'],
      [NAR, '그는 번제물의 머리에 안수할지니 그를 위하여 기쁘게 받으심이 되어 그를 위하여 속죄가 될 것이라 (레 1:4)'],
    ],
    // 2장
    lv_offerings: [
      [NAR, '누구든지 소제의 예물을 여호와께 드리려거든 고운 가루로 예물을 삼아 그 위에 기름을 붓고 또 그 위에 유향을 놓아 (레 2:1)'],
      [NAR, '사람이 만일 화목제의 제물을 예물로 드리되 소로 드리려면 수컷이나 암컷이나 흠 없는 것으로 여호와 앞에 드릴지니 (레 3:1)'],
      [NAR, '만일 평민의 한 사람이 여호와의 계명 중 하나라도 부지중에 범하여 허물이 있었는데 (레 4:27)'],
      [NAR, '그가 범한 죄를 누가 그에게 깨우쳐 주면 그는 흠 없는 암염소를 끌고 와서 그 범한 죄로 말미암아 그것을 예물로 삼아 (레 4:28)'],
      [NAR, '그 모든 기름을 화목제물의 기름을 떼어낸 것 같이 떼어내 제단 위에서 불살라 여호와께 향기롭게 할지니 제사장이 그를 위하여 속죄한즉 그가 사함을 받으리라 (레 4:31)'],
      [NAR, '▶ 예물마다 어떤 제사인지 나눠 보세요.'],
    ],
    lv_laws: [
      [NAR, '이는 번제와 소제와 속죄제와 속건제와 위임식과 화목제의 규례라 (레 7:37)'],
      [NAR, '여호와께서 시내 광야에서 이스라엘 자손에게 그 예물을 여호와께 드리라 명령하신 날에 시내 산에서 이같이 모세에게 명령하셨더라 (레 7:38)'],
    ],
    // 3장
    lv_gather: [
      [NAR, '여호와께서 모세에게 말씀하여 이르시되 (레 8:1)'],
      [NAR, '너는 아론과 그의 아들들과 함께 그 의복과 관유와 속죄제의 수송아지와 숫양 두 마리와 무교병 한 광주리를 가지고 (레 8:2)'],
      [NAR, '온 회중을 회막 문에 모으라 (레 8:3)'],
      [NAR, '모세가 여호와께서 자기에게 명령하신 대로 하매 회중이 회막 문에 모인지라 (레 8:4)'],
      [NAR, '모세가 회중에게 이르되 (레 8:5)'],
      [MOSES, '여호와께서 행하라고 명령하신 것이 이러하니라'],
    ],
    lv_robe_intro: [
      [NAR, '모세가 아론과 그의 아들들을 데려다가 물로 그들을 씻기고 (레 8:6)'],
      [NAR, '▶ 아론에게 입힐 옷을 순서대로 골라요.'],
    ],
    lv_robe_done: [
      [NAR, '아론에게 속옷을 입히며 띠를 띠우고 겉옷을 입히며 에봇을 걸쳐 입히고 에봇의 장식 띠를 띠워서 에봇을 몸에 매고 (레 8:7)'],
      [NAR, '흉패를 붙이고 흉패에 우림과 둠밈을 넣고 (레 8:8)'],
      [NAR, '그의 머리에 관을 씌우고 그 관 위 전면에 금 패를 붙이니 곧 거룩한 관이라 여호와께서 모세에게 명령하신 것과 같았더라 (레 8:9)'],
      [NAR, '모세가 관유를 가져다가 성막과 그 안에 있는 모든 것에 발라 거룩하게 하고 (레 8:10)'],
      [NAR, '또 관유를 아론의 머리에 붓고 그에게 발라 거룩하게 하고 (레 8:12)'],
      [NAR, '모세가 또 아론의 아들들을 데려다가 그들에게 속옷을 입히고 띠를 띠우며 관을 씌웠으니 여호와께서 모세에게 명령하신 것과 같았더라 (레 8:13)'],
    ],
    lv_seven: [
      [MOSES, '위임식은 이레 동안 행하나니 위임식이 끝나는 날까지 이레 동안은 회막 문에 나가지 말라'],
      [MOSES, '오늘 행한 것은 여호와께서 너희를 위하여 속죄하게 하시려고 명령하신 것이니'],
      [MOSES, '너희는 칠 주야를 회막 문에 머물면서 여호와께서 지키라고 하신 것을 지키라 그리하면 사망을 면하리라 내가 이같이 명령을 받았느니라'],
    ],
    lv_seven_done: [
      [NAR, '아론과 그의 아들들이 여호와께서 모세를 통하여 명령하신 모든 일을 준행하니라 (레 8:36)'],
    ],
    // 4장
    lv_eighth: [
      [NAR, '여덟째 날에 모세가 아론과 그의 아들들과 이스라엘 장로들을 불러다가 (레 9:1)'],
      [NAR, '아론에게 이르되 (레 9:2)'],
      [MOSES, '속죄제를 위하여 흠 없는 송아지를 가져오고 번제를 위하여 흠 없는 숫양을 여호와 앞에 가져다 드리고'],
      [NAR, '모세가 이르되 (레 9:6)'],
      [MOSES, '이는 여호와께서 너희에게 하라고 명령하신 것이니 여호와의 영광이 너희에게 나타나리라'],
    ],
    lv_aaron_altar: [
      [NAR, '모세가 또 아론에게 이르되 (레 9:7)'],
      [MOSES, '너는 제단에 나아가 네 속죄제와 네 번제를 드려서 너를 위하여, 백성을 위하여 속죄하고 또 백성의 예물을 드려서 그들을 위하여 속죄하되 여호와의 명령대로 하라'],
      [NAR, '아론이 백성을 향하여 손을 들어 축복함으로 속죄제와 번제와 화목제를 마치고 내려오니라 (레 9:22)'],
      [NAR, '▶ 번제단 앞으로 가요.'],
    ],
    lv_fire: [
      [NAR, '모세와 아론이 회막에 들어갔다가 나와서 백성에게 축복하매 여호와의 영광이 온 백성에게 나타나며 (레 9:23)'],
      { event: 'lvFire' },
      [NAR, '불이 여호와 앞에서 나와 제단 위의 번제물과 기름을 사른지라 온 백성이 이를 보고 소리 지르며 엎드렸더라 (레 9:24)'],
    ],
  });

  const { mgOpen, mgCloseAll, completeTask } = api;
  const btnCss = 'padding:8px 6px;border-radius:10px;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.08);color:#f5e9d0;font-size:13px';
  // 🐑 흠 없는 수컷 고르기(레 1:10, 22:22)
  function pickGame(q){
    const opts = [['🐏', '흠 없는 숫양', true], ['🐑', '눈 먼 숫양'], ['🐐', '다리가 상한 숫염소'], ['🐑', '흠 없는 암양'], ['🐏', '종기 있는 숫양'], ['🐐', '지체에 베임을 당한 숫염소']].sort(() => Math.random() - 0.5);
    mgOpen('🐑 흠 없는 수컷', '"만일 그 예물이 가축 떼의 양이나 염소의 번제이면 흠 없는 수컷으로 드릴지니" (레 1:10)');
    let msg = '';
    const draw = () => { api.mgArea.innerHTML = `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;padding:8px">${opts.map((o, i) => `<button data-pk="${i}" style="${btnCss}"><span style="font-size:26px">${o[0]}</span><br>${o[1]}</button>`).join('')}</div><div style="text-align:center;color:#ffd27a;font-weight:800;min-height:18px;padding:0 8px;font-size:12.5px">${msg}</div>`; };
    draw(); api.mgAct.textContent = '고르면 계속'; api.mgAct.disabled = true;
    let ok = false;
    api.mgArea.onclick = e => { const b = e.target.closest('[data-pk]'); if (!b || ok) return; const o = opts[+b.dataset.pk];
      if (o[2]){ ok = true; msg = '✓ 흠 없는 수컷이에요'; api.mgAct.disabled = false; api.mgAct.textContent = '회막 문으로'; }
      else msg = '"흠 있는 것은 무엇이나 너희가 드리지 말 것은 그것이 기쁘게 받으심이 되지 못할 것임이니라" (레 22:20)';
      draw(); };
    api.mgAct.onclick = () => { if (!ok) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
    api.mg.onClose = () => { api.mgArea.onclick = null; };
  }
  // 🗂 예물 나누기(레 1–5장, 7:37)
  function sortGame(q){
    const KINDS = ['번제', '소제', '화목제', '속죄제', '속건제'];
    const CARDS = [
      ['흠 없는 수컷으로 회막 문에서 여호와 앞에 기쁘게 받으시도록 드릴지니라 (레 1:3)', '번제'],
      ['고운 가루로 예물을 삼아 그 위에 기름을 붓고 또 그 위에 유향을 놓아 (레 2:1)', '소제'],
      ['수컷이나 암컷이나 흠 없는 것으로 여호와 앞에 드릴지니 (레 3:1)', '화목제'],
      ['흠 없는 암염소를 끌고 와서 그 범한 죄로 말미암아 그것을 예물로 삼아 (레 4:28)', '속죄제'],
      ['성소의 세겔로 몇 세겔 은에 상당한 흠 없는 숫양을 양 떼 중에서 끌어다가 (레 5:15)', '속건제'],
    ].sort(() => Math.random() - 0.5);
    let i = 0, msg = '';
    mgOpen('🗂 여러 가지 예물', '예물 설명을 읽고 어떤 제사인지 골라요. "이는 번제와 소제와 속죄제와 속건제와 위임식과 화목제의 규례라" (레 7:37)');
    const draw = () => {
      api.mgArea.innerHTML = i < CARDS.length
        ? `<div style="padding:10px 12px;font-size:13.5px;line-height:1.5;min-height:60px">📜 ${CARDS[i][0]}</div><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:5px;padding:0 8px">${KINDS.map(k => `<button data-kd="${k}" style="${btnCss}">${k}</button>`).join('')}</div><div style="text-align:center;color:#ffd27a;font-weight:800;min-height:18px;margin-top:6px">${msg || `${i + 1} / ${CARDS.length}`}</div>`
        : `<div style="padding:16px;text-align:center;color:#ffd27a;font-weight:800">✓ 다섯 가지 예물을 모두 나눴어요</div>`;
      api.mgAct.textContent = i < CARDS.length ? '다 나누면 계속' : '계속'; api.mgAct.disabled = i < CARDS.length;
    };
    draw();
    api.mgArea.onclick = e => { const b = e.target.closest('[data-kd]'); if (!b || i >= CARDS.length) return;
      if (b.dataset.kd === CARDS[i][1]){ i++; msg = '✓ 맞아요'; } else msg = '다시 읽어 보세요'; draw(); setTimeout(() => { msg = ''; if (api.mgArea.querySelector('[data-kd]')) draw(); }, 700); };
    api.mgAct.onclick = () => { if (i < CARDS.length) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
    api.mg.onClose = () => { api.mgArea.onclick = null; };
  }
  // 👘 대제사장의 옷 순서대로(레 8:7-9)
  function robeGame(q){
    const ORDER = ['속옷', '띠', '겉옷', '에봇', '에봇의 장식 띠', '흉패', '관', '금 패'];
    const shown = ORDER.map((t, i) => i).sort(() => Math.random() - 0.5);
    let next = 0, msg = '';
    api.runDialog(DLG.lv_robe_intro, () => {
      mgOpen('👘 아론의 옷', '"아론에게 속옷을 입히며 …" (레 8:7-9) — 입히는 순서대로 눌러요.');
      const draw = () => {
        api.mgArea.innerHTML = `<div style="padding:8px 12px;font-size:13px;min-height:22px">입힌 것: ${ORDER.slice(0, next).join(' → ') || '—'}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;padding:0 10px">${shown.filter(i => i >= next).map(i => `<button data-rb="${i}" style="${btnCss}">${ORDER[i]}</button>`).join('')}</div><div style="text-align:center;color:#ffd27a;font-weight:800;min-height:18px;margin-top:6px">${msg || (next < ORDER.length ? `${next + 1}번째는?` : '✓ 모두 입혔어요')}</div>`;
        api.mgAct.textContent = next < ORDER.length ? '다 입히면 계속' : '계속'; api.mgAct.disabled = next < ORDER.length;
      };
      draw();
      api.mgArea.onclick = e => { const b = e.target.closest('[data-rb]'); if (!b) return; const i = +b.dataset.rb;
        if (i === next){ next++; msg = ''; } else msg = '성경에 적힌 순서를 떠올려 봐요'; draw(); };
      api.mgAct.onclick = () => { if (next < ORDER.length) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; };
    }, null, 'lv_robe_intro');
  }
  // 🗓 이레 동안 회막 문에(레 8:33-35)
  function sevenGame(q){ api.runDialog(DLG.lv_seven, () => sevenMg(q), null, 'lv_seven'); }
  function sevenMg(q){
    const DAYS = ['첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째', '일곱째'];
    let d = 0;
    mgOpen('🗓 위임식 이레', '"너희는 칠 주야를 회막 문에 머물면서 여호와께서 지키라고 하신 것을 지키라" (레 8:35)');
    const draw = () => { api.mgArea.innerHTML = `<div style="display:flex;gap:4px;justify-content:center;padding:14px 6px">${DAYS.map((x, i) => `<div style="width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;${i < d ? 'background:#ffd27a;color:#2a1d10' : 'background:rgba(255,255,255,.08)'}">${i + 1}</div>`).join('')}</div><div style="text-align:center;color:#ffd27a;font-weight:800">${d < 7 ? `${DAYS[d]} 날 — 회막 문에 머물러요` : '✓ 이레를 모두 지켰어요'}</div>`;
      api.mgAct.textContent = d < 7 ? '🌙 하루 지나기' : '계속'; };
    draw();
    api.mgAct.onclick = () => { if (d < 7){ d++; draw(); return; } mgCloseAll(); completeTask(q); };
  }
  // 🔥 여호와의 불(레 9:23-24) → 엎드리기
  let fireObj = null;
  function fireEvent(){
    if (fireObj){ fireObj.parent && fireObj.parent.remove(fireObj); fireObj = null; }
    const [x, z] = BRONZE, y = api.heightAt(x, z) + 1.1, g = new THREE.Group();
    for (let i = 0; i < 7; i++){ const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: api.flameTex, color: i % 2 ? 0xffd27a : 0xff8a3a, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.9 }));
      s.position.set(x + (Math.random() - 0.5) * 0.9, y + Math.random() * 0.8, z + (Math.random() - 0.5) * 0.9); s.scale.set(1.2 + Math.random(), 1.8 + Math.random(), 1); g.add(s); }
    api.zoneRoot.add(g); fireObj = g;
    try { api.startCine('lvFire', x, y, z, { r: 9, h: 4, dur: 4.5, spin: 0.5 }); } catch (e){}
    setTimeout(() => { if (fireObj === g){ g.parent && g.parent.remove(g); fireObj = null; } }, 9000);
  }
  function bowGame(q){
    api.runDialog(DLG.lv_fire, () => {
      mgOpen('🙇 엎드리기', '"온 백성이 이를 보고 소리 지르며 엎드렸더라" (레 9:24)');
      api.mgArea.innerHTML = '<div style="padding:18px;text-align:center;font-size:40px">🔥</div>';
      api.mgAct.textContent = '🙇 엎드리기';
      api.mgAct.onclick = () => { mgCloseAll(); completeTask(q); };
    }, null, 'lv_fire');
  }
  const T = n => `📜 시내산의 마지막 한 달 ${n}장`;
  return {
    id: 'sinai2',
    chapters: [
      { title: `${T(1)} — 회막에서 부르심`, clearTitle: '🎉 2편 1장 「회막에서 부르심」 완료!', next: '2장: 여러 가지 예물',
        steps: [
          { id: 'lv1s1', zone: 'sinai', obj: '회막 앞의 모세에게 가기', where: '성막 뜰 동쪽 문 앞', npc: 'moses', dlg: 'lv_call', place: { moses: [15, -13.2], aaron: [15, -16.8] } },
          { id: 'lv1s2', zone: 'sinai', obj: '흠 없는 수컷 고르기', where: '회막 앞의 모세', npc: 'moses', game: 'pick' },
          { id: 'lv1s3', zone: 'sinai', obj: '회막 문으로 예물 가져가기', where: '성막 뜰 동쪽 문(빛나는 곳)', point: 'lv_door', dlg: 'lv_door', reward: { verse: 'lv1-4', clear: true } },
        ] },
      { title: `${T(2)} — 여러 가지 예물`, clearTitle: '🎉 2편 2장 「여러 가지 예물」 완료!', next: '3장: 위임식 이레',
        steps: [
          { id: 'lv2s1', zone: 'sinai', obj: '아론에게 예물의 규례 듣기', where: '회막 문 앞의 아론', npc: 'aaron', dlg: 'lv_offerings', place: { moses: [15, -13.2], aaron: [15, -16.8] } },
          { id: 'lv2s2', zone: 'sinai', obj: '예물마다 어떤 제사인지 나누기', where: '회막 문 앞의 아론', npc: 'aaron', game: 'sort' },
          { id: 'lv2s3', zone: 'sinai', obj: '모세에게 가기 — 시내 산에서 명령하신 규례', where: '회막 문 앞의 모세', npc: 'moses', dlg: 'lv_laws', reward: { verse: 'lv7-37', clear: true } },
        ] },
      { title: `${T(3)} — 위임식 이레`, clearTitle: '🎉 2편 3장 「위임식 이레」 완료!', next: '4장: 여호와의 불',
        steps: [
          { id: 'lv3s1', zone: 'sinai', obj: '회막 문에 모인 회중 곁으로', where: '회막 문 앞의 모세', npc: 'moses', dlg: 'lv_gather', place: { moses: [15, -13.2], aaron: [15, -16.8] } },
          { id: 'lv3s2', zone: 'sinai', obj: '아론에게 옷을 순서대로 입히기', where: '회막 문 앞의 아론', npc: 'aaron', game: 'robe', doneDlg: 'lv_robe_done' },
          { id: 'lv3s3', zone: 'sinai', obj: '이레 동안 회막 문에 머물기', where: '회막 문(빛나는 곳)', point: 'lv_door', game: 'seven', doneDlg: 'lv_seven_done', reward: { verse: 'lv8-36', clear: true } },
        ] },
      { title: `${T(4)} — 여호와의 불`, clearTitle: '🎉 2편 4장 「여호와의 불」 완료! (5장부터는 준비 중이에요)', next: '5장: 다른 불 (준비 중)',
        steps: [
          { id: 'lv4s1', zone: 'sinai', obj: '여덟째 날 — 모세의 말 듣기', where: '회막 문 앞의 모세', npc: 'moses', dlg: 'lv_eighth', place: { moses: [15, -13.2], aaron: [15, -16.8] } },
          { id: 'lv4s2', zone: 'sinai', obj: '제단에 나아가는 아론 곁으로', where: '회막 문 앞의 아론', npc: 'aaron', dlg: 'lv_aaron_altar' },
          { id: 'lv4s3', zone: 'sinai', obj: '번제단 앞에서 여호와의 영광 보기', where: '성막 뜰 안 번제단(빛나는 곳)', point: 'lv_altar', game: 'bow', reward: { verse: 'lv9-24', clear: true } },
        ] },
    ],
    games: { pick: pickGame, sort: sortGame, robe: robeGame, seven: sevenGame, bow: bowGame },
    events: { lvFire: fireEvent },
  };
});
