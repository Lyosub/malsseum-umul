// 오늘의 한 줄 — 그 주일 설교에서 마음에 남은 한 문장을 남긴다.
// 한 사람이 한 주일에 한 줄. 다시 쓰면 수정되고, 달란트는 그 주일에 한 번만 적립된다.
// 서버 쪽 규칙은 sql-migrations/2026-09-18-sermon-line-and-anon-questions.sql 참고.

function initSermonLine() {
  var MIN = 10;
  var MAX = 100;

  var loginCard = document.getElementById("lineLoginCard");
  var writeCard = document.getElementById("lineWriteCard");
  var writeTitle = document.getElementById("lineWriteTitle");
  var input = document.getElementById("lineInput");
  var countEl = document.getElementById("lineCount");
  var submitBtn = document.getElementById("lineSubmitBtn");
  var msgEl = document.getElementById("lineMsg");
  var listWrap = document.getElementById("lineListWrap");
  var listEl = document.getElementById("lineList");
  var emptyEl = document.getElementById("lineListEmpty");

  var client = (typeof getClient === "function") ? getClient() : null;
  var hasExisting = false;

  function updateCount() {
    var n = input.value.trim().length;
    countEl.textContent = n + " / " + MAX + "자";
    countEl.className = "line-count" + (n > MAX ? " over" : "");
    submitBtn.disabled = (n < MIN || n > MAX);
    submitBtn.style.opacity = submitBtn.disabled ? ".5" : "";
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function renderList(rows) {
    listEl.innerHTML = "";
    if (!rows || !rows.length) {
      emptyEl.style.display = "";
      return;
    }
    emptyEl.style.display = "none";
    rows.forEach(function (r) {
      var div = document.createElement("div");
      var cls = "line-item";
      if (r.is_picked) cls += " picked";
      else if (r.is_mine) cls += " mine";
      div.className = cls;

      var tags = "";
      if (r.is_picked) tags += '<span class="line-tag picked">인스타에 실렸어요</span>';
      if (r.is_mine) tags += '<span class="line-tag mine">내 한 줄</span>';

      div.innerHTML =
        '<p class="line-text">' + esc(r.content) + "</p>" +
        '<div class="line-meta"><span>' + esc(r.nickname || "친구") + "</span>" + tags + "</div>";
      listEl.appendChild(div);
    });
  }

  function loadList() {
    if (!client) return;
    client.rpc("get_sermon_lines", { p_service_date: null, p_limit: 100 }).then(function (res) {
      if (res && !res.error) {
        listWrap.style.display = "";
        renderList(res.data || []);
      }
    }, function () { /* 목록은 실패해도 작성은 계속 가능하게 둔다 */ });
  }

  function loadMine() {
    if (!client) return;
    client.rpc("get_my_sermon_line", {}).then(function (res) {
      var row = (res && !res.error && res.data && res.data.length) ? res.data[0] : null;
      if (row) {
        hasExisting = true;
        input.value = row.content;
        writeTitle.textContent = "내가 남긴 한 줄";
        submitBtn.textContent = "고쳐서 다시 남기기";
        msgEl.textContent = "";
      }
      updateCount();
    }, function () { updateCount(); });
  }

  function submit() {
    if (!client) return;
    var text = input.value.trim();
    if (text.length < MIN || text.length > MAX) return;

    submitBtn.disabled = true;
    msgEl.textContent = "저장하는 중...";

    client.rpc("submit_sermon_line", { p_content: text }).then(function (res) {
      if (res && res.error) {
        msgEl.style.color = "#b3432c";
        msgEl.textContent = res.error.message || "저장하지 못했어요. 잠시 뒤 다시 해볼까요?";
        updateCount();
        return;
      }
      var pts = res ? res.data : 0;
      msgEl.style.color = "var(--well)";
      if (pts > 0) msgEl.textContent = "+" + pts + "달란트 🎉 고마워요!";
      else if (hasExisting) msgEl.textContent = "고쳤어요! (달란트는 이미 받았어요)";
      else msgEl.textContent = "남겼어요! (달란트는 이미 받았어요)";

      hasExisting = true;
      writeTitle.textContent = "내가 남긴 한 줄";
      submitBtn.textContent = "고쳐서 다시 남기기";
      updateCount();
      loadList();
    }, function () {
      msgEl.style.color = "#b3432c";
      msgEl.textContent = "저장하지 못했어요. 잠시 뒤 다시 해볼까요?";
      updateCount();
    });
  }

  input.addEventListener("input", updateCount);
  submitBtn.addEventListener("click", submit);
  updateCount();

  if (!client) {
    loginCard.style.display = "";
    return;
  }

  getSession().then(function (session) {
    if (!session) {
      loginCard.style.display = "";
      return;
    }
    writeCard.style.display = "";
    loadMine();
    loadList();
  }, function () {
    loginCard.style.display = "";
  });
}
