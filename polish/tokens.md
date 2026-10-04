# Polish Phase 2: proposed design tokens (awaiting approval)

- Tokens: `polish/tokens.proposed.css` (not applied to the app yet)
- Specimen: `polish/specimen/specimen.html` → `specimen-390[-fold].png`, `specimen-1440[-fold].png`
- Checks: axe WCAG 2.2 AA = 0 violations at both widths; no horizontal overflow; hero text contrast measured against the real photo (`scripts/polish/hero-contrast.mjs`): **≥ 5.6:1 at 390 / 768 / 1440** for eyebrow, title, lead and hours.

## What changes vs today

| Area | Today | Proposed | Why (critique # / reference) |
|---|---|---|---|
| Display font | Frank Ruhl Libre **700** | **Bellefair 400** (Hebrew serif, high contrast, 6 KB Hebrew subset) | #2: bold serif reads "newspaper"; Aman and Soneva use 300–400 display |
| Text font | Assistant | **Heebo** 300–700 variable (11 KB Hebrew) | Larger x-height, better small-size legibility; friendlier (aquarium) |
| Scale | Ad hoc (lead = h4) | Modular **1.25 → 1.333**, fluid 390 → 1440: 14/17/19/23/30/36/44 → 15/18/22/30/42/56/76 | #2 |
| Line height | Body 1.85, headings 1.2 | Body **1.7**, display **1.12**, headings 1.25 | Hebrew needs more than Latin 1.45, less than today's 1.85 |
| Measure | 72ch | **62ch** body, 48ch lead | 45–75 rule; references 45–63 |
| Colour | 5 blues + 2 sands + gold on 6 roles | **1 primary** (ocean `#0E4C5E`) + **1 accent** (sun `#F0B85A`, **booking only**) + ink ×3, sand/paper, semantic | #3; references use 1 ground + 1 ink + 1 accent |
| Eyebrow on photo | Sun-gold | Foam white with a hairline | Gold measured 2.0:1 on coral; keeps gold for booking |
| Hero overlay | Full-frame gradient to 0.88 | **Local scrim** anchored at the text corner (desktop), vertical on phones/tablets; top scrim for the header | #1; Soneva-style, so photos keep their colour |
| Hero crop | Centre for all | Per-image `--focal-desktop` / `--focal-mobile` focal points | #1 |
| Hero practical info | Facts strip below the hero | Hours chip in the hero corner (≥ 768); facts strip stays below | Aquarium "Open today" |
| Spacing | Mixed rem steps | **8 pt grid**; section 96 → 160, stack 40 → 64, gutter 20 → 48 | #7 |
| Radius | 4–32 + pills everywhere | **4 / 8 / 12 / 20**, round only for icon buttons | #8; architectural like the references, still soft |
| Elevation | Shadow on every card | **Flat cards** (hairline + whitespace); shadow only on sticky/floating | #5; Aman/Soneva have no shadows |
| Cards | Badge on photo + chips + 2 actions | 4:5 photo, title, **facts row (price / age / duration with icons)**, 2-line excerpt, link + Book | #5; aquarium-style scannable facts |
| Icons | Hand-drawn stroke 2 + filled brands | Single **1.75-stroke 24-grid** set (Lucide-style geometry); brand marks unchanged | #6 |
| Buttons | 5 variants, pills | **4 roles**: Book (sun) / primary (ocean) / outline / on-dark; 8 px radius; 48 px min, 56 large | #8 |
| Focus | 2 px sun + 4 px abyss | 2 px paper + 2 px ink + 3 px sun halo | Visible on photo, light and dark |
| Motion | Same slide + lift everywhere | press 120 / hover 200 / reveal 560 / image 900 ms, `cubic-bezier(.2,0,0,1)`; translate-only reveal with 70 ms stagger; image zoom instead of card lift; all 0 under reduced motion | #10; references use 0.2–0.6 s soft curves |
| Sticky mobile CTA | Translucent strip, serif price | Paper sheet, 20 px top radius, soft shadow, bold text-font price | #9 |

## Decisions for you

1. **Display font:** Bellefair (proposed, shown) or Option B, Frank Ruhl Libre 400 (shown at the bottom of the specimen). Bellefair is more distinctive and lighter; FRL is more conservative.
2. **Mobile hero composition:** the specimen keeps text over the photo with a vertical scrim, so on phones the diver sits behind the text. The alternative is a **stacked** mobile hero (photo 60 % on top, text on ocean-deep below), which shows the subject fully but makes the hero less immersive. I recommend the overlay plus per-image `--focal-mobile`, choosing focal points so each subject sits above the text.
3. **Header "Book" button on phones:** shown in the specimen. Since the sticky bar is always present on phones, I propose **hiding the header Book button below 1024 px**, which leaves only the menu and accessibility buttons and makes the header calmer.

## Flags (risk to performance or accessibility), not applied silently

- **Fade-in reveals** (Aman/Soneva-style opacity) make Lighthouse and axe sample semi-transparent text, so I keep **translate-only** reveals.
- **Parallax** on hero photos: skipped. Scroll-linked transforms on a 2400 px image cost paint on mid-range phones (INP/CLS risk).
- **Bellefair** has one weight. It's used only at 23 px and above (h3 and up); smaller headings use Heebo 600.
- **Hero video:** stays desktop-only on fast connections, as today. The Soneva-style mobile video hero would cost 2–6 MB on 4G, which is an LCP risk.
