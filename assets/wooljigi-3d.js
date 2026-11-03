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
  stage.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(26, 1, 0.1, 50);
  camera.position.set(0, 3.5, 9.9);
  camera.lookAt(0, 0.66, 0);
  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  var key = new THREE.DirectionalLight(0xffffff, 0.3);
  key.position.set(-2.5, 5, 6);
  scene.add(key);

  var COL = { cobalt: 0x1f52de, stone: 0x8cb8f4, cream: 0xfdf0d6, water: 0x2ba8ff, wood: 0xd9852c, roof: 0xff7a35,
    navy: 0x0a1450, pink: 0xfaa6ad, white: 0xffffff, pulley: 0xf5da6e, rope: 0xf3e4b0 };

  var levels = new Uint8Array([150, 215, 255]);
  var grad = new THREE.DataTexture(levels, 3, 1, THREE.LuminanceFormat);
  grad.minFilter = grad.magFilter = THREE.NearestFilter;
  grad.needsUpdate = true;

  function toon(c) { return new THREE.MeshToonMaterial({ color: c, gradientMap: grad }); }

  var OUT = 0.038;
  function hullMat(t) {
    return new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: { t: { value: t }, c: { value: new THREE.Color(COL.navy) } },
      vertexShader: "uniform float t; void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position + normalize(normal) * t, 1.0); }",
      fragmentShader: "uniform vec3 c; void main(){ gl_FragColor = vec4(c, 1.0); }"
    });
  }
  // 색 면과 남색 외곽선을 한 묶음으로 만든다.
  function part(geo, color, t) {
    var g = new THREE.Group();
    g.add(new THREE.Mesh(geo, toon(color)));
    if (t !== 0) g.add(new THREE.Mesh(geo, hullMat(t === undefined ? OUT : t)));
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

  // 몸통
  var pts = [[0, -0.74], [0.62, -0.74], [0.86, -0.66], [0.99, -0.46], [1.03, -0.14], [1.03, 0.3], [1.0, 0.62], [0, 0.62]]
    .map(function (a) { return new THREE.Vector2(a[0], a[1]); });
  var curve = new THREE.SplineCurve(pts.slice(1, 7));
  var lathe = [pts[0]].concat(curve.getPoints(36), [pts[7]]);
  well.add(part(new THREE.LatheGeometry(lathe, 72), COL.cobalt));

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
      well.add(onBody(part(brick, COL.stone, 0.03), deg(d), c.y, c.R));
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
      well.add(holder);
    }
  });

  // 우물 입구
  var water = new THREE.Mesh(new THREE.CircleGeometry(1.02, 48), new THREE.MeshBasicMaterial({ color: COL.water }));
  water.rotation.x = -Math.PI / 2;
  water.position.y = 0.66;
  well.add(water);
  var rimStone = roundedBox(0.46, 0.25, 0.3, 0.09, 6);
  for (var r = 0; r < 14; r++) well.add(onBody(part(rimStone, COL.cream, 0.032), deg(r * 360 / 14 + 12.8), 0.68, 1.1));

  var ripples = [0, 1].map(function () {
    var m = new THREE.Mesh(new THREE.RingGeometry(0.96, 1, 48), new THREE.MeshBasicMaterial({ color: COL.white, transparent: true, side: THREE.DoubleSide }));
    m.rotation.x = -Math.PI / 2;
    m.position.y = 0.675;
    well.add(m);
    return m;
  });

  // 기둥, 가로 막대, 도르래
  var post = roundedBox(0.19, 1.42, 0.19, 0.03, 3);
  [-0.92, 0.92].forEach(function (x) {
    var p = part(post, COL.wood);
    p.position.set(x, 1.38, 0);
    well.add(p);
  });
  var barGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.7, 14);
  barGeo.rotateZ(Math.PI / 2);
  var bar = part(barGeo, COL.wood, 0.03);
  bar.position.set(0, 1.5, 0);
  well.add(bar);
  var pulley = part(new THREE.TorusGeometry(0.11, 0.05, 12, 28), COL.pulley, 0.03);
  pulley.position.set(0, 1.5, 0);
  well.add(pulley);

  // 줄과 두레박
  var ropeGeo = new THREE.CylinderGeometry(0.02, 0.02, 1, 8);
  ropeGeo.translate(0, -0.5, 0);
  var rope = part(ropeGeo, COL.rope, 0.016);
  rope.position.set(0, 1.4, 0);
  well.add(rope);
  var bucket = new THREE.Group();
  var pail = part(new THREE.CylinderGeometry(0.19, 0.14, 0.22, 18), COL.wood, 0.03);
  bucket.add(pail);
  var bandGeo = new THREE.TorusGeometry(0.175, 0.012, 6, 24);
  bandGeo.rotateX(Math.PI / 2);
  var band = new THREE.Mesh(bandGeo, new THREE.MeshBasicMaterial({ color: COL.navy }));
  band.position.y = 0.03;
  bucket.add(band);
  var handle = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.016, 8, 20, Math.PI), new THREE.MeshBasicMaterial({ color: COL.navy }));
  handle.position.y = 0.1;
  bucket.add(handle);
  well.add(bucket);
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
  roof.add(new THREE.Mesh(roofFlat, roofMat));
  var roofLine = new THREE.Mesh(roofGeo.clone().scale(1.045, 1.12, 1.06), new THREE.MeshBasicMaterial({ color: COL.navy, side: THREE.BackSide }));
  roof.add(roofLine);
  // 지붕 판 사이의 선: 앞뒤 면의 실제 모서리 좌표를 따라 긋는다.
  function seam(ax, ay, az, bx, by, bz) {
    var A = new THREE.Vector3(ax, ay, az), B = new THREE.Vector3(bx, by, bz);
    var len = A.distanceTo(B);
    var geo = new THREE.CylinderGeometry(0.018, 0.018, len, 8);
    var m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: COL.navy }));
    m.position.copy(A).add(B).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
    roof.add(m);
  }
  [1, -1].forEach(function (side) {
    [-1, 1].forEach(function (x) {
      seam(x * 0.17, 0.31, side * 0.386, x * 0.37, -0.31, side * 0.825);
    });
    // 기왓줄: 앞뒤 면을 가로지른다
    [0.36, 0.68].forEach(function (f) {
      var y = 0.31 - 0.62 * f, xx = 0.52 + (1.12 - 0.52) * f, zz = side * (0.386 + (0.825 - 0.386) * f);
      seam(-xx, y, zz, xx, y, zz);
    });
    // 옆면 가운데 선
    seam(side * 0.525, 0.31, 0, side * 1.125, -0.31, 0);
  });
  var ridgeGeo = roundedBox(1.16, 0.13, 0.86, 0.05, 4);
  var ridge = part(ridgeGeo, 0xd95a1e, 0.03);
  ridge.position.y = 0.37;
  roof.add(ridge);
  var soffit = new THREE.Mesh(new THREE.PlaneGeometry(2.16, 1.58), new THREE.MeshBasicMaterial({ color: 0x8f5420 }));
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
  well.add(roof);

  // 얼굴: 흰자 없이 작은 타원 눈. 기쁠 때는 웃는 눈으로 바뀐다.
  var eyes = [];
  [-1, 1].forEach(function (s) {
    var eye = new THREE.Group();
    onBody(eye, s * deg(17), 0.04, 1.035);
    var p = new THREE.Group();
    p.add(new THREE.Mesh(blob(0.122, 0.16, 0.025), new THREE.MeshBasicMaterial({ color: COL.navy })));
    var hi = new THREE.Mesh(blob(0.036, 0.036, 0.01), new THREE.MeshBasicMaterial({ color: COL.white }));
    hi.position.set(0.03, 0.055, 0.024);
    p.add(hi);
    eye.add(p);
    var happy = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.027, 10, 24, Math.PI), new THREE.MeshBasicMaterial({ color: COL.navy }));
    happy.position.y = -0.04;
    happy.visible = false;
    eye.add(happy);
    well.add(eye);
    eyes.push({ g: eye, p: p, happy: happy });
    var ck = new THREE.Mesh(blob(0.115, 0.075, 0.02), new THREE.MeshBasicMaterial({ color: COL.pink }));
    onBody(ck, s * deg(33), -0.14, 1.03);
    well.add(ck);
  });
  var smileGeo = new THREE.TorusGeometry(0.085, 0.024, 10, 28, Math.PI);
  smileGeo.rotateZ(Math.PI);
  var smile = new THREE.Mesh(smileGeo, new THREE.MeshBasicMaterial({ color: COL.navy }));
  smile.position.set(0, -0.1, 1.04);
  well.add(smile);
  var openGeo = new THREE.CircleGeometry(0.11, 28, Math.PI, Math.PI);
  var openMouth = new THREE.Mesh(openGeo, new THREE.MeshBasicMaterial({ color: COL.navy }));
  openMouth.position.set(0, -0.09, 1.045);
  openMouth.visible = false;
  well.add(openMouth);

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
  var armL = arm(-1), armR = arm(1);
  [-1, 1].forEach(function (s) {
    var leg = part(blob(0.27, 0.26, 0.3), COL.cobalt);
    leg.position.set(s * 0.44, -0.87, 0.1);
    root.add(leg);
  });

  // 튀어 오르는 물방울
  var drops = [];
  for (var i = 0; i < 8; i++) {
    var dm = new THREE.Mesh(blob(0.045, 0.06, 0.045, 12), new THREE.MeshBasicMaterial({ color: COL.water }));
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
  var shadow = new THREE.Mesh(new THREE.CircleGeometry(1.1, 40), new THREE.MeshBasicMaterial({ color: COL.navy, transparent: true, opacity: 0.14 }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -1.18;
  scene.add(shadow);

  // 동작
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var action = null, actionT = 0, splashed = false;
  var DUR = { wave: 2, joy: 1.8, dip: 2.8 };
  var buttons = {};
  [["wave", "aWave"], ["joy", "aJoy"], ["dip", "aDip"]].forEach(function (b) { var el = document.getElementById(b[1]); if (el) buttons[b[0]] = el; });
  function play(k) {
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
    var la = -1.95 + (reduce ? 0 : Math.sin(time * 2.2) * 0.14), ra = 0.42, hop = 0, squash = 0, joy = false;
    if (action === "wave") { la = -1.95 + Math.sin(actionT * 11) * 0.3; ra = 0.5; }
    if (action === "joy") {
      var up2 = ease(actionT / 0.25) * ease((DUR.joy - actionT) / 0.3);
      la = lerp(la, -2.25 + Math.sin(actionT * 14) * 0.1, up2);
      ra = lerp(ra, 2.25 - Math.sin(actionT * 14) * 0.1, up2);
      hop = Math.abs(Math.sin(actionT * 5.2)) * 0.34 * up2;
      squash = (0.34 - hop) * 0.09 * up2;
      joy = true;
    }
    var by = BUCKET_REST;
    if (action === "dip") {
      if (actionT < 1) by = lerp(BUCKET_REST, BUCKET_LOW, ease(actionT));
      else if (actionT < 1.3) by = BUCKET_LOW;
      else by = lerp(BUCKET_LOW, BUCKET_REST, ease((actionT - 1.3) / 1.2));
      if (actionT > 0.92 && !splashed) { splashed = true; splash(); }
      la = lerp(la, -0.5, ease(actionT / 0.4));
      if (actionT > 2.4) joy = true;
    }
    setBucket(by);
    bucket.rotation.z = reduce ? 0 : Math.sin(time * 1.4) * 0.05;
    armL.rotation.z = lerp(armL.rotation.z, la, Math.min(1, dt * 12));
    armR.rotation.z = lerp(armR.rotation.z, ra, Math.min(1, dt * 12));
    smile.visible = !joy; openMouth.visible = joy;

    var bob = reduce ? 0 : Math.sin(time * 1.7) * 0.022;
    root.position.y = hop + bob;
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
    var open = blink > 0 ? 0.08 : (joy ? 0.72 : 1);
    eyes.forEach(function (e) { e.p.visible = !joy; e.happy.visible = joy; e.g.scale.y = lerp(e.g.scale.y, joy ? 1 : open, Math.min(1, dt * 26)); });

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
    shadow.scale.setScalar(1 - hop * 0.5);
    shadow.material.opacity = Math.max(0, 0.14 - hop * 0.2) * Math.max(0, Math.min(1, 1 + pitch * 3));
  }
  armL.rotation.z = -1.95; armR.rotation.z = 0.42;
  function loop() {
    frame(Math.min(clock.getDelta(), 0.05));
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  loop();
  return { play: play, pose: function (y, k, t, p) { yaw = y; pitch = p || 0; idleBack = 0; yawV = 0; if (k) play(k); if (t) actionT = t; } };
};
