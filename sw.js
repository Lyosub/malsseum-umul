// 말씀우물 PWA 서비스 워커: 앱 셸을 미리 캐시하고, 이후 같은 출처 요청은
// stale-while-revalidate(캐시 우선 응답 + 백그라운드 갱신) 방식으로 처리한다.
var CACHE_VERSION = "msu-v1";
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
  "mypage.html",
  "login.html",
  "signup.html",
  "privacy.html",
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
  "assets/pwa.js"
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

  event.respondWith(
    caches.match(req).then(function (cached) {
      var network = fetch(req)
        .then(function (res) {
          if (res && res.status === 200) {
            var copy = res.clone();
            caches.open(CACHE_VERSION).then(function (cache) { cache.put(req, copy); });
          }
          return res;
        })
        .catch(function () { return cached; });
      return cached || network;
    })
  );
});
