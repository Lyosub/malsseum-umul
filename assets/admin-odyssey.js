// 관리자 페이지 「🗺 오디세이」 탭 (2026-10-11).
// 학생별로 In Odyssey에서 뭘 샀고(달란트 사용), 어떤 일로 달란트를 얼마 얻었고, 지금 몇 편 몇 장인지, 재료·배지·펫 같은 얻은 것을 보여 준다.
// 서버 함수 get_odyssey_admin_overview(관리자·부장만)가 읽기 전용으로 내려주는 값만 쓴다.
// 학생이 직접 쓴 글은 서버가 아예 내려주지 않는다.
// 2026-10-11 화면 정리: 학생 한 줄을 「이름 / 획득·사용 숫자 / 진행 막대」로 나누고, 펼친 상세는 칸(진행·달란트·산 것·얻은 것)별로 묶었다.

(function () {
  var TOTALS = { moses: 10, sinai2: 10, wild3: 16, joshua: 13, judges: 12, ruth: 9 };
  var SCROLLS = [
    { id: "moses", label: "1편", full: "1편 모세와 함께" },
    { id: "sinai2", label: "2편", full: "2편 시내산의 마지막 한 달" },
    { id: "wild3", label: "3편", full: "3편 광야 40년" },
    { id: "joshua", label: "4편", full: "4편 여호수아와 함께" },
    { id: "judges", label: "5편", full: "5편 사사들과 함께" },
    { id: "ruth", label: "6편", full: "6편 룻과 사무엘" }
  ];
  var EARN_LABELS = {
    odyssey_chapter: "장 완료 보상",
    odyssey_daily: "오늘의 퀘스트",
    odyssey_weekly: "이번 주 퀘스트",
    odyssey_worship: "예배 암호",
    odyssey_achieve: "업적"
  };
  // 이름표(게임 코드에서 뽑음 · 2026-10-11): 재료·배지·펫 키를 한글 이름으로
  var MAT_LABELS = {"wood": "🪵 조각목", "bronze": "🥉 놋", "flax": "🌿 삼(베 실)", "papyrus": "🌾 파피루스", "wool": "🐑 양털", "goat": "🐐 염소 털", "blue": "🟦 청색 실", "purple": "🟪 자색 실", "scarlet": "🟥 홍색 실", "silver": "🥈 은", "gold": "🥇 금", "onyx": "💎 호마노"};
  var BADGE_LABELS = {"wise": "⭐ 말씀을 새긴 마음", "pray_start": "🙏 첫 기도", "companion": "🤝 든든한 동행", "prayer": "🕊 함께 드린 기도", "share": "🌾 나누는 손", "trust": "🧭 하나님의 계획을 믿는 마음", "true_heart": "💗 진짜 마음", "passover_lamb": "🐑 넘어가신 은혜", "bold_step": "🌊 담대한 걸음", "together": "🤝 함께 건넌 마음", "timbrel": "🥁 소고 찬양", "daily_bread": "🍞 하루 분량의 믿음", "raised_hands": "🙌 붙들어 준 손", "true_leader": "⚖️ 진실한 사람을 알아본 눈", "ten_words": "🪨 십계명", "lords_side": "🙋 여호와의 편", "willing": "🎁 자원하는 마음", "as_commanded": "⛺ 명령하신 대로", "scroll_all": "📜 두루마리를 모은 사람", "idol_breaker": "🔨 우상을 깨뜨린 손", "craftsman": "🛠 지혜로운 손", "hidden_all": "❔ 숨은 이야기를 찾은 사람", "side_all": "📜 곁을 살핀 사람", "links_all": "🔗 말씀을 잇는 사람", "wild_runner": "🏃 광야를 달린 사람", "holy_people": "🌾 거룩한 백성", "trumpet_follow": "🎺 나팔 소리를 따르는 사람", "grape_carry": "🍇 젖과 꿀을 본 사람", "with_caleb": "🙌 갈렙과 함께 선 사람", "looked_up": "🐍 쳐다본 사람", "refuge_run": "🏃 도피성에 닿은 사람", "hear_israel": "👂 들으라 이스라엘"};
  var PET_LABELS = {"pet-donkey": "나귀", "pet-dove": "비둘기", "pet-puppy": "강아지"};

  var state = { rows: null, loading: false, sort: "recent", q: "" };

  var CSS = [
    ".oa-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:0 0 12px;}",
    ".oa-stat{border:1px solid rgba(128,128,128,.28);border-radius:12px;padding:10px 6px;text-align:center;}",
    ".oa-stat b{display:block;font-size:20px;line-height:1.2;}",
    ".oa-stat span{font-size:11.5px;opacity:.7;}",
    ".oa-tools{display:flex;gap:8px;margin-bottom:12px;}",
    ".oa-tools input{flex:1;min-width:0;}",
    ".oa-row{border:1px solid rgba(128,128,128,.28);border-radius:12px;margin-bottom:8px;overflow:hidden;}",
    ".oa-row>summary{list-style:none;cursor:pointer;padding:11px 12px;display:block;}",
    ".oa-row>summary::-webkit-details-marker{display:none;}",
    ".oa-row[open]>summary{border-bottom:1px solid rgba(128,128,128,.2);}",
    ".oa-top{display:flex;align-items:center;gap:8px;}",
    ".oa-name{flex:1;min-width:0;font-weight:800;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
    ".oa-name small{font-weight:500;opacity:.6;font-size:12.5px;margin-left:4px;}",
    ".oa-nums{flex:none;display:flex;gap:10px;font-size:13.5px;font-weight:700;white-space:nowrap;}",
    ".oa-nums .z{opacity:.35;font-weight:500;}",
    ".oa-chev{flex:none;opacity:.5;font-size:11px;transition:transform .15s;}",
    ".oa-row[open] .oa-chev{transform:rotate(180deg);}",
    ".oa-prog{margin-top:8px;display:grid;gap:4px;}",
    ".oa-bar{display:flex;align-items:center;gap:8px;font-size:12px;}",
    ".oa-bar .lb{flex:none;width:26px;opacity:.7;}",
    ".oa-bar .tr{flex:1;height:8px;border-radius:999px;background:rgba(128,128,128,.25);overflow:hidden;}",
    ".oa-bar .tr i{display:block;height:100%;border-radius:999px;background:var(--well,#4a90e2);}",
    ".oa-bar .tr i.full{background:#2fb067;}",
    ".oa-bar .ct{flex:none;width:44px;text-align:right;opacity:.8;font-variant-numeric:tabular-nums;}",
    ".oa-body{padding:4px 12px 12px;}",
    ".oa-sec{margin-top:12px;}",
    ".oa-sec h5{margin:0 0 6px;font-size:12.5px;display:flex;justify-content:space-between;gap:8px;opacity:.9;}",
    ".oa-sec h5 span{font-weight:500;opacity:.7;}",
    ".oa-li{display:flex;justify-content:space-between;gap:10px;font-size:13px;padding:5px 0;border-bottom:1px dashed rgba(128,128,128,.2);}",
    ".oa-li:last-child{border-bottom:0;}",
    ".oa-li .r{flex:none;opacity:.75;white-space:nowrap;}",
    ".oa-li.rej{opacity:.45;text-decoration:line-through;}",
    ".oa-chips{display:flex;flex-wrap:wrap;gap:6px;}",
    ".oa-chip{border:1px solid rgba(128,128,128,.3);border-radius:999px;padding:3px 10px;font-size:12.5px;}",
    ".oa-none{font-size:13px;opacity:.55;}",
    ".oa-meta{font-size:12px;opacity:.6;margin-top:6px;}"
  ].join("");

  function injectStyles() {
    if (document.getElementById("oaStyle")) return;
    var s = document.createElement("style");
    s.id = "oaStyle";
    s.textContent = CSS;
    document.head.appendChild(s);
  }

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

  function num(n, icon) {
    n = Number(n) || 0;
    return '<span' + (n ? '' : ' class="z"') + '>' + icon + " " + n + "</span>";
  }

  // 목록의 학생 한 줄(이름 · 획득/사용 · 진행 막대)
  function summaryHtml(r) {
    var who = esc(r.nickname) + (r.real_name ? "<small>(" + esc(r.real_name) + ")</small>" : "");
    var bars = SCROLLS.map(function (s) {
      var p = prog(r, s.id);
      if (!p) return s.id === "moses" ? '<div class="oa-bar"><span class="lb">' + s.label + '</span><span class="tr"><i style="width:0"></i></span><span class="ct">0/' + TOTALS[s.id] + '</span></div>' : "";
      var pct = Math.round(p.done / p.total * 100);
      return '<div class="oa-bar"><span class="lb">' + s.label + '</span><span class="tr"><i class="' + (p.done >= p.total ? "full" : "") + '" style="width:' + pct + '%"></i></span><span class="ct">' + p.done + '/' + p.total + '</span></div>';
    }).join("");
    return '<summary><div class="oa-top"><span class="oa-name">' + who + '</span><span class="oa-nums">' +
      num(r.earned_total, "💰") + num(r.spent_total, "🛒") + '</span><span class="oa-chev">▼</span></div>' +
      '<div class="oa-prog">' + bars + '</div></summary>';
  }

  function chips(list) {
    return list.length ? '<div class="oa-chips">' + list.map(function (x) { return '<span class="oa-chip">' + x + '</span>'; }).join("") + '</div>' : '<div class="oa-none">없음</div>';
  }

  function detailHtml(r) {
    var h = '<div class="oa-body">';

    // 진행
    h += '<div class="oa-sec"><h5>📍 진행</h5>';
    var any = false;
    SCROLLS.forEach(function (s) {
      var p = prog(r, s.id);
      if (!p) return;
      any = true;
      h += '<div class="oa-li"><span>' + esc(s.full) + '</span><span class="r">' + esc(p.where) + '</span></div>';
    });
    if (!any) h += '<div class="oa-none">저장된 진행 기록이 아직 없어요.</div>';
    h += '<div class="oa-meta">마지막 저장 ' + fmt(r.saved_at) + (r.last_seen ? ' · 마지막 접속 ' + fmt(Number(r.last_seen)) : '') + '</div></div>';

    // 달란트: 얻음
    h += '<div class="oa-sec"><h5>💰 달란트 얻은 곳<span>합계 ' + (r.earned_total || 0) + '</span></h5>';
    if (r.earned && r.earned.length) {
      h += r.earned.map(function (e) {
        return '<div class="oa-li"><span>' + esc(EARN_LABELS[e.type] || e.type) + ' <small style="opacity:.6">' + e.n + '번</small></span><span class="r">' + e.pts + '달란트</span></div>';
      }).join("");
    } else {
      h += '<div class="oa-none">아직 없어요.</div>';
    }
    h += '</div>';

    // 달란트: 씀
    h += '<div class="oa-sec"><h5>🛒 산 것<span>' + (r.buy_n || 0) + '건 · ' + (r.spent_total || 0) + '달란트</span></h5>';
    if (r.orders && r.orders.length) {
      h += r.orders.map(function (o) {
        var name = String(o.name || "").replace(/^\[게임\]\s*/, "");
        var rejected = o.status === "rejected";
        return '<div class="oa-li' + (rejected ? ' rej' : '') + '"><span>' + esc(name) + (rejected ? ' (거절·환불)' : '') + '</span><span class="r">' + o.cost + '달란트 · ' + fmt(o.at) + '</span></div>';
      }).join("");
    } else {
      h += '<div class="oa-none">산 것이 없어요.</div>';
    }
    h += '</div>';

    // 얻은 것
    h += '<div class="oa-sec"><h5>🎒 얻은 것</h5>';
    var mats = Object.keys(r.mat || {}).filter(function (k) { return Number(r.mat[k]) > 0; }).map(function (k) {
      return esc(MAT_LABELS[k] || k) + " " + r.mat[k];
    });
    h += '<div class="oa-meta" style="margin:0 0 4px;">재료</div>' + chips(mats);
    var badges = (r.badges || []).map(function (b) { return esc(BADGE_LABELS[b] || b); });
    h += '<div class="oa-meta" style="margin:10px 0 4px;">배지 ' + badges.length + '개</div>' + chips(badges);
    var etc = [
      "구절 카드 " + (r.verses_n || 0) + "장",
      "⛪ 예배 암호 카드 " + (r.worship_n || 0) + "장",
      "⭐ 지혜 별 " + (r.stars || 0),
      "🍞 만나 " + (r.manna || 0) + "개"
    ];
    if (r.title) etc.push("🏷 칭호 「" + esc(r.title) + "」");
    h += '<div class="oa-meta" style="margin:10px 0 4px;">그 밖에</div>' + chips(etc);
    var pets = Object.keys(r.pets || {});
    if (pets.length) {
      h += '<div class="oa-meta" style="margin:10px 0 4px;">펫</div>' + chips(pets.map(function (k) {
        var a = Number(r.pets[k]) || 0, ns = Number(r.pet_v) >= 2;
        return esc(PET_LABELS[k] || k) + " · 친밀도 " + a + (ns ? "/250" : "/100(예전 기준)") + " · Lv." + petLevel(a, ns);
      }));
    }
    h += '</div></div>';
    return h;
  }

  function score(r) {
    return SCROLLS.reduce(function (sum, s, i) { var p = prog(r, s.id); return sum + (p ? p.done : 0) * Math.pow(100, 2 - i); }, 0);
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

  function render() {
    var box = document.getElementById("odysseyAdminBody");
    if (!box) return;
    injectStyles();
    var rows = state.rows || [];
    var q = state.q.trim().toLowerCase();
    var shown = rows.filter(function (r) {
      return !q || String(r.nickname).toLowerCase().indexOf(q) >= 0 || String(r.real_name || "").toLowerCase().indexOf(q) >= 0;
    });
    var totalSpent = rows.reduce(function (a, r) { return a + r.spent_total; }, 0);
    var totalBuy = rows.reduce(function (a, r) { return a + r.buy_n; }, 0);
    var totalEarn = rows.reduce(function (a, r) { return a + r.earned_total; }, 0);
    var h = '<div class="oa-stats">' +
      '<div class="oa-stat"><b>' + rows.length + '명</b><span>참여</span></div>' +
      '<div class="oa-stat"><b>' + totalBuy + '건</b><span>산 것 · ' + totalSpent + '달란트</span></div>' +
      '<div class="oa-stat"><b>' + totalEarn + '</b><span>얻은 달란트</span></div></div>';
    h += '<div class="oa-tools">' +
      '<input type="search" id="odysseyAdminQ" placeholder="이름 검색" value="' + esc(state.q) + '">' +
      '<select id="odysseyAdminSort">' +
        [["recent", "최근 저장순"], ["progress", "진행 많은 순"], ["spent", "쓴 달란트순"], ["earned", "얻은 달란트순"], ["name", "이름순"]].map(function (o) {
          return '<option value="' + o[0] + '"' + (state.sort === o[0] ? " selected" : "") + '>' + o[1] + '</option>';
        }).join("") +
      '</select>' +
      '<button type="button" class="btn ghost" id="odysseyAdminReload" style="padding:6px 12px;font-size:12px;">새로고침</button></div>';
    if (!shown.length) {
      h += '<p class="msg">' + (rows.length ? "검색 결과가 없어요." : "아직 오디세이 기록이 있는 학생이 없어요.") + '</p>';
    } else {
      h += sorted(shown).map(function (r) {
        return '<details class="oa-row">' + summaryHtml(r) + detailHtml(r) + '</details>';
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
