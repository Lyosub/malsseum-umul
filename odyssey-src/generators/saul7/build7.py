import os
H = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(H, 'saul7_src.js'), encoding='utf-8').read().replace('\r\n', '\n')
dlg = open(os.path.join(H, 'dlg7.js'), encoding='utf-8').read().replace('\r\n', '\n')
assert src.count('/*DLG*/') == 1
out = src.replace('/*DLG*/', dlg)
open(os.path.join(H, 'saul7.js'), 'w', encoding='utf-8', newline='\n').write(out); print('built', out.count('\n'))
