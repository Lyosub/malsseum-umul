// 「베들레헴의 밤」 엔진 v0 (2026-11-26): 첫 화면 · 등록 · 컷신 · 지도(끌기·확대) · 방 · 대화 · 수첩 · 가방 · 도장 · 숨은 별 · 시간 · 저장(이 기기)
// 서버 저장·순위·첫 통과 알림·이어하기 코드는 다음 단계(Supabase).
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var KEY = 'bethlehem.v1';
  var S = load() || null;
  function blank() { return { v: 1, nick: '', dept: '', grade: '', av: 'm', ch: 1, ms: 0, hintMin: 0, rooms: {}, items: [], notes: [], stars: [], seenIntro: {}, opening: false, created: Date.now() }; }
  function load() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} if (BN.netDirty) BN.netDirty(); }

  // ── 화면 전환
  function show(id) { document.querySelectorAll('.screen').forEach(function (s) { s.classList.toggle('on', s.id === id); }); document.body.classList.toggle('playing', id === 'map' || id === 'room'); $('hud').hidden = !(id === 'map' || id === 'room'); }
  function toast(t) { var e = $('toast'); e.textContent = t; e.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function () { e.classList.remove('on'); }, 2600); }

  // ── 소리: 장면마다 BGM을 1.2초 겹쳐 바꿈(꺼짐 기억) · 효과 음악은 짧게
  var soundOn = localStorage.getItem('bethlehem.sound') !== '0', curTrack = null, curAud = null;
  function music(name) {
    if (name === undefined) name = curTrack;
    if (!name) return;
    if (!soundOn) { curTrack = name; if (curAud) curAud.pause(); return; }
    if (name === curTrack && curAud && !curAud.paused) return;
    var old = curAud, a = new Audio('audio/' + name + '.mp3'); a.loop = !/opening|ending|cookie/.test(name); a.volume = 0;
    a.play().catch(function () {}); curAud = a; curTrack = name;
    var t0 = performance.now();
    (function fade() { var k = Math.min(1, (performance.now() - t0) / 1200); a.volume = 0.55 * k; if (old) old.volume = Math.max(0, old.volume * (1 - k)); if (k < 1) requestAnimationFrame(fade); else if (old) old.pause(); })();
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
    if (!real) return ($('profErr').textContent = '실명을 적어 주세요 — 시상할 때만 사용돼요');
    var btn = $('btnProfileOk');
    if (!window.BNNet || !BNNet.on) { S.nick = n; S.real = real; S.av = av; S.pendingReg = 1; save(); return startPrologue(); }
    btn.disabled = true; $('profErr').textContent = '확인하는 중…';
    BNNet.register(n, real).then(function (r) {
      btn.disabled = false; $('profErr').textContent = '';
      S.nick = r.nick; S.code = r.code; S.av = av; delete S.real; save();
      showCode(r.code, startPrologue);
    }).catch(function (e) {
      btn.disabled = false;
      if (e && e.offline) { S.nick = n; S.real = real; S.av = av; S.pendingReg = 1; save(); toast('인터넷이 끊겨 있어 이 기기에만 저장해요 — 연결되면 자동으로 등록돼요'); return startPrologue(); }
      $('profErr').textContent = (e && e.message) || '등록하지 못했어요';
    });
  };
  function showCode(code, next) {
    var w = el('div', 'gen-wrap');
    w.innerHTML = '<div style="text-align:center"><p class="gen-help">다른 기기에서 이어 하려면 이 코드가 필요해요.<br>사진을 찍거나 적어 두세요. (수첩 맨 위에서도 다시 볼 수 있어요)</p><p class="code-big">' + code + '</p></div>';
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

  // ── 지도(끌기·휠·두 손가락 확대)
  var view = { x: 0, y: 0, k: 1 }, W = 1920, H = 1080;
  function fitMin() { var vw = innerWidth, vh = innerHeight; return Math.max(vw / W, vh / H); }
  function clampView() { var vw = innerWidth, vh = innerHeight, k = view.k = Math.min(Math.max(view.k, fitMin()), fitMin() * 2.6); view.x = Math.min(0, Math.max(vw - W * k, view.x)); view.y = Math.min(0, Math.max(vh - H * k, view.y)); $('mapWorld').style.transform = 'translate(' + view.x + 'px,' + view.y + 'px) scale(' + k + ')'; }
  function enterMap() { if (window.BN3D) BN3D.unmount();
    var CH = (BN.CHAPTERS || {})[S.ch || 1] || { title: '그 밤', map: 'A' }, MP = (BN.MAPS || {})[CH.map] || { img: 'img/maps/mapA@2x.webp', bgm: 'bgm02_village' };
    if ($('mapImg').getAttribute('src') !== MP.img) { $('mapImg').src = MP.img; enterMap.once = false; }
    show('map'); music(MP.bgm); $('hudCh').textContent = (S.ch || 1) + '장 「' + CH.title + '」';
    if (!enterMap.once) { enterMap.once = true; view.k = fitMin() * 1.25; view.x = (innerWidth - W * view.k) * 0.55; view.y = (innerHeight - H * view.k) * 0.8; }
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
    cur = id; show('room'); $('btnBack').hidden = !!R.noBack; $('toast').classList.remove('on'); music(R.bgm || 'bgm02_village');
    var bg = $('roomBg'); bg.style.backgroundImage = 'url(' + R.bg + ')';
    roomFit(R.focus || 50);
    var pv = $('roomView'); pv.classList.remove('push'); void pv.offsetWidth; pv.classList.add('push');
    if (window.BN3D) {
      var key = R.bg.replace(/^.*\//, '').replace('.webp', '');
      BN3D.mount($('roomStage'), { img: R.bg, hi: R.bg.replace('.webp', '@2x.webp'), depth: 'img/depth/' + key + '.webp', fx: (BN.FX || {})[cur] || {}, grade: ((BN.FX || {})[cur] || {}).grade,
        panFrac: function () { var vw = innerWidth, sw = 1920 * rv.k, sh = 1080 * rv.k; return { x: sw > vw ? ((rv.x - (vw - sw) / 2) / ((sw - vw) / 2 || 1)) : 0, y: sh > innerHeight ? ((rv.y - (innerHeight - sh) / 2) / ((sh - innerHeight) / 2 || 1)) : 0 }; } });
      setTimeout(function () { document.querySelectorAll('#roomSpots .rspot').forEach(function (b) { var x = parseFloat(b.style.left) / 100, y = parseFloat(b.style.top) / 100; if (b.classList.contains('fig')) BN3D.track(b, x, Math.min(.98, y - .03), .82); else BN3D.track(b, x, y); }); }, 0);
    }
    $('roomTitle').innerHTML = R.title.split(' · ').map(function (t) { return '<span>' + t + '</span>'; }).join('<i class="sep"> · </i>');
    var box = $('roomSpots'); box.innerHTML = '';
    R.spots.forEach(function (sp) {
      if (sp.act.indexOf('star:') === 0 && S.stars.indexOf(sp.act) >= 0) return;
      if (sp.act.indexOf('bread:') === 0 && (S.bread || []).indexOf(sp.act) >= 0) return;
      var b = document.createElement('button'); b.className = 'rspot'; b.style.left = sp.x + '%'; b.style.top = sp.y + '%';
      if (sp.night) { var hh = new Date().getHours(); if (hh >= 5 && hh < 19) return; }
      if (sp.w) { if (sp.act.indexOf('card:') === 0 && (S.cards || []).indexOf(sp.act.slice(5)) >= 0) return; if (sp.act.indexOf('pick:') === 0 && (S.taken || []).indexOf(sp.id) >= 0) return; if (sp.act.indexOf('scrap:') === 0 && (S.scraps || []).indexOf(sp.act.slice(6)) >= 0) return; if (sp.act.indexOf('tile:') === 0 && (S.tiles || []).indexOf(sp.act.slice(5)) >= 0) return;
        b.className = 'rspot area'; b.dataset.id = sp.id; b.style.width = sp.w + '%'; b.style.height = sp.h + '%'; if (sp.act.indexOf('sheep:') === 0) b.innerHTML = '<span class="bell">' + sheepBell(+sp.act.split(':')[1]) + '</span>';
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
  function roomClamp() { var vw = innerWidth, vh = innerHeight, k = rv.k; rv.x = Math.min(0, Math.max(vw - 1920 * k, rv.x)); rv.y = Math.min(0, Math.max(vh - 1080 * k, rv.y)); var st = $('roomStage'); st.style.width = '1920px'; st.style.height = '1080px'; st.style.transform = 'translate(' + rv.x + 'px,' + rv.y + 'px) scale(' + k + ')'; }
  function roomFit(focus) { rv.k = Math.max(innerWidth / 1920, innerHeight / 1080); rv.x = innerWidth / 2 - 1920 * rv.k * focus / 100; rv.y = (innerHeight - 1080 * rv.k) / 2; roomClamp(); var wide = 1920 * rv.k - innerWidth > 40; $('panHint').classList.toggle('on', wide); clearTimeout(roomFit.t); roomFit.t = setTimeout(function () { $('panHint').classList.remove('on'); }, 3000); }
  (function () {
    var v = $('roomView'), s = null, moved = 0;
    v.addEventListener('pointerdown', function (e) { s = { x: e.clientX, y: e.clientY, rx: rv.x, ry: rv.y }; moved = 0; });
    v.addEventListener('pointermove', function (e) { if (!s) return; var dx = e.clientX - s.x, dy = e.clientY - s.y; moved = Math.max(moved, Math.abs(dx) + Math.abs(dy)); rv.x = s.rx + dx; rv.y = s.ry + dy; roomClamp(); });
    function up() { s = null; } v.addEventListener('pointerup', up); v.addEventListener('pointercancel', up);
    v.addEventListener('click', function (e) { if (moved > 8) e.stopPropagation(); }, true);
    addEventListener('resize', function () { if ($('room').classList.contains('on')) roomFit(50); });
  })();
  function act(R, sp, el) {
    var a = sp.act.split(':');
    if (a[0] === 'talk') talk(R.talks[a[1]]);
    else if (a[0] === 'puzzle') { if (PUZZLES[a[1]] || PZ_EXTRA[a[1]]) (PUZZLES[a[1]] || PZ_EXTRA[a[1]])(R); else BN.PZ[a[1]](R, API); }
    else if (a[0] === 'room') enterRoom(a[1]);
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
  function talk(lines, done) { dq = lines.slice(); dqTotal = dq.length; dqDone = done || null; $('dialog').hidden = false; nextLine(); }
  function endTalk() { if (typing) { clearInterval(typing); typing = null; } dq = []; $('dialog').hidden = true; var d = dqDone; dqDone = null; if (d) d(); }
  function nextLine() {
    if (typing) { finishType(); return; }
    var L = dq.shift(); if (!L) { $('dialog').hidden = true; var d = dqDone; dqDone = null; if (d) d(); return; }
    var who = BN.CHARS[L[0]] || { name: L[0] }, face = who.face;
    if (face === 'me') face = 'me_' + S.av;
    var fe = $('dlgFace'); if (face) { fe.src = 'img/chars/' + face + '_f' + (L[1] || 0) + '.webp'; fe.style.visibility = 'visible'; } else fe.style.visibility = 'hidden';
    $('dlgName').textContent = L[0] === 'me' ? S.nick : who.name;
    var nth = dqTotal - dq.length, last = !dq.length; $('dlgCount').textContent = dqTotal > 1 ? nth + ' / ' + dqTotal : '';
    $('dlgNext').textContent = last ? '■ 끝 · 눌러서 닫기' : '▼ 다음'; $('dlgNext').classList.toggle('last', last); $('dlgEnd').hidden = dqTotal < 3 || last;
    $('dlgSub').textContent = L[3] || ''; $('dlgRef').textContent = L[4] || '';
    var t = $('dlgText'); t.classList.toggle('scripture', !!L[4]); t.textContent = ''; var full = L[2], i = 0;
    typing = setInterval(function () { i += 2; t.textContent = full.slice(0, i); if (i >= full.length) finishType(); }, 28);
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
        wrap.innerHTML = '<p class="tiny-note">조각을 두 개 차례로 누르면 자리가 바뀌어요.</p>';
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
  $('btnNote').onclick = function () { modal('서기관의 수첩', stampRow() + (S.code ? '<div class="note" style="text-align:center">이어하기 코드 <b class="code-sm">' + S.code + '</b></div>' : '') + (S.notes.length ? S.notes.map(function (n) { return '<div class="note">' + n.text + '<div class="ref">' + (n.ref || '') + '</div></div>'; }).join('') : '<p class="empty">아직 적은 것이 없어요. 장소를 풀면 단서가 저절로 적혀요.</p>')); };
  $('btnBag').onclick = function () { modal('가방', S.items.length ? '<div class="bag">' + S.items.map(function (k) { var it = BN.ITEMS[k]; return '<div class="it"><img src="' + it[1] + '" alt=""><b>' + it[0] + '</b><br><span style="opacity:.7">' + it[2] + '</span></div>'; }).join('') + '</div>' : '<p class="empty">가방이 비어 있어요.</p>'); };
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
    if (S.rooms[cur]) return;
    var ch = BN.STAMPS[cur]; S.rooms[cur] = { at: S.ms, stamp: ch || '' };
    if (BN.netSolved) BN.netSolved(cur);
    if (R.note) S.notes.push(R.note);
    [R.item, R.item2].forEach(function (k) { if (k && S.items.indexOf(k) < 0) S.items.push(k); });
    save(); updHud();
    var after = function () {
      talk(R.done || [], function () {
        if (R.prologue) return afterPrologue();
        if (R.chapterEnd) return chapterEnd(R.chapterEnd);
        if (R.back) { toast('곁가지 이야기를 마쳤어요'); enterRoom(R.back); return; }
        var SI = (BN.STAMP_ICON || {})[cur]; toast(ch ? '도장 「' + (SI ? SI[0] + ' ' + SI[1] + ' · ' + SI[2] : ch) + '」을 받았어요 — 지도에 새 길이 열렸어요' : '풀었어요 — 지도에 새 길이 열렸어요'); enterMap();
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
      wrap.innerHTML = '<p class="gen-help">명부 조각을 눌러 고른 뒤 아래 빈칸을 누르면 놓여요. 놓인 조각을 누르면 다시 위로 돌아가요.<br>다윗의 계보 — 베레스에서 다윗까지(룻기 4장 끝).</p>';
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
    w.innerHTML = '<p class="gen-help">한 장은 낮의 길, 한 장은 밤의 하늘. 아래 막대를 밀어 두 장을 겹쳐 보세요.</p>' +
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
    if (!has('lamp')) return talk([['gilead', 1, '너무 깜깜해요. 불빛이 있어야 보일 것 같아요.'], ['asaph', 0, '나사렛 길 쪽 나그네 쉼터에 무언가 있지 않았느냐.']]);
    var w = el('div', 'gen-wrap');
    w.innerHTML = '<p class="gen-help">등잔을 들고 우물 안 벽을 손가락으로 문질러 비춰 보세요.</p><div style="position:relative;border-radius:12px;overflow:hidden;touch-action:none" id="wlBox"><img src="img/places/well.webp" style="width:100%;display:block;filter:brightness(.55)"><div style="position:absolute;left:40%;top:63%;transform:translate(-50%,-50%) rotate(-4deg);font-family:var(--serif);font-size:clamp(16px,3.2vw,26px);color:#f3d79a;text-shadow:0 0 8px #000;white-space:nowrap">줄은 열넷의 반</div><canvas id="wlDark" style="position:absolute;inset:0;width:100%;height:100%"></canvas></div>' +
      '<div id="wlRope" style="display:none"><p class="gen-help" style="margin-top:8px">두레박 줄을 몇 규빗 내릴까요?</p><input type="range" id="wlLen" min="1" max="14" value="1" style="width:100%"><p style="text-align:center;font-size:20px;margin:4px 0"><b id="wlV">1</b> 규빗</p><button class="btn gold block" id="wlUp">끌어올리기</button></div>';
    modal('우물 안', w);
    var cv = $('wlDark'), box = $('wlBox'), ctx, found = 0;
    whenImg(box, function () {
      cv.width = box.clientWidth; cv.height = box.clientHeight; ctx = cv.getContext('2d'); ctx.fillStyle = 'rgba(4,6,14,.97)'; ctx.fillRect(0, 0, cv.width, cv.height);
      function light(e) { var b = cv.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top; ctx.globalCompositeOperation = 'destination-out'; var gr = ctx.createRadialGradient(x, y, 4, x, y, 46); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, 46, 0, 7); ctx.fill(); ctx.globalCompositeOperation = 'source-over';
        if (Math.abs(x / cv.width - .40) < .14 && Math.abs(y / cv.height - .63) < .1) { found++; if (found === 25) { sfx('ok'); toast('벽에 새긴 글씨가 보여요!'); $('wlRope').style.display = 'block'; } } }
      cv.addEventListener('pointermove', function (e) { if (e.buttons || e.pointerType === 'touch') light(e); });
      cv.addEventListener('pointerdown', light);
    });
    w.addEventListener('input', function (e) { if (e.target.id === 'wlLen') $('wlV').textContent = e.target.value; });
    w.addEventListener('click', function (e) {
      if (e.target.id !== 'wlUp') return; var v = +$('wlLen').value;
      if (v === 7) { closeModal(); solve(R); }
      else { sfx('no'); toast(v < 7 ? '빈 두레박만 올라왔어요 — 물에 닿지 않았나 봐요' : '줄이 바닥 진흙에 박혔어요 — 너무 길어요'); }
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
      w.innerHTML = '<p class="gen-help">손님 쪽지를 읽고, 손님을 고른 뒤 문을 눌러 방을 정해 주세요.</p>' +
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
    w.innerHTML = '<p class="gen-help">상자에 숫자 자물쇠 세 칸이 있어요. 양들이 우는 횟수를 왼쪽부터.</p><div style="display:flex;gap:10px;justify-content:center" id="fdL"></div><button class="btn gold block" id="fdOk" style="margin-top:10px">상자 열기</button>';
    modal('목자의 상자', w);
    var v = [1, 1, 1];
    v.forEach(function (_, i) { var b = el('button', 'btn ghost', '1'); b.style.cssText = 'font-size:28px;width:64px;height:64px;padding:0'; b.onclick = function () { v[i] = v[i] % 5 + 1; b.textContent = v[i]; }; $('fdL').appendChild(b); });
    $('fdOk').onclick = function () {
      if (!v.every(function (x, i) { return x === code[i]; })) { sfx('no'); return toast('딸깍… 아직이에요. 양을 다시 눌러 세어 봐요'); }
      sfx('ok'); dial();
    };
    function dial() {
      var r = seedRnd(55), off = 40 + Math.floor(r() * 280), A = [15, 100, 170, 265];
      w.innerHTML = '<p class="gen-help">상자 안에서 「밤 네 경점」 지팡이가 나왔어요 — 저물 때, 밤중, 닭 울 때, 새벽(막 13:35). 지팡이 눈금 넷 위에 큰 별 넷이 동시에 서도록 하늘을 돌려 보세요.</p>' +
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
    w.innerHTML = '<p class="gen-help">화면을 문질러 등잔으로 비추고, 표적을 찾으면 눌러요. (<span id="mgN">0</span>/3)</p><div style="position:relative;border-radius:12px;overflow:hidden;touch-action:none" id="mgBox"><img src="img/places/stable.webp" style="width:100%;display:block"><div id="mgItems"></div><canvas id="mgDark" style="position:absolute;inset:0;width:100%;height:100%;z-index:5"></canvas></div>';
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
    modal(n + '장 「' + CH.title + '」', w, function () { if (E.ending) ending(); else nextChapter(n + 1); });
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
    html += H2.slice(0, used).map(function (h, i) { return '<div class="note"><b>' + (i + 1) + '단계 · ' + names[i] + '</b><br>' + h + '</div>'; }).join('');
    if (used < H2.length) {
      var can = S.oil[S.ch] >= drops[used];
      html += can ? '<button class="btn gold block" id="hintMore">' + (used + 1) + '단계 「' + names[used] + '」 — 기름 ' + drops[used] + '방울 · +' + mins[used] + '분</button>'
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
    var PATH = 'M258 50 L300 22 L300 112 M262 112 L338 112 M640 22 L540 86 L720 86 M650 50 L650 112';
    var DECOYS = ['M0 40 L100 40', 'M50 20 L50 112 M30 112 L100 112', 'M0 86 L100 86 M60 50 L60 112'];
    function card(nm, cls) {
      var i = names.indexOf(nm), d = el('div', 'gcard ' + (cls || ''));
      d.innerHTML = '<svg viewBox="' + (i >= 0 ? i * 100 : 0) + ' 0 100 133" preserveAspectRatio="none"><path d="' + (i >= 0 ? PATH : DECOYS[decoys.indexOf(nm)]) + '" stroke="#b8862b" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/></svg><span style="position:relative">' + nm + '</span>';
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
    var r = seedRnd(2), J = [[120, 70], [250, 60], [420, 90], [90, 190], [300, 170], [470, 210], [170, 300], [360, 290], [520, 330]];
    var arrows = J.map(function () { return Math.floor(r() * 4); }), east = Math.floor(r() * 4);   // 해 무늬가 가리키는 화면 방향(0위 1오른 2아래 3왼)
    var pick = []; while (pick.length < 4) { var c = Math.floor(r() * 9); if (pick.indexOf(c) < 0) pick.push(c); }
    var north = (east + 3) % 4, DIRS = ['북', '동', '남', '서'], answer = pick.map(function (j) { return DIRS[(arrows[j] - north + 4) % 4]; });
    var ox = 60 + Math.floor(r() * 80) * (r() < .5 ? -1 : 1), oy = 40 + Math.floor(r() * 50) * (r() < .5 ? -1 : 1), sizes = [16, 12, 9, 6];
    var land = '<path d="M30 140 Q120 120 160 150 T300 130 T420 160" stroke="#7aa3c0" stroke-width="5" fill="none" opacity=".75"/><path d="M380 30 l25 -18 l25 18 z M520 100 l20 -15 l20 15 z M40 330 l22 -16 l22 16 z M230 240 l18 -14 l18 14 z" fill="#a08660" opacity=".65"/>';
    var roads = 'M300 20 C260 50 150 50 120 70 M120 70 L250 60 L420 90 M120 70 L90 190 L300 170 L470 210 M250 60 L300 170 M420 90 L470 210 M90 190 L170 300 L360 290 L520 330 M300 170 L360 290 M470 210 L520 330 M360 290 C380 340 330 360 300 385';
    var sunAng = [0, 90, 180, 270][east];
    var day = '<g>' + land + '<path d="' + roads + '" stroke="#8a6a3a" stroke-width="7" fill="none" stroke-dasharray="2 10" stroke-linecap="round"/>' +
      J.map(function (p, i) { return '<g transform="translate(' + p[0] + ',' + p[1] + ')"><circle r="15" fill="#f3e4bf" stroke="#7a5a2a" stroke-width="2"/><text y="6" text-anchor="middle" font-size="18" fill="#5a3a14" font-weight="700">' + ARW[arrows[i]] + '</text></g>'; }).join('') +
      '<g transform="translate(560,40) rotate(' + sunAng + ')"><circle r="22" fill="none" stroke="#7a5a2a" stroke-width="1.5"/><path d="M0 -20 L5 0 L0 20 L-5 0 Z" fill="#7a5a2a" opacity=".5"/><g transform="translate(0,-30)"><circle r="6" fill="#d9a043"/>' + [0, 45, 90, 135, 180, 225, 270, 315].map(function (a) { return '<line x1="0" y1="-8" x2="0" y2="-11" stroke="#d9a043" stroke-width="2" transform="rotate(' + a + ')"/>'; }).join('') + '</g></g></g>';
    var night = '<g id="ngt" transform="translate(' + ox + ',' + oy + ')"><rect x="-200" y="-200" width="1000" height="800" fill="#0d1530" opacity=".82"/>' + land.replace(/#7aa3c0/, '#9ec4ff').replace(/#a08660/, '#c9d4ff') +
      Array.from({ length: 50 }, function () { return '<circle cx="' + Math.floor(r() * 600) + '" cy="' + Math.floor(r() * 400) + '" r="' + (r() * 1.4 + .4).toFixed(1) + '" fill="#fff" opacity="' + (r() * .5 + .2).toFixed(2) + '"/>'; }).join('') +
      pick.map(function (j, k) { var p = J[j], s = sizes[k]; return '<path transform="translate(' + p[0] + ',' + p[1] + ')" d="M0 -' + s + ' L' + s * .28 + ' -' + s * .28 + ' L' + s + ' 0 L' + s * .28 + ' ' + s * .28 + ' L0 ' + s + ' L-' + s * .28 + ' ' + s * .28 + ' L-' + s + ' 0 L-' + s * .28 + ' -' + s * .28 + ' Z" fill="#ffe9a8"/>'; }).join('') + '</g>';
    var w = el('div', 'gen-wrap');
    w.innerHTML = '<svg viewBox="0 0 600 400" style="width:100%;border-radius:10px;background:linear-gradient(#efe0bb,#d8c095);touch-action:none" id="rmSvg">' + day + '<g style="opacity:.62">' + night + '</g></svg>' +
      '<div style="display:flex;gap:8px;justify-content:center;margin-top:8px" id="rmLock"></div><button class="btn gold block" id="rmOk" style="margin-top:8px">상자 열기</button>';
    modal('두 장의 지도', w);
    var svg = $('rmSvg'), ng = $('ngt'), drag = null, snapped = false;
    function pt(e) { var b = svg.getBoundingClientRect(); return { x: (e.clientX - b.left) * 600 / b.width, y: (e.clientY - b.top) * 400 / b.height }; }
    svg.addEventListener('pointerdown', function (e) { if (snapped) return; var q = pt(e); drag = { x: q.x, y: q.y, ox: ox, oy: oy }; svg.setPointerCapture(e.pointerId); });
    svg.addEventListener('pointermove', function (e) { if (!drag) return; var q = pt(e); ox = drag.ox + q.x - drag.x; oy = drag.oy + q.y - drag.y; if (Math.abs(ox) < 7 && Math.abs(oy) < 7) { ox = 0; oy = 0; snapped = true; drag = null; sfx('ok'); } ng.setAttribute('transform', 'translate(' + ox + ',' + oy + ')'); });
    svg.addEventListener('pointerup', function () { drag = null; });
    var lock = [0, 0, 0, 0];
    lock.forEach(function (_, i) { var b = el('button', 'btn ghost', DIRS[0]); b.style.cssText = 'font-size:22px;width:58px;height:58px;padding:0;font-family:var(--serif)'; b.onclick = function () { lock[i] = (lock[i] + 1) % 4; b.textContent = DIRS[lock[i]]; }; $('rmLock').appendChild(b); });
    $('rmOk').onclick = function () { if (locked('road')) return; if (lock.every(function (v, i) { return DIRS[v] === answer[i]; })) { closeModal(); sfx('ok'); solve(R); } else wrong('road', '찰칵… 열리지 않아요'); };
  };

  // 3 우물 v2: 등잔(어둠) + 수정 조각(작은 글씨) + 두레박 줄(여관 나귀 짐)
  PUZZLES.well = function (R) {
    if (!has('lamp')) return talk([['gilead', 1, '너무 깜깜해서 아무것도 안 보여요.']]);
    var w = el('div', 'gen-wrap'), lens = false;
    w.innerHTML = '<div style="position:relative;border-radius:12px;overflow:hidden;touch-action:none" id="wlBox"><img src="img/places/well.webp" style="width:100%;display:block;filter:brightness(.55)"><div id="wlTxt" style="position:absolute;left:40%;top:63%;transform:translate(-50%,-50%) rotate(-4deg);font-family:var(--serif);font-size:7px;color:#f3d79a;filter:blur(1.2px);white-space:nowrap">줄은 열넷의 반 규빗</div><canvas id="wlDark" style="position:absolute;inset:0;width:100%;height:100%"></canvas></div>' +
      '<div style="display:flex;gap:8px;margin-top:8px">' + (has('lens') ? '<button class="btn ghost" id="wlLens">💎 수정 조각 대기</button>' : '') + '</div>' +
      '<div id="wlRope" style="margin-top:6px">' + (has('rope') ? '<input type="range" id="wlLen" min="1" max="14" value="1" style="width:100%"><p style="text-align:center;font-size:20px;margin:4px 0"><b id="wlV">1</b> 규빗</p><button class="btn gold block" id="wlUp">끌어올리기</button>' : '<p class="gen-help">두레박 줄이 짧게 끊어져 있다.</p>') + '</div>';
    modal('우물 안', w);
    var lb = $('wlLens'); if (lb) lb.onclick = function () { lens = !lens; var t = $('wlTxt'); t.style.fontSize = lens ? 'clamp(16px,3.2vw,26px)' : '7px'; t.style.filter = lens ? 'none' : 'blur(1.2px)'; lb.textContent = lens ? '💎 수정 조각 치우기' : '💎 수정 조각 대기'; };
    var cv = $('wlDark'), box = $('wlBox');
    whenImg(box, function () {
      cv.width = box.clientWidth; cv.height = box.clientHeight; var ctx = cv.getContext('2d'); ctx.fillStyle = 'rgba(4,6,14,.97)'; ctx.fillRect(0, 0, cv.width, cv.height);
      function light(e) { var b = cv.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top; ctx.globalCompositeOperation = 'destination-out'; var gr = ctx.createRadialGradient(x, y, 4, x, y, 42); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, 42, 0, 7); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; }
      cv.addEventListener('pointermove', function (e) { if (e.buttons || e.pointerType === 'touch') light(e); });
      cv.addEventListener('pointerdown', light);
    });
    w.addEventListener('input', function (e) { if (e.target.id === 'wlLen') $('wlV').textContent = e.target.value; });
    w.addEventListener('click', function (e) {
      if (e.target.id !== 'wlUp') return; if (locked('well')) return; var v = +$('wlLen').value;
      if (v === 7) { closeModal(); solve(R); } else wrong('well', v < 7 ? '빈 두레박만 올라왔어요' : '줄이 바닥 진흙에 박혔어요');
    });
  };

  // 4 여관 v2: 손님 여섯, 방 다섯(레위인은 제사장 가족과 같은 방 가능), 구절을 찾아야 풀리는 쪽지
  PUZZLES.inn = function (R) {
    var rooms = [['🐟', '2층'], ['⭐', '2층'], ['🍇', '1층'], ['🫒', '1층'], ['🕊', '1층']];
    var guests = ['갈릴리 상인', '로마 세리', '목수 형제', '나이 든 과부', '제사장 가족', '레위인 노래꾼'];
    var sol = { 0: [0], 1: [1], 2: [2], 3: [3], 4: [4, 5] };
    var clues = ['제사장 가족(넷): 「레위기 12장 8절에 나오는 예물이 그려진 방이면 좋겠소. 우리는 넷이오.」', '갈릴리 상인: 「누가복음 5장 1~2절의 그 물가에서 그물을 다루다 왔소. 그 물에서 나는 것이 그려진 방!」', '나이 든 과부: 「계단은 못 올라가요. 시편 52편 8절처럼 살고 싶은데…」', '로마 세리: 「저 갈릴리 상인과 같은 층으로 주시오.」', '목수 형제(둘): 「마태복음 20장 1절의 품꾼처럼 일하던 곳이 생각나는 방.」', '레위인 노래꾼: 「방이 없으면 제사장님 가족과 같은 방도 괜찮습니다.」'];
    var asg = [[], [], [], [], []], sel = null, w = el('div', 'gen-wrap');
    function draw() {
      w.innerHTML = '<div class="note" style="font-size:13px;line-height:1.6">' + clues.join('<br>') + '</div><div style="display:flex;flex-wrap:wrap;gap:6px" id="inG"></div><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:8px" id="inR"></div><button class="btn gold block" id="inOk" style="margin-top:10px">방 배정 끝</button>';
      var placed = [].concat.apply([], asg);
      guests.forEach(function (g, i) { if (placed.indexOf(i) >= 0) return; var b = el('button', 'btn ' + (sel === i ? 'gold' : 'ghost'), g); b.style.padding = '8px 10px'; b.onclick = function () { sel = sel === i ? null : i; draw(); }; w.querySelector('#inG').appendChild(b); });
      rooms.forEach(function (rm, i) { var b = el('button', 'gcard', '<span style="font-size:26px;display:block">' + rm[0] + '</span><small>' + rm[1] + '</small><b style="display:block;font-size:11px;color:#7a2a10;min-height:28px;line-height:1.3">' + asg[i].map(function (x) { return guests[x]; }).join('<br>') + '</b>'); b.style.aspectRatio = 'auto'; b.style.padding = '6px 2px';
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
      rooms.concat([['', '있을 곳이 없다']]).forEach(function (rm, i) { var b = el('button', 'btn ghost', (rm[0] || '∅') + (i < 5 ? '' : ' ' + rm[1])); b.style.fontSize = i < 5 ? '22px' : '15px'; b.onclick = function () { if (i < 5) { sfx('no'); toast('그 방은 이미 찼어요'); } else { closeModal(); solve(R); } }; w.querySelector('#inQ').appendChild(b); });
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
  function sheepData() { if (!sheepInfo) { var r = seedRnd(15), order = [0, 1, 2, 3].sort(function () { return r() - .5; }); sheepInfo = { bell: order, n: [0, 1, 2, 3].map(function () { return 1 + Math.floor(r() * 6); }) }; } return sheepInfo; }
  function sheepBell(i) { return BELLS[sheepData().bell[i]]; }
  function sheepBleat2(i, spot) {
    var n = sheepData().n[i], k = 0;
    (function one() {
      if (k >= n) return; k++;
      var rip = el('span', ''); rip.style.cssText = 'position:absolute;left:50%;top:0;transform:translate(-50%,-100%);font-size:20px;color:#ffe9a8;animation:rise .8s ease-out both;pointer-events:none'; rip.textContent = '〰'; spot.appendChild(rip); setTimeout(function () { rip.remove(); }, 800);
      if (soundOn) try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); var t = actx.currentTime, o = actx.createOscillator(), g2 = actx.createGain(), lfo = actx.createOscillator(), lg = actx.createGain(); o.type = 'sawtooth'; o.frequency.value = 480 + i * 40; lfo.frequency.value = 14; lg.gain.value = 40; lfo.connect(lg); lg.connect(o.frequency); g2.gain.setValueAtTime(0, t); g2.gain.linearRampToValueAtTime(.07, t + .05); g2.gain.linearRampToValueAtTime(0, t + .45); o.connect(g2); g2.connect(actx.destination); o.start(t); lfo.start(t); o.stop(t + .5); lfo.stop(t + .5); } catch (e) {}
      setTimeout(one, 520);
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
    svg.addEventListener('pointermove', function (e) { if (!start || solved) return; rot = (start.rot + (e.clientX - start.x) * .6) % 360; if (rot < 0) rot += 360; disc.setAttribute('transform', 'rotate(' + rot + ')'); if (Math.abs(((rot - off) % 360 + 540) % 360 - 180) < 4) { solved = true; disc.setAttribute('transform', 'rotate(' + off + ')'); sfx('ok'); setTimeout(function () { closeModal(); solve(R); }, 900); } });
    svg.addEventListener('pointerup', function () { start = null; });
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
    if (!has('lamp')) return talk([['gilead', 1, '아무것도 안 보여요…']]);
    __manger1(R);
    S.lampOil = S.lampOil === undefined ? 100 : S.lampOil;
    var bar = el('div', ''); bar.innerHTML = '<div style="display:flex;align-items:center;gap:8px;margin-top:8px"><span>🪔</span><div style="flex:1;height:8px;border-radius:4px;background:rgba(255,255,255,.12);overflow:hidden"><i id="oilBar" style="display:block;height:100%;width:' + S.lampOil + '%;background:linear-gradient(90deg,#f2994a,#ffe08a)"></i></div><button class="btn ghost" id="oilFill" style="padding:6px 10px">기름 채우기</button></div>';
    $('modalBody').appendChild(bar);
    var box = $('mgBox'), told = 0;
    function burn() { S.lampOil = Math.max(0, S.lampOil - 0.8); $('oilBar').style.width = S.lampOil + '%'; if (S.lampOil <= 0 && Date.now() - told > 3000) { told = Date.now(); toast('등잔 기름이 다 떨어졌어요'); } }
    // 부모(상자)에서 먼저 가로채야 캔버스의 「비추기」보다 앞선다
    box.addEventListener('pointerdown', function (e) { if (S.lampOil <= 0 && e.target.id === 'mgDark') { e.stopPropagation(); if (Date.now() - told > 3000) { told = Date.now(); toast('등잔 기름이 없어요'); } } }, true);
    box.addEventListener('pointermove', function (e) { if (e.target.id !== 'mgDark') return; if (S.lampOil <= 0) { e.stopPropagation(); return; } if (e.buttons || e.pointerType === 'touch') burn(); }, true);
    $('oilFill').onclick = function () { if (!has('oil')) return toast('채울 기름이 없어요'); if (BN.oilCarry && !$('oilFill').dataset.go) { $('oilFill').dataset.go = 1; return BN.oilCarry(function () { $('oilFill').dataset.go = ''; S.lampOil = 100; $('oilBar').style.width = '100%'; save(); toast('등잔에 기름을 가득 채웠어요'); }); } S.lampOil = 100; $('oilBar').style.width = '100%'; save(); toast('등잔에 기름을 가득 채웠어요'); };
  };

  // 다시 들어왔을 때
  if (S && S.nick && S.opening) { /* 첫 화면에서 「이어 하기」를 누르면 지도로 */ }
  for (var hk in (BN.HINTS_CH1 || {})) BN.HINTS[hk] = BN.HINTS_CH1[hk];
  BN.runPuzzle = function (name, R) { (PUZZLES[name] || PZ_EXTRA[name])(R); };
  if (BN.hook) BN.hook({ S: function () { return S; }, save: save, toast: toast, cur: function () { return $('room').classList.contains('on') ? cur : ''; } });
  if (/^(127\.0\.0\.1|localhost)$/.test(location.hostname) && /debug/.test(location.search)) document.body.classList.add('dbg');
  if (/^(127\.0\.0\.1|localhost)$/.test(location.hostname)) window.__bn = { get S() { return S; }, resultImage: resultImage, enterRoom: enterRoom, enterMap: enterMap, PUZZLES: PUZZLES, solveNow: function () { solve(BN.ROOMS[cur]); }, sheep: function () { return sheepData(); }, give: function (k) { if (S.items.indexOf(k) < 0) S.items.push(k); save(); } };
})();
