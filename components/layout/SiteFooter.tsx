import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import { getPage, getSite } from '@/lib/content';
import { contact, social } from '@/config/links';
import { SmartLink } from '@/components/ui/SmartLink';
import { Icon, type IconName } from '@/components/ui/Icon';

export async function SiteFooter() {
  const locale = await getLocale();
  const t = await getTranslations('footer');
  const site = await getSite(locale);
  // label: nav label, else the target page's title
  const hrefs = site.footer.columns.flatMap((c) => c.items);
  const titles = Object.fromEntries(
    await Promise.all(hrefs.map(async (h) => [h, site.nav.find((n) => n.href === h)?.label ?? (await getPage(h, locale))?.hero.title ?? h] as const)),
  );
  const label = (href: string) => titles[href];
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Image src={site.logo.src} alt={site.logo.alt} width={64} height={55} style={{ marginBlockEnd: 'var(--space-4)' }} />
            <h2 className="visually-hidden">{t('contact')}</h2>
            <ul>
              <li><a href={contact.phone.href}>{site.footer.phoneLabel}</a></li>
              <li><a href={contact.email.href}>{contact.email.display}</a></li>
            </ul>
            <ul className="social" aria-label={t('social')} style={{ marginBlockStart: 'var(--space-4)' }}>
              {social.map((s) => (
                <li key={s.id}>
                  <SmartLink href={s.href} aria-label={s.label} quiet>
                    <Icon name={s.id as IconName} size={20} />
                  </SmartLink>
                </li>
              ))}
            </ul>
          </div>
          {site.footer.columns.map((col, i) => (
            <nav key={col.titleKey} aria-labelledby={`fcol-${i}`}>
              <h2 id={`fcol-${i}`}>{t(col.titleKey.replace('footer.', ''))}</h2>
              <ul>
                {col.items.map((href) => (
                  <li key={href}>
                    <SmartLink href={href}>{label(href)}</SmartLink>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="footer-legal">
          <span>{t('copyright')}</span>
          <SmartLink href="/privacypolicy">{site.footer.privacyLabel}</SmartLink>
        </div>
      </div>
    </footer>
  );
}
