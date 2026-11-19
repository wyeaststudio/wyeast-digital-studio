import { describe, expect, it } from 'vitest';
import { withStega } from '@/test-utils/stega';
import type { RoutableDoc } from '@/sanity/loaders/seo';
import { buildLlmsTxt } from './llms-txt';
import { absoluteUrl, resolveSite } from './site';

const routes = { page: '/services/' };

const doc = (overrides: Partial<RoutableDoc>): RoutableDoc => ({
  _type: 'page',
  slug: 'web-design',
  _updatedAt: '2026-11-01T00:00:00Z',
  title: 'Web design',
  description: 'Fast, accessible sites.',
  ...overrides,
});

describe('buildLlmsTxt [SEO-R17]', () => {
  it('renders the home page only when there are no documents', () => {
    const site = resolveSite(null);
    const text = buildLlmsTxt({ site, docs: [] });

    expect(text.startsWith('# ')).toBe(true);
    expect(text).toContain(`# ${site.siteName}\n\n> ${site.businessDescription}\n\n`);
    expect(text).toContain('## Pages\n\n');
    expect(text).toContain(`- [Home](${absoluteUrl('/')}): ${site.description}`);
    expect(text.endsWith('\n') && !text.endsWith('\n\n')).toBe(true);
  });

  it('lists registered documents with absolute URLs and descriptions', () => {
    const text = buildLlmsTxt({
      site: resolveSite(null),
      docs: [doc({}), doc({ slug: 'seo', title: null, description: null }), doc({ slug: null })],
      routes,
    });

    expect(text).toContain(`- [Web design](${absoluteUrl('/services/web-design')}): Fast, accessible sites.`);
    expect(text).toContain(`- [seo](${absoluteUrl('/services/seo')})\n`);
    expect(text.match(/^- \[/gm)).toHaveLength(3);
  });

  it('omits documents whose type has no registered path', () => {
    const text = buildLlmsTxt({ site: resolveSite(null), docs: [doc({})], routes: {} });
    expect(text).not.toContain('web-design');
  });

  it('includes the service area and contact details when present', () => {
    const site = resolveSite({
      siteName: 'Wy',
      email: 'hi@example.com',
      phone: '503-555-0100',
      serviceArea: 'Portland metro',
    } as Parameters<typeof resolveSite>[0]);
    const text = buildLlmsTxt({ site, docs: [] });

    expect(text).toContain('Service area: Portland metro. Contact: hi@example.com, 503-555-0100.');
  });

  it('escapes Markdown special characters in titles', () => {
    const text = buildLlmsTxt({
      site: resolveSite(null),
      docs: [doc({ title: 'Ratio [1] *bold* _it_ `code` a\\b' })],
      routes,
    });

    expect(text).toContain('- [Ratio \\[1\\] \\*bold\\* \\_it\\_ \\`code\\` a\\\\b](');
  });

  it('removes stega metadata from document strings', () => {
    const text = buildLlmsTxt({
      site: resolveSite(null),
      docs: [doc({ title: withStega('Web design'), description: withStega('Fast sites.') })],
      routes,
    });

    expect(text).toContain(`- [Web design](${absoluteUrl('/services/web-design')}): Fast sites.`);
    expect(text).not.toMatch(/[\u200B-\u200F\u2060-\u206F\uFEFF]/);
  });
});
