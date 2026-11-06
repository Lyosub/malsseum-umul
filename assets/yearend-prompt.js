// 로그인했는데 아직 새해 말씀카드를 안 뽑은 사람에게 첫 화면·나의 기록에서 안내 창을 띄운다.
// 기간(12/1~1/31)은 서버 get_my_year_pick이 정한다(관리자·부장은 미리 보임). 「나중에」를 누르면 그날은 다시 안 띄운다.
(function () {
  var Y = 2026;
  function kstKey() {
    var d = new Date(Date.now() + 9 * 3600e3);
    return d.getUTCFullYear() + "-" + (d.getUTCMonth() + 1) + "-" + d.getUTCDate();
  }
  function kstMs() { var d = new Date(Date.now() + 9 * 3600e3); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()); }
  var KEY = "msu_ye_prompt_later";

  function later() { try { return localStorage.getItem(KEY) === kstKey(); } catch (e) { return false; } }
  function setLater() { try { localStorage.setItem(KEY, kstKey()); } catch (e) {} }

  function show() {
    if (document.getElementById("yePrompt")) return;
    var css = document.createElement("style");
    css.textContent =
      "#yePrompt{position:fixed;inset:0;z-index:1500;display:flex;align-items:flex-end;justify-content:center;background:rgba(6,10,34,0);transition:background .35s;}" +
      "#yePrompt.on{background:rgba(6,10,34,.55);}" +
      "#yePrompt .yp-box{width:100%;max-width:480px;margin:0 12px calc(78px + env(safe-area-inset-bottom));border-radius:20px;overflow:hidden;background:#fff;color:#1c2430;border:1.5px solid #c9932f;box-shadow:0 14px 40px rgba(0,0,0,.35);transform:translateY(40px);opacity:0;transition:transform .45s cubic-bezier(.2,1.3,.4,1),opacity .3s;}" +
      "#yePrompt.on .yp-box{transform:none;opacity:1;}" +
      "#yePrompt .yp-top{position:relative;height:118px;background:linear-gradient(155deg,#17287e,#2540d8);display:flex;align-items:center;justify-content:center;}" +
      "#yePrompt .yp-c{position:absolute;width:56px;height:78px;border-radius:9px;background:linear-gradient(155deg,#1d33a8,#2c4ce6);border:2px solid #e9c46a;color:#ffe7a8;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 0 16px rgba(233,196,106,.55);}" +
      "#yePrompt .yp-c.m{background:linear-gradient(160deg,#fffaf0,#f6e3b4);border-color:#c9932f;color:#5a3c06;font-size:12px;font-weight:800;text-align:center;line-height:1.3;z-index:1;animation:ypBob 2.4s ease-in-out infinite;}" +
      "@keyframes ypBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}" +
      "#yePrompt .yp-body{padding:16px 18px 18px;text-align:center;}" +
      "#yePrompt h3{margin:0 0 6px;font-size:18px;font-weight:800;color:#17287e;}" +
      "#yePrompt p{margin:0 0 14px;font-size:14px;line-height:1.65;color:#4a5170;}" +
      "#yePrompt .yp-go{display:block;padding:14px;border-radius:14px;background:#17287e;color:#fff;font-weight:800;font-size:15px;text-decoration:none;}" +
      "#yePrompt .yp-no{display:block;width:100%;margin-top:6px;min-height:42px;background:none;border:0;font-family:inherit;font-size:13.5px;font-weight:700;color:#6b74a0;cursor:pointer;}" +
      "@media (prefers-reduced-motion: reduce){#yePrompt .yp-c.m{animation:none}}";
    document.head.appendChild(css);
    var left = Math.round((Date.UTC(Y + 1, 0, 31) - kstMs()) / 86400000);
    var el = document.createElement("div");
    el.id = "yePrompt";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", "새해 말씀카드 뽑기 안내");
    el.innerHTML =
      '<div class="yp-box">' +
        '<div class="yp-top">' +
          '<span class="yp-c" style="transform:translateX(-46px) rotate(-12deg)">✦</span>' +
          '<span class="yp-c m">' + (Y + 1) + '<br>말씀</span>' +
          '<span class="yp-c" style="transform:translateX(46px) rotate(12deg)">✦</span>' +
        '</div>' +
        '<div class="yp-body">' +
          '<h3>🎁 ' + (Y + 1) + '년을 여는 말씀카드</h3>' +
          '<p>아직 카드를 안 뽑으셨어요. 한 해를 돌아보고<br>새해 말씀 한 장을 받아 보세요.' + (left >= 0 && left <= 62 ? '<br><b style="color:#a0741c;">' + (left === 0 ? "오늘이 마지막 날이에요" : "1월 31일까지 · " + left + "일 남음") + '</b>' : '') + '</p>' +
          '<a class="yp-go" href="yearend.html">카드 뽑으러 가기</a>' +
          '<button type="button" class="yp-no">나중에 할게요</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(el);
    requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add("on"); }); });
    function close() { setLater(); el.classList.remove("on"); setTimeout(function () { el.remove(); }, 400); }
    el.querySelector(".yp-no").onclick = close;
    el.addEventListener("click", function (e) { if (e.target === el) close(); });
    el.querySelector(".yp-go").onclick = function () { setLater(); };
  }

  function check() {
    if (later()) return;
    // 기간이 끝난 뒤에는 서버에 묻지도 않는다.
    if (kstMs() > Date.UTC(Y + 1, 0, 31)) return;
    if (typeof getSession !== "function" || typeof getClient !== "function") return;
    getSession().then(function (s) {
      if (!s) return;
      return getClient().rpc("get_my_year_pick", { p_year: Y }).then(function (r) {
        var d = r && r.data;
        if (d && d.open && !d.picked) setTimeout(show, 900);
      });
    }).catch(function () {});
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", check);
  else check();
})();
