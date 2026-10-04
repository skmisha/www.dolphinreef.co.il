import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { dirOf } from '@/config/i18n';
import { env } from '@/config/env';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { AccessibilityToolbar } from '@/components/client/AccessibilityToolbar';
import { ConsentAndAnalytics } from '@/components/client/ConsentAndAnalytics';
import '../globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  icons: { icon: '/assets/images/166e60_0eb8b031caed4e24a4bebafcde5cb97d.png' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#04212f',
};

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations('a11y');
  const dir = dirOf(locale);
  return (
    <html lang={locale} dir={dir}>
      <head>
        {/* only the small (7 KB) Hebrew body font is preloaded; display fonts swap in without competing with the LCP image */}
        {dir === 'rtl' && <link rel="preload" href="/fonts/Assistant-400-700-hebrew.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />}
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <a className="skip" href="#main">{t('skipToContent')}</a>
          <SiteHeader />
          <main id="main" tabIndex={-1}>{children}</main>
          <SiteFooter />
          <AccessibilityToolbar />
          <ConsentAndAnalytics ids={env.analytics} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
