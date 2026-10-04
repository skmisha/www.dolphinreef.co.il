// Phase 1 crawler: discovers routes (sitemap + nav + footer) and captures raw page data + screenshots.
import { chromium, devices } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const ORIGIN = 'https://www.dolphinreef.co.il';
const OUT = path.resolve('audit/raw');
const SHOTS = path.resolve('audit/screenshots');
await fs.mkdir(OUT, { recursive: true });
await fs.mkdir(SHOTS, { recursive: true });

const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
const browser = await chromium.launch({ proxy });
const SKIP_PREFIX = /^\/en(\/|$)/; // English Wix locale: listed in routes.csv, not crawled (Hebrew-only scope)
const skipped = new Set();

async function sitemapUrls() {
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  const urls = new Set();
  for (const sm of ['/pages-sitemap.xml', '/en_en-pages-sitemap.xml']) {
    const r = await p.request.get(ORIGIN + sm).catch(() => null);
    if (!r || !r.ok()) continue;
    const xml = await r.text();
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) urls.add(m[1].replace(/\/$/, ''));
  }
  await ctx.close();
  return [...urls];
}

const slugOf = (u) => {
  const p = new URL(u).pathname.replace(/^\/|\/$/g, '');
  return p ? p.replace(/\//g, '__') : 'home';
};

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((res) => {
      let y = 0;
      const step = () => {
        window.scrollBy(0, 500);
        y += 500;
        if (y < document.body.scrollHeight + 1000) setTimeout(step, 150);
        else { window.scrollTo(0, 0); res(); }
      };
      step();
    });
  });
  await page.waitForTimeout(1500);
}

async function extract(page) {
  return page.evaluate(() => {
    const vis = (el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return s.display !== 'none' && s.visibility !== 'hidden' && (r.width > 0 || r.height > 0);
    };
    const clean = (t) => (t || '').replace(/​/g, '').replace(/\s+/g, ' ').trim();
    const meta = (n) => document.querySelector(`meta[name="${n}"],meta[property="${n}"]`)?.content || '';
    // Ordered text blocks
    const blocks = [];
    const seen = new Set();
    document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li,button,a,span[class*="wixui-rich-text"],label,summary,td,th').forEach((el) => {
      if (!vis(el)) return;
      const tag = el.tagName.toLowerCase();
      let text = clean(el.innerText);
      if (!text) return;
      // avoid parents that duplicate children
      if (['li', 'a', 'button', 'span'].includes(tag) && el.querySelector('p,h1,h2,h3,h4,h5,h6')) return;
      const r = el.getBoundingClientRect();
      const key = tag + '|' + text + '|' + Math.round(r.top + scrollY);
      if (seen.has(key)) return;
      seen.add(key);
      const inHeader = !!el.closest('header,#SITE_HEADER');
      const inFooter = !!el.closest('footer,#SITE_FOOTER');
      blocks.push({
        tag, text,
        href: tag === 'a' ? el.href : (el.closest('a')?.href || undefined),
        y: Math.round(r.top + scrollY), x: Math.round(r.left),
        region: inHeader ? 'header' : inFooter ? 'footer' : 'main',
        fontSize: getComputedStyle(el).fontSize,
      });
    });
    blocks.sort((a, b) => a.y - b.y || b.x - a.x);
    const links = [...document.querySelectorAll('a[href]')].map((a) => ({
      href: a.href, text: clean(a.innerText) || a.getAttribute('aria-label') || a.title || '',
      target: a.target || '', region: a.closest('header,#SITE_HEADER') ? 'header' : a.closest('footer,#SITE_FOOTER') ? 'footer' : 'main',
    }));
    const images = [...document.querySelectorAll('img')].map((img) => ({
      src: img.currentSrc || img.src, alt: img.alt || '', naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight,
      renderedWidth: Math.round(img.getBoundingClientRect().width), renderedHeight: Math.round(img.getBoundingClientRect().height),
      y: Math.round(img.getBoundingClientRect().top + scrollY),
    }));
    const bgImages = [];
    document.querySelectorAll('wow-image,[data-image-info]').forEach((el) => {
      const info = el.getAttribute('data-image-info');
      if (info) { try { bgImages.push(JSON.parse(info)); } catch {} }
    });
    const videos = [...document.querySelectorAll('video')].map((v) => ({
      src: v.currentSrc || v.src || v.querySelector('source')?.src || '', poster: v.poster || '',
      width: v.videoWidth, height: v.videoHeight,
    }));
    const iframes = [...document.querySelectorAll('iframe')].map((f) => ({ src: f.src, title: f.title || '' }));
    const scripts = [...document.querySelectorAll('script[src]')].map((s) => s.src);
    const inlineScripts = [...document.querySelectorAll('script:not([src])')].map((s) => s.textContent).filter((t) => /gtag|GTM-|fbq|UA-|G-[A-Z0-9]{6,}|hotjar|clarity|enable|accessib/i.test(t)).map((t) => t.slice(0, 1500));
    const forms = [...document.querySelectorAll('form,input,textarea,select')].map((f) => ({ tag: f.tagName.toLowerCase(), name: f.name || '', type: f.type || '', placeholder: f.placeholder || '', ariaLabel: f.getAttribute('aria-label') || '' }));
    const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent);
    return {
      url: location.href, title: document.title, description: meta('description'),
      ogTitle: meta('og:title'), ogDescription: meta('og:description'), ogImage: meta('og:image'),
      canonical: document.querySelector('link[rel=canonical]')?.href || '',
      hreflang: [...document.querySelectorAll('link[rel=alternate][hreflang]')].map((l) => ({ lang: l.hreflang, href: l.href })),
      lang: document.documentElement.lang, dir: document.documentElement.dir,
      h1: [...document.querySelectorAll('h1')].map((h) => clean(h.innerText)).filter(Boolean),
      blocks, links, images, bgImages, videos, iframes, scripts, inlineScripts, forms, ld,
      height: document.body.scrollHeight,
    };
  });
}

const startUrls = await sitemapUrls();
console.log('sitemap urls', startUrls.length);
const queue = [...startUrls];
const done = new Map();
const network = {};

const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'he-IL' });
const mctx = await browser.newContext({ ...devices['iPhone 13'], locale: 'he-IL' });

while (queue.length) {
  const url = queue.shift();
  const key = url.replace(/\/$/, '');
  if (done.has(key)) continue;
  if (SKIP_PREFIX.test(new URL(key).pathname)) { skipped.add(key); continue; }
  done.set(key, null);
  const slug = slugOf(key);
  console.log('crawl', key);
  const page = await ctx.newPage();
  const reqs = [];
  page.on('request', (r) => reqs.push({ url: r.url(), type: r.resourceType() }));
  try {
    const resp = await page.goto(key, { waitUntil: 'load', timeout: 60000 });
    await autoScroll(page);
    const data = await extract(page);
    data.status = resp?.status();
    data.requests = reqs.filter((r) => ['media', 'document', 'script'].includes(r.type) || /\.(pdf|mp4|webm|m3u8)/i.test(r.url) || /video\.wixstatic|wixstatic\.com\/(ugd|media)/.test(r.url));
    await page.screenshot({ path: `${SHOTS}/${slug}-1440.png`, fullPage: true }).catch((e) => console.log('shot fail', e.message));
    await fs.writeFile(`${OUT}/${slug}.json`, JSON.stringify(data, null, 2));
    done.set(key, data);
    for (const l of data.links) {
      try {
        const u = new URL(l.href);
        if (u.host === 'www.dolphinreef.co.il' && !u.hash && !/\.(pdf|jpg|png)$/i.test(u.pathname) && !u.search) {
          const k = (u.origin + u.pathname).replace(/\/$/, '');
          if (!done.has(k) && !queue.includes(k)) queue.push(k);
        }
      } catch {}
    }
  } catch (e) {
    console.log('ERR', key, e.message);
  }
  await page.close();
  // mobile screenshot
  const mp = await mctx.newPage();
  try {
    await mp.goto(key, { waitUntil: 'load', timeout: 60000 });
    await autoScroll(mp);
    await mp.screenshot({ path: `${SHOTS}/${slug}-390.png`, fullPage: true });
    const mdata = await extract(mp);
    await fs.writeFile(`${OUT}/${slug}.mobile.json`, JSON.stringify(mdata, null, 2));
  } catch (e) { console.log('mobile ERR', key, e.message); }
  await mp.close();
}
await fs.writeFile(`${OUT}/_index.json`, JSON.stringify({ crawled: [...done.keys()], skippedEnglish: [...skipped] }, null, 2));
await browser.close();
