"""Download all images, videos and PDFs referenced by the live site into public/assets and write a manifest.
Images: Wix originals (static.wixstatic.com/media/<uri>, no transforms). Videos: highest rendition requested by the page.
Flags images whose original is narrower than LOWRES_MIN px (too small for full-bleed / retina use)."""
import json, glob, os, re, hashlib, urllib.request, collections
from PIL import Image

LOWRES_MIN = 1600       # full-bleed hero needs >= 1600 px wide originals
LOWRES_CARD = 800       # cards / inline images
OUT = 'public/assets'
for sub in ('images', 'video', 'pdf'):
    os.makedirs(f'{OUT}/{sub}', exist_ok=True)

items = collections.OrderedDict()   # key -> {url, kind, pages:set, alt:set, renderedMaxW}
def add(key, url, kind, page, alt='', rw=0, extra=None):
    it = items.setdefault(key, {'url': url, 'kind': kind, 'pages': set(), 'alt': set(), 'renderedMaxW': 0, 'extra': {}})
    it['pages'].add(page)
    if alt: it['alt'].add(alt)
    it['renderedMaxW'] = max(it['renderedMaxW'], rw or 0)
    if extra: it['extra'].update(extra)

WIX = re.compile(r'static\.wixstatic\.com/media/([^/?#]+)')
for f in sorted(glob.glob('audit/raw/*.json')):
    base = os.path.basename(f)[:-5]
    if base.startswith('_'): continue
    page = base.replace('.mobile', '').replace('__', '/')
    page = '/' if page == 'home' else '/' + page
    d = json.load(open(f, encoding='utf-8'))
    for im in d['images']:
        m = WIX.search(im['src'] or '')
        if m: add(m.group(1), f'https://static.wixstatic.com/media/{m.group(1)}', 'image', page, im['alt'], im['renderedWidth'])
        elif im['src'] and im['src'].startswith('http') and 'parastorage' not in im['src']:
            add(im['src'], im['src'], 'image', page, im['alt'], im['renderedWidth'])
    for b in d.get('bgImages', []):
        u = (b.get('imageData') or {}).get('uri')
        if u: add(u, f'https://static.wixstatic.com/media/{u}', 'image', page, (b.get('imageData') or {}).get('alt', ''), 0)
    if d.get('ogImage'):
        m = WIX.search(d['ogImage'])
        if m: add(m.group(1), f'https://static.wixstatic.com/media/{m.group(1)}', 'image', page, 'og:image', 0)
    vids = {}
    for v in [x['src'] for x in d.get('videos', [])] + [r['url'] for r in d.get('requests', [])]:
        m = re.search(r'video\.wixstatic\.com/video/([^/]+)/(\d+)p/mp4/file\.mp4', v or '')
        if m: vids[m.group(1)] = max(vids.get(m.group(1), 0), int(m.group(2)))
    for vid, q in vids.items():
        add(vid, f'https://video.wixstatic.com/video/{vid}/{q}p/mp4/file.mp4', 'video', page, '', 0, {'quality': f'{q}p'})
    for v in d.get('videos', []):
        m = WIX.search(v.get('poster') or '')
        if m: add(m.group(1), f'https://static.wixstatic.com/media/{m.group(1)}', 'image', page, 'video poster', 0)
    for l in d['links']:
        if l['href'].lower().split('?')[0].endswith('.pdf'):
            add(l['href'].split('/')[-1], l['href'], 'pdf', page, l['text'])
# map popups
if os.path.exists('audit/raw/_map-spots.json'):
    for s in json.load(open('audit/raw/_map-spots.json', encoding='utf-8')):
        for im in s.get('popupImages', []) + ([{'src': s['buttonImage'], 'alt': ''}] if s.get('buttonImage') else []):
            m = WIX.search(im['src'] or '')
            if m: add(m.group(1), f'https://static.wixstatic.com/media/{m.group(1)}', 'image', '/map', im.get('alt', ''), 0)
# menu embeds
for key in ('menu-bar', 'menu-stalbet'):
    m = json.load(open(f'content/he/{key}.json', encoding='utf-8'))
    for sec in m['sections']:
        if sec.get('image'):
            w = WIX.search(sec['image'])
            if w: add(w.group(1), f'https://static.wixstatic.com/media/{w.group(1)}', 'image', '/dining-at-thereef/' + key, '', 0)
            else: add(sec['image'], sec['image'], 'image', '/dining-at-thereef/' + key, '', 0, {'thirdParty': 'unsplash.com (stock photo used in live menu embed)'})
    emb = open(f"audit/raw/embeds/{m['source']['embed'].split('/')[-1]}", encoding='utf-8').read()
    for u in re.findall(r"url\('([^']+)'\)", emb):
        w = WIX.search(u)
        if w: add(w.group(1), f'https://static.wixstatic.com/media/{w.group(1)}', 'image', '/dining-at-thereef/' + key, 'menu hero', 0)

def local_name(key, it):
    if it['kind'] == 'video': return f"video/{key}.mp4"
    if it['kind'] == 'pdf': return f"pdf/{key}"
    if 'unsplash' in it['url']:
        pid = re.search(r'photo-([\w-]+)', it['url']).group(1)
        return f'images/unsplash-{pid}.jpg'
    name = re.sub(r'[^\w.\-]', '_', key.replace('~mv2', ''))
    return f'images/{name}'

def fetch(url, path):
    if os.path.exists(path) and os.path.getsize(path) > 0: return True
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (dolphinreef-ui asset audit)'})
    try:
        with urllib.request.urlopen(req, timeout=180) as r, open(path, 'wb') as fh:
            while True:
                chunk = r.read(1 << 20)
                if not chunk: break
                fh.write(chunk)
        return True
    except Exception as e:
        print('FAIL', url, e); return False

manifest = []
for key, it in items.items():
    rel = local_name(key, it)
    path = f'{OUT}/{rel}'
    ok = fetch(it['url'], path)
    entry = {'file': f'/assets/{rel}', 'sourceUrl': it['url'], 'kind': it['kind'], 'pages': sorted(it['pages']),
             'alt': sorted(it['alt']), 'bytes': os.path.getsize(path) if ok else 0, 'downloaded': ok, **it['extra']}
    if ok and it['kind'] == 'image':
        try:
            with Image.open(path) as im:
                entry['width'], entry['height'] = im.size
                entry['format'] = im.format
        except Exception as e:
            entry['note'] = f'not a raster image ({e.__class__.__name__})'
        w = entry.get('width', 0)
        if w and (w < LOWRES_CARD or (it['renderedMaxW'] >= 1000 and w < LOWRES_MIN)):
            entry['lowResolution'] = True
            entry['lowResolutionReason'] = f'original {w}px wide; rendered up to {it["renderedMaxW"]}px on live site' if it['renderedMaxW'] else f'original {w}px wide (< {LOWRES_CARD}px)'
        elif w and w < LOWRES_MIN:
            entry['lowResolutionForHero'] = True
    if it['kind'] == 'video':
        entry['dimensionsFromRendition'] = it['extra'].get('quality')
    manifest.append(entry)
    print(entry['kind'], entry['file'], entry.get('width'), entry.get('height'), entry['bytes'])

json.dump(manifest, open(f'{OUT}/manifest.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
c = collections.Counter(m['kind'] for m in manifest)
print(c, 'lowres:', sum(1 for m in manifest if m.get('lowResolution')), 'total MB', round(sum(m['bytes'] for m in manifest) / 1e6, 1))
