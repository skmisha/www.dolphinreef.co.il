import type { ReactNode } from 'react';
import type { RichText as RichTextT } from '@/lib/content';
import { SmartLink } from './SmartLink';

/** Renders a paragraph whose `links` mark verbatim substrings of `text` as anchors. */
export function RichText({ value, as: Tag = 'p', className }: { value: RichTextT; as?: 'p' | 'span' | 'li'; className?: string }) {
  const { text, links = [] } = value;
  const parts: ReactNode[] = [];
  let rest = text;
  let key = 0;
  for (const link of links) {
    const i = rest.indexOf(link.text);
    if (i < 0) continue;
    if (i > 0) parts.push(rest.slice(0, i));
    parts.push(
      <SmartLink key={key++} href={link.href}>
        {link.text}
      </SmartLink>,
    );
    rest = rest.slice(i + link.text.length);
  }
  if (rest) parts.push(rest);
  return <Tag className={className ? `rich ${className}` : 'rich'}>{parts}</Tag>;
}
