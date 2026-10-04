import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import type { HomePage } from '@/lib/content';
import { getSite } from '@/lib/content';
import { Hero } from '@/components/sections/Hero';
import { ExperienceCard, CompactCard } from '@/components/sections/Cards';
import { InlinePrices } from '@/components/prices/Prices';
import { StickyBookBar } from '@/components/layout/StickyBookBar';
import { SmartLink } from '@/components/ui/SmartLink';
import { Icon } from '@/components/ui/Icon';
import { JsonLd } from '@/components/ui/JsonLd';
import { bookingTarget, bookingUrl, contact, googleMaps } from '@/config/links';
import { organizationLd, websiteLd } from '@/lib/seo';

export async function HomeTemplate({ page }: { page: HomePage }) {
  const t = await getTranslations();
  const locale = await getLocale();
  const site = await getSite(locale);
  const geo = site.organization.geo;
  const hours = page.facts.filter((f) => f.value);
  return (
    <>
      <Hero
        hero={page.hero}
        variant="home"
        actions={
          <>
            <a className="btn btn--book btn--lg" href={bookingUrl('default')} {...(bookingTarget === '_blank' ? { target: '_blank', rel: 'noopener' } : {})}>
              {t('cta.book')}
            </a>
            {page.hero.cta && (
              <a className="btn btn--ghost btn--lg" href={page.hero.cta.href}>
                {page.hero.cta.text}
              </a>
            )}
          </>
        }
      />

      <div className="container">
        <section className="facts" aria-label={t('home.visitFacts')}>
          {page.facts.map((f) => (
            <div key={f.label} className="fact">
              <span className="fact__label">{f.label}</span>
              <span className="fact__value">{f.value ?? (f.priceIds ? <InlinePrices ids={f.priceIds} /> : null)}</span>
              <span className="fact__note">{f.note}</span>
            </div>
          ))}
        </section>
      </div>

      <section className="section" id="experiences" aria-labelledby="exp-title">
        <div className="container">
          <div className="section__head">
            <h2 id="exp-title">{page.experiences.heading}</h2>
          </div>
          <div className="cards cards--4">
            {page.experiences.cards.map((c) => (
              <ExperienceCard key={c.slug} card={c} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tint" aria-labelledby="about-title">
        <div className="container split">
          <div className="split__media">
            <Image src={page.about.image.src} alt={page.about.image.alt} width={page.about.image.width} height={page.about.image.height} sizes="(min-width: 1024px) 600px, 100vw" quality={60} />
          </div>
          <div className="split__body">
            <h2 id="about-title">{page.about.heading}</h2>
            <p>{page.about.text}</p>
            <div>
              <SmartLink className="btn btn--secondary" href={page.about.link.href}>
                {page.about.link.text} <Icon name="arrow" size={18} />
              </SmartLink>
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-label={t('home.more')}>
        <div className="container cards">
          {page.more.map((c) => (
            <CompactCard key={c.slug} card={c} />
          ))}
        </div>
      </section>

      <section className="section section--dark" aria-labelledby="visit-title">
        <div className="container visit">
          <div>
            <div className="section__head">
              <h2 id="visit-title">{t('home.planVisit')}</h2>
            </div>
            <ul className="hours">
              {hours.map((h) => (
                <li key={h.label}>
                  <span>{h.label}</span>
                  <b>{h.value}</b>
                </li>
              ))}
              <li><span>{hours[0]?.note}</span></li>
            </ul>
            <p style={{ marginBlock: 'var(--space-5)' }}>{page.visit.notice}</p>
            <div className="hero__ctas">
              <a className="btn btn--book" href={contact.phone.href}>
                <Icon name="phone" size={18} />
                {contact.phone.display}
              </a>
              <SmartLink className="btn btn--ghost" href="/map">{t('home.siteMap')}</SmartLink>
            </div>
          </div>
          {geo && (
            <a className="visit__map" href={googleMaps(geo.latitude, geo.longitude)} target="_blank" rel="noopener noreferrer" aria-label={`${t('home.openMaps')} – ${t('home.openMapsLabel')} ${t('a11y.opensNewWindow')}`}>
              <Image src={page.visit.image.src} alt="" fill sizes="(min-width: 1024px) 640px, 100vw" quality={60} style={{ objectFit: 'cover' }} />
              <span className="btn btn--book">
                <Icon name="pin" size={18} />
                {t('home.openMaps')}
              </span>
            </a>
          )}
        </div>
      </section>

      <StickyBookBar priceIds={['stalbet-session', 'snorkel-child', 'dive-child']} />
      <JsonLd data={organizationLd(site)} />
      <JsonLd data={websiteLd(site)} />
    </>
  );
}
