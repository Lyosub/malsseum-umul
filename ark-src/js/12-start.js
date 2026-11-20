  // ───────── 시작 ─────────
  var hl, avatar, heldMesh, swingT = 0;
  function itemGeometry(id) {
    var t = BT[id][1], a = tileUV(t, 0, 0), b = tileUV(t, 1, 0), c = tileUV(t, 1, 1), d = tileUV(t, 0, 1);
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0], 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute([a[0], a[1], b[0], b[1], c[0], c[1], d[0], d[1]], 2));
    g.setAttribute('color', new THREE.Float32BufferAttribute([1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0], 3));
    g.setIndex([0, 1, 2, 0, 2, 3, 0, 2, 1, 0, 3, 2]);   // 앞뒤 두 면
    return g;
  }
  // 무기(칼·성령의 검): 손에 들면 크게, 3인칭·친구 화면에서도 손에 쥔 모습
  function isWeapon(id) { return id === SWORD || isTool(id); }   // 칼·검과 곡괭이·도끼·삽: 손에 든 모습을 크게
  function heldWeapon() { var id = HOTBAR[sel]; return id && have(id) > 0 && isWeapon(id) ? id : 0; }
  function heldShown() { var id = HOTBAR[sel]; return id && B[id] && have(id) > 0 ? id : 0; }   // 다른 사람에게 보이는 손에 든 것(블록·물건 포함)
  function handItem(av, id) {
    var pr = av && av.userData; if (!pr || !pr.armR) return;
    if (pr.hand) { pr.armR.remove(pr.hand); pr.hand.traverse(function (o) { if (o.geometry) o.geometry.dispose(); }); pr.hand = null; }
    if (!id) return;
    if (!isWeapon(id)) {   // 블록·물건: 손에 작게 쥔 모습(그림은 새로 만들어 지울 때 함께 지움)
      dropMats();
      var flat = isFlat(id), hm = new THREE.Mesh(flat ? itemGeometry(id) : blockGeometry(id), flat ? dropMatF : dropMatB), hu = HT / 32, hg = new THREE.Group();
      hm.scale.setScalar(flat ? 0.55 : 0.36); hg.add(hm);
      hg.position.set(0, -13 * hu, -1.6 * hu);
      pr.armR.add(hg); pr.hand = hg; pr.handId = id;
      return;
    }
    // 입체로: 손잡이·가로대·칼날(어느 쪽에서 봐도 보이게). 칼날은 앞쪽으로 조금 들어 올림
    var u = HT / 32, g = new THREE.Group(), big = id === SWORD, type = big ? 'sword' : TOOL_TYPES[typeOf(id)];
    var mat = big ? 0xe8eef5 : [0xa77a48, 0x8f8f8b, 0xc8743a, 0xd2d6db, 0xb57ad8, 0x6ff0e6][tierOf(id)], wood = 0x7a5430;
    function bx(w, h, d, hex, y, x) { var m = shadedBox(w * u, h * u, d * u, hex); m.position.set((x || 0) * u, y * u, 0); g.add(m); }
    if (type === 'sword' || type === 'knife') {
      var len = big ? 13 : 8;
      bx(1.4, 3.6, 1.4, 0x6a4628, 0); bx(big ? 5.5 : 3.2, 1, 1.6, big ? 0xf0c840 : 0x5a3a1e, 2.2); bx(big ? 1.8 : 1.4, len, 0.6, mat, 2.7 + len / 2); bx(big ? 1 : 0.8, 1.4, 0.6, mat, 3.3 + len);
      if (big) bx(0.5, len - 1, 0.7, 0xb8c4d0, 2.7 + len / 2);   // 가운데 홈
    } else {
      bx(1.2, 13, 1.2, wood, 4.5);   // 자루
      if (type === 'pick') { bx(13, 2.4, 2.2, mat, 11.2); bx(2, 2, 2, mat, 9.8, -6.6); bx(2, 2, 2, mat, 9.8, 6.6); }   // 곡괭이 머리(양쪽 뾰족)
      else if (type === 'axe') { bx(6, 6.4, 1.2, mat, 9.4, 3.2); bx(1.2, 7, 1.4, mat, 9.4, 6.4); }   // 도끼날(한쪽)
      else if (type === 'shovel') { bx(5, 6, 0.8, mat, 13.4); bx(3.2, 1.4, 0.8, mat, 17); }   // 삽날(끝)
    }
    g.position.set(0, -12.5 * u, -0.6 * u); g.rotation.x = -Math.PI / 2 + (type === 'sword' || type === 'knife' ? 0.45 : 0.75);
    pr.armR.add(g); pr.hand = g; pr.handId = id;
  }
  function setHeld(id) {
    var wpn = isWeapon(id);
    heldMesh.userData.weapon = wpn; heldMesh.scale.set(wpn ? -(id === SWORD ? 0.72 : 0.62) : (isItem(id) ? 0.5 : 0.34), wpn ? (id === SWORD ? 0.72 : 0.62) : (isItem(id) ? 0.5 : 0.34), isItem(id) ? 0.5 : 0.34);
    heldMesh.material.side = wpn ? THREE.DoubleSide : THREE.FrontSide;
    if (avatar) handItem(avatar, heldShown() === id ? id : 0);
    if (heldMesh.geometry) heldMesh.geometry.dispose(); if (!id) { heldMesh.geometry = new THREE.BufferGeometry(); return; } heldMesh.geometry =isItem(id) || id === TORCH ? itemGeometry(id) : blockGeometry(id); heldMesh.material.alphaTest = isItem(id) || id === TORCH ? 0.5 : 0; heldMesh.material.needsUpdate = true; }
  function init() {
    canvasEl = $('game');
    if (isTouch) document.body.classList.add('touch');
    document.body.classList.toggle('keysoff', !!S.keysOff);
    buildTiles();
    for (var id = 1; id < B.length; id++) if (B[id]) BT[id] = [TILE[B[id][1]], TILE[B[id][2]], TILE[B[id][3]]];
    makeIcons();

    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: !isTouch, powerPreference: 'high-performance' });
    } catch (e) {
      $('loadingBar').hidden = true;
      $('loadingStatus').textContent = '3D 화면을 열 수 없어요. 브라우저를 다시 열거나 다른 브라우저로 접속해 보세요.';
      return;
    }
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x9fcdee);
    scene.fog = new THREE.Fog(0xc4e2f4, FOG_FAR * 0.4, FOG_FAR);
    camera = new THREE.PerspectiveCamera(70, 1, 0.08, FOG_FAR + 60);
    scene.add(camera);
    atlasTex = new THREE.CanvasTexture(atlas);
    atlasTex.magFilter = THREE.NearestFilter; atlasTex.minFilter = THREE.NearestFilter; atlasTex.generateMipmaps = false;
    if (THREE.SRGBColorSpace) atlasTex.colorSpace = THREE.SRGBColorSpace;
    opaqueMat = new THREE.MeshBasicMaterial({ map: atlasTex, vertexColors: true });
    glassMat = new THREE.MeshBasicMaterial({ map: atlasTex, vertexColors: true, transparent: true, depthWrite: false });
    plantMat = new THREE.MeshBasicMaterial({ map: atlasTex, vertexColors: true, alphaTest: 0.5, side: THREE.DoubleSide });
    lightPatch(opaqueMat); lightPatch(glassMat); lightPatch(plantMat);
    avatarMat = new THREE.MeshBasicMaterial({ vertexColors: true });
    bitGeo = new THREE.BoxGeometry(0.22, 0.22, 0.22);
    hl = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.006, 1.006, 1.006)), new THREE.LineBasicMaterial({ color: 0x111111, transparent: true, opacity: 0.6 }));
    hl.visible = false; scene.add(hl);
    slabGhost = new THREE.Mesh(new THREE.BoxGeometry(.996, .494, .996),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: .45, depthWrite: false }));
    slabGhost.visible = false; slabGhost.renderOrder = 4; scene.add(slabGhost);
    createBlueprintMesh();
    for (var st = 1; st <= 8; st++) (function (t) { crackGeo.push(cubeGeometry(function () { return t; }, false)); })(TILE['crack' + st]);
    crackMesh = new THREE.Mesh(crackGeo[0], new THREE.MeshBasicMaterial({ map: atlasTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    crackMesh.scale.setScalar(1.004); crackMesh.visible = false; crackMesh.renderOrder = 3; scene.add(crackMesh);
    heldMesh = new THREE.Mesh(HOTBAR[0] ? blockGeometry(HOTBAR[0]) : new THREE.BufferGeometry(),new THREE.MeshBasicMaterial({ map: atlasTex, vertexColors: true, depthTest: false, depthWrite: false, transparent: true }));
    lightPatch(heldMesh.material); heldMesh.renderOrder = 10; heldMesh.scale.setScalar(0.34); camera.add(heldMesh);
    refreshMyAvatar(); avatar.visible = false;
    makeSky(); makeRainbow(); makeBethlehemStar();
    cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.88, fog: false });
    for (var c = 0; c < 26; c++) {
      var cl = new THREE.Mesh(new THREE.BoxGeometry(20 + rnd(c) * 30, 3, 12 + rnd(c + 5) * 16), cloudMat);
      cl.position.set(XM + rnd(c + 11) * 600 - 300, G + 82 + rnd(c + 3) * 10, AZ0 + rnd(c + 17) * 600 - 300); scene.add(cl); clouds.push(cl);
    }

    bindInput(canvasEl); bindUI(); renderHotbar();
    window.addEventListener('resize', queueGameResize);
    if (window.screen.orientation && window.screen.orientation.addEventListener) {
      window.screen.orientation.addEventListener('change', queueGameResize);
    } else {
      window.addEventListener('orientationchange', queueGameResize);
    }
    if (window.ResizeObserver) new ResizeObserver(queueGameResize).observe(canvasEl);
    applyLightMode();
    fitMobileKeyboard();

    loadOnline().then(function () {
      ensureAround(XM, AZ0 + 60, 3);
      spawnBirds(); renderQuest();
      renderHotbar(); setSel(0, true);
      $('loading').style.display = 'none';
      $('tWho').textContent = me ? (myPlot >= 0 ? '로그인됨 · 내 땅 ' + (myPlot + 1) + '번' : '로그인됨') : '구경 모드 · 로그인하면 내 땅과 가방이 저장돼요';
      showUI('title');
      var last = performance.now(), orbit = 0, mapT = 0, npcT = 0;
      (function loop(now) {
        var dt = Math.min(0.05, (now - last) / 1000); last = now;
        fpsWatch(now);
        if (!started) {
          orbit += dt * 0.035;
          var cxr = XM, czr = AZ0 + AW / 2 + 40;
          camera.position.set(cxr + Math.cos(orbit) * 190, G + 66, czr + Math.sin(orbit) * 140);
          camera.lookAt(cxr, G + 10, AZ0 + AW / 2 + 20);
          heldMesh.visible = false; hl.visible = false;
        } else {
          if (ui === 'play') step(dt); else placeCamera(dt);
          var h = null;
          if (ui === 'play') {
            if (!isTouch) h = pickCenter();
            else if (hold) h = pickTouch(hold.x, hold.y);
            else if (S.aim === 'cross') h = pickCenter();
            if (!isTouch && mouseMining) mineTick(h, dt);
            else if (isTouch && hold && (now - hold.t0 > 200 || hold.dug)) mineTick(h, dt);
            else if (!hold && !mouseMining) mine = null;
          }
          updateCrack(); updateRing();
          hl.visible = !!h; if (h) hl.position.set(h.x + 0.5, h.y + 0.5, h.z + 0.5);
        }
        if (started) { updateMobileBuild(now); updateFrontierTools(now); tickBlueprint(now); }
        if (started) stepFrontier(now,dt);
        if (started) { stepVitals(dt); stepHerd(dt); stepMusic(dt); stepShadows(dt); storyTick(dt); partyTick(dt); npcT -= dt; if (npcT <= 0) { npcT = 1; spawnNpcs(); refreshSigns(); refreshFrames(); tickParked(); newsTick(); checkHome(); refreshPlotSigns(); spawnZoneSigns(); } }
        if (started) {
          updateDay(dt); updateAmbient(dt);
          if (ui === 'play' || ui === 'map') {
            mapT -= dt;
            if (mapT <= 0) {
              mapT = 0.25;
              if (ui === 'play') { drawMap($('mapc'), false); renderMapCap(); layoutLeftStack(); }
              else { drawMap($('bigmapc'), true); renderMapPeople(); }
            }
          }
        }
        streamTick(camera.position.x, camera.position.z, dt); mapTick();
        stepBits(dt); stepFx(dt); stepDrops(dt); stepSDrops(dt); stepFalls(dt); stepCreatures(dt, now / 1000); netTick(dt, now);
        if (forestRoute && ui === 'play') renderForestRoute();
        renderer.render(scene, camera);
        requestAnimationFrame(loop);
      })(last);
      setInterval(function () {
        if (!started) return;
        $('place').textContent=placeName(); regionTick();
        renderMaterialGuide();
        if(((ui==='villageWork'&&(villageTab==='projects'||villageTab==='neighbors'))||(villageProjectsEnabled&&inCommons(P.x,P.z)))&&Date.now()>villageProjectAt){villageProjectAt=Date.now()+6000;fetchVillageProjects();}
        $('seasonInfo').textContent=(FESTIVE?'🌟 성탄 절기 · ':'')+WEATHER[seasonIndex()]+(rainOn?(snowNow?' · 눈':' · 비'):'')+
          (HOTBAR[sel]===COMPASS?' · '+headingName():'');
        fetchFeed(); fetchGifts();
        if (!hintT0) hintT0 = performance.now();
        // 세로 화면: 장소 글자를 안내 상자(접었으면 위쪽 버튼 줄) 바로 아래로
        var inf = $('info');
        if (inf) { if (isTouch && innerHeight > innerWidth) { var qe = $('quest'), qr = qe && getComputedStyle(qe).display !== 'none' ? qe.getBoundingClientRect() : null, tr = $('topRight').getBoundingClientRect(); inf.style.top = Math.round(Math.max(qr && qr.height ? qr.bottom : 0, tr.bottom) + 6) + 'px'; } else if (inf.style.top) inf.style.top = ''; }
        if (tutorialStep >= 9 || performance.now() - hintT0 > 60000) document.body.classList.add('nohint');
      },300);
    });
  }
  function teleport(x, y, z, yaw, keepGuide) {
    clearFurnitureRest();
    clearFrontierLift();
    if (!keepGuide) cancelForestRoute();
    if(ferryRide){ferryRide=null;ferryMesh.visible=false;}
    if (cartRide) leaveCart(true);
    if (riding) dismount(true);
    ensureAround(x, z, 2);
    P.x = x; P.z = z; P.y = y; P.vy = 0; P.vx = P.vz = 0; fallTop = null;
    while (collides(P.x, P.y, P.z) && P.y < SY) P.y += 1;
    if (yaw !== undefined) P.yaw = yaw; P.pitch = -0.12; P.camY = 0;
  }
  // 작은 지도 아래 지금 좌표(X 동서 · Z 남북 · Y 높이) — 아이들이 좌표로 자리를 말할 수 있게
  var mapCapLabel = '지도<b class="k">M</b>', mapCapKey = '';
  function renderMapCap(force) {
    var x = Math.floor(P.x), y = Math.floor(P.y), z = Math.floor(P.z), k = x + ',' + y + ',' + z;
    if (!force && k === mapCapKey) return; mapCapKey = k;
    $('mapCap').innerHTML = mapCapLabel + '<span class="coords">X ' + x + ' · Z ' + z + '<br>Y ' + y + ' (높이)</span>';
  }
  // 11/20 왼쪽 위에 쌓이는 것(장소·날씨 정보 → 길 안내 → 채팅·알림 줄)이 겹치지 않게 차례로 아래에 붙임
  function layoutLeftStack() {
    var y = $('info').getBoundingClientRect().bottom + 6, g = $('forestGuide'), c = $('chatLog');
    if (!g.hidden) { var gt = Math.round(y) + 'px'; if (g.style.top !== gt) g.style.top = gt; y = g.getBoundingClientRect().bottom + 6; }
    var ct = Math.round(y) + 'px'; if (c.style.top !== ct) c.style.top = ct;
  }
  function goHome() {
    if (myPlot < 0) { toast(me ? '내 땅을 받는 중이에요' : '로그인하면 내 땅을 받을 수 있어요'); return; }
    var o = plotOrigin(myPlot); teleport(o.x + OLD_PLOT / 2, G, o.z - 2, Math.PI); tutorialEvent('home'); toast('내 땅(' + (myPlot + 1) + '번)이에요. 모은 블록으로 지어 보세요!');
  }
  var gameResizeFrame = 0;
  function queueGameResize() {
    if (gameResizeFrame) return;
    gameResizeFrame = requestAnimationFrame(function () {
      gameResizeFrame = 0;
      resize();
      fitMobileKeyboard();
    });
  }
  function resize() {
    var w = canvasEl.clientWidth, h = canvasEl.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }

  // 화면 품질 자동 조절(11/20): 휴대폰이 버벅이면(4초씩 두 번 연속 초당 24장 아래) 「가벼운 화면」을 켬. 메뉴에서 끄면 다시는 자동으로 켜지 않음
  var fpsW = { t0: 0, n: 0, low: 0 }, perfAcc = { sum: 0, n: 0, low: 999, next: 0 };   // perfAcc: 실제 폰 버벅임 기록(1분 평균, 10분에 한 번 서버로)
  function fpsWatch(now) {
    if (!started || ui !== 'play' || document.hidden) { fpsW.t0 = 0; return; }
    if (!fpsW.t0) { fpsW.t0 = now; fpsW.n = 0; return; }
    fpsW.n++;
    if (now - fpsW.t0 < 4000) return;
    var fps = fpsW.n * 1000 / (now - fpsW.t0); fpsW.t0 = now; fpsW.n = 0; fpsW.last = fps;
    perfAcc.sum += fps; perfAcc.n++; perfAcc.low = Math.min(perfAcc.low, fps);
    if (perfAcc.n >= 15) {
      if (client && me && me.id !== 'test' && now > perfAcc.next) { perfAcc.next = now + 600000; client.rpc('log_ark_perf', { p_avg: Math.round(perfAcc.sum / perfAcc.n * 10) / 10, p_low: Math.round(perfAcc.low * 10) / 10, p_light: !!S.lightMode, p_w: innerWidth, p_h: innerHeight, p_dpr: window.devicePixelRatio || 1, p_ua: navigator.userAgent }).then(function () {}, function () {}); }
      perfAcc.sum = 0; perfAcc.n = 0; perfAcc.low = 999;
    }
    fpsW.low = fps < 24 ? fpsW.low + 1 : 0;
    if (fpsW.low >= 2 && !S.lightMode && S.autoLight !== false) {
      S.lightMode = true; S.autoLit = true; applyLightMode(); saveSettings(); updateMenuLabels(); fpsW.low = 0;
      toast('📱 화면이 버벅여서 「가벼운 화면」으로 바꿨어요 — 메뉴에서 다시 끌 수 있어요');
    }
  }
  var fwd = new THREE.Vector3(), lastX = 0, lastZ = 0;
  function step(dt) {
    if(ferryRide){stepFerry(dt);return;}
    if(cartRide){stepCart(dt);return;}
    if(frontierLift){moveFrontierLift(dt);placeCamera(dt,0);return;}
    if (furnitureRest) {
      var rest = furnitureRest;
      if (get(rest.x, rest.y, rest.z) !== rest.id || jumpHeld || joy.x || joy.y ||
          keys.KeyW || keys.KeyA || keys.KeyS || keys.KeyD || keys.ArrowUp || keys.ArrowLeft || keys.ArrowDown || keys.ArrowRight ||
          keys.ShiftLeft || keys.ShiftRight) {
        standFromFurniture();
      }
      placeCamera(dt, 0);
      return;
    }
    var mx = 0, mz = 0;
    if (keys.KeyW || keys.ArrowUp) mz -= 1; if (keys.KeyS || keys.ArrowDown) mz += 1;
    if (keys.KeyA || keys.ArrowLeft) mx -= 1; if (keys.KeyD || keys.ArrowRight) mx += 1;
    mx += joy.x; mz += joy.y;
    var len = Math.hypot(mx, mz); if (len > 1) { mx /= len; mz /= len; }
    P.swim = !P.fly && inWater();
    P.ladder = !P.fly && onLadder();
    P.sneak = !P.fly && !riding && !P.swim && (keys.ShiftLeft || keys.ShiftRight || sneakLock);
    P.sprint = !P.swim && !P.sneak && (keys.ControlLeft || keys.KeyR || runLock) && mz < -0.3 && (FOOD > 6 || !vitalsOn());
    if (!P.sprint && (keys.ControlLeft || runLock) && mz < -0.3 && FOOD <= 6 && vitalsOn() && !sprintTold) { sprintTold = true; toast('기운이 없어서 달릴 수 없어요 — 떡이나 무화과를 먹어요'); }
    // 걷기 8.5→6.5칸/초(11/19 전도사님 「이동하는 속도가 너무 빨라」), 달리기는 1.5배
    var sp = (P.fly ? 20 : (P.swim ? (has('moses') ? 8 : 5) : (riding ? riding.sp.ride : 6.5 * (has('enoch') ? 1.1 : 1)))) * (P.sprint && !riding ? 1.5 : 1) * (P.sneak ? 0.35 : 1);
    document.body.classList.toggle('sneaking', !!P.sneak);
    var sin = Math.sin(P.yaw), cos = Math.cos(P.yaw);
    var wx = (mx * cos + mz * sin) * sp, wz = (-mx * sin + mz * cos) * sp;
    var a = P.ground || P.fly || P.swim ? 14 : 4;
    P.vx += (wx - P.vx) * Math.min(1, a * dt); P.vz += (wz - P.vz) * Math.min(1, a * dt);
    if (P.fly) {
      var vy = (jumpHeld || keys.Space ? 1 : 0) - (flyDown || keys.ShiftLeft || keys.KeyC ? 1 : 0);
      P.vy += (vy * 14 - P.vy) * Math.min(1, 10 * dt);
    } else if (P.swim) {
      P.vy -= 12 * dt; if (P.vy < -4) P.vy = -4;
      if (jumpHeld || keys.Space) P.vy = 6;
    } else if (P.ladder) {
      // 사닥다리: 앞으로 밀거나 점프하면 오르고, 가만히 있으면 천천히 내려간다(창 28:12)
      if (jumpHeld || keys.Space || mz < -0.2) P.vy = has('jacob') ? 11 : 5.5;
      else if (flyDown || keys.ShiftLeft) P.vy = 0;
      else { P.vy -= 50 * dt; if (P.vy < -3.5) P.vy = -3.5; }
    } else {
      P.vy -= 50 * dt; if (P.vy < -60) P.vy = -60;
      if (jumpHeld && P.ground) { P.vy = riding ? riding.sp.jump : 15.2; exhaust(P.sprint ? 0.2 : 0.05); }
    }
    lastX = P.x; lastZ = P.z;
    moveAxis(0, P.vx * dt); moveAxis(2, P.vz * dt);
    var hitY = moveAxis(1, P.vy * dt);
    P.ground = false;
    if (hitY) { if (P.vy < 0) P.ground = true; P.vy = 0; }
    else if (!P.fly && collides(P.x, P.y - 0.02, P.z)) P.ground = true;
    if (P.ground) P.groundAt = performance.now();
    if (P.y < YMIN - 10) teleport(P.x, surfaceY(P.x | 0, P.z | 0), P.z);
    P.x = clamp(P.x, 40, WS - 40); P.z = clamp(P.z, 40, WS - 40);
    var moved = Math.hypot(P.x - lastX, P.z - lastZ);
    if (len > 0 && moved > 0.03 && moved < 2) tutorialEvent('walk');
    if (tutorialStep === 5 && tutorialDoor && Math.floor(P.x) === tutorialDoor.x && Math.floor(P.z) === tutorialDoor.z &&
        P.y >= tutorialDoor.y - 0.1 && P.y < tutorialDoor.top) {
      var door = SHAPE[get(tutorialDoor.x, tutorialDoor.y, tutorialDoor.z)];
      if (door && door.type === 'door' && door.open) tutorialEvent('door');
    }
    if (riding) stepRide(dt, moved);
    // 떨어짐: 사람 키(3.4칸)의 두 배 넘게 떨어지면 아픔(물·사닥다리·말 위·날기는 괜찮음)
    if (P.fly || P.swim || P.ladder || riding) fallTop = null;
    else if (!P.ground) { if (fallTop === null || P.y > fallTop) fallTop = P.y; }
    else if (fallTop !== null) { var fd = fallTop - P.y; fallTop = null; if (fd > 8) hurt(Math.floor((fd - 8) / 2) + 1, '높은 곳에서 떨어졌어요'); }
    if (P.ground && !riding) exhaust(moved * (P.sprint ? 0.03 : 0.004));
    storyStep(dt, moved);
    if (P.ground) { P.walk += moved * 0.55; P.stepAcc += moved; if (P.stepAcc > 2.6) { P.stepAcc = 0; var fx0 = Math.floor(P.x), fz0 = Math.floor(P.z), feet = get(fx0, Math.floor(P.y + 0.1), fz0); stepSound(feet === WATER ? WATER : get(fx0, Math.floor(P.y - 0.1), fz0)); } }
    else P.walk += moved * 0.2;
    P.camY += (0 - P.camY) * Math.min(1, 12 * dt);
    placeCamera(dt, moved / Math.max(dt, 1e-4));
  }
  var bobAmp = 0;
  function placeCamera(dt, speed) {
    speed = speed || 0;
    var ex = P.x, ey = P.y + (riding ? riding.sp.seat + 1.85 : EYE) + P.camY - (P.sneak ? 0.45 : 0), ez = P.z;
    fwd.set(-Math.sin(P.yaw) * Math.cos(P.pitch), Math.sin(P.pitch), -Math.cos(P.yaw) * Math.cos(P.pitch));
    var targetFov = P.sprint ? 78 : 70;
    if (Math.abs(camera.fov - targetFov) > 0.05) { camera.fov += (targetFov - camera.fov) * Math.min(1, 8 * dt); camera.updateProjectionMatrix(); }
    bobAmp += ((P.ground && speed > 1 ? 1 : 0) - bobAmp) * Math.min(1, 8 * dt);
    swingT = Math.max(0, swingT - dt);
    var sw = Math.sin((swingT / 0.25) * Math.PI);
    if (furnitureRest) ey = P.y + (furnitureRest.pose === 'lie' ? .35 : .85);
    if (S.view === 0 && !furnitureRest) {
      camDist = 0;
      var bob = Math.sin(P.walk * 2) * 0.07 * bobAmp, sway = Math.cos(P.walk) * 0.05 * bobAmp;
      camera.position.set(ex + Math.cos(P.yaw) * sway, ey + Math.abs(bob), ez - Math.sin(P.yaw) * sway);
      camera.lookAt(camera.position.x + fwd.x, camera.position.y + fwd.y, camera.position.z + fwd.z);
      avatar.visible = false; heldMesh.visible = true;
      if (heldMesh.userData.weapon) {   // 칼·검: 오른쪽 아래에서 위로 비스듬히 세워 들고, 휘두르면 내려침
        heldMesh.position.set(0.48 + Math.cos(P.walk) * 0.02 * bobAmp, -0.38 + Math.abs(Math.sin(P.walk * 2)) * 0.025 * bobAmp - sw * 0.1, -0.8 - sw * 0.12);
        heldMesh.rotation.set(-0.15 - sw * 0.5, 0.35, sw * 1.1);
      } else {
        heldMesh.position.set(0.52 + Math.cos(P.walk) * 0.02 * bobAmp, -0.46 + Math.abs(Math.sin(P.walk * 2)) * 0.025 * bobAmp - sw * 0.12, -0.82 - sw * 0.1);
        heldMesh.rotation.set(0.1 - sw * 0.6, 0.72, 0);
      }
    } else {
      var dir = furnitureRest || S.view === 1 ? -1 : 1;
      var want = furnitureRest ? 5.4 : 8.5, d = 0.6;
      while (d < want) {
        var qx = ex + fwd.x * dir * d, qy = ey + fwd.y * dir * d, qz = ez + fwd.z * dir * d;
        if (isSolid(get(Math.floor(qx), Math.floor(qy), Math.floor(qz)))) { d -= 0.45; break; }
        d += 0.25;
      }
      camDist = Math.max(0.6, Math.min(want, d));
      camera.position.set(ex + fwd.x * dir * camDist, ey + fwd.y * dir * camDist, ez + fwd.z * dir * camDist);
      camera.lookAt(ex, ey, ez);
      avatar.visible = true; heldMesh.visible = false;
      avatar.position.set(P.x, P.y + P.camY + (riding ? riding.sp.seat - 1.2 : 0), P.z);
      avatar.rotation.set(0, P.yaw, 0, 'YXZ');
      var pr = avatar.userData, swing = riding ? 0 : Math.sin(P.walk * 1.6) * 0.75 * bobAmp;
      pr.legL.rotation.x = swing; pr.legR.rotation.x = -swing;
      pr.legL.rotation.z = riding ? -0.45 : 0; pr.legR.rotation.z = riding ? 0.45 : 0;   // 걸터앉기
      var waving = performance.now() < waveUntil;
      pr.armL.rotation.x = -swing * 0.8; pr.armR.rotation.x = waving ? -2.7 : swing * 0.8 - sw * 1.2;
      pr.armR.rotation.z = waving ? Math.sin(performance.now() / 110) * 0.45 : 0;
      pr.head.rotation.x = P.pitch * 0.7;
      if (furnitureRest) poseFurnitureAvatar(avatar, furnitureRest.pose, P.x, P.y, P.z, furnitureRest.yaw);
    }
    // 물속이면 화면을 푸르게
    var under = get(Math.floor(camera.position.x), Math.floor(camera.position.y), Math.floor(camera.position.z)) === WATER;
    document.body.classList.toggle('underwater', under && started);
  }

