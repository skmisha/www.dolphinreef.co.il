// Worst-case contrast of hero text against the actual photo + scrim: hide text, screenshot, sample pixels under each text box.
// Usage: node scripts/polish/hero-contrast.mjs <url> [selectors...]
import path from 'node:path';
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
const url = process.argv[2] || 'file://' + path.resolve('polish/specimen/specimen.html');
const sels = ['.eyebrow', '.hero h1', '.hero .lead', '.hours'];
const b = await chromium.launch();
for (const w of [390, 768, 1440]) {
  const p = await b.newPage({ viewport: { width: w, height: w === 390 ? 844 : 900 } });
  await p.goto(url, { waitUntil: 'networkidle' });
  const boxes = {};
  for (const s of sels) { const bb = await p.locator(s).first().boundingBox().catch(() => null); if (bb) boxes[s] = bb; }
  const colors = Object.fromEntries(await Promise.all(Object.keys(boxes).map(async (s) => [s, await p.locator(s).first().evaluate((e) => getComputedStyle(e).color)])));
  await p.addStyleTag({ content: '.hero *:not(img){color:transparent!important;border-color:transparent!important;background:transparent!important;backdrop-filter:none!important} .hero .hours{background:rgb(10 44 56 / 0.5)!important}' });
  const file = `/tmp/hc-${w}.png`;
  await p.screenshot({ path: file });
  const res = execFileSync('python3', ['-c', `
import json,sys
from PIL import Image
im=Image.open('${file}').convert('RGB'); boxes=json.loads(sys.argv[1]); cols=json.loads(sys.argv[2])
def lum(c):
    c=[x/255 for x in c]; c=[x/12.92 if x<=0.03928 else ((x+0.055)/1.055)**2.4 for x in c]; return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]
for s,b in boxes.items():
    fg=[int(x) for x in cols[s][cols[s].index('(')+1:-1].split(',')[:3]]; Lf=lum(fg)
    px=[lum(im.getpixel((x,y))) for x in range(int(b['x']),int(b['x']+b['width']),3) for y in range(int(b['y']),int(b['y']+b['height']),3) if 0<=x<im.width and 0<=y<im.height]
    px.sort(); worst=px[int(len(px)*0.95)] if px else 0  # 95th percentile brightest background pixel
    cr=(max(Lf,worst)+0.05)/(min(Lf,worst)+0.05)
    print(f"  {s:12} fg {cols[s]:22} worst-bg-lum {worst:.3f} contrast {cr:.2f}")
`, JSON.stringify(boxes), JSON.stringify(colors)]).toString();
  console.log(w + 'px\n' + res);
  await p.close();
}
await b.close();
