# 8편 두루마리 만들기: gen8.py(원문 → dlg8.js) 뒤 david8_src.js의 /*DLG*/ 자리에 넣어 odyssey/scrolls/david8.js로
import os, subprocess, sys
H = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.dirname(os.path.dirname(os.path.dirname(H)))
subprocess.run([sys.executable, os.path.join(H, 'gen8.py')], check=True)
src = open(os.path.join(H, 'david8_src.js'), encoding='utf-8').read().replace('\r\n', '\n')
dlg = open(os.path.join(H, 'dlg8.js'), encoding='utf-8').read().replace('\r\n', '\n')
assert src.count('/*DLG*/') == 1
out = src.replace('/*DLG*/', dlg)
open(os.path.join(REPO, 'odyssey', 'scrolls', 'david8.js'), 'w', encoding='utf-8', newline='\n').write(out); print('built', out.count('\n'))
