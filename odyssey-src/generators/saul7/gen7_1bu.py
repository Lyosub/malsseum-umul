# 7편 1부 대사·구절 카드를 개역개정 원문 파일(1saN.txt)에서 그대로 뽑아 JS로 만든다 — 글자를 손으로 옮기지 않는다
import re, json, os
HERE = os.path.dirname(os.path.abspath(__file__))
V = {}
for c in range(8, 13):
    for line in open(os.path.join(HERE, f'1sa{c}.txt'), encoding='utf-8'):
        m = re.match(r'^(\d+) (.*)$', line.strip())
        if m: V[('삼상', c, int(m.group(1)))] = re.sub(r'\s+', ' ', re.sub(r'\d\)', '', m.group(2))).strip()
def v(b, c, n): return V[(b, c, n)]
def nar(b, c, *ns): return [f"[NAR, {json.dumps(v(b, c, n) + f' ({b} {c}:{n})', ensure_ascii=False)}]" for n in ns]
def say(sp, b, c, n, a=None, e=None):
    # a부터 e까지(e는 a 뒤에서 마지막으로 나오는 것) — 말의 끝을 정확히 자른다
    t = v(b, c, n); s = t if a is None else t[t.index(a):t.rindex(e) + len(e)]
    assert s in t and s, (c, n, a, e); return f"[{sp}, {json.dumps(s, ensure_ascii=False)}]"
def says(sp, b, c, *ns): return [say(sp, b, c, n) for n in ns]
def lead(b, c, n, upto):
    t = v(b, c, n); return f"[NAR, {json.dumps(t[:t.index(upto) + len(upto)] + f' ({b} {c}:{n})', ensure_ascii=False)}]"
def guide(s): return f"[NAR, {json.dumps('▶ ' + s, ensure_ascii=False)}]"
S = '삼상'
D = {}
# 1장 「우리에게 왕을 주어」 — 삼상 8장 (라마의 사무엘)
D['sl_ramah'] = nar(S, 8, 1, 2, 3, 4) + [guide('사무엘에게 나아온 장로들에게 가요.')]
D['sl_elders'] = [lead(S, 8, 5, '그에게 이르되'), say('ELDERS', S, 8, 5, '보소서', '하소서')] + nar(S, 8, 6) + [guide('기도하는 사무엘에게 가요.')]
D['sl_answer'] = nar(S, 8, 7, 8, 9, 10) + [lead(S, 8, 11, '이르되'), say('SAMUEL', S, 8, 11, '너희를 다스릴', '이러하니라')]
D['sl_ways'] = [guide('"그가 너희 … 데려다가", "가져다가" — 사무엘이 말한 왕의 제도(삼상 8:11-17)에 나오는 것만 모아요.')]
D['sl_ways_done'] = [say('SAMUEL', S, 8, 17, '너희가', '될 것이라'), say('SAMUEL', S, 8, 18, '그 날에', '아니하시리라'),
                     lead(S, 8, 19, '거절하여 이르되'), say('PEOPLE', S, 8, 19, '아니로소이다', '하리니'), say('PEOPLE', S, 8, 20, '우리도', '것이니이다')] + nar(S, 8, 21, 22)
# 2장 「암나귀를 찾다가」 — 삼상 9–10장 (기브아 · 숩 땅의 성읍 · 미스바)
D['sl_kish'] = nar(S, 9, 1, 2, 3) + [guide('사환과 함께 암나귀들을 찾으러 가요 — 마을 동쪽 길.')]
D['sl_search'] = [guide('"그가 에브라임 산지와 살리사 땅으로 두루 다녀 보았으나" (삼상 9:4) — 땅마다 발자국을 따라 찾아봐요.')]
D['sl_search_done'] = nar(S, 9, 4) + [lead(S, 9, 5, '사환에게 이르되'), say('SAUL', S, 9, 5, '돌아가자', '두려워하노라'),
                      lead(S, 9, 6, '대답하되'), say('SERVANT', S, 9, 6, '보소서', '하나이다'),
                      lead(S, 9, 7, '사환에게 이르되'), say('SAUL', S, 9, 7, '우리가 가면', '무엇이 있느냐'),
                      lead(S, 9, 8, '대답하여 이르되'), say('SERVANT', S, 9, 8, '보소서', '하겠나이다')] + nar(S, 9, 9, 10) + [guide('성읍으로 올라가는 비탈길 — 물 길으러 나오는 소녀들에게 가요.')]
D['sl_girls'] = nar(S, 9, 11) + [lead(S, 9, 12, '대답하여 이르되'), say('GIRLS', S, 9, 12, '있나이다', '들어오셨나이다'), say('GIRLS', S, 9, 13, '당신들이', '만나리이다'), guide('성문으로 가요.')]
D['sl_seer'] = nar(S, 9, 14, 15, 16, 17) + [lead(S, 9, 18, '나아가 이르되'), say('SAUL', S, 9, 18, '선견자의 집이', '가르치소서'),
               lead(S, 9, 19, '대답하여 이르되'), say('SAMUEL', S, 9, 19, '내가 선견자이니라', '말하리라'), say('SAMUEL', S, 9, 20, '사흘 전에', '아니냐'),
               lead(S, 9, 21, '대답하여 이르되'), say('SAUL', S, 9, 21, '나는 이스라엘', '말씀하시나이까'), guide('산당으로 올라가요.')]
D['sl_feast'] = nar(S, 9, 22) + [lead(S, 9, 23, '요리인에게 이르되'), say('SAMUEL', S, 9, 23, '내가 네게', '가져오라')] + nar(S, 9, 24) + [guide('성읍으로 내려가 성읍 끝으로 가요.')]
D['sl_anoint'] = nar(S, 9, 25, 26, 27) + [lead(S, 10, 1, '입맞추며 이르되'), say('SAMUEL', S, 10, 1, '여호와께서', '아니하셨느냐'),
                 say('SAMUEL', S, 10, 2, '네가 오늘', '할 것이요')] + says('SAMUEL', S, 10, 3, 4, 5, 6, 7, 8)
D['sl_signs'] = [guide('사무엘이 말한 징조를 차례대로 놓아요 (삼상 10:2-5).')]
D['sl_signs_done'] = nar(S, 10, 9) + [guide('하나님의 산으로 가요 — 선지자의 무리가 내려와요.')]
D['sl_prophets'] = nar(S, 10, 10, 11, 12, 13) + [guide('기스의 집 — 사울의 숙부에게 가요.')]
D['sl_uncle'] = nar(S, 10, 14, 15, 16) + [guide('미스바로 가요 — 기브아 서쪽 길로 기브온 마을.')]
D['sl_mizpah'] = nar(S, 10, 17, 18, 19, 20, 21, 22)
D['sl_bags'] = [guide('"그가 짐보따리들 사이에 숨었느니라" (삼상 10:22) — 짐보따리 사이에서 사울을 찾아요.')]
D['sl_bags_done'] = nar(S, 10, 23, 24, 25, 26, 27)
# 3장 「야베스 길르앗을 구함」 — 삼상 11장 (요단 동편 야베스 · 기브아 · 길갈)
D['sl_jabesh'] = nar(S, 11, 1, 2, 3) + [guide('전령들이 간 곳 — 사울이 사는 기브아로 가요.')]
D['sl_field'] = nar(S, 11, 4, 5, 6, 7, 8, 9, 10) + [guide('요단을 건너 야베스로 가요.')]
D['sl_dawn'] = [guide('"이튿날 사울이 백성을 삼 대로 나누고 새벽에" (삼상 11:11) — 세 무리를 자리에 두고, 해가 뜨기 전 새벽에 출발해요.')]
D['sl_dawn_done'] = nar(S, 11, 11, 12) + [lead(S, 11, 13, '사울이 이르되'), say('SAUL', S, 11, 13, '이 날에는', '베푸셨음이니라'),
                    lead(S, 11, 14, '백성에게 이르되'), say('SAMUEL', S, 11, 14, '오라', '새롭게 하자'), guide('길갈로 가요.')]
D['sl_renew'] = nar(S, 11, 15)
# 4장 「기도하기를 쉬는 죄」 — 삼상 12장 (길갈)
D['sl_witness'] = [lead(S, 12, 1, '이르되'), say('SAMUEL', S, 12, 1, '보라', '세웠더니'), say('SAMUEL', S, 12, 2), say('SAMUEL', S, 12, 3, '내가 여기', '갚으리라'),
                   lead(S, 12, 4, '그들이 이르되'), say('PEOPLE', S, 12, 4, '당신이', '없나이다'),
                   lead(S, 12, 5, '백성에게 이르되'), say('SAMUEL', S, 12, 5, '너희가', '증언하느니라'), say('PEOPLE', S, 12, 5, '그가 증언하시나이다', '그가 증언하시나이다')]
D['sl_remember'] = [lead(S, 12, 6, '백성에게 이르되'), say('SAMUEL', S, 12, 6, '모세와', '여호와이시니'), say('SAMUEL', S, 12, 7),
                    guide('사무엘이 되짚은 일을 차례대로 놓아요 (삼상 12:8-11) — 1편부터 6편까지 지나온 이야기예요.')]
D['sl_remember_done'] = says('SAMUEL', S, 12, 8, 9, 10, 11, 12, 13, 14, 15)
D['sl_thunder'] = says('SAMUEL', S, 12, 16, 17) + [guide('🙏 "사무엘이 여호와께 아뢰매" (삼상 12:18) — 누른 채 기다려요. 맑은 밀 베는 때예요.')]
D['sl_thunder_done'] = nar(S, 12, 18) + [lead(S, 12, 19, '사무엘에게 이르되'), say('PEOPLE', S, 12, 19, '당신의 종들을', '더하였나이다')]
D['sl_pray'] = [lead(S, 12, 20, '백성에게 이르되'), say('SAMUEL', S, 12, 20, '두려워하지', '섬기라')] + says('SAMUEL', S, 12, 21, 22, 23, 24, 25)
# 게임 안에서 쓰는 원문 줄
LINES = {'9:4': v(S, 9, 4), '10:2': v(S, 10, 2), '10:3': v(S, 10, 3), '10:5': v(S, 10, 5), '10:23': v(S, 10, 23), '11:11': v(S, 11, 11), '12:18': v(S, 12, 18)}

CARDS = {'1sa8-7': (S, 8, 7), '1sa9-16': (S, 9, 16), '1sa10-24': (S, 10, 24), '1sa11-13': (S, 11, 13), '1sa12-23': (S, 12, 23), '1sa12-24': (S, 12, 24)}
BOOK = {'삼상': '사무엘상'}
o = ['  // ── 구절 카드(개역개정 원문, gen7.py가 원문 파일에서 뽑음) ──', '  Object.assign(VERSES, {']
for k, (b, c, n) in CARDS.items(): o.append(f"    '{k}': {{ ref: '{BOOK[b]} {c}:{n}', text: {json.dumps(v(b, c, n), ensure_ascii=False)} }},")
o += ['  });', '  // ── 대사(개역개정 원문, gen7.py가 뽑음 — 손으로 고치지 말고 생성기를 고친다) ──', '  Object.assign(DLG, {']
for k, lines in D.items():
    o.append(f'    {k}: ['); o += [f'      {l},' for l in lines]; o.append('    ],')
o.append('  });')
o.append(f"  const LINE = {json.dumps(LINES, ensure_ascii=False)};   // 게임 안에서 보여 주는 원문(삼상)")
open(os.path.join(HERE, 'dlg7.js'), 'w', encoding='utf-8').write('\n'.join(o) + '\n')
print('keys', len(D), 'lines', sum(len(x) for x in D.values()), 'cards', len(CARDS))
