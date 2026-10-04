// Fails (exit 1) if any JSON key path exists in one locale but not another.
// Compares every /content/{locale}/*.json (and test fixtures when present) against the default locale.
import fs from 'node:fs';
import path from 'node:path';

const roots = [path.resolve('content'), path.resolve('tests/fixtures/content')].filter((r) => fs.existsSync(r));
const locales = new Map(); // locale -> dir
for (const r of roots) for (const l of fs.readdirSync(r)) if (fs.statSync(path.join(r, l)).isDirectory()) locales.set(l, path.join(r, l));
const base = 'he';
if (!locales.has(base)) { console.error(`default locale "${base}" missing`); process.exit(1); }

const keyPaths = (v, prefix = '', out = new Set()) => {
  if (Array.isArray(v)) v.forEach((x, i) => keyPaths(x, `${prefix}[${i}]`, out));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) keyPaths(x, prefix ? `${prefix}.${k}` : k, out);
  else out.add(prefix);
  return out;
};
const load = (dir) => Object.fromEntries(fs.readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => [f, keyPaths(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')))]));

const ref = load(locales.get(base));
let problems = 0;
for (const [locale, dir] of locales) {
  if (locale === base) continue;
  const cur = load(dir);
  for (const file of new Set([...Object.keys(ref), ...Object.keys(cur)])) {
    const a = ref[file], b = cur[file];
    if (!a || !b) { console.error(`✗ ${file}: missing in ${!a ? base : locale}`); problems++; continue; }
    for (const k of a) if (!b.has(k)) { console.error(`✗ ${locale}/${file}: missing key ${k}`); problems++; }
    for (const k of b) if (!a.has(k)) { console.error(`✗ ${base}/${file}: missing key ${k} (present in ${locale})`); problems++; }
  }
}
if (locales.size === 1) console.log(`only "${base}" present - nothing to compare (ok)`);
if (problems) { console.error(`\n${problems} i18n key mismatch(es)`); process.exit(1); }
console.log(`i18n keys consistent across: ${[...locales.keys()].join(', ')}`);
