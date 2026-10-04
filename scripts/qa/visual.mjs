// Side-by-side visual comparison: live site (Phase 1 screenshots) vs new UI, per route, at 390 and 1440 px.
// Usage: start a production server on :3220, then `npm run qa:visual`. Output: audit/qa/compare/*.jpg
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';

const BASE = process.env.QA_BASE || 'http://localhost:3220';
const OUT = path.resolve('audit/qa/compare');
const NEW = path.resolve('audit/qa/screens');
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(NEW, { recursive: true });
const dir = path.resolve('content/he');
const slugs = fs.readdirSync(dir).filter((f) => f.endsWith('.json') && !['ui.json', 'site.json'].includes(f)).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')).slug);

const browser = await chromium.launch();
for (const slug of slugs) {
  const name = slug ? slug.replace(/\//g, '__') : 'home';
  for (const w of [390, 1440]) {
    const page = await browser.newPage({ viewport: { width: w, height: w === 390 ? 844 : 900 }, reducedMotion: 'reduce' });
    await page.addInitScript(() => localStorage.setItem('cookie-consent', 'denied'));
    await page.goto(`${BASE}/${slug}`, { waitUntil: 'networkidle' });
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } scrollTo(0, 0); });
    await page.addStyleTag({ content: '.book-bar,.a11y-fab,.site-header{position:absolute!important}' });
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${NEW}/${name}-${w}.png`, fullPage: true });
    await page.close();
  }
}
await browser.close();
// compose with Pillow (python) to keep this script dependency-free
execFileSync('python3', ['-c', `
import glob,os
from PIL import Image, ImageDraw
for new in sorted(glob.glob('${NEW}/*.png')):
    name=os.path.basename(new); old='audit/screenshots/'+name
    if not os.path.exists(old): continue
    a=Image.open(old).convert('RGB'); b=Image.open(new).convert('RGB')
    W=a.width; s=0.5 if W>1000 else 1
    a=a.resize((int(a.width*s),int(a.height*s))); b=b.resize((int(b.width*s),int(b.height*s)))
    H=max(a.height,b.height)+40
    c=Image.new('RGB',(a.width+b.width+30,H),'white'); d=ImageDraw.Draw(c)
    c.paste(a,(0,40)); c.paste(b,(a.width+30,40)); d.text((10,10),'LIVE (Phase 1)',fill='black'); d.text((a.width+40,10),'NEW UI',fill='black')
    c.thumbnail((2400,6000)); c.save('${OUT}/'+name.replace('.png','.jpg'),quality=70)
print('compare images:',len(glob.glob('${OUT}/*.jpg')))
`], { stdio: 'inherit' });
