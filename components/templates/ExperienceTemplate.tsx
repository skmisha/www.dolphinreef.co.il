import { Suspense } from 'react';
import { getLocale, getTranslations } from 'next-intl/server';
import type { ExperiencePage, HomeCard } from '@/lib/content';
import { getPage } from '@/lib/content';
import { getPricesByIds } from '@/lib/prices';
import { Hero } from '@/components/sections/Hero';
import { KeyFacts, Faq, VideoFacade, Callout, DocumentLinks, ContentSections } from '@/components/sections/Blocks';
import { ExperienceCard } from '@/components/sections/Cards';
import { PriceRows } from '@/components/prices/Prices';
import { StickyBookBar } from '@/components/layout/StickyBookBar';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { RichText } from '@/components/ui/RichText';
import { Icon } from '@/components/ui/Icon';
import { JsonLd } from '@/components/ui/JsonLd';
import { bookingTarget, bookingUrl, contact } from '@/config/links';
import { breadcrumbLd, faqLd, offersLd } from '@/lib/seo';

async function OffersJsonLd({ page, locale }: { page: ExperiencePage; locale: string }) {
  try {
    return <JsonLd data={offersLd(page, await getPricesByIds(page.experience.priceIds), locale)} />;
  } catch {
    return null;
  }
}

export async function ExperienceTemplate({ page }: { page: ExperiencePage }) {
  const t = await getTranslations();
  const locale = await getLocale();
  const x = page.experience;
  const target = bookingTarget === '_blank' ? { target: '_blank', rel: 'noopener' } : {};
  const promoted = (page.faq ?? []).filter((f) => x.goodToKnow.includes(f.question));

  // related cards: built from the related pages' own content (home card data where available)
  const home = await getPage('', locale);
  const homeCards = home?.template === 'home' ? home.experiences.cards : [];
  const related = (
    await Promise.all(
      x.related.map(async (slug): Promise<HomeCard | null> => {
        const card = homeCards.find((c) => c.slug === slug);
        if (card) return card;
        const p = await getPage(slug, locale);
        if (!p?.hero.image) return null;
        return { slug, title: p.hero.title, text: '', image: p.hero.image };
      }),
    )
  ).filter((c): c is HomeCard => !!c);

  return (
    <>
      <Hero
        hero={{ ...page.hero, intro: undefined, lead: page.hero.lead ?? page.seo.description }}
        crumbs={<Breadcrumbs items={[{ label: page.hero.title }]} />}
        actions={
          <a className="btn btn--book btn--lg" href={bookingUrl(x.booking)} {...target}>
            {x.primaryBookingText ?? t('cta.book')}
          </a>
        }
      />
      <div className="container">
        <KeyFacts facts={x.facts} />
      </div>

      <div className="section">
        <div className="container content-grid">
          <div style={{ display: 'grid', gap: 'var(--space-8)', minInlineSize: 0 }}>
            {page.hero.intro && page.hero.intro.length > 0 && (
              <div className="article-intro reveal">
                {page.hero.intro.map((p, i) => <RichText key={i} value={p} />)}
              </div>
            )}
            {page.sections && page.sections.length > 0 && <ContentSections sections={page.sections} />}

            {x.youtube && <VideoFacade id={x.youtube} poster={page.hero.video?.poster ?? page.hero.image ?? undefined} title={page.hero.title} />}

            <section aria-labelledby="know-title" style={{ display: 'grid', gap: 'var(--space-5)' }}>
              <h2 id="know-title" style={{ fontSize: 'var(--fs-h2)' }}>{t('experience.goodToKnow')}</h2>
              <div className="callouts">
                {promoted.map((f) => (
                  <Callout key={f.question} title={f.question}>
                    {f.answer.map((a, i) => <RichText key={i} value={a} />)}
                  </Callout>
                ))}
                {x.idNote && (
                  <Callout title={t('experience.bringId')} warn>
                    <p>{x.idNote}</p>
                  </Callout>
                )}
                {x.documents.length > 0 && (
                  <Callout title={t('experience.documents')}>
                    <DocumentLinks docs={x.documents} />
                  </Callout>
                )}
              </div>
            </section>

            {page.faq && page.faq.length > 0 && (
              <section aria-labelledby="faq-title" style={{ display: 'grid', gap: 'var(--space-5)' }}>
                <h2 id="faq-title" style={{ fontSize: 'var(--fs-h2)' }}>{t('faq.title')}</h2>
                <Faq items={page.faq} />
              </section>
            )}
          </div>

          <aside className="price-panel" aria-labelledby="price-title">
            <h2 id="price-title">{t('price.title')}</h2>
            <PriceRows ids={x.priceIds} />
            {x.priceNote && <p className="price-note">{x.priceNote}</p>}
            <a className="btn btn--book btn--lg" href={bookingUrl(x.booking)} {...target}>
              {x.primaryBookingText ?? t('cta.book')}
            </a>
            {x.secondaryBooking && (
              <a className="btn btn--secondary" href={bookingUrl(x.secondaryBooking.booking)} {...target}>
                {x.secondaryBooking.text}
              </a>
            )}
            <a className="btn btn--ghost" href={contact.phone.href} style={{ color: 'var(--c-reef)' }}>
              <Icon name="phone" size={18} />
              {contact.phone.display}
            </a>
            {x.phoneHours && <p className="price-note">{x.phoneHours}</p>}
          </aside>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section section--tint" aria-labelledby="more-title">
          <div className="container">
            <div className="section__head">
              <h2 id="more-title">{t('experience.more')}</h2>
            </div>
            <div className="cards cards--3">
              {related.map((c) => (
                <ExperienceCard key={c.slug} card={c} />
              ))}
            </div>
          </div>
        </section>
      )}

      <StickyBookBar label={page.hero.title} priceIds={x.priceIds} booking={x.booking} />
      {page.faq && page.faq.length > 0 && <JsonLd data={faqLd(page.faq)} />}
      <JsonLd data={breadcrumbLd(locale, [{ name: t('nav.home'), slug: '' }, { name: page.hero.title, slug: page.slug }])} />
      <Suspense fallback={null}>
        <OffersJsonLd page={page} locale={locale} />
      </Suspense>
    </>
  );
}
