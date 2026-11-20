import sys, json
from PIL import Image
from collections import Counter
D='E:/temp/claude-work/ark-icons/'
def key(c): return c[0]>200 and c[1]<70 and c[2]>200
def unit(im, x0,y0):
    # detect pixel unit by run lengths
    runs=Counter()
    for y in range(y0,y0+256,7):
        prev=None;n=0
        for x in range(x0,x0+256):
            c=im.getpixel((x,y))[:3]
            if prev is not None and sum(abs(a-b) for a,b in zip(c,prev))>30:
                if n>3: runs[n]+=1
                n=0
            prev=c;n+=1
    return runs
def slice_sheet(fn, cells, U=16):
    im=Image.open(D+fn).convert('RGB'); out=[]
    for ci in range(cells):
        cx,cy=(ci%4)*256,(ci//4)*256
        xs=[];ys=[]
        for y in range(cy,cy+256,2):
            for x in range(cx,cx+256,2):
                if not key(im.getpixel((x,y))): xs.append(x);ys.append(y)
        x0,x1,y0,y1=min(xs),max(xs),min(ys),max(ys)
        # snap to unit grid using x0,y0 phase
        px0=x0- (x0-x0)%U; py0=y0
        w=(x1-x0+U)//U; h=(y1-y0+U)//U
        g=[]
        for j in range(h):
            row=[]
            for i in range(w):
                sx=x0+i*U+U//2; sy=y0+j*U+U//2
                if sx>=im.width or sy>=im.height: row.append(None);continue
                c=im.getpixel((sx,sy)); row.append(None if key(c) else c)
            g.append(row)
        out.append((w,h,g))
    return out
if __name__=='__main__':
    im=Image.open(D+'아이콘1_무기탈것.png').convert('RGB')
    print(unit(im,0,0).most_common(8))
    for fn,n in [('아이콘1_무기탈것.png',10),('아이콘2_도구전신갑주.png',9),('아이콘3_가구옷.png',15)]:
        print(fn,[(w,h) for w,h,g in slice_sheet(fn,n)])
