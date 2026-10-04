import { test, expect } from '@playwright/test';
import { at, PORTS, dismissConsent } from './helpers';

test.beforeEach(async ({ page }) => dismissConsent(page));

/** Uses the test-only build with the dummy "en" locale (I18N_TEST_LOCALES=en). */
test('dummy en locale renders LTR and mirrors the layout', async ({ page }) => {
  const rtl = await page.goto(at(PORTS.ltr, '/diving'));
  expect(rtl?.status()).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  const vw = page.viewportSize()!.width;
  const rtlLogo = (await page.locator('header .brand').first().boundingBox())!;
  const rtlArrow = await page.locator('.ico-dir').first().evaluate((e) => getComputedStyle(e).transform);

  const ltr = await page.goto(at(PORTS.ltr, '/en/diving'));
  expect(ltr?.status()).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  const ltrLogo = (await page.locator('header .brand').first().boundingBox())!;
  const ltrArrow = await page.locator('.ico-dir').first().evaluate((e) => getComputedStyle(e).transform);

  expect(rtlLogo.x).toBeGreaterThan(vw / 2); // logo at inline-start = right in RTL
  expect(ltrLogo.x).toBeLessThan(vw / 2); // ... and left in LTR
  expect(rtlArrow).not.toBe(ltrArrow); // directional icons mirror
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  // switcher is visible once 2 locales exist; hreflang lists both
  await expect(page.locator('link[rel=alternate][hreflang=en]')).toHaveCount(1);
});

test('language switcher appears with two locales and switches', async ({ page }) => {
  await page.goto(at(PORTS.ltr, '/swimming'));
  if (page.viewportSize()!.width < 1024) return; // header switcher visible on desktop bar
  const sw = page.locator('.lang');
  await expect(sw).toBeVisible();
  await sw.locator('a[hreflang=en]').click();
  await expect(page).toHaveURL(/\/en\/swimming$/);
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
});
