import { beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { cacheLife, cacheTag } from 'next/cache';
import { draftMode } from 'next/headers';
import type { PAGE_SLUGS_QUERY_RESULT } from '../../sanity.types';
import { sanityFetch, sanityFetchPublished } from './fetch';
import { PAGE_SLUGS_QUERY } from './queries';

const { publishedFetch, withConfig } = vi.hoisted(() => ({ publishedFetch: vi.fn(), withConfig: vi.fn() }));

vi.mock('next/cache', () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));
vi.mock('next/headers', () => ({ draftMode: vi.fn() }));
vi.mock('./client', () => ({ client: { fetch: publishedFetch, withConfig } }));
vi.mock('./server-env', () => ({ getReadToken: () => 'test-token' }));

describe('sanityFetch typing [FOUND-R11]', () => {
  it('returns the TypeGen result type for a defineQuery query, not any', () => {
    type Result = Awaited<ReturnType<typeof sanityFetch<typeof PAGE_SLUGS_QUERY>>>;
    expectTypeOf<Result>().not.toBeAny();
    expectTypeOf<Result>().toEqualTypeOf<PAGE_SLUGS_QUERY_RESULT>();
    type PublishedResult = Awaited<ReturnType<typeof sanityFetchPublished<typeof PAGE_SLUGS_QUERY>>>;
    expectTypeOf<PublishedResult>().not.toBeAny();
    expectTypeOf<PublishedResult>().toEqualTypeOf<PAGE_SLUGS_QUERY_RESULT>();
  });
});

describe('published-only fetching [SEO-R9, R15]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('caches published content without reading draft mode or creating an authenticated client', async () => {
    vi.mocked(draftMode).mockResolvedValue({ isEnabled: true, enable: vi.fn(), disable: vi.fn() });
    publishedFetch.mockResolvedValueOnce(['published-page']);

    await expect(sanityFetchPublished({ query: PAGE_SLUGS_QUERY, tags: ['page'] })).resolves.toEqual([
      'published-page',
    ]);

    expect(publishedFetch).toHaveBeenCalledWith(PAGE_SLUGS_QUERY, {});
    expect(cacheTag).toHaveBeenCalledWith('page');
    expect(cacheLife).toHaveBeenCalledWith('max');
    expect(draftMode).not.toHaveBeenCalled();
    expect(withConfig).not.toHaveBeenCalled();
  });

  it('keeps preview fetching authenticated and draft-aware', async () => {
    const draftFetch = vi.fn().mockResolvedValue(['draft-page']);
    vi.mocked(draftMode).mockResolvedValue({ isEnabled: true, enable: vi.fn(), disable: vi.fn() });
    withConfig.mockReturnValueOnce({ fetch: draftFetch });

    await expect(sanityFetch({ query: PAGE_SLUGS_QUERY, tags: ['page'] })).resolves.toEqual(['draft-page']);

    expect(withConfig).toHaveBeenCalledWith(
      expect.objectContaining({ token: 'test-token', perspective: 'drafts' }),
    );
    expect(publishedFetch).not.toHaveBeenCalled();
    expect(cacheTag).not.toHaveBeenCalled();
  });
});
