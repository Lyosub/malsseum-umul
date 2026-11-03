// 7편 「사울과 다윗」 — 사무엘상 8–31장(2026-10-30 전도사님 결정: 삼상 8–31 전체를 한 편, 16장, 부별 배포). 이 파일은 1부 「사울 왕」(1~4장, 삼상 8–12장) · 2부 「버림받은 왕」(5~7장, 삼상 13–15장).
// 대사·구절 카드는 E:\temp\claude-work\saul7\gen7.py가 bskorea 개역개정 원문 파일에서 그대로 뽑는다(손으로 옮기지 않음).
// 무대: 1장 실로와 세겜의 라마(6편과 같은 자리, 삼상 7:17) · 2장 새 마을 기브아와 믹마스(기스의 집·숩 땅의 성읍·하나님의 산) → 기브온 마을(미스바, 6편과 같은 자리)
//       3장 모압 평지(요단 동편 길르앗 야베스) · 기브아 · 길갈 · 4장 길갈. 11:7(겨릿소)은 해설로 읽기만, 11:11 싸움은 먼지만 멀리.
// 새 인물 원화는 GPT 14차(2026-10-30 도착) → 11/24 Meshy 충전 뒤 3D. 그 전에는 기존 모델로 대신한다(M_ 한 곳만 바꾸면 됨).
(window.__odyQ = window.__odyQ || []).push(api => {
  const { DLG, ZONES, CONDS, VERSES, THREE, SPEAKERS: { NAR } } = api;
  const SAUL = { n: '사울' }, SAMUEL = { n: '사무엘' }, ELDERS = { n: '장로들' }, SERVANT = { n: '사환' }, GIRLS = { n: '소녀들' }, PEOPLE = { n: '백성' }, JONATHAN = { n: '요나단' }, ARMOR = { n: '무기를 든 소년' };
  const cur = () => api.ST.cur === 'saul' && api.ST.sp.saul ? api.ST.sp.saul : null;
  const at = (ch, a = 0, b = 99) => () => { const p = cur(); return !!p && p.ch === ch && !p.cleared && p.step >= a && p.step <= b; };
  const any = (...fs) => () => fs.some(f => f());
  // 새 인물 3D(GPT 14차 → Meshy)가 오기 전 임시 모델 — 사무엘은 6편 9장과 같은 모델
  const M_ = { samuel: 'j5-levite-youth', saul: 'j4-spy-1', servant: 'ca-water-boy', kish: 'he-father', uncle: 'he-grandpa', girls: 'he-girl-hb', elders: 'ca-israel-elder',
    prophets: 'he-levite', people: 'he-brickmaker', nahash: 'j5-midianite', messenger: 'ca-horn-blower', jonathan: 'j4-spy-2', armor: 'he-boy-hb' };
  const TALL = 1.12;   // "키는 모든 백성보다 어깨 위만큼 더 컸더라"(삼상 9:2, 10:23)

  // ── 자리 ──
  const RAMAH = [-30, 22];                                                                                   // 실로와 세겜: 라마(6편과 같은 자리)
  const KISH = [-22, 4], SEARCH = [0, 12], WELL = [14, 4], ZGATE = [20, -8], HIGH = [32, -26], EDGE = [10, -16], GODHILL = [-10, -26], FIELD = [-30, 30];   // 기브아와 믹마스
  const RACHEL = [4, 28], TABOR = [-10, 36];
  const MIZ7 = [10, 20], BAGS = [4, 26];                                                                     // 기브온 마을(미스바)
  const JABESH = [-16, 34], AMMON = [0, 40];                                                                 // 모압 평지(요단 동편) — 가운데 성막 뜰을 피해 북쪽
  const GIL7 = [12, 2], WHEAT = [-20, 10];                                                                   // 길갈
  const PASS = [28, 18], BOSES = [24, 24], SENEH = [33, 13], PHIL = [40, 26], MIGRON = [8, 18], HONEY = [10, 33], SMITH = [14, 16], SAM15 = [-16, 3], NIGHT = [-26, -14];   // 2부 기브아와 믹마스 — 믹마스 어귀의 두 바위(14:4)·블레셋 부대·석류나무(14:2)·수풀(14:25)·기브아(15:34)
  const ALT13 = [12, -1], CAMP = [2, 8], GIL15 = [-6, -4];                                                   // 2부 길갈
  // 단계 번호
  // 0장: 0 라마 · 1 장로들 · 2 여호와의 대답 · 3 왕의 제도
  // 1장: 0 기스의 집 · 1 암나귀 찾기 · 2 소녀들 · 3 선견자 · 4 산당 · 5 기름 부음 · 6 세 징조 · 7 선지자의 무리 · 8 숙부 · 9 미스바 · 10 짐보따리
  // 2장: 0 야베스 · 1 밭에서 온 사울 · 2 새벽 세 대 · 3 길갈
  // 3장: 0 증언 · 1 기억의 길 · 2 우레와 비 · 3 기도하기를 쉬는 죄
  // 4장: 0 믹마스 소식 · 1 이레 · 2 철공이 없음
  // 5장: 0 두 바위 · 1 요나단과 소년 · 2 기어 오름 · 3 사울 · 4 수풀의 꿀 · 5 제비
  // 6장: 0 아말렉 · 1 후회하노니 · 2 길갈에서 만남 · 3 양의 소리 · 4 순종이 제사보다
  let dustShow = false, rainShow = false, oilShow = false, dust14 = false;
  Object.assign(CONDS, {
    slOn: () => !!cur(),
    slRamah: at(0, 0, 3),
    slKish: at(1, 0, 0), slSaulHome: at(1, 0, 1), slGirls: at(1, 2, 2), slSaulZuph: at(1, 2, 3), slSamZuph: at(1, 3, 3), slFeast: at(1, 4, 4), slEdge: at(1, 5, 6),
    slProphets: at(1, 7, 7), slUncle: at(1, 8, 8), slMizpah: at(1, 9, 10),
    slJabesh: at(2, 0, 0), slAmmon: at(2, 0, 2), slField: at(2, 1, 1), slDawn: at(2, 2, 2), slGilgal: any(at(2, 3, 3), at(3, 0, 3)), slSam12: at(3, 0, 3),
    slCamp13: at(4, 0, 1), slSmith: at(4, 2, 2), slPass: at(5, 0, 2), slJon: at(5, 1, 2), slMigron: at(5, 3, 5), slHoney: at(5, 4, 4),
    slSam15: at(6, 0, 0), slNight: at(6, 1, 1), slGil15: at(6, 2, 4), slSound: at(6, 3, 3),
  });
  const ZS = ZONES.shiloh.points, ZG = ZONES.gibeah.points, ZB = ZONES.gibeon.points, ZM = ZONES.moab.points, ZL = ZONES.gilgal.points;
  const V_ = (Z, id, xz, title, model, cond, dx = 0, dz = 0, ex = {}) => Z.push({ id, x: xz[0] + dx, z: xz[1] + dz, type: 'villager', title, model, persona: 'rs_static', cond, body: '', ...ex });
  const L_ = (Z, id, xz, title, cond, dx = 0, dz = 0) => Z.push({ id, x: xz[0] + dx, z: xz[1] + dz, type: 'lore', title, cond, body: '' });
  // 1장 라마
  L_(ZS, 'sl_ramah', RAMAH, '라마 — 사무엘의 집', 'slRamah', 3, -2);
  V_(ZS, 'sl_samuel8', RAMAH, '사무엘', M_.samuel, 'slRamah', 4.4, 0.6);
  V_(ZS, 'sl_elders', RAMAH, '이스라엘 장로들', M_.elders, 'slRamah', 1.2, 4);
  V_(ZS, 'sl_elders2', RAMAH, '장로들', M_.elders, 'slRamah', -1.4, 4.6);
  // 2장 기브아와 믹마스
  L_(ZG, 'sl_kish', KISH, '베냐민 사람 기스의 집', 'slKish', 3, 3);
  V_(ZG, 'sl_kishman', KISH, '기스', M_.kish, 'slKish', 4.6, 1);
  V_(ZG, 'sl_saul_home', KISH, '사울', M_.saul, 'slSaulHome', 1.4, 4.6, { scale: TALL });
  V_(ZG, 'sl_servant_home', KISH, '사환', M_.servant, 'slSaulHome', -0.4, 5.4);
  L_(ZG, 'sl_search', SEARCH, '암나귀를 찾아 — 동쪽 길', 'slSaulHome');
  V_(ZG, 'sl_girls', WELL, '물 길으러 나오는 소녀들', M_.girls, 'slGirls', 1.6, 0);
  V_(ZG, 'sl_saul_zuph', WELL, '사울', M_.saul, 'slSaulZuph', -1.6, 1.8, { scale: TALL });
  V_(ZG, 'sl_servant_zuph', WELL, '사환', M_.servant, 'slSaulZuph', -2.8, 0.4);
  V_(ZG, 'sl_samuel_zuph', ZGATE, '사무엘', M_.samuel, 'slSamZuph', 0, 2.4);
  L_(ZG, 'sl_feast', HIGH, '산당 — 객실', 'slFeast', 0, 3);
  V_(ZG, 'sl_samuel_feast', HIGH, '사무엘', M_.samuel, 'slFeast', 2, 1);
  V_(ZG, 'sl_saul_feast', HIGH, '사울', M_.saul, 'slFeast', -2, 1, { scale: TALL });
  L_(ZG, 'sl_edge', EDGE, '성읍 끝', 'slEdge', 0, 2.6);
  V_(ZG, 'sl_samuel_edge', EDGE, '사무엘', M_.samuel, 'slEdge', 1.6, 0);
  V_(ZG, 'sl_saul_edge', EDGE, '사울', M_.saul, 'slEdge', -1.6, 0, { scale: TALL });
  L_(ZG, 'sl_godhill', GODHILL, '하나님의 산 — 선지자의 무리', 'slProphets', 0, 3);
  V_(ZG, 'sl_prophet1', GODHILL, '선지자의 무리', M_.prophets, 'slProphets', 2, 0);
  V_(ZG, 'sl_prophet2', GODHILL, '선지자의 무리', M_.prophets, 'slProphets', 3.4, -1.6);
  V_(ZG, 'sl_saul_god', GODHILL, '사울', M_.saul, 'slProphets', -1.8, 0.8, { scale: TALL });
  V_(ZG, 'sl_uncle', KISH, '사울의 숙부', M_.uncle, 'slUncle', 4.6, 1);
  V_(ZG, 'sl_saul_uncle', KISH, '사울', M_.saul, 'slUncle', 1.4, 4.6, { scale: TALL });
  // 2장 끝 미스바(기브온 마을)
  V_(ZB, 'sl_samuel_miz', MIZ7, '사무엘', M_.samuel, 'slMizpah', 2, 0);
  V_(ZB, 'sl_people_miz', MIZ7, '이스라엘 자손', M_.people, 'slMizpah', -2.4, 2.6);
  L_(ZB, 'sl_bags', BAGS, '짐보따리들 사이', 'slMizpah');
  // 3장 야베스 · 기브아의 밭 · 길갈
  L_(ZM, 'sl_jabesh', JABESH, '길르앗 야베스', 'slJabesh', 3, 3);
  V_(ZM, 'sl_jelders', JABESH, '야베스 장로들', M_.elders, 'slJabesh', 1, 5);
  V_(ZM, 'sl_nahash', AMMON, '암몬 사람 나하스', M_.nahash, 'slAmmon', 0, 3);
  L_(ZM, 'sl_dawn', JABESH, '야베스 — 새벽 전', 'slDawn', 6, 6);
  V_(ZM, 'sl_saul_dawn', JABESH, '사울', M_.saul, 'slDawn', 8, 4, { scale: TALL });
  V_(ZG, 'sl_saul_field', FIELD, '밭에서 소를 몰고 오는 사울', M_.saul, 'slField', 0, -3, { scale: TALL });
  V_(ZG, 'sl_messenger', FIELD, '야베스에서 온 전령', M_.messenger, 'slField', 3, -6);
  L_(ZL, 'sl_renew', GIL7, '길갈 — 여호와 앞에서', 'slGilgal', 0, 3);
  V_(ZL, 'sl_samuel12', GIL7, '사무엘', M_.samuel, 'slSam12', 2, -1);
  V_(ZL, 'sl_saul12', GIL7, '왕 사울', M_.saul, 'slGilgal', -2.4, -1.6, { scale: TALL });
  V_(ZL, 'sl_people12', GIL7, '온 이스라엘', M_.people, 'slSam12', 0, 5);
  L_(ZL, 'sl_wheat', WHEAT, '밀 베는 밭', 'slSam12', 0, 0);
  // 기브온 마을에서 기브아로 가는 길은 엔진(index.html)이 낸다 · 모압 평지에서 요단을 건너 길갈로(6편과 같은 길)
  ZM.push({ id: 'to-gilgal', x: -36.5, z: 9, type: 'exit', title: '요단을 건너 길갈로', to: 'gilgal', spawn: [34, 2], cond: 'slOn' });
  // 5장 길갈 · 기브아
  L_(ZL, 'sl_mich', GIL7, '길갈 — 사울을 따라 모인 백성', 'slCamp13', -4, 5);
  L_(ZL, 'sl_altar13', ALT13, '번제단', 'slCamp13', 0, 2.6);
  V_(ZL, 'sl_saul13', ALT13, '왕 사울', M_.saul, 'slCamp13', -3, 1, { scale: TALL });
  V_(ZL, 'sl_people13', ALT13, '떠는 백성', M_.people, 'slCamp13', 3, 3);
  L_(ZG, 'sl_smith', SMITH, '베냐민 기브아 — 철공이 없는 땅', 'slSmith');
  // 6장 믹마스 어귀
  L_(ZG, 'sl_pass', PASS, '믹마스 어귀 — 두 바위', 'slPass', -3, 3);
  V_(ZG, 'sl_jonathan', PASS, '요나단', M_.jonathan, 'slJon', -1.6, 0.4);
  V_(ZG, 'sl_armor', PASS, '무기를 든 소년', M_.armor, 'slJon', -3.2, 1.6);
  V_(ZG, 'sl_saul14', MIGRON, '석류나무 아래의 사울', M_.saul, 'slMigron', 0, 2.2, { scale: TALL });
  L_(ZG, 'sl_honey', HONEY, '수풀 — 땅에 꿀이 있더라', 'slHoney');
  // 7장 기브아 → 길갈
  V_(ZG, 'sl_samuel15', SAM15, '사무엘', M_.samuel, 'slSam15', 1.6, 0);
  V_(ZG, 'sl_saul15', SAM15, '왕 사울', M_.saul, 'slSam15', -1.6, 0.6, { scale: TALL });
  L_(ZG, 'sl_night', NIGHT, '온 밤을 여호와께 부르짖으니라', 'slNight');
  V_(ZL, 'sl_samuel15g', GIL15, '사무엘', M_.samuel, 'slGil15', 1.6, 0);
  V_(ZL, 'sl_saul15g', GIL15, '왕 사울', M_.saul, 'slGil15', -1.6, 0.6, { scale: TALL });
  L_(ZL, 'sl_camp15', CAMP, '진영 — 들려오는 소리', 'slSound');

/*DLG*/
  DLG.sl_anoint.splice(4, 0, { event: 'anoint' });   // 10:1 기름병을 머리에 붓고
  DLG.sl_dawn_done.splice(1, 0, { event: 'dust' });  // 11:11 — 먼지만 멀리
  DLG.sl_thunder_done.splice(1, 0, { event: 'thunder' });   // 12:18 우레와 비
  const afterRef = (d, ref) => { const i = d.findIndex(l => Array.isArray(l) && l[1].endsWith(`(삼상 ${ref})`)); if (i < 0) throw new Error(ref); return i + 1; };
  DLG.sl_climb_done.splice(afterRef(DLG.sl_climb_done, '14:15'), 0, { event: 'dust14' });   // 14:15-16 — 싸움은 먼지만 멀리
  DLG.sl_obey_done.splice(afterRef(DLG.sl_obey_done, '15:27'), 0, { event: 'tear' });       // 15:27 겉옷자락이 찢어진지라

  const { mgOpen, mgCloseAll, completeTask } = api;
  const btnCss = 'padding:8px 6px;border-radius:10px;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.08);color:#f5e9d0;font-size:13px';
  const LIVES = 3, hearts = n => '❤️'.repeat(Math.max(0, n)) + '🤍'.repeat(Math.max(0, LIVES - n));
  const OUT = '❤️을 다 썼어요 — 처음부터 다시';
  const msgBox = m => `<div style="text-align:center;color:#ffd27a;font-weight:800;min-height:34px;padding:6px 10px 0;font-size:12.5px">${m}</div>`;
  const doneBox = m => `<div style="padding:16px;text-align:center;color:#ffd27a;font-weight:800;line-height:1.6">${m}</div>`;
  Object.assign(api.BADGES, { lost_donkey: { ico: '🫏', name: '암나귀를 찾아 두루 다닌 사람' }, baggage: { ico: '🧳', name: '짐보따리 사이를 본 사람' }, seven_days: { ico: '⏳', name: '이레를 지켜본 사람' }, climbed_two: { ico: '🧗', name: '바위를 기어오른 둘' } });
  function giveBadge(k){ const S = api.ST; if (S.badges.includes(k)) return; S.badges.push(k); api.saveST(); setTimeout(() => api.toast(`${api.BADGES[k].ico} 배지 획득: ${api.BADGES[k].name}`, 2600), 900); }
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  function orderPlay(q, title, info, cards, hint, doneMsg, onDone){
    const shown = cards.map((c, i) => i).sort(() => Math.random() - 0.5); let next = 0, life = LIVES, msg = '', perfect = true;
    mgOpen(title, info);
    const draw = () => {
      api.mgArea.innerHTML = `<div style="padding:6px 12px;font-size:12.5px;line-height:1.7;min-height:30px">${cards.slice(0, next).map((c, i) => `${i + 1}. ${c[0]} <span style="opacity:.6">${c[1] || ''}</span>`).join('<br>') || '—'}</div>`
        + (next < cards.length ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:4px 10px">${shown.filter(i => i >= next).map(i => `<button data-od="${i}" style="${btnCss}">${cards[i][0]}</button>`).join('')}</div>` : '')
        + msgBox(msg || (next < cards.length ? `${next + 1}번째는? · ${hearts(life)}` : doneMsg));
      api.mgAct.textContent = next < cards.length ? '차례대로 놓으면 계속' : '계속'; api.mgAct.disabled = next < cards.length; };
    draw();
    api.mgArea.onclick = e => { const b = e.target.closest('[data-od]'); if (!b || next >= cards.length) return;
      if (+b.dataset.od === next){ next++; msg = ''; } else if (--life <= 0){ next = 0; life = LIVES; perfect = false; shown.sort(() => Math.random() - 0.5); msg = OUT; } else { perfect = false; msg = `${hint} ${hearts(life)}`; }
      draw(); };
    api.mgAct.onclick = () => { if (next < cards.length) return; api.mgArea.onclick = null; mgCloseAll(); if (onDone) onDone(perfect); completeTask(q); };
    api.mg.onClose = () => { api.mgArea.onclick = null; };
  }
  // 👑 왕의 제도(삼상 8:11-17) — 사무엘이 말한 "데려다가·가져다가"만 모으기. 왕 편·백성 편을 고르는 판결은 없다
  function waysGame(q){
    api.runDialog(DLG.sl_ways, () => {
      const T = [['🐎 아들들 — 병거와 말을 어거', '8:11'], ['🛡 아들들 — 천부장·오십부장, 밭 갈기, 무기 만들기', '8:12'], ['🍞 딸들 — 향료·요리·떡 굽는 자', '8:13'],
        ['🍇 밭과 포도원과 감람원의 제일 좋은 것', '8:14'], ['🌾 곡식과 포도원 소산의 십일조', '8:15'], ['🫏 노비와 소년과 나귀들', '8:16'], ['🐑 양 떼의 십분의 일', '8:17']];
      const X = ['🪨 맷돌', '🛏 침상', '🧥 겉옷'];
      const tiles = shuffle([...T.map((t, i) => ({ t: t[0], ref: t[1], ok: true, i })), ...X.map(t => ({ t, ok: false }))]);
      const got = new Set(); let life = LIVES, msg = '';
      mgOpen('👑 왕의 제도', '"너희를 다스릴 왕의 제도는 이러하니라" (삼상 8:11) — 사무엘이 말한 것만 눌러 모아요. 일곱 가지!');
      const done = () => got.size >= T.length;
      const draw = () => {
        api.mgArea.innerHTML = done() ? doneBox('✓ "너희가 그의 종이 될 것이라" (삼상 8:17)')
          : `<div style="padding:4px 12px;font-size:12px;line-height:1.6;opacity:.9;min-height:24px">${[...got].sort().map(i => `${T[i][0]} <span style="opacity:.6">(${T[i][1]})</span>`).join('<br>') || '—'}</div>`
            + `<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:4px 10px">${tiles.map((x, k) => x.ok && got.has(x.i) ? '' : `<button data-wy="${k}" style="${btnCss};font-size:12.5px">${x.t}</button>`).join('')}</div>` + msgBox(msg || `${got.size} / ${T.length} · ${hearts(life)}`);
        api.mgAct.textContent = done() ? '계속' : '일곱 가지를 모으면 계속'; api.mgAct.disabled = !done(); };
      draw();
      api.mgArea.onclick = e => { const b = e.target.closest('[data-wy]'); if (!b || done()) return; const x = tiles[+b.dataset.wy];
        if (x.ok){ got.add(x.i); msg = ''; } else if (--life <= 0){ got.clear(); life = LIVES; msg = OUT; } else msg = `사무엘은 이것을 말하지 않았어요 (삼상 8:11-17) ${hearts(life)}`;
        draw(); };
      api.mgAct.onclick = () => { if (!done()) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; };
    }, null, 'sl_ways');
  }
  // 🫏 암나귀를 찾다가(삼상 9:4) — 땅마다 두루 다녀 보지만 나귀는 끝내 없다. 찾는 게임이 아니라 찾다가 부르심을 받는 이야기
  function searchGame(q){
    api.runDialog(DLG.sl_search, () => {
      const LANDS = [['⛰ 에브라임 산지와 살리사 땅', '두루 다녀 보았으나 찾지 못하고'], ['🏜 사알림 땅', '두루 다녀 보았으나 그 곳에는 없었고'], ['🌳 베냐민 사람의 땅', '두루 다녀 보았으나 찾지 못하니라']];
      const NEED = 5; let land = 0, cells = [], seen = 0, finished = false;
      const roll = () => { cells = [...Array(9)].map(() => ({ o: false, f: Math.random() < 0.35 })); seen = 0; };
      mgOpen('🫏 잃은 암나귀들', '"너는 일어나 한 사환을 데리고 가서 암나귀들을 찾으라" (삼상 9:3) — 🌿를 눌러 두루 찾아봐요.');
      const draw = () => {
        if (finished){ api.mgArea.innerHTML = doneBox(`${LANDS.map(l => `${l[0]} — ${l[1]}`).join('<br>')}<br><br>"그들이 숩 땅에 이른 때에" (삼상 9:5)`); api.mgAct.textContent = '계속'; api.mgAct.disabled = false; return; }
        const L = LANDS[land], over = seen >= NEED;
        api.mgArea.innerHTML = `<div style="text-align:center;font-size:14px;font-weight:800;padding:6px">${L[0]} <span style="opacity:.6;font-size:12px">(${land + 1} / ${LANDS.length})</span></div>`
          + `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:4px 14px">${cells.map((c, i) => `<button data-sr="${i}" style="${btnCss};font-size:22px;padding:10px 0">${!c.o ? '🌿' : c.f ? '👣' : '·'}</button>`).join('')}</div>`
          + (over ? `<div style="padding:6px 14px"><button data-sr="next" style="${btnCss};width:100%;font-size:14px">${land + 1 < LANDS.length ? '➡ 다음 땅으로' : '➡ 숩 땅으로'}</button></div>` : '')
          + msgBox(over ? `"${L[1]}" (삼상 9:4)` : `찾아본 곳 ${seen} / ${NEED}`);
        api.mgAct.textContent = '숩 땅에 이르면 계속'; api.mgAct.disabled = true; };
      roll(); draw();
      api.mgArea.onclick = e => { const b = e.target.closest('[data-sr]'); if (!b || finished) return;
        if (b.dataset.sr === 'next'){ if (seen < NEED) return; if (++land >= LANDS.length) finished = true; else roll(); draw(); return; }
        const c = cells[+b.dataset.sr]; if (c.o) return; c.o = true; seen++;
        if (c.f && seen < NEED) api.toast('👣 발자국 — 그러나 여기도 암나귀는 없어요', 1400); draw(); };
      api.mgAct.onclick = () => { if (!finished) return; api.mgArea.onclick = null; mgCloseAll(); giveBadge('lost_donkey'); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; };
    }, null, 'sl_search');
  }
  // 🫓 세 가지 징조(삼상 10:2-6) — 사무엘이 말한 차례대로
  function signsGame(q){ api.runDialog(DLG.sl_signs, () => orderPlay(q, '🫓 사무엘이 말한 징조', '"이 징조가 네게 임하거든 너는 기회를 따라 행하라" (삼상 10:7) — 사무엘이 말한 차례대로 놓아요.', [
    ['🪦 라헬의 묘실 곁 — 두 사람', '(10:2)'], ['🌳 다볼 상수리나무 — 벧엘로 올라가는 세 사람', '(10:3)'], ['🍞 그들이 주는 떡 두 덩이를 받음', '(10:4)'],
    ['⛰ 하나님의 산 — 예언하며 내려오는 선지자의 무리', '(10:5)'], ['🔥 여호와의 영이 크게 임하리니', '(10:6)'],
  ], '삼상 10:2-6을 다시 읽어 봐요', '✓ "그 날 그 징조도 다 응하니라" (10:9)'), null, 'sl_signs'); }
  // 🧳 짐보따리들 사이(삼상 10:22-23) — "다른 사람보다 어깨 위만큼 컸더라"
  function bagsGame(q){
    api.runDialog(DLG.sl_bags, () => {
      const N = 16, TOPS = ['', '', '', '🧺', '🏺', '🧣', '🪵', '']; let hide = 0, life = LIVES, msg = '', found = false, opened = new Set(), perfect = true, tops = [];
      const roll = () => { hide = Math.floor(Math.random() * N); opened.clear(); tops = [...Array(N)].map(() => TOPS[Math.floor(Math.random() * TOPS.length)]); };
      mgOpen('🧳 짐보따리들 사이', '"그가 백성 중에 서니 다른 사람보다 어깨 위만큼 컸더라" (삼상 10:23) — 짐보따리 위로 머리가 살짝 보이는 곳을 찾아요.');
      const draw = () => {
        api.mgArea.innerHTML = found ? doneBox(`✓ "${LINE['10:23']}" (삼상 10:23)`)
          : `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;padding:6px 10px">${[...Array(N)].map((_, i) => `<button data-bg="${i}" style="${btnCss};padding:4px 0;line-height:1.05"><div style="font-size:${i === hide ? 15 : 12}px;min-height:17px">${opened.has(i) ? '' : i === hide ? '🧑' : tops[i]}</div><div style="font-size:22px">${opened.has(i) ? '·' : '🧳'}</div></button>`).join('')}</div>` + msgBox(msg || hearts(life));
        api.mgAct.textContent = found ? '계속' : '사울을 찾으면 계속'; api.mgAct.disabled = !found; };
      roll(); draw();
      api.mgArea.onclick = e => { const b = e.target.closest('[data-bg]'); if (!b || found) return; const i = +b.dataset.bg;
        if (i === hide){ found = true; } else if (!opened.has(i)){ opened.add(i); perfect = false; if (--life <= 0){ life = LIVES; roll(); msg = OUT; } else msg = `짐보따리뿐이에요 ${hearts(life)}`; }
        draw(); };
      api.mgAct.onclick = () => { if (!found) return; api.mgArea.onclick = null; mgCloseAll(); if (perfect) giveBadge('baggage'); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; };
    }, null, 'sl_bags');
  }
  // 🌅 새벽 세 대(삼상 11:11) — 세 무리를 나누어 새벽에. 학생은 치지 않고, 세 무리를 내보내기만 한다
  function dawnGame(q){
    api.runDialog(DLG.sl_dawn, () => {
      const DAY = 16000, D0 = 0.45, D1 = 0.8; let t0 = performance.now(), sent = [false, false, false], life = LIVES, msg = '', timer = null, finished = false;
      mgOpen('🌅 새벽 세 대', '"사울이 백성을 삼 대로 나누고 새벽에" (삼상 11:11) — 하늘이 🌅 새벽빛일 때 세 무리를 모두 내보내요. 밤에는 아직, 해가 뜨면 늦어요.');
      const k = () => Math.min(1, (performance.now() - t0) / DAY);
      const sky = x => x < D0 ? ['🌙 아직 밤', '#1c2440'] : x < D1 ? ['🌅 새벽', '#c07a50'] : ['☀ 해가 떴어요', '#e6c27a'];
      const draw = () => { const x = k(), [lb, col] = sky(x);
        api.mgArea.innerHTML = finished ? doneBox('✓ "새벽에 적진 한가운데로 들어가서" (삼상 11:11)')
          : `<div style="margin:10px 14px 4px;height:30px;border-radius:8px;background:${col};position:relative;overflow:hidden"><div style="position:absolute;left:${D0 * 100}%;width:${(D1 - D0) * 100}%;top:0;bottom:0;border:2px dashed rgba(255,255,255,.5);border-radius:6px"></div><div style="position:absolute;left:${x * 100}%;top:3px;font-size:18px;transform:translateX(-50%)">${x < D0 ? '🌙' : '☀'}</div></div>`
            + `<div style="text-align:center;font-size:13px;font-weight:800">${lb}</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:8px 12px">${sent.map((s, i) => `<button data-dw="${i}" style="${btnCss};font-size:14px;${s ? 'opacity:.4' : ''}">${s ? '✓' : '⚔'} ${i + 1}대</button>`).join('')}</div>` + msgBox(msg || hearts(life));
        api.mgAct.textContent = finished ? '계속' : '세 무리를 내보내면 계속'; api.mgAct.disabled = !finished; };
      const lose = m => { if (--life <= 0){ life = LIVES; msg = OUT; } else msg = `${m} ${hearts(life)}`; sent = [false, false, false]; t0 = performance.now(); };
      timer = setInterval(() => { if (finished) return; if (k() >= 1) lose('해가 높이 떴어요 — 다시 밤부터'); draw(); }, 120);
      draw();
      api.mgArea.onclick = e => { const b = e.target.closest('[data-dw]'); if (!b || finished) return; const i = +b.dataset.dw, x = k();
        if (sent[i]) return;
        if (x < D0){ msg = '아직 밤이에요 — 새벽까지 기다려요'; }
        else if (x >= D1){ lose('해가 떴어요 — 다시 밤부터'); }
        else { sent[i] = true; msg = ''; if (sent.every(Boolean)){ finished = true; clearInterval(timer); timer = null; } }
        draw(); };
      api.mgAct.onclick = () => { if (!finished) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; if (timer){ clearInterval(timer); timer = null; } };
    }, null, 'sl_dawn');
  }
  // 📜 기억의 길(삼상 12:8-11) — 사무엘이 되짚은 차례. 1~6편에서 지나온 이야기
  function rememberGame(q){ api.runDialog(DLG.sl_remember, () => orderPlay(q, '📜 여호와께서 행하신 일', '"여호와께서 너희와 너희 조상들에게 행하신 모든 공의로운 일" (삼상 12:7) — 사무엘이 말한 차례대로 놓아요.', [
    ['🐪 야곱이 애굽에 들어감', '(12:8)'], ['🔥 모세와 아론을 보내심', '(12:8 · 1–3편)'], ['🏹 하솔 군사령관 시스라', '(12:9 · 5편)'], ['🏛 블레셋 사람들', '(12:9)'], ['👑 모압 왕', '(12:9 · 5편)'],
    ['🏺 여룹바알', '(12:11 · 5편)'], ['🗡 베단', '(12:11)'], ['🛡 입다', '(12:11 · 5편)'], ['🪨 나 사무엘', '(12:11 · 6편)'],
  ], '삼상 12:8-11을 다시 떠올려 봐요', '✓ "너희에게 안전하게 살게 하셨거늘" (12:11)'), null, 'sl_remember'); }
  // ⛈ 우레와 비(삼상 12:17-18) — 맑은 밀 베는 때, 누른 채 기다리기(손을 떼면 처음부터)
  function thunderGame(q){
    api.runDialog(DLG.sl_thunder, () => {
      const NEED = 4500; let t0 = 0, raf = null, done = false, msg = '';
      mgOpen('⛈ 밀 베는 때', '"오늘은 밀 베는 때가 아니냐 내가 여호와께 아뢰리니" (삼상 12:17) — 🙏를 누른 채 기다려요.');
      const draw = () => { const x = t0 ? Math.min(1, (performance.now() - t0) / NEED) : 0;
        api.mgArea.innerHTML = done ? doneBox('✓ "여호와께서 그 날에 우레와 비를 보내시니" (삼상 12:18)')
          : `<div style="text-align:center;font-size:26px;padding:6px">${x < 0.35 ? '☀️🌾' : x < 0.75 ? '🌥🌾' : '🌩🌾'}</div><div style="margin:6px 14px;height:14px;border-radius:7px;background:rgba(255,255,255,.12);overflow:hidden"><div style="height:100%;width:${Math.round(x * 100)}%;background:#9ab4e0"></div></div><div style="padding:0 14px"><button data-th="1" style="${btnCss};width:100%;font-size:22px;padding:14px;touch-action:none">🙏</button></div>` + msgBox(msg);
        api.mgAct.textContent = done ? '계속' : '기다리면 계속'; api.mgAct.disabled = !done; };
      const tick = () => { if (!t0 || done) return; if (performance.now() - t0 >= NEED){ done = true; t0 = 0; flash('#eef4ff', 0.5); draw(); return; } draw(); raf = requestAnimationFrame(tick); };
      const down = e => { if (!e.target.closest('[data-th]') || done) return; e.preventDefault(); t0 = performance.now(); msg = ''; tick(); };
      const up = () => { if (!t0 || done) return; t0 = 0; cancelAnimationFrame(raf); msg = '손을 떼었어요 — 처음부터 다시'; draw(); };
      draw(); api.mgArea.addEventListener('pointerdown', down); window.addEventListener('pointerup', up);
      const cleanup = () => { api.mgArea.removeEventListener('pointerdown', down); window.removeEventListener('pointerup', up); cancelAnimationFrame(raf); };
      api.mgAct.onclick = () => { if (!done) return; cleanup(); mgCloseAll(); completeTask(q); };
      api.mg.onClose = cleanup;
    }, null, 'sl_thunder');
  }

  // ⏳ 이레(삼상 13:8-9) — 날이 갈수록 백성이 흩어진다. 번제 버튼은 언제든 누를 수 있고, 어느 쪽이든 본문은 13:9대로 이어진다(실패 처리 없음)
  function waitGame(q){
    api.runDialog(DLG.sl_wait, () => {
      const DAY = 15000, DAYS = 7, FROM = 3000, TO = 600; let t0 = performance.now(), timer = null, end = '';   // 3000(13:2) → 육백 명 가량(13:15)
      mgOpen('⏳ 길갈에서 이레', '"사울은 사무엘이 정한 기한대로 이레 동안을 기다렸으나" (삼상 13:8)');
      const k = () => Math.min(1, (performance.now() - t0) / (DAY * DAYS));
      const draw = () => { const x = k(), day = Math.min(DAYS, Math.floor(x * DAYS) + 1), n = Math.round((FROM - (FROM - TO) * x) / 10) * 10;
        api.mgArea.innerHTML = end ? doneBox(end)
          : `<div style="text-align:center;font-size:15px;font-weight:800;padding:6px">${day}일째 / 이레</div><div style="margin:4px 14px;height:14px;border-radius:7px;background:rgba(255,255,255,.12);overflow:hidden"><div style="height:100%;width:${Math.round(x * 100)}%;background:#d9b36a"></div></div>`
            + `<div style="text-align:center;font-size:13px;padding:6px">사울과 함께 있는 백성 — 약 ${n.toLocaleString()}명</div><div style="text-align:center;font-size:18px;letter-spacing:1px;min-height:28px">${'🧍'.repeat(Math.max(1, Math.round(10 * n / FROM)))}</div>`
            + `<div style="padding:8px 14px"><button data-wt="1" style="${btnCss};width:100%;font-size:14px">🔥 "번제와 화목제물을 이리로 가져오라" (13:9)</button></div>`;
        api.mgAct.textContent = end ? '계속' : '이레를 지켜보는 중…'; api.mgAct.disabled = !end; };
      const stop = () => { if (timer){ clearInterval(timer); timer = null; } };
      timer = setInterval(() => { if (end) return; if (k() >= 1){ stop(); giveBadge('seven_days'); end = '✓ 이레를 다 지켜보았어요<br>이제 본문을 읽어요 (삼상 13:8-14)'; } draw(); }, 400);
      draw();
      api.mgArea.onclick = e => { if (end || !e.target.closest('[data-wt]')) return; stop(); end = `"${LINE['13:9']}" (삼상 13:9)`; draw(); };
      api.mgAct.onclick = () => { if (!end) return; stop(); api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
      api.mg.onClose = () => { stop(); api.mgArea.onclick = null; };
    }, null, 'sl_wait');
  }
  // 🧗 손 발로 기어 올라갔고(삼상 14:13) — 요나단이 바위를 오르면 소년이 따라와야 다음 바위가 열린다. 치는 장면은 게임에 없다
  function climbGame(q){
    api.runDialog(DLG.sl_climb, () => {
      const H = 6, COLS = 3; let holds = [], jon = 0, boy = 0, life = LIVES, msg = '', perfect = true;
      const roll = () => { holds = [...Array(H)].map(() => Math.floor(Math.random() * COLS)); jon = 0; boy = 0; };
      const done = () => jon >= H && boy >= H;
      mgOpen('🧗 믹마스 어귀의 바위', '"요나단이 손 발로 기어 올라갔고 그 무기를 든 자도 따랐더라" (삼상 14:13) — ✨ 바위를 누르고, 👦 소년이 따라오게 해요.');
      const draw = () => {
        if (done()){ api.mgArea.innerHTML = doneBox('✓ "요나단이 손 발로 기어 올라갔고 그 무기를 든 자도 따랐더라" (삼상 14:13)'); api.mgAct.textContent = '계속'; api.mgAct.disabled = false; return; }
        const rows = []; for (let r = H - 1; r >= 0; r--){ rows.push(`<div style="display:grid;grid-template-columns:repeat(${COLS},1fr);gap:3px">${[...Array(COLS)].map((_, c) => { const isHold = holds[r] === c, next = isHold && r === jon && boy === jon;
          const who = (isHold && jon === r + 1 ? '🧗' : '') + (isHold && boy === r + 1 ? '👦' : '');
          return `<button ${next ? `data-cb="${r}"` : 'data-cx="1"'} style="${btnCss};padding:1px 0;font-size:13px;min-height:23px;line-height:1.1;${next ? 'background:rgba(255,210,122,.35);border-color:#ffd27a' : isHold ? '' : 'opacity:.25'}">${who || (next ? '✨' : isHold ? '🪨' : '')}</button>`; }).join('')}</div>`); }
        api.mgArea.innerHTML = `<div style="display:grid;gap:3px;padding:2px 14px">${rows.join('')}</div><div style="padding:4px 14px"><button data-cf="1" style="${btnCss};width:100%;font-size:13px;padding:5px 6px;${boy < jon ? 'background:rgba(154,180,224,.3);border-color:#9ab4e0' : 'opacity:.5'}">👦 소년이 따라오기</button></div>` + msgBox(msg || `${jon} / ${H} · ${hearts(life)}`);
        api.mgAct.textContent = '둘 다 오르면 계속'; api.mgAct.disabled = true; };
      roll(); draw();
      const miss = m => { perfect = false; if (--life <= 0){ life = LIVES; roll(); msg = OUT; } else msg = `${m} ${hearts(life)}`; };
      api.mgArea.onclick = e => { if (done()) return;
        if (e.target.closest('[data-cf]')){ if (boy < jon){ boy++; msg = ''; } else miss('먼저 요나단이 바위를 올라요'); draw(); return; }
        if (e.target.closest('[data-cb]')){ jon++; msg = ''; draw(); return; }
        if (e.target.closest('[data-cx]') && boy < jon){ miss('"그 무기를 든 자도 따랐더라" — 소년이 아직 아래에 있어요'); draw(); } };
      api.mgAct.onclick = () => { if (!done()) return; api.mgArea.onclick = null; mgCloseAll(); if (perfect) giveBadge('climbed_two'); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; };
    }, null, 'sl_climb');
  }
  // 🔊 양의 소리와 소의 소리(삼상 15:14) — 칸을 누르면 소리가 얼마나 가까운지 보여 준다. 두 곳을 모두 찾으면 계속
  function soundGame(q){
    api.runDialog(DLG.sl_sound, () => {
      const R = 4, C = 4, N = R * C; const pos = shuffle([...Array(N).keys()]).slice(0, 2), names = ['🐑', '🐂']; const opened = new Map(), got = new Set(); let msg = '';
      const dist = (a, b) => Math.abs((a % C) - (b % C)) + Math.abs(Math.floor(a / C) - Math.floor(b / C));
      const near = i => Math.min(...pos.filter((p, k) => !got.has(k)).map(p => dist(i, p)));
      const bar = d => d <= 1 ? '🔊🔊🔊' : d === 2 ? '🔊🔊' : '🔉';
      const done = () => got.size >= 2;
      mgOpen('🔊 내 귀에 들려오는 소리', '"이 양의 소리와 내게 들리는 소의 소리는 어찌 됨이니이까" (삼상 15:14) — 진영을 눌러 🔊가 많은 쪽으로 찾아가요.');
      const draw = () => {
        api.mgArea.innerHTML = done() ? doneBox(`✓ "${LINE['15:14']}" (삼상 15:14)`)
          : `<div style="display:grid;grid-template-columns:repeat(${C},1fr);gap:5px;padding:6px 12px">${[...Array(N).keys()].map(i => { const k = pos.indexOf(i); const v = k >= 0 && got.has(k) ? names[k] : opened.has(i) ? opened.get(i) : '⛺'; return `<button data-sd="${i}" style="${btnCss};font-size:${opened.has(i) ? 12 : 18}px;min-height:38px;padding:4px 0">${v}</button>`; }).join('')}</div>` + msgBox(msg || `찾은 소리 ${got.size} / 2`);
        api.mgAct.textContent = done() ? '계속' : '두 소리를 찾으면 계속'; api.mgAct.disabled = !done(); };
      draw();
      api.mgArea.onclick = e => { const b = e.target.closest('[data-sd]'); if (!b || done()) return; const i = +b.dataset.sd, k = pos.indexOf(i);
        if (k >= 0 && !got.has(k)){ got.add(k); opened.delete(i); msg = k === 0 ? '🐑 양의 소리예요!' : '🐂 소의 소리예요!'; if (!done()) opened.forEach((_, j) => opened.set(j, bar(near(j)))); }
        else if (k < 0){ opened.set(i, bar(near(i))); msg = ''; }
        draw(); };
      api.mgAct.onclick = () => { if (!done()) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; };
    }, null, 'sl_sound');
  }
  // 📖 삼상 15:22 — 사무엘의 대답을 차례대로
  function obeyGame(q){ api.runDialog(DLG.sl_obey, () => orderPlay(q, '📖 사무엘의 대답', '"사무엘이 이르되" (삼상 15:22) — 차례대로 놓아요.', OBEY.map(t => [t, '']), '삼상 15:22를 다시 떠올려 봐요', '✓ 삼상 15:22'), null, 'sl_obey'); }

  // ── 연출 ──
  function flash(col, o = 0.5){ const fl = document.getElementById('flash'); if (!fl) return; fl.style.transition = 'none'; fl.style.background = col; fl.style.opacity = String(o); setTimeout(() => { fl.style.transition = 'opacity 1.2s'; fl.style.opacity = '0'; }, 120); setTimeout(() => { fl.style.background = ''; }, 1500); }
  const refresh = zid => { if (api.Z && api.Z.id === zid) world(zid); };
  function anoint(){ oilShow = true; flash('#ffe9a8', 0.45); refresh('gibeah'); }
  function dust(){ dustShow = true; refresh('moab'); }
  function dustFar(){ dust14 = true; refresh('gibeah'); }
  function tear(){ flash('#d8c4a0', 0.4); }
  function thunder(){ rainShow = true; flash('#eef4ff', 0.6); setTimeout(() => flash('#eef4ff', 0.5), 700); refresh('gilgal');
    try { api.startCine('slThunder', WHEAT[0], api.heightAt(WHEAT[0], WHEAT[1]) + 5, WHEAT[1], { r: 18, h: 8, dur: 4, spin: 0.3 }); } catch (e){} }

  // ── 마을에 놓이는 것 ──
  let worldObj = null;
  const propFail = {};
  function needProps(names, zid){
    const need = names.filter(n => api.PROP_DEFS[n] && !api.propTemplates[n] && !propFail[n]); if (!need.length) return;
    api.loadProps(need).then(() => { need.forEach(n => { if (!api.propTemplates[n]) propFail[n] = true; }); refresh(zid); }).catch(() => { need.forEach(n => propFail[n] = true); });
  }
  function world(zid){
    if (worldObj && worldObj.parent) worldObj.parent.remove(worldObj); worldObj = null;
    const p = cur(); if (!p) return;
    if (api.setRiver) api.setRiver(false);
    const g = new THREE.Group(), M = c => new THREE.MeshToonMaterial({ color: c, gradientMap: api.toonGradient });
    const put = (geo, mat, x, dy, z, ry = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, api.heightAt(x, z) + dy, z); m.rotation.y = ry; m.castShadow = true; g.add(m); return m; };
    const obst = (x, z, r) => { if (!api.obstacles.some(o => o.x === x && o.z === z)) api.obstacles.push({ x, z, r }); };
    const prop = (n, x, z, ry = 0, dy = 0) => { const T = api.propTemplates[n]; if (!T) return null; const o = T.holder.clone(true); o.position.set(x, api.heightAt(x, z) + dy, z); o.rotation.y = ry; g.add(o); return o; };
    const house = (x, z, w = 4, d = 3.4, col = 0xd8c4a0) => { put(new THREE.BoxGeometry(w, 2.6, d), M(col), x, 1.3, z); put(new THREE.BoxGeometry(w + 0.4, 0.25, d + 0.4), M(0xb89a70), x, 2.7, z); obst(x, z, Math.max(w, d) / 2 + 0.4); };
    const sprites = (cx, cz, n, col, op, sx, sy, y0, spread) => { for (let i = 0; i < n; i++){ const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: api.flameTex, color: col, depthWrite: false, transparent: true, opacity: op })); s.position.set(cx + (Math.random() - 0.5) * spread, api.heightAt(cx, cz) + y0 + Math.random() * 3, cz + (Math.random() - 0.5) * spread); s.scale.set(sx, sy, 1); g.add(s); } };
    if (zid === 'shiloh' && p.ch === 0) house(RAMAH[0], RAMAH[1], 5, 4);   // 라마의 사무엘의 집(7:17)
    if (zid === 'gibeah'){
      needProps(['well', 'bull', 'tent-small', 'env-acacia', 'pillar'], 'gibeah');
      // 기브아: 서쪽 마을 — 기스의 집(9:1), 10:26 "사울도 기브아 자기 집으로"
      [[-28, -4], [-18, -8], [-30, 8], [-14, 12], [-24, 14]].forEach(([x, z]) => house(x, z, 3.6, 3, 0xdcc8a2));
      house(KISH[0], KISH[1] - 3, 4.6, 3.6, 0xd6c098);
      // 숩 땅의 성읍: 동쪽 비탈 위 — 우물(9:11), 성문(9:18), 산당(9:12, 9:25 지붕)
      [[24, -14], [30, -10], [18, -20], [28, -18], [36, -16]].forEach(([x, z]) => house(x, z, 3.4, 3, 0xd8c6a4));
      prop('well', WELL[0], WELL[1], 0.4);
      put(new THREE.BoxGeometry(1.2, 3.6, 3.4), M(0xcdb896), ZGATE[0] - 2.4, 1.8, ZGATE[1]); put(new THREE.BoxGeometry(1.2, 3.6, 3.4), M(0xcdb896), ZGATE[0] + 2.4, 1.8, ZGATE[1]); put(new THREE.BoxGeometry(6, 0.7, 3.6), M(0xcdb896), ZGATE[0], 3.9, ZGATE[1]);
      obst(ZGATE[0] - 2.4, ZGATE[1], 1.6); obst(ZGATE[0] + 2.4, ZGATE[1], 1.6);
      put(new THREE.BoxGeometry(8, 0.5, 6), M(0xc8b28c), HIGH[0], 0.25, HIGH[1]); put(new THREE.BoxGeometry(1.4, 1, 1.4), M(0xb8a888), HIGH[0], 1, HIGH[1] - 1.6);   // 산당 단과 제단
      house(HIGH[0] - 5, HIGH[1] + 2, 3.6, 3, 0xd8c6a4);   // 객실(9:22)
      // 라헬의 묘실(10:2) · 다볼 상수리나무(10:3) · 하나님의 산과 블레셋 사람들의 영문(10:5)
      { const r = put(new THREE.CylinderGeometry(0.6, 0.8, 2.2, 8), M(0xb8a888), RACHEL[0], 1.1, RACHEL[1]); obst(RACHEL[0], RACHEL[1], 1); }
      prop('env-acacia', TABOR[0], TABOR[1], 0.6);
      prop('tent-small', GODHILL[0] + 8, GODHILL[1] - 10, 1.2); prop('tent-small', GODHILL[0] + 12, GODHILL[1] - 8, 2.4);
      // 3장: 밭에서 소를 몰고 오는 사울(11:5)
      if (p.ch === 2){ prop('bull', FIELD[0] + 1.6, FIELD[1] - 1, 0.3); prop('bull', FIELD[0] - 1.4, FIELD[1] - 0.6, 0.3); }
      for (let i = 0; i < 4; i++) put(new THREE.BoxGeometry(3, 0.12, 2.4), M(0x9a8058), FIELD[0] - 5 + i * 3.4, 0.06, FIELD[1] + 3);   // 갈아 놓은 밭
      if (oilShow || (p.ch === 1 && p.step >= 6)) sprites(EDGE[0] - 1.6, EDGE[1], 3, 0xffe2a0, 0.35, 1.2, 1.2, 2.4, 1);
      if (p.ch === 5){
        needProps(['env-rock-hill', 'env-acacia', 'tent-small', 'honeycomb'], 'gibeah');
        prop('env-rock-hill', BOSES[0], BOSES[1], 0.4); prop('env-rock-hill', SENEH[0], SENEH[1], 2.1); obst(BOSES[0], BOSES[1], 3); obst(SENEH[0], SENEH[1], 3);   // 보세스와 세네(14:4)
        if (!dust14 && p.step <= 2){ prop('tent-small', PHIL[0], PHIL[1], 1); prop('tent-small', PHIL[0] - 4, PHIL[1] + 3, 2.2); }   // 블레셋 사람들의 부대(14:1)
        if (dust14 || p.step >= 3) sprites(PHIL[0], PHIL[1], 8, 0xb8a890, 0.42, 4, 3, 2, 10);   // 14:15-16 — 먼지만 멀리
        prop('env-acacia', MIGRON[0] - 2.4, MIGRON[1] - 1.6, 0.8);   // 미그론의 석류나무(14:2)
        if (p.step === 4){ if (api.propTemplates.honeycomb) prop('honeycomb', HONEY[0], HONEY[1], 0.5); else put(new THREE.BoxGeometry(0.7, 0.3, 0.5), M(0xe0a93a), HONEY[0], 0.15, HONEY[1]); }   // 땅에 꿀이 있더라(14:25)
      }
    }
    if (zid === 'gibeon' && p.ch === 1 && p.step >= 9){
      needProps(['tent-small', 'tent-mid', 'crates-sacks', 'pilgrim-bundle'], 'gibeon');
      [[-4, 2], [3, 4], [-1, -4], [6, -2]].forEach(([dx, dz], i) => prop(i % 2 ? 'tent-small' : 'tent-mid', MIZ7[0] + dx, MIZ7[1] + dz, i * 1.3));   // 미스바에 모임(10:17)
      [[0, 0], [1.6, 0.8], [-1.4, 1], [0.6, -1.4], [-0.8, -1.2], [2.2, -0.8]].forEach(([dx, dz], i) => prop(i % 2 ? 'pilgrim-bundle' : 'crates-sacks', BAGS[0] + dx, BAGS[1] + dz, i * 1.1));   // 짐보따리들(10:22)
    }
    if (zid === 'moab' && p.ch === 2){
      needProps(['tent-cluster', 'tent-mid'], 'moab');
      // 길르앗 야베스 성벽(11:1) — 성읍만 낮은 담으로
      for (let i = 0; i < 10; i++){ const a = i / 10 * Math.PI * 2; if (i === 2) continue; put(new THREE.BoxGeometry(3.4, 2.2, 0.8), M(0xcdb896), JABESH[0] + Math.cos(a) * 6, 1.1, JABESH[1] + Math.sin(a) * 6, -a + Math.PI / 2); }
      house(JABESH[0] - 1.6, JABESH[1] - 1.4, 3.4, 3, 0xdcc8a2); house(JABESH[0] + 2, JABESH[1] + 0.6, 3, 2.6, 0xd8c4a0);
      if (p.step <= 2 && !dustShow){ prop('tent-cluster', AMMON[0] + 4, AMMON[1] - 4, 0.8); prop('tent-mid', AMMON[0] - 3, AMMON[1] - 6, 2); }   // 암몬 사람의 진
      if (dustShow) sprites(AMMON[0], AMMON[1] - 6, 9, 0xb8a890, 0.45, 4, 3, 2, 12);   // 11:11 — 싸움은 먼지만 멀리
    }
    if (zid === 'gilgal' && (p.ch === 3 || (p.ch === 2 && p.step >= 3))){
      needProps(['grain-field', 'tent-small'], 'gilgal');
      put(new THREE.BoxGeometry(1.8, 1.1, 1.8), M(0xb8a888), GIL7[0], 0.55, GIL7[1] - 3); obst(GIL7[0], GIL7[1] - 3, 1.3);   // 화목제(11:15)
      for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) prop('grain-field', WHEAT[0] - 4 + i * 4, WHEAT[1] - 2 + j * 3.4, 0);   // 밀 베는 때(12:17)
      if (rainShow || (p.ch === 3 && p.step >= 3)){ sprites(WHEAT[0], WHEAT[1], 7, 0x7a8090, 0.5, 7, 4, 9, 14); sprites(GIL7[0], GIL7[1], 5, 0x8a90a0, 0.45, 7, 4, 9, 12); }
    }
    if (zid === 'gilgal' && (p.ch === 4 || p.ch === 6)){
      needProps(['tent-small', 'tent-mid', 'lamb', 'bull'], 'gilgal');
      [[-6, 10], [6, 12], [-14, 2], [18, 10]].forEach(([x, z], i) => prop(i % 2 ? 'tent-small' : 'tent-mid', x, z, i * 1.2));   // 길갈로 모인 백성(13:4)
      put(new THREE.BoxGeometry(1.8, 1.1, 1.8), M(0xb8a888), ALT13[0], 0.55, ALT13[1]); obst(ALT13[0], ALT13[1], 1.3);   // 번제단(13:9)
      if (p.ch === 6){ prop('lamb', CAMP[0] - 2, CAMP[1] + 1, 0.4); prop('lamb', CAMP[0] - 3, CAMP[1] - 1, 1.6); prop('bull', CAMP[0] + 2.4, CAMP[1], 0.8); }   // 끌어 온 양과 소(15:15)
    }
    api.zoneRoot.add(g); worldObj = g;
  }

  const T = n => `📜 사울과 다윗 ${n}장`;
  return {
    id: 'saul',
    chapters: [
      { title: `${T(1)} — 우리에게 왕을 주어`, clearTitle: '🎉 7편 1장 「우리에게 왕을 주어」 완료!', next: '2장: 암나귀를 찾다가',
        steps: [
          { id: 's1s1', zone: 'shiloh', obj: '사무엘이 늙으매', where: '실로 서쪽 라마의 사무엘의 집(빛나는 곳)', point: 'sl_ramah', dlg: 'sl_ramah' },
          { id: 's1s2', zone: 'shiloh', obj: '"모든 나라와 같이 우리에게 왕을 세워"', where: '라마의 장로들', npc: 'sl_elders', dlg: 'sl_elders' },
          { id: 's1s3', zone: 'shiloh', obj: '여호와께서 사무엘에게 이르시되', where: '라마의 사무엘', npc: 'sl_samuel8', dlg: 'sl_answer' },
          { id: 's1s4', zone: 'shiloh', obj: '왕의 제도', where: '라마의 사무엘', npc: 'sl_samuel8', game: 'ways', doneDlg: 'sl_ways_done', reward: { verse: '1sa8-7', clear: true } },
        ] },
      { title: `${T(2)} — 암나귀를 찾다가`, clearTitle: '🎉 7편 2장 「암나귀를 찾다가」 완료!', next: '3장: 야베스 길르앗을 구함',
        steps: [
          { id: 's2s1', zone: 'gibeah', obj: '기스가 암나귀들을 잃고', where: '기브아 서쪽 기스의 집(빛나는 곳)', point: 'sl_kish', dlg: 'sl_kish' },
          { id: 's2s2', zone: 'gibeah', obj: '암나귀를 찾아 두루 다니기', where: '마을 동쪽 길(빛나는 곳)', point: 'sl_search', game: 'search', doneDlg: 'sl_search_done' },
          { id: 's2s3', zone: 'gibeah', obj: '"선견자가 여기 있느냐"', where: '비탈길 우물가의 소녀들', npc: 'sl_girls', dlg: 'sl_girls' },
          { id: 's2s4', zone: 'gibeah', obj: '"내가 선견자이니라"', where: '숩 땅의 성읍 성문 안의 사무엘', npc: 'sl_samuel_zuph', dlg: 'sl_seer' },
          { id: 's2s5', zone: 'gibeah', obj: '산당의 객실', where: '성읍 위 산당(빛나는 곳)', point: 'sl_feast', dlg: 'sl_feast' },
          { id: 's2s6', zone: 'gibeah', obj: '기름병을 가져다가', where: '성읍 끝(빛나는 곳)', point: 'sl_edge', dlg: 'sl_anoint' },
          { id: 's2s7', zone: 'gibeah', obj: '사무엘이 말한 징조', where: '성읍 끝(빛나는 곳)', point: 'sl_edge', game: 'signs', doneDlg: 'sl_signs_done' },
          { id: 's2s8', zone: 'gibeah', obj: '사울도 선지자들 중에 있느냐', where: '북쪽 하나님의 산(빛나는 곳)', point: 'sl_godhill', dlg: 'sl_prophets' },
          { id: 's2s9', zone: 'gibeah', obj: '"너희가 어디로 갔더냐"', where: '기스의 집의 사울의 숙부', npc: 'sl_uncle', dlg: 'sl_uncle' },
          { id: 's2s10', zone: 'gibeon', obj: '미스바에 모인 백성', where: '기브온 마을 미스바의 사무엘', npc: 'sl_samuel_miz', dlg: 'sl_mizpah' },
          { id: 's2s11', zone: 'gibeon', obj: '짐보따리들 사이에', where: '미스바의 짐보따리 더미(빛나는 곳)', point: 'sl_bags', game: 'bags', doneDlg: 'sl_bags_done', reward: { verse: ['1sa9-16', '1sa10-24'], clear: true } },
        ] },
      { title: `${T(3)} — 야베스 길르앗을 구함`, clearTitle: '🎉 7편 3장 「야베스 길르앗을 구함」 완료!', next: '4장: 기도하기를 쉬는 죄',
        steps: [
          { id: 's3s1', zone: 'moab', obj: '암몬 사람 나하스가 올라와서', where: '요단 동편 길르앗 야베스(빛나는 곳)', point: 'sl_jabesh', dlg: 'sl_jabesh' },
          { id: 's3s2', zone: 'gibeah', obj: '밭에서 소를 몰고 오다가', where: '기브아 남서쪽 밭의 사울', npc: 'sl_saul_field', dlg: 'sl_field' },
          { id: 's3s3', zone: 'moab', obj: '삼 대로 나누고 새벽에', where: '야베스 앞(빛나는 곳)', point: 'sl_dawn', game: 'dawn', doneDlg: 'sl_dawn_done' },
          { id: 's3s4', zone: 'gilgal', obj: '길갈에서 나라를 새롭게', where: '길갈 — 여호와 앞(빛나는 곳)', point: 'sl_renew', dlg: 'sl_renew', reward: { verse: '1sa11-13', clear: true } },
        ] },
      { title: `${T(4)} — 기도하기를 쉬는 죄`, clearTitle: '🎉 7편 1부 「사울 왕」을 마쳤어요!', next: '5장: 이레를 기다렸으나',
        steps: [
          { id: 's4s1', zone: 'gilgal', obj: '"내가 누구의 소를 빼앗았느냐"', where: '길갈의 사무엘', npc: 'sl_samuel12', dlg: 'sl_witness' },
          { id: 's4s2', zone: 'gilgal', obj: '여호와께서 행하신 공의로운 일', where: '길갈의 사무엘', npc: 'sl_samuel12', game: 'remember', doneDlg: 'sl_remember_done' },
          { id: 's4s3', zone: 'gilgal', obj: '밀 베는 때의 우레와 비', where: '서쪽 밀밭(빛나는 곳)', point: 'sl_wheat', game: 'thunder', doneDlg: 'sl_thunder_done' },
          { id: 's4s4', zone: 'gilgal', obj: '기도하기를 쉬는 죄', where: '길갈의 사무엘', npc: 'sl_samuel12', dlg: 'sl_pray', reward: { verse: ['1sa12-23', '1sa12-24'], clear: true } },
        ] },
      { title: `${T(5)} — 이레를 기다렸으나`, clearTitle: '🎉 7편 5장 「이레를 기다렸으나」 완료!', next: '6장: 요나단과 무기 든 소년',
        steps: [
          { id: 's5s1', zone: 'gilgal', obj: '믹마스에 모인 블레셋 사람들', where: '길갈 진영(빛나는 곳)', point: 'sl_mich', dlg: 'sl_mich' },
          { id: 's5s2', zone: 'gilgal', obj: '이레 동안을 기다렸으나', where: '길갈의 번제단(빛나는 곳)', point: 'sl_altar13', game: 'wait', doneDlg: 'sl_wait_done' },
          { id: 's5s3', zone: 'gibeah', obj: '이스라엘 온 땅에 철공이 없었으니', where: '기브아 동쪽 길(빛나는 곳)', point: 'sl_smith', dlg: 'sl_smith', reward: { verse: '1sa13-14', clear: true } },
        ] },
      { title: `${T(6)} — 요나단과 무기 든 소년`, clearTitle: '🎉 7편 6장 「요나단과 무기 든 소년」 완료!', next: '7장: 순종이 제사보다 낫고',
        steps: [
          { id: 's6s1', zone: 'gibeah', obj: '보세스와 세네', where: '동남쪽 믹마스 어귀(빛나는 곳)', point: 'sl_pass', dlg: 'sl_pass' },
          { id: 's6s2', zone: 'gibeah', obj: '"사람이 많고 적음에 달리지 아니하였느니라"', where: '두 바위 곁의 요나단', npc: 'sl_jonathan', dlg: 'sl_jon' },
          { id: 's6s3', zone: 'gibeah', obj: '손 발로 기어 올라갔고', where: '두 바위 곁의 요나단', npc: 'sl_jonathan', game: 'climb', doneDlg: 'sl_climb_done' },
          { id: 's6s4', zone: 'gibeah', obj: '누가 나갔는지 점호하여 보라', where: '석류나무 아래의 사울', npc: 'sl_saul14', dlg: 'sl_saul14' },
          { id: 's6s5', zone: 'gibeah', obj: '땅에 꿀이 있더라', where: '남쪽 수풀(빛나는 곳)', point: 'sl_honey', dlg: 'sl_honey' },
          { id: 's6s6', zone: 'gibeah', obj: '백성이 요나단을 구원하여', where: '석류나무 아래의 사울', npc: 'sl_saul14', dlg: 'sl_lots', reward: { verse: '1sa14-6', clear: true } },
        ] },
      { title: `${T(7)} — 순종이 제사보다 낫고`, clearTitle: '🎉 7편 2부 「버림받은 왕」을 마쳤어요! 3부는 준비하고 있어요', next: '8장: 사람은 외모를 보거니와 (준비 중)',
        steps: [
          { id: 's7s1', zone: 'gibeah', obj: '"이제 왕은 여호와의 말씀을 들으소서"', where: '기브아 기스의 집 곁의 사무엘', npc: 'sl_samuel15', dlg: 'sl_amalek' },
          { id: 's7s2', zone: 'gibeah', obj: '내가 사울을 왕으로 세운 것을 후회하노니', where: '기브아 북쪽(빛나는 곳)', point: 'sl_night', dlg: 'sl_regret' },
          { id: 's7s3', zone: 'gilgal', obj: '"내가 여호와의 명령을 행하였나이다"', where: '길갈의 사울', npc: 'sl_saul15g', dlg: 'sl_meet' },
          { id: 's7s4', zone: 'gilgal', obj: '이 양의 소리와 소의 소리', where: '길갈 진영(빛나는 곳)', point: 'sl_camp15', game: 'sound', doneDlg: 'sl_sound_done' },
          { id: 's7s5', zone: 'gilgal', obj: '순종이 제사보다 낫고', where: '길갈의 사무엘', npc: 'sl_samuel15g', game: 'obey', doneDlg: 'sl_obey_done', reward: { verse: '1sa15-22', clear: true } },
        ] },
    ],
    games: { ways: waysGame, search: searchGame, signs: signsGame, bags: bagsGame, dawn: dawnGame, remember: rememberGame, thunder: thunderGame, wait: waitGame, climb: climbGame, sound: soundGame, obey: obeyGame },
    events: { anoint, dust, thunder, dust14: dustFar, tear },
    world: zid => world(zid),
  };
});
