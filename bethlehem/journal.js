// 「베들레헴의 밤」 퀘스트 저널(2026-11-27) — 퀘스트 · 증거판(단서와 풀린 의문 · 기록에 남은 일) · 줄거리
// 화면 왼쪽 위 「📖 저널」 버튼, 지도에서는 지금 퀘스트 카드(지도에서 보기). game.js 다음에 읽는다(BN.ui 사용).
(function (BN) {
  var U = BN.ui; if (!U) return;
  var Q = {
    wellroom: ['우물에 빠진 밤', '성탄 전야, 말씀우물 바닥의 두루마리 방에 떨어졌다. 찢긴 성탄 두루마리를 이어 이 밤의 첫 줄을 찾자.'],
    gate: ['명부의 빈칸', '베들레헴 성문에서 인구조사 명부를 맡았다. 다윗 집안 칸이 찢겨 있다 — 계보를 이어 명부를 되살리자.'],
    road: ['나사렛에서 오는 길', '요셉과 마리아가 걸어온 길. 길가의 지도 상자를 열 실마리가 필요하다.'],
    inn: ['여관에 있을 곳', '여관 주인이 오늘 밤 손님들 방을 정해 달라고 한다. 손님 쪽지가 마당에 흩어졌다.'],
    kitchen: ['똑같이 나눈 기름', '여관 주인의 부탁 — 기름을 두 손님께 똑같이. 눈금 있는 그릇은 없다.'],
    well: ['성문 곁 우물', '다윗이 그리워한 그 우물(삼하 23:15). 깊은 바닥에 무언가 있다.'],
    field: ['밤에 양 떼를 지키던 목자들', '들판의 목자들(눅 2:8). 그들의 상자에 무언가 맡겨져 있다.'],
    angel: ['하늘의 노래', '주의 사자와 천군이 나타났다. 흩어진 찬송을 다시 이어야 한다.'],
    stable: ['구유의 표적', '천사가 말한 표적을 어두운 마구간에서 찾자(눅 2:12).'],
    house8: ['여드레째, 그 이름', '할례하는 날, 아기의 이름을 명부에 적어야 한다(눅 2:21).'],
    climb: ['성전에 올라가는 길', '정결예식의 날이 차서 예루살렘으로 오른다(눅 2:22). 제물로 드릴 산비둘기가 필요하다.'],
    tgate: ['성전 문의 날수', '성전 문지기가 묻는다 — 이름 받은 날부터 며칠째인가?'],
    court: ['율법대로 드린 제물', '비둘기 장수에게서 율법대로 제물을 마련하자(레 12:8).'],
    porch: ['위로를 기다리는 사람', '솔로몬 행각에서 이스라엘의 위로를 기다리는 노인을 만난다(눅 2:25).'],
    anna: ['기도하는 이의 이름', '성전을 떠나지 않고 기도하던 여선지자는 누구일까(눅 2:36-37)?'],
    magi: ['동방에서 온 손님', '별을 보고 온 박사들의 천막. 오늘 밤 그 별은 어디에 있을까?'],
    archive: ['선지자의 기록', '헤롯이 그리스도가 날 곳을 묻는다(마 2:4). 서고에서 그 말씀을 찾아야 한다.'],
    council: ['가만히 부른 손님', '헤롯이 박사들을 가만히 부르려 한다(마 2:7). 시종들의 말이 엇갈린다.'],
    hall: ['왕의 편지', '헤롯이 박사들에게 편지를 들려 보낸다. 진짜 편지와 그 속셈은?'],
    roof: ['다시 나타난 별', '왕궁 지붕에서 그 별을 다시 찾자(마 2:9).'],
    nightroad: ['별이 머문 곳', '별이 베들레헴 지붕들 위를 옮겨 다닌다. 아기가 있는 집은 어디일까?'],
    innl: ['몇 달 뒤의 여관', '그 밤의 여관을 다시 찾았다. 그 가족은 지금 어디에 있을까?'],
    door: ['그 집 문 앞', '조용히, 약속된 가락으로 문을 두드려야 한다.'],
    worship: ['엎드려 경배하니', '박사들이 집에 들어가 아기께 경배하고 예물을 드린다(마 2:11).'],
    dream: ['요셉의 꿈', '박사들이 떠난 밤, 주의 사자가 요셉에게 나타났다(마 2:13).'],
    pack: ['떠날 채비', '오늘 밤 안에 애굽으로 — 짐을 꾸려야 한다.'],
    escape: ['등불 피해 골목으로', '헤롯의 순찰꾼들이 골목을 지킨다. 들키지 않고 성문까지.'],
    dawn: ['애굽으로 가는 길', '남쪽 광야를 건너 애굽까지(마 2:14-15).'],
    wellgate: ['우물 문', '열두 도장과 다섯 장의 숫자로, 말씀우물로 돌아가는 문을 열자.']
  };
  var STORY = [
    ['우물에 빠진 밤', '성탄 전야, 말씀우물에 빠진 나는 바닥의 두루마리 방에서 찢긴 「성탄 두루마리」를 만났다. 우물지기는 마지막 문장의 열두 글자가 베들레헴의 밤 곳곳에 도장으로 숨어 있다고 했다.'],
    ['1장 · 그 밤', '견습 서기관이 되어 아삽 노인, 길르앗과 함께 베들레헴의 인구조사를 돕는다. 요셉과 마리아가 다윗의 동네에 왔지만 여관에는 있을 곳이 없었다. 들판의 목자들에게 천사가 나타나 구주의 나심을 알렸고, 우리는 구유에 누인 아기를 보았다.'],
    ['2장 · 여드레째 · 사십일째', '여드레째, 아기의 이름은 천사가 일컬은 대로 「예수」. 정결예식의 날이 차서 가족은 예루살렘 성전에 올라가 율법대로 제물을 드렸다. 성전에서 시므온과 안나가 오래 기다리던 그 아기를 알아보았다.'],
    ['3장 · 동방에서 온 손님', '동방에서 박사들이 별을 보고 왔다. 헤롯과 온 예루살렘이 소동했고, 대제사장과 서기관들은 선지자의 글대로 베들레헴을 가리켰다. 헤롯은 박사들을 가만히 불러 속셈을 숨겼지만, 그 별이 다시 나타나 박사들을 앞서 인도했다.'],
    ['4장 · 별이 머문 집', '별이 머문 집에서 박사들은 아기와 그의 어머니 마리아를 보고 엎드려 경배하며 황금과 유향과 몰약을 드렸다. 그리고 꿈의 지시대로 다른 길로 돌아갔다.'],
    ['5장 · 애굽으로 가는 밤길', '주의 사자가 요셉의 꿈에 나타나 애굽으로 피하라 했다. 그 밤 가족은 길을 떠났고, 우리는 등불을 피해 골목을 빠져나와 남쪽 광야 길을 함께 걸었다.']
  ];
  // 증거로 푸는 의문(장마다 하나, 그 장소를 풀면 열림) — 맞히면 그 장의 등잔 기름 한 방울
  var ASK = [
    { k: 'q1', after: 'stable', q: '천사가 목자들에게 말한 「표적」에 들어 있지 않은 것은?', a: ['강보', '구유', '금 그릇'], ok: 2, ref: '누가복음 2:12', tip: '마구간에서 찾은 것과 천사의 말을 견주어 봐.' },
    { k: 'q2', after: 'porch', q: '시므온이 성전에 들어온 것은 무엇 때문이었나?', a: ['성령의 감동으로', '꿈에 지시를 받아', '제사장이 불러서'], ok: 0, ref: '누가복음 2:27', tip: '시므온 이야기 바로 앞뒤 절을 읽어 봐.' },
    { k: 'q3', after: 'council', q: '헤롯이 박사들을 가만히 불러 자세히 물은 것은?', a: ['별이 나타난 때', '아기의 이름', '박사들의 고향'], ok: 0, ref: '마태복음 2:7', tip: '회의실 시종들이 엿들은 말과 마태복음 2장 7절.' },
    { k: 'q4', after: 'worship', q: '박사들이 아기를 만나 경배한 곳은?', a: ['집', '마구간', '성전'], ok: 0, ref: '마태복음 2:11', tip: '박사들이 「들어간」 곳을 그대로 읽어 봐.' },
    { k: 'q5', after: 'dream', q: '요셉이 아기와 그의 어머니를 데리고 애굽으로 떠난 때는?', a: ['밤', '새벽', '한낮'], ok: 0, ref: '마태복음 2:14', tip: '두루마리에 떠오른 그 절을 다시 봐.' }
  ];
  function order() {
    var L = ['wellroom'];
    for (var c = 1; c <= 5; c++) { var st = (BN.CHAPTERS[c] || {}).start; if (st && L.indexOf(st) < 0) L.push(st); BN.SPOTS.forEach(function (s) { if ((s.ch || 1) === c && L.indexOf(s.id) < 0) L.push(s.id); }); if (c === 1 && L.indexOf('kitchen') < 0) L.splice(L.indexOf('inn') + 1, 0, 'kitchen'); }
    return L.filter(function (k) { return Q[k]; });
  }
  function chOf(k) { if (k === 'wellroom') return 0; if (k === 'kitchen') return 1; var s = BN.SPOTS.find(function (x) { return x.id === k; }); if (s) return s.ch || 1; for (var c = 1; c <= 5; c++) if ((BN.CHAPTERS[c] || {}).start === k) return c; return 1; }
  function spotName(k) { var s = BN.SPOTS.find(function (x) { return x.id === k; }); return s ? s.name : ((BN.ROOMS[k] || {}).title || k).split(' · ')[0]; }
  function current() {
    var S = U.S(); if (!S) return null; var cur = U.cur();
    if (cur && Q[cur] && !S.rooms[cur]) return cur;
    var L = order(), ch = S.ch || 1;
    if (!S.rooms.wellroom) return 'wellroom';
    var st = (BN.CHAPTERS[ch] || {}).start; if (st && !S.rooms[st]) return st;
    for (var i = 0; i < L.length; i++) { var k = L[i]; if (chOf(k) !== ch || S.rooms[k]) continue; if (k === 'kitchen' && !S.rooms.inn) continue; if (U.unlocked(k)) return k; }
    return null;
  }
  function needIn(k) {
    var S = U.S(), R = BN.ROOMS[k]; if (!R) return null; var got = 0, all = 0, C = S.clues || {};
    R.spots.forEach(function (sp) { var m = /^puzzle:(\w+)/.exec(sp.act || ''); if (!m) return; var N = (BN.NEED || {})[m[1]]; if (!N || (N.when && !N.when(S))) return; N.c.forEach(function (c) { all++; if (C[c]) got++; }); });
    return all ? [got, all] : null;
  }
  // 못 찾은 단서의 대략 자리(왼쪽 위쯤 · 가운데쯤 · 오른쪽 아래쯤)
  function where(x, y) { var h = x < 34 ? '왼쪽' : x > 66 ? '오른쪽' : '가운데', v = y < 36 ? '위' : y > 64 ? '아래' : ''; return (h === '가운데' && !v) ? '한가운데' : h + (v ? ' ' + v : ''); }
  BN.clueHint = function (k) {
    var S = U.S(), R = BN.ROOMS[k]; if (!R || !S || S.rooms[k]) return null; var C = S.clues || {}, need = {};
    R.spots.forEach(function (sp) { var m = /^puzzle:(\w+)/.exec(sp.act || ''); if (!m) return; var N = (BN.NEED || {})[m[1]]; if (!N || (N.when && !N.when(S))) return; N.c.forEach(function (c) { need[c] = 1; }); });
    var miss = R.spots.filter(function (sp) { var m = /^clue:(\w+)/.exec(sp.act || ''); return m && need[m[1]] && !C[m[1]] && (!sp.when || sp.when(S)); });
    if (!miss.length) return null;
    var places = []; miss.forEach(function (sp) { var w = where(sp.x, sp.y); if (places.indexOf(w) < 0) places.push(w); });
    return { n: miss.length, places: places };
  };
  function nextStep(k) {
    if (!k) return '이 장의 장소를 모두 풀었어요. 다음 장으로!';
    var S = U.S(), here = U.cur() === k, n = needIn(k);
    var has = function (x) { return S.items.indexOf(x) >= 0; }, used = BN.used || function () { return false; };
    if (!here) return k === 'kitchen' ? (used('kitchen', 'keys') ? '여관에 들어가 부엌 문으로 가세요.' : '여관 부엌 문이 잠겨 있어요. 여관의 문제를 풀면 열쇠를 받을 거예요 — 가방에서 「손에 들기」 → 부엌 문.') : '지도에서 「' + spotName(k) + '」(으)로 가세요.';
    // 1장 견본: 도구 흐름
    if (k === 'gate' && !(S.f1 || {}).guards) return '문지기 셋 가운데 참말을 하는 한 명을 가려 빈 등잔을 찾으세요(성문 가운데).';
    if (k === 'kitchen' && !has('lamp')) return !has('oil') ? '부엌의 큰 항아리에서 기름부터 챙기세요.' : !has('lamp_e') ? '빈 등잔은 성문 문지기들이 맡아 두었대요.' : !has('flint') ? '불을 붙일 게 없어요 — 나사렛 길의 지도 상자를 열어 보세요.' : '빈 등잔 · 기름 · 부싯돌 — 가방에서 셋을 골라 「합치기」.';
    if (k === 'well' && !used('wellin', 'lamp')) return has('lamp') ? '켜진 등잔을 가방에서 「손에 들기」 → 우물 안을 누르세요.' : '우물 안이 깜깜해요. 켜진 등잔이 있어야 해요(여관 부엌에서 만들 수 있어요).';
    if (k === 'well' && !used('wellin', 'bucket')) return has('bucket') ? '줄 맨 두레박을 「손에 들기」 → 우물 안.' : !has('bucket_b') ? '우물가의 끊어진 두레박을 챙기세요.' : !has('rope') ? '두레박에 맬 튼튼한 줄이 필요해요 — 여관 나귀 짐을 보세요.' : '끊어진 두레박 + 밧줄을 가방에서 「합치기」.';
    if (k === 'well' && !has('lens')) return '벽 글씨가 너무 작아요 — 작은 글씨를 키워 볼 맑은 돌이 필요해요(여관 부엌).';
    if (k === 'stable' && !used('search', 'lamp')) return '굴 안이 깜깜해요 — 켜진 등잔을 「손에 들기」 → 굴을 누르세요.';
    if (n && n[0] < n[1]) return '이곳을 뒤져 단서를 더 찾으세요 — ' + n[0] + ' / ' + n[1];
    return n ? '단서를 다 모았어요. 이제 풀 차례예요.' : '이곳을 살펴보고 문제를 푸세요.';
  }
  function progress() { var S = U.S(), L = order(); return [L.filter(function (k) { return S.rooms[k]; }).length, L.length]; }

  // ── 저널 창
  function journal(tab) {
    var S = U.S(); if (!S) return; tab = tab || 'q';
    var w = document.createElement('div'); w.className = 'jr';
    var P = progress(), c = current();
    var tabs = '<div class="jr-tabs">' + [['q', '퀘스트'], ['e', '증거판'], ['s', '줄거리']].map(function (t) { return '<button data-t="' + t[0] + '" class="' + (tab === t[0] ? 'on' : '') + '">' + t[1] + '</button>'; }).join('') + '</div>';
    var body = '';
    if (tab === 'q') {
      body += '<p class="jr-sum">조사 진행 ' + P[0] + ' / ' + P[1] + ' · 도장 ' + Object.keys(S.rooms).filter(function (k) { return BN.STAMPS[k]; }).length + ' / 12</p>';
      if (c) body += '<div class="jr-card now"><small>진행 중</small><b>' + Q[c][0] + '</b><p>' + Q[c][1] + '</p><p class="jr-next">' + nextStep(c) + '</p>' + (U.cur() !== c ? '<button class="btn ghost jr-map" data-k="' + c + '">🧭 지도에서 보기</button>' : '') + '</div>';
      else body += '<div class="jr-card now"><small>진행 중</small><b>다음 장으로</b><p>이 장의 장소를 모두 풀었어요.</p></div>';
      var done = order().filter(function (k) { return S.rooms[k]; }).sort(function (a, b) { return (S.rooms[b].at || 0) - (S.rooms[a].at || 0); });
      if (done.length) body += '<details class="jr-card" open><summary>완료한 퀘스트 · ' + done.length + '</summary>' + done.map(function (k) { var R = BN.ROOMS[k] || {}, I = (BN.STAMP_ICON || {})[k]; return '<div class="jr-done"><b>' + Q[k][0] + '</b><span>' + (R.note && R.note.text ? R.note.text : '해결했다.') + '</span>' + (I ? '<em>' + I[0] + ' ' + I[1] + ' · ' + I[2] + '</em>' : '') + '</div>'; }).join('') + '</details>';
    } else if (tab === 'e') {
      body += '<p class="jr-sum">확인한 단서와 풀린 의문을 다시 볼 수 있어요.</p>';
      var asks = ASK.filter(function (a) { return S.rooms[a.after]; });
      S.asked = S.asked || {};
      if (asks.length) body += '<details class="jr-card" open><summary>단서로 풀 의문</summary>' + asks.map(function (a) {
        if (S.asked[a.k]) return '<div class="jr-q done"><b>✔ ' + a.q + '</b><span>' + a.a[a.ok] + ' — ' + a.ref + '</span></div>';
        return '<div class="jr-q" data-k="' + a.k + '"><b>' + a.q + '</b><div>' + a.a.map(function (x, i) { return '<button data-i="' + i + '">' + x + '</button>'; }).join('') + '</div><small>' + a.tip + '</small></div>';
      }).join('') + '</details>';
      var notes = (S.notes || []).slice().reverse();
      body += '<details class="jr-card" open><summary>단서와 기록 · ' + notes.length + '</summary>' + (notes.length ? notes.map(function (n) { return '<div class="jr-note">' + n.text + (n.ref ? '<em>' + n.ref + '</em>' : '') + '</div>'; }).join('') : '<p class="jr-empty">아직 없어요. 장소를 뒤지면 단서가 여기에 모여요.</p>') + '</details>';
      var tl = order().filter(function (k) { return S.rooms[k] && (BN.STAMP_ICON || {})[k]; });
      if (tl.length) body += '<p class="jr-h">기록에 남은 일</p>' + tl.map(function (k) { var I = BN.STAMP_ICON[k]; return '<div class="jr-tl"><b>' + I[2] + '</b><span>' + I[0] + ' ' + Q[k][0] + '</span></div>'; }).join('');
    } else {
      var chDone = S.chDone || {}, chNow = S.ch || 1;
      body += '<p class="jr-h">지금까지의 줄거리</p>';
      STORY.forEach(function (st, i) {
        var show = i === 0 ? !!S.rooms.wellroom : (chDone[i] != null || S.finished);
        if (show) body += '<div class="jr-story"><b>' + st[0] + '</b><p>' + st[1] + '</p></div>';
        else if (i === chNow && S.rooms.wellroom) body += '<div class="jr-story now"><b>' + st[0] + ' — 진행 중</b><p>' + (c ? Q[c][1] : '') + '</p></div>';
      });
    }
    w.innerHTML = tabs + '<div class="jr-body">' + body + '</div>';
    U.modal('📖 퀘스트 저널', w);
    w.querySelectorAll('.jr-tabs button').forEach(function (b) { b.onclick = function () { journal(b.dataset.t); }; });
    var mb = w.querySelector('.jr-map'); if (mb) mb.onclick = function () { U.showOnMap(mb.dataset.k === 'kitchen' ? 'inn' : mb.dataset.k); };
    w.querySelectorAll('.jr-q[data-k] button').forEach(function (b) {
      b.onclick = function () {
        var a = ASK.find(function (x) { return x.k === b.closest('.jr-q').dataset.k; });
        if (+b.dataset.i === a.ok) { S.asked[a.k] = 1; U.oilAdd(1); U.sfx('ok'); U.toast('의문이 풀렸다 — 등잔 기름 한 방울을 얻었어요'); journal('e'); }
        else { U.sfx('no'); U.toast('아니야 — ' + a.ref + '을(를) 다시 읽어 봐'); }
      };
    });
  }
  BN.journal = journal;

  // ── 화면 왼쪽 위: 저널 버튼 + (지도에서) 지금 퀘스트 카드
  var btn = document.createElement('button'); btn.className = 'jr-btn'; btn.innerHTML = '📖<span></span>'; btn.title = '퀘스트 저널'; btn.onclick = function () { journal('q'); };
  var hl = document.querySelector('.hud-l'); if (hl) hl.appendChild(btn);
  var card = document.createElement('div'); card.className = 'jr-float'; card.hidden = true; document.body.appendChild(card);
  var pop = document.createElement('div'); pop.className = 'jr-pop clue-left'; pop.hidden = true; document.body.appendChild(pop); pop.onclick = function () { pop.hidden = true; };
  var pill = document.createElement('button'); pill.className = 'jr-pill'; pill.hidden = true; document.body.appendChild(pill); pill.onclick = function () { var h = BN.clueHint(U.cur()); if (h) { pop.innerHTML = '<div class="cl-h">🔎 반짝였던 곳</div><div class="cl-chips">' + h.places.map(function (x) { return '<span>' + x + '</span>'; }).join('') + '</div>'; pop.hidden = false; clearTimeout(pop.t); pop.t = setTimeout(function () { pop.hidden = true; }, 4500); } else journal('q'); };
  setInterval(function () {   // 방 안: 찾을 단서가 남았으면 「🔎 이곳의 단서 n/m」
    var k = U.cur(), n = k ? needIn(k) : null, S = U.S();
    if (!k || !n || n[0] >= n[1] || (S && S.rooms[k])) { pill.hidden = true; return; }
    pill.textContent = '🔎 이곳의 단서 ' + n[0] + ' / ' + n[1]; pill.hidden = false;
  }, 700);
  var sig = '';
  setInterval(function () {
    var S = U.S(); if (!S || !S.opening && !S.rooms.wellroom) { card.hidden = true; return; }
    var scr = U.screen(), c = current(), P = progress(), s = [scr, c, P.join('/'), U.cur(), JSON.stringify(needIn(c || '') || '')].join('|');
    if (s === sig) return; sig = s;
    if (scr !== 'map' || !c) { card.hidden = true; return; }
    var fold = false; try { fold = localStorage.getItem('bethlehem.jrfold') === '1'; } catch (e) {}
    card.classList.toggle('fold', fold);
    card.innerHTML = '<small>진행 중</small><b>' + (fold ? '📜 ' : '') + Q[c][0] + '</b><p>' + nextStep(c) + '</p><button class="jr-go">🧭 지도에서 보기</button><button class="jr-fold" aria-label="접기">' + (fold ? '▸' : '▾') + '</button>';
    card.hidden = false;
    card.querySelector('.jr-fold').onclick = function (e) { e.stopPropagation(); try { localStorage.setItem('bethlehem.jrfold', fold ? '0' : '1'); } catch (er) {} sig = ''; };
    card.querySelector('.jr-go').onclick = function (e) { e.stopPropagation(); U.showOnMap(c === 'kitchen' ? 'inn' : c); };
    card.onclick = function () { journal('q'); };
  }, 800);
})(window.BN);
