import { defineRouting } from 'next-intl/routing';
import { locales, defaultLocale } from '@/config/i18n';

// "as-needed": the default locale has no prefix, so Hebrew URLs stay identical to the live site.
export const routing = defineRouting({ locales: [...locales], defaultLocale, localePrefix: 'as-needed', localeDetection: false });
