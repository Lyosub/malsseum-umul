import re, json
# ① gen7.py · dump7.mjs — 21~31장과 대상 10장
g = open('gen7.py', encoding='utf-8').read()
def gr(a, b):
    global g
    assert g.count(a) == 1, a[:60]
    g = g.replace(a, b)
gr("for c in range(8, 21):", "for c in range(8, 32):")
gr("def v(b, c, n): return V[(b, c, n)]", "for k, t in json.load(open(os.path.join(HERE, '1ch.json'), encoding='utf-8'))['10'].items(): V[('대상', 10, int(k))] = t\ndef v(b, c, n): return V[(b, c, n)]")
gr("exec(open(os.path.join(HERE, 'gen7_3bu.py'), encoding='utf-8').read())", "exec(open(os.path.join(HERE, 'gen7_3bu.py'), encoding='utf-8').read())\nexec(open(os.path.join(HERE, 'gen7_4bu.py'), encoding='utf-8').read())")
gr("'1sa20-42': (S, 20, 42)}", "'1sa20-42': (S, 20, 42), '1sa22-2': (S, 22, 2), '1sa23-16': (S, 23, 16), '1sa24-6': (S, 24, 6), '1sa26-23': (S, 26, 23), '1sa25-32': (S, 25, 32), '1sa30-6': (S, 30, 6), '1sa30-24': (S, 30, 24), '1ch10-13': ('대상', 10, 13), '1ch10-14': ('대상', 10, 14), '1sa31-13': (S, 31, 13)}")
gr("BOOK = {'삼상': '사무엘상'}", "BOOK = {'삼상': '사무엘상', '대상': '역대상'}")
open('gen7.py', 'w', encoding='utf-8', newline='\n').write(g)

d = open('dump7.mjs', encoding='utf-8').read()
def dr(a, b):
    global d
    assert d.count(a) == 1, a[:60]
    d = d.replace(a, b)
dr("bethlehem: Z(), philistia: Z() };", "bethlehem: Z(), philistia: Z(), judah: Z(), jezreel: Z() };")
dr("## 15. 7편 「사울과 다윗」 1·2·3부 대사 (1부 2026-10-31 · 2부 2026-11-02 · 3부 2026-11-03 · 전도사님 검수 대기)", "## 15. 7편 「사울과 다윗」 전체 대사 (1부 2026-10-31 · 2부 2026-11-02 · 3부·4부 2026-11-03 · 전도사님 검수 대기)")
dr("원문 파일(사무엘상 8–20장)", "원문 파일(사무엘상 8–31장, 역대상 10장)")
dr("for (let c = 8; c <= 20; c++)", "for (let c = 8; c <= 31; c++)")
dr("const all = Object.values(V).join(' ');", "for (const [n, t] of Object.entries(JSON.parse(fs.readFileSync('1ch.json', 'utf8'))['10'])) V[`대상 10:${n}`] = t;\nconst all = Object.values(V).join(' ');")
dr("/^(.*) \\((삼상 \\d+:\\d+)\\)$/", "/^(.*) \\(((?:삼상|대상) \\d+:\\d+)\\)$/")
dr("const m = v.ref.match(/사무엘상 (\\d+):(\\d+)/); if (V[`삼상 ${m[1]}:${m[2]}`] !== v.text)", "const m = v.ref.match(/(사무엘상|역대상) (\\d+):(\\d+)/); if (V[`${m[1] === '역대상' ? '대상' : '삼상'} ${m[2]}:${m[3]}`] !== v.text)")
open('dump7.mjs', 'w', encoding='utf-8', newline='\n').write(d)

# ② saul7_src.js
s = open('saul7_src.js', encoding='utf-8', newline='').read().replace('\r\n', '\n')
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:70])
    s = s.replace(a, b)
rep("· 3부 「소년 다윗」(8~11장, 삼상 16–20장).", "· 3부 「소년 다윗」(8~11장, 삼상 16–20장) · 4부 「쫓기는 다윗」(12~16장, 삼상 21–31장, 대상 10:13–14).")
rep("WOMEN = { n: '여인들' }, MICHAL = { n: '미갈' };", "WOMEN = { n: '여인들' }, MICHAL = { n: '미갈' },\n    AHIMELECH = { n: '아히멜렉' }, DAVIDMEN = { n: '다윗의 사람들' }, MESSENGER = { n: '전령' }, ABISHAI = { n: '아비새' }, ABNER = { n: '아브넬' }, NABAL = { n: '나발' }, NABALBOY = { n: '나발의 하인' }, ABIGAIL = { n: '아비가일' }, DAVIDMSG = { n: '다윗의 전령들' }, EGYPTIAN = { n: '애굽 소년' }, WICKED = { n: '악한 자와 불량배들' };")
rep("women: 'ca-singer-f', arrowBoy: 'ca-water-boy' };", "women: 'ca-singer-f', arrowBoy: 'ca-water-boy',\n    ahimelech: 'he-levite', abishai: 'he-boy-hb', abner: 'j5-midianite', nabal: 'he-father', abigail: 'r6-hannah', nabalboy: 'ca-water-boy', abiathar: 'he-levite', egyptian: 'ca-water-boy', jabesh: 'he-brickmaker' };")
rep("  // 단계 번호\n", """  const NOB = [18, 34];                                                                                       // 4부 기브아 쪽 — 놉(21:1)
  const ADULLAM = [-22, -12], HERETH = [-26, 18], KEILAH = [2, -26], ZIPH = [20, 20], MAON = [24, -22], ENGEDI = [-30, -34], HACHILAH = [-4, 30], FARPK = [-36, 36], CARMEL = [34, 30], PATH25 = [6, 6], WILD25 = [14, -6];   // 4부 유다 광야 — 아둘람 굴(22:1) · 헤렛 수풀(22:5) · 그일라(23:1) · 십 수풀(23:15) · 마온 바위(23:25) · 엔게디(24:1) · 하길라 산(26:3) · 건너편 산 꼭대기(26:13) · 갈멜(25:2) · 산 호젓한 곳(25:20)
  const GATH27 = [-28, 2], APHEK = [28, -22], ZIKLAG = [0, -12], BESOR = [-8, 16], EGYBOY = [8, 14], AMALEK30 = [-30, -22];   // 4부 블레셋 평지 — 가드 · 아벡(29:1) · 시글락(27:6) · 브솔 시내(30:9) · 들의 애굽 사람(30:11) · 아말렉 무리(30:16)
  const SPRING = [6, 22], VIEWG = [16, -18], WAYP = [-9, -9], GILB = [28, -38];                               // 4부 이스르엘 — 샘 곁 진영(29:1) · 길보아가 보이는 곳 · 지나온 길 · 길보아 산(31:1)
  // 단계 번호
""")
rep("  // 10장: 0 요나단 · 1 여인들의 노래 · 2 창 · 3 요나단의 말 · 4 미갈과 창 · 5 들에서 언약 · 6 초하루 식탁 · 7 화살 신호\n", """  // 10장: 0 요나단 · 1 여인들의 노래 · 2 창 · 3 요나단의 말 · 4 미갈과 창 · 5 들에서 언약 · 6 초하루 식탁 · 7 화살 신호
  // 11장: 0 놉 · 1 아둘람 굴 · 2 헤렛 수풀 · 3 그일라 · 4 십 수풀 · 5 마온 바위
  // 12장: 0 엔게디 굴 · 1 사울의 뒤에서 · 2 하길라 산 · 3 진영 · 4 건너편 산 꼭대기
  // 13장: 0 광야의 다윗 · 1 나발 · 2 예물 · 3 산 호젓한 곳 · 4 나발의 집
  // 14장: 0 가드 · 1 아벡 · 2 시글락 · 3 에봇 · 4 브솔 · 5 애굽 소년 · 6 아말렉 · 7 나눔
  // 15장: 0 샘 곁 진영 · 1 길보아 · 2 사울의 길 · 3 밤길
""")
rep("harpEased = false, golDown = false;", "harpEased = false, golDown = false, dust30 = false, gilboaShow = false;")
rep("slJon20: at(10, 5, 5), slTable: at(10, 6, 6), slEzel: at(10, 7, 7),\n", """slJon20: at(10, 5, 5), slTable: at(10, 6, 6), slEzel: at(10, 7, 7),
    slNob: at(11, 0, 0), slAdullam: at(11, 1, 1), slHereth: at(11, 2, 2), slKeilah: at(11, 3, 3), slZiph: at(11, 4, 4), slMaon: at(11, 5, 5),
    slCave: at(12, 0, 0), slSaul24: at(12, 1, 1), slHach: at(12, 2, 2), slAbishai: at(12, 3, 3), slCamp26: at(12, 2, 3), slFar: at(12, 4, 4),
    slDavid25: at(13, 0, 0), slNabal: at(13, 1, 1), slAbigail: at(13, 2, 2), slMeet: at(13, 3, 3), slHome: at(13, 4, 4),
    slGath: at(14, 0, 0), slAphek: at(14, 1, 1), slZiklag: at(14, 2, 2), slEphod: at(14, 3, 3), slBesor: at(14, 4, 4), slEgy: at(14, 5, 5), slEgy2: at(14, 6, 6), slAmal: at(14, 6, 6), slShare: at(14, 7, 7),
    slCamp28: at(15, 0, 0), slGilboa: at(15, 1, 1), slWay: at(15, 2, 2), slRun: at(15, 3, 3),
""")
rep("ZBe = ZONES.bethlehem.points, ZP = ZONES.philistia.points;", "ZBe = ZONES.bethlehem.points, ZP = ZONES.philistia.points, ZJ = ZONES.judah.points, ZI = ZONES.jezreel.points;")
rep("  L_(ZG, 'sl_ezel', EZEL, '에셀 바위 곁 — 숨은 곳', 'slEzel', 0, 2.6);\n", """  L_(ZG, 'sl_ezel', EZEL, '에셀 바위 곁 — 숨은 곳', 'slEzel', 0, 2.6);
  // 12장 놉 → 유다 광야
  V_(ZG, 'sl_ahimelech', NOB, '제사장 아히멜렉', M_.ahimelech, 'slNob', 1.6, 0);
  V_(ZG, 'sl_david21', NOB, '다윗', M_.david, 'slNob', -1.6, 0.8);
  L_(ZJ, 'sl_adullam', ADULLAM, '아둘람 굴', 'slAdullam', 0, 2.6);
  V_(ZJ, 'sl_david22', ADULLAM, '다윗', M_.david, 'slAdullam', 2.6, 1);
  L_(ZJ, 'sl_hereth', HERETH, '헤렛 수풀', 'slHereth');
  V_(ZJ, 'sl_abiathar22', HERETH, '아비아달', M_.abiathar, 'slHereth', 2.4, -1);
  L_(ZJ, 'sl_keilah', KEILAH, '그일라', 'slKeilah', 0, 5);
  V_(ZJ, 'sl_jon23', ZIPH, '요나단', M_.jonathan, 'slZiph', 1.6, 0.6);
  V_(ZJ, 'sl_david23', ZIPH, '다윗', M_.david, 'slZiph', -1.6, 0.6);
  L_(ZJ, 'sl_maon', MAON, '마온 황무지의 바위', 'slMaon', 0, 4);
  // 13장 엔게디 · 하길라
  L_(ZJ, 'sl_cave', ENGEDI, '들염소 바위 — 양의 우리 곁 굴', 'slCave', 0, 3);
  V_(ZJ, 'sl_saul24', ENGEDI, '자기 길을 가는 사울', M_.saul, 'slSaul24', 6, 5, { scale: TALL });
  V_(ZJ, 'sl_david24', ENGEDI, '다윗', M_.david, 'slSaul24', 1.4, 3.6);
  L_(ZJ, 'sl_hachilah', HACHILAH, '하길라 산 길 가', 'slHach', 8, -8);
  V_(ZJ, 'sl_abishai', HACHILAH, '아비새', M_.abishai, 'slAbishai', 7, -6);
  V_(ZJ, 'sl_david26', HACHILAH, '다윗', M_.david, 'slCamp26', 8.6, -7);
  L_(ZJ, 'sl_far26', FARPK, '건너편 산 꼭대기', 'slFar');
  V_(ZJ, 'sl_david26b', FARPK, '다윗', M_.david, 'slFar', 1.6, -1);
  // 14장 광야 · 갈멜
  V_(ZJ, 'sl_david25', WILD25, '광야의 다윗', M_.david, 'slDavid25');
  V_(ZJ, 'sl_nabal', CARMEL, '나발', M_.nabal, 'slNabal', -4, -3);
  V_(ZJ, 'sl_abigail', CARMEL, '아비가일', M_.abigail, 'slAbigail', -4, -3);
  V_(ZJ, 'sl_nboy', CARMEL, '나발의 하인', M_.nabalboy, 'slAbigail', -6, -1.6);
  V_(ZJ, 'sl_david_m', PATH25, '다윗', M_.david, 'slMeet');
  V_(ZJ, 'sl_abigail_m', PATH25, '아비가일', M_.abigail, 'slMeet', 2.4, 1.2);
  L_(ZJ, 'sl_home25', CARMEL, '갈멜 — 나발의 집', 'slHome', -4, -3);
  // 15장 블레셋 평지
  L_(ZP, 'sl_gath27', GATH27, '가드 왕 아기스의 땅', 'slGath', 0, 4);
  L_(ZP, 'sl_aphek', APHEK, '아벡 — 블레셋 군대가 모인 곳', 'slAphek', 0, 4);
  L_(ZP, 'sl_ziklag', ZIKLAG, '시글락 — 성읍이 불탔고', 'slZiklag', 0, 6);
  V_(ZP, 'sl_abiathar', ZIKLAG, '제사장 아비아달', M_.abiathar, 'slEphod', 3, 6);
  V_(ZP, 'sl_david30', ZIKLAG, '다윗', M_.david, 'slEphod', 0.6, 6.6);
  L_(ZP, 'sl_besor', BESOR, '브솔 시내', 'slBesor', 3, 0);
  V_(ZP, 'sl_egyptian', EGYBOY, '들의 애굽 사람', M_.egyptian, 'slEgy');
  V_(ZP, 'sl_egyptian2', AMALEK30, '앞서 인도하는 애굽 소년', M_.egyptian, 'slEgy2', 5, 5);
  L_(ZP, 'sl_amalek30', AMALEK30, '온 땅에 편만한 무리', 'slAmal', 3, 3);
  V_(ZP, 'sl_david_s', BESOR, '다윗', M_.david, 'slShare', 3, 0);
  V_(ZP, 'sl_two', BESOR, '브솔 시내의 이백 명', M_.people, 'slShare', -3, 2);
  // 16장 이스르엘 → 모압 평지
  L_(ZI, 'sl_camp28', SPRING, '이스르엘에 있는 샘 곁', 'slCamp28');
  L_(ZI, 'sl_gilboa', VIEWG, '길보아 산이 보이는 곳', 'slGilboa');
  L_(ZI, 'sl_way', WAYP, '사울이 지나온 길', 'slWay');
  V_(ZM, 'sl_jabesh_men', JABESH, '길르앗 야베스 주민', M_.jabesh, 'slRun', 1, 5);
""")
rep("  DLG.sl_sling_done.splice(afterRef(DLG.sl_sling_done, '17:49'), 0, { event: 'fall' });    // 17:49 — 쓰러짐은 멀리서\n", """  DLG.sl_sling_done.splice(afterRef(DLG.sl_sling_done, '17:49'), 0, { event: 'fall' });    // 17:49 — 쓰러짐은 멀리서
  DLG.sl_amalek30.splice(afterRef(DLG.sl_amalek30, '30:17'), 0, { event: 'dust30' });      // 30:17 — 싸움은 먼지만 멀리
  DLG.sl_gilboa31.splice(afterRef(DLG.sl_gilboa31, '31:6'), 0, { event: 'hush' });         // 31:6 — 잠시 정적(기획 10/30)
  DLG.sl_gilboa31.splice(afterRef(DLG.sl_gilboa31, '31:1'), 0, { event: 'gilboaFar' });    // 31:1 — 칼·몸 없이 원경만
""")
rep("arrow_beyond: { ico: '🏹', name: '화살 너머' } });", "arrow_beyond: { ico: '🏹', name: '화살 너머' }, spear_jug: { ico: '🤫', name: '창과 물병' }, bread_200: { ico: '🍞', name: '떡 이백 덩이' }, share_alike: { ico: '🤝', name: '같이 분배한 사람' } });")
rep("  // ── 연출 ──\n", r"""  // 🧭 아둘람 굴로(삼상 22:2) — 찾아오는 세 무리에게 막히지 않은 길을 알려 준다. 사람 수는 본문의 "사백 명 가량"만 쓴다
  function gatherGame(q){
    api.runDialog(DLG.sl_gather, () => {
      const GROUPS = [LINE['22:2a'], LINE['22:2b'], LINE['22:2c']], FORKS = 4; let g = 0, f = 0, open = Math.random() < 0.5 ? 0 : 1, msg = '';
      mgOpen('🧭 아둘람 굴로', `"${LINE['22:2a']}와 ${LINE['22:2b']}와 ${LINE['22:2c']}가 다 그에게로 모였고" (삼상 22:2)`);
      const draw = () => { const end = g >= GROUPS.length, k = (g * FORKS + f) / (GROUPS.length * FORKS);
        const bar = `<div style="margin:4px 14px;height:12px;border-radius:6px;background:rgba(255,255,255,.12);overflow:hidden"><div style="height:100%;width:${Math.round(k * 100)}%;background:#c0a060"></div></div>`;
        api.mgArea.innerHTML = end ? bar + doneBox(`✓ "${LINE['22:2d']}" (삼상 22:2)`)
          : bar + `<div style="text-align:center;font-weight:800;font-size:14px;padding:2px">🧑 ${GROUPS[g]} <span style="opacity:.6;font-size:12px">(갈림길 ${f + 1} / ${FORKS})</span></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:6px 12px">${[0, 1].map(i => `<button data-gf="${i === open ? 1 : 0}" style="${btnCss};font-size:15px;padding:10px">${i === 0 ? '⬅' : '➡'} ${i === open ? '🌿 길' : '🪨 바위'}</button>`).join('')}</div>` + msgBox(msg);
        api.mgAct.textContent = end ? '계속' : '모두 굴에 이르면 계속'; api.mgAct.disabled = !end; };
      draw();
      api.mgArea.onclick = e => { const b = e.target.closest('[data-gf]'); if (!b || g >= GROUPS.length) return;
        if (b.dataset.gf === '1'){ msg = ''; if (++f >= FORKS){ f = 0; g++; } open = Math.random() < 0.5 ? 0 : 1; } else msg = '그쪽은 바위로 막혔어요'; draw(); };
      api.mgAct.onclick = () => { if (g < GROUPS.length) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; };
    }, null, 'sl_gather');
  }
  // ⛰ 산 이쪽 산 저쪽(삼상 23:26) — 가운데 산을 사이에 두고 사울에게서 떨어져 돈다. 전령이 올 때(23:27)까지
  function maonGame(q){
    api.runDialog(DLG.sl_maon, () => {
      const RING = [0, 1, 2, 5, 8, 7, 6, 3], STEP = 1050, NEED = 16; let me = 4, sl = 0, n = 0, life = LIVES, msg = '', timer = null, finished = false;
      const dist = () => { const a = Math.abs(me - sl); return Math.min(a, 8 - a); };
      mgOpen('⛰ 마온 황무지', `"${LINE['23:26a']}" (삼상 23:26) — ⟲ ⟳로 산을 돌아 사울과 멀리 떨어져요.`);
      const draw = () => {
        if (finished){ api.mgArea.innerHTML = doneBox(`✓ "${LINE['23:28a']}" (삼상 23:28)`); api.mgAct.textContent = '계속'; api.mgAct.disabled = false; return; }
        const cells = Array(9).fill(''); cells[4] = '⛰'; cells[RING[sl]] = '👑'; cells[RING[me]] = cells[RING[me]] ? '❗' : '🧑';
        api.mgArea.innerHTML = `<div data-md="${dist()}" data-me="${me}" data-sl="${sl}" style="display:grid;grid-template-columns:repeat(3,44px);grid-auto-rows:32px;gap:3px;justify-content:center;padding:2px;font-size:21px;text-align:center;line-height:32px">${cells.map((c, i) => `<div style="border-radius:7px;background:${i === 4 ? 'transparent' : 'rgba(255,255,255,.07)'}">${c}</div>`).join('')}</div>`
          + `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:4px 14px"><button data-mv="-1" style="${btnCss};font-size:18px;padding:5px;touch-action:none">⟲</button><button data-mv="1" style="${btnCss};font-size:18px;padding:5px;touch-action:none">⟳</button></div>` + msgBox(msg || `${n} / ${NEED} · ${hearts(life)}`);
        api.mgAct.textContent = '전령이 올 때까지'; api.mgAct.disabled = true; };
      const stop = () => { if (timer){ clearInterval(timer); timer = null; } };
      timer = setInterval(() => { if (finished) return;
        const fw = (me - sl + 8) % 8; sl = (sl + (fw <= 4 ? 1 : 7)) % 8; msg = '';   // 사울은 가까운 쪽으로 따라온다
        if (dist() <= 1){ if (--life <= 0){ life = LIVES; n = 0; msg = OUT; } else msg = `너무 가까워요 ${hearts(life)}`; me = (sl + 4) % 8; }
        else if (++n >= NEED){ finished = true; stop(); }
        draw(); }, STEP);
      draw();
      const down = e => { const b = e.target.closest('[data-mv]'); if (!b || finished) return; e.preventDefault(); me = (me + +b.dataset.mv + 8) % 8; if (dist() === 0) me = (me - +b.dataset.mv + 8) % 8; draw(); };
      api.mgArea.addEventListener('pointerdown', down);
      const cleanup = () => { stop(); api.mgArea.removeEventListener('pointerdown', down); };
      api.mgAct.onclick = () => { if (!finished) return; cleanup(); mgCloseAll(); completeTask(q); };
      api.mg.onClose = cleanup;
    }, null, 'sl_maon');
  }
  // ✂ 겉옷 자락(삼상 24:4) — 누르는 동안 다가가고, 소리가 차면 뒤로 물러난다. 벨 수 있는 것은 겉옷 자락뿐이다
  function cloakGame(q){
    api.runDialog(DLG.sl_engedi, () => {
      let go = 0, noise = 0, holding = false, stage = 0, timer = null, msg = '';   // 0 다가가기 · 1 자락 베기 · 2 끝
      mgOpen('✂ 굴 깊은 곳에서', `"${LINE['24:4a']}" (삼상 24:4) — 누르는 동안 다가가요. 소리가 차기 전에 손을 떼어요.`);
      const bars = () => { const a = api.mgArea.querySelector('[data-cg]'), b = api.mgArea.querySelector('[data-cn]'), m = api.mgArea.querySelector('[data-cm]'); if (a) a.style.width = `${Math.round(go * 100)}%`; if (b){ b.style.width = `${Math.round(noise * 100)}%`; b.style.background = noise > 0.7 ? '#e0785a' : '#9ab4e0'; } if (m) m.textContent = msg; };
      const draw = () => {
        if (stage === 2){ api.mgArea.innerHTML = doneBox(`✓ "${LINE['24:4a']}" (삼상 24:4)`); api.mgAct.textContent = '계속'; api.mgAct.disabled = false; return; }
        if (stage === 1){ api.mgArea.innerHTML = `<div style="padding:12px 14px"><button data-cc="1" style="${btnCss};width:100%;font-size:16px;padding:14px">✂ ${LINE['24:4a']}</button></div>`; api.mgAct.textContent = '자락을 베면 계속'; api.mgAct.disabled = true; return; }
        api.mgArea.innerHTML = `<div style="padding:4px 14px;font-size:12px">🧑 사울에게로<div style="height:11px;border-radius:6px;background:rgba(255,255,255,.12);overflow:hidden;margin:2px 0 6px"><div data-cg="1" style="height:100%;width:0;background:#c0a060"></div></div>🔈 소리<div style="height:11px;border-radius:6px;background:rgba(255,255,255,.12);overflow:hidden;margin-top:2px"><div data-cn="1" style="height:100%;width:0;background:#9ab4e0"></div></div></div><div style="padding:6px 14px"><button data-ch="1" style="${btnCss};width:100%;font-size:16px;padding:13px;touch-action:none">🤫 누르는 동안 가만히</button></div><div data-cm="1" style="text-align:center;color:#ffd27a;font-weight:800;min-height:22px;font-size:12.5px"></div>`;
        api.mgAct.textContent = '다가가면 계속'; api.mgAct.disabled = true; bars(); };
      const stop = () => { if (timer){ clearInterval(timer); timer = null; } };
      timer = setInterval(() => { if (stage !== 0) return;
        if (holding){ go += 0.018; noise += 0.042; if (noise >= 1){ noise = 0; holding = false; go = Math.max(0, go - 0.2); msg = '소리가 커졌어요 — 조금 물러나요'; } else if (go >= 1){ stage = 1; holding = false; stop(); draw(); return; } }
        else { noise = Math.max(0, noise - 0.05); if (noise === 0) msg = ''; }
        bars(); }, 80);
      draw();
      const down = e => { if (e.target.closest('[data-ch]')){ e.preventDefault(); holding = true; } };
      const up = () => { holding = false; };
      api.mgArea.addEventListener('pointerdown', down); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
      api.mgArea.onclick = e => { if (stage === 1 && e.target.closest('[data-cc]')){ stage = 2; flash('#d8c4a0', 0.3); draw(); } };
      const cleanup = () => { stop(); api.mgArea.onclick = null; api.mgArea.removeEventListener('pointerdown', down); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); };
      api.mgAct.onclick = () => { if (stage !== 2) return; cleanup(); mgCloseAll(); completeTask(q); };
      api.mg.onClose = cleanup;
    }, null, 'sl_engedi');
  }
  // 🤫 잠든 진영(삼상 26:7-12) — 잠든 사람 곁으로 돌아 사울의 머리 곁에 이르러 창과 물병만 가지고 돌아온다. 깨우는 일은 없고(26:12), 치는 버튼도 없다. 사람을 한 번도 건드리지 않으면 배지
  function sneakGame(q){
    api.runDialog(DLG.sl_camp26, () => {
      const MAP = ['.z..z.z', '.z.z.Sz', '...z.z.', 'Pz.....']; const R = MAP.length, C = MAP[0].length, HOME = [3, 0], KING = [1, 5];
      let pos = [...HOME], stage = 0, took = new Set(), msg = '', perfect = true;   // 0 들어가기 · 1 아비새의 말 · 2 창과 물병 · 3 돌아오기 · 4 끝
      mgOpen('🤫 밤의 진영', `"${LINE['26:12b']}" (삼상 26:12) — 옆 칸을 눌러 한 칸씩 움직여요.`);
      const draw = () => {
        if (stage === 4){ api.mgArea.innerHTML = doneBox(`✓ "${LINE['26:12a']}" (삼상 26:12)`); api.mgAct.textContent = '계속'; api.mgAct.disabled = false; return; }
        if (stage === 1){ api.mgArea.innerHTML = `<div style="text-align:center;font-size:13.5px;line-height:1.6;padding:8px 14px"><b>아비새:</b> "${LINE['26:8a']}" (삼상 26:8)</div><div style="padding:6px 14px"><button data-kn="1" style="${btnCss};width:100%;font-size:16px;padding:13px">🤚 "${LINE['26:9a']}" (삼상 26:9)</button></div>`; api.mgAct.textContent = '창과 물병만 가지고 나오면 계속'; api.mgAct.disabled = true; return; }
        if (stage === 2){ api.mgArea.innerHTML = `<div style="text-align:center;font-size:13.5px;padding:8px 14px">"${LINE['26:11a']}" (삼상 26:11)</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:6px 14px">${[['🔱', '창'], ['🏺', '물병']].map((t, i) => `<button data-tk="${i}" style="${btnCss};font-size:15px;padding:12px;${took.has(i) ? 'opacity:.35' : ''}">${t[0]} ${t[1]}</button>`).join('')}</div>`; api.mgAct.textContent = '창과 물병만 가지고 나오면 계속'; api.mgAct.disabled = true; return; }
        let cells = ''; for (let r = 0; r < R; r++) for (let c = 0; c < C; c++){ const ch = MAP[r][c], me = pos[0] === r && pos[1] === c, adj = Math.abs(pos[0] - r) + Math.abs(pos[1] - c) === 1;
          const icon = me ? '🧑' : ch === 'z' ? '💤' : ch === 'S' ? (stage === 3 ? '💤' : '👑') : ch === 'P' ? '🌘' : ''; cells += `<button data-sk="${r},${c}" style="padding:0;height:37px;border-radius:7px;font-size:19px;color:#fff;border:1px solid ${adj ? 'rgba(255,210,122,.7)' : 'rgba(255,255,255,.12)'};background:${adj ? 'rgba(255,210,122,.14)' : 'rgba(255,255,255,.05)'}">${icon}</button>`; }
        api.mgArea.innerHTML = `<div style="display:grid;grid-template-columns:repeat(${C},1fr);gap:3px;padding:3px 10px">${cells}</div>` + msgBox(msg || (stage === 0 ? '👑 사울의 머리 곁까지' : '🌘 처음 자리로 돌아가요'));
        api.mgAct.textContent = '창과 물병만 가지고 나오면 계속'; api.mgAct.disabled = true; };
      draw();
      api.mgArea.onclick = e => {
        if (stage === 1 && e.target.closest('[data-kn]')){ stage = 2; draw(); return; }
        const t = e.target.closest('[data-tk]'); if (stage === 2 && t){ took.add(+t.dataset.tk); if (took.size >= 2){ stage = 3; msg = ''; } draw(); return; }
        const b = e.target.closest('[data-sk]'); if (!b || (stage !== 0 && stage !== 3)) return; const [r, c] = b.dataset.sk.split(',').map(Number); if (Math.abs(pos[0] - r) + Math.abs(pos[1] - c) !== 1) return;
        const ch = MAP[r][c]; if (ch === 'z' || (ch === 'S' && stage === 3)){ perfect = false; msg = '잠든 사람이에요 — 곁으로 돌아가요'; draw(); return; }
        pos = [r, c]; msg = ''; if (stage === 0 && r === KING[0] && c === KING[1]) stage = 1; else if (stage === 3 && r === HOME[0] && c === HOME[1]) stage = 4; draw(); };
      api.mgAct.onclick = () => { if (stage !== 4) return; api.mgArea.onclick = null; mgCloseAll(); if (perfect) giveBadge('spear_jug'); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; };
    }, null, 'sl_camp26');
  }
  // 🍞 예물 싣기(삼상 25:18) — 방금 읽은 수대로 나귀에 싣는다. 무실수면 배지
  function giftsGame(q){
    api.runDialog(DLG.sl_gifts, () => {
      const GIFTS = [['🍞', '떡', ['이백 덩이', '백 덩이', '다섯 덩이']], ['🍶', '포도주', ['두 가죽 부대', '다섯 가죽 부대', '열 가죽 부대']], ['🐑', '잡아서 요리한 양', ['다섯 마리', '두 마리', '백 마리']], ['🌾', '볶은 곡식', ['다섯 스아', '두 스아', '이백 스아']], ['🍇', '건포도', ['백 송이', '두 송이', '이백 송이']], ['🟤', '무화과 뭉치', ['이백 개', '백 개', '다섯 개']]];
      let i = 0, life = LIVES, msg = '', perfect = true, opts = [];
      const roll = () => { opts = i < GIFTS.length ? shuffle(GIFTS[i][2].map((t, k) => [t, k])) : []; };
      mgOpen('🍞 아비가일이 급히', '나귀에 실을 것을 본문에 나온 수대로 골라요. (삼상 25:18)');
      const draw = () => { const end = i >= GIFTS.length;
        const load = GIFTS.slice(0, i).map(g => `${g[0]} ${g[1]} ${g[2][0]}`).join(' · ');
        api.mgArea.innerHTML = `<div style="padding:2px 12px;font-size:12px;min-height:18px;line-height:1.5;opacity:.85">🫏 ${load || '아직 비어 있어요'}</div>` + (end ? doneBox('✓ 나귀들에게 다 실었어요 (삼상 25:18)')
          : `<div style="text-align:center;font-weight:800;font-size:15px;padding:3px">${GIFTS[i][0]} ${GIFTS[i][1]}</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:4px 12px">${opts.map(o => `<button data-gift="${o[1]}" style="${btnCss};padding:11px 3px">${o[0]}</button>`).join('')}</div>` + msgBox(msg || hearts(life)));
        api.mgAct.textContent = end ? '계속' : '다 실으면 계속'; api.mgAct.disabled = !end; };
      roll(); draw();
      api.mgArea.onclick = e => { const b = e.target.closest('[data-gift]'); if (!b || i >= GIFTS.length) return;
        if (b.dataset.gift === '0'){ i++; msg = ''; } else { perfect = false; if (--life <= 0){ life = LIVES; i = 0; msg = OUT; } else msg = `본문의 수와 달라요 ${hearts(life)}`; }
        roll(); draw(); };
      api.mgAct.onclick = () => { if (i < GIFTS.length) return; api.mgArea.onclick = null; mgCloseAll(); if (perfect) giveBadge('bread_200'); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; };
    }, null, 'sl_gifts');
  }
  // 🍞 들의 애굽 사람(삼상 30:11-12) — 떡·물·무화과 덩이·건포도를 건네면 정신을 차린다
  function feedGame(q){
    api.runDialog(DLG.sl_feed, () => {
      const ITEMS = [['🍞', LINE['30:11a']], ['💧', LINE['30:11b']], ['🟤', LINE['30:12a']], ['🍇', LINE['30:12b']]], got = new Set();
      mgOpen('🍞 들에서 만난 애굽 사람', '하나씩 건네요. (삼상 30:11-12)');
      const draw = () => { const end = got.size >= ITEMS.length;
        api.mgArea.innerHTML = end ? doneBox(`✓ "${LINE['30:12c']}" (삼상 30:12)`)
          : `<div style="text-align:center;font-size:34px;line-height:1.2;opacity:${0.45 + got.size * 0.14}">🧑</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:6px 12px">${ITEMS.map((t, i) => `<button data-fd="${i}" style="${btnCss};padding:10px 4px;${got.has(i) ? 'opacity:.35' : ''}">${t[0]} ${t[1]}</button>`).join('')}</div>`;
        api.mgAct.textContent = end ? '계속' : '모두 건네면 계속'; api.mgAct.disabled = !end; };
      draw();
      api.mgArea.onclick = e => { const b = e.target.closest('[data-fd]'); if (!b) return; got.add(+b.dataset.fd); draw(); };
      api.mgAct.onclick = () => { if (got.size < ITEMS.length) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; };
    }, null, 'sl_feed');
  }
  // 🤝 같이 분배(삼상 30:24) — 무리 전체가 아니라 사람마다의 "분깃"이 같아지도록 옮긴다. 처음에는 불량배들의 말(30:22)대로 한쪽에만 있다. 한 번에 맞히면 배지
  function shareGame(q){
    api.runDialog(DLG.sl_share, () => {
      const KINDS = [['🐑', 6], ['🐄', 4], ['🎁', 8]]; let right = KINDS.map(() => 0), msg = '', perfect = true, finished = false;
      mgOpen('🤝 같이 분배할 것이니라', `"${LINE['30:24c']}" (삼상 30:24) — 물건을 눌러 옮겨요.`);
      const col = (side, label) => `<div style="flex:1;padding:4px 5px;background:rgba(255,255,255,.06);border-radius:9px"><div style="font-size:11.5px;text-align:center;font-weight:800;min-height:30px;line-height:1.25">${label}의 분깃</div>${KINDS.map((k, i) => { const n = side ? right[i] : k[1] - right[i]; return `<div style="min-height:27px;line-height:1">${[...Array(n)].map(() => `<button data-mv2="${side},${i}" style="background:none;border:none;font-size:18px;padding:1px;line-height:1.2">${k[0]}</button>`).join('')}</div>`; }).join('')}</div>`;
      const draw = () => {
        api.mgArea.innerHTML = finished ? doneBox(`✓ "${LINE['30:24d']}" (삼상 30:24)`)
          : `<div style="display:flex;gap:6px;padding:2px 10px">${col(0, LINE['30:24a'])}${col(1, LINE['30:24b'])}</div><div style="padding:5px 14px"><button data-eq="1" style="${btnCss};width:100%;font-size:14px;padding:8px">⚖ 같은지 보기</button></div>` + (msg ? msgBox(msg) : '');
        api.mgAct.textContent = finished ? '계속' : '분깃이 같으면 계속'; api.mgAct.disabled = !finished; };
      draw();
      api.mgArea.onclick = e => { if (finished) return; const m = e.target.closest('[data-mv2]');
        if (m){ const [sd, i] = m.dataset.mv2.split(',').map(Number); right[i] += sd ? -1 : 1; msg = ''; draw(); return; }
        if (e.target.closest('[data-eq]')){ if (KINDS.every((k, i) => right[i] * 2 === k[1])) finished = true; else { perfect = false; msg = `한쪽이 많아요 — "${LINE['30:24c']}"`; } draw(); } };
      api.mgAct.onclick = () => { if (!finished) return; api.mgArea.onclick = null; mgCloseAll(); if (perfect) giveBadge('share_alike'); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; };
    }, null, 'sl_share');
  }
  // 📜 사울의 길(기획 16장, 전도사님 결정 10/30) — 원문 카드만 차례로 놓고, 맞은편에 다윗의 카드를 나란히 보인다. 새 교훈 문장은 만들지 않는다
  function wayGame(q){
    api.runDialog(DLG.sl_way, () => {
      const WAY = [[LINE.w1, '삼상 13:13'], [LINE.w2, '삼상 15:23'], [LINE.w3, '삼상 16:14'], [LINE.w4, '삼상 28:6'], [LINE.w5, '대상 10:13-14']];
      const dv = [[LINE.d1, '삼상 17:47'], [LINE.d2, '삼상 24:6'], [LINE.d3, '삼상 30:6']].map(c => `"${c[0]}" <span style="opacity:.6">(${c[1]})</span>`).join('<br>');
      orderPlay(q, '📜 사울의 길', '7편에서 지나온 말씀을 차례대로 놓아요.', WAY, '지나온 차례를 떠올려 봐요', `<div style="font-weight:400;color:#f5e9d0;text-align:left;line-height:1.5;font-size:12px"><b style="color:#ffd27a">다윗</b><br>${dv}</div>`);
    }, null, 'sl_way');
  }
  // 🌙 밤길(삼상 31:11-13) — 야베스에서 요단 건너 벧산까지, 왼발 오른발을 번갈아 눌러 달리고 돌아온다. 싸움 없음
  function runGame(q){
    api.runDialog(DLG.sl_run, () => {
      const LEG = 22; let n = 0, last = -1, stage = 0, msg = '';   // 0 벧산으로 · 1 벧산 성벽 · 2 야베스로 · 3 끝
      mgOpen('🌙 밤새도록 달려가서', `"${LINE['31:12a']}" (삼상 31:12)`);
      const draw = () => {
        if (stage === 3){ api.mgArea.innerHTML = doneBox(`✓ "${LINE['31:12c']}" (삼상 31:12)`); api.mgAct.textContent = '계속'; api.mgAct.disabled = false; return; }
        if (stage === 1){ api.mgArea.innerHTML = `<div style="padding:12px 14px;background:#141a30;border-radius:10px;margin:2px 10px"><button data-wall="1" style="${btnCss};width:100%;font-size:14px;padding:13px;line-height:1.4">🧱 "${LINE['31:12b']}"</button></div>`; api.mgAct.textContent = '야베스에 돌아가면 계속'; api.mgAct.disabled = true; return; }
        const pct = stage === 0 ? 8 + n / LEG * 80 : 88 - n / LEG * 80;
        api.mgArea.innerHTML = `<div style="position:relative;height:62px;margin:2px 10px 6px;border-radius:10px;background:#141a30;overflow:hidden"><span style="position:absolute;left:12%;top:5px;font-size:10px;opacity:.7">✦</span><span style="position:absolute;left:44%;top:9px;font-size:9px;opacity:.6">✦</span><span style="position:absolute;left:70%;top:4px;font-size:11px;opacity:.7">✦</span><span style="position:absolute;left:3%;bottom:6px;font-size:20px">🏘</span><div style="position:absolute;left:47%;bottom:0;top:30px;width:6%;background:rgba(90,150,220,.55)"></div><span style="position:absolute;right:3%;bottom:6px;font-size:20px">🧱</span><span data-rn="1" style="position:absolute;left:${pct}%;bottom:7px;font-size:22px;transform:translateX(-50%)">🏃</span></div>`
          + `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:2px 12px"><button data-ft="0" style="${btnCss};font-size:15px;padding:13px;touch-action:none;${last === 0 ? 'opacity:.45' : ''}">🦶 왼발</button><button data-ft="1" style="${btnCss};font-size:15px;padding:13px;touch-action:none;${last === 1 ? 'opacity:.45' : ''}">오른발 🦶</button></div>` + msgBox(msg || (stage === 0 ? '요단을 건너 벧산으로' : '요단을 건너 야베스로'));
        api.mgAct.textContent = '야베스에 돌아가면 계속'; api.mgAct.disabled = true; };
      draw();
      const down = e => { const b = e.target.closest('[data-ft]'); if (!b || (stage !== 0 && stage !== 2)) return; e.preventDefault(); const f = +b.dataset.ft; if (f === last) return; last = f; if (++n >= LEG){ n = 0; last = -1; stage = stage === 0 ? 1 : 3; } draw(); };
      api.mgArea.addEventListener('pointerdown', down);
      api.mgArea.onclick = e => { if (stage === 1 && e.target.closest('[data-wall]')){ stage = 2; draw(); } };
      const cleanup = () => { api.mgArea.onclick = null; api.mgArea.removeEventListener('pointerdown', down); };
      api.mgAct.onclick = () => { if (stage !== 3) return; cleanup(); mgCloseAll(); completeTask(q); };
      api.mg.onClose = cleanup;
    }, null, 'sl_run');
  }

  // ── 연출 ──
""")
rep("  function thunder(){ rainShow = true;", """  function dustFn30(){ dust30 = true; refresh('philistia'); try { api.startCine('slAmalek', AMALEK30[0], api.heightAt(AMALEK30[0], AMALEK30[1]) + 3, AMALEK30[1], { r: 28, h: 13, dur: 3.5, spin: 0.25 }); } catch (e){} }
  function gilboaFar(){ gilboaShow = true; refresh('jezreel'); try { api.startCine('slGilboa', GILB[0], api.heightAt(GILB[0], GILB[1]) + 6, GILB[1], { r: 40, h: 16, dur: 5, spin: 0.15 }); } catch (e){} }
  function hush(){ flash('#141018', 0.8); try { api.startCine('slHush', GILB[0], api.heightAt(GILB[0], GILB[1]) + 6, GILB[1], { r: 44, h: 14, dur: 4, spin: 0.08 }); } catch (e){} }
  function thunder(){ rainShow = true;""")
rep("    if (zid === 'gibeon' && p.ch === 1 && p.step >= 9){\n", """    if (zid === 'gibeah' && p.ch === 11 && p.step === 0){   // 놉(21:1) — 제사장들의 성읍(22:19)
      house(NOB[0] - 1, NOB[1] - 4, 4.4, 3.4, 0xdcc8a2); house(NOB[0] + 5, NOB[1] - 2, 3.2, 2.8, 0xd8c4a0); put(new THREE.BoxGeometry(1.2, 0.9, 0.7), M(0xc8b28c), NOB[0] + 0.4, 0.45, NOB[1] - 1.6);   // 떡 놓는 상
    }
    if (zid === 'judah'){
      needProps(['env-rock-hill', 'env-acacia', 'tent-small', 'tent-mid', 'lamb', 'jars', 'crates-sacks'], 'judah');
      const cave = (x, z) => { prop('env-rock-hill', x, z - 4, 0.5); obst(x, z - 4, 3.6); put(new THREE.BoxGeometry(2.6, 2.1, 0.5), M(0x2a2420), x, 1.05, z - 1.4); put(new THREE.BoxGeometry(3.4, 0.6, 0.8), M(0x8a7c64), x, 2.3, z - 1.3); };
      cave(ADULLAM[0], ADULLAM[1]);                                                                              // 아둘람 굴(22:1)
      [[-3, -3], [3, -2], [-1, 3.4], [5, 2.4]].forEach(([dx, dz], i) => prop('env-acacia', HERETH[0] + dx, HERETH[1] + dz, i * 1.3));   // 헤렛 수풀(22:5)
      [[-4, -2], [4, -3], [-3.4, 3.4], [3.6, 3.2]].forEach(([dx, dz], i) => prop('env-acacia', ZIPH[0] + dx, ZIPH[1] + dz, i * 0.9));    // 십 수풀(23:15)
      [[-5, -3], [0, -5], [5, -3], [-3, 1]].forEach(([dx, dz]) => house(KEILAH[0] + dx, KEILAH[1] + dz, 3.4, 3, 0xdcc8a2));              // 그일라 — 문과 문 빗장이 있는 성읍(23:7)
      prop('env-rock-hill', MAON[0] - 2, MAON[1] - 2, 1.6); obst(MAON[0] - 2, MAON[1] - 2, 3.4);                 // 마온 황무지의 바위(23:25)
      cave(ENGEDI[0], ENGEDI[1]); [[-3, 3], [-4.6, 1], [3, 2.4], [4.4, 0.4]].forEach(([dx, dz], i) => prop('lamb', ENGEDI[0] + dx, ENGEDI[1] + dz, i));   // 길 가 양의 우리 곁 굴(24:3)
      if (p.ch === 12){   // 하길라 산 길 가의 진영(26:3-7)
        [[-6, -3], [6, -3], [-6, 5], [6, 5], [0, -6]].forEach(([dx, dz], i) => prop(i % 2 ? 'tent-small' : 'tent-mid', HACHILAH[0] + dx, HACHILAH[1] + dz, i * 1.2));
        if (p.step <= 3){ const sp = put(new THREE.CylinderGeometry(0.05, 0.05, 2.4, 6), M(0x7a6448), HACHILAH[0], 1.2, HACHILAH[1]); sp.rotation.z = 0.08; prop('jars', HACHILAH[0] + 0.7, HACHILAH[1] + 0.5, 0.3); }   // 머리 곁 땅에 꽂힌 창과 물병(26:7)
        prop('env-rock-hill', FARPK[0] - 3, FARPK[1] + 3, 0.8);
      }
      if (p.ch === 13){   // 갈멜 — 양 삼천 마리(25:2)
        house(CARMEL[0], CARMEL[1] - 3, 5, 4, 0xd6c098); house(CARMEL[0] + 6, CARMEL[1] - 1, 3.4, 3, 0xdcc8a2);
        [[-7, 4], [-4, 6], [-1, 4.6], [2, 6.4], [5, 5], [8, 6], [-5, 2.6], [3, 2.6]].forEach(([dx, dz], i) => prop('lamb', CARMEL[0] + dx, CARMEL[1] + dz, i * 0.8));
        if (p.step >= 2) prop('crates-sacks', CARMEL[0] - 7, CARMEL[1] - 3, 0.5);
      }
    }
    if (zid === 'philistia' && p.ch === 14){
      needProps(['tent-small', 'tent-mid'], 'philistia');
      [[-4, -3], [3, -5], [5, 1]].forEach(([dx, dz]) => house(GATH27[0] + dx, GATH27[1] + dz, 3.6, 3, 0xdcc8a2));   // 가드
      [[-4, -3], [3, -4], [5, 3], [-5, 3]].forEach(([dx, dz], i) => prop(i % 2 ? 'tent-small' : 'tent-mid', APHEK[0] + dx, APHEK[1] + dz, i * 1.1));   // 아벡의 블레셋 군대(29:1)
      [[-5, -3], [0, -6], [5, -3], [-5, 3], [5, 2]].forEach(([dx, dz]) => house(ZIKLAG[0] + dx, ZIKLAG[1] + dz, 3.2, 2.8, p.step <= 1 ? 0xdcc8a2 : 0x5a5048));   // 시글락(27:6)
      if (p.step >= 2) sprites(ZIKLAG[0], ZIKLAG[1] - 2, 9, 0x4a4440, 0.42, 3.6, 3.2, 2.6, 12);                 // 성읍이 불탔고(30:3)
      { const w = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 22).rotateX(-Math.PI / 2), M(0x6fa8d0)); w.position.set(BESOR[0], api.heightAt(BESOR[0], BESOR[1]) + 0.05, BESOR[1]); g.add(w); }   // 브솔 시내(30:9)
      if (p.step === 6) for (let i = 1; i < 12; i++){ const t = i / 12, x = EGYBOY[0] + (AMALEK30[0] - EGYBOY[0]) * t, z = EGYBOY[1] + (AMALEK30[1] - EGYBOY[1]) * t; put(new THREE.CylinderGeometry(0.28, 0.28, 0.04, 8), M(0x8a7654), x + (i % 2 ? 0.4 : -0.4), 0.03, z); }   // 그가 다윗을 인도하여(30:16)
      if (!dust30 && p.step <= 6) [[0, 0], [5, -3], [-3, 4], [4, 4]].forEach(([dx, dz], i) => prop(i % 2 ? 'tent-small' : 'tent-mid', AMALEK30[0] + dx, AMALEK30[1] + dz, i * 1.4));
      if (dust30) sprites(AMALEK30[0], AMALEK30[1], 8, 0xb8a890, 0.42, 4, 3, 2, 10);                            // 30:17 — 싸움은 먼지만 멀리
    }
    if (zid === 'jezreel' && p.ch === 15){
      needProps(['tent-small', 'tent-mid'], 'jezreel');
      [[-4, -3], [4, -3], [-4, 3], [5, 3]].forEach(([dx, dz], i) => prop(i % 2 ? 'tent-small' : 'tent-mid', SPRING[0] + dx, SPRING[1] + dz, i * 1.3));   // 샘 곁에 진 쳤더라(29:1)
      { const w = new THREE.Mesh(new THREE.CircleGeometry(1.6, 16).rotateX(-Math.PI / 2), M(0x6fa8d0)); w.position.set(SPRING[0], api.heightAt(SPRING[0], SPRING[1]) + 0.05, SPRING[1] - 1); g.add(w); }
      sprites(GILB[0], GILB[1] + 8, 3, 0xff9a5a, 0.3, 12, 7, 12, 14);                                            // 해가 지는 산 위(기획)
      if (gilboaShow || p.step >= 2){   // 31:1-6 원경 — 먼지, 쓰러진 깃발과 창까지만
        sprites(GILB[0] - 6, GILB[1] + 12, 10, 0xb8a890, 0.42, 5, 3.4, 2.4, 16);
        [[-8, 10, 1.2], [-3, 15, 1.35], [3, 12, 1.05]].forEach(([dx, dz, rz]) => { const m = put(new THREE.CylinderGeometry(0.05, 0.05, 3, 6), M(0x7a6448), GILB[0] + dx, 0.3, GILB[1] + dz); m.rotation.z = rz; });
        { const fl = put(new THREE.BoxGeometry(1.4, 0.05, 1), M(0x8a2a2a), GILB[0] - 3.4, 0.1, GILB[1] + 15); fl.rotation.y = 0.5; }
      }
    }
    if (zid === 'gibeon' && p.ch === 1 && p.step >= 9){
""")
rep("    if (zid === 'moab' && p.ch === 2){\n      needProps(['tent-cluster', 'tent-mid'], 'moab');", "    if (zid === 'moab' && (p.ch === 2 || p.ch === 15)){\n      needProps(['tent-cluster', 'tent-mid', 'env-acacia'], 'moab');\n      if (p.ch === 15) prop('env-acacia', JABESH[0] + 9, JABESH[1] + 3, 0.5);   // 야베스 에셀 나무(31:13)")
rep("      if (p.step <= 2 && !dustShow){ prop('tent-cluster', AMMON[0] + 4,", "      if (p.ch === 2 && p.step <= 2 && !dustShow){ prop('tent-cluster', AMMON[0] + 4,")
rep("      if (dustShow) sprites(AMMON[0], AMMON[1] - 6,", "      if (p.ch === 2 && dustShow) sprites(AMMON[0], AMMON[1] - 6,")
rep("clearTitle: '🎉 7편 3부 「소년 다윗」을 마쳤어요! 4부는 준비하고 있어요', next: '12장: 놉의 떡과 아둘람 굴 (준비 중)',", "clearTitle: '🎉 7편 3부 「소년 다윗」을 마쳤어요!', next: '12장: 놉의 떡과 아둘람 굴',")
rep("""game: 'arrow', doneDlg: 'sl_arrow_done', reward: { verse: ['1sa18-3', '1sa20-42'], clear: true } },
        ] },
""", """game: 'arrow', doneDlg: 'sl_arrow_done', reward: { verse: ['1sa18-3', '1sa20-42'], clear: true } },
        ] },
      { title: `${T(12)} — 놉의 떡과 아둘람 굴`, clearTitle: '🎉 7편 12장 「놉의 떡과 아둘람 굴」 완료!', next: '13장: 기름 부음 받은 자를 치지 않음',
        steps: [
          { id: 's12s1', zone: 'gibeah', obj: '거룩한 떡은 있나니', where: '기브아 남동쪽 놉의 제사장 아히멜렉', npc: 'sl_ahimelech', dlg: 'sl_nob' },
          { id: 's12s2', zone: 'judah', obj: '다 그에게로 모였고', where: '유다 광야 서쪽의 아둘람 굴(빛나는 곳)', point: 'sl_adullam', game: 'gather', doneDlg: 'sl_gather_done' },
          { id: 's12s3', zone: 'judah', obj: '다윗이 떠나 헤렛 수풀에 이르니라', where: '유다 광야 남서쪽 헤렛 수풀(빛나는 곳)', point: 'sl_hereth', dlg: 'sl_hereth' },
          { id: 's12s4', zone: 'judah', obj: '그일라를 구원하라', where: '유다 광야 북쪽의 그일라(빛나는 곳)', point: 'sl_keilah', dlg: 'sl_keilah' },
          { id: 's12s5', zone: 'judah', obj: '하나님을 힘 있게 의지하게 하였는데', where: '십 수풀의 요나단', npc: 'sl_jon23', dlg: 'sl_ziph' },
          { id: 's12s6', zone: 'judah', obj: '산 이쪽으로, 산 저쪽으로', where: '유다 광야 북동쪽 마온의 바위(빛나는 곳)', point: 'sl_maon', game: 'maon', doneDlg: 'sl_maon_done', reward: { verse: ['1sa22-2', '1sa23-16'], clear: true } },
        ] },
      { title: `${T(13)} — 기름 부음 받은 자를 치지 않음`, clearTitle: '🎉 7편 13장 「기름 부음 받은 자를 치지 않음」 완료!', next: '14장: 아비가일',
        steps: [
          { id: 's13s1', zone: 'judah', obj: '겉옷 자락을 가만히 베니라', where: '유다 광야 북서쪽 들염소 바위의 굴(빛나는 곳)', point: 'sl_cave', game: 'cloak', doneDlg: 'sl_cloak_done' },
          { id: 's13s2', zone: 'judah', obj: '"내 주 왕이여"', where: '굴 밖의 사울', npc: 'sl_saul24', dlg: 'sl_saul24' },
          { id: 's13s3', zone: 'judah', obj: '누가 나와 더불어 진영에 내려가겠느냐', where: '유다 광야 남쪽 하길라 산 길 가(빛나는 곳)', point: 'sl_hachilah', dlg: 'sl_hachilah' },
          { id: 's13s4', zone: 'judah', obj: '창과 물병만 가지고 가자', where: '진영 가장자리의 아비새', npc: 'sl_abishai', game: 'sneak', doneDlg: 'sl_sneak_done' },
          { id: 's13s5', zone: 'judah', obj: '멀리 산 꼭대기에 서니', where: '남서쪽 끝 건너편 산 꼭대기(빛나는 곳)', point: 'sl_far26', dlg: 'sl_far26', reward: { verse: ['1sa24-6', '1sa26-23'], clear: true } },
        ] },
      { title: `${T(14)} — 아비가일`, clearTitle: '🎉 7편 14장 「아비가일」 완료!', next: '15장: 시글락을 되찾음',
        steps: [
          { id: 's14s1', zone: 'judah', obj: '내 이름으로 그에게 문안하고', where: '광야 가운데의 다윗', npc: 'sl_david25', dlg: 'sl_david25' },
          { id: 's14s2', zone: 'judah', obj: '다윗은 누구며 이새의 아들은 누구냐', where: '유다 광야 남동쪽 갈멜의 나발', npc: 'sl_nabal', dlg: 'sl_nabal' },
          { id: 's14s3', zone: 'judah', obj: '아비가일이 급히', where: '갈멜의 아비가일', npc: 'sl_abigail', game: 'gifts', doneDlg: 'sl_gifts_done' },
          { id: 's14s4', zone: 'judah', obj: '산 호젓한 곳을 따라 내려가더니', where: '광야 가운데 산길의 다윗', npc: 'sl_david_m', dlg: 'sl_meet25' },
          { id: 's14s5', zone: 'judah', obj: '여호와를 찬송할지로다', where: '갈멜 나발의 집(빛나는 곳)', point: 'sl_home25', dlg: 'sl_home25', reward: { verse: '1sa25-32', clear: true } },
        ] },
      { title: `${T(15)} — 시글락을 되찾음`, clearTitle: '🎉 7편 15장 「시글락을 되찾음」 완료!', next: '16장: 길보아 산, 그리고 야베스',
        steps: [
          { id: 's15s1', zone: 'philistia', obj: '블레셋 사람들의 땅으로 피하여', where: '블레셋 평지 서쪽의 가드(빛나는 곳)', point: 'sl_gath27', dlg: 'sl_gath27' },
          { id: 's15s2', zone: 'philistia', obj: '아벡에 모았고', where: '블레셋 평지 북동쪽 아벡(빛나는 곳)', point: 'sl_aphek', dlg: 'sl_aphek' },
          { id: 's15s3', zone: 'philistia', obj: '여호와를 힘입고 용기를 얻었더라', where: '블레셋 평지 가운데 시글락(빛나는 곳)', point: 'sl_ziklag', dlg: 'sl_ziklag' },
          { id: 's15s4', zone: 'philistia', obj: '에봇을 내게로 가져오라', where: '시글락의 제사장 아비아달', npc: 'sl_abiathar', dlg: 'sl_ephod' },
          { id: 's15s5', zone: 'philistia', obj: '피곤하여 브솔 시내를 건너지 못하는 이백 명', where: '남쪽 브솔 시내(빛나는 곳)', point: 'sl_besor', dlg: 'sl_besor' },
          { id: 's15s6', zone: 'philistia', obj: '들에서 애굽 사람 하나를 만나', where: '브솔 시내 동쪽 들의 애굽 사람', npc: 'sl_egyptian', game: 'feed', doneDlg: 'sl_feed_done' },
          { id: 's15s7', zone: 'philistia', obj: '그가 다윗을 인도하여 내려가니', where: '발자국을 따라 북서쪽 끝(빛나는 곳)', point: 'sl_amalek30', dlg: 'sl_amalek30' },
          { id: 's15s8', zone: 'philistia', obj: '같이 분배할 것이니라', where: '브솔 시내의 다윗', npc: 'sl_david_s', game: 'share', doneDlg: 'sl_share_done', reward: { verse: ['1sa30-6', '1sa30-24'], clear: true } },
        ] },
      { title: `${T(16)} — 길보아 산, 그리고 야베스`, clearTitle: '🎉 7편 「사울과 다윗」을 모두 마쳤어요! 일곱 번째 받침대에 물매와 돌 다섯이 놓여요', next: '두루마리마을 기념 전시관에서 일곱 번째 받침대를 보세요',
        steps: [
          { id: 's16s1', zone: 'jezreel', obj: '사울이 길보아에 진 쳤더니', where: '이스르엘 골짜기 샘 곁(빛나는 곳)', point: 'sl_camp28', dlg: 'sl_camp28' },
          { id: 's16s2', zone: 'jezreel', obj: '그 날에 함께 죽었더라', where: '길보아 산이 보이는 곳(빛나는 곳)', point: 'sl_gilboa', dlg: 'sl_gilboa31' },
          { id: 's16s3', zone: 'jezreel', obj: '사울의 길', where: '골짜기 가운데(빛나는 곳)', point: 'sl_way', game: 'way', doneDlg: 'sl_way_done' },
          { id: 's16s4', zone: 'moab', obj: '밤새도록 달려가서', where: '모압 평지 북쪽 길르앗 야베스 주민', npc: 'sl_jabesh_men', game: 'run', doneDlg: 'sl_run_done', reward: { verse: ['1ch10-13', '1ch10-14', '1sa31-13'], clear: true } },
        ] },
""")
rep("spear: spearGame, arrow: arrowGame },", "spear: spearGame, arrow: arrowGame, gather: gatherGame, maon: maonGame, cloak: cloakGame, sneak: sneakGame, gifts: giftsGame, feed: feedGame, share: shareGame, way: wayGame, run: runGame },")
rep("anoint16, gemDavid, ease, fall },", "anoint16, gemDavid, ease, fall, dust30: dustFn30, gilboaFar, hush },")
open('saul7_src.js', 'w', encoding='utf-8', newline='\n').write(s)

# ③ 엔진 index.html — 새 마을 유다 광야 · 일곱 번째 받침대
p = r'E:\서브 브레인\Projects\malsseum-umul\odyssey\index.html'
h = open(p, encoding='utf-8', newline='').read()
def hr(a, b):
    global h
    assert h.count(a) == 1, (h.count(a), a[:70])
    h = h.replace(a, b)
v1740 = [l for l in open('1sa17.txt', encoding='utf-8') if l.startswith('40 ')][0][3:].strip()
hr("""        { id: 'to-bethlehem', x: -42, z: -16, type: 'exit', title: "서북쪽 길로 베들레헴에 가기", to: 'bethlehem', spawn: [0, 36], cond: 'bethlehemOpen' },
""", """        { id: 'to-bethlehem', x: -42, z: -16, type: 'exit', title: "서북쪽 길로 베들레헴에 가기", to: 'bethlehem', spawn: [0, 36], cond: 'bethlehemOpen' },
        { id: 'to-judah', x: 42, z: -8, type: 'exit', title: "동쪽 길로 유다 광야에 내려가기", to: 'judah', spawn: [36, 0], cond: 'judahOpen' },
""")
hr("clear: [[0, -36, 6], [-4, 14, 10], [0, -14, 5], [0, -2, 4], [-24, 30, 17], [22, 34, 14]],", "clear: [[0, -36, 6], [-4, 14, 10], [0, -14, 5], [0, -2, 4], [-24, 30, 17], [22, 34, 14], [39, -8, 7]],")
hr("[-6, 22, 6], [-12, 4, 3], [-11, 14, 3]],", "[-6, 22, 6], [-12, 4, 3], [-11, 14, 3], [18, 33, 8]],")
hr("""        { id: 'to-gibeon-g', x: -42, z: 20, type: 'exit', title: "서쪽 길로 기브온 마을에 내려가기", to: 'gibeon', spawn: [34, -22] },
      ],
    },
""", """        { id: 'to-gibeon-g', x: -42, z: 20, type: 'exit', title: "서쪽 길로 기브온 마을에 내려가기", to: 'gibeon', spawn: [34, -22] },
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
""")
hr("  CONDS.gibeahOpen = () => !!((ST.sp && ST.sp.saul) || DEV_SCROLL);   // 7편을 펼친 뒤부터\n", "  CONDS.gibeahOpen = () => !!((ST.sp && ST.sp.saul) || DEV_SCROLL);   // 7편을 펼친 뒤부터\n  CONDS.judahOpen = () => { const p = ST.sp && ST.sp.saul; return !!((p && p.ch >= 11) || DEV_SCROLL); };   // 7편 12장(삼상 22:1 아둘람 굴)부터\n")
hr("philistia: 99, bethlehem: 99, gibeah: 99 };", "philistia: 99, bethlehem: 99, gibeah: 99, judah: 99 };")
hr("'philistia', 'bethlehem', 'gibeah']){", "'philistia', 'bethlehem', 'gibeah', 'judah']){")
hr("      if (z === 'gibeah' && !story && !CONDS.gibeahOpen()) continue;   // 기브아와 믹마스는 7편부터\n", "      if (z === 'gibeah' && !story && !CONDS.gibeahOpen()) continue;   // 기브아와 믹마스는 7편부터\n      if (z === 'judah' && !story && !CONDS.judahOpen()) continue;   // 유다 광야는 7편 12장부터\n")
hr("(z === 'gibeah' && CONDS.gibeahOpen()) ||", "(z === 'gibeah' && CONDS.gibeahOpen()) || (z === 'judah' && CONDS.judahOpen()) ||")
hr("bethlehem: 'midian', gibeah: 'midian' };", "bethlehem: 'midian', gibeah: 'midian', judah: 'midian' };")
hr("  ROUTE.redsea.rephidim = 'to-wild';", "  // 7편 12장: 유다 광야는 헤브론 산지에서 동쪽 길로만 이어진다\n  ROUTE.judah = {}; Object.keys(ROUTE).forEach(z => { if (z === 'judah') return; ROUTE.judah[z] = 'to-hebron-w'; ROUTE[z].judah = z === 'hebron' ? 'to-judah' : ROUTE[z].hebron; });\n  ROUTE.redsea.rephidim = 'to-wild';")
hr("    ruth: { to: 'saul', done: () => ruthDone(), ped: 5, what: '에벤에셀 돌' },\n", "    ruth: { to: 'saul', done: () => ruthDone(), ped: 5, what: '에벤에셀 돌' },\n    saul: { to: null, done: () => saulDone(), ped: 6, what: '물매와 돌 다섯' },   // 8편은 준비 중 — 받침대만 보여 준다\n")
hr("[13.4, -1.6], [15.3, -0.4]];", "[13.4, -1.6], [15.3, -0.4], [17.3, 0.5]];")
hr("    if (judgesDone() && PEDESTALS[4] && propTemplates['jar-torch-sm']){", """    if (saulDone() && PEDESTALS[6]){   // 일곱 번째 받침대: 물매와 돌 다섯(삼상 17:40) — 도형
      const [x, z] = PEDESTALS[6], y = heightAt(x, z) + 1.06, sg = new THREE.Group(), mat = c => new THREE.MeshToonMaterial({ color: c, gradientMap: toonGradient });
      for (let i = 0; i < 5; i++){ const a = i / 5 * Math.PI * 2, st = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), mat(i % 2 ? 0xd8d0bc : 0xc4baa2)); st.scale.set(1.2, 0.72, 1); st.position.set(Math.cos(a) * 0.2, 0.07, Math.sin(a) * 0.2); sg.add(st); }
      const pouch = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.03, 0.12), mat(0x7a5a38)); pouch.position.set(0.02, 0.28, 0); sg.add(pouch);
      for (const s of [-1, 1]){ const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.52, 5), mat(0x8a6a44)); cord.position.set(s * 0.24, 0.32, 0); cord.rotation.z = s * 1.25; sg.add(cord); }
      sg.position.set(x, y, z); exhibitObj.add(sg);
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, color: 0xfff0d0, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.3 })); glow.scale.set(1.2, 1.2, 1); glow.position.set(x, y + 0.4, z); exhibitObj.add(glow);
    }
    if (judgesDone() && PEDESTALS[4] && propTemplates['jar-torch-sm']){""")
hr("  const ruthDone = () => { const p = ST.sp && ST.sp.ruth; return !!(p && p.cleared && p.ch >= 8); };\n", "  const ruthDone = () => { const p = ST.sp && ST.sp.ruth; return !!(p && p.cleared && p.ch >= 8); };\n  const saulDone = () => { const p = ST.sp && ST.sp.saul; return !!(p && p.cleared && p.ch >= 15); };\n")
hr("    el.innerHTML = head + rows + head2 + head3 + head4 + head5 + head6 + `<div style=\"margin-top:8px;font-size:12.5px;opacity:.75\">${ruthDone() ? '여섯 받침대가 채워졌어요. 일곱 번째 받침대는 7편 「사울과 다윗」을 모두 마치면 채워져요.'", "    const head7 = saulDone() ? `<div class=\"keyline\">🪨 <b>일곱 번째 받침대 — 「사울과 다윗」의 물매와 돌 다섯</b><br><span style=\"opacity:.8\">\"" + v1740 + "\" (사무엘상 17:40)</span></div>` : '';\n    el.innerHTML = head + rows + head2 + head3 + head4 + head5 + head6 + head7 + `<div style=\"margin-top:8px;font-size:12.5px;opacity:.75\">${saulDone() ? '일곱 받침대가 채워졌어요. 다음 두루마리는 준비하고 있어요.' : ruthDone() ? '여섯 받침대가 채워졌어요. 일곱 번째 받침대는 7편 「사울과 다윗」을 모두 마치면 채워져요.'")
open(p, 'w', encoding='utf-8', newline='').write(h)
print('patched')
