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

function drawMbtiCard(canvas, type, data) {
  var ctx = canvas.getContext("2d");
  canvas.width = CARD_W;
  canvas.height = CARD_H;

  var grad = ctx.createLinearGradient(0, 0, 0, CARD_H);
  grad.addColorStop(0, "#6bc6c9");
  grad.addColorStop(0.45, "#14707a");
  grad.addColorStop(1, "#0e3d44");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0,0,0,0.25)";
  ctx.shadowBlur = 12;

  ctx.fillStyle = "#ffffff";
  ctx.font = '800 130px "Pretendard"';
  ctx.fillText(type, CARD_W / 2, 220);

  ctx.font = '400 34px "Pretendard", sans-serif';
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillText("나와 닮은 성경 속 인물", CARD_W / 2, 280);

  ctx.font = '400 56px "Pretendard", serif';
  ctx.fillStyle = "#ffffff";
  ctx.fillText(data.figure, CARD_W / 2, 400);

  ctx.font = '400 32px "Pretendard", serif';
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText(data.verse.ref, CARD_W / 2, 460);

  ctx.shadowBlur = 8;
  ctx.font = '400 36px "Pretendard", serif';
  ctx.fillStyle = "#ffffff";
  var verseLines = wrapTextCard(ctx, '"' + data.verse.text + '"', CARD_W * 0.82);
  var vy = 540;
  verseLines.forEach(function (line, i) {
    ctx.fillText(line, CARD_W / 2, vy + i * 50);
  });

  var descY = vy + verseLines.length * 50 + 60;
  ctx.font = '400 30px "Pretendard", sans-serif';
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  var descLines = wrapTextCard(ctx, firstSentence(data.desc), CARD_W * 0.78);
  descLines.forEach(function (line, i) {
    ctx.fillText(line, CARD_W / 2, descY + i * 44);
  });

  ctx.shadowBlur = 0;
  ctx.font = '400 28px "Pretendard", sans-serif';
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillText("💧 말씀우물", CARD_W / 2, CARD_H - 60);
}

function saveMbtiCard(type) {
  var canvas = document.getElementById("mbtiCardCanvas");
  if (!canvas) return;
  var data = MBTI_BIBLE[type];
  if (!data) return;

  loadCardFonts().then(function () {
    drawMbtiCard(canvas, type, data);
    var link = document.createElement("a");
    link.download = "말씀우물_" + type + "_성경인물카드.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}
