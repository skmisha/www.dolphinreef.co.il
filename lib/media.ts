import { env } from '@/config/env';

/** Video/media URL: served from /public today; from NEXT_PUBLIC_MEDIA_BASE_URL (CDN/Blob) once set. */
export const mediaUrl = (path: string) => (env.mediaBaseUrl ? `${env.mediaBaseUrl}${path.replace(/^\/assets/, '')}` : path);
