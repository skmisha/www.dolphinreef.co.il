import { test, expect } from '@playwright/test';
import { pages, routes, dismissConsent, BOOKING, isMobile } from './helpers';

test.beforeEach(async ({ page }) => dismissConsent(page));

/** Every external target the live site uses (audit/connections.md). Anything else fails the test. */
const ALLOWED = [
  /^https:\/\/reefbooking\.dolphinreef\.co\.il\/(swimming\.aspx|pools\.aspx|stalbet\.aspx)?$/,
  /^https:\/\/api\.whatsapp\.com\/send\/\?phone=972526021017&text&type=phone_number&app_absent=0$/,
  /^tel:(\+97286300111|086300116|086300129)$/,
  /^mailto:(info|hafakot|ran|ofra|reservation)@dolphinreef\.co\.il(\?subject=.+)?$/,
  /^https:\/\/www\.instagram\.com\/(dolphin_reef_eilat\/|p\/DDcFDsntD-5\/\?igsh=Mnd4a3RxNTFkbDVm)$/,
  /^https:\/\/www\.facebook\.com\/dolphinreefeilat$/,
  /^https:\/\/www\.tiktok\.com\/@dolphin_reef_eilat$/,
  /^https:\/\/www\.flickr\.com\/photos\/dolphinreef\/albums\/(\d+\/)?$/,
  /^https:\/\/www\.youtube\.com\/watch\?v=(FqJTx5KC5NQ|nUpcRUJwa6s|rpQdIL44CEw)$/,
  /^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=29\.5264,34\.936$/,
];

test('all outbound links point to the live targets; internal links and PDFs resolve', async ({ page, request }, info) => {
  test.skip(info.project.name !== 'desktop', 'link inventory is viewport independent');
  test.setTimeout(180_000);
  const internal = new Set<string>();
  const seen = { booking: 0, whatsapp: 0, phone: 0, email: 0, instagram: 0, facebook: 0, tiktok: 0, flickr: 0, pdf: 0 };
  for (const route of routes) {
    await page.goto(route);
    const hrefs = await page.locator('a[href]').evaluateAll((as) => as.map((a) => a.getAttribute('href')!));
    for (const h of hrefs) {
      if (h.startsWith('#')) continue;
      if (h.startsWith('/')) { internal.add(h.split('#')[0]); continue; }
      expect(ALLOWED.some((re) => re.test(h)), `${route}: unexpected outbound link ${h}`).toBe(true);
      if (h.includes('reefbooking')) seen.booking++;
      if (h.includes('whatsapp')) seen.whatsapp++;
      if (h.startsWith('tel:')) seen.phone++;
      if (h.startsWith('mailto:')) seen.email++;
      if (h.includes('instagram')) seen.instagram++;
      if (h.includes('facebook')) seen.facebook++;
      if (h.includes('tiktok')) seen.tiktok++;
      if (h.includes('flickr')) seen.flickr++;
    }
  }
  for (const [k, n] of Object.entries(seen)) if (k !== 'pdf') expect(n, `${k} links present`).toBeGreaterThan(0);
  for (const href of internal) {
    const res = await request.get(href);
    expect(res.status(), `internal link ${href}`).toBe(200);
    if (href.endsWith('.pdf')) { seen.pdf++; expect(res.headers()['content-type']).toContain('pdf'); }
  }
  expect(seen.pdf).toBe(6);
});

test('booking buttons go to the right booking page, same tab by default', async ({ page }) => {
  for (const p of pages.filter((x) => x.experience)) {
    await page.goto(`/${p.slug}`);
    const expected = BOOKING[p.experience!.booking];
    const panelBtn = page.locator('.price-panel a.btn--book');
    await expect(panelBtn).toHaveAttribute('href', expected);
    expect(await panelBtn.getAttribute('target')).toBeNull();
  }
  await page.goto('/stalbet');
  await expect(page.locator('.price-panel a.btn--secondary')).toHaveAttribute('href', BOOKING.stalbetSession);
});

test('sticky "book now" bar on mobile/tablet only', async ({ page }) => {
  await page.goto('/diving');
  const bar = page.getByRole('region', { name: 'הזמנה' });
  if (isMobile(page)) {
    await expect(bar).toBeVisible();
    await page.mouse.wheel(0, 3000);
    await expect(bar).toBeInViewport();
    await expect(bar.getByRole('link')).toHaveAttribute('href', BOOKING.diving);
    const box = await bar.getByRole('link').boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  } else {
    await expect(bar).toBeHidden();
    await expect(page.locator('.header-book')).toBeVisible();
  }
});

test('touch targets are at least 44x44 on mobile', async ({ page }) => {
  test.skip(!isMobile(page), 'mobile only');
  await page.goto('/');
  const small = await page.locator('main a.btn, main button, .book-bar a, header button, header a, .site-footer a').evaluateAll((els) =>
    els.filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.height < 43.5 || r.width < 43.5); })
      .map((e) => `${e.tagName} "${(e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 30)}" ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`));
  expect(small).toEqual([]);
});
