// 수요 성경퀴즈 (객관식 4지선다): weekly.html에서 사용
// 정답은 서버(get_current_quiz/submit_quiz_answer)에서만 다루고 클라이언트로 미리 내려오지 않는다
// auth.js의 getClient(), getSession()에 의존함

function escapeHtmlQuiz(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function initQuizSection() {
  var section = document.getElementById("quizSection");
  var client = getClient();
  if (!section || !client) return;

  getSession().then(function (session) {
    if (!session) {
      section.innerHTML =
        '<p style="color:var(--text-soft);font-size:13.5px;">로그인하면 이번 주 퀴즈를 풀고 달란트를 받을 수 있어요.</p>' +
        '<a href="login.html" class="btn ghost block">로그인하러 가기</a>';
      return;
    }

    client.rpc("get_current_quiz").then(function (res) {
      var rows = res.data || [];
      if (res.error || !rows.length) {
        section.innerHTML = '<p class="msg">아직 등록된 퀴즈가 없어요.</p>';
        return;
      }
      renderQuiz(section, client, rows[0]);
    }).catch(function () {
      section.innerHTML = '<p class="msg">퀴즈를 불러오지 못했어요.</p>';
    });
  });
}

function renderResultView(section, quiz, selected, correctOption, isCorrect) {
  var options = [quiz.option1, quiz.option2, quiz.option3, quiz.option4];
  section.innerHTML =
    '<p style="font-weight:700;margin-bottom:14px;">' + escapeHtmlQuiz(quiz.question) + '</p>' +
    options.map(function (opt, i) {
      var num = i + 1;
      var isMine = num === selected;
      var isAnswer = num === correctOption;
      var color = isAnswer ? "var(--well)" : (isMine ? "var(--gold)" : "var(--text-soft)");
      var mark = isAnswer ? " ✓ 정답" : (isMine ? " (내가 고른 답)" : "");
      return (
        '<div style="padding:10px 12px;border:1px solid var(--border);border-radius:10px;margin-bottom:8px;color:' + color + ';font-weight:' + (isAnswer || isMine ? "700" : "400") + ';">' +
          num + '. ' + escapeHtmlQuiz(opt) + mark +
        '</div>'
      );
    }).join("") +
    '<p class="msg" style="margin-top:10px;">' + (isCorrect ? "🎉 정답이에요! +1달란트 획득" : "아쉬워요, 정답은 위에 표시된 답이에요.") + '</p>';
}

function renderQuiz(section, client, quiz) {
  if (quiz.already_answered) {
    // get_current_quiz는 정답 노출 방지를 위해 이미 답한 경우에도 correct_option을 내려주지 않는다.
    // 그래서 다시 풀게 하는 대신, 맞았는지 여부만 보여준다.
    section.innerHTML =
      '<p style="font-weight:700;margin-bottom:10px;">' + escapeHtmlQuiz(quiz.question) + '</p>' +
      '<p class="msg" style="margin-top:0;">' + (quiz.my_is_correct ? "🎉 이미 참여했어요. 정답을 맞히셨어요!" : "이미 참여했어요. 아쉽지만 정답은 아니었어요.") + '</p>';
    return;
  }

  var options = [quiz.option1, quiz.option2, quiz.option3, quiz.option4];
  section.innerHTML =
    '<p style="font-weight:700;margin-bottom:14px;">' + escapeHtmlQuiz(quiz.question) + '</p>' +
    '<div id="quizOptions"></div>' +
    '<p class="msg" id="quizAnswerMsg"></p>';

  var optionsEl = document.getElementById("quizOptions");
  optionsEl.innerHTML = options.map(function (opt, i) {
    return '<button type="button" class="btn ghost block" data-option="' + (i + 1) + '" style="margin-bottom:8px;text-align:left;">' + (i + 1) + '. ' + escapeHtmlQuiz(opt) + '</button>';
  }).join("");

  optionsEl.querySelectorAll("button[data-option]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      optionsEl.querySelectorAll("button").forEach(function (b) { b.disabled = true; });
      var selected = parseInt(btn.getAttribute("data-option"), 10);
      client.rpc("submit_quiz_answer", { p_quiz_id: quiz.id, p_selected_option: selected }).then(function (res) {
        if (res.error || !res.data || !res.data.length) {
          document.getElementById("quizAnswerMsg").textContent = "제출에 실패했어요. 새로고침 후 다시 시도해주세요.";
          optionsEl.querySelectorAll("button").forEach(function (b) { b.disabled = false; });
          return;
        }
        var result = res.data[0];
        renderResultView(section, quiz, selected, result.correct_option, result.correct);
      });
    });
  });
}
