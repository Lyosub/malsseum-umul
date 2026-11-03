from PIL import Image
import os
b=r'E:\temp\claude-work\exodus-game'
def sheet(paths,cols,W,H,out):
    rows=(len(paths)+cols-1)//cols
    s=Image.new('RGB',(W*cols,H*rows),'white')
    for i,p in enumerate(paths):
        im=Image.open(p).convert('RGB'); im.thumbnail((W,H))
        s.paste(im,((i%cols)*W+(W-im.width)//2,(i//cols)*H+(H-im.height)//2))
    s.save(out,quality=80)
ppl=[os.path.join(b,'npc3','saul7',n+'.png') for n in ['michal','abigail','nabal','ahimelech','abishai','egyptian-boy']]+[os.path.join(b,'animals','bear.png'),os.path.join(b,'animals','lion.png')]
sheet(ppl,4,260,390,r'E:\temp\claude-work\saul7\_b79_small.jpg')
pr=[os.path.join(b,'props','saul7',n+'.png') for n in ['oil-horn','harp','sling-five-stones','shepherd-bag','saul-armor','saul-spear','water-jug','bow-arrows','showbread','abigail-gifts','baggage-pile']]
sheet(pr,4,260,260,r'E:\temp\claude-work\saul7\_b1011_small.jpg')
print('ok')
