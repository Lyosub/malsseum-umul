// 성경 읽기 — Bolls Bible API(https://bolls.life) 사용, 번역본: KRV(개역한글, 공개영역)
// 참고: https://github.com/Bolls-Bible/bain/blob/master/docs/API.md

var BOLLS_BASE = "https://bolls.life";
var BIBLE_TRANSLATION = "KRV";
var _booksCache = null;

function fetchBibleBooks() {
  if (_booksCache) return Promise.resolve(_booksCache);
  return fetch(BOLLS_BASE + "/get-books/" + BIBLE_TRANSLATION + "/")
    .then(function (res) { return res.json(); })
    .then(function (data) {
      _booksCache = data;
      return data;
    });
}

function fetchBibleChapter(bookId, chapter) {
  return fetch(BOLLS_BASE + "/get-text/" + BIBLE_TRANSLATION + "/" + bookId + "/" + chapter + "/")
    .then(function (res) { return res.json(); })
    .then(function (data) {
      return data.map(function (v) {
        return { verse: v.verse, text: String(v.text || "").replace(/<[^>]+>/g, "") };
      });
    });
}

function initBibleReader() {
  var bookSelect = document.getElementById("bookSelect");
  var chapterSelect = document.getElementById("chapterSelect");
  var readBtn = document.getElementById("readBtn");
  var resultEl = document.getElementById("chapterResult");
  if (!bookSelect) return;

  fetchBibleBooks().then(function (books) {
    bookSelect.innerHTML = books.map(function (b) {
      return '<option value="' + b.bookid + '" data-chapters="' + b.chapters + '">' + b.name + '</option>';
    }).join("");
    populateChapters();
  }).catch(function () {
    bookSelect.innerHTML = '<option>불러오기 실패</option>';
  });

  function populateChapters() {
    var selected = bookSelect.options[bookSelect.selectedIndex];
    var chapters = parseInt(selected.getAttribute("data-chapters"), 10) || 1;
    var opts = [];
    for (var i = 1; i <= chapters; i++) opts.push('<option value="' + i + '">' + i + '장</option>');
    chapterSelect.innerHTML = opts.join("");
  }

  bookSelect.addEventListener("change", populateChapters);

  readBtn.addEventListener("click", function () {
    var bookId = bookSelect.value;
    var chapter = chapterSelect.value;
    var bookName = bookSelect.options[bookSelect.selectedIndex].text;
    resultEl.innerHTML = '<p class="msg">불러오는 중...</p>';
    fetchBibleChapter(bookId, chapter).then(function (verses) {
      resultEl.innerHTML =
        '<h3 style="margin-top:0;color:var(--well-deep);">' + bookName + ' ' + chapter + '장</h3>' +
        verses.map(function (v) {
          return '<p style="margin:0 0 10px;"><strong style="color:var(--well);">' + v.verse + '</strong> ' + v.text + '</p>';
        }).join("");
    }).catch(function () {
      resultEl.innerHTML = '<p class="msg">불러오는 데 실패했어요. 잠시 후 다시 시도해주세요.</p>';
    });
  });
}
