// 마이페이지: 출석 체크 + 감사노트/기도제목/하루인사 기록
// auth.js의 getClient(), requireLogin()에 의존함

// "지난 기록"의 각 항목(하루인사/감사노트/기도제목/건의사항)을 아코디언으로 접어둔다.
// admin.js의 initAccordions()와 같은 방식(.accordion-toggle/.accordion-body)인데,
// admin.js는 마이페이지에서 로드하지 않으므로 여기 따로 둔다.
function initAccordions() {
  document.querySelectorAll(".accordion-toggle").forEach(function (toggle) {
    var body = toggle.nextElementSibling;
    if (!body || !body.classList.contains("accordion-body")) return;
    toggle.addEventListener("click", function () {
      var isOpen = body.style.display === "block";
      body.style.display = isOpen ? "none" : "block";
      toggle.classList.toggle("open", !isOpen);
    });
  });
}

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
  // 쓸 수 있는 달란트 잔액(적립합계 - 상점 교환분). 상점 마이그레이션 전이면 적립합계로 폴백.
  client.rpc("get_talent_balance").then(function (res) {
    if (!res.error && res.data != null) { pointsNum.textContent = res.data; return; }
    client.from("points_ledger").select("points").eq("user_id", userId).then(function (r2) {
      var rows = r2.data || [];
      pointsNum.textContent = rows.reduce(function (s, x) { return s + x.points; }, 0);
    });
  }).catch(function () {
    client.from("points_ledger").select("points").eq("user_id", userId).then(function (r2) {
      var rows = r2.data || [];
      pointsNum.textContent = rows.reduce(function (s, x) { return s + x.points; }, 0);
    });
  });
}

// 본인 달란트가 어디서 얼마나 쌓였는지 마이페이지에서 직접 확인할 수 있게 하는 내역 리스트.
// admin.js의 ADMIN_ACTION_LABELS와 같은 action_type을 쓰지만, 여기는 학생 본인 화면이라 문구를
// 조금 더 부드럽게(예: "교역자·부장이 부여") 다듬어서 별도로 둔다.
var POINTS_ACTION_LABELS = {
  attendance: "출석",
  streak_bonus: "7일 연속출석 보너스",
  note: "감사노트/기도제목 작성",
  quiz: "성경퀴즈 정답",
  group_attendance_bonus: "오이코스 출석 챌린지",
  group_notes_bonus: "오이코스 기록 챌린지",
  admin_award: "교역자·부장이 부여",
  greeting_draw: "하루인사 달란트 뽑기",
  badge_award: "뱃지 등급 달성 보상"
};

function formatPointsRefDate(dateStr) {
  if (!dateStr) return "";
  var parts = dateStr.split("-");
  return parts.length === 3 ? parts[0] + "." + parts[1] + "." + parts[2] : dateStr;
}

function initPointsRulesToggle() {
  var toggle = document.getElementById("pointsRulesToggle");
  var detail = document.getElementById("pointsRulesDetail");
  var arrow = document.getElementById("pointsRulesArrow");
  if (!toggle || !detail) return;
  toggle.addEventListener("click", function () {
    var isOpen = detail.style.display !== "none";
    detail.style.display = isOpen ? "none" : "block";
    if (arrow) arrow.textContent = isOpen ? "자세히 ▾" : "접기 ▴";
  });
}

function initPointsHistory(userId) {
  var client = getClient();
  var section = document.getElementById("pointsHistorySection");
  var toggleBtn = document.getElementById("pointsHistoryToggleBtn");
  if (!client || !section) return;

  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      var isOpen = section.style.display !== "none";
      section.style.display = isOpen ? "none" : "block";
      toggleBtn.textContent = isOpen ? "📋 달란트 내역 보기" : "📋 달란트 내역 닫기";
    });
  }

  client.rpc("get_my_points").then(function (res) {
    var rows = res.data || [];
    if (res.error) {
      section.innerHTML = '<p class="msg">불러오지 못했어요.</p>';
      return;
    }
    if (!rows.length) {
      section.innerHTML = '<p class="msg">아직 달란트 내역이 없어요.</p>';
      return;
    }
    section.innerHTML = rows.map(function (r) {
      var label = POINTS_ACTION_LABELS[r.action_type] || r.action_type;
      var sign = r.points > 0 ? "+" : "";
      var color = r.points > 0 ? "var(--well)" : "#b3432c";
      return (
        '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px;">' +
          '<div>' +
            '<div>' + escapeHtml(label) + (r.note ? ' <span style="color:var(--text-soft);">· ' + escapeHtml(r.note) + '</span>' : '') + '</div>' +
            '<div style="color:var(--text-soft);font-size:11.5px;margin-top:2px;">' + formatPointsRefDate(r.ref_date) + '</div>' +
          '</div>' +
          '<div style="font-weight:700;color:' + color + ';white-space:nowrap;">' + sign + r.points + '</div>' +
        '</div>'
      );
    }).join("");
  }).catch(function () {
    section.innerHTML = '<p class="msg">불러오지 못했어요.</p>';
  });
}

// 연속 출석 "다음 목표까지 며칠" 안내. 7 → 14 → 30 → 그 다음은 30일 단위.
function renderStreakMilestone(streak) {
  var el = document.getElementById("streakMilestone");
  if (!el) return;
  if (!streak || streak < 1) {
    el.textContent = "오늘 출석하면 연속 출석이 시작돼요!";
    return;
  }
  var milestones = [7, 14, 30];
  var next = null;
  for (var i = 0; i < milestones.length; i++) {
    if (streak < milestones[i]) { next = milestones[i]; break; }
  }
  if (next === null) next = Math.ceil((streak + 1) / 30) * 30;

  if (streak === 7 || streak === 14 || streak === 30 || (streak > 30 && streak % 30 === 0)) {
    el.textContent = "🎉 " + streak + "일 연속 출석 달성! 대단해요";
  } else if (streak % 7 === 0) {
    el.textContent = "🔥 " + streak + "일 연속! (7일마다 +1달란트)";
  } else {
    el.textContent = "🔥 " + streak + "일째 · 다음 목표 " + next + "일까지 " + (next - streak) + "일 남았어요";
  }
}

// 동 / 은 / 금 / 다이아 / 십자가
var BADGE_TIER_COLORS = { 1: "#c9932f", 2: "#9aa4ad", 3: "#e0b23a", 4: "#3fbecf", 5: "#8b5cf6" };

function initBadges(userId) {
  var client = getClient();
  var card = document.getElementById("badgesCard");
  var grid = document.getElementById("badgesGrid");
  if (!client || !card || !grid) return;

  // 새로 달성한 등급의 달란트 보상부터 정산(멱등 — 이미 준 건 다시 안 줌). 실패해도 뱃지 표시는 계속.
  var claimP = client.rpc("claim_badge_rewards").then(function (cr) {
    return (!cr.error && cr.data) ? cr.data : 0;
  }).catch(function () { return 0; });

  claimP.then(function (gained) {
    if (gained > 0) {
      var rw = document.getElementById("badgesReward");
      if (rw) { rw.textContent = "🎁 새 뱃지 보상 +" + gained + "달란트!"; rw.style.display = "block"; }
      loadTotalPoints(userId);
    }
    return client.rpc("get_my_badges");
  }).then(function (res) {
    if (res.error || !res.data || !res.data.length) {
      card.style.display = "none";
      return;
    }
    card.style.display = "block";
    var rows = res.data.slice().sort(function (a, b) { return (b.tier - a.tier); });
    var earned = rows.filter(function (r) { return r.tier > 0; }).length;

    var sub = document.getElementById("badgesSub");
    if (sub) sub.textContent = earned > 0 ? (rows.length + "개 중 " + earned + "개 획득") : "아직 획득한 뱃지가 없어요 — 조금만 더!";

    grid.innerHTML = rows.map(function (r) {
      var got = r.tier > 0;
      var tierLabel = got ? (r.tier_label + " · " + r.current_value) : (r.current_value + " / " + r.next_target);
      var ring = got ? BADGE_TIER_COLORS[r.tier] : "var(--border)";
      return (
        '<div class="badge-item' + (got ? " got" : "") + '" style="border-color:' + ring + ';">' +
          '<div class="badge-emoji">' + r.emoji + '</div>' +
          '<div class="badge-name">' + escapeHtml(r.label) + '</div>' +
          '<div class="badge-tier">' + escapeHtml(tierLabel) + '</div>' +
        '</div>'
      );
    }).join("");
  }).catch(function () {
    card.style.display = "none";
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
        renderStreakMilestone(streak);
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
  var userId = session.user.id;
  // 프로필 행이 이미 있으면 아무것도 건드리지 않는다. 예전에는 매번 upsert로 회원가입 때의
  // user_metadata.nickname을 다시 써넣었는데, 그러면 마이페이지에서 닉네임을 바꾼 뒤 페이지를
  // 나갔다 들어올 때마다 이 함수가 또 실행되면서 방금 바꾼 닉네임을 가입 당시 이름으로 도로
  // 덮어써버리는 버그가 있었다(2026-09-01 발견). 프로필이 아직 없는 최초 1회에만 만든다.
  return client.from("profiles").select("user_id").eq("user_id", userId).maybeSingle().then(function (res) {
    if (res.data) return;
    var meta = session.user.user_metadata || {};
    var payload = { user_id: userId, nickname: meta.nickname || "익명" };
    if (meta.real_name) payload.real_name = meta.real_name;
    if (meta.phone_number) payload.phone_number = meta.phone_number;
    return client.from("profiles").insert(payload).then(function () {});
  });
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
  var realNameEl = document.getElementById("profileRealName");
  var phoneInput = document.getElementById("phoneEditInput");
  var savePhoneBtn = document.getElementById("savePhoneBtn");
  var phoneMsg = document.getElementById("phoneMsg");
  if (!client || !nicknameInput) return;

  if (emailEl) emailEl.textContent = session.user.email;

  var currentNickname = "";
  // 이름(본명)은 이제 본인이 직접 못 고치고 교역자만 회원 관리에서 수정할 수 있어서, 여기서는 조회만 한다.
  // 전화번호는 신분증명 급으로 민감한 정보가 아니라서(닉네임처럼) 본인이 직접 고칠 수 있게 한다.
  // select("*")를 쓰는 이유: 특정 컬럼명을 콕 집어 select하면 그 컬럼이 아직 DB에 없을 때(마이그레이션
  // 반영 전 등) 조회 전체가 통째로 에러나서 닉네임/관리자 링크까지 같이 안 뜨는 사고가 났었다(2026-09-01).
  // *를 쓰면 없는 컬럼은 그냥 결과에 없을 뿐, 있는 컬럼은 정상적으로 다 받아온다.
  client.from("profiles").select("*").eq("user_id", userId).single().then(function (res) {
    var p = res.data;
    if (!p) return;
    currentNickname = p.nickname;
    if (nicknameInput) nicknameInput.value = p.nickname;
    if (realNameEl) realNameEl.textContent = p.real_name || "아직 등록되지 않았어요";
    if (phoneInput) phoneInput.value = p.phone_number || "";
    var adminLink = document.getElementById("adminPageLink");
    if (adminLink && (p.is_admin || p.is_department_head)) adminLink.style.display = "block";
  });

  if (savePhoneBtn) {
    savePhoneBtn.addEventListener("click", function () {
      var value = phoneInput.value.trim();
      var digits = value.replace(/[^0-9]/g, "");
      if (!value) {
        phoneMsg.textContent = "전화번호를 입력해주세요.";
        return;
      }
      if (digits.length < 9) {
        phoneMsg.textContent = "전화번호를 정확히 입력해주세요.";
        return;
      }
      savePhoneBtn.disabled = true;
      client.from("profiles").update({ phone_number: value }).eq("user_id", userId).then(function (res) {
        savePhoneBtn.disabled = false;
        if (res.error) {
          phoneMsg.textContent = "저장에 실패했어요.";
          return;
        }
        phoneMsg.textContent = "전화번호가 저장되었습니다.";
      });
    });
  }

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

  // 오이코스 멤버 명단 + 각자 오늘의 참여 현황을 한 곳에 합쳐서 보여준다.
  function renderGroupMembers(groupId) {
    var el = document.getElementById("groupMembersList");
    var countEl = document.getElementById("groupMemberCount");
    if (!el) return;
    Promise.all([
      client.rpc("get_group_members", { p_group_id: groupId }),
      client.rpc("get_group_today_status", { p_group_id: groupId })
    ]).then(function (res) {
      var members = (res[0] && res[0].data) || [];
      if ((res[0] && res[0].error) || !members.length) {
        el.innerHTML = '<p class="msg">불러오지 못했어요.</p>';
        return;
      }
      var status = {};
      ((res[1] && res[1].data) || []).forEach(function (s) { status[s.user_id] = s; });
      if (countEl) countEl.textContent = "(" + members.length + "명)";

      function badge(done, label) {
        return '<span style="display:inline-block;margin:2px 8px 2px 0;font-size:11.5px;color:' +
          (done ? "var(--well)" : "var(--text-soft)") + ';">' + (done ? "✅" : "⬜") + " " + label + '</span>';
      }
      el.innerHTML = members.map(function (r) {
        var s = status[r.user_id] || {};
        var mine = r.user_id === userId ? " (나)" : "";
        return (
          '<div class="note-item">' +
            '<div class="content">' + escapeHtml(r.nickname) + mine +
              (r.is_host ? ' <span style="color:var(--gold);font-size:12px;">만든 사람</span>' : '') +
              ' <span style="color:var(--text-soft);font-size:11.5px;font-weight:400;">' + formatJoinDate(r.joined_at) + ' 참여</span>' +
            '</div>' +
            '<div class="meta" style="margin-top:4px;">' +
              badge(s.attended, "출석") +
              badge(s.wrote_greeting, "하루인사") +
              badge(s.wrote_gratitude, "감사노트") +
              badge(s.wrote_prayer, "기도제목") +
            '</div>' +
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
        ? "🎯 오이코스 챌린지: 한 주(월~일) 동안 오이코스 멤버의 80% 이상 출석하면 <strong>오이코스 곳간 +인원수</strong>, 전원이 감사노트/기도제목을 1개 이상씩 쓰고 오이코스 합계가 10개 이상이면 <strong>오이코스 곳간 +인원수×2</strong> (다음 주에 자동 정산돼요. 개인 달란트가 아니라 오이코스 공동 곳간에 쌓여요)"
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
              });
            });
          });
        });
      }, 300);
    };
  }

  var OIKOS_EXP_STATUS = {
    pending:  "확인 중",
    approved: "승인됨",
    paid:     "지급 완료",
    rejected: "거절됨"
  };

  var OIKOS_LOG_LABEL = {
    donation: "기부", challenge_attendance: "출석 챌린지", challenge_notes: "기록 챌린지",
    expense: "회식비", expense_refund: "회식비 환급", admin_adjust: "조정"
  };

  // 오이코스 공동 달란트(풀) 카드 — 모든 오이코스원에게 보인다. 개인 달란트를 풀에 기부하고,
  // 풀 잔액 + 최근 내역(기부/챌린지/회식비)을 보여준다.
  function initOikosTalent(groupId) {
    var section = document.getElementById("oikosTalentSection");
    if (!section) return;
    var infoEl = document.getElementById("oikosPoolInfo");
    var logEl = document.getElementById("oikosTalentLog");
    var form = document.getElementById("oikosDonateForm");
    var amountEl = document.getElementById("oikosDonateAmount");
    var msgEl = document.getElementById("oikosDonateMsg");

    function load() {
      client.rpc("get_oikos_talent", { p_group_id: groupId }).then(function (r) {
        var d = (r.data && r.data[0]) || {};
        var pool = (d.pool != null ? d.pool : d.earned) || 0;
        if (infoEl) {
          infoEl.innerHTML =
            "우리 오이코스 곳간 <strong>" + pool + "</strong>" +
            " <span style=\"color:var(--text-soft);\">(기부 " + (d.from_donation || 0) +
            " · 챌린지 " + (d.from_challenge || 0) + " · 사용 가능 " + (d.available || 0) + ")</span>";
        }
      });
      client.rpc("get_oikos_talent_log", { p_group_id: groupId, p_limit: 20 }).then(function (r) {
        var rows = r.data || [];
        if (!logEl) return;
        if (!rows.length) { logEl.innerHTML = '<p class="msg" style="margin:0;">아직 내역이 없어요.</p>'; return; }
        logEl.innerHTML = rows.map(function (x) {
          var dt = new Date(x.created_at);
          var when = (dt.getMonth() + 1) + "/" + dt.getDate();
          var who = x.kind === "donation" ? (escapeHtml(x.member_nickname || "누군가") + " · ") : "";
          var sign = x.points > 0 ? "+" : "";
          var color = x.points > 0 ? "var(--well)" : "var(--gold)";
          return (
            '<div class="note-item" style="padding:8px 0;">' +
              '<div class="meta" style="margin:0;">' + when + ' · ' + who + (OIKOS_LOG_LABEL[x.kind] || x.kind) + '</div>' +
              '<div class="content" style="font-size:13.5px;color:' + color + ';font-weight:700;">' + sign + x.points + '달란트</div>' +
            '</div>'
          );
        }).join("");
      });
    }

    if (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        var amount = parseInt(amountEl && amountEl.value, 10);
        if (msgEl) { msgEl.style.color = ""; msgEl.textContent = ""; }
        if (!amount || amount < 10) { if (msgEl) msgEl.textContent = "최소 10달란트부터 기부할 수 있어요."; return; }
        if (!confirm(amount + "달란트를 우리 오이코스에 기부할까요? 되돌릴 수 없어요.")) return;
        var btn = form.querySelector("button[type=submit]");
        if (btn) btn.disabled = true;
        client.rpc("donate_to_oikos", { p_group_id: groupId, p_amount: amount }).then(function (r) {
          if (btn) btn.disabled = false;
          if (r.error) { if (msgEl) msgEl.textContent = r.error.message || "기부에 실패했어요."; return; }
          if (amountEl) amountEl.value = "";
          if (msgEl) { msgEl.style.color = "var(--well)"; msgEl.textContent = "기부 완료! 고마워요 🙏"; }
          load();
          loadTotalPoints(userId); // 헤더의 내 달란트 잔액 갱신
          var teacherInfo = document.getElementById("oikosTalentInfo");
          if (teacherInfo) { // 교사 회식비 칸도 함께 갱신
            client.rpc("get_oikos_talent", { p_group_id: groupId }).then(function (rr) {
              var dd = (rr.data && rr.data[0]) || {};
              var pp = (dd.pool != null ? dd.pool : dd.earned) || 0;
              teacherInfo.innerHTML =
                "오이코스 곳간 <strong>" + pp + "</strong><br>· 기부 " + (dd.from_donation || 0) +
                " · 챌린지 " + (dd.from_challenge || 0) + "<br>신청 대기 " + (dd.pending || 0) +
                " · 사용 가능 " + (dd.available || 0);
            });
          }
        });
      };
    }

    load();
  }

  function initOikosExpense(groupId) {
    var section = document.getElementById("oikosExpenseSection");
    if (!section) return;
    section.style.display = "none";

    client.from("profiles").select("is_teacher").eq("user_id", userId).single().then(function (res) {
      if (!res.data || !res.data.is_teacher) return;
      section.style.display = "block";

      var infoEl = document.getElementById("oikosTalentInfo");
      var listEl = document.getElementById("oikosExpenseList");
      var form = document.getElementById("oikosExpenseForm");
      var amountEl = document.getElementById("oikosExpenseAmount");
      var purposeEl = document.getElementById("oikosExpensePurpose");
      var msgEl = document.getElementById("oikosExpenseMsg");

      function loadInfo() {
        client.rpc("get_oikos_talent", { p_group_id: groupId }).then(function (r) {
          var d = (r.data && r.data[0]) || {};
          if (!infoEl) return;
          var pool = (d.pool != null ? d.pool : d.earned) || 0;
          infoEl.innerHTML =
            "오이코스 곳간 <strong>" + pool + "</strong>" +
            "<br>· 기부 " + (d.from_donation || 0) + " · 챌린지 " + (d.from_challenge || 0) +
            "<br>신청 대기 " + (d.pending || 0) + " · 사용 가능 " + (d.available || 0);
        });
      }
      function loadList() {
        client.rpc("get_oikos_expenses", { p_group_id: groupId }).then(function (r) {
          var rows = r.data || [];
          if (!listEl) return;
          if (!rows.length) { listEl.innerHTML = '<p class="msg" style="margin:0;">아직 신청 내역이 없어요.</p>'; return; }
          listEl.innerHTML = rows.map(function (x) {
            var d = new Date(x.created_at);
            return (
              '<div class="note-item">' +
                '<div class="meta">' + (d.getMonth() + 1) + '.' + d.getDate() + ' · ' + escapeHtml(x.requester_nickname || "") +
                  ' · <strong>' + (OIKOS_EXP_STATUS[x.status] || x.status) + '</strong></div>' +
                '<div class="content">' + x.amount + '달란트 · ' + escapeHtml(x.purpose) + '</div>' +
                (x.admin_note ? '<div class="meta" style="margin-top:2px;">교역자: ' + escapeHtml(x.admin_note) + '</div>' : '') +
              '</div>'
            );
          }).join("");
        });
      }
      loadInfo();
      loadList();

      if (form) {
        form.onsubmit = function (e) {
          e.preventDefault();
          var amount = parseInt(amountEl.value, 10);
          var purpose = (purposeEl.value || "").trim();
          if (!amount || amount < 300) { msgEl.textContent = "회식비는 최소 300달란트부터 신청할 수 있어요."; return; }
          if (!purpose) { msgEl.textContent = "사용 목적을 적어주세요."; return; }
          msgEl.textContent = "신청 중...";
          client.rpc("request_oikos_expense", { p_group_id: groupId, p_amount: amount, p_purpose: purpose }).then(function (r) {
            if (r.error) { msgEl.textContent = r.error.message || "신청에 실패했어요."; return; }
            msgEl.textContent = "신청했어요. 교역자 확인을 기다려 주세요.";
            amountEl.value = ""; purposeEl.value = "";
            loadInfo(); loadList();
          }).catch(function () { msgEl.textContent = "신청에 실패했어요."; });
        };
      }

      // --- 오이코스 상품 교환 ---
      var shopListEl = document.getElementById("oikosShopList");
      var shopMsgEl = document.getElementById("oikosShopMsg");
      function loadShop() {
        if (!shopListEl) return;
        client.rpc("get_oikos_shop_items").then(function (r) {
          var items = r.data || [];
          if (!items.length) { shopListEl.innerHTML = '<p class="msg" style="margin:0;">아직 등록된 오이코스 상품이 없어요.</p>'; return; }
          function wonLabel(w) {
            var n = Number(w);
            if (!n) return "";
            if (n >= 10000 && n % 10000 === 0) return (n / 10000) + "만원";
            return n.toLocaleString() + "원";
          }
          shopListEl.innerHTML = items.map(function (it) {
            return (
              '<div class="note-item" style="display:flex;align-items:center;justify-content:space-between;gap:10px;">' +
                '<div style="min-width:0;">' +
                  '<div class="content" style="font-weight:700;">' + escapeHtml(it.name) + ' · ' + it.cost + '달란트' +
                    (it.price_won ? ' <span style="color:var(--text-soft);font-weight:400;">(' + wonLabel(it.price_won) + ' 상당)</span>' : '') + '</div>' +
                  (it.description ? '<div class="meta" style="margin:2px 0 0;">' + escapeHtml(it.description) + '</div>' : '') +
                '</div>' +
                '<button type="button" class="btn ghost" data-oikos-item="' + it.id + '" style="flex:none;padding:6px 12px;font-size:12.5px;">신청</button>' +
              '</div>'
            );
          }).join("");
          shopListEl.querySelectorAll("[data-oikos-item]").forEach(function (btn) {
            btn.addEventListener("click", function () {
              var itemId = Number(btn.getAttribute("data-oikos-item"));
              if (!confirm("이 상품을 곳간 달란트로 신청할까요?")) return;
              btn.disabled = true;
              if (shopMsgEl) { shopMsgEl.style.color = ""; shopMsgEl.textContent = "신청 중..."; }
              client.rpc("request_oikos_shop_order", { p_group_id: groupId, p_item_id: itemId }).then(function (r) {
                btn.disabled = false;
                if (r.error) { if (shopMsgEl) shopMsgEl.textContent = r.error.message || "신청에 실패했어요."; return; }
                if (shopMsgEl) { shopMsgEl.style.color = "var(--well)"; shopMsgEl.textContent = "신청했어요. 교역자 확인을 기다려 주세요."; }
                loadInfo(); loadList();
              }).catch(function () { btn.disabled = false; if (shopMsgEl) shopMsgEl.textContent = "신청에 실패했어요."; });
            });
          });
        });
      }
      loadShop();

      // --- 곳간 → 개인 나눠주기 ---
      var distForm = document.getElementById("oikosDistributeForm");
      var distAmountEl = document.getElementById("oikosDistributeAmount");
      var distTargetEl = document.getElementById("oikosDistributeTarget");
      var distMsgEl = document.getElementById("oikosDistributeMsg");
      if (distTargetEl) {
        client.rpc("get_group_members", { p_group_id: groupId }).then(function (r) {
          (r.data || []).forEach(function (m) {
            var opt = document.createElement("option");
            opt.value = m.user_id;
            opt.textContent = (m.real_name || m.nickname || "이름 없음");
            distTargetEl.appendChild(opt);
          });
        });
      }
      if (distForm) {
        distForm.onsubmit = function (e) {
          e.preventDefault();
          var amt = parseInt(distAmountEl && distAmountEl.value, 10);
          if (distMsgEl) { distMsgEl.style.color = ""; distMsgEl.textContent = ""; }
          if (!amt || amt <= 0) { if (distMsgEl) distMsgEl.textContent = "1 이상 숫자를 입력해주세요."; return; }
          var targetId = distTargetEl && distTargetEl.value ? distTargetEl.value : null;
          var who = targetId ? "선택한 학생에게" : "오이코스 전원에게";
          if (!confirm(who + " 각 " + amt + "달란트씩 곳간에서 나눠줄까요?")) return;
          var btn = distForm.querySelector("button[type=submit]");
          if (btn) btn.disabled = true;
          var params = { p_group_id: groupId, p_amount: amt };
          if (targetId) params.p_user_id = targetId;
          client.rpc("distribute_oikos_pool", params).then(function (r) {
            if (btn) btn.disabled = false;
            if (r.error) { if (distMsgEl) distMsgEl.textContent = r.error.message || "나눠주기에 실패했어요."; return; }
            if (distMsgEl) { distMsgEl.style.color = "var(--well)"; distMsgEl.textContent = (r.data || 0) + "명에게 나눠줬어요."; }
            if (distAmountEl) distAmountEl.value = "";
            loadInfo();
            if (typeof loadTotalPoints === "function") loadTotalPoints(userId);
          }).catch(function () { if (btn) btn.disabled = false; if (distMsgEl) distMsgEl.textContent = "나눠주기에 실패했어요."; });
        };
      }
    });
  }

  function showGroup(group, justJoined) {
    noGroupEl.style.display = "none";
    hasGroupEl.style.display = "block";
    document.getElementById("groupName").textContent = group.name;
    document.getElementById("groupCode").textContent = group.invite_code;
    renderChallengeBanner(group.id);
    renderGroupMembers(group.id);
    initGroupInvite(group.id, group.created_by === userId);
    initOikosTalent(group.id);
    initOikosExpense(group.id);

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
    // client.rpc(...)는 PostgREST 빌더라 .catch가 없다 → .then(성공, 실패) 둘 다 같은 후속 처리로 이어간다.
    var afterWeeklyBonus = function () {
      renderLeaderboard(group.id);
      renderGroupMembers(group.id);
    };
    client.rpc("evaluate_group_weekly_bonus", { p_group_id: group.id }).then(afterWeeklyBonus, afterWeeklyBonus);

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

var NOTE_LABELS = { greeting: "하루 인사", gratitude: "감사노트", prayer: "기도제목", suggestion: "건의사항" };
var NOTE_LIST_IDS = { greeting: "noteListGreeting", gratitude: "noteListGratitude", prayer: "noteListPrayer", suggestion: "noteListSuggestion" };

var GREETING_DRAW_MESSAGES = {
  0: "앗, 이번엔 꽝이에요 😅 그래도 하루 인사 남겨줘서 고마워요!",
  1: "🎉 오늘의 달란트 1점을 뽑았어요!",
  2: "🎊 대박! 오늘의 달란트 2점을 뽑았어요!"
};

function renderGreetingDrawResult(container, points) {
  container.innerHTML =
    '<div class="talent-well-card talent-well-done">' +
      '<div class="talent-well-result-num">' + points + '점</div>' +
      '<p style="margin:8px 0 0;font-size:13.5px;color:var(--text-soft);">' +
        (GREETING_DRAW_MESSAGES[points] || "") +
      '</p>' +
    '</div>';
}

function playGreetingDrawAnimation(container, userId) {
  var client = getClient();
  container.innerHTML =
    '<div class="talent-well-card">' +
      '<div class="talent-well">' +
        '<div class="talent-well-hole"></div>' +
        '<div class="talent-well-rope"></div>' +
        '<div class="talent-well-bucket">🪣</div>' +
      '</div>' +
      '<p class="talent-well-status">두레박을 우물 속으로 내리는 중...</p>' +
    '</div>';
  var statusEl = container.querySelector(".talent-well-status");
  var bucketEl = container.querySelector(".talent-well-bucket");

  setTimeout(function () {
    if (statusEl) statusEl.textContent = "도르래를 돌려 끌어올리는 중...";
    if (bucketEl) bucketEl.classList.add("rising");
  }, 900);

  var rpcPromise = client.rpc("draw_greeting_talent");
  var delayPromise = new Promise(function (resolve) { setTimeout(resolve, 2000); });

  Promise.all([rpcPromise, delayPromise]).then(function (results) {
    var res = results[0];
    if (res.error) {
      container.innerHTML = '<p class="msg">달란트 뽑기에 실패했어요. 새로고침 후 다시 시도해주세요.</p>';
      return;
    }
    renderGreetingDrawResult(container, res.data);
    loadTotalPoints(userId);
  });
}

function renderGreetingDrawButton(container, userId) {
  container.innerHTML =
    '<div class="talent-well-card">' +
      '<p style="margin:0 0 10px;font-size:13px;color:var(--text-soft);">하루 인사를 남겼어요! 오늘의 달란트를 뽑아보세요.</p>' +
      '<button type="button" class="btn block" id="greetingDrawBtn">🪣 달란트 뽑기</button>' +
    '</div>';
  var btn = document.getElementById("greetingDrawBtn");
  if (btn) {
    btn.addEventListener("click", function () {
      btn.disabled = true;
      playGreetingDrawAnimation(container, userId);
    });
  }
}

function updateGreetingDrawSection(userId, greetingNotes) {
  var client = getClient();
  var section = document.getElementById("greetingDrawSection");
  if (!client || !section) return;

  var today = todayStr();
  var wroteToday = (greetingNotes || []).some(function (item) {
    var d = new Date(item.created_at);
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return (y + "-" + m + "-" + day) === today;
  });

  if (!wroteToday) {
    section.style.display = "none";
    section.innerHTML = "";
    return;
  }

  section.style.display = "block";
  client.from("points_ledger")
    .select("points")
    .eq("user_id", userId)
    .eq("action_type", "greeting_draw")
    .eq("ref_date", today)
    .then(function (res) {
      var rows = res.data || [];
      if (rows.length) {
        renderGreetingDrawResult(section, rows[0].points);
      } else {
        renderGreetingDrawButton(section, userId);
      }
    });
}

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
          '<div class="content">' + linkifyHtml(item.content) + '</div>' +
          renderImageGallery(item.image_urls) +
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
        var grouped = { greeting: [], gratitude: [], prayer: [], suggestion: [] };
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
        updateGreetingDrawSection(userId, grouped.greeting);
      });
  }

  forms.forEach(function (form) {
    var type = form.getAttribute("data-type");
    var textarea = form.querySelector("textarea");
    var msg = form.querySelector(".msg");
    var submitBtn = form.querySelector('button[type="submit"]');
    var picker = bindImagePicker(form);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var content = textarea.value.trim();
      var files = picker.getFiles();
      if (!content && (!files || !files.length)) {
        msg.textContent = "내용을 입력하거나 사진을 첨부해주세요.";
        return;
      }
      if (submitBtn) submitBtn.disabled = true;
      msg.textContent = (files && files.length) ? "사진 올리는 중..." : "저장 중...";

      uploadPostImages(userId, files).then(function (urls) {
        msg.textContent = "저장 중...";
        return client.from("notes").insert({
          user_id: userId,
          type: type,
          content: content,
          image_urls: urls
        });
      }).then(function (res) {
        if (submitBtn) submitBtn.disabled = false;
        if (res && res.error) {
          msg.textContent = "저장에 실패했어요.";
          return;
        }
        msg.textContent = "기록되었습니다.";
        textarea.value = "";
        picker.reset();
        loadNotes();
        loadTotalPoints(userId);
      }).catch(function () {
        if (submitBtn) submitBtn.disabled = false;
        msg.textContent = "사진 업로드에 실패했어요. 다시 시도해주세요.";
      });
    });
  });

  loadNotes();
}
