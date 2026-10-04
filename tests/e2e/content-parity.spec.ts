import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';
import { dismissConsent } from './helpers';

/**
 * "No content lost": every heading, paragraph, FAQ question and answer extracted from the live site in
 * Phase 1 (audit/extracted/he) must appear verbatim in the rendered page (all accordions expanded).
 * Known, intentional differences are listed with a reason.
 */
const EXTRACTED = path.resolve('audit/extracted/he');
const ROUTE: Record<string, string> = { home: '/', 'menu-bar': '/dining-at-thereef/menu-bar', 'menu-stalbet': '/dining-at-thereef/menu-stalbet' };
const INTENTIONAL: Record<string, string> = {
  'להזמנה': 'booking heading became the booking button (ui.json cta.book, same words)',
  'בואו נתחיל': 'hero CTA (rendered as button)',
  'להתחלת החוויה': 'decorative Wix button linking to "/" (the home page itself)',
  'לחיצה על המספר המופיע במפה תפתח תיאור והסבר קצר על האזור שנבחר.': 'rendered as the map section heading',
  'התמונות שוות אלף מילים...': 'gallery intro; albums rendered as link list',
};
const norm = (s: string) => s.replace(/[​‎‏ ]/g, ' ').replace(/\s+/g, ' ').trim();

const files = fs.readdirSync(EXTRACTED).filter((f) => f.endsWith('.json') && f !== 'site.json');

for (const f of files) {
  const name = f.slice(0, -5);
  const route = ROUTE[name] ?? `/${name}`;
  test(`no content lost: ${route}`, async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'text parity is viewport independent');
    await dismissConsent(page);
    await page.goto(route);
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.querySelectorAll('details').forEach((d) => (d.open = true)));
    // drop screen-reader-only suffixes ("(PDF)", "opens in new window") so visible text is compared
    await page.evaluate(() => document.querySelectorAll('.visually-hidden').forEach((e) => e.remove()));
    const rendered = norm(await page.locator('body').innerText()) + ' ' + norm((await page.locator('[aria-label]').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')).join(' '))));
    const d = JSON.parse(fs.readFileSync(path.join(EXTRACTED, f), 'utf8'));
    const expected: string[] = [];
    if (d.sections?.[0]?.groups) {
      // menus: every section title, item, description, price, note and footer line
      for (const s of d.sections) {
        expected.push(s.title, s.note);
        for (const g of s.groups) { expected.push(g.title, ...(g.notes ?? []), ...(g.list ?? [])); for (const it of g.items) expected.push(it.name, it.description, it.price); }
      }
      expected.push(...(d.footer ?? []));
    } else {
      for (const s of d.sections) expected.push(s.heading, ...s.paragraphs);
      for (const q of d.faq ?? []) expected.push(q.question, ...q.answer);
    }
    const missing = expected
      .map(norm)
      .filter((t) => t && !INTENTIONAL[t])
      .filter((t) => !rendered.includes(t.replace(/ עוד\.\.\.$/, '')));
    expect(missing, `missing on ${route}:\n${missing.join('\n')}`).toEqual([]);
  });
}
