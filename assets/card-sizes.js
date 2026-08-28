// 카드 이미지 저장용 공통 사이즈 프리셋

var CARD_SIZES = {
  wallpaper: { label: "📱 폰 배경화면", w: 1080, h: 2340 },
  post: { label: "📷 인스타 게시물", w: 1080, h: 1350 },
  story: { label: "📖 인스타 스토리", w: 1080, h: 1920 }
};

// 사이즈 선택 버튼 UI를 지정한 엘리먼트에 렌더링하고, 선택 시 onSelect(sizeKey)를 호출
function initSizePicker(elId, onSelect, defaultKey) {
  var el = document.getElementById(elId);
  if (!el) return;

  var keys = Object.keys(CARD_SIZES);
  el.innerHTML = keys.map(function (key) {
    return '<button type="button" data-size="' + key + '"' + (key === defaultKey ? ' class="active"' : '') + '>' + CARD_SIZES[key].label + '</button>';
  }).join("");

  var buttons = el.querySelectorAll("button");
  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      buttons.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      onSelect(btn.getAttribute("data-size"));
    });
  });
}

function getSelectedSize(elId, fallbackKey) {
  var el = document.getElementById(elId);
  if (!el) return CARD_SIZES[fallbackKey];
  var active = el.querySelector("button.active");
  var key = active ? active.getAttribute("data-size") : fallbackKey;
  return CARD_SIZES[key] || CARD_SIZES[fallbackKey];
}
