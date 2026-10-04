// Hotspot centres as % of the map image box (so they scale with the image).
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
const browser = await chromium.launch({ proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('https://www.dolphinreef.co.il/map', { waitUntil: 'load' });
await page.waitForTimeout(3000);
const r = await page.evaluate(() => {
  const imgs = [...document.querySelectorAll('main img')].map((i) => ({ i, r: i.getBoundingClientRect(), src: i.currentSrc }));
  const map = imgs.filter((x) => x.src.includes('7a720a93')).sort((a, b) => b.r.width - a.r.width)[0];
  const box = map.r;
  const spots = [...document.querySelectorAll('main a[role=button]')].map((a, idx) => {
    const b = a.getBoundingClientRect();
    return { id: idx, xPct: +(((b.left + b.width / 2 - box.left) / box.width) * 100).toFixed(2), yPct: +(((b.top + b.height / 2 - box.top) / box.height) * 100).toFixed(2) };
  });
  return { box: { w: box.width, h: box.height }, spots };
});
await fs.writeFile('audit/raw/_map-coords.json', JSON.stringify(r, null, 2));
console.log(JSON.stringify(r).slice(0, 600));
await browser.close();
