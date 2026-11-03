  // ── 플레이어: 중등부 학생(리깅 3D 모델 + 걷기/대기/달리기 애니메이션) ──
  // 모델: GPT 원화(student-character.png) → Meshy 이미지→3D(Premium, 상업 이용·비공개) → Meshy 자동 리깅 + 동작 라이브러리.
  //       게임용 정리(텍스처 1024 JPEG·양자화)는 tools/make-meshy-char.mjs
  const player = new THREE.Group();
  player.position.set(0, 0, 15);
  scene.add(player);

  const PLAYER_HEIGHT = 2.2;   // 월드 단위. 어른 NPC(2.5)보다 조금 작게 — 중학생 체형
  const RIG_HEIGHT_M = 1.6;    // Meshy 리깅 때 지정한 키(미터)
  let mixer = null;
  const actions = {};
  let currentAnim = null;
  let gestureLock = false;     // 제스처(손 들기) 재생 중에는 걷기/대기 전환을 잠시 멈춤
  // 발이 미끄러지지 않도록 애니메이션 재생 속도를 실제 이동 속도에 맞출 때 쓰는 기준값(모델 로드 시 측정)
  const natural = { Walk: 3.0, Run: 7.0 };

  function playAnim(name, fade = 0.22){
    if (!mixer || currentAnim === name || !actions[name]) return;
    const next = actions[name];
    next.reset().setEffectiveWeight(1).fadeIn(fade).play();
    if (currentAnim && actions[currentAnim]) actions[currentAnim].fadeOut(fade);
    currentAnim = name;
  }

  // 발(Foot.L)이 한 주기 동안 앞뒤로 움직인 거리로 "그 애니메이션의 자연스러운 이동 속도"를 잰다.
  function measureNaturalSpeed(model, clip){
    const m = new THREE.AnimationMixer(model);
    const act = m.clipAction(clip).play();
    const foot = model.getObjectByName('LeftFoot');
    if (!foot) return null;
    const v = new THREE.Vector3();
    const steps = 160, zs = [];
    for (let i=0;i<=steps;i++){
      m.setTime(clip.duration * i/steps);
      model.updateMatrixWorld(true);
      foot.getWorldPosition(v);
      zs.push(model.worldToLocal(v.clone()).z);
    }
    act.stop(); m.uncacheRoot(model);
    const minZ = Math.min(...zs), maxZ = Math.max(...zs), mid = (minZ + maxZ) / 2;
    // 클립 하나에 걸음 주기가 여러 번 들어 있을 수 있으므로 발이 앞으로 넘어가는 횟수로 주기 수를 센다
    let cycles = 0;
    for (let i=1;i<zs.length;i++) if (zs[i-1] < mid && zs[i] >= mid) cycles++;
    cycles = Math.max(1, cycles);
    // 한 주기에 좌우 한 걸음씩 = 발 진폭의 2배를 전진
    return (maxZ - minZ) * 2 * cycles / clip.duration * model.scale.x;
  }

  let playerHand = null;
  // ── 주인공 꾸미기: 몸(남·여) + 머리 모양(따로 씌움) ──
  // 저장(inodyssey-char)이 없으면 예전 학생 모델(student.glb). 확인용: ?body=girl&hair=girl-long
  const CHAR = (() => { let c = {}; try { c = JSON.parse(localStorage.getItem('inodyssey-char') || '{}'); } catch (e){}
    const q = location.search, b = (q.match(/[?&]body=(boy|girl)/) || [])[1], h = (q.match(/[?&]hair=([a-z-]+)/) || [])[1];
    if (b) c.body = b; if (h) c.hair = h; return c; })();
  const HAIR_DEFAULT = { boy: 'boy-default', girl: 'girl-long' };
  const HAIR_FIT = { 'boy-default': { w: 1.0, top: -0.02, z: -0.04 }, 'girl-long': { w: 1.04, top: -0.01, z: -0.12 } };   // 머리 모양별 미세 조정(폭 배율·위·앞뒤)
  let playerHair = null;
  // 머리카락 씌우기: 몸 모델에서 머리뼈(Head)에 붙은 정점들의 크기·위치를 재서, 머리 모양을 그 폭·꼭대기에 맞춰 붙인다
  async function attachHair(model, key, own = true){
    if (own && playerHair){ playerHair.parent && playerHair.parent.remove(playerHair); playerHair = null; }
    const head = model.getObjectByName('Head'); if (!head || !key) return;
    const g = await loadGLB(`hair3d/${key}.glb`);            // 먼저 받아 두고, 재기·붙이기는 한 번에(그 사이 학생이 움직여도 어긋나지 않게)
    model.updateWorldMatrix(true, true);   // 학생(부모) 위치까지 최신으로 — 아니면 옛 위치 기준으로 계산됨
    // 머리 크기·위치는 뼈로 잰다: Head(머리 밑동) → head_end(정수리), headfront(얼굴 앞). 머리 폭 ≈ 밑동~정수리 길이 × 1.15
    const P = n => { const o = model.getObjectByName(n); return o && o.getWorldPosition(new THREE.Vector3()); };
    const ph = P('Head'), pt = P('head_end') || ph.clone().add(new THREE.Vector3(0, 0.3, 0)), pf = P('headfront');
    const H = ph.distanceTo(pt), hc = ph.clone().lerp(pt, 0.5);
    const fwd = pf ? new THREE.Vector3(pf.x - ph.x, 0, pf.z - ph.z).normalize() : new THREE.Vector3(0, 0, 1);
    const hb = new THREE.Box3(new THREE.Vector3(hc.x - H * 0.575, ph.y, hc.z - H * 0.575), new THREE.Vector3(hc.x + H * 0.575, pt.y, hc.z + H * 0.575));
    window.__headBox = [hb.min.toArray(), hb.max.toArray()].map(a => a.map(v => +v.toFixed(2)));
    const hair = g.scene; toToon(hair); hair.updateMatrixWorld(true);
    const fit = HAIR_FIT[key] || { w: 1.14, top: 0.05, z: 0 };
    const b0 = new THREE.Box3().setFromObject(hair), hs = hb.getSize(new THREE.Vector3()), s0 = b0.getSize(new THREE.Vector3());
    const sc = hs.x * fit.w / s0.x; hair.scale.multiplyScalar(sc); hair.updateMatrixWorld(true);
    hair.rotation.y = Math.atan2(fwd.x, fwd.z); hair.updateMatrixWorld(true);
    const b1 = new THREE.Box3().setFromObject(hair), c1 = b1.getCenter(new THREE.Vector3());
    hair.position.add(new THREE.Vector3(hc.x - c1.x + fwd.x * H * fit.z, hb.max.y + H * fit.top - b1.max.y, hc.z - c1.z + fwd.z * H * fit.z));
    hair.rotation.y = Math.atan2(fwd.x, fwd.z);   // 얼굴 방향으로 돌림(머리 모양 원본은 +z가 앞)
    const holder = new THREE.Group(); scene.add(holder); holder.add(hair); holder.updateMatrixWorld(true);
    head.attach(holder);                                   // 월드 위치 그대로 머리뼈에 붙임 → 고개를 돌리면 함께 움직임
    if (own) playerHair = holder;
    return holder;
  }
  function loadPlayer(){
    return new Promise((resolve, reject) => {
      gltfLoader.load(A(CHAR.body ? `chars/base-${CHAR.body}.glb` : 'student.glb'), gltf => {
        const model = gltf.scene;
        model.traverse(o => {
          if (o.isMesh){
            o.castShadow = true;
            o.frustumCulled = false; // 스킨드 메시는 바운딩이 부정확해 가장자리에서 깜빡일 수 있음
            const src = o.material;
            // 카툰 음영(바위와 같은 3단 그라데이션)으로 통일. 원화 텍스처는 그대로 사용.
            // Meshy 텍스처는 옷·피부 조각이 틈 없이 붙어 있어, 밉맵(축소 텍스처)을 쓰면 옆 조각 색이 섞여 흰 선이 생긴다 → 밉맵 끔
            if (src.map){ src.map.generateMipmaps = false; src.map.minFilter = THREE.LinearFilter; src.map.anisotropy = 1; }
            o.material = new THREE.MeshToonMaterial({ map: src.map, color: 0xffffff, gradientMap: toonGradient, name: src.name });
          }
        });
        model.scale.setScalar(PLAYER_HEIGHT / RIG_HEIGHT_M);
        // 동작마다 들어 있는 뼈 크기(scale) 트랙 제거 — Meshy 'Idle'에만 엉덩이 1.176배가 들어 있어 멈추면 캐릭터가 커졌음
        gltf.animations.forEach(clip => { clip.tracks = clip.tracks.filter(t => !/\.scale$/.test(t.name)); clip.resetDuration(); });
        const jc = gltf.animations.find(c => c.name === 'Jump');
        const hipT = jc && jc.tracks.find(t => /Hips\.position$/.test(t.name));
        if (hipT){ const v = hipT.values, y0 = v[1]; for (let i = 1; i < v.length; i += 3) v[i] = Math.min(v[i], y0); }
        // (Meshy 동작은 제자리 동작이라 루트 모션 제거 불필요 — 엉덩이 이동은 수 cm의 자연스러운 흔들림뿐)
        player.add(model);
        playerHand = model.getObjectByName('RightHand') || null;   // 상점 지팡이를 쥐는 손
        if (CHAR.body) attachHair(model, CHAR.hair || HAIR_DEFAULT[CHAR.body]);

        mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach(c => { actions[c.name] = mixer.clipAction(c); });
        ['Walk','Run'].forEach(n => {
          const clip = gltf.animations.find(c => c.name === n);
          const s = clip && measureNaturalSpeed(model, clip);
          if (s && isFinite(s) && s > 0.3) natural[n] = s;
        });
        if (actions.Talk) actions.Talk.setEffectiveTimeScale(1);
        mixer.addEventListener('finished', e => endOneShot(e.action));
        playAnim('Idle', 0);
        resolve();
      }, undefined, reject);
    });
  }

  // ── 카메라: 3인칭 추적 ──────────────────────────────────
  // ?close 를 붙이면 캐릭터 외형 점검용 근접 카메라
  const CLOSE = /[?&]close(&|$)/.test(location.search);
  const camOffset = CLOSE ? new THREE.Vector3(0, 1.7, 4.2) : new THREE.Vector3(0, 5.4, 8.5);
  const LOOK_Y = CLOSE ? 1.25 : 1.3;
  // 줌: 1 = 기본 거리. 두 손가락 벌리기/오므리기, 마우스 휠, 화면 +/− 버튼
  const ZOOM_MIN = 0.45, ZOOM_MAX = 1.7;
  let zoom = 1, zoomTarget = 1;
  // 궤도 카메라: 화면 드래그(한 손가락·마우스)로 좌우 360도 회전·위아래 기울기, Q/E 키로도 회전
  const CAM_DIST = camOffset.length();
  let camYaw = 0, camPitch = Math.asin(camOffset.y / CAM_DIST);
  const PITCH_MIN = 0.08, PITCH_MAX = 1.25;
  function setZoom(z){ zoomTarget = THREE.MathUtils.clamp(z, ZOOM_MIN, ZOOM_MAX); }
  camera.position.copy(player.position).add(camOffset);

  // ── 정보 포인트(퀘스트) + NPC ────────────────────────────
  // 성경 인물 대사는 개역개정 본문 범위 안에서만.
  let infoPoints = [], questPoints = [];
  // 퀘스트 상태
  const questState = {};                // 모든 마을의 퀘스트 상태(마을을 옮겨도 유지)
  let toastTimer = null;
  function toast(msg, ms){
    const el = document.getElementById('quest-toast');
    el.textContent = msg; el.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(()=>el.classList.remove('show'), ms || 1600);
  }

  const markers = [];
  const _tagV = new THREE.Vector3();
  const _frustum = new THREE.Frustum(), _projM = new THREE.Matrix4(), _npcSphere = new THREE.Sphere(new THREE.Vector3(), 1.6);
  // 이름표: 캔버스 글자 스프라이트(가까이 가면 보임). 지금 이야기 목표면 금색 + ❗
  const TAGS = [], tagLayer = (() => { const d = document.createElement('div'); d.id = 'tag-layer'; document.body.appendChild(d); return d; })();
  const _tagP = new THREE.Vector3(); const tagPos = [];
  function makeTag(text){
    const el = document.createElement('div'); el.className = 'ntag'; el.textContent = text; tagLayer.appendChild(el);
    const c = document.createElement('canvas'); c.width = 4; c.height = 4;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthTest: false, transparent: true, sizeAttenuation: false })); // 거리와 관계없이 화면에서 같은 크기
    sp.renderOrder = 999; sp.userData = { c, text, mode: null, el }; sp.center.set(0.5, 0.15);
    sp.material.visible = false;   // 3D에는 그리지 않고, 위치만 계산해 화면 글자(el)를 그 자리에 둠
    TAGS.push(sp); return sp;
  }
  function drawTag(sp, target){
    const mode = target ? 'target' : 'normal'; if (sp.userData.mode === mode) return; sp.userData.mode = mode;
    const { text, el } = sp.userData;
    el.textContent = target ? '❗ ' + text : text; el.classList.toggle('tgt', !!target);
  }
  const exitBeamMat = new THREE.MeshBasicMaterial({ color: 0x9be58a, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const doorBeamMat = new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0.3, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  function createMarkers(){
    infoPoints.forEach(p => {
      if (p.model){
        const group = new THREE.Group();
        group.position.set(p.x, heightAt(p.x, p.z), p.z);
        group.rotation.y = faceTo(p.x, p.z, Z.spawn[0], Z.spawn[1]); // 처음엔 들어오는 쪽을 바라봄
        zoneRoot.add(group);
        const col = { x: p.x, z: p.z, r: 0.55 };
        obstacles.push(col);
        const tag = makeTag(p.title); tag.scale.set(0.16, 0.04, 1); tag.position.y = 2.7; group.add(tag);
        markers.push({ mesh: group, data: p, mixer: null, actions: {}, cur: null, yaw: group.rotation.y, baseYaw: group.rotation.y, col, tag });
        if (p.showFrom || p.cond) applyShow(markers[markers.length - 1]);
      } else if (p.id === 'bush'){
        const holder = new THREE.Group(); holder.position.set(p.x, heightAt(p.x, p.z), p.z); zoneRoot.add(holder);
        const tag = makeTag(p.title); tag.scale.set(0.16, 0.04, 1); tag.position.y = 3.2; holder.add(tag);
        markers.push({ mesh: holder, data: p, isBush: true, tag });
      } else if (p.type === 'door'){
        const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 3.0, 20, 1, true), doorBeamMat);
        beam.position.set(p.x, heightAt(p.x, p.z) + 1.5, p.z); zoneRoot.add(beam);
        const tag = makeTag(p.title); tag.scale.set(0.16, 0.04, 1); tag.position.set(p.x, heightAt(p.x, p.z) + 3.4, p.z); zoneRoot.add(tag);
        markers.push({ mesh: beam, data: p, isDoor: true, tag });
      } else if (p.type === 'exit'){
        // 출구: 바닥의 빛 기둥(다가가면 "이동하기")
        const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 3.6, 24, 1, true), exitBeamMat);
        beam.position.set(p.x, heightAt(p.x, p.z) + 1.8, p.z); zoneRoot.add(beam);
        const tag = makeTag(p.title); tag.scale.set(0.16, 0.04, 1); tag.position.set(p.x, heightAt(p.x, p.z) + 4.0, p.z); zoneRoot.add(tag);
        markers.push({ mesh: beam, data: p, isExit: true, tag });
      } else {
        const glowMat = new THREE.MeshBasicMaterial({ color:0xffd27a, transparent:true, opacity:0.85 });
        const glow = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), glowMat);
        glow.position.set(p.x, heightAt(p.x,p.z)+1.6, p.z);
        zoneRoot.add(glow);
        const tag = makeTag(p.title); tag.scale.set(0.16, 0.04, 1); tag.position.set(p.x, heightAt(p.x, p.z) + 2.3, p.z); zoneRoot.add(tag);
        const light = new THREE.PointLight(0xffd27a, 1.4, 8);
        light.position.copy(glow.position);
        zoneRoot.add(light);
        markers.push({ mesh: glow, data: p, tag, light }); if (p.challenge){ glowMat.color.set(0x8fe0ff); light.color.set(0x8fe0ff); }
        if (p.showCh !== undefined || p.cond) applyShow(markers[markers.length - 1]);
      }
    });
  }

