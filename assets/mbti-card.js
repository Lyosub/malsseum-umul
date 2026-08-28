// MBTI 성경인물 카드 이미지 생성/다운로드 (1080x1350, 인스타 4:5 비율)

var CARD_W = 1080;
var CARD_H = 1350;

function wrapTextCard(ctx, text, maxWidth) {
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

function firstSentence(text) {
  var idx = text.indexOf("다. ");
  if (idx === -1) idx = text.indexOf("다.");
  if (idx !== -1) return text.slice(0, idx + 2);
  return text.length > 60 ? text.slice(0, 60) + "..." : text;
}

function loadCharacterImage(type) {
  return new Promise(function (resolve) {
    var img = new Image();
    img.onload = function () { resolve(img); };
    img.onerror = function () { resolve(null); };
    img.src = "assets/characters/" + type + ".png";
  });
}

function loadCardFonts() {
  var specs = [
    '800 130px "Pretendard"',
    '400 44px "Pretendard"',
    '400 32px "Pretendard"',
    '400 30px "Pretendard"'
  ];
  var promises = specs.map(function (spec) {
    return document.fonts.load(spec).catch(function () {});
  });
  return Promise.all(promises).then(function () {
    return document.fonts.ready;
  });
}

function drawMbtiCard(canvas, type, data, W, H, charImg) {
  W = W || CARD_W;
  H = H || CARD_H;
  var ctx = canvas.getContext("2d");
  canvas.width = W;
  canvas.height = H;

  var grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#6bc6c9");
  grad.addColorStop(0.45, "#14707a");
  grad.addColorStop(1, "#0e3d44");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // 인물 이미지 뒤 은은한 광원
  var bgGlow = ctx.createRadialGradient(W / 2, H * 0.33, 10, W / 2, H * 0.33, W * 0.55);
  bgGlow.addColorStop(0, "rgba(255,255,255,0.16)");
  bgGlow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = bgGlow;
  ctx.fillRect(0, 0, W, H);

  // 가장자리 은은한 빛 입자
  [[0.12, 0.12, 8], [0.85, 0.08, 5], [0.91, 0.3, 4], [0.08, 0.36, 5],
   [0.14, 0.63, 4], [0.89, 0.66, 6], [0.1, 0.85, 5], [0.83, 0.9, 4]].forEach(function (d) {
    ctx.beginPath();
    ctx.arc(W * d[0], H * d[1], d[2], 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.28)";
    ctx.fill();
  });

  // 하단 물결 실루엣 (우물 컨셉)
  ctx.fillStyle = "rgba(255,255,255,0.07)";
  ctx.beginPath();
  ctx.moveTo(0, H * 0.86);
  ctx.bezierCurveTo(W * 0.25, H * 0.83, W * 0.35, H * 0.9, W * 0.6, H * 0.87);
  ctx.bezierCurveTo(W * 0.8, H * 0.85, W * 0.9, H * 0.91, W, H * 0.88);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.beginPath();
  ctx.moveTo(0, H * 0.91);
  ctx.bezierCurveTo(W * 0.3, H * 0.94, W * 0.5, H * 0.89, W * 0.75, H * 0.93);
  ctx.bezierCurveTo(W * 0.9, H * 0.95, W * 0.95, H * 0.92, W, H * 0.94);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();

  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0,0,0,0.25)";
  ctx.shadowBlur = 12;

  ctx.fillStyle = "#ffffff";
  ctx.font = '800 130px "Pretendard"';
  ctx.fillText(type, W / 2, H * 0.163);

  ctx.font = '400 34px "Pretendard", sans-serif';
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillText("나와 닮은 성경 속 인물", W / 2, H * 0.207);

  var figureY, verseRefY, vy;
  if (charImg) {
    var boxSize = H * 0.19;
    var boxTop = H * 0.235;
    var scale = Math.min(boxSize / charImg.width, boxSize / charImg.height);
    var drawW = charImg.width * scale;
    var drawH = charImg.height * scale;
    ctx.shadowBlur = 0;
    ctx.drawImage(charImg, W / 2 - drawW / 2, boxTop + (boxSize - drawH) / 2, drawW, drawH);
    ctx.shadowColor = "rgba(0,0,0,0.25)";
    ctx.shadowBlur = 12;
    figureY = H * 0.5;
    verseRefY = H * 0.54;
    vy = H * 0.585;
  } else {
    figureY = H * 0.296;
    verseRefY = H * 0.341;
    vy = H * 0.4;
  }

  ctx.font = '400 56px "Pretendard", serif';
  ctx.fillStyle = "#ffffff";
  ctx.fillText(data.figure, W / 2, figureY);

  ctx.font = '400 32px "Pretendard", serif';
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText(data.verse.ref, W / 2, verseRefY);

  ctx.shadowBlur = 8;
  ctx.font = '400 36px "Pretendard", serif';
  ctx.fillStyle = "#ffffff";
  var verseLines = wrapTextCard(ctx, '"' + data.verse.text + '"', W * 0.82);
  verseLines.forEach(function (line, i) {
    ctx.fillText(line, W / 2, vy + i * 50);
  });

  var descY = vy + verseLines.length * 50 + 60;
  ctx.font = '400 30px "Pretendard", sans-serif';
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  var descLines = wrapTextCard(ctx, firstSentence(data.desc), W * 0.78);
  descLines.forEach(function (line, i) {
    ctx.fillText(line, W / 2, descY + i * 44);
  });

  ctx.shadowBlur = 0;
  ctx.font = '400 28px "Pretendard", sans-serif';
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillText("💧 말씀우물", W / 2, H - 60);

  // 전체 가장자리 비네트 (깊이감)
  var vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.75);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.18)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
}

function saveMbtiCard(type) {
  var canvas = document.getElementById("mbtiCardCanvas");
  if (!canvas) return;
  var data = MBTI_BIBLE[type];
  if (!data) return;

  var size = (typeof getSelectedSize === "function") ? getSelectedSize("mbtiSizePicker", "post") : { w: CARD_W, h: CARD_H };

  Promise.all([loadCardFonts(), loadCharacterImage(type)]).then(function (results) {
    var charImg = results[1];
    drawMbtiCard(canvas, type, data, size.w, size.h, charImg);
    var link = document.createElement("a");
    link.download = "말씀우물_" + type + "_성경인물카드.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}
