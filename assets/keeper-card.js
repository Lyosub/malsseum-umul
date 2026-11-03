// 나의 기록: 내 우물지기 칸. 레벨과 색은 서버에서 읽고, 3D는 칸이 보일 때 불러온다.
(function () {
  var card = document.getElementById("keeperCard");
  if (!card) return;
  var NAMES = ["작은 물방울", "샘", "작은 우물", "두레박 우물", "우물지기", "큰 우물지기"];
  var NEXT = [5, 15, 30, 50, 75];
  var COLORS = [["blue", "파랑", "#1f52de"], ["green", "초록", "#16a34a"], ["purple", "보라", "#7a22e0"], ["pink", "분홍", "#e91e82"], ["teal", "청록", "#0ea5a5"], ["yellow", "노랑", "#eeb000"]];
  var keeper = null, current = null;

  function esc(t) { return String(t); }
  function render(d) {
    current = d;
    card.hidden = false;
    var span = Math.max(1, d.next_xp - d.level_xp);
    var pct = Math.max(0, Math.min(100, Math.round((d.xp - d.level_xp) / span * 100)));
    document.getElementById("kcLevel").textContent = "Lv " + d.level;
    document.getElementById("kcName").textContent = NAMES[d.stage];
    document.getElementById("kcBar").style.width = pct + "%";
    document.getElementById("kcXp").textContent = "다음 레벨까지 " + Math.max(0, d.next_xp - d.xp) + " 발자국";
    document.getElementById("kcNext").textContent = d.stage < 5 ? "Lv " + NEXT[d.stage] + "에 「" + NAMES[d.stage + 1] + "」(으)로 자라요" : "가장 큰 모습까지 자랐어요";
    var box = document.getElementById("kcColors");
    box.innerHTML = COLORS.map(function (c) {
      return '<button type="button" class="kc-color' + (c[0] === d.color ? " on" : "") + '" data-color="' + c[0] + '" aria-label="' + c[1] + '" aria-pressed="' + (c[0] === d.color) + '" style="--c:' + c[2] + '"></button>';
    }).join("");
    box.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () { choose(b.getAttribute("data-color")); });
    });
    apply();
  }
  function apply() {
    if (!keeper || !current) return;
    keeper.setStage(current.stage);
    keeper.setColor(current.color);
  }
  function choose(color) {
    if (!current || color === current.color) return;
    var before = current.color;
    current.color = color;
    render(current);
    var client = typeof getClient === "function" ? getClient() : null;
    if (!client) return;
    client.rpc("set_my_keeper_color", { p_color: color }).then(function (res) {
      if (res.error) { current.color = before; render(current); }
    }, function () { current.color = before; render(current); });
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
