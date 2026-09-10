// 말씀우물 공용 앱셸 — 하단 탭바(홈·말씀·우리 오이코스·나의 기록·말씀놀이터·전체).
// 모든 학생용 페이지에 이 스크립트 하나만 넣으면 하단 탭이 생긴다.
// 아이콘은 인라인 SVG(라인 스타일). active 는 CSS 로 색만 바꾼다.
// 로그인/가입/비밀번호재설정/관리자 페이지에는 붙이지 않는다(아래 SKIP 목록).
(function () {
  "use strict";

  var SKIP = ["login.html", "signup.html", "reset-password.html", "admin.html"];

  var path = location.pathname.split("/").pop() || "index.html";
  if (SKIP.indexOf(path) !== -1) return;

  // 탭: [키, 라벨, 이동 대상, 이 탭이 활성으로 표시될 페이지들]
  var TABS = [
    ["home",  "홈",           "index.html",  ["index.html", ""]],
    ["word",  "말씀",         "word.html",   ["word.html", "verses.html", "weekly.html", "read.html", "well.html"]],
    ["oikos", "우리 오이코스", "oikos.html",  ["oikos.html", "chodae.html", "board.html"]],
    ["me",    "나의 기록",     "mypage.html", ["mypage.html", "feed.html"]],
    ["play",  "말씀놀이터",     "play.html",   ["play.html", "bookgame.html", "matchgame.html", "oikosgame.html", "shop.html"]],
    ["all",   "전체",         "all.html",    ["all.html", "notice.html", "calendar.html", "mbti.html", "wallpaper.html", "about.html", "privacy.html", "app-android.html", "app-ios.html"]]
  ];

  var ICONS = {
    home:  '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
    word:  '<path d="M12 6.5C10.5 5 8 4.5 4.5 5v13c3.5-.5 6 0 7.5 1.5 1.5-1.5 4-2 7.5-1.5V5C16 4.5 13.5 5 12 6.5Z"/><path d="M12 6.5v13"/>',
    oikos: '<circle cx="9" cy="8" r="3"/><path d="M3.5 20c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/><circle cx="17" cy="9.5" r="2.5"/><path d="M15.5 15c2.6.2 5 2.2 5 5"/>',
    me:    '<rect x="5" y="3.5" width="14" height="17" rx="2"/><path d="M9 3.5V6h6V3.5"/><path d="M8.5 11h7M8.5 15h5"/>',
    play:  '<rect x="3" y="7" width="18" height="11" rx="3"/><path d="M8 11v3M6.5 12.5h3"/><circle cx="16" cy="11.5" r="1"/><circle cx="18" cy="14" r="1"/>',
    all:   '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>'
  };

  function build() {
    if (document.querySelector(".app-tabbar")) return;
    var nav = document.createElement("nav");
    nav.className = "app-tabbar";
    nav.setAttribute("aria-label", "주요 메뉴");

    var html = "";
    for (var i = 0; i < TABS.length; i++) {
      var t = TABS[i];
      var active = t[3].indexOf(path) !== -1;
      html +=
        '<a class="app-tab' + (active ? " on" : "") + '" href="' + t[2] + '"' +
          (active ? ' aria-current="page"' : "") + '>' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
            'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[t[0]] + '</svg>' +
          '<span>' + t[1] + '</span>' +
        '</a>';
    }
    nav.innerHTML = html;
    document.body.appendChild(nav);
    document.body.classList.add("has-tabbar");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
