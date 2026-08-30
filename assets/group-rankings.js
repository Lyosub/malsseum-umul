// 오이코스별 누적 달란트 순위를 보여준다. 관리자 페이지(모든 오이코스)와 마이페이지의
// "우리 오이코스" 카드(오이코스에 속한 멤버에게만) 두 곳에서만 쓴다 — 홈페이지에는 공개하지 않는다.
// get_group_talent_rankings RPC가 서버에서 "오이코스 멤버이거나 교역자인지"를 직접 확인하므로,
// 권한이 없으면 빈 배열이 내려온다(에러는 아님) — 그 경우와 "진짜로 오이코스가 하나도 없는 경우",
// 그리고 "RPC 자체가 실패한 경우"를 각각 다른 메시지로 구분해서 보여준다.

function escapeHtmlRankings(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function initGroupRankings() {
  var listEl = document.getElementById("groupRankingsList");
  if (!listEl) return;
  var client = getClient();
  if (!client) return;

  client.rpc("get_group_talent_rankings").then(function (res) {
    if (res.error) {
      listEl.innerHTML = '<p class="msg">순위를 불러오지 못했어요.</p>';
      return;
    }
    var rows = res.data || [];
    if (!rows.length) {
      listEl.innerHTML = '<p class="msg">아직 만들어진 오이코스가 없어요.</p>';
      return;
    }
    listEl.innerHTML = rows.map(function (r, i) {
      return (
        '<div class="note-item">' +
          '<div class="content">' + (i + 1) + '위 · ' + escapeHtmlRankings(r.name) +
            (r.host_is_teacher
              ? ' <span style="color:var(--well);font-size:11.5px;">교사 오이코스</span>'
              : ' <span style="color:var(--text-soft);font-size:11.5px;">학생 오이코스</span>') +
          '</div>' +
          '<div class="meta">인원 ' + r.member_count + '명 · <strong style="color:var(--gold);">총 ' + r.total_talents + '달란트</strong></div>' +
        '</div>'
      );
    }).join("");
  }).catch(function () {
    listEl.innerHTML = '<p class="msg">불러오지 못했어요.</p>';
  });
}

document.addEventListener("DOMContentLoaded", initGroupRankings);
