# 5편 대사·구절 카드를 개역개정 원문 파일(jdgN.txt)에서 그대로 뽑아 JS로 만든다 — 글자를 손으로 옮기지 않는다
import re, json, sys, os
HERE = os.path.dirname(os.path.abspath(__file__))
V = {}
for c in range(1, 22):
    for line in open(os.path.join(HERE, f'jdg{c}.txt'), encoding='utf-8'):
        m = re.match(r'^(\d+) (.*)$', line.strip())
        if m:
            t = re.sub(r'\d\)', '', m.group(2))          # 각주 번호(1) 2) …) 빼기
            V[(c, int(m.group(1)))] = re.sub(r'\s+', ' ', t).strip()

def v(c, n): return V[(c, n)]
def nar(c, *ns): return [f"[NAR, {json.dumps(v(c, n) + f' (삿 {c}:{n})', ensure_ascii=False)}]" for n in ns]
def say(sp, c, n, a=None, b=None):
    """한 절 안의 말 부분만: a(시작 글자)부터 b(끝 글자)까지. 원문에 그대로 있는지 확인한다"""
    t = v(c, n)
    if a is None: s = t
    else:
        i = t.index(a); j = t.index(b, i) + len(b); s = t[i:j]
    assert s in t
    return f"[{sp}, {json.dumps(s, ensure_ascii=False)}]"
def lead(c, n, upto):
    """말하기 전 서술(예: '…이르되')만 해설로 — 원문 앞부분 그대로 + 절 주소"""
    t = v(c, n); j = t.index(upto) + len(upto); return f"[NAR, {json.dumps(t[:j] + f' (삿 {c}:{n})', ensure_ascii=False)}]"
def guide(s): return f"[NAR, {json.dumps('▶ ' + s, ensure_ascii=False)}]"

D = {}
# 1장 「여호와를 알지 못하는 세대」 — 삿 2장
D['jg_angel'] = [lead(2, 1, '올라와 말하되'), say('ANGEL', 2, 1, '내가 너희를', '어기지 아니하리니'), say('ANGEL', 2, 2), say('ANGEL', 2, 3),
                 guide('서쪽 언덕, 백성이 모여 우는 곳(보김)으로 가요.')]
D['jg_bochim'] = nar(2, 4, 5) + [guide('길갈 진영 가운데로 돌아가요. 여호수아가 보낸 백성의 이야기예요.')]
D['jg_gen'] = nar(2, 6, 7, 8, 9, 10)
D['jg_cycle'] = nar(2, 11, 12, 13, 14, 15) + [guide('이 일이 어떤 차례로 되풀이되는지 놓아 보아요.')]
D['jg_judges'] = nar(2, 16, 17, 18, 19)
# 2장 「옷니엘」 — 삿 1:11-15, 3:7-11
D['jg_debir'] = nar(1, 11, 12, 13) + [guide('갈렙 곁의 악사에게 가요.')]
D['jg_achsah'] = nar(1, 14, 15) + [guide('남방의 윗샘을 찾아가요 — 산기슭 높은 곳에서 빛나요.')]
D['jg_upper'] = [guide('윗샘이에요. 이제 아래쪽 골짜기의 아랫샘을 찾아요.')]
D['jg_lower'] = [guide('아랫샘까지 찾았어요. "갈렙이 윗샘과 아랫샘을 그에게 주었더라" (삿 1:15)'), guide('남쪽 길 어귀로 가요. 여호수아 뒤의 이야기가 이어져요.')]
D['jg_cushan'] = nar(3, 7, 8) + [guide('드빌 성 앞의 옷니엘에게 가요.')]
D['jg_othniel'] = nar(3, 9, 10, 11)
# 3장 「왼손잡이 에훗」 — 삿 3:12-31
D['jg_palms'] = nar(3, 12, 13, 14) + [guide('길갈 진영의 에훗에게 가요.')]
D['jg_ehud'] = nar(3, 15, 16, 17, 18) + [guide('길갈 근처 돌 뜨는 곳으로 가요.')]
D['jg_quarry'] = nar(3, 19) + [guide('종려나무 성읍, 왕의 다락방으로 가요.')]
D['jg_palace'] = nar(3, 20, 21, 23, 24, 25)
D['jg_horn'] = nar(3, 26, 27) + [lead(3, 28, '그들에게 이르되'), say('EHUD', 3, 28, '나를 따르라', '넘겨 주셨느니라'),
                 guide('요단 강 나루로 내려가요.')]
D['jg_ford'] = [guide('"무리가 에훗을 따라 내려가 모압 맞은편 요단 강 나루를 장악하여 한 사람도 건너지 못하게 하였고" (삿 3:28)')]
D['jg_ford_done'] = nar(3, 29, 30) + [guide('강가에 놓인 소 모는 막대기가 보여요.')]
D['jg_shamgar'] = nar(3, 31)
# 4장 「드보라와 바락, 야엘」 — 삿 4–5장
D['jg_deborah'] = nar(4, 1, 2, 3, 4, 5) + [lead(4, 6, '그에게 이르되'), say('DEBORAH', 4, 6, '이스라엘의 하나님', '다볼 산으로 가라'), say('DEBORAH', 4, 7),
                   guide('종려나무 곁의 바락에게 가요.')]
D['jg_barak'] = nar(4, 8, 9, 10) + [guide('북쪽 길로 이스르엘 골짜기에 올라가요 — 다볼 산이 있어요.')]
D['jg_tabor'] = nar(4, 11, 12, 13) + [guide('다볼 산기슭의 드보라에게 가요.')]
D['jg_rise'] = [lead(4, 14, '바락에게 이르되'), say('DEBORAH', 4, 14, '일어나라', '아니하시느냐')]
D['jg_kishon'] = nar(4, 15, 16) + [guide('서쪽, 사아난님 상수리나무 곁의 장막으로 가요.')]
D['jg_jael'] = nar(4, 17, 18, 19, 20, 21, 22) + [guide('다볼 산기슭으로 돌아가요.')]
D['jg_song'] = nar(4, 23, 24) + nar(5, 1) + [say('SONG', 5, 2), say('SONG', 5, 3), say('SONG', 5, 12), say('SONG', 5, 20), say('SONG', 5, 21)] + nar(5, 31)

# ── 2부 ──
D2 = {}
# 5장 「기드온을 부르심 — 양털 표징」 — 삿 6장
D2['jg_midian'] = nar(6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10) + [guide('오브라의 상수리나무 아래, 포도주 틀의 기드온에게 가요.')]
D2['jg_call'] = nar(6, 11) + [lead(6, 12, '나타나 이르되'), say('ANGEL', 6, 12, '큰 용사여', '함께 계시도다'), lead(6, 13, '대답하되'), say('GIDEON', 6, 13, '오 나의 주여', '넘겨 주셨나이다'),
                 lead(6, 14, '이르시되'), say('LORD', 6, 14, '너는 가서', '아니냐'), lead(6, 15, '대답하되'), say('GIDEON', 6, 15, '오 주여', '작은 자니이다'),
                 lead(6, 16, '이르시되'), say('LORD', 6, 16, '내가 반드시', '치듯 하리라'), guide('상수리나무 아래 바위로 가요.')]
D2['jg_rock'] = nar(6, 17, 18, 19, 20, 21, 22, 23, 24)
D2['jg_baal'] = nar(6, 25, 26, 27) + [guide('아침이 되었어요. 성읍 사람들이 모였어요.')]
D2['jg_morning'] = nar(6, 28, 29, 30, 31, 32) + [guide('진영 가운데로 가요 — 미디안이 이스르엘 골짜기에 진을 쳤어요.')]
D2['jg_horn2'] = nar(6, 33, 34, 35) + [guide('타작마당으로 가요.')]
D2['jg_fleece'] = nar(6, 36, 37)
D2['jg_fleece_done'] = nar(6, 38, 39, 40)
# 6장 「기드온 300명」 — 삿 7:1–8:35
D2['jg_harod'] = nar(7, 1, 2, 3, 4)
D2['jg_lap'] = nar(7, 5)
D2['jg_lap_done'] = nar(7, 6, 7, 8) + [guide('밤이에요. 부라와 함께 미디안 진영 근처로 내려가요.')]
D2['jg_night'] = nar(7, 9, 10, 11, 12) + [guide('진영 가장자리의 장막 곁으로 가까이 가요.')]
D2['jg_dream'] = nar(7, 13, 14, 15) + [guide('삼백 명에게 돌아가요.')]
D2['jg_torch'] = nar(7, 16, 17, 18, 19)
D2['jg_torch_done'] = nar(7, 20, 21, 22, 23) + [guide('하롯 샘 곁으로 돌아가요.')]
D2['jg_after'] = nar(8, 22, 23, 28, 33, 34, 35)
# 7장 「입다와 그 딸」 — 삿 10:1–12:15 (모압 평지 = 요단 동편 길르앗)
D2['jg_minor1'] = nar(10, 1, 2, 3, 4, 5)
D2['jg_again'] = nar(10, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16) + [guide('미스바의 진으로 가요.')]
D2['jg_mizpah'] = nar(10, 17, 18) + nar(11, 1, 2, 3) + [guide('동쪽 돕 땅의 입다에게 가요.')]
D2['jg_tob'] = nar(11, 4, 5, 6, 7, 8, 9, 10, 11)
D2['jg_king'] = nar(11, 12, 13, 14, 15) + [guide('입다가 사자들을 시켜 한 말 — 이스라엘이 걸어온 길을 차례대로 놓아요.')]
D2['jg_king_done'] = nar(11, 26, 27, 28) + [guide('미스바로 돌아가요.')]
D2['jg_vow'] = nar(11, 29, 30, 31, 32, 33) + [guide('미스바의 입다의 집으로 가요.')]
D2['jg_house'] = nar(11, 34, 35, 36, 37, 38, 39, 40)
D2['jg_ford2'] = nar(12, 1, 2, 3, 4, 5, 6)
D2['jg_minor2'] = nar(12, 7, 8, 9, 10, 11, 12, 13, 14, 15)
CARDS2 = {'jdg6-12': (6, 12), 'jdg6-16': (6, 16), 'jdg7-2': (7, 2), 'jdg7-20': (7, 20), 'jdg8-23': (8, 23), 'jdg10-16': (10, 16)}
CARDS = {'jdg2-10': (2, 10), 'jdg2-16': (2, 16), 'jdg3-9': (3, 9), 'jdg3-15': (3, 15), 'jdg4-14': (4, 14), 'jdg5-31': (5, 31)}

out = ['  // ── 구절 카드(개역개정 원문, gen_dlg.py가 jdgN.txt에서 뽑음) ──', '  Object.assign(VERSES, {']
for k, (c, n) in CARDS.items():
    out.append(f"    '{k}': {{ ref: '사사기 {c}:{n}', text: {json.dumps(v(c, n), ensure_ascii=False)} }},")
out.append('  });')
out.append('  // ── 대사(개역개정 원문, gen_dlg.py가 뽑음 — 손으로 고치지 말고 생성기를 고친다) ──')
out.append('  Object.assign(DLG, {')
for k, lines in D.items():
    out.append(f'    {k}: [')
    for l in lines: out.append(f'      {l},')
    out.append('    ],')
out.append('  });')
open(os.path.join(HERE, 'dlg_part1.js'), 'w', encoding='utf-8').write('\n'.join(out) + '\n')
print('dialog keys', len(D), 'lines', sum(len(x) for x in D.values()))

def emit(D, CARDS, fn):
    o = ['  Object.assign(VERSES, {']
    for k, (c, n) in CARDS.items(): o.append(f"    '{k}': {{ ref: '사사기 {c}:{n}', text: {json.dumps(v(c, n), ensure_ascii=False)} }},")
    o += ['  });', '  Object.assign(DLG, {']
    for k, lines in D.items():
        o.append(f'    {k}: ['); o += [f'      {l},' for l in lines]; o.append('    ],')
    o.append('  });'); open(os.path.join(HERE, fn), 'w', encoding='utf-8').write('\n'.join(o) + '\n')
emit(D2, CARDS2, 'dlg_part2.js'); print('part2 keys', len(D2), 'lines', sum(len(x) for x in D2.values()))

# ── 3부(8~10장 삼손) ──
D3 = {}
D3['jg_zorah'] = nar(13, 1, 2) + [guide('마노아의 아내에게 가요.')]
D3['jg_mwife'] = nar(13, 3, 4, 5, 6, 7) + [guide('밭 곁의 마노아에게 가요.')]
D3['jg_manoah'] = nar(13, 8, 9, 10, 11, 12, 13, 14)
D3['jg_nazirite'] = [guide('여호와의 사자가 "삼가라" 한 것은 무엇일까요? 본문(삿 13:4-5, 14)에 있는 것만 골라요.')]
D3['jg_altar13'] = nar(13, 15, 16, 17, 18, 19, 20, 21, 22, 23)
D3['jg_mahaneh'] = nar(13, 24, 25)
D3['jg_samson'] = nar(14, 1, 2, 3, 4) + [guide('딤나의 포도원으로 내려가요.')]
D3['jg_vineyard'] = nar(14, 5, 6, 7) + [guide('얼마 후 — 다시 그 길로 가요.')]
D3['jg_honey'] = nar(14, 8, 9) + [guide('딤나의 잔칫집으로 가요.')]
D3['jg_feast'] = nar(14, 10, 11, 12, 13, 14)
D3['jg_feast_done'] = nar(14, 15, 16, 17, 18, 19, 20)
D3['jg_fields'] = nar(15, 1, 2, 3, 4, 5, 6, 7, 8) + [guide('에담 바위 틈으로 가요.')]
D3['jg_etam'] = nar(15, 9, 10, 11, 12, 13) + [guide('레히로 가요.')]
D3['jg_lehi'] = nar(15, 14, 15, 16, 17)
D3['jg_spring'] = nar(15, 18, 19, 20)
D3['jg_gaza'] = nar(16, 1, 2, 3) + [guide('소렉 골짜기로 가요.')]
D3['jg_lords'] = nar(16, 4, 5) + [guide('들릴라에게 가요.')]
D3['jg_lies'] = nar(16, 6) + [guide('삼손이 세 번 무엇이라고 말했는지 차례대로 기억해 보아요.')]
D3['jg_lies_done'] = nar(16, 15, 16, 17, 18, 19, 20) + [guide('가사로 내려가요.')]
D3['jg_mill'] = nar(16, 21, 22) + [guide('다곤의 집으로 가요.')]
D3['jg_temple'] = nar(16, 23, 24, 25, 26, 27)
D3['jg_pray'] = [lead(16, 28, '부르짖어 이르되'), say('SAMSON', 16, 28, '주 여호와여', '갚게 하옵소서')]
D3['jg_pray_done'] = nar(16, 29, 30, 31)
CARDS3 = {'jdg13-5': (13, 5), 'jdg14-14': (14, 14), 'jdg15-18': (15, 18), 'jdg16-28': (16, 28)}
emit(D3, CARDS3, 'dlg_part3.js'); print('part3 keys', len(D3), 'lines', sum(len(x) for x in D3.values()))

# ── 4부(11~12장) — 삿 19장, 20:4-7, 21:10-12·19-23은 읽지 않는다(2026-10-25) ──
D4 = {}
D4['jg_micah'] = nar(17, 1, 2, 3, 4, 5, 6) + [guide('미가의 집 앞의 레위 청년에게 가요.')]
D4['jg_levite'] = nar(17, 7, 8, 9, 10, 11, 12, 13)
D4['jg_danspy'] = nar(18, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10) + [guide('미가의 집 문 앞으로 가요.')]
D4['jg_door'] = nar(18, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21) + [guide('뒤쫓아 온 미가에게 가요.')]
D4['jg_micah2'] = nar(18, 22, 23, 24, 25, 26)
D4['jg_micah2_done'] = nar(18, 27, 28, 29, 30, 31)
D4['jg_mizpah20'] = nar(20, 1, 2, 3, 8, 9, 10, 11, 12, 13) + [guide('벧엘로 올라가요.')]
D4['jg_bethel'] = nar(20, 18, 19, 23, 26, 27, 28) + [guide('기브아 쪽을 멀리서 바라보아요.')]
D4['jg_smoke'] = nar(20, 29, 30, 35, 40, 47)
D4['jg_weep'] = nar(21, 1, 2, 3, 6, 15, 24) + [guide('길 가운데로 가요 — 사사기의 마지막 절이에요.')]
D4['jg_end'] = [guide('5편에서 만난 사사 열두 명을 사사기에 나온 차례대로 놓아요.')]
D4['jg_end_done'] = nar(21, 25)
CARDS4 = {'jdg17-6': (17, 6), 'jdg21-25': (21, 25)}
emit(D4, CARDS4, 'dlg_part4.js'); print('part4 keys', len(D4), 'lines', sum(len(x) for x in D4.values()))
