import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { evaluate, parse } from 'groq-js';
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from '../../../sanity.types';
import { withStega } from '@/test-utils/stega';
import { sanityFetch, sanityFetchPublished } from '../fetch';
import { HOME_PAGE_QUERY, PAGE_QUERY, PAGE_SLUGS_QUERY } from '../queries';
import { getHomePage, getPage, getPageSlugs } from './pages';

vi.mock('../fetch', () => ({ sanityFetch: vi.fn(), sanityFetchPublished: vi.fn() }));
const mockFetch = vi.mocked(sanityFetch);

describe('page loaders [PB-R4, PB-R6, PB-R7]', () => {
  beforeEach(() => vi.resetAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('loads the home singleton with its reference tags and preserves click-to-edit strings', async () => {
    const heading = withStega('Where Vision Meets the Summit');
    const home = { _id: 'homePage', sections: [{ _type: 'heroSection', heading }] };
    mockFetch.mockResolvedValueOnce(home);
    await expect(getHomePage()).resolves.toEqual(home);
    expect(mockFetch).toHaveBeenCalledWith({
      query: HOME_PAGE_QUERY,
      tags: ['homePage', 'faq', 'testimonial'],
    });
  });

  it('uses the slug parameter, collection/detail tags, and reference tags', async () => {
    const page = { _id: 'about', title: withStega('About') };
    mockFetch.mockResolvedValueOnce(page);
    await expect(getPage('about')).resolves.toEqual(page);
    expect(mockFetch).toHaveBeenCalledWith({
      query: PAGE_QUERY,
      params: { slug: 'about' },
      tags: ['page', 'page:about', 'faq', 'testimonial'],
    });
  });

  it('uses published Home visibility and cache tags for crawlers, not the draft-aware fetch [PB-R5, PB-R6]', async () => {
    const publishedHome = { _id: 'homePage', seo: { _type: 'seo', noindex: true } };
    mockFetch.mockResolvedValue({ ...publishedHome, seo: { _type: 'seo', noindex: false } });
    vi.mocked(sanityFetchPublished).mockResolvedValueOnce(publishedHome);
    await expect(getHomePage({ publishedOnly: true })).resolves.toEqual(publishedHome);
    expect(sanityFetchPublished).toHaveBeenCalledWith({
      query: HOME_PAGE_QUERY,
      tags: ['homePage', 'faq', 'testimonial'],
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('loads build-time slugs with the collection tag', async () => {
    mockFetch.mockResolvedValueOnce(['about', 'page-builder-demo']);
    await expect(getPageSlugs()).resolves.toEqual(['about', 'page-builder-demo']);
    expect(mockFetch).toHaveBeenCalledWith({ query: PAGE_SLUGS_QUERY, tags: ['page'] });
  });

  it('preserves missing documents without creating fallback content', async () => {
    mockFetch.mockResolvedValue(null);
    await expect(getHomePage()).resolves.toBeNull();
    await expect(getPage('missing')).resolves.toBeNull();
  });

  it('logs failed requests and returns the approved null/empty results', async () => {
    const error = new Error('Sanity unavailable');
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch.mockRejectedValue(error);
    await expect(getHomePage()).resolves.toBeNull();
    await expect(getPage('about')).resolves.toBeNull();
    await expect(getPageSlugs()).resolves.toEqual([]);
    expect(log).toHaveBeenCalledWith('Failed to load the home page from Sanity', error);
    expect(log).toHaveBeenCalledWith('Failed to load page "about" from Sanity', error);
    expect(log).toHaveBeenCalledWith('Failed to load page slugs from Sanity', error);
  });

  it('keeps one discriminated section union shared by both queries [PB-R8]', () => {
    type HomeSection = NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>['sections']>[number];
    type PageSection = NonNullable<NonNullable<PAGE_QUERY_RESULT>['sections']>[number];
    expectTypeOf<HomeSection>().toEqualTypeOf<PageSection>();
    expectTypeOf<Extract<PageSection, { _type: 'heroSection' }>['heading']>().toEqualTypeOf<string | null>();
    expectTypeOf<Extract<PageSection, { _type: 'testimonialsSection' }>['items']>().not.toBeNever();
  });

  it.each([HOME_PAGE_QUERY, PAGE_QUERY])('omits denied, unconfirmed, and broken testimonial references [PB-R21]', async (query) => {
    const sections = [{
      _key: 'quotes',
      _type: 'testimonialsSection',
      items: ['allowed', 'denied', 'unconfirmed', 'missing'].map((_ref) => ({ _type: 'reference', _ref })),
    }];
    const result = await evaluate(parse(query), {
      params: { slug: 'demo' },
      dataset: [
        { _id: 'homePage', _type: 'homePage', sections },
        { _id: 'demo', _type: 'page', slug: { current: 'demo' }, sections },
        { _id: 'allowed', _type: 'testimonial', permission: true, quote: 'Approved example.', name: 'Example' },
        { _id: 'denied', _type: 'testimonial', permission: false },
        { _id: 'unconfirmed', _type: 'testimonial' },
      ],
    });
    expect(await result.get()).toMatchObject({
      sections: [{ items: [{ _id: 'allowed', quote: 'Approved example.', name: 'Example' }] }],
    });
  });
});
