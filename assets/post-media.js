// 공용: 본문 링크 자동연결 + 이미지 여러 장 압축·업로드·표시
// 하루인사 / 감사노트 / 기도제목 / 건의사항 / 자유게시판 글 / 자유게시판 댓글 에서 함께 쓴다.
// 이미지는 Supabase Storage 버킷 'post-images'(공개 읽기)에 올리고, 공개 URL 배열을 DB의
// image_urls(text[]) 컬럼에 저장한다. auth.js의 getClient()에 의존함.

var POST_IMAGE_BUCKET = "post-images";
var POST_IMAGE_MAX_COUNT = 6;   // 한 글/댓글당 최대 장수
var POST_IMAGE_MAX_DIM = 1280;  // 긴 변 기준 최대 픽셀
var POST_IMAGE_QUALITY = 0.82;  // JPEG 품질

function pmEscapeHtml(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// HTML을 먼저 escape한 뒤 http(s):// 로 시작하는 부분만 링크(<a target="_blank">)로 바꾼다.
// escape가 먼저이므로 사용자가 넣은 태그는 실행되지 않는다(XSS 안전).
function linkifyHtml(text) {
  var escaped = pmEscapeHtml(text);
  return escaped.replace(/(https?:\/\/[^\s<]+[^\s<.,!?)\]}"'])/g, function (url) {
    return '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + url + '</a>';
  });
}

// File -> Promise<Blob>  (canvas로 긴 변 POST_IMAGE_MAX_DIM 이하로 줄이고 JPEG로 재인코딩)
function pmCompressImage(file) {
  return new Promise(function (resolve, reject) {
    if (!file || !/^image\//.test(file.type)) { reject(new Error("이미지 파일이 아니에요.")); return; }
    var url = URL.createObjectURL(file);
    var img = new Image();
    img.onload = function () {
      var w = img.naturalWidth, h = img.naturalHeight;
      var scale = Math.min(1, POST_IMAGE_MAX_DIM / Math.max(w, h));
      var cw = Math.max(1, Math.round(w * scale));
      var ch = Math.max(1, Math.round(h * scale));
      var canvas = document.createElement("canvas");
      canvas.width = cw; canvas.height = ch;
      canvas.getContext("2d").drawImage(img, 0, 0, cw, ch);
      URL.revokeObjectURL(url);
      canvas.toBlob(function (blob) {
        if (blob) resolve(blob); else reject(new Error("이미지 처리에 실패했어요."));
      }, "image/jpeg", POST_IMAGE_QUALITY);
    };
    img.onerror = function () { URL.revokeObjectURL(url); reject(new Error("이미지를 읽지 못했어요.")); };
    img.src = url;
  });
}

// FileList | File[] -> Promise<string[]>  (공개 URL 배열). 이미지가 아닌 파일은 무시, 최대 장수 제한.
function uploadPostImages(userId, files) {
  var client = getClient();
  var list = Array.prototype.slice.call(files || []).filter(function (f) { return f && /^image\//.test(f.type); });
  if (!client || !userId || !list.length) return Promise.resolve([]);
  list = list.slice(0, POST_IMAGE_MAX_COUNT);
  return Promise.all(list.map(function (file) {
    return pmCompressImage(file).then(function (blob) {
      var path = userId + "/" + Date.now() + "-" + Math.random().toString(36).slice(2, 10) + ".jpg";
      return client.storage.from(POST_IMAGE_BUCKET)
        .upload(path, blob, { contentType: "image/jpeg", upsert: false })
        .then(function (res) {
          if (res.error) throw res.error;
          return client.storage.from(POST_IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
        });
    });
  }));
}

// string[] -> 썸네일 갤러리 HTML (탭하면 원본이 새 탭으로 열림)
function renderImageGallery(urls) {
  if (!urls || !urls.length) return "";
  return '<div class="img-gallery">' + urls.map(function (u) {
    var safe = pmEscapeHtml(u);
    return '<a href="' + safe + '" target="_blank" rel="noopener noreferrer">' +
             '<img src="' + safe + '" loading="lazy" alt="첨부 이미지"></a>';
  }).join("") + '</div>';
}

// 폼 안의 <input type="file" class="post-image-input"> 와 옆의 .img-picker-count 를 연결해
// 선택한 장수를 표시한다. 반환값으로 getFiles()/reset() 제공.
function bindImagePicker(scopeEl) {
  var input = scopeEl.querySelector(".post-image-input");
  var countEl = scopeEl.querySelector(".img-picker-count");
  if (input && countEl) {
    input.addEventListener("change", function () {
      var n = input.files ? input.files.length : 0;
      if (n > POST_IMAGE_MAX_COUNT) countEl.textContent = "최대 " + POST_IMAGE_MAX_COUNT + "장까지만 올라가요";
      else countEl.textContent = n ? n + "장 선택됨" : "";
    });
  }
  return {
    getFiles: function () { return input ? input.files : []; },
    reset: function () { if (input) input.value = ""; if (countEl) countEl.textContent = ""; }
  };
}

// 폼에 넣을 사진 첨부 UI의 표준 마크업 (HTML에 직접 넣기 어려운 곳에서 사용)
function imagePickerMarkup(labelText) {
  return '<div class="img-picker">' +
    '<label class="img-picker-btn">' + (labelText || "📷 사진 첨부") +
      '<input type="file" class="post-image-input" accept="image/*" multiple hidden>' +
    '</label>' +
    '<span class="img-picker-count"></span>' +
  '</div>';
}
