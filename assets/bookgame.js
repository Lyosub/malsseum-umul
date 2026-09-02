// 성경책 순서 맞추기 게임: 섞여있는 책들을 순서대로 눌러야 한다. 구약(39권)/신약(27권)을
// 나눠서 따로 도전하고 따로 기록을 매긴다(66권을 한 번에 하기엔 너무 많다는 피드백 반영).
// auth.js의 getClient(), getSession()에 의존함

var BG_OT_BOOKS = [
  "창세기", "출애굽기", "레위기", "민수기", "신명기",
  "여호수아", "사사기", "룻기", "사무엘상", "사무엘하",
  "열왕기상", "열왕기하", "역대상", "역대하", "에스라",
  "느헤미야", "에스더", "욥기", "시편", "잠언",
  "전도서", "아가", "이사야", "예레미야", "예레미야애가",
  "에스겔", "다니엘", "호세아", "요엘", "아모스",
  "오바댜", "요나", "미가", "나훔", "하박국",
  "스바냐", "학개", "스가랴", "말라기"
];

var BG_NT_BOOKS = [
  "마태복음", "마가복음", "누가복음", "요한복음", "사도행전",
  "로마서", "고린도전서", "고린도후서", "갈라디아서", "에베소서",
  "빌립보서", "골로새서", "데살로니가전서", "데살로니가후서", "디모데전서",
  "디모데후서", "디도서", "빌레몬서", "히브리서", "야고보서",
  "베드로전서", "베드로후서", "요한일서", "요한이서", "요한삼서",
  "유다서", "요한계시록"
];

var bgMode = "ot";
var bgNextIndex = 0;
var bgStartTime = null;
var bgTimerInterval = null;
var bgFinished = false;

function bgCurrentBooks() {
  return bgMode === "nt" ? BG_NT_BOOKS : BG_OT_BOOKS;
}

function bgShuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

function bgFormatTime(ms) {
  var totalSec = ms / 1000;
  var m = Math.floor(totalSec / 60);
  var s = (totalSec - m * 60).toFixed(1);
  return String(m).padStart(2, "0") + ":" + (Number(s) < 10 ? "0" : "") + s;
}

function bgUpdateTimerDisplay() {
  var el = document.getElementById("bgTimer");
  if (!el || bgStartTime === null) return;
  el.textContent = bgFormatTime(Date.now() - bgStartTime);
}

function bgRenderGrid() {
  var grid = document.getElementById("bgGrid");
  if (!grid) return;
  var books = bgCurrentBooks();
  var order = books.map(function (name, i) { return { name: name, correctIndex: i }; });
  var shuffled = bgShuffle(order);
  grid.innerHTML = shuffled.map(function (item) {
    return '<button type="button" class="book-chip" data-correct-index="' + item.correctIndex + '">' + item.name + '</button>';
  }).join("");

  grid.querySelectorAll(".book-chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      if (bgFinished || chip.classList.contains("correct")) return;
      var idx = parseInt(chip.getAttribute("data-correct-index"), 10);
      if (idx === bgNextIndex) {
        chip.classList.add("correct");
        if (bgNextIndex === 0) bgStartGame();
        bgNextIndex++;
        bgUpdateProgress();
        if (bgNextIndex === bgCurrentBooks().length) bgFinishGame();
      } else {
        chip.classList.remove("wrong");
        void chip.offsetWidth;
        chip.classList.add("wrong");
        setTimeout(function () { chip.classList.remove("wrong"); }, 300);
      }
    });
  });
}

function bgUpdateProgress() {
  var el = document.getElementById("bgProgress");
  if (!el) return;
  var books = bgCurrentBooks();
  if (bgNextIndex >= books.length) {
    el.textContent = "완료!";
  } else {
    el.textContent = "다음 책: " + books[bgNextIndex];
  }
}

function bgStartGame() {
  bgStartTime = Date.now();
  bgFinished = false;
  bgTimerInterval = setInterval(bgUpdateTimerDisplay, 87);
}

function bgResetGame() {
  clearInterval(bgTimerInterval);
  bgNextIndex = 0;
  bgStartTime = null;
  bgFinished = false;
  var timerEl = document.getElementById("bgTimer");
  if (timerEl) timerEl.textContent = "00:00.0";
  document.getElementById("bgResultCard").style.display = "none";
  bgUpdateProgress();
  bgRenderGrid();
}

function bgFinishGame() {
  bgFinished = true;
  clearInterval(bgTimerInterval);
  var elapsed = Date.now() - bgStartTime;
  document.getElementById("bgResultCard").style.display = "block";
  document.getElementById("bgResultTime").textContent = bgFormatTime(elapsed);

  var msgEl = document.getElementById("bgResultMsg");
  var client = getClient();
  if (!client) {
    msgEl.textContent = "";
    return;
  }
  getSession().then(function (session) {
    if (!session) {
      msgEl.textContent = "로그인하면 기록 저장하고 +2달란트 받을 수 있어요.";
      return;
    }
    client.rpc("submit_book_game_score", { p_time_ms: Math.round(elapsed), p_mode: bgMode }).then(function (res) {
      if (res.error) {
        msgEl.textContent = "기록 저장에 실패했어요.";
        return;
      }
      var row = (res.data && res.data[0]) || {};
      var parts = [];
      if (row.is_new_best) parts.push("🎉 개인 최고기록 경신!");
      if (row.points_awarded) parts.push("+" + row.points_awarded + "달란트 (오늘 첫 참여)");
      msgEl.textContent = parts.join(" · ") || "수고하셨어요!";
      bgLoadLeaderboard();
      bgLoadMyBest();
    });
  });
}

function bgLoadMyBest() {
  var client = getClient();
  var el = document.getElementById("bgMyBest");
  if (!client || !el) return;
  getSession().then(function (session) {
    if (!session) { el.textContent = ""; return; }
    client.rpc("get_my_book_game_score", { p_mode: bgMode }).then(function (res) {
      if (res.error || res.data == null) { el.textContent = "아직 기록이 없어요. 한 번 도전해보세요!"; return; }
      el.textContent = "내 최고기록: " + bgFormatTime(res.data);
    });
  });
}

function bgLoadLeaderboard() {
  var client = getClient();
  var el = document.getElementById("bgLeaderboard");
  if (!client || !el) return;
  getSession().then(function (session) {
    if (!session) { el.innerHTML = '<p class="msg">로그인하면 볼 수 있어요.</p>'; return; }
    client.rpc("get_book_game_leaderboard", { p_mode: bgMode }).then(function (res) {
      if (res.error || !res.data || !res.data.length) {
        el.innerHTML = '<p class="msg">아직 기록이 없어요.</p>';
        return;
      }
      el.innerHTML = res.data.map(function (row, i) {
        return (
          '<div class="note-item"><div class="content" style="display:flex;justify-content:space-between;">' +
            '<span>' + (i + 1) + '위 · ' + escapeHtmlBookGame(row.nickname) + '</span>' +
            '<span style="font-weight:800;color:var(--well-deep);">' + bgFormatTime(row.best_time_ms) + '</span>' +
          '</div></div>'
        );
      }).join("");
    });
  });
}

function escapeHtmlBookGame(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function bgSetMode(mode) {
  bgMode = mode;
  var otBtn = document.getElementById("bgModeOt");
  var ntBtn = document.getElementById("bgModeNt");
  if (otBtn && ntBtn) {
    otBtn.className = mode === "ot" ? "btn block" : "btn ghost block";
    ntBtn.className = mode === "nt" ? "btn block" : "btn ghost block";
  }
  bgResetGame();
  bgLoadMyBest();
  bgLoadLeaderboard();
}

function initBookGame() {
  bgRenderGrid();
  bgUpdateProgress();
  bgLoadMyBest();
  bgLoadLeaderboard();

  var resetBtn = document.getElementById("bgResetBtn");
  if (resetBtn) resetBtn.addEventListener("click", bgResetGame);

  var otBtn = document.getElementById("bgModeOt");
  var ntBtn = document.getElementById("bgModeNt");
  if (otBtn) otBtn.addEventListener("click", function () { bgSetMode("ot"); });
  if (ntBtn) ntBtn.addEventListener("click", function () { bgSetMode("nt"); });
}
