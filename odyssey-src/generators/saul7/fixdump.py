d=open('dump7.mjs',encoding='utf-8').read()
d=d.replace("!(v === r[1] || v.startsWith(r[1]))","!(v === r[1] || v.includes(r[1]))")
a="m[2].replace(/"
assert d.count(a)==1
d=d.replace(a,"m[2].replace('올라가니라사울이', '올라가니라 사울이').replace(/")
open('dump7.mjs','w',encoding='utf-8').write(d)
