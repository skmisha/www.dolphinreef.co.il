import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { getAllSlugs, getPage } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';
import { ExperienceTemplate } from '@/components/templates/ExperienceTemplate';
import { ContentTemplate } from '@/components/templates/ContentTemplate';
import { MenuTemplate } from '@/components/templates/MenuTemplate';

export const dynamicParams = false;

export async function generateStaticParams() {
  const params: { locale: string; slug: string[] }[] = [];
  for (const locale of routing.locales) {
    for (const slug of await getAllSlugs(locale)) if (slug) params.push({ locale, slug: slug.split('/') });
  }
  return params;
}

export async function generateMetadata({ params }: PageProps<'/[locale]/[...slug]'>): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await getPage(slug.join('/'), locale);
  return page ? pageMetadata(page, locale) : {};
}

export default async function ContentRoute({ params }: PageProps<'/[locale]/[...slug]'>) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const page = await getPage(slug.join('/'), locale);
  if (!page) notFound();
  switch (page.template) {
    case 'experience':
      return <ExperienceTemplate page={page} />;
    case 'menu':
      return <MenuTemplate page={page} />;
    case 'content':
    case 'legal':
    case 'events':
    case 'map':
      return <ContentTemplate page={page} />;
    default:
      notFound();
  }
}
