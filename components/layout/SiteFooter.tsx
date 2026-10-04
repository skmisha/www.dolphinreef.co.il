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
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Image src={site.logo.src} alt={site.logo.alt} width={64} height={55} />
            <h2 className="visually-hidden">{t('contact')}</h2>
            <ul className="footer-contact">
              <li>
                <a className="pill" href={contact.phone.href}><Icon name="phone" size={18} />{site.footer.phoneLabel}</a>
              </li>
              <li>
                <a className="pill" href={contact.email.href}><Icon name="mail" size={18} />{contact.email.display}</a>
              </li>
            </ul>
            <ul className="social" aria-label={t('social')}>
              {social.map((s) => (
                <li key={s.id}>
                  <SmartLink href={s.href} aria-label={s.label} quiet>
                    <Icon name={s.id as IconName} size={20} />
                  </SmartLink>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-cols">
            {site.footer.columns.map((col, i) => (
              <nav key={col.titleKey} aria-labelledby={`fcol-${i}`} className="footer-col">
                <h2 id={`fcol-${i}`}>{t(col.titleKey.replace('footer.', ''))}</h2>
                <ul>
                  {col.items.map((href) => (
                    <li key={href}>
                      <SmartLink href={href}>{titles[href]}</SmartLink>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <div className="footer-legal">
          <span>{t('copyright')}</span>
          <SmartLink href="/privacypolicy">{site.footer.privacyLabel}</SmartLink>
        </div>
      </div>
    </footer>
  );
}
