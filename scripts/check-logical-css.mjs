// Fails if physical direction properties / Tailwind classes are used (RTL/LTR must come from logical properties).
import fs from 'node:fs';
import path from 'node:path';

const bad = [
  /\b(margin|padding|border)-(left|right)\b/, /(^|[\s;{])(left|right)\s*:/, /text-align:\s*(left|right)/, /float:\s*(left|right)/,
  /\b(marginLeft|marginRight|paddingLeft|paddingRight|textAlign:\s*['"](left|right))/,
  /className=["'`][^"'`]*\b(ml|mr|pl|pr|left|right|text-left|text-right|rounded-l|rounded-r|border-l|border-r)-/,
];
const files = [];
const walk = (d) => { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) { if (!['node_modules', '.next'].includes(f)) walk(p); } else if (/\.(css|tsx?)$/.test(f)) files.push(p); } };
['app', 'components', 'styles'].forEach((d) => fs.existsSync(d) && walk(d));
let n = 0;
for (const f of files) fs.readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
  if (bad.some((re) => re.test(line))) { console.error(`${f}:${i + 1}: ${line.trim()}`); n++; }
});
if (n) { console.error(`\n${n} physical-direction usage(s); use logical properties`); process.exit(1); }
console.log(`logical CSS check passed (${files.length} files)`);
