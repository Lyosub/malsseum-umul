// 관리자 페이지 「🗺 오디세이」 탭 (2026-10-11).
// 학생별로 In Odyssey에서 뭘 샀고(달란트 사용), 어떤 일로 달란트를 얼마 얻었고, 지금 몇 편 몇 장인지, 재료·배지·펫 같은 얻은 것을 보여 준다.
// 서버 함수 get_odyssey_admin_overview(관리자·부장만)가 읽기 전용으로 내려주는 값만 쓴다.
// 학생이 직접 쓴 글은 서버가 아예 내려주지 않는다.

(function () {
  var TOTALS = { moses: 10, sinai2: 10, wild3: 16 };
  var SCROLLS = [
    { id: "moses", label: "1편 모세와 함께" },
    { id: "sinai2", label: "2편 시내산의 마지막 한 달" },
    { id: "wild3", label: "3편 광야 40년" }
  ];
  var EARN_LABELS = {
    odyssey_chapter: "장 완료 보상",
    odyssey_daily: "오늘의 퀘스트",
    odyssey_weekly: "이번 주 퀘스트",
    odyssey_worship: "예배 암호",
    odyssey_achieve: "업적"
  };
  var MAT_LABELS = {
    wood: "🪵 조각목", bronze: "🥉 놋", flax: "🌿 삼", papyrus: "🌾 파피루스", wool: "🐑 양털", goat: "🐐 염소 털",
    blue: "🟦 청색 실", purple: "🟪 자색 실", scarlet: "🟥 홍색 실", silver: "🥈 은", gold: "🥇 금"
  };
  var BADGE_LABELS = {
    wise: "⭐ 말씀을 새긴 마음", pray_start: "🙏 첫 기도", companion: "🤝 든든한 동행", prayer: "🕊 함께 드린 기도", share: "🌾 나누는 손"
  };

  var state = { rows: null, loading: false, sort: "recent", q: "" };

  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function fmt(iso) {
    if (!iso) return "-";
    var d = new Date(iso); if (isNaN(d)) return "-";
    var kst = new Date(d.getTime() + 9 * 3600e3);
    return (kst.getUTCMonth() + 1) + "/" + kst.getUTCDate() + " " + String(kst.getUTCHours()).padStart(2, "0") + ":" + String(kst.getUTCMinutes()).padStart(2, "0");
  }

  // 한 두루마리의 진행: 클리어한 장 수와 지금 위치
  function prog(row, id) {
    var p = row[id];
    if (!p) return null;
    var ch = Number(p.ch) || 0, cleared = p.cleared === true || p.cleared === "true", step = Number(p.step) || 0;
    var total = TOTALS[id], done = Math.min(total, ch + (cleared ? 1 : 0));
    if (!done && !step && !cleared) return { done: 0, total: total, where: "아직 시작 전" };
    var where = done >= total ? "모두 완료" : (done + 1) + "장 " + (step + 1) + "단계 진행 중";
    return { done: done, total: total, where: where };
  }

  function petLevel(aff, newScale) {
    var need = newScale ? [40, 120, 250] : [20, 50, 85];
    var lv = 1; need.forEach(function (n) { if (aff >= n) lv++; });
    return lv;
  }

  function summaryLine(r) {
    var parts = SCROLLS.map(function (s, i) {
      var p = prog(r, s.id);
      return p ? (i + 1) + "편 " + p.done + "/" + p.total : null;
    }).filter(Boolean);
    if (!parts.length) parts = ["진행 기록 없음"];
    return parts.join(" · ") + " · 🛒 " + r.spent_total + "달란트 사용 · 💰 " + r.earned_total + "달란트 획득";
  }

  function detailHtml(r) {
    var h = "";
    // 진행
    h += '<div class="meta" style="margin:8px 0 2px;"><strong>📍 진행</strong> · 마지막 저장 ' + fmt(r.saved_at) + '</div>';
    var any = false;
    SCROLLS.forEach(function (s) {
      var p = prog(r, s.id);
      if (!p) return;
      any = true;
      h += '<div class="content" style="font-size:13px;">' + esc(s.label) + ' · ' + p.done + '/' + p.total + '장 클리어 · ' + esc(p.where) + '</div>';
    });
    if (!any) h += '<div class="content" style="font-size:13px;">저장된 진행 기록이 아직 없어요.</div>';

    // 달란트: 얻음
    h += '<div class="meta" style="margin:10px 0 2px;"><strong>💰 달란트 얻은 곳</strong> · 합계 ' + r.earned_total + '달란트</div>';
    if (r.earned && r.earned.length) {
      h += r.earned.map(function (e) {
        return '<div class="content" style="font-size:13px;">' + esc(EARN_LABELS[e.type] || e.type) + ' · ' + e.n + '번 · ' + e.pts + '달란트</div>';
      }).join("");
    } else {
      h += '<div class="content" style="font-size:13px;">아직 없어요.</div>';
    }

    // 달란트: 씀
    h += '<div class="meta" style="margin:10px 0 2px;"><strong>🛒 산 것</strong> · ' + r.buy_n + '건 · ' + r.spent_total + '달란트</div>';
    if (r.orders && r.orders.length) {
      h += r.orders.map(function (o) {
        var name = String(o.name || "").replace(/^\[게임\]\s*/, "");
        var rejected = o.status === "rejected";
        return '<div class="content" style="font-size:13px;' + (rejected ? 'opacity:.5;text-decoration:line-through;' : '') + '">' +
          esc(name) + ' · ' + o.cost + '달란트 · ' + fmt(o.at) + (rejected ? ' (거절·환불)' : '') + '</div>';
      }).join("");
    } else {
      h += '<div class="content" style="font-size:13px;">산 것이 없어요.</div>';
    }

    // 얻은 것
    h += '<div class="meta" style="margin:10px 0 2px;"><strong>🎒 얻은 것</strong></div>';
    var mats = Object.keys(r.mat || {}).filter(function (k) { return Number(r.mat[k]) > 0; }).map(function (k) {
      return esc(MAT_LABELS[k] || k) + " " + r.mat[k];
    });
    h += '<div class="content" style="font-size:13px;">재료: ' + (mats.length ? mats.join(" · ") : "없음") + '</div>';
    var badges = (r.badges || []).map(function (b) { return esc(BADGE_LABELS[b] || b); });
    h += '<div class="content" style="font-size:13px;">배지 ' + badges.length + '개' + (badges.length ? ': ' + badges.join(" · ") : '') + '</div>';
    h += '<div class="content" style="font-size:13px;">구절 카드 ' + (r.verses_n || 0) + '장 · ⭐ 지혜 별 ' + (r.stars || 0) + '</div>';
    var pets = Object.keys(r.pets || {});
    if (pets.length) {
      h += '<div class="content" style="font-size:13px;">펫: ' + pets.map(function (k) {
        var a = Number(r.pets[k]) || 0, ns = Number(r.pet_v) >= 2;
        return esc(k) + ' 친밀도 ' + a + (ns ? '/250' : '/100(예전 기준, 다음 접속 때 변환)') + ' · Lv.' + petLevel(a, ns);
      }).join(" · ") + '</div>';
    }
    return h;
  }

  function sorted(rows) {
    var a = rows.slice();
    var by = {
      recent: function (x, y) { return String(y.saved_at || "").localeCompare(String(x.saved_at || "")); },
      spent: function (x, y) { return y.spent_total - x.spent_total; },
      earned: function (x, y) { return y.earned_total - x.earned_total; },
      progress: function (x, y) { return score(y) - score(x); },
      name: function (x, y) { return String(x.nickname).localeCompare(String(y.nickname), "ko"); }
    }[state.sort];
    return a.sort(by || function () { return 0; });
  }
  function score(r) {
    return SCROLLS.reduce(function (sum, s, i) { var p = prog(r, s.id); return sum + (p ? p.done : 0) * (i + 1) * 100 + (p && p.done ? 0 : 0); }, 0);
  }

  function render() {
    var box = document.getElementById("odysseyAdminBody");
    if (!box) return;
    var rows = state.rows || [];
    var q = state.q.trim().toLowerCase();
    var shown = rows.filter(function (r) {
      return !q || String(r.nickname).toLowerCase().indexOf(q) >= 0 || String(r.real_name || "").toLowerCase().indexOf(q) >= 0;
    });
    var totalSpent = rows.reduce(function (a, r) { return a + r.spent_total; }, 0);
    var totalBuy = rows.reduce(function (a, r) { return a + r.buy_n; }, 0);
    var totalEarn = rows.reduce(function (a, r) { return a + r.earned_total; }, 0);
    var h = '<p class="meta" style="margin:0 0 8px;">참여 ' + rows.length + '명 · 산 것 ' + totalBuy + '건(' + totalSpent + '달란트) · 얻은 달란트 합계 ' + totalEarn + '</p>';
    h += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">' +
      '<input type="search" id="odysseyAdminQ" placeholder="이름 검색" value="' + esc(state.q) + '" style="flex:1;min-width:120px;">' +
      '<select id="odysseyAdminSort">' +
        [["recent", "최근 저장순"], ["progress", "진행 많은 순"], ["spent", "쓴 달란트 순"], ["earned", "얻은 달란트 순"], ["name", "이름순"]].map(function (o) {
          return '<option value="' + o[0] + '"' + (state.sort === o[0] ? " selected" : "") + '>' + o[1] + '</option>';
        }).join("") +
      '</select>' +
      '<button type="button" class="btn ghost" id="odysseyAdminReload" style="padding:6px 12px;font-size:12px;">새로고침</button></div>';
    if (!shown.length) {
      h += '<p class="msg">' + (rows.length ? "검색 결과가 없어요." : "아직 오디세이 기록이 있는 학생이 없어요.") + '</p>';
    } else {
      h += sorted(shown).map(function (r) {
        var who = esc(r.nickname) + (r.real_name ? "(" + esc(r.real_name) + ")" : "");
        return '<details class="member-fold" style="margin-bottom:6px;"><summary><strong>' + who + '</strong><br><span class="meta">' + esc(summaryLine(r)) + '</span></summary>' + detailHtml(r) + '</details>';
      }).join("");
    }
    box.innerHTML = h;
    var qEl = document.getElementById("odysseyAdminQ"), sEl = document.getElementById("odysseyAdminSort"), rEl = document.getElementById("odysseyAdminReload");
    if (qEl) qEl.addEventListener("input", function () { state.q = qEl.value; var pos = qEl.selectionStart; render(); var n = document.getElementById("odysseyAdminQ"); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) {} } });
    if (sEl) sEl.addEventListener("change", function () { state.sort = sEl.value; render(); });
    if (rEl) rEl.addEventListener("click", function () { load(true); });
  }

  function load(force) {
    var box = document.getElementById("odysseyAdminBody");
    if (!box || state.loading) return;
    if (state.rows && !force) { render(); return; }
    var client = typeof getClient === "function" ? getClient() : null;
    if (!client) { box.innerHTML = '<p class="msg">연결할 수 없어요.</p>'; return; }
    state.loading = true;
    box.innerHTML = '<p class="msg">불러오는 중...</p>';
    client.rpc("get_odyssey_admin_overview").then(function (res) {
      state.loading = false;
      if (res.error) { box.innerHTML = '<p class="msg">불러오지 못했어요. (' + esc(res.error.message || "오류") + ')</p>'; return; }
      state.rows = Array.isArray(res.data) ? res.data : [];
      render();
    }).catch(function () {
      state.loading = false;
      box.innerHTML = '<p class="msg">불러오지 못했어요.</p>';
    });
  }

  window.initAdminOdyssey = function () { load(false); };
})();
