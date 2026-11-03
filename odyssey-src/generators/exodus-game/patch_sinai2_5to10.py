p = 'scrolls/sinai2.js'
s = open(p, encoding='utf-8').read()

def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:60])
    s = s.replace(a, b)

# ── 구절 카드 ──
rep("""    'lv9-24': { ref: '레위기 9:24', text: '불이 여호와 앞에서 나와 제단 위의 번제물과 기름을 사른지라 온 백성이 이를 보고 소리 지르며 엎드렸더라' },
""", """    'lv9-24': { ref: '레위기 9:24', text: '불이 여호와 앞에서 나와 제단 위의 번제물과 기름을 사른지라 온 백성이 이를 보고 소리 지르며 엎드렸더라' },
    'lv10-3': { ref: '레위기 10:3', text: '모세가 아론에게 이르되 이는 여호와의 말씀이라 이르시기를 나는 나를 가까이 하는 자 중에서 내 거룩함을 나타내겠고 온 백성 앞에서 내 영광을 나타내리라 하셨느니라 아론이 잠잠하니' },
    'lv19-18': { ref: '레위기 19:18', text: '원수를 갚지 말며 동포를 원망하지 말며 네 이웃 사랑하기를 네 자신과 같이 사랑하라 나는 여호와이니라' },
    'lv16-30': { ref: '레위기 16:30', text: '이 날에 너희를 위하여 속죄하여 너희를 정결하게 하리니 너희의 모든 죄에서 너희가 여호와 앞에 정결하리라' },
    'lv23-2': { ref: '레위기 23:2', text: '이스라엘 자손에게 말하여 이르라 이것이 나의 절기들이니 너희가 성회로 공포할 여호와의 절기들이니라' },
    'lv25-10': { ref: '레위기 25:10', text: '너희는 오십 년째 해를 거룩하게 하여 그 땅에 있는 모든 주민을 위하여 자유를 공포하라 이 해는 너희에게 희년이니 너희는 각각 자기의 소유지로 돌아가며 각각 자기의 가족에게로 돌아갈지며' },
    'nu2-2': { ref: '민수기 2:2', text: '이스라엘 자손은 각각 자기의 진영의 군기와 자기의 조상의 가문의 기호 곁에 진을 치되 회막을 향하여 사방으로 치라' },
    'nu6-24': { ref: '민수기 6:24-26', text: '여호와는 네게 복을 주시고 너를 지키시기를 원하며 여호와는 그의 얼굴을 네게 비추사 은혜 베푸시기를 원하며 여호와는 그 얼굴을 네게로 향하여 드사 평강 주시기를 원하노라' },
    'nu9-18': { ref: '민수기 9:18', text: '이스라엘 자손이 여호와의 명령을 따라 행진하였고 여호와의 명령을 따라 진을 쳤으며 구름이 성막 위에 머무는 동안에는 그들이 진영에 머물렀고' },
""")

# ── 대사 (모두 2026-09-27 bskorea 개역개정 원문) ──
UNCLEAN = "{ n: '부정하게 된 사람들' }"
rep("""      [NAR, '불이 여호와 앞에서 나와 제단 위의 번제물과 기름을 사른지라 온 백성이 이를 보고 소리 지르며 엎드렸더라 (레 9:24)'],
    ],
  });
""", """      [NAR, '불이 여호와 앞에서 나와 제단 위의 번제물과 기름을 사른지라 온 백성이 이를 보고 소리 지르며 엎드렸더라 (레 9:24)'],
    ],
    // 5장 — 표현 절제: 쓰러지는 모습은 보이지 않고 빈 향로 둘만 남는다(2026-09-26 확정)
    lv_strange1: [
      [NAR, '아론의 아들 나답과 아비후가 각기 향로를 가져다가 여호와께서 명령하시지 아니하신 다른 불을 담아 여호와 앞에 분향하였더니 (레 10:1)'],
      [NAR, '▶ 번제단 앞으로 가요.'],
    ],
    lv_strange2: [
      { event: 'strangeFire' },
      [NAR, '불이 여호와 앞에서 나와 그들을 삼키매 그들이 여호와 앞에서 죽은지라 (레 10:2)'],
    ],
    lv_strange3: [
      [NAR, '모세가 아론에게 이르되 (레 10:3)'],
      [MOSES, '이는 여호와의 말씀이라 이르시기를 나는 나를 가까이 하는 자 중에서 내 거룩함을 나타내겠고 온 백성 앞에서 내 영광을 나타내리라 하셨느니라'],
      [NAR, '아론이 잠잠하니 (레 10:3)'],
      [NAR, '모세가 아론과 그의 아들 엘르아살과 이다말에게 이르되 (레 10:6)'],
      [MOSES, '여호와의 관유가 너희에게 있은즉 너희는 회막 문에 나가지 말라 그리하면 죽음을 면하리라'],
      [NAR, '그들이 모세의 말대로 하니라 (레 10:7)'],
    ],
    // 6장
    lv_holy: [
      [NAR, '나는 너희의 하나님이 되려고 너희를 애굽 땅에서 인도하여 낸 여호와라 내가 거룩하니 너희도 거룩할지어다 (레 11:45)'],
      [NAR, '너는 이스라엘 자손의 온 회중에게 말하여 이르라 너희는 거룩하라 이는 나 여호와 너희 하나님이 거룩함이니라 (레 19:2)'],
      [NAR, '▶ 진영 동쪽의 밭으로 가요.'],
    ],
    lv_field_intro: [
      [NAR, '너희가 너희의 땅에서 곡식을 거둘 때에 너는 밭 모퉁이까지 다 거두지 말고 네 떨어진 이삭도 줍지 말며 (레 19:9)'],
      [NAR, '▶ 곡식을 거두되, 모퉁이와 떨어진 이삭은 남겨 두어요.'],
    ],
    lv_field_done: [
      [NAR, '네 포도원의 열매를 다 따지 말며 네 포도원에 떨어진 열매도 줍지 말고 가난한 사람과 거류민을 위하여 버려두라 나는 너희의 하나님 여호와이니라 (레 19:10)'],
    ],
    lv_neighbor: [
      [NAR, '원수를 갚지 말며 동포를 원망하지 말며 네 이웃 사랑하기를 네 자신과 같이 사랑하라 나는 여호와이니라 (레 19:18)'],
      [NAR, '그 이스라엘 여인의 아들이 여호와의 이름을 모독하며 저주하므로 무리가 끌고 모세에게로 가니라 그의 어머니의 이름은 슬로밋이요 단 지파 디브리의 딸이었더라 (레 24:11)'],
      [NAR, '그들이 그를 가두고 여호와의 명령을 기다리더니 (레 24:12)'],
      [NAR, '거류민에게든지 본토인에게든지 그 법을 동일하게 할 것은 나는 너희의 하나님 여호와임이니라 (레 24:22)'],
    ],
    // 7장
    lv_atone1: [
      [NAR, '너희는 영원히 이 규례를 지킬지니라 일곱째 달 곧 그 달 십일에 너희는 스스로 괴롭게 하고 아무 일도 하지 말되 본토인이든지 너희 중에 거류하는 거류민이든지 그리하라 (레 16:29)'],
      [NAR, '아론은 그의 두 손으로 살아 있는 염소의 머리에 안수하여 이스라엘 자손의 모든 불의와 그 범한 모든 죄를 아뢰고 그 죄를 염소의 머리에 두어 미리 정한 사람에게 맡겨 광야로 보낼지니 (레 16:21)'],
      { event: 'goatGo' },
      [NAR, '▶ 진 밖 광야로 가는 염소를 멀리서 따라가요.'],
    ],
    lv_atone2: [
      [NAR, '염소가 그들의 모든 불의를 지고 접근하기 어려운 땅에 이르거든 그는 그 염소를 광야에 놓을지니라 (레 16:22)'],
      [NAR, '▶ 회막 문의 모세에게 돌아가요.'],
    ],
    lv_atone3: [
      [NAR, '이 날에 너희를 위하여 속죄하여 너희를 정결하게 하리니 너희의 모든 죄에서 너희가 여호와 앞에 정결하리라 (레 16:30)'],
      [NAR, '이는 너희가 영원히 지킬 규례라 이스라엘 자손의 모든 죄를 위하여 일 년에 한 번 속죄할 것이니라 아론이 여호와께서 모세에게 명령하신 대로 행하니라 (레 16:34)'],
    ],
    // 8장
    lv_feasts: [
      [NAR, '이스라엘 자손에게 말하여 이르라 이것이 나의 절기들이니 너희가 성회로 공포할 여호와의 절기들이니라 (레 23:2)'],
      [NAR, '이것이 너희가 그 정한 때에 성회로 공포할 여호와의 절기들이니라 (레 23:4)'],
    ],
    lv_booth: [
      [NAR, '이스라엘 자손에게 말하여 이르라 일곱째 달 열닷샛날은 초막절이니 여호와를 위하여 이레 동안 지킬 것이라 (레 23:34)'],
      [NAR, '너희는 이레 동안 초막에 거주하되 이스라엘에서 난 자는 다 초막에 거주할지니 (레 23:42)'],
      [NAR, '이는 내가 이스라엘 자손을 애굽 땅에서 인도하여 내던 때에 초막에 거주하게 한 줄을 너희 대대로 알게 함이니라 나는 너희의 하나님 여호와이니라 (레 23:43)'],
      [NAR, '▶ 회막 문의 아론에게 가요.'],
    ],
    lv_jubilee: [
      { event: 'shofar' },
      [NAR, '너희는 오십 년째 해를 거룩하게 하여 그 땅에 있는 모든 주민을 위하여 자유를 공포하라 이 해는 너희에게 희년이니 너희는 각각 자기의 소유지로 돌아가며 각각 자기의 가족에게로 돌아갈지며 (레 25:10)'],
    ],
    // 9장
    lv_count: [
      [NAR, '이스라엘 자손이 애굽 땅에서 나온 후 둘째 해 둘째 달 첫째 날에 여호와께서 시내 광야 회막에서 모세에게 말씀하여 이르시되 (민 1:1)'],
      [NAR, '너희는 이스라엘 자손의 모든 회중 각 남자의 수를 그들의 종족과 조상의 가문에 따라 그 명수대로 계수할지니 (민 1:2)'],
      [NAR, '이스라엘 중 이십 세 이상으로 싸움에 나갈 만한 모든 자를 너와 아론은 그 진영별로 계수하되 (민 1:3)'],
      [NAR, '▶ 진영의 군기 든 사람에게 가요.'],
    ],
    lv_camp_intro: [
      [NAR, '이스라엘 자손은 각각 자기의 진영의 군기와 자기의 조상의 가문의 기호 곁에 진을 치되 회막을 향하여 사방으로 치라 (민 2:2)'],
      [NAR, '▶ 열두 지파의 군기를 회막 사방에 세워요.'],
    ],
    lv_camp_done: [
      [NAR, '그 다음에 회막이 레위인의 진영과 함께 모든 진영의 중앙에 있어 행진하되 그들의 진 친 순서대로 각 사람은 자기의 위치에서 자기들의 기를 따라 앞으로 행진할지니라 (민 2:17)'],
      [NAR, '이스라엘 자손이 여호와께서 모세에게 명령하신 대로 다 준행하여 각기 종족과 조상의 가문에 따르며 자기들의 기를 따라 진 치기도 하며 행진하기도 하였더라 (민 2:34)'],
    ],
    lv_levites: [
      [NAR, '보라 내가 이스라엘 자손 중에서 레위인을 택하여 이스라엘 자손 중에 태를 열어 태어난 모든 맏이를 대신하게 하였은즉 레위인은 내 것이라 (민 3:12)'],
    ],
    // 10장
    lv_bless: [
      [NAR, '여호와께서 모세에게 말씀하여 이르시되 (민 6:22)'],
      [NAR, '아론과 그의 아들들에게 말하여 이르기를 너희는 이스라엘 자손을 위하여 이렇게 축복하여 이르되 (민 6:23)'],
      [AARON, '여호와는 네게 복을 주시고 너를 지키시기를 원하며'],
      [AARON, '여호와는 그의 얼굴을 네게 비추사 은혜 베푸시기를 원하며'],
      [AARON, '여호와는 그 얼굴을 네게로 향하여 드사 평강 주시기를 원하노라'],
      [NAR, '그들은 이같이 내 이름으로 이스라엘 자손에게 축복할지니 내가 그들에게 복을 주리라 (민 6:27)'],
    ],
    lv_gifts: [
      [NAR, '모세가 장막 세우기를 끝내고 그것에 기름을 발라 거룩히 구별하고 또 그 모든 기구와 제단과 그 모든 기물에 기름을 발라 거룩히 구별한 날에 (민 7:1)'],
      [NAR, '이스라엘 지휘관들 곧 그들의 조상의 가문의 우두머리들이요 그 지파의 지휘관으로서 그 계수함을 받은 자의 감독된 자들이 헌물을 드렸으니 (민 7:2)'],
      [NAR, '첫째 날에 헌물을 드린 자는 유다 지파 암미나답의 아들 나손이라 (민 7:12)'],
      [NAR, '모세가 회막에 들어가서 여호와께 말하려 할 때에 증거궤 위 속죄소 위의 두 그룹 사이에서 자기에게 말씀하시는 목소리를 들었으니 여호와께서 그에게 말씀하심이었더라 (민 7:89)'],
    ],
    lv_passover2: [
      [NAR, '그들이 첫째 달 열넷째 날 해 질 때에 시내 광야에서 유월절을 지켰으되 이스라엘 자손이 여호와께서 모세에게 명령하신 것을 다 따라 행하였더라 (민 9:5)'],
      [NAR, '그 때에 사람의 시체로 말미암아 부정하게 되어서 유월절을 지킬 수 없는 사람들이 있었는데 그들이 그 날에 모세와 아론 앞에 이르러 (민 9:6)'],
      [""" + UNCLEAN + """, '우리가 사람의 시체로 말미암아 부정하게 되었거니와 우리를 금지하여 이스라엘 자손과 함께 정한 기일에 여호와께 헌물을 드리지 못하게 하심은 어찌함이니이까'],
      [NAR, '모세가 그들에게 이르되 (민 9:8)'],
      [MOSES, '기다리라 여호와께서 너희에게 대하여 어떻게 명령하시는지 내가 들으리라'],
      [NAR, '이스라엘 자손에게 말하여 이르라 너희나 너희 후손 중에 시체로 말미암아 부정하게 되든지 먼 여행 중에 있다 할지라도 다 여호와 앞에 마땅히 유월절을 지키되 (민 9:10)'],
      [NAR, '둘째 달 열넷째 날 해 질 때에 그것을 지켜서 어린 양에 무교병과 쓴 나물을 아울러 먹을 것이요 (민 9:11)'],
    ],
    lv_trumpet_intro: [
      [NAR, '여호와께서 모세에게 말씀하여 이르시되 (민 10:1)'],
      [NAR, '은 나팔 둘을 만들되 두들겨 만들어서 그것으로 회중을 소집하며 진영을 출발하게 할 것이라 (민 10:2)'],
      [NAR, '▶ 나팔 소리를 듣고 누가 움직이는지 골라요.'],
    ],
    lv_depart: [
      [NAR, '둘째 해 둘째 달 스무날에 구름이 증거의 성막에서 떠오르매 (민 10:11)'],
      { event: 'cloudUp' },
      [NAR, '이스라엘 자손이 시내 광야에서 출발하여 자기 길을 가더니 바란 광야에 구름이 머무니라 (민 10:12)'],
      [NAR, '선두로 유다 자손의 진영의 군기에 속한 자들이 그들의 진영별로 행진하였으니 유다 군대는 암미나답의 아들 나손이 이끌었고 (민 10:14)'],
      [NAR, '그들이 여호와의 산에서 떠나 삼 일 길을 갈 때에 여호와의 언약궤가 그 삼 일 길에 앞서 가며 그들의 쉴 곳을 찾았고 (민 10:33)'],
      [NAR, '궤가 떠날 때에는 모세가 말하되 (민 10:35)'],
      [MOSES, '여호와여 일어나사 주의 대적들을 흩으시고 주를 미워하는 자가 주 앞에서 도망하게 하소서'],
    ],
  });
""")

# ── 게임·연출 ──
GAMES = r"""
  // ── 5~10장 ──
  // 🔥 다른 불(레 10:1-2) — 번쩍임만, 쓰러지는 모습은 없음. 뒤에는 빈 향로 둘(world)
  function strangeFire(){
    const fl = document.getElementById('flash'); if (fl){ fl.style.transition = 'none'; fl.style.background = '#fff4d0'; fl.style.opacity = '0.75'; setTimeout(() => { fl.style.transition = 'opacity 1.2s'; fl.style.opacity = '0'; }, 120); setTimeout(() => { fl.style.background = ''; }, 1500); }
    try { api.startCine('lvStrange', ALTAR[0], api.heightAt(ALTAR[0], ALTAR[1]) + 1, ALTAR[1], { r: 7, h: 3, dur: 3.5, spin: 0.3 }); } catch (e){}
  }
  // 🌾 밭 모퉁이 남기기(레 19:9-10)
  function fieldGame(q){
    api.runDialog(DLG.lv_field_intro, () => {
      const N = 5, keep = new Set([0, 4, 20, 24]), fallen = new Set([7, 12, 18]);
      let cut = new Set(), msg = '';
      const need = () => [...Array(N * N).keys()].filter(i => !keep.has(i) && !fallen.has(i));
      mgOpen('🌾 밭 모퉁이', '"밭 모퉁이까지 다 거두지 말고 네 떨어진 이삭도 줍지 말며" (레 19:9) — 곡식을 눌러 거둬요.');
      const draw = () => {
        const done = need().every(i => cut.has(i));
        api.mgArea.innerHTML = `<div style="display:grid;grid-template-columns:repeat(${N},1fr);gap:4px;padding:8px 14px">${[...Array(N * N).keys()].map(i => `<button data-fd="${i}" style="${btnCss};font-size:22px;padding:6px 0;${keep.has(i) ? 'box-shadow:inset 0 0 0 2px rgba(255,210,122,.55)' : ''}">${cut.has(i) ? '·' : fallen.has(i) ? '🌿' : '🌾'}</button>`).join('')}</div><div style="text-align:center;color:#ffd27a;font-weight:800;min-height:18px;padding:0 8px;font-size:12.5px">${msg || (done ? '✓ 모퉁이와 떨어진 이삭을 남기고 다 거뒀어요' : `거둔 곡식 ${need().filter(i => cut.has(i)).length} / ${need().length} · 테두리 칸은 모퉁이, 🌿는 떨어진 이삭`)}</div>`;
        api.mgAct.textContent = done ? '계속' : '다 거두면 계속'; api.mgAct.disabled = !done;
      };
      draw();
      api.mgArea.onclick = e => { const b = e.target.closest('[data-fd]'); if (!b) return; const i = +b.dataset.fd;
        if (keep.has(i) || fallen.has(i)){ cut = new Set(); msg = '"가난한 사람과 거류민을 위하여 버려두라" (레 19:10) — 처음부터 다시 거둬요'; }
        else { cut.add(i); msg = ''; }
        draw(); };
      api.mgAct.onclick = () => { if (!need().every(i => cut.has(i))) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; };
    }, null, 'lv_field_intro');
  }
  // 🐐 광야로 가는 염소(레 16:21-22) — 회막 문에서 진 밖 광야까지 걸어감
  let goatObj = null, goatAnim = 0;
  function goatMesh(){
    const t = api.propTemplates.lamb; if (!t) return null;
    const o = t.holder.clone(true); o.traverse(m => { if (m.isMesh){ m.material = m.material.clone(); if (m.material.color) m.material.color.multiplyScalar(0.55); } }); return o;
  }
  async function goatGo(){
    await api.loadProps(['lamb']); if (!api.Z || api.Z.id !== 'sinai') return;
    if (goatObj && goatObj.parent) goatObj.parent.remove(goatObj);
    goatObj = goatMesh(); if (!goatObj) return; api.zoneRoot.add(goatObj);
    const [x0, z0] = [DOOR[0] + 1.5, DOOR[1] + 1.5], [x1, z1] = WILD, dur = 22000, t0 = performance.now(), my = ++goatAnim;
    const step = () => { if (my !== goatAnim || !goatObj || !goatObj.parent) return;
      const k = Math.min(1, (performance.now() - t0) / dur), x = x0 + (x1 - x0) * k, z = z0 + (z1 - z0) * k;
      goatObj.position.set(x, api.heightAt(x, z) - 0.05, z); goatObj.rotation.y = Math.atan2(x1 - x0, z1 - z0);
      if (k < 1) requestAnimationFrame(step); };
    step();
  }
  // 🗓 여호와의 절기(레 23장) — 달력 순서대로
  function calendarGame(q){
    const ORDER = [['유월절', '첫째 달 열나흗날 저녁 (23:5)'], ['무교절', '이 달 열닷샛날 (23:6)'], ['첫 이삭 한 단', '곡물의 첫 이삭 한 단 (23:10)'], ['새 소제', '오십 일을 계수하여 (23:16)'],
      ['나팔을 불어 기념할 날', '일곱째 달 첫 날 (23:24)'], ['속죄일', '일곱째 달 열흘날 (23:27)'], ['초막절', '일곱째 달 열닷샛날 (23:34)']];
    const shown = ORDER.map((t, i) => i).sort(() => Math.random() - 0.5);
    let next = 0, msg = '';
    mgOpen('🗓 여호와의 절기', '"이것이 너희가 그 정한 때에 성회로 공포할 여호와의 절기들이니라" (레 23:4) — 한 해의 차례대로 눌러요.');
    const draw = () => {
      api.mgArea.innerHTML = `<div style="padding:6px 12px;font-size:12.5px;min-height:20px">${ORDER.slice(0, next).map(o => o[0]).join(' → ') || '—'}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;padding:0 10px">${shown.filter(i => i >= next).map(i => `<button data-cl="${i}" style="${btnCss}"><b>${ORDER[i][0]}</b><br><span style="font-size:11px;opacity:.8">${ORDER[i][1]}</span></button>`).join('')}</div><div style="text-align:center;color:#ffd27a;font-weight:800;min-height:18px;margin-top:6px">${msg || (next < ORDER.length ? `${next + 1}번째 절기는?` : '✓ 한 해의 절기를 모두 놓았어요')}</div>`;
      api.mgAct.textContent = next < ORDER.length ? '다 놓으면 계속' : '계속'; api.mgAct.disabled = next < ORDER.length;
    };
    draw();
    api.mgArea.onclick = e => { const b = e.target.closest('[data-cl]'); if (!b) return; const i = +b.dataset.cl;
      if (i === next){ next++; msg = ''; } else msg = '달과 날짜를 다시 읽어 보세요'; draw(); };
    api.mgAct.onclick = () => { if (next < ORDER.length) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
    api.mg.onClose = () => { api.mgArea.onclick = null; };
  }
  // 🏕 진 배치(민 2장) — 회막을 가운데 두고 사방으로
  const TRIBES = [['유다', '동', '2:3'], ['잇사갈', '동', '2:5'], ['스불론', '동', '2:7'], ['르우벤', '남', '2:10'], ['시므온', '남', '2:12'], ['갓', '남', '2:14'],
    ['에브라임', '서', '2:18'], ['므낫세', '서', '2:20'], ['베냐민', '서', '2:22'], ['단', '북', '2:25'], ['아셀', '북', '2:27'], ['납달리', '북', '2:29']];
  const HEAD = { '동': '동방 해 돋는 쪽에 진 칠 자는 그 진영별로 유다의 진영의 군기에 속한 자라 (민 2:3)', '남': '남쪽에는 르우벤 군대 진영의 군기가 있을 것이라 (민 2:10)',
    '서': '서쪽에는 에브라임의 군대의 진영의 군기가 있을 것이라 (민 2:18)', '북': '북쪽에는 단 군대 진영의 군기가 있을 것이라 (민 2:25)' };
  const GROUP = { '동': '유다', '남': '르우벤', '서': '에브라임', '북': '단' };
  function campGame(q){
    api.runDialog(DLG.lv_camp_intro, () => {
      const order = TRIBES.map((t, i) => i).sort(() => Math.random() - 0.5);
      let k = 0, msg = ''; const placed = { '동': [], '남': [], '서': [], '북': [] };
      mgOpen('🏕 열두 지파의 진', '"회막을 향하여 사방으로 치라" (민 2:2) — 지파마다 어느 쪽에 진을 치는지 골라요.');
      const box = d => `<div style="padding:4px;border-radius:8px;background:rgba(255,255,255,.06);font-size:11.5px;min-height:34px"><b>${d}쪽</b><br>${placed[d].join(' · ')}</div>`;
      const draw = () => {
        const t = TRIBES[order[k]];
        api.mgArea.innerHTML = `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;padding:6px 10px;text-align:center"><div></div>${box('북')}<div></div>${box('서')}<div style="padding:6px;border-radius:8px;background:rgba(255,210,122,.18);font-size:11.5px">⛺ 회막<br>레위인</div>${box('동')}<div></div>${box('남')}<div></div></div>`
          + (t ? `<div style="text-align:center;font-weight:800;margin:4px 0">🚩 ${t[0]} 지파</div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;padding:0 10px">${['동', '서', '남', '북'].map(d => `<button data-cp="${d}" style="${btnCss}">${d}쪽</button>`).join('')}</div>` : '')
          + `<div style="text-align:center;color:#ffd27a;font-weight:800;min-height:18px;padding:4px 8px;font-size:12px">${msg || (t ? `${k + 1} / 12` : '✓ 열두 지파가 회막 사방에 진을 쳤어요')}</div>`;
        api.mgAct.textContent = t ? '다 세우면 계속' : '계속'; api.mgAct.disabled = !!t;
      };
      draw();
      api.mgArea.onclick = e => { const b = e.target.closest('[data-cp]'); if (!b || k >= 12) return; const t = TRIBES[order[k]];
        if (b.dataset.cp === t[1]){ placed[t[1]].push(t[0]); k++; msg = ''; }
        else msg = t[0] === GROUP[t[1]] ? HEAD[t[1]] : `${t[0]} 지파는 ${GROUP[t[1]]} 진영 곁에 진을 쳐요 (민 ${t[2]})`;
        draw(); };
      api.mgAct.onclick = () => { if (k < 12) return; api.mgArea.onclick = null; mgCloseAll();
        api.addGeneal('나손'); api.toast('📜 족보 조각 「나손」 — "유다 자손의 지휘관은 암미나답의 아들 나손이요" (민 2:3)', 3200); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; };
    }, null, 'lv_camp_intro');
  }
  // 🎺 은 나팔(민 10:2-6) — 소리를 듣고 누가 움직이는지
  let actx = null;
  function blast(kind){
    try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); const t0 = actx.currentTime;
      const tone = (f, a, b, vol) => { const o = actx.createOscillator(), g = actx.createGain(); o.type = 'sawtooth'; o.frequency.value = f; g.gain.setValueAtTime(0, t0 + a); g.gain.linearRampToValueAtTime(vol, t0 + a + 0.05); g.gain.setValueAtTime(vol, t0 + b - 0.08); g.gain.linearRampToValueAtTime(0, t0 + b); o.connect(g); g.connect(actx.destination); o.start(t0 + a); o.stop(t0 + b + 0.02); };
      if (kind === 'two'){ tone(466, 0, 1.2, 0.05); tone(587, 0, 1.2, 0.05); }
      else if (kind === 'one') tone(466, 0, 1.0, 0.06);
      else if (kind === 'loud1') tone(523, 0, 1.6, 0.11);
      else { tone(523, 0, 0.9, 0.11); tone(523, 1.1, 2.0, 0.11); }
    } catch (e){}
  }
  function trumpetGame(q){
    api.runDialog(DLG.lv_trumpet_intro, () => {
      const R = [['two', '🎺🎺 나팔 두 개를 불어요', 0, '나팔 두 개를 불 때에는 온 회중이 회막 문 앞에 모여서 네게로 나아올 것이요 (민 10:3)'],
        ['one', '🎺 하나만 불어요', 1, '하나만 불 때에는 이스라엘의 천부장 된 지휘관들이 모여서 네게로 나아올 것이며 (민 10:4)'],
        ['loud1', '📯 크게 불어요', 2, '너희가 그것을 크게 불 때에는 동쪽 진영들이 행진할 것이며 (민 10:5)'],
        ['loud2', '📯📯 두 번째로 크게 불어요', 3, '두 번째로 크게 불 때에는 남쪽 진영들이 행진할 것이라 (민 10:6)']].sort(() => Math.random() - 0.5);
      const WHO = ['온 회중이 회막 문 앞에 모임', '천부장 된 지휘관들이 모임', '동쪽 진영들이 행진', '남쪽 진영들이 행진'];
      let k = 0, msg = '';
      mgOpen('🎺 은 나팔 둘', '"그것으로 회중을 소집하며 진영을 출발하게 할 것이라" (민 10:2) — 소리를 듣고 누가 움직이는지 골라요.');
      const draw = () => { const r = R[k];
        api.mgArea.innerHTML = (r ? `<div style="text-align:center;padding:10px"><button data-tp="again" style="${btnCss};font-size:15px">${r[1]} · 🔊 다시 듣기</button></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;padding:0 10px">${WHO.map((w, i) => `<button data-tw="${i}" style="${btnCss}">${w}</button>`).join('')}</div>` : `<div style="padding:16px;text-align:center;font-size:30px">🎺🎺</div>`)
          + `<div style="text-align:center;color:#ffd27a;font-weight:800;min-height:18px;padding:6px 10px;font-size:12px">${msg || (r ? `${k + 1} / 4` : '✓ 나팔 소리를 모두 알아들었어요')}</div>`;
        api.mgAct.textContent = r ? '다 맞히면 계속' : '계속'; api.mgAct.disabled = !!r;
        if (r) blast(r[0]); };
      draw();
      api.mgArea.onclick = e => { const r = R[k]; if (!r) return;
        if (e.target.closest('[data-tp]')){ blast(r[0]); return; }
        const b = e.target.closest('[data-tw]'); if (!b) return;
        if (+b.dataset.tw === r[2]){ msg = '✓ ' + r[3]; k++; setTimeout(() => { msg = ''; draw(); }, 1600); api.mgArea.innerHTML += ''; api.mgAct.disabled = true;
          const d = api.mgArea.querySelector('div:last-child'); if (d) d.textContent = msg; }
        else { msg = '소리를 다시 들어 보세요'; const d = api.mgArea.querySelector('div:last-child'); if (d) d.textContent = msg; } };
      api.mgAct.onclick = () => { if (k < 4) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; };
    }, null, 'lv_trumpet_intro');
  }
  // ☁ 구름이 떠오름(민 10:11)
  function cloudUp(){
    const x = -5, z = -15, y0 = api.heightAt(x, z) + 5, g = new THREE.Group();
    for (let i = 0; i < 9; i++){ const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: api.flameTex, color: 0xffffff, depthWrite: false, transparent: true, opacity: 0.55 }));
      s.position.set(x + (Math.random() - 0.5) * 4, y0 + Math.random() * 1.5, z + (Math.random() - 0.5) * 3); s.scale.set(4 + Math.random() * 2, 3 + Math.random(), 1); g.add(s); }
    api.zoneRoot.add(g);
    const t0 = performance.now(); const up = () => { if (!g.parent) return; const k = (performance.now() - t0) / 7000; g.position.y = k * 9; g.children.forEach(s => s.material.opacity = 0.55 * Math.max(0, 1 - k * 0.6)); if (k < 1.4) requestAnimationFrame(up); else g.parent.remove(g); };
    up();
    try { api.startCine('lvCloud', x, y0 + 3, z, { r: 16, h: 6, dur: 5, spin: 0.4 }); } catch (e){}
  }
  function shofar(){ blast('loud1'); }
  // 마을에 놓이는 것: 빈 향로 둘(5장) · 밭(6장) · 광야의 염소(7장) · 초막(8장) · 열두 지파 군기(9장 진 배치 뒤)
  let worldObj = null;
  const TRIBE_COL = [0x3f7fd0, 0x2f9e6a, 0xd05a3a, 0xe0b040];
  function world(zid){
    if (worldObj && worldObj.parent) worldObj.parent.remove(worldObj); worldObj = null;
    const p = cur(); if (zid !== 'sinai' || !p) return;
    const g = new THREE.Group(), T = api.toonGradient, M = c => new THREE.MeshToonMaterial({ color: c, gradientMap: T });
    const put = (geo, mat, x, dy, z, ry = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, api.heightAt(x, z) + dy, z); m.rotation.y = ry; m.castShadow = true; g.add(m); return m; };
    if (p.ch === 4 && p.step >= 2){   // 빈 향로 둘
      const br = M(0xb07a3a);
      for (const dz of [-0.7, 0.7]){ put(new THREE.CylinderGeometry(0.22, 0.14, 0.18, 12), br, ALTAR[0] + 0.6, 0.09, ALTAR[1] + dz); const h = put(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 6), br, ALTAR[0] + 0.95, 0.12, ALTAR[1] + dz); h.rotation.z = Math.PI / 2 - 0.15; }
    }
    if (p.ch === 5){   // 밭
      const gold = M(0xd9b44a), green = M(0x8aa04a);
      for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++){ const x = FIELD[0] - 2.4 + i * 1.2, z = FIELD[1] - 2.4 + j * 1.2; put(new THREE.ConeGeometry(0.28, 0.9, 6), (i + j) % 4 ? gold : green, x, 0.45, z); }
    }
    if (p.ch === 6 && p.step >= 1 && !(goatObj && goatObj.parent) && api.propTemplates.lamb){   // 광야에 놓인 염소
      const o = goatMesh(); if (o){ o.position.set(WILD[0], api.heightAt(WILD[0], WILD[1]) - 0.05, WILD[1]); g.add(o); }
    }
    if (p.ch === 6 && p.step >= 1 && !api.propTemplates.lamb) api.loadProps(['lamb']).then(() => { const q = cur(); if (q && q.ch === 6 && api.Z && api.Z.id === 'sinai') world('sinai'); });
    if (p.ch === 7){   // 초막: 기둥 넷 + 나뭇가지 지붕
      const wood = M(0x8a6040), leaf = M(0x5f8a3a);
      for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) put(new THREE.CylinderGeometry(0.07, 0.07, 1.9, 6), wood, BOOTH[0] + dx, 0.95, BOOTH[1] + dz);
      put(new THREE.BoxGeometry(2.4, 0.25, 2.4), leaf, BOOTH[0], 1.95, BOOTH[1]);
    }
    if (p.ch > 8 || (p.ch === 8 && p.step >= 2)){   // 열두 지파 군기 — 회막을 향하여 사방으로(민 2:2)
      const pole = M(0x7a5a3a), SIDE = { '동': [[21, -19], [21, -15], [21, -11]], '남': [[-4, -4], [0, -4], [4, -4]], '서': [[-17, -19], [-17, -15], [-17, -11]], '북': [[-4, -26], [0, -26], [4, -26]] };
      Object.entries(SIDE).forEach(([d, spots], di) => spots.forEach(([x, z]) => { put(new THREE.CylinderGeometry(0.05, 0.05, 2.6, 6), pole, x, 1.3, z); const f = put(new THREE.BoxGeometry(0.04, 0.6, 0.9), M(TRIBE_COL[di]), x, 2.25, z + 0.45); f.rotation.y = 0; }));
    }
    if (g.children.length){ api.zoneRoot.add(g); worldObj = g; }
  }
"""
rep("""  const T = n => `📜 시내산의 마지막 한 달 ${n}장`;""", GAMES + """  const T = n => `📜 시내산의 마지막 한 달 ${n}장`;""")

# ── 장 구성 ──
PL = "place: { moses: [15, -13.2], aaron: [15, -16.8] }"
rep("""      { title: `${T(4)} — 여호와의 불`, clearTitle: '🎉 2편 4장 「여호와의 불」 완료! (5장부터는 준비 중이에요)', next: '5장: 다른 불 (준비 중)',""",
    """      { title: `${T(4)} — 여호와의 불`, clearTitle: '🎉 2편 4장 「여호와의 불」 완료!', next: '5장: 다른 불',""")
rep("""          { id: 'lv4s3', zone: 'sinai', obj: '번제단 앞에서 여호와의 영광 보기', where: '성막 뜰 안 번제단(빛나는 곳)', point: 'lv_altar', game: 'bow', reward: { verse: 'lv9-24', clear: true } },
        ] },
    ],""", """          { id: 'lv4s3', zone: 'sinai', obj: '번제단 앞에서 여호와의 영광 보기', where: '성막 뜰 안 번제단(빛나는 곳)', point: 'lv_altar', game: 'bow', reward: { verse: 'lv9-24', clear: true } },
        ] },
      { title: `${T(5)} — 다른 불`, clearTitle: '🎉 2편 5장 「다른 불」 완료!', next: '6장: 거룩한 백성',
        steps: [
          { id: 'lv5s1', zone: 'sinai', obj: '회막 문 앞으로 가기', where: '성막 뜰 동쪽 문(빛나는 곳)', point: 'lv_door', dlg: 'lv_strange1', """ + PL + """ },
          { id: 'lv5s2', zone: 'sinai', obj: '번제단 앞에서 보기', where: '성막 뜰 안 번제단(빛나는 곳)', point: 'lv_altar', dlg: 'lv_strange2' },
          { id: 'lv5s3', zone: 'sinai', obj: '모세의 말 듣기', where: '회막 문 앞의 모세', npc: 'moses', dlg: 'lv_strange3', reward: { verse: 'lv10-3', clear: true } },
        ] },
      { title: `${T(6)} — 거룩한 백성`, clearTitle: '🎉 2편 6장 「거룩한 백성」 완료!', next: '7장: 대속죄일',
        steps: [
          { id: 'lv6s1', zone: 'sinai', obj: '모세에게 가기 — 너희는 거룩하라', where: '회막 문 앞의 모세', npc: 'moses', dlg: 'lv_holy', """ + PL + """ },
          { id: 'lv6s2', zone: 'sinai', obj: '밭 모퉁이와 떨어진 이삭 남기기', where: '진영 동쪽의 밭(빛나는 곳)', point: 'lv_field', game: 'field', doneDlg: 'lv_field_done' },
          { id: 'lv6s3', zone: 'sinai', obj: '아론에게 가기 — 네 이웃을 사랑하라', where: '회막 문 앞의 아론', npc: 'aaron', dlg: 'lv_neighbor', reward: { verse: 'lv19-18', clear: true } },
        ] },
      { title: `${T(7)} — 대속죄일`, clearTitle: '🎉 2편 7장 「대속죄일」 완료!', next: '8장: 여호와의 절기',
        steps: [
          { id: 'lv7s1', zone: 'sinai', obj: '아론 곁으로 — 일곱째 달 십일', where: '회막 문 앞의 아론', npc: 'aaron', dlg: 'lv_atone1', """ + PL + """ },
          { id: 'lv7s2', zone: 'sinai', obj: '광야로 가는 염소 따라가기', where: '진 밖 동쪽 광야의 미리 정한 사람', npc: 'lv_fitman', dlg: 'lv_atone2' },
          { id: 'lv7s3', zone: 'sinai', obj: '모세에게 돌아가기', where: '회막 문 앞의 모세', npc: 'moses', dlg: 'lv_atone3', reward: { verse: 'lv16-30', clear: true } },
        ] },
      { title: `${T(8)} — 여호와의 절기`, clearTitle: '🎉 2편 8장 「여호와의 절기」 완료!', next: '9장: 진영과 지파',
        steps: [
          { id: 'lv8s1', zone: 'sinai', obj: '모세에게 절기 듣기', where: '회막 문 앞의 모세', npc: 'moses', dlg: 'lv_feasts', """ + PL + """ },
          { id: 'lv8s2', zone: 'sinai', obj: '절기를 한 해의 차례대로 놓기', where: '회막 문 앞의 모세', npc: 'moses', game: 'calendar' },
          { id: 'lv8s3', zone: 'sinai', obj: '초막에 가 보기', where: '진영 서쪽의 초막(빛나는 곳)', point: 'lv_booth', dlg: 'lv_booth' },
          { id: 'lv8s4', zone: 'sinai', obj: '아론에게 가기 — 희년의 나팔', where: '회막 문 앞의 아론', npc: 'aaron', dlg: 'lv_jubilee', reward: { verse: ['lv23-2', 'lv25-10'], clear: true } },
        ] },
      { title: `${T(9)} — 진영과 지파`, clearTitle: '🎉 2편 9장 「진영과 지파」 완료!', next: '10장: 구름이 떠오르면',
        steps: [
          { id: 'lv9s1', zone: 'sinai', obj: '모세에게 가기 — 둘째 해 둘째 달 첫째 날', where: '회막 문 앞의 모세', npc: 'moses', dlg: 'lv_count', """ + PL + """ },
          { id: 'lv9s2', zone: 'sinai', obj: '열두 지파의 군기 세우기', where: '진영 한가운데의 군기 든 사람', npc: 'lv_banner', game: 'camp', doneDlg: 'lv_camp_done' },
          { id: 'lv9s3', zone: 'sinai', obj: '레위인에게 가기', where: '성막 뜰 동쪽의 레위인', npc: 'lv_levite', dlg: 'lv_levites', reward: { verse: 'nu2-2', clear: true } },
        ] },
      { title: `${T(10)} — 구름이 떠오르면`, clearTitle: '🎉 2편 「시내산의 마지막 한 달」을 모두 마쳤어요! 두 번째 받침대에 은 나팔 둘이 놓여요', next: '3편 「광야 40년」 (준비 중)',
        steps: [
          { id: 'lv10s1', zone: 'sinai', obj: '아론의 축복 듣기', where: '회막 문 앞의 아론', npc: 'aaron', dlg: 'lv_bless', """ + PL + """ },
          { id: 'lv10s2', zone: 'sinai', obj: '모세에게 가기 — 지휘관들의 헌물', where: '회막 문 앞의 모세', npc: 'moses', dlg: 'lv_gifts' },
          { id: 'lv10s3', zone: 'sinai', obj: '유월절을 지키지 못한 사람들 곁으로', where: '회막 문 곁의 부정하게 된 사람', npc: 'lv_unclean', dlg: 'lv_passover2' },
          { id: 'lv10s4', zone: 'sinai', obj: '은 나팔 소리 알아듣기', where: '회막 문 앞의 모세', npc: 'moses', game: 'trumpet' },
          { id: 'lv10s5', zone: 'sinai', obj: '구름이 떠오르는 것 보기', where: '성막 뜰 동쪽 문(빛나는 곳)', point: 'lv_door', dlg: 'lv_depart', reward: { verse: ['nu6-24', 'nu9-18'], clear: true } },
        ] },
    ],""")
rep("""    games: { pick: pickGame, sort: sortGame, robe: robeGame, seven: sevenGame, bow: bowGame },
    events: { lvFire: fireEvent },""", """    games: { pick: pickGame, sort: sortGame, robe: robeGame, seven: sevenGame, bow: bowGame, field: fieldGame, calendar: calendarGame, camp: campGame, trumpet: trumpetGame },
    events: { lvFire: fireEvent, strangeFire, goatGo, cloudUp, shofar },
    world,""")
open(p, 'w', encoding='utf-8').write(s)
print('ok', len(s))
