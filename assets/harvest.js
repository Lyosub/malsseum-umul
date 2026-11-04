// 감사의 광주리: 쓰기 화면(harvest.html)과 예배 화면(harvest-sky.html)이 함께 쓰는 광주리 그림.
// 숫자에 맞춰 열매를 아래에서 위로 쌓는다. 같은 숫자면 언제나 같은 모습이 나온다.
(function () {
  var COLORS = ["#d8483f", "#7a4bb3", "#e9b949", "#8fae3e", "#c9652b", "#b23a5e"];
  var MAX_DRAWN = 90;

  function noise(i) {
    var x = Math.sin(i * 127.1 + 11.7) * 43758.5453;
    return x - Math.floor(x);
  }

  function fruit(i) {
    // 줄마다 폭이 넓어지는 더미. 위로 갈수록 줄이 짧아져 봉긋해진다.
    var rows = [8, 9, 10, 10, 10, 9, 8, 7, 6, 5, 4, 3, 1];
    var row = 0, left = i;
    while (row < rows.length - 1 && left >= rows[row]) { left -= rows[row]; row++; }
    var n = rows[row];
    var spread = 21 * (n - 1);
    var x = 200 - spread / 2 + (n > 1 ? left * (spread / (n - 1)) : 0) + (noise(i) - 0.5) * 7;
    var y = 196 - row * 16 + (noise(i + 50) - 0.5) * 5;
    var r = 11.5 + noise(i + 90) * 2.5;
    var color = COLORS[Math.floor(noise(i + 7) * COLORS.length)];
    return '<g>' +
      '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r.toFixed(1) + '" fill="' + color + '"/>' +
      '<circle cx="' + (x - r * 0.32).toFixed(1) + '" cy="' + (y - r * 0.36).toFixed(1) + '" r="' + (r * 0.24).toFixed(1) + '" fill="#fff" opacity=".35"/>' +
      '<path d="M' + x.toFixed(1) + ' ' + (y - r + 1).toFixed(1) + 'q3 -6 8 -5q-2 5 -8 5Z" fill="#5f7f2e"/>' +
      '</g>';
  }

  function weave() {
    var out = "";
    for (var y = 214; y < 300; y += 15) {
      out += '<path d="M' + (72 + (y - 214) * 0.28) + ' ' + y + 'H' + (328 - (y - 214) * 0.28) + '" stroke="#7d5427" stroke-width="2.5"/>';
    }
    for (var x = 92; x <= 308; x += 24) {
      out += '<path d="M' + x + ' 206L' + (200 + (x - 200) * 0.8) + ' 298" stroke="#7d5427" stroke-width="2" opacity=".65"/>';
    }
    return out;
  }

  // 그리는 열매는 90개까지다. 그 위는 숫자로만 늘어난다.
  window.drawHarvestBasket = function (el, count) {
    var n = Math.min(Math.max(0, count | 0), MAX_DRAWN);
    var fruits = "";
    for (var i = 0; i < n; i++) fruits += fruit(i);
    el.innerHTML =
      '<svg viewBox="0 -24 400 344" role="img" aria-label="열매가 담긴 광주리" style="display:block;width:100%;height:auto">' +
        '<ellipse cx="200" cy="306" rx="150" ry="11" fill="#000" opacity=".28"/>' +
        '<ellipse cx="200" cy="206" rx="132" ry="20" fill="#5c3b19"/>' +
        fruits +
        '<path d="M66 206H334L306 298Q304 304 296 304H104Q96 304 94 298Z" fill="#b98545"/>' +
        weave() +
        '<rect x="60" y="197" width="280" height="19" rx="9.500" fill="#d9a660" stroke="#7d5427" stroke-width="2"/>' +
      '</svg>';
  };
})();
