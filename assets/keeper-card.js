// 나의 기록: 내 우물지기 칸. 레벨과 색은 서버에서 읽고, 3D는 칸이 보일 때 불러온다.
// 색은 처음 한 번만 고르고 바꿀 수 없다. 관리자만 언제든 바꿀 수 있다(서버에서도 막는다).
(function () {
  var card = document.getElementById("keeperCard");
  if (!card) return;
  var NAMES = ["작은 물방울", "샘", "작은 우물", "두레박 우물", "우물지기", "큰 우물지기"];
  var NEXT = [5, 15, 30, 50, 75];
  // 말씀 본문은 대한성서공회 개역개정 원문이다.
  var COLORS = [
    ["blue", "파랑", "#1f52de", "생수", "요한복음 4:14", "내가 주는 물을 마시는 자는 영원히 목마르지 아니하리니 내가 주는 물은 그 속에서 영생하도록 솟아나는 샘물이 되리라"],
    ["green", "초록", "#16a34a", "참포도나무", "요한복음 15:5", "나는 포도나무요 너희는 가지라 그가 내 안에, 내가 그 안에 거하면 사람이 열매를 많이 맺나니 나를 떠나서는 너희가 아무 것도 할 수 없음이라"],
    ["purple", "보라", "#7a22e0", "약속의 별", "마태복음 2:10", "그들이 별을 보고 매우 크게 기뻐하고 기뻐하더라"],
    ["pink", "분홍", "#e91e82", "들의 백합화", "마태복음 6:28", "또 너희가 어찌 의복을 위하여 염려하느냐 들의 백합화가 어떻게 자라는가 생각하여 보라 수고도 아니하고 길쌈도 아니하느니라"],
    ["teal", "청록", "#0ea5a5", "시냇가의 나무", "시편 1:3", "그는 시냇가에 심은 나무가 철을 따라 열매를 맺으며 그 잎사귀가 마르지 아니함 같으니 그가 하는 모든 일이 다 형통하리로다"],
    ["yellow", "노랑", "#d98a00", "세상의 빛", "마태복음 5:14", "너희는 세상의 빛이라 산 위에 있는 동네가 숨겨지지 못할 것이요"]
  ];
  function stageBgUrl(n) { return "url(assets/home/" + (n === 2 ? "keeper-bg" : "stage-" + n) + ".jpg)"; }
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
      '<p class="kc-pick-sub"><b>' + c[1] + " · " + c[3] + "</b> · 샘(Lv 5)부터 이 모습으로 자라요.</p>" +
      '<blockquote class="kc-verse">' + c[5] + "<cite>" + c[4] + "</cite></blockquote>" +
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
    card.classList.remove("kc-wait");
    document.getElementById("kcStage").style.backgroundImage = stageBgUrl(d.stage);
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
    if (keeper) return;
    var stage = document.getElementById("kcStage");
    if (window.mountWooljigi && window.THREE) keeper = mountWooljigi(stage);
    // 3D를 못 띄우는 기기에서만 그림을 보여 준다. 그 전에 그림을 먼저 띄우면 내 우물지기와 달라 보인다.
    if (!keeper) {
      if (!stage.querySelector("img")) {
        var img = document.createElement("img");
        img.src = "assets/brand/well-mascot-idle.png";
        img.alt = "내 우물지기";
        stage.appendChild(img);
      }
      return;
    }
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
  window.keeperRender = function (d) {
    render(d);
    // 다음에 열 때 이 높이만큼 자리를 잡아 둔다(색을 골랐는지에 따라 높이가 다르다).
    var body = card.querySelector(".kc-body");
    body.style.minHeight = "";
    try { localStorage.setItem("msu_keeper_body_h", String(body.offsetHeight)); } catch (e) {}
    load3d(mount);
  };

  var keeperBox = document.getElementById("keeperCard");
  function hideKeeper() { if (keeperBox) keeperBox.hidden = true; }
  try {
    var savedH = Number(localStorage.getItem("msu_keeper_body_h"));
    if (savedH > 0 && keeperBox) keeperBox.querySelector(".kc-body").style.minHeight = savedH + "px";
  } catch (e) {}
  if (typeof getClient !== "function" || typeof getSession !== "function") { hideKeeper(); return; }
  getSession().then(function (session) {
    if (!session) { hideKeeper(); return; }
    getClient().rpc("get_my_keeper").then(function (res) {
      if (res.error || !res.data || !res.data.length) { hideKeeper(); return; }
      window.keeperRender(res.data[0]);
    });
  });
})();
