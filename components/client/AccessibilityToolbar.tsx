'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Icon } from '@/components/ui/Icon';

type Prefs = { scale: number; contrast: boolean; links: boolean; noMotion: boolean };
const DEFAULTS: Prefs = { scale: 100, contrast: false, links: false, noMotion: false };
const KEY = 'a11y-prefs';
const SCALES = [100, 115, 130];

function apply(p: Prefs) {
  const root = document.documentElement;
  root.style.fontSize = p.scale === 100 ? '' : `${p.scale}%`;
  root.classList.toggle('a11y-contrast', p.contrast);
  root.classList.toggle('a11y-links', p.links);
  root.classList.toggle('a11y-no-motion', p.noMotion);
  if (p.noMotion) {
    document.querySelectorAll('video').forEach((v) => v.pause());
    window.dispatchEvent(new Event('a11y:stop-motion'));
  }
}

/** Font size, high contrast, link highlight, stop animations. Stored per viewer in localStorage. */
export function AccessibilityToolbar() {
  const t = useTranslations('a11y');
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || 'null') as Prefs | null;
      if (saved) { setPrefs({ ...DEFAULTS, ...saved }); apply({ ...DEFAULTS, ...saved }); }
    } catch { /* storage unavailable */ }
  }, []);

  const update = (next: Partial<Prefs>) => {
    const p = { ...prefs, ...next };
    setPrefs(p);
    apply(p);
    try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* ignore */ }
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); btnRef.current?.focus(); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const idx = SCALES.indexOf(prefs.scale);
  return (
    <>
      <button ref={btnRef} className="a11y-fab" aria-label={t('toolbar')} aria-expanded={open} aria-controls="a11y-panel" onClick={() => setOpen((o) => !o)}>
        <Icon name="a11y" size={26} />
      </button>
      <section id="a11y-panel" className="a11y-panel" aria-labelledby="a11y-title" hidden={!open}>
        <div className="a11y-row">
          <h2 id="a11y-title">{t('toolbarTitle')}</h2>
          <button onClick={() => { setOpen(false); btnRef.current?.focus(); }} aria-label={t('close')}><Icon name="close" size={18} /></button>
        </div>
        <div className="a11y-row" role="group" aria-label={t('fontSize')}>
          <span>{t('fontSize')}</span>
          <span style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button onClick={() => update({ scale: SCALES[Math.max(0, idx - 1)] })} aria-label={t('fontDecrease')} disabled={idx <= 0}>א-</button>
            <button onClick={() => update({ scale: 100 })} aria-label={t('fontReset')}>{prefs.scale}%</button>
            <button onClick={() => update({ scale: SCALES[Math.min(SCALES.length - 1, idx + 1)] })} aria-label={t('fontIncrease')} disabled={idx >= SCALES.length - 1}>א+</button>
          </span>
        </div>
        <button aria-pressed={prefs.contrast} onClick={() => update({ contrast: !prefs.contrast })}>{t('contrast')}</button>
        <button aria-pressed={prefs.links} onClick={() => update({ links: !prefs.links })}>{t('highlightLinks')}</button>
        <button aria-pressed={prefs.noMotion} onClick={() => update({ noMotion: !prefs.noMotion })}>{t('stopAnimations')}</button>
        <button onClick={() => update(DEFAULTS)}>{t('resetAll')}</button>
        <Link href="/accessibility-statement">{t('statementLink')}</Link>
      </section>
    </>
  );
}
