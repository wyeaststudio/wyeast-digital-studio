import { afterEach, describe, expect, it, vi } from 'vitest';
import { withStega } from '@/test-utils/stega';
import { sanityFetch, sanityFetchPublished } from '../fetch';
import { getHomeFaqs, getOgTitle, getRoutableDocs, getSiteSeo } from './seo';

vi.mock('../fetch', () => ({ sanityFetch: vi.fn(), sanityFetchPublished: vi.fn() }));

const mockFetch = vi.mocked(sanityFetch);
const mockPublishedFetch = vi.mocked(sanityFetchPublished);

describe('SEO loaders [SEO-R6, R15, R18]', () => {
  afterEach(() => vi.restoreAllMocks());

  it('getSiteSeo uses the siteSettings tag and strips stega', async () => {
    const stega = withStega('Wy’east Digital Studio');
    expect(stega).not.toBe('Wy’east Digital Studio');
    mockFetch.mockResolvedValueOnce({ siteName: stega });
    await expect(getSiteSeo()).resolves.toEqual({ siteName: 'Wy’east Digital Studio' });
    expect(mockFetch).toHaveBeenCalledWith(expect.objectContaining({ tags: ['siteSettings'] }));
  });

  it('getRoutableDocs includes page documents with collection tags and cleans stega [PB-R5]', async () => {
    mockFetch.mockResolvedValueOnce([{ _type: 'page', slug: 'about', title: withStega('About') }]);
    await expect(getRoutableDocs()).resolves.toEqual([{ _type: 'page', slug: 'about', title: 'About' }]);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ params: { types: ['page'] }, tags: ['siteSettings', 'page'] }),
    );
  });

  it('getSiteSeo can fetch published settings without the draft-aware loader [SEO-R9]', async () => {
    mockFetch.mockClear();
    mockPublishedFetch.mockResolvedValueOnce({ siteName: withStega('Published studio') });
    await expect(getSiteSeo({ publishedOnly: true })).resolves.toEqual({ siteName: 'Published studio' });
    expect(mockPublishedFetch).toHaveBeenCalledWith(expect.objectContaining({ tags: ['siteSettings'] }));
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('getOgTitle uses published content, tags the type and slug, and cleans the title [SEO-R9]', async () => {
    mockFetch.mockClear();
    mockPublishedFetch.mockResolvedValueOnce({ title: withStega('Web design') });
    await expect(getOgTitle('service', 'web-design')).resolves.toBe('Web design');
    expect(mockPublishedFetch).toHaveBeenCalledWith(
      expect.objectContaining({ params: { type: 'service', slug: 'web-design' }, tags: ['service', 'service:web-design'] }),
    );
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('getOgTitle returns null for a missing document', async () => {
    mockPublishedFetch.mockResolvedValueOnce(null);
    await expect(getOgTitle('service', 'nope')).resolves.toBeNull();
  });

  it('getHomeFaqs keeps stega for Visual Editing and uses the faq tag', async () => {
    const question = withStega('How long does a project take?');
    mockFetch.mockResolvedValueOnce([{ _id: 'faq-1', question, answer: null }]);
    await expect(getHomeFaqs()).resolves.toEqual([{ _id: 'faq-1', question, answer: null }]);
    expect(mockFetch).toHaveBeenCalledWith(expect.objectContaining({ tags: ['faq'] }));
  });

  it('returns null or [] instead of throwing when Sanity is unreachable', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch.mockRejectedValue(new Error('network down'));
    mockPublishedFetch.mockRejectedValue(new Error('network down'));
    await expect(getSiteSeo()).resolves.toBeNull();
    await expect(getSiteSeo({ publishedOnly: true })).resolves.toBeNull();
    await expect(getRoutableDocs()).resolves.toEqual([]);
    await expect(getOgTitle('service', 'x')).resolves.toBeNull();
    await expect(getHomeFaqs()).resolves.toEqual([]);
    mockFetch.mockReset();
    mockPublishedFetch.mockReset();
  });
});
