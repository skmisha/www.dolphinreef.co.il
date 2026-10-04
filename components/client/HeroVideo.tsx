'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/Icon';

/**
 * Decorative hero video layered over the LCP still image. Starts only after the page has loaded,
 * on a reasonable connection, and never with reduced motion / the toolbar's "stop animations".
 */
export function HeroVideo({ src, poster }: { src: string; poster?: string }) {
  const t = useTranslations('video');
  const ref = useRef<HTMLVideoElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('a11y-no-motion');
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const slow = conn?.saveData || /2g/.test(conn?.effectiveType ?? '');
    if (reduce || slow) return;
    const start = () => setTimeout(() => setEnabled(true), 1200);
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    const onMotion = () => { ref.current?.pause(); setPlaying(false); };
    window.addEventListener('a11y:stop-motion', onMotion);
    return () => window.removeEventListener('a11y:stop-motion', onMotion);
  }, []);

  useEffect(() => {
    if (enabled) ref.current?.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [enabled]);

  if (!enabled) return null;
  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) v.play().then(() => setPlaying(true)); else { v.pause(); setPlaying(false); }
  };
  return (
    <>
      <video ref={ref} className="hero__video" src={src} poster={poster} muted loop playsInline preload="none" aria-hidden="true" />
      <button className="icon-btn media-toggle" onClick={toggle} aria-label={playing ? t('pause') : t('play')}>
        <Icon name={playing ? 'pause' : 'play'} size={18} />
      </button>
    </>
  );
}
