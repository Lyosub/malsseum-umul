import re, sys
P = sys.argv[1]
t = open(P, encoding='utf-8').read()
i = t.index('## 곁 두루마리')
j = t.index('## 성경 66권')
seg = t[i:j]
dec = lambda n: str(int(n) - 1) if int(n) >= 8 else n
def fix(m):
    inner = m.group(1)
    return '(' + re.sub(r'(?<![\d\-])(\d{1,2})(?!\d)', lambda k: dec(k.group(1)), inner) + ')'
seg = re.sub(r'\(((?:\d{1,2}|0-\d)(?:·(?:\d{1,2}|0-\d))*)\)', fix, seg)
seg = seg.replace('7. 잠언 — 네 길을 인정하라', '7. 여호와는 나의 목자시니 (시 23편) — 목자 다윗의 노래 🔗 시 23:1 ↔ 요 10:11 (7편에서 옮겨 옴)\n8. 잠언 — 네 길을 인정하라').replace('8. 아가 — 사랑의 노래', '9. 아가 — 사랑의 노래')
t = t[:i] + seg + t[j:]
open(P, 'w', encoding='utf-8').write(t)
