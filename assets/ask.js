// 물어봐도 돼 — 완전 익명 질문함.
// 작성자 정보를 일절 보내지 않는다. 서버(anon_questions)에도 user_id 컬럼 자체가 없다.
// 익명성이 이 기능의 전부이므로, 추적에 쓰일 수 있는 값을 절대 함께 보내지 않는다.

function initAsk() {
  var MIN = 5;
  var MAX = 500;

  var input = document.getElementById("askInput");
  var countEl = document.getElementById("askCount");
  var submitBtn = document.getElementById("askSubmitBtn");
  var msgEl = document.getElementById("askMsg");
  var writeCard = document.getElementById("askWriteCard");
  var doneCard = document.getElementById("askDoneCard");
  var againBtn = document.getElementById("askAgainBtn");
  var listEl = document.getElementById("qaList");
  var emptyEl = document.getElementById("qaEmpty");

  var client = (typeof getClient === "function") ? getClient() : null;

  function updateCount() {
    var n = input.value.trim().length;
    countEl.textContent = n + " / " + MAX + "자";
    submitBtn.disabled = (n < MIN || n > MAX);
    submitBtn.style.opacity = submitBtn.disabled ? ".5" : "";
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function renderQA(rows) {
    listEl.innerHTML = "";
    if (!rows || !rows.length) {
      emptyEl.style.display = "";
      return;
    }
    emptyEl.style.display = "none";
    rows.forEach(function (r) {
      var div = document.createElement("div");
      div.className = "qa-item";
      div.innerHTML =
        '<p class="qa-q">' + esc(r.content) + "</p>" +
        '<p class="qa-a">' + esc(r.answer) + "</p>";
      listEl.appendChild(div);
    });
  }

  function loadQA() {
    if (!client) return;
    client.rpc("get_answered_questions", { p_limit: 30 }).then(function (res) {
      if (res && !res.error) renderQA(res.data || []);
    }, function () { /* 목록 실패는 조용히 넘긴다 */ });
  }

  function submit() {
    if (!client) {
      msgEl.style.color = "#b3432c";
      msgEl.textContent = "지금은 보낼 수 없어요. 잠시 뒤 다시 해볼까요?";
      return;
    }
    var text = input.value.trim();
    if (text.length < MIN || text.length > MAX) return;

    submitBtn.disabled = true;
    msgEl.style.color = "var(--well)";
    msgEl.textContent = "보내는 중...";

    client.rpc("submit_anon_question", { p_content: text }).then(function (res) {
      if (res && res.error) {
        msgEl.style.color = "#b3432c";
        msgEl.textContent = res.error.message || "보내지 못했어요. 잠시 뒤 다시 해볼까요?";
        updateCount();
        return;
      }
      input.value = "";
      msgEl.textContent = "";
      writeCard.style.display = "none";
      doneCard.style.display = "";
      updateCount();
    }, function () {
      msgEl.style.color = "#b3432c";
      msgEl.textContent = "보내지 못했어요. 잠시 뒤 다시 해볼까요?";
      updateCount();
    });
  }

  input.addEventListener("input", updateCount);
  submitBtn.addEventListener("click", submit);
  againBtn.addEventListener("click", function () {
    doneCard.style.display = "none";
    writeCard.style.display = "";
    input.focus();
  });

  updateCount();
  loadQA();
}
