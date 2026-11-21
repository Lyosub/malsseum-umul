// 도장판 + 인물 카드 수집책 (2026-11-21)
// 새 저장소를 만들지 않는다. 내 달란트 기록(points_ledger, 본인만 조회)에서 그대로 계산한다.
//   도장: 놀이·출석·기록을 「한 날」 수로 센다(같은 놀이는 하루에 한 줄만 기록되므로).
//   카드: 놀이 기록 한 줄마다 카드 한 장. 어떤 카드인지는 그 줄의 번호로 정해져 기기가 달라도 같다.
// 인물은 초성 퀴즈 자료(CHOSUNG_QUIZ)를 쓴다. 테두리(기본·은빛·금빛)는 인물과 상관없이 뽑기 운이다.

var COLLECT_GAMES = [
  ["chosung_quiz", "🔤", "초성 퀴즈", "chosung.html"],
  ["ox_quiz", "⭕", "O/X 스피드퀴즈", "ox.html"],
  ["verse_memory", "🧠", "말씀 외우기", "memorize.html"],
  ["book_game", "📚", "성경책 순서", "bookgame.html"],
  ["match_game", "🃏", "같은 성경 찾기", "matchgame.html"],
  ["quiz", "📝", "이번 주 퀴즈", "index.html"],
  ["odyssey", "🧭", "In Odyssey", "odyssey/index.html"]
];
var COLLECT_ERAS = [["early", "창세기~광야", "#b9783a", "⛺"], ["conquest", "정복~사사", "#5c8a3a", "🗡"], ["kingdom", "왕과 선지자", "#7a4fc9", "👑"], ["nt", "신약", "#2f6fd6", "✝"]];

function collectEsc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function collectGameOf(action) {
  for (var i = 0; i < COLLECT_GAMES.length; i++) { var k = COLLECT_GAMES[i][0]; if (action === k || action.indexOf(k + "_") === 0) return k; }
  return "";
}
function collectHash(n, salt) {   // 번호 → 0~1 (같은 번호는 늘 같은 값)
  var x = (Number(n) * 2654435761 + salt * 40503) >>> 0;
  x ^= x >>> 15; x = Math.imul(x, 2246822519) >>> 0; x ^= x >>> 13; x = Math.imul(x, 3266489917) >>> 0; x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}
function collectCardOf(rowId) {
  var pool = typeof CHOSUNG_QUIZ !== "undefined" ? CHOSUNG_QUIZ : [];
  var f = collectHash(rowId, 7);
  return { i: Math.floor(collectHash(rowId, 1) * pool.length), frame: f < 0.04 ? 2 : (f < 0.2 ? 1 : 0) };
}

function collectStamps(rows) {
  var days = {}, perDay = {}, kinds = {};
  rows.forEach(function (r) {
    var g = collectGameOf(r.action_type), key = g || r.action_type;
    (days[key] = days[key] || {})[r.ref_date] = 1;
    if (g) { (perDay[r.ref_date] = perDay[r.ref_date] || {})[g] = 1; kinds[g] = 1; }
  });
  function n(k) { return Object.keys(days[k] || {}).length; }
  var list = [];
  function add(group, emoji, title, need, have) { list.push({ group: group, emoji: emoji, title: title, need: need, got: have >= need, have: have }); }
  [[1, "첫 출석"], [7, "일곱 날"], [30, "서른 날"], [100, "백 날"]].forEach(function (s) { add("출석", "📅", s[1], s[0], n("attendance")); });
  [[1, "첫 기록"], [10, "열 날"], [30, "서른 날"]].forEach(function (s) { add("감사·기도 기록", "✍️", s[1], s[0], n("note")); });
  COLLECT_GAMES.forEach(function (g) {
    [[1, "처음 해 봄"], [3, "세 날"], [10, "열 날"], [30, "서른 날"]].forEach(function (s) { add(g[2], g[1], s[1], s[0], n(g[0])); });
  });
  var busy = 0; Object.keys(perDay).forEach(function (d) { if (Object.keys(perDay[d]).length >= 3) busy++; });
  add("두루두루", "🌈", "하루에 놀이 셋", 1, busy);
  add("두루두루", "🌈", "놀이 다섯 가지 해 봄", 5, Object.keys(kinds).length);
  add("두루두루", "🌈", "놀이 일곱 가지 다 해 봄", 7, Object.keys(kinds).length);
  return list;
}

function renderCollectStamps(el, rows) {
  var list = collectStamps(rows), got = list.filter(function (s) { return s.got; }).length, html = "", group = "";
  list.forEach(function (s) {
    if (s.group !== group) { if (group) html += "</div>"; group = s.group; html += '<div class="cl-group">' + collectEsc(group) + '</div><div class="cl-stamps">'; }
    html += '<div class="cl-stamp' + (s.got ? " got" : "") + '"><span class="cl-se">' + (s.got ? s.emoji : "·") + '</span><b>' + collectEsc(s.title) + '</b><small>' +
      (s.got ? "찍었어요" : Math.min(s.have, s.need) + " / " + s.need) + "</small></div>";
  });
  if (group) html += "</div>";
  el.innerHTML = '<p class="cl-count">도장 <b>' + got + "</b> / " + list.length + "</p>" + html +
    '<p class="msg" style="margin-top:14px;">도장은 「한 날」을 셉니다. 같은 놀이를 하루에 여러 번 해도 한 날로 세요.</p>';
}

function collectCardHtml(p, frame, count, isNew) {
  var era = COLLECT_ERAS.filter(function (e) { return e[0] === p.era; })[0] || COLLECT_ERAS[0];
  return '<div class="cl-card f' + frame + (isNew ? " new" : "") + '" style="--era:' + era[2] + '">' +
    '<span class="cl-era">' + era[3] + " " + era[1] + "</span>" +
    '<span class="cl-face">' + collectEsc(p.name.charAt(0)) + "</span>" +
    "<b>" + collectEsc(p.name) + "</b><small>" + collectEsc(p.hint) + "</small>" +
    (count > 1 ? '<i class="cl-n">×' + count + "</i>" : "") + (frame ? '<i class="cl-f">' + (frame === 2 ? "금빛" : "은빛") + "</i>" : "") + "</div>";
}

function renderCollectCards(el, rows, userId) {
  var pool = typeof CHOSUNG_QUIZ !== "undefined" ? CHOSUNG_QUIZ : [];
  var own = {}, drawn = 0, maxId = 0, seenKey = "collectSeen." + userId, seen = 0;
  try { seen = Number(localStorage.getItem(seenKey)) || 0; } catch (e) {}
  var fresh = [];
  rows.forEach(function (r) {
    if (!collectGameOf(r.action_type) || !pool.length) return;
    var c = collectCardOf(r.id), o = own[c.i] || (own[c.i] = { n: 0, frame: 0 });
    o.n++; if (c.frame > o.frame) o.frame = c.frame; drawn++;
    if (r.id > maxId) maxId = r.id;
    if (r.id > seen) fresh.push(c);
  });
  var have = Object.keys(own).length, html = '<p class="cl-count">인물 <b>' + have + "</b> / " + pool.length + " · 뽑은 카드 " + drawn + "장</p>";
  if (fresh.length && seen) {
    html += '<div class="cl-group">새로 뽑은 카드 ' + fresh.length + '장</div><div class="cl-cards">' +
      fresh.slice(-12).map(function (c) { return collectCardHtml(pool[c.i], c.frame, 0, true); }).join("") + "</div>";
  }
  COLLECT_ERAS.forEach(function (e) {
    var idx = []; pool.forEach(function (p, i) { if (p.era === e[0]) idx.push(i); });
    var got = idx.filter(function (i) { return own[i]; }).length;
    html += '<div class="cl-group">' + e[3] + " " + e[1] + " · " + got + " / " + idx.length + '</div><div class="cl-cards">';
    idx.forEach(function (i) {
      html += own[i] ? collectCardHtml(pool[i], own[i].frame, own[i].n, false)
        : '<div class="cl-card unk"><span class="cl-face">?</span><b>' + collectEsc(pool[i].chosung) + "</b><small>아직 만나지 못한 인물</small></div>";
    });
    html += "</div>";
  });
  html += '<p class="msg" style="margin-top:14px;">놀이터 놀이를 하면 놀이마다 하루에 한 장씩 카드가 뽑혀요. 은빛·금빛 테두리는 가끔 나와요. 테두리는 뽑기 운일 뿐, 인물의 크고 작음과는 상관없어요.</p>';
  el.innerHTML = html;
  try { if (maxId > seen) localStorage.setItem(seenKey, String(maxId)); } catch (e) {}
}

function initCollectPage() {
  var client = getClient(), gate = document.getElementById("collectGate"), body = document.getElementById("collectBody");
  var tabs = document.querySelectorAll("[data-cl-tab]");
  function show(k) {
    tabs.forEach(function (t) { t.setAttribute("aria-pressed", String(t.getAttribute("data-cl-tab") === k)); });
    document.getElementById("collectStamps").hidden = k !== "stamp"; document.getElementById("collectCards").hidden = k !== "card";
    try { localStorage.setItem("collectTab", k); } catch (e) {}
  }
  tabs.forEach(function (t) { t.addEventListener("click", function () { show(t.getAttribute("data-cl-tab")); }); });
  if (!client) { gate.innerHTML = '<p class="msg">지금은 불러올 수 없어요.</p>'; return; }
  getSession().then(function (session) {
    if (!session) {
      gate.innerHTML = '<div class="card" style="text-align:center;"><p style="margin:0 0 12px;">도장판과 인물 카드는 로그인하면 내 놀이 기록으로 채워져요.</p><a class="btn" href="login.html">로그인하기</a></div>';
      body.hidden = true; return;
    }
    var uid = session.user.id;
    client.from("points_ledger").select("id, action_type, ref_date").eq("user_id", uid).order("id", { ascending: true }).limit(5000).then(function (res) {
      if (res.error) { gate.innerHTML = '<p class="msg">기록을 불러오지 못했어요. 잠시 뒤 다시 열어 주세요.</p>'; return; }
      var rows = res.data || [];
      renderCollectStamps(document.getElementById("collectStamps"), rows);
      renderCollectCards(document.getElementById("collectCards"), rows, uid);
      var k = "stamp"; try { k = localStorage.getItem("collectTab") || "stamp"; } catch (e) {}
      if (location.hash === "#cards") k = "card";
      body.hidden = false; show(k === "card" ? "card" : "stamp");
    });
  });
}
