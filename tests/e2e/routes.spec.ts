import { test, expect } from '@playwright/test';
import { pages, dismissConsent, noHorizontalOverflow } from './helpers';

test.beforeEach(async ({ page }) => dismissConsent(page));

for (const p of pages) {
  const route = p.slug ? `/${p.slug}` : '/';
  test(`renders ${route}`, async ({ page }) => {
    const res = await page.goto(route);
    expect(res?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', 'he');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page).toHaveTitle(p.seo.title);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText(p.hero.title);
    await expect(page.locator('main#main')).toBeVisible();
    // every image has an alt attribute (empty = decorative)
    expect(await page.locator('img:not([alt])').count()).toBe(0);
    await noHorizontalOverflow(page);
  });
}

test('landscape orientation keeps layout intact', async ({ page }) => {
  const vp = page.viewportSize()!;
  await page.setViewportSize({ width: vp.height, height: vp.width });
  for (const route of ['/', '/diving', '/dining-at-thereef/menu-bar']) {
    await page.goto(route);
    await noHorizontalOverflow(page);
  }
});

test('200% zoom / 130% text reflows without horizontal scroll', async ({ page }) => {
  const vp = page.viewportSize()!;
  await page.setViewportSize({ width: Math.max(320, Math.round(vp.width / 2)), height: vp.height }); // 200% zoom == half the CSS width
  for (const route of ['/', '/diving', '/map']) {
    await page.goto(route);
    await page.evaluate(() => (document.documentElement.style.fontSize = '130%'));
    await noHorizontalOverflow(page);
  }
});

test('unknown route returns 404 page', async ({ page }) => {
  const res = await page.goto('/this-page-does-not-exist');
  expect(res?.status()).toBe(404);
});

test('old Wix English URLs 301 to Hebrew pages', async ({ request }) => {
  for (const [from, to] of [['/en/diving', '/diving'], ['/en/dining-at-thereef/stalbet-bar-menu', '/dining-at-thereef/menu-stalbet'], ['/en', '/']]) {
    const res = await request.get(from, { maxRedirects: 0 });
    expect(res.status(), from).toBe(301);
    expect(new URL(res.headers()['location'], 'http://x').pathname).toBe(to);
  }
});

test('sitemap, robots, canonical and hreflang', async ({ page, request }) => {
  const sm = await (await request.get('/sitemap.xml')).text();
  for (const p of pages) expect(sm).toContain(`https://www.dolphinreef.co.il${p.slug ? `/${p.slug}` : ''}<`);
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toMatch(/Disallow: \//); // ALLOW_INDEXING is off in QA
  await page.goto('/diving');
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', 'https://www.dolphinreef.co.il/diving');
  await expect(page.locator('link[rel=alternate][hreflang=he]')).toHaveAttribute('href', 'https://www.dolphinreef.co.il/diving');
  await expect(page.locator('link[rel=alternate][hreflang=x-default]')).toHaveCount(1);
  await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', /noindex/);
});

test('structured data: organization, offers from repository, FAQPage, breadcrumbs', async ({ page }) => {
  await page.goto('/');
  const home = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(home.some((s) => s.includes('"TouristAttraction"') && s.includes('"GeoCoordinates"'))).toBe(true);
  await page.goto('/diving');
  await page.waitForLoadState('networkidle');
  const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((s) => JSON.parse(s));
  const trip = ld.find((d) => d['@type'] === 'TouristTrip');
  expect(trip.offers.map((o: { price: number }) => o.price).sort()).toEqual([355, 385]);
  expect(ld.find((d) => d['@type'] === 'FAQPage').mainEntity.length).toBe(10);
  expect(ld.some((d) => d['@type'] === 'BreadcrumbList')).toBe(true);
});
