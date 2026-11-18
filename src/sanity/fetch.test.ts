import { beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { cacheLife, cacheTag } from 'next/cache';
import { draftMode } from 'next/headers';
import type { PAGES_QUERY_RESULT } from '../../sanity.types';
import { sanityFetch, sanityFetchPublished } from './fetch';
import { PAGES_QUERY } from './queries';

const { publishedFetch, withConfig } = vi.hoisted(() => ({ publishedFetch: vi.fn(), withConfig: vi.fn() }));

vi.mock('next/cache', () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));
vi.mock('next/headers', () => ({ draftMode: vi.fn() }));
vi.mock('./client', () => ({ client: { fetch: publishedFetch, withConfig } }));
vi.mock('./server-env', () => ({ getReadToken: () => 'test-token' }));

describe('sanityFetch typing [FOUND-R11]', () => {
  it('returns the TypeGen result type for a defineQuery query, not any', () => {
    type Result = Awaited<ReturnType<typeof sanityFetch<typeof PAGES_QUERY>>>;
    expectTypeOf<Result>().not.toBeAny();
    expectTypeOf<Result>().toEqualTypeOf<PAGES_QUERY_RESULT>();
    type PublishedResult = Awaited<ReturnType<typeof sanityFetchPublished<typeof PAGES_QUERY>>>;
    expectTypeOf<PublishedResult>().not.toBeAny();
    expectTypeOf<PublishedResult>().toEqualTypeOf<PAGES_QUERY_RESULT>();
  });
});

describe('published-only fetching [SEO-R9, R15]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('caches published content without reading draft mode or creating an authenticated client', async () => {
    vi.mocked(draftMode).mockResolvedValue({ isEnabled: true, enable: vi.fn(), disable: vi.fn() });
    publishedFetch.mockResolvedValueOnce([{ _id: 'published-page' }]);

    await expect(sanityFetchPublished({ query: PAGES_QUERY, tags: ['page'] })).resolves.toEqual([
      { _id: 'published-page' },
    ]);

    expect(publishedFetch).toHaveBeenCalledWith(PAGES_QUERY, {});
    expect(cacheTag).toHaveBeenCalledWith('page');
    expect(cacheLife).toHaveBeenCalledWith('max');
    expect(draftMode).not.toHaveBeenCalled();
    expect(withConfig).not.toHaveBeenCalled();
  });

  it('keeps preview fetching authenticated and draft-aware', async () => {
    const draftFetch = vi.fn().mockResolvedValue([{ _id: 'drafts.page' }]);
    vi.mocked(draftMode).mockResolvedValue({ isEnabled: true, enable: vi.fn(), disable: vi.fn() });
    withConfig.mockReturnValueOnce({ fetch: draftFetch });

    await expect(sanityFetch({ query: PAGES_QUERY, tags: ['page'] })).resolves.toEqual([{ _id: 'drafts.page' }]);

    expect(withConfig).toHaveBeenCalledWith(
      expect.objectContaining({ token: 'test-token', perspective: 'drafts' }),
    );
    expect(publishedFetch).not.toHaveBeenCalled();
    expect(cacheTag).not.toHaveBeenCalled();
  });
});
