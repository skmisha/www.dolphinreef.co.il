import Image from 'next/image';
import { getLocale } from 'next-intl/server';
import { getSite } from '@/lib/content';
import { Link } from '@/i18n/navigation';
import { locales } from '@/config/i18n';
import { bookingTarget, bookingUrl, contact } from '@/config/links';
import { HeaderClient } from '@/components/client/HeaderClient';

/** Desktop shows the experience-focused subset; the drawer shows the full live menu. */
const PRIMARY = ['/experience-thereef', '/diving', '/swimming', '/stalbet', '/dining-at-thereef', '/events'];

export async function SiteHeader() {
  const locale = await getLocale();
  const site = await getSite(locale);
  const primary = PRIMARY.map((href) => site.nav.find((n) => n.href === href)).filter((n) => !!n);
  const brand = (
    <Link className="brand" href="/">
      <Image src={site.logo.src} alt={site.logo.alt} width={50} height={43} priority />
    </Link>
  );
  return (
    <HeaderClient
      nav={site.nav}
      primary={primary}
      brand={brand}
      bookHref={bookingUrl('default')}
      bookNewTab={bookingTarget === '_blank'}
      phone={contact.phone}
      locales={[...locales]}
    />
  );
}
