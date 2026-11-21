  // ───────── 11/21 함께 하기(GPT 검토 03·04·23·24) ─────────
  // ① 모이기 표식: 📍 → 여기로 와요·도와줘요·조심 — 일행(일행이 없으면 친구)에게 45초 보임(느 4:20)
  var PINGS = {}, pingAt = 0, PING_LIFE = 45000;
  var PING_KIND = { come: ['📍', '여기로 와요', '#7ed957'], help: ['🙋', '여기 도와줘요', '#ffcf4a'], warn: ['⚠️', '여기 조심', '#ff6a5a'] };
  function pingSpot() {
    var h = null; try { h = pickCenter(); } catch (e) {}
    if (h && h.px !== undefined && Math.hypot(h.px - P.x, h.pz - P.z) < 40) return [h.px + 0.5, h.py + 0.1, h.pz + 0.5];
    return [P.x, P.y + 0.1, P.z];
  }
  function togglePingMenu(show) {
    var m = $('pingMenu'); if (!m) return;
    m.hidden = show === undefined ? !m.hidden : !show;
  }
  function sendPing(kind) {
    togglePingMenu(false);
    var now = performance.now();
    if (now < pingAt) { toast('조금 뒤에 다시 찍을 수 있어요'); return; }
    pingAt = now + 3000;
    var p = pingSpot(), k = PING_KIND[kind];
    showPing(me ? me.id : 'me', kind, p[0], p[1], p[2], '나');
    if (NET.ch && me) NET.ch.send({ type: 'broadcast', event: 'ping', payload: { u: me.id, k: kind, x: +p[0].toFixed(1), y: +p[1].toFixed(1), z: +p[2].toFixed(1) } });
    sfx('pop');
    if (!S.pingTold) { S.pingTold = 1; saveSettings(); showVerseCard('📯', '모이기 표식', '너희는 어디서든지 나팔 소리를 듣거든 그리로 모여서 우리에게로 나아오라 우리 하나님이 우리를 위하여 싸우시리라', '느헤미야 4:20', k[0] + ' 「' + k[1] + '」을 찍었어요 — ' + (inParty() ? '일행' : '친구') + '에게 45초 동안 보여요'); }
    else toast(k[0] + ' ' + k[1] + ' — ' + (inParty() ? '일행' : '친구') + '에게 45초 동안 보여요');
  }
  function onPing(m) {
    if (!m || !PING_KIND[m.k] || !Number.isFinite(m.x) || !Number.isFinite(m.y) || !Number.isFinite(m.z)) return;
    if (!(partyMate(m.u) || (!inParty() && FRIENDS.accepted.has(m.u)))) return;
    var nick = NET.names[m.u] || '친구', k = PING_KIND[m.k];
    showPing(m.u, m.k, m.x, m.y, m.z, nick);
    sfx('pop'); toast(k[0] + ' ' + nick + ': ' + k[1] + ' (' + Math.round(Math.hypot(m.x - P.x, m.z - P.z)) + '칸)');
  }
  function clearPing(u) {
    var p = PINGS[u]; if (!p) return;
    disposeSprite(p.tag); p.beam.geometry.dispose(); p.beam.material.dispose(); scene.remove(p.g); delete PINGS[u];
  }
  function pingLabel(p) {
    var k = PING_KIND[p.kind], d = Math.round(Math.hypot(p.x - P.x, p.z - P.z));
    if (p.tag) disposeSprite(p.tag);
    p.tag = textSprite(k[0] + ' ' + p.nick + ' · ' + k[1] + (d > 3 ? ' · ' + d + '칸' : ''), 'rgba(0,0,0,0.62)', k[2], 0.62);
    p.tag.material.depthTest = false; p.tag.renderOrder = 22; p.tag.position.y = 5.4; p.g.add(p.tag);
  }
  function showPing(u, kind, x, y, z, nick) {
    if (!scene) return;
    clearPing(u);
    var k = PING_KIND[kind], g = new THREE.Group();
    var beam = new THREE.Mesh(new THREE.BoxGeometry(0.14, 5, 0.14), new THREE.MeshBasicMaterial({ color: parseInt(k[2].slice(1), 16), transparent: true, opacity: 0.6, depthWrite: false, fog: false }));
    beam.position.y = 2.5; g.add(beam); g.position.set(x, y, z); scene.add(g);
    var p = PINGS[u] = { g: g, beam: beam, tag: null, kind: kind, nick: nick, x: x, y: y, z: z, until: performance.now() + PING_LIFE };
    pingLabel(p);
  }
  function pingTick() {   // 1초마다: 거리 글자 고치고, 45초 지나면 지움
    var now = performance.now();
    for (var u in PINGS) { var p = PINGS[u]; if (now > p.until) clearPing(u); else pingLabel(p); }
  }
  function drawMapPings(ctx, big, ox, oz, scale) {
    for (var u in PINGS) {
      var p = PINGS[u], x = (p.x - ox) * scale, y = (p.z - oz) * scale, r = big ? 7 : 4;
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 4);
      ctx.fillStyle = PING_KIND[p.kind][2]; ctx.fillRect(-r / 2, -r / 2, r, r); ctx.lineWidth = 1; ctx.strokeStyle = '#1d1a14'; ctx.strokeRect(-r / 2, -r / 2, r, r);
      ctx.restore();
    }
  }

  // ② 그림자 이름·체력 정리: 가까운 둘(10칸 안)과 방금 맞힌 것만 이름을 보이고, 큰 그림자 체력은 화면 위 한 줄로
  function tidyShadowTags() {
    var live = SHADOWS.filter(function (s) { return !s.dead && s.tag; });
    live.forEach(function (s) { s.dist = Math.hypot(P.x - s.x, P.z - s.z); });
    live.sort(function (a, b) { return a.dist - b.dist; });
    live.forEach(function (s, i) { s.tag.visible = (i < 2 && s.dist < 10) || (s.bar && s.bar.visible && s.kind !== 'great'); });
    var g = live.filter(function (s) { return s.kind === 'great' && s.dist < 28; })[0], bb = $('bossBar');
    if (!bb) return;
    if (g) {
      if (g.bar) g.bar.visible = false;
      if (g.tag) g.tag.visible = false;
      bb.hidden = false; $('bossFill').style.width = Math.max(0, Math.round(100 * g.hp / g.sp.hp)) + '%';
    } else bb.hidden = true;
  }

  // ③ 밤을 함께 지키기: 밤 동안 물리친 그림자·막은 불화살·곁에 있던 친구를 모아 새벽에 카드로(느 4:17)
  var NIGHTW = { on: false, shadows: 0, blocks: 0, mates: {} }, togetherToldT = 0;
  function nearMates(r) {
    var out = [];
    for (var u in NET.peers) { var p = NET.peers[u]; if (p && Number.isFinite(p.x) && Math.hypot(p.x - P.x, p.z - P.z) < r && performance.now() - (p.t || 0) < 8000) out.push(u); }
    return out;
  }
  function nightNote(kind) {
    if (kind === 'shadow') NIGHTW.shadows++; else if (kind === 'block') NIGHTW.blocks++;
    var ms = nearMates(16); ms.forEach(function (u) { NIGHTW.mates[u] = 1; });
    if (kind === 'block' && nearMates(8).length) {
      var now = performance.now();
      if (now - togetherToldT > 20000) { togetherToldT = now; floatText(P.x, P.y + HT + 0.6, P.z, '🛡 함께 막았어요', '#bfe8ff', 0.6, 1.2); }
    }
  }
  function nightWatchTick() {   // 1초마다
    var night = isNight();
    if (night && !NIGHTW.on) { NIGHTW = { on: true, shadows: 0, blocks: 0, mates: {} }; return; }
    if (!night && NIGHTW.on) {
      NIGHTW.on = false;
      var n = Object.keys(NIGHTW.mates).length;
      if (!started || ui !== 'play' || (NIGHTW.shadows + NIGHTW.blocks) < 1) return;
      showVerseCard('🌅', n ? '밤을 함께 지켰어요' : '밤을 지켜 냈어요', '성을 건축하는 자와 짐을 나르는 자는 다 각각 한 손으로 일을 하며 한 손에는 병기를 잡았는데', '느헤미야 4:17',
        '물리친 그림자 ' + NIGHTW.shadows + ' · 막은 불화살 ' + NIGHTW.blocks + (n ? ' · 곁에 있던 친구 ' + n + '명 — 고마워요!' : ''));
    }
  }
