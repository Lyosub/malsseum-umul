// 홈 화면에 오이코스별 누적 달란트 순위를 보여준다. 로그인 여부와 상관없이 누구나 볼 수 있는
// 공개 랭킹이며, 오이코스 이름/인원수/총 달란트만 나오고 개별 멤버 정보는 나오지 않는다.

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
    var rows = res.data || [];
    if (res.error || !rows.length) {
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
