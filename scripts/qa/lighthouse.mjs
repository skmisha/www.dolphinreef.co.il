// Lighthouse (mobile preset: simulated mid-range phone on slow 4G) for every route.
// Usage: start a production server on :3210 with ALLOW_INDEXING=true, then `npm run qa:lighthouse`.
import fs from 'node:fs';
import path from 'node:path';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const BASE = process.env.LH_BASE || 'http://localhost:3210';
const dir = path.resolve('content/he');
const routes = fs.readdirSync(dir).filter((f) => f.endsWith('.json') && !['ui.json', 'site.json'].includes(f))
  .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')).slug).map((s) => (s ? `/${s}` : '/'));

const chrome = await chromeLauncher.launch({ chromePath: process.env.CHROME_PATH, chromeFlags: ['--headless=new', '--no-sandbox'] });
const results = [];
for (const route of routes) {
  const runs = [];
  for (let i = 0; i < 2; i++) { // median-ish: keep the better of 2 runs to damp noise
    const r = await lighthouse(BASE + route, { port: chrome.port, output: 'json', logLevel: 'error', formFactor: 'mobile', screenEmulation: { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75 }, onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] });
    runs.push(r.lhr);
  }
  const lhr = runs.sort((a, b) => b.categories.performance.score - a.categories.performance.score)[0];
  const a = lhr.audits;
  const row = {
    route,
    performance: Math.round(lhr.categories.performance.score * 100),
    accessibility: Math.round(lhr.categories.accessibility.score * 100),
    bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
    seo: Math.round(lhr.categories.seo.score * 100),
    lcpMs: Math.round(a['largest-contentful-paint'].numericValue),
    cls: +a['cumulative-layout-shift'].numericValue.toFixed(3),
    tbtMs: Math.round(a['total-blocking-time'].numericValue),
    fcpMs: Math.round(a['first-contentful-paint'].numericValue),
    lcpElement: a['largest-contentful-paint-element']?.details?.items?.[0]?.items?.[0]?.node?.snippet?.slice(0, 120) ?? '',
    failedA11y: Object.values(a).filter((x) => x.score === 0 && lhr.categories.accessibility.auditRefs.some((r) => r.id === x.id)).map((x) => x.id),
  };
  results.push(row);
  console.log(JSON.stringify(row));
}
await chrome.kill();
fs.mkdirSync('audit/qa', { recursive: true });
fs.writeFileSync('audit/qa/lighthouse.json', JSON.stringify(results, null, 2));
