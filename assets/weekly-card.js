// 이번 주 말씀 페이지: 요약 표시 + 카드 이미지 다운로드 (배경 이미지 업로드 지원)

var weeklyBgImage = null;

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

function waitForSingleDayFont(triesLeft) {
  if (document.fonts.check('400 40px "Single Day"')) {
    return Promise.resolve(true);
  }
  if (triesLeft <= 0) {
    return Promise.resolve(false);
  }
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(waitForSingleDayFont(triesLeft - 1));
    }, 200);
  });
}

function loadWeeklyCardFonts() {
  var specs = ['400 72px "Single Day"', '400 46px "Single Day"', '400 30px "Pretendard"'];
  var promises = specs.map(function (spec) {
    return document.fonts.load(spec).catch(function () {});
  });
  return Promise.all(promises)
    .then(function () { return document.fonts.ready; })
    .then(function () { return waitForSingleDayFont(15); });
}

function drawCardNatureScene(ctx, W, H) {
  // 하늘~바다 그라데이션 (아침 바다 느낌) — 배경 이미지가 없을 때의 기본값
  var grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#bfe8e8");
  grad.addColorStop(0.45, "#4fa8ac");
  grad.addColorStop(0.75, "#146e78");
  grad.addColorStop(1, "#0a3a40");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  var glow = ctx.createRadialGradient(W * 0.78, H * 0.12, 10, W * 0.78, H * 0.12, W * 0.55);
  glow.addColorStop(0, "rgba(255,255,255,0.5)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

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

function drawCoverImage(ctx, img, W, H) {
  var imgRatio = img.width / img.height;
  var cardRatio = W / H;
  var sx, sy, sw, sh;
  if (imgRatio > cardRatio) {
    sh = img.height;
    sw = sh * cardRatio;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    sw = img.width;
    sh = sw / cardRatio;
    sx = 0;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);

  // 글씨 가독성을 위한 은은한 어두운 오버레이 (위/아래 살짝 어둡게)
  var overlay = ctx.createLinearGradient(0, 0, 0, H);
  overlay.addColorStop(0, "rgba(0,0,0,0.35)");
  overlay.addColorStop(0.35, "rgba(0,0,0,0.05)");
  overlay.addColorStop(0.75, "rgba(0,0,0,0.05)");
  overlay.addColorStop(1, "rgba(0,0,0,0.3)");
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, W, H);
}

function drawWeeklyCard(canvas, msg) {
  var ctx = canvas.getContext("2d");
  var W = 1080, H = 1350;
  canvas.width = W;
  canvas.height = H;

  if (weeklyBgImage) {
    drawCoverImage(ctx, weeklyBgImage, W, H);
  } else {
    drawCardNatureScene(ctx, W, H);
  }

  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0,0,0,0.4)";
  ctx.shadowBlur = 14;

  ctx.font = '400 76px "Single Day"';
  ctx.fillStyle = "#ffffff";
  var titleLines = wrapTextWeekly(ctx, msg.title, W * 0.82);
  var titleY = 190;
  titleLines.forEach(function (line, i) {
    ctx.fillText(line, W / 2, titleY + i * 84);
  });

  var afterTitleY = titleY + (titleLines.length - 1) * 84 + 90;

  ctx.shadowBlur = 10;
  ctx.font = '400 48px "Single Day"';
  ctx.fillStyle = "#ffffff";
  var verseLines = wrapTextWeekly(ctx, '"' + msg.verseText + '"', W * 0.78);
  verseLines.forEach(function (line, i) {
    ctx.fillText(line, W / 2, afterTitleY + i * 60);
  });

  var refY = afterTitleY + verseLines.length * 60 + 46;
  ctx.shadowBlur = 6;
  ctx.font = '400 32px "Single Day"';
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillText("(" + msg.verseRef + ")", W / 2, refY);

  ctx.shadowBlur = 0;
  ctx.font = '400 26px "Pretendard"';
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.fillText("💧 말씀우물", W / 2, H - 60);
}

function initBgImageUpload() {
  var input = document.getElementById("bgImageInput");
  var msg = document.getElementById("bgImageMsg");
  if (!input) return;

  input.addEventListener("change", function () {
    var file = input.files && input.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        weeklyBgImage = img;
        if (msg) msg.textContent = "배경 이미지가 적용됐어요. 카드를 저장해보세요.";
      };
      img.onerror = function () {
        if (msg) msg.textContent = "이미지를 불러오지 못했어요.";
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
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

  initBgImageUpload();

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
