import hashlib, os, json, collections
from pptx import Presentation
from PIL import Image
import io

SRC = r'D:\王智\常用及工具\工作合集\王智作品集.pptx'
OUT = r'D:\王智\portfolio_site\assets\raw'
os.makedirs(OUT, exist_ok=True)

p = Presentation(SRC)
hashes = collections.Counter()
slides = []
for n, slide in enumerate(p.slides, 1):
    items = []
    for idx, sh in enumerate(slide.shapes):
        if sh.shape_type == 13:
            try:
                blob = sh.image.blob
            except Exception:
                continue
            h = hashlib.md5(blob).hexdigest()
            hashes[h] += 1
            items.append((idx, h, blob, sh))
    slides.append((n, items))

decorative = {h for h, c in hashes.items() if c >= 8}

records = []
for n, items in slides:
    for idx, h, blob, sh in items:
        if h in decorative:
            continue
        try:
            im = Image.open(io.BytesIO(blob))
            w, hh = im.size
        except Exception:
            w = hh = 0
        # skip tiny
        if w * hh < 200 * 150:
            continue
        ext = sh.image.ext
        fn = f"s{n:02d}_{idx:02d}.{ext}"
        path = os.path.join(OUT, fn)
        with open(path, 'wb') as f:
            f.write(blob)
        records.append({"slide": n, "file": fn, "w": w, "h": hh,
                        "left": int(sh.left or 0), "top": int(sh.top or 0),
                        "width": int(sh.width or 0), "height": int(sh.height or 0),
                        "kb": round(len(blob)/1024)})

with open(r'D:\王智\portfolio_site\_images.json', 'w', encoding='utf-8') as f:
    json.dump({"decorative": sorted(decorative), "images": records}, f, ensure_ascii=False, indent=1)

print("decorative count", len(decorative))
print("content images", len(records))
for r in records:
    print(r["slide"], r["file"], r["w"], r["h"], r["kb"], "KB", r["width"], r["height"])
