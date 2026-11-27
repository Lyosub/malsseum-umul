// 「베들레헴의 밤」 서버 연결(2026-11-27): 등록·이어하기 코드·저장·첫 통과·지금 몇 명·응원
// Supabase RPC(bn_*)만 부른다. 실명은 전도사님 공개키(RSA-OAEP)로 잠가서 보낸다 — 이 파일에는 푸는 열쇠가 없다.
(function () {
  var URL = window.SUPABASE_URL, KEY = window.SUPABASE_ANON_KEY;
  var READY = true;    // 11/27 서버 SQL 실행·확인 끝(2026-11-27-bethlehem-server.sql). 문제가 생기면 false로 — 이 기기에만 저장
  var PUB = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzef4P5M7l4AxWaH/WzcxxnRORpVYc2YZ4Oz635u63GCk9+T639drFU3wfirVWpiuRl+m6HBoHyFKiEPkvaOMzMGuowJfF7VHk9Wzuf2vplcX1pnmTJdFMHZi2vIhmx2GLKva5aYzHaD0ApXpG01i1vNQHuaM6rBY6FHuiMaDjfNxnnYfZqLVoYaPwfh/VOmU2tuoOBw1/0ihSPTapJ4rfIT7hA6GO0mUJsOn0cBbMXudNaCEYbaKX58vKPGRo5qPsmVpHXomwSavQrisVWngG2zqCoqmW/ePVU7RbHc1H98FwfgEsJ5LuYJhhk6EvDtdzMGpK1NQa9XroaavIm6A/QIDAQAB';
  // 말씀우물에 로그인해 있으면 그 아이디로 부른다(서버가 auth.uid()로 진행을 찾음)
  function token() { try { return typeof window.getSession === 'function' ? window.getSession().then(function (s) { return s ? s.access_token : null; }, function () { return null; }) : Promise.resolve(null); } catch (e) { return Promise.resolve(null); } }
  function rpc(name, args) {
    if (!URL) return Promise.reject({ offline: true, message: '서버 설정 없음' });
    return token().then(function (t) { return fetch(URL + '/rest/v1/rpc/' + name, { method: 'POST', headers: { apikey: KEY, Authorization: 'Bearer ' + (t || KEY), 'Content-Type': 'application/json' }, body: JSON.stringify(args || {}) }); })
      .catch(function () { throw { offline: true, message: '인터넷 연결을 확인해 주세요' }; })
      .then(function (r) { return r.text().then(function (t) { var j = null; try { j = t ? JSON.parse(t) : null; } catch (e) {} if (!r.ok) throw { message: (j && j.message) || '서버 오류(' + r.status + ')' }; return j; }); });
  }
  function b64(buf) { var s = '', a = new Uint8Array(buf); for (var i = 0; i < a.length; i++) s += String.fromCharCode(a[i]); return btoa(s); }
  function unb64(s) { var b = atob(s), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a.buffer; }
  function seal(text) {
    if (!window.crypto || !crypto.subtle) return Promise.resolve('');
    return crypto.subtle.importKey('spki', unb64(PUB), { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt'])
      .then(function (k) { return crypto.subtle.encrypt({ name: 'RSA-OAEP' }, k, new TextEncoder().encode(text)); }).then(b64);
  }
  function clean(S) { var c = JSON.parse(JSON.stringify(S)); delete c.real; delete c.code; delete c.pendingReg; delete c.acct; return c; }
  function has(S) { return !!(S && (S.code || S.acct)); }
  var N = window.BNNet = {
    on: !!URL && READY && !/[?&](try|phonetest)=1(&|$)/.test(location.search),
    register: function (nick, real) { return seal(real).then(function (enc) { return rpc('bn_register', { p_nick: nick, p_real_enc: enc }); }); },
    nickFree: function (nick) { return rpc('bn_nick_free', { p_nick: nick }); },
    load: function (code) { return rpc('bn_load', { p_code: code }); },
    save: function (S, room) { if (!has(S)) return Promise.resolve(); return rpc('bn_save', { p_code: S.code || '', p_state: clean(S), p_room: room || '' }); },
    solved: function (S, room) { if (!has(S)) return Promise.resolve(false); return rpc('bn_solved', { p_code: S.code || '', p_room: room }); },
    cheer: function (S, room, emoji) { if (!has(S)) return Promise.resolve(false); return rpc('bn_cheer', { p_code: S.code || '', p_room: room || '', p_emoji: emoji }); },
    loggedIn: function () { return token().then(function (t) { return !!t; }); },
    mine: function () { return token().then(function (t) { return t ? rpc('bn_mine', {}) : null; }); },
    link: function (code) { return rpc('bn_link', { p_code: code }); },
    live: function (since) { return rpc('bn_live', since ? { p_since: since } : {}); }
  };

  // ── 게임과 붙이기(game.js가 BN.hook을 불러 준다)
  var G = null, since = null, seen = {}, lastSave = 0, dirty = false;
  function roomName(id) { var R = (window.BN.ROOMS || {})[id]; return R ? R.title.split(' · ')[0] : id; }
  function trySync(force) {
    var S = G.S(); if (!S || !S.nick) return;
    if (S.pendingReg && S.real) {   // 처음에 인터넷이 끊겨 있었으면 지금 등록
      return N.register(S.nick, S.real).then(function (r) { S.code = r.code; S.pendingReg = 0; delete S.real; G.save(); G.toast('서버에 등록됐어요 — 이어하기 코드: ' + r.code); })
        .catch(function (e) { if (!e.offline && /닉네임/.test(e.message)) { S.nick = S.nick.slice(0, 8) + Math.floor(10 + Math.random() * 90); G.save(); G.toast('닉네임이 겹쳐 「' + S.nick + '」로 바꿨어요'); } });
    }
    if (!has(S)) return;
    var now = Date.now(); if (!force && (!dirty || now - lastSave < 20000)) return;
    lastSave = now; dirty = false;
    N.save(S, G.cur()).catch(function () { dirty = true; });
  }
  function poll() {
    var S = G.S(); if (!S || !S.opening) return;
    N.live(since).then(function (L) {
      if (!L) return; since = L.now;
      // 방마다 지금 몇 명(지도)
      document.querySelectorAll('#spots .spot').forEach(function (b) { var n = (L.rooms || {})[b.dataset.id] || 0, e = b.querySelector('.who'); if (!e) { e = document.createElement('span'); e.className = 'who'; b.appendChild(e); } e.textContent = n ? '👤' + n : ''; });
      var on = document.getElementById('liveOn'); if (on) on.textContent = '지금 ' + (L.online || 0) + '명';
      (L.firsts || []).forEach(function (f) { var k = f.room + '|' + f.nick; if (seen[k]) return; seen[k] = 1; if (f.nick !== S.nick) G.toast('✦ ' + f.nick + '님이 「' + roomName(f.room) + '」을 가장 먼저 통과!'); });
      var c = L.cheers || {}, t = (c['🙏'] || 0) + (c['✨'] || 0); if (t) floatCheer((c['🙏'] ? '🙏' : '') + (c['✨'] ? '✨' : ''), t);
    }).catch(function () {});
  }
  function floatCheer(em, n) { var d = document.createElement('div'); d.className = 'cheer-fly'; d.textContent = em + ' ' + n; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 2600); }
  function bar() {
    var b = document.createElement('div'); b.className = 'live-bar'; b.innerHTML = '<span id="liveOn"></span><button data-e="🙏">🙏</button><button data-e="✨">✨</button>';
    b.querySelectorAll('button').forEach(function (x) { x.onclick = function () { var S = G.S(); N.cheer(S, G.cur(), x.dataset.e).then(function (ok) { if (ok) { floatCheer(x.dataset.e, ''); } else G.toast('잠깐 쉬었다가 다시 응원해요'); }).catch(function () {}); }; });
    document.getElementById('map').appendChild(b);
  }
  window.BN.hook = function (g) {
    G = g; if (!N.on) return;
    bar();
    setInterval(function () { trySync(false); }, 5000);
    setInterval(poll, 30000); setTimeout(poll, 3000);
    document.addEventListener('visibilitychange', function () { if (document.hidden) trySync(true); });
  };
  window.BN.netDirty = function () { dirty = true; };
  window.BN.netFlush = function () { if (G) trySync(true); };
  window.BN.netSolved = function (room) {
    var S = G && G.S(); if (!has(S)) return;
    dirty = true; trySync(true);
    N.solved(S, room).then(function (first) { if (first) { S.firsts = (S.firsts || 0) + 1; G.save(); seen[room + '|' + S.nick] = 1; setTimeout(function () { G.toast('🏅 이 장소를 모든 참가자 가운데 가장 먼저 통과했어요!'); }, 3000); } }).catch(function () {});
  };
})();
