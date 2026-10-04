import { defineConfig, devices } from '@playwright/test';

/**
 * QA suite. Requires prior builds:  npm run qa:build   (default + LTR test build).
 * Servers: normal, slow prices (skeleton visible), forced error, forced empty, LTR (dummy "en" locale).
 * All device projects run on Chromium (iPhone/iPad = device emulation; WebKit is not installed here).
 */
export const PORTS = { main: 3200, slow: 3201, error: 3202, empty: 3203, ltr: 3204 } as const;
const start = (port: number, env: Record<string, string> = {}, dist = '.next') => ({
  command: `npx next start -p ${port}`,
  url: `http://localhost:${port}/robots.txt`,
  reuseExistingServer: !process.env.CI,
  timeout: 60_000,
  env: { NEXT_DIST_DIR: dist, PRICE_LATENCY_MIN_MS: '150', PRICE_LATENCY_MAX_MS: '400', ...env },
});

const chromiumDevice = (d: (typeof devices)[string]) => ({ ...d, browserName: 'chromium' as const, defaultBrowserType: 'chromium' as const });

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  fullyParallel: true,
  workers: 4,
  retries: 0,
  reporter: [['list'], ['json', { outputFile: 'audit/qa/playwright-results.json' }]],
  use: { baseURL: `http://localhost:${PORTS.main}`, trace: 'retain-on-failure' },
  projects: [
    { name: 'iphone', use: chromiumDevice(devices['iPhone 13']) },
    { name: 'pixel', use: chromiumDevice(devices['Pixel 7']) },
    { name: 'ipad', use: chromiumDevice(devices['iPad (gen 7)']) },
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
  ],
  webServer: [
    start(PORTS.main),
    start(PORTS.slow, { PRICE_LATENCY_MIN_MS: '2500', PRICE_LATENCY_MAX_MS: '3000' }),
    start(PORTS.error, { PRICE_SIMULATE: 'error' }),
    start(PORTS.empty, { PRICE_SIMULATE: 'empty' }),
    start(PORTS.ltr, { I18N_TEST_LOCALES: 'en' }, '.next-ltr'),
  ],
});
