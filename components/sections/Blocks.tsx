import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import type { FaqItem, Fact, Link as LinkT, Section } from '@/lib/content';
import { RichText } from '@/components/ui/RichText';
import { SmartLink } from '@/components/ui/SmartLink';
import { Icon } from '@/components/ui/Icon';
import { youtube } from '@/config/links';

export async function KeyFacts({ facts }: { facts: Fact[] }) {
  const t = await getTranslations();
  return (
    <section className="keyfacts" aria-label={t('facts.region')}>
      {facts.map((f) => (
        <div key={f.label} className="keyfact">
          <span className="keyfact__label">
            <Icon name={f.icon} size={16} />
            {t(f.label)}
          </span>
          <span className="keyfact__value">{f.value}</span>
          {f.sub && <span className="keyfact__sub">{f.sub}</span>}
        </div>
      ))}
    </section>
  );
}

export function Faq({ items, openFirst = true }: { items: FaqItem[]; openFirst?: boolean }) {
  return (
    <div className="faq">
      {items.map((item, i) => (
        <details key={item.question} open={openFirst && i === 0}>
          <summary>
            {item.question}
            <span className="pm" aria-hidden="true">
              <Icon name="plus" size={16} />
            </span>
          </summary>
          <div className="answer">
            {item.answer.map((a, j) => (
              <RichText key={j} value={a} />
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}

export async function VideoFacade({ id, poster, title }: { id: string; poster?: { src: string; width: number; height: number }; title: string }) {
  const t = await getTranslations();
  return (
    <a className="video-facade" href={youtube(id)} target="_blank" rel="noopener noreferrer" aria-label={`${t('video.watchLabel')}: ${title} ${t('a11y.opensNewWindow')}`}>
      {poster && <Image src={poster.src} alt="" width={poster.width} height={poster.height} sizes="(min-width: 1024px) 736px, 100vw" quality={60} />}
      <span className="play" aria-hidden="true">
        <Icon name="play" size={30} />
      </span>
      <span className="video-facade__label" aria-hidden="true">
        <Icon name="external" size={18} />
        {t('video.watchOnYoutube')}
      </span>
    </a>
  );
}

export function Callout({ title, children, warn }: { title: string; children: React.ReactNode; warn?: boolean }) {
  return (
    <div className={`callout${warn ? ' callout--warn' : ''}`}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}

export async function DocumentLinks({ docs }: { docs: LinkT[] }) {
  const t = await getTranslations('a11y');
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 'var(--space-2)' }}>
      {docs.map((d) => (
        <li key={d.href}>
          <SmartLink href={d.href}>
            <Icon name="file" size={16} style={{ verticalAlign: '-3px', marginInlineEnd: 6 }} />
            {d.text}
          </SmartLink>{' '}
          <span aria-hidden="true" style={{ color: 'var(--color-text-subtle)' }}>{t('pdf')}</span>
        </li>
      ))}
    </ul>
  );
}

/** Generic renderer for verbatim content sections from JSON. */
export function ContentSections({ sections }: { sections: Section[] }) {
  return (
    <div className="prose-page">
      {sections.map((s, i) => {
        const id = `s-${i}`;
        const imgs = s.images ?? [];
        return (
          <section key={id} aria-labelledby={s.heading ? id : undefined}>
            {s.heading && <h2 id={id}>{s.heading}</h2>}
            {s.paragraphs.map((p, j) => (
              <RichText key={j} value={p} />
            ))}
            {imgs.length === 1 && (
              <div className="section-figure">
                <Image src={imgs[0].src} alt={imgs[0].alt} width={imgs[0].width} height={imgs[0].height} sizes="(min-width: 768px) 736px, 100vw" quality={60} />
              </div>
            )}
            {imgs.length > 1 && (
              <div className="img-grid">
                {imgs.map((im) => (
                  <figure key={im.src}>
                    <Image src={im.src} alt={im.alt} width={im.width} height={im.height} sizes="(min-width: 768px) 245px, 50vw" quality={60} />
                  </figure>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
