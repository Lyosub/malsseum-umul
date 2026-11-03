import re, sys, html
for c in sys.argv[1:]:
    raw = open(f'heb{c}.html', 'rb').read()
    for enc in ('utf-8', 'cp949'):
        try: t = raw.decode(enc); break
        except: pass
    m = re.search(r'id="tdBible1"(.*?)</td>', t, re.S) or re.search(r'<div id="tdBible1"(.*)', t, re.S)
    body = m.group(1) if m else t
    body = re.sub(r'<div class="D2".*?</div>', '', body, flags=re.S)   # 각주
    body = re.sub(r'<a[^>]*class="comment"[^>]*>.*?</a>', '', body, flags=re.S)
    body = re.sub(r'<sup.*?</sup>', '', body, flags=re.S)
    body = re.sub(r'<br\s*/?>', '\n', body); body = re.sub(r'<[^>]+>', '', body)
    body = html.unescape(body)
    lines = [re.sub(r'\s+', ' ', l).strip() for l in body.split('\n')]
    out = [l for l in lines if re.match(r'^\d+\s', l)]
    open(f'heb{c}.txt', 'w', encoding='utf-8').write('\n'.join(out))
    print(c, len(out))
