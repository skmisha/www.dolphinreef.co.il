// Capture reference sites (inspiration only) and sample computed design metrics. Output: polish/references/*
import fs from 'node:fs';
import { chromium } from 'playwright';

const SITES = [
  ['aman', 'https://www.aman.com/'],
  ['fourseasons-maldives', 'https://www.fourseasons.com/maldiveskh/'], // 403 for automated browsers -> substitutes below
  ['soneva-fushi', 'https://soneva.com/resorts/soneva-fushi/'],
  ['six-senses-laamu', 'https://www.sixsenses.com/en/resorts/laamu/'],
  ['monterey-bay-aquarium', 'https://www.montereybayaquarium.org/'],
];
const browser = await chromium.launch({ proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined });
const out = fs.existsSync('polish/references/metrics.json') ? JSON.parse(fs.readFileSync('polish/references/metrics.json', 'utf8')) : {};
const only = process.argv.slice(2);
for (const [name, url] of SITES.filter(([n]) => !only.length || only.includes(n))) {
  out[name] = { url };
  for (const w of [1440, 390]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: w === 390 ? 844 : 900 }, isMobile: w === 390, hasTouch: w === 390,
      userAgent: w === 390 ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36' });
    const page = await ctx.newPage();
    try {
      const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(6000);
      // dismiss common cookie banners
      for (const t of ['Accept', 'Accept All', 'Accept all', 'I Accept', 'Agree', 'OK', 'Got it', 'Allow all']) {
        await page.getByRole('button', { name: t, exact: true }).first().click({ timeout: 800 }).catch(() => {});
      }
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `polish/references/${name}-${w}-fold.jpg`, type: 'jpeg', quality: 75 });
      await page.evaluate(async () => { for (let y = 0; y < Math.min(document.body.scrollHeight, 9000); y += 700) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 250)); } scrollTo(0, 0); });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `polish/references/${name}-${w}.jpg`, type: 'jpeg', quality: 60, fullPage: true }).catch(() => {});
      const m = await page.evaluate(() => {
        const cs = (el) => el && getComputedStyle(el);
        const pick = (sel) => { const el = [...document.querySelectorAll(sel)].find((e) => e.getBoundingClientRect().height > 0 && e.innerText?.trim()); if (!el) return null; const s = cs(el); return { text: el.innerText.trim().slice(0, 50), fontFamily: s.fontFamily.slice(0, 80), fontSize: s.fontSize, fontWeight: s.fontWeight, lineHeight: s.lineHeight, letterSpacing: s.letterSpacing, textTransform: s.textTransform, color: s.color }; };
        const btn = [...document.querySelectorAll('a,button')].find((e) => { const s = cs(e); const r = e.getBoundingClientRect(); return r.height >= 36 && r.height <= 70 && s.backgroundColor !== 'rgba(0, 0, 0, 0)' && e.innerText.trim(); });
        const bs = btn && cs(btn);
        const sections = [...document.querySelectorAll('section, main > div')].slice(0, 12).map((s) => { const c = cs(s); return `${c.paddingTop}/${c.paddingBottom}`; });
        const bodyText = [...document.querySelectorAll('p')].filter((p) => p.innerText.length > 80).slice(0, 3).map((p) => { const s = cs(p); return { fontSize: s.fontSize, lineHeight: s.lineHeight, color: s.color, maxWidth: Math.round(p.getBoundingClientRect().width), chars: Math.round(p.getBoundingClientRect().width / (parseFloat(s.fontSize) * 0.5)) }; });
        const imgs = [...document.querySelectorAll('img')].filter((i) => i.getBoundingClientRect().width > 200).slice(0, 6).map((i) => { const s = cs(i); return { radius: s.borderRadius, fit: s.objectFit, pos: s.objectPosition, w: Math.round(i.getBoundingClientRect().width), h: Math.round(i.getBoundingClientRect().height) }; });
        const transitions = [...new Set([...document.querySelectorAll('a,button,img,[class*=card]')].slice(0, 300).map((e) => cs(e).transition).filter((t) => t && t !== 'all 0s ease 0s'))].slice(0, 6);
        return {
          title: document.title,
          h1: pick('h1'), h2: pick('h2'), h3: pick('h3'), p: pick('p'), nav: pick('nav a, header a'),
          button: btn ? { text: btn.innerText.trim().slice(0, 30), bg: bs.backgroundColor, color: bs.color, radius: bs.borderRadius, height: Math.round(btn.getBoundingClientRect().height), padding: bs.padding, fontSize: bs.fontSize, fontWeight: bs.fontWeight, letterSpacing: bs.letterSpacing, textTransform: bs.textTransform } : null,
          bodyBg: cs(document.body).backgroundColor, sections, bodyText, imgs, transitions,
          heroVideo: [...document.querySelectorAll('video')].map((v) => ({ w: Math.round(v.getBoundingClientRect().width), h: Math.round(v.getBoundingClientRect().height), autoplay: v.autoplay, muted: v.muted, poster: !!v.poster })).slice(0, 2),
          fonts: [...new Set([...document.fonts].map((f) => f.family.replace(/"/g, '')))].slice(0, 10),
        };
      });
      out[name][w] = { status: res?.status(), ...m };
      console.log(name, w, res?.status(), m.title?.slice(0, 50));
    } catch (e) { out[name][w] = { error: e.message.split('\n')[0] }; console.log(name, w, 'ERR', e.message.split('\n')[0]); }
    await ctx.close();
  }
}
fs.writeFileSync('polish/references/metrics.json', JSON.stringify(out, null, 2));
await browser.close();
