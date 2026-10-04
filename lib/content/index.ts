/**
 * Content data module. Pages render only through these async functions, so a CMS or DB can
 * replace this file without touching components.
 * Source today: /content/{locale}/*.json (test-only locales: /tests/fixtures/content/{locale}).
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { cache } from 'react';
import { productionLocales } from '@/config/i18n';
import type { FaqItem, NavItem, Page, Site } from './types';

export type * from './types';

const ROOT = process.cwd();
const dirFor = (locale: string) =>
  (productionLocales as readonly string[]).includes(locale)
    ? path.join(ROOT, 'content', locale)
    : path.join(ROOT, 'tests', 'fixtures', 'content', locale);

const readJson = cache(async <T,>(locale: string, file: string): Promise<T> => {
  const raw = await fs.readFile(path.join(dirFor(locale), `${file}.json`), 'utf8');
  return JSON.parse(raw) as T;
});

const NON_PAGE = new Set(['ui', 'site']);

/** slug ("" for home, "dining-at-thereef/menu-bar") -> file name */
const pageIndex = cache(async (locale: string): Promise<Map<string, string>> => {
  const files = (await fs.readdir(dirFor(locale))).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5));
  const map = new Map<string, string>();
  for (const f of files) {
    if (NON_PAGE.has(f)) continue;
    const page = await readJson<Page>(locale, f);
    map.set(page.slug, f);
  }
  return map;
});

export async function getAllSlugs(locale: string): Promise<string[]> {
  return [...(await pageIndex(locale)).keys()];
}

export async function getPage(slug: string, locale: string): Promise<Page | null> {
  const file = (await pageIndex(locale)).get(slug.replace(/^\/|\/$/g, ''));
  return file ? readJson<Page>(locale, file) : null;
}

export async function getFaq(slug: string, locale: string): Promise<FaqItem[]> {
  return (await getPage(slug, locale))?.faq ?? [];
}

export async function getSite(locale: string): Promise<Site> {
  return readJson<Site>(locale, 'site');
}

export async function getNav(locale: string): Promise<NavItem[]> {
  return (await getSite(locale)).nav;
}

export async function getUi(locale: string): Promise<Record<string, unknown>> {
  return readJson<Record<string, unknown>>(locale, 'ui');
}
