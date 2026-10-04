// Render Phase 2 mockups to PNG at 390 and 1440 px (full page + first viewport).
import { chromium } from 'playwright';
import path from 'node:path';
const browser = await chromium.launch({ proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined });
for (const name of ['home', 'diving']) {
  for (const [w, h, dpr] of [[390, 844, 2], [1440, 900, 1]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: dpr });
    await page.goto('file://' + path.resolve(`design/mockups/${name}.html`), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `design/screens/${name}-${w}-viewport.png` });
    await page.screenshot({ path: `design/screens/${name}-${w}.png`, fullPage: true });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    console.log(name, w, 'horizontal overflow px:', overflow);
    await page.close();
  }
}
await browser.close();
