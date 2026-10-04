// Map hotspots open lightboxes whose content is an image (text baked in). Capture each popup image URL.
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
const browser = await chromium.launch({ proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: 'he-IL' });
await page.goto('https://www.dolphinreef.co.il/map', { waitUntil: 'load' });
await page.waitForTimeout(3000);
const imgsNow = () => page.evaluate(() => [...document.querySelectorAll('img')].filter((i) => i.getBoundingClientRect().width > 0).map((i) => ({ src: i.currentSrc || i.src, alt: i.alt, w: i.naturalWidth, h: i.naturalHeight })));
const spots = JSON.parse(await fs.readFile('audit/raw/_map-probe.json', 'utf8'));
const out = [];
console.log('start', spots.length);
for (const s of spots) {
  const before = new Set((await imgsNow()).map((i) => i.src));
  const btns = page.locator('main a[role=button]');
  const btn = btns.nth(s.i);
  const btnImg = await btn.locator('img').first().getAttribute('src', { timeout: 1500 }).catch(() => null);
  await btn.click({ timeout: 3000, force: true }).catch(() => {});
  await page.waitForTimeout(1200);
  const after = (await imgsNow()).filter((i) => !before.has(i.src));
  const href = await btn.getAttribute('href', { timeout: 1500 }).catch(() => null);
  out.push({ index: s.i, x: s.x, y: s.y, href, buttonImage: btnImg, popupImages: after });
  console.log(s.i, after.map((a) => a.src.slice(0, 90)).join(' '));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
}
await fs.writeFile('audit/raw/_map-spots.json', JSON.stringify(out, null, 2));
await browser.close();
