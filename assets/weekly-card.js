// 이번 주 말씀 페이지: 요약 표시 + 카드 이미지 다운로드

function wrapTextWeekly(ctx, text, maxWidth) {
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

function loadWeeklyCardFonts() {
  var specs = ['900 64px "Pretendard"', '700 42px "Pretendard"', '400 30px "Pretendard"'];
  var promises = specs.map(function (spec) {
    return document.fonts.load(spec).catch(function () {});
  });
  return Promise.all(promises).then(function () { return document.fonts.ready; });
}

function drawCardNatureScene(ctx, W, H) {
  // 하늘~바다 그라데이션 (아침 바다 느낌)
  var grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#bfe8e8");
  grad.addColorStop(0.45, "#4fa8ac");
  grad.addColorStop(0.75, "#146e78");
  grad.addColorStop(1, "#0a3a40");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // 은은한 빛
  var glow = ctx.createRadialGradient(W * 0.78, H * 0.12, 10, W * 0.78, H * 0.12, W * 0.55);
  glow.addColorStop(0, "rgba(255,255,255,0.5)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // 먼 산/능선 실루엣
  ctx.fillStyle = "rgba(10, 40, 45, 0.22)";
  ctx.beginPath();
  ctx.moveTo(0, H * 0.62);
  ctx.quadraticCurveTo(W * 0.22, H * 0.57, W * 0.45, H * 0.615);
  ctx.quadraticCurveTo(W * 0.65, H * 0.66, W * 0.85, H * 0.59);
  ctx.quadraticCurveTo(W * 0.94, H * 0.565, W, H * 0.6);
  ctx.lineTo(W, H * 0.7);
  ctx.lineTo(0, H * 0.7);
  ctx.closePath();
  ctx.fill();

  // 물결
  ctx.fillStyle = "rgba(5, 30, 34, 0.3)";
  ctx.beginPath();
  ctx.moveTo(0, H * 0.86);
  ctx.bezierCurveTo(W * 0.25, H * 0.83, W * 0.35, H * 0.9, W * 0.6, H * 0.87);
  ctx.bezierCurveTo(W * 0.8, H * 0.85, W * 0.9, H * 0.91, W, H * 0.88);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();
}

function drawWeeklyCard(canvas, msg) {
  var ctx = canvas.getContext("2d");
  var W = 1080, H = 1350;
  canvas.width = W;
  canvas.height = H;

  drawCardNatureScene(ctx, W, H);

  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 16;

  ctx.font = '900 68px "Pretendard"';
  ctx.fillStyle = "#ffffff";
  var titleLines = wrapTextWeekly(ctx, msg.title, W * 0.82);
  var titleY = 190;
  titleLines.forEach(function (line, i) {
    ctx.fillText(line, W / 2, titleY + i * 78);
  });

  var afterTitleY = titleY + (titleLines.length - 1) * 78 + 90;

  ctx.shadowBlur = 12;
  ctx.font = '700 44px "Pretendard"';
  ctx.fillStyle = "#ffffff";
  var verseLines = wrapTextWeekly(ctx, '"' + msg.verseText + '"', W * 0.78);
  verseLines.forEach(function (line, i) {
    ctx.fillText(line, W / 2, afterTitleY + i * 62);
  });

  var refY = afterTitleY + verseLines.length * 62 + 50;
  ctx.shadowBlur = 6;
  ctx.font = '400 32px "Pretendard"';
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillText("(" + msg.verseRef + ")", W / 2, refY);

  ctx.shadowBlur = 0;
  ctx.font = '400 26px "Pretendard"';
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.fillText("💧 말씀우물", W / 2, H - 60);
}

function initWeeklyPage() {
  var labelEl = document.getElementById("weekLabel");
  var titleEl = document.getElementById("weekTitle");
  var cardEl = document.getElementById("weeklyCard");
  if (!cardEl || typeof WEEKLY_MESSAGE === "undefined") return;

  if (labelEl) labelEl.textContent = WEEKLY_MESSAGE.weekLabel + " 예배";
  if (titleEl) titleEl.textContent = WEEKLY_MESSAGE.title;

  cardEl.innerHTML =
    '<div class="well-ref">' + WEEKLY_MESSAGE.verseRef + '</div>' +
    '<div class="well-verse-text">"' + WEEKLY_MESSAGE.verseText + '"</div>' +
    '<hr class="well-divider">' +
    '<div class="well-label">요약</div>' +
    '<p class="well-meditation">' + WEEKLY_MESSAGE.summary + '</p>' +
    '<div class="well-prayer-box">' +
      '<div class="well-label">이번 주 적용</div>' +
      '<p class="well-prayer-text">' + WEEKLY_MESSAGE.application + '</p>' +
    '</div>';

  var downloadBtn = document.getElementById("downloadWeeklyBtn");
  var canvas = document.getElementById("weeklyCardCanvas");
  if (downloadBtn && canvas) {
    downloadBtn.addEventListener("click", function () {
      loadWeeklyCardFonts().then(function () {
        drawWeeklyCard(canvas, WEEKLY_MESSAGE);
        var link = document.createElement("a");
        link.download = "말씀우물_이번주말씀_" + WEEKLY_MESSAGE.weekLabel + ".png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    });
  }
}
