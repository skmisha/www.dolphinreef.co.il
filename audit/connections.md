# Connections audit (Phase 1)

Every backend-dependent or outbound feature on the live site (https://www.dolphinreef.co.il), and the exact URL it targets today.
Source: Playwright crawl of all 17 Hebrew routes, 4 Oct 2026 (`audit/raw/*.json`, `audit/raw/_expanded.json`).
The new UI must link to these targets unchanged. Nothing here gets rebuilt.

## 1. Booking (reefbooking.dolphinreef.co.il, ASP.NET WebForms, left untouched)

| Feature | Target URL | Where it appears (link text) | Opens |
|---|---|---|---|
| Intro dive booking | `https://reefbooking.dolphinreef.co.il/` | /diving: "להזמנה" button and image button; FAQ "כמה זה עולה ואיך מזמינים?" → "לחצו כאן לביצוע הזמנה" | same tab |
| Snorkeling booking | `https://reefbooking.dolphinreef.co.il/swimming.aspx` | /swimming: "להזמנה" button and image button; FAQ "איך מזמינים?" → "הזמנה מקוונת" | same tab |
| Stalbet pools, "ספיישל אחד על אחד" | `https://reefbooking.dolphinreef.co.il/pools.aspx` | /stalbet: "להזמנה" button; FAQ "מחירים וביצוע הזמנה מקוונת" → 'להזמנת "ספיישל אחד על אחד"' | same tab |
| Stalbet session (no treatment) | `https://reefbooking.dolphinreef.co.il/stalbet.aspx` | /stalbet FAQ → "להזמנת בילוי בסתלבט" | same tab |

- Payment happens inside the booking system. The site has no payment code.
- No deep-link or UTM parameters are used today.
- Site entry tickets: no online booking link exists. The site says "אין צורך ברכישה מראש אלא בעת ההגעה לאתר" (relating to special prices) and tickets are sold at the entrance.
- Phone booking centre: `tel:+97286300111` (08-6300111). Sun–Thu 08:30–16:00, Fri/Sat/holiday eves 08:30–14:00 (from the FAQ text).
- Change or cancel an online booking: `mailto:reservation@dolphinreef.co.il?subject=בקשה לשינוי או ביטול הזמנה` (/diving, /swimming FAQ).

## 2. Shop

- `/shop` is an **informational page about the on-site souvenir shop** (חנות המזכרות). **There is no online shop, catalog or external shop URL** on the live site.
- New UI: keep the informational page. There is nothing to link out to. Tracked in `/TODO-integrations.md`.

## 3. Gallery (external: Flickr)

| Target | Where (link text) |
|---|---|
| `https://www.flickr.com/photos/dolphinreef/albums/` | /events "לגלריה" |
| `https://www.flickr.com/photos/dolphinreef/albums/72157661347015180/` | /events "סתלבט דרומי" |
| `https://www.flickr.com/photos/dolphinreef/albums/72157659589781764/` | /events "music סתלבט" |
| `https://www.flickr.com/photos/dolphinreef/albums/72157659589714574/` | /events "יום כייף" |
| `https://www.flickr.com/photos/dolphinreef/albums/72157661227379689/` | /events "חוף והופעות" |
| `https://www.flickr.com/photos/dolphinreef/albums/72157661869533796/` | /events "סתלבט על המים" |
| `https://www.flickr.com/photos/dolphinreef/albums/72157661791473621/` | /events "בר וסביבו" |
| `https://www.flickr.com/photos/dolphinreef/albums/72157696009627144/` | /events "מפלס עליון" |
| `https://www.flickr.com/photos/dolphinreef/albums/72157661227238529/` | /events "המרפסת" |
| `https://www.flickr.com/photos/dolphinreef/albums/72157659589748044/` | /events "חתונה אחרת" |

Each album tile is an image link (cover image downloaded to `/public/assets/images`, see the manifest).

## 4. Forms and contact points

**The live site has no HTML forms** (no `<form>`/`<input>` found on any route apart from Wix internals). All contact goes through mailto, tel or WhatsApp:

| Purpose | Target | Page |
|---|---|---|
| General | `mailto:info@dolphinreef.co.il` | footer (all pages) |
| Events / productions inquiry | `mailto:hafakot@dolphinreef.co.il?subject=אנא חזרו בנושא המצויין בגוף המייל` | /events |
| Events phone | `tel:086300116`, `tel:086300129` | /events |
| Supportive-experience registration | `mailto:info@dolphinreef.co.il?subject=בקשת הרשמה ומידע נוסף לתוכנית חוויה תומכת` | /supportive-experience |
| Accessibility contacts | `mailto:ran@dolphinreef.co.il?subject=פנייה בנושא נגישות`, `mailto:ofra@dolphinreef.co.il?subject=פנייה בנושא נגישות` | /accessibility, /accessibility-statement |
| Booking change/cancel | `mailto:reservation@dolphinreef.co.il?subject=בקשה לשינוי או ביטול הזמנה` | /diving, /swimming |

## 5. WhatsApp, phone, email

- WhatsApp: `https://api.whatsapp.com/send/?phone=972526021017&text&type=phone_number&app_absent=0` (footer, all pages)
- Main phone: `tel:+97286300111`, shown as "טל: 08-6300111" (footer)
- Email: `mailto:info@dolphinreef.co.il` (footer)

## 6. Social

| Network | URL | Where |
|---|---|---|
| Instagram | `https://www.instagram.com/dolphin_reef_eilat/` | footer; nav item "עדכונים שוטפים"; /stalbetcoffe "באינסטגרם" |
| Instagram post | `https://www.instagram.com/p/DDcFDsntD-5/?igsh=Mnd4a3RxNTFkbDVm` | /experience-thereef "אינסטגרם" (opening-hours updates) |
| Facebook | `https://www.facebook.com/dolphinreefeilat` | footer; /experience-thereef; /stalbetcoffe |
| TikTok | `https://www.tiktok.com/@dolphin_reef_eilat` | footer |
| Flickr | `https://www.flickr.com/photos/dolphinreef/albums/` | /events (gallery) and JSON-LD `sameAs` |

## 7. PDFs (download to `/public/assets/pdf`, keep the same link text)

| File | Link text | Page |
|---|---|---|
| `62bd3d_48a9c770b7534481a7e0281efe10080d.pdf` | "בריאות תקינה" (health declaration, snorkeling) | /swimming |
| `62bd3d_5abe4de656634145922ab76b2f7ccf7d.pdf` | "ראו טופס כשירות רפואית ותיאום ציפיות," (medical form, diving) | /diving FAQ |
| `62bd3d_d6031990d17d42eb98ae5de91d0616a5.pdf` | "לחצו כאן" (beach-bar wine menu and prices) | /dining-at-thereef |
| `62bd3d_23822734e13c486782c626e4afec0322.pdf` | "לחצו כאן" (Stalbet food, drinks and cocktail menu) | /stalbetcoffe |
| `62bd3d_be66dc8948304002a8407159dbfab499.pdf` (on `usrfiles.com`) | "לחצו כאן" (Stalbet wine menu) | /stalbetcoffe |
| `62bd3d_189b134905274291ad4f8941b0d018b8.pdf` | "לקבלת הסבר מלא על התוכנית וההשתתפות בה." | /supportive-experience |

## 8. Embedded third-party content (to become links or facades, no iframes)

| Embed | URL | Page | New UI |
|---|---|---|---|
| YouTube video | `https://www.youtube.com/watch?v=FqJTx5KC5NQ` | /diving | poster + "watch on YouTube" link |
| YouTube video | `https://www.youtube.com/watch?v=nUpcRUJwa6s` | /swimming | same |
| YouTube video | `https://www.youtube.com/watch?v=rpQdIL44CEw` | /stalbet | same |
| Google Map (Wix widget) | location from JSON-LD: 29.5264, 34.9360, "Southern Beach, Eilat 8810101" | / (home) | static map image + "Open in Google Maps" link |
| Beach-bar menu (HTML on filesusr.com) | `https://www-dolphinreef-co-il.filesusr.com/html/166e60_a67a88e49014d4e3235557f26428e176.html` | /dining-at-thereef/menu-bar | rendered natively from `content/he/menu-bar.json` |
| Stalbet menu (HTML on filesusr.com) | `https://www-dolphinreef-co-il.filesusr.com/html/166e60_91cd1d485fd54ed9076ddd08554b5ee7.html` | /dining-at-thereef/menu-stalbet | rendered natively from `content/he/menu-stalbet.json` |

## 9. Analytics

- No Google Analytics, GTM, Google Ads or Meta Pixel IDs were found, before or after accepting the cookie banner (`audit/raw/_consent-probe.json`). The only post-consent request was Wix's own telemetry (`frog.wix.com`).
- Sentry (`browser.sentry-cdn.com`) is Wix platform error monitoring, not the site owner's.
- New UI: an analytics placeholder whose IDs come from env vars (`NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, all empty by default) and load only after consent. **The client needs to confirm whether any analytics account exists** (it may be configured in the Wix dashboard and inactive).

## 10. Accessibility tool

- **No third-party accessibility widget** (UserWay, Nagish, accessiBe, Enable and similar) is loaded. The site relies on Wix's built-in accessibility features. The statement says the Wix accessibility wizard was run.
- New UI: our own toolbar component (font size, contrast, link highlight, stop animations), with no vendor.

## 11. Other

- Cookie consent: Wix native banner ("אישור" / "דחיית הכל" plus a privacy-policy link). It will be replaced by our consent component.
- Language: the live site has an English Wix locale under `/en/...` (17 routes, listed in `audit/routes.csv`). It is out of scope for now. The redirect map in Phase 3 will cover it.
- Logo and site language switcher (Hebrew/US flags) sit in the header.
