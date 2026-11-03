  // ── 상호작용 버튼 ──────────────────────────────────────
  const interactBtn = document.getElementById('interact-btn');
  const infoPanel = document.getElementById('info-panel');
  const infoTitle = document.getElementById('info-title');
  const infoBody = document.getElementById('info-body');
  let nearPoint = null;
  let talking = false;         // NPC와 대화 중이면 말하는 동작
  let talkingWith = null;      // 지금 대화 중인 NPC(그 NPC도 말하는 동작)
  const doorFade = (() => { const e = document.createElement('div'); e.style.cssText = 'position:fixed;inset:0;background:#120c06;opacity:0;pointer-events:none;transition:opacity .32s;z-index:40'; document.body.appendChild(e); return e; })();
  function passDoor(d){
    if (traveling) return; traveling = true;
    if (d.id === 'home-out' && typeof VISIT !== 'undefined' && VISIT) setTimeout(endVisit, 340);
    doorFade.style.opacity = '1';
    setTimeout(() => {
      const [x, z] = d.tele;
      player.position.set(x, heightAt(x, z), z); vy = 0; grounded = true;
      heading = Math.atan2(d.look[0] - x, -(d.look[1] - z)); camYaw = -heading;
      camera.position.set(x + Math.sin(camYaw) * 8, player.position.y + 5, z + Math.cos(camYaw) * 8);
      updateRoomVis();
      doorFade.style.opacity = '0';
      setTimeout(() => { traveling = false; }, 340);
    }, 340);
  }
  const GUEST_OK = new Set(['a_shop', 'map', 'links', 'memorial']);   // 로그인 없이도 둘러볼 수 있는 곳
  function openInfo(){
    if (!nearPoint || dlgState || !mg.el.classList.contains('hidden')) return;
    const d = nearPoint.data;
    // 로그인하지 않은 사람은 조작 연습(걷기·상점 둘러보기 등)까지만 — 이야기를 시작하려고 하면 로그인 안내
    if (MSU.client && MSU.ready && !MSU.session && !SHOP_MOCK && !GUEST_OK.has(d.id)){ openModal('login-modal'); return; }
    if (d.type === 'door'){ passDoor(d); return; }
    if (d.type === 'exit'){
      if (d.needStep && !ST.cleared && ST.step < stepIdx(d.needStep)){ toast(d.lockMsg || '아직 갈 수 없어요', 2000); return; }
      travelTo(d); return;
    }
    if (nearPoint.isDig){ doDig(nearPoint); return; }
    if (nearPoint.isWarn){ doWarn(nearPoint); return; }
    if (d.gather){ gatherGame(d.gather, nearPoint); return; }
    if (d.challenge){ startChallenge(d.challenge); return; }
    if (d.help){ helpTired(nearPoint); return; }
    if (storyInteract(nearPoint)) return;
    if (hqTalk(nearPoint)) return;
    if (sideTalk(nearPoint)) return;
    if (d.id === 'a_shop'){ openShop(); return; }
    if (d.id === 'a_bezalel'){ openCraft(); return; }
    if (d.id === 'library'){ openLibrary(); return; }
    if (d.id === 'a_keeper'){ openReplay(); return; }
    if (d.id === 'memorial'){ openExhibit(); return; }
    if (d.id === 'map'){ openJourney(); return; }
    if (d.id === 'links'){ openLinks(); return; }
    if (d.id === 'scroll_gate'){ openScrollGate(); return; }
    { const q = curStep(); if (q && q.skillAt === d.id){ toast('🦯 오른쪽 아래 「✨ 스킬」을 누르고 「지팡이」를 골라 보세요!', 2600); return; } }
    simple(d.title, d.body || '…', d.model ? nearPoint : null);
  }
  interactBtn.addEventListener('click', openInfo);
  window.addEventListener('keydown', e=>{ if ((e.key==='e' || e.key==='Enter') && !e.repeat){ if (dlgState) document.getElementById('dlg-next').click(); else openInfo(); } });
  if (false) document.getElementById('info-close').addEventListener('click', ()=>{
    infoPanel.classList.add('hidden');
    talking = false; talkingWith = null;
  });

  // 충돌: 원형 장애물 밖으로 밀어내기(나무·큰 바위·NPC를 통과하지 않게)
  const PR = 0.42; // 플레이어 몸 반지름
  function resolveCollisions(pos, feetY){
    for (const o of obstacles){
      const dx = pos.x - o.x, dz = pos.z - o.z;
      const d = Math.hypot(dx, dz), min = o.r + PR;
      if (d < min && d > 1e-4){ pos.x = o.x + dx/d*min; pos.z = o.z + dz/d*min; }
    }
    for (const b of boxes){
      if (feetY >= b.top - 0.25) continue;             // 윗면보다 높이 있으면 부딪히지 않음(위에 올라섬)
      const c = Math.cos(b.rot), s = Math.sin(b.rot);
      const rx = pos.x - b.x, rz = pos.z - b.z;
      const lx = rx * c - rz * s, lz = rx * s + rz * c;   // 상자 기준 좌표
      const qx = THREE.MathUtils.clamp(lx, -b.hx, b.hx), qz = THREE.MathUtils.clamp(lz, -b.hz, b.hz);
      let ox = lx - qx, oz = lz - qz, d = Math.hypot(ox, oz);
      if (d >= PR) continue;
      if (d < 1e-4){                                      // 상자 안쪽 → 가장 가까운 면으로
        const px = b.hx - Math.abs(lx), pz = b.hz - Math.abs(lz);
        if (px < pz){ ox = Math.sign(lx) || 1; oz = 0; } else { ox = 0; oz = Math.sign(lz) || 1; }
        d = 0;
      } else { ox /= d; oz /= d; }
      const push = PR - d + (d === 0 ? Math.min(b.hx - Math.abs(lx), b.hz - Math.abs(lz)) : 0);
      const nlx = lx + ox * push, nlz = lz + oz * push;
      pos.x = b.x + nlx * c + nlz * s; pos.z = b.z - nlx * s + nlz * c;
    }
  }
  // 발밑 높이: 지형 + (올라설 수 있는 상자 윗면 중 발이 닿는 것)
  function groundAt(x, z, feetY){
    let g = heightAt(x, z);
    for (const b of boxes){
      if (!b.stand || b.top > feetY + 0.3) continue;
      const c = Math.cos(b.rot), s = Math.sin(b.rot), rx = x - b.x, rz = z - b.z;
      const lx = rx * c - rz * s, lz = rx * s + rz * c;
      if (Math.abs(lx) <= b.hx + 0.15 && Math.abs(lz) <= b.hz + 0.15) g = Math.max(g, b.top);
    }
    return g;
  }
  // 수직 물리(점프·낙하)
  const GRAVITY = 22, JUMP_V = 8.4;   // 최고 약 1.6유닛(≈1.2m) — 장작·짐·구유·작은 바위에 올라설 수 있음
  let vy = 0, grounded = true;

  // ── 메인 루프 ──────────────────────────────────────────
  let heading = Math.PI;
  const clock = new THREE.Clock();
  const desiredCamPos = new THREE.Vector3();
  const WALK_SPEED = 2.6, RUN_SPEED = 6.0; // 동작 원래 속도(걷기 1.62·달리기 2.90 유닛/초)의 1.2~1.45배 — 동작이 빨리감기처럼 보이지 않게
  let moveSpeed = 0;           // 부드러운 가감속
  let hintFaded = false;

  // 성능 측정
  const perfEl = document.getElementById('perf');
  if (SHOW_PERF) perfEl.style.display = 'block';
  let perfFrames = 0, perfTime = 0, perfWorst = 0;

  function animate(){
    requestAnimationFrame(animate);
    const rawDt = clock.getDelta();
    updateAutoQuality(rawDt);
    const dt = Math.min(rawDt, 0.05);

    // 입력 통합: 조이스틱 + 키보드 + 게임패드
    let mx=0, my=0;
    mx += joyVec.x; my += joyVec.y;
    if (keys['w']||keys['arrowup']) my -= 1;
    if (keys['s']||keys['arrowdown']) my += 1;
    if (keys['a']||keys['arrowleft']) mx -= 1;
    if (keys['d']||keys['arrowright']) mx += 1;
    let gpRunHeld = false;
    if (gpIndex !== null){
      const gp = navigator.getGamepads()[gpIndex];
      if (gp){
        const ax = gp.axes[0]||0, ay = gp.axes[1]||0;
        if (Math.hypot(ax, ay) > 0.15){ mx += ax; my += ay; } // 스틱 데드존
        gpRunHeld = gp.buttons[0] && gp.buttons[0].pressed;
      }
    }
    let mag = Math.hypot(mx,my);
    if (mag > 1){ mx/=mag; my/=mag; mag = 1; }
    const moving = mag > 0.05 && !gestureLock;
    const wantRun = runHeld || keys['shift'] || gpRunHeld;

    // 스태미나
    const isRunning = wantRun && moving && !exhausted;
    updateTutorial(dt, isRunning && moveSpeed > 1);
    if (isRunning){
      stamina -= dt / STAMINA.drainSec; sinceRun = 0;
      if (stamina <= 0){
        stamina = 0; exhausted = true;
        runBtn.classList.add('shake'); setTimeout(()=>runBtn.classList.remove('shake'), 400);
        toast('😮‍💨 숨이 차요! 조금 걸으면서 쉬어요', 1500);
      }
    } else {
      sinceRun += dt;
      if (sinceRun > STAMINA.regenDelay) stamina = Math.min(1, stamina + dt / STAMINA.regenSec);
      if (exhausted && stamina >= STAMINA.recoverAt) exhausted = false;
    }
    runBtn.classList.toggle('active', isRunning);
    if (isRunning && moveSpeed > 1) dqRun(moveSpeed * dt);
    runBtn.classList.toggle('exhausted', exhausted);
    drawStamina();

    const boost = (performance.now() < praiseUntil ? 1.35 : 1) * (chase.gust > 0 && chase.on ? 0.55 : 1);
    const targetSpeed = (moving ? (isRunning ? RUN_SPEED : WALK_SPEED * Math.min(1, Math.max(0.45, mag / 0.6))) : 0) * boost;   // 조금만 밀어도 제 속도
    moveSpeed += (targetSpeed - moveSpeed) * Math.min(1, dt * 10);

    if (moving){
      const targetHeading = Math.atan2(mx, -my) - camYaw; // 카메라가 바라보는 방향 기준으로 이동
      let diff = targetHeading - heading;
      while (diff > Math.PI) diff -= Math.PI*2;
      while (diff < -Math.PI) diff += Math.PI*2;
      heading += diff * Math.min(1, dt*14); // 방향 전환: 민 방향으로 빠르게(너무 느리면 원하는 대로 안 가는 느낌)
      if (!hintFaded){ hintFaded = true; setTimeout(()=>document.getElementById('hint').classList.add('fade'), 2500); }
    }
    if (updateClimb(dt)){ moveSpeed = 0; }
    else if (moveSpeed > 0.01){
      player.position.x += Math.sin(heading) * moveSpeed * dt;
      player.position.z += -Math.cos(heading) * moveSpeed * dt;
      resolveCollisions(player.position, player.position.y);
      const xMax = Z && Z.room && player.position.z < -29 && player.position.z > -55 ? 69 : 65;   // 알현실 동쪽 벽(x 69)까지는 들어갈 수 있게
      player.position.x = Math.max(-65, Math.min(xMax, player.position.x));
      player.position.z = Math.max(-65, Math.min(65, player.position.z));
    }
    // 모델 정면(+Z)을 이동 방향(sin h, -cos h)에 맞춤
    player.rotation.y = Math.PI - heading;
    {
      const g = groundAt(player.position.x, player.position.z, player.position.y);
      if (climb){}
      else if (grounded){
        if (player.position.y - g > 0.45){ grounded = false; vy = 0; }   // 윗면에서 걸어 나가면 떨어짐
        else player.position.y = g;                                      // 지형 굴곡은 그대로 따라감
      }
      if (!grounded){
        vy -= GRAVITY * dt;
        player.position.y += vy * dt;
        if (player.position.y <= g && vy <= 0){
          player.position.y = g; vy = 0; grounded = true;
          if (oneShot && oneShot.name === 'Jump') endOneShot(actions.Jump); // 착지하면 바로 걷기/대기로
        }
      }
    }

    // 애니메이션 상태: 대기 ↔ 걷기 ↔ 달리기, 재생 속도는 실제 이동 속도에 맞춰 발 미끄러짐 방지
    if (mixer){
      if (!oneShot){
        if (moveSpeed < 0.35) playAnim(talking && actions.Talk ? 'Talk' : 'Idle');
        else if (isRunning || moveSpeed > (WALK_SPEED + RUN_SPEED) / 2) playAnim('Run');
        else playAnim('Walk');
        if (actions.Walk) actions.Walk.timeScale = THREE.MathUtils.clamp(moveSpeed / natural.Walk, 0.7, 1.75);
        if (actions.Run) actions.Run.timeScale = THREE.MathUtils.clamp(moveSpeed / natural.Run, 0.8, 1.95);
      }
      mixer.update(dt);
    }

    // 카메라 추적
    zoom += (zoomTarget - zoom) * Math.min(1, dt*10);
    if (keys['q']) camYaw -= dt * 1.8;
    if (keys[']']) camYaw += dt * 1.8;
    const cd = CAM_DIST * zoom, cp = Math.cos(camPitch);
    desiredCamPos.set(
      player.position.x + Math.sin(camYaw) * cp * cd,
      player.position.y + Math.sin(camPitch) * cd,
      player.position.z + Math.cos(camYaw) * cp * cd
    );
    // 회전은 즉시 따라가고(드래그 반응), 이동 추적만 부드럽게
    camera.position.lerp(desiredCamPos, dragging ? 1 : 1-Math.pow(0.001, dt));
    camera.position.y = Math.max(camera.position.y, heightAt(camera.position.x, camera.position.z) + 0.6);
    camera.lookAt(player.position.x, player.position.y+LOOK_Y, player.position.z);
    applyCine(dt); applyHomeCam(dt);

    // 카메라와 플레이어 사이를 가리는 천막·야자수·큰 바위는 반투명하게(항상 주인공이 보이도록)
    {
      const cx = camera.position.x, cz = camera.position.z;
      const vx = player.position.x - cx, vz = player.position.z - cz, len2 = vx*vx + vz*vz;
      for (const p of occluders){
        const t = ((p.x-cx)*vx + (p.z-cz)*vz) / len2;
        const px = cx + vx*t, pz = cz + vz*t;
        const blocking = t > 0 && t < 1.0 && Math.hypot(p.x-px, p.z-pz) < p.r + 0.6;
        const target = blocking ? 0.3 : 1;
        if (p.fade !== target){
          p.fade += (target - p.fade) * Math.min(1, dt*8);
          if (Math.abs(p.fade - target) < 0.01) p.fade = target;
          p.mats.forEach(mt => { mt.opacity = p.fade; mt.depthWrite = p.fade > 0.99; });
        }
      }
    }

    // 그림자 카메라·스카이돔이 플레이어를 따라감
    sun.position.copy(player.position).add(SUN_OFFSET);
    sun.target.position.copy(player.position);
    sky.position.copy(camera.position); farRing.position.set(camera.position.x, 16, camera.position.z);
    skyMat.uniforms.time.value = performance.now() * 0.001;

    // 근접 포인트 체크
    const now = performance.now();
    try { updateFollow(dt); } catch (e){}
    let closest = null, closestDist = Infinity;
    camera.updateMatrixWorld(); _projM.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse); _frustum.setFromProjectionMatrix(_projM);
    markers.forEach(m=>{
      const d = Math.hypot(player.position.x-m.mesh.position.x, player.position.z-m.mesh.position.z);
      if (m.hidden){ if (m.tag) m.tag.visible = false; return; }
      if (Z.room && m.data.model) m.mesh.visible = !inRoom(m.mesh.position.x, m.mesh.position.z) || roomObjs.shown;
      if (m.tag){
        const q = curStep(), isT = !!(q && Z && q.zone === Z.id && ((m.isDig && !m.done) || (m.isWarn && !m.done) || q.npc === m.data.id || q.point === m.data.id || q.exit === m.data.id || q.skillAt === m.data.id || doorTarget === m.data.id || (q.rumor && rumorOk(q, m.data.id) && !ST.rumor.includes(m.data.id))));
        drawTag(m.tag, isT);
        m.tag.visible = d < (isT ? 40 : 16) && !dlgState;
        if (m.tag.visible && m.headBone){ m.headBone.getWorldPosition(_tagV); m.tag.position.y = _tagV.y - m.mesh.position.y + 0.42; }   // 머리 꼭대기 위
      }
      if (m.data.model){
        // NPC: 가까이 오면 주인공 쪽으로 몸을 돌리고, 멀어지면 원래 방향으로. 대화 중엔 말하는 동작.
        // 성능: 30유닛 밖 NPC는 동작 계산 중지, 12유닛 밖은 두 프레임에 한 번(시간은 두 배로)
        m.skip = (m.skip || 0) + 1;
        // 일과(이동 포함): 가까우면 매 프레임, 먼 사람은 화질에 따라 몇 프레임에 한 번(시간은 그만큼 모아서)
        if (m.ai){ m.aiDt = (m.aiDt || 0) + dt; if (d < 20 || Q.aiSkip === 1 || m.skip % Q.aiSkip === 0 || m.ai.player){ npcThink(m, Math.min(m.aiDt, 0.15), d); m.aiDt = 0; } }
        if (m.fadeMats){ m.fadeT += dt; const k = Math.min(1, m.fadeT / 0.8); m.fadeMats.forEach(mt => mt.opacity = k); if (k >= 1){ m.fadeMats.forEach(mt => { mt.transparent = false; mt.opacity = 1; }); m.fadeMats = null; } }
        _npcSphere.center.set(m.mesh.position.x, m.mesh.position.y + 1.2, m.mesh.position.z);
        const onScreen = m.mesh.visible && (d < 4 || _frustum.intersectsSphere(_npcSphere));
        const animOn = !!(m.mixer && onScreen && d < Q.animFar && (d < Q.animNear || m.skip % Q.farSkip === 0));
        const moving = !!(m.ai && (m.ai.state === 'walk' || m.ai.state === 'walkToChat'));
        const P = m.mesh.position, moved = m._lx !== P.x || m._lz !== P.z || m._lr !== m.mesh.rotation.y;   // 순간이동(이야기 자리 옮김)·몸 돌리기도 반영
        m.mesh.matrixWorldAutoUpdate = animOn || moving || moved || !m.mixer || m.fadeMats != null || !!m.staff;   // 멈춰 있고 동작도 안 하면 뼈대 계산 생략
        if (m.mesh.matrixWorldAutoUpdate){ m._lx = P.x; m._lz = P.z; m._lr = m.mesh.rotation.y; }
        if (animOn){
          m.mixer.update(d < Q.animNear ? dt : dt * Q.farSkip);  // 동작 계산: 화면 안·가까운 사람만, 멀면 드문드문
          if (m.staff && m.handBone){ m.handBone.getWorldPosition(_tagV); m.mesh.worldToLocal(_tagV); m.staff.position.set(_tagV.x, _tagV.y - 1.55, _tagV.z); }
        }
      } else if (m.isDig || m.isWarn){
        if (!m.done) m.glint.material.opacity = 0.35 + 0.25 * Math.sin(now * 0.005 + m.data.x);
      } else if (m.isDoor){
        m.mesh.material.opacity = 0.22 + 0.1 * Math.sin(now * 0.004);
      } else if (m.isExit){
        if (d < 20) prefetchZone(m.data.to);          // 출구 근처에 오면 다음 마을 에셋을 미리 받아 둠
        m.mesh.material.opacity = 0.28 + 0.1 * Math.sin(now * 0.004);
      } else if (!m.isBush){
        m.mesh.rotation.y += dt*1.5;
        m.mesh.position.y = heightAt(m.data.x,m.data.z) + 1.6 + Math.sin(now*0.003)*0.15;
      }
      if ((m.isDig || m.isWarn) && m.done) return;
      const range = m.data.model ? 3.2 : (m.isDoor ? 2.4 : m.isExit ? 3.0 : (m.isDig ? 1.8 : (m.isWarn ? 2.4 : 4.5)));
      // 지금 이야기 단계의 목표(인물·장소)가 범위 안이면 우선(옆에 다른 NPC가 더 가까이 있어도)
      const q = curStep(), isTarget = q && Z && q.zone === Z.id && (q.npc === m.data.id || q.point === m.data.id || q.skillAt === m.data.id || (q.dig && m.isDig) || (q.warn && m.isWarn) || (q.rumor && rumorOk(q, m.data.id) && !ST.rumor.includes(m.data.id)));
      const score = isTarget ? d - 100 : ((m.data.gather || m.data.challenge) && d < 2.2 ? d - 50 : d);   // 반짝이 바로 위면 옆을 지나는 사람보다 먼저
      if (d < range && score < closestDist){ closestDist = score; closest = m; }
    });
    updateRoomVis(); updateLive(dt); updateScrolls(dt, now); updateSkillFx(dt); updateCineTriggers(); updateFriends(dt, now); updateBubbles(); updateHomeBtn(); updateReplayBar(); updatePools(dt); updateQuail(dt); updateManna(); updateHidden(); hqRefresh(); sideRefresh(); updateBattle(now); updateStorm(dt, now); updateCh910(dt, now); updatePillar(now); updateSea(dt, now); updateArmy(dt, now); updateCloud(now); updateDance(dt, now); updateBgm(dt); updateEquip(dt); updateFires(now); updateStraw(now); updateFrogs(dt); updateEvents(dt); updateFlies(dt, now); updateDust(dt); updateReach(); updateHerd(dt); updateHail(dt, now); updateLocusts(dt, now); updateDark(dt); updateWarn(dt); updateCompass(dt); updateSwirl(dt);
    if (closest !== nearPoint){
      nearPoint = closest;
      interactBtn.classList.toggle('hidden', !nearPoint);
      if (nearPoint) interactBtn.textContent = nearPoint.data.help ? '도와주기' : nearPoint.isMark ? '바르기' : nearPoint.isWarn ? '알리기' : nearPoint.isDig ? '파기' : nearPoint.data.model ? '대화하기' : (nearPoint.data.type === 'exit' ? '이동하기' : nearPoint.isDoor ? nearPoint.data.btn : nearPoint.data.gather ? '모으기' : nearPoint.data.challenge ? '도전하기' : '살펴보기');
    }

    drawMinimap();
    // 화면 글자 이름표: 보이는 것만 그 자리로
    for (let k = TAGS.length - 1; k >= 0; k--){
      const t = TAGS[k], el = t.userData.el;
      let on = t.visible, root = t; for (let o = t.parent; o; o = o.parent){ if (!o.visible) on = false; root = o; }
      if (root !== scene){ el.remove(); TAGS.splice(k, 1); continue; }         // 마을을 떠나 장면에서 빠진 이름표는 정리
      if (on){ t.getWorldPosition(_tagP); _tagP.project(camera); on = _tagP.z < 1 && Math.abs(_tagP.x) < 1.1 && Math.abs(_tagP.y) < 1.1; }
      if (!on){ if (el.style.display !== 'none') el.style.display = 'none'; continue; }
      el.style.display = 'block';
      tagPos.push({ el, x: (_tagP.x + 1) / 2 * innerWidth, y: (1 - _tagP.y) / 2 * innerHeight, w: el.offsetWidth || 60, z: _tagP.z });
    }
    // 가까운 이름표끼리 겹치면 먼 쪽을 위로 비켜 올림
    tagPos.sort((a, b) => a.z - b.z);
    for (let a = 0; a < tagPos.length; a++){ const A = tagPos[a];
      for (let b = 0; b < a; b++){ const B = tagPos[b];
        if (Math.abs(A.x - B.x) < (A.w + B.w) / 2 + 4 && Math.abs(A.y - B.y) < 15) A.y = B.y - 15; } }
    for (const T of tagPos) T.el.style.transform = `translate(${T.x.toFixed(1)}px, ${T.y.toFixed(1)}px) translate(-50%, -85%)`;
    tagPos.length = 0;
    renderer.render(scene, camera);

    if (SHOW_PERF){
      perfFrames++; perfTime += rawDt; perfWorst = Math.max(perfWorst, rawDt);
      if (perfTime >= 1){
        const info = renderer.info.render;
        perfEl.textContent = `${Math.round(perfFrames/perfTime)} fps · 최저 ${Math.round(1/perfWorst)} · draw ${info.calls} · tri ${(info.triangles/1000).toFixed(1)}k`;
        perfFrames = 0; perfTime = 0; perfWorst = 0;
      }
    }
  }

  // ── 미니맵 ─────────────────────────────────────────────
  const mmCanvas = document.getElementById('minimap-canvas');
  const mmCtx = mmCanvas.getContext('2d');
  const MM_RANGE = 45; // 이 거리(월드 단위) 안쪽이 미니맵에 표시됨
  function drawMinimap(){
    const W = mmCanvas.width, H = mmCanvas.height, cx = W/2, cy = H/2;
    mmCtx.clearRect(0,0,W,H);
    mmCtx.fillStyle = 'rgba(200,150,90,0.25)';
    mmCtx.beginPath(); mmCtx.arc(cx,cy,W/2,0,Math.PI*2); mmCtx.fill();

    markers.forEach(m=>{
      if (m.data.type !== 'exit' && m.data.type !== 'lore') return; // 사람은 미니맵에 안 뜸(찾아다니는 재미)
      if (m.hidden) return;
      const dx = m.mesh.position.x - player.position.x, dz = m.mesh.position.z - player.position.z;
      const scale = (W/2 - 8) / MM_RANGE;
      let px = cx + dx*scale, py = cy + dz*scale;
      if (Math.hypot(px-cx, py-cy) > W/2 - 8){
        const ang = Math.atan2(py-cy, px-cx);
        px = cx + Math.cos(ang)*(W/2-8); py = cy + Math.sin(ang)*(W/2-8);
      }
      mmCtx.fillStyle = m.data.type==='exit' ? '#9be58a' : m.data.type==='npc' ? (questState[m.data.id] ? '#8a8a8a' : '#7fa8c9') : (questState[m.data.id] ? '#8a8a8a' : '#ffd27a');
      mmCtx.beginPath(); mmCtx.arc(px,py,4.5,0,Math.PI*2); mmCtx.fill();
    });

    // 플레이어(항상 중앙, 방향 삼각형)
    mmCtx.save();
    mmCtx.translate(cx,cy); mmCtx.rotate(heading);
    mmCtx.fillStyle = '#ffffff';
    mmCtx.beginPath();
    mmCtx.moveTo(0,-7); mmCtx.lineTo(5,6); mmCtx.lineTo(-5,6); mmCtx.closePath(); mmCtx.fill();
    mmCtx.restore();
  }

  // ── 시작 ───────────────────────────────────────────────
  const loadingSub = document.getElementById('loading-sub');
  let loadedCount = 0; const bump = p => p.then(v => { loadedCount++; loadingSub.textContent = `불러오는 중... (${loadedCount}/3)`; return v; });
  // ?ch=2 : 2장부터 바로 시작(시연·확인용). 1장 스킬(지팡이)은 받은 것으로 처리
  const JUMP_CH = +((location.search.match(/[?&]ch=(\d+)/) || [])[1] || 0);
  if (JUMP_CH >= 2 && CHAPTERS[JUMP_CH - 1] && ST.ch < JUMP_CH - 1){ ST.ch = JUMP_CH - 1; ST.step = 0; ST.cleared = false; STORY = CHAPTERS[ST.ch].steps; CHAPTER = CHAPTERS[ST.ch]; saveST(); if (!unlocked.has('staff')){ unlocked.add('staff'); try { localStorage.setItem(SAVE_KEY, JSON.stringify([...unlocked])); } catch (e){} renderSkills(); } }
  const startZone = () => { const z = (location.search.match(/[?&]zone=(\w+)/) || [])[1] || (curStep() ? curStep().zone : ST.cur === 'moses' ? 'egypt' : 'alpha'); return ZONES[z] ? z : 'alpha'; };
  Promise.all([bump(loadPlayer()), bump(bootScroll().then(() => loadZone(startZone()))), bump(Promise.resolve())]).then(() => {
    { const sp = zoneSpawn(Z.spawn); player.position.set(sp[0], heightAt(sp[0], sp[1]), sp[1]); }
    const ld = document.getElementById('loading');
    window.__ready = true;
    try { maybeRecap(); } catch (e){}
    animate();
    { let n = 0; const iv = setInterval(() => { if (++n > 120){ clearInterval(iv); return; } if (ld.style.display !== 'none' || dlgState || traveling) return; clearInterval(iv); setTimeout(() => { try { nextScrollCeremony({ boot: true }); } catch (e){} }, 2500); }, 1000); }   // 이미 1편을 마친 학생: 타이틀을 넘긴 뒤 한 번만 묻는다
    // 타이틀은 학생이 누를 때까지(그 터치로 배경음악도 시작). 자동 테스트(webdriver)는 바로 넘어감
    const begin = () => { ld.classList.add('done'); setTimeout(() => ld.style.display = 'none', 600); BGM.titleUntil = performance.now() + 48000; bgmStart(); if (!maybePickCharacter()) tutStart(); };
    if (navigator.webdriver) begin();
    else { ld.classList.add('ready'); ld.addEventListener('pointerdown', begin, { once: true }); }
    setTimeout(prefetchAll, 1500);
    applyEquip(); msuInit().then(() => { logVisit(); friendsInit(); worshipHello(); }, () => {});
  }).catch(err => {
    document.getElementById('loading-sub').textContent = '캐릭터를 불러오지 못했어요: ' + (err && err.message || err);
    console.error(err);
  });

  // 자동 점검용 훅(헤드리스 브라우저 스크린샷에서 사용)
  window.__debug = { showClear, clearFx, set stepT(v){ stepT = v; }, get hintLv(){ return hintLv; }, applyWorld, get propTemplates(){ return propTemplates; }, get zoneRoot(){ return zoneRoot; }, claimClearedChapters, packScore, progText, pillarsGame, cleftGame, get mannaSun(){ return mannaSun; }, set mannaSunT0(v){ if (mannaSun) mannaSun.t0 = v; }, get covAltar(){ return !!covObj; }, addGeneal, genealBookHTML, signsGame, get geneal(){ return ST.geneal; }, enterScroll, openScrollGate, SCROLL_DEFS, AP, get cur(){ return ST.cur; }, takePhoto, openAlbum, photoAll, get course(){ return { i: course.i, n: course.rings.length, t: course.t, rings: course.rings.map(r => [r.x, r.y, r.z]), kind: courseKind() }; }, buildCourse, COURSES, updateFollow, get followers(){ return markers.filter(m => m.follow).map(m => m.data.id + '@' + m.mesh.position.x.toFixed(1) + ',' + m.mesh.position.z.toFixed(1)).join(' '); }, openLinks, LINKS, get links(){ return ST.links || []; }, openRecap, openExhibit, openJourney, maybeRecap, get exhibit(){ return exhibitObj ? exhibitObj.children.length : 0; }, starsLeft, spendStars, retryQuiz, openLibrary, renderLibrary, TITLES, SIDE, sideState, sideSet, sideTalk, get sideItems(){ return ST.sideItems || []; }, cloudPack, cloudScore, cloudInit, CLOUD, logStep, buildTabernacle, get tabStage(){ return tabStage; }, get calfOn(){ return !!calfObj; }, get arkOn(){ return !!arkObj; }, get gloryOn(){ return !!gloryObj; }, get shine(){ return !!shineObj; }, HQ, hqTalk, hqState, hqSet, hqRefresh, spawnLostLamb, get lostLamb(){ return lostLamb; }, mannaStreakTick, renderHQ, dumpText(){ return JSON.stringify({ DLG, RUMORS, QUIZ, KEYS, ZONES: Object.fromEntries(Object.entries(ZONES).map(([k, z]) => [k, z.points.map(p => ({ id: p.id, title: p.title, body: p.body }))])) }); }, setShoeDy(v){ SHOE_DY = v; }, get mat(){ return ST.mat || {}; }, addMat, gatherGame, openCraft, CRAFT, get gear(){ return Object.keys(gearOn).map(k => gearOn[k].key).join(','); }, get idols(){ return idolObjs.length; }, actWin, renderWorship, setWOR(v){ WOR = v; }, get mannaFlakes(){ return mannaFlakes; }, openReplay, startReplay, REPLAYS, get REPLAY(){ return REPLAY; }, get petPos3(){ const p = equipObj.pet; return p ? [p.position.x, p.position.y, p.position.z] : null; }, get weekly(){ return ST.weekly; }, wq, syncAchieve, get chase(){ return chase; }, get petWings(){ return equipObj.petWings ? equipObj.petWings.r.rotation.z : null; }, mockMsu(rpc){ MSU.client = { rpc: async (n, a) => rpc(n, a) }; MSU.session = { user: { id: 'me' } }; }, get VISIT(){ return VISIT; }, onInvite, visitHome, homeTap, homeEnter, homeExit, get homeObjs(){ return homeObjs; }, get homeEdit(){ return homeEdit; }, FR, onFriendPos, get daily(){ return ST.daily; }, dq, showBubble, friendPill, rankMock(a, b, tab){ const c = MSU.client, se = MSU.session; MSU.client = {}; MSU.session = {}; rankData = a; oikData = b; rankTab = tab; openModal('rank-modal'); renderRank(); MSU.client = c; MSU.session = se; }, get cine(){ return cine.on; }, startCine, useSkill, get skills(){ return [...unlocked].join(','); }, myTitle, get prayFx(){ return !!prayFx; }, get boost(){ return performance.now() < praiseUntil; }, scrolls, scrollSpots, get camYaw(){ return camYaw; }, get heading(){ return heading; }, get climb(){ return climb; }, reachable, startChallenge, get live(){ return live; }, get mgOpen(){ return !mg.el.classList.contains('hidden'); }, recordBest, refreshShow, get bgm(){ return BGM.src ? "playing:" + BGM.cur : (BGM.on ? "ready" : "off"); }, bgmTitleSkip(){ BGM.titleUntil = 0; }, get headBox(){ return window.__headBox || null; }, get hair(){ if (!playerHair) return "none"; const b = new THREE.Box3().setFromObject(playerHair); return JSON.stringify({ min: b.min.toArray().map(v => +v.toFixed(2)), max: b.max.toArray().map(v => +v.toFixed(2)), vis: playerHair.visible, kids: playerHair.children.length }); }, get equip(){ return JSON.stringify(equip) + ' owned=' + [...owned].join(','); }, get petPos(){ return equipObj.pet ? [equipObj.pet.position.x, equipObj.pet.position.y, equipObj.pet.position.z].map(v => v.toFixed(2)).join(',') : null; }, get staffOn(){ return !!equipObj.staff; }, get tut(){ return tut.on ? tut.i : -1; }, get prefetch(){ return prefetchState.done + '/' + prefetchState.total; }, get quality(){ return qMode + '/' + qLevel; }, setQuality, get doorTarget(){ return doorTarget; }, get pendingNPC(){ return markers.filter(m => m.pending).length; }, get darkK(){ return darkK; }, get hailOn(){ return hailOn; }, get locustOn(){ return locustOn; }, herd, get fliesAmt(){ return flyAmt; }, ST, get STORY(){ return STORY; }, startChapter, frogs, curStep, advance, get dlg(){ return dlgState; }, straws, player, camera, keys, markers, obstacles, POIS, NAV, walkable, findPath, travelTo, get zone(){ return Z && Z.id; }, questState, setCam: (y, p) => { camYaw = y; if (p !== undefined) camPitch = p; }, get grounded(){ return grounded; }, boxes, setZoom: z => setZoom(z), actions: () => actions, natural, get stamina(){ return stamina; }, setHeading: h => heading = h };
})();
