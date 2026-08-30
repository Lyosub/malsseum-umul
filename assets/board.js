// 자유게시판: 글 작성 + 댓글 + 본인/관리자(교역자·부장) 삭제
// auth.js의 getClient()에 의존함

function escapeHtmlBoard(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function timeAgoKoBoard(iso) {
  var diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return diffMin + "분 전";
  var diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return diffHr + "시간 전";
  return Math.floor(diffHr / 24) + "일 전";
}

function initBoardPage(userId) {
  var client = getClient();
  if (!client) return;

  var listEl = document.getElementById("boardList");
  var listMsg = document.getElementById("boardListMsg");
  var form = document.getElementById("boardPostForm");
  var input = document.getElementById("boardPostInput");
  var postMsg = document.getElementById("boardPostMsg");
  var isStaff = false;

  function checkStaff() {
    return client.from("profiles").select("is_admin, is_department_head").eq("user_id", userId).maybeSingle()
      .then(function (res) {
        var row = res.data;
        isStaff = !!(row && (row.is_admin || row.is_department_head));
      });
  }

  function refreshCommentCount(postId) {
    var badge = listEl.querySelector('.board-comment-toggle[data-post-id="' + postId + '"] .board-comment-count');
    client.rpc("get_board_comments", { p_post_id: postId }).then(function (res) {
      if (badge) badge.textContent = (res.data || []).length;
    });
  }

  function renderComment(c) {
    var canDelete = c.user_id === userId || isStaff;
    return (
      '<div class="board-comment" data-comment-id="' + c.id + '">' +
        '<div class="meta">' + escapeHtmlBoard(c.nickname || "익명") + ' · ' + timeAgoKoBoard(c.created_at) + '</div>' +
        '<div class="content">' + escapeHtmlBoard(c.content) + '</div>' +
        (canDelete
          ? '<button type="button" class="btn ghost board-comment-delete" data-comment-id="' + c.id + '" data-own="' + (c.user_id === userId) + '">삭제</button>'
          : "") +
      '</div>'
    );
  }

  function loadComments(postId, container) {
    container.innerHTML = '<p class="msg">불러오는 중...</p>';
    client.rpc("get_board_comments", { p_post_id: postId }).then(function (res) {
      var rows = res.data || [];
      container.innerHTML =
        (rows.length ? rows.map(renderComment).join("") : '<p class="msg">아직 댓글이 없어요.</p>') +
        '<form class="board-comment-form">' +
          '<div class="form-row"><textarea placeholder="댓글을 입력해보세요" rows="2"></textarea></div>' +
          '<button type="submit" class="btn ghost" style="padding:8px 16px;font-size:13px;">댓글 달기</button>' +
        '</form>';

      container.querySelectorAll(".board-comment-delete").forEach(function (btn) {
        btn.addEventListener("click", function () {
          if (!confirm("이 댓글을 삭제할까요?")) return;
          var commentId = btn.getAttribute("data-comment-id");
          var isOwn = btn.getAttribute("data-own") === "true";
          var action = isOwn
            ? client.from("board_comments").delete().eq("id", commentId)
            : client.rpc("admin_delete_board_comment", { p_comment_id: commentId });
          action.then(function () {
            loadComments(postId, container);
            refreshCommentCount(postId);
          });
        });
      });

      var cform = container.querySelector(".board-comment-form");
      cform.addEventListener("submit", function (e) {
        e.preventDefault();
        var ta = cform.querySelector("textarea");
        var content = ta.value.trim();
        if (!content) return;
        client.from("board_comments").insert({ post_id: postId, user_id: userId, content: content }).then(function (res) {
          if (res.error) return;
          ta.value = "";
          loadComments(postId, container);
          refreshCommentCount(postId);
        });
      });
    });
  }

  function renderPostBody(p) {
    return (
      '<div class="meta">' + escapeHtmlBoard(p.nickname || "익명") + ' · ' + timeAgoKoBoard(p.created_at) + '</div>' +
      '<div class="content">' + escapeHtmlBoard(p.content) + '</div>' +
      '<div style="display:flex;gap:8px;margin-top:8px;align-items:center;">' +
        '<button type="button" class="btn ghost board-comment-toggle" data-post-id="' + p.id + '" style="padding:6px 14px;font-size:12.5px;">' +
          '💬 댓글 <span class="board-comment-count">' + p.comment_count + '</span>개' +
        '</button>' +
        (p.user_id === userId
          ? '<button type="button" class="btn ghost board-post-edit" style="padding:6px 14px;font-size:12.5px;">수정</button>'
          : "") +
        ((p.user_id === userId || isStaff)
          ? '<button type="button" class="btn ghost board-post-delete" data-own="' + (p.user_id === userId) + '" style="padding:6px 14px;font-size:12.5px;">삭제</button>'
          : "") +
      '</div>'
    );
  }

  function renderPost(p) {
    return (
      '<div class="board-post" data-post-id="' + p.id + '">' +
        '<div data-role="body">' + renderPostBody(p) + '</div>' +
        '<div class="board-comments" data-post-id="' + p.id + '" style="display:none;margin-top:10px;"></div>' +
      '</div>'
    );
  }

  var postsById = {};

  // 글 목록 안의 모든 클릭(댓글 펼치기/수정/저장/취소/삭제)을 listEl 하나에 위임해서 처리한다.
  // 개별 버튼마다 리스너를 다는 방식은, 수정 후 저장/취소로 그 버튼들을 다시 그리고 나면
  // 이전에 붙여둔 리스너가 사라져 먹통이 되는 문제가 있어 이 방식으로 통일한다.
  listEl.addEventListener("click", function (e) {
    var postEl = e.target.closest(".board-post");
    if (!postEl) return;
    var postId = postEl.getAttribute("data-post-id");
    var post = postsById[postId];
    var bodyEl = postEl.querySelector('[data-role="body"]');

    if (e.target.closest(".board-comment-toggle")) {
      var box = postEl.querySelector('.board-comments[data-post-id="' + postId + '"]');
      var isOpen = box.style.display === "block";
      box.style.display = isOpen ? "none" : "block";
      if (!isOpen) loadComments(postId, box);
      return;
    }

    if (e.target.closest(".board-post-delete")) {
      if (!confirm("이 글을 삭제할까요? 댓글도 함께 삭제돼요.")) return;
      var isOwn = e.target.closest(".board-post-delete").getAttribute("data-own") === "true";
      var action = isOwn
        ? client.from("board_posts").delete().eq("id", postId)
        : client.rpc("admin_delete_board_post", { p_post_id: postId });
      action.then(function () { loadPosts(); });
      return;
    }

    if (e.target.closest(".board-post-edit")) {
      bodyEl.innerHTML =
        '<div class="form-row"><textarea data-role="edit-input">' + escapeHtmlBoard(post.content) + '</textarea></div>' +
        '<div style="display:flex;gap:8px;">' +
          '<button type="button" class="btn" data-action="save" style="padding:6px 14px;font-size:12.5px;">저장</button>' +
          '<button type="button" class="btn ghost" data-action="cancel" style="padding:6px 14px;font-size:12.5px;">취소</button>' +
        '</div>';
      return;
    }

    if (e.target.closest('[data-action="cancel"]')) {
      bodyEl.innerHTML = renderPostBody(post);
      return;
    }

    if (e.target.closest('[data-action="save"]')) {
      var newContent = bodyEl.querySelector('[data-role="edit-input"]').value.trim();
      if (!newContent) return;
      client.from("board_posts").update({ content: newContent }).eq("id", postId).then(function (res) {
        if (res.error) return;
        post.content = newContent;
        bodyEl.innerHTML = renderPostBody(post);
      });
    }
  });

  function loadPosts() {
    client.rpc("get_board_posts", { p_limit: 100 }).then(function (res) {
      if (res.error) {
        listMsg.textContent = "불러오지 못했어요.";
        return;
      }
      var rows = res.data || [];
      if (!rows.length) {
        listMsg.textContent = "";
        listEl.innerHTML = '<p class="msg">아직 글이 없어요. 첫 글을 남겨보세요!</p>';
        return;
      }
      listMsg.textContent = "";
      postsById = {};
      rows.forEach(function (p) { postsById[p.id] = p; });
      listEl.innerHTML = rows.map(renderPost).join("");
    }).catch(function () {
      listMsg.textContent = "불러오지 못했어요.";
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var content = input.value.trim();
    if (!content) {
      postMsg.textContent = "내용을 입력해주세요.";
      return;
    }
    postMsg.textContent = "게시 중...";
    client.from("board_posts").insert({ user_id: userId, content: content }).then(function (res) {
      if (res.error) {
        postMsg.textContent = "게시에 실패했어요.";
        return;
      }
      postMsg.textContent = "게시되었습니다.";
      input.value = "";
      loadPosts();
    });
  });

  checkStaff().then(loadPosts);
}
