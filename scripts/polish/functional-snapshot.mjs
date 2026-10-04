// Functional fingerprint of the running site: per route -> sorted link targets, rendered prices, title, h1;
// plus a hash of every i18n/content JSON. Usage: node scripts/polish/functional-snapshot.mjs <base> <out.json>
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { chromium } from 'playwright';
const [, , BASE = 'http://localhost:3230', OUT = 'polish/functional-before.json'] = process.argv;
const dir = path.resolve('content/he');
const slugs = fs.readdirSync(dir).filter((f) => f.endsWith('.json') && !['ui.json', 'site.json'].includes(f)).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')).slug).sort();
const hash = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex').slice(0, 16);
const out = { content: Object.fromEntries(fs.readdirSync(dir).sort().map((f) => [f, hash(path.join(dir, f))])), prices: hash('data/prices.json'), links: hash('config/links.ts'), routes: {} };
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
for (const s of slugs) {
  const res = await p.goto(`${BASE}/${s}`, { waitUntil: 'networkidle' });
  out.routes['/' + s] = await p.evaluate((status) => ({
    status,
    title: document.title,
    h1: document.querySelector('h1')?.textContent.trim(),
    links: [...new Set([...document.querySelectorAll('a[href]')].map((a) => `${a.getAttribute('href')}${a.target === '_blank' ? ' [blank]' : ''}`))].sort(),
    prices: [...document.body.innerText.matchAll(/[\d,.]+\s?₪|₪\s?[\d,.]+/g)].map((m) => m[0].replace(/\s/g, '')).sort(),
    images: document.querySelectorAll('img').length,
  }), res.status());
}
await b.close();
fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log('routes', Object.keys(out.routes).length, 'links', Object.values(out.routes).reduce((n, r) => n + r.links.length, 0), 'prices', Object.values(out.routes).reduce((n, r) => n + r.prices.length, 0));
