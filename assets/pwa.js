if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("sw.js").catch(function () {});

    // sw.js가 새 버전으로 바뀌면(skipWaiting+clients.claim으로 즉시 활성화됨) 이 이벤트가 뜬다.
    // 이미 열려 있는 페이지는 새 버전을 모르므로 한 번 새로고침해 변경사항이 바로 보이게 한다.
    // 다만 처음 방문할 때도 clients.claim 때문에 이 이벤트가 뜨는데, 그때는 새로고침할 이유가 없고
    // 입력하던 글자만 지워진다. 그래서 전에 연결된 서비스워커가 있을 때만 새로고침한다.
    // 글자를 입력하는 중이면 지우지 않도록 새로고침하지 않는다(다음에 화면을 열 때 새 버전이 보인다).
    var hadController = !!navigator.serviceWorker.controller;
    var reloaded = false;
    navigator.serviceWorker.addEventListener("controllerchange", function () {
      if (!hadController) { hadController = true; return; }
      if (reloaded) return;
      var a = document.activeElement;
      if (a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA" || a.tagName === "SELECT")) return;
      reloaded = true;
      window.location.reload();
    });
  });
}

// 2026-11-22 아이폰 홈 화면 앱은 닫았다 다시 열어도 멈춰 두었던 화면을 그대로 되살려, 며칠 전 판이 계속 보였다.
// 30분 넘게 다른 앱에 있다가 돌아오면 새로 받는다(글을 쓰던 중이거나 함께 하는 방에 들어가 있으면 그대로 둔다).
(function () {
  var hiddenAt = 0, LIVE = /\/(quizroom|twenty|expedition|harvest|star)[^\/]*\.html$/;
  function typing() {
    var els = document.querySelectorAll("input, textarea");
    for (var i = 0; i < els.length; i++) {
      var e = els[i], ty = (e.type || "").toLowerCase();
      if (ty === "hidden" || ty === "checkbox" || ty === "radio" || ty === "button" || ty === "submit") continue;
      if (e.value && e.value !== e.defaultValue) return true;
    }
    var a = document.activeElement;
    return !!(a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA" || a.isContentEditable));
  }
  function maybeReload() {
    if (!hiddenAt || Date.now() - hiddenAt < 30 * 60 * 1000) return;
    hiddenAt = 0;
    if (LIVE.test(location.pathname) || typing()) return;
    try { if (navigator.serviceWorker && navigator.serviceWorker.getRegistration) navigator.serviceWorker.getRegistration().then(function (r) { if (r) r.update(); }); } catch (e) {}
    location.reload();
  }
  document.addEventListener("visibilitychange", function () { if (document.hidden) hiddenAt = Date.now(); else maybeReload(); });
  window.addEventListener("pagehide", function () { hiddenAt = Date.now(); });
  window.addEventListener("pageshow", function (e) { if (e.persisted) maybeReload(); });
})();
