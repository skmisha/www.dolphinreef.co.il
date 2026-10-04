// Dev helper: screenshot routes of a running server. Usage: node scripts/shoot.mjs http://localhost:3100 out-dir /path1 /path2 ...
import { chromium } from 'playwright';
const [, , base, out, ...paths] = process.argv;
const browser = await chromium.launch();
for (const p of paths) {
  for (const [w, h] of [[390, 844], [1440, 900]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await page.goto(base + p, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: '.consent{display:none!important}' });
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 80)); } window.scrollTo(0, 0); });
    await page.waitForTimeout(500);
    const name = (p === '/' ? 'home' : p.slice(1).replace(/\//g, '_')) + `-${w}`;
    await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
    const ov = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    console.log(name, 'overflow', ov);
    await page.close();
  }
}
await browser.close();
