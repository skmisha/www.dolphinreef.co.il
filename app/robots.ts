import type { MetadataRoute } from 'next';
import { env } from '@/config/env';

/** Indexing is off unless ALLOW_INDEXING=true (so preview/Vercel copies never compete with the live site). */
export default function robots(): MetadataRoute.Robots {
  if (!env.allowIndexing) return { rules: [{ userAgent: '*', disallow: '/' }] };
  return { rules: [{ userAgent: '*', allow: '/' }], sitemap: `${env.siteUrl}/sitemap.xml` };
}
