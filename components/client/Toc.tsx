'use client';

import { useEffect, useState } from 'react';

/** "On this page" navigation with scroll-spy. */
export function Toc({ items, label }: { items: { id: string; text: string }[]; label: string }) {
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-90px 0px -65% 0px' },
    );
    items.forEach((i) => { const el = document.getElementById(i.id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [items]);
  return (
    <nav className="toc" aria-label={label}>
      <p className="toc__title">{label}</p>
      <ol>
        {items.map((i) => (
          <li key={i.id}>
            <a href={`#${i.id}`} aria-current={active === i.id ? 'location' : undefined}>{i.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
