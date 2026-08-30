// 관리자 전용: 공지사항 작성, 이달의 일정 추가
// auth.js의 getClient(), getSession()에 의존함

function checkIsAdmin(userId) {
  var client = getClient();
  if (!client) return Promise.resolve(false);
  return client.from("profiles").select("is_admin").eq("user_id", userId).single().then(function (res) {
    return !!(res.data && res.data.is_admin);
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
    checkIsAdmin(session.user.id).then(function (isAdmin) {
      if (!isAdmin) {
        gate.innerHTML = '<p>교역자만 접근할 수 있는 페이지예요.</p>';
        return;
      }
      gate.style.display = "none";
      content.style.display = "block";
      initBannerForm(session.user.id);
      initAnnouncementForm(session.user.id);
      initEventForm(session.user.id);
      initQuizForm(session.user.id);
      loadMemberList();
      loadAllNotes();
      loadGroupsAdmin();
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

var ADMIN_NOTE_LABELS = { greeting: "하루 인사", gratitude: "감사노트", prayer: "기도제목" };

function loadMemberList() {
  var client = getClient();
  var countEl = document.getElementById("memberCount");
  var listEl = document.getElementById("memberList");
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
          '<div class="content">' +
            '<strong>' + escapeHtmlAdmin(m.nickname) + '</strong>' +
            (m.is_admin ? ' <span style="color:var(--gold);font-size:12px;">교역자</span>' : '') +
            (m.is_teacher && !m.is_admin ? ' <span style="color:var(--well);font-size:12px;">교사</span>' : '') +
            ' <span style="color:var(--well);font-size:12px;font-weight:700;">' + m.total_points + '점</span>' +
            '<br>' + (m.real_name ? '본명: ' + escapeHtmlAdmin(m.real_name) + ' · ' : '') + escapeHtmlAdmin(m.email) +
          '</div>' +
          '<div class="meta">가입: ' + formatDateTime(m.joined_at) +
            ' · 최근 접속: ' + (lastSeen || "기록 없음") +
            '<br>최근 기록: ' + lastNote + '</div>' +
          '<button type="button" class="btn ghost" data-action="toggle-teacher" data-is-teacher="' + m.is_teacher + '" style="margin-top:8px;padding:6px 14px;font-size:12.5px;">' +
            (m.is_teacher ? "교사 해제" : "교사로 지정") +
          '</button>' +
          '<button type="button" class="btn ghost" data-action="award-points" style="margin-top:8px;margin-left:6px;padding:6px 14px;font-size:12.5px;color:var(--gold);border-color:var(--gold);">포인트 부여</button>' +
          (m.is_admin ? '' :
            '<button type="button" class="btn ghost" data-action="delete-user" style="margin-top:8px;margin-left:6px;padding:6px 14px;font-size:12.5px;color:#b3432c;border-color:#b3432c;">탈퇴시키기</button>'
          ) +
        '</div>'
      );
    }

    // 교역자 / 교사 / 학생으로 구분해서 보여준다 (한눈에 누가 어떤 역할인지 알아볼 수 있게)
    var admins = members.filter(function (m) { return m.is_admin; });
    var teachers = members.filter(function (m) { return m.is_teacher && !m.is_admin; });
    var students = members.filter(function (m) { return !m.is_teacher && !m.is_admin; });

    function renderSection(label, list) {
      if (!list.length) return "";
      return (
        '<div class="well-label" style="margin-top:18px;">' + label + ' (' + list.length + '명)</div>' +
        list.map(renderMember).join("")
      );
    }

    listEl.innerHTML =
      renderSection("🌟 교역자", admins) +
      renderSection("📘 교사", teachers) +
      renderSection("🙋 학생", students);

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

    listEl.querySelectorAll('button[data-action="award-points"]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        var itemEl = btn.closest(".note-item");
        var targetUserId = itemEl.getAttribute("data-user-id");
        var amountStr = prompt("몇 점을 부여할까요? (보정하려면 음수도 가능해요, 예: -2)");
        if (amountStr === null) return;
        var amount = parseInt(amountStr, 10);
        if (!amount) {
          alert("0이 아닌 숫자를 입력해주세요.");
          return;
        }
        var note = prompt("사유를 남겨주세요 (선택, 안 남겨도 돼요)") || null;
        client.rpc("admin_award_points", { p_user_id: targetUserId, p_points: amount, p_note: note }).then(function (res) {
          if (res.error) {
            alert("포인트 부여에 실패했어요.");
            return;
          }
          loadMemberList();
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
          '출석·감사노트·기도제목·포인트 등 모든 기록이 함께 삭제되고 되돌릴 수 없어요.\n' +
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
  }).catch(function () {
    listEl.innerHTML = '<p class="msg">회원 목록을 불러오지 못했어요.</p>';
  });
}

function loadAllNotes() {
  var client = getClient();
  var listEl = document.getElementById("allNotesList");
  if (!listEl) return;

  function load() {
    client.rpc("get_all_notes_admin", { p_limit: 200 }).then(function (res) {
      var items = res.data || [];
      if (!items.length) {
        listEl.innerHTML = '<p class="msg">아직 기록이 없어요.</p>';
        return;
      }

      function renderNote(item) {
        return (
          '<div class="note-item">' +
            '<div class="meta">' + escapeHtmlAdmin(item.nickname) + ' · ' + ADMIN_NOTE_LABELS[item.type] + ' · ' + formatDateTime(item.created_at) + '</div>' +
            '<div class="content">' + escapeHtmlAdmin(item.content) + '</div>' +
            '<button class="btn ghost" data-note-id="' + item.id + '" style="margin-top:8px;padding:6px 14px;font-size:12.5px;">삭제</button>' +
          '</div>'
        );
      }

      // 감사노트 / 기도제목 / 하루인사로 구분해서 보여준다
      var byType = { gratitude: [], prayer: [], greeting: [] };
      items.forEach(function (item) {
        if (byType[item.type]) byType[item.type].push(item);
      });

      function renderSection(typeKey, icon) {
        var list = byType[typeKey];
        if (!list.length) return "";
        return (
          '<div class="well-label" style="margin-top:18px;">' + icon + ' ' + ADMIN_NOTE_LABELS[typeKey] + ' (' + list.length + '건)</div>' +
          list.map(renderNote).join("")
        );
      }

      listEl.innerHTML =
        renderSection("gratitude", "🙏") +
        renderSection("prayer", "🕊️") +
        renderSection("greeting", "🙋");

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
        return (
          '<div class="note-item" data-group-id="' + item.id + '">' +
            '<div class="content"><strong>' + escapeHtmlAdmin(item.name) + '</strong>' +
              (item.host_is_teacher ? ' <span style="color:var(--well);font-size:12px;">교사 오이코스</span>' : ' <span style="color:var(--text-soft);font-size:12px;">학생 오이코스</span>') +
            '</div>' +
            '<div class="meta">만든 사람: ' + escapeHtmlAdmin(item.created_by_nickname) +
              ' · 초대코드: ' + escapeHtmlAdmin(item.invite_code) +
              ' · 인원: ' + item.member_count + '명' +
              '<br>생성일: ' + formatDateTime(item.created_at) + '</div>' +
            '<button class="btn ghost" data-action="award-group-points" style="margin-top:8px;padding:6px 14px;font-size:12.5px;color:var(--gold);border-color:var(--gold);">포인트 부여</button>' +
            '<button class="btn ghost" data-action="disband" style="margin-top:8px;margin-left:6px;padding:6px 14px;font-size:12.5px;">해체</button>' +
          '</div>'
        );
      }

      // 교사 오이코스 / 학생 오이코스로 구분해서 보여준다
      var teacherGroups = items.filter(function (item) { return item.host_is_teacher; });
      var studentGroups = items.filter(function (item) { return !item.host_is_teacher; });

      function renderSection(label, list) {
        if (!list.length) return "";
        return (
          '<div class="well-label" style="margin-top:18px;">' + label + ' (' + list.length + '개)</div>' +
          list.map(renderGroup).join("")
        );
      }

      listEl.innerHTML =
        renderSection("📘 교사 오이코스", teacherGroups) +
        renderSection("🙋 학생 오이코스", studentGroups);

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
          var amountStr = prompt('"' + groupName + '" 오이코스 전원에게 몇 점씩 부여할까요? (음수도 가능해요)');
          if (amountStr === null) return;
          var amount = parseInt(amountStr, 10);
          if (!amount) {
            alert("0이 아닌 숫자를 입력해주세요.");
            return;
          }
          var note = prompt("사유를 남겨주세요 (선택, 안 남겨도 돼요)") || null;
          client.rpc("admin_award_group_points", { p_group_id: groupId, p_points: amount, p_note: note }).then(function (res) {
            if (res.error) {
              alert("포인트 부여에 실패했어요.");
              return;
            }
            alert((res.data || 0) + "명에게 " + amount + "점씩 부여했어요.");
          });
        });
      });
    }).catch(function () {
      listEl.innerHTML = '<p class="msg">목록을 불러오지 못했어요.</p>';
    });
  }

  load();
}

function initBannerForm(userId) {
  var client = getClient();
  var form = document.getElementById("bannerForm");
  var list = document.getElementById("bannerAdminList");
  if (!form) return;

  function load() {
    if (!list) return;
    client.from("home_banner").select("*").order("created_at", { ascending: false }).then(function (res) {
      var items = res.data || [];
      if (!items.length) {
        list.innerHTML = '<p class="msg">등록된 이벤트 배너가 없어요. 지금은 홈 화면에 아무것도 안 보여요.</p>';
        return;
      }
      list.innerHTML = items.map(function (item) {
        var d = new Date(item.created_at);
        return (
          '<div class="note-item">' +
            '<div class="meta">' + (d.getMonth() + 1) + '.' + d.getDate() + '</div>' +
            '<div class="content"><strong>' + escapeHtmlAdmin(item.title) + '</strong>' +
              (item.description ? '<br>' + escapeHtmlAdmin(item.description) : '') +
              (item.link_url ? '<br><span style="color:var(--well);">→ ' + escapeHtmlAdmin(item.link_url) + '</span>' : '') +
            '</div>' +
            '<button class="btn ghost" data-id="' + item.id + '" style="margin-top:8px;padding:6px 14px;font-size:12.5px;">삭제</button>' +
          '</div>'
        );
      }).join("");
      list.querySelectorAll("button[data-id]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          client.from("home_banner").delete().eq("id", btn.getAttribute("data-id")).then(load);
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

  function load() {
    if (!list) return;
    client.from("announcements").select("*").order("created_at", { ascending: false }).then(function (res) {
      var items = res.data || [];
      if (!items.length) {
        list.innerHTML = '<p class="msg">등록된 공지사항이 없어요.</p>';
        return;
      }
      list.innerHTML = items.map(function (item) {
        var d = new Date(item.created_at);
        return (
          '<div class="note-item">' +
            '<div class="meta">' + (d.getMonth() + 1) + '.' + d.getDate() + '</div>' +
            '<div class="content"><strong>' + escapeHtmlAdmin(item.title) + '</strong><br>' + escapeHtmlAdmin(item.content) + '</div>' +
            '<button class="btn ghost" data-id="' + item.id + '" style="margin-top:8px;padding:6px 14px;font-size:12.5px;">삭제</button>' +
          '</div>'
        );
      }).join("");
      list.querySelectorAll("button[data-id]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          client.from("announcements").delete().eq("id", btn.getAttribute("data-id")).then(load);
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

  function load() {
    if (!list) return;
    client.from("calendar_events").select("*").order("event_date", { ascending: true }).then(function (res) {
      var items = res.data || [];
      if (!items.length) {
        list.innerHTML = '<p class="msg">등록된 일정이 없어요.</p>';
        return;
      }
      list.innerHTML = items.map(function (item) {
        return (
          '<div class="note-item">' +
            '<div class="meta">' + item.event_date + '</div>' +
            '<div class="content"><strong>' + escapeHtmlAdmin(item.title) + '</strong>' +
              (item.description ? '<br>' + escapeHtmlAdmin(item.description) : '') + '</div>' +
            '<button class="btn ghost" data-id="' + item.id + '" style="margin-top:8px;padding:6px 14px;font-size:12.5px;">삭제</button>' +
          '</div>'
        );
      }).join("");
      list.querySelectorAll("button[data-id]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          client.from("calendar_events").delete().eq("id", btn.getAttribute("data-id")).then(load);
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

  function load() {
    if (!list) return;
    client.from("quiz_questions").select("*").order("created_at", { ascending: false }).then(function (res) {
      var items = res.data || [];
      if (!items.length) {
        list.innerHTML = '<p class="msg">등록된 퀴즈가 없어요.</p>';
        return;
      }
      list.innerHTML = items.map(function (item) {
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
        // week_start(월요일) + 2일 = 학생에게 공개되는 수요일. 이미 지났으면 "공개중", 아니면 날짜를 보여준다.
        // (toISOString()은 UTC 기준으로 바뀌어서 한국 시간 자정 근처엔 하루 밀려 보일 수 있어 로컬 날짜 성분만 비교한다)
        var revealDate = new Date(item.week_start + "T00:00:00");
        revealDate.setDate(revealDate.getDate() + 2);
        var localDateStr = function (d) {
          return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
        };
        var todayStr = localDateStr(new Date());
        var revealStr = revealDate.getFullYear() + "." + String(revealDate.getMonth() + 1).padStart(2, "0") + "." + String(revealDate.getDate()).padStart(2, "0");
        var isLive = localDateStr(revealDate) <= todayStr;
        var revealBadge = isLive
          ? '<span style="color:var(--well);font-weight:700;">공개중</span>'
          : '<span style="color:var(--text-soft);">' + revealStr + '(수) 공개 예정</span>';
        return (
          '<div class="note-item">' +
            '<div class="content"><strong>' + escapeHtmlAdmin(item.question) + '</strong></div>' +
            '<div class="meta" style="margin-top:6px;">' + optionsHtml + '</div>' +
            '<div class="meta" style="margin-top:6px;">' + revealBadge + '</div>' +
            '<button class="btn ghost" data-id="' + item.id + '" style="margin-top:8px;padding:6px 14px;font-size:12.5px;">삭제</button>' +
          '</div>'
        );
      }).join("");
      list.querySelectorAll("button[data-id]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          if (!confirm("이 퀴즈를 삭제할까요?")) return;
          client.from("quiz_questions").delete().eq("id", btn.getAttribute("data-id")).then(load);
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
