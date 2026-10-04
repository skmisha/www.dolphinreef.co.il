// Render the Phase 2 specimen at 390 and 1440 px (fold + full page) and run axe (WCAG 2.2 AA) on it.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
const axe = fs.readFileSync('node_modules/axe-core/axe.min.js', 'utf8');
const url = 'file://' + path.resolve('polish/specimen/specimen.html');
const b = await chromium.launch();
for (const w of [390, 1440]) {
  const p = await b.newPage({ viewport: { width: w, height: w === 390 ? 844 : 900 }, deviceScaleFactor: w === 390 ? 2 : 1, isMobile: w === 390 });
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: `polish/specimen/specimen-${w}-fold.png` });
  await p.addStyleTag({ content: '.bookbar--fixed{position:absolute!important;inset-block-end:auto!important;inset-block-start:0}' });
  await p.screenshot({ path: `polish/specimen/specimen-${w}.png`, fullPage: true });
  await p.reload(); await p.addScriptTag({ content: axe });
  const r = await p.evaluate(() => axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] }));
  const of = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  console.log(w, 'overflow', of, 'axe:', r.violations.map((v) => `${v.id}(${v.nodes.length}) ${v.nodes[0].target} ${v.nodes[0].any[0]?.message ?? ''}`));
}
await b.close();
