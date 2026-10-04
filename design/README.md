# Phase 2: Design (awaiting approval)

**Concept: "Calm depth".** Warm sand and shell surfaces sit above, abyss blues sit below, and the photography is full-bleed. Sun-gold is reserved for one thing only: **booking**. The layout uses generous whitespace and a serif display face for a premium, unhurried feel. Every experience card shows **price · age · duration** before you click.

| Deliverable | File |
|---|---|
| Design tokens (color, type, spacing, radius, shadow, motion, layers, a11y-toolbar overrides) | `design/tokens.css` |
| Component styles used by the mockups | `design/mockups/mockup.css` |
| Home page mockup | `design/mockups/home.html` → `design/screens/home-390*.png`, `home-1440*.png` |
| Experience page mockup (/diving) | `design/mockups/diving.html` → `design/screens/diving-390*.png`, `diving-1440*.png` |
| Render and a11y scripts | `scripts/design/render.mjs`, `scripts/design/axe.mjs` |

Each page has two screenshots: `*-viewport.png` shows the first screen, including the sticky mobile book bar. `*.png` is the full page; fixed elements appear at the top of it, as browsers capture them.

All copy in the mockups is **verbatim** from `content/he/*.json`, and all prices come from `data/prices.json`. New interface labels (for example "החל מ-", "לפרטים", "שאלות נפוצות", "מתכננים ביקור", "ניווט לריף") are marked `data-ui` and will live in `content/he/ui.json`. They are UI chrome, not facts.

---

## 1. Color

| Token | Hex | Role |
|---|---|---|
| `abyss` | `#04212F` | footer, overlays, CTA text |
| `deep` | `#0A3A52` | dark sections, chip text |
| `reef` | `#0F5E73` | links, secondary buttons, a11y button |
| `lagoon` | `#0B6E79` | icons, callout accent |
| `tide` | `#2A8C96` | decorative only (fails AA for text on light) |
| `foam` | `#DDEFEE` | muted text on dark |
| `mist` | `#EEF6F5` | tinted surfaces, chips |
| `sand` | `#F7F2EA` | page background |
| `shell` | `#FFFDF9` | cards |
| `ink` / `ink-2` / `ink-3` | `#0C1E2A` / `#3E5361` / `#566A77` | text: primary / secondary / meta |
| `sun` / `sun-deep` | `#F2BE5C` / `#E2A43B` | **booking CTA only**; focus ring |
| `coral` | `#A8452E` | errors |
| `line` / `line-strong` | `#D5DEDD` / `#6F878E` | hairlines (decorative) / component borders |

### WCAG 2.2 AA contrast (computed)

| Use | Foreground | Background | Ratio | Level |
|---|---|---|---|---|
| Body text | ink | sand | 15.26:1 | AAA |
| Body text on cards | ink | shell | 16.74:1 | AAA |
| Secondary text | ink-2 | sand | 7.21:1 | AAA |
| Meta text | ink-3 | sand | 5.06:1 | AA |
| Meta text on tint | ink-3 | mist | 5.14:1 | AA |
| Links | reef | sand | 6.57:1 | AA |
| Chip text | deep | mist | 11.00:1 | AAA |
| Booking CTA | abyss | sun | 9.73:1 | AAA |
| Booking CTA hover | abyss | sun-deep | 7.60:1 | AAA |
| Secondary button / a11y button | white | reef | 7.32:1 | AAA |
| Text on dark section | white | deep | 12.07:1 | AAA |
| Muted text on dark | foam | deep | 10.15:1 | AAA |
| Eyebrow / focus ring on dark | sun | abyss | 9.73:1 | AAA |
| Error text | coral | shell | 5.81:1 | AA |
| Component borders (1.4.11) | line-strong | shell | 3.74:1 | AA (non-text) |
| Hero text over photo (worst case: white pixel under ≥ 0.66 abyss overlay) | white | overlay | ≥ 5.2:1 | AA |

- Focus: a 2 px sun outline plus a 4 px abyss halo, visible on both light and dark (2.4.7, 2.4.13).
- `axe-core` (wcag2a/aa, 21a/aa, 22aa) reports **0 violations** on both mockups at 390 and 1440 px.
- The high-contrast toolbar mode switches to pure black on white (tokens under `:root.a11y-contrast`).

## 2. Typography: Hebrew pairing

| Role | Family | Weights | Fallbacks |
|---|---|---|---|
| Display / headings | **Frank Ruhl Libre** (Hebrew serif, Google Fonts, OFL) | 500, 700 | `"David Libre", "David", "Times New Roman", serif` |
| Body / UI | **Assistant** (Hebrew sans, Google Fonts, OFL) | 400, 600, 700 | `"Heebo", "Arial Hebrew", "Segoe UI", Arial, sans-serif` |

- Why: Frank Ruhl Libre gives the calm, editorial, premium tone. Assistant is highly legible at small sizes on phones and has tabular-looking numerals for prices and hours. Both include Latin, so a future `en` locale needs no new fonts.
- Phase 3: loaded through `next/font/google` (self-hosted at build time, `display: swap`, subsets `hebrew` + `latin`, only the weights above) with a size-adjusted fallback to avoid CLS.
- Fluid scale (360 → 1440 px): display 40→72, h1 34→52, h2 28→40, h3 22→26, h4 20, lead 18→20, **body 17**, small 15, micro 13 (meta only). Line height is 1.7 for body (Hebrew without nikud reads better with more leading) and 1.2 for headings. Measure is capped at 68ch.
- No letter-spacing and no uppercase styling, since neither suits Hebrew.

## 3. Spacing, radius, shadow, motion

- **Spacing:** 4 px base: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128. Gutter is fluid 16→40 px and section padding 64→128 px. Container 1216 px; reading column 736 px.
- **Tap target:** at least 44×44 px (buttons, icon buttons, footer links, FAQ rows at 56 px).
- **Radius:** 4 / 8 / 16 / 24 / 32 / pill. Cards use 24 and buttons are pill-shaped.
- **Shadows:** three water-tinted soft levels plus a sticky-bar shadow.
- **Motion:** 100 / 160 / 260 / 420 / 900 ms. The default easing is `tide` (cubic-bezier .22,.7,.2,1). Motion is subtle: a 4 px card lift and a 1.04 image drift. Under `prefers-reduced-motion` and the toolbar's "stop animations", all durations become 0 and the hero video never autoplays.

## 4. Component inventory

Layout and navigation
1. **SkipLink**: first focusable element, jumps to `#main`.
2. **SiteHeader**: transparent over the hero, then solid on scroll. Logo, primary nav (desktop ≥ 1024), "להזמנה" CTA, menu toggle (mobile).
3. **MobileNav drawer**: full-height panel with focus trap, Esc to close. Items come from `getNav()` and mirror the live menu (including the sub-item "תפריט בר חוף").
4. **LanguageSwitcher**: renders nothing while `locales.length === 1`.
5. **Breadcrumbs**: on inner pages; also emitted as BreadcrumbList.
6. **SiteFooter**: contact (tel/mailto/WhatsApp), social, three link columns, legal links.
7. **StickyBookBar** (mobile and tablet < 1024): context label plus "from" price plus booking CTA, with safe-area padding. Hidden on desktop, where the header CTA is always visible.

Heroes and media
8. **Hero (home)**: full-bleed photo as the LCP element; optional lazy video (`preload="none"`, poster, starts after load, never with reduced motion); eyebrow, H1, lead, two CTAs.
9. **PageHero** (inner pages): shorter, with breadcrumb.
10. **ResponsiveImage**: `next/image` wrapper with required `alt`, explicit dimensions, AVIF/WebP.
11. **VideoFacade**: poster plus play button linking out to YouTube. No iframe.
12. **MapLink / static map**: links to Google Maps. No embed.
13. **InteractiveSiteMap** (/map): numbered hotspots as real `<button>`s opening an accessible dialog with the area image. The live popups are images with baked-in text, so text alternatives are needed (see open questions).

Content
14. **SectionHeading** (h2 plus optional lead).
15. **Prose** (rich paragraphs with inline links from JSON).
16. **SplitFeature** (image and text).
17. **Callout / InfoCard** (good-to-know, warning variant).
18. **FAQAccordion**: native `<details>`/`<summary>`; also emitted as FAQPage JSON-LD.
19. **MenuSection / MenuItemRow** (menu-bar, menu-stalbet: name, description, price, notes, tea list).
20. **GalleryLinkGrid** (/events): album tiles linking to Flickr.
21. **ContactBlock**: phone, email and WhatsApp in the current wording (stands in for forms).
22. **PdfLink**: the same link text as live, plus a "(PDF)" hint.

Commerce-like (data via `PriceRepository`)
23. **ExperienceCard**: image, "from" price badge, age chip, duration chip, excerpt, details link plus booking CTA. Whole card clickable; CTA stays a separate target.
24. **CompactCard**: image-overlay card for dining and events.
25. **FactsStrip** (home): opening days, hours and entry prices.
26. **KeyFactsBar** (experience page): age, duration, depth or extra, hours.
27. **PricePanel**: rows from the repository, formatted with `Intl.NumberFormat('he-IL', {style:'currency', currency:'ILS'})`. States:
    - **loading**: skeleton rows (shimmer disabled under reduced motion), `aria-busy="true"`
    - **error**: "המחירים אינם זמינים כרגע" plus phone link, in an `aria-live="polite"` region
    - **empty**: phone and booking links only
28. **BookingButton**: href from `/config/links.ts` via `bookingUrl(activity, {utm})`; same tab by default.

Global utilities
29. **AccessibilityToolbar**: floating button and panel with font size (100/115/130 %), high contrast, link highlight and stop animations; saved in `localStorage` and applied as `<html>` classes.
30. **CookieConsent**: accept or reject all, link to /privacypolicy. Gates analytics.
31. **AnalyticsPlaceholder**: GA, GTM and Meta IDs from env; renders nothing without consent or IDs.
32. **Icon**: inline SVG; directional icons (arrows, chevrons) mirror via `--dir-flip` under RTL.
33. **Skeleton / ErrorState / EmptyState** primitives.

## 5. Responsive behaviour

| Width | Layout |
|---|---|
| 360–767 | Single column. Cards stacked. Sticky book bar. Burger menu. Facts strip stacked. Price panel below the content. |
| 768–1023 | Two-column cards. Facts strip in three columns. Sticky bar still shown. |
| 1024–1199 | Full nav plus header CTA. Experience page in two columns (content and sticky price panel). |
| ≥ 1200 | Four-up experience cards on home, three-up related cards. |

At 200 % zoom the layout falls to the mobile breakpoints, so nothing overflows. Mockups were checked for horizontal overflow at 390 and 1440 px: 0 px.

## 6. Content flags (live-site text, not changed; need client confirmation)

- `/experience-thereef` hours read "09:00:16:30" and "בימים שיש ושבת". The mockup shows them structurely as "09:00-16:30" and "שישי ושבת". Please confirm, or I keep the raw text.
- `/experience-thereef` also lists September 2026 holiday hours, which are already in the past. These need updating by the client.
- Child age upper bounds and stalbet upgrade prices aren't published (see `data/prices.json → ambiguities`).
- Logo is only available as a 300×258 PNG. An SVG is needed for sharp rendering.
- 45 images are flagged low-resolution in `public/assets/manifest.json`.
- The beach-bar menu embed uses Unsplash stock photos (listed in the manifest as third-party).
- Map popups are images with baked-in Hebrew/English/French/Russian text. Alt text needs to be transcribed and approved.

## 7. Decisions to approve

1. Overall direction, palette and the "sun-gold = booking only" rule.
2. Type pairing: Frank Ruhl Libre + Assistant.
3. Home order: hero → facts strip (hours and entry) → experience cards → about → dining and events → plan your visit → footer.
4. Experience template: key-facts bar, intro, video facade, good-to-know, FAQ, sticky price panel (desktop) or sticky book bar (mobile), related experiences.
5. Reusing the live SEO meta description as the home hero lead.
