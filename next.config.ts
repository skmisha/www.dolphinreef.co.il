import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { redirects } from './config/redirects';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 414, 640, 768, 1024, 1280, 1440, 1920],
    qualities: [60, 75],
  },
  async redirects() {
    return redirects;
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
