// 함께 푸는 퀴즈 방 (2026-11-21)
// 저장하는 것이 없다. 방을 연 기기(진행자)가 문제·점수를 쥐고, 실시간 방송 채널로만 주고받는다.
// 주고받는 말: join(들어옴) · state(진행자가 알리는 지금 상태) · a(답) · kick(내보내기) · bye(방 닫음)
// 정답은 문제를 낼 때 보내지 않고, 시간이 끝난 뒤 결과와 함께 보낸다.

var QR = { role: "", code: "", chan: null, me: null, players: {}, order: [], qs: [], n: -1, phase: "lobby", kind: "mix", total: 10, secs: 15, timer: null, endsAt: 0, answers: {}, state: null, picked: null, sentAt: 0 };

function qrEsc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function qrShuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function qrApp() { return document.getElementById("qrApp"); }
function qrMyId() { var k = "quizroomId", v = null; try { v = sessionStorage.getItem(k); } catch (e) {} if (!v) { v = "p" + Math.random().toString(36).slice(2, 10); try { sessionStorage.setItem(k, v); } catch (e) {} } return v; }
function qrSend(event, payload) { if (QR.chan) QR.chan.send({ type: "broadcast", event: event, payload: payload }); }

function qrMakeQuestions(kind, total) {
  var ox = qrShuffle(typeof OX_QUIZ !== "undefined" ? OX_QUIZ : []).map(function (q) {
    return { kind: "ox", text: q.statement, choices: ["O", "X"], answer: q.answer ? 0 : 1, note: q.note || "" };
  });
  var people = typeof CHOSUNG_QUIZ !== "undefined" ? CHOSUNG_QUIZ : [];
  var who = qrShuffle(people).map(function (p) {
    var others = qrShuffle(people.filter(function (o) { return o.era === p.era && o.name !== p.name; })).slice(0, 3).map(function (o) { return o.name; });
    var choices = qrShuffle([p.name].concat(others));
    return { kind: "who", text: "누구일까요? " + p.hint, choices: choices, answer: choices.indexOf(p.name), note: p.name };
  });
  var pool = kind === "ox" ? ox : (kind === "who" ? who : qrShuffle(ox.slice(0, Math.ceil(total / 2)).concat(who.slice(0, Math.floor(total / 2)))));
  return pool.slice(0, total);
}

function qrJoinChannel(code, onReady) {
  var client = getClient(); if (!client) { qrApp().innerHTML = '<div class="card"><p class="msg">지금은 방을 열 수 없어요. 잠시 뒤 다시 해 주세요.</p></div>'; return; }
  if (QR.chan) { try { client.removeChannel(QR.chan); } catch (e) {} }
  var ch = QR.chan = client.channel("quizroom-" + code, { config: { broadcast: { self: false } } });
  ch.on("broadcast", { event: "join" }, function (e) { if (QR.role === "host") qrHostJoin(e.payload); })
    .on("broadcast", { event: "a" }, function (e) { if (QR.role === "host") qrHostAnswer(e.payload); })
    .on("broadcast", { event: "state" }, function (e) { if (QR.role === "player") qrPlayerState(e.payload); })
    .on("broadcast", { event: "kick" }, function (e) { if (QR.role === "player" && e.payload && e.payload.id === QR.me.id) qrLeave("진행자가 방에서 내보냈어요."); })
    .on("broadcast", { event: "bye" }, function () { if (QR.role === "player") qrLeave("방이 닫혔어요. 함께해 줘서 고마워요."); })
    .subscribe(function (s) { if (s === "SUBSCRIBED") onReady(); else if (s === "CHANNEL_ERROR" || s === "TIMED_OUT") qrApp().innerHTML = '<div class="card"><p class="msg">연결이 끊겼어요. 화면을 새로 고쳐 다시 들어와 주세요.</p></div>'; });
}

// ── 처음 화면 ──
function qrHome(msg) {
  QR.role = ""; clearInterval(QR.timer);
  var pre = (new URLSearchParams(location.search).get("c") || "").replace(/\D/g, "").slice(0, 4), name = ""; try { name = localStorage.getItem("quizroomName") || ""; } catch (e) {}
  qrApp().innerHTML = (msg ? '<div class="card"><p style="margin:0;font-weight:700;">' + qrEsc(msg) + "</p></div>" : "") +
    '<div class="card"><div class="well-label" style="margin-top:0;">코드로 들어가기</div>' +
    '<div class="form-row"><input class="qr-in" id="qrCode" inputmode="numeric" maxlength="4" placeholder="방 코드 4자리" value="' + qrEsc(pre) + '"></div>' +
    '<div class="form-row"><input class="qr-in" id="qrName" maxlength="8" placeholder="내 이름(8자까지)" value="' + qrEsc(name) + '"></div>' +
    '<button class="btn block" id="qrGo">들어가기</button><p class="msg" id="qrMsg"></p></div>' +
    '<div class="card"><div class="well-label" style="margin-top:0;">방 만들기</div><p class="msg" style="margin:0 0 10px;">방을 연 화면이 문제와 순위를 보여 줘요. 모임에서는 큰 화면에 띄우면 좋아요.</p>' +
    '<button class="btn block ghost" id="qrHost">새 방 열기</button></div>';
  document.getElementById("qrGo").addEventListener("click", function () {
    var code = document.getElementById("qrCode").value.replace(/\D/g, ""), nm = document.getElementById("qrName").value.trim().slice(0, 8);
    if (code.length !== 4) { document.getElementById("qrMsg").textContent = "방 코드 네 자리를 넣어 주세요."; return; }
    if (!nm) { document.getElementById("qrMsg").textContent = "이름을 넣어 주세요."; return; }
    try { localStorage.setItem("quizroomName", nm); } catch (e) {}
    qrPlayerStart(code, nm);
  });
  document.getElementById("qrHost").addEventListener("click", qrHostStart);
  if (!name) getSession().then(function (s) { var el = document.getElementById("qrName"); if (s && el && !el.value) { getClient().from("profiles").select("nickname").eq("user_id", s.user.id).maybeSingle().then(function (r) { if (r.data && r.data.nickname && !el.value) el.value = String(r.data.nickname).slice(0, 8); }); } });
}
function qrLeave(msg) { var c = getClient(); if (QR.chan && c) { try { c.removeChannel(QR.chan); } catch (e) {} } QR.chan = null; qrHome(msg); }

// ── 진행자 ──
function qrHostStart() {
  QR.role = "host"; QR.code = String(1000 + Math.floor(Math.random() * 9000)); QR.players = {}; QR.order = []; QR.phase = "lobby"; QR.n = -1;
  qrApp().innerHTML = '<div class="card"><p class="msg">방을 여는 중...</p></div>';
  qrJoinChannel(QR.code, function () { qrHostRender(); });
}
function qrHostJoin(p) {
  if (!p || !p.id || QR.role !== "host") return;
  var name = String(p.name || "").trim().slice(0, 8) || "이름 없음";
  if (!QR.players[p.id]) { if (QR.order.length >= 60) return; QR.players[p.id] = { name: name, score: 0, last: 0 }; QR.order.push(p.id); }
  else QR.players[p.id].name = name;
  qrHostBroadcast(); if (QR.phase === "lobby") qrHostRender();
}
function qrHostRanks() {
  return QR.order.map(function (id) { return { id: id, name: QR.players[id].name, score: QR.players[id].score, last: QR.players[id].last }; }).sort(function (a, b) { return b.score - a.score; });
}
function qrHostBroadcast() {
  var q = QR.qs[QR.n], st = { phase: QR.phase, n: QR.n, total: QR.qs.length, count: QR.order.length, ids: QR.order };
  if (q && (QR.phase === "q" || QR.phase === "r")) { st.q = { kind: q.kind, text: q.text, choices: q.choices }; st.left = Math.max(0, Math.round((QR.endsAt - Date.now()) / 1000)); st.secs = QR.secs; }
  if (q && QR.phase === "r") { st.answer = q.answer; st.note = q.note; }
  if (QR.phase === "r" || QR.phase === "end") st.ranks = qrHostRanks();
  QR.state = st; qrSend("state", st);
}
function qrHostBegin() {
  QR.qs = qrMakeQuestions(QR.kind, QR.total); QR.n = -1; QR.order.forEach(function (id) { QR.players[id].score = 0; QR.players[id].last = 0; });
  if (!QR.qs.length) return; qrHostNext();
}
function qrHostNext() {
  clearInterval(QR.timer);
  if (QR.n + 1 >= QR.qs.length) { QR.phase = "end"; qrHostBroadcast(); return qrHostRender(); }
  QR.n++; QR.phase = "q"; QR.answers = {}; QR.endsAt = Date.now() + QR.secs * 1000;
  qrHostBroadcast(); qrHostRender();
  QR.timer = setInterval(function () {
    var left = QR.endsAt - Date.now(), bar = document.getElementById("qrBar"), cnt = document.getElementById("qrLeft");
    if (bar) bar.style.width = Math.max(0, left / (QR.secs * 10)) + "%"; if (cnt) cnt.textContent = Math.max(0, Math.ceil(left / 1000)) + "초";
    if (left <= 0 || (QR.order.length && Object.keys(QR.answers).length >= QR.order.length)) qrHostReveal();
  }, 250);
}
function qrHostAnswer(a) {
  if (QR.phase !== "q" || !a || a.n !== QR.n || !QR.players[a.id] || QR.answers[a.id] !== undefined) return;
  var c = Number(a.c); if (!(c >= 0 && c < QR.qs[QR.n].choices.length)) return;
  QR.answers[a.id] = { c: c, at: Date.now() };
  var el = document.getElementById("qrAnswered"); if (el) el.textContent = Object.keys(QR.answers).length + " / " + QR.order.length + "명 답함";
}
function qrHostReveal() {
  clearInterval(QR.timer); if (QR.phase !== "q") return;
  var q = QR.qs[QR.n], start = QR.endsAt - QR.secs * 1000;
  QR.order.forEach(function (id) {
    var a = QR.answers[id], p = QR.players[id]; p.last = 0;
    if (a && a.c === q.answer) { var k = Math.max(0, Math.min(1, 1 - (a.at - start) / (QR.secs * 1000))); p.last = 500 + Math.round(500 * k); p.score += p.last; }
  });
  QR.phase = "r"; qrHostBroadcast(); qrHostRender();
}
function qrRankHtml(ranks, meId, max) {
  return '<ol class="qr-rank">' + ranks.slice(0, max || 10).map(function (r, i) {
    return '<li class="' + (r.id === meId ? "me" : "") + '"><span>' + (i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : (i + 1) + ".") + "</span><b>" + qrEsc(r.name) + "</b><span>" + r.score + "점" + (r.last ? " (+" + r.last + ")" : "") + "</span></li>";
  }).join("") + "</ol>";
}
function qrQuestionHtml(q, n, total) {
  return '<div class="qr-meta"><span>' + (n + 1) + " / " + total + '</span><span id="qrLeft"></span></div><div class="qr-bar"><i id="qrBar"></i></div><p class="qr-q">' + qrEsc(q.text) + "</p>";
}
function qrHostRender() {
  var el = qrApp(), html = "";
  if (QR.phase === "lobby") {
    var url = location.origin + location.pathname + "?c=" + QR.code, img = "";
    try { var qq = qrcode(0, "M"); qq.addData(url); qq.make(); img = '<img alt="들어오는 QR" src="' + qq.createDataURL(6, 2) + '">'; } catch (e) {}
    html = '<div class="card"><div class="well-label" style="margin-top:0;text-align:center;">방 코드</div><div class="qr-code">' + QR.code + '</div><div class="qr-join">' + img +
      '<p class="msg" style="margin:0;max-width:260px;">휴대폰으로 QR을 찍거나, 말씀우물 → 놀이터 → 「함께 푸는 퀴즈 방」에서 코드를 넣어요.</p></div></div>' +
      '<div class="card"><div class="well-label" style="margin-top:0;">들어온 사람 ' + QR.order.length + '명</div><div class="qr-people">' +
      (QR.order.length ? QR.order.map(function (id) { return '<button type="button" data-kick="' + qrEsc(id) + '" title="누르면 내보내요">' + qrEsc(QR.players[id].name) + " ✕</button>"; }).join("") : '<span style="border-style:dashed;color:var(--text-soft);">기다리는 중...</span>') + "</div></div>" +
      '<div class="card"><div class="well-label" style="margin-top:0;">문제 고르기</div><div class="qr-seg" id="qrKind">' +
      [["mix", "섞어서"], ["ox", "O/X"], ["who", "인물 맞히기"]].map(function (k) { return '<button type="button" data-k="' + k[0] + '" aria-pressed="' + (QR.kind === k[0]) + '">' + k[1] + "</button>"; }).join("") + '</div>' +
      '<div class="qr-seg" id="qrTotal" style="margin-top:8px;">' + [5, 10, 15].map(function (t) { return '<button type="button" data-t="' + t + '" aria-pressed="' + (QR.total === t) + '">' + t + "문제</button>"; }).join("") + "</div>" +
      '<button class="btn block" id="qrBegin" style="margin-top:12px;"' + (QR.order.length ? "" : " disabled") + ">시작하기</button>" +
      '<button class="btn block ghost" id="qrClose" style="margin-top:8px;">방 닫기</button></div>';
  } else if (QR.phase === "q") {
    var q = QR.qs[QR.n];
    html = '<div class="card">' + qrQuestionHtml(q, QR.n, QR.qs.length) + '<div class="qr-choices">' + q.choices.map(function (c) { return "<button disabled>" + qrEsc(c) + "</button>"; }).join("") +
      '</div><p class="qr-big" id="qrAnswered">0 / ' + QR.order.length + '명 답함</p><button class="btn block ghost" id="qrSkip">바로 정답 보기</button></div>';
  } else if (QR.phase === "r") {
    var q2 = QR.qs[QR.n];
    html = '<div class="card">' + qrQuestionHtml(q2, QR.n, QR.qs.length) + '<div class="qr-choices">' + q2.choices.map(function (c, i) { return '<button disabled class="' + (i === q2.answer ? "ok" : "no") + '">' + qrEsc(c) + "</button>"; }).join("") +
      '</div><p class="qr-big">정답: ' + qrEsc(q2.choices[q2.answer]) + (q2.note && q2.kind === "ox" ? " · " + qrEsc(q2.note) : "") + "</p>" + qrRankHtml(qrHostRanks(), "", 8) +
      '<button class="btn block" id="qrNext" style="margin-top:12px;">' + (QR.n + 1 >= QR.qs.length ? "마지막 순위 보기" : "다음 문제") + "</button></div>";
  } else {
    html = '<div class="card"><p class="qr-big">🎉 끝! 모두 수고했어요</p>' + qrRankHtml(qrHostRanks(), "", 30) +
      '<button class="btn block" id="qrAgain" style="margin-top:12px;">같은 방에서 한 번 더</button><button class="btn block ghost" id="qrClose" style="margin-top:8px;">방 닫기</button></div>';
  }
  el.innerHTML = html;
  function on(id, fn) { var b = document.getElementById(id); if (b) b.addEventListener("click", fn); }
  on("qrBegin", qrHostBegin); on("qrSkip", qrHostReveal); on("qrNext", qrHostNext);
  on("qrAgain", function () { QR.phase = "lobby"; QR.n = -1; qrHostBroadcast(); qrHostRender(); });
  on("qrClose", function () { qrSend("bye", {}); setTimeout(function () { qrLeave("방을 닫았어요."); }, 200); });
  el.querySelectorAll("[data-kick]").forEach(function (b) { b.addEventListener("click", function () { var id = b.getAttribute("data-kick"); qrSend("kick", { id: id }); delete QR.players[id]; QR.order = QR.order.filter(function (x) { return x !== id; }); qrHostBroadcast(); qrHostRender(); }); });
  el.querySelectorAll("#qrKind button").forEach(function (b) { b.addEventListener("click", function () { QR.kind = b.getAttribute("data-k"); qrHostRender(); }); });
  el.querySelectorAll("#qrTotal button").forEach(function (b) { b.addEventListener("click", function () { QR.total = Number(b.getAttribute("data-t")); qrHostRender(); }); });
}

// ── 참여자 ──
function qrPlayerStart(code, name) {
  QR.role = "player"; QR.code = code; QR.me = { id: qrMyId(), name: name }; QR.state = null; QR.picked = null;
  qrApp().innerHTML = '<div class="card"><p class="msg">방에 들어가는 중...</p></div>';
  qrJoinChannel(code, function () {
    qrSend("join", QR.me);
    var tries = 0; clearInterval(QR.timer);
    QR.timer = setInterval(function () {   // 진행자 답이 올 때까지 몇 번 더 알리고, 문제 중에는 남은 시간을 줄인다
      if (!QR.state) { if (++tries > 6) { clearInterval(QR.timer); return qrLeave("이 코드의 방을 찾지 못했어요. 코드를 다시 확인해 주세요."); } return qrSend("join", QR.me); }
      if (QR.state.phase === "q") { var left = QR.localEnds - Date.now(), bar = document.getElementById("qrBar"), cnt = document.getElementById("qrLeft"); if (bar) bar.style.width = Math.max(0, left / (QR.state.secs * 10)) + "%"; if (cnt) cnt.textContent = Math.max(0, Math.ceil(left / 1000)) + "초"; }
    }, 500);
    qrApp().innerHTML = '<div class="card"><p class="qr-big">방 ' + qrEsc(code) + "</p><p class=\"msg\" style=\"text-align:center;\">진행자를 찾는 중...</p></div>";
  });
}
function qrPlayerState(st) {
  if (!st || QR.role !== "player") return;
  if (st.ids && st.ids.indexOf(QR.me.id) < 0) { if (st.phase === "lobby") qrSend("join", QR.me); else if (!QR.state) return; }
  var prev = QR.state; QR.state = st;
  if (st.phase === "q" && (!prev || prev.phase !== "q" || prev.n !== st.n)) { QR.picked = null; QR.localEnds = Date.now() + st.left * 1000; }
  qrPlayerRender();
}
function qrPlayerRender() {
  var st = QR.state, el = qrApp(), html = "";
  if (st.phase === "lobby") {
    html = '<div class="card"><p class="qr-big">방 ' + qrEsc(QR.code) + " · " + qrEsc(QR.me.name) + '</p><p class="msg" style="text-align:center;">들어왔어요! 지금 ' + st.count + "명. 진행자가 시작하기를 기다려요.</p>" +
      '<button class="btn block ghost" id="qrOut">나가기</button></div>';
  } else if (st.phase === "q") {
    html = '<div class="card">' + qrQuestionHtml(st.q, st.n, st.total) + '<div class="qr-choices">' + st.q.choices.map(function (c, i) {
      return '<button data-c="' + i + '"' + (QR.picked !== null ? " disabled" : "") + ' class="' + (QR.picked === i ? "pick" : "") + '">' + qrEsc(c) + "</button>"; }).join("") +
      "</div>" + (QR.picked !== null ? '<p class="qr-big">답을 보냈어요. 결과를 기다려요</p>' : "") + "</div>";
  } else if (st.phase === "r") {
    var right = QR.picked === st.answer, mine = (st.ranks || []).filter(function (r) { return r.id === QR.me.id; })[0], pos = (st.ranks || []).map(function (r) { return r.id; }).indexOf(QR.me.id) + 1;
    html = '<div class="card">' + qrQuestionHtml(st.q, st.n, st.total) + '<div class="qr-choices">' + st.q.choices.map(function (c, i) { return '<button disabled class="' + (i === st.answer ? "ok" : (QR.picked === i ? "pick" : "no")) + '">' + qrEsc(c) + "</button>"; }).join("") +
      '</div><p class="qr-big">' + (QR.picked === null ? "⏰ 시간이 끝났어요" : right ? "⭕ 맞았어요!" + (mine && mine.last ? " +" + mine.last + "점" : "") : "❌ 아쉬워요") + "</p>" +
      (st.note && st.q.kind === "ox" ? '<p class="msg" style="text-align:center;">' + qrEsc(st.note) + "</p>" : "") +
      (mine ? '<p class="msg" style="text-align:center;">지금 ' + pos + "등 · " + mine.score + "점</p>" : "") + qrRankHtml(st.ranks || [], QR.me.id, 5) + "</div>";
  } else {
    var pos2 = (st.ranks || []).map(function (r) { return r.id; }).indexOf(QR.me.id) + 1;
    html = '<div class="card"><p class="qr-big">🎉 끝! ' + (pos2 ? pos2 + "등이에요" : "") + "</p>" + qrRankHtml(st.ranks || [], QR.me.id, 30) + '<button class="btn block ghost" id="qrOut" style="margin-top:12px;">나가기</button></div>';
  }
  el.innerHTML = html;
  var out = document.getElementById("qrOut"); if (out) out.addEventListener("click", function () { qrLeave(""); });
  el.querySelectorAll("[data-c]").forEach(function (b) { b.addEventListener("click", function () {
    if (QR.picked !== null || QR.state.phase !== "q") return;
    QR.picked = Number(b.getAttribute("data-c")); qrSend("a", { id: QR.me.id, n: QR.state.n, c: QR.picked }); qrPlayerRender();
  }); });
}

function initQuizRoom() {
  qrHome("");
  window.addEventListener("pagehide", function () { if (QR.role === "host") qrSend("bye", {}); });
}
