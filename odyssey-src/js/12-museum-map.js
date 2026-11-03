  // ── 1. 기념 전시관: 모세 편(10장)을 마치면 첫 받침대에 두 돌판 ──
  const PEDESTALS = [[7.2, -8.8], [8.4, -6.6], [9.9, -4.7], [11.6, -3.0], [13.4, -1.6], [15.3, -0.4], [17.3, 0.5]];
  let exhibitObj = null;
  async function buildExhibit(){
    if (exhibitObj){ exhibitObj.parent && exhibitObj.parent.remove(exhibitObj); exhibitObj = null; }
    if (!Z || Z.id !== 'alpha') return;
    const g = new THREE.Group(), stone = new THREE.MeshToonMaterial({ color: 0xd8cdb6, gradientMap: toonGradient }), gold = new THREE.MeshToonMaterial({ color: 0xd8b04a, gradientMap: toonGradient });
    PEDESTALS.forEach(([x, z], i) => {
      const y = heightAt(x, z), base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.0, 0.9), stone); base.position.set(x, y + 0.5, z); base.castShadow = true; g.add(base);
      const rim = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.08, 1.0), gold); rim.position.set(x, y + 1.02, z); g.add(rim);
      obstacles.push({ x, z, r: 0.6 });
    });
    zoneRoot.add(g); exhibitObj = g;
    { const need = [wild3Done() && 'bronze-serpent-sm', sinai2Done() && 'silver-trumpets', judgesDone() && 'jar-torch-sm', ruthDone() && PROP_DEFS['ebenezer-stone-sm'] && 'ebenezer-stone-sm'].filter(Boolean); if (need.length) try { await loadProps(need); } catch (e){} if (!Z || Z.id !== 'alpha' || exhibitObj !== g) return; }
    if (chaptersDone() >= 10){
      await loadProps(['stone-tablets']); if (!Z || Z.id !== 'alpha' || !exhibitObj) return;
      const [x, z] = PEDESTALS[0], t = propTemplates['stone-tablets'].holder.clone(true); t.position.set(x, heightAt(x, z) + 1.06, z); t.rotation.y = faceTo(x, z, 0, 0); exhibitObj.add(t);
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, color: 0xfff0b0, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.35 })); glow.scale.set(1.6, 1.6, 1); glow.position.set(x, heightAt(x, z) + 1.6, z); exhibitObj.add(glow);
    }
    exhibitSerpent();   // 세 번째 받침대: 놋뱀 장대(민 21:9)
    if (joshuaDone() && PEDESTALS[3]){   // 네 번째 받침대: 길갈의 열두 돌(수 4:20)
      const [x, z] = PEDESTALS[3], y = heightAt(x, z) + 1.06, sg = new THREE.Group(), cols = [0xd8cdb6, 0xc9b896, 0xe0d4ba];
      for (let i = 0; i < 12; i++){ const a = i / 12 * Math.PI * 2, r = i < 8 ? 0.3 : 0.13, st = new THREE.Mesh(new THREE.DodecahedronGeometry(0.09, 0), new THREE.MeshToonMaterial({ color: cols[i % 3], gradientMap: toonGradient }));
        st.position.set(Math.cos(a * (i < 8 ? 1 : 2)) * r, i < 8 ? 0.06 : 0.17, Math.sin(a * (i < 8 ? 1 : 2)) * r); st.rotation.set(i, i * 2, 0); sg.add(st); }
      sg.position.set(x, y, z); exhibitObj.add(sg);
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, color: 0xfff0d0, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.3 })); glow.scale.set(1.2, 1.2, 1); glow.position.set(x, y + 0.4, z); exhibitObj.add(glow);
    }
    if (ruthDone() && PEDESTALS[5]){   // 여섯 번째 받침대: 에벤에셀 돌(삼상 7:12) — 모델이 없으면 다듬지 않은 돌 도형
      const [x, z] = PEDESTALS[5], y = heightAt(x, z) + 1.06;
      if (propTemplates['ebenezer-stone-sm']){ const o = propTemplates['ebenezer-stone-sm'].holder.clone(true); o.position.set(x, y, z); exhibitObj.add(o); }
      else { const st = new THREE.Mesh(new THREE.DodecahedronGeometry(0.28, 0), new THREE.MeshToonMaterial({ color: 0xb8a888, gradientMap: toonGradient })); st.scale.set(0.8, 1.4, 0.7); st.position.set(x, y + 0.36, z); exhibitObj.add(st); }
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, color: 0xfff0d0, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.3 })); glow.scale.set(1.2, 1.2, 1); glow.position.set(x, y + 0.5, z); exhibitObj.add(glow);
    }
    if (saulDone() && PEDESTALS[6]){   // 일곱 번째 받침대: 물매와 돌 다섯(삼상 17:40) — 도형
      const [x, z] = PEDESTALS[6], y = heightAt(x, z) + 1.06, sg = new THREE.Group(), mat = c => new THREE.MeshToonMaterial({ color: c, gradientMap: toonGradient });
      for (let i = 0; i < 5; i++){ const a = i / 5 * Math.PI * 2, st = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), mat(i % 2 ? 0xd8d0bc : 0xc4baa2)); st.scale.set(1.2, 0.72, 1); st.position.set(Math.cos(a) * 0.2, 0.07, Math.sin(a) * 0.2); sg.add(st); }
      const pouch = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.03, 0.12), mat(0x7a5a38)); pouch.position.set(0.02, 0.28, 0); sg.add(pouch);
      for (const s of [-1, 1]){ const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.52, 5), mat(0x8a6a44)); cord.position.set(s * 0.24, 0.32, 0); cord.rotation.z = s * 1.25; sg.add(cord); }
      sg.position.set(x, y, z); exhibitObj.add(sg);
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, color: 0xfff0d0, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.3 })); glow.scale.set(1.2, 1.2, 1); glow.position.set(x, y + 0.4, z); exhibitObj.add(glow);
    }
    if (judgesDone() && PEDESTALS[4] && propTemplates['jar-torch-sm']){   // 다섯 번째 받침대: 기드온의 항아리와 횃불(삿 7:20)
      const [x, z] = PEDESTALS[4], y = heightAt(x, z) + 1.06, o = propTemplates['jar-torch-sm'].holder.clone(true); o.position.set(x, y, z); o.rotation.y = faceTo(x, z, 0, 0); exhibitObj.add(o);
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, color: 0xffd9a0, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.32 })); glow.scale.set(1.3, 1.3, 1); glow.position.set(x, y + 0.6, z); exhibitObj.add(glow);
    }
    if (sinai2Done() && PEDESTALS[1] && propTemplates['silver-trumpets']){   // 두 번째 받침대: 은 나팔 둘(민 10:2) — 3D 모델
      const [x, z] = PEDESTALS[1], y = heightAt(x, z) + 1.06, o = propTemplates['silver-trumpets'].holder.clone(true); o.position.set(x, y, z); o.rotation.y = faceTo(x, z, 0, 0); exhibitObj.add(o);
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, color: 0xf0f4ff, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.3 })); glow.scale.set(1.4, 1.4, 1); glow.position.set(x, y + 0.4, z); exhibitObj.add(glow);
    } else if (sinai2Done() && PEDESTALS[1]){   // (모델을 못 받았을 때) 도형으로
      const [x, z] = PEDESTALS[1], y = heightAt(x, z) + 1.12, silver = new THREE.MeshToonMaterial({ color: 0xe4e8ee, gradientMap: toonGradient }), tg = new THREE.Group();
      [-0.16, 0.16].forEach(dz => { const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8), silver); tube.rotation.z = Math.PI / 2; tube.position.set(0, 0.05, dz); tg.add(tube);
        const bell = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.2, 12, 1, true), silver); bell.rotation.z = -Math.PI / 2; bell.position.set(0.48, 0.05, dz); tg.add(bell); });
      tg.position.set(x, y, z); tg.rotation.y = faceTo(x, z, 0, 0); exhibitObj.add(tg);
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, color: 0xf0f4ff, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.3 })); glow.scale.set(1.4, 1.4, 1); glow.position.set(x, y + 0.4, z); exhibitObj.add(glow);
    }
  }
  function exhibitSerpent(){
    if (!wild3Done() || !PEDESTALS[2] || !exhibitObj) return;
    if (propTemplates['bronze-serpent-sm']){
      const [x, z] = PEDESTALS[2], y = heightAt(x, z) + 1.06, o = propTemplates['bronze-serpent-sm'].holder.clone(true); o.position.set(x, y, z); o.rotation.y = faceTo(x, z, 0, 0); exhibitObj.add(o);
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, color: 0xffd9a0, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.3 })); glow.scale.set(1.4, 1.4, 1); glow.position.set(x, y + 1.2, z); exhibitObj.add(glow);
      return;
    }
    const [x, z] = PEDESTALS[2], y = heightAt(x, z) + 1.06, bronze = new THREE.MeshToonMaterial({ color: 0xb07a3a, gradientMap: toonGradient }), wood = new THREE.MeshToonMaterial({ color: 0x7a5a3a, gradientMap: toonGradient }), g = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.5, 8), wood); pole.position.y = 0.75; g.add(pole);
    const coil = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.035, 8, 20, Math.PI * 3.2), bronze); coil.rotation.x = Math.PI / 2; coil.position.y = 1.25; g.add(coil);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), bronze); head.scale.set(1.4, 0.8, 1); head.position.set(0.12, 1.42, 0); g.add(head);
    g.position.set(x, y, z); exhibitObj.add(g);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, color: 0xffd9a0, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.3 })); glow.scale.set(1.4, 1.4, 1); glow.position.set(x, y + 1.2, z); exhibitObj.add(glow);
  }
  const sinai2Done = () => { const p = ST.sp && ST.sp.sinai2; return !!(p && p.cleared && p.ch >= 9); };
  const wild3Done = () => { const p = ST.sp && ST.sp.wild3; return !!(p && p.cleared && p.ch >= 15); };
  const joshuaDone = () => { const p = ST.sp && ST.sp.joshua; return !!(p && p.cleared && p.ch >= 12); };
  const judgesDone = () => { const p = ST.sp && ST.sp.judges; return !!(p && p.cleared && p.ch >= 11); };
  const ruthDone = () => { const p = ST.sp && ST.sp.ruth; return !!(p && p.cleared && p.ch >= 8); };
  const saulDone = () => { const p = ST.sp && ST.sp.saul; return !!(p && p.cleared && p.ch >= 15); };
  const CH_NAMES = CHAPTERS.map(c => (c.clearTitle.match(/「([^」]+)」/) || [])[1] || '');
  function openExhibit(){
    const done = chaptersDone(), el = document.getElementById('exhibit-body');
    const head = done >= 10
      ? `<div class="keyline">🪨 <b>첫 번째 받침대 — 「모세와 함께」의 두 돌판</b><br><span style="opacity:.8">"모세가 돌판 둘을 처음 것과 같이 깎아 만들고" (출애굽기 34:4)</span></div>`
      : `<div class="keyline" style="opacity:.8">「모세와 함께」 10장을 모두 마치면 첫 번째 받침대에 기념물이 놓여요. (지금 ${done}장 완료)</div>`;
    const rows = CHAPTERS.map((c, i) => {
      const n = i + 1; if (done < n) return `<div class="dq" style="opacity:.5"><span class="ck">🔒</span><span class="tx">${n}장 「${CH_NAMES[i]}」</span></div>`;
      const scenes = (ST.keys || []).filter(k => sceneChapter[k.scene] === n);
      const lib = LIB.find(x => x[0] === n), vs = lib ? ST.verses.filter(id => { const v = verseNum(id); return VERSES[id] && v >= lib[2] && v <= lib[3]; }) : [];
      return `<details style="margin:6px 0"><summary style="font-weight:800">📜 ${n}장 「${CH_NAMES[i]}」 · 장면 ${scenes.length} · 구절 ${vs.length}</summary>${scenes.map(k => `<div class="keyline"><b>${k.scene}</b> — ${k.t}</div>`).join('')}${vs.map(id => `<div class="keyline">📖 <b>${VERSES[id].ref}</b> — ${VERSES[id].text}</div>`).join('')}</details>`;
    }).join('');
    const head2 = sinai2Done() ? `<div class="keyline">🎺 <b>두 번째 받침대 — 「시내산의 마지막 한 달」의 은 나팔 둘</b><br><span style="opacity:.8">"은 나팔 둘을 만들되 두들겨 만들어서 그것으로 회중을 소집하며 진영을 출발하게 할 것이라" (민수기 10:2)</span></div>` : '';
    const head3 = wild3Done() ? `<div class="keyline">🐍 <b>세 번째 받침대 — 「광야 40년」의 놋뱀 장대</b><br><span style="opacity:.8">"모세가 놋뱀을 만들어 장대 위에 다니 뱀에게 물린 자가 놋뱀을 쳐다본즉 모두 살더라" (민수기 21:9)</span></div>` : '';
    const head4 = joshuaDone() ? `<div class="keyline">🪨 <b>네 번째 받침대 — 「여호수아와 함께」의 길갈의 열두 돌</b><br><span style="opacity:.8">"여호수아가 요단에서 가져온 그 열두 돌을 길갈에 세우고" (여호수아 4:20)</span></div>` : '';
    const head5 = judgesDone() ? `<div class="keyline">🏺 <b>다섯 번째 받침대 — 「사사들과 함께」의 기드온의 항아리와 횃불</b><br><span style="opacity:.8">"세 대가 나팔을 불며 항아리를 부수고 왼손에 횃불을 들고 오른손에 나팔을 들어 불며 외쳐 이르되 여호와와 기드온의 칼이다" (사사기 7:20)</span></div>` : '';
    const head6 = ruthDone() ? `<div class="keyline">🪨 <b>여섯 번째 받침대 — 「룻과 사무엘」의 에벤에셀 돌</b><br><span style="opacity:.8">"사무엘이 돌을 취하여 미스바와 센 사이에 세워 이르되 여호와께서 여기까지 우리를 도우셨다" (사무엘상 7:12)</span></div>` : '';
    const head7 = saulDone() ? `<div class="keyline">🪨 <b>일곱 번째 받침대 — 「사울과 다윗」의 물매와 돌 다섯</b><br><span style="opacity:.8">"손에 막대기를 가지고 시내에서 매끄러운 돌 다섯을 골라서 자기 목자의 제구 곧 주머니에 넣고 손에 물매를 가지고 블레셋 사람에게로 나아가니라" (사무엘상 17:40)</span></div>` : '';
    el.innerHTML = head + rows + head2 + head3 + head4 + head5 + head6 + head7 + `<div style="margin-top:8px;font-size:12.5px;opacity:.75">${saulDone() ? '일곱 받침대가 채워졌어요. 다음 두루마리는 준비하고 있어요.' : ruthDone() ? '여섯 받침대가 채워졌어요. 일곱 번째 받침대는 7편 「사울과 다윗」을 모두 마치면 채워져요.' : judgesDone() ? '여섯 번째 받침대는 6편 「룻과 사무엘」을 모두 마치면 채워져요.' : joshuaDone() ? '다섯 번째 받침대는 5편 「사사들과 함께」를 모두 마치면 채워져요.' : wild3Done() ? '네 번째 받침대는 4편 「여호수아와 함께」를 모두 마치면 채워져요.' : sinai2Done() ? '세 번째 받침대는 3편 「광야 40년」을 모두 마치면 채워져요.' : '두 번째 받침대는 2편 「시내산의 마지막 한 달」을 모두 마치면 채워져요.'}</div>`;
    openModal('exhibit-modal');
  }
  document.getElementById('exhibit-replay').onclick = () => { document.querySelectorAll('.modal:not(.hidden) .close').forEach(b => b.click()); setTimeout(openReplay, 250); };
  // ── 2. 걸어온 여정 지도(이야기 순서 지도 — 실제 거리·위치를 그린 역사 지도가 아님) ──
  const JOURNEY = [
    { z: 'midian', n: '미디안 광야', need: 1, x: 70, y: 70, s: [[1, '🔥 떨기나무의 부르심']] },
    { z: 'egypt', n: '애굽 고센', need: 1, x: 190, y: 150, s: [[2, '🐸 아홉 가지 재앙'], [3, '🐑 유월절 밤']] },
    { z: 'redsea', n: '홍해', need: 3, x: 320, y: 90, s: [[4, '🌊 바다 가운데 마른 땅']] },
    { z: 'wild', n: '신 광야(마라·엘림)', need: 4, x: 430, y: 170, s: [[5, '🍞 하늘에서 내린 만나']] },
    { z: 'rephidim', n: '르비딤', need: 5, x: 540, y: 90, s: [[6, '💧 반석의 물 · 🙌 손을 든 모세']] },
    { z: 'sinai', n: '시내 산', need: 6, x: 650, y: 160, s: [[7, '⚖️ 이드로의 조언'], [8, '⛰ 시내 산 언약'], [9, '🐄 금송아지와 두 번째 돌판'], [10, '⛺ 성막']] },
  ];
  const visited = z => (ST.visited || []).includes(z) || chaptersDone() >= JOURNEY.find(j => j.z === z).need;
  function markVisited(){ if (!Z || !JOURNEY.some(j => j.z === Z.id)) return; if (!(ST.visited || []).includes(Z.id)){ ST.visited = [...(ST.visited || []), Z.id]; saveST(); } }
  function openJourney(){
    const done = chaptersDone();
    let svg = `<svg viewBox="0 0 720 240" width="100%" style="background:#efe2c4;border-radius:12px">`;
    svg += `<path d="M10 220 Q 180 200 360 225 T 710 215" stroke="#d8c49a" stroke-width="18" fill="none" opacity=".5"/>`;
    for (let i = 0; i < JOURNEY.length - 1; i++){ const a = JOURNEY[i], b = JOURNEY[i + 1], on = visited(a.z) && visited(b.z);
      svg += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${on ? '#b9832a' : '#a89a80'}" stroke-width="${on ? 5 : 3}" stroke-dasharray="${on ? '0' : '8 7'}" stroke-linecap="round"/>`; }
    for (const j of JOURNEY){ const on = visited(j.z);
      svg += `<circle cx="${j.x}" cy="${j.y}" r="${on ? 15 : 11}" fill="${on ? '#d8a94a' : '#cbbd9f'}" stroke="#6a4a2a" stroke-width="2"/><text x="${j.x}" y="${j.y + 33}" text-anchor="middle" font-size="15" font-weight="700" fill="${on ? '#4a3018' : '#9a8a70'}">${on ? j.n : '???'}</text>`; }
    svg += `</svg>`;
    const list = JOURNEY.map(j => `<div class="keyline"><b>${visited(j.z) ? j.n : '???'}</b> — ${j.s.map(([c, t]) => done >= c ? t : '<span style="opacity:.45">(아직)</span>').join(' · ')}</div>`).join('');
    document.getElementById('journey-body').innerHTML = svg + list + `<div style="font-size:12px;opacity:.7;margin-top:6px">이야기 순서를 보여 주는 지도예요. 실제 거리와 위치를 그대로 그린 역사 지도는 아니에요.</div>`;
    openModal('journey-modal');
  }
  // ══ 🔗 본문 연결 두루마리(두루마리마을, 10장 마친 뒤) — 출애굽기 구절과 그 구절을 인용·언급한 신약 구절을 짝지어요. 해석은 붙이지 않고 본문만 ══
  const LINKS = [{"ot": "내가 피를 볼 때에 너희를 넘어가리니", "otr": "출 12:13", "nt": "우리의 유월절 양 곧 그리스도께서 희생되셨느니라", "ntr": "고전 5:7"}, {"ot": "이는 여호와께서 너희에게 주어 먹게 하신 양식이라", "otr": "출 16:15", "nt": "기록된 바 하늘에서 그들에게 떡을 주어 먹게 하였다 함과 같이 우리 조상들은 광야에서 만나를 먹었나이다", "ntr": "요 6:31"}, {"ot": "너는 그 반석을 치라 그것에서 물이 나오리니 백성이 마시리라", "otr": "출 17:6", "nt": "다 같은 신령한 음료를 마셨으니 이는 그들을 따르는 신령한 반석으로부터 마셨으매 그 반석은 곧 그리스도시라", "ntr": "고전 10:4"}, {"ot": "이스라엘 자손이 바다 가운데를 육지로 걸어가고 물은 그들의 좌우에 벽이 되니", "otr": "출 14:22", "nt": "믿음으로 그들은 홍해를 육지 같이 건넜으나 애굽 사람들은 이것을 시험하다가 빠져 죽었으며", "ntr": "히 11:29"}, {"ot": "아론이 그들의 손에서 금 고리를 받아 부어서 조각칼로 새겨 송아지 형상을 만드니", "otr": "출 32:4", "nt": "그 때에 그들이 송아지를 만들어 그 우상 앞에 제사하며 자기 손으로 만든 것을 기뻐하더니", "ntr": "행 7:41"}, {"ot": "그는 또 증거판을 궤 속에 넣고 채를 궤에 꿰고 속죄소를 궤 위에 두고", "otr": "출 40:20", "nt": "금 향로와 사면을 금으로 싼 언약궤가 있고 그 안에 만나를 담은 금 항아리와 아론의 싹난 지팡이와 언약의 돌판들이 있고", "ntr": "히 9:4"}, {"ot": "네 부모를 공경하라", "otr": "출 20:12", "nt": "네 아버지와 어머니를 공경하라 이것은 약속이 있는 첫 계명이니", "ntr": "엡 6:2"}, {"ot": "이스라엘 자손의 모든 죄를 위하여 일 년에 한 번 속죄할 것이니라", "otr": "레 16:34", "nt": "염소와 송아지의 피로 하지 아니하고 오직 자기의 피로 영원한 속죄를 이루사 단번에 성소에 들어가셨느니라", "ntr": "히 9:12"}, {"ot": "네 이웃 사랑하기를 네 자신과 같이 사랑하라", "otr": "레 19:18", "nt": "둘째도 그와 같으니 네 이웃을 네 자신 같이 사랑하라 하셨으니", "ntr": "마 22:39"}, {"ot": "그 땅에 있는 모든 주민을 위하여 자유를 공포하라 이 해는 너희에게 희년이니", "otr": "레 25:10", "nt": "주의 은혜의 해를 전파하게 하려 하심이라 하였더라", "ntr": "눅 4:19"}, {"ot": "아론의 지팡이에 움이 돋고 순이 나고 꽃이 피어서 살구 열매가 열렸더라", "otr": "민 17:8", "nt": "금 향로와 사면을 금으로 싼 언약궤가 있고 그 안에 만나를 담은 금 항아리와 아론의 싹난 지팡이와 언약의 돌판들이 있고", "ntr": "히 9:4"}, {"ot": "모세가 놋뱀을 만들어 장대 위에 다니 뱀에게 물린 자가 놋뱀을 쳐다본즉 모두 살더라", "otr": "민 21:9", "nt": "모세가 광야에서 뱀을 든 것 같이 인자도 들려야 하리니", "ntr": "요 3:14"}, {"ot": "너는 마음을 다하고 뜻을 다하고 힘을 다하여 네 하나님 여호와를 사랑하라", "otr": "신 6:5", "nt": "예수께서 이르시되 네 마음을 다하고 목숨을 다하고 뜻을 다하여 주 너의 하나님을 사랑하라 하셨으니", "ntr": "마 22:37"}, {"ot": "사람이 떡으로만 사는 것이 아니요 여호와의 입에서 나오는 모든 말씀으로 사는 줄을 네가 알게 하려 하심이니라", "otr": "신 8:3", "nt": "기록되었으되 사람이 떡으로만 살 것이 아니요 하나님의 입으로부터 나오는 모든 말씀으로 살 것이라 하였느니라", "ntr": "마 4:4"}];
  ZONES.alpha.points.push({ id: 'links', x: -12.8, z: -3.2, type: 'lore', title: '🔗 본문 연결 두루마리', body: '' });
  Object.assign(BADGES, { links_all: { ico: '🔗', name: '말씀을 잇는 사람' } });
  let linkPick = null, linkOrder = null, linkMsg = '';
  function renderLinks(){
    const el = document.getElementById('links-body'), done = ST.links || [];
    // 신약 구절 하나에 구약 여러 개가 이어질 수 있음(2026-09-27) — 오른쪽은 같은 신약 구절을 한 번만, 이어진 구약을 모두 이으면 초록
    if (!linkOrder) linkOrder = LINKS.map((_, i) => i).filter(i => LINKS.findIndex(L => L.ntr === LINKS[i].ntr) === i).sort(() => Math.random() - 0.5);
    const card = (i, side) => { const L = LINKS[i], ok = side === 'o' ? done.includes(i) : LINKS.every((M, j) => M.ntr !== L.ntr || done.includes(j)), on = linkPick && linkPick[0] === side && linkPick[1] === i;
      return `<button data-lk="${side}:${i}" ${ok ? 'disabled' : ''} style="display:block;width:100%;text-align:left;margin:4px 0;padding:8px;border-radius:10px;font-size:13px;line-height:1.45;border:2px solid ${ok ? '#7fc97f' : on ? '#ffd27a' : 'rgba(255,255,255,.25)'};background:${ok ? 'rgba(127,201,127,.18)' : on ? 'rgba(255,210,122,.18)' : 'rgba(255,255,255,.06)'};color:#f5e9d0">${side === 'o' ? L.ot : L.nt}<br><b style="font-size:12px;opacity:.85">(${side === 'o' ? L.otr : L.ntr})</b></button>`; };
    el.innerHTML = `<div style="font-size:12.5px;opacity:.85;margin-bottom:6px">왼쪽 구약 구절을 누르고, 그 구절과 이어지는 오른쪽 신약 구절을 눌러 짝을 지어요. 신약 구절 하나에 구약 여러 개가 이어지기도 해요. (${done.length}/${LINKS.length})</div>`
      + `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><div><div style="font-weight:800;text-align:center">📜 구약</div>${LINKS.map((_, i) => card(i, 'o')).join('')}</div><div><div style="font-weight:800;text-align:center">✝️ 신약</div>${linkOrder.map(i => card(i, 'n')).join('')}</div></div>`
      + `<div style="text-align:center;color:#ffd27a;font-weight:800;min-height:18px;margin-top:6px">${linkMsg}</div>`;
  }
  function openLinks(){
    if (chaptersDone() < 10){ simple('🔗 본문 연결 두루마리', '「모세와 함께」 10장을 모두 마치면 열 수 있어요. 구약 말씀이 신약 어디에 다시 나오는지 짝지어 보는 두루마리예요.'); return; }
    linkPick = null; linkMsg = ''; renderLinks(); openModal('links-modal');
  }
  document.getElementById('links-body').addEventListener('click', e => { const b = e.target.closest('[data-lk]'); if (!b || b.disabled) return;
    const [side, si] = b.dataset.lk.split(':'), i = +si;
    if (!linkPick || linkPick[0] === side){ linkPick = [side, i]; linkMsg = ''; renderLinks(); return; }
    const o = side === 'o' ? i : linkPick[1], n = side === 'n' ? i : linkPick[1]; linkPick = null;
    if (LINKS[o].ntr !== LINKS[n].ntr){ linkMsg = '다시 읽어 보세요 — 같은 사건을 말하는 구절을 찾아요'; renderLinks(); return; }
    ST.links = [...(ST.links || []), o]; linkMsg = `✓ ${LINKS[o].otr} ↔ ${LINKS[o].ntr}`;
    if (ST.links.length >= LINKS.length && !ST.badges.includes('links_all')){ ST.badges.push('links_all'); addMat({ gold: 1, silver: 1 }, '🔗 본문 연결 두루마리 완성', true); linkMsg = '🔗 모두 이었어요! 배지 「말씀을 잇는 사람」'; setTimeout(() => { try { syncAchieve(); } catch (e){} }, 500); }
    saveST(); renderLinks(); });
  // ══ 📷 모험 장면 사진첩: 지금 화면을 사진으로 찍어 이 기기에만(IndexedDB) 12장까지 보관 — 서버로 보내지 않음 ══
  const PHOTO_MAX = 12;
  let photoDB = null;
  function photoOpenDB(){
    if (photoDB) return Promise.resolve(photoDB);
    return new Promise((ok, no) => { try { const r = indexedDB.open('odyssey-photos', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('p', { keyPath: 'id', autoIncrement: true });
      r.onsuccess = () => { photoDB = r.result; ok(photoDB); }; r.onerror = () => no(r.error); } catch (e){ no(e); } });
  }
  const photoTx = (mode, fn) => photoOpenDB().then(db => new Promise((ok, no) => { const tx = db.transaction('p', mode), st = tx.objectStore('p'), r = fn(st); tx.oncomplete = () => ok(r && r.result); tx.onerror = () => no(tx.error); }));
  const photoAll = () => photoTx('readonly', st => st.getAll()).then(a => (a || []).sort((x, y) => y.t - x.t));
  const photoStamp = t => { const d = new Date(t); const p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`; };
  async function takePhoto(){
    let n = 0; try { n = (await photoAll()).length; } catch (e){ toast('📷 이 브라우저에서는 사진첩을 쓸 수 없어요(개인 정보 보호 모드 등)', 2800); return; }
    if (n >= PHOTO_MAX){ toast(`📷 사진첩이 가득 찼어요(${PHOTO_MAX}장). 사진첩에서 한 장을 지운 뒤 다시 찍어 보세요`, 2800); return; }
    renderer.render(scene, camera);
    const src = renderer.domElement, W = Math.min(1280, src.width), H = Math.round(src.height * W / src.width), k = W / 844;
    const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    x.drawImage(src, 0, 0, W, H);
    const q = curStep(), label = `In Odyssey · ${Z ? zoneName(Z.id) : ''}${q && !ST.cleared ? ' · ' + CHAPTER.title : ''}`, t = Date.now();
    x.fillStyle = 'rgba(30,20,10,.55)'; x.fillRect(0, H - 34 * k, W, 34 * k);
    x.fillStyle = '#ffe9b8'; x.font = `bold ${15 * k}px sans-serif`; x.textBaseline = 'middle'; x.fillText(label, 12 * k, H - 17 * k);
    x.textAlign = 'right'; x.fillText(photoStamp(t), W - 12 * k, H - 17 * k);
    const fl = document.getElementById('flash'); fl.style.transition = 'none'; fl.style.background = '#fff'; fl.style.opacity = '0.8'; setTimeout(() => { fl.style.transition = 'opacity .5s'; fl.style.opacity = '0'; setTimeout(() => fl.style.background = '', 600); }, 60);
    c.toBlob(async blob => { if (!blob) return;
      try { await photoTx('readwrite', st => st.add({ t, zone: Z ? Z.id : '', label, blob })); toast(`📷 찰칵! 사진첩에 담았어요 (${n + 1}/${PHOTO_MAX})`, 2000); }
      catch (e){ toast('📷 사진을 저장하지 못했어요', 2000); } }, 'image/jpeg', 0.85);
  }
  let photoURLs = [];
  async function renderAlbum(viewId){
    const el = document.getElementById('album-body'); photoURLs.forEach(u => URL.revokeObjectURL(u)); photoURLs = [];
    let all = []; try { all = await photoAll(); } catch (e){ el.innerHTML = '<div class="logline">이 브라우저에서는 사진첩을 쓸 수 없어요(개인 정보 보호 모드 등).</div>'; return; }
    const url = b => { const u = URL.createObjectURL(b); photoURLs.push(u); return u; };
    if (viewId){ const p = all.find(a => a.id === viewId); if (p){ const u = url(p.blob);
      el.innerHTML = `<img src="${u}" style="width:100%;border-radius:10px;display:block"><div style="font-size:12.5px;opacity:.8;margin:4px 0">${p.label} · ${photoStamp(p.t)}</div>`
        + `<div style="display:flex;gap:6px"><a class="set-tg" style="flex:1;text-align:center;text-decoration:none;padding:9px 0" href="${u}" download="in-odyssey-${photoStamp(p.t).replace(/[.: ]/g, '')}.jpg">💾 내 기기에 저장</a><button class="set-tg" data-pdel="${p.id}" style="flex:1">🗑 지우기</button><button class="set-tg" data-pback="1" style="flex:1">◀ 목록</button></div>`; return; } }
    el.innerHTML = `<div style="font-size:12.5px;opacity:.85;margin-bottom:6px">지금 보이는 장면을 찍어 이 기기에만 보관해요(${all.length}/${PHOTO_MAX}장). 다른 사람에게 보내지지 않아요.</div>`
      + `<button id="album-snap" class="set-tg" style="width:100%;margin-bottom:8px">📸 지금 장면 찍기</button>`
      + (all.length ? `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">${all.map(p => `<button data-pview="${p.id}" style="padding:0;border:none;background:none;border-radius:8px;overflow:hidden"><img src="${url(p.blob)}" style="width:100%;aspect-ratio:16/9;object-fit:cover;display:block"></button>`).join('')}</div>`
        : '<div class="logline" style="opacity:.7">아직 찍은 사진이 없어요. 멋진 장면에서 찍어 보세요!</div>');
  }
  function openAlbum(){ openModal('album-modal'); renderAlbum(); }
  document.getElementById('btn-photo').onclick = () => { hudMenu.classList.add('hidden'); openAlbum(); };
  document.getElementById('album-body').addEventListener('click', async e => {
    if (e.target.closest('#album-snap')){ document.querySelectorAll('.modal:not(.hidden) .close').forEach(b => b.click()); setTimeout(takePhoto, 400); return; }
    const v = e.target.closest('[data-pview]'); if (v){ renderAlbum(+v.dataset.pview); return; }
    if (e.target.closest('[data-pback]')){ renderAlbum(); return; }
    const d = e.target.closest('[data-pdel]'); if (d){ if (!confirm('이 사진을 지울까요? 지우면 되돌릴 수 없어요.')) return; try { await photoTx('readwrite', st => st.delete(+d.dataset.pdel)); } catch (e2){} renderAlbum(); }
  });
  function renderWeekly(msg){
    const W = ST.weekly, el = document.getElementById('weekly-list'), b = document.getElementById('weekly-claim');
    el.innerHTML = W.q.map(k => { const q = wqDef(k), v = W.p[k] || 0, done = v >= q.n;
      return `<div class="dq${done ? ' done' : ''}"><span class="ck">${done ? '✅' : '⬜'}</span><span class="tx">${q.t}</span><span class="pg">${q.n > 1 ? v + ' / ' + q.n : (done ? '완료' : '')}</span></div>`; }).join('')
      + `<div style="font-size:12px;opacity:.75;margin-top:6px">${msg || '월요일마다 새 퀘스트 3개가 열려요. 다 하면 💰 15달란트!'}</div>`;
    const logged = typeof msuOn === 'function' && msuOn();
    b.disabled = !wqAll() || W.claimed || !logged;
    b.textContent = W.claimed ? '✓ 이번 주 달란트를 받았어요' : !logged ? '말씀우물에 로그인하면 달란트를 받아요' : wqAll() ? '💰 15달란트 받기' : '퀘스트를 다 하면 받을 수 있어요';
  }
  document.getElementById('weekly-claim').onclick = async () => {
    const b = document.getElementById('weekly-claim'); b.disabled = true;
    try {
      const { data, error } = await MSU.client.rpc('claim_odyssey_weekly'); if (error) throw error;
      ST.weekly.claimed = true; saveST(); dailyDot();
      renderWeekly(data > 0 ? '💰 15달란트를 받았어요! 다음 주에 또 만나요.' : '이번 주 달란트는 이미 받았어요.');
      if (data > 0) toast('💰 이번 주 퀘스트 보상 15달란트!', 2200);
    } catch (e){ renderWeekly('달란트를 받지 못했어요. 잠시 뒤 다시 눌러 주세요.'); }
  };
  // ══ 🏅 업적 보상: 배지 하나 💰3 · 마을 두루마리 완성 💰10 (계정당 한 번, 서버가 중복을 막음) ══
  let achBusy = false;
  async function syncAchieve(){
    if (achBusy || !(typeof msuOn === 'function' && msuOn())) return;
    ST.achDone = ST.achDone || [];
    const keys = ST.badges.map(b => 'badge-' + b).concat(Object.keys(SCROLL_VERSE).filter(z => (ST.scrolls && ST.scrolls[z] || []).length >= SCROLL_N).map(z => 'scroll-' + z)).filter(k => !ST.achDone.includes(k));
    if (!keys.length) return;
    achBusy = true;
    let got = 0;
    await flushCloud();
    for (const k of keys){
      try { const { data, error } = await MSU.client.rpc('claim_odyssey_achieve', { p_key: k }); if (error) break; if (data < 0) continue; ST.achDone.push(k); got += data || 0; } catch (e){ break; }   // -1 = 서버 저장본에 아직 없음 — 완료로 표시하지 않고 다음에 다시
    }
    achBusy = false;
    if (got > 0){ try { localStorage.setItem(STORY_KEY, JSON.stringify({ ...ST, log: ST.log.slice(-80) })); } catch (e){} toast(`🏅 업적 보상 💰 ${got}달란트가 들어왔어요!`, 2400); }
  }
  document.getElementById('daily-claim').onclick = async () => {
    const b = document.getElementById('daily-claim'); b.disabled = true;
    try {
      const { data, error } = await MSU.client.rpc('claim_odyssey_daily');
      if (error) throw error;
      ST.daily.claimed = true; saveST(); dailyDot();
      renderDaily(data > 0 ? '💰 5달란트를 받았어요! 내일 또 만나요.' : '오늘 달란트는 이미 받았어요.');
      if (data > 0) toast('💰 오늘의 퀘스트 보상 5달란트!', 2200);
    } catch (e){ renderDaily('달란트를 받지 못했어요. 잠시 뒤 다시 눌러 주세요.'); }
  };

  // ══ 🏠 내 장막 꾸미기: 두루마리마을 북서쪽 마당(10×10m). 물건은 한 번 사면 계속 — 작은 건 4개, 큰 건 2개까지 ══
  const YARD = { x: -44, z: 44, half: 5 };
  const HOME_ITEMS = [
    { k: 'jars', n: '항아리', ico: '🏺', p: 0, max: 4 }, { k: 'crates-sacks', n: '짐 상자', ico: '📦', p: 0, max: 4 }, { k: 'firewood', n: '장작', ico: '🪵', p: 0, max: 4 },
    { k: 'env-river-stones', n: '강돌', ico: '🪨', p: 5, max: 4 }, { k: 'env-reeds', n: '갈대', ico: '🌾', p: 5, max: 4 },
    { k: 'hyssop-basin', n: '우슬초 대야', ico: '🥣', p: 8, max: 4 }, { k: 'pilgrim-bundle', n: '여행 보따리', ico: '🎒', p: 8, max: 4 },
    { k: 'dry-bush', n: '떨기나무', ico: '🌿', p: 10, max: 4 }, { k: 'fence', n: '울타리', ico: '🚧', p: 10, max: 8 },
    { k: 'water-trough', n: '물구유', ico: '🪣', p: 12, max: 2 }, { k: 'campfire', n: '모닥불', ico: '🔥', p: 12, max: 2 },
    { k: 'tribe-banner', n: '지파 깃발', ico: '🚩', p: 15, max: 4 }, { k: 'palace-brazier', n: '화로', ico: '🏮', p: 15, max: 4 },
    { k: 'lamb', n: '어린 양', ico: '🐑', p: 20, max: 3 }, { k: 'passover-table', n: '유월절 식탁', ico: '🍞', p: 25, max: 1 },
    { k: 'env-acacia', n: '아카시아', ico: '🌳', p: 25, max: 2 }, { k: 'weaving-shade', n: '그늘막', ico: '⛱️', p: 30, max: 1 },
    { k: 'palm', n: '야자수', ico: '🌴', p: 30, max: 2 }, { k: 'tent-small', n: '작은 장막', ico: '⛺', p: 30, max: 1 },
    { k: 'well', n: '우물', ico: '⛲', p: 35, max: 1 }, { k: 'camel', n: '낙타', ico: '🐪', p: 40, max: 1 }, { k: 'tent-mid', n: '장막', ico: '🏕️', p: 40, max: 1 },
    { k: 'scroll-shelf', n: '두루마리 선반', ico: '📜', p: 0, max: 1, badge: 'scroll_all', how: '두루마리 20개를 모두 모으면' },
    { k: 'harvest-sheaf', n: '곡식단', ico: '🌾', p: 0, max: 3, season: 'harvest' }, { k: 'fruit-basket', n: '과일 바구니', ico: '🧺', p: 0, max: 2, season: 'harvest' },
    { k: 'star-lamp', n: '별 등불', ico: '⭐', p: 0, max: 2, season: 'xmas' }, { k: 'manger', n: '구유', ico: '🌟', p: 0, max: 1, season: 'xmas' },
    { k: 'timbrel', n: '미리암의 소고', ico: '🥁', p: 0, max: 1, badge: 'timbrel', how: '소고 찬양 70점 이상이면' },
  ];
  const homeIt = k => HOME_ITEMS.find(i => i.k === k);
  const homeObjs = [];
  let homeEdit = false, homePick = null, homeSel = null, homeMoving = false, homeLoaded = false;
  // 절기: 11월 추수감사 · 12월 성탄 (한국 시간). ?season=harvest|xmas 로 미리보기
  const SEASONS = { harvest: { n: '🍂 추수감사', m: 11, end: '11/30' }, xmas: { n: '🎄 성탄', m: 12, end: '12/31' } };
  const seasonNow = () => { const q = (location.search.match(/[?&]season=(\w+)/) || [])[1]; if (SEASONS[q]) return q; const m = new Date(Date.now() + 9 * 3600e3).getUTCMonth() + 1; return Object.keys(SEASONS).find(k => SEASONS[k].m === m) || null; };
  const homeHas = it => it.season ? (ST.seasonal || []).includes(it.k) : it.badge ? ST.badges.includes(it.badge) : it.p === 0 || owned.has('home-' + it.k);
  const homeShow = it => !it.season || homeHas(it) || seasonNow() === it.season;
  function makeHomeMesh(k){
    const g = new THREE.Group();
    if (k === 'scroll-shelf'){
      const wood = new THREE.MeshToonMaterial({ color: 0x8a5a2a, gradientMap: toonGradient });
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.1, 0.5), wood); shelf.position.y = 0.55; g.add(shelf);
      for (let i = 0; i < 3; i++){ const sc = new THREE.Group(); sc.add(new THREE.Mesh(scrollGeo, scrollMat), new THREE.Mesh(capGeo, capMat)); sc.position.set(-0.4 + i * 0.4, 1.22, 0); sc.rotation.y = Math.PI / 2; g.add(sc); }
    } else if (k === 'harvest-sheaf'){
      const gold = new THREE.MeshToonMaterial({ color: 0xe0b44a, gradientMap: toonGradient }), tie = new THREE.MeshToonMaterial({ color: 0x8a5a2a, gradientMap: toonGradient });
      for (let i = 0; i < 26; i++){ const a = i / 26 * Math.PI * 2, r = 0.08 + (i % 3) * 0.06; const st = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.5, 4), gold); st.position.set(Math.cos(a) * r, 0.75, Math.sin(a) * r); st.rotation.set(Math.sin(a) * 0.18, 0, Math.cos(a) * 0.18); g.add(st);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.06, 5, 4), gold); head.scale.y = 2.2; head.position.set(Math.cos(a) * r * 2.2, 1.55, Math.sin(a) * r * 2.2); g.add(head); }
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.04, 6, 16), tie); band.rotation.x = Math.PI / 2; band.position.y = 0.75; g.add(band);
    } else if (k === 'fruit-basket'){
      const wood = new THREE.MeshToonMaterial({ color: 0xa06a32, gradientMap: toonGradient, side: THREE.DoubleSide });
      const bk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.36, 0.4, 16, 1, true), wood); bk.position.y = 0.2; g.add(bk);
      const bot = new THREE.Mesh(new THREE.CircleGeometry(0.36, 16).rotateX(-Math.PI / 2), wood); bot.position.y = 0.01; g.add(bot);
      [[0xd8322a, 0.14], [0xf08c1e, 0.14], [0xe8c63a, 0.12], [0x7a3d9a, 0.08], [0x7a3d9a, 0.08], [0x5aa84a, 0.13]].forEach(([c, r], i) => { const f = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), new THREE.MeshToonMaterial({ color: c, gradientMap: toonGradient })); const a = i * 1.1; f.position.set(Math.cos(a) * 0.2, 0.42 + (i % 2) * 0.08, Math.sin(a) * 0.2); g.add(f); });
    } else if (k === 'star-lamp'){
      const sh = new THREE.Shape(); for (let i = 0; i < 10; i++){ const r = i % 2 ? 0.16 : 0.38, a = i / 10 * Math.PI * 2 + Math.PI / 2; i ? sh.lineTo(Math.cos(a) * r, Math.sin(a) * r) : sh.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
      const star = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.08, bevelEnabled: false }), new THREE.MeshToonMaterial({ color: 0xffd84a, emissive: 0x806010, gradientMap: toonGradient })); star.position.y = 1.9; g.add(star);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.7, 8), new THREE.MeshToonMaterial({ color: 0x6a4a2a, gradientMap: toonGradient })); pole.position.y = 0.85; g.add(pole);
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, color: 0xfff0a0, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.7 })); glow.scale.set(1.3, 1.3, 1); glow.position.y = 1.95; g.add(glow);
    } else if (k === 'manger'){
      const wood = new THREE.MeshToonMaterial({ color: 0x8a5a2a, gradientMap: toonGradient }), hay = new THREE.MeshToonMaterial({ color: 0xe8c46a, gradientMap: toonGradient });
      [[-0.45, 0.28, 0.4], [0.45, -0.28, 0.4]].forEach(([x, r]) => { const s = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.6, 0.55), wood); s.position.set(x, 0.3, 0); s.rotation.z = r; g.add(s); });
      const trough = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.18, 0.55), wood); trough.position.y = 0.42; g.add(trough);
      const h = new THREE.Mesh(new THREE.SphereGeometry(0.46, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), hay); h.scale.set(1, 0.35, 0.55); h.position.y = 0.5; g.add(h);
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, color: 0xfff4c0, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.55 })); glow.scale.set(1.4, 1, 1); glow.position.y = 0.75; g.add(glow);
    } else if (k === 'timbrel'){
      const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.14, 20), new THREE.MeshToonMaterial({ color: 0xe8d2a0, gradientMap: toonGradient }));
      drum.rotation.x = Math.PI / 2.4; drum.position.y = 0.9; g.add(drum);
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 8), new THREE.MeshToonMaterial({ color: 0x8a5a2a, gradientMap: toonGradient })); post.position.y = 0.45; g.add(post);
      [0xd84a4a, 0x4a8ad8, 0xe8c040].forEach((c, i) => { const r = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.5, 0.01), new THREE.MeshToonMaterial({ color: c, gradientMap: toonGradient })); r.position.set(-0.2 + i * 0.2, 0.55, 0.3); g.add(r); });
    } else {
      const t = propTemplates[k]; if (!t) return null;
      g.add(t.holder.clone(true));
    }
    return g;
  }
  function homePlace(e){
    const g = makeHomeMesh(e.k); if (!g) return null;
    g.position.set(e.x, heightAt(e.x, e.z) - 0.05, e.z); g.rotation.y = e.r; zoneRoot.add(g);
    const b0 = boxes.length, o0 = obstacles.length;
    if (PROP_DEFS[e.k]) addCollider(e.k, e.x, e.z, e.r, 1); else obstacles.push({ x: e.x, z: e.z, r: 0.45 });
    const o = { e, g, cb: boxes.slice(b0), co: obstacles.slice(o0) }; homeObjs.push(o); return o;
  }
  function homeUnplace(o){
    zoneRoot.remove(o.g); o.cb.forEach(b => { const i = boxes.indexOf(b); if (i >= 0) boxes.splice(i, 1); }); o.co.forEach(b => { const i = obstacles.indexOf(b); if (i >= 0) obstacles.splice(i, 1); });
    const i = homeObjs.indexOf(o); if (i >= 0) homeObjs.splice(i, 1);
  }
  async function homeLoad(){
    homeLoaded = false;
    if (VISIT) return;
    if (!Z || Z.id !== 'alpha') return;
    let lay = ST.home || [];
    if (typeof msuOn === 'function' && msuOn()){ try { const { data } = await MSU.client.rpc('get_odyssey_home'); if (Array.isArray(data)){ lay = data; ST.home = data; saveST(); } } catch (e){} }
    const need = [...new Set(lay.map(e => e.k).filter(k => PROP_DEFS[k]))];
    try { await loadProps(need); } catch (e){}
    if (!Z || Z.id !== 'alpha') return;
    homeObjs.slice().forEach(homeUnplace);
    lay.filter(e => homeIt(e.k)).forEach(homePlace);
    homeLoaded = true;
  }
  let homeSaveT = 0;
  function homeSave(){
    if (VISIT) return;
    ST.home = homeObjs.map(o => ({ k: o.e.k, x: +o.e.x.toFixed(2), z: +o.e.z.toFixed(2), r: +o.e.r.toFixed(3) })); saveST();
    clearTimeout(homeSaveT);
    homeSaveT = setTimeout(() => { if (typeof msuOn === 'function' && msuOn()) MSU.client.rpc('save_odyssey_home', { p_layout: ST.home }).then(() => {}, () => {}); }, 1500);
  }
  const inYard = () => Z && Z.id === 'alpha' && Math.abs(player.position.x - YARD.x) < YARD.half + 1.5 && Math.abs(player.position.z - YARD.z) < YARD.half + 1.5;
  let yardHello = false;
  function updateHomeBtn(){
    const show = !homeEdit && !VISIT && inYard() && !dlgState;
    document.getElementById('home-btns').classList.toggle('hidden', !show);
    document.getElementById('btn-invite').classList.toggle('hidden', !FR.ch);
    if (show && !yardHello){ yardHello = true; toast('🏠 여기는 나만의 장막이에요! 「꾸미기」를 눌러 꾸며 보세요', 2800); }
  }
  function renderHomePanel(msg){
    document.getElementById('hp-msg').textContent = msg || (homeSel ? '고른 물건을 돌리거나 옮기거나 치울 수 있어요' : homePick ? `마당을 눌러 ${homeIt(homePick).n}을(를) 놓아요` : '아래에서 물건을 고르고 마당을 눌러 놓아요 · 놓은 물건을 누르면 고칠 수 있어요');
    document.getElementById('hp-sel').classList.toggle('hidden', !homeSel);
    const cnt = k => homeObjs.filter(o => o.e.k === k).length;
    document.getElementById('hp-items').innerHTML = HOME_ITEMS.filter(homeShow).map(it => { const has = homeHas(it), c = cnt(it.k);
      const sub = it.season && !has ? '🎁 한정 무료' : it.badge && !has ? '🔒 배지' : has ? `${c}/${it.max}` : `💰${it.p}`;
      return `<button class="hp-it${homePick === it.k ? ' on' : ''}${it.badge && !has ? ' lock' : ''}" data-hk="${it.k}"><b>${it.ico}</b>${it.n}<br>${sub}</button>`; }).join('');
  }
  async function homeEnter(){
    if (homeEdit || VISIT) return;
    homeEdit = true; homePick = null; homeSel = null; homeMoving = false;
    document.body.classList.add('homeedit'); document.getElementById('home-panel').classList.remove('hidden');
    renderHomePanel('물건을 불러오는 중…');
    try { await loadProps(HOME_ITEMS.map(i => i.k).filter(k => PROP_DEFS[k])); } catch (e){}
    try { if (typeof shopRefresh === 'function') await shopRefresh(); } catch (e){}
    renderHomePanel();
  }
  function homeExit(silent){
    if (!homeEdit) return;
    homeEdit = false; homePick = null; homeSel = null; homeMoving = false; selRing.visible = false;
    document.body.classList.remove('homeedit'); document.getElementById('home-panel').classList.add('hidden');
    if (!silent){ homeSave(); toast('🏠 내 장막을 저장했어요', 1600); }
  }
  document.getElementById('btn-home').onclick = homeEnter;
  document.getElementById('hp-done').onclick = () => homeExit(false);
  document.getElementById('hp-items').addEventListener('click', async e => {
    const b = e.target.closest('[data-hk]'); if (!b) return;
    const it = homeIt(b.dataset.hk);
    homeSel = null; homeMoving = false; selRing.visible = false;
    if (!homeHas(it) && it.season && seasonNow() === it.season){
      ST.seasonal = (ST.seasonal || []).concat(it.k); saveST(); toast(`🎁 ${SEASONS[it.season].n} 한정 「${it.n}」 장식을 받았어요! 이벤트가 끝나도 계속 가져요`, 3000);
    }
    if (!homeHas(it)){
      if (it.badge){ renderHomePanel(`🔒 ${it.n}: ${it.how} 받아요`); return; }
      const logged = SHOP_MOCK || (typeof msuOn === 'function' && msuOn());
      if (!logged){ renderHomePanel('말씀우물에 로그인하면 달란트로 살 수 있어요'); return; }
      if (MSU.balance != null && MSU.balance < it.p){ renderHomePanel(`달란트가 ${it.p - MSU.balance} 모자라요 — 출석·퀴즈·오늘의 퀘스트로 모아 보세요!`); return; }
      if (!confirm(`${eul(it.n)} ${it.p}달란트로 살까요? (한 번 사면 계속 쓸 수 있어요)`)) return;
      try {
        if (SHOP_MOCK){ MSU.balance = (MSU.balance ?? 200) - it.p; }
        else { const { data, error } = await MSU.client.rpc('buy_odyssey_item', { p_key: 'home-' + it.k }); if (error) throw error; MSU.balance = data; }
        owned.add('home-' + it.k); saveLocal();
        toast(`🎉 ${eul(it.n)} 샀어요!`, 1800);
      } catch (err){ renderHomePanel('사지 못했어요: ' + ((err && err.message) || '다시 시도해 주세요')); return; }
    }
    if (homeObjs.filter(o => o.e.k === it.k).length >= it.max){ renderHomePanel(`${it.n}은(는) ${it.max}개까지 놓을 수 있어요`); homePick = null; return; }
    homePick = it.k; renderHomePanel();
  });
  document.getElementById('hp-sel').addEventListener('click', e => {
    const b = e.target.closest('[data-hp]'); if (!b || !homeSel) return;
    const o = homeSel;
    if (b.dataset.hp === 'rot'){ const e2 = { ...o.e, r: (o.e.r + Math.PI / 4) % (Math.PI * 2) }; homeUnplace(o); homeSel = homePlace(e2); homeSave(); }
    if (b.dataset.hp === 'del'){ homeUnplace(o); homeSel = null; selRing.visible = false; homeSave(); }
    if (b.dataset.hp === 'move'){ homeMoving = true; renderHomePanel('옮길 곳을 마당에서 눌러요'); return; }
    renderHomePanel();
  });
  // 위에서 내려다보는 카메라 · 고른 물건 표시 고리
  const selRing = new THREE.Mesh(new THREE.RingGeometry(0.7, 0.85, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0.9, depthTest: false }));
  selRing.visible = false; selRing.renderOrder = 998; scene.add(selRing);
  const _hc = new THREE.Vector3();
  function applyHomeCam(dt){
    if (!homeEdit) return;
    const y0 = heightAt(YARD.x, YARD.z);
    _hc.set(YARD.x, y0 + 15, YARD.z + 9.5); camera.position.lerp(_hc, 1); camera.lookAt(YARD.x, y0, YARD.z - 0.3);
    if (homeSel){ selRing.visible = true; selRing.position.set(homeSel.e.x, heightAt(homeSel.e.x, homeSel.e.z) + 0.08, homeSel.e.z); }
  }
  // 마당 누르기: 물건 고르기 / 놓기 / 옮기기
  const _ray = new THREE.Raycaster(), _ndc = new THREE.Vector2(), _plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), _hit = new THREE.Vector3();
  let tapStart = null;
  renderer.domElement.addEventListener('pointerdown', e => { if (homeEdit) tapStart = [e.clientX, e.clientY, performance.now()]; });
  renderer.domElement.addEventListener('pointerup', e => {
    if (!homeEdit || !tapStart) return;
    const [sx, sy, st] = tapStart; tapStart = null;
    if (Math.hypot(e.clientX - sx, e.clientY - sy) > 12 || performance.now() - st > 600) return;
    homeTap(e.clientX, e.clientY);
  });
  function homeTap(cx, cy){
    _ndc.set(cx / innerWidth * 2 - 1, -(cy / innerHeight) * 2 + 1); _ray.setFromCamera(_ndc, camera);
    if (!homePick && !homeMoving){
      const hits = _ray.intersectObjects(homeObjs.map(o => o.g), true);
      if (hits.length){ let ob = hits[0].object; const o = homeObjs.find(h => { let x = ob; while (x){ if (x === h.g) return true; x = x.parent; } return false; }); if (o){ homeSel = o; renderHomePanel(); return; } }
      homeSel = null; selRing.visible = false; renderHomePanel(); return;
    }
    _plane.constant = -heightAt(YARD.x, YARD.z);
    if (!_ray.ray.intersectPlane(_plane, _hit)) return;
    const snap = v => Math.round(v * 2) / 2;
    const x = snap(Math.max(YARD.x - YARD.half + 0.5, Math.min(YARD.x + YARD.half - 0.5, _hit.x))), z = snap(Math.max(YARD.z - YARD.half + 0.5, Math.min(YARD.z + YARD.half - 0.5, _hit.z)));
    if (Math.abs(_hit.x - YARD.x) > YARD.half + 1.5 || Math.abs(_hit.z - YARD.z) > YARD.half + 1.5){ renderHomePanel('마당(밧줄 안쪽)을 눌러 주세요'); return; }
    if (homeMoving && homeSel){ const e2 = { ...homeSel.e, x, z }; homeUnplace(homeSel); homeSel = homePlace(e2); homeMoving = false; homeSave(); renderHomePanel(); return; }
    const it = homeIt(homePick);
    if (homeObjs.filter(o => o.e.k === it.k).length >= it.max){ renderHomePanel(`${it.n}은(는) ${it.max}개까지 놓을 수 있어요`); homePick = null; return; }
    const o = homePlace({ k: it.k, x, z, r: faceTo(x, z, YARD.x, YARD.z + 8) });
    if (o){ homeSave(); homePick = null; homeSel = o; renderHomePanel(); }
  }
  // 마당 경계(밧줄) — 두루마리마을에 들어올 때 그림
  function buildYardRope(){
    if (!Z || Z.id !== 'alpha') return;
    const pts = [], h = YARD.half, c = [[-h, -h], [h, -h], [h, h], [-h, h], [-h, -h]];
    for (let i = 0; i < 4; i++) for (let t = 0; t < 1; t += 0.05){ const x = YARD.x + c[i][0] + (c[i + 1][0] - c[i][0]) * t, z = YARD.z + c[i][1] + (c[i + 1][1] - c[i][1]) * t; pts.push(new THREE.Vector3(x, heightAt(x, z) + 0.12, z)); }
    pts.push(pts[0].clone());
    zoneRoot.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xc89a5a })));
    for (const [a, b] of c.slice(0, 4)){ const x = YARD.x + a, z = YARD.z + b; const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.6, 6), new THREE.MeshToonMaterial({ color: 0x8a5a2a, gradientMap: toonGradient })); post.position.set(x, heightAt(x, z) + 0.3, z); zoneRoot.add(post); }
  }

  // ══ 👥 친구 추가 · 친구 장막 놀러 가기 · 초대 ══
  let PEOPLE_L = null, peopleTab = 'friend', VISIT = null, pendingInvite = null;
  async function loadPeople(){ const { data, error } = await MSU.client.rpc('get_odyssey_people'); if (error) throw error; PEOPLE_L = data || []; }
  const online = uid => !!(FR.meta && FR.meta[uid]);
  function renderPeople(msg){
    const L = PEOPLE_L || [], rec = L.filter(p => p.rel === 'received').length;
    const tabs = [['friend', '내 친구'], ['received', `받은 요청${rec ? ' ' + rec : ''}`], ['find', '친구 찾기']];
    document.getElementById('people-tabs').innerHTML = tabs.map(([k, l]) => `<button data-pt="${k}" class="${k === peopleTab ? 'on' : ''}">${l}</button>`).join('');
    const el = document.getElementById('people-list');
    if (!(typeof msuOn === 'function' && msuOn())){ el.innerHTML = `<div class="logline">말씀우물에 로그인하면 친구를 맺을 수 있어요. <a href="${MSU_BASE}login.html?next=/odyssey/">로그인하기</a></div>`; return; }
    if (!PEOPLE_L){ el.innerHTML = '<div class="logline">불러오는 중…</div>'; return; }
    const myYard = !VISIT && inYard() && FR.ch;
    const row = (p, btns) => `<div class="prow"><span class="nm">${escH(p.nickname || '친구')}${online(p.user_id) ? '<span class="dot" title="접속 중"></span>' : ''}${p.title ? `<small>🏷 ${escH(p.title)}${p.likes ? ` · 장막 ❤️ ${p.likes}` : ''}</small>` : p.likes ? `<small>장막 ❤️ ${p.likes}</small>` : ''}${p.prog ? `<small>📖 ${escH(p.prog)}</small>` : ''}</span>${btns}</div>`;
    let rows = [];
    if (peopleTab === 'friend') rows = L.filter(p => p.rel === 'friend').map(p => row(p,
      (myYard && online(p.user_id) ? `<button class="go" data-inv="${p.user_id}">📨 초대</button>` : '') + `<button class="go" data-visit="${p.user_id}">🏠 놀러 가기</button><button data-unf="${p.user_id}">✕</button>`));
    if (peopleTab === 'received') rows = L.filter(p => p.rel === 'received').map(p => row(p, `<button class="go" data-acc="${p.user_id}">수락</button><button data-rej="${p.user_id}">거절</button>`));
    if (peopleTab === 'find') rows = L.filter(p => p.rel !== 'friend').map(p => row(p, p.rel === 'sent' ? `<span style="font-size:12px;opacity:.7">요청 보냄</span><button data-rej="${p.user_id}">취소</button>` : p.rel === 'received' ? `<button class="go" data-acc="${p.user_id}">수락</button>` : `<button class="go" data-req="${p.user_id}">친구 요청</button>`));
    const empty = { friend: '아직 친구가 없어요. 「친구 찾기」에서 요청해 보세요!', received: '받은 친구 요청이 없어요.', find: '함께 오디세이를 하는 친구가 아직 없어요.' }[peopleTab];
    el.innerHTML = (msg ? `<div style="font-size:12.5px;color:#ffd27a;margin-bottom:4px">${msg}</div>` : '') + (rows.length ? rows.join('') : `<div class="logline">${empty}</div>`)
      + (peopleTab === 'friend' ? '<div style="font-size:12px;opacity:.75;margin-top:6px">초록 점 = 지금 접속 중 · 내 장막에 있을 때 접속한 친구를 초대할 수 있어요</div>' : '');
  }
  async function openPeople(tab){
    if (tab) peopleTab = tab;
    PEOPLE_L = PEOPLE_L || null; renderPeople(); openModal('people-modal');
    if (typeof msuOn === 'function' && msuOn()){ try { await loadPeople(); } catch (e){} renderPeople(); }
  }
  document.getElementById('btn-friends').onclick = () => openPeople();
  document.getElementById('btn-invite').onclick = () => openPeople('friend');
  document.getElementById('people-tabs').addEventListener('click', e => { const b = e.target.closest('[data-pt]'); if (b){ peopleTab = b.dataset.pt; renderPeople(); } });
  document.getElementById('people-list').addEventListener('click', async e => {
    const b = e.target.closest('button'); if (!b) return;
    const nickOf = id => ((PEOPLE_L || []).find(p => p.user_id === id) || {}).nickname || '친구';
    let msg = '';
    try {
      if (b.dataset.req){ const { data } = await MSU.client.rpc('request_odyssey_friend', { p_to: b.dataset.req }); msg = data === 'friend' ? `🎉 ${nickOf(b.dataset.req)}와(과) 친구가 됐어요!` : `📨 ${nickOf(b.dataset.req)}에게 친구 요청을 보냈어요`; }
      if (b.dataset.acc){ await MSU.client.rpc('respond_odyssey_friend', { p_other: b.dataset.acc, p_accept: true }); msg = `🎉 ${nickOf(b.dataset.acc)}와(과) 친구가 됐어요!`; }
      if (b.dataset.rej){ await MSU.client.rpc('respond_odyssey_friend', { p_other: b.dataset.rej, p_accept: false }); msg = '요청을 정리했어요'; }
      if (b.dataset.unf){ if (!confirm(`${nickOf(b.dataset.unf)}와(과) 친구를 끊을까요?`)) return; await MSU.client.rpc('respond_odyssey_friend', { p_other: b.dataset.unf, p_accept: false }); msg = '친구를 끊었어요'; }
      if (b.dataset.visit){ document.querySelector('#people-modal .close').click(); visitHome(b.dataset.visit); return; }
      if (b.dataset.inv){ FR.ch.send({ type: 'broadcast', event: 'invite', payload: { to: b.dataset.inv, from: FR.me.id, nick: FR.me.nick } }); msg = `📨 ${nickOf(b.dataset.inv)}에게 초대를 보냈어요`; }
      await loadPeople();
    } catch (err){ msg = '잠시 뒤 다시 해 주세요'; }
    renderPeople(msg);
  });
  function onInvite(m){
    if (!FR.me || m.to !== FR.me.id) return;
    pendingInvite = m;
    document.getElementById('invite-t').textContent = `📨 ${m.nick}이(가) 자기 장막에 초대했어요!`;
    document.getElementById('invite-pop').classList.remove('hidden');
    clearTimeout(onInvite.t); onInvite.t = setTimeout(() => document.getElementById('invite-pop').classList.add('hidden'), 20000);
  }
  document.getElementById('invite-no').onclick = () => document.getElementById('invite-pop').classList.add('hidden');
  document.getElementById('invite-go').onclick = () => { document.getElementById('invite-pop').classList.add('hidden'); if (pendingInvite) visitHome(pendingInvite.from); };
  async function visitHome(uid){
    if (!Z || Z.id !== 'alpha'){
      toast('🧭 두루마리마을로 이동해서 놀러 가요', 1800);
      await travelTo({ id: 'warp', to: 'alpha', spawn: ZONES.alpha.spawn });
      for (let i = 0; i < 60 && traveling; i++) await new Promise(r => setTimeout(r, 100));
      if (!Z || Z.id !== 'alpha') return;
    }
    let info = null;
    try { const { data } = await MSU.client.rpc('get_odyssey_home_info', { p_user: uid }); info = data; } catch (e){}
    if (!info){ toast('친구의 장막을 열 수 없어요(친구끼리만 놀러 갈 수 있어요)', 2400); return; }
    homeExit(true);
    const lay = (info.layout || []).filter(e => homeIt(e.k));
    try { await loadProps([...new Set(lay.map(e => e.k).filter(k => PROP_DEFS[k]))]); } catch (e){}
    homeObjs.slice().forEach(homeUnplace); lay.forEach(homePlace);
    VISIT = { uid, nick: info.nickname || '친구', likes: info.likes || 0, liked: !!info.liked }; wq('visit');
    renderVisit(); passDoor({ tele: [-44, 49], look: [-44, 40] });
    toast(`🏠 ${VISIT.nick}의 장막에 놀러 왔어요!`, 2200);
  }
  function renderVisit(){
    const bar = document.getElementById('visit-bar');
    if (!VISIT){ bar.classList.add('hidden'); return; }
    bar.classList.remove('hidden');
    document.getElementById('visit-t').textContent = `🏠 ${VISIT.nick}의 장막 · ❤️ ${VISIT.likes}`;
    document.getElementById('visit-like').textContent = VISIT.liked ? '❤️ 좋아요 취소' : '🤍 좋아요';
  }
  document.getElementById('visit-like').onclick = async () => {
    if (!VISIT) return;
    try { const { data } = await MSU.client.rpc('like_odyssey_home', { p_owner: VISIT.uid }); if (data != null){ VISIT.liked = !VISIT.liked; VISIT.likes = data; renderVisit(); if (VISIT.liked) toast('❤️ 좋아요를 보냈어요!', 1500); } } catch (e){}
  };
  document.getElementById('visit-back').onclick = () => { const m = markers.find(x => x.data.id === 'home-out'); passDoor(m ? m.data : { id: 'home-out', tele: [-14.5, 14.5], look: [0, 0] }); };
  function endVisit(){
    if (!VISIT) return;
    VISIT = null; renderVisit();
    homeObjs.slice().forEach(homeUnplace); homeLoad();
  }

  // ══ 2. 같은 마을 친구 보기(실시간): 위치·걷기 동작·이름표·인사 이모티콘 ══
  const FR = { ch: null, me: null, list: new Map(), meta: {}, tpl: {}, root: new THREE.Group(), sentAt: 0, sentKey: '', online: 0 };
  scene.add(FR.root);
  async function friendsInit(){
    if (!(MSU.client && MSU.session) || FR.ch || !THREE.SkeletonUtils) return;
    try {
      const uid = MSU.session.user.id, { data: nick } = await MSU.client.rpc('get_my_odyssey_name');
      if (!nick) return;
      FR.me = { id: uid, nick };
      try { FR.myTag = makeTag(nick); FR.myTag.position.y = 2.75; player.add(FR.myTag); setTagTitle(FR.myTag, { nick, title: typeof myTitle === 'function' ? myTitle() : '' }); } catch (e){}   // 내 이름표(2026-10-11)
      try { MSU.client.realtime.setAuth(MSU.session.access_token); } catch (e){}
      const ch = MSU.client.channel('odyssey-world', { config: { private: true, presence: { key: uid }, broadcast: { self: false } } });
      ch.on('broadcast', { event: 'pos' }, ({ payload }) => onFriendPos(payload))
        .on('broadcast', { event: 'invite' }, ({ payload }) => onInvite(payload))
        .on('broadcast', { event: 'emo' }, ({ payload }) => { const f = FR.list.get(payload.id); if (f) showBubble(f.g, payload.e); })
        .on('presence', { event: 'sync' }, () => {
          const st = ch.presenceState(); FR.meta = {};
          Object.entries(st).forEach(([k, arr]) => { if (k !== uid && arr[0]) FR.meta[k] = arr[0]; });
          FR.online = Object.keys(FR.meta).length; friendPill();
          FR.list.forEach((f, id) => { if (FR.meta[id]) setTagTitle(f.tag, FR.meta[id]); });   // 친구가 칭호를 바꾸면 바로 반영
          [...FR.list.keys()].forEach(k => { if (!FR.meta[k]) friendRemove(k); });
        })
        .subscribe(async status => {
          if (status !== 'SUBSCRIBED') return;
          FR.ch = ch;
          await ch.track({ nick, body: CHAR.body || 'boy', hair: CHAR.body ? (CHAR.hair || HAIR_DEFAULT[CHAR.body]) : null, title: typeof myTitle === 'function' ? myTitle() : '' });
          document.getElementById('btn-emo').classList.remove('hidden');
          loadPeople().then(() => { const n = (PEOPLE_L || []).filter(p => p.rel === 'received').length; if (n) setTimeout(() => toast(`👥 친구 요청이 ${n}개 와 있어요 — ☰ 메뉴 → 친구`, 2800), 4000); }).catch(() => {});
          FR.sentKey = ''; sendMyPos(true);
        });
    } catch (e){ console.warn('친구 연결 실패', e); }
  }
  function setTagTitle(tag, meta){
    const el = tag.userData.el, esc = t => String(t || '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    const cs = [...String(meta.nick || '친구')], nk = cs.length > 5 ? cs.slice(0, 5).join('') + '…' : cs.join('');   // 긴 닉네임은 5글자까지(2026-10-11)
    el.innerHTML = esc(nk) + (meta.title ? `<small>🏷 ${esc(meta.title)}</small>` : '');
  }
  // 내 칭호가 바뀌면 친구들 화면의 내 이름표도 바뀌게 다시 알림
  function retrackTitle(){ if (FR.myTag && FR.me) try { setTagTitle(FR.myTag, { nick: FR.me.nick, title: myTitle() }); } catch (e){}
    if (FR.ch && FR.me) FR.ch.track({ nick: FR.me.nick, body: CHAR.body || 'boy', hair: CHAR.body ? (CHAR.hair || HAIR_DEFAULT[CHAR.body]) : null, title: myTitle() }).catch(() => {}); }
  function friendPill(){
    const here = [...FR.list.values()].length, el = document.getElementById('friend-pill');
    el.classList.toggle('hidden', !FR.online);
    el.textContent = `👥 접속한 친구 ${FR.online}명${here ? ` · 이 마을 ${here}명` : ''}`;
    placeFriendPill();
  }
  // 2026-10-11 왼쪽 위 퀘스트 목록 바로 아래에 둔다(위 가운데에 있으면 문 위 글자를 가림). 퀘스트 패널 크기·위치가 바뀌면 따라간다.
  function placeFriendPill(){
    const q = document.getElementById('quest-panel'), el = document.getElementById('friend-pill'); if (!q || !el) return;
    const r = q.getBoundingClientRect(); if (r.height < 4) return;
    el.style.top = Math.round(r.bottom + 6) + 'px'; el.style.left = Math.round(r.left) + 'px';
  }
  try { new ResizeObserver(placeFriendPill).observe(document.getElementById('quest-panel')); } catch (e){}
  addEventListener('resize', placeFriendPill);
  function sendMyPos(force){
    if (!FR.ch || !Z) return;
    const P = player.position, a = moveSpeed < 0.35 ? 'Idle' : moveSpeed > (WALK_SPEED + RUN_SPEED) / 2 ? 'Run' : 'Walk';
    const msg = { id: FR.me.id, z: Z.id, x: +P.x.toFixed(2), y: +P.y.toFixed(2), w: +P.z.toFixed(2), h: +heading.toFixed(2), a };
    const key = [msg.z, msg.x, msg.y, msg.w, msg.h, a].join(), now = performance.now();
    if (!force && ((key === FR.sentKey && now - FR.sentAt < 2000) || now - FR.sentAt < 200)) return;
    FR.sentKey = key; FR.sentAt = now;
    FR.ch.send({ type: 'broadcast', event: 'pos', payload: msg });
  }
  async function friendTemplate(body){
    if (!FR.tpl[body]) FR.tpl[body] = loadGLB(`chars/base-${body}.glb`).then(g => {
      g.scene.traverse(o => { if (o.isMesh){ const src = o.material; if (src.map){ src.map.generateMipmaps = false; src.map.minFilter = THREE.LinearFilter; } o.material = new THREE.MeshToonMaterial({ map: src.map, color: 0xffffff, gradientMap: toonGradient }); o.castShadow = true; o.frustumCulled = false; } });
      g.animations.forEach(c => { c.tracks = c.tracks.filter(t => !/\.scale$/.test(t.name)); c.resetDuration(); });
      return g;
    });
    return FR.tpl[body];
  }
  function onFriendPos(m){
    if (!Z || m.z !== Z.id){ friendRemove(m.id); return; }
    let f = FR.list.get(m.id);
    if (!f){
      const meta = FR.meta[m.id]; if (!meta) return;
      const g = new THREE.Group(); g.position.set(m.x, m.y, m.w); FR.root.add(g);
      const tag = makeTag(meta.nick || '친구'); tag.position.y = 2.75; g.add(tag); setTagTitle(tag, meta);
      f = { g, tag, tx: m.x, ty: m.y, tz: m.w, h: m.h, a: 'Idle', t: performance.now(), mixer: null, actions: {}, cur: null };
      FR.list.set(m.id, f); friendPill();
      friendTemplate(meta.body === 'girl' ? 'girl' : 'boy').then(async tpl => {
        if (FR.list.get(m.id) !== f) return;
        const model = THREE.SkeletonUtils.clone(tpl.scene); model.scale.setScalar(PLAYER_HEIGHT / RIG_HEIGHT_M); g.add(model);
        f.mixer = new THREE.AnimationMixer(model); tpl.animations.forEach(c => { f.actions[c.name] = f.mixer.clipAction(c); });
        if (meta.hair){ g.updateMatrixWorld(true); try { await attachHair(model, meta.hair, false); } catch (e){} }
      }).catch(() => {});
    }
    Object.assign(f, { tx: m.x, ty: m.y, tz: m.w, h: m.h, a: m.a, t: performance.now() });
  }
  function friendRemove(id){ const f = FR.list.get(id); if (!f) return; FR.root.remove(f.g); if (f.mixer) f.mixer.stopAllAction(); FR.list.delete(id); friendPill(); }
  function friendsClear(){ [...FR.list.keys()].forEach(friendRemove); if (FR.ch){ FR.sentKey = ''; setTimeout(() => sendMyPos(true), 300); } }
  function updateFriends(dt, now){
    if (!FR.ch) return;
    sendMyPos(false);
    FR.list.forEach((f, id) => {
      if (now - f.t > 12000){ friendRemove(id); return; }
      const k = Math.min(1, dt * 8);
      f.g.position.x += (f.tx - f.g.position.x) * k; f.g.position.z += (f.tz - f.g.position.z) * k; f.g.position.y += (f.ty - f.g.position.y) * k;
      if (Math.hypot(f.tx - f.g.position.x, f.tz - f.g.position.z) > 8) f.g.position.set(f.tx, f.ty, f.tz);   // 순간이동(문·출구)
      let d = (Math.PI - f.h) - f.g.rotation.y; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; f.g.rotation.y += d * Math.min(1, dt * 10);
      if (f.mixer){
        const want = f.actions[f.a] ? f.a : 'Idle';
        if (f.cur !== want){ const nx = f.actions[want]; if (nx){ nx.reset().fadeIn(0.2).play(); if (f.cur && f.actions[f.cur]) f.actions[f.cur].fadeOut(0.2); f.cur = want; } }
        f.mixer.update(dt);
      }
    });
  }
  // 인사 이모티콘: 내 머리 위 + 같은 마을 친구들에게
  const bubbles = [];
  function showBubble(obj, e){
    const el = document.createElement('div'); el.className = 'emo-bub'; el.textContent = e; document.body.appendChild(el);
    bubbles.push({ el, obj, until: performance.now() + 2600 });
  }
  const _bv = new THREE.Vector3();
  function updateBubbles(){
    const now = performance.now();
    for (let i = bubbles.length - 1; i >= 0; i--){
      const b = bubbles[i];
      if (now > b.until || !b.obj.parent){ b.el.remove(); bubbles.splice(i, 1); continue; }
      b.obj.getWorldPosition(_bv); _bv.y += 3.3; _bv.project(camera);
      b.el.style.left = ((_bv.x + 1) / 2 * innerWidth) + 'px'; b.el.style.top = ((1 - _bv.y) / 2 * innerHeight) + 'px';
      b.el.style.opacity = _bv.z > 1 ? '0' : now > b.until - 400 ? '0' : '1';
    }
  }
  document.getElementById('btn-emo').onclick = e => { e.stopPropagation(); document.getElementById('emo-bar').classList.toggle('hidden'); };
  document.getElementById('emo-bar').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    showBubble(player, b.textContent); document.getElementById('emo-bar').classList.add('hidden');
    if (FR.ch) FR.ch.send({ type: 'broadcast', event: 'emo', payload: { id: FR.me.id, e: b.textContent } });
  });

  // ══ C. 기록 랭킹 · 오이코스 함께 모으기(말씀우물 로그인 + 시험 참여자만) ══
  const msuOn = () => !!(MSU.client && MSU.session);
  function submitRecord(kind, v){ if (msuOn()) MSU.client.rpc('submit_odyssey_score', { p_kind: kind, p_value: Math.round(v) }).then(() => {}, () => {}); }
  let progT = 0, lastProg = '';
  function queueProgress(){
    if (!msuOn()) return; clearTimeout(progT);
    progT = setTimeout(() => {
      const sc = Object.values(ST.scrolls || {}).reduce((a, x) => a + x.length, 0);
      const args = { p_chapters: ST.ch + (ST.cleared ? 1 : 0), p_verses: ST.verses.length, p_scrolls: sc, p_title: typeof myTitle === 'function' ? myTitle() : null };
      const key = JSON.stringify(args); if (key === lastProg){ syncAchieve(); return; } lastProg = key;
      MSU.client.rpc('submit_odyssey_progress', args).then(() => {}, () => {});
      syncAchieve();
    }, 4000);
  }
  // ══ ☁️ 계정별 저장·복구 · 막힘 기록 · 오류 기록 (말씀우물 로그인 + 시험 참여자) ══
  // 저장: 진행(ST)·스킬·캐릭터·장착·튜토리얼 여부를 계정에 올림. 서버는 덜 진행한 기록으로 덮어쓰지 않고 직전 기록을 한 벌 더 보관.
  const CLOUD_KEYS = [STORY_KEY, SAVE_KEY, 'inodyssey-char', 'inodyssey-equip', 'inodyssey-tutorial'];
  // 진행 점수: 모세 편 + 다른 두루마리(ST.sp)의 진행이 클수록 크고, 같은 진행이면 구절·배지가 많은 쪽이 크다(2026-09-29 — 모세 편을 다 마치면 모두 같은 점수가 돼서 다른 기기의 덜 진행한 기록이 계정 기록을 덮을 수 있었다)
  const scrollScoreOf = st => Object.values(st.sp || {}).reduce((a, p) => a + (p ? ((p.ch || 0) + (p.cleared ? 1 : 0)) * 1000 + (p.cleared ? 0 : (p.step || 0)) * 10 : 0), 0);
  const cloudScoreOf = st => ((st.ch + (st.cleared ? 1 : 0)) * 1000 + (st.cleared ? 0 : st.step || 0) * 10 + scrollScoreOf(st)) * 100 + Math.min(99, (st.verses || []).length + (st.badges || []).length);
  const cloudScore = () => cloudScoreOf(ST.replayBackup ? { ...ST, ...ST.replayBackup } : ST);
  const packState = pack => { try { return JSON.parse((pack && pack.keys && pack.keys[STORY_KEY]) || 'null'); } catch (e){ return null; } };
  const packScore = pack => { const o = packState(pack); return o ? cloudScoreOf(o) : 0; };
  const CLOUD = { t: 0, ready: false, last: null, busy: false };
  function cloudPack(){
    const keys = {};
    for (const k of CLOUD_KEYS){ let v = null; try { v = localStorage.getItem(k); } catch (e){}
      if (k === STORY_KEY){ const o = JSON.parse(JSON.stringify({ ...ST, log: [] })); if (o.replayBackup){ Object.assign(o, o.replayBackup); delete o.replayBackup; } if (o.replayCur){ o.cur = o.replayCur; delete o.replayCur; } v = JSON.stringify(o); }   // 메모리의 최신 진행을 그대로
      keys[k] = v; }
    return { v: 1, at: Date.now(), keys };
  }
  async function cloudSave(force){
    if (!msuOn() || !CLOUD.ready || CLOUD.busy || CLOUD.leaving) return null;   // 불러오기·초기화로 새로고침하는 중엔 옛 기록을 올리지 않음
    CLOUD.busy = true;
    try { const { data, error } = await MSU.client.rpc('save_odyssey_state', { p_data: cloudPack(), p_score: cloudScore(), p_force: !!force }); if (error) throw error; if (data === 1) CLOUD.last = new Date(); return data; }
    catch (e){ return null; } finally { CLOUD.busy = false; }
  }
  function queueCloud(){ if (!msuOn() || !CLOUD.ready) return; clearTimeout(CLOUD.t); CLOUD.t = setTimeout(() => cloudSave(false), 15000); }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && CLOUD.ready){ clearTimeout(CLOUD.t); cloudSave(false); } });
  function cloudRestore(pack){
    CLOUD.leaving = true;
    try { sessionStorage.setItem('odyssey-restored', String(pack.at || 1)); } catch (e){}
    for (const k of CLOUD_KEYS){ const v = pack.keys && pack.keys[k]; try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e){} }
    const u = new URL(location.href); ['reset', 'ch', 'zone', 'body', 'hair'].forEach(p => u.searchParams.delete(p)); location.href = u.toString();
  }
  const scoreText = sc => { const c = Math.floor(sc / 1000), s = Math.floor((sc % 1000) / 10); return c >= CHAPTERS.length ? `${CHAPTERS.length}장 모두 완료` : `${c + 1}장 ${s + 1}단계`; };
  // 진행을 글로 — 복구 안내창에 쓴다(모세 편 + 진행 중인 다른 두루마리)
  const progText = st => { st = st || {}; const c = (st.ch || 0) + (st.cleared ? 1 : 0), s = st.cleared ? 0 : (st.step || 0);
    const parts = [c >= CHAPTERS.length ? '모세 편 모두 완료' : `모세 편 ${c + 1}장 ${s + 1}단계`];
    for (const [id, p] of Object.entries(st.sp || {})){ if (!p || !((p.ch || 0) || p.step || p.cleared)) continue; parts.push(`${scrollTitle(id)} ${(p.ch || 0) + (p.cleared ? 1 : 0)}장 진행`); }
    return parts.join(' · '); };
  async function cloudInit(){
    if (!msuOn() || SHOP_MOCK) return;
    let row = null;
    try { const { data, error } = await MSU.client.rpc('get_odyssey_state'); if (error) throw error; row = data && data[0]; } catch (e){ return; }   // 서버 준비 전이면 조용히 건너뜀
    CLOUD.ready = true;
    // 관리자가 계정 기록을 초기화했으면(서버 저장본에 reset 표시) 이 기기 기록도 한 번 비우고 처음부터
    if (row && row.data && row.data.reset){ let done = null; try { done = localStorage.getItem('inodyssey-reset-at'); } catch (e){}
      if (String(row.data.at) !== done){ try { localStorage.setItem('inodyssey-reset-at', String(row.data.at)); localStorage.removeItem('inodyssey-owned'); } catch (e){} toast('☁️ 모험을 처음부터 시작해요…', 2000); setTimeout(() => cloudRestore(row.data), 900); CLOUD.leaving = true; return; } }
    let restored = null; try { restored = sessionStorage.getItem('odyssey-restored'); } catch (e){}
    const local = cloudScore();
    const fresh = (ST.ch + (ST.cleared ? 1 : 0)) * 1000 + (ST.cleared ? 0 : ST.step || 0) * 10 <= 10 && !(ST.verses || []).length && !Object.values(ST.sp || {}).some(p => p && ((p.ch || 0) || p.step || p.cleared));
    // 서버에 예전 방식(모세 편만 센) 점수가 저장돼 있어도, 저장된 진행 내용으로 다시 세어 비교한다
    const srv = row && row.data ? Math.max(row.score || 0, packScore(row.data)) : 0;
    if (row && row.data && srv > local && String(row.data.at) !== restored){
      if (fresh){ toast('☁️ 계정에 저장된 모험을 불러와요…', 2000); setTimeout(() => cloudRestore(row.data), 900); return; }
      if (confirm(`☁️ 계정에 더 많이 진행한 기록이 있어요.\n\n계정: ${progText(packState(row.data))}\n이 기기: ${progText(ST)}\n\n계정 기록을 불러올까요? (취소하면 이 기기 기록으로 계속해요)`)){ cloudRestore(row.data); return; }
      return;   // 이 기기 기록으로 계속 — 서버의 더 앞선 기록은 그대로 보관됨
    }
    cloudSave(false);
  }
  function renderCloud(msg){
    const el = document.getElementById('cloud-now'); if (!el) return;
    el.textContent = msg || (!msuOn() ? '말씀우물 로그인하면 계정에 저장돼요' : !CLOUD.ready ? '확인 중…' : CLOUD.last ? `마지막 저장 ${CLOUD.last.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}` : '자동 저장 켜짐');
  }
  document.getElementById('cloud-save').onclick = async () => { renderCloud('저장 중…'); const r = await cloudSave(false); renderCloud(r === 1 ? '☁️ 저장했어요' : r === 0 ? '계정에 더 앞선 기록이 있어 덮어쓰지 않았어요' : '저장하지 못했어요(로그인 확인)'); };
  document.getElementById('cloud-load').onclick = async () => {
    if (!msuOn()){ renderCloud('말씀우물 로그인이 필요해요'); return; }
    try { const { data } = await MSU.client.rpc('get_odyssey_state'); const row = data && data[0]; if (!row){ renderCloud('계정에 저장된 기록이 없어요'); return; }
      if (confirm(`계정 기록(${progText(packState(row.data))})으로 바꿀까요? 이 기기의 지금 진행은 계정 기록으로 바뀌어요.`)) cloudRestore(row.data); } catch (e){ renderCloud('불러오지 못했어요'); }
  };
  document.getElementById('btn-set').addEventListener('click', () => setTimeout(() => renderCloud(), 50));
  // 막힘 기록: 이야기 단계를 처음 마칠 때 걸린 시간(초)만 — 대화 내용·개인정보 없음
  const DEV = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
  function logStep(q, secs){ if (!msuOn() || (typeof REPLAY !== 'undefined' && REPLAY)) return; MSU.client.rpc('log_odyssey_step', { p_ch: AP().ch + 1, p_step: ST.cur === 'moses' ? q.id : (ST.cur + '/' + q.id).slice(0, 20), p_secs: Math.round(secs), p_dev: DEV }).then(() => {}, () => {}); }
  // 게임 오류를 말씀우물 오류 기록(client_errors)에 — 한 번 켤 때 최대 4건, 같은 메시지는 1번
  (() => { let sent = 0; const seen = new Set();
    const rep = (msg, stack) => { if (sent >= 4 || !msuOn()) return; const k = String(msg).slice(0, 200); if (seen.has(k) || /ResizeObserver/.test(k)) return; seen.add(k); sent++;
      MSU.client.rpc('log_client_error', { p_page: '/odyssey/', p_message: String(msg || '').slice(0, 1000), p_stack: String(stack || '').slice(0, 4000), p_ua: navigator.userAgent }).then(() => {}, () => {}); };
    window.addEventListener('error', e => rep(e.message || 'script error', (e.error && e.error.stack) || ''));
    window.addEventListener('unhandledrejection', e => { const r = e.reason; rep('unhandledrejection: ' + (r && r.message ? r.message : String(r)), (r && r.stack) || ''); });
  })();
  const RANK_TABS = [
    { k: 'progress', l: '📜 모험 진행', fmt: r => `${r.value}장 · 구절 ${String(r.extra || '').split('/')[0]}장` },
    { k: 'brick', l: '🧱 벽돌', fmt: r => r.value + '장' }, { k: 'frogs', l: '🐸 개구리', fmt: r => r.value + '마리' },
    { k: 'hail', l: '🧊 우박', fmt: r => r.value + '초' }, { k: 'dark', l: '🕯 흑암', fmt: r => r.value + '초' },
    { k: 'rhythm', l: '🥁 소고', fmt: r => r.value + '점' }, { k: 'rp_redsea', l: '🌊 홍해', fmt: r => r.value + '초' },
    { k: 'rp_marks', l: '🐑 문설주', fmt: r => r.value + '초' }, { k: 'rp_hail', l: '📢 우박 알리기', fmt: r => r.value + '초' }, { k: 'rp_straw', l: '🌾 짚단', fmt: r => r.value + '초' },
    { k: 'oikos', l: '🤝 우리 오이코스' },
  ];
  let rankData = null, oikData = null, rankTab = 'progress';
  // ══ 🏃 광야 조작 코스(두루마리마을 동남쪽 빈 땅): 빛 고리를 차례로 지나며 상자 오르기·담 넘기 연습. 코스는 주마다 바뀌어요 ══
  const COURSE_O = [26, 12];   // 코스 기준점
  // r: 땅 위 고리 · c: 상자(높이 h, 윗면에 고리가 있으면 ring:1) · w: 낮은 담(길이 len, 방향 rot)
  const COURSES = [
    { n: 'A', items: [['r', 3, 1], ['c', 7, 3, 0.9, 1], ['w', 10, 3, 3.2, 0], ['r', 13, 3], ['c', 16, 7, 1.4, 1], ['c', 14.6, 7, 0.8], ['w', 12, 10, 3.2, 1.5708], ['r', 12, 13], ['c', 7, 13, 1.1, 1], ['r', 2, 9]] },
    { n: 'B', items: [['w', 3, 3, 3.2, 1.5708], ['r', 3, 6], ['c', 6, 10, 0.8], ['c', 7.4, 10, 1.5, 1], ['r', 11, 14], ['w', 14, 11, 3.2, 0], ['r', 17, 9], ['c', 15, 4, 1.2, 1], ['w', 11, 2, 3.2, 0], ['r', 7, 1], ['r', 1, 1]] },
    { n: 'C', items: [['c', 3, 3, 1.0, 1], ['w', 6, 6, 3.2, 0.785], ['r', 9, 8], ['c', 12, 8, 0.8], ['c', 13.4, 8, 1.6, 1], ['r', 17, 12], ['w', 13, 13, 3.2, 1.5708], ['c', 9, 14, 1.2, 1], ['w', 5, 11, 3.2, 0], ['r', 2, 8]] },
  ];
  const weekNo = () => Math.floor((Math.floor((Date.now() + 9 * 3600e3) / 864e5) + 3) / 7);   // 한국 시간 월요일마다 바뀜
  const courseIdx = () => weekNo() % COURSES.length, courseKind = () => 'rp_course' + (courseIdx() + 1);
  COURSES.forEach((c, i) => { CH_INFO['rp_course' + (i + 1)] = { name: `광야 코스 ${c.n}`, unit: '초', high: false }; });
  RANK_TABS.splice(RANK_TABS.length - 1, 0, { k: courseKind(), l: '🏃 광야 코스', fmt: r => r.value + '초' });
  Object.assign(BADGES, { wild_runner: { ico: '🏃', name: '광야를 달린 사람' } });
  ZONES.alpha.points.push({ id: 'course', x: 24, z: 10.5, type: 'lore', title: '🏃 광야 조작 코스', challenge: 'course', body: '' });
  const course = { rings: [], boxes: [], i: 0, t: 0 };
  function courseClear(){
    course.boxes.forEach(b => { const k = boxes.indexOf(b); if (k >= 0) boxes.splice(k, 1); }); course.boxes = []; course.rings = [];
  }
  function buildCourse(){
    courseClear();
    const [ox, oz] = COURSE_O, C = COURSES[courseIdx()];
    const wood = new THREE.MeshToonMaterial({ color: 0xa8773f, gradientMap: toonGradient }), brick = new THREE.MeshToonMaterial({ color: 0xc9a878, gradientMap: toonGradient });
    const ringGeo = new THREE.TorusGeometry(0.85, 0.09, 8, 28);
    for (const it of C.items){
      const x = ox + it[1], z = oz + it[2], g = heightAt(x, z);
      if (it[0] === 'c'){
        const h = it[3], m = new THREE.Mesh(new THREE.BoxGeometry(1.4, h, 1.4), wood); m.position.set(x, g + h / 2, z); m.castShadow = m.receiveShadow = true; zoneRoot.add(m); live.objs.push(m);
        const b = { x, z, rot: 0, hx: 0.7, hz: 0.7, top: g + h, stand: true }; boxes.push(b); course.boxes.push(b);
        if (it[4]) course.rings.push({ x, z, y: g + h, top: true });
      } else if (it[0] === 'w'){
        const len = it[3], rot = it[4], m = new THREE.Mesh(new THREE.BoxGeometry(len, 0.8, 0.3), brick); m.position.set(x, g + 0.4, z); m.rotation.y = rot; m.castShadow = true; zoneRoot.add(m); live.objs.push(m);
        const b = { x, z, rot, hx: len / 2, hz: 0.15, top: g + 0.8, stand: false }; boxes.push(b); course.boxes.push(b);
      } else course.rings.push({ x, z, y: g, top: false });
    }
    course.rings.forEach((r, i) => {
      const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0.35 }));
      m.position.set(r.x, r.y + 1.0, r.z); zoneRoot.add(m); live.objs.push(m); r.m = m;
      const tag = makeNumTag(i + 1); tag.position.set(r.x, r.y + 2.2, r.z); zoneRoot.add(tag); live.objs.push(tag); r.tag = tag;
    });
  }
  function makeNumTag(n){
    const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
    x.fillStyle = 'rgba(40,28,14,.8)'; x.beginPath(); x.arc(32, 32, 28, 0, 7); x.fill(); x.fillStyle = '#ffd27a'; x.font = 'bold 34px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(String(n), 32, 34);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthTest: false, transparent: true })); s.scale.set(0.9, 0.9, 1); return s;
  }
  function courseChallenge(best){
    const C = COURSES[courseIdx()];
    mgOpen('🏃 광야 조작 코스', `이번 주 코스는 <b>${C.n}</b>예요(월요일마다 바뀌어요). 빛나는 <b>고리 1번부터 ${C.items.filter(i => i[0] === 'r' || (i[0] === 'c' && i[4])).length}번까지</b> 차례로 지나가요. 상자 위 고리는 <b>점프</b>로 올라서고, 낮은 담은 점프로 넘어가요. 빠를수록 좋아요!${best}`);
    mgAct.onclick = () => { mgCloseAll(); liveEnd(); live.kind = 'course'; buildCourse(); course.i = 0; course.t = 0; courseMark(); hudCh.classList.remove('hidden'); toast('🏁 출발! 1번 고리로', 1400); };
  }
  function courseMark(){
    course.rings.forEach((r, i) => { r.m.visible = i >= course.i; r.tag.visible = i >= course.i && i < course.i + 2; r.m.material.opacity = i === course.i ? 1 : 0.3; r.m.material.color.setHex(i === course.i ? 0xffe38a : 0xb8a070); });
  }
  function updateCourseLive(dt){
    if (live.kind !== 'course') return false;
    if (!Z || Z.id !== 'alpha'){ liveEnd(); return true; }
    if (dlgState) return true;
    course.t += dt; const P = player.position, r = course.rings[course.i], N = course.rings.length;
    course.rings.forEach((q, i) => { if (i === course.i) q.m.rotation.y += dt * 2; });
    if (r && Math.hypot(P.x - r.x, P.z - r.z) < 1.1 && P.y > r.y - (r.top ? 0.25 : 1)){
      course.i++; courseMark(); 
      if (course.i >= N){
        const sec = Math.max(1, Math.round(course.t)), nb = recordBest(courseKind(), sec);
        if (!ST.badges.includes('wild_runner')){ ST.badges.push('wild_runner'); saveST(); setTimeout(() => { toast('🏃 배지 획득: 광야를 달린 사람', 2400); try { syncAchieve(); } catch (e){} }, 1500); }
        liveEnd(`🏁 코스 ${COURSES[courseIdx()].n} 완주! ${sec}초${nb ? ' 🏆 최고 기록!' : ''}`); return true;
      }
      toast(`✓ ${course.i}/${N}`, 700);
    }
    hudCh.textContent = `🏃 ${course.i}/${N} · ⏱ ${course.t.toFixed(1)}초`;
    if (course.t > 300) liveEnd('⏱ 5분이 지나 코스를 멈췄어요. 다시 도전해 보세요!');
    return true;
  }
  const escH = t => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function renderRank(){
    document.getElementById('rank-tabs').innerHTML = RANK_TABS.map(t => `<button data-rt="${t.k}" class="${t.k === rankTab ? 'on' : ''}">${t.l}</button>`).join('');
    const el = document.getElementById('rank-list');
    if (!msuOn()){ el.innerHTML = `<div class="logline">말씀우물에 로그인하면 친구들과 기록을 비교할 수 있어요. <a href="${MSU_BASE}login.html?next=/odyssey/">로그인하기</a></div>`; return; }
    if (!rankData){ el.innerHTML = '<div class="logline">불러오는 중…</div>'; return; }
    if (rankTab === 'oikos'){
      if (!oikData || !oikData.length){ el.innerHTML = '<div class="logline">아직 오이코스에 들어가 있지 않거나, 함께 오디세이를 하는 친구가 없어요.</div>'; return; }
      const groups = {}; oikData.forEach(r => (groups[r.group_name] = groups[r.group_name] || []).push(r));
      el.innerHTML = Object.entries(groups).map(([g, rows]) => {
        const sum = rows.reduce((a, r) => a + r.verses, 0), goal = [30, 60, 100, 150, 200].find(x => x > sum) || sum;
        return `<div style="margin:4px 0 10px"><b>🤝 ${escH(g)}</b> — 함께 모은 구절 카드 <b>${sum}</b>장 · 다음 목표 ${goal}장<div class="oik-bar"><i style="width:${Math.min(100, sum / goal * 100)}%"></i></div>`
          + rows.map(r => `<div class="rkrow${r.is_mine ? ' mine' : ''}"><span class="nm">${escH(r.nickname || '친구')}${r.is_mine ? ' (나)' : ''}</span><span class="v">${r.verses}장</span></div>`).join('') + `</div>`;
      }).join('') + '<div style="font-size:12px;opacity:.75">오이코스 친구들이 구절 카드를 모을수록 함께 채워져요.</div>';
      return;
    }
    const tab = RANK_TABS.find(t => t.k === rankTab), rows = rankData.filter(r => r.kind === rankTab);
    const rule = rankTab === 'dark' || rankTab.startsWith('rp_') ? '빨리 해낸 순' : rankTab === 'progress' ? '마친 장 → 모은 구절 순' : '높은 기록 순';
    el.innerHTML = `<div style="font-size:12px;opacity:.75;margin-bottom:4px">${rule}</div>` + (rows.length ? rows.map(r => `<div class="rkrow${r.is_mine ? ' mine' : ''}"><span class="no">${['🥇', '🥈', '🥉'][r.rank - 1] || r.rank}</span><span class="nm">${escH(r.nickname || '친구')}${r.is_mine ? ' (나)' : ''}${r.title ? `<small>🏷 ${escH(r.title)}</small>` : ''}</span><span class="v">${tab.fmt(r)}</span></div>`).join('')
      : '<div class="logline">아직 기록이 없어요. 첫 번째 주인공이 되어 볼까요?</div>');
  }
  document.getElementById('rank-tabs').addEventListener('click', e => { const b = e.target.closest('button[data-rt]'); if (b){ rankTab = b.dataset.rt; renderRank(); } });
  document.getElementById('btn-rank').onclick = async () => {
    rankData = null; renderRank(); openModal('rank-modal');
    if (!msuOn()) return;
    clearTimeout(progT); lastProg = ''; queueProgress();
    const [a, b] = await Promise.all([MSU.client.rpc('get_odyssey_rankings', { p_limit: 10 }), MSU.client.rpc('get_odyssey_oikos')]);
    rankData = a.data || []; oikData = b.data || []; renderRank();
  };
  document.getElementById('btn-log').onclick = () => {
    document.getElementById('log-list').innerHTML = ST.log.length ? ST.log.slice().reverse().map(l => `<div class="logline">${l.n ? `<b>${l.n}</b> ` : ''}${l.t}</div>`).join('') : '<div class="logline">아직 나눈 대화가 없어요.</div>';
    openModal('log-modal');
  };

