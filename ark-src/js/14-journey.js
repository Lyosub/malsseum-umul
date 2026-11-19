  // ════════ 「본향을 향하여」(히 11:16) — 긴 이야기: 서장 · 1부 믿음의 증표 · 2부 열두 기초석 · 3부 골짜기 · 4부 진주 문 ════════
  var STORY = { started: false, tokens: {}, s: { walk: 0, swim: 0, ladder: 0, shadows: 0, night: 0, bedsOut: 0, pitch: 0, arkY: {}, regions: {}, ararat: 0, laps: 0, lapDay: -1, lapAng: null, lapAcc: 0 },
    lamps: [0, 0, 0, 0, 0, 0, 0], sockets: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], done: false, ended: false };
  function mergeStory(o) {
    if (!o) return;
    STORY.started = !!o.started; STORY.done = !!o.done; STORY.ended = !!o.ended; STORY.tokens = o.tokens || {};
    if (o.s) for (var k in o.s) STORY.s[k] = o.s[k];
    if (o.lamps && o.lamps.length === 7) STORY.lamps = o.lamps; if (o.sockets && o.sockets.length === 12) STORY.sockets = o.sockets;
  }
  try { mergeStory(JSON.parse(localStorage.getItem('arkVillage.story') || 'null')); } catch (e) {}
  function saveStory() { try { localStorage.setItem('arkVillage.story', JSON.stringify(STORY)); } catch (e) {} stateDirty(); }
  var ARARAT_TOP = 70;   // 아라랏 산 꼭대기로 치는 높이(가장 높은 곳이 76칸 — 시험으로 맞춤)
  var REGION_NAMES = { east: '동쪽 숲', west: '서쪽 산', lake: '남쪽 호수', sea: '북쪽 바다', desert: '동쪽 사막', oasis: '오아시스', ararat: '아라랏 산', tar: '역청 구덩이' };
  function sheepCount() { return HERD.filter(function (h) { return h.k === 'sheep'; }).length; }
  function nK(o) { return Object.keys(o || {}).length; }
  // 일곱 증표(히 11) — [키, 이름, 그림, 구절 장절, 구절, 할 일들, 받는 힘]
  var TOKENS = [
    ['abel', '아벨의 증표', '🐑', '히브리서 11:4', '믿음으로 아벨은 가인보다 더 나은 제사를 하나님께 드림으로 의로운 자라 하시는 증거를 얻었으니 하나님이 그 예물에 대하여 증언하심이라 그가 죽었으나 그 믿음으로써 지금도 말하느니라',
      function () { return [['내 땅 우리에서 양 12마리 기르기', sheepCount(), 12]]; }, '체력이 두 배 빨리 차올라요'],
    ['enoch', '에녹의 증표', '👣', '히브리서 11:5', '믿음으로 에녹은 죽음을 보지 않고 옮겨졌으니 하나님이 그를 옮기심으로 다시 보이지 아니하였느니라 그는 옮겨지기 전에 하나님을 기쁘시게 하는 자라 하는 증거를 받았느니라',
      function () { return [['걸어서 2만 칸 다니기', Math.floor(STORY.s.walk), 20000]]; }, '걷기·달리기가 10% 빨라져요'],
    ['noah', '노아의 증표', '⛵', '히브리서 11:7', '믿음으로 노아는 아직 보이지 않는 일에 경고하심을 받아 경외함으로 방주를 준비하여 그 집을 구원하였으니 이로 말미암아 세상을 정죄하고 믿음을 따르는 의의 상속자가 되었느니라',
      function () { return [['역청 칠한 나무 300개 만들기', STORY.s.pitch, 300], ['방주 하층·중층·상층 모두 가 보기', nK(STORY.s.arkY), 3]]; }, '물속에서 숨을 두 배 오래 참아요'],
    ['abraham', '아브라함의 증표', '⛺', '히브리서 11:8', '믿음으로 아브라함은 부르심을 받았을 때에 순종하여 장래의 유업으로 받을 땅에 나아갈새 갈 바를 알지 못하고 나아갔으며',
      function () { return [['여덟 곳 모두 가 보기(숲·산·호수·바다·사막·오아시스·아라랏 산·역청 구덩이)', nK(STORY.s.regions), 8], ['아라랏 산 꼭대기에 오르기', STORY.s.ararat, 1], ['마을 밖에서 침대에 누워 일곱 밤 자기', STORY.s.bedsOut, 7]]; }, '기운이 천천히 줄어요'],
    ['jacob', '야곱의 증표', '🪜', '히브리서 11:21', '믿음으로 야곱은 죽을 때에 요셉의 각 아들에게 축복하고 그 지팡이 머리에 의지하여 경배하였으며',
      function () { return [['사닥다리로 모두 120칸 오르기', Math.floor(STORY.s.ladder), 120]]; }, '사닥다리를 두 배 빨리 올라요'],
    ['moses', '모세의 증표', '🌊', '히브리서 11:29', '믿음으로 그들은 홍해를 육지 같이 건넜으나 애굽 사람들은 이것을 시험하다가 빠져 죽었으며',
      function () { return [['물에서 모두 600칸 헤엄치기', Math.floor(STORY.s.swim), 600], ['어둠의 그림자 40번 물리치기', STORY.s.shadows, 40]]; }, '헤엄이 빨라져요'],
    ['jericho', '여리고와 기드온의 증표', '📯', '히브리서 11:30 · 사사기 7:20', '믿음으로 칠 일 동안 여리고를 도니 성이 무너졌으며 (히 11:30) — 세 대가 나팔을 불며 항아리를 부수고 왼손에 횃불을 들고 오른손에 나팔을 들어 불며 외쳐 이르되 여호와와 기드온의 칼이다 하고 (삿 7:20)',
      function () { return [['하루(해 뜰 때부터 다음 해 뜰 때까지) 안에 방주 둘레 일곱 바퀴 돌기', Math.min(7, STORY.s.laps), 7], ['밤에 어둠의 그림자 30번 물리치기', STORY.s.night, 30]]; }, '어둠의 그림자에게 주는 힘 +1']
  ];
  function tokenTasks(t) { return t[5](); }
  function tokenReady(t) { return tokenTasks(t).every(function (q) { return q[1] >= q[2]; }); }
  function has(k) { return !!STORY.tokens[k]; }
  function partOf() {
    if (!STORY.started) return 0;
    if (nK(STORY.tokens) < 7) return 1;
    if (!FS_NAMES.every(function (n, i) { return have(FSTONE0 + i) > 0 || STORY.sockets[i]; })) return 2;
    if (STORY.lamps.some(function (v) { return !v; })) return 3;
    return 4;
  }
  var PART_NAMES = ['서장 「떠나라」', '1부 「믿음의 증표」', '2부 「열두 기초석」', '3부 「사망의 음침한 골짜기」', '4부 「진주 문」'];
  function storyCard(emoji, name, text, ref, sub, ms) {
    $('cardEmoji').textContent = emoji; $('cardName').textContent = name; $('cardText').textContent = text; $('cardRef').textContent = ref; $('cardNew').textContent = sub || '';
    $('card').classList.add('show'); sfx('craft', 1400); clearTimeout(cardT); cardT = setTimeout(function () { $('card').classList.remove('show'); }, ms || 14000);
  }
  function startStory() {
    if (STORY.started) { openStory(); return; }
    if (qStep < QUEST.length && !isAdm()) { storyCard('🧭', '안내하는 나그네', '여호와께서 아브람에게 이르시되 너는 너의 고향과 친척과 아버지의 집을 떠나 내가 네게 보여 줄 땅으로 가라', '창세기 12:1', '먼저 위의 할 일(첫 집 짓기)을 다 마치면 길을 떠날 수 있어요'); return; }
    STORY.started = true; saveStory();
    storyCard('🧭', '서장 「떠나라」', '여호와께서 아브람에게 이르시되 너는 너의 고향과 친척과 아버지의 집을 떠나 내가 네게 보여 줄 땅으로 가라', '창세기 12:1', '본향을 향한 길이 시작됐어요 — 메뉴 → 📜 나그네의 길에서 할 일을 봐요', 16000);
    renderQuest();
  }
  // 걸음·헤엄·사닥다리·방주 둘레 바퀴(매 프레임)
  function storyStep(dt, moved) {
    if (!STORY.started || !vitalsOn() && !isAdm()) return;
    var s = STORY.s;
    if (P.swim) s.swim += moved; else if (P.ground && !riding) s.walk += moved;
    if (P.ladder && P.vy > 0) s.ladder += P.vy * dt;
    // 방주 둘레: 방주 밖, 방주를 둘러싼 테 안에서 각도를 모아 바퀴 수로
    var cx = XM, cz = (AZ0 + AZ1) / 2, dx = P.x - cx, dz = P.z - cz, ring = Math.abs(dx) <= 230 && Math.abs(dz) <= 120 && !(Math.abs(dx) < 152 && Math.abs(dz) < 27);
    var day = Math.floor((dayT + DAY_LEN * 0.06) / DAY_LEN);
    if (day !== s.lapDay) { s.lapDay = day; s.lapAcc = 0; s.lapAng = null; }
    if (ring) { var a = Math.atan2(dz, dx); if (s.lapAng !== null) { var da = a - s.lapAng; while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2; s.lapAcc += da; } s.lapAng = a; s.laps = Math.max(s.laps || 0, Math.floor(Math.abs(s.lapAcc) / (Math.PI * 2))); }
    else s.lapAng = null;
  }
  // 1초마다: 가 본 곳, 증표 받기, 성문, 엔딩
  var storyT = 0;
  function storyTick(dt) {
    if (!STORY.started) return;
    storyT -= dt; if (storyT > 0) return; storyT = 1;
    var s = STORY.s, x = Math.floor(P.x), z = Math.floor(P.z), reg = region(x, z), pn = placeName(), ch = false;
    if (REGION_NAMES[reg] && !s.regions[reg]) { s.regions[reg] = 1; ch = true; toast('📜 「' + REGION_NAMES[reg] + '」에 왔어요 (' + nK(s.regions) + '/8)'); }
    var ak = pn === '방주 하층' ? 'lo' : pn === '방주 중층' ? 'mid' : pn === '방주 상층' ? 'hi' : '';
    if (ak && !s.arkY[ak]) { s.arkY[ak] = 1; ch = true; }
    if (reg === 'ararat' && P.y >= ARARAT_TOP && !s.ararat) { s.ararat = 1; ch = true; toast('⛰ 아라랏 산 꼭대기에 올랐어요 (창 8:4)'); }
    TOKENS.forEach(function (t) {
      if (has(t[0]) || !tokenReady(t)) return;
      STORY.tokens[t[0]] = Date.now(); ch = true;
      storyCard(t[2], '믿음의 증표 — ' + t[1], t[4], t[3], '받은 힘: ' + t[6] + ' · 증표 ' + nK(STORY.tokens) + '/7');
      if (nK(STORY.tokens) === 7) { unlock('tokens'); setTimeout(function () { toast('🎖 일곱 증표를 다 받았어요! 2부 「열두 기초석」 — 세상 곳곳 땅속의 보석을 찾아요'); }, 15000); }
    });
    if (!STORY.done && STORY.sockets.every(Boolean) && nK(STORY.tokens) === 7 && STORY.lamps.every(Boolean)) openGates();
    if (STORY.done && !STORY.ended && cityInside(x, z)) showEnding();
    if (ch) saveStory();
    if (ui === 'play' && qStep >= QUEST.length) renderQuest();
  }
  // 3부: 등잔대를 횃불로 밝히기
  function localSet(x, y, z, id) { NET.applying = true; try { setBlock(x, y, z, id); } finally { NET.applying = false; } }
  function useLampstand(x, y, z) {
    var k = -1; DUN_LAMPS.forEach(function (c, i) { if (DUN.x0 + c[0] * DUN.cs + 2 === x && DUN.z0 + c[1] * DUN.cs + 2 === z) k = i; });
    if (k < 0) return;
    if (STORY.lamps[k]) return toast('이미 밝힌 등잔대예요 (' + STORY.lamps.filter(Boolean).length + '/7)');
    if (!(HOTBAR[sel] === TORCH && have(TORCH) > 0)) return deny('횃불을 손에 들고 누르면 등잔대에 불을 밝혀요');
    take(TORCH, 1); bagChanged(); STORY.lamps[k] = 1; localSet(x, y, z, LAMPSTAND + 1); saveStory(); sfx('craft', 900);
    var n = STORY.lamps.filter(Boolean).length;
    if (n < 7) toast('🕯 등잔대에 불을 밝혔어요 (' + n + '/7)');
    else { unlock('valley'); storyCard('🕯', '골짜기의 빛', '내가 사망의 음침한 골짜기로 다닐지라도 해를 두려워하지 않을 것은 주께서 나와 함께 하심이라 주의 지팡이와 막대기가 나를 안위하시나이다', '시편 23:4', '일곱 등잔대를 다 밝혔어요 — 4부 「진주 문」: 동쪽 끝 거룩한 성으로 가요'); }
  }
  // 4부: 기초석 자리에 맞는 기초석 넣기
  function useSocket(x, y, z) {
    var k = -1; for (var i = 0; i < 12; i++) { var sp = socketPos(i); if (sp[0] === x && sp[1] === y && sp[2] === z) k = i; }
    if (k < 0 || STORY.sockets[k]) return;
    var need = FSTONE0 + k;
    if (!(HOTBAR[sel] === need && have(need) > 0)) return deny('이 자리에는 「' + FS_NAMES[k] + ' 기초석」을 손에 들고 눌러요 (' + (k + 1) + '번째 기초석, 계 21:19-20)');
    take(need, 1); bagChanged(); STORY.sockets[k] = 1; localSet(x, y, z, need); saveStory(); sfx('craft', 700);
    var n = STORY.sockets.filter(Boolean).length;
    toast('💎 ' + FS_NAMES[k] + ' 기초석을 놓았어요 (' + n + '/12)' + (n === 12 && (nK(STORY.tokens) < 7 || !STORY.lamps.every(Boolean)) ? ' — 증표 일곱과 일곱 등잔대도 있어야 문이 열려요' : ''));
    if (n === 12) unlock('stones');
  }
  function regenArea(ax0, az0, ax1, az1) {
    for (var cz = az0 >> 5; cz <= az1 >> 5; cz++) for (var cx = ax0 >> 5; cx <= ax1 >> 5; cx++) { var k = cz * NC + cx; if (!COLS[k]) continue; var was = meshedCols[k]; genColumn(cx, cz); if (was) { unmeshColumn(cx, cz); meshColumn(cx, cz); } }
  }
  function openGates() {
    STORY.done = true; saveStory();
    regenArea(CITY.x0 - 4, CITY.z0 - 4, CITY.x1 + 4, CITY.z1 + 4);
    storyCard('🚪', '열두 진주 문이 열렸어요', '그 열두 문은 열두 진주니 각 문마다 한 개의 진주로 되어 있고 성의 길은 맑은 유리 같은 정금이더라', '요한계시록 21:21', '성 안으로 들어가요');
  }
  function showEnding() {
    STORY.ended = true; saveStory(); unlock('home');
    var s = STORY.s, el = $('endingText'); el.innerHTML = '';
    var lines = [
      ['또 내가 보매 거룩한 성 새 예루살렘이 하나님께로부터 하늘에서 내려오니 그 준비한 것이 신부가 남편을 위하여 단장한 것 같더라', '요한계시록 21:2'],
      ['내가 들으니 보좌에서 큰 음성이 나서 이르되 보라 하나님의 장막이 사람들과 함께 있으매 하나님이 그들과 함께 계시리니 그들은 하나님의 백성이 되고 하나님은 친히 그들과 함께 계셔서', '요한계시록 21:3'],
      ['모든 눈물을 그 눈에서 닦아 주시니 다시는 사망이 없고 애통하는 것이나 곡하는 것이나 아픈 것이 다시 있지 아니하리니 처음 것들이 다 지나갔음이러라', '요한계시록 21:4'],
      ['또 그가 수정 같이 맑은 생명수의 강을 내게 보이니 하나님과 및 어린 양의 보좌로부터 나와서', '요한계시록 22:1'],
      ['길 가운데로 흐르더라 강 좌우에 생명나무가 있어 열두 가지 열매를 맺되 달마다 그 열매를 맺고 그 나무 잎사귀들은 만국을 치료하기 위하여 있더라', '요한계시록 22:2'],
      ['그들이 이제는 더 나은 본향을 사모하니 곧 하늘에 있는 것이라 이러므로 하나님이 그들의 하나님이라 일컬음 받으심을 부끄러워하지 아니하시고 그들을 위하여 한 성을 예비하셨느니라', '히브리서 11:16']
    ];
    lines.forEach(function (l, i) { var p = document.createElement('p'); p.style.animationDelay = (i * 2.2) + 's'; p.textContent = l[0]; var r = document.createElement('small'); r.textContent = l[1]; p.appendChild(r); el.appendChild(p); });
    $('endingStats').textContent = '걸은 길 ' + Math.floor(s.walk).toLocaleString() + '칸 · 헤엄 ' + Math.floor(s.swim).toLocaleString() + '칸 · 물리친 어둠의 그림자 ' + s.shadows + ' · 믿음의 증표 7 · 기초석 12 · 등잔대 7';
    openPanel('ending');
  }
  // 📜 나그네의 길(이야기 진행판)
  function openStory() { openPanel('story'); renderStory(); sfx('click'); }
  function bar(cur, need) { var f = Math.max(0, Math.min(1, cur / need)); return '<span class="sbar"><s style="width:' + Math.round(f * 100) + '%"></s></span> <b>' + Math.min(cur, need).toLocaleString() + '/' + need.toLocaleString() + '</b>'; }
  function dirText(tx, tz) { var dx = tx - P.x, dz = tz - P.z, d = Math.round(Math.hypot(dx, dz)); var ns = dz < -d * 0.38 ? '북' : (dz > d * 0.38 ? '남' : ''), ew = dx > d * 0.38 ? '동' : (dx < -d * 0.38 ? '서' : ''); return (ns + ew || '바로 여기') + (d > 3 ? '쪽 ' + d + '칸' : ''); }
  function renderStory() {
    var L = $('storyBody'), h = '', part = partOf();
    function esc(t) { return String(t).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
    h += '<div class="sverse">이는 그가 하나님이 계획하시고 지으실 터가 있는 성을 바랐음이라 <small>(히브리서 11:10)</small></div>';
    if (!STORY.started) h += '<div class="spart on"><h3>' + PART_NAMES[0] + '</h3><p>' + (qStep < QUEST.length ? '먼저 위의 할 일(첫 집 짓기)을 다 마쳐요. 그다음 나그네 마을 입구의 「안내하는 나그네」를 찾아가 말을 걸어요.' : '나그네 마을 입구의 「안내하는 나그네」를 찾아가 말을 걸면 길이 시작돼요.') + '</p></div>';
    else {
      h += '<div class="spart' + (part === 1 ? ' on' : ' done') + '"><h3>' + PART_NAMES[1] + ' <small>' + nK(STORY.tokens) + '/7</small></h3>';
      TOKENS.forEach(function (t) {
        h += '<div class="stok' + (has(t[0]) ? ' got' : '') + '"><b>' + t[2] + ' ' + esc(t[1]) + '</b> <small>' + t[3] + ' · 받는 힘: ' + esc(t[6]) + '</small>';
        tokenTasks(t).forEach(function (q) { h += '<div class="stask">' + esc(q[0]) + ' ' + bar(q[1], q[2]) + '</div>'; });
        h += '</div>';
      });
      h += '</div>';
      h += '<div class="spart' + (part === 2 ? ' on' : (part > 2 ? ' done' : '')) + '"><h3>' + PART_NAMES[2] + ' <small>계 21:19-20</small></h3><p>세상 곳곳 땅속 깊은 곳에 열두 보석이 있어요. 보석 3개와 금 덩이 1개로 제작대에서 기초석을 만들어요. 귀한 보석은 금강석 곡괭이가 있어야 캐요.</p><div class="sgems">';
      FS_NAMES.forEach(function (n, i) {
        var g = GEMS[i], ok = have(FSTONE0 + i) > 0 || STORY.sockets[i], where = g ? (g[3] === 'south' ? '남쪽 들판' : REGION_NAMES[g[3]]) + ' · ' + (g[4] > 30 ? '높은 바위 속' : (g[5] <= 8 ? '아주 깊은 곳' : '땅속')) : '어디든 깊은 곳';
        h += '<span class="sg' + (ok ? ' got' : '') + '">' + (ok ? '💎' : '◇') + ' ' + n + '<small>' + where + ' · 보석 ' + have(gemItem(i)) + '/3</small></span>';
      });
      h += '</div></div>';
      h += '<div class="spart' + (part === 3 ? ' on' : (part > 3 ? ' done' : '')) + '"><h3>' + PART_NAMES[3] + ' <small>시 23:4</small></h3><p>동쪽 사막 땅속 깊이 깨지지 않는 미로가 있어요. 어둠의 그림자와 큰 그림자가 끝없이 나와요. 일곱 등잔대를 찾아 횃불을 들고 눌러 밝혀요. 입구: ' + dirText(DUN.x0 + 2, DUN.z0 + (DUN.n - 1) * DUN.cs + 2) + '</p>' + bar(STORY.lamps.filter(Boolean).length, 7) + '</div>';
      h += '<div class="spart' + (part === 4 ? ' on' : '') + '"><h3>' + PART_NAMES[4] + ' <small>계 21:12·21</small></h3><p>세상 동쪽 끝에 벽옥 성곽과 열두 진주 문이 있어요. 서쪽 성벽 밖의 기초석 자리 열둘에 기초석을 하나씩 들고 눌러 놓아요. 증표 일곱·등잔대 일곱·기초석 열둘이 다 갖춰지면 문이 열려요. 성: ' + dirText((CITY.x0 + CITY.x1) / 2, (CITY.z0 + CITY.z1) / 2) + '</p>' + bar(STORY.sockets.filter(Boolean).length, 12) + '</div>';
      if (STORY.ended) h += '<div class="spart done"><h3>🏙 본향에 이르렀어요</h3><p>그래도 길은 계속돼요. 성 안을 거닐고, 마을로 돌아가 친구들을 도와요.</p></div>';
    }
    L.innerHTML = h;
    $('storyStart').style.display = STORY.started ? 'none' : '';
  }

