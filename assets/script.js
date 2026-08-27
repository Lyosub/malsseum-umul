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

function initWellForm() {
  var form = document.getElementById("wellForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var input = document.getElementById("concernInput").value.trim();
    var resultEl = document.getElementById("wellResult");
    if (!input) {
      resultEl.innerHTML = '<p class="msg">고민이나 마음 상태를 몇 단어로 적어주세요.</p>';
      return;
    }
    var verse = matchConcernVerse(input);
    resultEl.style.display = "block";
    renderVerseInto("wellVerseCard", verse);
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
        '<h3>' + type + ' — ' + v.figure + '</h3>' +
        '<div class="sub">' + v.verse.ref + '</div>' +
        '<p style="font-style:italic;color:var(--text-soft);">"' + v.verse.text + '"</p>' +
        '<p>' + v.desc + '</p>';
      detail.classList.add("open");
      detail.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  });
}
