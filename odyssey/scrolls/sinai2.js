// 2편 「시내산의 마지막 한 달」 — 레위기 + 민수기 1–10장. 1~10장 전체(2026-09-27 5~10장 추가).
// 대사 원칙: 성경 인물은 개역개정에 있는 자기 말만, 해설은 원문 + (출처). 2026-09-27 bskorea 원문 대조.
// 새 인물 이미지(제사장 넷·대제사장 아론·수소·염소)는 GPT 9차 요청 중 — 오기 전까지 이미 있는 모델을 씀.
(window.__odyQ = window.__odyQ || []).push(api => {
  const { DLG, ZONES, CONDS, VERSES, THREE, SPEAKERS: { NAR, MOSES, AARON } } = api;
  const PEOPLE = { n: '백성' };
  const cur = () => api.ST.cur === 'sinai2' && api.ST.sp.sinai2 ? api.ST.sp.sinai2 : null;
  const DOOR = [13.4, -15], ALTAR = [8.2, -15], BRONZE = [6, -15];   // 뜰 문(동쪽) · 번제단 앞자리 · 번제단(성막 T.x1+6)
  CONDS.lvPriests = () => { const p = cur(); return !!p && p.ch >= 2; };   // 3장(위임식)부터 — "아론과 그의 아들들과 함께"(레 8:2)
  CONDS.lvOn = () => !!cur();
  // 나답·아비후는 5장 「다른 불」(레 10:1-2) 둘째 단계부터 보이지 않음
  CONDS.lvNA = () => { const p = cur(); return !!p && p.ch >= 2 && (p.ch < 4 || (p.ch === 4 && p.step < 1)); };
  const onCh = n => () => { const p = cur(); return !!p && p.ch === n; };
  CONDS.lv6 = onCh(5); CONDS.lv7 = onCh(6); CONDS.lv8 = onCh(7); CONDS.lv10 = onCh(9);
  CONDS.lv9up = () => { const p = cur(); return !!p && p.ch >= 8; };
  ZONES.sinai.points.push({ id: 'lv_door', x: DOOR[0], z: DOOR[1], type: 'lore', title: '회막 문', cond: 'lvOn', body: '' });
  ZONES.sinai.points.push({ id: 'lv_altar', x: ALTAR[0], z: ALTAR[1], type: 'lore', title: '번제단', cond: 'lvOn', body: '' });
  // 아론의 아들들(레 8:13) — 새 모델이 오기 전까지 레위인 모델
  ZONES.sinai.points.push({ id: 'lv_nadab', x: 15.8, z: -11.6, type: 'villager', title: '나답', model: 'he-levite', persona: 'rs_static', cond: 'lvNA', body: '' });
  ZONES.sinai.points.push({ id: 'lv_abihu', x: 16.6, z: -13, type: 'villager', title: '아비후', model: 'he-levite', persona: 'rs_static', cond: 'lvNA', body: '' });
  ZONES.sinai.points.push({ id: 'lv_eleazar', x: 16.6, z: -17, type: 'villager', title: '엘르아살', model: 'he-levite', persona: 'rs_static', cond: 'lvPriests', body: '' });
  ZONES.sinai.points.push({ id: 'lv_ithamar', x: 15.8, z: -18.4, type: 'villager', title: '이다말', model: 'he-levite', persona: 'rs_static', cond: 'lvPriests', body: '' });
  const WILD = [30, 4], FIELD = [24, 12], BOOTH = [-6, 11];   // 진 밖 광야(동쪽) · 밭 · 초막
  ZONES.sinai.points.push({ id: 'lv_field', x: FIELD[0], z: FIELD[1], type: 'lore', title: '밭 모퉁이', cond: 'lv6', body: '' });
  ZONES.sinai.points.push({ id: 'lv_fitman', x: WILD[0] + 1.2, z: WILD[1] + 0.8, type: 'villager', title: '미리 정한 사람', model: 'he-father', persona: 'rs_static', cond: 'lv7', body: '' });
  ZONES.sinai.points.push({ id: 'lv_booth', x: BOOTH[0], z: BOOTH[1], type: 'lore', title: '초막', cond: 'lv8', body: '' });
  ZONES.sinai.points.push({ id: 'lv_banner', x: -3.5, z: 4.2, type: 'villager', title: '군기 든 사람', model: 'ca-banner-bearer', persona: 'rs_static', cond: 'lv9up', body: '' });
  ZONES.sinai.points.push({ id: 'lv_levite', x: 17.5, z: -9.5, type: 'villager', title: '레위인', model: 'he-levite', persona: 'rs_static', cond: 'lv9up', body: '' });
  ZONES.sinai.points.push({ id: 'lv_unclean', x: 19, z: -14.2, type: 'villager', title: '부정하게 된 사람', model: 'he-grandpa', persona: 'rs_static', cond: 'lv10', body: '' });

  Object.assign(VERSES, {
    'lv1-4': { ref: '레위기 1:4', text: '그는 번제물의 머리에 안수할지니 그를 위하여 기쁘게 받으심이 되어 그를 위하여 속죄가 될 것이라' },
    'lv7-37': { ref: '레위기 7:37', text: '이는 번제와 소제와 속죄제와 속건제와 위임식과 화목제의 규례라' },
    'lv8-36': { ref: '레위기 8:36', text: '아론과 그의 아들들이 여호와께서 모세를 통하여 명령하신 모든 일을 준행하니라' },
    'lv9-24': { ref: '레위기 9:24', text: '불이 여호와 앞에서 나와 제단 위의 번제물과 기름을 사른지라 온 백성이 이를 보고 소리 지르며 엎드렸더라' },
    'lv10-3': { ref: '레위기 10:3', text: '모세가 아론에게 이르되 이는 여호와의 말씀이라 이르시기를 나는 나를 가까이 하는 자 중에서 내 거룩함을 나타내겠고 온 백성 앞에서 내 영광을 나타내리라 하셨느니라 아론이 잠잠하니' },
    'lv19-18': { ref: '레위기 19:18', text: '원수를 갚지 말며 동포를 원망하지 말며 네 이웃 사랑하기를 네 자신과 같이 사랑하라 나는 여호와이니라' },
    'lv16-30': { ref: '레위기 16:30', text: '이 날에 너희를 위하여 속죄하여 너희를 정결하게 하리니 너희의 모든 죄에서 너희가 여호와 앞에 정결하리라' },
    'lv23-2': { ref: '레위기 23:2', text: '이스라엘 자손에게 말하여 이르라 이것이 나의 절기들이니 너희가 성회로 공포할 여호와의 절기들이니라' },
    'lv25-10': { ref: '레위기 25:10', text: '너희는 오십 년째 해를 거룩하게 하여 그 땅에 있는 모든 주민을 위하여 자유를 공포하라 이 해는 너희에게 희년이니 너희는 각각 자기의 소유지로 돌아가며 각각 자기의 가족에게로 돌아갈지며' },
    'nu2-2': { ref: '민수기 2:2', text: '이스라엘 자손은 각각 자기의 진영의 군기와 자기의 조상의 가문의 기호 곁에 진을 치되 회막을 향하여 사방으로 치라' },
    'nu6-24': { ref: '민수기 6:24-26', text: '여호와는 네게 복을 주시고 너를 지키시기를 원하며 여호와는 그의 얼굴을 네게 비추사 은혜 베푸시기를 원하며 여호와는 그 얼굴을 네게로 향하여 드사 평강 주시기를 원하노라' },
    'nu9-18': { ref: '민수기 9:18', text: '이스라엘 자손이 여호와의 명령을 따라 행진하였고 여호와의 명령을 따라 진을 쳤으며 구름이 성막 위에 머무는 동안에는 그들이 진영에 머물렀고' },
  });
  Object.assign(DLG, {
    // 1장
    lv_call: [
      [NAR, '여호와께서 회막에서 모세를 부르시고 그에게 말씀하여 이르시되 (레 1:1)'],
      [NAR, '이스라엘 자손에게 말하여 이르라 너희 중에 누구든지 여호와께 예물을 드리려거든 가축 중에서 소나 양으로 예물을 드릴지니라 (레 1:2)'],
      [NAR, '만일 그 예물이 가축 떼의 양이나 염소의 번제이면 흠 없는 수컷으로 드릴지니 (레 1:10)'],
      [NAR, '▶ 가축 떼 가운데에서 흠 없는 수컷을 골라요.'],
    ],
    lv_door: [
      [NAR, '그 예물이 소의 번제이면 흠 없는 수컷으로 회막 문에서 여호와 앞에 기쁘게 받으시도록 드릴지니라 (레 1:3)'],
      [NAR, '그는 번제물의 머리에 안수할지니 그를 위하여 기쁘게 받으심이 되어 그를 위하여 속죄가 될 것이라 (레 1:4)'],
    ],
    // 2장
    lv_offerings: [
      [NAR, '누구든지 소제의 예물을 여호와께 드리려거든 고운 가루로 예물을 삼아 그 위에 기름을 붓고 또 그 위에 유향을 놓아 (레 2:1)'],
      [NAR, '사람이 만일 화목제의 제물을 예물로 드리되 소로 드리려면 수컷이나 암컷이나 흠 없는 것으로 여호와 앞에 드릴지니 (레 3:1)'],
      [NAR, '만일 평민의 한 사람이 여호와의 계명 중 하나라도 부지중에 범하여 허물이 있었는데 (레 4:27)'],
      [NAR, '그가 범한 죄를 누가 그에게 깨우쳐 주면 그는 흠 없는 암염소를 끌고 와서 그 범한 죄로 말미암아 그것을 예물로 삼아 (레 4:28)'],
      [NAR, '그 모든 기름을 화목제물의 기름을 떼어낸 것 같이 떼어내 제단 위에서 불살라 여호와께 향기롭게 할지니 제사장이 그를 위하여 속죄한즉 그가 사함을 받으리라 (레 4:31)'],
      [NAR, '▶ 예물마다 어떤 제사인지 나눠 보세요.'],
    ],
    lv_laws: [
      [NAR, '이는 번제와 소제와 속죄제와 속건제와 위임식과 화목제의 규례라 (레 7:37)'],
      [NAR, '여호와께서 시내 광야에서 이스라엘 자손에게 그 예물을 여호와께 드리라 명령하신 날에 시내 산에서 이같이 모세에게 명령하셨더라 (레 7:38)'],
    ],
    // 3장
    lv_gather: [
      [NAR, '여호와께서 모세에게 말씀하여 이르시되 (레 8:1)'],
      [NAR, '너는 아론과 그의 아들들과 함께 그 의복과 관유와 속죄제의 수송아지와 숫양 두 마리와 무교병 한 광주리를 가지고 (레 8:2)'],
      [NAR, '온 회중을 회막 문에 모으라 (레 8:3)'],
      [NAR, '모세가 여호와께서 자기에게 명령하신 대로 하매 회중이 회막 문에 모인지라 (레 8:4)'],
      [NAR, '모세가 회중에게 이르되 (레 8:5)'],
      [MOSES, '여호와께서 행하라고 명령하신 것이 이러하니라'],
    ],
    lv_robe_intro: [
      [NAR, '모세가 아론과 그의 아들들을 데려다가 물로 그들을 씻기고 (레 8:6)'],
      [NAR, '▶ 아론에게 입힐 옷을 순서대로 골라요.'],
    ],
    lv_robe_done: [
      [NAR, '아론에게 속옷을 입히며 띠를 띠우고 겉옷을 입히며 에봇을 걸쳐 입히고 에봇의 장식 띠를 띠워서 에봇을 몸에 매고 (레 8:7)'],
      [NAR, '흉패를 붙이고 흉패에 우림과 둠밈을 넣고 (레 8:8)'],
      [NAR, '그의 머리에 관을 씌우고 그 관 위 전면에 금 패를 붙이니 곧 거룩한 관이라 여호와께서 모세에게 명령하신 것과 같았더라 (레 8:9)'],
      [NAR, '모세가 관유를 가져다가 성막과 그 안에 있는 모든 것에 발라 거룩하게 하고 (레 8:10)'],
      [NAR, '또 관유를 아론의 머리에 붓고 그에게 발라 거룩하게 하고 (레 8:12)'],
      [NAR, '모세가 또 아론의 아들들을 데려다가 그들에게 속옷을 입히고 띠를 띠우며 관을 씌웠으니 여호와께서 모세에게 명령하신 것과 같았더라 (레 8:13)'],
    ],
    lv_seven: [
      [MOSES, '위임식은 이레 동안 행하나니 위임식이 끝나는 날까지 이레 동안은 회막 문에 나가지 말라'],
      [MOSES, '오늘 행한 것은 여호와께서 너희를 위하여 속죄하게 하시려고 명령하신 것이니'],
      [MOSES, '너희는 칠 주야를 회막 문에 머물면서 여호와께서 지키라고 하신 것을 지키라 그리하면 사망을 면하리라 내가 이같이 명령을 받았느니라'],
    ],
    lv_seven_done: [
      [NAR, '아론과 그의 아들들이 여호와께서 모세를 통하여 명령하신 모든 일을 준행하니라 (레 8:36)'],
    ],
    // 4장
    lv_eighth: [
      [NAR, '여덟째 날에 모세가 아론과 그의 아들들과 이스라엘 장로들을 불러다가 (레 9:1)'],
      [NAR, '아론에게 이르되 (레 9:2)'],
      [MOSES, '속죄제를 위하여 흠 없는 송아지를 가져오고 번제를 위하여 흠 없는 숫양을 여호와 앞에 가져다 드리고'],
      [NAR, '모세가 이르되 (레 9:6)'],
      [MOSES, '이는 여호와께서 너희에게 하라고 명령하신 것이니 여호와의 영광이 너희에게 나타나리라'],
    ],
    lv_aaron_altar: [
      [NAR, '모세가 또 아론에게 이르되 (레 9:7)'],
      [MOSES, '너는 제단에 나아가 네 속죄제와 네 번제를 드려서 너를 위하여, 백성을 위하여 속죄하고 또 백성의 예물을 드려서 그들을 위하여 속죄하되 여호와의 명령대로 하라'],
      [NAR, '아론이 백성을 향하여 손을 들어 축복함으로 속죄제와 번제와 화목제를 마치고 내려오니라 (레 9:22)'],
      [NAR, '▶ 번제단 앞으로 가요.'],
    ],
    lv_fire: [
      [NAR, '모세와 아론이 회막에 들어갔다가 나와서 백성에게 축복하매 여호와의 영광이 온 백성에게 나타나며 (레 9:23)'],
      { event: 'lvFire' },
      [NAR, '불이 여호와 앞에서 나와 제단 위의 번제물과 기름을 사른지라 온 백성이 이를 보고 소리 지르며 엎드렸더라 (레 9:24)'],
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
      [{ n: '부정하게 된 사람들' }, '우리가 사람의 시체로 말미암아 부정하게 되었거니와 우리를 금지하여 이스라엘 자손과 함께 정한 기일에 여호와께 헌물을 드리지 못하게 하심은 어찌함이니이까'],
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

  const { mgOpen, mgCloseAll, completeTask } = api;
  // 🏅 2편 배지(SQL claim_odyssey_achieve 키 badge-holy_people · badge-trumpet_follow, 2026-09-27)
  Object.assign(api.BADGES, { holy_people: { ico: '🌾', name: '거룩한 백성' }, trumpet_follow: { ico: '🎺', name: '나팔 소리를 따르는 사람' } });
  function giveBadge(k){ const S = api.ST; if (S.badges.includes(k)) return; S.badges.push(k); api.saveST(); setTimeout(() => api.toast(`${api.BADGES[k].ico} 배지 획득: ${api.BADGES[k].name}`, 2600), 900); }
  const btnCss = 'padding:8px 6px;border-radius:10px;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.08);color:#f5e9d0;font-size:13px';
  // 🐑 흠 없는 수컷 고르기(레 1:10, 22:22)
  function pickGame(q){
    const opts = [['🐏', '흠 없는 숫양', true], ['🐑', '눈 먼 숫양'], ['🐐', '다리가 상한 숫염소'], ['🐑', '흠 없는 암양'], ['🐏', '종기 있는 숫양'], ['🐐', '지체에 베임을 당한 숫염소']].sort(() => Math.random() - 0.5);
    mgOpen('🐑 흠 없는 수컷', '"만일 그 예물이 가축 떼의 양이나 염소의 번제이면 흠 없는 수컷으로 드릴지니" (레 1:10)');
    let msg = '';
    const draw = () => { api.mgArea.innerHTML = `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;padding:8px">${opts.map((o, i) => `<button data-pk="${i}" style="${btnCss}"><span style="font-size:26px">${o[0]}</span><br>${o[1]}</button>`).join('')}</div><div style="text-align:center;color:#ffd27a;font-weight:800;min-height:18px;padding:0 8px;font-size:12.5px">${msg}</div>`; };
    draw(); api.mgAct.textContent = '고르면 계속'; api.mgAct.disabled = true;
    let ok = false;
    api.mgArea.onclick = e => { const b = e.target.closest('[data-pk]'); if (!b || ok) return; const o = opts[+b.dataset.pk];
      if (o[2]){ ok = true; msg = '✓ 흠 없는 수컷이에요'; api.mgAct.disabled = false; api.mgAct.textContent = '회막 문으로'; }
      else msg = '"흠 있는 것은 무엇이나 너희가 드리지 말 것은 그것이 기쁘게 받으심이 되지 못할 것임이니라" (레 22:20)';
      draw(); };
    api.mgAct.onclick = () => { if (!ok) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
    api.mg.onClose = () => { api.mgArea.onclick = null; };
  }
  // 🗂 예물 나누기(레 1–5장, 7:37)
  function sortGame(q){
    const KINDS = ['번제', '소제', '화목제', '속죄제', '속건제'];
    const CARDS = [
      ['흠 없는 수컷으로 회막 문에서 여호와 앞에 기쁘게 받으시도록 드릴지니라 (레 1:3)', '번제'],
      ['고운 가루로 예물을 삼아 그 위에 기름을 붓고 또 그 위에 유향을 놓아 (레 2:1)', '소제'],
      ['수컷이나 암컷이나 흠 없는 것으로 여호와 앞에 드릴지니 (레 3:1)', '화목제'],
      ['흠 없는 암염소를 끌고 와서 그 범한 죄로 말미암아 그것을 예물로 삼아 (레 4:28)', '속죄제'],
      ['성소의 세겔로 몇 세겔 은에 상당한 흠 없는 숫양을 양 떼 중에서 끌어다가 (레 5:15)', '속건제'],
    ].sort(() => Math.random() - 0.5);
    let i = 0, msg = '';
    mgOpen('🗂 여러 가지 예물', '예물 설명을 읽고 어떤 제사인지 골라요. "이는 번제와 소제와 속죄제와 속건제와 위임식과 화목제의 규례라" (레 7:37)');
    const draw = () => {
      api.mgArea.innerHTML = i < CARDS.length
        ? `<div style="padding:10px 12px;font-size:13.5px;line-height:1.5;min-height:60px">📜 ${CARDS[i][0]}</div><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:5px;padding:0 8px">${KINDS.map(k => `<button data-kd="${k}" style="${btnCss}">${k}</button>`).join('')}</div><div style="text-align:center;color:#ffd27a;font-weight:800;min-height:18px;margin-top:6px">${msg || `${i + 1} / ${CARDS.length}`}</div>`
        : `<div style="padding:16px;text-align:center;color:#ffd27a;font-weight:800">✓ 다섯 가지 예물을 모두 나눴어요</div>`;
      api.mgAct.textContent = i < CARDS.length ? '다 나누면 계속' : '계속'; api.mgAct.disabled = i < CARDS.length;
    };
    draw();
    api.mgArea.onclick = e => { const b = e.target.closest('[data-kd]'); if (!b || i >= CARDS.length) return;
      if (b.dataset.kd === CARDS[i][1]){ i++; msg = '✓ 맞아요'; } else msg = '다시 읽어 보세요'; draw(); setTimeout(() => { msg = ''; if (api.mgArea.querySelector('[data-kd]')) draw(); }, 700); };
    api.mgAct.onclick = () => { if (i < CARDS.length) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
    api.mg.onClose = () => { api.mgArea.onclick = null; };
  }
  // 👘 대제사장의 옷 순서대로(레 8:7-9)
  function robeGame(q){
    const ORDER = ['속옷', '띠', '겉옷', '에봇', '에봇의 장식 띠', '흉패', '관', '금 패'];
    const shown = ORDER.map((t, i) => i).sort(() => Math.random() - 0.5);
    let next = 0, msg = '';
    api.runDialog(DLG.lv_robe_intro, () => {
      mgOpen('👘 아론의 옷', '"아론에게 속옷을 입히며 …" (레 8:7-9) — 입히는 순서대로 눌러요.');
      const draw = () => {
        api.mgArea.innerHTML = `<div style="padding:8px 12px;font-size:13px;min-height:22px">입힌 것: ${ORDER.slice(0, next).join(' → ') || '—'}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;padding:0 10px">${shown.filter(i => i >= next).map(i => `<button data-rb="${i}" style="${btnCss}">${ORDER[i]}</button>`).join('')}</div><div style="text-align:center;color:#ffd27a;font-weight:800;min-height:18px;margin-top:6px">${msg || (next < ORDER.length ? `${next + 1}번째는?` : '✓ 모두 입혔어요')}</div>`;
        api.mgAct.textContent = next < ORDER.length ? '다 입히면 계속' : '계속'; api.mgAct.disabled = next < ORDER.length;
      };
      draw();
      api.mgArea.onclick = e => { const b = e.target.closest('[data-rb]'); if (!b) return; const i = +b.dataset.rb;
        if (i === next){ next++; msg = ''; } else msg = '성경에 적힌 순서를 떠올려 봐요'; draw(); };
      api.mgAct.onclick = () => { if (next < ORDER.length) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; };
    }, null, 'lv_robe_intro');
  }
  // 🗓 이레 동안 회막 문에(레 8:33-35)
  function sevenGame(q){ api.runDialog(DLG.lv_seven, () => sevenMg(q), null, 'lv_seven'); }
  function sevenMg(q){
    const DAYS = ['첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째', '일곱째'];
    let d = 0;
    mgOpen('🗓 위임식 이레', '"너희는 칠 주야를 회막 문에 머물면서 여호와께서 지키라고 하신 것을 지키라" (레 8:35)');
    const draw = () => { api.mgArea.innerHTML = `<div style="display:flex;gap:4px;justify-content:center;padding:14px 6px">${DAYS.map((x, i) => `<div style="width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;${i < d ? 'background:#ffd27a;color:#2a1d10' : 'background:rgba(255,255,255,.08)'}">${i + 1}</div>`).join('')}</div><div style="text-align:center;color:#ffd27a;font-weight:800">${d < 7 ? `${DAYS[d]} 날 — 회막 문에 머물러요` : '✓ 이레를 모두 지켰어요'}</div>`;
      api.mgAct.textContent = d < 7 ? '🌙 하루 지나기' : '계속'; };
    draw();
    api.mgAct.onclick = () => { if (d < 7){ d++; draw(); return; } mgCloseAll(); completeTask(q); };
  }
  // 🔥 여호와의 불(레 9:23-24) → 엎드리기
  let fireObj = null;
  function fireEvent(){
    if (fireObj){ fireObj.parent && fireObj.parent.remove(fireObj); fireObj = null; }
    const [x, z] = BRONZE, y = api.heightAt(x, z) + 1.1, g = new THREE.Group();
    for (let i = 0; i < 7; i++){ const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: api.flameTex, color: i % 2 ? 0xffd27a : 0xff8a3a, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.9 }));
      s.position.set(x + (Math.random() - 0.5) * 0.9, y + Math.random() * 0.8, z + (Math.random() - 0.5) * 0.9); s.scale.set(1.2 + Math.random(), 1.8 + Math.random(), 1); g.add(s); }
    api.zoneRoot.add(g); fireObj = g;
    try { api.startCine('lvFire', x, y, z, { r: 9, h: 4, dur: 4.5, spin: 0.5 }); } catch (e){}
    setTimeout(() => { if (fireObj === g){ g.parent && g.parent.remove(g); fireObj = null; } }, 9000);
  }
  function bowGame(q){
    api.runDialog(DLG.lv_fire, () => {
      mgOpen('🙇 엎드리기', '"온 백성이 이를 보고 소리 지르며 엎드렸더라" (레 9:24)');
      api.mgArea.innerHTML = '<div style="padding:18px;text-align:center;font-size:40px">🔥</div>';
      api.mgAct.textContent = '🙇 엎드리기';
      api.mgAct.onclick = () => { mgCloseAll(); completeTask(q); };
    }, null, 'lv_fire');
  }

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
      let cut = new Set(), msg = '', slip = false;
      const need = () => [...Array(N * N).keys()].filter(i => !keep.has(i) && !fallen.has(i));
      mgOpen('🌾 밭 모퉁이', '"밭 모퉁이까지 다 거두지 말고 네 떨어진 이삭도 줍지 말며" (레 19:9) — 곡식을 눌러 거둬요.');
      const draw = () => {
        const done = need().every(i => cut.has(i));
        api.mgArea.innerHTML = `<div style="display:grid;grid-template-columns:repeat(${N},1fr);gap:4px;padding:8px 14px">${[...Array(N * N).keys()].map(i => `<button data-fd="${i}" style="${btnCss};font-size:22px;padding:6px 0;${keep.has(i) ? 'box-shadow:inset 0 0 0 2px rgba(255,210,122,.55)' : ''}">${cut.has(i) ? '·' : fallen.has(i) ? '🌿' : '🌾'}</button>`).join('')}</div><div style="text-align:center;color:#ffd27a;font-weight:800;min-height:18px;padding:0 8px;font-size:12.5px">${msg || (done ? '✓ 모퉁이와 떨어진 이삭을 남기고 다 거뒀어요' : `거둔 곡식 ${need().filter(i => cut.has(i)).length} / ${need().length} · 테두리 칸은 모퉁이, 🌿는 떨어진 이삭`)}</div>`;
        api.mgAct.textContent = done ? '계속' : '다 거두면 계속'; api.mgAct.disabled = !done;
      };
      draw();
      api.mgArea.onclick = e => { const b = e.target.closest('[data-fd]'); if (!b) return; const i = +b.dataset.fd;
        if (keep.has(i) || fallen.has(i)){ slip = true; cut = new Set(); msg = '"가난한 사람과 거류민을 위하여 버려두라" (레 19:10) — 처음부터 다시 거둬요'; }
        else { cut.add(i); msg = ''; }
        draw(); };
      api.mgAct.onclick = () => { if (!need().every(i => cut.has(i))) return; api.mgArea.onclick = null; mgCloseAll(); if (!slip) giveBadge('holy_people'); completeTask(q); };
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
      let k = 0, msg = '', wait = false, miss = false;
      mgOpen('🎺 은 나팔 둘', '"그것으로 회중을 소집하며 진영을 출발하게 할 것이라" (민 10:2) — 소리를 듣고 누가 움직이는지 골라요.');
      const draw = () => { const r = R[k];
        api.mgArea.innerHTML = (r ? `<div style="text-align:center;padding:10px"><button data-tp="again" style="${btnCss};font-size:15px">${r[1]} · 🔊 다시 듣기</button></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;padding:0 10px">${WHO.map((w, i) => `<button data-tw="${i}" style="${btnCss}">${w}</button>`).join('')}</div>` : `<div style="padding:16px;text-align:center;font-size:30px">🎺🎺</div>`)
          + `<div data-tmsg style="text-align:center;color:#ffd27a;font-weight:800;min-height:18px;padding:6px 10px;font-size:12px">${msg || (r ? `${k + 1} / 4` : '✓ 나팔 소리를 모두 알아들었어요')}</div>`;
        api.mgAct.textContent = r ? '다 맞히면 계속' : '계속'; api.mgAct.disabled = !!r;
        if (r) blast(r[0]); };
      draw();
      api.mgArea.onclick = e => { const r = R[k]; if (!r) return;
        if (e.target.closest('[data-tp]')){ blast(r[0]); return; }
        const b = e.target.closest('[data-tw]'); if (!b) return;
        if (wait) return;
        const d = api.mgArea.querySelector('[data-tmsg]');
        if (+b.dataset.tw === r[2]){ wait = true; if (d) d.textContent = '✓ ' + r[3]; setTimeout(() => { wait = false; k++; draw(); }, 1800); }
        else { miss = true; if (d) d.textContent = '소리를 다시 들어 보세요'; } };
      api.mgAct.onclick = () => { if (k < 4) return; api.mgArea.onclick = null; mgCloseAll(); if (!miss) giveBadge('trumpet_follow'); completeTask(q); };
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
  const T = n => `📜 시내산의 마지막 한 달 ${n}장`;
  return {
    id: 'sinai2',
    chapters: [
      { title: `${T(1)} — 회막에서 부르심`, clearTitle: '🎉 2편 1장 「회막에서 부르심」 완료!', next: '2장: 여러 가지 예물',
        steps: [
          { id: 'lv1s1', zone: 'sinai', obj: '회막 앞의 모세에게 가기', where: '성막 뜰 동쪽 문 앞', npc: 'moses', dlg: 'lv_call', place: { moses: [15, -13.2], aaron: [15, -16.8] } },
          { id: 'lv1s2', zone: 'sinai', obj: '흠 없는 수컷 고르기', where: '회막 앞의 모세', npc: 'moses', game: 'pick' },
          { id: 'lv1s3', zone: 'sinai', obj: '회막 문으로 예물 가져가기', where: '성막 뜰 동쪽 문(빛나는 곳)', point: 'lv_door', dlg: 'lv_door', reward: { verse: 'lv1-4', clear: true } },
        ] },
      { title: `${T(2)} — 여러 가지 예물`, clearTitle: '🎉 2편 2장 「여러 가지 예물」 완료!', next: '3장: 위임식 이레',
        steps: [
          { id: 'lv2s1', zone: 'sinai', obj: '아론에게 예물의 규례 듣기', where: '회막 문 앞의 아론', npc: 'aaron', dlg: 'lv_offerings', place: { moses: [15, -13.2], aaron: [15, -16.8] } },
          { id: 'lv2s2', zone: 'sinai', obj: '예물마다 어떤 제사인지 나누기', where: '회막 문 앞의 아론', npc: 'aaron', game: 'sort' },
          { id: 'lv2s3', zone: 'sinai', obj: '모세에게 가기 — 시내 산에서 명령하신 규례', where: '회막 문 앞의 모세', npc: 'moses', dlg: 'lv_laws', reward: { verse: 'lv7-37', clear: true } },
        ] },
      { title: `${T(3)} — 위임식 이레`, clearTitle: '🎉 2편 3장 「위임식 이레」 완료!', next: '4장: 여호와의 불',
        steps: [
          { id: 'lv3s1', zone: 'sinai', obj: '회막 문에 모인 회중 곁으로', where: '회막 문 앞의 모세', npc: 'moses', dlg: 'lv_gather', place: { moses: [15, -13.2], aaron: [15, -16.8] } },
          { id: 'lv3s2', zone: 'sinai', obj: '아론에게 옷을 순서대로 입히기', where: '회막 문 앞의 아론', npc: 'aaron', game: 'robe', doneDlg: 'lv_robe_done' },
          { id: 'lv3s3', zone: 'sinai', obj: '이레 동안 회막 문에 머물기', where: '회막 문(빛나는 곳)', point: 'lv_door', game: 'seven', doneDlg: 'lv_seven_done', reward: { verse: 'lv8-36', clear: true } },
        ] },
      { title: `${T(4)} — 여호와의 불`, clearTitle: '🎉 2편 4장 「여호와의 불」 완료!', next: '5장: 다른 불',
        steps: [
          { id: 'lv4s1', zone: 'sinai', obj: '여덟째 날 — 모세의 말 듣기', where: '회막 문 앞의 모세', npc: 'moses', dlg: 'lv_eighth', place: { moses: [15, -13.2], aaron: [15, -16.8] } },
          { id: 'lv4s2', zone: 'sinai', obj: '제단에 나아가는 아론 곁으로', where: '회막 문 앞의 아론', npc: 'aaron', dlg: 'lv_aaron_altar' },
          { id: 'lv4s3', zone: 'sinai', obj: '번제단 앞에서 여호와의 영광 보기', where: '성막 뜰 안 번제단(빛나는 곳)', point: 'lv_altar', game: 'bow', reward: { verse: 'lv9-24', clear: true } },
        ] },
      { title: `${T(5)} — 다른 불`, clearTitle: '🎉 2편 5장 「다른 불」 완료!', next: '6장: 거룩한 백성',
        steps: [
          { id: 'lv5s1', zone: 'sinai', obj: '회막 문 앞으로 가기', where: '성막 뜰 동쪽 문(빛나는 곳)', point: 'lv_door', dlg: 'lv_strange1', place: { moses: [15, -13.2], aaron: [15, -16.8] } },
          { id: 'lv5s2', zone: 'sinai', obj: '번제단 앞에서 보기', where: '성막 뜰 안 번제단(빛나는 곳)', point: 'lv_altar', dlg: 'lv_strange2' },
          { id: 'lv5s3', zone: 'sinai', obj: '모세의 말 듣기', where: '회막 문 앞의 모세', npc: 'moses', dlg: 'lv_strange3', reward: { verse: 'lv10-3', clear: true } },
        ] },
      { title: `${T(6)} — 거룩한 백성`, clearTitle: '🎉 2편 6장 「거룩한 백성」 완료!', next: '7장: 대속죄일',
        steps: [
          { id: 'lv6s1', zone: 'sinai', obj: '모세에게 가기 — 너희는 거룩하라', where: '회막 문 앞의 모세', npc: 'moses', dlg: 'lv_holy', place: { moses: [15, -13.2], aaron: [15, -16.8] } },
          { id: 'lv6s2', zone: 'sinai', obj: '밭 모퉁이와 떨어진 이삭 남기기', where: '진영 동쪽의 밭(빛나는 곳)', point: 'lv_field', game: 'field', doneDlg: 'lv_field_done' },
          { id: 'lv6s3', zone: 'sinai', obj: '아론에게 가기 — 네 이웃을 사랑하라', where: '회막 문 앞의 아론', npc: 'aaron', dlg: 'lv_neighbor', reward: { verse: 'lv19-18', clear: true } },
        ] },
      { title: `${T(7)} — 대속죄일`, clearTitle: '🎉 2편 7장 「대속죄일」 완료!', next: '8장: 여호와의 절기',
        steps: [
          { id: 'lv7s1', zone: 'sinai', obj: '아론 곁으로 — 일곱째 달 십일', where: '회막 문 앞의 아론', npc: 'aaron', dlg: 'lv_atone1', place: { moses: [15, -13.2], aaron: [15, -16.8] } },
          { id: 'lv7s2', zone: 'sinai', obj: '광야로 가는 염소 따라가기', where: '진 밖 동쪽 광야의 미리 정한 사람', npc: 'lv_fitman', dlg: 'lv_atone2' },
          { id: 'lv7s3', zone: 'sinai', obj: '모세에게 돌아가기', where: '회막 문 앞의 모세', npc: 'moses', dlg: 'lv_atone3', reward: { verse: 'lv16-30', clear: true } },
        ] },
      { title: `${T(8)} — 여호와의 절기`, clearTitle: '🎉 2편 8장 「여호와의 절기」 완료!', next: '9장: 진영과 지파',
        steps: [
          { id: 'lv8s1', zone: 'sinai', obj: '모세에게 절기 듣기', where: '회막 문 앞의 모세', npc: 'moses', dlg: 'lv_feasts', place: { moses: [15, -13.2], aaron: [15, -16.8] } },
          { id: 'lv8s2', zone: 'sinai', obj: '절기를 한 해의 차례대로 놓기', where: '회막 문 앞의 모세', npc: 'moses', game: 'calendar' },
          { id: 'lv8s3', zone: 'sinai', obj: '초막에 가 보기', where: '진영 서쪽의 초막(빛나는 곳)', point: 'lv_booth', dlg: 'lv_booth' },
          { id: 'lv8s4', zone: 'sinai', obj: '아론에게 가기 — 희년의 나팔', where: '회막 문 앞의 아론', npc: 'aaron', dlg: 'lv_jubilee', reward: { verse: ['lv23-2', 'lv25-10'], clear: true } },
        ] },
      { title: `${T(9)} — 진영과 지파`, clearTitle: '🎉 2편 9장 「진영과 지파」 완료!', next: '10장: 구름이 떠오르면',
        steps: [
          { id: 'lv9s1', zone: 'sinai', obj: '모세에게 가기 — 둘째 해 둘째 달 첫째 날', where: '회막 문 앞의 모세', npc: 'moses', dlg: 'lv_count', place: { moses: [15, -13.2], aaron: [15, -16.8] } },
          { id: 'lv9s2', zone: 'sinai', obj: '열두 지파의 군기 세우기', where: '진영 한가운데의 군기 든 사람', npc: 'lv_banner', game: 'camp', doneDlg: 'lv_camp_done' },
          { id: 'lv9s3', zone: 'sinai', obj: '레위인에게 가기', where: '성막 뜰 동쪽의 레위인', npc: 'lv_levite', dlg: 'lv_levites', reward: { verse: 'nu2-2', clear: true } },
        ] },
      { title: `${T(10)} — 구름이 떠오르면`, clearTitle: '🎉 2편 「시내산의 마지막 한 달」을 모두 마쳤어요! 두 번째 받침대에 은 나팔 둘이 놓여요', next: '3편 「광야 40년」 (준비 중)',
        steps: [
          { id: 'lv10s1', zone: 'sinai', obj: '아론의 축복 듣기', where: '회막 문 앞의 아론', npc: 'aaron', dlg: 'lv_bless', place: { moses: [15, -13.2], aaron: [15, -16.8] } },
          { id: 'lv10s2', zone: 'sinai', obj: '모세에게 가기 — 지휘관들의 헌물', where: '회막 문 앞의 모세', npc: 'moses', dlg: 'lv_gifts' },
          { id: 'lv10s3', zone: 'sinai', obj: '유월절을 지키지 못한 사람들 곁으로', where: '회막 문 곁의 부정하게 된 사람', npc: 'lv_unclean', dlg: 'lv_passover2' },
          { id: 'lv10s4', zone: 'sinai', obj: '은 나팔 소리 알아듣기', where: '회막 문 앞의 모세', npc: 'moses', game: 'trumpet' },
          { id: 'lv10s5', zone: 'sinai', obj: '구름이 떠오르는 것 보기', where: '성막 뜰 동쪽 문(빛나는 곳)', point: 'lv_door', dlg: 'lv_depart', reward: { verse: ['nu6-24', 'nu9-18'], clear: true } },
        ] },
    ],
    games: { pick: pickGame, sort: sortGame, robe: robeGame, seven: sevenGame, bow: bowGame, field: fieldGame, calendar: calendarGame, camp: campGame, trumpet: trumpetGame },
    events: { lvFire: fireEvent, strangeFire, goatGo, cloudUp, shofar },
    world,
  };
});
