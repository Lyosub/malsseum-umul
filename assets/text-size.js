// 글자 크게 보기. 사이트 글자가 대부분 px로 정해져 있어, 글자만 키우면 칸이 깨진다.
// 그래서 화면 전체를 함께 키운다(브라우저 확대와 같은 방식이라 칸 배치는 폰 폭에 맞춰 다시 잡힌다).
// 이 기기에서만 기억한다(localStorage). 게임 화면은 터치 위치 계산이 어긋날 수 있어 키우지 않는다.
// 다른 스크립트보다 먼저, 화면이 그려지기 전에 실행되도록 <head>에서 defer 없이 불러온다.
(function () {
  var SIZES = [
    { key: "1", label: "보통" },
    { key: "1.12", label: "크게" },
    { key: "1.25", label: "아주 크게" }
  ];
  var KEY = "msu_text_size";

  function read() {
    try {
      var v = localStorage.getItem(KEY);
      for (var i = 0; i < SIZES.length; i++) if (SIZES[i].key === v) return v;
    } catch (e) {}
    return "1";
  }

  function apply(v) {
    var root = document.documentElement;
    // 확대는 style.css의 html[data-text-size] body { zoom } 규칙이 한다.
    // html에 zoom을 걸면 화면 폭이 다시 잡히지 않아 옆으로 넘치고 아래 메뉴가 화면 밖으로 밀린다(11/6 시험).
    if (v === "1") root.removeAttribute("data-text-size");
    else root.setAttribute("data-text-size", v);
  }

  apply(read());

  // 고르는 버튼을 elId 안에 그린다(전체 메뉴·나의 프로필에서 쓴다).
  window.msuTextSizeControl = function (elId) {
    var el = document.getElementById(elId);
    if (!el) return;
    function draw() {
      var cur = read();
      el.innerHTML = SIZES.map(function (s) {
        var on = s.key === cur;
        return '<button type="button" class="ts-btn' + (on ? " on" : "") + '" data-ts="' + s.key + '" aria-pressed="' + on + '"' +
          ' style="font-size:' + (s.key === "1" ? 14 : s.key === "1.12" ? 16 : 18) + 'px">' + s.label + '</button>';
      }).join("");
    }
    el.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest("[data-ts]") : null;
      if (!b) return;
      var v = b.getAttribute("data-ts");
      try { localStorage.setItem(KEY, v); } catch (err) {}
      apply(v);
      draw();
    });
    draw();
  };
})();
