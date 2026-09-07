// 홈 화면 상단 친구초청잔치(2026-09-13) 배너. 잔치 다음날(9/14 자정 KST)이 지나면 자동으로 사라진다.
// DB를 쓰지 않고 날짜만 보고 렌더 — admin 등록 없이도 항상 보이며, 지나면 조용히 없어진다.

(function () {
  var EVENT_MS = new Date("2026-09-13T00:00:00+09:00").getTime();
  var HIDE_AFTER_MS = new Date("2026-09-15T00:00:00+09:00").getTime();

  function render() {
    var mount = document.getElementById("chodaeBanner");
    if (!mount) return;
    var now = Date.now();
    if (now >= HIDE_AFTER_MS) { mount.innerHTML = ""; return; }

    var msPerDay = 24 * 60 * 60 * 1000;
    var diffDays = Math.ceil((EVENT_MS - now) / msPerDay);
    var ddayText;
    if (now >= EVENT_MS) ddayText = "D-DAY";
    else if (diffDays <= 0) ddayText = "D-DAY";
    else ddayText = "D-" + diffDays;

    mount.innerHTML =
      '<a class="chodae-banner" href="chodae.html">' +
        '<div class="chodae-banner-left">' +
          '<div class="chodae-banner-dday">' + ddayText + '</div>' +
          '<div class="chodae-banner-text">' +
            '<div class="chodae-banner-title">친구초청잔치 · Brand New Day</div>' +
            '<div class="chodae-banner-sub">9월 13일 · 내가 초청한 친구 기록하기</div>' +
          '</div>' +
        '</div>' +
        '<span class="chodae-banner-arrow">→</span>' +
      '</a>';
  }

  document.addEventListener("DOMContentLoaded", render);
})();
