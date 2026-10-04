import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { isExternal, opensNewTab } from '@/config/links';

interface Props {
  href: string;
  children: ReactNode;
  className?: string;
  'aria-label'?: string;
  /** hide the visually-hidden "(opens in new window)" suffix, e.g. when aria-label already says it */
  quiet?: boolean;
}

/** One link component for internal routes, PDFs, tel:, mailto: and external sites. */
export async function SmartLink({ href, children, className, quiet, ...rest }: Props) {
  const t = await getTranslations('a11y');
  const isPdf = /\.pdf($|\?)/i.test(href);
  if (!isExternal(href) && !isPdf && !href.startsWith('#')) {
    return (
      <Link href={href} className={className} {...rest}>
        {children}
      </Link>
    );
  }
  const newTab = opensNewTab(href) || isPdf;
  return (
    <a href={href} className={className} {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
      {children}
      {isPdf && !quiet && <span className="visually-hidden"> {t('pdf')}</span>}
      {newTab && !quiet && <span className="visually-hidden"> {t('opensNewWindow')}</span>}
    </a>
  );
}
