"""Build content/he/{page}.json from crawl data. Text is copied verbatim from the live site (no rewriting).
Inputs: audit/raw/{slug}.json (DOM blocks, links, images), audit/raw/_expanded.json (accordions, main text)."""
import json, re, glob, os

RAW = 'audit/raw'
exp = json.load(open(f'{RAW}/_expanded.json', encoding='utf-8'))
NOISE = {'לדלג לתוכן הראשי', 'אישור', 'דחיית הכל', 'הגדרות', 'מדיניות הפרטיות'}
COOKIE_HINT = re.compile(r'(cookies|עוגיות|קובצי Cookie)', re.I)
norm = lambda s: re.sub(r'\s+', ' ', (s or '').replace('​', '').replace('‏', '').replace('\xa0', ' ')).strip()

nav_texts = {norm(l['text']) for l in exp['_mobileMenu']}
pages = {}
for f in sorted(glob.glob(f'{RAW}/*.json')):
    name = os.path.basename(f)[:-5]
    if name.startswith('_') or name.endswith('.mobile'):
        continue
    d = json.load(open(f, encoding='utf-8'))
    e = exp.get(name, {})
    slug = name.replace('__', '/')
    main_blocks = [b for b in d['blocks'] if b['region'] == 'main']
    headings = [(b['y'], norm(b['text']), int(b['tag'][1])) for b in main_blocks if re.fullmatch(r'h[1-6]', b['tag'])]
    heading_texts = {h[1] for h in headings}
    acc = e.get('accordions', [])
    acc_text = set()
    for a in acc:
        acc_text.add(norm(a['question']))
        for line in a['answer'].split('\n'):
            if norm(line): acc_text.add(norm(line))

    # split main text into sections
    sections, cur = [], None
    for raw in e.get('mainText', '').split('\n'):
        line = norm(raw)
        if not line or line in NOISE or line in acc_text or COOKIE_HINT.search(line):
            continue
        if line in heading_texts:
            lvl = next(h[2] for h in headings if h[1] == line)
            cur = {'heading': line, 'level': lvl, 'paragraphs': [], 'links': [], 'images': []}
            sections.append(cur)
            continue
        if cur is None:
            cur = {'heading': '', 'level': 0, 'paragraphs': [], 'links': [], 'images': []}
            sections.append(cur)
        cur['paragraphs'].append(line)

    # links: assign in DOM order to the section whose text contains the link text
    internal_nav = {l['href'] for l in exp['_mobileMenu']}
    ctas = []
    for l in d['links']:
        if l['region'] != 'main':
            continue
        text, href = norm(l['text']), l['href']
        if not text and href in internal_nav:
            continue  # site navigation menu (rendered inside main by Wix)
        if text in nav_texts and href in internal_nav and text not in ' '.join(p for s in sections for p in s['paragraphs'] + [s['heading']]):
            continue
        if text in NOISE and 'privacypolicy' in href:
            continue
        placed = False
        for s in sections:
            hay = ' '.join(s['paragraphs'] + [s['heading']])
            if text and text in hay and not any(x['text'] == text and x['href'] == href for x in s['links']):
                s['links'].append({'text': text, 'href': href})
                placed = True
                break
        if not placed and not any(a for a in acc if any(x['href'] == href for x in a['links'])):
            if not any(c['href'] == href and c['text'] == text for c in ctas):
                ctas.append({'text': text, 'href': href})

    # images by vertical position
    hy = sorted([(h[0], h[1]) for h in headings])
    imgs = []
    for im in d['images']:
        if not im['src'] or im['renderedWidth'] < 40:
            continue
        imgs.append({'src': im['src'], 'alt': norm(im['alt']), 'y': im['y']})
    for im in imgs:
        owner = None
        for y, t in hy:
            if y <= im['y'] + 50:
                owner = t
        target = next((s for s in sections if s['heading'] == owner), sections[0] if sections else None)
        if target is not None:
            target['images'].append({'src': im['src'], 'alt': im['alt']})

    faq = [{'question': norm(a['question']),
            'answer': [norm(x) for x in a['answer'].split('\n') if norm(x)],
            'links': [{'text': norm(x['text']), 'href': x['href']} for x in a['links']]} for a in acc]

    page = {
        'slug': '' if slug == 'home' else slug,
        'source': d['url'],
        'seo': {'title': d['title'], 'description': d['description'], 'ogTitle': d['ogTitle'],
                'ogDescription': d['ogDescription'], 'ogImage': d['ogImage'], 'canonical': d['canonical']},
        'h1': [norm(h) for h in d['h1']],
        'sections': sections,
        'faq': faq,
        'ctas': ctas,
        'videos': [{'src': v['src'], 'poster': v['poster']} for v in d['videos'] if v['src']],
        'embeds': [{'src': i['src'], 'title': i['title']} for i in d['iframes'] if 'youtube' in i['src'] or 'filesusr' in i['src']],
    }
    out = f"content/he/{'home' if slug == 'home' else name.replace('dining-at-thereef__', '')}.json"
    if name.startswith('dining-at-thereef__'):
        # menu pages: merge page-level SEO into the parsed menu file
        m = json.load(open(out, encoding='utf-8'))
        m['seo'] = page['seo']; m['h1'] = page['h1']; m['slug'] = page['slug']
        json.dump(m, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    else:
        json.dump(page, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    print(f"{out}: {len(sections)} sections, {len(faq)} faq, {len(ctas)} ctas, {sum(len(s['images']) for s in sections)} imgs")
