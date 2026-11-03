(function(){
  // 빌드본에서는 window.__ASSETS 에 base64 data URI 가 들어 있다(file:// 보안 제한 회피).
  const A = name => (window.__ASSETS && window.__ASSETS[name]) || name;
  const SHOW_PERF = /[?&]fps\b/.test(location.search);
  // 로딩 화면 로고(이미지가 있으면 글자 대신)
  { const li = document.getElementById('logo-img'); li.onload = () => { li.style.display = 'block'; document.getElementById('logo-text').style.display = 'none'; }; li.src = A('ui/logo-small.png'); document.getElementById('rotate-logo').src = A('ui/logo-small.png'); }

  // ── 기본 세팅 ──────────────────────────────────────────
  const wrap = document.getElementById('canvas-wrap');
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf2c988);
  scene.fog = new THREE.FogExp2(0xf2c988, 0.018);

  const camera = new THREE.PerspectiveCamera(58, window.innerWidth/window.innerHeight, 0.1, 500);

  const renderer = new THREE.WebGLRenderer({ antialias:true, powerPreference:'high-performance' });
  // ── 화질(저·중·고) — 폰 성능에 맞춰 해상도·그림자·먼 사람 동작 계산을 조절 ──
  // 자동(기본): 처음엔 고화질로 시작해 몇 초 재 보고 느리면 한 단계씩 낮춤. 설정(⚙️)에서 직접 고를 수도 있음.
  const QUALITY = {
    low:  { name: '저화질', pr: 1.0,  shadow: false, soft: false, animNear: 8,  animFar: 18, farSkip: 3, aiSkip: 3 },
    mid:  { name: '중화질', pr: 1.25, shadow: true,  soft: false, animNear: 10, animFar: 24, farSkip: 2, aiSkip: 2 },
    high: { name: '고화질', pr: 1.5,  shadow: true,  soft: true,  animNear: 12, animFar: 30, farSkip: 2, aiSkip: 1 },
  };
  const QKEY = 'inodyssey-quality';
  let qMode = 'auto', qLevel = 'high';
  try { const v = JSON.parse(localStorage.getItem(QKEY) || 'null'); if (v){ qMode = v.mode || 'auto'; qLevel = QUALITY[v.level] ? v.level : 'high'; } } catch (e){}
  { const f = (location.search.match(/[?&]q=(low|mid|high)/) || [])[1]; if (f){ qMode = f; qLevel = f; } }   // 확인용: ?q=low
  let Q = QUALITY[qLevel];
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, Q.pr));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = Q.soft ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
  wrap.appendChild(renderer.domElement);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ── 조명: 노을빛 사막 톤 ────────────────────────────────
  const hemi = new THREE.HemisphereLight(0xffe3b0, 0xb56a3a, 0.9);
  scene.add(hemi);

  // 그림자는 플레이어 주변만 선명하면 되므로, 좁은 그림자 카메라가 플레이어를 따라다닌다(1024 해상도로 충분).
  const sun = new THREE.DirectionalLight(0xffedc2, 1.6);
  const SUN_OFFSET = new THREE.Vector3(30, 40, 20);
  sun.castShadow = Q.shadow;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -14; sun.shadow.camera.right = 14;
  sun.shadow.camera.top = 14; sun.shadow.camera.bottom = -14;
  sun.shadow.camera.far = 120;
  sun.shadow.bias = -0.0015;
  sun.shadow.normalBias = 0.03;
  scene.add(sun);
  scene.add(sun.target);

  // 부드러운 그라데이션 하늘 (스카이돔)
  const skyGeo = new THREE.SphereGeometry(400, 32, 16);
  // 하늘: 높이 그라데이션 + 해(원반·빛무리) + 천천히 흐르는 구름(fbm 노이즈) + 별(두루마리마을)
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite:false, fog:false,
    uniforms: {
      top: { value: new THREE.Color(0xffb877) }, bottom: { value: new THREE.Color(0xffe9c2) },
      sunDir: { value: new THREE.Vector3(0.3, 0.25, -0.9).normalize() }, sunCol: { value: new THREE.Color(0xfff2d0) },
      cloudCol: { value: new THREE.Color(0xffffff) }, cloud: { value: 0.5 }, stars: { value: 0 }, time: { value: 0 }
    },
    vertexShader: `varying vec3 vPos; void main(){ vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `
      varying vec3 vPos; uniform vec3 top, bottom, sunDir, sunCol, cloudCol; uniform float cloud, stars, time;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
        return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
      float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
      void main(){
        vec3 d = normalize(vPos);
        float h = clamp(d.y, 0.0, 1.0);
        vec3 col = mix(bottom, top, pow(h, 0.55));
        float sd = max(dot(d, sunDir), 0.0);
        col += sunCol * (pow(sd, 8.0) * 0.35 + pow(sd, 90.0) * 0.8) + sunCol * smoothstep(0.9985, 0.9993, sd);
        if (d.y > 0.0){
          vec2 uv = d.xz / (d.y + 0.25) * 1.6 + vec2(time * 0.012, time * 0.004);
          float c = smoothstep(0.52 - cloud * 0.22, 0.85, fbm(uv));
          float shade = fbm(uv * 1.8 + 3.0);
          col = mix(col, cloudCol * (0.82 + 0.28 * shade) + sunCol * pow(sd, 6.0) * 0.25, c * cloud * smoothstep(0.0, 0.18, d.y));
          if (stars > 0.0){
            vec2 g = floor(d.xz / (d.y + 0.35) * 90.0);
            float st = step(0.9965, hash(g)) * (0.6 + 0.4 * sin(time * 2.0 + hash(g + 7.0) * 30.0));
            col += vec3(1.0, 0.96, 0.88) * st * stars * smoothstep(0.12, 0.5, d.y) * (1.0 - c * cloud);
          }
        }
        gl_FragColor = vec4(col, 1.0);
      }`
  });
  const sky = new THREE.Mesh(skyGeo, skyMat);
  scene.add(sky);
  const farMat = new THREE.MeshBasicMaterial({ transparent: true, fog: false, side: THREE.BackSide, depthWrite: false, alphaTest: 0.02 });
  const farRing = new THREE.Mesh(new THREE.CylinderGeometry(230, 230, 58, 48, 1, true), farMat);
  farRing.position.y = 16; farRing.visible = false; scene.add(farRing);
  const farTex = {};
  function setFar(name){
    if (!name){ farRing.visible = false; return; }
    if (!farTex[name]){ const t = new THREE.TextureLoader().load(A(`ui/game/${name}.png`)); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; t.repeat.set(3, 1); farTex[name] = t; }
    farMat.map = farTex[name]; farMat.needsUpdate = true; farRing.visible = true;
  }

  // ── 바로의 궁전 알현실(애굽 마을, 궁전 본채 뒤의 넓은 방) ──
  // 궁전 입구로 들어가면 이 방으로 옮겨 온다. 이 사각형 안은 바닥이 평평하다.
  const THRONE_ROOM = { x0: 51, x1: 69, z0: -54, z1: -30, H: 9.5, h: 0 };
  THRONE_ROOM.h = rawHeight(60, -42);
  const inRoom = (x, z) => x > THRONE_ROOM.x0 && x < THRONE_ROOM.x1 && z > THRONE_ROOM.z0 && z < THRONE_ROOM.z1;
  // 이야기 속 자리: 바로는 왕좌 앞, 모세·아론은 궁전 정문 앞(GATE) 또는 알현실 안 바로 앞(ROOM)
  const THRONE_PH = [60, -48.4];
  const GATE_POS = { pharaoh: THRONE_PH, moses: [25.5, -11.5], aaron: [27.5, -10.2] };
  const ROOM_POS = { pharaoh: THRONE_PH, moses: [58.6, -44.6], aaron: [61.4, -44.3] };

  // ── 바닥: 부드러운 저폴리 사막 지형 ──────────────────────
  const groundSize = 140, groundSeg = 80;
  const groundGeo = new THREE.PlaneGeometry(groundSize, groundSize, groundSeg, groundSeg);
  groundGeo.rotateX(-Math.PI/2);
  const posAttr = groundGeo.attributes.position;
  for (let i=0;i<posAttr.count;i++){
    const x = posAttr.getX(i), z = posAttr.getZ(i);
    posAttr.setY(i, heightAt(x, z));
  }
  groundGeo.computeVertexNormals();

  const groundMat = new THREE.MeshToonMaterial({ color: 0xe0a765 });
  new THREE.TextureLoader().load(A('sand-texture.png'), (tex) => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(groundSize/9, groundSize/9); // 텍스처 한 장을 9유닛 크기로 반복
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    groundMat.map = tex;
    groundMat.color.set(0xffffff);
    groundMat.needsUpdate = true;
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.receiveShadow = true;
  scene.add(ground);

  function rawHeight(x, z){
    return Math.sin(x*0.05)*1.4 + Math.cos(z*0.06)*1.2 + Math.sin((x+z)*0.03)*0.8;
  }
  function heightAt(x, z){
    const h = rawHeight(x, z), R = THRONE_ROOM;
    const d = Math.hypot(Math.max(R.x0 - x, 0, x - R.x1), Math.max(R.z0 - z, 0, z - R.z1));
    if (d >= 6) return h;
    const k = d / 6, sm = k * k * (3 - 2 * k);          // 방 둘레 6유닛에 걸쳐 부드럽게 이어짐
    return R.h + (h - R.h) * sm;
  }

  // 공용 바닥 그림자 텍스처(스프라이트 캐릭터·나무 공통)
  const shadowTexShared = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(64,64,0,64,64,64);
    g.addColorStop(0, 'rgba(0,0,0,0.45)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0,0,128,128);
    return new THREE.CanvasTexture(c);
  })();
  const shadowMatShared = new THREE.SpriteMaterial({ map: shadowTexShared, transparent:true, depthWrite:false });

  // 카툰 음영용 3단 그라데이션(바위·학생 모델 공통 — 비주얼 톤 통일)
  const toonGradient = (() => {
    const t = new THREE.DataTexture(new Uint8Array([110, 185, 255]), 3, 1, THREE.RedFormat);
    t.minFilter = t.magFilter = THREE.NearestFilter;
    t.needsUpdate = true;
    return t;
  })();

  // 시드 고정 난수 — 새로고침해도 같은 배치(QA·스크린샷 비교가 가능하도록)
  let seed = 20260924;
  const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

