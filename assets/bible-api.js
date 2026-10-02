// 성경 읽기 — 이 사이트는 성경 본문을 가져오거나 저장하지 않는다.
// 책·장을 고르면 대한성서공회 성경플랫폼의 **개역개정판** 읽기 화면으로 연결한다(assets/bible-books.js 의 주소 규칙 사용).
// 2026-10-02: 예전의 Bolls API(개역한글 KRV) 방식을 없애고 개역개정판 연결로 바꿨다.

function initBibleReader() {
  var bookSelect = document.getElementById("bookSelect");
  var chapterSelect = document.getElementById("chapterSelect");
  var readBtn = document.getElementById("readBtn");
  var resultEl = document.getElementById("chapterResult");
  if (!bookSelect || typeof BIBLE_BOOKS === "undefined") return;

  bookSelect.innerHTML = BIBLE_BOOKS.map(function (b) {
    return '<option value="' + b[0] + '" data-chapters="' + b[3] + '">' + b[1] + '</option>';
  }).join("");
  populateChapters();
  applyDeepLink();

  function selectedBook() {
    return findBibleBook(bookSelect.value);
  }

  function populateChapters() {
    var b = selectedBook();
    var chapters = b ? b.chapters : 1;
    var opts = [];
    for (var i = 1; i <= chapters; i++) opts.push('<option value="' + i + '">' + i + '장</option>');
    chapterSelect.innerHTML = opts.join("");
  }

  // 다른 페이지(말씀우물 결과 등)에서 read.html?book=빌립보서&chapter=4 로 들어오면 그 책·장을 골라 둔다.
  // (옛 링크의 개역한글식 이름 — 마태복음서·여호수아기 등 — 도 알아본다.)
  function applyDeepLink() {
    var params = new URLSearchParams(location.search);
    var wantBook = params.get("book");
    var wantCh = parseInt(params.get("chapter"), 10);
    if (!wantBook) return;
    var b = findBibleBook(wantBook);
    if (!b) return;
    bookSelect.value = String(b.id);
    populateChapters();
    if (wantCh >= 1 && wantCh <= b.chapters) chapterSelect.value = String(wantCh);
    showResult(false);
  }

  // 고른 책·장의 안내 카드를 보여 준다. record=true 면 "마지막으로 연 곳"으로 저장하고 새 창을 연다.
  function showResult(record) {
    var b = selectedBook();
    var chapter = parseInt(chapterSelect.value, 10) || 1;
    var url = b ? bibleReadUrl(b.id, chapter) : "";
    if (!b || !url) {
      resultEl.innerHTML = '<p class="msg">책과 장을 다시 골라 주세요.</p>';
      return;
    }
    var prev = chapter > 1 ? '<button type="button" class="btn ghost" data-step="-1">◀ 이전 장</button>' : '<span></span>';
    var next = chapter < b.chapters ? '<button type="button" class="btn ghost" data-step="1">다음 장 ▶</button>' : '<span></span>';
    resultEl.innerHTML =
      '<h3 style="margin-top:0;color:var(--well-deep);">' + b.name + ' ' + chapter + '장</h3>' +
      '<p class="msg" style="margin:0 0 14px;">대한성서공회 성경 사이트(개역개정판)에서 이어서 읽어요. 새 창으로 열려요.</p>' +
      '<a class="btn block" id="openBibleLink" href="' + url + '" target="_blank" rel="noopener">📖 개역개정 본문 읽기 ↗</a>' +
      '<div style="display:flex;justify-content:space-between;gap:10px;margin-top:12px;">' + prev + next + '</div>';
    var link = document.getElementById("openBibleLink");
    if (link) link.addEventListener("click", function () { saveReadingProgress(b.id, b.name, chapter); });
    var steps = resultEl.querySelectorAll("button[data-step]");
    for (var i = 0; i < steps.length; i++) {
      steps[i].addEventListener("click", function () {
        chapterSelect.value = String(chapter + parseInt(this.getAttribute("data-step"), 10));
        showResult(false);
      });
    }
    if (record) {
      saveReadingProgress(b.id, b.name, chapter);
      window.open(url, "_blank", "noopener");
    }
  }

  bookSelect.addEventListener("change", function () { populateChapters(); resultEl.innerHTML = ""; });
  chapterSelect.addEventListener("change", function () { resultEl.innerHTML = ""; });
  readBtn.addEventListener("click", function () { showResult(true); });
}

// 사용자가 한 장을 열었을 때 "마지막으로 연 곳"을 저장한다(로그인 상태일 때만, 실패는 조용히 무시).
// 말씀 탭(word.html)의 "이어 읽기"가 이 기록을 쓴다. 달란트와는 무관하다.
function saveReadingProgress(bookId, bookName, chapter) {
  try {
    if (typeof getClient !== "function") return;
    var client = getClient();
    if (!client) return;
    getSession().then(function (session) {
      if (!session) return;
      client.rpc("set_reading_progress", {
        p_book_id: parseInt(bookId, 10) || 0,
        p_book_name: String(bookName || ""),
        p_chapter: parseInt(chapter, 10) || 1
      }).then(function () {}, function () {});
    });
  } catch (e) {}
}
