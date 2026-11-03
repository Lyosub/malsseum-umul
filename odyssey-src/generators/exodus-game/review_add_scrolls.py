"""검수표에 두루마리 파일(1편 첫머리 · 2편)과 모세 편 보강(8장 끝 · 9장 반석 틈) 대사를 덧붙인다.
make_review.py 끝에서 불린다. 따로 돌려도 된다(같은 절을 지우고 다시 씀)."""
import json, re, subprocess, os
HERE = os.path.dirname(os.path.abspath(__file__))
DST = r'E:\서브 브레인\NEW BRAIN\50. Projects\50_0. Active\In Odyssey 대사·구절 검수표.md'
MARK = '\n## 9. 두루마리 추가 대사'
BIBLE = {'모세', '아론', '부정하게 된 사람들', '백성', '바로의 딸', '모세의 누이', '히브리 사람', '르우엘', '르우엘의 딸들', '여호수아', '한 소년', '미리암과 아론', '정탐꾼들', '갈렙', '온 회중', '여호수아와 갈렙', '이스라엘', '이스라엘의 사신', '발락', '발람', '나귀', '여호와의 사자', '슬로브핫의 딸들'}
CITE = re.compile(r'\((창|출|레|민|신|마|막|눅|요|행|히|고전) \d')

def kind(sp, t):
    if t.startswith('▶'): return '게임 안내'
    if CITE.search(t) or sp in BIBLE: return '✅ 원문'
    return '확인 필요'

def table(rows):
    out = '| 말하는 이 | 대사 | 구분 |\n|---|---|---|\n'
    for sp, t in rows:
        out += f'| {sp} | {t.replace("|", "/")} | {kind(sp, t)} |\n'
    return out

data = json.loads(subprocess.run(['node', 'dump_scroll_dlg.mjs', 'scrolls/moses0.js', 'scrolls/sinai2.js', 'scrolls/wild3.js'], cwd=HERE, capture_output=True, encoding='utf-8').stdout)
sec = [MARK + ' (2026-09-27 · 전도사님 검수 대기)\n\n',
       '> 두루마리 파일로 따로 들어간 이야기와 모세 편 보강 장면이다. 인용은 모두 2026-09-26~27 bskorea 개역개정 원문과 대조했다. "확인 필요"는 성경 인용 표시가 없는 줄이라 한 번 더 봐 주셔야 할 곳이다.\n']
names = {'scrolls/moses0.js': '9-1. 1편 첫머리 「물에서 건져낸 아이」 (출 1:22–2:22)', 'scrolls/sinai2.js': '9-3. 2편 「시내산의 마지막 한 달」 1~10장 (레 1–25장, 민 1–10장)', 'scrolls/wild3.js': '9-4. 3편 「광야 40년」 1~16장 (민 10:29–36장, 신명기)'}
# 모세 편 보강(프로토타입 안) — [SPK, '문장'] 줄을 키별로
src = open(os.path.join(HERE, 'moses_add_src.js'), encoding='utf-8').read()
SPK = {'NAR': '해설', 'MOSES': '모세', 'AARON': '아론', 'ME': '나', 'GUIDE': '안내자', 'PEOPLE': '백성'}
add = []
for key, body in re.findall(r'\n\s{4}(\w+): \[(.*?)\n\s{4}\],', src, re.S):
    rows = [(SPK.get(s, s), t) for s, t in re.findall(r"\[(\w+), '((?:[^'\\]|\\.)*)'", body)]
    if rows: add.append((key, rows))
for f in ['scrolls/moses0.js']:
    sec.append(f'\n### {names[f]}\n\n')
    for k, rows in data[f]['DLG'].items():
        if rows: sec.append(f'**{k}**\n\n' + table(rows) + '\n')
sec.append('\n### 9-2. 모세 편 보강 — 8장 끝 「언약의 피」(출 24:3-11) · 9장 「반석 틈」(출 33:18-23)\n\n')
for k, rows in add:
    sec.append(f'**{k}**\n\n' + table(rows) + '\n')
f = 'scrolls/sinai2.js'
sec.append(f'\n### {names[f]}\n\n')
for k, rows in data[f]['DLG'].items():
    if rows: sec.append(f'**{k}**\n\n' + table(rows) + '\n')
sec.append('\n**2편 구절 카드**\n\n| 카드 | 본문 |\n|---|---|\n' + ''.join(f"| {v['ref']} | {v['text']} |\n" for v in data[f]['VERSES'].values()))
f3 = 'scrolls/wild3.js'
sec.append(f'\n### {names[f3]}\n\n')
for k, rows in data[f3]['DLG'].items():
    if rows: sec.append(f'**{k}**\n\n' + table(rows) + '\n')
sec.append('\n**3편 구절 카드**\n\n| 카드 | 본문 |\n|---|---|\n' + ''.join(f"| {v['ref']} | {v['text']} |\n" for v in data[f3]['VERSES'].values()))

doc = open(DST, encoding='utf-8').read()
if MARK in doc:
    i = doc.index(MARK); j = doc.find('\n---\n대사 구분 집계', i)
    doc = doc[:i] + (doc[j:] if j >= 0 else '')
j = doc.rfind('\n---\n대사 구분 집계')
body = ''.join(sec)
doc = doc[:j] + '\n' + body + doc[j:] if j >= 0 else doc + '\n' + body
open(DST, 'w', encoding='utf-8').write(doc)
n = body.count('\n| ') - body.count('|---')
print('검수표 추가 절 갱신:', body.count('✅ 원문'), '원문 /', body.count('게임 안내'), '안내 /', body.count('확인 필요'), '확인 필요')
