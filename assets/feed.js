// 실시간 나눔 전용 페이지(feed.html): 하루인사/감사노트/기도제목 전체를 각자 페이지에서 볼 수 있게 한다
// 기도제목은 항상 익명, 하루인사·감사노트는 로그인한 사람에게만 닉네임이 보인다
// (닉네임 마스킹은 서버의 get_public_notes 함수가 처리하므로 여기서는 받은 값 그대로만 보여주면 된다)
// auth.js의 getClient()에 의존함

var FEED_INTERVAL_MS = 20000;
var FEED_FETCH_LIMIT = 100;
var FEED_SECTIONS = {
  greeting: "publicFeedGreeting",
  gratitude: "publicFeedGratitude",
  prayer: "publicFeedPrayer"
};

function escapeHtmlFeedPage(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function timeAgoKoFeedPage(iso) {
  var diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return diffMin + "분 전";
  var diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return diffHr + "시간 전";
  return Math.floor(diffHr / 24) + "일 전";
}

function renderFeedPageSection(elId, rows) {
  var listEl = document.getElementById(elId);
  if (!listEl) return;
  if (!rows.length) {
    listEl.innerHTML = '<p class="msg">아직 나눈 이야기가 없어요.</p>';
    return;
  }
  listEl.innerHTML = rows.map(function (r) {
    var who = r.nickname ? escapeHtmlFeedPage(r.nickname) : "익명";
    return (
      '<div class="note-item">' +
        '<div class="meta">' + who + ' · ' + timeAgoKoFeedPage(r.created_at) + '</div>' +
        '<div class="content">' + escapeHtmlFeedPage(r.content) + '</div>' +
      '</div>'
    );
  }).join("");
}

function initFeedPage() {
  var client = getClient();
  if (!client) return;

  function load() {
    client.rpc("get_public_notes", { p_limit: FEED_FETCH_LIMIT }).then(function (res) {
      if (res.error) {
        Object.keys(FEED_SECTIONS).forEach(function (type) {
          var el = document.getElementById(FEED_SECTIONS[type]);
          if (el) el.innerHTML = '<p class="msg">아직 준비 중이에요.</p>';
        });
        return;
      }
      var grouped = { greeting: [], gratitude: [], prayer: [] };
      (res.data || []).forEach(function (r) {
        if (grouped[r.type]) grouped[r.type].push(r);
      });
      Object.keys(FEED_SECTIONS).forEach(function (type) {
        renderFeedPageSection(FEED_SECTIONS[type], grouped[type]);
      });
    }).catch(function () {
      Object.keys(FEED_SECTIONS).forEach(function (type) {
        var el = document.getElementById(FEED_SECTIONS[type]);
        if (el) el.innerHTML = '<p class="msg">불러오지 못했어요.</p>';
      });
    });
  }

  load();
  setInterval(load, FEED_INTERVAL_MS);
}
