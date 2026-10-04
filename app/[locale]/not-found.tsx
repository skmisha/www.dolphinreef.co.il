import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function NotFound() {
  const t = await getTranslations('error');
  return (
    <section className="notfound hero--plain" style={{ color: '#fff' }}>
      <div>
        <h1 style={{ fontSize: 'var(--fs-h1)' }}>{t('notFoundTitle')}</h1>
        <p>{t('notFoundText')}</p>
        <Link className="btn btn--book" href="/">{t('backHome')}</Link>
      </div>
    </section>
  );
}
