  // ───────── 함께 놀기(2단계): 친구 보기 · 블록 함께 바꾸기 · 채팅 ─────────
  // 실시간 채널 'ark-world'(로그인 회원만, DB 정책)로 위치·블록 바꿈을 주고받고, 내 땅 밖에서 바꾼 자리는 DB(ark_world_edits)에 남긴다.
  // 채팅은 DB 함수(send_ark_chat)로만 써서 이름을 속일 수 없고, 새 글·지운 글은 DB 변경 알림으로 받는다.
  var NET = { ok: false, ready: false, ch: null, on: false, nick: '', admin: false, meta: {}, peers: {}, q: [], pm: {}, flushT: 0, sentAt: 0, sentKey: '', applying: false,
    chat: [], chatIds: {}, reported: {}, joinedAt: 0, holdUntil: 0, edits: null, pp: {}, names: {}, nameAsk: {} };
  var ROBES = [[0xd8c39a, 0xc0a97e, 0x3f6fae], [0x9fb7d8, 0x7d97bb, 0xc8a040], [0xc98f8f, 0xa86f6f, 0x3a6a3a], [0x9fcf9a, 0x7fae7a, 0x8a4b14],
    [0xd6b0e0, 0xb48fc0, 0x2f5f8f], [0xe0d070, 0xc0b050, 0x7a2a2a], [0x8fd0d0, 0x6fb0b0, 0x6b3d14], [0xe8e8e8, 0xc8c8c8, 0x7a3ea8]];
  var HAIRS = [0x3a2618, 0x1e1410, 0x6b4425, 0x2b1d14, 0x8a5a2a];
  function hashStr(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function peerLook(u) {
    var h = hashStr(u || ''), r = ROBES[h % ROBES.length];
    return { robe: r[0], robe2: r[1], belt: 0x7a4a26, trim: r[2], skin: [0xe5b98f, 0xd9a67a, 0xc98f62][(h >>> 4) % 3], hair: HAIRS[(h >>> 8) % HAIRS.length], sandal: 0x6b4425 };
  }
  function textSprite(t, bg, fg, hgt) {
    var px = 28, f = px + 'px Galmuri11, "Malgun Gothic", sans-serif', c = document.createElement('canvas'), g = c.getContext('2d');
    g.font = f; var w = Math.ceil(g.measureText(t).width) + 20, h = px + 14;
    c.width = w; c.height = h; g = c.getContext('2d'); g.font = f;
    g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = fg; g.textBaseline = 'middle'; g.fillText(t, 10, h / 2 + 1);
    var tex = new THREE.CanvasTexture(c); tex.minFilter = THREE.LinearFilter; tex.generateMipmaps = false;
    if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
    var s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, fog: false }));
    s.scale.set(w / h * hgt, hgt, 1); s.renderOrder = 20;
    return s;
  }
  function disposeSprite(s) { if (!s) return; if (s.parent) s.parent.remove(s); s.material.map.dispose(); s.material.dispose(); }
  function shortName(n, k) { var cs = Array.from(n || '친구'); return cs.length > k ? cs.slice(0, k).join('') + '…' : cs.join(''); }

  // 친구 모습
  function peerGet(u) {
    var p = NET.peers[u]; if (p) return p;
    var av = new THREE.Group(); scene.add(av);
    p = NET.peers[u] = { u: u, av: av, wk: null, tag: null, nick: null, x: 0, y: 0, z: 0, h: 0, pt: 0, tx: 0, ty: 0, tz: 0, th: 0, t: 0, s: 0, walk: 0, rk: '', beast: null, bub: null, bubT: 0, fresh: true };
    peerName(p);
    return p;
  }
  function peerName(p) {
    var m = NET.meta[p.u], n = NET.names[p.u] || '친구', wk = (m && m.w) || '';   // 이름은 서버의 닉네임만
    if (wk !== p.wk) {   // 친구 모습·옷이 바뀌면 다시 만듦
      p.wk = wk;
      var a = wk.split('.').map(function (v) { return v | 0; }), worn = {};
      SLOTS.forEach(function (s, i) { var id = a[i + 1]; if (id && WEARINFO[id] && WEARINFO[id].slot === s) worn[s] = id; });
      var nav = makeAvatar(wk && LOOKS[a[0]] ? LOOKS[a[0]] : peerLook(p.u)); dressAvatar(nav, worn);
      nav.position.copy(p.av.position); nav.rotation.y = p.av.rotation.y; nav.visible = p.av.visible;
      if (p.tag) nav.add(p.tag); if (p.bub) nav.add(p.bub);
      scene.remove(p.av); p.av = nav; scene.add(nav);
      if (p.wi) handItem(nav, p.wi);
    }
    var ti = m && typeof m.t === 'number' && TITLES[m.t] ? m.t : -1, mate = partyMate(p.u);   // 칭호는 정해진 목록 번호만
    var key = n + '|' + ti + '|' + mate;
    if (key === p.nick) return;
    p.nick = key; disposeSprite(p.tag);
    p.tag = textSprite((ti >= 0 ? '「' + TITLES[ti] + '」 ' : '') + (mate ? '🤝' : '') + shortName(n, 8), mate ? 'rgba(30,110,40,0.7)' : 'rgba(0,0,0,0.45)', '#ffffff', 0.62); p.tag.position.y = HT + 0.7; p.av.add(p.tag);
  }
  function peerBubble(p, body) {
    disposeSprite(p.bub);
    p.bub = textSprite(shortName(body, 18), 'rgba(255,255,255,0.88)', '#222222', 0.6); p.bub.position.y = HT + 1.5; p.av.add(p.bub);
    p.bubT = performance.now() + 6000;
  }
  function peerRemove(u) {
    var p = NET.peers[u]; if (!p) return;
    disposeSprite(p.tag); disposeSprite(p.bub); scene.remove(p.av);
    if (p.beast) scene.remove(p.beast.mesh);
    delete NET.peers[u];
  }
  function onPos(m) {
    if (!m || !me || m.u === me.id || typeof m.x !== 'number') return;
    var p = peerGet(m.u);
    p.mapHidden = m.mapHidden === true;
    p.restPose = m.rest === 'sit' || m.rest === 'lie' ? m.rest : '';
    p.restYaw = typeof m.restYaw === 'number' && Number.isFinite(m.restYaw) ? m.restYaw : 0;
    p.tx = m.x; p.ty = m.y; p.tz = m.z; p.th = m.h || 0; p.pt = m.p || 0; p.s = m.s ? 1 : 0; p.w = m.w ? 1 : 0; p.t = performance.now();
    if (p.fresh) { p.fresh = false; p.x = p.tx; p.y = p.ty; p.z = p.tz; p.h = p.th; }
    var wi = typeof m.i === 'number' && m.i > 0 && B[m.i] ? m.i : 0;
    if (wi !== (p.wi || 0)) { p.wi = wi; handItem(p.av, wi); }
    var rk = BEASTS[m.r] ? m.r : '';
    if (rk !== p.rk) {
      if (p.beast) { scene.remove(p.beast.mesh); p.beast = null; }
      p.rk = rk;
      if (rk) { p.beast = makeBeast(rk, p.x, p.z); putSaddle(p.beast); }
    }
  }
  function sendPos(now) {
    var r = riding ? riding.kind : '', s = (mine && !mine.denied) || swingT > 0 ? 1 : 0, wv = performance.now() < waveUntil ? 1 : 0;
    var m = { u: me.id, x: +P.x.toFixed(2), y: +P.y.toFixed(2), z: +P.z.toFixed(2), h: +P.yaw.toFixed(2), p: +P.pitch.toFixed(2), r: r, s: s, i: heldShown(), mapHidden: S.mapVisible === false || (myPlot >= 0 && plotAt(Math.floor(P.x), Math.floor(P.z)) === myPlot) };
    if (furnitureRest) { m.rest = furnitureRest.pose; m.restYaw = furnitureRest.yaw; }
    if (wv) m.w = 1;
    var key = [m.x, m.y, m.z, m.h, m.p, r, s, wv, m.i, m.mapHidden, m.rest, m.restYaw].join();
    if ((key === NET.sentKey && now - NET.sentAt < 2500) || now - NET.sentAt < 110) return;
    NET.sentKey = key; NET.sentAt = now;
    NET.ch.send({ type: 'broadcast', event: 'pos', payload: m });
  }
  function netTick(dt, now) {
    if (!NET.ch) return;
    if (started) sendPos(now);
    if (now >= FRIENDS.poll) { FRIENDS.poll = now + 20000; friendsFetch(); }
    if (started) fetchGoal();
    var k = Math.min(1, dt * 10);
    for (var u in NET.peers) {
      var p = NET.peers[u];
      if (now - p.t > 15000 || (!NET.meta[u] && now - p.t > 5000)) { peerRemove(u); continue; }
      var ox = p.x, oz = p.z;
      if (Math.abs(p.tx - p.x) + Math.abs(p.tz - p.z) + Math.abs(p.ty - p.y) > 12) { p.x = p.tx; p.y = p.ty; p.z = p.tz; }
      else { p.x += (p.tx - p.x) * k; p.y += (p.ty - p.y) * k; p.z += (p.tz - p.z) * k; }
      var d = p.th - p.h; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; p.h += d * k;
      var mv = Math.hypot(p.x - ox, p.z - oz); p.walk += mv;
      var seat = p.rk ? BEASTS[p.rk].seat - 1.2 : 0;
      p.av.position.set(p.x, p.y + seat, p.z); p.av.rotation.set(0, p.h, 0, 'YXZ');
      var pr = p.av.userData, sw = p.rk || mv < 0.003 ? 0 : Math.sin(p.walk * 1.6) * 0.75;
      pr.legL.rotation.x = sw; pr.legR.rotation.x = -sw;
      pr.legL.rotation.z = p.rk ? -0.45 : 0; pr.legR.rotation.z = p.rk ? 0.45 : 0;
      pr.armL.rotation.x = -sw * 0.8; pr.armR.rotation.x = p.w ? -2.7 : sw * 0.8 - (p.s ? 0.9 + Math.sin(now / 70) * 0.5 : 0);
      pr.armR.rotation.z = p.w ? Math.sin(now / 110) * 0.45 : 0;   // 손 흔들기
      pr.head.rotation.x = p.pt * 0.7;
      if (p.restPose && !p.rk) poseFurnitureAvatar(p.av, p.restPose, p.x, p.y, p.z, p.restYaw);
      if (p.beast) {
        var b = p.beast; b.mesh.position.set(p.x, p.y, p.z); b.mesh.rotation.y = p.h; b.walk += mv * 1.1;
        var s2 = mv > 0.003 ? Math.sin(b.walk * 2) * 0.75 : 0;
        b.legs[0].rotation.x = s2; b.legs[3].rotation.x = s2; b.legs[1].rotation.x = -s2; b.legs[2].rotation.x = -s2;
      }
      if (p.bub && now > p.bubT) { disposeSprite(p.bub); p.bub = null; }
      p.av.visible = Math.abs(p.x - P.x) + Math.abs(p.z - P.z) < FOG_FAR * 1.4;
    }
  }

  // 블록 바꿈: 내 땅·땅 밖에서 바꾼 것을 알리고, 땅 밖은 DB에도 남김
  function netEdit(x, y, z, id) {
    if (NET.applying || !NET.ready) return;
    var p = plotAt(x, z), adm = isAdm();
    if (p >= 0 && p !== myPlot) {   // 다른 사람 땅은 관리자만: 블록 부분 저장 + 실시간으로 주인·다른 사람에게
      if (!adm) return;
      adminPlotDirty(p); NET.pp[x + ',' + y + ',' + z] = id; if (!NET.flushT) NET.flushT = setTimeout(netFlush, 150); return;
    }
    if (inArk(x, y, z) && !adm) return;
    // 친구에게는 서버가 검사해서 받은 것만 전달된다(DB 변경 알림) — 내 땅은 put_plot_edits, 땅 밖은 put_ark_edits
    if (p >= 0) { NET.pp[x + ',' + y + ',' + z] = id; if (!NET.flushT) NET.flushT = setTimeout(netFlush, 150); }
    else NET.pm[x + ',' + y + ',' + z] = id;
  }
  function netFlush() {
    NET.flushT = 0;
    var ks = Object.keys(NET.pp); if (!ks.length || !client) return;
    var arr = ks.slice(0, 300).map(function (k) { var a = k.split(','); return [+a[0], +a[1], +a[2], NET.pp[k]]; });
    ks.slice(0, 300).forEach(function (k) { delete NET.pp[k]; });
    client.rpc('put_plot_edits', { p_edits: arr }).then(function () {}, function () {});
    if (ks.length > 300) NET.flushT = setTimeout(netFlush, 300);
  }
  // 서버에서 온 바꿈을 잠깐 모아 한꺼번에 그림
  var inBuf = {}, inT = 0;
  function queueRemote(u, e) { if (NET.testMute) return;   // 시험: 끊긴 동안 못 받은 것처럼
 (inBuf[u] || (inBuf[u] = [])).push(e); if (!inT) inT = setTimeout(function () { inT = 0; var b = inBuf; inBuf = {}; for (var k in b) applyRemote(k, b[k]); }, 80); }
  // 선생님이 함께 짓는 터를 되돌리면: 지워진 자리를 처음 모습으로(그 기둥을 다시 만듦)
  var revBuf = {}, revT = 0;
  function queueRevert(x, y, z) {
    if (x < 0 || z < 0 || x >= WS || z >= WS) return;
    var k = (z >> 5) * NC + (x >> 5), li = (y * CS + (z & 31)) * CS + (x & 31);
    if (EDITS[k]) delete EDITS[k][li];
    revBuf[k] = 1;
    if (!revT) revT = setTimeout(function () {
      revT = 0; var ks = Object.keys(revBuf); revBuf = {}; saveEdits();
      ks.forEach(function (kk) {
        kk = +kk; var cx = kk % NC, cz = Math.floor(kk / NC); if (!COLS[kk]) return;
        var was = meshedCols[kk]; genColumn(cx, cz);
        if (was) { unmeshColumn(cx, cz); meshColumn(cx, cz); }
      });
    }, 300);
  }
  var persistBusy = false;
  function requeue(arr) { arr.forEach(function (e) { var k = e[0] + ',' + e[1] + ',' + e[2]; if (!(k in NET.pm)) NET.pm[k] = e[3]; }); }
  function netPersist() {
    if (!NET.ready || persistBusy || performance.now() < NET.holdUntil) return;
    var ks = Object.keys(NET.pm); if (!ks.length) return;
    var batch = ks.slice(0, 300), arr = batch.map(function (k) { var a = k.split(','); return [+a[0], +a[1], +a[2], NET.pm[k]]; });
    batch.forEach(function (k) { delete NET.pm[k]; });
    persistBusy = true;
    client.rpc('put_ark_edits', { p_edits: arr }).then(function (r) {
      persistBusy = false;
      if (!r.error && r.data>=0 && r.data<arr.length && villageProjectsEnabled) {
        var areas=Object.keys(VILLAGE_PROJECTS).filter(function(k){return arr.some(function(e){return inProject(VILLAGE_PROJECTS[k],e[0],e[2]);});});
        areas.forEach(syncVillageProject);
        if(areas.length){fetchVillageProjects();toast('그 공사장에는 놓이지 않은 블록이 있어요');}
      }
      if(!r.error&&r.data>=0&&r.data<arr.length&&frontierEnabled)syncRejectedFrontier(arr);
      if (r.error || r.data === -3) { requeue(arr); NET.holdUntil = performance.now() + (r.data === -3 ? 30000 : 6000); }
    }, function () { persistBusy = false; requeue(arr); NET.holdUntil = performance.now() + 6000; });
  }
  setInterval(netPersist, 600);
  document.addEventListener('visibilitychange', function () { if (document.hidden) { if (NET.flushT) { clearTimeout(NET.flushT); netFlush(); } netPersist(); } });
  function plotPut(p, x, y, z, id) {
    if (y < PY0 || y >= G + PH) return;
    if (!plotData[p]) plotData[p] = plotDefault();
    var o = plotOrigin(p); plotData[p][((y - PY0) * PLOT + (z - o.z)) * PLOT + (x - o.x)] = id;
  }
  // 친구가 바꾼 블록을 내 세계에 반영(그림은 한 번에 다시 그림)
  var ARK_ADMINS = {}, adminTouchedMine = false;
  function applyRemote(u, list) {
    var bb = null, lit = []; adminTouchedMine = false;
    NET.applying = true;
    try {
      var fxN = 0;
      for (var i = 0; i < list.length; i++) {
        var e = list[i]; if (!e || e.length !== 4) continue;
        var x = e[0] | 0, y = e[1] | 0, z = e[2] | 0, id = e[3] | 0;
        if (y < YMIN + 1 || y >= SY || x < 0 || z < 0 || x >= WS || z >= WS || (id !== AIR && !B[id])) continue;
        var p = plotAt(x, z);
        if (p >= 0) {
          if (ARK_ADMINS[u]) { plotPut(p, x, y, z, id); if (p === myPlot) adminTouchedMine = true; }   // 관리자가 고친 것은 주인 기기에도 반영
          else {
            if (p === myPlot || (plotUser[p] && plotUser[p] !== u)) continue;   // 그 땅 주인이 바꾼 것만
            plotUser[p] = u; plotOwners[p] = 1; plotPut(p, x, y, z, id);
          }
        } else recordEdit(x, y, z, id);
        var was = readBlock(x, y, z); if (was === id) continue;
        if (u !== 'sync' && fxN < 3 && colAt(x, z)) {   // 가까이에서 다른 사람이 캐거나 놓으면 조각·소리
          var fdx = x + 0.5 - P.x, fdz = z + 0.5 - P.z, fd2 = fdx * fdx + fdz * fdz;
          if (fd2 < 400) { fxN++; if (id === AIR && was !== AIR && B[was]) { burst(x, y, z, was, fd2 > 100); if (fd2 < 144) sfx('break', matSound(was)); } else if (id !== AIR && fd2 < 144) sfx('place', matSound(id)); }
        }
        setRaw(x, y, z, id);
        var c0 = colAt(x, z); updateFrontierMachine(c0,x,y,z,id); if (!c0) continue;
        c0.mod = true; updateSky(x, z);
        if (LIGHTS[was] || LIGHTS[id]) {
          if (LIGHTS[id]) c0.lamps.push([x, y, z]); else c0.lamps = c0.lamps.filter(function (l) { return l[0] !== x || l[1] !== y || l[2] !== z; });
          lit.push([x, y, z]);
        }
        if (!bb) bb = [x, y, z, x, y, z];
        else { bb[0] = Math.min(bb[0], x); bb[1] = Math.min(bb[1], y); bb[2] = Math.min(bb[2], z); bb[3] = Math.max(bb[3], x); bb[4] = Math.max(bb[4], y); bb[5] = Math.max(bb[5], z); }
      }
    } finally { NET.applying = false; }
    if (adminTouchedMine && myPlot >= 0) markDirty();   // 관리자가 내 땅을 고쳤으면 그 모습으로 저장(덮어쓰지 않게)
    lit.forEach(function (l) { lampChanged(l[0], l[1], l[2]); });
    if (bb) rebuildBox(bb[0] - 1, bb[1] - 1, bb[2] - 1, bb[3] + 1, bb[4] + 1, bb[5] + 1);
  }

  // 다시 연결되면(휴대폰 화면이 꺼졌다 켜짐·인터넷이 잠깐 끊김) 그동안 다른 사람이 바꾼 것을 받아 온다
  // — 실시간 알림은 끊겨 있던 동안의 것을 다시 보내 주지 않기 때문(11/19 「A가 판 게 B에게 안 보여요」)
  var resyncBusy = false, plotSeen = {}, hiddenAt = 0;
  function resyncWorld() {
    if (resyncBusy || !client || !me || !NET.ready) return;
    resyncBusy = true;
    var jobs = [];
    var p1 = client.rpc('get_ark_edits').then(function (r) {
      if (!r || r.error || typeof r.data !== 'string' || !r.data) return;
      var byCol = {};
      r.data.split(';').forEach(function (s) {
        var a = s.split(','); if (a.length !== 4) return;
        var x = +a[0], y = +a[1], z = +a[2], id = +a[3];
        if (x < 0 || z < 0 || x >= WS || z >= WS || y < YMIN + 1 || y >= SY || plotAt(x, z) >= 0) return;
        if (NET.pm[x + ',' + y + ',' + z] !== undefined) return;   // 내가 아직 보내는 중인 것은 그대로
        var k = (z >> 5) * NC + (x >> 5), li = (y * CS + (z & 31)) * CS + (x & 31);
        if (EDITS[k] && EDITS[k][li] === id && (!COLS[k] || readBlock(x, y, z) === id)) return;
        (byCol[k] || (byCol[k] = [])).push([x, y, z, id]);
      });
      for (var k in byCol) jobs.push(byCol[k]);
    });
    var p2 = client.from('ark_village_plots').select('plot_idx,data,user_id,updated_at').then(function (r) {
      (r && r.data || []).forEach(function (row) {
        if (!row.data || row.user_id === me.id || plotSeen[row.plot_idx] === row.updated_at) return;
        plotSeen[row.plot_idx] = row.updated_at; plotOwners[row.plot_idx] = 1; plotUser[row.plot_idx] = row.user_id;
        decodePlot(row.plot_idx, row.data, false); jobs.push({ plot: row.plot_idx });
      });
    });
    Promise.all([p1, p2]).then(function () {
      (function step() {   // 한 번에 한 기둥씩(휴대폰이 멈추지 않게)
        var j = jobs.shift(); if (!j) { resyncBusy = false; return; }
        if (j.plot !== undefined) regenPlotCols(j.plot); else applyRemote('sync', j);
        setTimeout(step, 30);
      })();
    }, function () { resyncBusy = false; });
  }
  function regenPlotCols(p) {
    var o = plotOrigin(p);
    for (var cz = (o.z - 1) >> 5; cz <= (o.z + PLOT) >> 5; cz++) for (var cx = (o.x - 1) >> 5; cx <= (o.x + PLOT) >> 5; cx++) {
      var k = cz * NC + cx; if (!inWorldC(cx, cz) || !COLS[k]) continue; var was = meshedCols[k]; genColumn(cx, cz); if (was) { unmeshColumn(cx, cz); meshColumn(cx, cz); }
    }
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) hiddenAt = performance.now();
    else if (hiddenAt && performance.now() - hiddenAt > 15000) { hiddenAt = 0; setTimeout(resyncWorld, 1500); }
  });

  // 처음 들어올 때: 이름·관리자 여부, 함께 쓰는 세계의 바뀐 자리
  function uploadLocalOnce() {
    try { if (localStorage.getItem('arkVillage.editsUp') === '1') return; localStorage.setItem('arkVillage.editsUp', '1'); } catch (e) { return; }
    var n = 0;
    for (var k in EDITS) {
      var cz = Math.floor(k / NC), cx = k % NC, ed = EDITS[k];
      for (var li in ed) {
        if (n >= 1400) return;
        var l = +li, lx = ((l % CS) + CS) % CS, r0 = (l - lx) / CS, lz = ((r0 % CS) + CS) % CS, y = (r0 - lz) / CS, x = cx * CS + lx, z = cz * CS + lz;
        if (y < YMIN + 1 || plotAt(x, z) >= 0 || inArk(x, y, z)) continue;
        NET.pm[x + ',' + y + ',' + z] = ed[li]; n++;
      }
    }
  }
  function loadShared() {
    if (!client || !me) return Promise.resolve();
    return Promise.all([
      client.rpc('get_ark_admin_ids').then(function (r) { if (r && Array.isArray(r.data)) r.data.forEach(function (id) { ARK_ADMINS[id] = 1; }); }, function () {}),
      client.rpc('get_my_ark_name').then(function (r) { if (!r.error && r.data) { NET.nick = r.data.nick || '친구'; NET.admin = !!r.data.admin; NET.ok = true; if (NET.admin) window.__arkDebug = ARK_DBG; document.body.classList.toggle('adm', NET.admin); try { bagChanged(); } catch (e) {} } }, function () {}),
      client.rpc('get_ark_edits').then(function (r) { if (!r.error && typeof r.data === 'string') NET.edits = r.data; }, function () {})
    ]).then(function () {
      if (!NET.ok) return;   // DB 준비 전이면 혼자 놀기 그대로
      uploadLocalOnce();
      if (NET.edits) NET.edits.split(';').forEach(function (s) {
        var a = s.split(','); if (a.length !== 4) return;
        var x = +a[0], y = +a[1], z = +a[2];
        if (plotAt(x, z) >= 0) return;   // 방주 안 고침도 받는다(서버가 관리자만 허용)
        recordEdit(x, y, z, +a[3]); delete NET.pm[x + ',' + y + ',' + z];
      });
      NET.edits = null; NET.ready = true;
      return loadState().then(function () { return client.auth.getSession(); }).then(function (s) {
        try { if (s && s.data && s.data.session) client.realtime.setAuth(s.data.session.access_token); } catch (e) {}
        netConnect();
      });
    }).catch(function () {});
  }
  function netConnect() {
    if (!client || !me || NET.chan) return;
    var ch = NET.chan = client.channel('ark-world', { config: { private: true, presence: { key: me.id }, broadcast: { self: false } } });
    ch.on('broadcast', { event: 'pos' }, function (r) { onPos(r.payload); })
      // 블록 바꿈은 휴대폰끼리 직접 주고받지 않고, 서버가 검사해서 받은 것만(DB 변경 알림)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ark_world_edits' }, function (r) { var w = r.new; if (w && w.user_id !== me.id) queueRemote(w.user_id, [w.x, w.y, w.z, w.id]); })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'ark_world_edits' }, function (r) { var w = r.new; if (w && w.user_id !== me.id) queueRemote(w.user_id, [w.x, w.y, w.z, w.id]); })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'ark_world_edits' }, function (r) { var w = r.old; if (w && w.x !== undefined) queueRevert(w.x, w.y, w.z); })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ark_plot_edits' }, function (r) { var w = r.new; if (w && w.user_id !== me.id) queueRemote(w.user_id, [w.x, w.y, w.z, w.b]); })
      .on('presence', { event: 'sync' }, function () {
        var st = ch.presenceState(); NET.meta = {};
        for (var key in st) if (st[key] && st[key][0]) NET.meta[key] = st[key][0];
        fetchNames(Object.keys(NET.meta));
        for (var u in NET.peers) { if (!NET.meta[u]) peerRemove(u); else peerName(NET.peers[u]); }
        netPill(); if (ui === 'chat') chatWho();
      })
      .on('presence', { event: 'join' }, function (r) {
        var key3 = r.key; NET.sentKey = '';
        if (key3 === me.id || performance.now() - NET.joinedAt <= 4000) return;
        setTimeout(function () {
          if (!NET.meta[key3] || FRIENDS.hidden.has(key3)) return;
          var friend = FRIENDS.accepted.has(key3), n = NET.names[key3];
          if (!n) return;
          chatSys((friend ? '💙 친구 ' : '') + n + ' 님이 들어왔어요');
        }, 600);   // 서버 닉네임을 받은 뒤
      })
      .on('presence', { event: 'leave' }, function (r) {
        var n = NET.names[r.key];
        if (r.key !== me.id && n && !NET.meta[r.key] && !FRIENDS.hidden.has(r.key)) chatSys(n + ' 님이 나갔어요');
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ark_chat' }, function (r) {
        var c = r.new; if (c && c.id) addChat({ id: c.id, nick: c.nick, body: c.body, mine: c.user_id === me.id, uid: c.user_id, reports: 0 }, true);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'ark_chat' }, function (r) { if (r.old && r.old.id) removeChat(r.old.id); })
      .subscribe(function (status) {
        if (status === 'SUBSCRIBED') {
          var first = !NET.ch; NET.ch = ch; NET.on = true; NET.joinedAt = performance.now(); NET.sentKey = '';
          trackMe();
          FRIENDS.poll = 0;
          netPill(); loadChat(); PARTY.pollT = 0;
          if (first) chatSys('함께 놀기에 들어왔어요 — 💬' + (isTouch ? '' : '(T)') + '로 이야기해요');
          else resyncWorld();   // 끊겼다가 다시 붙음: 그동안 바뀐 것 받아 오기
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') { NET.on = false; netPill(); }
      });
  }
  // 이름표에 쓸 닉네임은 서버에서(휴대폰이 보낸 이름을 믿지 않음)
  function fetchNames(ids) {
    var need = ids.filter(function (u) { return !NET.names[u] && !NET.nameAsk[u] && /^[0-9a-f-]{36}$/.test(u); }).slice(0, 50);
    if (!need.length || !client) return;
    need.forEach(function (u) { NET.nameAsk[u] = 1; });
    client.rpc('get_ark_names', { p_ids: need }).then(function (r) {
      (r.data || []).forEach(function (row) { NET.names[row.user_id] = row.nick || '친구'; });
      for (var u in NET.peers) peerName(NET.peers[u]);
      if (ui === 'chat') chatWho();
    }, function () { need.forEach(function (u) { delete NET.nameAsk[u]; }); });
  }
  function netPill() {
    var n = Object.keys(NET.meta).length;
    $('netState').textContent = NET.on ? '👥 ' + Math.max(1, n) + '명 함께' : (NET.ready ? '👥 연결 중…' : '');
  }

  // 채팅
  var CHAT_ERR = { login: '로그인하면 이야기할 수 있어요', empty: '할 말을 써 주세요', long: '60자까지 쓸 수 있어요', slow: '조금 천천히 보내 주세요', same: '같은 말을 여러 번 보낼 수 없어요' };
  function hudChat(c) {
    var box = $('chatLog'), d = document.createElement('div');
    if (c.sys) { d.textContent = c.body; d.style.color = '#b8f0ff'; }
    else { var b = document.createElement('b'); b.textContent = shortName(c.nick, 8) + ': '; if (c.mine) b.className = 'me'; d.appendChild(b); d.appendChild(document.createTextNode(c.body)); d.setAttribute('data-id', c.id); }
    box.appendChild(d); while (box.children.length > 5) box.removeChild(box.firstChild);
    setTimeout(function () { d.classList.add('old'); }, 10000);
    setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 10700);
  }
  function chatSys(t) { hudChat({ sys: true, body: t }); }
  function addChat(c, live) {
    if (NET.chatIds[c.id]) return;
    NET.chatIds[c.id] = 1; NET.chat.push(c);
    NET.chat.sort(function (a, b) { return a.id - b.id; });
    if (NET.chat.length > 60) NET.chat.shift();
    if (live) {
      hudChat(c);
      var p = c.uid && NET.peers[c.uid]; if (p) peerBubble(p, c.body);
      if (!c.mine) sfx('click');
    }
    if (ui === 'chat') renderChat();
  }
  function removeChat(id) {
    NET.chatIds[id] = 1;
    NET.chat = NET.chat.filter(function (c) { return c.id !== id; });
    var el = $('chatLog').querySelector('[data-id="' + (+id) + '"]'); if (el) el.parentNode.removeChild(el);
    if (ui === 'chat') renderChat();
  }
  function loadChat() {
    client.rpc('get_ark_chat_recent').then(function (r) {
      if (r.error || !r.data) return;
      r.data.slice().reverse().forEach(function (c) { addChat({ id: c.id, nick: c.nick, body: c.body, mine: !!c.mine, reports: c.reports || 0 }, false); });
    }, function () {});
  }
  function chatWho() {
    var names = Object.keys(NET.meta).map(function (k) { return shortName(k === (me && me.id) ? NET.nick : (NET.names[k] || '친구'), 6); });
    $('chatWho').textContent = NET.on ? '· 지금 ' + names.length + '명: ' + names.slice(0, 8).join(', ') + (names.length > 8 ? ' …' : '') : (me ? '· 연결하는 중…' : '');
  }
  function renderChat() {
    var L = $('chatList'); L.innerHTML = ''; chatWho();
    if (!NET.chat.length) {
      var em = document.createElement('div'); em.className = 'empty';
      em.textContent = !me ? '로그인하면 함께 이야기할 수 있어요' : (NET.on ? '아직 이야기가 없어요. 먼저 인사해 보세요!' : '함께 놀기에 연결하는 중이에요…');
      L.appendChild(em); return;
    }
    NET.chat.forEach(function (c) {
      var row = document.createElement('div'); row.className = 'cm';
      var b = document.createElement('b'); b.textContent = shortName(c.nick, 8) + ':'; if (c.mine) b.className = 'me';
      var s = document.createElement('span'); s.textContent = ' ' + c.body;
      row.appendChild(b); row.appendChild(s);
      if (NET.admin && c.reports) { var sm = document.createElement('small'); sm.textContent = '신고 ' + c.reports; row.appendChild(sm); }
      function btn(t, title, fn) { var x = document.createElement('button'); x.className = 'mc'; x.textContent = t; x.title = title; x.setAttribute('aria-label', title); x.addEventListener('click', function (e) { e.stopPropagation(); fn(); }); row.appendChild(x); return x; }
      if (!c.mine && !NET.reported[c.id]) btn('🚩', '신고', function () { reportChat(c); });
      if (NET.admin) { btn('🗑', '지우기', function () { adminRemove(c, 0); }); btn('🔇', '지우고 30분 말하기 금지', function () { adminRemove(c, 30); }); }
      L.appendChild(row);
    });
    L.scrollTop = L.scrollHeight;
  }
  function openChat() {
    if (!me) { toast('로그인하면 친구들과 이야기할 수 있어요'); return; }
    if (!NET.ok) { toast('함께 놀기를 준비하는 중이에요. 조금 뒤에 다시 눌러 주세요'); return; }
    openPanel('chat'); tutorialEvent('chat'); renderChat(); sfx('click');
    if (!isTouch) setTimeout(function () { $('chatInput').focus(); }, 30);
  }
  var chatBusy = false;
  function sendChat() {
    var inp = $('chatInput'), t = inp.value.replace(/\s+/g, ' ').trim();
    if (!t || chatBusy) return;
    if (!client || !me || !NET.ok) { toast(CHAT_ERR.login); return; }
    if (Array.from(t).length > 60) { toast(CHAT_ERR.long); return; }
    chatBusy = true;
    client.rpc('send_ark_chat', { p_body: t }).then(function (r) {
      chatBusy = false;
      var d = r && r.data;
      if (r.error || !d) { toast('보내지 못했어요 — 인터넷을 확인해 주세요'); return; }
      if (d.error) {
        if (d.error === 'muted') { var u = new Date(d.until); toast('선생님이 잠시 채팅을 멈췄어요 (' + u.getHours() + ':' + ('0' + u.getMinutes()).slice(-2) + '까지)'); }
        else if (d.error === 'bad') {   // 서버가 욕설을 막음 — 보낸 사람에게만 보임
          toast('🕊 이 글은 보내지 않았어요 — 고운 말로 다시 써 볼까요?');
          chatSys('🕊 「무릇 더러운 말은 너희 입 밖에도 내지 말고 오직 덕을 세우는 데 소용되는 대로 선한 말을 하여 듣는 자들에게 은혜를 끼치게 하라」 (에베소서 4:29)');
        }
        else toast(CHAT_ERR[d.error] || '보내지 못했어요');
        return;
      }
      inp.value = ''; unlock('chat');
      addChat({ id: d.id, nick: NET.nick, body: t, mine: true, uid: me.id, reports: 0 }, true);
    }, function () { chatBusy = false; toast('보내지 못했어요 — 인터넷을 확인해 주세요'); });
  }
  function reportChat(c) {
    if (!window.confirm('「' + shortName(c.body, 30) + '」\n이 글을 신고할까요? 세 사람이 신고하면 가려지고 선생님이 볼 수 있어요.')) return;
    client.rpc('report_ark_chat', { p_id: c.id }).then(function (r) {
      if (r.error) { toast('신고하지 못했어요'); return; }
      NET.reported[c.id] = 1;
      toast(r.data >= 3 ? '신고가 모여서 글을 가렸어요' : (r.data === -2 ? '내 글은 신고할 수 없어요' : '신고했어요. 고마워요'));
      if (r.data >= 3) removeChat(c.id); else if (ui === 'chat') renderChat();
    }, function () { toast('신고하지 못했어요'); });
  }
  function adminRemove(c, mins) {
    if (!window.confirm(mins ? '이 글을 지우고 쓴 사람의 채팅을 ' + mins + '분 동안 멈출까요?' : '이 글을 지울까요?')) return;
    client.rpc('admin_remove_ark_chat', { p_id: c.id, p_mute_minutes: mins }).then(function (r) {
      if (r.error || !r.data) { toast('지우지 못했어요'); return; }
      removeChat(c.id); toast(mins ? '지우고 ' + mins + '분 동안 멈췄어요' : '지웠어요');
    }, function () { toast('지우지 못했어요'); });
  }

  var villageBook = loadVillageBook('guest'), villageTab = 'build', visitMarks = [];
  function villageBookKey(id) { return 'arkVillage.notebook.' + id; }
  function loadVillageBook(id) {
    var data;
    try { data=JSON.parse(localStorage.getItem(villageBookKey(id))||'null'); } catch(e){}
    if(!data||typeof data!=='object')data={};
    if(!Array.isArray(data.pins))data.pins=[];
    return data;
  }
  function saveVillageBook() {
    try { localStorage.setItem(villageBookKey(me ? me.id : 'guest'), JSON.stringify(villageBook)); } catch (e) {}
  }
  function allVillagePins(){return villageBook.pins.concat(visitMarks);}
  function villageButton(parent, label, action) {
    var button = document.createElement('button');
    button.className = 'mc'; button.textContent = label;
    button.addEventListener('click', action); parent.appendChild(button);
    return button;
  }
  function villageText(parent, text, tag) {
    var node = document.createElement(tag || 'p'); node.textContent = text; parent.appendChild(node); return node;
  }
  function addVillagePin(label,x,z) {
    if (villageBook.pins.length >= 12) { toast('표시는 12곳까지 남길 수 있어요'); return false; }
    var pin = { id: Date.now().toString(36) + Math.random().toString(36).slice(2,5), label: label, x: Math.floor(x), z: Math.floor(z) };
    villageBook.pins.push(pin); villageBook.target = pin.id; saveVillageBook(); renderPins(); return true;
  }
  function renderPins() {
    var sel = $('mapPins'); sel.replaceChildren();
    [['','따라갈 장소 고르기']].concat(allVillagePins().map(function (p) { return [p.id,p.label]; })).forEach(function (pair) {
      var choice = document.createElement('option'); choice.value=pair[0]; choice.textContent=pair[1]; sel.appendChild(choice);
    });
    sel.value = villageBook.target || '';
    $('mapPinRemove').disabled=!villageBook.pins.some(function(p){return p.id===villageBook.target;});
  }
  function drawVillagePins(ctx,ox,oz,sc,w,h) {
    allVillagePins().forEach(function (p) {
      var x=(p.x-ox)*sc,y=(p.z-oz)*sc;
      if (x < 0 || y < 0 || x > w || y > h) return;
      ctx.fillStyle=p.id===villageBook.target?'#ffdb61':'#77dac1';
      ctx.beginPath(); ctx.moveTo(x,y+5); ctx.lineTo(x-5,y-4); ctx.lineTo(x+5,y-4); ctx.closePath(); ctx.fill();
    });
  }
  function pinnedRecipe() {
    var p=villageBook.recipe, r=p&&RECIPES[p.index];
    return r && r.out[0]===p.id ? r : null;
  }
  function renderMaterialGuide() {
    var p=allVillagePins().find(function (x) { return x.id===villageBook.target; }), r=pinnedRecipe(), text=[];
    if (p) {
      var bearing=Math.atan2(p.x-P.x,-(p.z-P.z)), direction=['북','북동','동','남동','남','남서','서','북서'][(Math.round(bearing/(Math.PI/4))+8)%8];
      var dist=Math.round(Math.hypot(p.x-P.x,p.z-P.z)); text.push(p.label+' '+(dist<=2?'도착':direction+'쪽 '+dist+'칸'));
    }
    if (r) text.push(nameOf(r.out[0])+' · '+r.need.map(function (n) {return nameOf(n[0])+' '+Math.min(have(n[0]),n[1])+'/'+n[1];}).join(' · '));
    $('trailGuide').textContent=text.join(' / ');
  }
  var BLUEPRINTS=[['작은 집',7,6],['양 우리',9,7],['빵집',8,7],['성막 모형',22,12]], blueprintMesh, blueprintAt=0;
  function blueprintCells(plan) {
    if (plan && plan.kind === 'custom') return customPlanCells(plan);
    if (!plan || !BLUEPRINTS[plan.kind] || plan.plot!==myPlot) return [];
    var def=BLUEPRINTS[plan.kind], w=def[1], l=def[2], p=plotOrigin(plan.plot), a=[];
    var ox=p.x+plan.x, oz=p.z+plan.z;
    function add(x,y,z,id) { a.push([ox+x,G+y,oz+z,id]); }
    if (plan.kind===3) { tabernacleCells(add); return a; }
    for (var z=0; z<l; z++) for (var x=0; x<w; x++) {
      var border=x===0||z===0||x===w-1||z===l-1, entry=z===0&&x===Math.floor(w/2);
      if (plan.kind===1) { if (border&&!entry) add(x,0,z,FENCE); else if(entry) add(x,0,z,GATE); continue; }
      add(x,-1,z,plan.kind===2?BRICK:GOPHER);
      if (border) for (var y=0;y<4;y++) {
        if(entry) add(x,y,z,DOOR); else add(x,y,z,plan.kind===2?BRICK:GOPHER);
      }
      add(x,4,z,FLAT_ROOF);
    }
    if(plan.kind===2) add(w-2,0,l-2,OVEN);
    return a;
  }
  function matchesPlan(expected,id) {
    var s=SHAPE[id]; return id===expected || (s && s.base===expected) || (expected===RAIL0 && s && s.type==='mrail') ||
      (expected===GATE && s && s.type==='gate');
  }
  function createBlueprintMesh() {
    blueprintMesh=new THREE.InstancedMesh(new THREE.BoxGeometry(.98,.98,.98),
      new THREE.MeshBasicMaterial({color:0x7bccea,transparent:true,opacity:.25,depthWrite:false}),600);
    blueprintMesh.frustumCulled=false; blueprintMesh.count=0; scene.add(blueprintMesh);
  }
  var blueprintMatrix = new THREE.Matrix4();
  function tickBlueprint(now) {
    if(now<blueprintAt) return;
    blueprintAt=now+350;
    if(!blueprintMesh) return;
    var plan=villageBook.plan, cells=plotAt(Math.floor(P.x),Math.floor(P.z))===myPlot?blueprintCells(plan):[];
    var project=VILLAGE_PROJECTS[villageBook.project];
    if(project && villageProjectsEnabled && inCommons(P.x,P.z)) cells=projectCells(villageBook.project);
    var count=0;
    cells.forEach(function (c) {
      if(matchesPlan(c[3],get(c[0],c[1],c[2])) || count>=600) return;
      blueprintMatrix.makeTranslation(c[0]+.5,c[1]+.5,c[2]+.5);
      blueprintMesh.setMatrixAt(count++,blueprintMatrix);
    });
    blueprintMesh.count=count; if(count) blueprintMesh.instanceMatrix.needsUpdate=true;
    if (plan && plan.kind===3 && cells.length && count===0 && !ACH.tabernacle && plotAt(Math.floor(P.x),Math.floor(P.z))===myPlot) {
      unlock('tabernacle'); showVerseCard('☁', '성막을 다 지었어요', '구름이 회막에 덮이고 여호와의 영광이 성막에 충만하매', '출애굽기 40:34', '성막 모형을 완성했어요');
    }
  }
  // 성막 모형(출 25~40장): 바깥 뜰 휘장, 동쪽 뜰 문(청·자·홍, 출 27:16), 놋 제단, 물두멍, 성막(성소·지성소, 언약궤·촛대)
  function tabernacleCells(add) {
    var W = 22, L = 12, x, y, z;
    for (x = 0; x < W; x++) for (z = 0; z < L; z++) {
      var edge = x === 0 || z === 0 || x === W - 1 || z === L - 1; if (!edge) continue;
      for (y = 0; y < 2; y++) {
        if (x === W - 1 && z >= 4 && z <= 7) add(x, y, z, [WOOL_B, WOOL_V, WOOL_R, WOOL_W][z - 4]);   // 뜰 문 휘장
        else add(x, y, z, WOOL_W);   // 세마포 휘장
      }
    }
    add(16, 0, 5, BLK_CU); add(17, 0, 5, BLK_CU); add(16, 0, 6, BLK_CU); add(17, 0, 6, BLK_CU);   // 놋 제단
    add(13, 0, 5, JAR);   // 물두멍
    for (x = 2; x <= 9; x++) for (z = 4; z <= 7; z++) {
      var wall = x === 2 || x === 9 || z === 4 || z === 7;
      if (wall) for (y = 0; y < 4; y++) { if (x === 9 && (z === 5 || z === 6)) { if (y < 3) add(x, y, z, WOOL_V); } else add(x, y, z, GOPHER); }
      add(x, 4, z, WOOL_R);   // 붉은 덮개(출 26:14)
    }
    for (y = 0; y < 3; y++) { add(5, y, 5, WOOL_B); add(5, y, 6, WOOL_B); }   // 성소와 지성소 사이 휘장
    add(3, 0, 5, BLK_AU);   // 언약궤
    add(8, 0, 5, CANDLESTICK);   // 촛대
  }
  function startBlueprint(kind) {
    if(myPlot<0) return toast('로그인하고 내 땅을 먼저 받아요');
    var o=plotOrigin(myPlot), d=BLUEPRINTS[kind];
    villageBook.plan={kind:kind,plot:myPlot,x:Math.max(1,Math.min(PLOT-d[1]-1,Math.floor(P.x)-o.x)),z:Math.max(1,Math.min(PLOT-d[2]-1,Math.floor(P.z)-o.z))};
    saveVillageBook(); renderVillageWork();
    if (kind===3) showVerseCard('⛺', '성막 모형', '내가 그들 중에 거할 성소를 그들이 나를 위하여 짓되', '출애굽기 25:8', '무릇 내가 네게 보이는 모양대로 장막을 짓고 기구들도 그 모양을 따라 지을지니라 (출 25:9) — 반투명 윤곽을 따라 지어요');
  }
  var villageTabs = [['news','✨ 새 기능'],['build','설계도'],['materials','재료'],['discover','탐험'],['projects','공동 작업'],['neighbors','마을 사람'],['cargo','나귀 짐'],['showcase','집 구경'],['frontier','개척 땅'],['feed','마을 소식'],['gifts','선물'],['photos','사진']];
  function openVillageWork(tab) { villageTab=tab; openPanel('villageWork'); renderVillageWork(); if(tab==='projects'||tab==='neighbors')fetchVillageProjects(); }
  var VILLAGE_GROUPS=[['🔨 짓기',['build','materials','projects','frontier']],['🏘 마을',['news','neighbors','cargo','discover']],['🤝 함께',['showcase','feed','gifts','photos']]];
  function renderVillageWork() {
    var tabs=$('villageTabs'), body=$('villageBody'); tabs.replaceChildren(); body.replaceChildren();
    // 탭은 두 줄: 위는 묶음(짓기·마을·함께), 아래는 고른 묶음의 탭만
    function tabFetch() { if(villageTab==='projects'||villageTab==='neighbors')fetchVillageProjects(); if(villageTab==='frontier')fetchFrontier(true); if(villageTab==='feed')fetchFeed(true); if(villageTab==='gifts')fetchGifts(true); if(villageTab==='photos')fetchPhotos(true); if(villageTab==='build')fetchPlans(true); }
    var curG=VILLAGE_GROUPS.filter(function (g) { return g[1].indexOf(villageTab)>=0; })[0]||VILLAGE_GROUPS[0];
    var gRow=document.createElement('div'); gRow.className='vgroups'; tabs.appendChild(gRow);
    VILLAGE_GROUPS.forEach(function (g) {
      var b=villageButton(gRow,g[0],function () { if(g===curG) return; villageTab=g[1][0]; renderVillageWork(); tabFetch(); });
      b.setAttribute('aria-pressed',String(g===curG));
    });
    var sRow=document.createElement('div'); sRow.className='vsub'; tabs.appendChild(sRow);
    villageTabs.forEach(function (tab) {
      if(curG[1].indexOf(tab[0])<0) return;
      var b=villageButton(sRow,tab[1],function () { villageTab=tab[0]; renderVillageWork(); tabFetch(); });
      b.setAttribute('aria-pressed',String(villageTab===tab[0]));
    });
    if(villageTab==='build') {
      villageText(body,'내 땅에 설계도를 표시하고 반투명 윤곽을 따라 지어 봐요.');
      BLUEPRINTS.forEach(function (row,i) { villageButton(body,row[0],function () { startBlueprint(i); }); });
      var plan=villageBook.plan;
      if(plan&&BLUEPRINTS[plan.kind]&&plan.plot===myPlot) {
        var remaining={}, cells=blueprintCells(plan), total=0;
        cells.forEach(function (c) { if(!matchesPlan(c[3],get(c[0],c[1],c[2]))) { remaining[c[3]]=(remaining[c[3]]||0)+1; total++; } });
        villageText(body, BLUEPRINTS[plan.kind][0]+' '+(cells.length-total)+'/'+cells.length);
        Object.keys(remaining).forEach(function (id) { villageText(body,nameOf(+id)+' '+(id==DOOR?Math.ceil(remaining[id]/4):remaining[id])+'개 · '+howGet(+id)); });
        villageButton(body,'설계도 지우기',function () {delete villageBook.plan; saveVillageBook(); renderVillageWork();});
      }
      if(plan&&plan.kind==='custom'&&plan.plot===myPlot) {
        var cc=customPlanCells(plan), left=0, need={};
        cc.forEach(function (c) { if(!matchesPlan(c[3],get(c[0],c[1],c[2]))) { left++; need[c[3]]=(need[c[3]]||0)+1; } });
        villageText(body,(plan.nick?plan.nick+'님의 ':'')+plan.name+' '+(cc.length-left)+'/'+cc.length);
        Object.keys(need).slice(0,12).forEach(function (id) { villageText(body,nameOf(+id)+' '+need[id]+'개 · '+howGet(+id)); });
        villageButton(body,'설계도 지우기',function () {delete villageBook.plan; saveVillageBook(); renderVillageWork();});
      }
      renderPlanShare(body);
    } else if(villageTab==='news') {
      renderNews(body);
    } else if(villageTab==='materials') {
      var r=pinnedRecipe();
      if(!r) return villageText(body,'가방의 만들기 목록에서 「재료 표시」를 눌러요.');
      villageText(body,nameOf(r.out[0]),'h3');
      r.need.forEach(function (n) { villageText(body,nameOf(n[0])+' '+Math.min(n[1],have(n[0]))+'/'+n[1]+' · '+howGet(n[0])); });
      villageButton(body,'재료 표시 끄기',function () {delete villageBook.recipe; saveVillageBook(); renderVillageWork();});
    } else {
      renderVillageExtras(villageTab,body);
    }
  }
  // ── 새 기능 안내(11/20): 해 보면 저절로 ✅ — 처음 들어오면 한 번 알림, 메뉴의 「✨ 새 기능」·마을 수첩에서 봄 ──
  var NEWS_VER = 9, NEWS = [
    ['boat', '⛵', '배', '고페르 나무 5 + 역청 칠한 나무 1로 배를 만들어요(창 6:14). 배를 들고 물 위를 누르면 띄워서 타요 — 헤엄보다 세 배 빨라 섬에 가기 좋아요. 물에서는 가만히 있으면 가라앉고, 점프를 누르면 떠올라요. 오래 잠기면 숨이 막혀요.', 291],
    ['bigworld', '🗺', '두 배로 넓어진 세상', '세상이 동쪽·남쪽으로 두 배 넓어졌어요. 눈 덮인 헐몬 산, 동쪽 큰 숲, 갈릴리 호수와 요단 강, 시내 산, 푸른 들판, 남쪽 큰 바다와 섬을 찾아가 보세요.', 0],
    ['isles', '🏝', '북쪽 바다의 섬', '북쪽 바다에 밧모섬(계 1:9)·멜리데섬(행 28:1)·구브로섬(행 13:4)과 작은 섬들이 생겼어요. 작은 지도를 누르고 섬을 고르면 길을 알려 줘요.', 0],
    ['arms', '⚔', '광물 무기와 방패', '돌·구리·은·금·호마노·청옥·금강석으로 검·방패·물매·활·화살을 만들어요(제작대). 좋은 재료일수록 더 세게 치고 더 잘 막아요. 물매는 매끄러운 돌을 던져요.', 262],
    ['guide', '🧭', '길 안내와 좌표', '작은 지도를 누르고 갈 곳을 고르면 순간이동 대신 화살표가 길을 알려 줘요. 작은 지도 아래에 지금 좌표(X·Z, 높이 Y)가 보여요.', 0],
    ['deep', '⛏', '더 깊은 땅속', '땅속이 32칸 더 깊어졌어요(바닥 y -32). 금은 y -8 아래, 청옥은 -16 아래, 금강석은 맨 아래 깊은 돌 층에서 나와요.', 0],
    ['onyx', '🟣', '호마노 도구', '철과 금강석 사이에 호마노 곡괭이·도끼·삽·칼이 생겼어요. 호마노는 철 곡괭이로 캐고, 청옥·금강석은 호마노 곡괭이가 있어야 캐요.', TOOL_ONYX],
    ['quest', '📜', '퀘스트', '왼쪽 위 「📜 부탁」이나 메뉴의 「📜 퀘스트」에서 오늘의 부탁 셋·모험·땅 밟기를 봐요. 다 들어주면 보상을 받아요.', 0],
    ['south', '🌲', '남쪽 새 땅', '마을 남쪽 멀리 백향목 숲·광야·소금 바다가 생겼어요. 광야에는 성막, 숲에는 망대, 바닷가에는 나그네 장막촌이 있어요.', 0],
    ['vein', '💎', '광맥', '광석을 캐면 반짝이며, 이어진 광석이 있으면 잠깐 비춰 줘요.', 0],
    ['crit', '✦', '강한 일격', '뛰어올라 떨어지면서 그림자를 치면 더 세게 쳐요. 성령의 검은 앞쪽 그림자를 함께 쳐요. 그림자가 몸을 젖히면 곧 덮치니 물러서요.', 0],
    ['bow', '🏹', '활과 화살', '활을 들고 화면을 꾹 눌러 당기고, 떼면 쏴요. 오래 당길수록 멀리·세게 날아가요.', BOW],
    ['shield', '🛡', '방패로 불화살 막기', '방패를 차면 「의심」이 쏘는 불화살을 앞에서 막아요. 믿음의 방패는 모두 막아요(엡 6:16).', 0],
    ['faith', '✦', '믿음', '그림자에게 맞으면 믿음이 깎여요. 말씀 두루마리를 읽거나 제단에서 기도하면 다시 차고, 파티원과 함께면 덜 깎여요.', 0],
    ['cart', '🛒', '레일과 수레', '레일을 이어 깔고, 수레를 들고 레일을 누르면 타요. 금빛 빠른 레일은 더 빨라요.', RAIL0],
    ['trap', '🚪', '다락문', '바닥이나 천장 쪽에 놓고 누르면 위로 열려요.', TRAP],
    ['frame', '🖼', '액자', '벽 옆면에 걸고, 손에 든 것을 들고 누르면 걸어 둬요. 다른 사람도 봐요.', FRAME],
    ['photo', '📷', '사진 저장', '메뉴의 「📷 사진 저장」을 누르면 지금 화면을 내 폰에 저장해요.', 0],
    ['drop', '🫳', '길게 눌러 버리기', '아래 단축 칸을 길게 누르면 1개, 더 오래 누르면 한 묶음을 버려요.', 0],
    ['sneak', '🧎', '웅크리기', '방향키 가운데를 톡톡 두 번 누르면 웅크려서 가장자리에서 떨어지지 않아요.', 0],
    ['btn', '📱', '버튼 크기', '메뉴 → 설정에서 버튼 크기를 작게·보통·크게로 바꿔요.', 0],
    ['plotname', '🪧', '땅 팻말', '내 땅 앞 모서리에 「이름님의 땅」 팻말이 서요. 마을 수첩 → 함께 → 집 구경에서 팻말 글을 직접 써요(16자).', 0]
  ];
  var NEWS_DONE = {}; try { NEWS_DONE = JSON.parse(localStorage.getItem('arkVillage.newsDone') || '{}') || {}; } catch (e) { NEWS_DONE = {}; }
  function newsMark(k) {
    if (NEWS_DONE[k]) return; NEWS_DONE[k] = 1; try { localStorage.setItem('arkVillage.newsDone', JSON.stringify(NEWS_DONE)); } catch (e) {}
    if (NEWS.every(function (n) { return NEWS_DONE[n[0]]; })) setTimeout(function () { toast('✨ 새 기능을 다 해 봤어요!'); }, 1200);
    if (ui === 'villageWork' && villageTab === 'news') renderVillageWork();
    updateMenuLabels();
  }
  function newsLeft() { return NEWS.filter(function (n) { return !NEWS_DONE[n[0]]; }).length; }
  function renderNews(body) {
    if (S.newsSeen !== NEWS_VER) { S.newsSeen = NEWS_VER; saveSettings(); updateMenuLabels(); }
    villageText(body, '✨ 새로 생긴 것 ' + NEWS.length + '가지 — 해 보면 ✅ 표시가 돼요 (' + (NEWS.length - newsLeft()) + '/' + NEWS.length + ')');
    NEWS.forEach(function (n) {
      villageText(body, (NEWS_DONE[n[0]] ? '✅ ' : '⬜ ') + n[1] + ' ' + n[2], 'h3');
      villageText(body, n[3]);
      var rc = n[4] ? RECIPES.filter(function (r) { return r.out[0] === n[4]; })[0] : null;
      if (rc) villageButton(body, nameOf(n[4]) + ' 재료 표시', function () { villageBook.recipe = { id: rc.out[0], index: RECIPES.indexOf(rc) }; saveVillageBook(); renderMaterialGuide(); toast('마을 수첩에 ' + nameOf(rc.out[0]) + ' 재료를 표시했어요'); });
    });
  }
  var newsTold = false, newsT = 0;
  function newsTick() {   // 1초마다: 들어온 지 6초 뒤 한 번 알림
    if (newsTold || !started || ui !== 'play' || S.newsSeen === NEWS_VER) return;
    if (++newsT < 6) return;
    newsTold = true; toast('✨ 새 기능 ' + NEWS.length + '가지 — 메뉴 → ✨ 새 기능');
  }
  var VILLAGE_SITES = [
    { name:'사막의 옛 우물',x:1510,z:811,r:7,style:'well',item:FIND_POT,clue:'동쪽 사막의 북쪽에서 돌 테두리를 찾아요.' },
    { name:'서쪽 언덕의 옛집',x:779,z:1038,r:7,style:'house',item:FIND_LAMP,clue:'서쪽 산에서 남쪽으로 이어지는 바위 언덕을 찾아요.' },
    { name:'바위틈 샘',x:1160,z:1210,r:7,style:'spring',item:FIND_SEED,clue:'남쪽 호수의 동남쪽, 낮은 바위 사이를 찾아요.' }
  ];
  var VILLAGE_EXHIBITS = {
    501:['토기 조각','흙으로 만든 그릇에는 물과 곡식, 기름을 담았어요. 조각의 모양을 보면 그릇이 얼마나 컸는지 짐작할 수 있어요.'],
    502:['기름 등잔','작은 그릇에 기름을 담고 심지를 밝혀 어두운 방을 비췄어요.'],
    503:['옛 씨앗','사람들은 다음 철에 심을 씨앗을 따로 보관했어요. 씨앗은 무엇을 길렀는지 알려 줘요.']
  };
  function protectedExcursion(x,z) {
    return ferryPiers.some(function(p){return p.x===x&&p.z===z;}) ||
      VILLAGE_SITES.some(function (s) {return Math.abs(x-s.x)<=s.r && Math.abs(z-s.z)<=s.r;});
  }
  function buildExcursions(x0,z0) {
    VILLAGE_SITES.forEach(function (s) {
      if(s.x+s.r<x0||s.z+s.r<z0||s.x-s.r>=x0+CS||s.z-s.r>=z0+CS) return;
      terrain(s.x,s.z); var y=T.h+1, x=s.x,z=s.z;
      fill(x-4,y-1,z-4,x+4,y-1,z+4,PATH);
      fill(x-4,y,z-4,x+4,y+3,z+4,AIR);
      if(s.style==='well') {
        fill(x-3,y,z-3,x+3,y,z+3,STONE);
        fill(x-2,y,z-2,x+2,y,z+2,WATER);
        setRaw(x,y+1,z-3,FIND_MARK);
      } else if(s.style==='house') {
        fill(x-3,y,z-3,x+3,y+1,z-3,BRICK);
        fill(x-3,y,z-3,x-3,y+1,z+2,BRICK);
        fill(x+1,y,z+1,x+3,y,z+3,STONE);
        setRaw(x,y,z,FIND_MARK);
      } else {
        fill(x-3,y,z-3,x+3,y+3,z-2,STONE);
        fill(x-3,y,z-2,x-2,y+2,z+3,STONE);
        fill(x-2,y+3,z-2,x+3,y+4,z+2,STONE);
        fill(x+3,y,z-2,x+3,y+2,z+1,STONE);
        fill(x-1,y,z-1,x+1,y,z+1,WATER);
        setRaw(x+2,y,z+2,FIND_MARK);
      }
    });
    ferryPiers.forEach(function (p) {
      if (p.x<x0||p.x>=x0+CS||p.z<z0||p.z>=z0+CS) return;
      setRaw(p.x, surfaceY(p.x,p.z), p.z, FERRY_POST);
    });
  }
  function showVillageFind(id) {
    var entry=VILLAGE_EXHIBITS[id];
    $('cardEmoji').textContent='🏺'; $('cardName').textContent=entry[0]; $('cardText').textContent=entry[1];
    $('cardRef').textContent='고대 마을 전시'; $('cardNew').textContent=''; $('card').classList.add('show');
    clearTimeout(cardT); cardT=setTimeout(function () {$('card').classList.remove('show');},12000);
  }
  function useVillageBlock(id,h) {
    if(id===FERRY_POST) return startFerry(h);
    if(id===FEAST_TABLE) {
      var held=HOTBAR[sel], serving=held===FLATBREAD||held===BREAD?FEAST_BREAD:(held===614?FEAST_OLIVE:(held===COOKED_FISH?FEAST_FISH:0));
      if(!serving||!have(held)) return toast('빵이나 올리브, 구운 생선을 들고 식탁을 눌러요');
      if(!inMyPlot(h.x,h.z)&&!inCommons(h.x,h.z)) return deny('내 땅이나 함께 짓는 터에서 차려요');
      var why=canPlace(h.x,h.y+1,h.z,serving);
      if(why) return deny(why);
      if(get(h.x,h.y+1,h.z)!==AIR) return toast('이미 음식이 놓여 있어요');
      take(held,1); setBlock(h.x,h.y+1,h.z,serving); bagChanged(); return toast('함께 먹을 음식을 차렸어요');
    }
    if(id!==FIND_MARK) return showVillageFind(id);
    var find=VILLAGE_SITES.find(function (s) {return Math.abs(h.x-s.x)<=s.r&&Math.abs(h.z-s.z)<=s.r;});
    if(!find) return;
    var found=villageBook.found || (villageBook.found={});
    if(!found[find.item]) {
      if(!give(find.item,1)) return bagFull();
      found[find.item]=true; saveVillageBook(); bagChanged();
    }
    showVillageFind(find.item);
  }
  function villageWaterRegion(x,z) {
    if(z<SEA_Z+8) return '바다';
    if(lakeE(x,z)<1.2) return '호수';
    if(riverDist(x,z)<9) return '강';
    return null;
  }
  function recordVillageFish(region,count) {
    if(!region) return;
    var fish=villageBook.fish || (villageBook.fish={}); fish[region]=(fish[region]||0)+count; saveVillageBook();
  }
  function recordVillagePlant(id,x,z) {
    var plants=villageBook.plants || (villageBook.plants={});
    if(!plants[id]) { plants[id]=placeName(); saveVillageBook(); }
  }
  function ditchWaterNear(x,y,z) {
    return ditchHasSource(x,y-1,z) || ditchHasSource(x,y,z);
  }
  function ditchHasSource(x,yy,z) {
    var todo=[], visited=new Set(), steps=[[1,0],[-1,0],[0,1],[0,-1]];
    for(var dx=-4;dx<=4;dx++)for(var dz=-4;dz<=4;dz++)if(get(x+dx,yy,z+dz)===DITCH)todo.push([x+dx,z+dz,0]);
    for(var i=0;i<todo.length && i<180;i++){
      var q=todo[i],key=q[0]+','+q[1];
      if(visited.has(key))continue;
      visited.add(key);
      if(get(q[0],yy-1,q[1])===WATER)return true;
      for(var j=0;j<4;j++){
        var ax=q[0]+steps[j][0],az=q[1]+steps[j][1],b=get(ax,yy,az);
        if(b===WATER||get(ax,yy-1,az)===WATER)return true;
        if(b===DITCH && q[2]<12 && !visited.has(ax+','+az))todo.push([ax,az,q[2]+1]);
      }
    }
    return false;
  }
  var ferryPiers=[{x:1024,z:1150},{x:1024,z:1199}], ferryRide=null, ferryMesh;
  function startFerry(h) {
    if(ferryRide) return;
    var p=ferryPiers[0], q=ferryPiers[1];
    if(Math.abs(h.z-q.z)<Math.abs(h.z-p.z)){p=ferryPiers[1];q=ferryPiers[0];}
    if(riding)dismount(true);
    if(!ferryMesh){
      ferryMesh=new THREE.Mesh(mergedBoxes([[2.1,.25,3.6,0x7a4e2e,0,0,0],[.18,.5,3.4,0x96603a,-1,.26,0],[.18,.5,3.4,0x96603a,1,.26,0],[1.8,.45,.22,0x865630,0,.25,1.6],[1.8,.45,.22,0x865630,0,.25,-1.6]]),avatarMat);
      scene.add(ferryMesh);
    }
    ferryMesh.visible=true; ferryRide={from:p,to:q,t:0};
    P.yaw=q.z>p.z?Math.PI:0; P.pitch=-.08; toast('나룻배로 호수를 건너요');
  }
  // ── 수레(11/20, 마인크래프트 수레처럼): 레일을 따라 굴러감. 앞으로 = 바라보는 쪽으로 밀기, 비탈은 내려가며 빨라짐.
  //    내리기 = Shift·「내리기」 버튼·방향키 가운데 톡톡 — 내리면 수레는 가방으로 ──
  var RDX = [0, 1, 0, -1], RDZ = [-1, 0, 1, 0], RAIL_CONN = [[0, 2], [1, 3], [0, 1], [1, 2], [2, 3], [3, 0], [0, 2], [1, 3], [0, 2], [1, 3]];
  var cartRide = null, cartMesh = null, cartClackT = 0;
  function railAt(x, y, z) { var id = get(x, y, z); return id >= RAIL0 && id < RAIL0 + 10 ? id - RAIL0 : (id >= RAILF0 && id < RAILF0 + 10 ? id - RAILF0 : -1); }
  function railBaseAt(x, y, z) { var id = get(x, y, z); return id >= RAILF0 && id < RAILF0 + 10 ? RAILF0 : RAIL0; }
  function railHas(s, d) { return RAIL_CONN[s][0] === d || RAIL_CONN[s][1] === d; }
  function railNeighbor(x, y, z, d) {   // d쪽 옆 레일: 같은 높이 → 한 칸 위 → 한 칸 아래
    var nx = x + RDX[d], nz = z + RDZ[d];
    for (var k = 0; k < 3; k++) { var dy = [0, 1, -1][k], s = railAt(nx, y + dy, nz); if (s >= 0) return { x: nx, y: y + dy, z: nz, s: s, up: dy }; }
    return null;
  }
  function railLinks(x, y, z) { var s = railAt(x, y, z); if (s < 0) return 0; var n = 0; RAIL_CONN[s].forEach(function (d) { var nb = railNeighbor(x, y, z, d); if (nb && railHas(nb.s, (d + 2) % 4)) n++; }); return n; }
  function railShapeFor(x, y, z, look) {
    var cand = [];
    for (var d = 0; d < 4; d++) { var nb = railNeighbor(x, y, z, d); if (nb && (railHas(nb.s, (d + 2) % 4) || railLinks(nb.x, nb.y, nb.z) < 2)) cand.push({ d: d, up: nb.up }); }
    var a = cand[0], b = null;
    for (var i = 0; i < cand.length && !b; i++) for (var j = i + 1; j < cand.length; j++) if ((cand[i].d + 2) % 4 === cand[j].d) { a = cand[i]; b = cand[j]; break; }
    if (!b && cand.length > 1) b = cand[1];
    if (!a) return (look % 2) ? 1 : 0;
    var upD = a.up === 1 ? a.d : (b && b.up === 1 ? b.d : -1);
    if (!b || (a.d + 2) % 4 === b.d) { if (upD >= 0) return 6 + upD; return a.d % 2 ? 1 : 0; }
    var p = [a.d, b.d].sort(), key = p[0] + ',' + p[1];
    return { '0,1': 2, '1,2': 3, '2,3': 4, '0,3': 5 }[key];
  }
  function railFixNeighbors(x, y, z) {   // 새 레일 쪽으로 옆 레일을 돌려 이음(이미 양쪽이 이어진 레일은 그대로)
    for (var d = 0; d < 4; d++) {
      var nb = railNeighbor(x, y, z, d); if (!nb) continue;
      var lowFlat = nb.up === -1 && nb.s < 6;   // 한 칸 아래 평평한 레일은 이쪽으로 올라오는 비탈로
      if (!lowFlat && (railHas(nb.s, (d + 2) % 4) || railLinks(nb.x, nb.y, nb.z) >= 2)) continue;
      var ns = railShapeFor(nb.x, nb.y, nb.z, nb.s % 2); if (ns !== nb.s && !canPlace(nb.x, nb.y, nb.z, RAIL0)) setBlock(nb.x, nb.y, nb.z, railBaseAt(nb.x, nb.y, nb.z) + ns);
    }
    var me = railShapeFor(x, y, z, railAt(x, y, z) % 2); if (me !== railAt(x, y, z)) setBlock(x, y, z, railBaseAt(x, y, z) + me);
  }
  function cartPos(c) {
    var s = c.s, A = [c.x + 0.5 + RDX[c.from] * 0.5, c.z + 0.5 + RDZ[c.from] * 0.5], Bp = [c.x + 0.5 + RDX[c.to] * 0.5, c.z + 0.5 + RDZ[c.to] * 0.5], t = c.t, px, pz;
    if ((c.from + 2) % 4 === c.to) { px = A[0] + (Bp[0] - A[0]) * t; pz = A[1] + (Bp[1] - A[1]) * t; }
    else { var u = 1 - t, cx = c.x + 0.5, cz = c.z + 0.5; px = u * u * A[0] + 2 * u * t * cx + t * t * Bp[0]; pz = u * u * A[1] + 2 * u * t * cz + t * t * Bp[1]; }
    var py = c.y + 0.07; if (s >= 6) py = c.y + 0.07 + (c.to === s - 6 ? t : 1 - t);
    return [px, py, pz];
  }
  function cartLen(c) { return c.s >= 6 ? 1.4 : ((c.from + 2) % 4 === c.to ? 1 : 0.8); }
  function makeCartMesh() {
    // 11/21 GPT 참고 그림대로 나무 수레: 널빤지 옆판 + 밝은 테두리 + 모서리 기둥, 쇠 바퀴
    var g = new THREE.Group(), M = {}; function mat(c) { return M[c] || (M[c] = new THREE.MeshBasicMaterial({ color: c })); }
    function bx(w, h, d, x, y, z, c) { var o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c)); o.position.set(x, y, z); g.add(o); }
    bx(0.9, 0.08, 1.2, 0, 0.2, 0, 0x6a4226); bx(0.8, 0.02, 1.1, 0, 0.25, 0, 0xa8743f);
    bx(0.9, 0.4, 0.08, 0, 0.42, 0.56, 0x9c6a3c); bx(0.9, 0.4, 0.08, 0, 0.42, -0.56, 0x9c6a3c); bx(0.08, 0.4, 1.2, 0.41, 0.42, 0, 0x9c6a3c); bx(0.08, 0.4, 1.2, -0.41, 0.42, 0, 0x9c6a3c);
    bx(0.94, 0.06, 0.12, 0, 0.64, 0.56, 0xc08a54); bx(0.94, 0.06, 0.12, 0, 0.64, -0.56, 0xc08a54); bx(0.12, 0.06, 1.24, 0.41, 0.64, 0, 0xc08a54); bx(0.12, 0.06, 1.24, -0.41, 0.64, 0, 0xc08a54);
    [[-0.42, -0.57], [0.42, -0.57], [-0.42, 0.57], [0.42, 0.57]].forEach(function (q) { bx(0.1, 0.46, 0.1, q[0], 0.42, q[1], 0x6e4426); });
    bx(0.9, 0.05, 0.05, 0, 0.12, 0.38, 0x55595e); bx(0.9, 0.05, 0.05, 0, 0.12, -0.38, 0x55595e);
    [[-0.47, -0.38], [0.47, -0.38], [-0.47, 0.38], [0.47, 0.38]].forEach(function (q) { bx(0.06, 0.22, 0.22, q[0], 0.12, q[1], 0x7f868c); bx(0.07, 0.08, 0.08, q[0], 0.12, q[1], 0x3a3d40); });
    scene.add(g); return g;
  }
  function cartNet() { return !!(client && me && me.id && me.id !== 'test'); }
  function cartToBag() { if (!isAdm()) { if (give(CART, 1) < 1) dropItem(P.x, P.y + 0.5, P.z, CART, 1); bagChanged(); } }
  function startCart(x, y, z, park) {
    if (park && park.id) {   // 서버에 세워 둔 수레: 먼저 누른 한 사람만
      if (park.taking) return; park.taking = true;
      client.rpc('take_ark_cart', { p_id: park.id }).then(function (r) {
        var d = r && r.data; removeParked(park);
        if (!d) return toast('다른 사람이 먼저 탔어요');
        startCart(d.x, d.y, d.z, { x: d.x, y: d.y, z: d.z, s: d.s, from: d.from, to: d.to, t: d.t });
      }, function () { park.taking = false; toast('수레를 타지 못했어요. 다시 눌러 주세요'); });
      return;
    }
    if (riding || ferryRide || furnitureRest) return deny('지금은 수레를 탈 수 없어요');
    if (!park && !isAdm() && have(CART) < 1) return deny('수레가 없어요 — 철 덩이 5개로 만들어요');
    var s = railAt(x, y, z); if (s < 0) return;
    var f = [-Math.sin(P.yaw), -Math.cos(P.yaw)], c0 = RAIL_CONN[s][0], c1 = RAIL_CONN[s][1];
    var to = RDX[c0] * f[0] + RDZ[c0] * f[1] >= RDX[c1] * f[0] + RDZ[c1] * f[1] ? c0 : c1;
    if (park) { removeParked(park); cartRide = { x: park.x, y: park.y, z: park.z, s: s, to: park.to, from: park.from, t: park.t, v: 0 }; if (!railHas(s, cartRide.to) || !railHas(s, cartRide.from)) { cartRide.to = to; cartRide.from = to === c0 ? c1 : c0; cartRide.t = 0.5; } }
    else { if (!isAdm()) { take(CART, 1); bagChanged(); } cartRide = { x: x, y: y, z: z, s: s, to: to, from: to === c0 ? c1 : c0, t: 0.5, v: 0 }; }
    if (!cartMesh) cartMesh = makeCartMesh(); cartMesh.visible = true;
    $('restUp').textContent = '내리기'; $('restUp').hidden = false; resetInput(); sfx('door', 500); newsMark('cart');
    toast('🛤 수레에 탔어요 — 앞으로 가면 바라보는 쪽으로 밀리고, 금빛 빠른 레일을 지나면 빨라져요. 내리면 수레는 레일 위에 서 있어요');
  }
  function leaveCart(quiet) {
    var c = cartRide; if (!c) return;
    cartRide = null; if (cartMesh) cartMesh.visible = false;
    $('restUp').hidden = true; $('restUp').textContent = '일어나기';
    var onRail = railAt(c.x, c.y, c.z) >= 0, parked = onRail && (cartNet() || PARKED.filter(function (q) { return !q.id; }).length < 12);
    if (parked) {
      var lp = { x: c.x, y: c.y, z: c.z, s: c.s, from: c.from, to: c.to, t: Math.max(0, Math.min(1, c.t)) };
      if (cartNet()) {
        lp.pending = true; addParked(lp);
        client.rpc('park_ark_cart', { p_x: lp.x, p_y: lp.y, p_z: lp.z, p_s: lp.s, p_from: lp.from, p_to: lp.to, p_t: lp.t }).then(function (r) {
          var id = r && r.data;
          if (id > 0) { lp.id = id; lp.pending = false; return; }
          removeParked(lp); cartToBag(); toast(id === -4 ? '세워 둘 수 있는 수레는 한 사람 6대까지예요 — 수레를 가방에 넣었어요' : '여기에는 수레를 세울 수 없어요 — 가방에 넣었어요');
        }, function () { removeParked(lp); cartToBag(); toast('수레를 세우지 못해 가방에 넣었어요'); });
      } else addParked(lp);
    } else cartToBag();
    P.vx = P.vy = P.vz = 0; P.y += 0.3; P.x += -Math.cos(P.yaw) * 0.9; P.z += Math.sin(P.yaw) * 0.9; if (collides(P.x, P.y, P.z)) { P.x = cartPos(c)[0]; P.z = cartPos(c)[2]; } while (collides(P.x, P.y, P.z) && P.y < SY) P.y += 1;
    if (!quiet) { sfx('door', 500); toast(parked ? '수레에서 내렸어요 — 수레는 레일 위에 세워 뒀어요. ' + (cartNet() ? '누구나 눌러 탈 수 있고, ' : '다시 누르면 타고, ') + '레일을 캐면 가방으로 돌아와요' : '수레에서 내렸어요 — 수레는 가방에 넣었어요'); }
  }
  function stepCart(dt) {
    var c = cartRide;
    if (keys.ShiftLeft || keys.ShiftRight) { leaveCart(); placeCamera(dt, 0); return; }
    if (railAt(c.x, c.y, c.z) !== c.s) { leaveCart(); placeCamera(dt, 0); return; }   // 레일이 사라짐
    var fwdIn = ((keys.KeyW || keys.ArrowUp) ? 1 : 0) - ((keys.KeyS || keys.ArrowDown) ? 1 : 0) - joy.y;
    var p0 = cartPos(c), save = c.t; c.t = Math.min(1, c.t + 0.01); var p1 = cartPos(c); c.t = save;
    var tx = p1[0] - p0[0], tz = p1[2] - p0[2], tl = Math.hypot(tx, tz) || 1; tx /= tl; tz /= tl;
    var look = tx * -Math.sin(P.yaw) + tz * -Math.cos(P.yaw);
    c.v += fwdIn * look * 7 * dt;
    if (c.s >= 6) c.v += (c.to === c.s - 6 ? -1 : 1) * 4.5 * dt;
    var fr = (0.35 + 0.12 * Math.abs(c.v)) * dt; c.v = Math.abs(c.v) <= fr ? 0 : c.v - Math.sign(c.v) * fr;
    if (c.v < 0) { var tmp = c.from; c.from = c.to; c.to = tmp; c.t = 1 - c.t; c.v = -c.v; }
    var fast = railBaseAt(c.x, c.y, c.z) === RAILF0;
    if (fast && c.v > 0.2) c.v += 9 * dt;   // 빠른 레일: 굴러가는 수레를 더 밀어 줌
    if (!fast && c.v > 10) c.v -= 3 * dt;
    c.v = Math.min(14, c.v);
    c.t += c.v * dt / cartLen(c);
    var guard = 0;
    while (c.t >= 1 && guard++ < 4) {
      var ny = c.y + (c.s >= 6 && c.to === c.s - 6 ? 1 : 0), nx = c.x + RDX[c.to], nz = c.z + RDZ[c.to], back = (c.to + 2) % 4, ns = railAt(nx, ny, nz);
      if (ns < 0 || !railHas(ns, back)) { var ds = railAt(nx, ny - 1, nz); if (ds >= 6 && ds - 6 === back) { ny--; ns = ds; } else ns = -1; }
      if (ns < 0) { c.t = 1; if (c.v > 2) { sfx('break', 'metal'); } c.v = 0; break; }
      c.t -= 1; c.x = nx; c.y = ny; c.z = nz; c.s = ns; c.from = back; c.to = RAIL_CONN[ns][0] === back ? RAIL_CONN[ns][1] : RAIL_CONN[ns][0];
      if (c.v > 0.5) tone('square', 130, 95, 0.04, Math.min(0.05, c.v * 0.006));
    }
    var p = cartPos(c);
    P.x = p[0]; P.z = p[2]; P.y = p[1] + 0.25; P.vx = P.vy = P.vz = 0; P.swim = false; fallTop = null;
    if (cartMesh) { cartMesh.position.set(p[0], p[1], p[2]); cartMesh.rotation.y = Math.atan2(tx, tz); }
    ensureAround(P.x, P.z, 2);
    placeCamera(dt, c.v);
  }
  // 세워 둔 수레(이 기기에 기억): 레일이 사라지면 가방으로
  var PARKED = [];
  try { PARKED = (JSON.parse(localStorage.getItem('arkVillage.carts') || '[]') || []).filter(function (p) { return p && typeof p.x === 'number'; }).slice(0, 12); } catch (e) { PARKED = []; }
  function saveParked() { try { localStorage.setItem('arkVillage.carts', JSON.stringify(PARKED.filter(function (p) { return !p.id && !p.pending; }).map(function (p) { return { x: p.x, y: p.y, z: p.z, s: p.s, from: p.from, to: p.to, t: p.t }; }))); } catch (e) {} }
  function parkedAt(x, y, z) { for (var i = 0; i < PARKED.length; i++) { var p = PARKED[i]; if (p.x === x && p.y === y && p.z === z) return p; } return null; }
  function placeParkedMesh(p) { if (!p.mesh) p.mesh = makeCartMesh(); var q = cartPos(p), save = p.t; p.t = Math.min(1, p.t + 0.01); var q2 = cartPos(p); p.t = save; p.mesh.position.set(q[0], q[1], q[2]); p.mesh.rotation.y = Math.atan2(q2[0] - q[0], q2[2] - q[2]); p.mesh.visible = true; }
  function addParked(p) { PARKED.push(p); placeParkedMesh(p); saveParked(); }
  function removeParked(p) { var i = PARKED.indexOf(p); if (i >= 0) PARKED.splice(i, 1); if (p.mesh) { scene.remove(p.mesh); p.mesh = null; } saveParked(); }
  function parkedBroken(x, y, z) {
    var p = parkedAt(x, y, z); if (!p) return; removeParked(p);
    if (p.id) { client.rpc('take_ark_cart', { p_id: p.id }).then(function (r) { if (r && r.data) { cartToBag(); toast('🛒 세워 둔 수레를 가방에 넣었어요'); } }, function () {}); return; }
    cartToBag(); toast('🛒 세워 둔 수레를 가방에 넣었어요');
  }
  var cartPollT = 0;
  function pollCarts() {
    client.rpc('list_ark_carts', { p_x: Math.floor(P.x), p_z: Math.floor(P.z) }).then(function (r) {
      if (!r || r.error || !Array.isArray(r.data)) return;
      var ids = new Set(r.data.map(function (d) { return d.id; }));
      PARKED.slice().forEach(function (p) { if (p.id && !ids.has(p.id) && !p.taking) removeParked(p); });
      r.data.forEach(function (d) { if (!PARKED.some(function (p) { return p.id === d.id; })) PARKED.push({ id: d.id, x: d.x, y: d.y, z: d.z, s: d.s, from: d.frm, to: d.too, t: d.t }); });
    }, function () {});
  }
  function tickParked() {   // 1초마다: 가까이 있으면 보이게. 이 기기 수레는 땅이 불러와졌는데 레일이 없으면 가방으로
    if (cartNet() && started && ++cartPollT >= 5) { cartPollT = 0; pollCarts(); }
    PARKED.slice().forEach(function (p) {
      if (!colAt(p.x, p.z)) { if (p.mesh) p.mesh.visible = false; return; }
      if (railAt(p.x, p.y, p.z) < 0) { if (p.id || p.pending) { if (p.mesh) p.mesh.visible = false; } else parkedBroken(p.x, p.y, p.z); return; }
      p.s = railAt(p.x, p.y, p.z); if (!railHas(p.s, p.to) || !railHas(p.s, p.from)) { p.from = RAIL_CONN[p.s][0]; p.to = RAIL_CONN[p.s][1]; }
      placeParkedMesh(p);
    });
  }
  // 지도에 그릴 레일: 불러온 땅 기둥을 하나씩 돌아가며 살펴봄(0.05초에 한 기둥)
  var RAIL_MAP = new Map(), railScanK = 0;
  setInterval(railScanStep, 200);
  function railScanStep() {
    if (!started || document.hidden) return;
    for (var tries = 0; tries < 4096; tries++) { railScanK = (railScanK + 1) % (NC * NC); if (COLS[railScanK]) break; }
    var col = COLS[railScanK]; if (!col) return;
    var cx = (railScanK % NC) * CS, cz = Math.floor(railScanK / NC) * CS, d = col.d;
    RAIL_MAP.forEach(function (v, key) { var kx = key >> 12, kz = key & 4095; if (kx >= cx && kx < cx + CS && kz >= cz && kz < cz + CS) RAIL_MAP.delete(key); });
    for (var i = 0; i < d.length; i++) { var v = d[i]; if ((v >= RAIL0 && v < RAIL0 + 10) || (v >= RAILF0 && v < RAILF0 + 10)) { var lx = i % CS, lz = Math.floor(i / CS) % CS; RAIL_MAP.set(((cx + lx) << 12) | (cz + lz), v >= RAILF0 ? 2 : 1); } }
    if (RAIL_MAP.size > 20000) RAIL_MAP.clear();
  }
  function drawMapRails(x, ox, oz, sc, w, h) {
    var s = Math.max(1.5, sc);
    RAIL_MAP.forEach(function (v, key) {
      var mx = ((key >> 12) - ox) * sc, mz = ((key & 4095) - oz) * sc; if (mx < -2 || mz < -2 || mx > w + 2 || mz > h + 2) return;
      x.fillStyle = v === 2 ? '#e8c53a' : '#2f2f33'; x.fillRect(mx - s / 2, mz - s / 2, s, s);
    });
    PARKED.forEach(function (p) { var mx = (p.x + 0.5 - ox) * sc, mz = (p.z + 0.5 - oz) * sc; x.fillStyle = '#9aa3aa'; x.fillRect(mx - 3, mz - 2, 6, 4); x.strokeStyle = '#222'; x.lineWidth = 1; x.strokeRect(mx - 3, mz - 2, 6, 4); });
  }
  function drawMapBed(x, big, ox, oz, sc) {
    if (!SPAWN) return;
    var mx = (SPAWN.x + 0.5 - ox) * sc, mz = (SPAWN.z + 0.5 - oz) * sc, r = big ? 6 : 4;
    x.fillStyle = '#c0473a'; x.fillRect(mx - r, mz - r * 0.6, r * 2, r * 1.2); x.fillStyle = '#f2efe6'; x.fillRect(mx - r, mz - r * 0.6, r * 0.7, r * 1.2);
    x.strokeStyle = '#fff'; x.lineWidth = 1; x.strokeRect(mx - r, mz - r * 0.6, r * 2, r * 1.2);
    if (big) { x.font = '11px Galmuri11, sans-serif'; x.textAlign = 'center'; x.fillStyle = '#fff'; x.fillText('내 침대', mx, mz - r - 6); }
  }
  // ── 11/20 배: 물 위를 눌러 띄우고 타요. 방향키로 저어 가고(초당 15칸), 「배에서 내리기」를 누르면 가까운 뭍으로 내려 배는 가방으로 ──
  var boatRide = null, boatMesh = null, boatBumpT = 0;
  function waterTopAt(x, z, yh) { for (var y = yh + 3; y >= yh - 8; y--) if (get(x, y, z) === WATER && get(x, y + 1, z) !== WATER && !isSolid(get(x, y + 1, z))) return y; return null; }
  function useBoat(dir) {
    if (boatRide || riding || cartRide || ferryRide) return;
    if (!isAdm() && have(BOAT) < 1) return;
    var spot = null;
    if (P.swim) { var wy0 = waterTopAt(Math.floor(P.x), Math.floor(P.z), Math.floor(P.y)); if (wy0 !== null) spot = [P.x, wy0, P.z]; }
    if (!spot) {
      var ex = P.x, ey = P.y + EYE, ez = P.z;   // 내 눈에서(3인칭이어도) 앞쪽으로
      for (var t = 0.5; t < 10 && !spot; t += 0.4) {
        var bx = Math.floor(ex + dir.x * t), by = Math.floor(ey + dir.y * t), bz = Math.floor(ez + dir.z * t), id = get(bx, by, bz);
        if (id === WATER) { var wy = waterTopAt(bx, bz, by); if (wy !== null) spot = [bx + 0.5, wy, bz + 0.5]; }
        else if (isSolid(id)) break;
      }
    }
    if (!spot) return deny('배는 물 위를 눌러서 띄워요');
    if (!isAdm()) { take(BOAT, 1); bagChanged(); }
    if (!boatMesh) {
      boatMesh = new THREE.Mesh(mergedBoxes([   // 11/21 GPT 참고 그림대로: 높인 이물·고물, 밝은 뱃전, 가운데 앉을 자리, 이물 쪽 돛대와 작은 돛(눈높이 위)
        [1.3, .18, 2.5, 0x6e4426, 0, 0, 0], [1.1, .04, 2.3, 0xb07a48, 0, .1, 0], [.14, .42, 2.6, 0x9a6438, -.68, .25, 0], [.14, .42, 2.6, 0x9a6438, .68, .25, 0],
        [.2, .08, 2.6, 0xc08a54, -.68, .48, 0], [.2, .08, 2.6, 0xc08a54, .68, .48, 0], [1.5, .6, .32, 0x8a5630, 0, .3, 1.36], [1.3, .1, .36, 0xc08a54, 0, .64, 1.36],
        [1.5, .5, .32, 0x8a5630, 0, .25, -1.36], [1.3, .1, .36, 0xc08a54, 0, .54, -1.36], [1.2, .1, .45, 0xa0703f, 0, .34, 0]]), avatarMat);
      boatMesh.userData.mast = new THREE.Mesh(mergedBoxes([[.12, 2.6, .12, 0x5e3a20, 0, 1.45, 1.05], [1.1, .08, .08, 0x5e3a20, 0, 2.7, 1.05], [1.0, .72, .04, 0xe8e2d2, 0, 2.3, 1.1]]), avatarMat);
      boatMesh.add(boatMesh.userData.mast);   // 돛대: 1인칭에서는 앞을 가려 숨김
      scene.add(boatMesh);
    }
    boatMesh.visible = true;
    boatRide = { x: spot[0], z: spot[2], wy: spot[1], vx: 0, vz: 0, t: 0 };
    P.x = spot[0]; P.z = spot[2]; P.y = spot[1] + 0.95; P.vx = P.vy = P.vz = 0;
    $('restUp').hidden = false; $('restUp').textContent = '배에서 내리기';
    toast('⛵ 배를 탔어요 — 방향키로 저어 가요. 내릴 때는 「배에서 내리기」'); newsMark('boat'); sfx('place', 'wood');
  }
  function stepBoat(dt) {
    var b = boatRide; b.t += dt;
    if (keys.ShiftLeft || keys.ShiftRight) { leaveBoat(); placeCamera(dt, 0); return; }
    var mx = 0, mz = 0;
    if (keys.KeyW || keys.ArrowUp) mz -= 1; if (keys.KeyS || keys.ArrowDown) mz += 1;
    if (keys.KeyA || keys.ArrowLeft) mx -= 1; if (keys.KeyD || keys.ArrowRight) mx += 1;
    mx += joy.x; mz += joy.y; var len = Math.hypot(mx, mz); if (len > 1) { mx /= len; mz /= len; }
    var sin = Math.sin(P.yaw), cos = Math.cos(P.yaw), sp = 15;
    var wx = (mx * cos + mz * sin) * sp, wz = (-mx * sin + mz * cos) * sp;
    b.vx += (wx - b.vx) * Math.min(1, 2.5 * dt); b.vz += (wz - b.vz) * Math.min(1, 2.5 * dt);
    var nx = b.x + b.vx * dt, nz = b.z + b.vz * dt, v = Math.hypot(b.vx, b.vz) || 1;
    var fx = nx + b.vx / v * 0.9, fz = nz + b.vz / v * 0.9;   // 뱃머리 쪽도 물이어야
    var wy = waterTopAt(Math.floor(nx), Math.floor(nz), b.wy), wf = waterTopAt(Math.floor(fx), Math.floor(fz), b.wy);
    if (wy === null || wf === null || Math.abs(wy - b.wy) > 1 || Math.abs(wf - b.wy) > 1) {
      b.vx *= -0.2; b.vz *= -0.2;
      var now = performance.now(); if (now > boatBumpT) { boatBumpT = now + 4000; toast('뭍에 닿았어요 — 「배에서 내리기」로 내려요'); }
    } else { b.x = nx; b.z = nz; b.wy = wy; }
    var bob = Math.sin(b.t * 2.2) * 0.04;
    P.x = b.x; P.z = b.z; P.y = b.wy + 0.95 + bob; P.vx = P.vy = P.vz = 0; P.swim = false; P.ground = true;
    boatMesh.position.set(b.x, b.wy + 0.82 + bob, b.z); boatMesh.userData.mast.visible = S.view !== 0;
    if (v > 0.6) { var hd = Math.atan2(b.vx, b.vz), dh = hd - boatMesh.rotation.y; dh = Math.atan2(Math.sin(dh), Math.cos(dh)); boatMesh.rotation.y += dh * Math.min(1, 4 * dt); }
    if (v > 3 && Math.random() < 0.3) sparkle(b.x - b.vx / v * 1.4, b.wy + 1.05, b.z - b.vz / v * 1.4, 0xe8f4ff, 1, { size: 0.25, life: 0.5, up: 0.4, v: 0.6 });
    placeCamera(dt);
  }
  function leaveBoat(quiet) {
    var b = boatRide; if (!b) return;
    boatRide = null; if (boatMesh) boatMesh.visible = false;
    $('restUp').hidden = true; $('restUp').textContent = '일어나기';
    if (!isAdm()) { give(BOAT, 1); bagChanged(); }
    for (var r = 1.5; r <= 3.5; r += 1) for (var a = 0; a < 8; a++) {   // 가까운 뭍(물이 아닌 땅) 위로
      var x = b.x + Math.cos(a * Math.PI / 4) * r, z = b.z + Math.sin(a * Math.PI / 4) * r, gy = groundAt(x, z, b.wy + 3);
      if (gy !== null && gy >= b.wy + 1 && gy <= b.wy + 2 && !collides(x, gy, z)) { P.x = x; P.y = gy; P.z = z; P.vx = P.vy = P.vz = 0; if (!quiet) toast('배를 가방에 넣고 뭍에 내렸어요'); return; }
    }
    P.y = b.wy + 0.3; P.vx = P.vy = P.vz = 0; if (!quiet) toast('배를 가방에 넣었어요 — 헤엄쳐요(점프를 누르면 떠올라요)');
  }
  function stepFerry(dt) {
    var ride=ferryRide; ride.t+=dt;
    var progress=Math.min(1,ride.t/7),x=ride.from.x+.5,z=ride.from.z+.5+(ride.to.z-ride.from.z)*progress;
    P.x=x;P.z=z;P.y=surfaceY(Math.floor(x),Math.floor(z))+.14;
    P.vx=P.vy=P.vz=0;P.swim=false;
    ferryMesh.position.set(x,P.y-.45,z);
    ferryMesh.rotation.y=P.yaw; placeCamera(dt);
    if(progress>=1){
      ferryMesh.visible=false; ferryRide=null;
      var shore=ride.to.z+(ride.to.z>ride.from.z?2:-2);
      teleport(ride.to.x+.5,surfaceY(ride.to.x,shore),shore,P.yaw);
      toast('호수 건너편에 도착했어요');
    }
  }
