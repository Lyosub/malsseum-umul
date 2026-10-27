// 말씀우물 — 추수감사 특별판 말씀 카드 (2026-10-27)
// 구절은 2026-10-27 대한성서공회 개역개정 원문과 대조했다. 새 구절을 넣으면 다시 대조할 것.
// 기존 하루·주간·월간 뽑기(서버 기록·달란트)와 섞이지 않게 기기(localStorage)에만 저장한다.

var THANKS_UNTIL = new Date(2026, 10, 30, 23, 59, 59); // 11/30까지 보이고 그 뒤엔 숨는다(?thanks 로 미리보기)

var THANKS_POOL = [
  { ref: "시편 136:1", text: "여호와께 감사하라 그는 선하시며 그 인자하심이 영원함이로다",
    interpretation: "시편 136편은 스물여섯 절 모두가 「그 인자하심이 영원함이로다」로 끝납니다. 감사의 이유가 내 형편이 아니라 하나님이 어떤 분이신가에 있다는 고백입니다.",
    note: "오늘 하나님이 선하시다고 느낀 순간을 하나만 떠올려 보세요.",
    prayer: "선하신 하나님, 제 형편이 바뀌어도 변하지 않는 주님의 인자하심을 감사합니다. 오늘 하루도 그 사랑 안에서 살게 해 주세요. 예수님의 이름으로 기도합니다. 아멘." },
  { ref: "데살로니가전서 5:16-18", text: "항상 기뻐하라 쉬지 말고 기도하라 범사에 감사하라 이것이 그리스도 예수 안에서 너희를 향하신 하나님의 뜻이니라",
    interpretation: "바울은 감사를 기분이 아니라 「하나님의 뜻」이라고 부릅니다. 모든 일이 좋아서가 아니라, 모든 일 속에 함께하시는 하나님이 계시기에 감사할 수 있습니다.",
    note: "오늘 당연하게 지나친 일 하나에 「감사합니다」라고 말해 보세요.",
    prayer: "하나님, 좋은 일만이 아니라 모든 일 속에서 주님을 찾게 해 주세요. 기뻐하고 기도하고 감사하는 하루가 되게 해 주세요. 예수님의 이름으로 기도합니다. 아멘." },
  { ref: "시편 50:23", text: "감사로 제사를 드리는 자가 나를 영화롭게 하나니 그의 행위를 옳게 하는 자에게 내가 하나님의 구원을 보이리라",
    interpretation: "하나님은 많은 제물보다 감사하는 마음을 기뻐하신다고 말씀하십니다. 감사는 하나님께 드리는 예배입니다.",
    note: "이번 주 예배 때 감사한 일 하나를 마음에 품고 나아가 보세요.",
    prayer: "하나님, 제 감사가 주님께 드리는 예배가 되게 해 주세요. 입술만이 아니라 삶으로 감사하게 해 주세요. 예수님의 이름으로 기도합니다. 아멘." },
  { ref: "골로새서 3:15", text: "그리스도의 평강이 너희 마음을 주장하게 하라 너희는 평강을 위하여 한 몸으로 부르심을 받았나니 너희는 또한 감사하는 자가 되라",
    interpretation: "바울은 교회를 「한 몸」이라고 부르며 감사하는 사람이 되라고 합니다. 감사는 혼자 하는 것이 아니라 함께 부르심 받은 사람들 사이에서 자라납니다.",
    note: "고마운 친구나 선생님께 감사 한마디를 전해 보세요.",
    prayer: "주님, 함께 예배하는 친구들과 선생님들을 감사합니다. 우리 마음에 그리스도의 평강이 가득하게 해 주세요. 예수님의 이름으로 기도합니다. 아멘." },
  { ref: "시편 103:2", text: "내 영혼아 여호와를 송축하며 그의 모든 은택을 잊지 말지어다",
    interpretation: "다윗은 자기 영혼에게 「잊지 말라」고 말합니다. 감사는 하나님이 베푸신 은혜를 기억하는 데서 시작됩니다.",
    note: "올해 하나님이 베푸신 은혜 세 가지를 적어 보세요.",
    prayer: "하나님, 바쁘게 지내느라 잊어버린 주님의 은혜가 많습니다. 하나하나 기억하며 감사하게 해 주세요. 예수님의 이름으로 기도합니다. 아멘." },
  { ref: "하박국 3:17-18", text: "비록 무화과나무가 무성하지 못하며 포도나무에 열매가 없으며 감람나무에 소출이 없으며 밭에 먹을 것이 없으며 우리에 양이 없으며 외양간에 소가 없을지라도 나는 여호와로 말미암아 즐거워하며 나의 구원의 하나님으로 말미암아 기뻐하리로다",
    interpretation: "하박국은 열매도 양도 소도 없는 상황을 그리며 「그럴지라도」 하나님으로 기뻐하겠다고 고백합니다. 가진 것이 아니라 하나님 자신이 기쁨의 이유입니다.",
    note: "잘 안 풀리는 일이 있어도 하나님이 함께하신다는 사실에 감사해 보세요.",
    prayer: "구원의 하나님, 원하는 것이 없을 때에도 주님 때문에 기뻐하게 해 주세요. 주님만으로 충분하다고 고백하게 해 주세요. 예수님의 이름으로 기도합니다. 아멘." },
  { ref: "시편 9:1", text: "내가 전심으로 여호와께 감사하오며 주의 모든 기이한 일들을 전하리이다",
    interpretation: "다윗의 감사는 마음속에 머물지 않고 「전하리이다」로 이어집니다. 감사는 하나님이 하신 일을 다른 사람에게 이야기하는 것으로 자랍니다.",
    note: "하나님이 해 주신 일 하나를 가족이나 친구에게 이야기해 보세요.",
    prayer: "하나님, 온 마음으로 감사합니다. 주님이 하신 일을 부끄러워하지 않고 친구들에게 전하게 해 주세요. 예수님의 이름으로 기도합니다. 아멘." },
  { ref: "고린도후서 9:15", text: "말할 수 없는 그의 은사로 말미암아 하나님께 감사하노라",
    interpretation: "바울은 하나님이 주신 선물을 「말할 수 없는」 것이라고 부릅니다. 말로 다 할 수 없는 가장 큰 선물은 예수 그리스도이십니다.",
    note: "예수님을 보내 주신 하나님께 감사의 기도를 드려 보세요.",
    prayer: "하나님, 말로 다 할 수 없는 선물인 예수님을 주셔서 감사합니다. 이 은혜를 날마다 새롭게 기억하게 해 주세요. 예수님의 이름으로 기도합니다. 아멘." },
  { ref: "에베소서 5:20", text: "범사에 우리 주 예수 그리스도의 이름으로 항상 아버지 하나님께 감사하며",
    interpretation: "우리는 「예수 그리스도의 이름으로」 하나님께 감사합니다. 예수님 덕분에 하나님을 「아버지」라고 부르며 감사할 수 있습니다.",
    note: "식사 기도 때 오늘 감사한 일을 한 가지 더 넣어 보세요.",
    prayer: "아버지 하나님, 예수님 덕분에 하나님을 아버지라 부를 수 있어 감사합니다. 범사에 감사하는 자녀가 되게 해 주세요. 예수님의 이름으로 기도합니다. 아멘." },
  { ref: "골로새서 2:7", text: "그 안에 뿌리를 박으며 세움을 받아 교훈을 받은 대로 믿음에 굳게 서서 감사함을 넘치게 하라",
    interpretation: "나무가 뿌리를 깊이 내려야 열매를 맺듯, 예수님 안에 뿌리를 내린 사람에게 감사가 넘쳐납니다. 감사는 믿음이 자라고 있다는 열매입니다.",
    note: "말씀을 읽고 기도하는 시간을 하루 5분 정해 보세요.",
    prayer: "주님, 제 믿음이 주님 안에 깊이 뿌리내리게 해 주세요. 흔들릴 때에도 굳게 서서 감사가 넘치게 해 주세요. 예수님의 이름으로 기도합니다. 아멘." },
  { ref: "시편 65:11", text: "주의 은택으로 한 해를 관 씌우시니 주의 길에는 기름 방울이 떨어지며",
    interpretation: "시인은 한 해의 추수를 하나님이 씌워 주신 「관」으로 노래합니다. 한 해 동안 누린 모든 열매가 하나님의 은혜라는 고백입니다.",
    note: "올 한 해 받은 은혜를 떠올리며 감사 목록을 만들어 보세요.",
    prayer: "하나님, 올 한 해를 은혜로 덮어 주셔서 감사합니다. 제가 누린 모든 것이 주님께로부터 왔음을 잊지 않게 해 주세요. 예수님의 이름으로 기도합니다. 아멘." },
  { ref: "야고보서 1:17", text: "온갖 좋은 은사와 온전한 선물이 다 위로부터 빛들의 아버지께로부터 내려오나니 그는 변함도 없으시고 회전하는 그림자도 없으시니라",
    interpretation: "야고보는 모든 좋은 선물이 「빛들의 아버지」께로부터 온다고 말합니다. 해와 달은 기울고 그림자가 생기지만, 하나님은 변함이 없으십니다.",
    note: "내가 가진 좋은 것 하나를 떠올리고, 그것을 주신 하나님께 감사해 보세요.",
    prayer: "빛들의 아버지 하나님, 제 삶의 모든 좋은 것이 주님께로부터 왔습니다. 변함없으신 주님을 감사합니다. 예수님의 이름으로 기도합니다. 아멘." }
];

function thanksActive() {
  return /[?&]thanks\b/.test(location.search) || new Date() <= THANKS_UNTIL;
}

function thanksTodayKey() {
  var d = new Date();
  return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
}

function thanksLoad() {
  try {
    var s = JSON.parse(localStorage.getItem("msu_thanks_2026") || "null");
    if (s && s.day === thanksTodayKey() && THANKS_POOL[s.index]) return s;
  } catch (e) {}
  return null;
}

function thanksSave(s) {
  try { localStorage.setItem("msu_thanks_2026", JSON.stringify(s)); } catch (e) {}
}

function initThanksCard() {
  var box = document.getElementById("thanksBox");
  if (!box || !thanksActive()) return;
  box.hidden = false;
  var btn = document.getElementById("thanksDrawBtn");
  var card = document.getElementById("thanksCard");
  var area = document.getElementById("thanksSaveArea");
  var input = document.getElementById("thanksLine");
  var state = thanksLoad();

  function show() {
    var v = THANKS_POOL[state.index];
    card.innerHTML =
      '<div class="ref">' + v.ref + '</div>' +
      '<div class="text">' + v.text + '</div>' +
      '<div class="qt-section"><span class="qt-label">📖 말씀 설명</span><div class="qt-body">' + v.interpretation + '</div></div>' +
      '<div class="qt-section"><span class="qt-label">🎯 오늘의 감사 실천</span><div class="qt-body">' + v.note + '</div></div>' +
      '<div class="qt-section"><span class="qt-label">🙏 감사 기도</span><div class="qt-body">' + v.prayer + '</div></div>';
    card.style.display = "block";
    area.style.display = "block";
    btn.style.display = "none";
    input.value = state.line || "";
  }

  btn.addEventListener("click", function () {
    state = { day: thanksTodayKey(), index: Math.floor(Math.random() * THANKS_POOL.length), line: "" };
    thanksSave(state);
    show();
  });
  input.addEventListener("input", function () {
    if (!state) return;
    state.line = input.value.slice(0, 40);
    thanksSave(state);
  });
  if (typeof initSizePicker === "function") initSizePicker("thanksSizePicker", function () {}, "post");
  if (state) show();
}

function thanksWrap(ctx, text, maxW) {
  // 한글은 띄어쓰기 단위로 줄을 바꾸되, 한 단어가 너무 길면 글자 단위로 자른다.
  var out = [], cur = "";
  text.split(" ").forEach(function (w) {
    var t = cur ? cur + " " + w : w;
    if (ctx.measureText(t).width <= maxW || !cur) { cur = t; } else { out.push(cur); cur = w; }
    while (ctx.measureText(cur).width > maxW && cur.length > 1) {
      var i = cur.length - 1;
      while (i > 1 && ctx.measureText(cur.slice(0, i)).width > maxW) i--;
      out.push(cur.slice(0, i)); cur = cur.slice(i);
    }
  });
  if (cur) out.push(cur);
  return out;
}

function drawThanksCard(canvas, v, line, W, H) {
  var ctx = canvas.getContext("2d");
  canvas.width = W; canvas.height = H;
  var GOLD = "#f3d28b";

  // 늦가을 들판 빛: 깊은 밤색 → 호박색
  var g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#2a1408"); g.addColorStop(0.55, "#6b3412"); g.addColorStop(1, "#b8691f");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  var r = ctx.createRadialGradient(W / 2, H * 0.92, 10, W / 2, H * 0.92, W * 0.9);
  r.addColorStop(0, "rgba(255,214,140,0.45)"); r.addColorStop(1, "rgba(255,214,140,0)");
  ctx.fillStyle = r; ctx.fillRect(0, 0, W, H);

  // 아래쪽 이삭 실루엣
  ctx.save();
  ctx.strokeStyle = "rgba(40,18,6,0.55)"; ctx.fillStyle = "rgba(40,18,6,0.55)"; ctx.lineWidth = 3;
  for (var i = 0; i < 26; i++) {
    var x = (i + 0.5) * W / 26 + Math.sin(i * 7.3) * 14;
    var top = H - 170 - Math.abs(Math.sin(i * 2.1)) * 120;
    var lean = Math.sin(i * 3.7) * 26;
    ctx.beginPath(); ctx.moveTo(x, H); ctx.quadraticCurveTo(x, (H + top) / 2, x + lean, top); ctx.stroke();
    for (var k = 0; k < 6; k++) {
      var t = k / 6, yy = top + 10 + k * 13, xx = x + lean * (1 - t * 0.15);
      ctx.beginPath(); ctx.ellipse(xx - 7, yy, 4, 9, -0.6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(xx + 7, yy, 4, 9, 0.6, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();

  // 금색 테두리 두 줄
  ctx.strokeStyle = "rgba(243,210,139,0.85)"; ctx.lineWidth = 3;
  ctx.strokeRect(36, 36, W - 72, H - 72);
  ctx.strokeStyle = "rgba(243,210,139,0.4)"; ctx.lineWidth = 1.5;
  ctx.strokeRect(50, 50, W - 100, H - 100);

  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0,0,0,0.35)";

  ctx.font = '800 46px "Pretendard"';
  var lines = thanksWrap(ctx, "“" + v.text + "”", W * 0.76);
  var LH = 64;
  var myLines = [];
  if (line) { ctx.font = '700 36px "Pretendard"'; myLines = thanksWrap(ctx, line, W * 0.66); }
  var boxH = myLines.length ? 96 + myLines.length * 50 : 0;
  var total = 150 + lines.length * LH + (boxH ? 50 + boxH : 0);
  var y = Math.max(120, (H - 120 - total) / 2);

  ctx.shadowBlur = 0;
  ctx.font = '700 24px "Pretendard"'; ctx.fillStyle = GOLD;
  ctx.fillText("THANKSGIVING  2026", W / 2, y);
  ctx.font = '800 34px "Pretendard"'; ctx.fillStyle = "#fff4dc";
  ctx.fillText("🌾 추수감사 특별판 🌾", W / 2, y + 52);
  ctx.font = '700 38px "Pretendard"'; ctx.fillStyle = GOLD;
  ctx.fillText(v.ref, W / 2, y + 128);

  ctx.shadowBlur = 10; ctx.fillStyle = "#ffffff"; ctx.font = '800 46px "Pretendard"';
  var qy = y + 128 + 78;
  lines.forEach(function (l, i) { ctx.fillText(l, W / 2, qy + i * LH); });

  if (myLines.length) {
    var by = qy + (lines.length - 1) * LH + 60, bw = W * 0.74, bx = (W - bw) / 2;
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255,244,220,0.14)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, by, bw, boxH, 28); else ctx.rect(bx, by, bw, boxH);
    ctx.fill();
    ctx.strokeStyle = "rgba(243,210,139,0.7)"; ctx.lineWidth = 2; ctx.stroke();
    ctx.font = '700 26px "Pretendard"'; ctx.fillStyle = GOLD;
    ctx.fillText("나의 감사", W / 2, by + 50);
    ctx.font = '700 36px "Pretendard"'; ctx.fillStyle = "#fff4dc";
    myLines.forEach(function (l, i) { ctx.fillText(l, W / 2, by + 104 + i * 50); });
  }

  ctx.shadowBlur = 0;
  ctx.font = '400 24px "Pretendard"';
  var fw = ctx.measureText("💧 말씀우물 · 로고스교회 중등부").width + 44;
  ctx.fillStyle = "rgba(40,18,6,0.7)";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect((W - fw) / 2, H - 112, fw, 52, 26); else ctx.rect((W - fw) / 2, H - 112, fw, 52);
  ctx.fill();
  ctx.fillStyle = "rgba(255,244,220,0.9)";
  ctx.fillText("💧 말씀우물 · 로고스교회 중등부", W / 2, H - 76);
}

function saveThanksCard() {
  var s = thanksLoad();
  if (!s) return;
  var canvas = document.getElementById("thanksCanvas");
  var size = getSelectedSize("thanksSizePicker", "post");
  var line = (s.line || "").trim();
  (typeof loadVerseCardFonts === "function" ? loadVerseCardFonts() : Promise.resolve()).then(function () {
    drawThanksCard(canvas, THANKS_POOL[s.index], line, size.w, size.h);
    var a = document.createElement("a");
    a.download = "말씀우물_추수감사_특별판.png";
    a.href = canvas.toDataURL("image/png");
    a.click();
  });
}
