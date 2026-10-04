import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getPage } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';
import { HomeTemplate } from '@/components/templates/HomeTemplate';

export async function generateMetadata({ params }: PageProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;
  const page = await getPage('', locale);
  return page ? pageMetadata(page, locale) : {};
}

export default async function HomeRoute({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const page = await getPage('', locale);
  if (!page || page.template !== 'home') notFound();
  return <HomeTemplate page={page} />;
}
