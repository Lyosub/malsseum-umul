import sys
p=r'E:\서브 브레인\Projects\malsseum-umul\odyssey\index.html'
s=open(p,encoding='utf-8',newline='').read()
a="[-12, -46, 15], [0, -36, 6], [-42, 20, 4]],"
assert s.count(a)==1
s=s.replace(a,"[-12, -46, 15], [0, -36, 6], [-42, 20, 4], [28, 18, 11], [40, 26, 7], [8, 18, 5], [10, 33, 4], [14, 16, 3], [-16, 3, 5], [-26, -14, 3]],")
open(p,'w',encoding='utf-8',newline='').write(s)
