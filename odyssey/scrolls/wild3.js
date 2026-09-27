// 3편 「광야 40년」 — 민수기 10:29–36장 + 신명기. 지금은 1~5장(민 10:29–14:34, 바란 광야 가데스)까지.
// 대사 원칙: 성경 인물은 개역개정에 있는 자기 말만, 해설은 원문 + (출처). 2026-09-27 bskorea 원문 대조.
// 표현: 2026-09-27 전도사님 "절제 안해도 될 것 같아" — 장면은 보여 주되 피·잔혹한 묘사는 넣지 않는다.
// 새 인물(갈렙·호밥 등)은 GPT/Meshy 모델이 오기 전까지 이미 있는 모델을 쓴다.
(window.__odyQ = window.__odyQ || []).push(api => {
  const { DLG, ZONES, CONDS, VERSES, THREE, SPEAKERS: { NAR, MOSES, AARON } } = api;
  const JOSHUA = { n: '여호수아' }, YOUTH = { n: '한 소년' }, MA = { n: '미리암과 아론' }, PEOPLE = { n: '백성' },
    SCOUTS = { n: '정탐꾼들' }, CALEB = { n: '갈렙' }, CROWD = { n: '온 회중' }, JC = { n: '여호수아와 갈렙' };
  const cur = () => api.ST.cur === 'wild3' && api.ST.sp.wild3 ? api.ST.sp.wild3 : null;
  const at = (ch, a = 0, b = 99) => () => { const p = cur(); return !!p && p.ch === ch && p.step >= a && p.step <= b; };
  const from = ch => () => { const p = cur(); return !!p && p.ch >= ch; };
  const DOOR = [13.4, -15], EDGE = [-31, -7], OUTSIDE = [-31, 20], ESHCOL = [33, 26], MEET = [0, 4], KQUAIL = [4, 18];
  Object.assign(CONDS, {
    w3On: () => !!cur(), w3c0: at(0), w3c1: at(1), w3c3: at(3), w3c34: () => { const p = cur(); return !!p && (p.ch === 3 || p.ch === 4); },
    w3from3: from(3), w3joshua: from(1),
    w3miriam: () => { const p = cur(); return !!p && !(p.ch === 2 && p.step >= 2 && p.step <= 3); },
    w3miriamOut: at(2, 2, 3), w3outside: at(2, 3, 3),
  });
  const Z3 = ZONES.kadesh.points;
  Z3.push({ id: 'kd_door', x: DOOR[0], z: DOOR[1], type: 'lore', title: '회막 문', cond: 'w3On', body: '' });
  Z3.push({ id: 'kd_hobab', x: -25.5, z: 6.5, type: 'villager', title: '호밥', model: 'merchant', persona: 'rs_static', cond: 'w3c0', body: '' });
  Z3.push({ id: 'kd_edge', x: EDGE[0], z: EDGE[1], type: 'lore', title: '진영 끝', cond: 'w3c1', body: '' });
  Z3.push({ id: 'kd_crowd', x: 2, z: 12, type: 'villager', title: '우는 백성', model: 'he-father', persona: 'rs_static', cond: 'w3c1', body: '' });
  Z3.push({ id: 'kd_quail', x: KQUAIL[0], z: KQUAIL[1], type: 'lore', title: '진영 곁', cond: 'w3c1', body: '' });
  Z3.push({ id: 'kd_joshua', x: 18.5, z: -10, type: 'villager', title: '여호수아', model: 'joshua', persona: 'rs_static', cond: 'w3joshua', body: '' });
  Z3.push({ id: 'kd_miriam', x: 17.5, z: -20.5, type: 'villager', title: '미리암', model: 'miriam', persona: 'rs_static', cond: 'w3miriam', body: '' });
  Z3.push({ id: 'kd_miriam_out', x: OUTSIDE[0] - 1.5, z: OUTSIDE[1] + 1, type: 'villager', title: '미리암', model: 'miriam', persona: 'rs_static', cond: 'w3miriamOut', body: '' });
  Z3.push({ id: 'kd_outside', x: OUTSIDE[0], z: OUTSIDE[1], type: 'lore', title: '진영 밖', cond: 'w3outside', body: '' });
  Z3.push({ id: 'kd_eshcol', x: ESHCOL[0], z: ESHCOL[1], type: 'lore', title: '에스골 골짜기로 가는 길', cond: 'w3c3', body: '' });
  Z3.push({ id: 'kd_meet', x: MEET[0], z: MEET[1], type: 'lore', title: '회중이 모인 곳', cond: 'w3c34', body: '' });
  Z3.push({ id: 'kd_caleb', x: 3.5, z: 1, type: 'villager', title: '갈렙', model: 'he-father', persona: 'rs_static', cond: 'w3from3', body: '' });
  Z3.push({ id: 'kd_scouts', x: -4.5, z: 2.5, type: 'villager', title: '열 정탐꾼', model: 'ca-craftsman', persona: 'rs_static', cond: 'w3c34', body: '' });

  Object.assign(VERSES, {
    'nu10-36': { ref: '민수기 10:36', text: '궤가 쉴 때에는 말하되 여호와여 이스라엘 종족들에게로 돌아오소서 하였더라' },
    'nu11-17': { ref: '민수기 11:17', text: '내가 강림하여 거기서 너와 말하고 네게 임한 영을 그들에게도 임하게 하리니 그들이 너와 함께 백성의 짐을 담당하고 너 혼자 담당하지 아니하리라' },
    'nu12-3': { ref: '민수기 12:3', text: '이 사람 모세는 온유함이 지면의 모든 사람보다 더하더라' },
    'nu13-27': { ref: '민수기 13:27', text: '모세에게 말하여 이르되 당신이 우리를 보낸 땅에 간즉 과연 그 땅에 젖과 꿀이 흐르는데 이것은 그 땅의 과일이니이다' },
    'nu14-9': { ref: '민수기 14:9', text: '다만 여호와를 거역하지는 말라 또 그 땅 백성을 두려워하지 말라 그들은 우리의 먹이라 그들의 보호자는 그들에게서 떠났고 여호와는 우리와 함께 하시느니라 그들을 두려워하지 말라 하나' },
  });

  Object.assign(DLG, {
    // 1장
    w3_hobab: [
      [NAR, '이스라엘 자손이 시내 광야에서 출발하여 자기 길을 가더니 바란 광야에 구름이 머무니라 (민 10:12)'],
      [NAR, '모세가 모세의 장인 미디안 사람 르우엘의 아들 호밥에게 이르되 (민 10:29)'],
      [MOSES, '여호와께서 주마 하신 곳으로 우리가 행진하나니 우리와 동행하자 그리하면 선대하리라 여호와께서 이스라엘에게 복을 내리리라 하셨느니라'],
    ],
    w3_march_intro: [
      [NAR, '그들이 진영을 떠날 때에 낮에는 여호와의 구름이 그 위에 덮였었더라 (민 10:34)'],
      [NAR, '▶ 구름이 떠오르면 걷고, 구름이 머물면 멈춰요.'],
    ],
    w3_rest: [
      [NAR, '궤가 쉴 때에는 말하되 (민 10:36)'],
      [MOSES, '여호와여 이스라엘 종족들에게로 돌아오소서'],
    ],
    // 2장
    w3_taberah: [
      [NAR, '여호와께서 들으시기에 백성이 악한 말로 원망하매 여호와께서 들으시고 진노하사 여호와의 불을 그들 중에 붙여서 진영 끝을 사르게 하시매 (민 11:1)'],
      { event: 'taberah' },
      [NAR, '백성이 모세에게 부르짖으므로 모세가 여호와께 기도하니 불이 꺼졌더라 (민 11:2)'],
      { event: 'fireOut' },
      [NAR, '그 곳 이름을 다베라라 불렀으니 이는 여호와의 불이 그들 중에 붙은 까닭이었더라 (민 11:3)'],
    ],
    w3_weep: [
      [NAR, '그들 중에 섞여 사는 다른 인종들이 탐욕을 품으매 이스라엘 자손도 다시 울며 이르되 (민 11:4)'],
      [PEOPLE, '누가 우리에게 고기를 주어 먹게 하랴'],
      [PEOPLE, '우리가 애굽에 있을 때에는 값없이 생선과 오이와 참외와 부추와 파와 마늘들을 먹은 것이 생각나거늘'],
      [PEOPLE, '이제는 우리의 기력이 다하여 이 만나 외에는 보이는 것이 아무 것도 없도다'],
    ],
    w3_elders_intro: [
      [NAR, '여호와께서 모세에게 이르시되 이스라엘 노인 중에 네가 알기로 백성의 장로와 지도자가 될 만한 자 칠십 명을 모아 내게 데리고 와 회막에 이르러 거기서 너와 함께 서게 하라 (민 11:16)'],
      [NAR, '내가 강림하여 거기서 너와 말하고 네게 임한 영을 그들에게도 임하게 하리니 그들이 너와 함께 백성의 짐을 담당하고 너 혼자 담당하지 아니하리라 (민 11:17)'],
      [NAR, '▶ 모세 혼자 지던 짐을 칠십 장로와 함께 나눠요.'],
    ],
    w3_spirit: [
      [NAR, '여호와께서 구름 가운데 강림하사 모세에게 말씀하시고 그에게 임한 영을 칠십 장로에게도 임하게 하시니 영이 임하신 때에 그들이 예언을 하다가 다시는 하지 아니하였더라 (민 11:25)'],
      [NAR, '그 기명된 자 중 엘닷이라 하는 자와 메닷이라 하는 자 두 사람이 진영에 머물고 장막에 나아가지 아니하였으나 그들에게도 영이 임하였으므로 진영에서 예언한지라 (민 11:26)'],
      [NAR, '한 소년이 달려와서 모세에게 전하여 이르되 (민 11:27)'],
      [YOUTH, '엘닷과 메닷이 진중에서 예언하나이다'],
      [NAR, '택한 자 중 한 사람 곧 모세를 섬기는 눈의 아들 여호수아가 말하여 이르되 (민 11:28)'],
      [JOSHUA, '내 주 모세여 그들을 말리소서'],
      [NAR, '모세가 그에게 이르되 (민 11:29)'],
      [MOSES, '네가 나를 두고 시기하느냐 여호와께서 그의 영을 그의 모든 백성에게 주사 다 선지자가 되게 하시기를 원하노라'],
    ],
    w3_quail: [
      [NAR, '바람이 여호와에게서 나와 바다에서부터 메추라기를 몰아 진영 곁 이쪽 저쪽 곧 진영 사방으로 각기 하룻길 되는 지면 위 두 규빗쯤에 내리게 한지라 (민 11:31)'],
      { event: 'quail' },
      [NAR, '백성이 일어나 그 날 종일 종야와 그 이튿날 종일토록 메추라기를 모으니 적게 모은 자도 열 호멜이라 그들이 자기들을 위하여 진영 사면에 펴 두었더라 (민 11:32)'],
      [NAR, '고기가 아직 이 사이에 있어 씹히기 전에 여호와께서 백성에게 대하여 진노하사 심히 큰 재앙으로 치셨으므로 (민 11:33)'],
      [NAR, '그 곳 이름을 기브롯 핫다아와라 불렀으니 욕심을 낸 백성을 거기 장사함이었더라 (민 11:34)'],
      [NAR, '백성이 기브롯 핫다아와에서 행진하여 하세롯에 이르러 거기 거하니라 (민 11:35)'],
    ],
    // 3장
    w3_speak: [
      [NAR, '모세가 구스 여자를 취하였더니 그 구스 여자를 취하였으므로 미리암과 아론이 모세를 비방하니라 (민 12:1)'],
      [NAR, '그들이 이르되 (민 12:2)'],
      [MA, '여호와께서 모세와만 말씀하셨느냐 우리와도 말씀하지 아니하셨느냐'],
      [NAR, '하매 여호와께서 이 말을 들으셨더라 (민 12:2)'],
      [NAR, '이 사람 모세는 온유함이 지면의 모든 사람보다 더하더라 (민 12:3)'],
      [NAR, '▶ 회막 문으로 가요.'],
    ],
    w3_tentdoor: [
      [NAR, '여호와께서 갑자기 모세와 아론과 미리암에게 이르시되 너희 세 사람은 회막으로 나아오라 하시니 그 세 사람이 나아가매 (민 12:4)'],
      [NAR, '여호와께서 구름 기둥 가운데로부터 강림하사 장막 문에 서시고 아론과 미리암을 부르시는지라 그 두 사람이 나아가매 (민 12:5)'],
      [NAR, '이르시되 내 말을 들으라 너희 중에 선지자가 있으면 나 여호와가 환상으로 나를 그에게 알리기도 하고 꿈으로 그와 말하기도 하거니와 (민 12:6)'],
      [NAR, '내 종 모세와는 그렇지 아니하니 그는 내 온 집에 충성함이라 (민 12:7)'],
      [NAR, '그와는 내가 대면하여 명백히 말하고 은밀한 말로 하지 아니하며 그는 또 여호와의 형상을 보거늘 너희가 어찌하여 내 종 모세 비방하기를 두려워하지 아니하느냐 (민 12:8)'],
      [NAR, '여호와께서 그들을 향하여 진노하시고 떠나시매 (민 12:9)'],
      { event: 'cloudLeave' },
      [NAR, '구름이 장막 위에서 떠나갔고 미리암은 나병에 걸려 눈과 같더라 아론이 미리암을 본즉 나병에 걸렸는지라 (민 12:10)'],
    ],
    w3_plead: [
      [NAR, '아론이 이에 모세에게 이르되 (민 12:11)'],
      [AARON, '슬프도다 내 주여 우리가 어리석은 일을 하여 죄를 지었으나 청하건대 그 벌을 우리에게 돌리지 마소서'],
      [AARON, '그가 살이 반이나 썩어 모태로부터 죽어서 나온 자 같이 되지 않게 하소서'],
      [NAR, '모세가 여호와께 부르짖어 이르되 (민 12:13)'],
      [MOSES, '하나님이여 원하건대 그를 고쳐 주옵소서'],
      [NAR, '여호와께서 모세에게 이르시되 그의 아버지가 그의 얼굴에 침을 뱉었을지라도 그가 이레 동안 부끄러워하지 않겠느냐 그런즉 그를 진영 밖에 이레 동안 가두고 그 후에 들어오게 할지니라 하시니 (민 12:14)'],
      [NAR, '▶ 진영 밖으로 가요.'],
    ],
    w3_wait_done: [
      [NAR, '이에 미리암이 진영 밖에 이레 동안 갇혀 있었고 백성은 그를 다시 들어오게 하기까지 행진하지 아니하다가 (민 12:15)'],
      [NAR, '그 후에 백성이 하세롯을 떠나 바란 광야에 진을 치니라 (민 12:16)'],
    ],
    // 4장
    w3_send: [
      [NAR, '여호와께서 모세에게 말씀하여 이르시되 (민 13:1)'],
      [NAR, '사람을 보내어 내가 이스라엘 자손에게 주는 가나안 땅을 정탐하게 하되 그들의 조상의 가문 각 지파 중에서 지휘관 된 자 한 사람씩 보내라 (민 13:2)'],
      [NAR, '모세가 가나안 땅을 정탐하러 그들을 보내며 이르되 (민 13:17)'],
      [MOSES, '너희는 네겝 길로 행하여 산지로 올라가서'],
      [MOSES, '그 땅이 어떠한지 정탐하라 곧 그 땅 거민이 강한지 약한지 많은지 적은지와'],
      [MOSES, '그들이 사는 땅이 좋은지 나쁜지와 사는 성읍이 진영인지 산성인지와'],
      [MOSES, '토지가 비옥한지 메마른지 나무가 있는지 없는지를 탐지하라 담대하라 또 그 땅의 실과를 가져오라'],
      [NAR, '하니 그 때는 포도가 처음 익을 즈음이었더라 (민 13:20)'],
      [NAR, '▶ 동쪽 끝, 정탐하러 가는 길로 가요.'],
    ],
    w3_eshcol: [
      [NAR, '이에 그들이 올라가서 땅을 정탐하되 신 광야에서부터 하맛 어귀 르홉에 이르렀고 (민 13:21)'],
      [NAR, '또 네겝으로 올라가서 헤브론에 이르렀으니 헤브론은 애굽 소안보다 칠 년 전에 세운 곳이라 그 곳에 아낙 자손 아히만과 세새와 달매가 있었더라 (민 13:22)'],
      [NAR, '또 에스골 골짜기에 이르러 거기서 포도송이가 달린 가지를 베어 둘이 막대기에 꿰어 메고 또 석류와 무화과를 따니라 (민 13:23)'],
      [NAR, '▶ 여호수아와 함께 포도송이 막대를 메고 진영까지 가요. 막대가 기울지 않게!'],
    ],
    w3_report: [
      [NAR, '사십 일 동안 땅을 정탐하기를 마치고 돌아와 (민 13:25)'],
      [NAR, '바란 광야 가데스에 이르러 모세와 아론과 이스라엘 자손의 온 회중에게 나아와 그들에게 보고하고 그 땅의 과일을 보이고 (민 13:26)'],
      [NAR, '모세에게 말하여 이르되 (민 13:27)'],
      [SCOUTS, '당신이 우리를 보낸 땅에 간즉 과연 그 땅에 젖과 꿀이 흐르는데 이것은 그 땅의 과일이니이다'],
      [SCOUTS, '그러나 그 땅 거주민은 강하고 성읍은 견고하고 심히 클 뿐 아니라 거기서 아낙 자손을 보았으며'],
    ],
    // 5장
    w3_caleb: [
      [NAR, '갈렙이 모세 앞에서 백성을 조용하게 하고 이르되 (민 13:30)'],
      [CALEB, '우리가 곧 올라가서 그 땅을 취하자 능히 이기리라'],
      [NAR, '하나 그와 함께 올라갔던 사람들은 이르되 (민 13:31)'],
      [SCOUTS, '우리는 능히 올라가서 그 백성을 치지 못하리라 그들은 우리보다 강하니라'],
      [NAR, '하고 이스라엘 자손 앞에서 그 정탐한 땅을 악평하여 이르되 (민 13:32)'],
      [SCOUTS, '우리가 두루 다니며 정탐한 땅은 그 거주민을 삼키는 땅이요 거기서 본 모든 백성은 신장이 장대한 자들이며'],
      [SCOUTS, '거기서 네피림 후손인 아낙 자손의 거인들을 보았나니 우리는 스스로 보기에도 메뚜기 같으니 그들이 보기에도 그와 같았을 것이니라'],
    ],
    w3_night: [
      [NAR, '온 회중이 소리를 높여 부르짖으며 백성이 밤새도록 통곡하였더라 (민 14:1)'],
      [NAR, '이스라엘 자손이 다 모세와 아론을 원망하며 온 회중이 그들에게 이르되 (민 14:2)'],
      [CROWD, '우리가 애굽 땅에서 죽었거나 이 광야에서 죽었으면 좋았을 것을'],
      [CROWD, '어찌하여 여호와가 우리를 그 땅으로 인도하여 칼에 쓰러지게 하려 하는가 우리 처자가 사로잡히리니 애굽으로 돌아가는 것이 낫지 아니하랴'],
      [NAR, '이에 서로 말하되 (민 14:4)'],
      [CROWD, '우리가 한 지휘관을 세우고 애굽으로 돌아가자'],
      [NAR, '▶ 두 목소리 가운데, 누구 곁에 설까요?'],
    ],
    w3_jc: [
      [NAR, '그 땅을 정탐한 자 중 눈의 아들 여호수아와 여분네의 아들 갈렙이 자기들의 옷을 찢고 (민 14:6)'],
      [NAR, '이스라엘 자손의 온 회중에게 말하여 이르되 (민 14:7)'],
      [JC, '우리가 두루 다니며 정탐한 땅은 심히 아름다운 땅이라'],
      [JC, '여호와께서 우리를 기뻐하시면 우리를 그 땅으로 인도하여 들이시고 그 땅을 우리에게 주시리라 이는 과연 젖과 꿀이 흐르는 땅이니라'],
      [JC, '다만 여호와를 거역하지는 말라 또 그 땅 백성을 두려워하지 말라 그들은 우리의 먹이라 그들의 보호자는 그들에게서 떠났고 여호와는 우리와 함께 하시느니라 그들을 두려워하지 말라'],
      [NAR, '온 회중이 그들을 돌로 치려 하는데 그 때에 여호와의 영광이 회막에서 이스라엘 모든 자손에게 나타나시니라 (민 14:10)'],
      { event: 'glory14' },
    ],
    w3_forty: [
      [NAR, '그러나 내 종 갈렙은 그 마음이 그들과 달라서 나를 온전히 따랐은즉 그가 갔던 땅으로 내가 그를 인도하여 들이리니 그의 자손이 그 땅을 차지하리라 (민 14:24)'],
      [NAR, '너희는 그 땅을 정탐한 날 수인 사십 일의 하루를 일 년으로 쳐서 그 사십 년간 너희의 죄악을 담당할지니 너희는 그제서야 내가 싫어하면 어떻게 되는지를 알리라 하셨다 하라 (민 14:34)'],
    ],
  });

  const { mgOpen, mgCloseAll, completeTask } = api;
  const btnCss = 'padding:8px 6px;border-radius:10px;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.08);color:#f5e9d0;font-size:13px';
  // 🏅 3편 배지(SQL claim_odyssey_achieve 키 badge-grape_carry · badge-with_caleb)
  Object.assign(api.BADGES, { grape_carry: { ico: '🍇', name: '젖과 꿀을 본 사람' }, with_caleb: { ico: '🙌', name: '갈렙과 함께 선 사람' } });
  function giveBadge(k){ const S = api.ST; if (S.badges.includes(k)) return; S.badges.push(k); api.saveST(); setTimeout(() => api.toast(`${api.BADGES[k].ico} 배지 획득: ${api.BADGES[k].name}`, 2600), 900); }

  // ☁ 구름 따라 행진(민 9:17, 10:34) — 떠오르면 걷고 머물면 멈춘다
  function marchGame(q){
    api.runDialog(DLG.w3_march_intro, () => {
      const N = 8; let k = 0, msg = '', lock = false, seq = Array.from({ length: N }, (_, i) => i % 2 ? 'rest' : 'up').sort(() => Math.random() - 0.5);
      mgOpen('☁ 구름을 따라', '"구름이 성막에서 떠오르는 때에는 이스라엘 자손이 곧 행진하였고 구름이 머무는 곳에 이스라엘 자손이 진을 쳤으니" (민 9:17)');
      const draw = () => { const up = seq[k] === 'up';
        api.mgArea.innerHTML = k < N ? `<div style="text-align:center;padding:12px;font-size:44px;transition:transform .4s;transform:translateY(${up ? -14 : 8}px)">☁️</div><div style="text-align:center;font-weight:800;margin-bottom:8px">${up ? '구름이 떠올랐어요' : '구름이 머물렀어요'}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:0 12px"><button data-mc="up" style="${btnCss};font-size:15px">🚶 걷기</button><button data-mc="rest" style="${btnCss};font-size:15px">⛺ 머물기</button></div><div data-mm style="text-align:center;color:#ffd27a;font-weight:800;min-height:18px;margin-top:6px">${msg || `${k + 1} / ${N}`}</div>`
          : `<div style="padding:16px;text-align:center;color:#ffd27a;font-weight:800">✓ 구름을 따라 걷고 멈췄어요</div>`;
        api.mgAct.textContent = k < N ? '다 따라가면 계속' : '계속'; api.mgAct.disabled = k < N; };
      draw();
      api.mgArea.onclick = e => { const b = e.target.closest('[data-mc]'); if (!b || k >= N || lock) return;
        if (b.dataset.mc === seq[k]){ k++; msg = ''; draw(); }
        else { lock = true; msg = '구름을 다시 보세요 — 처음부터'; draw(); setTimeout(() => { k = 0; msg = ''; lock = false; seq = seq.sort(() => Math.random() - 0.5); draw(); }, 1100); } };
      api.mgAct.onclick = () => { if (k < N) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; };
    }, null, 'w3_march_intro');
  }
  // 🧺 칠십 장로와 짐 나누기(민 11:16-17)
  function eldersGame(q){
    api.runDialog(DLG.w3_elders_intro, () => {
      const got = new Array(7).fill(false);
      mgOpen('🧺 칠십 장로', '"그들이 너와 함께 백성의 짐을 담당하고 너 혼자 담당하지 아니하리라" (민 11:17) — 장로 열 명씩, 짐을 나눠 드려요.');
      const draw = () => { const n = got.filter(Boolean).length;
        api.mgArea.innerHTML = `<div style="text-align:center;padding:6px;font-size:13px">모세의 짐 ${'📦'.repeat(7 - n) || '— 가벼워졌어요'}</div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;padding:0 10px">${got.map((g, i) => `<button data-el="${i}" style="${btnCss};${g ? 'background:#ffd27a;color:#2a1d10' : ''}">👴 장로 ${i * 10 + 1}~${i * 10 + 10}${g ? '<br>📦' : ''}</button>`).join('')}</div><div style="text-align:center;color:#ffd27a;font-weight:800;min-height:18px;margin-top:6px">${n < 7 ? `${n * 10} / 70명` : '✓ 칠십 장로가 함께 짐을 졌어요'}</div>`;
        api.mgAct.textContent = n < 7 ? '다 나누면 계속' : '계속'; api.mgAct.disabled = n < 7; };
      draw();
      api.mgArea.onclick = e => { const b = e.target.closest('[data-el]'); if (!b) return; got[+b.dataset.el] = true; draw(); };
      api.mgAct.onclick = () => { if (got.some(g => !g)) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; };
    }, null, 'w3_elders_intro');
  }
  // 🗓 이레 동안 행진하지 않고 기다리기(민 12:15)
  function waitGame(q){
    const DAYS = ['첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째', '일곱째']; let d = 0;
    mgOpen('🗓 이레 동안', '"백성은 그를 다시 들어오게 하기까지 행진하지 아니하다가" (민 12:15)');
    const draw = () => { api.mgArea.innerHTML = `<div style="display:flex;gap:4px;justify-content:center;padding:14px 6px">${DAYS.map((x, i) => `<div style="width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;${i < d ? 'background:#ffd27a;color:#2a1d10' : 'background:rgba(255,255,255,.08)'}">${i + 1}</div>`).join('')}</div><div style="text-align:center;color:#ffd27a;font-weight:800">${d < 7 ? `${DAYS[d]} 날 — 온 진영이 미리암을 기다려요` : '✓ 이레가 지났어요'}</div>`;
      api.mgAct.textContent = d < 7 ? '🌙 하루 지나기' : '계속'; };
    draw();
    api.mgAct.onclick = () => { if (d < 7){ d++; draw(); return; } mgCloseAll(); completeTask(q); };
  }
  // 🍇 포도송이 막대 메고 오기(민 13:23) — 막대가 기울지 않게
  function grapeGame(q){
    api.runDialog(DLG.w3_eshcol, () => {
      let tilt = 0, drift = 0, prog = 0, tipped = false, timer = null;
      mgOpen('🍇 에스골의 포도송이', '"포도송이가 달린 가지를 베어 둘이 막대기에 꿰어 메고" (민 13:23) — ◀ ▶로 균형을 잡아요.');
      const draw = () => {
        const ang = Math.round(tilt * 28), ok = Math.abs(tilt) < 0.35;
        api.mgArea.innerHTML = `<div style="text-align:center;padding:10px 0 2px;font-size:13px">여호수아 🧍 ─── 🍇 ─── 🧍 나</div><div style="display:flex;justify-content:center;padding:6px"><div style="width:220px;height:10px;border-radius:5px;background:#8a6040;transform:rotate(${ang}deg);transition:transform .1s"></div></div><div style="margin:8px 18px;height:10px;border-radius:5px;background:rgba(255,255,255,.1)"><div style="width:${Math.min(100, prog)}%;height:100%;border-radius:5px;background:${ok ? '#9ad27a' : '#e0a050'}"></div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:0 20px"><button data-gp="-1" style="${btnCss};font-size:22px">◀</button><button data-gp="1" style="${btnCss};font-size:22px">▶</button></div><div style="text-align:center;color:#ffd27a;font-weight:800;min-height:18px;margin-top:6px">${prog >= 100 ? '✓ 가데스 진영에 닿았어요' : ok ? '가데스까지 걸어가는 중…' : '막대가 기울었어요!'}</div>`;
        api.mgAct.textContent = prog >= 100 ? '계속' : '진영까지 가면 계속'; api.mgAct.disabled = prog < 100; };
      draw();
      timer = setInterval(() => { if (prog >= 100) return;
        drift += (Math.random() - 0.5) * 0.08; drift = Math.max(-0.06, Math.min(0.06, drift)); tilt += drift;
        if (Math.abs(tilt) >= 1){ tipped = true; tilt = 0; drift = 0; prog = Math.max(0, prog - 25); }
        else if (Math.abs(tilt) < 0.35) prog += 1.4;
        draw(); if (prog >= 100){ clearInterval(timer); timer = null; } }, 120);
      api.mgArea.onclick = e => { const b = e.target.closest('[data-gp]'); if (!b) return; tilt -= +b.dataset.gp * 0.22; drift *= 0.3; draw(); };
      api.mgAct.onclick = () => { if (prog < 100) return; api.mgArea.onclick = null; mgCloseAll(); if (!tipped) giveBadge('grape_carry'); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; if (timer){ clearInterval(timer); timer = null; } };
    }, null, 'w3_eshcol');
  }
  // 🙌 두 목소리 앞에서 — 누구 곁에 설까(민 13:30-33, 14:6-9). 선택은 결말을 바꾸지 않는다(배지·반응만)
  function standGame(q){
    api.runDialog(DLG.w3_night, () => {
      let first = null, done = false;
      mgOpen('🙌 누구 곁에 설까', '진영에 두 목소리가 있어요. 한쪽 곁으로 가서 서 보세요.');
      const draw = (m = '') => {
        api.mgArea.innerHTML = `<div style="display:grid;gap:8px;padding:10px 12px"><button data-sd="fear" style="${btnCss};text-align:left;line-height:1.5">😨 열 정탐꾼 곁<br><span style="font-size:12px;opacity:.85">"우리는 스스로 보기에도 메뚜기 같으니" (민 13:33)</span></button><button data-sd="faith" style="${btnCss};text-align:left;line-height:1.5">🙌 갈렙과 여호수아 곁<br><span style="font-size:12px;opacity:.85">"우리가 곧 올라가서 그 땅을 취하자 능히 이기리라" (민 13:30)</span></button></div><div style="text-align:center;color:#ffd27a;font-weight:800;min-height:34px;padding:0 12px;font-size:12.5px">${m}</div>`;
        api.mgAct.textContent = done ? '계속' : '곁에 서면 계속'; api.mgAct.disabled = !done; };
      draw();
      api.mgArea.onclick = e => { const b = e.target.closest('[data-sd]'); if (!b || done) return; const c = b.dataset.sd; first = first || c;
        if (c === 'faith'){ done = true; if (first === 'faith') giveBadge('with_caleb'); draw('✓ 갈렙과 여호수아 곁에 섰어요'); }
        else draw('"온 회중이 소리를 높여 부르짖으며 백성이 밤새도록 통곡하였더라" (민 14:1) — 다른 쪽 목소리도 들어 보세요'); };
      api.mgAct.onclick = () => { if (!done) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; };
    }, null, 'w3_night');
  }

  // ── 연출 ──
  const fx = [];
  const addFx = o => { api.zoneRoot.add(o); fx.push(o); return o; };
  const clearFx = () => { fx.splice(0).forEach(o => o.parent && o.parent.remove(o)); };
  function flames(x, z, n, spread, life){
    const g = new THREE.Group(), y = api.heightAt(x, z) + 0.8;
    for (let i = 0; i < n; i++){ const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: api.flameTex, color: i % 2 ? 0xffc060 : 0xff7a2a, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.9 }));
      s.position.set(x + (Math.random() - 0.5) * spread, y + Math.random() * 1.2, z + (Math.random() - 0.5) * spread); s.scale.set(1.4 + Math.random(), 2.2 + Math.random(), 1); g.add(s); }
    addFx(g); if (life) setTimeout(() => g.parent && g.parent.remove(g), life); return g;
  }
  let fireG = null;
  function taberah(){ fireG = flames(EDGE[0], EDGE[1], 16, 7, 0); try { api.startCine('w3Taberah', EDGE[0], api.heightAt(EDGE[0], EDGE[1]) + 1.5, EDGE[1], { r: 11, h: 5, dur: 4, spin: 0.4 }); } catch (e){} }
  function fireOut(){ if (fireG){ const g = fireG; fireG = null; let o = 1; const f = () => { o -= 0.05; g.children.forEach(s => s.material.opacity = Math.max(0, o * 0.9)); if (o > 0) requestAnimationFrame(f); else g.parent && g.parent.remove(g); }; f(); } }
  function quail(){
    const g = new THREE.Group(), mat = new THREE.MeshToonMaterial({ color: 0x8a6a48, gradientMap: api.toonGradient }), geo = new THREE.SphereGeometry(0.16, 8, 6);
    const birds = [];
    for (let i = 0; i < 90; i++){ const a = Math.random() * Math.PI * 2, r = 6 + Math.random() * 22, x = MEET[0] + Math.cos(a) * r, z = MEET[1] + Math.sin(a) * r;
      const m = new THREE.Mesh(geo, mat); m.position.set(x, api.heightAt(x, z) + 8 + Math.random() * 6, z); m.userData.land = api.heightAt(x, z) + 0.15; g.add(m); birds.push(m); }
    addFx(g);
    const t0 = performance.now(); const fall = () => { if (!g.parent) return; const k = (performance.now() - t0) / 2600; birds.forEach(b => { b.position.y = Math.max(b.userData.land, b.position.y - 0.12); }); if (k < 1.2) requestAnimationFrame(fall); };
    fall();
    try { api.startCine('w3Quail', MEET[0], api.heightAt(MEET[0], MEET[1]) + 2, MEET[1], { r: 18, h: 8, dur: 4.5, spin: 0.5 }); } catch (e){}
    setTimeout(() => g.parent && g.parent.remove(g), 40000);
  }
  function cloudLeave(){ api.setGlory(false); try { api.startCine('w3CloudLeave', -5, api.heightAt(-5, -15) + 4, -15, { r: 14, h: 6, dur: 4, spin: 0.4 }); } catch (e){} }
  function glory14(){
    const fl = document.getElementById('flash'); if (fl){ fl.style.transition = 'none'; fl.style.background = '#fff6d8'; fl.style.opacity = '0.6'; setTimeout(() => { fl.style.transition = 'opacity 1.4s'; fl.style.opacity = '0'; }, 150); setTimeout(() => { fl.style.background = ''; }, 1700); }
    api.setGlory(true); try { api.startCine('w3Glory14', -5, api.heightAt(-5, -15) + 4, -15, { r: 16, h: 7, dur: 4.5, spin: 0.5 }); } catch (e){}
  }
  // 마을에 놓이는 것: 미리암의 흰 피부(3장) · 에스골 가는 길의 포도나무(4장) · 과일(4~5장)
  let worldObj = null;
  function tintMarker(id, col){ const m = api.markers.find(x => x.data.id === id); if (!m || !m.mesh) return; m.mesh.traverse(o => { if (o.isMesh && o.material){ o.material = o.material.clone(); if (o.material.color) o.material.color.set(col); } }); }
  function world(zid){
    if (worldObj && worldObj.parent) worldObj.parent.remove(worldObj); worldObj = null;
    const p = cur(); if (zid !== 'kadesh' || !p) return;
    api.setGlory(!(p.ch === 2 && p.step >= 2 && p.step <= 3));
    if (p.ch === 2 && p.step >= 2 && p.step <= 3) setTimeout(() => tintMarker('kd_miriam_out', 0xf4f1ea), 1500);
    const g = new THREE.Group(), M = c => new THREE.MeshToonMaterial({ color: c, gradientMap: api.toonGradient });
    const put = (geo, mat, x, dy, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, api.heightAt(x, z) + dy, z); m.castShadow = true; g.add(m); return m; };
    if (p.ch === 3){   // 에스골로 가는 길 끝의 포도나무
      const leaf = M(0x4f7a32), grape = M(0x5b2d7a), wood = M(0x7a5a3a);
      for (let i = 0; i < 6; i++){ const x = ESHCOL[0] - 4 + (i % 3) * 3, z = ESHCOL[1] + 3 + Math.floor(i / 3) * 3;
        put(new THREE.CylinderGeometry(0.06, 0.08, 1.4, 6), wood, x, 0.7, z); put(new THREE.SphereGeometry(0.75, 8, 6), leaf, x, 1.5, z);
        for (let j = 0; j < 5; j++) put(new THREE.SphereGeometry(0.11, 6, 5), grape, x + (Math.random() - 0.5) * 0.5, 1.0 - j * 0.07, z + 0.55); }
    }
    if ((p.ch === 3 && p.step >= 2) || p.ch === 4){   // 회중 앞의 과일(포도송이 막대 · 석류 · 무화과)
      const pole = put(new THREE.CylinderGeometry(0.05, 0.05, 2.6, 6), M(0x7a5a3a), MEET[0] + 1.5, 0.35, MEET[1] - 1.2); pole.rotation.z = Math.PI / 2;
      for (let j = 0; j < 14; j++) put(new THREE.SphereGeometry(0.13, 6, 5), M(0x5b2d7a), MEET[0] + 1.5 + (Math.random() - 0.5) * 0.4, 0.2 - (j % 4) * 0.03, MEET[1] - 1.2 + (Math.random() - 0.5) * 0.3);
      for (let j = 0; j < 4; j++) put(new THREE.SphereGeometry(0.16, 8, 6), M(j % 2 ? 0xb8322a : 0x6a7a3a), MEET[0] - 0.6 + j * 0.35, 0.16, MEET[1] - 0.4);
    }
    if (g.children.length){ api.zoneRoot.add(g); worldObj = g; }
  }

  const T = n => `📜 광야 40년 ${n}장`;
  const PL = { moses: [15, -12], aaron: [15, -18] };
  return {
    id: 'wild3',
    chapters: [
      { title: `${T(1)} — 궤가 앞서 가는 행진`, clearTitle: '🎉 3편 1장 「궤가 앞서 가는 행진」 완료!', next: '2장: 다베라와 메추라기',
        steps: [
          { id: 'w1s1', zone: 'kadesh', obj: '모세와 호밥의 이야기 듣기', where: '진영 서쪽 입구의 모세', npc: 'moses', dlg: 'w3_hobab', place: { moses: [-28.5, 3], aaron: [-29, 6.5] } },
          { id: 'w1s2', zone: 'kadesh', obj: '구름을 따라 걷고 멈추기', where: '진영 서쪽 입구의 모세', npc: 'moses', game: 'march' },
          { id: 'w1s3', zone: 'kadesh', obj: '궤가 쉬는 곳, 회막 문으로', where: '진영 가운데 성막 동쪽 문(빛나는 곳)', point: 'kd_door', dlg: 'w3_rest', place: PL, reward: { verse: 'nu10-36', clear: true } },
        ] },
      { title: `${T(2)} — 다베라와 메추라기`, clearTitle: '🎉 3편 2장 「다베라와 메추라기」 완료!', next: '3장: 온유한 모세',
        steps: [
          { id: 'w2s1', zone: 'kadesh', obj: '진영 끝에서 원망하는 소리 듣기', where: '진영 서쪽 끝(빛나는 곳)', point: 'kd_edge', dlg: 'w3_taberah', place: PL },
          { id: 'w2s2', zone: 'kadesh', obj: '우는 백성 곁으로', where: '진영 남쪽 천막 앞', npc: 'kd_crowd', dlg: 'w3_weep' },
          { id: 'w2s3', zone: 'kadesh', obj: '칠십 장로와 짐 나누기', where: '회막 앞의 모세', npc: 'moses', game: 'elders' },
          { id: 'w2s4', zone: 'kadesh', obj: '회막에서 장로들에게 임한 영', where: '성막 동쪽 문(빛나는 곳)', point: 'kd_door', dlg: 'w3_spirit' },
          { id: 'w2s5', zone: 'kadesh', obj: '진영 곁에 내린 메추라기', where: '진영 남쪽 들판(빛나는 곳)', point: 'kd_quail', dlg: 'w3_quail', reward: { verse: 'nu11-17', clear: true } },
        ] },
      { title: `${T(3)} — 온유한 모세`, clearTitle: '🎉 3편 3장 「온유한 모세」 완료!', next: '4장: 열두 정탐꾼',
        steps: [
          { id: 'w3s1', zone: 'kadesh', obj: '미리암과 아론의 말 듣기', where: '회막 앞의 아론', npc: 'aaron', dlg: 'w3_speak', place: PL },
          { id: 'w3s2', zone: 'kadesh', obj: '회막 문 앞에 서기', where: '성막 동쪽 문(빛나는 곳)', point: 'kd_door', dlg: 'w3_tentdoor' },
          { id: 'w3s3', zone: 'kadesh', obj: '모세의 기도 듣기', where: '회막 앞의 모세', npc: 'moses', dlg: 'w3_plead' },
          { id: 'w3s4', zone: 'kadesh', obj: '진영 밖에서 이레 동안 기다리기', where: '진영 북서쪽 밖(빛나는 곳)', point: 'kd_outside', game: 'wait', doneDlg: 'w3_wait_done', reward: { verse: 'nu12-3', clear: true } },
        ] },
      { title: `${T(4)} — 열두 정탐꾼`, clearTitle: '🎉 3편 4장 「열두 정탐꾼」 완료!', next: '5장: 갈렙과 여호수아, 그리고 40년',
        steps: [
          { id: 'w4s1', zone: 'kadesh', obj: '모세가 정탐꾼을 보내는 말 듣기', where: '회막 앞의 모세', npc: 'moses', dlg: 'w3_send', place: PL },
          { id: 'w4s2', zone: 'kadesh', obj: '에스골 포도송이를 둘이 메고 오기', where: '진영 동쪽 끝 — 정탐하러 가는 길(빛나는 곳)', point: 'kd_eshcol', game: 'grape' },
          { id: 'w4s3', zone: 'kadesh', obj: '온 회중 앞에서 보고 듣기', where: '진영 가운데 회중이 모인 곳(빛나는 곳)', point: 'kd_meet', dlg: 'w3_report', reward: { verse: 'nu13-27', clear: true } },
        ] },
      { title: `${T(5)} — 갈렙과 여호수아, 그리고 40년`, clearTitle: '🎉 3편 5장 「갈렙과 여호수아, 그리고 40년」 완료! (6장부터는 준비 중이에요)', next: '6장: 고라의 무리 (준비 중)',
        steps: [
          { id: 'w5s1', zone: 'kadesh', obj: '갈렙의 말 듣기', where: '회중이 모인 곳의 갈렙', npc: 'kd_caleb', dlg: 'w3_caleb', place: PL },
          { id: 'w5s2', zone: 'kadesh', obj: '밤새 우는 회중 — 누구 곁에 설까', where: '진영 가운데 회중이 모인 곳(빛나는 곳)', point: 'kd_meet', game: 'stand' },
          { id: 'w5s3', zone: 'kadesh', obj: '옷을 찢은 여호수아와 갈렙', where: '회막 앞의 여호수아', npc: 'kd_joshua', dlg: 'w3_jc' },
          { id: 'w5s4', zone: 'kadesh', obj: '모세에게 가기 — 사십 년', where: '회막 앞의 모세', npc: 'moses', dlg: 'w3_forty', reward: { verse: 'nu14-9', clear: true } },
        ] },
    ],
    games: { march: marchGame, elders: eldersGame, wait: waitGame, grape: grapeGame, stand: standGame },
    events: { taberah, fireOut, quail, cloudLeave, glory14 },
    world,
  };
});
