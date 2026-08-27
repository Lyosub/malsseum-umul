// 마이페이지: 출석 체크 + 감사노트/기도제목/하루인사 기록
// auth.js의 getClient(), requireLogin()에 의존함

function todayStr() {
  var d = new Date();
  var m = String(d.getMonth() + 1).padStart(2, "0");
  var day = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + m + "-" + day;
}

function initAttendance(userId) {
  var client = getClient();
  var checkBtn = document.getElementById("checkinBtn");
  var streakNum = document.getElementById("streakNum");
  var streakMsg = document.getElementById("streakMsg");
  if (!client || !checkBtn) return;

  function refreshStreak() {
    client.from("attendance")
      .select("date")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .then(function (res) {
        var rows = res.data || [];
        var dates = rows.map(function (r) { return r.date; });
        var streak = 0;
        var cursor = new Date();
        while (true) {
          var y = cursor.getFullYear();
          var m = String(cursor.getMonth() + 1).padStart(2, "0");
          var d = String(cursor.getDate()).padStart(2, "0");
          var str = y + "-" + m + "-" + d;
          if (dates.indexOf(str) !== -1) {
            streak++;
            cursor.setDate(cursor.getDate() - 1);
          } else {
            break;
          }
        }
        if (streakNum) streakNum.textContent = streak;
        var checkedToday = dates.indexOf(todayStr()) !== -1;
        if (checkedToday) {
          checkBtn.textContent = "오늘 출석 완료 ✅";
          checkBtn.disabled = true;
        } else {
          checkBtn.textContent = "오늘 출석 체크하기";
          checkBtn.disabled = false;
        }
      });
  }

  checkBtn.addEventListener("click", function () {
    checkBtn.disabled = true;
    client.from("attendance").insert({ user_id: userId, date: todayStr() }).then(function (res) {
      if (res.error) {
        if (streakMsg) streakMsg.textContent = "이미 오늘 출석했거나 오류가 발생했어요.";
        checkBtn.disabled = false;
        return;
      }
      refreshStreak();
    });
  });

  refreshStreak();
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

var NOTE_LABELS = { greeting: "하루 인사", gratitude: "감사노트", prayer: "기도제목" };

function initNotes(userId) {
  var client = getClient();
  var form = document.getElementById("noteForm");
  var typeInput = document.getElementById("noteType");
  var typeButtons = document.querySelectorAll(".pill-toggle button");
  var list = document.getElementById("noteList");
  if (!client || !form) return;

  function loadNotes() {
    if (!list) return;
    list.innerHTML = '<p class="msg">불러오는 중...</p>';
    client.from("notes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(function (res) {
        var items = res.data || [];
        if (!items.length) {
          list.innerHTML = '<p class="msg">아직 기록이 없어요. 오늘 첫 기록을 남겨보세요.</p>';
          return;
        }
        list.innerHTML = items.map(function (item) {
          var d = new Date(item.created_at);
          var dateStr = (d.getMonth() + 1) + "." + d.getDate();
          return (
            '<div class="note-item">' +
              '<div class="meta">' + NOTE_LABELS[item.type] + " · " + dateStr + '</div>' +
              '<div class="content">' + escapeHtml(item.content) + '</div>' +
            '</div>'
          );
        }).join("");
      });
  }

  typeButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      typeButtons.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      typeInput.value = btn.getAttribute("data-type");
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var msg = document.getElementById("formMsg");
    var content = document.getElementById("contentInput").value.trim();
    if (!content) {
      msg.textContent = "내용을 입력해주세요.";
      return;
    }
    msg.textContent = "저장 중...";
    client.from("notes").insert({
      user_id: userId,
      type: typeInput.value,
      content: content
    }).then(function (res) {
      if (res.error) {
        msg.textContent = "저장에 실패했어요.";
        return;
      }
      msg.textContent = "기록되었습니다.";
      document.getElementById("contentInput").value = "";
      loadNotes();
    });
  });

  loadNotes();
}
