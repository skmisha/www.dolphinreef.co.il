"""Parse the two HTML menu embeds (filesusr.com) into content/he/menu-*.json. Text is copied verbatim."""
import json, re
from bs4 import BeautifulSoup

SRC = {
    'menu-bar': ('166e60_a67a88e49014d4e3235557f26428e176', 'https://www.dolphinreef.co.il/dining-at-thereef/menu-bar'),
    'menu-stalbet': ('166e60_91cd1d485fd54ed9076ddd08554b5ee7', 'https://www.dolphinreef.co.il/dining-at-thereef/menu-stalbet'),
}
t = lambda el: re.sub(r'\s+', ' ', el.get_text(' ', strip=True)).strip() if el else ''

for key, (fid, page) in SRC.items():
    s = BeautifulSoup(open(f'audit/raw/embeds/{fid}.html', encoding='utf-8').read(), 'html.parser')
    for x in s(['style', 'script']): x.decompose()
    out = {
        'source': {'page': page, 'embed': f'https://www-dolphinreef-co-il.filesusr.com/html/{fid}.html'},
        'title': t(s.select_one('.hero h1')),
        'subtitle': t(s.select_one('.hero-sub')),
        'sections': [],
        'unparsed': [],
    }
    for sec in s.select('section.sec'):
        d = {'id': sec.get('id'), 'title': t(sec.select_one('.sec-title')), 'note': t(sec.select_one('.sec-note')),
             'image': (sec.select_one('.strip-inline img') or {}).get('src') if sec.select_one('.strip-inline img') else None,
             'groups': []}
        cur = {'title': '', 'items': []}
        known = set()
        def take(el):
            known.add(id(el)); known.update(id(x) for x in el.descendants)
        for el in sec.descendants:
            if getattr(el, 'name', None) is None or id(el) in known: continue
            cls = el.get('class') or []
            if 'row' in cls or 'dr' in cls:
                cur['items'].append({'name': t(el.select_one('.row-name,.dr-n')), 'description': t(el.select_one('.row-desc')),
                                     'price': t(el.select_one('.row-price,.dr-p,.dr-p-left'))})
                take(el)
            elif 'dbox-title' in cls or 'dg-label' in cls:
                if cur['items'] or cur['title'] or cur.get('notes'): d['groups'].append(cur)
                cur = {'title': t(el), 'items': []}
                take(el)
            elif 'tea-list' in cls:
                lines = [re.sub(r'\s+', ' ', l).strip() for l in el.get_text('\n').split('\n')]
                # rejoin "<b>name</b> – desc" pairs split by get_text
                txt = re.sub(r'\s+', ' ', el.decode_contents().replace('<br/>', '\n'))
                cur['list'] = [t(BeautifulSoup(x, 'html.parser')) for x in el.decode_contents().split('<br/>') if t(BeautifulSoup(x, 'html.parser'))]
                take(el)
            elif 'dn' in cls or 'add-ons' in cls:
                cur.setdefault('notes', []).append(t(el)); take(el)
        d['groups'].append(cur)
        # verify nothing lost: compare section text vs captured text
        captured = ' '.join([d['title'], d['note']] + [' '.join([g.get('title', '')] + g.get('notes', []) + g.get('list', []) + [' '.join(i.values()) for i in g['items']]) for g in d['groups']])
        for w in set(t(sec).split()) - set(captured.split()):
            out['unparsed'].append({'section': d['id'], 'token': w})
        out['sections'].append(d)
    foot = s.select_one('footer.foot p')
    out['footer'] = [t(BeautifulSoup(x, 'html.parser')) for x in foot.decode_contents().split('<br/>')] if foot else []
    json.dump(out, open(f'content/he/{key}.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    print(key, len(out['sections']), 'sections', sum(len(g['items']) for d in out['sections'] for g in d['groups']), 'items', 'unparsed:', out['unparsed'][:20], 'footer', out['footer'])
