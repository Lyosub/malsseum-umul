// 이번 주 묵상(QT). get_current_devotion / checkin_devotion / get_my_devotion_status 에 의존.
// auth.js의 getClient(), getSession().

function qtEscape(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function qtRenderContent(d) {
  var el = document.getElementById("qtContent");
  if (!el) return;
  if (!d) {
    el.innerHTML = '<p class="msg" style="margin:0;">이번 주 묵상이 아직 등록되지 않았어요. 곧 올라올 거예요.</p>';
    return;
  }
  var body = qtEscape(d.scripture_text).replace(/\n/g, "<br>");
  var prompts = Array.isArray(d.prompts) ? d.prompts : [];
  var qhtml = prompts.length
    ? '<div class="well-label" style="margin:18px 0 8px;">묵상 질문</div><ol style="padding-left:20px;margin:0;font-size:14px;line-height:1.9;">' +
        prompts.map(function (p) { return '<li>' + qtEscape(p) + '</li>'; }).join("") + '</ol>'
    : '';
  el.innerHTML =
    '<div style="font-weight:800;color:var(--well-deep);font-size:15px;">' + qtEscape(d.scripture_ref) + '</div>' +
    '<div style="margin-top:10px;font-size:14.5px;line-height:1.85;color:var(--text);">' + body + '</div>' +
    qhtml;
}

function qtBindCheckin(userId) {
  var card = document.getElementById("qtStreakCard");
  var numEl = document.getElementById("qtStreakNum");
  var btn = document.getElementById("qtCheckBtn");
  var msg = document.getElementById("qtMsg");
  var client = getClient();
  if (!card || !client) return;
  card.style.display = "block";

  function refresh() {
    client.rpc("get_my_devotion_status").then(function (res) {
      if (res.error || !res.data || !res.data.length) return;
      var s = res.data[0];
      if (numEl) numEl.textContent = s.streak || 0;
      if (s.checked_today) {
        btn.textContent = "오늘 묵상 완료 ✅";
        btn.disabled = true;
      } else {
        btn.textContent = "오늘 묵상 체크하기";
        btn.disabled = false;
      }
    });
  }

  btn.addEventListener("click", function () {
    btn.disabled = true;
    if (msg) msg.textContent = "";
    client.rpc("checkin_devotion").then(function (res) {
      if (res.error) {
        if (msg) msg.textContent = "오류가 발생했어요. 다시 시도해주세요.";
        btn.disabled = false;
        return;
      }
      if (res.data === true) {
        if (msg) msg.textContent = "묵상 체크 완료! +1 달란트 🎉";
      } else {
        if (msg) msg.textContent = "이미 오늘 묵상했어요.";
      }
      refresh();
    }).catch(function () {
      if (msg) msg.textContent = "네트워크 오류로 처리하지 못했어요.";
      btn.disabled = false;
    });
  });

  refresh();
}

function initQtPage() {
  var client = getClient();
  if (client) {
    client.rpc("get_current_devotion").then(function (res) {
      qtRenderContent((res.data && res.data[0]) || null);
    }).catch(function () { qtRenderContent(null); });
  }

  getSession().then(function (session) {
    if (session) {
      qtBindCheckin(session.user.id);
    } else {
      var hint = document.getElementById("qtLoginHint");
      if (hint) hint.style.display = "block";
    }
  });
}
