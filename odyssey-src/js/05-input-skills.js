  // ── 조이스틱 입력 ──────────────────────────────────────
  const zone = document.getElementById('joystick-zone');
  const knob = document.getElementById('joystick-knob');
  let joyActive = false, joyVec = {x:0,y:0}, joyTouchId = null;
  const zoneRect = () => zone.getBoundingClientRect();

  // 누른 자리가 조이스틱 중심(떠 있는 조이스틱) — 작은 원의 가운데를 정확히 누르지 않아도 처음 민 방향 그대로 감
  let joyC = null;
  function joyStart(id, cx, cy){
    joyActive = true; joyTouchId = id;
    if (cx !== undefined){
      const r = zone.getBoundingClientRect(), half = r.width / 2;
      const x = Math.max(half + 6, Math.min(innerWidth * 0.5, cx)), y = Math.max(half + 6, Math.min(innerHeight - half - 6, cy));
      zone.style.left = (x - half) + 'px'; zone.style.bottom = (innerHeight - y - half) + 'px'; zone.style.right = 'auto';
      joyC = [x, y];
    } else { const r = zoneRect(); joyC = [r.left + r.width / 2, r.top + r.height / 2]; }
  }
  function joyMove(cx, cy){
    if (!joyActive) return;
    const max = zone.offsetWidth / 2;
    let dx = cx - joyC[0], dy = cy - joyC[1];
    const dist = Math.min(Math.hypot(dx,dy), max);
    const ang = Math.atan2(dy,dx);
    dx = Math.cos(ang)*dist; dy = Math.sin(ang)*dist;
    knob.style.left = (35+dx) + 'px';
    knob.style.top = (35+dy) + 'px';
    const m = dist / max, dz = 0.14;                                   // 데드존: 손가락 떨림으로 엉뚱하게 가지 않게
    const k = m < dz ? 0 : (m - dz) / (1 - dz) / (m || 1);
    joyVec.x = dx / max * k; joyVec.y = dy / max * k;
  }
  function joyEnd(){
    joyActive = false; joyTouchId = null; joyVec.x=0; joyVec.y=0;
    knob.style.left='35px'; knob.style.top='35px';
    zone.style.left = ''; zone.style.bottom = ''; zone.style.right = '';
  }
  zone.addEventListener('touchstart', e=>{ e.preventDefault(); const t=e.changedTouches[0]; joyStart(t.identifier); joyMove(t.clientX, t.clientY); }, {passive:false});
  const joyHit = document.getElementById('joy-hit');
  joyHit.addEventListener('touchstart', e=>{ e.preventDefault(); if (joyActive) return; const t=e.changedTouches[0]; joyStart(t.identifier, t.clientX, t.clientY); joyMove(t.clientX, t.clientY); }, {passive:false});
  window.addEventListener('touchmove', e=>{
    for (const t of e.changedTouches){ if (t.identifier===joyTouchId){ joyMove(t.clientX, t.clientY); } }
  }, {passive:false});
  window.addEventListener('touchend', e=>{
    for (const t of e.changedTouches){ if (t.identifier===joyTouchId){ joyEnd(); } }
  });
  window.addEventListener('touchcancel', e=>{
    for (const t of e.changedTouches){ if (t.identifier===joyTouchId){ joyEnd(); } }
  });
  // 마우스(데스크탑 테스트용)
  let mouseDown=false;
  zone.addEventListener('mousedown', e=>{ mouseDown=true; joyStart('m'); joyMove(e.clientX,e.clientY); });
  window.addEventListener('mousemove', e=>{ if(mouseDown) joyMove(e.clientX,e.clientY); });
  window.addEventListener('mouseup', ()=>{ if(mouseDown){ mouseDown=false; joyEnd(); } });

  // ── 줌 입력 ──────────────────────────────────────────
  renderer.domElement.addEventListener('wheel', e => { e.preventDefault(); setZoom(zoomTarget * Math.exp(e.deltaY * 0.0012)); }, { passive:false });
  // 화면(캔버스) 위 두 손가락 핀치 — 조이스틱·버튼 터치와 겹치지 않게 캔버스에서 시작한 터치만 사용
  const pinch = { ids: [], startDist: 0, startZoom: 1 };
  let dragging = false, dragId = null, dragX = 0, dragY = 0;
  function dragBy(dx, dy){
    if (typeof homeEdit !== 'undefined' && homeEdit) return;
    camYaw -= dx * 0.0065;
    camPitch = THREE.MathUtils.clamp(camPitch + dy * 0.0045, PITCH_MIN, PITCH_MAX);
  }
  renderer.domElement.addEventListener('mousedown', e => { dragging = true; dragId = 'm'; dragX = e.clientX; dragY = e.clientY; });
  window.addEventListener('mousemove', e => { if (dragId === 'm'){ dragBy(e.clientX - dragX, e.clientY - dragY); dragX = e.clientX; dragY = e.clientY; } });
  window.addEventListener('mouseup', () => { if (dragId === 'm'){ dragging = false; dragId = null; } });
  renderer.domElement.addEventListener('touchstart', e => {
    if (e.targetTouches.length === 1 && dragId === null){ const t = e.changedTouches[0]; dragId = t.identifier; dragging = true; dragX = t.clientX; dragY = t.clientY; }
    else if (pinch.ids.length >= 2){ dragging = false; dragId = null; }   // 두 손가락이면 회전 멈추고 줌
  }, { passive:true });
  renderer.domElement.addEventListener('touchmove', e => {
    if (dragId === null || pinch.ids.length >= 2) return;
    for (const t of e.changedTouches) if (t.identifier === dragId){ e.preventDefault(); dragBy(t.clientX - dragX, t.clientY - dragY); dragX = t.clientX; dragY = t.clientY; }
  }, { passive:false });
  const dragEnd = e => { for (const t of e.changedTouches) if (t.identifier === dragId){ dragging = false; dragId = null; } };
  renderer.domElement.addEventListener('touchend', dragEnd);
  renderer.domElement.addEventListener('touchcancel', dragEnd);
  const touchDist = (a, b) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  renderer.domElement.addEventListener('touchstart', e => {
    for (const t of e.changedTouches) if (pinch.ids.length < 2) pinch.ids.push(t.identifier);
    if (pinch.ids.length === 2){
      const ts = [...e.touches].filter(t => pinch.ids.includes(t.identifier));
      if (ts.length === 2){ pinch.startDist = touchDist(ts[0], ts[1]); pinch.startZoom = zoomTarget; }
    }
  }, { passive:true });
  renderer.domElement.addEventListener('touchmove', e => {
    if (pinch.ids.length !== 2) return;
    const ts = [...e.touches].filter(t => pinch.ids.includes(t.identifier));
    if (ts.length === 2 && pinch.startDist > 10){ e.preventDefault(); setZoom(pinch.startZoom * pinch.startDist / touchDist(ts[0], ts[1])); }
  }, { passive:false });
  const pinchEnd = e => { for (const t of e.changedTouches) pinch.ids = pinch.ids.filter(id => id !== t.identifier); };
  renderer.domElement.addEventListener('touchend', pinchEnd);
  renderer.domElement.addEventListener('touchcancel', pinchEnd);
  document.getElementById('zoom-in').addEventListener('click', () => setZoom(zoomTarget / 1.25));
  document.getElementById('zoom-out').addEventListener('click', () => setZoom(zoomTarget * 1.25));
  window.addEventListener('keydown', e => { if (e.key === '=' || e.key === '+') setZoom(zoomTarget / 1.25); if (e.key === '-') setZoom(zoomTarget * 1.25); });

  // 키보드(WASD/화살표). Shift = 달리기.
  const keys = {};
  window.addEventListener('keydown', e=>keys[e.key.toLowerCase()]=true);
  window.addEventListener('keyup', e=>keys[e.key.toLowerCase()]=false);
  window.addEventListener('blur', ()=>{ for (const k in keys) keys[k]=false; });

  // ── 게임패드(Gamepad API) ──────────────────────────────
  let gpIndex = null;
  window.addEventListener('gamepadconnected', e=>{ gpIndex = e.gamepad.index; });
  window.addEventListener('gamepaddisconnected', ()=>{ gpIndex = null; });

  // ── 왼쪽 행동 버튼: 달리기(누르는 동안) + 지팡이 들기(제스처) ──
  const runBtn = document.getElementById('run-btn');
  let runHeld = false;
  function setRunHeld(v){ runHeld = v; }
  runBtn.addEventListener('touchstart', e=>{ e.preventDefault(); setRunHeld(true); }, {passive:false});
  runBtn.addEventListener('touchend', e=>{ e.preventDefault(); setRunHeld(false); }, {passive:false});
  runBtn.addEventListener('touchcancel', ()=>setRunHeld(false));
  runBtn.addEventListener('mousedown', ()=>setRunHeld(true));
  window.addEventListener('mouseup', ()=>setRunHeld(false));

  // ── 스태미나: 달리면 닳고, 다 닳으면 지쳐서 한동안 걷기만 가능, 쉬면 서서히 회복 ──
  const STAMINA = {
    drainSec: 13.0,   // 2026-09-25 "달리기 좀 더 늘리기"로 9 → 13초      // 가득 찬 상태에서 이만큼 달리면 바닥(전도사님 요청으로 두 배)
    regenSec: 4.0,      // 바닥에서 가득 찰 때까지
    regenDelay: 0.6,    // 달리기를 멈춘 뒤 회복이 시작되기까지
    recoverAt: 0.3,     // 지친 상태가 풀리는 지점
  };
  let stamina = 1, exhausted = false, sinceRun = 99;
  const staminaBar = document.getElementById('stamina-bar');
  const RING_LEN = 2 * Math.PI * 41;
  staminaBar.style.strokeDasharray = RING_LEN;
  let lastRingDraw = -1;
  function drawStamina(){
    const v = Math.round(stamina * 100);
    if (v === lastRingDraw) return;
    lastRingDraw = v;
    staminaBar.style.strokeDashoffset = RING_LEN * (1 - stamina);
    staminaBar.classList.toggle('empty', exhausted);
    staminaBar.classList.toggle('low', !exhausted && stamina < 0.3);
  }
  drawStamina();

  // ── 한 번 재생하는 동작(점프·스킬 동작) 공통 ─────────────
  // lockMove: 재생 중 이동을 막을지(스킬 동작) / 점프는 이동 유지
  let oneShot = null;
  function playOneShot(name, { lockMove = true, startAt = 0, timeScale = 1, fade = 0.15 } = {}){
    const a = actions[name];
    if (!a || oneShot) return false;
    oneShot = { name, lockMove };
    gestureLock = lockMove;
    a.reset(); a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = false;
    a.time = startAt; a.timeScale = timeScale;
    a.setEffectiveWeight(1).fadeIn(fade).play();
    if (currentAnim && actions[currentAnim] && currentAnim !== name) actions[currentAnim].fadeOut(fade);
    currentAnim = name;
    return true;
  }
  function endOneShot(action){
    if (!oneShot || actions[oneShot.name] !== action) return;
    oneShot = null; gestureLock = false;
    playAnim(moveSpeed > 0.35 ? 'Walk' : 'Idle', 0.25);
  }

  // ── 기본 동작: 점프 (처음부터 사용 가능) ──
  // Meshy 'Regular_Jump'는 동작 자체에 뛰어오르는 높이가 들어 있음 → 물리 계산 없이 동작으로 점프.
  // 앞 0.5초 웅크리는 준비 구간 중 0.3초는 건너뛰고 1.25배 빠르게 — 버튼 반응이 굼뜨지 않게.
  const jumpBtn = document.getElementById('jump-btn');
  // 앞에 낮은 담·상자가 있으면: 올라설 수 있는 건 위로(벽타기), 얇은 담은 넘어가기(담넘기)
  let climb = null;
  const CLIMB_MIN = 0.5, CLIMB_MAX = 2.8;
  function insideBox(b, x, z, m){ const c = Math.cos(b.rot), sn = Math.sin(b.rot), rx = x - b.x, rz = z - b.z; return Math.abs(rx * c - rz * sn) < b.hx + m && Math.abs(rx * sn + rz * c) < b.hz + m; }
  function blockedAt(x, z, feet){
    for (const b of boxes) if (b.top > feet + 0.3 && insideBox(b, x, z, PR * 0.8)) return true;
    for (const o of obstacles) if (Math.hypot(x - o.x, z - o.z) < o.r + PR * 0.8) return true;
    return false;
  }
  function findClimb(){
    const fx = Math.sin(heading), fz = -Math.cos(heading), P = player.position, feet = P.y;
    for (const d of [0.45, 0.7, 0.95]){
      const px = P.x + fx * d, pz = P.z + fz * d;
      let hit = null;
      for (const b of boxes){ const dh = b.top - feet; if (dh < CLIMB_MIN || dh > CLIMB_MAX) continue; if (insideBox(b, px, pz, 0.05)){ hit = { b, top: b.top }; break; } }
      if (!hit) for (const o of obstacles){ if (!o.h) continue; const dh = o.h - feet; if (dh < CLIMB_MIN || dh > CLIMB_MAX) continue; if (Math.hypot(px - o.x, pz - o.z) < o.r + 0.05){ hit = { o, top: o.h }; break; } }
      if (!hit) continue;
      // 올라서기: 윗면에 설 수 있고 충분히 넓으면 그 위로
      if (hit.b && hit.b.stand){ const tx = P.x + fx * (d + 0.45), tz = P.z + fz * (d + 0.45); if (insideBox(hit.b, tx, tz, 0.1)) return { tx, tz, ty: hit.b.top, top: hit.top, kind: 'up' }; }
      // 넘어가기: 담 너머 빈 곳까지
      for (let e = d + 0.3; e < d + 3.2; e += 0.1){
        const tx = P.x + fx * e, tz = P.z + fz * e, g = heightAt(tx, tz);
        if (!blockedAt(tx, tz, g) && Math.abs(g - feet) < 1.2) return { tx, tz, ty: groundAt(tx, tz, g + 0.1), top: hit.top, kind: 'over' };
      }
      return null;
    }
    return null;
  }
  function startClimb(c){
    try { dq('climb'); } catch (e){}
    const P = player.position, h = Math.max(0.6, c.top - P.y);
    climb = { t: 0, dur: (c.kind === 'up' ? 0.42 : 0.55) + h * 0.12, x0: P.x, z0: P.z, y0: P.y, ...c };
    grounded = true; vy = 0;
    playOneShot('Jump', { lockMove: false, startAt: 0.5, timeScale: 1.25, fade: 0.08 });
    jumpBtn.classList.add('active'); setTimeout(() => jumpBtn.classList.remove('active'), 150);
  }
  function updateClimb(dt){
    if (!climb) return false;
    const c = climb; c.t += dt; const k = Math.min(1, c.t / c.dur), P = player.position;
    const kh = k < 0.45 ? 0 : (k - 0.45) / 0.55, e = kh * kh * (3 - 2 * kh);          // 먼저 오르고, 그다음 앞으로
    P.x = c.x0 + (c.tx - c.x0) * e; P.z = c.z0 + (c.tz - c.z0) * e;
    const up = Math.min(1, k / 0.45), over = c.top + 0.25;
    P.y = k < 0.45 ? c.y0 + (over - c.y0) * Math.sin(up * Math.PI / 2) : over + (c.ty - over) * kh * kh;
    if (k >= 1){ P.y = c.ty; climb = null; grounded = true; vy = 0; }
    return true;
  }
  function doJump(){
    if (gestureLock || !grounded || climb) return;
    { const c = findClimb(); if (c){ startClimb(c); tut.jumps++; return; } }
    vy = JUMP_V; grounded = false; tut.jumps++;
    if (playOneShot('Jump', { lockMove:false, startAt:0.5, timeScale:1.0, fade:0.08 })){
      jumpBtn.classList.add('active'); setTimeout(()=>jumpBtn.classList.remove('active'), 150);
    }
  }
  jumpBtn.addEventListener('touchstart', e=>{ e.preventDefault(); doJump(); }, {passive:false});
  jumpBtn.addEventListener('mousedown', doJump);
  window.addEventListener('keydown', e=>{ if (e.key===' ' && !e.repeat){ e.preventDefault(); doJump(); } });

  // ── 스킬: 퀘스트를 깨면 얻는다(처음엔 없음) ──────────────
  // 새 스킬은 이 목록에 추가만 하면 된다. unlockBy = 이 퀘스트(id)를 완료하면 획득.
  const SKILLS = {
    staff: {
      name: '지팡이 들기', short: '지팡이', ico: '🦯', anim: 'Wave',
      desc: '떨기나무 불꽃 가운데서 하나님은 모세에게 "네 손에 있는 것이 무엇이냐"고 물으셨어요(출애굽기 4:2).\n이제 너도 지팡이를 들 수 있어요. 특별한 장소에서 써 보세요!',
      use(){
        if (nearPoint && nearPoint.data.id === 'sea' && curStep() && curStep().skillAt === 'sea') toast('🌊 모세와 함께 지팡이를 들었어요…', 1400);
        else toast('🦯 지팡이를 들어올렸다', 1100);
      }
    },
  };
  SKILLS.pray = {
    name: '기도', short: '기도', ico: '🙏', anim: 'Dig', cool: 15,
    desc: '"모세와 아론이 바로를 떠나 나가서 바로에게 내리신 개구리에 대하여 모세가 여호와께 간구하매"(출애굽기 8:12)\n길을 모르겠을 때 기도해 보세요. 가야 할 곳에 빛이 비춰요.',
    use(){ prayBeam(); dq('pray'); }
  };
  SKILLS.warp = {
    name: '길 떠나기', short: '이동', ico: '🧭', anim: 'Wave',
    desc: '두루마리마을로는 언제든, 이야기를 마친 마을과 지금 이야기가 있는 마을로는 바로 갈 수 있어요.',
    use(){ openWarp(); }
  };
  SKILLS.praise = {
    name: '찬양', short: '찬양', ico: '🎵', anim: 'Wave', cool: 25,
    desc: '"내가 여호와를 찬송하리니 그는 높고 영화로우심이요"(출애굽기 15:1)\n찬양하면 힘이 나요! 10초 동안 더 빨리 걷고, 숨찬 것도 금방 회복돼요.',
    use(){ praiseBoost(); }
  };
  const SAVE_KEY = 'inodyssey.proto.skills.v1';
  const unlocked = new Set();
  try { (JSON.parse(localStorage.getItem(SAVE_KEY) || '[]')).forEach(id => SKILLS[id] && unlocked.add(id)); } catch(e){}
  if (/[?&]reset(&|$)/.test(location.search)) { unlocked.clear(); try { localStorage.removeItem(SAVE_KEY); localStorage.removeItem('inodyssey-tutorial'); } catch(e){} }
  const skillBar = document.getElementById('skill-bar');
  // 스킬은 「✨ 스킬」 버튼 하나로 접혀 있다가, 누르면 왼쪽으로 촤라락 펼쳐짐(쓰고 나면 다시 접힘)
  let skillOpen = false, skillNew = null, skillCloseT = 0;
  function setSkillOpen(on){
    skillOpen = on; skillBar.classList.toggle('open', on);
    clearTimeout(skillCloseT); if (on) skillCloseT = setTimeout(() => setSkillOpen(false), 6000);
    if (on && skillNew){ skillBar.querySelector('.skill-toggle').classList.remove('has-new'); }
  }
  function renderSkills(newId){
    skillBar.innerHTML = '';
    if (!unlocked.size) return;
    if (newId) skillNew = newId;
    const tg = document.createElement('div');
    tg.className = 'skill-btn skill-toggle' + (skillNew ? ' has-new' : '');
    tg.innerHTML = `<span class="ico">✨</span>스킬`;
    const toggle = e => { e.preventDefault(); setSkillOpen(!skillOpen); };
    tg.addEventListener('click', toggle); tg.addEventListener('touchstart', toggle, { passive:false });
    skillBar.appendChild(tg);
    const list = document.createElement('div'); list.className = 'skill-list'; skillBar.appendChild(list);
    [...unlocked].forEach((id, i) => {
      const sk = SKILLS[id];
      const b = document.createElement('div');
      b.style.setProperty('--i', i);
      b.className = 'skill-btn' + (id === skillNew ? ' new' : '');
      b.innerHTML = `<span class="ico">${sk.ico}</span>${sk.short}`;
      b.title = `${sk.name} (키보드 ${i+1})`;
      const use = e => { if (e) e.preventDefault(); if (id === skillNew){ skillNew = null; b.classList.remove('new'); } setSkillOpen(false); useSkill(id); };
      b.addEventListener('click', use);
      b.addEventListener('touchstart', use, { passive:false });
      list.appendChild(b);
    });
  }
  const skillCool = {};
  function useSkill(id){
    const sk = SKILLS[id];
    if (!sk || !unlocked.has(id) || gestureLock) return;
    if (sk.cool){ const left = (skillCool[id] || 0) - performance.now() / 1000; if (left > 0){ toast(`${sk.ico} ${Math.ceil(left)}초 뒤에 다시 쓸 수 있어요`, 1200); return; } skillCool[id] = performance.now() / 1000 + sk.cool; }
    playOneShot(sk.anim, { lockMove:true });
    sk.use();
    const q = curStep();
    if (q && q.skillAt && Z && q.zone === Z.id && id === 'staff' && nearPoint && nearPoint.data.id === q.skillAt && !q._done){ q._done = true; setTimeout(() => { q._done = false; completeTask(q); }, 1300); }
  }
  function unlockSkill(id, quiet){
    const sk = SKILLS[id];
    if (!sk || unlocked.has(id)) return;
    unlocked.add(id);
    try { localStorage.setItem(SAVE_KEY, JSON.stringify([...unlocked])); } catch(e){}
    renderSkills(quiet ? null : id);
    if (quiet) return;
    document.getElementById('skill-modal-ico').textContent = sk.ico;
    document.getElementById('skill-modal-name').textContent = sk.name;
    document.getElementById('skill-modal-desc').textContent = sk.desc + '\n\n✨ 이 스킬은 오른쪽 아래 「✨ 스킬」 버튼 안에 들어 있어요. 누르면 스킬들이 펼쳐져요!';
    setTimeout(() => document.getElementById('skill-modal').classList.remove('hidden'), 400);
  }
  document.getElementById('skill-modal-ok').addEventListener('click', () => {
    document.getElementById('skill-modal').classList.add('hidden');
    // 어디에 들어갔는지 직접 보여 주기: 잠깐 펼쳐서 새 스킬을 반짝이게
    setTimeout(() => { setSkillOpen(true); toast('✨ 새 스킬은 여기 「스킬」 버튼 안에 있어요!', 2400); }, 250);
  });
  window.addEventListener('keydown', e => {
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= 9 && !e.repeat){ const id = [...unlocked][n-1]; if (id) useSkill(id); }
  });
  renderSkills();

