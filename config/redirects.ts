/**
 * 301 map from old Wix URLs. Hebrew URLs are kept 1:1 (no redirect needed).
 * The Wix English locale (/en/...) is not built yet, so it points to the Hebrew page;
 * remove the matching entries when the "en" locale goes live.
 */
export const redirects: { source: string; destination: string; statusCode: 301 }[] = [
  ['/en', '/'],
  ['/en/experience-thereef', '/experience-thereef'],
  ['/en/our-vision', '/our-vision'],
  ['/en/diving', '/diving'],
  ['/en/swimming', '/swimming'],
  ['/en/stalbet', '/stalbet'],
  ['/en/stalbetcoffe', '/stalbetcoffe'],
  ['/en/dining-at-thereef', '/dining-at-thereef'],
  ['/en/dining-at-thereef/menu-bar', '/dining-at-thereef/menu-bar'],
  ['/en/dining-at-thereef/stalbet-bar-menu', '/dining-at-thereef/menu-stalbet'],
  ['/en/events', '/events'],
  ['/en/shop', '/shop'],
  ['/en/supportive-experience', '/supportive-experience'],
  ['/en/accessibility', '/accessibility'],
  ['/en/accessibility-statement', '/accessibility-statement'],
  ['/en/map', '/map'],
  ['/en/privacypolicy', '/privacypolicy'],
  // Wix system paths and file links
  ['/home', '/'],
  ['/_files/ugd/:file', '/assets/pdf/:file'],
].map(([source, destination]) => ({ source, destination, statusCode: 301 as const }));
