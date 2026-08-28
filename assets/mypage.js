// 마이페이지: 출석 체크 + 감사노트/기도제목/하루인사 기록
// auth.js의 getClient(), requireLogin()에 의존함

function todayStr() {
  var d = new Date();
  var m = String(d.getMonth() + 1).padStart(2, "0");
  var day = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + m + "-" + day;
}

function loadTotalPoints(userId) {
  var client = getClient();
  var pointsNum = document.getElementById("pointsNum");
  if (!client || !pointsNum) return;
  client.from("points_ledger").select("points").eq("user_id", userId).then(function (res) {
    var rows = res.data || [];
    var total = rows.reduce(function (sum, r) { return sum + r.points; }, 0);
    pointsNum.textContent = total;
  });
}

function initAttendance(userId) {
  var client = getClient();
  var checkBtn = document.getElementById("checkinBtn");
  var streakNum = document.getElementById("streakNum");
  var streakMsg = document.getElementById("streakMsg");
  if (!client || !checkBtn) return;

  loadTotalPoints(userId);

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
      loadTotalPoints(userId);
    });
  });

  refreshStreak();
}

function ensureProfile(session) {
  var client = getClient();
  if (!client) return Promise.resolve();
  var nickname = (session.user.user_metadata && session.user.user_metadata.nickname) || "익명";
  return client.from("profiles").upsert({ user_id: session.user.id, nickname: nickname }).then(function () {});
}

// 초대 코드는 create_group RPC(schema.sql)가 서버에서 생성함 — 클라이언트에서는 만들지 않음

function initGroup(userId) {
  var client = getClient();
  var section = document.getElementById("groupSection");
  if (!client || !section) return;

  var noGroupEl = document.getElementById("groupNone");
  var hasGroupEl = document.getElementById("groupHas");

  function renderLeaderboard(groupId) {
    client.rpc("get_group_leaderboard", { p_group_id: groupId }).then(function (res) {
      var list = document.getElementById("leaderboardList");
      if (!list) return;
      var rows = res.data || [];
      if (res.error || !rows.length) {
        list.innerHTML = '<p class="msg">아직 출석 기록이 없어요.</p>';
        return;
      }
      list.innerHTML = rows.map(function (r, i) {
        var mine = r.user_id === userId ? " (나)" : "";
        return (
          '<div class="note-item">' +
            '<div class="content">' + (i + 1) + '위 · ' + escapeHtml(r.nickname) + mine + '</div>' +
            '<div class="meta">' + r.total_points + '점 · ' + r.total_days + '일 출석</div>' +
          '</div>'
        );
      }).join("");
    });
  }

  function showGroup(group) {
    noGroupEl.style.display = "none";
    hasGroupEl.style.display = "block";
    document.getElementById("groupName").textContent = group.name;
    document.getElementById("groupCode").textContent = group.invite_code;
    // 지난주(월~일) 그룹 챌린지 조건을 확인해서 아직 정산 안 됐으면 그룹 전원에게 보너스 포인트를 지급한다
    client.rpc("evaluate_group_weekly_bonus", { p_group_id: group.id }).catch(function () {}).then(function () {
      renderLeaderboard(group.id);
    });
  }

  function loadMyGroup() {
    client.from("group_members")
      .select("group_id")
      .eq("user_id", userId)
      .limit(1)
      .then(function (res) {
        var rows = res.data || [];
        if (!rows.length) {
          noGroupEl.style.display = "block";
          hasGroupEl.style.display = "none";
          return;
        }
        client.from("groups").select("*").eq("id", rows[0].group_id).single().then(function (gRes) {
          if (gRes.data) showGroup(gRes.data);
        });
      });
  }

  var createForm = document.getElementById("createGroupForm");
  if (createForm) {
    createForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = document.getElementById("groupMsg");
      var name = document.getElementById("groupNameInput").value.trim();
      if (!name) {
        msg.textContent = "그룹 이름을 입력해주세요.";
        return;
      }
      msg.textContent = "생성 중...";
      client.rpc("create_group", { p_name: name }).then(function (res) {
        if (res.error || !res.data || !res.data.length) {
          msg.textContent = "그룹 생성에 실패했어요.";
          return;
        }
        msg.textContent = "";
        var row = res.data[0];
        showGroup({ id: row.group_id, name: row.group_name, invite_code: row.invite_code });
      });
    });
  }

  var joinForm = document.getElementById("joinGroupForm");
  if (joinForm) {
    joinForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = document.getElementById("groupMsg");
      var code = document.getElementById("joinCodeInput").value.trim().toUpperCase();
      if (!code) {
        msg.textContent = "초대 코드를 입력해주세요.";
        return;
      }
      msg.textContent = "참여 중...";
      client.rpc("join_group_by_code", { p_code: code }).then(function (res) {
        if (res.error || !res.data || !res.data.length) {
          msg.textContent = "초대 코드를 찾을 수 없어요.";
          return;
        }
        msg.textContent = "";
        showGroup({ id: res.data[0].group_id, name: res.data[0].group_name, invite_code: code });
      });
    });
  }

  loadMyGroup();
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

var NOTE_LABELS = { greeting: "하루 인사", gratitude: "감사노트", prayer: "기도제목" };
var NOTE_LIST_IDS = { greeting: "noteListGreeting", gratitude: "noteListGratitude", prayer: "noteListPrayer" };

function initNotes(userId) {
  var client = getClient();
  var forms = document.querySelectorAll(".note-form");
  if (!client || !forms.length) return;

  var noteItemsById = {};

  function renderNoteItem(item) {
    noteItemsById[item.id] = item;
    var d = new Date(item.created_at);
    var dateStr = (d.getMonth() + 1) + "." + d.getDate();
    return (
      '<div class="note-item" data-note-id="' + item.id + '">' +
        '<div class="meta">' + dateStr + '</div>' +
        '<div data-role="body">' +
          '<div class="content">' + escapeHtml(item.content) + '</div>' +
          '<div style="margin-top:8px;display:flex;gap:8px;">' +
            '<button type="button" class="btn ghost" data-action="edit" style="padding:6px 14px;font-size:12.5px;">수정</button>' +
            '<button type="button" class="btn ghost" data-action="delete" style="padding:6px 14px;font-size:12.5px;">삭제</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function handleListClick(e) {
    var btn = e.target.closest("button[data-action]");
    if (!btn) return;
    var itemEl = btn.closest(".note-item");
    if (!itemEl) return;
    var noteId = itemEl.getAttribute("data-note-id");
    var item = noteItemsById[noteId];
    var action = btn.getAttribute("data-action");
    var bodyEl = itemEl.querySelector('[data-role="body"]');

    if (action === "delete") {
      if (!confirm("이 기록을 삭제할까요?")) return;
      client.from("notes").delete().eq("id", noteId).then(function () { loadNotes(); });
      return;
    }

    if (action === "edit") {
      bodyEl.innerHTML =
        '<textarea data-role="edit-input" style="margin-bottom:8px;">' + escapeHtml(item.content) + '</textarea>' +
        '<div style="display:flex;gap:8px;">' +
          '<button type="button" class="btn" data-action="save" style="padding:6px 14px;font-size:12.5px;">저장</button>' +
          '<button type="button" class="btn ghost" data-action="cancel" style="padding:6px 14px;font-size:12.5px;">취소</button>' +
        '</div>';
      return;
    }

    if (action === "cancel") {
      loadNotes();
      return;
    }

    if (action === "save") {
      var textarea = itemEl.querySelector('[data-role="edit-input"]');
      var newContent = textarea.value.trim();
      if (!newContent) return;
      client.from("notes").update({ content: newContent }).eq("id", noteId).then(function () { loadNotes(); });
    }
  }

  Object.keys(NOTE_LIST_IDS).forEach(function (type) {
    var el = document.getElementById(NOTE_LIST_IDS[type]);
    if (el) el.addEventListener("click", handleListClick);
  });

  function loadNotes() {
    Object.keys(NOTE_LIST_IDS).forEach(function (type) {
      var el = document.getElementById(NOTE_LIST_IDS[type]);
      if (el) el.innerHTML = '<p class="msg">불러오는 중...</p>';
    });
    client.from("notes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(150)
      .then(function (res) {
        var items = res.data || [];
        noteItemsById = {};
        var grouped = { greeting: [], gratitude: [], prayer: [] };
        items.forEach(function (item) {
          if (grouped[item.type]) grouped[item.type].push(item);
        });
        Object.keys(NOTE_LIST_IDS).forEach(function (type) {
          var el = document.getElementById(NOTE_LIST_IDS[type]);
          if (!el) return;
          var rows = grouped[type];
          el.innerHTML = rows.length
            ? rows.map(renderNoteItem).join("")
            : '<p class="msg">아직 기록이 없어요.</p>';
        });
      });
  }

  forms.forEach(function (form) {
    var type = form.getAttribute("data-type");
    var textarea = form.querySelector("textarea");
    var msg = form.querySelector(".msg");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var content = textarea.value.trim();
      if (!content) {
        msg.textContent = "내용을 입력해주세요.";
        return;
      }
      msg.textContent = "저장 중...";
      client.from("notes").insert({
        user_id: userId,
        type: type,
        content: content
      }).then(function (res) {
        if (res.error) {
          msg.textContent = "저장에 실패했어요.";
          return;
        }
        msg.textContent = "기록되었습니다.";
        textarea.value = "";
        loadNotes();
        loadTotalPoints(userId);
      });
    });
  });

  loadNotes();
}
