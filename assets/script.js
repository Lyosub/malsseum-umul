function renderVerseInto(elId, verse) {
  var el = document.getElementById(elId);
  if (!el || !verse) return;
  el.innerHTML =
    '<div class="ref">' + verse.ref + '</div>' +
    '<div class="text">' + verse.text + '</div>' +
    (verse.interpretation ? '<div class="qt-section"><span class="qt-label">📖 말씀 설명</span><div class="qt-body">' + verse.interpretation + '</div></div>' : '') +
    (verse.note ? '<div class="qt-section"><span class="qt-label">🎯 오늘의 적용</span><div class="qt-body">' + verse.note + '</div></div>' : '') +
    (verse.prayer ? '<div class="qt-section"><span class="qt-label">🙏 오늘의 기도</span><div class="qt-body">' + verse.prayer + '</div></div>' : '');
}

function initHomeCard() {
  var el = document.getElementById("homeVerseCard");
  if (!el) return;
  renderVerseInto("homeVerseCard", getVerseFor("daily"));
}

function handleCharImgError(imgEl) {
  var placeholder = document.createElement("div");
  placeholder.style.cssText = "width:140px;height:140px;margin:0 auto 12px;border-radius:50%;background:var(--well-light);display:flex;align-items:center;justify-content:center;font-size:44px;color:#fff;";
  placeholder.textContent = "🧑";
  imgEl.replaceWith(placeholder);
}

function initFeaturedMbti(showLinkBtn) {
  if (showLinkBtn === undefined) showLinkBtn = true;
  var el = document.getElementById("featuredMbti");
  if (!el || typeof MBTI_BIBLE === "undefined") return;
  var type = getFeaturedMbtiType();
  var v = MBTI_BIBLE[type];
  var imgPath = "assets/characters/" + type + ".png";
  el.innerHTML =
    '<img src="' + imgPath + '" alt="' + type + ' ' + v.figure + ' 캐릭터" ' +
      'style="width:140px;height:140px;object-fit:contain;margin:0 auto 12px;display:block;" ' +
      'onerror="handleCharImgError(this)">' +
    '<div style="text-align:center;font-weight:800;color:var(--well-deep);">' + type + ' — ' + v.figure + '</div>' +
    '<div style="text-align:center;font-size:13px;color:var(--gold);margin:4px 0 10px;">' + v.verse.ref + '</div>' +
    '<p style="text-align:center;font-size:13.5px;color:var(--text-soft);">' + v.desc + '</p>' +
    (showLinkBtn ? '<a href="mbti.html" class="btn block" style="margin-top:10px;">MBTI 성경인물 더 보기</a>' : '');
}

var DRAW_LABELS = {
  daily: { draw: "오늘의 말씀 뽑기 🎲", already: "오늘은 이미 뽑으셨어요. 내일 다시 뽑을 수 있어요." },
  weekly: { draw: "이번 주 말씀 뽑기 🎲", already: "이번 주는 이미 뽑으셨어요. 다음 주에 다시 뽑을 수 있어요." },
  monthly: { draw: "이번 달 말씀 뽑기 🎲", already: "이번 달은 이미 뽑으셨어요. 다음 달에 다시 뽑을 수 있어요." }
};

function renderDrawnVerseInto(elId, verse, kind) {
  var el = document.getElementById(elId);
  if (!el || !verse) return;
  var extra = "";
  if (kind === "monthly" && verse.keyword) {
    extra =
      '<div class="qt-section">' +
        '<span class="qt-label">🗝️ 이달의 키워드</span>' +
        '<div class="qt-body" style="font-weight:800;font-size:15px;">' + verse.keyword + '</div>' +
      '</div>';
  }
  el.innerHTML =
    '<div class="ref">' + verse.ref + '</div>' +
    '<div class="text">' + verse.text + '</div>' +
    (verse.interpretation ? '<div class="qt-section"><span class="qt-label">📖 말씀 설명</span><div class="qt-body">' + verse.interpretation + '</div></div>' : '') +
    (verse.note ? '<div class="qt-section"><span class="qt-label">🎯 오늘의 적용</span><div class="qt-body">' + verse.note + '</div></div>' : '') +
    (verse.prayer ? '<div class="qt-section"><span class="qt-label">🙏 오늘의 기도</span><div class="qt-body">' + verse.prayer + '</div></div>' : '') +
    extra;
}

var _currentDrawnVerse = null;
var _currentDrawnKind = "daily";

function initVerseTabs() {
  var tabs = document.querySelectorAll(".tabs button");
  var drawBtn = document.getElementById("drawBtn");
  var drawMsg = document.getElementById("drawMsg");
  var cardEl = document.getElementById("verseCard");
  var saveArea = document.getElementById("verseSaveArea");
  if (!tabs.length || !drawBtn || !cardEl) return;

  function refresh() {
    var existing = getDrawnVerse(_currentDrawnKind);
    if (existing) {
      _currentDrawnVerse = existing;
      renderDrawnVerseInto("verseCard", existing, _currentDrawnKind);
      cardEl.style.display = "block";
      drawBtn.style.display = "none";
      if (saveArea) saveArea.style.display = "block";
      drawMsg.textContent = DRAW_LABELS[_currentDrawnKind].already;
    } else {
      _currentDrawnVerse = null;
      cardEl.style.display = "none";
      drawBtn.style.display = "block";
      drawBtn.textContent = DRAW_LABELS[_currentDrawnKind].draw;
      if (saveArea) saveArea.style.display = "none";
      drawMsg.textContent = "";
    }
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      _currentDrawnKind = tab.getAttribute("data-kind");
      tabs.forEach(function (t) {
        t.classList.toggle("active", t === tab);
      });
      refresh();
    });
  });

  drawBtn.addEventListener("click", function () {
    var verse = drawRandomVerse(_currentDrawnKind);
    _currentDrawnVerse = verse;
    renderDrawnVerseInto("verseCard", verse, _currentDrawnKind);
    cardEl.style.display = "block";
    drawBtn.style.display = "none";
    if (saveArea) saveArea.style.display = "block";
    drawMsg.textContent = DRAW_LABELS[_currentDrawnKind].already;
  });

  if (typeof initSizePicker === "function") {
    initSizePicker("verseSizePicker", function () {}, "post");
  }

  refresh();
}

function wrapTextGeneric(ctx, text, maxWidth) {
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

function loadVerseCardFonts() {
  var specs = ['800 56px "Pretendard"', '700 40px "Pretendard"', '400 28px "Pretendard"'];
  var promises = specs.map(function (spec) {
    return document.fonts.load(spec).catch(function () {});
  });
  return Promise.all(promises).then(function () { return document.fonts.ready; });
}

function drawVerseCardImage(canvas, verse, kind, W, H) {
  W = W || 1080;
  H = H || 1350;
  var ctx = canvas.getContext("2d");
  canvas.width = W;
  canvas.height = H;

  var grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#6bc6c9");
  grad.addColorStop(0.45, "#14707a");
  grad.addColorStop(1, "#0e3d44");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0,0,0,0.25)";
  ctx.shadowBlur = 12;

  var kindLabel = { daily: "오늘의 말씀", weekly: "이번 주 말씀", monthly: "이번 달 말씀" }[kind] || "말씀";
  ctx.font = '400 28px "Pretendard"';
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText(kindLabel, W / 2, H * 0.14);

  ctx.font = '700 40px "Pretendard"';
  ctx.fillStyle = "#ffffff";
  ctx.fillText(verse.ref, W / 2, H * 0.19);

  ctx.shadowBlur = 8;
  ctx.font = '800 44px "Pretendard"';
  var lines = wrapTextGeneric(ctx, '"' + verse.text + '"', W * 0.8);
  var y = H * 0.28;
  lines.forEach(function (line, i) {
    ctx.fillText(line, W / 2, y + i * 60);
  });

  var afterY = y + lines.length * 60 + 50;
  if (kind === "monthly" && verse.keyword) {
    ctx.shadowBlur = 6;
    ctx.font = '400 26px "Pretendard"';
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillText("이달의 키워드", W / 2, afterY);
    ctx.font = '800 38px "Pretendard"';
    ctx.fillStyle = "#ffffff";
    ctx.fillText(verse.keyword, W / 2, afterY + 50);
  } else if (verse.note) {
    ctx.shadowBlur = 6;
    ctx.font = '400 26px "Pretendard"';
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    var noteLines = wrapTextGeneric(ctx, verse.note, W * 0.72);
    noteLines.forEach(function (line, i) {
      ctx.fillText(line, W / 2, afterY + i * 36);
    });
  }

  ctx.shadowBlur = 0;
  ctx.font = '400 24px "Pretendard"';
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillText("💧 말씀우물", W / 2, H - 50);
}

function saveVerseCard() {
  var canvas = document.getElementById("verseCardCanvas");
  if (!canvas || !_currentDrawnVerse) return;
  var size = (typeof getSelectedSize === "function") ? getSelectedSize("verseSizePicker", "post") : { w: 1080, h: 1350 };

  loadVerseCardFonts().then(function () {
    drawVerseCardImage(canvas, _currentDrawnVerse, _currentDrawnKind, size.w, size.h);
    var link = document.createElement("a");
    link.download = "말씀우물_" + _currentDrawnKind + "_말씀카드.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}

function renderWellVerseInto(elId, verse) {
  var el = document.getElementById(elId);
  if (!el || !verse) return;
  el.innerHTML =
    '<div class="well-ref">' + verse.ref + '</div>' +
    '<div class="well-verse-text">"' + verse.text + '"</div>' +
    '<hr class="well-divider">' +
    '<div class="well-label">묵상</div>' +
    '<p class="well-meditation">' + (verse.meditation || "") + '</p>' +
    '<div class="well-prayer-box">' +
      '<div class="well-label">오늘의 기도</div>' +
      '<p class="well-prayer-text">' + (verse.prayer || "") + '</p>' +
    '</div>';
}

function initWellForm() {
  var form = document.getElementById("wellForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var wellMsg = document.getElementById("wellMsg");
    try {
      var input = document.getElementById("concernInput").value.trim();
      var resultEl = document.getElementById("wellResult");
      if (!input) {
        if (wellMsg) wellMsg.textContent = "고민이나 마음 상태를 몇 단어로 적어주세요.";
        return;
      }
      if (wellMsg) wellMsg.textContent = "";
      var verse = matchConcernVerse(input);
      resultEl.style.display = "block";
      renderWellVerseInto("wellVerseCard", verse);
      document.getElementById("concernInput").blur();
      resultEl.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      if (wellMsg) wellMsg.textContent = "일시적인 오류가 발생했어요. 새로고침 후 다시 시도해주세요.";
    }
  });
}

function initMbtiGrid() {
  var grid = document.getElementById("mbtiGrid");
  if (!grid) return;

  var types = Object.keys(MBTI_BIBLE);
  grid.innerHTML = types.map(function (t) {
    var v = MBTI_BIBLE[t];
    return (
      '<div class="mbti-item" data-type="' + t + '">' +
        '<div class="code">' + t + '</div>' +
        '<div class="figure">' + v.figure + '</div>' +
      '</div>'
    );
  }).join("");

  var detail = document.getElementById("mbtiDetail");

  grid.querySelectorAll(".mbti-item").forEach(function (item) {
    item.addEventListener("click", function () {
      var type = item.getAttribute("data-type");
      var v = MBTI_BIBLE[type];
      detail.innerHTML =
        '<img src="assets/characters/' + type + '.png" alt="' + type + ' ' + v.figure + ' 캐릭터" ' +
          'style="width:120px;height:120px;object-fit:contain;margin:0 auto 10px;display:block;" ' +
          'onerror="handleCharImgError(this)">' +
        '<h3>' + type + ' — ' + v.figure + '</h3>' +
        '<div class="sub">' + v.verse.ref + '</div>' +
        '<p style="font-style:italic;color:var(--text-soft);">"' + v.verse.text + '"</p>' +
        '<p>' + v.desc + '</p>' +
        '<p style="font-size:12.5px;color:var(--text-soft);margin:10px 0 6px;">저장할 사이즈를 골라주세요</p>' +
        '<div class="tabs" id="mbtiSizePicker"></div>' +
        '<button class="btn block" style="margin-top:10px;" onclick="saveMbtiCard(\'' + type + '\')">📸 카드로 저장하기</button>';
      detail.classList.add("open");
      if (typeof initSizePicker === "function") {
        initSizePicker("mbtiSizePicker", function () {}, "post");
      }
      detail.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  });
}
