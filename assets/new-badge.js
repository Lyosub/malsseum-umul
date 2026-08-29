// 홈페이지 메뉴 카드에 "최근 N일 이내 새 콘텐츠가 올라왔으면" NEW 배지를 붙인다.
// - 공지사항/이달의 일정: Supabase에 실제 created_at이 있으니 최신 글 시각을 직접 조회해서 정확히 판단
// - 말씀 카드/MBTI 성경인물/이달의 배경화면: DB 없이 코드에 데이터를 직접 넣는 정적 콘텐츠라
//   시각을 자동으로 알 수 없음 -> 아래 STATIC_UPDATED_AT을 새 콘텐츠를 추가한 "그날 날짜"로 손으로 갱신해줘야 함
//   (verses-data.js/mbti-bible-data.js/character-backgrounds/weekly-backgrounds 등을 건드릴 때마다 여기도 같이 갱신)
var NEW_BADGE_DAYS = 3;

var STATIC_UPDATED_AT = {
  'a[href="verses.html"]': "2026-08-29",
  'a[href="mbti.html"]': "2026-08-28",
  'a[href="wallpaper.html"]': "2026-08-28"
};

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

function checkDbLatest(table, selector) {
  if (typeof getClient !== "function") return;
  var client = getClient();
  client.from(table).select("created_at").order("created_at", { ascending: false }).limit(1)
    .then(function (res) {
      var row = res.data && res.data[0];
      if (!row) return;
      if (isWithinNewBadgeWindow(new Date(row.created_at).getTime())) {
        attachNewBadge(selector);
      }
    });
}

function initNewBadges() {
  Object.keys(STATIC_UPDATED_AT).forEach(function (selector) {
    var dateStr = STATIC_UPDATED_AT[selector];
    var ts = new Date(dateStr + "T00:00:00+09:00").getTime();
    if (isWithinNewBadgeWindow(ts)) attachNewBadge(selector);
  });

  checkDbLatest("announcements", 'a[href="notice.html"]');
  checkDbLatest("calendar_events", 'a[href="calendar.html"]');
}

document.addEventListener("DOMContentLoaded", initNewBadges);
