from PIL import Image
import os
d=r'E:\temp\claude-work\exodus-game\npc3\saul7'
names=['saul-young','saul-old','samuel-old','jonathan','armor-bearer','david-boy','david-young','jesse','eliab','goliath']
W,H=240,360
sheet=Image.new('RGB',(W*5,H*2),'white')
for i,n in enumerate(names):
    im=Image.open(os.path.join(d,n+'.png')).convert('RGB'); im.thumbnail((W,H))
    sheet.paste(im,((i%5)*W+(W-im.width)//2,(i//5)*H))
sheet.save(r'E:\temp\claude-work\saul7\_b16_small.jpg',quality=80)
l=Image.open(os.path.join(d,'_lineup-check.png')).convert('RGB'); l.thumbnail((1500,500)); l.save(r'E:\temp\claude-work\saul7\_lineup_small.jpg',quality=80)
print('ok')
