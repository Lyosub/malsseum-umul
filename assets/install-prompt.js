// PWA 설치 유도 배너: 안드로이드/크롬 등은 beforeinstallprompt 이벤트를 가로채서 버튼 하나로
// 바로 설치할 수 있게 하고, 이 이벤트 자체가 없는 iOS 사파리는 "공유 -> 홈 화면에 추가"
// 안내만 보여준다. 이미 앱으로 설치되어 실행 중이거나, 사용자가 배너를 닫은 적 있으면
// (그 브라우저에서는) 다시 보여주지 않는다.

var DEFERRED_INSTALL_PROMPT = null;

function isStandaloneApp() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function isIosDevice() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function wasInstallBannerDismissed() {
  try {
    return localStorage.getItem("msu_install_dismissed") === "1";
  } catch (e) {
    return false;
  }
}

function dismissInstallBanner() {
  try {
    localStorage.setItem("msu_install_dismissed", "1");
  } catch (e) {}
  var el = document.getElementById("installBanner");
  if (el) el.innerHTML = "";
}

function renderInstallBanner(kind) {
  var el = document.getElementById("installBanner");
  if (!el || el.innerHTML) return; // 이미 떠 있으면 중복으로 다시 그리지 않음

  if (kind === "android") {
    el.innerHTML =
      '<div class="install-banner">' +
        '<div class="install-banner-row">' +
          '<div class="install-banner-text"><strong>📱 앱처럼 설치하기</strong><br>홈 화면에 추가하면 매번 검색 안 하고 바로 열 수 있어요.</div>' +
          '<button type="button" class="install-banner-close" id="installCloseBtn" aria-label="닫기">✕</button>' +
        '</div>' +
        '<button type="button" class="install-banner-btn" id="installBtn">설치하기</button>' +
      '</div>';
    var installBtn = document.getElementById("installBtn");
    installBtn.addEventListener("click", function () {
      if (!DEFERRED_INSTALL_PROMPT) return;
      installBtn.disabled = true;
      DEFERRED_INSTALL_PROMPT.prompt();
      DEFERRED_INSTALL_PROMPT.userChoice.then(function () {
        DEFERRED_INSTALL_PROMPT = null;
        dismissInstallBanner();
      });
    });
  } else if (kind === "ios") {
    el.innerHTML =
      '<div class="install-banner">' +
        '<div class="install-banner-row">' +
          '<div class="install-banner-text"><strong>📱 앱처럼 설치하기</strong><br>Safari 하단 공유 버튼(<span style="white-space:nowrap;">⬆️ 공유</span>)을 누르고 "홈 화면에 추가"를 선택해보세요.</div>' +
          '<button type="button" class="install-banner-close" id="installCloseBtn" aria-label="닫기">✕</button>' +
        '</div>' +
      '</div>';
  }

  var closeBtn = document.getElementById("installCloseBtn");
  if (closeBtn) closeBtn.addEventListener("click", dismissInstallBanner);
}

function initInstallBanner() {
  if (isStandaloneApp() || wasInstallBannerDismissed()) return;

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    DEFERRED_INSTALL_PROMPT = e;
    renderInstallBanner("android");
  });

  // iOS 사파리는 beforeinstallprompt 자체가 없으므로 그 이벤트를 기다릴 필요 없이 바로 안내한다.
  if (isIosDevice()) {
    renderInstallBanner("ios");
  }
}

document.addEventListener("DOMContentLoaded", initInstallBanner);
