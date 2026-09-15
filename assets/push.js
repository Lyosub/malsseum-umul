// 푸시 알림 구독/해제. auth.js의 getClient()와 supabase-config.js의 VAPID_PUBLIC_KEY에 의존함.
// 실제 발송(공지사항 자동/관리자 수동)은 Supabase Edge Function(send-push)이 담당하고,
// 여기서는 "이 기기가 알림을 받겠다"는 구독 정보만 만들어서 push_subscriptions에 저장한다.

function urlBase64ToUint8Array(base64String) {
  var padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  var base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);
  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function isPushSupported() {
  return "serviceWorker" in navigator && "PushManager" in window && typeof Notification !== "undefined";
}

function initPushSubscribe(userId) {
  var btn = document.getElementById("pushSubscribeBtn");
  var msg = document.getElementById("pushSubscribeMsg");
  if (!btn) return;

  if (!isPushSupported()) {
    btn.disabled = true;
    btn.textContent = "이 브라우저는 알림을 지원하지 않아요";
    return;
  }

  function refreshState() {
    navigator.serviceWorker.ready.then(function (reg) {
      reg.pushManager.getSubscription().then(function (sub) {
        if (sub) {
          btn.textContent = "🔕 알림 끄기";
          btn.setAttribute("data-subscribed", "1");
        } else {
          btn.textContent = "🔔 알림 받기";
          btn.setAttribute("data-subscribed", "0");
        }
      });
    });
  }

  function unsubscribe() {
    navigator.serviceWorker.ready.then(function (reg) {
      reg.pushManager.getSubscription().then(function (sub) {
        if (!sub) { refreshState(); return; }
        var endpoint = sub.endpoint;
        sub.unsubscribe().then(function () {
          getClient().from("push_subscriptions").delete().eq("endpoint", endpoint).then(function () {
            if (msg) msg.textContent = "알림을 껐어요.";
            refreshState();
          });
        });
      });
    });
  }

  function subscribe() {
    if (Notification.permission === "denied") {
      if (msg) msg.textContent = "브라우저/기기 설정에서 이 사이트 알림 권한을 허용해주세요.";
      return;
    }
    Notification.requestPermission().then(function (permission) {
      if (permission !== "granted") {
        if (msg) msg.textContent = "알림 권한을 허용해야 받을 수 있어요.";
        return;
      }
      navigator.serviceWorker.ready.then(function (reg) {
        reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        }).then(function (sub) {
          var json = sub.toJSON();
          getClient().from("push_subscriptions").upsert({
            user_id: userId,
            endpoint: json.endpoint,
            p256dh: json.keys.p256dh,
            auth: json.keys.auth
          }, { onConflict: "endpoint" }).then(function (res) {
            if (res.error) {
              if (msg) msg.textContent = "알림 등록에 실패했어요.";
              return;
            }
            if (msg) msg.textContent = "알림을 받도록 설정했어요!";
            refreshState();
          });
        }).catch(function () {
          if (msg) msg.textContent = "알림 구독에 실패했어요. 잠시 후 다시 시도해주세요.";
        });
      });
    });
  }

  btn.addEventListener("click", function () {
    if (btn.getAttribute("data-subscribed") === "1") unsubscribe();
    else subscribe();
  });

  refreshState();
}
