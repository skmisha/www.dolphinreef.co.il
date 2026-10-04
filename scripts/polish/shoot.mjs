// Full-page screenshots of every route at 390 and 1440 px. Usage: node scripts/polish/shoot.mjs <base-url> <out-dir>
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const [, , BASE = 'http://localhost:3230', OUT = 'polish/before'] = process.argv;
fs.mkdirSync(OUT, { recursive: true });
const dir = path.resolve('content/he');
const slugs = fs.readdirSync(dir).filter((f) => f.endsWith('.json') && !['ui.json', 'site.json'].includes(f))
  .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')).slug).sort();
const browser = await chromium.launch();
for (const slug of slugs) {
  const name = slug ? slug.replace(/\//g, '__') : 'home';
  for (const w of [390, 1440]) {
    const page = await browser.newPage({ viewport: { width: w, height: w === 390 ? 844 : 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce', isMobile: w === 390, hasTouch: w === 390 });
    await page.addInitScript(() => { try { localStorage.setItem('cookie-consent', 'denied'); } catch {} });
    await page.goto(`${BASE}/${slug}`, { waitUntil: 'networkidle' });
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 50)); } scrollTo(0, 0); });
    await page.waitForTimeout(300);
    // first viewport (what a visitor sees) + full page
    await page.screenshot({ path: `${OUT}/${name}-${w}-fold.jpg`, type: 'jpeg', quality: 78 });
    await page.addStyleTag({ content: '.book-bar,.a11y-fab,.site-header{position:absolute!important}' });
    await page.screenshot({ path: `${OUT}/${name}-${w}.jpg`, type: 'jpeg', quality: 70, fullPage: true });
    await page.close();
  }
  console.log(name);
}
await browser.close();
