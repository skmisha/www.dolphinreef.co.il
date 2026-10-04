import { getLocale, getTranslations } from 'next-intl/server';
import type { ContentPage, EventsPage, MapPage } from '@/lib/content';
import { Hero } from '@/components/sections/Hero';
import { ContentSections, Faq } from '@/components/sections/Blocks';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StickyBookBar } from '@/components/layout/StickyBookBar';
import { SmartLink } from '@/components/ui/SmartLink';
import { Icon } from '@/components/ui/Icon';
import { JsonLd } from '@/components/ui/JsonLd';
import { SiteMapInteractive } from '@/components/client/SiteMapInteractive';
import { breadcrumbLd, faqLd } from '@/lib/seo';

const DEFAULT_BAR_PRICES = ['stalbet-session', 'snorkel-child', 'dive-child'];

/** Long-form pages (content, legal, events, map). */
export async function ContentTemplate({ page }: { page: ContentPage | EventsPage | MapPage }) {
  const t = await getTranslations();
  const locale = await getLocale();
  return (
    <>
      <Hero hero={page.hero} crumbs={<Breadcrumbs items={[{ label: page.hero.title }]} />} />
      <div className={`page-body${page.template === 'legal' ? ' legal' : ''}`}>
        <div className="container" style={{ display: 'grid', gap: 'var(--space-8)' }}>
          {page.template === 'map' && (
            <section aria-labelledby="map-instructions" style={{ display: 'grid', gap: 'var(--space-5)' }}>
              <h2 id="map-instructions" style={{ fontSize: 'var(--fs-h3)' }}>{page.map.instructions}</h2>
              <SiteMapInteractive map={page.map} />
            </section>
          )}

          {page.sections && page.sections.length > 0 && <ContentSections sections={page.sections} />}

          {page.template === 'events' && (
            <section aria-labelledby="albums-title" style={{ display: 'grid', gap: 'var(--space-5)', maxInlineSize: 'var(--container-narrow)' }}>
              <h2 id="albums-title" style={{ fontSize: 'var(--fs-h2)' }}>{t('gallery.albums')}</h2>
              <ul className="albums">
                {page.albums.map((a) => (
                  <li key={a.href}>
                    <SmartLink href={a.href}>
                      {a.title}
                      <Icon name="external" size={18} />
                    </SmartLink>
                  </li>
                ))}
              </ul>
              <div>
                <SmartLink className="btn btn--secondary" href={page.galleryLink.href}>
                  <Icon name="image" size={18} />
                  {page.galleryLink.text}
                </SmartLink>
              </div>
            </section>
          )}

          {page.faq && page.faq.length > 0 && <Faq items={page.faq} />}
        </div>
      </div>
      <StickyBookBar priceIds={DEFAULT_BAR_PRICES} />
      {page.faq && page.faq.length > 0 && <JsonLd data={faqLd(page.faq)} />}
      <JsonLd data={breadcrumbLd(locale, [{ name: t('nav.home'), slug: '' }, { name: page.hero.title, slug: page.slug }])} />
    </>
  );
}
