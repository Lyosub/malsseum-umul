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

// 카카오톡/네이버/인스타그램 등 앱 내장 브라우저에서는 iOS든 안드로이드든 "홈 화면에 추가"
// 자체가 지원되지 않는다(운영체제가 막아놓은 부분이라 사이트 코드로 우회할 수 없음).
// 학생들은 단톡방 링크를 타고 카톡 인앱 브라우저로 들어오는 경우가 많아서 따로 안내한다.
function detectInAppBrowser() {
  var ua = navigator.userAgent || "";
  if (/KAKAOTALK/i.test(ua)) return "kakaotalk";
  if (/NAVER\(/i.test(ua)) return "naver";
  if (/FBAN|FBAV/i.test(ua)) return "facebook";
  if (/Instagram/i.test(ua)) return "instagram";
  if (/Line\//i.test(ua)) return "line";
  return null;
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

function renderInstallBanner(kind, force) {
  var el = document.getElementById("installBanner");
  // force가 true면(실제 beforeinstallprompt가 뒤늦게 도착한 경우) 이미 떠 있는
  // "수동 설치 안내" 배너를 원탭 설치 버튼으로 덮어써서 더 나은 방식으로 업그레이드한다.
  if (!el || (el.innerHTML && !force)) return;

  if (kind === "generic-android") {
    el.innerHTML =
      '<div class="install-banner">' +
        '<div class="install-banner-row">' +
          '<div class="install-banner-text"><strong>📱 앱처럼 설치하기</strong><br>브라우저 메뉴(⋮)에서 "홈 화면에 추가" 또는 "앱 설치"를 선택해보세요.</div>' +
          '<button type="button" class="install-banner-close" id="installCloseBtn" aria-label="닫기">✕</button>' +
        '</div>' +
      '</div>';
  } else if (kind === "android") {
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

// 카카오톡은 kakaotalk://web/openExternal?url=... 링크를 자기 브라우저 안에서 탭하면
// 그 주소를 기기의 기본 브라우저(사파리/크롬)로 대신 열어주는 자체 기능을 제공한다.
// 네이버/인스타그램/페이스북/라인 등은 이런 우회 링크가 따로 없어서 메뉴 안내만 보여준다.
function renderInAppBrowserBanner(kind) {
  var el = document.getElementById("installBanner");
  if (!el || el.innerHTML) return;

  var actionHtml;
  if (kind === "kakaotalk") {
    var escapeUrl = "kakaotalk://web/openExternal?url=" + encodeURIComponent(window.location.href);
    actionHtml =
      '<a href="' + escapeUrl + '" class="install-banner-btn">다른 브라우저로 바로 열기</a>' +
      '<p style="margin:6px 0 0;font-size:11.5px;color:rgba(255,255,255,0.75);text-align:center;">버튼이 안 눌리면 오른쪽 아래 "⋯" 메뉴에서 "다른 브라우저로 열기"를 눌러주세요.</p>';
  } else {
    actionHtml =
      '<p style="margin:0;font-size:12.5px;color:rgba(255,255,255,0.9);">화면 안의 "⋯" 또는 공유 메뉴에서 "다른 브라우저로 열기"를 눌러주세요.</p>';
  }

  el.innerHTML =
    '<div class="install-banner">' +
      '<div class="install-banner-row">' +
        '<div class="install-banner-text"><strong>📱 앱처럼 설치하기</strong><br>지금 브라우저(카톡 등 앱 안 브라우저)에서는 설치가 안 돼요.</div>' +
        '<button type="button" class="install-banner-close" id="installCloseBtn" aria-label="닫기">✕</button>' +
      '</div>' +
      actionHtml +
    '</div>';

  var closeBtn = document.getElementById("installCloseBtn");
  if (closeBtn) closeBtn.addEventListener("click", dismissInstallBanner);
}

function initInstallBanner() {
  if (isStandaloneApp() || wasInstallBannerDismissed()) return;

  var inAppKind = detectInAppBrowser();
  if (inAppKind) {
    // 인앱 브라우저에서는 beforeinstallprompt도 안 뜨고, iOS 안내(사파리 공유 버튼)도
    // 애초에 다른 브라우저 화면이라 맞지 않으므로 전용 안내로 대체한다.
    renderInAppBrowserBanner(inAppKind);
    return;
  }

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    DEFERRED_INSTALL_PROMPT = e;
    renderInstallBanner("android", true); // 수동 안내가 이미 떠 있어도 원탭 버튼으로 덮어씀
  });

  // iOS 사파리는 beforeinstallprompt 자체가 없으므로 그 이벤트를 기다릴 필요 없이 바로 안내한다.
  if (isIosDevice()) {
    renderInstallBanner("ios");
  } else {
    // 크롬/엣지는 beforeinstallprompt가 뜨면 위에서 원탭 버튼으로 바로 업그레이드되지만,
    // 삼성인터넷처럼 이 이벤트 자체를 지원하지 않는 안드로이드 브라우저도 많아서, 일단
    // "브라우저 메뉴에서 직접 추가" 안내부터 먼저 보여준다(그래야 아무것도 안 뜨는 상황이 없음).
    renderInstallBanner("generic-android");
  }
}

// 상단 배너는 한 번 닫거나 설치를 시도하면(localStorage) 다시 안 뜨는데, 그것과 별개로
// 페이지 하단에는 "앱처럼 설치하기" 버튼을 항상 볼 수 있게 둔다(이미 설치되어 실행 중일
// 때만 숨김). 눌렀을 때 바로 설치 가능하면(beforeinstallprompt) 그걸로 설치하고, 아니면
// 기기별 수동 설치 방법을 그 자리에 펼쳐서 보여준다.
function persistentInstallDetailHtml() {
  var inAppKind = detectInAppBrowser();
  if (inAppKind === "kakaotalk") {
    var escapeUrl = "kakaotalk://web/openExternal?url=" + encodeURIComponent(window.location.href);
    return '지금 카카오톡 브라우저에서는 설치가 안 돼요. <a href="' + escapeUrl + '" style="color:var(--well);font-weight:700;">여기를 눌러 다른 브라우저로 열기</a>를 먼저 해주세요.';
  }
  if (inAppKind) {
    return '지금 앱 내장 브라우저에서는 설치가 안 돼요. 화면의 "⋯" 또는 공유 메뉴에서 "다른 브라우저로 열기"를 먼저 눌러주세요.';
  }
  if (isIosDevice()) {
    return 'Safari 하단 공유 버튼(⬆️)을 누르고 "홈 화면에 추가"를 선택해보세요.';
  }
  return '브라우저 메뉴(⋮)에서 "홈 화면에 추가" 또는 "앱 설치"를 선택해보세요.';
}

function initPersistentInstallLink() {
  var card = document.getElementById("installBannerPersistent");
  var btn = document.getElementById("installPersistentBtn");
  var detail = document.getElementById("installPersistentDetail");
  if (!card || !btn || !detail) return;
  if (isStandaloneApp()) return; // 이미 앱으로 실행 중이면 보여줄 필요 없음

  card.style.display = "block";

  btn.addEventListener("click", function () {
    if (DEFERRED_INSTALL_PROMPT) {
      btn.disabled = true;
      DEFERRED_INSTALL_PROMPT.prompt();
      DEFERRED_INSTALL_PROMPT.userChoice.then(function () {
        DEFERRED_INSTALL_PROMPT = null;
        btn.disabled = false;
      });
      return;
    }
    var isOpen = detail.style.display === "block";
    if (isOpen) {
      detail.style.display = "none";
    } else {
      detail.innerHTML = persistentInstallDetailHtml();
      detail.style.display = "block";
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  initInstallBanner();
  initPersistentInstallLink();
});
