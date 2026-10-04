import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import type { ContentPage, EventsPage, MapPage } from '@/lib/content';
import { Hero } from '@/components/sections/Hero';
import { Faq } from '@/components/sections/Blocks';
import { Article } from '@/components/sections/Article';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StickyBookBar } from '@/components/layout/StickyBookBar';
import { SmartLink } from '@/components/ui/SmartLink';
import { Icon } from '@/components/ui/Icon';
import { JsonLd } from '@/components/ui/JsonLd';
import { SiteMapInteractive } from '@/components/client/SiteMapInteractive';
import { breadcrumbLd, faqLd } from '@/lib/seo';

const DEFAULT_BAR_PRICES = ['stalbet-session', 'snorkel-child', 'dive-child'];

async function Albums({ page }: { page: EventsPage }) {
  const t = await getTranslations();
  return (
    <section className="albums-section reveal" aria-labelledby="albums-title">
      <div className="albums-head">
        <h2 id="albums-title">{t('gallery.albums')}</h2>
        <SmartLink className="btn btn--secondary" href={page.galleryLink.href}>
          <Icon name="image" size={18} />
          {page.galleryLink.text}
        </SmartLink>
      </div>
      <ul className="album-grid">
        {page.albums.map((a) => (
          <li key={a.href}>
            <SmartLink className="album" href={a.href}>
              {a.cover && <Image src={a.cover.src} alt="" width={a.cover.width} height={a.cover.height} sizes="(min-width: 1024px) 280px, 50vw" quality={60} />}
              <span className="album__title">
                {a.title}
                <Icon name="external" size={16} />
              </span>
            </SmartLink>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Long-form pages (content, legal, events, map) on the editorial article layout. */
export async function ContentTemplate({ page }: { page: ContentPage | EventsPage | MapPage }) {
  const t = await getTranslations();
  const locale = await getLocale();
  const legal = page.template === 'legal';
  const hero = { ...page.hero, intro: undefined, lead: legal ? undefined : page.hero.lead ?? page.seo.description };
  return (
    <>
      <Hero hero={hero} variant={legal ? 'compact' : 'page'} crumbs={<Breadcrumbs items={[{ label: page.hero.title }]} />} />
      {page.template === 'map' ? (
        <div className="page-body container">
          <SiteMapInteractive map={page.map} />
        </div>
      ) : (
        <div className="page-body">
          <Article
            sections={page.sections ?? []}
            intro={page.hero.intro}
            legal={legal}
            extra={
              <>
                {page.template === 'events' && <Albums page={page} />}
                {page.faq && page.faq.length > 0 && <Faq items={page.faq} />}
              </>
            }
          />
        </div>
      )}
      <StickyBookBar priceIds={DEFAULT_BAR_PRICES} />
      {page.faq && page.faq.length > 0 && <JsonLd data={faqLd(page.faq)} />}
      <JsonLd data={breadcrumbLd(locale, [{ name: t('nav.home'), slug: '' }, { name: page.hero.title, slug: page.slug }])} />
    </>
  );
}
