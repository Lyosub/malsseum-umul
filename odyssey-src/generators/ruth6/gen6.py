# 6편 대사·구절 카드를 개역개정 원문 파일(rutN.txt, 1saN.txt)에서 그대로 뽑아 JS로 만든다 — 글자를 손으로 옮기지 않는다
import re, json, os
HERE = os.path.dirname(os.path.abspath(__file__))
V = {}
for b, n, ab in [('rut', 4, '룻'), ('1sa', 7, '삼상')]:
    for c in range(1, n + 1):
        for line in open(os.path.join(HERE, f'{b}{c}.txt'), encoding='utf-8'):
            m = re.match(r'^(\d+) (.*)$', line.strip())
            if m: V[(ab, c, int(m.group(1)))] = re.sub(r'\s+', ' ', re.sub(r'\d\)', '', m.group(2))).strip()
def v(b, c, n): return V[(b, c, n)]
def nar(b, c, *ns): return [f"[NAR, {json.dumps(v(b, c, n) + f' ({b} {c}:{n})', ensure_ascii=False)}]" for n in ns]
def say(sp, b, c, n, a=None, e=None):
    t = v(b, c, n); s = t if a is None else t[t.index(a):t.index(e, t.index(a)) + len(e)]
    assert s in t; return f"[{sp}, {json.dumps(s, ensure_ascii=False)}]"
def lead(b, c, n, upto):
    t = v(b, c, n); return f"[NAR, {json.dumps(t[:t.index(upto) + len(upto)] + f' ({b} {c}:{n})', ensure_ascii=False)}]"
def guide(s): return f"[NAR, {json.dumps('▶ ' + s, ensure_ascii=False)}]"
R, S = '룻', '삼상'
D = {}
# 1장 「어머니의 하나님이 나의 하나님」 — 룻 1장
D['rt_moab'] = nar(R, 1, 1, 2, 3, 4, 5) + [guide('나오미에게 가요.')]
D['rt_naomi'] = nar(R, 1, 6, 7, 8, 9, 10, 11, 12, 13) + [guide('나오미 곁의 룻에게 가요.')]
D['rt_ruth'] = nar(R, 1, 14, 15) + [lead(R, 1, 16, '룻이 이르되'), say('RUTH', R, 1, 16, '내게 어머니를', '하나님이 되시리니'), say('RUTH', R, 1, 17, '어머니께서 죽으시는', '원하나이다'), *nar(R, 1, 18)]
D['rt_walk'] = [guide('나오미 곁을 떠나지 말고 함께 걸어요 — "어머니께서 가시는 곳에 나도 가고" (룻 1:16)')]
D['rt_walk_done'] = [guide('요단을 건너 베들레헴까지 가요 — 길갈과 헤브론 산지를 지나 북쪽 길로.')]
D['rt_arrive'] = nar(R, 1, 19, 20, 21, 22)
# 2장 「보아스의 밭에서 이삭 줍기」 — 룻 2장
D['rt_glean_ask'] = nar(R, 2, 1, 2, 3) + [guide('밭에 온 보아스에게 가요.')]
D['rt_boaz'] = [lead(R, 2, 4, '베는 자들에게 이르되'), say('BOAZ', R, 2, 4, '여호와께서 너희와', '원하노라')] + nar(R, 2, 5, 6, 7)
D['rt_boaz2'] = nar(R, 2, 8, 9, 10, 11, 12, 13)
D['rt_meal'] = nar(R, 2, 14, 15, 16) + [guide('밭으로 가요 — 베는 자 뒤에서 이삭을 주워요.')]
D['rt_glean'] = [guide('"룻이 가서 베는 자를 따라 밭에서 이삭을 줍는데" (룻 2:3) — 떨어진 이삭만 주워요.')]
D['rt_glean_done'] = nar(R, 2, 17, 18, 19, 20, 21, 22, 23)
# 3장 「타작마당」 — 룻 3장(밤 장면은 배경만)
D['rt_naomi3'] = nar(R, 3, 1, 2, 3, 4, 5)
D['rt_floor'] = [guide('나오미가 일러 준 말을 차례대로 기억해요 (룻 3:3-4).')]
D['rt_floor_done'] = nar(R, 3, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15) + [guide('성읍으로 돌아가 나오미에게 가요.')]
D['rt_naomi3b'] = nar(R, 3, 16, 17, 18)
# 4장 「기업 무를 자」 — 룻 4장
D['rt_gate'] = nar(R, 4, 1, 2, 3, 4, 5, 6)
D['rt_sandal'] = [guide('옛적 이스라엘에서 무르는 일을 어떻게 확정했을까요? (룻 4:7-8)')]
D['rt_sandal_done'] = nar(R, 4, 9, 10, 11, 12) + [guide('보아스의 집으로 가요.')]
D['rt_obed'] = nar(R, 4, 13, 14, 15, 16, 17)
D['rt_gen'] = nar(R, 4, 18, 19, 20, 21, 22)
# 5장 「한나의 기도」 — 삼상 1:1–2:11
D['sm_ramah'] = nar(S, 1, 1, 2, 3, 4, 5, 6, 7, 8) + [guide('실로 여호와의 전으로 가요.')]
D['sm_vow'] = nar(S, 1, 9, 10, 11) + [guide('🙏 여호와 앞에 오래 기도해요 (삼상 1:12).')]
D['sm_vow_done'] = nar(S, 1, 12, 13, 14, 15, 16, 17, 18) + [guide('라마의 집으로 돌아가요.')]
D['sm_born'] = nar(S, 1, 19, 20, 21, 22, 23) + [guide('아이를 데리고 실로의 엘리에게 가요.')]
D['sm_lent'] = nar(S, 1, 24, 25, 26, 27, 28)
D['sm_song'] = [lead(S, 2, 1, '기도하여 이르되'), say('HANNAH', S, 2, 1, '내 마음이', '기뻐함이니이다'), say('HANNAH', S, 2, 2), say('HANNAH', S, 2, 6), say('HANNAH', S, 2, 7), say('HANNAH', S, 2, 8), say('HANNAH', S, 2, 9)] + nar(S, 2, 11)
# 6장 「말씀하옵소서」 — 삼상 2:12–3:21
D['sm_sons'] = nar(S, 2, 12, 13, 14, 15, 16, 17) + [guide('여호와 앞에서 섬기는 아이 사무엘에게 가요.')]
D['sm_boy'] = nar(S, 2, 18, 19, 20, 21, 26)
D['sm_night'] = nar(S, 3, 1, 2, 3)
D['sm_night_done'] = nar(S, 3, 11, 12, 13, 14, 15, 16, 17, 18) + [guide('아침이에요.')]
D['sm_grow'] = nar(S, 3, 19, 20, 21)
# 7장 「언약궤를 빼앗김」 — 삼상 4장(죽음은 해설만, 원경)
D['sm_battle'] = nar(S, 4, 1, 2, 3, 4)
D['sm_ark_taken'] = nar(S, 4, 5, 6, 7, 8, 9, 10, 11) + [guide('길 옆 의자에 앉은 엘리에게 가요.')]
D['sm_eli4'] = nar(S, 4, 12, 13, 14, 15, 16, 17, 18)
D['sm_ichabod'] = nar(S, 4, 19, 20, 21, 22)
# 8장 「다곤이 엎드러짐, 궤가 돌아옴」 — 삼상 5–6장(다곤은 얼굴·모양 없는 돌덩이)
D['sm_ashdod'] = nar(S, 5, 1, 2, 3, 4, 5)
D['sm_cities'] = nar(S, 5, 6, 7, 8, 9, 10, 11, 12) + [guide('블레셋 방백들과 제사장들에게 가요.')]
D['sm_lords'] = nar(S, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9)
D['sm_cart'] = nar(S, 6, 10, 11, 12) + [guide('"블레셋 방백들은 벧세메스 경계까지 따라가니라" (삼상 6:12) — 수레를 따라가요. 너무 가까이 가지 말고(6:19), 처지지도 말고.')]
D['sm_cart_done'] = nar(S, 6, 13, 14, 15, 16, 17, 18)
D['sm_bethshemesh'] = nar(S, 6, 19, 20, 21)
# 9장 「에벤에셀」 — 삼상 7장
D['sm_kirjath'] = nar(S, 7, 1, 2) + [guide('미스바로 가요.')]
D['sm_turn'] = nar(S, 7, 3, 4, 5, 6)
D['sm_thunder'] = nar(S, 7, 7, 8, 9, 10, 11)
D['sm_stone'] = [guide('사무엘이 돌을 세우고 한 말을 차례대로 놓아요 (삼상 7:12).')]
D['sm_stone_done'] = [lead(S, 7, 12, '세워 이르되'), say('SAMUEL', S, 7, 12, '여호와께서', '도우셨다')] + nar(S, 7, 13, 14, 15, 16, 17)
# 6장 밤의 부름(게임 안에서 쓰는 원문 줄)
CALLS = {k: v(S, 3, k) for k in (4, 5, 6, 8, 9, 10)}

CARDS = {'rut1-16': (R, 1, 16), 'rut2-12': (R, 2, 12), 'rut3-11': (R, 3, 11), 'rut4-14': (R, 4, 14), '1sa1-27': (S, 1, 27), '1sa2-2': (S, 2, 2),
         '1sa3-10': (S, 3, 10), '1sa3-19': (S, 3, 19), '1sa4-21': (S, 4, 21), '1sa6-12': (S, 6, 12), '1sa7-12': (S, 7, 12)}
BOOK = {'룻': '룻기', '삼상': '사무엘상'}
o = ['  // ── 구절 카드(개역개정 원문, gen6.py가 원문 파일에서 뽑음) ──', '  Object.assign(VERSES, {']
for k, (b, c, n) in CARDS.items(): o.append(f"    '{k}': {{ ref: '{BOOK[b]} {c}:{n}', text: {json.dumps(v(b, c, n), ensure_ascii=False)} }},")
o += ['  });', '  // ── 대사(개역개정 원문, gen6.py가 뽑음 — 손으로 고치지 말고 생성기를 고친다) ──', '  Object.assign(DLG, {']
for k, lines in D.items():
    o.append(f'    {k}: ['); o += [f'      {l},' for l in lines]; o.append('    ],')
o.append('  });')
o.append(f"  const CALL = {json.dumps({str(k): x for k, x in CALLS.items()}, ensure_ascii=False)};   // 삼상 3장 밤의 부름(원문)")
open(os.path.join(HERE, 'dlg6.js'), 'w', encoding='utf-8').write('\n'.join(o) + '\n')
print('keys', len(D), 'lines', sum(len(x) for x in D.values()), 'cards', len(CARDS))
