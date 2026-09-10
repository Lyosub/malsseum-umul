// 오늘의 말씀 외우기 — 오늘의 QT 구절을 잠깐 보여준 뒤, 단어(어절) 칩을 순서대로 눌러 완성한다.
// 처음 완성하면 submit_verse_memory_game() 으로 하루 첫 1회 +2달란트. 연습은 자유(달란트 없음).

function initMemorizeGame() {
  var verse = (typeof getVerseFor === "function") ? getVerseFor("daily") : null;
  if (!verse || !verse.text) {
    document.getElementById("vmShowCard").innerHTML = '<p class="msg">오늘의 말씀을 불러오지 못했어요.</p>';
    return;
  }

  var tokens = String(verse.text).trim().split(/\s+/);
  var refEl = document.getElementById("vmVerseRef");
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

  refEl.textContent = verse.ref || "";
  showText.textContent = verse.text;

  var nextIndex = 0;
  var awardedThisSession = false;
  var peekTimer = null;

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
    // 각 칩에 원래 인덱스를 달아 같은 단어가 여러 번 나와도 순서를 정확히 판정한다
    var order = shuffle(tokens.map(function (tok, i) { return { tok: tok, i: i }; }));
    order.forEach(function (item) {
      var c = chip(item.tok);
      c.dataset.idx = item.i;
      c.addEventListener("click", function () { onPick(c, item.i); });
      poolEl.appendChild(c);
    });
  }

  function onPick(el, idx) {
    if (el.disabled) return;
    if (idx === nextIndex) {
      el.disabled = true;
      el.classList.add("used");
      var placed = chip(tokens[idx], "placed");
      answerEl.appendChild(placed);
      nextIndex++;
      if (nextIndex === tokens.length) finish();
    } else {
      el.classList.remove("wrong");
      // 리플로우 강제 후 다시 붙여 흔들림 애니메이션 재생
      void el.offsetWidth;
      el.classList.add("wrong");
      playMsg.textContent = "순서가 달라요. 다시 볼까요?";
    }
  }

  function finish() {
    playCard.style.display = "none";
    doneCard.style.display = "block";
    doneVerse.textContent = verse.text;
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
    startBtn.style.display = "none";
    var left = seconds;
    countdownEl.textContent = left + "초 뒤에 가려져요";
    clearInterval(peekTimer);
    peekTimer = setInterval(function () {
      left--;
      if (left <= 0) {
        clearInterval(peekTimer);
        countdownEl.textContent = "";
        startBtn.style.display = "block";
        showCard.style.display = "none";
        playCard.style.display = "block";
      } else {
        countdownEl.textContent = left + "초 뒤에 가려져요";
      }
    }, 1000);
  }

  function start(freshPool) {
    doneCard.style.display = "none";
    if (freshPool) buildPool();
    peek(7);
  }

  startBtn.addEventListener("click", function () {
    clearInterval(peekTimer);
    countdownEl.textContent = "";
    showCard.style.display = "none";
    playCard.style.display = "block";
  });
  peekBtn.addEventListener("click", function () { peek(4); });
  restartBtn.addEventListener("click", function () { start(true); });
  againBtn.addEventListener("click", function () { start(true); });

  // 첫 진입: 풀 만들고 7초 미리보기
  start(true);
}
