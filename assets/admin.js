// 관리자 전용: 공지사항 작성, 이달의 일정 추가
// auth.js의 getClient(), getSession()에 의존함

// 부장은 교역자(is_admin)보다 낮은 단계의 관리자 페이지 접근 권한이다.
// CURRENT_IS_ADMIN(교역자)만 탈퇴시키기/본명 수정/교사 지정/오이코스 해체 같은
// 민감한 버튼을 볼 수 있고, CURRENT_IS_STAFF(교역자 또는 부장)는 페이지 자체에 들어와서
// 공지/일정/퀴즈/배너 등록, 학생 기록 조회·삭제, 달란트 부여를 할 수 있다.
var CURRENT_IS_ADMIN = false;
var CURRENT_IS_STAFF = false;

// 관리자 페이지의 각 카드를 아코디언으로 만든다 — 처음엔 제목(.accordion-toggle)만 보이고,
// 눌러야 그 아래 .accordion-body(폼+목록)가 펼쳐진다. 스크롤이 한없이 길어지는 걸 막기 위함.
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

function checkIsAdmin(userId) {
  var client = getClient();
  if (!client) return Promise.resolve(false);
  return client.from("profiles").select("is_admin, is_department_head").eq("user_id", userId).single().then(function (res) {
    var p = res.data;
    CURRENT_IS_ADMIN = !!(p && p.is_admin);
    CURRENT_IS_STAFF = !!(p && (p.is_admin || p.is_department_head));
    return CURRENT_IS_STAFF;
  }).catch(function () { return false; });
}

function escapeHtmlAdmin(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function initAdminPage() {
  var gate = document.getElementById("adminGate");
  var content = document.getElementById("adminContent");
  if (!gate || !content) return;

  getSession().then(function (session) {
    if (!session) {
      gate.innerHTML = '<p>로그인이 필요한 페이지예요.</p><a href="login.html" class="btn">로그인하러 가기</a>';
      return;
    }
    checkIsAdmin(session.user.id).then(function (isStaff) {
      if (!isStaff) {
        gate.innerHTML = '<p>교역자·부장만 접근할 수 있는 페이지예요.</p>';
        return;
      }
      gate.style.display = "none";
      content.style.display = "block";
      initAccordions();
      initPushBroadcastForm();
      initBannerForm(session.user.id);
      initAnnouncementForm(session.user.id);
      initEventForm(session.user.id);
      initQuizForm(session.user.id);
      initShopAdmin(session.user.id);
      loadChodaeInvitesAdmin();
      loadOikosExpensesAdmin();
      loadMemberList();
      loadAllNotes();
      loadGroupsAdmin();
      loadBoardAdmin();
    });
  });
}

function formatDateTime(iso) {
  if (!iso) return null;
  var d = new Date(iso);
  var pad = function (n) { return String(n).padStart(2, "0"); };
  return d.getFullYear() + "." + pad(d.getMonth() + 1) + "." + pad(d.getDate()) +
    " " + pad(d.getHours()) + ":" + pad(d.getMinutes());
}

var ADMIN_NOTE_LABELS = { greeting: "하루 인사", gratitude: "감사노트", prayer: "기도제목", suggestion: "건의사항" };

// 기도제목 공개 범위 표시 (community=기본값이라 굳이 표시 안 함)
var ADMIN_VIS_LABELS = { public: "🌐 전체공개", staff: "🔒 교역자·교사만", private: "🙈 나만 보기" };
function adminVisBadge(item) {
  if (!item || item.type !== "prayer") return "";
  var t = ADMIN_VIS_LABELS[item.visibility];
  return t ? ' · <span style="color:var(--gold);">' + t + '</span>' : "";
}

var ADMIN_ACTION_LABELS = {
  attendance: "출석",
  streak_bonus: "7일 연속출석 보너스",
  note: "감사노트/기도제목 작성",
  quiz: "성경퀴즈 정답",
  group_attendance_bonus: "오이코스 출석 챌린지",
  group_notes_bonus: "오이코스 기록 챌린지",
  admin_award: "교역자가 부여",
  greeting_draw: "하루인사 달란트 뽑기",
  badge_award: "뱃지 등급 달성 보상"
};

// 회원 상세보기: 닉네임/본명 부분을 눌렀을 때, 그 사람의 출석·작성 기록·달란트 내역 전체를
// 한 번에 불러와서 보여준다 (처음 펼칠 때만 불러오고, 이후에는 열고 닫기만 함).
function loadMemberDetail(userId, container) {
  var client = getClient();
  container.innerHTML = '<p class="msg">불러오는 중...</p>';

  Promise.all([
    client.rpc("get_member_notes_admin", { p_user_id: userId }),
    client.rpc("get_member_attendance_admin", { p_user_id: userId }),
    client.rpc("get_member_points_admin", { p_user_id: userId })
  ]).then(function (results) {
    var notes = results[0].data || [];
    var attendance = results[1].data || [];
    var points = results[2].data || [];

    var MAX_ROWS = 60;

    var attendanceHtml = attendance.length
      ? '<p class="msg" style="margin:8px 0 0;">총 ' + attendance.length + '일 · ' +
          attendance.slice(0, 20).map(function (a) { return a.attend_date; }).join(", ") +
          (attendance.length > 20 ? " 외 " + (attendance.length - 20) + "일" : "") + '</p>'
      : '<p class="msg" style="margin:8px 0 0;">출석 기록이 없어요.</p>';

    var notesHtml = notes.length
      ? notes.slice(0, MAX_ROWS).map(function (n) {
          return (
            '<div class="note-item">' +
              '<div class="meta">' + ADMIN_NOTE_LABELS[n.type] + ' · ' + formatDateTime(n.created_at) + adminVisBadge(n) + '</div>' +
              '<div class="content">' + linkifyHtml(n.content) + '</div>' +
              renderImageGallery(n.image_urls) +
            '</div>'
          );
        }).join("") + (notes.length > MAX_ROWS ? '<p class="msg" style="margin:8px 0 0;">…최근 ' + MAX_ROWS + '건만 표시</p>' : '')
      : '<p class="msg" style="margin:8px 0 0;">작성한 기록이 없어요.</p>';

    var pointsHtml = points.length
      ? points.slice(0, MAX_ROWS).map(function (p) {
          var label = ADMIN_ACTION_LABELS[p.action_type] || p.action_type;
          var isPlus = p.points >= 0;
          // 뱃지 보상(+): 어떤 뱃지 몇 등급인지 note 에 저장돼 있다 → 회색 상세줄로. 회수(−)는 note 를 그대로.
          var isBadgePlus = p.action_type === "badge_award" && p.points > 0 && p.note && p.note !== "뱃지 보상";
          var metaNote = (p.note && !isBadgePlus) ? " (" + escapeHtmlAdmin(p.note) + ")" : "";
          var detail = isBadgePlus
            ? '<div style="color:var(--text-soft);font-size:11px;margin-top:3px;line-height:1.5;">🏅 ' + escapeHtmlAdmin(p.note) + '</div>'
            : "";
          return (
            '<div class="note-item">' +
              '<div class="meta">' + formatDateTime(p.created_at) + ' · ' + label + metaNote + '</div>' +
              '<div class="content" style="font-weight:700;color:' + (isPlus ? "var(--well)" : "#b3432c") + ';">' + (isPlus ? "+" : "") + p.points + '달란트</div>' +
              detail +
            '</div>'
          );
        }).join("") + (points.length > MAX_ROWS ? '<p class="msg" style="margin:8px 0 0;">…최근 ' + MAX_ROWS + '건만 표시</p>' : '')
      : '<p class="msg" style="margin:8px 0 0;">달란트 내역이 없어요.</p>';

    container.innerHTML =
      '<details class="member-fold" open><summary>📅 출석 (' + attendance.length + '일)</summary>' + attendanceHtml + '</details>' +
      '<details class="member-fold"><summary>✍️ 작성한 기록 (' + notes.length + '건)</summary>' + notesHtml + '</details>' +
      '<details class="member-fold"><summary>💠 달란트 내역 (' + points.length + '건)</summary>' + pointsHtml + '</details>';
  }).catch(function () {
    container.innerHTML = '<p class="msg">불러오지 못했어요.</p>';
  });
}

// 검색어와 각 역할 컬럼의 현재 페이지를 다시 불러올 때(달란트 부여 등 후 새로고침)도
// 유지되도록 모듈 전역에 둔다.
var MEMBER_SEARCH_QUERY = "";
var MEMBER_PAGE_SIZE = 10;
var MEMBER_PAGE = { admins: 0, deptHeads: 0, teachers: 0, students: 0 };

function loadMemberList() {
  var client = getClient();
  var countEl = document.getElementById("memberCount");
  var listEl = document.getElementById("memberList");
  var searchInput = document.getElementById("memberSearchInput");
  if (!listEl) return;

  client.rpc("get_member_list").then(function (res) {
    var members = res.data || [];
    if (countEl) countEl.textContent = "총 " + members.length + "명";

    if (!members.length) {
      listEl.innerHTML = '<p class="msg">가입한 회원이 없어요.</p>';
      return;
    }

    function renderMember(m) {
      var lastSeen = formatDateTime(m.last_sign_in_at);
      var lastNote = m.last_note_type
        ? ADMIN_NOTE_LABELS[m.last_note_type] + ' (' + formatDateTime(m.last_note_at) + ')'
        : "아직 없음";
      return (
        '<div class="note-item" data-user-id="' + m.user_id + '">' +
          '<div class="content" data-action="toggle-detail" style="cursor:pointer;">' +
            '<strong>' + escapeHtmlAdmin(m.nickname) + '</strong>' +
            (m.is_admin ? ' <span style="color:var(--gold);font-size:12px;">교역자</span>' : '') +
            (m.is_department_head && !m.is_admin ? ' <span style="color:var(--gold);font-size:12px;">부장</span>' : '') +
            (m.is_teacher && !m.is_admin ? ' <span style="color:var(--well);font-size:12px;">교사</span>' : '') +
            ' <span style="color:var(--well);font-size:12px;font-weight:700;">' + m.total_points + '달란트</span>' +
            ' <span style="color:var(--text-soft);font-size:11px;">(눌러서 상세보기)</span>' +
            '<br>' + (m.real_name ? '본명: ' + escapeHtmlAdmin(m.real_name) + ' · ' : '') +
            (m.phone_number ? '☎ ' + escapeHtmlAdmin(m.phone_number) + ' · ' : '') + escapeHtmlAdmin(m.email) +
          '</div>' +
          '<div class="meta">가입: ' + formatDateTime(m.joined_at) +
            ' · 최근 로그인: ' + (lastSeen || "기록 없음") +
            '<br>최근 기록: ' + lastNote + '</div>' +
          '<div class="member-detail" data-detail-for="' + m.user_id + '" style="display:none;"></div>' +
          '<button type="button" class="btn ghost" data-action="award-points" style="margin-top:8px;padding:6px 14px;font-size:12.5px;color:var(--gold);border-color:var(--gold);">달란트 부여</button>' +
          (CURRENT_IS_ADMIN ?
            '<button type="button" class="btn ghost" data-action="toggle-teacher" data-is-teacher="' + m.is_teacher + '" style="margin-top:8px;margin-left:6px;padding:6px 14px;font-size:12.5px;">' +
              (m.is_teacher ? "교사 해제" : "교사로 지정") +
            '</button>' +
            '<button type="button" class="btn ghost" data-action="toggle-dept-head" data-is-dept-head="' + m.is_department_head + '" style="margin-top:8px;margin-left:6px;padding:6px 14px;font-size:12.5px;">' +
              (m.is_department_head ? "부장 해제" : "부장으로 지정") +
            '</button>' +
            '<button type="button" class="btn ghost" data-action="edit-real-name" style="margin-top:8px;margin-left:6px;padding:6px 14px;font-size:12.5px;">본명 수정</button>' +
            '<button type="button" class="btn ghost" data-action="edit-phone" style="margin-top:8px;margin-left:6px;padding:6px 14px;font-size:12.5px;">전화번호 수정</button>' +
            '<button type="button" class="btn ghost" data-action="reset-password" style="margin-top:8px;margin-left:6px;padding:6px 14px;font-size:12.5px;">비밀번호 초기화</button>' +
            (m.is_admin ? '' :
              '<button type="button" class="btn ghost" data-action="delete-user" style="margin-top:8px;margin-left:6px;padding:6px 14px;font-size:12.5px;color:#b3432c;border-color:#b3432c;">탈퇴시키기</button>'
            )
          : '') +
        '</div>'
      );
    }

    // 학생이 많아지면 스크롤이 한없이 길어지므로, 검색어로 좁혀서 볼 수 있게 한다.
    // (검색은 이미 불러온 members 배열 안에서만 걸러내는 것 — 서버에 다시 묻지 않음)
    function renderList(list) {
      if (!list.length) {
        listEl.innerHTML = '<p class="msg">검색 결과가 없어요.</p>';
        return;
      }

    // 교역자 / 부장 / 교사 / 학생으로 구분해서 보여준다 (한눈에 누가 어떤 역할인지 알아볼 수 있게).
    // 여러 역할을 겸하는 사람은 교역자 > 부장 > 교사 순으로 한 곳에만 속한다(뱃지는 겸직 전부 표시됨).
    var admins = list.filter(function (m) { return m.is_admin; });
    var deptHeads = list.filter(function (m) { return m.is_department_head && !m.is_admin; });
    var teachers = list.filter(function (m) { return m.is_teacher && !m.is_admin && !m.is_department_head; });
    var students = list.filter(function (m) { return !m.is_teacher && !m.is_admin && !m.is_department_head; });

    // 한 역할군에 사람이 많아지면(특히 학생) 그 컬럼만 10명씩 끊어서 보여주고,
    // 이전/다음으로 넘겨보게 한다 — pageKey별로 현재 몇 페이지인지 기억해둔다.
    function renderSection(label, list, pageKey) {
      if (!list.length) return "";
      var totalPages = Math.ceil(list.length / MEMBER_PAGE_SIZE);
      var page = Math.min(MEMBER_PAGE[pageKey] || 0, totalPages - 1);
      MEMBER_PAGE[pageKey] = page;
      var pageItems = list.slice(page * MEMBER_PAGE_SIZE, page * MEMBER_PAGE_SIZE + MEMBER_PAGE_SIZE);
      var pagerHtml = totalPages > 1
        ? '<div class="member-pager">' +
            '<button type="button" class="btn ghost" data-page-action="prev" data-page-key="' + pageKey + '"' + (page === 0 ? ' disabled' : '') + '>‹ 이전</button>' +
            '<span>' + (page + 1) + ' / ' + totalPages + '</span>' +
            '<button type="button" class="btn ghost" data-page-action="next" data-page-key="' + pageKey + '"' + (page === totalPages - 1 ? ' disabled' : '') + '>다음 ›</button>' +
          '</div>'
        : '';
      return (
        '<div class="scroll-column-title">' + label + ' (' + list.length + '명)</div>' +
        pageItems.map(renderMember).join("") +
        pagerHtml
      );
    }
    function wrapColumn(html) {
      return html ? '<div class="scroll-column">' + html + '</div>' : "";
    }

    // 부장은 별도 컬럼으로 옆에 두지 않고, 교역자 컬럼 안에 그 아래로 이어서 보여준다.
    var staffHtml = renderSection("🌟 교역자", admins, "admins") + renderSection("🗂️ 부장", deptHeads, "deptHeads");

    listEl.innerHTML =
      '<div class="scroll-columns">' +
        wrapColumn(staffHtml) +
        wrapColumn(renderSection("📘 교사", teachers, "teachers")) +
        wrapColumn(renderSection("🙋 학생", students, "students")) +
      '</div>';

    listEl.querySelectorAll('button[data-page-action]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.getAttribute("data-page-key");
        var delta = btn.getAttribute("data-page-action") === "next" ? 1 : -1;
        MEMBER_PAGE[key] = (MEMBER_PAGE[key] || 0) + delta;
        applyFilter();
      });
    });

    listEl.querySelectorAll('[data-action="toggle-detail"]').forEach(function (el) {
      el.addEventListener("click", function () {
        var itemEl = el.closest(".note-item");
        var targetUserId = itemEl.getAttribute("data-user-id");
        var detailEl = itemEl.querySelector('[data-detail-for="' + targetUserId + '"]');
        if (!detailEl) return;
        if (detailEl.style.display === "block") {
          detailEl.style.display = "none";
          return;
        }
        detailEl.style.display = "block";
        if (detailEl.getAttribute("data-loaded") === "true") return;
        detailEl.setAttribute("data-loaded", "true");
        loadMemberDetail(targetUserId, detailEl);
      });
    });

    listEl.querySelectorAll('button[data-action="toggle-teacher"]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        var itemEl = btn.closest(".note-item");
        var targetUserId = itemEl.getAttribute("data-user-id");
        var nextIsTeacher = btn.getAttribute("data-is-teacher") !== "true";
        client.rpc("admin_set_teacher", { p_user_id: targetUserId, p_is_teacher: nextIsTeacher }).then(function () {
          loadMemberList();
        });
      });
    });

    listEl.querySelectorAll('button[data-action="toggle-dept-head"]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        var itemEl = btn.closest(".note-item");
        var targetUserId = itemEl.getAttribute("data-user-id");
        var nextIsDeptHead = btn.getAttribute("data-is-dept-head") !== "true";
        client.rpc("admin_set_department_head", { p_user_id: targetUserId, p_is_department_head: nextIsDeptHead }).then(function () {
          loadMemberList();
        });
      });
    });

    listEl.querySelectorAll('button[data-action="award-points"]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        var itemEl = btn.closest(".note-item");
        var targetUserId = itemEl.getAttribute("data-user-id");
        var amountStr = prompt("몇 달란트를 부여할까요? (보정하려면 음수도 가능해요, 예: -2)");
        if (amountStr === null) return;
        var amount = parseInt(amountStr, 10);
        if (!amount) {
          alert("0이 아닌 숫자를 입력해주세요.");
          return;
        }
        var note = prompt("사유를 남겨주세요 (선택, 안 남겨도 돼요)") || null;
        client.rpc("admin_award_points", { p_user_id: targetUserId, p_points: amount, p_note: note }).then(function (res) {
          if (res.error) {
            alert("달란트 부여에 실패했어요.");
            return;
          }
          loadMemberList();
        });
      });
    });

    listEl.querySelectorAll('button[data-action="edit-real-name"]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        var itemEl = btn.closest(".note-item");
        var targetUserId = itemEl.getAttribute("data-user-id");
        var nickname = itemEl.querySelector("strong").textContent;
        var newName = prompt('"' + nickname + '" 님의 이름(본명)을 입력해주세요.');
        if (newName === null) return;
        newName = newName.trim();
        if (!newName) {
          alert("이름을 입력해주세요.");
          return;
        }
        client.rpc("admin_set_real_name", { p_user_id: targetUserId, p_real_name: newName }).then(function (res) {
          if (res.error) {
            alert("수정에 실패했어요.");
            return;
          }
          loadMemberList();
        });
      });
    });

    listEl.querySelectorAll('button[data-action="edit-phone"]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        var itemEl = btn.closest(".note-item");
        var targetUserId = itemEl.getAttribute("data-user-id");
        var nickname = itemEl.querySelector("strong").textContent;
        var newPhone = prompt('"' + nickname + '" 님의 전화번호를 입력해주세요. (예: 010-1234-5678)');
        if (newPhone === null) return;
        newPhone = newPhone.trim();
        if (!newPhone) {
          alert("전화번호를 입력해주세요.");
          return;
        }
        client.rpc("admin_set_phone_number", { p_user_id: targetUserId, p_phone_number: newPhone }).then(function (res) {
          if (res.error) {
            alert("수정에 실패했어요.");
            return;
          }
          loadMemberList();
        });
      });
    });

    // 비밀번호 초기화는 auth.users를 직접 건드려야 해서(SQL 함수로는 막혀있음),
    // Supabase 공식 관리자 API를 서버 쪽에서 대신 호출해주는 Edge Function을 통해서만 처리한다.
    listEl.querySelectorAll('button[data-action="reset-password"]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        var itemEl = btn.closest(".note-item");
        var targetUserId = itemEl.getAttribute("data-user-id");
        var nickname = itemEl.querySelector("strong").textContent;
        var newPw = prompt('"' + nickname + '" 님의 새 비밀번호를 입력해주세요 (6자 이상). 학생에게 이 비밀번호를 직접 알려주세요.');
        if (newPw === null) return;
        if (newPw.length < 6) {
          alert("비밀번호는 6자 이상이어야 해요.");
          return;
        }
        if (!confirm('"' + nickname + '" 님의 비밀번호를 "' + newPw + '"(으)로 바꿀까요?')) return;

        getSession().then(function (session) {
          if (!session) {
            alert("로그인이 필요합니다.");
            return;
          }
          fetch(SUPABASE_URL + "/functions/v1/admin-reset-password", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + session.access_token
            },
            body: JSON.stringify({ p_user_id: targetUserId, p_new_password: newPw })
          }).then(function (res) {
            return res.json().then(function (data) { return { ok: res.ok, data: data }; });
          }).then(function (result) {
            if (!result.ok) {
              alert("초기화 실패: " + (result.data && result.data.error ? result.data.error : "알 수 없는 오류"));
              return;
            }
            alert('비밀번호가 "' + newPw + '"(으)로 바뀌었어요. 학생에게 알려주세요.');
          }).catch(function () {
            alert("네트워크 오류로 초기화하지 못했어요.");
          });
        });
      });
    });

    listEl.querySelectorAll('button[data-action="delete-user"]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        var itemEl = btn.closest(".note-item");
        var targetUserId = itemEl.getAttribute("data-user-id");
        var nickname = itemEl.querySelector("strong").textContent;
        if (!confirm(
          '"' + nickname + '" 님을 정말 탈퇴시킬까요?\n\n' +
          '출석·감사노트·기도제목·달란트 등 모든 기록이 함께 삭제되고 되돌릴 수 없어요.\n' +
          '이 사람이 만든 오이코스가 있다면 그 오이코스 자체도 (다른 멤버 것까지) 함께 사라져요.'
        )) return;
        client.rpc("admin_delete_user", { p_user_id: targetUserId }).then(function (res) {
          if (res.error) {
            alert("탈퇴 처리에 실패했어요: " + res.error.message);
            return;
          }
          loadMemberList();
        });
      });
    });
    } // renderList 끝

    function applyFilter() {
      var q = MEMBER_SEARCH_QUERY.trim().toLowerCase();
      if (!q) {
        renderList(members);
        return;
      }
      renderList(members.filter(function (m) {
        return (m.nickname && m.nickname.toLowerCase().indexOf(q) !== -1) ||
          (m.real_name && m.real_name.toLowerCase().indexOf(q) !== -1) ||
          (m.phone_number && m.phone_number.replace(/[^0-9]/g, "").indexOf(q.replace(/[^0-9]/g, "")) !== -1 && q.replace(/[^0-9]/g, "")) ||
          (m.email && m.email.toLowerCase().indexOf(q) !== -1);
      }));
    }

    if (searchInput) {
      searchInput.value = MEMBER_SEARCH_QUERY;
      searchInput.oninput = function () {
        MEMBER_SEARCH_QUERY = searchInput.value;
        // 새로 검색하면 결과가 완전히 달라지니 각 컬럼을 1페이지부터 다시 보여준다
        MEMBER_PAGE = { admins: 0, deptHeads: 0, teachers: 0, students: 0 };
        applyFilter();
      };
    }

    applyFilter();
  }).catch(function () {
    listEl.innerHTML = '<p class="msg">회원 목록을 불러오지 못했어요.</p>';
  });
}

function loadAllNotes() {
  var client = getClient();
  var listEl = document.getElementById("allNotesList");
  if (!listEl) return;

  function load() {
    // 건의사항은 하루인사·감사노트·기도제목이 많이 쌓이면 get_all_notes_admin 의
    // 최신 200개 창 밖으로 밀려 컬럼이 통째로 사라진다. 건의사항만 따로 넉넉히 받아온다.
    Promise.all([
      client.rpc("get_all_notes_admin", { p_limit: 200 }),
      client.rpc("get_suggestions_admin", { p_limit: 300 })
    ]).then(function (resList) {
      var items = (resList[0] && resList[0].data) || [];
      var suggestionItems = (resList[1] && resList[1].data) || [];
      if (!items.length && !suggestionItems.length) {
        listEl.innerHTML = '<p class="msg">아직 기록이 없어요.</p>';
        return;
      }

      function renderNote(item) {
        var writer = item.real_name
          ? escapeHtmlAdmin(item.real_name) + '(' + escapeHtmlAdmin(item.nickname) + ')'
          : escapeHtmlAdmin(item.nickname || "익명");
        return (
          '<div class="note-item">' +
            '<div class="meta">' + writer + ' · ' + ADMIN_NOTE_LABELS[item.type] + ' · ' + formatDateTime(item.created_at) + adminVisBadge(item) + '</div>' +
            '<div class="content">' + linkifyHtml(item.content) + '</div>' +
            renderImageGallery(item.image_urls) +
            '<button class="btn ghost" data-note-id="' + item.id + '" style="margin-top:8px;padding:6px 14px;font-size:12.5px;">삭제</button>' +
          '</div>'
        );
      }

      // 감사노트 / 기도제목 / 하루인사 / 건의사항으로 구분해서 보여준다
      var byType = { gratitude: [], prayer: [], greeting: [], suggestion: [] };
      items.forEach(function (item) {
        if (item.type === "suggestion") return; // 건의사항은 아래 전용 조회분으로 채운다
        if (byType[item.type]) byType[item.type].push(item);
      });
      var seenSuggestion = {};
      suggestionItems.forEach(function (item) {
        if (seenSuggestion[item.id]) return;
        seenSuggestion[item.id] = true;
        byType.suggestion.push(item);
      });

      function renderColumn(typeKey, icon, alwaysShow) {
        var list = byType[typeKey];
        if (!list.length && !alwaysShow) return "";
        var body = list.length
          ? list.map(renderNote).join("")
          : '<p class="msg" style="margin-top:0;">아직 없어요.</p>';
        return (
          '<div class="scroll-column">' +
            '<div class="scroll-column-title">' + icon + ' ' + ADMIN_NOTE_LABELS[typeKey] + ' (' + list.length + '건)</div>' +
            body +
          '</div>'
        );
      }

      listEl.innerHTML =
        '<div class="scroll-columns">' +
          renderColumn("suggestion", "📮", true) +
          renderColumn("gratitude", "🙏") +
          renderColumn("prayer", "🕊️") +
          renderColumn("greeting", "🙋") +
        '</div>';

      listEl.querySelectorAll("button[data-note-id]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          if (!confirm("이 기록을 삭제할까요?")) return;
          client.rpc("admin_delete_note", { p_note_id: btn.getAttribute("data-note-id") }).then(function () {
            load();
          });
        });
      });
    }).catch(function () {
      listEl.innerHTML = '<p class="msg">기록을 불러오지 못했어요.</p>';
    });
  }

  load();
}

// 교역자·부장용: 자유게시판 글/댓글 전체를 관리자 페이지에서도 확인하고 삭제할 수 있게 한다.
// (학생들은 board.html에서 본인 글/댓글만 지울 수 있고, 여기서는 남의 글/댓글도 지울 수 있다)
function loadBoardAdmin() {
  var client = getClient();
  var listEl = document.getElementById("boardAdminList");
  if (!listEl) return;

  var postsById = {};

  function renderComment(c) {
    return (
      '<div class="board-comment" data-comment-id="' + c.id + '">' +
        '<div class="meta">' + escapeHtmlAdmin(c.nickname || "익명") + ' · ' + formatDateTime(c.created_at) + '</div>' +
        '<div class="content">' + escapeHtmlAdmin(c.content) + '</div>' +
        '<button type="button" class="btn ghost board-comment-delete" data-comment-id="' + c.id + '">삭제</button>' +
      '</div>'
    );
  }

  function loadComments(postId, container) {
    container.innerHTML = '<p class="msg">불러오는 중...</p>';
    client.rpc("get_board_comments", { p_post_id: postId }).then(function (res) {
      var rows = res.data || [];
      container.innerHTML = rows.length ? rows.map(renderComment).join("") : '<p class="msg">아직 댓글이 없어요.</p>';
    });
  }

  function renderPost(p) {
    return (
      '<div class="board-post" data-post-id="' + p.id + '">' +
        '<div class="meta">' + escapeHtmlAdmin(p.nickname || "익명") + ' · ' + formatDateTime(p.created_at) + '</div>' +
        '<div class="content">' + escapeHtmlAdmin(p.content) + '</div>' +
        '<div style="display:flex;gap:8px;margin-top:8px;">' +
          '<button type="button" class="btn ghost board-comment-toggle" data-post-id="' + p.id + '" style="padding:6px 14px;font-size:12.5px;">💬 댓글 ' + p.comment_count + '개</button>' +
          '<button type="button" class="btn ghost board-post-delete" data-post-id="' + p.id + '" style="padding:6px 14px;font-size:12.5px;">삭제</button>' +
        '</div>' +
        '<div class="board-comments" data-post-id="' + p.id + '" style="display:none;margin-top:10px;"></div>' +
      '</div>'
    );
  }

  function load() {
    client.rpc("get_board_posts", { p_limit: 200 }).then(function (res) {
      var rows = res.data || [];
      if (!rows.length) {
        listEl.innerHTML = '<p class="msg">아직 올라온 글이 없어요.</p>';
        return;
      }
      postsById = {};
      rows.forEach(function (p) { postsById[p.id] = p; });
      listEl.innerHTML = rows.map(renderPost).join("");
    }).catch(function () {
      listEl.innerHTML = '<p class="msg">불러오지 못했어요.</p>';
    });
  }

  // 목록 안 클릭을 listEl 하나에 위임: 댓글 펼치기/삭제, 글 삭제를 모두 여기서 처리한다.
  listEl.addEventListener("click", function (e) {
    var commentDeleteBtn = e.target.closest(".board-comment-delete");
    if (commentDeleteBtn) {
      if (!confirm("이 댓글을 삭제할까요?")) return;
      var commentId = commentDeleteBtn.getAttribute("data-comment-id");
      var box = commentDeleteBtn.closest(".board-comments");
      var postId = box.getAttribute("data-post-id");
      client.rpc("admin_delete_board_comment", { p_comment_id: commentId }).then(function () {
        loadComments(postId, box);
        load();
      });
      return;
    }

    var postEl = e.target.closest(".board-post");
    if (!postEl) return;
    var postId = postEl.getAttribute("data-post-id");

    if (e.target.closest(".board-comment-toggle")) {
      var box2 = postEl.querySelector('.board-comments[data-post-id="' + postId + '"]');
      var isOpen = box2.style.display === "block";
      box2.style.display = isOpen ? "none" : "block";
      if (!isOpen) loadComments(postId, box2);
      return;
    }

    if (e.target.closest(".board-post-delete")) {
      if (!confirm("이 글을 삭제할까요? 댓글도 함께 삭제돼요.")) return;
      client.rpc("admin_delete_board_post", { p_post_id: postId }).then(load);
    }
  });

  load();
}

// 교역자용: 전체 오이코스 목록 확인 + 해체(삭제). 본인이 만들지 않은 오이코스도 볼 수 있고 해체할 수 있다
// (delete_group RPC가 "만든 사람 본인이거나 관리자(is_admin)"만 허용하도록 서버에서 확인함)
function loadGroupsAdmin() {
  var client = getClient();
  var listEl = document.getElementById("allGroupsList");
  if (!listEl) return;

  function load() {
    client.rpc("get_all_groups_admin").then(function (res) {
      var items = res.data || [];
      if (!items.length) {
        listEl.innerHTML = '<p class="msg">아직 만들어진 오이코스가 없어요.</p>';
        return;
      }

      function renderGroup(item) {
        var creatorName = item.created_by_real_name || item.created_by_nickname;
        return (
          '<div class="note-item" data-group-id="' + item.id + '">' +
            '<div class="content"><strong>' + escapeHtmlAdmin(item.name) + '</strong>' +
              (item.host_is_teacher ? ' <span style="color:var(--well);font-size:12px;">교사 오이코스</span>' : ' <span style="color:var(--text-soft);font-size:12px;">학생 오이코스</span>') +
              (item.is_hidden ? ' <span style="color:var(--gold);font-size:12px;">🔒 숨김(순위 제외)</span>' : '') +
            '</div>' +
            '<div class="meta">만든 사람: ' + escapeHtmlAdmin(creatorName) +
              ' · 초대코드: ' + escapeHtmlAdmin(item.invite_code) +
              ' · 인원: ' + item.member_count + '명' +
              ' · <strong style="color:var(--gold);">오이코스 곳간 ' + (item.pool || 0) + ' · 개인 달란트 ' + item.total_talents + '</strong>' +
              '<br>생성일: ' + formatDateTime(item.created_at) +
              '<br><span data-members-for="' + item.id + '">멤버 불러오는 중...</span></div>' +
            '<button class="btn ghost" data-action="award-group-points" style="margin-top:8px;padding:6px 14px;font-size:12.5px;color:var(--gold);border-color:var(--gold);">달란트 부여</button>' +
            (CURRENT_IS_ADMIN ?
              '<button class="btn ghost" data-action="disband" style="margin-top:8px;margin-left:6px;padding:6px 14px;font-size:12.5px;">해체</button>'
            : '') +
          '</div>'
        );
      }

      // 교사 오이코스 / 학생 오이코스로 구분해서 보여준다
      var teacherGroups = items.filter(function (item) { return item.host_is_teacher; });
      var studentGroups = items.filter(function (item) { return !item.host_is_teacher; });

      function renderColumn(label, list) {
        if (!list.length) return "";
        return (
          '<div class="scroll-column">' +
            '<div class="scroll-column-title">' + label + ' (' + list.length + '개)</div>' +
            list.map(renderGroup).join("") +
          '</div>'
        );
      }

      listEl.innerHTML =
        '<div class="scroll-columns">' +
          renderColumn("📘 교사 오이코스", teacherGroups) +
          renderColumn("🙋 학생 오이코스", studentGroups) +
        '</div>';

      // 각 오이코스마다 실제 멤버 명단을 따로 불러와서 채운다 (교역자는 get_group_members가
      // 멤버가 아니어도 조회를 허용하도록, 그리고 본명까지 함께 내려주도록 서버에서 별도로 확인함)
      items.forEach(function (item) {
        client.rpc("get_group_members", { p_group_id: item.id }).then(function (res) {
          var el = listEl.querySelector('[data-members-for="' + item.id + '"]');
          if (!el) return;
          var rows = res.data || [];
          if (res.error || !rows.length) {
            el.textContent = "멤버 정보를 불러오지 못했어요.";
            return;
          }
          el.textContent = "멤버: " + rows.map(function (r) {
            return (r.real_name || r.nickname) + (r.is_host ? "👑" : "");
          }).join(", ");
        });
      });

      listEl.querySelectorAll('button[data-action="disband"]').forEach(function (btn) {
        btn.addEventListener("click", function () {
          var groupId = btn.closest(".note-item").getAttribute("data-group-id");
          if (!confirm("이 오이코스를 해체할까요? 멤버십 기록도 함께 사라져요.")) return;
          client.rpc("delete_group", { p_group_id: groupId }).then(function (res) {
            if (res.error) {
              alert("해체에 실패했어요.");
              return;
            }
            load();
          });
        });
      });
      listEl.querySelectorAll('button[data-action="award-group-points"]').forEach(function (btn) {
        btn.addEventListener("click", function () {
          var itemEl = btn.closest(".note-item");
          var groupId = itemEl.getAttribute("data-group-id");
          var groupName = itemEl.querySelector("strong").textContent;
          var targetStr = prompt('"' + groupName + '"에 달란트를 어디로 줄까요?\n\n1 = 오이코스원 개인들에게 (각자 같은 양)\n2 = 공동 곳간(풀)에 한 번에', "1");
          if (targetStr === null) return;
          var toPool = (targetStr.trim() === "2");
          var promptMsg = toPool
            ? '"' + groupName + '" 공동 곳간에 몇 달란트 넣을까요? (음수면 차감)'
            : '"' + groupName + '" 오이코스 전원에게 몇 달란트씩 부여할까요? (음수도 가능해요)';
          var amountStr = prompt(promptMsg);
          if (amountStr === null) return;
          var amount = parseInt(amountStr, 10);
          if (!amount) {
            alert("0이 아닌 숫자를 입력해주세요.");
            return;
          }
          var note = prompt("사유를 남겨주세요 (선택, 안 남겨도 돼요)") || null;
          client.rpc("admin_award_group_points", { p_group_id: groupId, p_points: amount, p_note: note, p_to_pool: toPool }).then(function (res) {
            if (res.error) {
              alert("달란트 부여에 실패했어요.");
              return;
            }
            alert(toPool
              ? "공동 곳간에 " + amount + "달란트를 넣었어요."
              : (res.data || 0) + "명에게 " + amount + "달란트씩 부여했어요.");
            load();
          });
        });
      });
    }).catch(function () {
      listEl.innerHTML = '<p class="msg">목록을 불러오지 못했어요.</p>';
    });
  }

  load();
}

// 교역자·부장 전용: "알림 받기"를 켠 전체 학생에게 즉시 푸시 알림을 보낸다.
// 실제 발송은 Supabase Edge Function(send-push)이 하고, 여기서는 로그인 세션의 JWT를
// Authorization 헤더에 실어 그 함수를 직접 호출한다(함수 쪽에서 교역자·부장인지 다시 확인함).
function initPushBroadcastForm() {
  var form = document.getElementById("pushBroadcastForm");
  var msg = document.getElementById("pushBroadcastMsg");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var title = document.getElementById("pushTitleInput").value.trim();
    var body = document.getElementById("pushBodyInput").value.trim();
    if (!title || !body) {
      msg.textContent = "제목과 내용을 모두 입력해주세요.";
      return;
    }
    if (!confirm("알림을 받도록 설정한 학생 전체에게 지금 바로 발송할까요?")) return;

    msg.textContent = "발송 중...";
    getSession().then(function (session) {
      if (!session) {
        msg.textContent = "로그인이 필요합니다.";
        return;
      }
      fetch(SUPABASE_URL + "/functions/v1/send-push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + session.access_token
        },
        body: JSON.stringify({ title: title, body: body, url: "./" })
      }).then(function (res) {
        return res.json().then(function (data) { return { ok: res.ok, data: data }; });
      }).then(function (result) {
        if (!result.ok) {
          msg.textContent = "발송 실패: " + (result.data && result.data.error ? result.data.error : "알 수 없는 오류");
          return;
        }
        msg.textContent = "발송 완료! " + result.data.sent + "명에게 보냈어요 (구독자 " + result.data.total + "명 중).";
        form.reset();
      }).catch(function () {
        msg.textContent = "네트워크 오류로 발송하지 못했어요.";
      });
    });
  });
}

function initBannerForm(userId) {
  var client = getClient();
  var form = document.getElementById("bannerForm");
  var list = document.getElementById("bannerAdminList");
  if (!form) return;

  function renderView(item) {
    var d = new Date(item.created_at);
    return (
      '<div class="meta">' + (d.getMonth() + 1) + '.' + d.getDate() + '</div>' +
      '<div class="content"><strong>' + escapeHtmlAdmin(item.title) + '</strong>' +
        (item.description ? '<br>' + escapeHtmlAdmin(item.description) : '') +
        (item.link_url ? '<br><span style="color:var(--well);">→ ' + escapeHtmlAdmin(item.link_url) + '</span>' : '') +
      '</div>' +
      '<div style="display:flex;gap:8px;margin-top:8px;">' +
        '<button class="btn ghost" data-action="edit" style="padding:6px 14px;font-size:12.5px;">수정</button>' +
        '<button class="btn ghost" data-action="delete" style="padding:6px 14px;font-size:12.5px;">삭제</button>' +
      '</div>'
    );
  }

  function renderEdit(item) {
    return (
      '<div class="form-row"><input type="text" data-field="title" value="' + escapeHtmlAdmin(item.title) + '"></div>' +
      '<div class="form-row"><input type="text" data-field="description" placeholder="설명(선택)" value="' + escapeHtmlAdmin(item.description || "") + '"></div>' +
      '<div class="form-row"><input type="text" data-field="link_url" placeholder="링크(선택)" value="' + escapeHtmlAdmin(item.link_url || "") + '"></div>' +
      '<div style="display:flex;gap:8px;">' +
        '<button type="button" class="btn" data-action="save" style="padding:6px 14px;font-size:12.5px;">저장</button>' +
        '<button type="button" class="btn ghost" data-action="cancel" style="padding:6px 14px;font-size:12.5px;">취소</button>' +
      '</div>'
    );
  }

  function load() {
    if (!list) return;
    client.from("home_banner").select("*").order("created_at", { ascending: false }).then(function (res) {
      var items = res.data || [];
      if (!items.length) {
        list.innerHTML = '<p class="msg">등록된 이벤트 배너가 없어요. 지금은 홈 화면에 아무것도 안 보여요.</p>';
        return;
      }
      var itemsById = {};
      items.forEach(function (item) { itemsById[item.id] = item; });
      list.innerHTML = items.map(function (item) {
        return '<div class="note-item" data-id="' + item.id + '">' + renderView(item) + '</div>';
      }).join("");

      list.querySelectorAll(".note-item").forEach(function (row) {
        row.addEventListener("click", function (e) {
          var btn = e.target.closest("button[data-action]");
          if (!btn) return;
          var id = row.getAttribute("data-id");
          var item = itemsById[id];
          var action = btn.getAttribute("data-action");

          if (action === "delete") {
            client.from("home_banner").delete().eq("id", id).then(load);
            return;
          }
          if (action === "edit") {
            row.innerHTML = renderEdit(item);
            return;
          }
          if (action === "cancel") {
            row.innerHTML = renderView(item);
            return;
          }
          if (action === "save") {
            var title = row.querySelector('[data-field="title"]').value.trim();
            var description = row.querySelector('[data-field="description"]').value.trim();
            var linkUrl = row.querySelector('[data-field="link_url"]').value.trim();
            if (!title) return;
            client.from("home_banner").update({
              title: title, description: description || null, link_url: linkUrl || null
            }).eq("id", id).then(load);
          }
        });
      });
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var msg = document.getElementById("bannerMsg");
    var title = document.getElementById("bannerTitle").value.trim();
    var description = document.getElementById("bannerDescription").value.trim();
    var linkUrl = document.getElementById("bannerLink").value.trim();
    if (!title) {
      msg.textContent = "제목을 입력해주세요.";
      return;
    }
    client.from("home_banner").insert({
      title: title,
      description: description || null,
      link_url: linkUrl || null,
      created_by: userId
    }).then(function (res) {
      if (res.error) {
        msg.textContent = "등록에 실패했어요.";
        return;
      }
      msg.textContent = "등록되었습니다. 홈 화면 상단에 바로 보여요.";
      form.reset();
      load();
    });
  });

  load();
}

function initAnnouncementForm(userId) {
  var client = getClient();
  var form = document.getElementById("announcementForm");
  var list = document.getElementById("announcementAdminList");
  if (!form) return;

  function renderView(item) {
    var d = new Date(item.created_at);
    return (
      '<div class="meta">' + (d.getMonth() + 1) + '.' + d.getDate() + '</div>' +
      '<div class="content"><strong>' + escapeHtmlAdmin(item.title) + '</strong><br>' + escapeHtmlAdmin(item.content) + '</div>' +
      '<div style="display:flex;gap:8px;margin-top:8px;">' +
        '<button class="btn ghost" data-action="edit" style="padding:6px 14px;font-size:12.5px;">수정</button>' +
        '<button class="btn ghost" data-action="delete" style="padding:6px 14px;font-size:12.5px;">삭제</button>' +
      '</div>'
    );
  }

  function renderEdit(item) {
    return (
      '<div class="form-row"><input type="text" data-field="title" value="' + escapeHtmlAdmin(item.title) + '"></div>' +
      '<div class="form-row"><textarea data-field="content">' + escapeHtmlAdmin(item.content) + '</textarea></div>' +
      '<div style="display:flex;gap:8px;">' +
        '<button type="button" class="btn" data-action="save" style="padding:6px 14px;font-size:12.5px;">저장</button>' +
        '<button type="button" class="btn ghost" data-action="cancel" style="padding:6px 14px;font-size:12.5px;">취소</button>' +
      '</div>'
    );
  }

  function load() {
    if (!list) return;
    client.from("announcements").select("*").order("created_at", { ascending: false }).then(function (res) {
      var items = res.data || [];
      if (!items.length) {
        list.innerHTML = '<p class="msg">등록된 공지사항이 없어요.</p>';
        return;
      }
      var itemsById = {};
      items.forEach(function (item) { itemsById[item.id] = item; });
      list.innerHTML = items.map(function (item) {
        return '<div class="note-item" data-id="' + item.id + '">' + renderView(item) + '</div>';
      }).join("");

      list.querySelectorAll(".note-item").forEach(function (row) {
        row.addEventListener("click", function (e) {
          var btn = e.target.closest("button[data-action]");
          if (!btn) return;
          var id = row.getAttribute("data-id");
          var item = itemsById[id];
          var action = btn.getAttribute("data-action");

          if (action === "delete") {
            client.from("announcements").delete().eq("id", id).then(load);
            return;
          }
          if (action === "edit") {
            row.innerHTML = renderEdit(item);
            return;
          }
          if (action === "cancel") {
            row.innerHTML = renderView(item);
            return;
          }
          if (action === "save") {
            var title = row.querySelector('[data-field="title"]').value.trim();
            var contentText = row.querySelector('[data-field="content"]').value.trim();
            if (!title || !contentText) return;
            client.from("announcements").update({ title: title, content: contentText }).eq("id", id).then(load);
          }
        });
      });
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var msg = document.getElementById("announcementMsg");
    var title = document.getElementById("announcementTitle").value.trim();
    var contentText = document.getElementById("announcementContent").value.trim();
    if (!title || !contentText) {
      msg.textContent = "제목과 내용을 모두 입력해주세요.";
      return;
    }
    client.from("announcements").insert({ title: title, content: contentText, created_by: userId }).then(function (res) {
      if (res.error) {
        msg.textContent = "등록에 실패했어요.";
        return;
      }
      msg.textContent = "등록되었습니다.";
      form.reset();
      load();
    });
  });

  load();
}

function initEventForm(userId) {
  var client = getClient();
  var form = document.getElementById("eventForm");
  var list = document.getElementById("eventAdminList");
  if (!form) return;

  function renderView(item) {
    return (
      '<div class="meta">' + item.event_date + '</div>' +
      '<div class="content"><strong>' + escapeHtmlAdmin(item.title) + '</strong>' +
        (item.description ? '<br>' + escapeHtmlAdmin(item.description) : '') + '</div>' +
      '<div style="display:flex;gap:8px;margin-top:8px;">' +
        '<button class="btn ghost" data-action="edit" style="padding:6px 14px;font-size:12.5px;">수정</button>' +
        '<button class="btn ghost" data-action="delete" style="padding:6px 14px;font-size:12.5px;">삭제</button>' +
      '</div>'
    );
  }

  function renderEdit(item) {
    return (
      '<div class="form-row"><input type="date" data-field="event_date" value="' + escapeHtmlAdmin(item.event_date) + '"></div>' +
      '<div class="form-row"><input type="text" data-field="title" value="' + escapeHtmlAdmin(item.title) + '"></div>' +
      '<div class="form-row"><input type="text" data-field="description" placeholder="설명(선택)" value="' + escapeHtmlAdmin(item.description || "") + '"></div>' +
      '<div style="display:flex;gap:8px;">' +
        '<button type="button" class="btn" data-action="save" style="padding:6px 14px;font-size:12.5px;">저장</button>' +
        '<button type="button" class="btn ghost" data-action="cancel" style="padding:6px 14px;font-size:12.5px;">취소</button>' +
      '</div>'
    );
  }

  function load() {
    if (!list) return;
    client.from("calendar_events").select("*").order("event_date", { ascending: true }).then(function (res) {
      var items = res.data || [];
      if (!items.length) {
        list.innerHTML = '<p class="msg">등록된 일정이 없어요.</p>';
        return;
      }
      var itemsById = {};
      items.forEach(function (item) { itemsById[item.id] = item; });
      list.innerHTML = items.map(function (item) {
        return '<div class="note-item" data-id="' + item.id + '">' + renderView(item) + '</div>';
      }).join("");

      list.querySelectorAll(".note-item").forEach(function (row) {
        row.addEventListener("click", function (e) {
          var btn = e.target.closest("button[data-action]");
          if (!btn) return;
          var id = row.getAttribute("data-id");
          var item = itemsById[id];
          var action = btn.getAttribute("data-action");

          if (action === "delete") {
            client.from("calendar_events").delete().eq("id", id).then(load);
            return;
          }
          if (action === "edit") {
            row.innerHTML = renderEdit(item);
            return;
          }
          if (action === "cancel") {
            row.innerHTML = renderView(item);
            return;
          }
          if (action === "save") {
            var date = row.querySelector('[data-field="event_date"]').value;
            var title = row.querySelector('[data-field="title"]').value.trim();
            var description = row.querySelector('[data-field="description"]').value.trim();
            if (!date || !title) return;
            client.from("calendar_events").update({
              event_date: date, title: title, description: description || null
            }).eq("id", id).then(load);
          }
        });
      });
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var msg = document.getElementById("eventMsg");
    var date = document.getElementById("eventDate").value;
    var title = document.getElementById("eventTitle").value.trim();
    var description = document.getElementById("eventDescription").value.trim();
    if (!date || !title) {
      msg.textContent = "날짜와 제목을 입력해주세요.";
      return;
    }
    client.from("calendar_events").insert({
      event_date: date, title: title, description: description || null, created_by: userId
    }).then(function (res) {
      if (res.error) {
        msg.textContent = "등록에 실패했어요.";
        return;
      }
      msg.textContent = "등록되었습니다.";
      form.reset();
      load();
    });
  });

  load();
}

function initQuizForm(userId) {
  var client = getClient();
  var form = document.getElementById("quizForm");
  var list = document.getElementById("quizAdminList");
  var correctPicker = document.getElementById("quizCorrectPicker");
  if (!form) return;

  var selectedCorrect = 1;

  if (correctPicker) {
    correctPicker.querySelectorAll("button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        correctPicker.querySelectorAll("button").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        selectedCorrect = parseInt(btn.getAttribute("data-option"), 10);
      });
    });
  }

  function quizRevealBadge(item) {
    // week_start(월요일) + 2일 = 공개되는 수요일, + 3일 = 마지막 참여 가능일인 목요일.
    // 그 이후(금요일부터)는 "종료"로 표시한다.
    // (toISOString()은 UTC 기준으로 바뀌어서 한국 시간 자정 근처엔 하루 밀려 보일 수 있어 로컬 날짜 성분만 비교한다)
    var revealDate = new Date(item.week_start + "T00:00:00");
    revealDate.setDate(revealDate.getDate() + 2);
    var closeDate = new Date(item.week_start + "T00:00:00");
    closeDate.setDate(closeDate.getDate() + 3);
    var localDateStr = function (d) {
      return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    };
    var todayStr = localDateStr(new Date());
    var revealStr = revealDate.getFullYear() + "." + String(revealDate.getMonth() + 1).padStart(2, "0") + "." + String(revealDate.getDate()).padStart(2, "0");
    if (todayStr < localDateStr(revealDate)) {
      return '<span style="color:var(--text-soft);">' + revealStr + '(수) 공개 예정</span>';
    }
    if (todayStr > localDateStr(closeDate)) {
      return '<span style="color:var(--text-soft);">종료 (' + revealStr + ' 주)</span>';
    }
    return '<span style="color:var(--well);font-weight:700;">공개중</span>';
  }

  function renderView(item) {
    var options = [item.option1, item.option2, item.option3, item.option4];
    var optionsHtml = options.map(function (opt, i) {
      var num = i + 1;
      var isCorrect = num === item.correct_option;
      return (
        '<div' + (isCorrect ? ' style="color:var(--well);font-weight:700;"' : '') + '>' +
          num + '. ' + escapeHtmlAdmin(opt) + (isCorrect ? ' ✓' : '') +
        '</div>'
      );
    }).join("");
    return (
      '<div class="content"><strong>' + escapeHtmlAdmin(item.question) + '</strong></div>' +
      '<div class="meta" style="margin-top:6px;">' + optionsHtml + '</div>' +
      '<div class="meta" style="margin-top:6px;">' + quizRevealBadge(item) + '</div>' +
      '<div style="display:flex;gap:8px;margin-top:8px;">' +
        '<button class="btn ghost" data-action="edit" style="padding:6px 14px;font-size:12.5px;">수정</button>' +
        '<button class="btn ghost" data-action="delete" style="padding:6px 14px;font-size:12.5px;">삭제</button>' +
      '</div>'
    );
  }

  function renderEdit(item) {
    var pickerBtns = [1, 2, 3, 4].map(function (n) {
      return '<button type="button"' + (n === item.correct_option ? ' class="active"' : '') +
        ' data-correct="' + n + '">' + n + '번</button>';
    }).join("");
    return (
      '<div class="form-row"><textarea data-field="question">' + escapeHtmlAdmin(item.question) + '</textarea></div>' +
      '<div class="form-row"><input type="text" data-field="option1" value="' + escapeHtmlAdmin(item.option1) + '"></div>' +
      '<div class="form-row"><input type="text" data-field="option2" value="' + escapeHtmlAdmin(item.option2) + '"></div>' +
      '<div class="form-row"><input type="text" data-field="option3" value="' + escapeHtmlAdmin(item.option3) + '"></div>' +
      '<div class="form-row"><input type="text" data-field="option4" value="' + escapeHtmlAdmin(item.option4) + '"></div>' +
      '<div class="form-row"><label>정답</label><div class="pill-toggle">' + pickerBtns + '</div></div>' +
      '<div style="display:flex;gap:8px;">' +
        '<button type="button" class="btn" data-action="save" style="padding:6px 14px;font-size:12.5px;">저장</button>' +
        '<button type="button" class="btn ghost" data-action="cancel" style="padding:6px 14px;font-size:12.5px;">취소</button>' +
      '</div>'
    );
  }

  function load() {
    if (!list) return;
    client.from("quiz_questions").select("*").order("created_at", { ascending: false }).then(function (res) {
      var items = res.data || [];
      if (!items.length) {
        list.innerHTML = '<p class="msg">등록된 퀴즈가 없어요.</p>';
        return;
      }
      var itemsById = {};
      items.forEach(function (item) { itemsById[item.id] = item; });
      list.innerHTML = items.map(function (item) {
        return '<div class="note-item" data-id="' + item.id + '">' + renderView(item) + '</div>';
      }).join("");

      list.querySelectorAll(".note-item").forEach(function (row) {
        var editingCorrect = null;

        row.addEventListener("click", function (e) {
          var id = row.getAttribute("data-id");
          var item = itemsById[id];

          var correctBtn = e.target.closest("button[data-correct]");
          if (correctBtn) {
            editingCorrect = parseInt(correctBtn.getAttribute("data-correct"), 10);
            row.querySelectorAll("button[data-correct]").forEach(function (b) {
              b.classList.toggle("active", b === correctBtn);
            });
            return;
          }

          var btn = e.target.closest("button[data-action]");
          if (!btn) return;
          var action = btn.getAttribute("data-action");

          if (action === "delete") {
            if (!confirm("이 퀴즈를 삭제할까요?")) return;
            client.from("quiz_questions").delete().eq("id", id).then(load);
            return;
          }
          if (action === "edit") {
            editingCorrect = item.correct_option;
            row.innerHTML = renderEdit(item);
            return;
          }
          if (action === "cancel") {
            row.innerHTML = renderView(item);
            return;
          }
          if (action === "save") {
            var question = row.querySelector('[data-field="question"]').value.trim();
            var opts = [1, 2, 3, 4].map(function (n) {
              return row.querySelector('[data-field="option' + n + '"]').value.trim();
            });
            if (!question || opts.some(function (o) { return !o; })) return;
            client.from("quiz_questions").update({
              question: question,
              option1: opts[0], option2: opts[1], option3: opts[2], option4: opts[3],
              correct_option: editingCorrect
            }).eq("id", id).then(load);
          }
        });
      });
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var msg = document.getElementById("quizMsg");
    var question = document.getElementById("quizQuestion").value.trim();
    var options = [
      document.getElementById("quizOption1").value.trim(),
      document.getElementById("quizOption2").value.trim(),
      document.getElementById("quizOption3").value.trim(),
      document.getElementById("quizOption4").value.trim()
    ];
    if (!question || options.some(function (o) { return !o; })) {
      msg.textContent = "문제와 보기 4개를 모두 입력해주세요.";
      return;
    }
    // 언제 등록하든(미리 등록해도) "가장 가까운 다음 수요일"에 공개되도록 week_start를 계산한다.
    // 예: 토요일에 등록 -> 4일 뒤 수요일이 속한 주의 월요일을 week_start로 저장.
    var todayDate = new Date();
    var day = todayDate.getDay(); // 0=일 ... 6=토
    var diffToWed = (3 - day + 7) % 7; // 오늘부터 다음(또는 오늘) 수요일까지 남은 일수
    var targetWed = new Date(todayDate);
    targetWed.setDate(todayDate.getDate() + diffToWed);
    var weekStart = new Date(targetWed);
    weekStart.setDate(targetWed.getDate() - 2);
    var weekStartStr = weekStart.getFullYear() + "-" + String(weekStart.getMonth() + 1).padStart(2, "0") + "-" + String(weekStart.getDate()).padStart(2, "0");

    client.from("quiz_questions").insert({
      week_start: weekStartStr,
      question: question,
      option1: options[0],
      option2: options[1],
      option3: options[2],
      option4: options[3],
      correct_option: selectedCorrect,
      created_by: userId
    }).then(function (res) {
      if (res.error) {
        msg.textContent = "등록에 실패했어요.";
        return;
      }
      msg.textContent = "등록되었습니다.";
      form.reset();
      load();
    });
  });

  load();
}

// ===== 달란트 상점 관리 =====
function initShopAdmin(userId) {
  var client = getClient();
  var form = document.getElementById("shopItemForm");
  var itemListEl = document.getElementById("shopItemList");
  var orderListEl = document.getElementById("shopOrderList");
  var suggestListEl = document.getElementById("shopSuggestList");
  if (!client || !form || !itemListEl || !orderListEl) return;

  var msg = document.getElementById("shopItemMsg");
  var nameEl = document.getElementById("shopItemName");
  var descEl = document.getElementById("shopItemDesc");
  var costEl = document.getElementById("shopItemCost");
  var priceWonEl = document.getElementById("shopItemPriceWon");
  var stockEl = document.getElementById("shopItemStock");
  var isOikosEl = document.getElementById("shopItemIsOikos");

  function wonLabel(w) {
    if (w == null || w === "") return "";
    var n = Number(w);
    if (!n) return "";
    if (n >= 10000 && n % 10000 === 0) return (n / 10000) + "만원";
    return n.toLocaleString() + "원";
  }

  var SHOP_ADMIN_STATUS = {
    pending: "확인 중", approved: "승인됨", delivered: "전달 완료", rejected: "거절됨"
  };

  function loadItems() {
    client.rpc("get_shop_items", { p_all: true }).then(function (res) {
      if (res.error) { itemListEl.innerHTML = '<p class="msg">불러오지 못했어요.</p>'; return; }
      var rows = res.data || [];
      if (!rows.length) { itemListEl.innerHTML = '<p class="msg">등록된 상품이 없어요.</p>'; return; }
      itemListEl.innerHTML = rows.map(function (it) {
        return (
          '<div class="note-item" data-item-id="' + it.id + '">' +
            '<div class="content"><strong>' + escapeHtmlAdmin(it.name) + '</strong> · ' + it.cost + '달란트' +
              (it.price_won ? ' · ' + wonLabel(it.price_won) + ' 상당' : '') +
              (it.stock == null ? ' · 무제한' : ' · 수량 ' + it.stock) +
              (it.is_oikos ? ' · <span style="color:var(--well);">오이코스 곳간용</span>' : '') +
              (it.is_active ? '' : ' · <span style="color:#b3432c;">비활성</span>') + '</div>' +
            (it.description ? '<div class="meta" style="margin-top:2px;">' + escapeHtmlAdmin(it.description) + '</div>' : '') +
            '<div style="display:flex;gap:8px;margin-top:8px;">' +
              '<button type="button" class="btn ghost" data-act="toggle" style="padding:6px 12px;font-size:12px;">' + (it.is_active ? '비활성화' : '활성화') + '</button>' +
              '<button type="button" class="btn ghost" data-act="delete" style="padding:6px 12px;font-size:12px;">삭제</button>' +
            '</div>' +
          '</div>'
        );
      }).join("");

      itemListEl.querySelectorAll("[data-act]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var wrap = btn.closest(".note-item");
          var id = wrap.getAttribute("data-item-id");
          var act = btn.getAttribute("data-act");
          if (act === "delete") {
            if (!confirm("이 상품을 삭제할까요? (이미 신청된 교환 내역은 남아요)")) return;
            client.from("shop_items").delete().eq("id", id).then(loadItems);
          } else {
            var makeActive = btn.textContent === "활성화";
            client.from("shop_items").update({ is_active: makeActive }).eq("id", id).then(loadItems);
          }
        });
      });
    });
  }

  function loadOrders() {
    client.rpc("get_shop_orders_admin").then(function (res) {
      if (res.error) { orderListEl.innerHTML = '<p class="msg">불러오지 못했어요.</p>'; return; }
      var rows = res.data || [];
      if (!rows.length) { orderListEl.innerHTML = '<p class="msg">교환 요청이 없어요.</p>'; return; }
      orderListEl.innerHTML = rows.map(function (o) {
        var who = escapeHtmlAdmin(o.nickname || "?") + (o.real_name ? "(" + escapeHtmlAdmin(o.real_name) + ")" : "");
        var actions = "";
        if (o.status === "pending") {
          actions =
            '<button type="button" class="btn" data-act="approve" style="padding:6px 12px;font-size:12px;">승인</button>' +
            '<button type="button" class="btn ghost" data-act="reject" style="padding:6px 12px;font-size:12px;">거절</button>';
        } else if (o.status === "approved") {
          actions =
            '<button type="button" class="btn" data-act="deliver" style="padding:6px 12px;font-size:12px;">전달 완료</button>' +
            '<button type="button" class="btn ghost" data-act="reject" style="padding:6px 12px;font-size:12px;">거절(환불)</button>';
        }
        return (
          '<div class="note-item" data-order-id="' + o.id + '">' +
            '<div class="meta">' + formatDateTime(o.created_at) + ' · ' + who + ' · ' +
              '<strong>' + (SHOP_ADMIN_STATUS[o.status] || o.status) + '</strong></div>' +
            '<div class="content"><strong>' + escapeHtmlAdmin(o.item_name) + '</strong> · ' + o.cost_snapshot + '달란트</div>' +
            (o.student_note ? '<div class="meta" style="margin-top:2px;">학생: ' + escapeHtmlAdmin(o.student_note) + '</div>' : '') +
            (o.admin_note ? '<div class="meta" style="margin-top:2px;">메모: ' + escapeHtmlAdmin(o.admin_note) + '</div>' : '') +
            (actions ? '<div style="display:flex;gap:8px;margin-top:8px;">' + actions + '</div>' : '') +
          '</div>'
        );
      }).join("");

      orderListEl.querySelectorAll("[data-act]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = btn.closest(".note-item").getAttribute("data-order-id");
          var act = btn.getAttribute("data-act");
          var note = null;
          if (act === "reject") {
            if (!confirm("이 교환 요청을 거절할까요? 달란트는 학생에게 돌아가요.")) return;
            note = prompt("거절 사유 (선택)") || null;
          }
          btn.disabled = true;
          client.rpc("decide_shop_order", { p_order_id: Number(id), p_action: act, p_note: note }).then(function (res) {
            btn.disabled = false;
            if (res.error) { alert(res.error.message || "처리에 실패했어요."); return; }
            loadOrders(); loadItems();
          }).catch(function () { btn.disabled = false; alert("처리에 실패했어요."); });
        });
      });
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = (nameEl.value || "").trim();
    var cost = parseInt(costEl.value, 10);
    if (!name || !cost || cost < 1) { msg.textContent = "이름과 필요 달란트(1 이상)를 입력해주세요."; return; }
    var stockRaw = (stockEl.value || "").trim();
    var stock = stockRaw === "" ? null : parseInt(stockRaw, 10);
    msg.textContent = "등록 중...";
    var priceWonRaw = (priceWonEl && priceWonEl.value || "").trim();
    client.from("shop_items").insert({
      name: name,
      description: (descEl.value || "").trim() || null,
      cost: cost,
      price_won: priceWonRaw === "" ? null : parseInt(priceWonRaw, 10),
      stock: stock,
      is_oikos: !!(isOikosEl && isOikosEl.checked)
    }).then(function (res) {
      if (res.error) { msg.textContent = "등록에 실패했어요."; return; }
      msg.textContent = "등록되었습니다.";
      form.reset();
      loadItems();
    });
  });

  var SUGGEST_LABELS = { open: "접수됨", reviewing: "검토 중", added: "추가함", declined: "반려" };

  function loadSuggestions() {
    if (!suggestListEl) return;
    client.rpc("get_shop_suggestions_admin").then(function (res) {
      if (res.error) { suggestListEl.innerHTML = '<p class="msg">불러오지 못했어요.</p>'; return; }
      var rows = res.data || [];
      if (!rows.length) { suggestListEl.innerHTML = '<p class="msg">받은 추천이 없어요.</p>'; return; }
      suggestListEl.innerHTML = rows.map(function (s) {
        var who = escapeHtmlAdmin(s.nickname || "?");
        return (
          '<div class="note-item" data-suggest-id="' + s.id + '">' +
            '<div class="meta">' + formatDateTime(s.created_at) + ' · ' + who + ' · <strong>' + (SUGGEST_LABELS[s.status] || s.status) + '</strong></div>' +
            '<div class="content">' + escapeHtmlAdmin(s.content) + '</div>' +
            (s.admin_note ? '<div class="meta" style="margin-top:2px;">메모: ' + escapeHtmlAdmin(s.admin_note) + '</div>' : '') +
            '<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;">' +
              '<button type="button" class="btn ghost" data-sg="reviewing" style="padding:6px 12px;font-size:12px;">검토 중</button>' +
              '<button type="button" class="btn" data-sg="added" style="padding:6px 12px;font-size:12px;">추가함</button>' +
              '<button type="button" class="btn ghost" data-sg="declined" style="padding:6px 12px;font-size:12px;">반려</button>' +
            '</div>' +
          '</div>'
        );
      }).join("");

      suggestListEl.querySelectorAll("[data-sg]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = btn.closest(".note-item").getAttribute("data-suggest-id");
          var st = btn.getAttribute("data-sg");
          var note = null;
          if (st === "declined" || st === "added") note = prompt("학생에게 보여줄 메모 (선택)") || null;
          btn.disabled = true;
          client.rpc("update_shop_suggestion", { p_id: Number(id), p_status: st, p_note: note }).then(function (res) {
            btn.disabled = false;
            if (res.error) { alert(res.error.message || "처리에 실패했어요."); return; }
            loadSuggestions();
          }).catch(function () { btn.disabled = false; alert("처리에 실패했어요."); });
        });
      });
    });
  }

  loadItems();
  loadOrders();
  loadSuggestions();
}

// ===== 오이코스 회식비 지원 승인 =====
// 친구초청잔치(9/13) 초청 명단: 누가 누굴 적었는지 초청자별로 묶어서 보여주고,
// 잔치날 실제로 온 친구는 "왔어요"로 체크할 수 있다.
function loadChodaeInvitesAdmin() {
  var client = getClient();
  var el = document.getElementById("chodaeInvitesAdminList");
  if (!client || !el) return;

  client.rpc("get_friend_invites_admin").then(function (res) {
    if (res.error) { el.innerHTML = '<p class="msg">불러오지 못했어요.</p>'; return; }
    var rows = res.data || [];
    if (!rows.length) { el.innerHTML = '<p class="msg">아직 등록된 초청 명단이 없어요.</p>'; return; }

    var total = rows.length;
    var cameCount = rows.filter(function (r) { return r.came; }).length;

    // 초청자별로 그룹핑 (nickname 기준, 순서 유지)
    var groups = [];
    var byKey = {};
    rows.forEach(function (r) {
      var key = (r.inviter_nickname || "(알 수 없음)") + "|" + (r.inviter_real_name || "");
      if (!byKey[key]) {
        byKey[key] = { nickname: r.inviter_nickname || "(알 수 없음)", real_name: r.inviter_real_name || "", items: [] };
        groups.push(byKey[key]);
      }
      byKey[key].items.push(r);
    });

    var header =
      '<p class="msg" style="margin-top:0;">초청자 ' + groups.length + '명 · 초청 작정 ' + total + '명 · 잔치에 온 친구 <strong style="color:var(--well);">' + cameCount + '명</strong></p>';

    var body = groups.map(function (g) {
      var who = escapeHtmlAdmin(g.nickname) + (g.real_name ? ' <span style="color:var(--text-soft);font-size:12px;">(' + escapeHtmlAdmin(g.real_name) + ')</span>' : '');
      var friends = g.items.map(function (r) {
        return (
          '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:6px 0;">' +
            '<span style="overflow-wrap:anywhere;">' + (r.came ? '🎉 ' : '· ') + escapeHtmlAdmin(r.friend_name) + '</span>' +
            '<button type="button" class="btn ' + (r.came ? '' : 'ghost') + '" data-came-id="' + r.id + '" data-came="' + (r.came ? '1' : '0') + '" style="padding:5px 12px;font-size:12px;white-space:nowrap;">' +
              (r.came ? '왔어요 ✓' : '왔어요 체크') +
            '</button>' +
          '</div>'
        );
      }).join("");
      return (
        '<div class="note-item">' +
          '<div class="content"><strong>' + who + '</strong> <span style="color:var(--text-soft);font-size:12px;">· ' + g.items.length + '명</span></div>' +
          '<div style="margin-top:4px;">' + friends + '</div>' +
        '</div>'
      );
    }).join("");

    el.innerHTML = header + body;

    el.querySelectorAll("[data-came-id]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = Number(btn.getAttribute("data-came-id"));
        var next = btn.getAttribute("data-came") === "1" ? false : true;
        btn.disabled = true;
        client.rpc("set_friend_invite_came", { p_id: id, p_came: next }).then(function (res) {
          btn.disabled = false;
          if (res.error) { alert(res.error.message || "처리에 실패했어요."); return; }
          loadChodaeInvitesAdmin();
        }).catch(function () { btn.disabled = false; alert("처리에 실패했어요."); });
      });
    });
  }).catch(function () {
    el.innerHTML = '<p class="msg">불러오지 못했어요.</p>';
  });
}

function loadOikosExpensesAdmin() {
  var client = getClient();
  var el = document.getElementById("oikosExpenseAdminList");
  if (!client || !el) return;

  var LABELS = { pending: "확인 중", approved: "승인됨", paid: "지급 완료", rejected: "거절됨" };

  client.rpc("get_oikos_expenses_admin").then(function (res) {
    if (res.error) { el.innerHTML = '<p class="msg">불러오지 못했어요.</p>'; return; }
    var rows = res.data || [];
    if (!rows.length) { el.innerHTML = '<p class="msg">회식비 지원 신청이 없어요.</p>'; return; }
    el.innerHTML = rows.map(function (r) {
      var actions = "";
      if (r.status === "pending") {
        actions =
          '<button type="button" class="btn" data-ox="approve" style="padding:6px 12px;font-size:12px;">승인</button>' +
          '<button type="button" class="btn ghost" data-ox="reject" style="padding:6px 12px;font-size:12px;">거절</button>';
      } else if (r.status === "approved") {
        actions =
          '<button type="button" class="btn" data-ox="pay" style="padding:6px 12px;font-size:12px;">지급 완료</button>' +
          '<button type="button" class="btn ghost" data-ox="reject" style="padding:6px 12px;font-size:12px;">거절</button>';
      }
      return (
        '<div class="note-item" data-ox-id="' + r.id + '">' +
          '<div class="meta">' + formatDateTime(r.created_at) + ' · ' + escapeHtmlAdmin(r.group_name || "") +
            ' · ' + escapeHtmlAdmin(r.requester_nickname || "") + ' · <strong>' + (LABELS[r.status] || r.status) + '</strong></div>' +
          '<div class="content"><strong>' + r.amount + '달란트</strong> · ' + escapeHtmlAdmin(r.purpose) + '</div>' +
          (r.admin_note ? '<div class="meta" style="margin-top:2px;">메모: ' + escapeHtmlAdmin(r.admin_note) + '</div>' : '') +
          (actions ? '<div style="display:flex;gap:8px;margin-top:8px;">' + actions + '</div>' : '') +
        '</div>'
      );
    }).join("");

    el.querySelectorAll("[data-ox]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.closest(".note-item").getAttribute("data-ox-id");
        var act = btn.getAttribute("data-ox");
        var note = null;
        if (act === "reject") {
          if (!confirm("이 회식비 지원 신청을 거절할까요?")) return;
          note = prompt("거절 사유 (선택)") || null;
        } else if (act === "approve") {
          note = prompt("메모 (선택, 신청 교사에게 보여요)") || null;
        }
        btn.disabled = true;
        client.rpc("decide_oikos_expense", { p_id: Number(id), p_action: act, p_note: note }).then(function (res) {
          btn.disabled = false;
          if (res.error) { alert(res.error.message || "처리에 실패했어요."); return; }
          loadOikosExpensesAdmin();
        }).catch(function () { btn.disabled = false; alert("처리에 실패했어요."); });
      });
    });
  });
}
