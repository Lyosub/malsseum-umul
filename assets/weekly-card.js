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

function loadWeeklyCardFonts() {
  var specs = ['800 76px "Pretendard"', '400 48px "Pretendard"', '400 30px "Pretendard"'];
  var promises = specs.map(function (spec) {
    return document.fonts.load(spec).catch(function () {});
  });
  return Promise.all(promises).then(function () {
    return document.fonts.ready;
  });
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

// 배경에서 글씨를 놓기에 가장 무난한(단조로운) 위치를 화면 중간 대역에서 찾는다
function findBestTextBandY(ctx, W, H) {
  var zoneTop = Math.floor(H * 0.26);
  var zoneBottom = Math.floor(H * 0.76);
  var zoneH = zoneBottom - zoneTop;
  var bands = 6;
  var bandH = zoneH / bands;
  var fallbackY = zoneTop + zoneH / 2;

  var imgData;
  try {
    imgData = ctx.getImageData(0, zoneTop, W, zoneH);
  } catch (e) {
    return fallbackY;
  }
  var data = imgData.data;
  var stepX = Math.max(4, Math.floor(W / 90));
  var stepY = Math.max(2, Math.floor(bandH / 16));

  var bestScore = Infinity;
  var bestCenterY = fallbackY;

  for (var b = 0; b < bands; b++) {
    var yStart = Math.floor(b * bandH);
    var yEnd = Math.floor(yStart + bandH);
    var sum = 0, sumSq = 0, count = 0;
    for (var y = yStart; y < yEnd; y += stepY) {
      var row = y * W;
      for (var x = 0; x < W; x += stepX) {
        var idx = (row + x) * 4;
        var lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        sum += lum;
        sumSq += lum * lum;
        count++;
      }
    }
    if (count === 0) continue;
    var mean = sum / count;
    var variance = sumSq / count - mean * mean;
    var bandCenterY = zoneTop + yStart + bandH / 2;
    var centerBias = Math.abs(bandCenterY - H * 0.5) * 6;
    var score = variance + centerBias;
    if (score < bestScore) {
      bestScore = score;
      bestCenterY = bandCenterY;
    }
  }
  return bestCenterY;
}

// 텍스트 블록 뒤에 은은한 어두운 스크림을 깔아 어떤 배경 위에서도 가독성을 보장
function drawTextScrim(ctx, W, topY, bottomY) {
  var pad = 34;
  var x = W * 0.06;
  var w = W * 0.88;
  var y = topY - pad;
  var h = (bottomY - topY) + pad * 2;
  var r = 30;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fillStyle = "rgba(8, 18, 22, 0.4)";
  ctx.fill();
  ctx.restore();
}

function drawWeeklyCard(canvas, msg, W, H) {
  W = W || 1080;
  H = H || 1350;
  var ctx = canvas.getContext("2d");
  canvas.width = W;
  canvas.height = H;

  if (weeklyBgImage) {
    drawCoverImage(ctx, weeklyBgImage, W, H);
  } else {
    drawCardNatureScene(ctx, W, H);
  }

  ctx.textAlign = "center";

  ctx.font = '800 76px "Pretendard"';
  var titleLines = wrapTextWeekly(ctx, msg.title, W * 0.82);
  var titleGap = 84;

  ctx.font = '400 48px "Pretendard"';
  var verseLines = wrapTextWeekly(ctx, '"' + msg.verseText + '"', W * 0.78);
  var verseGap = 60;

  var hasEn = !!msg.verseTextEn;
  var enLines = [];
  if (hasEn) {
    ctx.font = '400 30px "Pretendard", sans-serif';
    enLines = wrapTextWeekly(ctx, '"' + msg.verseTextEn + '"', W * 0.74);
  }
  var enGap = 40;

  // titleY를 0으로 뒀을 때 각 요소의 상대 y 위치 (전체 블록 높이 계산용)
  var afterTitleRel = (titleLines.length - 1) * titleGap + 90;
  var refYRel = afterTitleRel + verseLines.length * verseGap + 46;
  var enStartRel = refYRel + 56;
  var enRefRel = hasEn ? enStartRel + (enLines.length - 1) * enGap + 42 : refYRel;

  var blockTopRel = -66;
  var blockBottomRel = enRefRel + 30;
  var blockCenterRel = (blockTopRel + blockBottomRel) / 2;

  var anchorY = findBestTextBandY(ctx, W, H);
  var titleY = anchorY - blockCenterRel;

  var minTitleY = H * 0.1 - blockTopRel;
  var maxTitleY = H - H * 0.12 - blockBottomRel;
  if (titleY < minTitleY) titleY = minTitleY;
  if (maxTitleY > minTitleY && titleY > maxTitleY) titleY = maxTitleY;

  drawTextScrim(ctx, W, titleY + blockTopRel, titleY + blockBottomRel);

  ctx.shadowColor = "rgba(0,0,0,0.4)";
  ctx.shadowBlur = 14;
  ctx.font = '800 76px "Pretendard"';
  ctx.fillStyle = "#ffffff";
  titleLines.forEach(function (line, i) {
    ctx.fillText(line, W / 2, titleY + i * titleGap);
  });

  var afterTitleY = titleY + afterTitleRel;
  ctx.shadowBlur = 10;
  ctx.font = '400 48px "Pretendard"';
  verseLines.forEach(function (line, i) {
    ctx.fillText(line, W / 2, afterTitleY + i * verseGap);
  });

  var refY = titleY + refYRel;
  ctx.shadowBlur = 6;
  ctx.font = '400 32px "Pretendard"';
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillText("(" + msg.verseRef + ")", W / 2, refY);

  if (hasEn) {
    var enStartY = titleY + enStartRel;
    ctx.shadowBlur = 6;
    ctx.font = '400 30px "Pretendard", sans-serif';
    ctx.fillStyle = "rgba(255,255,255,0.86)";
    enLines.forEach(function (line, i) {
      ctx.fillText(line, W / 2, enStartY + i * enGap);
    });

    var enRefY = titleY + enRefRel;
    ctx.font = '400 24px "Pretendard", sans-serif';
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText("(" + msg.verseRefEn + ")", W / 2, enRefY);
  }

  ctx.shadowBlur = 0;
  ctx.font = '400 26px "Pretendard"';
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.fillText("💧 말씀우물", W / 2, H - 60);
}

function tryAutoLoadWeeklyBg(weekLabel) {
  var path = "assets/weekly-backgrounds/" + weekLabel + ".png";
  var img = new Image();
  img.onload = function () {
    weeklyBgImage = img;
  };
  img.onerror = function () {
    // assets/weekly-backgrounds/에 해당 주차 이미지가 없으면 기본 배경(자연 풍경)을 그대로 사용
  };
  img.src = path;
}

function initWeeklyPage() {
  var labelEl = document.getElementById("weekLabel");
  var titleEl = document.getElementById("weekTitle");
  var cardEl = document.getElementById("weeklyCard");
  if (!cardEl || typeof WEEKLY_MESSAGE === "undefined") return;

  if (labelEl) labelEl.textContent = WEEKLY_MESSAGE.weekLabel + " 예배";
  if (titleEl) titleEl.textContent = WEEKLY_MESSAGE.title;

  var enHtml = WEEKLY_MESSAGE.verseTextEn
    ? '<div class="well-verse-text" style="font-size:13px;font-style:italic;color:var(--text-soft);margin-top:6px;">"' + WEEKLY_MESSAGE.verseTextEn + '"<br>(' + WEEKLY_MESSAGE.verseRefEn + ')</div>'
    : '';

  cardEl.innerHTML =
    '<div class="well-ref">' + WEEKLY_MESSAGE.verseRef + '</div>' +
    '<div class="well-verse-text">"' + WEEKLY_MESSAGE.verseText + '"</div>' +
    enHtml +
    '<hr class="well-divider">' +
    '<div class="well-label">요약</div>' +
    '<p class="well-meditation">' + WEEKLY_MESSAGE.summary + '</p>' +
    '<div class="well-prayer-box">' +
      '<div class="well-label">이번 주 적용</div>' +
      '<p class="well-prayer-text">' + WEEKLY_MESSAGE.application + '</p>' +
    '</div>';

  tryAutoLoadWeeklyBg(WEEKLY_MESSAGE.weekLabel);

  if (typeof initSizePicker === "function") {
    initSizePicker("weeklySizePicker", function () {}, "post");
  }

  var downloadBtn = document.getElementById("downloadWeeklyBtn");
  var canvas = document.getElementById("weeklyCardCanvas");
  if (downloadBtn && canvas) {
    downloadBtn.addEventListener("click", function () {
      var size = getSelectedSize("weeklySizePicker", "post");
      loadWeeklyCardFonts().then(function () {
        drawWeeklyCard(canvas, WEEKLY_MESSAGE, size.w, size.h);
        var link = document.createElement("a");
        link.download = "말씀우물_이번주말씀_" + WEEKLY_MESSAGE.weekLabel + ".png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    });
  }
}
