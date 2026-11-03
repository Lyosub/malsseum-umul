import re, sys
P = sys.argv[1]
t = open(P, encoding='utf-8').read()
lines = t.split('\n')
dec = lambda n: str(int(n) - 1) if int(n) >= 8 else n
out = []
in66 = False
for ln in lines:
    if ln.startswith('## 성경 66권'): in66 = True
    elif ln.startswith('## ') : in66 = False
    # 제목 ### N 「
    ln = re.sub(r'^(### )(\d{1,2})( 「)', lambda m: m.group(1) + dec(m.group(2)) + m.group(3), ln)
    # 액션 게임 표 첫 칸 | N 이름
    ln = re.sub(r'^(\| )(\d{1,2})( [^|0-9])', lambda m: m.group(1) + dec(m.group(2)) + m.group(3), ln)
    # N편 (시편 번호 제외, 0-2편 제외)
    ln = re.sub(r'(?<![\d\-])(?<!시 )(?<!시편 )(\d{1,2})편', lambda m: dec(m.group(1)) + '편', ln)
    if in66 and ln.startswith('|'):
        cells = ln.split('|')
        if len(cells) >= 4:
            c = cells[3]
            c = re.sub(r'(?<![\d\-])(\d{1,2})(?![\d편])', lambda m: dec(m.group(1)), c)
            cells[3] = c
            ln = '|'.join(cells)
    out.append(ln)
open(P, 'w', encoding='utf-8').write('\n'.join(out))
