// 성경 인물 초성 퀴즈 — 초성 + 짧은 힌트를 보고 이름을 "직접 입력"한다.
// 보기(4지선다)를 없애서 "정답을 알려주는" 느낌을 뺐다. 막히면 "넘기기"로 정답을 보고 넘어갈 수 있다.
// 10문제를 다 풀면 submit_chosung_quiz(맞은개수) 로 하루 첫 1회 +2달란트.

function initChosungGame() {
  var POOL = (typeof CHOSUNG_QUIZ !== "undefined") ? CHOSUNG_QUIZ : [];
  var QUESTIONS = 10;

  var startCard = document.getElementById("choStartCard");
  var playCard = document.getElementById("choPlayCard");
  var doneCard = document.getElementById("choDoneCard");
  var startBtn = document.getElementById("choStartBtn");
  var progressEl = document.getElementById("choProgress");
  var chosungEl = document.getElementById("choChosung");
  var hintEl = document.getElementById("choHint");
  var choicesEl = document.getElementById("choChoices");
  var feedbackEl = document.getElementById("choFeedback");
  var scoreEl = document.getElementById("choScore");
  var doneMsg = document.getElementById("choDoneMsg");
  var againBtn = document.getElementById("choAgainBtn");

  var quiz = [];
  var qi = 0;
  var correct = 0;
  var locked = false;

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function norm(s) {
    return String(s || "").replace(/\s+/g, "").trim();
  }

  function buildQuiz() {
    quiz = shuffle(POOL).slice(0, Math.min(QUESTIONS, POOL.length));
  }

  function renderQuestion() {
    locked = false;
    feedbackEl.textContent = "";
    var q = quiz[qi];
    progressEl.textContent = (qi + 1) + " / " + quiz.length + "  ·  현재 " + correct + "개 정답";
    chosungEl.textContent = q.chosung;
    hintEl.textContent = q.hint;
    choicesEl.innerHTML =
      '<div class="cho-answer-row">' +
        '<input type="text" id="choInput" class="cho-input" autocomplete="off" autocorrect="off" ' +
          'autocapitalize="off" spellcheck="false" placeholder="인물 이름을 적어요">' +
        '<button type="button" id="choSubmitBtn" class="pill-blue">확인</button>' +
      '</div>' +
      '<button type="button" id="choSkipBtn" class="btn ghost block" style="margin-top:10px;font-size:12.5px;">모르겠어요 · 넘기기</button>';

    var input = document.getElementById("choInput");
    var submitBtn = document.getElementById("choSubmitBtn");
    var skipBtn = document.getElementById("choSkipBtn");
    input.focus();
    submitBtn.addEventListener("click", function () { check(input.value); });
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") check(input.value); });
    skipBtn.addEventListener("click", function () { reveal(false); });
  }

  function check(value) {
    if (locked) return;
    var q = quiz[qi];
    if (norm(value) === norm(q.name)) {
      locked = true;
      correct++;
      feedbackEl.textContent = "정답! 👏";
      setTimeout(next, 900);
    } else {
      feedbackEl.textContent = "아직 아니에요. 다시 생각해볼까요? (모르겠으면 넘기기)";
    }
  }

  function reveal(gotIt) {
    if (locked) return;
    locked = true;
    feedbackEl.textContent = (gotIt ? "정답! 👏  " : "정답은 ") + quiz[qi].name;
    setTimeout(next, 1200);
  }

  function next() {
    qi++;
    if (qi >= quiz.length) return finish();
    renderQuestion();
  }

  function finish() {
    playCard.style.display = "none";
    doneCard.style.display = "block";
    scoreEl.textContent = quiz.length + "문제 중 " + correct + "개 정답";
    doneMsg.textContent = "";

    var client = (typeof getClient === "function") ? getClient() : null;
    if (!client) { doneMsg.textContent = "로그인하면 달란트가 저장돼요."; return; }
    getSession().then(function (session) {
      if (!session) { doneMsg.textContent = "로그인하면 달란트가 저장돼요."; return; }
      client.rpc("submit_chosung_quiz", { p_correct: correct }).then(function (res) {
        var pts = (res && !res.error) ? res.data : 0;
        doneMsg.textContent = pts > 0 ? ("+" + pts + "달란트 🎉") : "잘했어요! (오늘 달란트는 이미 받았어요)";
      }, function () { doneMsg.textContent = "잘했어요!"; });
    });
  }

  function start() {
    correct = 0; qi = 0;
    buildQuiz();
    if (!quiz.length) { startCard.innerHTML = '<p class="msg">문제를 불러오지 못했어요.</p>'; return; }
    startCard.style.display = "none";
    doneCard.style.display = "none";
    playCard.style.display = "block";
    renderQuestion();
  }

  startBtn.addEventListener("click", start);
  againBtn.addEventListener("click", function () { doneCard.style.display = "none"; start(); });
}
