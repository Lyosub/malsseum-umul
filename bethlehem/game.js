// 「베들레헴의 밤」 엔진 v0 (2026-11-26): 첫 화면 · 등록 · 컷신 · 지도(끌기·확대) · 방 · 대화 · 수첩 · 가방 · 도장 · 숨은 별 · 시간 · 저장(이 기기)
// 서버 저장·순위·첫 통과 알림·이어하기 코드는 다음 단계(Supabase).
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  // ?try=1 → 1장 시험판(11/27): 이 기기에만 저장(서버·순위·실명 없음), 1장이 끝나면 멈춤. 정식 진행과 저장 칸이 따로다.
  var TRY = window.BN_TRY = /[?&]try=1(&|$)/.test(location.search);
  // ?phonetest=1 → 폰 시험(11/27): 센서·마이크·소리·손 감각 문제만 골라 바로 해 보기. 이 기기에만 저장, 서버·순위 없음, 풀어도 진행에 안 들어감
  var PT = /[?&]phonetest=1(&|$)/.test(location.search);
  // ?chtest=N → N장부터 바로 시험(11/27): 앞 장은 다 푼 것으로, 이 기기에만 저장(서버·순위 없음)
  var CT = +((location.search.match(/[?&]chtest=([1-5])(&|$)/) || [])[1] || 0);
  var KEY = PT ? 'bethlehem.phonetest' : CT ? 'bethlehem.chtest' + CT + (CT === 1 ? 'b' : '') : TRY ? 'bethlehem.try1b' : 'bethlehem.v1';
  var S = load() || null;
  function blank() { return { v: 1, nick: '', dept: '', grade: '', av: 'm', ch: 1, ms: 0, hintMin: 0, rooms: {}, items: [], notes: [], stars: [], seenIntro: {}, opening: false, created: Date.now() }; }
  function load() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} if (BN.netDirty) BN.netDirty(); }

  // ── 화면 전환
  function show(id) { document.querySelectorAll('.screen').forEach(function (s) { s.classList.toggle('on', s.id === id); }); document.body.classList.toggle('playing', id === 'map' || id === 'room'); $('hud').hidden = !(id === 'map' || id === 'room'); }
  function toast(t) { var e = $('toast'); e.textContent = t; e.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function () { e.classList.remove('on'); }, 2600); }

  // ── 소리: 장면마다 BGM을 1.2초 겹쳐 바꿈(꺼짐 기억) · 효과 음악은 짧게
  var soundOn = localStorage.getItem('bethlehem.sound') !== '0', curTrack = null, curAud = null;
  BN.duck = function (on) { BN.ducked = !!on; if (curAud) curAud.volume = on ? 0.04 : 0.55; };
  function music(name) {
    if (name === undefined) name = curTrack;
    if (!name) return;
    if (!soundOn) { curTrack = name; if (curAud) curAud.pause(); return; }
    if (name === curTrack && curAud && !curAud.paused) return;
    var old = curAud, a = new Audio('audio/' + name + '.mp3'); a.loop = !/opening|ending|cookie/.test(name); a.volume = 0;
    a.play().catch(function () {}); curAud = a; curTrack = name;
    var t0 = performance.now();
    (function fade() { var k = Math.min(1, (performance.now() - t0) / 1200); a.volume = (BN.ducked ? 0.04 : 0.55) * k; if (old) old.volume = Math.max(0, old.volume * (1 - k)); if (k < 1) requestAnimationFrame(fade); else if (old) old.pause(); })();
  }
  $('btnSound').onclick = function () { soundOn = !soundOn; localStorage.setItem('bethlehem.sound', soundOn ? '1' : '0'); if (soundOn) { var n = curTrack; curTrack = null; music(n); } else if (curAud) curAud.pause(); toast(soundOn ? '소리 켬' : '소리 끔'); };
  var STING = { ok: 's1_success', stamp: 's2_stamp', chapter: 's3_chapter', trap: 's4_trap', star: 's5_star', first: 's6_first' };
  var actx = null;
  function sfx(kind) {
    if (!soundOn) return;
    if (STING[kind]) { var s = new Audio('audio/' + STING[kind] + '.mp3'); s.volume = 0.8; s.play().catch(function () {}); return; }
    try {   // 틀렸을 때: 낮은 두 음(살짝)
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      var t = actx.currentTime; [330, 262].forEach(function (f, i) { var o = actx.createOscillator(), g = actx.createGain(); o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0, t + i * .09); g.gain.linearRampToValueAtTime(.12, t + i * .09 + .01); g.gain.exponentialRampToValueAtTime(.001, t + i * .09 + .3); o.connect(g); g.connect(actx.destination); o.start(t + i * .09); o.stop(t + i * .09 + .4); });
    } catch (e) {}
  }

  // ── 시간(게임 화면에 있을 때만 흐름)
  var last = 0;
  setInterval(function () {
    var on = S && S.opening && (document.querySelector('#map.on,#room.on')) && !document.hidden;
    var now = Date.now();
    if (on && last) { S.ms += now - last; }
    last = on ? now : 0;
    if (S) { var m = Math.floor(S.ms / 60000) + S.hintMin, s = Math.floor(S.ms / 1000) % 60; $('hudTime').textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s; }
  }, 500);
  setInterval(function () { if (S) save(); }, 5000);

  // ── 첫 화면
  if (S && S.nick) { $('btnContinue').hidden = false; $('btnStart').textContent = '처음부터'; }
  if (TRY) { document.querySelector('#title .eyebrow').textContent = '✦ 1장 시험판 · 이 기기에만 저장돼요'; $('btnCode').hidden = true; var rl = $('inReal').closest('label'); if (rl) rl.hidden = true; var tn = document.querySelector('.tiny-note'); if (tn) tn.textContent = '시험판이라 실명은 받지 않아요. 순위에도 올라가지 않아요.'; $('inNick').placeholder = '시험판에서 쓸 이름(10자 이내)'; }
  $('btnStart').onclick = function () { if (S && S.nick && !confirm('처음부터 다시 할까요? 이 기기의 진행이 지워져요.')) return; S = blank(); save(); music('bgm01_main'); show('profile'); };
  function startPrologue() { playOpening(function () { enterRoom('wellroom'); }, BN.PROLOGUE); }
  function afterPrologue() { playOpening(function () { S.opening = true; save(); enterMap(); }); }
  $('btnContinue').onclick = function () { if (!S.opening) { if (S.rooms.wellroom) afterPrologue(); else enterRoom('wellroom'); return; } var C = (BN.CHAPTERS || {})[S.ch || 1]; if (C && C.start && !S.rooms[C.start]) return enterRoom(C.start); enterMap(); };
  var av = 'm';
  document.querySelectorAll('.av').forEach(function (b) { b.onclick = function () { av = b.dataset.av; document.querySelectorAll('.av').forEach(function (x) { x.classList.toggle('on', x === b); }); }; });
  document.querySelector('.av[data-av="m"]').classList.add('on');
  $('btnProfileOk').onclick = function () {
    var n = $('inNick').value.trim(), real = $('inReal').value.trim();
    if (!n) return ($('profErr').textContent = '닉네임을 적어 주세요');
    if (!real && !TRY) return ($('profErr').textContent = '실명을 적어 주세요 — 시상할 때만 사용돼요');
    if (TRY) { S.nick = n; S.av = av; save(); return startPrologue(); }
    var btn = $('btnProfileOk');
    if (!window.BNNet || !BNNet.on) { S.nick = n; S.real = real; S.av = av; S.pendingReg = 1; save(); return startPrologue(); }
    btn.disabled = true; $('profErr').textContent = '확인하는 중…';
    BNNet.register(n, real).then(function (r) {
      btn.disabled = false; $('profErr').textContent = '';
      S.nick = r.nick; S.code = r.code; S.av = av; if (r.linked) S.acct = 1; delete S.real; save();
      showCode(r.code, startPrologue, r.linked);
    }).catch(function (e) {
      btn.disabled = false;
      if (e && e.offline) { S.nick = n; S.real = real; S.av = av; S.pendingReg = 1; save(); toast('인터넷이 끊겨 있어 이 기기에만 저장해요 — 연결되면 자동으로 등록돼요'); return startPrologue(); }
      $('profErr').textContent = (e && e.message) || '등록하지 못했어요';
    });
  };
  function showCode(code, next, linked) {
    var w = el('div', 'gen-wrap');
    w.innerHTML = '<div style="text-align:center"><p class="gen-help">' + (linked ? '말씀우물 아이디에 저장돼요. 다른 기기에서도 로그인만 하면 이어져요.<br>로그인하지 않은 기기에서는 아래 코드로 이어 할 수 있어요. (수첩 맨 위에서도 다시 볼 수 있어요)' : '다른 기기에서 이어 하려면 이 코드가 필요해요.<br>사진을 찍거나 적어 두세요. (수첩 맨 위에서도 다시 볼 수 있어요)') + '</p><p class="code-big">' + code + '</p></div>';
    modal('이어하기 코드', w, next);
  }
  $('btnCode').onclick = function () {
    if (!window.BNNet || !BNNet.on) return toast('지금은 서버에 연결할 수 없어요');
    var w = el('div', 'gen-wrap');
    w.innerHTML = '<p class="gen-help">처음 등록할 때 받은 코드(예: 별빛-노래-0427)를 넣어 주세요.</p><div class="answer"><input id="codeIn" placeholder="이어하기 코드" autocomplete="off"><button class="btn gold" id="codeGo">불러오기</button></div><p class="err" id="codeErr"></p>';
    modal('이어하기 코드 넣기', w);
    $('codeGo').onclick = function () {
      var c = $('codeIn').value.trim(); if (!c) return;
      if (S && S.nick && S.code !== c && !confirm('이 기기의 진행 대신 코드의 진행을 불러올까요?')) return;
      $('codeErr').textContent = '불러오는 중…';
      BNNet.load(c).then(function (r) {
        if (!r) return ($('codeErr').textContent = '코드를 찾을 수 없어요');
        S = Object.assign(blank(), r.state || {}); S.nick = r.nick; S.code = c; save(); closeModal();
        $('btnContinue').hidden = !S.opening && !S.rooms.wellroom && !S.nick; $('btnStart').textContent = '처음부터';
        toast(r.nick + '님의 진행을 불러왔어요'); $('btnContinue').hidden = false; $('btnContinue').onclick();
      }).catch(function (e) { $('codeErr').textContent = (e && e.message) || '불러오지 못했어요'; });
    };
  };
  // 말씀우물 아이디 연동(11/27): 로그인해 있으면 아이디에 저장된 진행을 찾고, 코드로 하던 진행은 아이디에 붙인다
  function useAcct(m, quiet) {
    S = Object.assign(blank(), m.state || {}); S.nick = m.nick; S.acct = 1; save();
    $('btnContinue').hidden = false; $('btnStart').textContent = '처음부터'; $('btnAcct').hidden = true;
    if (!quiet) { toast(m.nick + '님의 진행을 아이디에서 불러왔어요'); $('btnContinue').onclick(); } else toast('아이디에 저장된 가장 최근 진행을 불러왔어요');
  }
  if (window.BNNet && BNNet.on) BNNet.loggedIn().then(function (li) {
    var line = $('acctLine');
    if (!li) { line.innerHTML = '말씀우물에 <a href="../login.html?next=/bethlehem/">로그인</a>하면 코드 없이 어느 기기에서나 이어져요'; return; }
    line.textContent = '☁ 말씀우물 아이디로 저장돼요';
    return BNNet.mine().then(function (m) {
      if (m) {
        if (S && S.nick === m.nick) { if (((m.state || {}).ms || 0) > (S.ms || 0) + 5000) useAcct(m, true); else { S.acct = 1; save(); } return; }
        var b = $('btnAcct'); b.hidden = false; b.textContent = '☁ 아이디로 이어 하기 (' + m.nick + ')';
        b.onclick = function () { if (S && S.nick && !confirm('이 기기의 진행 대신 아이디에 저장된 「' + m.nick + '」의 진행을 불러올까요?')) return; useAcct(m); };
      } else if (S && S.code) {
        BNNet.link(S.code).then(function () { S.acct = 1; save(); toast('지금까지의 진행을 말씀우물 아이디에 연결했어요'); }).catch(function () {});
      }
    });
  }).catch(function () {});

  // ── 컷신
  // 오프닝 컷신: 낡은 양피지 띠 위에 손글씨가 한 글자씩(펜 소리). 누르면 그 줄을 다 보이고, 한 번 더 누르면 다음 장면
  function penTick() { if (!soundOn) return; try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); var t = actx.currentTime, n = actx.createBufferSource(), buf = actx.createBuffer(1, 1200, actx.sampleRate), d = buf.getChannelData(0); for (var k = 0; k < d.length; k++) d[k] = (Math.random() * 2 - 1) * Math.pow(1 - k / d.length, 3); n.buffer = buf; var f = actx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 2500 + Math.random() * 1500; var gn = actx.createGain(); gn.gain.value = .05; n.connect(f); f.connect(gn); gn.connect(actx.destination); n.start(t); } catch (e) {} }
  playOpening.ok = {}; Object.keys(BN.PROLOGUE_FALLBACK || {}).forEach(function (u) { var im = new Image(); im.onload = function () { playOpening.ok[u] = 1; }; im.src = u; });
  // 손글씨 글꼴은 글자 묶음별로 나눠 받으므로, 첫 화면에서 오프닝 글자들을 미리 받아 둔다(늦게 오면 글자가 잠깐 비어 보임)
  try { if (document.fonts) document.fonts.load('30px "Nanum Brush Script"', BN.OPENING.concat(BN.PROLOGUE || []).map(function (c) { return c[1] + (c[2] || ''); }).join('') + '마태복음 1장 23절 0123456789'); } catch (e) {}
  function playOpening(done, slides) {
    slides = slides || BN.OPENING; var FB = BN.PROLOGUE_FALLBACK || {};
    show('cine'); music('bgm05_opening'); var i = -1, img = $('cineImg'), tx = $('cineText'), ref = $('cineRef'), paper = $('cinePaper'), timer, typing2 = null, full = '';
    var chars = [], k = 0, seq = 0;
    // 글을 한 덩어리(dn) + 방금 쓴 한 글자(fr)로만 둔다 — 조각난 글 마디가 많으면 글자가 비어 보이거나 깜빡였다
    var dn = null, fr = null;
    function put(ch) { dn.data += fr.textContent; fr.textContent = ch; fr.classList.remove('tw'); void fr.offsetWidth; fr.classList.add('tw'); }
    function finish() { if (typing2) { clearInterval(typing2); typing2 = null; } tx.textContent = chars.join(''); k = chars.length; ref.style.opacity = 1; clearTimeout(timer); timer = setTimeout(next, 3400); }
    function type(text) {
      if (typing2) clearInterval(typing2); full = text; tx.textContent = ''; ref.style.opacity = 0; chars = Array.from(text.replace(/<br>/g, '\n')); k = 0; dn = document.createTextNode(''); fr = document.createElement('span'); tx.appendChild(dn); tx.appendChild(fr);
      typing2 = setInterval(function () {
        var ch = chars[k++]; put(ch);
        if (ch !== ' ' && ch !== '\n' && k % 2) penTick();
        if (k >= chars.length) finish();
      }, 62);
    }
    function next() {
      i++; if (i >= slides.length) { clearTimeout(timer); if (typing2) clearInterval(typing2); return done(); }
      var my = ++seq, c = slides[i].slice(); if (FB[c[0]] && !playOpening.ok[c[0]]) c[0] = FB[c[0]]; if (typing2) { clearInterval(typing2); typing2 = null; } tx.textContent = ''; ref.textContent = ''; ref.style.opacity = 0; paper.classList.remove('on');
      if ((window.devicePixelRatio || 1) > 1.5 && /img\/(cuts\/|places\/|maps\/mapA)/.test(c[0])) c[0] = c[0].replace('.webp', '@2x.webp');
      var same = img.style.backgroundImage.indexOf(c[0]) >= 0; if (!same) img.classList.remove('on');
      setTimeout(function () { if (my !== seq) return;
        img.style.backgroundImage = 'url(' + c[0] + ')'; img.style.backgroundPosition = c[3] || 'center'; img.style.transition = 'opacity 1.2s'; img.style.transform = 'none'; img.classList.add('on');
        ref.textContent = c[2] || ''; paper.classList.add('on'); setTimeout(function () { if (my === seq) type(c[1]); }, 420);
      }, same ? 250 : 500);
      clearTimeout(timer); timer = setTimeout(function () { if (!typing2) next(); }, 15000);
    }
    $('cineSkip').onclick = function (e) { e.stopPropagation(); clearTimeout(timer); if (typing2) clearInterval(typing2); done(); };
    $('cine').onclick = function (e) { if (e.target.id === 'cineSkip') return; if (typing2) finish(); else { clearTimeout(timer); next(); } };
    next();
  }

  // ── 화면 크기(11/27): 세로 폰에서는 그림을 작게 해 한눈에(약 62%가 보임), 🔍로 크게
  var ZOOM = 'far'; try { ZOOM = localStorage.getItem('bethlehem.zoom') || 'far'; } catch (e) {}
  function fitK(near) { var vw = innerWidth, vh = innerHeight, cover = Math.max(vw / 1920, vh / 1080); if (near || vw >= vh) return cover; return Math.max(vw / 1920, Math.min(vh / 1080, vw / (1920 * 0.62))); }
  function setBlur(el, url) { if (el) el.style.setProperty('--bgimg', 'url("' + url + '")'); }
  // ── 지도(끌기·휠·두 손가락 확대)
  var view = { x: 0, y: 0, k: 1 }, W = 1920, H = 1080;
  function fitMin() { return fitK(false); }
  function clampView() { var vw = innerWidth, vh = innerHeight, k = view.k = Math.min(Math.max(view.k, fitMin()), Math.max(fitK(true), fitMin()) * 2.2); view.x = W * k <= vw ? (vw - W * k) / 2 : Math.min(0, Math.max(vw - W * k, view.x)); view.y = H * k <= vh ? (vh - H * k) / 2 : Math.min(0, Math.max(vh - H * k, view.y)); var mw = $('mapWorld'); mw.style.transform = 'translate(' + view.x + 'px,' + view.y + 'px) scale(' + k + ')'; mw.style.setProperty('--inv', (0.9 / k).toFixed(3)); }
  function enterMap() { if (window.BN3D) BN3D.unmount();
    var CH = (BN.CHAPTERS || {})[S.ch || 1] || { title: '그 밤', map: 'A' }, MP = (BN.MAPS || {})[CH.map] || { img: 'img/maps/mapA@2x.webp', bgm: 'bgm02_village' };
    if ($('mapImg').getAttribute('src') !== MP.img) { $('mapImg').src = MP.img; enterMap.once = false; } setBlur($('mapView'), MP.img);
    show('map'); music(MP.bgm); $('hudCh').textContent = (S.ch || 1) + '장 「' + CH.title + '」';
    if (!enterMap.once) { enterMap.once = true; view.k = fitK(ZOOM === 'near') * (ZOOM === 'near' ? 1.25 : 1); view.x = (innerWidth - W * view.k) * 0.55; view.y = (innerHeight - H * view.k) * 0.8; }
    clampView(); drawSpots(); updHud();
    if (!S.rooms.gate) setTimeout(function () { toast('지도를 끌어 둘러보고, 빛나는 곳을 눌러요'); }, 600);
  }
  (function () {
    var v = $('mapView'), pts = {}, start = null, moved = 0;
    v.addEventListener('pointerdown', function (e) { pts[e.pointerId] = { x: e.clientX, y: e.clientY }; start = { x: view.x, y: view.y, k: view.k, pts: JSON.parse(JSON.stringify(pts)) }; moved = 0; });
    v.addEventListener('pointermove', function (e) {
      if (!pts[e.pointerId]) return; pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(pts), s0 = start.pts;
      if (ids.length === 1 && s0[ids[0]]) { var dx = pts[ids[0]].x - s0[ids[0]].x, dy = pts[ids[0]].y - s0[ids[0]].y; moved = Math.max(moved, Math.abs(dx) + Math.abs(dy)); view.x = start.x + dx; view.y = start.y + dy; }
      else if (ids.length === 2 && s0[ids[0]] && s0[ids[1]]) {
        var d0 = Math.hypot(s0[ids[0]].x - s0[ids[1]].x, s0[ids[0]].y - s0[ids[1]].y), d1 = Math.hypot(pts[ids[0]].x - pts[ids[1]].x, pts[ids[0]].y - pts[ids[1]].y);
        var cx = (pts[ids[0]].x + pts[ids[1]].x) / 2, cy = (pts[ids[0]].y + pts[ids[1]].y) / 2, k = start.k * d1 / d0;
        view.x = cx - (cx - start.x) * k / start.k; view.y = cy - (cy - start.y) * k / start.k; view.k = k; moved = 99;
      }
      clampView();
    });
    function up(e) { delete pts[e.pointerId]; start = { x: view.x, y: view.y, k: view.k, pts: JSON.parse(JSON.stringify(pts)) }; }
    v.addEventListener('pointerup', up); v.addEventListener('pointercancel', up);
    v.addEventListener('wheel', function (e) { e.preventDefault(); var k = view.k * (e.deltaY < 0 ? 1.12 : 1 / 1.12); view.x = e.clientX - (e.clientX - view.x) * k / view.k; view.y = e.clientY - (e.clientY - view.y) * k / view.k; view.k = k; clampView(); }, { passive: false });
    v.addEventListener('click', function (e) { if (moved > 8) e.stopPropagation(); }, true);
    addEventListener('resize', function () { if ($('map').classList.contains('on')) clampView(); });
  })();
  function unlocked(id) { return (BN.UNLOCK[id] || []).every(function (r) { return S.rooms[r]; }); }
  function drawSpots() {
    var box = $('spots'); box.innerHTML = '';
    BN.SPOTS.forEach(function (sp) {
      if ((sp.ch || 1) !== (S.ch || 1)) return;
      var b = document.createElement('button'), lock = !unlocked(sp.id), done = !!S.rooms[sp.id];
      b.dataset.id = sp.id; b.className = 'spot' + (lock ? ' lock' : '') + (done ? ' done' : ''); b.style.left = sp.x + '%'; b.style.top = sp.y + '%';
      b.innerHTML = '<span class="ring">' + (lock ? '🔒' : done ? '✔' : sp.icon) + '</span><span class="lbl">' + (lock ? '???' : sp.name) + '</span>';
      b.onclick = function () { if (lock) return toast('아직 갈 수 없어요 — 앞의 장소를 먼저 풀어요'); enterRoom(sp.id); };
      box.appendChild(b);
    });
  }
  function updHud() { $('hudStamp').textContent = Object.keys(S.rooms).filter(function (k) { return BN.STAMPS[k]; }).length; $('hudStar').textContent = S.stars.length; }

  // ── 방
  var cur = null;
  function enterRoom(id) {
    var R = BN.ROOMS[id];
    if (!R) { talk([['asaph', 0, '이곳은 아직 정리 중이다. 곧 열린다.'], ['gilead', 2, '(준비 중이래요. 빵 먹고 기다릴까요?)']]); return; }
    cur = id; show('room'); $('btnBack').hidden = !!R.noBack && !S.rooms[id];   /* 장 첫 방은 풀기 전에만 못 나간다(풀고 나면 「지도로」) */ $('toast').classList.remove('on'); music(R.bgm || 'bgm02_village');
    var bg = $('roomBg'); bg.style.backgroundImage = 'url(' + R.bg + ')';
    roomFit(R.focus || 50);
    var pv = $('roomView'); setBlur(pv, R.bg); pv.classList.remove('push'); void pv.offsetWidth; pv.classList.add('push');
    if (window.BN3D) {
      var key = R.bg.replace(/^.*\//, '').replace('.webp', '');
      BN3D.mount($('roomStage'), { img: R.bg, hi: R.bg.replace('.webp', '@2x.webp'), depth: 'img/depth/' + key + '.webp', fx: (BN.FX || {})[cur] || {}, grade: ((BN.FX || {})[cur] || {}).grade,
        panFrac: function () { var vw = innerWidth, sw = 1920 * rv.k, sh = 1080 * rv.k; return { x: sw > vw ? ((rv.x - (vw - sw) / 2) / ((sw - vw) / 2 || 1)) : 0, y: sh > innerHeight ? ((rv.y - (innerHeight - sh) / 2) / ((sh - innerHeight) / 2 || 1)) : 0 }; } });
      setTimeout(function () { document.querySelectorAll('#roomSpots .rspot').forEach(function (b) { var x = parseFloat(b.style.left) / 100, y = parseFloat(b.style.top) / 100; if (b.classList.contains('fig')) BN3D.track(b, x, Math.min(.98, y - .03), .82); else BN3D.track(b, x, y); }); }, 0);
    }
    $('roomTitle').innerHTML = R.title.split(' · ').map(function (t) { return '<span>' + t + '</span>'; }).join('<i class="sep"> · </i>'); var rtl = $('roomTitle'); rtl.classList.remove('fade'); void rtl.offsetWidth; rtl.classList.add('fade');
    var box = $('roomSpots'); box.innerHTML = '';
    R.spots.forEach(function (sp) {
      if (sp.act.indexOf('star:') === 0 && S.stars.indexOf(sp.act) >= 0) return;
      if (sp.when && !sp.when(S)) return;
      if (sp.act.indexOf('clue:') === 0 && (S.clues || {})[sp.act.slice(5)]) return;
      if (sp.act.indexOf('bread:') === 0 && (S.bread || []).indexOf(sp.act) >= 0) return;
      var b = document.createElement('button'); b.className = 'rspot'; b.style.left = sp.x + '%'; b.style.top = sp.y + '%';
      if (sp.night) { var hh = new Date().getHours(); if (hh >= 5 && hh < 19) return; }
      if (sp.w) { if (sp.act.indexOf('card:') === 0 && (S.cards || []).indexOf(sp.act.slice(5)) >= 0) return; if (sp.act.indexOf('pick:') === 0 && (S.taken || []).indexOf(sp.id) >= 0) return; if (sp.act.indexOf('scrap:') === 0 && (S.scraps || []).indexOf(sp.act.slice(6)) >= 0) return; if (sp.act.indexOf('tile:') === 0 && (S.tiles || []).indexOf(sp.act.slice(5)) >= 0) return;
        b.className = 'rspot area'; b.dataset.id = sp.id; b.dataset.k = sp.act.split(':')[0]; if (S.rooms[id] && !/^puzzle:(chart|journal|guards)$/.test(sp.act) && !(sp.act === 'puzzle:guards' && !(S.f1 || {}).guards)) b.classList.add('done'); b.style.width = sp.w + '%'; b.style.height = sp.h + '%'; if (sp.act.indexOf('room:') === 0) { var RT = BN.ROOMS[sp.act.split(':')[1]]; b.innerHTML = '<span class="door-lbl">🚪 ' + ((RT && RT.title) || '') + (sp.lock && !BN.used(sp.id, sp.lock) ? ' 🔒' : '') + '</span>'; } if (sp.act.indexOf('sheep:') === 0) b.innerHTML = '<span class="bell">' + sheepBell(+sp.act.split(':')[1]) + '</span>';
        b.onclick = function (e) { ripple(e); act(R, sp, b); }; box.appendChild(b); return; }
      if (sp.fig) { b.className = 'rspot fig'; b.style.setProperty('--h', (sp.h / 100 * 1080) + 'px'); b.innerHTML = '<img src="img/chars/' + sp.fig + '.webp" alt="">' + (sp.name ? '<span class="lbl">' + sp.name + '</span>' : ''); b.onclick = function () { act(R, sp, b); }; box.appendChild(b); return; }
      b.innerHTML = sp.hidden ? '<span class="glint" style="opacity:.25;width:22px;height:22px"></span>' : '<span class="glint"></span><span class="lbl">' + sp.name + '</span>';
      b.onclick = function () { act(R, sp, b); };
      box.appendChild(b);
    });
    if (!S.seenIntro[id] && R.intro) { S.seenIntro[id] = 1; save(); setTimeout(function () { talk(R.intro); }, 500); }
  }
  function leaveRoom() { if (window.BN3D) BN3D.unmount(); }
  $('btnBack').onclick = function () { leaveRoom(); var R0 = BN.ROOMS[cur]; if (R0 && R0.back) enterRoom(R0.back); else enterMap(); };
  // 방 화면: 그림(1920×1080)을 화면을 덮는 크기로, 남는 쪽은 끌어서 둘러봄(세로 화면에서는 좌우 파노라마)
  var rv = { x: 0, y: 0, k: 1 };
  function roomClamp() { var vw = innerWidth, vh = innerHeight, k = rv.k; rv.x = 1920 * k <= vw ? (vw - 1920 * k) / 2 : Math.min(0, Math.max(vw - 1920 * k, rv.x)); rv.y = 1080 * k <= vh ? (vh - 1080 * k) / 2 : Math.min(0, Math.max(vh - 1080 * k, rv.y)); var st = $('roomStage'); st.style.width = '1920px'; st.style.height = '1080px'; st.style.transform = 'translate(' + rv.x + 'px,' + rv.y + 'px) scale(' + k + ')'; st.style.setProperty('--inv', (1 / k).toFixed(3)); }
  function roomFit(focus) { rv.k = fitK(ZOOM === 'near'); rv.x = innerWidth / 2 - 1920 * rv.k * focus / 100; rv.y = (innerHeight - 1080 * rv.k) / 2; roomClamp(); var wide = 1920 * rv.k - innerWidth > 40; $('panHint').classList.toggle('on', wide); clearTimeout(roomFit.t); roomFit.t = setTimeout(function () { $('panHint').classList.remove('on'); }, 3000); }
  (function () {
    var v = $('roomView'), s = null, moved = 0;
    v.addEventListener('pointerdown', function (e) { s = { x: e.clientX, y: e.clientY, rx: rv.x, ry: rv.y }; moved = 0; });
    v.addEventListener('pointermove', function (e) { if (!s) return; var dx = e.clientX - s.x, dy = e.clientY - s.y; moved = Math.max(moved, Math.abs(dx) + Math.abs(dy)); rv.x = s.rx + dx; rv.y = s.ry + dy; roomClamp(); });
    function up() { s = null; } v.addEventListener('pointerup', up); v.addEventListener('pointercancel', up);
    v.addEventListener('click', function (e) { if (moved > 8) e.stopPropagation(); }, true);
    addEventListener('resize', function () { if ($('room').classList.contains('on')) roomFit(50); });
  })();
  // 11/27 진짜 방탈출: 문제마다 먼저 찾아야 할 단서(BN.NEED[문제] = { c: [단서 키…], say: 대사 })
  function needClues(name) {
    var N = (BN.NEED || {})[name]; if (!N || (N.when && !N.when(S))) return false;
    var C = S.clues || {}, got = N.c.filter(function (k) { return C[k]; }).length; if (got >= N.c.length) return false;
    talk([Array.isArray(N.say) ? N.say : ['asaph', 0, N.say || '아직은 알 수 없다. 이 방을 더 살펴보아라.'], ['narr', null, '(이 문제에 필요한 단서 ' + got + ' / ' + N.c.length + ')']]);
    return true;
  }
  BN.hasClue = function (k) { return !!(S.clues || {})[k]; };
  BN.reRoom = function () { if (cur && $('room').classList.contains('on')) enterRoom(cur); };
  function act(R, sp, el) {
    var real = window.event && window.event.isTrusted;   // 실제 손가락 누름만(시험 프로그램의 누름은 통과)
    if (real && (Date.now() - dlgClosedAt < 450 || !$('dialog').hidden)) return;
    if (/^puzzle:/.test(sp.act) && !/^puzzle:(chart|journal|guards)$/.test(sp.act) && S.rooms[cur] && !PT) { var nt = R.note && R.note.text; return toast('✔ 이미 풀었어요' + (nt ? ' — 수첩에 적혀 있어요' : '')); }
    if (held) return useOn(R, sp, el);
    var a = sp.act.split(':');
    if (a[0] === 'talk') { var tl = (R.talks[a[1]] || []).slice(), ch = BN.clueHint && BN.clueHint(cur); if (ch && sp.fig && /^(asaph|gilead|keeper)_/.test(sp.fig)) tl.push(/^gilead/.test(sp.fig) ? ['gilead', 1, '(소곤) 이 근처에 뭔가 ' + ch.n + '개쯤 더 떨어져 있는 것 같아요. 아까 ' + ch.places[0] + ' 쪽에서 뭐가 반짝였어요!'] : /^keeper/.test(sp.fig) ? ['keeper', 0, '여기 아직 못 찾은 것이 ' + ch.n + '개 있어. ' + ch.places[0] + ' 쪽을 잘 봐.'] : ['asaph', 0, '이곳에 아직 못 찾은 것이 ' + ch.n + '개 있다. ' + ch.places[0] + ' 쪽을 잘 살펴보아라.']); talk(tl); }
    else if (a[0] === 'clue') { if (sp.need && !has(sp.need)) return BN.darkSay ? talk(BN.darkSay(S, sp.need)) : toast('너무 어두워 잘 보이지 않는다'); S.clues = S.clues || {}; if (!S.clues[a[1]]) { S.clues[a[1]] = 1; if (sp.note) S.notes.push({ text: sp.note, ref: sp.ref || '' }); save(); sfx('ok'); toast('🔎 ' + (sp.msg || '단서를 찾았어요') + (sp.note ? ' — 수첩에 적었어요' : '')); el.remove(); if (sp.say) talk(sp.say); } }
    else if (a[0] === 'puzzle' && needClues(a[1])) return;
    else if (a[0] === 'puzzle') { if (PUZZLES[a[1]] || PZ_EXTRA[a[1]]) (PUZZLES[a[1]] || PZ_EXTRA[a[1]])(R); else BN.PZ[a[1]](R, API); }
    else if (a[0] === 'room') { if (sp.lock && !BN.used(sp.id, sp.lock)) return talk(sp.lockSay || [['narr', null, '문이 잠겨 있다.']]); enterRoom(a[1]); }
    else if (a[0] === 'sheep') sheepBleat2(+a[1], el);
    else if (a[0] === 'tile') { S.tiles = S.tiles || []; if (S.tiles.indexOf(a[1]) < 0) { S.tiles.push(a[1]); save(); sfx('ok'); toast('🧩 ' + sp.msg + ' (「' + a[1] + '」 · ' + S.tiles.length + '/6)'); el.remove(); } }
    else if (a[0] === 'scrap') { S.scraps = S.scraps || []; if (S.scraps.indexOf(a[1]) < 0) { S.scraps.push(a[1]); save(); sfx('ok'); toast('📜 ' + sp.msg + ' (' + S.scraps.length + '/3)'); el.remove(); } }
    else if (a[0] === 'card') { S.cards = S.cards || []; if (S.cards.indexOf(a[1]) < 0) { S.cards.push(a[1]); save(); sfx('ok'); toast('📜 ' + (sp.msg || '명부 조각을 찾았어요') + ' (「' + a[1] + '」)'); el.remove(); } }
    else if (a[0] === 'pick') { S.taken = S.taken || []; if (S.taken.indexOf(sp.id) < 0) { S.taken.push(sp.id); if (S.items.indexOf(a[1]) < 0) S.items.push(a[1]); save(); sfx('ok'); toast((sp.msg || '') + ' — 「' + BN.ITEMS[a[1]][0] + '」을(를) 가방에 넣었어요'); el.remove(); } }
    else if (a[0] === 'bread') { S.bread = S.bread || []; if (S.bread.indexOf(sp.act) < 0) { S.bread.push(sp.act); save(); sfx('ok'); toast('🍞 길르앗이 흘린 빵 부스러기! (' + S.bread.length + '/12)' + (S.bread.length === 12 ? ' — 다 모았어요!' : '')); el.remove(); } }
    else if (a[0] === 'star') { if (S.stars.indexOf(sp.act) < 0) { S.stars.push(sp.act); var bonus = S.stars.length % 2 === 0; if (bonus) { oilInit(); S.oil[S.ch] += 1; } save(); updHud(); sfx('star'); toast('✦ 숨은 별! 기록 −1분' + (bonus ? ' · 등잔 기름 한 방울을 얻었어요' : '') + ' (' + S.stars.length + '/7)'); el.remove(); } }
  }

  // ── 대화(한 글자씩, 누르면 넘김)
  var dq = [], dqDone = null, typing = null, typingFull = '';
  var dqTotal = 0;
  var BIBLE_WHO = { angel: 1, simeon: 1, anna: 1, magi: 1, herod: 1, scribes: 1, shep: 1, mary: 1, joseph: 1, priest: 1 };
  function talk(lines, done) { dq = lines.slice(); dqTotal = dq.length; dqDone = done || null; $('dialog').hidden = false; nextLine(); }
  var dlgClosedAt = 0;
  function endTalk() { if (typing) { clearInterval(typing); typing = null; } dq = []; $('dialog').hidden = true; dlgClosedAt = Date.now(); var d = dqDone; dqDone = null; if (d) d(); }
  function nextLine() {
    if (typing) { finishType(); return; }
    var L = dq.shift(); if (!L) { $('dialog').hidden = true; dlgClosedAt = Date.now(); var d = dqDone; dqDone = null; if (d) d(); return; }
    var who = BN.CHARS[L[0]] || { name: L[0] }, face = who.face;
    if (face === 'me') face = 'me_' + S.av;
    var fe = $('dlgFace'); if (face) { fe.src = 'img/chars/' + face + '_f' + (L[1] || 0) + '.webp'; fe.style.visibility = 'visible'; } else fe.style.visibility = 'hidden';
    $('dlgName').textContent = L[0] === 'me' ? S.nick : who.name;
    var nth = dqTotal - dq.length, last = !dq.length; $('dlgCount').textContent = dqTotal > 1 ? nth + ' / ' + dqTotal : '';
    $('dlgNext').textContent = last ? '■ 끝 · 눌러서 닫기' : '▼ 다음'; $('dlgNext').classList.toggle('last', last); $('dlgEnd').hidden = dqTotal < 3 || last;
    // 11/27: 서술 구절은 「두루마리에 글자가 떠오르는」 모양, 성경 인물의 말은 구절 번호를 대화창 대신 수첩 「들은 말씀」에 모은다
    var scr = L[0] === 'scroll' || (L[0] === 'narr' && !!L[4]); $('dialog').classList.toggle('scroll', scr);
    var heard = !scr && L[4] && BIBLE_WHO[L[0]];
    if (heard) { S.heard = S.heard || []; if (!S.heard.some(function (h) { return h[0] === L[4]; })) { S.heard.push([L[4], who.name, L[2]]); save(); } }
    $('dlgSub').textContent = L[3] || ''; $('dlgRef').textContent = heard ? '' : (L[4] || '');
    var t = $('dlgText'); t.classList.toggle('scripture', !!L[4]); t.textContent = ''; var full = L[2], i = 0;
    typing = setInterval(function () { i += scr ? 1 : 2; t.textContent = full.slice(0, i); if (i >= full.length) finishType(); }, scr ? 45 : 28);
    typingFull = full;
  }
  function finishType() { if (!typing) return; $('dlgText').textContent = typingFull; clearInterval(typing); typing = null; }
  $('dialog').onclick = nextLine;
  $('dlgEnd').onclick = function (e) { e.stopPropagation(); endTalk(); };

  // ── 프롤로그 연습 퍼즐: 두루마리 조각 셋을 이어 붙이기(두 조각을 차례로 누르면 자리가 바뀜)
  var PZ_EXTRA = {
    wellscroll: function (R) {
      var got = (S.scraps || []).length;
      if (got < 3) return talk([['keeper', 2, '돌문 가운데가 비어 있어. 두루마리 조각이 ' + (3 - got) + '개 더 있어야 해.']]);
      var parts = BN.SCROLL_PARTS || ['마태복음', '1장', '23절'], rr = seedRnd(3), perms = [[2, 0, 1], [1, 2, 0], [2, 1, 0], [0, 2, 1], [1, 0, 2]], order = perms[Math.floor(rr() * 5)].slice(), sel = -1, wrap = el('div', 'scrollfix');
      if (order.join() === '0,1,2') order = [2, 0, 1];
      function draw() {
        wrap.innerHTML = '<p class="tiny-note howto">조각을 두 개 차례로 누르면 자리가 바뀌어요.</p>';
        order.forEach(function (k, i) {
          var b = el('button', 'scrap-piece' + (sel === i ? ' sel' : '')); b.innerHTML = '<span>' + parts[k] + '</span>'; b.style.setProperty('--r', ((k * 37) % 7 - 3) + 'deg');
          b.onclick = function () { if (sel < 0) { sel = i; draw(); return; } var t = order[sel]; order[sel] = order[i]; order[i] = t; sel = -1; draw(); if (order.join() === '0,1,2') { sfx('ok'); setTimeout(function () { closeModal(); solve(R); }, 700); } };
          wrap.appendChild(b);
        });
        var boxes = el('div', 'twelve'); for (var j = 0; j < 12; j++) boxes.appendChild(el('i', '')); wrap.appendChild(boxes);
      }
      draw(); modal('찢긴 두루마리', wrap);
    }
  };
  var API = { S: function () { return S; }, talk: function (l, d) { talk(l, d); }, modal: function (t, h, c) { modal(t, h, c); }, closeModal: function () { closeModal(); }, solve: function (R) { solve(R); }, wrong: function (k, m) { wrong(k, m); }, locked: function (k) { return locked(k); }, el: function (a, b, c) { return el(a, b, c); }, seedRnd: function (n) { return seedRnd(n); }, sfx: function (k) { sfx(k); }, toast: function (m) { toast(m); }, save: function () { save(); }, tick: function () { penTick(); } };
  // ── 창
  function modal(title, html, onClose) { $('modalTitle').textContent = title; $('modalBody').innerHTML = ''; if (typeof html === 'string') $('modalBody').innerHTML = html; else $('modalBody').appendChild(html); $('modal').hidden = false; modal.onClose = onClose; }
  function closeModal() { $('modal').hidden = true; if (modal.onClose) { var f = modal.onClose; modal.onClose = null; f(); } }
  $('modalX').onclick = closeModal;
  function stampRow() { var I = BN.STAMP_ICON || {}, got = Object.keys(S.rooms).filter(function (k) { return I[k]; }); return got.length ? '<div class="note stamp-row"><b>받은 도장 ' + got.length + '/12</b><div>' + got.map(function (k) { return '<span title="' + I[k][1] + '">' + I[k][0] + '<small>' + I[k][2] + '</small></span>'; }).join('') + '</div></div>' : ''; }
  $('btnNote').onclick = function () { var ch = $('room').classList.contains('on') && BN.clueHint && BN.clueHint(cur); modal('서기관의 수첩', (ch ? '<div class="note clue-left"><div class="cl-h">🔎 이 장소에서 아직 못 찾은 것 <b>' + ch.n + '개</b></div><div class="cl-chips">' + ch.places.map(function (p) { return '<span>' + p + '</span>'; }).join('') + '</div><div class="cl-f">이 근처 어딘가에 떨어뜨린 것 같다</div></div>' : '') + stampRow() + (S.code ? '<div class="note" style="text-align:center">이어하기 코드 <b class="code-sm">' + S.code + '</b></div>' : '') + (S.notes.length ? S.notes.map(function (n) { return '<div class="note">' + n.text + '<div class="ref">' + (n.ref || '') + '</div></div>'; }).join('') : '<p class="empty">아직 적은 것이 없어요. 장소를 풀면 단서가 저절로 적혀요.</p>') + heardList()); };
  function heardList() { var H = S.heard || []; if (!H.length) return ''; return '<div class="note heard"><b>📖 들은 말씀 ' + H.length + '</b>' + H.map(function (h) { return '<p><span class="hw">' + h[1] + '</span> 「' + h[2] + '」 <span class="ref">' + h[0] + '</span></p>'; }).join('') + '</div>'; }
  // 11/27 1장 견본: 가방에서 물건을 골라 「손에 들기」(쓸 곳을 직접 누름) · 여러 개 골라 「합치기」
  var held = null, heldEl = document.createElement('div'); heldEl.className = 'held-chip'; heldEl.hidden = true; document.body.appendChild(heldEl);
  BN.used = function (spId, k) { return !!(S && S.used || {})[spId + ':' + k]; };
  function setHeld(k) {
    held = k || null; heldEl.hidden = !held;
    if (held) { var it = BN.ITEMS[held] || [held, '']; heldEl.innerHTML = '<img src="' + it[1] + '" alt="" class="' + (held === 'lamp_e' ? 'dim' : '') + '"><span><b>✋ ' + it[0] + '</b><small>쓸 곳을 누르세요</small></span><button type="button" aria-label="내려놓기">내려놓기</button>'; heldEl.querySelector('button').onclick = function (e) { e.stopPropagation(); setHeld(null); }; }
    document.body.classList.toggle('holding', !!held);
  }
  BN.setHeld = setHeld;
  var NOPE = ['「X」… 여기엔 쓸 데가 없는 것 같아요.', '「X」… 이건 다른 데 쓰는 거 아닐까요?', '(「X」 — 대 보았지만 아무 일도 일어나지 않는다)'];
  function useOn(R, sp, el) {
    var k = held; setHeld(null);
    var acc = sp.accept && sp.accept[k], nm = (BN.ITEMS[k] || [k])[0];
    if (!acc && /^clue:/.test(sp.act) && sp.need === k) return act(R, sp, el);   /* 등잔을 들고 어두운 단서를 누르면 그대로 비춰 본다 */
    if (!acc) return talk([['gilead', 1, NOPE[Math.floor(Math.random() * NOPE.length)].replace('X', nm)]]);
    if (acc.noUse) return talk(acc.say);
    S.used = S.used || {}; if (S.used[sp.id + ':' + k]) return toast('이미 여기에 썼어요');
    S.used[sp.id + ':' + k] = 1; if (acc.consume) S.items = S.items.filter(function (x) { return x !== k; }); save(); sfx('ok');
    var next = function () { if (acc.go) enterRoom(acc.go); else if (cur) BN.reRoom(); };
    if (acc.say) talk(acc.say, next); else { toast(acc.msg || '썼다'); setTimeout(next, acc.go ? 900 : 0); }
  }
  function bagOpen() {
    var sel = [], inRoom = $('room').classList.contains('on'), w = el('div', 'gen-wrap');
    function draw() {
      if (!S.items.length) { w.innerHTML = '<p class="gen-help">아직 가방이 비어 있어요.</p>'; return; }
      w.innerHTML = '<p class="gen-help bag-tip">물건을 눌러 고르세요. <b>하나</b>를 골라 「손에 들기」 하면 장소에서 쓸 곳을 직접 눌러요. <b>여러 개</b>를 고르면 「합치기」.</p>' +
        '<div class="bag bag2">' + S.items.map(function (k) { var it = BN.ITEMS[k] || [k, '', '']; return '<button type="button" class="it' + (sel.indexOf(k) >= 0 ? ' sel' : '') + '" data-k="' + k + '"><img src="' + it[1] + '" alt="" class="' + (k === 'lamp_e' ? 'dim' : '') + '"><b>' + it[0] + '</b><span>' + (it[2] || '') + '</span></button>'; }).join('') + '</div>' +
        '<div class="bag-act"><button type="button" class="btn gold" id="bgHold"' + (sel.length === 1 && inRoom ? '' : ' disabled') + '>✋ 손에 들기</button><button type="button" class="btn ghost" id="bgMix"' + (sel.length >= 2 ? '' : ' disabled') + '>🔧 합치기</button></div>' +
        (inRoom ? '' : '<p class="gen-help" style="text-align:center;font-size:12px">손에 들기는 장소 안에서 할 수 있어요</p>');
      w.querySelectorAll('.it').forEach(function (b) { b.onclick = function () { var k = b.dataset.k, i = sel.indexOf(k); if (i >= 0) sel.splice(i, 1); else sel.push(k); draw(); }; });
      w.querySelector('#bgHold').onclick = function () { if (sel.length !== 1 || !inRoom) return; var k = sel[0]; closeModal(); setHeld(k); };
      w.querySelector('#bgMix').onclick = function () {
        if (sel.length < 2) return;
        var key = sel.slice().sort().join('+'), rc = (BN.COMBINE || []).filter(function (c) { return c.of.slice().sort().join('+') === key; })[0];
        if (!rc) { var part = (BN.COMBINE_HINT || {})[key]; sfx('no'); return toast(part || '이것들은 합쳐지지 않는다'); }
        S.items = S.items.filter(function (x) { return rc.of.indexOf(x) < 0 || (rc.keep || []).indexOf(x) >= 0; }); if (S.items.indexOf(rc.make) < 0) S.items.push(rc.make);
        S.made = S.made || {}; S.made[rc.make] = 1; save(); sfx('ok'); sel = []; draw(); toast('🔧 ' + rc.msg);
        if (inRoom) BN.reRoom();
      };
    }
    draw(); modal('가방', w);
  }
  $('btnBag').onclick = function () { bagOpen(); };
  $('btnHint').onclick = function () { return hintOil(); };
  var __oldHint = function () {
    if (!cur || !$('room').classList.contains('on')) return toast('장소 안에서 힌트를 볼 수 있어요');
    var H2 = (BN.HINTS || {})[cur]; if (!H2) return toast('이 장소의 힌트는 준비 중이에요');
    var used = (S.hints = S.hints || {})[cur] || 0, cost = [3, 7, 10];
    var html = H2.slice(0, used).map(function (h, i) { return '<div class="note">' + (i + 1) + '단계: ' + h + '</div>'; }).join('');
    if (used < H2.length) html += '<button class="btn gold" id="hintMore">' + (used + 1) + '단계 힌트 보기 (+' + cost[used] + '분)</button>';
    modal('힌트', html);
    var hb = $('hintMore'); if (hb) hb.onclick = function () { S.hints[cur] = used + 1; S.hintMin += cost[used]; save(); closeModal(); $('btnHint').onclick(); };
  };

  // ── 방 끝내기: 도장 → 대화 → 수첩·가방
  function solve(R) {
    if (PT) return ptOk();
    if (S.rooms[cur]) return;
    var ch = BN.STAMPS[cur]; S.rooms[cur] = { at: S.ms, stamp: ch || '' }; $('btnBack').hidden = false;
    if (BN.netSolved) BN.netSolved(cur);
    if (R.note) S.notes.push(R.note);
    [R.item, R.item2].forEach(function (k) { if (k && S.items.indexOf(k) < 0) S.items.push(k); });
    save(); updHud();
    var after = function () {
      talk(R.done || [], function () {
        if (R.prologue) return afterPrologue();
        if (R.chapterEnd) return chapterEnd(R.chapterEnd);
        if (R.back) { toast('곁가지 이야기를 마쳤어요'); enterRoom(R.back); return; }
        var SI = (BN.STAMP_ICON || {})[cur]; toast(ch ? '도장 「' + (SI ? SI[0] + ' ' + SI[1] + ' · ' + SI[2] : ch) + '」을 받았어요 — 지도에 새 길이 열렸어요' : '풀었어요 — 지도에 새 길이 열렸어요');
        if (R.stay) return enterRoom(cur);   /* 받은 도구를 이 자리에서 바로 쓰는 방(여관 → 부엌 문) */
        enterMap();
      });
    };
    if (!ch) { sfx('ok'); setTimeout(after, 400); return; }
    var SI2 = (BN.STAMP_ICON || {})[cur]; $('stampChar').innerHTML = SI2 ? SI2[0] + '<small>' + SI2[2] + '</small>' : ch; $('stampFx').hidden = false; sfx('stamp');
    setTimeout(function () { $('stampFx').hidden = true; after(); }, 1500);
  }

  // ── 퍼즐
  var PUZZLES = {
    // 1 계보: 명부 조각 10장을 룻 4:18-22 순서로. 조각마다 선이 그려져 있어 바로 놓으면 숫자 14가 이어진다.
    genealogy: function (R) {
      var names = BN.GENEALOGY, n = names.length, order = names.map(function (_, i) { return i; });
      var seed = (S.created % 9973) + 1; function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
      do { order.sort(function () { return rnd() - .5; }); } while (order.every(function (v, i) { return v === i; }));
      var placed = new Array(n).fill(null), sel = null;
      var PATH = 'M258 50 L300 22 L300 112 M262 112 L338 112 M640 22 L540 86 L720 86 M650 50 L650 112';   // 「1」과 「4」: 전체 1000×133 위에 그려 조각마다 잘라 보임
      function card(i, cls) {
        var d = document.createElement('div'); d.className = 'gcard ' + (cls || '');
        d.innerHTML = '<svg viewBox="' + (i * 100) + ' 0 100 133" preserveAspectRatio="none"><path d="' + PATH + '" stroke="#b8862b" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/></svg><span style="position:relative">' + names[i] + '</span>';
        return d;
      }
      var wrap = document.createElement('div'); wrap.className = 'gen-wrap';
      wrap.innerHTML = '<p class="gen-help howto">명부 조각을 눌러 고른 뒤 아래 빈칸을 누르면 놓여요. 놓인 조각을 누르면 다시 위로 돌아가요.<br>다윗의 계보 — 베레스에서 다윗까지(룻기 4장 끝).</p>';
      var pool = document.createElement('div'); pool.className = 'gen-row'; var slots = document.createElement('div'); slots.className = 'gen-row gen-slots';
      var ans = document.createElement('div'); ans.className = 'answer'; ans.innerHTML = '<input id="genAns" inputmode="numeric" placeholder="조각을 다 놓으면 보이는 숫자"><button class="btn gold" id="genOk">확인</button>';
      wrap.appendChild(pool); wrap.appendChild(slots); wrap.appendChild(ans);
      function draw() {
        pool.innerHTML = ''; slots.innerHTML = '';
        order.forEach(function (i) { if (placed.indexOf(i) >= 0) { var e = document.createElement('div'); e.className = 'gcard slot'; pool.appendChild(e); return; } var c = card(i, sel === i ? 'sel' : ''); c.onclick = function () { sel = sel === i ? null : i; draw(); }; pool.appendChild(c); });
        placed.forEach(function (i, p) {
          var c = i === null ? (function () { var e = document.createElement('div'); e.className = 'gcard slot'; e.textContent = p + 1; return e; })() : card(i);
          c.onclick = function () { if (i !== null) { placed[p] = null; } else if (sel !== null) { placed[p] = sel; sel = null; } draw(); };
          slots.appendChild(c);
        });
        if (placed.every(function (v, p) { return v === p; })) { slots.classList.add('gen-glow'); sfx('ok'); }
      }
      draw();
      modal('명부 조각 맞추기', wrap);
      $('genOk').onclick = function () {
        var v = $('genAns').value.replace(/\D/g, '');
        if (v === '14') { closeModal(); sfx('ok'); solve(R); }
        else { sfx('no'); toast(placed.every(function (x, p) { return x === p; }) ? '조각의 선을 따라 숫자를 읽어 보세요' : '아직 숫자가 이어지지 않았어요 — 순서를 다시 봐요'); }
      };
    }
  };
  BN.HINTS = BN.HINTS || {};
  BN.HINTS_V1 = {
    gate: ['명부 조각의 이름은 룻기 4장 18~22절에 그대로 나와요. 아삽 노인에게 말을 걸어 봐요.', '베레스 → 헤스론 → 람 → 암미나답 → 나손 → 살몬 → … 다윗', '순서: 베레스·헤스론·람·암미나답·나손·살몬·보아스·오벳·이새·다윗 — 이어진 선이 그리는 숫자는 14']
  };


  // ── 1장 나머지 퍼즐 ───────────────────────────────────────────
  function whenImg(box, fn) { var im = box.querySelector('img'); function go() { requestAnimationFrame(function () { fn(); }); } if (im.complete && im.naturalWidth) go(); else im.onload = go; }
  function has(k) { return S.items.indexOf(k) >= 0; }
  function seedRnd(n) { var s = (S.created % 9973) + 7 * n + 1; return function () { s = (s * 16807) % 2147483647; return s / 2147483647; }; }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  var ARW = ['↑', '→', '↓', '←'];

  // 2 길: 낮 지도와 밤하늘을 겹치면 별 네 개가 갈림길 넷 위에 앉는다 → 큰 별부터 그 갈림길의 화살표 = 방향 자물쇠
  PUZZLES.roadmap = function (R) {
    var r = seedRnd(2), J = [[120, 70], [250, 60], [420, 90], [90, 190], [300, 170], [470, 210], [170, 300], [360, 290], [520, 330]];
    var arrows = J.map(function () { return Math.floor(r() * 4); });
    var pick = [2, 6, 4, 8].map(function (v, i) { return (v + Math.floor(r() * 2) * (i % 2 ? 0 : 1)) % 9; });
    pick = pick.filter(function (v, i) { return pick.indexOf(v) === i; }); while (pick.length < 4) { var c = Math.floor(r() * 9); if (pick.indexOf(c) < 0) pick.push(c); }
    var answer = pick.map(function (j) { return arrows[j]; }), sizes = [16, 12, 9, 6];
    var roads = 'M300 20 C260 50 150 50 120 70 M120 70 L250 60 L420 90 M120 70 L90 190 L300 170 L470 210 M250 60 L300 170 M420 90 L470 210 M90 190 L170 300 L360 290 L520 330 M300 170 L360 290 M470 210 L520 330 M360 290 C380 340 330 360 300 385';
    var day = '<g class="day"><path d="' + roads + '" stroke="#8a6a3a" stroke-width="7" fill="none" stroke-dasharray="2 10" stroke-linecap="round"/>' +
      '<path d="M30 140 Q120 120 160 150 T300 130" stroke="#7aa3c0" stroke-width="5" fill="none" opacity=".7"/><path d="M380 30 l25 -18 l25 18 z M520 100 l20 -15 l20 15 z M40 330 l22 -16 l22 16 z" fill="#a08660" opacity=".6"/>' +
      J.map(function (p, i) { return '<g transform="translate(' + p[0] + ',' + p[1] + ')"><circle r="15" fill="#f3e4bf" stroke="#7a5a2a" stroke-width="2"/><text y="6" text-anchor="middle" font-size="18" fill="#5a3a14" font-weight="700">' + ARW[arrows[i]] + '</text></g>'; }).join('') +
      '<text x="300" y="16" text-anchor="middle" font-size="13" fill="#5a3a14">나사렛</text><text x="300" y="398" text-anchor="middle" font-size="13" fill="#5a3a14">베들레헴</text></g>';
    var night = '<g class="night"><rect width="600" height="400" fill="#0d1530"/>' + Array.from({ length: 60 }, function () { return '<circle cx="' + Math.floor(r() * 600) + '" cy="' + Math.floor(r() * 400) + '" r="' + (r() * 1.6 + .4).toFixed(1) + '" fill="#fff" opacity="' + (r() * .6 + .2).toFixed(2) + '"/>'; }).join('') +
      pick.map(function (j, k) { var p = J[j], s = sizes[k]; return '<path transform="translate(' + p[0] + ',' + p[1] + ')" d="M0 -' + s + ' L' + s * .28 + ' -' + s * .28 + ' L' + s + ' 0 L' + s * .28 + ' ' + s * .28 + ' L0 ' + s + ' L-' + s * .28 + ' ' + s * .28 + ' L-' + s + ' 0 L-' + s * .28 + ' -' + s * .28 + ' Z" fill="#ffe9a8" filter="url(#glow)"/>'; }).join('') + '</g>';
    var w = el('div', 'gen-wrap');
    w.innerHTML = '<p class="gen-help howto">한 장은 낮의 길, 한 장은 밤의 하늘. 아래 막대를 밀어 두 장을 겹쳐 보세요.</p>' +
      '<svg viewBox="0 0 600 400" style="width:100%;border-radius:10px;background:linear-gradient(#efe0bb,#d8c095)"><defs><filter id="glow"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>' + day + '<g id="nightL" style="opacity:0">' + night + '</g></svg>' +
      '<input type="range" id="rmMix" min="0" max="100" value="0" style="width:100%"><div style="display:flex;justify-content:space-between;font-size:12px;color:var(--stone)"><span>☀ 낮의 길</span><span>밤의 하늘 ☾</span></div>' +
      '<div style="display:flex;gap:8px;justify-content:center;margin-top:6px" id="rmLock"></div><button class="btn gold block" id="rmOk" style="margin-top:8px">자물쇠 열기</button>';
    modal('여행 지도 겹쳐 보기', w);
    $('rmMix').oninput = function () { var v = this.value / 100; $('nightL').style.opacity = Math.min(1, v * 1.1) * (v > .85 ? 1 : .62); };
    var lock = [0, 0, 0, 0];
    lock.forEach(function (_, i) { var b = el('button', 'btn ghost', ARW[0]); b.style.cssText = 'font-size:26px;width:58px;height:58px;padding:0'; b.onclick = function () { lock[i] = (lock[i] + 1) % 4; b.textContent = ARW[lock[i]]; }; $('rmLock').appendChild(b); });
    $('rmOk').onclick = function () { if (lock.every(function (v, i) { return v === answer[i]; })) { closeModal(); sfx('ok'); solve(R); } else { sfx('no'); toast('찰칵… 열리지 않아요. 큰 별부터 순서대로!'); } };
  };

  // 3 우물: 등잔으로 어둠을 문질러 벽 글씨 찾기 → 두레박 줄을 7 규빗에
  PUZZLES.well = function (R) {
    if (!BN.used('wellin', 'lamp')) return talk([['gilead', 1, '너무 깜깜해서 아무것도 안 보여요. 비출 게 있으면 우물 안으로 내려 볼 텐데…'], ['narr', null, '(가방에서 물건을 골라 「손에 들기」 한 뒤 우물을 누르면 쓸 수 있다)']]);
    // 11/27: 수정 조각을 직접 끌어 글씨 위에 대고, 「가까이 ↔ 멀리」로 초점을 맞춰야 읽힌다(초점 자리는 사람마다 다름)
    var rr = seedRnd(31), FOC = 22 + Math.floor(rr() * 56), M = 2.3, TX = 40, TY = 63, glass = has('lens');
    var TXT = '<div class="wl-t" style="position:absolute;left:' + TX + '%;top:' + TY + '%;transform:translate(-50%,-50%) rotate(-4deg);font-family:var(--serif);color:#f3d79a;white-space:nowrap">줄은 열넷의 반 규빗</div>';
    var w = el('div', 'gen-wrap');
    w.innerHTML = '<div style="position:relative;border-radius:12px;overflow:hidden;touch-action:none" id="wlBox"><img src="img/places/well.webp" style="width:100%;display:block;filter:brightness(.55)"><div id="wlBase">' + TXT + '</div>' +
      '<canvas id="wlDark" style="position:absolute;inset:0;width:100%;height:100%"></canvas>' +
      (glass ? '<div id="wlGlass" class="wl-glass"><div id="wlIn" class="wl-in"><div class="wl-blur"><img src="img/places/well.webp" style="width:100%;display:block;filter:brightness(.62)">' + TXT + '</div><canvas id="wlInDark" style="position:absolute;inset:0;width:100%;height:100%"></canvas></div></div><div id="wlRim" class="wl-rim"></div>' : '') + '</div>' +
      (glass ? '<div class="wl-foc"><span>가까이</span><input type="range" id="wlFoc" min="0" max="100" value="' + (FOC > 50 ? 4 : 96) + '"><span>멀리</span></div><p class="gen-help" style="margin:2px 0 0;text-align:center">💎 수정 조각을 손가락으로 끌어 벽에 대 보세요</p>' : '') +
      '<div id="wlRope" style="margin-top:6px">' + (BN.used('wellin', 'bucket') ? '<input type="range" id="wlLen" min="1" max="14" value="1" style="width:100%"><p style="text-align:center;font-size:20px;margin:4px 0"><b id="wlV">1</b> 규빗</p><button class="btn gold block" id="wlUp">끌어올리기</button>' : '<p class="gen-help">물을 길을 두레박이 걸려 있지 않다. 줄 맨 두레박을 우물에 걸어야 한다.</p>') + '</div>';
    modal('우물 안', w);
    var cv = $('wlDark'), box = $('wlBox');
    var base = w.querySelector('#wlBase .wl-t'); base.style.fontSize = '7px'; base.style.filter = 'blur(1.2px)';
    whenImg(box, function () {
      var BW = box.clientWidth, BH = box.clientHeight, L = Math.round(BW * .5), gx = BW * .78, gy = BH * .78;
      cv.width = BW; cv.height = BH; var ctx = cv.getContext('2d'); ctx.fillStyle = 'rgba(4,6,14,.97)'; ctx.fillRect(0, 0, BW, BH);
      var ID = $('wlInDark'), ictx = ID && ID.getContext('2d'); if (ID) { ID.width = BW; ID.height = BH; }
      function mirror() { if (ictx) { ictx.clearRect(0, 0, BW, BH); ictx.drawImage(cv, 0, 0); } }
      function light(x, y) { ctx.globalCompositeOperation = 'destination-out'; var gr = ctx.createRadialGradient(x, y, 4, x, y, 42); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, 42, 0, 7); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; mirror(); }
      var G = $('wlGlass'), IN = $('wlIn'), RIM = $('wlRim'), FC = $('wlFoc');
      function placeGlass() {
        if (!G) return;
        gx = Math.max(0, Math.min(BW, gx)); gy = Math.max(0, Math.min(BH, gy));
        [G, RIM].forEach(function (e) { e.style.width = e.style.height = L + 'px'; e.style.left = (gx - L / 2) + 'px'; e.style.top = (gy - L / 2) + 'px'; });
        IN.style.width = (BW * M) + 'px'; IN.style.height = (BH * M) + 'px'; IN.style.left = (L / 2 - gx * M) + 'px'; IN.style.top = (L / 2 - gy * M) + 'px';
        IN.querySelector('.wl-t').style.fontSize = (7 * M) + 'px';
        var d = Math.abs(+FC.value - FOC); IN.querySelector('.wl-blur').style.filter = 'blur(' + (d <= 3 ? 0 : Math.min(7, (d - 3) / 4 + .8)).toFixed(1) + 'px)';
      }
      if (FC) FC.addEventListener('input', placeGlass);
      placeGlass(); mirror();
      var drag = null;
      function xy(e) { var b = cv.getBoundingClientRect(); return { x: (e.clientX - b.left) * BW / b.width, y: (e.clientY - b.top) * BH / b.height }; }
      cv.addEventListener('pointerdown', function (e) { var q = xy(e); try { cv.setPointerCapture(e.pointerId); } catch (er) {} if (G && Math.hypot(q.x - gx, q.y - gy) < L / 2) drag = { x: q.x, y: q.y, gx: gx, gy: gy }; else { drag = null; light(q.x, q.y); } });
      cv.addEventListener('pointermove', function (e) { var q = xy(e); if (drag) { gx = drag.gx + q.x - drag.x; gy = drag.gy + q.y - drag.y; placeGlass(); } else if (e.buttons || e.pointerType === 'touch') light(q.x, q.y); });
      cv.addEventListener('pointerup', function () { drag = null; });
      if (/^(127\.0\.0\.1|localhost)$/.test(location.hostname)) BN.__well = { focus: FOC, read: function () { light(BW * TX / 100, BH * TY / 100); gx = BW * TX / 100; gy = BH * TY / 100; FC.value = FOC; placeGlass(); } };
    });
    w.addEventListener('input', function (e) { if (e.target.id === 'wlLen') $('wlV').textContent = e.target.value; });
    w.addEventListener('click', function (e) {
      if (e.target.id !== 'wlUp') return; if (locked('well')) return; var v = +$('wlLen').value;
      if (v === 7) { closeModal(); solve(R); } else wrong('well', v < 7 ? '빈 두레박만 올라왔어요' : '줄이 바닥 진흙에 박혔어요');
    });
  };

  // 4 여관: 손님 다섯을 방 다섯에 → 「요셉과 마리아는?」 → 「있을 곳이 없다」
  PUZZLES.inn = function (R) {
    var rooms = [['🐟', '물고기', '2층'], ['⭐', '별', '2층'], ['🍇', '포도', '1층'], ['🫒', '올리브', '1층'], ['🕊', '비둘기', '1층']];
    var guests = ['갈릴리 상인', '로마 세리', '목수 형제', '나이 든 과부', '제사장 가족'], sol = [0, 1, 2, 3, 4];
    var clues = ['제사장 가족: 「정결 예물로 드리는 새가 그려진 방이면 좋겠소.」', '갈릴리 상인: 「호수 냄새 나는 방! 고향 생각이 나게.」', '나이 든 과부: 「계단은 못 올라가요. 평생 기름을 짠 열매 방이면 좋겠는데…」', '로마 세리: 「저 갈릴리 상인과 같은 층으로 주시오. 세금 이야기를 좀 해야겠소.」', '목수 형제: 「우리는 남는 방 아무거나.」'];
    var asg = [null, null, null, null, null], sel = null, stage = 1;
    var w = el('div', 'gen-wrap');
    function draw() {
      w.innerHTML = '<p class="gen-help howto">손님 쪽지를 읽고, 손님을 고른 뒤 문을 눌러 방을 정해 주세요.</p>' +
        '<div class="note" style="font-size:13px">' + clues.join('<br>') + '</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:6px" id="inG"></div><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:8px" id="inR"></div>' +
        '<button class="btn gold block" id="inOk" style="margin-top:10px">방 배정 끝</button>';
      var gbox = w.querySelector('#inG'), rbox = w.querySelector('#inR');
      guests.forEach(function (g, i) { if (asg.indexOf(i) >= 0) return; var b = el('button', 'btn ' + (sel === i ? 'gold' : 'ghost'), g); b.style.padding = '8px 10px'; b.onclick = function () { sel = sel === i ? null : i; draw(); }; gbox.appendChild(b); });
      rooms.forEach(function (rm, i) { var b = el('button', 'gcard', '<span style="font-size:26px;display:block">' + rm[0] + '</span><small>' + rm[1] + ' · ' + rm[2] + '</small><b style="display:block;font-size:12px;color:#7a2a10;min-height:16px">' + (asg[i] !== null ? guests[asg[i]] : '') + '</b>'); b.style.aspectRatio = 'auto'; b.style.padding = '6px 2px';
        b.onclick = function () { if (asg[i] !== null) { asg[i] = null; } else if (sel !== null) { asg[i] = sel; sel = null; } draw(); }; rbox.appendChild(b); });
      w.querySelector('#inOk').onclick = function () {
        if (asg.some(function (v) { return v === null; })) return toast('아직 방이 정해지지 않은 손님이 있어요');
        if (!asg.every(function (v, i) { return v === sol[i]; })) { sfx('no'); return toast('누군가 쪽지와 다른 방에 있어요'); }
        sfx('ok'); stage2();
      };
    }
    function stage2() {
      w.innerHTML = '<p class="gen-help">다섯 방이 모두 찼어요. 그런데 문 앞에 나사렛에서 온 부부가 서 있어요.<br><b>요셉과 마리아는 어느 방에 묵을 수 있을까요?</b></p><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px" id="inQ"></div>';
      var q = w.querySelector('#inQ');
      rooms.concat([['∅', '있을 곳이 없다', '']]).forEach(function (rm, i) { var b = el('button', 'btn ghost', rm[0] + ' ' + rm[1]); b.onclick = function () { if (i < 5) { sfx('no'); toast(rm[1] + ' 방에는 이미 ' + guests[sol[i]] + '이(가) 있어요'); } else { closeModal(); solve(R); } }; q.appendChild(b); });
    }
    draw(); modal('여관 · 손님 쪽지', w);
  };

  // 곁가지 · 부엌 장부
  PUZZLES.ledger = function (R) {
    var w = el('div', 'gen-wrap');
    w.innerHTML = '<div class="note" style="font-family:var(--serif);font-size:16px;line-height:1.8">오늘 손님 — 열둘<br>손님마다 빵 — 둘<br>바구니에 남은 빵 — 스물하나<br><span style="color:#9fd3ff">(빈칸) 개가 어디로 갔는가?</span></div><div class="answer"><input id="lgA" inputmode="numeric" placeholder="사라진 빵 개수"><button class="btn gold" id="lgOk">확인</button></div>';
    modal('여관 장부 판', w);
    $('lgOk').onclick = function () { if ($('lgA').value.replace(/\D/g, '') === '3') { closeModal(); solve(R); } else { sfx('no'); toast('다시 세어 봐요 — 열둘 × 둘은?'); } };
  };

  // 5 들판: 양 울음 횟수 자물쇠 → 하늘 원판을 돌려 큰 별 넷을 지팡이 눈금 넷 위에
  var bleatN = null;
  function bleatCounts() { if (!bleatN) { var r = seedRnd(5); bleatN = [0, 0, 0].map(function () { return 1 + Math.floor(r() * 5); }); } return bleatN; }
  function sheepBleat(i, spot) {
    var n = bleatCounts()[i], k = 0;
    (function one() {
      if (k >= n) return; k++;
      var rip = el('span', ''); rip.style.cssText = 'position:absolute;left:50%;top:-10px;transform:translate(-50%,-100%);font-size:22px;color:#ffe9a8;animation:rise .9s ease-out both;pointer-events:none'; rip.textContent = '〰'; spot.appendChild(rip); setTimeout(function () { rip.remove(); }, 900);
      if (soundOn) try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); var t = actx.currentTime, o = actx.createOscillator(), g = actx.createGain(), lfo = actx.createOscillator(), lg = actx.createGain(); o.type = 'sawtooth'; o.frequency.value = 520; lfo.frequency.value = 14; lg.gain.value = 40; lfo.connect(lg); lg.connect(o.frequency); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.08, t + .05); g.gain.linearRampToValueAtTime(0, t + .5); o.connect(g); g.connect(actx.destination); o.start(t); lfo.start(t); o.stop(t + .55); lfo.stop(t + .55); } catch (e) {}
      setTimeout(one, 650);
    })();
  }
  PUZZLES.field = function (R) {
    var code = bleatCounts(), w = el('div', 'gen-wrap');
    w.innerHTML = '<p class="gen-help howto">상자에 숫자 자물쇠 세 칸이 있어요. 양들이 우는 횟수를 왼쪽부터.</p><div style="display:flex;gap:10px;justify-content:center" id="fdL"></div><button class="btn gold block" id="fdOk" style="margin-top:10px">상자 열기</button>';
    modal('목자의 상자', w);
    var v = [1, 1, 1];
    v.forEach(function (_, i) { var b = el('button', 'btn ghost', '1'); b.style.cssText = 'font-size:28px;width:64px;height:64px;padding:0'; b.onclick = function () { v[i] = v[i] % 5 + 1; b.textContent = v[i]; }; $('fdL').appendChild(b); });
    $('fdOk').onclick = function () {
      if (!v.every(function (x, i) { return x === code[i]; })) { sfx('no'); return toast('딸깍… 아직이에요. 양을 다시 눌러 세어 봐요'); }
      sfx('ok'); dial();
    };
    function dial() {
      var r = seedRnd(55), off = 40 + Math.floor(r() * 280), A = [15, 100, 170, 265];
      w.innerHTML = '<p class="gen-help howto">상자 안에서 「밤 네 경점」 지팡이가 나왔어요 — 저물 때, 밤중, 닭 울 때, 새벽(막 13:35). 지팡이 눈금 넷 위에 큰 별 넷이 동시에 서도록 하늘을 돌려 보세요.</p>' +
        '<svg viewBox="-160 -160 320 320" style="width:100%;max-height:56vh;touch-action:none" id="fdSky"><defs><filter id="g2"><feGaussianBlur stdDeviation="2"/></filter></defs>' +
        '<circle r="158" fill="#0b1230" stroke="#6b5226" stroke-width="3"/><g id="fdDisc">' +
        Array.from({ length: 90 }, function () { var a = r() * 6.283, d = 10 + r() * 125; return '<circle cx="' + (Math.cos(a) * d).toFixed(1) + '" cy="' + (Math.sin(a) * d).toFixed(1) + '" r="' + (r() * 1.2 + .3).toFixed(1) + '" fill="#fff" opacity=".7"/>'; }).join('') +
        A.map(function (a) { var x = Math.cos((a - 90) * Math.PI / 180) * 118, y = Math.sin((a - 90) * Math.PI / 180) * 118; return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="6.5" fill="#ffe9a8" filter="url(#g2)"/><circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="3.4" fill="#fff"/>'; }).join('') +
        '</g>' +
        A.map(function (a) { var ang = (a + off - 90) * Math.PI / 180, x1 = Math.cos(ang) * 132, y1 = Math.sin(ang) * 132, x2 = Math.cos(ang) * 156, y2 = Math.sin(ang) * 156; return '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="#e8b75a" stroke-width="5" stroke-linecap="round"/>'; }).join('') +
        '<text x="0" y="6" text-anchor="middle" font-size="11" fill="#c8b48a">← 하늘을 끌어 돌려요 →</text></svg>';
      // 눈금이 지평선 아래로 숨으면 정답 각을 다시 고른다(모든 눈금이 하늘에 보이게)
      var rot = 0, start = null, svg = $('fdSky'), disc = $('fdDisc'), solved = false;
      svg.addEventListener('pointerdown', function (e) { start = { x: e.clientX, rot: rot }; svg.setPointerCapture(e.pointerId); });
      svg.addEventListener('pointermove', function (e) {
        if (!start || solved) return; rot = (start.rot + (e.clientX - start.x) * .6) % 360; if (rot < 0) rot += 360; disc.setAttribute('transform', 'rotate(' + rot + ')');
        var d = Math.abs(((rot - off) % 360 + 540) % 360 - 180);
        if (d < 5) { solved = true; disc.setAttribute('transform', 'rotate(' + off + ')'); sfx('ok'); setTimeout(function () { closeModal(); solve(R); }, 900); }
      });
      svg.addEventListener('pointerup', function () { start = null; });
    }
  };

  // 6 천사: 눅 2:14 조각 7개를 순서대로 연주
  PUZZLES.song = function (R) {
    var parts = ['지극히 높은 곳에서는', '하나님께', '영광이요', '땅에서는', '하나님이 기뻐하신', '사람들 중에', '평화로다'], notes = [392, 440, 494, 587, 523, 494, 392];
    var r = seedRnd(6), order = parts.map(function (_, i) { return i; }).sort(function () { return r() - .5; }), got = 0;
    var w = el('div', 'gen-wrap');
    w.innerHTML = '<p class="gen-help">천군이 부른 노래가 조각조각 흩어졌어요. 건반을 노래 순서대로 눌러 보세요.</p><div class="note" id="sgLine" style="font-family:var(--serif);font-size:17px;min-height:2.6em"></div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px" id="sgK"></div>';
    modal('천군의 노래', w);
    function tone(f, ok) { if (!soundOn) return; try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); var t = actx.currentTime;[1, 2].forEach(function (h) { var o = actx.createOscillator(), g = actx.createGain(); o.type = 'sine'; o.frequency.value = f * h; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime((ok ? .18 : .08) / h, t + .02); g.gain.exponentialRampToValueAtTime(.001, t + (ok ? 1.2 : .3)); o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + 1.3); }); } catch (e) {} }
    order.forEach(function (i) {
      var b = el('button', 'gcard', parts[i]); b.style.aspectRatio = '3/2';
      b.onclick = function () {
        if (i === got) { tone(notes[i], true); got++; b.style.opacity = '.35'; b.disabled = true; $('sgLine').textContent = parts.slice(0, got).join(' ');
          if (got === parts.length) setTimeout(function () { closeModal(); solve(R); }, 1300); }
        else { tone(196, false); toast('음이 어긋났어요 — 처음부터 다시'); got = 0; $('sgLine').textContent = ''; w.querySelectorAll('#sgK .gcard').forEach(function (x) { x.style.opacity = ''; x.disabled = false; }); }
      };
      $('sgK').appendChild(b);
    });
  };

  // 7 마구간: 어둠 속 등잔 빛으로 표적 셋(강보·구유·아기), 함정(금 그릇·반지)
  PUZZLES.manger = function (R) {
    if (!has('lamp')) return talk([['gilead', 1, '아무것도 안 보여요…'], ['asaph', 0, '등잔이 있어야 한다.']]);
    var w = el('div', 'gen-wrap');
    w.innerHTML = '<p class="gen-help howto">화면을 문질러 등잔으로 비추고, 표적을 찾으면 눌러요. (<span id="mgN">0</span>/3)</p><div style="position:relative;border-radius:12px;overflow:hidden;touch-action:none" id="mgBox"><img src="img/places/stable.webp" style="width:100%;display:block"><div id="mgItems"></div><canvas id="mgDark" style="position:absolute;inset:0;width:100%;height:100%;z-index:5"></canvas></div>';
    modal('바위 굴 안', w);
    var items = [
      { k: 'cloth', img: 'img/items/cloth.webp', x: 30, y: 74, w: 11, ok: true, name: '강보' },
      { k: 'manger', img: null, x: 49, y: 60, w: 26, ok: true, name: '구유' },
      { k: 'gold', img: 'img/items/gold_bowl.webp', x: 80, y: 70, w: 9, ok: false, name: '금 그릇' },
      { k: 'ring', img: 'img/items/ring.webp', x: 14, y: 52, w: 6, ok: false, name: '반지' }
    ], found = {}, box = $('mgItems');
    items.forEach(function (it) {
      var b = el('button', ''); b.style.cssText = 'position:absolute;left:' + it.x + '%;top:' + it.y + '%;width:' + it.w + '%;aspect-ratio:1;transform:translate(-50%,-50%);border:0;background:none;padding:0;z-index:1';
      if (it.img) b.innerHTML = '<img src="' + it.img + '" style="width:100%;filter:brightness(.8)">';
      b.onclick = function () { if (!it.ok) { sfx('trap'); toast('「' + it.name + '」은 표적이 아니에요 — 왕이 오신 곳에 금이 있을 거라 생각했나요?'); return; } if (found[it.k]) return; found[it.k] = 1; sfx('ok'); toast('표적 「' + it.name + '」'); upd(); };
      box.appendChild(b);
    });
    function upd() {
      var n = Object.keys(found).length; $('mgN').textContent = n;
      if (n === 2 && !found.baby) {
        var m = el('button', ''); m.style.cssText = 'position:absolute;left:66%;top:100%;height:78%;transform:translate(-50%,-100%);border:0;background:none;padding:0;z-index:1;opacity:0;transition:opacity 1.6s'; m.innerHTML = '<img src="img/chars/mary_front.webp" style="height:100%;filter:drop-shadow(0 0 24px rgba(255,210,130,.8))">';
        var j = el('div', ''); j.style.cssText = 'position:absolute;left:82%;top:100%;height:86%;transform:translate(-50%,-100%);z-index:2;opacity:0;transition:opacity 1.6s;pointer-events:none'; j.innerHTML = '<img src="img/chars/joseph_front.webp" style="height:100%">';
        box.appendChild(j); box.appendChild(m); var ctx2 = $('mgDark').getContext('2d'); ctx2.globalCompositeOperation = 'destination-out'; var cv = $('mgDark'); var g = ctx2.createRadialGradient(cv.width * .7, cv.height * .6, 10, cv.width * .7, cv.height * .6, cv.width * .35); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx2.fillStyle = g; ctx2.fillRect(0, 0, cv.width, cv.height); ctx2.globalCompositeOperation = 'source-over';
        setTimeout(function () { m.style.opacity = 1; j.style.opacity = 1; }, 100); toast('어둠 한쪽이 따뜻하게 밝아져요…');
        m.onclick = function () { found.baby = 1; sfx('ok'); $('mgN').textContent = 3; setTimeout(function () { closeModal(); solve(R); }, 900); };
      }
    }
    whenImg($('mgBox'), function () {
      var cv = $('mgDark'), bx = $('mgBox'); cv.width = bx.clientWidth; cv.height = bx.clientHeight; var ctx = cv.getContext('2d'); ctx.fillStyle = 'rgba(3,4,10,.96)'; ctx.fillRect(0, 0, cv.width, cv.height);
      function light(e) { var b = cv.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top; ctx.globalCompositeOperation = 'destination-out'; var gr = ctx.createRadialGradient(x, y, 6, x, y, 58); gr.addColorStop(0, 'rgba(0,0,0,.9)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, 58, 0, 7); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; }
      cv.addEventListener('pointermove', function (e) { if (e.buttons || e.pointerType === 'touch') light(e); });
      cv.addEventListener('pointerdown', function (e) { light(e); });
      // 빛이 닿은 곳은 아래 물건을 누를 수 있게: 캔버스는 문지르기만, 누르기는 물건으로 넘김
      cv.addEventListener('click', function (e) { cv.style.pointerEvents = 'none'; var t = document.elementFromPoint(e.clientX, e.clientY); cv.style.pointerEvents = ''; var px = ctx.getImageData(Math.floor(e.clientX - cv.getBoundingClientRect().left), Math.floor(e.clientY - cv.getBoundingClientRect().top), 1, 1).data[3]; if (px < 120 && t && t !== cv) t.click(); else if (px >= 120) toast('어두워서 안 보여요 — 먼저 비춰 보세요'); });
    });
  };

  // 장 끝: 장 완료 음악 + 카드
  function chapterEnd(n) {
    sfx('chapter'); music('bgm01_main');
    S.chDone = S.chDone || {}; S.chDone[n] = S.ms; save();
    var CH = (BN.CHAPTERS || {})[n] || { title: '그 밤' }, E = (BN.CH_END || {})[n] || { body: '왕은 가장 낮은 곳, 구유에 오셨습니다.<br>그런데 명부의 이름 칸은 아직 비어 있습니다.', next: '2장 「여드레째 · 사십일째」로 이어집니다' };
    var w = el('div', 'gen-wrap');
    w.innerHTML = '<div style="text-align:center;padding:10px 0"><p class="eyebrow">✦ ' + n + '장 완료</p><h2 style="font-family:var(--serif);font-size:30px;margin:4px 0;color:var(--gold2)">' + CH.title + '</h2><p style="color:var(--stone);line-height:1.7">' + E.body + '</p><p style="margin-top:14px;font-size:13px">기록 <b>' + $('hudTime').textContent + '</b> · 도장 <b>' + $('hudStamp').textContent + '</b>/12 · 숨은 별 <b>' + S.stars.length + '</b>/7</p><p style="margin-top:10px;font-family:var(--serif);color:var(--gold)">' + E.next + '</p></div>';
    modal(n + '장 「' + CH.title + '」', w, function () { if (TRY) return tryEnd(); if (E.ending) ending(); else nextChapter(n + 1); });
  }
  function tryEnd() {
    var w = el('div', 'gen-wrap');
    w.innerHTML = '<div style="text-align:center;padding:10px 0"><p class="eyebrow">✦ 1장 시험판</p><h2 style="font-family:var(--serif);font-size:26px;margin:4px 0;color:var(--gold2)">시험판은 여기까지예요</h2><p style="color:var(--stone);line-height:1.7">해 보면서 막히거나 어색했던 곳이 있으면 알려 주세요.<br>정식판은 <b>12월 6일</b>에 다섯 장 모두 열려요.<br>(시험판 기록은 이 기기에만 있고, 정식판과 따로예요)</p></div>';
    modal('베들레헴의 밤 · 시험판', w, function () { show('title'); music('bgm01_main'); });
  }
  function ending() {
    S.finished = S.finished || S.ms; save(); if (BN.netFlush) BN.netFlush();
    var slides = (BN.ENDING || []).slice(); if (S.stars.length >= 7 && BN.HIDDEN_ENDING) slides.splice(1, 0, BN.HIDDEN_ENDING[0], BN.HIDDEN_ENDING[1]);
    playOpening(function () {
      enterRoom('wellgate');
      if ((S.bread || []).length >= 12 && BN.COOKIE) { music('bgm21_cookie'); return talk(BN.COOKIE, finalCard); }
      finalCard();
    }, slides);
  }
  function myBadges() { return (BN.BADGES || []).filter(function (b) { try { return b[3](S); } catch (e) { return false; } }); }
  function finalCard() {
    {
      var w = el('div', 'gen-wrap');
      w.innerHTML = '<div style="text-align:center;padding:10px 0"><p class="eyebrow">✦ 완주</p><h2 style="font-family:var(--serif);font-size:32px;margin:4px 0;color:var(--gold2)">베들레헴의 밤</h2><p style="font-family:var(--serif);color:var(--gold);line-height:1.8">「하나님이 우리와 함께 계시다」<br><span style="font-size:12px;color:var(--stone)">마태복음 1:23</span></p><p style="margin-top:14px;font-size:14px">' + S.nick + ' · 기록 <b>' + $('hudTime').textContent + '</b> · 도장 <b>' + $('hudStamp').textContent + '</b>/12 · 숨은 별 <b>' + S.stars.length + '</b>/7</p><p class="gen-help" style="margin-top:10px">끝까지 함께해 주셔서 고맙습니다. 메리 크리스마스!</p></div>';
      var bd = myBadges(); if (bd.length) { var bx = el('div', 'badges', '<p class="eyebrow" style="text-align:center">받은 배지 ' + bd.length + '/' + BN.BADGES.length + '</p>' + bd.map(function (b) { return '<span class="badge" title="' + b[2] + '">' + b[0] + ' ' + b[1] + '</span>'; }).join('')); w.appendChild(bx); }
      var sv = el('button', 'btn gold block', '📷 결과 이미지 저장(인스타용)'); sv.style.marginTop = '10px'; sv.onclick = resultImage; w.appendChild(sv);
      modal('베들레헴의 밤 · 완주', w);
    }
  }
  // 인스타용 결과 이미지(1080×1080): 닉네임·기록·도장·숨은 별·완주 날짜
  function resultImage() {
    var c = document.createElement('canvas'); c.width = 1080; c.height = 1080; var g = c.getContext('2d'), im = new Image();
    im.onload = function () {
      var s = Math.max(1080 / im.width, 1080 / im.height); g.drawImage(im, (1080 - im.width * s) / 2, (1080 - im.height * s) / 2, im.width * s, im.height * s);
      var gr = g.createLinearGradient(0, 0, 0, 1080); gr.addColorStop(0, 'rgba(5,8,20,.55)'); gr.addColorStop(.5, 'rgba(5,8,20,.35)'); gr.addColorStop(1, 'rgba(5,8,20,.9)'); g.fillStyle = gr; g.fillRect(0, 0, 1080, 1080);
      g.textAlign = 'center'; g.fillStyle = '#e8b75a'; g.font = '700 34px "Gowun Batang", serif'; g.fillText('말씀우물 성탄 방탈출', 540, 120);
      var t = g.createLinearGradient(0, 160, 0, 260); t.addColorStop(0, '#fff6dc'); t.addColorStop(1, '#e8b75a'); g.fillStyle = t; g.font = '700 104px "Gowun Batang", serif'; g.fillText('베들레헴의 밤', 540, 250);
      g.fillStyle = '#fff3d6'; g.font = '700 30px "Gowun Batang", serif'; g.fillText('✦ 완주 ✦', 540, 320);
      g.fillStyle = '#ffffff'; g.font = '700 64px "Pretendard Variable", Pretendard, sans-serif'; g.fillText(S.nick, 540, 640);
      g.font = '40px "Pretendard Variable", Pretendard, sans-serif'; g.fillStyle = '#ffe2a0'; var tm = Math.floor(S.ms / 60000) + S.hintMin, rec = (tm >= 60 ? Math.floor(tm / 60) + '시간 ' : '') + (tm % 60) + '분'; g.fillText('기록 ' + rec + '  ·  도장 12/12  ·  숨은 별 ' + S.stars.length + '/7', 540, 720);
      var bd = myBadges(); if (bd.length) { g.font = '34px sans-serif'; g.fillStyle = '#ffe2a0'; g.fillText(bd.map(function (b) { return b[0]; }).join('  '), 540, 785); }
      g.fillStyle = '#f3e6c8'; g.font = '700 42px "Gowun Batang", serif'; g.fillText('「하나님이 우리와 함께 계시다」', 540, 860);
      g.font = '28px "Gowun Batang", serif'; g.fillStyle = '#c9b48a'; g.fillText('마태복음 1:23', 540, 905);
      var d = new Date(); g.font = '26px "Pretendard Variable", Pretendard, sans-serif'; g.fillStyle = '#b9a88c'; g.fillText(d.getFullYear() + '. ' + (d.getMonth() + 1) + '. ' + d.getDate() + ' · logoswell.kr', 540, 1010);
      c.toBlob(function (b) {
        var f = null; try { f = new File([b], 'bethlehem-night.png', { type: 'image/png' }); } catch (e) {}
        if (f && navigator.canShare && navigator.canShare({ files: [f] })) return navigator.share({ files: [f], title: '베들레헴의 밤 완주' }).catch(function () {});
        var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'bethlehem-night.png'; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      }, 'image/png');
    };
    im.src = 'img/cuts/p9.webp';
  }
  function nextChapter(m) {
    var C = (BN.CHAPTERS || {})[m];
    if (!C) { toast(m + '장은 준비 중이에요 — 곧 열려요'); return enterMap(); }
    S.ch = m; save();
    var card = el('div', 'ch-card', '<p class="eyebrow">✦ ' + m + '장</p><h2>' + C.title + '</h2>'); document.body.appendChild(card);
    sfx('chapter'); setTimeout(function () { card.classList.add('out'); }, 2200); setTimeout(function () { card.remove(); if (C.start && !S.rooms[C.start]) enterRoom(C.start); else enterMap(); }, 2900);
  }



  // ── 난이도 v2: 잠금(세 번 틀리면 30초), 등잔 기름 힌트, 넘나드는 물건 ───────────
  function ripple(e) { var r = el('span', 'tapfx'); r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px'; document.body.appendChild(r); setTimeout(function () { r.remove(); }, 600); }
  var LOCK = {};
  function locked(k) { var t = LOCK[k]; if (t && t.until > Date.now()) { toast('자물쇠가 잠시 굳었어요 — ' + Math.ceil((t.until - Date.now()) / 1000) + '초 뒤에 다시'); return true; } return false; }
  function wrong(k, msg) { S.wrongs = (S.wrongs || 0) + 1; S.wrongBy = S.wrongBy || {}; S.wrongBy[k] = (S.wrongBy[k] || 0) + 1; var t = LOCK[k] = LOCK[k] || { n: 0, until: 0 }; t.n++; sfx('no'); if (t.n >= 3) { t.n = 0; t.until = Date.now() + 30000; toast('세 번 틀려서 30초 동안 잠겨요'); } else toast(msg || '아니에요'); }
  function oilInit() { S.oil = S.oil || {}; if (S.oil[S.ch] === undefined) S.oil[S.ch] = (BN.OIL || {})[S.ch] || 6; }
  function hintOil() {
    if (!cur || !$('room').classList.contains('on')) return toast('장소 안에서 힌트를 볼 수 있어요');
    var H2 = BN.HINTS[cur]; if (!H2) return toast('이 장소의 힌트는 준비 중이에요');
    oilInit(); S.hints = S.hints || {};
    var used = S.hints[cur] || 0, drops = [1, 1, 2], mins = [5, 10, 20], names = ['어디를 볼까', '어떻게 풀까', '정답'];
    var html = '<p style="margin:0 0 10px">등잔 기름 <b style="color:var(--gold2);font-size:18px">' + '💧'.repeat(Math.max(0, S.oil[S.ch])) + '</b> ' + S.oil[S.ch] + '방울 <span style="opacity:.6">(' + S.ch + '장)</span></p>';
    var HW = (BN.HOW || {})[cur]; if (HW) html = '<div class="note how-free"><b>❔ 하는 법</b> <small>(기름·시간 안 듦)</small><br>' + HW + '</div>' + html;
    html += H2.slice(0, used).map(function (h, i) { if (typeof h === 'function') h = h(S); return '<div class="note"><b>' + (i + 1) + '단계 · ' + names[i] + '</b><br>' + h + '</div>'; }).join('');
    if (used < H2.length) {
      var can = S.oil[S.ch] >= drops[used];
      html += can ? '<button class="btn gold block hint-buy" id="hintMore"><b>' + (used + 1) + '단계 「' + names[used] + '」 보기</b><small>기름 ' + drops[used] + '방울 · 기록 +' + mins[used] + '분</small></button>'
        : '<p class="gen-help">기름이 모자라요.</p><button class="btn ghost block" id="hintBeg">아삽 노인에게 매달리기 — +30분</button>';
    } else html += '<p class="gen-help">이 장소의 힌트를 모두 봤어요.</p>';
    modal('힌트 · 등잔 기름', html);
    var hb = $('hintMore'); if (hb) hb.onclick = function () { S.oil[S.ch] -= drops[used]; S.hints[cur] = used + 1; S.hintMin += mins[used]; save(); closeModal(); hintOil(); };
    var hg = $('hintBeg'); if (hg) hg.onclick = function () { S.hints[cur] = used + 1; S.hintMin += 30; save(); closeModal(); talk([['asaph', 0, '…한 번만이다.']], hintOil); };
  }

  // 1 계보 v2: 찾은 조각 + 함정 이름 셋. 제자리에 놓인 카드는 금빛(전도사님 결정)
  PUZZLES.genealogy = function (R) {
    var names = BN.GENEALOGY, decoys = ['엘리멜렉', '말론', '기룐'], hidden = ['보아스', '오벳', '이새'];
    var have = names.filter(function (n) { return hidden.indexOf(n) < 0 || (S.cards || []).indexOf(n) >= 0; }).concat(decoys);
    var r = seedRnd(1), pool = have.slice().sort(function () { return r() - .5; }), placed = new Array(10).fill(null), sel = null;
    // 11/27: 빈칸은 늘 다섯 장씩 두 줄. 금빛 줄이 열 장 모두에 걸친 큰 「14」 한 그림이 된다(왼쪽 두 줄 = 1, 오른쪽 세 줄 = 4) — 성경을 안 펴도 그림으로 얼추 맞출 수 있다
    var PATH = 'M30 78 L120 18 L120 246 M40 246 L480 246 M490 18 L428 18 L222 168 L486 168 M372 60 L372 246';
    var DECOYS = ['M10 96 L90 60 M30 30 L70 30', 'M50 12 L50 120 M20 70 L80 70', 'M10 124 L90 94 M10 50 L90 22'];
    function card(nm, cls) {
      var i = names.indexOf(nm), d = el('div', 'gcard ' + (cls || ''));
      d.innerHTML = '<svg viewBox="' + (i >= 0 ? (i % 5) * 100 + ' ' + Math.floor(i / 5) * 133 : '0 0') + ' 100 133" preserveAspectRatio="none"><path d="' + (i >= 0 ? PATH : DECOYS[decoys.indexOf(nm)]) + '" stroke="#b8862b" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/></svg><span style="position:relative">' + nm + '</span>';
      return d;
    }
    var wrap = el('div', 'gen-wrap'), poolEl = el('div', 'gen-row'), slots = el('div', 'gen-row gen-slots'), ans = el('div', 'answer');
    ans.innerHTML = '<input id="genAns" inputmode="numeric" placeholder="숫자"><button class="btn gold" id="genOk">확인</button>';
    wrap.innerHTML = ''; wrap.appendChild(poolEl); wrap.appendChild(slots); wrap.appendChild(ans);
    function draw() {
      poolEl.innerHTML = ''; slots.innerHTML = '';
      pool.forEach(function (nm) { if (placed.indexOf(nm) >= 0) { poolEl.appendChild(el('div', 'gcard slot')); return; } var c = card(nm, sel === nm ? 'sel' : ''); c.onclick = function () { sel = sel === nm ? null : nm; draw(); }; poolEl.appendChild(c); });
      placed.forEach(function (nm, p) {
        var c = nm === null ? el('div', 'gcard slot', String(p + 1)) : card(nm, names[p] === nm ? 'right' : '');
        c.onclick = function () { if (nm !== null) placed[p] = null; else if (sel !== null) { placed[p] = sel; sel = null; } draw(); };
        slots.appendChild(c);
      });
    }
    draw(); modal('명부 조각', wrap);
    $('genOk').onclick = function () { if (locked('gate')) return; if ($('genAns').value.replace(/\D/g, '') === '14' && placed.every(function (v, p) { return v === names[p]; })) { closeModal(); sfx('ok'); solve(R); } else wrong('gate'); };
  };

  // 2 길 v2: 밤 지도를 끌어 강·산에 맞추고, 해 무늬로 동서남북을 읽는다
  PUZZLES.roadmap = function (R) {
    // 11/27 v3: 출발 → 큰 별 → 중간 별 → 작은 별 → 베들레헴, 한 걸음마다 곧은 한 방향. 밤 지도는 딱 붙지 않고 계속 움직인다(강·산을 보고 맞추기)
    var r = seedRnd(2), GX = [95, 265, 435], GY = [90, 205, 320], jit = [];
    for (var i = 0; i < 9; i++) jit.push([Math.round((r() - .5) * 44), Math.round((r() - .5) * 30)]);
    function P(n) { return [GX[n % 3] + jit[n][0], GY[Math.floor(n / 3)] + jit[n][1]]; }
    var DV = [[-1, 0], [0, 1], [1, 0], [0, -1]], nodes = null, moves = null;   // 화면 방향 0위 1오른 2아래 3왼
    for (var t = 0; t < 400 && !nodes; t++) {
      var cur = Math.floor(r() * 9), seen = [cur], mv = [], ok = true;
      for (var k = 0; k < 4 && ok; k++) {
        var opts = [];
        DV.forEach(function (d, di) { if (mv.length && mv[mv.length - 1] === di) return; for (var dist = 1; dist <= 2; dist++) { var rr = Math.floor(cur / 3) + d[0] * dist, cc = cur % 3 + d[1] * dist; if (rr < 0 || rr > 2 || cc < 0 || cc > 2) break; var n = rr * 3 + cc; if (seen.indexOf(n) >= 0) break; opts.push([di, n]); } });
        if (!opts.length) { ok = false; break; }
        var o = opts[Math.floor(r() * opts.length)]; mv.push(o[0]); cur = o[1]; seen.push(cur);
      }
      if (ok) { nodes = seen; moves = mv; }
    }
    var east = Math.floor(r() * 4), north = (east + 3) % 4, DIRS = ['북', '동', '남', '서'];
    var answer = moves.map(function (d) { return DIRS[(d - north + 4) % 4]; });
    S.roadAns = answer.join(' · '); save();   // 사람마다 다른 답 — 힌트 3단계가 보여 준다
    var ox = (90 + Math.floor(r() * 80)) * (r() < .5 ? -1 : 1), oy = (50 + Math.floor(r() * 50)) * (r() < .5 ? -1 : 1);
    var land = '<path d="M20 150 Q120 118 170 152 T320 138 T450 168 T590 140" stroke="#7aa3c0" stroke-width="5" fill="none" opacity=".75"/><path d="M380 26 l26 -18 l26 18 z M528 250 l20 -15 l20 15 z M34 352 l22 -16 l22 16 z M214 262 l18 -14 l18 14 z M540 362 l16 -12 l16 12 z" fill="#a08660" opacity=".7"/>';
    var roads = '';
    for (var n2 = 0; n2 < 9; n2++) { var a = P(n2); if (n2 % 3 < 2) { var b = P(n2 + 1); roads += 'M' + a[0] + ' ' + a[1] + ' L' + b[0] + ' ' + b[1] + ' '; } if (n2 < 6) { var c2 = P(n2 + 3); roads += 'M' + a[0] + ' ' + a[1] + ' L' + c2[0] + ' ' + c2[1] + ' '; } }
    var st = P(nodes[0]), en = P(nodes[4]);
    var day = '<g>' + land + '<path d="' + roads + '" stroke="#8a6a3a" stroke-width="7" fill="none" stroke-dasharray="2 10" stroke-linecap="round"/>' +
      [0, 1, 2, 3, 4, 5, 6, 7, 8].map(function (q) { var p = P(q); return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="11" fill="#f3e4bf" stroke="#7a5a2a" stroke-width="2"/>'; }).join('') +
      '<g transform="translate(' + st[0] + ',' + st[1] + ')"><path d="M-2 0 L-2 -34 L20 -27 L-2 -20" fill="#b3261e" stroke="#5a3a14" stroke-width="2"/><rect x="-26" y="12" width="52" height="20" rx="6" fill="#5a3a14"/><text y="27" text-anchor="middle" font-size="14" font-weight="800" fill="#ffe9c0">출발</text></g>' +
      '<g transform="translate(' + en[0] + ',' + en[1] + ')"><path d="M-14 -4 L0 -20 L14 -4 Z M-11 -4 L-11 10 L11 10 L11 -4" fill="#e9c98a" stroke="#5a3a14" stroke-width="2"/><rect x="-34" y="14" width="68" height="20" rx="6" fill="#5a3a14"/><text y="29" text-anchor="middle" font-size="14" font-weight="800" fill="#ffe9c0">베들레헴</text></g>' +
      (function () { var na = [0, 90, 180, 270][north], L = ['북', '동', '남', '서'], g = '<g transform="translate(536,64) scale(1.55)"><circle r="34" fill="rgba(243,228,191,.92)" stroke="#7a5a2a" stroke-width="2"/>';
        L.forEach(function (tx, i2) { var an = (na + i2 * 90) * Math.PI / 180, x = Math.sin(an) * 23, y = -Math.cos(an) * 23; g += '<text x="' + x.toFixed(1) + '" y="' + (y + 5).toFixed(1) + '" text-anchor="middle" font-size="' + (i2 ? 13 : 15) + '" font-weight="800" fill="' + (i2 ? '#5a3a14' : '#b3261e') + '">' + tx + '</text>'; });
        var a0 = na * Math.PI / 180; g += '<path d="M' + (Math.sin(a0) * 13).toFixed(1) + ' ' + (-Math.cos(a0) * 13).toFixed(1) + ' L' + (Math.cos(a0) * 4).toFixed(1) + ' ' + (Math.sin(a0) * 4).toFixed(1) + ' L' + (-Math.cos(a0) * 4).toFixed(1) + ' ' + (-Math.sin(a0) * 4).toFixed(1) + ' Z" fill="#b3261e"/><circle r="2.5" fill="#5a3a14"/></g>'; return g; })() + '</g>';
    var SZ = [17, 12, 8];
    var night = '<g id="ngt" transform="translate(' + ox + ',' + oy + ')"><rect x="-260" y="-220" width="1120" height="840" fill="#0d1530" opacity=".82"/>' + land.replace(/#7aa3c0/, '#9ec4ff').replace(/#a08660/, '#c9d4ff') +
      Array.from({ length: 50 }, function () { return '<circle cx="' + Math.floor(r() * 600) + '" cy="' + Math.floor(r() * 400) + '" r="' + (r() * 1.4 + .4).toFixed(1) + '" fill="#fff" opacity="' + (r() * .5 + .2).toFixed(2) + '"/>'; }).join('') +
      [1, 2, 3].map(function (k2) { var p = P(nodes[k2]), s = SZ[k2 - 1]; return '<path transform="translate(' + p[0] + ',' + p[1] + ')" d="M0 -' + s + ' L' + s * .28 + ' -' + s * .28 + ' L' + s + ' 0 L' + s * .28 + ' ' + s * .28 + ' L0 ' + s + ' L-' + s * .28 + ' ' + s * .28 + ' L-' + s + ' 0 L-' + s * .28 + ' -' + s * .28 + ' Z" fill="#ffe9a8"/>'; }).join('') + '</g>';
    function star(z) { return '<svg width="' + (z * 2 + 4) + '" height="' + (z * 2 + 4) + '" viewBox="-' + (z + 2) + ' -' + (z + 2) + ' ' + (z * 2 + 4) + ' ' + (z * 2 + 4) + '"><path d="M0 -' + z + ' L' + z * .28 + ' -' + z * .28 + ' L' + z + ' 0 L' + z * .28 + ' ' + z * .28 + ' L0 ' + z + ' L-' + z * .28 + ' ' + z * .28 + ' L-' + z + ' 0 L-' + z * .28 + ' -' + z * .28 + ' Z" fill="#ffe9a8" stroke="#b8862b"/></svg>'; }
    var STEP = ['<b>출발</b> → ' + star(10), star(10) + ' → ' + star(7), star(7) + ' → ' + star(5), star(5) + ' → <b>베들레헴</b>'];
    var w = el('div', 'gen-wrap');
    w.innerHTML = '<svg viewBox="0 0 600 400" style="width:100%;border-radius:10px;background:linear-gradient(#efe0bb,#d8c095);touch-action:none" id="rmSvg">' + day + '<g style="opacity:.62">' + night + '</g></svg>' +
      '<div class="rm-steps" id="rmLock"></div><button class="btn gold block" id="rmOk" style="margin-top:8px">상자 열기</button>';
    modal('두 장의 지도', w);
    var svg = $('rmSvg'), ng = $('ngt'), drag = null;
    function pt(e) { var b2 = svg.getBoundingClientRect(); return { x: (e.clientX - b2.left) * 600 / b2.width, y: (e.clientY - b2.top) * 400 / b2.height }; }
    svg.addEventListener('pointerdown', function (e) { var q = pt(e); drag = { x: q.x, y: q.y, ox: ox, oy: oy }; svg.setPointerCapture(e.pointerId); });
    svg.addEventListener('pointermove', function (e) { if (!drag) return; var q = pt(e); ox = Math.max(-240, Math.min(240, drag.ox + q.x - drag.x)); oy = Math.max(-200, Math.min(200, drag.oy + q.y - drag.y)); ng.setAttribute('transform', 'translate(' + ox + ',' + oy + ')'); });
    svg.addEventListener('pointerup', function () { drag = null; });
    var lock = [0, 0, 0, 0];
    lock.forEach(function (_, i3) { var b3 = el('button', 'btn ghost rm-lock', DIRS[0]); b3.onclick = function () { lock[i3] = (lock[i3] + 1) % 4; b3.textContent = DIRS[lock[i3]]; }; $('rmLock').appendChild(b3); });
    $('rmOk').onclick = function () { if (locked('road')) return; if (lock.every(function (v, i4) { return DIRS[v] === answer[i4]; })) { closeModal(); sfx('ok'); solve(R); } else wrong('road', '찰칵… 열리지 않아요'); };
    if (/^(127\.0\.0\.1|localhost)$/.test(location.hostname)) BN.__road = { answer: answer, align: function () { ox = 0; oy = 0; ng.setAttribute('transform', 'translate(0,0)'); } };
  };

  // 3 우물 v3은 위쪽(PUZZLES.well 첫 자리)에 있다 — 수정 조각 직접 대기 + 초점

  // 4 여관 v2: 손님 여섯, 방 다섯(레위인은 제사장 가족과 같은 방 가능), 구절을 찾아야 풀리는 쪽지
  PUZZLES.inn = function (R) {
    var rooms = [['🐟', '2층'], ['⭐', '2층'], ['🍇', '1층'], ['🫒', '1층'], ['🕊', '1층']];
    var guests = ['갈릴리 상인', '로마 세리', '목수 형제', '나이 든 과부', '제사장 가족', '레위인 노래꾼'];
    var sol = { 0: [0], 1: [1], 2: [2], 3: [3], 4: [4, 5] };
    var clues = ['제사장 가족(넷): 「레위기 12장 8절에 나오는 예물이 그려진 방이면 좋겠소. 우리는 넷이오.」', '갈릴리 상인: 「누가복음 5장 1~2절의 그 물가에서 그물을 다루다 왔소. 그 물에서 나는 것이 그려진 방!」', '나이 든 과부: 「계단은 못 올라가요. 시편 52편 8절처럼 살고 싶은데…」', '로마 세리: 「저 갈릴리 상인과 같은 층으로 주시오.」', '목수 형제(둘): 「마태복음 20장 1절의 품꾼처럼 일하던 곳이 생각나는 방.」', '레위인 노래꾼: 「방이 없으면 제사장님 가족과 같은 방도 괜찮습니다.」'];
    var asg = [[], [], [], [], []], sel = null, w = el('div', 'gen-wrap'), sr = seedRnd(41);
    function mix(n) { var a = []; for (var q = 0; q < n; q++) a.push(q); for (var q2 = n - 1; q2 > 0; q2--) { var t = Math.floor(sr() * (q2 + 1)), x = a[q2]; a[q2] = a[t]; a[t] = x; } return a; }
    var gOrd = mix(6), rOrd = mix(5); if (gOrd.join() === '0,1,2,3,4,5') gOrd.reverse(); if (rOrd.join() === '0,1,2,3,4') rOrd.reverse();
    function draw() {
      w.innerHTML = '<div class="note" style="font-size:13px;line-height:1.6">' + clues.join('<br>') + '</div><div style="display:flex;flex-wrap:wrap;gap:6px" id="inG"></div><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:8px" id="inR"></div><button class="btn gold block" id="inOk" style="margin-top:10px">방 배정 끝</button>';
      var placed = [].concat.apply([], asg);
      gOrd.forEach(function (i) { var g = guests[i]; if (placed.indexOf(i) >= 0) return; var b = el('button', 'btn ' + (sel === i ? 'gold' : 'ghost'), g); b.style.padding = '8px 10px'; b.onclick = function () { sel = sel === i ? null : i; draw(); }; w.querySelector('#inG').appendChild(b); });
      rOrd.forEach(function (i) { var rm = rooms[i]; var b = el('button', 'gcard', '<span style="font-size:26px;display:block">' + rm[0] + '</span><small>' + rm[1] + '</small><b style="display:block;font-size:11px;color:#7a2a10;min-height:28px;line-height:1.3">' + asg[i].map(function (x) { return guests[x]; }).join('<br>') + '</b>'); b.style.aspectRatio = 'auto'; b.style.padding = '6px 2px';
        b.onclick = function () { if (sel !== null) { if (asg[i].length >= 2) return toast('한 방에 두 손님까지만'); asg[i].push(sel); sel = null; } else if (asg[i].length) asg[i].pop(); draw(); }; w.querySelector('#inR').appendChild(b); });
      w.querySelector('#inOk').onclick = function () {
        if (locked('inn')) return;
        if ([].concat.apply([], asg).length < 6) return toast('아직 방이 정해지지 않은 손님이 있어요');
        var ok = asg.every(function (a, i) { return a.slice().sort().join() === sol[i].slice().sort().join(); });
        if (!ok) return wrong('inn', '여관 주인이 고개를 갸웃해요 — 누군가 쪽지와 맞지 않아요');
        sfx('ok'); stage2();
      };
    }
    function stage2() {
      w.innerHTML = '<p class="gen-help">문 앞에 나사렛에서 온 부부가 서 있어요. 요셉과 마리아는 어디에?</p><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px" id="inQ"></div>';
      rOrd.concat([5]).forEach(function (i) { var rm = rooms.concat([['', '있을 곳이 없다']])[i]; var b = el('button', 'btn ghost', (rm[0] || '∅') + (i < 5 ? '' : ' ' + rm[1])); b.style.fontSize = i < 5 ? '22px' : '15px'; b.onclick = function () { if (i < 5) { sfx('no'); toast('그 방은 이미 찼어요'); } else { closeModal(); solve(R); } }; w.querySelector('#inQ').appendChild(b); });
    }
    draw(); modal('손님 쪽지', w);
  };

  PUZZLES.ledger = function (R) {
    var w = el('div', 'gen-wrap');
    w.innerHTML = '<div class="note" style="font-family:var(--serif);font-size:16px;line-height:1.8">오늘 손님 — <span style="background:#6b5a3a;color:transparent;border-radius:3px">&nbsp;열&nbsp;</span> 명<br>한 사람에 빵 — 둘<br>바구니에 남은 빵 — 열일곱<br>모자란 빵 — ?</div><div class="answer"><input id="lgA" inputmode="numeric" placeholder="모자란 빵"><button class="btn gold" id="lgOk">적기</button></div>';
    modal('장부 판', w);
    $('lgOk').onclick = function () { if (locked('kitchen')) return; if ($('lgA').value.replace(/\D/g, '') === '3') { closeModal(); solve(R); } else wrong('kitchen', '주인이 고개를 젓네요'); };
  };

  // 5 들판 v2: 양 넷의 방울 무늬를 막 13:35 순서로, 울음 횟수 네 자리
  var BELLS = ['🌆', '🌑', '🐓', '🌅'];   // 저물 때, 밤중, 닭 울 때, 새벽
  var sheepInfo = null;
  function sheepData() { if (!sheepInfo) { var r = seedRnd(15), order = [0, 1, 2, 3]; for (var q = 3; q > 0; q--) { var t = Math.floor(r() * (q + 1)), x = order[q]; order[q] = order[t]; order[t] = x; } /* 어느 브라우저에서나 같은 차례(정렬 방식에 기대지 않음) */ sheepInfo = { bell: order, n: [0, 1, 2, 3].map(function () { return 1 + Math.floor(r() * 6); }) }; } return sheepInfo; }
  function sheepBell(i) { return BELLS[sheepData().bell[i]]; }
  BN.fieldCode = function () { var d = sheepData(); return [0, 1, 2, 3].map(function (b) { return d.n[d.bell.indexOf(b)]; }).join(' '); };   // 사람마다 다른 자물쇠 — 힌트 3단계용
  var bleating = {};
  function sheepBleat2(i, spot) {
    // 11/27: 한 번에 한 울음씩(겹치지 않게) 「메에~」 말풍선이 뜨고, 발밑에 ● 가 하나씩 쌓인다 — 운 횟수를 또렷하게 센다
    if (bleating[i]) return; bleating[i] = 1;
    var n = sheepData().n[i], k = 0; document.querySelectorAll('.bleat-dots').forEach(function (o) { o.remove(); });   /* 양끼리 가까워 ● 줄이 겹치지 않게, 마지막에 누른 양 것만 */
    var dots = el('span', 'bleat-dots', ''); spot.appendChild(dots);
    (function one() {
      if (k >= n) { bleating[i] = 0; setTimeout(function () { dots.classList.add('fade'); setTimeout(function () { dots.remove(); }, 700); }, 2600); return; }
      k++; dots.textContent += '●';
      var rip = el('span', 'bleat', '메에~'); spot.appendChild(rip); setTimeout(function () { rip.remove(); }, 620);
      if (soundOn) try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); var t = actx.currentTime, o = actx.createOscillator(), g2 = actx.createGain(), lfo = actx.createOscillator(), lg = actx.createGain(); o.type = 'sawtooth'; o.frequency.value = 480 + i * 40; lfo.frequency.value = 14; lg.gain.value = 40; lfo.connect(lg); lg.connect(o.frequency); g2.gain.setValueAtTime(0, t); g2.gain.linearRampToValueAtTime(.07, t + .05); g2.gain.linearRampToValueAtTime(0, t + .45); o.connect(g2); g2.connect(actx.destination); o.start(t); lfo.start(t); o.stop(t + .5); lfo.stop(t + .5); } catch (e) {}
      setTimeout(one, 780);
    })();
  }
  PUZZLES.field = function (R) {
    var d = sheepData(), code = [0, 1, 2, 3].map(function (b) { return d.n[d.bell.indexOf(b)]; }), w = el('div', 'gen-wrap');
    w.innerHTML = '<div style="display:flex;gap:8px;justify-content:center" id="fdL"></div><button class="btn gold block" id="fdOk" style="margin-top:10px">상자 열기</button>';
    modal('목자의 상자', w);
    var v = [1, 1, 1, 1];
    v.forEach(function (_, i) { var b = el('button', 'btn ghost', '1'); b.style.cssText = 'font-size:26px;width:58px;height:62px;padding:0'; b.onclick = function () { v[i] = v[i] % 6 + 1; b.textContent = v[i]; }; $('fdL').appendChild(b); });
    $('fdOk').onclick = function () { if (locked('field')) return; if (!v.every(function (x, i) { return x === code[i]; })) return wrong('field', '딸깍… 아니에요'); sfx('ok'); dialPuzzle(R, w); };
  };
  function dialPuzzle(R, w) {
    var r = seedRnd(55), off = 40 + Math.floor(r() * 280), A = [15, 100, 170, 265];
    w.innerHTML = '<svg viewBox="-160 -160 320 320" style="width:100%;max-height:56vh;touch-action:none" id="fdSky"><defs><filter id="g2"><feGaussianBlur stdDeviation="2"/></filter></defs><circle r="158" fill="#0b1230" stroke="#6b5226" stroke-width="3"/><g id="fdDisc">' +
      Array.from({ length: 110 }, function () { var a = r() * 6.283, dd = 10 + r() * 125; return '<circle cx="' + (Math.cos(a) * dd).toFixed(1) + '" cy="' + (Math.sin(a) * dd).toFixed(1) + '" r="' + (r() * 1.6 + .3).toFixed(1) + '" fill="#fff" opacity=".75"/>'; }).join('') +
      A.map(function (a) { var x = Math.cos((a - 90) * Math.PI / 180) * 118, y = Math.sin((a - 90) * Math.PI / 180) * 118; return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="6.5" fill="#ffe9a8" filter="url(#g2)"/><circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="3.4" fill="#fff"/>'; }).join('') + '</g>' +
      A.map(function (a) { var ang = (a + off - 90) * Math.PI / 180; return '<line x1="' + (Math.cos(ang) * 132).toFixed(1) + '" y1="' + (Math.sin(ang) * 132).toFixed(1) + '" x2="' + (Math.cos(ang) * 156).toFixed(1) + '" y2="' + (Math.sin(ang) * 156).toFixed(1) + '" stroke="#e8b75a" stroke-width="5" stroke-linecap="round"/>'; }).join('') + '</svg>';
    var rot = 0, start = null, svg = $('fdSky'), disc = $('fdDisc'), solved = false;
    svg.addEventListener('pointerdown', function (e) { start = { x: e.clientX, rot: rot }; svg.setPointerCapture(e.pointerId); });
    var hold = null, bar = el('div', 'fd-hold', '<i></i><span>별이 눈금에 앉았다… 그대로 두세요</span>'); w.appendChild(bar);
    function aligned() { return Math.abs(((rot - off) % 360 + 540) % 360 - 180) < 4; }
    function check() {
      if (solved) return;
      var ok = aligned() && !start;
      if (/^(127\.0\.0\.1|localhost)$/.test(location.hostname)) BN.__dialAligned = aligned();
      if (!ok) { if (hold) { clearTimeout(hold); hold = null; } bar.classList.remove('on'); return; }
      if (hold) return;
      bar.classList.remove('on'); void bar.offsetWidth; bar.classList.add('on');
      hold = setTimeout(function () { if (!aligned() || start) { hold = null; bar.classList.remove('on'); return; } solved = true; disc.setAttribute('transform', 'rotate(' + off + ')'); sfx('ok'); setTimeout(function () { closeModal(); solve(R); }, 700); }, 2000);
    }
    svg.addEventListener('pointermove', function (e) { if (!start || solved) return; rot = (start.rot + (e.clientX - start.x) * .6) % 360; if (rot < 0) rot += 360; disc.setAttribute('transform', 'rotate(' + rot + ')'); if (/^(127\.0\.0\.1|localhost)$/.test(location.hostname)) BN.__dialAligned = aligned(); if (hold && !aligned()) check(); });
    svg.addEventListener('pointerup', function () { start = null; check(); });
    svg.addEventListener('pointerdown', function () { if (hold) { clearTimeout(hold); hold = null; bar.classList.remove('on'); } });
  }

  // 6 천사 v2: 건반에는 무늬만. 누르면 조각이 잠깐 보이고 들림. 순서대로
  PUZZLES.song = function (R) {
    var parts = ['지극히 높은 곳에서는', '하나님께', '영광이요', '땅에서는', '하나님이 기뻐하신', '사람들 중에', '평화로다'], notes = [392, 440, 494, 587, 523, 494, 392], glyph = ['𝅘𝅥', '♪', '♫', '♬', '𝄞', '𝄢', '𝅗𝅥'];
    var r = seedRnd(6), order = parts.map(function (_, i) { return i; }).sort(function () { return r() - .5; }), got = 0, w = el('div', 'gen-wrap');
    w.innerHTML = '<div class="note" id="sgLine" style="font-family:var(--serif);font-size:17px;min-height:2.6em"></div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px" id="sgK"></div><p id="sgPeek" style="text-align:center;font-family:var(--serif);color:var(--gold2);min-height:1.6em;margin:8px 0 0"></p>';
    modal('흩어진 노래', w);
    function tone(f, ok) { if (!soundOn) return; try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); var t = actx.currentTime; [1, 2].forEach(function (h) { var o = actx.createOscillator(), g2 = actx.createGain(); o.type = 'sine'; o.frequency.value = f * h; g2.gain.setValueAtTime(0, t); g2.gain.linearRampToValueAtTime((ok ? .18 : .08) / h, t + .02); g2.gain.exponentialRampToValueAtTime(.001, t + (ok ? 1.2 : .3)); o.connect(g2); g2.connect(actx.destination); o.start(t); o.stop(t + 1.3); }); } catch (e) {} }
    order.forEach(function (i, k) {
      var b = el('button', 'gcard', '<span style="font-size:28px">' + glyph[k] + '</span>'); b.style.aspectRatio = '1';
      b.onclick = function () {
        $('sgPeek').textContent = parts[i]; clearTimeout(b.t); b.t = setTimeout(function () { $('sgPeek').textContent = ''; }, 700);
        if (i === got) { tone(notes[i], true); got++; b.style.opacity = '.35'; b.disabled = true; $('sgLine').textContent = parts.slice(0, got).join(' '); if (got === parts.length) setTimeout(function () { closeModal(); solve(R); }, 1300); }
        else { tone(196, false); got = 0; $('sgLine').textContent = ''; w.querySelectorAll('#sgK .gcard').forEach(function (x) { x.style.opacity = ''; x.disabled = false; }); }
      };
      $('sgK').appendChild(b);
    });
  };

  // 7 마구간 v2: 등잔 기름이 닳는다. 다 쓰면 올리브 기름 단지로 채운다
  var __manger1 = PUZZLES.manger;
  PUZZLES.manger = function (R) {
    // 11/27 v3: ① 굴 입구 돌문 — 1장에서 지나온 숫자 넷(성문 14 · 우물 7 · 부엌 4 · 여관 빈방 0)
    //           ② 굴 안 — 등잔 기름은 세 번. 벽에 긁힌 굴 그림(짐승 먹이는 자리)과 아기 울음이 들린 줄을 맞춰 비출 곳을 고르고, 천사가 말한 표적(눅 2:12)이 다 맞는 곳을 고른다
    if (!BN.used('search', 'lamp')) return talk([['gilead', 1, '아무것도 안 보여요… 굴 안이 너무 깜깜해요.'], ['narr', null, '(불빛이 있어야 한다)']]);
    S.f1 = S.f1 || {};
    if (!S.f1.door) return mgDoor(R);
    mgCave(R);
  };
  var DOOR = [['돌아온 숫자 — 다윗의 집 명부에 떠오른 수', 14], ['다윗이 그리워한 우물, 두레박 줄의 길이(규빗)', 7], ['두 손님의 등잔에 똑같이 나눈 기름(되)', 4], ['그 밤, 여관에 남은 빈방', 0]];
  function mgDoor(R) {
    var v = [0, 0, 0, 0], w = el('div', 'gen-wrap');
    w.innerHTML = '<div class="mg-door">' + DOOR.map(function (d, i) { return '<div class="mg-row"><span class="mg-q">' + (i + 1) + '. 「' + d[0] + '」</span><span class="mg-dial"><button class="btn ghost" data-d="' + i + '" data-s="-1">▼</button><b id="mgV' + i + '">0</b><button class="btn ghost" data-d="' + i + '" data-s="1">▲</button></span></div>'; }).join('') + '</div><button class="btn gold block" id="mgOpen" style="margin-top:10px">돌문 밀기</button>';
    modal('굴 입구 돌문', w);
    w.querySelectorAll('[data-d]').forEach(function (b) { b.onclick = function () { var i = +b.dataset.d; v[i] = (v[i] + +b.dataset.s + 21) % 21; $('mgV' + i).textContent = v[i]; }; });
    $('mgOpen').onclick = function () {
      if (locked('stable')) return;
      if (!v.every(function (x, i) { return x === DOOR[i][1]; })) return wrong('stable', '돌문이 꿈쩍도 하지 않는다');
      S.f1.door = 1; save(); sfx('ok'); closeModal(); toast('쿠르릉… 돌문이 옆으로 밀려난다'); setTimeout(function () { mgCave(R); }, 900);
    };
  }
  function caveLayout() {
    var r = seedRnd(81), c = Math.floor(r() * 3), aRow = r() < .5 ? 0 : 1, A = aRow * 3 + c, D = (1 - aRow) * 3 + c;
    var rest = [0, 1, 2, 3, 4, 5].filter(function (k) { return k % 3 !== c; });
    for (var q = rest.length - 1; q > 0; q--) { var t = Math.floor(r() * (q + 1)), x = rest[q]; rest[q] = rest[t]; rest[t] = x; }
    var L = {}; L[A] = 'A'; L[D] = 'D'; L[rest[0]] = 'T'; L[rest[1]] = 'G'; L[rest[2]] = 'N'; L[rest[3]] = 'H';
    return { c: c, A: A, aRow: aRow, L: L, feed: [A, D, rest[0]] };
  }
  BN.caveAns = function () { var o = caveLayout(); return ['왼쪽', '가운데', '오른쪽'][o.c] + ' 줄의 ' + (o.aRow ? '입구 쪽' : '안쪽') + ' 구유'; };
  var NOOK = {
    A: ['👶', '짚 구유 · 강보에 싸인 아기 · 곁에 마리아와 요셉'],
    D: ['🧺', '짚 구유 · 비어 있음 · 곁 줄에 강보 천만'],
    T: ['🐑', '구유 · 잠든 새끼 양'],
    G: ['✨', '금빛 그릇과 비단 천(아까 반짝인 것)'],
    N: ['🫏', '나귀 짐과 물 항아리'],
    H: ['🌾', '마른 짚더미']
  };
  function mgCave(R) {
    var o = caveLayout(); S.mgLit = S.mgLit || []; if (S.mgOil === undefined) S.mgOil = 3;
    var w = el('div', 'gen-wrap');
    w.innerHTML = '<div class="mg-sketch"><b>벽에 긁힌 굴 그림</b><div class="mg-sg">' + [0, 1, 2, 3, 4, 5].map(function (k) { return '<span>' + (o.feed.indexOf(k) >= 0 ? '🐾' : '') + '</span>'; }).join('') + '</div><small>🐾 짐승 먹이는 자리 · 위가 굴 안쪽</small></div>' +
      '<div class="mg-cave" id="mgCave"><img src="img/places/stable.webp" alt=""><div class="mg-grid" id="mgGrid"></div><span class="mg-cry" id="mgCry">응애…</span><span class="mg-in">안쪽</span><span class="mg-out">입구</span></div>' +
      '<div class="mg-oil"><span>🪔 남은 기름</span><b id="mgOil"></b><button class="btn ghost" id="mgFill" style="padding:6px 10px">기름 채우기</button></div>';
    modal('바위 굴 안', w);
    var cry = $('mgCry'); cry.style.left = ((o.c + .5) / 3 * 100) + '%';
    var ct = setInterval(function () { if (!cry.isConnected) return clearInterval(ct); cry.classList.remove('on'); void cry.offsetWidth; cry.classList.add('on'); }, 3600);
    setTimeout(function () { cry.classList.add('on'); }, 500);
    function draw() {
      $('mgOil').textContent = '●'.repeat(S.mgOil) + '○'.repeat(Math.max(0, 3 - S.mgOil));
      var g = $('mgGrid'); g.innerHTML = '';
      [0, 1, 2, 3, 4, 5].forEach(function (k) {
        var lit = S.mgLit.indexOf(k) >= 0, n = NOOK[o.L[k]], b = el('div', 'mg-nook' + (lit ? ' lit' : ''));
        b.innerHTML = lit ? '<span class="mg-e">' + n[0] + '</span><span class="mg-t">' + n[1] + '</span><button class="btn gold mg-pick" data-k="' + k + '">여기다</button>' : '<span class="mg-q2">?</span>';
        b.onclick = function (e) {
          if (e.target.classList.contains('mg-pick')) { if (locked('stable')) return; if (k === o.A) { sfx('ok'); S.mgLit = []; save(); setTimeout(function () { closeModal(); solve(R); }, 500); } else wrong('stable', '천사가 말한 표적과 다르다 — 강보에 싸여 구유에 뉘어 있는 아기'); return; }
          if (lit) return;
          if (S.mgOil <= 0) return toast('등잔 기름이 다 떨어졌어요 — 「기름 채우기」');
          S.mgOil--; S.mgLit.push(k); save(); draw();
        };
        g.appendChild(b);
      });
    }
    draw();
    $('mgFill').onclick = function () {
      if (S.mgOil >= 3) return toast('등잔에 기름이 넉넉해요');
      if (!has('oil')) return toast('채울 기름이 없어요 — 여관 부엌의 큰 항아리에서 덜어 와야 해요');
      var done = function () { S.mgOil = 3; save(); draw(); toast('등잔에 기름을 채웠다'); };
      if (BN.oilCarry && !$('mgFill').dataset.go) { $('mgFill').dataset.go = 1; return BN.oilCarry(function () { if ($('mgFill')) $('mgFill').dataset.go = ''; if ($('mgGrid')) done(); else { S.mgOil = 3; save(); } }); }
      done();
    };
    if (/^(127\.0\.0\.1|localhost)$/.test(location.hostname)) BN.__cave = o;
  }

  // 다시 들어왔을 때
  if (S && S.nick && S.opening) { /* 첫 화면에서 「이어 하기」를 누르면 지도로 */ }
  for (var hk in (BN.HINTS_CH1 || {})) BN.HINTS[hk] = BN.HINTS_CH1[hk];
  BN.runPuzzle = function (name, R) { if (PT && ((ptCur === 'walk' && name === 'roadmap') || (ptCur === 'herd' && name === 'field'))) return ptOk(); (PUZZLES[name] || PZ_EXTRA[name])(R); };
  var zb = document.createElement('button'); zb.className = 'zoom-btn'; document.body.appendChild(zb);
  function zoomLabel() { zb.textContent = ZOOM === 'near' ? '🔍 작게' : '🔍 크게'; zb.hidden = innerWidth >= innerHeight; }
  zb.onclick = function () { ZOOM = ZOOM === 'near' ? 'far' : 'near'; try { localStorage.setItem('bethlehem.zoom', ZOOM); } catch (e) {} zoomLabel();
    if ($('room').classList.contains('on')) roomFit(50); else if ($('map').classList.contains('on')) { var c = { x: innerWidth / 2, y: innerHeight / 2 }, k0 = view.k, k1 = fitK(ZOOM === 'near') * (ZOOM === 'near' ? 1.25 : 1); view.x = c.x - (c.x - view.x) * k1 / k0; view.y = c.y - (c.y - view.y) * k1 / k0; view.k = k1; clampView(); } };
  zoomLabel(); addEventListener('resize', zoomLabel);
  function zoomBody() { document.body.classList.toggle('zoom-far', ZOOM !== 'near' && innerWidth < innerHeight); }
  zoomBody(); addEventListener('resize', zoomBody); zb.addEventListener('click', zoomBody);
  // 위쪽 막대가 폰 너비보다 넓으면 통째로 줄여 맞춘다(좁은 폰에서 ♪가 잘리던 것)
  function fitHud() { var h = $('hud'), l = h.querySelector('.hud-l'), r = h.querySelector('.hud-r'); if (!l || !r || h.hidden) return; h.style.zoom = ''; var need = l.scrollWidth + r.scrollWidth + 26; h.style.zoom = need > innerWidth ? (innerWidth / need).toFixed(3) : ''; }
  addEventListener('resize', fitHud); setInterval(fitHud, 1500); setTimeout(fitHud, 300);
  // 화면 밖에 아직 못 찾은 것이 있으면 그쪽 가장자리에 반짝이는 화살표(끌어서 보라는 뜻)
  var edgeL = document.createElement('div'), edgeR = document.createElement('div'); edgeL.className = 'edge-hint l'; edgeR.className = 'edge-hint r'; edgeL.textContent = '‹ ✦'; edgeR.textContent = '✦ ›'; document.body.appendChild(edgeL); document.body.appendChild(edgeR);
  function edgeHints() {
    var on = $('room').classList.contains('on'), L = false, Rt = false;
    if (on) document.querySelectorAll('#roomSpots .rspot.area').forEach(function (e) { if (!/^(clue|card|scrap|tile|pick|room)$/.test(e.dataset.k || '')) return; var r = e.getBoundingClientRect(), cx = r.left + r.width / 2; if (cx < 6) L = true; else if (cx > innerWidth - 6) Rt = true; });
    edgeL.classList.toggle('on', L); edgeR.classList.toggle('on', Rt);
  }
  setInterval(edgeHints, 600);
  // 퀘스트 저널(journal.js)이 쓰는 도구
  BN.ui = { modal: modal, closeModal: closeModal, toast: toast, sfx: sfx, save: save, unlocked: unlocked, S: function () { return S; },
    cur: function () { return $('room').classList.contains('on') ? cur : ''; }, screen: function () { var e = document.querySelector('.screen.on'); return e ? e.id : ''; },
    oilAdd: function (n) { oilInit(); S.oil[S.ch] = (S.oil[S.ch] || 0) + n; save(); },
    showOnMap: function (id) { closeModal(); leaveRoom(); enterMap(); setTimeout(function () { var s = document.querySelector('#spots .spot[data-id="' + id + '"]'); if (s) { s.classList.add('pulse'); setTimeout(function () { s.classList.remove('pulse'); }, 5000); } }, 700); } };
  // ── 폰 시험 목록
  var ptCur = null;
  function ptOk() { closeModal(); if (ptCur) { S.ptDone = S.ptDone || {}; S.ptDone[ptCur] = 1; save(); } sfx('ok'); toast('✔ 성공! 「📱 시험 목록」에서 다음 것을 해 보세요'); }
  var PT_LIST = [
    ['h', '📱 센서 · 마이크 · 소리'],
    ['walk', 'road', '1장 나사렛 길', '🚶 30걸음 걷기', '폰을 들고 실제로 걸어요. 걸음 수가 잘 올라가는지(너무 쉽게/안 세지는지).'],
    ['oil', 'stable', '1장 마구간', '🪔 기울여 기름 나르기', '폰을 기울여 쟁반을 길 따라 등잔까지. 기울인 쪽으로 가는지, 너무 예민하거나 둔한지.'],
    ['climb', 'climb', '2장 오르는 길', '🕊 기울여 새장 굴리기', '폰을 기울여 새장을 굴려 비둘기 둘을 모은 뒤 맨 위 문으로.'],
    ['read', 'porch', '2장 솔로몬 행각', '🎤 찬송 소리 내어 읽기', '마이크를 허락하고 시므온 찬송을 소리 내어 끝까지. 읽는 만큼 글자가 밝아지는지.'],
    ['astro', 'magi', '3장 박사 천막', '🧭 실제로 별 겨누기', '폰을 남서쪽으로 향하고 윗부분을 55° 들어 2초. 화면의 방향이 실제 나침반과 맞는지.'],
    ['bow', 'worship', '4장 그 집 안', '🙇 엎드려 경배', '화면이 바닥을 보게 폰을 엎어 5초. 끝나면 진동이 오는지.'],
    ['lamp', 'dream', '5장 요셉의 꿈', '💨 등잔 불어 끄기', '마이크에 「후—」 길게 불어 등잔을 꺼요.'],
    ['bells', 'dawn', '5장 새벽 길', '🔔 흔들어 방울 울리기', '폰을 흔들어 방울을 세 번(아이폰은 「흔들기 켜기」를 먼저).'],
    ['chorus', 'angel', '1장 들판 위 하늘', '🎵 천군 가락 따라 하기', '소리가 나는지(무음 모드 끄기), 가락을 듣고 따라 누르기 편한지.'],
    ['h', '✋ 손 감각(폰에서 느낌 확인)'],
    ['herd', 'field', '1장 들판', '🐑 양 몰기', '손가락으로 양 7마리를 60초 안에 우리로. 너무 어렵거나 쉬운지.'],
    ['stealth', 'escape', '5장 골목', '🏮 실시간 잠입', '한 칸씩 움직여 성문까지. 규칙: 나귀가 한 걸음 가거나 기다릴 때마다 등불이 오른쪽으로 한 칸 돈다. 너무 어렵거나 쉬운지.'],
    ['route', 'dawn', '5장 새벽 길', '✍ 애굽 길 그리기', '손가락을 떼지 않고 길을 그어요(💧힌트에 길이 있어요).'],
    ['stars3', 'roof', '3장 왕궁 지붕', '✨ 별자리 선 긋기', '별과 별을 손가락으로 이어요. 선이 잘 그어지는지.']
  ];
  function ptRun(k) {
    var it = PT_LIST.filter(function (x) { return x[0] === k; })[0]; if (!it) return;
    ptCur = k; S.f3 = S.f3 || {}; S.f4 = S.f4 || {}; S.f5 = S.f5 || {}; delete S.f3.astro; delete S.f4.bow; delete S.f5.lamp; S.walked = 0; S.herded = 0; S.psalmOk = 1; S.f1 = S.f1 || {}; S.f1.chord = 1; S.seenIntro[it[1]] = 1; save();
    closeModal(); enterRoom(it[1]); $('dialog').hidden = true;
    setTimeout(function () {
      $('dialog').hidden = true; var R = BN.ROOMS[it[1]];
      if (k === 'oil') return BN.oilCarry(ptOk);
      if (k === 'read') return BN.PZ.readAloud(BN.SIMEON.join(' '), '시므온의 찬송 · 소리 내어', ptOk, API);
      if (k === 'bells') { BN.PZ.route(R, API); if (BN.__routeOk) BN.__routeOk(); return; }
      if (BN.PZ[k]) BN.PZ[k](R, API); else BN.runPuzzle(k, R);
    }, 900);
  }
  function ptMenu() {
    var d = S.ptDone = S.ptDone || {}, w = el('div', 'gen-wrap pt-list');
    if ((S.f3 || {}).astro) d.astro = 1; if ((S.f4 || {}).bow) d.bow = 1; if ((S.f5 || {}).lamp) d.lamp = 1; save();
    w.innerHTML = '<p class="gen-help">폰에서만 확인할 수 있는 문제만 모았어요. 눌러서 바로 해 보고, 어색하거나 안 되는 것을 알려 주세요. (이 기기에만 저장되고 순위·진행에는 안 들어가요)</p>' + PT_LIST.map(function (x) {
      if (x[0] === 'h') return '<h4>' + x[1] + '</h4>';
      return '<button class="pt-item" data-k="' + x[0] + '"><b>' + (d[x[0]] ? '✔ ' : '') + x[3] + '</b><span>' + x[2] + '</span><small>' + x[4] + '</small></button>';
    }).join('');
    modal('📱 폰 시험 목록', w);
    w.querySelectorAll('.pt-item').forEach(function (b) { b.onclick = function () { ptRun(b.dataset.k); }; });
  }
  if (CT) {
    if (!S || !S.nick) {
      S = blank(); S.nick = CT + '장시험'; S.opening = true; S.ch = CT; S.chDone = {}; S.items = CT > 1 ? ['census', 'lamp', 'flint', 'keys', 'oil', 'lens', 'scrap', 'cloth'].concat(CT > 2 ? ['doves'] : []) : [];
      var done = ['wellroom']; for (var c = 1; c < CT; c++) { var st = (BN.CHAPTERS[c] || {}).start; if (st) done.push(st); BN.SPOTS.forEach(function (sp) { if ((sp.ch || 1) === c) done.push(sp.id); }); if (c === 1) done.push('kitchen'); S.chDone[c] = 1; }
      done.forEach(function (k) { S.rooms[k] = { at: 0, stamp: BN.STAMPS[k] || '' }; }); save();
    }
    if (CT === 1 && S.items && S.items.length) {   // 예전에 물건을 미리 받은 1장 시험 판: 아직 안 푼 곳의 물건은 돌려놓는다
      var src = {}; Object.keys(BN.ROOMS).forEach(function (k) { var R0 = BN.ROOMS[k]; if (R0.item) src[R0.item] = k; (R0.spots || []).forEach(function (sp) { var m = /^pick:(\w+)/.exec(sp.act || ''); if (m) src[m[1]] = k; }); });
      var before = S.items.length; S.items = S.items.filter(function (it) { return src[it] && S.rooms[src[it]]; }); if (S.items.length !== before) save();
    }
    document.querySelector('#title .eyebrow').textContent = '✦ ' + CT + '장 시험 · 이 기기에만 저장돼요'; $('btnCode').hidden = true; $('btnContinue').hidden = false; updHud();
  }
  if (PT) { document.body.classList.add('pt');
    if (!S || !S.nick) { S = blank(); S.nick = '폰시험'; S.opening = true; S.ch = 5; S.items = ['census', 'lamp', 'rope', 'keys', 'oil', 'lens', 'scrap', 'cloth']; save(); }
    var ptb = el('button', 'pt-fab', '📱 시험 목록'); ptb.onclick = ptMenu; document.body.appendChild(ptb);
    document.querySelector('#title .eyebrow').textContent = '✦ 폰 시험 · 이 기기에만 저장돼요';
    setTimeout(ptMenu, 400);
  }
  if (BN.hook) BN.hook({ S: function () { return S; }, save: save, toast: toast, cur: function () { return $('room').classList.contains('on') ? cur : ''; } });
  if (/^(127\.0\.0\.1|localhost)$/.test(location.hostname) && /debug/.test(location.search)) document.body.classList.add('dbg');
  if (/^(127\.0\.0\.1|localhost)$/.test(location.hostname)) window.__bn = { allClues: function () { S.clues = Object.assign(S.clues || {}, BN.__allClues ? BN.__allClues() : {}); save(); }, get S() { return S; }, resultImage: resultImage, enterRoom: enterRoom, enterMap: enterMap, PUZZLES: PUZZLES, solveNow: function () { solve(BN.ROOMS[cur]); }, sheep: function () { return sheepData(); }, give: function (k) { if (S.items.indexOf(k) < 0) S.items.push(k); save(); } };
})();
