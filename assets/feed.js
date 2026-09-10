// 실시간 나눔 전용 페이지(feed.html): 하루인사/감사노트/기도제목을 종류별로 보여준다.
// 종류마다 20개씩 보여주고 "더 보기"로 이전 기록을 계속 불러온다.
// 기도제목은 항상 익명, 하루인사·감사노트는 로그인한 사람에게만 닉네임이 보인다
// (닉네임 마스킹은 서버의 get_public_notes 함수가 처리하므로 받은 값 그대로만 보여주면 된다).
// auth.js의 getClient()에 의존함.

var FEED_INTERVAL_MS = 20000;
var FEED_PAGE_SIZE = 20;
var FEED_SECTIONS = {
  greeting: "publicFeedGreeting",
  gratitude: "publicFeedGratitude",
  prayer: "publicFeedPrayer"
};
var FEED_CARD_IDS = {
  greeting: "feedCardGreeting",
  gratitude: "feedCardGratitude",
  prayer: "feedCardPrayer"
};
var FEED_HERO = {
  greeting: { title: "🙋 하루 인사", desc: "로그인한 사람에게만 닉네임이 보여요." },
  gratitude: { title: "🙏 감사노트", desc: "로그인한 사람에게만 닉네임이 보여요." },
  prayer: { title: "🕊️ 기도제목", desc: "누가 썼는지는 항상 익명이에요. 작성자가 정한 공개 범위에 따라 로그인한 지체에게만 보이는 것도 있어요." }
};

// 종류별 상태: 지금까지 불러온 개수 / "더 보기"로 펼친 적 있는지(펼치면 자동 새로고침 중단)
var feedState = {
  greeting: { loaded: 0, expanded: false },
  gratitude: { loaded: 0, expanded: false },
  prayer: { loaded: 0, expanded: false }
};

function timeAgoKoFeedPage(iso) {
  var diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return diffMin + "분 전";
  var diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return diffHr + "시간 전";
  return Math.floor(diffHr / 24) + "일 전";
}

function feedPrayBtnHtml(r) {
  if (r.type !== "prayer") return "";
  var n = r.pray_count || 0;
  var on = r.i_prayed ? " on" : "";
  return (
    '<button type="button" class="pray-btn' + on + '" data-note-id="' + r.id + '">' +
      '🙏 함께 기도했어요 <span class="pray-count">' + n + '</span>' +
    '</button>'
  );
}

function feedItemHtml(r) {
  var who = r.nickname ? pmEscapeHtml(r.nickname) : "익명";
  return (
    '<div class="note-item">' +
      '<div class="meta">' + who + ' · ' + timeAgoKoFeedPage(r.created_at) + '</div>' +
      '<div class="content">' + linkifyHtml(r.content) + '</div>' +
      renderImageGallery(r.image_urls) +
      feedPrayBtnHtml(r) +
    '</div>'
  );
}

function feedEnsureShell(type) {
  var listEl = document.getElementById(FEED_SECTIONS[type]);
  if (!listEl) return null;
  if (!listEl.querySelector(".feed-items")) {
    listEl.innerHTML =
      '<div class="feed-items"></div>' +
      '<button type="button" class="btn ghost feed-more" data-type="' + type + '" style="display:none;width:100%;margin-top:10px;">더 보기</button>';
    var moreBtn = listEl.querySelector(".feed-more");
    moreBtn.addEventListener("click", function () {
      feedState[type].expanded = true;
      moreBtn.disabled = true;
      moreBtn.textContent = "불러오는 중...";
      feedLoadSection(type, true);
    });

    // 기도제목 섹션: "함께 기도했어요" 버튼 클릭 위임
    if (type === "prayer") {
      listEl.addEventListener("click", function (e) {
        var btn = e.target.closest(".pray-btn");
        if (!btn) return;
        var client = getClient();
        if (!client) return;
        btn.disabled = true;
        client.rpc("toggle_prayer_reaction", { p_note_id: Number(btn.getAttribute("data-note-id")) }).then(function (res) {
          btn.disabled = false;
          if (res.error) { alert(res.error.message || "잠시 후 다시 눌러주세요."); return; }
          if (!res.data || !res.data[0]) return;
          var row = res.data[0];
          var countEl = btn.querySelector(".pray-count");
          if (countEl) countEl.textContent = row.pray_count;
          btn.classList.toggle("on", !!row.i_prayed);
        }).catch(function () { btn.disabled = false; });
      });
    }
  }
  return listEl;
}

function feedLoadSection(type, append) {
  var client = getClient();
  var listEl = feedEnsureShell(type);
  if (!client || !listEl) return;

  var itemsEl = listEl.querySelector(".feed-items");
  var moreBtn = listEl.querySelector(".feed-more");
  var offset = append ? feedState[type].loaded : 0;

  client.rpc("get_public_notes", { p_limit: FEED_PAGE_SIZE, p_offset: offset, p_type: type }).then(function (res) {
    // p_offset/p_type 인자가 아직 DB에 반영되기 전이면(마이그레이션 전) 예전 방식으로 폴백:
    // 전체를 한 번에 받아 종류별로 걸러서 보여주고 "더 보기"는 숨긴다.
    if (res.error) {
      return client.rpc("get_public_notes", { p_limit: 100 }).then(function (res2) {
        var all = (res2 && res2.data) || [];
        var mine = all.filter(function (r) { return r.type === type; });
        itemsEl.innerHTML = mine.length ? mine.map(feedItemHtml).join("") : '<p class="msg">아직 나눈 이야기가 없어요.</p>';
        feedState[type].loaded = mine.length;
        if (moreBtn) { moreBtn.disabled = false; moreBtn.textContent = "더 보기"; moreBtn.style.display = "none"; }
      });
    }
    var rows = res.data || [];
    var html = rows.map(feedItemHtml).join("");

    if (append) {
      itemsEl.insertAdjacentHTML("beforeend", html);
      feedState[type].loaded += rows.length;
    } else {
      itemsEl.innerHTML = rows.length ? html : '<p class="msg">아직 나눈 이야기가 없어요.</p>';
      feedState[type].loaded = rows.length;
    }

    if (moreBtn) {
      moreBtn.disabled = false;
      moreBtn.textContent = "더 보기";
      moreBtn.style.display = (rows.length === FEED_PAGE_SIZE) ? "block" : "none";
    }
  }).catch(function () {
    if (!append) itemsEl.innerHTML = '<p class="msg">불러오지 못했어요.</p>';
    if (moreBtn) { moreBtn.disabled = false; moreBtn.textContent = "더 보기"; }
  });
}

function initFeedPage() {
  var client = getClient();
  if (!client) return;

  var params = new URLSearchParams(window.location.search);
  var onlyType = params.get("type");
  if (!FEED_SECTIONS[onlyType]) onlyType = null;

  if (onlyType) {
    Object.keys(FEED_CARD_IDS).forEach(function (type) {
      if (type === onlyType) return;
      var card = document.getElementById(FEED_CARD_IDS[type]);
      if (card) card.style.display = "none";
    });
    var titleEl = document.getElementById("feedHeroTitle");
    var descEl = document.getElementById("feedHeroDesc");
    if (titleEl) titleEl.textContent = FEED_HERO[onlyType].title;
    if (descEl) descEl.textContent = FEED_HERO[onlyType].desc;
  }

  var types = onlyType ? [onlyType] : Object.keys(FEED_SECTIONS);

  types.forEach(function (type) { feedLoadSection(type, false); });

  // 20초마다 새로고침하되, "더 보기"로 이전 기록을 펼쳐 둔 종류는 건드리지 않는다.
  setInterval(function () {
    types.forEach(function (type) {
      if (!feedState[type].expanded) feedLoadSection(type, false);
    });
  }, FEED_INTERVAL_MS);
}
