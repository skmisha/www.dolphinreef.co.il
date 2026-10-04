// Phase 1 pass 2: expand accordions / "read more" toggles and capture revealed text + header menu.
import { chromium, devices } from 'playwright';
import fs from 'node:fs/promises';

const idx = JSON.parse(await fs.readFile('audit/raw/_index.json', 'utf8'));
const browser = await chromium.launch({ proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'he-IL' });
const slugOf = (u) => { const p = new URL(u).pathname.replace(/^\/|\/$/g, ''); return p ? p.replace(/\//g, '__') : 'home'; };
const clean = (t) => (t || '').replace(/​/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

const out = {};
for (const url of idx.crawled) {
  const slug = slugOf(url);
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(3000);
  // dismiss cookie banner
  await page.getByRole('button', { name: 'אישור' }).first().click({ timeout: 2000 }).catch(() => {});
  const result = { accordions: [], readMore: [], mainText: '' };
  const toggles = await page.locator('main button[aria-expanded]').all();
  for (const t of toggles) {
    const q = clean(await t.innerText().catch(() => ''));
    if (!q) continue;
    const controls = await t.getAttribute('aria-controls');
    await t.scrollIntoViewIfNeeded().catch(() => {});
    if ((await t.getAttribute('aria-expanded')) === 'false') await t.click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(500);
    let a = '';
    if (controls) a = clean(await page.locator(`[id="${controls}"]`).innerText({ timeout: 2000 }).catch(() => ''));
    const links = controls ? await page.locator(`[id="${controls}"] a[href]`).evaluateAll((els) => els.map((e) => ({ text: e.innerText.trim(), href: e.href }))).catch(() => []) : [];
    result.accordions.push({ question: q, answer: a, links });
  }
  // Wix "read more" in collapsible text
  const more = await page.locator('button:has-text("קרא עוד"), button:has-text("קראו עוד"), [data-testid="expand-control"]').all();
  for (const m of more) { await m.click({ timeout: 2000 }).catch(() => {}); result.readMore.push(true); }
  await page.waitForTimeout(800);
  result.mainText = clean(await page.locator('#PAGES_CONTAINER, main').first().innerText().catch(() => ''));
  if (slug === 'home') {
    // header menu (desktop + hamburger)
    result.headerText = clean(await page.locator('#SITE_HEADER, header').first().innerText().catch(() => ''));
    result.headerLinks = await page.locator('#SITE_HEADER a[href], header a[href]').evaluateAll((els) => els.map((e) => ({ text: e.innerText.trim() || e.getAttribute('aria-label') || '', href: e.href })));
    result.footerText = clean(await page.locator('#SITE_FOOTER, footer').first().innerText().catch(() => ''));
    result.footerLinks = await page.locator('#SITE_FOOTER a[href], footer a[href]').evaluateAll((els) => els.map((e) => ({ text: e.innerText.trim() || e.getAttribute('aria-label') || '', href: e.href })));
  }
  out[slug] = result;
  console.log(slug, 'accordions', result.accordions.length, 'readMore', result.readMore.length);
  await page.close();
}
// Mobile hamburger menu
const m = await browser.newContext({ ...devices['iPhone 13'], locale: 'he-IL' });
const mp = await m.newPage();
await mp.goto('https://www.dolphinreef.co.il/', { waitUntil: 'load' });
await mp.waitForTimeout(3000);
const burger = mp.locator('[aria-label*="תפריט"], [aria-label*="menu" i], #MENU_AS_CONTAINER_TOGGLE, [data-testid="menuToggle"]').first();
await burger.click({ timeout: 5000 }).catch((e) => console.log('no burger', e.message));
await mp.waitForTimeout(1500);
out._mobileMenu = await mp.locator('nav a[href], #MENU_AS_CONTAINER a[href]').evaluateAll((els) => els.map((e) => ({ text: e.textContent.replace(/\s+/g, ' ').trim(), href: e.href, depth: e.closest('ul ul') ? 1 : 0 })));
out._navStructure = await mp.locator('nav').first().evaluate((n) => n.outerHTML.replace(/ class="[^"]*"/g, '').replace(/ data-[a-z-]+="[^"]*"/g, '').slice(0, 20000)).catch(() => '');
await mp.screenshot({ path: 'audit/screenshots/_mobile-menu-390.png' });
out._navs = await mp.locator('nav').evaluateAll((els) => els.map((e) => ({ label: e.getAttribute('aria-label'), text: e.innerText.trim() })));
await fs.writeFile('audit/raw/_expanded.json', JSON.stringify(out, null, 2));
await browser.close();
