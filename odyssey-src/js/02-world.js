  // ── 3D 월드 소품: GPT 원화 → Meshy 3D (props3d/*.glb) ─────────────
  // 모든 캐릭터·소품이 같은 방식(Meshy 3D + 카툰 음영)이라 화풍이 통일된다.
  const WPM = 2.2 / 1.6;            // 월드 단위 / 미터 (학생 1.6m = 2.2 유닛)
  const gltfLoader = new THREE.GLTFLoader();
  gltfLoader.setMeshoptDecoder(THREE.MeshoptDecoder);
  // 에셋 바이트 캐시 — 다음 마을 에셋을 출구 근처에서 미리 받아 두고(prefetch), 이동할 때 바로 parse
  const bytesCache = new Map();
  const fetchOnce = (name, ms) => { const ac = typeof AbortController !== 'undefined' ? new AbortController() : null, t = ac && setTimeout(() => ac.abort(), ms);
    return fetch(A(name), ac ? { signal: ac.signal } : undefined).then(r => { clearTimeout(t); if (!r.ok) throw new Error(name + ' ' + r.status); return r.arrayBuffer(); }, e => { clearTimeout(t); throw e; }); };
  const fetchBytes = name => {
    if (!bytesCache.has(name)){
      const p = (async () => { let err; for (let i = 0; i < 3; i++){ try { return await fetchOnce(name, 60000); } catch (e){ err = e; await new Promise(r => setTimeout(r, 900 * (i + 1))); } } throw err; })();
      p.catch(() => { if (bytesCache.get(name) === p) bytesCache.delete(name); });   // 실패한 결과를 캐시에 남기지 않음 → 다음에 다시 받음
      bytesCache.set(name, p);
    }
    return bytesCache.get(name);
  };
  const loadGLB = name => fetchBytes(name).then(buf => new Promise((res, rej) => gltfLoader.parse(buf.slice(0), '', res, rej)));
  // 지금 마을의 모든 물체는 zoneRoot 아래에 — 마을을 떠나면 통째로 비운다
  const zoneRoot = new THREE.Group(); scene.add(zoneRoot);
  // Meshy 텍스처는 조각이 틈 없이 붙어 있어 밉맵을 쓰면 흰 선이 생긴다 → 밉맵 끄고 카툰 음영으로 통일
  function toToon(o, { shadow = true } = {}){
    o.traverse(m => {
      if (!m.isMesh) return;
      const src = m.material;
      if (src.map){ src.map.generateMipmaps = false; src.map.minFilter = THREE.LinearFilter; }
      m.material = new THREE.MeshToonMaterial({ map: src.map, color: 0xffffff, gradientMap: toonGradient });
      m.castShadow = shadow; m.receiveShadow = true;
    });
  }
  const obstacles = [];  // 플레이어가 통과하지 못하는 원형 충돌체 {x, z, r}
  const occluders = [];  // 카메라와 주인공 사이를 가리면 반투명해지는 큰 물체 {obj, x, z, r, fade, mats}

  // 소품 규격: 높이(미터), 가림 처리 여부, 충돌 반경 배율
  const PROP_DEFS = {
    'tent-large':  { h: 3.2, occ: true,  shape: 'box' },
    'tent-mid':    { h: 2.6, occ: true,  shape: 'box' },
    'tent-small':  { h: 2.1, occ: true,  shape: 'box' },
    'well':        { h: 2.2, occ: false, shape: 'circle', k: 0.92 },
    'campfire':    { h: 0.8, occ: false, shape: 'circle', k: 0.8 },
    'firewood':    { h: 0.7, occ: false, shape: 'box', stand: 0.66 },
    'crates-sacks':{ h: 1.3, occ: false, shape: 'box', stand: 1.15 },
    'jars':        { h: 1.2, occ: false, shape: 'circle', k: 0.85 },
    'fence':       { h: 1.1, occ: false, shape: 'box' },
    'dry-bush':    { h: 1.6, occ: false, shape: 'circle', k: 0.35 },
    'rock-large':  { h: 2.6, occ: true,  shape: 'circle', k: 0.85 },
    'rock-group':  { h: 1.2, occ: false, shape: 'box', stand: 1.05 },
    'palm':        { h: 7.0, occ: true,  shape: 'circle', k: 0.12 },
    // GPT 4차 건물(미디안) → Meshy 3D
    'jethro-tent':   { h: 3.6, occ: true,  shape: 'box', src: 'buildings3d/midian-jethro-tent.glb' },
    'sheepfold':     { h: 1.3, occ: false, shape: 'ring', src: 'buildings3d/midian-sheepfold.glb' },
    'water-trough':  { h: 0.9, occ: false, shape: 'box', stand: 0.8, src: 'buildings3d/midian-water-trough.glb' },
    'weaving-shade': { h: 2.6, occ: true,  shape: 'posts', src: 'buildings3d/midian-weaving-shade.glb' },
    'village-gate':  { h: 2.8, occ: true,  shape: 'gate', src: 'buildings3d/midian-village-gate.glb' },
    // 두루마리마을(시작 마을, 내부 id alpha)
    'fountain':      { h: 1.7, occ: false, shape: 'circle', k: 0.92, src: 'buildings3d/alpha-fountain.glb' },
    'sage-house':    { h: 5.6, occ: true,  shape: 'box', src: 'buildings3d/alpha-sage-house.glb' },
    'memorial-hall': { h: 3.8, occ: true,  shape: 'box', src: 'buildings3d/alpha-memorial-hall.glb' },
    'shop':          { h: 3.2, occ: true,  shape: 'box', src: 'buildings3d/alpha-shop.glb' },
    'notice-board':  { h: 2.6, occ: false, shape: 'box', src: 'buildings3d/alpha-notice-board.glb' },
    'map-table':     { h: 2.7, occ: true,  shape: 'posts', src: 'buildings3d/alpha-map-table.glb' },
    'portal':        { h: 4.4, occ: false, shape: 'gate', src: 'props3d/portal.glb' },
    // 애굽 고센·라암셋
    'hebrew-house':       { h: 3.3, occ: true, shape: 'box', src: 'buildings3d/egypt-hebrew-house.glb' },
    'hebrew-house-small': { h: 2.7, occ: true, shape: 'box', src: 'buildings3d/egypt-hebrew-house-small.glb' },
    'brick-yard':         { h: 1.2, occ: false, shape: 'none', src: 'buildings3d/egypt-brick-yard.glb' },
    'granary':            { h: 4.4, occ: true, shape: 'box', src: 'buildings3d/egypt-granary.glb' },
    'palace-gate':        { h: 6.8, occ: true, shape: 'gate', src: 'buildings3d/egypt-palace-gate.glb' },
    'palace':             { h: 7.6, occ: true, shape: 'box', src: 'buildings3d/egypt-palace.glb' },
    'palace-throne':      { h: 3.4, occ: false, shape: 'box', src: 'buildings3d/palace-throne.glb' },
    'palace-pillar':      { h: 6.4, occ: true, shape: 'circle', k: 0.8, src: 'buildings3d/palace-pillar.glb' },
    'palace-brazier':     { h: 1.3, occ: false, shape: 'circle', k: 0.9, src: 'buildings3d/palace-brazier.glb' },
    'palace-banner':      { h: 4.2, occ: false, shape: 'none', src: 'buildings3d/palace-banner.glb' },
    'palace-fan-stand':   { h: 2.6, occ: false, shape: 'circle', k: 0.5, src: 'buildings3d/palace-fan-stand.glb' },
    'palace-table-jars':  { h: 1.3, occ: false, shape: 'box', src: 'buildings3d/palace-table-jars.glb' },
    'tent-cluster':       { h: 3.4, occ: true, shape: 'box', src: 'buildings3d/camp-tent-cluster.glb' },
    'camp-firepit':       { h: 1.0, occ: false, shape: 'circle', k: 0.6, src: 'buildings3d/camp-camp-firepit.glb' },
    'tribe-banner':       { h: 3.4, occ: false, shape: 'circle', k: 0.25, src: 'buildings3d/camp-tribe-banner.glb' },
    'env-rock-hill':      { h: 4.2, occ: true, shape: 'circle', k: 0.7, src: 'env3d/terrain-rock-hill.glb' },
    'env-date-palm':      { h: 6.0, occ: true, shape: 'circle', k: 0.2, src: 'env3d/plants-date-palm.glb' },
    'env-acacia':         { h: 4.0, occ: true, shape: 'circle', k: 0.25, src: 'env3d/plants-acacia.glb' },
    'env-rocks-strata':   { h: 2.2, occ: false, shape: 'circle', k: 0.7, src: 'env3d/rocks-strata.glb' },
    'env-reeds':          { h: 1.5, occ: false, shape: 'none', src: 'env3d/plants-reeds.glb' },
    'env-river-stones':   { h: 0.6, occ: false, shape: 'none', src: 'env3d/rocks-river-stones.glb' },
    'passover-table':     { h: 0.8, occ: false, shape: 'box', src: 'story3d/passover-table.glb' },
    'hyssop-basin':       { h: 0.55, occ: false, shape: 'none', src: 'story3d/hyssop-basin.glb' },
    'pilgrim-bundle':     { h: 0.6, occ: false, shape: 'none', src: 'story3d/pilgrim-bundle.glb' },
    'obelisk':            { h: 8.5, occ: true, shape: 'circle', k: 0.7, src: 'buildings3d/egypt-obelisk.glb' },
    'market-stall':       { h: 2.5, occ: true, shape: 'posts', src: 'buildings3d/egypt-market-stall.glb' },
    'reed-hut':           { h: 2.4, occ: true, shape: 'box', src: 'buildings3d/egypt-reed-hut.glb' },
    'lamb':  { h: 0.95, occ: false, shape: 'none', src: 'animals3d/lamb.glb' },
    'camel': { h: 2.1,  occ: false, shape: 'none', src: 'animals3d/camel.glb' },
  };
  // 상자형 충돌체 {x, z, rot, hx, hz, top(월드 높이), stand(윗면에 올라설 수 있나)}
  const boxes = [];
  function addCollider(name, x, z, rot, sc){
    const t = propTemplates[name], def = PROP_DEFS[name];
    const hx = t.halfW * sc, hz = t.halfD * sc, base = heightAt(x, z);
    const top = base + (def.stand ? def.stand : def.h) * WPM * sc;
    switch (def.shape){
      case 'box': boxes.push({ x, z, rot, hx: hx * 0.9, hz: hz * 0.9, top, stand: !!def.stand }); break;
      case 'circle': obstacles.push({ x, z, r: Math.min(hx, hz) * def.k }); break;
      case 'posts': for (const [a, b] of [[1,1],[1,-1],[-1,1],[-1,-1]]){
          const lx = a * hx * 0.85, lz = b * hz * 0.85;
          obstacles.push({ x: x + lx * Math.cos(rot) + lz * Math.sin(rot), z: z - lx * Math.sin(rot) + lz * Math.cos(rot), r: 0.3 });
        } break;
      case 'ring': { const R = Math.min(hx, hz) * 0.9;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 12){
          if (Math.abs(Math.atan2(Math.sin(a - Math.PI), Math.cos(a - Math.PI))) < 0.35) continue; // 서쪽(마을 쪽) = 입구
          obstacles.push({ x: x + Math.cos(a) * R, z: z + Math.sin(a) * R, r: 0.75, h: top });   // 돌담 — 점프로 넘을 수 있음
        } } break;
      case 'gate': { const off = hx * 0.82;
        obstacles.push({ x: x - Math.cos(rot) * off, z: z + Math.sin(rot) * off, r: 0.9 }, { x: x + Math.cos(rot) * off, z: z - Math.sin(rot) * off, r: 0.9 }); } break;
    }
  }

  // ══ 마을(존) 데이터 ══════════════════════════════════════════════
  // 존마다 배치(LAYOUT: [이름, x, z, 회전, 크기]), 흩어 놓기, 사람·정보 포인트, 출구, 하늘 색을 정의한다.
  // 새 마을은 여기에 데이터만 추가하면 된다(코드 수정 없이).
  const faceTo = (x, z, tx, tz) => Math.atan2(tx - x, tz - z);
  const ZONES = {
    alpha: {
      name: '두루마리마을', questTitle: '📜 시작 — 두루마리마을',
      env: { top: 0x3f3a8f, bottom: 0xf3c9c0, fog: 0xe6cbd0, fogD: 0.015, sun: 0xfff0e0, sunDir: [-0.2, 0.08, -1], cloud: 0.35, cloudCol: 0xf4d9ee, stars: 1, far: 'far-mountains' },
      center: [0, 0], spawn: [0, 16],
      layout: [
        ['fountain', 0, 0, 0], ['sage-house', -12, -9, faceTo(-12, -9, 0, 0)], ['memorial-hall', 12, -10, faceTo(12, -10, 0, 0)],
        ['shop', 13, 5, faceTo(13, 5, 0, 0)], ['notice-board', -8, 8, faceTo(-8, 8, 0, 0)], ['map-table', -13, 4, faceTo(-13, 4, 0, 0)],
        ['portal', 0, -22, 0], ['palm', -6, -4, 0.4], ['palm', 6, -4.5, 2.1], ['palm', 7, 9, 3.3], ['palm', -18, -2, 1.1],
        ['tent-large', -44, 36.8, 0],   // 내 장막(마당 뒤편)
      ],
      scatter: [['palm', 8, 26, 62], ['rock-group', 8, 22, 62], ['dry-bush', 10, 16, 62]],
      clear: [[0, 0, 22], [-44, 44, 14], [-16, 12.5, 3]], fires: [],
      points: [
        { id: 'guide', x: -2.5, z: 3, type: 'npc', title: "안내자", model: 'guide-sage',
          body: "\"어서 오렴. 여기는 시간과 시간 사이에 있는 마을이란다.\n저 빛나는 문을 지나면 모세가 살던 미디안 광야로 갈 수 있어. 모세를 만나 보렴.\"" },
        { id: 'board', x: -6.2, z: 6.2, type: 'lore', title: "마을 게시판",
          body: "\"두루마리마을에 온 것을 환영합니다\" — 조작 안내와 마을 소식이 붙어 있어요." },
        { id: 'memorial', x: 9.4, z: -7.2, type: 'lore', title: "기념 전시관",
          body: "이야기를 끝낼 때마다 받침대에 기념물이 하나씩 놓인대요. 지금은 세 받침대가 모두 비어 있어요." },
        { id: 'map', x: -13, z: 6.6, type: 'lore', title: "성경 지도",
          body: "오래된 두루마리 지도예요. 이야기를 하나씩 끝낼 때마다 지도의 한 조각이 채워진답니다.\n지금은 첫 이야기, '모세와 함께 — 출애굽' 조각이 희미하게 빛나고 있어요." },
        { id: 'a_shop', x: 11, z: 7.5, type: 'villager', title: "상점 주인", model: 'merchant',
          body: "\"지팡이랑 함께 다닐 동물 친구가 있어요! 말씀우물 달란트로 살 수 있답니다.\"" },
        { id: 'a_keeper', x: 10, z: -5, type: 'villager', title: "전시관지기", model: 'elder',
          body: "\"이야기를 하나 끝내면 저 받침대에 기념물이 놓인단다. 첫 번째는 누구의 이야기가 될까?\"" },
        { id: 'a_cart', x: -11, z: 7.5, type: 'villager', title: "지도 그리는 사람", model: 'blacksmith',
          body: "\"이 지도는 아직 대부분 비어 있어. 네가 이야기를 걸을 때마다 한 조각씩 그려 넣을 거야.\"" },
        { id: 'a_gardener', x: -9, z: -3, type: 'villager', title: "정원사 할머니", model: 'herbalist',
          body: "\"이 마을 꽃은 시간이 흘러도 시들지 않는단다. 천천히 둘러보렴.\"" },
        { id: 'a_kid1', x: 4, z: 5, type: 'villager', title: "마을 아이", model: 'child',
          body: "\"너도 처음 왔지? 저 빛나는 문 너머엔 옛날 사람들이 산대!\"" },
        { id: 'a_kid2', x: 6, z: -2, type: 'villager', title: "심부름꾼 소년", model: 'shepherd-boy',
          body: "\"안내자님 심부름 중이에요! 게시판 봤어요? 새 소식이 붙었대요.\"" },
        { id: 'to-midian', x: 0, z: -19.5, type: 'exit', title: "미디안 광야로", to: 'midian', spawn: [0, 15], needStep: 's2', lockMsg: '먼저 안내자와 이야기해 보세요' },
        { id: 'home-in', x: -16, z: 12.5, type: 'door', title: "🏠 내 장막", btn: '들어가기', tele: [-44, 49], look: [-44, 40] },
        { id: 'home-out', x: -44, z: 53, type: 'door', title: "마을로 돌아가기", btn: '나가기', tele: [-14.5, 14.5], look: [0, 0] },
      ],
    },
    midian: {
      name: '미디안 광야', questTitle: '📜 퀘스트 — 광야의 발자취',
      env: { top: 0xf49b62, bottom: 0xffe6bd, fog: 0xf2c988, fogD: 0.017, sun: 0xffedc2, sunDir: [0.5, 0.16, -0.85], cloud: 0.55, cloudCol: 0xffd9b8, stars: 0, far: 'far-mountains' },
      center: [0, -6], spawn: [0, 15],
      layout: [
        ['well', 0, -6, 0],
        ['jethro-tent', -10.5, -17, faceTo(-10.5, -17, 0, -6)], ['water-trough', 4.2, -5.2, 1.57],
        ['weaving-shade', -17.5, 5, faceTo(-17.5, 5, 0, -6)], ['village-gate', 0, 10.5, 0], ['tent-mid', 9, -17, faceTo(9, -17, 0, -6)], ['tent-mid', -17, -4, faceTo(-17, -4, 0, -6)],
        ['tent-small', 15, -8, faceTo(15, -8, 0, -6)], ['tent-small', -4, -23, faceTo(-4, -23, 0, -6)], ['tent-small', -16, -15, faceTo(-16, -15, 0, -6)],
        ['campfire', 5, 1, 0], ['firewood', 8.8, 3.8, 0.6],
        ['crates-sacks', -6, -13, 0.4], ['crates-sacks', 12, -13, -0.8],
        ['jars', -1.2, -10.2, 0.3], ['jars', -14, -1.5, 1.2],
        ['palm', -4.5, -2.2, 0.3], ['palm', 4.8, -3.6, 1.7], ['palm', -2, -10.5, 2.9], ['palm', 4.2, -12.4, 4.2],
        ['sheepfold', 22, 2, -Math.PI / 2, 1.25],
      ],
      scatter: [['palm', 16, 20, 62], ['rock-large', 6, 26, 62], ['rock-group', 12, 16, 62], ['dry-bush', 16, 12, 62]],
      clear: [[0, -6, 21], [22, 2, 7.6], [0, 10.5, 4], [-54, 8, 6], [0, 31, 5], [-34, -36, 7]],
      fires: [[5, 1, 0.15, 0.55]],
      points: [
        { id: 'moses', x: -29, z: -31, type: 'npc', title: "모세", model: 'moses', persona: 'moses_horeb',
          body: "\"먼 길을 왔군요. 나는 모세예요.\n저 광야 너머에서 불이 붙었는데도 타지 않는 떨기나무를 보았어요. 하나님께서 그곳에서 나를 부르셨지요.\"\n\n모세는 미디안 광야에서 장인 이드로의 양 떼를 치다가 호렙산에서 하나님을 만났습니다 (출애굽기 3:1-4)." },
        { id: 'bush', x: -34, z: -36, type: 'lore', title: "불타는 떨기나무",
          body: "모세는 미디안 광야에서 양을 치다가, 불이 붙었는데도 타서 없어지지 않는 떨기나무를 보았습니다. 그곳에서 하나님이 모세를 부르셨습니다 (출애굽기 3장)." },
        { id: 'aaron', x: -22, z: -22, type: 'npc', title: "아론", model: 'aaron', showFrom: 's7',
          body: "\"반가워요. 나는 모세의 형 아론이에요.\n하나님께서 내가 모세를 대신해 백성에게 말을 전하게 하셨어요.\"\n\n아론은 광야 여정 내내 모세 곁에서 이스라엘 백성에게 말을 전하는 역할을 했습니다 (출애굽기 4:14-16)." },
        { id: 'jethro', x: -7, z: -12.5, type: 'villager', title: "이드로", model: 'jethro',
          body: "\"어서 오너라. 나는 미디안의 제사장 이드로란다. 모세는 내 사위지.\"\n\n모세는 장인 이드로의 양 떼를 치며 미디안 광야에서 지냈습니다 (출애굽기 3:1)." },
        { id: 'blacksmith', x: 12.5, z: -4.5, type: 'villager', title: "대장장이", model: 'blacksmith',
          body: "\"뚝딱뚝딱! 필요한 연장이 있으면 언제든 말해요.\"" },
        { id: 'merchant', x: 8.6, z: -11.6, type: 'villager', title: "상인", model: 'merchant',
          body: "\"좋은 천이 들어왔어요. 한번 구경해 볼래요?\"" },
        { id: 'elder', x: -5.2, z: -10.8, type: 'villager', title: "장로", model: 'elder',
          body: "\"젊은이, 길을 잃었거든 이 늙은이에게 물어보게나.\"" },
        { id: 'shepherd', x: 30.2, z: 4.5, type: 'villager', title: "목동 소년", model: 'shepherd-boy',
          body: "\"우리 양 한 마리가 없어졌어요… 혹시 못 봤어요?\"" },
        { id: 'herbalist', x: -14, z: -9, type: 'villager', title: "약초 할머니", model: 'herbalist',
          body: "\"광야를 걸을 땐 물을 꼭 챙기렴.\"" },
        { id: 'child', x: 8.4, z: 0.5, type: 'villager', title: "꼬마", model: 'child',
          body: "\"형(누나)은 어디서 왔어요? 옷이 신기하게 생겼어요!\"" },
        { id: 'to-alpha', x: 0, z: 31, type: 'exit', title: "두루마리마을로", to: 'alpha', spawn: [0, -15] },
        { id: 'to-egypt', x: -54, z: 8, type: 'exit', title: "애굽 고센 땅으로", to: 'egypt', spawn: [44, 0], needStep: 's8', lockMsg: '아직 애굽으로 떠날 때가 아니에요 — 모세의 이야기를 먼저 따라가 보세요' },
      ],
    },
    egypt: {
      name: '애굽 고센', questTitle: '📜 퀘스트 — 고센 땅의 히브리 사람들',
      env: { top: 0x4f93dc, bottom: 0xfbe7c4, fog: 0xf0dcb4, fogD: 0.013, sun: 0xfff4dc, sunDir: [0.3, 0.55, -0.7], cloud: 0.3, cloudCol: 0xffffff, stars: 0, far: 'far-pyramids' },
      center: [0, -2], spawn: [44, 0],
      layout: [
        ['hebrew-house', -8, -8, faceTo(-8, -8, 0, 0)], ['hebrew-house', 6, -11, faceTo(6, -11, 0, 0)], ['hebrew-house', -13, 5, faceTo(-13, 5, 0, 0)],
        ['hebrew-house-small', 1, -14, faceTo(1, -14, 0, 0)], ['hebrew-house-small', -16, -5, faceTo(-16, -5, 0, 0)], ['hebrew-house-small', 11, -3, faceTo(11, -3, 0, 0)],
        ['brick-yard', 14, 9, 0.3], ['granary', -4, -24, 0],
        ['market-stall', -3, 9, faceTo(-3, 9, 0, 0)], ['market-stall', 4, 10, faceTo(4, 10, 0, 0)],
        ['reed-hut', -27, 2, Math.PI / 2], ['reed-hut', -27, -9, Math.PI / 2],
        ['palace', 41.1, -24.7, faceTo(41.1, -24.7, 0, 0)], ['palace-gate', 30, -18, faceTo(30, -18, 0, 0)], ['obelisk', 24, -26, 0], ['obelisk', 36, -12, 0],
        ['palm', -24, 12, 0.3], ['palm', -24, -18, 1.6], ['palm', 18, -6, 2.4], ['jars', -1, 6.5, 0.2], ['crates-sacks', 18, 12, 0.5],
        ['sheepfold', -12, 19, 0, 1.1],
        ['passover-table', -9.6, 3.2, 1.2], ['hyssop-basin', -24.6, 5.9, 0.4], ['pilgrim-bundle', -8.2, 6.9, 0.6],
        ['palm', 31, 7, 0.8], ['palm', 24, 13, 2.1], ['jars', 25, -1, 0.4], ['crates-sacks', 30, 12.5, 1.2],
        // 알현실(THRONE_ROOM 안) — 남쪽 끝 계단 위 왕좌, 양쪽으로 기둥 두 줄, 벽에 장식 천
        ['palace-throne', 60, -51.4, 0], ['palace-fan-stand', 57.4, -51.6, 0.3], ['palace-fan-stand', 62.6, -51.6, -0.3],
        ['palace-pillar', 55, -34, 0], ['palace-pillar', 65, -34, 0], ['palace-pillar', 55, -39.5, 0], ['palace-pillar', 65, -39.5, 0],
        ['palace-pillar', 55, -45, 0], ['palace-pillar', 65, -45, 0], ['palace-pillar', 55, -50.5, 0], ['palace-pillar', 65, -50.5, 0],
        ['palace-brazier', 57.8, -48.6, 0], ['palace-brazier', 62.2, -48.6, 0], ['palace-brazier', 57.8, -33.2, 0], ['palace-brazier', 62.2, -33.2, 0],
        ['palace-banner', 53.6, -53.7, 0], ['palace-banner', 66.4, -53.7, 0], ['palace-banner', 51.3, -42, Math.PI / 2], ['palace-banner', 68.7, -42, -Math.PI / 2],
        ['palace-table-jars', 52.6, -36.5, Math.PI / 2], ['palace-table-jars', 67.4, -36.5, -Math.PI / 2],
      ],
      room: { floor: 'tex/palace-floor.jpg', wall: 'tex/palace-wall.jpg' },
      animals: [['lamb', 1], ['camel', 1]],
      water: { x0: -46, x1: -32, z0: -45, z1: 45 },   // 나일 강
      scatter: [['palm', 14, 24, 62], ['rock-group', 6, 26, 62], ['dry-bush', 8, 20, 62]],
      clear: [[0, -2, 22], [30, -18, 9], [41, -25, 11], [60, -42, 17], [27, 5, 9], [52, 0, 6], [-39, 0, 9], [-12, 19, 10]],
      fires: [[57.8, -48.6, 1.75, 0.55, false], [62.2, -48.6, 1.75, 0.55, false], [57.8, -33.2, 1.75, 0.55, false], [62.2, -33.2, 1.75, 0.55, false]],
      points: [
        { id: 'palace-in', x: 32.3, z: -19.4, type: 'door', title: "궁전 안으로", btn: '들어가기', tele: [60, -33.2], look: [60, -50] },
        { id: 'palace-out', x: 60, z: -31.4, type: 'door', title: "궁전 밖으로", btn: '나가기', tele: [28.9, -17.3], look: [0, 0] },
        { id: 'miriam', x: -6, z: 2, type: 'npc', title: "미리암", model: 'miriam',
          body: "\"나는 미리암이에요. 아기였던 내 동생 모세가 갈대 상자에 담겨 나일 강가에 놓였을 때, 나는 멀리 서서 어떻게 되는지 지켜보았어요.\"\n\n모세의 누이는 갈대 상자에 담긴 아기 모세를 멀리서 지켜보았습니다 (출애굽기 2:3-4)." },
        { id: 'bricks', x: 14, z: 5.5, type: 'lore', title: "벽돌 굽는 곳",
          body: "바로는 감독들에게 명령했습니다. 백성에게 벽돌 만들 짚을 더 이상 주지 말고 스스로 짚을 줍게 하되, 만들던 벽돌 수는 줄이지 말라고요 (출애굽기 5:6-8)." },
        { id: 'door', x: -5.6, z: -5.2, type: 'lore', title: "히브리 사람의 집",
          body: "문 양쪽의 기둥(문설주)과 문 위의 가로 들보(인방)가 보여요. 유월절 밤, 이스라엘 백성은 어린양의 피를 이 문설주와 인방에 발랐습니다 (출애굽기 12:7)." },
        { id: 'pharaoh', x: 60, z: -48.4, type: 'villager', title: "바로", model: 'pharaoh',
          body: "\"여호와가 누구이기에 내가 그의 목소리를 듣고 이스라엘을 보내겠느냐.\"\n\n모세와 아론이 이스라엘 백성을 보내 달라고 하자 바로는 이렇게 거절했습니다 (출애굽기 5:2)." },
        { id: 'worker1', x: 11, z: 6, type: 'villager', title: "히브리 일꾼", model: 'hur',
          body: "\"짚을 더 주지 않는대요… 그런데 만들어야 할 벽돌 수는 그대로래요.\"\n\n(출애굽기 5:7-8)" },
        { id: 'worker2', x: 17, z: 12, type: 'villager', title: "히브리 일꾼", model: 'joshua',
          body: "\"오늘도 해가 지기 전에 벽돌을 다 채워야 해요.\"\n\n(출애굽기 5:13)" },
        { id: 'to-midian2', x: 52, z: 0, type: 'exit', title: "미디안 광야로", to: 'midian', spawn: [-48, 8] },
        { id: 'ch_brick', x: 17.5, z: 4.2, type: 'lore', title: "🎮 벽돌 굽기 도전", challenge: 'brick', cond: 'brick', body: '' },
        { id: 'ch_frogs', x: -29, z: 9.5, type: 'lore', title: "🎮 개구리 몰기 도전", challenge: 'frogs', cond: 'frogs', body: '' },
        { id: 'ch_hail', x: 29, z: 9, type: 'lore', title: "🎮 우박 피하기 도전", challenge: 'hail', cond: 'hail', body: '' },
        { id: 'to-redsea', x: 47, z: 17, type: 'exit', title: "홍해 쪽으로", to: 'redsea', spawn: [-44, 0], showCh: 3 },
        { id: 'moses', x: 25.5, z: -11.5, type: 'npc', title: "모세", model: 'moses', persona: 'moses_palace',
          body: "\"하나님께서 반드시 우리 백성을 건져 내실 거란다. 그 약속을 붙들자.\"" },
        { id: 'aaron', x: 27.5, z: -10.2, type: 'npc', title: "아론", model: 'aaron', persona: 'aaron_palace',
          body: "\"나는 모세 곁에서 하나님의 말씀을 전하고 있단다. 너도 함께해 주어서 고맙구나.\"" },
        // ── 3장 인물·장소 ──
        { id: 'is_elder', x: -11, z: -1, type: 'villager', title: "이스라엘 장로", model: 'ca-israel-elder',
          body: "\"하나님께서 우리의 신음 소리를 들으시고, 아브라함과 이삭과 야곱과 세우신 언약을 기억하신다네.\"\n\n(출애굽기 2:24)" },
        { id: 'hyssop', x: -24.4, z: 4.6, type: 'lore', title: "우슬초", showCh: 2,
          body: "담벼락 옆에 자라는 작은 풀이에요. 유월절 밤, 이 우슬초 묶음을 피에 적셔 문에 발랐어요 (출애굽기 12:22)." },
        { id: 'bundle', x: -8.6, z: 5.8, type: 'lore', title: "반죽 그릇", showCh: 2,
          body: "아직 부풀지 못한 반죽을 담은 그릇이에요 (출애굽기 12:34)." },
        // ── 고센의 히브리 사람들 ──
        { id: 'hb_father', x: -4, z: -3, type: 'villager', title: "히브리 아버지", lazy: 1, model: 'he-father',
          body: "\"우리 조상 요셉이 이 땅에 있을 때는 좋았다지. 그런데 요셉을 알지 못하는 새 왕이 일어난 뒤로 모든 게 달라졌단다.\"\n\n요셉을 알지 못하는 새 왕이 애굽을 다스리면서 이스라엘 자손의 고난이 시작되었습니다 (출애굽기 1:8)." },
        { id: 'hb_mother', x: -9, z: 1, type: 'villager', title: "히브리 어머니", lazy: 1, model: 'he-mother',
          body: "\"아이들이 자꾸 늘어나니 애굽 사람들이 우리를 더 두려워한대. 그래도 하나님이 주신 생명인걸.\"\n\n애굽 사람들이 괴롭게 할수록 이스라엘 백성은 더욱 번성하여 퍼져 나갔습니다 (출애굽기 1:12)." },
        { id: 'hb_grandma', x: -10, z: 12, type: 'villager', title: "히브리 할머니", lazy: 1, model: 'he-grandma',
          body: "\"밤마다 하나님께 부르짖는단다. 하나님은 우리의 신음 소리를 듣고 계셔.\"\n\n이스라엘 자손이 고된 노동 때문에 탄식하며 부르짖자, 하나님이 그 신음 소리를 들으시고 아브라함·이삭·야곱과 세운 언약을 기억하셨습니다 (출애굽기 2:23-24)." },
        { id: 'hb_boy', x: 2, z: 3, type: 'villager', title: "히브리 소년", lazy: 1, model: 'he-boy-hb',
          body: "\"우리 아빠는 매일 흙을 이기고 벽돌을 구워요. 나도 크면 해야 하는 걸까요?\"\n\n애굽 사람들은 흙 이기기와 벽돌 굽기와 농사의 여러 가지 고된 일로 이스라엘 백성을 괴롭혔습니다 (출애굽기 1:14)." },
        { id: 'hb_brickmaker', x: 10, z: 11, type: 'villager', title: "벽돌공", lazy: 1, model: 'he-brickmaker',
          body: "\"감독들이 매일 벽돌 개수를 세어요. 짚은 우리가 직접 주워 와야 하고요.\"\n\n바로는 백성에게 짚을 주지 말고 스스로 줍게 하되, 벽돌 수는 전과 같이 채우게 하라고 명령했습니다 (출애굽기 5:7-8)." },
        // ── 애굽 사람들 ──
        { id: 'eg_gatekeeper', x: 26.4, z: -19.3, type: 'villager', title: "궁전 문지기", lazy: 1, model: 'eg-gatekeeper',
          body: "\"이곳은 바로의 궁전이다. 아무나 들어갈 수 없다.\"" },
        { id: 'eg_noble', x: 22, z: -20, type: 'villager', title: "애굽 귀족 부인", lazy: 1, model: 'eg-noble-f',
          body: "\"히브리 사람들이 너무 많아졌다고 다들 걱정하더군요. 그래서 왕께서 그들에게 더 무거운 일을 시키신대요.\"\n\n애굽 왕은 이스라엘 자손이 많고 강해지는 것을 두려워해 감독들을 세우고 무거운 짐을 지웠습니다 (출애굽기 1:9-11)." },
        { id: 'eg_farmer_m', x: 26, z: 6, type: 'villager', title: "애굽 농부", lazy: 1, model: 'eg-farmer-m',
          body: "\"해마다 나일 강이 넘치면 밭이 기름져진다네. 애굽 사람들은 나일 강 없이는 살 수 없지.\"" },
        { id: 'eg_water', x: 21, z: -2, type: 'villager', title: "물 긷는 애굽 여인", lazy: 1, model: 'eg-water-carrier-f',
          body: "\"매일 아침 나일 강에 가서 물을 길어 와요. 강물이 없으면 하루도 못 살아요.\"" },
        { id: 'eg_boy', x: 24, z: 9.5, type: 'villager', title: "애굽 소년", lazy: 1, model: 'eg-boy-eg',
          body: "\"저 히브리 아이는 왜 맨날 일만 해? 난 오늘 강가에 가서 놀 건데!\"" },
        // ── 바로의 궁전 사람들 ──
        { id: 'pal_servant_m', x: 32, z: -11, type: 'villager', title: "바로의 신하", lazy: 1, model: 'pal-servant-m',
          body: "\"왕께서 오늘도 두루마리에 적을 명령을 내리셨소. 벽돌 수를 줄이지 말라는 명령이지.\"\n\n바로는 백성의 감독들과 기록원들에게 벽돌 수를 줄이지 말라고 명령했습니다 (출애굽기 5:6-8)." },
        { id: 'pal_servant_f', x: 66.2, z: -47.5, type: 'villager', title: "궁전 시녀", lazy: 1, model: 'pal-servant-f',
          body: "\"궁전 안에서는 조용히 해야 해요. 왕께서 기분이 좋지 않으시거든요.\"" },
        { id: 'pal_magician1', staff: 1, x: 56.2, z: -46.8, type: 'villager', title: "애굽 요술사", lazy: 1, model: 'pal-magician-1',
          body: "\"우리도 지팡이로 뱀을 만들 수 있다. 히브리 사람의 신이 그리 대단한지 두고 보겠다.\"\n\n바로가 현인들과 마술사들을 부르자, 애굽 요술사들도 그들의 요술로 지팡이를 뱀이 되게 했습니다. 그러나 아론의 지팡이가 그들의 지팡이를 삼켰습니다 (출애굽기 7:11-12)." },
        { id: 'pal_magician2', staff: 1, x: 63.8, z: -46.8, type: 'villager', title: "애굽 요술사", lazy: 1, model: 'pal-magician-2',
          body: "\"…….\"\n\n(요술사는 말없이 왕좌 쪽을 바라보고 있습니다.)" },
      ],
    },
    // ── 홍해 바닷가(비하히롯, 출 14:2): 서쪽 광야 → 가운데 이스라엘 진영 → 동쪽 바다(가운데가 갈라짐) → 건너편 해변 ──
    redsea: {
      name: '홍해 바닷가', questTitle: '📜 퀘스트 — 홍해 앞',
      env: { top: 0x3f86d6, bottom: 0xfbe7c4, fog: 0xe8dcc0, fogD: 0.011, sun: 0xfff2d8, sunDir: [0.55, 0.5, -0.65], cloud: 0.35, cloudCol: 0xffffff, stars: 0, far: 'far-mountains' },
      center: [0, 0], spawn: [-44, 0],
      sea: { x0: 17, x1: 49, gap: 5.5 },
      layout: [
        ['tent-cluster', -6, -13, faceTo(-6, -13, 0, 0)], ['tent-large', 7, -13, faceTo(7, -13, 0, 0)], ['tent-mid', -13, 7, faceTo(-13, 7, 0, 0)], ['tent-mid', 4, 13, faceTo(4, 13, 0, 0)],
        ['tent-small', -17, -5, faceTo(-17, -5, 0, 0)], ['tent-small', 10, 8, faceTo(10, 8, 0, 0)], ['tent-small', -8, 14, faceTo(-8, 14, 0, 0)],
        ['camp-firepit', 0, 0, 0], ['tribe-banner', -3.5, 8, 0], ['tribe-banner', 3.5, -8, 0.5], ['crates-sacks', -10, -3, 0.4], ['jars', 7.5, -4, 0.3],
        ['env-rock-hill', -31, -17, 0.4],
        ['env-reeds', 15, 12, 0], ['env-reeds', 15.5, -14, 1], ['env-river-stones', 14.5, 8, 0.3], ['env-rocks-strata', 13.5, -22, 0.8],
        ['rock-group', 25, -2.2, 0.3, 0.75], ['rock-group', 29.5, 1.8, 0.9, 0.7], ['rock-group', 33.5, 2.4, 1.2, 0.75], ['rock-group', 38, -2.6, 2.4, 0.7], ['rock-group', 43, -0.8, 2.0, 0.75], ['rock-group', 47, 2.2, 0.5, 0.7],
        ['env-date-palm', 58, 10, 0.3], ['env-date-palm', 61, -10, 1.2], ['env-acacia', 55, -15, 0.5], ['env-rocks-strata', 60, 16, 2], ['env-river-stones', 52.5, -7, 0.5],
      ],
      scatter: [['palm', 8, 24, 62], ['rock-group', 8, 22, 62], ['dry-bush', 10, 18, 62]],
      clear: [[0, 0, 19], [-30, -14, 8], [33, 0, 20], [57, 0, 11], [-44, 0, 6], [-24, 4, 4]],
      fires: [],
      points: [
        { id: 'moses', x: 10, z: 3, type: 'npc', title: "모세", model: 'moses', persona: 'rs_static' },
        { id: 'aaron', x: 11.5, z: -1.5, type: 'npc', title: "아론", model: 'aaron', persona: 'rs_static' },
        { id: 'miriam', x: -4, z: 5, type: 'npc', title: "미리암", model: 'miriam', persona: 'rs_miriam',
          body: "\"아기였던 모세를 갈대 상자에 두고 멀리서 지켜보던 게 엊그제 같은데… 이제 우리가 함께 애굽을 떠났어요.\"" },
        { id: 'joshua', x: -27.5, z: -10.5, type: 'villager', title: "여호수아", model: 'joshua', persona: 'rs_static',
          body: "\"뒤쪽을 잘 살피고 있어요. 무슨 일이 있으면 알려 줄게요.\"" },
        { id: 'rs_builder', x: -3, z: -8.5, type: 'villager', title: "장막 짓는 사람", model: 'ca-tent-builder',
          body: "\"여기 바닷가에 장막을 치라고 하셨대.\" (출애굽기 14:2)" },
        { id: 'rs_old', x: -10, z: 1, type: 'villager', title: "나이 든 사람", model: 'he-grandpa', body: "\"바다 냄새가 나는구먼.\"" },
        { id: 'rs_mom', x: 4, z: 6, type: 'villager', title: "아이 엄마", model: 'he-mother', body: "\"아이들이 지쳤어요. 좀 쉬어야 할 텐데.\"" },
        { id: 'rs_man', x: -6, z: 10.5, type: 'villager', title: "이스라엘 사람", model: 'ca-craftsman', body: "\"애굽을 떠나다니, 아직도 꿈만 같아.\"" },
        { id: 'rs_singer', x: -1, z: 12, type: 'villager', title: "노래하는 여인", lazy: 1, model: 'ca-singer-f', body: "\"여호와께서 우리를 인도하신다!\"" },
        { id: 'rs_water', x: 8, z: -2, type: 'villager', title: "물 나르는 소년", lazy: 1, model: 'ca-water-boy', body: "\"물통이 무거워요!\"" },
        { id: 'rs_elder', x: -8, z: -4, type: 'villager', title: "이스라엘 장로", lazy: 1, model: 'ca-israel-elder', body: "\"요셉의 유골도 우리와 함께 있다네.\" (출애굽기 13:19)" },
        { id: 'rs_boy', x: -12, z: 12, type: 'villager', title: "이스라엘 소년", lazy: 1, model: 'he-boy-hb', body: "\"불 기둥이 밤새 우리를 비춰 줬어요!\"" },
        { id: 'ch_rhythm', x: 56.5, z: -6.5, type: 'lore', title: "🎮 소고 찬양 도전", challenge: 'rhythm', cond: 'rhythm', body: '' },
        { id: 'rs_tired1', x: 30, z: 2.5, type: 'villager', title: "지친 할머니", model: 'he-grandma', persona: 'rs_static', cond: 'tired', help: true, body: '' },
        { id: 'rs_tired2', x: 38.5, z: -2.5, type: 'villager', title: "넘어진 아이", model: 'he-boy-hb', persona: 'rs_static', cond: 'tired', help: true, body: '' },
        { id: 'lookout', x: -27, z: -12.5, type: 'lore', title: "바위 언덕", body: "진영 서쪽 바위 언덕이에요. 우리가 지나온 광야 쪽이 멀리 보여요." },
        { id: 'sea', x: 15.4, z: 0, type: 'lore', title: "홍해 바닷가", body: "앞은 넓은 바다예요. 건너갈 길이 보이지 않아요." },
        { id: 'to-egypt3', x: -50, z: 0, type: 'exit', title: "애굽 쪽으로", to: 'egypt', spawn: [44, 14] },
        { id: 'to-alpha3', x: 62, z: 3, type: 'exit', title: "두루마리마을로(복습)", to: 'alpha', spawn: [0, 16], needStep: 'c4s10', lockMsg: '먼저 바다를 건너야 해요' },
        { id: 'to-wild', x: 61, z: -6, type: 'exit', title: "신 광야로", to: 'wild', spawn: [-35, 2], showCh: 4 },
      ],
    },
    wild: {
      name: '신 광야', questTitle: '📜 퀘스트 — 광야의 만나',
      env: { top: 0x4a7fc4, bottom: 0xf6dcb0, fog: 0xecd6b4, fogD: 0.012, sun: 0xfff0d0, sunDir: [0.4, 0.45, -0.7], cloud: 0.25, cloudCol: 0xffffff, stars: 0, far: 'far-mountains' },
      center: [0, 0], spawn: [-35, 2],
      // 물웅덩이: [x, z, 반지름, 종류] — 마라(처음엔 쓴 물)·엘림 샘 열둘
      pools: [[-22, -3, 3.4, 'mara']].concat(Array.from({ length: 12 }, (_, i) => [4 + Math.cos(i / 12 * Math.PI * 2) * 5, -16 + Math.sin(i / 12 * Math.PI * 2) * 5, 0.8, 'spring'])),
      layout: [
        ['env-acacia', -17.5, -8.8, 0.6],
        ['env-date-palm', 4 + 9, -16, 0.2], ['env-date-palm', 4 - 9, -16, 1.4], ['env-date-palm', 4, -16 + 9, 2.2], ['env-date-palm', 4 + 6.4, -16 - 6.4, 0.9], ['env-date-palm', 4 - 6.4, -16 + 6.4, 2.9],
        ['palm', 4 - 6.4, -16 - 6.4, 0.3], ['palm', 4 + 6.4, -16 + 6.4, 1.8], ['palm', 4, -16 - 9.5, 2.6], ['palm', 4 + 9.5, -9, 0.7],
        ['tent-cluster', 26, -3, faceTo(26, -3, 22, 2)], ['tent-large', 17, 9, faceTo(17, 9, 22, 2)], ['tent-mid', 28, 9, faceTo(28, 9, 22, 2)], ['tent-mid', 15, -6, faceTo(15, -6, 22, 2)],
        ['tent-small', 22, -10, faceTo(22, -10, 22, 2)], ['tent-small', 31, 2, faceTo(31, 2, 22, 2)],
        ['camp-firepit', 22, 2, 0], ['tribe-banner', 18.5, 3.5, 0.3], ['tribe-banner', 26, 6.5, 1.1], ['crates-sacks', 24.5, -6.8, 0.4], ['jars', 19.5, -4.5, 0.2],
        ['env-rock-hill', -31, -20, 0.4], ['env-rocks-strata', -6, 20, 1.2], ['env-rocks-strata', 36, -20, 2.4], ['env-river-stones', -24.5, 1.2, 0.3], ['dry-bush', -28, -9, 0], ['dry-bush', -12, 6, 0],
      ],
      scatter: [['dry-bush', 10, 16, 55], ['rock-group', 8, 20, 55]],
      clear: [[-22, -3, 7], [4, -16, 11], [22, 1, 14], [-35, 2, 5], [33, 7, 5]],
      fires: [],
      points: [
        { id: 'moses', x: -19.5, z: 1.2, type: 'npc', title: "모세", model: 'moses', persona: 'rs_static' },
        { id: 'aaron', x: 21.5, z: 1.5, type: 'npc', title: "아론", model: 'aaron', persona: 'rs_static' },
        { id: 'wd_thirsty1', x: -25.5, z: 1.8, type: 'villager', title: "목마른 할아버지", model: 'he-grandpa', persona: 'rs_static', body: "\"물이 달아졌어! 살았다…\"" },
        { id: 'wd_thirsty2', x: -26.5, z: -6.8, type: 'villager', title: "목마른 어머니", model: 'he-mother', persona: 'rs_static', body: "\"아이들이 이제 물을 마셔요. 여호와께 감사해요.\"" },
        { id: 'wd_hungry1', x: 16.5, z: 5.5, type: 'villager', title: "배고픈 사람", model: 'ca-craftsman', persona: 'rs_static', body: "\"아침마다 만나가 내리다니… 원망했던 게 부끄럽구나.\"" },
        { id: 'wd_hungry2', x: 25.5, z: 7.8, type: 'villager', title: "배고픈 아이", model: 'he-boy-hb', persona: 'rs_static', body: "\"만나는 꿀 섞은 과자 맛이 나요!\"" },
        { id: 'wd_greedy', x: 21.5, z: -7.5, type: 'villager', title: "욕심 많은 사람", model: 'he-father', persona: 'rs_static', body: "\"이제는 먹을 만큼만 거둬. 내일 것은 내일 주시니까.\"" },
        { id: 'mara_tree', x: -17.5, z: -6.8, type: 'lore', title: "가리키신 나무", showCh: 4, body: "여호와께서 모세에게 가리키신 나무예요." },
        { id: 'quail_spot', x: 24, z: -14.5, type: 'lore', title: "진영 가장자리", showCh: 4, body: "진영 남쪽 가장자리예요. 저녁이면 메추라기가 날아왔던 곳이에요." },
        { id: 'field_empty', x: 34, z: 7, type: 'lore', title: "만나 들판", showCh: 4, body: "아침마다 만나가 내리는 들판이에요." },
        { id: 'to-redsea2', x: -39.5, z: 2, type: 'exit', title: "홍해 쪽으로", to: 'redsea', spawn: [56, 6] },
        { id: 'to-rephidim', x: 38, z: -9, type: 'exit', title: "르비딤으로", to: 'rephidim', spawn: [-34, 4], showCh: 5 },
      ],
    },
    rephidim: {
      name: '르비딤', questTitle: '📜 퀘스트 — 르비딤',
      env: { top: 0x5a86c0, bottom: 0xf0d2a4, fog: 0xe6ceaa, fogD: 0.013, sun: 0xffe9c8, sunDir: [0.5, 0.42, -0.6], cloud: 0.2, cloudCol: 0xffffff, stars: 0, far: 'far-mountains' },
      center: [0, 0], spawn: [-34, 4],
      layout: [
        ['env-rock-hill', -19, -13.5, 0.4, 1.35], ['env-rocks-strata', -24, -8, 1.1],
        ['env-rock-hill', 27, -21, 2.1, 1.25], ['env-rocks-strata', 31, -15, 0.3], ['rock-group', 22, -18, 1.2, 0.9],
        ['tent-cluster', -2, -9, faceTo(-2, -9, 0, 0)], ['tent-large', 9, -6, faceTo(9, -6, 0, 0)], ['tent-mid', -10, 6, faceTo(-10, 6, 0, 0)], ['tent-mid', 7, 9, faceTo(7, 9, 0, 0)],
        ['tent-small', -13, -4, faceTo(-13, -4, 0, 0)], ['tent-small', 13, 3, faceTo(13, 3, 0, 0)],
        ['camp-firepit', 0, 1, 0], ['tribe-banner', -4, 5, 0.3], ['crates-sacks', 4, -3, 0.5], ['jars', -6, -1, 0.2],
        ['dry-bush', 20, 8, 0], ['dry-bush', -26, 10, 0], ['env-acacia', 34, 12, 0.8],
      ],
      scatter: [['dry-bush', 10, 16, 55], ['rock-group', 10, 20, 55]],
      clear: [[0, 0, 13], [-17, -11, 8], [26, -16, 8], [18, -6, 5], [28, 4, 12], [-34, 4, 5]],
      fires: [],
      points: [
        { id: 'moses', x: 2, z: 2.5, type: 'npc', title: "모세", model: 'moses', persona: 'rs_static' },
        { id: 'aaron', x: 4.5, z: 0.5, type: 'npc', title: "아론", model: 'aaron', persona: 'rs_static' },
        { id: 'hur', x: 6, z: 2.5, type: 'npc', title: "훌", model: 'hur', persona: 'rs_static' },
        { id: 'joshua', x: -1.5, z: 4.5, type: 'npc', title: "여호수아", model: 'joshua', persona: 'rs_static' },
        { id: 'rp_elder', x: -8, z: 1, type: 'villager', title: "이스라엘 장로", model: 'ca-israel-elder', persona: 'rs_static', body: "\"반석에서 물이 솟던 날을 잊지 못할 게다.\"" },
        { id: 'rp_angry1', x: -6.5, z: 8.5, type: 'villager', title: "목마른 아버지", model: 'he-father', persona: 'rs_static', body: "\"다툰 게 부끄럽구나. 여호와께서 우리 중에 계셨는데.\"" },
        { id: 'rp_angry2', x: 9.5, z: -1.5, type: 'villager', title: "걱정하는 어머니", model: 'he-mother', persona: 'rs_static', body: "\"아이들이 물을 실컷 마셨어요!\"" },
        { id: 'horeb_rock', x: -15.5, z: -10, type: 'lore', title: "호렙 반석", showCh: 5, body: "여호와께서 모세 앞에 서신 반석이에요. 지팡이로 치니 물이 솟아났어요." },
        { id: 'hands_spot', x: 26, z: -14.2, type: 'lore', title: "산 꼭대기", showCh: 5, body: "모세와 아론과 훌이 올라 손을 들고 기도한 곳이에요." },
        { id: 'altar_nissi', x: 18, z: -6, type: 'lore', title: "여호와 닛시 제단", showCh: 5, body: "모세가 쌓은 제단 — 여호와는 나의 깃발." },
        { id: 'to-wild2', x: -39.5, z: 4, type: 'exit', title: "신 광야로", to: 'wild', spawn: [34, -6] },
        { id: 'to-sinai', x: 4, z: 27, type: 'exit', title: "하나님의 산으로", to: 'sinai', spawn: [-34, 6], showCh: 6 },
      ],
    },
    sinai: {
      name: '시내 산 앞', questTitle: '📜 퀘스트 — 하나님의 산',
      env: { top: 0x4c78b4, bottom: 0xe9d6b8, fog: 0xdcccb4, fogD: 0.011, sun: 0xfff0d8, sunDir: [0.3, 0.5, -0.8], cloud: 0.3, cloudCol: 0xffffff, stars: 0, far: 'far-mountains' },
      center: [0, 0], spawn: [-34, 6],
      mountain: { x: 0, z: -48, r: 19, h: 38 },
      layout: [
        ['tent-large', 1, 7, faceTo(1, 7, 0, 0)], ['tent-cluster', 12, 10, faceTo(12, 10, 0, 0)], ['tent-cluster', -12, 12, faceTo(-12, 12, 0, 0)],
        ['tent-mid', 18, 1, faceTo(18, 1, 0, 0)], ['tent-mid', -18, 2, faceTo(-18, 2, 0, 0)], ['tent-small', 8, 16, 0.4], ['tent-small', -6, 18, 2.1],
        ['camp-firepit', 0, 13, 0], ['tribe-banner', -3.5, 2, 0.2], ['tribe-banner', 6, 2.5, 1.2], ['crates-sacks', 10, 4, 0.4], ['jars', -9, 6, 0.3],
        ['env-rocks-strata', -26, -20, 0.6], ['env-rocks-strata', 24, -22, 2.1], ['env-rock-hill', -34, -30, 0.5], ['env-rock-hill', 34, -32, 1.9],
        ['dry-bush', -20, -10, 0], ['dry-bush', 18, -12, 0],
      ],
      scatter: [['dry-bush', 8, 20, 55], ['rock-group', 10, 22, 55]],
      clear: [[0, 6, 20], [0, -30, 14], [-34, 6, 5]],
      fires: [],
      points: [
        { id: 'moses', x: -2, z: 4.5, type: 'npc', title: "모세", model: 'moses', persona: 'rs_static' },
        { id: 'aaron', x: 3, z: 1, type: 'npc', title: "아론", model: 'aaron', persona: 'rs_static' },
        { id: 'jethro', x: -30, z: 4, type: 'npc', title: "이드로", model: 'jethro', persona: 'rs_static', cond: 'jethroHere' },
        { id: 'zipporah', x: -28, z: 6.5, type: 'villager', title: "십보라", model: 'he-mother', persona: 'rs_static', cond: 'jethroHere', body: "\"모세가 이렇게 많은 백성을 이끌고 있었다니…\"" },
        { id: 'gershom', x: -26.5, z: 5, type: 'villager', title: "게르솜", model: 'shepherd-boy', persona: 'rs_static', cond: 'jethroHere', body: "\"아버지가 홍해를 건넌 이야기를 해 주셨어!\"" },
        { id: 'eliezer', x: -27, z: 8, type: 'villager', title: "엘리에셀", model: 'child', persona: 'rs_static', cond: 'jethroHere', body: "\"내 이름은 하나님이 도우신다는 뜻이야!\"" },
        { id: 'sn_line1', x: -6, z: -9, type: 'villager', title: "다툼이 있는 할아버지", model: 'he-grandpa', persona: 'rs_static', body: "\"십부장님이 금방 해결해 주셨지 뭐냐.\"" },
        { id: 'sn_line2', x: -3, z: -11, type: 'villager', title: "물으러 온 사람", model: 'ca-craftsman', persona: 'rs_static', body: "\"이제는 줄이 금방 줄어요.\"" },
        { id: 'sn_line3', x: 0, z: -12, type: 'villager', title: "기다리는 여인", model: 'ca-singer-f', persona: 'rs_static', body: "\"오늘은 해 지기 전에 집에 가요!\"" },
        { id: 'sn_family1', x: 14, z: 6, type: 'villager', title: "천막의 아버지", model: 'he-father', persona: 'rs_static', body: "\"깨끗한 옷을 입고 셋째 날을 기다린다.\"" },
        { id: 'sn_family2', x: -14, z: 7, type: 'villager', title: "천막의 할머니", model: 'he-grandma', persona: 'rs_static', body: "\"하나님은 거룩하시단다.\"" },
        { id: 'sn_family3', x: 7, z: 12.5, type: 'villager', title: "천막의 소년", model: 'he-boy-hb', persona: 'rs_static', body: "\"경계 안으로는 절대 안 들어가요!\"" },
        { id: 'boundary', x: 6, z: -25, type: 'lore', title: "산의 경계", showCh: 7, body: "산 둘레에 세운 경계예요. 삼가 산에 오르거나 경계를 침범하지 말라 하셨어요." },
        { id: 'to-rephidim2', x: -39.5, z: 6, type: 'exit', title: "르비딤으로", to: 'rephidim', spawn: [4, 22] },
        { id: 'to-kadesh', x: 39.5, z: 6, type: 'exit', title: "바란 광야 가데스로", to: 'kadesh', spawn: [-35, 4], cond: 'kadeshOpen' },
      ],
    },
    // ══ 3편 「광야 40년」의 중심 진영 — 바란 광야 가데스(민 13:26). 성막은 시내 산과 같은 자리(TAB)에 완성된 모습으로 선다 ══
    kadesh: {
      name: '바란 광야 가데스', questTitle: '📜 퀘스트 — 광야 40년',
      env: { top: 0x5a86c0, bottom: 0xf0d4a4, fog: 0xe8cfa8, fogD: 0.012, sun: 0xfff0d0, sunDir: [0.5, 0.45, -0.6], cloud: 0.3, cloudCol: 0xffffff, stars: 0, far: 'far-mountains' },
      center: [0, 0], spawn: [-35, 4],
      // 가데스의 샘(진영 북동쪽)
      pools: [[20, -26, 3.2, 'spring'], [25.5, -22, 1.1, 'spring'], [15, -22.5, 0.9, 'spring']],
      layout: [
        ['env-date-palm', 26, -30, 0.4], ['env-date-palm', 14, -30, 1.6], ['env-date-palm', 28, -19, 2.3], ['palm', 12, -18, 0.8], ['palm', 23, -32, 2.9], ['env-acacia', 31, -26, 1.1],
        ['tent-cluster', 20, 6, faceTo(20, 6, 0, -15)], ['tent-large', 10, 14, faceTo(10, 14, 0, -15)], ['tent-mid', 26, 16, faceTo(26, 16, 0, -15)], ['tent-mid', -16, 10, faceTo(-16, 10, 0, -15)],
        ['tent-cluster', -22, -2, faceTo(-22, -2, 0, -15)], ['tent-small', 30, -6, faceTo(30, -6, 0, -15)], ['tent-small', -6, 18, 2.1], ['tent-mid', -26, -24, faceTo(-26, -24, 0, -15)],
        ['camp-firepit', 16, 0, 0], ['tribe-banner', 20, -4, 0.3], ['tribe-banner', -12, 4, 1.1], ['crates-sacks', 24, 1, 0.4], ['jars', -18, 4, 0.3], ['firewood', 12, 4, 0.9],
        ['env-rock-hill', -32, -34, 0.4], ['env-rock-hill', 34, 34, 2.0], ['env-rocks-strata', -34, 22, 1.2], ['env-rocks-strata', 36, -36, 2.4], ['dry-bush', -30, -12, 0], ['dry-bush', 32, 10, 0],
      ],
      scatter: [['dry-bush', 8, 20, 55], ['rock-group', 10, 22, 55]],
      clear: [[-5, -15, 17], [-35, 4, 6], [20, -25, 8], [33, 26, 6], [0, 4, 8]],
      fires: [],
      points: [
        { id: 'moses', x: 15, z: -12, type: 'npc', title: "모세", model: 'moses', persona: 'rs_static' },
        { id: 'aaron', x: 15, z: -18, type: 'npc', title: "아론", model: 'aaron', persona: 'rs_static' },
        { id: 'kd_well', x: 20, z: -21.5, type: 'villager', title: "샘가의 어머니", model: 'he-mother', persona: 'rs_static', lazy: true, body: "\"여기 가데스엔 샘이 있어서 다행이에요.\"" },
        { id: 'kd_boy', x: 8, z: 8, type: 'villager', title: "천막의 소년", model: 'he-boy-hb', persona: 'rs_static', lazy: true, body: "\"저 멀리 약속의 땅이 있대요!\"" },
        { id: 'kd_grandpa', x: -14, z: 6, type: 'villager', title: "천막의 할아버지", model: 'he-grandpa', persona: 'rs_static', lazy: true, body: "\"애굽을 나온 지 벌써 두 해째로구나.\"" },
        { id: 'to-sinai3', x: -39.5, z: 4, type: 'exit', title: "시내 광야로", to: 'sinai', spawn: [35, 6] },
        { id: 'to-moab', x: 39.5, z: -4, type: 'exit', title: "모압 평지로", to: 'moab', spawn: [34, 0], cond: 'moabOpen' },
      ],
    },
    // ══ 3편 11~16장 — 모압 평지(민 22:1 "요단 건너편 곧 여리고 맞은편"). 서쪽에 요단 강, 남동쪽에 느보 산 ══
    moab: {
      name: '모압 평지', questTitle: '📜 퀘스트 — 광야 40년',
      env: { top: 0x5b8cc8, bottom: 0xecd9b0, fog: 0xe4d2ac, fogD: 0.011, sun: 0xfff2d4, sunDir: [0.55, 0.42, -0.5], cloud: 0.3, cloudCol: 0xffffff, stars: 0, far: 'far-mountains' },
      center: [0, 0], spawn: [34, 0],
      mountain: { x: 22, z: 44, r: 15, h: 26 },
      water: { x0: -45, x1: -38.5, z0: -48, z1: 48 },
      layout: [
        ['tent-cluster', 18, -2, faceTo(18, -2, 0, -15)], ['tent-large', 8, 12, faceTo(8, 12, 0, -15)], ['tent-mid', 24, 10, faceTo(24, 10, 0, -15)], ['tent-mid', -18, 6, faceTo(-18, 6, 0, -15)],
        ['tent-cluster', -24, -4, faceTo(-24, -4, 0, -15)], ['tent-small', 28, -12, faceTo(28, -12, 0, -15)], ['tent-small', -8, 16, 2.1], ['tent-mid', -26, -26, faceTo(-26, -26, 0, -15)],
        ['camp-firepit', 14, 4, 0], ['tribe-banner', 18, -8, 0.3], ['tribe-banner', -12, 2, 1.1], ['crates-sacks', 22, 2, 0.4], ['jars', -20, 2, 0.3],
        ['env-date-palm', -34, -18, 0.4], ['env-date-palm', -34, 12, 1.6], ['env-date-palm', -33, 30, 2.3], ['palm', -35, -32, 0.8], ['env-acacia', 30, -30, 1.1],
        ['env-rocks-strata', 36, -38, 2.4], ['dry-bush', 32, 20, 0], ['dry-bush', 6, -34, 0],
      ],
      scatter: [['dry-bush', 8, 20, 50], ['rock-group', 10, 22, 50]],
      clear: [[-5, -15, 17], [34, 0, 6], [22, 44, 17], [-28, 30, 6], [0, 4, 8], [-38, 0, 4]],
      fires: [],
      points: [
        { id: 'moses', x: 15, z: -12, type: 'npc', title: "모세", model: 'moses', persona: 'rs_static', cond: 'moabMoses' },
        { id: 'mb_woman', x: -30, z: 2, type: 'villager', title: "요단 강가의 여인", model: 'he-mother', persona: 'rs_static', lazy: true, body: "\"저 강 건너편이 여리고래요.\"" },
        { id: 'mb_boy', x: 6, z: 8, type: 'villager', title: "천막의 소년", model: 'he-boy-hb', persona: 'rs_static', lazy: true, body: "\"광야에서 태어났는데, 이제 강만 건너면 된대요!\"" },
        { id: 'to-kadesh2', x: 39.5, z: 0, type: 'exit', title: "가데스로", to: 'kadesh', spawn: [34, -4] },
      ],
    },
    // ══ 4편 「여호수아와 함께」 — 요단 서쪽 길갈과 여리고(수 4:19 "여리고 동쪽 경계 길갈"). 동쪽에 요단 강, 서쪽에 여리고 성, 북서쪽에 산지(수 2:16).
    //    성벽·라합의 집·길갈의 장막과 열두 돌은 두루마리(scrolls/joshua4.js)가 이야기 진행에 맞춰 세운다 ══
    gilgal: {
      name: '길갈과 여리고', questTitle: '📜 퀘스트 — 여호수아와 함께',
      env: { top: 0x5a8fcc, bottom: 0xe6dcb4, fog: 0xdfd4ae, fogD: 0.011, sun: 0xfff3d6, sunDir: [0.5, 0.45, -0.55], cloud: 0.3, cloudCol: 0xffffff, stars: 0, far: 'far-mountains' },
      center: [0, 0], spawn: [34, 0],
      mountain: { x: -26, z: -54, r: 15, h: 22 },
      water: { x0: 38.5, x1: 45, z0: -48, z1: 48 },
      layout: [
        ['env-date-palm', -4, 30, 0.4], ['env-date-palm', -12, 28, 1.6], ['env-date-palm', 2, 34, 2.3], ['palm', -34, 22, 0.8], ['env-date-palm', -36, -6, 1.2], ['palm', -30, -16, 2.6],
        ['env-date-palm', 30, 26, 0.9], ['env-date-palm', 33, -24, 2.0], ['palm', 31, 34, 1.4], ['env-acacia', 10, -34, 1.1], ['env-acacia', -6, -28, 2.2],
        ['env-rocks-strata', -38, -36, 1.2], ['env-rock-hill', 26, -38, 2.0], ['dry-bush', 4, -6, 0], ['dry-bush', -2, 10, 0],
      ],
      scatter: [['dry-bush', 8, 20, 50], ['rock-group', 8, 22, 50]],
      clear: [[-22, 6, 14], [34, 0, 6], [14, 4, 9], [-26, -34, 6], [-26, -54, 17], [16, 0, 16], [-42, 24, 5], [12, 40, 7], [-42, -12, 5], [-14, 44, 5], [8, -44, 5]],
      fires: [],
      points: [
        { id: 'to-moab4', x: 36, z: 7, type: 'exit', title: "요단 건너편 모압 평지로", to: 'moab', spawn: [-34, 2] },
        { id: 'to-ai', x: -42, z: 24, type: 'exit', title: "서쪽 길로 아이에 올라가기", to: 'ai', spawn: [34, 0], cond: 'aiOpen' },
        { id: 'to-gibeon', x: -42, z: -12, type: 'exit', title: "서쪽 길로 기브온에 올라가기", to: 'gibeon', spawn: [34, 0], cond: 'gibeonOpen' },
        { id: 'to-hebron', x: -14, z: 44, type: 'exit', title: "남쪽 길로 헤브론 산지에 올라가기", to: 'hebron', spawn: [0, -36], cond: 'hebronOpen' },
        { id: 'to-shiloh', x: 8, z: -44, type: 'exit', title: "북쪽 길로 실로에 올라가기", to: 'shiloh', spawn: [-34, 0], cond: 'shilohOpen' },
      ],
    },
    // ══ 4편 7·8장 — 아이와 에발 산(수 7:2 "벧엘 동쪽 벧아웬 곁에 있는 아이", 8:30·33 에발 산과 그리심 산).
    //    아이 성·벧엘·제단은 두루마리가 세운다. 북쪽 두 산(오른쪽 에발 · 왼쪽 그리심) 사이에 궤가 선다 ══
    ai: {
      name: '아이와 에발 산', questTitle: '📜 퀘스트 — 여호수아와 함께',
      env: { top: 0x5a8fcc, bottom: 0xdcd6b0, fog: 0xd8d0aa, fogD: 0.011, sun: 0xfff3d6, sunDir: [0.5, 0.45, -0.55], cloud: 0.35, cloudCol: 0xffffff, stars: 0, far: 'far-mountains' },
      center: [0, 0], spawn: [34, 0],
      mountain: { x: 18, z: -54, r: 14, h: 24 },
      mountain2: { x: -18, z: -54, r: 13, h: 21 },
      layout: [
        ['env-acacia', 22, 20, 0.4], ['env-acacia', -30, 24, 1.6], ['env-acacia', 6, -22, 2.3], ['env-rock-hill', -40, -24, 0.4], ['env-rock-hill', 30, 34, 2.0],
        ['env-rocks-strata', -36, 34, 1.2], ['env-rocks-strata', 36, -30, 2.4], ['dry-bush', 14, 4, 0], ['dry-bush', -18, -6, 0], ['dry-bush', 24, -12, 0],
      ],
      scatter: [['dry-bush', 8, 20, 55], ['rock-group', 12, 20, 55]],
      clear: [[-8, 6, 10], [-8, -14, 6], [-24, 6, 5], [-38, 6, 7], [34, 0, 6], [0, -33, 8], [12, -30, 5], [18, -54, 15], [-18, -54, 14], [14, 10, 8]],
      fires: [],
      points: [
        { id: 'to-gilgal3', x: 39.5, z: 0, type: 'exit', title: "동쪽 길로 길갈에 내려가기", to: 'gilgal', spawn: [-38, 22] },
      ],
    },
    // ══ 4편 9·10장 — 기브온과 아얄론(수 9:17 기브온 · 10:10 벧호론 비탈 · 10:12 아얄론 골짜기 · 10:16 막게다의 굴).
    //    기브온 성·다섯 왕의 진·해와 달·굴은 두루마리가 세운다 ══
    gibeon: {
      name: '기브온과 아얄론', questTitle: '📜 퀘스트 — 여호수아와 함께',
      env: { top: 0x5a8fcc, bottom: 0xddd6ae, fog: 0xd8d0aa, fogD: 0.011, sun: 0xfff3d6, sunDir: [0.5, 0.45, -0.55], cloud: 0.3, cloudCol: 0xffffff, stars: 0, far: 'far-mountains' },
      center: [0, 0], spawn: [34, 0],
      mountain: { x: -6, z: -54, r: 15, h: 20 },
      layout: [
        ['env-acacia', 20, 22, 0.4], ['env-acacia', -20, 30, 1.6], ['env-acacia', 16, -24, 2.3], ['env-rock-hill', -42, -26, 0.4], ['env-rock-hill', 34, 32, 2.0],
        ['env-rocks-strata', 30, -34, 1.2], ['dry-bush', 12, 6, 0], ['dry-bush', -14, 18, 0], ['dry-bush', 24, -10, 0],
      ],
      scatter: [['dry-bush', 8, 20, 55], ['rock-group', 12, 20, 55]],
      clear: [[-4, -4, 11], [-30, 6, 8], [-40, 18, 6], [-18, 20, 6], [10, 32, 8], [34, 0, 6], [-6, -54, 16], [18, 6, 6]],
      fires: [],
      points: [
        { id: 'to-gilgal4', x: 39.5, z: 0, type: 'exit', title: "동쪽 길로 길갈에 내려가기", to: 'gilgal', spawn: [-38, -12] },
        { id: 'to-philistia', x: -42, z: -6, type: 'exit', title: "서쪽 길로 블레셋 평지에 내려가기", to: 'philistia', spawn: [36, 0], cond: 'philistiaOpen' },
        { id: 'to-gibeah', x: 40, z: -24, type: 'exit', title: "동북쪽 길로 기브아에 올라가기", to: 'gibeah', spawn: [-36, 20], cond: 'gibeahOpen' },
      ],
    },
    // ══ 4편 11장 — 헤브론 산지(수 14:12 "이 산지를 지금 내게 주소서" · 14:15 헤브론의 옛 이름은 기럇 아르바) ══
    hebron: {
      name: '헤브론 산지', questTitle: '📜 퀘스트 — 여호수아와 함께',
      env: { top: 0x5a8fcc, bottom: 0xd6d2aa, fog: 0xd2cca6, fogD: 0.012, sun: 0xfff3d6, sunDir: [0.5, 0.45, -0.55], cloud: 0.35, cloudCol: 0xffffff, stars: 0, far: 'far-mountains' },
      center: [0, 0], spawn: [0, -36],
      mountain: { x: -24, z: 30, r: 16, h: 26 },
      mountain2: { x: 22, z: 34, r: 13, h: 20 },
      layout: [
        ['env-acacia', 18, -18, 0.4], ['env-acacia', -22, -22, 1.6], ['env-acacia', 26, 4, 2.3], ['env-rock-hill', -38, -6, 0.4], ['env-rock-hill', 38, -26, 2.0],
        ['env-rocks-strata', -30, 8, 1.2], ['env-rocks-strata', 30, 18, 2.4], ['dry-bush', 6, -8, 0], ['dry-bush', -8, 4, 0], ['dry-bush', 12, 14, 0],
      ],
      scatter: [['dry-bush', 8, 20, 55], ['rock-group', 14, 20, 55]],
      clear: [[0, -36, 6], [-4, 14, 10], [0, -14, 5], [0, -2, 4], [-24, 30, 17], [22, 34, 14], [39, -8, 7]],
      fires: [],
      points: [
        { id: 'to-gilgal5', x: 0, z: -42, type: 'exit', title: "북쪽 길로 길갈에 내려가기", to: 'gilgal', spawn: [-14, 38] },
        { id: 'to-bethlehem', x: -42, z: -16, type: 'exit', title: "서북쪽 길로 베들레헴에 가기", to: 'bethlehem', spawn: [0, 36], cond: 'bethlehemOpen' },
        { id: 'to-judah', x: 42, z: -8, type: 'exit', title: "동쪽 길로 유다 광야에 내려가기", to: 'judah', spawn: [36, 0], cond: 'judahOpen' },
      ],
    },
    // ══ 4편 12·13장 — 실로와 세겜(수 18:1 실로의 회막 · 22:10 요단 언덕 가의 큰 제단 · 24:1, 26 세겜 · 성소 곁 상수리나무).
    //    회막은 엔진이(2·3편과 같은 모양), 제단·상수리나무·큰 돌은 두루마리가 세운다. 요단은 동쪽 ══
    shiloh: {
      name: '실로와 세겜', questTitle: '📜 퀘스트 — 여호수아와 함께',
      env: { top: 0x5a8fcc, bottom: 0xdcd8b2, fog: 0xd6d0aa, fogD: 0.011, sun: 0xfff3d6, sunDir: [0.5, 0.45, -0.55], cloud: 0.3, cloudCol: 0xffffff, stars: 0, far: 'far-mountains' },
      center: [0, 0], spawn: [-34, 0],
      mountain: { x: 10, z: -56, r: 14, h: 22 },
      water: { x0: 40, x1: 46, z0: -48, z1: 48 },
      layout: [
        ['env-acacia', -24, 22, 0.4], ['env-acacia', -30, -24, 1.6], ['env-date-palm', 16, 28, 2.3], ['env-rock-hill', -42, 30, 0.4], ['env-rocks-strata', -40, -34, 2.0],
        ['tent-mid', -26, -8, 0.6], ['tent-small', -22, 10, 2.2], ['tent-mid', 4, 12, 1.4], ['dry-bush', 10, -2, 0], ['dry-bush', -16, -30, 0],
      ],
      scatter: [['dry-bush', 8, 20, 50], ['rock-group', 10, 22, 50]],
      clear: [[-34, 0, 6], [-5, -15, 16], [26, 16, 10], [34, -24, 6], [10, -56, 15], [20, 30, 5], [-14, 2, 4], [30, -20, 4], [18, -6, 6]],
      fires: [],
      points: [
        { id: 'to-gilgal6', x: -39.5, z: 0, type: 'exit', title: "서쪽 길로 길갈에 내려가기", to: 'gilgal', spawn: [8, -38] },
        { id: 'to-jezreel', x: -20, z: -44, type: 'exit', title: "북쪽 길로 이스르엘 골짜기에 올라가기", to: 'jezreel', spawn: [0, 36], cond: 'jezreelOpen' },
      ],
    },
    // ══ 5편 「사사들과 함께」 — 이스르엘 골짜기(삿 4:6 다볼 산 · 4:13 기손 강 · 4:11 사아난님 상수리나무 · 6:33 이스르엘 골짜기 · 7:1 하롯 샘 · 모레 산).
    //    다볼 산은 북동쪽, 모레 산은 북서쪽, 기손 강은 서쪽. 병거·장막·헤벨의 장막은 두루마리(scrolls/judges5.js)가 세운다 ══
    jezreel: {
      name: '이스르엘 골짜기', questTitle: '📜 퀘스트 — 사사들과 함께',
      env: { ground: 0xa8c47a, top: 0x5a8fcc, bottom: 0xc8d4a0, fog: 0xccd6a8, fogD: 0.010, sun: 0xfff3d6, sunDir: [0.5, 0.45, -0.55], cloud: 0.35, cloudCol: 0xffffff, stars: 0, far: 'far-mountains' },
      center: [0, 0], spawn: [0, 36],
      mountain: { x: 28, z: -40, r: 15, h: 24 },
      mountain2: { x: -22, z: -46, r: 12, h: 16 },
      water: { x0: -46, x1: -40, z0: -48, z1: 48 },
      layout: [
        ['env-acacia', 30, 22, 0.4], ['env-acacia', -10, 30, 1.6], ['env-acacia', 8, -6, 2.3], ['env-reeds', -38, -14, 0.4], ['env-reeds', -38, 10, 1.2], ['env-reeds', -37, 30, 2.0],
        ['env-rock-hill', 38, 34, 2.0], ['env-rocks-strata', 36, -14, 1.2], ['dry-bush', 4, 18, 0], ['dry-bush', -14, -18, 0],
      ],
      scatter: [['dry-bush', 6, 20, 50], ['rock-group', 8, 22, 50]],
      clear: [[0, 36, 6], [16, -18, 9], [22, -28, 5], [-30, -4, 11], [-24, 24, 7], [28, -40, 16], [-22, -46, 13], [0, 44, 5], [-9, -9, 6], [-17, -15, 4], [-12, 7, 4], [6, 22, 6], [-12, -29, 11]],
      fires: [],
      points: [
        { id: 'to-shiloh-j', x: 0, z: 42, type: 'exit', title: "남쪽 길로 실로에 내려가기", to: 'shiloh', spawn: [-20, -38] },
      ],
    },
    // ══ 5편 8~10장 — 블레셋 평지(삿 13:2 소라 · 14:1 딤나 · 15:8 에담 바위 · 15:9 레히 · 16:1 가사 · 16:4 소렉 골짜기 · 16:23 다곤의 집).
    //    동쪽 언덕 소라, 가운데 딤나, 남동쪽 에담 바위와 레히, 서쪽 바닷가 가사. 집·밭·성문·기둥은 두루마리가 세운다 ══
    philistia: {
      name: '블레셋 평지', questTitle: '📜 퀘스트 — 사사들과 함께',
      env: { ground: 0xe8dca8, top: 0x5a8fcc, bottom: 0xe2dab4, fog: 0xdcd6b4, fogD: 0.010, sun: 0xfff3d6, sunDir: [0.5, 0.45, -0.55], cloud: 0.3, cloudCol: 0xffffff, stars: 0, far: 'far-mountains' },
      center: [0, 0], spawn: [36, 0],
      mountain: { x: 36, z: -38, r: 12, h: 14 },
      water: { x0: -46, x1: -40, z0: -48, z1: 48 },
      layout: [
        ['env-acacia', 18, -32, 0.4], ['env-acacia', -18, 36, 1.6], ['env-rocks-strata', 38, 36, 1.2], ['dry-bush', 6, 6, 0], ['dry-bush', -16, -8, 0], ['env-reeds', -38, 20, 0.6], ['env-reeds', -38, -30, 1.4],
      ],
      scatter: [['dry-bush', 6, 20, 50], ['rock-group', 8, 22, 50]],
      clear: [[36, 0, 6], [28, -22, 9], [32, -28, 4], [30, -8, 4], [0, -12, 9], [12, -2, 6], [-4, -16, 4], [-8, 16, 8], [26, 26, 6], [18, 18, 4], [14, 30, 4], [-28, 2, 10], [8, 14, 6], [-30, 10, 4], [-30, -22, 8], [36, -38, 13], [42, 0, 4], [24, 8, 10], [-6, 6, 8], [6, -2, 4], [14, 6, 4], [-26, 6, 8]],
      fires: [],
      points: [
        { id: 'to-gibeon-p', x: 42, z: 0, type: 'exit', title: "동쪽 길로 기브온에 올라가기", to: 'gibeon', spawn: [-36, -6] },
      ],
    },
    // ══ 6편 「룻과 사무엘」 — 베들레헴(룻 1:19 · 2:3 보아스의 밭 · 3:2 타작마당 · 4:1 성문). 북쪽 언덕에 성읍, 서쪽 성문, 남쪽 보리밭, 동쪽 타작마당.
    //    집·성문·밭·타작마당은 두루마리(scrolls/ruth6.js)가 세운다 — 다윗의 고향이라 뒤의 두루마리에서도 다시 쓴다 ══
    bethlehem: {
      name: '베들레헴', questTitle: '📜 퀘스트 — 룻과 사무엘',
      env: { ground: 0xe6dca0, top: 0x5a8fcc, bottom: 0xe2d8ae, fog: 0xdcd4ac, fogD: 0.010, sun: 0xfff3d6, sunDir: [0.5, 0.45, -0.55], cloud: 0.3, cloudCol: 0xffffff, stars: 0, far: 'far-mountains' },
      center: [0, 0], spawn: [0, 36],
      mountain: { x: 0, z: -48, r: 16, h: 12 },
      layout: [
        ['env-acacia', 30, 26, 0.4], ['env-acacia', -28, 20, 1.6], ['env-date-palm', 22, -14, 2.3], ['env-rock-hill', -40, -30, 0.4], ['env-rock-hill', 40, -34, 2.0],
        ['env-rocks-strata', -38, 36, 1.2], ['dry-bush', -20, 4, 0], ['dry-bush', 32, 14, 0],
      ],
      scatter: [['dry-bush', 6, 20, 50], ['rock-group', 8, 22, 50]],
      clear: [[0, 36, 6], [-8, -6, 7], [0, -25, 14], [4, 16, 11], [14, 8, 5], [26, 2, 5], [0, -48, 17], [0, 42, 4]],
      fires: [],
      points: [
        { id: 'to-hebron-b', x: 0, z: 42, type: 'exit', title: "남쪽 길로 헤브론 산지에 가기", to: 'hebron', spawn: [-36, -16] },
      ],
    },
    // ══ 7편 「사울과 다윗」 — 기브아와 믹마스(삼상 10:26 사울의 집 기브아 · 9:5 숩 땅의 성읍과 산당 · 10:5 하나님의 산과 블레셋 사람들의 영문 · 13:2 믹마스 · 14:4 두 바위).
    //    서쪽 마을이 기브아, 동쪽 비탈 위가 숩 땅의 성읍, 북쪽이 하나님의 산. 집·성문·산당·우물은 두루마리(scrolls/saul7.js)가 세운다 ══
    gibeah: {
      name: '기브아와 믹마스', questTitle: '📜 퀘스트 — 사울과 다윗',
      env: { ground: 0xe2d6a4, top: 0x5a8fcc, bottom: 0xdcd6ae, fog: 0xd6d0aa, fogD: 0.011, sun: 0xfff3d6, sunDir: [0.5, 0.45, -0.55], cloud: 0.3, cloudCol: 0xffffff, stars: 0, far: 'far-mountains' },
      center: [0, 0], spawn: [-36, 20],
      mountain: { x: -12, z: -46, r: 14, h: 16 },
      layout: [
        ['env-acacia', 30, 26, 0.4], ['env-acacia', -38, -16, 1.6], ['env-rock-hill', 40, -40, 0.4], ['env-rocks-strata', 40, 32, 1.2], ['dry-bush', 10, 36, 0], ['dry-bush', -2, -6, 0],
      ],
      scatter: [['dry-bush', 6, 20, 50], ['rock-group', 8, 22, 50]],
      clear: [[-36, 20, 6], [-22, 4, 13], [0, 12, 6], [14, 4, 5], [26, -14, 13], [32, -26, 8], [10, -16, 5], [-10, -26, 8], [-30, 30, 8], [4, 28, 4], [-10, 36, 4], [-12, -46, 15], [0, -36, 6], [-42, 20, 4], [28, 18, 11], [40, 26, 7], [8, 18, 5], [10, 33, 4], [14, 16, 3], [-16, 3, 5], [-26, -14, 3], [-6, 22, 6], [-12, 4, 3], [-11, 14, 3], [18, 33, 8]],
      fires: [],
      points: [
        { id: 'to-gibeon-g', x: -42, z: 20, type: 'exit', title: "서쪽 길로 기브온 마을에 내려가기", to: 'gibeon', spawn: [34, -22] },
      ],
    },
    // ══ 7편 12~14장 — 유다 광야(삼상 22:1 아둘람 굴 · 22:5 헤렛 수풀 · 23:1 그일라 · 23:15 십 수풀 · 23:25 마온 바위 · 24:2 들염소 바위 · 25:2 갈멜 · 26:3 하길라 산).
    //    굴·수풀·성읍·진영은 두루마리(scrolls/saul7.js)가 세운다. 다윗이 쫓겨 다닌 곳이라 메마르게 ══
    judah: {
      name: '유다 광야', questTitle: '📜 퀘스트 — 사울과 다윗',
      env: { ground: 0xd8c690, top: 0x6a98cc, bottom: 0xe4d4a4, fog: 0xdccca0, fogD: 0.011, sun: 0xfff0d0, sunDir: [0.5, 0.45, -0.55], cloud: 0.15, cloudCol: 0xffffff, stars: 0, far: 'far-mountains' },
      center: [0, 0], spawn: [36, 0],
      mountain: { x: 8, z: -54, r: 14, h: 18 },
      layout: [
        ['env-rock-hill', -42, -6, 0.4], ['env-rock-hill', 40, -40, 2.0], ['env-rock-hill', -12, 8, 1.2], ['env-rock-hill', 38, 16, 2.6], ['env-rocks-strata', 12, -38, 1.2], ['env-rocks-strata', -14, -40, 0.6], ['env-rocks-strata', 22, 4, 2.2], ['dry-bush', 0, 16, 0], ['dry-bush', -10, -4, 0], ['env-acacia', 30, -6, 1.1],
      ],
      scatter: [['dry-bush', 10, 20, 50], ['rock-group', 14, 22, 50]],
      clear: [[38, 0, 7], [-22, -12, 10], [-26, 18, 8], [2, -26, 10], [20, 20, 8], [24, -22, 8], [-30, -34, 9], [-4, 30, 11], [4, 22, 6], [-36, 36, 6], [34, 30, 11], [6, 6, 6], [14, -6, 5], [8, -54, 15]],
      fires: [],
      points: [
        { id: 'to-hebron-w', x: 42, z: 0, type: 'exit', title: "동쪽 길로 헤브론 산지에 올라가기", to: 'hebron', spawn: [36, -8] },
      ],
    },
  };
  let Z = null;                       // 지금 마을
  const CLEAR_ZONES = [];
  const isClear = (x, z, pad) => CLEAR_ZONES.every(([cx, cz, r]) => Math.hypot(x-cx, z-cz) > r + pad);

  const propTemplates = {};
  async function loadProps(names){
    await Promise.all(names.filter(n => !propTemplates[n]).map(async name => {
      const g = await loadGLB(PROP_DEFS[name].src || `props3d/${name}.glb`);
      const root = g.scene; toToon(root);
      root.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(root);
      const sc = PROP_DEFS[name].h * WPM / (box.max.y - box.min.y);
      const c = box.getCenter(new THREE.Vector3());
      root.scale.multiplyScalar(sc);
      root.position.set(-c.x * sc, -box.min.y * sc, -c.z * sc);
      const holder = new THREE.Group(); holder.add(root); holder.updateMatrixWorld(true);
      propTemplates[name] = {
        holder,
        halfW: (box.max.x - box.min.x) * sc / 2,
        halfD: (box.max.z - box.min.z) * sc / 2,
      };
    }));
  }

  function placeProp(name, x, z, rot = 0, scaleMul = 1){
    const t = propTemplates[name], def = PROP_DEFS[name];
    const o = t.holder.clone(true);
    if (def.occ) o.traverse(m => { if (m.isMesh){ m.material = m.material.clone(); m.material.transparent = true; } });
    o.position.set(x, heightAt(x, z) - 0.05, z); o.rotation.y = rot; o.scale.setScalar(scaleMul);
    zoneRoot.add(o);
    o.updateMatrixWorld(true); o.matrixWorldAutoUpdate = false;   // 제자리 물체 — 매 프레임 행렬 계산 생략
    addCollider(name, x, z, rot, scaleMul);
    if (false){
      const R = Math.min(t.halfW, t.halfD) * 0.9 * scaleMul;
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 12){
        if (Math.abs(Math.atan2(Math.sin(a - Math.PI), Math.cos(a - Math.PI))) < 0.35) continue; // 서쪽(마을 쪽) = 입구
        obstacles.push({ x: x + Math.cos(a) * R, z: z + Math.sin(a) * R, r: 0.75 });
      }
    }
    if (false){
      const off = t.halfW * 0.82 * scaleMul;
      obstacles.push({ x: x - Math.cos(rot) * off, z: z + Math.sin(rot) * off, r: 0.9 }, { x: x + Math.cos(rot) * off, z: z - Math.sin(rot) * off, r: 0.9 });
    }
    if (def.occ){
      const mats = []; o.traverse(m => { if (m.isMesh) mats.push(m.material); });
      occluders.push({ obj: o, x, z, r: Math.max(t.halfW, t.halfD) * scaleMul, fade: 1, mats });
    }
    return o;
  }

  // 같은 소품을 여러 개 흩어 놓을 땐 인스턴싱(드로우콜 1번)
  function scatterInstanced(name, list){
    const t = propTemplates[name]; let mesh = null;
    t.holder.traverse(m => { if (m.isMesh && !mesh) mesh = m; });
    const base = mesh.matrixWorld.clone();
    const inst = new THREE.InstancedMesh(mesh.geometry, mesh.material, list.length);
    inst.castShadow = true; inst.receiveShadow = true;
    const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), S = new THREE.Vector3(), P = new THREE.Vector3();
    list.forEach(([x, z, rot, sc], i) => {
      M.compose(P.set(x, heightAt(x, z) - 0.05, z), Q.setFromEuler(E.set(0, rot, 0)), S.set(sc, sc, sc)).multiply(base);
      inst.setMatrixAt(i, M);
      addCollider(name, x, z, rot, sc);
    });
    inst.instanceMatrix.needsUpdate = true;
    inst.computeBoundingSphere();
    zoneRoot.add(inst);
  }

  // ══ 홍해 ══════════════════════════════════════════════
  // 바다: 북쪽·남쪽 물 + 가운데 길(갈라지는 곳). 갈라지면 가운데 물이 사라지고 양쪽에 물 벽이 솟음(14:21-22)
  const sea = { k: 0, target: 0, walls: [], mid: null, floor: null, gate: null, wind: null };
  function zoneSpawn(sp){
    if (Z && Z.id === 'redsea' && (ST.ch > 3 || (ST.ch === 3 && (ST.cleared || ST.step >= stepIdx('c4s10'))))) return [56, 6];   // 바다를 건넌 뒤에는 건너편 해변
    return sp;
  }
  function buildSea(){
    const S = Z.sea, g = new THREE.Group(); zoneRoot.add(g);
    const waterMat = new THREE.MeshToonMaterial({ color: 0x3f8fb8, gradientMap: toonGradient, transparent: true, opacity: 0.9 });
    const strip = (z0, z1, mat) => {
      const geo = new THREE.PlaneGeometry(S.x1 - S.x0, z1 - z0, 24, Math.max(2, Math.round((z1 - z0) / 2))); geo.rotateX(-Math.PI / 2);
      const pa = geo.attributes.position, cx = (S.x0 + S.x1) / 2, cz = (z0 + z1) / 2;
      for (let i = 0; i < pa.count; i++) pa.setY(i, heightAt(pa.getX(i) + cx, pa.getZ(i) + cz) + 0.35);
      geo.computeVertexNormals(); const m = new THREE.Mesh(geo, mat); m.position.set(cx, 0, cz); m.receiveShadow = true; g.add(m); return m;
    };
    strip(S.gap, 64, waterMat); strip(-64, -S.gap, waterMat);
    sea.mid = strip(-S.gap, S.gap, waterMat.clone());
    const floorMat = new THREE.MeshToonMaterial({ color: 0x9a7a52, gradientMap: toonGradient, transparent: true, opacity: 0 });
    sea.floor = strip(-S.gap, S.gap, floorMat); sea.floor.position.y -= 0.3;
    const cx = (S.x0 + S.x1) / 2, hx = (S.x1 - S.x0) / 2;
    boxes.push({ x: cx, z: (S.gap + 64) / 2, rot: 0, hx, hz: (64 - S.gap) / 2, top: 99, stand: false });
    boxes.push({ x: cx, z: -(S.gap + 64) / 2, rot: 0, hx, hz: (64 - S.gap) / 2, top: 99, stand: false });
    sea.gate = { x: cx, z: 0, rot: 0, hx, hz: S.gap, top: 99, stand: false }; boxes.push(sea.gate);
    // 물 벽(가운데 길 양쪽): 아래는 바닥, 위는 k에 따라 솟음
    sea.walls = [S.gap, -S.gap].map(zw => {
      const geo = new THREE.PlaneGeometry(S.x1 - S.x0, 1, 40, 1);
      const m = new THREE.Mesh(geo, new THREE.MeshToonMaterial({ color: 0x2f7fb0, gradientMap: toonGradient, transparent: true, opacity: 0.82, side: THREE.DoubleSide }));
      m.position.set(cx, 0, zw); m.userData.zw = zw; m.visible = false; g.add(m);
      const foam = new THREE.Mesh(new THREE.PlaneGeometry(S.x1 - S.x0, 0.5, 40, 1), new THREE.MeshBasicMaterial({ color: 0xe8f6ff, transparent: true, opacity: 0.8, side: THREE.DoubleSide }));
      foam.position.set(cx, 0, zw); foam.visible = false; g.add(foam); m.userData.foam = foam;
      return m;
    });
    // 큰 동풍(14:21): 물보라가 서쪽으로
    const N = 300, wg = new THREE.BufferGeometry(); wg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    sea.wind = new THREE.Points(wg, new THREE.PointsMaterial({ color: 0xdff2ff, size: 0.22, map: dotTex, transparent: true, opacity: 0, depthWrite: false })); sea.wind.frustumCulled = false; g.add(sea.wind);
    sea.windSeed = Array.from({ length: N }, () => [Math.random(), Math.random(), Math.random()]);
    sea.k = sea.target; applySeaShape();
  }
  function applySeaShape(){
    if (!sea.mid || !Z || !Z.sea) return;
    const S = Z.sea, k = sea.k, cx = (S.x0 + S.x1) / 2;
    sea.mid.material.opacity = 0.9 * (1 - k); sea.mid.visible = k < 0.98;
    sea.floor.material.opacity = k; sea.floor.visible = k > 0.02;
    for (const w of sea.walls){
      w.visible = w.userData.foam.visible = k > 0.02;
      const pa = w.geometry.attributes.position, H = 7.5 * k;
      for (let i = 0; i < pa.count; i++){ const x = pa.getX(i) + cx, base = heightAt(x, w.userData.zw) - 0.3, top = i < pa.count / 2;   // 앞 절반 = 윗줄
        pa.setY(i, top ? base + H + Math.sin(x * 0.6 + performance.now() * 0.002) * 0.25 * k : base); }
      pa.needsUpdate = true; w.position.y = 0;
      const fp = w.userData.foam.geometry.attributes.position;
      for (let i = 0; i < fp.count; i++){ const x = fp.getX(i) + cx; fp.setY(i, heightAt(x, w.userData.zw) - 0.3 + H + (i < fp.count / 2 ? 0.3 : -0.1) + Math.sin(x * 0.6 + performance.now() * 0.002) * 0.25 * k); }
      fp.needsUpdate = true;
    }
    const open = k > 0.7, has = boxes.includes(sea.gate);
    if (open && has) boxes.splice(boxes.indexOf(sea.gate), 1); else if (!open && !has && k < 0.3) boxes.push(sea.gate);
  }
  function updateSea(dt, now){
    if (!Z || !Z.sea || !sea.mid) return;
    const moving = Math.abs(sea.target - sea.k) > 0.001;
    if (moving) sea.k += Math.sign(sea.target - sea.k) * Math.min(Math.abs(sea.target - sea.k), dt * 0.3);
    if (moving || (sea.k > 0.02 && Math.floor(now / 100) !== sea._t)){ sea._t = Math.floor(now / 100); applySeaShape(); }
    // 동풍 물보라: 갈라지는 동안만
    const on = moving && sea.target > 0.5; sea.wind.material.opacity += ((on ? 0.8 : 0) - sea.wind.material.opacity) * Math.min(1, dt * 3);
    if (sea.wind.material.opacity > 0.01){ const S = Z.sea, a = sea.wind.geometry.attributes.position, t = now * 0.001;
      sea.windSeed.forEach(([u, v, h], i) => { const x = S.x1 - ((u * (S.x1 - S.x0) + t * 14) % (S.x1 - S.x0)); a.setXYZ(i, x, heightAt(x, 0) + 0.5 + h * 3, (v - 0.5) * S.gap * 2.4); }); a.needsUpdate = true; }
  }
  // 애굽 군대(3D 병사가 준비되기 전까지는 멀리 보이는 실루엣 행렬 + 흙먼지): 서쪽에서 다가와 구름 기둥 뒤에 멈춤
  let armyObj = null, armyOn = false, cloudOn = false;
  function spawnArmy(){
    if (armyObj){ if (armyObj.parent) armyObj.parent.remove(armyObj); armyObj = null; }
    if (!Z || Z.id !== 'redsea' || !armyOn) return;
    const g = new THREE.Group(), dark = new THREE.MeshToonMaterial({ color: 0x3a2a1c, gradientMap: toonGradient }), metal = new THREE.MeshToonMaterial({ color: 0x8a7a50, gradientMap: toonGradient });
    for (let r = 0; r < 5; r++) for (let c = 0; c < 9; c++){
      const s = new THREE.Group(), body = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 1.2, 3, 6), dark); body.position.y = 0.9; s.add(body);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), dark); head.position.y = 1.85; s.add(head);
      const spear = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.6, 5), metal); spear.position.set(0.35, 1.5, 0); s.add(spear);
      s.position.set(-r * 1.6, 0, (c - 4) * 1.5 + (r % 2) * 0.7); s.userData.ph = Math.random() * 6; g.add(s);
    }
    for (let c = 0; c < 4; c++){   // 병거 실루엣
      const ch = new THREE.Group(), box = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 1.6), dark); box.position.y = 1.1; ch.add(box);
      for (const z of [-0.85, 0.85]){ const w = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.08, 6, 12), metal); w.position.set(0, 0.6, z); ch.add(w); }
      ch.position.set(2.5, 0, (c - 1.5) * 4); g.add(ch);
    }
    const N = 260, dg = new THREE.BufferGeometry(), pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++){ pos[i * 3] = -10 + Math.random() * 14; pos[i * 3 + 1] = Math.random() * 4; pos[i * 3 + 2] = (Math.random() - 0.5) * 18; }
    dg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: 0xc8a878, size: 0.9, map: dotTex, transparent: true, opacity: 0.45, depthWrite: false })); g.add(dust); g.userData.dust = dust;
    g.position.set(-62, 0, 0); g.userData.x = -62; zoneRoot.add(g); armyObj = g;
  }
  const chase = { on: false, wait: 0, x: 0 };
  function chaseActive(){ const q = curStep(); return !!(q && q.chase && Z && Z.id === 'redsea' && sea.k > 0.9 && !dlgState); }
  function updateArmy(dt, now){
    if (!armyObj) return; const g = armyObj;
    if (chaseActive()){
      if (!chase.on){ chase.on = true; chase.wait = 2.5; chase.x = 8; chase.gustT = 4; chase.gust = 0; toast('🐎 애굽 군대가 바다 가운데로 뒤따라와요! 달려서 건너요!', 2600); }
      if (chase.wait > 0) chase.wait -= dt; else chase.x += dt * 3.4;
      // 거센 동풍: 5~6초마다 1.2초 동안 발걸음이 느려짐(바위 앞에서 멈칫하면 따라잡힘)
      chase.gustT -= dt; if (chase.gustT <= 0){ chase.gust = 1.2; chase.gustT = 5 + Math.random() * 1.5; if (player.position.x > 14 && player.position.x < 50) toast('💨 거센 바람! 잠깐 발걸음이 느려져요', 1000); }
      if (chase.gust > 0) chase.gust -= dt;
      g.userData.x = chase.x;
      const px = player.position.x;
      if (px > 12 && px < 51 && chase.x + 2.5 >= px){   // 따라잡힘 → 바닷가에서 다시
        toast('😰 군대가 바로 뒤까지 왔어요! 바닷가에서 다시 서둘러 건너요', 2600);
        player.position.set(14, heightAt(14, 0), 0); chase.x = -4; chase.wait = 3;
      }
      if (Math.floor(now / 1000) !== chase._s){ chase._s = Math.floor(now / 1000); renderQuestList(); }
    } else if (chase.on && !(curStep() && curStep().chase)){ chase.on = false; chase.gust = 0; }
    const stopX = chase.on ? g.userData.x + 1 : cloudOn ? -48 : -44;
    if (!chase.on && g.userData.x < stopX) g.userData.x = Math.min(stopX, g.userData.x + dt * 1.2);
    g.position.x = g.userData.x; const t = now * 0.004, marching = g.userData.x < stopX - 0.01;
    g.children.forEach(s => { if (s.userData.ph !== undefined){ s.position.y = heightAt(g.position.x + s.position.x, s.position.z) + (marching ? Math.abs(Math.sin(t + s.userData.ph)) * 0.12 : 0); } else if (!s.isPoints) s.position.y = heightAt(g.position.x + s.position.x, s.position.z); });
    g.userData.dust.material.opacity = marching ? 0.45 : 0.2; g.userData.dust.position.y = heightAt(g.position.x, 0);
  }
  // 구름 기둥: 처음엔 진영 앞(낮의 구름 기둥, 13:21), 14:19-20 이후엔 애굽 진과 이스라엘 진 사이의 구름 벽(이쪽은 밝음)
  let cloudObj = null;
  function spawnCloud(){
    if (cloudObj){ if (cloudObj.parent) cloudObj.parent.remove(cloudObj); cloudObj = null; }
    if (!Z || Z.id !== 'redsea' || ST.ch !== 3) return;
    const wall = cloudOn, g = new THREE.Group();
    const mk = (x, y, z, s, col) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: col, transparent: true, opacity: 0.85, depthWrite: false, fog: false })); sp.scale.set(s, s, 1); sp.position.set(x, y, z); sp.userData.ph = Math.random() * 6; g.add(sp); };
    if (wall){
      for (let i = 0; i < 70; i++) mk((Math.random() - 0.5) * 3, 1 + Math.random() * 13, -32 + Math.random() * 64, 5 + Math.random() * 5, i % 3 ? 0xe8e8ee : 0xb8bcc8);
      const L = new THREE.PointLight(0xffd9a0, 2.4, 40, 1.2); L.position.set(4, 6, 0); g.add(L);   // 이쪽은 밤이 밝음(14:20)
      g.position.set(-36, heightAt(-36, 0), 0);
    } else {
      for (let i = 0; i < 26; i++) mk((Math.random() - 0.5) * 2.2, 1 + i * 0.75, (Math.random() - 0.5) * 2.2, 3.4 + Math.random() * 1.6, i % 3 ? 0xf2f2f6 : 0xd0d4dc);
      g.position.set(6, heightAt(6, -19), -19);
    }
    zoneRoot.add(g); cloudObj = g;
  }
  function updateCloud(now){ if (!cloudObj) return; const t = now * 0.0006; cloudObj.children.forEach(o => { if (o.isSprite){ o.material.opacity = 0.7 + 0.2 * Math.sin(t * 3 + o.userData.ph); o.position.x += Math.sin(t + o.userData.ph) * 0.003; } }); }
  // 미리암과 여인들의 춤(15:20)
  let danceT = 0;
  function startDance(){ danceT = 40; ['miriam', 'rs_singer', 'rs_mom'].forEach(id => { const m = markers.find(x => x.data.id === id); if (m && m.ai){ m.ai.state = 'act'; m.ai.act = has(m, 'Talk') ? 'Talk' : 'Idle'; m.ai.t = 40; } }); toast('🥁 소고 소리가 울려 퍼져요!', 2200); }
  function updateDance(dt, now){ if (danceT <= 0) return; danceT -= dt; ['miriam', 'rs_singer', 'rs_mom'].forEach((id, i) => { const m = markers.find(x => x.data.id === id); if (m){ m.mesh.position.y = heightAt(m.mesh.position.x, m.mesh.position.z) + Math.abs(Math.sin(now * 0.008 + i)) * 0.22; } }); }
  const roomObjs = [];   // 알현실 안 물체 — 학생이 방 밖에 있으면 숨김(궁전 뒤로 비쳐 보이지 않게)
  function buildRoom(){
    const R = THRONE_ROOM, H = R.H, y0 = R.h, W = R.x1 - R.x0, D = R.z1 - R.z0, cx = (R.x0 + R.x1) / 2, cz = (R.z0 + R.z1) / 2;
    const tl = new THREE.TextureLoader();
    const tex = (f, rx, ry) => { const t = tl.load(A(f)); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy()); return t; };
    const g = new THREE.Group(); g.userData.ownGPU = true; zoneRoot.add(g);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D).rotateX(-Math.PI / 2), new THREE.MeshToonMaterial({ map: tex(Z.room.floor, W / 4.5, D / 4.5), gradientMap: toonGradient }));
    floor.position.set(cx, y0 + 0.04, cz); floor.receiveShadow = true; g.add(floor);
    const wallMat = len => new THREE.MeshToonMaterial({ map: tex(Z.room.wall, len / 5, H / 5), gradientMap: toonGradient });
    for (const [len, x, z, ry] of [[W, cx, R.z1, Math.PI], [W, cx, R.z0, 0], [D, R.x0, cz, Math.PI / 2], [D, R.x1, cz, -Math.PI / 2]]){
      const w = new THREE.Mesh(new THREE.PlaneGeometry(len, H), wallMat(len)); w.position.set(x, y0 + H / 2, z); w.rotation.y = ry; w.receiveShadow = true; g.add(w);
      boxes.push({ x, z, rot: ry, hx: len / 2 + 0.4, hz: 0.35, top: y0 + H, stand: false });
    }
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D).rotateX(Math.PI / 2), new THREE.MeshToonMaterial({ color: 0x5a3f28, gradientMap: toonGradient }));
    ceil.position.set(cx, y0 + H, cz); g.add(ceil);
    roomObjs.length = 0; roomObjs.push(g);
    zoneRoot.children.forEach(o => { if (o !== g && inRoom(o.position.x, o.position.z) && !markers.some(m => m.mesh === o && m.data.model)) roomObjs.push(o); });
    roomObjs.shown = true;
  }
  function updateRoomVis(){
    if (!Z || !Z.room) return;
    const on = inRoom(player.position.x, player.position.z) || inRoom(camera.position.x, camera.position.z);
    if (on !== roomObjs.shown){ roomObjs.forEach(o => o.visible = on); roomObjs.shown = on; }
  }
  function buildWorld(){
    Z.layout.forEach(([n, x, z, r, sc]) => placeProp(n, x, z, r, sc || 1));
    if (Z.room) buildRoom();
    if (Z.sea) buildSea();
    if (Z.pools) buildPools();
    if (Z.mountain) buildMountain();
    // 강(나일 등): 지형을 따라 휘는 물 띠 + 들어가지 못하게 상자 충돌
    if (Z.water){
      const w = Z.water, geo = new THREE.PlaneGeometry(w.x1 - w.x0, w.z1 - w.z0, 16, 60); geo.rotateX(-Math.PI / 2);
      const pa = geo.attributes.position;
      for (let i = 0; i < pa.count; i++){ const x = pa.getX(i) + (w.x0 + w.x1) / 2, z = pa.getZ(i) + (w.z0 + w.z1) / 2; pa.setY(i, heightAt(x, z) + 0.12); }
      geo.computeVertexNormals();
      const water = new THREE.Mesh(geo, new THREE.MeshToonMaterial({ color: 0x4f9fb5, gradientMap: toonGradient, transparent: true, opacity: 0.88 }));
      water.position.set((w.x0 + w.x1) / 2, 0, (w.z0 + w.z1) / 2); water.receiveShadow = true;
      zoneRoot.add(water); Z._water = water;
      Z._waterBox = { x: (w.x0 + w.x1) / 2, z: (w.z0 + w.z1) / 2, rot: 0, hx: (w.x1 - w.x0) / 2, hz: (w.z1 - w.z0) / 2, top: 99, stand: false }; boxes.push(Z._waterBox);
    }
    // 마을 밖 흩어 놓기
    (Z.scatter || []).forEach(([name, count, rMin, rMax]) => {
      const list = [];
      for (let tries = 0; list.length < count && tries < 800; tries++){
        const a = rand() * Math.PI * 2, r = rMin + rand() * (rMax - rMin);
        const x = Math.cos(a) * r, z = Math.sin(a) * r;
        if (Math.abs(x) > 63 || Math.abs(z) > 63 || !isClear(x, z, 2)) continue;
        if (Z.water && x > Z.water.x0 - 3 && x < Z.water.x1 + 3) continue;
        if (Z.sea && x > Z.sea.x0 - 3 && x < Z.sea.x1 + 3) continue;
        if (list.some(([px, pz]) => Math.hypot(px - x, pz - z) < 5)) continue;
        list.push([x, z, rand() * Math.PI * 2, 0.8 + rand() * 0.4]);
      }
      if (!list.length) return;
      if (PROP_DEFS[name].occ) list.forEach(([x, z, r, sc]) => placeProp(name, x, z, r, sc));
      else scatterInstanced(name, list);
    });
  }

  // 불타는 떨기나무 불꽃(출 3:2 — 불이 붙었으나 사라지지 않는 떨기나무): 가산 합성 스프라이트 + 깜빡이는 빛
  const flameTex = (() => {
    const c = document.createElement('canvas'); c.width = 64; c.height = 128;
    const x = c.getContext('2d');
    const g = x.createRadialGradient(32, 92, 2, 32, 80, 60);
    g.addColorStop(0, 'rgba(255,250,200,1)'); g.addColorStop(0.25, 'rgba(255,190,60,0.9)');
    g.addColorStop(0.6, 'rgba(255,90,20,0.45)'); g.addColorStop(1, 'rgba(255,60,0,0)');
    x.fillStyle = g; x.beginPath(); x.moveTo(32, 4); x.bezierCurveTo(60, 60, 58, 120, 32, 124); x.bezierCurveTo(6, 120, 4, 60, 32, 4); x.fill();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const fires = [];
  function addFire(x, z, y0, size = 1, withLight = true){
    const grp = new THREE.Group(); grp.position.set(x, heightAt(x, z) + y0, z);
    const flames = [];
    for (let i = 0; i < 5; i++){
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
      sp.userData = { ox: (Math.random() - 0.5) * 0.9 * size, oz: (Math.random() - 0.5) * 0.9 * size, ph: Math.random() * 6.28, s: (0.9 + Math.random() * 0.6) * size };
      grp.add(sp); flames.push(sp);
    }
    // 불빛: 알현실 화로처럼 여러 개 모인 곳은 빛 없이 불꽃만(빛이 늘면 모든 물체의 계산이 무거워짐)
    const light = withLight ? new THREE.PointLight(0xff9a40, 2.2, 9 * size) : null; if (light){ light.position.y = 0.8 * size; grp.add(light); }
    zoneRoot.add(grp); fires.push({ flames, light, size });
  }
  function updateFires(t){
    for (const f of fires){
      f.flames.forEach(sp => {
        const u = sp.userData, k = 0.8 + 0.25 * Math.sin(t * 0.009 + u.ph) + 0.12 * Math.sin(t * 0.023 + u.ph * 2);
        sp.scale.set(0.8 * u.s * k, 1.5 * u.s * k, 1);
        sp.position.set(u.ox, 0.55 * u.s * k, u.oz);
      });
      if (f.light) f.light.intensity = 2.0 + 0.6 * Math.sin(t * 0.017) + 0.3 * Math.sin(t * 0.041);
    }
  }

