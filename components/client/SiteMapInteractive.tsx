'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { MapPage } from '@/lib/content';

type Spot = MapPage['map']['hotspots'][number];

/** Numbered map hotspots as real buttons + a native <dialog> with the area image. */
export function SiteMapInteractive({ map }: { map: MapPage['map'] }) {
  const t = useTranslations('map');
  const dialog = useRef<HTMLDialogElement>(null);
  const [spot, setSpot] = useState<Spot | null>(null);
  const openSpot = (s: Spot) => {
    setSpot(s);
    dialog.current?.showModal();
  };
  const unique = map.hotspots.filter((s, i, all) => all.findIndex((x) => x.label === s.label) === i);
  return (
    <>
      {/* the map artwork is not mirrored, so hotspot geometry is laid out LTR */}
      <figure className="sitemap-figure" dir="ltr">
        <Image src={map.image.src} alt={map.image.alt} width={map.image.width} height={map.image.height} sizes="(min-width: 1216px) 1216px, 100vw" priority />
        {map.hotspots.map((s) => (
          <button
            key={s.id}
            className="hotspot"
            style={{ insetInlineStart: `${s.xPct}%`, insetBlockStart: `${s.yPct}%` }}
            onClick={() => openSpot(s)}
            aria-label={`${s.label} – ${s.title}`}
            aria-haspopup="dialog"
          />
        ))}
      </figure>
      <ul className="spot-list" aria-label={map.instructions}>
        {unique.map((s) => (
          <li key={s.id}>
            <button onClick={() => openSpot(s)} aria-haspopup="dialog">
              {s.label}<span className="visually-hidden"> – {s.title}</span>
            </button>
          </li>
        ))}
      </ul>
      <dialog ref={dialog} className="lightbox" aria-labelledby="spot-title" onClose={() => setSpot(null)} onClick={(e) => e.target === dialog.current && dialog.current?.close()}>
        {spot && (
          <>
            <div className="lightbox__bar">
              <span id="spot-title">{spot.label} – {spot.title}</span>
              <button className="lightbox__close" onClick={() => dialog.current?.close()} aria-label={t('close')}>×</button>
            </div>
            {spot.popup && <Image src={spot.popup.src} alt={spot.popup.alt} width={spot.popup.width} height={spot.popup.height} sizes="(min-width: 720px) 720px, 92vw" />}
          </>
        )}
      </dialog>
    </>
  );
}
