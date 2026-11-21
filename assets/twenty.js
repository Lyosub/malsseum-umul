// 인물 스무고개 (2026-11-21)
// 저장하는 것이 없다. 방을 연 사람(출제자)이 성경 인물 하나를 고르고, 들어온 사람들이 정해진 질문을 골라 묻는다.
// 자유롭게 글을 쓰는 칸은 없다(질문은 목록에서, 정답도 인물 목록에서 고른다).
// 주고받는 말: join · state(출제자가 알리는 지금 상태) · ask(질문) · guess(정답 말하기) · bye

var TW_QUESTIONS = [
  "구약에 나오는 사람인가요?", "신약에 나오는 사람인가요?", "남자인가요?", "여자인가요?",
  "창세기에 나오나요?", "모세보다 앞선 때의 사람인가요?", "다윗보다 뒤의 사람인가요?", "예수님을 직접 만났나요?",
  "왕인가요?", "선지자인가요?", "예수님의 열두 제자인가요?", "제사장이나 사사인가요?",
  "이스라엘 사람인가요?", "성경 책 이름이 된 사람인가요?", "편지나 글을 남긴 사람인가요?", "이름이 바뀐 적이 있나요?",
  "싸움터에 나간 적이 있나요?", "꿈이나 환상 이야기가 나오나요?", "갇히거나 붙잡힌 적이 있나요?", "양을 친 적이 있나요?",
  "살던 곳을 떠나 먼 길을 간 적이 있나요?", "형제나 자매 이야기가 함께 나오나요?", "이름이 두 글자인가요?", "이름이 세 글자 이상인가요?"
];
var TW = { role: "", code: "", chan: null, me: null, players: {}, order: [], phase: "lobby", secret: null, log: [], pending: null, winner: "", state: null, timer: null, max: 20 };

function twEsc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function twApp() { return document.getElementById("twApp"); }
function twPeople() { return (typeof CHOSUNG_QUIZ !== "undefined" ? CHOSUNG_QUIZ : []).slice().sort(function (a, b) { return a.name.localeCompare(b.name, "ko"); }); }
function twMyId() { var k = "twentyId", v = null; try { v = sessionStorage.getItem(k); } catch (e) {} if (!v) { v = "t" + Math.random().toString(36).slice(2, 10); try { sessionStorage.setItem(k, v); } catch (e) {} } return v; }
function twSend(event, payload) { if (TW.chan) TW.chan.send({ type: "broadcast", event: event, payload: payload }); }
function twOn(id, fn) { var b = document.getElementById(id); if (b) b.addEventListener("click", fn); }

function twJoinChannel(code, onReady) {
  var client = getClient(); if (!client) { twApp().innerHTML = '<div class="card"><p class="msg">지금은 방을 열 수 없어요. 잠시 뒤 다시 해 주세요.</p></div>'; return; }
  if (TW.chan) { try { client.removeChannel(TW.chan); } catch (e) {} }
  var ch = TW.chan = client.channel("twenty-" + code, { config: { broadcast: { self: false } } });
  ch.on("broadcast", { event: "join" }, function (e) { if (TW.role === "host") twHostJoin(e.payload); })
    .on("broadcast", { event: "ask" }, function (e) { if (TW.role === "host") twHostAsk(e.payload); })
    .on("broadcast", { event: "guess" }, function (e) { if (TW.role === "host") twHostGuess(e.payload); })
    .on("broadcast", { event: "state" }, function (e) { if (TW.role === "player") { TW.state = e.payload; twPlayerRender(); } })
    .on("broadcast", { event: "bye" }, function () { if (TW.role === "player") twLeave("방이 닫혔어요. 함께해 줘서 고마워요."); })
    .subscribe(function (s) { if (s === "SUBSCRIBED") onReady(); else if (s === "CHANNEL_ERROR" || s === "TIMED_OUT") twApp().innerHTML = '<div class="card"><p class="msg">연결이 끊겼어요. 화면을 새로 고쳐 다시 들어와 주세요.</p></div>'; });
}
function twLeave(msg) { var c = getClient(); clearInterval(TW.timer); if (TW.chan && c) { try { c.removeChannel(TW.chan); } catch (e) {} } TW.chan = null; twHome(msg); }

function twHome(msg) {
  TW.role = "";
  var pre = (new URLSearchParams(location.search).get("c") || "").replace(/\D/g, "").slice(0, 4), name = ""; try { name = localStorage.getItem("quizroomName") || ""; } catch (e) {}
  twApp().innerHTML = (msg ? '<div class="card"><p style="margin:0;font-weight:700;">' + twEsc(msg) + "</p></div>" : "") +
    '<div class="card"><div class="well-label" style="margin-top:0;">코드로 들어가기</div>' +
    '<div class="form-row"><input class="qr-in" id="twCode" inputmode="numeric" maxlength="4" placeholder="방 코드 4자리" value="' + twEsc(pre) + '"></div>' +
    '<div class="form-row"><input class="qr-in" id="twName" maxlength="8" placeholder="내 이름(8자까지)" value="' + twEsc(name) + '"></div>' +
    '<button class="btn block" id="twGo">들어가기</button><p class="msg" id="twMsg"></p></div>' +
    '<div class="card"><div class="well-label" style="margin-top:0;">내가 문제 내기</div><p class="msg" style="margin:0 0 10px;">성경 인물 한 명을 마음에 정하고, 다른 사람들의 질문에 「예」「아니오」로 답해요. 스무 번 안에 맞히면 맞힌 사람이 이겨요.</p>' +
    '<button class="btn block ghost" id="twHost">새 방 열기</button></div>';
  twOn("twGo", function () {
    var code = document.getElementById("twCode").value.replace(/\D/g, ""), nm = document.getElementById("twName").value.trim().slice(0, 8);
    if (code.length !== 4) { document.getElementById("twMsg").textContent = "방 코드 네 자리를 넣어 주세요."; return; }
    if (!nm) { document.getElementById("twMsg").textContent = "이름을 넣어 주세요."; return; }
    try { localStorage.setItem("quizroomName", nm); } catch (e) {}
    twPlayerStart(code, nm);
  });
  twOn("twHost", twHostStart);
}

// ── 출제자 ──
function twHostStart() {
  TW.role = "host"; TW.code = String(1000 + Math.floor(Math.random() * 9000)); TW.players = {}; TW.order = []; TW.phase = "lobby"; TW.secret = null; TW.log = []; TW.pending = null; TW.winner = "";
  twApp().innerHTML = '<div class="card"><p class="msg">방을 여는 중...</p></div>';
  twJoinChannel(TW.code, twHostRender);
}
function twHostBroadcast() {
  var st = { phase: TW.phase, count: TW.order.length, ids: TW.order, log: TW.log, left: TW.max - TW.log.length, pending: TW.pending ? { who: TW.pending.who, text: TW.pending.text } : null, picked: !!TW.secret };
  if (TW.phase === "end") { st.answer = TW.secret ? TW.secret.name : ""; st.hint = TW.secret ? TW.secret.hint : ""; st.winner = TW.winner; }
  twSend("state", st);
}
function twHostJoin(p) {
  if (!p || !p.id) return;
  var name = String(p.name || "").trim().slice(0, 8) || "이름 없음";
  if (!TW.players[p.id]) { if (TW.order.length >= 60) return; TW.players[p.id] = { name: name }; TW.order.push(p.id); } else TW.players[p.id].name = name;
  twHostBroadcast(); if (TW.phase === "lobby") twHostRender();
}
function twHostAsk(a) {
  if (TW.phase !== "play" || TW.pending || !a || !TW.players[a.id]) return;
  var qi = Number(a.q); if (!(qi >= 0 && qi < TW_QUESTIONS.length)) return;
  if (TW.log.some(function (l) { return l.qi === qi; })) return;
  TW.pending = { who: TW.players[a.id].name, qi: qi, text: TW_QUESTIONS[qi] }; twHostBroadcast(); twHostRender();
}
function twHostReply(ans) {
  if (!TW.pending) return;
  TW.log.push({ who: TW.pending.who, qi: TW.pending.qi, text: TW.pending.text, a: ans }); TW.pending = null;
  if (TW.log.length >= TW.max) { TW.phase = "end"; TW.winner = ""; }
  twHostBroadcast(); twHostRender();
}
function twHostGuess(g) {
  if (TW.phase !== "play" || TW.pending || !g || !TW.players[g.id] || !TW.secret) return;
  var name = String(g.name || ""), ok = name === TW.secret.name;
  if (!twPeople().some(function (p) { return p.name === name; })) return;
  TW.log.push({ who: TW.players[g.id].name, qi: -1, text: "「" + name + "」인가요?", a: ok ? "맞아요!" : "아니에요" });
  if (ok) { TW.phase = "end"; TW.winner = TW.players[g.id].name; } else if (TW.log.length >= TW.max) { TW.phase = "end"; TW.winner = ""; }
  twHostBroadcast(); twHostRender();
}
function twLogHtml(log) {
  if (!log.length) return '<p class="msg">아직 질문이 없어요.</p>';
  return '<ol class="tw-log">' + log.map(function (l) { return "<li><span>" + twEsc(l.text) + ' <small>— ' + twEsc(l.who) + '</small></span><b class="' + (l.a === "예" || l.a === "맞아요!" ? "y" : (l.a === "아니오" || l.a === "아니에요" ? "n" : "")) + '">' + twEsc(l.a) + "</b></li>"; }).join("") + "</ol>";
}
function twPickerHtml(id) {
  return '<select class="qr-in" id="' + id + '" style="font-size:17px;"><option value="">인물을 골라요</option>' + twPeople().map(function (p) { return '<option value="' + twEsc(p.name) + '">' + twEsc(p.name) + "</option>"; }).join("") + "</select>";
}
function twHostRender() {
  var html = "";
  if (TW.phase === "lobby") {
    var url = location.origin + location.pathname + "?c=" + TW.code, img = "";
    try { var qq = qrcode(0, "M"); qq.addData(url); qq.make(); img = '<img alt="들어오는 QR" src="' + qq.createDataURL(6, 2) + '">'; } catch (e) {}
    html = '<div class="card"><div class="well-label" style="margin-top:0;text-align:center;">방 코드</div><div class="qr-code">' + TW.code + '</div><div class="qr-join">' + img +
      '<p class="msg" style="margin:0;max-width:260px;">휴대폰으로 QR을 찍거나, 말씀우물 → 놀이터 → 「인물 스무고개」에서 코드를 넣어요.</p></div>' +
      '<div class="qr-people">' + (TW.order.length ? TW.order.map(function (id) { return "<span>" + twEsc(TW.players[id].name) + "</span>"; }).join("") : '<span style="border-style:dashed;color:var(--text-soft);">기다리는 중...</span>') + "</div></div>" +
      '<div class="card"><div class="well-label" style="margin-top:0;">마음에 정한 인물 (나만 봐요)</div>' + twPickerHtml("twSecret") +
      '<p class="msg" id="twHint" style="margin-top:8px;">이 화면을 큰 화면에 띄웠다면, 고르는 동안 잠깐 가려 주세요.</p>' +
      '<button class="btn block" id="twBegin" style="margin-top:10px;">시작하기</button><button class="btn block ghost" id="twClose" style="margin-top:8px;">방 닫기</button></div>';
  } else if (TW.phase === "play") {
    html = '<div class="card"><p class="qr-big">남은 질문 ' + (TW.max - TW.log.length) + "번</p>" +
      (TW.pending ? '<p class="qr-q">' + twEsc(TW.pending.text) + '</p><p class="msg" style="text-align:center;">' + twEsc(TW.pending.who) + '의 질문</p><div class="qr-choices" style="grid-template-columns:1fr 1fr 1fr;">' +
        '<button id="twYes">예</button><button id="twNo">아니오</button><button id="twSkip" style="font-size:14px;">잘 모르겠어요</button></div>'
        : '<p class="msg" style="text-align:center;">질문을 기다리는 중이에요. 들어온 사람 ' + TW.order.length + "명</p>") +
      '<details style="margin-top:10px;"><summary style="cursor:pointer;font-weight:700;color:var(--text-soft);">내가 정한 인물 보기</summary><p class="msg">' + twEsc(TW.secret.name) + " — " + twEsc(TW.secret.hint) + "</p></details></div>" +
      '<div class="card"><div class="well-label" style="margin-top:0;">지금까지 나온 질문</div>' + twLogHtml(TW.log) + '<button class="btn block ghost" id="twGiveUp" style="margin-top:10px;">정답 알려 주고 끝내기</button></div>';
  } else {
    html = '<div class="card"><p class="qr-big">' + (TW.winner ? "🎉 " + twEsc(TW.winner) + " 님이 맞혔어요!" : "정답은...") + '</p><p class="qr-q">' + twEsc(TW.secret.name) + '</p><p class="msg" style="text-align:center;">' + twEsc(TW.secret.hint) + "</p>" + twLogHtml(TW.log) +
      '<button class="btn block" id="twAgain" style="margin-top:12px;">같은 방에서 한 번 더</button><button class="btn block ghost" id="twClose" style="margin-top:8px;">방 닫기</button></div>';
  }
  twApp().innerHTML = html;
  twOn("twBegin", function () {
    var v = document.getElementById("twSecret").value, p = twPeople().filter(function (x) { return x.name === v; })[0];
    if (!p) { document.getElementById("twHint").textContent = "먼저 인물을 골라 주세요."; return; }
    TW.secret = p; TW.phase = "play"; TW.log = []; TW.pending = null; TW.winner = ""; twHostBroadcast(); twHostRender();
  });
  twOn("twYes", function () { twHostReply("예"); }); twOn("twNo", function () { twHostReply("아니오"); }); twOn("twSkip", function () { twHostReply("잘 모르겠어요"); });
  twOn("twGiveUp", function () { TW.phase = "end"; TW.winner = ""; TW.pending = null; twHostBroadcast(); twHostRender(); });
  twOn("twAgain", function () { TW.phase = "lobby"; TW.secret = null; TW.log = []; twHostBroadcast(); twHostRender(); });
  twOn("twClose", function () { twSend("bye", {}); setTimeout(function () { twLeave("방을 닫았어요."); }, 200); });
}

// ── 참여자 ──
function twPlayerStart(code, name) {
  TW.role = "player"; TW.code = code; TW.me = { id: twMyId(), name: name }; TW.state = null;
  twApp().innerHTML = '<div class="card"><p class="msg">방에 들어가는 중...</p></div>';
  twJoinChannel(code, function () {
    twSend("join", TW.me); var tries = 0; clearInterval(TW.timer);
    TW.timer = setInterval(function () { if (TW.state) return clearInterval(TW.timer); if (++tries > 6) { clearInterval(TW.timer); return twLeave("이 코드의 방을 찾지 못했어요. 코드를 다시 확인해 주세요."); } twSend("join", TW.me); }, 700);
    twApp().innerHTML = '<div class="card"><p class="qr-big">방 ' + twEsc(code) + '</p><p class="msg" style="text-align:center;">출제자를 찾는 중...</p></div>';
  });
}
function twPlayerRender() {
  var st = TW.state, html = "";
  if (st.ids && st.ids.indexOf(TW.me.id) < 0) twSend("join", TW.me);
  if (st.phase === "lobby") {
    html = '<div class="card"><p class="qr-big">방 ' + twEsc(TW.code) + " · " + twEsc(TW.me.name) + '</p><p class="msg" style="text-align:center;">들어왔어요! 지금 ' + st.count + "명. 출제자가 인물을 정하고 있어요.</p>" + '<button class="btn block ghost" id="twOut">나가기</button></div>';
  } else if (st.phase === "play") {
    var asked = {}; st.log.forEach(function (l) { if (l.qi >= 0) asked[l.qi] = 1; });
    html = '<div class="card"><p class="qr-big">남은 질문 ' + st.left + "번</p>" + (st.pending ? '<p class="msg" style="text-align:center;">출제자가 「' + twEsc(st.pending.text) + "」에 답하는 중이에요</p>" : "") + twLogHtml(st.log) + "</div>" +
      '<div class="card"><div class="well-label" style="margin-top:0;">질문 고르기</div><div class="tw-qs">' + TW_QUESTIONS.map(function (q, i) { return '<button data-q="' + i + '"' + (asked[i] || st.pending ? " disabled" : "") + ">" + twEsc(q) + "</button>"; }).join("") + "</div></div>" +
      '<div class="card"><div class="well-label" style="margin-top:0;">정답 말하기</div><p class="msg" style="margin:0 0 8px;">틀려도 질문 한 번으로 세요.</p>' + twPickerHtml("twGuess") + '<button class="btn block" id="twSay" style="margin-top:8px;"' + (st.pending ? " disabled" : "") + ">이 사람이에요!</button></div>";
  } else {
    html = '<div class="card"><p class="qr-big">' + (st.winner ? "🎉 " + twEsc(st.winner) + " 님이 맞혔어요!" : "아쉽게 못 맞혔어요") + '</p><p class="qr-q">정답: ' + twEsc(st.answer) + '</p><p class="msg" style="text-align:center;">' + twEsc(st.hint) + "</p>" + twLogHtml(st.log) + '<p class="msg" style="text-align:center;margin-top:10px;">출제자가 다시 시작하면 이어서 할 수 있어요.</p><button class="btn block ghost" id="twOut">나가기</button></div>';
  }
  twApp().innerHTML = html;
  twOn("twOut", function () { twLeave(""); });
  twApp().querySelectorAll("[data-q]").forEach(function (b) { b.addEventListener("click", function () { twSend("ask", { id: TW.me.id, q: Number(b.getAttribute("data-q")) }); b.disabled = true; }); });
  twOn("twSay", function () { var v = document.getElementById("twGuess").value; if (v) twSend("guess", { id: TW.me.id, name: v }); });
}

function initTwenty() {
  twHome("");
  window.addEventListener("pagehide", function () { if (TW.role === "host") twSend("bye", {}); });
}
