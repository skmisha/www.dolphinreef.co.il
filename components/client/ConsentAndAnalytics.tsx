'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

const KEY = 'cookie-consent'; // "granted" | "denied"

interface Ids { gaId: string; gtmId: string; metaPixelId: string }

/**
 * Cookie consent banner + analytics placeholder. Analytics scripts load only after "accept"
 * and only for IDs provided via env vars (none exist on the live site today).
 */
export function ConsentAndAnalytics({ ids }: { ids: Ids }) {
  const t = useTranslations('cookies');
  const [consent, setConsent] = useState<string | null>('pending');

  useEffect(() => {
    try { setConsent(localStorage.getItem(KEY)); } catch { setConsent(null); }
  }, []);

  const decide = (v: 'granted' | 'denied') => {
    setConsent(v);
    try { localStorage.setItem(KEY, v); } catch { /* ignore */ }
  };

  return (
    <>
      {consent === null && (
        <section className="consent" role="region" aria-labelledby="consent-title">
          <h2 id="consent-title">{t('title')}</h2>
          <p>
            {t('text')} <Link href="/privacypolicy">{t('policy')}</Link>
          </p>
          <div className="consent__actions">
            <button className="btn btn--book" onClick={() => decide('granted')}>{t('accept')}</button>
            <button className="btn btn--ghost" style={{ color: '#fff' }} onClick={() => decide('denied')}>{t('reject')}</button>
          </div>
        </section>
      )}
      {consent === 'granted' && <Analytics ids={ids} />}
    </>
  );
}

function Analytics({ ids }: { ids: Ids }) {
  return (
    <>
      {ids.gtmId && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${ids.gtmId}');`}
        </Script>
      )}
      {ids.gaId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ids.gaId}`} strategy="afterInteractive" />
          <Script id="ga" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ids.gaId}',{anonymize_ip:true});`}
          </Script>
        </>
      )}
      {ids.metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${ids.metaPixelId}');fbq('track','PageView');`}
        </Script>
      )}
    </>
  );
}
