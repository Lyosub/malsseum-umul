  // ══ 📚 두루마리(책) 구조: 「모세와 함께」는 기본으로 들어 있고, 다음 두루마리부터는 따로 된 파일(scrolls/<id>.js)을
  //    그 두루마리를 펼칠 때만 받아요. 진행은 두루마리마다 따로 저장(모세 = ST.ch/step, 나머지 = ST.sp[id]) ══
  const DEV_SCROLL = /[?&]devscroll(=1)?(&|$)/.test(location.search);
  const SCROLL_LIST = [
    { id: 'moses', no: '1', title: '모세와 함께', builtin: true },
    { id: 'lev', no: '2', title: '제사와 절기', soon: true },
    { id: 'wild40', no: '3', title: '광야 40년', soon: true },
    { id: 'joshua', no: '4', title: '여호수아와 함께', soon: true },
    { id: 'judges', no: '5', title: '사사들과 함께', soon: true },
    { id: 'ruth', no: '6', title: '룻과 사무엘', soon: true },
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
  };
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
    if (id !== 'moses' && !(await loadScrollBundle(id))){ if (!opt.boot) toast('📚 두루마리를 불러오지 못했어요. 인터넷 연결을 확인하고 다시 해 보세요', 2800); return false; }
    ST.cur = id; if (id !== 'moses' && !ST.sp[id]) ST.sp[id] = { ch: 0, step: 0, cleared: false, rumor: [] };
    syncStory(); saveST();
    if (opt.boot) return true;
    reachDone = null; renderQuestList(); refreshShow();
    const q = curStep();
    if (q && Z && q.zone !== Z.id){ await travelTo({ id: 'scroll', to: q.zone, spawn: ZONES[q.zone].spawn }); }
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
      const pr = scrollProgress(s.id), cur = ST.cur === s.id, lock = s.id !== 'moses' && !s.dev && chaptersDone() < CHAPTERS.length;
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
