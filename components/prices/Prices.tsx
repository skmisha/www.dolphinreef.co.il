import { Suspense } from 'react';
import { connection } from 'next/server';
import { getLocale, getTranslations } from 'next-intl/server';
import { getPricesByIds, formatPrice, lowestPrice } from '@/lib/prices';
import { intlLocale } from '@/config/i18n';
import { contact } from '@/config/links';

async function fmt() {
  const locale = await getLocale();
  return (n: number) => formatPrice(n, intlLocale[locale] ?? locale);
}

/* ---------- "from X" badge on cards ---------- */
async function FromPriceInner({ ids }: { ids: string[] }) {
  await connection(); // request-time data: streamed into the Suspense hole, like a future price API
  const t = await getTranslations('price');
  try {
    const low = lowestPrice(await getPricesByIds(ids));
    if (!low) return null;
    const f = await fmt();
    return (
      <>
        {t('from')}
        <b>{f(low.amount)}</b>
      </>
    );
  } catch {
    return null; // card stays usable without a price; panel on the page shows the error state
  }
}

export async function FromPrice({ ids, className = 'xcard__price' }: { ids: string[]; className?: string }) {
  const t = await getTranslations('price');
  return (
    <span className={className} aria-live="polite">
      <Suspense fallback={<span className="skeleton skeleton--badge" aria-busy="true" aria-label={t('loading')} />}>
        <FromPriceInner ids={ids} />
      </Suspense>
    </span>
  );
}

/* ---------- inline "adult X · child Y" (home facts) ---------- */
async function InlinePricesInner({ ids }: { ids: string[] }) {
  await connection(); // request-time data: streamed into the Suspense hole, like a future price API
  const t = await getTranslations();
  try {
    const prices = await getPricesByIds(ids);
    if (!prices.length) return <span className="price-state">{t('price.empty')}</span>;
    const f = await fmt();
    return <>{prices.map((p) => `${t(`price.audience.${p.audience}`)} ${f(p.amount)}`).join(' · ')}</>;
  } catch {
    return <span className="price-state price-state--error" role="status">{t('price.error')}</span>;
  }
}

export async function InlinePrices({ ids }: { ids: string[] }) {
  const t = await getTranslations('price');
  return (
    <span aria-live="polite">
      <Suspense fallback={<span className="skeleton" aria-busy="true" aria-label={t('loading')} />}>
        <InlinePricesInner ids={ids} />
      </Suspense>
    </span>
  );
}

/* ---------- full price list (experience page panel) ---------- */
function PriceRowsSkeleton({ rows, label }: { rows: number; label: string }) {
  return (
    <ul className="price-rows" aria-busy="true" aria-label={label}>
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="skeleton-row">
          <span className="skeleton skeleton--text" />
          <span className="skeleton" />
        </li>
      ))}
    </ul>
  );
}

async function PriceRowsInner({ ids }: { ids: string[] }) {
  await connection(); // request-time data: streamed into the Suspense hole, like a future price API
  const t = await getTranslations();
  try {
    const prices = await getPricesByIds(ids);
    if (!prices.length) {
      return (
        <p className="price-state" role="status">
          {t('price.empty')} <a href={contact.phone.href}>{contact.phone.display}</a>
        </p>
      );
    }
    const f = await fmt();
    return (
      <ul className="price-rows">
        {prices.map((p) => (
          <li key={p.id}>
            <span>{t(p.labelKey)}</span>
            <span className="amt">{f(p.amount)}</span>
          </li>
        ))}
      </ul>
    );
  } catch {
    return (
      <p className="price-state price-state--error" role="alert">
        {t('price.error')} <a href={contact.phone.href}>{contact.phone.display}</a>
      </p>
    );
  }
}

export async function PriceRows({ ids }: { ids: string[] }) {
  const t = await getTranslations('price');
  return (
    <div aria-live="polite">
      <Suspense fallback={<PriceRowsSkeleton rows={ids.length} label={t('loading')} />}>
        <PriceRowsInner ids={ids} />
      </Suspense>
    </div>
  );
}
