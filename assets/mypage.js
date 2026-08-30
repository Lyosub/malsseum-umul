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
    client.rpc("check_in_today").then(function (res) {
      if (res.error) {
        if (streakMsg) streakMsg.textContent = "오류가 발생했어요. 다시 시도해주세요.";
        checkBtn.disabled = false;
        return;
      }
      if (!res.data) {
        if (streakMsg) streakMsg.textContent = "이미 오늘 출석했어요.";
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
  var meta = session.user.user_metadata || {};
  var nickname = meta.nickname || "익명";
  var payload = { user_id: session.user.id, nickname: nickname };
  // real_name은 회원가입 때 한 번만 채우고, 기존 값을 빈 값으로 덮어쓰지 않도록 메타데이터에 있을 때만 포함한다.
  if (meta.real_name) payload.real_name = meta.real_name;
  return client.from("profiles").upsert(payload).then(function () {});
}

// 이름(본명) 확인/수정 — real_name 기능이 나오기 전에 가입한 사람은 값이 비어있을 수 있어서
// 여기서 채우거나 고칠 수 있게 한다. 닉네임은 활동명이라 그대로 유지하고 여기서는 안 바꾼다.
function initProfileSettings(session) {
  var userId = session.user.id;
  var client = getClient();
  var emailEl = document.getElementById("profileEmail");
  var nicknameInput = document.getElementById("nicknameEditInput");
  var saveNicknameBtn = document.getElementById("saveNicknameBtn");
  var nicknameMsg = document.getElementById("nicknameMsg");
  var input = document.getElementById("realNameEditInput");
  var saveBtn = document.getElementById("saveRealNameBtn");
  var msg = document.getElementById("profileMsg");
  if (!client || !input || !saveBtn) return;

  if (emailEl) emailEl.textContent = session.user.email;

  var currentNickname = "";
  client.from("profiles").select("nickname, real_name").eq("user_id", userId).single().then(function (res) {
    var p = res.data;
    if (!p) return;
    currentNickname = p.nickname;
    if (nicknameInput) nicknameInput.value = p.nickname;
    if (p.real_name) input.value = p.real_name;
  });

  if (saveNicknameBtn) {
    saveNicknameBtn.addEventListener("click", function () {
      var value = nicknameInput.value.trim();
      if (!value) {
        nicknameMsg.textContent = "닉네임을 입력해주세요.";
        return;
      }
      if (value === currentNickname) {
        nicknameMsg.textContent = "변경된 내용이 없어요.";
        return;
      }
      saveNicknameBtn.disabled = true;
      client.rpc("is_nickname_taken", { p_nickname: value }).then(function (checkRes) {
        if (!checkRes.error && checkRes.data === true) {
          nicknameMsg.textContent = "이미 사용 중인 닉네임이에요.";
          saveNicknameBtn.disabled = false;
          return;
        }
        client.from("profiles").update({ nickname: value }).eq("user_id", userId).then(function (res) {
          saveNicknameBtn.disabled = false;
          if (res.error) {
            nicknameMsg.textContent = "저장에 실패했어요.";
            return;
          }
          currentNickname = value;
          nicknameMsg.textContent = "닉네임이 변경되었습니다.";
        });
      });
    });
  }

  saveBtn.addEventListener("click", function () {
    var value = input.value.trim();
    if (!value) {
      msg.textContent = "이름을 입력해주세요.";
      return;
    }
    saveBtn.disabled = true;
    client.from("profiles").update({ real_name: value }).eq("user_id", userId).then(function (res) {
      saveBtn.disabled = false;
      if (res.error) {
        msg.textContent = "저장에 실패했어요.";
        return;
      }
      msg.textContent = "저장되었습니다.";
    });
  });
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
            '<div class="meta">' + r.total_points + '달란트 · ' + r.total_days + '일 출석</div>' +
          '</div>'
        );
      }).join("");
    });
  }

  function renderGroupMembers(groupId) {
    client.rpc("get_group_members", { p_group_id: groupId }).then(function (res) {
      var el = document.getElementById("groupMembersList");
      var countEl = document.getElementById("groupMemberCount");
      if (!el) return;
      var rows = res.data || [];
      if (res.error || !rows.length) {
        el.innerHTML = '<p class="msg">불러오지 못했어요.</p>';
        return;
      }
      if (countEl) countEl.textContent = "(" + rows.length + "명)";
      el.innerHTML = rows.map(function (r) {
        var mine = r.user_id === userId ? " (나)" : "";
        return (
          '<div class="note-item">' +
            '<div class="content">' + escapeHtml(r.nickname) + mine +
              (r.is_host ? ' <span style="color:var(--gold);font-size:12px;">만든 사람</span>' : '') +
            '</div>' +
            '<div class="meta">' + formatJoinDate(r.joined_at) + ' 참여</div>' +
          '</div>'
        );
      }).join("");
    });
  }

  function formatJoinDate(iso) {
    var d = new Date(iso);
    return d.getFullYear() + "." + String(d.getMonth() + 1).padStart(2, "0") + "." + String(d.getDate()).padStart(2, "0");
  }

  function renderTodayStatus(groupId) {
    client.rpc("get_group_today_status", { p_group_id: groupId }).then(function (res) {
      var el = document.getElementById("todayStatusList");
      if (!el) return;
      var rows = res.data || [];
      if (res.error || !rows.length) {
        el.innerHTML = '<p class="msg">불러오지 못했어요.</p>';
        return;
      }
      function badge(done, label) {
        return (
          '<span style="display:inline-block;margin:2px 8px 2px 0;font-size:12px;color:' +
          (done ? "var(--well)" : "var(--text-soft)") + ';">' +
          (done ? "✅" : "⬜") + ' ' + label + '</span>'
        );
      }
      el.innerHTML = rows.map(function (r) {
        var mine = r.user_id === userId ? " (나)" : "";
        return (
          '<div class="note-item">' +
            '<div class="content">' + escapeHtml(r.nickname) + mine + '</div>' +
            '<div class="meta" style="margin-top:4px;">' +
              badge(r.attended, "출석") +
              badge(r.wrote_greeting, "하루인사") +
              badge(r.wrote_gratitude, "감사노트") +
              badge(r.wrote_prayer, "기도제목") +
            '</div>' +
          '</div>'
        );
      }).join("");
    });
  }

  function renderChallengeBanner(groupId) {
    var el = document.getElementById("groupChallengeBanner");
    if (!el) return;
    client.rpc("get_group_bonus_eligible", { p_group_id: groupId }).then(function (res) {
      var eligible = !!(res.data);
      el.innerHTML = eligible
        ? "🎯 오이코스 챌린지: 한 주(월~일) 동안 오이코스 멤버의 80% 이상 출석하면 전원 +1달란트, 전원이 감사노트/기도제목을 1개 이상씩 쓰고 오이코스 합계가 10개 이상이면 전원 +2달란트 (다음 주에 자동 정산돼요)"
        : "이 오이코스는 학생들끼리 만든 오이코스라 챌린지 보너스가 적용되지 않아요. 교사가 만든 오이코스만 보너스 대상이에요.";
    });
  }

  // 오이코스를 만든 사람이 교사(또는 교역자)일 때만 "학생 초대하기" 검색창을 보여준다.
  // 검색 결과에는 본명도 함께 보여준다(닉네임(본명) 형태) — 교사가 자기 반 학생을 정확히 찾아
  // 초대할 수 있게 하려는 예외적 노출이며, 다른 화면에서는 여전히 교역자만 본명을 볼 수 있다.
  function initGroupInvite(groupId, isCreator) {
    var section = document.getElementById("groupInviteSection");
    var input = document.getElementById("inviteSearchInput");
    var resultsEl = document.getElementById("inviteSearchResults");
    if (!section || !input || !resultsEl) return;

    section.style.display = "none";
    if (!isCreator) return;

    client.from("profiles").select("is_teacher, is_admin").eq("user_id", userId).single().then(function (res) {
      var p = res.data;
      if (!p || (!p.is_teacher && !p.is_admin)) return;
      section.style.display = "block";
    });

    var searchTimer = null;
    input.oninput = function () {
      clearTimeout(searchTimer);
      var q = input.value.trim();
      if (!q) {
        resultsEl.innerHTML = "";
        return;
      }
      searchTimer = setTimeout(function () {
        client.rpc("search_users_for_invite", { p_query: q, p_group_id: groupId }).then(function (res) {
          var rows = res.data || [];
          if (res.error) {
            resultsEl.innerHTML = '<p class="msg">검색에 실패했어요.</p>';
            return;
          }
          if (!rows.length) {
            resultsEl.innerHTML = '<p class="msg">검색 결과가 없어요.</p>';
            return;
          }
          resultsEl.innerHTML = rows.map(function (r) {
            var label = escapeHtml(r.nickname) + (r.real_name ? "(" + escapeHtml(r.real_name) + ")" : "");
            return (
              '<div class="note-item" data-invite-user="' + r.user_id + '">' +
                '<div class="content">' + label + '</div>' +
                '<button type="button" class="btn ghost" data-action="invite" style="margin-top:6px;padding:6px 14px;font-size:12.5px;">초대</button>' +
              '</div>'
            );
          }).join("");
          resultsEl.querySelectorAll('button[data-action="invite"]').forEach(function (btn) {
            btn.addEventListener("click", function () {
              var targetUserId = btn.closest("[data-invite-user]").getAttribute("data-invite-user");
              btn.disabled = true;
              btn.textContent = "초대 중...";
              client.rpc("invite_user_to_group", { p_group_id: groupId, p_user_id: targetUserId }).then(function (res2) {
                if (res2.error) {
                  btn.disabled = false;
                  btn.textContent = "초대";
                  alert("초대에 실패했어요.");
                  return;
                }
                btn.textContent = "✅ 초대됨";
                renderGroupMembers(groupId);
                renderLeaderboard(groupId);
                renderTodayStatus(groupId);
              });
            });
          });
        });
      }, 300);
    };
  }

  function showGroup(group, justJoined) {
    noGroupEl.style.display = "none";
    hasGroupEl.style.display = "block";
    document.getElementById("groupName").textContent = group.name;
    document.getElementById("groupCode").textContent = group.invite_code;
    renderChallengeBanner(group.id);
    renderGroupMembers(group.id);
    initGroupInvite(group.id, group.created_by === userId);

    var flashEl = document.getElementById("groupJoinedFlash");
    if (flashEl) {
      if (justJoined) {
        flashEl.textContent = "🎉 \"" + group.name + "\" 오이코스에 참여했어요!";
        flashEl.style.display = "block";
        // 애니메이션을 다시 재생하려면 엘리먼트를 강제로 리플로우해서 재시작해야 한다
        flashEl.style.animation = "none";
        void flashEl.offsetWidth;
        flashEl.style.animation = "";
        hasGroupEl.scrollIntoView({ behavior: "smooth", block: "start" });
        setTimeout(function () { flashEl.style.display = "none"; }, 3200);
      } else {
        flashEl.style.display = "none";
      }
    }
    // 지난주(월~일) 오이코스 챌린지 조건을 확인해서 아직 정산 안 됐으면 오이코스 전원에게 보너스 포인트를 지급한다
    // (교사가 만든 오이코스가 아니면 evaluate_group_weekly_bonus 내부에서 조용히 아무것도 하지 않는다)
    client.rpc("evaluate_group_weekly_bonus", { p_group_id: group.id }).catch(function () {}).then(function () {
      renderLeaderboard(group.id);
      renderTodayStatus(group.id);
    });

    // 버튼은 누구에게나 보여주고, 실제 "만든 사람 본인이거나 교역자인지"는 서버(delete_group)가 확인한다.
    // (클라이언트에서 미리 판단해서 숨기는 방식은 세션/타이밍에 따라 오작동할 수 있어 서버 확인으로 통일)
    var disbandBtn = document.getElementById("disbandGroupBtn");
    var disbandMsg = document.getElementById("disbandGroupMsg");
    if (disbandBtn) {
      disbandBtn.style.display = "inline-block";
      disbandBtn.disabled = false;
      if (disbandMsg) disbandMsg.textContent = "";
      disbandBtn.onclick = function () {
        if (!confirm("정말 이 오이코스를 해체할까요? 멤버 전원의 참여 정보가 함께 사라지고 되돌릴 수 없어요.")) return;
        disbandBtn.disabled = true;
        client.rpc("delete_group", { p_group_id: group.id }).then(function (res) {
          if (res.error) {
            if (disbandMsg) disbandMsg.textContent = "이 오이코스를 만든 사람이거나 교역자만 해체할 수 있어요.";
            disbandBtn.disabled = false;
            return;
          }
          loadMyGroup();
        });
      };
    }
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
        msg.textContent = "오이코스 이름을 입력해주세요.";
        return;
      }
      msg.textContent = "생성 중...";
      client.rpc("create_group", { p_name: name }).then(function (res) {
        if (res.error || !res.data || !res.data.length) {
          msg.textContent = "오이코스 생성에 실패했어요.";
          return;
        }
        msg.textContent = "";
        var row = res.data[0];
        showGroup({ id: row.group_id, name: row.group_name, invite_code: row.invite_code, created_by: userId });
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
        showGroup({ id: res.data[0].group_id, name: res.data[0].group_name, invite_code: code }, true);
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
