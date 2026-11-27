import json, os
from PIL import Image

ROOT = r'D:\王智\portfolio_site'
RAW = os.path.join(ROOT, 'assets', 'raw')
IMG = os.path.join(ROOT, 'assets', 'img')
THUMB = os.path.join(ROOT, 'assets', 'thumb')
os.makedirs(IMG, exist_ok=True)
os.makedirs(THUMB, exist_ok=True)

with open(os.path.join(ROOT, 'projects.json'), encoding='utf-8') as f:
    data = json.load(f)

names = set()
for p in data['projects']:
    names.add(p['cover'])
    names.update(p['images'])

missing = [n for n in names if not os.path.exists(os.path.join(RAW, n + '.jpg'))
           and not os.path.exists(os.path.join(RAW, n + '.png'))]
if missing:
    print('MISSING:', missing)

def save(src, base, full_w, thumb_w, quality=82):
    im = Image.open(src)
    has_alpha = im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info)
    im = im.convert('RGBA' if has_alpha else 'RGB')
    w, h = im.size
    # full
    if w > full_w:
        im2 = im.resize((full_w, round(h * full_w / w)), Image.LANCZOS)
    else:
        im2 = im
    im2.save(os.path.join(IMG, base + '.webp'), 'WEBP', quality=quality, method=6)
    # thumb (keep alpha for transparent product shots)
    if w > thumb_w:
        im3 = im.resize((thumb_w, round(h * thumb_w / w)), Image.LANCZOS)
    else:
        im3 = im
    im3.save(os.path.join(THUMB, base + '.webp'), 'WEBP', quality=80, method=6)

total = 0
for n in sorted(names):
    src = None
    for ext in ('.jpg', '.png'):
        p = os.path.join(RAW, n + ext)
        if os.path.exists(p):
            src = p
            break
    if not src:
        continue
    save(src, n, 1800, 760)
    total += 1

# portrait
portrait_src = r'D:\王智\常用及工具\工作合集\王智 照片.jpg'
if os.path.exists(portrait_src):
    save(portrait_src, 'portrait', 1200, 700, 86)

# hero: use family shot big
save(os.path.join(RAW, 's36_01.png'), 'hero', 2400, 1100, 86)

def size(d):
    return sum(os.path.getsize(os.path.join(d, f)) for f in os.listdir(d))

print('optimized', total, 'images')
print('img MB', round(size(IMG)/1048576, 1), 'thumb MB', round(size(THUMB)/1048576, 1))

with open(os.path.join(ROOT, 'data.js'), 'w', encoding='utf-8') as f:
    f.write('window.PORTFOLIO = ')
    json.dump(data, f, ensure_ascii=False, indent=2)
    f.write(';\n')
print('data.js written')
