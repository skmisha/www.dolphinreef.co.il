/**
 * Locale configuration - the only place locales are declared.
 * Adding a language = add its code here + add /content/{code}/*.json (see README).
 *
 * The dummy "en" locale exists only for tests (proves LTR layout). It is enabled with
 * I18N_TEST_LOCALES=en and its content comes from tests/fixtures/content/en.
 */
export const productionLocales = ['he'] as const;

const testLocales = (process.env.I18N_TEST_LOCALES ?? '')
  .split(',')
  .map((l) => l.trim())
  .filter(Boolean);

export const locales: readonly string[] = [...productionLocales, ...testLocales.filter((l) => !productionLocales.includes(l as never))];
export const defaultLocale = 'he';
export type Locale = string;

const RTL = new Set(['he', 'ar', 'fa', 'ur', 'yi']);
export const dirOf = (locale: Locale): 'rtl' | 'ltr' => (RTL.has(locale.split('-')[0]) ? 'rtl' : 'ltr');

/** BCP-47 tags for Intl formatting and hreflang. */
export const intlLocale: Record<string, string> = { he: 'he-IL', en: 'en-IL', ar: 'ar-IL' };
export const isLocale = (l: string): boolean => locales.includes(l);
