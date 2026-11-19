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
        if (y < 1 || y >= SY || x < 0 || z < 0 || x >= WS || z >= WS || (id !== AIR && !B[id])) continue;
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
        if (x < 0 || z < 0 || x >= WS || z >= WS || y < 1 || y >= SY || plotAt(x, z) >= 0) return;
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
        var l = +li, lx = l % CS, r0 = (l - lx) / CS, lz = r0 % CS, y = (r0 - lz) / CS, x = cx * CS + lx, z = cz * CS + lz;
        if (y < 1 || plotAt(x, z) >= 0 || inArk(x, y, z)) continue;
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
    var s=SHAPE[id]; return id===expected || (s && s.base===expected) ||
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
  var villageTabs = [['build','설계도'],['materials','재료'],['discover','탐험'],['projects','공동 작업'],['neighbors','마을 사람'],['cargo','나귀 짐'],['showcase','집 구경'],['frontier','개척 땅'],['feed','마을 소식'],['gifts','선물'],['photos','사진']];
  function openVillageWork(tab) { villageTab=tab; openPanel('villageWork'); renderVillageWork(); if(tab==='projects'||tab==='neighbors')fetchVillageProjects(); }
  var VILLAGE_GROUPS=[['🔨 짓기',['build','materials','projects','frontier']],['🏘 마을',['neighbors','cargo','discover']],['🤝 함께',['showcase','feed','gifts','photos']]];
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
