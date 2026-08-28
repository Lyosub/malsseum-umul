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
        gate.innerHTML = '<p>관리자만 접근할 수 있는 페이지예요.</p>';
        return;
      }
      gate.style.display = "none";
      content.style.display = "block";
      initAnnouncementForm(session.user.id);
      initEventForm(session.user.id);
      loadMemberList();
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

    listEl.innerHTML = members.map(function (m) {
      var lastSeen = formatDateTime(m.last_sign_in_at);
      return (
        '<div class="note-item">' +
          '<div class="content">' +
            '<strong>' + escapeHtmlAdmin(m.nickname) + '</strong>' +
            (m.is_admin ? ' <span style="color:var(--gold);font-size:12px;">관리자</span>' : '') +
            '<br>' + escapeHtmlAdmin(m.email) +
          '</div>' +
          '<div class="meta">가입: ' + formatDateTime(m.joined_at) +
            ' · 최근 접속: ' + (lastSeen || "기록 없음") + '</div>' +
        '</div>'
      );
    }).join("");
  }).catch(function () {
    listEl.innerHTML = '<p class="msg">회원 목록을 불러오지 못했어요.</p>';
  });
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
