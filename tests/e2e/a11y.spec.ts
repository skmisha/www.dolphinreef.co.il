import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { routes, dismissConsent } from './helpers';

test.beforeEach(async ({ page }) => dismissConsent(page));

for (const route of routes) {
  test(`axe WCAG 2.2 AA: ${route}`, async ({ page }, info) => {
    test.skip(info.project.name === 'pixel', 'covered by iphone (same breakpoint)');
    await page.goto(route);
    await page.waitForLoadState('networkidle');
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    const summary = results.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} × ${v.nodes[0]?.target.join(' ')}`);
    expect(summary, summary.join('\n')).toEqual([]);
  });
}

test('reduced motion: hero video never starts', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('/');
  await page.waitForTimeout(2500);
  expect(await page.locator('video').count()).toBe(0);
  await ctx.close();
});
