// 성경 O/X 스피드퀴즈 — 문장을 보고 제한시간(7초) 안에 O/X 판단.
// 시간 초과도 오답 처리. 10문제를 다 풀면 submit_ox_quiz(맞은개수)로 하루 첫 1회 +2달란트.

function initOxGame() {
  var POOL = (typeof OX_QUIZ !== "undefined") ? OX_QUIZ : [];
  var QUESTIONS = 10;
  var TIME_LIMIT = 7000; // ms

  var startCard = document.getElementById("oxStartCard");
  var playCard = document.getElementById("oxPlayCard");
  var doneCard = document.getElementById("oxDoneCard");
  var startBtn = document.getElementById("oxStartBtn");
  var progressEl = document.getElementById("oxProgress");
  var timerFill = document.getElementById("oxTimerFill");
  var statementEl = document.getElementById("oxStatement");
  var oBtn = document.getElementById("oxBtnO");
  var xBtn = document.getElementById("oxBtnX");
  var feedbackEl = document.getElementById("oxFeedback");
  var scoreEl = document.getElementById("oxScore");
  var doneMsg = document.getElementById("oxDoneMsg");
  var againBtn = document.getElementById("oxAgainBtn");

  var quiz = [];
  var qi = 0;
  var correct = 0;
  var locked = false;
  var timerRaf = null;
  var timerStart = 0;
  var gameStartAt = 0;   // 열 문제 전체에 걸린 시간(랭킹 동점자 가르기용)

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function buildQuiz() {
    quiz = shuffle(POOL).slice(0, Math.min(QUESTIONS, POOL.length));
  }

  function stopTimer() {
    if (timerRaf) cancelAnimationFrame(timerRaf);
    timerRaf = null;
  }

  function tickTimer() {
    var elapsed = Date.now() - timerStart;
    var pct = Math.max(0, 1 - elapsed / TIME_LIMIT);
    timerFill.style.width = (pct * 100) + "%";
    if (elapsed >= TIME_LIMIT) {
      answer(null); // 시간 초과 = 오답
      return;
    }
    timerRaf = requestAnimationFrame(tickTimer);
  }

  function renderQuestion() {
    locked = false;
    feedbackEl.textContent = "";
    oBtn.disabled = false;
    xBtn.disabled = false;
    var q = quiz[qi];
    progressEl.textContent = (qi + 1) + " / " + quiz.length + "  ·  현재 " + correct + "개 정답";
    statementEl.textContent = q.statement;
    timerFill.style.width = "100%";
    timerStart = Date.now();
    stopTimer();
    timerRaf = requestAnimationFrame(tickTimer);
  }

  function answer(picked) {
    if (locked) return;
    locked = true;
    stopTimer();
    oBtn.disabled = true;
    xBtn.disabled = true;
    var q = quiz[qi];
    var got = picked !== null && picked === q.answer;
    if (got) correct++;
    var right = q.answer ? "O" : "X";
    if (picked === null) {
      feedbackEl.textContent = "시간 초과! 정답은 " + right + " — " + q.note;
    } else {
      feedbackEl.textContent = (got ? "정답! 👏  " : "아쉬워요, 정답은 " + right + "  ") + "— " + q.note;
    }
    setTimeout(next, 1400);
  }

  function next() {
    qi++;
    if (qi >= quiz.length) return finish();
    renderQuestion();
  }

  function finish() {
    stopTimer();
    playCard.style.display = "none";
    doneCard.style.display = "block";
    scoreEl.textContent = quiz.length + "문제 중 " + correct + "개 정답";
    doneMsg.textContent = "";

    // 랭킹용: 정답 수가 같으면 더 빨리 푼 사람이 위로 간다.
    var totalMs = gameStartAt ? (Date.now() - gameStartAt) : null;

    var client = (typeof getClient === "function") ? getClient() : null;
    if (!client) { doneMsg.textContent = "로그인하면 달란트가 저장돼요."; return; }
    getSession().then(function (session) {
      if (!session) { doneMsg.textContent = "로그인하면 달란트가 저장돼요."; return; }
      client.rpc("submit_ox_quiz", { p_correct: correct, p_time_ms: totalMs }).then(function (res) {
        var pts = (res && !res.error) ? res.data : 0;
        doneMsg.textContent = pts > 0 ? ("+" + pts + "달란트 🎉") : "잘했어요! (오늘 달란트는 이미 받았어요)";
      }, function () { doneMsg.textContent = "잘했어요!"; });
    });
  }

  function start() {
    correct = 0; qi = 0;
    gameStartAt = Date.now();
    buildQuiz();
    if (!quiz.length) { startCard.innerHTML = '<p class="msg">문제를 불러오지 못했어요.</p>'; return; }
    startCard.style.display = "none";
    doneCard.style.display = "none";
    playCard.style.display = "block";
    renderQuestion();
  }

  startBtn.addEventListener("click", start);
  againBtn.addEventListener("click", function () { doneCard.style.display = "none"; start(); });
  oBtn.addEventListener("click", function () { answer(true); });
  xBtn.addEventListener("click", function () { answer(false); });
}
