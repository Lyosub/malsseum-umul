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
