# Reference analysis (observations only, nothing copied)

Captured with Playwright on 2026-10-04 at 1440 and 390 px: `polish/references/*.jpg`, with computed metrics in `polish/references/metrics.json`.

| Reference | Status |
|---|---|
| aman.com | ✓ Captured. The hero video failed to play in headless Chromium ("Player error"); the content sections captured fine. |
| fourseasons.com/maldives | ✗ **403 Access Denied** for automated browsers. Not worked around. |
| soneva.com / Soneva Fushi (Maldives) | ✓ Used as the "similar luxury resort" substitute (your brief allows one). |
| sixsenses.com / Laamu | ✗ 403. Dropped. |
| montereybayaquarium.org | ✓ Captured. |

## 1. Aman: restraint
- **Type:** a serif display/text face (Lyon) at weight **400**, never bold. h2 is 31 px desktop / 24 px mobile, with line-height ≈ **1.45** and slightly positive tracking (+0.5 px). Eyebrows are a small sans at 10 px, **uppercase with +2 px tracking**, in the same ink colour. Body copy is a small sans (14/20.3 ≈ 1.45).
- **Line length:** body paragraphs measure 440 px ≈ **55–63 characters**; on mobile ≈ 40–49.
- **Colour:** effectively one warm off-white ground (`#F3EEE7`) plus one charcoal ink (`#313131`). No brand colour in the content area; images carry all the colour. The CTA ("Reserve") is a charcoal block with off-white text.
- **Radius and shadow:** **0 px** radius on images and buttons; no shadows at all. Separation comes from whitespace and alignment only.
- **Images:** large, uncropped-feeling photos at consistent proportions (≈ 1.6:1 landscape, 0.76:1 portrait, 1:1 squares) in an asymmetric grid. Captions sit under images, never on them.
- **Spacing:** very large vertical gaps between groups (≈ 100–140 px desktop), tight internal spacing within a card (caption 8–12 px under the image).
- **Motion:** colour/border transitions of **0.4 s**, opacity fades of 0.5 s ease-in-out, background 0.6 s. Slow and soft; no lifts or bounces.
- **Tone:** the calm comes from *what isn't there*: no badges, no chips, no icons, links as small underlined "Discover more".

## 2. Soneva Fushi (luxury resort, full-bleed hero)
- **Hero:** a full-bleed photo/video at ≈ 100 % viewport width and ≈ 82 % height. On mobile the media becomes a tall portrait (390 × 747) with **art-directed object-position** (computed `-495px 0` / `-26px 0` on different slides), so the subject is recropped per breakpoint, not just centre-scaled. The overlay is minimal: text sits in a small area with its own local gradient, not a full-frame darkening.
- **Type:** a light display serif at **weight 300** with **negative tracking** (-1.2 px at 40 px, ≈ -3 %) and a tight line-height of **1.1**. The text sans is small (14 px) with slight negative tracking. Display-to-body ratio ≈ 2.5–3 ×.
- **Colour:** a warm sand ground (`#F4F1E9`), near-black brown ink (`#19100D`), and a single deep terracotta accent (`#6D2E1D`) reserved for "Book" and the primary CTA. Secondary text is the ink at 50 % opacity.
- **Radius:** **2 px** on buttons, 0 on images: crisp, architectural.
- **Spacing:** sections pad **80–120 px** top and 80 px bottom on desktop; on mobile 80/24–40. The intro statement block is a single centred paragraph of ≈ 80 characters at display size between two big image blocks: an editorial "breath".
- **Cards:** villa cards are just image (≈ 0.78:1 portrait) plus a small two-tag line plus a title plus a one-line description. Tags are plain text separated by "•", not pills.
- **Booking:** the "Book" CTA is always in the header (terracotta block), and a date/guests booking strip floats at the bottom of the hero.
- **Motion:** 0.2–0.3 s ease-in colour/opacity transitions; image carousels slide.

## 3. Monterey Bay Aquarium: approachable ocean
- **Type:** one friendly sans family (Peak, plus a rounded variant) for everything. h2 is 36 px desktop / 28 px mobile at **weight 600, line-height 1.0, slight negative tracking**. h3 is 18/700. Body is 16/24 (1.5) at **weight 600** on dark backgrounds, which improves legibility over imagery. The nav is 13 px uppercase with +0.65 px tracking.
- **Practical info first:** "Open today 10 a.m.–5 p.m." sits in the hero's top corner, "Buy tickets" sits in the hero, and the "Plan your visit" panel opens with address, hours and practical links. Prices and tickets are one click away and visually explicit.
- **Colour:** a **dark, image-led** canvas (black or ocean-image backgrounds) with white text. The primary action is a saturated ocean blue (`#00629B`) with white text, and a second accent (coral/orange) is used for section titles on dark. Each section takes its colour from its photograph.
- **Radius:** **0 px** buttons and images; outline buttons on dark use a 1 px white border.
- **Layout:** large split panels, with a full-bleed photo on one side and a dark text panel plus a 2-up carousel of small cards on the other. Card thumbnails are 16:9 at 256 × 144, with a small coloured eyebrow, a bold title and a 3–4 line description.
- **Motion:** a consistent **0.3 s cubic-bezier(0.4, 0, 0.2, 1)** on colour, background, border and text-decoration; carousel arrows; gentle and uniform.
- **Accessibility posture:** high contrast (white on near-black), generous 16 px body, explicit labels; the tone is welcoming and direct, not exclusive.

## Patterns worth adopting (principles, not layouts)

| Topic | Shared observation | Implication for Dolphin Reef |
|---|---|---|
| Display weight | 300–400 serif (luxury) / 600 sans (aquarium); nobody uses bold serif display | Lighter display weight with larger size; let size carry hierarchy |
| Tracking | Negative on large display (-1 to -3 %), positive on small caps eyebrows | Hebrew has no case: skip letter-spaced caps; use size, colour and weight for eyebrows instead |
| Line-height | Display 1.0–1.1; body 1.45–1.5 (Latin) | Hebrew needs more: display ≈ 1.15, body ≈ 1.65–1.7 |
| Line length | 45–63 characters | Cap Hebrew body at about 60–65ch |
| Colour roles | 1 ground + 1 ink + **1** accent for the primary CTA | Collapse 5 blues to 1 primary; keep sun-gold for booking only |
| Radius | 0–2 px | Lower radii (4–8 px images, 6–8 px buttons) for a more architectural feel; keep a slight softness for the approachable aquarium side |
| Shadows | None / minimal | Replace shadow-lifted cards with flat cards plus hairlines and whitespace |
| Images | Consistent ratio families; captions below; art-directed mobile crops | 3 ratio families; per-image focal points; text off the photo except in heroes |
| Overlay | Local gradient behind text only | A bottom/start-anchored gradient plus a text scrim instead of a full-frame darkening |
| Practical info | Aquarium surfaces hours and tickets in the hero | Keep the facts strip, make it lighter; show hours in the hero area |
| Motion | 0.2–0.6 s, ease-out / standard curves, opacity and colour only | Slower, softer: 240–600 ms, fades plus small translate, a gentle stagger; no hover lift on non-interactive cards |
| Spacing | 80–140 px between sections, tight inside groups | 8 pt grid; larger section rhythm (96–160 px), tighter internal groups |
