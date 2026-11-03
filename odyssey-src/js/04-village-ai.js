  // ── 마을 생활 AI ───────────────────────────────────────────────
  // NPC는 마을 안의 장소(우물·모닥불·시장·천막 입구·그늘·양 우리…) 중에서 스스로 목적지를 골라 길을 찾아 걸어가고,
  // 도착하면 그 장소에 맞는 행동을 한다. 돌아다니다 다른 NPC와 마주치면 서로 다가가 번갈아 이야기한다.
  // 성격(PERSONA)마다 좋아하는 장소·수다 성향·활동 범위가 다르다. 학생이 다가가면 하던 일을 멈추고 돌아본다.

  // 1) 길찾기 격자(A*) — 정적 충돌체(소품·건물)를 피해 간다. 월드 배치 후 buildNav()로 만든다.
  const NAV = { x0: -40, z0: -56, cell: 0.7, w: 0, h: 0, walk: null };   // 알현실(x 51~69, z -54~-30)까지 포함
  function buildNav(){
    NAV.w = Math.ceil(110 / NAV.cell); NAV.h = Math.ceil(86 / NAV.cell);
    NAV.walk = new Uint8Array(NAV.w * NAV.h); NAV.reach = null;
    const npcCols = new Set(markers.map(m => m.col).filter(Boolean));
    const R = 0.6;   // NPC 몸 반지름 + 여유
    for (let j = 0; j < NAV.h; j++) for (let i = 0; i < NAV.w; i++){
      const x = NAV.x0 + (i + 0.5) * NAV.cell, z = NAV.z0 + (j + 0.5) * NAV.cell;
      let ok = true;
      for (const o of obstacles){ if (npcCols.has(o)) continue; if (Math.hypot(x - o.x, z - o.z) < o.r + R){ ok = false; break; } }
      if (ok) for (const b of boxes){
        const c = Math.cos(b.rot), sn = Math.sin(b.rot), rx = x - b.x, rz = z - b.z;
        if (Math.abs(rx * c - rz * sn) < b.hx + R && Math.abs(rx * sn + rz * c) < b.hz + R){ ok = false; break; }
      }
      NAV.walk[j * NAV.w + i] = ok ? 1 : 0;
    }
  }
  const cellOf = (x, z) => [Math.floor((x - NAV.x0) / NAV.cell), Math.floor((z - NAV.z0) / NAV.cell)];
  const walkable = (x, z) => { const [i, j] = cellOf(x, z); return i >= 0 && j >= 0 && i < NAV.w && j < NAV.h && NAV.walk[j * NAV.w + i] === 1; };
  // 마을 입구에서 걸어서 닿는 칸(막힌 우리 안·물 건너편 제외) — 줍기 물건을 놓을 때 사용
  function reachFill(){
    const R = new Uint8Array(NAV.w * NAV.h), [si, sj] = cellOf(...nearestWalkable(Z.spawn[0], Z.spawn[1])), q = [sj * NAV.w + si];
    if (si < 0 || sj < 0 || si >= NAV.w || sj >= NAV.h) return R;
    R[q[0]] = 1;
    for (let h = 0; h < q.length; h++){ const c = q[h], i = c % NAV.w, j = (c / NAV.w) | 0;
      for (const [a, b] of [[1,0],[-1,0],[0,1],[0,-1]]){ const ni = i + a, nj = j + b; if (ni < 0 || nj < 0 || ni >= NAV.w || nj >= NAV.h) continue; const n = nj * NAV.w + ni; if (!R[n] && NAV.walk[n]){ R[n] = 1; q.push(n); } } }
    return R;
  }
  const reachable = (x, z) => { if (!NAV.reach) NAV.reach = reachFill(); const [i, j] = cellOf(x, z); return i >= 0 && j >= 0 && i < NAV.w && j < NAV.h && NAV.reach[j * NAV.w + i] === 1; };
  function lineClear(ax, az, bx, bz){
    const d = Math.hypot(bx - ax, bz - az), n = Math.ceil(d / 0.3);
    for (let k = 1; k < n; k++){ const t = k / n; if (!walkable(ax + (bx - ax) * t, az + (bz - az) * t)) return false; }
    return true;
  }
  // 막힌 칸이면 가장 가까운 걸을 수 있는 지점(나선형 탐색)
  function nearestWalkable(x, z){
    if (walkable(x, z)) return [x, z];
    for (let r = NAV.cell; r < 6; r += NAV.cell * 0.7)
      for (let a = 0; a < Math.PI * 2; a += 0.4){ const px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r; if (walkable(px, pz)) return [px, pz]; }
    return [x, z];
  }
  function findPath(ax, az, bx, bz){
    if (lineClear(ax, az, bx, bz)) return [[bx, bz]];
    const [si, sj] = cellOf(ax, az), [ti, tj] = cellOf(bx, bz), W = NAV.w, H = NAV.h;
    if (ti < 0 || tj < 0 || ti >= W || tj >= H) return null;
    const N = W * H, g = new Float32Array(N).fill(1e9), from = new Int32Array(N).fill(-1), closed = new Uint8Array(N);
    const heap = []; // [f, idx]
    const push = (f, id) => { heap.push([f, id]); let c = heap.length - 1; while (c > 0){ const p = (c - 1) >> 1; if (heap[p][0] <= heap[c][0]) break; [heap[p], heap[c]] = [heap[c], heap[p]]; c = p; } };
    const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length){ heap[0] = last; let c = 0; for (;;){ const l = 2*c+1, r = l+1; let m = c; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === c) break; [heap[m], heap[c]] = [heap[c], heap[m]]; c = m; } } return top; };
    const hfn = (i, j) => { const dx = Math.abs(i - ti), dz = Math.abs(j - tj); return (dx + dz) + (Math.SQRT2 - 2) * Math.min(dx, dz); };
    const s0 = sj * W + si; g[s0] = 0; push(hfn(si, sj), s0);
    let found = -1, guard = 0;
    while (heap.length && guard++ < 20000){
      const [, id] = pop(); if (closed[id]) continue; closed[id] = 1;
      const i = id % W, j = (id / W) | 0;
      if (i === ti && j === tj){ found = id; break; }
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++){
        if (!di && !dj) continue;
        const ni = i + di, nj = j + dj; if (ni < 0 || nj < 0 || ni >= W || nj >= H) continue;
        const nid = nj * W + ni; if (!NAV.walk[nid] || closed[nid]) continue;
        if (di && dj && (!NAV.walk[j * W + ni] || !NAV.walk[nj * W + i])) continue; // 모서리 끼임 방지
        const ng = g[id] + (di && dj ? Math.SQRT2 : 1);
        if (ng < g[nid]){ g[nid] = ng; from[nid] = id; push(ng + hfn(ni, nj), nid); }
      }
    }
    if (found < 0) return null;
    const cells = []; for (let c = found; c >= 0 && c !== s0; c = from[c]) cells.push(c); cells.reverse();
    const pts = cells.map(c => [NAV.x0 + (c % W + 0.5) * NAV.cell, NAV.z0 + (((c / W) | 0) + 0.5) * NAV.cell]);
    pts[pts.length - 1] = [bx, bz];
    // 곧게 펴기: 직선으로 갈 수 있는 중간 점은 건너뜀
    const out = []; let cx = ax, cz = az, k = 0;
    while (k < pts.length){
      let far = k; for (let q = pts.length - 1; q > k; q--) if (lineClear(cx, cz, pts[q][0], pts[q][1])){ far = q; break; }
      out.push(pts[far]); [cx, cz] = pts[far]; k = far + 1;
    }
    return out;
  }

  // 2) 장소(POI) — 소품 배치에서 자동 생성. kind 별로 할 수 있는 행동 [동작, 최소초, 최대초]
  const POI_KIND = {
    well:   { acts: [['PickUp', 3, 5], ['LookAround', 4, 7], ['Idle', 3, 6], ['Work', 4, 7]], ring: 2.7 },
    fire:   { acts: [['Idle', 4, 8], ['LookAround', 4, 7], ['Hop', 1.5, 2]], ring: 2.3 },
    market: { acts: [['PickUp', 3, 5], ['Work', 4, 7], ['LookAround', 3, 5], ['Idle', 3, 5]], ring: 1.9 },
    jars:   { acts: [['PickUp', 3, 5], ['Idle', 3, 5]], ring: 1.6 },
    tent:   { acts: [['Idle', 4, 7], ['LookAround', 4, 6]] },
    shade:  { acts: [['Work', 5, 9], ['Idle', 4, 8], ['LookAround', 3, 5]] },
    palm:   { acts: [['Idle', 5, 9], ['LookAround', 4, 6]], ring: 2.3 },
    pen:    { acts: [['LookAround', 4, 7], ['Idle', 3, 5], ['PickUp', 3, 4]] },
    gate:   { acts: [['LookAround', 4, 7], ['Idle', 3, 6]] },
    house:  { acts: [['Idle', 4, 7], ['LookAround', 4, 6], ['PickUp', 3, 4]] },
    plaza:  { acts: [['Idle', 4, 8], ['LookAround', 4, 7]] },
    board:  { acts: [['LookAround', 4, 7], ['Idle', 3, 5]] },
    work:   { acts: [['PickUp', 3, 5], ['Work', 4, 7], ['LookAround', 3, 5]] },
    monument: { acts: [['LookAround', 4, 7], ['Idle', 3, 5]] },
  };
  // 소품 → 장소 규칙: ['ring', 종류, 반경, 개수] / ['front', 종류] / ['gate'] / ['shade']
  const POI_RULES = {
    'well': ['ring', 'well', 2.7, 6], 'campfire': ['ring', 'fire', 2.3, 7], 'crates-sacks': ['ring', 'market', 1.9, 4], 'jars': ['ring', 'jars', 1.6, 3],
    'tent-large': ['front', 'tent'], 'tent-mid': ['front', 'tent'], 'tent-small': ['front', 'tent'], 'jethro-tent': ['front', 'tent'],
    'weaving-shade': ['shade'], 'palm': ['ringOut', 'palm', 2.3, 2], 'village-gate': ['gate'], 'sheepfold': ['ring', 'pen', 7.2, 8],
    'fountain': ['ring', 'plaza', 3.0, 8], 'sage-house': ['front', 'house'], 'memorial-hall': ['front', 'house'], 'shop': ['front', 'market'],
    'notice-board': ['front', 'board'], 'map-table': ['ring', 'board', 2.6, 4],
    'hebrew-house': ['front', 'house'], 'hebrew-house-small': ['front', 'house'], 'reed-hut': ['front', 'house'], 'granary': ['front', 'tent'],
    'market-stall': ['front', 'market'], 'brick-yard': ['ring', 'work', 3.4, 6], 'obelisk': ['ring', 'monument', 2.6, 4], 'palace-gate': ['front', 'gate'], 'palace': ['front', 'gate'], 'tent-cluster': ['front', 'tent'], 'camp-firepit': ['ring', 'fire', 2.3, 6],
  };
  const POIS = [];
  function buildPOIs(){
    const add = (kind, x, z, fx, fz) => { if (walkable(x, z)) POIS.push({ kind, x, z, fx, fz, busy: null }); };
    const ring = (kind, cx, cz, r, n = 6) => { for (let k = 0; k < n; k++){ const a = k * 2 * Math.PI / n + 0.3; add(kind, cx + Math.cos(a) * r, cz + Math.sin(a) * r, cx, cz); } };
    for (const [n, x, z, rot, sc] of Z.layout){
      const rule = POI_RULES[n], t = propTemplates[n]; if (!rule) continue;
      const k = sc || 1;
      if (rule[0] === 'ring') ring(rule[1], x, z, rule[2] * (n === 'sheepfold' ? 1 : k), rule[3]);
      else if (rule[0] === 'ringOut'){ for (let q = 0; q < rule[3]; q++){ const a = q * Math.PI + rot; const px = x + Math.cos(a) * rule[2], pz = z + Math.sin(a) * rule[2]; add(rule[1], px, pz, px + Math.cos(a) * 3, pz + Math.sin(a) * 3); } } // 나무를 등지고 바깥을 봄
      else if (rule[0] === 'front'){ const d = t.halfD * k + 1.1; add(rule[1], x + Math.sin(rot) * d, z + Math.cos(rot) * d, x, z); }
      else if (rule[0] === 'shade'){ add('shade', x, z, x + Math.sin(rot), z + Math.cos(rot)); ring('shade', x, z, 1.4, 3); }
      else if (rule[0] === 'gate'){ add('gate', x + 1.5, z - 2, x, z + 5); add('gate', x - 1.5, z - 2, x, z + 5); }
    }
  }

  // 3) 성격 — 좋아하는 장소 가중치, 수다 성향, 집(활동 중심)과 활동 반경
  const PERSONA = {
    moses_horeb:  { home: [-29, -31], range: 0, social: 0, like: {} },          // 호렙산에서 양 떼와(출 3:1) — 제자리
    moses_palace: { home: [25.5, -11.5], range: 0, social: 0, like: {} },
    aaron_palace: { home: [27.5, -10.2], range: 0, social: 0, like: {} },
    guide:      { home: [-2, 2],    range: 5,  social: 0.1,  like: { plaza: 4 } },   // 퀘스트 인물 — 광장 근처
    a_shop:     { home: [12, 6],    range: 6,  social: 0.2,  like: { market: 5, plaza: 1 } },
    a_keeper:   { home: [11, -8],   range: 7,  social: 0.25, like: { house: 4, plaza: 1 } },
    a_cart:     { home: [-12, 5],   range: 7,  social: 0.2,  like: { board: 5, plaza: 1 } },
    a_gardener: { home: [-8, -4],   range: 16, social: 0.35, like: { palm: 4, plaza: 2, house: 1 } },
    a_kid1:     { home: [2, 2],     range: 18, social: 0.3,  like: { plaza: 4, palm: 2, board: 1 }, run: 0.6 },
    a_kid2:     { home: [0, 0],     range: 22, social: 0.25, like: { house: 2, board: 2, market: 2, plaza: 2 }, run: 0.3 },
    miriam:     { home: [-6, 0],    range: 20, social: 0.3,  like: { house: 3, market: 3, palm: 1 } },
    pharaoh:    { home: [60, -48.4], range: 0, social: 0,    like: {} },
    worker1:    { home: [13, 7],    range: 12, social: 0.2,  like: { work: 5, market: 1, house: 1 } },
    worker2:    { home: [14, 9],    range: 12, social: 0.2,  like: { work: 5, market: 1, house: 1 } },
    aaron:      { home: [-2, -8],   range: 30, social: 0.33, like: { well: 2, fire: 2, tent: 1, market: 1, palm: 1, gate: 1 } },
    jethro:     { home: [-8, -13],  range: 6,  social: 0.2,  like: { tent: 3, market: 2, jars: 1 } },   // 퀘스트 인물이라 천막 앞 근처에 머묾
    elder:      { home: [-4, -9],   range: 18, social: 0.42,  like: { fire: 3, palm: 3, well: 1 } },
    blacksmith: { home: [11, -8],   range: 16, social: 0.24,  like: { market: 3, fire: 2, well: 1, tent: 1 } },
    merchant:   { home: [9, -11],   range: 20, social: 0.3,  like: { well: 3, market: 3, jars: 2 }, carryFrom: 'well' },
    herbalist:  { home: [-15, -4],  range: 16, social: 0.24,  like: { shade: 4, jars: 2, palm: 2, well: 1 } },
    shepherd:   { home: [21, 2],    range: 18, social: 0.18,  like: { pen: 5, well: 1, fire: 1 }, altMove: 'Look' },
    child:      { home: [5, 0],     range: 22, social: 0.18,  like: { fire: 3, well: 1, pen: 1, palm: 1, market: 1 }, run: 0.6 },
    hb_father:     { home: [-6, -4],   range: 14, social: 0.3,  like: { house: 3, market: 2, work: 1 } },
    hb_mother:     { home: [-9, 1],    range: 12, social: 0.35, like: { house: 3, market: 3, jars: 2 } },
    hb_grandpa:    { home: [-18, 1],   range: 9,  social: 0.3,  like: { palm: 2, house: 3 } },
    hb_grandma:    { home: [-10, 12],  range: 9,  social: 0.35, like: { pen: 3, house: 2, market: 1 } },
    hb_boy:        { home: [0, 2],     range: 20, social: 0.25, like: { pen: 3, market: 2, palm: 2, jars: 1 }, run: 0.6 },
    hb_girl:       { home: [-3, 0],    range: 18, social: 0.3,  like: { market: 3, house: 2, pen: 2 }, run: 0.4 },
    hb_brickmaker: { home: [12, 9],    range: 8,  social: 0.2,  like: { work: 5, market: 1 } },
    hb_levite:     { home: [-4, -15],  range: 12, social: 0.3,  like: { house: 3, market: 1, tent: 1 } },
    eg_merchant:   { home: [5, 12],    range: 5,  social: 0.2,  like: { market: 5, jars: 1 } },
    eg_gatekeeper: { home: [26.4, -19.3], range: 0, social: 0, like: {} },
    eg_noble:      { home: [22, -19],  range: 9,  social: 0.3,  like: { monument: 3, gate: 1 } },
    eg_farmer_m:   { home: [26, 6],    range: 12, social: 0.25, like: { palm: 2, work: 1, market: 2, jars: 1 } },
    eg_farmer_f:   { home: [30, 8],    range: 12, social: 0.3,  like: { palm: 2, market: 3, jars: 2 } },
    eg_water:      { home: [22, -2],   range: 14, social: 0.3,  like: { palm: 3, jars: 3 }, carryFrom: 'jars' },
    eg_boy:        { home: [24, 8],    range: 14, social: 0.25, like: { palm: 2, work: 1, market: 1, monument: 1 }, run: 0.5 },
    eg_girl:       { home: [27, 2],    range: 12, social: 0.3,  like: { palm: 2, jars: 2, market: 1 }, run: 0.3 },
    pal_servant_m: { home: [31, -12],  range: 7,  social: 0.25, like: { gate: 2, monument: 2 } },
    pal_servant_f: { home: [66.2, -47.5], range: 0, social: 0.3, like: {} },
    pal_magician1: { home: [56.2, -46.8], range: 0, social: 0.5, like: {} },
    pal_magician2: { home: [63.8, -46.8], range: 0, social: 0.5, like: {} },
    is_elder:      { home: [-11, -1],  range: 6,  social: 0.3,  like: { house: 3, market: 1 } },
    rs_static:     { home: [0, 0], range: 0, social: 0, like: {} },
    rs_miriam:     { home: [-4, 5], range: 7, social: 0.35, like: { fire: 3, tent: 2 } },
  };
  const rnd = (a, b) => a + Math.random() * (b - a);
  // 돌아다니는 사람은 몇 명만(아이들·물·짐 나르는 사람) — 나머지는 제자리에서 자연스럽게 행동(먼 길을 오가는 모습이 어색했음)
  const WALKERS = new Set(['a_kid1', 'a_kid2', 'child', 'hb_boy', 'eg_boy', 'eg_water', 'merchant', 'shepherd', 'rs_water']);
  function calmPersona(m, P){
    if (!P) return null;
    if (WALKERS.has(m.data.id)) return Object.assign({}, P, { range: Math.min(P.range, 12), social: Math.min(P.social, 0.1) });
    const story = m.data.type === 'npc';
    if (story && P.range > 0) return Object.assign({}, P, { home: [m.data.x, m.data.z], range: Math.min(P.range, 5), social: 0 });   // 이야기 인물은 찾기 쉽게 제자리 근처
    return Object.assign({}, P, { home: [m.data.x, m.data.z], range: 0, social: 0, still: true });
  }
  const pickWeighted = (items, w) => { const tot = items.reduce((s, it) => s + w(it), 0); let r = Math.random() * tot; for (const it of items){ r -= w(it); if (r <= 0) return it; } return items[items.length - 1]; };
  const angTo = (from, x, z) => Math.atan2(x - from.mesh.position.x, z - from.mesh.position.z);
  function turnTo(m, want, dt, rate = 5){
    let df = want - m.yaw; while (df > Math.PI) df -= Math.PI*2; while (df < -Math.PI) df += Math.PI*2;
    m.yaw += df * Math.min(1, dt * rate); m.mesh.rotation.y = m.yaw;
  }
  const has = (m, a) => !!m.actions[a];
  const talkAnim = m => pickWeighted(['Talk', 'Talk2', 'Talk3'].filter(a => has(m, a)), () => 1) || 'Idle';
  function releasePOI(m){ if (m.ai.poi){ m.ai.poi.busy = null; m.ai.poi = null; } }

  function goTo(m, x, z, moveAnim){
    const pos = m.mesh.position;
    const [sx, sz] = nearestWalkable(pos.x, pos.z);          // 출발점이 막힌 칸이면 가까운 빈 칸에서 출발
    const path = findPath(sx, sz, x, z);
    if (!path) return false;
    if (sx !== pos.x || sz !== pos.z) path.unshift([sx, sz]);
    Object.assign(m.ai, { state: 'walk', path, moveAnim, stuck: 0, lastD: 1e9, walkT: 0 });
    return true;
  }
  function decide(m){
    const A = m.ai, P = A.persona, pos = m.mesh.position;
    releasePOI(m);
    // 수다: 근처에서 한가한 NPC를 찾아 둘이 만나서 이야기
    const nowS = performance.now() / 1000;
    if (Math.random() < P.social && nowS - (A.lastChat || -99) > 20){   // 한 번 이야기하면 20초는 다른 일
      const cand = markers.filter(o => o !== m && o.ai && o.ai.state !== 'chat' && o.ai.state !== 'walkToChat' && !o.ai.player && nowS - (o.ai.lastChat || -99) > 20
        && Math.hypot(o.mesh.position.x - pos.x, o.mesh.position.z - pos.z) < 14);
      if (cand.length){
        const o = cand[(Math.random() * cand.length) | 0];
        const mx = (pos.x + o.mesh.position.x) / 2, mz = (pos.z + o.mesh.position.z) / 2;
        const ang = Math.atan2(o.mesh.position.x - pos.x, o.mesh.position.z - pos.z);
        const ax = mx - Math.sin(ang) * 0.9, az = mz - Math.cos(ang) * 0.9, bx = mx + Math.sin(ang) * 0.9, bz = mz + Math.cos(ang) * 0.9;
        if (walkable(ax, az) && walkable(bx, bz) && goTo(m, ax, az, 'Walk') && goTo(o, bx, bz, 'Walk')){
          releasePOI(o);
          const dur = rnd(6, 10);
          m.ai.after = { chat: o, dur }; o.ai.after = { chat: m, dur }; m.ai.state = o.ai.state = 'walkToChat';
          m.ai.lead = true; o.ai.lead = false;
          return;
        }
      }
    }
    // 가끔은 그 자리에서 둘러보기(제자리 인물은 항상)
    if (P.still){
      // 제자리 인물: 옆 사람과 이야기 · 가까운 일터(물동이·벽돌 등)에서 일 · 둘러보기 중 하나
      const r = Math.random(), pos0 = m.mesh.position;
      const mate = markers.find(o => o !== m && o.ai && !o.hidden && o.ai.persona && o.ai.persona.still && Math.hypot(o.mesh.position.x - pos0.x, o.mesh.position.z - pos0.z) < 3.5);
      if (mate && r < 0.4){ A.state = 'act'; A.act = talkAnim(m); A.t = rnd(4, 7); A.face = [mate.mesh.position.x, mate.mesh.position.z]; return; }
      const poi = POIS.filter(q => Math.hypot(q.x - pos0.x, q.z - pos0.z) < 2.5)[0];
      if (poi && r < 0.7){ const acts = POI_KIND[poi.kind].acts.filter(([a]) => has(m, a)); if (acts.length){ const [a, t0, t1] = acts[(Math.random() * acts.length) | 0]; A.state = 'act'; A.act = a; A.t = rnd(t0, t1) * 1.3; A.face = [poi.fx, poi.fz]; return; } }
      A.state = 'act'; A.act = Math.random() < 0.5 && has(m, 'LookAround') ? 'LookAround' : 'Idle'; A.t = rnd(4, 8); A.face = null; return;
    }
    if (Math.random() < 0.12 || P.range === 0){ A.state = 'act'; A.act = has(m, 'LookAround') ? 'LookAround' : 'Idle'; A.t = rnd(3, 6); A.face = null; return; }
    // 장소 고르기(성격 가중치 × 거리 제한)
    const free = POIS.filter(q => !q.busy && P.like[q.kind] && Math.hypot(q.x - P.home[0], q.z - P.home[1]) < P.range && Math.hypot(q.x - pos.x, q.z - pos.z) > 1.5);
    if (!free.length){ A.state = 'act'; A.act = 'Idle'; A.t = rnd(3, 5); return; }
    const q = pickWeighted(free, q => P.like[q.kind]);
    let move = 'Walk';
    if (P.run && Math.random() < P.run && has(m, 'Run')) move = 'Run';
    if (P.altMove && Math.random() < 0.5 && has(m, P.altMove)) move = P.altMove;
    if (P.carryFrom && A.lastKind === P.carryFrom && has(m, 'Carry')) move = 'Carry';   // 우물에서 물 길어 오는 길
    if (goTo(m, q.x, q.z, move)){ q.busy = m; A.poi = q; A.after = { poi: q }; }
    else { A.state = 'act'; A.act = 'Idle'; A.t = 2; }
  }
  function arrive(m){
    const A = m.ai, after = A.after; A.after = null; A.vx = A.vz = 0; A.side = 0;
    if (after && after.chat){
      const o = after.chat;
      A.state = 'chat'; A.t = after.dur; A.mate = o; A.turnT = rnd(2.5, 4); A.speaking = A.lead; A.lastChat = performance.now() / 1000 + after.dur;
      return;
    }
    const q = after && after.poi;
    const kind = q ? q.kind : null; A.lastKind = kind;
    const acts = kind ? POI_KIND[kind].acts.filter(([a]) => has(m, a)) : [];
    const [act, t0, t1] = acts.length ? acts[(Math.random() * acts.length) | 0] : ['Idle', 3, 5];
    A.state = 'act'; A.act = act; A.t = rnd(t0, t1) * (act === 'Hop' ? 1 : 1.3); A.face = q ? [q.fx, q.fz] : null;
  }

  function npcThink(m, dt, dPlayer){
    const A = m.ai, pos = m.mesh.position;
    if (!A || m.follow) return;
    // 학생이 가까이 오거나 대화 중이면 멈추고 돌아봄
    if (talkingWith === m || dPlayer < 3.4){
      A.player = true;
      turnTo(m, angTo(m, player.position.x, player.position.z), dt, 6);
      npcPlay(m, talkingWith === m ? 'Talk' : 'Idle', 0.35);
      return;
    }
    A.player = false;
    switch (A.state){
      case 'walk': case 'walkToChat': {
        const wp = A.path[0];
        const dx = wp[0] - pos.x, dz = wp[1] - pos.z, dist = Math.hypot(dx, dz);
        if (dist < 0.2){ A.path.shift(); if (!A.path.length) arrive(m); break; }
        // 마지막 지점이 코앞인데 다른 NPC가 서 있으면 그 자리에서 도착 처리(밀어내기 떨림 방지)
        if (A.path.length === 1 && dist < 1.2 && markers.some(o => o !== m && o.ai && !o.hidden && Math.hypot(o.mesh.position.x - wp[0], o.mesh.position.z - wp[1]) < 1.0)){ A.path.length = 0; arrive(m); break; }
        A.walkT = (A.walkT || 0) + dt; if (A.walkT > 25){ A.walkT = 0; A.path.length = 0; A.state = 'idle'; A.t = 1; releasePOI(m); break; } // 너무 오래 헤매면 포기
        const anim = has(m, A.moveAnim) ? A.moveAnim : (has(m, 'Walk') ? 'Walk' : 'Idle');
        if (anim === 'Idle'){ arrive(m); break; }   // 걷기 동작이 없으면 이동 생략
        // 엇갈림 처리: 앞길에 다른 사람이 있으면 ① 우선순위가 낮은 쪽은 잠깐 멈춰 기다리고(양보)
        // ② 높은 쪽은 한 방향(오른쪽)으로 일정하게 비켜 간다. 속도·방향은 부드럽게 보간해서 떨림이 없게.
        const fx = dx / dist, fz = dz / dist;
        let tx = fx, tz = fz, blocked = false;
        if (A.yieldT > 0){ A.yieldT -= dt; blocked = true; }
        else for (const o of markers){
          if (o === m || !o.ai || o.hidden) continue;
          const ox = o.mesh.position.x - pos.x, oz = o.mesh.position.z - pos.z, od = Math.hypot(ox, oz);
          if (od > 1.8 || od < 1e-3) continue;
          const ahead = (ox * fx + oz * fz) / od;              // 1 = 정면
          if (ahead < 0.35) continue;
          const oMoving = o.ai.state === 'walk' || o.ai.state === 'walkToChat';
          if (oMoving && od < 1.3 && m.data.id > o.data.id){ A.yieldT = 0.7; blocked = true; break; }   // 양보
          const side = A.side || (A.side = (fx * oz - fz * ox) > 0 ? -1 : 1);                          // 비켜 갈 방향 고정
          const w = (1.8 - od) / 1.8 * 1.4 * ahead;
          tx += -fz * side * w; tz += fx * side * w;
        }
        if (!blocked && A.sideT !== undefined && (A.sideT -= dt) < 0){ A.side = 0; }
        if (!blocked) A.sideT = 1.2;
        const tl = Math.hypot(tx, tz) || 1, spd = blocked ? 0 : (A.speed[anim] || 1.4);
        A.vx = (A.vx || 0) + ((tx / tl) * spd - (A.vx || 0)) * Math.min(1, dt * 6);
        A.vz = (A.vz || 0) + ((tz / tl) * spd - (A.vz || 0)) * Math.min(1, dt * 6);
        const vmag = Math.hypot(A.vx, A.vz);
        npcPlay(m, vmag < 0.25 ? 'Idle' : anim, 0.3);
        if (vmag > 0.05) turnTo(m, Math.atan2(A.vx, A.vz), dt, 6);
        const k = Math.min(1, dist / Math.max(1e-3, vmag * dt));   // 목표 지점을 지나치지 않게
        const nx = pos.x + A.vx * dt * Math.min(1, k), nz = pos.z + A.vz * dt * Math.min(1, k);
        if (walkable(nx, nz) || !walkable(pos.x, pos.z)){ pos.x = nx; pos.z = nz; }   // 비켜 가다 소품 안으로 들어가지 않게
        pos.y = heightAt(pos.x, pos.z);
        m.col.x = pos.x; m.col.z = pos.z;
        // 막히면 다시 생각
        if (!blocked) A.stuck += dt; if (A.stuck > 1.2){ if (A.lastD - dist < 0.15){ A.state = 'idle'; A.t = 0.5; releasePOI(m); } A.stuck = 0; A.lastD = dist; }
        break;
      }
      case 'act':
        A.t -= dt;
        if (A.face) turnTo(m, angTo(m, A.face[0], A.face[1]), dt, 3);
        npcPlay(m, has(m, A.act) ? A.act : 'Idle', 0.45);
        if (A.act === 'Hop' && m.cur === 'Hop' && m.actions.Hop.time > m.actions.Hop.getClip().duration - 0.1) A.act = 'Idle';
        if (A.t <= 0){ A.state = 'idle'; A.t = rnd(0.3, 1.2); }
        break;
      case 'chat': {
        const o = A.mate;
        A.t -= dt;
        if (o) turnTo(m, angTo(m, o.mesh.position.x, o.mesh.position.z), dt, 4);
        if (A.lead){ A.turnT -= dt; if (A.turnT <= 0){ A.speaking = !A.speaking; A.turnT = rnd(2.5, 4.5); A.talkA = talkAnim(m); if (o && o.ai) o.ai.talkA = talkAnim(o); } }
        const speaking = A.lead ? A.speaking : !(o && o.ai && o.ai.speaking);
        npcPlay(m, speaking ? (A.talkA || talkAnim(m)) : 'Idle', 0.5);
        if (A.t <= 0 || !o || !o.ai || (o.ai.state !== 'chat' && o.ai.state !== 'walkToChat')){ A.state = 'idle'; A.t = rnd(0.5, 1.5); A.mate = null; }
        break;
      }
      default: // idle: 잠깐 쉬었다가 다음 행동 결정
        A.t -= dt; npcPlay(m, 'Idle', 0.4);
        if (A.t <= 0) decide(m);
    }
  }

  // ══ 🚶 함께 걷는 성경 인물: 이야기 단계에 follow가 있으면 그 인물들이 학생 뒤를 따라 걸어요 ══
  let followKey = '';
  function updateFollow(dt){
    const q = curStep(), ids = (q && Z && q.zone === Z.id && q.follow) || [], key = ids.length ? q.id : '';
    if (key !== followKey){
      markers.forEach(m => { if (m.follow && !ids.includes(m.data.id)){ m.follow = false; const p = m.mesh.position;
        if (m.ai){ m.ai.persona = { home: [p.x, p.z], range: 0, social: 0, like: {} }; m.ai.state = 'idle'; m.ai.path = []; m.ai.t = 1; } } });
      if (ids.length){ const names = ids.map(id => (markers.find(m => m.data.id === id) || { data: {} }).data.title).filter(Boolean);
        if (names.length) toast(`🚶 ${names.join('·')}${(() => { const c = names[names.length - 1].charCodeAt(names[names.length - 1].length - 1) - 0xac00; return c >= 0 && c < 11172 && c % 28 ? '이' : '가'; })()} 함께 걸어요`, 2400); }
      followKey = key;
    }
    if (!ids.length) return;
    const P = player.position, fx = Math.sin(heading), fz = -Math.cos(heading);
    ids.forEach((id, k) => {
      const m = markers.find(x => x.data.id === id); if (!m || m.hidden) return;
      if (!m.follow){ m.follow = true; if (m.ai){ m.ai.state = 'idle'; m.ai.path = []; releasePOI(m); } }
      const pos = m.mesh.position, back = 1.7 + (k ? 0.5 : 0), side = k === 0 ? 0 : (k === 1 ? -1.3 : 1.3);
      const tx = P.x - fx * back - fz * side, tz = P.z - fz * back + fx * side;
      const dx = tx - pos.x, dz = tz - pos.z, dist = Math.hypot(dx, dz), dP = Math.hypot(P.x - pos.x, P.z - pos.z);
      if (dist > 16){ const [nx, nz] = NAV.walk ? nearestWalkable(tx, tz) : [tx, tz]; pos.set(nx, heightAt(nx, nz), nz); if (m.col){ m.col.x = nx; m.col.z = nz; } return; }
      const acts = m.actions || {};
      if (dlgState || dist < 0.45 || dP < 1.1){ npcPlay(m, talkingWith === m ? 'Talk' : 'Idle', 0.35); if (dP < 6) turnTo(m, angTo(m, P.x, P.z), dt, 5); return; }
      // 길찾기: 0.7초마다 학생 뒤 자리까지 길을 다시 잡고, 그 길의 다음 지점으로 걸음
      m.fpT = (m.fpT || 0) - dt;
      if (m.fpT <= 0 || !m.fp || !m.fp.length){ m.fpT = 0.7; const [gx, gz] = NAV.walk && !walkable(tx, tz) ? nearestWalkable(tx, tz) : [tx, tz]; m.fp = findPath(pos.x, pos.z, gx, gz) || [[gx, gz]]; }
      let wp = m.fp[0]; if (Math.hypot(wp[0] - pos.x, wp[1] - pos.z) < 0.3 && m.fp.length > 1){ m.fp.shift(); wp = m.fp[0]; }
      const wx = wp[0] - pos.x, wz = wp[1] - pos.z, wd = Math.hypot(wx, wz) || 1e-3;
      const run = dist > 4 && acts.Run, spd = run ? Math.min(6.5, 3 + dist * 0.5) : Math.min(3.4, 1.4 + dist * 0.8);
      const step = Math.min(wd, spd * dt), nx = pos.x + wx / wd * step, nz = pos.z + wz / wd * step;
      const ox = pos.x, oz = pos.z;
      if (walkable(nx, nz) || !walkable(pos.x, pos.z)){ pos.x = nx; pos.z = nz; }
      else { const t = { x: nx, z: nz }; resolveCollisions(t, pos.y); if (walkable(t.x, t.z)){ pos.x = t.x; pos.z = t.z; } }
      // 오래 제자리면(좁은 틈 등) 학생 뒤로 옮겨 세움
      m.fStuck = Math.hypot(pos.x - ox, pos.z - oz) < spd * dt * 0.2 ? (m.fStuck || 0) + dt : 0;
      if (m.fStuck > 1.5){ m.fStuck = 0; const [sx, sz] = NAV.walk ? nearestWalkable(tx, tz) : [tx, tz]; pos.x = sx; pos.z = sz; m.fp = null; }
      pos.y = heightAt(pos.x, pos.z); if (m.col){ m.col.x = pos.x; m.col.z = pos.z; }
      npcPlay(m, run ? 'Run' : (acts.Walk ? 'Walk' : 'Idle'), 0.3);
      turnTo(m, Math.atan2(wx, wz), dt, 7);
    });
  }

  // ══ 마을 불러오기 / 비우기 / 이동 ══════════════════════════════════
  const zoneAssets = z => {
    const props = new Set();
    ZONES[z].layout.forEach(([n]) => props.add(n)); (ZONES[z].scatter || []).forEach(([n]) => props.add(n)); (ZONES[z].animals || []).forEach(([n]) => props.add(n));
    if (ZONES[z].points.some(p => p.id === 'bush')) props.add('dry-bush');
    const npcs = ZONES[z].points.filter(p => p.model && !p.lazy).map(p => `npc3d/${p.model}.glb`);
    const lazy = ZONES[z].points.filter(p => p.model && p.lazy).map(p => `npc3d/${p.model}.glb`);   // 마을 사람(이야기와 무관) — 들어간 뒤 받음
    const tex = ZONES[z].room ? [ZONES[z].room.floor, ZONES[z].room.wall] : [];
    return { props: [...props], files: [...[...props].map(n => PROP_DEFS[n].src || `props3d/${n}.glb`), ...npcs, ...tex], lazy };
  };
  const prefetched = new Set();
  // 출구 근처: 입장에 꼭 필요한 것부터 받고, 다 받은 뒤에 마을 사람들을 이어서 받음(동시에 받으면 필수 파일이 늦어짐)
  function prefetchZone(z){
    if (prefetched.has(z)) return; prefetched.add(z);
    const a = zoneAssets(z);
    Promise.allSettled(a.files.map(f => fetchBytes(f))).then(() => a.lazy.forEach(f => fetchBytes(f).catch(() => {})));
  }
  function unloadZone(){
    if (typeof homeObjs !== 'undefined'){ homeObjs.length = 0; homeExit(true); VISIT = null; document.getElementById('visit-bar').classList.add('hidden'); }
    if (typeof darkTrail !== 'undefined') darkTrail.length = 0;
    markers.forEach(m => { if (m.mixer){ m.mixer.stopAllAction(); m.mixer.uncacheRoot(m.mixer.getRoot()); } });
    zoneRoot.traverse(o => {
      if (o.userData.ownGPU){ o.traverse(q => { if (q.isMesh){ q.geometry.dispose(); const mt = q.material; if (mt.map) mt.map.dispose(); mt.dispose(); } }); }
    });
    occluders.forEach(p => p.mats.forEach(mt => mt.dispose()));
    zoneRoot.clear();
    markers.length = 0; obstacles.length = 0; boxes.length = 0; occluders.length = 0; POIS.length = 0; fires.length = 0; CLEAR_ZONES.length = 0;
    talkingWith = null; talking = false; nearPoint = null; interactBtn.classList.add('hidden'); infoPanel.classList.add('hidden');
  }
  async function loadZone(id){
    if (Z) unloadZone();
    Z = ZONES[id]; Z.id = id;
    const e = Z.env;
    skyMat.uniforms.top.value.set(e.top); skyMat.uniforms.bottom.value.set(e.bottom);
    skyMat.uniforms.sunDir.value.set(...e.sunDir).normalize(); skyMat.uniforms.sunCol.value.set(e.sun);
    skyMat.uniforms.cloud.value = e.cloud; skyMat.uniforms.cloudCol.value.set(e.cloudCol); skyMat.uniforms.stars.value = e.stars;
    // 빛 방향은 하늘 속 해와 같은 방위, 높이는 최소 55%로 — 해가 낮아도 그림자가 화면을 덮지 않게
    { const d = skyMat.uniforms.sunDir.value, hz = Math.hypot(d.x, d.z) || 1; SUN_OFFSET.set(d.x / hz * 28, Math.max(d.y * 45, 36), d.z / hz * 28); }
    setFar(e.far);
    scene.fog.color.set(e.fog); scene.fog.density = e.fogD; scene.background.set(e.fog); sun.color.set(e.sun);
    groundMat.color.set(e.ground || 0xffffff);   // 마을마다 땅빛(모래 무늬 위에 곱함) — 이스르엘 골짜기는 푸른 들
    infoPoints = Z.points; questPoints = infoPoints.filter(p => p.quest);
    CLEAR_ZONES.push([Z.spawn[0], Z.spawn[1], 5], ...(Z.clear || []));
    infoPoints.forEach(p => CLEAR_ZONES.push([p.x, p.z, p.model ? 2.5 : 5]));
    createMarkers(); refreshShow();
    await Promise.all([loadProps(zoneAssets(id).props), loadNPCs()]);
    buildWorld();
    const bushM = markers.find(m => m.isBush);
    if (bushM){ placeProp('dry-bush', bushM.data.x, bushM.data.z, 0.5, 1.2); addFire(bushM.data.x, bushM.data.z, 0.5, 1.1); }
    (Z.fires || []).forEach(f => addFire(...f));
    if (Z.room){ zoneRoot.children.forEach(o => { if (!roomObjs.includes(o) && inRoom(o.position.x, o.position.z) && !markers.some(m => m.mesh === o)) roomObjs.push(o); }); }
    buildNav(); buildPOIs();
    markers.forEach(m => { if (m.ai){ const [x, z] = nearestWalkable(m.mesh.position.x, m.mesh.position.z); m.mesh.position.set(x, heightAt(x, z), z); m.col.x = x; m.col.z = z; } });
    renderQuestList(); spawnTasks(); spawnScrolls(); grantPastSkills(); friendsClear(); dailyInit(); weeklyInit(); homeLoad(); mannaSpoil(); mannaHello(); buildYardRope(); buildIdols(); applyGear(); spawnLostLamb(); hqRefresh(true); sideRefresh(true); buildExhibit(); markVisited();
    renderer.compile(scene, camera);
    setTimeout(loadLazyNPCs, 300);
  }
  let traveling = false;
  // 빛 소용돌이 입자(주인공 둘레를 돌며 빨려 올라감)
  const swirl = (() => {
    const N = 160, g = new THREE.BufferGeometry(), pos = new Float32Array(N * 3), seeds = new Float32Array(N);
    for (let i = 0; i < N; i++) seeds[i] = Math.random();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffe9a8, size: 0.22, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    pts.frustumCulled = false; scene.add(pts);
    return { pts, seeds, t: -1, mode: 'out' };
  })();
  function updateSwirl(dt){
    if (swirl.t < 0) return;
    swirl.t += dt; const k = Math.min(1, swirl.t / 1.1), a = swirl.pts.geometry.attributes.position;
    for (let i = 0; i < swirl.seeds.length; i++){
      const sd = swirl.seeds[i], ang = sd * 40 + swirl.t * (4 + sd * 6);
      const r = swirl.mode === 'out' ? (2.2 - 1.9 * k) * (0.6 + sd * 0.6) : (0.3 + 2.4 * k) * (0.6 + sd * 0.6);
      const y = swirl.mode === 'out' ? (sd * 3 + k * 4 * sd) : (sd * 3.2 * (1 - k * 0.5));
      a.setXYZ(i, player.position.x + Math.cos(ang) * r, player.position.y + y, player.position.z + Math.sin(ang) * r);
    }
    a.needsUpdate = true;
    swirl.pts.material.opacity = swirl.mode === 'out' ? Math.min(1, k * 1.6) : 1 - k;
    if (swirl.t > 1.3){ swirl.t = -1; swirl.pts.material.opacity = 0; }
  }
  async function travelTo(p){
    if (traveling) return; traveling = true;
    const ld = document.getElementById('loading'), warp = document.getElementById('warp');
    // 1) 빨려 들어가기: 소용돌이 + 화면이 빛으로 가득
    swirl.mode = 'out'; swirl.t = 0; warp.className = 'out'; playOneShot('Wave', { lockMove: true });
    await new Promise(r => setTimeout(r, 1100));
    loadingSub.textContent = `${ZONES[p.to].name}(으)로 가는 중...`;
    try {
      await loadZone(p.to);
      { const sp = zoneSpawn(p.spawn); player.position.set(sp[0], heightAt(sp[0], sp[1]), sp[1]); }
      vy = 0; grounded = true;
      heading = Math.atan2(Z.center[0] - p.spawn[0], -(Z.center[1] - p.spawn[1])); // 마을 쪽을 보고 도착
      camYaw = -heading; camera.position.set(player.position.x + Math.sin(camYaw) * 8, player.position.y + 5, player.position.z + Math.cos(camYaw) * 8);
      toast(`📍 ${Z.name}`, 1800);
      const q = curStep(); if (q && q.exit === p.id) advance();
      spawnTasks(); refreshShow();
    } catch (err){ console.error(err); toast('이동하지 못했어요', 1500); }
    // 2) 도착: 빛이 걷히며 소용돌이가 흩어짐
    ld.style.display = 'none'; warp.className = 'in'; swirl.mode = 'in'; swirl.t = 0;
    setTimeout(() => { warp.className = ''; traveling = false; }, 1250);
  }

  function npcPlay(m, name, fade = 0.3){
    if (m.cur === name || !m.actions[name]) return;
    m.actions[name].reset().fadeIn(fade).play();
    if (m.cur && m.actions[m.cur]) m.actions[m.cur].fadeOut(fade);
    m.cur = name;
  }
  async function loadNPCs(){
    await loadNPCsInner();
    const byId = id => markers.find(x => x.data.id === id);
    // (마을 생활 AI는 월드 배치 후 buildNav()·buildPOIs() 에서 준비)
  }
  async function loadNPCsInner(){
    markers.filter(m => m.data.lazy).forEach(m => { m.mesh.visible = false; m.hidden = true; m.pending = true; if (m.col) m.col.r = 0; });
    await Promise.all(markers.filter(m => m.data.model && !m.data.lazy).map(setupNPC));
  }
  // 마을 사람(lazy): 입장한 뒤 학생과 가까운 사람부터. 받기는 한꺼번에 시작하고, 화면에 붙이는 건 하나씩(끊김 방지)
  async function loadLazyNPCs(){
    const zone = Z, list = markers.filter(m => m.pending);
    const dist = m => Math.hypot(m.mesh.position.x - player.position.x, m.mesh.position.z - player.position.z);
    list.sort((a, b) => dist(a) - dist(b));
    list.forEach(m => fetchBytes(`npc3d/${npcModel(m)}.glb`).catch(() => {}));
    for (const m of list){
      try { await fetchBytes(`npc3d/${npcModel(m)}.glb`); } catch (e){ continue; }
      if (Z !== zone || !markers.includes(m)) return;          // 그 사이 다른 마을로 이동
      await setupNPC(m);
      if (Z !== zone || !markers.includes(m)){ m.mesh.traverse(o => { if (o.isMesh){ o.geometry.dispose(); o.material.dispose(); } }); return; }
      const [x, z] = nearestWalkable(m.mesh.position.x, m.mesh.position.z);
      m.mesh.position.set(x, heightAt(x, z), z); m.col.x = x; m.col.z = z; m.col.r = 0.55;
      m.fadeMats = []; m.mesh.traverse(o => { if (o.isMesh){ o.material.transparent = true; o.material.opacity = 0; m.fadeMats.push(o.material); } });
      m.fadeT = 0; m.pending = false; m.hidden = false; m.mesh.visible = true;
      await new Promise(r => setTimeout(r, 120));
    }
  }
  // 2편 3장 위임식(옷 입히기) 뒤로는 아론이 대제사장 옷을 입는다(레 8:7-9) — 3편 내내 그대로
  function aaronHigh(){
    if (ST.cur === 'wild3') return true;
    const p = ST.cur === 'sinai2' && ST.sp && ST.sp.sinai2;
    return !!p && (p.ch > 2 || (p.ch === 2 && (p.cleared || p.step >= 2)));   // ch는 0부터: 2 = 3장 위임식, 옷 입히기(lv3s2) 뒤
  }
  function npcModel(m){ return m.data.id === 'aaron' && aaronHigh() ? 'pr-aaron-high-priest' : m.data.model; }
  // 진행이 바뀌어 입을 옷이 달라지면 그 자리에서 모델만 바꿔 끼운다
  function reskinNPCs(){
    markers.forEach(m => {
      if (!m.model || !m.data.model || m.loadedModel === npcModel(m)) return;
      const old = m.model; m.mesh.remove(old); old.traverse(o => { if (o.isMesh){ o.geometry.dispose(); o.material.dispose(); } });
      if (m.staff){ m.mesh.remove(m.staff); m.staff = null; }
      if (m.mixer) m.mixer.stopAllAction(); m.model = null; m.actions = {}; m.cur = null; setupNPC(m).catch(e => console.error(e));
    });
  }
  async function setupNPC(m){
    {
      const mdl = npcModel(m); m.loadedModel = mdl;
      const g = await loadGLB(`npc3d/${mdl}.glb`);
      const model = g.scene; toToon(model); model.userData.ownGPU = true;   // 마을을 떠나면 해제
      m.model = model;
      // 화면 밖 NPC는 그리지 않도록(그림자 계산 포함) — 스킨드 메시의 경계 구를 넉넉히 키워 가장자리 깜빡임 방지
      model.traverse(o => { if (o.isMesh){ o.geometry.computeBoundingSphere(); o.geometry.boundingSphere.radius *= 1.6; o.frustumCulled = true; } });
      model.scale.setScalar(WPM * (m.data.scale || 1));   // 리깅 때 실제 키(미터)를 넣었으므로 학생과 같은 비율(사울처럼 큰 인물은 지점의 scale)
      m.headBone = model.getObjectByName('Head') || model.getObjectByName('head_end');
      if (m.data.staff){
        m.handBone = model.getObjectByName('RightHand');
        m.staff = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 2.35, 7).translate(0, 1.175, 0), new THREE.MeshToonMaterial({ color: 0x6b4a2b, gradientMap: toonGradient }));
        m.staff.castShadow = true; m.mesh.add(m.staff);
      }
      m.mesh.add(model);
      g.animations.forEach(c => { c.tracks = c.tracks.filter(t => !/\.scale$/.test(t.name)); });
      m.mixer = new THREE.AnimationMixer(model);
      g.animations.forEach(c => m.actions[c.name] = m.mixer.clipAction(c));
      npcPlay(m, 'Idle', 0);
      if (m.actions.Idle) m.actions.Idle.time = rand() * 3; // NPC마다 동작이 어긋나게
      m.ai = { state: 'idle', t: 0.5 + Math.random() * 3, persona: calmPersona(m, PERSONA[m.data.persona || m.data.id]) || { home: [m.data.x, m.data.z], range: 10, social: 0.2, like: { house: 1, palm: 1, market: 1, fire: 1, plaza: 1 } }, speed: {} };
      for (const n of ['Walk', 'Run', 'Carry', 'Look']){
        const clip = g.animations.find(c => c.name === n);
        const sp = clip && measureNaturalSpeed(model, clip);
        if (sp && isFinite(sp) && sp > 0.2) m.ai.speed[n] = sp;   // 발이 미끄러지지 않는 그 동작 본래 속도로 걷게
      }
      npcPlay(m, 'Idle', 0);
    }
  }

