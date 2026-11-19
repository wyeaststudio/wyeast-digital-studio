import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { getHomePage, getPage, getPageSlugs } from '@/sanity/loaders/pages';
import { getRoutableDocs, getSiteSeo } from '@/sanity/loaders/seo';
import { absoluteUrl, SITE_DEFAULTS } from '@/lib/seo/site';
import { pageBuilderFixtures } from '@/test-utils/page-builder';
import HomePage, { generateMetadata as homeMetadata } from './page';
import Page, { generateMetadata as pageMetadata, generateStaticParams } from './[slug]/page';
import sitemap from '../sitemap';
import { GET as llmsTxt } from '../llms.txt/route';

vi.mock('@/sanity/loaders/pages', () => ({ getHomePage: vi.fn(), getPage: vi.fn(), getPageSlugs: vi.fn() }));
vi.mock('@/sanity/loaders/seo', () => ({ getSiteSeo: vi.fn(), getRoutableDocs: vi.fn() }));
vi.mock('next/navigation', () => ({ notFound: () => { throw new Error('NEXT_NOT_FOUND'); } }));

let fixtures: Awaited<ReturnType<typeof pageBuilderFixtures>>;
const props = (slug = 'page-builder-demo') => ({ params: Promise.resolve({ slug }) });

beforeAll(async () => { fixtures = await pageBuilderFixtures(); });
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getHomePage).mockResolvedValue(fixtures.home);
  vi.mocked(getPage).mockResolvedValue(fixtures.demo);
  vi.mocked(getSiteSeo).mockResolvedValue(null);
  vi.mocked(getRoutableDocs).mockResolvedValue([]);
});

describe('builder routes [PB-R2, R3, R4, R5, R6, R18]', () => {
  it('renders seeded Home and demo sections with one h1 and one FAQPage each', async () => {
    for (const element of [await HomePage(), await Page(props())]) {
      const html = renderToStaticMarkup(element);
      expect(html.match(/<h1\b/g)).toHaveLength(1);
      expect(html.match(/"@type":"FAQPage"/g)).toHaveLength(1);
      expect(html).toContain('<summary');
      expect(html.indexOf('hero-heading')).toBeLessThan(html.indexOf('trust'));
    }
    expect(getPage).toHaveBeenCalledWith('page-builder-demo');
  });

  it('uses Home SEO overrides but retains the site-settings home title', async () => {
    vi.mocked(getHomePage).mockResolvedValue({
      ...fixtures.home,
      seo: { _type: 'seo', title: 'Ignored Home title', description: 'Home description override', noindex: true },
    });
    const metadata = await homeMetadata();
    expect(metadata.title).toMatchObject({ absolute: SITE_DEFAULTS.homeTitle });
    expect(metadata.description).toBe('Home description override');
    expect(metadata.robots).toMatchObject({ index: false });
  });

  it('uses the document SEO, canonical, and noindex on the demo page', async () => {
    const metadata = await pageMetadata(props());
    expect(metadata.title).toMatchObject({ absolute: expect.stringContaining('Page builder demo') });
    expect(metadata.alternates?.canonical).toMatch(/\/page-builder-demo$/);
    expect(metadata.robots).toMatchObject({ index: false });
  });

  it('hides and restores Home in both crawler outputs without removing other pages [PB-R5, PB-R6]', async () => {
    vi.mocked(getRoutableDocs).mockResolvedValue([{
      _type: 'page', slug: 'about', title: 'About', description: null, _updatedAt: '2026-11-18T00:00:00Z',
    }]);
    for (const noindex of [false, true, false]) {
      vi.mocked(getHomePage).mockResolvedValue({ ...fixtures.home, seo: { _type: 'seo', noindex } });
      const urls = (await sitemap()).map((entry) => entry.url);
      expect(getHomePage).toHaveBeenLastCalledWith({ publishedOnly: true });
      const response = await llmsTxt();
      const text = await response.text();
      expect(getHomePage).toHaveBeenLastCalledWith({ publishedOnly: true });
      expect(urls.includes(absoluteUrl('/'))).toBe(!noindex);
      expect(text.includes(`- [Home](${absoluteUrl('/')})`)).toBe(!noindex);
      expect(urls).toContain(absoluteUrl('/about'));
      expect(text).toContain(`- [About](${absoluteUrl('/about')})`);
      expect(response.headers.get('Content-Type')).toBe('text/plain; charset=utf-8');
    }
  });

  it('provides a fallback Home h1 when the singleton is missing', async () => {
    vi.mocked(getHomePage).mockResolvedValue(null);
    const html = renderToStaticMarkup(await HomePage());
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).not.toContain('FAQPage');
  });

  it('prerenders published slugs and provides the Cache Components placeholder on an empty dataset', async () => {
    vi.mocked(getPageSlugs).mockResolvedValueOnce(['one', 'two']).mockResolvedValueOnce([]);
    expect(await generateStaticParams()).toEqual([{ slug: 'one' }, { slug: 'two' }]);
    expect(await generateStaticParams()).toEqual([{ slug: '__placeholder__' }]);
    await expect(Page(props('__placeholder__'))).rejects.toThrow('NEXT_NOT_FOUND');
    expect(getPage).not.toHaveBeenCalled();
  });

  it('returns not found from both rendering and metadata for a missing document', async () => {
    vi.mocked(getPage).mockResolvedValue(null);
    await expect(Page(props('missing'))).rejects.toThrow('NEXT_NOT_FOUND');
    await expect(pageMetadata(props('missing'))).rejects.toThrow('NEXT_NOT_FOUND');
  });
});
