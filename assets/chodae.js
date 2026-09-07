// 친구초청잔치(2026-09-13) 페이지.
//  · D-day 카운트다운
//  · 중등부 전체 진행률 (get_invite_progress — 숫자만, 이름 비공개)
//  · 로그인 시: 내가 초청한 친구 명단 (add_friend_invite / delete_friend_invite / get_my_friend_invites)
//  · 2026-09-01 이후 가입자에게는 "새친구 환영" 카드
// auth.js의 getClient(), getSession()에 의존.

var CHODAE_EVENT_MS = new Date("2026-09-13T00:00:00+09:00").getTime();
var CHODAE_EVENT_END_MS = new Date("2026-09-14T23:59:59+09:00").getTime();

function chodaeEscape(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function chodaeRenderDday() {
  var ddayEl = document.getElementById("chodaeDday");
  var dateEl = document.getElementById("chodaeDate");
  if (!ddayEl) return;
  var now = Date.now();
  // 오늘 자정(KST) 기준으로 남은 "일" 계산
  var msPerDay = 24 * 60 * 60 * 1000;
  var diffDays = Math.ceil((CHODAE_EVENT_MS - now) / msPerDay);

  if (now >= CHODAE_EVENT_MS && now <= CHODAE_EVENT_END_MS) {
    ddayEl.textContent = "D-DAY";
    if (dateEl) dateEl.textContent = "오늘, 잔치가 열렸어요! 🎉";
  } else if (now > CHODAE_EVENT_END_MS) {
    ddayEl.textContent = "감사했어요";
    if (dateEl) dateEl.textContent = "함께한 모든 친구에게 감사드려요 🙌";
  } else if (diffDays <= 0) {
    ddayEl.textContent = "D-DAY";
  } else {
    ddayEl.textContent = "D-" + diffDays;
  }
}

function chodaeLoadProgress() {
  var client = getClient();
  var fill = document.getElementById("chodaeProgressFill");
  var caption = document.getElementById("chodaeProgressCaption");
  var statRow = document.getElementById("chodaeStatRow");
  if (!client || !fill) return;

  client.rpc("get_invite_progress").then(function (res) {
    if (res.error || !res.data || !res.data.length) {
      if (caption) caption.textContent = "진행률을 불러오지 못했어요.";
      return;
    }
    var d = res.data[0];
    var goal = d.goal || 40;
    var pledged = d.pledged_total || 0;
    var came = d.came_total || 0;
    var pct = Math.min(100, Math.round((pledged / goal) * 100));
    fill.style.width = pct + "%";
    if (caption) {
      caption.textContent = "초청 작정 " + pledged + "명 / 목표 " + goal + "명 (" + pct + "%)";
    }
    if (statRow) {
      statRow.style.display = "flex";
      document.getElementById("chodaeStatPledged").textContent = pledged;
      document.getElementById("chodaeStatCame").textContent = came;
      document.getElementById("chodaeStatInviters").textContent = d.inviter_count || 0;
    }
  }).catch(function () {
    if (caption) caption.textContent = "진행률을 불러오지 못했어요.";
  });
}

function chodaeRenderMyList(rows) {
  var listEl = document.getElementById("chodaeInviteList");
  if (!listEl) return;
  if (!rows || !rows.length) {
    listEl.innerHTML = '<p class="msg">아직 등록한 친구가 없어요. 초청하고 싶은 친구 이름을 적어보세요.</p>';
    return;
  }
  listEl.innerHTML = rows.map(function (r) {
    return (
      '<div class="note-item" style="display:flex;justify-content:space-between;align-items:center;gap:10px;">' +
        '<div class="content" style="overflow-wrap:anywhere;">' +
          (r.came ? '🎉 ' : '🙏 ') + chodaeEscape(r.friend_name) +
          (r.came ? ' <span style="color:var(--well);font-size:11.5px;">잔치에 왔어요</span>' : '') +
        '</div>' +
        '<button type="button" class="chodae-del" data-id="' + r.id + '" aria-label="삭제">✕</button>' +
      '</div>'
    );
  }).join("");

  listEl.querySelectorAll(".chodae-del").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-id");
      btn.disabled = true;
      getClient().rpc("delete_friend_invite", { p_id: Number(id) }).then(function (res) {
        if (res.error) { btn.disabled = false; return; }
        chodaeLoadMyList();
        chodaeLoadProgress();
      });
    });
  });
}

function chodaeLoadMyList() {
  var client = getClient();
  if (!client) return;
  client.rpc("get_my_friend_invites").then(function (res) {
    if (res.error) {
      var listEl = document.getElementById("chodaeInviteList");
      if (listEl) listEl.innerHTML = '<p class="msg">명단을 불러오지 못했어요.</p>';
      return;
    }
    chodaeRenderMyList(res.data || []);
  });
}

function chodaeInitMine() {
  var form = document.getElementById("chodaeInviteForm");
  var input = document.getElementById("chodaeInviteName");
  var msg = document.getElementById("chodaeInviteMsg");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = (input.value || "").trim();
    if (msg) msg.textContent = "";
    if (!name) { if (msg) msg.textContent = "친구 이름을 적어주세요."; return; }
    var submitBtn = form.querySelector("button[type=submit]");
    if (submitBtn) submitBtn.disabled = true;
    getClient().rpc("add_friend_invite", { p_name: name }).then(function (res) {
      if (submitBtn) submitBtn.disabled = false;
      if (res.error) {
        if (msg) msg.textContent = res.error.message || "등록에 실패했어요.";
        return;
      }
      input.value = "";
      chodaeLoadMyList();
      chodaeLoadProgress();
    });
  });
}

function chodaeCheckWelcome(session) {
  if (!session) return;
  var client = getClient();
  if (!client) return;
  client.from("profiles").select("created_at").eq("user_id", session.user.id).maybeSingle().then(function (res) {
    var row = res.data;
    if (!row || !row.created_at) return;
    if (new Date(row.created_at).getTime() >= new Date("2026-09-01T00:00:00+09:00").getTime()) {
      var el = document.getElementById("chodaeWelcome");
      if (el) el.style.display = "block";
    }
  });
}

function initChodaePage() {
  chodaeRenderDday();
  chodaeLoadProgress();

  var loginNeeded = document.getElementById("chodaeLoginNeeded");
  var mine = document.getElementById("chodaeMine");

  getSession().then(function (session) {
    if (!session) {
      if (loginNeeded) loginNeeded.style.display = "block";
      if (mine) mine.style.display = "none";
      return;
    }
    if (loginNeeded) loginNeeded.style.display = "none";
    if (mine) mine.style.display = "block";
    chodaeInitMine();
    chodaeLoadMyList();
    chodaeCheckWelcome(session);
  });
}
