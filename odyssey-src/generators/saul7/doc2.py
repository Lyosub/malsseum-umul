d=open('dump7.mjs',encoding='utf-8').read()
a="## 15. 7편 「사울과 다윗」 1부 대사 (2026-10-31 · 전도사님 검수 대기)"
assert d.count(a)==1
d=d.replace(a,"## 15. 7편 「사울과 다윗」 1·2부 대사 (1부 2026-10-31 · 2부 2026-11-02 · 전도사님 검수 대기)")
d=d.replace("사무엘상 8–12장","사무엘상 8–15장")
open('dump7.mjs','w',encoding='utf-8').write(d)
