// 「베들레헴의 밤」 유형 다양화(2026-11-27): 기름 나누기 · 소리 따라 하기 · 밀어 맞추기 · 빛 반사 · 그림자 맞추기 · 길 그리기
(function (BN) {
  BN.PZ = BN.PZ || {};
  var soundOn = function () { try { return localStorage.getItem('bethlehem.sound') !== '0'; } catch (e) { return true; } };
  var actx = null;
  function tone(f, ok, len) { if (!soundOn()) return; try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); var t = actx.currentTime; [1, 2].forEach(function (h) { var o = actx.createOscillator(), g = actx.createGain(); o.type = 'sine'; o.frequency.value = f * h; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime((ok ? .18 : .08) / h, t + .02); g.gain.exponentialRampToValueAtTime(.001, t + (len || .6)); o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + (len || .6) + .05); }); } catch (e) {} }

  // ── 1장 부엌: 기름 나누기(8되 단지 · 5되 · 3되 그릇) → 4되씩 두 몫
  BN.PZ.oiljugs = function (R, A) {
    var cap = [8, 5, 3], v = [8, 0, 0], sel = -1, moves = 0, w = A.el('div', 'jug-pz');
    var names = ['큰 단지', '중간 그릇', '작은 그릇'];
    function draw() {
      w.innerHTML = '<p class="tiny-note howto">여관 주인: 「기름 여덟 되를 두 손님께 똑같이 네 되씩 나눠 드려야 하는데, 눈금 없는 그릇이 이것뿐이오.」<br>그릇을 누르고 다른 그릇을 누르면 붓는다(가득 차거나 빌 때까지).</p>';
      var row = A.el('div', 'jug-row');
      cap.forEach(function (c, i) {
        var b = A.el('button', 'jug' + (sel === i ? ' sel' : ''), '<span class="jug-body" style="height:' + (40 + c * 14) + 'px"><i style="height:' + (v[i] / c * 100) + '%"></i></span><b>' + v[i] + ' / ' + c + '되</b><small>' + names[i] + '</small>'); b.dataset.i = i;
        b.onclick = function () {
          if (sel < 0) { if (!v[i]) return A.toast('빈 그릇이에요'); sel = i; return draw(); }
          if (sel === i) { sel = -1; return draw(); }
          var n = Math.min(v[sel], cap[i] - v[i]); if (!n) { sel = -1; A.toast('더 부을 수 없어요'); return draw(); }
          v[sel] -= n; v[i] += n; sel = -1; moves++; A.tick(); draw();
          if (v.filter(function (x) { return x === 4; }).length === 2) setTimeout(function () { A.closeModal(); A.solve(R); }, 700);
        };
        row.appendChild(b);
      });
      w.appendChild(row);
      var rs = A.el('button', 'btn ghost', '처음부터(' + moves + '번 부음)'); rs.onclick = function () { v = [8, 0, 0]; sel = -1; moves = 0; draw(); }; w.appendChild(rs);
    }
    draw(); A.modal('기름 나누기', w);
  };

  // ── 1장 하늘: 천군의 가락 따라 하기(한 마디씩 길어짐) — 마디마다 눅 2:14 조각이 열림
  var PARTS = ['지극히 높은 곳에서는', '하나님께', '영광이요', '땅에서는', '하나님이 기뻐하신', '사람들 중에', '평화로다'];
  var NOTES = [392, 440, 494, 523, 587, 659, 784], GLYPH = ['𝅘𝅥', '♪', '♫', '♬', '𝄞', '𝄢', '𝅗𝅥'];
  var LOCAL = /^(127\.0\.0\.1|localhost)$/.test(location.hostname);
  BN.PZ.chorus = function (R, A) {
    // 11/27 v3: 가락은 소리로만 한 번 들려준다(건반이 빛나지 않음). 들은 뒤 건반을 눌러 소리를 찾아보고(채점 안 함), 「이제 치기」 뒤에 들은 대로 친다.
    //           소리를 꺼 둔 기기는 소리로 풀 수 없으니 그때만 건반 빛으로 보여 준다.
    var r = A.seedRnd(61), seq = [], w = A.el('div', 'gen-wrap'), PH = [[0, 3], [3, 7]], ph = 0, pos = 0, busy = true, mode = 'listen';
    for (var i = 0; i < 7; i++) seq.push(Math.floor(r() * 7));
    BN.__chorus = seq; A.S().chorusSeq = seq.map(function (i) { return i + 1; }).join(' '); A.save();
    w.innerHTML = '<div class="note" id="chLine" style="font-family:var(--serif);font-size:17px;min-height:2.6em"></div><p class="tiny-note" id="chSt"></p><p class="ch-notes" id="chNotes"></p><div class="ch-keys" id="chK"></div><button class="btn gold block" id="chGo" hidden>✅ 다 찾았어요 — 이제 치기</button>';
    if (BN.duck) BN.duck(true);
    A.modal('천군의 노래', w, function () { if (BN.duck) BN.duck(false); });
    var keys = [], quiet = !soundOn();
    GLYPH.forEach(function (g, k) { var b = A.el('button', 'gcard ch-key', '<span style="font-size:26px">' + g + '</span>'); b.dataset.k = k; b.onclick = function () { press(k); }; w.querySelector('#chK').appendChild(b); keys.push(b); });
    var pid = 0, go = w.querySelector('#chGo'), notes = w.querySelector('#chNotes');
    function light(k, ms) { keys[k].classList.add('lit'); setTimeout(function () { keys[k].classList.remove('lit'); }, ms || 380); }
    function st(t) { w.querySelector('#chSt').textContent = t; }
    function setMode(m) {
      mode = m; go.hidden = m !== 'find'; w.classList.toggle('ch-answer', m === 'answer');
      var n = PH[ph][1] - PH[ph][0];
      if (m === 'find') st((ph + 1) + '소절 / 2 — 건반을 눌러 방금 들은 ' + n + '음을 찾아보세요(아직 채점 안 해요)');
      if (m === 'answer') { st((ph + 1) + '소절 / 2 — 들은 차례대로 ' + n + '음을 누르세요'); notes.textContent = '○'.repeat(n); }
    }
    go.onclick = function () { if (mode === 'find') { pos = PH[ph][0]; setMode('answer'); } };
    function play() {
      if (ph > 1 || !w.isConnected) return;
      busy = true; mode = 'listen'; go.hidden = true; w.classList.remove('ch-answer'); pos = PH[ph][0];
      st((ph + 1) + '소절 / 2 — 한 번만 들려요. ' + (quiet ? '(소리가 꺼져 있어 건반 빛으로 보여 줘요)' : '귀 기울여 들으세요'));
      var n = PH[ph][1] - PH[ph][0], heard = 0; notes.textContent = '♪'.repeat(0) + '·'.repeat(n);
      var i = PH[ph][0], my = ++pid;
      (function nx() {
        if (!w.isConnected || my !== pid) return;
        if (i >= PH[ph][1]) { busy = false; setMode('find'); return; }
        tone(NOTES[seq[i]], true, .5); if (quiet) light(seq[i]);
        heard++; notes.textContent = '♪'.repeat(heard) + '·'.repeat(n - heard);
        i++; setTimeout(nx, 750);
      })();
    }
    function press(k) {
      if (busy) return;
      light(k); tone(NOTES[k], true, .5);
      if (mode !== 'answer') return;   // 찾아보는 동안은 소리만
      var n = PH[ph][1] - PH[ph][0];
      if (k === seq[pos]) {
        pos++; notes.textContent = '●'.repeat(pos - PH[ph][0]) + '○'.repeat(PH[ph][1] - pos);
        if (pos === PH[ph][1]) {
          w.querySelector('#chLine').textContent = PARTS.slice(0, PH[ph][1]).join(' '); ph++; busy = true;
          if (ph > 1) return setTimeout(function () { if (BN.duck) BN.duck(false); A.closeModal(); A.solve(R); }, 1200);
          st('좋아요! 다음 소절'); setTimeout(play, 1400);
        }
      } else { busy = true; tone(196, false, .3); A.toast('가락이 흩어졌다 — 이 소절을 한 번 더 들려줘요'); setTimeout(play, 1400); }
    }
    setTimeout(play, 900);
    if (LOCAL) BN.__chorusGo = function () { go.click(); };
  };

  // ── 2장 계단: 시편 「성전에 올라가는 노래」 돌판 여덟을 밀어 편 번호 순서로(3×3)
  var STONES8 = [[120, '내가 환난 중에 여호와께 부르짖었더니'], [121, '내가 산을 향하여 눈을 들리라'], [122, '여호와의 집에 올라가자 할 때에'], [123, '하늘에 계시는 주여 내가 눈을 들어'], [125, '여호와를 의지하는 자는 시온 산이'], [126, '시온의 포로를 돌려 보내실 때에'], [127, '여호와께서 집을 세우지 아니하시면'], [133, '형제가 연합하여 동거함이']];
  BN.STONES8 = STONES8;
  BN.PZ.slide = function (R, A) {
    var S0 = A.S(), r = A.seedRnd(32), b = [0, 1, 2, 3, 4, 5, 6, 7, 8], e = 8, last = -1, hist = [], w = A.el('div', 'slide-pz');
    function nb(i) { var x = i % 3, y = (i / 3) | 0, o = []; if (x > 0) o.push(i - 1); if (x < 2) o.push(i + 1); if (y > 0) o.push(i - 3); if (y < 2) o.push(i + 3); return o; }
    for (var k = 0; k < 90; k++) { var c = nb(e).filter(function (j) { return j !== last; }), j = c[Math.floor(r() * c.length)]; b[e] = b[j]; b[j] = 8; last = e; e = j; hist.push(j); }
    BN.__slide = hist.slice();
    function draw() {
      w.innerHTML = '<p class="tiny-note howto">계단 돌판 여덟에 「성전에 올라가는 노래」의 첫 구절이 새겨져 있다. 돌판을 빈 자리로 밀어, 편 번호가 작은 것부터 왼쪽 위 → 오른쪽 아래 차례로 놓으세요(빈 자리는 오른쪽 아래).</p>';
      var g = A.el('div', 'slide-grid');
      b.forEach(function (t, i) {
        var d = A.el('button', 'slide-t' + (t === 8 ? ' empty' : ''), t === 8 ? '' : '「' + STONES8[t][1] + '…」'); d.dataset.i = i;
        d.onclick = function () { if (t === 8 || nb(i).indexOf(e) < 0) return; b[e] = t; b[i] = 8; e = i; A.tick(); draw(); if (b.every(function (x, k) { return x === k; })) { S0.psalmOk = 1; A.save(); A.sfx('ok'); setTimeout(function () { A.closeModal(); A.toast('돌판이 맞물렸다 — 계단 문이 열렸다. 이제 새장을 데리고 올라가자'); setTimeout(function () { BN.PZ.climb(R, A); }, 900); }, 600); } };
        g.appendChild(d);
      });
      w.appendChild(g);
    }
    draw(); A.modal('성전에 올라가는 노래', w);
  };

  // ── 3장 천막: 등잔 빛을 놋거울(최대 넷)로 꺾어 별 눈금 둘을 지나 별 지도에
  var LG = ['...#...', '.......', '.#.*...', '....#..', '.*.....', '#.....G'];
  BN.LIGHT = LG;
  function trace(M) {
    var r = 1, c = 0, dr = 0, dc = 1, pts = [[1, -0.5]], lit = {}, steps = 0, hit = false;
    while (steps++ < 200) {
      if (r < 0 || r >= 6 || c < 0 || c >= 7) { pts.push([r - dr * .5, c - dc * .5]); break; }
      var ch = LG[r][c]; if (ch === '#') { pts.push([r - dr * .5, c - dc * .5]); break; }
      lit[r + ',' + c] = 1; if (ch === 'G') { hit = true; pts.push([r, c]); break; }
      var m = M[r + ',' + c];
      if (m) { pts.push([r, c]); var t = dr; if (m === '/') { dr = -dc; dc = -t; } else { dr = dc; dc = t; } }
      r += dr; c += dc;
    }
    return { pts: pts, lit: lit, hit: hit };
  }
  BN.PZ.light = function (R, A) {
    var S = A.S(); S.f3 = S.f3 || {}; if (S.f3.light) return A.talk([['asaph', 0, '등잔 빛이 별 지도의 눈금을 비추고 있다.']]);
    var M = {}, w = A.el('div', 'light-pz');
    function draw() {
      var t = trace(M), n = Object.keys(M).length;
      var h = '<p class="tiny-note howto">천막 안 등잔 빛을 놋거울로 꺾어, 탁자의 별 눈금 둘(✦)을 지나 별 지도(📜)에 닿게 하세요. 빈 칸을 누르면 거울이 놓이고 돌아갑니다(／ → ＼ → 없음). 거울은 넷까지.</p><div class="lg-wrap"><div class="lg-lamp">🪔</div><div class="lg-grid">';
      for (var r = 0; r < 6; r++) for (var c = 0; c < 7; c++) { var ch = LG[r][c], m = M[r + ',' + c], on = t.lit[r + ',' + c]; h += '<button class="lg-c' + (ch === '#' ? ' box' : '') + (on ? ' on' : '') + '" data-rc="' + r + ',' + c + '">' + (ch === '#' ? '📦' : ch === '*' ? '<span class="lg-star' + (on ? ' lit' : '') + '">✦</span>' : ch === 'G' ? '📜' : m === '/' ? '<span class="mir">／</span>' : m ? '<span class="mir">＼</span>' : '') + '</button>'; }
      h += '<svg class="lg-beam" viewBox="-0.5 -0.5 7 6" preserveAspectRatio="none"><polyline points="' + t.pts.map(function (p) { return p[1] + ',' + p[0]; }).join(' ') + '"/></svg></div></div><p class="tiny-note">놓은 거울 ' + n + ' / 4</p>';
      w.innerHTML = h;
      w.querySelectorAll('.lg-c').forEach(function (b) {
        b.onclick = function () {
          var k = b.dataset.rc, rc = k.split(','), ch = LG[+rc[0]][+rc[1]]; if (ch !== '.') return;
          if (!M[k]) { if (Object.keys(M).length >= 4) return A.toast('거울은 넷뿐이에요'); M[k] = '/'; } else if (M[k] === '/') M[k] = 'B'; else delete M[k];
          A.tick(); draw();
          var tt = trace(M); if (tt.hit && tt.lit['2,3'] && tt.lit['4,1']) { S.f3.light = 1; A.save(); A.sfx('ok'); setTimeout(function () { A.closeModal(); var need = ['astro', 'light']; if (need.every(function (q) { return S.f3[q]; })) A.solve(R); else A.talk([['asaph', 0, '빛이 별 지도의 눈금에 닿았다. 이제 별 재는 기구만 맞추면 되겠구나.']]); }, 900); }
        };
      });
    }
    draw(); A.modal('놋거울과 등잔 빛', w);
  };

  // ── 4장 그 집 안: 세 예물의 그림자(넷 중 하나는 함정) + 구절 번호
  var SHADOWS = [['crown', '시 72:15', '<path d="M10 70 L18 30 L34 52 L50 22 L66 52 L82 30 L90 70 Z"/><rect x="10" y="72" width="80" height="10" rx="3"/>'], ['censer', '출 30:34', '<path d="M30 56 Q50 86 70 56 Z"/><rect x="44" y="84" width="12" height="8"/><path d="M28 52 H72 V58 H28 Z"/><path d="M44 46 Q38 30 50 22 Q62 14 54 4" fill="none" stroke="#000" stroke-width="4"/>'], ['tomb', '요 19:39', '<circle cx="50" cy="56" r="32"/><path d="M8 90 H92 V96 H8 Z"/>'], ['jar', '요 2:6', '<path d="M36 20 H64 V28 Q80 40 76 70 Q72 92 50 92 Q28 92 24 70 Q20 40 36 28 Z"/>']];
  var GIFT3 = [['gold', '황금', 'crown'], ['frank', '유향', 'censer'], ['myrrh', '몰약', 'tomb']];
  BN.PZ.gifts = function (R, A) {
    var f = (A.S().f4 = A.S().f4 || {}); if (f.gifts) return A.talk([['narr', 0, '황금과 유향과 몰약. 보배합은 열려 있다.']]);
    var r = A.seedRnd(46), order = SHADOWS.slice().sort(function () { return r() - .5; }), pick = {}, sel = null, w = A.el('div', 'shadow-pz');
    function draw() {
      w.innerHTML = '<p class="tiny-note howto">보배합 곁에 등잔을 놓자 벽에 그림자 넷이 비친다. 그림자 밑에는 구절 번호가 긁혀 있다. 예물을 누르고 그 예물의 그림자를 누르세요(그림자 하나는 예물의 것이 아니다).</p>';
      var gr = A.el('div', 'sh-gifts');
      GIFT3.forEach(function (g) { var b = A.el('button', 'sh-gift' + (sel === g[0] ? ' sel' : ''), '<img src="img/chars/gift_' + g[0] + '.webp" alt=""><span>' + g[1] + '</span>'); b.dataset.g = g[0]; b.onclick = function () { sel = sel === g[0] ? null : g[0]; draw(); }; gr.appendChild(b); });
      w.appendChild(gr);
      var wall = A.el('div', 'sh-wall');
      order.forEach(function (s) {
        var who = Object.keys(pick).find(function (k) { return pick[k] === s[0]; }), lab = who ? GIFT3.find(function (g) { return g[0] === who; })[1] : '';
        var b = A.el('button', 'sh-shadow' + (who ? ' on' : ''), '<svg viewBox="0 0 100 100">' + s[2] + '</svg><small>' + s[1] + '</small><b>' + lab + '</b>'); b.dataset.s = s[0];
        b.onclick = function () { if (!sel) return A.toast('먼저 예물을 고르세요'); Object.keys(pick).forEach(function (k) { if (pick[k] === s[0]) delete pick[k]; }); pick[sel] = s[0]; sel = null; A.tick(); draw(); };
        wall.appendChild(b);
      });
      w.appendChild(wall);
      var go = A.el('button', 'btn gold', '보배합 닫기'); w.appendChild(go);
      go.onclick = function () {
        if (A.locked('gifts')) return;
        if (Object.keys(pick).length < 3) return A.toast('세 예물을 모두 그림자에 놓아요');
        if (GIFT3.every(function (g) { return pick[g[0]] === g[2]; })) {
          var S = A.S(); f.pc = f.pc || []; if (f.pc.indexOf('D') < 0) { f.pc.push('D'); A.toast('🧩 보배합 바닥의 양피지 조각 (두루마리 조각 ' + f.pc.length + '/4)'); }
          f.gifts = 1; A.save(); A.sfx('ok');
          if (['cards', 'gifts', 'bow', 'jigsaw'].every(function (k) { return f[k]; })) { A.closeModal(); A.solve(R); }
          else { A.closeModal(); A.talk([['asaph', 0, '왕께 드리는 금, 거룩한 향의 유향, 그리고 장사 지낼 때 쓰는 몰약이로구나.']]); }
        } else A.wrong('gifts', '그림자가 흔들린다 — 아직이다');
      };
    }
    draw(); A.modal('세 예물의 그림자', w);
  };

  // ── 5장 남쪽 길: 지도 위에 손가락으로 길 긋기(헤브론 → 브엘세바 → 애굽 시내 → 애굽), 물·산·순찰 마을과 그 곁은 못 지남
  // 11/27 물 부대: 물은 네 걸음치, 우물(w)·브엘세바에서 다시 가득. 물 제한이 없으면 길이 2300가지(최단 17)지만 물 때문에 2가지(21걸음)만 남는다(route_gen2.py로 셈)
  var PG = ['~...B.^^', '~^..^..^', '~.^w...^', '~^.H.w^.', '~.^.....', '~^....^^', '~w...S^.', '~..^.v..', '~.Nw^..^', 'Ew......'], WATER = 4;
  function water(path) { var wv = WATER; for (var i = 1; i < path.length; i++) { if (wv <= 0) return -1; var ch = PG[path[i][0]][path[i][1]]; wv = (ch === 'w' || ch === 'S') ? WATER : wv - 1; } return wv; }
  BN.PATH5 = PG;
  function pbad(r, c) { var ch = PG[r][c]; if (ch === '~' || ch === '^' || ch === 'v') return true; return [[0, 1], [1, 0], [0, -1], [-1, 0]].some(function (d) { var rr = r + d[0], cc = c + d[1]; return rr >= 0 && rr < 10 && cc >= 0 && cc < 8 && PG[rr][cc] === 'v'; }) && 'BHSNEw'.indexOf(ch) < 0; }
  var TOWN = { B: '베들레헴', H: '헤브론', S: '브엘세바', N: '애굽 시내', E: '애굽' };
  BN.PZ.route = function (R, A) {
    var path = [], drawing = false, w = A.el('div', 'route-pz'), shook = 0;
    function cellAt(x, y) { var el = document.elementFromPoint(x, y); return el && el.closest && el.closest('.pm-c'); }
    function draw() {
      w.innerHTML = '<p class="tiny-note howto">베들레헴에서 손가락을 떼지 말고 애굽까지 길을 그으세요. 마을은 <b>가까운 곳부터</b> 들러요. 바다·산·순찰 마을(🏮)과 그 곁(붉은 칸)은 못 지나요. <b>물 부대는 네 걸음치</b> — 우물(💧)을 지나면 다시 가득 차요. 물이 떨어지면 나귀가 쓰러져요.</p><div class="pm-legend"><span>헤브론 — 아브람이 장막을 옮긴 곳(창 13:18)</span><span>브엘세바 — 아브라함이 판 우물이 있는 곳(창 21:30-31) · 여기서도 물을 채워요</span><span>애굽 시내 — 남쪽 경계(민 34:5)</span></div><p class="pm-water" id="pmWater"></p>';
      var g = A.el('div', 'pm-grid');
      for (var r = 0; r < 10; r++) for (var c = 0; c < 8; c++) {
        var ch = PG[r][c], k = r + ',' + c, inP = path.some(function (p) { return p[0] === r && p[1] === c; });
        var cls = 'pm-c' + (ch === '~' ? ' sea' : ch === '^' ? ' mt' : ch === 'v' ? ' vil' : ch === 'w' ? ' well' : pbad(r, c) ? ' seen' : TOWN[ch] ? ' town' : '') + (inP ? ' on' : '');
        var d = A.el('div', cls, ch === 'v' ? '🏮' : ch === '^' ? '⛰' : ch === 'w' ? '💧' : TOWN[ch] ? '<small>' + TOWN[ch] + (ch === 'S' ? ' 💧' : '') + '</small>' : ''); d.dataset.rc = k; g.appendChild(d);
      }
      w.appendChild(g);
      g.addEventListener('pointerdown', function (e) { var t = cellAt(e.clientX, e.clientY); if (!t) return; var rc = t.dataset.rc.split(',').map(Number); if (PG[rc[0]][rc[1]] !== 'B') return A.toast('베들레헴에서 시작하세요'); path = [rc]; drawing = true; g.setPointerCapture(e.pointerId); paint(); });
      g.addEventListener('pointermove', function (e) {
        if (!drawing) return; var t = cellAt(e.clientX, e.clientY); if (!t) return; var rc = t.dataset.rc.split(',').map(Number), lp = path[path.length - 1];
        if (rc[0] === lp[0] && rc[1] === lp[1]) return;
        if (path.length > 1 && rc[0] === path[path.length - 2][0] && rc[1] === path[path.length - 2][1]) { path.pop(); return paint(); }
        if (Math.abs(rc[0] - lp[0]) + Math.abs(rc[1] - lp[1]) !== 1) return;
        if (path.some(function (p) { return p[0] === rc[0] && p[1] === rc[1]; })) return;
        if (pbad(rc[0], rc[1])) { drawing = false; A.sfx('no'); A.toast('~^'.indexOf(PG[rc[0]][rc[1]]) >= 0 ? '지날 수 없는 곳이에요' : '순찰꾼의 등불이 닿는 곳이에요'); path = []; return paint(); }
        path.push(rc);
        if (water(path) < 0) { drawing = false; A.sfx('no'); A.toast('물이 떨어져 나귀가 주저앉았다 — 우물(💧)을 이어 가며 걸음을 세어 봐요'); path = []; return paint(); }
        paint();
      });
      g.addEventListener('pointerup', function () { if (!drawing) return; drawing = false; check(); });
      paint();
    }
    function paint() { w.querySelectorAll('.pm-c').forEach(function (d) { var rc = d.dataset.rc.split(',').map(Number); d.classList.toggle('on', path.some(function (p) { return p[0] === rc[0] && p[1] === rc[1]; })); });
      var wv = path.length ? water(path) : WATER, el = w.querySelector('#pmWater'); if (el) { el.innerHTML = '물 부대 ' + Array.from({ length: WATER }, function (_, i) { return '<i class="' + (i < wv ? 'on' : '') + '"></i>'; }).join('') + ' <b>' + Math.max(0, wv) + '걸음</b>'; el.classList.toggle('low', wv <= 1); } }
    function check() {
      if (A.locked('route')) { path = []; return paint(); }
      var last = path[path.length - 1]; if (!last || PG[last[0]][last[1]] !== 'E') { path = []; paint(); return A.toast('애굽까지 이어서 그어야 해요'); }
      var seq = path.map(function (p) { return PG[p[0]][p[1]]; }).filter(function (ch) { return 'HSN'.indexOf(ch) >= 0; }).join('');
      if (seq === 'HSN') bells(); else { A.wrong('route', '나귀가 길을 잃었다 — 마을을 가까운 차례로 들러야 한다'); path = []; paint(); }
    }
    if (/^(127\.0\.0\.1|localhost)$/.test(location.hostname) || /[?&]phonetest=1/.test(location.search)) BN.__routeOk = function () { bells(); };   // 시험용(로컬·폰 시험)
    function bells() {
      w.innerHTML = '<p class="tiny-note howto">먼 길이다. 지친 나귀가 멈춰 섰다. 방울을 세 번 울려 걸음을 깨우세요.</p>';
      var bell = A.el('button', 'rt-bell', '🔔'), cnt = A.el('p', 'bow-st', '0 / 3'); w.appendChild(bell); w.appendChild(cnt);
      var lastT = 0;
      function ring() { if (performance.now() - lastT < 350) return; lastT = performance.now(); shook++; cnt.textContent = shook + ' / 3'; bell.classList.remove('ring'); void bell.offsetWidth; bell.classList.add('ring'); A.sfx('ok'); if (shook >= 3) { window.removeEventListener('devicemotion', mot); setTimeout(function () { A.closeModal(); A.solve(R); }, 600); } }
      function mot(e) { var a = e.accelerationIncludingGravity || e.acceleration; if (!a) return; var m = Math.sqrt((a.x || 0) * (a.x || 0) + (a.y || 0) * (a.y || 0) + (a.z || 0) * (a.z || 0)); if (m > 22) ring(); }
      bell.onclick = ring;
      var DM = window.DeviceMotionEvent; if (DM && typeof DM.requestPermission === 'function') { var p = A.el('button', 'btn ghost', '흔들기 켜기'); p.onclick = function () { DM.requestPermission().then(function (s) { if (s === 'granted') window.addEventListener('devicemotion', mot); }).catch(function () {}); }; w.appendChild(p); } else window.addEventListener('devicemotion', mot);
    }
    draw(); A.modal('애굽으로 가는 길', w);
  };
})(window.BN);
