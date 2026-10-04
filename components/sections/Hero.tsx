import Image from 'next/image';
import type { ReactNode } from 'react';
import type { Hero as HeroT } from '@/lib/content';
import { HeroVideo } from '@/components/client/HeroVideo';
import { RichText } from '@/components/ui/RichText';
import { Icon } from '@/components/ui/Icon';
import { mediaUrl } from '@/lib/media';
import { heroFocalStyle } from '@/config/art-direction';

interface Props {
  hero: HeroT;
  variant?: 'home' | 'page' | 'compact';
  crumbs?: ReactNode;
  actions?: ReactNode;
  /** practical info chip in the hero corner (home: opening hours) */
  hours?: { label: string; value: string }[];
}

/** Full-bleed hero. The still image is the LCP element; video (if any) layers in after load. */
export function Hero({ hero, variant = 'page', crumbs, actions, hours }: Props) {
  const image = hero.image ?? hero.video?.poster ?? undefined;
  const cls = ['hero', variant === 'page' ? 'hero--page' : '', variant === 'compact' ? 'hero--page hero--compact' : '', image ? '' : 'hero--plain'].join(' ');
  return (
    <section className={cls} aria-labelledby="page-title" style={heroFocalStyle(image?.src)}>
      {image && (
        <div className="hero__media">
          <Image src={image.src} alt={image.alt} fill priority fetchPriority="high" sizes="100vw" quality={60} />
        </div>
      )}
      {hours && hours.length > 0 && (
        <p className="hero__hours">
          {hours.map((h) => (
            <span key={h.label}>
              {h.label} <b>{h.value}</b>
            </span>
          ))}
        </p>
      )}
      {hero.video && <HeroVideo src={mediaUrl(hero.video.src)} poster={hero.video.poster?.src} />}
      <div className="container hero__inner">
        {crumbs}
        {hero.eyebrow && (
          <span className="eyebrow">
            <Icon name="wave" size={18} />
            {hero.eyebrow}
          </span>
        )}
        <h1 id="page-title">{hero.title}</h1>
        {hero.lead && <p className="lead">{hero.lead}</p>}
        {hero.intro?.map((p, i) => <RichText key={i} value={p} className="lead" />)}
        {actions && <div className="hero__ctas">{actions}</div>}
      </div>
    </section>
  );
}
