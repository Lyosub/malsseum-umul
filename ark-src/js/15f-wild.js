  // ───────── 11/24 맹수(이리·사자·곰·표범)와 길들이기 ─────────
  // 맹수: 사자·곰은 가까이 가면 덤빔(삼상 17:34), 이리는 들의 양·염소·닭·토끼를 노리다 건드리면 덤빔, 표범은 건드릴 때만. 마을·땅 칸·안전한 곳엔 못 들어옴.
  // 길들이기: 모든 짐승 — 풀 먹는 짐승은 밀(닭은 씨앗), 맹수는 고기를 먹이면 3번에 1번꼴로 길듦(♥). 길든 짐승은 따라오고, 빈손으로 누르면 앉아/따라와.
  //   길든 짐승끼리 먹이를 주면 새끼(새끼도 길든 채로). 길든 맹수는 주인 곁의 그림자·맹수와 싸움. 이 기기에 저장(12마리까지).
  Object.assign(BEASTS, {
    wolf: { name: '이리', n: 0, speed: 2.2, chase: 2.2, pred: 'hunt', bite: 2, leg: [0.24, 0.95, 0x5e5a56], lx: 0.32, lz: 0.62, parts: [
      [0.86, 0.8, 1.7, 0x8a847c, 0, 1.38, 0], [0.92, 0.86, 0.55, 0x9a948c, 0, 1.5, -0.6], [0.62, 0.6, 0.6, 0x8a847c, 0, 1.72, -1.1], [0.36, 0.28, 0.4, 0x6e6a64, 0, 1.6, -1.5],
      [0.12, 0.08, 0.06, 0x141210, 0, 1.72, -1.71], [0.16, 0.26, 0.1, 0x6e6a64, -0.2, 2.12, -1.02], [0.16, 0.26, 0.1, 0x6e6a64, 0.2, 2.12, -1.02],
      [0.08, 0.08, 0.04, 0xe8c040, -0.17, 1.86, -1.41], [0.08, 0.08, 0.04, 0xe8c040, 0.17, 1.86, -1.41], [0.22, 0.22, 0.85, 0x7a746c, 0, 1.3, 1.15], [0.5, 0.3, 0.5, 0xd8d2c8, 0, 1.12, -0.55]] },
    lion: { name: '사자', n: 0, speed: 2.0, chase: 2.2, pred: 'fierce', bite: 3, leg: [0.36, 1.15, 0xb08a50], lx: 0.45, lz: 0.85, parts: [
      [1.15, 1.05, 2.3, 0xc8a062, 0, 1.75, 0], [1.5, 1.5, 0.95, 0x7a4e22, 0, 2.15, -1.05], [0.82, 0.8, 0.7, 0xd2ac6c, 0, 2.15, -1.6], [0.48, 0.36, 0.3, 0xe2c08a, 0, 1.92, -2.0],
      [0.14, 0.1, 0.06, 0x2a1a10, 0, 2.06, -2.16], [0.1, 0.1, 0.05, 0x1a120a, -0.22, 2.32, -1.96], [0.1, 0.1, 0.05, 0x1a120a, 0.22, 2.32, -1.96],
      [0.18, 0.18, 1.2, 0xc8a062, 0, 1.95, 1.55], [0.3, 0.3, 0.3, 0x5a3818, 0, 1.95, 2.2]] },
    bear: { name: '곰', n: 0, speed: 1.7, chase: 2.0, pred: 'fierce', bite: 3, leg: [0.48, 1.0, 0x3e2a1c], lx: 0.5, lz: 0.75, parts: [
      [1.5, 1.35, 2.3, 0x5a3e2a, 0, 1.75, 0], [1.3, 1.25, 0.7, 0x5a3e2a, 0, 2.05, -0.9], [0.95, 0.9, 0.8, 0x624430, 0, 2.15, -1.45], [0.5, 0.42, 0.4, 0x8a6a4e, 0, 1.95, -1.95],
      [0.16, 0.12, 0.06, 0x141210, 0, 2.1, -2.16], [0.1, 0.1, 0.05, 0x141210, -0.24, 2.36, -1.86], [0.1, 0.1, 0.05, 0x141210, 0.24, 2.36, -1.86],
      [0.26, 0.24, 0.14, 0x4a3222, -0.36, 2.66, -1.4], [0.26, 0.24, 0.14, 0x4a3222, 0.36, 2.66, -1.4]] },
    leopard: { name: '표범', n: 0, speed: 2.4, chase: 2.4, pred: 'shy', bite: 2, leg: [0.24, 1.0, 0xc8a050], lx: 0.34, lz: 0.75, parts: [
      [0.85, 0.75, 2.0, 0xd8b05c, 0, 1.4, 0], [0.62, 0.6, 0.62, 0xd8b05c, 0, 1.62, -1.2], [0.36, 0.26, 0.24, 0xe8cc8a, 0, 1.5, -1.58], [0.12, 0.08, 0.05, 0x2a1a10, 0, 1.58, -1.71],
      [0.09, 0.09, 0.05, 0x1a2a10, -0.17, 1.76, -1.52], [0.09, 0.09, 0.05, 0x1a2a10, 0.17, 1.76, -1.52], [0.14, 0.18, 0.08, 0xc09848, -0.2, 2.0, -1.12], [0.14, 0.18, 0.08, 0xc09848, 0.2, 2.0, -1.12],
      [0.16, 0.16, 1.3, 0xd8b05c, 0, 1.45, 1.6], [0.18, 0.06, 0.18, 0x3a2a18, -0.25, 1.78, -0.5], [0.18, 0.06, 0.18, 0x3a2a18, 0.2, 1.78, 0.2], [0.18, 0.06, 0.18, 0x3a2a18, -0.1, 1.78, 0.7],
      [0.06, 0.18, 0.18, 0x3a2a18, -0.43, 1.45, -0.3], [0.06, 0.18, 0.18, 0x3a2a18, 0.43, 1.55, 0.35], [0.06, 0.18, 0.18, 0x3a2a18, -0.43, 1.35, 0.6], [0.06, 0.18, 0.18, 0x3a2a18, 0.43, 1.3, -0.5]] }
  });
  Object.assign(BEAST_HP, { wolf: 16, lion: 30, bear: 32, leopard: 22 });
  Object.assign(BEAST_DROP, { wolf: [[LEATHER, 0.7, 1, 2], [BONE, 0.6, 1, 2]], lion: [[LEATHER, 0.8, 1, 3], [BONE, 0.6, 1, 2]], bear: [[LEATHER, 0.85, 2, 3], [BONE, 0.6, 1, 2]], leopard: [[LEATHER, 0.8, 1, 2], [BONE, 0.5, 1, 1]] });
  Object.assign(BREEDS, { wolf: 1, lion: 1, bear: 1, leopard: 1 });
  Object.assign(CR_R, { wolf: 1.3, lion: 1.8, bear: 1.8, leopard: 1.4 });
  // 말씀 카드(개역개정 원문, bible.py로 확인 11/24)
  Object.assign(CREATURE, {
    wolf: { emoji: '🐺', name: '이리', ref: '마태복음 10:16', text: '보라 내가 너희를 보냄이 양을 이리 가운데로 보냄과 같도다 그러므로 너희는 뱀 같이 지혜롭고 비둘기 같이 순결하라' },
    lion: { emoji: '🦁', name: '사자', ref: '사무엘상 17:34', text: '다윗이 사울에게 말하되 주의 종이 아버지의 양을 지킬 때에 사자나 곰이 와서 양 떼에서 새끼를 물어가면' },
    bear: { emoji: '🐻', name: '곰', ref: '이사야 11:7', text: '암소와 곰이 함께 먹으며 그것들의 새끼가 함께 엎드리며 사자가 소처럼 풀을 먹을 것이며' },
    leopard: { emoji: '🐆', name: '표범', ref: '이사야 11:6', text: '그 때에 이리가 어린 양과 함께 살며 표범이 어린 염소와 함께 누우며 송아지와 어린 사자와 살진 짐승이 함께 있어 어린 아이에게 끌리며' }
  });
  ['wolf', 'lion', 'bear', 'leopard'].forEach(function (k) { if (CREATURE_KEYS.indexOf(k) < 0) CREATURE_KEYS.push(k); });
  var MEATS = [RAW_LAMB, RAW_GOAT, RAW_BEEF, RAW_CHICKEN, RAW_FISH, COOKED_LAMB, COOKED_GOAT, COOKED_BEEF, COOKED_CHICKEN, COOKED_FISH];
  var PREY = { sheep: 1, goat: 1, chicken: 1, rabbit: 1 };
  // 어느 땅에 어떤 맹수: 요단 수풀의 사자(렘 49:19), 레바논·헤르몬 산의 표범·사자(아 4:8), 숲·눈 땅의 곰, 들·광야의 이리
  var WILD_REG = { jordan: ['lion', 'wolf'], wild: ['wolf', 'wolf', 'leopard', 'lion'], cedar: ['bear', 'leopard', 'wolf'], hermon: ['leopard', 'bear', 'lion'], taiga: ['bear', 'wolf', 'wolf'], snow: ['bear', 'wolf'],
    meadow: ['wolf'], sinai: ['leopard', 'lion'], ararat: ['bear', 'wolf'], west: ['wolf', 'bear'], galilee: ['wolf'] };
  function tameFood(a, id) {
    if (!id) return false;
    if (a.sp.pred) return MEATS.indexOf(id) >= 0;
    if (a.kind === 'chicken' || a.kind === 'frog') return id === SEED;
    return id === WHEAT;
  }
  function isWild(a) { return a.sp && a.sp.pred && !a.tamed; }
  function wildSpawn(cx, cz, x0, z0, reg) {
    var list = WILD_REG[reg]; if (!list) return;
    if (hash2(cx, cz, 61) > 0.05) return;
    var nWild = 0; for (var i = 0; i < animals.length; i++) if (isWild(animals[i])) nWild++;
    if (nWild >= 6) return;
    var kn = list[Math.floor(hash2(cx, cz, 62) * list.length)], n = kn === 'wolf' ? 2 + Math.floor(hash2(cx, cz, 63) * 2) : 1;
    for (i = 0; i < n; i++) {
      var hx = x0 + 6 + hash2(cx + i, cz, 64) * 20, hz = z0 + 6 + hash2(cx, cz + i, 65) * 20;
      if (inTown(hx | 0, hz | 0) || safeZone(hx | 0, hz | 0)) continue;
      var gy = groundAt(hx, hz, SY - 3); if (gy === null) continue;
      terrain(hx | 0, hz | 0); if (gy !== T.h + 1 || T.wtop >= 0 || inCity(hx | 0, hz | 0) || farCityAt(hx | 0, hz | 0, 8)) continue;
      if (Math.hypot(hx - P.x, hz - P.z) < 28) continue;   // 눈앞에서 갑자기 생기지 않게
      animals.push(makeBeast(kn, hx, hz));
    }
  }
  // 맹수가 들어가면 안 되는 곳(마을·땅 칸·집 둘레·방주 등) — stepBeast에서 막음
  function wildSafe(x, z) { return inTown(x | 0, z | 0) || safeZone(x | 0, z | 0); }
  function wildBlocked(a, x, z) { return isWild(a) && wildSafe(x, z) && !wildSafe(a.x, a.z); }   // 들어가는 것만 막음(이미 안에 있으면 나갈 수 있게)
  // 11/24 울타리·닫힌 울타리 문은 짐승이 넘지 못함(마인크래프트처럼) — 어디에 둘러도 우리가 됨
  function fenceId(id) { var s = SHAPE[id]; return !!s && (s.type === 'fence' || s.type === 'wall' || (s.type === 'gate' && !s.open)); }
  function penBlocked(a, x, z, gy) {
    var ix = Math.floor(x), iz = Math.floor(z), fy = Math.floor(a.y + 0.2);
    if (fenceId(get(ix, fy, iz)) || fenceId(get(ix, fy + 1, iz))) return true;
    return gy !== null && fenceId(get(ix, gy - 1, iz));
  }
  function wildSpeed(a) { return a.chasing ? (a.sp.chase || 1.8) : 1; }
  // 길들이기 —— 누를 때(먹이·빈손). 처리했으면 true
  function tameTap(a, held) {
    if (!a || !a.sp || a.sp.seat && a.saddled) return false;
    var food = have(held) > 0 && tameFood(a, held);
    if (a.tamed && !food && (!held || have(held) < 1)) {   // 빈손: 앉아/따라와
      a.sit = !a.sit; a.mode = 'idle'; a.t = 1; savePets();
      toast(a.sit ? '「' + a.sp.name + '」이(가) 여기 머물러요 — 울타리 안이면 그 안에서 지내요 (다시 누르면 따라와요)' : '「' + a.sp.name + '」이(가) 나를 따라와요'); animalCall(a.kind); return true;
    }
    if (!food) return false;
    if (a.baby) { deny('새끼는 아직 어려요'); return true; }
    if (a.tamed) { if (a.sp.pred) { feedAnimal(a, held); return true; } return false; }   // 길든 풀 먹는 짐승은 원래 먹이기(새끼 낳기)로
    if (!a.sp.pred) {   // 들의 풀 먹는 짐승: 먹이면(원래처럼 새끼 낳을 준비도 하고) 3번에 1번꼴로 길듦
      if (a.breedAt && Date.now() < a.breedAt) return false;
      var ok = Math.random() < 1 / 3; feedAnimal(a, held);
      if (ok) { tameBeast(a); heartAt(a); setTimeout(function () { toast('♥ 「' + a.sp.name + '」을(를) 길들였어요! 나를 따라와요 — 빈손으로 누르면 그 자리(울타리 안)에 머물러요'); }, 1200); }
      return true;
    }
    if (a.chasing && a.target === 'player') { deny('화가 나 있어서 먹지 않아요 — 조금 떨어져 있다가 다시 해 봐요'); return true; }
    take(held, 1); bagChanged(); animalCall(a.kind);
    if (Math.random() < 1 / 3) { tameBeast(a); heartAt(a); toast('♥ 「' + a.sp.name + '」을(를) 길들였어요! 나를 따라와요 — 빈손으로 누르면 그 자리(울타리 안)에 머물러요'); unlock('tame');
      if (!S.tameTold) { S.tameTold = 1; saveSettings(); setTimeout(function () { showVerseCard('🐑', '함께 사는 짐승', CREATURE.leopard.text, '이사야 11:6', '길든 짐승은 나를 따라오고, 빈손으로 누르면 울타리 안에 머물러요. 길든 짐승 둘에게 먹이를 주면 새끼가 태어나요'); }, 900); }
    } else { sparkle(a.x, a.y + 1.6, a.z, 0x9a9a9a, 6, { size: 0.35, life: 0.7, v: 1.2, up: 1 }); toast('먹었지만 아직 마음을 열지 않았어요 — 한 번 더 먹여 봐요'); }
    return true;
  }
  function tameBeast(a, quiet) {
    a.tamed = true; a.sit = false; a.chasing = false; a.target = null; a.fleeUntil = 0;
    if (!a.petTag) { a.petTag = textSprite('♥ ' + a.sp.name, 'rgba(0,0,0,0.35)', '#ffd0dc', 0.42); scene.add(a.petTag); }
    if (!quiet) savePets();
  }
  // 저장: 따라다니는 길든 짐승(앉혀 둔 것도) — 다음에 들어오면 내 곁에 다시 나옴
  var PETS = [];
  try { PETS = JSON.parse(localStorage.getItem('arkVillage.pets') || '[]') || []; } catch (e) { PETS = []; }
  var pendingPets = PETS.slice(), petsT = 0;
  function savePets() {
    var a = animals.filter(function (x) { return x.tamed; }).slice(0, 24).map(function (x) { return { k: x.kind, b: x.baby ? 1 : 0, s: x.sit ? 1 : 0, x: Math.round(x.x * 10) / 10, z: Math.round(x.z * 10) / 10 }; });
    pendingPets.forEach(function (o) { if (a.length < 24) a.push(o); });   // 아직 안 불러온 우리 안 짐승도 잃지 않게
    PETS = a; try { localStorage.setItem('arkVillage.pets', JSON.stringify(PETS)); } catch (e) {}
  }
  // ── 11/24 마인크래프트처럼: 맞으면 살짝 떠오르며 뒤로 밀려나고, 맹수는 덤빌 때 달려들기(곰은 뒷발로 일어섰다 내리침) ──
  function knockBeast(a, ux, uz, k) {
    k = k || 1; a.kvx = ux * 6.5 * k; a.kvz = uz * 6.5 * k; a.kvy = 5.2 * Math.min(k, 1.25); a.ky = a.ky || 0;
  }
  function atkTime(a) { return a.kind === 'bear' ? 0.6 : 0.42; }
  function beastFx(a, dt) {
    if (!a.fxInit) { a.mesh.rotation.order = 'YXZ'; a.fxInit = 1; }
    var oy = 0;
    if (a.kvy || a.ky > 0 || a.kvx || a.kvz) {   // 밀려남: 포물선으로 살짝 떴다가 내려앉음
      a.ky = (a.ky || 0) + (a.kvy || 0) * dt; a.kvy = (a.kvy || 0) - 24 * dt;
      if (a.ky <= 0) { a.ky = 0; a.kvy = 0; a.kvx *= 0.35; a.kvz *= 0.35; }
      var nx = a.x + (a.kvx || 0) * dt, nz = a.z + (a.kvz || 0) * dt, gy = groundAt(nx, nz, a.y + 1.2);
      if (gy !== null && gy - a.y <= 1.1 && a.y - gy <= 2.5 && !penBlocked(a, nx, nz, gy) && !wildBlocked(a, nx, nz) && plotAt(nx | 0, nz | 0) === plotAt(a.x | 0, a.z | 0)) { a.x = nx; a.z = nz; a.ty = gy; }
      else { a.kvx = a.kvz = 0; }
      var f = Math.exp(-2.5 * dt); a.kvx *= f; a.kvz *= f; if (Math.abs(a.kvx) + Math.abs(a.kvz) < 0.08) a.kvx = a.kvz = 0;
      a.mesh.position.x = a.x; a.mesh.position.z = a.z; oy += a.ky;
    }
    if (a.atk > 0) {   // 덤비기
      a.atk -= dt; var T = atkTime(a), t = 1 - Math.max(0, a.atk) / T, s = Math.sin(Math.PI * t), ry = a.mesh.rotation.y;
      if (a.kind === 'bear') { a.mesh.rotation.x = 0.9 * s; oy += 0.7 * s; a.legs[0].rotation.x = a.legs[1].rotation.x = 1.2 * s; }
      else { var wind = t < 0.35 ? -Math.sin(t / 0.35 * Math.PI) * 0.12 : 0;   // 몸을 낮췄다가
        a.mesh.rotation.x = -0.22 * s + wind; var fw = 0.9 * s; a.mesh.position.x -= Math.sin(ry) * fw; a.mesh.position.z -= Math.cos(ry) * fw;   // 앞으로 달려듦
        a.legs[0].rotation.x = a.legs[1].rotation.x = 0.8 * s; a.legs[2].rotation.x = a.legs[3].rotation.x = -0.5 * s; oy += 0.35 * s; }
      if (a.atk <= 0) { a.atk = 0; a.mesh.rotation.x = 0; }
    }
    a.mesh.position.y += oy;
  }
  function pounce(a, fn) {   // 달려든 뒤 가장 앞으로 나간 순간에 물기
    a.atk = atkTime(a);
    setTimeout(function () { if (animals.indexOf(a) >= 0 && !a.dead) fn(); }, atkTime(a) * 500);
  }
  function bitePlayer(a) {
    if (Math.hypot(P.x - a.x, P.z - a.z) > 3) return;   // 그 사이 피했으면 빗나감
    var why = a.sp.name + '에게 물렸어요';
    var g = armorGuard(), dmg = Math.round(a.sp.bite * (1 - g)); if (dmg <= 0) { if (vitalsOn()) toast('🛡 갑옷이 막아 주었어요'); } else hurt(dmg, why);
    var dx = P.x - a.x, dz = P.z - a.z, d = Math.hypot(dx, dz) || 1; P.vx = (P.vx || 0) + dx / d * 7; P.vz = (P.vz || 0) + dz / d * 7; if (!P.fly && !P.swim && P.vy <= 0.5) P.vy = 4.5;   // 나도 살짝 떠서 밀려남
    animalCall(a.kind, 1);
  }
  function biteBeast(a, v) {
    if (v.hp === undefined) v.hp = v.baby ? Math.ceil(BEAST_HP[v.kind] / 2) : BEAST_HP[v.kind];
    var now = performance.now(); if (now < (v.iframeUntil || 0)) return; v.iframeUntil = now + 500;
    v.hp -= a.sp.bite; hurtTint(v.mesh, 0.4); animalCall(v.kind);
    { var bx = v.x - a.x, bz = v.z - a.z, bd = Math.hypot(bx, bz) || 1; knockBeast(v, bx / bd, bz / bd, 0.9); }
    if (!v.sp.pred) { v.h = Math.atan2(v.x - a.x, v.z - a.z) + Math.PI; v.mode = 'walk'; v.t = 3; v.fleeUntil = now + 3500; }
    else if (!v.tamed) { v.chasing = true; v.target = a; }
    if (v.hp <= 0) { var i = animals.indexOf(v); if (i >= 0) animals.splice(i, 1); beastDie(v); if (v.petTag) { disposeSprite(v.petTag); v.petTag = null; } if (v.tamed) { toast('「' + v.sp.name + '」이(가) 쓰러졌어요'); savePets(); } }
  }
  // 맹수·길든 짐승의 생각(0.4초마다) + 이동 방향 정하기
  var wildT = 0, wildSeen = {};
  function wildTick(dt) {
    if (pendingPets.length && started) pendingPets = pendingPets.filter(function (o, i) {
      var x = P.x + 2 + (i % 4), z = P.z + 2 + ((i / 4) | 0);
      if (o.s) { if (!colAt(o.x | 0, o.z | 0) || Math.hypot(o.x - P.x, o.z - P.z) > 120) return true; x = o.x; z = o.z; }   // 앉혀 둔 짐승은 그 자리(우리 안)에서 기다림
      if (!colAt(x | 0, z | 0) || groundAt(x, z, SY - 3) === null) return true;
      var a = makeBeast(o.k, x, z); if (o.b) { a.baby = true; a.growAt = Date.now() + 120000; a.mesh.scale.setScalar(0.55); } tameBeast(a, true); a.sit = !!o.s; animals.push(a); return false;
    });
    var now = performance.now();
    for (var i = 0; i < animals.length; i++) {
      var a = animals[i];
      if (a.petTag) { a.petTag.position.set(a.x, a.y + (CR_R[a.kind] || 1.2) * 1.8 + 0.6, a.z); a.petTag.visible = a.mesh.visible && Math.hypot(a.x - P.x, a.z - P.z) < 14; }
      if (a.cool > 0) a.cool -= dt;
    }
    wildT -= dt; if (wildT > 0) return; wildT = 0.4;
    var safeMe = safeZone(Math.floor(P.x), Math.floor(P.z)) || inTown(Math.floor(P.x), Math.floor(P.z)), alive = ui === 'play' && !furnitureRest;
    animals.forEach(function (a) {
      if (!a.sp) return;
      var dP = Math.hypot(a.x - P.x, a.z - P.z), tgt = null;
      if (a.tamed) {
        if (a.sit || a === riding || a.saddled) return;
        // 길든 맹수: 주인 곁 그림자나 주인을 노리는 맹수와 싸움
        if (a.sp.pred && !a.baby) {
          var best = null, bd = 10;
          SHADOWS.forEach(function (s) { if (s.dead) return; var d = Math.hypot(s.x - P.x, s.z - P.z); if (d < bd) { bd = d; best = { sh: s }; } });
          animals.forEach(function (b) { if (b !== a && isWild(b) && b.chasing && b.target === 'player') { var d = Math.hypot(b.x - P.x, b.z - P.z); if (d < bd) { bd = d; best = { a: b }; } } });
          if (best) tgt = best.sh ? { x: best.sh.x, z: best.sh.z, sh: best.sh } : { x: best.a.x, z: best.a.z, a: best.a };
        }
        if (tgt) {
          var dt2 = Math.hypot(tgt.x - a.x, tgt.z - a.z); a.chasing = true; a.h = Math.atan2(-(tgt.x - a.x), -(tgt.z - a.z)); a.mode = 'walk'; a.t = 0.6;
          if (dt2 < 2.2 && !(a.cool > 0)) { a.cool = 1.0; pounce(a, function () { if (tgt.sh) { if (!tgt.sh.dead) hitShadow(tgt.sh, a.sp.bite); } else if (animals.indexOf(tgt.a) >= 0) biteBeast(a, tgt.a); }); }
          return;
        }
        a.chasing = dP > 9;
        if (dP > 40) { var gy = groundAt(P.x + 1.5, P.z + 1.5, P.y + 3); if (gy !== null) { a.x = P.x + 1.5; a.z = P.z + 1.5; a.y = a.ty = gy; } return; }
        if (dP > 5) { a.h = Math.atan2(-(P.x - a.x), -(P.z - a.z)); a.mode = 'walk'; a.t = 0.6; a.luredUntil = Date.now() + 1500; }
        else if (a.mode === 'walk' && dP < 3.5) { a.mode = 'idle'; a.t = 1.5; }
        return;
      }
      if (!a.sp.pred || a.baby) return;
      // 야생 맹수
      if (a.target === 'player' && (!alive || safeMe || dP > 22)) { a.chasing = false; a.target = null; }
      if (a.target && a.target !== 'player' && (animals.indexOf(a.target) < 0 || Math.hypot(a.target.x - a.x, a.target.z - a.z) > 20)) { a.chasing = false; a.target = null; }
      if (!a.target && alive && !safeMe) {
        if (a.angryUntil > now && dP < 22) a.target = 'player';
        else if (a.sp.pred === 'fierce' && dP < 7) a.target = 'player';
      }
      if (!a.target && a.sp.pred === 'hunt') {   // 이리: 들에 사는(길들지 않은) 양·염소·닭·토끼
        var prey = null, pd = 12; animals.forEach(function (b) { if (PREY[b.kind] && !b.tamed && !b.kept && !b.herd && b !== lostSheep) { var d = Math.hypot(b.x - a.x, b.z - a.z); if (d < pd) { pd = d; prey = b; } } });
        if (prey) a.target = prey;
      }
      if (!a.target) { a.chasing = false; return; }
      if (a.target === 'player' && !wildSeen[a.kind] && !DEX['c' + a.kind]) { wildSeen[a.kind] = 1; showCard(a.kind); }
      var tx = a.target === 'player' ? P.x : a.target.x, tz = a.target === 'player' ? P.z : a.target.z, d = Math.hypot(tx - a.x, tz - a.z);
      a.chasing = true; a.h = Math.atan2(-(tx - a.x), -(tz - a.z)); a.mode = d < 1.6 ? 'idle' : 'walk'; a.t = 0.6;
      if (d < 2.1 && !(a.cool > 0)) { a.cool = 1.6; var tg = a.target; pounce(a, function () { if (tg === 'player') bitePlayer(a); else if (animals.indexOf(tg) >= 0 && Math.hypot(tg.x - a.x, tg.z - a.z) < 3) biteBeast(a, tg); }); }
    });
    petsT -= 0.4; if (petsT <= 0) { petsT = 6; if (animals.some(function (x) { return x.tamed; })) savePets(); }
  }
  if (/^(127\.0\.0\.1|localhost)$/.test(location.hostname)) window.__arkWild = { tameTap: tameTap, tameBeast: tameBeast, savePets: savePets, pets: function () { return PETS; }, animals: function () { return animals; }, wildSpawn: wildSpawn, setSel: function (id) { HOTBAR[sel] = id; } };
