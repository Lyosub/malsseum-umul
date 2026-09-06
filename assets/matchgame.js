// 같은 성경 찾기 (카드 뒤집기 짝 맞추기)
// 인물 카드와 그 인물의 사건/상징 카드를 짝지어 모두 맞추면 완료. 완료 시간으로 기록을 매긴다.
// 쉬움(8쌍/16장) / 도전(16쌍/32장) 두 모드를 따로 도전하고 따로 랭킹을 매긴다.
// auth.js의 getClient(), getSession()에 의존함. bookgame.js와 같은 기록/달란트 구조.

var MG_PAIRS = [
  { person: "노아",   match: "방주" },
  { person: "모세",   match: "홍해가 갈라짐" },
  { person: "다윗",   match: "골리앗" },
  { person: "다니엘", match: "사자굴" },
  { person: "요나",   match: "큰 물고기" },
  { person: "삼손",   match: "긴 머리카락" },
  { person: "아브라함", match: "이삭을 바침" },
  { person: "여호수아", match: "여리고 성" },
  // --- 도전 모드에서만 추가되는 8쌍 ---
  { person: "엘리야", match: "갈멜산의 불" },
  { person: "베드로", match: "물 위를 걸음" },
  { person: "바울",   match: "다메섹 회심" },
  { person: "룻",     match: "이삭을 주움" },
  { person: "요셉",   match: "채색옷" },
  { person: "느헤미야", match: "성벽 재건" },
  { person: "에스더", match: "왕 앞에 나아감" },
  { person: "세례 요한", match: "광야의 외치는 소리" }
];

var mgMode = "easy";        // easy(8쌍) | hard(16쌍)
var mgDeck = [];
var mgFlipped = [];         // 현재 뒤집혀 있고 아직 판정 안 된 카드 엘리먼트들
var mgMatchedCount = 0;
var mgLock = false;         // 애니메이션 중 클릭 방지
var mgStartTime = null;
var mgTimerInterval = null;
var mgFinished = false;

function mgPairCount() { return mgMode === "hard" ? 16 : 8; }

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
  el.textContent = mgMatchedCount >= mgPairCount()
    ? "완료!"
    : "맞춘 짝: " + mgMatchedCount + " / " + mgPairCount();
}

function mgStartGame() {
  mgStartTime = Date.now();
  mgFinished = false;
  mgTimerInterval = setInterval(mgUpdateTimerDisplay, 87);
}

function mgRenderBoard() {
  var grid = document.getElementById("mgGrid");
  if (!grid) return;
  var pairs = MG_PAIRS.slice(0, mgPairCount());
  var cards = [];
  pairs.forEach(function (p, i) {
    cards.push({ pairId: i, label: p.person });
    cards.push({ pairId: i, label: p.match });
  });
  mgDeck = mgShuffle(cards);
  grid.innerHTML = mgDeck.map(function (c) {
    return (
      '<button type="button" class="match-card" data-pair-id="' + c.pairId + '">' +
        '<span class="mc-back">📖</span>' +
        '<span class="mc-front">' + c.label + '</span>' +
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
    if (mgMatchedCount >= mgPairCount()) mgFinishGame();
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
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function mgSetMode(mode) {
  mgMode = mode;
  var easyBtn = document.getElementById("mgModeEasy");
  var hardBtn = document.getElementById("mgModeHard");
  if (easyBtn && hardBtn) {
    easyBtn.className = mode === "easy" ? "btn block" : "btn ghost block";
    hardBtn.className = mode === "hard" ? "btn block" : "btn ghost block";
  }
  var grid = document.getElementById("mgGrid");
  if (grid) grid.classList.toggle("hard", mode === "hard");
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

  var easyBtn = document.getElementById("mgModeEasy");
  var hardBtn = document.getElementById("mgModeHard");
  if (easyBtn) easyBtn.addEventListener("click", function () { mgSetMode("easy"); });
  if (hardBtn) hardBtn.addEventListener("click", function () { mgSetMode("hard"); });
}
