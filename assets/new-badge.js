// 홈페이지 메뉴 카드에 "최근 N일 이내 + 아직 안 본 새 콘텐츠가 올라왔으면" NEW 배지를 붙인다.
// - 공지사항/이달의 일정: Supabase에 실제 created_at이 있으니 최신 글 시각을 직접 조회해서 정확히 판단
// - 말씀 카드/MBTI 성경인물/이달의 배경화면: DB 없이 코드에 데이터를 직접 넣는 정적 콘텐츠라
//   시각을 자동으로 알 수 없음 -> 아래 STATIC_UPDATED_AT을 새 콘텐츠를 추가한 "그날 날짜"로 손으로 갱신해줘야 함
//   (verses-data.js/mbti-bible-data.js/character-backgrounds/weekly-backgrounds 등을 건드릴 때마다 여기도 같이 갱신)
//
// "확인하면 사라지게" 하기 위해, 각 섹션 페이지(notice.html/calendar.html/verses.html/mbti.html/wallpaper.html)
// 방문 시 markDbSectionSeen()/markStaticSectionSeen()을 호출해서 "이 시점까지는 봤다"를 localStorage(이 브라우저에만)에
// 남겨두고, 홈에서는 최신 콘텐츠 시각이 그 값보다 새 것일 때만 배지를 띄운다. 이 파일은 홈 여부와 상관없이
// 모든 페이지에 포함해도 안전하도록 initNewBadges()가 홈(.nav-cards가 있는 페이지)에서만 동작한다.
var NEW_BADGE_DAYS = 3;

var STATIC_UPDATED_AT = {
  verses: "2026-08-29",
  mbti: "2026-08-28",
  wallpaper: "2026-08-28"
};

var STATIC_NAV_SELECTOR = {
  verses: 'a[href="verses.html"]',
  mbti: 'a[href="mbti.html"]',
  wallpaper: 'a[href="wallpaper.html"]'
};

function getSeenMarker(key) {
  try {
    return localStorage.getItem("msu_seen_" + key);
  } catch (e) {
    return null;
  }
}

function setSeenMarker(key, value) {
  try {
    localStorage.setItem("msu_seen_" + key, value);
  } catch (e) {
    // 시크릿 모드 등에서 localStorage가 막혀 있어도 사이트 이용에는 지장 없게 조용히 무시한다
  }
}

// 정적 콘텐츠 페이지(verses.html/mbti.html/wallpaper.html)에서 호출: "최신 버전까지 봤다"고 기록
function markStaticSectionSeen(key) {
  if (STATIC_UPDATED_AT[key]) setSeenMarker(key, STATIC_UPDATED_AT[key]);
}

// DB 기반 페이지(notice.html/calendar.html)에서 호출: 지금 시점의 최신 글까지 봤다고 기록
function markDbSectionSeen(key, table) {
  if (typeof getClient !== "function") return;
  var client = getClient();
  client.from(table).select("created_at").order("created_at", { ascending: false }).limit(1)
    .then(function (res) {
      var row = res.data && res.data[0];
      if (row) setSeenMarker(key, row.created_at);
    });
}

function isWithinNewBadgeWindow(timestampMs) {
  var diffMs = Date.now() - timestampMs;
  return diffMs >= 0 && diffMs <= NEW_BADGE_DAYS * 24 * 60 * 60 * 1000;
}

function attachNewBadge(selector) {
  var card = document.querySelector(selector);
  if (!card || card.querySelector(".new-badge")) return;
  var badge = document.createElement("span");
  badge.className = "new-badge";
  badge.textContent = "NEW";
  card.appendChild(badge);
}

function checkDbLatest(table, selector, key) {
  if (typeof getClient !== "function") return;
  var client = getClient();
  client.from(table).select("created_at").order("created_at", { ascending: false }).limit(1)
    .then(function (res) {
      var row = res.data && res.data[0];
      if (!row) return;
      var seen = getSeenMarker(key);
      var alreadySeen = seen && seen >= row.created_at;
      if (!alreadySeen && isWithinNewBadgeWindow(new Date(row.created_at).getTime())) {
        attachNewBadge(selector);
      }
    });
}

function initNewBadges() {
  if (!document.querySelector(".nav-cards")) return; // 홈페이지가 아니면 아무것도 하지 않는다

  Object.keys(STATIC_UPDATED_AT).forEach(function (key) {
    var dateStr = STATIC_UPDATED_AT[key];
    var ts = new Date(dateStr + "T00:00:00+09:00").getTime();
    var seen = getSeenMarker(key);
    var alreadySeen = seen && seen >= dateStr;
    if (!alreadySeen && isWithinNewBadgeWindow(ts)) attachNewBadge(STATIC_NAV_SELECTOR[key]);
  });

  checkDbLatest("announcements", 'a[href="notice.html"]', "notice");
  checkDbLatest("calendar_events", 'a[href="calendar.html"]', "calendar");
}

document.addEventListener("DOMContentLoaded", initNewBadges);
