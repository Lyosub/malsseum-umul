if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("sw.js").catch(function () {});

    // sw.js가 새 버전으로 바뀌면(skipWaiting+clients.claim으로 즉시 활성화됨) 이 이벤트가 뜬다.
    // 그런데 지금 이미 열려있는 페이지는 "새 SW가 생겼다"는 걸 모른 채 예전 그대로 떠 있으므로,
    // 딱 한 번 자동으로 새로고침해서 배포한 변경사항이 바로 보이게 한다.
    // (처음 설치될 때는 아직 컨트롤러가 없어서 이 이벤트가 안 뜨므로 첫 방문에는 영향 없음)
    var reloaded = false;
    navigator.serviceWorker.addEventListener("controllerchange", function () {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    });
  });
}
