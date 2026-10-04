// Run axe-core (WCAG 2.2 AA tags) against the Phase 2 mockups at 390 and 1440 px.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
const axeSrc = fs.readFileSync('node_modules/axe-core/axe.min.js', 'utf8');
const browser = await chromium.launch({ proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined });
let total = 0;
for (const name of ['home', 'diving']) for (const w of [390, 1440]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('file://' + path.resolve(`design/mockups/${name}.html`), { waitUntil: 'networkidle' });
  await page.addScriptTag({ content: axeSrc });
  const r = await page.evaluate(() => axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }));
  total += r.violations.length;
  console.log(name, w, 'violations:', r.violations.map((v) => `${v.id}(${v.nodes.length}): ${v.nodes[0].target} ${v.nodes[0].failureSummary?.split('\n')[1] || ''}`));
  await page.close();
}
await browser.close();
process.exit(total ? 1 : 0);
