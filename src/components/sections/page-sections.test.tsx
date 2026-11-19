import { render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createDataAttribute } from 'next-sanity';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { pageBuilderFixtures } from '@/test-utils/page-builder';
import { faqPageForSections } from '@/lib/seo/json-ld';
import { PageSections } from './page-sections';
import type { PageSection } from './types';

let fixtures: Awaited<ReturnType<typeof pageBuilderFixtures>>;
beforeAll(async () => { fixtures = await pageBuilderFixtures(); });
afterEach(() => vi.restoreAllMocks());

const renderPage = (sections: readonly PageSection[] | null) => render(
  <PageSections sections={sections} title="Demo page" documentId="demo" documentType="page" />,
);

describe('PageSections [PB-R7, PB-R8, PB-R9, PB-R18, PB-R22, PB-R23]', () => {
  it('renders all eight seeded blocks in order and produces server-only HTML with one h1', () => {
    const { container } = renderPage(fixtures.demo.sections);
    const sections = [...container.querySelectorAll('section')];
    expect(sections).toHaveLength(8);
    expect(sections.map((section) => section.getAttribute('data-sanity'))).toEqual(fixtures.demo.sections!.map((section) =>
      createDataAttribute({ id: 'demo', type: 'page', projectId: 'test1234', dataset: 'production', baseUrl: '/studio' })(['sections', { _key: section._key }]),
    ));
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    const levels = [...container.querySelectorAll('h1,h2,h3,h4')].map((heading) => Number(heading.tagName.slice(1)));
    levels.slice(1).forEach((level, index) => expect(level).toBeLessThanOrEqual(levels[index] + 1));
    const html = renderToStaticMarkup(
      <PageSections sections={fixtures.demo.sections} title="Demo" documentId="demo" documentType="page" />,
    );
    expect(html).toContain('<figure');
    expect(html).toContain('<details');
    expect(html).not.toContain('<script');
  });

  it('renders the six Home blocks with the hero h1 and question order matching JSON-LD', () => {
    const { container } = renderPage(fixtures.home.sections);
    expect(container.querySelectorAll('section')).toHaveLength(6);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Where Vision Meets the Summit');
    expect([...container.querySelectorAll('summary')].map((node) => node.textContent)).toEqual(
      faqPageForSections(fixtures.home.sections)?.mainEntity.map((question) => question.name),
    );
  });

  it('skips unknown, incomplete and misplaced blocks, while supplying one fallback h1', () => {
    const log = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const valid = fixtures.demo.sections!;
    const hero = valid[0];
    if (hero._type !== 'heroSection') throw new Error('Expected seeded hero');
    const sections: PageSection[] = [
      // @ts-expect-error Future CMS types must not break the renderer.
      { _type: 'futureSection', _key: 'unknown' },
      { ...hero, _key: 'incomplete', heading: null },
      hero,
      valid[1],
    ];
    const { container } = renderPage(sections);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Demo page');
    expect(container.querySelectorAll('section')).toHaveLength(1);
    expect(log).toHaveBeenCalledTimes(3);
  });

  it('skips a hero missing its required image rather than losing the page h1', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const first = fixtures.demo.sections![0];
    if (first._type !== 'heroSection') throw new Error('Expected seeded hero');
    renderPage([{ ...first, image: null }, ...fixtures.demo.sections!.slice(1)]);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Demo page');
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it.each([
    { heading: null, styles: ['h3', 'h4', 'h3'] as const, expected: [1, 2, 3, 2] },
    { heading: null, styles: ['h4', 'h4', 'h3', 'h4'] as const, expected: [1, 2, 2, 2, 3] },
    { heading: 'Details', styles: ['h3', 'h4', 'h3'] as const, expected: [1, 2, 3, 4, 3] },
    { heading: 'Details', styles: ['h4', 'h4', 'h3', 'h4'] as const, expected: [1, 2, 3, 3, 3, 4] },
  ])('normalizes editor-created prose $styles with section heading $heading [PB-R9, PB-R19]', ({ heading, styles, expected }) => {
    const section = fixtures.demo.sections!.find((item) => item._type === 'richTextSection');
    if (!section) throw new Error('Expected seeded rich text');
    const { container } = renderPage([{
      ...section,
      heading,
      body: styles.map((style, index) => ({
        _type: 'block', _key: String(index), style, markDefs: [],
        children: [{ _type: 'span', _key: 'text', text: `Body heading ${index}`, marks: [] }],
      })),
    }]);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect([...container.querySelectorAll('h1,h2,h3,h4')].map((node) => Number(node.tagName.slice(1)))).toEqual(expected);
    expect(screen.getByText('Body heading 0')).toHaveClass(styles[0] === 'h4' ? 'text-xl' : 'text-2xl');
  });

  it('handles empty content with the page title', () => {
    renderPage(null);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Demo page');
  });

  it('skips missing required content for each block without throwing', () => {
    const log = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const incomplete = fixtures.demo.sections!.map((section): PageSection => {
      switch (section._type) {
        case 'heroSection': return { ...section, image: null };
        case 'trustBarSection': return { ...section, items: null };
        case 'featureGridSection': return { ...section, cards: null };
        case 'ctaBannerSection': return { ...section, cta: null };
        case 'processStepsSection': return { ...section, steps: null };
        case 'faqSection': return { ...section, items: null };
        case 'richTextSection': return { ...section, body: null };
        case 'testimonialsSection': return { ...section, items: null };
      }
    });
    const { container } = renderPage(incomplete);
    expect(container.querySelector('section')).toBeNull();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Demo page');
    expect(log).toHaveBeenCalledTimes(8);
  });
});
