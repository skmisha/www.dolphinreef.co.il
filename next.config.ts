import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { redirects } from './config/redirects';
import { locales } from './config/i18n';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 414, 640, 768, 1024, 1280, 1440, 1920],
    qualities: [60, 75],
  },
  // separate build dir for the test-only LTR build (I18N_TEST_LOCALES=en)
  distDir: process.env.NEXT_DIST_DIR || '.next',
  async redirects() {
    // the /en/* -> Hebrew 301s apply only while "en" is not a real locale
    return locales.includes('en') ? redirects.filter((r) => !r.source.startsWith('/en')) : redirects;
  },
  async headers() {
    return [{ source: '/assets/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] }];
  },
  poweredByHeader: false,
  // content/prices are read from disk at request time: bundle them into server functions,
  // and keep large static media (served from the CDN by Vercel) out of the function bundle.
  outputFileTracingIncludes: { '/**': ['./content/**/*.json', './data/**/*.json'] },
  outputFileTracingExcludes: { '/**': ['./public/**', './audit/**', './design/**', './scripts/**', './tests/**'] },
};

export default withNextIntl(nextConfig);
