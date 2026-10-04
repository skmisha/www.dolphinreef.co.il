# Integrations still to do

The UI links to the live systems exactly as they work today. Nothing below has been built: each item is a future integration point.

## Forms (none exist on the live site)
The live site has no forms. Every request goes by email, phone or WhatsApp, and the UI keeps those same paths. The places below would be natural candidates for a form:

| Page | Current contact path (kept) | Possible future form |
|---|---|---|
| /events | `mailto:hafakot@dolphinreef.co.il?subject=…`, tel 086300116 / 086300129 | Event / production inquiry |
| /supportive-experience | `mailto:info@dolphinreef.co.il?subject=בקשת הרשמה…`, PDF info sheet | Programme registration (June window) |
| /accessibility, /accessibility-statement | `mailto:ran@…`, `mailto:ofra@…` | Accessibility feedback |
| /diving, /swimming | `mailto:reservation@dolphinreef.co.il?subject=בקשה לשינוי או ביטול הזמנה` | Booking change / cancel (better handled in the booking system) |
| Footer (all pages) | tel, `mailto:info@…`, WhatsApp | General contact |

## Booking / payment
- Booking and payment stay inside `reefbooking.dolphinreef.co.il`. The targets are in `config/links.ts → booking`.
- Deep links: `bookingUrl(key, params)` can append query params only. Check with the booking vendor which params pre-select an activity or date.
- There is no online entry-ticket booking today. Tickets are bought at the entrance.

## Shop
- There is no online shop. `/shop` describes the souvenir shop on site.
- When a shop exists, set `shop.url` in `config/links.ts` and add a CTA on `/shop` and in the nav. No catalog or checkout gets built here.

## Gallery
- The external gallery service is Flickr (`gallery.home` plus album URLs in `content/he/events.json`).
- Album cover thumbnails were not mapped one-to-one from the live page, so the tiles are text links. Add `cover` images per album if wanted.

## Prices: future API
- Today the source of truth is `/data/prices.json`, read through `JsonPriceRepository`.
- To switch: add `lib/prices/api-repository.ts` implementing `PriceRepository` (`getPrices`, `getPrice`), register it in `lib/prices/index.ts` under a new `DATA_SOURCE` value, and set the env var. No component changes are needed.
- Menu prices stay in `content/he/menu-*.json`. Move them too if a POS or menu API appears.

## Analytics
- No GA, GTM or Meta Pixel IDs were found on the live site. Confirm with the client, then set `NEXT_PUBLIC_*` IDs. Scripts load only after cookie consent.

## Media hosting
- Videos (199 MB) sit in `/public/assets/video`. Move them to Vercel Blob, Cloudflare Stream or Bunny Stream and set `NEXT_PUBLIC_MEDIA_BASE_URL`.
- Ideally serve them as HLS renditions.

## Content items needing client input
- Hours typos on the live page ("09:00:16:30", "שיש") are shown cleaned as "09:00-16:30" and "שישי ושבת". Confirm.
- The September 2026 holiday hours on /experience-thereef are already in the past.
- Map hotspot titles were transcribed from images (`content/he/map.json`). Verify them.
- The privacy policy jumps from section 5 to 7 on the live site (kept as is).
- The logo exists only as a 300×258 PNG. Provide an SVG.
- 45 images are flagged low-resolution (`public/assets/manifest.json`).
- English: the live `/en/*` pages currently 301 to Hebrew (`config/redirects.ts`). Remove those redirects when `en` launches.
