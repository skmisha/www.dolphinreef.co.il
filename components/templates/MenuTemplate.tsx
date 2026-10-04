import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import type { MenuPage } from '@/lib/content';
import { Hero } from '@/components/sections/Hero';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StickyBookBar } from '@/components/layout/StickyBookBar';
import { JsonLd } from '@/components/ui/JsonLd';
import { getPage } from '@/lib/content';
import { breadcrumbLd } from '@/lib/seo';

/** Restaurant / cafe menus, rendered natively (the live site used HTML iframes). */
export async function MenuTemplate({ page }: { page: MenuPage }) {
  const t = await getTranslations();
  const locale = await getLocale();
  const dining = await getPage('dining-at-thereef', locale);
  const parent = { label: dining?.hero.title ?? '', href: '/dining-at-thereef' };
  return (
    <>
      <Hero hero={page.hero} crumbs={<Breadcrumbs items={[parent, { label: page.hero.title }]} />} />
      <nav className="menu-tabs" aria-label={t('menu.sections')}>
        <div className="container">
          <ul>
            {page.menu.sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.title}</a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      <div className="container">
        {page.menu.sections.map((s) => (
          <section key={s.id} id={s.id} className="menu-sec" aria-labelledby={`${s.id}-t`}>
            <div className="menu-sec__head">
              <h2 id={`${s.id}-t`}>{s.title}</h2>
              {s.note && <span className="menu-note">{s.note}</span>}
            </div>
            {s.image && (
              <div className="menu-sec__img">
                <Image src={s.image.src} alt="" width={s.image.width} height={s.image.height} sizes="(min-width: 1216px) 1216px, 100vw" quality={60} />
              </div>
            )}
            <div className={`menu-groups${s.groups.length > 1 ? ' menu-groups--multi' : ''}`}>
              {s.groups.map((g, gi) => (
                <div key={gi} className="menu-group">
                  {g.title && <h3>{g.title}</h3>}
                  {g.items.length > 0 && (
                    <ul className="menu-items">
                      {g.items.map((it, ii) => (
                        <li key={ii} className="menu-item">
                          <div>
                            <div className="menu-item__name">{it.name}</div>
                            {it.description && <div className="menu-item__desc">{it.description}</div>}
                          </div>
                          {it.price && <div className="menu-item__price">{it.price}</div>}
                        </li>
                      ))}
                    </ul>
                  )}
                  {g.list && (
                    <ul className="menu-note" style={{ marginBlockStart: 'var(--space-3)', paddingInlineStart: 'var(--space-5)' }}>
                      {g.list.map((l) => <li key={l}>{l}</li>)}
                    </ul>
                  )}
                  {g.notes?.map((n) => <p key={n} className="menu-note" style={{ marginBlockStart: 'var(--space-3)' }}>{n}</p>)}
                </div>
              ))}
            </div>
          </section>
        ))}
        <div className="menu-footer">
          {page.menu.footer.map((l) => <p key={l}>{l}</p>)}
        </div>
      </div>
      <StickyBookBar priceIds={['stalbet-session', 'snorkel-child', 'dive-child']} />
      <JsonLd data={breadcrumbLd(locale, [{ name: t('nav.home'), slug: '' }, { name: parent.label, slug: 'dining-at-thereef' }, { name: page.hero.title, slug: page.slug }])} />
    </>
  );
}
