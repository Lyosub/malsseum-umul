// 같은 성경 찾기 (카드 뒤집기 짝 맞추기) — 두 가지 버전
//  · books   : 같은 성경책 이름끼리 (창세기 ↔ 창세기)
//  · figures : 인물 ↔ 그 인물의 사건/상징 (모세 ↔ 홍해가 갈라짐)
// 각 버전 16쌍(32장), 버전별로 따로 최고기록·TOP10. 완료 시간으로 기록.
// auth.js의 getClient(), getSession()에 의존함. bookgame.js와 같은 기록/달란트 구조.

var MG_PAIR_COUNT = 16;

// 버전 1: 성경책 이름 (구약·신약에서 잘 알려진 16권)
var MG_BOOKS = [
  "창세기", "출애굽기", "여호수아", "사무엘상", "시편", "잠언", "이사야", "다니엘",
  "요나", "마태복음", "요한복음", "사도행전", "로마서", "고린도전서", "히브리서", "요한계시록"
];

// 버전 2: 인물 ↔ 사건/상징 (A안)
var MG_PAIRS = [
  { person: "노아",   match: "방주" },
  { person: "모세",   match: "홍해가 갈라짐" },
  { person: "다윗",   match: "골리앗" },
  { person: "다니엘", match: "사자굴" },
  { person: "요나",   match: "큰 물고기" },
  { person: "삼손",   match: "긴 머리카락" },
  { person: "아브라함", match: "이삭을 바침" },
  { person: "여호수아", match: "여리고 성" },
  { person: "엘리야", match: "갈멜산의 불" },
  { person: "베드로", match: "물 위를 걸음" },
  { person: "바울",   match: "다메섹 회심" },
  { person: "룻",     match: "이삭을 주움" },
  { person: "요셉",   match: "채색옷" },
  { person: "느헤미야", match: "성벽 재건" },
  { person: "에스더", match: "왕 앞에 나아감" },
  { person: "세례 요한", match: "광야의 외치는 소리" }
];

var mgMode = "books";       // books | figures
var mgDeck = [];
var mgFlipped = [];
var mgMatchedCount = 0;
var mgLock = false;
var mgStartTime = null;
var mgTimerInterval = null;
var mgFinished = false;

function mgShuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function mgFormatTime(ms) {
  var totalSec = ms / 1000;
  var m = Math.floor(totalSec / 60);
  var s = (totalSec - m * 60).toFixed(1);
  return String(m).padStart(2, "0") + ":" + (Number(s) < 10 ? "0" : "") + s;
}

function mgUpdateTimerDisplay() {
  var el = document.getElementById("mgTimer");
  if (!el || mgStartTime === null) return;
  el.textContent = mgFormatTime(Date.now() - mgStartTime);
}

function mgUpdateProgress() {
  var el = document.getElementById("mgProgress");
  if (!el) return;
  el.textContent = mgMatchedCount >= MG_PAIR_COUNT
    ? "완료!"
    : "맞춘 짝: " + mgMatchedCount + " / " + MG_PAIR_COUNT;
}

function mgStartGame() {
  mgStartTime = Date.now();
  mgFinished = false;
  mgTimerInterval = setInterval(mgUpdateTimerDisplay, 87);
}

function mgBuildCards() {
  var cards = [];
  if (mgMode === "figures") {
    MG_PAIRS.slice(0, MG_PAIR_COUNT).forEach(function (p, i) {
      cards.push({ pairId: i, label: p.person });
      cards.push({ pairId: i, label: p.match });
    });
  } else {
    MG_BOOKS.slice(0, MG_PAIR_COUNT).forEach(function (name, i) {
      cards.push({ pairId: i, label: name });
      cards.push({ pairId: i, label: name });
    });
  }
  return cards;
}

function mgRenderBoard() {
  var grid = document.getElementById("mgGrid");
  if (!grid) return;
  mgDeck = mgShuffle(mgBuildCards());
  grid.innerHTML = mgDeck.map(function (c) {
    return (
      '<button type="button" class="match-card" data-pair-id="' + c.pairId + '">' +
        '<span class="mc-back">📖</span>' +
        '<span class="mc-front">' + escapeHtmlMatchGame(c.label) + '</span>' +
      '</button>'
    );
  }).join("");

  grid.querySelectorAll(".match-card").forEach(function (card) {
    card.addEventListener("click", function () { mgOnCardClick(card); });
  });
}

function mgOnCardClick(card) {
  if (mgLock || mgFinished) return;
  if (card.classList.contains("flipped") || card.classList.contains("matched")) return;

  if (mgStartTime === null) mgStartGame();

  card.classList.add("flipped");
  mgFlipped.push(card);

  if (mgFlipped.length < 2) return;

  var a = mgFlipped[0], b = mgFlipped[1];
  if (a.getAttribute("data-pair-id") === b.getAttribute("data-pair-id")) {
    a.classList.add("matched");
    b.classList.add("matched");
    mgFlipped = [];
    mgMatchedCount++;
    mgUpdateProgress();
    if (mgMatchedCount >= MG_PAIR_COUNT) mgFinishGame();
  } else {
    mgLock = true;
    setTimeout(function () {
      a.classList.remove("flipped");
      b.classList.remove("flipped");
      mgFlipped = [];
      mgLock = false;
    }, 750);
  }
}

function mgResetGame() {
  clearInterval(mgTimerInterval);
  mgFlipped = [];
  mgMatchedCount = 0;
  mgLock = false;
  mgStartTime = null;
  mgFinished = false;
  var timerEl = document.getElementById("mgTimer");
  if (timerEl) timerEl.textContent = "00:00.0";
  var resultCard = document.getElementById("mgResultCard");
  if (resultCard) resultCard.style.display = "none";
  mgUpdateProgress();
  mgRenderBoard();
}

function mgFinishGame() {
  mgFinished = true;
  clearInterval(mgTimerInterval);
  var elapsed = Date.now() - mgStartTime;
  var resultCard = document.getElementById("mgResultCard");
  if (resultCard) resultCard.style.display = "block";
  var timeEl = document.getElementById("mgResultTime");
  if (timeEl) timeEl.textContent = mgFormatTime(elapsed);

  var msgEl = document.getElementById("mgResultMsg");
  var client = getClient();
  if (!client || !msgEl) { if (msgEl) msgEl.textContent = ""; return; }

  getSession().then(function (session) {
    if (!session) {
      msgEl.textContent = "로그인하면 기록 저장하고 +2달란트 받을 수 있어요.";
      return;
    }
    client.rpc("submit_match_game_score", { p_time_ms: Math.round(elapsed), p_mode: mgMode }).then(function (res) {
      if (res.error) { msgEl.textContent = "기록 저장에 실패했어요."; return; }
      var row = (res.data && res.data[0]) || {};
      var parts = [];
      if (row.is_new_best) parts.push("🎉 개인 최고기록 경신!");
      if (row.points_awarded) parts.push("+" + row.points_awarded + "달란트 (오늘 첫 참여)");
      msgEl.textContent = parts.join(" · ") || "수고하셨어요!";
      mgLoadLeaderboard();
      mgLoadMyBest();
    });
  });
}

function mgLoadMyBest() {
  var client = getClient();
  var el = document.getElementById("mgMyBest");
  if (!client || !el) return;
  getSession().then(function (session) {
    if (!session) { el.textContent = ""; return; }
    client.rpc("get_my_match_game_score", { p_mode: mgMode }).then(function (res) {
      if (res.error || res.data == null) { el.textContent = "아직 기록이 없어요. 한 번 도전해보세요!"; return; }
      el.textContent = "내 최고기록: " + mgFormatTime(res.data);
    });
  });
}

function mgLoadLeaderboard() {
  var client = getClient();
  var el = document.getElementById("mgLeaderboard");
  if (!client || !el) return;
  getSession().then(function (session) {
    if (!session) { el.innerHTML = '<p class="msg">로그인하면 볼 수 있어요.</p>'; return; }
    client.rpc("get_match_game_leaderboard", { p_mode: mgMode }).then(function (res) {
      if (res.error || !res.data || !res.data.length) {
        el.innerHTML = '<p class="msg">아직 기록이 없어요.</p>';
        return;
      }
      el.innerHTML = res.data.map(function (row, i) {
        return (
          '<div class="note-item"><div class="content" style="display:flex;justify-content:space-between;">' +
            '<span>' + (i + 1) + '위 · ' + escapeHtmlMatchGame(row.nickname) + '</span>' +
            '<span style="font-weight:800;color:var(--well-deep);">' + mgFormatTime(row.best_time_ms) + '</span>' +
          '</div></div>'
        );
      }).join("");
    });
  });
}

function escapeHtmlMatchGame(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function mgSetMode(mode) {
  mgMode = mode;
  var booksBtn = document.getElementById("mgModeBooks");
  var figuresBtn = document.getElementById("mgModeFigures");
  if (booksBtn && figuresBtn) {
    booksBtn.className = mode === "books" ? "btn block" : "btn ghost block";
    figuresBtn.className = mode === "figures" ? "btn block" : "btn ghost block";
  }
  var hint = document.getElementById("mgHint");
  if (hint) {
    hint.textContent = mode === "figures"
      ? "인물과 그 인물의 사건·상징을 짝지어 보세요."
      : "같은 성경책 이름 두 장을 짝지어 보세요.";
  }
  mgResetGame();
  mgLoadMyBest();
  mgLoadLeaderboard();
}

function initMatchGame() {
  mgRenderBoard();
  mgUpdateProgress();
  mgLoadMyBest();
  mgLoadLeaderboard();

  var resetBtn = document.getElementById("mgResetBtn");
  if (resetBtn) resetBtn.addEventListener("click", mgResetGame);

  var booksBtn = document.getElementById("mgModeBooks");
  var figuresBtn = document.getElementById("mgModeFigures");
  if (booksBtn) booksBtn.addEventListener("click", function () { mgSetMode("books"); });
  if (figuresBtn) figuresBtn.addEventListener("click", function () { mgSetMode("figures"); });
}
