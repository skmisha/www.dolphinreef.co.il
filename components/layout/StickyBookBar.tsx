import { getTranslations } from 'next-intl/server';
import { bookingTarget, bookingUrl, type BookingKey } from '@/config/links';
import { FromPrice } from '@/components/prices/Prices';

/** Mobile/tablet sticky booking bar (hidden >= 1024px where the header CTA is visible). */
export async function StickyBookBar({ label, priceIds, booking = 'default' }: { label?: string; priceIds: string[]; booking?: BookingKey }) {
  const t = await getTranslations();
  return (
    <div className="book-bar" role="region" aria-label={t('bookBar.region')}>
      <div className="book-bar__meta">
        <small>{label ?? t('bookBar.label')}</small>
        <FromPrice ids={priceIds} className="book-bar__price" />
      </div>
      <a className="btn btn--book" href={bookingUrl(booking)} {...(bookingTarget === '_blank' ? { target: '_blank', rel: 'noopener' } : {})}>
        {t('cta.book')}
      </a>
    </div>
  );
}
