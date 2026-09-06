// 같은 성경 찾기 (카드 뒤집기 짝 맞추기) — 4×4, 시작 버튼 → 3초 미리보기 → 3라운드
//  · books   : 같은 성경책 이름끼리 (창세기 ↔ 창세기)
//  · figures : 인물 ↔ 그 인물의 사건/상징 (모세 ↔ 홍해가 갈라짐)
// 한 라운드 8쌍(16장, 4×4). 3라운드 합산 시간으로 기록. 매주 월요일 내용이 바뀐다.
// auth.js의 getClient(), getSession()에 의존함. bookgame.js와 같은 기록/달란트 구조.

var MG_ROUNDS = 3;
var MG_ROUND_PAIRS = 8;                       // 한 라운드 짝 수 (4×4)
var MG_WEEK_PAIRS = MG_ROUNDS * MG_ROUND_PAIRS; // 한 주에 쓰는 총 짝 수 (24)
var MG_PREVIEW_MS = 3000;
var MG_WEEK_ANCHOR = Date.UTC(2026, 0, 5);    // 2026-01-05(월) 기준

var MG_BOOK_POOL = [
  "창세기", "출애굽기", "레위기", "민수기", "신명기",
  "여호수아", "사사기", "룻기", "사무엘상", "사무엘하",
  "열왕기상", "열왕기하", "역대상", "역대하", "에스라",
  "느헤미야", "에스더", "욥기", "시편", "잠언",
  "전도서", "아가", "이사야", "예레미야", "예레미야애가",
  "에스겔", "다니엘", "호세아", "요엘", "아모스",
  "오바댜", "요나", "미가", "나훔", "하박국",
  "스바냐", "학개", "스가랴", "말라기",
  "마태복음", "마가복음", "누가복음", "요한복음", "사도행전",
  "로마서", "고린도전서", "고린도후서", "갈라디아서", "에베소서",
  "빌립보서", "골로새서", "데살로니가전서", "데살로니가후서", "디모데전서",
  "디모데후서", "디도서", "빌레몬서", "히브리서", "야고보서",
  "베드로전서", "베드로후서", "요한일서", "요한이서", "요한삼서",
  "유다서", "요한계시록"
];

var MG_PAIR_POOL = [
  { person: "아담",   match: "선악과" },
  { person: "가인",   match: "아벨을 죽임" },
  { person: "에녹",   match: "하나님과 동행" },
  { person: "노아",   match: "방주" },
  { person: "아브라함", match: "이삭을 바침" },
  { person: "이삭",   match: "우물을 다시 팜" },
  { person: "야곱",   match: "사닥다리 꿈" },
  { person: "요셉",   match: "채색옷" },
  { person: "모세",   match: "홍해가 갈라짐" },
  { person: "여호수아", match: "여리고 성" },
  { person: "라합",   match: "붉은 줄" },
  { person: "기드온", match: "300 용사" },
  { person: "드보라", match: "여선지자 재판" },
  { person: "삼손",   match: "긴 머리카락" },
  { person: "룻",     match: "이삭을 주움" },
  { person: "한나",   match: "사무엘을 기도로 얻음" },
  { person: "사울",   match: "이스라엘 첫 왕" },
  { person: "다윗",   match: "골리앗" },
  { person: "솔로몬", match: "성전 건축" },
  { person: "엘리야", match: "갈멜산의 불" },
  { person: "엘리사", match: "요단강에 뜬 도끼" },
  { person: "느헤미야", match: "성벽 재건" },
  { person: "에스더", match: "왕 앞에 나아감" },
  { person: "욥",     match: "고난 중의 인내" },
  { person: "이사야", match: "스랍의 숯불" },
  { person: "예레미야", match: "눈물의 선지자" },
  { person: "에스겔", match: "마른 뼈 골짜기" },
  { person: "다니엘", match: "사자굴" },
  { person: "세 친구", match: "풀무불" },
  { person: "느부갓네살", match: "큰 신상 꿈" },
  { person: "요나",   match: "큰 물고기" },
  { person: "학개",   match: "성전 재건 촉구" },
  { person: "세례 요한", match: "광야의 외치는 소리" },
  { person: "동방박사", match: "별을 따라옴" },
  { person: "베드로", match: "물 위를 걸음" },
  { person: "마르다", match: "분주히 섬김" },
  { person: "삭개오", match: "뽕나무에 올라감" },
  { person: "도마",   match: "손의 못자국 확인" },
  { person: "스데반", match: "첫 순교자" },
  { person: "빌립",   match: "에디오피아 내시" },
  { person: "고넬료", match: "이방인 첫 회심" },
  { person: "바울",   match: "다메섹 회심" },
  { person: "디모데", match: "바울의 믿음의 아들" },
  { person: "요한",   match: "밧모섬의 계시" }
];

var mgMode = "books";           // books | figures
var mgPhase = "idle";           // idle | preview | playing | roundDone | done
var mgRound = 0;                // 0..MG_ROUNDS-1
var mgRoundMs = [];             // 라운드별 소요 시간
var mgWeekItems = [];           // 이번 주에 쓸 24개
var mgDeck = [];
var mgFlipped = [];
var mgMatchedCount = 0;
var mgLock = false;
var mgRoundStart = null;
var mgTimerInterval = null;
var mgPreviewTimer = null;

function mgWeekIndex() {
  return Math.floor((Date.now() - MG_WEEK_ANCHOR) / (7 * 86400000));
}

function mgWeeklySlice(pool) {
  var n = MG_WEEK_PAIRS;
  var start = (mgWeekIndex() * n % pool.length + pool.length) % pool.length;
  var out = [];
  for (var i = 0; i < n; i++) out.push(pool[(start + i) % pool.length]);
  return out;
}

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

function mgTotalMs() {
  var sum = 0;
  for (var i = 0; i < mgRoundMs.length; i++) sum += mgRoundMs[i];
  if (mgPhase === "playing" && mgRoundStart != null) sum += Date.now() - mgRoundStart;
  return sum;
}

function mgUpdateTimerDisplay() {
  var el = document.getElementById("mgTimer");
  if (el) el.textContent = mgFormatTime(mgTotalMs());
}

function mgSetProgress(text) {
  var el = document.getElementById("mgProgress");
  if (el) el.textContent = text;
}

function mgRoundItems(roundIdx) {
  return mgWeekItems.slice(roundIdx * MG_ROUND_PAIRS, roundIdx * MG_ROUND_PAIRS + MG_ROUND_PAIRS);
}

function mgBuildCards(roundIdx) {
  var cards = [];
  mgRoundItems(roundIdx).forEach(function (it, i) {
    if (mgMode === "figures") {
      cards.push({ pairId: i, label: it.person });
      cards.push({ pairId: i, label: it.match });
    } else {
      cards.push({ pairId: i, label: it });
      cards.push({ pairId: i, label: it });
    }
  });
  return mgShuffle(cards);
}

function mgRenderBoard(faceUp) {
  var grid = document.getElementById("mgGrid");
  if (!grid) return;
  grid.innerHTML = mgDeck.map(function (c) {
    return (
      '<button type="button" class="match-card' + (faceUp ? " flipped" : "") + '" data-pair-id="' + c.pairId + '">' +
        '<span class="mc-back">📖</span>' +
        '<span class="mc-front">' + escapeHtmlMatchGame(c.label) + '</span>' +
      '</button>'
    );
  }).join("");
  grid.querySelectorAll(".match-card").forEach(function (card) {
    card.addEventListener("click", function () { mgOnCardClick(card); });
  });
}

function mgStartRound(roundIdx) {
  clearTimeout(mgPreviewTimer);
  mgRound = roundIdx;
  mgMatchedCount = 0;
  mgFlipped = [];
  mgLock = false;
  mgRoundStart = null;
  mgPhase = "preview";
  mgDeck = mgBuildCards(roundIdx);
  mgRenderBoard(true); // 전부 앞면
  mgSetProgress((roundIdx + 1) + "라운드 · 카드를 외워보세요! (3초)");

  mgPreviewTimer = setTimeout(function () {
    document.querySelectorAll("#mgGrid .match-card").forEach(function (c) { c.classList.remove("flipped"); });
    mgPhase = "playing";
    mgRoundStart = Date.now();
    if (!mgTimerInterval) mgTimerInterval = setInterval(mgUpdateTimerDisplay, 87);
    mgSetProgress((roundIdx + 1) + "라운드 · 맞춘 짝 0 / " + MG_ROUND_PAIRS);
  }, MG_PREVIEW_MS);
}

function mgOnCardClick(card) {
  if (mgPhase !== "playing" || mgLock) return;
  if (card.classList.contains("flipped") || card.classList.contains("matched")) return;

  card.classList.add("flipped");
  mgFlipped.push(card);
  if (mgFlipped.length < 2) return;

  var a = mgFlipped[0], b = mgFlipped[1];
  if (a.getAttribute("data-pair-id") === b.getAttribute("data-pair-id")) {
    a.classList.add("matched");
    b.classList.add("matched");
    mgFlipped = [];
    mgMatchedCount++;
    mgSetProgress((mgRound + 1) + "라운드 · 맞춘 짝 " + mgMatchedCount + " / " + MG_ROUND_PAIRS);
    if (mgMatchedCount >= MG_ROUND_PAIRS) mgFinishRound();
  } else {
    mgLock = true;
    setTimeout(function () {
      a.classList.remove("flipped");
      b.classList.remove("flipped");
      mgFlipped = [];
      mgLock = false;
    }, 700);
  }
}

function mgFinishRound() {
  mgRoundMs.push(Date.now() - mgRoundStart);
  mgRoundStart = null;
  mgPhase = "roundDone";

  if (mgRound + 1 < MG_ROUNDS) {
    mgSetProgress((mgRound + 1) + "라운드 완료! 잠시 후 다음 라운드가 시작돼요.");
    setTimeout(function () { mgStartRound(mgRound + 1); }, 1400);
  } else {
    mgFinishGame();
  }
}

function mgFinishGame() {
  clearInterval(mgTimerInterval);
  mgTimerInterval = null;
  mgPhase = "done";
  var total = mgTotalMs();
  mgUpdateTimerDisplay();
  mgSetProgress("완료!");

  var resultCard = document.getElementById("mgResultCard");
  if (resultCard) resultCard.style.display = "block";
  var timeEl = document.getElementById("mgResultTime");
  if (timeEl) timeEl.textContent = mgFormatTime(total);

  var msgEl = document.getElementById("mgResultMsg");
  var client = getClient();
  if (!client || !msgEl) { if (msgEl) msgEl.textContent = ""; return; }

  getSession().then(function (session) {
    if (!session) {
      msgEl.textContent = "로그인하면 기록 저장하고 +2달란트 받을 수 있어요.";
      return;
    }
    client.rpc("submit_match_game_score", { p_time_ms: Math.round(total), p_mode: mgMode }).then(function (res) {
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

function mgResetGame() {
  clearInterval(mgTimerInterval);
  clearTimeout(mgPreviewTimer);
  mgTimerInterval = null;
  mgPhase = "idle";
  mgRound = 0;
  mgRoundMs = [];
  mgFlipped = [];
  mgMatchedCount = 0;
  mgLock = false;
  mgRoundStart = null;
  mgWeekItems = mgMode === "figures" ? mgWeeklySlice(MG_PAIR_POOL) : mgWeeklySlice(MG_BOOK_POOL);
  mgDeck = [];

  var timerEl = document.getElementById("mgTimer");
  if (timerEl) timerEl.textContent = "00:00.0";
  var resultCard = document.getElementById("mgResultCard");
  if (resultCard) resultCard.style.display = "none";

  var grid = document.getElementById("mgGrid");
  if (grid) grid.innerHTML = '<p class="msg" style="grid-column:1/-1;text-align:center;padding:30px 0;">▶ 시작을 누르면 게임이 시작돼요<br>(4×4 · 8쌍씩 3라운드)</p>';
  mgSetProgress("시작을 누르면 3초 동안 카드를 보여줘요 · 총 " + MG_ROUNDS + "라운드");

  var startBtn = document.getElementById("mgStartBtn");
  if (startBtn) { startBtn.style.display = "block"; startBtn.disabled = false; }
}

function mgStart() {
  if (mgPhase !== "idle") return;
  var startBtn = document.getElementById("mgStartBtn");
  if (startBtn) startBtn.style.display = "none";
  mgRoundMs = [];
  mgStartRound(0);
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
  if (mgPhase !== "idle" && mgPhase !== "done") {
    if (!confirm("게임을 그만두고 버전을 바꿀까요?")) return;
  }
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
  var tag = document.getElementById("mgWeekTag");
  if (tag) tag.textContent = "이번 주 세트 · 매주 월요일 새 문제로 바뀜";

  mgResetGame();
  mgLoadMyBest();
  mgLoadLeaderboard();

  var startBtn = document.getElementById("mgStartBtn");
  if (startBtn) startBtn.addEventListener("click", mgStart);
  var resetBtn = document.getElementById("mgResetBtn");
  if (resetBtn) resetBtn.addEventListener("click", mgResetGame);
  var booksBtn = document.getElementById("mgModeBooks");
  var figuresBtn = document.getElementById("mgModeFigures");
  if (booksBtn) booksBtn.addEventListener("click", function () { mgSetMode("books"); });
  if (figuresBtn) figuresBtn.addEventListener("click", function () { mgSetMode("figures"); });
}
