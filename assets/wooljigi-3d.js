// 우물지기 3D (wooljigi.html 전용). three-r128.min.js 뒤에 불러온다. 3D를 못 쓰는 기기에서는 그림을 보여 준다.
window.mountWooljigi = function (stage) {
  var renderer;
  try {
    if (!window.THREE) throw new Error("no three");
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (e) {
    var fb = stage.querySelector(".wk-fallback");
    if (fb) fb.hidden = false;
    else stage.innerHTML = '<img src="assets/brand/well-mascot.png" alt="기뻐하는 우물지기" style="display:block;height:100%;margin:0 auto;">';
    var hint = document.querySelector(".wk-hint");
    if (hint) hint.textContent = "이 기기에서는 3D를 볼 수 없어 그림으로 보여 드립니다.";
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  // 느린 기기에서는 실시간 그림자를 끈다.
  var lowEnd = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 3;
  renderer.shadowMap.enabled = !lowEnd;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  stage.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(26, 1, 0.1, 50);
  camera.position.set(0, 3.5, 9.9);
  camera.lookAt(0, 0.66, 0);
  scene.add(new THREE.HemisphereLight(0xdfeaff, 0x7a8a55, 0.72));
  var key = new THREE.DirectionalLight(0xfff2dc, 1.05);
  key.position.set(-1.6, 8.5, 3.6);
  key.castShadow = !lowEnd;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -3.6; key.shadow.camera.right = 3.6; key.shadow.camera.top = 4.4; key.shadow.camera.bottom = -2.6;
  key.shadow.camera.near = 1; key.shadow.camera.far = 18;
  key.shadow.bias = -0.0006; key.shadow.normalBias = 0.02; key.shadow.radius = 4;
  scene.add(key);
  var fill = new THREE.DirectionalLight(0xffd9b0, 0.34);
  fill.position.set(4, 1.5, 3);
  scene.add(fill);
  var rimLight = new THREE.DirectionalLight(0xbcd6ff, 0.5);
  rimLight.position.set(1, 3.5, -5);
  scene.add(rimLight);

  var COL = { cobalt: 0x1f52de, stone: 0x8cb8f4, cream: 0xfdf0d6, water: 0x2ba8ff, wood: 0xd9852c, roof: 0xff7a35,
    navy: 0x0a1450, pink: 0xfaa6ad, white: 0xffffff, pulley: 0xf5da6e, rope: 0xf3e4b0 };

  var levels = new Uint8Array([150, 215, 255]);
  var grad = new THREE.DataTexture(levels, 3, 1, THREE.LuminanceFormat);
  grad.minFilter = grad.magFilter = THREE.NearestFilter;
  grad.needsUpdate = true;

  function linearHex(c) { return new THREE.Color(c).convertSRGBToLinear(); }
  function toon(c) {
    var rough = c === COL.cream ? 0.86 : c === COL.wood ? 0.74 : c === COL.stone ? 0.82 : c === COL.water ? 0.18 : 0.46;
    return new THREE.MeshStandardMaterial({ color: linearHex(c), roughness: rough, metalness: (c === 0xf2c230) ? 0.55 : 0 });
  }

  var OUT = 0.012;
  function hullMat(t) {
    return new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: { t: { value: t }, c: { value: new THREE.Color(COL.navy) } },
      vertexShader: "uniform float t; void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position + normalize(normal) * t, 1.0); }",
      fragmentShader: "uniform vec3 c; void main(){ gl_FragColor = vec4(c, 1.0); }"
    });
  }
  var MAIN_MATS = [], STONE_MATS = [];
  // 색 면과 남색 외곽선을 한 묶음으로 만든다.
  function part(geo, color, t) {
    var g = new THREE.Group();
    var mat = toon(color);
    if (color === COL.cobalt) MAIN_MATS.push(mat);
    if (color === COL.stone) STONE_MATS.push(mat);
    var solid = new THREE.Mesh(geo, mat);
    solid.castShadow = true;
    solid.receiveShadow = true;
    g.add(solid);
    if (t !== 0) g.add(new THREE.Mesh(geo, hullMat(Math.min(t === undefined ? OUT : t, 0.012))));
    return g;
  }
  function roundedBox(w, h, d, r, seg) {
    var geo = new THREE.BoxGeometry(w, h, d, seg, seg, seg);
    var p = geo.attributes.position, n = geo.attributes.normal, v = new THREE.Vector3(), c = new THREE.Vector3();
    var ix = w / 2 - r, iy = h / 2 - r, iz = d / 2 - r;
    for (var i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      c.set(Math.max(-ix, Math.min(ix, v.x)), Math.max(-iy, Math.min(iy, v.y)), Math.max(-iz, Math.min(iz, v.z)));
      v.sub(c);
      if (v.lengthSq() > 0) {
        v.normalize();
        n.setXYZ(i, v.x, v.y, v.z);
        v.multiplyScalar(r).add(c);
        p.setXYZ(i, v.x, v.y, v.z);
      }
    }
    return geo;
  }
  function blob(x, y, z, segs) {
    var geo = new THREE.SphereGeometry(1, segs || 28, segs || 20);
    geo.scale(x, y, z);
    return geo;
  }
  function onBody(obj, theta, y, R) {
    obj.position.set(Math.sin(theta) * R, y, Math.cos(theta) * R);
    obj.rotation.y = theta;
    return obj;
  }
  function deg(d) { return d * Math.PI / 180; }

  var root = new THREE.Group();
  var well = new THREE.Group();
  root.add(well);
  scene.add(root);
  // 진화 단계마다 켜고 끄는 부품 묶음
  var G = {};
  ["drop", "body", "bricks", "bricksHigh", "rim", "spring", "frame", "hang", "roof", "grand", "face", "cross"].forEach(function (k) { G[k] = new THREE.Group(); well.add(G[k]); });

  // 몸통
  var pts = [[0, -0.74], [0.62, -0.74], [0.86, -0.66], [0.99, -0.46], [1.03, -0.14], [1.03, 0.3], [1.0, 0.62], [0, 0.62]]
    .map(function (a) { return new THREE.Vector2(a[0], a[1]); });
  var curve = new THREE.SplineCurve(pts.slice(1, 7));
  var lathe = [pts[0]].concat(curve.getPoints(36), [pts[7]]);
  G.body.add(part(new THREE.LatheGeometry(lathe, 72), COL.cobalt));

  // 몸통 벽돌: 크기가 같은 벽돌 4줄을 한 줄씩 엇갈려 쌓고, 앞면 가운데를 기준으로 좌우를 똑같이 맞춘다.
  var N = 14, STEP = 360 / N;
  var brick = roundedBox(0.42, 0.25, 0.15, 0.07, 6);
  [
    { y: 0.40, R: 1.02, off: 0, clear: 0 },
    { y: 0.11, R: 1.04, off: STEP / 2, clear: 50 },
    { y: -0.18, R: 1.04, off: 0, clear: 50 },
    { y: -0.47, R: 0.99, off: STEP / 2, clear: 0 }
  ].forEach(function (c) {
    for (var k = 0; k < N; k++) {
      var d = (k * STEP + c.off) % 360;
      var fromFront = Math.min(d, 360 - d);
      if (fromFront < c.clear) continue;                    // 얼굴 자리
      if (c.y === 0.11 && Math.abs(fromFront - 90) < 1) continue;  // 양쪽 어깨 자리
      var bk = part(brick, COL.stone, 0.012);
      bk.scale.set(0.97 + ((k * 7) % 5) * 0.012, 0.96 + ((k * 11) % 4) * 0.014, 1);
      bk.rotation.z = (((k * 13) % 5) - 2) * 0.006;
      (c.y > 0 ? G.bricksHigh : G.bricks).add(onBody(bk, deg(d), c.y, c.R));
    }
  });

  // 몸통 바닥 돌
  var floorStone = roundedBox(0.25, 0.06, 0.19, 0.025, 3);
  [[0, 1, -0.76, 0], [0.26, 6, -0.76, 0], [0.53, 11, -0.76, 0], [0.8, 16, -0.69, 0.5]].forEach(function (ring) {
    for (var q = 0; q < ring[1]; q++) {
      var ang = q / ring[1] * Math.PI * 2;
      var fx = Math.sin(ang) * ring[0], fz = Math.cos(ang) * ring[0];
      if (Math.hypot(Math.abs(fx) - 0.44, fz - 0.1) < 0.25) continue;
      var holder = new THREE.Group();
      holder.position.set(fx, ring[2], fz);
      holder.rotation.y = ang;
      var fs = part(floorStone, COL.stone, 0.02);
      fs.rotation.x = -ring[3];
      holder.add(fs);
      G.bricks.add(holder);
    }
  });

  // 우물 입구
  var water = new THREE.Mesh(new THREE.CircleGeometry(1.02, 48), new THREE.MeshBasicMaterial({ toneMapped: false, color: linearHex(0x1e9cf5) }));
  water.rotation.x = -Math.PI / 2;
  water.position.y = 0.66;
  G.rim.add(water);
  var rimStone = roundedBox(0.46, 0.25, 0.3, 0.09, 6);
  for (var r = 0; r < 14; r++) G.rim.add(onBody(part(rimStone, COL.cream, 0.032), deg(r * 360 / 14 + 12.8), 0.68, 1.1));

  var ripples = [0, 1].map(function () {
    var m = new THREE.Mesh(new THREE.RingGeometry(0.96, 1, 48), new THREE.MeshBasicMaterial({ toneMapped: false, color: linearHex(COL.white), transparent: true, side: THREE.DoubleSide }));
    m.rotation.x = -Math.PI / 2;
    m.position.y = 0.675;
    G.rim.add(m);
    return m;
  });

  // 기둥, 가로 막대, 도르래
  var post = roundedBox(0.19, 1.42, 0.19, 0.03, 3);
  [-0.92, 0.92].forEach(function (x) {
    var p = part(post, COL.wood);
    p.position.set(x, 1.38, 0);
    G.frame.add(p);
  });
  var barGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.7, 14);
  barGeo.rotateZ(Math.PI / 2);
  var bar = part(barGeo, COL.wood, 0.03);
  bar.position.set(0, 1.5, 0);
  G.frame.add(bar);
  var pulley = part(new THREE.TorusGeometry(0.11, 0.05, 12, 28), COL.pulley, 0.03);
  pulley.position.set(0, 1.5, 0);
  G.frame.add(pulley);

  // 줄과 두레박
  var ropeGeo = new THREE.CylinderGeometry(0.02, 0.02, 1, 8);
  ropeGeo.translate(0, -0.5, 0);
  var rope = part(ropeGeo, COL.rope, 0.016);
  rope.position.set(0, 1.4, 0);
  G.hang.add(rope);
  var bucket = new THREE.Group();
  var pail = part(new THREE.CylinderGeometry(0.19, 0.14, 0.22, 18), COL.wood, 0.03);
  bucket.add(pail);
  var bandGeo = new THREE.TorusGeometry(0.175, 0.012, 6, 24);
  bandGeo.rotateX(Math.PI / 2);
  var band = new THREE.Mesh(bandGeo, new THREE.MeshBasicMaterial({ toneMapped: false, color: linearHex(COL.navy) }));
  band.position.y = 0.03;
  bucket.add(band);
  var handle = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.016, 8, 20, Math.PI), new THREE.MeshBasicMaterial({ toneMapped: false, color: linearHex(COL.navy) }));
  handle.position.y = 0.1;
  bucket.add(handle);
  G.hang.add(bucket);
  var BUCKET_REST = 0.98, BUCKET_LOW = 0.74;
  function setBucket(y) {
    bucket.position.set(0, y, 0);
    rope.scale.y = 1.4 - (y + 0.27);
  }
  setBucket(BUCKET_REST);

  // 지붕
  var roofGeo = new THREE.CylinderGeometry(0.72, 1.56, 0.62, 4, 1);
  roofGeo.rotateY(Math.PI / 4);
  roofGeo.scale(1, 1, 0.74);
  var roofFlat = roofGeo.toNonIndexed();
  roofFlat.computeVertexNormals();
  var roofMat = toon(COL.roof);
  var roof = new THREE.Group();
  var roofBase = new THREE.Mesh(roofFlat, toon(0x7c3c12));
  roofBase.material.color.setHex(0x5a2a0c);
  roof.add(roofBase);
  // 기와: 네 면에 줄지어 얹는다. 같은 모양을 인스턴스로 그려 가볍게 한다.
  var tileGeo = roundedBox(0.19, 0.2, 0.05, 0.024, 3);
  var ROWS = 5, placed = [];
  [[1, 0], [-1, Math.PI]].forEach(function (f) {
    for (var ro = 0; ro < ROWS; ro++) {
      var tt = (ro + 0.5) / ROWS, half = 0.51 + 0.59 * tt, z = 0.378 + 0.438 * tt, y = 0.31 - 0.62 * tt;
      var cols = Math.round(half * 2 / 0.185);
      for (var co = 0; co < cols; co++) {
        var xx = -half + (co + 0.5) * (half * 2 / cols) + (ro % 2 ? 0.05 : 0);
        if (Math.abs(xx) > half - 0.02) continue;
        placed.push({ x: xx * f[0], y: y + 0.012, z: (z + 0.035) * f[0], ry: f[1], rx: -0.62 });
      }
    }
  });
  [[1, Math.PI / 2], [-1, -Math.PI / 2]].forEach(function (f) {
    for (var ro = 0; ro < ROWS; ro++) {
      var tt = (ro + 0.5) / ROWS, half = 0.36 + 0.44 * tt, x = 0.52 + 0.6 * tt, y = 0.31 - 0.62 * tt;
      var cols = Math.round(half * 2 / 0.185);
      for (var co = 0; co < cols; co++) {
        var zz = -half + (co + 0.5) * (half * 2 / cols) + (ro % 2 ? 0.05 : 0);
        if (Math.abs(zz) > half - 0.02) continue;
        placed.push({ x: (x + 0.035) * f[0], y: y + 0.012, z: zz, ry: f[1], rx: -0.77 });
      }
    }
  });
  var tiles = new THREE.InstancedMesh(tileGeo, roofMat, placed.length);
  tiles.castShadow = true;
  tiles.receiveShadow = true;
  var dummy = new THREE.Object3D();
  placed.forEach(function (q, i) {
    dummy.position.set(q.x, q.y, q.z);
    dummy.rotation.set(0, q.ry, 0);
    dummy.rotateX(q.rx + (q.rx < 0 ? 1 : 0) * 0);
    dummy.scale.setScalar(0.98 + (i % 5) * 0.01);
    dummy.updateMatrix();
    tiles.setMatrixAt(i, dummy.matrix);
  });
  roof.add(tiles);
  var ridgeGeo = roundedBox(1.16, 0.13, 0.86, 0.05, 4);
  var ridge = part(ridgeGeo, 0xd95a1e, 0.03);
  var ridgeMat = ridge.children[0].material;
  ridge.position.y = 0.37;
  roof.add(ridge);
  var soffit = new THREE.Mesh(new THREE.PlaneGeometry(2.16, 1.58), new THREE.MeshBasicMaterial({ toneMapped: false, color: linearHex(0x8f5420) }));
  soffit.rotation.x = Math.PI / 2;
  soffit.position.y = -0.315;
  roof.add(soffit);
  var rafterGeo = roundedBox(0.1, 0.07, 1.54, 0.025, 3);
  for (var rf = -4; rf <= 4; rf++) {
    var rafter = part(rafterGeo, COL.wood, 0.016);
    rafter.position.set(rf * 0.25, -0.35, 0);
    roof.add(rafter);
  }
  var purlinGeo = roundedBox(2.1, 0.07, 0.1, 0.025, 3);
  [-0.42, 0.42].forEach(function (z) {
    var purlin = part(purlinGeo, COL.wood, 0.016);
    purlin.position.set(0, -0.395, z);
    roof.add(purlin);
  });
  roof.position.y = 2.28;
  G.roof.add(roof);

  // 얼굴: 흰자 없이 작은 타원 눈. 기쁠 때는 웃는 눈으로 바뀐다.
  var eyes = [];
  [-1, 1].forEach(function (s) {
    var eye = new THREE.Group();
    onBody(eye, s * deg(17), 0.04, 1.035);
    var p = new THREE.Group();
    p.add(new THREE.Mesh(blob(0.122, 0.16, 0.05), new THREE.MeshStandardMaterial({ color: linearHex(0x081244), roughness: 0.14 })));
    var hi = new THREE.Mesh(blob(0.036, 0.036, 0.01), new THREE.MeshBasicMaterial({ toneMapped: false, color: linearHex(COL.white) }));
    hi.position.set(0.03, 0.058, 0.046);
    p.add(hi);
    eye.add(p);
    var happy = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.027, 10, 24, Math.PI), new THREE.MeshBasicMaterial({ toneMapped: false, color: linearHex(COL.navy) }));
    happy.position.y = -0.04;
    happy.visible = false;
    eye.add(happy);
    G.face.add(eye);
    eyes.push({ g: eye, p: p, happy: happy });
    var ck = new THREE.Mesh(blob(0.115, 0.075, 0.02), new THREE.MeshBasicMaterial({ toneMapped: false, color: linearHex(COL.pink) }));
    onBody(ck, s * deg(33), -0.14, 1.03);
    G.face.add(ck);
  });
  var smileGeo = new THREE.TorusGeometry(0.085, 0.024, 10, 28, Math.PI);
  smileGeo.rotateZ(Math.PI);
  var smile = new THREE.Mesh(smileGeo, new THREE.MeshBasicMaterial({ toneMapped: false, color: linearHex(COL.navy) }));
  smile.position.set(0, -0.1, 1.04);
  G.face.add(smile);
  var openGeo = new THREE.CircleGeometry(0.11, 28, Math.PI, Math.PI);
  var openMouth = new THREE.Mesh(openGeo, new THREE.MeshBasicMaterial({ toneMapped: false, color: linearHex(COL.navy) }));
  openMouth.position.set(0, -0.09, 1.045);
  openMouth.visible = false;
  G.face.add(openMouth);

  // 팔과 다리
  function arm(sign) {
    var pivot = new THREE.Group();
    pivot.position.set(sign * 1.04, 0.12, 0.02);
    var m = part(blob(0.21, 0.37, 0.21), COL.cobalt);
    m.position.y = -0.3;
    pivot.add(m);
    well.add(pivot);
    return pivot;
  }
  var armSize = 1;
  var armL = arm(-1), armR = arm(1);
  // 팔 자세 계산용. 두레박을 안을 때는 어깨를 앞으로 옮기고 팔을 두레박 쪽으로 뻗는다.
  var DOWN = new THREE.Vector3(0, -1, 0), tmpV = new THREE.Vector3(), tmpP = new THREE.Vector3(), tmpQ = new THREE.Quaternion(), tmpE = new THREE.Euler();
  function setArm(pivot, sign, angle, t, dt) {
    var k = Math.min(1, dt * 12);
    tmpQ.setFromEuler(tmpE.set(0, 0, angle));
    tmpP.set(sign * 1.04, 0.12, 0.02);
    if (t > 0.72) {
      tmpV.set(-sign * 0.66, -0.22, 0.72).normalize();
      tmpQ.setFromUnitVectors(DOWN, tmpV);
      tmpP.set(sign * 0.9, -0.3, 0.6);
    }
    pivot.quaternion.slerp(tmpQ, k);
    pivot.position.lerp(tmpP, k);
    var sc = (t > 0.72 ? 0.98 : 1) * armSize;
    pivot.scale.setScalar(lerp(pivot.scale.x, sc, k));
  }
  [-1, 1].forEach(function (s) {
    var leg = part(blob(0.27, 0.26, 0.3), COL.cobalt);
    leg.position.set(s * 0.44, -0.87, 0.1);
    root.add(leg);
  });

  // 0단계: 작은 물방울 몸
  var dropPts = [[0, -0.74], [0.62, -0.74], [0.9, -0.62], [1.03, -0.32], [1.04, -0.05], [0.94, 0.28], [0.72, 0.62], [0.42, 1.02], [0.14, 1.42], [0, 1.6]]
    .map(function (a) { return new THREE.Vector2(a[0], a[1]); });
  G.drop.add(part(new THREE.LatheGeometry(new THREE.SplineCurve(dropPts).getPoints(48), 56), COL.cobalt));
  var shine = new THREE.Mesh(blob(0.07, 0.2, 0.03), new THREE.MeshBasicMaterial({ toneMapped: false, color: linearHex(0xcdec37) }));
  onBody(shine, deg(-34), 0.62, 0.82);
  shine.rotation.z = -0.5;
  G.drop.add(shine);
  // 1단계: 샘. 매끈한 몸에 같은 크기의 돌을 고르게 두르고, 가운데로 물이 솟는다.
  var moundPts = [[0, -0.74], [0.62, -0.74], [0.92, -0.62], [1.05, -0.34], [1.03, -0.06], [0.94, 0.14], [0, 0.14]]
    .map(function (a) { return new THREE.Vector2(a[0], a[1]); });
  G.spring.add(part(new THREE.LatheGeometry(moundPts, 56), COL.cobalt));
  var springWater = new THREE.Mesh(new THREE.CircleGeometry(0.86, 40), new THREE.MeshBasicMaterial({ toneMapped: false, color: linearHex(COL.water) }));
  springWater.rotation.x = -Math.PI / 2;
  springWater.position.y = 0.18;
  G.spring.add(springWater);
  var springStone = roundedBox(0.4, 0.17, 0.24, 0.07, 5);
  for (var ss = 0; ss < 12; ss++) G.spring.add(onBody(part(springStone, COL.cream, 0.026), deg(ss * 30 + 15), 0.2, 0.96));
  var springDrops = [[0.48, 0.07, -0.42], [0.76, 0.1, -0.42], [0.48, 0.07, 0.42], [0.76, 0.1, 0.42]].map(function (a) {
    var m = part(blob(a[1], a[1] * 1.3, a[1], 18), COL.water, 0.02);
    m.position.set(a[2], a[0], 0);
    G.spring.add(m);
    return { m: m, y: a[0], o: a[0] * 5 };
  });

  // 5단계: 큰 우물지기. 탑처럼 쌓지 않고, 같은 우물에 금 장식과 등불, 잎과 꽃을 더해 몸을 키운다.
  var GOLD = 0xf2c230;
  function goldMesh(geo) { return new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ toneMapped: false, color: linearHex(GOLD) })); }
  [[0.53, 1.1]].forEach(function (t) {
    var gg = new THREE.TorusGeometry(t[1], 0.04, 10, 72);
    gg.rotateX(Math.PI / 2);
    var gm = goldMesh(gg);
    gm.position.y = t[0];
    G.grand.add(gm);
  });
  // 지붕 처마와 꼭대기의 금테
  [[0, 1.98, 0.86, 2.34, 0.06], [0, 1.98, -0.86, 2.34, 0.06]].forEach(function (t) {
    var bar = goldMesh(new THREE.BoxGeometry(t[3], t[4], t[4]));
    bar.position.set(t[0], t[1], t[2]);
    G.grand.add(bar);
  });
  [-1.17, 1.17].forEach(function (x) {
    var bar = goldMesh(new THREE.BoxGeometry(0.06, 0.06, 1.78));
    bar.position.set(x, 1.98, 0);
    G.grand.add(bar);
  });
  var cap = part(roundedBox(1.22, 0.07, 0.9, 0.03, 3), GOLD, 0.02);
  cap.position.y = 2.72;
  G.grand.add(cap);
  // 금 십자가: 활동의 보상이 아니므로 물방울부터 모든 단계에 같은 크기로 있다.
  var crossV = part(roundedBox(0.09, 0.48, 0.09, 0.025, 3), GOLD, 0.022);
  G.cross.add(crossV);
  var crossH = part(roundedBox(0.3, 0.09, 0.09, 0.025, 3), GOLD, 0.022);
  crossH.position.y = 0.08;
  G.cross.add(crossH);

  var sparks = [];
  for (var sp = 0; sp < 6; sp++) {
    var sm = new THREE.Mesh(blob(0.05, 0.05, 0.05, 10), new THREE.MeshBasicMaterial({ toneMapped: false, color: linearHex(0xffe36b) }));
    G.grand.add(sm);
    sparks.push({ m: sm, a: sp / 6 * Math.PI * 2, y: 0.3 + (sp % 3) * 0.6 });
  }

  var stageNow = 4, stageY = 0, stageS = 1;
  // 색별 성장 모습: 물방울은 색만 다르고, 샘(레벨 5)부터 말씀의 이미지로 자란다.
  // 파랑 생수(요 4:14), 초록 참포도나무(요 15:5), 보라 약속의 별(창 15:5, 마 2:10),
  // 분홍 들의 백합화(마 6:28), 청록 시냇가의 나무(시 1:3), 노랑 세상의 빛(마 5:14-15).
  // 1은 샘 전용, 2~5는 그 단계부터 계속 남고, e숫자는 그 단계에서만 보인다.
  var THEME = {}, THEME_KEYS = [1, 2, 3, 4, 5, "e2", "e3", "e4", "e5"];
  ["blue", "green", "purple", "pink", "teal", "yellow"].forEach(function (c) {
    THEME[c] = {};
    THEME_KEYS.forEach(function (k) { THEME[c][k] = new THREE.Group(); well.add(THEME[c][k]); });
  });
  function themed(color, level, obj) { THEME[color][level].add(obj); return obj; }
  function around(count, start, fn) { for (var i = 0; i < count; i++) fn(deg(start + i * 360 / count), i); }
  function onRoof(obj, x, y) {
    var f = (2.59 - y) / 0.62;
    obj.position.set(x, y, 0.386 + 0.44 * f + 0.1);
    obj.rotation.x = -0.61;
    return obj;
  }
  function ground(obj, x, z) { obj.position.set(x, -1.12, z); return obj; }
  function basic(c) { return new THREE.MeshBasicMaterial({ toneMapped: false, color: linearHex(c) }); }
  function tube(points, radius, color, seg) {
    var c3 = new THREE.CatmullRomCurve3(points.map(function (a) { return new THREE.Vector3(a[0], a[1], a[2]); }));
    return part(new THREE.TubeGeometry(c3, seg || 48, radius, 8, false), color, 0.012);
  }
  function lathePart(pts, color) {
    return part(new THREE.LatheGeometry(pts.map(function (a) { return new THREE.Vector2(a[0], a[1]); }), 28), color, 0.012);
  }
  function dropShape(r, color) {
    var pts = [[0, -r], [r * 0.62, -r * 0.82], [r, -r * 0.2], [r * 0.72, r * 0.5], [r * 0.3, r * 1.15], [0, r * 1.6]]
      .map(function (a) { return new THREE.Vector2(a[0], a[1]); });
    return part(new THREE.LatheGeometry(new THREE.SplineCurve(pts).getPoints(18), 18), color, 0.012);
  }
  // 물동이: 바닥이 y=0
  function jarShape(s) {
    var g = new THREE.Group();
    g.add(lathePart([[0, 0], [0.11 * s, 0], [0.2 * s, 0.13 * s], [0.21 * s, 0.26 * s], [0.13 * s, 0.4 * s], [0.08 * s, 0.46 * s], [0.12 * s, 0.53 * s]], 0xc4703c));
    var top = new THREE.Mesh(new THREE.CircleGeometry(0.11 * s, 20), basic(0x1e9cf5));
    top.rotation.x = -Math.PI / 2;
    top.position.y = 0.52 * s;
    g.add(top);
    return g;
  }
  function vineLeaf(r, c) { return part(blob(r, r * 0.55, r * 0.75, 12), c || 0x3f9d3a, 0.012); }
  // 포도송이: 꼭지가 y=0
  function grapes(s) {
    var g = new THREE.Group();
    [[0, 3], [1, 2], [2, 1]].forEach(function (row) {
      for (var i = 0; i < row[1]; i++) {
        var b = part(blob(0.058 * s, 0.058 * s, 0.058 * s, 12), 0x5a2aa0, 0.008);
        b.position.set((i - (row[1] - 1) / 2) * 0.1 * s, -0.08 * s - row[0] * 0.088 * s, (row[0] === 1 ? 0.03 : 0) * s);
        g.add(b);
      }
    });
    var lf = vineLeaf(0.075 * s, 0x56b84a);
    lf.position.y = -0.01 * s;
    g.add(lf);
    return g;
  }
  // 별: 네 줄기가 긴 약속의 별
  function starShape(r, color, long) {
    var sh = new THREE.Shape(), n = long ? 8 : 5, k = 2 * n;
    for (var i = 0; i < k; i++) {
      var rr = i % 2 ? r * (long ? 0.2 : 0.45) : (long && i % 4 === 2 ? r * 0.58 : r), an = Math.PI / 2 + i * Math.PI / n;
      if (i === 0) sh.moveTo(Math.cos(an) * rr, Math.sin(an) * rr); else sh.lineTo(Math.cos(an) * rr, Math.sin(an) * rr);
    }
    sh.closePath();
    var geo = new THREE.ExtrudeGeometry(sh, { depth: 0.04, bevelEnabled: false });
    geo.translate(0, 0, -0.02);
    var g = new THREE.Group();
    g.add(new THREE.Mesh(geo, basic(color)));
    return g;
  }
  // 백합: 뾰족한 꽃잎 여섯 장과 노란 꽃술. 앞을 향한다.
  function lilyShape(r) {
    var g = new THREE.Group();
    for (var i = 0; i < 6; i++) {
      var an = i / 6 * Math.PI * 2, holder = new THREE.Group();
      holder.rotation.z = an;
      var pet = part(blob(r * 0.27, r * 0.62, r * 0.13, 12), 0xfffafc, 0.008);
      pet.position.set(0, r * 0.58, 0);
      pet.rotation.x = 0.28;
      holder.add(pet);
      g.add(holder);
    }
    [[0, 0.07], [-0.09, -0.04], [0.09, -0.04]].forEach(function (a) {
      var st = new THREE.Mesh(blob(r * 0.1, r * 0.1, r * 0.1, 8), basic(0xf2b400));
      st.position.set(a[0] * r * 1.6, a[1] * r * 1.6, r * 0.2);
      g.add(st);
    });
    return g;
  }
  function lilyStem(x, z, r) {
    var g = new THREE.Group();
    var stem = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.018, 0.3, 6), basic(0x3f8f34));
    stem.position.y = 0.15;
    g.add(stem);
    var fl = lilyShape(r);
    fl.position.y = 0.33;
    fl.rotation.x = -0.25;
    g.add(fl);
    return ground(g, x, z);
  }
  // 나무: 밑동이 y=0
  function treeShape(h, fruit) {
    var g = new THREE.Group();
    var tr = part(new THREE.CylinderGeometry(0.05 * h, 0.085 * h, 0.62 * h, 10), 0x8a5a2c, 0.012);
    tr.position.y = 0.31 * h;
    g.add(tr);
    [[0, 0.82, 0, 0.36], [-0.24, 0.66, 0.04, 0.25], [0.24, 0.68, 0.02, 0.26]].forEach(function (a) {
      var cr = part(blob(a[3] * h, a[3] * h, a[3] * h, 18), 0x3fa548, 0.012);
      cr.position.set(a[0] * h, a[1] * h, a[2] * h);
      g.add(cr);
    });
    if (fruit) [[-0.2, 0.72], [0.02, 0.92], [0.22, 0.74], [-0.04, 0.68], [0.14, 0.92]].forEach(function (a) {
      var fr = part(blob(0.05 * h, 0.05 * h, 0.05 * h, 10), 0xe8452c, 0.008);
      fr.position.set(a[0] * h, a[1] * h, 0.3 * h);
      g.add(fr);
    });
    return g;
  }
  function pebble(i) { return part(blob(0.1 + (i % 3) * 0.015, 0.06, 0.08, 10), i % 2 ? 0xd6f3ef : 0xa9e4dc, 0.012); }
  // 등불의 불꽃: 바닥이 y=0
  function flame(r) {
    var g = new THREE.Group();
    var o = new THREE.Mesh(new THREE.LatheGeometry(new THREE.SplineCurve([[0, 0], [r * 0.5, r * 0.3], [r * 0.5, r * 0.8], [r * 0.2, r * 1.45], [0, r * 2]].map(function (a) { return new THREE.Vector2(a[0], a[1]); })).getPoints(14), 16), basic(0xff9a1f));
    g.add(o);
    var inner = new THREE.Mesh(blob(r * 0.27, r * 0.48, r * 0.27, 10), basic(0xffef8a));
    inner.position.y = r * 0.62;
    inner.position.z = r * 0.3;
    g.add(inner);
    return g;
  }
  // 기름 등잔
  function oilLamp(s) {
    var g = new THREE.Group();
    var bowl = part(blob(0.17 * s, 0.08 * s, 0.13 * s, 16), 0xc4703c, 0.012);
    g.add(bowl);
    var fl = flame(0.075 * s);
    fl.position.set(0.09 * s, 0.05 * s, 0);
    g.add(fl);
    return g;
  }
  // 등경 위의 등불: 바닥이 y=0
  function lampStand(h, s) {
    var g = new THREE.Group();
    g.add(lathePart([[0, 0], [0.17, 0], [0.16, 0.03], [0.04, 0.07], [0.03, h - 0.03], [0.13, h], [0.14, h + 0.02], [0, h + 0.02]], 0xb88434));
    var l = oilLamp(s);
    l.position.y = h + 0.09;
    g.add(l);
    return g;
  }
  function hang(obj, color, x, z) {
    var cord = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.14, 6), basic(0x0a1450));
    cord.position.set(x, 1.86, z);
    obj.position.set(x, 1.72, z);
    var g = new THREE.Group();
    g.add(cord, obj);
    return g;
  }

  // ── 파랑: 생수와 물동이
  [1.04, 1.3].forEach(function (r) {
    var gg = new THREE.TorusGeometry(r, 0.02, 8, 56); gg.rotateX(Math.PI / 2);
    var ring = new THREE.Mesh(gg, basic(0x7fd0ff)); ring.position.y = -1.12;
    themed("blue", 1, ring);
  });
  themed("blue", 1, ground(jarShape(1.2), 1.26, 0.3));
  themed("blue", 2, ground(jarShape(1.25), 1.46, 0.3));
  themed("blue", 3, ground(jarShape(1.25), -1.46, 0.3));
  [[0.36, 0.86], [-0.42, 0.82], [0.8, 0.5], [-0.82, 0.46]].forEach(function (a) {
    themed("blue", 3, tube([[a[0], 0.8, a[1]], [a[0] * 1.08, 0.58, a[1] * 1.28], [a[0] * 1.1, 0.2, a[1] * 1.32], [a[0] * 1.08, -0.1, a[1] * 1.28]], 0.026, 0x7fd0ff, 18));
    var tip = dropShape(0.05, 0x7fd0ff); tip.position.set(a[0] * 1.08, -0.2, a[1] * 1.28); themed("blue", 3, tip);
  });
  [2.1, 2.34].forEach(function (y) {
    var f = (2.59 - y) / 0.62, half = 0.52 + 0.6 * f, z = 0.386 + 0.44 * f + 0.075, pts = [];
    for (var i = 0; i <= 12; i++) pts.push([-half + i / 12 * half * 2, y + Math.sin(i * 1.57) * 0.03, z]);
    themed("blue", 4, tube(pts, 0.014, 0xffffff, 40));
  });
  [-1, 1].forEach(function (sd) { themed("blue", 5, hang(dropShape(0.14, 0x7fd0ff), 0, sd * 1.08, 0.5)); });
  [1.32, 1.6].forEach(function (r) {
    var gg = new THREE.TorusGeometry(r, 0.022, 8, 64); gg.rotateX(Math.PI / 2);
    var ring = new THREE.Mesh(gg, basic(0x7fd0ff)); ring.position.y = -1.12;
    themed("blue", 5, ring);
  });

  // ── 초록: 참포도나무
  around(4, 45, function (t) { var lf = vineLeaf(0.13, 0x56b84a); onBody(lf, t, 0.34, 0.98); lf.rotation.z = 0.5; themed("green", 1, lf); });
  around(8, 22, function (t, i) { var lf = vineLeaf(0.11, 0x4cae42); onBody(lf, t, 0.86, 1.18); lf.rotation.z = i % 2 ? 0.5 : -0.5; themed("green", 2, lf); });
  [-0.44, 0.44].forEach(function (x) { var gr = grapes(1); gr.position.set(x, 0.56, 1.14); themed("green", 2, gr); });
  [-1, 1].forEach(function (sd) {
    var helix = [];
    for (var h = 0; h <= 24; h++) { var ha = h * 0.75; helix.push([sd * 0.92 + Math.cos(ha) * 0.13, 0.78 + h * 0.048, Math.sin(ha) * 0.13]); }
    themed("green", 3, tube(helix, 0.022, 0x3f9d3a, 90));
    [0.95, 1.25, 1.55].forEach(function (y, i) { var lf = vineLeaf(0.09); lf.position.set(sd * (1.06 + (i % 2) * 0.03), y, 0.08); lf.rotation.z = sd * 0.6; themed("green", 3, lf); });
    var gb = grapes(1.15); gb.position.set(sd * 0.5, 1.46, 0.06); themed("green", 3, gb);
    var ge = grapes(1.3); ge.position.set(sd * 0.72, 1.92, 0.84); themed("green", 4, ge);
    themed("green", 4, onRoof(vineLeaf(0.12, 0x56b84a), sd * 0.62, 2.14));
    var g5 = grapes(1.5); themed("green", 5, hang(g5, 0, sd * 1.08, 0.5)); g5.position.y = 1.8;
  });
  themed("green", 4, onRoof(vineLeaf(0.15, 0x56b84a), 0, 2.26));
  around(10, 6, function (t) { var gs = grapes(0.9); onBody(gs, t, 0.58, 1.2); themed("green", 5, gs); });

  // ── 보라: 약속의 별
  [[-0.5, 0.78, 0.08], [0.5, 0.78, 0.08]].forEach(function (a) { var st = starShape(a[2], 0xffe36b); st.position.set(a[0], a[1], 0.14); themed("purple", 1, st); });
  var big1 = starShape(0.2, 0xfff1a1, true); big1.position.set(0, 1.12, 0.1); themed("purple", 1, big1);
  around(5, 36, function (t) { var st = starShape(0.09, 0xffe36b); onBody(st, t, 0.98, 1.08); themed("purple", "e2", st); });
  var big2 = starShape(0.26, 0xfff1a1, true); big2.position.set(0, 1.62, 0.1); themed("purple", "e2", big2);
  var big3 = starShape(0.2, 0xfff1a1, true); big3.position.set(-0.46, 1.26, 0.06); themed("purple", 3, big3);
  var big3b = starShape(0.2, 0xfff1a1, true); big3b.position.set(0.46, 1.26, 0.06); themed("purple", 3, big3b);
  themed("purple", 4, onRoof(starShape(0.2, 0xfff1a1, true), 0, 2.26));
  [-1, 1].forEach(function (sd) { themed("purple", 4, onRoof(starShape(0.09, 0xffe36b), sd * 0.62, 2.14)); themed("purple", 5, hang(starShape(0.16, 0xfff1a1, true), 0, sd * 1.08, 0.5)); });
  around(10, 18, function (t) { var st = starShape(0.075, 0xffe36b); onBody(st, t, 0.88, 1.2); themed("purple", 5, st); });

  // ── 분홍: 들의 백합화
  around(4, 45, function (t) { var fw = lilyShape(0.14); onBody(fw, t, 0.3, 1.0); themed("pink", 1, fw); });
  [[-1.2, 0.4], [1.2, 0.4]].forEach(function (a) { themed("pink", 2, lilyStem(a[0], a[1], 0.11)); });
  [-1, 1].forEach(function (sd) { var fl3 = lilyShape(0.14); fl3.position.set(sd * 0.46, 1.32, 0.06); themed("pink", 3, fl3); themed("pink", 4, onRoof(lilyShape(0.13), sd * 0.62, 2.14)); themed("pink", 5, hang(lilyShape(0.15), 0, sd * 1.08, 0.5)); });
  themed("pink", 4, onRoof(lilyShape(0.17), 0, 2.26));
  around(10, 18, function (t) { var fw = lilyShape(0.1); onBody(fw, t, 0.72, 1.27); themed("pink", 5, fw); });
  [[-1.42, -0.1], [1.42, -0.1], [-0.9, 0.9], [0.9, 0.9]].forEach(function (a) { themed("pink", 5, lilyStem(a[0], a[1], 0.11)); });

  // ── 청록: 시냇가의 나무
  themed("teal", 1, tube([[0.6, 0.2, 0.74], [0.86, -0.2, 0.68], [1.02, -0.7, 0.56], [1.22, -1.08, 0.58]], 0.045, 0x5fd4ee, 30));
  around(8, 0, function (t, i) { var pb = pebble(i); onBody(pb, t, -1.1, 1.2); themed("teal", 1, pb); });
  themed("teal", 1, ground(treeShape(0.72, false), -1.32, -0.1));
  themed("teal", "e2", ground(treeShape(0.95, false), -1.52, -0.2));
  around(14, 8, function (t, i) { var pb = pebble(i); onBody(pb, t, -1.1, 1.32); themed("teal", 2, pb); });
  themed("teal", "e3", ground(treeShape(1.3, false), -1.56, -0.25));
  themed("teal", "e3", tube([[0.8, 0.74, 0.76], [0.92, 0.3, 0.68], [1.02, -0.3, 0.56], [1.1, -0.8, 0.52], [1.34, -1.1, 0.62]], 0.045, 0x5fd4ee, 40));
  [-1, 1].forEach(function (sd) {
    themed("teal", 4, tube([[sd * 0.8, 0.74, 0.76], [sd * 0.92, 0.3, 0.68], [sd * 1.02, -0.3, 0.56], [sd * 1.1, -0.8, 0.52], [sd * 1.34, -1.1, 0.62]], 0.045, 0x5fd4ee, 40));
    themed("teal", 5, hang(part(blob(0.12, 0.15, 0.12, 18), 0x8ff0e6, 0.016), 0, sd * 1.08, 0.5));
  });
  themed("teal", "e4", ground(treeShape(1.5, true), -1.6, -0.3));
  themed("teal", "e5", ground(treeShape(1.5, true), -1.66, -0.35));
  themed("teal", "e5", ground(treeShape(1.5, true), 1.66, -0.35));
  var pondG = new THREE.RingGeometry(1.42, 1.78, 56);
  pondG.rotateX(-Math.PI / 2);
  var pond = new THREE.Mesh(pondG, new THREE.MeshBasicMaterial({ toneMapped: false, color: linearHex(0x5fd4ee), side: THREE.DoubleSide }));
  pond.position.y = -1.13;
  themed("teal", 5, pond);

  // ── 노랑: 세상의 빛, 등경 위의 등불
  themed("yellow", 1, ground(lampStand(0.62, 1), 1.3, 0.1));
  themed("yellow", 2, ground(lampStand(0.86, 1.15), 1.52, 0.1));
  themed("yellow", 3, ground(lampStand(0.86, 1.15), -1.52, 0.1));
  [-1, 1].forEach(function (sd) {
    var fl = flame(0.09); fl.position.set(sd * 0.92, 2.1, 0); themed("yellow", "e3", fl);
    themed("yellow", 5, hang(oilLamp(1.05), 0, sd * 1.08, 0.5));
    themed("yellow", 4, onRoof(flame(0.075), sd * 0.62, 2.1));
  });
  themed("yellow", 4, onRoof(flame(0.12), 0, 2.2));
  around(10, 18, function (t) { var fl = flame(0.05); onBody(fl, t, 0.82, 1.2); themed("yellow", 5, fl); });

  var ROOF = {
    blue: [0x1766c9, 0x0f4c9e], green: [0x1c7a2e, 0x125c20], purple: [0x43308f, 0x2c1e66],
    pink: [0xe8609a, 0xc23f78], teal: [0x0a8f88, 0x076b66], yellow: [0xcf7c00, 0xa35e00],
    classic: [0xe2500c, 0xb83c06]
  };
  var colorNow = "classic";
  function applyTheme() {
    Object.keys(THEME).forEach(function (c) {
      THEME_KEYS.forEach(function (k) {
        var on = typeof k === "string" ? stageNow === Number(k.slice(1)) : (k === 1 ? stageNow === 1 : stageNow >= k);
        THEME[c][k].visible = c === colorNow && on;
      });
    });
    var r = ROOF[colorNow] || ROOF.blue;
    roofMat.color.copy(linearHex(r[0]));
    ridgeMat.color.copy(linearHex(r[1]));
  }

  // 발이 같은 땅을 딛도록 크기에 맞춰 높이를 정한다. 몸이 단계마다 커진다.
  var STAGE_SIZE = [0.54, 0.68, 0.76, 0.82, 0.87, 0.92];
  var STAGE_LIFT = [0, 0, 0, 0, 0, 0];
  function setStage(n) {
    n = Math.max(0, Math.min(5, n | 0));
    stageNow = n;
    G.drop.visible = n === 0;
    G.spring.visible = n === 1;
    G.body.visible = n >= 2;
    G.rim.visible = n >= 2;
    G.bricks.visible = n >= 2;
    G.bricksHigh.visible = n >= 3;
    G.frame.visible = n >= 3;
    G.hang.visible = n >= 3;
    G.roof.visible = n >= 4;
    G.grand.visible = n === 5;
    G.cross.position.y = [1.82, 0.44, 0.9, 1.88, 2.99, 2.99][n];
    G.face.position.y = n === 1 ? -0.32 : 0;
    armSize = n === 0 ? 0.62 : n === 1 ? 0.8 : n === 5 ? 1.12 : 1;
    stageS = STAGE_SIZE[n];
    stageY = -1.13 * (1 - stageS) + STAGE_LIFT[n];
    applyTheme();
  }
  var COLORS = {
    blue: [0x1f52de, 0x8cb8f4], green: [0x16a34a, 0x86d7a2], purple: [0x7a22e0, 0xc2a0f7],
    pink: [0xe91e82, 0xf8a6cd], teal: [0x0ea5a5, 0x7ad6d3], yellow: [0xd98a00, 0xf0bf3a],
    classic: [0x1f52de, 0x8cb8f4]
  };
  function setColor(name) {
    var c = COLORS[name] || COLORS.blue;
    MAIN_MATS.forEach(function (m) { m.color.copy(linearHex(c[0])); });
    STONE_MATS.forEach(function (m) { m.color.copy(linearHex(c[1])); });
    colorNow = COLORS[name] ? name : "blue";
    applyTheme();
  }

  // 튀어 오르는 물방울
  var drops = [];
  for (var i = 0; i < 8; i++) {
    var dm = new THREE.Mesh(blob(0.045, 0.06, 0.045, 12), new THREE.MeshBasicMaterial({ toneMapped: false, color: linearHex(COL.water) }));
    dm.visible = false;
    well.add(dm);
    drops.push({ m: dm, vx: 0, vy: 0, vz: 0, t: 0 });
  }
  function splash() {
    drops.forEach(function (d, k) {
      var a = k / drops.length * Math.PI * 2;
      d.vx = Math.cos(a) * 0.55; d.vz = Math.sin(a) * 0.55; d.vy = 1.5 + (k % 3) * 0.25; d.t = 0;
      d.m.position.set(0, 0.72, 0);
      d.m.visible = true;
    });
  }

  // 그림자
  var shadow = new THREE.Mesh(new THREE.CircleGeometry(1.75, 48), new THREE.ShadowMaterial({ opacity: 0.3 }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -1.18;
  shadow.receiveShadow = true;
  scene.add(shadow);
  var contact = new THREE.Mesh(new THREE.CircleGeometry(1.05, 40), new THREE.MeshBasicMaterial({ toneMapped: false, color: linearHex(COL.navy), transparent: true, opacity: 0.14 }));
  contact.rotation.x = -Math.PI / 2;
  contact.position.y = -1.17;
  scene.add(contact);

  // 동작
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var action = null, actionT = 0, splashed = false;
  var DUR = { wave: 2, joy: 1.8, dip: 2.8, proud: 3.4 };
  var base = "wave", proudT = 0, showShadow = true;
  var buttons = {};
  [["wave", "aWave"], ["joy", "aJoy"], ["proud", "aProud"], ["dip", "aDip"]].forEach(function (b) { var el = document.getElementById(b[1]); if (el) buttons[b[0]] = el; });
  function play(k) {
    if ((k === "dip" || k === "proud") && stageNow < 3) k = "joy";
    action = k; actionT = 0; splashed = false;
    Object.keys(buttons).forEach(function (b) { buttons[b].classList.toggle("on", b === k); });
  }
  Object.keys(buttons).forEach(function (k) { buttons[k].addEventListener("click", function () { play(k); }); });

  // 돌려 보기와 누르기
  var yaw = 0, pitch = 0, yawV = 0, dragging = false, moved = 0, lastX = 0, lastY = 0, idleBack = 0;
  var cv = renderer.domElement;
  cv.addEventListener("pointerdown", function (e) { dragging = true; moved = 0; lastX = e.clientX; lastY = e.clientY; try { cv.setPointerCapture(e.pointerId); } catch (_) {} });
  cv.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    var dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    moved += Math.abs(dx) + Math.abs(dy);
    yaw += dx * 0.012; yawV = dx * 0.012;
    pitch = Math.max(-1.05, Math.min(0.75, pitch + dy * 0.006));
    idleBack = 0;
  });
  function up() {
    if (dragging && moved < 8) play("joy");
    dragging = false;
  }
  cv.addEventListener("pointerup", up);
  cv.addEventListener("pointercancel", function () { dragging = false; });

  function resize() {
    var w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 0.8 ? 26 / Math.max(0.62, w / h / 0.8) : 26;
    camera.updateProjectionMatrix();
  }
  if (window.ResizeObserver) new ResizeObserver(resize).observe(stage); else window.addEventListener("resize", resize);
  resize();

  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); }

  var clock = new THREE.Clock(), time = 0, nextBlink = 2.5, blink = 0;
  function frame(dt) {
    time += dt;
    if (action) { actionT += dt; if (actionT > DUR[action]) { action = null; Object.keys(buttons).forEach(function (b) { buttons[b].classList.remove("on"); }); } }

    // 기본 자세: 왼팔을 들고 천천히 흔든다.
    var isProud = stageNow >= 3 && (action === "proud" || (!action && base === "proud"));
    var la = -1.95 + (reduce ? 0 : Math.sin(time * 2.2) * 0.14), ra = 0.42, hop = 0, squash = 0, mouthOpen = false, happyEyes = false;
    if (!action && (base === "idle" || (base === "proud" && stageNow < 3))) la = -0.42;
    if (isProud) { happyEyes = true; hop = reduce ? 0 : Math.abs(Math.sin(time * 2.4)) * 0.03; }
    if (action === "wave") { la = -1.95 + Math.sin(actionT * 11) * 0.3; ra = 0.5; }
    if (action === "joy") {
      var up2 = ease(actionT / 0.25) * ease((DUR.joy - actionT) / 0.3);
      la = lerp(la, -2.25 + Math.sin(actionT * 14) * 0.1, up2);
      ra = lerp(ra, 2.25 - Math.sin(actionT * 14) * 0.1, up2);
      hop = Math.abs(Math.sin(actionT * 5.2)) * 0.34 * up2;
      squash = (0.34 - hop) * 0.09 * up2;
      mouthOpen = true;
    }
    var by = BUCKET_REST;
    if (action === "dip") {
      if (actionT < 1) by = lerp(BUCKET_REST, BUCKET_LOW, ease(actionT));
      else if (actionT < 1.3) by = BUCKET_LOW;
      else by = lerp(BUCKET_LOW, BUCKET_REST, ease((actionT - 1.3) / 1.2));
      if (actionT > 0.92 && !splashed) { splashed = true; splash(); }
      la = lerp(la, -0.5, ease(actionT / 0.4));
      if (actionT > 2.4) happyEyes = true;
    }
    setBucket(by);
    // 일정한 속도로 움직여서 두레박이 지나가는 길이 보이게 한다 (약 1초)
    proudT = isProud ? Math.min(1, proudT + dt / 1.05) : Math.max(0, proudT - dt / 1.05);
    if (proudT > 0.002) {
      // 두레박이 우물 위로 올라와 테두리를 넘은 뒤, 몸 앞쪽으로 내려와 품에 안긴다.
      // 몸과 테두리를 통과하지 않도록 먼저 앞으로 빼고 나서 내린다.
      var outT = ease(proudT / 0.5), downT = ease((proudT - 0.5) / 0.5);
      bucket.position.set(
        0,
        proudT < 0.5 ? lerp(by, 1.2, outT) : lerp(1.2, -0.54, downT),
        lerp(lerp(0, 1.5, outT), 1.33, downT)
      );
      bucket.scale.setScalar(lerp(1, 1.05, proudT));
      rope.scale.y = lerp(rope.scale.y, 0.16, Math.min(1, proudT * 4));
    } else {
      bucket.scale.setScalar(1);
    }
    bucket.rotation.z = (reduce || proudT > 0.02) ? 0 : Math.sin(time * 1.4) * 0.05;
    setArm(armL, -1, la, proudT, dt);
    setArm(armR, 1, ra, proudT, dt);
    smile.visible = !mouthOpen; openMouth.visible = mouthOpen;

    var bob = reduce ? 0 : Math.sin(time * 1.7) * 0.022;
    root.position.y = hop + bob + stageY;
    root.scale.setScalar(stageS);
    if (G.spring.visible) springDrops.forEach(function (d) { d.m.position.y = d.y + (reduce ? 0 : Math.sin(time * 3.4 + d.o) * 0.07); });
    if (G.grand.visible) sparks.forEach(function (d) {
      var ang = d.a + (reduce ? 0 : time * 0.55);
      d.m.position.set(Math.cos(ang) * 1.75, d.y + (reduce ? 0 : Math.sin(time * 1.3 + d.a) * 0.1), Math.sin(ang) * 1.75);
    });
    well.scale.set(1 + squash, 1 - squash, 1 + squash);

    // 물결
    ripples.forEach(function (m, k) {
      var f = reduce ? 0.6 - k * 0.25 : (time * 0.22 + k * 0.5) % 1;
      var s = lerp(0.18, 0.88, f);
      m.scale.set(s, s, 1);
      m.material.opacity = Math.sin(f * Math.PI) * 0.95;
    });
    drops.forEach(function (d) {
      if (!d.m.visible) return;
      d.t += dt;
      d.vy -= 5.5 * dt;
      d.m.position.x += d.vx * dt; d.m.position.y += d.vy * dt; d.m.position.z += d.vx * 0 + d.vz * dt;
      if (d.m.position.y < 0.66) d.m.visible = false;
    });

    // 눈 깜빡임과 시선
    if (time > nextBlink) { blink = 0.14; nextBlink = time + 2.6 + Math.random() * 3; }
    blink = Math.max(0, blink - dt);
    var open = blink > 0 ? 0.08 : 1;
    eyes.forEach(function (e) { e.p.visible = !happyEyes; e.happy.visible = happyEyes; e.g.scale.y = lerp(e.g.scale.y, happyEyes ? 1 : open, Math.min(1, dt * 26)); });

    // 놓으면 관성 뒤에 천천히 앞을 본다.
    if (!dragging) {
      yaw += yawV; yawV *= 0.92;
      idleBack += dt;
      if (idleBack > 4 && Math.abs(yawV) < 0.001) {
        var tau = Math.PI * 2;
        yaw = ((yaw % tau) + tau) % tau;
        if (yaw > Math.PI) yaw -= tau;
        yaw = lerp(yaw, 0, Math.min(1, dt * 1.1));
        pitch = lerp(pitch, 0, Math.min(1, dt * 1.1));
      }
    }
    root.rotation.y = yaw + (reduce || dragging ? 0 : Math.sin(time * 0.6) * 0.09);
    root.rotation.x = pitch;
    shadow.visible = showShadow;
    shadow.position.y = -1.18 * stageS + stageY;
        var groundFade = Math.max(0, Math.min(1, 1 + pitch * 3));
    shadow.material.opacity = 0.3 * groundFade;
    contact.material.opacity = 0.14 * groundFade * (1 - hop);
    contact.position.y = shadow.position.y + 0.01;
    contact.scale.setScalar(stageS);
    contact.visible = showShadow;
  }
  setStage(4);
  armL.rotation.z = -1.95; armR.rotation.z = 0.42;
  function loop() {
    frame(Math.min(clock.getDelta(), 0.05));
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  loop();
  return { play: play, setStage: setStage, setColor: setColor, setBase: function (b) { base = b; action = null; }, hideShadow: function () { showShadow = false; }, stopBlink: function () { nextBlink = 1e9; blink = 0; }, pose: function (y, k, t, p) { yaw = y; pitch = p || 0; idleBack = 0; yawV = 0; if (k) play(k); if (t) actionT = t; } };
};
