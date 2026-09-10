// 홈 상단 공지 한 줄 캐러셀.
// 여러 행사 배너(친구초청잔치 날짜 배너 + admin이 등록한 home_banner)를 한 줄로 모아
// 약 4초마다 다음 공지로 자동 전환한다. 점(dot)으로 현재 위치 표시, 일시정지 버튼 제공,
// 줄 전체를 누르면 해당 공지로 이동한다. 공지가 하나도 없으면 이 영역은 렌더되지 않는다.
(function () {
  "use strict";
  var ROTATE_MS = 4200;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // 친구초청잔치(2026-09-13) — 잔치 다음날(9/15 자정 KST) 지나면 자동 제외
  function chodaeItem() {
    var HIDE_AFTER = new Date("2026-09-15T00:00:00+09:00").getTime();
    if (Date.now() >= HIDE_AFTER) return null;
    var EVENT = new Date("2026-09-13T00:00:00+09:00").getTime();
    var days = Math.ceil((EVENT - Date.now()) / 86400000);
    var dday = (Date.now() >= EVENT || days <= 0) ? "D-DAY" : ("D-" + days);
    return { tag: dday, text: "친구초청잔치 · 9월 13일 — 내가 초청한 친구 기록하기", href: "chodae.html" };
  }

  function render(items) {
    var bar = document.getElementById("homeNotice");
    if (!bar) return;
    if (!items.length) { bar.hidden = true; return; }
    bar.hidden = false;

    var i = 0, paused = false, timer = null;

    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function start() { stop(); if (items.length > 1 && !paused) timer = setInterval(next, ROTATE_MS); }
    function next() { i = (i + 1) % items.length; paint(); }

    function paint() {
      var it = items[i];
      var multi = items.length > 1;
      bar.innerHTML =
        '<a class="notice-bar-main" href="' + esc(it.href || "#") + '">' +
          (it.tag ? '<span class="notice-bar-tag">' + esc(it.tag) + '</span>' : '') +
          '<span class="notice-bar-text">' + esc(it.text) + '</span>' +
          '<span class="notice-bar-go" aria-hidden="true">›</span>' +
        '</a>' +
        (multi ?
          '<div class="notice-bar-ctrl">' +
            '<button type="button" class="notice-bar-pause" aria-label="' + (paused ? "자동 넘김 재생" : "자동 넘김 멈춤") + '">' + (paused ? "▶" : "❚❚") + '</button>' +
            '<span class="notice-bar-dots">' +
              items.map(function (_, k) { return '<i class="' + (k === i ? "on" : "") + '"></i>'; }).join("") +
            '</span>' +
          '</div>' : '');

      var pb = bar.querySelector(".notice-bar-pause");
      if (pb) pb.addEventListener("click", function (e) {
        e.preventDefault();
        paused = !paused;
        if (paused) stop(); else start();
        paint();
      });
      bar.querySelectorAll(".notice-bar-dots i").forEach(function (dot, k) {
        dot.addEventListener("click", function () { i = k; paint(); start(); });
      });
    }

    paint();
    start();
  }

  function init() {
    var bar = document.getElementById("homeNotice");
    if (!bar) return;

    var items = [];
    var c = chodaeItem();
    if (c) items.push(c);

    var client = (typeof getClient === "function") ? getClient() : null;
    if (!client) { render(items); return; }

    client.from("home_banner").select("*").order("created_at", { ascending: false }).then(function (res) {
      (res && res.data ? res.data : []).forEach(function (b) {
        items.push({
          tag: "공지",
          text: b.title + (b.description ? " — " + b.description : ""),
          href: b.link_url || "notice.html"
        });
      });
      render(items);
    }, function () { render(items); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
