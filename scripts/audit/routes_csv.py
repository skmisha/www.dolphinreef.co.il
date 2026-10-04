"""Write audit/routes.csv from crawl data."""
import csv, json, glob, os
TEMPLATE = {
    'home': 'home', 'diving': 'experience', 'swimming': 'experience', 'stalbet': 'experience',
    'experience-thereef': 'info-visit', 'our-vision': 'content', 'supportive-experience': 'content', 'events': 'content-gallery',
    'shop': 'content', 'stalbetcoffe': 'venue', 'dining-at-thereef': 'venue', 'dining-at-thereef__menu-bar': 'menu',
    'dining-at-thereef__menu-stalbet': 'menu', 'map': 'map', 'accessibility': 'content', 'accessibility-statement': 'legal',
    'privacypolicy': 'legal',
}
idx = json.load(open('audit/raw/_index.json'))
with open('audit/routes.csv', 'w', newline='', encoding='utf-8') as fh:
    w = csv.writer(fh)
    w.writerow(['url', 'title', 'meta_description', 'h1', 'template_type', 'in_nav', 'status'])
    nav = {l['href'].rstrip('/') for l in json.load(open('audit/raw/_expanded.json'))['_mobileMenu']}
    for url in idx['crawled']:
        p = url.replace('https://www.dolphinreef.co.il', '').strip('/') or 'home'
        d = json.load(open(f"audit/raw/{p.replace('/', '__')}.json", encoding='utf-8'))
        w.writerow([url + ('/' if p == 'home' else ''), d['title'], d['description'], ' | '.join(d['h1']),
                    TEMPLATE[p.replace('/', '__')], 'yes' if url.rstrip('/') in nav else 'no', d.get('status')])
    for url in sorted(idx['skippedEnglish']):
        w.writerow([url, '', '', '', 'en-locale (exists on live site; not crawled - Hebrew-only scope)', 'no', ''])
print(open('audit/routes.csv', encoding='utf-8').read()[:1500])
