  // ───────── 사람(네모난 몸, 3인칭에서 보임) ─────────
  var HW = 0.42, HT = 3.4, EYE = 3.1, REACH = 6;   // 손이 닿는 거리: 눈에서 6.5칸(사람 키의 두 배쯤, 전도사님 「너무 멀리서도 캐져」 11/18)   // 몸 너비 0.84칸: 한 칸짜리 문을 지나갈 수 있게
  var avatarMat;
  function boxGeo(w, h, d, hex) {
    var g = new THREE.BoxGeometry(w, h, d), n = g.attributes.position.count, col = new Float32Array(n * 3);
    var sh = [0.8, 0.72, 1, 0.55, 0.76, 0.92], c = new THREE.Color(hex);
    for (var f = 0; f < 6; f++) for (var k = 0; k < 4; k++) { var o = (f * 4 + k) * 3; col[o] = c.r * sh[f]; col[o + 1] = c.g * sh[f]; col[o + 2] = c.b * sh[f]; }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return g;
  }
  function shadedBox(w, h, d, hex) { return new THREE.Mesh(boxGeo(w, h, d, hex), avatarMat); }
  // 여러 상자를 한 덩어리로(그리기 횟수 줄이기) — 상자: [너비, 높이, 깊이, 색, x, y, z]
  function mergedBoxes(list) {
    var pos = [], col = [], ind = [], off = 0;
    list.forEach(function (b) {
      var g = boxGeo(b[0], b[1], b[2], b[3]); g.translate(b[4], b[5], b[6]);
      var p = g.attributes.position.array, c = g.attributes.color.array, ix = g.index.array, i;
      for (i = 0; i < p.length; i++) { pos.push(p[i]); col.push(c[i]); }
      for (i = 0; i < ix.length; i++) ind.push(off + ix[i]);
      off += p.length / 3; g.dispose();
    });
    var m = new THREE.BufferGeometry();
    m.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    m.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    m.setIndex(ind); m.computeBoundingSphere();
    return m;
  }
  function makeAvatar(c) {
    var u = HT / 32, root = new THREE.Group(), parts = {};
    function add(parent, w, h, d, hex, x, y, z) { var m = shadedBox(w * u, h * u, d * u, hex); m.position.set(x * u, y * u, z * u); parent.add(m); return m; }
    function pivot(x, y, z) { var g = new THREE.Group(); g.position.set(x * u, y * u, z * u); root.add(g); return g; }
    parts.legL = pivot(-2, 12, 0); parts.legR = pivot(2, 12, 0);
    [parts.legL, parts.legR].forEach(function (L) { add(L, 4, 10.5, 4, c.robe2, 0, -5.25, 0); add(L, 4.3, 1.5, 4.6, c.sandal, 0, -11.25, -0.15); });
    add(root, 8, 12, 4, c.robe, 0, 18, 0);
    add(root, 8.4, 1.6, 4.4, c.belt, 0, 14.5, 0);
    add(root, 1.6, 12, 0.4, c.trim, 0, 18, -2.1);
    parts.armL = pivot(-6, 22, 0); parts.armR = pivot(6, 22, 0);
    [parts.armL, parts.armR].forEach(function (A) { add(A, 4, 6, 4, c.robe, 0, -1, 0); add(A, 3.8, 6, 3.8, c.skin, 0, -7, 0); });
    parts.head = pivot(0, 24, 0);
    add(parts.head, 8, 8, 8, c.skin, 0, 4, 0);
    var st = c.style || 'short';
    if (st === 'scarf') {   // 머릿수건
      add(parts.head, 8.8, 2.8, 8.8, c.scarf, 0, 7.3, 0);
      add(parts.head, 8.8, 9, 1.6, c.scarf, 0, 3.2, 3.8);
      add(parts.head, 1.2, 6, 8.2, c.scarf, -4.3, 3.6, 0.3); add(parts.head, 1.2, 6, 8.2, c.scarf, 4.3, 3.6, 0.3);
      add(parts.head, 8.6, 0.8, 0.6, c.hair, 0, 5.9, -4.1);
    } else {
      add(parts.head, 8.5, st === 'curly' ? 3.2 : 2.4, 8.5, c.hair, 0, st === 'curly' ? 7.4 : 7.3, 0);
      if (st === 'long') {   // 긴 머리: 어깨까지
        add(parts.head, 8.5, 11, 1.4, c.hair, 0, 1.6, 3.6);
        add(parts.head, 1.1, 8, 7.4, c.hair, -4.3, 3.2, 0.4); add(parts.head, 1.1, 8, 7.4, c.hair, 4.3, 3.2, 0.4);
      } else add(parts.head, 8.5, 5, 1.4, c.hair, 0, 4.6, 3.6);
      if (st === 'curly') { add(parts.head, 1.2, 3, 6, c.hair, -4.4, 5.4, 0.8); add(parts.head, 1.2, 3, 6, c.hair, 4.4, 5.4, 0.8); }
    }
    add(parts.head, 1.3, 1.3, 0.3, 0x2b1d14, -1.8, 4, -4.05);
    add(parts.head, 1.3, 1.3, 0.3, 0x2b1d14, 1.8, 4, -4.05);
    add(parts.head, 2.2, 0.5, 0.3, 0xb5806a, 0, 1.9, -4.05);
    // 캐릭터마다 디자인된 옷차림(만든 옷을 입으면 그 자리 장식은 가려짐: torso·belt·head)
    parts.deco = [];
    function deco(tag, parent, w, h, d, hex, x, y, z, rz) { var m = add(parent, w, h, d, hex, x, y, z); if (rz) m.rotation.z = rz; parts.deco.push({ m: m, tag: tag }); return m; }
    var f = c.fit || {};
    if (f.stripes) {   // 세로 줄무늬 겉옷
      [-2.4, 2.4].forEach(function (sx) { deco('torso', root, 1.3, 12, 4.3, f.stripes, sx, 18, 0); });
      [parts.legL, parts.legR].forEach(function (L) { deco('torso', L, 1.2, 9, 4.3, f.stripes, 0, -4.6, 0); });
    }
    if (f.agal) { deco('head', parts.head, 9, 0.9, 9, f.agal, 0, 7.2, 0); }
    if (f.beard) { deco('face', parts.head, 7, 3.6, 1, f.beard, 0, 1.4, -4.3); deco('face', parts.head, 1.2, 3, 6, f.beard, -3.9, 2.6, -1); deco('face', parts.head, 1.2, 3, 6, f.beard, 3.9, 2.6, -1); }   // 머릿수건을 누르는 띠
    if (f.staff) { var stf = deco('back', root, 0.9, 30, 0.9, f.staff, 1.5, 17, 2.7, 0.32); deco('back', root, 0.9, 3.4, 0.9, f.staff, -3.3, 31.2, 2.7, -0.9); }
    if (f.short) [parts.legL, parts.legR].forEach(function (L) { deco('legs', L, 4.05, 5.2, 4.05, c.skin, 0, -7.6, 0); });   // 무릎까지 오는 짧은 옷
    if (f.vest) { [-2.75, 2.75].forEach(function (sx) { deco('torso', root, 2.6, 10.5, 4.5, f.vest, sx, 18.6, 0); }); deco('torso', root, 8.5, 2.2, 4.5, f.vest, 0, 22.9, 0); }
    if (f.rope) { deco('belt', root, 8.6, 1.1, 4.6, f.rope, 0, 14.6, 0); deco('belt', root, 0.9, 3.4, 0.6, f.rope, -1.8, 12.6, -2.4); deco('belt', root, 0.9, 2.6, 0.6, f.rope, -0.9, 12.9, -2.4); }
    if (f.headband) { deco('head', parts.head, 8.7, 1.1, 8.7, f.headband, 0, 6.4, 0); if (f.flower) { deco('head', parts.head, 1.6, 1.6, 0.6, f.flower, 2.6, 6.6, -4.4); deco('head', parts.head, 0.6, 0.6, 0.7, 0xffe060, 2.6, 6.6, -4.6); } }
    if (f.apron) {
      deco('torso', root, 6.4, 10, 0.5, f.apron, 0, 15.6, -2.3); deco('torso', root, 3, 2.2, 0.6, 0x5a3418, 1.2, 13.6, -2.6);
      [-2.6, 2.6].forEach(function (sx) { deco('torso', root, 0.8, 4, 0.5, f.apron, sx, 22, -2.3); });
      deco('belt', root, 1.1, 2.6, 0.9, 0x8a8e94, 3.8, 13.4, -1.6); deco('belt', root, 0.9, 3, 0.9, 0x6a4628, 3.8, 11.5, -1.6);   // 허리에 찬 망치
    }
    if (f.shawl) { deco('torso', root, 9, 3.6, 4.9, f.shawl, 0, 22.4, 0); deco('torso', root, 2.4, 6, 0.6, f.shawl, -2.4, 18.6, -2.45); deco('torso', root, 2.4, 6, 0.6, f.shawl, 2.4, 18.6, -2.45); [parts.armL, parts.armR].forEach(function (A) { deco('torso', A, 4.4, 3, 4.4, f.shawl, 0, 0.6, 0); }); }
    if (f.hem) [parts.legL, parts.legR].forEach(function (L) { deco('legs', L, 4.25, 1.1, 4.25, f.hem, 0, -9.6, 0); deco('legs', L, 4.25, 0.5, 4.25, f.hem2 || f.hem, 0, -8.4, 0); });
    if (f.sash) deco('torso', root, 1.2, 15, 0.5, f.sash, 0.2, 18.3, -2.35, 0.55);   // 어깨에 멘 끈
    if (f.bag) deco('torso', root, 3, 3, 1.6, f.bag, -3.6, 13, -1.2);
    if (f.cloak) { deco('back', root, 9.2, 17, 0.9, f.cloak, 0, 15.8, 2.6); deco('back', root, 9.4, 1.6, 5.2, f.cloak, 0, 23.6, 0.2); deco('torso', root, 1.4, 1.4, 0.6, 0xe0c060, -3.2, 23.2, -2.6); }
    if (f.necklace) { deco('torso', root, 5, 0.6, 0.5, f.necklace, 0, 23.1, -2.3); deco('torso', root, 1.2, 1.2, 0.6, f.necklace, 0, 22.3, -2.4); }
    root.userData = parts;
    return root;
  }
  // 기본 모습 6가지
  var LOOKS = [
    // 모두 나그네(히 11:13) — 같은 나그네 옷차림(망토·어깨 가방·끈)에 얼굴·머리·옷 빛깔만 다르다
    { name: '나그네 · 짧은 머리', robe: 0xe2d8c0, robe2: 0xd2c6aa, belt: 0x8a4b14, trim: 0x8a4b14, skin: 0xe5b98f, hair: 0x3a2618, sandal: 0x6b4425, style: 'short',
      fit: { cloak: 0x6a4a30, sash: 0x8a4b14, bag: 0x8a5a32 } },
    { name: '나그네 · 곱슬머리', robe: 0xd8d4c4, robe2: 0xc8c2b0, belt: 0x5a3a1e, trim: 0x5a3a1e, skin: 0xc98f62, hair: 0x1e1410, sandal: 0x5a3a1e, style: 'curly',
      fit: { cloak: 0x4f5a3a, sash: 0x5a3a1e, bag: 0x9a7040 } },
    { name: '나그네 · 머릿수건', robe: 0xe8e4da, robe2: 0xd8d2c4, belt: 0x8a4b14, trim: 0x8a4b14, skin: 0xd9a67a, hair: 0x2b1d14, sandal: 0x6b4425, style: 'scarf', scarf: 0xeee8d8,
      fit: { cloak: 0x7a5a3a, sash: 0x6b4425, bag: 0x8a5a32, agal: 0x2a2018 } },
    { name: '나그네 · 긴 머리', robe: 0xe6dcc6, robe2: 0xd6ccb4, belt: 0x6a3e5a, trim: 0x6a3e5a, skin: 0xe5b98f, hair: 0x6b4425, sandal: 0x6b4425, style: 'long',
      fit: { cloak: 0x7a3e4a, sash: 0x6a3e5a, bag: 0x9a7040 } },
    { name: '나그네 · 검은 긴 머리', robe: 0xdcd8cc, robe2: 0xccc6b6, belt: 0x3f5a7a, trim: 0x3f5a7a, skin: 0xd9a67a, hair: 0x1e1410, sandal: 0x5a3a1e, style: 'long',
      fit: { cloak: 0x3f4f6a, sash: 0x3f5a7a, bag: 0x8a5a32 } },
    { name: '나그네 · 파란 수건', robe: 0xe8e4da, robe2: 0xd8d2c4, belt: 0x8a4b14, trim: 0x8a4b14, skin: 0xc98f62, hair: 0x2b1d14, sandal: 0x6b4425, style: 'scarf', scarf: 0x5a7ab0,
      fit: { cloak: 0x8a6a40, sash: 0x8a4b14, bag: 0x6a4a30 } }
  ];
  // 입은 옷을 몸 위에 겹쳐 그림
  function dressAvatar(av, worn) {
    var pr = av.userData, u = HT / 32;
    (pr.dress || []).forEach(function (m) { if (m.parent) m.parent.remove(m); m.geometry.dispose(); });
    pr.dress = [];
    // 만든 옷을 입은 자리는 기본 옷차림 장식을 가린다
    (pr.deco || []).forEach(function (d) { d.m.visible = !((d.tag === 'torso' && worn && worn.body) || (d.tag === 'belt' && worn && worn.belt) || (d.tag === 'head' && worn && worn.head) || (d.tag === 'legs' && worn && worn.feet && false)); });
    function add(parent, w, h, d, hex, x, y, z) { var m = shadedBox(w * u, h * u, d * u, hex); m.position.set(x * u, y * u, z * u); parent.add(m); pr.dress.push(m); }
    var GOLD = 0xd8aa48;
    SLOTS.forEach(function (slot) {
      var id = worn && worn[slot], wi = id && WEARINFO[id]; if (!wi) return;
      var col = wi.col, sh = wi.shape, G = sh.slice(-1) === 'G'; if (G) sh = sh.slice(0, -1);
      if (G) { col = slot === 'belt' ? 0x6b4425 : slot === 'feet' ? 0x80592f : 0xf5d983; }   // 11/21 전신갑주 색을 가방 아이콘에 맞춤
      if (slot === 'head') {
        if (sh === 'cap') { add(pr.head, 8.9, 2.8, 8.9, col, 0, 7.6, 0); add(pr.head, 10, 0.7, 10, col, 0, 6.2, -0.3); }
        else if (sh === 'helm') {
          add(pr.head, 9.1, 4.6, 9.1, col, 0, 6.6, 0); add(pr.head, 9.1, 4, 1.2, col, 0, 3.6, 3.9);
          add(pr.head, 1, 3, 0.6, col, 0, 4.2, -4.7);
          if (G) { add(pr.head, 9.3, 0.7, 9.3, GOLD, 0, 4.5, 0); add(pr.head, 7, 1, 7, 0xfbe6a6, 0, 9.3, 0); add(pr.head, 1.4, 2.2, 1.4, GOLD, 0, 10.6, 0); add(pr.head, 0.9, 1, 0.9, 0xfff3c4, 0, 12.1, 0); add(pr.head, 1.2, 3.4, 4.6, GOLD, -4.6, 4.6, -1.6); add(pr.head, 1.2, 3.4, 4.6, GOLD, 4.6, 4.6, -1.6); }
        } else if (sh === 'crown') {
          add(pr.head, 9, 1.6, 9, col, 0, 8.6, 0);
          [[-3.8, -3.8], [3.8, -3.8], [-3.8, 3.8], [3.8, 3.8], [0, -3.8]].forEach(function (q) { add(pr.head, 1.4, 1.8, 1.4, col, q[0], 10.2, q[1]); });
          add(pr.head, 0.9, 0.9, 0.4, 0xd03a3a, 0, 8.6, -4.6);
        }
      } else if (slot === 'body') {
        var bodyCol = function (i) { return sh === 'stripe' ? [0xd04a3a, 0xe8c040, 0x3a6ad0, 0x4aa04a, 0x8a4ab0][i % 5] : col; };
        if (sh === 'stripe') for (var i = 0; i < 6; i++) add(av, 8.7, 2.1, 4.7, bodyCol(i), 0, 13.1 + i * 2.05, 0);
        else add(av, 8.8, 12.6, 4.8, col, 0, 18, 0);
        [pr.armL, pr.armR].forEach(function (A) { add(A, 4.6, 6.4, 4.6, bodyCol(2), 0, -1, 0); });
        if (sh === 'mail' || sh === 'plate') {
          [pr.armL, pr.armR].forEach(function (A) { add(A, 5, 1.6, 5, col, 0, 2.3, 0); });
          if (sh === 'mail') for (var r = 0; r < 5; r++) add(av, 8.9, 0.4, 4.9, 0x6a6e74, 0, 13.6 + r * 2.4, 0);
        }
        if (sh === 'plate' && G) [pr.armL, pr.armR].forEach(function (A) { add(A, 5.4, 2.4, 5.4, col, 0, 1.6, 0); add(A, 5.6, 0.6, 5.6, GOLD, 0, 0.4, 0); });   // 어깨 덮개
        if (sh === 'plate') { add(av, 7, 7, 0.7, col, 0, 19.5, -2.7); add(av, 7.4, 0.6, 0.8, GOLD, 0, 23, -2.7); add(av, 7.4, 0.6, 0.8, GOLD, 0, 16, -2.7); add(av, 0.6, 7, 0.8, GOLD, -3.5, 19.5, -2.7); add(av, 0.6, 7, 0.8, GOLD, 3.5, 19.5, -2.7); }
      } else if (slot === 'belt') {
        add(av, 9, 1.8, 5, col, 0, 14.5, 0); add(av, 2, 2.2, 0.6, G ? GOLD : 0xd8c070, 0, 14.5, -2.6);
        if (G) { add(av, 0.8, 1.2, 0.5, GOLD, -3.2, 14.5, -2.6); add(av, 0.8, 1.2, 0.5, GOLD, 3.2, 14.5, -2.6); add(av, 0.9, 0.9, 0.4, 0xfff3c4, 0, 14.5, -2.95); }
      } else if (slot === 'feet') {
        [pr.legL, pr.legR].forEach(function (L) { add(L, 4.6, 4.2, 4.9, col, 0, -9.9, -0.15); if (G) { add(L, 4.8, 0.7, 5.1, GOLD, 0, -7.6, -0.15); add(L, 1.4, 0.8, 0.4, 0xfff3c4, 0, -9, -2.7); } });
      } else if (slot === 'shield') {
        // 11/21 방패를 크게(키의 절반쯤): 팔 바깥에 세운 판 + 둘레 테 + 가운데 징
        var rimC = col === 0xa77a48 ? 0x6a4628 : 0x8a8e94;
        if (G) {   // 믿음의 방패(11/21 GPT 참고): 아래로 좁아지는 밝은 금 방패 + 짙은 금 테, 안쪽은 나무
          add(pr.armL, 1, 11, 10, col, -2.7, -4.5, 0); add(pr.armL, 1, 2.4, 7, col, -2.7, -11.2, 0); add(pr.armL, 1, 1.8, 3.6, col, -2.7, -13.3, 0);
          add(pr.armL, 1.2, 11.4, 0.8, GOLD, -2.7, -4.5, -5.2); add(pr.armL, 1.2, 11.4, 0.8, GOLD, -2.7, -4.5, 5.2); add(pr.armL, 1.2, 0.8, 10.6, GOLD, -2.7, 1.1, 0); add(pr.armL, 1.2, 0.8, 4.4, GOLD, -2.7, -14.3, 0);
          add(pr.armL, 0.5, 1.2, 1.2, 0xfff3c4, -3.3, -1, 3); add(pr.armL, 0.4, 13, 9, 0x80592f, -2.05, -6, 0);
        } else {
        add(pr.armL, 1, 13, 11, col, -2.7, -6, 0);
        add(pr.armL, 1.2, 13.4, 0.8, rimC, -2.7, -6, -5.6); add(pr.armL, 1.2, 13.4, 0.8, rimC, -2.7, -6, 5.6); add(pr.armL, 1.2, 0.8, 11, rimC, -2.7, 0.6, 0); add(pr.armL, 1.2, 0.8, 11, rimC, -2.7, -12.6, 0);
        add(pr.armL, 0.6, 2.4, 2.4, rimC, -3.4, -6, 0);
        }
      }
    });
  }

  // 11/21 1인칭 방패: 방패를 입으면 화면 왼쪽 아래에 뒷면(나무 널판·테·가죽 끈)이 보이게, 앞면은 앞(적 쪽)을 향함
  var fpShield = null, fpShieldMat = null, fpShieldId = -1;
  function buildFpShield(id) {
    while (fpShield.children.length) { var c = fpShield.children.pop(); c.geometry.dispose(); }
    fpShieldId = id; if (!id || !WEARINFO[id]) return;
    var wi = WEARINFO[id], col = wi.col, G = wi.shape.slice(-1) === 'G', rim = G ? 0xd8aa48 : (col === 0xa77a48 ? 0x6a4628 : col);
    function bx(w, h, d, hex, x, y, z) { var m = new THREE.Mesh(boxGeo(w, h, d, hex), fpShieldMat); m.position.set(x, y, z); m.renderOrder = 10; fpShield.add(m); }
    for (var k = 0; k < 4; k++) bx(0.12, 0.66, 0.03, k % 2 ? 0x8a5a32 : 0x9c6a3c, -0.18 + k * 0.12, 0, 0);
    bx(0.56, 0.05, 0.05, rim, 0, 0.35, 0.005); bx(0.56, 0.05, 0.05, rim, 0, -0.35, 0.005); bx(0.05, 0.75, 0.05, rim, -0.265, 0, 0.005); bx(0.05, 0.75, 0.05, rim, 0.265, 0, 0.005);
    bx(0.44, 0.045, 0.03, 0x3a2414, 0, 0.13, 0.03); bx(0.44, 0.045, 0.03, 0x3a2414, 0, -0.13, 0.03);
  }
  function showFpShield(bob, sw) {
    if (!fpShield) return;
    var id = WORN.shield || 0; if (id !== fpShieldId) buildFpShield(id);
    fpShield.visible = !!id && !furnitureRest;
    if (!fpShield.visible) return;
    fpShieldMat.color.copy(avatarMat.color);
    fpShield.position.set(-0.7, -0.7 + bob * 0.3 + sw * 0.02, -1.1); fpShield.scale.setScalar(isTouch ? 0.72 : 0.85);   // 11/21 작게·아래로(방향키·하트와 덜 겹치게)
    fpShield.rotation.set(0.05, 0.32, 0.04);
  }
  // ───────── 플레이어 ─────────
  var P = { x: XM + 0.5, y: G, z: PZ0 - 9, vx: 0, vy: 0, vz: 0, yaw: Math.PI, pitch: -0.12, ground: false, fly: false, camY: 0, walk: 0, stepAcc: 0, sprint: false, swim: false };
  function collides(px, py, pz, barrierOnly) {
    for (var x = Math.floor(px - HW); x <= Math.floor(px + HW); x++)
      for (var y = Math.floor(py); y <= Math.floor(py + curHT - 0.01); y++)
        for (var z = Math.floor(pz - HW); z <= Math.floor(pz + HW); z++)
          {
            var cid = get(x, y, z);
            if (barrierOnly && cid !== RAIL && !(SHAPE[cid] && SHAPE[cid].type === 'gate' && !SHAPE[cid].open)) continue;
            if (!isSolid(cid) || (riding && cid === LEAF)) continue;   // 타고 있을 때는 나뭇잎을 헤치고 지나감
            if (!SHAPE[cid]) return true;
            var bs = collBoxes(cid, x, y, z);
            for (var bi2 = 0; bi2 < bs.length; bi2++) {
              var b = bs[bi2];
              if (px + HW > x + b[0] && px - HW < x + b[3] && py + curHT > y + b[1] && py < y + b[4] && pz + HW > z + b[2] && pz - HW < z + b[5]) return true;
            }
          }
    return false;
  }
  function onLadder() { for (var y = Math.floor(P.y); y <= Math.floor(P.y + 1.6); y++) { var id = get(Math.floor(P.x), y, Math.floor(P.z)); if (SHAPE[id] && SHAPE[id].type === 'ladder') return true; } return false; }
  function inWater() { return get(Math.floor(P.x), Math.floor(P.y + 1), Math.floor(P.z)) === WATER; }
  // 웅크리면 가장자리에서 떨어지지 않음: 새 자리 발밑에 받칠 블록이 하나도 없으면 멈춤
  function supported(px, py, pz) {
    for (var x = Math.floor(px - HW); x <= Math.floor(px + HW); x++) for (var z = Math.floor(pz - HW); z <= Math.floor(pz + HW); z++) { var b = get(x, Math.floor(py - 0.05), z); if (isSolid(b) && !(SHAPE[b] && collBoxes(b, x, Math.floor(py - 0.05), z).length === 0)) return true; }
    return false;
  }
  function moveAxis(axis, d) {
    if (!d) return false;
    var steps = Math.ceil(Math.abs(d) / 0.2), s = d / steps;
    for (var i = 0; i < steps; i++) {
      var nx = P.x + (axis === 0 ? s : 0), ny = P.y + (axis === 1 ? s : 0), nz = P.z + (axis === 2 ? s : 0);
      if (axis !== 1 && P.sneak && P.ground && !supported(nx, P.y, nz)) return true;
      if (collides(nx, ny, nz)) {
        if (axis !== 1 && collides(nx, ny, nz, true)) return true;
        // 1칸까지는 계단처럼 저절로 올라감 — 올라선 자리에 몸이 들어가기만 하면 됨(문 아래·나뭇잎 밑·낮은 굴에서도)
        if (axis !== 1 && (P.ground || P.swim || P.ladder || performance.now() - (P.groundAt || 0) < 150) && !P.fly) {
          var up = !collides(nx, ny + 0.51, nz) ? 0.51 : (!collides(nx, ny + 1.01, nz) ? 1.01 : 0);
          if (up) { P.y += up; P.camY -= up; P.x = nx; P.z = nz; continue; }
          // 휴대폰: 2칸 턱이면 저절로 뛰어오름(자동 점프, 메뉴에서 끌 수 있음)
          if (isTouch && S.autoJump !== false && P.ground && !P.swim && P.vy <= 0 && !riding && !collides(nx, ny + 2.05, nz) && !collides(P.x, P.y + 2.4, P.z)) { P.vy = 15.2; exhaust(0.05); }
        }
        // 11/22 헤엄치다 물가 2칸 턱에 닿으면 뛰어올라 나옴
        if (axis !== 1 && P.swim && !P.fly && !riding && P.vy < 8 && !collides(nx, ny + 2.05, nz) && !collides(P.x, P.y + 2.4, P.z)) { P.vy = 10; P.climbT = performance.now() + 400; }
        // 말·나귀를 타고 있을 때도 2칸 턱은 저절로 뛰어넘음
        if (axis !== 1 && riding && P.ground && P.vy <= 0 && !collides(nx, ny + 2.05, nz)) P.vy = riding.sp.jump;
        return true;
      }
      P.x = nx; P.y = ny; P.z = nz;
    }
    return false;
  }

