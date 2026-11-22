  // ───────── 블록 ─────────
  // [이름, 위 무늬, 옆 무늬, 아래 무늬, 투명(0/1), 빛(0/1), 종류('plant'|'water')]
  var B = [
    null,
    ['풀', 'grassTop', 'grassSide', 'dirt'],
    ['흙', 'dirt', 'dirt', 'dirt'],
    ['돌', 'stone', 'stone', 'stone'],
    ['모래', 'sand', 'sand', 'sand'],
    ['고페르 나무', 'plankG', 'plankG', 'plankG'],
    ['역청 칠한 나무', 'plankP', 'plankP', 'plankP'],
    ['통나무', 'logTop', 'logSide', 'logTop'],
    ['나뭇잎', 'leaves', 'leaves', 'leaves'],
    ['유리', 'glass', 'glass', 'glass', 1],
    ['등불', 'lampTop', 'lamp', 'lampTop', 0, 1],
    ['흰 벽', 'plaster', 'plaster', 'plaster'],
    ['붉은 벽돌', 'brick', 'brick', 'brick'],
    ['기와', 'roof', 'roof', 'roof'],
    ['하늘색 천', 'clothB', 'clothB', 'clothB'],
    ['노란 천', 'clothY', 'clothY', 'clothY'],
    ['분홍 천', 'clothP', 'clothP', 'clothP'],
    ['초록 천', 'clothG', 'clothG', 'clothG'],
    ['자갈길', 'gravel', 'gravel', 'gravel'],
    ['꽃밭', 'flowerTop', 'grassSide', 'dirt'],
    ['흙벽돌', 'mudbrick', 'mudbrick', 'mudbrick'],
    ['석회암', 'limestone', 'limestone', 'limestone'],
    ['갈대 지붕', 'thatch', 'thatch', 'thatch'],
    ['검은 돌', 'basalt', 'basalt', 'basalt'],
    ['물', 'water', 'water', 'water', 1, 0, 'water'],
    ['갈대', 'reed', 'reed', 'reed', 1, 0, 'plant'],
    ['진흙', 'clay', 'clay', 'clay'],
    ['역청', 'tar', 'tar', 'tar'],
    ['들꽃', 'flowerPlant', 'flowerPlant', 'flowerPlant', 1, 0, 'plant'],
    ['눈', 'snow', 'snowSide', 'stone']
  ];
  var AIR = 0, GRASS = 1, DIRT = 2, STONE = 3, SAND = 4, GOPHER = 5, PITCH = 6, LOG = 7, LEAF = 8, GLASS = 9, LAMP = 10,
      LIME = 21, BASALT = 23, WATER = 24, REED = 25, CLAY = 26, TAR = 27, FLOWER = 28, PATH = 18, BRICK = 12, SNOW = 29;
  // 광석·용광로·금속 블록(30~38), 덩이·막대기(70~74), 도구(80~95: 곡괭이·도끼·삽·칼 × 나무·돌·구리·철)
  var ORE_CU = 30, ORE_FE = 31, ORE_AG = 32, ORE_AU = 33, FURNACE = 34, BLK_CU = 35, BLK_FE = 36, BLK_AG = 37, BLK_AU = 38;
  var ING_CU = 70, ING_FE = 71, ING_AG = 72, ING_AU = 73, STICK = 74, TOOL0 = 80;
  // 마인크래프트처럼 더한 것: 석탄 광석(39), 호마노·청옥·금강석 광석, 보석 블록, 횃불, 깊은 돌(100~108), 석탄·숯·보석(75~79), 금강석 도구(120~123)
  var ORE_COAL = 39, ORE_ONYX = 100, ORE_SAPH = 101, ORE_DIA = 102, BLK_COAL = 103, BLK_ONYX = 104, BLK_SAPH = 105, BLK_DIA = 106, TORCH = 107, DEEP = 108;
  var COAL = 75, CHAR = 76, GEM_ONYX = 77, GEM_SAPH = 78, GEM_DIA = 79, TOOL4 = 120, TOOL_ONYX = 380;   // 11/20 호마노 도구(철과 금강석 사이)
  var DEEPV = {};   // 보통 광석 → 깊은 돌 속 광석(같은 것이 나오지만 더 단단함)
  [ORE_COAL, ORE_CU, ORE_FE, ORE_AG, ORE_ONYX, ORE_AU, ORE_SAPH, ORE_DIA].forEach(function (o, i) { DEEPV[o] = 109 + i; });
  B[ORE_COAL] = ['석탄 광석', 'oreCoal', 'oreCoal', 'oreCoal']; B[ORE_ONYX] = ['호마노 광석', 'oreOnyx', 'oreOnyx', 'oreOnyx'];
  B[ORE_SAPH] = ['청옥 광석', 'oreSapphire', 'oreSapphire', 'oreSapphire']; B[ORE_DIA] = ['금강석 광석', 'oreDiamond', 'oreDiamond', 'oreDiamond'];
  B[BLK_COAL] = ['석탄 블록', 'blkCoal', 'blkCoal', 'blkCoal']; B[BLK_ONYX] = ['호마노 블록', 'blkOnyx', 'blkOnyx', 'blkOnyx'];
  B[BLK_SAPH] = ['청옥 블록', 'blkSapphire', 'blkSapphire', 'blkSapphire']; B[BLK_DIA] = ['금강석 블록', 'blkDiamond', 'blkDiamond', 'blkDiamond'];
  B[TORCH] = ['횃불', 'torch', 'torch', 'torch', 1, 1, 'plant'];
  // 묘목(117), 불 켠 용광로(118), 감람나무 잎(119), 사닥다리(124~127, 방향 4), 궤(128)
  var SAPLING = 117, FURNACE_ON = 118, OLIVE = 119, LADDER = 124, CHEST = 128, SADDLE = 129;
  B[SADDLE] = ['안장', 'saddle', 'saddle', 'saddle', 0, 0, 'item'];
  // 제작대(130)·가죽(131)·양털(132)·옷(140~158): 제작대에서 만들어 입는다
  var CRAFT = 130, LEATHER = 131, WOOL = 132;
  B[LEATHER] = ['가죽', 'leather', 'leather', 'leather', 0, 0, 'item'];
  B[WOOL] = ['양털', 'wool', 'wool', 'wool', 0, 0, 'item'];
  B[CRAFT] = ['제작대', 'craftTop', 'craftSide', B[GOPHER][3]];
  // [번호, 이름, 칸, 색, 모양, 구절] — 모양 끝의 G는 금 테두리(하나님의 전신 갑주, 엡 6:13-17)
  var WEARS = [
    [140, '가죽 모자', 'head', 0x8a5a32, 'cap', ''],
    [141, '놋 투구', 'head', 0xc8843a, 'helm', '삼상 17:38'],
    [142, '철 투구', 'head', 0xc8ccd2, 'helm', ''],
    [143, '순금 관', 'head', 0xf0c840, 'crown', '시 21:3'],
    [144, '구원의 투구', 'head', 0xe8eef5, 'helmG', '엡 6:17'],
    [145, '가죽옷', 'body', 0x8a5a32, 'tunic', '창 3:21'],
    [146, '양털 옷', 'body', 0xf2efe6, 'tunic', ''],
    [147, '채색옷', 'body', 0xd04a3a, 'stripe', '창 37:3'],
    [148, '놋 갑옷', 'body', 0xc8843a, 'mail', '삼상 17:38'],
    [149, '철 갑옷', 'body', 0xc8ccd2, 'mail', ''],
    [150, '의의 호심경', 'body', 0xe8eef5, 'plateG', '엡 6:14'],
    [151, '가죽 띠', 'belt', 0x6a3e1c, 'belt', '왕하 1:8'],
    [152, '진리의 허리 띠', 'belt', 0xf0d070, 'beltG', '엡 6:14'],
    [153, '가죽 신', 'feet', 0x7a4a26, 'boot', ''],
    [154, '나무 신', 'feet', 0xa77a48, 'boot', ''],
    [155, '평안의 복음의 신', 'feet', 0xe8eef5, 'bootG', '엡 6:15'],
    [156, '나무 방패', 'shield', 0xa77a48, 'shield', ''],
    [157, '철 방패', 'shield', 0xc8ccd2, 'shield', ''],
    [158, '믿음의 방패', 'shield', 0xe8eef5, 'shieldG', '엡 6:16']
  ];
  // 11/20 광물로 만드는 무기·방패 일곱 단계: 돌 < 구리 < 은 < 금 < 호마노 < 청옥 < 금강석
  var ARM_MATS = ['돌', '구리', '은', '금', '호마노', '청옥', '금강석'], ARM_COL = [0x8f8f8b, 0xc8743a, 0xe8eef5, 0xf3c83c, 0xb57ad8, 0x4a78e0, 0x6ff0e6];
  var ARM_SWORD0 = 256, ARM_SLING0 = 263, ARM_SHIELD0 = 270, ARM_BOW0 = 277, ARM_ARROW0 = 284;
  var ARM_SWORD_DMG = [2.5, 3, 3.5, 4, 4.5, 5, 6], ARM_SLING_DMG = [2, 2.5, 3, 3.5, 4, 4.5, 5.5], ARM_BOW_BONUS = [0, 0.3, 0.6, 0.9, 1.2, 1.5, 2], ARM_ARROW_DMG = [1.5, 1.8, 2.1, 2.4, 2.8, 3.2, 3.8];
  var ARM_SHIELD_BLOCK = [0.45, 0.55, 0.62, 0.7, 0.8, 0.88, 0.95], ARM_SHIELD_GUARD = [0.08, 0.1, 0.11, 0.12, 0.14, 0.16, 0.18];   // 불화살을 앞에서 막는 확률 · 맞을 때 줄여 주는 몫
  ARM_MATS.forEach(function (n, m) { WEARS.push([ARM_SHIELD0 + m, n + ' 방패', 'shield', ARM_COL[m], 'shield', '']); });
  function armOf(id, base) { var m = id - base; return m >= 0 && m < 7 ? m : -1; }
  function isArmSword(id) { return armOf(id, ARM_SWORD0) >= 0; }
  function isSlingId(id) { return id === SLING || armOf(id, ARM_SLING0) >= 0; }
  function isBowId(id) { return id === BOW || armOf(id, ARM_BOW0) >= 0; }
  function isArrowId(id) { return id === ARROW || armOf(id, ARM_ARROW0) >= 0; }
  var WEARINFO = {}, SLOTS = ['head', 'body', 'belt', 'feet', 'shield'], SLOT_NAME = { head: '머리', body: '몸', belt: '허리', feet: '발', shield: '방패' };
  WEARS.forEach(function (w) { WEARINFO[w[0]] = { slot: w[1 + 1], col: w[3], shape: w[4], ref: w[5] }; B[w[0]] = [w[1], 'wear' + w[0], 'wear' + w[0], 'wear' + w[0], 0, 0, 'item']; });
  B[SAPLING] = ['묘목', 'sapling', 'sapling', 'sapling', 1, 0, 'plant'];
  B[FURNACE_ON] = ['용광로', 'furnaceTop', 'furnaceOn', 'furnaceTop'];
  B[OLIVE] = ['감람나무 잎', 'oliveLeaf', 'oliveLeaf', 'oliveLeaf', 0, 0, 'item'];
  B[CHEST] = ['궤', 'chestTop', 'chestSide', 'chestTop'];
  var LIGHTS = {}; LIGHTS[LAMP] = 1; LIGHTS[TORCH] = 1; LIGHTS[FURNACE_ON] = 1;   // 빛을 내는 것
  for (var wl = 170; wl < 174; wl++) LIGHTS[wl] = 1;   // 벽 횃불
  LIGHTS[199] = 1;   // 등롱
  LIGHTS[212] = 1;   // 켜진 등잔대
  B[DEEP] = ['깊은 돌', 'deepStone', 'deepStone', 'deepStone'];
  [[COAL, '석탄', 'coal'], [CHAR, '숯', 'charcoal'], [GEM_ONYX, '호마노', 'gemOnyx'], [GEM_SAPH, '청옥', 'gemSapphire'], [GEM_DIA, '금강석', 'gemDiamond']].forEach(function (it) { B[it[0]] = [it[1], it[2], it[2], it[2], 0, 0, 'item']; });
  B[ORE_CU] = ['구리 광석', 'oreCopper', 'oreCopper', 'oreCopper']; B[ORE_FE] = ['철 광석', 'oreIron', 'oreIron', 'oreIron'];
  B[ORE_AG] = ['은 광석', 'oreSilver', 'oreSilver', 'oreSilver']; B[ORE_AU] = ['금 광석', 'oreGold', 'oreGold', 'oreGold'];
  for (var dvk in DEEPV) { var dv = DEEPV[dvk], t0 = B[dvk][1]; B[dv] = ['깊은 ' + B[dvk][0], t0 + 'Deep', t0 + 'Deep', t0 + 'Deep']; }
  B[FURNACE] = ['용광로', 'furnaceTop', 'furnace', 'furnaceTop'];
  B[BLK_CU] = ['구리 블록', 'blkCopper', 'blkCopper', 'blkCopper']; B[BLK_FE] = ['철 블록', 'blkIron', 'blkIron', 'blkIron'];
  B[BLK_AG] = ['은 블록', 'blkSilver', 'blkSilver', 'blkSilver']; B[BLK_AU] = ['금 블록', 'blkGold', 'blkGold', 'blkGold'];
  [[ING_CU, '구리 덩이', 'ingotCopper'], [ING_FE, '철 덩이', 'ingotIron'], [ING_AG, '은 덩이', 'ingotSilver'], [ING_AU, '금 덩이', 'ingotGold'], [STICK, '막대기', 'stick']].forEach(function (it) { B[it[0]] = [it[1], it[2], it[2], it[2], 0, 0, 'item']; });
  var TOOL_TYPES = ['pick', 'axe', 'shovel', 'knife'], TOOL_TNAME = ['곡괭이', '도끼', '삽', '칼'], TIER_NAME = ['나무', '돌', '구리', '철', '호마노', '금강석'];
  function toolId(type, tier) { var ti = TOOL_TYPES.indexOf(type); return tier < 4 ? TOOL0 + ti * 4 + tier : (tier === 4 ? TOOL_ONYX + ti : TOOL4 + ti); }   // tier 0~5(4=호마노, 5=금강석)
  TOOL_TYPES.forEach(function (type, ti) { for (var tier = 0; tier < 6; tier++) B[toolId(type, tier)] = [TIER_NAME[tier] + ' ' + TOOL_TNAME[ti], 'tool_' + type + tier, 'tool_' + type + tier, 'tool_' + type + tier, 0, 0, 'tool']; });
  function isItem(id) { var k = B[id] && B[id][6]; return k === 'item' || k === 'tool'; }
  // 모양 블록: 반 블록(40~42) · 계단(44~55, 방향 4) · 울타리(56) · 문(60~67, 방향 4 × 열림)
  // SHAPE[id] = { type, base(가방에 들어가는 번호), mat(무늬 블록), f(방향), open }
  var SHAPE = {}, SLAB_G = 40, SLAB_S = 41, SLAB_B = 42, STAIR_G = 44, STAIR_S = 48, STAIR_B = 52, FENCE = 56, DOOR = 60;
  function regShape(id, name, type, base, mat, f, open) {
    SHAPE[id] = { type: type, base: base, mat: mat, f: f || 0, open: !!open };
    B[id] = [name, B[mat][1], B[mat][2], B[mat][3], 0, 0, 'shape'];
  }
  regShape(SLAB_G, '고페르 반 블록', 'slab', SLAB_G, GOPHER); regShape(SLAB_S, '돌 반 블록', 'slab', SLAB_S, STONE); regShape(SLAB_B, '벽돌 반 블록', 'slab', SLAB_B, BRICK);
  [[STAIR_G, GOPHER, '고페르 계단'], [STAIR_S, STONE, '돌 계단'], [STAIR_B, BRICK, '벽돌 계단']].forEach(function (s) { for (var f = 0; f < 4; f++) regShape(s[0] + f, s[2], 'stair', s[0], s[1], f); });
  regShape(FENCE, '울타리', 'fence', FENCE, GOPHER);
  for (var lf = 0; lf < 4; lf++) { regShape(LADDER + lf, '사닥다리', 'ladder', LADDER, GOPHER, lf); B[LADDER + lf][1] = B[LADDER + lf][2] = B[LADDER + lf][3] = 'ladder'; }
  for (var df = 0; df < 4; df++) for (var dop = 0; dop < 2; dop++) { regShape(DOOR + df * 2 + dop, '나무 문', 'door', DOOR, GOPHER, df, dop); B[DOOR + df * 2 + dop][1] = B[DOOR + df * 2 + dop][2] = B[DOOR + df * 2 + dop][3] = 'door'; }
  // ── 2026-11-20 더한 것: 다락문(위로 여는 문)·액자 ──
  var TRAP = 900, FRAME = 916;
  for (var tf = 0; tf < 4; tf++) for (var th = 0; th < 2; th++) for (var to = 0; to < 2; to++) {
    var tid = TRAP + tf * 4 + th * 2 + to; if (B[tid]) throw new Error('블록 번호가 겹쳐요: ' + tid);
    regShape(tid, '다락문', 'trapdoor', TRAP, GOPHER, tf, to); SHAPE[tid].h = th; B[tid][1] = B[tid][2] = B[tid][3] = 'trapdoor';
  }
  for (var ff = 0; ff < 4; ff++) { if (B[FRAME + ff]) throw new Error('블록 번호가 겹쳐요: ' + (FRAME + ff)); regShape(FRAME + ff, '액자', 'frame', FRAME, GOPHER, ff); B[FRAME + ff][1] = B[FRAME + ff][2] = B[FRAME + ff][3] = 'frame'; }
  // ── 2026-11-20 레일(수레 길): 0 남북 · 1 동서 · 2 북-동 · 3 동-남 · 4 남-서 · 5 서-북 · 6~9 북·동·남·서로 올라가는 비탈 ──
  var RAIL0 = 940, CART = 950, RAILF0 = 960;   // RAILF0: 빠른 레일(금) — 지나가면 수레가 빨라짐
  var RAIL_TILE = ['railNS', 'railEW', 'railC2', 'railC3', 'railC4', 'railC5', 'railNS', 'railEW', 'railNS', 'railEW'];
  [[RAIL0, '레일', ''], [RAILF0, '빠른 레일', 'F']].forEach(function (rr) {
    for (var rs = 0; rs < 10; rs++) { var rid = rr[0] + rs; if (B[rid]) throw new Error('블록 번호가 겹쳐요: ' + rid); regShape(rid, rr[1], 'mrail', rr[0], STONE, rs); B[rid][1] = RAIL_TILE[rs] + rr[2]; B[rid][2] = B[rid][3] = 'railSide'; }
  });
  if (B[CART]) throw new Error('번호가 겹쳐요: ' + CART);
  // ── 2026-11-18 더한 것: 농사(159~166), 침대·레버·벽 횃불·유리판·표지판(167~178), 양털 블록(179~182), 반 블록·계단(183~192), 눕힌 통나무(193~194)
  var SEED = 159, WHEAT = 160, BREAD = 161, FIG = 162, CROP0 = 163, BED = 167, LEVER = 168, WTORCH = 170, PANE = 174, SIGN = 175;
  var WOOL_W = 179, WOOL_B = 180, WOOL_V = 181, WOOL_R = 182, SLAB_L = 183, SLAB_P = 184, STAIR_L = 185, STAIR_P = 189, LOG_X = 193, LOG_Z = 194;
  B[SEED] = ['밀 씨', 'seed', 'seed', 'seed', 0, 0, 'item']; B[WHEAT] = ['밀', 'wheat', 'wheat', 'wheat', 0, 0, 'item'];
  B[BREAD] = ['떡', 'bread', 'bread', 'bread', 0, 0, 'item']; B[FIG] = ['무화과', 'fig', 'fig', 'fig', 0, 0, 'item'];
  for (var cs0 = 0; cs0 < 4; cs0++) B[CROP0 + cs0] = ['밀(' + ['싹', '자람', '이삭', '익음'][cs0] + ')', 'crop' + cs0, 'crop' + cs0, 'crop' + cs0, 1, 0, 'plant'];
  B[WOOL_W] = ['흰 양털 블록', 'woolW', 'woolW', 'woolW']; B[WOOL_B] = ['청색 양털 블록', 'woolB', 'woolB', 'woolB'];
  B[WOOL_V] = ['자색 양털 블록', 'woolV', 'woolV', 'woolV']; B[WOOL_R] = ['홍색 양털 블록', 'woolR', 'woolR', 'woolR'];
  B[LOG_X] = ['통나무', 'logTop', 'logSideH', 'logSideH']; B[LOG_Z] = ['통나무', 'logTop', 'logSideH', 'logSideH'];
  var CHAIR = 510;
  var CHAIR_SEAT = .56;
  for (var cf = 0; cf < 4; cf++) regShape(CHAIR + cf, '나무 의자', 'chair', CHAIR, GOPHER, cf);
  regShape(BED, '침대', 'bed', BED, GOPHER); B[BED][1] = 'bedTop'; B[BED][2] = 'bedSide'; B[BED][3] = 'plankG';
  regShape(LEVER, '레버', 'lever', LEVER, STONE); regShape(LEVER + 1, '레버', 'lever', LEVER, STONE, 0, true); B[LEVER][1] = B[LEVER][2] = B[LEVER][3] = B[LEVER + 1][1] = B[LEVER + 1][2] = B[LEVER + 1][3] = 'lever';
  for (var wt = 0; wt < 4; wt++) { regShape(WTORCH + wt, '횃불', 'wtorch', TORCH, GOPHER, wt); B[WTORCH + wt][1] = B[WTORCH + wt][2] = B[WTORCH + wt][3] = 'wtorch'; B[WTORCH + wt][5] = 1; }
  regShape(PANE, '유리판', 'pane', PANE, GLASS);
  for (var sg = 0; sg < 4; sg++) regShape(SIGN + sg, '표지판', 'sign', SIGN, GOPHER, sg);
  regShape(SLAB_L, '석회암 반 블록', 'slab', SLAB_L, LIME); regShape(SLAB_P, '역청 나무 반 블록', 'slab', SLAB_P, PITCH);
  for (var sf = 0; sf < 4; sf++) { regShape(STAIR_L + sf, '석회암 계단', 'stair', STAIR_L, LIME, sf); regShape(STAIR_P + sf, '역청 나무 계단', 'stair', STAIR_P, PITCH, sf); }
  var SWORD = 195; B[SWORD] = ['성령의 검', 'sword', 'sword', 'sword', 0, 0, 'item'];   // 엡 6:17 — 어둠의 그림자를 물리침
  // 집 꾸미기(2026-11-18 대저택): 책장·돌 벽돌·카펫·등롱
  var SHELF = 196, SBRICK = 197, CARPET = 198, LANTERN = 199;
  B[SHELF] = ['책장', 'plankG', 'shelf', 'plankG']; B[SBRICK] = ['돌 벽돌', 'sbrick', 'sbrick', 'sbrick'];
  regShape(CARPET, '카펫', 'carpet', CARPET, WOOL_R); regShape(LANTERN, '등롱', 'lantern', LANTERN, GOPHER); B[LANTERN][1] = B[LANTERN][2] = B[LANTERN][3] = 'lantern'; B[LANTERN][5] = 1;
  // ── 「본향을 향하여」 이야기(2026-11-18): 열두 보석 광석(200~210), 보석(300~310), 기초석 블록(230~241),
  //    등잔대(211 꺼짐·212 켜짐), 진주 문(213), 기초석 자리(214), 정금 길(215), 성곽(216), 생명나무 잎(217) ──
  // [이름, 진한 색, 밝은 색, 나오는 곳(T.reg 또는 'any'), y 아래, y 위, 드물기, 곡괭이 단계]
  var GEMS = [
    ['벽옥', 0xa04030, 0xd06a50, 'west', 20, 60, 0.00012, 2], ['남보석', 0x2a4ab0, 0x6a8ae0, 'sea', 1, 14, 0.0002, 3],
    ['옥수', 0xc8c0b0, 0xe8eef8, 'lake', 1, 12, 0.00025, 2], ['녹보석', 0x1f8a4a, 0x60d090, 'east', 1, 12, 0.00012, 3],
    ['홍마노', 0xb0402e, 0xf0e0d0, 'desert', 1, 16, 0.00008, 2], ['홍보석', 0xc8102e, 0xff6a7a, 'desert', 1, 7, 0.0001, 4],
    ['황옥', 0xb8c030, 0xf0f080, 'oasis', 1, 14, 0.0006, 3], ['녹옥', 0x309a8a, 0x90e0d0, 'sea', 1, 8, 0.00015, 4],
    ['담황옥', 0xe0a840, 0xffe0a0, 'ararat', 55, 79, 0.00012, 3], ['비취옥', 0x70b030, 0xb8e888, 'ararat', 1, 10, 0.0001, 4],
    null /* 열한째 청옥은 원래 있는 청옥 */, ['자수정', 0x7a38a8, 0xc898f0, 'south', 1, 20, 0.00015, 3]
  ];
  // 11/20 땅속을 깊게(바닥 y -32): 원래 바닥 근처(y 1~)에서 나던 보석은 24칸 더 아래로
  GEMS.forEach(function (g) { if (g && g[4] === 1) { g[4] = -31; g[5] -= 24; } });
  var GEM_ORE0 = 200, GEM_ITEM0 = 300, FSTONE0 = 230, LAMPSTAND = 211, PEARL = 213, SOCKET = 214, GOLDST = 215, CITYWALL = 216, LIFELEAF = 217;
  var FS_NAMES = ['벽옥', '남보석', '옥수', '녹보석', '홍마노', '홍보석', '황옥', '녹옥', '담황옥', '비취옥', '청옥', '자수정'];
  function gemOre(i) { return i < 10 ? GEM_ORE0 + i : (i === 11 ? GEM_ORE0 + 10 : ORE_SAPH); }      // 열두 번째 자수정은 210
  function gemItem(i) { return i < 10 ? GEM_ITEM0 + i : (i === 11 ? GEM_ITEM0 + 10 : GEM_SAPH); }
  GEMS.forEach(function (g, i) { if (!g) return; B[gemOre(i)] = [g[0] + ' 광석', 'gemOre' + i, 'gemOre' + i, 'gemOre' + i]; B[gemItem(i)] = [g[0], 'gem' + i, 'gem' + i, 'gem' + i, 0, 0, 'item']; });
  FS_NAMES.forEach(function (n, i) { B[FSTONE0 + i] = [n + ' 기초석', 'fstone' + i, 'fstone' + i, 'fstone' + i]; });
  regShape(LAMPSTAND, '등잔대', 'lampstand', LAMPSTAND, GOPHER); regShape(LAMPSTAND + 1, '켜진 등잔대', 'lampstand', LAMPSTAND, GOPHER, 0, true);
  B[LAMPSTAND][1] = B[LAMPSTAND][2] = B[LAMPSTAND][3] = 'lampstand'; B[LAMPSTAND + 1][1] = B[LAMPSTAND + 1][2] = B[LAMPSTAND + 1][3] = 'lampstandLit'; B[LAMPSTAND + 1][5] = 1;
  B[PEARL] = ['진주 문', 'pearl', 'pearl', 'pearl', 0, 1]; B[SOCKET] = ['기초석 자리', 'socket', 'sbrick', 'sbrick'];
  B[GOLDST] = ['정금 길', 'goldst', 'goldst', 'goldst', 0, 1]; B[CITYWALL] = ['벽옥 성곽', 'citywall', 'citywall', 'citywall'];
  B[LIFELEAF] = ['생명나무 잎', 'lifeleaf', 'lifeleaf', 'lifeleaf'];
  // ── 남쪽 새 지역(11/20): 백향목 숲·광야·소금 바다의 자연 블록 — 캐면 원래 재료(통나무·소금·붉은 흙)로 가방에 들어간다(서버 허용 목록은 그대로) ──
  var CEDAR_LOG = 860, CEDAR_LEAF = 861, SALT_CRUST = 862, SALT_ROCK = 863, RED_ROCK = 864, RED_ROCK2 = 865;
  B[CEDAR_LOG] = ['백향목', 'cedarTop', 'cedarBark', 'cedarTop']; B[CEDAR_LEAF] = ['백향목 잎', 'cedarLeaf', 'cedarLeaf', 'cedarLeaf'];
  B[SALT_CRUST] = ['소금 땅', 'saltTop', 'saltSide', 'sand']; B[SALT_ROCK] = ['소금 바위', 'saltRock', 'saltRock', 'saltRock'];
  B[RED_ROCK] = ['붉은 바위', 'redRock', 'redRock', 'redRock']; B[RED_ROCK2] = ['붉은 바위 줄무늬', 'redRock2', 'redRock2', 'redRock2'];
  // 반 블록은 가방에는 아래쪽 번호 하나로, 세계에는 위아래 번호를 따로 저장한다.
  var SLABS = [[SLAB_G,GOPHER,242],[SLAB_S,STONE,243],[SLAB_B,BRICK,244],
    [SLAB_L,LIME,245],[SLAB_P,PITCH,246],[218,DIRT,247],[219,20,248],
    [220,11,249],[221,13,250],[222,22,251],[223,PATH,252],[224,GLASS,253],
    [225,WOOL_W,254],[226,WOOL_B,255],[227,WOOL_V,43],[228,WOOL_R,57],[229,LOG,58]];
  var SLAB_TOP = {}, SLAB_MATERIAL = {};
  SLABS.forEach(function (s) {
    var id = s[0], mat = s[1], upper = s[2];
    if (B[upper] || (id >= 218 && B[id])) throw new Error('반 블록 번호가 겹쳐요');
    if (!SHAPE[id]) regShape(id, B[mat][0] + ' 반 블록', 'slab', id, mat);
    regShape(upper, B[id][0], 'slab', id, mat, 1);
    SLAB_TOP[id] = upper; SLAB_MATERIAL[id] = mat;
  });
  // 건축 1묶음. 놓이는 번호는 기존 한 바이트 저장 범위 안에 둔다.
  var PILLAR = 96, ARCH = 97, RAIL = 98, FLAT_ROOF = 99;
  var BLUE_RUG = 134, GOLD_RUG = 135, REED_MAT = 136, FLAG = 137, PATTERN_CLOTH = 138;
  var GATE = 59, GATE_STATES = [[GATE, 68], [69, 133]];
  var SALT = 320, FLINT = 321, STRIKER = 322, MARBLE = 323, ALABASTER = 324, RED_EARTH = 325, SEA_PEARL = 326, CORAL = 327;
  var BUILD_BLOCKS = [
    [PILLAR, '대리석 기둥', 'marble', 'pillar', STONE],
    [ARCH, '설화석고 아치', 'alabaster', 'arch', LIME],
    [RAIL, '돌 난간', 'sbrick', 'rail', SBRICK],
    [FLAT_ROOF, '평평한 옥상 블록', 'roofFlat', 'roof', GOPHER],
    [BLUE_RUG, '파란 카펫', 'blueRug', 'carpet', WOOL_B],
    [GOLD_RUG, '황토색 카펫', 'goldRug', 'carpet', WOOL_W],
    [REED_MAT, '갈대 돗자리', 'reedMat', 'carpet', GOPHER],
    [FLAG, '천 깃발', 'villageFlag', 'flag', GOPHER],
    [PATTERN_CLOTH, '무늬 천', 'wovenCloth', 'cloth', GOPHER]
  ];
  var BUILD_ITEMS = [
    [SALT,'소금','saltCrystal'], [FLINT,'부싯돌','flintChip'], [STRIKER,'부시','striker'],
    [MARBLE,'대리석','marble'], [ALABASTER,'설화석고','alabaster'],
    [RED_EARTH,'붉은 흙','redEarth'], [SEA_PEARL,'바다 진주','seaPearl'], [CORAL,'산호','redCoral']
  ];
  function buildShape(id, name, texture, type, material, facing, open, base) {
    if (B[id]) throw new Error('건축 블록 번호가 겹쳐요: ' + id);
    regShape(id, name, type, base || id, material, facing, open);
    B[id][1] = B[id][2] = B[id][3] = texture;
  }
  BUILD_BLOCKS.forEach(function (d) { buildShape(d[0], d[1], d[2], d[3], d[4]); });
  GATE_STATES.forEach(function (states, axis) {
    states.forEach(function (id, open) { buildShape(id, '울타리 문', 'plankG', 'gate', GOPHER, axis, open, GATE); });
  });
  BUILD_ITEMS.forEach(function (d) {
    if (B[d[0]]) throw new Error('자원 번호가 겹쳐요: ' + d[0]);
    B[d[0]] = [d[1], d[2], d[2], d[2], 0, 0, 'item'];
  });
  // 2묶음. 설치물 400~457, 가방에만 들어가는 물건 600~637.
  var FARM_SOIL = 400, OVEN = 401, MILL = 402, WINE_PRESS = 403, OIL_PRESS = 404, COOK_POT = 405;
  var HOE = 624, FISH_ROD = 625, FISH_NET = 626, RAW_FISH = 627, RAW_LAMB = 628,
      HONEY = 629, POMEGRANATE = 630, STEW = 631, COOKED_FISH = 632, COOKED_LAMB = 633,
      FLATBREAD = 634, FLOUR = 635, WINE = 636, OLIVE_OIL = 637;
  var RAW_BEEF = 683, RAW_GOAT = 684, COOKED_BEEF = 685, COOKED_GOAT = 686, RAW_CHICKEN = 687, COOKED_CHICKEN = 688, FEATHER = 689, BONE = 690;   // 11/21 짐승을 잡으면 나오는 고기(창 9:3)
  // 이름, 거둘 것, 식물색, 열매색, 여러 번 거두는 작물, 나무 높이.
  var FARM_TYPES = [
    ['보리','보리',0x86a64b,0xc6a551], ['포도나무','포도',0x4b803e,0x75428b,true],
    ['올리브나무','올리브',0x78904b,0x353e33,true,2.2], ['렌틸','렌틸콩',0x508044,0xaf784d],
    ['오이','오이',0x557a39,0x91bf55], ['수박','수박',0x477c44,0x8cbe62],
    ['마늘','마늘',0x739044,0xd7d2ba], ['양파','양파',0x719943,0xb8824c],
    ['부추','부추',0x5c8e3e,0x97ab51], ['무화과나무','무화과',0x438648,0x95547d,true,2.2],
    ['종려나무','대추야자',0x558647,0xad6742,true,2.7], ['석류나무','석류',0x567d38,0xb64643,true,2.1]
  ];
  var FARM_PLANTS = {}, FARM_SEEDS = {};
  function expansionItem(id, name, tileName) { B[id] = [name,tileName,tileName,tileName,0,0,'item']; }
  function expansionBlock(id, name, tileName, light) { B[id] = [name,tileName,tileName,tileName,0,light || 0]; if (light) LIGHTS[id] = 1; }
  expansionBlock(FARM_SOIL, '경작지', 'tilled');
  [[OVEN,'화덕과 솥','oven2'], [MILL,'맷돌','mill2'], [WINE_PRESS,'포도주 틀','wine2'], [OIL_PRESS,'기름 짜는 틀','oil2'],[COOK_POT,'솥','pot2']]
    .forEach(function(d) { expansionBlock(d[0],d[1],d[2]); });
  var VILLAGE_FISH={ '강':680, '호수':681, '바다':682 };
  var MANNA = 545;   // 광야의 만나(출 16장)
  var FOOD_ART = [[MANNA,'만나',0xf3efdc],[680,'강의 은빛 물고기',0x84b1ac],[681,'호수의 줄무늬 물고기',0x76a495],[682,'바다의 푸른 물고기',0x527b9c],
    [HOE,'괭이',0x92754c],[FISH_ROD,'낚싯대',0xa98555],[FISH_NET,'그물',0xc8b787],
    [RAW_FISH,'물고기',0x8a9fa9],[RAW_LAMB,'손질한 양고기',0xc77968],[HONEY,'꿀',0xdfa437],
    [POMEGRANATE,'석류',0xb64643],[STEW,'렌틸콩죽',0xaa5c3d],[COOKED_FISH,'구운 생선',0xb77b41],
    [COOKED_LAMB,'구운 양고기',0x9e5940],[FLATBREAD,'누룩 없는 빵',0xddb475],
    [FLOUR,'가루',0xebd8b3],[WINE,'포도주',0x803b56],[OLIVE_OIL,'올리브 기름',0x9e8e43],
    [RAW_BEEF,'소고기',0xc0554a],[RAW_GOAT,'염소고기',0xb8695a],[COOKED_BEEF,'구운 소고기',0x8e4a30],[COOKED_GOAT,'구운 염소고기',0x9a5a3a],
    [RAW_CHICKEN,'닭고기',0xe8b8a0],[COOKED_CHICKEN,'구운 닭고기',0xc0844a],[FEATHER,'깃털',0xf6f2ea],[BONE,'뼈',0xe8e2cc]];
  FOOD_ART.forEach(function(d) { expansionItem(d[0],d[1],'farmItem'+d[0]); });
  FARM_TYPES.forEach(function(d, i) {
    var spec = { base:410+i*4, seed:600+i, harvest:i===9 ? FIG : (i===11 ? POMEGRANATE : 612+i), perennial:!!d[4], height:d[5] || 1 };
    FARM_SEEDS[spec.seed] = spec;
    expansionItem(spec.seed,d[0]+(d[4] ? ' 묘목' : ' 씨'),'farmSeed'+i);
    if (i!==9 && i!==11) expansionItem(spec.harvest,d[1],'farmFruit'+i);
    for (var s=0; s<4; s++) {
      var id=spec.base+s, art='farmPlant'+i+'_'+s;
      B[id]=[d[0]+' · '+['싹','자라는 중','열매 맺는 중','다 자람'][s],art,art,art,1,0,'plant'];
      FARM_PLANTS[id]=spec;
    }
  });
  function drawExpansionTiles() {
    function icon(name,color,mode) {
      tile(name,function(px,R) {
        clear(px);
        for(var y=2;y<14;y++) for(var x=2;x<14;x++) {
          var dx=x-7.5,dy=y-7.5;
          var hit=mode==='rod' ? Math.abs(x+y-15)<1.5 || (x===12&&y<11) :
            mode==='net' ? (Math.abs(dx)<5 && Math.abs(dy)<5 && ((x+y)%4===0 || (x-y+16)%4===0 || Math.abs(dx)>3 || Math.abs(dy)>3)) :
            mode==='seed' ? dx*dx+dy*dy*2<22 : dx*dx+dy*dy<31;
          if(hit) px(x,y,color,.87+R()*.22);
        }
      });
    }
    [['tilled',0x69432e],['oven2',0xb06846],['mill2',0x9a9285],['wine2',0x865545],['oil2',0x817149],['pot2',0x5a4a40]].forEach(function(d,i) {
      tile(d[0],function(px,R) {
        for(var y=0;y<16;y++) for(var x=0;x<16;x++) {
          var groove=i===0 ? x%4===0 : (i===1 ? y>8&&x>3&&x<12 : Math.hypot(x-7.5,y-7.5)<4);
          px(x,y,d[1],(groove?.64:.96)+R()*.12);
        }
      });
    });
    FOOD_ART.forEach(function(d){icon('farmItem'+d[0],d[2],d[0]===FISH_ROD||d[0]===HOE?'rod':d[0]===FISH_NET?'net':'food');});
    FARM_TYPES.forEach(function(d,i) {
      icon('farmSeed'+i,d[3],'seed'); icon('farmFruit'+i,d[3],'food');
      for(var s=0;s<4;s++) (function(stage) {
        tile('farmPlant'+i+'_'+stage,function(px,R){
          clear(px);
          for(var y=15;y>=11-stage*3;y--) {
            px(7,y,d[5]?0x725438:d[2]);px(8,y,d[5]?0x725438:d[2]);
            if(y>12&&!d[5]) continue;
            var w=Math.min(6,1+stage+(y%3));
            for(var x=8-w;x<8+w;x++) if((x+y+i)%4!==0) px(x,y,stage===3&&(x+2*y)%5===0?d[3]:d[2],.84+R()*.23);
          }
        });
      })(s);
    });
    drawLifeAndWordTiles();
  }
  // 3묶음. 우물·베틀·그릇·조명·식물은 같은 설치/저장 규칙을 쓴다.
  var WELL=460, LOOM=461, JAR=462, OIL_JAR=463, ALABASTER_JAR=464, OIL_LAMP=465,
      CANDLESTICK=466, CAMPFIRE=467, THORN=468, THISTLE=469, LILY=470,
      LYRE=540, HARP=541, TIMBREL=542, CYMBAL=543, MANGER=548;   // 악기(시 150:3-5) · 구유(성탄)
  var BUCKET=640, WATER_BUCKET=641, WATER_JAR=642, FULL_JAR=643, THREAD=644,
      LINEN=645, WOOL_CLOTH=646, RED_DYE=647, BLUE_DYE=648, GOLD_DYE=649, WELL_BUCKET=650;
  var LIFE_BLOCKS=[
    [WELL,'우물',0x968778,'well'], [LOOM,'베틀',0xa38357,'loom'],
    [JAR,'항아리',0xb46e52,'jar'], [OIL_JAR,'기름 항아리',0x998451,'jar'],
    [ALABASTER_JAR,'옥합',0xe2bb91,'jar'],[OIL_LAMP,'기름 등잔',0xe89e40,'lamp',1],
    [CANDLESTICK,'촛대',0xd8a258,'stand',1],[CAMPFIRE,'모닥불',0xe57c39,'camp',1],
    [THORN,'가시나무',0x656838,'plant'],[THISTLE,'엉겅퀴',0x884d8b,'plant'],[LILY,'백합',0xf5e4a4,'plant'],
    [MANGER,'구유',0xb38550,'manger',1],[LYRE,'수금',0xb8874a,'lyre'],[HARP,'비파',0x8f5f34,'harp'],[TIMBREL,'소고',0xd9b27a,'drum'],[CYMBAL,'제금',0xd2ad3c,'cymbal']
  ];
  var LIFE_ITEMS=[
    [BUCKET,'빈 양동이',0x9e7745],[WATER_BUCKET,'물이 든 양동이',0x4698c8],
    [WATER_JAR,'빈 물동이',0xae6651],[FULL_JAR,'물이 든 물동이',0x6794a5],
    [THREAD,'실',0xecddbb],[LINEN,'베',0xe6ccb1],[WOOL_CLOTH,'모직',0xb59174],
    [RED_DYE,'붉은 염료',0xa34138],[BLUE_DYE,'푸른 염료',0x38678e],[GOLD_DYE,'황토 염료',0xc5a146],
    [WELL_BUCKET,'두레박',0x856746]
  ];
  var EXT_BOXES={
    ditch:[[0,0,0,1,.10,1]],
    feast:[[.08,.64,.08,.92,.78,.92],[.12,0,.12,.27,.64,.27],[.73,0,.12,.88,.64,.27],
      [.12,0,.73,.27,.64,.88],[.73,0,.73,.88,.64,.88]],
    well:[[0,0,0,1,.22,1],[0,.22,0,.21,.72,1],[.79,.22,0,1,.72,1],[.21,.22,0,.79,.72,.21],[.21,.22,.79,.79,.72,1]],
    loom:[[.12,0,.26,.22,1,.63],[.78,0,.26,.88,1,.63],[.22,.22,.40,.78,.73,.49],[.22,.84,.34,.78,1,.57]],
    jar:[[.24,0,.24,.76,.18,.76],[.15,.18,.15,.85,.66,.85],[.31,.66,.31,.69,.9,.69]],
    lamp:[[.2,0,.22,.8,.14,.78],[.34,.14,.34,.66,.23,.66],[.45,.23,.45,.55,.41,.55]],
    stand:[[.19,0,.19,.81,.12,.81],[.43,.12,.43,.57,.6,.57],[.24,.6,.24,.76,.7,.76],[.44,.7,.44,.56,.94,.56]],
    camp:[[.08,0,.08,.92,.12,.92],[.23,.12,.25,.76,.24,.75],[.32,.24,.33,.68,.6,.67]],
    manger:[[.12,.3,.22,.88,.62,.78],[.14,0,.26,.24,.3,.36],[.76,0,.26,.86,.3,.36],[.14,0,.64,.24,.3,.74],[.76,0,.64,.86,.3,.74],[.2,.62,.3,.8,.7,.7]],
    lyre:[[.28,0,.38,.72,.1,.62],[.28,.1,.44,.38,.86,.56],[.62,.1,.44,.72,.86,.56],[.28,.78,.44,.72,.88,.56],[.46,.1,.48,.54,.78,.52]],
    harp:[[.2,0,.34,.8,.12,.66],[.2,.12,.42,.32,.96,.58],[.2,.86,.42,.8,.96,.58],[.68,.12,.42,.8,.86,.58]],
    drum:[[.16,0,.16,.84,.2,.84],[.22,.2,.22,.78,.24,.78]],
    cymbal:[[.45,0,.45,.55,.5,.55],[.2,.5,.2,.8,.56,.8],[.26,.62,.26,.74,.66,.74]]
  };
  LIFE_BLOCKS.forEach(function(d){
    var id=d[0], art='life'+id;
    if(d[3]==='plant') B[id]=[d[1],art,art,art,1,0,'plant'];
    else { buildShape(id,d[1],art,'extension',STONE); SHAPE[id].boxes=d[3]; if(d[4]) { B[id][5]=1; LIGHTS[id]=1; } }
  });
  LIFE_ITEMS.forEach(function(d){ expansionItem(d[0],d[1],'life'+d[0]); });
  function drawLifeAndWordTiles() {
    LIFE_BLOCKS.concat(LIFE_ITEMS).forEach(function(d){
      tile('life'+d[0],function(px,R){
        var plant=d[3]==='plant', item=d[0]>=640;
        if(plant||item) clear(px);
        for(var y=0;y<16;y++) for(var x=0;x<16;x++) {
          var dx=x-7.5, dy=y-7.5;
          if(plant && !(Math.abs(dx)<1.1 || (y>5&&y<13&&Math.abs(dx)<4&&(x+y)%3===0) ||
            (d[0]!==THORN&&y>=3&&y<=6&&Math.abs(dx)<3))) continue;
          if(item && (Math.abs(dx) + Math.abs(dy)*.7 > 6.5)) continue;
          var color=plant && y>6 ? 0x568348 : d[2];
          px(x,y,color,.82+R()*.22+((x+y)%4===0?.1:0));
        }
      });
    });
    drawWordTiles(); drawBowTiles(); drawArmTiles();
  }
  // 4묶음. 말씀·양 돌보기·길 찾기.
  var FIND_MARK=500, FIND_POT=501, FIND_LAMP=502, FIND_SEED=503, DITCH=504, FEAST_TABLE=505,
      FEAST_BREAD=506, FEAST_OLIVE=507, FEAST_FISH=508, FERRY_POST=509;
  var VILLAGE_ART = [
    [FIND_MARK,'발굴 자리','sand','target'], [FIND_POT,'토기 조각 전시','stone','jar'],
    [FIND_LAMP,'옛 등잔 전시','clay','lamp'], [FIND_SEED,'옛 씨앗 전시','sand','jar'],
    [DITCH,'물길','water','ditch'], [FEAST_TABLE,'공동 식탁','plankG','feast'],
    [FEAST_BREAD,'차린 빵','sand','camp'], [FEAST_OLIVE,'차린 올리브','grassTop','camp'],
    [FEAST_FISH,'차린 생선','stone','camp'], [FERRY_POST,'나룻배 표지','plankG','study']
  ];
  VILLAGE_ART.forEach(function (entry) {
    regShape(entry[0],entry[1],'extension',entry[0],STONE,0);
    B[entry[0]][1]=B[entry[0]][2]=B[entry[0]][3]=entry[2];
    SHAPE[entry[0]].boxes=entry[3];
  });
  var ROPE=520, PULLEY=521, COUNTERWEIGHT=522, PRESS_PLATE=523, LIFT=524, WATERWHEEL=525, SLUICE=526;
  var STONE_RAIL=534, WOOD_PILLAR=535, ARCH_SIDE=536;
  var FRONTIER_RECIPES = [
    [ROPE,'밧줄',GOPHER,[[THREAD,3]],'rope'],
    [PULLEY,'도르래',GOPHER,[[GOPHER,2],[STICK,1]],'pulley'],
    [COUNTERWEIGHT,'돌 추',STONE,[[STONE,3],[ROPE,1]],'weight'],
    [PRESS_PLATE,'밟는 발판',GOPHER,[[GOPHER,2],[STONE,1]],'plate'],
    [LIFT,'나무 승강대',GOPHER,[[GOPHER,6],[PULLEY,1]],'lift'],
    [WATERWHEEL,'물레방아',GOPHER,[[GOPHER,5],[STICK,2]],'wheel'],
    [SLUICE,'수문',GOPHER,[[GOPHER,4],[ROPE,1]],'sluice'],
    [STONE_RAIL,'돌 난간',STONE,[[STONE,2]],'rail'],
    [WOOD_PILLAR,'나무 기둥',GOPHER,[[GOPHER,3]],'pillar']
  ];
  FRONTIER_RECIPES.forEach(function (r) { regShape(r[0],r[1],r[4],r[0],r[2]); });
  for (var si=0;si<8;si++) regShape(SLUICE+si,'수문','sluice',SLUICE,GOPHER,si>>1,si%2);
  regShape(ARCH_SIDE,B[ARCH][0],'arch',ARCH,SHAPE[ARCH].mat,1);
  var WORD_SHELF=480, ALTAR=481, SLING_TARGET=482, BETHEL_BLOCK=483;   // 11/22 세워 둔 벧엘 돌
  var WORD_SCROLL=660, STAFF=661, HAND_MAP=662, COMPASS=663, SHOFAR=664, SLING=665, ROUND_STONE=666, FIREWORK=667, HOME_STONE=668;   // 11/21 폭죽
  var WORD_BLOCKS=[[WORD_SHELF,'말씀 서재',0x99693e,'study'],[ALTAR,'돌 제단',0x9b9081,'altar'],
    [SLING_TARGET,'물매 연습 표적',0xbb8454,'target'],[BETHEL_BLOCK,'세워 둔 벧엘 돌',0x7fd3e8,'bethel']];
  var WORD_ITEMS=[[WORD_SCROLL,'말씀 두루마리',0xead6a2],[STAFF,'양치기 지팡이',0x856145],
    [HAND_MAP,'두루마리 지도',0xdfbf88],[COMPASS,'방향 바늘',0x9f7949],[SHOFAR,'쇼파르',0xd6ab71],
    [SLING,'물매',0x9a7052],[ROUND_STONE,'매끄러운 돌',0xa4adad],[FIREWORK,'폭죽',0xd8483a],[HOME_STONE,'벧엘 돌',0x7fd3e8]];
  EXT_BOXES.study=[[.07,0,.14,.93,.19,.86],[.09,.19,.72,.91,.87,.85],[.07,.52,.2,.93,.62,.74],[.07,.87,.14,.93,1,.86]];
  EXT_BOXES.altar=[[.03,0,.03,.97,.25,.97],[.15,.25,.15,.85,.73,.85],[.03,.73,.03,.97,.9,.97]];
  EXT_BOXES.bethel=[[.12,0,.12,.88,.2,.88],[.24,.2,.24,.76,1,.76]];
  EXT_BOXES.target=[[.39,0,.38,.61,.65,.62],[.1,.47,.40,.9,1,.60]];
  WORD_BLOCKS.forEach(function(d){
    buildShape(d[0],d[1],'word'+d[0],'extension',STONE); SHAPE[d[0]].boxes=d[3];
  });
  WORD_ITEMS.forEach(function(d){expansionItem(d[0],d[1],'word'+d[0]);});
  // ── 2026-11-20 활과 화살: 어둠의 그림자를 멀리서 물리침 ──
  var BOW = 930, ARROW = 931, SHARD = 933;
  [[BOW, '활'], [ARROW, '화살'], [CART, '수레'], [SHARD, '빛 조각']].forEach(function (d) { if (B[d[0]]) throw new Error('번호가 겹쳐요: ' + d[0]); expansionItem(d[0], d[1], 'bow' + d[0]); });
  ARM_MATS.forEach(function (n, m) {
    [[ARM_SWORD0, ' 검'], [ARM_SLING0, ' 물매'], [ARM_BOW0, ' 활'], [ARM_ARROW0, ' 화살']].forEach(function (d) { var id = d[0] + m; if (B[id]) throw new Error('번호가 겹쳐요: ' + id); expansionItem(id, n + d[1], 'arm' + id); });
  });
  var BOAT = 291; if (B[BOAT]) throw new Error('번호가 겹쳐요: ' + BOAT); expansionItem(BOAT, '배', 'boat291');
  function drawArmTiles() {
    tile('boat291', function (px, R) {   // 배: 나무 배 옆모습
      clear(px);
      for (var y = 8; y < 13; y++) for (var x = 1; x < 15; x++) { var inset = (12 - y) * 0.0 + (y - 8) * 0.9; if (x < 1 + inset || x > 14 - inset) continue; px(x, y, y === 8 ? 0x96603a : 0x7a4e2e, 0.85 + R() * 0.25); }
      for (var y2 = 2; y2 < 8; y2++) px(8, y2, 0x6a4428, 1); for (var y3 = 3; y3 < 7; y3++) for (var x3 = 9; x3 < 9 + (7 - y3); x3++) px(x3, y3, 0xeeeae0, 0.95);
    });   // 재료 빛깔로: 검 날·물매 돌주머니·활 끝·화살촉
    ARM_COL.forEach(function (col, m) {
      tile('arm' + (ARM_SWORD0 + m), function (px) {
        clear(px);
        for (var i = 0; i < 9; i++) { px(5 + i, 10 - i, col, 1.15); px(6 + i, 10 - i, col, 0.92); px(5 + i, 11 - i, col, 0.72); }
        for (var g = 0; g < 6; g++) px(2 + g, 8 + g, 0x6a4628);
        px(3, 12, 0x8a6236); px(2, 13, 0x8a6236); px(1, 14, col); px(14, 1, 0xffffff);
      });
      tile('arm' + (ARM_SLING0 + m), function (px, R) {
        clear(px);
        for (var y = 2; y < 11; y++) { px(4 + (y >> 2), y, 0x9a7052, 0.9 + R() * 0.2); px(11 - (y >> 2), y, 0x9a7052, 0.9 + R() * 0.2); }
        for (var y2 = 10; y2 < 14; y2++) for (var x = 5; x < 11; x++) if (Math.hypot(x - 7.5, y2 - 11.8) < 2.7) px(x, y2, col, 0.85 + R() * 0.25);
      });
      tile('arm' + (ARM_BOW0 + m), function (px, R) {
        clear(px);
        for (var y = 1; y < 15; y++) { var cx = 3 + 7.5 * Math.sin(Math.PI * (y - 1) / 13); for (var x = 0; x < 16; x++) if (Math.abs(x - cx) < 1.1) px(x, y, y < 4 || y > 11 ? col : 0x8a5a2b, 0.85 + R() * 0.25); }
        for (var y2 = 1; y2 < 15; y2++) px(3, y2, 0xe8e2d0, 1);
        px(10, 7, col); px(10, 8, col);
      });
      tile('arm' + (ARM_ARROW0 + m), function (px, R) {
        clear(px);
        for (var i = 3; i < 13; i++) px(i, 15 - i, 0x9a6a3a, 0.9 + R() * 0.2);
        [[12, 2], [13, 2], [13, 3], [11, 2], [13, 4], [12, 3], [11, 3], [12, 4]].forEach(function (q) { px(q[0], q[1], col, 1.05); });
        [[2, 12], [3, 12], [2, 13], [3, 13], [1, 13], [2, 14], [4, 13], [3, 14]].forEach(function (q) { px(q[0], q[1], (q[0] + q[1]) % 2 ? 0xf0ece0 : 0xc0473a, 1); });
      });
    });
  }
  function drawBowTiles() {
    tile('bow930', function (px, R) {
      clear(px);
      for (var y = 1; y < 15; y++) { var cx = 3 + 7.5 * Math.sin(Math.PI * (y - 1) / 13); for (var x = 0; x < 16; x++) if (Math.abs(x - cx) < 1.1) px(x, y, 0x8a5a2b, 0.85 + R() * 0.25); }
      for (var y2 = 1; y2 < 15; y2++) px(3, y2, 0xe8e2d0, 1);
      px(10, 7, 0x4a2f18); px(10, 8, 0x4a2f18);
    });
    tile('bow950', function (px, R) {   // 수레: 쇠 통 + 바퀴
      clear(px);
      for (var y = 4; y < 12; y++) for (var x = 2; x < 14; x++) { var rim = y === 4 || x === 2 || x === 13; px(x, y, rim ? 0x6d7378 : 0x8d949a, 0.85 + R() * 0.2); }
      [[4, 12], [5, 12], [4, 13], [5, 13], [10, 12], [11, 12], [10, 13], [11, 13]].forEach(function (q) { px(q[0], q[1], 0x2b2b2b, 1); });
    });
    tile('bow933', function (px, R) {   // 빛 조각: 빛나는 노란 마름모
      clear(px);
      for (var y = 2; y < 14; y++) for (var x = 2; x < 14; x++) { var d = Math.abs(x - 7.5) + Math.abs(y - 7.5); if (d < 5.6) px(x, y, d < 2.2 ? 0xfffbe0 : (d < 4 ? 0xffe27a : 0xe8b030), 1); }
    });
    tile('bow931', function (px, R) {
      clear(px);
      for (var i = 3; i < 13; i++) px(i, 15 - i, 0x9a6a3a, 0.9 + R() * 0.2);
      [[12, 2], [13, 2], [13, 3], [11, 2], [13, 4], [12, 3]].forEach(function (q) { px(q[0], q[1], 0xa8adb2, 1); });
      [[2, 12], [3, 12], [2, 13], [3, 13], [1, 13], [2, 14], [4, 13], [3, 14]].forEach(function (q) { px(q[0], q[1], (q[0] + q[1]) % 2 ? 0xf0ece0 : 0xc0473a, 1); });
    });
  }
  function drawWordTiles() {
    WORD_BLOCKS.concat(WORD_ITEMS).forEach(function(d) {
      tile('word'+d[0],function(px,R){
        var item=d[0]>=660; if(item)clear(px);
        for(var y=0;y<16;y++)for(var x=0;x<16;x++){
          var dx=x-7.5,dy=y-7.5;
          var mark=d[0]===SLING_TARGET&&dx*dx+dy*dy<12;
          var visible=d[0]===STAFF ? (x===5&&y>4)||(y===4&&x>=5&&x<=9)||(x===9&&y===5) :
            d[0]===SLING?y>3&&y<13&&(Math.abs(Math.abs(dx)-(13-y)*.32)<1.3||Math.abs(dy)<1.5&&Math.abs(dx)<3) :
            d[0]===SHOFAR ? Math.abs(y-(4+Math.pow(x-5,2)*.077))<1.8 && x>2&&x<14 :
            (d[0]===WORD_SCROLL||d[0]===HAND_MAP)?Math.abs(dx)<6&&Math.abs(dy)<4.7:dx*dx+dy*dy<28;
          if(item&&!visible)continue;
          px(x,y,mark?0x94463b:d[2],.86+R()*.20+((x+y)%7===0?.12:0));
        }
      });
    });
  }
  for (var bi = 0; bi < B.length; bi++) if (B[bi] === undefined) B[bi] = null;
  function isShape(id) { return !!SHAPE[id]; }
  function baseOf(id) { return SHAPE[id] ? SHAPE[id].base : id; }
  // 모양별 상자들(칸 안 좌표 0~1)
  var EDGE = [[0, 0, 0, 1, 1, 0.19], [0.81, 0, 0, 1, 1, 1], [0, 0, 0.81, 1, 1, 1], [0, 0, 0, 0.19, 1, 1]];
  function swapBoxAxes(b) { return [b[2],b[1],b[0],b[5],b[4],b[3]]; }
  function shapeBoxes(id, x, y, z) {
    var s = SHAPE[id];
    if (s.type === 'slab') return [s.f ? [0, 0.5, 0, 1, 1, 1] : [0, 0, 0, 1, 0.5, 1]];
    if (s.type === 'stair') return [[0, 0, 0, 1, 0.5, 1], [[0, 0.5, 0, 1, 1, 0.5], [0.5, 0.5, 0, 1, 1, 1], [0, 0.5, 0.5, 1, 1, 1], [0, 0.5, 0, 0.5, 1, 1]][s.f]];
    if (s.type === 'extension') return EXT_BOXES[s.boxes];
    if (s.type === 'pillar') return [[.1,0,.1,.9,.13,.9],[.22,.13,.22,.78,.87,.78],[.1,.87,.1,.9,1,.9]];
    if (s.type === 'arch') {
      var arch=[[0,0,.12,.17,1,.88],[.83,0,.12,1,1,.88],
        [.17,.38,.12,.34,1,.88],[.66,.38,.12,.83,1,.88],[.34,.68,.12,.66,1,.88]];
      return s.f ? arch.map(swapBoxAxes) : arch;
    }
    if (s.type === 'rope') {
      var rope=[[.46,0,.46,.54,1,.54]];
      if(mechanismNeighbor(get(x-1,y,z)))rope.push([0,.53,.46,.46,.61,.54]);
      if(mechanismNeighbor(get(x+1,y,z)))rope.push([.54,.53,.46,1,.61,.54]);
      if(mechanismNeighbor(get(x,y,z-1)))rope.push([.46,.53,0,.54,.61,.46]);
      if(mechanismNeighbor(get(x,y,z+1)))rope.push([.46,.53,.54,.54,.61,1]);
      return rope;
    }
    if (s.type === 'pulley') return [[.14,.38,.34,.86,.74,.66],[.44,.7,.44,.56,1,.56]];
    if (s.type === 'weight') return [[.24,.14,.24,.76,.76,.76],[.45,.76,.45,.55,1,.55]];
    if (s.type === 'plate') return [[.08,0,.08,.92,.11,.92]];
    if (s.type === 'lift') return [[0,0,0,1,.17,1],[.02,.17,.02,.11,.65,.11],[.89,.17,.02,.98,.65,.11]];
    if (s.type === 'wheel') return [[.43,0,.43,.57,.47,.57],[.27,.43,.27,.73,.57,.73]];
    if (s.type === 'sluice') {
      var gateBoxes=s.open ? [[0,0,.4,.12,1,.6],[.88,0,.4,1,1,.6],[.12,.85,.4,.88,1,.6]] : [[0,0,.39,1,1,.61]];
      return s.f % 2 ? gateBoxes.map(swapBoxAxes) : gateBoxes;
    }
    if (s.type === 'rail') {
      var rail = [[.2,0,.2,.8,1,.8]];
      if (get(x-1,y,z) === id) rail.push([0,.48,.36,.2,.9,.64]);
      if (get(x+1,y,z) === id) rail.push([.8,.48,.36,1,.9,.64]);
      if (get(x,y,z-1) === id) rail.push([.36,.48,0,.64,.9,.2]);
      if (get(x,y,z+1) === id) rail.push([.36,.48,.8,.64,.9,1]);
      return rail;
    }
    if (s.type === 'roof') return [[0,.64,0,1,1,1]];
    if (s.type === 'flag') return [[.1,0,.44,.2,1,.56],[.2,.43,.47,.94,.96,.53]];
    if (s.type === 'cloth') return [[.05,.05,.46,.95,.95,.54]];
    if (s.type === 'gate') {
      var gate = s.open ? [[0,0,.43,.13,1,.57],[.87,0,.43,1,1,.57],[.02,.28,.52,.13,.45,1],[.02,.65,.52,.13,.82,1]] :
        [[0,0,.43,.13,1,.57],[.87,0,.43,1,1,.57],[.13,.28,.43,.87,.45,.57],[.13,.65,.43,.87,.82,.57]];
      return s.f ? gate.map(function(b) { return [b[2],b[1],b[0],b[5],b[4],b[3]]; }) : gate;
    }
    if (s.type === 'door') return [EDGE[s.open ? (s.f + 1) % 4 : s.f]];
    if (s.type === 'mrail') {
      if (s.f < 6) return [[0, 0, 0, 1, 0.0625, 1]];
      var rb = [];
      for (var k = 0; k < 4; k++) { var lo = k * 0.25, hi = lo + 0.0625; rb.push([[0, lo, 0.75 - lo, 1, hi, 1 - lo], [lo, lo, 0, lo + 0.25, hi, 1], [0, lo, lo, 1, hi, lo + 0.25], [0.75 - lo, lo, 0, 1 - lo, hi, 1]][s.f - 6]); }
      return rb;
    }
    if (s.type === 'trapdoor') return s.open ? [EDGE[s.f]] : [s.h ? [0, 0.81, 0, 1, 1, 1] : [0, 0, 0, 1, 0.19, 1]];   // 닫히면 바닥(아래·위 반쪽), 열리면 한쪽 벽에 세워짐
    if (s.type === 'frame') return [[[0.12, 0.12, 0, 0.88, 0.88, 0.06], [0.94, 0.12, 0.12, 1, 0.88, 0.88], [0.12, 0.12, 0.94, 0.88, 0.88, 1], [0, 0.12, 0.12, 0.06, 0.88, 0.88]][s.f]];
    if (s.type === 'ladder') return [[[0, 0, 0, 1, 1, 0.1], [0.9, 0, 0, 1, 1, 1], [0, 0, 0.9, 1, 1, 1], [0, 0, 0, 0.1, 1, 1]][s.f]];
    if (s.type === 'chair') {
      var boxes = [[.1,.42,.1,.9,CHAIR_SEAT,.9],[.1,0,.1,.23,.42,.23],[.77,0,.1,.9,.42,.23],
        [.1,0,.77,.23,.42,.9],[.77,0,.77,.9,.42,.9],[.1,CHAIR_SEAT,.77,.9,1,.9]];
      if (!s.f) return boxes;
      return boxes.map(function (b) {
        if (s.f === 1) return [1-b[5],b[1],b[0],1-b[2],b[4],b[3]];
        if (s.f === 2) return [1-b[3],b[1],1-b[5],1-b[0],b[4],1-b[2]];
        return [b[2],b[1],1-b[3],b[5],b[4],1-b[0]];
      });
    }
    if (s.type === 'bed') return [[0, 0, 0, 1, 0.56, 1]];
    if (s.type === 'carpet') return [[0, 0, 0, 1, 0.07, 1]];
    if (s.type === 'lampstand') return [[0.25, 0, 0.25, 0.75, 0.15, 0.75], [0.44, 0.15, 0.44, 0.56, 0.85, 0.56], [0.3, 0.85, 0.3, 0.7, 1, 0.7]];
    if (s.type === 'lantern') return [[0.3, 0.15, 0.3, 0.7, 0.7, 0.7], [0.4, 0.7, 0.4, 0.6, 1, 0.6]];
    if (s.type === 'lever') return [[0.3, 0, 0.3, 0.7, 0.12, 0.7], s.open ? [0.45, 0.12, 0.6, 0.55, 0.62, 0.7] : [0.45, 0.12, 0.3, 0.55, 0.62, 0.4]];
    if (s.type === 'wtorch') return [[[0.43, 0.25, 0, 0.57, 0.85, 0.14], [0.86, 0.25, 0.43, 1, 0.85, 0.57], [0.43, 0.25, 0.86, 0.57, 0.85, 1], [0, 0.25, 0.43, 0.14, 0.85, 0.57]][s.f]];
    if (s.type === 'sign') return [[0.45, 0, 0.45, 0.55, 0.55, 0.55], s.f % 2 ? [0.44, 0.5, 0.04, 0.56, 1, 0.96] : [0.04, 0.5, 0.44, 0.96, 1, 0.56]];
    if (s.type === 'pane') {
      var pb = [[0.44, 0, 0.44, 0.56, 1, 0.56]], con = 0;
      [[0, -1, [0.44, 0, 0.56, 0.44]], [1, 0, [0.56, 0.44, 1, 0.56]], [0, 1, [0.44, 0.56, 0.56, 1]], [-1, 0, [0, 0.44, 0.44, 0.56]]].forEach(function (d) {
        var nb = get(x + d[0], y, z + d[1]);
        if (nb === PANE || nb === GLASS || (isSolid(nb) && !isShape(nb))) { var r = d[2]; pb.push([r[0], 0, r[1], r[2], 1, r[3]]); con++; }
      });
      if (!con) pb.push([0, 0, 0.44, 1, 1, 0.56]);
      return pb;
    }
    // 울타리: 기둥 + 옆 칸(울타리·꽉 찬 블록) 쪽으로 가로대
    var bx = [[0.375, 0, 0.375, 0.625, 1, 0.625]];
    [[0, -1, [0.44, 0, 0.56, 0.375]], [1, 0, [0.625, 0.44, 1, 0.56]], [0, 1, [0.44, 0.625, 0.56, 1]], [-1, 0, [0, 0.44, 0.375, 0.56]]].forEach(function (d) {
      var nb = get(x + d[0], y, z + d[1]);
      if (nb === FENCE || (SHAPE[nb] && SHAPE[nb].type === 'gate' && SHAPE[nb].f === (d[0] === 0 ? 1 : 0)) || (isSolid(nb) && !isShape(nb) && !isTrans(nb))) { var r = d[2]; bx.push([r[0], 0.3, r[1], r[2], 0.45, r[3]]); bx.push([r[0], 0.7, r[1], r[2], 0.85, r[3]]); }
    });
    return bx;
  }
  function collBoxes(id, x, y, z) { var s = SHAPE[id]; if ((s.type === 'door' || s.type === 'gate' || s.type === 'trapdoor') && s.open) return [];
    if (s.type === 'frame' || s.type === 'mrail') return [];
    if (s.type === 'flag' || s.type === 'cloth' || s.type === 'rope' || s.type === 'plate') return [];
    if (s.type === 'gate') return [s.f ? [.43,0,0,.57,1,1] : [0,0,.43,1,1,.57]]; if (s.type === 'ladder' || s.type === 'wtorch' || s.type === 'lever' || s.type === 'sign' || s.type === 'lantern' || s.type === 'carpet' || s.type === 'lampstand') return []; if (s.type === 'fence') return [[0.3, 0, 0.3, 0.7, 1, 0.7]].concat(shapeBoxes(id, x, y, z).slice(1).map(function (b) { return [b[0], 0, b[2], b[3], 1, b[5]]; })); return shapeBoxes(id, x, y, z); }
  // 가방에 들어가는 것(캐거나 만들어서 모음)
  var INV = [7, 5, 6, 8, 3, 21, 23, 4, 2, 26, 27, 25, 28, 29, 11, 12, 13, 20, 22, 9, 10, 18, 14, 15, 16, 17, SLAB_G, SLAB_S, SLAB_B, STAIR_G, STAIR_S, STAIR_B, FENCE, DOOR,
    ORE_CU, ORE_FE, ORE_AG, ORE_AU, ING_CU, ING_FE, ING_AG, ING_AU, FURNACE, BLK_CU, BLK_FE, BLK_AG, BLK_AU, STICK];
  INV.push(SAPLING, OLIVE, LADDER, CHEST, SADDLE, CRAFT, LEATHER, WOOL);
  WEARS.forEach(function (w) { INV.push(w[0]); });
  FRONTIER_RECIPES.forEach(function(r){INV.push(r[0]);});
  INV.push(TRAP, FRAME, BOW, ARROW, RAIL0, CART, RAILF0, SHARD, BOAT);
  for (var am = 0; am < 7; am++) INV.push(ARM_SWORD0 + am, ARM_SHIELD0 + am, ARM_SLING0 + am, ARM_BOW0 + am, ARM_ARROW0 + am);
  INV.push(SEED, WHEAT, BREAD, FIG, BED, CHAIR, LEVER, PANE, SIGN, WOOL_W, WOOL_B, WOOL_V, WOOL_R, SLAB_L, SLAB_P, STAIR_L, STAIR_P, SWORD, SHELF, SBRICK, CARPET, LANTERN);
  GEMS.forEach(function (g, i) { if (g) INV.push(gemOre(i), gemItem(i)); });
  for (var fsi = 0; fsi < 12; fsi++) INV.push(FSTONE0 + fsi);
  INV.push(ORE_COAL, COAL, CHAR, BLK_COAL, TORCH, DEEP, ORE_ONYX, GEM_ONYX, BLK_ONYX, ORE_SAPH, GEM_SAPH, BLK_SAPH, ORE_DIA, GEM_DIA, BLK_DIA);
  for (var tl = 0; tl < 16; tl++) INV.push(TOOL0 + tl);
  for (tl = 0; tl < 4; tl++) INV.push(TOOL_ONYX + tl, TOOL4 + tl);
  var HOTBAR = [LOG, GOPHER, PITCH, STONE, LIME, 20, 12, 13, GLASS];
  // 캐는 데 걸리는 시간(초), 캤을 때 나오는 것
  var HARD = { 1: 0.35, 2: 0.35, 4: 0.3, 26: 0.35, 8: 0.15, 25: 0.05, 28: 0.05, 9: 0.25, 7: 0.6, 5: 0.5, 6: 0.5, 22: 0.4, 14: 0.3, 15: 0.3, 16: 0.3, 17: 0.3,
    3: 0.75, 21: 0.7, 23: 0.9, 29: 0.25, 12: 0.7, 20: 0.5, 11: 0.5, 13: 0.6, 18: 0.45, 27: 0.5, 10: 0.3, 19: 0.35 };
  var DROP = { 1: DIRT, 19: DIRT };
  // 석탄·보석 광석은 캐면 바로 석탄·보석이 나온다(금속 광석은 녹여야 덩이)
  DROP[ORE_COAL] = COAL; DROP[ORE_ONYX] = GEM_ONYX; DROP[ORE_SAPH] = GEM_SAPH; DROP[ORE_DIA] = GEM_DIA;
  for (var dk in DEEPV) DROP[DEEPV[dk]] = DROP[dk] || +dk;
  DROP[FURNACE_ON] = FURNACE; DROP[LOG_X] = LOG; DROP[LOG_Z] = LOG;
  // 도구 갈래: 곡괭이(돌·광석·벽돌) · 도끼(나무) · 삽(흙·모래) · 칼(잎·풀·천)
  var TCLASS = {}, BASE_T = {};
  function setClass(cls, list, t) { list.forEach(function (id) { TCLASS[id] = cls; BASE_T[id] = t; }); }
  // 돌·광석은 단단한 정도대로: 석회암 < 돌 < 현무암, 광석은 귀할수록 단단하게 구리 < 철 < 은 < 금
  setClass('pick', [LIME], 1.2); setClass('pick', [STONE], 1.5); setClass('pick', [BASALT], 2.0);
  setClass('pick', [ORE_COAL], 2.0); setClass('pick', [ORE_CU], 2.5); setClass('pick', [ORE_FE], 3.0); setClass('pick', [ORE_AG], 3.6);
  setClass('pick', [ORE_ONYX], 3.9); setClass('pick', [ORE_AU], 4.2); setClass('pick', [ORE_SAPH], 4.6); setClass('pick', [ORE_DIA], 5.0);
  setClass('pick', [DEEP], 3.0); setClass('pick', [BLK_COAL], 2.4); setClass('pick', [BLK_ONYX], 4.0); setClass('pick', [BLK_SAPH], 4.8); setClass('pick', [BLK_DIA], 5.2);
  BASE_T[TORCH] = 0.05; BASE_T[SAPLING] = 0.05;
  setClass('pick', [FURNACE_ON], 1.6); setClass('axe', [LADDER, LADDER + 1, LADDER + 2, LADDER + 3], 0.4); setClass('axe', [CHEST, CRAFT], 1.2);
  setClass('axe', [BED, CHAIR, CHAIR + 1, CHAIR + 2, CHAIR + 3, SIGN, SIGN + 1, SIGN + 2, SIGN + 3], 0.5); setClass('pick', [LEVER, LEVER + 1], 0.3); setClass('pick', [PANE], 0.25);
  setClass('knife', [WOOL_W, WOOL_B, WOOL_V, WOOL_R], 0.5); setClass('axe', [LOG_X, LOG_Z], 1.4);
  GEMS.forEach(function (g, i) { if (!g) return; setClass('pick', [gemOre(i)], 5.2 + g[7] * 0.3); DROP[gemOre(i)] = gemItem(i); });
  for (var fsj = 0; fsj < 12; fsj++) setClass('pick', [FSTONE0 + fsj], 3.0);
  (function () { var r = []; for (var i = 0; i < 10; i++) r.push(RAIL0 + i, RAILF0 + i); setClass('pick', r, 0.5); })();
  (function () { var t = []; for (var i = 0; i < 16; i++) t.push(TRAP + i); setClass('axe', t, 0.9); setClass('axe', [FRAME, FRAME + 1, FRAME + 2, FRAME + 3], 0.3); })();
  setClass('axe', [SHELF], 1.0); setClass('pick', [SBRICK], 1.6); setClass('knife', [CARPET], 0.1); setClass('pick', [LANTERN], 0.4);
  setClass('pick', [SLAB_L, STAIR_L, STAIR_L + 1, STAIR_L + 2, STAIR_L + 3], 1.2); setClass('axe', [SLAB_P, STAIR_P, STAIR_P + 1, STAIR_P + 2, STAIR_P + 3], 1.0);
  for (var cb = 0; cb < 4; cb++) { BASE_T[CROP0 + cb] = 0.05; BASE_T[WTORCH + cb] = 0.05; }
  for (var dk2 in DEEPV) { TCLASS[DEEPV[dk2]] = 'pick'; BASE_T[DEEPV[dk2]] = Math.round(BASE_T[dk2] * 1.3 * 10) / 10; }
  setClass('pick', [12, 11, 13, SLAB_S, SLAB_B, STAIR_S, STAIR_S + 1, STAIR_S + 2, STAIR_S + 3, STAIR_B, STAIR_B + 1, STAIR_B + 2, STAIR_B + 3], 1.2); setClass('pick', [20], 1.0);
  setClass('pick', [FURNACE], 1.6); setClass('pick', [BLK_CU], 2.6); setClass('pick', [BLK_FE], 3.2); setClass('pick', [BLK_AG], 3.8); setClass('pick', [BLK_AU], 4.4); setClass('pick', [GLASS], 0.4); setClass('pick', [LAMP], 0.6);
  setClass('axe', [LOG], 1.4); setClass('axe', [GOPHER, PITCH], 1.1); setClass('axe', [22], 0.8);
  setClass('axe', [SLAB_G, STAIR_G, STAIR_G + 1, STAIR_G + 2, STAIR_G + 3, FENCE, 60, 61, 62, 63, 64, 65, 66, 67], 1.0);
  setClass('shovel', [GRASS, DIRT, 19], 0.7); setClass('shovel', [SAND], 0.6); setClass('shovel', [CLAY, TAR], 0.9); setClass('shovel', [18], 0.9); setClass('shovel', [SNOW], 0.4);
  setClass('knife', [LEAF, CEDAR_LEAF], 0.35); setClass('axe', [CEDAR_LOG], 1.6); setClass('shovel', [SALT_CRUST], 0.6); setClass('pick', [SALT_ROCK], 1.0); setClass('pick', [RED_ROCK, RED_ROCK2], 1.3);
  DROP[CEDAR_LOG] = LOG; DROP[SALT_CRUST] = SALT; DROP[SALT_ROCK] = SALT; DROP[RED_ROCK] = RED_EARTH; DROP[RED_ROCK2] = RED_EARTH; setClass('knife', [REED, FLOWER], 0.08); setClass('knife', [14, 15, 16, 17], 0.6);
  var NEED_TIER = {}; NEED_TIER[ORE_CU] = 0; NEED_TIER[ORE_FE] = 1; NEED_TIER[ORE_AG] = 2; NEED_TIER[ORE_AU] = 3;   // 0=나무 1=돌 2=구리 3=철 곡괭이
  GEMS.forEach(function (g, i) { if (g) NEED_TIER[gemOre(i)] = g[7] >= 4 ? 5 : g[7]; });   // 열두 보석: 귀한 것은 금강석 곡괭이(5)
  NEED_TIER[ORE_COAL] = 0; NEED_TIER[ORE_ONYX] = 3; NEED_TIER[ORE_SAPH] = 4; NEED_TIER[ORE_DIA] = 4;   // 11/20 호마노는 철부터, 청옥·금강석은 호마노 곡괭이부터
  for (var dk3 in DEEPV) NEED_TIER[DEEPV[dk3]] = NEED_TIER[dk3];
  var HAND_SLOW = 2, MINE_SLOW = 1.8, TIER_SPEED = [2, 3, 4.5, 6, 7, 8], TOOL_MAX = [60, 130, 200, 300, 500, 1000];
  function isTool(id) { return (id >= TOOL0 && id < TOOL0 + 16) || (id >= TOOL4 && id < TOOL4 + 4) || (id >= TOOL_ONYX && id < TOOL_ONYX + 4); }
  function tierOf(id) { return id >= TOOL_ONYX ? 4 : (id >= TOOL4 ? 5 : (id - TOOL0) % 4); }
  function typeOf(id) { return id >= TOOL_ONYX ? id - TOOL_ONYX : (id >= TOOL4 ? id - TOOL4 : Math.floor((id - TOOL0) / 4)); }
  function toolMax(id) { return TOOL_MAX[tierOf(id)]; }
  function toolName(id) { return TIER_NAME[tierOf(id)] + ' ' + TOOL_TNAME[typeOf(id)]; }
  function bestTier(cls) { var t = -1; for (var k = 5; k >= 0; k--) if (have(toolId(cls, k)) > 0) { t = k; break; } return t; }
  // 캐는 시간(초)과 못 캐는 이유
  // 손에 든 도구로 캔다: 맞는 도구면 빨리, 맞지 않는 도구면 맨손 속도(그래도 닳음)
  function mineInfo(id) {
    var material = SHAPE[id] && SHAPE[id].type === 'slab' ? SHAPE[id].base : id;
    if (!TCLASS[material] && SLAB_MATERIAL[material]) material = SLAB_MATERIAL[material];
    if (SHAPE[id] && (SHAPE[id].type === 'gate' || BUILD_BLOCKS.some(function (d) { return d[0] === id; }))) material = SHAPE[id].mat;
    var cls = TCLASS[material], base = BASE_T[material] || 0.5, held = HOTBAR[sel];
    var tool = isTool(held) && have(held) > 0 ? held : 0;
    var hType = tool ? TOOL_TYPES[typeOf(tool)] : '', hTier = tool ? tierOf(tool) : -1;
    var tier = cls && hType === cls ? hTier : -1;
    if (NEED_TIER[id] !== undefined && tier < NEED_TIER[id]) {
      var bt = bestTier('pick');
      return { deny: B[id][0] + '은(는) ' + TIER_NAME[NEED_TIER[id]] + ' 곡괭이 이상을 손에 들어야 캘 수 있어요' + (bt >= NEED_TIER[id] ? ' (가방에 ' + TIER_NAME[bt] + ' 곡괭이가 있어요)' : '') };
    }
    // 맞는 도구가 없으면(맨손·블록·맞지 않는 도구) 2배 느리게. 전체를 1.8배 느리게(전도사님 「캐지는 속도가 너무 빨라」 11/18) — 풀·꽃처럼 톡 캐지는 것은 그대로
    var t = tier >= 0 ? base / TIER_SPEED[tier] : (cls ? base * HAND_SLOW : base);
    if (base > 0.1) t *= MINE_SLOW;
    return { t: t, tool: tool, fit: tier >= 0 };
  }
  function dropOf(id) { return DROP[id] || baseOf(id); }
  // 만들기
  var RECIPES = [
    { out: [STICK, 4], need: [[GOPHER, 2]], cat: 'tool' },
    { out: [FURNACE, 1], need: [[STONE, 8]], cat: 'smelt' },
    { out: [GOPHER, 4], need: [[LOG, 1]] },
    { out: [PITCH, 2], need: [[GOPHER, 2], [TAR, 1]], ref: '창 6:14' },
    { out: [12, 2], need: [[CLAY, 2], [LOG, 1]], ref: '창 11:3' },
    { out: [20, 2], need: [[CLAY, 2], [REED, 1]] },
    { out: [13, 3], need: [[CLAY, 3], [LOG, 1]] },
    { out: [11, 2], need: [[LIME, 2]], ref: '신 27:2' },
    { out: [22, 2], need: [[REED, 3]] },
    { out: [GLASS, 1], need: [[SAND, 3], [LOG, 1]] },
    { out: [LAMP, 2], need: [[GOPHER, 1], [TAR, 1]] },
    { out: [PATH, 2], need: [[STONE, 2]] },
    { out: [SLAB_G, 6], need: [[GOPHER, 3]] },
    { out: [STAIR_G, 4], need: [[GOPHER, 6]] },
    { out: [FENCE, 3], need: [[GOPHER, 2], [LOG, 1]] },
    { out: [DOOR, 1], need: [[GOPHER, 6]] },
    { out: [TRAP, 2], need: [[GOPHER, 6]], cat: 'shape' },
    { out: [BOW, 1], need: [[STICK, 4], [THREAD, 4]], cat: 'tool', table: true },
    { out: [RAIL0, 16], need: [[ING_FE, 6], [STICK, 1]], cat: 'shape' },
    { out: [RAILF0, 6], need: [[ING_AU, 6], [STICK, 1]], cat: 'shape' },
    { out: [CART, 1], need: [[ING_FE, 5]], cat: 'tool' },
    { out: [ARROW, 4], need: [[STICK, 1], [FLINT, 1]], cat: 'tool' },
    { out: [ARROW, 8], need: [[STICK, 1], [FLINT, 1], [689, 1]], cat: 'tool' },
    { out: [ARROW, 4], need: [[STICK, 1], [690, 1]], cat: 'tool' },   // 11/21 뼈 화살촉   // 11/21 깃털을 달면 화살이 두 배
    { out: [FRAME, 1], need: [[STICK, 8], [LEATHER, 1]], cat: 'shape' },
    { out: [SLAB_S, 6], need: [[STONE, 3]] },
    { out: [STAIR_S, 4], need: [[STONE, 6]] },
    { out: [SLAB_B, 6], need: [[BRICK, 3]] },
    { out: [STAIR_B, 4], need: [[BRICK, 6]] },
    { out: [14, 2], need: [[REED, 2], [FLOWER, 1]] },
    { out: [15, 2], need: [[REED, 2], [FLOWER, 1]] },
    { out: [16, 2], need: [[REED, 2], [FLOWER, 1]] },
    { out: [17, 2], need: [[REED, 2], [FLOWER, 1]] }
  ];
  TOOL_TYPES.forEach(function (type) {
    [GOPHER, STONE, ING_CU, ING_FE, GEM_ONYX, GEM_DIA].forEach(function (mat, tier) {
      var n = type === 'shovel' ? 1 : (type === 'knife' ? 2 : 3), st = type === 'knife' ? 1 : 2;
      RECIPES.push({ out: [toolId(type, tier), 1], need: [[mat, n], [STICK, st]], cat: 'tool', ref: tier === 5 ? '렘 17:1' : (tier === 4 ? '창 2:12' : (tier >= 2 ? '창 4:22' : '')) });
    });
  });
  // 녹이기(용광로 + 땔감): 광석 1 → 덩이 1 — 욥 28:1-2. 땔감은 석탄·숯 1개로 8번, 통나무 1개로 1.5번, 석탄 블록 1개로 72번
  [[ORE_CU, ING_CU, '욥 28:2'], [ORE_FE, ING_FE, '욥 28:2'], [ORE_AG, ING_AG, '욥 28:1'], [ORE_AU, ING_AU, '욥 28:1']].forEach(function (o) {
    RECIPES.push({ out: [o[1], 1], need: [[o[0], 1]], cat: 'smelt', ref: o[2], furnace: true, fuel: true });
  });
  RECIPES.push({ out: [CHAR, 1], need: [[LOG, 1]], cat: 'smelt', ref: '요 21:9', furnace: true, fuel: true });
  // 블록으로 묶기(9개) ↔ 다시 풀기
  [[ING_CU, BLK_CU], [ING_FE, BLK_FE], [ING_AG, BLK_AG], [ING_AU, BLK_AU, '창 2:12'], [COAL, BLK_COAL], [GEM_ONYX, BLK_ONYX, '창 2:12'], [GEM_SAPH, BLK_SAPH, '욥 28:6'], [GEM_DIA, BLK_DIA, '렘 17:1']].forEach(function (o) {
    RECIPES.push({ out: [o[1], 1], need: [[o[0], 9]], cat: 'smelt', ref: o[2] || '' });
    RECIPES.push({ out: [o[0], 9], need: [[o[1], 1]], cat: 'smelt' });
  });
  RECIPES.push({ out: [LADDER, 3], need: [[STICK, 7]], cat: 'shape', ref: '창 28:12' });
  RECIPES.push({ out: [CHEST, 1], need: [[GOPHER, 8]], cat: 'block', ref: '출 25:10' });
  RECIPES.push({ out: [SADDLE, 1], need: [[GOPHER, 3], [ING_FE, 1]], cat: 'tool', ref: '창 22:3' });
  // 농사·침대·레버·유리판·표지판·양털 블록·반 블록과 계단(2026-11-18)
  RECIPES.push({ out: [BREAD, 1], need: [[WHEAT, 3]], cat: 'block', ref: '마 4:4' });
  // 열두 기초석: 보석 3 + 금 덩이 1, 제작대에서(계 21:19-20)
  FS_NAMES.forEach(function (n, i) { RECIPES.push({ out: [FSTONE0 + i, 1], need: [[gemItem(i), 3], [ING_AU, 1]], cat: 'block', table: true, ref: i < 4 ? '계 21:19' : '계 21:20' }); });
  RECIPES.push({ out: [SHELF, 1], need: [[GOPHER, 6], [REED, 3]], cat: 'block' });
  RECIPES.push({ out: [SBRICK, 4], need: [[STONE, 4]], cat: 'block' });
  RECIPES.push({ out: [CARPET, 3], need: [[WOOL_R, 2]], cat: 'shape' });
  RECIPES.push({ out: [LANTERN, 1], need: [[ING_FE, 1], [TORCH, 1]], cat: 'shape' });
  RECIPES.push({ out: [SWORD, 1], need: [[ING_FE, 4], [ING_AU, 2], [STICK, 2]], cat: 'wear', table: true, ref: '엡 6:17' });
  RECIPES.push({ out: [BOAT, 1], need: [[GOPHER, 5], [PITCH, 1]], cat: 'tool', ref: '창 6:14' });   // 11/20 배: 역청을 칠해 물이 새지 않게
  // 광물 무기·방패 만들기: 검(재료 4 + 막대기 2) · 방패(재료 6 + 고페르 나무 3) · 물매(가죽 2 + 실 3 + 재료 2) · 활(막대기 4 + 실 4 + 재료 3) · 화살 4개(막대기 + 재료)
  [STONE, ING_CU, ING_AG, ING_AU, GEM_ONYX, GEM_SAPH, GEM_DIA].forEach(function (mt, m) {
    RECIPES.push({ out: [ARM_SWORD0 + m, 1], need: [[mt, 4], [STICK, 2]], cat: 'wear', table: true });   // 11/22 무기 재료를 늘림(전도사님 「무기 만드는 난이도를 좀 더 높이고」)
    RECIPES.push({ out: [ARM_SHIELD0 + m, 1], need: [[mt, 6], [GOPHER, 3]], cat: 'wear', table: true });
    RECIPES.push({ out: [ARM_SLING0 + m, 1], need: [[LEATHER, 2], [THREAD, 3], [mt, 2]], cat: 'tool', table: true });
    RECIPES.push({ out: [ARM_BOW0 + m, 1], need: [[STICK, 4], [THREAD, 4], [mt, 3]], cat: 'tool', table: true });
    RECIPES.push({ out: [ARM_ARROW0 + m, 4], need: [[STICK, 1], [mt, 1]], cat: 'tool' });
  });
  FRONTIER_RECIPES.forEach(function(r){RECIPES.push({out:[r[0],1],need:r[3],cat:'shape'});});
  RECIPES.push({ out: [CHAIR, 1], need: [[GOPHER, 3], [STICK, 2]], cat: 'shape' });
  RECIPES.push({ out: [BED, 1], need: [[WOOL, 3], [GOPHER, 3]], cat: 'block', ref: '시 4:8' });
  RECIPES.push({ out: [LEVER, 1], need: [[STICK, 1], [STONE, 1]], cat: 'shape' });
  RECIPES.push({ out: [PANE, 16], need: [[GLASS, 6]], cat: 'shape' });
  RECIPES.push({ out: [SIGN, 3], need: [[GOPHER, 6], [STICK, 1]], cat: 'shape' });
  RECIPES.push({ out: [WOOL_W, 1], need: [[WOOL, 4]], cat: 'block' });
  RECIPES.push({ out: [WOOL_R, 4], need: [[WOOL_W, 4], [FLOWER, 1]], cat: 'block', ref: '출 25:4' });
  RECIPES.push({ out: [WOOL_B, 4], need: [[WOOL_W, 4], [GEM_SAPH, 1]], cat: 'block', ref: '출 25:4' });
  RECIPES.push({ out: [WOOL_V, 4], need: [[WOOL_B, 2], [WOOL_R, 2]], cat: 'block', ref: '출 25:4' });
  RECIPES.push({ out: [SLAB_L, 6], need: [[LIME, 3]], cat: 'shape' }); RECIPES.push({ out: [STAIR_L, 4], need: [[LIME, 6]], cat: 'shape' });
  RECIPES.push({ out: [SLAB_P, 6], need: [[PITCH, 3]], cat: 'shape' }); RECIPES.push({ out: [STAIR_P, 4], need: [[PITCH, 6]], cat: 'shape' });
  // 제작대와 옷: 옷은 제작대(가방이나 내 땅)가 있어야 만든다
  RECIPES.push({ out: [CRAFT, 1], need: [[GOPHER, 4]], cat: 'wear' });
  // 11/22 방어구 재료를 늘림(전도사님 「갑옷들도 만들기 어렵게」). 하나님의 전신갑주 다섯(엡 6:13-17)은 광물 일곱 가지가 하나씩 다 들어감
  var ALL_ORES = [[ING_CU, 1], [ING_FE, 1], [ING_AG, 1], [ING_AU, 1], [GEM_ONYX, 1], [GEM_SAPH, 1], [GEM_DIA, 1]];
  [[140, [[LEATHER, 5]]], [141, [[ING_CU, 8]]], [142, [[ING_FE, 8]]], [143, [[ING_AU, 8]]], [144, ALL_ORES.concat([[LEATHER, 2]])],
   [145, [[LEATHER, 10]]], [146, [[WOOL, 10]]], [147, [[WOOL, 10], [FLOWER, 4]]], [148, [[ING_CU, 12]]], [149, [[ING_FE, 12]]], [150, ALL_ORES.concat([[LEATHER, 4]])],
   [151, [[LEATHER, 4]]], [152, ALL_ORES.concat([[LEATHER, 3]])],
   [153, [[LEATHER, 5]]], [154, [[GOPHER, 5]]], [155, ALL_ORES.concat([[LEATHER, 3]])],
   [156, [[GOPHER, 8], [STICK, 2]]], [157, [[ING_FE, 8], [GOPHER, 3]]], [158, ALL_ORES.concat([[GOPHER, 4]])]
  ].forEach(function (o) { RECIPES.push({ out: [o[0], 1], need: o[1], cat: 'wear', table: true, ref: WEARINFO[o[0]].ref }); });
  RECIPES.push({ out: [TORCH, 4], need: [[STICK, 1], [COAL, 1]], cat: 'block', ref: '창 15:17' });
  RECIPES.push({ out: [TORCH, 4], need: [[STICK, 1], [CHAR, 1]], cat: 'block', ref: '창 15:17' });
  RECIPES.push({ out: [TORCH, 6], need: [[SHARD, 1], [STICK, 1]], cat: 'block', ref: '요 1:5' });   // 빛 조각으로 더 많이
  RECIPES.push({ out: [LANTERN, 2], need: [[SHARD, 2], [ING_FE, 1]], cat: 'shape' });
  // 땔감
  var FUEL = {}; FUEL[COAL] = 8; FUEL[CHAR] = 8; FUEL[LOG] = 1.5; FUEL[BLK_COAL] = 72;
  var FUEL_ORDER = [COAL, CHAR, LOG, BLK_COAL];
  var HEAT = 0;   // 용광로에 남은 불(녹일 수 있는 횟수)
  // 녹이는 줄: [{o: 나올 것, n: 개수, s: 시작 시각(ms), g: 이미 꺼낸 개수}] — 창을 닫아도 시간은 흐른다
  var SMELT_SEC = 3, JOBS = [];
  try { JOBS = (JSON.parse(localStorage.getItem('arkVillage.smelt') || '[]') || []).filter(function (j) { return j && B[j.o] && j.n > 0; }); } catch (e) { JOBS = []; }
  function saveJobs() { try { localStorage.setItem('arkVillage.smelt', JSON.stringify(JOBS)); } catch (e) {} }
  function jobEnd(j) { return j.s + j.n * SMELT_SEC * 1000; }
  function queueSmelt(o, n) {
    var now = Date.now(), last = JOBS[JOBS.length - 1];
    if (last && last.o === o && jobEnd(last) > now) last.n += n;
    else JOBS.push({ o: o, n: n, s: last ? Math.max(now, jobEnd(last)) : now, g: 0 });
    saveJobs(); updateSmeltUI(); unlock('smelt');
  }
  try { HEAT = Math.max(0, Math.min(200, +(localStorage.getItem('arkVillage.heat') || 0) || 0)); } catch (e) {}
  function needOf(rc, id) { var n = 0; rc.need.forEach(function (q) { if (q[0] === id) n += q[1]; }); return n; }
  function fuelLeft(rc) { var f = HEAT; FUEL_ORDER.forEach(function (id) { f += Math.max(0, have(id) - (rc ? needOf(rc, id) : 0)) * FUEL[id]; }); return f; }
  function burnOne(rc) {
    var guard = 0;
    while (HEAT < 1 && guard++ < 5) {
      var id = FUEL_ORDER.filter(function (f) { return have(f) - needOf(rc, f) > 0; })[0];
      if (!id) return false;
      take(id, 1); HEAT += FUEL[id];
    }
    if (HEAT < 1) return false;
    HEAT -= 1; return true;
  }
  SLABS.slice(5).forEach(function (s) {
    INV.push(s[0]);
    RECIPES.push({ out: [s[0], 6], need: [[s[1], 3]], cat: 'shape' });
  });
  BUILD_BLOCKS.forEach(function (d) { INV.push(d[0]); });
  BUILD_ITEMS.forEach(function (d) { INV.push(d[0]); });
  INV.push(GATE);
  [
    [PILLAR,2,[[MARBLE,2]]], [ARCH,2,[[ALABASTER,2]]],
    [RAIL,4,[[SBRICK,3]]], [FLAT_ROOF,4,[[13,3],[GOPHER,1]]],
    [BLUE_RUG,3,[[WOOL_B,2]]], [GOLD_RUG,3,[[WOOL_W,2],[RED_EARTH,1]]],
    [REED_MAT,2,[[REED,3]]], [FLAG,1,[[16,2],[STICK,1]]],
    [PATTERN_CLOTH,2,[[14,1],[16,1],[WOOL_W,1]]],
    [GATE,1,[[GOPHER,2],[STICK,4]]]
  ].forEach(function (d) { RECIPES.push({ out: [d[0],d[1]], need: d[2], cat: 'shape', ref: d[0] === RAIL || d[0] === FLAT_ROOF ? '신명기 22장 8절' : '' }); });
  RECIPES.push({ out: [STRIKER,1], need: [[ING_FE,1]], cat: 'tool', table: true });
  INV.push(FARM_SOIL,OVEN,MILL,WINE_PRESS,OIL_PRESS,COOK_POT);
  FOOD_ART.forEach(function(d) { INV.push(d[0]); });
  Object.keys(FARM_SEEDS).forEach(function(id) {
    var seed=FARM_SEEDS[id]; INV.push(seed.seed);
    if (INV.indexOf(seed.harvest)<0) INV.push(seed.harvest);
    RECIPES.push({out:[seed.seed,1],need:[[seed.harvest,1]],cat:'block'});
  });
  [[HOE,1,[[STONE,2],[STICK,2]]],[FISH_ROD,1,[[STICK,3],[WOOL,1]]],[FISH_NET,1,[[REED,4],[WOOL,2]]],
   [OVEN,1,[[BRICK,6],[STONE,2]]],[MILL,1,[[STONE,5]]],[WINE_PRESS,1,[[GOPHER,5],[STONE,2]]],[OIL_PRESS,1,[[GOPHER,4],[STONE,4]]],[COOK_POT,1,[[ING_CU,3],[CLAY,2]]]
  ].forEach(function(d){ RECIPES.push({out:[d[0],d[1]],need:d[2],cat:d[0]<600?'block':'tool'}); });
  [
    [FLOUR,2,[[612,2]],MILL], [FLOUR,2,[[WHEAT,2]],MILL],
    [WINE,1,[[613,3]],WINE_PRESS], [OLIVE_OIL,1,[[614,3]],OIL_PRESS],
    [STEW,1,[[615,2],[CHAR,1]],OVEN], [FLATBREAD,2,[[FLOUR,2],[CHAR,1]],OVEN]
  ].forEach(function(d){ RECIPES.push({out:[d[0],d[1]],need:d[2],station:d[3],cat:'block'}); });
  // 11/21 굽기: 모닥불(또는 화덕과 솥) 가까이에서 석탄·숯·통나무를 땔감으로 — 녹이기처럼 하나에 3초
  [[COOKED_LAMB,RAW_LAMB],[COOKED_BEEF,RAW_BEEF],[COOKED_GOAT,RAW_GOAT],[COOKED_CHICKEN,RAW_CHICKEN],[COOKED_FISH,RAW_FISH]].forEach(function(d){ RECIPES.push({out:[d[0],1],need:[[d[1],1]],station:467,fuel:true,cook:true,cat:'smelt',ref:'창 9:3'}); });
  LIFE_BLOCKS.forEach(function(d){ INV.push(d[0]); });
  LIFE_ITEMS.forEach(function(d){ INV.push(d[0]); });
  [
    [WELL,1,[[STONE,8],[GOPHER,2],[WELL_BUCKET,1]]],[LOOM,1,[[GOPHER,5],[THREAD,2]]],
    [JAR,2,[[CLAY,3],[CHAR,1]]],[OIL_JAR,1,[[JAR,1],[OLIVE_OIL,1]]],
    [ALABASTER_JAR,1,[[ALABASTER,2]]],[OIL_LAMP,1,[[CLAY,1],[OLIVE_OIL,1],[THREAD,1]]],
    [CANDLESTICK,1,[[ING_CU,1],[HONEY,1],[THREAD,1]]],[CAMPFIRE,1,[[STONE,3],[LOG,2]]],
    [BUCKET,1,[[GOPHER,3],[ING_FE,1]]],[WATER_JAR,1,[[CLAY,3],[CHAR,1]]],
    [THREAD,3,[[WOOL,1]]],[LINEN,2,[[THREAD,3],[REED,1]],LOOM],[WOOL_CLOTH,2,[[THREAD,2],[WOOL,2]],LOOM],
    [RED_DYE,2,[[FLOWER,1],[RED_EARTH,1]]],[BLUE_DYE,2,[[THISTLE,2]]],[GOLD_DYE,2,[[CLAY,1],[SALT,1]]],
    [16,2,[[LINEN,2],[RED_DYE,1]],LOOM],[14,2,[[LINEN,2],[BLUE_DYE,1]],LOOM],
    [15,2,[[LINEN,2],[GOLD_DYE,1]],LOOM],[PATTERN_CLOTH,2,[[WOOL_CLOTH,2],[BLUE_DYE,1]],LOOM],
    [WELL_BUCKET,1,[[GOPHER,2],[THREAD,2]]],
    [LYRE,1,[[GOPHER,3],[THREAD,3]]],[HARP,1,[[GOPHER,4],[THREAD,4]]],[TIMBREL,1,[[LEATHER,1],[GOPHER,1]]],[CYMBAL,1,[[ING_CU,2]]]
  ].forEach(function(d){RECIPES.push({out:[d[0],d[1]],need:d[2],station:d[3],cat:'block'});});
  DROP[FEAST_BREAD]=FLATBREAD; DROP[FEAST_OLIVE]=614; DROP[FEAST_FISH]=COOKED_FISH;
  Object.values(VILLAGE_FISH).forEach(function (id) {
    RECIPES.push({out:[COOKED_FISH,1],need:[[id,1]],station:467,fuel:true,cook:true,cat:'smelt'});
  });
  [FIND_POT,FIND_LAMP,FIND_SEED,DITCH,FEAST_TABLE].forEach(function (id) { INV.push(id); });
  RECIPES.push({out:[DITCH,4],need:[[STONE,2],[CLAY,1]],cat:'shape'});
  RECIPES.push({out:[FEAST_TABLE,1],need:[[GOPHER,4],[REED,1]],cat:'shape'});
  WORD_BLOCKS.forEach(function(d){ if (d[0] !== BETHEL_BLOCK) INV.push(d[0]); });
  DROP[BETHEL_BLOCK] = HOME_STONE; LIGHTS[BETHEL_BLOCK] = 1; B[BETHEL_BLOCK][5] = 1;   // 부수면 벧엘 돌 물건으로, 스스로 빛남
  WORD_ITEMS.forEach(function(d){INV.push(d[0]);});
  [
    [WORD_SHELF,1,[[SHELF,1],[WORD_SCROLL,1]]],[ALTAR,1,[[STONE,6]]],
    [SLING_TARGET,1,[[REED,4],[STICK,2]]],[WORD_SCROLL,1,[[REED,3],[THREAD,1]]],
    [STAFF,1,[[LOG,1],[STICK,2]]],[HAND_MAP,1,[[REED,3],[CHAR,1]]],
    [COMPASS,1,[[ING_FE,1],[GOPHER,2]]],[SHOFAR,1,[[CLAY,2],[WOOL,1]]],
    [SLING,1,[[LEATHER,2],[THREAD,3]]],[ROUND_STONE,4,[[STONE,1]]],[FIREWORK,3,[[REED,1],[CHAR,1]]],[HOME_STONE,1,[[SHARD,8],[ING_AU,2],[GEM_DIA,1]]]
  ].forEach(function(d){RECIPES.push({out:[d[0],d[1]],need:d[2],cat:d[0]<600?'shape':'tool',table:d[0]===HOME_STONE});});   // 11/22 벧엘 돌은 어렵게: 빛 조각 8 + 금 덩이 2 + 금강석 1, 제작대(전도사님 「텔레포트는 만들기 어렵게」)
  RECIPES.forEach(function (r) { if (!r.cat) r.cat = SHAPE[r.out[0]] ? 'shape' : 'block'; });
  function canCraft(rc) { return isAdm() || rc.need.every(function (n) { return have(n[0]) >= n[1]; }) && (!rc.station || (workshopNeeds() & STATION_BITS[rc.station])) && (!rc.furnace || furnaceOK()) && (!rc.table || tableOK()) && (!rc.fuel || fuelLeft(rc) >= 1); }
  function kind(id) { return B[id] && B[id][6]; }
  function isTrans(id) { return id === AIR || (B[id] && (B[id][4] === 1 || B[id][6] === 'shape')); }
  function isSolid(id) { return id !== AIR && id !== WATER && kind(id) !== 'plant'; }

