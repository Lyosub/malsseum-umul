// 함께 채우는 우물 (2026-11-21)
// 지난 이레 동안 모두가 한 일(출석·오늘의 1분·기록·외우기·읽기 등)을 「물 한 방울」로 세어 우물에 채운다.
// 새 저장소 없이 공개 집계 함수 get_site_usage_summary(숫자만, 이름·내용 없음)를 그대로 쓴다.
(function () {
  var LABEL = { attendance: "출석", devotion: "오늘의 1분", memorize: "말씀 외우기", note_gratitude: "감사", note_prayer: "기도", note_greeting: "인사",
    odyssey: "In Odyssey", qt_reflection: "묵상 기록", quiz: "퀴즈", reading: "성경 읽기", verse_draw: "말씀 카드", board: "게시판", prayer_reaction: "기도 응원" };
  var TIERS = [60, 100, 150, 220, 300, 400, 520, 660, 820, 1000];
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function css() {
    if (document.getElementById("wellFillCss")) return;
    var s = document.createElement("style"); s.id = "wellFillCss";
    s.textContent = ".wf{display:flex;gap:14px;align-items:stretch;background:#fff;border:1px solid #dfe4f1;border-radius:18px;padding:14px}" +
      ".wf-well{flex:0 0 92px;position:relative;border:4px solid #7d6a55;border-top:0;border-radius:0 0 18px 18px;background:#eef1f8;overflow:hidden;min-height:128px}" +
      ".wf-water{position:absolute;left:0;right:0;bottom:0;background:linear-gradient(180deg,#6fb6ff,#2f6fd6);transition:height 1.2s ease}" +
      ".wf-water:before{content:'';position:absolute;left:-10%;right:-10%;top:-7px;height:14px;border-radius:50%;background:#8cc6ff}" +
      ".wf-pct{position:absolute;left:0;right:0;bottom:8px;text-align:center;font-weight:800;font-size:17px;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.45)}" +
      ".wf-body{flex:1;min-width:0}.wf-body b.n{font-size:26px;color:#17287e}.wf-body p{margin:0 0 6px;font-size:14px;line-height:1.45;color:#3a4456;word-break:keep-all}" +
      ".wf-chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px}.wf-chips span{font-size:11.5px;background:#eef2fb;color:#2d3b66;border-radius:999px;padding:3px 9px;white-space:nowrap}" +
      ".wf-done{display:inline-block;margin-top:6px;font-size:12.5px;font-weight:800;color:#1f7a45;background:#e6f6ec;border-radius:999px;padding:3px 10px}" +
      "@media (prefers-reduced-motion: reduce){.wf-water{transition:none}}";
    document.head.appendChild(s);
  }
  function render(el, d) {
    var f = (d && d.features_7d) || {}, total = 0, parts = [];
    Object.keys(f).forEach(function (k) { var c = Number(f[k] && f[k].count) || 0; if (!LABEL[k] || c <= 0) return; total += c; parts.push([LABEL[k], c]); });
    parts.sort(function (a, b) { return b[1] - a[1]; });
    var goal = TIERS[TIERS.length - 1], passed = 0;
    for (var i = 0; i < TIERS.length; i++) { if (total < TIERS[i]) { goal = TIERS[i]; break; } passed = i + 1; }
    var pct = Math.max(0, Math.min(100, Math.round(total / goal * 100))), people = Number(d && d.active_7d) || 0;
    css();
    el.innerHTML = '<div class="wf"><div class="wf-well" role="img" aria-label="우물이 ' + pct + '퍼센트 찼어요"><div class="wf-water" style="height:0%"></div><div class="wf-pct">' + pct + '%</div></div>' +
      '<div class="wf-body"><p>지난 이레 동안 <b>' + people + '명</b>이 함께</p><p><b class="n">' + total + '</b> 방울을 길었어요</p>' +
      '<p>이번 눈금은 <b>' + goal + '방울</b>이에요. ' + (goal - total > 0 ? "<b>" + (goal - total) + "방울</b> 더 모이면 차요." : "가득 찼어요!") + "</p>" +
      (passed ? '<span class="wf-done">💧 눈금 ' + passed + "개를 넘었어요</span>" : "") +
      '<div class="wf-chips">' + parts.slice(0, 6).map(function (p) { return "<span>" + esc(p[0]) + " " + p[1] + "</span>"; }).join("") + "</div></div></div>" +
      '<p class="msg" style="margin:8px 2px 0;">출석, 오늘의 1분, 감사·기도 기록, 말씀 외우기, 성경 읽기를 하면 한 방울씩 보태져요. 숫자만 모으고 누가 했는지는 보이지 않아요.</p>';
    setTimeout(function () { var w = el.querySelector(".wf-water"); if (w) w.style.height = Math.max(6, pct) + "%"; }, 60);
  }
  window.initWellFill = function (id) {
    var el = document.getElementById(id || "wellFill"); if (!el || typeof getClient !== "function") return;
    var client = getClient(); if (!client) return;
    try { var c = JSON.parse(sessionStorage.getItem("wellFill") || "null"); if (c && Date.now() - c.t < 600000) { render(el, c.d); return; } } catch (e) {}
    client.rpc("get_site_usage_summary").then(function (r) {
      if (r.error || !r.data) { var sec = el.closest("section"); if (sec) sec.hidden = true; return; }
      try { sessionStorage.setItem("wellFill", JSON.stringify({ t: Date.now(), d: r.data })); } catch (e) {}
      render(el, r.data);
    });
  };
})();
