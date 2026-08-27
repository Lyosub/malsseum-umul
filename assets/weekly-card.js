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
  var specs = ['800 60px "Pretendard"', '700 40px "Pretendard"', '400 32px "Pretendard"', '400 28px "Pretendard"'];
  var promises = specs.map(function (spec) {
    return document.fonts.load(spec).catch(function () {});
  });
  return Promise.all(promises).then(function () { return document.fonts.ready; });
}

function drawWeeklyCard(canvas, msg) {
  var ctx = canvas.getContext("2d");
  var W = 1080, H = 1350;
  canvas.width = W;
  canvas.height = H;

  var grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#6bc6c9");
  grad.addColorStop(0.4, "#14707a");
  grad.addColorStop(1, "#0e3d44");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0,0,0,0.25)";
  ctx.shadowBlur = 12;

  ctx.font = '400 30px "Pretendard"';
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText(msg.weekLabel + " 이번 주 말씀", W / 2, 130);

  ctx.font = '800 58px "Pretendard"';
  ctx.fillStyle = "#ffffff";
  ctx.fillText(msg.title, W / 2, 220);

  ctx.font = '400 30px "Pretendard"';
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText(msg.verseRef, W / 2, 290);

  ctx.shadowBlur = 8;
  ctx.font = '700 38px "Pretendard"';
  ctx.fillStyle = "#ffffff";
  var verseLines = wrapTextWeekly(ctx, '"' + msg.verseText + '"', W * 0.8);
  var vy = 370;
  verseLines.forEach(function (line, i) {
    ctx.fillText(line, W / 2, vy + i * 52);
  });

  var summaryY = vy + verseLines.length * 52 + 70;
  ctx.font = '400 30px "Pretendard"';
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  var summaryLines = wrapTextWeekly(ctx, msg.summary, W * 0.78);
  summaryLines.slice(0, 8).forEach(function (line, i) {
    ctx.fillText(line, W / 2, summaryY + i * 44);
  });

  ctx.shadowBlur = 0;
  ctx.font = '400 28px "Pretendard"';
  ctx.fillStyle = "rgba(255,255,255,0.7)";
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
