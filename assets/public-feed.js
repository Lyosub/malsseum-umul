// 홈페이지: 실시간 하루인사/감사노트/기도제목 나눔 피드
// 평소엔 각 종류별로 최근 몇 개만 보여주고, 제목을 누르면 지금까지 올라온 글을 전부 볼 수 있다
// 기도제목은 항상 익명, 하루인사·감사노트는 로그인한 사람에게만 닉네임이 보인다
// (닉네임 마스킹은 서버의 get_public_notes 함수가 처리하므로 여기서는 받은 값 그대로만 보여주면 된다)
// auth.js의 getClient()에 의존함

var PUBLIC_FEED_INTERVAL_MS = 20000;
var PUBLIC_FEED_PREVIEW_COUNT = 6;
var PUBLIC_FEED_FETCH_LIMIT = 100;
var PUBLIC_FEED_EXPANDED_MAX_HEIGHT = "420px";
var PUBLIC_FEED_SECTIONS = {
  greeting: { list: "publicFeedGreeting", label: "publicFeedLabelGreeting", title: "🙋 하루 인사" },
  gratitude: { list: "publicFeedGratitude", label: "publicFeedLabelGratitude", title: "🙏 감사노트" },
  prayer: { list: "publicFeedPrayer", label: "publicFeedLabelPrayer", title: "🕊️ 기도제목" }
};
var publicFeedData = { greeting: [], gratitude: [], prayer: [] };
var publicFeedExpanded = { greeting: false, gratitude: false, prayer: false };

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

function renderFeedSection(type) {
  var section = PUBLIC_FEED_SECTIONS[type];
  var listEl = document.getElementById(section.list);
  var labelEl = document.getElementById(section.label);
  if (!listEl) return;

  var rows = publicFeedData[type] || [];
  var expanded = publicFeedExpanded[type];
  var shown = expanded ? rows : rows.slice(0, PUBLIC_FEED_PREVIEW_COUNT);

  if (labelEl) {
    var toggleText = expanded
      ? "▴ 접기"
      : (rows.length > PUBLIC_FEED_PREVIEW_COUNT ? "▾ 전체보기 (" + rows.length + ")" : "▾ 전체보기");
    labelEl.innerHTML = section.title + ' <span style="color:var(--text-soft);font-weight:400;">' + toggleText + '</span>';
  }

  if (!shown.length) {
    listEl.innerHTML = '<p class="msg">아직 나눈 이야기가 없어요.</p>';
    return;
  }
  var itemsHtml = shown.map(function (r) {
    var who = r.nickname ? escapeHtmlFeed(r.nickname) : "익명";
    return (
      '<div class="note-item">' +
        '<div class="meta">' + who + ' · ' + timeAgoKo(r.created_at) + '</div>' +
        '<div class="content">' + escapeHtmlFeed(r.content) + '</div>' +
      '</div>'
    );
  }).join("");

  // 전체보기 상태일 땐 글이 아무리 많이 쌓여도 카드 높이는 고정하고, 그 안에서만 스크롤되게 한다
  listEl.innerHTML = expanded
    ? '<div style="max-height:' + PUBLIC_FEED_EXPANDED_MAX_HEIGHT + ';overflow-y:auto;padding-right:4px;">' + itemsHtml + '</div>'
    : itemsHtml;
}

function initPublicFeed() {
  var client = getClient();
  if (!client) return;

  function load() {
    client.rpc("get_public_notes", { p_limit: PUBLIC_FEED_FETCH_LIMIT }).then(function (res) {
      if (res.error) {
        Object.keys(PUBLIC_FEED_SECTIONS).forEach(function (type) {
          var el = document.getElementById(PUBLIC_FEED_SECTIONS[type].list);
          if (el) el.innerHTML = '<p class="msg">아직 준비 중이에요.</p>';
        });
        return;
      }
      var grouped = { greeting: [], gratitude: [], prayer: [] };
      (res.data || []).forEach(function (r) {
        if (grouped[r.type]) grouped[r.type].push(r);
      });
      publicFeedData = grouped;
      Object.keys(PUBLIC_FEED_SECTIONS).forEach(renderFeedSection);
    }).catch(function () {
      Object.keys(PUBLIC_FEED_SECTIONS).forEach(function (type) {
        var el = document.getElementById(PUBLIC_FEED_SECTIONS[type].list);
        if (el) el.innerHTML = '<p class="msg">불러오지 못했어요.</p>';
      });
    });
  }

  Object.keys(PUBLIC_FEED_SECTIONS).forEach(function (type) {
    var labelEl = document.getElementById(PUBLIC_FEED_SECTIONS[type].label);
    if (!labelEl) return;
    labelEl.addEventListener("click", function () {
      publicFeedExpanded[type] = !publicFeedExpanded[type];
      renderFeedSection(type);
    });
  });

  load();
  setInterval(load, PUBLIC_FEED_INTERVAL_MS);
}
