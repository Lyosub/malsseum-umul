  // ══ 📚 두루마리(책) 구조: 「모세와 함께」는 기본으로 들어 있고, 다음 두루마리부터는 따로 된 파일(scrolls/<id>.js)을
  //    그 두루마리를 펼칠 때만 받아요. 진행은 두루마리마다 따로 저장(모세 = ST.ch/step, 나머지 = ST.sp[id]) ══
  const DEV_SCROLL = /[?&]devscroll(=1)?(&|$)/.test(location.search);
  const SCROLL_LIST = [
    { id: 'moses0', no: '1', title: '모세와 함께 · 첫머리 — 물에서 건져낸 아이', file: 'scrolls/moses0.js', num: 0 },
    { id: 'moses', no: '1', title: '모세와 함께', builtin: true, num: 1 },
    { id: 'sinai2', no: '2', title: '시내산의 마지막 한 달', file: 'scrolls/sinai2.js', num: 2, needMoses: true },
    { id: 'wild3', no: '3', title: '광야 40년', file: 'scrolls/wild3.js', num: 3, needScroll: 'sinai2' },
    { id: 'joshua', no: '4', title: '여호수아와 함께', file: 'scrolls/joshua4.js', num: 4, needScroll: 'wild3' },
    { id: 'judges', no: '5', title: '사사들과 함께', file: 'scrolls/judges5.js', num: 5, needScroll: 'joshua' },
    { id: 'ruth', no: '6', title: '룻과 사무엘', file: 'scrolls/ruth6.js', num: 6, needScroll: 'judges' },
    { id: 'saul', no: '7', title: '사울과 다윗', file: 'scrolls/saul7.js', num: 7, needScroll: 'ruth' },
    { id: 'devtest', no: 'T', title: '시험 두루마리', file: 'scrolls/devtest.js', dev: true },
  ];
  const SCROLL_DEFS = { moses: { id: 'moses', chapters: CHAPTERS } };
  ST.cur = ST.cur || 'moses'; ST.sp = ST.sp || {};
  const AP = () => (ST.cur !== 'moses' && SCROLL_DEFS[ST.cur] && ST.sp[ST.cur]) ? ST.sp[ST.cur] : ST;   // 지금 펼친 두루마리의 진행
  const actChapters = () => (ST.cur !== 'moses' && SCROLL_DEFS[ST.cur] && ST.sp[ST.cur] ? SCROLL_DEFS[ST.cur] : SCROLL_DEFS.moses).chapters;
  const scrollTitle = id => (SCROLL_LIST.find(s => s.id === id) || {}).title || id;
  function syncStory(){ const C = actChapters(), P = AP(); STORY = C[P.ch].steps; CHAPTER = C[P.ch]; }
  // 두루마리 파일이 부르는 창구: (window.__odyQ = window.__odyQ || []).push(api => ({ id, chapters, ... }))
  const ODY_API = {
    THREE, ST, ZONES, DLG, RUMORS, QUIZ, KEYS, VERSES, BADGES, CONDS, PROP_DEFS, SPEAKERS: { ME, NAR, GUIDE, MOSES, AARON },
    toast: (...a) => toast(...a), runDialog: (...a) => runDialog(...a), simple: (...a) => simple(...a), heightAt: (x, z) => heightAt(x, z),
    advance: () => advance(), curStep: () => curStep(), saveST: () => saveST(), addMat: (...a) => addMat(...a), loadProps: (...a) => loadProps(...a),
    startCine: (...a) => startCine(...a), mgOpen: (...a) => mgOpen(...a), mgCloseAll: () => mgCloseAll(), recordBest: (...a) => recordBest(...a),
    get Z(){ return Z; }, get zoneRoot(){ return zoneRoot; }, get markers(){ return markers; }, get player(){ return player; }, get propTemplates(){ return propTemplates; },
    get mgArea(){ return mgArea; }, get mgAct(){ return mgAct; }, get toonGradient(){ return toonGradient; },
    setGlory: on => { kadeshNoGlory = !on; if (Z && Z.id === 'kadesh') buildGlory(on); }, addGeneal2: n => addGeneal(n), get TAB(){ return TAB; },
    setRiver: dry => { if (!Z || !Z._water || !Z._waterBox) return; Z._water.visible = !dry; const i = boxes.indexOf(Z._waterBox); if (dry && i >= 0) boxes.splice(i, 1); else if (!dry && i < 0) boxes.push(Z._waterBox); },
    get mg(){ return mg; }, completeTask: q => completeTask(q), addGeneal: n => addGeneal(n), addJudge: n => addJudge(n), get flameTex(){ return flameTex; }, get obstacles(){ return obstacles; }, reachable: (x, z) => reachable(x, z),
  };
  CONDS.moabOpen = () => { const p = ST.sp && ST.sp.wild3; return !!((p && (p.ch >= 10 || p.cleared && p.ch >= 9)) || DEV_SCROLL); };
  CONDS.moabMoses = () => { const p = ST.sp && ST.sp.wild3; return !(p && p.ch >= 15 && p.cleared); };   // 신 34:5 뒤로는 모세가 보이지 않음
  CONDS.gilgalOpen = () => !!((ST.sp && ST.sp.joshua) || DEV_SCROLL);
  CONDS.aiOpen = () => { const p = ST.sp && ST.sp.joshua; return !!((p && p.ch >= 6) || DEV_SCROLL); };   // 4편 7장(수 7:2)부터
  CONDS.gibeonOpen = () => { const p = ST.sp && ST.sp.joshua; return !!((p && p.ch >= 8) || DEV_SCROLL); };   // 4편 9장(수 9:17)부터
  CONDS.hebronOpen = () => { const p = ST.sp && ST.sp.joshua; return !!((p && p.ch >= 10) || DEV_SCROLL); };   // 4편 11장(수 14:13)부터
  CONDS.shilohOpen = () => { const p = ST.sp && ST.sp.joshua; return !!((p && p.ch >= 11) || DEV_SCROLL); };   // 4편 12장(수 18:1)부터
  CONDS.jezreelOpen = () => { const p = ST.sp && ST.sp.judges; return !!((p && p.ch >= 3) || DEV_SCROLL); };   // 5편 4장(삿 4:6 다볼 산)부터
  CONDS.philistiaOpen = () => { const p = ST.sp && ST.sp.judges; return !!((p && p.ch >= 7) || (ST.sp && ST.sp.ruth) || DEV_SCROLL); };   // 5편 8장(삿 13:2 소라)부터, 6편에서도
  CONDS.bethlehemOpen = () => !!((ST.sp && ST.sp.ruth) || DEV_SCROLL);   // 6편을 펼친 뒤부터
  CONDS.gibeahOpen = () => !!((ST.sp && ST.sp.saul) || DEV_SCROLL);   // 7편을 펼친 뒤부터
  CONDS.judahOpen = () => { const p = ST.sp && ST.sp.saul; return !!((p && p.ch >= 11) || DEV_SCROLL); };   // 7편 12장(삼상 22:1 아둘람 굴)부터
  CONDS.kadeshOpen = () => !!((ST.sp && ST.sp.sinai2 && ST.sp.sinai2.cleared) || ST.cur === 'wild3' || DEV_SCROLL);
  const SCROLL_Q = window.__odyQ = window.__odyQ || [];
  function drainScrolls(){ while (SCROLL_Q.length){ const f = SCROLL_Q.shift(); try { const def = f(ODY_API); if (def && def.id) SCROLL_DEFS[def.id] = def; } catch (e){ console.error('두루마리 등록 실패', e); } } }
  SCROLL_Q.push = function(f){ Array.prototype.push.call(this, f); drainScrolls(); return this.length; };
  drainScrolls();
  async function loadScrollBundle(id){
    // 파일로 여는 빌드는 두루마리가 페이지 끝에 들어 있음 — 페이지를 다 읽은 뒤 등록된 것부터 확인
    if (document.readyState === 'loading') await new Promise(r => document.addEventListener('DOMContentLoaded', r, { once: true }));
    drainScrolls();
    return new Promise(ok => {
      if (SCROLL_DEFS[id]) return ok(true);
      const it = SCROLL_LIST.find(s => s.id === id); if (!it || !it.file) return ok(false);
      const src = it.file + (window.__SCROLL_V && window.__SCROLL_V[id] ? '?v=' + window.__SCROLL_V[id] : '');
      let tries = 0;
      const go = () => { const el = document.createElement('script'); el.src = src;
        el.onload = () => { drainScrolls(); ok(!!SCROLL_DEFS[id]); };
        el.onerror = () => { el.remove(); if (++tries < 3) setTimeout(go, 800 * tries); else ok(false); };
        document.head.appendChild(el); };
      go();
    });
  }
  // 두루마리 펼치기: 파일을 받고 → 진행을 그 두루마리로 바꾸고 → 그 두루마리의 지금 단계가 있는 마을로 이동
  async function enterScroll(id, opt = {}){
    const fresh = id !== 'moses' && !SCROLL_DEFS[id];
    if (id !== 'moses' && !(await loadScrollBundle(id))){ if (!opt.boot) toast('📚 두루마리를 불러오지 못했어요. 인터넷 연결을 확인하고 다시 해 보세요', 2800); return false; }
    ST.cur = id; if (id !== 'moses' && !ST.sp[id]) ST.sp[id] = { ch: 0, step: 0, cleared: false, rumor: [] };
    { const P = ST.sp[id], C = id !== 'moses' && SCROLL_DEFS[id] && SCROLL_DEFS[id].chapters; if (P && C && P.cleared && C[P.ch + 1]){ P.ch++; P.step = 0; P.cleared = false; P.rumor = []; } }
    syncStory(); saveST();
    if (opt.boot) return true;
    reachDone = null; renderQuestList(); refreshShow();
    const q = curStep();
    if (q && Z && (q.zone !== Z.id || fresh)){ await travelTo({ id: 'scroll', to: q.zone, spawn: ZONES[q.zone].spawn }); }
    else if (Z) spawnTasks();
    setTimeout(() => toast(`📚 「${scrollTitle(id)}」 두루마리를 펼쳤어요${q ? '\n▶ ' + q.obj : ''}`, 2600), 300);
    return true;
  }
  // 두루마리마을의 두루마리 문: 두루마리 고르기
  ZONES.alpha.points.push({ id: 'scroll_gate', x: 3.5, z: 2.5, type: 'lore', title: '📚 두루마리 문', body: '' });
  function scrollProgress(id){
    if (id === 'moses') return { done: chaptersDone(), total: CHAPTERS.length };
    const d = SCROLL_DEFS[id], p = ST.sp[id]; if (!d || !p) return null;
    return { done: p.ch + (p.cleared ? 1 : 0), total: d.chapters.length };
  }
  function openScrollGate(){
    const rows = SCROLL_LIST.filter(s => !s.dev || DEV_SCROLL).map(s => {
      if (s.soon) return `<div class="dq" style="opacity:.55"><span class="ck">🔒</span><span class="tx">${s.no}. 「${s.title}」 — 준비 중</span></div>`;
      const pr = scrollProgress(s.id), cur = ST.cur === s.id, lock = ((s.needMoses && chaptersDone() < CHAPTERS.length) || (s.needScroll && !(ST.sp[s.needScroll] && ST.sp[s.needScroll].cleared))) && !DEV_SCROLL;
      const st = pr ? (pr.done >= pr.total ? '✅ 완료' : `${pr.done}/${pr.total}장`) : '처음';
      return `<div class="dq"><span class="ck">${cur ? '📖' : '📜'}</span><span class="tx">${s.no}. 「${s.title}」 · ${st}${cur ? ' · 지금 펼친 두루마리' : ''}</span>${cur || lock ? '' : `<button data-scroll="${s.id}" style="padding:5px 8px;border-radius:8px;border:none;background:#ffd27a;color:#2a1d10;font-weight:800">펼치기</button>`}</div>`;
    }).join('');
    document.getElementById('scroll-gate-body').innerHTML = `<div style="font-size:12.5px;opacity:.85;margin-bottom:6px">두루마리마다 진행이 따로 저장돼요. 다른 두루마리를 펼쳤다가 돌아와도 하던 곳에서 이어져요.</div>${rows}<div style="font-size:12px;opacity:.7;margin-top:8px">창세기부터 요한계시록까지, 두루마리가 차례로 이어질 예정이에요.</div>`;
    openModal('scroll-gate-modal');
  }
  document.getElementById('scroll-gate-body').addEventListener('click', e => { const b = e.target.closest('[data-scroll]'); if (!b) return;
    document.querySelectorAll('.modal:not(.hidden) .close').forEach(x => x.click()); enterScroll(b.dataset.scroll); });
  // 처음 켤 때: 지난번에 펼쳐 둔 두루마리 파일을 먼저 받아 둠(마을을 만들기 전에 — 그 두루마리의 사람·자리가 마을에 들어가게)
  function bootScroll(){
    if (ST.cur === 'moses') return Promise.resolve();
    return enterScroll(ST.cur, { boot: true }).then(ok => { if (!ok){ ST.cur = 'moses'; syncStory(); } });
  }
  const titleOk = x => x.need === 'scroll' ? ST.badges.includes('scroll_all') : String(x.need).startsWith('star') ? (ST.stars || 0) >= +String(x.need).slice(4) : chaptersDone() >= x.need;
  function myTitle(){ const own = TITLES.filter(titleOk); const pick = own.find(x => x.t === ST.title); return (pick || own.filter(x => typeof x.need === 'number').pop() || TITLES[0]).t; }
  function checkNewTitle(){
    ST.titlesSeen = ST.titlesSeen || [];
    const fresh = TITLES.filter(x => titleOk(x) && !ST.titlesSeen.includes(x.t));
    if (!fresh.length) return;
    fresh.forEach(x => ST.titlesSeen.push(x.t));
    const top = fresh.filter(x => x.need !== 0).pop();
    if (top){ ST.title = top.t; setTimeout(() => toast(`🏷 새 칭호: 「${top.t}」`, 2600), 2800); if (typeof retrackTitle === 'function') try { retrackTitle(); } catch (e){} }
    saveST();
  }
  // 못 얻은 배지는 이름 대신 힌트만(어디서 무엇을 하면 되는지 살짝)
  const BADGE_HINT = {
    pray_start: '두루마리마을 기념 전시관 앞에서…', companion: '떨기나무 앞, 걱정하는 모세에게…', prayer: '바로 앞에 들어가기 전, 떨리는 모세와…',
    share: '짚을 모아 준 일꾼들과…', trust: '뱀이 된 지팡이 이야기를 들을 때…', true_heart: '우박이 그친 뒤 바로의 모습을 보고…',
    passover_lamb: '문설주에 피를 바른 뒤 궁금한 것을…', bold_step: '바다가 갈라진 순간…', together: '바다를 건널 때 주변을 잘 살펴보면…',
    timbrel: '미리암과 함께 소고를 잘 두드리면…', daily_bread: '만나를 아침까지 남겨 둔 사람에게…', raised_hands: '산 꼭대기에서 손을 들고 난 뒤…', true_leader: '모세와 함께 지도자를 고를 때…', ten_words: '십계명을 한 번도 틀리지 않고…', lords_side: '모세가 진 문에서 부를 때…', willing: '마음에 원하는 만큼 예물을 드리면…', as_commanded: '성막을 거의 틀리지 않고 차례대로 세우면…', wise: '확인 퀴즈를 처음에 모두 맞히면', scroll_all: '숨은 두루마리 20개를 모두 모으면', holy_people: '2편, 밭 모퉁이를 한 번에 남기면…', trumpet_follow: '2편, 은 나팔 소리를 한 번도 틀리지 않으면…', grape_carry: '3편, 포도송이 막대를 한 번도 기울이지 않으면…', with_caleb: '3편, 두 목소리 앞에서 처음부터…', looked_up: '3편, 장대를 쳐다보라고 모두에게 알리면…', refuge_run: '3편, 도피성 성문까지 1분 안에…', hear_israel: '3편, 쉐마를 새길 자리를 찾으면…', red_cord: '4편, 지붕의 삼대를 한 번도 틀리지 않고 덮으면…', twelve_stones: '4편, 기념 돌 열둘을 한 번에 차례대로 놓으면…', seventh_day: '4편, 여리고를 도는 이레 동안 한 번도 틀리지 않으면…',
  };
  function badgeBookHTML(){
    const all = Object.entries(BADGES), n = all.filter(([k]) => ST.badges.includes(k)).length;
    return `<div style="grid-column:1/-1;margin:2px 0 10px"><div style="font-size:13px;opacity:.8">🏅 배지 ${n} / ${all.length}</div><div class="bdg-grid">`
      + all.map(([k, b]) => ST.badges.includes(k) ? `<div class="bdg"><b>${b.ico}</b>${b.name}</div>`
          : `<div class="bdg off"><b>❓</b>???<i>${BADGE_HINT[k] || '이야기 속 어딘가에서…'}</i></div>`).join('') + `</div></div>`;
  }
  const TITLE_ICO = { '두루마리마을 새내기': '📜', '부르심에 응답한 사람': '🔥', '재앙 속에서 믿은 사람': '⚡', '어린양의 피 아래 선 사람': '🐑', '바다를 건넌 믿음의 사람': '🌊', '광야에서 만나를 먹은 사람': '🍞', '손을 들어 이긴 사람': '🙌', '함께 짐을 나눈 사람': '⚖️', '시내산 언약의 사람': '🪨', '여호와의 편에 선 사람': '🙋', '자원하여 드린 사람': '⛺', '말씀을 찾는 탐험가': '🧭' };
  // 칭호 전체: 얻은 칭호는 컬러 배지+이름(누르면 사용), 못 얻은 칭호는 흑백 ❓ · 이름 숨김(얻는 조건만 작게)
  function titleBookHTML(){
    const mine = myTitle(), n = TITLES.filter(titleOk).length;
    return `<div style="grid-column:1/-1;margin:0 0 8px"><div style="font-size:13px;opacity:.8">🏷 칭호 ${n} / ${TITLES.length} · 얻은 칭호를 누르면 그 칭호를 써요</div><div class="bdg-grid">`
      + TITLES.map(x => titleOk(x)
          ? `<button data-title="${x.t}" class="bdg ttl${x.t === mine ? ' on' : ''}"><b>${TITLE_ICO[x.t] || '🏷'}</b>${x.t}${x.t === mine ? '<i>✓ 사용 중</i>' : ''}</button>`
          : `<div class="bdg off ttl-off"><b>❓</b>???<i>${x.need === 'scroll' ? '숨은 두루마리를 모두 모으면' : String(x.need).startsWith('star') ? '지혜 별 ' + String(x.need).slice(4) + '개를 모으면' : x.need + '장을 마치면'}</i></div>`).join('') + `</div></div>`;
  }

  document.addEventListener('click', e => { const b = e.target.closest('button[data-title]'); if (!b) return; ST.title = b.dataset.title; saveST(); retrackTitle(); document.getElementById('btn-book').click(); toast(`🏷 칭호를 「${ST.title}」(으)로 바꿨어요`, 1600); });

  // ══ D-13. 연출 카메라: 큰 장면에서 위아래 검은 띠 + 천천히 돌며 보여 줌 ══
  const cine = { on: false, t: 0, dur: 0, x: 0, y: 0, z: 0, r: 14, h: 6, spin: 0.5, a0: 0, seen: {} };
  function startCine(key, x, y, z, o = {}){
    if ((NOTYPE && key !== 'test') || cine.seen[key]) return; cine.seen[key] = true;
    Object.assign(cine, { on: true, t: 0, dur: o.dur || 5, x, y, z, r: o.r || 14, h: o.h || 6, spin: o.spin ?? 0.5, a0: Math.atan2(camera.position.x - x, camera.position.z - z) });
    document.body.classList.add('cine');
  }
  const _cp = new THREE.Vector3(), _cl = new THREE.Vector3();
  function applyCine(dt){
    if (!cine.on) return;
    cine.t += dt; const T = cine.t, D = cine.dur;
    let k = Math.min(1, T / 0.9, (D - T) / 0.9); k = Math.max(0, k); k = k * k * (3 - 2 * k);
    const a = cine.a0 + cine.spin * (T / D);
    _cp.set(cine.x + Math.sin(a) * cine.r, cine.y + cine.h, cine.z + Math.cos(a) * cine.r);
    camera.position.lerp(_cp, k);
    _cl.set(player.position.x, player.position.y + LOOK_Y, player.position.z).lerp(new THREE.Vector3(cine.x, cine.y + 2, cine.z), k);
    camera.lookAt(_cl);
    if (T >= D){ cine.on = false; document.body.classList.remove('cine'); }
  }
  function updateCineTriggers(){
    if (!Z || cine.on) return;
    if (Z.id === 'midian' && ST.ch === 0 && !ST.cleared){ const b = markers.find(m => m.isBush); if (b && Math.hypot(player.position.x - b.data.x, player.position.z - b.data.z) < 10) startCine('bush', b.data.x, heightAt(b.data.x, b.data.z), b.data.z, { r: 7, h: 3, dur: 4.5, spin: 0.8 }); }
  }

  // 이미 그 단계를 지난 저장에는 스킬을 조용히 줌(업데이트 전에 지나간 학생)
  // 🧭 길 떠나기: 두루마리마을(언제나) · 마친 장의 마을 · 지금 이야기가 있는 마을
  function warpTargets(){
    const q = curStep(), done = chaptersDone(), out = [];
    const exitTo = q && q.exit ? ((ZONES[q.zone].points.find(p => p.id === q.exit) || {}).to) : null;
    const need = { alpha: 0, midian: 1, egypt: 2, redsea: 4, wild: 5, rephidim: 6, sinai: 8, kadesh: 99, moab: 99, gilgal: 99, ai: 99, gibeon: 99, hebron: 99, shiloh: 99, jezreel: 99, philistia: 99, bethlehem: 99, gibeah: 99, judah: 99 };
    for (const z of ['alpha', 'midian', 'egypt', 'redsea', 'wild', 'rephidim', 'sinai', 'kadesh', 'moab', 'gilgal', 'ai', 'gibeon', 'hebron', 'shiloh', 'jezreel', 'philistia', 'bethlehem', 'gibeah', 'judah']){
      const story = q && (q.zone === z || exitTo === z);
      if (z === 'kadesh' && !story && !CONDS.kadeshOpen()) continue;
      if (z === 'moab' && !story && !CONDS.moabOpen()) continue;   // 3편 마을은 2편을 마친 뒤부터 목록에 보임
      if (z === 'gilgal' && !story && !CONDS.gilgalOpen()) continue;   // 4편 마을은 4편을 펼친 뒤부터
      if (z === 'ai' && !story && !CONDS.aiOpen()) continue;   // 아이와 에발 산은 4편 7장부터
      if (z === 'gibeon' && !story && !CONDS.gibeonOpen()) continue;   // 기브온은 4편 9장부터
      if (z === 'hebron' && !story && !CONDS.hebronOpen()) continue;   // 헤브론 산지는 4편 11장부터
      if (z === 'shiloh' && !story && !CONDS.shilohOpen()) continue;   // 실로와 세겜은 4편 12장부터
      if (z === 'jezreel' && !story && !CONDS.jezreelOpen()) continue;   // 이스르엘 골짜기는 5편 4장부터
      if (z === 'philistia' && !story && !CONDS.philistiaOpen()) continue;   // 블레셋 평지는 5편 8장부터
      if (z === 'bethlehem' && !story && !CONDS.bethlehemOpen()) continue;   // 베들레헴은 6편부터
      if (z === 'gibeah' && !story && !CONDS.gibeahOpen()) continue;   // 기브아와 믹마스는 7편부터
      if (z === 'judah' && !story && !CONDS.judahOpen()) continue;   // 유다 광야는 7편 12장부터
      const ok = z === 'alpha' || done >= need[z] || story || (z === 'kadesh' && CONDS.kadeshOpen()) || (z === 'moab' && CONDS.moabOpen()) || (z === 'gilgal' && CONDS.gilgalOpen()) || (z === 'ai' && CONDS.aiOpen()) || (z === 'gibeon' && CONDS.gibeonOpen()) || (z === 'jezreel' && CONDS.jezreelOpen()) || (z === 'philistia' && CONDS.philistiaOpen()) || (z === 'bethlehem' && CONDS.bethlehemOpen()) || (z === 'gibeah' && CONDS.gibeahOpen()) || (z === 'judah' && CONDS.judahOpen()) || (z === 'hebron' && CONDS.hebronOpen()) || (z === 'shiloh' && CONDS.shilohOpen());
      out.push({ z, ok, story, here: Z && Z.id === z, note: z === 'alpha' ? '언제든 갈 수 있어요 · 내 장막' : story ? '📜 지금 이야기가 있는 곳' : ok ? '이야기를 마친 곳' : `🔒 ${need[z]}장을 마치면` });
    }
    return out;
  }
  function openWarp(){
    if (dlgState || traveling || homeEdit || (typeof live !== 'undefined' && live.kind)){ toast('🧭 지금은 이동할 수 없어요', 1400); return; }
    document.getElementById('warp-list').innerHTML = warpTargets().map(t => `<button class="warp-go" data-wz="${t.z}" ${t.ok && !t.here ? '' : 'disabled'}>${ZONES[t.z].name}${t.here ? ' (지금 여기)' : ''}<small>${t.note}</small></button>`).join('');
    openModal('warp-modal');
  }
  document.getElementById('warp-list').addEventListener('click', e => {
    const b = e.target.closest('[data-wz]'); if (!b) return;
    const z = b.dataset.wz, q = curStep();
    document.querySelector('#warp-modal .close').click();
    if (VISIT) endVisit();
    // 이야기가 "출구로 가기" 단계면 그 출구로 간 것처럼 처리(단계가 넘어감)
    const ex = q && q.exit ? ZONES[q.zone].points.find(p => p.id === q.exit) : null;
    if (ex && ex.to === z) travelTo(ex);
    else travelTo({ id: 'warp', to: z, spawn: ZONES[z].spawn });
  });
  function seasonHello(){
    const sz = seasonNow(); if (!sz) return; ST.seasonSeen = ST.seasonSeen || [];
    const key = sz + new Date(Date.now() + 9 * 3600e3).getUTCFullYear(); if (ST.seasonSeen.includes(key)) return;
    ST.seasonSeen.push(key); saveST();
    setTimeout(() => toast(`${SEASONS[sz].n} 이벤트! 🏠 내 장막 꾸미기에서 한정 장식을 무료로 받아요 (${SEASONS[sz].end}까지)`, 3600), 6000);
  }
  function grantPastSkills(){
    seasonHello();
    if (!unlocked.has('warp')){ unlockSkill('warp', true); if (!ST.warpHello){ ST.warpHello = true; saveST(); setTimeout(() => toast('🧭 새 스킬 「이동」: 두루마리마을과 마친 마을로 바로 갈 수 있어요', 3000), 4500); } }
    const past = (ch, id) => ST.ch > ch || (ST.ch === ch && (ST.cleared || ST.step > stepIdx(id)));
    if (past(1, 'c2s5')) unlockSkill('pray', true);
    if (ST.ch > 3 || (ST.ch === 3 && ST.cleared)) unlockSkill('praise', true);
    checkNewTitle();
  }
  function giveReward(r, then){
    if (!r){ then && then(); return; }
    const vs = [].concat(r.verse || []);
    const queue = vs.filter(v => !ST.verses.includes(v));
    if (r.skill) unlockSkill(r.skill);
    const next = () => {
      const v = queue.shift();
      if (!v){ if (r.clear) verseGate(showClear); then && then(); return; }
      ST.verses.push(v); saveST();
      document.getElementById('card-one').innerHTML = cardHTML(v, false);
      openModal('card-modal', next);
    };
    setTimeout(next, r.skill ? 900 : 200);
  }
  // ══ 📜 말씀 관문(2026-10-11 난이도 상향): 장을 마치기 전에 그 장에서 모은 구절 카드로 빈칸 문제 3개.
  //    틀리면 ❤️ 하나, 셋 다 쓰면 새 문제로 처음부터. 구절은 카드에 있는 개역개정 그대로(빈칸만 뚫음). 다시 하기·시험 주소에서는 건너뜀 ══
  function verseGate(done){
    if (REPLAY || DEV_SCROLL || /[?&]nogate(&|$)/.test(location.search)) return done();
    const clean = w => w.replace(/[.,;:!?"'“”‘’()]/g, '');
    let ids = [...new Set(STORY.flatMap(s => [].concat((s.reward && s.reward.verse) || [])))].filter(id => VERSES[id]);
    if (ids.length < 3) ids = [...new Set([...ids, ...ST.verses.slice().reverse().filter(id => VERSES[id])])].slice(0, 3);
    if (!ids.length) return done();
    const allWords = [...new Set(Object.values(VERSES).flatMap(v => v.text.split(/\s+/).map(clean)).filter(w => w.length >= 2))];
    const make = () => { const pick = ids.slice().sort(() => Math.random() - 0.5); while (pick.length < 3) pick.push(ids[Math.floor(Math.random() * ids.length)]);
      return pick.slice(0, 3).map(id => { const v = VERSES[id], ws = v.text.split(/\s+/), cand = ws.map((w, i) => [clean(w), i]).filter(([w]) => w.length >= 2);
        const [ans, at] = cand[Math.floor(Math.random() * cand.length)];
        const wrong = allWords.filter(w => w !== ans && Math.abs(w.length - ans.length) <= 2).sort(() => Math.random() - 0.5).slice(0, 3);
        const shown = ws.map((w, i) => i === at ? w.replace(ans, '＿＿＿') : w).join(' ');
        return { ref: v.ref, shown, ans, opts: [ans, ...wrong].sort(() => Math.random() - 0.5) }; }); };
    let Q = make(), k = 0, life = 3, msg = '', wait = false;
    const hearts = n => '❤️'.repeat(n) + '🤍'.repeat(3 - n), closeBtn = document.getElementById('mg-close');
    mgOpen('📜 말씀 관문', '이번 장을 마치기 전에, 이번 장에서 모은 말씀을 확인해요. 빈칸에 들어갈 말을 골라요. 틀리면 ❤️이 하나 줄고, 다 쓰면 새 문제로 처음부터예요.');
    mgArea.style.height = 'auto'; closeBtn.style.display = 'none';   // 장을 마치는 길이라 중간에 나가지 않게
    const draw = () => { const x = Q[k];
      mgArea.innerHTML = x
        ? `<div style="padding:8px 12px 4px;font-size:12.5px;opacity:.8">${k + 1} / 3 · ${hearts(life)}</div><div style="padding:2px 12px 8px;font-size:14px;line-height:1.6">📜 ${x.shown} <span style="opacity:.75;font-size:12px">(${x.ref})</span></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:0 10px 8px">${x.opts.map((o, i) => `<button data-vg="${i}" style="padding:9px 6px;border-radius:10px;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.08);color:#f5e9d0;font-size:14px">${o}</button>`).join('')}</div><div style="text-align:center;color:#ffd27a;font-weight:800;min-height:18px;padding:0 8px 6px;font-size:12.5px">${msg}</div>`
        : `<div style="padding:16px;text-align:center;color:#ffd27a;font-weight:800">✓ 말씀 관문을 통과했어요</div>`;
      mgAct.textContent = x ? '세 문제를 맞히면 계속' : '장 마치기'; mgAct.disabled = !!x; };
    draw();
    mgArea.onclick = e => { const b = e.target.closest('[data-vg]'); const x = Q[k]; if (!b || !x || wait) return;
      if (x.opts[+b.dataset.vg] === x.ans){ wait = true; msg = '✓ 맞아요'; draw(); setTimeout(() => { wait = false; msg = ''; k++; draw(); }, 700); return; }
      if (--life <= 0){ Q = make(); k = 0; life = 3; msg = '❤️을 다 썼어요 — 새 문제로 처음부터'; } else msg = '다시 생각해 봐요';
      draw(); };
    mgAct.onclick = () => { if (Q[k]) return; mgArea.onclick = null; mgArea.style.height = ''; closeBtn.style.display = ''; mgCloseAll(); done(); };
  }
  const cardHTML = (id, locked) => { const v = VERSES[id]; return `<div class="vcard${locked ? ' locked' : ''}" style="background-image:url('${A('ui/game/verse-card.jpg')}')"><div class="ref">${v.ref}</div><div>${locked ? '아직 모으지 못한 구절' : v.text}</div><div class="chk">개역개정</div></div>`; };
  // 곡: title(처음 테마) · village(두루마리마을) · midian(미디안 광야) · egypt(애굽 고센) · palace(바로의 궁전 알현실)
  const BGM = { on: (() => { try { return localStorage.getItem('inodyssey-bgm') !== 'off'; } catch (e){ return true; } })(), ctx: null, src: null, gain: null, bufs: {}, cur: null, want: 'title', starting: false, titleUntil: 0 };
  const ZONE_BGM = { alpha: 'village', midian: 'midian', egypt: 'egypt', redsea: 'redsea', wild: 'midian', rephidim: 'midian', sinai: 'midian', kadesh: 'midian', moab: 'midian', gilgal: 'midian', ai: 'midian', jezreel: 'midian', philistia: 'midian', bethlehem: 'midian', gibeah: 'midian', judah: 'midian' };
  function bgmWanted(){
    if (performance.now() < BGM.titleUntil) return 'title';                      // 시작할 때 테마를 한 바퀴
    if (Z && Z.room && inRoom(player.position.x, player.position.z)) return 'palace';
    if ((Z && Z.id === 'sinai' && stormObj) || (Z && Z.id === 'rephidim' && battleObj)) return 'redsea';
    if (Z && Z.id === 'redsea' && ST.ch >= 3 && (ST.ch > 3 || ST.cleared || ST.step >= stepIdx('c4s10'))) return 'praise';
    return (Z && ZONE_BGM[Z.id]) || 'village';
  }
  async function bgmLoad(name){
    if (!BGM.bufs[name]) BGM.bufs[name] = fetchBytes(`audio/bgm-${name}.mp3`).then(b => BGM.ctx.decodeAudioData(b.slice(0)));
    return BGM.bufs[name];
  }
  async function bgmStart(){
    if (!BGM.on || BGM.starting) return;
    const name = bgmWanted(); if (BGM.src && BGM.cur === name) return;
    BGM.starting = true;
    try {
      BGM.ctx = BGM.ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (BGM.ctx.state === 'suspended') await BGM.ctx.resume();
      const buf = await bgmLoad(name);
      if (!BGM.on || bgmWanted() !== name){ BGM.starting = false; return; }
      const now = BGM.ctx.currentTime;
      if (BGM.src){ const s0 = BGM.src, g0 = BGM.gain; g0.gain.cancelScheduledValues(now); g0.gain.setValueAtTime(g0.gain.value, now); g0.gain.linearRampToValueAtTime(0, now + 2); setTimeout(() => { try { s0.stop(); } catch (e){} }, 2100); }
      const src = BGM.ctx.createBufferSource(), g = BGM.ctx.createGain(); src.buffer = buf; src.loop = true;
      g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(name === 'title' ? 0.5 : 0.4, now + 2.2);
      src.connect(g).connect(BGM.ctx.destination); src.start(); BGM.src = src; BGM.gain = g; BGM.cur = name;
    } catch (e){ console.warn('배경음악', e); }
    BGM.starting = false;
  }
  function bgmStop(){ if (BGM.src){ try { BGM.gain.gain.linearRampToValueAtTime(0, BGM.ctx.currentTime + 0.4); const s0 = BGM.src; setTimeout(() => { try { s0.stop(); } catch (e){} }, 450); } catch (e){} BGM.src = null; BGM.cur = null; } }
  let bgmTick = 0;
  function updateBgm(dt){ bgmTick += dt; if (bgmTick < 0.5) return; bgmTick = 0; if (BGM.on && BGM.ctx && BGM.cur !== bgmWanted()) bgmStart(); }
  ['pointerdown', 'keydown'].forEach(ev => window.addEventListener(ev, () => bgmStart(), { passive: true }));
  document.addEventListener('visibilitychange', () => { if (!BGM.ctx) return; if (document.hidden) BGM.ctx.suspend().catch(() => {}); else if (BGM.on) BGM.ctx.resume().catch(() => {}); });   // 아이폰에서 소리 장치를 못 켜면 그냥 넘어감(10/11 오류)
  function setQuality(level, mode){
    const prevShadow = Q.shadow, prevSoft = Q.soft;
    qLevel = level; qMode = mode; Q = QUALITY[level];
    try { localStorage.setItem(QKEY, JSON.stringify({ mode: qMode, level: qLevel })); } catch (e){}
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, Q.pr)); renderer.setSize(window.innerWidth, window.innerHeight);
    if (prevShadow !== Q.shadow || prevSoft !== Q.soft){
      sun.castShadow = Q.shadow; renderer.shadowMap.type = Q.soft ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap; renderer.shadowMap.needsUpdate = true;
      scene.traverse(o => { if (o.material){ (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.needsUpdate = true); } });
    }
    renderQualityUI();
  }
  function renderQualityUI(){
    document.querySelectorAll('#quality-opts button').forEach(b => b.classList.toggle('on', b.dataset.q === qMode));
    document.getElementById('quality-now').textContent = qMode === 'auto' ? `자동 — 지금 ${Q.name}` : Q.name;
    const tg = document.getElementById('bgm-toggle'); tg.textContent = BGM.on ? '켜짐' : '꺼짐'; tg.classList.toggle('off', !BGM.on);
  }
  document.getElementById('btn-set').onclick = () => { renderQualityUI(); openModal('set-modal'); };
  document.getElementById('bgm-toggle').onclick = () => {
    BGM.on = !BGM.on; try { localStorage.setItem('inodyssey-bgm', BGM.on ? 'on' : 'off'); } catch (e){}
    if (BGM.on) bgmStart(); else bgmStop(); renderQualityUI();
  };
  // 가로 화면 고정: 말씀우물 앱은 세로로 고정돼 있어서(앱 설정) 폰을 돌려도 화면이 안 돌아감
  // → 전체화면으로 바꾼 뒤 가로로 고정(안드로이드 크롬·말씀우물 앱). 손가락을 댈 때(사용자 동작)만 허용됨
  const isPortraitPhone = () => matchMedia('(orientation: portrait) and (max-width: 560px) and (pointer: coarse)').matches;
  async function goLandscape(){
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
      if (screen.orientation && screen.orientation.lock) await screen.orientation.lock('landscape');
      return true;
    } catch (e){ return false; }
  }
  document.getElementById('btn-landscape').addEventListener('click', async () => {
    const ok = await goLandscape();
    if (!ok || isPortraitPhone()) setTimeout(() => { const b = document.getElementById('btn-landscape'); if (b && isPortraitPhone()) b.outerHTML = '<div style="font-size:13px;opacity:.85;line-height:1.6;max-width:300px">이 기기에서는 자동으로 돌릴 수 없어요.<br>인터넷 앱(크롬·사파리)에서 <b>logoswell.kr/odyssey</b> 를 열고<br>화면 자동 회전을 켠 뒤 폰을 돌려 주세요.</div>'; }, 1600);
  });
  window.addEventListener('pointerdown', () => { if (isPortraitPhone()) goLandscape(); }, { capture: true });
  function leaveLandscape(){ try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); if (document.fullscreenElement) document.exitFullscreen(); } catch (e){} }
  // 저장하고 나가기: 진행·장착은 이미 저장되지만 한 번 더 확실히 저장하고 말씀우물 놀이터로
  document.getElementById('btn-save-exit').onclick = () => {
    saveST(); try { saveLocal(); } catch (e){}
    bgmStop(); toast('💾 저장했어요! 다음에 이어서 할 수 있어요', 1600);
    if (!window.__ASSETS && location.protocol !== 'file:') setTimeout(() => { leaveLandscape(); location.href = MSU_BASE + 'play.html'; }, 900);
  };
  document.querySelectorAll('#quality-opts button').forEach(b => b.onclick = () => {
    const q = b.dataset.q;
    if (q === 'auto'){ autoQ.done = false; autoQ.t = 0; autoQ.frames = 0; setQuality('high', 'auto'); }
    else setQuality(q, q);
  });
  // 자동: 마을이 다 준비된 뒤 4초 동안 평균 fps를 재서 40 아래면 한 단계 낮춤(낮춘 뒤 다시 잼). 올리지는 않음.
  const autoQ = { done: qMode !== 'auto', t: 0, frames: 0, wait: 3 };
  function updateAutoQuality(rawDt){
    if (autoQ.done || traveling || !window.__ready) return;
    if (markers.some(m => m.pending)) { autoQ.t = 0; autoQ.frames = 0; return; }   // 마을 사람 받는 중엔 재지 않음
    if (autoQ.wait > 0){ autoQ.wait -= rawDt; return; }
    autoQ.t += rawDt; autoQ.frames++;
    if (autoQ.t < 4) return;
    const fps = autoQ.frames / autoQ.t; autoQ.t = 0; autoQ.frames = 0; autoQ.wait = 2;
    if (fps >= 40 || qLevel === 'low'){ autoQ.done = true; return; }
    setQuality(qLevel === 'high' ? 'mid' : 'low', 'auto');
    toast(`⚙️ 부드럽게 움직이도록 ${Q.name}로 맞췄어요 (설정에서 바꿀 수 있어요)`, 2600);
  }
  // ══ 두루마리마을 조작 연습(처음 시작할 때 한 번) ══════════════════
  // 걷기 → 달리기 → 점프 → 둘러보기 → 확대·축소 → 안내자에게 말 걸기. 해내면 다음으로 넘어가고, 건너뛸 수도 있다.
  // 이 동안 다른 마을(미디안·애굽) 파일을 뒤에서 미리 받아 두어, 나중에 마을을 옮길 때 기다리지 않게 한다.
  const TUT_KEY = 'inodyssey-tutorial';
  const TOUCH = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const TUT = [
    { k: '걷기', t: TOUCH ? '왼쪽 아래를 누른 채 밀어서 걸어 보세요(누른 자리에 조이스틱이 생겨요)' : 'W A S D (또는 방향키)로 걸어 보세요', need: 4, glow: 'joystick-zone' },
    { k: '달리기', t: TOUCH ? '오른쪽 아래 「달리기」를 누른 채로 움직여 보세요 — 초록 고리가 체력이에요' : 'Shift를 누른 채로 움직여 달려 보세요 — 초록 고리가 체력이에요', need: 1.5, glow: 'run-btn' },
    { k: '점프', t: TOUCH ? '「점프」를 눌러 뛰어 보세요 — 낮은 담·상자 앞에서 누르면 넘어가거나 올라서요' : '스페이스바로 뛰어 보세요 — 낮은 담·상자 앞에서 누르면 넘어가거나 올라서요', need: 2, glow: 'jump-btn' },
    { k: '둘러보기', t: TOUCH ? '화면 빈 곳을 손가락으로 끌어서 주변을 둘러보세요' : '화면을 마우스로 끌어서(또는 Q·E) 주변을 둘러보세요', need: 2.2 },
    { k: '가까이·멀리', t: TOUCH ? '두 손가락으로 화면을 벌리거나 오므려서 가까이·멀리 보세요' : '＋ − 버튼이나 마우스 휠로 가까이·멀리 보세요', need: 0.35, glow: TOUCH ? null : 'zoom-ctrl' },
    { k: '메뉴', t: '오른쪽 위 ☰ 메뉴를 눌러 보세요 — 구절 수집첩·대화 기록·상점·설정이 들어 있어요. 다른 곳을 누르면 접혀요', need: 1, glow: 'btn-menu' },
    { k: '상점', t: '☰ 메뉴에서 「🛍️ 상점·꾸미기」를 열어 보세요 — 말씀우물 달란트로 지팡이·동물 친구를 사고, 「꾸미기」에서 머리 모양도 바꿀 수 있어요', need: 1, glow: 'btn-menu' },
    { k: '퀘스트 보기', t: '왼쪽 위 퀘스트 줄을 눌러 보세요 — 어디로 가야 하는지 자세한 안내가 펼쳐져요', need: 1, glow: 'quest-panel' },
    { k: '말 걸기', t: '이제 분수 광장의 안내자에게 가까이 가서 「대화하기」를 눌러 보세요', need: 1 },
  ];
  const tut = { on: false, i: 0, v: 0, lastX: 0, lastZ: 0, lastYaw: 0, lastZoom: 1, jumps: 0, prefetched: false };
  const tutEl = document.getElementById('tut');
  function tutStart(){
    if (/[?&](notut|notype)(&|$)/.test(location.search)) return;            // 자동 테스트에서는 끔
    let done = false; try { done = localStorage.getItem(TUT_KEY) === 'done'; } catch (e){}
    if (done || ST.ch !== 0 || ST.step !== 0 || !Z || Z.id !== 'alpha') return;
    tut.on = true; tut.i = 0; document.getElementById('hint').style.display = 'none'; tutShow();
  }
  function tutShow(){
    const st = TUT[tut.i]; tut.v = 0; if (st.k === '메뉴') tut.menuOpened = false; if (st.k === '퀘스트 보기') tut.questTapped = false; if (st.k === '상점') tut.shopOpened = false;
    tut.lastX = player.position.x; tut.lastZ = player.position.z; tut.lastYaw = camYaw; tut.lastZoom = zoomTarget; tut.jumps = 0;
    tutEl.classList.remove('hidden', 'done');
    document.getElementById('tut-k').textContent = `조작 연습 ${tut.i + 1} / ${TUT.length} · ${st.k}`;
    document.getElementById('tut-t').textContent = st.t;
    document.getElementById('tut-n').textContent = '🎒 다음 마을을 준비하는 중이에요';
    document.getElementById('tut-bar').style.width = '0%';
    document.querySelectorAll('.tut-glow').forEach(e => e.classList.remove('tut-glow'));
    if (st.glow){ const g = document.getElementById(st.glow); if (g) g.classList.add('tut-glow'); }
  }
  function tutEnd(){
    tut.on = false; tutEl.classList.add('hidden');
    document.querySelectorAll('.tut-glow').forEach(e => e.classList.remove('tut-glow'));
    try { localStorage.setItem(TUT_KEY, 'done'); } catch (e){}
    try { if (msuOn()) MSU.client.rpc('log_odyssey_step', { p_ch: 0, p_step: 'tutorial', p_secs: Math.round(performance.now() / 1000), p_dev: DEV }).then(() => {}, () => {}); } catch (e){}
  }
  document.getElementById('tut-skip').onclick = () => { tutEnd(); toast('언제든 ⚙️ 설정에서 화질을 바꿀 수 있어요', 2200); };
  function updateTutorial(dt, running){
    if (!tut.on) return;
    const modalOpen = !!document.querySelector('.modal:not(.hidden)');
    if (dlgState || modalOpen){ tutEl.style.opacity = '0'; } else tutEl.style.opacity = '1';
    if (modalOpen && TUT[tut.i] && TUT[tut.i].k === '상점') return;   // 상점을 다 둘러보고 닫으면 넘어감
    const st = TUT[tut.i]; if (tut.advancing) return;
    switch (tut.i){
      case 0: tut.v += Math.hypot(player.position.x - tut.lastX, player.position.z - tut.lastZ); break;
      case 1: if (running) tut.v += dt; break;
      case 2: tut.v = tut.jumps; break;
      case 3: { let d = camYaw - tut.lastYaw; tut.v += Math.abs(d); break; }
      case 4: tut.v += Math.abs(zoomTarget - tut.lastZoom); break;
      case 5: tut.v = tut.menuOpened ? 1 : 0; break;
      case 6: tut.v = tut.shopOpened ? 1 : 0; break;
      case 7: tut.v = tut.questTapped ? 1 : 0; break;
      case 8: tut.v = ST.step > 0 ? 1 : 0; break;
    }
    tut.lastX = player.position.x; tut.lastZ = player.position.z; tut.lastYaw = camYaw; tut.lastZoom = zoomTarget;
    document.getElementById('tut-bar').style.width = Math.min(100, 100 * tut.v / st.need) + '%';
    if (tut.v >= st.need){
      tut.advancing = true; tutEl.classList.add('done');
      document.getElementById('tut-t').textContent = tut.i === TUT.length - 1 ? '잘했어요! 이제 모험을 시작해요 🎉' : '좋아요! ✓';
      setTimeout(() => { tut.advancing = false; tut.i++; if (tut.i >= TUT.length){ tutEnd(); toast('📖 수집첩 · 💬 대화 기록 · 🛍️ 상점 · ⚙️ 설정은 오른쪽 위 ☰ 메뉴에 있어요', 3400); } else tutShow(); }, tut.i === TUT.length - 1 ? 1400 : 900);
    }
    if (prefetchState.total){ document.getElementById('tut-n').textContent = prefetchState.done >= prefetchState.total ? '🎒 다음 마을 준비 완료' : `🎒 다음 마을 준비 중 ${Math.round(100 * prefetchState.done / prefetchState.total)}%`; }
  }
  // 시작하자마자 다른 마을들을 차례로 미리 받기(가까운 마을부터, 필수 파일 → 마을 사람 순)
  const prefetchState = { total: 0, done: 0 };
  async function prefetchAll(){
    if (window.__ASSETS){ prefetchState.total = prefetchState.done = 1; return; }   // 파일 하나짜리 미리보기는 이미 다 들어 있음
    const SEQ = ['alpha', 'midian', 'egypt', 'redsea', 'wild', 'rephidim', 'sinai', 'kadesh', 'moab', 'gilgal', 'ai'], si = SEQ.indexOf(Z.id), cq = curStep();
    const order = [...new Set([cq && cq.zone, SEQ[si + 1], SEQ[si - 1], 'alpha'].filter(z => z && z !== Z.id && ZONES[z]))].slice(0, 3);   // 다음 퀘스트 마을부터
    const todo = order.filter(z => !prefetched.has(z)).map(z => { prefetched.add(z); const a = zoneAssets(z); return [...a.files, ...a.lazy]; });
    const files = [...new Set(todo.flat())].filter(f => !bytesCache.has(f));
    prefetchState.total = files.length;   // 전체 개수를 먼저 정해 두어 %가 거꾸로 가지 않게
    for (const f of files){ try { await fetchBytes(f); } catch (e){} prefetchState.done++; }
  }
  // ══ 두루마리 상점 — 말씀우물 달란트로 사고(서버), 장착은 이 기기에 기억 ══════════════
  // 게임이 말씀우물 사이트 안(/odyssey/)에 있을 때는 사이트 로그인을 그대로 쓴다. 파일 하나짜리 미리보기에선 로그인 없음.
  // ?shopmock : 로그인 없이 화면·장착을 확인하는 연습 모드(가짜 달란트 200, 이 기기에만 저장).
  const SHOP = {
    'staff-shepherd': { cat: 'staff', name: '목자 지팡이',     src: 'shop3d/staff-shepherd.glb', h: 1.5 },
    'staff-budding':  { cat: 'staff', name: '싹 난 지팡이',     src: 'shop3d/staff-budding.glb',  h: 1.5, note: '아론의 지팡이(민 17:8)' },
    'staff-forked':   { cat: 'staff', name: '갈래 지팡이',     src: 'shop3d/staff-forked.glb',   h: 1.5 },
    'staff-birch':    { cat: 'staff', name: '자작나무 지팡이', src: 'shop3d/staff-birch.glb',    h: 1.5 },
    'pet-donkey':     { cat: 'pet',   name: '나귀',            src: 'shop3d/pet-donkey.glb',     h: 1.05 },
    'pet-dove':       { cat: 'pet',   name: '비둘기',          src: 'shop3d/pet-dove.glb',       h: 0.5, fly: true },
    'pet-puppy':      { cat: 'pet',   name: '강아지',          src: 'shop3d/pet-puppy.glb',      h: 0.75 },
  };
  const MSU_BASE = '../';   // 게임 위치: 말씀우물 사이트의 /odyssey/ 폴더
  const SHOP_MOCK = /[?&]shopmock(&|$)/.test(location.search);
  const MSU = { client: null, session: null, balance: null, items: null, ready: false };
  let shopCat = 'staff';
  const equip = (() => { try { return JSON.parse(localStorage.getItem('inodyssey-equip') || '{}'); } catch (e){ return {}; } })();
  let owned = new Set((() => { try { return JSON.parse(localStorage.getItem('inodyssey-owned') || '[]'); } catch (e){ return []; } })());
  const saveLocal = () => { try { localStorage.setItem('inodyssey-equip', JSON.stringify(equip)); localStorage.setItem('inodyssey-owned', JSON.stringify([...owned])); } catch (e){} try { queueCloud(); } catch (e){} };
  const loadScript = src => new Promise((res, rej) => { const e = document.createElement('script'); e.src = src; e.onload = res; e.onerror = rej; document.head.appendChild(e); });
  async function msuInit(){ try { await msuInit0(); } finally { MSU.ready = true; } }   // 로그인 여부 확인이 끝났다는 표시(로그인 안내 창이 확인 전에 뜨지 않게)
  async function msuInit0(){
    if (SHOP_MOCK){ MSU.balance = +(localStorage.getItem('inodyssey-mockbal') || 200); return; }
    if (window.__ASSETS || location.protocol === 'file:') return;           // 미리보기(파일 하나)에서는 연동 안 함
    try {
      if (!window.SUPABASE_URL) await loadScript(MSU_BASE + 'assets/supabase-config.js');
      if (!window.supabase) await loadScript(MSU_BASE + 'assets/vendor/supabase-js.js');
      const opts = localStorage.getItem('msu_keep_logged_in') === '0' ? { auth: { storage: window.sessionStorage } } : {};
      MSU.client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY, opts);
      MSU.session = (await MSU.client.auth.getSession()).data.session;
      if (MSU.session){ await shopRefresh(); await cloudInit(); claimClearedChapters(); }
    } catch (e){ console.warn('말씀우물 연결 실패', e); MSU.client = null; }
  }
  // 로그인한 사람이 게임에 들어올 때마다 하루 한 번(한국 시간 날짜별) 접속 기록 — 일일 점검의 「오늘 접속한 사람 수」용(서버가 같은 날 중복은 무시)
  function logVisit(){ try { if (!MSU.client || !MSU.session) return; const k = new Date(Date.now() + 9 * 3600e3).toISOString().slice(2, 10).replace(/-/g, ''); MSU.client.rpc('log_odyssey_step', { p_ch: 0, p_step: 'v' + k, p_secs: 0, p_dev: DEV }).then(() => {}, () => {}); } catch (e){} }
  async function shopRefresh(){
    if (SHOP_MOCK){ return; }
    if (!MSU.client || !MSU.session) return;
    const { data, error } = await MSU.client.rpc('get_odyssey_shop');
    if (error) throw error;
    MSU.items = data; MSU.balance = data.length ? data[0].balance : null;
    owned = new Set(data.filter(r => r.owned).map(r => r.game_key)); saveLocal();
    for (const c of ['staff', 'pet', 'robe', 'shoes', 'head']) if (equip[c] && !owned.has(equip[c])){ equip[c] = null; }   // 산 적 없는 장착은 해제
    applyEquip();
  }
  const eul = w => { const c = w.charCodeAt(w.length - 1) - 0xac00; return w + (c >= 0 && c < 11172 && c % 28 ? '을' : '를'); };   // 받침에 맞춰 을/를
  const itemCost = k => (MSU.items && (MSU.items.find(r => r.game_key === k) || {}).cost) || (k.startsWith('hair-') ? 40 : ({ staff: 30, pet: 50, outfit: 80 })[SHOP[k] ? SHOP[k].cat : 'outfit']);
  function renderShop(msg){
    const bal = document.getElementById('shop-bal');
    const loggedIn = SHOP_MOCK || (MSU.client && MSU.session);
    if (loggedIn) bal.innerHTML = `내 달란트 <b>${MSU.balance ?? '…'}</b> · 말씀우물 달란트로 사요${SHOP_MOCK ? ' (연습 모드)' : ''}`;
    else if (MSU.client) bal.innerHTML = `말씀우물에 로그인하면 달란트로 살 수 있어요 — <a href="${MSU_BASE}login.html?next=/odyssey/">로그인하기</a>`;
    else bal.innerHTML = '말씀우물 사이트에서 게임을 열면 달란트로 살 수 있어요. (지금은 미리보기)';
    document.querySelectorAll('#shop-tabs button').forEach(b => b.classList.toggle('on', b.dataset.c === shopCat));
    const grid = document.getElementById('shop-grid');
    if (shopCat === 'look'){
      const body = CHAR.body || 'boy', hair = CHAR.hair || HAIR_DEFAULT[body];
      grid.innerHTML = `<div class="look-row">몸</div>` + ['boy', 'girl'].map(b => `<button class="look-btn${CHAR.body === b ? ' on' : ''}" data-body="${b}">${b === 'boy' ? '🧑 남학생' : '👧 여학생'}</button>`).join('')
        + `<div class="look-row">머리 모양 — 기본 2가지는 무료</div>` + HAIRS.map(([k, n, ok]) => { const free = HAIR_FREE.includes(k), have = free || owned.has('hair-' + k);
          const tag = !ok ? ' · 곧' : have ? '' : ` · 💰${itemCost('hair-' + k)}`;
          return `<button class="look-btn${CHAR.body && hair === k ? ' on' : ''}" data-hair="${k}" ${ok && CHAR.body ? '' : 'disabled'}>${n}${tag}</button>`; }).join('')
        + (CHAR.body ? '' : `<div class="look-row" style="font-weight:400;opacity:.8">먼저 남학생·여학생을 골라 주세요.</div>`);
    } else if (shopCat === 'outfit'){ grid.innerHTML = '<div style="grid-column:1/-1;font-size:13px;line-height:1.7;opacity:.85">👕 겉옷·띠 · 신발 · 머리장식은 상점에서 팔지 않아요!<br>재료를 모아 두루마리마을 <b>🔨 브살렐의 공방</b>에서 직접 만들어요. (지팡이도 공방에서만 만드는 종류가 따로 있어요)</div>'; }
    else grid.innerHTML = Object.entries(SHOP).filter(([, it]) => it.cat === shopCat && !it.craft).map(([k, it]) => {
      const have = owned.has(k), on = equip[it.cat] === k;
      const btn = !have ? `<button data-buy="${k}" ${loggedIn ? '' : 'disabled'}>사기</button>`
        : on ? `<button class="off" data-off="${it.cat}">빼기</button>` : `<button class="eq" data-eq="${k}">장착하기</button>`;
      return `<div class="shop-card"><img src="${A('ui/game/shop-' + k + '.jpg')}" alt=""><div class="nm">${it.name}</div><div class="pr">${have ? (on ? '✓ 장착 중' : '가지고 있음') : '💰 ' + itemCost(k) + ' 달란트'}</div>${btn}</div>`;
    }).join('');
    document.getElementById('shop-msg').textContent = msg || '';
  }
  async function openShop(){
    if (typeof tut !== 'undefined') tut.shopOpened = true;
    shopCat = 'staff'; renderShop('불러오는 중…'); openModal('shop-modal');
    try { await shopRefresh(); renderShop(); } catch (e){ renderShop('상점 정보를 불러오지 못했어요. 잠시 뒤 다시 열어 주세요.'); }
  }
  document.getElementById('btn-shop').onclick = openShop;
  const hudMenu = document.getElementById('hud-menu');
  document.getElementById('btn-menu').onclick = e => { e.stopPropagation(); hudMenu.classList.toggle('hidden'); if (!hudMenu.classList.contains('hidden')) tut.menuOpened = true; };
  hudMenu.addEventListener('click', () => hudMenu.classList.add('hidden'));               // 하나 고르면 접힘
  document.addEventListener('pointerdown', e => { if (!e.target.closest('#hud-btns')) hudMenu.classList.add('hidden'); });   // 다른 곳을 누르면 접힘
  document.getElementById('shop-tabs').onclick = e => { const b = e.target.closest('button'); if (b){ shopCat = b.dataset.c; renderShop(); } };
  let buying = false;
  // 머리 모양 목록: [키, 이름, 3D 준비됨]
  const HAIR_FREE = ['boy-default', 'girl-long'];   // 나머지는 40달란트(말씀우물 상점 game_key 'hair-…')
  const HAIRS = [['boy-default', '곱슬 짧은 머리', true], ['girl-long', '긴 생머리', true], ['boy-sports', '스포츠머리', false], ['boy-side', '옆가르마', false],
    ['boy-bangs', '덮머리', false], ['girl-ponytail', '포니테일', false], ['girl-bob', '단발', false], ['girl-braid', '땋은 머리', false]];
  function saveChar(){ try { localStorage.setItem('inodyssey-char', JSON.stringify({ body: CHAR.body, hair: CHAR.hair })); } catch (e){} try { queueCloud(); } catch (e){} }
  function changeBody(b){   // 몸을 바꾸면 새로 불러와야 해서 잠깐 다시 시작(진행 상황은 저장돼 있음)
    CHAR.body = b; CHAR.hair = HAIR_DEFAULT[b]; saveChar();
    const u = new URL(location.href); u.searchParams.delete('body'); u.searchParams.delete('hair'); u.searchParams.delete('reset'); location.href = u.toString();
  }
  document.querySelectorAll('.pick-b').forEach(b => b.onclick = () => changeBody(b.dataset.b));
  function maybePickCharacter(){   // 처음 시작(저장 없음)이면 남·여를 먼저 고름
    let has = false; try { has = !!localStorage.getItem('inodyssey-char'); } catch (e){}
    if (!has && !CHAR.body && !/[?&](notut|notype)(&|$)/.test(location.search) && ST.ch === 0 && ST.step === 0){ document.getElementById('pick-modal').classList.remove('hidden'); return true; }
    return false;
  }
  document.getElementById('shop-grid').onclick = async e => {
    const b = e.target.closest('button'); if (!b || buying) return;
    if (b.dataset.body){ if (b.dataset.body !== CHAR.body){ renderShop('캐릭터를 바꾸는 중…'); changeBody(b.dataset.body); } return; }
    if (b.dataset.hair && !HAIR_FREE.includes(b.dataset.hair) && !owned.has('hair-' + b.dataset.hair)){
      const key = 'hair-' + b.dataset.hair, nm = (HAIRS.find(h => h[0] === b.dataset.hair) || [])[1], cost = itemCost(key);
      if (!(SHOP_MOCK || (MSU.client && MSU.session))){ renderShop('말씀우물에 로그인하면 달란트로 살 수 있어요.'); return; }
      if (MSU.balance != null && MSU.balance < cost){ renderShop(`달란트가 ${cost - MSU.balance} 모자라요.`); return; }
      if (!confirm(`${eul(nm)} ${cost}달란트로 살까요?`)) return;
      buying = true; renderShop('사는 중…');
      try {
        if (SHOP_MOCK){ MSU.balance -= cost; try { localStorage.setItem('inodyssey-mockbal', MSU.balance); } catch (e){} }
        else { const { data, error } = await MSU.client.rpc('buy_odyssey_item', { p_key: key }); if (error) throw error; MSU.balance = data; }
        owned.add(key); saveLocal();
      } catch (err){ buying = false; renderShop('사지 못했어요: ' + ((err && err.message) || '다시 시도해 주세요')); return; }
      buying = false;
    }
    if (b.dataset.hair){ CHAR.hair = b.dataset.hair; saveChar(); const m = player.children.find(o => o.getObjectByName && o.getObjectByName('Head')); if (m) await attachHair(m, CHAR.hair); renderShop('머리 모양을 바꿨어요!'); return; }
    if (b.dataset.eq){ const it = SHOP[b.dataset.eq]; equip[it.cat] = b.dataset.eq; saveLocal(); applyEquip(); renderShop(`${eul(it.name)} 장착했어요!`); return; }
    if (b.dataset.off){ equip[b.dataset.off] = null; saveLocal(); applyEquip(); renderShop(); return; }
    const k = b.dataset.buy; if (!k) return;
    const it = SHOP[k], cost = itemCost(k);
    if (MSU.balance != null && MSU.balance < cost){ renderShop(`달란트가 ${cost - MSU.balance} 모자라요. 출석·퀴즈·말씀 기록으로 모아 보세요!`); return; }
    if (!confirm(`${eul(it.name)} ${cost}달란트로 살까요?`)) return;
    buying = true; renderShop('사는 중…');
    try {
      if (SHOP_MOCK){ MSU.balance -= cost; try { localStorage.setItem('inodyssey-mockbal', MSU.balance); } catch (e){} }
      else { const { data, error } = await MSU.client.rpc('buy_odyssey_item', { p_key: k }); if (error) throw error; MSU.balance = data; }
      owned.add(k); equip[it.cat] = k; saveLocal(); applyEquip();
      renderShop(`🎉 ${eul(it.name)} 샀어요! 바로 장착했어요.`);
    } catch (err){ renderShop('사지 못했어요: ' + ((err && err.message) || '다시 시도해 주세요')); try { await shopRefresh(); } catch (e){} }
    buying = false;
  };
  // 장 완료 달란트(계정당 장마다 한 번) — 로그인 전에 깬 장도 로그인하면 받음
  async function claimChapter(ch){
    if (SHOP_MOCK || !MSU.client || !MSU.session) return 0;
    try { await flushCloud(); const { data, error } = await MSU.client.rpc('claim_odyssey_chapter', { p_ch: ch }); if (error) throw error; if (data > 0){ MSU.balance = (MSU.balance || 0) + data; toast(`💰 ${ch}장 완료 보상 ${data}달란트를 받았어요!`, 3000); } return data > 0 ? data : 0; } catch (e){ return 0; }
  }
  async function claimScrollChapter(num, ch){
    if (SHOP_MOCK || !MSU.client || !MSU.session) return 0;
    try { await flushCloud(); const { data, error } = await MSU.client.rpc('claim_odyssey_scroll_chapter', { p_scroll: num, p_ch: ch }); if (error) throw error;
      if (data > 0){ MSU.balance = (MSU.balance || 0) + data; toast(`💰 두루마리 ${ch}장 완료 보상 ${data}달란트를 받았어요!`, 3000); }
      return data > 0 ? data : 0; } catch (e){ return 0; }
  }
  // 서버가 저장된 진행 기록으로 보상을 확인하므로(2026-09-29), 청구 전에 진행을 먼저 저장해 둔다
  async function flushCloud(){ if (!msuOn() || !CLOUD.ready) return; clearTimeout(CLOUD.t); for (let i = 0; i < 40 && CLOUD.busy; i++) await new Promise(r => setTimeout(r, 150)); await cloudSave(false); }
  // 로그인 때 놓친 보상도 다시 청구한다(서버가 장마다 한 번만 주므로 여러 번 불러도 안전). 2·3편은 로그인 전이나 통신 오류로 놓친 장 보상도 여기서 받는다
  async function claimClearedChapters(){ const n = ST.ch + (ST.cleared ? 1 : 0); for (let c = 1; c <= Math.min(n, 10); c++) await claimChapter(c);
    for (const s of SCROLL_LIST){ if (s.num === undefined) continue; const p = ST.sp && ST.sp[s.id]; if (!p) continue; const k = (p.ch || 0) + (p.cleared ? 1 : 0); for (let c = 1; c <= k; c++) await claimScrollChapter(s.num, c); } }

  // 장착: 지팡이는 오른손에, 동물 친구는 뒤를 따라다님(마을을 옮겨도 함께)
  const equipObj = { staff: null, staffKey: null, pet: null, petKey: null, petT: 0 };
  const shopTemplates = {};
  async function loadShopModel(k){
    if (!shopTemplates[k]){
      const g = SHOP[k].proc ? { scene: SHOP[k].proc() } : await loadGLB(SHOP[k].src); const root = g.scene; if (!SHOP[k].proc) toToon(root); root.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(root), sc = SHOP[k].h * WPM / (box.max.y - box.min.y), c = box.getCenter(new THREE.Vector3());
      root.scale.multiplyScalar(sc); root.position.set(-c.x * sc, -box.min.y * sc, -c.z * sc);
      const holder = new THREE.Group(); holder.add(root); shopTemplates[k] = holder;
    }
    return shopTemplates[k].clone(true);
  }
  async function applyEquip(){
    applyGear();
    if (equip.staff !== equipObj.staffKey){
      if (equipObj.staff){ player.remove(equipObj.staff); equipObj.staff = null; }
      equipObj.staffKey = equip.staff;
      if (equip.staff && owned.has(equip.staff)){ const o = await loadShopModel(equip.staff); if (equipObj.staffKey === equip.staff){ equipObj.staff = o; player.add(o); } }
    }
    if (equip.pet !== equipObj.petKey){
      if (equipObj.pet){ scene.remove(equipObj.pet); equipObj.pet = null; }
      equipObj.petKey = equip.pet;
      if (equip.pet && owned.has(equip.pet)){ const o = await loadShopModel(equip.pet); if (equipObj.petKey === equip.pet){ equipObj.pet = o; o.position.copy(player.position); scene.add(o); equipObj.petWings = SHOP[equip.pet].fly ? addWings(o, SHOP[equip.pet].h * WPM) : null; equipObj.petGait = SHOP[equip.pet].fly ? null : addGait(o, equip.pet === 'pet-donkey' ? 0.45 : 0.38); } }
    }
  }
  // ══ 🐾 펫 친밀도: 쓰다듬기(하루 5번 +1) · 만나 먹이기(+1) → 레벨마다 새 행동 (2026-10-11 만렙을 어렵게: 100→250, 한 번에 오르는 양 +2/+6→+1/+1, 약 4주) ══
  const PET_MAX = 250, PAT_GAIN = 1, FEED_GAIN = 1;
  const PET_LV = [
    { need: 0,  n: 'Lv.1 처음 만난 사이', unlock: '' },
    { need: 40, n: 'Lv.2 친한 사이', unlock: '🪑 앉기 — 멈춰 서 있으면 옆에 앉아요' },
    { need: 120, n: 'Lv.3 단짝', unlock: '🎪 재주 부리기 — 빙글 돌며 뛰어올라요' },
    { need: 250, n: 'Lv.4 가장 좋은 친구', unlock: '🏃 따라 뛰기 — 달리면 신나게 따라 뛰어요' },
  ];
  const josa = (w, a, b) => { const c = w.charCodeAt(w.length - 1) - 0xac00; return w + (c >= 0 && c < 11172 && c % 28 ? a : b); };
  const petAff = k => (ST.petAff && ST.petAff[k]) || 0;
  const petLv = k => PET_LV.filter(l => petAff(k) >= l.need).length;   // 1~4
  function addAff(k, n){
    ST.petAff = ST.petAff || {}; const before = petLv(k);
    ST.petAff[k] = Math.min(PET_MAX, petAff(k) + n); saveST();
    const after = petLv(k);
    if (after > before) setTimeout(() => toast(`🎉 ${josa(SHOP[k].name, '과', '와')} ${PET_LV[after - 1].n}이 됐어요! ${PET_LV[after - 1].unlock}`, 3400), 700);
  }
  function petHearts(){
    const pet = equipObj.pet; if (!pet) return;
    for (let i = 0; i < 4; i++) setTimeout(() => {
      const el = document.createElement('div'); el.textContent = ['❤️', '💕', '💖'][(Math.random() * 3) | 0];
      const v = pet.position.clone(); v.y += 1.0; v.project(camera);
      Object.assign(el.style, { position: 'fixed', left: ((v.x + 1) / 2 * innerWidth + (Math.random() - 0.5) * 40) + 'px', top: ((1 - v.y) / 2 * innerHeight) + 'px', fontSize: '20px', zIndex: 15, pointerEvents: 'none', transition: 'transform 1.2s ease-out, opacity 1.2s', opacity: '1' });
      document.body.appendChild(el); requestAnimationFrame(() => { el.style.transform = 'translateY(-50px)'; el.style.opacity = '0'; }); setTimeout(() => el.remove(), 1300);
    }, i * 150);
  }
  function renderPet(msg){
    const k = equipObj.petKey, it = SHOP[k]; if (!k) return;
    const aff = petAff(k), lv = petLv(k), next = PET_LV[lv], today = kstDate();
    ST.petDay = ST.petDay || {}; const pd = ST.petDay[k] && ST.petDay[k].d === today ? ST.petDay[k] : { d: today, n: 0 };
    document.getElementById('pet-title').textContent = `🐾 ${it.name} · ${PET_LV[lv - 1].n}`;
    document.getElementById('pet-body').innerHTML = `<div style="font-size:13px">친밀도 ${aff} / ${PET_MAX}${next ? ` · 다음 레벨까지 ${next.need - aff}` : ' · 최고 레벨!'}</div>`
      + `<div class="pet-bar"><i style="width:${Math.min(100, aff / PET_MAX * 100)}%"></i></div>`
      + `<div class="pet-acts"><button data-pa="pat" ${pd.n >= 5 ? 'disabled' : ''}>🤚 쓰다듬기<small>오늘 ${pd.n}/5 · +${PAT_GAIN}</small></button>`
      + `<button data-pa="feed" ${(ST.manna || 0) > 0 ? '' : 'disabled'}>🍞 만나 먹이기<small>만나 ${ST.manna || 0}개 · +${FEED_GAIN}</small></button>`
      + `<button data-pa="trick" ${lv >= 3 ? '' : 'disabled'}>🎪 재주<small>${lv >= 3 ? '보여 줘!' : 'Lv.3부터'}</small></button></div>`
      + `<div class="pet-lv">${PET_LV.slice(1).map((l, i) => `${lv >= i + 2 ? '✅' : '🔒'} ${l.unlock} <span style="opacity:.6">(${l.need})</span>`).join('<br>')}</div>`
      + `<div style="font-size:12px;opacity:.75;margin-top:8px">${msg || '🍞 만나는 오늘의 퀘스트를 다 하면 2개씩 받아요.'}</div>`;
  }
  document.getElementById('btn-pet').onclick = () => { renderPet(); openModal('pet-modal'); };
  document.getElementById('pet-body').addEventListener('click', e => {
    const b = e.target.closest('[data-pa]'); if (!b || b.disabled) return;
    const k = equipObj.petKey, today = kstDate();
    if (b.dataset.pa === 'pat'){ ST.petDay = ST.petDay || {}; if (!ST.petDay[k] || ST.petDay[k].d !== today) ST.petDay[k] = { d: today, n: 0 }; ST.petDay[k].n++; addAff(k, PAT_GAIN); petHearts(); renderPet(`${josa(SHOP[k].name, '이', '가')} 기분 좋아해요!`); }
    if (b.dataset.pa === 'feed'){ ST.manna = (ST.manna || 0) - 1; addAff(k, FEED_GAIN); petHearts(); renderPet(`냠냠! ${josa(SHOP[k].name, '이', '가')} 만나를 맛있게 먹었어요`); }
    if (b.dataset.pa === 'trick'){ equipObj.trickT = 1.2; document.querySelector('#pet-modal .close').click(); }
  });
  let playerIdleT = 0;
  function addWings(o, H){
    const shape = new THREE.Shape(); shape.moveTo(0, 0.12); shape.quadraticCurveTo(0.55, 0.42, 1.0, 0.12); shape.lineTo(0.9, -0.02); shape.quadraticCurveTo(0.5, -0.22, 0, -0.3); shape.lineTo(0, 0.12);
    const geo = new THREE.ShapeGeometry(shape, 8); geo.rotateX(-Math.PI / 2); geo.scale(H * 0.85, 1, H * 0.85);
    const mat = new THREE.MeshToonMaterial({ color: 0xf5f2ea, gradientMap: toonGradient, side: THREE.DoubleSide });
    const mk = side => { const piv = new THREE.Group(); piv.position.set(side * H * 0.1, H * 0.62, -H * 0.02); const m = new THREE.Mesh(geo, mat); m.scale.x = side; m.castShadow = true; piv.add(m); o.add(piv); return piv; };
    return { l: mk(-1), r: mk(1), t: 0 };
  }
  const _hand = new THREE.Vector3();
  function updateEquip(dt){
    updateGear();
    document.getElementById('btn-pet').classList.toggle('hidden', !equipObj.pet);
    playerIdleT = moveSpeed < 0.2 ? playerIdleT + dt : 0;
    const st = equipObj.staff;
    if (st && playerHand){ playerHand.getWorldPosition(_hand); player.worldToLocal(_hand); st.position.set(_hand.x, 0.02, _hand.z); }   // 손 위치를 따라 땅을 짚은 지팡이
    const pet = equipObj.pet; if (!pet) return;
    const it = SHOP[equipObj.petKey], fx = Math.sin(heading), fz = -Math.cos(heading);   // 학생이 보는 방향
    const lv = petLv(equipObj.petKey), runFollow = lv >= 4 && moveSpeed > (WALK_SPEED + RUN_SPEED) / 2;
    const side = runFollow ? 1.1 : 0.9, back = runFollow ? 0.4 : 1.5;   // 따라 뛰기: 옆에 바짝 붙어 나란히
    const tx = player.position.x - fx * back + fz * side, tz = player.position.z - fz * back - fx * side;
    const dx = tx - pet.position.x, dz = tz - pet.position.z, dist = Math.hypot(dx, dz);
    if (dist > 25){ pet.position.set(tx, 0, tz); }                                          // 마을 이동·순간이동 뒤엔 바로 옆으로
    const k = Math.min(1, dt * (dist > 3 ? 5 : 2.6)); pet.position.x += dx * k; pet.position.z += dz * k;
    if (!it.fly && dist < 25) resolveCollisions(pet.position, heightAt(pet.position.x, pet.position.z));   // 담·건물을 뚫고 지나가지 않게
    const moving = dist > 0.25; equipObj.petT += dt * (moving ? 11 : 3);
    const g = equipObj.petGait; if (g){ g.ph.value += dt * (moving ? 9 : 0); g.amp.value += ((moving ? 1 : 0) - g.amp.value) * Math.min(1, dt * 6); }
    const ground = heightAt(pet.position.x, pet.position.z);
    const sit = lv >= 2 && !moving && playerIdleT > 2.5;
    if (equipObj.trickT > 0){ equipObj.trickT -= dt; pet.rotation.y += dt * 11; }
    const hop = equipObj.trickT > 0 ? Math.sin((1.2 - equipObj.trickT) / 1.2 * Math.PI) * 0.9 : 0;
    const runHop = runFollow ? Math.abs(Math.sin(equipObj.petT * 1.4)) * 0.3 : 0;
    const flyY = sit ? ground + 0.02 : player.position.y + 1.9 + Math.sin(equipObj.petT * 0.5) * 0.18;
    pet.position.y = it.fly ? pet.position.y + (flyY + hop - pet.position.y) * Math.min(1, dt * 3) : ground + hop + runHop + (moving ? Math.abs(Math.sin(equipObj.petT)) * 0.04 : 0);
    pet.scale.y += ((sit && !it.fly ? 0.8 : 1) - pet.scale.y) * Math.min(1, dt * 5);   // 앉기: 몸을 낮춤
    const w = equipObj.petWings; if (w && sit && Math.abs(pet.position.y - ground) < 0.3){ w.r.rotation.z += (0.05 - w.r.rotation.z) * Math.min(1, dt * 6); w.l.rotation.z = -w.r.rotation.z; } else if (w){ w.t += dt * (dist > 0.25 ? 17 : 9); const a = 0.25 + Math.sin(w.t) * (dist > 0.25 ? 0.95 : 0.6); w.r.rotation.z = a; w.l.rotation.z = -a; }
    const want = moving ? Math.atan2(dx, dz) : Math.atan2(player.position.x - pet.position.x, player.position.z - pet.position.z);
    if (!(equipObj.trickT > 0)){ let df = want - pet.rotation.y; while (df > Math.PI) df -= Math.PI * 2; while (df < -Math.PI) df += Math.PI * 2; pet.rotation.y += df * Math.min(1, dt * 6); }
  }
  // ══ 도전(미니게임) · 개인 기록 ══════════════════════════════════
  // 기록은 이 기기에 저장(ST.best)하고, 말씀우물에 로그인했으면 랭킹에도 올림(recordBest → submitRecord)
  const CH_INFO = {
    brick:  { name: '벽돌 굽기', unit: '장', high: true },
    frogs:  { name: '개구리 몰기', unit: '마리', high: true },
    hail:   { name: '우박 피하기', unit: '초', high: true },
    rhythm: { name: '소고 찬양', unit: '점', high: true },
    dark:   { name: '흑암 길 찾기', unit: '초', high: false },
    rp_straw:  { name: '짚단 모으기', unit: '초', high: false },
    rp_hail:   { name: '우박 알리기', unit: '초', high: false },
    rp_marks:  { name: '문설주 바르기', unit: '초', high: false },
    rp_redsea: { name: '홍해 건너기', unit: '초', high: false },
  };
  function recordBest(kind, v){
    ST.best = ST.best || {}; const info = CH_INFO[kind] || { high: true }, old = ST.best[kind];
    const better = old === undefined || (info.high ? v > old : v < old);
    if (better){ ST.best[kind] = v; saveST(); if (old !== undefined) setTimeout(() => toast(`🏆 새 기록! ${info.name} ${v}${info.unit || ''}`, 2400), 600); }
    if (typeof submitRecord === 'function') submitRecord(kind, v);
    if (kind !== 'dark') dq('game');
    if (kind === 'brick' && v >= 8){ wq('brick8'); hqEvent('brick8'); } if (kind === 'frogs' && v >= 12) wq('frogs12'); if (kind === 'rhythm' && v >= 70) wq('rhythm70');
    return better;
  }
  const mg = { el: document.getElementById('mg'), on: null, raf: 0 };
  const mgArea = document.getElementById('mg-area'), mgAct = document.getElementById('mg-act'), mgStat = document.getElementById('mg-stat');
  function mgOpen(title, info){ document.getElementById('mg-title').textContent = title; document.getElementById('mg-info').innerHTML = info; mgArea.innerHTML = ''; mgStat.textContent = ''; mgAct.textContent = '시작!'; mgAct.disabled = false; mg.el.classList.remove('hidden'); }
  function mgCloseAll(){ cancelAnimationFrame(mg.raf); mg.on = null; mg.el.classList.add('hidden'); }
  document.getElementById('mg-close').onclick = () => { if (mg.onClose) { const f = mg.onClose; mg.onClose = null; f(); } mgCloseAll(); };
  function startChallenge(kind){
    if (CRAFT_CH[kind]) return CRAFT_CH[kind]();
    if (kind === 'course') return courseChallenge(ST.best && ST.best[courseKind()] !== undefined ? ` · 이번 주 내 최고 기록 ${ST.best[courseKind()]}초` : '');
    const best = ST.best && ST.best[kind] !== undefined ? ` · 내 최고 기록 ${ST.best[kind]}${CH_INFO[kind].unit}` : '';
    if (kind === 'brick') return brickGame(best);
    if (kind === 'rhythm') return rhythmGame(best);
    if (kind === 'frogs') return frogChallenge(best);
    if (kind === 'hail') return hailChallenge(best);
  }
  // 벽돌 굽기(출 5:7-8): 바늘이 초록 칸에 올 때 누르기 — 흙 이기기 → 틀에 붓기 → 굽기 = 벽돌 1장, 30초
  function brickGame(best){
    mgOpen('🧱 벽돌 굽기 도전', `바늘이 <b>초록 칸</b>에 올 때 누르세요. <b>흙 이기기 → 틀에 붓기 → 굽기</b>를 성공하면 벽돌 1장! 30초 안에 몇 장 만들까요?${best}<br><span style="opacity:.75">짚도 받지 못하고 같은 수의 벽돌을 채워야 했던 히브리 사람들의 하루를 느껴 보세요 (출애굽기 5:7-8).</span>`);
    const steps = ['흙 이기기', '틀에 붓기', '굽기'];
    mgArea.innerHTML = `<div class="mg-steps"></div><div class="mg-bar"><div class="mg-zone"></div><div class="mg-needle"></div></div><div class="mg-brick"></div>`;
    const stepsEl = mgArea.querySelector('.mg-steps'), zone = mgArea.querySelector('.mg-zone'), needle = mgArea.querySelector('.mg-needle'), brickEl = mgArea.querySelector('.mg-brick');
    let st = 0, bricks = 0, pos = 0, dir = 1, speed = 0.9, zc = 0.5, zw = 0.22, t0 = 0, playing = false, last = 0;
    const newZone = () => { zw = Math.max(0.1, 0.22 - bricks * 0.012); zc = zw / 2 + Math.random() * (1 - zw); zone.style.left = ((zc - zw / 2) * 100) + '%'; zone.style.width = (zw * 100) + '%'; };
    const draw = () => { stepsEl.innerHTML = steps.map((x, i) => `<span class="${i === st ? 'on' : ''}">${i < st ? '✓ ' : ''}${x}</span>`).join('  →  '); brickEl.textContent = '🧱'.repeat(Math.min(bricks, 12)) + (bricks > 12 ? ` ×${bricks}` : ''); };
    newZone(); draw();
    const loop = now => { const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
      pos += dir * speed * dt; if (pos > 1){ pos = 1; dir = -1; } if (pos < 0){ pos = 0; dir = 1; }
      needle.style.left = (pos * 100) + '%';
      if (playing){ const left = Math.max(0, 30 - (now - t0) / 1000); mgStat.textContent = `⏱ ${left.toFixed(1)}초 · 🧱 ${bricks}장`;
        if (left <= 0){ playing = false; mgAct.textContent = '다시 하기'; const nb = recordBest('brick', bricks);
          document.getElementById('mg-info').innerHTML = `벽돌 <b>${bricks}장</b>! ${bricks >= 8 ? '감독이 놀랐어요 👏' : '감독: "만들던 벽돌 수는 줄이지 말라!"'}${nb ? ' · 최고 기록!' : ''}<br><span style="opacity:.75">"너희는 짚을 주지 말고… 그들이 전에 만든 벽돌 수효대로 만들게 하고 감하지 말라" (출애굽기 5:7-8)</span>`; } }
      mg.raf = requestAnimationFrame(loop); };
    mg.raf = requestAnimationFrame(loop);
    mgAct.onclick = () => {
      if (!playing){ if (mgAct.textContent !== '누르기!'){ playing = true; bricks = 0; st = 0; speed = 0.9; t0 = performance.now(); mgAct.textContent = '누르기!'; newZone(); draw(); } return; }
      if (Math.abs(pos - zc) <= zw / 2){ st++; if (st >= 3){ st = 0; bricks++; speed = Math.min(1.9, speed + 0.07); } newZone(); }
      else { st = 0; mgArea.style.background = 'rgba(210,60,40,0.35)'; setTimeout(() => mgArea.style.background = '', 150); }
      draw();
    };
  }
  // 소고 찬양(출 15:20-21): 박자에 맞춰 소고 두드리기(찬양 곡 112 bpm), 24음
  function rhythmGame(best, onDone){
    mgOpen('🥁 소고 찬양', `노란 원이 <b>하얀 줄</b>에 닿을 때 누르세요(스페이스바도 돼요). 미리암과 여인들처럼 소고를 치며 찬양해요!${best}<br><span style="opacity:.75">"너희는 여호와를 찬송하라 그는 높고 영화로우심이요" (출애굽기 15:21)</span>`);
    mg.onClose = onDone || null;
    mgArea.innerHTML = `<div class="mg-ring"></div><div class="mg-hit"></div><div class="mg-judge"></div>`;
    const judge = mgArea.querySelector('.mg-judge'), beat = 60 / 112, lead = 2.0;
    const pattern = [0, 1, 2, 3, 4, 4.5, 5, 6, 8, 9, 10, 10.5, 11, 12, 13, 14, 16, 16.5, 17, 18, 19, 20, 20.5, 21];
    let notes = [], t0 = 0, playing = false, score = 0, combo = 0, last = 0;
    const tapSound = () => { try { const c = BGM.ctx; if (!c) return; const b = c.createBuffer(1, c.sampleRate * 0.12, c.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++){ const t = i / c.sampleRate; d[i] = (Math.random() * 2 - 1) * Math.exp(-t * 40) * 0.5 + Math.sin(2 * Math.PI * 6200 * t) * Math.exp(-t * 25) * 0.3; }
      const s0 = c.createBufferSource(), g = c.createGain(); g.gain.value = 0.6; s0.buffer = b; s0.connect(g).connect(c.destination); s0.start(); } catch (e){} };
    const hit = () => { if (!playing) return; tapSound(); const now = (performance.now() - t0) / 1000;
      let bi = -1, bd = 9; notes.forEach((n, i) => { if (!n.done){ const d = Math.abs(n.t - now); if (d < bd){ bd = d; bi = i; } } });
      if (bi >= 0 && bd < 0.2){ const n = notes[bi]; n.done = true; n.el.remove(); const pts = bd < 0.08 ? 100 : 60; score += pts; combo++; judge.textContent = (pts === 100 ? '완벽해요! ' : '좋아요! ') + (combo > 2 ? `${combo} 연속` : ''); judge.style.color = pts === 100 ? '#ffd27a' : '#9be58a'; }
      else { combo = 0; judge.textContent = '…'; judge.style.color = '#ccc'; } };
    mg.keyHandler = e => { if (mg.on === 'rhythm' && (e.key === ' ' || e.key === 'Enter')){ e.preventDefault(); e.stopPropagation(); hit(); } };
    window.addEventListener('keydown', mg.keyHandler, true);
    const loop = () => { const now = (performance.now() - t0) / 1000, w = mgArea.clientWidth;
      if (playing){
        notes.forEach(n => { if (n.done) return; const x = 0.22 + (n.t - now) / lead * 0.72; n.el.style.left = (x * w) + 'px'; if (now - n.t > 0.25){ n.done = true; n.el.remove(); combo = 0; judge.textContent = '놓쳤어요'; judge.style.color = '#e88'; } });
        const pct = Math.round(score / (pattern.length * 100) * 100); mgStat.textContent = `🥁 ${pct}점`;
        if (now > pattern[pattern.length - 1] * beat + 1.2){ playing = false; mg.on = null; mgAct.textContent = '다시 하기';
          const nb = recordBest('rhythm', pct); judge.textContent = `찬양 ${pct}점! ${pct >= 80 ? '🎉 온 백성이 함께 찬송했어요' : pct >= 50 ? '👏 잘했어요' : '다시 해 볼까요?'}${nb ? ' · 최고 기록!' : ''}`; judge.style.color = '#ffd27a';
          if (pct >= 70 && !ST.badges.includes('timbrel')){ ST.badges.push('timbrel'); saveST(); setTimeout(() => toast('🥁 배지 획득: 소고 찬양', 2400), 400); } } }
      mg.raf = requestAnimationFrame(loop); };
    mgAct.onclick = () => { if (playing){ hit(); return; }
      notes.forEach(n => n.el.remove()); notes = pattern.map(b => { const el = document.createElement('div'); el.className = 'mg-note'; el.style.left = '-60px'; mgArea.appendChild(el); return { t: lead + b * beat, el, done: false }; });
      score = 0; combo = 0; t0 = performance.now(); playing = true; mg.on = 'rhythm'; mgAct.textContent = '🥁 두드리기!'; judge.textContent = ''; cancelAnimationFrame(mg.raf); mg.raf = requestAnimationFrame(loop); };
  }
  const _mgClose0 = document.getElementById('mg-close').onclick;
  document.getElementById('mg-close').onclick = () => { if (mg.keyHandler){ window.removeEventListener('keydown', mg.keyHandler, true); mg.keyHandler = null; } _mgClose0(); };
  // 3D 도전 공통: 화면 위 알림판
  const hudCh = document.getElementById('hud-challenge');
  const live = { kind: null, t: 0, n: 0, hearts: 0, objs: [] };
  function liveEnd(msg){ if (live.kind === 'course') courseClear(); live.objs.forEach(o => o.parent && o.parent.remove(o)); live.objs.length = 0; live.kind = null; hudCh.classList.add('hidden'); if (msg) toast(msg, 3000); }
  // 개구리 몰기(출 8:3-6): 60초 동안 몇 마리 몰아낼까
  function frogChallenge(best){
    mgOpen('🐸 개구리 몰기 도전', `강가와 집 둘레에 개구리가 가득해요! <b>60초</b> 동안 개구리에게 다가가 나일 강 쪽으로 몰아내세요.${best}`);
    mgAct.onclick = () => { mgCloseAll(); liveEnd(); live.kind = 'frogs'; live.t = 60; live.n = 0; hudCh.classList.remove('hidden');
      for (let k = 0, tries = 0; k < 24 && tries < 800; tries++){ const x = -26 + Math.random() * 22, z = -14 + Math.random() * 28;
        if (!reachable(x, z) || Math.hypot(x - PEN_C[0], z - PEN_C[1]) < PEN_WALL + 1.2 || Math.hypot(x - player.position.x, z - player.position.z) < 3) continue;
        const g = new THREE.Group(), b = new THREE.Mesh(frogGeo, frogMat); b.scale.set(1, 0.72, 1.25); b.position.y = 0.15; g.add(b);
        g.scale.setScalar(2.4); g.position.set(x, heightAt(x, z), z); g.userData = { x, z, flee: -1, t: Math.random() * 3 }; zoneRoot.add(g); live.objs.push(g); k++; } };
  }
  // 우박 피하기(출 9:23-25): 그림자가 생긴 자리에 우박이 떨어짐, 하트 3개로 40초 버티기
  const shadowGeo = new THREE.CircleGeometry(1, 20).rotateX(-Math.PI / 2), iceGeo = new THREE.IcosahedronGeometry(0.35, 0);
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x1a1a2a, transparent: true, opacity: 0.45, depthWrite: false }), iceMat = new THREE.MeshToonMaterial({ color: 0xeaf6ff, gradientMap: toonGradient });
  function hailChallenge(best){
    mgOpen('🧊 우박 피하기 도전', `하늘에서 우박이 떨어져요! 땅에 <b>그림자</b>가 생기면 곧 그 자리에 우박이 떨어져요. <b>하트 3개</b>로 40초를 버텨 보세요.${best}`);
    mgAct.onclick = () => { mgCloseAll(); liveEnd(); live.kind = 'hail'; live.t = 40; live.n = 0; live.hearts = 3; live.spawn = 0; hudCh.classList.remove('hidden'); };
  }
  function updateLive(dt){
    if (!live.kind) return;
    if (updateCourseLive(dt)) return;
    if (updateCraftLive(dt)) return;
    if (dlgState || !Z || Z.id !== 'egypt'){ if (!Z || Z.id !== 'egypt') liveEnd(); return; }
    live.t -= dt;
    if (live.kind === 'frogs'){
      for (let i = live.objs.length - 1; i >= 0; i--){ const g = live.objs[i], u = g.userData; u.t += dt;
        const dx = u.x - player.position.x, dz = u.z - player.position.z, d = Math.hypot(dx, dz);
        if (u.flee < 0 && d < 2.2){ u.flee = 0; const vx = dx / d - 0.8, vz = dz / d, l = Math.hypot(vx, vz) || 1; u.vx = vx / l * 3.6; u.vz = vz / l * 3.6; g.rotation.y = Math.atan2(u.vx, u.vz); }
        if (u.flee >= 0){ u.flee += dt; u.x += u.vx * dt; u.z += u.vz * dt; g.position.set(u.x, heightAt(u.x, u.z) + Math.abs(Math.sin(u.flee * 9)) * 0.45, u.z);
          if (u.flee > 1.0){ zoneRoot.remove(g); live.objs.splice(i, 1); live.n++; } }
        else g.position.y = heightAt(u.x, u.z) + ((u.t % 2.2) < 0.3 ? Math.sin((u.t % 2.2) / 0.3 * Math.PI) * 0.25 : 0); }
      hudCh.textContent = `🐸 ${live.n}마리 · ⏱ ${Math.max(0, live.t).toFixed(0)}초`;
      if (live.t <= 0 || !live.objs.length){ const n = live.n, nb = recordBest('frogs', n); liveEnd(`🐸 개구리 ${n}마리를 몰아냈어요!${nb ? ' 🏆 최고 기록!' : ''}`); }
    }
    if (live.kind === 'hail'){
      live.spawn -= dt;
      if (live.spawn <= 0){ live.spawn = Math.max(0.35, 0.95 - (40 - live.t) * 0.014);
        const aim = Math.random() < 0.3, a = Math.random() * 6.28, r = aim ? Math.random() * 1.2 : 1.5 + Math.random() * 5;
        const x = player.position.x + Math.cos(a) * r, z = player.position.z + Math.sin(a) * r;
        const sh = new THREE.Mesh(shadowGeo, shadowMat); sh.position.set(x, heightAt(x, z) + 0.05, z); sh.scale.setScalar(0.3); sh.userData = { t: 1.1, x, z }; zoneRoot.add(sh); live.objs.push(sh);
        const ice = new THREE.Mesh(iceGeo, iceMat); ice.position.set(x, heightAt(x, z) + 14, z); zoneRoot.add(ice); sh.userData.ice = ice; live.objs.push(ice); }
      for (let i = live.objs.length - 1; i >= 0; i--){ const o = live.objs[i]; if (!o.userData || o.userData.t === undefined) continue;
        const u = o.userData; u.t -= dt; o.scale.setScalar(0.3 + 0.7 * (1 - Math.max(0, u.t) / 1.1)); u.ice.position.y = heightAt(u.x, u.z) + Math.max(0, u.t) / 1.1 * 14;
        if (u.t <= 0){ if (Math.hypot(player.position.x - u.x, player.position.z - u.z) < 1.05){ live.hearts--; const fl = document.getElementById('flash'); fl.style.transition = 'none'; fl.style.opacity = '0.4'; setTimeout(() => { fl.style.transition = 'opacity 0.4s'; fl.style.opacity = '0'; }, 80); }
          zoneRoot.remove(o); zoneRoot.remove(u.ice); live.objs.splice(live.objs.indexOf(u.ice), 1); live.objs.splice(live.objs.indexOf(o), 1); } }
      hudCh.textContent = `${'❤️'.repeat(Math.max(0, live.hearts))}${'🤍'.repeat(3 - Math.max(0, live.hearts))} · ⏱ ${Math.max(0, live.t).toFixed(0)}초`;
      if (live.hearts <= 0 || live.t <= 0){ const sec = Math.round(40 - Math.max(0, live.t)), nb = recordBest('hail', sec); liveEnd(live.hearts > 0 ? `🧊 40초를 버텼어요!${nb ? ' 🏆 최고 기록!' : ''}` : `🧊 ${sec}초 버텼어요. 다시 도전해 봐요!${nb ? ' 🏆 최고 기록!' : ''}`); }
    }
  }
  // 바다를 건너며 지친 사람 돕기(4장): 둘 다 도우면 배지
  function helpTired(m){
    ST.helped = ST.helped || []; if (ST.helped.includes(m.data.id)) return;
    ST.helped.push(m.data.id); saveST(); playOneShot('Wave', { lockMove: true });
    toast(`🤝 ${m.data.title}을(를) 일으켜 세웠어요! "고마워요, 같이 가요!"`, 2200);
    applyShow(m); interactBtn.classList.add('hidden'); nearPoint = null;
    if (['rs_tired1', 'rs_tired2'].every(id => ST.helped.includes(id)) && !ST.badges.includes('together')){ ST.badges.push('together'); saveST(); setTimeout(() => toast('🤝 배지 획득: 함께 건넌 마음', 2400), 1200); }
  }
  function openModal(id, onClose){
    const m = document.getElementById(id); m.classList.remove('hidden');
    const btn = m.querySelector('.close');
    // 창이 길어 「닫기」가 화면 밖으로 밀려도 나갈 수 있게: 오른쪽 위 ✕ (가로 화면에서 상점 창 닫기 버튼이 안 보였음)
    const sheet = m.querySelector('.sheet');
    if (sheet && !sheet.querySelector('.xbtn')){ const x = document.createElement('button'); x.className = 'xbtn'; x.textContent = '✕'; x.title = '닫기'; x.onclick = () => m.querySelector('.close').click(); sheet.prepend(x); }
    if (sheet) sheet.scrollTop = 0;
    btn.onclick = () => { m.classList.add('hidden'); onClose && onClose(); };
  }
  function showClear(){
    if (REPLAY && REPLAY.def.chapter !== undefined){ finishReplay(true); return; }
    document.getElementById('clear-title').textContent = CHAPTER.clearTitle;
    document.getElementById('clear-badge').src = A('ui/game/badge-moses-clear.png');
    const _known = ST.badges.filter(b => BADGES[b]), _more = ST.badges.length - _known.length;   // 다른 두루마리 파일이 아직 안 열렸으면 그 배지 정보가 없다 — 없어도 멈추지 않게
    const bs = (_known.map(b => BADGES[b].ico + ' ' + BADGES[b].name).join(', ') + (_more > 0 ? (_known.length ? ' 외 ' : '') + _more + '개' : '')) || '없음';
    document.getElementById('clear-body').textContent = `모은 구절 카드 ${ST.verses.length} / ${Object.keys(VERSES).length}장 · ⭐ 지혜 별 ${ST.stars} / ${Object.keys(QUIZ).length} · 얻은 스킬: ${[...unlocked].map(id => SKILLS[id].name).join(', ')}\n배지: ${bs}\n💰 ${ST.ch + 1}장 완료 보상 10달란트${(MSU.client && MSU.session) || SHOP_MOCK ? '' : ' (말씀우물에 로그인하면 받아요)'}\n\n다른 선택을 하면 다른 카드와 배지를 얻을 수 있어요!\n다음: ${CHAPTER.next}`;
    const nextCh = AP().ch + 1, C = actChapters();
    if (ST.cur === 'moses') claimChapter(ST.ch + 1);
    else { const it = SCROLL_LIST.find(x => x.id === ST.cur); if (it && it.num !== undefined) claimScrollChapter(it.num, nextCh); }
    setTimeout(checkNewTitle, 100);
    { const body = document.getElementById('clear-body'), esc = t => t.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
      body.innerHTML = body.textContent.split('\n').map((l, i) => `<span class="ln" style="animation-delay:${(0.45 + i * 0.12).toFixed(2)}s">${esc(l)}</span>`).join(''); }
    setTimeout(() => clearFx(nextCh, () => openModal('clear-modal', () => { document.getElementById('clear-modal').classList.remove('pop'); if (C[nextCh]) startChapter(nextCh); else if (ST.cur !== 'moses' && (SCROLL_DEFS[ST.cur] || {}).returnToMoses) setTimeout(() => enterScroll('moses'), 400); else setTimeout(() => nextScrollCeremony(), 400); })), 300);
  }
  // 🎉 장 완료 연출(2026-10-26 전도사님 요청): 빛·큰 글씨·꽃가루·짧은 팡파르 → 누르거나 2.8초 뒤 완료 창(배지 돌며 등장, 줄마다 차례로)
  function clearFx(chNo, then){
    const el = document.getElementById('ch-fx'), scr = SCROLL_LIST.find(x => x.id === ST.cur);
    document.getElementById('ch-fx-sub').textContent = scr ? `${scr.no}편 「${scr.title}」` : (CHAPTER.title || '');
    document.getElementById('ch-fx-t').textContent = `✨ ${chNo}장 완료! ✨`;
    document.getElementById('ch-fx-n').textContent = CHAPTER.clearTitle || '';
    const COLS = ['#ffd27a', '#ffffff', '#ff9a7a', '#8fd3ff', '#b6f08a', '#e7a8ff'];
    for (let i = 0; i < 46; i++){
      const c = document.createElement('i'); c.className = 'cf';
      c.style.cssText = `left:${(Math.random() * 100).toFixed(1)}%;background:${COLS[i % COLS.length]};animation-duration:${(1.8 + Math.random() * 1.6).toFixed(2)}s;animation-delay:${(Math.random() * 0.9).toFixed(2)}s;--r:${Math.round(300 + Math.random() * 500) * (i % 2 ? 1 : -1)}deg;width:${6 + (i % 3) * 3}px`;
      el.appendChild(c);
    }
    el.classList.remove('hidden', 'out'); fanfare();
    let fin = false;
    const end = () => { if (fin) return; fin = true; el.classList.add('out');
      setTimeout(() => { el.classList.add('hidden'); el.classList.remove('out'); el.querySelectorAll('.cf').forEach(c => c.remove()); }, 400);
      document.getElementById('clear-modal').classList.add('pop'); then(); };
    el.onclick = end; setTimeout(end, 2800);
  }
  function fanfare(){   // 도-미-솔-도 짧은 팡파르(배경음악을 꺼 두었으면 소리 없음)
    if (!BGM.on) return;
    try { const c = BGM.ctx || (BGM.ctx = new (window.AudioContext || window.webkitAudioContext)()), t0 = c.currentTime + 0.05;
      [[523, 0, 0.16], [659, 0.14, 0.16], [784, 0.28, 0.16], [1047, 0.42, 0.9]].forEach(([f, d, len]) => {
        const o = c.createOscillator(), g = c.createGain(); o.type = 'triangle'; o.frequency.value = f;
        g.gain.setValueAtTime(0, t0 + d); g.gain.linearRampToValueAtTime(0.14, t0 + d + 0.03); g.gain.exponentialRampToValueAtTime(0.001, t0 + d + len);
        o.connect(g); g.connect(c.destination); o.start(t0 + d); o.stop(t0 + d + len + 0.05); });
    } catch (e){}
  }
  document.getElementById('btn-book').onclick = () => {
    checkNewTitle(); dq('verse');
    document.getElementById('book-cards').innerHTML = titleBookHTML() + badgeBookHTML() + Object.keys(VERSES).map(id => cardHTML(id, !ST.verses.includes(id))).join('')
      + `<div style="grid-column:1/-1;margin-top:10px"><h3 style="font-size:15px;margin-bottom:4px">🔑 기억할 말 · ⭐ 지혜 별 ${ST.stars} / ${Object.keys(QUIZ).length} · 쓸 수 있는 별 ${starsLeft()}</h3>${ST.keys.length ? ST.keys.map(k => `<div class="keyline"><b>${k.scene}</b> — ${k.t}</div>`).join('') : '<div class="keyline">이야기 속 금색 🔑 문장이 여기에 모여요.</div>'}</div>`
      + scrollBookHTML() + genealBookHTML() + judgesBookHTML() + peopleBookHTML()
    openModal('book-modal');
  };
  // ══ 3. 오늘의 퀘스트: 날마다 3개(한국 날짜), 다 하면 5달란트 ══
  const kstDate = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
  const scrollLeft = () => Object.keys(SCROLL_VERSE).some(z => (z === 'alpha' || z === 'midian' || (z === 'egypt' && (ST.ch >= 1 || ST.cleared)) || (z === 'redsea' && ST.ch >= 3)) && (ST.scrolls && ST.scrolls[z] || []).length < SCROLL_N);
  const DQ_POOL = [
    { k: 'talk',   t: '마을 사람 3명과 이야기하기', n: 3, ok: () => true },
    { k: 'climb',  t: '점프로 상자에 올라서거나 담 넘기 3번', n: 3, ok: () => true },
    { k: 'run',    t: '달리기로 150m 달리기', n: 150, ok: () => true },
    { k: 'verse',  t: '📖 수집첩을 열어 구절 카드 읽기', n: 1, ok: () => true },
    { k: 'scroll', t: '📜 숨은 두루마리 조각 1개 찾기', n: 1, ok: scrollLeft },
    { k: 'pray',   t: '🙏 기도 스킬 2번 쓰기', n: 2, ok: () => unlocked.has('pray') },
    { k: 'game',   t: '🎮 도전(미니게임) 1판 하기', n: 1, ok: () => ST.ch >= 1 || ST.cleared },
  ];
  function dailyInit(){
    const today = kstDate();
    if (ST.daily && ST.daily.date === today){ dailyDot(); return; }
    let h = [...today].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 2147483647, 17);
    const rr = () => { h = (h * 16807) % 2147483647; return (h - 1) / 2147483646; };
    const pool = DQ_POOL.filter(q => q.ok()).map(q => [rr(), q.k]).sort((a, b) => a[0] - b[0]).slice(0, 3).map(x => x[1]);
    ST.daily = { date: today, q: pool, p: {}, talked: [], claimed: false }; saveST();
    setTimeout(() => toast('📅 오늘의 퀘스트 3개가 열렸어요 — ☰ 메뉴에서 볼 수 있어요', 2600), 3500);
    dailyDot();
  }
  const dqDef = k => DQ_POOL.find(q => q.k === k);
  const dqDone = k => (ST.daily.p[k] || 0) >= dqDef(k).n;
  const dqAll = () => ST.daily && ST.daily.q.every(dqDone);
  function dq(k, amt = 1, quiet){
    const D = ST.daily; if (!D || D.date !== kstDate() || !D.q.includes(k) || dqDone(k)) return;
    D.p[k] = Math.min(dqDef(k).n, (D.p[k] || 0) + amt);
    if (dqDone(k)){ saveST(); toast(`✅ 오늘의 퀘스트: ${dqDef(k).t}`, 2200); if (dqAll()){ addManna(2); addMat({ silver: 1 }, '📅 오늘의 퀘스트 보상', true); setTimeout(() => toast('📅 오늘의 퀘스트를 다 했어요! ☰ 메뉴에서 달란트를 받아요 · 🍞 만나 2개도 받았어요', 3000), 2400); weeklyInit(); const W = ST.weekly; if (W && !W.days.includes(D.date)){ W.days.push(D.date); wq('daily3'); } } dailyDot(); }
    else if (!quiet) saveST();
  }
  let runAcc = 0;
  function dqRun(m){ runAcc += m; if (runAcc >= 5){ const n = Math.floor(runAcc); runAcc -= n; dq('run', n, true); } }
  function dqTalk(m){ weeklyInit(); const W = ST.weekly; if (W && m.data.title && !W.talked.includes(m.data.title)){ W.talked.push(m.data.title); wq('talk10'); }
    const D = ST.daily; if (!D || !D.q.includes('talk') || !m.data.title) return; if (D.talked.includes(m.data.title)) return; D.talked.push(m.data.title); dq('talk'); }
  function dailyDot(){ document.getElementById('btn-menu').classList.toggle('dot', !!((ST.daily && dqAll() && !ST.daily.claimed) || (ST.weekly && wqAll() && !ST.weekly.claimed) || (typeof WOR !== 'undefined' && WOR && !WOR.claimed))); }
  function renderDaily(msg){
    const D = ST.daily, el = document.getElementById('daily-list'), b = document.getElementById('daily-claim');
    el.innerHTML = D.q.map(k => { const q = dqDef(k), v = Math.floor(D.p[k] || 0), done = v >= q.n;
      return `<div class="dq${done ? ' done' : ''}"><span class="ck">${done ? '✅' : '⬜'}</span><span class="tx">${q.t}</span><span class="pg">${q.k === 'run' ? v + 'm' : v} / ${q.k === 'run' ? q.n + 'm' : q.n}</span></div>`; }).join('')
      + `<div style="font-size:12px;opacity:.75;margin-top:6px">${msg || '매일 새 퀘스트 3개가 열려요(한국 시간 자정). 다 하면 💰 5달란트!'}</div>`;
    const logged = typeof msuOn === 'function' && msuOn();
    b.disabled = !dqAll() || D.claimed || !logged;
    b.textContent = D.claimed ? '✓ 오늘 달란트를 받았어요' : !logged ? '말씀우물에 로그인하면 달란트를 받아요' : dqAll() ? '💰 5달란트 받기' : '퀘스트를 다 하면 받을 수 있어요';
  }
  document.getElementById('btn-daily').onclick = () => { dailyInit(); weeklyInit(); renderDaily(); renderWeekly(); openModal('daily-modal'); };
  // ══ 🎬 다시 하기: 기념 전시관(두루마리마을)에서 마친 장의 장면·장 전체를 다시. 이야기 진행은 끝나면 원래대로 ══
  const REPLAYS = [
    { key: 'rp_straw',  name: '🌾 흩어진 짚단 모으기', ch: 0, step: 's12',   zone: 'egypt',   spawn: [6, 2],     need: 1 },
    { key: 'rp_hail',   name: '📢 들판에 우박 알리기', ch: 1, step: 'c2s17', zone: 'egypt',   spawn: [22, 4],    need: 2 },
    { key: 'dark',      name: '🕯 흑암 속 고센 찾기',  ch: 1, step: 'c2s22', zone: 'egypt',   spawn: [25.5, -10], need: 2 },
    { key: 'rp_marks',  name: '🐑 문설주에 피 바르기', ch: 2, step: 'c3s5',  zone: 'egypt',   spawn: [-6, 2],    need: 3 },
    { key: 'rp_redsea', name: '🌊 홍해 건너기(추격)',  ch: 3, step: 'c4s9',  zone: 'redsea',  spawn: [14.5, 0],  need: 4 },
  ];
  const PROG_KEYS = ['ch', 'step', 'cleared', 'rumor', 'straw', 'water', 'frogs', 'warned', 'mannaGot'];
  let REPLAY = null;
  function openReplay(){
    const done = chaptersDone(), fmt = k => ST.best && ST.best[k] !== undefined ? ` · 내 최고 ${ST.best[k]}초` : '';
    let h = `<div class="rp-h">🎬 장면 다시 하기 — 기록 도전(🏆 랭킹에 올라가요)</div>`
      + REPLAYS.map(r => `<button class="warp-go" data-rp="${r.key}" ${done >= r.need ? '' : 'disabled'}>${r.name}<small>${done >= r.need ? '빨리 해낼수록 좋아요' + fmt(r.key) : `🔒 ${r.need}장을 마치면`}</small></button>`).join('')
      + `<div class="rp-h">📖 장 처음부터 다시 하기 — 놓친 선택지 배지를 모을 수 있어요</div>`
      + CHAPTERS.map((c, i) => `<button class="warp-go" data-rc="${i}" ${done > i ? '' : 'disabled'}>${c.title.replace('📜 ', '')}<small>${done > i ? '구절·배지·칭호는 그대로, 끝나면 지금 이야기로 돌아와요' : '🔒 아직 마치지 않은 장'}</small></button>`).join('')
      + `<div style="font-size:12px;opacity:.75;margin-top:8px">다시 하기로는 달란트를 받지 않아요. 새 기록·배지가 목표예요!</div>`;
    document.getElementById('replay-list').innerHTML = h;
    openModal('replay-modal');
  }
  document.getElementById('replay-list').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || b.disabled) return;
    document.querySelector('#replay-modal .close').click();
    if (b.dataset.rp) startReplay(REPLAYS.find(r => r.key === b.dataset.rp));
    if (b.dataset.rc !== undefined){ const i = +b.dataset.rc, z = CHAPTERS[i].steps[0].zone; startReplay({ chapter: i, name: CHAPTERS[i].title.replace('📜 ', '') + ' 다시 하기', ch: i, zone: z, spawn: ZONES[z].spawn }); }
  });
  async function startReplay(def){
    if (REPLAY || dlgState || traveling || homeEdit || VISIT) return;
    const bk = {}; PROG_KEYS.forEach(k => bk[k] = JSON.parse(JSON.stringify(ST[k] ?? null)));
    ST.replayBackup = bk; ST.replayCur = ST.cur; ST.cur = 'moses';
    ST.ch = def.ch; STORY = CHAPTERS[def.ch].steps; CHAPTER = CHAPTERS[def.ch];
    ST.cleared = false; ST.step = def.step ? stepIdx(def.step) : 0; ST.rumor = []; ST.straw = 0; ST.water = 0; ST.frogs = 0; ST.warned = 0; ST.mannaGot = 0;
    reachDone = null; chase.on = false;
    REPLAY = { def, t0: 0 };
    saveST(); renderQuestList();
    document.getElementById('replay-t').textContent = `🎬 ${def.name} · 준비`;
    document.getElementById('replay-bar').classList.remove('hidden');
    await travelTo({ id: 'replay', to: def.zone, spawn: def.spawn });
    for (let i = 0; i < 60 && traveling; i++) await new Promise(r => setTimeout(r, 100));
    if (!REPLAY) return;
    if (def.step){ const [x, z] = def.spawn; player.position.set(x, heightAt(x, z), z); }
    spawnTasks(); refreshShow(); renderQuestList();
    REPLAY.t0 = performance.now();
    toast(def.chapter !== undefined ? `📖 ${def.name} — 처음부터 다시!` : `🎬 ${def.name} — 시작!`, 2000);
  }
  function updateReplayBar(){
    if (!REPLAY || !REPLAY.t0) return;
    const sec = (performance.now() - REPLAY.t0) / 1000;
    document.getElementById('replay-t').textContent = REPLAY.def.chapter !== undefined ? `📖 ${REPLAY.def.name}` : `🎬 ${REPLAY.def.name} · ${sec.toFixed(1)}초`;
  }
  async function finishReplay(ok){
    if (!REPLAY) return;
    const def = REPLAY.def, sec = REPLAY.t0 ? (performance.now() - REPLAY.t0) / 1000 : 0;
    REPLAY = null;
    if (dlgState){ dlgState = null; dlgEl.classList.add('hidden'); talking = false; talkingWith = null; }
    if (ST.replayBackup){ Object.assign(ST, ST.replayBackup); delete ST.replayBackup; }
    if (ST.replayCur){ ST.cur = ST.replayCur; delete ST.replayCur; }
    syncStory(); reachDone = null; chase.on = false;
    saveST(); document.getElementById('replay-bar').classList.add('hidden');
    if (ok && def.step){ const v = Math.max(1, Math.round(sec)); const nb = recordBest(def.key, v); setTimeout(() => toast(`🎬 ${def.name} ${sec.toFixed(1)}초!${nb ? ' 🏆 새 기록!' : ` (최고 ${ST.best[def.key]}초)`}`, 3000), 1600); }
    if (ok && def.chapter !== undefined) setTimeout(() => toast(`📖 ${def.name} 완료! 모은 배지·구절은 그대로예요`, 3000), 1600);
    if (!ok) setTimeout(() => toast('🎬 다시 하기를 그만뒀어요', 1800), 1600);
    await travelTo({ id: 'replay', to: 'alpha', spawn: [8, -2.5] });
    renderQuestList(); spawnTasks(); refreshShow();
  }
  document.getElementById('replay-stop').onclick = () => { if (confirm('다시 하기를 그만둘까요? 원래 이야기로 돌아가요.')) finishReplay(false); };

  // ══ ⛪ 예배 암호: 주일 예배(12시) 뒤 열림 — "이번 주 설교 제목은?" 을 맞히면 10달란트 + 그 설교 본문 구절 카드 ══
  var WOR = null;   // var: 위쪽 dailyDot에서 먼저 참조될 수 있음
  const mmdd = d => { const [, m, dd] = d.split('-'); return `${+m}/${+dd}`; };
  function worshipCard(r){
    const id = 'wv-' + r.service_date;
    if (!VERSES[id]){ VERSES[id] = { ref: r.verse_ref, text: r.verse_text }; ST.worshipCards = (ST.worshipCards || []).concat({ id, ref: r.verse_ref, text: r.verse_text, title: r.title }); saveST(); }
    return id;
  }
  function renderWorship(msg){
    const el = document.getElementById('worship-body');
    if (!(typeof msuOn === 'function' && msuOn())){ el.innerHTML = `<div class="wq-big">이번 주 설교 제목은?</div><div class="wq-sub">말씀우물에 로그인하면 예배 암호를 입력할 수 있어요.<br><a href="${MSU_BASE}login.html?next=/odyssey/">로그인하기</a></div>`; return; }
    if (WOR === null){ el.innerHTML = '<div class="wq-sub">불러오는 중…</div>'; return; }
    if (!WOR){ el.innerHTML = `<div class="wq-big">이번 주 설교 제목은?</div><div class="wq-sub">주일 예배가 끝나면(낮 12시) 새 암호가 열려요.<br>설교를 잘 듣고 와서 제목을 입력해 보세요!</div>`; return; }
    if (WOR.claimed){ el.innerHTML = `<div class="wq-big">✅ ${WOR.title}</div><div class="wq-sub">${mmdd(WOR.service_date)} 주일 예배 암호를 맞혔어요! 💰 10달란트와 구절 카드를 받았어요.<br><b>${WOR.verse_ref}</b><br>${WOR.verse_text}</div>`; return; }
    el.innerHTML = `<div class="wq-big">이번 주 설교 제목은?</div><div class="wq-sub">${mmdd(WOR.service_date)} 주일 예배 설교 제목을 입력해요 · ${WOR.len}글자(띄어쓰기는 상관없어요)<br>맞히면 💰 10달란트 + 설교 본문 구절 카드!</div>`
      + `<input id="worship-in" maxlength="40" placeholder="설교 제목" autocomplete="off"><button id="worship-go">확인</button><div id="worship-msg">${msg || ''}</div>`;
    const go = async () => {
      const v = document.getElementById('worship-in').value.trim(); if (!v) return;
      document.getElementById('worship-go').disabled = true;
      try {
        const { data, error } = await MSU.client.rpc('submit_odyssey_worship', { p_answer: v }); if (error) throw error;
        if (!data.ok){ renderWorship(data.msg); return; }
        WOR = { ...WOR, claimed: true, title: data.title, verse_ref: data.verse_ref, verse_text: data.verse_text };
        const id = worshipCard(data); renderWorship(); dailyDot(); wq('worship');
        if (data.new){ toast('⛪ 정답! 💰 10달란트를 받았어요', 2400); setTimeout(() => giveReward({ verse: id }), 600); }
      } catch (e){ renderWorship('잠시 뒤 다시 해 주세요'); }
    };
    document.getElementById('worship-go').onclick = go;
    document.getElementById('worship-in').onkeydown = e => { e.stopPropagation(); if (e.key === 'Enter') go(); };
    setTimeout(() => { const i = document.getElementById('worship-in'); i && i.focus(); }, 200);
  }
  async function loadWorship(){ try { const { data } = await MSU.client.rpc('get_odyssey_worship'); WOR = data || false; if (WOR && WOR.claimed) worshipCard(WOR); } catch (e){ WOR = false; } }
  document.getElementById('btn-worship').onclick = async () => { WOR = null; renderWorship(); openModal('worship-modal'); if (typeof msuOn === 'function' && msuOn()){ await loadWorship(); renderWorship(); } };
  async function worshipHello(){
    if (!(typeof msuOn === 'function' && msuOn())) return;
    await loadWorship(); dailyDot();
    if (WOR && !WOR.claimed){ ST.worSeen = ST.worSeen || []; if (!ST.worSeen.includes(WOR.service_date)){ ST.worSeen.push(WOR.service_date); saveST(); setTimeout(() => toast('⛪ 이번 주 예배 암호가 열렸어요! ☰ → ⛪ "이번 주 설교 제목은?"', 3600), 3000); } }
  }

  // ══ 🗓 이번 주 퀘스트: 한국 시간 월요일마다 3개, 다 하면 15달란트 ══
  const kstMonday = () => { const d = new Date(Date.now() + 9 * 3600e3); const w = (d.getUTCDay() + 6) % 7; d.setUTCDate(d.getUTCDate() - w); return d.toISOString().slice(0, 10); };
  const WQ_POOL = [
    { k: 'daily3',   t: '📅 오늘의 퀘스트를 3일 다 하기', n: 3, ok: () => true },
    { k: 'talk10',   t: '🙋 마을 사람 10명과 이야기하기', n: 10, ok: () => true },
    { k: 'scroll3',  t: '📜 숨은 두루마리 조각 3개 찾기', n: 3, ok: () => scrollLeft() },
    { k: 'brick8',   t: '🧱 벽돌 굽기 도전에서 8장 이상', n: 1, ok: () => ST.ch >= 1 || ST.cleared },
    { k: 'frogs12',  t: '🐸 개구리 몰기 도전에서 12마리 이상', n: 1, ok: () => ST.ch > 1 || (ST.ch === 1 && (ST.cleared || ST.step > stepIdx('c2s4'))) },
    { k: 'rhythm70', t: '🥁 소고 찬양 도전에서 70점 이상', n: 1, ok: () => ST.ch > 3 || (ST.ch === 3 && ST.cleared) },
    { k: 'worship',  t: '⛪ 예배 암호(이번 주 설교 제목) 맞히기', n: 1, ok: () => typeof msuOn === 'function' && msuOn() },
    { k: 'visit',    t: '🏠 친구 장막에 놀러 가기', n: 1, ok: () => typeof msuOn === 'function' && msuOn() && (PEOPLE_L || []).some(p => p.rel === 'friend') },
  ];
  function weeklyInit(){
    const wk = kstMonday();
    if (ST.weekly && ST.weekly.week === wk) return;
    let h = [...wk].reduce((a, c) => (a * 37 + c.charCodeAt(0)) % 2147483647, 29);
    const rr = () => { h = (h * 16807) % 2147483647; return (h - 1) / 2147483646; };
    const pool = WQ_POOL.filter(q => { try { return q.ok(); } catch (e){ return false; } }).map(q => [rr(), q.k]).sort((a, b) => a[0] - b[0]).slice(0, 3).map(x => x[1]);
    ST.weekly = { week: wk, q: pool, p: {}, days: [], talked: [], claimed: false }; saveST();
  }
  const wqDef = k => WQ_POOL.find(q => q.k === k);
  const wqDone = k => (ST.weekly.p[k] || 0) >= wqDef(k).n;
  const wqAll = () => ST.weekly && ST.weekly.q.every(wqDone);
  function wq(k, amt = 1){
    weeklyInit(); const W = ST.weekly; if (!W || !W.q.includes(k) || wqDone(k)) return;
    W.p[k] = Math.min(wqDef(k).n, (W.p[k] || 0) + amt); saveST();
    if (wqDone(k)){ toast(`✅ 이번 주 퀘스트: ${wqDef(k).t}`, 2200); if (wqAll()) addMat({ gold: 1 }, '🗓 이번 주 퀘스트 보상', true); if (wqAll()) setTimeout(() => toast('🗓 이번 주 퀘스트를 다 했어요! ☰ → 📅에서 15달란트를 받아요', 2800), 2400); dailyDot(); }
  }
  // ══ 🔨 브살렐의 공방: 재료 모으기 · 만들기 (출 31:2-5, 35:24-27) ══════════════════
  // 재료는 이 기기(ST.mat)에, 만든 물건은 말씀우물 계정(shop_items.game_key 'craft-…')에 남음.
  // 상점(지팡이 4 · 펫 · 머리 모양)과 겹치지 않게: 옷(겉옷·띠) · 신발 · 머리장식은 공방에서만, 지팡이도 서로 다른 종류.
  const MATS = {
    wood:    { ico: '🪵', n: '조각목' },
    bronze:  { ico: '🥉', n: '놋' },
    flax:    { ico: '🌿', n: '삼(베 실)' },
    papyrus: { ico: '🌾', n: '파피루스' },
    wool:    { ico: '🐑', n: '양털' },
    goat:    { ico: '🐐', n: '염소 털' },
    blue:    { ico: '🟦', n: '청색 실' },
    purple:  { ico: '🟪', n: '자색 실' },
    scarlet: { ico: '🟥', n: '홍색 실' },
    silver:  { ico: '🥈', n: '은' },
    gold:    { ico: '🥇', n: '금' },
    onyx:    { ico: '💎', n: '호마노' },
  };
  const MAT_WHERE = {
    wood: '미디안 광야 · 신 광야 · 르비딤의 아카시아 나무(🪓 조각목 베기)',
    bronze: '르비딤 · 시내산의 바위(⛏ 구리 광석 캐기)',
    flax: '애굽 들판의 삼밭(🌿 삼 거두기) — 3장을 마친 뒤',
    papyrus: '애굽 나일 강가(🌾 파피루스 베기) — 3장을 마친 뒤',
    wool: '미디안 양 우리(✂️ 양털 깎기)', goat: '미디안 양 우리(✂️ 양털 깎기)',
    blue: '🐺 양 지키기(애굽 고센 양 우리)', purple: '🐑 흠 없는 어린 양 고르기(애굽 고센)', scarlet: '🐑 흩어진 양 몰기(고센) · 🐦 메추라기 잡기(신 광야)',
    silver: '📅 오늘의 퀘스트를 다 하면 · 🐑 흠 없는 어린 양 고르기 · 3장 완료 선물',
    gold: '🗓 이번 주 퀘스트를 다 하면 · 3장 완료 선물',
    onyx: '❔ 히든 퀘스트에서만 — ☰ 메뉴 → ❔ 히든 퀘스트에서 힌트를 볼 수 있어요',
  };
  const matN = k => (ST.mat && ST.mat[k]) || 0;
  function addMat(obj, why, quiet){
    ST.mat = ST.mat || {}; let total = 0;
    for (const k in obj){ ST.mat[k] = matN(k) + obj[k]; total += obj[k]; }
    saveST();
    if (!quiet || why) setTimeout(() => toast(`${why ? why + ' — ' : ''}${Object.entries(obj).map(([k, n]) => `${MATS[k].ico} ${MATS[k].n} +${n}`).join(' · ')}`, 2800), quiet ? 2600 : 200);
    return total;
  }
  function matBonus(){   // 3장을 마쳤으면 한 번: 애굽 사람들이 준 은금 패물(출 12:35-36)
    if (chaptersDone() >= 3 && !ST.matBonus3){ ST.matBonus3 = true; addMat({ silver: 3, gold: 2 }, '🎁 3장 완료 선물 · 애굽 사람들이 내어 준 은금 패물(출 12:35-36)'); }
  }

