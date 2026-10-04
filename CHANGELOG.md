# Changelog

## Phase 3: Build (2026-10-04)
- Next.js 16 (App Router) with TypeScript, Tailwind CSS 4 and next-intl 4. Hebrew is the default locale with no URL prefix, so Hebrew URLs match the live site.
- All 17 live routes are built from `/content/he/*.json` through typed loaders (`lib/content`).
- Templates: home, experience (diving, snorkeling, stalbet), content, legal, events, interactive map and native menus. The menus replace the live site's iframes.
- `PriceRepository` with `JsonPriceRepository` (simulated 150–400 ms latency). Price slots stream into Suspense skeletons and have error and empty states, announced via `aria-live`. Prices are formatted with `Intl.NumberFormat` in ILS.
- All outbound links live in `config/links.ts`: booking (same tab by default), WhatsApp, tel, mailto, social, Flickr, YouTube and Google Maps.
- Accessibility toolbar (font size, contrast, link highlight, stop animations), skip link, focus trap in the mobile drawer, sticky mobile booking bar.
- Cookie consent with analytics placeholders (GA, GTM, Meta) gated on consent and env IDs.
- SEO: per-page metadata from JSON, canonical and hreflang from the locale list, `sitemap.xml`, `robots.txt` (noindex unless `ALLOW_INDEXING=true`), 301 map for the Wix `/en/*` pages, JSON-LD (TouristAttraction/LocalBusiness with geo, WebSite, TouristTrip with Offers from the repository, FAQPage, BreadcrumbList).
- Self-hosted Hebrew and Latin woff2 subsets with `font-display: swap` and metric-adjusted fallbacks.
- Tooling: `check:i18n` (key parity across locales), `check:logical-css` (no physical direction properties), `test:fixtures` (dummy LTR `en` locale for tests only).

## Phase 2: Design (2026-10-04)
- Design tokens, Hebrew type pairing (Frank Ruhl Libre + Assistant), component inventory, and home and experience mockups at 390 and 1440 px (`design/`).

## Phase 1: Content and route extraction (2026-10-04)
- Crawled 17 Hebrew routes (`audit/routes.csv`), extracted the content word for word, downloaded media with a manifest, extracted prices (`data/prices.json`) and wrote the connections audit (`audit/connections.md`).
