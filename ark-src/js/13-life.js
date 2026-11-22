  // ════════ 2026-11-18 생존·농사·기르기·침대·레버·업적·함께 짓는 터·마을 사람·음악·이어 하기 ════════
  // ── 체력(♥ 20)·기운(◆ 20, 배고픔)·숨 — 관리자는 안 닳음. 쓰러져도 가진 것은 그대로 ──
  var HP = 20, FOOD = 20, AIRV = 10, EXH = 0, regenT = 0, starveT = 0, drownT = 0, fallTop = null, SPAWN = null, vitT = 0;
  var FOODS = {}; FOODS[BREAD] = 6; FOODS[FIG] = 3; FOODS[MANNA] = 4;
  [[613,3],[614,2],[616,2],[617,4],[618,1],[619,2],[620,1],[622,4],
   [HONEY,3],[POMEGRANATE,4],[STEW,7],[FLATBREAD,4]]
    .forEach(function(d){FOODS[d[0]]=d[1];});
  // 11/21 구운 고기마다 회복이 다름: [기운, 체력] — 소 > 양 > 염소 > 닭 > 생선
  var HEAL = {}; [[COOKED_BEEF,10,7],[COOKED_LAMB,8,5],[COOKED_GOAT,7,4],[COOKED_CHICKEN,6,3],[COOKED_FISH,5,2]].forEach(function (d) { FOODS[d[0]] = d[1]; HEAL[d[0]] = d[2]; });
  function healOf(id) { return HEAL[id] !== undefined ? HEAL[id] : Math.ceil((FOODS[id] || 0) / 2); }
  function vitalsOn() { return started && !isAdm(); }
  // ── 믿음(✦, 11/20): 어둠의 그림자에게 맞으면 깎이고(입은 방패가 불화살을 막음, 파티원이 곁에 있으면 덜 깎임 — 전 4:12), 다 깨지면 「유혹에 넘어졌어요」 → 집에서 다시 일어남(눅 15:20).
  //    잠시 맞지 않으면 조금씩, 말씀 두루마리를 읽거나 제단에서 기도하면 다 채워짐 ──
  var FAITH = 20, faithHitT = 0, faithRegT = 0, faithTold = false, cordTold = false;
  function matesNear() {   // 12칸 안에 있는 파티원 수
    if (!inParty() || !NET.on) return 0; var n = 0, now = performance.now();
    for (var u in NET.peers) { var p = NET.peers[u]; if (partyMate(u) && now - p.t < 6000 && Math.hypot(p.tx - P.x, p.tz - P.z) < 12) n++; }
    return n;
  }
  function hurtFaith(n, who) {
    if (!vitalsOn() || n <= 0) return;
    var mates = matesNear();
    if (mates) { n = Math.max(1, Math.round(n * (mates >= 2 ? 0.6 : 0.75))); if (!cordTold) { cordTold = true; setTimeout(function () { showVerseCard('🤝', '세 겹 줄', '한 사람이면 패하겠거니와 두 사람이면 맞설 수 있나니 세 겹 줄은 쉽게 끊어지지 아니하느니라', '전도서 4:12', '파티원이 곁에 있으면 그림자에게 덜 흔들리고 믿음이 더 빨리 차요'); }, 300); } }
    FAITH = Math.max(0, FAITH - n); faithHitT = performance.now(); renderVitals(); stateDirty(); newsMark('faith');
    document.body.classList.add('hurt'); setTimeout(function () { document.body.classList.remove('hurt'); }, 260); sfx('break', 200); vibrate('faith');
    if (!faithTold && FAITH > 0) { faithTold = true; toast('✦ 믿음이 흔들렸어요 — 다 사라지기 전에 물리치거나 마을·불빛 곁으로 피해요. 방패를 차면 불화살을 막아요 (엡 6:16)'); }
    if (FAITH <= 0) fallTemptation(who);
  }
  function fallTemptation(who) {
    FAITH = 20; faithHitT = 0;
    SHADOWS.forEach(function (s) { s.dead = true; }); clearFireArrows();
    renderVitals(); stateDirty();
    var whoT = (who || '어둠의 그림자');
    showDeath('유혹에 넘어졌어요', whoT + '의 유혹에 넘어졌어요', function () { showVerseCard('🏠', '집으로 돌아왔어요', '이에 일어나서 아버지께로 돌아가니라 아직도 거리가 먼데 아버지가 그를 보고 측은히 여겨 달려가 목을 안고 입을 맞추니', '누가복음 15:20', whoT + '의 유혹에 넘어졌어요. ' + spawnInfo().label + '에서 다시 일어났고 믿음도 다시 채워졌어요 (가진 것은 그대로예요)'); });
  }
  function refillFaith() { if (vitalsOn() && FAITH < 20) { FAITH = 20; renderVitals(); stateDirty(); setTimeout(function () { toast('✦ 믿음이 다시 채워졌어요'); }, 400); } }
  function exhaust(v) { if (!vitalsOn()) return; EXH += v * (has('abraham') ? 0.7 : 1); while (EXH >= 4) { EXH -= 4; if (FOOD > 0) { FOOD--; renderVitals(); stateDirty(); } } }
  function hurt(n, why) {
    if (!vitalsOn() || n <= 0) return;
    HP = Math.max(0, HP - n); renderVitals(); stateDirty();
    document.body.classList.add('hurt'); setTimeout(function () { document.body.classList.remove('hurt'); }, 260); sfx('break', 260); vibrate('hurt');
    if (HP <= 0) faint(why);
  }
  function faint(why) {
    HP = 20; FOOD = Math.max(FOOD, 12); AIRV = 10; fallTop = null;
    renderVitals(); stateDirty();
    showDeath('쓰러졌어요', why, function () { toast(spawnInfo().label + '에서 다시 일어났어요 (가진 것은 그대로예요)'); });
  }
  // ── 11/21 쓰러진 화면: 「다시 일어나기」를 누르면 다시 일어날 곳으로 — 내 침대(한 번이라도 누웠던 침대) → 내 땅(집) → 마을 처음 자리 ──
  var deadAfter = null;
  function spawnInfo() {
    if (SPAWN && get(SPAWN.x, SPAWN.y - 1, SPAWN.z) !== BED && colAt(SPAWN.x, SPAWN.z)) { SPAWN = null; stateDirty(); return spawnInfo2('침대가 없어졌어요'); }
    return spawnInfo2('');
  }
  function spawnInfo2(note) {
    if (SPAWN) return { k: 'bed', label: '🛏 내 침대', note: note };
    if (myPlot >= 0) return { k: 'home', label: '🏠 집 둘레 어딘가', note: note || '내 집 침대에 한 번 누우면 다음부터 그 침대에서 일어나요' };
    return { k: 'start', label: '⛵ 마을 처음 자리', note: note };
  }
  function showDeath(title, why, after) {
    deadAfter = after || null;
    if (riding) dismount(true);
    var sp = spawnInfo();
    $('deadTitle').textContent = title; $('deadWhy').textContent = why || '';
    $('deadWhere').textContent = '다시 일어날 곳: ' + sp.label + (sp.note ? ' — ' + sp.note : '');
    document.body.classList.add('faint'); setTimeout(function () { document.body.classList.remove('faint'); }, 1400);
    sfx('break', 200); showUI('dead');
  }
  function deadRise() {
    if (ui !== 'dead') return;
    respawn(); resume(); sfx('pop', 500);
    var f = deadAfter; deadAfter = null; if (f) setTimeout(f, 250);
  }
  function respawn() {
    if (riding) dismount(true);
    spawnInfo();
    if (SPAWN) teleport(SPAWN.x + 0.5, SPAWN.y, SPAWN.z + 0.5);
    else if (myPlot >= 0) { var o = plotOrigin(myPlot); teleport(o.x + OLD_PLOT / 2, G, o.z - 2, Math.PI); scatter = { t: performance.now(), n: 0 }; }   // 11/21 침대가 없으면 집 둘레 12~28칸 어딘가로(아래 scatterStep)
    else teleport(XM + 0.5, G, PZ0 - 9, Math.PI);
  }
  // 집 둘레 아무 데나: 땅이 불러와지면 집 가운데에서 12~28칸 떨어진 빈 땅(남의 땅·물·방주 밖)을 골라 옮김 — 못 찾으면 집 앞 그대로
  var scatter = null;
  function scatterStep() {
    if (!scatter || myPlot < 0) { scatter = null; return; }
    if (performance.now() - scatter.t > 4000) { scatter = null; return; }
    var o = plotOrigin(myPlot), cx = o.x + PLOT / 2, cz = o.z + PLOT / 2;
    for (var k = 0; k < 6 && scatter; k++) {
      scatter.n++;
      var ang = Math.random() * Math.PI * 2, r = 12 + Math.random() * 16, x = cx + Math.cos(ang) * r, z = cz + Math.sin(ang) * r, ix = Math.floor(x), iz = Math.floor(z);
      if (!colAt(ix, iz)) continue;
      var pa = plotAt(ix, iz); if (pa >= 0 && pa !== myPlot) continue;
      var gy = groundAt(x, z, SY - 3); if (gy === null || inArk(ix, gy, iz) || get(ix, gy, iz) === WATER || get(ix, gy - 1, iz) === WATER) continue;
      if (isSolid(get(ix, gy, iz)) || isSolid(get(ix, gy + 1, iz))) continue;
      teleport(ix + 0.5, gy, iz + 0.5, Math.atan2(ix + 0.5 - cx, iz + 0.5 - cz)); scatter = null; return;   // 집 쪽을 바라봄
    }
  }
  function stepVitals(dt) {
    scatterStep();
    if (!vitalsOn()) { if ($('vitals').innerHTML) $('vitals').innerHTML = ''; return; }
    var headWater = get(Math.floor(P.x), Math.floor(P.y + EYE + P.camY), Math.floor(P.z)) === WATER;
    if (headWater) { AIRV -= dt; if (AIRV <= 0) { AIRV = 0; drownT -= dt; if (drownT <= 0) { drownT = 1; hurt(2, '물속에서 숨이 막혔어요'); } } }
    else AIRV = Math.min(10, AIRV + dt * 4);
    if (headWater && has('noah')) AIRV += dt * 0.5;   // 노아의 증표: 숨을 두 배 오래
    regenT += dt;
    if (FOOD >= 16 && HP < 20 && regenT > (has('abel') ? 2 : 4)) { regenT = 0; HP++; exhaust(1.2); renderVitals(); }
    if (FOOD === 0) { starveT += dt; if (starveT > 8) { starveT = 0; if (HP > 2) hurt(1, '배가 고파요'); } } else starveT = 0;
    if (FAITH < 20 && performance.now() - faithHitT > 6000 && !SHADOWS.some(function (s) { return !s.dead && Math.hypot(s.x - P.x, s.z - P.z) < 12; })) { faithRegT += dt; if (faithRegT > (matesNear() ? 2 : 3)) { faithRegT = 0; FAITH++; renderVitals(); } } else faithRegT = 0;
    vitT -= dt; if (vitT <= 0) { vitT = 0.25; renderVitals(headWater || AIRV < 10); }
  }
  var vitKey = '';
  function renderVitals(showAir) {
    var el = $('vitals'); if (!vitalsOn()) { el.innerHTML = ''; return; }
    var air = showAir === undefined ? AIRV < 10 : showAir, shield = FAITH < 20 || SHADOWS.some(function (s) { return !s.dead; }), key = HP + ',' + FOOD + ',' + (air ? Math.ceil(AIRV) : -1) + ',' + (shield ? FAITH : -1);
    if (key === vitKey) return; vitKey = key;
    function row(n, full, half, empty, cls) { var h = ''; for (var i = 0; i < 10; i++) { var v = n - i * 2; h += '<b class="' + cls + (v >= 2 ? '' : (v === 1 ? ' half' : ' off')) + '">' + (v >= 2 ? full : (v === 1 ? half : empty)) + '</b>'; } return h; }
    el.innerHTML = (shield ? '<span class="sh" title="믿음">' + row(FAITH, '✦', '✦', '✧', 's') + '</span>' : '') + '<span class="hp" title="체력">' + row(HP, '♥', '♥', '♥', 'h') + '</span>' + (air ? '<span class="air" title="숨">' + row(Math.ceil(AIRV) * 2, '●', '●', '○', 'a') + '</span>' : '') + '<span class="fd" title="기운(배고픔)">' + row(FOOD, '◆', '◆', '◇', 'f') + '</span>';
  }
  function eatItem(id) {
    if (!vitalsOn()) return deny('관리자는 배고프지 않아요');
    if (FOOD >= 20 && HP >= 20) return deny('배가 불러요');
    if (have(id) < 1) return;
    var heal = Math.min(20 - HP, healOf(id));   // 11/21: 먹으면 체력도 바로 참(고기마다 다름)
    take(id, 1); FOOD = Math.min(20, FOOD + FOODS[id]); HP += heal; EXH = 0; sfx('pop', 600); bagChanged(); renderVitals(); stateDirty(); unlock('eat');
    toast(jo(B[id][0], '을', '를') + ' 먹었어요 — 기운 +' + FOODS[id] + (heal > 0 ? ' · 체력 +' + heal : '') + (id === BREAD ? ' (마 4:4)' : ''));
  }
  // ── 농사: 풀·꽃을 캐면 가끔 밀 씨 → 흙·풀 위에 심으면 싹 → 자람 → 이삭 → 익음(물이 가까우면 빨리) ──
  var CROPS = [];
  try { CROPS = JSON.parse(localStorage.getItem('arkVillage.crops') || '[]') || []; } catch (e) { CROPS = []; }
  function saveCrops() { try { localStorage.setItem('arkVillage.crops', JSON.stringify(CROPS)); } catch (e) {} stateDirty(); }
  function isCrop(id) { return id >= CROP0 && id < CROP0 + 4 || !!FARM_PLANTS[id]; }
  function cropTime(x, y, z) {
    var wet = false;
    for (var dz = -4; dz <= 4 && !wet; dz++) for (var dx = -4; dx <= 4; dx++) if (get(x + dx, y - 1, z + dz) === WATER || get(x + dx, y - 2, z + dz) === WATER) { wet = true; break; }
    var watered = wet || ditchWaterNear(x,y,z), sk = [0.8, 1, 0.7, watered ? 1 : 1.5][seasonIndex()];   // 이른 비·맑은 철·늦은 비·가뭄
    return (40 + Math.random() * 30) * (watered ? 0.6 : 1) * sk * 1000;
  }
  function plantHeight(id) { var farm = FARM_PLANTS[id]; return farm ? 1 + (farm.height-1)*(id-farm.base)/3 : 1; }
  var STATION_BITS = {401:1|32,402:2,403:4,404:8,405:1,461:16,467:32};   // 32 = 굽는 불(모닥불·화덕과 솥, 11/21)
  var workshopCache = { x:null,y:null,z:null,until:0, mask:0 };
  function workshopNeeds() {
    var x=Math.floor(P.x), y=Math.floor(P.y), z=Math.floor(P.z), now=performance.now();
    if(x===workshopCache.x&&y===workshopCache.y&&z===workshopCache.z&&now<workshopCache.until) return workshopCache.mask;
    var mask=0;
    for(var dz=-4;dz<=4;dz++) for(var dx=-4;dx<=4;dx++) for(var dy=-2;dy<=3;dy++)
      mask |= STATION_BITS[get(x+dx,y+dy,z+dz)]||0;
    workshopCache={x:x,y:y,z:z,until:now+250,mask:mask};
    return mask;
  }
  function drawWell(held) {
    var out=held===BUCKET?WATER_BUCKET:(held===WATER_JAR?FULL_JAR:0);
    if (!out || !have(held)) return deny('빈 양동이나 빈 물동이를 들고 우물을 눌러요. 두레박으로 물을 길어요');
    if (!give(out,1)) return bagFull();
    take(held,1);bagChanged();sfx('pop');toast('우물에서 물을 길었어요');
  }
  function pourWater(held,h) {
    if (!have(held)) return;
    var x=h.px,y=h.py,z=h.pz, why=canPlace(x,y,z,WATER);
    if (why) return deny(why);
    if (!inMyPlot(x,z) && !inCommons(x,z)) return deny('내 땅이나 함께 짓는 터에서 물을 부어요');
    if (get(x,y,z)!==AIR) return deny('물이 들어갈 빈 곳을 골라요');
    var empty=held===WATER_BUCKET?BUCKET:WATER_JAR;
    if (!give(empty,1)) return bagFull();
    take(held,1);setBlock(x,y,z,WATER);bagChanged();sfx('pop');
  }
  function tillGround(h) {
    var old=get(h.x,h.y,h.z), why=canPlace(h.x,h.y,h.z,FARM_SOIL);
    if (why) return deny(why);
    if ((old!==DIRT && old!==GRASS) || h.py!==h.y+1 || get(h.x,h.y+1,h.z)!==AIR) return deny('윗칸이 빈 흙이나 풀의 윗면을 갈아요');
    setBlock(h.x,h.y,h.z,FARM_SOIL); sfx('dig'); toast('밭을 갈았어요. 씨나 묘목을 심어 보세요');
  }
  function trackCrop(x,y,z,base,stage) {
    CROPS=CROPS.filter(function(c){return c.x!==x||c.y!==y||c.z!==z;});
    CROPS.push({x:x,y:y,z:z,s:stage,base:base,t:Date.now()+cropTime(x,y,z)}); saveCrops();
  }
  function useFishing(item,dir) { return fishTap(item,dir); }   // 11/21 타이밍 낚시(15e-fun.js)
  function plantSeed(h, seedId) {
    seedId=seedId || SEED;
    var farm=FARM_SEEDS[seedId];
    var g = get(h.x, h.y, h.z);
    if (h.py !== h.y + 1 || h.px !== h.x || h.pz !== h.z) return deny('씨나 묘목은 땅의 윗면에 심어요');
    if (farm ? g!==FARM_SOIL : g!==GRASS && g!==DIRT && g!==FARM_SOIL)
      return deny(farm?'괭이로 갈아 놓은 밭에 심어요':'흙이나 풀 위에 심어요');
    if(farm&&farm.height>1) for(var dy=2;dy<=Math.ceil(farm.height);dy++)
      if(get(h.x,h.y+dy,h.z)!==AIR) return deny('묘목 위에 빈 공간을 만들어 주세요');
    if (get(h.x, h.y + 1, h.z) !== AIR) return deny('위가 비어 있어야 심을 수 있어요');
    var why = canPlace(h.x, h.y + 1, h.z, SAPLING); if (why) return deny(why);
    var base=farm?farm.base:CROP0;
    take(seedId,1);
    if(g===GRASS) setBlock(h.x,h.y,h.z,DIRT);
    setBlock(h.x,h.y+1,h.z,base); trackCrop(h.x,h.y+1,h.z,base,0);
    sfx('place', 1700); bagChanged(); swingT = 0.25;
    if (!plantTold) { plantTold = true; toast('심었어요. 물이 가까우면 더 빨리 자라요'); }
  }
  var plantTold = false;
  function stepCrops() {
    if (!CROPS.length || !started) return;
    var now = Date.now(), ch = false;
    CROPS = CROPS.filter(function (c) {
      if (!colAt(c.x, c.z)) return true;
      var id = get(c.x, c.y, c.z); if (!isCrop(id)) { ch = true; return false; }
      var base=c.base || CROP0, actual=FARM_PLANTS[id] ? FARM_PLANTS[id].base : CROP0;
      if (actual!==base) { ch=true; return false; }
      if (id-base<3 && now>=c.t) { c.s=id-base+1;c.t=now+cropTime(c.x,c.y,c.z);setBlock(c.x,c.y,c.z,base+c.s);ch=true; }
      return true;
    });
    if (ch) saveCrops();
  }
  setInterval(stepCrops,1000);
  // ── 풀 다시 자라기(11/22 전도사님 「잔디 흙을 파고 흙을 다시 채우면 주변 잔디가 있을 때 다시 잔디가 자라게」) ──
  // 내가 놓은 흙만 지켜본다. 위가 비어 있고(꽃·풀은 괜찮음) 둘레 3×3×3 안에 풀이 있으면 10~25초 뒤 풀이 된다. 조건이 안 되면 조금 뒤 다시 본다.
  var DIRTS = [];
  try { DIRTS = (JSON.parse(localStorage.getItem('arkVillage.dirt') || '[]') || []).slice(-300); } catch (e) { DIRTS = []; }
  function saveDirts() { try { localStorage.setItem('arkVillage.dirt', JSON.stringify(DIRTS)); } catch (e) {} }
  function noteDirt(x, y, z) {
    DIRTS = DIRTS.filter(function (d) { return d.x !== x || d.y !== y || d.z !== z; });
    DIRTS.push({ x: x, y: y, z: z, t: Date.now() + (10 + Math.random() * 15) * 1000 });
    if (DIRTS.length > 300) DIRTS.shift();
    saveDirts();
  }
  function grassNear(x, y, z) {
    for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) for (var dz = -1; dz <= 1; dz++)
      if ((dx || dz) && get(x + dx, y + dy, z + dz) === GRASS) return true;
    return false;
  }
  function stepDirts() {
    if (!DIRTS.length || !started) return;
    var now = Date.now(), ch = false;
    DIRTS = DIRTS.filter(function (d) {
      if (!colAt(d.x, d.z)) return true;
      if (get(d.x, d.y, d.z) !== DIRT) { ch = true; return false; }
      if (now < d.t) return true;
      var up = get(d.x, d.y + 1, d.z);
      if ((up !== AIR && kind(up) !== 'plant') || !grassNear(d.x, d.y, d.z) || canPlace(d.x, d.y, d.z, GRASS)) { d.t = now + (8 + Math.random() * 12) * 1000; ch = true; return true; }
      setBlock(d.x, d.y, d.z, GRASS); ch = true; return false;
    });
    if (ch) saveDirts();
  }
  setInterval(stepDirts, 2000);
  // ── 동물 기르기: 밀을 들고 있으면 양·소·염소가 따라오고, 밀을 먹인 둘이 가까이 있으면 새끼가 태어남. 내 땅 안의 동물은 저장 ──
  var BREEDS = { sheep: 1, cow: 1, goat: 1, pig: 1, chicken: 1, horse: 1, donkey: 1, camel: 1, rabbit: 1 }, HERD = [];   // 11/21 모든 짐승이 새끼를 낳음
  try { HERD = JSON.parse(localStorage.getItem('arkVillage.herd') || '[]') || []; } catch (e) { HERD = []; }
  var pendingHerd = HERD.slice(), herdT = 0;
  function feedAnimal(a, food) {
    var now = Date.now(); food = food || WHEAT;
    if (a.baby) return deny('새끼는 아직 어려요');
    if (a.breedAt && now < a.breedAt) return deny('조금 쉬었다가 다시 먹여요');
    take(food, 1); bagChanged(); a.love = now + 30000; animalCall(a.kind); heartAt(a);
    var mate = animals.filter(function (b) { return b !== a && b.kind === a.kind && b.love > now && !b.baby && Math.hypot(b.x - a.x, b.z - a.z) < 10; })[0];
    if (mate) {
      var baby = makeBeast(a.kind, (a.x + mate.x) / 2, (a.z + mate.z) / 2); baby.baby = true; baby.growAt = now + 180000; baby.mesh.scale.setScalar(0.55); animals.push(baby);
      a.love = mate.love = 0; a.breedAt = mate.breedAt = now + 60000; heartAt(baby);
      toast('♥ 새끼가 태어났어요! 3분 지나면 다 자라요. 내 땅 안에 있으면 저장돼요'); unlock('breed'); saveHerd();
    } else toast(jo(B[food][0], '을', '를') + ' 먹었어요 ♥ — 가까이 있는 같은 동물에게도 먹이면 새끼가 태어나요');
  }
  function heartAt(a) { var s = textSprite('♥', 'rgba(0,0,0,0)', '#ff5a7a', 0.9); s.position.set(a.x, a.y + 2.6, a.z); scene.add(s); var t0 = performance.now(); (function up() { var k = (performance.now() - t0) / 1400; if (k >= 1) { disposeSprite(s); return; } s.position.y += 0.02; s.material.opacity = 1 - k; requestAnimationFrame(up); })(); }
  function inMyPlot(x, z) { return myPlot >= 0 && plotAt(Math.floor(x), Math.floor(z)) === myPlot; }
  function saveHerd() {
    var a = animals.filter(function (x) { return BREEDS[x.kind] && !x.saddled && inMyPlot(x.x, x.z); }).slice(0, 16).map(function (x) { return { k: x.kind, x: Math.round(x.x * 10) / 10, z: Math.round(x.z * 10) / 10, b: x.baby ? 1 : 0 }; });
    pendingHerd.forEach(function (o) { if (a.length < 16) a.push(o); });
    var had = HERD.length; HERD = a; try { localStorage.setItem('arkVillage.herd', JSON.stringify(HERD)); } catch (e) {} stateDirty();
    if (!had && HERD.length) questCheck();
  }
  var lostSheep=null, wordIndex=0, hornAt=0, slingAt=0;
  function verseSource(ref) {
    if(typeof BLESSING_POOL==='undefined') return null;
    return BLESSING_POOL.find(function(v){return v.ref===ref && !!v.text;})||null;
  }
  function showWordCard(prayer) {
    var rows=typeof BLESSING_POOL==='undefined'?[]:BLESSING_POOL.filter(function(v){
      return typeof v.text==='string' && /^(시편 23:1|로마서 8:28|빌립보서 4:13|이사야 41:10|요한복음 14:27)$/.test(v.ref);
    });
    var v=prayer ? verseSource('시편 23:1') : (rows.length ? rows[wordIndex++ % rows.length] : null);
    $('cardEmoji').textContent=prayer?'🕊':'📜'; $('cardName').textContent=prayer?'감사 기도':'말씀 두루마리';
    $('cardText').textContent=v?v.text:'말씀을 불러오는 중이에요. 조금 뒤에 다시 열어 주세요';
    $('cardRef').textContent=v?v.ref.replace(/ (\d+):(\d+)$/,' $1장 $2절')+' · 개역개정판, ⓒ 대한성서공회':'';
    $('cardNew').textContent=prayer?'예수님, 저를 돌보아 주셔서 감사해요. 아멘.':'말씀우물 구절 데이터';
    $('card').classList.add('show'); clearTimeout(cardT); cardT=setTimeout(function(){$('card').classList.remove('show');},14000);
    refillFaith();
  }
  function headingName() {
    return ['북쪽','서쪽','남쪽','동쪽'][((Math.round(P.yaw/(Math.PI/2))%4)+4)%4];
  }
  function callShofar() {
    var now=performance.now();if(now<hornAt)return;hornAt=now+3000;
    tone('triangle',205,186,0.34,0.15,4);
    setTimeout(function(){tone('triangle',181,156,0.47,0.13,4);},360);
    toast('쇼파르 소리가 마을에 울려요');
  }
  function slingPractice(hit) {
    if(!hit || get(hit.x,hit.y,hit.z)!==SLING_TARGET)return deny('연습 표적에 가운데 +를 맞추고 눌러요');
    var now=performance.now();if(now<slingAt)return;
    if(!have(ROUND_STONE))return deny('가방에서 매끄러운 돌을 준비해요');
    slingAt=now+600;take(ROUND_STONE,1);bagChanged();burst(hit.x,hit.y,hit.z,SLING_TARGET);sfx('pop');
    toast('연습 표적에 맞았어요');
  }
  function shepherdVisit(n) {
    if(lostSheep && animals.indexOf(lostSheep)<0)lostSheep=null;
    if(lostSheep) {
      if(lostSheep.found&&Math.hypot(lostSheep.x-n.x,lostSheep.z-n.z)<=7){
        scene.remove(lostSheep.mesh);
        animals.splice(animals.indexOf(lostSheep),1);
        lostSheep=null;
        toast('양이 목자 곁으로 돌아왔어요. 예수님은 잃은 양을 찾는 목자 이야기를 들려주셨어요 (누가복음 15장 4–7절)');
      }else toast(lostSheep.found?'지팡이를 든 채 양을 목자 곁까지 데려와요':'목장 바깥에서 양을 찾아 눌러요');
      return;
    }
    var offsets=[[20,14],[-20,14],[20,-14],[-20,-14]], point=null;
    for(var i=0;i<offsets.length;i++) {
      var x=n.x+offsets[i][0],z=n.z+offsets[i][1],y=groundAt(x,z,SY-3);
      if(colAt(x,z)&&y!==null&&get(Math.floor(x),Math.floor(y+1),Math.floor(z))!==WATER){point=[x,z];break;}
    }
    if(!point)return deny('목장 주변을 먼저 둘러본 뒤 목자와 다시 이야기해요');
    lostSheep=makeBeast('sheep',point[0],point[1]);animals.push(lostSheep);
    toast('목장 바깥 '+(point[0]>n.x?'동쪽':'서쪽')+'에서 길 잃은 양을 찾아 눌러요');
  }
  function stepHerd(dt) {
    var now=Date.now(), held=HOTBAR[sel], active=have(held)>0 && ui==='play';
    var lure=active&&held===WHEAT, seedLure=active&&held===SEED, staff=active&&held===STAFF;
    animals.forEach(function (a) {
      if (!BREEDS[a.kind]) return;
      if (a.baby && now > a.growAt) { a.baby = false; a.mesh.scale.setScalar(1); }
      a.kept = inMyPlot(a.x, a.z);
      if ((lure || (seedLure && a.kind==='chicken') || (staff && a.kind==='sheep' && (a!==lostSheep || a.found))) && a !== riding && !a.saddled) {
        var dx = P.x - a.x, dz = P.z - a.z, d = Math.hypot(dx, dz);
        if (d < 14 && d > 3) { a.h = Math.atan2(-dx, -dz); a.mode = 'walk'; a.t = 0.6; a.luredUntil = now + 1500; }
        else if (d <= 3 && a.mode === 'walk') { a.mode = 'idle'; a.t = 1; }
      }
    });
    if (pendingHerd.length) pendingHerd = pendingHerd.filter(function (o) {
      if (!colAt(o.x | 0, o.z | 0) || groundAt(o.x, o.z, SY - 3) === null) return true;
      var a = makeBeast(o.k, o.x, o.z); if (o.b) { a.baby = true; a.growAt = Date.now() + 120000; a.mesh.scale.setScalar(0.55); } a.kept = true; animals.push(a); return false;
    });
    herdT -= dt; if (herdT <= 0) { herdT = 5; if (myPlot >= 0 && !pendingHerd.length) saveHerd(); }
  }
  // 의자와 침대는 같은 자리 고정·일어나기 동작을 쓴다.
  var furnitureRest = null;
  function isNight() { var p = (dayT % DAY_LEN) / DAY_LEN; return p > 0.6 && p < 0.97; }
  function beginFurnitureRest(pose, x, y, z, id) {
    if (furnitureRest || riding || ferryRide || P.fly) return false;
    var facing = pose === 'sit' ? SHAPE[id].f : 2;
    var yaw = -facing * Math.PI / 2;
    var centerX = x + .5, centerZ = z + .5;
    var seatY = y + (pose === 'sit' ? CHAIR_SEAT : .56);
    furnitureRest = { pose:pose, x:x, y:y, z:z, id:id, yaw:yaw,
      standX:P.x, standY:P.y, standZ:P.z, standYaw:P.yaw, standPitch:P.pitch, standCamY:P.camY, timer:0 };
    resetInput();
    P.x = centerX; P.y = seatY; P.z = centerZ;
    P.vx = P.vy = P.vz = 0;
    P.yaw = yaw + Math.PI * .42; P.pitch = -.35; P.camY = 0;
    fallTop = null;
    $('restUp').hidden = false;
    toast(pose === 'sit' ? '의자에 앉았어요' : '침대에 누웠어요');
    return true;
  }
  function clearFurnitureRest() {
    if (!furnitureRest) return;
    clearTimeout(furnitureRest.timer);
    furnitureRest = null;
    document.body.classList.remove('sleep');
    $('restUp').hidden = true;
  }
  function standFromFurniture() {
    var rest = furnitureRest;
    if (!rest) return;
    resetInput();
    teleport(rest.standX, rest.standY, rest.standZ, rest.standYaw, true);
    P.pitch = rest.standPitch; P.camY = rest.standCamY;
  }
  function poseFurnitureAvatar(av, pose, x, y, z, yaw) {
    var parts = av.userData;
    av.rotation.set(pose === 'lie' ? Math.PI / 2 : 0, yaw, 0, 'YXZ');
    if (pose === 'lie') {
      var half = HT * .47;
      av.position.set(x - Math.sin(yaw) * half, y + HT * .13, z - Math.cos(yaw) * half);
    } else {
      av.position.set(x, y - HT * .375, z);
    }
    parts.legL.rotation.set(pose === 'sit' ? 1.06 : 0, 0, 0);
    parts.legR.rotation.copy(parts.legL.rotation);
    parts.armL.rotation.x = parts.armR.rotation.x = pose === 'sit' ? .26 : 0;
    parts.head.rotation.x = 0;
  }
  function useBed(x, y, z) {
    if (!beginFurnitureRest('lie', x, y, z, BED)) return;
    var newSpawn = !SPAWN || SPAWN.x !== x || SPAWN.y !== y + 1 || SPAWN.z !== z;
    SPAWN = { x: x, y: y + 1, z: z }; stateDirty();
    if (newSpawn) toast('🛏 이 침대가 다시 일어나는 자리가 됐어요 — 쓰러지면 여기서 일어나요');
    if (!isNight()) return;
    var rest = furnitureRest, bday = Math.floor(dayT / DAY_LEN);
    document.body.classList.add('sleep');
    rest.timer = setTimeout(function () {
      if (furnitureRest !== rest || get(x,y,z) !== BED) return;
      if (STORY.started && !inTown(x, z) && plotAt(x, z) < 0 && STORY.s.bedDay !== bday) {
        STORY.s.bedDay = bday; STORY.s.bedsOut++; saveStory();
      }
      dayT = (bday + 1.02) * DAY_LEN;
      standFromFurniture();
      toast('🌅 아침이에요 — 내가 평안히 눕고 자기도 하리니 나를 안전히 살게 하시는 이는 오직 여호와이시니이다 (시 4:8)');
      unlock('sleep');
    }, 1900);
  }
  // ── 레버: 누르면 켜고 끄고, 둘레 4칸 안의 문을 함께 여닫음 ──
  function useLever(x, y, z) {
    var id = get(x, y, z), on = id === LEVER;
    if (canPlace(x,y,z,id)) return;
    var linked=pulseMechanical(x,y,z,on);
    setBlock(x, y, z, on ? LEVER + 1 : LEVER); sfx('click', 1200);
    if (linked) { toast(on?'연결한 장치를 열었어요':'연결한 장치를 닫았어요'); return; }
    var done = {}, n = 0;
    for (var dy = -2; dy <= 3; dy++) for (var dz = -4; dz <= 4; dz++) for (var dx = -4; dx <= 4; dx++) {
      var d = get(x + dx, y + dy, z + dz);
      if (SHAPE[d] && SHAPE[d].type === 'trapdoor') { if (!!SHAPE[d].open !== on && !canPlace(x + dx, y + dy, z + dz, d)) { setBlock(x + dx, y + dy, z + dz, d ^ 1); n++; } continue; }
      if (!(SHAPE[d] && SHAPE[d].type === 'door')) continue;
      var col = doorColumn(x + dx, y + dy, z + dz), key = (x + dx) + ',' + col[0] + ',' + (z + dz); if (done[key]) continue; done[key] = 1;
      if (!!SHAPE[d].open !== on) { toggleDoor(x + dx, col[0], z + dz); n++; }
    }
    if (n) unlock('lever');
    toast(on ? '레버를 켰어요' + (n ? ' — 문 ' + n + '개가 열렸어요' : '') : '레버를 껐어요' + (n ? ' — 문 ' + n + '개가 닫혔어요' : ''));
  }
  // ── 표지판: 내 땅에 세우고 글을 고름(정해진 글·말씀만) ──
  var SIGN_TEXTS = ['어서 오세요', '나그네의 집', '우리 집', '창고', '농장', '목장', '쉬는 곳', '함께 지어요', '여호와는 나의 목자시니 내게 부족함이 없으리로다 (시 23:1)', '내가 평안히 눕고 자기도 하리니 나를 안전히 살게 하시는 이는 오직 여호와이시니이다 (시 4:8)', '노아가 그와 같이 하여 하나님이 자기에게 명하신 대로 다 준행하였더라 (창 6:22)'];
  var SIGNS = {}, OTHER_SIGNS = {}, signSprites = {}, signAt = null;
  function signString() { var a = []; for (var k in SIGNS) a.push(k.replace(/,/g, '.') + '=' + SIGNS[k]); return a.join('/'); }
  function signFromString(str, into) { (str || '').split('/').forEach(function (e) { var q = e.split('='); if (q.length === 2 && SIGN_TEXTS[+q[1]] !== undefined) into[q[0].replace(/\./g, ',')] = +q[1]; }); }
  // ── 액자(11/20): 손에 든 것 1개를 걸어 두고, 다시 누르면 꺼냄. 땅 저장에 함께 실려 다른 사람도 봄 ──
  var FRAMES = {}, OTHER_FRAMES = {}, frameMeshes = {}, frameTex = {}, FRAME_GEO = null;
  function frameString() { var a = []; for (var k in FRAMES) a.push(k.replace(/,/g, '.') + '=' + FRAMES[k]); return a.join('/'); }
  function frameFromString(str, into) { (str || '').split('/').forEach(function (e) { var q = e.split('='); if (q.length === 2 && INV.indexOf(+q[1]) >= 0) into[q[0].replace(/\./g, ',')] = +q[1]; }); }
  function frameKey(x, y, z) { var o = plotOrigin(myPlot); return (x - o.x) + ',' + (y - PY0) + ',' + (z - o.z); }
  function useFrame(x, y, z) {
    if (myPlot < 0 || plotAt(x, z) !== myPlot) { var ok = frameMeshes[x + ',' + y + ',' + z]; return toast(ok ? '🖼 액자: ' + nameOf(ok.userData.id) : '다른 사람의 액자예요'); }
    var k = frameKey(x, y, z), cur = FRAMES[k];
    if (cur) {
      if (give(cur, 1) < 1) return deny('🎒 가방이 가득 찼어요');
      delete FRAMES[k]; toast('🖼 ' + jo(nameOf(cur), '을', '를') + ' 액자에서 꺼냈어요');
    } else {
      var it = HOTBAR[sel];
      if (!it || have(it) < 1 || it === FRAME) return deny('걸어 둘 것을 손에 들고 액자를 눌러요');
      take(it, 1); FRAMES[k] = it; newsMark('frame'); toast('🖼 ' + jo(nameOf(it), '을', '를') + ' 액자에 걸었어요 — 다시 누르면 꺼내요');
    }
    bagChanged(); markDirty(); refreshFrames(); sfx('click'); swingT = 0.25;
  }
  function frameBroken(x, y, z) {
    if (myPlot < 0 || plotAt(x, z) !== myPlot) return;
    var k = frameKey(x, y, z), cur = FRAMES[k];
    if (cur) { dropItem(x + 0.5, y + 0.5, z + 0.5, cur, 1); delete FRAMES[k]; markDirty(); }
    refreshFrames();
  }
  function frameTexture(id) {
    if (frameTex[id]) return frameTex[id];
    var img = new Image(), t = new THREE.Texture(img);
    img.onload = function () { t.needsUpdate = true; }; img.src = ICON[id];
    t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; if (THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace;
    return (frameTex[id] = t);
  }
  function refreshFrames() {
    if (!FRAME_GEO) FRAME_GEO = new THREE.PlaneGeometry(0.62, 0.62);
    var want = {};
    function add(p, map) { var o = plotOrigin(p); for (var k in map) { var q = k.split(','), x = o.x + +q[0], y = PY0 + +q[1], z = o.z + +q[2], b = get(x, y, z); if (SHAPE[b] && SHAPE[b].type === 'frame' && ICON[map[k]]) want[x + ',' + y + ',' + z] = [map[k], SHAPE[b].f]; } }
    if (myPlot >= 0) add(myPlot, FRAMES);
    for (var p in OTHER_FRAMES) add(+p, OTHER_FRAMES[p]);
    for (var k in frameMeshes) { var m = frameMeshes[k], w = want[k]; if (!w || m.userData.id !== w[0] || m.userData.f !== w[1]) { scene.remove(m); m.material.dispose(); delete frameMeshes[k]; } }
    var lit = 0.35 + 0.65 * skyState.dayF;
    for (var k2 in want) {
      if (!frameMeshes[k2]) {
        var q = k2.split(','), w2 = want[k2], d = [[0, 0, -0.42], [0.42, 0, 0], [0, 0, 0.42], [-0.42, 0, 0]][w2[1]];
        var mesh = new THREE.Mesh(FRAME_GEO, new THREE.MeshBasicMaterial({ map: frameTexture(w2[0]), transparent: true, alphaTest: 0.1 }));
        mesh.position.set(+q[0] + 0.5 + d[0], +q[1] + 0.5, +q[2] + 0.5 + d[2]); mesh.rotation.y = [0, -Math.PI / 2, Math.PI, Math.PI / 2][w2[1]];
        mesh.userData = { id: w2[0], f: w2[1] }; scene.add(mesh); frameMeshes[k2] = mesh;
      }
      frameMeshes[k2].material.color.setScalar(lit);
    }
  }
  // ── 땅 이름 팻말(11/20): 주인 있는 땅 앞(길 쪽)에 나무 기둥 + 「OO님의 땅」 — 56칸 안만 그림, 차단한 사람은 번호만 ──
  var plotSignObjs = {}, plotPostMat = null, plotPostGeo = null, PLOT_NAMES = {}, PLOT_HIDDEN = {}, plotNameT = 0;
  function fetchPlotNames() {   // 주인이 쓴 팻말 글(서버, 금칙어 검사를 거친 것)
    if (!client || !me || me.id === 'test') return;
    client.rpc('get_ark_plot_names', {}).then(function (r) { if (!r || r.error || !Array.isArray(r.data)) return; PLOT_NAMES = {}; PLOT_HIDDEN = {}; r.data.forEach(function (row) { if (row.hidden) PLOT_HIDDEN[row.user_id] = row.body; else PLOT_NAMES[row.user_id] = row.body; }); }, function () {});
  }
  function refreshPlotSigns() {
    if (!started) return;
    if (plotNameT-- <= 0) { plotNameT = 30; fetchPlotNames(); }
    var want = {}, ids = [];
    for (var pu in plotUser) if (plotUser[pu]) ids.push(plotUser[pu]);
    if (me && me.id) ids.push(me.id);
    if (ids.length && me && me.id !== 'test' && typeof fetchNames === 'function') fetchNames(ids);   // 이름은 로그인했을 때만(구경 중엔 서버가 막음)
    for (var i = 0; i < PCOLS * PROWS; i++) {
      var u = plotUser[i]; if (!u && i !== myPlot) continue;
      var o = plotOrigin(i), cx = o.x + 0.5, cz = o.z - 1.5;   // 길 쪽 왼편 모서리
      if (Math.hypot(cx - P.x, cz - P.z) > 56) continue;
      var mine = i === myPlot, hidden = !mine && u && FRIENDS.hidden && FRIENDS.hidden.has(u);
      var nm = mine ? (me && NET.names[me.id]) : (hidden ? null : NET.names[u]);
      var own = mine ? (me && PLOT_NAMES[me.id]) : (hidden ? null : PLOT_NAMES[u]);
      want[i] = (mine ? '🏠 ' : '🏡 ') + (own ? own + (nm ? ' · ' + nm : '') : (nm ? nm + '님의 땅' : (i + 1) + '번 땅')) + (mine ? ' (내 땅)' : '');
    }
    for (var k in plotSignObjs) if (want[k] !== plotSignObjs[k].txt) { scene.remove(plotSignObjs[k].g); disposeSprite(plotSignObjs[k].s); delete plotSignObjs[k]; }
    for (var k2 in want) if (!plotSignObjs[k2]) {
      if (!plotPostMat) { plotPostMat = new THREE.MeshBasicMaterial({ color: 0x6b4a2b }); plotPostGeo = new THREE.BoxGeometry(0.16, 2.1, 0.16); }
      var o2 = plotOrigin(+k2), x2 = o2.x + 0.5, z2 = o2.z - 1.5, gy = groundAt(x2, z2, SY - 3); if (gy === null) continue;
      var g = new THREE.Group(), post = new THREE.Mesh(plotPostGeo, plotPostMat); post.position.y = 1.05; g.add(post);
      var s = signSprite(want[k2]); s.position.y = 2.1 + s.scale.y / 2; g.add(s);
      g.position.set(x2, gy, z2); scene.add(g); plotSignObjs[k2] = { g: g, s: s, txt: want[k2] };
    }
  }
  function openSignPick(x, y, z) {
    signAt = { x: x, y: y, z: z }; var L = $('signList'); L.innerHTML = '';
    SIGN_TEXTS.forEach(function (t, i) { var b = document.createElement('button'); b.className = 'mc'; b.textContent = t; b.addEventListener('click', function () { setSignText(i); }); L.appendChild(b); });
    openPanel('signs');
  }
  function setSignText(i) {
    if (!signAt) return; var o = plotOrigin(myPlot), key = (signAt.x - o.x) + ',' + (signAt.y - PY0) + ',' + (signAt.z - o.z);
    SIGNS[key] = i; markDirty(); refreshSigns(); closePanel(); sfx('click');
  }
  function wrapText(t, n) { var out = [], s = ''; Array.from(t).forEach(function (ch) { s += ch; if (s.length >= n && ch === ' ') { out.push(s.trim()); s = ''; } }); if (s.trim()) out.push(s.trim()); return out.slice(0, 4); }
  function signSprite(t) {
    var lines = wrapText(t, 12), px = 26, c = document.createElement('canvas'), g = c.getContext('2d'), f = px + 'px Galmuri11, "Malgun Gothic", sans-serif'; g.font = f;
    var w = Math.max.apply(null, lines.map(function (l) { return g.measureText(l).width; })) + 20, h = lines.length * (px + 6) + 12;
    c.width = Math.ceil(w); c.height = h; g = c.getContext('2d'); g.font = f; g.fillStyle = 'rgba(240,228,196,0.92)'; g.fillRect(0, 0, c.width, h); g.fillStyle = '#3a2a14'; g.textBaseline = 'top';
    lines.forEach(function (l, i) { g.fillText(l, 10, 8 + i * (px + 6)); });
    var tex = new THREE.CanvasTexture(c); tex.minFilter = THREE.LinearFilter; tex.generateMipmaps = false; if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
    var s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true })); var hh = 0.42 * lines.length + 0.2; s.scale.set(c.width / h * hh, hh, 1); return s;
  }
  function refreshSigns() {
    var want = {};
    function add(p, map) { var o = plotOrigin(p); for (var k in map) { var q = k.split(','), x = o.x + +q[0], y = PY0 + +q[1], z = o.z + +q[2]; if (!(SHAPE[get(x, y, z)] && SHAPE[get(x, y, z)].type === 'sign')) continue; want[x + ',' + y + ',' + z] = map[k]; } }
    if (myPlot >= 0) add(myPlot, SIGNS);
    for (var p in OTHER_SIGNS) add(+p, OTHER_SIGNS[p]);
    for (var k in signSprites) if (want[k] === undefined || signSprites[k].i !== want[k]) { disposeSprite(signSprites[k].s); delete signSprites[k]; }
    for (var k2 in want) if (!signSprites[k2]) { var q = k2.split(','), s = signSprite(SIGN_TEXTS[want[k2]]); s.position.set(+q[0] + 0.5, +q[1] + 1.55 + s.scale.y / 2, +q[2] + 0.5); scene.add(s); signSprites[k2] = { s: s, i: want[k2] }; }
  }
  // ── 함께 짓는 터: 방주 북쪽 들판 64×64칸, 누구나 함께 짓고 그 자리는 모두에게 남음 ──
  var COMMONS = [XM - 32, AZ0 - 92, XM + 31, AZ0 - 29];
  function inCommons(x, z) { return x >= COMMONS[0] && x <= COMMONS[2] && z >= COMMONS[1] && z <= COMMONS[3]; }
  // 터를 네 구역으로: 맡고 싶은 곳을 골라 함께 지어요(표지는 땅 위에 떠 있음)
  var ZONES = [['🌿 정원', 0.25, 0.25], ['🐑 우리', 0.75, 0.25], ['🛤 길과 다리', 0.25, 0.75], ['⛺ 모임터', 0.75, 0.75]], zoneSprites = null;
  function spawnZoneSigns() {
    if (zoneSprites || Math.abs(P.x - XM) > 120 || Math.abs(P.z - (COMMONS[1] + COMMONS[3]) / 2) > 120) return;
    zoneSprites = ZONES.map(function (z) {
      var s = signSprite(z[0] + ' 구역'), x = COMMONS[0] + (COMMONS[2] - COMMONS[0]) * z[1], zz = COMMONS[1] + (COMMONS[3] - COMMONS[1]) * z[2];
      s.position.set(x, G + 5, zz); s.scale.multiplyScalar(2.2); scene.add(s); return s;
    });
  }
  // 관리자(전도사님 계정만): 막힌 채팅 · 가방 숫자 의심 기록 보기
  function openAdminWatch() {
    if (!NET.admin || !client) return;
    var old = $('watchBox'); if (old) old.remove();
    if (lockOn) { try { document.exitPointerLock(); } catch (e) {} }
    var box = document.createElement('div'); box.id = 'watchBox';
    box.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:60;background:rgba(16,16,24,.96);border:2px solid #000;box-shadow:inset 0 0 0 2px #7a8aa0;padding:12px 14px;color:#fff;font-size:13px;width:min(440px,94vw);max-height:86vh;overflow:auto';
    function head(t) { var h = document.createElement('b'); h.textContent = t; h.style.cssText = 'display:block;font-size:15px;color:#ffe27a;margin:6px 0 4px'; box.appendChild(h); }
    function line(t, dim) { var d = document.createElement('div'); d.textContent = t; d.style.cssText = 'padding:3px 0;border-bottom:1px solid rgba(255,255,255,.08);' + (dim ? 'opacity:.6' : ''); box.appendChild(d); return d; }
    function when(at) { var d = new Date(at); return (d.getMonth() + 1) + '/' + d.getDate() + ' ' + d.getHours() + ':' + ('0' + d.getMinutes()).slice(-2); }
    head('🛡 지켜보기 — 관리자만 보여요');
    var chatH = line('🕊 막힌 채팅(최근 30일) — 불러오는 중…'), bagH;
    var c = document.createElement('button'); c.className = 'mc'; c.textContent = '닫기'; c.style.cssText = 'display:block;width:100%;margin-top:8px';
    c.addEventListener('click', function (e) { e.stopPropagation(); box.remove(); });
    document.body.appendChild(box); sfx('pop');
    client.rpc('get_ark_chat_blocked').then(function (r) {
      var rows = (r && r.data) || [];
      chatH.textContent = '🕊 막힌 채팅(최근 30일) ' + rows.length + '건' + (r.error ? ' — 불러오지 못했어요' : '');
      rows.slice(0, 40).forEach(function (x) { line(when(x.at) + ' · ' + (x.nick || '?') + ': ' + x.body); });
      bagH = line('🎒 가방 숫자 의심 기록 — 불러오는 중…');
      return client.rpc('get_ark_bag_flags');
    }).then(function (r) {
      var rows = (r && r.data) || [];
      bagH.textContent = '🎒 가방 숫자 의심 기록(최근 60일) ' + rows.length + '건' + (r.error ? ' — 불러오지 못했어요' : '');
      rows.slice(0, 40).forEach(function (x) {
        line(when(x.at) + ' · ' + (x.nick || '?') + ': 한 번에 ' + x.gain + '개 늘어남(가장 많이: ' + nameOf(x.top_item) + ' ' + x.top_gain + '개) — ' + (x.reverted ? '되돌림' : '기록만'), !x.reverted);
      });
      box.appendChild(c);
    }, function () { box.appendChild(c); toast('불러오지 못했어요'); });
  }
  // 관리자: 함께 짓는 터를 최근 몇 분만큼 되돌리기(모두의 화면에서 처음 풀밭으로)
  function adminRevertCommons() {
    if (!NET.admin || !client) return;
    var v = window.prompt('함께 짓는 터에서 최근 몇 분 동안 바뀐 것을 되돌릴까요?\n(0 = 지금까지 전부)', '30'); if (v === null) return;
    client.rpc('admin_revert_commons', { p_minutes: Math.max(0, parseInt(v, 10) || 0) }).then(function (r) {
      toast(r.error || r.data < 0 ? '되돌리지 못했어요' : '🧹 ' + r.data + '칸을 처음 모습으로 되돌렸어요');
    }, function () { toast('되돌리지 못했어요'); });
  }
  // ── 친구 집 구경: 내 땅을 보여 줄지·한 줄 소개를 정하고, 보여 준 집들로 가 보기 ──
  var INTROS = ['구경 오세요!', '함께 지은 나그네의 집', '작은 집이에요', '농장이 있어요', '동물 우리가 있어요', '높은 탑을 쌓았어요', '정원을 꾸몄어요', '방주를 닮은 집이에요'];
  function openVisit() {
    if (!me || !client || !NET.ok) { toast('로그인하면 친구 집을 구경할 수 있어요'); return; }
    openPanel('visit'); $('visitList').innerHTML = '<div class="empty">불러오는 중…</div>';
    Promise.all([client.rpc('get_ark_showcase'),client.rpc('get_ark_showcase_details').catch(function(){return {data:[]};})]).then(function (ans) {
      var r=ans[0],details = Array.isArray(ans[1].data)?ans[1].data:[];
      var L = $('visitList'); L.innerHTML = ''; var rows = r.data || [], mine = rows.filter(function (x) { return x.mine; })[0];
      var sel = $('visitIntro'); sel.innerHTML = ''; INTROS.forEach(function (t, i) { var o = document.createElement('option'); o.value = i; o.textContent = t; sel.appendChild(o); });
      if (mine) sel.value = mine.intro || 0;
      $('visitShow').checked = visitShown;
      var others = rows.filter(function (x) { return !x.mine; });
      if (!others.length) { L.innerHTML = '<div class="empty">아직 보여 준 친구 집이 없어요. 먼저 내 집을 보여 주세요!</div>'; return; }
      others.forEach(function (x) {
        var d = document.createElement('div'); d.className = 'vrow';
        var detail=details.find(function(d){return d.plot_idx===x.plot_idx;});
        var t = document.createElement('span'); t.textContent = '🏡 ' + shortName(x.nick, 8) + ' — ' + (INTROS[x.intro] || INTROS[0]) +
          (detail&&detail.theme?' · '+HOUSE_THEMES[detail.theme]:'')+' (' + (x.plot_idx + 1) + '번 땅)';
        var b = document.createElement('button'); b.className = 'mc'; b.textContent = '가 보기';
        b.addEventListener('click', function () {
          var o = plotOrigin(x.plot_idx);
          visitMarks=(detail&&Array.isArray(detail.marks)?detail.marks:[]).map(function(mark,i){
            return {id:'tour-'+i,label:'집 볼거리 '+(i+1),x:o.x+mark[0],z:o.z+mark[1]};
          });
          if(visitMarks.length)villageBook.target=visitMarks[0].id;
          guideTo([o.x + OLD_PLOT / 2, o.z - 3], shortName(x.nick, 8) + '의 집');
        });
        d.appendChild(t); d.appendChild(b); L.appendChild(d);
      });
    }, function () { $('visitList').innerHTML = '<div class="empty">불러오지 못했어요</div>'; });
  }
  var visitShown = false;
  try { visitShown = localStorage.getItem('arkVillage.show') === '1'; } catch (e) {}
  function saveShowcase() {
    if (!client || !me) return;
    var show = $('visitShow').checked, intro = +$('visitIntro').value || 0; visitShown = show;
    try { localStorage.setItem('arkVillage.show', show ? '1' : '0'); } catch (e) {}
    client.rpc('set_ark_showcase', { p_show: show, p_intro: intro }).then(function (r) { toast(r.data ? (show ? '내 집을 친구들에게 보여 줘요' : '내 집을 보여 주지 않아요') : '내 땅이 있어야 해요'); }, function () {});
  }
  // ── 파티(최대 4명): 초대·수락·나가기, 함께 채우는 파티 퀘스트, 보상은 업적과 칭호뿐 ──
  var PQ = [   // [키, 이모지, 할 일, 목표, 칭호]
    ['logs', '🪵', '함께 나무 300개 캐기', 300, '나무꾼'],
    ['build', '🧱', '함께 블록 400개 놓기', 400, '함께 짓는 사람'],
    ['harvest', '🌾', '함께 익은 밀 120번 거두기', 120, '추수하는 일꾼'],
    ['iron', '⚙', '함께 철 덩이 60개 녹이기', 60, '대장장이'],
    ['shadows', '⚔', '함께 어둠의 그림자 50번 물리치기', 50, '빛의 갑옷'],
    ['summit', '⛰', '파티원 누구든 아라랏 산 꼭대기에 오르기', 1, '산에 오른 사람']
  ];
  var TITLES = PQ.map(function (q) { return q[4]; }).concat(['세 겹 줄']);   // 마지막: 파티 퀘스트를 모두 마치면(전 4:12)
  var PARTY = { id: null, members: [], invites: [], progress: {}, pend: {}, seenInv: {}, flushT: 0, pollT: 0, busy: false, summitSent: false };
  var MYTITLE = -1, GOTTITLES = {};
  try { MYTITLE = +(localStorage.getItem('arkVillage.title') || -1); GOTTITLES = JSON.parse(localStorage.getItem('arkVillage.titles') || '{}') || {}; } catch (e) {}
  function saveTitles() { try { localStorage.setItem('arkVillage.title', String(MYTITLE)); localStorage.setItem('arkVillage.titles', JSON.stringify(GOTTITLES)); } catch (e) {} stateDirty(); }
  function inParty() { return !!PARTY.id; }
  function partyMate(u) { return inParty() && PARTY.members.some(function (m) { return m.id === u; }); }
  function partyAdd(k, n) { if (!inParty() || !n) return; var p = PARTY.progress[k]; if (p && p.done) return; PARTY.pend[k] = (PARTY.pend[k] || 0) + n; }
  var PARTY_ERR = { login: '로그인해야 파티를 맺을 수 있어요', self: '나는 초대할 수 없어요', nouser: '없는 사람이에요', busy: '이미 다른 파티에 있어요', full: '파티는 4명까지예요', gone: '초대가 사라졌어요(10분이 지났어요)', notleader: '파티를 이끄는 사람만 할 수 있어요' };
  function partyApply(d) {
    if (!d) return;
    var wasIn = PARTY.id, before = JSON.stringify(PARTY.progress);
    PARTY.id = d.party || null; PARTY.members = d.members || []; PARTY.invites = d.invites || []; PARTY.progress = d.progress || {};
    if (!PARTY.id) PARTY.pend = {};
    PARTY.invites.forEach(function (iv) { if (!PARTY.seenInv[iv.id]) { PARTY.seenInv[iv.id] = 1; toast('🤝 ' + shortName(iv.from, 8) + ' 님이 파티에 초대했어요 — 메뉴 → 🤝 파티에서 받아요'); sfx('click'); } });
    if (PARTY.id && !wasIn) { unlock('party'); chatSys('🤝 파티를 맺었어요 — 함께 파티 퀘스트를 채워요'); }
    if (wasIn && !PARTY.id) chatSys('파티에서 나왔어요');
    // 다 채운 파티 퀘스트 → 칭호와 업적
    var all = PARTY.id && PQ.every(function (q) { var p = PARTY.progress[q[0]]; return p && p.done; });
    PQ.forEach(function (q, i) {
      var p = PARTY.progress[q[0]];
      if (p && p.done && !GOTTITLES[i]) { GOTTITLES[i] = Date.now(); saveTitles(); unlock('pq'); setTimeout(function () { toast('🏷 칭호 「' + q[4] + '」을 받았어요 — ' + q[2]); }, 1200); }
    });
    if (all && !GOTTITLES[PQ.length]) { GOTTITLES[PQ.length] = Date.now(); saveTitles(); unlock('cord'); setTimeout(function () { toast('🏷 칭호 「세 겹 줄」 — 세 겹 줄은 쉽게 끊어지지 아니하느니라(전 4:12)'); }, 2400); }
    if (JSON.stringify(PARTY.progress) !== before || ui === 'party') { if (ui === 'party') renderParty(); }
    for (var u in NET.peers) { NET.peers[u].nick = null; peerName(NET.peers[u]); }   // 파티원 이름표 색
    netPill();
  }
  function partyFetch() {
    if (!client || !me || !NET.ok || PARTY.busy) return Promise.resolve();
    PARTY.busy = true;
    return client.rpc('get_my_party').then(function (r) { PARTY.busy = false; if (!r.error) partyApply(r.data); }, function () { PARTY.busy = false; });
  }
  function partyTick(dt) {
    if (!client || !me || !NET.ok) return;
    PARTY.pollT -= dt; PARTY.flushT -= dt;
    if (PARTY.pollT <= 0) { PARTY.pollT = ui === 'party' ? 4 : 15; partyFetch(); }
    // 아라랏 꼭대기
    if (inParty() && !PARTY.summitSent && P.y >= ARARAT_TOP) { terrain(Math.floor(P.x), Math.floor(P.z)); if (T.reg === 'ararat') { PARTY.summitSent = true; partyAdd('summit', 1); } }
    if (PARTY.flushT <= 0 && inParty()) {
      PARTY.flushT = 8;
      Object.keys(PARTY.pend).forEach(function (k) {
        var n = Math.min(50, PARTY.pend[k] || 0); if (n <= 0) return;
        PARTY.pend[k] -= n;
        client.rpc('party_progress', { p_key: k, p_n: n }).then(function (r) {
          if (r.error || !r.data) { PARTY.pend[k] = (PARTY.pend[k] || 0) + n; return; }
          var was = PARTY.progress[k] && PARTY.progress[k].done;
          PARTY.progress[k] = { n: r.data.n, done: r.data.n >= r.data.target };
          if (!was && PARTY.progress[k].done) partyFetch();
          if (ui === 'party') renderParty();
        }, function () { PARTY.pend[k] = (PARTY.pend[k] || 0) + n; });
      });
    }
  }
  function partyCall(fn, args, okMsg) {
    if (!client || !me || !NET.ok) { toast(PARTY_ERR.login); return; }
    client.rpc(fn, args || {}).then(function (r) {
      var v = r.data;
      if (r.error) { toast('하지 못했어요 — 인터넷을 확인해 주세요'); return; }
      if (v === 'ok') { if (okMsg) toast(okMsg); } else if (v === 'no') toast('초대를 사양했어요'); else toast(PARTY_ERR[v] || '하지 못했어요');
      PARTY.pollT = 0; partyFetch();
    }, function () { toast('하지 못했어요 — 인터넷을 확인해 주세요'); });
  }
  function openParty() {
    if (!me) { toast(PARTY_ERR.login); return; }
    if (!NET.ok) { toast('함께 놀기를 준비하는 중이에요. 조금 뒤에 다시 눌러 주세요'); return; }
    openPanel('party'); renderParty(); partyFetch(); sfx('click');
  }
  function renderParty() {
    var box = $('partyBody'); if (!box) return; box.innerHTML = '';
    function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; }
    function btn(t, fn) { var b = el('button', 'mc', t); b.addEventListener('click', function (e) { e.stopPropagation(); sfx('click'); fn(); }); return b; }
    var amLeader = PARTY.members.some(function (m) { return m.id === me.id && m.leader; });
    // 받은 초대
    PARTY.invites.forEach(function (iv) {
      var r = el('div', 'prow pinv'); r.appendChild(el('span', '', '🤝 ' + shortName(iv.from, 8) + ' 님의 파티 초대'));
      r.appendChild(btn('함께하기', function () { partyCall('party_answer', { p_invite: iv.id, p_yes: true }, '🤝 파티에 들어왔어요'); }));
      r.appendChild(btn('사양', function () { partyCall('party_answer', { p_invite: iv.id, p_yes: false }); }));
      box.appendChild(r);
    });
    // 내 파티
    box.appendChild(el('h3', '', inParty() ? '내 파티 (' + PARTY.members.length + '/4)' : '아직 파티가 없어요 — 아래에서 친구를 초대하면 파티가 생겨요'));
    PARTY.members.forEach(function (m) {
      var r = el('div', 'prow'); r.appendChild(el('span', '', (m.leader ? '👑 ' : '🧑 ') + shortName(m.nick || '친구', 10) + (m.id === me.id ? ' (나)' : '') + (NET.meta[m.id] ? ' · 접속 중' : '')));
      if (amLeader && m.id !== me.id) r.appendChild(btn('내보내기', function () { if (window.confirm(shortName(m.nick, 10) + ' 님을 파티에서 내보낼까요?')) partyCall('party_kick', { p_user: m.id }, '내보냈어요'); }));
      box.appendChild(r);
    });
    if (inParty()) { var lv = el('div', 'prow'); lv.appendChild(btn('파티 나가기', function () { if (window.confirm('파티에서 나갈까요? 함께 채운 기록은 파티에 남아요')) partyCall('party_leave', {}, '파티에서 나왔어요'); })); box.appendChild(lv); }
    // 초대할 수 있는 사람: 지금 접속한 사람
    if (!inParty() || PARTY.members.length < 4) {
      box.appendChild(el('h3', '', '지금 함께 있는 사람 초대하기'));
      var who = Object.keys(NET.meta).filter(function (u) { return u !== me.id && !partyMate(u); });
      if (!who.length) box.appendChild(el('div', 'empty', '지금 초대할 수 있는 사람이 없어요'));
      who.forEach(function (u) { var r = el('div', 'prow'); r.appendChild(el('span', '', '🧑 ' + shortName(NET.names[u] || '친구', 10))); r.appendChild(btn('초대', function () { partyCall('party_invite', { p_to: u }, '🤝 초대를 보냈어요 (10분 안에 받아야 해요)'); })); box.appendChild(r); });
    }
    // 파티 퀘스트
    box.appendChild(el('h3', '', '파티 퀘스트 — 두 사람이 한 사람보다 나음은 그들이 수고함으로 좋은 상을 얻을 것임이라 (전 4:9)'));
    PQ.forEach(function (q) {
      var p = PARTY.progress[q[0]] || { n: 0 }, n = Math.min(q[3], (p.n || 0) + (PARTY.pend[q[0]] || 0)), r = el('div', 'prow pq' + (p.done ? ' done' : ''));
      r.appendChild(el('span', '', q[1] + ' ' + q[2]));
      var bar = el('span', 'sbar'), s = el('s'); s.style.width = Math.round(100 * n / q[3]) + '%'; bar.appendChild(s); r.appendChild(bar);
      r.appendChild(el('small', '', (p.done ? '✔ ' : '') + n + '/' + q[3] + ' · 칭호 「' + q[4] + '」'));
      box.appendChild(r);
    });
    if (!inParty()) box.appendChild(el('div', 'empty', '파티를 맺어야 파티 퀘스트를 채울 수 있어요'));
    // 내 칭호
    box.appendChild(el('h3', '', '내 칭호 — 이름표 위에 보여요'));
    var tr = el('div', 'prow ptitles');
    var none = btn(MYTITLE < 0 ? '✔ 칭호 없음' : '칭호 없음', function () { MYTITLE = -1; saveTitles(); trackMe(); renderParty(); }); tr.appendChild(none);
    TITLES.forEach(function (t, i) {
      if (!GOTTITLES[i]) { tr.appendChild(el('span', 'tlock', '🔒 ' + t)); return; }
      tr.appendChild(btn((MYTITLE === i ? '✔ ' : '🏷 ') + t, function () { MYTITLE = i; saveTitles(); trackMe(); renderParty(); toast('🏷 칭호 「' + t + '」을 달았어요'); }));
    });
    box.appendChild(tr);
    box.appendChild(el('div', 'sverse', '너희가 짐을 서로 지라 그리하여 그리스도의 법을 성취하라 (갈라디아서 6:2)'));
  }
  function trackMe() { if (NET.chan && NET.on) NET.chan.track({ n: NET.nick, w: wornString(), t: MYTITLE }).catch(function () {}); }
  // ── 업적 ──
  var ACHS = [
    ['log', '🪵', '첫 통나무', '나무를 캐서 통나무를 얻어요'], ['table', '🪚', '제작대', '제작대를 만들어요'], ['tool', '⛏', '첫 도구', '도구를 하나 만들어요'],
    ['stone', '🪨', '돌의 단계', '돌을 캐요'], ['smelt', '🔥', '녹이는 사람', '용광로에서 무엇을 녹여요(욥 28:2)'], ['iron', '⚙', '철 덩이', '철 덩이를 얻어요'],
    ['diamond', '💎', '금강석', '금강석을 캐요(렘 17:1)'], ['house', '🏠', '첫 집', '내 땅에 블록 30개를 놓아요'], ['harvest', '🌾', '거두는 기쁨', '익은 밀을 거둬요'],
    ['eat', '🍞', '일용할 양식', '먹을 것을 먹어요'], ['breed', '🐑', '목자', '새끼 동물이 태어나게 해요'], ['ride', '🐎', '말 타기', '말이나 나귀를 타요'],
    ['wear', '👕', '옷 입기', '만든 옷을 입어요'], ['armor', '🛡', '전신 갑주', '하나님의 전신 갑주를 다 입어요(엡 6:11)'], ['commons', '🏗', '함께 짓기', '함께 짓는 터에 블록을 놓아요'],
    ['sleep', '🛏', '평안한 잠', '침대에서 자고 아침을 맞아요(시 4:8)'], ['shadow', '⚔', '말씀의 검', '어둠의 그림자를 물리쳐요(엡 6:17)'], ['chat', '💬', '첫 인사', '채팅으로 인사해요'], ['lever', '🔘', '레버', '레버로 문을 열어요'],
    ['tokens', '🎖', '믿음의 증표', '일곱 증표를 모두 받아요(히 11)'], ['stones', '💎', '열두 기초석', '기초석 열둘을 성벽 밑에 놓아요(계 21:19-20)'],
    ['valley', '🕯', '골짜기의 빛', '일곱 등잔대를 모두 밝혀요(시 23:4)'], ['home', '🏙', '본향에 이르다', '거룩한 성에 들어가요(히 11:16)'],
    ['party', '🤝', '함께 가는 길', '친구와 파티를 맺어요(시 133:1)'], ['pq', '🏷', '함께 받은 상', '파티 퀘스트 하나를 끝까지 채워요(전 4:9)'], ['cord', '🪢', '세 겹 줄', '파티 퀘스트를 모두 채워요(전 4:12)'], ['dex', '📖', '도감 완성', '도감을 다 채워요'],
    ['loaves', '🧺', '열두 바구니', '보리떡 다섯과 물고기 둘을 아이와 나눠요(요 6:13)'],
    ['noah', '🕊', '노아의 부탁', '노아의 부탁 다섯 가지를 마쳐요(창 6:22)'],
    ['together', '🤝', '함께 지었어요', '이번 주 마을 목표를 함께 채워요(느 2:18)'],
    ['rock', '💧', '반석의 물', '지팡이로 호렙의 반석을 쳐요(출 17:6)'], ['tabernacle', '⛺', '성막 모형', '내 땅에 성막 모형을 다 지어요(출 40:34)'], ['manna', '🍯', '일용할 만나', '광야에서 아침 만나를 거둬요(출 16:15)']
  ];
  var ACH = {};
  try { ACH = JSON.parse(localStorage.getItem('arkVillage.ach') || '{}') || {}; } catch (e) { ACH = {}; }
  function unlock(k) {
    if (ACH[k] || isAdm()) return; var a = ACHS.filter(function (x) { return x[0] === k; })[0]; if (!a) return;
    ACH[k] = Date.now(); try { localStorage.setItem('arkVillage.ach', JSON.stringify(ACH)); } catch (e) {} stateDirty();
    feedPost('ach', ACHS.indexOf(a));
    setTimeout(function () { toast('🏅 업적: ' + a[1] + ' ' + a[2] + ' — ' + a[3]); sfx('craft', 1600); }, 900);
  }
  function renderAch() {
    var g = $('achGrid'); if (!g) return; g.innerHTML = '';
    $('achCount').textContent = '업적 ' + ACHS.filter(function (a) { return ACH[a[0]]; }).length + ' / ' + ACHS.length;
    ACHS.forEach(function (a) { var d = document.createElement('div'); d.className = 'ach' + (ACH[a[0]] ? ' on' : ''); d.innerHTML = '<span class="em"></span><b></b><small></small>'; d.querySelector('.em').textContent = ACH[a[0]] ? a[1] : '🔒'; d.querySelector('b').textContent = a[2]; d.querySelector('small').textContent = a[3]; g.appendChild(d); });
  }
  // ── 마을 사람(말씀으로만 말함) ──
  var NPCS = [], NPC_DEFS = [
    { name:'빵 굽는 사람',x:XM+19,z:PZ0-9,look:{robe:0xd6ad77,robe2:0xe4cb9f,belt:0x70442c,
      trim:0x865636,skin:0xc68a60,hair:0x33251e,sandal:0x653c23,style:'scarf',scarf:0xe3cbab},
      text:'여행자에게 대접할 빵과 올리브, 구운 생선을 함께 차려 주세요.',ref:'마을 사람의 부탁',emoji:'🍞' },
    { name: '노아', x: XM + 7, z: AZ1 + 7, look: { robe: 0xd8cfb8, robe2: 0xc4b89a, belt: 0x6b4425, trim: 0x8a5a32, skin: 0xd9a67a, hair: 0xe8e4dc, sandal: 0x6b4425, style: 'long', fit: { beard: 0xe8e4dc, cloak: 0x7a5a3a } }, text: '노아가 그와 같이 하여 하나님이 자기에게 명하신 대로 다 준행하였더라', ref: '창세기 6:22', emoji: '⛵' },
    { name: '목자', x: XM + 46, z: PZ0 - 10, look: { robe: 0xddd0b0, robe2: 0xcfc09c, belt: 0x6b4425, trim: 0x7a5a3a, skin: 0xc98f62, hair: 0x2b1d14, sandal: 0x6b4425, style: 'scarf', scarf: 0xeee8d8, fit: { stripes: 0x7a5a3a, agal: 0x2a2018, staff: 0x8a6236 } }, text: '여호와는 나의 목자시니 내게 부족함이 없으리로다', ref: '시편 23:1', emoji: '🐑' },
    // 방주 안의 노아 가족(층마다 바닥 높이 y를 따로 준다)
    { name: '야벳', x: XM, z: AZ1 - 12, y: AY0 + 1, look: { robe: 0xc9b48c, robe2: 0xb8a27a, belt: 0x5a3a20, trim: 0x7a5a3a, skin: 0xd2a07a, hair: 0x3a2a1c, sandal: 0x6b4425, style: 'short', fit: { beard: 0x3a2a1c } }, text: '들어간 것들은 모든 것의 암수라 하나님이 그에게 명하신 대로 들어가매 여호와께서 그를 들여보내고 문을 닫으시니라', ref: '창세기 7:16', emoji: '🚪' },
    { name: '셈', x: XM - 13, z: AZ0 + 20, y: AY0 + 11, look: { robe: 0xb9c2a4, robe2: 0xa4ad8e, belt: 0x5a3a20, trim: 0x6a7050, skin: 0xd6a67e, hair: 0x2a1e14, sandal: 0x6b4425, style: 'long', fit: { beard: 0x2a1e14 } }, text: '혈육 있는 모든 생물을 너는 각기 암수 한 쌍씩 방주로 이끌어들여 너와 함께 생명을 보존하게 하되', ref: '창세기 6:19', emoji: '🐑' },
    { name: '함', x: AX1 - 22, z: AZ0 + 18, y: AY0 + 21, look: { robe: 0xc79a6a, robe2: 0xb58858, belt: 0x4a2e18, trim: 0x8a5a32, skin: 0xb27a52, hair: 0x1e1610, sandal: 0x6b4425, style: 'scarf', scarf: 0xe8d8b8, fit: { beard: 0x1e1610 } }, text: '너는 먹을 모든 양식을 네게로 가져다가 저축하라 이것이 너와 그들의 먹을 것이 되리라', ref: '창세기 6:21', emoji: '🏺' },
    { name: '노아의 아내', x: AX0 + 20, z: AZ0 + 14, y: AY0 + 21, look: { robe: 0x9a7aa0, robe2: 0x86688c, belt: 0x5a3a20, trim: 0x6a4a70, skin: 0xd9a67a, hair: 0xb8b2a8, sandal: 0x6b4425, style: 'scarf', scarf: 0xe4dccf }, text: '곧 그 날에 노아와 그의 아들 셈, 함, 야벳과 노아의 아내와 세 며느리가 다 방주로 들어갔고', ref: '창세기 7:13', emoji: '🏠' },
    { name: '마리아', x: NAT_X + 3, z: NAT_Z + 5, y: G, season: 1, look: { robe: 0x5b7fb8, robe2: 0x4a6aa0, belt: 0xd8cfb8, trim: 0x3a5488, skin: 0xd9a67a, hair: 0x3a2618, sandal: 0x6b4425, style: 'scarf', scarf: 0x7fa0d0 }, text: '마리아는 이 모든 말을 마음에 새기어 생각하니라', ref: '누가복음 2:19', emoji: '🤍' },
    { name: '요셉', x: NAT_X + 5, z: NAT_Z + 2, y: G, season: 1, look: { robe: 0x8a6a48, robe2: 0x765a3c, belt: 0x4a2e18, trim: 0x5a4028, skin: 0xc68a60, hair: 0x2b1d14, sandal: 0x6b4425, style: 'short', fit: { beard: 0x2b1d14 } }, text: '요셉이 잠에서 깨어 일어나 주의 사자의 분부대로 행하여 그의 아내를 데려왔으나', ref: '마태복음 1:24', emoji: '🪚' },
    { name: '천사', x: NAT_X + 12, z: NAT_Z + 10, y: G, season: 1, look: { robe: 0xf4f2ea, robe2: 0xe8e4d8, belt: 0xe0c060, trim: 0xe0c060, skin: 0xe5b98f, hair: 0xd8b878, sandal: 0xf0e8d0, style: 'long' }, text: '천사가 이르되 무서워하지 말라 보라 내가 온 백성에게 미칠 큰 기쁨의 좋은 소식을 너희에게 전하노라', ref: '누가복음 2:10', emoji: '👼' },
    { name: '동방 박사', x: NAT_X + 14, z: NAT_Z - 1, y: G, season: 1, look: { robe: 0x7a3a8a, robe2: 0x6a2a7a, belt: 0xe0b040, trim: 0xe0b040, skin: 0xb27a52, hair: 0x1e1610, sandal: 0x6b4425, style: 'scarf', scarf: 0xe0b040 }, text: '유대인의 왕으로 나신 이가 어디 계시냐 우리가 동방에서 그의 별을 보고 그에게 경배하러 왔노라 하니', ref: '마태복음 2:2', emoji: '👑' },
    { name: '동방 박사', x: NAT_X + 13, z: NAT_Z + 4, y: G, season: 1, look: { robe: 0x2a6a5a, robe2: 0x1f5a4a, belt: 0xe0b040, trim: 0xd0a030, skin: 0xd2a07a, hair: 0x3a2a1c, sandal: 0x6b4425, style: 'long', fit: { beard: 0x3a2a1c } }, text: '그들이 별을 보고 매우 크게 기뻐하고 기뻐하더라', ref: '마태복음 2:10', emoji: '⭐' },
    { name: '동방 박사', x: NAT_X + 14, z: NAT_Z + 9, y: G, season: 1, look: { robe: 0xa04030, robe2: 0x8a3428, belt: 0xe0b040, trim: 0xe0b040, skin: 0x9a6440, hair: 0x1e1610, sandal: 0x6b4425, style: 'scarf', scarf: 0xf0d080 }, text: '집에 들어가 아기와 그의 어머니 마리아가 함께 있는 것을 보고 엎드려 아기께 경배하고 보배합을 열어 황금과 유향과 몰약을 예물로 드리니라', ref: '마태복음 2:11', emoji: '🎁' },
    { name: '상인', x: XM + 32, z: AZ1 + 8, look: { robe: 0xb88a3a, robe2: 0xa27830, belt: 0x5a3a20, trim: 0x7a5228, skin: 0xc68a60, hair: 0x2b1d14, sandal: 0x6b4425, style: 'scarf', scarf: 0xd8b060, fit: { beard: 0x2b1d14, bag: 0x8a5a32 } }, text: '속이는 저울은 여호와께서 미워하시나 공평한 추는 그가 기뻐하시느니라', ref: '잠언 11:1', emoji: '⚖' },
    { name: '농부', x: XM - 12, z: VZ1 + 6, look: { robe: 0xa89a6a, robe2: 0x948858, belt: 0x5a3a20, trim: 0x6a5a38, skin: 0xb27a52, hair: 0x3a2a1c, sandal: 0x6b4425, style: 'short', fit: { beard: 0x3a2a1c } }, text: '더러는 좋은 땅에 떨어지매 자라 무성하여 결실하였으니 삼십 배나 육십 배나 백 배가 되었느니라 하시고', ref: '마가복음 4:8', emoji: '🌾' },
    { name: '어부', x: XM + 20, z: LZ - LRZ - 3, look: { robe: 0x6a8aa0, robe2: 0x5a7a90, belt: 0x4a3a28, trim: 0x4a6a80, skin: 0xb27a52, hair: 0x2b1d14, sandal: 0x6b4425, style: 'short', fit: { beard: 0x2b1d14 } }, text: '말씀하시되 나를 따라오라 내가 너희를 사람을 낚는 어부가 되게 하리라 하시니', ref: '마태복음 4:19', emoji: '🎣' },
    { name: '한 아이', x: XM - 20, z: LZ - LRZ - 3, look: { robe: 0xd8c8a0, robe2: 0xc8b890, belt: 0x8a5a32, trim: 0x8a5a32, skin: 0xd9a67a, hair: 0x3a2618, sandal: 0x6b4425, style: 'short' }, text: '여기 한 아이가 있어 보리떡 다섯 개와 물고기 두 마리를 가지고 있나이다 그러나 그것이 이 많은 사람에게 얼마나 되겠사옵나이까', ref: '요한복음 6:9', emoji: '🧺' },
    { name: '안내하는 나그네', x: XM - 6, z: PZ0 - 7, look: { robe: 0xe8e4da, robe2: 0xd8d2c4, belt: 0x8a4b14, trim: 0x8a4b14, skin: 0xe5b98f, hair: 0x3a2618, sandal: 0x6b4425, style: 'short', fit: { cloak: 0x3f4f6a, sash: 0x8a4b14, bag: 0x8a5a32 } }, text: '이 사람들은 다 믿음을 따라 죽었으며 약속을 받지 못하였으되 그것들을 멀리서 보고 환영하며 또 땅에서는 외국인과 나그네임을 증언하였으니', ref: '히브리서 11:13', emoji: '🧭' }
  ];
  function spawnNpcs() {
    arkBeasts(P.x, P.z);
    NPC_DEFS.forEach(function (d) {
      if (d.season && !FESTIVE) return;   // 성탄 인물은 절기에만
      if (NPCS.some(function (n) { return n.d === d; }) || !colAt(d.x, d.z)) return;
      var y = d.y !== undefined ? d.y : groundAt(d.x + 0.5, d.z + 0.5, SY - 3); if (y === null) return;
      var av = makeAvatar(d.look); dressAvatar(av, {}); av.position.set(d.x + 0.5, y, d.z + 0.5); av.rotation.y = Math.PI; scene.add(av);
      var tag = textSprite(d.name, 'rgba(60,40,10,0.6)', '#ffe9a0', 0.62); tag.position.y = HT + 0.7; av.add(tag);
      NPCS.push({ d: d, av: av, x: d.x + 0.5, y: y, z: d.z + 0.5 });
    });
    NPCS.forEach(function (n) { var dx = P.x - n.x, dz = P.z - n.z; if (Math.hypot(dx, dz) < 12) n.av.rotation.y = Math.atan2(-dx, -dz) + Math.PI; });
  }
  function showNpc(n) {
    var d = n.d, pi = DEX_PEOPLE.indexOf(d.name); if (pi >= 0) dexMore('n' + pi, d.name);
    if (d.name === '안내하는 나그네' && (!STORY.started || STORY.ended === false)) { if (!STORY.started) return startStory(); } $('cardEmoji').textContent = d.emoji; $('cardName').textContent = d.name; $('cardText').textContent = d.text; $('cardRef').textContent = d.ref; $('cardNew').textContent = '';
    $('card').classList.add('show'); sfx('pop'); clearTimeout(cardT); cardT = setTimeout(function () { $('card').classList.remove('show'); }, 10000);
  }
  // ── 어둠의 그림자(미움·거짓·교만): 밤 들판과 굴 속에 나옴. 마을·내 땅·함께 짓는 터·불빛 가까이엔 안 나옴.
  //    횃불을 들면 가까이 못 오고, 햇빛에 사라짐. 갑옷은 덜 다치게, 전신 갑주를 다 입으면 다치지 않음. 칼·성령의 검(엡 6:17)으로 물리침 ──
  var SHADOWS = [], shadowT = 3, shadowMat = null, shadowOutM = null, shadowTold = false;
  var SH_KINDS = {
    hate: { name: '미움', eye: 0xff3a3a, hp: 3, dmg: 2, speed: 4.2, h: 1 },
    lie: { name: '거짓', eye: 0xc060ff, hp: 2, dmg: 2, speed: 5.0, h: 0.95, blink: true },
    pride: { name: '교만', eye: 0xffc840, hp: 5, dmg: 3, speed: 3.0, h: 1.25 },
    doubt: { name: '의심', eye: 0x6ad0ff, hp: 3, dmg: 2, speed: 3.4, h: 1.05, ranged: true },   // 멀찍이 서서 불화살(엡 6:16)
    anger: { name: '분노', eye: 0xff5a1a, hp: 7, dmg: 5, speed: 3.8, h: 1.2, fuse: true },   // 11/21 가까이 오면 부풀다 터짐(엡 4:26) — 칼로 치면 밀려나며 식고, 물에 닿으면 꺼짐(잠 15:1)
    great: { name: '큰 그림자', eye: 0xff8a2a, hp: 10, dmg: 4, speed: 4.6, h: 1.45 }   // 골짜기에만
  };
  function shadowsOn() { return S.shadows !== false; }
  function armorGuard() {   // 0~1: 줄여 주는 몫
    var g = 0, god = 0;
    SLOTS.forEach(function (s) { var id = WORN[s]; if (!id) return; var sh = WEARINFO[id].shape, am = armOf(id, ARM_SHIELD0); if (sh.slice(-1) === 'G') { god++; g += 0.2; } else if (am >= 0) g += ARM_SHIELD_GUARD[am]; else if (/helm|mail|shield|crown/.test(sh)) g += 0.12; else g += 0.06; });
    return god === 5 ? 1 : Math.min(0.85, g);
  }
  function makeShadow(kind, x, z) {
    var sp = SH_KINDS[kind], u = HT / 32 * sp.h, root = new THREE.Group();
    if (!shadowMat) shadowMat = new THREE.MeshBasicMaterial({ color: 0x08060c, transparent: true, opacity: 0.78 });
    var outM = kind === 'great' ? (shadowOutM || (shadowOutM = new THREE.MeshBasicMaterial({ color: 0x353b56, side: THREE.BackSide, transparent: true, opacity: 0.9 }))) : null;
    function box(w, h, d, x0, y0, z0, mat, par) {
      var m = new THREE.Mesh(new THREE.BoxGeometry(w * u, h * u, d * u), mat || shadowMat); m.position.set(x0 * u, y0 * u, z0 * u); (par || root).add(m);
      if (outM && !mat) { var o = new THREE.Mesh(m.geometry, outM); o.scale.setScalar(1.08); m.add(o); }   // 큰 그림자: 둘레 윤곽(밤 모래 위에서도 몸이 보이게)
      return m;
    }
    var eyeM = new THREE.MeshBasicMaterial({ color: sp.eye, fog: false }), crackM = null, top = 32.5;
    function headAt(x0, y0, z0, rx, rz) {   // 머리(눈 포함)를 한 덩이로 — 기울일 수 있게
      var hg = new THREE.Group(); hg.position.set(x0 * u, y0 * u, z0 * u); hg.rotation.set(rx || 0, 0, rz || 0); root.add(hg);
      box(8, 8, 8, 0, 0, 0, null, hg); box(1.6, 1.2, 0.4, -1.8, 0.5, -4.1, eyeM, hg); box(1.6, 1.2, 0.4, 1.8, 0.5, -4.1, eyeM, hg);
    }
    if (kind === 'pride') {   // 교만: 넓은 어깨, 가슴을 내밀고 뒤로 젖힘
      box(11, 13, 5, 0, 18, 0.4); box(9, 5, 1.6, 0, 21, -2.6); box(7.4, 8, 3.8, 0, 7, 0);
      box(3.2, 9.5, 3.2, -7.4, 18.5, 0.6).rotation.z = -0.18; box(3.2, 9.5, 3.2, 7.4, 18.5, 0.6).rotation.z = 0.18;
      headAt(0, 29, 1.2, -0.22, 0);
    } else if (kind === 'doubt') {   // 의심: 좁은 어깨, 머리를 한쪽으로 기울여 두리번
      box(6.2, 13, 4, 0, 18, 0); box(5.6, 8, 3.4, 0, 7, 0); box(2.4, 9, 2.4, -4.4, 19, 0); box(2.4, 9, 2.4, 4.4, 19, 0);
      headAt(1.4, 28.2, -0.4, 0.08, -0.38);
    } else if (kind === 'lie') {   // 거짓: 비대칭 — 한쪽 팔은 길고 다른 쪽은 짧고, 어깨 높이가 다름
      box(8.4, 13, 4.4, 0, 18, 0); box(7, 8, 3.6, 0, 7, 0); box(3, 13, 3, -6, 17, 0); box(2.4, 6.5, 2.4, 5.8, 21.2, 0);
      box(3.4, 2.4, 4.6, 4.6, 25.4, 0); box(2.2, 3, 2.2, -4.8, 26.2, 0.6);
      headAt(-0.8, 28.8, 0, 0, 0.12);
    } else if (kind === 'hate') {   // 미움: 짧은 팔에 주먹을 쥐고 웅크림
      box(7.4, 6, 3.6, 0, 5.2, 0.6); var tb = box(8.4, 11, 4.4, 0, 14.2, -0.4); tb.rotation.x = 0.22;
      box(3, 5, 3, -6, 15.4, -1.2); box(3, 5, 3, 6, 15.4, -1.2); box(3.8, 3.2, 3.8, -6, 11.6, -1.6); box(3.8, 3.2, 3.8, 6, 11.6, -1.6);
      headAt(0, 23.6, -1.6, 0.18, 0); top = 27.6;
    } else if (kind === 'anger') {   // 분노: 둥글고 다부진 숯덩이 몸, 짧은 다리·팔 토막, 지그재그 금
      box(11, 11, 8, 0, 12.5, 0); box(8.6, 5, 7, 0, 20.5, 0); box(5.6, 1.6, 5, 0, 23.8, 0);
      box(3.6, 5, 4, -2.7, 3.2, 0); box(3.6, 5, 4, 2.7, 3.2, 0); box(2, 5, 3.2, -6.4, 12.5, 0); box(2, 5, 3.2, 6.4, 12.5, 0);
      box(1.6, 1.2, 0.4, -1.8, 21, -3.7, eyeM); box(1.6, 1.2, 0.4, 1.8, 21, -3.7, eyeM);
      crackM = new THREE.MeshBasicMaterial({ color: 0x5a1a0a, fog: false });
      [[-2.8, 17, -4.15, 7, 1], [2.6, 17.5, -4.15, 7, -1], [-0.6, 9, -4.15, 3, 1], [3.2, 16, 4.15, 6, 1], [-5.65, 15, 0, 5, 1]].forEach(function (z) {   // [x, 위 y, 면 z, 마디 수, 방향]
        for (var i = 0; i < z[3]; i++) {
          var side = z[2] === 0, xo = z[0] + (side ? 0 : (i % 2 ? 0.7 : -0.7) * z[4]), zo = side ? (i % 2 ? 0.7 : -0.7) : z[2];
          box(side ? 0.4 : 0.6, 1.5, side ? 0.6 : 0.4, xo, z[1] - i * 1.25, zo, crackM);
        }
      });
      top = 25;
    } else {   // 큰 그림자: 넷의 기본 몸을 크게(윤곽선)
      box(8.4, 13, 4.4, 0, 18, 0); box(7, 8, 3.6, 0, 7, 0); box(3, 9, 3, -6, 19, 0); box(3, 9, 3, 6, 19, 0);
      headAt(0, 28.5, 0, 0, 0);
    }
    var tag = textSprite(sp.name, 'rgba(0,0,0,0.55)', '#' + sp.eye.toString(16).padStart(6, '0'), 0.55); tag.position.y = top * u + 0.6; root.add(tag);
    var y = groundAt(x, z, SY - 3); if (y === null) y = P.y;
    root.position.set(x, y, z); scene.add(root);
    return { kind: kind, sp: sp, mesh: root, tag: tag, crack: crackM, fuse: 0, x: x, y: y, z: z, hp: sp.hp, hitT: 0, t: Math.random() * 6, fade: 0, dead: false };
  }
  function litNear(x, y, z, r) {
    for (var dz = -1; dz <= 1; dz++) for (var dx = -1; dx <= 1; dx++) {
      var c = colAt(x + dx * CS, z + dz * CS); if (!c) continue;
      for (var i = 0; i < c.lamps.length; i++) { var l = c.lamps[i]; if (Math.abs(l[0] - x) <= r && Math.abs(l[2] - z) <= r && Math.abs(l[1] - y) <= r) return true; }
    }
    return false;
  }
  // ── 안전한 집(11/20): 내 땅 둘레 칸이 모두 내 땅 안 불빛(횃불·등) 6칸 안이면 「🏠 안전한 집」 — 둘레 10칸까지 그림자가 나오지 않음 ──
  var homeSafe = false, homeTold = false, wasNight = false, nightTold = -1;
  function checkHome() {
    if (myPlot < 0) { homeSafe = false; return; }
    var o = plotOrigin(myPlot), lamps = [];
    for (var cz = o.z >> 5; cz <= (o.z + PLOT) >> 5; cz++) for (var cx = o.x >> 5; cx <= (o.x + PLOT) >> 5; cx++) {
      var c = COLS[cz * NC + cx]; if (!c) { return; }   // 아직 안 불러온 땅이면 그대로
      c.lamps.forEach(function (l) { if (l[0] >= o.x && l[0] < o.x + PLOT && l[2] >= o.z && l[2] < o.z + PLOT) lamps.push(l); });
    }
    var ok = lamps.length > 0;
    for (var i = 0; i < PLOT && ok; i++) {
      [[o.x + i, o.z], [o.x + i, o.z + PLOT - 1], [o.x, o.z + i], [o.x + PLOT - 1, o.z + i]].forEach(function (q) {
        if (ok && !lamps.some(function (l) { return Math.abs(l[0] - q[0]) <= 6 && Math.abs(l[2] - q[1]) <= 6; })) ok = false;
      });
    }
    if (ok && !homeSafe && started) {
      if (!S.homeTold) { S.homeTold = 1; saveSettings(); showVerseCard('🏠', '안전한 집', '주의 말씀은 내 발에 등이요 내 길에 빛이니이다', '시편 119:105', '내 땅 둘레를 모두 밝혔어요 — 밤에도 그림자가 집 가까이 오지 못해요'); }
      else toast('🏠 안전한 집이 됐어요 — 둘레가 밝아요');
    } else if (!ok && homeSafe && started) toast('🏠 집 둘레에 어두운 곳이 생겼어요 — 횃불을 더 밝혀요');
    homeSafe = ok;
    var night = isNight(), dayN = Math.floor(dayT / DAY_LEN);
    if (night && !wasNight && started && ui === 'play' && !homeSafe && nightTold !== dayN && shadowsOn()) { nightTold = dayN; toast('🌙 밤이 와요 — 내 땅 둘레에 횃불을 6칸마다 밝히면 「🏠 안전한 집」이 돼요'); }
    wasNight = night;
  }
  function nearSafeHome(x, z) { if (!homeSafe || myPlot < 0) return false; var o = plotOrigin(myPlot); return x >= o.x - 10 && x < o.x + PLOT + 10 && z >= o.z - 10 && z < o.z + PLOT + 10; }
  // 11/21: 밤에는 마을 마당·방주 둘레·명소 둘레에도 그림자가 나와요 — 방주 안·명소 안·성읍 성벽 안·땅(내 땅·공동 터)은 그대로 안전
  function safeZone(x, z) { return nearSafeHome(x, z) || inCommons(x, z) || plotAt(x, z) >= 0 || inArk(x, G + 2, z) || cityInside(x, z) || !!landmarkAt(x, z, 0); }
  // 11/21: 그림자가 걸어 들어가면 사라지는 곳 — 안전한 집 둘레·방주 안·성읍 성벽 안·명소 안(땅과 공동 터는 나오지는 않아도 걸어 들어올 수 있어요)
  function shadowBarred(x, z) { return nearSafeHome(x, z) || inArk(x, G + 2, z) || cityInside(x, z) || !!landmarkAt(x, z, 0); }
  function roofOver(x, y, z) { for (var yy = y + 2; yy <= y + 9; yy++) { var b = get(x, yy, z); if (b !== AIR && b !== LEAF && isSolid(b)) return true; } return false; }   // 지붕·천장 밑(나뭇잎은 빼고)
  function removeShadow(s) {
    var materials = new Set();
    s.mesh.traverse(function (o) {
      if (o.isSprite) return;
      if (o.geometry) o.geometry.dispose();
      if (o.material && o.material !== shadowMat) materials.add(o.material);
    });
    s.mesh.children.slice().forEach(function (o) { if (o.isSprite) disposeSprite(o); });
    materials.forEach(function (m) { m.dispose(); });
    scene.remove(s.mesh);
  }
  function stepShadows(dt) {
    var now = performance.now();
    stepArrows(dt);
    if (!shadowsOn() || !started) { if (SHADOWS.length) { SHADOWS.forEach(removeShadow); SHADOWS = []; } clearFireArrows(); return; }
    var px = Math.floor(P.x), pz = Math.floor(P.z), cave = skyLight(px, Math.floor(P.y + 1), pz) < 0.3, dark = cave || isNight();
    // 나타나기
    shadowT -= dt;
    if (shadowT <= 0) {
      var inDun = inDungeon(px, Math.floor(P.y), pz);   // 골짜기: 더 자주, 더 많이, 큰 그림자도
      shadowT = inDun ? 1.5 + Math.random() * 2 : 4 + Math.random() * 5;
      if ((dark || inDun) && ui === 'play' && SHADOWS.length < (inDun ? 8 : 4) && !safeZone(px, pz) && !riding && !(inTown(px, pz) && tutorialStep < 9)) {
        var ang = Math.random() * Math.PI * 2, d = inDun ? 8 + Math.random() * 10 : 14 + Math.random() * 8, sx = P.x + Math.cos(ang) * d, sz = P.z + Math.sin(ang) * d;
        if (inDun) {   // 미로: 가까운 칸(2~3칸 떨어진) 한가운데에서
          var ci = Math.floor((P.x - DUN.x0) / DUN.cs) + (Math.random() < 0.5 ? -1 : 1) * (2 + (Math.random() * 2 | 0)), cj = Math.floor((P.z - DUN.z0) / DUN.cs) + ((Math.random() * 5 | 0) - 2);
          ci = Math.max(0, Math.min(DUN.n - 1, ci)); cj = Math.max(0, Math.min(DUN.n - 1, cj));
          sx = DUN.x0 + ci * DUN.cs + 2.5; sz = DUN.z0 + cj * DUN.cs + 2.5;
        }
        var gy = cave || inDun ? null : groundAt(sx, sz, SY - 3);
        if (cave || inDun) { for (var yy = Math.floor(P.y) + 3; yy > Math.floor(P.y) - 6; yy--) if (!isSolid(get(Math.floor(sx), yy, Math.floor(sz))) && !isSolid(get(Math.floor(sx), yy + 1, Math.floor(sz))) && isSolid(get(Math.floor(sx), yy - 1, Math.floor(sz)))) { gy = yy; break; } }
        var onRoof = gy !== null && !cave && !inDun && !(isSolid(get(Math.floor(sx), gy - 2, Math.floor(sz))) && isSolid(get(Math.floor(sx), gy - 3, Math.floor(sz))));   // 집 지붕 위(아래가 빈 방)는 빼요
        if (gy !== null && !onRoof && !safeZone(Math.floor(sx), Math.floor(sz)) && !litNear(Math.floor(sx), gy, Math.floor(sz), 7) && get(Math.floor(sx), gy, Math.floor(sz)) !== WATER) {
          var keys2 = Object.keys(SH_KINDS).filter(function (k) { return k !== 'great'; }), kk = inDun && Math.random() < 0.4 ? 'great' : keys2[Math.random() * keys2.length | 0];
          var s = makeShadow(kk, sx, sz); s.y = gy; s.mesh.position.y = gy; SHADOWS.push(s);
          if (!shadowTold) { shadowTold = true; toast('어둠 속에 그림자가 있어요 — 횃불을 들거나, 칼·성령의 검으로 물리쳐요(엡 6:17). 불빛 곁·방주 안·명소 안은 안전해요'); }
        }
      }
    }
    var torch = (HOTBAR[sel] === TORCH && have(TORCH) > 0) || litNear(px, Math.floor(P.y), pz, 6);
    SHADOWS.forEach(function (s) {
      s.t += dt;
      var dx = P.x - s.x, dz = P.z - s.z, dist = Math.hypot(dx, dz) || 0.01;
      var sun = !cave && !inDungeon(Math.floor(s.x), Math.floor(s.y), Math.floor(s.z)) && !isNight() && skyLight(Math.floor(s.x), Math.floor(s.y) + 1, Math.floor(s.z)) > 0.6;
      if (s.dead || sun || dist > 44 || shadowBarred(Math.floor(s.x), Math.floor(s.z))) { s.fade += dt * 1.5; }
      else if (!s.dead && s.sp.fuse && get(Math.floor(s.x), Math.floor(s.y), Math.floor(s.z)) === WATER) {   // 분노가 물에 닿으면 꺼짐
        s.dead = true; s.fade = 0.5; sparkle(s.x, s.y + 1, s.z, 0xe8eef2, 18, { size: 0.45, life: 1.2, up: 2, v: 1.2 }); tone('sine', 900, 300, 0.4, 0.04);
        if (!S.angerWaterTold) { S.angerWaterTold = 1; saveSettings(); showVerseCard('💧', '분노가 꺼졌어요', '유순한 대답은 분노를 쉬게 하여도 과격한 말은 노를 격동하느니라', '잠언 15:1', '「분노」 그림자는 물에 닿으면 터지지 않고 꺼져요'); }
      }
      else if (!s.dead) {
        var want = s.sp.ranged ? (torch ? 11 : 9) : (torch ? 6 : 1.2), mv = 0;
        if (dist > want + 0.3) mv = s.sp.speed * dt; else if ((torch || s.sp.ranged) && dist < want - 0.5) mv = -s.sp.speed * 0.6 * dt;
        if (s.sp.ranged) { s.fireT = (s.fireT === undefined ? 1.5 + Math.random() : s.fireT) - dt; if (s.fireT <= 0 && dist < 20 && Math.abs(P.y - s.y) < 6) { s.fireT = 2.8 + Math.random() * 1.2; shootFireArrow(s); } }
        if (s.sp.blink && dist > 6 && Math.random() < dt * 0.25) mv = Math.min(dist - 3, 4);   // 거짓: 갑자기 가까이
        if (mv && !(s.wind > 0) && !(s.sp.fuse && Math.abs(s.kx || 0) + Math.abs(s.kz || 0) > 1)) {   // 분노는 밀려나는 동안 다가오지 않음
          var nx = s.x + dx / dist * mv, nz = s.z + dz / dist * mv, ny = groundAt(nx, nz, s.y + 2);
          var intoHouse = ny !== null && (plotAt(Math.floor(nx), Math.floor(nz)) >= 0 || inTown(nx, nz) || inCommons(nx, nz)) && roofOver(Math.floor(nx), ny, Math.floor(nz)) && !roofOver(Math.floor(s.x), Math.floor(s.y), Math.floor(s.z));   // 땅·마을에서 바깥 → 지붕 밑(집 안)으로는 안 들어감(동굴 입구는 그대로 따라감)
          if (ny !== null && !intoHouse && Math.abs(ny - s.y) <= 1.6 && !litNear(Math.floor(nx), ny, Math.floor(nz), 4)) { s.x = nx; s.z = nz; s.y = ny; }
        }
        if (s.sp.fuse) {   // 분노: 2.4칸 안이면 1.5초 동안 부풀다 터짐, 멀어지면 다시 식음
          if (dist < 2.4 && Math.abs(P.y - s.y) < 2.5) { if (!s.fuse) tone('sawtooth', 70, 150, 1.4, 0.05); s.fuse += dt; }
          else if (s.fuse > 0) s.fuse = Math.max(0, s.fuse - dt * 1.2);
          if (s.fuse >= 1.5) angerBurst(s);
        }
        if (!s.sp.ranged && !s.sp.fuse && !(s.wind > 0) && dist < 1.9 && Math.abs(P.y - s.y) < 2.5 && now - s.hitT > 1200) { s.wind = 0.45; s.hitT = now; }
        if (s.wind > 0 && (s.wind -= dt) <= 0) {   // 공격 신호(몸을 젖힘) 0.45초 뒤에 덮침 — 그 사이 물러서면 피함
          s.wind = 0; s.hitT = now; s.lunge = 1;
          if (dist < 2.3 && Math.abs(P.y - s.y) < 2.5) { var g = armorGuard(), dmg = Math.round(s.sp.dmg * (1 - g));
          if (dmg > 0) hurtFaith(dmg, '「' + s.sp.name + '」'); else if (vitalsOn()) toast('🛡 하나님의 전신 갑주가 막아 주었어요 (엡 6:11)');
          P.vx += dx / dist * 6; P.vz += dz / dist * 6; }
          else floatText(P.x, P.y + HT + 0.3, P.z, '피했어요!', '#bfe8ff', 0.5, 0.8);
        }
      }
      shadowFxStep(s, dt);
      if (s.crack) { var ff = Math.min(1, s.fuse / 1.5); s.mesh.scale.setScalar(1 + ff * 0.3 + (ff > 0.6 ? Math.sin(s.t * 40) * 0.03 : 0)); s.crack.color.setRGB(0.4 + 0.6 * ff, 0.06 + 0.4 * ff, 0.02 + 0.08 * ff); }
      s.mesh.position.set(s.x, s.y + Math.sin(s.t * 2) * 0.12, s.z);
      s.mesh.rotation.y = Math.atan2(-dx, -dz);
      var op = Math.max(0, 0.78 * (1 - s.fade)) * (0.85 + Math.sin(s.t * 5) * 0.15);
      s.mesh.children.forEach(function (m) { if (m.material && m.material !== shadowMat) m.material.opacity = 1 - s.fade; });
      s.op = op;
    });
    tidyShadowTags();
    if (SHADOWS.length) shadowMat.opacity = Math.max(0.15, Math.min.apply(null, SHADOWS.map(function (s) { return s.op; })));
    SHADOWS = SHADOWS.filter(function (s) { if (s.fade >= 1) { removeShadow(s); return false; } return true; });
  }
  // ── 11/21 분노가 터짐: 3.6칸 안은 다치고 밀려남, 자연 땅(흙·돌·모래·눈·진흙)만 둥글게 파이고 하루(게임 속 하루) 뒤 메워짐 ──
  var CRATERS = [], CRATER_OK = {}; [GRASS, DIRT, STONE, SAND, SNOW, CLAY].forEach(function (id) { CRATER_OK[id] = 1; });
  function editedCell(x, y, z) { var e = EDITS[(z >> 5) * NC + (x >> 5)]; return !!(e && e[(y * CS + (z & 31)) * CS + (x & 31)] !== undefined); }
  function rebuildCells(cells) { var seen = {}; cells.forEach(function (c) { var k = (c[0] >> 5) + ',' + (c[1] >> 5) + ',' + (c[2] >> 5); if (seen[k]) return; seen[k] = 1; rebuildAround(c[0], c[1], c[2]); }); }
  function angerCrater(x0, y0, z0) {
    if (!wildSpot(x0, z0) || safeZone(x0, z0)) return 0;
    var cells = [];
    for (var dy = -3; dy <= 1; dy++) for (var dz = -3; dz <= 3; dz++) for (var dx = -3; dx <= 3; dx++) {
      if (dx * dx + dy * dy * 1.4 + dz * dz > 2.3 * 2.3) continue;
      var x = x0 + dx, y = y0 + dy, z = z0 + dz, id = get(x, y, z);
      if (!CRATER_OK[id] || !wildSpot(x, z) || safeZone(x, z) || editedCell(x, y, z) || get(x, y + 1, z) === WATER) continue;
      cells.push([x, y, z, id]); setRaw(x, y, z, AIR);
    }
    if (!cells.length) return 0;
    cells.forEach(function (c) { updateSky(c[0], c[2]); }); rebuildCells(cells);
    CRATERS.push({ cells: cells, at: dayT + DAY_LEN });
    return cells.length;
  }
  function craterTick() {   // 1초마다: 하루 지난 구덩이를 메움(그 사이 누가 놓은 블록·고친 칸은 그대로)
    if (!CRATERS.length) return;
    CRATERS = CRATERS.filter(function (cr) {
      if (dayT < cr.at) return true;
      var back = [];
      cr.cells.forEach(function (c) { if (get(c[0], c[1], c[2]) !== AIR || editedCell(c[0], c[1], c[2])) return; setRaw(c[0], c[1], c[2], c[3]); updateSky(c[0], c[2]); back.push(c); });
      if (back.length) { rebuildCells(back); if (collides(P.x, P.y, P.z)) { var gy = groundAt(P.x, P.z, P.y + 5); if (gy !== null) P.y = gy; } }
      return false;
    });
  }
  function angerBurst(s) {
    if (s.dead) return;
    s.dead = true; s.fade = 0.75;
    var cx = s.x, cy = s.y, cz = s.z, d = Math.hypot(P.x - cx, P.z - cz) || 0.01;
    sparkle(cx, cy + 1, cz, 0xff7a2a, 30, { size: 0.5, life: 0.9, v: 5, up: 2 });
    sparkle(cx, cy + 0.6, cz, 0x6a5a50, 22, { size: 0.6, life: 1.3, v: 3, up: 1.4, g: 3 });
    tone('sawtooth', 180, 40, 0.6, 0.12); tone('square', 90, 30, 0.5, 0.08); vibrate('break');
    if (d < 3.6 && Math.abs(P.y - cy) < 3) {
      var g = armorGuard(), dmg = Math.round(s.sp.dmg * (1 - d / 3.6 * 0.5) * (1 - g));
      if (dmg > 0) hurtFaith(dmg, '「분노」'); else if (vitalsOn()) toast('🛡 하나님의 전신 갑주가 막아 주었어요 (엡 6:11)');
      P.vx += (P.x - cx) / d * 9; P.vz += (P.z - cz) / d * 9; P.vy = Math.max(P.vy, 6);
    }
    SHADOWS.forEach(function (o) { if (o === s || o.dead) return; var od = Math.hypot(o.x - cx, o.z - cz) || 0.01; if (od < 3.6) { o.kx = (o.x - cx) / od * 10; o.kz = (o.z - cz) / od * 10; } });
    var n = angerCrater(Math.floor(cx), Math.floor(cy), Math.floor(cz));
    if (!S.angerTold) { S.angerTold = 1; saveSettings(); setTimeout(function () { showVerseCard('🔥', '분노', '분을 내어도 죄를 짓지 말며 해가 지도록 분을 품지 말고', '에베소서 4:26', '「분노」 그림자가 터졌어요 — 다가오면 부풀어요. 칼로 치면 밀려나며 식고, 활·물매로 멀리서 물리치면 터지지 않아요. 물에 닿으면 꺼져요.' + (n ? ' 파인 땅은 하루 뒤 메워져요' : '')); }, 700); }
  }
  // ── 11/21 짐승 잡기: 치면 밀려나 달아나고, 다 잡으면 고기·털·가죽이 무작위로(창 9:3). 말·나귀·낙타는 고기 대신 가죽(레 11:4) ──
  var BEAST_HP = { sheep: 4, goat: 4, rabbit: 2, cow: 7, horse: 7, donkey: 6, camel: 8, pig: 5, chicken: 2 };
  // 11/21 나오는 것은 하나하나 확률로: [물건, 나올 확률, 최소, 최대] — 아무것도 안 나올 수도 있음(새끼는 확률 0.6배·개수 절반)
  var BEAST_DROP = {
    sheep: [[RAW_LAMB, 0.8, 1, 2], [WOOL, 0.6, 1, 2], [BONE, 0.3, 1, 1]], goat: [[RAW_GOAT, 0.8, 1, 2], [LEATHER, 0.5, 1, 1], [BONE, 0.3, 1, 1]],
    cow: [[RAW_BEEF, 0.85, 1, 3], [LEATHER, 0.6, 1, 2], [BONE, 0.35, 1, 2]], pig: [[LEATHER, 0.7, 1, 2], [BONE, 0.35, 1, 1]],
    chicken: [[RAW_CHICKEN, 0.75, 1, 1], [FEATHER, 0.6, 1, 2], [BONE, 0.2, 1, 1]], rabbit: [[LEATHER, 0.5, 1, 1], [BONE, 0.2, 1, 1]],
    horse: [[LEATHER, 0.75, 1, 2], [BONE, 0.4, 1, 2]], donkey: [[LEATHER, 0.75, 1, 2], [BONE, 0.4, 1, 2]], camel: [[LEATHER, 0.75, 1, 2], [WOOL, 0.35, 1, 1], [BONE, 0.4, 1, 2]] };
  function beastGuarded(a) {   // 잡을 수 없는 짐승: 안장 얹은 것·내 우리에 기르는 것·새끼·놀이·이야기의 양·타고 있는 것
    if (a === riding || a.saddled || a.kept || a.herd || a === lostSheep) return a.saddled ? '안장을 얹은 짐승은 잡을 수 없어요' : '기르는 짐승은 잡을 수 없어요';   // 11/21 새끼도 잡을 수 있음
    return '';
  }
  function hitAnimal(a, quiet) {
    if (!BEAST_HP[a.kind]) return false;
    var why = beastGuarded(a); if (why) { if (!quiet) deny(why); return !quiet; }
    var held = HOTBAR[sel], dmg = 1;
    if (held === SWORD && have(SWORD) > 0) dmg = 4;
    else if (isArmSword(held) && have(held) > 0) dmg = ARM_SWORD_DMG[armOf(held, ARM_SWORD0)];
    else if (isTool(held) && have(held) > 0 && TOOL_TYPES[typeOf(held)] === 'knife') dmg = 1.5 + tierOf(held) * 0.5;
    else if (isTool(held) && have(held) > 0) dmg = 1.5;
    var crit = !P.ground && P.vy < -1 && !P.swim && !P.fly; if (crit) dmg *= 1.5;
    if (a.hp === undefined) a.hp = a.baby ? Math.ceil(BEAST_HP[a.kind] / 2) : BEAST_HP[a.kind];   // 새끼는 체력 절반
    a.hp -= dmg; swingT = 0.25; sfx('dig', 300); animalCall(a.kind);
    if (isTool(held)) wearTool(held);
    var top = a.y + (CR_R[a.kind] || 1.2) * 1.8, n = Math.round(dmg * 10) / 10;
    floatText(a.x, top, a.z, (crit ? '✦ ' : '') + n, crit ? '#ffd23a' : '#ffffff', crit ? 0.8 : 0.6, 0.6);
    sparkle(a.x, a.y + 1, a.z, 0xfff0c0, 3, { size: 0.3, life: 0.4, v: 2, up: 0.8 });
    var dx = a.x - P.x, dz = a.z - P.z, d = Math.hypot(dx, dz) || 1;
    for (var k = 4; k >= 1; k--) { var nx = a.x + dx / d * k * 0.3, nz = a.z + dz / d * k * 0.3, gy = groundAt(nx, nz, a.y); if (gy !== null && Math.abs(gy - a.y) <= 1.2) { a.x = nx; a.z = nz; a.ty = gy; break; } }   // 밀려남
    a.h = Math.atan2(dx, dz) + Math.PI; a.mode = 'walk'; a.t = 3; a.fleeUntil = performance.now() + 3500;   // 반대쪽으로 달아남
    if (a.hp > 0) return true;
    scene.remove(a.mesh); var ai = animals.indexOf(a); if (ai >= 0) animals.splice(ai, 1);
    sparkle(a.x, a.y + 1, a.z, 0xe8e0d0, 16, { size: 0.45, life: 0.9, v: 2.6, up: 1.4 }); sfx('pop', 400);
    var got = [];
    (BEAST_DROP[a.kind] || []).forEach(function (q) { if (Math.random() >= q[1] * (a.baby ? 0.6 : 1)) return; var hi = a.baby ? Math.max(1, Math.ceil(q[3] / 2)) : q[3], c = q[2] + Math.floor(Math.random() * (hi - q[2] + 1)); if (c > 0) { dropItem(a.x, a.y + 0.8, a.z, q[0], c); got.push(B[q[0]][0] + ' ' + c); } });
    if (!S.huntTold) { S.huntTold = 1; saveSettings(); showVerseCard('🍖', '먹을 것', '모든 산 동물은 너희의 먹을 것이 될지라 채소 같이 내가 이것을 다 너희에게 주노라', '창세기 9:3', '고기는 모닥불(돌 3 + 통나무 2)이나 화덕과 솥 가까이에서 석탄·숯·통나무를 땔감으로 구워 먹어요 — 가까이 가서 주워요'); }
    else toast((got.length ? got.join(' · ') : '아무것도 나오지 않았어요') + ' — 가까이 가서 주워요');
    if (a.kind === 'pig' && !S.pigTold) { S.pigTold = 1; saveSettings(); setTimeout(function () { showVerseCard('🐖', '먹지 못할 것', '돼지는 굽이 갈라져 쪽발이로되 새김질을 못하므로 너희에게 부정하니', '레위기 11:7', '돼지는 고기 대신 가죽이 나와요'); }, 600); }
    if ((a.kind === 'camel' || a.kind === 'horse' || a.kind === 'donkey') && !S.uncleanTold) { S.uncleanTold = 1; saveSettings(); setTimeout(function () { showVerseCard('🐪', '먹지 못할 것', '새김질하는 것이나 굽이 갈라진 짐승 중에도 너희가 먹지 못할 것은 이러하니 낙타는 새김질은 하되 굽이 갈라지지 아니하였으므로 너희에게 부정하고', '레위기 11:4', '말·나귀·낙타는 고기 대신 가죽이 나와요'); }, 600); }
    return true;
  }
  function hitShadow(s, arrowDmg, sweep) {
    if (s.dead) return;
    var held = arrowDmg ? 0 : HOTBAR[sel], dmg = 1;
    if (arrowDmg) dmg = arrowDmg;
    else if (held === SWORD && have(SWORD) > 0) dmg = 4;
    else if (isArmSword(held) && have(held) > 0) dmg = ARM_SWORD_DMG[armOf(held, ARM_SWORD0)];
    if (isArmSword(held)) newsMark('arms');
    else if (isTool(held) && have(held) > 0 && TOOL_TYPES[typeOf(held)] === 'knife') dmg = 1.5 + tierOf(held) * 0.5;
    if (has('jericho')) dmg += 1;
    var crit = !arrowDmg && !P.ground && P.vy < -1 && !P.swim && !P.fly;   // 떨어지면서 치면 강한 일격
    if (crit) dmg *= 1.5;
    if (s.wind > 0 && !arrowDmg) { s.wind = 0; s.hitT = performance.now(); }   // 덮치려던 순간에 맞으면 멈칫
    s.hp -= dmg; if (!sweep) { swingT = 0.25; sfx('dig', 300); }
    combatFx(s, dmg, crit);
    var dx = s.x - P.x, dz = s.z - P.z, d = Math.hypot(dx, dz) || 1, kb = crit ? 11 : (arrowDmg ? 4 : 8); s.kx = dx / d * kb; s.kz = dz / d * kb;   // 밀려남
    if (s.sp.fuse) { s.fuse = 0; s.kx *= 2; s.kz *= 2; }   // 분노: 맞으면 크게 밀려나며 식음(다시 다가와 부풂)
    if ((held === SWORD || isArmSword(held)) && !arrowDmg && have(held) > 0) sweepHit(s);
    if (isTool(held)) wearTool(held);
    if (s.hp <= 0) {
      s.dead = true; burst(Math.floor(s.x), Math.floor(s.y) + 1, Math.floor(s.z), LAMP); sfx('craft', 1800); shadowDeathFx(s); questEvent('shadow', s.kind, 1);
      dropItem(s.x, s.y + 1, s.z, SHARD, s.kind === 'great' ? 3 : 1);   // 빛 조각 — 횃불·등롱 재료
      if (!S.shardTold) { S.shardTold = 1; saveSettings(); setTimeout(function () { showVerseCard('✨', '빛 조각', '빛이 어둠에 비치되 어둠이 깨닫지 못하더라', '요한복음 1:5', '그림자를 물리친 자리에 빛 조각이 남았어요 — 주워서 횃불·등롱을 만들어요'); }, ACH.shadow ? 300 : 9500); }
      if (!ACH.shadow) { $('cardEmoji').textContent = '⚔'; $('cardName').textContent = '성령의 검'; $('cardText').textContent = '구원의 투구와 성령의 검 곧 하나님의 말씀을 가지라'; $('cardRef').textContent = '에베소서 6:17'; $('cardNew').textContent = '어둠의 그림자 「' + s.sp.name + '」을(를) 물리쳤어요'; $('card').classList.add('show'); clearTimeout(cardT); cardT = setTimeout(function () { $('card').classList.remove('show'); }, 9000); }
      unlock('shadow'); nightNote('shadow');
      partyAdd('shadows', 1);
      if (STORY.started) { STORY.s.shadows++; if (isNight()) STORY.s.night++; saveStory(); }
    }
    bagChanged();
  }
  // ── 화살(내가 쏨)·불화살(의심이 쏨) ──
  var shieldToldT = 0;
  var ARROWS = [], FIRES = [], bowAt = 0, arrowGeo = null, arrowMat = null, fireMat = null;
  function arrowMesh(fire) {
    if (!arrowGeo) { arrowGeo = new THREE.BoxGeometry(0.06, 0.06, 0.7); arrowMat = new THREE.MeshBasicMaterial({ color: 0x8a5a2b }); fireMat = new THREE.MeshBasicMaterial({ color: 0xff7a1e, fog: false }); }
    var m = new THREE.Mesh(arrowGeo, fire ? fireMat : arrowMat); if (fire) m.scale.set(2.2, 2.2, 1); scene.add(m); return m;
  }
  var bowDraw = null, bowUiT = 0;
  function bowStart() {
    if (!isBowId(HOTBAR[sel]) || have(HOTBAR[sel]) < 1) return false;
    if (!isAdm() && !bestArrow()) { deny('화살이 없어요 — 막대기 1 + 부싯돌이나 돌·광물 1로 화살 4개를 만들어요'); return true; }
    bowDraw = { t0: performance.now() }; $('bowBar').classList.add('show'); tone('triangle', 140, 220, 0.5, 0.03);
    clearInterval(bowUiT); bowUiT = setInterval(function () { if (!bowDraw) return; var p = Math.min(1, (performance.now() - bowDraw.t0) / 1000); $('bowFill').style.width = Math.round(p * 100) + '%'; $('bowBar').classList.toggle('full', p >= 1); }, 40);
    return true;
  }
  function bowRelease(dir) {
    if (!bowDraw) return false;
    var p = Math.max(0.15, Math.min(1, (performance.now() - bowDraw.t0) / 1000));
    bowDraw = null; clearInterval(bowUiT); $('bowBar').classList.remove('show', 'full'); $('bowFill').style.width = '0%';
    if (isBowId(HOTBAR[sel])) { bowAt = 0; shootArrow(dir || screenDir(), p); }
    return true;
  }
  function bowCancel() { if (bowDraw) { bowDraw = null; clearInterval(bowUiT); $('bowBar').classList.remove('show', 'full'); } }
  function shootArrow(dir, pow) {
    pow = pow || 0.35;
    var now = performance.now(); if (now < bowAt) return;
    var aid = bestArrow() || (isAdm() ? ARROW : 0);
    if (!aid) return deny('화살이 없어요 — 막대기 1 + 부싯돌이나 돌·광물 1로 화살 4개를 만들어요');
    bowAt = now + 250; if (!isAdm()) { take(aid, 1); bagChanged(); } newsMark('bow');
    var bm = armOf(HOTBAR[sel], ARM_BOW0), am = armOf(aid, ARM_ARROW0), base = am >= 0 ? ARM_ARROW_DMG[am] : 1, bonus = bm >= 0 ? ARM_BOW_BONUS[bm] : 0;   // 화살촉 재료 + 활 재료 + 당긴 힘
    var p = camera.position, v = 12 + 24 * pow * (1 + (bm >= 0 ? bm : 0) * 0.05);
    ARROWS.push({ x: p.x + dir.x * 0.6, y: p.y + dir.y * 0.6 - 0.1, z: p.z + dir.z * 0.6, vx: dir.x * v, vy: dir.y * v + 1.5, vz: dir.z * v, t: 0, dmg: Math.round((base + bonus + 2.5 * pow) * 10) / 10, item: aid, mesh: arrowMesh(false) });
    tone('triangle', 260 + 160 * pow, 150, 0.12, 0.06 + 0.06 * pow); swingT = 0.25; vibrate('bow');
  }
  function bestArrow() { for (var m = 6; m >= 0; m--) if (have(ARM_ARROW0 + m) > 0) return ARM_ARROW0 + m; return have(ARROW) > 0 ? ARROW : 0; }   // 가장 좋은 화살부터
  // 물매: 매끄러운 돌을 던져 멀리 있는 그림자를 맞힘(삼상 17:49) — 물매 재료에 따라 세기가 다름
  var slingStoneGeo = null, slingStoneMat = null;
  function slingThrow(dir) {
    var now = performance.now(); if (now < slingAt) return;
    if (!isAdm() && have(ROUND_STONE) < 1) return deny('매끄러운 돌이 없어요 — 돌 1개로 매끄러운 돌 4개를 만들어요');
    slingAt = now + 650; if (!isAdm()) { take(ROUND_STONE, 1); bagChanged(); }
    var m = armOf(HOTBAR[sel], ARM_SLING0), dmg = m >= 0 ? ARM_SLING_DMG[m] : 1.5, p = camera.position, v = 24;
    if (!slingStoneGeo) { slingStoneGeo = new THREE.BoxGeometry(0.18, 0.18, 0.18); slingStoneMat = new THREE.MeshBasicMaterial({ color: 0xa4adad }); }
    var mesh = new THREE.Mesh(slingStoneGeo, slingStoneMat); scene.add(mesh);
    ARROWS.push({ x: p.x + dir.x * 0.6, y: p.y + dir.y * 0.6, z: p.z + dir.z * 0.6, vx: dir.x * v, vy: dir.y * v + 1, vz: dir.z * v, t: 0, dmg: dmg, item: ROUND_STONE, mesh: mesh });
    tone('triangle', 520, 200, 0.12, 0.05); swingT = 0.25;
  }
  function shootFireArrow(s) {
    var tx = P.x - s.x, ty = P.y + 1.1 - (s.y + 1.5 * s.sp.h), tz = P.z - s.z, d = Math.hypot(tx, ty, tz) || 1, v = 13;
    FIRES.push({ x: s.x, y: s.y + 1.5 * s.sp.h, z: s.z, vx: tx / d * v, vy: ty / d * v, vz: tz / d * v, t: 0, who: s.sp.name, dmg: s.sp.dmg, mesh: arrowMesh(true) });
    tone('sawtooth', 900, 300, 0.25, 0.04);
  }
  function clearFireArrows() { FIRES.forEach(function (a) { scene.remove(a.mesh); }); FIRES = []; }
  function stepArrows(dt) {
    var live = [];
    ARROWS.forEach(function (a) {
      var gone = false;
      for (var k = 0; k < 3 && !gone; k++) {
        var st = dt / 3; a.vy -= 12 * st; a.x += a.vx * st; a.y += a.vy * st; a.z += a.vz * st; a.t += st;
        var bid = get(Math.floor(a.x), Math.floor(a.y), Math.floor(a.z));
        if (isSolid(bid) && !(SHAPE[bid] && collBoxes(bid, 0, 0, 0).length === 0)) { gone = true; if (Math.random() < 0.6 && !isAdm()) dropItem(a.x - a.vx * st, a.y - a.vy * st + 0.2, a.z - a.vz * st, a.item || ARROW, 1); sfx('dig', 900); break; }
        for (var i = 0; i < SHADOWS.length; i++) {
          var s = SHADOWS[i]; if (s.dead) continue;
          var hy = a.y - s.y; if (Math.hypot(a.x - s.x, a.z - s.z) < 0.8 && hy > 0 && hy < HT * s.sp.h + 0.2) { hitShadow(s, a.dmg || 3); gone = true; break; }
        }
      }
      if (gone || a.t > 4 || a.y < YMIN) { scene.remove(a.mesh); return; }
      a.mesh.position.set(a.x, a.y, a.z); a.mesh.lookAt(a.x + a.vx, a.y + a.vy, a.z + a.vz); live.push(a);
    });
    ARROWS = live;
    var liveF = [];
    FIRES.forEach(function (f) {
      var gone = false;
      for (var k = 0; k < 3 && !gone; k++) {
        var st = dt / 3; f.x += f.vx * st; f.y += f.vy * st; f.z += f.vz * st; f.t += st;
        if (isSolid(get(Math.floor(f.x), Math.floor(f.y), Math.floor(f.z)))) { gone = true; break; }
        if (Math.hypot(f.x - P.x, f.z - P.z) < 0.55 && f.y > P.y && f.y < P.y + HT + 0.1) {
          gone = true; var g = armorGuard(), dmg = Math.round(f.dmg * (1 - g)), sh = WORN.shield, fl = Math.hypot(f.vx, f.vz) || 1;
          var front = (-Math.sin(P.yaw)) * (-f.vx / fl) + (-Math.cos(P.yaw)) * (-f.vz / fl) > 0.3;
          var shBlock = armOf(sh, ARM_SHIELD0) >= 0 ? ARM_SHIELD_BLOCK[armOf(sh, ARM_SHIELD0)] : ({ 156: 0.5, 157: 0.75, 158: 1 }[sh] || 0);
          if (sh && front && Math.random() < shBlock) { newsMark('shield'); nightNote('block'); vibrate('block'); sfx('place', 'metal'); burst(Math.floor(f.x), Math.floor(f.y), Math.floor(f.z), LAMP); var nowB = performance.now(); if (nowB - shieldToldT > 5000) { shieldToldT = nowB; toast(sh === 158 ? '🛡 믿음의 방패로 불화살을 막았어요 (엡 6:16)' : '🛡 ' + nameOf(sh) + '로 불화살을 막았어요'); } break; }
          if (dmg > 0) hurtFaith(dmg, '「' + f.who + '」'); else if (vitalsOn()) toast('🛡 하나님의 전신 갑주가 불화살을 막아 주었어요 (엡 6:16)');
        }
      }
      if (gone || f.t > 3) { scene.remove(f.mesh); return; }
      f.mesh.position.set(f.x, f.y, f.z); f.mesh.lookAt(f.x + f.vx, f.y + f.vy, f.z + f.vz); f.mesh.rotation.z += f.t * 12; liveF.push(f);
    });
    FIRES = liveF;
  }
  // ── 배경 음악(코드로 만든 잔잔한 가락) — 메뉴에서 끌 수 있음 ──
  var musicT = 20;
  function stepMusic(dt) {
    if (!AC || !S.sound || S.music === false || !started) return;
    musicT -= dt; if (musicT > 0) return;
    musicT = 28 + Math.random() * 30;
    var night = skyState.dayF < 0.4, cave = caveK > 0.5, base = cave ? 196 : (night ? 220 : 262);
    var scale = night || cave ? [0, 3, 5, 7, 10, 12] : [0, 2, 4, 7, 9, 12], n = 5 + (Math.random() * 4 | 0), t0 = AC.currentTime + 0.1, deg = 2;
    for (var i = 0; i < n; i++) {
      deg = Math.max(0, Math.min(scale.length - 1, deg + [-1, 0, 1, 1, -1, 2][Math.random() * 6 | 0]));
      var f = base * Math.pow(2, scale[deg] / 12), at = t0 + i * (cave ? 1.1 : 0.75), dur = cave ? 1.6 : 1.1;
      try {
        var o = AC.createOscillator(), g = AC.createGain(); o.type = 'triangle'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(0.035, at + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        o.connect(g); g.connect(AC.destination); o.start(at); o.stop(at + dur + 0.05);
      } catch (e) {}
    }
  }
  // ── 다른 기기에서 이어 하기: 단축 칸·가방 칸·녹이는 것·안장 얹은 말·기른 동물·밭·체력·기운·침대·업적·처음 안내를 계정에 저장 ──
  var stateDirtyF = false, stateT = null, lastStateStr = '';
  function stateDirty() { stateDirtyF = true; }
  function stateGather() {
    var horses = []; try { horses = JSON.parse(localStorage.getItem('arkVillage.horses') || '[]'); } catch (e) {}
    return { v: 1, hot: HOTBAR, slots: BAGSLOT, jobs: JOBS, horses: horses, herd: HERD, crops: CROPS, saps: SAPS, hp: HP, food: FOOD, faith: FAITH, spawn: SPAWN, ach: ACH, noah: NOAH, quest: { stats: stats, step: qStep }, story: STORY, tutorial: tutorialStep, titles: { t: MYTITLE, got: GOTTITLES }, adv: ADV };
  }
  function stateApply(d) {
    if (!d || d.v !== 1) return;
    if (d.hot && d.hot.length === 9) HOTBAR = d.hot.map(function (v) { return INV.indexOf(v) >= 0 ? v : 0; });
    if (d.slots) BAGSLOT = d.slots.map(function (v) { return INV.indexOf(v) >= 0 ? v : 0; });
    if (d.jobs) { JOBS = d.jobs.filter(function (j) { return j && B[j.o] && j.n > 0; }); saveJobs(); }
    if (d.horses) { try { localStorage.setItem('arkVillage.horses', JSON.stringify(d.horses)); } catch (e) {} pendingHorses = d.horses.filter(function (o) { return o && BEASTS[o.k]; }).slice(0, 6); }
    if (d.herd) { HERD = d.herd; pendingHerd = HERD.slice(); }
    if (d.crops) CROPS = d.crops; if (d.saps) { SAPS = d.saps; saveSaps(); }
    if (typeof d.faith === 'number') FAITH = Math.max(1, Math.min(20, d.faith));
    if (typeof d.hp === 'number') HP = Math.max(1, Math.min(20, d.hp)); if (typeof d.food === 'number') FOOD = Math.max(0, Math.min(20, d.food));
    SPAWN = d.spawn || null; if (d.ach) ACH = d.ach;
    if (d.noah && typeof d.noah.step === 'number' && ((d.noah.done || 0) > (NOAH.done || 0) || d.noah.step > NOAH.step)) { NOAH = d.noah; try { localStorage.setItem('arkVillage.noah', JSON.stringify(NOAH)); } catch (e) {} }
    if (d.titles) { for (var tk in (d.titles.got || {})) if (TITLES[+tk]) GOTTITLES[tk] = d.titles.got[tk]; if (typeof d.titles.t === 'number' && (d.titles.t < 0 || GOTTITLES[d.titles.t])) MYTITLE = d.titles.t; try { localStorage.setItem('arkVillage.title', String(MYTITLE)); localStorage.setItem('arkVillage.titles', JSON.stringify(GOTTITLES)); } catch (e) {} }
    if (d.adv) advMerge(d.adv);
    if (d.story) { mergeStory(d.story); try { localStorage.setItem('arkVillage.story', JSON.stringify(STORY)); } catch (e) {} }
    if (Number.isInteger(d.tutorial) && d.tutorial >= 0 && d.tutorial <= 9) {
      tutorialStep = d.tutorial; tutorialWalk = tutorialLook = false; tutorialDoor = null;
      if (tutorialStep === 4 || tutorialStep === 5) { if (!me || myPlot < 0) tutorialStep = 6; }
      if (tutorialStep === 7 && (!me || !NET.ok)) tutorialStep = 8;
      tutorialSave();
    }
    if (d.quest) {
      stats = d.quest.stats || stats; qStep = d.quest.step || 0;
      if (!tutorialStored && qStep >= 4) { tutorialStep = 9; tutorialSave(); }
      questSave();
    }
    tutorialStartLog = stats.log || 0; tutorialStartCraft = stats.crafted || 0;
    if (started) renderQuest();
    saveSettings(); saveCrops();
    try { localStorage.setItem('arkVillage.ach', JSON.stringify(ACH)); localStorage.setItem('arkVillage.herd', JSON.stringify(HERD)); } catch (e) {}
  }
  function stateSave(force) {
    if (!started) return;
    var str = JSON.stringify(stateGather());
    if (!force && str === lastStateStr) { stateDirtyF = false; return; }
    lastStateStr = str; stateDirtyF = false;
    try { localStorage.setItem('arkVillage.state', str); } catch (e) {}
    if (client && me && NET.ok && str.length < 60000) {
      var base = null; try { base = localStorage.getItem('arkVillage.stateSrv'); } catch (e) {}
      // 다른 기기가 그 사이 더 새로 저장했으면 덮지 않고 그 기록을 불러옴
      client.rpc('save_ark_state2', { p_data: JSON.parse(str), p_base: base }).then(function (r) {
        var d = r && r.data; if (r.error || !d) return;
        if (d.conflict) { stateApply(d.data); lastStateStr = JSON.stringify(stateGather()); bagChanged(); renderVitals(); toast('📱 다른 기기에서 더 나중에 한 기록을 불러왔어요'); }
        try { localStorage.setItem('arkVillage.stateSrv', d.at); localStorage.setItem('arkVillage.state', d.conflict ? JSON.stringify(d.data) : str); } catch (e) {}
      }, function () {});
    }
  }
  setInterval(function () { stateSave(false); }, 8000);
  document.addEventListener('visibilitychange', function () { if (document.hidden) stateSave(false); });
  try { var hv = JSON.parse(localStorage.getItem('arkVillage.state') || 'null'); if (hv) { if (typeof hv.hp === 'number') HP = hv.hp; if (typeof hv.food === 'number') FOOD = hv.food; SPAWN = hv.spawn || null; } } catch (e) {}
  function loadState() {
    if (!client || !me || !NET.ok) return Promise.resolve();
    return client.rpc('get_ark_state').then(function (r) {
      if (r.error || !r.data || !r.data.data) return;
      var srvAt = r.data.at, mine2 = null; try { mine2 = localStorage.getItem('arkVillage.stateSrv'); } catch (e) {}
      if (!mine2 || srvAt > mine2) { stateApply(r.data.data); try { localStorage.setItem('arkVillage.stateSrv', srvAt); localStorage.setItem('arkVillage.state', JSON.stringify(r.data.data)); } catch (e) {} }
    }, function () {});
  }

