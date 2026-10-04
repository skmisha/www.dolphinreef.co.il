import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export async function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  const t = await getTranslations('nav');
  return (
    <nav className="crumbs" aria-label={t('breadcrumbs')}>
      <ol>
        <li><Link href="/">{t('home')}</Link></li>
        {items.map((it, i) =>
          it.href && i < items.length - 1 ? (
            <li key={it.label}><Link href={it.href}>{it.label}</Link></li>
          ) : (
            <li key={it.label} aria-current="page">{it.label}</li>
          ),
        )}
      </ol>
    </nav>
  );
}
