"""Attach live album cover images to content/he/events.json (matched by the live image alt, which names the album)."""
import json, re
raw = json.load(open('audit/raw/events.json', encoding='utf-8'))
manifest = json.load(open('public/assets/manifest.json', encoding='utf-8'))
page = json.load(open('content/he/events.json', encoding='utf-8'))
words = lambda s: set(re.sub(r'[^\w\s]', ' ', s.replace('תמונה', '').replace('של', '')).split()) - {'ה'}
norm = lambda w: w[1:] if w.startswith('ה') and len(w) > 2 else w
for album in page['albums']:
    want = {norm(w) for w in words(album['title'])}
    for im in raw['images']:
        have = {norm(w) for w in words(im['alt'])}
        if want and want <= have:
            key = re.search(r'media/([^/]+)', im['src']).group(1).replace('%7E', '~')
            e = next((m for m in manifest if key in m['sourceUrl'].replace('%7E', '~')), None)
            if e and e.get('width'):
                album['cover'] = {'src': e['file'], 'alt': im['alt'], 'width': e['width'], 'height': e['height']}
            break
    print(album['title'], '->', album.get('cover', {}).get('src'))
json.dump(page, open('content/he/events.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
