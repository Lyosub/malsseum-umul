function renderVerseInto(elId, verse) {
  var el = document.getElementById(elId);
  if (!el || !verse) return;
  el.innerHTML =
    '<div class="ref">' + verse.ref + '</div>' +
    '<div class="text">' + verse.text + '</div>' +
    (verse.note ? '<div class="note">' + verse.note + '</div>' : '');
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

function initFeaturedMbti() {
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
    '<a href="mbti.html" class="btn block" style="margin-top:10px;">MBTI 성경인물 더 보기</a>';
}

function initVerseTabs() {
  var tabs = document.querySelectorAll(".tabs button");
  if (!tabs.length) return;

  function show(kind) {
    renderVerseInto("verseCard", getVerseFor(kind));
    tabs.forEach(function (t) {
      t.classList.toggle("active", t.getAttribute("data-kind") === kind);
    });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      show(tab.getAttribute("data-kind"));
    });
  });

  show("daily");
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
        '<button class="btn block" onclick="saveMbtiCard(\'' + type + '\')">📸 카드로 저장하기</button>';
      detail.classList.add("open");
      detail.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  });
}
