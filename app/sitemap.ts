import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { getAllSlugs } from '@/lib/content';
import { absoluteUrl, localePath } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  const slugs = await getAllSlugs(routing.defaultLocale);
  for (const slug of slugs) {
    entries.push({
      url: absoluteUrl(localePath(routing.defaultLocale, slug)),
      changeFrequency: 'monthly',
      priority: slug === '' ? 1 : slug.includes('/') ? 0.5 : 0.8,
      alternates: { languages: Object.fromEntries(routing.locales.map((l) => [l, absoluteUrl(localePath(l, slug))])) },
    });
  }
  return entries;
}
