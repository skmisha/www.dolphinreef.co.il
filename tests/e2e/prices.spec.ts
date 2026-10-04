import { test, expect } from '@playwright/test';
import { at, PORTS, dismissConsent, ui } from './helpers';

test.beforeEach(async ({ page }) => dismissConsent(page));

test('prices render from the repository, formatted in ILS', async ({ page }) => {
  await page.goto('/diving');
  const rows = page.locator('.price-panel .price-rows li');
  await expect(rows).toHaveCount(2);
  await expect(rows.nth(0)).toContainText('385');
  await expect(rows.nth(0)).toContainText('₪');
  await expect(rows.nth(1)).toContainText('355');
  await page.goto('/');
  await expect(page.locator('.facts')).toContainText('74');
  await expect(page.locator('.facts')).toContainText('55');
  await expect(page.locator('.xcard__price').first()).toContainText('265');
});

test('loading skeleton appears while prices are pending (aria-busy, aria-live)', async ({ page }) => {
  await page.goto(at(PORTS.slow, '/diving'), { waitUntil: 'commit' });
  const skeleton = page.locator('.price-panel [aria-busy="true"]');
  await expect(skeleton).toBeVisible({ timeout: 2000 });
  await expect(page.locator('.price-panel [aria-live="polite"]')).toHaveCount(1);
  await expect(page.locator('.price-panel .price-rows li .amt').first()).toBeVisible({ timeout: 8000 });
  await expect(skeleton).toHaveCount(0);
});

test('error state is shown and announced when the price source fails', async ({ page }) => {
  await page.goto(at(PORTS.error, '/diving'));
  const alert = page.locator('.price-panel [role="alert"]');
  await expect(alert).toContainText(ui.price.error);
  await expect(alert.getByRole('link')).toHaveAttribute('href', 'tel:+97286300111');
  await page.goto(at(PORTS.error, '/'));
  await expect(page.locator('.facts')).toContainText(ui.price.error);
  await expect(page.locator('h1')).toBeVisible(); // page still usable
});

test('empty state is shown when no prices exist', async ({ page }) => {
  await page.goto(at(PORTS.empty, '/swimming'));
  await expect(page.locator('.price-panel [role="status"]')).toContainText(ui.price.empty);
  await expect(page.locator('.price-panel a.btn--book')).toBeVisible(); // booking still possible
});
