// 말씀놀이터 전체 랭킹 — 게임마다 "제일 잘한 기록" 기준.
// 서버: get_playground_rankings(p_limit) / get_my_playground_ranks()
// 규칙은 sql-migrations/2026-09-18-playground-rankings.sql 참고.

function initRankings() {
  var TOP_N = 10;

  // 표시 순서와 이름. key 는 서버가 주는 game 값.
  var GAMES = [
    { key: "book_ot",       label: "성경책 순서 맞추기 (구약)", rule: "빠른 순",              type: "time" },
    { key: "book_nt",       label: "성경책 순서 맞추기 (신약)", rule: "빠른 순",              type: "time" },
    { key: "match_books",   label: "같은 성경 찾기 (성경책)",   rule: "빠른 순",              type: "time" },
    { key: "match_figures", label: "같은 성경 찾기 (인물)",     rule: "빠른 순",              type: "time" },
    { key: "ox",            label: "성경 O/X 스피드퀴즈",       rule: "많이 맞힌 순 · 동점이면 빠른 순", type: "correct_time" },
    { key: "chosung",       label: "성경 인물 초성 퀴즈",       rule: "많이 맞힌 순 · 동점이면 빠른 순", type: "correct_time" },
    { key: "verse_fill",    label: "말씀 빈칸 채우기",          rule: "많이 맞힌 순",          type: "correct" },
    { key: "verse_memory",  label: "오늘의 말씀 외우기",        rule: "빠른 순 · 힌트 1번당 +5초", type: "time" }
  ];

  var bodyEl = document.getElementById("rkBody");
  var mineCard = document.getElementById("rkMineCard");
  var mineList = document.getElementById("rkMineList");
  var client = (typeof getClient === "function") ? getClient() : null;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function fmtTime(ms) {
    if (ms == null) return "";
    var s = ms / 1000;
    if (s < 60) return (Math.round(s * 10) / 10) + "초";
    var m = Math.floor(s / 60);
    var rest = Math.round(s - m * 60);
    if (rest === 60) { m++; rest = 0; }
    return m + "분 " + rest + "초";
  }

  function scoreText(game, row) {
    if (game.type === "time") return fmtTime(row.time_ms);
    if (game.type === "correct") return row.correct + "개";
    // correct_time
    var t = row.time_ms != null ? " · " + fmtTime(row.time_ms) : "";
    return row.correct + "개" + t;
  }

  function medal(rank) {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return String(rank);
  }

  function renderGame(game, rows) {
    var html = '<div class="rk-game">'
      + '<div class="rk-hd"><h2>' + esc(game.label) + '</h2>'
      + '<span class="rk-rule">' + esc(game.rule) + '</span></div>';

    if (!rows.length) {
      html += '<p class="rk-empty">아직 기록이 없어요. 첫 번째 주인공이 되어볼까요?</p></div>';
      return html;
    }

    rows.forEach(function (r) {
      var cls = "rk-row";
      if (r.rank === 1) cls += " top1";
      else if (r.rank === 2) cls += " top2";
      else if (r.rank === 3) cls += " top3";
      if (r.is_mine) cls += " mine";

      html += '<div class="' + cls + '">'
        + '<span class="rk-no">' + medal(r.rank) + '</span>'
        + '<span class="rk-name">' + esc(r.nickname || "친구")
        + (r.is_mine ? '<span class="rk-mine-tag">나</span>' : '') + '</span>'
        + '<span class="rk-score">' + esc(scoreText(game, r)) + '</span>'
        + '</div>';
    });

    html += '</div>';
    return html;
  }

  function renderAll(rows) {
    var byGame = {};
    rows.forEach(function (r) {
      if (!byGame[r.game]) byGame[r.game] = [];
      byGame[r.game].push(r);
    });

    var html = "";
    GAMES.forEach(function (g) {
      html += renderGame(g, byGame[g.key] || []);
    });
    bodyEl.innerHTML = html;
  }

  function renderMine(rows) {
    if (!rows || !rows.length) return;
    var labelOf = {};
    GAMES.forEach(function (g) { labelOf[g.key] = g; });

    var html = "";
    rows.forEach(function (r) {
      var g = labelOf[r.game];
      if (!g) return;
      html += '<div class="rk-mine-row"><span>' + esc(g.label) + '</span>'
        + '<span><b>' + r.rank + '위</b> / ' + r.total + '명 · ' + esc(scoreText(g, r)) + '</span></div>';
    });
    if (html) {
      mineList.innerHTML = html;
      mineCard.style.display = "";
    }
  }

  if (!client) {
    bodyEl.innerHTML = '<p class="rk-empty">랭킹을 불러오지 못했어요.</p>';
    return;
  }

  client.rpc("get_playground_rankings", { p_limit: TOP_N }).then(function (res) {
    if (res && res.error) {
      bodyEl.innerHTML = '<p class="rk-empty">랭킹을 불러오지 못했어요.</p>';
      return;
    }
    renderAll(res.data || []);
  }, function () {
    bodyEl.innerHTML = '<p class="rk-empty">랭킹을 불러오지 못했어요.</p>';
  });

  getSession().then(function (session) {
    if (!session) return;
    client.rpc("get_my_playground_ranks", {}).then(function (res) {
      if (res && !res.error) renderMine(res.data || []);
    }, function () { /* 내 기록은 실패해도 전체 랭킹은 보이게 둔다 */ });
  }, function () { /* 비로그인은 전체 랭킹만 */ });
}
