import { describe, expect, it } from 'vitest';
import type { RoutableDoc } from '@/sanity/loaders/seo';
import { absoluteUrl } from './site';
import { buildSitemap } from './sitemap';

const routes = { service: '/services/' };

const doc = (overrides: Partial<RoutableDoc>): RoutableDoc => ({
  _type: 'service',
  slug: 'web-design',
  _updatedAt: '2026-11-01T00:00:00Z',
  title: 'Web design',
  description: null,
  ...overrides,
});

describe('buildSitemap [SEO-R14]', () => {
  it('lists only the home page when there are no documents and no settings update', () => {
    expect(buildSitemap([], null)).toEqual([{ url: absoluteUrl('/'), changeFrequency: 'monthly', priority: 1 }]);
  });

  it('adds registered documents with absolute URLs and their last update, after the home page', () => {
    const sitemap = buildSitemap(
      [doc({ slug: 'web-design' }), doc({ slug: 'seo', _updatedAt: '2026-11-05T00:00:00Z' })],
      '2026-11-10T00:00:00Z',
      routes,
    );

    expect(sitemap).toEqual([
      { url: absoluteUrl('/'), lastModified: '2026-11-10T00:00:00Z', changeFrequency: 'monthly', priority: 1 },
      { url: absoluteUrl('/services/web-design'), lastModified: '2026-11-01T00:00:00Z', priority: 0.8 },
      { url: absoluteUrl('/services/seo'), lastModified: '2026-11-05T00:00:00Z', priority: 0.8 },
    ]);
    expect(sitemap[1].url).toMatch(/^https?:\/\//);
  });

  it('skips documents whose type is not registered', () => {
    const sitemap = buildSitemap([doc({ _type: 'post', slug: 'hello' })], null, routes);

    expect(sitemap.map((entry) => entry.url)).toEqual([absoluteUrl('/')]);
  });

  it('dedupes entries that resolve to the same URL', () => {
    const sitemap = buildSitemap([doc({}), doc({})], null, routes);

    expect(sitemap).toHaveLength(2);
  });
});
