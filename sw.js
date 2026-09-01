// 말씀우물 PWA 서비스 워커: 앱 셸을 미리 캐시해두되, 온라인일 때는 항상 최신 버전을
// 먼저 시도하는 네트워크 우선(network-first) 방식으로 처리하고, 오프라인일 때만 캐시로 대체한다.
// (예전에는 캐시 우선 방식이라 배포 후에도 옛 버전이 계속 보이는 문제가 있었음)
var CACHE_VERSION = "msu-v61";
var PRECACHE = [
  "./",
  "index.html",
  "verses.html",
  "well.html",
  "mbti.html",
  "wallpaper.html",
  "weekly.html",
  "read.html",
  "notice.html",
  "calendar.html",
  "about.html",
  "app-android.html",
  "app-ios.html",
  "mypage.html",
  "login.html",
  "signup.html",
  "reset-password.html",
  "privacy.html",
  "admin.html",
  "feed.html",
  "board.html",
  "manifest.json",
  "assets/style.css",
  "assets/script.js",
  "assets/verses-data.js",
  "assets/card-sizes.js",
  "assets/supabase-config.js",
  "assets/auth.js",
  "assets/mbti-card.js",
  "assets/mbti-bible-data.js",
  "assets/wallpaper.js",
  "assets/weekly-card.js",
  "assets/weekly-message-data.js",
  "assets/bible-api.js",
  "assets/calendar.js",
  "assets/notice.js",
  "assets/mypage.js",
  "assets/admin.js",
  "assets/feed.js",
  "assets/public-feed.js",
  "assets/quiz.js",
  "assets/new-badge.js",
  "assets/home-banner.js",
  "assets/group-rankings.js",
  "assets/board.js",
  "assets/pwa.js",
  "assets/install-prompt.js",
  "assets/push.js",
  "assets/hero-bg.jpg",
  "assets/menu-icons/weekly.png",
  "assets/menu-icons/notice.png",
  "assets/menu-icons/calendar.png",
  "assets/menu-icons/verse-card.png",
  "assets/menu-icons/well.png",
  "assets/menu-icons/read.png",
  "assets/menu-icons/mypage.png",
  "assets/menu-icons/mbti.png",
  "assets/menu-icons/wallpaper.png",
  "assets/menu-icons/suggestion.png",
  "assets/menu-icons/board.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function (cache) {
      return Promise.all(
        PRECACHE.map(function (path) {
          return cache.add(new Request(path, { cache: "reload" })).catch(function () {});
        })
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) { return key !== CACHE_VERSION; })
          .map(function (key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") return;

  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Supabase/CDN/성경 API 등 외부 요청은 그대로 네트워크로 보낸다

  // GitHub Pages가 정적 파일에 max-age=600 캐시를 걸어놔서, cache 옵션을 안 주면
  // "네트워크 우선"이라 해도 10분 안에는 브라우저가 서버에 물어보지도 않고 예전 응답을
  // 그대로 재사용해버린다. cache: "no-store"로 매번 진짜 네트워크까지 강제로 보낸다.
  var freshReq = new Request(req, { cache: "no-store" });

  event.respondWith(
    fetch(freshReq)
      .then(function (res) {
        if (res && res.status === 200) {
          var copy = res.clone();
          caches.open(CACHE_VERSION).then(function (cache) { cache.put(req, copy); });
        }
        return res;
      })
      .catch(function () { return caches.match(req); })
  );
});

// 푸시 알림: 서버(send-push Edge Function)가 보낸 payload를 실제 알림으로 띄운다.
self.addEventListener("push", function (event) {
  var data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) {}
  var title = data.title || "💧 말씀우물";
  var options = {
    body: data.body || "",
    icon: "assets/icons/icon-512.png",
    badge: "assets/icons/icon-512.png",
    data: { url: data.url || "./" }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// 알림을 탭하면 해당 페이지로 이동(이미 열려있는 탭이 있으면 그걸 포커스)한다.
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  var targetUrl = (event.notification.data && event.notification.data.url) || "./";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then(function (clientList) {
      for (var i = 0; i < clientList.length; i++) {
        if (clientList[i].url.indexOf(targetUrl) !== -1 && "focus" in clientList[i]) {
          return clientList[i].focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
