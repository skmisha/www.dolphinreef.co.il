/**
 * Every outbound connection of the site, in one place. No logic beyond URL building.
 * Targets are identical to the live site (see audit/connections.md). Do not change vendor setups here.
 */

const BOOKING_ORIGIN = 'https://reefbooking.dolphinreef.co.il';

/** Booking system pages (reefbooking.dolphinreef.co.il stays untouched). */
export const booking = {
  default: `${BOOKING_ORIGIN}/`,
  diving: `${BOOKING_ORIGIN}/`,
  snorkeling: `${BOOKING_ORIGIN}/swimming.aspx`,
  stalbetPools: `${BOOKING_ORIGIN}/pools.aspx`,
  stalbetSession: `${BOOKING_ORIGIN}/stalbet.aspx`,
} as const;
export type BookingKey = keyof typeof booking;

/** "_self" (default, same tab) or "_blank". */
export const bookingTarget: '_self' | '_blank' = process.env.NEXT_PUBLIC_BOOKING_TARGET === '_blank' ? '_blank' : '_self';

/**
 * Build a booking URL. May only append deep-link / UTM query params - nothing else.
 * Global UTM defaults come from NEXT_PUBLIC_BOOKING_UTM (e.g. "utm_source=website&utm_medium=cta").
 */
export function bookingUrl(key: BookingKey = 'default', params: Record<string, string> = {}): string {
  const url = new URL(booking[key]);
  const defaults = new URLSearchParams(process.env.NEXT_PUBLIC_BOOKING_UTM || '');
  defaults.forEach((v, k) => url.searchParams.set(k, v));
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return url.toString();
}

export const contact = {
  phone: { href: 'tel:+97286300111', display: '08-6300111' },
  eventsPhones: [
    { href: 'tel:086300116', display: '086300116' },
    { href: 'tel:086300129', display: '086300129' },
  ],
  email: { href: 'mailto:info@dolphinreef.co.il', display: 'info@dolphinreef.co.il' },
  whatsapp: { href: 'https://api.whatsapp.com/send/?phone=972526021017&text&type=phone_number&app_absent=0' },
} as const;

export const social = [
  { id: 'whatsapp', label: 'WhatsApp', href: contact.whatsapp.href },
  { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/dolphin_reef_eilat/' },
  { id: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/dolphinreefeilat' },
  { id: 'tiktok', label: 'TikTok', href: 'https://www.tiktok.com/@dolphin_reef_eilat' },
] as const;

/** External gallery service (Flickr). Album URLs live in content/{locale}/events.json. */
export const gallery = { home: 'https://www.flickr.com/photos/dolphinreef/albums/' } as const;

/** No online shop exists on the live site; /shop is informational. Set when one exists. */
export const shop = { url: null as string | null };

export const youtube = (id: string) => `https://www.youtube.com/watch?v=${id}`;
export const googleMaps = (lat: number, lng: number) => `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

export const isExternal = (href: string) => /^(https?:|mailto:|tel:)/.test(href);
/** Mirrors the live site: external sites and PDFs open in a new tab; booking follows bookingTarget. */
export const opensNewTab = (href: string) =>
  href.startsWith(BOOKING_ORIGIN) ? bookingTarget === '_blank' : /^https?:/.test(href) || /\.pdf($|\?)/i.test(href);
export const isBooking = (href: string) => href.startsWith(BOOKING_ORIGIN);
