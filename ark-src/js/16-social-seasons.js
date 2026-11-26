  // ── 마을 소식 · 선물 · 건축 사진 · 설계도 나누기(서버: sql-migrations/2026-11-19-ark-village-social.sql) ──
  // 자유 글은 쓰지 않는다: 소식은 종류+숫자, 사진 제목과 설계도 이름은 고르기
  var SOCIAL = { feed: [], feedAt: 0, lastSeen: 0, gifts: [], giftAt: 0, giftN: -1, photos: [], photoAt: 0, plans: null, planAt: 0, imgs: {}, busy: {} };
  var PLAN_NAMES = ['우리 집', '작은 집', '큰 집', '탑', '정원', '다리', '양 우리', '가게', '성막 모형', '그 밖의 건물'];
  var PHOTO_CAPS = ['우리 집', '함께 지은 것', '멋진 경치', '밤하늘', '농장', '동물들', '방주', '개척 땅', '동굴', '마을'];
  function socialOn() { return !!(client && me && NET.ok); }
  function feedPost(kind, n) { if (!socialOn()) return; client.rpc('post_ark_feed', { p_kind: kind, p_n: n | 0 }).then(function () { SOCIAL.feedAt = 0; }, function () {}); }
  function feedLine(f) {
    var who = f.nick + '님이 ';
    if (f.kind === 'ach') { var a = ACHS[f.n]; return a ? a[1] + ' ' + who + '「' + a[2] + '」 업적을 받았어요' : null; }
    if (f.kind === 'build') return '🏠 ' + who + '내 땅에 블록 ' + f.n + '개를 놓았어요';
    if (f.kind === 'photo') return '📷 ' + who + '건축 사진을 올렸어요';
    if (f.kind === 'plan') return '📐 ' + who + '설계도를 나눴어요';
    if (f.kind === 'gift') return '🎁 ' + who + '친구에게 선물을 보냈어요';
    return null;
  }
  function timeAgo(t) { var m = Math.max(0, Math.round((Date.now() - new Date(t).getTime()) / 60000)); return m < 1 ? '방금' : (m < 60 ? m + '분 전' : (m < 1440 ? Math.floor(m / 60) + '시간 전' : Math.floor(m / 1440) + '일 전')); }
  function socialRerender(tab) { if (ui === 'villageWork' && villageTab === tab) renderVillageWork(); }
  function fetchFeed(force) {
    if (!socialOn() || SOCIAL.busy.feed || (!force && Date.now() < SOCIAL.feedAt)) return;
    SOCIAL.feedAt = Date.now() + 60000; SOCIAL.busy.feed = 1;
    client.rpc('get_ark_feed').then(function (r) {
      SOCIAL.busy.feed = 0;
      if (!r || r.error || !Array.isArray(r.data)) return;
      SOCIAL.feed = r.data;
      var news = r.data.filter(function (f) { return !f.mine && f.id > SOCIAL.lastSeen; });
      if (SOCIAL.lastSeen && news.length && ui === 'play') { var t = feedLine(news[0]); if (t) toast('📣 ' + t + (news.length > 1 ? ' 외 ' + (news.length - 1) + '개 소식' : '')); }
      if (r.data.length) SOCIAL.lastSeen = Math.max(SOCIAL.lastSeen, r.data[0].id);
      socialRerender('feed');
    }, function () { SOCIAL.busy.feed = 0; });
  }
  function buildMilestone() { if ([50, 100, 300, 1000].indexOf(stats.placed) >= 0) feedPost('build', stats.placed); }
  // 선물: 손에 든 것을 친구에게 1·4·8개
  function giftError(c) { return { login: '로그인하면 선물을 보낼 수 있어요', friend: '친구에게만 보낼 수 있어요', item: '이건 보낼 수 없어요', daily: '오늘은 선물을 다 보냈어요(하루 10번)', full: '친구의 선물함이 가득 찼어요' }[c] || '선물을 보내지 못했어요. 조금 뒤에 다시 해 주세요'; }
  function fetchGifts(force) {
    if (!socialOn() || SOCIAL.busy.gift || (!force && Date.now() < SOCIAL.giftAt)) return;
    SOCIAL.giftAt = Date.now() + 90000; SOCIAL.busy.gift = 1;
    client.rpc('get_ark_gifts').then(function (r) {
      SOCIAL.busy.gift = 0;
      if (!r || r.error || !Array.isArray(r.data)) return;
      if (SOCIAL.giftN >= 0 && r.data.length > SOCIAL.giftN && ui === 'play') toast('🎁 선물이 왔어요 — 📒 마을 수첩 「선물」에서 받아요');
      SOCIAL.gifts = r.data; SOCIAL.giftN = r.data.length;
      socialRerender('gifts');
    }, function () { SOCIAL.busy.gift = 0; });
  }
  function sendGift(friendId, nick, amount) {
    var item = HOTBAR[sel];
    if (!item || INV.indexOf(item) < 0) return toast('보낼 것을 손에 들어요(단축 칸에서 고르기)');
    if (have(item) < amount) return toast(nameOf(item) + '이(가) ' + amount + '개 없어요');
    if (SOCIAL.busy.send) return; SOCIAL.busy.send = 1;
    client.rpc('send_ark_gift', { p_to: friendId, p_item: item, p_amount: amount }).then(function (r) {
      SOCIAL.busy.send = 0;
      var d = r && r.data;
      if (!d || !d.ok) return toast(giftError(d && d.error));
      take(item, amount); bagChanged(); sfx('craft');
      toast('🎁 ' + nick + '님에게 ' + nameOf(item) + ' ' + amount + '개를 보냈어요(행 20:35)');
      feedPost('gift', 0);
    }, function () { SOCIAL.busy.send = 0; toast(giftError()); });
  }
  function claimGift(g) {
    client.rpc('claim_ark_gift', { p_id: g.id }).then(function (r) {
      var d = r && r.data;
      if (d && d.item) { give(d.item, d.amount); bagChanged(); sfx('pop'); toast('🎁 ' + g.nick + '님이 보낸 ' + nameOf(d.item) + ' ' + d.amount + '개를 받았어요'); }
      fetchGifts(true);
    }, function () { toast('선물을 받지 못했어요. 조금 뒤에 다시 해 주세요'); });
  }
  // 사진 저장(11/20): 지금 화면을 내 폰·컴퓨터에 저장 — 휴대폰은 공유 창(사진에 저장), 컴퓨터는 내려받기
  function savePhoto() {
    try {
      renderer.render(scene, camera);
      var src = canvasEl, W = Math.min(1920, src.width), H = Math.round(W * src.height / src.width), c = document.createElement('canvas');
      c.width = W; c.height = H; var g = c.getContext('2d'); g.drawImage(src, 0, 0, W, H);
      var fs = Math.max(12, Math.round(H / 40)); g.font = 'bold ' + fs + 'px sans-serif'; g.textAlign = 'right'; g.textBaseline = 'bottom';
      var mark = '나그네 마을 · logoswell.kr'; g.lineWidth = Math.max(2, fs / 6); g.strokeStyle = 'rgba(0,0,0,.6)'; g.strokeText(mark, W - fs * 0.6, H - fs * 0.5); g.fillStyle = 'rgba(255,255,255,.92)'; g.fillText(mark, W - fs * 0.6, H - fs * 0.5);
      var url = c.toDataURL('image/jpeg', 0.9), bin = atob(url.split(',')[1]), arr = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      var d = new Date(), pad = function (n) { return (n < 10 ? '0' : '') + n; };
      var name = '나그네마을_' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '_' + pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds()) + '.jpg';
      var blob = new Blob([arr], { type: 'image/jpeg' }), file = null;
      try { file = new File([blob], name, { type: 'image/jpeg' }); } catch (e) {}
      newsMark('photo'); document.body.classList.add('snapflash'); setTimeout(function () { document.body.classList.remove('snapflash'); }, 260);
      sfx('click'); tone('square', 1800, 1200, 0.05, 0.05);
      function dl() {
        var a = document.createElement('a'), ou = URL.createObjectURL(blob); a.href = ou; a.download = name; document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(ou); }, 4000);
        toast('📷 찰칵! 사진을 저장했어요 (' + name + ')');
      }
      var canS = false; try { canS = isTouch && file && navigator.canShare && navigator.canShare({ files: [file] }); } catch (e) {}
      if (canS) {   // 휴대폰: 공유 창에서 「이미지 저장」 — 사람이 닫은 것(AbortError)이 아니면 내려받기로
        navigator.share({ files: [file], title: '나그네 마을' }).then(function () { toast('📷 사진을 보냈어요'); }, function (er) { if (!er || er.name !== 'AbortError') dl(); });
        return;
      }
      dl();
    } catch (e) { toast('사진을 찍지 못했어요'); }
  }
  // 건축 사진: 게임 화면만 작게 찍는다(한 사람 3장, 제목은 고르기)
  var photoCap = 0;
  function takePhoto() {
    if (!socialOn()) return toast('로그인하면 사진을 올릴 수 있어요');
    resume();
    setTimeout(function () {
      try {
        renderer.render(scene, camera);
        var src = canvasEl, W = 480, H = Math.max(1, Math.round(480 * src.height / src.width)), c = document.createElement('canvas');
        c.width = W; c.height = H; c.getContext('2d').drawImage(src, 0, 0, W, H);
        var url = c.toDataURL('image/jpeg', 0.62); if (url.length > 118000) url = c.toDataURL('image/jpeg', 0.4);
        if (url.length > 118000) return toast('사진이 너무 커요. 다시 찍어 주세요');
        sfx('click'); toast('📷 찰칵! 올리는 중…');
        client.rpc('post_ark_photo', { p_img: url, p_caption: photoCap }).then(function (r) {
          var d = r && r.data;
          if (!d || !d.ok) return toast(d && d.error === 'wait' ? '사진은 2분에 한 장씩 올릴 수 있어요' : '사진을 올리지 못했어요');
          toast('📷 「' + PHOTO_CAPS[photoCap] + '」 사진을 올렸어요 — 📒 마을 수첩 「사진」에서 볼 수 있어요');
          SOCIAL.photoAt = 0; feedPost('photo', 0);
        }, function () { toast('사진을 올리지 못했어요'); });
      } catch (e) { toast('이 기기에서는 사진을 찍을 수 없어요'); }
    }, 450);
  }
  function fetchPhotos(force) {
    if (!socialOn() || SOCIAL.busy.photo || (!force && Date.now() < SOCIAL.photoAt)) return;
    SOCIAL.photoAt = Date.now() + 30000; SOCIAL.busy.photo = 1;
    client.rpc('get_ark_photos').then(function (r) {
      SOCIAL.busy.photo = 0;
      if (!r || r.error || !Array.isArray(r.data)) return;
      SOCIAL.photos = r.data; socialRerender('photos');
    }, function () { SOCIAL.busy.photo = 0; });
  }
  function showPhoto(p, holder) {
    if (SOCIAL.imgs[p.id]) { holder.src = SOCIAL.imgs[p.id]; holder.hidden = false; return; }
    client.rpc('get_ark_photo_img', { p_id: p.id }).then(function (r) { if (r && typeof r.data === 'string') { SOCIAL.imgs[p.id] = r.data; holder.src = r.data; holder.hidden = false; } }, function () {});
  }
  // 설계도 나누기: 내 땅에 지은 모양을 저장하고, 친구 설계도를 내 땅에 반투명으로 띄운다
  var planName = 0;
  function capturePlan() {
    if (myPlot < 0) return toast('로그인하고 내 땅을 먼저 받아요');
    var o = plotOrigin(myPlot), raw = [], x0 = 99, z0 = 99, x1 = -1, z1 = -1, hMax = 0;
    for (var y = G - 1; y < G + PH && y < SY; y++) for (var z = 0; z < PLOT; z++) for (var x = 0; x < PLOT; x++) {
      var id = get(o.x + x, y, o.z + z);
      if (!id || id === WATER || kind(id) === 'plant' || id > 999) continue;
      if (y === G - 1 && (id === GRASS || id === DIRT || id === SAND)) continue;   // 원래 땅은 빼고 지은 것만
      raw.push([x, y - (G - 1), z, id]); x0 = Math.min(x0, x); z0 = Math.min(z0, z); x1 = Math.max(x1, x); z1 = Math.max(z1, z); hMax = Math.max(hMax, y - (G - 1));
    }
    if (!raw.length) return toast('내 땅에 지은 것이 없어요. 먼저 지어 보세요');
    var str = raw.map(function (c) { return (c[0] - x0) + '.' + c[1] + '.' + (c[2] - z0) + '.' + c[3]; }).join(';');
    if (str.length > 40000) return toast('설계도로 담기에는 너무 커요(블록을 조금 줄여 주세요)');
    client.rpc('save_ark_plan', { p_name: planName, p_cells: str, p_w: x1 - x0 + 1, p_l: z1 - z0 + 1, p_h: Math.min(40, hMax + 1) }).then(function (r) {
      var d = r && r.data;
      if (!d || !d.ok) return toast('설계도를 저장하지 못했어요');
      toast('📐 「' + PLAN_NAMES[planName] + '」 설계도를 저장했어요 — 친구들이 따라 지을 수 있어요(블록 ' + raw.length + '개)');
      SOCIAL.planAt = 0; feedPost('plan', 0); socialRerender('build');
    }, function () { toast('설계도를 저장하지 못했어요'); });
  }
  function fetchPlans(force) {
    if (!socialOn() || SOCIAL.busy.plan || (!force && Date.now() < SOCIAL.planAt)) return;
    SOCIAL.planAt = Date.now() + 30000; SOCIAL.busy.plan = 1;
    client.rpc('get_ark_plans').then(function (r) {
      SOCIAL.busy.plan = 0;
      if (!r || r.error || !Array.isArray(r.data)) return;
      SOCIAL.plans = r.data; socialRerender('build');
    }, function () { SOCIAL.busy.plan = 0; if (!SOCIAL.plans) SOCIAL.plans = []; });
  }
  function loadPlan(row) {
    if (myPlot < 0) return toast('로그인하고 내 땅을 먼저 받아요');
    client.rpc('get_ark_plan', { p_owner: row.owner }).then(function (r) {
      if (!r || typeof r.data !== 'string' || !r.data) return toast('설계도를 불러오지 못했어요');
      var cells = r.data.split(';').map(function (s) { return s.split('.').map(Number); }).filter(function (c) { return c.length === 4 && B[c[3]]; });
      var o = plotOrigin(myPlot);
      villageBook.plan = { kind: 'custom', plot: myPlot, name: PLAN_NAMES[row.name] || '설계도', nick: row.nick, cells: cells,
        x: Math.max(0, Math.min(PLOT - row.w, Math.floor(P.x) - o.x)), z: Math.max(0, Math.min(PLOT - row.l, Math.floor(P.z) - o.z)) };
      saveVillageBook(); resume(); toast('📐 ' + row.nick + '님의 「' + villageBook.plan.name + '」 설계도를 내 땅에 띄웠어요. 반투명 윤곽을 따라 지어요');
    }, function () { toast('설계도를 불러오지 못했어요'); });
  }
  function customPlanCells(plan) {
    if (!plan || plan.kind !== 'custom' || plan.plot !== myPlot || !plan.cells) return [];
    var o = plotOrigin(plan.plot);
    return plan.cells.map(function (c) { return [o.x + plan.x + c[0], G - 1 + c[1], o.z + plan.z + c[2], c[3]]; });
  }
  function selectRow(body, label, names, cur, onPick) {
    var wrap = document.createElement('p'), lab = document.createElement('span'), s = document.createElement('select');
    lab.textContent = label + ' ';
    names.forEach(function (n, i) { var op = document.createElement('option'); op.value = i; op.textContent = n; if (i === cur) op.selected = true; s.appendChild(op); });
    s.addEventListener('change', function () { onPick(+s.value); });
    wrap.appendChild(lab); wrap.appendChild(s); body.appendChild(wrap);
  }
  function renderSocialTab(tab, body) {
    if (tab !== 'feed' && tab !== 'gifts' && tab !== 'photos') return false;
    if (!socialOn()) { villageText(body, '로그인하면 마을 소식·선물·사진을 함께 나눌 수 있어요.'); return true; }
    if (tab === 'feed') {
      fetchFeed();
      villageText(body, '최근 사흘 동안 마을에서 있었던 일이에요.');
      var lines = SOCIAL.feed.map(function (f) { var t = feedLine(f); return t ? t + ' · ' + timeAgo(f.at) : null; }).filter(Boolean);
      if (!lines.length) villageText(body, '아직 소식이 없어요. 집을 짓거나 사진을 올리면 여기에 나와요.');
      lines.forEach(function (t) { villageText(body, t); });
      villageButton(body, '새로 고침', function () { fetchFeed(true); });
    } else if (tab === 'gifts') {
      fetchGifts();
      villageText(body, '받은 선물', 'h3');
      if (!SOCIAL.gifts.length) villageText(body, '받은 선물이 없어요.');
      SOCIAL.gifts.forEach(function (g) { villageButton(body, '🎁 ' + g.nick + '님 · ' + nameOf(g.item) + ' ' + g.amount + '개 받기', function () { claimGift(g); }); });
      villageText(body, '선물 보내기', 'h3');
      var held = HOTBAR[sel];
      villageText(body, '손에 든 것: ' + (held && INV.indexOf(held) >= 0 ? nameOf(held) + ' (' + have(held) + '개)' : '없음') + ' · 친구에게 1·4·8개를 보낼 수 있어요(하루 10번).');
      if (!FRIENDS.ready) { friendsFetch(); villageText(body, '친구 목록을 불러오는 중…'); }
      var fr = FRIENDS.rows.filter(function (v) { return v.status === 'accepted'; });
      if (FRIENDS.ready && !fr.length) villageText(body, '아직 친구가 없어요. 친구를 맺으면 선물을 보낼 수 있어요.');
      fr.forEach(function (f) {
        var p = villageText(body, f.nick + ' ');
        [1, 4, 8].forEach(function (n) { villageButton(p, n + '개', function () { sendGift(f.id, f.nick, n); }); });
      });
    } else if (tab === 'photos') {
      fetchPhotos();
      villageText(body, '지금 보고 있는 게임 화면을 찍어 마을에 전시해요(한 사람 3장까지).');
      selectRow(body, '사진 제목', PHOTO_CAPS, photoCap, function (i) { photoCap = i; });
      villageButton(body, '📷 지금 화면 찍어 올리기', takePhoto);
      villageText(body, '마을 사진첩', 'h3');
      if (!SOCIAL.photos.length) villageText(body, '아직 올라온 사진이 없어요.');
      SOCIAL.photos.forEach(function (p) {
        var row = villageText(body, p.nick + ' · ' + (PHOTO_CAPS[p.caption] || '사진') + ' · ' + timeAgo(p.at) + ' · ♥ ' + p.likes + ' ');
        var img = document.createElement('img'); img.hidden = true; img.alt = PHOTO_CAPS[p.caption] || '사진'; img.style.cssText = 'display:block;max-width:100%;margin:4px 0;image-rendering:auto';
        villageButton(row, '보기', function () { showPhoto(p, img); });
        if (!p.mine) villageButton(row, p.liked ? '♥ 취소' : '♥ 좋아요', function () { client.rpc('like_ark_photo', { p_id: p.id }).then(function () { fetchPhotos(true); }); });
        if (p.mine || NET.admin) villageButton(row, '지우기', function () { client.rpc('remove_ark_photo', { p_id: p.id }).then(function () { fetchPhotos(true); }); });
        row.appendChild(img);
      });
    }
    return true;
  }
  function renderPlanShare(body) {
    villageText(body, '설계도 나누기', 'h3');
    if (!socialOn()) { villageText(body, '로그인하면 내 설계도를 친구와 나눌 수 있어요.'); return; }
    villageText(body, '내 땅에 지은 모양을 설계도로 저장하면 친구들이 자기 땅에서 따라 지을 수 있어요(한 사람 하나).');
    selectRow(body, '설계도 이름', PLAN_NAMES, planName, function (i) { planName = i; });
    villageButton(body, '📐 내 땅 모양을 설계도로 저장', capturePlan);
    fetchPlans();
    if (SOCIAL.plans === null) { villageText(body, '설계도 목록을 불러오는 중…'); return; }
    if (!SOCIAL.plans.length) villageText(body, '아직 나눈 설계도가 없어요. 친구가 저장하면 여기에 나와요.');
    SOCIAL.plans.forEach(function (row) {
      villageButton(body, (row.mine ? '내 설계도' : row.nick + '님') + ' · ' + (PLAN_NAMES[row.name] || '설계도') + ' (' + row.w + '×' + row.l + ', 높이 ' + row.h + ')', function () { loadPlan(row); });
    });
  }
  function renderVillageExtras(tab,body) {
    if (renderSocialTab(tab, body)) return;
    if(tab==='discover') {
      villageText(body,'가까운 옛터를 찾으면 살펴보고 발견물을 내 땅에 전시할 수 있어요.');
      VILLAGE_SITES.forEach(function (s) { villageText(body, (villageBook.found&&villageBook.found[s.item]?'✓ ':'')+s.name+' · '+s.clue); });
      villageText(body,'낚시 도감','h3');
      ['강','호수','바다'].forEach(function (r) { villageText(body,nameOf(VILLAGE_FISH[r])+' · '+(villageBook.fish&&villageBook.fish[r]||0)+'마리'); });
      villageText(body,'자연 도감','h3');
      [[THORN,'남쪽 들판이나 동쪽 숲 끝'],[THISTLE,'서쪽 언덕이나 열린 들판'],[LILY,'강이나 호수 가까이']].forEach(function (item) {
        villageText(body,nameOf(item[0])+' · '+(villageBook.plants&&villageBook.plants[item[0]]||item[1]));
      });
      return;
    }
    if(tab==='frontier') return renderFrontier(body);
    renderVillageCommunity(tab,body);
  }
  var VILLAGE_PROJECTS={
    bridge:['돌다리',996,790,1008,797],
    well:['공동 우물',1030,765,1036,772],
    shelter:['여행자 쉼터',1031,790,1041,800],
    pen:['목자의 양 우리',1030,775,1039,785],
    meal:['함께 차리는 식탁',1042,790,1053,800],
    railway:['함께 놓는 철길',993,756,1054,815]
  };
  var VILLAGE_ROLES=['재료 모으기','재료 다듬기','블록 놓기'];
  var villageProjectsEnabled=false, villageProjectState={}, villageProjectFetch=false, villageProjectAt=0;
  function projectCells(key) {
    var out=[];
    function put(x,y,z,id){out.push([x,y,z,id]);}
    if(key==='bridge'){
      for(var x=998;x<=1006;x++)for(var z=793;z<=795;z++)put(x,G,z,SBRICK);
      for(x=998;x<=1006;x++){put(x,G+1,793,RAIL);put(x,G+1,795,RAIL);}
    }else if(key==='well'){
      put(1033,G,768,WELL);
      for(var dx=-1;dx<=1;dx++)for(var dz=-1;dz<=1;dz++)if(dx||dz)put(1033+dx,G,768+dz,SBRICK);
    }else if(key==='shelter'){
      for(x=1033;x<=1039;x++)for(z=792;z<=798;z++)put(x,G+4,z,FLAT_ROOF);
      [1033,1039].forEach(function(a){[792,798].forEach(function(b){for(var y=G;y<G+4;y++)put(a,y,b,PILLAR);});});
    }else if(key==='pen'){
      for(x=1032;x<=1037;x++)for(z=777;z<=782;z++)if(x===1032||x===1037||z===777||z===782)
        put(x,G,z,x===1034&&z===782?GATE:FENCE);
    }else if(key==='railway'){   // 함께 짓는 터 둘레 한 바퀴(240칸) — 보통·빠른 레일 어떤 모양이든
      for(x=993;x<=1054;x++){put(x,G,756,RAIL0);put(x,G,815,RAIL0);}
      for(z=757;z<=814;z++){put(993,G,z,RAIL0);put(1054,G,z,RAIL0);}
    }else if(key==='meal'){
      [FEAST_BREAD,FEAST_OLIVE,FEAST_FISH].forEach(function(id,i){put(1045+i*2,G,795,FEAST_TABLE);put(1045+i*2,G+1,795,id);});
    }
    return out;
  }
  function buildBridgeGround(x0,z0) {
    if(x0+CS<=1001||x0>1003||z0+CS<=790||z0>797)return;
    fill(1001,G-2,790,1003,G-2,797,STONE);
    fill(1001,G-1,790,1003,G-1,797,WATER);
    fill(1001,G,790,1003,G,797,AIR);
  }
  function inProject(p,x,z) { return !!p&&x>=p[1]&&x<=p[3]&&z>=p[2]&&z<=p[4]; }
  function villageProjectLocked(x,z) {
    return Object.keys(villageProjectState).some(function(key){
      return villageProjectState[key].locked&&inProject(VILLAGE_PROJECTS[key],x,z);
    });
  }
  function syncVillageProject(key) {
    var p=VILLAGE_PROJECTS[key];
    if(!p||!client)return;
    client.rpc('ark_village_project_blocks',{p_key:key}).then(function(r){
      if(r.error||!Array.isArray(r.data))return;
      var data=new Map();
      r.data.forEach(function(row){data.set(row.x+','+row.y+','+row.z,row);});
      for(var z=p[2];z<=p[4];z++)for(var x=p[1];x<=p[3];x++)for(var y=1;y<SY;y++){
        var place=x+','+y+','+z;
        if(Object.hasOwn(NET.pm,place))continue;
        var index=(z>>5)*NC+(x>>5), block=(y*CS+(z&31))*CS+(x&31), current=EDITS[index];
        if(!data.has(place)&&current&&Object.hasOwn(current,block))queueRevert(x,y,z);
      }
      data.forEach(function(row,place){
        if(!Object.hasOwn(NET.pm,place))queueRemote('project-'+key,[row.x,row.y,row.z,row.id]);
      });
    },function(){});
  }
  function fetchVillageProjects() {
    if(!client||villageProjectFetch)return Promise.resolve();
    villageProjectFetch=true;
    return client.rpc('ark_village_project_status',{}, {get:true}).then(function(r){
      if(!Array.isArray(r.data)||r.error)return;
      villageProjectsEnabled=true; villageProjectState={};
      r.data.forEach(function(row){villageProjectState[row.key]=row;});
      if(ui==='villageWork'&&(villageTab==='projects'||villageTab==='neighbors'))renderVillageWork();
    }).catch(function(){}).finally(function(){villageProjectFetch=false;});
  }
  function focusProject(key) {
    var p=VILLAGE_PROJECTS[key];
    villageBook.project=key; saveVillageBook(); saveProjectRole();
    teleport((p[1]+p[3])/2+.5,surfaceY((p[1]+p[3])>>1,p[4]+2),p[4]+2,0);
    resume(); toast(p[0]+' 설계도를 보여 줘요');
  }
  function saveProjectRole() {
    var k=villageBook.project, i=VILLAGE_ROLES.indexOf(villageBook.role);
    if(!client||!me||!VILLAGE_PROJECTS[k]||i<0)return;
    client.rpc('set_ark_village_role',{p_key:k,p_role:i}).then(function(r){
      if(r.data===true)fetchVillageProjects();
    },function(){});
  }
  function projectAdmin(key,action) {
    if(!NET.admin||!client)return;
    if(action==='restore'&&!window.confirm(VILLAGE_PROJECTS[key][0]+'만 마지막 저장 상태로 되돌릴까요?'))return;
    client.rpc('ark_village_project_admin',{p_key:key,p_action:action}).then(function(r){
      toast(!r.error&&r.data===true?'공사장 상태를 바꿨어요':'공사장 상태를 바꾸지 못했어요');
      if(!r.error&&r.data===true&&action==='restore')syncVillageProject(key);
      fetchVillageProjects();
    }, function(){toast('공사장 상태를 바꾸지 못했어요');});
  }
  function renderOneProject(body,key) {
    var d=VILLAGE_PROJECTS[key], state=villageProjectState[key], cells=projectCells(key);
    var line=document.createElement('div'); line.className='vrow'; body.appendChild(line);
    var available=!!state, count=available?state.done:0, done=available&&count>=cells.length;
    villageText(line,d[0]+(available?' '+count+'/'+cells.length:' · 연결 중')+(done?' · 완성':'')+(state&&state.locked?' · 보호 중':''),'span');
    if(!available)return;
    if(Array.isArray(state.roles))villageText(line,VILLAGE_ROLES.map(function(role,i){return role+' '+state.roles[i]+'명';}).join(' · '),'small');
    villageButton(line,'공사장으로',function(){focusProject(key);});
    if(NET.admin){
      if((done||state.locked)&&key!=='railway')villageButton(line,state.locked?'잠금 풀기':'완성한 곳 보호',function(){projectAdmin(key,state.locked?'unlock':'lock');});
      if(state.snapshot)villageButton(line,'이곳만 되돌리기',function(){projectAdmin(key,'restore');});
    }
  }
  function renderDonkeyCargo(body) {
    var a=riding&&riding.kind==='donkey'?riding:animals.find(function(animal){return animal.kind==='donkey'&&animal.saddled&&Math.hypot(animal.x-P.x,animal.z-P.z)<=6;});
    if(!a)return villageText(body,'안장을 얹은 나귀 가까이에서 짐을 실어요.');
    a.cargo=readCargo(a.cargo);
    a.cargo.forEach(function(slot,i){
      var line=document.createElement('div'); line.className='vrow'; body.appendChild(line);
      villageText(line,(i+1)+'번 짐 · '+(slot?nameOf(slot[0])+' '+slot[1]+'개':'빈 자리'),'span');
      if(slot){
        villageButton(line,'꺼내기',function(){
          var n=give(slot[0],slot[1]); if(!n)return bagFull();
          slot[1]-=n; if(!slot[1])a.cargo[i]=null;
          saveHorses(); stateDirty(); bagChanged(); renderVillageWork();
        });
      }else{
        var select=document.createElement('select'); select.setAttribute('aria-label',(i+1)+'번 짐에 실을 물건');
        INV.filter(function(id){return !isTool(id)&&have(id)>0;}).forEach(function(id){
          var o=document.createElement('option');o.value=id;o.textContent=nameOf(id)+' '+have(id)+'개';select.appendChild(o);
        });
        line.appendChild(select);
        villageButton(line,'실어 두기',function(){
          var id=Number(select.value),n=Math.min(STACK,have(id));
          if(!id||!n||isAdm())return;
          take(id,n); a.cargo[i]=[id,n]; saveHorses(); stateDirty(); bagChanged(); renderVillageWork();
        });
      }
    });
  }
  var HOUSE_THEMES=['주제 없음','목장','쉼터','정원','빵집'];
  function renderShowcaseSetup(body) {
    if(myPlot<0||!client)return villageText(body,'로그인하고 내 땅을 받은 뒤 꾸밀 수 있어요.');
    // 땅 팻말 글: 16자까지, 채팅처럼 쓸 수 없는 말은 막힘, 비우면 「OO님의 땅」으로
    villageText(body,'🪧 내 땅 팻말 — 16자까지, 모두에게 보여요 (비우면 「이름님의 땅」)');
    var nrow=document.createElement('div');nrow.className='vrow';body.appendChild(nrow);
    var inp=document.createElement('input');inp.type='text';inp.maxLength=16;inp.placeholder='예: 하늘 목장, 기도하는 집';inp.value=(me&&PLOT_NAMES[me.id])||'';inp.setAttribute('aria-label','팻말에 쓸 말');inp.style.cssText='flex:1;min-width:0;font:inherit;padding:6px';
    nrow.appendChild(inp);
    villageButton(nrow,'팻말 저장',function(){
      client.rpc('set_ark_plot_name',{p_body:inp.value}).then(function(r){
        var d=r&&r.data||{}, why={bad:'쓸 수 없는 말이 들어 있어요',long:'16자까지 쓸 수 있어요',muted:'지금은 글을 쓸 수 없어요',slow:'조금 뒤에 다시 저장해 주세요',login:'로그인하면 쓸 수 있어요'}[d.error];
        if(why)return toast('🪧 '+why);
        if(d.cleared)delete PLOT_NAMES[me.id]; else PLOT_NAMES[me.id]=inp.value.trim().replace(/\s{2,}/g,' ');
        newsMark('plotname'); refreshPlotSigns(); toast(d.cleared?'🪧 팻말을 「이름님의 땅」으로 돌렸어요':'🪧 팻말을 바꿨어요 — 땅 앞 모서리에서 보여요');
      },function(){toast('🪧 팻말을 저장하지 못했어요');});
    });
    villageText(body,'친구 집 구경에서 보여 줄 집의 주제와 두 군데의 볼거리를 정해요.');
    var profile=villageBook.house || (villageBook.house={theme:0,marks:[]});
    var row=document.createElement('div');row.className='vme';body.appendChild(row);
    HOUSE_THEMES.forEach(function(t,i){
      var b=villageButton(row,t,function(){profile.theme=i;profile.edited=true;saveVillageBook();renderVillageWork();});
      b.setAttribute('aria-pressed',String(profile.theme===i));
    });
    if (profile.loading!==true&&!profile.ready) {
      profile.loading=true;
      client.rpc('get_ark_showcase_details').then(function(r){
        var own=Array.isArray(r.data)&&r.data.find(function(d){return d.plot_idx===myPlot;});
        if(own&&!profile.edited){profile.theme=own.theme;profile.marks=own.marks;}
        profile.ready=true;delete profile.loading;
        if(ui==='villageWork'&&villageTab==='showcase')renderVillageWork();
      },function(){profile.ready=true;delete profile.loading;});
    }
    profile.marks.forEach(function (mark,i) {
      var line=document.createElement('div');line.className='vrow';body.appendChild(line);
      villageText(line,'볼거리 '+(i+1)+' · 내 땅 '+(mark[0]+1)+', '+(mark[1]+1),'span');
      villageButton(line,'빼기',function (){profile.edited=true;profile.marks.splice(i,1);saveVillageBook();renderVillageWork();});
    });
    villageButton(body,'지금 선 자리를 볼거리로',function(){
      var x=Math.floor(P.x),z=Math.floor(P.z);
      if(plotAt(x,z)!==myPlot)return toast('내 땅 안에서 다시 눌러요');
      if(profile.marks.length>=2)return toast('볼거리는 두 군데까지 둘 수 있어요');
      var o=plotOrigin(myPlot);
      if(profile.marks.some(function(m){return m[0]===x-o.x&&m[1]===z-o.z;}))return toast('이미 표시한 곳이에요');
      profile.edited=true;profile.marks.push([x-o.x,z-o.z]);saveVillageBook();renderVillageWork();
    });
    villageButton(body,'집 구경 정보 저장',function(){
      client.rpc('set_ark_showcase_details',{p_theme:profile.theme,p_marks:profile.marks}).then(function(r){
        toast(r.data===true?'집 구경 정보를 저장했어요':'집 구경 정보를 저장하지 못했어요');
      },function(){toast('집 구경 정보를 저장하지 못했어요');});
    });
    villageButton(body,'공개 설정과 친구 집',openVisit);
    // 근처 팻말 신고: 서로 다른 3명이 신고하면 가려져요(주인이 새로 쓰면 다시 셈)
    var near=Object.keys(plotSignObjs).map(Number).filter(function(i){var u=plotUser[i];return u&&i!==myPlot&&PLOT_NAMES[u];});
    if(near.length){
      villageText(body,'🚩 근처 팻말 — 보기 싫은 말이 있으면 신고해요(3명이 신고하면 가려져요)','h3');
      near.forEach(function(i){var u=plotUser[i],line=document.createElement('div');line.className='vrow';body.appendChild(line);
        villageText(line,PLOT_NAMES[u]+' · '+(NET.names[u]||(i+1)+'번 땅'),'span');
        villageButton(line,'신고',function(){
          if(!window.confirm('「'+PLOT_NAMES[u]+'」 팻말을 신고할까요?'))return;
          client.rpc('report_ark_plot_name',{p_target:u}).then(function(r){var d=r&&r.data||{};toast(d.ok?'🚩 신고했어요 — 3명이 신고하면 가려져요':(d.error==='login'?'로그인하면 신고할 수 있어요':'신고하지 못했어요'));},function(){toast('신고하지 못했어요');});
        });});
    }
    if(NET.admin){   // 관리자: 팻말 글 지우기
      Object.keys(PLOT_HIDDEN).forEach(function(u){var line=document.createElement('div');line.className='vrow';body.appendChild(line);
        villageText(line,'(신고로 가려짐) '+(NET.names[u]||'?')+' · '+PLOT_HIDDEN[u],'span');
        villageButton(line,'지우기',function(){client.rpc('admin_clear_ark_plot_name',{p_user:u}).then(function(r){if(r&&r.data===true){delete PLOT_HIDDEN[u];renderVillageWork();toast('팻말 글을 지웠어요');}});});});
      var ids=Object.keys(PLOT_NAMES); if(ids.length)villageText(body,'관리자 · 학생 팻말 글','h3');
      ids.forEach(function(u){var line=document.createElement('div');line.className='vrow';body.appendChild(line);
        villageText(line,(NET.names[u]||'?')+' · '+PLOT_NAMES[u],'span');
        villageButton(line,'지우기',function(){client.rpc('admin_clear_ark_plot_name',{p_user:u}).then(function(r){if(r&&r.data===true){delete PLOT_NAMES[u];refreshPlotSigns();renderVillageWork();toast('팻말 글을 지웠어요');}});});});
    }
  }
  function renderVillageCommunity(tab,body) {
    if(tab==='cargo')return renderDonkeyCargo(body);
    if(tab==='showcase')return renderShowcaseSetup(body);
    if(tab==='projects'){
      villageText(body,'함께 짓는 터의 공사장에서는 설계도에 맞게 놓은 블록을 모두의 진행에 더해요.');
      var row=document.createElement('div'); row.className='vme'; body.appendChild(row);
      VILLAGE_ROLES.forEach(function(role){
        var btn=villageButton(row,role,function(){villageBook.role=role; saveVillageBook(); saveProjectRole(); renderVillageWork();});
        btn.setAttribute('aria-pressed',String(villageBook.role===role));
      });
      if(villageBook.role)villageText(body,'내가 맡은 일 · '+villageBook.role);
      ['bridge','well','shelter'].forEach(function(key){renderOneProject(body,key);});
      villageText(body,'🛤 함께 짓는 터 둘레에 레일을 이어 깔아 한 바퀴 도는 철길을 만들어요. 다 이으면 수레를 타고 함께 돌아요(금빛 빠른 레일도 돼요).');
      renderOneProject(body,'railway');
      if(villageProjectState.railway&&villageProjectState.railway.done>=240)villageText(body,'철길이 한 바퀴 다 이어졌어요! 수레를 타고 돌아 보세요.');
    }else{
      villageText(body,'목자가 부탁했어요. 양들이 안전하게 쉴 수 있도록 울타리와 문을 고쳐 주세요.');
      renderOneProject(body,'pen');
      villageText(body,'여행자에게 대접할 빵과 올리브, 구운 생선을 식탁에 차려 주세요.');
      renderOneProject(body,'meal');
      if(villageProjectState.meal&&villageProjectState.meal.done>=6)villageText(body,'따뜻한 식탁이 준비됐어요. 함께 먹을 자리가 생겼어요.');
    }
  }

  function loadOnline() {
    try {
      if (window.supabase && window.SUPABASE_URL) client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
    } catch (e) { client = null; }
    if (!client) return Promise.resolve();
    return client.auth.getSession().then(function (r) {
      me = r && r.data && r.data.session ? r.data.session.user : null;
      villageBook=loadVillageBook(me ? me.id : 'guest');
      $('who').textContent = me ? '' : '구경 중 · 로그인하면 저장돼요';
      var claim = me ? client.rpc('claim_village_plot').then(function (c) { if (!c.error && c.data !== null) myPlot = c.data; }) : Promise.resolve();
      return claim.then(function () { return client.from('ark_village_plots').select('plot_idx,data,user_id,updated_at'); });
    }).then(function (res) {
      var hasExpandedRows=(res&&res.data||[]).some(function(row){
        return typeof row.data==='string'&&row.data.startsWith('r3:');
      });
      function usePlotLayout(layout) {
        if (hasExpandedRows || (layout && layout.data===WIDE_PLOT)) enableWidePlots();
        return res;
      }
      return client.rpc('ark_plot_width', {}, { get: true }).then(usePlotLayout,function(){return usePlotLayout(null);});
    }).then(function (res) {
      (res && res.data || []).forEach(function (row) {
        plotOwners[row.plot_idx] = 1; plotUser[row.plot_idx] = row.user_id;
        if (me && row.user_id === me.id) plotSrvAt = row.updated_at;
        plotSeen[row.plot_idx] = row.updated_at;
        if (row.data) decodePlot(row.plot_idx, row.data, me && row.user_id === me.id);
      });
      return Promise.all([loadShared(),fetchVillageProjects(),fetchFrontier()]);
    }).then(function () {
      setSave(myPlot >= 0 ? '내 땅 ' + (myPlot + 1) + '번' : '');
      if (me && myPlot >= 0) setTimeout(tryClaimDex, 3000);
    }).catch(function () { toast('인터넷이 약해서 다른 사람 집을 못 불러왔어요'); });
  }
  window.addEventListener('beforeunload', function () { if (dirty) savePlot(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) { saveEdits(); if (dirty) savePlot(); } });


  // 개척지 지형은 기존 자연·플레이어 편집을 덮지 않도록 생성 단계에서만 넣는다.
  var FRONTIER_ENTRY=[1238,1154], FRONTIER_CAVE=[[1242,1176,10],[1296,1198,10]];
  var FRONTIER_BOUNDS=[1216,1144,1311,1239];
  var forestDestination=FOREST_ENTRY, forestName='동쪽 숲';
  var FRONTIER_DIRS=[[0,-1],[1,0],[0,1],[-1,0]];
  function buildFrontierCave(x0,z0,tops) {
    if(x0>1304||x0+CS<=1236||z0>1206||z0+CS<=1174)return;
    fill(1242,10,1174,1296,15,1178,AIR);
    fill(1294,10,1176,1298,15,1198,AIR);
    fill(1257,9,1176,1277,17,1191,AIR);
    fill(1279,7,1183,1296,13,1187,AIR);
    fill(1273,9,1180,1283,14,1187,AIR);
    fill(1261,9,1189,1277,9,1191,WATER);
    fill(1281,7,1184,1292,7,1185,WATER);
    fill(1246,10,1173,1251,12,1173,ORE_CU);
    fill(1267,9,1192,1272,11,1192,ORE_FE);
    fill(1284,6,1184,1290,6,1184,ORE_AG);
    fill(1296,7,1185,1297,8,1185,ORE_AU);
    FRONTIER_CAVE.forEach(function(entry){
      var x=entry[0],z=entry[1];
      if(x<x0||x>=x0+CS||z<z0||z>=z0+CS)return;
      var top=tops[(z-z0)*CS+x-x0];
      fill(x,entry[2],z,x,top+1,z,LADDER+3);
      setRaw(x,top+2,z,AIR);
    });
  }
  function startFrontierGuide(pos,label) {
    forestRoute=[];
    if(P.x<VX1 && P.z>=PZ0-12 && P.z<=VZ1) {
      startForestRoute();
      if(!forestRoute) forestRoute=[];
    }
    forestRoute.push(pos);
    forestDestination=pos; forestName=label;
    resume(); renderForestRoute();
  }
  function drawFrontierMap(ctx,big,ox,oz,scale) {
    function outline(box,color) { ctx.strokeStyle=color; ctx.strokeRect((box[0]-ox)*scale,(box[1]-oz)*scale,(box[2]-box[0]+1)*scale,(box[3]-box[1]+1)*scale); }
    ctx.save(); ctx.lineWidth=big?2:1;
    outline(FRONTIER_BOUNDS,'#a7d466');
    for(var i=0;i<9;i++)outline(frontierBounds(i),frontierPlots[i]?.canEdit?'#84ebc7':'#e6ac60');
    ctx.fillStyle='#ffee87';
    FRONTIER_CAVE.forEach(function(point){ctx.fillRect((point[0]-ox)*scale-2,(point[1]-oz)*scale-2,5,5);});
    ctx.restore();
  }

  var buildTurn=0, buildUndo=null, blockGhost=null, blockGhostId=-1, blockGhostAt=0;
  function rotatableBuild(item) {
    var shape=SHAPE[item];
    return shape && ['stair','chair','gate','door','arch','sluice','sign','ladder'].indexOf(shape.type)>=0;
  }
  function orientedBuild(item,dir,id) {
    if(item===SLUICE) return SLUICE+dir*2;
    if(item===ARCH) return dir%2 ? ARCH_SIDE : ARCH;
    return id;
  }
  function rotateBuild() {
    if(ui!=='play'||!rotatableBuild(HOTBAR[sel]))return;
    buildTurn=(buildTurn+1)%4; blockGhostAt=0;
    $('buildRotate').textContent='돌리기 '+buildTurn*90+'°';
    if(!isTouch)toast('놓을 방향 '+buildTurn*90+'°');
  }
  function rememberBuild(item,cells) {
    buildUndo=null;
    if(!isGrav(item)&&item!==SAPLING&&myPlot>=0&&cells.every(function(c){return plotAt(c[0],c[2])===myPlot && (c[3]===AIR || kind(c[3])==='plant');})) {
      buildUndo={item:item,cells:cells};
    }
  }
  function undoBuild() {
    if(ui!=='play'||!buildUndo)return;
    var u=buildUndo; buildUndo=null;
    if(u.cells.some(function(c){return readBlock(c[0],c[1],c[2])!==c[4]||canPlace(c[0],c[1],c[2],u.item);}))return toast('그 자리가 바뀌었어요');
    if(!isAdm()&&give(u.item,1)!==1)return toast('가방을 한 칸 비워 주세요');
    u.cells.forEach(function(c){setBlock(c[0],c[1],c[2],c[3]);});
    bagChanged(); toast('방금 놓은 블록을 되돌렸어요');
  }
  function updateFrontierTools(now) {
    if(!blockGhost) {
      blockGhost=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:0x9be2b3,transparent:true,opacity:.32,depthWrite:false}));
      blockGhost.visible=false; scene.add(blockGhost);
    }
    if(now<blockGhostAt)return;
    blockGhostAt=now+80;
    var item=HOTBAR[sel], rotation=!!rotatableBuild(item), show=ui==='play'&&!furnitureRest&&!frontierLift;
    $('buildRotate').hidden=!rotation; $('buildUndo').hidden=!buildUndo;
    $('buildTools').hidden=!show||!rotation&&!buildUndo;
    blockGhost.visible=false;
    if(!show||!isTouch||!item||isItem(item)||!have(item)||SLAB_TOP[item])return;
    var hit=hold&&S.aim==='finger'?pickTouch(hold.x,hold.y):pickCenter();
    if(!hit||blockActionLabel(hit,item))return;
    var id=item, dir=(lookDir()+buildTurn)%4, sh=SHAPE[item];
    if(sh&&sh.type==='stair')id=sh.base+dir;
    if(item===CHAIR)id=CHAIR+(dir+2)%4;
    if(item===GATE)id=GATE_STATES[dir%2][0];
    if(item===DOOR)id=DOOR+((dir+2)%4)*2;
    if(item===LADDER||item===SIGN)id=item+dir;
    id=orientedBuild(item,dir,id);
    if(blockGhostId!==id) { blockGhost.geometry.dispose(); blockGhost.geometry=blockGeometry(id); blockGhostId=id; }
    var ok=!canPlace(hit.px,hit.py,hit.pz,item)&&!isSolid(readBlock(hit.px,hit.py,hit.pz));
    if(item===DOOR) for(var i=1;i<4;i++) if(isSolid(readBlock(hit.px,hit.py+i,hit.pz))||canPlace(hit.px,hit.py+i,hit.pz,item))ok=false;
    blockGhost.material.color.setHex(ok?0x9be2b3:0xff806d);
    blockGhost.position.set(hit.px+.5,hit.py+.5,hit.pz+.5); blockGhost.visible=false;   // 11/20 놓일 자리 미리보기 블록은 보이지 않게(전도사님 「없어도 되지 않을까」)
  }

  var frontierLift=null, frontierWater=new Set(), frontierWheels=new Map(), frontierRotors=new Map(), frontierStepAt=0, lastPlate='';
  function frontierCell(x,y,z) { return ((y*WS+z)*WS+x); }
  function isFrontierMachine(id) { return id===WATERWHEEL || id>=SLUICE && id<SLUICE+8; }
  function updateFrontierMachine(col,x,y,z,id) {
    if(!col || !col.machines)return;
    var k=(y*CS+(z&31))*CS+(x&31);
    if(isFrontierMachine(id))col.machines.add(k); else col.machines.delete(k);
  }
  function frontierActionLabel(id) {
    if(id>=SLUICE&&id<SLUICE+8)return SHAPE[id].open?'수문 닫기':'수문 열기';
    if(id===LIFT)return '승강대 타기';
    if(id===WATERWHEEL)return '물레방아 보기';
    return '';
  }
  function tryFrontierDevice(id,h) {
    if(id===LIFT) {beginFrontierLift(h.x,h.y,h.z);return true;}
    if(id===WATERWHEEL) {toast(frontierWheels.get(frontierCell(h.x,h.y,h.z))?.wet?'물레방아가 돌고 있어요':'물길을 물레방아 옆까지 이어 주세요');return true;}
    if(id>=SLUICE&&id<SLUICE+8) {setFrontierDevice(h.x,h.y,h.z,id,!SHAPE[id].open);return true;}
    if(id===CHEST&&frontierEnabled&&frontierSlotAt(h.x,h.z)>=0) {openFrontierStock(h);return true;}
    return false;
  }
  function setFrontierDevice(x,y,z,id,on) {
    var s=SHAPE[id];
    if(!s||!['gate','door','sluice','trapdoor'].includes(s.type)||canPlace(x,y,z,id)||s.open===on)return false;
    if(!on && P.x+HW>x&&P.x-HW<x+1&&P.z+HW>z&&P.z-HW<z+1&&P.y+HT>y&&P.y<y+1)return false;
    if(s.type==='gate'||s.type==='sluice'||s.type==='trapdoor')setBlock(x,y,z,id^1);
    else {
      var c=doorColumn(x,y,z);
      for(var yy=c[0];yy<=c[1];yy++)if(canPlace(x,yy,z,id))return false;
      for(yy=c[0];yy<=c[1];yy++)setBlock(x,yy,z,get(x,yy,z)^1);
    }
    return true;
  }
  function mechanismNeighbor(id) {
    var s=SHAPE[id];
    return id===ROPE||id===PULLEY||id===COUNTERWEIGHT||id===PRESS_PLATE||
      !!s&&['lever','sluice','gate','door','trapdoor'].includes(s.type);
  }
  function pulseMechanical(x,y,z,on) {
    var queue=[[x,y,z]], visited=new Set(), connections=[], hasRope=false, hasPulley=false;
    for(var i=0;i<queue.length&&i<100;i++) {
      var a=queue[i];
      [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]].forEach(function(d){
        var bx=a[0]+d[0],by=a[1]+d[1],bz=a[2]+d[2],k=frontierCell(bx,by,bz);
        if(visited.has(k)||by<YMIN+1||by>=SY||!colAt(bx,bz)||queue.length>=100)return;
        visited.add(k);
        var id=get(bx,by,bz), s=SHAPE[id];
        if(id===ROPE||id===PULLEY||id===COUNTERWEIGHT){hasRope=hasRope||id===ROPE;hasPulley=hasPulley||id===PULLEY;queue.push([bx,by,bz]);}
        else if(s&&['gate','door','sluice','trapdoor'].includes(s.type))connections.push([bx,by,bz,id]);
      });
    }
    if(!hasRope||!hasPulley)return false;
    connections.forEach(function(a){setFrontierDevice(a[0],a[1],a[2],get(a[0],a[1],a[2]),on===null?!SHAPE[a[3]].open:on);});
    return true;
  }
  function liftStop(x,y,z) {
    for(var offset of FRONTIER_DIRS) for(var dir of [1,-1]) {
      var gx=x+offset[0],gz=z+offset[1],first=get(gx,y,gz);
      var pulley=first===PULLEY,weight=first===COUNTERWEIGHT,rope=first===ROPE;
      for(var dy=1;dy<=12;dy++) {
        var yy=y+dy*dir,gear=get(gx,yy,gz);
        pulley=pulley||gear===PULLEY; weight=weight||gear===COUNTERWEIGHT; rope=rope||gear===ROPE;
        if(get(x,yy,z)===LIFT) {
          if(pulley&&weight&&rope)return yy;
          break;
        }
        if(gear!==ROPE&&gear!==PULLEY&&gear!==COUNTERWEIGHT)break;
      }
    }
    return null;
  }
  function beginFrontierLift(x,y,z) {
    if(frontierLift||riding||ferryRide||P.fly||furnitureRest)return;
    var to=liftStop(x,y,z);
    if(to===null)return toast('승강대 두 개 옆으로 밧줄을 잇고, 도르래와 돌 추를 하나씩 달아요');
    for(var yy=Math.min(y,to);yy<=Math.max(y,to)+Math.ceil(HT);yy++) {
      if(yy!==y&&yy!==to&&isSolid(readBlock(x,yy,z)))return toast('승강대 사이를 비워 주세요');
    }
    resetInput();
    frontierLift={x:x+.5,z:z+.5,from:y+.18,to:to+.18,t:0,mesh:new THREE.Mesh(new THREE.BoxGeometry(.95,.10,.95),new THREE.MeshLambertMaterial({color:0x976145}))};
    scene.add(frontierLift.mesh);
  }
  function clearFrontierLift() {
    if(!frontierLift)return;
    var obj=frontierLift.mesh; scene.remove(obj);obj.geometry.dispose();obj.material.dispose();frontierLift=null;
  }
  function moveFrontierLift(dt) {
    var l=frontierLift;
    l.t=Math.min(1,l.t+dt/(.6+Math.abs(l.to-l.from)*.15));
    P.x=l.x;P.z=l.z;P.y=l.from+(l.to-l.from)*l.t;P.vx=P.vy=P.vz=0;fallTop=null;
    l.mesh.position.set(P.x,P.y-.07,P.z);
    if(l.t===1){clearFrontierLift();toast('승강대에 도착했어요');}
  }
  function collectWater(x,y,z,dir,out) {
    var f=FRONTIER_DIRS[dir];
    if(readBlock(x-f[0],y,z-f[1])!==WATER)return;
    var q=[[x+f[0],y,z+f[1],0]], seen=new Set();
    for(var i=0;i<q.length&&out.size<480;i++) {
      var a=q[i],xx=a[0],yy=a[1],zz=a[2],d=a[3],k=frontierCell(xx,yy,zz),raw=readBlock(xx,yy,zz);
      if(seen.has(k)||!colAt(xx,zz)||yy<1||d>10||raw!==AIR&&raw!==DITCH||Math.abs(xx-x)+Math.abs(zz-z)>9)continue;
      if(inTown(xx,zz)&&plotAt(xx,zz)<0||protectedExcursion(xx,zz)||villageProjectLocked(xx,zz)||
          plotAt(xx,zz)!==plotAt(x,z)||frontierSlotAt(xx,zz)!==frontierSlotAt(x,z))continue;
      seen.add(k);
      if(raw===AIR)out.add(k);
      if(readBlock(xx,yy-1,zz)===AIR)q.push([xx,yy-1,zz,d+1]);
      else FRONTIER_DIRS.forEach(function(t){q.push([xx+t[0],yy,zz+t[1],d+1]);});
    }
  }
  function rebuildWaterChunks(before,after) {
    var chunks=new Set();
    function save(k) {
      var x=k%WS,z=(k/WS|0)%WS;
      for(var dx of [-1,0,1])for(var dz of [-1,0,1])if(x+dx>=0&&z+dz>=0&&x+dx<WS&&z+dz<WS)chunks.add(((z+dz)>>5)*NC+((x+dx)>>5));
    }
    before.forEach(function(k){if(!after.has(k))save(k);});
    after.forEach(function(k){if(!before.has(k))save(k);});
    chunks.forEach(function(k){if(meshedCols[k]){var x=k%NC,z=k/NC|0;unmeshColumn(x,z);meshColumn(x,z);}});
  }
  function syncFrontierWater() {
    var old=frontierWater, next=new Set(), wheels=new Map(), cx=P.x>>5,cz=P.z>>5;
    for(var dz=-1;dz<=1;dz++)for(var dx=-1;dx<=1;dx++) {
      var xx=cx+dx,zz=cz+dz,c=colAt(xx*CS,zz*CS);
      if(!c||!c.machines)continue;
      c.machines.forEach(function(k){
        var x=xx*CS+k%CS,z=zz*CS+(k/CS|0)%CS,y=k/(CS*CS)|0,id=c.d[k];
        if(id===WATERWHEEL)wheels.set(frontierCell(x,y,z),{x:x,y:y,z:z,wet:false});
        else if(SHAPE[id]?.open)collectWater(x,y,z,SHAPE[id].f,next);
      });
    }
    frontierWater=next;
    rebuildWaterChunks(old,next);
    wheels.forEach(function(w){w.wet=FRONTIER_DIRS.some(function(d){return get(w.x+d[0],w.y,w.z+d[1])===WATER || get(w.x+d[0],w.y-1,w.z+d[1])===WATER;});});
    frontierWheels=wheels;
    frontierRotors.forEach(function(obj,k){if(!wheels.has(k)){scene.remove(obj);obj.children.forEach(function(mesh){mesh.geometry.dispose();});obj.userData.mat.dispose();frontierRotors.delete(k);}});
    wheels.forEach(function(w,k) {
      if(frontierRotors.has(k))return;
      var rotor=new THREE.Group(), mat=new THREE.MeshLambertMaterial({color:0xa87a4c});
      for(var i=0;i<4;i++) {
        var bar=new THREE.Mesh(new THREE.BoxGeometry(.77,.12,.14),mat);
        bar.rotation.z=i*Math.PI/4;rotor.add(bar);
      }
      rotor.userData.mat=mat;rotor.position.set(w.x+.5,w.y+.54,w.z+.5);scene.add(rotor);frontierRotors.set(k,rotor);
    });
  }
  function stepFrontier(now,dt) {
    if(now>=frontierStepAt) {
      frontierStepAt=now+300;
      syncFrontierWater();
    }
    var x=Math.floor(P.x),y=Math.floor(P.y+.11),z=Math.floor(P.z);
    if(ui==='play'&&P.ground&&!frontierLift&&!furnitureRest&&get(x,y,z)===PRESS_PLATE) {
      var key=frontierCell(x,y,z);
      if(lastPlate!==key&&!canPlace(x,y,z,PRESS_PLATE)){lastPlate=key;pulseMechanical(x,y,z,null);}
    } else lastPlate='';
    if(now>=frontierPollAt&&(frontierSlotAt(x,z)>=0||ui==='frontierChest'||ui==='villageWork'&&villageTab==='frontier')) {
      frontierPollAt=now+6000; fetchFrontier();
    }
    frontierRotors.forEach(function(obj,k){if(frontierWheels.get(k)?.wet)obj.rotation.z+=dt*2.5;});
  }

  var frontierEnabled=false, frontierPlots={}, frontierFetchBusy=false, frontierStock=null, frontierStockBusy=false, frontierPollAt=0, frontierPendingStock=null;
  function frontierBounds(slot) { var x=916+(slot%3)*72,z=1252+Math.floor(slot/3)*72;return [x,z,x+47,z+47]; }
  function frontierSlotAt(x,z) {
    var a=x-916,b=z-1252;
    return a>=0&&b>=0&&a<216&&b<216&&a%72<48&&b%72<48?Math.floor(b/72)*3+Math.floor(a/72):-1;
  }
  function frontierEditReason(x,z) {
    var slot=frontierSlotAt(x,z), area=frontierPlots[slot];
    if(slot<0 || !frontierEnabled)return '';
    if(!area?.claimed)return '마을 수첩에서 먼저 개척 땅을 맡아요';
    return area.canEdit?'':'이 개척 땅에서는 구경만 할 수 있어요';
  }
  function syncRejectedFrontier(arr) {
    var cells=arr.filter(function(e){return frontierSlotAt(e[0],e[2])>=0;});
    if(!cells.length)return;
    fetchFrontier(ui==='villageWork'&&villageTab==='frontier');
    client.rpc('get_ark_frontier_cells',{p_cells:cells}).then(function(r){
      if(r.error||!Array.isArray(r.data))return;
      r.data.forEach(function(e) {
        var x=e[0],y=e[1],z=e[2],k=x+','+y+','+z;
        if(k in NET.pm)return;
        if(e[3]===null)queueRevert(x,y,z);
        else applyRemote(null,[e]);
      });
    }).catch(function(){});
  }
  function fetchFrontier(redraw) {
    if(!client||frontierFetchBusy)return Promise.resolve();
    frontierFetchBusy=true;
    return client.rpc('get_ark_frontier',{}, {get:true}).then(function(r){
      if(r.error||!Array.isArray(r.data))return;
      frontierEnabled=true;
      frontierPlots={};
      r.data.forEach(function(row){frontierPlots[row.slot]=row;});
      if(redraw&&ui==='villageWork'&&villageTab==='frontier')renderVillageWork();
    }).catch(function(){}).finally(function(){frontierFetchBusy=false;});
  }
  function changeFrontier(slot,action,user,role) {
    if(!client||!me||frontierStockBusy)return;
    frontierStockBusy=true;
    client.rpc('change_ark_frontier',{p_slot:slot,p_action:action,p_friend:user||null,p_role:role||null}).then(function(r){
      if(r.error||r.data!==true){toast('바꾸지 못했어요. 친구 상태와 개척 땅을 다시 확인해 주세요');return;}
      return fetchFrontier(true);
    }).catch(function(){toast('연결이 끊겼어요. 다시 확인해 주세요');}).finally(function(){frontierStockBusy=false;});
  }
  function renderFrontier(body) {
    villageButton(body,'자유 개척지 길 안내',function(){startFrontierGuide(FRONTIER_ENTRY,'자유 개척지');});
    villageButton(body,'바위굴 입구 길 안내',function(){startFrontierGuide(FRONTIER_CAVE[0],'바위굴 입구');});
    villageText(body,'자유 개척지는 모두 함께 지어요. 남쪽 친구 개척 땅은 주인이 편집과 창고 권한을 정해요.');
    villageText(body,'레버나 밟는 발판에 밧줄과 도르래를 이어 문을 움직여요. 물을 등진 수문을 열면 앞쪽으로 흘러요.');
    villageText(body,'승강대는 위아래로 두 개 놓아요. 사이를 비우고 옆에 밧줄·도르래·돌 추를 이은 뒤 승강대를 눌러 타요.');
    if(!me||!frontierEnabled)return villageText(body,'친구 개척 땅과 공동 창고를 쓰려면 로그인하고 서버에 연결해요.');
    if(!FRIENDS.ready&&!FRIENDS.busy)friendsFetch().then(function(){if(ui==='villageWork'&&villageTab==='frontier'&&FRIENDS.ready)renderVillageWork();});
    for(var i=0;i<9;i++) (function(slot){
      var a=frontierPlots[slot]||{}, box=frontierBounds(slot), row=document.createElement('div'); row.className='vme';
      body.appendChild(row);
      villageText(row,(slot+1)+'번 · '+(a.own?'내 개척 땅':a.canEdit?'친구와 함께 짓는 땅':a.canStock?'창고를 함께 쓰는 땅':a.claimed?'구경 가능':'비어 있음'));
      villageButton(row,'길 안내',function(){startFrontierGuide([(box[0]+box[2])/2,box[1]-2],'개척 땅 '+(slot+1)+'번');});
      if(!a.claimed&&!Object.values(frontierPlots).some(function(it){return it.own;})) {
        if(NOAH.done||isAdm()) villageButton(row,'땅 맡기',function(){ if(NOAH.done&&!isAdm()) client.rpc('finish_ark_noah').then(function(){changeFrontier(slot,'claim');},function(){changeFrontier(slot,'claim');}); else changeFrontier(slot,'claim'); });
        else if(slot===0) { villageText(row,'🕊 방주 앞 노아의 부탁 다섯 가지를 마치면 맡을 수 있어요 (창 9:1)'); villageButton(row,'노아에게 가기',function(){travel('ark');}); }
      }
      if(!a.own)return;
      FRIENDS.rows.filter(function(f){return f.status==='accepted';}).forEach(function(f){
        var line=document.createElement('div');line.className='vme';body.appendChild(line);
        villageText(line,f.nick);
        villageButton(line,'편집·창고 허용',function(){changeFrontier(slot,'grant',f.id,'build');});
        villageButton(line,'창고만 허용',function(){changeFrontier(slot,'grant',f.id,'stock');});
        villageButton(line,'허용 취소',function(){changeFrontier(slot,'revoke',f.id);});
      });
      villageText(body,'이 땅에 놓은 궤는 허용된 친구들과 재료를 같이 넣고 꺼낼 수 있어요.');
    })(i);
  }
  function openFrontierStock(h) {
    var slot=frontierSlotAt(h.x,h.z);
    if(!client||!me||!frontierPlots[slot]?.canStock)return deny('허용된 친구만 함께 쓰는 궤예요');
    frontierStock={slot:slot,x:h.x,y:h.y,z:h.z};
    openPanel('frontierChest'); renderFrontierStock(); if(frontierPendingStock)sendFrontierStock();
  }
  function renderFrontierStock() {
    var box=frontierStock;
    client.rpc('ark_frontier_stock',{p_slot:box.slot,p_item:0,p_delta:0}).then(function(r){
      if(r.error||r.data?.error||ui!=='frontierChest'||box!==frontierStock)return;
      var contents=r.data.items||{}, stored=$('frontierStored'), bag=$('frontierBag');
      stored.replaceChildren();bag.replaceChildren();
      function add(select,id,n){var option=document.createElement('option');option.value=id;option.textContent=nameOf(+id)+' · '+n+'개';select.appendChild(option);}
      Object.keys(contents).forEach(function(id){if(B[id])add(stored,id,contents[id]);});
      INV.forEach(function(id){if(frontierStockItem(id)&&have(id)>0 && !isAdm())add(bag,id,have(id));});
    }).catch(function(){});
  }
  function frontierStockItem(id) { return !!B[id]&&!isItem(id)&&id!==WATER&&baseOf(id)===id; }
  function changeFrontierStock(deposit) {
    var box=frontierStock;
    if(!box||frontierStockBusy||!client||isAdm())return;
    if(readBlock(box.x,box.y,box.z)!==CHEST)return toast('궤 자리가 바뀌었어요');
    var id=+$(deposit?'frontierBag':'frontierStored').value;
    if(frontierPendingStock)return sendFrontierStock();
    if(!id||!frontierStockItem(id)||deposit&&have(id)<1)return;
    if(!deposit&&room(id)<1)return toast('가방에 빈 자리가 없어요');
    if(!window.crypto?.randomUUID)return toast('보안 연결에서 공동 창고를 열어 주세요');
    frontierPendingStock={p_slot:box.slot,p_item:id,p_delta:deposit?1:-1,p_op:crypto.randomUUID()};
    if(deposit){take(id,1);bagChanged();}
    sendFrontierStock();
  }
  function sendFrontierStock() {
    if(!frontierPendingStock||frontierStockBusy)return;
    var args=frontierPendingStock;
    frontierStockBusy=true;
    client.rpc('ark_frontier_stock',args).then(function(r){
      if(r.error)throw r.error;
      frontierPendingStock=null;
      if(r.data?.ok) {if(args.p_delta<0)settleFrontierItem(args.p_item);}
      else {
        if(args.p_delta>0)settleFrontierItem(args.p_item);
        toast('아직 옮기지 못했어요');
      }
      if(ui==='frontierChest')renderFrontierStock();
    }).catch(function(){
      toast('연결 확인 중이에요. 조금 뒤에 창고를 다시 열어 주세요');
    }).finally(function(){frontierStockBusy=false;});
  }
  function settleFrontierItem(id) {
    if(give(id,1)!==1)dropItem(P.x,P.y+.4,P.z,id,1);
    bagChanged();
  }

  // ── 이번 주 함께 짓기 목표: 진행도는 서버가 함께 쓰는 세계 기록으로 셈(sql-migrations/2026-11-19-ark-village-goal.sql) ──
  var GOALS = [
    ['🧱', '함께 짓는 터에 블록 300개 놓기', '또 그들에게 하나님의 선한 손이 나를 도우신 일과 왕이 내게 이른 말씀을 전하였더니 그들의 말이 일어나 건축하자 하고 모두 힘을 내어 이 선한 일을 하려 하매', '느헤미야 2:18', '느 2:18'],
    ['🕯', '함께 짓는 터에 등불·횃불 20개 밝히기', '너희는 세상의 빛이라 산 위에 있는 동네가 숨겨지지 못할 것이요', '마태복음 5:14', '마 5:14'],
    ['🤝', '들판 어디서든 함께 블록 1000개 놓기', '두 사람이 한 사람보다 나음은 그들이 수고함으로 좋은 상을 얻을 것임이라', '전도서 4:9', '전 4:9']
  ];
  var GOAL = null, goalAt = 0, goalBusy = false, goalDeco = null;
  function goalSeen() { try { return JSON.parse(localStorage.getItem('arkVillage.goal') || '{}') || {}; } catch (e) { return {}; } }
  function fetchGoal(force) {
    if (!client || !me || !NET.ok || goalBusy || (!force && performance.now() < goalAt)) return;
    goalBusy = true; goalAt = performance.now() + 60000;
    client.rpc('get_ark_village_goal').then(function (r) {
      goalBusy = false; var g = r && r.data; if (!g || r.error || !GOALS[g.k]) return;
      GOAL = g; renderGoal();
      var seen = goalSeen(), key = g.week + ':' + g.k, pct = g.n / g.t, st = seen.key === key ? seen.st || 0 : 0, G2 = GOALS[g.k];
      if (pct >= 1 && st < 2 && started) {
        showVerseCard('🎉', '이번 주 마을 목표를 함께 채웠어요!', G2[2], G2[3], G2[1] + ' — ' + g.ppl + '명이 함께 지었어요' + (g.mine ? '' : ' (다음 목표엔 나도 함께해요)'));
        st = 2;
      } else if (pct >= 0.5 && pct < 1 && st < 1 && started) { toast('🤝 이번 주 마을 목표 절반! ' + G2[1] + ' ' + g.n + '/' + g.t); st = 1; }
      if (pct >= 1 && g.mine) unlock('together');
      try { localStorage.setItem('arkVillage.goal', JSON.stringify({ key: key, st: st })); } catch (e) {}
      goalDecorate(pct >= 1);
    }, function () { goalBusy = false; });
  }
  function renderGoal() {
    var el = $('goalCard'); if (!el) return;
    if (!GOAL) { el.textContent = me ? '🤝 이번 주 마을 목표를 불러오는 중…' : '🤝 로그인하면 이번 주 마을 목표에 함께할 수 있어요'; return; }
    var G2 = GOALS[GOAL.k], pct = Math.min(1, GOAL.n / GOAL.t);
    el.innerHTML = '';
    var h = document.createElement('b'); h.textContent = G2[0] + ' 이번 주 마을 목표 (' + G2[4] + ')'; el.appendChild(h);
    var d = document.createElement('div'); d.textContent = G2[1]; el.appendChild(d);
    var bar = document.createElement('div'); bar.className = 'goalBar'; var fill = document.createElement('i'); fill.style.width = Math.round(pct * 100) + '%'; bar.appendChild(fill); el.appendChild(bar);
    var t = document.createElement('div'); t.className = 'goalTxt'; t.textContent = Math.min(GOAL.n, GOAL.t) + ' / ' + GOAL.t + ' · ' + GOAL.ppl + '명이 함께' + (pct >= 1 ? ' · 🎉 다 채웠어요!' : (GOAL.mine ? ' · 나도 함께하는 중' : '')); el.appendChild(t);
  }
  // 다 채우면 함께 짓는 터 네 귀퉁이에 깃발, 가운데에 알림판(그 주 동안)
  function goalDecorate(on) {
    if (!scene) return;
    if (!on) { if (goalDeco) { scene.remove(goalDeco); goalDeco = null; } return; }
    if (goalDeco) return;
    goalDeco = new THREE.Group();
    var cols = [0xd84040, 0xe8c840, 0x3a8ad8, 0x40b060];
    [[COMMONS[0] - 1, COMMONS[1] - 1], [COMMONS[2] + 1, COMMONS[1] - 1], [COMMONS[0] - 1, COMMONS[3] + 1], [COMMONS[2] + 1, COMMONS[3] + 1]].forEach(function (c, i) {
      var pole = new THREE.Mesh(new THREE.BoxGeometry(0.2, 7, 0.2), new THREE.MeshBasicMaterial({ color: 0x6b4425 })); pole.position.set(c[0] + 0.5, G + 4.5, c[1] + 0.5); goalDeco.add(pole);
      var flag = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.3, 0.08), new THREE.MeshBasicMaterial({ color: cols[i] })); flag.position.set(c[0] + 1.6, G + 7.2, c[1] + 0.5); goalDeco.add(flag);
    });
    var s = signSprite('🎉 이번 주 함께 지었어요!'); s.position.set((COMMONS[0] + COMMONS[2]) / 2 + 0.5, G + 9, (COMMONS[1] + COMMONS[3]) / 2 + 0.5); s.scale.multiplyScalar(2.4); goalDeco.add(s);
    scene.add(goalDeco);
  }
  // 점검 함수: 내 컴퓨터(시험 서버)와 선생님 계정에서만 연다 — 학생이 개발자 창에서 물건을 만들어 내지 못하게
  var ARK_DBG = { cine: { render: function () { renderer.render(scene, camera); }, kit: function () { return { THREE: THREE, scene: scene, B: B, makeAvatar: makeAvatar, dressAvatar: dressAvatar, peerLook: peerLook, handItem: handItem, makeCartMesh: makeCartMesh, textSprite: textSprite, sparkle: sparkle, floatText: floatText, combatFx: combatFx, shadowDeathFx: shadowDeathFx, hpBarDraw: hpBarDraw, LOOKS: LOOKS, HT: HT, G: G, get: readBlock, genTime: function (n) { var t0 = performance.now(), saved = []; for (var i = 0; i < n; i++) { var cx = 10 + i, cz = 10; saved.push(COLS[cz * NC + cx]); genColumn(cx, cz); } var t1 = performance.now(); for (i = 0; i < n; i++) { for (var cy = CYMIN; cy < CY; cy++) buildChunk(10 + i, cy, 10); } var t2 = performance.now(); for (i = 0; i < n; i++) { for (cy = CYMIN; cy < CY; cy++) { var kk = (10 + i) + ',' + cy + ',10'; (chunks[kk] || []).forEach(function (m) { scene.remove(m); m.geometry.dispose(); }); delete chunks[kk]; } COLS[10 * NC + 10 + i] = saved[i]; } return [(t1 - t0) / n, (t2 - t1) / n]; }, far: function (r) { R_MESH = r; R_GEN = r + 1; R_DROP = r + 4; FOG_FAR = r * CS - 12; camera.far = FOG_FAR + 60; camera.updateProjectionMatrix(); return FOG_FAR; }, isSolid: isSolid, kind: kind, SH_KINDS: SH_KINDS, makeShadow: makeShadow, SHADOWS: SHADOWS, disposeSprite: disposeSprite,
      bulk: function (L) {   // 예고편 촬영용: 블록을 한꺼번에 놓고 덩어리마다 한 번만 다시 그림
        var cols = {}, ch = {}, lamps = [];
        L.forEach(function (b) {
          var x = b[0], y = b[1], z = b[2], id = b[3]; if (!colAt(x, z)) { if (x < 0 || z < 0 || x >= WS || z >= WS) return; newColumn(x >> 5, z >> 5); }
          var c0 = colAt(x, z), was = readBlock(x, y, z); setRaw(x, y, z, id); c0.mod = true;
          if (LIGHTS[was] && !LIGHTS[id]) c0.lamps = c0.lamps.filter(function (l) { return l[0] !== x || l[1] !== y || l[2] !== z; });
          if (LIGHTS[id] && !LIGHTS[was]) { c0.lamps.push([x, y, z]); lamps.push([x, y, z]); }
          cols[(x >> 5) + ',' + (z >> 5)] = [x, z];
          for (var d = -1; d <= 1; d++) { ch[((x + d) >> 5) + ',' + (y >> 5) + ',' + (z >> 5)] = 1; ch[(x >> 5) + ',' + ((y + d) >> 5) + ',' + (z >> 5)] = 1; ch[(x >> 5) + ',' + (y >> 5) + ',' + ((z + d) >> 5)] = 1; }
          if (LIGHTS[id] || LIGHTS[was]) for (var lz = (z - 8) >> 5; lz <= (z + 8) >> 5; lz++) for (var lx = (x - 8) >> 5; lx <= (x + 8) >> 5; lx++) for (var ly = (y - 8) >> 5; ly <= (y + 8) >> 5; ly++) ch[lx + ',' + ly + ',' + lz] = 1;
        });
        for (var k in cols) { var cc = cols[k], col = colAt(cc[0], cc[1]); for (var lz2 = 0; lz2 < CS; lz2++) for (var lx2 = 0; lx2 < CS; lx2++) skyScan(col, lx2, lz2); }
        var n = 0; for (var k2 in ch) { var q = k2.split(',').map(Number); if (q[1] < CYMIN || q[1] >= CY || !inWorldC(q[0], q[2]) || !meshedCols[q[2] * NC + q[0]]) continue; buildChunk(q[0], q[1], q[2]); n++; }
        return n;
      } }; }, frame: function (q) { return canvasEl.toDataURL('image/jpeg', q || 0.92); }, avatar: function (v) { if (avatar) avatar.visible = v; heldMesh.visible = false; }, key: function (c, v) { keys[c] = v; }, thunder: function () { thunderStrike(); }, rainbow: function (sec) { rainbowUntil = dayT + (sec || 40); }, rain: function (on, st) { rainOn = on; rain = on ? 1 : 0; storm = !!st; } }, openFeedback: function () { openFeedback(); }, openFeedbackAdmin: function () { openFeedbackAdmin(); }, railScanCost: function (n) { var t = performance.now(); for (var i = 0; i < (n || 20); i++) railScanStep(); return (performance.now() - t) / (n || 20); }, setPlotName: function (u, t) { if (t) PLOT_NAMES[u] = t; else delete PLOT_NAMES[u]; refreshPlotSigns(); }, plotSigns: function () { var o = {}; for (var k in plotSignObjs) o[k] = plotSignObjs[k].txt; return o; }, setPlotUser: function (p, u, nick) { plotUser[p] = u; plotOwners[p] = 1; if (nick) NET.names[u] = nick; }, fakeNet: function (c, id) { client = c; me = { id: id }; }, projectCells: function (k) { return projectCells(k).length; }, perf: function () { return perfAcc; }, home: function () { checkHome(); return homeSafe; }, safeZone: function (x, z) { return safeZone(x, z); }, vib: function () { return VIB; }, news: function () { return [newsLeft(), NEWS_DONE, S.newsSeen]; }, parked: function () { return PARKED.map(function (p) { return [p.x, p.y, p.z, !!(p.mesh && p.mesh.visible)]; }); }, railMap: function () { return RAIL_MAP.size; }, spawnAt: function (x, y, z) { SPAWN = { x: x, y: y, z: z }; }, fps: function (v) { if (v !== undefined) { fpsW.low = v; } return fpsW; }, cart: function () { return cartRide ? JSON.parse(JSON.stringify(cartRide)) : null; }, startCart: function (x, y, z) { startCart(x, y, z); }, leaveCart: function () { leaveCart(); }, railShapeFor: function (x, y, z) { return railShapeFor(x, y, z, 0); }, faith: function (v) { if (v !== undefined) { FAITH = v; renderVitals(); } return FAITH; }, shoot: function (pw) { bowAt = 0; shootArrow(screenDir(), pw); return ARROWS.length; }, lastArrow: function () { var a = ARROWS[ARROWS.length - 1]; return a ? [Math.hypot(a.vx, a.vy, a.vz).toFixed(1), a.dmg] : null; }, bowDraw: function () { return !!bowDraw; }, wear: function (id) { WORN[WEARINFO[id].slot] = id; }, matesNear: function () { return matesNear(); }, arrows: function () { return [ARROWS.length, FIRES.length]; }, fire: function (s) { shootFireArrow(s); return FIRES.length; }, matTest: function () { audioOn(); var o = {}; [[STONE,'돌'],[GOPHER,'고페르'],[LOG,'통나무'],[DIRT,'흙'],[GRASS,'풀'],[SAND,'모래'],[SNOW,'눈'],[LEAF,'잎'],[GLASS,'유리'],[PANE,'유리판'],[BLK_FE,'철 블록'],[WOOL_W,'흰 양털'],[CARPET,'카펫'],[BRICK,'벽돌'],[SLAB_L,'반블록'],[STAIR_P,'계단'],[CRAFT,'제작대'],[CHEST,'궤'],[FLOWER,'꽃']].forEach(function (q) { o[q[1]] = matSound(q[0]); }); var ok = 0; ['stone','wood','dirt','sand','plant','wool','glass','metal'].forEach(function (m) { ['dig','break','place'].forEach(function (a) { if (matSfx(a, m)) ok++; }); }); o.played = ok; o.nodes = JSON.stringify(window.__n); return o; }, thunder: function () { storm = true; rainOn = true; rain = 1; thunderStrike(); return flashK; }, flash: function () { return flashK; }, photo: function () { savePhoto(); }, chestTest: function () { curChest = 'test'; CHESTS.test = CHESTS.test || {}; openPanel('chest'); renderChest(); }, dexSet: function (k) { DEX[k] = 1; saveDex(); }, noah: function () { return NOAH; }, goal: function (force) { if (force) fetchGoal(true); return GOAL; }, goalDeco: function () { return !!goalDeco; }, amb: function () { return amb ? { reg: ambReg, cave: inCave, wind: +amb.wind.gain.value.toFixed(3), leaves: +amb.leaves.gain.value.toFixed(3), surf: +amb.surf.gain.value.toFixed(3), water: +amb.water.gain.value.toFixed(3) } : null; }, stepKind: stepKind, sdrops: function () { return Object.keys(SDROPS).map(function (k) { var d = SDROPS[k]; return { id: d.id, x: d.x, y: d.y, z: d.z, item: d.item, n: d.n }; }); }, netDrop: function () { NET.testMute = true; }, netBack: function () { NET.testMute = false; try { client.realtime.conn.close(); } catch (e) {} }, netOn: function () { return NET.on; }, rinfo: function () { var i = renderer.info; return { geo: i.memory.geometries, tex: i.memory.textures, calls: i.render.calls, kids: scene.children.length, chunks: Object.keys(chunks).length }; }, reach: function (x, y, z, ch) { var x0 = (ch[0]) * CS, y0 = ch[1] * CS, z0 = ch[2] * CS, ls = lampsNear(x0 - 8, y0 - 8, z0 - 8, x0 + CS + 8, y0 + CS + 8, z0 + CS + 8); lampReach(ls, x0, y0, z0); return { ls: ls, m: LMASK[((y - y0 + 8) * LR + (z - z0 + 8)) * LR + (x - x0 + 8)] }; }, vtx: function (x0, y0, z0, x1, y1, z1) { var out = []; for (var k in chunks) (chunks[k] || []).forEach(function (m) { var g = m.geometry, p = g.attributes.position.array, c = g.attributes.color && g.attributes.color.array; if (!c) return; for (var i = 0; i < p.length; i += 3) if (p[i] >= x0 && p[i] <= x1 && p[i + 1] >= y0 && p[i + 1] <= y1 && p[i + 2] >= z0 && p[i + 2] <= z1) out.push([p[i], p[i + 1], p[i + 2], +c[i].toFixed(2), +c[i + 1].toFixed(2)]); }); return out; }, vb: function () { return villageBook; }, bpCells: function () { return blueprintCells(villageBook.plan); }, pickC: function () { var d = screenDir(), h = pickDir(d), c = pickCreature(d, blockCover(h)); return { h: h && [h.x, h.y, h.z, get(h.x, h.y, h.z), +h.t.toFixed(2)], c: c && c.kind, cn: c && c.npc && c.npc.d.name, cam: [camera.position.x, camera.position.y, camera.position.z].map(function (v) { return +v.toFixed(1); }), ui: ui }; }, PARTY: function () { return PARTY; }, partyApply: partyApply, openParty: openParty, partyAdd: partyAdd, TITLES: TITLES, inDungeon: inDungeon, beast: function (k, x, z, baby, mom) { var a = makeBeast(k, x, z); if (baby) { a.baby = true; a.growAt = Date.now() + 300000; a.mesh.scale.setScalar(0.55); a.mom = mom || null; } animals.push(a); return a; }, healOf: function (id) { return [FOODS[id], healOf(id)]; }, myPlot: function (i) { if (i !== undefined) myPlot = i; return myPlot; }, die: function (w) { hurt(99, w || '시험'); }, tempt: function () { fallTemptation('「교만」'); }, useBed: function (x, y, z) { useBed(x, y, z); }, quests: function (t) { openQuests(t); }, fw: function () { fireworkUse(); }, lamp: function (c) { lampTap(c); }, lampInfo: function () { return { g: LAMPG, y: lampY(), rec: villageBook.lamp, x: LAMP_X, z: LAMP_Z }; }, onFun: function (m) { onFun(m); }, hs: function () { return HS && { role: HS.role, players: HS.players, found: HS.found }; }, hsStart: function () { hsStart(); }, fakeMe: function () { if (!me) me = { id: 'test-me' }; return me.id; }, fxCount: function () { return FX.length; }, xmas: function () { xmasGift(); return villageBook.xmasDay; }, canMineAt: function (x, y, z) { return canMine(x, y, z); }, fun: function () { return { tre: treasureSpot(), found: treasureFound(), clue: treasureClue(), race: RACE, pts: RACE_PTS, par: racePar(), fish: fishFun && { phase: fishFun.phase, pos: fishFun.pos, zc: fishFun.zc, zw: fishFun.zw, kind: fishFun.kind, region: fishFun.region }, book: villageBook.fishBook, raceRec: villageBook.race }; }, raceStart: function () { raceStart(); }, raceY: function (i) { return raceY(i); }, fishTap: function () { return fishTap(HOTBAR[sel], screenDir()); }, fishBiteNow: function () { if (fishFun) fishFun.tBite = 0; }, terr: function (x, z) { terrain(x, z); return { h: T.h, w: T.wtop, reg: T.reg, town: inTown(x, z), plot: plotAt(x, z), lm: landmarkAt(x, z, 4), play: playAt(x, z, 6) }; }, spawnInfo: function () { return spawnInfo(); }, ui: function () { return ui; }, DROPS: function () { return DROPS; }, dropAt: function (x, y, z, id, n) { dropItem(x, y, z, id, n); return DROPS.length; }, hitAnimal: function (a) { return hitAnimal(a); }, setB: function (x, y, z, id) { setBlock(x, y, z, id); }, homeStoneUse: function () { homeStoneUse(); }, bethel: function () { bethelTick(); return { B: BETHEL, near: bethelNear, go: !$('bethelGo').hidden, take: !$('bethelTake').hidden, txt: $('bethelGo').textContent }; }, bethelGo: function () { bethelGo(); }, breakBlock: function (x, y, z) { act('break', { x: x, y: y, z: z }); }, bethelTake: function () { bethelTake(); }, jumpPress: function () { jumpPress(); }, waterTopAt: function (x, z, y) { return beastWaterTop(x, z, y); }, groundAt: function (x, z, y) { return groundAt(x, z, y); }, jumpUp: function () { jumpHeld = false; }, mount: function (a) { a.saddled = true; mount(a); }, riding: function () { return riding; }, stepBeast: function (a, dt) { stepBeast(a, dt); }, homeSpot: function () { return homeSpot(); }, swimOut: function () { swimOut(); }, strikeReady: function (a, h) { return strikeReady(a, h); }, give: function (id, n) { give(id, n); bagChanged(); }, have: function (id) { return have(id); }, P: function () { return P; }, spawnSet: function (s) { SPAWN = s; }, respawn: function () { respawn(); }, vb: function () { return villageBook; }, DEX: function () { return DEX; }, hitAnimal: function (a, q, d) { return hitAnimal(a, q, d); }, noteDirt: function (x, y, z) { noteDirt(x, y, z); }, dirts: function () { return DIRTS; }, stepDirts: function () { stepDirts(); }, canPlaceAt: function (x, y, z, id) { return canPlace(x, y, z, id); }, canCook: function (o) { var rc = RECIPES.filter(function (r) { return r.cook && r.out[0] === o; })[0]; return rc ? { can: canCraft(rc), st: workshopNeeds(), fuel: fuelLeft(rc) } : null; }, vit: function () { return { HP: HP, FOOD: FOOD }; }, setVit: function (h, f) { HP = h; FOOD = f; }, eat: function (id) { eatItem(id); }, roofOver: function (x, y, z) { return roofOver(x, y, z); }, shadowWhy: function (x, z) { var gy = groundAt(x, z, SY - 3); return { tut: tutorialStep, town: inTown(Math.floor(P.x), Math.floor(P.z)), safe: safeZone(Math.floor(x), Math.floor(z)), gy: gy, lit: gy === null ? null : litNear(Math.floor(x), gy, Math.floor(z), 7), b2: gy === null ? null : isSolid(get(Math.floor(x), gy - 2, Math.floor(z))), b3: gy === null ? null : isSolid(get(Math.floor(x), gy - 3, Math.floor(z))), py: P.y, roof: gy === null ? null : roofOver(Math.floor(x), gy, Math.floor(z)) }; }, shadowDbg: function () { return { t: shadowT, on: shadowsOn(), ui: ui, safe: safeZone(Math.floor(P.x), Math.floor(P.z)), riding: !!riding }; }, STORY: function () { return STORY; }, startStory: startStory, storyTick: function () { storyT = 0; storyTick(0.01); }, DUN: DUN, CITY: CITY, DUN_LAMPS: DUN_LAMPS, socketPos: socketPos, useLampstand: useLampstand, useSocket: useSocket, openStory: openStory, partOf: partOf,
    araratMax: function () { var m = 0, mx = 0, mz = 0; for (var x = ARX - 220; x < ARX + 220; x += 3) for (var z = ARZ - 220; z < ARZ + 220; z += 3) { if (x < 0 || z < 0) continue; terrain(x, z); if (T.reg === 'ararat' && T.h > m) { m = T.h; mx = x; mz = z; } } return [m, mx, mz]; },
    gemCount: function () { var c = {}; for (var k = 0; k < COLS.length; k++) { var col = COLS[k]; if (!col) continue; for (var i = 0; i < col.d.length; i++) { var v = col.d[i]; if ((v >= 200 && v <= 210)) c[v] = (c[v] || 0) + 1; } } return c; }, regenPlot: function (p) { var o = plotOrigin(p); for (var cz = o.z >> 5; cz <= (o.z + PLOT) >> 5; cz++) for (var cx = o.x >> 5; cx <= (o.x + PLOT) >> 5; cx++) { var k = cz * NC + cx; if (!COLS[k]) continue; var was = meshedCols[k]; genColumn(cx, cz); if (was) { unmeshColumn(cx, cz); meshColumn(cx, cz); } } }, setMyPlot: function (p) { myPlot = p; }, queueRevert: queueRevert, queueRemote: queueRemote, openVisit: openVisit, q: function () { return qStep; }, setQ: function (n) { qStep = n; questCheck(); }, blockIds: function () { var a = [0]; for (var i = 1; i < B.length; i++) if (B[i] && B[i][6] !== 'item' && B[i][6] !== 'tool' && i !== WATER) a.push(i); return a; }, SHADOWS: function () { return SHADOWS; }, FX: function () { return FX; }, ADV: function () { return ADV; }, openQuests: openQuests, questEvent: questEvent, regionTick: regionTick, inLandmark: inLandmark, LMK: { TBX: TBX, TBZ: TBZ, CTX: CTX, CTZ: CTZ, TCX: TCX, TCZ: TCZ, LOTX: LOTX, LOTZ: LOTZ, TWY: TWY, SAX: SAX, SAZ: SAZ, CEX: CEX, CEZ: CEZ }, region: region, getB: function (x, y, z) { return get(x, y, z); }, oreBase: oreBase, P2: function () { return P; }, spawnShadow: function (k, x, z) { var s = makeShadow(k, x, z); SHADOWS.push(s); return s; }, playTap: function (x, y, z) { return tryPlaySpot({ x: x, y: y, z: z }); }, angerBurst: function (s) { angerBurst(s); }, playY: playY, PEN: function () { return PEN; }, hitShadow: hitShadow, armorGuard: armorGuard, V: function () { return { HP: HP, FOOD: FOOD, AIRV: AIRV, SPAWN: SPAWN }; }, setV: function (h, f) { HP = h; FOOD = f; renderVitals(); }, hurt: hurt, CROPS: function () { return CROPS; }, ACH: function () { return ACH; }, NPCS: function () { return NPCS; }, stateGather: stateGather, stateApply: stateApply, useLever: useLever, useBed: useBed, feedAnimal: feedAnimal, inCommons: inCommons, COMMONS: COMMONS, SIGNS: function () { return SIGNS; }, setSignText: setSignText, refreshSigns: refreshSigns, isNight: isNight, setDayT: function (v) { dayT = v; }, WORN: function () { return WORN; }, LOOK: function (i) { if (i !== undefined) { LOOK = i; saveWorn(); } return LOOK; }, wearItem: wearItem, unwear: unwear, harvestAnimal: harvestAnimal, openLooks: openLooks, tableOK: tableOK, NET: NET, applyRemote: applyRemote, onPos: onPos, addChat: addChat, removeChat: removeChat, netEdit: netEdit, netTick: netTick, peerBubble: peerBubble, openChat: openChat, setMe: function (u, nick) { me = { id: u }; NET.nick = nick; NET.ok = true; NET.ready = true; }, riding: function () { return riding; }, tapRideable: tapRideable, dismount: dismount, makeBeast: function (k, x, z) { var a = makeBeast(k, x, z); animals.push(a); return a; }, collectAll: collectAll, DROPS: function () { return DROPS; }, FALLS: function () { return FALLS; }, SAPS: function () { return SAPS; }, growTree: growTree, CHESTS: function () { return CHESTS; }, openChest: openChest, skyLight: skyLight, startFall: startFall, setBlock: setBlock, atlasURL: function () { return atlas.toDataURL(); }, JOBS: function () { return JOBS; }, smeltTick: smeltTick, SMELT: function (v) { SMELT_SEC = v; }, WEAR: function () { return WEAR; }, mineInfo: mineInfo, HEAT: function () { return HEAT; }, fuelLeft: fuelLeft, canPlace: canPlace, wearTool: function (t) { wearTool(t); bagChanged(); }, P: P, teleport: teleport, start: function () { startGame(); }, S: S, act: act, pickCenter: pickCenter, setUI: showUI, openPanel: openPanel,
    caves: function () { return { cap: capLevels(), capX: CAPX, capZ: CAPZ, adu: aduF(), aduX: ADUX, aduZ: ADUZ, oba: [obaF(0), obaF(1)], obaC: OBA_CAVES, obaX: OBAX, obaZ: OBAZ }; },
    fishAt: function (x, z) { return fishWaterRegion(x, z); }, fishKinds: function () { return FISH_KINDS; }, oreCount: function (id) { var c = {}; for (var k = 0; k < COLS.length; k++) { var col = COLS[k]; if (!col) continue; for (var i = 0; i < col.d.length; i++) if (col.d[i] === id) { var y = Math.floor(i / (CS * CS)) + YMIN; c[y] = (c[y] || 0) + 1; } } return c; },
    BAG: function () { return BAG; }, tapAt: function (x, y) { tapAt(x, y); }, enc: function () { return encodePlot(myPlot); }, dec: function (d) { plotData[0] = null; decodePlot(0, d, true); return !!plotData[0]; }, fakeLogin: function () { client = null; me = { id: 'test' }; myPlot = 0; }, setHot: function (i, id) { HOTBAR[i] = id; setSel(i, true); }, SHAPE: function () { return SHAPE; }, INV: function () { return INV; }, blockName: function (id) { return B[id] && B[id][0]; }, iconOf: function (id) { return ICON[id] || null; }, sprIcon: function (id) { return SPR_ICON[id] !== undefined; }, kindOf: function (id) { return kind(id); }, tiles: function () { return tileCount; }, tutEv: function (e) { tutorialEvent(e); }, plotOrigin: plotOrigin, collides: collides, animals: function () { return animals; }, setDay: function (p) { dayT = DAY_LEN * p; }, rain: function (on) { rainOn = on; rain = on ? 1 : 0; rainTimer = 999; }, dex: function () { return DEX; }, q: function () { return qStep; }, camera: function () { return camera; }, counts: function () { return [animals.length, birds.length, fishes.length]; }, give: function (id, n) { give(id, n); bagChanged(); }, travel: travel, mineAt: function (dt) { mineTick(pickCenter(), dt); }, terrain: function (x, z) { terrain(x, z); return { h: T.h, top: T.top, wtop: T.wtop, reg: T.reg }; }, get: get, cols: function () { var n = 0; for (var i = 0; i < COLS.length; i++) if (COLS[i]) n++; return n; }, meshed: function () { var n = 0; for (var i = 0; i < meshedCols.length; i++) if (meshedCols[i]) n++; return n; }, mapRow: function () { return mapRow; }, setTab: function (t) { invTab = t; renderInv(); }, icon: function (id) { return ICON[id]; },
    far: function () { return { SHOPS: SHOPS, FAR_NPCS: FAR_NPCS, openShop: openShop, openTrade: openTrade, regionKeyAt: regionKeyAt, MAP_LABELS: MAP_LABELS, farTick: farTick, nameOf: nameOf, FAR_CITIES: FAR_CITIES, region: region, ADVS: ADVS }; } };   // 11/24 먼 나라 시험용
  if (/^(127\.0\.0\.1|localhost)$/.test(location.hostname)) window.__arkDebug = ARK_DBG;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
