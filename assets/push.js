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

// 출석 직후 한 번 묻는다. 고르지 않으면 14일 동안 다시 묻지 않는다. 공지가 올라올 때만 발송되므로 그대로 안내한다.
function askPushAfterCheckin() {
  var KEY = "msu_push_ask_until";
  if (!isPushSupported() || Notification.permission === "denied") return;
  try { if (Number(localStorage.getItem(KEY) || 0) > Date.now()) return; } catch (e) { return; }
  if (document.getElementById("pushAsk")) return;
  getSession().then(function (session) {
    if (!session) return;
    navigator.serviceWorker.ready.then(function (reg) {
      reg.pushManager.getSubscription().then(function (sub) {
        if (sub) return;
        try { localStorage.setItem(KEY, String(Date.now() + 14 * 86400000)); } catch (e) {}
        var box = document.createElement("div");
        box.id = "pushAsk";
        box.setAttribute("role", "dialog");
        box.style.cssText = "position:fixed;left:12px;right:12px;bottom:calc(78px + env(safe-area-inset-bottom));z-index:60;padding:14px;border-radius:16px;background:var(--card-bg,#fff);color:var(--text,#1c2430);border:1.5px solid var(--border,#aab3d8);box-shadow:0 8px 24px rgba(0,0,0,.22);";
        box.innerHTML = '<p style="margin:0 0 10px;font-size:14.5px;font-weight:700;">🔔 새 소식이 올라오면 알림으로 받아 볼까요?</p>' +
          '<div style="display:flex;gap:8px;"><button type="button" id="pushAskNo" class="btn ghost" style="flex:1;">나중에</button><button type="button" id="pushAskYes" class="btn" style="flex:1;">알림 받기</button></div>' +
          '<p class="msg" id="pushAskMsg" style="margin:8px 0 0;"></p>';
        document.body.appendChild(box);
        document.getElementById("pushAskNo").onclick = function () { box.remove(); };
        document.getElementById("pushAskYes").onclick = function () {
          var msg = document.getElementById("pushAskMsg");
          this.disabled = true;
          Notification.requestPermission().then(function (permission) {
            if (permission !== "granted") { box.remove(); return; }
            return reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) }).then(function (s) {
              var json = s.toJSON();
              return getClient().from("push_subscriptions").upsert({ user_id: session.user.id, endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth }, { onConflict: "endpoint" }).then(function (res) {
                if (res.error) throw res.error;
                box.remove();
              });
            });
          }).catch(function () {
            msg.textContent = "알림을 켜지 못했어요. 나의 프로필에서 다시 켤 수 있어요.";
            setTimeout(function () { box.remove(); }, 3000);
          });
        };
      });
    });
  }).catch(function () {});
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
