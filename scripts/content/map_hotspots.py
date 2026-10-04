"""Adds labelled hotspots to content/he/map.json (run after normalize.py).
Labels were read from the map artwork at each hotspot; titles are the Hebrew line transcribed from each
live popup image (the live popups are images with baked-in text) - verify with the client."""
import json

d = json.load(open('content/he/map.json', encoding='utf-8'))
coords = {s['id']: s for s in json.load(open('audit/raw/_map-coords.json'))['spots']}
spots_raw = {s['index']: s for s in json.load(open('audit/raw/_map-spots.json'))}
LABELS = {0: '5', 1: '6', 2: '7', 3: '7', 4: '8', 5: '7', 6: '12', 7: '11', 8: 'C', 9: '10', 10: '1', 11: '9', 12: 'B', 13: 'A', 14: '2', 15: '3', 16: '4', 17: 'F', 18: 'E', 19: 'D'}
TITLES = {'1': 'כניסה, קופות ומידע', '2': 'חנות מזכרות', '3': 'אודיטוריום: סרטי דולפינים', '4': 'מרכז יצירה לילדים', '5': 'גונדולה - סירת זכוכית',
          '6': 'בר/מסעדה על החוף', '7': 'ירידה לחוף', '8': 'צפייה בדולפינים', '9': 'שחייה וצלילה עם דולפינים.', '10': 'מסעדה בהגשה עצמית.', '11': 'מרכז צילום', '12': '"סתלבט על המים".'}
spots = []
for h in d['map']['hotspots']:
    label = LABELS[h['id']]
    title = TITLES.get(label, 'דרכים נגישות')
    popup = h['popup']
    if popup: popup['alt'] = title
    spots.append({'id': h['id'], 'label': label, 'title': title, 'xPct': coords[h['id']]['xPct'], 'yPct': coords[h['id']]['yPct'], 'popup': popup})
key = lambda s: (s['label'].isalpha(), int(s['label']) if s['label'].isdigit() else ord(s['label']))
d['map']['hotspots'] = sorted(spots, key=key)
d['map']['note'] = 'Hotspot positions are % of the map image. Titles transcribed from the live popup images - verify with client.'
json.dump(d, open('content/he/map.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('hotspots', len(spots))
