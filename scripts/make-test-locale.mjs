// Generates the dummy "en" locale used ONLY by tests (tests/fixtures/content/en, git-ignored).
// Every string becomes a Latin placeholder so LTR layout can be verified; structure/keys are identical to "he".
import fs from 'node:fs';
import path from 'node:path';

const src = path.resolve('content/he');
const out = path.resolve('tests/fixtures/content/en');
fs.mkdirSync(out, { recursive: true });
const KEEP = /^(\/|https?:|mailto:|tel:|#)|^[\d\s:.\-–/₪%]+$|^(age|clock|depth|sun|group|wave)$|^(home|experience|content|legal|events|map|menu)$|^(facts|footer)\.[a-zA-Z]+$/;
const latin = (s, key) => (KEEP.test(s) || /^(src|href|slug|template|icon|label|booking|activityId|id|titleKey|priceIds|related|youtube|goodToKnow|width|height)$/.test(key) ? s : `EN ${s.length > 40 ? 'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do' : 'Lorem ipsum'}`);
const walk = (v, key = '') => Array.isArray(v) ? v.map((x) => walk(x, key)) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x, k)])) : typeof v === 'string' ? latin(v, key) : v;
for (const f of fs.readdirSync(src).filter((f) => f.endsWith('.json'))) {
  const data = JSON.parse(fs.readFileSync(path.join(src, f), 'utf8'));
  const conv = walk(data);
  if (data.template && Array.isArray(conv.faq)) conv.faq = conv.faq.map((q, i) => ({ ...q, question: `EN Question ${i + 1}` }));
  if (data.template === "experience") conv.experience.goodToKnow = data.faq.map((q, i) => (data.experience.goodToKnow.includes(q.question) ? `EN Question ${i + 1}` : null)).filter(Boolean);
  fs.writeFileSync(path.join(out, f), JSON.stringify(conv, null, 2));
}
// ui.json messages are ICU strings: keep placeholders like {age}
const ui = JSON.parse(fs.readFileSync(path.join(src, 'ui.json'), 'utf8'));
const uiWalk = (v) => (v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, uiWalk(x)])) : `EN ${String(v).match(/\{\w+\}/g)?.join(' ') ?? ''}`.trim());
fs.writeFileSync(path.join(out, 'ui.json'), JSON.stringify(uiWalk(ui), null, 2));
console.log('wrote tests/fixtures/content/en');
