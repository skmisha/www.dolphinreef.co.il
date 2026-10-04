'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { Icon } from '@/components/ui/Icon';
import type { NavItem } from '@/lib/content';
import { LanguageSwitcher } from './LanguageSwitcher';

interface Props {
  nav: NavItem[];
  primary: NavItem[];
  brand: React.ReactNode;
  bookHref: string;
  bookNewTab: boolean;
  phone: { href: string; display: string };
  locales: string[];
}

const isExternal = (href: string) => /^https?:/.test(href);

export function HeaderClient({ nav, primary, brand, bookHref, bookNewTab, phone, locales }: Props) {
  const t = useTranslations();
  const pathname = usePathname();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  // focus trap + Esc while the drawer is open
  useEffect(() => {
    if (!open) return;
    const drawer = drawerRef.current;
    const focusables = () => [...(drawer?.querySelectorAll<HTMLElement>('a[href],button') ?? [])];
    focusables()[0]?.focus();
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
      if (e.key === 'Tab') {
        const f = focusables();
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const current = (href: string) => (href === pathname ? 'page' : undefined);
  const NavLink = ({ item }: { item: NavItem }) =>
    isExternal(item.href) ? (
      <a href={item.href} target="_blank" rel="noopener noreferrer">
        {item.label}
        <span className="visually-hidden"> {t('a11y.opensNewWindow')}</span>
      </a>
    ) : (
      <Link href={item.href} aria-current={current(item.href)}>
        {item.label}
      </Link>
    );

  return (
    <header className="site-header" data-solid={solid}>
      <div className="container site-header__bar">
        {brand}
        <nav className="nav" aria-label={t('nav.main')}>
          <ul>
            {primary.map((item) => (
              <li key={item.href}>
                <NavLink item={item} />
              </li>
            ))}
          </ul>
        </nav>
        <div className="header-actions">
          <LanguageSwitcher locales={locales} />
          <a className="btn btn--book header-book" href={bookHref} {...(bookNewTab ? { target: '_blank', rel: 'noopener' } : {})}>
            {t('cta.book')}
          </a>
          <button
            ref={toggleRef}
            className="icon-btn menu-toggle"
            aria-label={t('nav.menu')}
            aria-expanded={open}
            aria-controls="site-drawer"
            onClick={() => setOpen(true)}
          >
            <Icon name="menu" size={22} />
          </button>
        </div>
      </div>

      <div id="site-drawer" ref={drawerRef} className="drawer" role="dialog" aria-modal="true" aria-label={t('nav.menu')} hidden={!open}>
        <div className="drawer__top">
          {brand}
          <button className="icon-btn" aria-label={t('nav.closeMenu')} onClick={() => { setOpen(false); toggleRef.current?.focus(); }}>
            <Icon name="close" size={22} />
          </button>
        </div>
        <nav aria-label={t('nav.main')}>
          <ul>
            {nav.map((item) => (
              <li key={item.href} className={item.parent ? 'sub' : undefined}>
                <NavLink item={item} />
              </li>
            ))}
          </ul>
        </nav>
        <div className="drawer__foot">
          <a className="btn btn--book btn--lg" href={bookHref} {...(bookNewTab ? { target: '_blank', rel: 'noopener' } : {})}>
            {t('cta.book')}
          </a>
          <a className="btn btn--ghost btn--lg" href={phone.href}>
            <Icon name="phone" size={18} />
            {phone.display}
          </a>
        </div>
      </div>
    </header>
  );
}
