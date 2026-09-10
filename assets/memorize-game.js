// 오늘의 말씀 외우기 — 세 구절(1. 오늘의 QT  2. 이번 주  3. 이번 달)을 잠깐 보여준 뒤,
// 각 구절의 단어(어절) 칩을 순서대로 눌러 완성한다. 세 문제를 다 완성하면
// submit_verse_memory_game() 으로 하루 첫 1회 +2달란트. 연습은 자유(달란트 없음).

function initMemorizeGame() {
  var showCard = document.getElementById("vmShowCard");
  var showText = document.getElementById("vmShowText");
  var countdownEl = document.getElementById("vmCountdown");
  var startBtn = document.getElementById("vmStartBtn");
  var playCard = document.getElementById("vmPlayCard");
  var answerEl = document.getElementById("vmAnswer");
  var poolEl = document.getElementById("vmPool");
  var playMsg = document.getElementById("vmPlayMsg");
  var peekBtn = document.getElementById("vmPeekBtn");
  var restartBtn = document.getElementById("vmRestartBtn");
  var doneCard = document.getElementById("vmDoneCard");
  var doneVerse = document.getElementById("vmDoneVerse");
  var doneMsg = document.getElementById("vmDoneMsg");
  var againBtn = document.getElementById("vmAgainBtn");
  var refEl = document.getElementById("vmVerseRef");

  function tokensOf(v) { return String(v && v.text || "").trim().split(/\s+/); }

  // 세 구절 준비 — 1번은 항상 오늘의 QT(daily). 2·3번은 주간·월간을 쓰되, 너무 긴 구절(어절 18개 초과)은
  // 외우기 게임에 벅차므로 짧은 미사용 구절로 대체한다. 중복(ref) 제거.
  var LONG_LIMIT = 18;
  var rounds = [];
  var used = {};
  function add(v) { if (v && v.text && !used[v.ref]) { used[v.ref] = 1; rounds.push(v); return true; } return false; }

  var shortPool = (typeof BLESSING_POOL !== "undefined")
    ? BLESSING_POOL.slice().sort(function (a, b) { return tokensOf(a).length - tokensOf(b).length; })
    : [];
  function addShortUnused() {
    for (var k = 0; k < shortPool.length; k++) {
      if (!used[shortPool[k].ref]) { add(shortPool[k]); return; }
    }
  }

  if (typeof getVerseFor === "function") add(getVerseFor("daily"));
  [getVerseFor && getVerseFor("weekly"), getVerseFor && getVerseFor("monthly")].forEach(function (v) {
    if (rounds.length >= 3) return;
    if (v && v.text && !used[v.ref] && tokensOf(v).length <= LONG_LIMIT) add(v);
    else addShortUnused();
  });
  while (rounds.length < 3 && shortPool.length) { var before = rounds.length; addShortUnused(); if (rounds.length === before) break; }

  if (!rounds.length) {
    showCard.innerHTML = '<p class="msg">말씀을 불러오지 못했어요.</p>';
    return;
  }

  var roundIndex = 0;
  var tokens = [];
  var nextIndex = 0;
  var awardedThisSession = false;
  var peekTimer = null;

  function verse() { return rounds[roundIndex]; }
  function peekSecondsFor(n) { return Math.min(14, Math.max(6, Math.round(n * 0.55))); }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function chip(text, cls) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "mem-chip" + (cls ? " " + cls : "");
    b.textContent = text;
    return b;
  }

  function buildPool() {
    poolEl.innerHTML = "";
    answerEl.innerHTML = "";
    nextIndex = 0;
    playMsg.textContent = "";
    var order = shuffle(tokens.map(function (tok, i) { return { tok: tok, i: i }; }));
    order.forEach(function (item) {
      var c = chip(item.tok);
      c.addEventListener("click", function () { onPick(c, item.i); });
      poolEl.appendChild(c);
    });
  }

  function onPick(el, idx) {
    if (el.disabled) return;
    if (idx === nextIndex) {
      el.disabled = true;
      el.classList.add("used");
      answerEl.appendChild(chip(tokens[idx], "placed"));
      nextIndex++;
      if (nextIndex === tokens.length) roundDone();
    } else {
      el.classList.remove("wrong");
      void el.offsetWidth;
      el.classList.add("wrong");
      playMsg.textContent = "순서가 달라요. 다시 볼까요?";
    }
  }

  function roundDone() {
    if (roundIndex < rounds.length - 1) {
      playMsg.textContent = "✅ 완성! 다음 말씀이에요 (" + (roundIndex + 2) + " / " + rounds.length + ")";
      roundIndex++;
      setTimeout(loadRound, 1100);
    } else {
      finishAll();
    }
  }

  function finishAll() {
    playCard.style.display = "none";
    showCard.style.display = "none";
    doneCard.style.display = "block";
    doneVerse.textContent = verse().text;
    doneMsg.textContent = "";

    var client = (typeof getClient === "function") ? getClient() : null;
    if (!client) { doneMsg.textContent = "로그인하면 달란트가 저장돼요."; return; }
    getSession().then(function (session) {
      if (!session) { doneMsg.textContent = "로그인하면 달란트가 저장돼요."; return; }
      if (awardedThisSession) { doneMsg.textContent = "잘했어요! (오늘 달란트는 이미 받았어요)"; return; }
      client.rpc("submit_verse_memory_game").then(function (res) {
        var pts = (res && !res.error) ? res.data : 0;
        if (pts > 0) { doneMsg.textContent = "+" + pts + "달란트 🎉"; awardedThisSession = true; }
        else { doneMsg.textContent = "잘했어요! (오늘 달란트는 이미 받았어요)"; }
      }, function () { doneMsg.textContent = "잘했어요!"; });
    });
  }

  function peek(seconds) {
    showCard.style.display = "block";
    playCard.style.display = "none";
    startBtn.style.display = "block";
    var left = seconds;
    countdownEl.textContent = left + "초 뒤에 가려져요";
    clearInterval(peekTimer);
    peekTimer = setInterval(function () {
      left--;
      if (left <= 0) {
        clearInterval(peekTimer);
        countdownEl.textContent = "";
        showCard.style.display = "none";
        playCard.style.display = "block";
      } else {
        countdownEl.textContent = left + "초 뒤에 가려져요";
      }
    }, 1000);
  }

  // 한 라운드 시작: 구절 세팅 → 칩 만들기 → 미리보기
  function loadRound() {
    tokens = tokensOf(verse());
    refEl.textContent = (roundIndex + 1) + " / " + rounds.length + "  ·  " + (verse().ref || "");
    showText.textContent = verse().text;
    doneCard.style.display = "none";
    buildPool();
    peek(peekSecondsFor(tokens.length));
  }

  startBtn.addEventListener("click", function () {
    clearInterval(peekTimer);
    countdownEl.textContent = "";
    showCard.style.display = "none";
    playCard.style.display = "block";
  });
  peekBtn.addEventListener("click", function () { peek(4); });
  restartBtn.addEventListener("click", function () { loadRound(); });
  againBtn.addEventListener("click", function () { roundIndex = 0; loadRound(); });

  loadRound();
}
