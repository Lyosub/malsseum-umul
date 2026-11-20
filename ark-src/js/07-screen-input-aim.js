  // ───────── 화면 상태 ─────────
  var ui = 'title', uiBack = 'title';
  var isTouch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  var lockOn = false, canvasEl;
  function showUI(name) {
    ['title', 'pause', 'inv', 'book', 'help', 'map', 'chest', 'chat', 'looks', 'tips', 'signs', 'visit', 'story', 'ending', 'party', 'friends', 'practice', 'villageWork', 'frontierChest'].forEach(function (n) { $(n).classList.toggle('show', n === name); });
    document.body.classList.toggle('playing', name === 'play');
    if (name === 'play') setTimeout(function () { fitBottomBar(); }, 60);   // 단축 칸 폭을 방향키에 맞춤
    document.body.classList.toggle('menu', name !== 'play');
    ui = name;
    if (name === 'map') { tutorialEvent('map'); renderPins(); if (!FRIENDS.ready) friendsFetch(); }
    if (name === 'play' && started) renderQuest();
    if (name !== 'play') {
      resetInput();
      // 어떤 창이든 열리면 마우스 잠금을 풀어 커서가 화면에 갇히지 않게
      try { if (document.pointerLockElement) document.exitPointerLock(); } catch (e) {}
    }
  }
  function openPanel(name) { bagPick = null; uiBack = ui === 'play' ? 'play' : ui; showUI(name); if (name === 'inv') renderInv(); if (lockOn) document.exitPointerLock(); }
  function closePanel() { if (uiBack === 'play') resume(); else showUI(uiBack); }
  function requestGamePointerLock() {
    // 자동 시험 브라우저(navigator.webdriver)는 잠그지 않는다 — 윈도우에서는 숨은 창이라도 실제 마우스 커서를 가둠(11/19)
    if (isTouch || navigator.webdriver || !canvasEl || !canvasEl.requestPointerLock ||
        !document.hasFocus() || document.pointerLockElement === canvasEl) return;
    try {
      var request = canvasEl.requestPointerLock();
      // Chrome can reject asynchronously when the user leaves the window during a request.
      if (request && typeof request.catch === 'function') request.catch(function () {});
    } catch (e) {}
  }
  function resume() {
    showUI('play'); sfx('click');
    requestGamePointerLock();
  }
  // ── 화면 안내(처음 한 번): 버튼이 어디 있고 무엇을 하는지 노란 테두리로 차례로 짚어 준다 ──
  var TOUR_STEPS = [
    [null, '👋 나그네 마을에 온 것을 환영해요!', '화면에 있는 것들을 하나씩 짚어 줄게요. 언제든 「건너뛰기」를 누를 수 있어요.'],
    ['#dpad', '🕹 방향키', '눌러서 걸어요. ▲를 두 번 누르면 달리고, 가운데를 톡톡 두 번 누르면 웅크려요(다시 톡톡 누르면 일어나요).', 'touch'],
    ['#keys', '⌨ 걷기', 'W A S D로 걷고 마우스로 둘러봐요. 스페이스는 점프, W를 두 번 누르면 달리기예요.', 'pc'],
    [null, '👀 둘러보기', '화면의 빈 곳을 손가락으로 끌면 둘러봐요. 가운데 + 표시가 겨누는 곳이에요.', 'touch'],
    ['#btnJump', '⬆ 점프', '한 칸 높이는 저절로 올라가고, 더 높으면 점프를 눌러요.', 'touch'],
    ['#btnRun', '🏃 달리기', '누르면 달리기가 켜지고, 다시 누르면 꺼져요.', 'touch'],
    ['#hotbar', '🧰 단축 칸', '손에 들 것을 고르는 곳이에요. 칸을 눌러 바꾸고, 맨 오른쪽은 가방이에요.'],
    [null, '⛏ 캐기와 놓기', '겨눈 블록을 꾹 누르면 캐고, 톡 누르면 손에 든 블록을 놓아요. 오른쪽에 「놓기」 「캐기」 버튼도 나와요.', 'touch'],
    [null, '⛏ 캐기와 놓기', '왼쪽 클릭을 누르고 있으면 캐고, 오른쪽 클릭으로 놓아요.', 'pc'],
    ['#btnBag', '🎒 가방', '모은 것을 보고 만들기·도감·업적을 열어요. 집은 물건은 땅에 버릴 수도 있어요.'],
    ['#btnChat', '💬 채팅', '함께 있는 나그네들과 이야기해요.'],
    ['#btnLook', '👤 옷', '내 모습과 입을 옷을 골라요.'],
    ['#btnView', '👁 시점', '1인칭 · 3인칭(뒤) · 3인칭(앞)을 바꿔요.'],
    ['#btnRotate', '🔄 화면', '가로 · 세로를 바꿔요.', 'touch'],
    ['#btnFold', '▶ 접기', '위쪽 버튼들을 접어 화면을 넓게 써요. 다시 누르면 펴져요.'],
    ['#btnPause', '❚❚ 메뉴', '게임 · 이동 · 함께 · 설정 탭이 있어요. 마을 수첩 · 지도 · 친구 · 파티도 여기서 열어요.'],
    ['#mapc', '🗺 작은 지도', '누르면 길 안내가 열려요. 아래에 지금 좌표(X·Y·Z)가 보여요. 「지도」 글자를 누르면 접혀요.'],
    ['#quest', '📜 할 일 안내', '지금 해 볼 일을 알려 줘요. ▴를 누르면 접혀요.'],
    ['#info', '📍 지금 있는 곳', '장소 · 계절 · 함께 있는 사람 수가 나와요.'],
    [null, '🤝 다른 나그네', '다른 사람을 두 번 누르면 친구 신청 · 파티 초대를 할 수 있어요.'],
    [null, '✅ 준비 끝!', '이제 할 일 안내를 따라 해 보세요. 메뉴 → 게임 → 「화면 안내 다시 보기」로 언제든 다시 볼 수 있어요.']
  ];
  var tourBox = null;
  function tourVisible(el) { if (!el) return false; var r = el.getBoundingClientRect(), cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden'; }
  function startTour(done) {
    if (tourBox) return;
    if (ui !== 'play') showUI('play');
    if (lockOn) { try { document.exitPointerLock(); } catch (e) {} }
    var steps = TOUR_STEPS.filter(function (s) {
      if (s[3] === 'touch' && !isTouch) return false;
      if (s[3] === 'pc' && isTouch) return false;
      return !s[0] || tourVisible(document.querySelector(s[0]));
    });
    var i = 0;
    tourBox = document.createElement('div'); tourBox.id = 'tour';
    var hole = document.createElement('div'); hole.className = 'thole';
    var bub = document.createElement('div'); bub.className = 'tbub';
    tourBox.appendChild(hole); tourBox.appendChild(bub); document.body.appendChild(tourBox);
    function finish() { if (!tourBox) return; tourBox.remove(); tourBox = null; S.tourDone = 1; saveSettings(); if (done) done(); }
    function show() {
      var s = steps[i], el = s[0] && document.querySelector(s[0]);
      bub.innerHTML = '';
      var h = document.createElement('b'); h.textContent = s[1];
      var p = document.createElement('p'); p.textContent = s[2];
      var row = document.createElement('div'); row.className = 'trow';
      var n = document.createElement('small'); n.textContent = (i + 1) + ' / ' + steps.length;
      var skip = document.createElement('button'); skip.className = 'mc'; skip.textContent = '건너뛰기';
      var next = document.createElement('button'); next.className = 'mc tnext'; next.textContent = i === steps.length - 1 ? '시작하기' : '다음 ▶';
      skip.addEventListener('click', function (e) { e.stopPropagation(); finish(); });
      next.addEventListener('click', function (e) { e.stopPropagation(); sfx('click'); if (++i >= steps.length) finish(); else show(); });
      row.appendChild(n); if (i < steps.length - 1) row.appendChild(skip); row.appendChild(next);
      bub.appendChild(h); bub.appendChild(p); bub.appendChild(row);
      var W = innerWidth, H = innerHeight;
      if (el && tourVisible(el)) {
        var r = el.getBoundingClientRect(), pad = 6;
        hole.style.display = 'block'; tourBox.classList.remove('dim');
        hole.style.left = (r.left - pad) + 'px'; hole.style.top = (r.top - pad) + 'px'; hole.style.width = (r.width + pad * 2) + 'px'; hole.style.height = (r.height + pad * 2) + 'px';
        var bw = Math.min(300, W - 24); bub.style.width = bw + 'px';
        var bh = bub.offsetHeight || 120;
        var top = r.bottom + 14; if (top + bh > H - 8) top = r.top - bh - 14; if (top < 8) top = Math.max(8, Math.min(H - bh - 8, r.top));
        var left = r.left + r.width / 2 - bw / 2;
        if (top === Math.max(8, Math.min(H - bh - 8, r.top)) && (r.top - bh - 14 < 8)) left = r.right + 14 + bw < W ? r.right + 14 : r.left - bw - 14;   // 위·아래 자리가 없으면 옆으로
        bub.style.left = Math.max(8, Math.min(W - bw - 8, left)) + 'px'; bub.style.top = top + 'px';
      } else {
        hole.style.display = 'none'; tourBox.classList.add('dim');
        var bw2 = Math.min(340, W - 24); bub.style.width = bw2 + 'px';
        bub.style.left = (W - bw2) / 2 + 'px'; bub.style.top = Math.max(8, (H - (bub.offsetHeight || 140)) / 2) + 'px';
      }
    }
    show();
  }
  // 느린 휴대폰이면 「가벼운 화면」을 한 번 자동으로 켠다(시작 뒤 20초 평균 26fps 미만)
  function watchLowSpec() {
    if (!isTouch || S.lightMode || S.lightAuto) return;
    var n = 0, t0 = 0;
    (function f(now) {
      if (!t0) t0 = now; n++;
      if (now - t0 < 20000) { requestAnimationFrame(f); return; }
      var fps = n / ((now - t0) / 1000); S.lightAuto = 1;
      if (fps < 26 && !S.lightMode) { S.lightMode = true; applyLightMode(); updateMenuLabels(); toast('📱 기기가 느려서 「가벼운 화면」을 켰어요 — 메뉴 → 설정에서 끌 수 있어요'); }
      saveSettings();
    })(performance.now());
  }
  function startGame() {
    setTimeout(watchLowSpec, 8000);
    audioOn(); sfx('click');
    if (furnaceOK()) SEEN[FURNACE] = 1; if (tableOK()) SEEN[CRAFT] = 1;   // 내 땅에 놓아 둔 용광로·제작대
    SLOTS.forEach(function (s) { if (WORN[s]) SEEN[WORN[s]] = 1; }); saveSeen();
    started = true; seenQuiet = false; lastStage = curStage().n;
    if ((!me || myPlot < 0) && (tutorialStep === 4 || tutorialStep === 5)) { tutorialStep = 6; tutorialSave(); }
    if ((!me || !NET.ok) && tutorialStep === 7) { tutorialStep = 8; tutorialSave(); }
    if (myPlot >= 0) goHome(); else { teleport(XM + 0.5, G, PZ0 - 9, Math.PI); toast('숲·산·호수에서 재료를 캐서 모아 보세요. 방주 문은 옆으로 나 있어요(창 6:16)'); }
    if (!me) setTimeout(function () { toast('지금은 구경 모드예요 — 로그인하면 내 땅과 가방이 저장돼요'); }, 15000);
    resume();
    // 처음이면 화면 안내부터, 끝나면 (휴대폰) 첫 집 연습터
    if (!S.tourDone) setTimeout(function () { startTour(function () { if (isTouch && !S.practiceSeen) openPractice(); }); }, 900);
    else if (isTouch && !S.practiceSeen) openPractice();
  }
  var forestRoute = null;
  var FOREST_ENTRY = [VX1 + 14, PZ0 + 60];
  function startForestRoute() {
    var points = [];
    if (P.x <= VX1 && P.x >= PX0 - 10 && P.z >= PZ0 - 12 && P.z <= VZ1 + 6) {
      var row = Math.max(0, Math.min(PROWS, Math.round((P.z - PZ0 + 1) / PSTEP)));
      var roadZ = PZ0 + row * PSTEP - 1;
      if (Math.abs(P.z - roadZ) > 2) points.push([P.x, roadZ]);
      points.push([VX1 + 8, roadZ]);
    }
    points.push(FOREST_ENTRY);
    forestRoute = points; forestDestination=FOREST_ENTRY; forestName='동쪽 숲';
    resume();
    renderForestRoute();
  }
  // 11/20 순간이동 대신 길 안내(전도사님 「순간이동하면 탐험하는 의미가 없어」): 화살표·남은 칸·목적지 좌표
  function guideTo(pos, label) {
    forestRoute = [pos]; forestDestination = pos; forestName = label; newsMark('guide');
    resume(); renderForestRoute();
    toast('🧭 ' + label + ' — X ' + Math.round(pos[0]) + ', Z ' + Math.round(pos[1]) + ' · 화살표를 따라 걸어가요');
  }
  var guideTopAt = 0;
  function cancelForestRoute() {
    forestRoute = null;
    $('forestGuide').hidden = true;
  }
  function renderForestRoute() {
    if (!forestRoute) return;
    var next = forestRoute[0];
    var distance = Math.hypot(next[0] - P.x, next[1] - P.z);
    while (forestRoute.length > 1 && distance <= 2) {
      forestRoute.shift();
      next = forestRoute[0];
      distance = Math.hypot(next[0] - P.x, next[1] - P.z);
    }
    var remaining = Math.hypot(forestDestination[0] - P.x, forestDestination[1] - P.z);
    if (remaining <= 6) {
      cancelForestRoute();
      toast(forestName+'에 도착했어요!');
      return;
    }
    var angle = Math.atan2(next[0] - P.x, P.z - next[1]) + P.yaw, placeLabel = forestName + ' (X ' + Math.round(forestDestination[0]) + ', Z ' + Math.round(forestDestination[1]) + ')';
    if ($('forestPlace').textContent !== placeLabel) $('forestPlace').textContent = placeLabel;
    var gnow = performance.now(); if (!(gnow < guideTopAt)) { guideTopAt = gnow + 500; var ib = $('info').getBoundingClientRect(), gt = Math.round(ib.bottom + 6) + 'px'; if ($('forestGuide').style.top !== gt) $('forestGuide').style.top = gt; }   // 왼쪽 위 정보 바로 아래
    $('forestArrow').style.transform = 'rotate(' + angle + 'rad)';
    var distanceLabel = Math.round(remaining) + '칸';
    if ($('forestDistance').textContent !== distanceLabel) $('forestDistance').textContent = distanceLabel;
    $('forestGuide').hidden = false;
  }
  function travel(where) {
    if (where === 'forest') return startForestRoute();
    var spots = {
      ark: [XM + 0.5, AZ1 + 8, 0, '방주 문 앞이에요 — 문은 옆으로(창 6:16)'],
      hill: [PX0 - 14, PZ0 + 60, Math.PI / 2, '서쪽 산이에요. 위쪽 바위에서 돌·석회암·검은 돌을 캘 수 있어요'],
      lake: [XM + 0.5, LZ - LRZ - 6, Math.PI, '남쪽 호수예요. 물가에서 진흙과 갈대를, 동쪽에서 역청을 캐요(창 14:10)'],
      sea: [XM + 0.5, SEA_Z + 24, 0, '북쪽 바다예요. 모래사장과 바닷속 물고기를 만나 보세요'],
      desert: [DES_X + 40, PZ0 + 70, -Math.PI / 2, '동쪽 사막이에요. 낙타를 만나고, 더 가면 오아시스가 있어요'],
      ararat: [ARX + 150, ARZ, Math.PI / 2, '아라랏 산이에요. 방주가 아라랏 산에 머물렀어요(창 8:4)'],
      commons: [XM + 0.5, COMMONS[3] + 4, 0, '함께 짓는 터예요. 누구나 함께 지을 수 있고, 지은 것은 모두에게 남아요']
    }, names = { ark: '방주', hill: '서쪽 산', lake: '남쪽 호수', sea: '북쪽 바다', desert: '동쪽 사막', ararat: '아라랏 산', commons: '함께 짓는 터' }, s = spots[where];
    guideTo([s[0], s[1]], names[where]);
  }

  // ───────── 입력 ─────────
  var keys = {}, joy = { x: 0, y: 0 }, jumpHeld = false, flyDown = false, sel = 0, lastJumpTap = 0, mouseMining = false;
  var hold = null; // 터치로 누르고 있는 손가락
  // 달리기: PC는 W 두 번(누르고 있는 동안)·Ctrl·R, 휴대폰은 🏃 버튼(다시 누르면 꺼짐)이나 막대를 끝까지
  var runLock = false, runSrc = '', lastW = 0, runTold = false, sneakLock = false, sprintTold = false;
  function setRun(on, src) {
    runLock = !!on; runSrc = on ? src : '';
    document.body.classList.toggle('running', runLock);
    if (on && src === 'btn' && !runTold) { runTold = true; toast('🏃 달리기 켬 — 앞으로 걸으면 더 빨리 가요. 한 번 더 누르면 꺼져요'); }
  }
  function jumpPress() {
    if (furnitureRest) return standFromFurniture();
    var now = performance.now();
    lastJumpTap = now;   // 점프 두 번으로 날기를 켜지 않는다 — 굴에서 턱을 넘다 모르게 켜졌음(11/19), 날기는 「날기」 버튼·F 키로만
    jumpHeld = true;
  }
  var resetTouchInput = function () {};
  function resetInput() {
    keys = {}; jumpHeld = false; flyDown = false; mouseMining = false;
    joy.x = joy.y = 0; lastW = 0; lastJumpTap = 0;
    if (runSrc === 'key' || runSrc === 'pad') setRun(false);
    resetTouchInput(); stopHold();
  }
  function bindInput(canvas) {
    window.addEventListener('blur', resetInput);
    document.addEventListener('visibilitychange', function () { if (document.hidden) resetInput(); });
    window.addEventListener('keydown', function (e) {
      if (ui === 'chat') { if (e.code === 'Escape') { closePanel(); e.preventDefault(); } return; }
      if ((e.code === 'KeyT' || e.code === 'Enter') && ui === 'play' && !e.repeat) { openChat(); e.preventDefault(); return; }
      if (e.code === 'KeyE' && (ui === 'play' || ui === 'inv' || ui === 'chest')) { if (ui !== 'play') closePanel(); else openPanel('inv'); e.preventDefault(); return; }
      if ((e.code === 'F5' || e.code === 'KeyV') && ui === 'play') { cycleView(); e.preventDefault(); return; }
      if (e.code === 'F2' && (ui === 'play' || ui === 'pause') && !e.repeat) { savePhoto(); e.preventDefault(); return; }   // 마인크래프트처럼 F2 = 사진
      if (e.code === 'KeyC' && (ui === 'play' || ui === 'looks') && !e.repeat) { if (ui === 'looks') closePanel(); else openLooks(); e.preventDefault(); return; }
      if (e.code === 'KeyM' && (ui === 'play' || ui === 'map') && !e.repeat) { if (ui === 'map') closePanel(); else { openPanel('map'); drawMap($('bigmapc'), true); } e.preventDefault(); return; }
      if (e.code === 'KeyH' && ui === 'play' && !e.repeat) { S.keysOff = !S.keysOff; saveSettings(); document.body.classList.toggle('keysoff', !!S.keysOff); return; }
      if (ui !== 'play') return;
      if (e.code === 'KeyW' && !e.repeat) { var nw = performance.now(); if (nw - lastW < 300) setRun(true, 'key'); lastW = nw; }
      keys[e.code] = true;
      if (e.code === 'Space' && !e.repeat) jumpPress();
      if (e.code === 'KeyF') toggleFly();
      if (e.code === 'KeyG' && ui === 'play' && !e.repeat) waveHand();   // G: 손 흔들기
      if (e.code === 'KeyQ' && ui === 'play' && !e.repeat) throwItem(HOTBAR[sel], e.shiftKey ? Math.min(64, have(HOTBAR[sel])) : 1);   // Q 버리기, Shift+Q 모두
      if (e.code === 'KeyG' && !e.repeat) rotateBuild();
      if (e.code === 'KeyZ' && !e.repeat) undoBuild();
      if (/^Digit[1-9]$/.test(e.code)) setSel(+e.code.slice(5) - 1);
      if ((e.code === 'ShiftLeft' || e.code === 'ShiftRight') && riding) dismount();
      if (e.code === 'Space' || e.code === 'Tab') e.preventDefault();
    });
    window.addEventListener('keyup', function (e) { keys[e.code] = false; if (e.code === 'Space') jumpHeld = false; if (e.code === 'KeyW' && runSrc === 'key') setRun(false); });
    canvas.addEventListener('mousedown', function (e) {
      if (isTouch || ui !== 'play') return;
      if (!lockOn) { requestGamePointerLock(); return; }
      if (e.button === 0) {
        // 왼쪽 클릭: 그림자를 겨누고 있으면 치기, 아니면 캐기
        var cs2 = pickCreature(screenDir(), (pickCenter() || {}).t);
        if (cs2 && cs2.shadow) { hitShadow(cs2.shadow); return; }
        mouseMining = true; return;
      }
      if (e.button === 2) { if (HOTBAR[sel] === BOW && have(BOW) > 0 && bowStart()) return; tapAt(); return; }
      var h = pickCenter(); if (!h) return;
      else if (e.button === 1) { var id = get(h.x, h.y, h.z); id = dropOf(id); if (INV.indexOf(id) >= 0 && have(id) > 0) { var hj = HOTBAR.indexOf(id); if (hj >= 0) { setSel(hj); return; } HOTBAR[sel] = id; renderHotbar(); setSel(sel); saveSettings(); } }
    });
    window.addEventListener('mouseup', function (e) { if (e.button === 0) { mouseMining = false; mine = null; } if (e.button === 2 && bowDraw) bowRelease(screenDir()); });
    canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    document.addEventListener('pointerlockchange', function () {
      lockOn = document.pointerLockElement === canvas;
      if (!lockOn && ui === 'play' && !isTouch) showUI('pause');
    });
    document.addEventListener('mousemove', function (e) { if (lockOn) look(e.movementX, e.movementY, 0.0024 * S.sens); });
    window.addEventListener('wheel', function (e) { if (lockOn) setSel((sel + (e.deltaY > 0 ? 1 : -1) + 9) % 9); });

    // 터치: 왼쪽 = 걷기, 오른쪽 = 둘러보기 · 톡 = 놓기 · 꾹 = 캐기(계속 누르면 이어서)
    var tMove = null, tLook = null, base = $('stickBase'), knob = $('knob');
    function stickHome() { base.classList.remove('active'); base.style.left = ''; base.style.top = ''; knob.style.transform = 'translate(0,0)'; }
    canvas.addEventListener('touchstart', function (e) {
      if (!isTouch) { isTouch = true; document.body.classList.add('touch'); }
      if (ui !== 'play') return;
      for (var i = 0; i < e.changedTouches.length; i++) {
        var t = e.changedTouches[i];
        // 걷기는 왼쪽 아래 방향키로 하고, 화면은 어디를 끌어도 둘러보기
        if (!tLook) {
          tLook = { id: t.identifier, lx: t.clientX, ly: t.clientY, t0: performance.now(), moved: 0 };
          if (HOTBAR[sel] === BOW && have(BOW) > 0 && bowStart()) tLook.bow = true;   // 활: 누르고 있는 동안 당김(끌어서 겨눔), 떼면 쏨
          else hold = { x: t.clientX, y: t.clientY, t0: performance.now(), dug: false };
        }
      }
      e.preventDefault();
    }, { passive: false });
    canvas.addEventListener('touchmove', function (e) {
      for (var i = 0; i < e.changedTouches.length; i++) {
        var t = e.changedTouches[i];
        if (tMove && t.identifier === tMove.id) {
          var dx = t.clientX - tMove.ox, dy = t.clientY - tMove.oy, L = Math.hypot(dx, dy), max = 50;
          if (L > max) { dx *= max / L; dy *= max / L; }
          joy.x = dx / max; joy.y = dy / max;
          knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
        } else if (tLook && t.identifier === tLook.id) {
          var mx = t.clientX - tLook.lx, my = t.clientY - tLook.ly;
          tLook.moved += Math.abs(mx) + Math.abs(my);
          if (tLook.moved > 12 && hold && !hold.dug) stopHold();
          look(mx, my, 0.0058 * S.sens);
          tLook.lx = t.clientX; tLook.ly = t.clientY;
          if (hold) { hold.x = t.clientX; hold.y = t.clientY; }
        }
      }
      e.preventDefault();
    }, { passive: false });
    function end(e) {
      for (var i = 0; i < e.changedTouches.length; i++) {
        var t = e.changedTouches[i];
        if (tMove && t.identifier === tMove.id) { tMove = null; joy.x = joy.y = 0; stickHome(); }
        else if (tLook && t.identifier === tLook.id) {
          if (tLook.bow) { if (e.type === 'touchend' && ui === 'play') bowRelease(screenDir()); else bowCancel(); stopHold(); tLook = null; continue; }
          var tap = tLook.moved < 12 && performance.now() - tLook.t0 < 260 && hold && !hold.dug;
          if (e.type === 'touchend' && ui === 'play' && tap) tapAt(tLook.lx, tLook.ly);
          stopHold(); tLook = null;
        }
      }
    }
    canvas.addEventListener('touchend', end); canvas.addEventListener('touchcancel', end);

    // 방향키(↑ ← → ↓): 누른 채 손가락을 옆으로 밀어도 따라가고, 모서리는 대각선. ↑ 두 번 = 달리기
    var pad = $('dpad'), padT = null, lastUp = 0, upWas = false, padMid = null;   // padMid: 가운데에서 누르기 시작한 때(밖으로 밀면 취소)
    function padAt(t) {
      var r = pad.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, R = r.width / 2;
      var dx = (t.clientX - cx) / R, dy = (t.clientY - cy) / R;
      var x = Math.abs(dx) > 0.33 ? (dx > 0 ? 1 : -1) : 0, y = Math.abs(dy) > 0.33 ? (dy > 0 ? 1 : -1) : 0;
      var center = Math.abs(dx) < 0.33 && Math.abs(dy) < 0.33;
      if (center) { x = 0; y = 0; }
      if (!center && padMid) { padMid = null; $('dMid').classList.remove('hold'); }   // 가운데에서 밀어 걸으면 웅크리기 아님
      joy.x = x; joy.y = y;
      if (x && y) { joy.x = x * 0.7071; joy.y = y * 0.7071; }
      var up = y < 0;
      if (up && !upWas) { var now = performance.now(); if (now - lastUp < 330) setRun(true, 'pad'); lastUp = now; }
      if (!up && runSrc === 'pad') setRun(false);
      upWas = up;
      ['dUp', 'dLeft', 'dRight', 'dDown'].forEach(function (k, i) { $(k).classList.toggle('on', [y < 0, x < 0, x > 0, y > 0][i]); });
    }
    function padEnd() { padMid = null; $('dMid').classList.remove('hold'); padT = null; joy.x = joy.y = 0; upWas = false; if (runSrc === 'pad') setRun(false); ['dUp', 'dLeft', 'dRight', 'dDown'].forEach(function (k) { $(k).classList.remove('on'); }); }
    pad.addEventListener('touchstart', function (e) {
      if (ui !== 'play') return; var t = e.changedTouches[0];
      if (padT === null) { padT = t.identifier; var r = pad.getBoundingClientRect(), R = r.width / 2; if (Math.abs(t.clientX - r.left - R) < R * 0.33 && Math.abs(t.clientY - r.top - R) < R * 0.33) { padMid = performance.now(); $('dMid').classList.add('hold'); } padAt(t); }
      e.preventDefault(); e.stopPropagation();
    }, { passive: false });
    pad.addEventListener('touchmove', function (e) { for (var i = 0; i < e.changedTouches.length; i++) if (e.changedTouches[i].identifier === padT) padAt(e.changedTouches[i]); e.preventDefault(); e.stopPropagation(); }, { passive: false });
    // 마인크래프트 휴대폰 조작처럼: 가운데를 톡톡 두 번 = 웅크리기 켜고 끄기 · 의자/침대에선 일어나기 · 탄 동물에선 내리기
    var lastMidTap = 0;   // 두 번째 톡이 0.4초 안에 와야 함
    function padMidTap() {
      vibrate('tap');
      if (typeof furnitureRest !== 'undefined' && furnitureRest) { standFromFurniture(); return; }
      if (cartRide) { leaveCart(); return; }
      if (riding) { dismount(); return; }
      sneakLock = !sneakLock; newsMark('sneak');
      toast(sneakLock ? '🧎 웅크렸어요 — 천천히 걷고 가장자리에서 떨어지지 않아요' : '🧍 일어났어요');
    }
    function padUp(e) { for (var i = 0; i < e.changedTouches.length; i++) if (e.changedTouches[i].identifier === padT) { var tap = padMid && e.type === 'touchend' && performance.now() - padMid < 600; padEnd(); if (tap) { var nw = performance.now(); if (nw - lastMidTap < 400) { lastMidTap = 0; padMidTap(); } else lastMidTap = nw; } } e.preventDefault(); }
    pad.addEventListener('touchend', padUp); pad.addEventListener('touchcancel', padUp);
    resetTouchInput = function () { tMove = tLook = null; stickHome(); padEnd(); lastUp = 0; };
  }
  function stopHold() { hold = null; mine = null; var r = $('ring'); if (r) r.classList.remove('show'); }
  function look(dx, dy, k) {
    if (started && ui === 'play' && Math.abs(dx) + Math.abs(dy) >= 2) tutorialEvent('look');
    P.yaw -= dx * k; P.pitch -= dy * k;
    P.pitch = Math.max(-1.53, Math.min(1.53, P.pitch));
  }
  // 가로/세로 바꾸기: 말씀우물 앱은 세로로 묶여 있어서(manifest) 게임에서만 방향을 바꿔 준다
  function rotateScreen() {
    var so = screen.orientation, cur = (so && so.type) || (innerWidth > innerHeight ? 'landscape' : 'portrait');
    var want = cur.indexOf('portrait') === 0 ? 'landscape' : 'portrait';
    function done() { toast(want === 'landscape' ? '📱 가로 화면으로 바꿨어요' : '📱 세로 화면으로 바꿨어요'); }
    function fail() { toast('이 휴대폰에서는 버튼으로 돌릴 수 없어요. 휴대폰 자동 회전을 켜고 직접 돌려 주세요'); }
    if (!so || !so.lock) return fail();
    so.lock(want).then(done, function () {
      var el = document.documentElement, rf = el.requestFullscreen || el.webkitRequestFullscreen;
      if (!rf) return fail();
      Promise.resolve(rf.call(el)).then(function () { return so.lock(want); }).then(done, fail);
    });
  }
  window.addEventListener('pagehide', function () { try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch (e) {} });
  function toggleFly() {
    if (!isAdm()) { if (P.fly) { P.fly = false; document.body.classList.remove('flying'); } return; }   // 날기는 관리자만
    if (furnitureRest) return;
    if (riding) { toast('내린 뒤에 날 수 있어요'); return; }
    P.fly = !P.fly; P.vy = 0;
    document.body.classList.toggle('flying', P.fly);
    toast(P.fly ? '🕊 날기 켬 — 「날기」 버튼(F)을 다시 누르면 꺼져요' : '날기 끔');
  }
  var VIEW_NAMES = ['1인칭', '3인칭(뒤)', '3인칭(앞)'];
  function cycleView() { S.view = (S.view + 1) % 3; saveSettings(); updateMenuLabels(); toast('시점: ' + VIEW_NAMES[S.view]); }
  var selNameT = null;
  function setSel(i, quiet) {
    if(sel!==i){buildTurn=0; $('buildRotate').textContent='돌리기';}
    sel = i;
    var slots = document.querySelectorAll('#hotbar .slot');
    for (var k = 0; k < slots.length; k++) slots[k].classList.toggle('on', k === i);
    if (!quiet) {
      var el = $('selName'); el.textContent = HOTBAR[i] ? B[HOTBAR[i]][0] + ' · ' + fmtN(have(HOTBAR[i])) + '개' : '빈 손'; el.classList.add('show');
      clearTimeout(selNameT); selNameT = setTimeout(function () { el.classList.remove('show'); }, 1600);
    }
    if (heldMesh) setHeld(HOTBAR[i]);
  }

  // ───────── 겨누기(블록 찾기) ─────────
  function raycast(ox, oy, oz, dx, dy, dz, maxD) {
    var x = Math.floor(ox), y = Math.floor(oy), z = Math.floor(oz);
    var sx = dx > 0 ? 1 : -1, sy = dy > 0 ? 1 : -1, sz = dz > 0 ? 1 : -1;
    var tdx = Math.abs(1 / dx), tdy = Math.abs(1 / dy), tdz = Math.abs(1 / dz);
    var tx = (sx > 0 ? x + 1 - ox : ox - x) * tdx, ty = (sy > 0 ? y + 1 - oy : oy - y) * tdy, tz = (sz > 0 ? z + 1 - oz : oz - z) * tdz;
    var px = x, py = y, pz = z, t = 0;
    while (t <= maxD) {
      var id = get(x, y, z);
      if (y >= YMIN && id !== AIR && id !== WATER) return { x: x, y: y, z: z, px: px, py: py, pz: pz, atY: oy + dy * t, t: t };
      px = x; py = y; pz = z;
      if (tx < ty && tx < tz) { x += sx; t = tx; tx += tdx; }
      else if (ty < tz) { y += sy; t = ty; ty += tdy; }
      else { z += sz; t = tz; tz += tdz; }
    }
    return null;
  }
  var camDist = 0, tmpV = new THREE.Vector3();
  function withinReach(h) {
    if (!h) return null;
    var d = Math.hypot(h.x + 0.5 - P.x, h.y + 0.5 - (P.y + EYE), h.z + 0.5 - P.z);
    return d <= REACH + 0.5 ? h : null;
  }
  function pickDir(dir) { var o = camera.position; return withinReach(raycast(o.x, o.y, o.z, dir.x, dir.y, dir.z, REACH + camDist + 1)); }
  function pickCenter() { camera.getWorldDirection(tmpV); return pickDir(tmpV); }
  function pickTouch(sx, sy) {
    if (S.aim === 'cross') return pickCenter();
    camera.updateMatrixWorld();
    tmpV.set(sx / window.innerWidth * 2 - 1, -(sy / window.innerHeight) * 2 + 1, 0.5).unproject(camera).sub(camera.position).normalize();
    return pickDir(tmpV);
  }

