// 이달의 배경화면 생성기 (캔버스 → PNG 다운로드)

var WALL_W = 1080;
var WALL_H = 2340;

var MONTH_NAMES_KR = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function wrapText(ctx, text, maxWidth) {
  var words = text.split(" ");
  var lines = [];
  var current = "";
  words.forEach(function (word) {
    var test = current ? current + " " + word : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  });
  if (current) lines.push(current);
  return lines;
}

function loadWallpaperFonts() {
  var specs = [
    '800 160px "Pretendard"',
    '400 38px "Pretendard"',
    '400 46px "Pretendard"',
    '400 30px "Pretendard"'
  ];
  var promises = specs.map(function (spec) {
    return document.fonts.load(spec).catch(function () {});
  });
  return Promise.all(promises).then(function () {
    return document.fonts.ready;
  });
}

function drawWallpaper(canvas, verse, W, H) {
  var WALL_W = W || 1080;
  var WALL_H = H || 2340;
  var ctx = canvas.getContext("2d");
  canvas.width = WALL_W;
  canvas.height = WALL_H;

  // 배경 그라데이션 (노을)
  var grad = ctx.createLinearGradient(0, 0, 0, WALL_H);
  grad.addColorStop(0, "#24304f");
  grad.addColorStop(0.4, "#7c3c1c");
  grad.addColorStop(0.72, "#c1682f");
  grad.addColorStop(1, "#f0b562");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, WALL_W, WALL_H);

  // 은은한 태양 글로우 (달력과 말씀 사이 여백에 배치)
  var sunY = WALL_H * 0.40;
  var glow = ctx.createRadialGradient(WALL_W / 2, sunY, 20, WALL_W / 2, sunY, WALL_W * 0.6);
  glow.addColorStop(0, "rgba(255, 230, 180, 0.4)");
  glow.addColorStop(1, "rgba(255, 230, 180, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, WALL_W, WALL_H);

  // 태양(달)
  ctx.beginPath();
  ctx.arc(WALL_W / 2, sunY, 90, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 245, 225, 0.85)";
  ctx.fill();

  // 새 (V자 실루엣, 자연스러운 디테일)
  function drawBird(bx, by, size) {
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(bx - size, by);
    ctx.quadraticCurveTo(bx - size / 2, by - size / 2, bx, by);
    ctx.quadraticCurveTo(bx + size / 2, by - size / 2, bx + size, by);
    ctx.stroke();
  }
  drawBird(260, WALL_H * 0.34, 24);
  drawBird(330, WALL_H * 0.37, 18);
  drawBird(760, WALL_H * 0.33, 20);

  // 먼 산 실루엣
  ctx.fillStyle = "rgba(20, 15, 10, 0.16)";
  ctx.beginPath();
  ctx.moveTo(0, WALL_H * 0.50);
  ctx.quadraticCurveTo(WALL_W * 0.2, WALL_H * 0.45, WALL_W * 0.42, WALL_H * 0.49);
  ctx.quadraticCurveTo(WALL_W * 0.6, WALL_H * 0.53, WALL_W * 0.8, WALL_H * 0.47);
  ctx.quadraticCurveTo(WALL_W * 0.92, WALL_H * 0.44, WALL_W, WALL_H * 0.48);
  ctx.lineTo(WALL_W, WALL_H * 0.56);
  ctx.lineTo(0, WALL_H * 0.56);
  ctx.closePath();
  ctx.fill();

  // 가까운 산 실루엣
  ctx.fillStyle = "rgba(15, 10, 8, 0.28)";
  ctx.beginPath();
  ctx.moveTo(0, WALL_H * 0.57);
  ctx.quadraticCurveTo(WALL_W * 0.25, WALL_H * 0.52, WALL_W * 0.5, WALL_H * 0.565);
  ctx.quadraticCurveTo(WALL_W * 0.7, WALL_H * 0.6, WALL_W, WALL_H * 0.545);
  ctx.lineTo(WALL_W, WALL_H * 0.62);
  ctx.lineTo(0, WALL_H * 0.62);
  ctx.closePath();
  ctx.fill();

  // 물결 실루엣 (하단)
  ctx.fillStyle = "rgba(20, 15, 10, 0.18)";
  ctx.beginPath();
  ctx.moveTo(0, WALL_H * 0.88);
  ctx.bezierCurveTo(WALL_W * 0.25, WALL_H * 0.85, WALL_W * 0.35, WALL_H * 0.92, WALL_W * 0.6, WALL_H * 0.89);
  ctx.bezierCurveTo(WALL_W * 0.8, WALL_H * 0.87, WALL_W * 0.9, WALL_H * 0.93, WALL_W, WALL_H * 0.9);
  ctx.lineTo(WALL_W, WALL_H);
  ctx.lineTo(0, WALL_H);
  ctx.closePath();
  ctx.fill();

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0,0,0,0.25)";
  ctx.shadowBlur = 14;

  var now = new Date();
  var monthLabel = MONTH_NAMES_KR[now.getMonth()];

  // 월 타이틀
  ctx.font = '800 150px "Pretendard"';
  ctx.fillText(monthLabel, WALL_W / 2, 260);

  // 달력 그리드 (요일 정렬 없이 1~말일 순서로만 배치)
  var totalDays = daysInMonth(now.getFullYear(), now.getMonth());
  var cols = 7;
  var cellW = 118;
  var cellH = 68;
  var gridWidth = cols * cellW;
  var startX = (WALL_W - gridWidth) / 2 + cellW / 2;
  var startY = 380;

  ctx.font = '400 34px "Pretendard", sans-serif';
  ctx.shadowBlur = 6;
  for (var d = 1; d <= totalDays; d++) {
    var idx = d - 1;
    var col = idx % cols;
    var row = Math.floor(idx / cols);
    var x = startX + col * cellW;
    var y = startY + row * cellH;
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillText(String(d), x, y);
  }

  // 말씀 영역
  ctx.shadowBlur = 10;
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = '400 30px "Pretendard", serif';
  ctx.fillText(verse.ref, WALL_W / 2, WALL_H * 0.68);

  ctx.font = '400 44px "Pretendard", serif';
  ctx.fillStyle = "#ffffff";
  var maxTextWidth = WALL_W * 0.8;
  var lines = wrapText(ctx, verse.text, maxTextWidth);
  var lineHeight = 66;
  var textBlockStartY = WALL_H * 0.68 + 70;
  lines.forEach(function (line, i) {
    ctx.fillText(line, WALL_W / 2, textBlockStartY + i * lineHeight);
  });

  // 워터마크
  ctx.shadowBlur = 0;
  ctx.font = '400 30px "Pretendard", sans-serif';
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.fillText("💧 말씀우물", WALL_W / 2, WALL_H - 70);
}

function initWallpaperPage() {
  var canvas = document.getElementById("wallCanvas");
  var downloadBtn = document.getElementById("downloadBtn");
  if (!canvas) return;

  var verse = getVerseFor("monthly");

  loadWallpaperFonts().then(function () {
    drawWallpaper(canvas, verse);
  });

  if (typeof initSizePicker === "function") {
    initSizePicker("wallSizePicker", function () {}, "wallpaper");
  }

  if (downloadBtn) {
    downloadBtn.addEventListener("click", function () {
      var size = (typeof getSelectedSize === "function") ? getSelectedSize("wallSizePicker", "wallpaper") : { w: 1080, h: 2340 };
      var now = new Date();
      var fileName = "말씀우물_" + (now.getMonth() + 1) + "월_배경화면.png";
      loadWallpaperFonts().then(function () {
        drawWallpaper(canvas, verse, size.w, size.h);
        var link = document.createElement("a");
        link.download = fileName;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    });
  }
}
