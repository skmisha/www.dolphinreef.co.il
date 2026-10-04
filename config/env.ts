/** Typed access to environment variables. All are optional; defaults keep the site safe to deploy. */
export const env = {
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.dolphinreef.co.il').replace(/\/$/, ''),
  allowIndexing: process.env.ALLOW_INDEXING === 'true',
  dataSource: (process.env.DATA_SOURCE || 'json') as 'json',
  priceLatency: {
    min: Number(process.env.PRICE_LATENCY_MIN_MS ?? 150),
    max: Number(process.env.PRICE_LATENCY_MAX_MS ?? 400),
  },
  /**
   * "static" (default): prices are read at build time and pages are pre-rendered (fast, CDN-cached).
   * "dynamic": prices are fetched per request and streamed into skeletons (QA, or a live price API).
   */
  priceRendering: (process.env.PRICE_RENDERING === 'dynamic' ? 'dynamic' : 'static') as 'static' | 'dynamic',
  /** QA only: force price states. "error" | "empty" | "" */
  priceSimulate: process.env.PRICE_SIMULATE || '',
  mediaBaseUrl: (process.env.NEXT_PUBLIC_MEDIA_BASE_URL || '').replace(/\/$/, ''),
  analytics: {
    gaId: process.env.NEXT_PUBLIC_GA_ID || '',
    gtmId: process.env.NEXT_PUBLIC_GTM_ID || '',
    metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || '',
  },
} as const;
