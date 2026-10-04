import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import type { HomeCard } from '@/lib/content';
import { Link } from '@/i18n/navigation';
import { bookingTarget, bookingUrl } from '@/config/links';
import { Icon } from '@/components/ui/Icon';
import { FromPrice } from '@/components/prices/Prices';

/** Experience card: price · age · duration visible before the click. Whole card links to the page. */
export async function ExperienceCard({ card, headingLevel = 3 }: { card: HomeCard; headingLevel?: 2 | 3 }) {
  const t = await getTranslations('cta');
  const H = `h${headingLevel}` as 'h2' | 'h3';
  return (
    <article className="xcard">
      <div className="xcard__media">
        <Image src={card.image.src} alt={card.image.alt} width={card.image.width} height={card.image.height} sizes="(min-width: 1200px) 300px, (min-width: 768px) 50vw, 100vw" quality={60} />
        {card.priceIds && <FromPrice ids={card.priceIds} />}
      </div>
      <div className="xcard__body">
        <H className="xcard__title">
          <Link href={`/${card.slug}`}>{card.title}</Link>
        </H>
        {card.chips && (
          <ul className="chips">
            {card.chips.map((c) => (
              <li key={c.text} className="chip">
                <Icon name={c.icon} size={16} />
                {c.text}
              </li>
            ))}
          </ul>
        )}
        {card.text && <p className="xcard__text">{card.text}</p>}
      </div>
      <div className="xcard__foot">
        <span className="xcard__more" aria-hidden="true">
          {t('details')} <Icon name="arrow" size={18} />
        </span>
        {card.booking && (
          <a className="btn btn--book" href={bookingUrl(card.booking)} {...(bookingTarget === '_blank' ? { target: '_blank', rel: 'noopener' } : {})}>
            {t('book')}
            <span className="visually-hidden"> – {card.title}</span>
          </a>
        )}
      </div>
    </article>
  );
}

export function CompactCard({ card }: { card: HomeCard }) {
  return (
    <article className="mcard">
      <Image src={card.image.src} alt={card.image.alt} fill sizes="(min-width: 768px) 50vw, 100vw" quality={60} style={{ objectFit: 'cover' }} />
      <div className="mcard__body">
        <h3>
          <Link href={`/${card.slug}`}>{card.title}</Link>
        </h3>
        <p>{card.text}</p>
      </div>
    </article>
  );
}
