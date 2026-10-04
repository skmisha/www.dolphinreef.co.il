import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import type { Link as LinkT, RichText as RichTextT, Section } from '@/lib/content';
import { planBlocks, sectionId, type Block } from '@/lib/content/blocks';
import { RichText } from '@/components/ui/RichText';
import { SmartLink } from '@/components/ui/SmartLink';
import { Icon } from '@/components/ui/Icon';
import { Toc } from '@/components/client/Toc';
import { bookingTarget, bookingUrl, contact } from '@/config/links';

const Heading = ({ section, index, as: H = 'h2' }: { section: Section; index: number; as?: 'h2' | 'h3' }) =>
  section.heading ? <H id={sectionId(index)}>{section.heading}</H> : null;

function Paras({ section }: { section: Section }) {
  return <>{section.paragraphs.map((p, i) => <RichText key={i} value={p} />)}</>;
}

function BlockView({ block, legal }: { block: Block; legal?: boolean }) {
  switch (block.kind) {
    case 'cards':
      return (
        <div className="info-grid reveal">
          {block.sections.map(({ section, index }, n) => (
            <section key={index} className="info-card" aria-labelledby={sectionId(index)}>
              <span className="info-card__num" aria-hidden="true">{String(n + 1).padStart(2, '0')}</span>
              <Heading section={section} index={index} as="h3" />
              <Paras section={section} />
            </section>
          ))}
        </div>
      );
    case 'split': {
      const im = block.section.images![0];
      return (
        <section className={`split-block reveal${block.flip ? ' split-block--flip' : ''}`} aria-labelledby={block.section.heading ? sectionId(block.index) : undefined}>
          <div className="split-block__text">
            <Heading section={block.section} index={block.index} />
            <Paras section={block.section} />
          </div>
          <figure className="split-block__media">
            <Image src={im.src} alt={im.alt} width={im.width} height={im.height} sizes="(min-width: 1024px) 420px, 100vw" quality={60} />
          </figure>
        </section>
      );
    }
    case 'gallery': {
      const imgs = block.section.images!;
      return (
        <section className="article-section reveal" aria-labelledby={block.section.heading ? sectionId(block.index) : undefined}>
          <Heading section={block.section} index={block.index} />
          <Paras section={block.section} />
          <div className={`bento${imgs.length > 6 ? ' bento--many' : ''}`}>
            {imgs.map((im, i) => (
              <figure key={im.src} className={i === 0 ? 'bento__hero' : undefined}>
                <Image src={im.src} alt={im.alt} width={im.width} height={im.height} sizes={i === 0 ? '(min-width: 1024px) 560px, 100vw' : '(min-width: 1024px) 270px, 50vw'} quality={60} />
              </figure>
            ))}
          </div>
        </section>
      );
    }
    default:
      return (
        <section className={`article-section reveal${legal ? ' article-section--legal' : ''}`} aria-labelledby={block.section.heading ? sectionId(block.index) : undefined}>
          <Heading section={block.section} index={block.index} />
          <Paras section={block.section} />
        </section>
      );
  }
}

/** contact links (tel/mailto) found in the page's own content, shown in the side rail */
function contactLinks(sections: Section[], intro: RichTextT[] = []): LinkT[] {
  const all = [...intro, ...sections.flatMap((s) => s.paragraphs)].flatMap((p) => p.links ?? []);
  const seen = new Set<string>();
  return all.filter((l) => /^(mailto|tel):/.test(l.href) && !seen.has(l.href.split('?')[0]) && seen.add(l.href.split('?')[0]));
}

export async function Article({ sections, intro, legal, extra }: { sections: Section[]; intro?: RichTextT[]; legal?: boolean; extra?: React.ReactNode }) {
  const t = await getTranslations();
  const blocks = planBlocks(sections, { cards: !legal });
  const toc = sections.map((s, i) => ({ id: sectionId(i), text: s.heading })).filter((x) => x.text);
  const contacts = contactLinks(sections, intro);
  const target = bookingTarget === '_blank' ? { target: '_blank', rel: 'noopener' } : {};
  return (
    <div className="article-layout container">
      <div className={`article${legal ? ' article--legal' : ''}`}>
        {intro && intro.length > 0 && (
          <div className="article-intro reveal">
            {intro.map((p, i) => <RichText key={i} value={p} />)}
          </div>
        )}
        {blocks.map((b, i) => <BlockView key={i} block={b} legal={legal} />)}
        {extra}
      </div>
      <aside className="rail" aria-label={t('article.onThisPage')}>
        {toc.length >= 3 && <Toc items={toc} label={t('article.onThisPage')} />}
        <div className="rail-card">
          <p className="rail-card__title">{t('article.contact')}</p>
          <ul className="rail-links">
            {(contacts.length ? contacts : [{ text: contact.phone.display, href: contact.phone.href }, { text: contact.email.display, href: contact.email.href }]).map((l) => (
              <li key={l.href}>
                <SmartLink href={l.href}>
                  <Icon name={l.href.startsWith('tel:') ? 'phone' : 'mail'} size={18} />
                  <span>{l.text}</span>
                </SmartLink>
              </li>
            ))}
            <li>
              <SmartLink href={contact.whatsapp.href}>
                <Icon name="whatsapp" size={18} />
                <span>WhatsApp</span>
              </SmartLink>
            </li>
          </ul>
        </div>
        {!legal && (
          <div className="rail-card rail-card--cta">
            <p className="rail-card__title">{t('article.bookTitle')}</p>
            <p>{t('article.bookText')}</p>
            <a className="btn btn--book" href={bookingUrl('default')} {...target}>{t('cta.book')}</a>
          </div>
        )}
      </aside>
    </div>
  );
}
