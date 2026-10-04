/**
 * Layout planner: turns a page's verbatim sections into presentational blocks (content is untouched).
 *  - runs of >= 3 short text-only sections   -> "cards" grid
 *  - a section with one image                 -> "split" (image + text)
 *  - a section with several images            -> "gallery" (bento) after its text
 *  - everything else                          -> "prose"
 */
import type { Section } from './types';

export type Block =
  | { kind: 'prose'; section: Section; index: number }
  | { kind: 'split'; section: Section; index: number; flip: boolean }
  | { kind: 'gallery'; section: Section; index: number }
  | { kind: 'cards'; sections: { section: Section; index: number }[] };

const textLen = (s: Section) => s.paragraphs.reduce((n, p) => n + p.text.length, 0);
const isShort = (s: Section) => !s.images?.length && !!s.heading && textLen(s) > 0 && textLen(s) <= 420 && s.paragraphs.length <= 3;

export function planBlocks(sections: Section[], { cards = true } = {}): Block[] {
  const blocks: Block[] = [];
  let run: { section: Section; index: number }[] = [];
  let splits = 0;
  const flush = () => {
    if (run.length >= 3) blocks.push({ kind: 'cards', sections: run });
    else run.forEach((r) => blocks.push({ kind: 'prose', ...r }));
    run = [];
  };
  sections.forEach((section, index) => {
    if (cards && isShort(section)) { run.push({ section, index }); return; }
    flush();
    const n = section.images?.length ?? 0;
    if (n === 1) blocks.push({ kind: 'split', section, index, flip: splits++ % 2 === 1 });
    else if (n > 1) blocks.push({ kind: 'gallery', section, index });
    else blocks.push({ kind: 'prose', section, index });
  });
  flush();
  return blocks;
}

export const sectionId = (index: number) => `section-${index + 1}`;
