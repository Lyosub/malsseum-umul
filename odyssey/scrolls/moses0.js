// 1편 첫머리 「물에서 건져낸 아이」 — 출애굽기 1:22–2:22. 두루마리 문에서 언제든 펼칠 수 있어요.
// 대사 원칙: 성경 인물은 개역개정에 있는 자기 말만, 해설은 원문 + (출처). 2026-09-27 bskorea 원문 대조.
(window.__odyQ = window.__odyQ || []).push(api => {
  const { DLG, ZONES, CONDS, THREE, SPEAKERS: { NAR, MOSES } } = api;
  const GIRL = { n: '모세의 누이' }, PRINCESS = { n: '바로의 딸' }, HEB = { n: '히브리 사람' }, REUEL = { n: '르우엘' }, DAUGHTERS = { n: '르우엘의 딸들' };
  const on = () => api.ST.cur === 'moses0' && api.ST.sp.moses0 && !api.ST.sp.moses0.cleared;
  const st = () => (api.ST.sp.moses0 || {}).step || 0;
  CONDS.prGirl = () => on() && st() >= 3 && st() <= 4;
  CONDS.prPrincess = () => on() && st() === 4;
  CONDS.prReeds = () => on() && st() >= 2 && st() <= 4;
  CONDS.prDaughters = () => on() && st() >= 7;
  ZONES.egypt.points.push({ id: 'pr_reeds', x: -30.2, z: 5.2, type: 'lore', title: '🌾 나일 강 가 갈대 사이', cond: 'prReeds', body: '' });
  ZONES.egypt.points.push({ id: 'pr_girl', x: -24.5, z: 9.5, type: 'villager', title: '모세의 누이', model: 'he-girl-hb', persona: 'rs_static', cond: 'prGirl', body: '' });
  ZONES.egypt.points.push({ id: 'pr_princess', x: -29.4, z: 2.6, type: 'villager', title: '바로의 딸', model: 'eg-noble-f', persona: 'rs_static', cond: 'prPrincess', body: '' });
  ZONES.midian.points.push({ id: 'pr_well', x: 0.8, z: -4.6, type: 'lore', title: '💧 우물', cond: 'prDaughters', body: '' });
  ZONES.midian.points.push({ id: 'pr_daughter', x: 5.4, z: -3.6, type: 'villager', title: '르우엘의 딸들', model: 'he-girl-hb', persona: 'rs_static', cond: 'prDaughters', body: '' });

  api.VERSES['ex2-10'] = { ref: '출애굽기 2:10', text: '그 아기가 자라매 바로의 딸에게로 데려가니 그가 그의 아들이 되니라 그가 그의 이름을 모세라 하여 이르되 이는 내가 그를 물에서 건져내었음이라 하였더라' };
  Object.assign(DLG, {
    pr_birth: [
      [NAR, '그러므로 바로가 그의 모든 백성에게 명령하여 이르되 아들이 태어나거든 너희는 그를 나일 강에 던지고 딸이거든 살려두라 하였더라 (출 1:22)'],
      [NAR, '레위 가족 중 한 사람이 가서 레위 여자에게 장가 들어 (출 2:1)'],
      [NAR, '그 여자가 임신하여 아들을 낳으니 그가 잘 생긴 것을 보고 석 달 동안 그를 숨겼으나 (출 2:2)'],
      [NAR, '▶ 어머니를 도와 갈대 상자를 준비해요.'],
    ],
    pr_basket: [
      [NAR, '더 숨길 수 없게 되매 그를 위하여 갈대 상자를 가져다가 역청과 나무 진을 칠하고 (출 2:3)'],
    ],
    pr_reeds: [
      [NAR, '아기를 거기 담아 나일 강 가 갈대 사이에 두고 (출 2:3)'],
      [NAR, '▶ 멀리 서 있는 아기의 누이에게 가 보세요.'],
    ],
    pr_watch: [
      [NAR, '그의 누이가 어떻게 되는지를 알려고 멀리 섰더니 (출 2:4)'],
      [NAR, '▶ 누군가 강으로 내려오고 있어요.'],
    ],
    pr_princess: [
      [NAR, '바로의 딸이 목욕하러 나일 강으로 내려오고 시녀들은 나일 강 가를 거닐 때에 그가 갈대 사이의 상자를 보고 시녀를 보내어 가져다가 (출 2:5)'],
      [NAR, '열고 그 아기를 보니 아기가 우는지라 그가 그를 불쌍히 여겨 이르되 (출 2:6)'],
      [PRINCESS, '이는 히브리 사람의 아기로다'],
      [GIRL, '내가 가서 당신을 위하여 히브리 여인 중에서 유모를 불러다가 이 아기에게 젖을 먹이게 하리이까'],
      [PRINCESS, '가라'],
      [NAR, '그 소녀가 가서 그 아기의 어머니를 불러오니 (출 2:8)'],
      [PRINCESS, '이 아기를 데려다가 나를 위하여 젖을 먹이라 내가 그 삯을 주리라'],
      [NAR, '여인이 아기를 데려다가 젖을 먹이더니 (출 2:9)'],
      [NAR, '그 아기가 자라매 바로의 딸에게로 데려가니 그가 그의 아들이 되니라 그가 그의 이름을 모세라 하여 이르되 (출 2:10)'],
      [PRINCESS, '이는 내가 그를 물에서 건져내었음이라'],
    ],
    pr_grown: [
      [NAR, '모세가 장성한 후에 한번은 자기 형제들에게 나가서 그들이 고되게 노동하는 것을 보더니 어떤 애굽 사람이 한 히브리 사람 곧 자기 형제를 치는 것을 본지라 (출 2:11)'],
      [NAR, '좌우를 살펴 사람이 없음을 보고 그 애굽 사람을 쳐죽여 모래 속에 감추니라 (출 2:12)'],
      [NAR, '이튿날 다시 나가니 두 히브리 사람이 서로 싸우는지라 그 잘못한 사람에게 이르되 (출 2:13)'],
      [MOSES, '네가 어찌하여 동포를 치느냐'],
      [HEB, '누가 너를 우리를 다스리는 자와 재판관으로 삼았느냐 네가 애굽 사람을 죽인 것처럼 나도 죽이려느냐'],
      [NAR, '모세가 두려워하여 이르되 (출 2:14)'],
      [MOSES, '일이 탄로되었도다'],
      [NAR, '바로가 이 일을 듣고 모세를 죽이고자 하여 찾는지라 모세가 바로의 낯을 피하여 미디안 땅에 머물며 (출 2:15)'],
      [NAR, '▶ 동쪽 끝 길로 미디안 땅으로 가요.'],
    ],
    pr_well: [
      [NAR, '하루는 우물 곁에 앉았더라 (출 2:15)'],
      [NAR, '미디안 제사장에게 일곱 딸이 있었더니 그들이 와서 물을 길어 구유에 채우고 그들의 아버지의 양 떼에게 먹이려 하는데 (출 2:16)'],
      [NAR, '목자들이 와서 그들을 쫓는지라 (출 2:17)'],
    ],
    pr_well_done: [
      [NAR, '모세가 일어나 그들을 도와 그 양 떼에게 먹이니라 (출 2:17)'],
      [NAR, '▶ 딸들의 아버지 르우엘에게 가요.'],
    ],
    pr_reuel: [
      [NAR, '그들이 그들의 아버지 르우엘에게 이를 때에 아버지가 이르되 (출 2:18)'],
      [REUEL, '너희가 오늘은 어찌하여 이같이 속히 돌아오느냐'],
      [DAUGHTERS, '한 애굽 사람이 우리를 목자들의 손에서 건져내고 우리를 위하여 물을 길어 양 떼에게 먹였나이다'],
      [REUEL, '그 사람이 어디에 있느냐 너희가 어찌하여 그 사람을 버려두고 왔느냐 그를 청하여 음식을 대접하라'],
      [NAR, '모세가 그와 동거하기를 기뻐하매 그가 그의 딸 십보라를 모세에게 주었더니 (출 2:21)'],
      [NAR, '그가 아들을 낳으매 모세가 그의 이름을 게르솜이라 하여 이르되 (출 2:22)'],
      [MOSES, '내가 타국에서 나그네가 되었음이라'],
    ],
  });

  // 🧺 갈대 상자에 역청과 나무 진 칠하기(출 2:3)
  function basketGame(q){ api.runDialog(DLG.pr_basket, () => basketMg(q)); }
  function basketMg(q){
    const coats = [['역청', '#2a2420'], ['나무 진', '#8a5a2a']];
    let c = 0, done = new Set();
    api.mgOpen('🧺 갈대 상자', '"갈대 상자를 가져다가 역청과 나무 진을 칠하고" (출 2:3) — 상자 둘레를 빠짐없이 칠해요.');
    const draw = msg => {
      const cells = Array.from({ length: 8 }, (_, i) => { const a = i / 8 * Math.PI * 2, x = 50 + Math.cos(a) * 36, y = 50 + Math.sin(a) * 26;
        const col = c > 0 || done.has(i) ? coats[done.has(i) ? c : c - 1][1] : '#c9b27a';
        return `<button data-seg="${i}" style="position:absolute;left:${x}%;top:${y}%;transform:translate(-50%,-50%);width:44px;height:30px;border-radius:10px;border:2px solid rgba(255,255,255,.35);background:${col}"></button>`; }).join('');
      api.mgArea.innerHTML = `<div style="position:relative;height:170px;margin:6px 10px;border-radius:14px;background:rgba(80,120,150,.25)"><div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:34px">🧺</div>${cells}</div>`
        + `<div style="text-align:center;color:#ffd27a;font-weight:800;min-height:18px">${msg || (c < 2 ? `${coats[c][0]} 칠하기 (${done.size}/8)` : '')}</div>`;
    };
    draw(); api.mgAct.textContent = '다 칠하면 계속'; api.mgAct.disabled = true;
    api.mgArea.onclick = e => { const b = e.target.closest('[data-seg]'); if (!b || c >= 2) return; done.add(+b.dataset.seg);
      if (done.size >= 8){ c++; done = new Set(); if (c >= 2){ draw('✓ 역청과 나무 진을 모두 칠했어요'); api.mgAct.disabled = false; return; } draw(`✓ 역청 칠 끝! 이제 ${coats[c][0]}`); return; }
      draw(); };
    api.mgAct.onclick = () => { if (c < 2) return; api.mgArea.onclick = null; api.mgCloseAll(); api.completeTask(q); };
    api.mg.onClose = () => { api.mgArea.onclick = null; };
  }
  // 💧 우물에서 물 길어 구유 채우기(출 2:16-17)
  function wellGame(q){ api.runDialog(DLG.pr_well, () => wellMg(q)); }
  function wellMg(q){
    let helped = false, water = 0; const N = 8;
    api.mgOpen('💧 우물가', '목자들이 딸들을 쫓아냈어요. 일어나 도와서 구유에 물을 채워요.');
    const draw = () => {
      api.mgArea.innerHTML = `<div style="padding:10px 12px;text-align:center;font-size:30px">${helped ? '🪣' : '🧍'} ${'🐑'.repeat(4)}</div>`
        + `<div style="margin:0 14px;height:18px;border-radius:9px;background:rgba(255,255,255,.1);overflow:hidden"><div style="height:100%;width:${water / N * 100}%;background:#6fb6d8"></div></div>`
        + `<div style="text-align:center;color:#ffd27a;font-weight:800;margin-top:6px">${!helped ? '' : water < N ? `구유 채우기 ${water}/${N}` : '✓ 구유가 가득 찼어요'}</div>`;
      api.mgAct.textContent = !helped ? '🧍 일어나 돕기' : water < N ? '🪣 물 긷기' : '양 떼에게 먹이기';
    };
    draw();
    api.mgAct.onclick = () => { if (!helped){ helped = true; draw(); return; } if (water < N){ water++; draw(); return; } api.mgCloseAll(); api.completeTask(q); };
  }
  // 나일 강 갈대 사이의 갈대 상자
  let basketObj = null;
  function world(zone){
    if (basketObj){ basketObj.parent && basketObj.parent.remove(basketObj); basketObj = null; }
    if (zone !== 'egypt' || !(on() && st() >= 3 && st() <= 4)) return;   // 상자를 둔 뒤 ~ 바로의 딸이 건질 때까지
    const x = -30.9, z = 5.6, y = api.heightAt(x, z);
    const g = new THREE.Group(), mat = new THREE.MeshToonMaterial({ color: 0x5a4630, gradientMap: api.toonGradient });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.34, 0.26, 16), mat); body.scale.set(1.4, 1, 0.8); body.position.y = 0.13; g.add(body);
    const lid = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat); lid.scale.set(1.4, 0.35, 0.8); lid.position.y = 0.26; g.add(lid);
    g.position.set(x, y, z); api.zoneRoot.add(g); basketObj = g;
  }
  return {
    id: 'moses0',
    chapters: [{
      title: '📜 모세와 함께 · 첫머리 — 물에서 건져낸 아이', clearTitle: '🎉 첫머리 「물에서 건져낸 아이」 완료! 이제 1장 「부르심」으로', next: '1장: 부르심',
      steps: [
        { id: 'pr1', zone: 'egypt', obj: '아기를 숨긴 레위 여자 만나기', where: '고센 집들 사이의 히브리 어머니', npc: 'hb_mother', dlg: 'pr_birth' },
        { id: 'pr2', zone: 'egypt', obj: '갈대 상자에 역청과 나무 진 칠하기', where: '히브리 어머니 곁', npc: 'hb_mother', game: 'basket' },
        { id: 'pr3', zone: 'egypt', obj: '나일 강 가 갈대 사이에 상자 두기', where: '마을 서쪽 나일 강 가(빛나는 곳)', point: 'pr_reeds', dlg: 'pr_reeds' },
        { id: 'pr4', zone: 'egypt', obj: '멀리 서 있는 아기의 누이에게 가기', where: '강가에서 조금 떨어진 곳', npc: 'pr_girl', dlg: 'pr_watch' },
        { id: 'pr5', zone: 'egypt', obj: '강으로 내려온 바로의 딸 곁으로', where: '나일 강 가 갈대 사이', npc: 'pr_princess', dlg: 'pr_princess', reward: { verse: 'ex2-10' } },
        { id: 'pr6', zone: 'egypt', obj: '장성한 모세 — 고되게 노동하는 형제들 곁으로', where: '벽돌 작업장 근처의 모세', npc: 'moses', dlg: 'pr_grown', place: { moses: [12.5, 3.2] } },
        { id: 'pr7', zone: 'egypt', obj: '미디안 땅으로 가기', where: '마을 동쪽 끝의 초록 빛기둥', exit: 'to-midian2' },
        { id: 'pr8', zone: 'midian', obj: '우물 곁 — 쫓겨난 딸들을 돕기', where: '마을 가운데 우물(빛나는 곳)', point: 'pr_well', game: 'well', doneDlg: 'pr_well_done', place: { moses: [1.6, -3.2] } },
        { id: 'pr9', zone: 'midian', obj: '딸들의 아버지 르우엘에게 가기', where: '마을의 이드로(르우엘)', npc: 'jethro', dlg: 'pr_reuel', reward: { clear: true } },
      ],
    }],
    games: { basket: basketGame, well: wellGame },
    world,
  };
});
