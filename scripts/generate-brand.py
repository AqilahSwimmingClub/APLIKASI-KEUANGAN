"""Original wallet + Rupiah coin assets; no external artwork. Run python3 (Pillow)."""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BOLD='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
def icon(size,foreground=False):
 s=1024;im=Image.new('RGBA',(s,s),(0,0,0,0) if foreground else '#163b78');d=ImageDraw.Draw(im)
 # Entire identity sits inside central 66% adaptive safe zone.
 d.rounded_rectangle((220,386,760,742),60,fill='#f3f8ff')
 d.rounded_rectangle((247,322,688,391),25,fill='#7cb7e8')
 d.rounded_rectangle((575,473,796,616),30,fill='#447ceb');d.ellipse((624,526,651,553),fill='white')
 d.ellipse((540,205,777,442),fill='#dba245',outline='#fff4d5',width=10);d.ellipse((562,227,755,420),fill='#ffe4a6',outline='#bb872c',width=5)
 d.text((657,320),'Rp',font=ImageFont.truetype(BOLD,76),fill='#94651e',anchor='mm')
 d.line((270,668,455,668),fill='#b5d0f5',width=12)
 return im.resize((size,size),Image.Resampling.LANCZOS)
def splash(w,h):
 im=Image.new('RGB',(w,h),'#163b78');d=ImageDraw.Draw(im);unit=min(w,h);sz=int(unit*.25);logo=icon(sz);top=int(h*.5-sz*.9);im.paste(logo,((w-sz)//2,top),logo)
 fs=max(12,int(unit*.035));y=top+sz+int(unit*.04)
 for text in ['KEUANGAN','RUMAH TANGGA']:
  d.text((w//2,y),text,font=ImageFont.truetype(BOLD,fs),fill='white',anchor='mt');y+=int(fs*1.5)
 d.text((w//2,y+fs//2),'Kelola • Rencanakan • Evaluasi',font=ImageFont.truetype(FONT,max(9,int(fs*.58))),fill='#c7dbf8',anchor='mt')
 return im
icon(1024).convert('RGB').save(ROOT/'resources/app-icon-1024.png')
icon(1024,True).save(ROOT/'resources/android-foreground.png')
for s in (192,512):icon(s).save(ROOT/f'public/icon-{s}.png')
r=ROOT/'android/app/src/main/res'
for density,n in [('mdpi',48),('hdpi',72),('xhdpi',96),('xxhdpi',144),('xxxhdpi',192)]:
 folder=r/f'mipmap-{density}';folder.mkdir(exist_ok=True)
 icon(n).save(folder/'ic_launcher.png');icon(n).save(folder/'ic_launcher_round.png');icon(round(n*108/48),True).save(folder/'ic_launcher_foreground.png')
for p in r.glob('drawable-*/splash.png'):
 w,h=Image.open(p).size;splash(w,h).save(p)
p=r/'drawable/splash.png';w,h=Image.open(p).size;splash(w,h).save(p)
branding=Image.new('RGBA',(720,180));d=ImageDraw.Draw(branding)
d.text((360,10),'KEUANGAN RUMAH TANGGA',font=ImageFont.truetype(BOLD,39),anchor='mt',fill='white')
d.text((360,90),'Kelola • Rencanakan • Evaluasi',font=ImageFont.truetype(FONT,27),anchor='mt',fill='#c7dbf8')
(r/'drawable-nodpi').mkdir(exist_ok=True);branding.save(r/'drawable-nodpi/splash_branding.png')
icon(1024).convert('RGB').save(ROOT/'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png')
# Square native launch canvas with compact central branding remains visible in both orientations.
for p in (ROOT/'ios/App/App/Assets.xcassets/Splash.imageset').glob('*.png'):splash(2732,2732).save(p)
