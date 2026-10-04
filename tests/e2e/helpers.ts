import fs from 'node:fs';
import path from 'node:path';
import { expect, type Page } from '@playwright/test';

export const PORTS = { main: 3200, slow: 3201, error: 3202, empty: 3203, ltr: 3204 } as const;
export const at = (port: number, p: string) => `http://localhost:${port}${p}`;

type AnyPage = { slug: string; template: string; seo: { title: string }; hero: { title: string }; experience?: { booking: string; priceIds: string[] } };
const dir = path.resolve('content/he');
export const pages: AnyPage[] = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith('.json') && !['ui.json', 'site.json'].includes(f))
  .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
export const routes = pages.map((p) => (p.slug ? `/${p.slug}` : '/'));
export const ui = JSON.parse(fs.readFileSync(path.join(dir, 'ui.json'), 'utf8'));

export const BOOKING: Record<string, string> = {
  default: 'https://reefbooking.dolphinreef.co.il/',
  diving: 'https://reefbooking.dolphinreef.co.il/',
  snorkeling: 'https://reefbooking.dolphinreef.co.il/swimming.aspx',
  stalbetPools: 'https://reefbooking.dolphinreef.co.il/pools.aspx',
  stalbetSession: 'https://reefbooking.dolphinreef.co.il/stalbet.aspx',
};

export async function dismissConsent(page: Page) {
  await page.addInitScript(() => {
    try { localStorage.setItem('cookie-consent', 'denied'); } catch {}
  });
}

export async function noHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, 'horizontal overflow (px)').toBeLessThanOrEqual(1);
}

export const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1440) < 1024;
