s=open('saul7_src.js',encoding='utf-8').read()
a="padding:3px 0;font-size:15px;min-height:30px;"
assert s.count(a)==1
s=s.replace(a,"padding:1px 0;font-size:13px;min-height:23px;line-height:1.1;")
a="gap:4px\">${[...Array(COLS)]"
assert s.count(a)==1
s=s.replace(a,"gap:3px\">${[...Array(COLS)]")
a='<div style="display:grid;gap:4px;padding:4px 14px">${rows.join'
assert s.count(a)==1
s=s.replace(a,'<div style="display:grid;gap:3px;padding:2px 14px">${rows.join')
a="<div style=\"padding:6px 14px\"><button data-cf=\"1\" style=\"${btnCss};width:100%;font-size:14px;"
assert s.count(a)==1
s=s.replace(a,"<div style=\"padding:4px 14px\"><button data-cf=\"1\" style=\"${btnCss};width:100%;font-size:13px;padding:5px 6px;")
open('saul7_src.js','w',encoding='utf-8',newline='\n').write(s)
