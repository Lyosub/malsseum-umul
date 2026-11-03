  // ── 1장: 아론에게 전할 말씀(출 4:14-16) ──
  function aaronWordsGame(s){
    const cards = [
      { t: "내가 네 입과 그의 입에 함께 있어서 너희들이 행할 일을 가르치리라 (출 4:15)", ok: true },
      { t: "그가 너를 대신하여 백성에게 말할 것이니 그는 네 입을 대신할 것이요 (출 4:16)", ok: true },
      { t: '▶ (게임 보기) 모세 혼자 가서 모든 말을 하라', ok: false },
    ].sort(() => Math.random() - 0.5);
    mgOpen('📜 아론에게 전할 말씀', '모세가 여호와께 들은 말씀 가운데 <b>아론에게 전할 말씀 두 가지</b>를 골라요.<br><span style="opacity:.75">"레위 사람 네 형 아론이 있지 아니하냐 그가 말 잘 하는 것을 내가 아노라" (출애굽기 4:14)</span>');
    let got = 0; const pick = new Set();
    const draw = msg => { mgArea.innerHTML = `<div style="display:grid;gap:6px;padding:8px">${cards.map((c, i) => `<button data-card="${i}" style="padding:9px;border-radius:10px;text-align:left;font-size:12.5px;border:1px solid ${pick.has(i) ? '#9be58a' : 'rgba(255,255,255,.3)'};background:rgba(255,255,255,.08);color:#f5e9d0">${c.t}</button>`).join('')}</div><div style="text-align:center;color:#ffd27a;font-weight:800;min-height:18px">${msg || ''}</div>`; };
    draw(); mgAct.textContent = '아론에게 전하기'; mgAct.disabled = true;
    mgArea.onclick = e => { const b = e.target.closest('[data-card]'); if (!b) return; const i = +b.dataset.card, c = cards[i];
      if (!c.ok){ draw('그건 여호와께서 하신 말씀이 아니에요 — 출애굽기 4:14-16을 다시 보세요'); return; }
      pick.add(i); got = pick.size; draw(got >= 2 ? '✓ 두 말씀을 골랐어요' : '✓ 하나 더!'); if (got >= 2) mgAct.disabled = false; };
    mgAct.onclick = () => { if (pick.size < 2) return; mgArea.onclick = null; mgCloseAll();
      runDialog([[NAR, "여호와께서 아론에게 이르시되 광야에 가서 모세를 맞으라 하시매 그가 가서 하나님의 산에서 모세를 만나 그에게 입맞추니 (출 4:27)"], [NAR, "모세가 여호와께서 자기에게 분부하여 보내신 모든 말씀과 여호와께서 자기에게 명령하신 모든 이적을 아론에게 알리니라 (출 4:28)"]], () => sideDone(s)); };
    mg.onClose = () => { mgArea.onclick = null; };
  }
  // ── 2장: 바로의 약속 기록판(출 8:8-15, 8:25-32, 9:27-35) ──
  const BOARD = [
    { say: "여호와께 구하여 나와 내 백성에게서 개구리를 떠나게 하라 내가 이 백성을 보내리니 (출 8:8)", ref: '출 8:8', did: "그러나 바로가 숨을 쉴 수 있게 됨을 보았을 때에 그의 마음을 완강하게 하여 그들의 말을 듣지 아니하였으니 (출 8:15)", dref: '출 8:15' },
    { say: "내가 너희를 보내리니 너희가 너희의 하나님 여호와께 광야에서 제사를 드릴 것이나 너무 멀리 가지는 말라 (출 8:28)", ref: '출 8:28', did: "그러나 바로가 이 때에도 그의 마음을 완강하게 하여 그 백성을 보내지 아니하였더라 (출 8:32)", dref: '출 8:32' },
    { say: "이번은 내가 범죄하였노라 여호와는 의로우시고 나와 나의 백성은 악하도다 (출 9:27)", ref: '출 9:27', did: "바로가 비와 우박과 우렛소리가 그친 것을 보고 다시 범죄하여 마음을 완악하게 하니 그와 그의 신하가 꼭 같더라 (출 9:34)", dref: '출 9:34' },
  ];
  function boardGame(s){
    mgOpen('📋 바로의 약속 기록판', '바로가 <b>한 말</b>과 <b>뒤이어 한 행동</b>을 짝지어요. 왼쪽을 누르고, 알맞은 오른쪽을 누르세요.');
    const right = BOARD.map((b, i) => i).sort(() => Math.random() - 0.5); let sel = -1; const done = new Set();
    const draw = msg => {
      mgArea.innerHTML = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:8px;font-size:11.5px;max-height:48vh;overflow:auto"><div><b>바로가 한 말</b>${BOARD.map((b, i) => `<button data-l="${i}" style="display:block;width:100%;margin-top:5px;padding:7px;border-radius:9px;text-align:left;color:#f5e9d0;background:${done.has(i) ? 'rgba(155,229,138,.25)' : sel === i ? 'rgba(255,210,122,.3)' : 'rgba(255,255,255,.08)'};border:1px solid rgba(255,255,255,.25)">${b.say} (${b.ref})</button>`).join('')}</div>`
        + `<div><b>뒤이어 한 행동</b>${right.map(i => `<button data-r="${i}" style="display:block;width:100%;margin-top:5px;padding:7px;border-radius:9px;text-align:left;color:#f5e9d0;background:${done.has(i) ? 'rgba(155,229,138,.25)' : 'rgba(255,255,255,.08)'};border:1px solid rgba(255,255,255,.25)">${BOARD[i].did} (${BOARD[i].dref})</button>`).join('')}</div></div><div style="text-align:center;color:#ffd27a;font-weight:800;min-height:18px">${msg || ''}</div>`;
    };
    draw(); mgAct.textContent = '기록 마치기'; mgAct.disabled = true;
    mgArea.onclick = e => { const l = e.target.closest('[data-l]'), r = e.target.closest('[data-r]');
      if (l){ sel = +l.dataset.l; draw(); return; }
      if (r && sel >= 0){ if (+r.dataset.r === sel){ done.add(sel); sel = -1; draw(done.size >= 3 ? '✓ 세 번 모두 기록했어요' : '✓ 맞아요'); if (done.size >= 3) mgAct.disabled = false; } else draw('다시 살펴보세요'); } };
    mgAct.onclick = () => { if (done.size < 3) return; mgArea.onclick = null; mgCloseAll(); runDialog([[NAR, "바로의 마음이 완악하여 이스라엘 자손을 내보내지 아니하였으니 여호와께서 모세에게 말씀하심과 같더라 (출 9:35)"]], () => sideDone(s)); };
    mg.onClose = () => { mgArea.onclick = null; };
  }
  // ── 4장: 구름기둥이 선 자리(출 14:19-20) ──
  function cloudGame(s){
    mgOpen('☁️ 구름기둥이 선 자리', '밤이 되자 구름기둥이 어디로 옮겨 갔을까요? 알맞은 자리를 눌러요.<br><span style="opacity:.75">"이스라엘 진 앞에 가던 하나님의 사자가 그들의 뒤로 옮겨 가매 구름 기둥도 앞에서 그 뒤로 옮겨" (출애굽기 14:19)</span>');
    const slots = ['🌊 바다', '⛺ 이스라엘 진', '❔', '🐎 애굽 진', '❔'];
    const draw = msg => { mgArea.innerHTML = `<div style="display:flex;gap:4px;padding:14px 8px;justify-content:center">${slots.map((t, i) => t === '❔' ? `<button data-slot="${i}" style="flex:1;padding:14px 4px;border-radius:10px;border:2px dashed #ffd27a;background:rgba(255,210,122,.1);color:#ffd27a;font-size:20px">☁️?</button>` : `<div style="flex:1;padding:14px 4px;border-radius:10px;background:rgba(255,255,255,.08);text-align:center;font-size:12px">${t}</div>`).join('')}</div><div style="text-align:center;color:#ffd27a;font-weight:800;min-height:18px">${msg || ''}</div>`; };
    draw(); mgAct.textContent = '확인'; mgAct.disabled = true;
    mgArea.onclick = e => { const b = e.target.closest('[data-slot]'); if (!b) return;
      if (+b.dataset.slot === 2){ slots[2] = '☁️ 구름기둥'; draw('✓ 애굽 진과 이스라엘 진 사이!'); mgAct.disabled = false; } else draw('다시 — 본문은 "애굽 진과 이스라엘 진 사이"라고 해요'); };
    mgAct.onclick = () => { mgArea.onclick = null; mgCloseAll(); runDialog([[NAR, "애굽 진과 이스라엘 진 사이에 이르러 서니 저쪽에는 구름과 흑암이 있고 이쪽에는 밤이 밝으므로 밤새도록 저쪽이 이쪽에 가까이 못하였더라 (출 14:20)"]], () => sideDone(s)); };
    mg.onClose = () => { mgArea.onclick = null; };
  }
  // ── 5장: 장막마다 만나 나누기(출 16:16, 16:22) ──
  function mannaGame(s){
    const tents = [{ n: '장막 가', p: 4 }, { n: '장막 나', p: 2 }, { n: '장막 다', p: 5 }]; let round = 1; const give = [0, 0, 0];
    mgOpen('🍞 장막마다 만나 나누기', '장막에 있는 사람 수를 보고 알맞은 오멜을 나눠요.<br><span style="opacity:.75">"너희 사람 수효대로 한 사람에 한 오멜씩 거두되" (출애굽기 16:16)</span>');
    const need = i => tents[i].p * round;
    const draw = msg => { mgArea.innerHTML = `<div style="text-align:center;font-weight:800;color:#ffd27a;padding:6px">${round === 1 ? '평일 아침' : '여섯째 날 — "하나에 두 오멜씩" (출 16:22)'}</div><div style="display:flex;gap:6px;padding:4px 8px">${tents.map((t, i) => `<div style="flex:1;text-align:center;background:rgba(255,255,255,.07);border-radius:10px;padding:8px 4px;font-size:12.5px"><b>${t.n}</b><br>${'🧑'.repeat(t.p)}<br>${t.p}명<div style="font-size:18px;margin:6px 0">🍞 ${give[i]}</div><button data-add="${i}" style="padding:4px 10px">＋</button> <button data-sub="${i}" style="padding:4px 10px">－</button></div>`).join('')}</div><div style="text-align:center;color:#ffd27a;font-weight:800;min-height:18px">${msg || ''}</div>`; };
    draw(); mgAct.textContent = '나누기 확인'; mgAct.disabled = false;
    mgArea.onclick = e => { const a = e.target.closest('[data-add]'), b = e.target.closest('[data-sub]'); if (a) give[+a.dataset.add]++; if (b) give[+b.dataset.sub] = Math.max(0, give[+b.dataset.sub] - 1); if (a || b) draw(); };
    mgAct.onclick = () => {
      const ok = give.every((g, i) => g === need(i));
      if (!ok){ draw('사람 수와 오멜 수를 다시 세어 봐요'); return; }
      if (round === 1){ round = 2; give.fill(0); draw('✓ 맞아요! 이번엔 여섯째 날이에요'); return; }
      mgArea.onclick = null; mgCloseAll(); runDialog([[NAR, "오멜로 되어 본즉 많이 거둔 자도 남음이 없고 적게 거둔 자도 부족함이 없이 각 사람은 먹을 만큼만 거두었더라 (출 16:18)"], [NAR, "여섯째 날에는 각 사람이 갑절의 식물 곧 하나에 두 오멜씩 거둔지라 (출 16:22)"]], () => sideDone(s));
    };
    mg.onClose = () => { mgArea.onclick = null; };
  }
  // ── 7장: 십부장의 재판(출 18:22, 18:26) — 사례는 게임 사례 ──
  function judgeGame(s){
    const cases = [{ t: '이웃과 양 한 마리 때문에 생긴 다툼', small: true }, { t: '물 긷는 순서를 두고 생긴 다툼', small: true }, { t: '지금까지 한 번도 없던 어려운 일', small: false }].sort(() => Math.random() - 0.5);
    mgOpen('⚖️ 십부장의 재판', '▶ 아래 사례는 <b>게임 사례</b>예요. 작은 일은 십부장이, 어려운 일은 모세에게 가져가요.<br><span style="opacity:.75">"어려운 일은 모세에게 가져오고 모든 작은 일은 스스로 재판하더라" (출애굽기 18:26)</span>');
    let i = 0, miss = 0;
    const draw = msg => { mgArea.innerHTML = i < cases.length ? `<div style="padding:12px;text-align:center"><div style="font-size:14px;font-weight:800;margin-bottom:10px">사례 ${i + 1}: ${cases[i].t}</div><button data-j="small" style="padding:9px 12px;margin:4px;border-radius:10px">십부장이 재판</button><button data-j="hard" style="padding:9px 12px;margin:4px;border-radius:10px">모세에게 가져가기</button></div><div style="text-align:center;color:#ffd27a;font-weight:800;min-height:18px">${msg || ''}</div>` : `<div style="padding:14px;text-align:center;color:#9be58a;font-weight:800">✓ 기다리던 줄이 줄었어요</div>`; };
    draw(); mgAct.textContent = '재판 마치기'; mgAct.disabled = true;
    mgArea.onclick = e => { const b = e.target.closest('[data-j]'); if (!b) return; const small = b.dataset.j === 'small';
      if (small === cases[i].small){ i++; draw('✓'); if (i >= cases.length){ mgAct.disabled = false; } } else { miss++; draw('다시 — 작은 일은 스스로, 어려운 일은 모세에게'); } };
    mgAct.onclick = () => { if (i < cases.length) return; mgArea.onclick = null; mgCloseAll(); runDialog([[NAR, "그리하면 그들이 너와 함께 담당할 것인즉 일이 네게 쉬우리라 (출 18:22)"]], () => sideDone(s)); };
    mg.onClose = () => { mgArea.onclick = null; };
  }
  // ── 곁 이야기 대화 ──
  function sideTalk(m){
    const id = m.data.id, zid = Z && Z.id;
    // 3장: 이웃 물건 줍기
    const it = NB_ITEMS.find(x => x.id === id);
    if (it && zid === 'egypt' && sideState('neighbor') === 'active'){ ST.sideItems = [...(ST.sideItems || []), id]; saveST(); refreshShow(); toast(`📦 ${it.t}을(를) 챙겼어요 (${ST.sideItems.length}/3)`, 1800); return true; }
    // 6장: 반석에서 물 뜨기 · 이웃에게 주기 · 다음 날 기억
    if (zid === 'rephidim'){
      if (id === 'horeb_rock' && sideState('water_give') === 'active' && !ST.sideWater){ ST.sideWater = 2; saveST(); runDialog([[NAR, "너는 그 반석을 치라 그것에서 물이 나오리니 백성이 마시리라 (출 17:6)"], [NAR, '▶ 물을 떴어요. 이스라엘 장로와 목마른 아버지에게 가져다주세요.']]); return true; }
      if ((id === 'rp_elder' || id === 'rp_angry1') && sideState('water_give') === 'active'){
        const g = ST.sideGiven || []; if (g.includes(id)) return false;
        if (!ST.sideWater){ runDialog([[SAYS(m.data.title), '물통이 비었구나…'], [NAR, '▶ 먼저 호렙 반석에서 물을 떠 오세요.']], null, m); return true; }
        ST.sideGiven = [...g, id]; ST.sideWater--; saveST();
        runDialog([[SAYS(m.data.title), '고맙구나. 마실 물이다!', 'happy']], () => { if ((ST.sideGiven || []).length >= 2){ ST.sideMemory = kstDate(); sideDone(SIDE.find(x => x.id === 'water_give')); } }, m); return true;
      }
      if ((id === 'rp_elder' || id === 'rp_angry1') && sideState('water_give') === 'done' && ST.sideMemory){
        runDialog([[SAYS(m.data.title), ST.sideMemory === kstDate() ? '아까 물을 가져다줘서 고마웠어.' : '지난번에 물을 가져다준 친구구나! 오늘은 물통이 가득해.', 'happy']], null, m); return true;
      }
    }
    const s = SIDE.find(x => x.zone === zid && x.npc === id); if (!s || sideState(s.id) === 'done' || !s.ok()) return false;
    const st = sideState(s.id);
    if (s.id === 'aaron_words'){ aaronWordsGame(s); return true; }
    if (s.id === 'pharaoh_board'){ boardGame(s); return true; }
    if (s.id === 'cloud_place'){ cloudGame(s); return true; }
    if (s.id === 'manna_share'){ mannaGame(s); return true; }
    if (s.id === 'judges'){ judgeGame(s); return true; }
    if (s.id === 'neighbor'){
      if (!st){ runDialog([[SAYS(m.data.title), '떠날 준비를 하는데 짐을 다 못 챙겼구나…', 'worried'], [NAR, "너희는 그것을 이렇게 먹을지니 허리에 띠를 띠고 발에 신을 신고 손에 지팡이를 잡고 급히 먹으라 (출 12:11)"], [NAR, '▶ 이웃의 반죽 그릇·신·지팡이를 찾아 가져다주세요(마을에 📦 표시).']], () => { sideSet('neighbor', 'active'); ST.sideItems = []; saveST(); refreshShow(); sideRefresh(true); }, m); return true; }
      if ((ST.sideItems || []).length < 3){ runDialog([[SAYS(m.data.title), `아직 ${3 - (ST.sideItems || []).length}개가 남았구나.`]], null, m); return true; }
      runDialog([[SAYS(m.data.title), '고맙구나! 이제 우리도 함께 떠날 수 있겠다.', 'happy'], [NAR, "그 백성이 발교되지 못한 반죽 담은 그릇을 옷에 싸서 어깨에 메니라 (출 12:34)"]], () => sideDone(s), m); return true;
    }
    if (s.id === 'water_give'){
      if (!st){ runDialog([[SAYS(m.data.title), '반석에서 물이 나왔다는데, 저쪽 사람들은 아직 물을 못 마셨다네.'], [NAR, '▶ 호렙 반석에서 물을 떠서 이스라엘 장로와 목마른 아버지에게 가져다주세요.']], () => { sideSet('water_give', 'active'); ST.sideGiven = []; ST.sideWater = 0; saveST(); sideRefresh(true); }, m); return true; }
    }
    return false;
  }
  // 이름표 📜
  let sideT = 0;
  function sideRefresh(force){
    const now = performance.now(); if (!force && now - sideT < 2000) return; sideT = now; if (!Z) return;
    for (const s of SIDE){ if (s.zone !== Z.id) continue; const m = markers.find(x => x.data.id === s.npc); if (!m || !m.tag) continue;
      const avail = sideState(s.id) !== 'done' && s.ok(), base = m.data.title, cur = m.tag.userData.text;
      const want = avail ? '📜 ' + base : base;
      if (cur !== want){ m.tag.userData.text = want; m.tag.userData.mode = null; m.tag.userData.el.textContent = want; } }
  }
  const _renderHQ0 = renderHQ;
  renderHQ = function(){
    _renderHQ0();
    const el = document.getElementById('hq-list');
    el.innerHTML += `<h3 style="font-size:15px;margin:14px 0 4px">📜 곁 이야기</h3>` + SIDE.map(s => {
      const st = sideState(s.id), where = `${ZONES[s.zone].name}`;
      if (st === 'done') return `<div class="dq done"><span class="ck">✅</span><span class="tx"><b>${s.ch}장 · ${s.name}</b></span></div>`;
      if (s.ok()) return `<div class="dq"><span class="ck">📜</span><span class="tx"><b>${s.ch}장 · ${s.name}</b> — ${where}에서 📜 표시를 찾아요${st === 'active' ? ' (진행 중)' : ''}</span></div>`;
      return `<div class="dq" style="opacity:.6"><span class="ck">🔒</span><span class="tx"><b>${s.ch}장 · ${s.name}</b> — ${s.ch}장을 마치면 열려요</span></div>`;
    }).join('');
  };
  Object.assign(BADGES, { side_all: { ico: '📜', name: '곁을 살핀 사람' } });
  // ══ ⭐ 지혜 별 쓰기: ① 히든 힌트 자세히 ② 공방 실 교환 ③ 지혜 칭호 ④ 틀린 퀴즈 다시 풀기 ⑤ 두루마리 도서관 ══
  // 칭호는 "모은 별(ST.stars)" 기준 — 별을 써도 줄지 않음. 쓸 수 있는 별 = 모은 별 − 쓴 별.
  const starsLeft = () => Math.max(0, (ST.stars || 0) - (ST.starsSpent || 0));
  function spendStars(n, why){
    if (starsLeft() < n){ toast(`⭐ 지혜 별이 ${n - starsLeft()}개 모자라요 — 장면 끝 확인 퀴즈를 처음에 맞히면 받아요`, 2600); return false; }
    ST.starsSpent = (ST.starsSpent || 0) + n; saveST(); toast(`⭐ 지혜 별 ${n}개를 썼어요 — ${why} (남은 별 ${starsLeft()})`, 2000); return true;
  }
  // ③ 지혜 칭호(모은 별 10·20·30)
  TITLES.push({ need: 'star10', t: '말씀을 묵상하는 사람' }, { need: 'star20', t: '말씀을 새긴 사람' }, { need: 'star30', t: '지혜로운 마음의 사람' });
  Object.assign(TITLE_ICO, { '말씀을 묵상하는 사람': '⭐', '말씀을 새긴 사람': '🌟', '지혜로운 마음의 사람': '✨' });
  // ① 히든 퀘스트 힌트 자세히(⭐1)
  const HQ_DETAIL = {
    lost_lamb: '동물 친구 하나를 Lv.2(친밀도 40)까지 키운 뒤, 미디안 마을의 「목동 소년」에게 말을 걸어요. 잃은 양은 마을 밖 먼 곳에 있어요.',
    night_brick: '한국 시간 밤 8시~새벽 5시에 애굽 벽돌 작업장 옆 「벽돌공」에게 → 벽돌 굽기 도전에서 8장 이상.',
    manna_week: '5장을 마친 뒤 신 광야 들판의 만나를 안식일(토)만 빼고 6일 연속 거둔 다음, 「배고픈 아이」에게.',
    rephidim_work: '르비딤의 조각목 베기·구리 광석 캐기를 합쳐 10번 한 뒤, 「걱정하는 어머니」에게.',
    grandma_quiz: '8장 십계명 게임을 한 번도 틀리지 않아 배지 🪨를 받은 뒤, 시내산 「천막의 할머니」의 물음(안식일 계명)에 답해요.',
    scroll_sage: '마을마다 숨은 두루마리 조각 5개씩, 모두 20개를 모은 뒤 두루마리마을 「정원사 할머니」에게.',
    two_friends: '다른 친구가 같은 때 두루마리마을에 있을 때 「마을 아이」에게 말을 걸어요.',
    lords_day: '일요일(한국 시간)에 두루마리마을 「지도 그리는 사람」에게.',
  };
  const hqHintOpen = id => (ST.hqHint || []).includes(id);
  document.getElementById('hq-list').addEventListener('click', e => { const b = e.target.closest('[data-hqhint]'); if (!b) return; const id = b.dataset.hqhint;
    if (hqHintOpen(id)) return; if (!spendStars(1, '히든 퀘스트 힌트')) return; ST.hqHint = [...(ST.hqHint || []), id]; saveST(); renderHQ(); });
  // ② 공방: ⭐3 → 청색·자색·홍색 실 1개
  const _renderCraft0 = renderCraft;
  renderCraft = function(msg){
    _renderCraft0(msg);
    const el = document.getElementById('craft-mats');
    el.insertAdjacentHTML('beforeend', `<div style="flex-basis:100%;font-size:12px;margin-top:4px">⭐ 쓸 수 있는 지혜 별 <b style="color:#ffd27a">${starsLeft()}</b> · 별 3개 → 실 1개: <button data-starx="blue" class="stx">🟦</button><button data-starx="purple" class="stx">🟪</button><button data-starx="scarlet" class="stx">🟥</button></div>`);
  };
  document.getElementById('craft-mats').addEventListener('click', e => { const b = e.target.closest('[data-starx]'); if (!b) return; const k = b.dataset.starx;
    if (!spendStars(3, `${MATS[k].n} 1개`)) return; addMat({ [k]: 1 }, '⭐ 지혜 별 교환', true); renderCraft(); });
  // ④ 틀린 퀴즈 다시 풀기(⭐1) — 맞히면 🔑 핵심 문장 카드
  const missedQuiz = () => Object.keys(QUIZ).filter(k => ST.quiz[k] === 'miss' && (QUIZ[k].w || []).every(x => x));
  function retryQuiz(k){
    const Q = QUIZ[k]; if (!Q) return;
    if (!spendStars(1, '퀴즈 다시 풀기')) return;
    const opts = [Q.a, ...Q.w].sort(() => Math.random() - 0.5);
    document.querySelectorAll('.modal:not(.hidden) .close').forEach(b => b.click());
    mgOpen('⭐ 다시 풀기', `<b>${Q.q}</b>`);
    const draw = msg => { mgArea.innerHTML = `<div style="display:grid;gap:6px;padding:8px">${opts.map((o, i) => `<button data-opt="${i}" style="padding:9px;border-radius:10px;text-align:left;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.08);color:#f5e9d0">${o}</button>`).join('')}</div><div style="text-align:center;color:#ffd27a;font-weight:800;min-height:18px">${msg || ''}</div>`; };
    draw(); mgAct.textContent = '닫기'; mgAct.disabled = false; mgAct.onclick = () => { mgArea.onclick = null; mgCloseAll(); };
    mgArea.onclick = e => { const b = e.target.closest('[data-opt]'); if (!b) return;
      if (opts[+b.dataset.opt] !== Q.a){ draw('다시 생각해 봐요'); return; }
      ST.quiz[k] = 'ok'; const K = KEYS[k];
      if (K && !ST.keys.some(x => x.scene === K.scene)) ST.keys.push({ scene: K.scene, t: K.t });
      if (Object.keys(QUIZ).every(q => ST.quiz[q] === 'ok') && !ST.badges.includes('wise')){ ST.badges.push('wise'); setTimeout(() => toast('⭐ 배지 획득: 말씀을 새긴 마음', 2400), 1200); }
      saveST(); mgArea.onclick = null;
      draw(K ? `✓ 맞아요! 🔑 「${K.scene}」 — ${K.t}` : '✓ 맞아요!'); };
    mg.onClose = () => { mgArea.onclick = null; };
  }
  const bookBtn = document.getElementById('btn-book'), _bookOpen0 = bookBtn.onclick;
  bookBtn.onclick = () => {
    _bookOpen0();
    const miss = missedQuiz();
    document.getElementById('book-cards').insertAdjacentHTML('beforeend', `<div style="grid-column:1/-1;margin-top:10px"><h3 style="font-size:15px;margin-bottom:4px">⭐ 틀린 퀴즈 다시 풀기 · 쓸 수 있는 별 ${starsLeft()}</h3>`
      + (miss.length ? miss.map(k => `<div class="keyline" style="display:flex;gap:6px;align-items:center"><span style="flex:1">${QUIZ[k].q}</span><button data-retry="${k}" style="padding:5px 8px;border-radius:8px;border:none;background:#ffd27a;color:#2a1d10;font-weight:800">⭐1 다시 풀기</button></div>`).join('')
        : '<div class="keyline" style="opacity:.7">틀린 퀴즈가 없어요 👏</div>') + '</div>');
  };
  document.getElementById('book-cards').addEventListener('click', e => { const b = e.target.closest('[data-retry]'); if (!b) return; retryQuiz(b.dataset.retry); });
  // ⑤ 두루마리 도서관(두루마리마을) — 마친 장의 칸을 ⭐2로 열면 그 장의 구절을 모아 볼 수 있음
  ZONES.alpha.points.push({ id: 'library', x: -15.5, z: -4.5, type: 'lore', title: '📚 두루마리 도서관', body: '' });
  const LIB = [[1, '부르심', 2, 6], [2, '아홉 가지 재앙', 7, 10], [3, '유월절 밤', 11, 13], [4, '홍해를 건너다', 14, 15.21], [5, '광야의 만나', 15.22, 16.99], [6, '반석의 물과 아말렉', 17, 17.99],
               [7, '이드로의 방문', 18, 18.99], [8, '시내산', 19, 23.99], [9, '금송아지', 24, 34.99], [10, '성막', 35, 40.99]];
  const verseNum = id => { const m = /^ex(\d+)-(\d+)$/.exec(id); return m ? +m[1] + (+m[2]) / 100 : -1; };
  function renderLibrary(){
    const el = document.getElementById('lib-list'), open = ST.lib || [];
    el.innerHTML = `<div style="font-size:12.5px;opacity:.85;margin-bottom:6px">마친 장의 칸을 ⭐ 지혜 별 2개로 열면, 그 장의 구절을 모두 모아 읽을 수 있어요. 쓸 수 있는 별 <b style="color:#ffd27a">${starsLeft()}</b></div>`
      + LIB.map(([n, name, a, b]) => {
        if (chaptersDone() < n) return `<div class="dq" style="opacity:.55"><span class="ck">🔒</span><span class="tx">${n}장 「${name}」 — ${n}장을 마치면 열 수 있어요</span></div>`;
        if (!open.includes(n)) return `<div class="dq"><span class="ck">📕</span><span class="tx">${n}장 「${name}」</span><button data-lib="${n}" style="padding:5px 8px;border-radius:8px;border:none;background:#ffd27a;color:#2a1d10;font-weight:800">⭐2 열기</button></div>`;
        const vs = Object.keys(VERSES).filter(id => { const v = verseNum(id); return v >= a && v <= b; }).sort((x, y) => verseNum(x) - verseNum(y));
        return `<div style="margin:8px 0"><div style="font-weight:800">📖 ${n}장 「${name}」</div>${vs.map(id => `<div class="keyline"><b>${VERSES[id].ref}</b> — ${VERSES[id].text}</div>`).join('')}</div>`;
      }).join('');
  }
  function openLibrary(){ renderLibrary(); openModal('lib-modal'); }
  document.getElementById('lib-list').addEventListener('click', e => { const b = e.target.closest('[data-lib]'); if (!b) return; const n = +b.dataset.lib;
    if ((ST.lib || []).includes(n)) return; if (!spendStars(2, `도서관 ${n}장 칸`)) return; ST.lib = [...(ST.lib || []), n]; saveST(); renderLibrary(); });
  // ══ 📜 지난 이야기 30초 · 🏛 기념 전시관 · 🗺 걸어온 여정 지도 ══
  // 장면 → 장 번호(🔑 핵심 장면 기록을 장별로 나눌 때)
  const keyChapter = k => { const m = /^c(\d+)_/.exec(k); return m ? +m[1] : 1; };
  const sceneChapter = {}; for (const [k, v] of Object.entries(KEYS)) sceneChapter[v.scene] = keyChapter(k);
  const zoneName = z => (ZONES[z] && ZONES[z].name) || z;
  const pointTitle = (z, id) => ((ZONES[z] && ZONES[z].points.find(p => p.id === id)) || {}).title || '';
  // ── 3. 지난 이야기 30초 ──
  function recapHTML(){
    const keys = (ST.keys || []).slice(-3), q = curStep();
    let now;
    if (!q) now = `${nextScrollHint() ? `<div class="keyline">▶ ${nextScrollHint().replace('완료! 다음: ', '다음 할 일: ')}</div>` : ''}<div class="keyline">🎉 「모세와 함께」 ${chaptersDone()}장까지 마쳤어요. 📜 곁 이야기 · ❔ 히든 퀘스트 · 📚 도서관을 둘러보세요.</div>`;
    else { const who = q.npc ? pointTitle(q.zone, q.npc) : q.point ? pointTitle(q.zone, q.point) : '';
      now = `<div class="keyline"><b>${CHAPTER.title}</b></div><div class="keyline">▶ 지금 할 일: <b>${q.obj}</b></div><div class="keyline">📍 ${zoneName(q.zone)} — ${q.where || ''}</div>${who ? `<div class="keyline">🙋 다음에 만날 사람·장소: <b>${who}</b></div>` : ''}`; }
    const past = keys.length ? keys.map(k => `<div class="keyline"><b>${k.scene}</b> — ${k.t}</div>`).join('') : '<div class="keyline" style="opacity:.7">아직 기억할 장면이 없어요.</div>';
    return `<div style="font-size:13px;opacity:.8;margin-bottom:4px">🔑 최근에 지나온 장면</div>${past}<div style="font-size:13px;opacity:.8;margin:10px 0 4px">🧭 이어서 할 일</div>${now}`;
  }
  function openRecap(){ document.getElementById('recap-body').innerHTML = recapHTML(); openModal('recap-modal'); }
  document.getElementById('btn-recap').onclick = openRecap;
  function maybeRecap(){
    const prev = ST.lastSeen || 0; ST.lastSeen = Date.now(); saveST();
    if (!prev || Date.now() - prev < 20 * 3600e3) return;                 // 하루 가까이 지나서 돌아왔을 때만
    if (chaptersDone() < 1 && ST.step < 3) return;                          // 막 시작한 학생에게는 띄우지 않음
    if (/[?&](notut|notype|reset)(&|$)/.test(location.search)) return;
    setTimeout(openRecap, 1800);
  }
  // ══ 📜 다음 두루마리 연출 (2026-10-11): 두루마리를 마치면 두루마리마을 기념 전시관으로 가서 받침대에 기념물이 놓이는 것을 보여 주고,
  //    「다음 두루마리를 펼칠까요?」를 묻는다. 「나중에」를 누르면 다시 하는 방법을 알려 준다. 같은 두루마리는 한 번만 묻는다(ST.nextAsked) ══
  const NEXT_SCROLL = {
    moses: { to: 'sinai2', done: () => chaptersDone() >= 10, ped: 0, what: '두 돌판' },
    sinai2: { to: 'wild3', done: () => sinai2Done(), ped: 1, what: '은 나팔 둘' },
    wild3: { to: 'joshua', done: () => wild3Done(), ped: 2, what: '놋뱀 장대' },
    joshua: { to: 'judges', done: () => joshuaDone(), ped: 3, what: '길갈의 열두 돌' },
    judges: { to: 'ruth', done: () => judgesDone(), ped: 4, what: '기드온의 항아리와 횃불' },
    ruth: { to: 'saul', done: () => ruthDone(), ped: 5, what: '에벤에셀 돌' },
    saul: { to: null, done: () => saulDone(), ped: 6, what: '물매와 돌 다섯' },   // 8편은 준비 중 — 받침대만 보여 준다
  };
  let nsBusy = false;
  async function nextScrollCeremony(opt = {}){
    if (nsBusy || traveling || REPLAY) return;
    const from = Object.keys(NEXT_SCROLL).find(k => NEXT_SCROLL[k].done() && !(ST.nextAsked || {})[k] && !(ST.sp && ST.sp[NEXT_SCROLL[k].to]));
    if (!from) return;
    if (from !== ST.cur && !opt.boot) return;
    if (typeof msuOn === 'function' && !msuOn()) return;            // 로그인하지 않았으면 묻지 않음(저장이 안 되므로)
    const N = NEXT_SCROLL[from]; nsBusy = true;
    try {
      ST.nextAsked = ST.nextAsked || {}; ST.nextAsked[from] = true; saveST();
      if (!Z || Z.id !== 'alpha'){ await travelTo({ id: 'scroll-next', to: 'alpha', spawn: [5.5, -4.5] }); }
      else { const sp = [5.5, -4.5]; player.position.set(sp[0], heightAt(sp[0], sp[1]), sp[1]); }
      await new Promise(r => setTimeout(r, 1500));
      const [x, z] = PEDESTALS[N.ped];
      try { startCine('nscroll-' + from, x, heightAt(x, z) + 1.1, z, { dur: 5, r: 7, h: 3 }); } catch (e){}
      toast(`📜 받침대 위에 「${N.what}」이 놓였어요`, 3800);
      await new Promise(r => setTimeout(r, 4200));
      const nx = N.to && SCROLL_LIST.find(s => s.id === N.to);
      document.getElementById('ns-title').textContent = `📜 「${scrollTitle(from)}」를 마쳤어요!`;
      if (!nx){   // 다음 두루마리가 아직 없을 때: 받침대만 보여 주고 닫는다
        document.getElementById('ns-body').textContent = `${N.ped + 1}번째 받침대에 「${N.what}」이 놓였어요.\n\n다음 두루마리는 지금 준비하고 있어요. 열리면 알려 줄게요!`;
        const go0 = document.getElementById('ns-go'); go0.textContent = '확인'; go0.onclick = () => document.querySelector('#next-scroll-modal .close').click();
        openModal('next-scroll-modal'); return;
      }
      document.getElementById('ns-body').textContent = `${N.ped + 1}번째 받침대에 「${N.what}」이 놓였어요.\n\n다음 두루마리 「${nx.title}」(${nx.no}편)을 펼칠까요?`;
      const go = document.getElementById('ns-go'); go.textContent = `📖 ${nx.no}편 펼치기`;
      const hint = () => toast(`나중에 하고 싶을 땐 🧭 「길 떠나기」 스킬로 두루마리마을에 가서 「📚 두루마리 문」을 누르세요. ${nx.no}편의 「펼치기」 버튼이 있어요.`, 6500);
      let picked = false;
      go.onclick = () => { picked = true; document.querySelector('#next-scroll-modal .close').click(); enterScroll(N.to); };
      openModal('next-scroll-modal', () => { if (!picked) hint(); });
    } finally { nsBusy = false; }
  }
