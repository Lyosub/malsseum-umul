// 공지사항 표시 (홈 미리보기 + notice.html 전체 목록)

function escapeHtmlNotice(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderAnnouncementList(elId, items, limit) {
  var el = document.getElementById(elId);
  if (!el) return;
  var rows = limit ? items.slice(0, limit) : items;
  if (!rows.length) {
    el.innerHTML = '<p class="msg">등록된 공지사항이 없어요.</p>';
    return;
  }
  el.innerHTML = rows.map(function (item) {
    var d = new Date(item.created_at);
    var dateStr = (d.getMonth() + 1) + "." + d.getDate();
    return (
      '<div class="note-item">' +
        '<div class="meta">' + dateStr + '</div>' +
        '<div class="content"><strong>' + escapeHtmlNotice(item.title) + '</strong><br>' + escapeHtmlNotice(item.content) + '</div>' +
      '</div>'
    );
  }).join("");
}

function loadAnnouncements(elId, limit) {
  var client = getClient();
  var el = document.getElementById(elId);
  if (!client || !el) return;
  el.innerHTML = '<p class="msg">불러오는 중...</p>';
  client.from("announcements")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit || 50)
    .then(function (res) {
      renderAnnouncementList(elId, res.data || [], null);
    })
    .catch(function () {
      el.innerHTML = '<p class="msg">공지사항을 불러오지 못했어요.</p>';
    });
}
