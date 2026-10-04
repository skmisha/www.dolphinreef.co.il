import { test, expect } from '@playwright/test';
import { dismissConsent, isMobile, ui } from './helpers';

test.beforeEach(async ({ page }) => dismissConsent(page));

test('skip link moves focus to main content', async ({ page }) => {
  await page.goto('/diving');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: ui.a11y.skipToContent });
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
});

test('primary navigation reaches pages (drawer on mobile, bar on desktop)', async ({ page }) => {
  await page.goto('/');
  if (isMobile(page)) {
    const toggle = page.getByRole('button', { name: ui.nav.menu, exact: true });
    await toggle.click();
    const drawer = page.getByRole('dialog', { name: ui.nav.menu });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole('link')).not.toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
    await expect(toggle).toBeFocused();
    await toggle.click();
    await drawer.getByRole('link', { name: 'שנירקול בריף הדולפינים' }).click();
  } else {
    await page.locator('.nav').getByRole('link', { name: 'שנירקול בריף הדולפינים' }).click();
  }
  await expect(page).toHaveURL(/\/swimming$/);
  await expect(page.locator('h1')).toHaveText('שנירקול בריף הדולפינים');
});

test('experience card opens its page', async ({ page }) => {
  await page.goto('/');
  await page.locator('.xcard').filter({ hasText: 'צלילה בריף הדולפינים' }).getByRole('link', { name: 'צלילה בריף הדולפינים', exact: true }).click();
  await expect(page).toHaveURL(/\/diving$/);
});

test('FAQ accordion is keyboard operable', async ({ page }) => {
  await page.goto('/swimming');
  const second = page.locator('.faq details').nth(1);
  await expect(second).not.toHaveAttribute('open', '');
  await second.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(second).toHaveAttribute('open', '');
});

test('accessibility toolbar toggles settings and persists them', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: ui.a11y.toolbar }).click();
  await page.getByRole('button', { name: ui.a11y.contrast }).click();
  await page.getByRole('button', { name: ui.a11y.fontIncrease }).click();
  await page.getByRole('button', { name: ui.a11y.stopAnimations }).click();
  const html = page.locator('html');
  await expect(html).toHaveClass(/a11y-contrast/);
  await expect(html).toHaveClass(/a11y-no-motion/);
  await page.reload();
  await expect(html).toHaveClass(/a11y-contrast/);
  expect(await html.evaluate((el) => el.style.fontSize)).toBe('115%');
});

test('cookie consent appears first visit and gates analytics', async ({ browser }) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const requested: string[] = [];
  page.on('request', (r) => requested.push(r.url()));
  await page.goto('/');
  const banner = page.getByRole('region', { name: ui.cookies.title });
  await expect(banner).toBeVisible();
  await banner.getByRole('button', { name: ui.cookies.reject }).click();
  await expect(banner).toBeHidden();
  expect(requested.some((u) => /googletagmanager|facebook\.net/.test(u))).toBe(false);
  await ctx.close();
});

test('language switcher is hidden while only one locale exists', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.lang')).toHaveCount(0);
});
