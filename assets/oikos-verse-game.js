// 말씀 빈칸 채우기 — 오이코스 곳간 게임
// 하루 1판 / 5문제 4지선다 / 맞은 개수 x 2달란트를 내 오이코스 곳간(oikos_talent_ledger, kind='game')에 적립.
// 데이터: assets/verse-quiz-data.js 의 VERSE_QUIZ

function vgShuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function initVerseGame() {
  var client = getClient();
  var statusEl = document.getElementById("vgStatus");
  var startBtn = document.getElementById("vgStartBtn");
  var joinLink = document.getElementById("vgJoinLink");
  var loginLink = document.getElementById("vgLoginLink");
  var introCard = document.getElementById("vgIntro");
  var quizCard = document.getElementById("vgQuizCard");
  var resultCard = document.getElementById("vgResultCard");
  var progressEl = document.getElementById("vgProgress");
  var refEl = document.getElementById("vgRef");
  var textEl = document.getElementById("vgText");
  var choicesEl = document.getElementById("vgChoices");

  var questions = [];
  var idx = 0;
  var correct = 0;
  var locked = false;

  function show(el, on) { if (el) el.style.display = on ? "" : "none"; }

  function loadStatus() {
    getSession().then(function (session) {
      if (!session) {
        statusEl.textContent = "로그인하면 오늘의 문제로 우리 오이코스 곳간을 채울 수 있어요.";
        show(loginLink, true);
        return;
      }
      client.rpc("get_oikos_verse_game_status").then(function (r) {
        var d = (r.data && r.data[0]) || {};
        if (r.error) { statusEl.textContent = "상태를 불러오지 못했어요. 잠시 후 다시 시도해 주세요."; return; }
        if (!d.in_oikos) {
          statusEl.textContent = "오이코스에 들어가야 곳간에 달란트를 쌓을 수 있어요. 마이페이지에서 오이코스에 참여해 보세요.";
          show(joinLink, true);
          return;
        }
        var wk = d.week_points || 0;
        if (d.played_today) {
          statusEl.innerHTML = "오늘은 이미 참여했어요. <strong>우리 오이코스 곳간 +" + (d.today_points || 0) + "</strong> 쌓았어요!<br>" +
            "<span style=\"color:var(--text-soft);font-size:12.5px;\">이번 주 이 게임으로 모은 곳간: " + wk + "달란트 · 내일 다시 도전해요!</span>";
          return;
        }
        statusEl.innerHTML = "오늘의 5문제로 <strong>" + (d.group_name || "우리 오이코스") + "</strong> 곳간을 채워요.<br>" +
          "<span style=\"color:var(--text-soft);font-size:12.5px;\">맞힌 개수 x 2달란트 · 이번 주 이 게임으로 모은 곳간: " + wk + "달란트</span>";
        show(startBtn, true);
      });
    });
  }

  function renderQuestion() {
    var q = questions[idx];
    locked = false;
    progressEl.textContent = (idx + 1) + " / " + questions.length;
    refEl.textContent = q.ref;
    textEl.textContent = q.text;
    choicesEl.innerHTML = "";
    q._choices.forEach(function (choice) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "btn ghost block";
      b.style.textAlign = "center";
      b.textContent = choice;
      b.addEventListener("click", function () { pick(b, choice, q); });
      choicesEl.appendChild(b);
    });
  }

  function pick(btn, choice, q) {
    if (locked) return;
    locked = true;
    var right = choice === q.answer;
    if (right) correct++;
    Array.prototype.forEach.call(choicesEl.querySelectorAll("button"), function (b) {
      b.disabled = true;
      if (b.textContent === q.answer) { b.style.background = "var(--well)"; b.style.color = "#fff"; b.style.borderColor = "var(--well)"; }
    });
    if (!right) { btn.style.background = "#f7e2dd"; btn.style.color = "#b3432c"; btn.style.borderColor = "#d98b7a"; }
    setTimeout(function () {
      idx++;
      if (idx < questions.length) renderQuestion();
      else finish();
    }, 850);
  }

  function finish() {
    show(quizCard, false);
    client.rpc("submit_oikos_verse_game", { p_correct: correct }).then(function (r) {
      var pts = (typeof r.data === "number") ? r.data : (correct * 2);
      document.getElementById("vgResultCorrect").textContent = correct;
      var noteEl = document.getElementById("vgResultNote");
      if (r.error) {
        document.getElementById("vgResultPoints").textContent = "";
        noteEl.textContent = r.error.message || "결과 저장에 실패했어요.";
      } else {
        document.getElementById("vgResultPoints").textContent = "우리 오이코스 곳간 +" + pts;
        noteEl.textContent = pts > 0 ? "곳간에 잘 쌓였어요. 내일 또 도전해요!" : "아쉽지만 오늘은 0점이에요. 내일 다시!";
      }
      show(resultCard, true);
    }).catch(function () {
      document.getElementById("vgResultCorrect").textContent = correct;
      document.getElementById("vgResultPoints").textContent = "";
      document.getElementById("vgResultNote").textContent = "결과 저장에 실패했어요. 네트워크를 확인해 주세요.";
      show(resultCard, true);
    });
  }

  if (startBtn) {
    startBtn.addEventListener("click", function () {
      if (!Array.isArray(VERSE_QUIZ) || VERSE_QUIZ.length < 5) { statusEl.textContent = "문제를 불러오지 못했어요."; return; }
      questions = vgShuffle(VERSE_QUIZ).slice(0, 5).map(function (q) {
        var copy = {};
        for (var k in q) copy[k] = q[k];
        copy._choices = vgShuffle(q.choices);
        return copy;
      });
      idx = 0; correct = 0;
      show(introCard, false);
      show(quizCard, true);
      renderQuestion();
    });
  }

  loadStatus();
}
