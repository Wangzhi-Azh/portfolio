import json, os
from PIL import Image

ROOT = r'D:\王智\portfolio_site'
with open(os.path.join(ROOT, 'projects.json'), encoding='utf-8') as f:
    data = json.load(f)

for p in data['projects']:
    path = os.path.join(ROOT, 'assets', 'img', p['cover'] + '.webp')
    with Image.open(path) as im:
        p['coverW'], p['coverH'] = im.size

with open(os.path.join(ROOT, 'data.js'), 'w', encoding='utf-8') as f:
    f.write('window.PORTFOLIO = ')
    json.dump(data, f, ensure_ascii=False, indent=2)
    f.write(';\n')
print('data.js updated with cover sizes for', len(data['projects']), 'projects')
