# Dolphin Reef Eilat: website UI

This is a new UI for https://www.dolphinreef.co.il, built with Next.js 16 (App Router), TypeScript, Tailwind CSS 4 and next-intl.
It is **UI only**. Booking, payment, gallery and contact all link to the existing systems exactly as they work today (`config/links.ts`, `audit/connections.md`).

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
```

Deploy on Vercel with the Next.js preset (Node 20.9+). No environment variable is required; see `.env.example`.
Keep `ALLOW_INDEXING` unset on preview domains so the copy is `noindex` and can't compete with the live site.

## Layout

| Path | What |
|---|---|
| `content/{locale}/*.json` | All page content (one file per page) plus `site.json` (nav, footer, organization) and `ui.json` (buttons and labels) |
| `data/prices.json` | Price source of truth, with source page and quote for each price |
| `config/i18n.ts` | Locale list, default locale, text direction |
| `config/links.ts` | Every outbound URL: booking, phone, email, WhatsApp, social, gallery, shop |
| `config/redirects.ts` | 301 map from old Wix URLs |
| `lib/content/` | Typed async content loaders: `getPage`, `getFaq`, `getNav`, `getSite`, `getUi` |
| `lib/prices/` | `PriceRepository` interface, `JsonPriceRepository`, factory selected by `DATA_SOURCE` |
| `components/` | UI components and page templates |
| `styles/tokens.css` | Design tokens (single source; also used by `design/` mockups) |
| `public/assets/` | Images, videos and PDFs from the live site, plus `manifest.json` |
| `audit/`, `design/` | Phase 1 extraction and Phase 2 design deliverables |

## Edit content

1. Open the page file in `content/he/`, e.g. `content/he/diving.json`. The file name is the page and `slug` is its URL.
2. Text is plain strings. Inline links are `{ "text": "...", "links": [{ "text": "<exact substring>", "href": "/path" }] }`, and the link text must appear word for word in `text`.
3. Images use `{ "src": "/assets/images/...", "alt": "...", "width": W, "height": H }`. Add new files under `public/assets/images/`.
4. Buttons and labels live in `content/he/ui.json`. Components contain no hard-coded user-facing strings.
5. Run `npm run check:i18n` to verify every locale has the same keys.

## Edit prices

Edit `data/prices.json`. Every price has an `id`, `activityId`, `labelKey` (a key in `ui.json → prices.*`), `amount`, `currency`, `audience`, `ageFrom`/`ageTo` and `unit`.
Pages reference prices by `id` (e.g. `experience.priceIds` in `content/he/diving.json`). Formatting uses `Intl.NumberFormat` (ILS).

## Switch the price source (`DATA_SOURCE`)

Components only ever call the repository (`getPriceRepository()` / `getPricesByIds()`). To use a real API:

1. Create `lib/prices/api-repository.ts` with a class implementing `PriceRepository` (`getPrices()`, `getPrice(id)`).
2. Register it in `lib/prices/index.ts` under a new value, e.g. `case 'api'`.
3. Set `DATA_SOURCE=api` in the environment.

Loading skeletons, error and empty states already exist. You can try them with `PRICE_SIMULATE=error` or `PRICE_SIMULATE=empty`.

## Add a language

Adding a language only means adding JSON files plus one line of config:

1. Add the code to `productionLocales` in `config/i18n.ts`, e.g. `['he', 'en']`. Direction comes from the code (he/ar = rtl, others = ltr).
2. Copy `content/he/` to `content/en/` and translate the values, keeping every key.
3. Run `npm run check:i18n`. It fails if any key exists in one locale but not another.
4. The language switcher appears automatically once there are two or more locales. Canonical, hreflang and the sitemap are generated from the locale list.
5. Remove the matching `/en/*` entries from `config/redirects.ts`.

The dummy `en` locale used in tests is generated into `tests/fixtures/content/en` (`npm run test:fixtures`, git-ignored) and is enabled only with `I18N_TEST_LOCALES=en`. It is never part of the production config.

## Conventions

- **RTL/LTR:** use CSS logical properties only (`margin-inline-start`, `inset-inline`, `text-align: start`). `npm run check:logical-css` enforces this. Directional icons (`arrow`, `chevron`) mirror automatically.
- **Accessibility (IS 5568 / WCAG 2.2 AA):** semantic landmarks, skip link, visible focus, at least 44 px targets, `aria-live` on async price states, an accessibility toolbar, and respect for `prefers-reduced-motion`.
- **Performance:** the hero still image is the LCP element (`next/image`, AVIF/WebP, explicit sizes). The hero video starts only after load and never with reduced motion, save-data or 2G. Fonts are self-hosted Hebrew and Latin subsets with `swap`.
- **No backend code:** there are no API routes, forms, payment code, proxying or iframes.

## Scripts

| Script | |
|---|---|
| `npm run typecheck` | Next typegen + `tsc` |
| `npm run check:i18n` | Locale key parity |
| `npm run check:logical-css` | No physical direction CSS |
| `npm run test:fixtures` | Generate the dummy `en` test locale |
| `npm run test:e2e` | Playwright suite (Phase 4) |
| `npm run audit:crawl` | Re-crawl the live site (Phase 1) |

See `TODO-integrations.md` for forms, shop, gallery, the price API and open content questions, and `CHANGELOG.md` for history.
