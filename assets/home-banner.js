// 홈 화면 상단 이벤트 배너: admin.html에서 등록한 게 있을 때만 보이고, 없으면 아예 렌더링하지 않는다.
// (등록 -> 홈에 바로 보임 / 삭제 -> 바로 안 보임. 여러 개면 최신 등록순으로 위에서부터 쌓인다.)

function escapeHtmlBanner(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function initHomeBanner() {
  var mount = document.getElementById("homeBanner");
  if (!mount) return;
  var client = getClient();
  if (!client) return;

  client.from("home_banner").select("*").order("created_at", { ascending: false }).then(function (res) {
    var items = res.data || [];
    if (!items.length) {
      mount.innerHTML = "";
      return;
    }
    mount.innerHTML = items.map(function (item) {
      var body =
        '<div class="event-banner-text">' +
          '<div class="event-banner-title">🎉 ' + escapeHtmlBanner(item.title) + '</div>' +
          (item.description ? '<div class="event-banner-desc">' + escapeHtmlBanner(item.description) + '</div>' : '') +
        '</div>';
      if (item.link_url) {
        return '<a class="event-banner" href="' + escapeHtmlBanner(item.link_url) + '">' + body + '<span class="event-banner-arrow">→</span></a>';
      }
      return '<div class="event-banner">' + body + '</div>';
    }).join("");
  });
}

document.addEventListener("DOMContentLoaded", initHomeBanner);
