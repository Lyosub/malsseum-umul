// 새 가입자 첫 안내: 가입 14일 안의 계정에 첫 화면과 나의 기록 맨 위에 세 단계를 보여 준다.
(function () {
  var KEY = "msu_welcome_closed";
  if (typeof getClient !== "function" || typeof getSession !== "function") return;
  try { if (localStorage.getItem(KEY) === "1") return; } catch (e) {}
  var onMy = /mypage\.html$/.test(location.pathname);

  function step(done, title, sub, href, target) {
    var mark = '<span aria-hidden="true" style="flex:none;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;' +
      (done ? 'background:var(--well);color:#fff;">✓' : 'border:2px solid var(--border);">') + '</span>';
    var body = '<span style="min-width:0;"><b style="display:block;font-size:14.5px;' + (done ? 'color:var(--text-soft);' : '') + '">' + title + '</b>' +
      '<small style="color:var(--text-soft);font-size:12.5px;">' + sub + '</small></span>';
    var attrs = 'style="display:flex;align-items:center;gap:10px;padding:9px 0;text-decoration:none;color:inherit;"';
    if (done) return '<div ' + attrs + '>' + mark + body + '</div>';
    return '<a href="' + href + '" data-target="' + (target || "") + '" ' + attrs + '>' + mark + body + '<span aria-hidden="true" style="margin-left:auto;color:var(--text-soft);">›</span></a>';
  }

  function mount(card) {
    if (onMy) {
      var my = document.getElementById("keeperCard");
      if (my && my.parentNode) { my.parentNode.insertBefore(card, my); return true; }
      return false;
    }
    var title = document.getElementById("hvTodayTitle");
    if (!title) return false;
    var head = title.parentNode;
    head.parentNode.insertBefore(card, head);
    return true;
  }

  getSession().then(function (session) {
    if (!session) return;
    getClient().rpc("get_my_welcome").then(function (res) {
      var d = res.data;
      if (res.error || !d || !d.show || (d.group && d.color && d.checked)) return;
      var card = document.createElement("section");
      card.id = "welcomeCard";
      card.className = "card";
      card.style.cssText = "margin:0 0 14px;border:1.5px solid var(--border);";
      card.innerHTML =
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">' +
          '<h2 style="margin:0 0 4px;font-size:16.5px;">말씀우물에 온 걸 환영해요 👋</h2>' +
          '<button type="button" id="welcomeClose" aria-label="안내 닫기" style="flex:none;background:none;border:0;color:var(--text-soft);font-size:18px;padding:6px 8px;margin:-6px -8px 0 0;cursor:pointer;">×</button>' +
        '</div>' +
        step(d.group, "우리 오이코스 들어가기", "선생님께 초대 코드를 받아 넣어요", "oikos.html") +
        step(d.color, "내 우물지기 색 고르기", "나의 기록에서 골라요", "mypage.html", "keeperCard") +
        step(d.checked, "첫 출석 체크하기", "나의 기록에서 눌러요", "mypage.html", "checkinBtn");
      if (!mount(card)) return;
      document.getElementById("welcomeClose").onclick = function () {
        try { localStorage.setItem(KEY, "1"); } catch (e) {}
        card.remove();
      };
      // 나의 기록에 있을 때는 페이지를 옮기지 않고 해당 칸으로 내려간다.
      card.querySelectorAll("a[data-target]").forEach(function (a) {
        var el = a.getAttribute("data-target") && document.getElementById(a.getAttribute("data-target"));
        if (!onMy || !el) return;
        a.addEventListener("click", function (ev) { ev.preventDefault(); el.scrollIntoView({ behavior: "smooth", block: "center" }); });
      });
    });
  });
})();
