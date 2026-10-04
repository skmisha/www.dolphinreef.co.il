# Visual critique: current build (before)

Screenshots: `polish/before/{route}-{390|1440}[-fold].jpg`, covering 17 routes × 2 widths, with first-viewport and full-page captures.
Ranked by visual impact (1 = most damaging). Structure, content and functionality are out of scope; only the visual layer is judged.

## 1. Every hero looks the same, and murky
- All 17 heroes share one template: the photo sits under a heavy teal-black gradient (`--overlay-hero` reaches 0.88 abyss at the bottom), with the title bottom-right. Coral reds, sand and sunset oranges all flatten to the same blue-grey, so the photos stop doing any work.
- The overlay covers the whole frame. Contrast is only needed under the text block, yet the top two-thirds of every photo are darkened too.
- At 1440 the text column is about 520 px wide pinned to the right, and the left 60 % of the hero is empty dark image. The headline (`--fs-h1` 52 px on inner pages) is small for a full-bleed 900 px-tall frame.
- Crops are never art-directed: `object-fit: cover` with a centred position everywhere. On mobile, subjects get cut (the snorkel and dive heroes lose the swimmers, and /stalbetcoffe crops to an empty corner).
- Breadcrumbs (15 px, foam on photo) and the eyebrow compete with the title for the same small area.

## 2. Type hierarchy is flat and heavy
- Frank Ruhl Libre is used at weight 700 for every heading. Bold serif Hebrew at 28–52 px reads dense and "newspaper", not calm or premium (the references use 300–400 display weights).
- The scale ratio is inconsistent: h2 40 → h3 26 → h4 20 → lead 20 → body 17. Lead and h4 are the same size, and card titles (22–26 px) shout as loudly as section titles on mobile.
- Body text in `--c-ink-2` (#3E5361) at 17/1.85 on sand is legible, but the long paragraphs on /our-vision, /privacypolicy and /supportive-experience read as grey walls. Paragraphs are capped at 72ch, at the top of the comfortable range.
- Headings use `text-wrap: balance`, but body copy can still end on single orphaned words. Hero leads often break with a one-word last line.
- Every article h2 gets the same gold-to-teal underline. Repeated 6–13 times per page, it turns into noise.

## 3. Colour: one note, and the accent is spent on too much
- Abyss, deep, reef, lagoon and tide make five blues with overlapping roles, which leaves no clear "primary". Sand plus shell gives two near-identical light surfaces, so cards barely separate from the page (shell on sand is 1.03:1, held up only by shadow).
- Sun-gold is used for booking CTAs (correct), and also for eyebrows, focus rings, the intro rule, the TOC active marker and the map highlight. The booking CTA no longer owns it.
- The footer, the "plan your visit" band, rail CTA cards and the hero plain variant are all near-black navy. Long pages end in a heavy dark slab.

## 4. Hero → content transition looks bolted on
- The SVG wave is a nice idea, but a 1 px sliver of the hero photo shows under it on every inner page (a visible dark line across the page at 1440; the mask is 48 px and positioned at -47 px).
- On experience pages the key-facts bar overlaps the wave with a hard white card. Two competing transitions stack on top of each other.

## 5. Cards try to say everything at once
- The experience card stacks a price badge on the image, a title, two chips, a three-line excerpt, a "details" link and a booking button. Seven elements in a 300 px column means none of them lead.
- Chips are pale (mist background, 15 px), so age and duration are low-contrast in hierarchy terms even where WCAG is met. The price badge is a floating white pill that covers part of the photo.
- Card images use mixed aspect ratios between pages (4:3 cards, 4:5 split figures, 1:1 albums, 3:1 menu strips). There's no consistent image language.
- The hover lift (translateY -4 px plus a heavier shadow) is applied to every card type, including non-interactive info cards, which suggests clickability that isn't there.

## 6. Icons are generic and inconsistent
- The UI icons are hand-drawn 24 px line glyphs at stroke 2 (clock, person, depth arrow, sun), sitting next to filled Simple Icons brand marks. The two families don't match in weight or style.
- Fact icons are 16 px in lagoon teal next to 15 px labels. They read as bullets, not as scannable markers.

## 7. Spacing rhythm is uneven
- Section padding is fluid 64–128 px on the home page, while content pages start 64 px after the wave and stack 64 px gaps between every block. There's no larger break between "chapters".
- The rail's cards (TOC, contact, CTA) use 24 px padding and 16 px gaps. They look cramped next to the generous article column.
- On mobile the facts strip, cards and callouts all sit at the same 16–24 px gaps, with no breathing room before section titles.

## 8. Buttons and links: too many variants
- There are five button looks (gold pill, ghost on dark, teal secondary, outline ghost on light with an inline colour override, book-bar pill) plus pill-shaped contact links in the footer. Pills everywhere feel playful rather than premium.
- Text links are underlined and teal-bold. They're correct, but at weight 600 they read heavier than the surrounding body.

## 9. Mobile header and navigation
- Two 44 px translucent circles (menu and accessibility) sit next to the logo. Over bright photos the circles disappear, and the accessibility glyph looks like a second menu.
- The drawer is a plain list in 22 px serif. It has no grouping (experiences / on site / info) and no contact block above the fold, and the drawer's booking button sits at the very bottom.
- The sticky book bar is good functionally, but visually it's a flat translucent strip with a small serif price. It doesn't feel finished, and it overlaps the footer's last links until you scroll past.

## 10. Motion is generic
- Every card and section uses the same scroll slide (translateY 32 px plus scale 0.985) with the same timing. Every card has the same hover lift. Nothing is orchestrated: no stagger, no image-specific treatment, no considered press state.

## Smaller items
- The desktop nav has 6 long Hebrew labels at 14–15 px. At 1024–1279 px they crowd the logo.
- The logo is a 300 × 258 PNG rendered at 44–64 px, so it looks soft next to sharp type.
- The menu pages' sticky category pills are white-on-sand with a 1 px border, so the active category isn't indicated.
- The map legend thumbnails crop the baked-in text of the live popup images, so stray letters appear at the edges.
