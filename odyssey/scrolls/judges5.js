// 5편 「사사들과 함께」 — 사사기 1–21장(삿 19장은 뺌, 2026-10-25 전도사님 결정), 12장. 2026-10-25 1부(1~4장: 여호와를 알지 못하는 세대 · 옷니엘 · 왼손잡이 에훗 · 드보라와 바락, 야엘).
// 대사 원칙: 성경 인물은 개역개정에 있는 자기 말만, 해설은 원문 + (출처). 대사·구절 카드는 E:\temp\claude-work\judges5\gen_dlg.py가 bskorea 개역개정(GAE) 원문 파일에서 그대로 뽑는다.
// 무대: 4편 마을을 사사 시대에 맞게 바꿔 다시 쓴다 — 길갈과 여리고(1·3장: 보김, 무너진 성벽 곁 종려나무 성읍 삿 3:13), 헤브론 산지(2장: 드빌=기럇 세벨 삿 1:11),
//       실로와 세겜(4장: 드보라의 종려나무 삿 4:5 "라마와 벧엘 사이 에브라임 산지"), 새 마을 이스르엘 골짜기(4장: 다볼 산 · 기손 강 · 헤벨의 장막).
// 칼·말뚝 장면(삿 3:21 · 4:21)은 본문을 해설로 읽되 연출·버튼·보상으로 만들지 않는다. 삿 3:22은 읽지 않는다.
// 「사사 열두 명」 조각: 큰 사사는 장을 마치면, 작은 사사(삼갈 등)는 그 절이 있는 자리에서 줍는다(api.addJudge).
// 새 인물(옷니엘·악사·에훗·드보라·바락·야엘)은 GPT 12차 원화 → Meshy 모델이 오기 전까지 이미 있는 모델을 쓴다.
(window.__odyQ = window.__odyQ || []).push(api => {
  const { DLG, ZONES, CONDS, VERSES, THREE, SPEAKERS: { NAR } } = api;
  const ANGEL = { n: '여호와의 사자' }, EHUD = { n: '에훗' }, DEBORAH = { n: '드보라' }, SONG = { n: '드보라와 바락의 노래' };
  const cur = () => api.ST.cur === 'judges' && api.ST.sp.judges ? api.ST.sp.judges : null;
  const at = (ch, a = 0, b = 99) => () => { const p = cur(); return !!p && p.ch === ch && !p.cleared && p.step >= a && p.step <= b; };
  const from = (ch, s = 0) => () => { const p = cur(); return !!p && (p.ch > ch || (p.ch === ch && (p.cleared || p.step >= s))); };

  // ── 자리 ──
  // 길갈과 여리고(4편 마을): 여리고 성터는 서쪽(JC), 열두 돌은 길갈(MEMO), 요단 나루는 동쪽, 에브라임 산지는 북서쪽
  const JC = [-22, 6], JR = 10, MEMO = [14, 4], FORD = [35, -6], HILLS = [-26, -34];
  const ANGEL_G = [20, 12], BOCHIM = [-34, -18], CAMP_G = [8, 10], PALMS = [-22, 22], PALACE = [-22, 6], QUARRY = [12, -4], EHUD_G = [6, 14], SHAMGAR = [33, 8];
  // 헤브론 산지(4편 마을): 드빌(기럇 세벨)은 동쪽, 윗샘은 남동쪽 산기슭, 아랫샘은 골짜기, 남쪽 길 어귀
  const DEBIR = [18, 2], DEBR = 6, UPPER = [16, 24], LOWER = [-10, 0], CUSHAN = [0, 30];
  // 실로와 세겜(4편 마을): 드보라의 종려나무는 서북쪽
  const DEBP = [-22, -26];
  // 이스르엘 골짜기(새 마을): 다볼 산 북동쪽, 기손 강 서쪽, 헤벨의 장막 남서쪽
  const TABOR_FOOT = [16, -18], TABOR_UP = [22, -28], KISHON = [-30, -4], JAEL_T = [-24, 24];

  // 단계 번호(장 index · step index)
  // 0장: 0 길갈의 여호와의 사자 · 1 보김 · 2 다른 세대 · 3 되풀이(순환 고리)
  // 1장: 0 헤브론 산지로 · 1 갈렙과 기럇 세벨 · 2 악사 · 3 윗샘 · 4 아랫샘 · 5 구산 리사다임 · 6 옷니엘
  // 2장: 0 길갈로 · 1 종려나무 성읍 · 2 에훗과 공물 · 3 돌 뜨는 곳 · 4 왕의 다락방 · 5 에브라임 산지 나팔 · 6 요단 나루 · 7 삼갈
  // 3장: 0 실로로 · 1 드보라의 종려나무 · 2 바락 · 3 이스르엘 골짜기로 · 4 다볼 산 · 5 일어나라 · 6 야엘의 장막 · 7 드보라와 바락의 노래
  let kishonShow = false;
  const fled = () => from(3, 6)() || kishonShow;   // 4:15 뒤로 병거가 흩어짐
  Object.assign(CONDS, {
    jgOn: () => !!cur(),
    jgAngel: at(0, 0, 0), jgBochim: at(0, 1, 1), jgCamp: at(0, 2, 3),
    jgCaleb: at(1, 1, 6), jgAchsah: at(1, 1, 6), jgUpper: at(1, 3, 3), jgLower: at(1, 4, 4), jgCushan: at(1, 5, 5), jgOthniel: at(1, 1, 6),
    jgPalms: at(2, 1, 1), jgEhud: at(2, 2, 2), jgQuarry: at(2, 3, 3), jgPalace: at(2, 4, 4), jgHorn: at(2, 5, 5), jgFord: at(2, 6, 6), jgShamgar: at(2, 7, 7),
    jgDeborah: at(3, 1, 2), jgBarak: at(3, 1, 2), jgTabor: at(3, 4, 4), jgRise: at(3, 5, 5), jgJael: at(3, 6, 6), jgSong: at(3, 7, 7), jgTaborFolk: from(3, 4),
  });
  const ZG = ZONES.gilgal.points, ZH = ZONES.hebron.points, ZS = ZONES.shiloh.points, ZJ = ZONES.jezreel.points;
  // 1장 — 길갈 · 보김
  ZG.push({ id: 'jg_angel', x: ANGEL_G[0], z: ANGEL_G[1], type: 'lore', title: '길갈 — 여호와의 사자', cond: 'jgAngel', body: '' });
  ZG.push({ id: 'jg_bochim', x: BOCHIM[0], z: BOCHIM[1], type: 'lore', title: '보김 — 백성이 운 곳', cond: 'jgBochim', body: '' });
  ZG.push({ id: 'jg_camp', x: CAMP_G[0], z: CAMP_G[1], type: 'lore', title: '길갈 진영 — 다른 세대', cond: 'jgCamp', body: '' });
  // 2장 — 헤브론 산지(드빌)
  ZH.push({ id: 'jg_caleb', x: DEBIR[0] - 7, z: DEBIR[1] - 3, type: 'villager', title: '갈렙', model: 'w3-caleb', persona: 'rs_static', cond: 'jgCaleb', body: '' });
  ZH.push({ id: 'jg_achsah', x: DEBIR[0] - 8.6, z: DEBIR[1] - 1, type: 'villager', title: '악사', model: 'w3-milcah', persona: 'rs_static', cond: 'jgAchsah', body: '' });
  ZH.push({ id: 'jg_othniel', x: DEBIR[0] - 6.4, z: DEBIR[1] + 1.4, type: 'villager', title: '옷니엘', model: 'j4-spy-1', persona: 'rs_static', cond: 'jgOthniel', body: '' });
  ZH.push({ id: 'jg_upper', x: UPPER[0], z: UPPER[1], type: 'lore', title: '윗샘', cond: 'jgUpper', body: '' });
  ZH.push({ id: 'jg_lower', x: LOWER[0], z: LOWER[1], type: 'lore', title: '아랫샘', cond: 'jgLower', body: '' });
  ZH.push({ id: 'jg_cushan', x: CUSHAN[0], z: CUSHAN[1], type: 'lore', title: '남쪽 길 어귀 — 여덟 해', cond: 'jgCushan', body: '' });
  // 3장 — 길갈 · 여리고 성터(종려나무 성읍)
  ZG.push({ id: 'jg_palms', x: PALMS[0], z: PALMS[1], type: 'lore', title: '종려나무 성읍', cond: 'jgPalms', body: '' });
  ZG.push({ id: 'jg_ehud', x: EHUD_G[0], z: EHUD_G[1], type: 'villager', title: '에훗', model: 'j4-spy-2', persona: 'rs_static', cond: 'jgEhud', body: '' });
  ZG.push({ id: 'jg_quarry', x: QUARRY[0], z: QUARRY[1], type: 'lore', title: '길갈 근처 돌 뜨는 곳', cond: 'jgQuarry', body: '' });
  ZG.push({ id: 'jg_palace', x: PALACE[0] + 5, z: PALACE[1], type: 'lore', title: '왕의 다락방', cond: 'jgPalace', body: '' });
  ZG.push({ id: 'jg_horn', x: HILLS[0], z: HILLS[1], type: 'lore', title: '에브라임 산지 — 나팔', cond: 'jgHorn', body: '' });
  ZG.push({ id: 'jg_ford', x: FORD[0], z: FORD[1], type: 'lore', title: '모압 맞은편 요단 강 나루', cond: 'jgFord', body: '' });
  ZG.push({ id: 'jg_shamgar', x: SHAMGAR[0], z: SHAMGAR[1], type: 'lore', title: '소 모는 막대기', cond: 'jgShamgar', body: '' });
  // 4장 — 실로(드보라의 종려나무) · 이스르엘 골짜기
  ZS.push({ id: 'jg_deborah', x: DEBP[0] + 1.6, z: DEBP[1] + 1.2, type: 'villager', title: '드보라', model: 'he-mother', persona: 'rs_static', cond: 'jgDeborah', body: '' });
  ZS.push({ id: 'jg_barak', x: DEBP[0] + 4.4, z: DEBP[1] + 2.4, type: 'villager', title: '바락', model: 'j4-east-tribes', persona: 'rs_static', cond: 'jgBarak', body: '' });
  ZJ.push({ id: 'jg_tabor', x: TABOR_UP[0], z: TABOR_UP[1], type: 'lore', title: '다볼 산', cond: 'jgTabor', body: '' });
  ZJ.push({ id: 'jg_deborah_t', x: TABOR_FOOT[0], z: TABOR_FOOT[1], type: 'villager', title: '드보라', model: 'he-mother', persona: 'rs_static', cond: 'jgTaborFolk', body: '' });
  ZJ.push({ id: 'jg_barak_t', x: TABOR_FOOT[0] + 2.4, z: TABOR_FOOT[1] + 1, type: 'villager', title: '바락', model: 'j4-east-tribes', persona: 'rs_static', cond: 'jgTaborFolk', body: '' });
  ZJ.push({ id: 'jg_jael', x: JAEL_T[0] + 3, z: JAEL_T[1], type: 'lore', title: '겐 사람 헤벨의 장막', cond: 'jgJael', body: '' });
  ZJ.push({ id: 'jg_song', x: TABOR_FOOT[0] - 3, z: TABOR_FOOT[1] + 3, type: 'lore', title: '다볼 산기슭 — 노래', cond: 'jgSong', body: '' });

  // ── 구절 카드(개역개정 원문, gen_dlg.py가 jdgN.txt에서 뽑음) ──
  Object.assign(VERSES, {
    'jdg2-10': { ref: '사사기 2:10', text: "그 세대의 사람도 다 그 조상들에게로 돌아갔고 그 후에 일어난 다른 세대는 여호와를 알지 못하며 여호와께서 이스라엘을 위하여 행하신 일도 알지 못하였더라" },
    'jdg2-16': { ref: '사사기 2:16', text: "여호와께서 사사들을 세우사 노략자의 손에서 그들을 구원하게 하셨으나" },
    'jdg3-9': { ref: '사사기 3:9', text: "이스라엘 자손이 여호와께 부르짖으매 여호와께서 이스라엘 자손을 위하여 한 구원자를 세워 그들을 구원하게 하시니 그는 곧 갈렙의 아우 그나스의 아들 옷니엘이라" },
    'jdg3-15': { ref: '사사기 3:15', text: "이스라엘 자손이 여호와께 부르짖으매 여호와께서 그들을 위하여 한 구원자를 세우셨으니 그는 곧 베냐민 사람 게라의 아들 왼손잡이 에훗이라 이스라엘 자손이 그를 통하여 모압 왕 에글론에게 공물을 바칠 때에" },
    'jdg4-14': { ref: '사사기 4:14', text: "드보라가 바락에게 이르되 일어나라 이는 여호와께서 시스라를 네 손에 넘겨 주신 날이라 여호와께서 너에 앞서 나가지 아니하시느냐 하는지라 이에 바락이 만 명을 거느리고 다볼 산에서 내려가니" },
    'jdg5-31': { ref: '사사기 5:31', text: "여호와여 주의 원수들은 다 이와 같이 망하게 하시고 주를 사랑하는 자들은 해가 힘 있게 돋음 같게 하시옵소서 하니라 그 땅이 사십 년 동안 평온하였더라" },
  });
  // ── 대사(개역개정 원문, gen_dlg.py가 뽑음 — 손으로 고치지 말고 생성기를 고친다) ──
  Object.assign(DLG, {
    jg_angel: [
      [NAR, "여호와의 사자가 길갈에서부터 보김으로 올라와 말하되 (삿 2:1)"],
      [ANGEL, "내가 너희를 애굽에서 올라오게 하여 내가 너희의 조상들에게 맹세한 땅으로 들어가게 하였으며 또 내가 이르기를 내가 너희와 함께 한 언약을 영원히 어기지 아니하리니"],
      [ANGEL, "너희는 이 땅의 주민과 언약을 맺지 말며 그들의 제단들을 헐라 하였거늘 너희가 내 목소리를 듣지 아니하였으니 어찌하여 그리하였느냐"],
      [ANGEL, "그러므로 내가 또 말하기를 내가 그들을 너희 앞에서 쫓아내지 아니하리니 그들이 너희 옆구리에 가시가 될 것이며 그들의 신들이 너희에게 올무가 되리라 하였노라"],
      [NAR, "▶ 서쪽 언덕, 백성이 모여 우는 곳(보김)으로 가요."],
    ],
    jg_bochim: [
      [NAR, "여호와의 사자가 이스라엘 모든 자손에게 이 말씀을 이르매 백성이 소리를 높여 운지라 (삿 2:4)"],
      [NAR, "그러므로 그 곳을 이름하여 보김이라 하고 그들이 거기서 여호와께 제사를 드렸더라 (삿 2:5)"],
      [NAR, "▶ 길갈 진영 가운데로 돌아가요. 여호수아가 보낸 백성의 이야기예요."],
    ],
    jg_gen: [
      [NAR, "전에 여호수아가 백성을 보내매 이스라엘 자손이 각기 그들의 기업으로 가서 땅을 차지하였고 (삿 2:6)"],
      [NAR, "백성이 여호수아가 사는 날 동안과 여호수아 뒤에 생존한 장로들 곧 여호와께서 이스라엘을 위하여 행하신 모든 큰 일을 본 자들이 사는 날 동안에 여호와를 섬겼더라 (삿 2:7)"],
      [NAR, "여호와의 종 눈의 아들 여호수아가 백십 세에 죽으매 (삿 2:8)"],
      [NAR, "무리가 그의 기업의 경내 에브라임 산지 가아스 산 북쪽 딤낫 헤레스에 장사하였고 (삿 2:9)"],
      [NAR, "그 세대의 사람도 다 그 조상들에게로 돌아갔고 그 후에 일어난 다른 세대는 여호와를 알지 못하며 여호와께서 이스라엘을 위하여 행하신 일도 알지 못하였더라 (삿 2:10)"],
    ],
    jg_cycle: [
      [NAR, "이스라엘 자손이 여호와의 목전에 악을 행하여 바알들을 섬기며 (삿 2:11)"],
      [NAR, "애굽 땅에서 그들을 인도하여 내신 그들의 조상들의 하나님 여호와를 버리고 다른 신들 곧 그들의 주위에 있는 백성의 신들을 따라 그들에게 절하여 여호와를 진노하시게 하였으되 (삿 2:12)"],
      [NAR, "곧 그들이 여호와를 버리고 바알과 아스다롯을 섬겼으므로 (삿 2:13)"],
      [NAR, "여호와께서 이스라엘에게 진노하사 노략하는 자의 손에 넘겨 주사 그들이 노략을 당하게 하시며 또 주위에 있는 모든 대적의 손에 팔아 넘기시매 그들이 다시는 대적을 당하지 못하였으며 (삿 2:14)"],
      [NAR, "그들이 어디로 가든지 여호와의 손이 그들에게 재앙을 내리시니 곧 여호와께서 말씀하신 것과 같고 여호와께서 그들에게 맹세하신 것과 같아서 그들의 괴로움이 심하였더라 (삿 2:15)"],
      [NAR, "▶ 이 일이 어떤 차례로 되풀이되는지 놓아 보아요."],
    ],
    jg_judges: [
      [NAR, "여호와께서 사사들을 세우사 노략자의 손에서 그들을 구원하게 하셨으나 (삿 2:16)"],
      [NAR, "그들이 그 사사들에게도 순종하지 아니하고 오히려 다른 신들을 따라가 음행하며 그들에게 절하고 여호와의 명령을 순종하던 그들의 조상들이 행하던 길에서 속히 치우쳐 떠나서 그와 같이 행하지 아니하였더라 (삿 2:17)"],
      [NAR, "여호와께서 그들을 위하여 사사들을 세우실 때에는 그 사사와 함께 하셨고 그 사사가 사는 날 동안에는 여호와께서 그들을 대적의 손에서 구원하셨으니 이는 그들이 대적에게 압박과 괴롭게 함을 받아 슬피 부르짖으므로 여호와께서 뜻을 돌이키셨음이거늘 (삿 2:18)"],
      [NAR, "그 사사가 죽은 후에는 그들이 돌이켜 그들의 조상들보다 더욱 타락하여 다른 신들을 따라 섬기며 그들에게 절하고 그들의 행위와 패역한 길을 그치지 아니하였으므로 (삿 2:19)"],
    ],
    jg_debir: [
      [NAR, "거기서 나아가서 드빌의 주민들을 쳤으니 드빌의 본 이름은 기럇 세벨이라 (삿 1:11)"],
      [NAR, "갈렙이 말하기를 기럇 세벨을 쳐서 그것을 점령하는 자에게는 내 딸 악사를 아내로 주리라 하였더니 (삿 1:12)"],
      [NAR, "갈렙의 아우 그나스의 아들인 옷니엘이 그것을 점령하였으므로 갈렙이 그의 딸 악사를 그에게 아내로 주었더라 (삿 1:13)"],
      [NAR, "▶ 갈렙 곁의 악사에게 가요."],
    ],
    jg_achsah: [
      [NAR, "악사가 출가할 때에 그에게 청하여 자기 아버지에게 밭을 구하자 하고 나귀에서 내리매 갈렙이 묻되 네가 무엇을 원하느냐 하니 (삿 1:14)"],
      [NAR, "이르되 내게 복을 주소서 아버지께서 나를 남방으로 보내시니 샘물도 내게 주소서 하매 갈렙이 윗샘과 아랫샘을 그에게 주었더라 (삿 1:15)"],
      [NAR, "▶ 남방의 윗샘을 찾아가요 — 산기슭 높은 곳에서 빛나요."],
    ],
    jg_upper: [
      [NAR, "▶ 윗샘이에요. 이제 아래쪽 골짜기의 아랫샘을 찾아요."],
    ],
    jg_lower: [
      [NAR, "▶ 아랫샘까지 찾았어요. \"갈렙이 윗샘과 아랫샘을 그에게 주었더라\" (삿 1:15)"],
      [NAR, "▶ 남쪽 길 어귀로 가요. 여호수아 뒤의 이야기가 이어져요."],
    ],
    jg_cushan: [
      [NAR, "이스라엘 자손이 여호와의 목전에 악을 행하여 자기들의 하나님 여호와를 잊어버리고 바알들과 아세라들을 섬긴지라 (삿 3:7)"],
      [NAR, "여호와께서 이스라엘에게 진노하사 그들을 메소보다미아 왕 구산 리사다임의 손에 파셨으므로 이스라엘 자손이 구산 리사다임을 팔 년 동안 섬겼더니 (삿 3:8)"],
      [NAR, "▶ 드빌 성 앞의 옷니엘에게 가요."],
    ],
    jg_othniel: [
      [NAR, "이스라엘 자손이 여호와께 부르짖으매 여호와께서 이스라엘 자손을 위하여 한 구원자를 세워 그들을 구원하게 하시니 그는 곧 갈렙의 아우 그나스의 아들 옷니엘이라 (삿 3:9)"],
      [NAR, "여호와의 영이 그에게 임하셨으므로 그가 이스라엘의 사사가 되어 나가서 싸울 때에 여호와께서 메소보다미아 왕 구산 리사다임을 그의 손에 넘겨 주시매 옷니엘의 손이 구산 리사다임을 이기니라 (삿 3:10)"],
      [NAR, "그 땅이 평온한 지 사십 년에 그나스의 아들 옷니엘이 죽었더라 (삿 3:11)"],
    ],
    jg_palms: [
      [NAR, "이스라엘 자손이 또 여호와의 목전에 악을 행하니라 이스라엘 자손이 여호와의 목전에 악을 행하므로 여호와께서 모압 왕 에글론을 강성하게 하사 그들을 대적하게 하시매 (삿 3:12)"],
      [NAR, "에글론이 암몬과 아말렉 자손들을 모아 가지고 와서 이스라엘을 쳐서 종려나무 성읍을 점령한지라 (삿 3:13)"],
      [NAR, "이에 이스라엘 자손이 모압 왕 에글론을 열여덟 해 동안 섬기니라 (삿 3:14)"],
      [NAR, "▶ 길갈 진영의 에훗에게 가요."],
    ],
    jg_ehud: [
      [NAR, "이스라엘 자손이 여호와께 부르짖으매 여호와께서 그들을 위하여 한 구원자를 세우셨으니 그는 곧 베냐민 사람 게라의 아들 왼손잡이 에훗이라 이스라엘 자손이 그를 통하여 모압 왕 에글론에게 공물을 바칠 때에 (삿 3:15)"],
      [NAR, "에훗이 길이가 한 규빗 되는 좌우에 날선 칼을 만들어 그의 오른쪽 허벅지 옷 속에 차고 (삿 3:16)"],
      [NAR, "공물을 모압 왕 에글론에게 바쳤는데 에글론은 매우 비둔한 자였더라 (삿 3:17)"],
      [NAR, "에훗이 공물 바치기를 마친 후에 공물을 메고 온 자들을 보내고 (삿 3:18)"],
      [NAR, "▶ 길갈 근처 돌 뜨는 곳으로 가요."],
    ],
    jg_quarry: [
      [NAR, "자기는 길갈 근처 돌 뜨는 곳에서부터 돌아와서 이르되 왕이여 내가 은밀한 일을 왕에게 아뢰려 하나이다 하니 왕이 명령하여 조용히 하라 하매 모셔 선 자들이 다 물러간지라 (삿 3:19)"],
      [NAR, "▶ 종려나무 성읍, 왕의 다락방으로 가요."],
    ],
    jg_palace: [
      [NAR, "에훗이 그에게로 들어가니 왕은 서늘한 다락방에 홀로 앉아 있는 중이라 에훗이 이르되 내가 하나님의 명령을 받들어 왕에게 아뢸 일이 있나이다 하매 왕이 그의 좌석에서 일어나니 (삿 3:20)"],
      [NAR, "에훗이 왼손을 뻗쳐 그의 오른쪽 허벅지 위에서 칼을 빼어 왕의 몸을 찌르매 (삿 3:21)"],
      [NAR, "에훗이 현관에 나와서 다락문들을 뒤에서 닫아 잠그니라 (삿 3:23)"],
      [NAR, "에훗이 나간 후에 왕의 신하들이 들어와서 다락문들이 잠겼음을 보고 이르되 왕이 분명히 서늘한 방에서 그의 발을 가리우신다 하고 (삿 3:24)"],
      [NAR, "그들이 오래 기다려도 왕이 다락문들을 열지 아니하는지라 열쇠를 가지고 열어 본즉 그들의 군주가 이미 땅에 엎드러져 죽었더라 (삿 3:25)"],
    ],
    jg_horn: [
      [NAR, "그들이 기다리는 동안에 에훗이 피하여 돌 뜨는 곳을 지나 스이라로 도망하니라 (삿 3:26)"],
      [NAR, "그가 이르러 에브라임 산지에서 나팔을 불매 이스라엘 자손이 산지에서 그를 따라 내려오니 에훗이 앞서 가며 (삿 3:27)"],
      [NAR, "그들에게 이르되 (삿 3:28)"],
      [EHUD, "나를 따르라 여호와께서 너희의 원수들인 모압을 너희의 손에 넘겨 주셨느니라"],
      [NAR, "▶ 요단 강 나루로 내려가요."],
    ],
    jg_ford: [
      [NAR, "▶ \"무리가 에훗을 따라 내려가 모압 맞은편 요단 강 나루를 장악하여 한 사람도 건너지 못하게 하였고\" (삿 3:28)"],
    ],
    jg_ford_done: [
      [NAR, "그 때에 모압 사람 약 만 명을 죽였으니 모두 장사요 모두 용사라 한 사람도 도망하지 못하였더라 (삿 3:29)"],
      [NAR, "그 날에 모압이 이스라엘 수하에 굴복하매 그 땅이 팔십 년 동안 평온하였더라 (삿 3:30)"],
      [NAR, "▶ 강가에 놓인 소 모는 막대기가 보여요."],
    ],
    jg_shamgar: [
      [NAR, "에훗 후에는 아낫의 아들 삼갈이 있어 소 모는 막대기로 블레셋 사람 육백 명을 죽였고 그도 이스라엘을 구원하였더라 (삿 3:31)"],
    ],
    jg_deborah: [
      [NAR, "에훗이 죽으니 이스라엘 자손이 또 여호와의 목전에 악을 행하매 (삿 4:1)"],
      [NAR, "여호와께서 하솔에서 통치하는 가나안 왕 야빈의 손에 그들을 파셨으니 그의 군대 장관은 하로셋 학고임에 거주하는 시스라요 (삿 4:2)"],
      [NAR, "야빈 왕은 철 병거 구백 대가 있어 이십 년 동안 이스라엘 자손을 심히 학대했으므로 이스라엘 자손이 여호와께 부르짖었더라 (삿 4:3)"],
      [NAR, "그 때에 랍비돗의 아내 여선지자 드보라가 이스라엘의 사사가 되었는데 (삿 4:4)"],
      [NAR, "그는 에브라임 산지 라마와 벧엘 사이 드보라의 종려나무 아래에 거주하였고 이스라엘 자손은 그에게 나아가 재판을 받더라 (삿 4:5)"],
      [NAR, "드보라가 사람을 보내어 아비노암의 아들 바락을 납달리 게데스에서 불러다가 그에게 이르되 (삿 4:6)"],
      [DEBORAH, "이스라엘의 하나님 여호와께서 이같이 명령하지 아니하셨느냐 너는 납달리 자손과 스불론 자손 만 명을 거느리고 다볼 산으로 가라"],
      [DEBORAH, "내가 야빈의 군대 장관 시스라와 그의 병거들과 그의 무리를 기손 강으로 이끌어 네게 이르게 하고 그를 네 손에 넘겨 주리라 하셨느니라"],
      [NAR, "▶ 종려나무 곁의 바락에게 가요."],
    ],
    jg_barak: [
      [NAR, "바락이 그에게 이르되 만일 당신이 나와 함께 가면 내가 가려니와 만일 당신이 나와 함께 가지 아니하면 나도 가지 아니하겠노라 하니 (삿 4:8)"],
      [NAR, "이르되 내가 반드시 너와 함께 가리라 그러나 네가 이번에 가는 길에서는 영광을 얻지 못하리니 이는 여호와께서 시스라를 여인의 손에 파실 것임이니라 하고 드보라가 일어나 바락과 함께 게데스로 가니라 (삿 4:9)"],
      [NAR, "바락이 스불론과 납달리를 게데스로 부르니 만 명이 그를 따라 올라가고 드보라도 그와 함께 올라가니라 (삿 4:10)"],
      [NAR, "▶ 북쪽 길로 이스르엘 골짜기에 올라가요 — 다볼 산이 있어요."],
    ],
    jg_tabor: [
      [NAR, "모세의 장인 호밥의 자손 중 겐 사람 헤벨이 자기 족속을 떠나 게데스에 가까운 사아난님 상수리나무 곁에 이르러 장막을 쳤더라 (삿 4:11)"],
      [NAR, "아비노암의 아들 바락이 다볼 산에 오른 것을 사람들이 시스라에게 알리매 (삿 4:12)"],
      [NAR, "시스라가 모든 병거 곧 철 병거 구백 대와 자기와 함께 있는 모든 백성을 하로셋학고임에서부터 기손 강으로 모은지라 (삿 4:13)"],
      [NAR, "▶ 다볼 산기슭의 드보라에게 가요."],
    ],
    jg_rise: [
      [NAR, "드보라가 바락에게 이르되 (삿 4:14)"],
      [DEBORAH, "일어나라 이는 여호와께서 시스라를 네 손에 넘겨 주신 날이라 여호와께서 너에 앞서 나가지 아니하시느냐"],
    ],
    jg_kishon: [
      [NAR, "여호와께서 바락 앞에서 시스라와 그의 모든 병거와 그의 온 군대를 칼날로 혼란에 빠지게 하시매 시스라가 병거에서 내려 걸어서 도망한지라 (삿 4:15)"],
      [NAR, "바락이 그의 병거들과 군대를 추격하여 하로셋학고임에 이르니 시스라의 온 군대가 다 칼에 엎드러졌고 한 사람도 남은 자가 없었더라 (삿 4:16)"],
      [NAR, "▶ 서쪽, 사아난님 상수리나무 곁의 장막으로 가요."],
    ],
    jg_jael: [
      [NAR, "시스라가 걸어서 도망하여 겐 사람 헤벨의 아내 야엘의 장막에 이르렀으니 이는 하솔 왕 야빈과 겐 사람 헤벨의 집 사이에는 화평이 있음이라 (삿 4:17)"],
      [NAR, "야엘이 나가 시스라를 영접하며 그에게 말하되 나의 주여 들어오소서 내게로 들어오시고 두려워하지 마소서 하매 그가 그 장막에 들어가니 야엘이 이불로 그를 덮으니라 (삿 4:18)"],
      [NAR, "시스라가 그에게 말하되 청하노니 내게 물을 조금 마시게 하라 내가 목이 마르다 하매 우유 부대를 열어 그에게 마시게 하고 그를 덮으니 (삿 4:19)"],
      [NAR, "그가 또 이르되 장막 문에 섰다가 만일 사람이 와서 네게 묻기를 여기 어떤 사람이 있느냐 하거든 너는 없다 하라 하고 (삿 4:20)"],
      [NAR, "그가 깊이 잠드니 헤벨의 아내 야엘이 장막 말뚝을 가지고 손에 방망이를 들고 그에게로 가만히 가서 말뚝을 그의 관자놀이에 박으매 말뚝이 꿰뚫고 땅에 박히니 그가 기절하여 죽으니라 (삿 4:21)"],
      [NAR, "바락이 시스라를 추격할 때에 야엘이 나가서 그를 맞아 그에게 이르되 오라 네가 찾는 그 사람을 내가 네게 보이리라 하매 바락이 그에게 들어가 보니 시스라가 엎드러져 죽었고 말뚝이 그의 관자놀이에 박혔더라 (삿 4:22)"],
      [NAR, "▶ 다볼 산기슭으로 돌아가요."],
    ],
    jg_song: [
      [NAR, "이와 같이 이 날에 하나님이 가나안 왕 야빈을 이스라엘 자손 앞에 굴복하게 하신지라 (삿 4:23)"],
      [NAR, "이스라엘 자손의 손이 가나안 왕 야빈을 점점 더 눌러서 마침내 가나안 왕 야빈을 진멸하였더라 (삿 4:24)"],
      [NAR, "이 날에 드보라와 아비노암의 아들 바락이 노래하여 이르되 (삿 5:1)"],
      [SONG, "이스라엘의 영솔자들이 영솔하였고 백성이 즐거이 헌신하였으니 여호와를 찬송하라"],
      [SONG, "너희 왕들아 들으라 통치자들아 귀를 기울이라 나 곧 내가 여호와를 노래할 것이요 이스라엘의 하나님 여호와를 찬송하리로다"],
      [SONG, "깰지어다 깰지어다 드보라여 깰지어다 깰지어다 너는 노래할지어다 일어날지어다 바락이여 아비노암의 아들이여 네가 사로잡은 자를 끌고 갈지어다"],
      [SONG, "별들이 하늘에서부터 싸우되 그들이 다니는 길에서 시스라와 싸웠도다"],
      [SONG, "기손 강은 그 무리를 표류시켰으니 이 기손 강은 옛 강이라 내 영혼아 네가 힘 있는 자를 밟았도다"],
      [NAR, "여호와여 주의 원수들은 다 이와 같이 망하게 하시고 주를 사랑하는 자들은 해가 힘 있게 돋음 같게 하시옵소서 하니라 그 땅이 사십 년 동안 평온하였더라 (삿 5:31)"],
    ],
  });

  // 사사 조각을 주는 해설 끝(대사 끝에 붙임)
  DLG.jg_othniel.push({ event: 'jOthniel' });
  DLG.jg_shamgar.push({ event: 'jShamgar' });
  DLG.jg_ford_done.push({ event: 'jEhud' });
  DLG.jg_kishon.unshift({ event: 'kishon' });
  DLG.jg_song.push({ event: 'jDeborah' });

  const { mgOpen, mgCloseAll, completeTask } = api;
  const btnCss = 'padding:8px 6px;border-radius:10px;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.08);color:#f5e9d0;font-size:13px';
  const LIVES = 3, hearts = n => '❤️'.repeat(Math.max(0, n)) + '🤍'.repeat(Math.max(0, LIVES - n));
  const OUT = '❤️을 다 썼어요 — 처음부터 다시';
  const msgBox = m => `<div style="text-align:center;color:#ffd27a;font-weight:800;min-height:34px;padding:6px 10px 0;font-size:12.5px">${m}</div>`;
  // 🏅 5편 배지(SQL claim_odyssey_achieve 키 badge-cycle_remember · badge-kishon)
  Object.assign(api.BADGES, { cycle_remember: { ico: '🔁', name: '돌아온 길을 기억한 사람' }, kishon: { ico: '🌊', name: '기손 강을 건넌 사람' } });
  function giveBadge(k){ const S = api.ST; if (S.badges.includes(k)) return; S.badges.push(k); api.saveST(); setTimeout(() => api.toast(`${api.BADGES[k].ico} 배지 획득: ${api.BADGES[k].name}`, 2600), 900); }

  // 차례 맞추기 공용 틀(4편과 같은 방식): 카드를 본문의 차례대로 누른다. 틀리면 ❤️
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
      if (+b.dataset.od === next){ next++; msg = ''; }
      else if (--life <= 0){ next = 0; life = LIVES; perfect = false; shown.sort(() => Math.random() - 0.5); msg = OUT; }
      else { perfect = false; msg = `${hint} ${hearts(life)}`; }
      draw(); };
    api.mgAct.onclick = () => { if (next < cards.length) return; api.mgArea.onclick = null; mgCloseAll(); if (onDone) onDone(perfect); completeTask(q); };
    api.mg.onClose = () => { api.mgArea.onclick = null; };
  }
  // 🔁 되풀이(삿 2:11-19) — 사사 시대에 거듭된 일을 본문의 차례대로
  function cycleGame(q){
    api.runDialog(DLG.jg_cycle, () => orderPlay(q, '🔁 되풀이된 일', '삿 2:11-19 — 이스라엘에게 어떤 일이 되풀이되었는지 본문에 나온 차례대로 놓아요.', [
      ['🙇 바알들을 섬김', '(2:11)'], ['⚔ 노략하는 자의 손에 넘겨짐', '(2:14)'], ['😢 괴로움이 심함', '(2:15)'], ['🛡 여호와께서 사사들을 세우심', '(2:16)'], ['↩ 사사가 죽은 후 더욱 타락함', '(2:19)'],
    ], '삿 2장을 다시 떠올려 봐요', '✓ 사사 시대의 되풀이를 차례대로 놓았어요', perfect => { if (perfect) giveBadge('cycle_remember'); }), null, 'jg_cycle');
  }
  // 🚫 요단 강 나루 장악(삿 3:28) — 건너려는 나루를 눌러 막는다(칼을 쓰는 조작은 없다). 빈 나루를 누르면 ❤️
  function fordGame(q){
    api.runDialog(DLG.jg_ford, () => {
      const N = 5, NEED = 10, LIMIT = 16000; let got = 0, life = LIVES, msg = '', pos = -1, t0 = 0, timer = null, tick = null, done = false;
      mgOpen('🚫 요단 강 나루', '"모압 맞은편 요단 강 나루를 장악하여 한 사람도 건너지 못하게 하였고" (삿 3:28) — 🏃가 나타난 나루를 눌러 막아요. 16초 안에 열 번!');
      const hop = () => { let n; do { n = Math.floor(Math.random() * N); } while (n === pos); pos = n; };
      const draw = () => { const left = t0 ? Math.max(0, Math.ceil((LIMIT - (performance.now() - t0)) / 1000)) : 16;
        api.mgArea.innerHTML = done ? `<div style="padding:16px;text-align:center;color:#ffd27a;font-weight:800">✓ 한 사람도 건너지 못했어요</div>`
          : `<div style="text-align:center;font-size:13px;padding:4px">🚫 막은 나루 ${got} / ${NEED} · ⏱ ${left}초 · ${hearts(life)}</div><div style="display:grid;grid-template-columns:repeat(${N},1fr);gap:5px;padding:6px 10px">${[...Array(N).keys()].map(i => `<button data-fd="${i}" style="${btnCss};font-size:22px;padding:12px 0;background:${i === pos ? 'rgba(255,210,122,.25)' : 'rgba(79,159,181,.25)'}">${i === pos ? '🏃' : '🌊'}</button>`).join('')}</div>` + msgBox(msg);
        api.mgAct.textContent = done ? '계속' : '열 번 막으면 계속'; api.mgAct.disabled = !done; };
      const reset = m => { got = 0; t0 = 0; clearTimeout(timer); timer = null; life = LIVES; msg = m; hop(); };
      hop(); draw();
      tick = setInterval(() => { if (!done && t0){ hop(); draw(); } }, 1250);
      api.mgArea.onclick = e => { const b = e.target.closest('[data-fd]'); if (!b || done) return;
        if (!t0){ t0 = performance.now(); timer = setTimeout(() => { if (!done){ reset('시간이 지났어요 — 처음부터 다시'); draw(); } }, LIMIT); }
        if (+b.dataset.fd === pos){ got++; msg = ''; hop(); if (got >= NEED){ done = true; clearTimeout(timer); clearInterval(tick); } }
        else if (--life <= 0) reset(OUT); else msg = `건너려는 사람이 없는 나루예요 ${hearts(life)}`;
        draw(); };
      api.mgAct.onclick = () => { if (!done) return; api.mgArea.onclick = null; mgCloseAll(); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; clearTimeout(timer); clearInterval(tick); };
    }, null, 'jg_ford');
  }
  // ⛰ "일어나라"(삿 4:14) — 드보라의 말이 들릴 때 내려가기 시작하고, 기손 강이 불어난 길(5:21)을 피해 마른 길로 내려간다
  function taborGame(q){
    api.runDialog(DLG.jg_rise, () => {
      const ROUNDS = 7; let phase = 'wait', heard = false, r = 0, wet = [], life = LIVES, msg = '', waitT = null, perfect = true;
      mgOpen('⛰ 다볼 산에서 내려가기', '"일어나라 이는 여호와께서 시스라를 네 손에 넘겨 주신 날이라" (삿 4:14) — 드보라의 말이 들리면 내려가기 시작해요. 그 전에 내려가면 ❤️');
      const roll = () => { const w = Math.random() < 0.5 ? 1 : 2; const s = new Set(); while (s.size < w) s.add(Math.floor(Math.random() * 3)); wet = [...s]; };
      const draw = () => {
        if (phase === 'wait') api.mgArea.innerHTML = `<div style="padding:14px;text-align:center;font-size:15px;font-weight:800">${heard ? '🗣 "일어나라!"' : '⛰ 다볼 산 위에서 기다려요…'}</div><div style="padding:0 14px"><button data-tb="go" style="${btnCss};width:100%;font-size:15px">⬇ 내려가기</button></div>` + msgBox(msg || hearts(life));
        else if (phase === 'run') api.mgArea.innerHTML = `<div style="text-align:center;font-size:13px;padding:4px">⛰→🏞 ${r} / ${ROUNDS} · ${hearts(life)}</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:6px 10px">${[0, 1, 2].map(i => `<button data-tb="${i}" style="${btnCss};font-size:13px;padding:12px 0">${wet.includes(i) ? '🌊 물이 넘친 길' : '🟫 마른 길'}</button>`).join('')}</div>` + msgBox(msg || '"기손 강은 그 무리를 표류시켰으니" (삿 5:21) — 마른 길로!');
        else api.mgArea.innerHTML = `<div style="padding:16px;text-align:center;color:#ffd27a;font-weight:800">✓ 만 명이 다볼 산에서 내려갔어요</div>`;
        api.mgAct.textContent = phase === 'done' ? '계속' : '다 내려가면 계속'; api.mgAct.disabled = phase !== 'done'; };
      const listen = () => { heard = false; clearTimeout(waitT); waitT = setTimeout(() => { heard = true; draw(); }, 1500 + Math.random() * 2500); };
      const lose = m => { perfect = false; if (--life <= 0){ phase = 'wait'; r = 0; life = LIVES; msg = OUT; listen(); } else msg = `${m} ${hearts(life)}`; };
      listen(); draw();
      api.mgArea.onclick = e => { const b = e.target.closest('[data-tb]'); if (!b) return; const k = b.dataset.tb;
        if (phase === 'wait' && k === 'go'){ if (heard){ phase = 'run'; msg = ''; roll(); } else { lose('아직이에요 — 드보라의 말을 기다려요'); } }
        else if (phase === 'run'){ if (wet.includes(+k)) lose('물이 넘친 길이에요'); else { r++; msg = ''; if (r >= ROUNDS){ phase = 'done'; } else roll(); } }
        draw(); };
      api.mgAct.onclick = () => { if (phase !== 'done') return; api.mgArea.onclick = null; clearTimeout(waitT); mgCloseAll(); if (perfect) giveBadge('kishon'); completeTask(q); };
      api.mg.onClose = () => { api.mgArea.onclick = null; clearTimeout(waitT); };
    }, null, 'jg_rise');
  }

  // ── 연출 ──
  function flash(col, o = 0.5){ const fl = document.getElementById('flash'); if (!fl) return; fl.style.transition = 'none'; fl.style.background = col; fl.style.opacity = String(o); setTimeout(() => { fl.style.transition = 'opacity 1.2s'; fl.style.opacity = '0'; }, 120); setTimeout(() => { fl.style.background = ''; }, 1500); }
  const refresh = zid => { if (api.Z && api.Z.id === zid) world(zid); };
  function kishon(){ kishonShow = true; flash('#dcecff', 0.45); refresh('jezreel'); try { api.startCine('jgKishon', KISHON[0], api.heightAt(KISHON[0], KISHON[1]) + 3, KISHON[1], { r: 16, h: 7, dur: 4.5, spin: 0.4 }); } catch (e){} }
  const judge = n => () => { if (api.addJudge) api.addJudge(n); };

  // ── 마을에 놓이는 것 ──
  let worldObj = null;
  const propFail = {};
  function needProps(names, zid){
    const need = names.filter(n => !api.propTemplates[n] && !propFail[n]); if (!need.length) return;
    api.loadProps(need).then(() => { need.forEach(n => { if (!api.propTemplates[n]) propFail[n] = true; }); refresh(zid); }).catch(() => { need.forEach(n => propFail[n] = true); });
  }
  function world(zid){
    if (worldObj && worldObj.parent) worldObj.parent.remove(worldObj); worldObj = null;
    const p = cur(); if (!p) return;
    if (api.setRiver) api.setRiver(false);   // 4편의 마른 요단은 지나간 일
    const g = new THREE.Group(), M = c => new THREE.MeshToonMaterial({ color: c, gradientMap: api.toonGradient });
    const put = (geo, mat, x, dy, z, ry = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, api.heightAt(x, z) + dy, z); m.rotation.y = ry; m.castShadow = true; g.add(m); return m; };
    const obst = (x, z, r) => { if (!api.obstacles.some(o => o.x === x && o.z === z)) api.obstacles.push({ x, z, r }); };   // 다시 그려도 한 번만
    const prop = (n, x, z, ry = 0, dy = 0) => { const T = api.propTemplates[n]; if (!T) return null; const o = T.holder.clone(true); o.position.set(x, api.heightAt(x, z) + dy, z); o.rotation.y = ry; g.add(o); return o; };
    if (zid === 'gilgal'){
      // 여리고 성터: 무너진 성벽 돌무더기(수 6:20) 곁에 모압 왕이 차지한 종려나무 성읍(삿 3:13)
      const rub = M(0x8a7a62), rub2 = M(0x6e604c);
      for (let i = 0; i < 30; i++){ const a = i / 30 * Math.PI * 2, rr = JR + (Math.random() - 0.5) * 1.6; const r = put(new THREE.DodecahedronGeometry(0.5 + Math.random() * 0.7), i % 2 ? rub : rub2, JC[0] + Math.cos(a) * rr, 0.3, JC[1] + Math.sin(a) * rr); r.rotation.set(Math.random(), Math.random(), 0); }
      needProps(['env-date-palm'], 'gilgal');
      [[-4, 4], [3, 6], [-6, -2], [5, -3], [0, 9], [-9, 5]].forEach(([dx, dz], i) => prop('env-date-palm', PALMS[0] + dx, PALMS[1] + dz, i));
      // 에글론의 집과 서늘한 다락방(삿 3:20)
      const wall = M(0xd8c4a0), roof = M(0xb89a70);
      put(new THREE.BoxGeometry(6, 3, 5), wall, PALACE[0], 1.5, PALACE[1]); put(new THREE.BoxGeometry(3.2, 2.2, 3), wall, PALACE[0] - 0.8, 4.1, PALACE[1]); put(new THREE.BoxGeometry(3.6, 0.25, 3.4), roof, PALACE[0] - 0.8, 5.3, PALACE[1]);
      obst(PALACE[0], PALACE[1], 3.4);
      // 길갈의 열두 돌은 "오늘까지"(수 4:9) 그 자리에
      const st = M(0xd8cdb6); for (let i = 0; i < 12; i++){ const a = i / 12 * Math.PI * 2; const s = put(new THREE.DodecahedronGeometry(0.42, 0), st, MEMO[0] + Math.cos(a) * 1.6, 0.3, MEMO[1] + Math.sin(a) * 1.6); s.rotation.set(i, i * 2, 0); }
      // 3장 돌 뜨는 곳 · 소 모는 막대기
      if (p.ch === 2){ for (let i = 0; i < 6; i++){ const s = put(new THREE.BoxGeometry(0.9, 0.5, 0.7), M(0xc8b896), QUARRY[0] + (i % 3) * 1.2 - 1.2, 0.25, QUARRY[1] + Math.floor(i / 3) * 1.1); s.rotation.y = i * 0.7; }
        if (p.step >= 7 || p.cleared){ const goad = put(new THREE.CylinderGeometry(0.035, 0.05, 2.4, 6), M(0x7a5a3a), SHAMGAR[0], 0.08, SHAMGAR[1]); goad.rotation.z = Math.PI / 2; } }
    }
    if (zid === 'hebron'){
      // 드빌(기럇 세벨) — 옷니엘이 점령한 성(삿 1:13)
      const stone = M(0xc8ad84);
      for (let i = 0; i < 14; i++){ const a = i / 14 * Math.PI * 2; if (Math.abs(a - Math.PI) < 0.35) continue;   // 서쪽 성문
        const w = put(new THREE.BoxGeometry(2.6, 3, 1.1), stone, DEBIR[0] + Math.cos(a) * DEBR, 1.5, DEBIR[1] + Math.sin(a) * DEBR); w.rotation.y = -a + Math.PI / 2;
        obst(DEBIR[0] + Math.cos(a) * DEBR, DEBIR[1] + Math.sin(a) * DEBR, 1.3); }
      // 윗샘과 아랫샘(삿 1:15) — 찾은 뒤로 물이 고여 있다
      const water = new THREE.MeshToonMaterial({ color: 0x4f9fb5, gradientMap: api.toonGradient, transparent: true, opacity: 0.85 });
      const spring = ([x, z]) => { const w = new THREE.Mesh(new THREE.CircleGeometry(1.6, 20).rotateX(-Math.PI / 2), water); w.position.set(x, api.heightAt(x, z) + 0.06, z); g.add(w);
        for (let i = 0; i < 6; i++){ const a = i / 6 * Math.PI * 2; put(new THREE.DodecahedronGeometry(0.3, 0), M(0x9a8a72), x + Math.cos(a) * 1.8, 0.1, z + Math.sin(a) * 1.8); } };
      if (p.ch > 1 || (p.ch === 1 && (p.cleared || p.step >= 4))) spring(UPPER);
      if (p.ch > 1 || (p.ch === 1 && (p.cleared || p.step >= 5))) spring(LOWER);
    }
    if (zid === 'shiloh'){
      // 드보라의 종려나무(삿 4:5)
      needProps(['env-date-palm'], 'shiloh'); prop('env-date-palm', DEBP[0], DEBP[1], 0.6);
    }
    if (zid === 'jezreel'){
      // 바락의 만 명이 모인 다볼 산기슭(삿 4:10) · 시스라의 철 병거(4:13) — 4:15 뒤로는 강가에 흩어져 기운다
      needProps(['tent-small', 'tent-mid'], 'jezreel');
      [[-6, 4], [-2, 8], [4, 9], [8, 4]].forEach(([dx, dz], i) => prop(i % 2 ? 'tent-small' : 'tent-mid', TABOR_FOOT[0] + dx, TABOR_FOOT[1] + dz, i * 1.3));
      if (p.ch >= 3){
        const iron = M(0x5a5a62), wheel = M(0x3a3a40), out = fled();
        for (let i = 0; i < 7; i++){ const x = KISHON[0] + (i % 4) * 3.2 - 2 + (out ? 4 : 0), z = KISHON[1] - 9 + Math.floor(i / 4) * 7 + i * 0.8;
          const c = new THREE.Group(); const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.7, 1.1), iron); body.position.y = 0.75; c.add(body);
          for (const dz of [-0.62, 0.62]){ const w = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.12, 12), wheel); w.rotation.x = Math.PI / 2; w.position.set(0, 0.5, dz); c.add(w); }
          c.position.set(x, api.heightAt(x, z), z); c.rotation.set(out ? 0.35 : 0, i * 0.4 + (out ? 1.2 : 0), out ? 0.25 : 0); c.traverse(o => { if (o.isMesh) o.castShadow = true; }); g.add(c); }
        if (out){ const flood = new THREE.Mesh(new THREE.PlaneGeometry(12, 70).rotateX(-Math.PI / 2), new THREE.MeshToonMaterial({ color: 0x5aa6bd, gradientMap: api.toonGradient, transparent: true, opacity: 0.7 })); flood.position.set(-37, api.heightAt(-37, 0) + 0.05, 0); g.add(flood); }
      }
      // 겐 사람 헤벨의 장막 · 사아난님 상수리나무 곁(삿 4:11)
      prop('tent-small', JAEL_T[0], JAEL_T[1], 2.4); needProps(['env-acacia'], 'jezreel'); prop('env-acacia', JAEL_T[0] - 3.5, JAEL_T[1] - 2.5, 1.1);
    }
    api.zoneRoot.add(g); worldObj = g;
  }

  const T = n => `📜 사사들과 함께 ${n}장`;
  return {
    id: 'judges',
    chapters: [
      { title: `${T(1)} — 여호와를 알지 못하는 세대`, clearTitle: '🎉 5편 1장 「여호와를 알지 못하는 세대」 완료!', next: '2장: 옷니엘',
        steps: [
          { id: 'g1s1', zone: 'gilgal', obj: '길갈에서 보김으로 올라온 여호와의 사자', where: '길갈 진영 동쪽(빛나는 곳)', point: 'jg_angel', dlg: 'jg_angel' },
          { id: 'g1s2', zone: 'gilgal', obj: '백성이 소리를 높여 운 곳', where: '서쪽 언덕 보김(빛나는 곳)', point: 'jg_bochim', dlg: 'jg_bochim' },
          { id: 'g1s3', zone: 'gilgal', obj: '여호수아 뒤에 일어난 다른 세대', where: '길갈 진영 가운데(빛나는 곳)', point: 'jg_camp', dlg: 'jg_gen' },
          { id: 'g1s4', zone: 'gilgal', obj: '되풀이된 일', where: '길갈 진영 가운데(빛나는 곳)', point: 'jg_camp', game: 'cycle', doneDlg: 'jg_judges', reward: { verse: ['jdg2-10', 'jdg2-16'], clear: true } },
        ] },
      { title: `${T(2)} — 옷니엘`, clearTitle: '🎉 5편 2장 「옷니엘」 완료!', next: '3장: 왼손잡이 에훗',
        steps: [
          { id: 'g2s1', zone: 'gilgal', obj: '남쪽 길로 헤브론 산지에 올라가기', where: '길갈 남쪽 길의 초록 빛기둥', exit: 'to-hebron' },
          { id: 'g2s2', zone: 'hebron', obj: '기럇 세벨을 점령하는 자에게', where: '드빌 성 서쪽 성문 앞의 갈렙', npc: 'jg_caleb', dlg: 'jg_debir' },
          { id: 'g2s3', zone: 'hebron', obj: '"샘물도 내게 주소서"', where: '갈렙 곁의 악사', npc: 'jg_achsah', dlg: 'jg_achsah' },
          { id: 'g2s4', zone: 'hebron', obj: '남방의 윗샘 찾기', where: '남동쪽 산기슭 높은 곳(빛나는 곳)', point: 'jg_upper', dlg: 'jg_upper' },
          { id: 'g2s5', zone: 'hebron', obj: '아랫샘 찾기', where: '서쪽 골짜기 낮은 곳(빛나는 곳)', point: 'jg_lower', dlg: 'jg_lower' },
          { id: 'g2s6', zone: 'hebron', obj: '구산 리사다임을 섬긴 여덟 해', where: '남쪽 길 어귀(빛나는 곳)', point: 'jg_cushan', dlg: 'jg_cushan' },
          { id: 'g2s7', zone: 'hebron', obj: '여호와께 부르짖으매 — 옷니엘', where: '드빌 성 앞의 옷니엘', npc: 'jg_othniel', dlg: 'jg_othniel', reward: { verse: 'jdg3-9', clear: true } },
        ] },
      { title: `${T(3)} — 왼손잡이 에훗`, clearTitle: '🎉 5편 3장 「왼손잡이 에훗」 완료!', next: '4장: 드보라와 바락, 야엘',
        steps: [
          { id: 'g3s1', zone: 'hebron', obj: '북쪽 길로 길갈에 내려가기', where: '헤브론 산지 북쪽 길의 초록 빛기둥', exit: 'to-gilgal5' },
          { id: 'g3s2', zone: 'gilgal', obj: '모압 왕 에글론과 종려나무 성읍', where: '무너진 여리고 성터 남쪽의 종려나무들(빛나는 곳)', point: 'jg_palms', dlg: 'jg_palms' },
          { id: 'g3s3', zone: 'gilgal', obj: '공물을 메고 가는 에훗', where: '길갈 진영의 에훗', npc: 'jg_ehud', dlg: 'jg_ehud' },
          { id: 'g3s4', zone: 'gilgal', obj: '길갈 근처 돌 뜨는 곳', where: '열두 돌 서쪽의 돌 뜨는 곳(빛나는 곳)', point: 'jg_quarry', dlg: 'jg_quarry' },
          { id: 'g3s5', zone: 'gilgal', obj: '서늘한 다락방', where: '여리고 성터의 왕의 집(빛나는 곳)', point: 'jg_palace', dlg: 'jg_palace' },
          { id: 'g3s6', zone: 'gilgal', obj: '에브라임 산지에서 나팔을 불매', where: '북서쪽 에브라임 산지(빛나는 곳)', point: 'jg_horn', dlg: 'jg_horn' },
          { id: 'g3s7', zone: 'gilgal', obj: '요단 강 나루 장악하기', where: '동쪽 요단 강 나루(빛나는 곳)', point: 'jg_ford', game: 'ford', doneDlg: 'jg_ford_done' },
          { id: 'g3s8', zone: 'gilgal', obj: '에훗 후에는 — 삼갈', where: '요단 강가의 소 모는 막대기(빛나는 곳)', point: 'jg_shamgar', dlg: 'jg_shamgar', reward: { verse: 'jdg3-15', clear: true } },
        ] },
      { title: `${T(4)} — 드보라와 바락, 야엘`, clearTitle: '🎉 5편 4장 「드보라와 바락, 야엘」 완료!', next: '5장: 기드온을 부르심 (준비 중)',
        steps: [
          { id: 'g4s1', zone: 'gilgal', obj: '북쪽 길로 실로에 올라가기', where: '길갈 북쪽 길의 초록 빛기둥', exit: 'to-shiloh' },
          { id: 'g4s2', zone: 'shiloh', obj: '드보라의 종려나무 아래', where: '서북쪽 종려나무 아래의 드보라', npc: 'jg_deborah', dlg: 'jg_deborah' },
          { id: 'g4s3', zone: 'shiloh', obj: '"당신이 나와 함께 가면"', where: '종려나무 곁의 바락', npc: 'jg_barak', dlg: 'jg_barak' },
          { id: 'g4s4', zone: 'shiloh', obj: '북쪽 이스르엘 골짜기로', where: '실로 서북쪽 길의 초록 빛기둥', exit: 'to-jezreel' },
          { id: 'g4s5', zone: 'jezreel', obj: '다볼 산에 오른 바락', where: '북동쪽 다볼 산 비탈(빛나는 곳)', point: 'jg_tabor', dlg: 'jg_tabor' },
          { id: 'g4s6', zone: 'jezreel', obj: '"일어나라" — 다볼 산에서 내려가기', where: '다볼 산기슭의 드보라', npc: 'jg_deborah_t', game: 'tabor', doneDlg: 'jg_kishon' },
          { id: 'g4s7', zone: 'jezreel', obj: '겐 사람 헤벨의 장막', where: '남서쪽 상수리나무 곁의 장막(빛나는 곳)', point: 'jg_jael', dlg: 'jg_jael' },
          { id: 'g4s8', zone: 'jezreel', obj: '드보라와 바락의 노래', where: '다볼 산기슭(빛나는 곳)', point: 'jg_song', dlg: 'jg_song', reward: { verse: ['jdg4-14', 'jdg5-31'], clear: true } },
        ] },
    ],
    games: { cycle: cycleGame, ford: fordGame, tabor: taborGame },
    events: { kishon, jOthniel: judge('옷니엘'), jEhud: judge('에훗'), jShamgar: judge('삼갈'), jDeborah: judge('드보라') },
    world: zid => world(zid),
  };
});
