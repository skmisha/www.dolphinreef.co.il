"""One-time transform: audit/extracted/he/*.json (raw crawl extraction) -> content/he/*.json (typed page model).

Rules: text is copied verbatim; only structure changes. Absolute live URLs to internal pages become paths,
PDFs point to /assets/pdf, images point to /assets/images (with dimensions from the manifest).
After this runs once, content/he/*.json is the source of truth and is edited by hand.
"""
import json, re, os, copy

SRC = 'audit/extracted/he'
OUT = 'content/he'
os.makedirs(OUT, exist_ok=True)
ORIGIN = 'https://www.dolphinreef.co.il'
manifest = json.load(open('public/assets/manifest.json', encoding='utf-8'))
by_key, by_url = {}, {}
for e in manifest:
    by_url[e['sourceUrl']] = e
    m = re.search(r'media/([^/?#]+)', e['sourceUrl'])
    if m: by_key[m.group(1).replace('%7E', '~')] = e
LOGO_KEY = '166e60_0eb8b031caed4e24a4bebafcde5cb97d'


def img(src, alt=''):
    m = re.search(r'media/([^/?#]+)', src or '')
    e = by_key.get(m.group(1).replace('%7E', '~')) if m else by_url.get(src)
    if not e or not e.get('width'):
        return None
    if LOGO_KEY in e['file']:
        return None
    return {'src': e['file'], 'alt': alt, 'width': e['width'], 'height': e['height']}


def poster_for(video_id):
    for e in manifest:
        if e['kind'] == 'image' and os.path.basename(e['file']).startswith(video_id) and 'f000' in e['file']:
            return {'src': e['file'], 'alt': '', 'width': e['width'], 'height': e['height']}
    return None


def href(h):
    if not h: return h
    if h.lower().split('?')[0].endswith('.pdf'):
        return '/assets/pdf/' + h.split('/')[-1]
    if h.startswith(ORIGIN):
        p = h[len(ORIGIN):] or '/'
        return p if p == '/' else p.rstrip('/')
    return h


def rich(text, links):
    """Paragraph with inline links: each link's text must occur verbatim in the paragraph."""
    own = [{'text': l['text'], 'href': href(l['href'])} for l in links if l['text'] and l['text'] in text]
    return {'text': text, 'links': own} if own else {'text': text}


def rich_seq(paragraphs, links):
    """Assign links to paragraphs in document order, so repeated link texts ("לחצו כאן") each keep their own href."""
    queue = [l for l in links if l['text']]
    out = []
    for i, text in enumerate(paragraphs):
        own, pos = [], 0
        while queue:
            l = queue[0]
            idx = text.find(l['text'], pos)
            if idx >= 0:
                own.append({'text': l['text'], 'href': href(l['href'])})
                pos = idx + len(l['text'])
                queue.pop(0)
            elif any(l['text'] in later for later in paragraphs[i + 1:]):
                break  # belongs to a later paragraph
            else:
                queue.pop(0)  # link not in any paragraph (e.g. on a heading/image)
        out.append({'text': text, 'links': own} if own else {'text': text})
    return out


def dom_links(name):
    """Main-region links of the live page in DOM order (audit/raw), the reliable order for rich_seq."""
    raw = json.load(open(f"audit/raw/{name.replace('/', '__')}.json", encoding='utf-8'))
    return [{'text': re.sub(r'\s+', ' ', l['text']).strip(), 'href': l['href']} for l in raw['links'] if l['region'] == 'main' and l['text'].strip()]


def sections_of(d, skip_h1=True, name=None):
    src = [s for s in d['sections'] if not (skip_h1 and s['level'] == 1)]
    flat = [p for s in src for p in s['paragraphs']]
    links = dom_links(name) if name else [l for s in src for l in s['links']]
    rich_all = rich_seq(flat, links)
    out, i = [], 0
    for s in src:
        n = len(s['paragraphs'])
        sec = {'heading': s['heading'], 'paragraphs': rich_all[i:i + n]}
        i += n
        imgs = [im for im in (img(x['src'], x['alt']) for x in s['images']) if im]
        if imgs: sec['images'] = imgs
        out.append(sec)
    return out


def faq_of(d):
    return [{'question': f['question'], 'answer': rich_seq(f['answer'], f['links'])} for f in d['faq']]


def hero_of(d, lead=None):
    h1 = d['sections'][0] if d['sections'] and d['sections'][0]['level'] == 1 else None
    hero = {'title': d['h1'][0] if d['h1'] else (h1['heading'] if h1 else '')}
    intro = rich_seq(h1['paragraphs'], h1['links']) if h1 and h1['paragraphs'] else []
    if intro: hero['intro'] = intro
    if lead: hero['lead'] = lead
    vids = [v for v in d.get('videos', []) if 'video.wixstatic.com' in v['src']]
    if vids:
        vid = re.search(r'video/([^/]+)/', vids[0]['src']).group(1)
        hero['video'] = {'src': f'/assets/video/{vid}.mp4', 'poster': poster_for(vid)}
    imgs = [i for i in (img(x['src'], x['alt']) for x in (h1['images'] if h1 else [])) if i]
    if imgs:
        hero['image'] = max(imgs, key=lambda i: i['width'])
    elif hero.get('video', {}).get('poster'):
        hero['image'] = hero['video']['poster']
    return hero


def seo_of(d):
    s = d['seo']
    og = img(s.get('ogImage', ''))
    return {'title': s['title'], 'description': s['description'], **({'ogImage': og['src']} if og else {})}


def load(name):
    return json.load(open(f'{SRC}/{name}.json', encoding='utf-8'))


def save(name, data):
    json.dump(data, open(f'{OUT}/{name}.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    print('wrote', name)


# ---------- generic content pages ----------
TEMPLATES = {
    'our-vision': 'content', 'supportive-experience': 'content', 'shop': 'content', 'accessibility': 'content',
    'accessibility-statement': 'legal', 'privacypolicy': 'legal', 'dining-at-thereef': 'content',
    'stalbetcoffe': 'content', 'experience-thereef': 'content', 'events': 'events', 'map': 'map',
}
for name, tpl in TEMPLATES.items():
    d = load(name)
    page = {'slug': name, 'template': tpl, 'seo': seo_of(d), 'hero': hero_of(d), 'sections': sections_of(d, name=name)}
    if d['faq']: page['faq'] = faq_of(d)
    if name == 'experience-thereef':
        # first section holds a 26-image gallery from the live page
        page['sections'][0]['layout'] = 'gallery'
    if name == 'events':
        # album tiles: headings that are only a Flickr link become gallery links
        albums, keep = [], []
        for s in page['sections']:
            if not s['paragraphs'] and len(s.get('images', [])) <= 3:
                pass
            keep.append(s)
        tiles = []
        for c in d['ctas']:
            pass
        raw_albums = [s for s in d['sections'] if s['level'] == 2 and s['links'] and 'flickr.com' in s['links'][0]['href']]
        page['albums'] = [{'title': s['heading'], 'href': s['links'][0]['href']} for s in raw_albums if s['heading'] != 'לגלריה']
        gallery_all = [l for s in d['sections'] for l in s['links'] if l['href'] == 'https://www.flickr.com/photos/dolphinreef/albums/']
        page['galleryLink'] = {'text': gallery_all[0]['text'] if gallery_all else 'לגלריה', 'href': 'https://www.flickr.com/photos/dolphinreef/albums/'}
        album_titles = {a['title'] for a in page['albums']}
        cover_imgs = [i for s in d['sections'] for i in s['images'] if 'staticflickr' in i['src'] or 'flickr' in i['src']]
        page['sections'] = [s for s in page['sections'] if s['heading'] not in album_titles]
        # "התמונות שוות אלף מילים..." + "לגלריה" were the gallery intro lines; keep them verbatim
        for s in page['sections']:
            s['paragraphs'] = [p for p in s['paragraphs'] if p['text'] not in album_titles and p['text'] != 'לגלריה']
    if name == 'map':
        spots = json.load(open('audit/raw/_map-spots.json', encoding='utf-8'))
        page['map'] = {
            'image': img('https://static.wixstatic.com/media/166e60_7a720a93da5444df87e38a94a752ee54~mv2.jpg', 'מפת התמצאות בריף הדולפינים'),
            'instructions': page['sections'][0]['heading'],
            'hotspots': [
                {'id': s['index'], 'x': s['x'], 'y': s['y'],
                 'popup': img(s['popupImages'][0]['src'], '') if s['popupImages'] else None}
                for s in spots
            ],
            'note': 'Hotspot x/y are px on the 1440px-wide live layout (map image box starts at the live page offset). Popup images contain baked-in text in 4 languages; alt text pending client transcription.',
        }
        page['sections'] = []
    save(name, page)

# ---------- experience pages ----------
EXPERIENCES = {
    'diving': {
        'activityId': 'intro-dive', 'booking': 'diving', 'priceIds': ['dive-adult', 'dive-child'],
        'facts': [
            {'icon': 'age', 'label': 'facts.age', 'value': 'מגיל 8', 'sub': 'ללא ניסיון קודם'},
            {'icon': 'clock', 'label': 'facts.duration', 'value': 'כ-25 דקות', 'sub': 'ההתארגנות וההסבר נמשכים כחצי שעה'},
            {'icon': 'depth', 'label': 'facts.depth', 'value': '6 מטר', 'sub': 'בהדרכה אישית צמודה'},
            {'icon': 'sun', 'label': 'facts.hours', 'value': '09:00-15:00', 'sub': 'למעט יום כיפור ויום הזיכרון'},
        ],
        'youtube': 'FqJTx5KC5NQ',
        'priceNote': 'בהזמנה שבוצעה מראש, לפני הכניסה לאתר, המשתתפים בפעילות יהיו פטורים מדמי הכניסה לאתר ליום הפעילות.',
        'phoneHours': 'בימים א – ה, בין השעות 08:30-16:00, ובימי שישי שבת וערבי חג בין השעות 08:30-14:00.',
        'goodToKnow': ['האם צריך להביא ציוד?', 'האם אוכל לגעת בדולפינים?'],
        'documents': [{'text': 'ראו טופס כשירות רפואית ותיאום ציפיות', 'href': '/assets/pdf/62bd3d_5abe4de656634145922ab76b2f7ccf7d.pdf'}],
        'idNote': '"חובה להצטייד בתעודת זהות וספח המעיד על גיל הילד" (אפשר גם צילום בטלפון).',
        'lead': 'צלילת היכרות בריף הדולפינים אילת – חוויה תת-ימית בסביבה הטבעית של הדולפינים, מגיל 8 וללא ניסיון קודם, בהדרכה אישית צמודה.',
        'related': ['swimming', 'stalbet', 'experience-thereef'],
    },
    'swimming': {
        'activityId': 'snorkeling', 'booking': 'snorkeling', 'priceIds': ['snorkel-adult', 'snorkel-child'],
        'facts': [
            {'icon': 'age', 'label': 'facts.age', 'value': 'מגיל 10', 'sub': 'בעל בריאות תקינה ומרגיש בטחון במים עמוקים'},
            {'icon': 'clock', 'label': 'facts.duration', 'value': 'כ-25 דקות', 'sub': 'משך ההתארגנות והתדריך הם כחצי שעה'},
            {'icon': 'group', 'label': 'facts.group', 'value': 'עד 4 משתתפים', 'sub': 'מדריך שמוביל ומלווה את הקבוצה'},
            {'icon': 'sun', 'label': 'facts.hours', 'value': '09:00-15:00', 'sub': 'בשעות נבחרות, בכפוף לתנאי הים'},
        ],
        'youtube': 'nUpcRUJwa6s',
        'priceNote': 'בהזמנה טלפונית, או בהזמנה מקוונת ובהזמנות שבוצעו מראש, לפני הכניסה לאתר (טלפונית, אינטרנט, או בקופת הכניסה), המשתתפים בפעילות יהיו פטורים מדמי הכניסה לאתר ליום הפעילות.',
        'phoneHours': 'בימים א – ה, בין השעות 08:30 - 16:00, ובימי שישי שבת וערבי חג בין השעות 08:30 – 14:00',
        'goodToKnow': ['האם צריך להביא ציוד?', 'האם ניתן לגעת בדולפינים?'],
        'documents': [{'text': 'בריאות תקינה', 'href': '/assets/pdf/62bd3d_48a9c770b7534481a7e0281efe10080d.pdf'}],
        'idNote': 'חובה להצטייד בתעודת זהות וספח המעיד על גיל הילד (אפשר גם צילום בטלפון)',
        'lead': 'שנירקול בריף הדולפינים אילת – לצוף מעל הריף בסביבה הטבעית של הדולפינים, מגיל 10, בקבוצות קטנות ובהדרכה צמודה.',
        'related': ['diving', 'stalbet', 'experience-thereef'],
    },
    'stalbet': {
        'activityId': 'stalbet-pools', 'booking': 'stalbetPools', 'priceIds': ['stalbet-session', 'stalbet-one-on-one', 'stalbet-chill-out'],
        'facts': [
            {'icon': 'age', 'label': 'facts.age', 'value': 'מגיל 18', 'sub': 'הכניסה למתחם הבריכות הינה מגיל 18'},
            {'icon': 'clock', 'label': 'facts.duration', 'value': 'שעה של בילוי', 'sub': 'בילוי עצמאי של שעה במתחם הבריכות'},
            {'icon': 'wave', 'label': 'facts.pools', 'value': '3 ברכות', 'sub': 'בריכת מלח רוויה, בריכה במליחות מי ים ובריכת מים מתוקים'},
            {'icon': 'sun', 'label': 'facts.days', 'value': 'שני - שבת', 'sub': 'בימי ראשון סגור.'},
        ],
        'youtube': 'rpQdIL44CEw',
        'priceNote': 'מחירי הפעילות כוללים גם את הכניסה ליום בילוי מלא בריף הדולפינים. מימוש ההטבה תקף ליום הפעילות בלבד, למזמין הפעילות.',
        'phoneHours': 'בימים א-ה מהשעה 08:30 - 16:00 ובימים שישי - שבת וערבי חג ושבתונים בין השעות: 08:30 - 14:00.',
        'goodToKnow': ['חשוב לדעת', 'ימים ושעות פעילות'],
        'documents': [],
        'lead': None,
        'secondaryBooking': {'text': 'להזמנת בילוי בסתלבט', 'booking': 'stalbetSession'},
        'primaryBookingText': 'להזמנת "ספיישל אחד על אחד"',
        'related': ['diving', 'swimming', 'stalbetcoffe'],
    },
}
for name, x in EXPERIENCES.items():
    d = load(name)
    secs = [s for s in sections_of(d, name=name) if s['heading'] != 'להזמנה']
    hero = hero_of(d, lead=x.pop('lead'))
    page = {'slug': name, 'template': 'experience', 'seo': seo_of(d), 'hero': hero, 'sections': secs,
            'faq': faq_of(d), 'experience': {'youtube': x.pop('youtube'), **x}}
    save(name, page)

# ---------- menus ----------
for name in ('menu-bar', 'menu-stalbet'):
    m = load(name)
    sections = []
    for s in m['sections']:
        sec = {'id': s['id'], 'title': s['title']}
        if s.get('note'): sec['note'] = s['note']
        im = img(s['image']) if s.get('image') else None
        if im: sec['image'] = im
        elif s.get('image'):
            e = by_url.get(s['image'])
            if e: sec['image'] = {'src': e['file'], 'alt': '', 'width': e['width'], 'height': e['height']}
        sec['groups'] = s['groups']
        sections.append(sec)
    page = {'slug': 'dining-at-thereef/' + name, 'template': 'menu', 'seo': {'title': m['seo']['title'], 'description': m['seo']['description'] or m['subtitle']},
            'hero': {'title': m['title'], 'lead': m['subtitle']}, 'menu': {'sections': sections, 'footer': m['footer']}}
    hero_img = [e for e in manifest if e['pages'] == ['/dining-at-thereef/' + name] and e.get('alt') == ['menu hero']] or \
               [e for e in manifest if ('/dining-at-thereef/' + name) in e['pages'] and 'menu hero' in e.get('alt', [])]
    if hero_img:
        e = hero_img[0]
        page['hero']['image'] = {'src': e['file'], 'alt': '', 'width': e['width'], 'height': e['height']}
    save(name, page)

# ---------- home ----------
d = load('home')
sec = {s['heading']: s for s in d['sections']}
exp = load('experience-thereef')
P = lambda path: next(e for e in manifest if e['file'] == path)
I = lambda path, alt='': {'src': path, 'alt': alt, 'width': P(path)['width'], 'height': P(path)['height']}
home = {
    'slug': '', 'template': 'home', 'seo': seo_of(d),
    'hero': {
        'title': 'ריף הדולפינים - חלום של מציאות', 'eyebrow': 'ריף הדולפינים באילת',
        'lead': d['seo']['description'],
        'cta': {'text': 'בואו נתחיל', 'href': '#experiences'},
        'image': I('/assets/images/62bd3d_79e6f92bc1584eafaa455a35c2d963f4.jpg', 'הנוף מתחת למים'),
        'video': {'src': '/assets/video/166e60_0ffd61ae82db425ea673ca004fc2f9a7.mp4', 'poster': I('/assets/images/166e60_0ffd61ae82db425ea673ca004fc2f9a7f000.jpg')},
    },
    'facts': [
        {'label': 'שני - חמישי', 'value': '09:00-16:30', 'note': 'בימי ראשון סגור, למעט חופשות החגים וחלק מחופשת הקיץ.'},
        {'label': 'שישי ושבת', 'value': '09:00-17:00', 'note': 'מאחר שייתכנו שינויים בעקבות המצב ובהתאם לעונות השנה מומלץ להתעדכן לפני ההגעה.'},
        {'label': 'מחירי כניסה', 'priceIds': ['entry-adult', 'entry-child'], 'note': 'ילדים עד גיל 3 כניסה חינם. ילדים עד גיל 15 חייבים בליווי מבוגר בכל מהלך הביקור.'},
    ],
    'experiences': {
        'heading': 'החוויות בריף הדולפינים',
        'cards': [
            {'slug': 'swimming', 'title': 'שנירקול בריף הדולפינים', 'text': sec['שנירקול בריף הדולפינים']['paragraphs'][0],
             'image': I('/assets/images/166e60_0d61301c2fd2421a9eff24df7f096a13.jpg', 'שנירקול בריף הדולפינים, תמונה של שלושה אנשים מחזיקים ידיים וצפים על פני המים.'),
             'chips': [{'icon': 'age', 'text': 'מגיל 10'}, {'icon': 'clock', 'text': 'כ-25 דקות במים'}], 'priceIds': ['snorkel-adult', 'snorkel-child'], 'booking': 'snorkeling'},
            {'slug': 'diving', 'title': 'צלילה בריף הדולפינים', 'text': sec['צלילה בריף הדולפינים']['paragraphs'][0],
             'image': I('/assets/images/166e60_0ffd61ae82db425ea673ca004fc2f9a7f000.jpg', 'צלילה בריף הדולפינים'),
             'chips': [{'icon': 'age', 'text': 'מגיל 8'}, {'icon': 'clock', 'text': 'כ-25 דקות במים'}], 'priceIds': ['dive-adult', 'dive-child'], 'booking': 'diving'},
            {'slug': 'stalbet', 'title': 'סתלבט על המים', 'text': sec['סתלבט על המים']['paragraphs'][0],
             'image': I('/assets/images/166e60_86bc60dfc89844a3aed848c134ed243d.jpg', 'סתלבט על המים, תמונה יפה של בחורה צפה על פני המים בסתלבט על המים בריף הדולפינים'),
             'chips': [{'icon': 'age', 'text': 'מגיל 18'}, {'icon': 'clock', 'text': 'שעה של בילוי'}], 'priceIds': ['stalbet-session', 'stalbet-one-on-one'], 'booking': 'stalbetPools'},
            {'slug': 'experience-thereef', 'title': 'חווית הביקור בריף', 'text': sec['חווית הביקור בריף']['paragraphs'][0],
             'image': I('/assets/images/166e60_1ee3cd38d7d04552acf65eda3416007f.jpg', 'A beautiful aerial picture of Dolphin Reef'),
             'chips': [{'icon': 'age', 'text': 'ילדים עד גיל 3 כניסה חינם'}, {'icon': 'clock', 'text': 'בילוי של יום שלם באתר'}], 'priceIds': ['entry-adult', 'entry-child']},
        ],
    },
    'about': {'heading': 'מי אנחנו', 'text': sec['מי אנחנו']['paragraphs'][0].removesuffix(' עוד...').removesuffix('עוד...').strip(),
              'link': {'text': 'עוד...', 'href': '/experience-thereef'},
              'image': I('/assets/images/166e60_9464caf34955478b8e60f0041d0ddff9f000.jpg', '')},
    'more': [
        {'slug': 'dining-at-thereef', 'title': 'לאכול בריף', 'text': sec['לאכול בריף']['paragraphs'][0],
         'image': I('/assets/images/166e60_57df473dadab4a6cadcab16a257c42d7.jpg', 'תמונה של הכנת אירוע בריף הדולפינים תמונה יפהיפיה')},
        {'slug': 'events', 'title': 'אירועים בריף הדולפינים', 'text': ' '.join(sec['אירועים בריף הדולפינים']['paragraphs']),
         'image': I('/assets/images/166e60_6fecf2aa885b4339b80ec9ce26c44024.jpg', 'תמונה של החוף בריף הדולפינים בשקיעה.')},
    ],
    'visit': {
        'notice': 'לתשומת לבכם: לטובת חווית הביקור שלכם ורווחת השוהים באתר, אנו מגבילים את כמות המבקרים וייתכנו ימים שבהם הכניסה תעצר (לרוב למשך שעה- שעתיים) עד לירידה בכמות השוהים באתר.',
        'image': I('/assets/images/166e60_1ee3cd38d7d04552acf65eda3416007f.jpg', ''),
    },
}
save('home', home)

# ---------- site (nav, footer, org) ----------
site = load('site')
site_out = {
    'name': 'ריף הדולפינים אילת',
    'logo': I('/assets/images/166e60_0eb8b031caed4e24a4bebafcde5cb97d.png', 'ריף הדולפינים אילת'),
    'nav': [{'label': n['label'], 'href': n['href'], **({'parent': '/dining-at-thereef'} if n['depth'] else {})} for n in site['nav']],
    'footer': {
        'columns': [
            {'titleKey': 'footer.experiences', 'items': ['/experience-thereef', '/diving', '/swimming', '/stalbet', '/supportive-experience']},
            {'titleKey': 'footer.onSite', 'items': ['/dining-at-thereef', '/stalbetcoffe', '/events', '/shop', '/map']},
            {'titleKey': 'footer.info', 'items': ['/our-vision', '/accessibility', '/accessibility-statement', '/privacypolicy']},
        ],
        'phoneLabel': 'טל: 08-6300111', 'privacyLabel': 'מדיניות פרטיות',
    },
    'organization': site['organization'],
}
save('site', site_out)
