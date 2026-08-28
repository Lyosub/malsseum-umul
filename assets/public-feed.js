// 홈페이지: 실시간 감사노트/기도제목 나눔 피드
// 감사노트는 로그인한 사람에게만 닉네임이 보이고, 기도제목은 항상 익명으로 표시된다
// (닉네임 마스킹은 서버의 get_public_notes 함수가 처리하므로 여기서는 받은 값 그대로만 보여주면 된다)
// auth.js의 getClient()에 의존함

var PUBLIC_FEED_LABELS = { gratitude: "감사노트", prayer: "기도제목" };
var PUBLIC_FEED_INTERVAL_MS = 20000;

function escapeHtmlFeed(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function timeAgoKo(iso) {
  var diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return diffMin + "분 전";
  var diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return diffHr + "시간 전";
  return Math.floor(diffHr / 24) + "일 전";
}

function renderPublicFeed(listEl, rows) {
  if (!rows.length) {
    listEl.innerHTML = '<p class="msg">아직 나눈 이야기가 없어요. 첫 번째로 나눠보세요.</p>';
    return;
  }
  listEl.innerHTML = rows.map(function (r) {
    var who = r.nickname ? escapeHtmlFeed(r.nickname) : "익명";
    return (
      '<div class="note-item">' +
        '<div class="meta">' + PUBLIC_FEED_LABELS[r.type] + ' · ' + who + ' · ' + timeAgoKo(r.created_at) + '</div>' +
        '<div class="content">' + escapeHtmlFeed(r.content) + '</div>' +
      '</div>'
    );
  }).join("");
}

function initPublicFeed() {
  var listEl = document.getElementById("publicFeedList");
  var client = getClient();
  if (!listEl || !client) return;

  function load() {
    client.rpc("get_public_notes", { p_limit: 20 }).then(function (res) {
      if (res.error) {
        listEl.innerHTML = '<p class="msg">아직 준비 중이에요.</p>';
        return;
      }
      renderPublicFeed(listEl, res.data || []);
    }).catch(function () {
      listEl.innerHTML = '<p class="msg">불러오지 못했어요.</p>';
    });
  }

  load();
  setInterval(load, PUBLIC_FEED_INTERVAL_MS);
}
