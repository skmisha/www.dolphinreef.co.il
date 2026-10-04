# Visual polish: report

Phases: 1 critique (`critique.md`, `reference-analysis.md`) → 2 tokens (`tokens.md`, specimen; approved with recommendations) → 3 apply (commit `61bb75a`) → 4 QA (this file; **partially complete**, see "Not done").

## What changed (visual layer only)

| Area | Before | After |
|---|---|---|
| Fonts | Frank Ruhl Libre 700 + Assistant (26 KB Hebrew) | **Bellefair 400** display + **Heebo** variable text (17 KB Hebrew) |
| Type | Ad-hoc sizes, bold serif everywhere, body 1.85 | Modular 1.25 → 1.333 fluid scale; display 400; body 1.7; 62ch measure; `text-wrap: pretty` |
| Colour | 5 blues, gold on 6 roles | 1 primary (ocean) + sun-gold **for booking only**; ink ×3; sand/paper |
| Hero | Full-frame dark overlay, centre crops | Local scrims (≥ 5.6:1 measured over real photos at 390/768/1440); per-image focal points (`config/art-direction.ts`); hours chip on home; straight edge (fixes 1 px photo sliver under the old wave) |
| Cards | Price badge on photo, pale chips, lift on hover | 4:5 photos, title, **price · age · duration** facts row with one icon set, 2-line excerpt; image zoom on hover, no lift |
| Surfaces | Shadows on every card | Flat cards with hairlines; shadow only on floating elements |
| Buttons | 5 variants, pills | 4 roles, 8 px radius, 48/56 px; unified focus ring (paper + ink + sun halo) |
| Icons | Hand-drawn stroke 2 | One 1.75-stroke 24-grid set; brand marks unchanged |
| Motion | Same slide and lift everywhere | press 120 / hover 200 / reveal 560 / image 900 ms; translate-only reveals with stagger; reduced motion honoured |
| Mobile | Crowded header, flat translucent book bar | Header Book hidden < 1024 (the sticky bar covers it); book bar is a paper sheet with 20 px top radius |

## Nothing functional changed (verified)

- `polish/functional-before.json` vs `polish/functional-after.json`: **identical** for all 17 routes. That covers HTTP status, title, H1, all 526 link targets (including new-tab behaviour), all 156 rendered prices, and SHA-256 of every `content/he/*.json`, `data/prices.json` and `config/links.ts`.
- Playwright suite (iPhone / Pixel / iPad / desktop, 5 server variants): **228 passed, 0 failed** (72 intentional skips). It covers navigation, the sticky CTA, every outbound link, price loading/error/empty states, RTL/LTR with the test-only `en` locale, content parity with the live site, and **axe WCAG 2.2 AA on every route**.
- `check:i18n` and `check:logical-css` both pass.

## Lighthouse mobile (simulated slow 4G, mid-range phone)

`polish/lighthouse-before.json` (pre-polish) vs `polish/lighthouse-after.json`, best of 2 per route:

| Metric | Before (median) | After (median) | After (worst route) |
|---|---|---|---|
| Performance | 96 | **97** | 94 |
| Accessibility | 100 (96–98 on 4 routes) | **100 on every route** | 100 |
| LCP | 2566 ms | **2417 ms** | see below |
| CLS | 0.017 (max 0.082) | **0** (max 0.029) | 0.029 |
| TBT (lab proxy for INP) | 48 ms | 48 ms | 53 ms |

**LCP routes still above 2.5 s** (median of 5 runs, `polish/lighthouse-after-median5.json`):

| Route | LCP |
|---|---|
| /dining-at-thereef/menu-bar | 3029 ms |
| /map | 2759 ms |
| /swimming | 2678 ms |
| /accessibility-statement | 2562 ms |

- /diving (2358 ms) and /stalbetcoffe (2437 ms) are under target on the median.
- Before the polish, 9 routes were over 2.5 s; now 4 are, so the total is not a regression.
- /menu-bar and /map are individually slower than their earlier best-of-2 values.
- The LCP elements are hero/map images of only 7–24 KB (AVIF). The simulated critical path is dominated by the shared JS/CSS, not by images.

## Not done (stopped on request)

- **After screenshots** of every route (`/polish/after`) and **before/after side-by-sides** have not been captured yet. The tooling exists: `node scripts/polish/shoot.mjs <base> polish/after`, and `scripts/qa/visual.mjs` composes side-by-sides.
- **INP** was not measured as a field metric; TBT ≤ 53 ms is reported as the lab proxy.
- The 4 LCP outliers above are not yet investigated further. A likely next step is trimming client JS on those templates (header/drawer/toolbar hydration) or preloading the hero image on /map.

## Remaining weaknesses

- The map popups are still the live site's images with baked-in text in 4 languages, so they look dated next to the new UI. They need proper legend artwork from the client.
- The logo is a 300 × 258 PNG and renders soft. An SVG is needed.
- Some hero photos are low resolution (flagged in the asset manifest) and show softness on large screens.
- The home "plan your visit" band and the footer are both dark ocean, so long pages still end on a heavy block. A lighter footer variant would be worth exploring.
