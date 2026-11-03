// 첫 화면: 오늘의 말씀 배치와 「오늘의 1분」. 말씀 내용은 script.js의 기존 함수를 그대로 쓴다.
(function () {
  var card = document.getElementById("homeVerseCard");
  if (!card) return;

  // 맨 위 배경: 말씀 카드 배경 사진(날마다 바뀜). 글자가 잘 읽히도록 사진 위에 어둡게 한 겹 덮는다.
  var heroEl = document.getElementById("hvHero");
  try {
    var bgNum = String(getVerseCardBgIndex()).padStart(2, "0");
    heroEl.style.backgroundImage = "linear-gradient(180deg, rgba(8, 14, 44, .54) 0%, rgba(8, 14, 44, .46) 40%, rgba(8, 14, 44, .68) 100%), url(assets/verse-card-bg/verse-card-bg-" + bgNum + ".jpg)";
  } catch (e) {}

  var verse = getVerseFor("daily");
  var len = verse.text.length;
  card.classList.toggle("is-mid", len > 44 && len <= 74);
  card.classList.toggle("is-long", len > 74);
  var actions = document.getElementById("hvActions");
  var toggle = card.querySelector(".verse-card-toggle");
  if (toggle) actions.insertBefore(toggle, actions.firstChild);
  var cta = document.getElementById("homeVerseCta");
  try { setReadCtaLink(cta, verse.ref); } catch (e) {}
  cta.textContent = "본문 읽기 ›";

  var now = new Date();
  var days = ["일", "월", "화", "수", "목", "금", "토"];
  document.getElementById("hvDate").textContent = (now.getMonth() + 1) + "월 " + now.getDate() + "일 " + days[now.getDay()] + "요일";

  // 원정대: 행사 당일까지만 보인다.
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  var diff = Math.round((new Date(2026, 10, 8) - today) / 86400000);
  if (diff >= 0) {
    document.getElementById("hvEvent").hidden = false;
    document.getElementById("hvEventD").textContent = diff === 0 ? "오늘" : "D-" + diff;
  }

  document.getElementById("homeMindForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var v = (document.getElementById("homeMindInput").value || "").trim();
    location.href = v ? "well.html?q=" + encodeURIComponent(v) : "well.html";
  });

  // 오늘의 1분
  var LIME = 'fill="#cdec37" stroke="none"';
  var CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7"/></svg>';
  var STEPS = [
    { key: "devotion", t: "오늘 말씀 묵상", s: "읽고 나서 눌러 주세요", d: "묵상 완료",
      i: '<path d="M12 6.5C10.5 5 8 4.5 4.5 5v13c3.5-.5 6 0 7.5 1.5 1.5-1.5 4-2 7.5-1.5V5C16 4.5 13.5 5 12 6.5Z"/><path d="M12 6.5v13"/><path ' + LIME + ' d="M14.5 5.2h2.9v6.3l-1.45-1.1-1.45 1.1Z"/>' },
    { key: "memorize", t: "한 구절 외우기", s: "어절 순서 맞추기", d: "외우기 완료", h: "memorize.html",
      i: '<path d="M6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H11l-4 4v-4h-.5A2.5 2.5 0 0 1 4 13.5v-7A2.5 2.5 0 0 1 6.5 4Z"/><rect ' + LIME + ' x="7" y="8.7" width="4" height="2.8" rx=".9"/><path d="M13.5 10.1h1M16.5 10.1h.5"/>' },
    { key: "gratitude", t: "감사 한 줄 쓰기", s: "오늘 고마웠던 일 하나", d: "오늘 감사 기록", h: "mypage.html?open=gratitude",
      i: '<path ' + LIME + ' d="M11 21s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 11 8.1a4.3 4.3 0 0 1 7.5 2.7C18.5 16.4 11 21 11 21Z"/><path d="M19 2.500v4M17 4.500h4"/>' }
  ];
  var keeperShown = false;
  function showKeeper() {
    if (keeperShown) return;
    keeperShown = true;
    var box = document.createElement("div");
    box.className = "hv-done";
    box.innerHTML = '<div class="hv-done-text"><span class="hv-done-kicker">오늘도 말씀을 길어 올렸어요</span><strong>오늘의 1분을 다 채웠어요</strong></div>' +
      '<div class="hv-done-stage" id="hvKeeper"><img src="assets/brand/well-mascot-bucket.png" alt="두레박을 든 우물지기"></div>';
    var list = document.getElementById("hvSteps");
    list.parentNode.insertBefore(box, list);
    var load = function (src, next) {
      var t = document.createElement("script");
      t.src = src; t.onload = next; t.onerror = next;
      document.body.appendChild(t);
    };
    // 3D는 세 칸을 다 채웠을 때만 불러온다. 첫 화면은 무거워지지 않는다.
    load("assets/vendor/three-r128.min.js", function () {
      load("assets/wooljigi-3d.js", function () {
        if (!window.mountWooljigi || !window.THREE) return;
        var stage = document.getElementById("hvKeeper");
        var img = stage.querySelector("img");
        var keeper = mountWooljigi(stage);
        if (keeper) {
          if (img) img.remove();
          keeper.hideShadow();
          keeper.setBase("proud");
          keeper.play("joy");
        }
      });
    });
  }

  function render(status, loggedIn) {
    var doneN = 0;
    document.getElementById("hvSteps").innerHTML = STEPS.map(function (x) {
      var done = !!status[x.key];
      if (done) doneN++;
      var sub = done ? x.d : (loggedIn ? x.s : "로그인하면 기록됩니다");
      var inner = '<span class="hv-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + x.i + '</svg></span>' +
        '<span class="hv-step-body"><span class="hv-step-title">' + x.t + '</span><span class="hv-step-sub">' + sub + '</span></span>' +
        '<span class="hv-check">' + CHECK + '</span>';
      var body;
      if (x.key === "devotion" && loggedIn && !done) body = '<button type="button" id="hvDevotion">' + inner + '</button>';
      else if (x.key === "devotion" && !loggedIn) body = '<a href="login.html">' + inner + '</a>';
      else if (x.key === "devotion") body = '<div class="hv-step-static">' + inner + '</div>';
      else body = '<a href="' + x.h + '">' + inner + '</a>';
      return '<li class="hv-step' + (done ? " done" : "") + '">' + body + '</li>';
    }).join("");
    var bars = "";
    for (var b = 0; b < 3; b++) bars += '<i class="' + (b < doneN ? "on" : "") + '"></i>';
    var streak = status.streak > 0 ? '<span class="hv-streak">' + status.streak + '일 연속</span>' : "";
    document.getElementById("hvProgress").innerHTML = streak + '<span class="hv-bars" aria-hidden="true">' + bars + '</span><span>' + doneN + ' / 3</span>';
    if (doneN === 3) showKeeper();
    var btn = document.getElementById("hvDevotion");
    if (btn) btn.addEventListener("click", checkin);
  }
  window.hvRender = render;

  function refresh() {
    var client = getClient();
    return client.rpc("get_my_today_minute").then(function (res) {
      if (res.error || !res.data || !res.data.length) return;
      render(res.data[0], true);
    });
  }
  function checkin() {
    var btn = document.getElementById("hvDevotion");
    if (btn) btn.disabled = true;
    getClient().rpc("checkin_devotion").then(function (res) {
      if (res.error) { if (btn) btn.disabled = false; return; }
      refresh();
    }, function () { if (btn) btn.disabled = false; });
  }

  render({}, false);
  try {
    if (typeof getClient === "function" && getClient() && typeof getSession === "function") {
      getSession().then(function (session) {
        if (!session) return;
        render({}, true);
        refresh();
      });
    }
  } catch (e) {}
})();
