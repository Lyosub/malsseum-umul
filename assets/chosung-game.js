// 성경 인물 초성 퀴즈 — 초성 + 힌트를 보고 4지선다. 10문제.
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

  function buildQuiz() {
    var picks = shuffle(POOL).slice(0, Math.min(QUESTIONS, POOL.length));
    quiz = picks.map(function (item) {
      var others = shuffle(POOL.filter(function (p) { return p.name !== item.name; }))
        .slice(0, 3).map(function (p) { return p.name; });
      return { item: item, choices: shuffle([item.name].concat(others)) };
    });
  }

  function renderQuestion() {
    locked = false;
    feedbackEl.textContent = "";
    var q = quiz[qi];
    progressEl.textContent = (qi + 1) + " / " + quiz.length + "  ·  현재 " + correct + "개 정답";
    chosungEl.textContent = q.item.chosung;
    hintEl.textContent = q.item.hint;
    choicesEl.innerHTML = "";
    q.choices.forEach(function (name) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "cho-choice";
      b.textContent = name;
      b.addEventListener("click", function () { pick(b, name, q.item.name); });
      choicesEl.appendChild(b);
    });
  }

  function pick(btn, chosen, answer) {
    if (locked) return;
    locked = true;
    var buttons = choicesEl.querySelectorAll(".cho-choice");
    buttons.forEach(function (b) {
      b.disabled = true;
      if (b.textContent === answer) b.classList.add("correct");
    });
    if (chosen === answer) {
      correct++;
      feedbackEl.textContent = "정답! 👏";
    } else {
      btn.classList.add("wrong");
      feedbackEl.textContent = "아쉬워요 — 정답은 " + answer;
    }
    setTimeout(next, 1100);
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
