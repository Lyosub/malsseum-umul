// 나의 기록: 내 우물지기 칸. 레벨과 색은 서버에서 읽고, 3D는 칸이 보일 때 불러온다.
// 색은 처음 한 번만 고르고 바꿀 수 없다. 관리자만 언제든 바꿀 수 있다(서버에서도 막는다).
(function () {
  var card = document.getElementById("keeperCard");
  if (!card) return;
  var NAMES = ["작은 물방울", "샘", "작은 우물", "두레박 우물", "우물지기", "큰 우물지기"];
  var NEXT = [5, 15, 30, 50, 75];
  var COLORS = [
    ["blue", "파랑", "#1f52de", "물결과 물방울로 자라요"],
    ["green", "초록", "#16a34a", "잎과 덩굴로 자라요"],
    ["purple", "보라", "#7a22e0", "밤하늘의 별로 자라요"],
    ["pink", "분홍", "#e91e82", "꽃과 화환으로 자라요"],
    ["teal", "청록", "#0ea5a5", "조약돌과 시냇물로 자라요"],
    ["yellow", "노랑", "#eeb000", "해와 빛살로 자라요"]
  ];
  var keeper = null, current = null, pick = null, confirming = false, msg = "";

  function info(key) {
    for (var i = 0; i < COLORS.length; i++) if (COLORS[i][0] === key) return COLORS[i];
    return COLORS[0];
  }
  function client() { return typeof getClient === "function" ? getClient() : null; }

  function drawPicker() {
    var d = current, box = document.getElementById("kcColors"), panel = document.getElementById("kcPick");
    var choosing = !d.color_chosen;
    var open = choosing || d.can_change;
    box.hidden = !open;
    box.innerHTML = open ? COLORS.map(function (c) {
      var on = c[0] === (choosing ? pick : d.color);
      return '<button type="button" class="kc-color' + (on ? " on" : "") + '" data-color="' + c[0] + '" aria-label="' + c[1] + '" aria-pressed="' + on + '" style="--c:' + c[2] + '"></button>';
    }).join("") : "";
    box.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () { tap(b.getAttribute("data-color")); });
    });
    if (!choosing) {
      panel.hidden = !msg;
      panel.innerHTML = msg ? '<p class="kc-msg">' + msg + "</p>" : "";
      return;
    }
    var c = info(pick);
    panel.hidden = false;
    panel.innerHTML = '<p class="kc-pick-title">내 우물지기의 색을 골라 주세요</p>' +
      '<p class="kc-pick-sub"><b>' + c[1] + "</b> · " + c[3] + ". 샘(Lv 5)부터 모습이 달라져요.</p>" +
      (msg ? '<p class="kc-msg">' + msg + "</p>" : "") +
      (confirming
        ? '<p class="kc-warn">한 번 고르면 바꿀 수 없어요. 정말 ' + c[1] + "(으)로 정할까요?</p>" +
          '<div class="kc-actions"><button type="button" class="btn ghost" id="kcBack">다시 고르기</button><button type="button" class="btn" id="kcSave">' + c[1] + "(으)로 확정</button></div>"
        : '<button type="button" class="btn block" id="kcAsk">' + c[1] + "(으)로 정하기</button>");
    var ask = document.getElementById("kcAsk"), back = document.getElementById("kcBack"), save = document.getElementById("kcSave");
    if (ask) ask.addEventListener("click", function () { confirming = true; msg = ""; drawPicker(); });
    if (back) back.addEventListener("click", function () { confirming = false; drawPicker(); });
    if (save) save.addEventListener("click", function () { commit(pick); });
  }
  function render(d) {
    current = d;
    if (!pick) pick = d.color || "blue";
    card.hidden = false;
    var span = Math.max(1, d.next_xp - d.level_xp);
    var pct = Math.max(0, Math.min(100, Math.round((d.xp - d.level_xp) / span * 100)));
    document.getElementById("kcLevel").textContent = "Lv " + d.level;
    document.getElementById("kcName").textContent = NAMES[d.stage];
    document.getElementById("kcBar").style.width = pct + "%";
    document.getElementById("kcXp").textContent = "다음 레벨까지 " + Math.max(0, d.next_xp - d.xp) + " 발자국";
    document.getElementById("kcNext").textContent = d.stage < 5 ? "Lv " + NEXT[d.stage] + "에 「" + NAMES[d.stage + 1] + "」(으)로 자라요" : "가장 큰 모습까지 자랐어요";
    drawPicker();
    apply();
  }
  function shownColor() { return current.color_chosen ? current.color : pick; }
  function apply() {
    if (!keeper || !current) return;
    keeper.setStage(current.stage);
    keeper.setColor(shownColor());
  }
  function tap(color) {
    msg = "";
    if (!current.color_chosen) {
      pick = color;
      confirming = false;
      drawPicker();
      apply();
      return;
    }
    if (current.can_change && color !== current.color) commit(color);
  }
  function commit(color) {
    var c = client();
    function fail() {
      msg = "저장하지 못했어요. 잠시 뒤 다시 해 주세요.";
      confirming = false;
      drawPicker();
    }
    if (!c) { fail(); return; }
    var save = document.getElementById("kcSave");
    if (save) save.disabled = true;
    c.rpc("set_my_keeper_color", { p_color: color }).then(function (res) {
      if (res.error) { fail(); return; }
      current.color = color;
      current.color_chosen = true;
      confirming = false;
      msg = "";
      render(current);
      if (keeper) keeper.play("joy");
    }, fail);
  }
  function load3d(done) {
    var add = function (src, next) {
      var t = document.createElement("script");
      t.src = src; t.onload = next; t.onerror = next;
      document.body.appendChild(t);
    };
    add("assets/vendor/three-r128.min.js", function () { add("assets/wooljigi-3d.js", done); });
  }
  function mount() {
    if (keeper || !window.mountWooljigi || !window.THREE) return;
    var stage = document.getElementById("kcStage");
    var img = stage.querySelector("img");
    keeper = mountWooljigi(stage);
    if (!keeper) return;
    if (img) img.remove();
    keeper.setBase("idle");
    apply();
    celebrate();
  }
  // 전보다 큰 모습이 되었으면 한 번 축하한다.
  function celebrate() {
    if (!current) return;
    var key = "msu_keeper_stage", last = null;
    try { last = localStorage.getItem(key); } catch (e) {}
    if (last !== null && current.stage > Number(last)) {
      var el = document.getElementById("kcEvolved");
      el.textContent = "「" + NAMES[current.stage] + "」(으)로 자랐어요!";
      el.hidden = false;
      if (keeper) keeper.play("joy");
    }
    try { localStorage.setItem(key, String(current.stage)); } catch (e) {}
  }
  window.keeperRender = function (d) { render(d); load3d(mount); };

  if (typeof getClient !== "function" || typeof getSession !== "function") return;
  getSession().then(function (session) {
    if (!session) return;
    getClient().rpc("get_my_keeper").then(function (res) {
      if (res.error || !res.data || !res.data.length) return;
      window.keeperRender(res.data[0]);
    });
  });
})();
