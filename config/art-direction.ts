/**
 * Art direction for full-bleed images (visual layer only; content JSON is untouched).
 * desktop/mobile are CSS object-position values. On phones the whole image height is shown,
 * so the horizontal value keeps the subject in frame; on desktop the vertical value matters.
 */
type Focal = { desktop: string; mobile: string };

const focal: Record<string, Focal> = {
  '/assets/images/62bd3d_79e6f92bc1584eafaa455a35c2d963f4.jpg': { desktop: '50% 62%', mobile: '60% 50%' }, // home: diver under soft coral
  '/assets/images/166e60_ded6522a181d4d33a98f94c4ecfc583df000.jpg': { desktop: '50% 35%', mobile: '68% 50%' }, // diving: pair of divers
  '/assets/images/166e60_b701de9415ca47d7ab15a93fe992e264f000.jpg': { desktop: '50% 45%', mobile: '52% 50%' }, // swimming: snorkelers
  '/assets/images/166e60_0bc21fdafe1b42669e2329ef0a293f01f000.jpg': { desktop: '50% 30%', mobile: '62% 50%' }, // stalbet: floating in the pool
  '/assets/images/166e60_2ddbbf30c96d45bf8515cffd75990708f000.jpg': { desktop: '50% 45%', mobile: '68% 50%' }, // experience: aerial pier
  '/assets/images/166e60_135219447c154b2994104c71d37a6519.png': { desktop: '50% 40%', mobile: '45% 50%' }, // legal: diver in reef
  '/assets/images/166e60_6fecf2aa885b4339b80ec9ce26c44024.jpg': { desktop: '50% 60%', mobile: '40% 50%' }, // accessibility: beach pier at sunset
  '/assets/images/62bd3d_b7f66b43dc9741c296c9beb037f3c56df002.jpg': { desktop: '50% 50%', mobile: '70% 50%' }, // dining: beach bar deck
  '/assets/images/166e60_57df473dadab4a6cadcab16a257c42d7.jpg': { desktop: '50% 55%', mobile: '50% 50%' }, // events: tables under sails
  '/assets/images/166e60_b9ea212268c0418da64548943420389f.jpg': { desktop: '50% 45%', mobile: '65% 50%' }, // beach-bar menu: reading on the beach
  '/assets/images/166e60_22cb6a524704460ca3067faea27ab144.jpg': { desktop: '50% 55%', mobile: '50% 50%' }, // stalbet menu: terrace
  '/assets/images/166e60_c1f4ee99f9fe407fa9ed51ca5f185d66f000.jpg': { desktop: '50% 40%', mobile: '68% 50%' }, // vision: divers over coral
  '/assets/images/62bd3d_2915f2f34d8540d29439129d6fc8dd17f000.jpg': { desktop: '50% 50%', mobile: '60% 50%' }, // shop
  '/assets/images/62bd3d_d9cc9b978d824b758ecad78c381fec60.jpg': { desktop: '50% 60%', mobile: '55% 50%' }, // stalbet cafe
  '/assets/images/166e60_c74e52747f904d3890fcbf9b8215fe7ff000.jpg': { desktop: '50% 50%', mobile: '45% 50%' }, // supportive: swimmers from above
};

/** Card crops (4:5 portrait) for images whose subject is off-centre. */
const cardFocal: Record<string, string> = {
  '/assets/images/166e60_0d61301c2fd2421a9eff24df7f096a13.jpg': '50% 35%',
  '/assets/images/166e60_0ffd61ae82db425ea673ca004fc2f9a7f000.jpg': '62% 50%',
  '/assets/images/166e60_86bc60dfc89844a3aed848c134ed243d.jpg': '50% 40%',
  '/assets/images/166e60_1ee3cd38d7d04552acf65eda3416007f.jpg': '60% 50%',
};

export const heroFocalStyle = (src?: string) => {
  const f = src ? focal[src] : undefined;
  return f ? ({ '--focal-d': f.desktop, '--focal-m': f.mobile } as React.CSSProperties) : undefined;
};
export const cardFocalStyle = (src?: string) => (src && cardFocal[src] ? ({ '--focal': cardFocal[src] } as React.CSSProperties) : undefined);
