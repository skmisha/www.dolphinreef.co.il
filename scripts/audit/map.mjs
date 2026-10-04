// Phase 1 pass 3: map hotspots (numbers open descriptions) on /map.
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
const browser = await chromium.launch({ proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: 'he-IL' });
await page.goto('https://www.dolphinreef.co.il/map', { waitUntil: 'load' });
await page.waitForTimeout(4000);
await page.getByRole('button', { name: 'אישור' }).first().click({ timeout: 2000 }).catch(() => {});
const info = await page.evaluate(() => {
  const main = document.querySelector('main') || document.body;
  return [...main.querySelectorAll('[role=button],button,a,[aria-haspopup],[data-testid*="hotspot" i],[tabindex="0"]')].map((e, i) => {
    e.setAttribute('data-probe', i);
    const r = e.getBoundingClientRect();
    return { i, tag: e.tagName, role: e.getAttribute('role'), label: e.getAttribute('aria-label'), text: e.textContent.trim().slice(0, 60), x: Math.round(r.left), y: Math.round(r.top + scrollY), w: Math.round(r.width), h: Math.round(r.height), id: e.id };
  });
});
const html = await page.locator('main').innerHTML();
await fs.writeFile('audit/raw/embeds/map-main.html', html);
await fs.writeFile('audit/raw/_map-probe.json', JSON.stringify(info, null, 2));
const spots = [];
for (const it of info) {
  const before = await page.evaluate(() => document.body.innerText);
  const el = page.locator(`[data-probe="${it.i}"]`);
  const img = await el.locator('img').first().getAttribute('src').catch(() => null);
  const imgAlt = await el.locator('img').first().getAttribute('alt').catch(() => null);
  await el.click({ timeout: 3000 }).catch(() => {});
  await page.waitForTimeout(2500);
  const dialog = page.locator('[role=dialog], #POPUPS_ROOT, .lightbox, [data-testid="lightbox"]').first();
  const text = (await dialog.innerText({ timeout: 2000 }).catch(() => '')).trim();
  const imgs = await dialog.locator('img').evaluateAll((els) => els.map((e) => ({ src: e.currentSrc || e.src, alt: e.alt, w: e.naturalWidth, h: e.naturalHeight }))).catch(() => []);
  const url = page.url();
  spots.push({ ...it, img, imgAlt, popupText: text, popupImages: imgs, url });
  await page.screenshot({ path: `audit/screenshots/map-spot-${it.i}.png` });
  await page.keyboard.press('Escape');
  await page.locator('[aria-label*="סגירה"], [aria-label*="close" i]').first().click({ timeout: 1500 }).catch(() => {});
  await page.waitForTimeout(800);
  if (!page.url().endsWith('/map')) { await page.goto('https://www.dolphinreef.co.il/map', { waitUntil: 'load' }); await page.waitForTimeout(3000); await page.evaluate((info) => { const main = document.querySelector('main'); [...main.querySelectorAll('[role=button],button,a,[aria-haspopup],[tabindex="0"]')].forEach((e, i) => e.setAttribute('data-probe', i)); }, info); }
  console.log(it.i, url, text.slice(0, 80).replace(/\n/g, ' | '));
}
await fs.writeFile('audit/raw/_map-spots.json', JSON.stringify(spots, null, 2));
await browser.close();
