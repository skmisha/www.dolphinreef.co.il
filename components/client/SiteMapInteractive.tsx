'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { MapPage } from '@/lib/content';

type Spot = MapPage['map']['hotspots'][number];

/**
 * Interactive site map: hotspots on the artwork + a legend of place cards. Hovering/focusing a card
 * highlights its marker(s); activating either opens a dialog with the area's image.
 */
export function SiteMapInteractive({ map }: { map: MapPage['map'] }) {
  const t = useTranslations('map');
  const dialog = useRef<HTMLDialogElement>(null);
  const [spot, setSpot] = useState<Spot | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const open = (s: Spot) => { setHover(null); setSpot(s); dialog.current?.showModal(); };

  const places = map.hotspots.filter((s, i, all) => /^\d+$/.test(s.label) && all.findIndex((x) => x.label === s.label) === i);
  const routes = map.hotspots.filter((s) => !/^\d+$/.test(s.label));

  return (
    <div className="sitemap">
      <p className="sitemap__hint">{map.instructions}</p>
      {/* the map artwork is not mirrored, so hotspot geometry is laid out LTR */}
      <figure className="sitemap-figure" dir="ltr">
        <Image src={map.image.src} alt={map.image.alt} width={map.image.width} height={map.image.height} sizes="(min-width: 1216px) 1216px, 100vw" priority />
        {map.hotspots.map((s) => (
          <button
            key={s.id}
            className={`hotspot${hover === s.label || (hover === 'routes' && !/^\d+$/.test(s.label)) ? ' is-active' : ''}`}
            style={{ insetInlineStart: `${s.xPct}%`, insetBlockStart: `${s.yPct}%` }}
            onClick={() => open(s)}
            onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(/^\d+$/.test(s.label) ? s.label : 'routes')}
            onPointerLeave={() => setHover(null)}
            aria-label={`${s.label} – ${s.title}`}
            aria-haspopup="dialog"
          />
        ))}
      </figure>

      <h2 className="sitemap__legend-title">{t('legend')}</h2>
      <ul className="legend">
        {places.map((s) => (
          <li key={s.id}>
            <button
              className={`place${hover === s.label ? ' is-active' : ''}`}
              onClick={() => open(s)}
              onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(s.label)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => setHover(s.label)}
              onBlur={() => setHover(null)}
              aria-haspopup="dialog"
            >
              <span className="place__num" aria-hidden="true">{s.label}</span>
              <span className="place__title">{s.title.replace(/^"|"\.?$|\.$/g, '')}</span>
              {s.popup && (
                <span className="place__thumb" aria-hidden="true">
                  <Image src={s.popup.src} alt="" width={s.popup.width} height={s.popup.height} sizes="96px" quality={60} />
                </span>
              )}
            </button>
          </li>
        ))}
        {routes.length > 0 && (
          <li>
            <button
              className={`place place--routes${hover === 'routes' ? ' is-active' : ''}`}
              onClick={() => open(routes[0])}
              onPointerEnter={(e) => e.pointerType === 'mouse' && setHover('routes')}
              onPointerLeave={() => setHover(null)}
              onFocus={() => setHover('routes')}
              onBlur={() => setHover(null)}
              aria-haspopup="dialog"
            >
              <span className="place__num place__num--route" aria-hidden="true">{routes[0].label}–{routes[routes.length - 1].label}</span>
              <span className="place__title">{routes[0].title}</span>
            </button>
          </li>
        )}
      </ul>

      <dialog ref={dialog} className="lightbox" aria-labelledby="spot-title" onClose={() => setSpot(null)} onClick={(e) => e.target === dialog.current && dialog.current?.close()}>
        {spot && (
          <>
            <div className="lightbox__bar">
              <span className="place__num" aria-hidden="true">{spot.label}</span>
              <h2 id="spot-title">{spot.title}</h2>
              <button className="lightbox__close" onClick={() => dialog.current?.close()} aria-label={t('close')}>×</button>
            </div>
            {spot.popup && <Image src={spot.popup.src} alt={spot.popup.alt} width={spot.popup.width} height={spot.popup.height} sizes="(min-width: 720px) 640px, 92vw" />}
          </>
        )}
      </dialog>
    </div>
  );
}
