  // ───────── 해·밤, 비 ─────────
  var FOG_FAR = (isTouch ? 5 : 7) * 32 - 6;
  var DAY_LEN = 1200, dayT = DAY_LEN * 0.06, rain = 0, rainOn = false, rainTimer = 300;   // 11/20: 하루 15분 → 20분(낮 약 12분·밤 약 8분), 처음 5분은 맑게
  var storm = false, thunderT = 8, flashK = 0, stormTold = false;   // 뇌우: 비가 올 때 열에 넷쯤(노아 때 비는 늘 뇌우)
  var LU = { uDay: { value: 1 }, uTint: { value: new THREE.Color(1, 1, 1) }, uTime: { value: 0 }, uHand: { value: new THREE.Vector4(0, -999, 0, 0) } };   // uHand: 손에 든 횃불(위치, 세기)
  function lightPatch(mat) {
    mat.onBeforeCompile = function (sh) {
      sh.uniforms.uDay = LU.uDay; sh.uniforms.uTint = LU.uTint; sh.uniforms.uTime = LU.uTime; sh.uniforms.uHand = LU.uHand;
      sh.vertexShader = 'uniform float uTime;\nvarying vec3 vWpL;\n' + sh.vertexShader.replace('#include <begin_vertex>',
        '#include <begin_vertex>\n vWpL = (modelMatrix * vec4(position, 1.0)).xyz;\n#ifdef USE_COLOR\n float swayW = color.b;\n if (swayW > 0.5) { vec4 wpS = modelMatrix * vec4(position, 1.0);\n' +
        '  if (swayW < 1.5) { transformed.x += sin(uTime * 1.7 + wpS.x * 0.7 + wpS.z * 0.5) * 0.07; transformed.z += cos(uTime * 1.3 + wpS.z * 0.6 + wpS.x * 0.2) * 0.05; }\n' +
        '  else { transformed.y += sin(uTime * 1.6 + wpS.x * 0.8 + wpS.z * 0.6) * 0.035 - 0.035; } }\n#endif');
      sh.fragmentShader = 'uniform float uDay;\nuniform vec3 uTint;\nuniform vec4 uHand;\nvarying vec3 vWpL;\n' + sh.fragmentShader.replace('#include <color_fragment>',
        '#if defined( USE_COLOR )\n float handL = uHand.w * clamp(1.0 - distance(vWpL, uHand.xyz) / 7.0, 0.0, 1.0) * (0.55 + 0.45 * vColor.r);\n' +
        ' diffuseColor.rgb *= max(vColor.r * uDay * uTint, max(vColor.g, handL) * vec3(1.0, 0.86, 0.62));\n#endif');
    };
  }
  var brightStars = null, starLook = 0, starNight = -1;
  var clouds = [], sunM, moonM, stars, cloudMat, rainLines, rainPos, RAIN_N = 900;
  var C_DAY = new THREE.Color(0x9fcdee), C_NIGHT = new THREE.Color(0x0c1430), C_DUSK = new THREE.Color(0xf09a5a), C_RAIN = new THREE.Color(0x8792a0);
  var C_WHITE = new THREE.Color(1, 1, 1), C_NTINT = new THREE.Color(0.72, 0.8, 1), C_DTINT = new THREE.Color(1, 0.84, 0.68), skyC = new THREE.Color(), fogC = new THREE.Color();
  function makeSky() {
    sunM = new THREE.Mesh(new THREE.PlaneGeometry(26, 26), new THREE.MeshBasicMaterial({ color: 0xfff1b8, fog: false }));
    moonM = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.MeshBasicMaterial({ color: 0xe6ecf8, fog: false, transparent: true }));
    scene.add(sunM); scene.add(moonM);
    var sp = [];
    for (var i = 0; i < 700; i++) { var th = rnd(i * 3.1) * Math.PI * 2, ph = Math.acos(rnd(i * 7.7) * 0.95), r = 260; sp.push(Math.cos(th) * Math.sin(ph) * r, Math.cos(ph) * r, Math.sin(th) * Math.sin(ph) * r); }
    var sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
    stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false }));
    stars.frustumCulled = false; scene.add(stars);
    // 북두성·삼성·묘성(욥 9:9): 밝게 보이는 별 무리
    var cps = [];
    [[22, 52, [[0, 0], [5, 1], [9, 0], [13, -1], [14, -6], [19, -7], [19, -1]]],
     [205, 32, [[0, 0], [7, 1], [3, -5], [4, -6], [5, -7], [1, -12], [8, -11]]],
     [118, 62, [[0, 0], [1.4, .6], [2.3, -.2], [1, -1], [2.1, -1.3], [3, -.7], [.4, -1.8]]]].forEach(function (gp) {
      gp[2].forEach(function (o) {
        var az = (gp[0] + o[0]) * Math.PI / 180, el = (gp[1] + o[1]) * Math.PI / 180, r = 255;
        cps.push(Math.cos(az) * Math.cos(el) * r, Math.sin(el) * r, Math.sin(az) * Math.cos(el) * r);
      });
    });
    var cg = new THREE.BufferGeometry(); cg.setAttribute('position', new THREE.Float32BufferAttribute(cps, 3));
    brightStars = new THREE.Points(cg, new THREE.PointsMaterial({ color: 0xfff4d6, size: 4, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false }));
    brightStars.frustumCulled = false; scene.add(brightStars);
    rainPos = new Float32Array(RAIN_N * 6);
    var rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    rainLines = new THREE.LineSegments(rg, new THREE.LineBasicMaterial({ color: 0xaabbd4, transparent: true, opacity: 0 }));
    rainLines.frustumCulled = false; rainLines.visible = false; scene.add(rainLines);
  }
  function respawnDrop(i, top) {
    var o = i * 6, x = camera.position.x + (Math.random() - 0.5) * 70, z = camera.position.z + (Math.random() - 0.5) * 70;
    var y = top ? camera.position.y + 12 + Math.random() * 22 : camera.position.y - 20 + Math.random() * 50;
    rainPos[o] = x; rainPos[o + 1] = y; rainPos[o + 2] = z; rainPos[o + 3] = x + 0.15; rainPos[o + 4] = y - 1.1; rainPos[o + 5] = z;
  }
  var skyState = { dayF: 1, dusk: 0 }, caveK = 0, C_CAVE = new THREE.Color(0x07080a);
  var WEATHER=['이른 비','맑은 철','늦은 비','가뭄'], rainbowUntil=0, rainbow=[], lastSeason=-1;
  function seasonIndex(){return Math.floor(dayT/DAY_LEN)%WEATHER.length;}
  function makeRainbow(){
    [0xdd746d,0xe5a966,0xe7d68a,0x93c78d,0x80abc8,0xb39ccc].forEach(function(color,i){
      var pos=[];   // 11/21 가는 선 대신 띠(두께 1.7)로 — 작은 화면에서도 보이게
      for(var k=0;k<32;k++){
        var a0=k*Math.PI/32,a1=(k+1)*Math.PI/32,r0=75-i*1.7,r1=r0-1.7;
        var P0=[Math.cos(a0)*r0,Math.sin(a0)*r0*.55],P1=[Math.cos(a1)*r0,Math.sin(a1)*r0*.55],Q0=[Math.cos(a0)*r1,Math.sin(a0)*r1*.55],Q1=[Math.cos(a1)*r1,Math.sin(a1)*r1*.55];
        pos.push(P0[0],P0[1],0,Q0[0],Q0[1],0,P1[0],P1[1],0, P1[0],P1[1],0,Q0[0],Q0[1],0,Q1[0],Q1[1],0);
      }
      var gg=new THREE.BufferGeometry(); gg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
      var line=new THREE.Mesh(gg,new THREE.MeshBasicMaterial({color:color,transparent:true,opacity:.45,depthWrite:false,fog:false,side:THREE.DoubleSide}));
      line.visible=false;scene.add(line);rainbow.push(line);
    });
  }
  // 베들레헴의 별(마 2:9): 성탄 절기에 마구간 위에 머무는 큰 별
  var bStar = null;
  function makeBethlehemStar() {
    if (!FESTIVE || bStar) return;
    var c = document.createElement('canvas'); c.width = c.height = 128; var x = c.getContext('2d');
    var g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,245,1)'); g.addColorStop(.18, 'rgba(255,244,190,.95)'); g.addColorStop(.45, 'rgba(255,224,130,.35)'); g.addColorStop(1, 'rgba(255,210,100,0)');
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    x.fillStyle = 'rgba(255,255,235,.9)'; x.fillRect(62, 0, 4, 128); x.fillRect(0, 62, 128, 4);
    bStar = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, fog: false }));
    bStar.position.set(NAT_X + 5, G + 28, NAT_Z + 4); bStar.scale.set(12, 12, 1); bStar.renderOrder = 2; scene.add(bStar);
  }
  var snowNow = false, snowRegT = 0, snowRegOK = true;
  var pillar = null, pillarTold = false, mannaDay = -1, mannaTold = false, wildRegT = 0, inWild = false;
  function makePillar() {
    if (pillar) return;
    pillar = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 4.2, 70, 14, 1, true), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide }));
    pillar.position.set(HOREB_X + 0.5, horebY() + 40, HOREB_Z + 0.5); pillar.renderOrder = 2; scene.add(pillar);
  }
  var C_CLOUDP = new THREE.Color(0xf4f4f0), C_FIREP = new THREE.Color(0xff8a30);
  function stepWilderness(dt, dayF) {
    if (!started) return;
    if (!pillar) makePillar();
    pillar.material.color.copy(C_CLOUDP).lerp(C_FIREP, 1 - dayF); pillar.material.opacity = 0.42 + 0.35 * (1 - dayF);
    var dx = P.x - HOREB_X, dz = P.z - HOREB_Z;
    if (!pillarTold && dx * dx + dz * dz < 45 * 45) { pillarTold = true; showVerseCard(dayF > 0.5 ? '☁' : '🔥', dayF > 0.5 ? '구름 기둥' : '불 기둥', '여호와께서 그들 앞에서 가시며 낮에는 구름 기둥으로 그들의 길을 인도하시고 밤에는 불 기둥을 그들에게 비추사 낮이나 밤이나 진행하게 하시니', '출애굽기 13:21'); }
    wildRegT -= dt;
    if (wildRegT <= 0) { wildRegT = 1; var r0 = T.reg; terrain(Math.floor(P.x), Math.floor(P.z)); inWild = T.reg === 'desert' || T.reg === 'oasis'; T.reg = r0; }
    var p = (dayT % DAY_LEN) / DAY_LEN, day = Math.floor(dayT / DAY_LEN);
    if (inWild && p > 0.02 && p < 0.2 && mannaDay !== day && ui === 'play') {   // 아침에 광야에 있으면 만나가 내림(하루 한 번)
      mannaDay = day;
      for (var i = 0; i < 10; i++) {
        var a = Math.random() * 6.28, r = 3 + Math.random() * 9, mx = P.x + Math.cos(a) * r, mz = P.z + Math.sin(a) * r, gy = groundAt(mx, mz, SY - 3);
        if (gy === null) continue;
        dropItem(mx, gy + 0.2, mz, MANNA, 1); var o = DROPS[DROPS.length - 1]; if (o && o.id === MANNA) { o.thrown = true; o.manna = true; o.full = o.age; o.vy = 0; }
      }
      if (!mannaTold) { mannaTold = true; showVerseCard('🍯', '만나', '이스라엘 자손이 보고 그것이 무엇인지 알지 못하여 서로 이르되 이것이 무엇이냐 하니 모세가 그들에게 이르되 이는 여호와께서 너희에게 주어 먹게 하신 양식이라', '출애굽기 16:15', '깟씨 같이 희고 맛은 꿀 섞은 과자 같았더라 (출 16:31) — 땅에 내린 만나를 주워요'); }
    }
  }
  function updateDay(dt) {
    dayT += dt; LU.uTime.value = (LU.uTime.value + dt) % 600;
    var p = (dayT % DAY_LEN) / DAY_LEN, ang = p < 0.62 ? p / 0.62 * Math.PI : Math.PI + (p - 0.62) / 0.38 * Math.PI;
    var elev = Math.sin(ang), dayF = clamp01((elev + 0.12) / 0.34); dayF = dayF * dayF * (3 - 2 * dayF);
    var dusk = elev > -0.2 ? clamp01(1 - Math.abs(elev) / 0.28) : 0;
    // 거룩한 성 안: 다시 밤이 없음(계 22:5)
    if (started && STORY.done && cityInside(Math.floor(P.x), Math.floor(P.z))) { dayF = 1; dusk = 0; }
    // 비: 11/20 「날씨가 너무 자주 바뀌어」 — 맑은 날 6~12분, 비 1.5~3분, 비가 올지는 2분마다 한 번 봄
    rainTimer -= dt;
    var season=seasonIndex();
    if(lastSeason!==season){
      if(lastSeason!==-1){if(started)toast(['🌧 이른 비 철이에요 — 밭 작물이 빨리 자라요','☀ 맑은 철이에요','🌧 늦은 비 철이에요 — 작물이 가장 빨리 여물어요','🏜 가뭄이에요 — 물가 밭이 아니면 작물이 더디 자라요'][season]);}
      lastSeason=season;
    }
    if (rainTimer<=0) {
      if (rainOn) { rainOn=false;rainTimer=360+Math.random()*360;if(dayF>.6)rainbowUntil=dayT+44; }
      else if (noahWantsRain() || Math.random()<[.45,.12,.4,.04][season]) {rainOn=true;rainTimer=noahWantsRain()?30:90+Math.random()*90;storm=noahWantsRain()||Math.random()<.4;thunderT=6+Math.random()*8;}
      else rainTimer=120;
    }
    rain += ((rainOn ? 1 : 0) - rain) * Math.min(1, dt * 0.25);
    if (!rainOn) storm = false;
    if (started && storm && rain > 0.7 && !snowNow) { thunderT -= dt; if (thunderT <= 0) { thunderT = 9 + Math.random() * 22; thunderStrike(); } }
    flashK = Math.max(0, flashK - dt * 3.2);
    skyC.copy(C_NIGHT).lerp(C_DAY, dayF).lerp(C_DUSK, dusk * 0.5).lerp(C_RAIN, rain * 0.6 * dayF);
    scene.background.copy(skyC);
    fogC.copy(skyC).lerp(C_WHITE, 0.18 * dayF);
    scene.fog.color.copy(fogC); scene.fog.near = FOG_FAR * 0.65 * (1 - 0.2 * rain); scene.fog.far = FOG_FAR * (1 - 0.1 * rain);   // 11/21 안개를 멀리·옅게
    LU.uDay.value = (0.24 + 0.76 * dayF) * (1 - 0.22 * rain);
    if (flashK > 0) { var fk = flashK * (1 - caveK) * (flashK > 0.55 && flashK < 0.75 ? 0.35 : 1); LU.uDay.value = Math.min(1.25, LU.uDay.value + fk * 0.9); skyC.lerp(C_WHITE, fk * 0.75); scene.background.copy(skyC); }
    // 횃불·등을 손에 들면 내 둘레 7칸이 밝아짐(밤·굴에서)
    var hId = started ? HOTBAR[sel] : 0, hOn = hId && have(hId) > 0 && (hId === TORCH || (hId >= WTORCH && hId < WTORCH + 4) || hId === LANTERN || hId === LAMPSTAND + 1) ? 1 : 0;
    var hu = LU.uHand.value; hu.w += (hOn - hu.w) * Math.min(1, dt * 6); hu.x = P.x; hu.y = P.y + 2.4; hu.z = P.z;
    LU.uTint.value.copy(C_WHITE).lerp(C_NTINT, 1 - dayF).lerp(C_DTINT, dusk * 0.6);
    var ccx = Math.floor(camera.position.x), ccy = Math.floor(camera.position.y), ccz = Math.floor(camera.position.z);
    var cvT = started && skyLight(ccx, ccy, ccz) < 0.3 ? 1 : 0; caveK += (cvT - caveK) * Math.min(1, dt * 1.5);
    if (caveK > 0.01) scene.fog.color.lerp(C_CAVE, caveK * 0.9);
    if (heldMesh) heldMesh.material.color.setScalar(1 - caveK * 0.6);   // 굴 속에서는 손에 든 것도 어둡게
    avatarMat.color.setScalar(Math.max(0.32, LU.uDay.value) * (1 - caveK * 0.55));
    cloudMat.color.setRGB(0.30 + 0.65 * dayF, 0.345 + 0.61 * dayF, 0.45 + 0.475 * dayF); cloudMat.opacity = 0.6 + 0.28 * dayF;   // 11/21 밤 구름은 푸른 잿빛으로 옅게
    clouds.forEach(function (cl) {
      cl.position.x += dt * 1.5;
      if (cl.position.x - camera.position.x > 300) cl.position.x -= 600; else if (camera.position.x - cl.position.x > 300) cl.position.x += 600;
      if (cl.position.z - camera.position.z > 300) cl.position.z -= 600; else if (camera.position.z - cl.position.z > 300) cl.position.z += 600;
    });
    var cp = camera.position, dx = Math.cos(ang), dy = Math.sin(ang);
    sunM.position.set(cp.x + dx * 250, cp.y + dy * 250, cp.z - 70); sunM.lookAt(cp); sunM.visible = dy > -0.2 && rain < 0.7;
    moonM.position.set(cp.x - dx * 250, cp.y - dy * 250, cp.z + 70); moonM.lookAt(cp); moonM.visible = dy < 0.2; moonM.material.opacity = 1 - rain * 0.8;
    rainbow.forEach(function(line){
      line.visible=dayT<rainbowUntil&&rain<.32&&dayF>.55&&caveK<.3; if (line.visible) noahSawRainbow();
      if(line.visible)line.position.set(cp.x,Math.max(G+3,cp.y-26),cp.z-155);
    });
    stars.position.copy(cp); stars.material.opacity = (1 - dayF) * (1 - rain);
    if (bStar) bStar.material.opacity = 0.35 + 0.65 * (1 - dayF);
    stepWilderness(dt, dayF);
    if (brightStars) { brightStars.position.copy(cp); brightStars.material.opacity = Math.min(1, (1 - dayF) * 1.2) * (1 - rain); }
    // 밤에 하늘을 2초쯤 올려다보면 별 말씀 하나(밤마다 하나씩)
    var nightN = Math.floor(dayT / DAY_LEN);
    if (nightN !== starNight) { starNight = nightN; starLook = 0; }
    if (started && ui === 'play' && P.pitch > 0.7 && dayF < 0.3 && rain < 0.3 && caveK < 0.3) { if (starLook >= 0) { starLook += dt; if (starLook > 2) { starLook = -1; showStarVerse(nightN); } } }
    else if (starLook > 0) starLook = 0;
    // 빗줄기
    snowRegT -= dt; if (snowRegT <= 0) { snowRegT = 1; if (WINTER) { var reg0 = T.reg; terrain(Math.floor(cp.x), Math.floor(cp.z)); snowRegOK = T.reg !== 'desert' && T.reg !== 'oasis'; T.reg = reg0; } }
    var snowing = WINTER && snowRegOK;
    if (snowing !== snowNow) { snowNow = snowing; rainLines.material.color.setHex(snowing ? 0xffffff : 0xaabbd4); }
    rainLines.visible = rain > 0.03; rainLines.material.opacity = (snowing ? 0.95 : 0.5) * rain;
    if (rainLines.visible) {
      var rainCount = S.lightMode ? 240 : RAIN_N;
      for (var i = 0; i < rainCount; i++) {
        var o = i * 6;
        if (!rainPos[o + 1] && !rainPos[o]) respawnDrop(i, false);
        var fall = snowNow ? 6 : 42; rainPos[o + 1] -= fall * dt; rainPos[o + 4] = snowNow ? rainPos[o + 1] - 0.14 : rainPos[o + 4] - fall * dt;
        if (snowNow) { rainPos[o] += Math.sin(dayT * 1.3 + i) * 0.8 * dt; rainPos[o + 3] = rainPos[o] + 0.12; }
        var gx = Math.floor(rainPos[o]), gz = Math.floor(rainPos[o + 2]), top = skyAt(gx, gz);
        if (rainPos[o + 4] < top + 1 || rainPos[o + 4] < cp.y - 22 || Math.abs(rainPos[o] - cp.x) > 40 || Math.abs(rainPos[o + 2] - cp.z) > 40) respawnDrop(i, true);
      }
      rainLines.geometry.attributes.position.needsUpdate = true;
    }
    skyState.dayF = dayF; skyState.dusk = dusk;
  }

  // ───────── 배경 소리 ─────────
  var amb = null, ambTick = 0, nearWater = 0, underRoof = false, ambReg = '', ambSand = false, ambGrass = false, inCave = false, ambT = 0;
  function noiseLoop(type, freq, q) {
    var len = AC.sampleRate * 2, buf = AC.createBuffer(1, len, AC.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    var src = AC.createBufferSource(); src.buffer = buf; src.loop = true;
    var f = AC.createBiquadFilter(); f.type = type; f.frequency.value = freq; if (q) f.Q.value = q;
    var g = AC.createGain(); g.gain.value = 0;
    src.connect(f); f.connect(g); g.connect(AC.destination); src.start();
    return g;
  }
  // 번개: 하늘이 두 번 번쩍, 0.3~2.5초 뒤 우르릉(가까울수록 빨리·크게). 굴 속에선 빛은 안 보이고 소리만 작게
  function thunderStrike() {
    var near = Math.random(); flashK = 1; vibrate('thunder');
    setTimeout(function () { rumble(near); }, 300 + (1 - near) * 2200);
    if (!stormTold && ui === 'play') { stormTold = true; toast('⛈ 천둥 번개가 쳐요 — 지붕 밑이나 방주 안으로 피해요'); }
  }
  function rumble(near) {
    if (!AC || !S.sound) return;
    try {
      var vol = (0.25 + 0.45 * near) * (1 - caveK * 0.6), dur = 2.2 + (1 - near) * 1.6;
      var len = Math.floor(AC.sampleRate * dur), buf = AC.createBuffer(1, len, AC.sampleRate), d = buf.getChannelData(0), last = 0;
      for (var i = 0; i < len; i++) { var tt = i / len, env = (tt < 0.04 ? tt / 0.04 : Math.pow(1 - tt, 1.7)) * (0.7 + 0.3 * Math.sin(tt * 37) * Math.sin(tt * 11)); last = last * 0.96 + (Math.random() * 2 - 1) * 0.2; d[i] = last * env * 3; }
      var src = AC.createBufferSource(); src.buffer = buf;
      var f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 160 + near * 260;
      var g = AC.createGain(); g.gain.value = vol;
      src.connect(f); f.connect(g); g.connect(AC.destination); src.start();
      if (near > 0.7) { var b2 = AC.createBufferSource(), l2 = Math.floor(AC.sampleRate * 0.25), bb = AC.createBuffer(1, l2, AC.sampleRate), d2 = bb.getChannelData(0); for (var k = 0; k < l2; k++) d2[k] = (Math.random() * 2 - 1) * Math.pow(1 - k / l2, 3); b2.buffer = bb; var f2 = AC.createBiquadFilter(); f2.type = 'highpass'; f2.frequency.value = 900; var g2 = AC.createGain(); g2.gain.value = 0.35 * (1 - caveK * 0.7); b2.connect(f2); f2.connect(g2); g2.connect(AC.destination); b2.start(); }   // 가까우면 「쾅」
    } catch (e) {}
  }
  function tone(type, f0, f1, dur, vol, trem) {
    if (!AC || !S.sound) return;
    try {
      var t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain(), lp = AC.createBiquadFilter();
      o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.linearRampToValueAtTime(f1, t + dur);
      lp.type = 'lowpass'; lp.frequency.value = Math.max(f0, f1) * 3;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.03); g.gain.linearRampToValueAtTime(0, t + dur);
      o.connect(lp); lp.connect(g); g.connect(AC.destination);
      if (trem) { var l = AC.createOscillator(), lg = AC.createGain(); l.frequency.value = trem; lg.gain.value = vol * 0.6; l.connect(lg); lg.connect(g.gain); l.start(t); l.stop(t + dur); }
      o.start(t); o.stop(t + dur + 0.02);
    } catch (e) {}
  }
  // ── 악기: 놓은 높이에 따라 음이 달라진다(계단처럼 쌓으면 음계). 처음 연주하면 시편 150편 ──
  var INSTR = {}; INSTR[LYRE] = 1; INSTR[HARP] = 1; INSTR[TIMBREL] = 1; INSTR[CYMBAL] = 1;
  var INSTR_SCALE = [0, 2, 4, 7, 9, 12, 14, 16], instrTold = false;
  function playInstrument(id, x, y, z) {
    var note = INSTR_SCALE[((y % 8) + 8) % 8], f = 261.63 * Math.pow(2, note / 12);
    if (id === LYRE) { tone('triangle', f, f, 0.9, 0.16); tone('sine', f * 2, f * 2, 0.6, 0.05); }
    else if (id === HARP) { tone('triangle', f / 2, f / 2, 1.3, 0.16); tone('sine', f, f, 0.9, 0.05); }
    else if (id === TIMBREL) { tone('square', 180 + note * 6, 70, 0.16, 0.2); tone('sawtooth', 2400, 1800, 0.12, 0.03, 30); }
    else if (id === CYMBAL) { tone('sawtooth', 3600 + note * 40, 2600, 0.7, 0.05, 37); tone('square', 5200, 4200, 0.5, 0.025, 53); }
    swingT = 0.25;
    if (!instrTold) { instrTold = true; showVerseCard('🎵', B[id][0], '나팔 소리로 찬양하며 비파와 수금으로 찬양할지어다', '시편 150:3', '놓은 높이마다 음이 달라요. 계단처럼 쌓아 노래해 보세요'); }
  }
  function showVerseCard(emoji, name, text, ref, note) {
    $('cardEmoji').textContent = emoji; $('cardName').textContent = name; $('cardText').textContent = text; $('cardRef').textContent = ref; $('cardNew').textContent = note || '';
    $('card').classList.add('show'); sfx('pop'); clearTimeout(cardT); cardT = setTimeout(function () { $('card').classList.remove('show'); }, 10000);
  }
  function animalCall(k, vol) {
    vol = vol || 0.12;
    if (k === 'sheep') tone('sawtooth', 430, 400, 0.55, vol, 16);
    else if (k === 'goat') tone('sawtooth', 620, 560, 0.45, vol, 22);
    else if (k === 'cow') tone('sawtooth', 150, 115, 0.95, vol * 1.3);
    else if (k === 'camel') tone('square', 120, 95, 0.45, vol * 0.8, 9);
    else if (k === 'horse') tone('sawtooth', 820, 420, 0.7, vol, 28);
    else if (k === 'donkey') { tone('square', 620, 560, 0.35, vol * 0.8); setTimeout(function () { tone('square', 260, 220, 0.45, vol * 0.8); }, 380); }
    else if (k === 'dove') { tone('sine', 520, 470, 0.28, vol); setTimeout(function () { tone('sine', 500, 450, 0.36, vol); }, 330); }
    else if (k === 'pig') { tone('square', 180, 140, 0.18, vol * 0.8); setTimeout(function () { tone('square', 170, 130, 0.2, vol * 0.8); }, 220); }
    else if (k === 'chicken') { tone('square', 900, 1100, 0.08, vol * 0.6); setTimeout(function () { tone('square', 1000, 760, 0.16, vol * 0.6); }, 140); }
    else if (k === 'raven') { tone('square', 880, 700, 0.17, vol * 0.7); setTimeout(function () { tone('square', 860, 690, 0.17, vol * 0.7); }, 230); }
    else tone('sine', 900, 1300, 0.08, vol * 0.5);
  }
  function chirp() { var n = 2 + (Math.random() * 3 | 0), f = 2400 + Math.random() * 1400; for (var i = 0; i < n; i++) (function (i) { setTimeout(function () { tone('sine', f, f * 1.25, 0.07, 0.035); }, i * 110); })(i); }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function updateAmbient(dt) {
    if (!AC) return;
    if (!amb) { try { amb = { water: noiseLoop('bandpass', 520, 0.7), rain: noiseLoop('lowpass', 2400), wind: noiseLoop('lowpass', 380), leaves: noiseLoop('highpass', 3600), surf: noiseLoop('lowpass', 850) }; } catch (e) { amb = {}; return; } }
    ambT += dt;
    ambTick -= dt;
    if (ambTick <= 0) {
      ambTick = 0.5;
      var px = Math.floor(P.x), pz = Math.floor(P.z), best = 99;
      for (var dz = -16; dz <= 16; dz += 4) for (var dx = -16; dx <= 16; dx += 4) {
        var hx = px + dx, hz = pz + dz; if (hx < 0 || hz < 0 || hx >= SX || hz >= SZ) continue;
        terrain(hx, hz); if (T.wtop >= 0) best = Math.min(best, Math.hypot(dx, dz));
      }
      nearWater = clamp01(1 - best / 18);
      underRoof = skyAt(px, pz) > P.y + HT;
      var r0 = T.reg; terrain(px, pz); ambReg = T.reg; ambSand = T.top === SAND && T.reg !== 'sea' && T.reg !== 'lake'; ambGrass = T.top === GRASS; T.reg = r0;
      inCave = skyAt(px, pz) > P.y + HT + 3 && P.y < G - 2;   // 땅속 굴
      if (S.sound && started && ui === 'play' && inCave && Math.random() < 0.22) { var df = 1100 + Math.random() * 700; tone('sine', df, df * 0.6, 0.14, 0.035); }   // 굴 속 물방울
      // 새소리(낮), 풀벌레(밤), 가까운 동물 울음
      if (S.sound && started && ui === 'play') {
        if (skyState.dayF > 0.6 && rain < 0.3 && !underRoof && Math.random() < 0.09) chirp();
        if (skyState.dayF < 0.3 && rain < 0.3 && Math.random() < 0.18) tone('square', 4200, 4300, 0.05, 0.012);
        if (Math.random() < 0.25) {
          var nearA = null, nd = 16;
          animals.forEach(function (a) { var d = Math.hypot(a.x - P.x, a.z - P.z); if (d < nd) { nd = d; nearA = a; } });
          if (nearA && Math.random() < 0.35) animalCall(nearA.kind, 0.1 * (1 - nd / 16) + 0.02);
        }
      }
    }
    var on = S.sound && started ? 1 : 0, out = !inCave && !underRoof ? 1 : 0, high = clamp01((P.y - G - 14) / 30);
    // 지역마다 바람·나뭇잎·파도(천천히 바뀜)
    var tWind = on * (inCave ? 0 : (ambReg === 'desert' || ambReg === 'oasis' || ambSand ? 0.05 : 0.012 + 0.05 * high) * (underRoof ? 0.3 : 1));
    var tLeaves = on * out * (ambReg === 'east' && ambGrass && skyState.dayF > 0.3 && rain < 0.3 ? 0.016 : 0);
    var tSurf = on * (ambReg === 'sea' ? 0.07 * nearWater * (0.5 + 0.5 * Math.sin(ambT * 0.55)) : 0) * (inCave ? 0 : 1);
    var ka = Math.min(1, dt * 1.5);
    if (amb.wind) amb.wind.gain.value += (tWind - amb.wind.gain.value) * ka;
    if (amb.leaves) amb.leaves.gain.value += (tLeaves - amb.leaves.gain.value) * ka;
    if (amb.surf) amb.surf.gain.value += (tSurf - amb.surf.gain.value) * ka;
    if (amb.water) amb.water.gain.value = 0.05 * nearWater * on * (ambReg === 'sea' ? 0.4 : 1);
    if (amb.rain) amb.rain.gain.value = snowNow ? 0 : 0.07 * rain * on * (underRoof ? 0.4 : 1);   // 눈은 조용히
  }

  // ───────── 지도(공식으로 그려 두고, 조금씩 채운다) ─────────
  var MAPN = 2048, MSC = WS / MAPN, mapBase = document.createElement('canvas'), mapRow = 0, mapImg = null;
  mapBase.width = mapBase.height = MAPN;
  // 11/20 세계가 넓어져(4096) 지도를 32×32 조각으로 나눠 내 둘레 조각부터 조금씩(프레임마다 512점) 그림
  var MT = 32, MTN = MAPN / MT, mapDone = new Uint8Array(MTN * MTN), mapCur = -1, mapCurRow = 0, mapDoneN = 0, mapIdle = false;
  function mapTick() {
    if (mapDoneN >= MTN * MTN) { mapRow = MAPN; return; }
    var x = mapBase.getContext('2d');
    if (!mapImg) { mapImg = x.createImageData(MT, 1); x.fillStyle = '#3a4a3a'; x.fillRect(0, 0, MAPN, MAPN); }
    var budget = ui === 'map' ? 2048 : 512;   // 11/22 큰 지도를 연 동안은 네 배 빨리
    while (budget > 0) {
      if (mapCur < 0) {
        var ptx = Math.max(0, Math.min(MTN - 1, Math.floor(P.x / MSC / MT))), ptz = Math.max(0, Math.min(MTN - 1, Math.floor(P.z / MSC / MT))), best = -1, bd = 1e9;
        for (var t = 0; t < MTN * MTN; t++) { if (mapDone[t]) continue; var dx = t % MTN - ptx, dz = ((t / MTN) | 0) - ptz, d = dx * dx + dz * dz; if (d < bd) { bd = d; best = t; } }
        if (best < 0 || bd > (ui === 'map' ? 49 : 9)) { mapIdle = true; return; } mapIdle = false; mapCur = best; mapCurRow = 0;   // 작은 지도에 필요한 내 둘레(조각 3칸 ≈ 384칸)만
      }
      var tx = mapCur % MTN, tz = (mapCur / MTN) | 0, row = tz * MT + mapCurRow;
      for (var px = 0; px < MT; px++) {
        var wx = Math.floor((tx * MT + px + 0.5) * MSC), wz = Math.floor((row + 0.5) * MSC);
        terrain(wx, wz);
        var col = T.wtop >= 0 ? (T.wtop - T.h > 5 ? 0x2c62a8 : 0x3d7fc6) : TILE_AVG[BT[T.top][0]];
        var k = T.wtop >= 0 ? 1 : 0.82 + clamp01((T.h - G + 4) / 50) * 0.5, o = px * 4;
        mapImg.data[o] = clamp255(((col >> 16) & 255) * k); mapImg.data[o + 1] = clamp255(((col >> 8) & 255) * k); mapImg.data[o + 2] = clamp255((col & 255) * k); mapImg.data[o + 3] = 255;
      }
      x.putImageData(mapImg, tx * MT, row);
      budget -= MT;
      if (++mapCurRow >= MT) { mapDone[mapCur] = 1; mapDoneN++; mapCur = -1; }
    }
    mapRow = Math.floor(mapDoneN / (MTN * MTN) * MAPN);
  }
  var MAP_LABELS = [['⛵ 방주', XM, AZ0 + AW / 2], ['마을', XM, PZ0 + 112], ['🌲 동쪽 숲', VX1 + 80, PZ0 + 60], ['⛰ 서쪽 산', PX0 - 110, PZ0 + 60], ['🌊 호수', LX, LZ],
    ['역청 구덩이', TARR[0] + 18, TARR[1] - 12], ['🌊 북쪽 바다', XM, SEA_Z - 180], ['🐪 동쪽 사막', DES_X + 260, PZ0 - 80], ['🌴 오아시스', OASX, OASZ + 30], ['🏔 아라랏 산', ARX, ARZ - 30], ['🌾 남쪽 들판', XM, LZ + 260]];
  var FRIENDS = { accepted: new Set(), hidden: new Set(), rows: [], ready: false, busy: false, seq: 0, poll: 0 };
  function friendError(code) {
    return { login: '로그인하면 친구를 맺을 수 있어요', missing: '그 닉네임을 찾을 수 없어요',
      duplicate: '같은 닉네임이 여러 명이에요. 선생님에게 알려 주세요', self: '나에게는 신청할 수 없어요',
      existing: '이미 친구이거나 신청이 있어요', blocked: '이 사람에게는 신청할 수 없어요',
      daily: '오늘은 친구 신청을 다 보냈어요', pending: '기다리는 신청이 너무 많아요',
      gone: '신청이나 친구 기록이 이미 바뀌었어요' }[code] || '친구 기능을 아직 열 수 없어요. 조금 뒤에 다시 시도해 주세요';
  }
  function friendsFetch() {
    if (!client || !me || !NET.ok) return Promise.resolve();
    var seq = ++FRIENDS.seq;
    return client.rpc('get_ark_friends').then(function (r) {
      if (seq !== FRIENDS.seq) return;
      var d = r && r.data;
      FRIENDS.ready = !!d && !r.error && Array.isArray(d.rows);
      if (FRIENDS.ready) {
        FRIENDS.rows = d.rows;
        FRIENDS.accepted = new Set(d.rows.filter(function (v) { return v.status === 'accepted'; }).map(function (v) { return v.id; }));
        FRIENDS.hidden = new Set(d.hidden || []);
      }
      if (ui === 'friends') renderFriends();
    }, function () {
      if (seq !== FRIENDS.seq) return;
      FRIENDS.ready = false;
      if (ui === 'friends') renderFriends();
    });
  }
  function friendCall(rpc, args, message) {
    if (!me || !client || !NET.ok) { toast(friendError('login')); return; }
    if (FRIENDS.busy) return;
    FRIENDS.busy = true;
    client.rpc(rpc, args).then(function (r) {
      FRIENDS.busy = false;
      var d = r && r.data;
      if (!d || r.error || !d.ok) { toast(friendError(d && d.error)); friendsFetch(); return; }
      if (rpc === 'request_ark_friend') $('friendsNick').value = '';
      if (args.p_action === 'block') {
        FRIENDS.hidden.add(args.p_user); FRIENDS.accepted.delete(args.p_user);
        if (selectedMapPeer === args.p_user) { selectedMapPeer = ''; $('mapPerson').hidden = true; }
      }
      toast(message); friendsFetch();
    }, function () { FRIENDS.busy = false; toast(friendError()); });
  }
  function friendRequest(nick) {
    nick = nick.trim();
    if (!nick) { toast('친구의 닉네임을 적어 주세요'); return; }
    friendCall('request_ark_friend', { p_nick: nick }, '친구 신청을 보냈어요');
  }
  function openFriends() {
    if (!me) { toast(friendError('login')); return; }
    openPanel('friends'); fitMobileKeyboard(); renderFriends(); friendsFetch();
  }
  var recentPlayers = new Map();
  function fitMobileKeyboard() {
    if (isTouch && window.visualViewport) {
      document.body.style.setProperty('--game-visible-height', window.visualViewport.height + 'px');
    }
  }
  function rememberNearby(now) {
    if (!NET.on) return;
    for (var id in NET.peers) {
      var peer = NET.peers[id], nick = NET.names[id];
      if (peer.mapHidden || FRIENDS.hidden.has(id)) { recentPlayers.delete(id); continue; }
      if (nick && now - peer.t <= 6000 && Math.hypot(peer.tx - P.x, peer.tz - P.z) <= 160) {
        recentPlayers.delete(id);
        recentPlayers.set(id, { nick: nick, at: now });
      }
    }
    while (recentPlayers.size > 8) recentPlayers.delete(recentPlayers.keys().next().value);
  }
  function renderRecentPlayers() {
    var wrap = $('friendsRecent'), now = performance.now();
    var busy = new Set(FRIENDS.rows.map(function (row) { return row.id; }));
    var rows = Array.from(recentPlayers).reverse().filter(function (row) {
      return now - row[1].at <= 900000 && !busy.has(row[0]) && !FRIENDS.hidden.has(row[0]) &&
        !(NET.peers[row[0]] && NET.peers[row[0]].mapHidden);
    });
    wrap.replaceChildren();
    wrap.hidden = !FRIENDS.ready || !rows.length;
    if (wrap.hidden) return;
    var heading = document.createElement('h3'); heading.textContent = '최근 만난 사람'; wrap.appendChild(heading);
    rows.forEach(function (row) {
      var line = document.createElement('div'); line.className = 'vrow';
      var name = document.createElement('span'); name.textContent = row[1].nick;
      var button = document.createElement('button'); button.className = 'mc'; button.textContent = '신청';
      button.addEventListener('click', function () {
        if (!FRIENDS.hidden.has(row[0]) && !(NET.peers[row[0]] && NET.peers[row[0]].mapHidden)) friendRequest(row[1].nick);
      });
      line.append(name, button); wrap.appendChild(line);
    });
  }
  function renderFriends() {
    renderRecentPlayers();
    var body = $('friendsBody');
    body.replaceChildren();
    if (!FRIENDS.ready) { body.textContent = '친구 목록을 아직 열 수 없어요'; return; }
    var actions = { accept: ['받기','친구가 됐어요'], decline: ['거절','신청을 거절했어요'],
      remove: ['친구 삭제','친구 목록에서 뺐어요'], cancel: ['신청 취소','보낸 신청을 취소했어요'],
      block: ['차단','이 사람을 차단했어요'], unblock: ['차단 풀기','차단을 풀었어요'] };
    [['incoming','받은 신청',['accept','decline','block']], ['outgoing','보낸 신청',['cancel','block']],
     ['accepted','내 친구',['remove','block']], ['blocked','차단한 사람',['unblock']]].forEach(function (group) {
      var heading = document.createElement('h3'); heading.textContent = group[1]; body.appendChild(heading);
      var rows = FRIENDS.rows.filter(function (r) { return r.status === group[0]; });
      if (!rows.length) { var empty = document.createElement('p'); empty.textContent = '아직 없어요'; body.appendChild(empty); }
      rows.forEach(function (r) {
        var row = document.createElement('div'); row.className = 'vrow';
        var name = document.createElement('span'); name.textContent = r.nick; row.appendChild(name);
        group[2].forEach(function (action) {
          var b = document.createElement('button'); b.className = 'mc'; b.textContent = actions[action][0];
          b.addEventListener('click', function () {
            friendCall('change_ark_friend', { p_user: r.id, p_action: action }, actions[action][1]);
          });
          row.appendChild(b);
        });
        body.appendChild(row);
      });
    });
  }
  var mapPeople = [], selectedMapPeer = '';
  function mapPeerColor(u) {
    return partyMate(u) ? '#a7e86e' : (FRIENDS.accepted.has(u) ? '#67c6ff' : '#c0c6cd');
  }
  function drawMapPeople(ctx, big, ox, oz, scale, w, h) {
    var now = performance.now(), shown = [];
    if (NET.on) for (var u in NET.peers) {
      var p = NET.peers[u];
      if (!NET.names[u] || p.mapHidden || FRIENDS.hidden.has(u) || now - p.t > 6000 ||
          !Number.isFinite(p.tx) || !Number.isFinite(p.tz) || Math.hypot(p.tx - P.x, p.tz - P.z) > 160) continue;
      var x = (Math.round(p.tx / 4) * 4 - ox) * scale;
      var y = (Math.round(p.tz / 4) * 4 - oz) * scale;
      if (x < 0 || x > w || y < 0 || y > h) continue;
      shown.push({ u: u, x: x, y: y, color: mapPeerColor(u) });
    }
    shown.sort(function (a, b) {
      return Math.hypot(a.x - (P.x-ox)*scale, a.y - (P.z-oz)*scale) -
             Math.hypot(b.x - (P.x-ox)*scale, b.y - (P.z-oz)*scale);
    });
    shown = shown.slice(0, 48);
    drawMapPings(ctx, big, ox, oz, scale);
    shown.forEach(function (dot) {
      ctx.beginPath(); ctx.arc(dot.x, dot.y, big ? 5 : 3, 0, Math.PI * 2);
      ctx.fillStyle = dot.color; ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = '#26302a'; ctx.stroke();
    });
    if (big) {
      mapPeople = shown;
      var active = shown.some(function (dot) { return dot.u === selectedMapPeer; });
      $('mapPerson').hidden = !active;
      if (!active) selectedMapPeer = '';
      else $('mapFriend').hidden = !canRequestMapFriend(selectedMapPeer);
    }
  }
  function canRequestMapFriend(id) {
    return FRIENDS.ready && !FRIENDS.hidden.has(id) && !FRIENDS.rows.some(function (row) { return row.id === id; });
  }
  // 11/20 길 안내 창의 「지금 함께 있는 사람」: 큰 지도 대신 목록에서 친구 신청·파티 초대
  var mapPeopleKey = '';
  function renderMapPeople(force) {
    var box = $('mapPeople'); if (!box) return;
    var who = me ? Object.keys(NET.meta).filter(function (u) { return u !== me.id; }) : [];
    var rows = who.map(function (u) {
      var p = NET.peers[u], d = p && !p.mapHidden ? Math.round(Math.hypot(p.x - P.x, p.z - P.z) / 10) * 10 : -1;
      var fr = FRIENDS.accepted.has(u) ? 'f' : (FRIENDS.hidden.has(u) ? 'h' : (FRIENDS.rows.some(function (r) { return r.id === u; }) ? 'p' : ''));
      return { u: u, nm: NET.names[u] || '친구', d: d, fr: fr, pm: partyMate(u) };
    }).sort(function (a, b) { return (a.d < 0 ? 1e9 : a.d) - (b.d < 0 ? 1e9 : b.d); });
    var key = (me && NET.ok ? 'on' : 'off') + '|' + FRIENDS.ready + '|' + rows.map(function (r) { return [r.u, r.nm, r.d, r.fr, r.pm].join(','); }).join(';');
    if (!force && key === mapPeopleKey) return; mapPeopleKey = key;
    box.innerHTML = '';
    var h = document.createElement('div'); h.className = 'sh'; h.style.fontSize = '13px'; h.textContent = '👥 지금 함께 있는 사람 ' + rows.length + '명 — 🤝 친구 신청 · 🧭 파티 초대'; box.appendChild(h);
    if (!me || !NET.ok) { var e0 = document.createElement('div'); e0.className = 'empty'; e0.textContent = '로그인하면 친구 신청·파티 초대를 할 수 있어요'; box.appendChild(e0); return; }
    if (!FRIENDS.ready) friendsFetch();
    if (!rows.length) { var e1 = document.createElement('div'); e1.className = 'empty'; e1.textContent = '지금 접속한 다른 사람이 없어요'; box.appendChild(e1); return; }
    rows.slice(0, 12).forEach(function (r) {
      var row = document.createElement('div'); row.className = 'prow';
      var t = document.createElement('span'); t.textContent = '🧑 ' + shortName(r.nm, 8) + (r.d >= 0 ? ' · ' + r.d + '칸' : ''); row.appendChild(t);
      function b(label, fn, off) { var x = document.createElement('button'); x.className = 'mc'; x.textContent = label; x.disabled = !!off; if (fn) x.addEventListener('click', function (ev) { ev.stopPropagation(); sfx('click'); fn(); setTimeout(function () { renderMapPeople(true); }, 900); }); row.appendChild(x); }
      if (r.fr === 'f') b('✓ 친구', null, true);
      else if (r.fr === 'p') b('신청함', null, true);
      else if (r.fr !== 'h') b('🤝 친구', function () { friendRequest(r.nm); });
      if (r.pm) b('✓ 파티', null, true);
      else b('🧭 파티', function () { partyCall('party_invite', { p_to: r.u }, '🤝 초대를 보냈어요 (10분 안에 받아야 해요)'); });
      box.appendChild(row);
    });
  }
  function selectMapPerson(event) {
    var cv = $('bigmapc'), rect = cv.getBoundingClientRect(), hit = null, best = isTouch ? 23 : 16;
    mapPeople.forEach(function (dot) {
      var d = Math.hypot(dot.x * rect.width / cv.width + rect.left - event.clientX,
        dot.y * rect.height / cv.height + rect.top - event.clientY);
      if (d < best) { best = d; hit = dot; }
    });
    selectedMapPeer = hit ? hit.u : '';
    $('mapPerson').hidden = !hit;
    if (hit) {
      $('mapPersonName').textContent = NET.names[hit.u];
      $('mapFriend').hidden = !canRequestMapFriend(hit.u);
    }
  }
  // 작은 지도: 내 둘레 320칸 / 큰 지도: 온 세계
  function drawMap(cv, big) {
    if (!cv) return;
    var x = cv.getContext('2d'), w = cv.width, h = cv.height;
    x.setTransform(1, 0, 0, 1, 0, 0); x.imageSmoothingEnabled = false;
    rememberNearby(performance.now());
    // 11/22 큰 지도: 세계 전체(4096칸) 대신 내 둘레 1600칸 — 그려 둔 내 둘레만 작게 보이던 것을 고침
    var span = big ? 1600 : 320, ox = big ? Math.max(0, Math.min(WS - span, P.x - span / 2)) : P.x - span / 2, oz = big ? Math.max(0, Math.min(WS - span, P.z - span / 2)) : P.z - span / 2, sc = w / span;
    x.fillStyle = '#26302a'; x.fillRect(0, 0, w, h);
    x.drawImage(mapBase, ox / MSC, oz / MSC, span / MSC, span / MSC, 0, 0, w, h);
    function R(wx, wz, ww, wh, col, lw) { x.strokeStyle = col; x.lineWidth = lw; x.strokeRect((wx - ox) * sc, (wz - oz) * sc, ww * sc, wh * sc); }
    x.fillStyle = '#4a3424'; x.fillRect((AX0 - ox) * sc, (AZ0 - oz) * sc, AL * sc, AW * sc);
    if (!big) for (var i = 0; i < PCOLS * PROWS; i++) { var po = plotOrigin(i); R(po.x, po.z, PLOT, PLOT, 'rgba(255,255,255,.35)', 1); }
    else R(PX0, PZ0, VX1 - PX0, VZ1 - PZ0, 'rgba(255,255,255,.6)', 1);
    if (myPlot >= 0) { var o = plotOrigin(myPlot); R(o.x, o.z, PLOT, PLOT, '#ffd84a', big ? 2 : 2); }
    if (big) {
      x.font = '13px Galmuri11, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
      MAP_LABELS.forEach(function (l) { var lx = (l[1] - ox) * sc, ly = (l[2] - oz) * sc; x.fillStyle = 'rgba(0,0,0,.55)'; var tw = x.measureText(l[0]).width + 10; x.fillRect(lx - tw / 2, ly - 10, tw, 20); x.fillStyle = '#fff'; x.fillText(l[0], lx, ly); });
      if (!mapIdle && mapRow < MAPN) { x.fillStyle = 'rgba(0,0,0,.5)'; x.fillRect(0, h - 22, w, 22); x.fillStyle = '#fff'; x.fillText('지도를 그리는 중…', w / 2, h - 11); }
    }
    drawMapRails(x, ox, oz, sc, w, h); drawMapBed(x, big, ox, oz, sc);
    drawMapPeople(x, big, ox, oz, sc, w, h);
    drawVillagePins(x, ox, oz, sc, w, h);
    drawFrontierMap(x,big,ox,oz,sc);
    if (forestRoute) {
      x.save();
      x.strokeStyle = '#ffdb61'; x.lineWidth = big ? 3 : 2; x.setLineDash([5, 4]);
      x.beginPath(); x.moveTo((P.x - ox) * sc, (P.z - oz) * sc);
      forestRoute.forEach(function (point) { x.lineTo((point[0] - ox) * sc, (point[1] - oz) * sc); });
      x.stroke(); x.restore();
    }
    var mx = (P.x - ox) * sc, mz = (P.z - oz) * sc, r = big ? 7 : 5;
    x.save(); x.translate(mx, mz); x.rotate(-P.yaw);
    x.beginPath(); x.moveTo(0, -r * 1.3); x.lineTo(r * 0.8, r); x.lineTo(-r * 0.8, r); x.closePath();
    x.fillStyle = '#ff4040'; x.fill(); x.lineWidth = 1.5; x.strokeStyle = '#fff'; x.stroke(); x.restore();
  }

  // ───────── 가까운 곳 만들고 지우기 ─────────
  var R_MESH = isTouch ? 5 : 7, R_GEN = R_MESH + 1, R_DROP = R_MESH + 4;
  function applyLightMode() {
    var radius = S.lightMode ? 4 : (isTouch ? 5 : 7);
    R_MESH = radius; R_GEN = radius + 1; R_DROP = radius + 4;
    FOG_FAR = radius * CS - 6;
    if (!renderer || !camera) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, S.lightMode ? 1 : (isTouch ? 1.6 : 2)));
    scene.fog.near = FOG_FAR * .65;
    scene.fog.far = FOG_FAR;
    camera.far = FOG_FAR + 60;
    if (rainLines) rainLines.geometry.setDrawRange(0, (S.lightMode ? 240 : RAIN_N) * 2);
    resize();
  }
  var meshedCols = new Uint8Array(NC * NC), OFFS = [];
  for (var odz = -11; odz <= 11; odz++) for (var odx = -11; odx <= 11; odx++) OFFS.push([odx, odz, odx * odx + odz * odz]);
  OFFS.sort(function (a, b) { return a[2] - b[2]; });
  function inWorldC(cx, cz) { return cx >= 0 && cz >= 0 && cx < NC && cz < NC; }
  function columnReady(cx, cz) {
    for (var dz = -1; dz <= 1; dz++) for (var dx = -1; dx <= 1; dx++) { var x = cx + dx, z = cz + dz; if (inWorldC(x, z) && !COLS[z * NC + x]) return false; }
    return true;
  }
  function meshColumn(cx, cz) { for (var cy = CYMIN; cy < CY; cy++) buildChunk(cx, cy, cz); meshedCols[cz * NC + cx] = 1; delete meshProg[cz * NC + cx]; }
  // 걸어 다닐 때는 기둥 하나를 높이 조각(3개)으로 나눠 프레임마다 한 조각씩 그린다(느린 휴대폰에서 끊기지 않게)
  var meshProg = {};
  function meshStep(cx, cz) { var k = cz * NC + cx, c = meshProg[k] !== undefined ? meshProg[k] : CYMIN; buildChunk(cx, c, cz); if (++c >= CY) { meshedCols[k] = 1; delete meshProg[k]; } else meshProg[k] = c; }
  function unmeshColumn(cx, cz) {
    for (var cy = CYMIN; cy < CY; cy++) { var key = cx + ',' + cy + ',' + cz, old = chunks[key]; if (old) { old.forEach(function (m) { scene.remove(m); m.geometry.dispose(); }); delete chunks[key]; } }
    meshedCols[cz * NC + cx] = 0; delete meshProg[cz * NC + cx];
  }
  function newColumn(cx, cz) { genColumn(cx, cz); spawnColumn(cx, cz); }
  // 바로 필요할 때(처음, 순간 이동): 그 둘레를 한꺼번에
  function ensureAround(x, z, r) {
    if (isTouch) r = Math.max(1, r - 1);   // 휴대폰: 바로 밟을 곳만 먼저 만들고 나머지는 걸으며 채운다(한꺼번에 만들면 몇 초씩 멈춤)
    var pcx = Math.floor(x / CS), pcz = Math.floor(z / CS), dx, dz;
    for (dz = -r - 1; dz <= r + 1; dz++) for (dx = -r - 1; dx <= r + 1; dx++) { var cx = pcx + dx, cz = pcz + dz; if (inWorldC(cx, cz) && !COLS[cz * NC + cx]) newColumn(cx, cz); }
    for (dz = -r; dz <= r; dz++) for (dx = -r; dx <= r; dx++) { var mx = pcx + dx, mz = pcz + dz; if (inWorldC(mx, mz) && !meshedCols[mz * NC + mx] && columnReady(mx, mz)) meshColumn(mx, mz); }
  }
  var dropT = 0;
  var streamFlip = false;
  function streamTick(px, pz, dt) {
    var pcx = Math.floor(px / CS), pcz = Math.floor(pz / CS), t0, i, o, cx, cz;
    // 땅 만들기와 모양 만들기를 한 프레임에 같이 하지 않고 번갈아 한다(둘 다 하면 느린 폰에서 한 프레임이 100ms를 넘음)
    function genPass() {
      var did = false; t0 = performance.now();
      for (i = 0; i < OFFS.length; i++) {
        o = OFFS[i]; if (o[2] > R_GEN * R_GEN) break;
        cx = pcx + o[0]; cz = pcz + o[1];
        if (inWorldC(cx, cz) && !COLS[cz * NC + cx]) { newColumn(cx, cz); did = true; if (performance.now() - t0 > 6) break; }
      }
      return did;
    }
    function meshPass() {
      var did = false; t0 = performance.now();
      for (i = 0; i < OFFS.length; i++) {
        o = OFFS[i]; if (o[2] > R_MESH * R_MESH) break;
        cx = pcx + o[0]; cz = pcz + o[1];
        if (inWorldC(cx, cz) && !meshedCols[cz * NC + cx] && COLS[cz * NC + cx] && columnReady(cx, cz)) { meshStep(cx, cz); did = true; if (performance.now() - t0 > 7) break; }
      }
      return did;
    }
    streamFlip = !streamFlip;
    var didGen = streamFlip ? genPass() : false;
    var didMesh = didGen ? false : meshPass();
    if (!streamFlip && !didMesh) genPass();
    dropT -= dt;
    if (dropT <= 0) {
      dropT = 1;
      for (var k = 0; k < NC * NC; k++) {
        if (!COLS[k] && !meshedCols[k]) continue;
        var kx = k % NC, kz = (k - kx) / NC, d2 = (kx - pcx) * (kx - pcx) + (kz - pcz) * (kz - pcz);
        if ((meshedCols[k] || meshProg[k]) && d2 > (R_MESH + 2) * (R_MESH + 2)) unmeshColumn(kx, kz);
        if (COLS[k] && d2 > R_DROP * R_DROP) COLS[k] = null;   // 고친 자리는 EDITS에 있어 다시 만들 때 살아남
      }
      despawnFar(px, pz);
    }
  }
  // 기둥이 생길 때 그 땅에 맞는 동물·물고기
  var fishGeos = null;
  function spawnColumn(cx, cz) {
    var x0 = cx * CS, z0 = cz * CS;
    terrain(x0 + 16, z0 + 16);
    var reg = T.reg, i;
    if (inTown(x0 + 16, z0 + 16) || reg === 'tar') return;
    if (!fishGeos) {
      fishGeos = [0xa8b8c4, 0xe0884a, 0x8aa66a, 0xc4c8a0].map(function (c) { return mergedBoxes([[0.32, 0.45, 1.0, c, 0, 0, 0], [0.08, 0.42, 0.35, c, 0, 0, 0.65], [0.06, 0.08, 0.08, 0x111111, 0.17, 0.08, -0.35], [0.06, 0.08, 0.08, 0x111111, -0.17, 0.08, -0.35]]); });
    }
    for (i = 0; i < 4; i++) {
      var fx = x0 + 2 + Math.floor(hash2(cx * 5 + i, cz, 41) * 28), fz = z0 + 2 + Math.floor(hash2(cx, cz * 5 + i, 42) * 28);
      terrain(fx, fz);
      if (T.wtop < 0 || T.wtop - T.h < 1 || hash2(fx, fz, 43) > 0.6) continue;
      var m = new THREE.Mesh(fishGeos[i % 4], avatarMat); scene.add(m);
      fishes.push({ kind: 'fish', mesh: m, x: fx + 0.5, y: T.h + 1 + Math.min(T.wtop - T.h - 1, 1) + 0.5, z: fz + 0.5, h: hash2(fx, fz, 44) * 6.28, spd: 1.2 + hash2(fx, fz, 45) * 1.2, t: 0 });
    }
    terrain(x0 + 16, z0 + 16);
    var kinds = reg === 'desert' ? ['camel', 'camel', 'donkey'] : (reg === 'west' || reg === 'ararat' ? ['goat', 'goat', 'sheep', 'donkey'] : (reg === 'sea' || reg === 'lake' || reg === 'oasis' ? (reg === 'oasis' ? ['camel', 'donkey'] : []) :
      (reg === 'taiga' ? ['goat', 'rabbit', 'sheep'] : reg === 'hermon' ? ['goat'] : reg === 'galilee' ? ['sheep', 'cow', 'pig', 'chicken'] : reg === 'jordan' ? ['sheep', 'donkey', 'chicken'] : reg === 'swamp' ? ['frog', 'frog', 'frog', 'cow'] : reg === 'snow' ? ['goat', 'rabbit', 'sheep'] : reg === 'shinar' ? ['sheep', 'camel', 'donkey', 'cow'] : reg === 'egyptland' ? ['camel', 'frog', 'cow', 'donkey'] : reg === 'sinai' ? ['camel', 'goat'] : (reg === 'southsea' || reg === 'sisle') ? [] : reg === 'meadow' ? ['sheep', 'cow', 'horse', 'rabbit', 'donkey', 'sheep'] :
      (reg === 'cedar' ? ['sheep', 'goat', 'rabbit'] : (reg === 'wild' ? ['goat', 'donkey', 'camel'] : (reg === 'salt' ? ['goat'] : ['sheep', 'goat', 'cow', 'rabbit', 'sheep', 'cow', 'rabbit', 'horse', 'horse', 'donkey', 'pig', 'chicken', 'chicken']))))));
    // 11/20 동물이 너무 많아 반쯤으로(한 무리 1~2마리, 기둥 열에 하나꼴), 가까이 40마리가 넘으면 더 만들지 않음
    wildSpawn(cx, cz, x0, z0, reg);   // 11/24 맹수
    if (!kinds.length || animals.length > 40 || hash2(cx, cz, 31) > (reg === 'desert' ? 0.07 : 0.14)) return;
    var kn = kinds[Math.floor(hash2(cx, cz, 32) * kinds.length)], n = 1 + Math.floor(hash2(cx, cz, 33) * 2);
    for (i = 0; i < n; i++) {
      var hx = x0 + 4 + hash2(cx + i, cz, 34) * 24, hz = z0 + 4 + hash2(cx, cz + i, 35) * 24;
      if (inTown(hx | 0, hz | 0) || plotAt(hx | 0, hz | 0) >= 0) continue;
      var gy = groundAt(hx, hz, SY - 3); if (gy === null) continue;
      terrain(hx | 0, hz | 0); if (gy !== T.h + 1 || T.wtop >= 0 || inCity(hx | 0, hz | 0) || farCityAt(hx | 0, hz | 0, 6)) continue;   // 자연 땅 위에만(성벽·지붕·나무 위 금지)
      var ad = makeBeast(kn, hx, hz); animals.push(ad);
      if (hash2(cx + i, cz, 36) < 0.45) {   // 11/21 새끼도 들에(어미를 따라다니지 않고 따로 거닒, 5분 뒤 다 자람)
        var bx = hx + 1.2, bz = hz + 0.8, bgy = groundAt(bx, bz, SY - 3);
        if (bgy !== null && Math.abs(bgy - gy) <= 1) { var bb = makeBeast(kn, bx, bz); bb.baby = true; bb.growAt = Date.now() + 300000; bb.mesh.scale.setScalar(0.55); animals.push(bb); }
      }
    }
  }
  function despawnFar(px, pz) {
    var far = (R_DROP * CS) * (R_DROP * CS);
    animals = animals.filter(function (a) { var ok = a.saddled || a.kept || a.tamed || (a.x - px) * (a.x - px) + (a.z - pz) * (a.z - pz) < far; if (!ok) scene.remove(a.mesh); return ok; });
    fishes = fishes.filter(function (f) { var ok = (f.x - px) * (f.x - px) + (f.z - pz) * (f.z - pz) < far; if (!ok) scene.remove(f.mesh); return ok; });
  }

