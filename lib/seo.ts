import type { Metadata } from 'next';
import { env } from '@/config/env';
import { defaultLocale, intlLocale, locales } from '@/config/i18n';
import type { FaqItem, Page, Site } from '@/lib/content';
import type { Price } from '@/lib/prices';

/** Public path for a slug in a locale ("as-needed" prefix: default locale has none). */
export const localePath = (locale: string, slug: string) => {
  const s = slug.replace(/^\/|\/$/g, '');
  const prefix = locale === defaultLocale ? '' : `/${locale}`;
  return `${prefix}/${s}`.replace(/\/$/, '') || '/';
};
export const absoluteUrl = (path: string) => `${env.siteUrl}${path === '/' ? '' : path}` || env.siteUrl;

export function pageMetadata(page: Page, locale: string): Metadata {
  const path = localePath(locale, page.slug);
  const languages: Record<string, string> = Object.fromEntries(locales.map((l) => [l, absoluteUrl(localePath(l, page.slug))]));
  languages['x-default'] = absoluteUrl(localePath(defaultLocale, page.slug));
  return {
    title: page.seo.title,
    description: page.seo.description,
    alternates: { canonical: absoluteUrl(path), languages },
    openGraph: {
      title: page.seo.title,
      description: page.seo.description,
      url: absoluteUrl(path),
      locale: (intlLocale[locale] ?? locale).replace('-', '_'),
      type: 'website',
      ...(page.seo.ogImage ?? page.hero.image?.src ? { images: [{ url: page.seo.ogImage ?? page.hero.image!.src }] } : {}),
    },
    robots: env.allowIndexing ? { index: true, follow: true } : { index: false, follow: false },
  };
}

/* ---------- structured data ---------- */
export function organizationLd(site: Site) {
  // reuses the live site's TouristAttraction/LocalBusiness data (address, geo, hours) and adds Place geo
  return { ...site.organization, '@context': 'https://schema.org', url: env.siteUrl };
}

export function websiteLd(site: Site) {
  return { '@context': 'https://schema.org', '@type': 'WebSite', name: site.name, url: env.siteUrl };
}

export function offersLd(page: Page, prices: Price[], locale: string) {
  const orgId = 'https://www.dolphinreef.co.il/#dolphinreef';
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: page.hero.title,
    description: page.seo.description,
    url: absoluteUrl(localePath(locale, page.slug)),
    provider: { '@id': orgId },
    offers: prices.map((p) => ({
      '@type': 'Offer',
      price: p.amount,
      priceCurrency: p.currency,
      category: p.audience,
      eligibleCustomerType: p.audience,
      ...(p.ageFrom != null ? { audience: { '@type': 'PeopleAudience', suggestedMinAge: p.ageFrom, ...(p.ageTo != null ? { suggestedMaxAge: p.ageTo } : {}) } } : {}),
      availability: 'https://schema.org/InStock',
      url: absoluteUrl(localePath(locale, page.slug)),
    })),
  };
}

export function faqLd(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer.map((a) => a.text).join('\n') },
    })),
  };
}

export function breadcrumbLd(locale: string, trail: { name: string; slug: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: absoluteUrl(localePath(locale, t.slug)) })),
  };
}
