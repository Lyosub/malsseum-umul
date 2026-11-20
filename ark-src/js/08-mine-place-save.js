  // ───────── 캐기·놓기 권한, 저장 ─────────
  var client = null, me = null, myPlot = -1, plotOwners = {}, plotUser = {}, saveTimer = null, dirty = false, started = false;
  function canMine(x, y, z) {
    if (isAdm()) return y <= 0 ? '맨 아래 바닥은 캘 수 없어요' : '';   // 관리자는 어디서든(다른 사람 땅·방주 포함)
    var frontierReason=frontierEditReason(x,z); if(frontierReason) return frontierReason;
    if (protectedExcursion(x,z)) return '이곳은 함께 구경하는 장소예요';
    if (villageProjectLocked(x,z)) return '완성한 공사장이에요. 선생님에게 문의해요';
    if (inArk(x, y, z)) return '노아의 방주는 다 지어져 있어요. 안으로 들어가 둘러보세요! (창 6:22)';
    if (inCity(x, z)) return '거룩한 성은 지켜져 있어요';
    if (inDungeon(x, y, z) && get(x, y, z) !== TORCH && !(get(x, y, z) >= 170 && get(x, y, z) < 174) && get(x, y, z) !== LADDER + 3) return '골짜기의 벽은 깨지지 않아요 — 길을 찾아 지나가요(시 23:4)';
    if (y <= 0) return '맨 아래 바닥은 캘 수 없어요';
    var p = plotAt(x, z);
    if (p >= 0) {
      if (!me || p !== myPlot) return (p + 1) + '번 땅은 ' + (me ? '다른 사람의 땅이에요' : '주인이 있는 땅이에요');
      if (y < PY0 || y >= G + PH) return '땅 높이 안에서만 지을 수 있어요';
      return '';
    }
    if (inTown(x, z) && y >= G - 4 && kind(get(x, y, z)) !== 'plant') return '마을 길과 마당은 캘 수 없어요. 숲·산·호수로 가 보세요';
    return '';
  }
  function canPlace(x, y, z, id) {
    if (isAdm()) return '';
    var frontierReason=frontierEditReason(x,z); if(frontierReason) return frontierReason;
    if(client && !frontierEnabled && id>=ROPE && id<=ARCH_SIDE) return '개척 도구를 서버에서 준비하는 중이에요';
    if (client && !villageProjectsEnabled && id>=FIND_POT && id<=FEAST_FISH) return '마을 새 재료를 서버에서 준비하는 중이에요';
    if (protectedExcursion(x,z)) return '이곳은 함께 구경하는 장소예요';
    if (villageProjectLocked(x,z)) return '완성한 공사장이에요. 선생님에게 문의해요';
    if (inArk(x, y, z)) return '노아의 방주는 다 지어져 있어요. 안으로 들어가 둘러보세요! (창 6:22)';
    if (inCity(x, z)) return '거룩한 성은 지켜져 있어요';
    if (inDungeon(x, y, z) && id !== TORCH) return '골짜기에는 횃불만 놓을 수 있어요';
    var p = plotAt(x, z);
    // 땅 밖(숲·산·호수 같은 자연)에서도 블록을 놓을 수 있다 — 마을 마당·다른 사람 땅·방주만 빼고
    if (p < 0) return inTown(x, z) && y >= G - 4 ? '마을 마당에는 놓을 수 없어요' : '';
    if (!me) return '로그인하면 내 땅을 받아 집을 지을 수 있어요';
    if (p !== myPlot) return (p + 1) + '번 땅은 다른 사람의 땅이에요';
    if (y < PY0 || y >= G + PH) return '땅 높이 안에서만 지을 수 있어요(아래 3칸 ~ 위 ' + PH + '칸)';
    return '';
  }
  var lastDeny = '', lastDenyT = 0;
  function deny(msg) { var now = performance.now(); if (msg !== lastDeny || now - lastDenyT > 1500) { toast(msg); lastDeny = msg; lastDenyT = now; } }
  function lookDir() { var fx = -Math.sin(P.yaw), fz = -Math.cos(P.yaw); return Math.abs(fx) > Math.abs(fz) ? (fx > 0 ? 1 : 3) : (fz < 0 ? 0 : 2); }
  function doorColumn(x, y, z) {
    var y0 = y, y1 = y;
    while (SHAPE[get(x, y0 - 1, z)] && SHAPE[get(x, y0 - 1, z)].type === 'door') y0--;
    while (SHAPE[get(x, y1 + 1, z)] && SHAPE[get(x, y1 + 1, z)].type === 'door') y1++;
    return [y0, y1];
  }
  function toggleDoor(x, y, z) {
    var p = plotAt(x, z), reason=canPlace(x,y,z,DOOR);
    if (reason) return deny(reason);
    var c = doorColumn(x, y, z);
    if (myPlot >= 0 && p === myPlot && !SHAPE[get(x, y, z)].open) tutorialDoor = { x: x, z: z, y: c[0], top: c[1] + 1 };
    for (var yy = c[0]; yy <= c[1]; yy++) if(canPlace(x,yy,z,DOOR))return;
    for (yy = c[0]; yy <= c[1]; yy++) setBlock(x,yy,z,readBlock(x,yy,z)^1);
    sfx('door'); swingT = 0.25;
  }
  function toggleTrap(x, y, z, id) {
    var why = canPlace(x, y, z, id); if (why) return deny(why);
    setBlock(x, y, z, id ^ 1); sfx('door', 700); swingT = 0.25;
  }
  function toggleGate(x, y, z, id) {
    var why = canPlace(x, y, z, id);
    if (why) return deny(why);
    var gate = SHAPE[id];
    if (gate.open && P.y < y + 1 && P.y + curHT > y &&
        P.x + HW > x && P.x - HW < x+1 && P.z + HW > z && P.z - HW < z+1) {
      return deny('울타리 문에서 한 걸음 물러난 뒤 닫아요');
    }
    setBlock(x, y, z, GATE_STATES[gate.f][gate.open ? 0 : 1]);
    sfx('door'); swingT = .25;
  }
  function act(kindA, h) {
    if (!h || furnitureRest) return;
    if (kindA === 'break') {
      var why = canMine(h.x, h.y, h.z); if (why) return deny(why);
      var old = get(h.x, h.y, h.z), usedTool = mineInfo(old).tool || 0;
      if (SHAPE[old] && SHAPE[old].type === 'door') {
        // 문은 한 줄(4칸)을 통째로
        var dc = doorColumn(h.x, h.y, h.z);
        for (var dy = dc[0]; dy <= dc[1]; dy++) setBlock(h.x, dy, h.z, AIR);
        burst(h.x, h.y, h.z, old); dropItem(h.x + 0.5, h.y + 0.45, h.z + 0.5, DOOR, 1);
      } else {
        breakAt(h.x, h.y, h.z, old);
        var up = get(h.x, h.y + 1, h.z);
        if (kind(up) === 'plant') breakAt(h.x, h.y + 1, h.z, up);
      }
      if (isGrav(get(h.x, h.y + 1, h.z))) startFall(h.x, h.y + 1, h.z);
      sfx('break', matSound(old)); wearTool(usedTool); bagChanged();
    } else {
      var tgt = get(h.x, h.y, h.z);
      if (tryFrontierDevice(tgt,h)) return;
      if (SHAPE[tgt] && SHAPE[tgt].type === 'gate') return toggleGate(h.x, h.y, h.z, tgt);
      if (SHAPE[tgt] && SHAPE[tgt].type === 'door') return toggleDoor(h.x, h.y, h.z);
      if (SHAPE[tgt] && SHAPE[tgt].type === 'trapdoor') return toggleTrap(h.x, h.y, h.z, tgt);
      if (SHAPE[tgt] && SHAPE[tgt].type === 'frame') return useFrame(h.x, h.y, h.z);
      if (railAt(h.x, h.y, h.z) >= 0 && parkedAt(h.x, h.y, h.z)) return startCart(h.x, h.y, h.z, parkedAt(h.x, h.y, h.z));   // 세워 둔 수레
      if (HOTBAR[sel] === CART) { if (railAt(h.x, h.y, h.z) >= 0) return startCart(h.x, h.y, h.z); return deny('수레는 손에 들고 레일을 눌러 타요'); }
      if (tgt === FURNACE || tgt === FURNACE_ON) { if (plotAt(h.x, h.z) !== myPlot) return deny('다른 사람의 용광로예요'); craftCat = 'smelt'; invTab = 'craft'; openPanel('inv'); return; }
      if (tgt === CHEST) return openChest(h.x, h.y, h.z);
      if (tgt === CRAFT) { craftCat = 'wear'; invTab = 'craft'; openPanel('inv'); sfx('click'); return; }
      if (tgt>=FIND_MARK && tgt<=FIND_SEED || tgt===FERRY_POST || tgt===FEAST_TABLE) return useVillageBlock(tgt,h);
      if (tgt===WORD_SHELF) return showWordCard(false);
      if (tgt===ALTAR) return showWordCard(true);
      if (tgt===WELL) return drawWell(HOTBAR[sel]);
      if (STATION_BITS[tgt] && !FARM_SEEDS[HOTBAR[sel]]) {
        craftCat = 'block'; invTab = 'craft'; openPanel('inv'); return;
      }
      if (tgt === BED) return useBed(h.x, h.y, h.z);
      if (SHAPE[tgt] && SHAPE[tgt].type === 'chair') return beginFurnitureRest('sit', h.x, h.y, h.z, tgt);
      if (tgt === LAMPSTAND || tgt === LAMPSTAND + 1) return useLampstand(h.x, h.y, h.z);
      if (tgt === SOCKET) return useSocket(h.x, h.y, h.z);
      if (tgt === PEARL) return toast(STORY.done ? '문이 열려 있어요' : '진주 문은 닫혀 있어요 — 📜 나그네의 길을 끝까지 걸어야 열려요(계 21:21)');
      if (tgt === LEVER || tgt === LEVER + 1) return useLever(h.x, h.y, h.z);
      if (INSTR[tgt]) return playInstrument(tgt, h.x, h.y, h.z);
      if (inHoreb(h.x, h.y, h.z) && get(h.x, h.y, h.z) === BASALT) return strikeRock();
      if (tgt === MANGER) return showVerseCard('🌟', '구유', '첫아들을 낳아 강보로 싸서 구유에 뉘었으니 이는 여관에 있을 곳이 없음이러라', '누가복음 2:7', '오늘 다윗의 동네에 너희를 위하여 구주가 나셨으니 곧 그리스도 주시니라 (눅 2:11)');
      if (SHAPE[tgt] && SHAPE[tgt].type === 'sign' && plotAt(h.x, h.z) === myPlot && myPlot >= 0) return openSignPick(h.x, h.y, h.z);
      var item = HOTBAR[sel];
      if (!item) return deny('손에 든 것이 없어요. 아래 칸을 고르거나 🎒 가방에서 단축 칸에 넣어요');
      if (WEARINFO[item]) return wearItem(item);
      if (FOODS[item]) return eatItem(item);
      if (item===WATER_BUCKET || item===FULL_JAR) return pourWater(item,h);
      if (item === HOE) return tillGround(h);
      if (FARM_SEEDS[item]) { if (have(item)>0) plantSeed(h,item); return; }
      if (item === SEED) { if (have(SEED) < 1) return; return plantSeed(h); }
      var bx = h.px, by = h.py, bz = h.pz, id = item, ld = lookDir();
      ld = (ld + buildTurn) % 4;
      if (SHAPE[id] && SHAPE[id].type === 'stair') id = SHAPE[id].base + ld;
      id = orientedBuild(item,ld,id);
      if (item === CHAIR) id = CHAIR + (ld + 2) % 4;
      if (item === GATE) id = GATE_STATES[ld % 2][0];
      if (item === STRIKER) {
        if (!have(STRIKER)) return deny('먼저 부시를 만들어요');
        var reason = canPlace(bx, by, bz, TORCH), ground = get(bx, by - 1, bz), target = get(bx, by, bz);
        if (reason) return deny(reason);
        if (!have(FLINT) || !have(STICK) || (!have(CHAR) && !have(COAL))) return deny('불을 붙이려면 부싯돌, 막대기, 숯이나 석탄이 필요해요');
        if (target !== AIR || !isSolid(ground) || isShape(ground)) return deny('바닥의 빈 곳에 불을 붙여요');
        take(STICK,1); take(have(CHAR) ? CHAR : COAL,1);
        setBlock(bx,by,bz,TORCH); bagChanged(); sfx('place'); return;
      }
      var why2 = canPlace(h.px, h.py, h.pz, item); if (why2) return deny(why2);
      if (isItem(item)) return deny('「' + B[item][0] + '」은(는) 놓는 블록이 아니에요. 블록을 골라 주세요');
      if (have(item) < 1) return deny(B[item][0] + '이(가) 없어요. 캐거나 만들어서 모아요');
      if (SLAB_TOP[id]) {
        // 같은 재료 반 블록의 빈 반쪽을 겨누면 한 칸 전체 블록으로 합친다
        if (slabMergeTarget(id, h)) {
          var mwhy = canPlace(h.x, h.y, h.z, item); if (mwhy) return deny(mwhy);
          if (isSolid(SLAB_MATERIAL[id]) && h.x + 1 > P.x - HW && h.x < P.x + HW && h.y + 1 > P.y && h.y < P.y + HT && h.z + 1 > P.z - HW && h.z < P.z + HW) return;
          take(item, 1); setBlock(h.x, h.y, h.z, SLAB_MATERIAL[id]); sfx('place', matSound(item)); bagChanged();
          partyAdd('build', 1);
          tutorialEvent('place');
          if (plotAt(h.x, h.z) === myPlot) { stats.placed++; questCheck(); if (stats.placed >= 30) unlock('house'); buildMilestone(); }
          if (inCommons(h.x, h.z)) unlock('commons');
          swingT = 0.25; vibrate(); exhaust(0.02);
          return;
        }
        id = slabPlacement(id, h);
      }
      if (id === LADDER) {
        var ddx = h.x - h.px, ddz = h.z - h.pz;
        if (ddx || ddz) { if (!isSolid(get(h.x, h.y, h.z)) || SHAPE[get(h.x, h.y, h.z)]) return deny('사닥다리는 벽에 붙여요'); id = LADDER + (ddz < 0 ? 0 : (ddx > 0 ? 1 : (ddz > 0 ? 2 : 3))); }
        else id = LADDER + ld;
      }
      if (id === TRAP) { var ttop = h.py < h.y || (h.py === h.y && h.atY - h.py >= 0.5); id = TRAP + ((ld + 2) % 4) * 4 + (ttop ? 2 : 0); }   // 블록 윗반쪽·아랫면을 겨누면 위에 붙임
      if (id === FRAME) {
        var fdx = h.x - h.px, fdz = h.z - h.pz;
        if (!(fdx || fdz) || !isSolid(get(h.x, h.y, h.z)) || SHAPE[get(h.x, h.y, h.z)]) return deny('액자는 벽 옆면에 걸어요');
        id = FRAME + (fdz < 0 ? 0 : (fdx > 0 ? 1 : (fdz > 0 ? 2 : 3)));
      }
      if (id === SAPLING && [GRASS, DIRT].indexOf(get(bx, by - 1, bz)) < 0) return deny('묘목은 풀이나 흙 위에 심어요');
      // 벽 횃불: 옆면을 누르면 벽에 붙임
      var sdx = h.x - h.px, sdz = h.z - h.pz;
      if (id === TORCH && (sdx || sdz) && h.py === h.y && isSolid(get(h.x, h.y, h.z)) && !SHAPE[get(h.x, h.y, h.z)]) id = WTORCH + (sdz < 0 ? 0 : (sdx > 0 ? 1 : (sdz > 0 ? 2 : 3)));
      else if (kind(id) === 'plant' && (!isSolid(get(bx, by - 1, bz)) || isShape(get(bx, by - 1, bz)))) return deny(id === TORCH ? '횃불은 단단한 블록 위나 벽에 붙여요' : '풀과 꽃은 땅 위에만 심을 수 있어요');
      // 통나무: 옆면에 놓으면 눕혀서
      if (id === LOG && h.py === h.y) id = sdx ? LOG_X : LOG_Z;
      if (id === RAIL0 || id === RAILF0) { var rg = get(bx, by - 1, bz); if (!isSolid(rg) || isShape(rg)) return deny('레일은 단단한 블록 위에 깔아요'); id = id + railShapeFor(bx, by, bz, ld); }
      if (id === LEVER && (!isSolid(get(bx, by - 1, bz)) || isShape(get(bx, by - 1, bz)))) return deny('레버는 단단한 블록 위에 놓아요');
      if (id === SIGN) { if (plotAt(bx, bz) !== myPlot || myPlot < 0) return deny('표지판은 내 땅에 세워요'); id = SIGN + ld; }
      function hitsMe(yy) { return bx + 1 > P.x - HW && bx < P.x + HW && yy + 1 > P.y && yy < P.y + HT && bz + 1 > P.z - HW && bz < P.z + HW; }
      if (item === DOOR) {
        // 문: 사람 키에 맞게 4칸 높이
        for (var k = 0; k < 4; k++) {
          var c = get(bx, by + k, bz);
          if ((c !== AIR && kind(c) !== 'plant') || canPlace(bx, by + k, bz)) return deny('문은 위로 빈 칸 4개가 있어야 놓을 수 있어요');
        }
        var df = (ld + 2) % 4;
        take(DOOR, 1);
        var doorUndo=[];
        for (k = 0; k < 4; k++) {
          doorUndo.push([bx,by+k,bz,readBlock(bx,by+k,bz),DOOR+df*2]);
          setBlock(bx, by + k, bz, DOOR + df * 2);
        }
        rememberBuild(item,doorUndo);
        sfx('place', matSound(item)); bagChanged(); stats.placed++; questCheck();
        swingT = 0.25; vibrate(); return;
      }
      if ((isSolid(id) && !SHAPE[id] || id === RAIL || item === GATE) && hitsMe(by)) return;
      var beforeId=readBlock(bx,by,bz);
      take(item, 1); setBlock(bx, by, bz, id); sfx('place', matSound(item)); bagChanged();
      rememberBuild(item,[[bx,by,bz,beforeId,id]]);
      if (item === RAIL0 || item === RAILF0) railFixNeighbors(bx, by, bz);
      if (isGrav(id)) startFall(bx, by, bz);
      if (id === SAPLING) { SAPS.push({ x: bx, y: by, z: bz, t: Date.now() + (90 + Math.random() * 90) * 1000 }); saveSaps(); toast('묘목을 심었어요. 조금 지나면 나무로 자라요 (시 1:3)'); }
      partyAdd('build', 1);
      tutorialEvent('place');
      if (plotAt(bx, bz) === myPlot) { stats.placed++; questCheck(); if (stats.placed >= 30) unlock('house'); buildMilestone(); }
      if (inCommons(bx, bz)) unlock('commons');
      if (SHAPE[id] && SHAPE[id].type === 'sign') openSignPick(bx, by, bz);
    }
    swingT = 0.25; vibrate(); exhaust(0.02);
  }
  function naturalBuildResource(x, y, z, old) {
    if (old !== STONE && old !== LIME && old !== SAND && old !== CLAY) return 0;
    if (inTown(x, z) || inCommons(x, z) || inCity(x, z) || inDungeon(x, y, z) || plotAt(x, z) >= 0) return 0;
    var chunkKey = (z >> 5) * NC + (x >> 5), cell = (y * CS + (z & 31)) * CS + (x & 31);
    if (EDITS[chunkKey] && Object.hasOwn(EDITS[chunkKey], cell)) return 0;
    terrain(x,z);
    var r = hash2(x * 13 + y * 47, z * 17 - y * 71, 72);
    var nearSea = z < SEA_Z + 28;
    if (nearSea && y === T.h && (old === SAND || old === CLAY)) {
      if (T.wtop > y) return r < .035 ? SEA_PEARL : (r < .15 ? CORAL : 0);
      if (old === SAND && r < .24) return SALT;
    }
    if (old === CLAY && r < .3) return RED_EARTH;
    if (old === LIME && r < .26) return ALABASTER;
    if (old === STONE && x < PX0 - 20 && y >= G + 12 && r < .19) return MARBLE;
    if (old === STONE && r < .28) return FLINT;
    return 0;
  }
  function breakAt(x, y, z, old) {
    var resource = naturalBuildResource(x, y, z, old);
    setBlock(x, y, z, AIR); burst(x, y, z, old);
    var dropId = dropOf(old);
    exhaust(0.03);
    if (FARM_PLANTS[old]) {
      var farm = FARM_PLANTS[old], ripe = old === farm.base+3;
      if (ripe) {
        dropItem(x+.5,y+.4,z+.5,farm.harvest,2); dexMore('p' + farm.harvest, B[farm.harvest][0]);
        unlock('harvest'); partyAdd('harvest',1);
        if (farm.perennial && get(x,y-1,z)===FARM_SOIL) {
          setBlock(x,y,z,farm.base+1); trackCrop(x,y,z,farm.base,1); return;
        }
      }
      dropItem(x+.5,y+.4,z+.5,farm.seed,1);
      return;
    }
    if (isCrop(old)) {   // 밀 거두기: 익었으면 밀과 씨, 덜 익었으면 씨만
      if (old === CROP0 + 3) { dropItem(x + 0.5, y + 0.45, z + 0.5, WHEAT, 1 + (Math.random() < 0.5 ? 1 : 0)); dropItem(x + 0.5, y + 0.45, z + 0.5, SEED, 1 + (Math.random() < 0.6 ? 1 : 0)); unlock('harvest'); partyAdd('harvest', 1); }
      else dropItem(x + 0.5, y + 0.45, z + 0.5, SEED, 1);
      return;
    }
    dropItem(x + 0.5, y + 0.45, z + 0.5, dropId, 1);
    if ((old===GRASS || old===FLOWER || old===LEAF) && plotAt(x,z)<0 && Math.random()<.16)
      dropItem(x+.5,y+.4,z+.5,600+Math.floor(Math.random()*FARM_TYPES.length),1);
    if (old===FLOWER && Math.random()<.18) dropItem(x+.5,y+.4,z+.5,HONEY,1);
    if (resource) dropItem(x + .5,y + .6,z + .5,resource,1);
    if ((old === GRASS || old === FLOWER) && Math.random() < 0.12) dropItem(x + 0.5, y + 0.6, z + 0.5, SEED, 1);
    if (SHAPE[old] && SHAPE[old].type === 'sign' && myPlot >= 0 && plotAt(x, z) === myPlot) { var so = plotOrigin(myPlot); delete SIGNS[(x - so.x) + ',' + (y - PY0) + ',' + (z - so.z)]; markDirty(); refreshSigns(); }
    if (old === CHEST) spillChest(x, y, z);
    if (SHAPE[old] && SHAPE[old].type === 'frame') frameBroken(x, y, z);
    if (SHAPE[old] && SHAPE[old].type === 'mrail') parkedBroken(x, y, z);
    if (old === LEAF && Math.random() < 0.04) dropItem(x + 0.5, y + 0.45, z + 0.5, FIG, 1);
    if (old === LEAF) {
      if (Math.random() < 0.08) dropItem(x + 0.5, y + 0.45, z + 0.5, SAPLING, 1);
      if (Math.random() < 0.025) {
        dropItem(x + 0.5, y + 0.45, z + 0.5, OLIVE, 1);
        toast('🕊 감람나무 새 잎사귀! 비둘기가 물고 온 잎이에요 (창 8:11)');
      }
    }
    if (DEX_MATS.indexOf(dropId) >= 0 && !DEX['m' + dropId]) { DEX['m' + dropId] = 1; saveDex(); toast('📖 도감에 「' + B[dropId][0] + '」을(를) 적었어요'); }
    dexMined(old);
    if (old >= THORN && old <= LILY) recordVillagePlant(old,x,z);
    if (dropId === LOG) { stats.log++; questCheck(); partyAdd('logs', 1); }
  }
  var pickT = null, pickAgg = {};
  function pickup(id, n) {
    if (id === MANNA) unlock('manna');
    pickAgg[id] = (pickAgg[id] || 0) + (n || 1);
    var el = $('pickup'), parts = [];
    for (var k in pickAgg) parts.push('+' + pickAgg[k] + ' ' + B[k][0]);
    el.textContent = parts.join('  '); el.classList.add('show'); sfx('pop');
    clearTimeout(pickT); pickT = setTimeout(function () { el.classList.remove('show'); pickAgg = {}; }, 1400);
  }
  function vibrate() { try { navigator.vibrate && navigator.vibrate(12); } catch (e) {} }
  function setBlock(x, y, z, id) {
    var was = readBlock(x, y, z), c0 = colAt(x, z);
    setRaw(x, y, z, id); updateFrontierMachine(c0,x,y,z,id); updateSky(x, z); plotWrite(x, y, z, id);
    if (plotAt(x, z) < 0) recordEdit(x, y, z, id);
    if (c0) c0.mod = true;
    if (LIGHTS[was] || LIGHTS[id]) {
      if (c0) { if (LIGHTS[id]) c0.lamps.push([x, y, z]); else c0.lamps = c0.lamps.filter(function (l) { return l[0] !== x || l[1] !== y || l[2] !== z; }); }
      lampChanged(x, y, z);
    } else rebuildAround(x, y, z);
    if (plotAt(x, z) === myPlot && myPlot >= 0) markDirty();
    netEdit(x, y, z, id);
  }
  function markDirty() { dirty = true; clearTimeout(saveTimer); saveTimer = setTimeout(savePlot, 1500); setSave('저장 중…'); }

  // 캐는 중(꾹 누르기/왼쪽 클릭 누르고 있기)
  var mine = null, crackMesh = null, crackGeo = [];
  function mineTick(h, dt) {
    if (!h || furnitureRest) { mine = null; return; }
    if (!mine || mine.x !== h.x || mine.y !== h.y || mine.z !== h.z) {
      var why = canMine(h.x, h.y, h.z);
      if (why) { deny(why); mine = { x: h.x, y: h.y, z: h.z, t: 0, need: 1, denied: true }; return; }
      var id = get(h.x, h.y, h.z), mi = mineInfo(id);
      if (mi.deny) { deny(mi.deny); mine = { x: h.x, y: h.y, z: h.z, t: 0, need: 1, denied: true }; return; }
      mine = { x: h.x, y: h.y, z: h.z, t: 0, need: mi.t * (P.swim ? 3 : 1), snd: 0, f: matSound(id) };
    }
    if (mine.denied) return;
    mine.t += dt; mine.snd -= dt;
    if (mine.snd <= 0) { sfx('dig', mine.f); mine.snd = 0.2; swingT = 0.25; burst(mine.x, mine.y, mine.z, get(mine.x, mine.y, mine.z), true); }
    if (mine.t >= mine.need) { act('break', h); mine = null; if (hold) hold.dug = true; }
  }
  function updateCrack() {
    if (mine && !mine.denied && mine.t > 0) {
      var st = Math.min(7, Math.floor(mine.t / mine.need * 8));
      crackMesh.geometry = crackGeo[st]; crackMesh.position.set(mine.x + 0.5, mine.y + 0.5, mine.z + 0.5); crackMesh.visible = true;
    } else crackMesh.visible = false;
  }
  function updateRing() {
    var r = $('ring');
    if (!hold || !mine || mine.denied || ui !== 'play') { r.classList.remove('show'); return; }
    var px = S.aim === 'cross' ? window.innerWidth / 2 : hold.x, py = S.aim === 'cross' ? window.innerHeight / 2 : hold.y;
    r.classList.add('show'); r.style.left = px + 'px'; r.style.top = py + 'px';
    r.style.setProperty('--p', (Math.min(1, mine.t / mine.need) * 100) + '%');
  }

  // 땅 한 필지 = PLOT×PLOT×(PH+3)칸 → (개수, 블록) 묶음 → base64, 뒤에 |i:가방 |d:도감
  function plotDefault() {
    var a = new Uint16Array(PSIZE), k = 0;
    for (var y = PY0; y < G + PH; y++) { var id = y < G - 1 ? DIRT : (y === G - 1 ? GRASS : AIR); for (var j = 0; j < PLOT * PLOT; j++) a[k++] = id; }
    return a;
  }
  function plotWrite(x, y, z, id) {
    var p = plotAt(x, z);
    if (p < 0 || (p !== myPlot && !isAdm()) || y < PY0 || y >= G + PH) return;
    if (!plotData[p]) plotData[p] = plotDefault();
    var o = plotOrigin(p); plotData[p][((y - PY0) * PLOT + (z - o.z)) * PLOT + (x - o.x)] = id;
  }
  var expandedPlotFormats={};
  function compactLegacyPlot(a) {
    if(!a||PLOT===OLD_PLOT)return a;
    for(var layer=0;layer<G+PH-PY0;layer++){
      var y=layer+PY0, base=y<G-1?DIRT:(y===G-1?GRASS:AIR);
      for(var z=0;z<PLOT;z++)for(var x=(z<OLD_PLOT?OLD_PLOT:0);x<PLOT;x++){
        if(a[(layer*PLOT+z)*PLOT+x]!==base)return null;
      }
    }
    var legacy=new Uint16Array(OLD_PLOT*OLD_PLOT*(G+PH-PY0));
    for(layer=0;layer<G+PH-PY0;layer++)for(z=0;z<OLD_PLOT;z++){
      var from=(layer*PLOT+z)*PLOT;
      legacy.set(a.subarray(from,from+OLD_PLOT),(layer*OLD_PLOT+z)*OLD_PLOT);
    }
    return legacy;
  }
  function encodePlot(i) {
    var a=plotData[i], out='', k, expanded=!!expandedPlotFormats[i];
    if(a&&PLOT===WIDE_PLOT&&!expanded){
      var compact=compactLegacyPlot(a);
      if(compact)a=compact;
      else expanded=expandedPlotFormats[i]=true;
    }
    var wide=expanded||(a&&a.some(function(id){return id>255;}));
    if (a) {
      for (k = 0; k < a.length;) {
        var v = a[k], n = 1;
        while (k + n < a.length && a[k + n] === v && n < 255) n++;
        out += wide ? String.fromCharCode(n, v & 255, v >> 8) : String.fromCharCode(n, v); k += n;
      }
    }
    var cs = chestString();
    return (a ? (expanded ? 'r3:' : (wide ? 'r2:' : 'r1:')) + btoa(out) : 'r0:') + '|i:' + bagString() + '|d:' + dexString() + (cs ? '|c:' + cs : '') + '|w:' + wornString() + '|s:' + seenString() + (signString() ? '|g:' + signString() : '') + (frameString() ? '|f:' + frameString() : '');
  }
  function decodePlot(i, data, mine) {
    try {
      var parts = data.split('|'), body = parts[0];
      if (mine) parts.slice(1).forEach(function (seg) {
        if (seg.slice(0, 2) === 'i:') { BAG = bagFromString(seg.slice(2)); for (var bk4 in BAG) if (BAG[bk4] > 0) SEEN[+bk4] = 1; saveSeen(); }
        else if (seg.slice(0, 2) === 's:') { seg.slice(2).split('.').forEach(function (k) { if (+k && B[+k]) SEEN[+k] = 1; }); saveSeen(); }
        else if (seg.slice(0, 2) === 'c:') chestFromString(seg.slice(2));
        else if (seg.slice(0, 2) === 'w:') { wornFromString(seg.slice(2)); try { localStorage.setItem('arkVillage.worn', wornString()); } catch (e) {} refreshMyAvatar(); }
        else if (seg.slice(0, 2) === 'd:') { dexFromString(seg.slice(2)); try { localStorage.setItem('arkVillage.dex', JSON.stringify(DEX)); } catch (e) {} }
      });
      parts.slice(1).forEach(function (seg) {   // 표지판 글: 내 땅이든 다른 사람 땅이든
        if (seg.slice(0, 2) !== 'g:') return;
        if (mine) { SIGNS = {}; signFromString(seg.slice(2), SIGNS); } else { OTHER_SIGNS[i] = {}; signFromString(seg.slice(2), OTHER_SIGNS[i]); }
      });
      if (mine) FRAMES = {}; else delete OTHER_FRAMES[i];
      parts.slice(1).forEach(function (seg) {   // 액자에 건 것: 내 땅이든 다른 사람 땅이든
        if (seg.slice(0, 2) !== 'f:') return;
        if (mine) frameFromString(seg.slice(2), FRAMES); else { OTHER_FRAMES[i] = {}; frameFromString(seg.slice(2), OTHER_FRAMES[i]); }
      });
      var format = body.slice(0, 3);
      if (format !== 'r1:' && format !== 'r2:' && format !== 'r3:') return;
      var size = format === 'r3:' ? WIDE_PLOT : OLD_PLOT;
      if (size > PLOT) return;
      var volume = size * size * (G + PH - PY0);
      var s = atob(body.slice(3)), a = new Uint16Array(volume), k = 0, stride = format === 'r1:' ? 2 : 3;
      if (s.length % stride) return;
      for (var j = 0; j < s.length; j += stride) {
        var n = s.charCodeAt(j), v = s.charCodeAt(j + 1) + (stride === 3 ? s.charCodeAt(j + 2) * 256 : 0);
        if (!n || k + n > volume) return;
        a.fill(v < B.length && B[v] ? v : AIR, k, k + n); k += n;   // 물도 그대로(대저택 수영장)
      }
      if (k !== volume) return;
      if (size < PLOT) {
        var expanded = plotDefault();
        for (var layer = 0; layer < G + PH - PY0; layer++) {
          for (var row = 0; row < size; row++) {
            var offset = (layer * size + row) * size;
            expanded.set(a.subarray(offset, offset + size), (layer * PLOT + row) * PLOT);
          }
        }
        a = expanded;
      }
      plotData[i] = a;
      expandedPlotFormats[i]=format==='r3:';
    } catch (e) {}
  }
  // 내 땅 저장: 서버 기록이 내가 마지막으로 본 것 그대로일 때만 덮는다.
  // 그 사이 다른 기기·선생님이 먼저 저장했으면 덮지 않고 서버의 최신 내 땅을 불러온다(두 기기로 번갈아 해도 기록이 사라지지 않게)
  var plotSrvAt = null;   // 내 땅 서버 기록의 마지막 저장 시각(이름 주의: plotAt은 「몇 번 땅인지」 함수)
  var noBagNote = false;
  function plotWriteServer(data) {
    var now = new Date().toISOString(), q = client.from('ark_village_plots').update({ data: data, updated_at: now }).eq('user_id', me.id);
    if (plotSrvAt) q = q.eq('updated_at', plotSrvAt);
    return q.select(noBagNote ? 'updated_at' : 'updated_at,bag_note').then(function (r) {
      if (r.error && !noBagNote && /bag_note/.test(r.error.message || '')) { noBagNote = true; return plotWriteServer(data); }   // 서버에 가방 확인이 아직 없을 때
      if (r.error) { setSave('저장 실패 — 다시 시도해요'); dirty = true; saveTimer = setTimeout(savePlot, 4000); return; }
      if (r.data && r.data.length) {
        plotSrvAt = r.data[0].updated_at; setSave('저장됨');
        if (r.data[0].bag_note === 'reverted') return reloadMyPlot(true).then(function () { toast('🎒 가방 숫자가 갑자기 너무 많이 늘어서 서버에 저장된 가방으로 되돌렸어요'); });
        return;
      }
      return reloadMyPlot();   // 다른 곳에서 더 나중에 저장함
    });
  }
  function reloadMyPlot(quiet) {
    return client.from('ark_village_plots').select('data,updated_at').eq('user_id', me.id).maybeSingle().then(function (r) {
      var row = r && r.data; if (!row) { setSave('저장 실패 — 다시 시도해요'); return; }
      plotSrvAt = row.updated_at; dirty = false; clearTimeout(saveTimer);
      if (row.data) decodePlot(myPlot, row.data, true);
      var o = plotOrigin(myPlot);
      for (var cz = (o.z - 1) >> 5; cz <= (o.z + PLOT) >> 5; cz++) for (var cx = (o.x - 1) >> 5; cx <= (o.x + PLOT) >> 5; cx++) {
        var k = cz * NC + cx; if (!COLS[k]) continue; var was = meshedCols[k]; genColumn(cx, cz); if (was) { unmeshColumn(cx, cz); meshColumn(cx, cz); }
      }
      bagChanged(); setSave('저장됨'); if (!quiet) toast('📱 다른 기기(또는 선생님)가 더 나중에 바꾼 내 땅을 불러왔어요');
    });
  }
  function savePlotNow() {
    if (!client || !me || myPlot < 0) return Promise.resolve();
    clearTimeout(saveTimer); dirty = false;
    var data = encodePlot(myPlot);
    if (data.length > 20000) return Promise.resolve();
    return plotWriteServer(data);
  }
  function savePlot() {
    if (!client || !me || myPlot < 0 || !dirty) return;
    var data = encodePlot(myPlot);
    if (data.length > 20000) { setSave('저장 안 됨'); toast('집이 너무 복잡해서 저장할 수 없어요. 블록을 조금 정리해 주세요'); return; }
    dirty = false;
    plotWriteServer(data);
  }
  function setSave(t) { var el = $('saveState'); if (el) { el.textContent = t; el.classList.toggle('quiet', t === '저장됨'); } }
  function markPlots() {
    for (var i = 0; i < PCOLS * PROWS; i++) {
      var o = plotOrigin(i), id = i === myPlot ? 15 : (plotOwners[i] ? 11 : 0);
      if (!id) continue;
      [[-1, -1], [PLOT, -1], [-1, PLOT], [PLOT, PLOT]].forEach(function (c) { setRaw(o.x + c[0], G - 1, o.z + c[1], id); });
    }
  }

  // ───────── 부서지는 조각 ─────────
  var bits = [], bitGeo = null, bitMats = {};
  // 무늬에서 실제 색 몇 개를 골라 조각 색으로
  var palCache = {};
  function tilePalette(t) {
    if (palCache[t]) return palCache[t];
    var dd = actx.getImageData((t % ACOLS) * TS, Math.floor(t / ACOLS) * TS, TS, TS).data, cs = [];
    for (var k = 0; k < 4; k++) for (var tries = 0; tries < 20; tries++) {
      var o = (Math.floor(Math.random() * TS * TS)) * 4; if (dd[o + 3] < 128) continue;
      cs.push((dd[o] << 16) | (dd[o + 1] << 8) | dd[o + 2]); break;
    }
    if (!cs.length) cs.push(TILE_AVG[t]);
    return (palCache[t] = cs);
  }
  function burst(x, y, z, id, small) {
    if (!id) return;
    var mats = bitMats[id] || (bitMats[id] = tilePalette(BT[id][1]).map(function (c) { return new THREE.MeshBasicMaterial({ color: c }); }));
    var cnt = small ? 2 : 10;
    for (var i = 0; i < cnt; i++) {
      var m = new THREE.Mesh(bitGeo, mats[i % mats.length]);
      m.position.set(x + 0.2 + Math.random() * 0.6, y + (small ? 0.9 : 0.2 + Math.random() * 0.6), z + 0.2 + Math.random() * 0.6);
      if (small) m.scale.setScalar(0.6);
      m.userData = { vx: (Math.random() - 0.5) * (small ? 2.5 : 5), vy: (small ? 1.5 : 3) + Math.random() * (small ? 2 : 5), vz: (Math.random() - 0.5) * (small ? 2.5 : 5), life: small ? 0.3 : 0.55 + Math.random() * 0.3, s0: small ? 0.6 : 1 };
      scene.add(m); bits.push(m);
    }
  }
  // 땅에 떨어진 것: 빙글 돌며 떠 있다가 가까이 가면 빨려 들어온다(멀어지거나 오래되면 그냥 가방으로)
  var DROPS = [], dropGeo = {}, dropMatB = null, dropMatF = null;
  function dropMats() {
    if (!dropMatB) {
      dropMatB = new THREE.MeshBasicMaterial({ map: atlasTex, vertexColors: true }); lightPatch(dropMatB);
      dropMatF = new THREE.MeshBasicMaterial({ map: atlasTex, vertexColors: true, alphaTest: 0.5, side: THREE.DoubleSide }); lightPatch(dropMatF);
    }
  }
  function isFlat(id) { return isItem(id) || kind(id) === 'plant' || (SHAPE[id] && (SHAPE[id].type === 'ladder' || SHAPE[id].type === 'door')); }
  function dropItem(x, y, z, id, n) {
    if (!id || INV.indexOf(id) < 0 || !n) return;
    for (var i = 0; i < DROPS.length; i++) { var o0 = DROPS[i]; if (o0.id === id && !o0.dead && Math.abs(o0.x - x) < 1 && Math.abs(o0.y - y) < 1.2 && Math.abs(o0.z - z) < 1) { o0.n += n; return; } }
    if (DROPS.length > 60 && !collectDrop(DROPS[0], true)) dropAway(DROPS[0]);
    if (!scene || !atlasTex) { give(id, n); return; }
    dropMats();
    var flat = isFlat(id), geo = dropGeo[id] || (dropGeo[id] = flat ? itemGeometry(id) : blockGeometry(id));
    var m = new THREE.Mesh(geo, flat ? dropMatF : dropMatB); m.scale.setScalar(flat ? 0.5 : 0.3); m.position.set(x, y, z); scene.add(m);
    DROPS.push({ id: id, n: n, x: x, y: y, z: z, vx: (Math.random() - 0.5) * 2.2, vy: 3.5, vz: (Math.random() - 0.5) * 2.2, age: 0, m: m, rot: Math.random() * 6 });
  }
  // 줍기: 가방에 자리가 없으면 남은 것은 땅에 그대로(잠깐 안 끌려옴)
  function collectDrop(o, quiet) {
    if (o.dead) return true;
    var g = give(o.id, o.n);
    if (g > 0 && !quiet) pickup(o.id, g);
    if (g < o.n) { o.n -= g; o.full = o.age; bagFull(); return false; }
    o.dead = true;
    if (o.m) { scene.remove(o.m); o.m = null; }
    return true;
  }
  function dropAway(o) { if (o.m) { scene.remove(o.m); o.m = null; } o.dead = true; }
  function collectAll() { DROPS.forEach(function (o) { collectDrop(o, true); }); DROPS = []; bagChanged(); }
  window.addEventListener('pagehide', function () { if (DROPS.length) collectAll(); });
  // ── 버리기·줍기: 버린 물건은 근처 사람 모두에게 보이고 먼저 닿는 사람이 줍는다(서버 ark_drops, 15분 뒤 사라짐) ──
  var SDROPS = {}, sdropAt = 0, sdropBusy = false, takeBusy = {};
  function throwItem(id, n) {
    if (!id || INV.indexOf(id) < 0) { toast('버릴 것을 골라요'); return; }
    n = Math.min(n, have(id), 64); if (n < 1) { toast(nameOf(id) + '이(가) 없어요'); return; }
    var fx = -Math.sin(P.yaw), fz = -Math.cos(P.yaw), x = P.x + fx * 1.6, z = P.z + fz * 1.6, y = P.y + 1.2;
    take(id, n); bagChanged(); sfx('pop');
    if (socialOn()) {
      client.rpc('drop_ark_item', { p_x: x, p_y: y, p_z: z, p_item: id, p_amount: n }).then(function (r) {
        var nid = r && r.data;
        if (!nid || nid < 0) { give(id, n); bagChanged(); toast(nid === -3 ? '버린 물건이 너무 많아요. 조금 뒤에 다시 해요' : '버리지 못했어요'); return; }
        addSDrop({ id: nid, x: x, y: y, z: z, item: id, amount: n, mine: true });
        toast('🫳 ' + nameOf(id) + ' ' + n + '개를 버렸어요 — 다른 사람도 주울 수 있어요');
      }, function () { give(id, n); bagChanged(); toast('버리지 못했어요'); });
    } else {
      dropItem(x, y, z, id, n);
      var o = DROPS[DROPS.length - 1]; if (o && o.id === id) { o.thrown = true; o.full = o.age; }
      toast('🫳 ' + nameOf(id) + ' ' + n + '개를 버렸어요');
    }
  }
  function addSDrop(d) {
    if (SDROPS[d.id] || !scene || !atlasTex || !B[d.item]) return;
    dropMats();
    var flat = isFlat(d.item), geo = dropGeo[d.item] || (dropGeo[d.item] = flat ? itemGeometry(d.item) : blockGeometry(d.item));
    var m = new THREE.Mesh(geo, flat ? dropMatF : dropMatB); m.scale.setScalar(flat ? 0.5 : 0.3);
    var ix = Math.floor(d.x), iz = Math.floor(d.z), gy = d.y;
    for (var yy = Math.min(SY - 1, Math.floor(d.y)); yy > 0; yy--) { if (isSolid(get(ix, yy - 1, iz))) { gy = yy + 0.18; break; } }
    m.position.set(d.x, gy, d.z); scene.add(m);
    SDROPS[d.id] = { id: d.id, item: d.item, n: d.amount, x: d.x, y: gy, z: d.z, m: m, hold: d.mine ? performance.now() + 3000 : 0, rot: Math.random() * 6, fullT: 0 };
  }
  function removeSDrop(id) { var s = SDROPS[id]; if (!s) return; if (s.m) scene.remove(s.m); delete SDROPS[id]; }
  function fetchSDrops() {
    if (!socialOn() || sdropBusy || performance.now() < sdropAt) return;
    sdropAt = performance.now() + 4000; sdropBusy = true;
    client.rpc('get_ark_drops', { p_x: P.x, p_z: P.z }).then(function (r) {
      sdropBusy = false; if (!r || r.error || !Array.isArray(r.data)) return;
      var seen = {}; r.data.forEach(function (d) { seen[d.id] = 1; addSDrop(d); });
      for (var k in SDROPS) { var s = SDROPS[k]; if (!seen[k] && !takeBusy[k] && Math.abs(s.x - P.x) <= 60 && Math.abs(s.z - P.z) <= 60) removeSDrop(k); }
    }, function () { sdropBusy = false; });
  }
  function stepSDrops(dt) {
    fetchSDrops();
    var now = performance.now();
    for (var k in SDROPS) {
      var s = SDROPS[k]; s.rot += dt * 1.8;
      s.m.position.y = s.y + Math.sin(now / 330 + s.id) * 0.06; s.m.rotation.y = s.rot;
      var dx = P.x - s.x, dy = (P.y + 0.6) - s.y, dz = P.z - s.z;
      if (Math.abs(dx) > 90 || Math.abs(dz) > 90) { removeSDrop(k); continue; }
      if (now < s.hold || takeBusy[k] || dx * dx + dy * dy + dz * dz > 2.6) continue;
      if (!isAdm() && room(s.item) < s.n) { if (now > s.fullT) { s.fullT = now + 5000; bagFull(); } continue; }
      takeSDrop(s);
    }
  }
  function takeSDrop(s) {
    takeBusy[s.id] = 1;
    client.rpc('take_ark_drop', { p_id: s.id }).then(function (r) {
      delete takeBusy[s.id]; removeSDrop(s.id);
      var d = r && r.data;
      if (d && d.item) { give(d.item, d.amount); bagChanged(); pickup(d.item, d.amount); }
    }, function () { delete takeBusy[s.id]; });
  }
  // 관리자가 다른 사람 땅을 고치면: 그 땅의 블록 부분만 서버에 저장(가방·도감 같은 주인 기록은 그대로)
  var adminPlots = {}, adminPlotT = 0;
  function adminPlotDirty(p) {
    adminPlots[p] = 1; clearTimeout(adminPlotT);
    adminPlotT = setTimeout(function () {
      var ps = Object.keys(adminPlots); adminPlots = {};
      ps.forEach(function (k) {
        var blocks = encodePlot(+k).split('|')[0];
        client.rpc('admin_set_plot_blocks', { p_plot: +k, p_blocks: blocks }).then(function (r) {
          if (r && r.data === true) toast('🛠 ' + (+k + 1) + '번 땅을 고쳐 저장했어요(관리자)');
          else toast((+k + 1) + '번 땅을 저장하지 못했어요');
        }, function () { toast((+k + 1) + '번 땅을 저장하지 못했어요'); });
      });
    }, 1500);
  }
  function stepDrops(dt) {
    if (!DROPS.length) return;
    var got = false, px = P.x, py = P.y + 1.3, pz = P.z;
    for (var i = 0; i < DROPS.length; i++) {
      var o = DROPS[i]; if (o.dead) continue;
      o.age += dt;
      var dx = px - o.x, dy = py - o.y, dz = pz - o.z, dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.001;
      var wait = o.full !== undefined && o.age - o.full < 3;   // 가방이 찼거나 버린 것은 잠깐 안 끌려옴
      if (o.age > 300) { dropAway(o); continue; }   // 5분 지나면 사라짐
      if (o.manna && (dayT % DAY_LEN) / DAY_LEN > 0.3) { dropAway(o); continue; }   // 햇볕이 뜨겁게 쬐면 스러짐(출 16:21)
      if (!wait && !o.thrown && (dist > 28 || o.age > 30)) { if (collectDrop(o, true)) got = true; continue; }
      if (!wait && o.age > 0.35 && (o.thrown ? dist < 1.4 : (dist < 3.4 || o.age > 6))) {
        var spd = Math.min(32, 7 + (3.4 - Math.min(dist, 3.4)) * 9 + (o.age > 6 ? 12 : 0));
        o.x += dx / dist * spd * dt; o.y += dy / dist * spd * dt; o.z += dz / dist * spd * dt;
        if (dist < 0.9) { got = true; if (!collectDrop(o)) { o.vx = (Math.random() - 0.5) * 3; o.vz = (Math.random() - 0.5) * 3; o.vy = 3; } continue; }
      } else {
        o.vy -= 22 * dt;
        var nx = o.x + o.vx * dt, nz = o.z + o.vz * dt, ny = o.y + o.vy * dt;
        if (isSolid(get(Math.floor(nx), Math.floor(o.y), Math.floor(nz))) && !SHAPE[get(Math.floor(nx), Math.floor(o.y), Math.floor(nz))]) { nx = o.x; nz = o.z; o.vx = o.vz = 0; }
        var below = get(Math.floor(nx), Math.floor(ny - 0.18), Math.floor(nz));
        if (o.vy < 0 && isSolid(below)) { ny = Math.floor(ny - 0.18) + 1.18; o.vy = 0; o.vx *= 0.6; o.vz *= 0.6; }
        o.x = nx; o.y = ny; o.z = nz;
      }
      o.rot += dt * 1.8;
      o.m.position.set(o.x, o.y + Math.sin(o.age * 3) * 0.06, o.z); o.m.rotation.y = o.rot;
    }
    DROPS = DROPS.filter(function (o) { return !o.dead; });
    if (got) bagChanged();
  }
  // ════════ 7) 모래·자갈은 받침이 없으면 떨어진다 ════════
  var FALLS = [], fallRes = {}, fallGeo = {};
  function isGrav(id) { return id === SAND || id === 18; }
  function fallThrough(b) { return b === AIR || b === WATER || kind(b) === 'plant'; }
  function startFall(x, y, z) {
    var id = get(x, y, z); if (!isGrav(id)) return;
    if (!fallThrough(get(x, y - 1, z)) || fallRes[x + ',' + (y - 1) + ',' + z]) return;
    setBlock(x, y, z, AIR);
    var ly = y; while (ly - 1 >= 1 && fallThrough(get(x, ly - 1, z)) && !fallRes[x + ',' + (ly - 1) + ',' + z]) ly--;
    fallRes[x + ',' + ly + ',' + z] = 1;
    dropMats();
    var m = new THREE.Mesh(fallGeo[id] || (fallGeo[id] = blockGeometry(id)), dropMatB); m.position.set(x + 0.5, y + 0.5, z + 0.5); scene.add(m);
    FALLS.push({ id: id, x: x, z: z, y: y, ty: ly, vy: 0, m: m });
    if (isGrav(get(x, y + 1, z))) startFall(x, y + 1, z);
  }
  function stepFalls(dt) {
    for (var i = FALLS.length - 1; i >= 0; i--) {
      var f = FALLS[i]; f.vy -= 30 * dt; f.y += f.vy * dt;
      if (f.y <= f.ty) {
        scene.remove(f.m); FALLS.splice(i, 1); delete fallRes[f.x + ',' + f.ty + ',' + f.z];
        var cur = get(f.x, f.ty, f.z), x = f.x, y = f.ty, z = f.z;
        var onMe = x + 1 > P.x - HW && x < P.x + HW && y + 1 > P.y && y < P.y + HT && z + 1 > P.z - HW && z < P.z + HW;
        if (fallThrough(cur) && !onMe) { if (kind(cur) === 'plant') dropItem(x + 0.5, y + 1.2, z + 0.5, dropOf(cur), 1); setBlock(x, y, z, f.id); sfx('place', matSound(f.id)); }
        else dropItem(x + 0.5, y + 1.2, z + 0.5, f.id, 1);
        continue;
      }
      f.m.position.y = f.y + 0.5;
    }
  }
  var SAPS = [];
  try { SAPS = JSON.parse(localStorage.getItem('arkVillage.saps') || '[]') || []; } catch (e) { SAPS = []; }
  function saveSaps() { try { localStorage.setItem('arkVillage.saps', JSON.stringify(SAPS)); } catch (e) {} }
  // 블록 여러 개를 한꺼번에 바꾸고 그림은 한 번만 다시 그림
  function setQuiet(x, y, z, id) { setRaw(x, y, z, id); plotWrite(x, y, z, id); if (plotAt(x, z) < 0) recordEdit(x, y, z, id); var c0 = colAt(x, z); if (c0) c0.mod = true; netEdit(x, y, z, id); }
  function rebuildBox(x0, y0, z0, x1, y1, z1) {
    for (var cz = Math.floor(z0 / CS); cz <= Math.floor(z1 / CS); cz++) for (var cx = Math.floor(x0 / CS); cx <= Math.floor(x1 / CS); cx++) {
      if (!inWorldC(cx, cz) || !meshedCols[cz * NC + cx]) continue;
      for (var cy = Math.max(0, Math.floor(y0 / CS)); cy <= Math.min(CY - 1, Math.floor(y1 / CS)); cy++) buildChunk(cx, cy, cz);
    }
  }
  function growTree(x, y, z) {
    var hgt = 5 + (hash2(x, z, 51) * 2 | 0), p0 = plotAt(x, z);
    function ok(cx, cy, cz) { return !inArk(cx, cy, cz) && plotAt(cx, cz) === p0 && !(p0 < 0 && inTown(cx, cz) && cy >= G - 4) && cy < (p0 >= 0 ? G + PH : SY - 1) && get(cx, cy, cz) === AIR; }
    for (var k = 1; k < hgt; k++) if (!ok(x, y + k, z)) return false;
    for (k = 0; k < hgt; k++) setQuiet(x, y + k, z, LOG);
    for (var ly = hgt - 2; ly <= hgt + 1; ly++) {
      var rr = ly >= hgt ? 1 : 2;
      for (var dz = -rr; dz <= rr; dz++) for (var dx = -rr; dx <= rr; dx++) {
        if (rr === 2 && Math.abs(dx) === 2 && Math.abs(dz) === 2) continue;
        if (ly === hgt + 1 && dx && dz) continue;
        if (ok(x + dx, y + ly, z + dz)) setQuiet(x + dx, y + ly, z + dz, LEAF);
      }
    }
    updateSky(x, z); for (var sz = -2; sz <= 2; sz++) for (var sx = -2; sx <= 2; sx++) updateSky(x + sx, z + sz);
    rebuildBox(x - 3, y - 1, z - 3, x + 3, y + hgt + 2, z + 3);
    if (p0 >= 0 && p0 === myPlot) markDirty();
    return true;
  }
  setInterval(function () {
    if (!SAPS.length) return;
    var now = Date.now(), ch = false;
    SAPS = SAPS.filter(function (sp) {
      if (sp.t > now || !colAt(sp.x, sp.z)) return true;
      if (get(sp.x, sp.y, sp.z) !== SAPLING) { ch = true; return false; }
      if (growTree(sp.x, sp.y, sp.z)) { ch = true; if (Math.hypot(sp.x - P.x, sp.z - P.z) < 40) toast('🌳 묘목이 나무로 자랐어요'); return false; }
      sp.t = now + 30000; ch = true; return true;
    });
    if (ch) saveSaps();
  }, 2000);
  function stepBits(dt) {
    for (var i = bits.length - 1; i >= 0; i--) {
      var m = bits[i], d = m.userData;
      d.life -= dt; d.vy -= 30 * dt;
      m.position.x += d.vx * dt; m.position.y += d.vy * dt; m.position.z += d.vz * dt;
      if (isSolid(get(Math.floor(m.position.x), Math.floor(m.position.y), Math.floor(m.position.z)))) { d.vy = 0; d.vx *= 0.5; d.vz *= 0.5; m.position.y = Math.ceil(m.position.y) + 0.01; }
      m.scale.setScalar(Math.max(0.01, Math.min(1, d.life * 2)) * (d.s0 || 1));
      if (d.life <= 0) { scene.remove(m); bits.splice(i, 1); }
    }
  }

