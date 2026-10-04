import type { SVGProps } from 'react';
import { brandPaths, type BrandName } from './brands';

const paths = {
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  age: <><circle cx="12" cy="7" r="3.5" /><path d="M5 21c0-4 3-6.5 7-6.5s7 2.5 7 6.5" /></>,
  wave: <path d="M2 12c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M2 17c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2" />,
  depth: <path d="M12 3v18M7 16l5 5 5-5M3 7c2 0 2-1.5 4.5-1.5S9.5 7 12 7s2.5-1.5 4.5-1.5S19 7 21 7" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5" /></>,
  group: <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3 20c0-3.5 2.7-5.5 6-5.5s6 2 6 5.5M15 14.6c3 0 6 1.6 6 5.4" /></>,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  chevron: <path d="m9 6 6 6-6 6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  pin: <><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" /></>,
  phone: <path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  a11y: <><circle cx="12" cy="4.5" r="2" /><path d="M5 8.5l7 1.5 7-1.5M12 10v5l-3 6M12 15l3 6" /></>,
  play: <path d="M8 5v14l11-7z" fill="currentColor" stroke="none" />,
  pause: <path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor" stroke="none" />,
  plus: <path d="M12 5v14M5 12h14" />,
  file: <><path d="M14 3H6v18h12V7z" /><path d="M14 3v4h4M9 13h6M9 17h6" /></>,
  external: <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />,
  image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m21 17-5-5-9 8" /></>,
} as const;

export type IconName = keyof typeof paths | BrandName;

/** Icons that point in the reading direction; mirrored automatically under RTL. */
const DIRECTIONAL = new Set<IconName>(['arrow', 'chevron']);

export function Icon({ name, size = 20, className = '', ...rest }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  if (name in brandPaths) {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" focusable="false" className={className} {...rest}>
        <path d={brandPaths[name as BrandName]} />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`${DIRECTIONAL.has(name) ? 'ico-dir ' : ''}${className}`}
      {...rest}
    >
      {paths[name as keyof typeof paths]}
    </svg>
  );
}
