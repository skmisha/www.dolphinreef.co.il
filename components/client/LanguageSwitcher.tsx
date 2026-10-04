'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';

/** Hidden while only one locale exists. `locales` comes from the server (config/i18n). */
export function LanguageSwitcher({ locales }: { locales: string[] }) {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('language');
  const tn = useTranslations('nav');
  if (locales.length < 2) return null;
  return (
    <nav className="lang" aria-label={tn('language')}>
      {locales.map((l) => (
        <Link key={l} href={pathname} locale={l} lang={l} aria-current={l === locale ? 'true' : undefined} hrefLang={l}>
          {t.has(l) ? t(l) : l.toUpperCase()}
        </Link>
      ))}
    </nav>
  );
}
