// 새해 말씀카드 이미지 디자인 6가지(yearend.html). 캔버스에 직접 그린다.
// drawYearCard(canvas, designKey, verse, { W, H, bg, who, stats, seed })
//   verse: { ref, text }  bg: 사진 디자인에 쓸 Image(없으면 그라데이션)  who: "OO님에게 주신 2027 말씀"  stats: "2026 출석 12일 · 묵상 8일"
var YEAR_CARD_DESIGNS = [
  { key: "photo", label: "풍경 사진" },
  { key: "gold", label: "금빛 테두리" },
  { key: "paper", label: "종이 카드" },
  { key: "dawn", label: "새벽 노을" },
  { key: "night", label: "밤하늘 별" },
  { key: "clean", label: "깔끔한 흰색" }
];

(function () {
  var SANS = '"Pretendard", sans-serif';
  var SERIF = '"Nanum Myeongjo", "Pretendard", serif';

  function rng(seed) {
    var s = (seed * 9301 + 49297) % 233280 || 1;
    return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  }

  // 글자 폭에 맞춰 줄을 나눈다(한국어는 띄어쓰기 단위, 너무 긴 말은 글자 단위).
  function wrap(ctx, text, maxW) {
    var words = text.split(" "), lines = [], cur = "";
    words.forEach(function (w) {
      var t = cur ? cur + " " + w : w;
      if (ctx.measureText(t).width <= maxW) { cur = t; return; }
      if (cur) lines.push(cur);
      if (ctx.measureText(w).width <= maxW) { cur = w; return; }
      cur = "";
      for (var i = 0; i < w.length; i++) {
        var tt = cur + w[i];
        if (ctx.measureText(tt).width > maxW && cur) { lines.push(cur); cur = w[i]; } else cur = tt;
      }
    });
    if (cur) lines.push(cur);
    return lines;
  }

  // 말씀 길이에 맞춰 글자 크기를 정한다: 정해진 높이 안에 들어갈 때까지 줄인다.
  function fitVerse(ctx, text, font, weight, maxW, maxH, start, min) {
    for (var size = start; size >= min; size -= 2) {
      ctx.font = weight + " " + size + "px " + font;
      var lines = wrap(ctx, text, maxW);
      var lh = Math.round(size * 1.55);
      if (lines.length * lh <= maxH) return { size: size, lines: lines, lh: lh };
    }
    ctx.font = weight + " " + min + "px " + font;
    return { size: min, lines: wrap(ctx, text, maxW), lh: Math.round(min * 1.55) };
  }

  function drawLines(ctx, fit, x, yCenter) {
    var total = fit.lines.length * fit.lh;
    var y = yCenter - total / 2 + fit.lh / 2;
    fit.lines.forEach(function (l, i) { ctx.fillText(l, x, y + i * fit.lh); });
    return { top: y - fit.lh / 2, bottom: y + (fit.lines.length - 1) * fit.lh + fit.lh / 2 };
  }

  function cover(ctx, img, W, H) {
    var s = Math.max(W / img.width, H / img.height), dw = img.width * s, dh = img.height * s;
    ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
  }

  function stars(ctx, W, H, n, r, color, seed) {
    var R = rng(seed);
    ctx.save();
    for (var i = 0; i < n; i++) {
      var x = R() * W, y = R() * H * 0.95, s = (R() * 0.8 + 0.3) * r;
      ctx.globalAlpha = 0.35 + R() * 0.65;
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function sparkle(ctx, x, y, s, color) {
    ctx.save(); ctx.fillStyle = color; ctx.beginPath();
    ctx.moveTo(x, y - s); ctx.quadraticCurveTo(x, y, x + s, y); ctx.quadraticCurveTo(x, y, x, y + s);
    ctx.quadraticCurveTo(x, y, x - s, y); ctx.quadraticCurveTo(x, y, x, y - s); ctx.fill(); ctx.restore();
  }

  var THEMES = {
    photo: { font: SANS, weight: "800", ink: "#ffffff", sub: "rgba(255,255,255,.86)", accent: "#ffe7a8", shadow: "rgba(0,0,0,.55)" },
    gold: { font: SANS, weight: "800", ink: "#ffffff", sub: "rgba(255,255,255,.8)", accent: "#e9c46a", shadow: "rgba(0,0,0,.3)" },
    paper: { font: SERIF, weight: "800", ink: "#3b2a12", sub: "#7a6040", accent: "#a33a2a", shadow: null },
    dawn: { font: SANS, weight: "800", ink: "#ffffff", sub: "rgba(255,255,255,.9)", accent: "#fff1c9", shadow: "rgba(60,20,40,.35)" },
    night: { font: SERIF, weight: "800", ink: "#fdf6e3", sub: "rgba(253,246,227,.78)", accent: "#e9c46a", shadow: "rgba(0,0,0,.4)" },
    clean: { font: SANS, weight: "800", ink: "#17287e", sub: "#6b74a0", accent: "#c9932f", shadow: null }
  };

  function background(ctx, key, W, H, o) {
    var g, R;
    if (key === "photo") {
      if (o.bg) cover(ctx, o.bg, W, H);
      else { g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#9fb4e6"); g.addColorStop(1, "#e9c9a0"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
      g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "rgba(8,12,40,.5)"); g.addColorStop(0.5, "rgba(8,12,40,.32)"); g.addColorStop(1, "rgba(8,12,40,.6)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    } else if (key === "gold") {
      g = ctx.createRadialGradient(W / 2, H * 0.42, 10, W / 2, H * 0.42, Math.max(W, H) * 0.75);
      g.addColorStop(0, "#2a44c9"); g.addColorStop(0.55, "#17287e"); g.addColorStop(1, "#0b1450");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      stars(ctx, W, H, 60, W * 0.003, "#ffe7a8", o.seed + 3);
      var m = W * 0.055;
      ctx.strokeStyle = "#e9c46a"; ctx.lineWidth = W * 0.006; ctx.strokeRect(m, m, W - m * 2, H - m * 2);
      ctx.lineWidth = W * 0.0022; ctx.strokeRect(m + W * 0.018, m + W * 0.018, W - (m + W * 0.018) * 2, H - (m + W * 0.018) * 2);
      [[m, m], [W - m, m], [m, H - m], [W - m, H - m]].forEach(function (p) { sparkle(ctx, p[0], p[1], W * 0.03, "#ffe7a8"); });
    } else if (key === "paper") {
      ctx.fillStyle = "#f7efdc"; ctx.fillRect(0, 0, W, H);
      R = rng(o.seed + 7);
      ctx.save();
      for (var i = 0; i < 2600; i++) { ctx.globalAlpha = R() * 0.05; ctx.fillStyle = R() > 0.5 ? "#8a6a3a" : "#ffffff"; ctx.fillRect(R() * W, R() * H, 2, 2); }
      ctx.restore();
      g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.72);
      g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(120,80,30,.18)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(122,96,64,.45)"; ctx.lineWidth = W * 0.002;
      var pm = W * 0.07; ctx.strokeRect(pm, pm, W - pm * 2, H - pm * 2);
    } else if (key === "dawn") {
      g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#1d2b6e"); g.addColorStop(0.45, "#6b5aa8"); g.addColorStop(0.72, "#e98aa0"); g.addColorStop(0.9, "#f7c27c"); g.addColorStop(1, "#fde3a7");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      var sy = H - 10 * (W / 1080), sr = W * 0.17;
      g = ctx.createRadialGradient(W / 2, sy, sr * 0.2, W / 2, sy, sr * 3);
      g.addColorStop(0, "rgba(255,244,214,.95)"); g.addColorStop(0.3, "rgba(255,214,150,.45)"); g.addColorStop(1, "rgba(255,214,150,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "rgba(255,248,230,.95)"; ctx.beginPath(); ctx.arc(W / 2, sy, sr * 0.55, Math.PI, 0); ctx.fill();
      ctx.fillStyle = "rgba(40,30,70,.35)"; ctx.fillRect(0, sy, W, H - sy);
      stars(ctx, W, H * 0.35, 40, W * 0.0028, "#ffffff", o.seed + 11);
    } else if (key === "night") {
      g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#050a26"); g.addColorStop(0.6, "#0f1b55"); g.addColorStop(1, "#1f2f7a");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      stars(ctx, W, H, 260, W * 0.0035, "#ffffff", o.seed + 5);
      stars(ctx, W, H, 40, W * 0.005, "#ffe7a8", o.seed + 9);
      var bx = W * 0.78, by = H * 0.12;
      g = ctx.createRadialGradient(bx, by, 2, bx, by, W * 0.16);
      g.addColorStop(0, "rgba(255,240,200,.9)"); g.addColorStop(1, "rgba(255,240,200,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      sparkle(ctx, bx, by, W * 0.05, "#fff6dc");
      ctx.fillStyle = "rgba(5,10,38,.85)";
      ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(0, H * 0.9);
      ctx.quadraticCurveTo(W * 0.3, H * 0.86, W * 0.55, H * 0.9); ctx.quadraticCurveTo(W * 0.8, H * 0.94, W, H * 0.88); ctx.lineTo(W, H); ctx.fill();
    } else {
      ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#f3f5fd"; ctx.fillRect(0, H * 0.86, W, H * 0.14);
      ctx.fillStyle = "#c9932f"; ctx.fillRect(W * 0.1, H * 0.86, W * 0.8, Math.max(2, W * 0.003));
    }
  }

  window.drawYearCard = function (canvas, key, v, o) {
    o = o || {};
    var W = o.W || 1080, H = o.H || 1350;
    var th = THEMES[key] || THEMES.photo;
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext("2d");
    background(ctx, key, W, H, o);
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    var u = W / 1080;
    var tall = H / W > 1.6;
    var midY = H * (tall ? 0.47 : 0.5);

    // 가운데: 말씀(먼저 크기를 재서, 이름표를 말씀 바로 위에 붙인다)
    ctx.shadowColor = th.shadow || "transparent";
    var fit = fitVerse(ctx, v.text, th.font, th.weight, W * 0.78, H * (tall ? 0.4 : 0.42), Math.round((tall ? 72 : 58) * u), Math.round(30 * u));
    var blockH = fit.lines.length * fit.lh;

    if (key === "clean") {
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(37,64,216,.12)";
      ctx.font = "800 " + Math.round(300 * u) + "px Georgia, serif";
      ctx.fillText("“", W * 0.2, midY - blockH / 2 - 60 * u);
    }

    // 위: 이름표
    ctx.shadowBlur = th.shadow ? 10 * u : 0;
    var labelY = midY - blockH / 2 - (tall ? 160 : 138) * u;
    ctx.fillStyle = th.sub;
    ctx.font = "600 " + Math.round((tall ? 27 : 24) * u) + "px " + SANS;
    ctx.fillText("2026 한 해를 마무리하며", W / 2, labelY);
    ctx.fillStyle = th.accent;
    ctx.font = "800 " + Math.round((tall ? 34 : 30) * u) + "px " + SANS;
    ctx.fillText("✦  2027 나에게 주신 말씀  ✦", W / 2, labelY + 48 * u);

    ctx.font = th.weight + " " + fit.size + "px " + th.font;
    ctx.fillStyle = th.ink;
    ctx.shadowBlur = th.shadow ? 14 * u : 0;
    var box = drawLines(ctx, fit, W / 2, midY);

    // 말씀 아래: 구절
    ctx.shadowBlur = th.shadow ? 8 * u : 0;
    ctx.fillStyle = th.accent;
    ctx.font = "800 " + Math.round((tall ? 42 : 36) * u) + "px " + SANS;
    ctx.fillText(v.ref, W / 2, box.bottom + 74 * u);
    if (key === "paper") {
      // 도장
      var sx = W / 2, sy = box.bottom + 160 * u, sr = 46 * u;
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(163,58,42,.85)"; ctx.lineWidth = 5 * u;
      ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "rgba(163,58,42,.9)"; ctx.font = "800 " + Math.round(26 * u) + "px " + SERIF;
      ctx.fillText("2027", sx, sy);
    }

    // 아래: 받는 사람·기록·말씀우물
    ctx.shadowBlur = th.shadow ? 6 * u : 0;
    var footY = H - (tall ? 210 : 150) * u;
    if (key === "dawn") footY = H - (tall ? 330 : 270) * u;
    if (o.who) {
      ctx.fillStyle = th.ink; ctx.font = "700 " + Math.round(28 * u) + "px " + SANS;
      ctx.fillText(o.who, W / 2, footY);
    }
    if (o.stats) {
      ctx.fillStyle = th.sub; ctx.font = "500 " + Math.round(23 * u) + "px " + SANS;
      ctx.fillText(o.stats, W / 2, footY + 42 * u);
    }
    ctx.shadowBlur = 0;
    ctx.fillStyle = th.sub; ctx.font = "600 " + Math.round(22 * u) + "px " + SANS;
    ctx.fillText("💧 말씀우물 · logoswell.kr/2027", W / 2, key === "dawn" ? footY + 86 * u : H - (tall ? 110 : 60) * u);
  };

  // 카드 그리기 전에 글꼴을 받아 둔다. 나눔명조는 글자 묶음별로 나뉘어 있어, 쓸 글자를 함께 넘겨야 그 묶음을 받는다.
  window.loadYearCardFonts = function (text) {
    var sample = (text || "") + "2027 나에게 주신 말씀 한 해를 마무리하며";
    var specs = ['800 40px "Pretendard"', '700 40px "Pretendard"', '600 40px "Pretendard"', '500 40px "Pretendard"', '800 40px "Nanum Myeongjo"'];
    return Promise.all(specs.map(function (s) { return document.fonts.load(s, sample).catch(function () {}); }))
      .then(function () { return document.fonts.ready; });
  };
})();

// ---- 말씀에 어울리는 카드 짝짓기 ----
// 말씀 속 낱말로 주제를 찾고, 주제에 맞는 카드 모양(디자인 + 사진) 후보 가운데 하나를 고른다.
// seed가 같으면 늘 같은 카드가 나온다(다시 열어도 같은 카드). 사람마다 seed가 달라 같은 말씀도 카드가 다를 수 있다.
// 사진 번호는 assets/verse-card-bg 밝은 사진: 71 냇가 72 호수와 나무 73 바다 74 노을 도시 75 호수 76 해 뜨는 언덕 77 들판 나무
// 78 초록 언덕 79 황금 들판 80 은행나무 길 81 단풍 언덕 82 벤치 83 노을 속 나무 84 억새 언덕 85 가을 호수
// 새해 사진: 86 바다 해돋이 87 눈밭의 나무 88 안개 낀 산 능선 89 눈 쌓인 솔숲 길 90 얼어붙은 호수 91 해돋이 언덕 벤치
// 92 새벽 시골길 93 눈 사이 시냇물 94 첫 햇살 받는 봉우리 95 샛별과 눈 언덕 96 구름 사이 햇살 97 서리 내린 상록수
var YEAR_CARD_THEMES = [
  { re: /새벽|아침|햇살|돋는|해요|빛|비추|광명/, looks: ["dawn", "p86", "p86", "p88", "p91", "p96", "p96", "p76", "p74", "p79"] },
  { re: /새 일|새 노래|새 마음|새 영|새롭|새 사람|새로워|만물|내일|앞에 있는|이전 일|옛날 일/, looks: ["dawn", "gold", "p86", "p87", "p91", "p88", "p97", "p95", "p79"] },
  { re: /별|밤|영광|영원|보좌|하늘/, looks: ["night", "night", "p95", "p95", "gold"] },
  { re: /길|인도|가든지|다닐|달려|걸|발을|출입|나아가|이끌|지도하/, looks: ["p80", "p89", "p89", "p92", "p92", "p78", "p77", "gold"] },
  { re: /(?<!만)물|시냇가|샘|강변|비와|적시|바다/, looks: ["p71", "p72", "p75", "p85", "p73", "p86", "p90", "p93", "p93"] },
  { re: /나무|열매|뿌리|잎|심은|결실|씨를|거두|동산/, looks: ["p72", "p77", "p83", "p76", "p87", "p89", "p97", "p97"] },
  { re: /산|언덕|반석|요새|산성|바위|피난처|높은 곳|눈을 들/, looks: ["p81", "p84", "p78", "p88", "p88", "p94", "p94"] },
  { re: /쉬게|쉼|평안|평강|근심하지|염려하지|가만히|잠잠|두려워하지/, looks: ["p82", "p91", "p90", "clean", "paper", "p75"] },
  { re: /복|은혜|은택|선물|은사|관 씌우|채우|넉넉|좋은 것|소원/, looks: ["gold", "gold", "p79", "p76", "p86", "p91", "p96"] },
  { re: /말씀|진리|교훈|지혜|가르치|기록|명철|도를/, looks: ["paper", "paper", "clean"] },
  { re: /힘|능력|강하고|담대|이기|독수리|싸우|견고/, looks: ["gold", "p81", "p84", "p94", "night"] },
  { re: /사랑|마음|인자/, looks: ["clean", "paper", "dawn"] }
];
var YEAR_CARD_ANY = ["p86", "p87", "p88", "p89", "p90", "p91", "p92", "p93", "p94", "p95", "p96", "p97", "p71", "p72", "p76", "p77", "p78", "p79", "p80", "p83", "p85", "gold", "paper", "dawn", "night", "clean"];

function yearCardLook(verse, seed) {
  var pool = [];
  YEAR_CARD_THEMES.forEach(function (t) { if (t.re.test(verse.text)) pool = pool.concat(t.looks); });
  if (!pool.length) pool = YEAR_CARD_ANY;
  var s = Math.abs(Math.floor(seed)) || 1;
  s = (s * 2654435761) % 4294967296;
  var look = pool[s % pool.length];
  if (/^p\d+$/.test(look)) return { design: "photo", bg: Number(look.slice(1)) };
  return { design: look, bg: 0 };
}

// 짝짓기에 쓸 수: 로그인한 사람은 계정 번호로, 비로그인은 이 기기에 저장한 수로 만든다.
function yearCardSeed(id, pick) {
  var h = 5381;
  var s = String(id || "") + ":" + pick;
  for (var i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return h;
}
