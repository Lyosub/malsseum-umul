// 달란트 상점(교환소) — 학생 화면
// 상품 목록 + "교환 신청" + 내 교환 내역. auth.js의 getClient(), getSession()에 의존함.

function shopEsc(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

var SHOP_STATUS = {
  pending:  { label: "확인 중",   color: "var(--gold)" },
  approved: { label: "승인됨",    color: "var(--well)" },
  delivered:{ label: "전달 완료", color: "var(--well-deep)" },
  rejected: { label: "거절됨",    color: "#b3432c" }
};

var SUGGEST_STATUS = {
  open:      { label: "접수됨",   color: "var(--text-soft)" },
  reviewing: { label: "검토 중",  color: "var(--gold)" },
  added:     { label: "상점에 추가됨", color: "var(--well)" },
  declined:  { label: "이번엔 어려워요", color: "#b3432c" }
};

function shopFmtDate(iso) {
  var d = new Date(iso);
  return (d.getMonth() + 1) + "." + d.getDate();
}

function initShopPage() {
  var client = getClient();
  if (!client) return;

  var balanceEl = document.getElementById("shopBalance");
  var gateEl = document.getElementById("shopGate");
  var itemsEl = document.getElementById("shopItems");
  var ordersEl = document.getElementById("shopOrders");

  var suggestForm = document.getElementById("shopSuggestForm");
  var suggestInput = document.getElementById("shopSuggestInput");
  var suggestMsg = document.getElementById("shopSuggestMsg");
  var mySuggestEl = document.getElementById("shopMySuggestions");
  var suggestCard = document.getElementById("shopSuggestCard");

  getSession().then(function (session) {
    if (!session) {
      if (gateEl) gateEl.innerHTML = '<div class="card"><p class="msg" style="margin:0;">로그인하면 달란트로 상품을 교환할 수 있어요.</p><a href="login.html" class="btn block" style="margin-top:10px;">로그인하러 가기</a></div>';
      if (itemsEl) itemsEl.innerHTML = '<p class="msg">로그인이 필요해요.</p>';
      if (ordersEl) ordersEl.innerHTML = '<p class="msg">로그인이 필요해요.</p>';
      if (suggestCard) suggestCard.style.display = "none";
      loadItems(true);
      return;
    }
    loadBalance();
    loadItems(false);
    loadOrders();
    loadMySuggestions();
  });

  if (suggestForm) {
    suggestForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var text = (suggestInput.value || "").trim();
      if (!text) { suggestMsg.textContent = "내용을 입력해주세요."; return; }
      suggestMsg.textContent = "보내는 중...";
      client.rpc("submit_shop_suggestion", { p_content: text }).then(function (res) {
        if (res.error) { suggestMsg.textContent = res.error.message || "보내지 못했어요."; return; }
        suggestMsg.textContent = "추천을 보냈어요. 고마워요!";
        suggestInput.value = "";
        loadMySuggestions();
      }).catch(function () { suggestMsg.textContent = "보내지 못했어요."; });
    });
  }

  function loadMySuggestions() {
    if (!mySuggestEl) return;
    client.rpc("get_my_shop_suggestions").then(function (res) {
      if (res.error) { mySuggestEl.innerHTML = ""; return; }
      var rows = res.data || [];
      if (!rows.length) { mySuggestEl.innerHTML = '<p class="msg" style="margin:0;">아직 보낸 추천이 없어요.</p>'; return; }
      mySuggestEl.innerHTML = '<div class="msg" style="margin:0 0 6px;">내가 보낸 추천</div>' + rows.map(function (s) {
        var st = SUGGEST_STATUS[s.status] || { label: s.status, color: "var(--text-soft)" };
        return (
          '<div class="note-item">' +
            '<div class="meta">' + shopFmtDate(s.created_at) + ' · <span style="color:' + st.color + ';font-weight:700;">' + st.label + '</span></div>' +
            '<div class="content">' + shopEsc(s.content) + '</div>' +
            (s.admin_note ? '<div class="meta" style="margin-top:4px;">선생님: ' + shopEsc(s.admin_note) + '</div>' : '') +
          '</div>'
        );
      }).join("");
    });
  }

  function loadBalance() {
    client.rpc("get_talent_balance").then(function (res) {
      if (!res.error && res.data != null && balanceEl) balanceEl.textContent = res.data;
    });
  }

  function loadItems(readOnly) {
    client.rpc("get_shop_items", { p_all: false }).then(function (res) {
      if (res.error) { itemsEl.innerHTML = '<p class="msg">불러오지 못했어요.</p>'; return; }
      var rows = res.data || [];
      if (!rows.length) { itemsEl.innerHTML = '<p class="msg">아직 등록된 상품이 없어요.</p>'; return; }
      itemsEl.innerHTML = rows.map(function (it) {
        var soldOut = (it.stock != null && it.stock <= 0);
        var stockTxt = it.stock == null ? "" : ' · 남은 수량 ' + it.stock + '개';
        return (
          '<div class="note-item">' +
            '<div class="content"><strong>' + shopEsc(it.name) + '</strong> ' +
              '<span style="color:var(--well);font-weight:800;">' + it.cost + '달란트</span>' +
              '<span style="color:var(--text-soft);font-size:12px;">' + stockTxt + '</span></div>' +
            (it.description ? '<div class="meta" style="margin-top:4px;">' + shopEsc(it.description) + '</div>' : '') +
            (readOnly ? '' :
              '<button type="button" class="btn ghost shop-buy" data-id="' + it.id + '" data-name="' + shopEsc(it.name) + '" data-cost="' + it.cost + '" ' +
                (soldOut ? 'disabled' : '') + ' style="margin-top:8px;padding:7px 16px;font-size:12.5px;">' +
                (soldOut ? '품절' : '교환 신청') + '</button>') +
          '</div>'
        );
      }).join("");

      itemsEl.querySelectorAll(".shop-buy").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var name = btn.getAttribute("data-name");
          var cost = btn.getAttribute("data-cost");
          if (!confirm('"' + name + '" 을(를) ' + cost + '달란트로 교환 신청할까요?\n선생님이 확인하면 전달해 줍니다.')) return;
          var note = prompt("선생님께 남길 말이 있으면 적어주세요 (선택)") || null;
          btn.disabled = true;
          client.rpc("request_shop_order", { p_item_id: Number(btn.getAttribute("data-id")), p_note: note }).then(function (res) {
            btn.disabled = false;
            if (res.error) { alert(res.error.message || "교환 신청에 실패했어요."); return; }
            alert("교환 신청이 접수됐어요. 선생님 확인을 기다려 주세요.");
            loadBalance(); loadItems(false); loadOrders();
          }).catch(function () { btn.disabled = false; alert("교환 신청에 실패했어요."); });
        });
      });
    });
  }

  function loadOrders() {
    client.rpc("get_my_shop_orders").then(function (res) {
      if (res.error) { ordersEl.innerHTML = '<p class="msg">불러오지 못했어요.</p>'; return; }
      var rows = res.data || [];
      if (!rows.length) { ordersEl.innerHTML = '<p class="msg">아직 교환 내역이 없어요.</p>'; return; }
      ordersEl.innerHTML = rows.map(function (o) {
        var st = SHOP_STATUS[o.status] || { label: o.status, color: "var(--text-soft)" };
        return (
          '<div class="note-item">' +
            '<div class="meta">' + shopFmtDate(o.created_at) + ' 신청 · ' +
              '<span style="color:' + st.color + ';font-weight:700;">' + st.label + '</span></div>' +
            '<div class="content"><strong>' + shopEsc(o.item_name) + '</strong> · ' + o.cost_snapshot + '달란트</div>' +
            (o.admin_note ? '<div class="meta" style="margin-top:4px;">선생님: ' + shopEsc(o.admin_note) + '</div>' : '') +
          '</div>'
        );
      }).join("");
    });
  }
}
