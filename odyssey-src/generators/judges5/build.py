# judges5.js 조립: 머리(1부 자리) + 2부 자리 + 대사(1·2부, gen_dlg.py가 만든 것) + 꼬리(게임·연출·장) — 부마다 조각 파일을 끼운다
import os, subprocess, sys
H = os.path.dirname(os.path.abspath(__file__))
def rd(f): return open(os.path.join(H, f), encoding='utf-8').read().replace('\r\n', '\n')
def rep(s, a, b):
    assert s.count(a) == 1, (s.count(a), a[:80]); return s.replace(a, b)

head = rd('judges5_head.js')
head = rep(head, "jgCaleb: at(1, 1, 2), jgAchsah: at(1, 1, 4), jgUpper: at(1, 3, 3), jgLower: at(1, 4, 4), jgCushan: at(1, 5, 5), jgOthniel: () => at(1, 1, 6)() && !at(1, 2, 4)() || at(1, 6, 6)(),",
           "jgCaleb: at(1, 1, 6), jgAchsah: at(1, 1, 6), jgUpper: at(1, 3, 3), jgLower: at(1, 4, 4), jgCushan: at(1, 5, 5), jgOthniel: at(1, 1, 6),")
head = rep(head, "// 5편 「사사들과 함께」 — 사사기 1–21장(삿 19장은 뺌, 2026-10-25 전도사님 결정), 12장. 2026-10-25 1부(1~4장: 여호와를 알지 못하는 세대 · 옷니엘 · 왼손잡이 에훗 · 드보라와 바락, 야엘).",
           "// 5편 「사사들과 함께」 — 사사기 1–21장(삿 19장은 뺌, 2026-10-25 전도사님 결정), 12장. 2026-10-25 1부(1~4장: 여호와를 알지 못하는 세대 · 옷니엘 · 왼손잡이 에훗 · 드보라와 바락, 야엘),\n// 같은 날 2부(5~7장: 기드온을 부르심 · 기드온 300명 · 입다와 그 딸 — 입다의 서원과 딸은 연출 없이 본문만, 삿 12:1-6도 해설만). 7장 무대는 요단 동편 길르앗 = 모압 평지(3편 마을).")
head = rep(head, "  const ANGEL = { n: '여호와의 사자' },", "  const GIDEON = { n: '기드온' }, LORD = { n: '여호와' };\n  const ANGEL = { n: '여호와의 사자' },")

# GPT 12차 모델로 바꿔 끼우기(1부 임시 모델 → 진짜 인물)
for old, new, n in [("title: '악사', model: 'w3-milcah'", "title: '악사', model: 'j5-achsah'", 1), ("title: '옷니엘', model: 'j4-spy-1'", "title: '옷니엘', model: 'j5-othniel'", 1),
                    ("title: '에훗', model: 'j4-spy-2'", "title: '에훗', model: 'j5-ehud'", 1), ("title: '드보라', model: 'he-mother'", "title: '드보라', model: 'j5-deborah'", 2),
                    ("title: '바락', model: 'j4-east-tribes'", "title: '바락', model: 'j5-barak'", 2)]:
    assert head.count(old) == n, old; head = head.replace(old, new)
head = rep(head, "  ZJ.push({ id: 'jg_jael', x: JAEL_T[0] + 3, z: JAEL_T[1], type: 'lore', title: '겐 사람 헤벨의 장막', cond: 'jgJael', body: '' });",
           "  ZJ.push({ id: 'jg_jael', x: JAEL_T[0] + 3, z: JAEL_T[1], type: 'lore', title: '겐 사람 헤벨의 장막', cond: 'jgJael', body: '' });\n"
           "  ZJ.push({ id: 'jg_jael_p', x: JAEL_T[0] + 1.6, z: JAEL_T[1] + 2.4, type: 'villager', title: '야엘', model: 'j5-jael', persona: 'rs_static', cond: 'jgJael', body: '' });")
head = rep(head, "// 새 인물(옷니엘·악사·에훗·드보라·바락·야엘)은 GPT 12차 원화 → Meshy 모델이 오기 전까지 이미 있는 모델을 쓴다.", "// 새 인물은 GPT 12차 원화 → Meshy 모델(npc3d/j5-*.glb, 2026-10-25). 갈렙은 3편 모델(w3-caleb).")
tail = rd('judges5_tail.js')
tail = rep(tail, "  DLG.jg_shamgar.push({ event: 'jShamgar' });", "  DLG.jg_shamgar.push({ event: 'jShamgar' });\n  DLG.jg_ford_done.push({ event: 'jEhud' });\n"
           "  DLG.jg_rock.splice(5, 0, { event: 'offerFire' });   // 6:21 불이 바위에서 나와\n  DLG.jg_baal.push({ event: 'baalDown' });\n  DLG.jg_torch_done.unshift({ event: 'campRout' });\n"
           "  DLG.jg_after.push({ event: 'jGideon' });\n  DLG.jg_minor1.push({ event: 'jTola' }, { event: 'jJair' });\n  DLG.jg_minor2.push({ event: 'jJephthah' }, { event: 'jIbzan' }, { event: 'jElon' }, { event: 'jAbdon' });")
tail = rep(tail, "    const prop = (n, x, z, ry = 0, dy = 0) =>", "    const obst = (x, z, r) => { if (!api.obstacles.some(o => o.x === x && o.z === z)) api.obstacles.push({ x, z, r }); };   // 다시 그려도 한 번만\n    const prop = (n, x, z, ry = 0, dy = 0) =>")
tail = rep(tail, "      api.obstacles.push({ x: PALACE[0], z: PALACE[1], r: 3.4 });", "      obst(PALACE[0], PALACE[1], 3.4);")
tail = rep(tail, "        api.obstacles.push({ x: DEBIR[0] + Math.cos(a) * DEBR, z: DEBIR[1] + Math.sin(a) * DEBR, r: 1.3 }); }", "        obst(DEBIR[0] + Math.cos(a) * DEBR, DEBIR[1] + Math.sin(a) * DEBR, 1.3); }")
# 4장의 병거·바락의 장막은 4장에만
tail = rep(tail, "      [[-6, 4], [-2, 8], [4, 9], [8, 4]].forEach(([dx, dz], i) => prop(i % 2 ? 'tent-small' : 'tent-mid', TABOR_FOOT[0] + dx, TABOR_FOOT[1] + dz, i * 1.3));\n      if (p.ch >= 3){",
           "      if (p.ch === 3) [[-6, 4], [-2, 8], [4, 9], [8, 4]].forEach(([dx, dz], i) => prop(i % 2 ? 'tent-small' : 'tent-mid', TABOR_FOOT[0] + dx, TABOR_FOOT[1] + dz, i * 1.3));\n      if (p.ch === 3){")
tail = rep(tail, "  const T = n => `📜 사사들과 함께 ${n}장`;", rd('part2_games.js') + "\n  const T = n => `📜 사사들과 함께 ${n}장`;")
tail = rep(tail, "    api.zoneRoot.add(g); worldObj = g;\n  }", rd('part2_world.js') + "    api.zoneRoot.add(g); worldObj = g;\n  }")
tail = rep(tail, "next: '5장: 기드온을 부르심 (준비 중)'", "next: '5장: 기드온을 부르심'")
tail = rep(tail, "    ],\n    games: { cycle: cycleGame, ford: fordGame, tabor: taborGame },", rd('part2_chapters.js') + "    ],\n    games: { cycle: cycleGame, ford: fordGame, tabor: taborGame, fleece: fleeceGame, lap: lapGame, torch: torchGame, route: routeGame },")
tail = rep(tail, "    events: { kishon, jOthniel: judge('옷니엘'), jEhud: judge('에훗'), jShamgar: judge('삼갈'), jDeborah: judge('드보라') },",
           "    events: { kishon, offerFire, baalDown, campRout, jOthniel: judge('옷니엘'), jEhud: judge('에훗'), jShamgar: judge('삼갈'), jDeborah: judge('드보라'),\n"
           "      jGideon: judge('기드온'), jTola: judge('돌라'), jJair: judge('야일'), jJephthah: judge('입다'), jIbzan: judge('입산'), jElon: judge('엘론'), jAbdon: judge('압돈') },")
# ── 3·4부(8~12장) ──
head = rep(head, "  const GIDEON = { n: '기드온' }, LORD = { n: '여호와' };", "  const GIDEON = { n: '기드온' }, LORD = { n: '여호와' }, SAMSON = { n: '삼손' };")
head = rep(head, "// 같은 날 2부(5~7장:", "// 같은 날 3부(8~10장: 삼손이 태어남 · 삼손과 블레셋 · 삼손과 들릴라, 마지막 기도 — 새 마을 블레셋 평지)와 4부(11~12장: 미가의 신상과 단 지파 · 왕이 없을 때 — 삿 20:4-7, 21:10-12·19-23은 읽지 않음)까지.\n// 같은 날 2부(5~7장:")
tail = rep(tail, "  DLG.jg_after.push({ event: 'jGideon' });", "  DLG.jg_after.push({ event: 'jGideon' });\n  DLG.jg_altar13.splice(6, 0, { event: 'flameUp' });   // 13:20 불꽃이 하늘로\n  DLG.jg_gaza.splice(3, 0, { event: 'gateCarry' });   // 16:3 성 문짝을 메고\n  DLG.jg_pray_done.unshift({ event: 'templeFall' });\n  DLG.jg_pray_done.push({ event: 'jSamson' });\n  DLG.jg_smoke.splice(4, 0, { event: 'smokeUp' });   // 20:40 연기 구름이 기둥 같이")
tail = rep(tail, "  const T = n => `📜 사사들과 함께 ${n}장`;", rd('part3_games.js') + "\n  const T = n => `📜 사사들과 함께 ${n}장`;")
tail = rep(tail, "    api.zoneRoot.add(g); worldObj = g;\n  }", rd('part3_world.js') + "    api.zoneRoot.add(g); worldObj = g;\n  }")
tail = rep(tail, "next: '8장: 삼손이 태어남 (준비 중)'", "next: '8장: 삼손이 태어남'")
tail = rep(tail, "    ],\n    games: { cycle: cycleGame,", rd('part3_chapters.js') + "    ],\n    games: { nazirite: naziriteGame, riddle: riddleGame, lies: liesGame, pray: prayGame, dan: danGame, judges12: judgesGame, cycle: cycleGame,")
tail = rep(tail, "    events: { kishon, offerFire, baalDown, campRout,", "    events: { flameUp, gateCarry, templeFall, smokeUp, jSamson: judge('삼손'), kishon, offerFire, baalDown, campRout,")
out = head + rd('part2_marks.js') + rd('part3_marks.js') + '\n' + rd('dlg_part1.js') + rd('dlg_part2.js') + rd('dlg_part3.js') + rd('dlg_part4.js') + '\n' + tail
open(os.path.join(H, 'judges5.js'), 'w', encoding='utf-8', newline='\n').write(out)
print('built', out.count('\n'), 'lines')
